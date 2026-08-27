"use client";

import { useCallback, useId, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { televerserImage } from "@/app/actions/medias";
import { cn } from "@/lib/cn";

/** Même forme que le type métier `Photo` : aucune conversion nécessaire. */
export interface PhotoEditee {
  src: string;
  alt: string;
}

/** Dimension maximale conservée : au-delà, rien ne se voit à l'écran. */
const DIMENSION_MAX = 1600;
const QUALITE = 0.82;

/**
 * Redimensionne et compresse l'image dans le navigateur.
 *
 * Une photo de téléphone fait souvent 5 Mo ; après ce passage elle en fait
 * environ 200 Ko, sans différence visible. L'envoi est plus rapide et la base
 * reste légère.
 */
async function preparerImage(
  fichier: File,
): Promise<{ blob: Blob; largeur: number; hauteur: number }> {
  // `from-image` applique l'orientation EXIF : les photos prises à la
  // verticale ne se retrouvent pas couchées.
  const bitmap = await createImageBitmap(fichier, { imageOrientation: "from-image" });

  const echelle = Math.min(1, DIMENSION_MAX / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;

  const contexte = toile.getContext("2d");
  if (!contexte) throw new Error("Impossible de préparer l’image.");

  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resoudre) =>
    toile.toBlob(resoudre, "image/jpeg", QUALITE),
  );
  if (!blob) throw new Error("Impossible de compresser l’image.");

  return { blob, largeur, hauteur };
}

function poidsLisible(octets: number): string {
  return octets > 1024 * 1024
    ? `${(octets / (1024 * 1024)).toFixed(1)} Mo`
    : `${Math.round(octets / 1024)} Ko`;
}

/**
 * Zone de dépôt des photos.
 *
 * Les photos sont envoyées en base dès le dépôt ; le formulaire ne transporte
 * que leurs adresses, dans deux champs cachés que l'action serveur lit déjà.
 */
