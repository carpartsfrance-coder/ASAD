/**
 * Modèle de données ASAD.
 *
 * Aligné sur le handoff « design_handoff_asad » (site public + back-office).
 * Les types sont découplés de toute source de données : aujourd'hui les objets
 * vivent dans `src/content/*.ts`, demain ils viendront d'un back-office sans
 * que les composants n'aient à changer.
 */

/* ------------------------------------------------------------------ */
/* Briques communes                                                    */
/* ------------------------------------------------------------------ */

export interface Photo {
  /** Chemin public ou URL du CDN. */
  src: string;
  /** Texte alternatif descriptif — obligatoire pour l'accessibilité. */
  alt: string;
}

/* ------------------------------------------------------------------ */
/* Animaux                                                             */
/* ------------------------------------------------------------------ */

export type Espece = "chien" | "chat" | "autre";
export type Sexe = "male" | "femelle";
export type Taille = "petit" | "moyen" | "grand";

/**
 * Cycle de vie d'une fiche animal — liste fermée, pas de saisie libre.
 * Une fiche adoptée n'est jamais supprimée : elle passe en « adopte ».
 */
export type StatutAnimal =
  | "brouillon"
  | "a_adopter"
  | "urgent"
  | "reserve"
  | "adopte";

/** Verdict de compatibilité — liste fermée. */
export type Compat = "oui" | "non" | "a_tester" | "avec_conditions";

export interface SanteAnimal {
  identifie: boolean;
  vaccine: boolean;
  sterilise: boolean;
  /** Résumé de l'état de santé. */
  resume?: string;
  /** Traitement en cours, régime, suivi particulier. */
  traitement?: string;
}

/** Informations d'urgence, présentes seulement si `statut === "urgent"`. */
export interface UrgenceAnimal {
  motif: string;
  /** Ex. « Opération sous 15 jours ». */
  delai: string;
  /** Libellé du lien d'action de la carte. Ex. « Aider Rio ». */
  ctaLabel: string;
}

/** Récit publié sur la fiche d'un animal adopté. */
export interface SuiteAdoption {
  date: string;
  famille: string;
  recit: string;
  citation?: string;
  photo?: Photo;
}

export interface Animal {
  id: string;
  slug: string;
  nom: string;

  /* --- Mentions prévues pour les offres de cession (code rural, art. L.214-8-1) --- */
  espece: Espece;
  /** Précision quand `espece === "autre"` (lapin, furet…). */
  especeAutre?: string;
  sexe: Sexe;
  /** `null` signifie explicitement « n'appartient pas à une race ». */
  race: string | null;
  /** Âge lisible affiché sur la fiche. Ex. « 3 ans ». */
  age: string;
  /** Âge en mois — sert au filtre du catalogue. */
  ageMois: number;
  /** Date de naissance estimée, au format ISO (AAAA-MM-JJ). */
  dateNaissanceEstimee?: string;
  /** Numéro d'identification (puce ou tatouage). */
  identification?: string;
  /** Nombre d'animaux de la portée, pour une cession de portée. */
  nombreAnimauxPortee?: number;

  /* --- Présentation --- */
  taille: Taille;
  poidsKg?: number;
  /** Commune d'accueil, affichée sur les cartes et la fiche. */
  commune: string;
  photoPrincipale: Photo;
  galerie: Photo[];
  descriptionCourte: string;
  /** Récit, un élément par paragraphe. */
  histoire: string[];
  caractere: string[];
  /** Paragraphe libre sous les pilules de caractère. */
  caractereNote?: string;

  /* --- Compatibilités --- */
  compatChiens: Compat;
  compatChats: Compat;
  compatEnfants: Compat;
  /** Précisions affichées à côté de chaque verdict. */
  compatNotes?: {
    chiens?: string;
    chats?: string;
    enfants?: string;
  };

  sante: SanteAnimal;

  /* --- Adoption --- */
  /** Paragraphe décrivant le foyer recherché. */
  environnement: string;
  /** Trois puces sous le paragraphe d'environnement. */
  environnementPoints: string[];
  /** Étapes numérotées de la section « Conditions d'adoption ». */
  conditions: Array<{ titre: string; texte: string }>;
  fraisAdoption: number;

