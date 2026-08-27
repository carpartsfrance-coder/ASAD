import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { CarteAdmin, EnTetePageAdmin, PiluleStatut, type TonStatut } from "@/components/admin/primitives";
import { CarteDossier } from "@/components/admin/CarteDossier";
import { majSignalement } from "@/app/actions/dossiers";
import { exigerCapacite } from "@/lib/auth/garde";
import { tousLesSignalements } from "@/lib/donnees/candidatures";

export const metadata: Metadata = { title: "Signalements" };
export const dynamic = "force-dynamic";

const TON: Record<string, TonStatut> = {
  nouveau: "info",
  a_verifier: "attente",
  en_cours: "attente",
  intervention_prevue: "attente",
  pris_en_charge: "succes",
  transmis: "neutre",
  sans_suite: "neutre",
  cloture: "neutre",
};

const OPTIONS = [
  { valeur: "nouveau", label: "Nouveau" },
  { valeur: "a_verifier", label: "À vérifier" },
  { valeur: "en_cours", label: "En cours" },
  { valeur: "intervention_prevue", label: "Intervention prévue" },
  { valeur: "pris_en_charge", label: "Pris en charge" },
  { valeur: "transmis", label: "Transmis à un tiers" },
  { valeur: "sans_suite", label: "Classé sans suite" },
  { valeur: "cloture", label: "Clôturé" },
];

const LIBELLE = Object.fromEntries(OPTIONS.map((o) => [o.valeur, o.label]));

const TON_PRIORITE: Record<string, TonStatut> = {
  haute: "alerte",
  moyenne: "attente",
  basse: "neutre",
};

const LIBELLE_PRIORITE: Record<string, string> = {
  haute: "Priorité haute",
  moyenne: "Priorité moyenne",
  basse: "Priorité basse",
};

const ESPECES: Record<string, string> = {
  chien: "Chien",
  chat: "Chat",
  autre: "Autre ou inconnu",
};

const ETATS: Record<string, string> = {
  blesse: "Blessé",
  affaibli: "Affaibli ou amaigri",
  errant: "Errant, apparemment en bonne santé",
  maltraitance: "Maltraitance suspectée",
  portee: "Portée ou animal très jeune",
};

export default async function PageSignalements() {
  await exigerCapacite("signalements:lire", "Signalements");

  const signalements = await tousLesSignalements();
  /* Les priorités hautes d'abord : ce sont celles qui n'attendent pas. */
  const ordre = { haute: 0, moyenne: 1, basse: 2 } as const;
  const tries = [...signalements].sort((a, b) => ordre[a.priorite] - ordre[b.priorite]);

  return (
    <>
      <EnTetePageAdmin
        titre="Signalements"
        sousTitre={
          signalements.length === 0
            ? "Aucun signalement pour l’instant."
            : `${signalements.length} signalement${signalements.length > 1 ? "s" : ""}, les plus urgents en premier.`
        }
      />

      {signalements.length === 0 ? (
        <CarteAdmin className="mt-6 p-10 text-center">
          <p className="text-body text-mut">
            Les signalements envoyés depuis le site apparaîtront ici, classés par
            priorité.
          </p>
        </CarteAdmin>
      ) : (
        <ul className="mt-6 space-y-4">
          {tries.map((signalement) => (
            <li key={signalement.id}>
              <div className="mb-2 flex items-center gap-2">
                <TriangleAlert
                  size={15}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className={signalement.priorite === "haute" ? "text-erreur" : "text-mut"}
                />
                <PiluleStatut ton={TON_PRIORITE[signalement.priorite]}>
                  {LIBELLE_PRIORITE[signalement.priorite]}
                </PiluleStatut>
              </div>

              <CarteDossier
                titre={`${ESPECES[signalement.espece] ?? signalement.espece} — ${signalement.lieu}`}
                sousTitre={`Signalé par ${signalement.declarantNom}`}
                date={signalement.creeLe.toISOString().slice(0, 10)}
                email={signalement.declarantEmail}
                telephone={signalement.declarantTelephone}
                statut={signalement.statut}
                statutLabel={LIBELLE[signalement.statut] ?? signalement.statut}
                ton={TON[signalement.statut] ?? "neutre"}
                options={OPTIONS}
                action={majSignalement}
                champsCaches={{ id: signalement.id }}
                details={[
                  { libelle: "État apparent", valeur: ETATS[signalement.etatApparent] ?? signalement.etatApparent },
                  { libelle: "Lieu", valeur: signalement.lieu },
                  { libelle: "Situation", valeur: signalement.situation },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
