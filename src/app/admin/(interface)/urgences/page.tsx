import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { BandeauConfirmation } from "@/components/admin/BandeauConfirmation";
import { CarteAdmin, EnTetePageAdmin, PiluleStatut } from "@/components/admin/primitives";
import { SmartLink } from "@/components/ui/SmartLink";
import { exigerCapacite } from "@/lib/auth/garde";
import { toutesLesCampagnes } from "@/lib/donnees/editorial";
import { formatEuros, pourcentage } from "@/lib/format";
import { routes } from "@/content/site";

export const metadata: Metadata = { title: "Urgences" };
export const dynamic = "force-dynamic";

export default async function PageAdminUrgences({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigerCapacite("urgences:lire", "Urgences");

  const params = await searchParams;
  const campagnes = await toutesLesCampagnes();
  const actives = campagnes.filter((c) => c.statut === "active");

  return (
    <>
      {params.enregistre && <BandeauConfirmation message="La collecte a bien été enregistrée." />}

      <EnTetePageAdmin
        titre="Urgences et collectes"
        sousTitre={`${actives.length} collecte${actives.length > 1 ? "s" : ""} en cours sur ${campagnes.length}.`}
        actions={
          <SmartLink
            href={`${routes.adminUrgences}/nouvelle`}
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark"
          >
            <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
            Lancer une collecte
          </SmartLink>
        }
      />

      {campagnes.length === 0 ? (
        <CarteAdmin className="mt-6 p-10 text-center">
          <p className="text-body text-mut">Aucune collecte pour l’instant.</p>
        </CarteAdmin>
      ) : (
        <ul className="mt-6 space-y-4">
          {campagnes.map((campagne) => {
            const part = pourcentage(campagne.collecte, campagne.objectif);
            return (
              <li key={campagne.id}>
                <SmartLink href={`${routes.adminUrgences}/${campagne.slug}`} className="block">
                  <CarteAdmin className="p-5 transition-colors duration-150 hover:border-acc">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-body font-bold text-ink">{campagne.titre}</p>
                        <p className="text-tiny text-mut">
                          {campagne.type} · {campagne.echeance}
                        </p>
                      </div>
                      <PiluleStatut ton={campagne.statut === "active" ? "alerte" : "succes"}>
                        {campagne.statut === "active" ? "En cours" : "Terminée"}
                      </PiluleStatut>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
                        <div
                          className={campagne.statut === "active" ? "h-full rounded-full bg-acc" : "h-full rounded-full bg-track"}
                          style={{ width: `${part}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-meta text-mut">
                        {formatEuros(campagne.collecte)} / {formatEuros(campagne.objectif)}
                      </span>
                    </div>
                  </CarteAdmin>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
