import type { RoleUtilisateur } from "@/types";

/**
 * Rôles et permissions du back-office.
 *
 * Trois rôles, conformément au handoff :
 *  - `admin`    : accès complet, y compris les utilisateurs et les paramètres ;
 *  - `editeur`  : gère le contenu, mais ni les comptes ni la configuration ;
 *  - `benevole` : consulte uniquement les dossiers qui lui sont attribués.
 */

/**
 * Libellés affichés dans le back-office.
 *
 * On décrit ce que le rôle permet plutôt qu'un titre de fonction : « Animaux et
 * livre d'or » se comprend sans explication, contrairement à « Éditeur ». Ces
 * libellés sont neutres, ils ne présument rien de la personne.
 */
export const libelleRole: Record<RoleUtilisateur, string> = {
  admin: "Accès complet",
  editeur: "Animaux et livre d’or",
  benevole: "Consultation",
};

/** Phrase d'aide affichée sur le tableau de bord. */
export const resumeRole: Record<RoleUtilisateur, string> = {
  admin: "Vous avez accès à toutes les rubriques du site.",
  editeur:
    "Vous gérez les fiches des animaux et les messages du livre d’or.",
  benevole:
    "Vous consultez les dossiers qui vous sont attribués.",
};

export type Capacite =
  | "animaux:lire"
  | "animaux:ecrire"
  | "demandes:lire"
  | "demandes:ecrire"
  | "familles:lire"
  | "familles:ecrire"
  | "benevoles:lire"
  | "benevoles:ecrire"
  | "signalements:lire"
  | "signalements:ecrire"
  | "urgences:lire"
  | "urgences:ecrire"
  | "livre-or:lire"
  | "livre-or:moderer"
  | "medias:lire"
  | "medias:ecrire"
  | "contenu:ecrire"
  | "parametres:ecrire"
  | "utilisateurs:gerer";

/**
 * Périmètre volontairement étroit : ajouter et modifier des fiches animaux,
 * et relire les messages du livre d'or. Rien d'autre — moins il y a de
 * rubriques à l'écran, plus l'outil reste simple à prendre en main.
 *
 * Les photos s'ajoutent depuis l'éditeur de fiche : `medias:ecrire` n'est pas
 * nécessaire pour cela, et éviter la rubrique « Médias » allège la navigation.
 */
const CAPACITES_EDITEUR: Capacite[] = [
  "animaux:lire",
  "animaux:ecrire",
  "livre-or:lire",
  "livre-or:moderer",
];

const CAPACITES_BENEVOLE: Capacite[] = [
  "animaux:lire",
  "demandes:lire",
  "signalements:lire",
  "signalements:ecrire",
  "urgences:lire",
  "medias:lire",
];

const CAPACITES: Record<RoleUtilisateur, readonly Capacite[]> = {
  admin: [
    "animaux:lire",
    "animaux:ecrire",
    "demandes:lire",
    "demandes:ecrire",
    "familles:lire",
    "familles:ecrire",
    "benevoles:lire",
    "benevoles:ecrire",
    "signalements:lire",
    "signalements:ecrire",
    "urgences:lire",
    "urgences:ecrire",
    "livre-or:lire",
    "livre-or:moderer",
    "medias:lire",
    "medias:ecrire",
    "contenu:ecrire",
    "parametres:ecrire",
    "utilisateurs:gerer",
  ],
  editeur: CAPACITES_EDITEUR,
  benevole: CAPACITES_BENEVOLE,
};

/** Le rôle dispose-t-il de cette capacité ? */
export function peut(role: RoleUtilisateur, capacite: Capacite): boolean {
  return CAPACITES[role].includes(capacite);
}

/**
 * Un bénévole ne consulte que les dossiers qui lui sont attribués.
 * Règle de gestion imposée par le handoff.
 */
export function voitTousLesDossiers(role: RoleUtilisateur): boolean {
  return role !== "benevole";
}

/** Capacité minimale requise pour ouvrir chaque rubrique du back-office. */
export const CAPACITE_PAR_RUBRIQUE: Record<string, Capacite> = {
  "/admin/animaux": "animaux:lire",
  "/admin/demandes": "demandes:lire",
  "/admin/familles": "familles:lire",
  "/admin/benevoles": "benevoles:lire",
  "/admin/signalements": "signalements:lire",
  "/admin/urgences": "urgences:lire",
  "/admin/livre-or": "livre-or:lire",
  "/admin/medias": "medias:lire",
  "/admin/contenu": "contenu:ecrire",
  "/admin/parametres": "parametres:ecrire",
  "/admin/utilisateurs": "utilisateurs:gerer",
};

/** Le rôle a-t-il accès à cette rubrique ? Le tableau de bord est ouvert à tous. */
export function accedeALaRubrique(role: RoleUtilisateur, href: string): boolean {
  const capacite = CAPACITE_PAR_RUBRIQUE[href];
  return capacite ? peut(role, capacite) : true;
}
