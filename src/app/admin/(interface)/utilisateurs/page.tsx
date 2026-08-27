import type { Metadata } from "next";
import { CarteAdmin, EnTetePageAdmin, PiluleStatut } from "@/components/admin/primitives";
import { FormulaireUtilisateur } from "@/components/admin/FormulaireUtilisateur";
import { basculerActivation, effacerUtilisateur } from "@/app/actions/utilisateurs";
import { exigerCapacite, lireSession } from "@/lib/auth/garde";
import { chargerUtilisateurs } from "@/lib/auth/utilisateurs";
import { libelleRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Utilisateurs" };
export const dynamic = "force-dynamic";

export default async function PageUtilisateurs() {
  await exigerCapacite("utilisateurs:gerer", "Utilisateurs");

  const [comptes, session] = await Promise.all([chargerUtilisateurs(), lireSession()]);

  return (
    <>
      <EnTetePageAdmin
        titre="Utilisateurs"
        sousTitre={`${comptes.length} compte${comptes.length > 1 ? "s" : ""}. Chacun ne voit que les rubriques que son accès autorise.`}
      />

      <CarteAdmin className="mt-6 overflow-hidden">
        <ul>
          {comptes.map((compte) => {
            const soiMeme = session?.sub === compte.id;
            return (
              <li
                key={compte.id}
                className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3.5 first:border-t-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">
                    {compte.nom}
                    {soiMeme && <span className="ml-2 text-tiny font-normal text-mut">(vous)</span>}
                  </p>
                  <p className="truncate text-tiny text-mut">
                    {compte.email}
                    {compte.derniereConnexion && (
                      <> · dernière connexion le {formatDate(compte.derniereConnexion.slice(0, 10))}</>
                    )}
                  </p>
                </div>

                <PiluleStatut ton={compte.role === "admin" ? "info" : "neutre"}>
                  {libelleRole[compte.role]}
                </PiluleStatut>

                <PiluleStatut ton={compte.actif ? "succes" : "neutre"}>
                  {compte.actif ? "Actif" : "Désactivé"}
                </PiluleStatut>

                {!soiMeme && (
                  <div className="flex gap-2">
                    <form action={basculerActivation}>
                      <input type="hidden" name="id" value={compte.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-btn border-[1.4px] border-line bg-white px-3 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
                      >
                        {compte.actif ? "Désactiver" : "Réactiver"}
                      </button>
                    </form>
                    <form action={effacerUtilisateur}>
                      <input type="hidden" name="id" value={compte.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-btn border-[1.4px] border-erreur/40 bg-white px-3 text-meta font-semibold text-erreur transition-colors duration-150 hover:bg-alerte"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CarteAdmin>

      <div className="mt-6 max-w-[640px]">
        <FormulaireUtilisateur />
      </div>
    </>
  );
}
