import type { Metadata } from "next";
import { CarteAdmin, EnTetePageAdmin } from "@/components/admin/primitives";
import { CarteDossier } from "@/components/admin/CarteDossier";
import { majDemande } from "@/app/actions/dossiers";
import { exigerCapacite } from "@/lib/auth/garde";
import { toutesLesDemandes } from "@/lib/donnees/demandes";
import { libelleStatutDemande } from "@/content/admin";
import { db } from "@/db";
import { demandesAdoption } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { TonStatut } from "@/components/admin/primitives";
import type { StatutDemande } from "@/types";

export const metadata: Metadata = { title: "Demandes d’adoption" };
export const dynamic = "force-dynamic";

const TON: Record<StatutDemande, TonStatut> = {
  nouvelle: "info",
  a_contacter: "attente",
  entretien_prevu: "attente",
  visite_prevue: "attente",
  acceptee: "succes",
  refusee: "alerte",
  classee: "neutre",
  archivee: "neutre",
};

const OPTIONS = (Object.keys(libelleStatutDemande) as StatutDemande[]).map((cle) => ({
  valeur: cle,
  label: libelleStatutDemande[cle],
}));

/** Libellés lisibles des réponses du formulaire en quatre étapes. */
const LIBELLES: Record<string, string> = {
  age: "Tranche d’âge",
  logement: "Type de logement",
  exterieur: "Extérieur",
  surface: "Surface",
  occupation: "Propriétaire ou locataire",
  foyer: "Composition du foyer",
  enfants: "Enfants au foyer",
  agesEnfants: "Âge des enfants",
  animauxPresents: "Animaux déjà présents",
  precisionsAnimaux: "Précisions",
  absence: "Temps d’absence",
  experience: "Expérience",
  gardeVacances: "Garde pendant les vacances",
  activite: "Activité quotidienne",
  motivation: "Motivation",
  message: "Message complémentaire",
};

export default async function PageDemandes() {
  await exigerCapacite("demandes:lire", "Demandes d’adoption");

  const [resumes, lignes] = await Promise.all([
    toutesLesDemandes(),
    db.select().from(demandesAdoption).orderBy(desc(demandesAdoption.creeLe)),
  ]);
  const parId = new Map(lignes.map((l) => [l.id, l]));

  return (
    <>
      <EnTetePageAdmin
        titre="Demandes d’adoption"
        sousTitre={
          resumes.length === 0
            ? "Aucune demande pour l’instant."
            : `${resumes.length} demande${resumes.length > 1 ? "s" : ""} reçue${resumes.length > 1 ? "s" : ""}.`
        }
      />

      {resumes.length === 0 ? (
        <CarteAdmin className="mt-6 p-10 text-center">
          <p className="text-body text-mut">
            Les demandes envoyées depuis les fiches animaux apparaîtront ici.
          </p>
        </CarteAdmin>
      ) : (
        <ul className="mt-6 space-y-4">
          {resumes.map((demande) => {
            const ligne = parId.get(demande.id);
            const reponses = ligne?.reponses ?? {};

            return (
              <li key={demande.id}>
                <CarteDossier
                  titre={`${demande.prenom} ${demande.nom}`}
                  sousTitre={`Pour ${demande.animalNom} · ${demande.reference}`}
                  date={demande.createdAt}
                  email={demande.email}
                  telephone={demande.telephone}
                  commune={`${demande.commune} ${ligne?.codePostal ?? ""}`.trim()}
                  statut={demande.statut}
                  statutLabel={libelleStatutDemande[demande.statut]}
                  ton={TON[demande.statut]}
                  options={OPTIONS}
                  action={majDemande}
                  champsCaches={{ id: demande.id, reference: demande.reference }}
                  details={Object.entries(LIBELLES)
                    .filter(([cle]) => reponses[cle])
                    .map(([cle, libelle]) => ({ libelle, valeur: String(reponses[cle]) }))}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