export function TeleverseurPhotos({
  photosInitiales,
  nomChampUrls = "galerie",
  nomChampAlts = "galerieAlt",
  legende = "Glissez vos photos ici",
  erreur,
}: {
  photosInitiales?: PhotoEditee[];
  nomChampUrls?: string;
  nomChampAlts?: string;
  legende?: string;
  erreur?: string;
}) {
  const [photos, setPhotos] = useState<PhotoEditee[]>(photosInitiales ?? []);
  const [survol, setSurvol] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [enCours, demarrer] = useTransition();
  const entreeRef = useRef<HTMLInputElement>(null);
  const idZone = useId();

  const ajouter = useCallback((fichiers: FileList | File[]) => {
    const liste = Array.from(fichiers).filter((f) => f.type.startsWith("image/"));
    if (liste.length === 0) {
      setMessages(["Ce fichier n’est pas une image."]);
      return;
    }
    setMessages([]);

    demarrer(async () => {
      const erreurs: string[] = [];

      for (const fichier of liste) {
        try {
          const { blob, largeur, hauteur } = await preparerImage(fichier);

          const data = new FormData();
          data.set(
            "fichier",
            new File([blob], fichier.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            }),
          );
          data.set("largeur", String(largeur));
          data.set("hauteur", String(hauteur));

          const resultat = await televerserImage(data);

          if (resultat.ok && resultat.url) {
            setPhotos((liste) => [...liste, { src: resultat.url!, alt: "" }]);
          } else {
            erreurs.push(`${fichier.name} : ${resultat.erreur ?? "envoi impossible"}`);
          }
        } catch {
          erreurs.push(`${fichier.name} : image illisible.`);
        }
      }

      if (erreurs.length > 0) setMessages(erreurs);
    });
  }, []);

  function deplacer(index: number, direction: -1 | 1) {
    setPhotos((liste) => {
      const cible = index + direction;
      if (cible < 0 || cible >= liste.length) return liste;
      const copie = [...liste];
      [copie[index], copie[cible]] = [copie[cible], copie[index]];
      return copie;
    });
  }

  function retirer(index: number) {
    setPhotos((liste) => liste.filter((_, i) => i !== index));
  }

  function modifierAlt(index: number, alt: string) {
    setPhotos((liste) => liste.map((p, i) => (i === index ? { ...p, alt } : p)));
  }

  return (
    <div>
      {/* Le formulaire ne transporte que les adresses. */}
      <input type="hidden" name={nomChampUrls} value={photos.map((p) => p.src).join("\n")} />
      <input type="hidden" name={nomChampAlts} value={photos.map((p) => p.alt).join("\n")} />

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          if (e.dataTransfer.files.length > 0) ajouter(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-media border-[1.6px] border-dashed p-8 text-center transition-colors duration-150",
          survol ? "border-acc bg-acc-soft" : "border-line bg-subtil",
        )}
      >
        {enCours ? (
          <Loader2
            size={30}
            strokeWidth={1.7}
            aria-hidden="true"
            className="mx-auto animate-spin text-acc"
          />
        ) : (
          <ImagePlus size={30} strokeWidth={1.6} aria-hidden="true" className="mx-auto text-mut" />
        )}

        <p className="mt-3 text-body font-semibold text-ink">
          {enCours ? "Envoi en cours…" : legende}
        </p>
        <p className="mt-1 text-tiny leading-[1.6] text-mut">
          ou choisissez-les sur votre ordinateur. Vous pouvez en déposer plusieurs
          à la fois — elles sont réduites automatiquement.
        </p>

        <button
          type="button"
          onClick={() => entreeRef.current?.click()}
          disabled={enCours}
          className="mt-4 inline-flex h-10 items-center rounded-btn border-[1.4px] border-line bg-white px-4 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri disabled:opacity-60"
        >
          Choisir des photos
        </button>

        <input
          ref={entreeRef}
          id={idZone}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) ajouter(e.target.files);
            e.target.value = "";
          }}
        />
        <label htmlFor={idZone} className="sr-only">
          Ajouter des photos
        </label>
      </div>

      {(messages.length > 0 || erreur) && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-[10px] border border-erreur bg-alerte px-3.5 py-3"
        >
          <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-erreur" />
          <div className="text-tiny text-alerte-ink">
            {erreur && <p>{erreur}</p>}
            {messages.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        </div>
      )}

      {/* Photos déposées */}
      {photos.length > 0 && (
        <ul className="mt-4 space-y-3">
          {photos.map((photo, index) => (
            <li
              key={`${photo.src}-${index}`}
              className="flex flex-wrap items-start gap-4 rounded-media border border-line bg-white p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                className="size-20 shrink-0 rounded-btn bg-soft object-cover"
              />

              <div className="min-w-[200px] flex-1">
                <label
                  htmlFor={`${idZone}-alt-${index}`}
                  className="block text-tiny font-semibold text-ink"
                >
                  {index === 0 ? "Photo principale — description" : `Photo ${index + 1} — description`}
                </label>
                <p className="mt-0.5 text-micro text-mut">
                  Décrivez ce qu’on voit : cela sert aux personnes qui n’voient pas
                  l’image.
                </p>
                <input
                  id={`${idZone}-alt-${index}`}
                  value={photo.alt}
                  onChange={(e) => modifierAlt(index, e.target.value)}
                  placeholder="Oslo, chien fauve assis dans l’herbe"
                  className="mt-2 h-10 w-full rounded-btn border-[1.4px] border-line bg-white px-3 text-meta text-ink transition-colors duration-150 placeholder:text-mut/60 focus:border-acc focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => deplacer(index, -1)}
                  disabled={index === 0}
                  className="flex size-9 items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri disabled:opacity-35"
                >
                  <ArrowUp size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span className="sr-only">Monter cette photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(index, 1)}
                  disabled={index === photos.length - 1}
                  className="flex size-9 items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri disabled:opacity-35"
                >
                  <ArrowDown size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span className="sr-only">Descendre cette photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => retirer(index)}
                  className="flex size-9 items-center justify-center rounded-btn border border-erreur/40 bg-white text-erreur transition-colors duration-150 hover:bg-alerte"
                >
                  <Trash2 size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span className="sr-only">Retirer cette photo</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-tiny text-mut">
        {photos.length === 0
          ? "Aucune photo pour l’instant."
          : `${photos.length} photo${photos.length > 1 ? "s" : ""}. La première est celle qui s’affiche partout.`}
      </p>
    </div>
  );
}

export { poidsLisible };
