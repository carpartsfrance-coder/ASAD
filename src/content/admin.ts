import { routes } from "./site";
import type { DemandeAdoption, StatutDemande } from "@/types";

/**
 * Contenu du back-office.
 *
 * Les chiffres réels (animaux, urgences) sont calculés à partir du contenu du
 * site. Les demandes et l'activité ci-dessous sont un jeu de démonstration :
 * elles viendront du back-office une fois la base branchée.
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type CleIconeAdmin =
  | "tableau"
  | "animaux"
  | "demandes"
  | "familles"
  | "benevoles"
  | "signalements"
  | "urgences"
  | "livre-or"
  | "medias"
  | "contenu"
  | "parametres"
  | "utilisateurs";

/** Les rubriques qui affichent une pastille « à traiter ». */
export type CleCompteur =
  | "demandes"
  | "familles"
  | "benevoles"
  | "signalements"
  | "livreOr";

/** Ce qui attend une décision, rubrique par rubrique. */
export type CompteursAdmin = Record<CleCompteur, number>;

export interface EntreeAdmin {
  label: string;
  href: string;
  icone: CleIconeAdmin;
  /**
   * Compteur à afficher à droite de l'entrée. On nomme ici la clé : la valeur
   * vient de la base, jamais d'une constante — une pastille figée annoncerait
   * du travail en attente alors qu'il n'y en a plus.
   */
  compteur?: CleCompteur;
}

export const navigationAdmin: EntreeAdmin[] = [
  { label: "Tableau de bord", href: routes.admin, icone: "tableau" },
  { label: "Animaux", href: routes.adminAnimaux, icone: "animaux" },
  { label: "Demandes d’adoption", href: routes.adminDemandes, icone: "demandes", compteur: "demandes" },
  { label: "Familles d’accueil", href: routes.adminFamilles, icone: "familles", compteur: "familles" },
  { label: "Bénévoles", href: routes.adminBenevoles, icone: "benevoles", compteur: "benevoles" },
  { label: "Signalements", href: routes.adminSignalements, icone: "signalements", compteur: "signalements" },
  { label: "Urgences", href: routes.adminUrgences, icone: "urgences" },
  { label: "Livre d’or", href: routes.adminLivreOr, icone: "livre-or", compteur: "livreOr" },
  { label: "Médias", href: routes.adminMedias, icone: "medias" },
  { label: "Contenu du site", href: routes.adminContenu, icone: "contenu" },
  { label: "Paramètres", href: routes.adminParametres, icone: "parametres" },
  { label: "Utilisateurs", href: routes.adminUtilisateurs, icone: "utilisateurs" },
];

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */

/** Initiales affichées dans les pastilles. */
export function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");
}

/* ------------------------------------------------------------------ */
/* Demandes d'adoption (démonstration)                                 */
/* ------------------------------------------------------------------ */

export const libelleStatutDemande: Record<StatutDemande, string> = {
  nouvelle: "Nouvelle",
  a_contacter: "À contacter",
  entretien_prevu: "Entretien prévu",
  visite_prevue: "Visite prévue",
  acceptee: "Acceptée",
  refusee: "Refusée",
  classee: "Classée sans suite",
  archivee: "Archivée",
};

export const dernieresDemandes: DemandeAdoption[] = [
  {
    id: "dem-001", reference: "ADO-2026-0148", animalSlug: "oslo", animalNom: "Oslo",
    prenom: "Camille", nom: "Durand", email: "camille.durand@example.com",
    telephone: "06 12 34 56 78", commune: "Lunel", statut: "nouvelle",
    createdAt: "2026-08-26",
  },
  {
    id: "dem-002", reference: "ADO-2026-0147", animalSlug: "plume", animalNom: "Plume",
    prenom: "Léa", nom: "Fontaine", email: "lea.fontaine@example.com",
    telephone: "06 22 11 45 09", commune: "Montpellier", statut: "a_contacter",
    createdAt: "2026-08-25",
  },
  {
    id: "dem-003", reference: "ADO-2026-0146", animalSlug: "titan", animalNom: "Titan",
    prenom: "Marc", nom: "Belin", email: "marc.belin@example.com",
    telephone: "06 74 20 18 33", commune: "Vauvert", statut: "entretien_prevu",
    createdAt: "2026-08-24",
  },
  {
    id: "dem-004", reference: "ADO-2026-0145", animalSlug: "gribouille", animalNom: "Gribouille",
    prenom: "Sophie", nom: "Marchand", email: "sophie.marchand@example.com",
    telephone: "06 08 55 62 71", commune: "Uzès", statut: "visite_prevue",
    createdAt: "2026-08-23",
  },
  {
    id: "dem-005", reference: "ADO-2026-0144", animalSlug: "bao", animalNom: "Bao",
    prenom: "Yanis", nom: "Roux", email: "yanis.roux@example.com",
    telephone: "06 31 47 90 12", commune: "Béziers", statut: "acceptee",
    createdAt: "2026-08-21",
  },
];

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

/** Adoptions conclues par mois, janvier à août 2026. */
export const adoptionsParMois = [
  { mois: "Jan", valeur: 5 },
  { mois: "Fév", valeur: 7 },
  { mois: "Mar", valeur: 4 },
  { mois: "Avr", valeur: 9 },
  { mois: "Mai", valeur: 8 },
  { mois: "Juin", valeur: 6 },
  { mois: "Juil", valeur: 11 },
  { mois: "Août", valeur: 7 },
] as const;

export const activiteRecente = [
  { auteur: "Claire Aubert", texte: "a publié la fiche de Gribouille", horodatage: "il y a 12 min" },
  { auteur: "Marie Vidal", texte: "a assigné le signalement de Lunel à Paul", horodatage: "il y a 1 h" },
  { auteur: "Paul Nguyen", texte: "a validé un message du livre d’or", horodatage: "il y a 2 h" },
  { auteur: "Claire Aubert", texte: "a mis à jour la collecte de Rio", horodatage: "il y a 3 h" },
  { auteur: "Marie Vidal", texte: "a répondu à la demande ADO-2026-0143", horodatage: "hier" },
  { auteur: "Paul Nguyen", texte: "a ajouté 4 photos à la fiche de Java", horodatage: "hier" },
] as const;

export const raccourcisTableauBord = [
  { label: "Ajouter un animal", href: routes.adminAnimaux },
  { label: "Voir les demandes", href: routes.adminDemandes },
  { label: "Modérer le livre d’or", href: routes.adminLivreOr },
] as const;

export interface CarteAction {
  label: string;
  sousTitre: string;
  /** Valeur par défaut ; le tableau de bord la remplace par le compte réel. */
  compteur: number;
  href: string;
}

export const cartesAction: CarteAction[] = [
  { label: "Candidatures familles d’accueil", sousTitre: "En attente d’étude", compteur: 0, href: routes.adminFamilles },
  { label: "Signalements en attente", sousTitre: "À vérifier ou assigner", compteur: 0, href: routes.adminSignalements },
  { label: "Livre d’or à valider", sousTitre: "Aucun message n’est publié automatiquement", compteur: 0, href: routes.adminLivreOr },
];