  /* --- Pilotage éditorial --- */
  statut: StatutAnimal;
  /** Remonte la fiche sur la page d'accueil. */
  afficherSurAccueil: boolean;
  /** Date d'entrée à l'association (ISO). */
  dateArrivee: string;
  /** Date de mise en ligne de la fiche (ISO) — sert au tri « Plus récents ». */
  datePublication: string;
  /** Nombre de demandes reçues — back-office. */
  nbDemandes: number;
  familleAccueil?: string;

  urgence?: UrgenceAnimal;
  /** Date de mise en réservation, affichée quand `statut === "reserve"`. */
  reserveDepuis?: string;
  suiteAdoption?: SuiteAdoption;
}

/* ------------------------------------------------------------------ */
/* Campagnes d'urgence                                                 */
/* ------------------------------------------------------------------ */

export type StatutCampagne = "active" | "terminee";

export interface MiseAJourCampagne {
  date: string;
  texte: string;
}

export interface Campagne {
  id: string;
  slug: string;
  titre: string;
  /** Slug de l'animal concerné. */
  animalSlug?: string;
  /** Ex. « Chirurgie orthopédique », « Sortie de fourrière ». */
  type: string;
  description: string;
  /** Ex. « Opération sous 15 jours ». */
  echeance: string;
  /** Date limite au format ISO, quand elle existe. */
  dateLimite?: string;
  objectif: number;
  collecte: number;
  /** Lien HelloAsso dédié ; à défaut, le lien d'urgence général est utilisé. */
  lienHelloAsso?: string;
  photo: Photo;
  statut: StatutCampagne;
  /** Libellé du bouton d'action. Ex. « Aider Rio ». */
  ctaLabel: string;
  /** Remerciement affiché quand la campagne est terminée. */
  remerciement?: string;
  misesAJour: MiseAJourCampagne[];
  afficherSurAccueil: boolean;
}

/* ------------------------------------------------------------------ */
/* Éditorial                                                           */
/* ------------------------------------------------------------------ */

/**
 * Message du livre d'or.
 *
 * Règle de gestion : aucun message n'est publié sans validation humaine.
 * Ni notes en étoiles, ni commentaires publics libres.
 */
export type StatutMessageLivreOr =
  | "en_attente"
  | "publie"
  | "refuse"
  | "indesirable"
  | "archive";

export interface MessageLivreOr {
  id: string;
  nomPublic: string;
  ville?: string;
  message: string;
  photo?: Photo;
  /** Slug de l'animal concerné, s'il est encore en ligne. */
  animalSlug?: string;
  /** Nom de l'animal, conservé même si la fiche n'existe plus. */
  animalNom?: string;
  /** Date de publication au format ISO. */
  date: string;
  statut: StatutMessageLivreOr;
  /** Réponse publique de l'association, facultative. */
  reponsePublique?: string;
}

export interface Statistique {
  id: string;
  valeur: string;
  libelle: string;
  /** Clé d'icône résolue par `components/ui/StatIcon`. */
  icone: "patte" | "maison-coeur" | "coeur";
}

export interface QuestionFrequente {
  id: string;
  question: string;
  reponse: string;
  categorie: "adoption" | "famille-accueil" | "dons" | "association";
}

/* ------------------------------------------------------------------ */
/* Back-office                                                         */
/* ------------------------------------------------------------------ */

export type RoleUtilisateur = "admin" | "editeur" | "benevole";

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  actif: boolean;
  derniereConnexion?: string;
}

export type StatutDemande =
  | "nouvelle"
  | "a_contacter"
  | "entretien_prevu"
  | "visite_prevue"
  | "acceptee"
  | "refusee"
  | "classee"
  | "archivee";

export interface DemandeAdoption {
  id: string;
  reference: string;
  animalSlug: string;
  animalNom: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  commune: string;
  statut: StatutDemande;
  createdAt: string;
}
