"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, ImagePlus } from "lucide-react";
import { televerserImage } from "@/app/actions/medias";
import { preparerImage } from "@/lib/image-navigateur";
import { ChampAdmin, TexteAdmin } from "./ChampsAdmin";

export interface ValeurPhoto {
  src: string;
  alt: string;
  [autre: string]: unknown;
}

/**
 * Sélecteur d'une photo du site.
 *
 * La valeur enregistrée reste le même objet JSON qu'avant — il voyage dans un
 * champ caché, l'action serveur n'a pas changé. Ce qui change, c'est ce que
 * voit la bénévole : sa photo, un bouton pour la remplacer, et la description
 * lue par les malvoyants. Plus de JSON à modifier « avec précaution ».
 */
export function ChampPhoto({
  cle,
  libelle,
  valeur,
  aide,
}: {
  cle: string;
  libelle: string;
  valeur: ValeurPhoto;
  aide?: string;
}) {
  const [src, setSrc] = useState(valeur.src ?? "");
  const [alt, setAlt] = useState(valeur.alt ?? "");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const fichierRef = useRef<HTMLInputElement>(null);

  /* La valeur transmise garde la forme d'origine : seules src et alt bougent. */
  const valeurJson = JSON.stringify({ ...valeur, src, alt }, null, 2);

  function choisir(fichier: File) {
    setErreur(null);
    demarrer(async () => {
      try {
        const { blob, largeur, hauteur } = await preparerImage(fichier);
        const data = new FormData();
        data.set("fichier", new File([blob], fichier.name, { type: "image/jpeg" }));
        data.set("largeur", String(largeur));
        data.set("hauteur", String(hauteur));
        data.set("alt", alt);

        const resultat = await televerserImage(data);
        if (resultat.ok && resultat.url) {
          setSrc(resultat.url);
        } else {
          setErreur(resultat.erreur ?? "L’envoi a échoué.");
        }
      } catch {
        setErreur("Cette image n’a pas pu être préparée. Essayez-en une autre.");
      }
    });
  }

  return (
    <ChampAdmin id={`${cle}-alt`} label={libelle} aide={aide}>
      <input type="hidden" name={cle} value={valeurJson} readOnly />

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-[104px] shrink-0 overflow-hidden rounded-media border border-line bg-subtil">
          {src ? (
            /* Photo de travail : `next/image` n'apporte rien ici et refuserait
               les adresses servies depuis la base. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-tiny text-mut">
              Aucune
            </span>
          )}
        </div>

        <div className="min-w-[220px] flex-1">
          <button
            type="button"
            onClick={() => fichierRef.current?.click()}
            disabled={enCours}
            className="inline-flex h-11 items-center gap-2.5 rounded-btn border-[1.4px] border-line bg-white px-4 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri disabled:opacity-60"
          >
            <ImagePlus size={17} strokeWidth={1.9} aria-hidden="true" />
            {enCours ? "Envoi…" : src ? "Remplacer la photo" : "Choisir une photo"}
          </button>

          <input
            ref={fichierRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const fichier = e.target.files?.[0];
              if (fichier) choisir(fichier);
              e.target.value = "";
            }}
          />

          <div className="mt-3">
            <label
              htmlFor={`${cle}-alt`}
              className="block text-mini font-semibold text-ink"
            >
              Description de la photo
            </label>
            <p className="mt-0.5 text-tiny text-mut">
              Ce que montre l’image, en une phrase. Lu à voix haute aux
              personnes malvoyantes.
            </p>
            <TexteAdmin
              id={`${cle}-alt`}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {erreur && (
            <p role="alert" className="mt-2 flex items-start gap-2 text-tiny text-erreur">
              <CircleAlert size={14} strokeWidth={2.2} aria-hidden="true" className="mt-px shrink-0" />
              {erreur}
            </p>
          )}
        </div>
      </div>
    </ChampAdmin>
  );
}
