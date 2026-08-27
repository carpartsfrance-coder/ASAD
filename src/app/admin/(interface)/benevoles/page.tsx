import type { Metadata } from "next";
import { CarteAdmin, EnTetePageAdmin, type TonStatut } from "@/components/admin/primitives";
import { CarteDossier } from "@/components/admin/CarteDossier";
import { majBenevole } from "@/app/actions/dossiers";
import { exigerCapacite } from "@/lib/auth/garde";
import { tousLesBenevoles } from "@/lib/donnees/candidatures";

export const metadata: Metadata = { title: "Bénévoles" };
export const dynamic = "force-dynamic";

const TON: Record<string, TonStatut> = {
  nouvelle: "info",
  a_etudier: "attente",
  active: "succes",
  refusee: "alerte",
  archivee: "neutre",
};

const OPTIONS = [
  { valeur: "nouvelle", label: "Nouvelle" },
  { valeur: "a_etudier", label: "À étudier" },
  { valeur: "active", label: "Active" },
  { valeur: "refusee", label: "Refusée" },
  { valeur: "archivee", label: "Archivée" },
];

const LIBELLE: Record<string, string> = Object.fromEntries(
  OPTIONS.map((o) => [o.valeur, o.label]),
);

/** Libellés lisibles des réponses du formulaire public. */
const CHAMPS: Record<string, string> = {
  missions: "Missions souhaitées",
  disponibilites: "Disponibilités",
  vehicule: "Véhicule",
  message: "Message",
};

export default async function Page() {
  await exigerCapacite("benevoles:lire", "Bénévoles");

  const dossiers = await tousLesBenevoles();

  return (
    <>
      <EnTetePageAdmin
        titre="Bénévoles"
        sousTitre={
          dossiers.length === 0
            ? "Aucune candidature pour l’instant."
            : `${dossiers.length} candidature${dossiers.length > 1 ? "s" : ""} reçue${dossiers.length > 1 ? "s" : ""}.`
        }
      />

      {dossiers.length === 0 ? (
        <CarteAdmin className="mt-6 p-10 text-center">
          <p className="text-body text-mut">
            Les candidatures bénévoles apparaîtront ici.
          </p>
        </CarteAdmin>
      ) : (
        <ul className="mt-6 space-y-4">
          {dossiers.map((dossier) => (
            <li key={dossier.id}>
              <CarteDossier
                titre={`${dossier.prenom} ${dossier.nom}`}
                date={dossier.creeLe.toISOString().slice(0, 10)}
                email={dossier.email}
                telephone={dossier.telephone}
                commune={dossier.commune}
                statut={dossier.statut}
                statutLabel={LIBELLE[dossier.statut] ?? dossier.statut}
                ton={TON[dossier.statut] ?? "neutre"}
                options={OPTIONS}
                action={majBenevole}
                champsCaches={{ id: dossier.id }}
                details={Object.entries(CHAMPS)
                  .filter(([cle]) => dossier.reponses[cle])
                  .map(([cle, libelle]) => ({
                    libelle,
                    valeur: Array.isArray(dossier.reponses[cle])
                      ? (dossier.reponses[cle] as string[]).join(", ")
                      : String(dossier.reponses[cle]),
                  }))}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
