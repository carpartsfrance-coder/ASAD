import type { Metadata } from "next";
import { Plus } from "lucide-react";
import {
  CarteAdmin,
  EnTetePageAdmin,
  PiluleStatut,
  type TonStatut,
} from "@/components/admin/primitives";
import { BandeauConfirmation } from "@/components/admin/BandeauConfirmation";
import { SmartLink } from "@/components/ui/SmartLink";
import { FiltresFiches } from "@/components/admin/FiltresFiches";
import { exigerCapacite } from "@/lib/auth/garde";
import { toutesLesFiches } from "@/lib/donnees/animaux";
import { libelleStatut, sousTitreAnimal } from "@/lib/animaux";
import { routes } from "@/content/site";
import type { StatutAnimal } from "@/types";

export const metadata: Metadata = { title: "Animaux" };
export const dynamic = "force-dynamic";

export const TON_STATUT: Record<StatutAnimal, TonStatut> = {
  a_adopter: "info",
  urgent: "alerte",
  reserve: "attente",
  adopte: "neutre",
  brouillon: "neutre",
};

export default async function PageAdminAnimaux({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigerCapacite("animaux:lire", "Animaux");

  const params = await searchParams;
  const lire = (cle: string) => {
    const v = params[cle];
    return Array.isArray(v) ? v[0] : v;
  };

  const fiches = await toutesLesFiches();

  const statutFiltre = lire("statut");
  const recherche = (lire("q") ?? "").trim().toLowerCase();

  const visibles = fiches.filter((fiche) => {
    if (statutFiltre && statutFiltre !== "tous" && fiche.statut !== statutFiltre) {
      return false;
    }
    if (recherche) {
      const champs = `${fiche.nom} ${fiche.commune} ${fiche.race ?? ""}`.toLowerCase();
      if (!champs.includes(recherche)) return false;
    }
    return true;
  });

  const compte = (statut: StatutAnimal) =>
    fiches.filter((f) => f.statut === statut).length;

  return (
    <>
      {lire("enregistre") && (
        <BandeauConfirmation message="La fiche a bien été enregistrée." />
      )}
      {lire("supprime") && (
        <BandeauConfirmation message="Le brouillon a été supprimé." />
      )}

      <EnTetePageAdmin
        titre="Animaux"
        sousTitre={`${fiches.length} fiche${fiches.length > 1 ? "s" : ""} — ${compte("a_adopter")} à adopter, ${compte("brouillon")} en brouillon.`}
        actions={
          <SmartLink
            href={`${routes.adminAnimaux}/nouveau`}
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark"
          >
            <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
            Ajouter un animal
          </SmartLink>
        }
      />

      <FiltresFiches
        statutActif={statutFiltre ?? "tous"}
        recherche={recherche}
        compteurs={{
          tous: fiches.length,
          brouillon: compte("brouillon"),
          a_adopter: compte("a_adopter"),
          urgent: compte("urgent"),
          reserve: compte("reserve"),
          adopte: compte("adopte"),
        }}
      />

      <CarteAdmin className="mt-4 overflow-hidden">
        {visibles.length === 0 ? (
          <p className="px-5 py-12 text-center text-body text-mut">
            Aucune fiche ne correspond. Modifiez le filtre, ou ajoutez un animal.
          </p>
        ) : (
          <ul>
            {visibles.map((fiche) => (
              <li
                key={fiche.id}
                className="border-t border-line first:border-t-0"
              >
                <SmartLink
                  href={`${routes.adminAnimaux}/${fiche.slug}`}
                  className="flex items-center gap-3.5 px-5 py-3 transition-colors duration-150 hover:bg-subtil"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fiche.photoPrincipale.src}
                    alt=""
                    className="size-10 shrink-0 rounded-btn bg-soft object-cover"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold text-ink">
                      {fiche.nom}
                    </span>
                    <span className="block truncate text-tiny text-mut">
                      {sousTitreAnimal(fiche)} · {fiche.commune}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-tiny text-mut sm:block">
                    {fiche.datePublication}
                  </span>

                  <PiluleStatut ton={TON_STATUT[fiche.statut]}>
                    {libelleStatut[fiche.statut]}
                  </PiluleStatut>
                </SmartLink>
              </li>
            ))}
          </ul>
        )}
      </CarteAdmin>
    </>
  );
}
