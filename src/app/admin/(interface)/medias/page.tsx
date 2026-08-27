import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { CarteAdmin, EnTetePageAdmin } from "@/components/admin/primitives";
import { effacerMedia } from "@/app/actions/medias";
import { exigerCapacite } from "@/lib/auth/garde";
import { listerMedias, poidsPhototheque } from "@/lib/donnees/medias";
import { mediasUtilises } from "@/lib/donnees/contenu";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Médias" };
export const dynamic = "force-dynamic";

function poidsLisible(octets: number): string {
  if (octets > 1024 * 1024) return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  return `${Math.round(octets / 1024)} Ko`;
}

export default async function PageMedias() {
  await exigerCapacite("medias:lire", "Médias");

  const [televersees, utilisees, poids] = await Promise.all([
    listerMedias(),
    mediasUtilises(),
    poidsPhototheque(),
  ]);

  /* Une image téléversée est « utilisée » si son adresse apparaît quelque part. */
  const adressesUtilisees = new Set(utilisees.map((m) => m.url));
  const contexteParUrl = new Map(utilisees.map((m) => [m.url, `${m.usage} — ${m.contexte}`]));

  return (
    <>
      <EnTetePageAdmin
        titre="Médias"
        sousTitre={`${televersees.length} photo${televersees.length > 1 ? "s" : ""} déposée${televersees.length > 1 ? "s" : ""} · ${poidsLisible(poids)} en base.`}
      />

      <p className="mt-5 rounded-media border border-line bg-white p-4 text-meta leading-[1.6] text-mut">
        Les photos se déposent depuis la fiche de l’animal, l’article ou la
        collecte concernée. Elles sont stockées dans la base, réduites
        automatiquement, et restent disponibles en ligne. Cette page sert à
        retrouver une photo ou à faire le ménage.
      </p>

      {/* Photothèque */}
      <h2 className="mt-8 text-[16px] font-bold text-ink">Photos déposées</h2>
      {televersees.length === 0 ? (
        <CarteAdmin className="mt-4 p-10 text-center">
          <p className="text-body text-mut">
            Aucune photo déposée pour l’instant. Ajoutez-en depuis une fiche animal.
          </p>
        </CarteAdmin>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {televersees.map((media) => {
            const adresse = `/media/${media.id}`;
            const utilisee = adressesUtilisees.has(adresse);

            return (
              <li key={media.id}>
                <CarteAdmin className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={adresse}
                    alt={media.alt}
                    className="aspect-square w-full bg-soft object-cover"
                  />
                  <div className="p-3">
                    <p className="truncate text-tiny font-semibold text-ink">
                      {utilisee ? contexteParUrl.get(adresse) : "Non utilisée"}
                    </p>
                    <p className="text-micro text-mut">
                      {media.largeur && media.hauteur && (
                        <>
                          {media.largeur}×{media.hauteur} ·{" "}
                        </>
                      )}
                      {poidsLisible(media.taille)} · {formatDate(media.creeLe.toISOString().slice(0, 10))}
                    </p>

                    {!utilisee && (
                      <form action={effacerMedia} className="mt-2">
                        <input type="hidden" name="id" value={media.id} />
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center gap-1.5 rounded-btn border border-erreur/40 bg-white px-2.5 text-micro font-semibold text-erreur transition-colors duration-150 hover:bg-alerte"
                        >
                          <Trash2 size={13} strokeWidth={1.9} aria-hidden="true" />
                          Supprimer
                        </button>
                      </form>
                    )}
                  </div>
                </CarteAdmin>
              </li>
            );
          })}
        </ul>
      )}

      {/* Images du projet, non stockées en base */}
      <h2 className="mt-10 text-[16px] font-bold text-ink">Images fournies avec le site</h2>
      <p className="mt-1 text-tiny leading-[1.6] text-mut">
        Ce sont les visuels temporaires livrés avec le site. Remplacez-les en
        déposant une vraie photo depuis la fiche concernée.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {utilisees
          .filter((m) => !m.url.startsWith("/media/"))
          .map((media) => (
            <li key={`${media.url}-${media.usage}-${media.contexte}`}>
              <CarteAdmin className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.url} alt="" className="aspect-square w-full bg-soft object-cover" />
                <div className="p-2">
                  <p className="truncate text-micro font-semibold text-ink">{media.contexte}</p>
                  <p className="truncate text-micro text-mut">{media.usage}</p>
                </div>
              </CarteAdmin>
            </li>
          ))}
      </ul>
    </>
  );
}
