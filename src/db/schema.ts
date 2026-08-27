import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Schéma de la base ASAD.
 *
 * Tout le contenu du site vit ici : plus rien n'est stocké dans des fichiers.
 * Les libellés d'énumération reprennent exactement ceux du modèle métier
 * (`src/types`), pour qu'aucune traduction ne soit nécessaire entre les deux.
 */

/** Colonne binaire PostgreSQL — Drizzle ne la fournit pas en standard. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/* ------------------------------------------------------------------ */
/* Énumérations                                                        */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", ["admin", "editeur", "benevole"]);

export const especeEnum = pgEnum("espece", ["chien", "chat", "autre"]);
export const sexeEnum = pgEnum("sexe", ["male", "femelle"]);
export const tailleEnum = pgEnum("taille", ["petit", "moyen", "grand"]);
export const statutAnimalEnum = pgEnum("statut_animal", [
  "brouillon",
  "a_adopter",
  "urgent",
  "reserve",
  "adopte",
]);
export const compatEnum = pgEnum("compat", [
  "oui",
  "non",
  "a_tester",
  "avec_conditions",
]);

export const statutCampagneEnum = pgEnum("statut_campagne", ["active", "terminee"]);

export const categorieActualiteEnum = pgEnum("categorie_actualite", [
  "sauvetage",
  "evenement",
  "association",
  "appel",
]);

export const statutMessageEnum = pgEnum("statut_message", [
  "en_attente",
  "publie",
  "refuse",
  "indesirable",
  "archive",
]);

export const statutDemandeEnum = pgEnum("statut_demande", [
  "nouvelle",
  "a_contacter",
  "entretien_prevu",
  "visite_prevue",
  "acceptee",
  "refusee",
  "classee",
  "archivee",
]);

export const statutCandidatureEnum = pgEnum("statut_candidature", [
  "nouvelle",
  "a_etudier",
  "active",
  "refusee",
  "archivee",
]);

export const prioriteEnum = pgEnum("priorite", ["haute", "moyenne", "basse"]);

export const statutSignalementEnum = pgEnum("statut_signalement", [
  "nouveau",
  "a_verifier",
  "en_cours",
  "intervention_prevue",
  "pris_en_charge",
  "transmis",
  "sans_suite",
  "cloture",
]);

/* ------------------------------------------------------------------ */
/* Comptes                                                             */
/* ------------------------------------------------------------------ */

export const utilisateurs = pgTable(
  "utilisateurs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nom: text("nom").notNull(),
    email: text("email").notNull(),
    motDePasseHash: text("mot_de_passe_hash").notNull(),
    role: roleEnum("role").notNull().default("benevole"),
    actif: boolean("actif").notNull().default(true),
    derniereConnexion: timestamp("derniere_connexion", { withTimezone: true }),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("utilisateurs_email_unique").on(table.email)],
);

/* ------------------------------------------------------------------ */
/* Animaux                                                             */
/* ------------------------------------------------------------------ */

export const animaux = pgTable(
  "animaux",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    nom: text("nom").notNull(),

    /* Mentions du code rural, art. L.214-8-1 */
    espece: especeEnum("espece").notNull(),
    especeAutre: text("espece_autre"),
    sexe: sexeEnum("sexe").notNull(),
    /** `null` signifie explicitement « n'appartient pas à une race ». */
    race: text("race"),
    age: text("age").notNull(),
    ageMois: integer("age_mois").notNull().default(0),
    dateNaissanceEstimee: text("date_naissance_estimee"),
    identification: text("identification"),
    nombreAnimauxPortee: integer("nombre_animaux_portee"),

    /* Présentation */
    taille: tailleEnum("taille").notNull().default("moyen"),
    poidsKg: real("poids_kg"),
    commune: text("commune").notNull().default(""),
    descriptionCourte: text("description_courte").notNull().default(""),
    histoire: jsonb("histoire").$type<string[]>().notNull().default([]),
    caractere: jsonb("caractere").$type<string[]>().notNull().default([]),
    caractereNote: text("caractere_note"),

    /* Compatibilités */
    compatChiens: compatEnum("compat_chiens").notNull().default("a_tester"),
    compatChats: compatEnum("compat_chats").notNull().default("a_tester"),
    compatEnfants: compatEnum("compat_enfants").notNull().default("a_tester"),
    compatNotes: jsonb("compat_notes")
      .$type<{ chiens?: string; chats?: string; enfants?: string }>()
      .notNull()
      .default({}),

    /* Santé */
    identifie: boolean("identifie").notNull().default(false),
    vaccine: boolean("vaccine").notNull().default(false),
    sterilise: boolean("sterilise").notNull().default(false),
    santeResume: text("sante_resume"),
    traitement: text("traitement"),

    /* Adoption */
    environnement: text("environnement").notNull().default(""),
    environnementPoints: jsonb("environnement_points")
      .$type<string[]>()
      .notNull()
      .default([]),
    conditions: jsonb("conditions")
      .$type<Array<{ titre: string; texte: string }>>()
      .notNull()
      .default([]),
    fraisAdoption: integer("frais_adoption").notNull().default(0),

    /* Pilotage éditorial */
    statut: statutAnimalEnum("statut").notNull().default("brouillon"),
    afficherSurAccueil: boolean("afficher_sur_accueil").notNull().default(false),
    dateArrivee: text("date_arrivee").notNull().default(""),
    datePublication: text("date_publication").notNull().default(""),
    familleAccueil: text("famille_accueil"),

    /* Urgence — renseignée quand `statut = 'urgent'` */
    urgenceMotif: text("urgence_motif"),
    urgenceDelai: text("urgence_delai"),
    urgenceCtaLabel: text("urgence_cta_label"),

    reserveDepuis: text("reserve_depuis"),

    /* Suite d'adoption — renseignée quand `statut = 'adopte'` */
    adoptionDate: text("adoption_date"),
    adoptionFamille: text("adoption_famille"),
    adoptionRecit: text("adoption_recit"),
    adoptionCitation: text("adoption_citation"),
    adoptionPhotoUrl: text("adoption_photo_url"),
    adoptionPhotoAlt: text("adoption_photo_alt"),

    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp("modifie_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("animaux_slug_unique").on(table.slug),
    index("animaux_statut_idx").on(table.statut),
  ],
);

export const photosAnimaux = pgTable(
  "photos_animaux",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animaux.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("photos_animal_idx").on(table.animalId, table.position)],
);

/* ------------------------------------------------------------------ */
/* Campagnes d'urgence                                                 */
/* ------------------------------------------------------------------ */

export const campagnes = pgTable(
  "campagnes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    titre: text("titre").notNull(),
    animalId: uuid("animal_id").references(() => animaux.id, { onDelete: "set null" }),
    type: text("type").notNull().default(""),
    description: text("description").notNull().default(""),
    echeance: text("echeance").notNull().default(""),
    dateLimite: text("date_limite"),
    /** Montants en euros — toujours le montant réel, jamais une estimation. */
    objectif: integer("objectif").notNull().default(0),
    collecte: integer("collecte").notNull().default(0),
    lienHelloAsso: text("lien_hello_asso"),
    photoUrl: text("photo_url").notNull().default(""),
    photoAlt: text("photo_alt").notNull().default(""),
    statut: statutCampagneEnum("statut").notNull().default("active"),
    ctaLabel: text("cta_label").notNull().default("Participer"),
    remerciement: text("remerciement"),
    afficherSurAccueil: boolean("afficher_sur_accueil").notNull().default(false),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("campagnes_slug_unique").on(table.slug)],
);

export const misesAJourCampagne = pgTable("mises_a_jour_campagne", {
  id: uuid("id").defaultRandom().primaryKey(),
  campagneId: uuid("campagne_id")
    .notNull()
    .references(() => campagnes.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  texte: text("texte").notNull(),
});

/* ------------------------------------------------------------------ */
/* Actualités                                                          */
/* ------------------------------------------------------------------ */

/**
 * Rubrique « Actualités », retirée du site le 26/08/2026 à la demande de
 * l'association. La table est conservée telle quelle : la supprimer d'ici
 * ferait générer une migration qui effacerait les articles déjà écrits.
 * Plus aucun code ne la lit ni ne l'écrit.
 */
export const actualites = pgTable(
  "actualites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    titre: text("titre").notNull(),
    categorie: categorieActualiteEnum("categorie").notNull().default("association"),
    date: text("date").notNull(),
    chapo: text("chapo").notNull().default(""),
    paragraphes: jsonb("paragraphes").$type<string[]>().notNull().default([]),
    photoUrl: text("photo_url").notNull().default(""),
    photoAlt: text("photo_alt").notNull().default(""),
    afficherSurAccueil: boolean("afficher_sur_accueil").notNull().default(false),
    publie: boolean("publie").notNull().default(false),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("actualites_slug_unique").on(table.slug)],
);

/* ------------------------------------------------------------------ */
/* Livre d'or                                                          */
/* ------------------------------------------------------------------ */

export const messagesLivreOr = pgTable(
  "messages_livre_or",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nomPublic: text("nom_public").notNull(),
    /** Jamais publié : sert uniquement à répondre à la personne. */
    email: text("email").notNull().default(""),
    ville: text("ville"),
    message: text("message").notNull(),
    photoUrl: text("photo_url"),
    photoAlt: text("photo_alt"),
    animalId: uuid("animal_id").references(() => animaux.id, { onDelete: "set null" }),
    /** Conservé même si la fiche disparaît. */
    animalNom: text("animal_nom"),
    reponsePublique: text("reponse_publique"),
    /** Aucun message n'est publié sans validation humaine. */
    statut: statutMessageEnum("statut").notNull().default("en_attente"),
    moderePar: uuid("modere_par").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    modereLe: timestamp("modere_le", { withTimezone: true }),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("livre_or_statut_idx").on(table.statut)],
);

/* ------------------------------------------------------------------ */
/* Demandes et candidatures                                            */
/* ------------------------------------------------------------------ */

export const demandesAdoption = pgTable(
  "demandes_adoption",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull(),
    animalId: uuid("animal_id").references(() => animaux.id, { onDelete: "set null" }),
    animalNom: text("animal_nom").notNull().default(""),
    prenom: text("prenom").notNull(),
    nom: text("nom").notNull(),
    email: text("email").notNull(),
    telephone: text("telephone").notNull().default(""),
    commune: text("commune").notNull().default(""),
    codePostal: text("code_postal").notNull().default(""),
    /** Réponses complètes des quatre étapes du formulaire. */
    reponses: jsonb("reponses").$type<Record<string, string>>().notNull().default({}),
    statut: statutDemandeEnum("statut").notNull().default("nouvelle"),
    responsableId: uuid("responsable_id").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    notesInternes: text("notes_internes"),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("demandes_reference_unique").on(table.reference),
    index("demandes_statut_idx").on(table.statut),
  ],
);

export const famillesAccueil = pgTable("familles_accueil", {
  id: uuid("id").defaultRandom().primaryKey(),
  prenom: text("prenom").notNull(),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  telephone: text("telephone").notNull().default(""),
  commune: text("commune").notNull().default(""),
  reponses: jsonb("reponses").$type<Record<string, string | string[]>>().notNull().default({}),
  statut: statutCandidatureEnum("statut").notNull().default("nouvelle"),
  notesInternes: text("notes_internes"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const benevoles = pgTable("benevoles", {
  id: uuid("id").defaultRandom().primaryKey(),
  prenom: text("prenom").notNull(),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  telephone: text("telephone").notNull().default(""),
  commune: text("commune").notNull().default(""),
  reponses: jsonb("reponses").$type<Record<string, string | string[]>>().notNull().default({}),
  statut: statutCandidatureEnum("statut").notNull().default("nouvelle"),
  notesInternes: text("notes_internes"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const signalements = pgTable(
  "signalements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    priorite: prioriteEnum("priorite").notNull().default("moyenne"),
    espece: text("espece").notNull().default(""),
    etatApparent: text("etat_apparent").notNull().default(""),
    lieu: text("lieu").notNull().default(""),
    situation: text("situation").notNull().default(""),
    declarantNom: text("declarant_nom").notNull().default(""),
    declarantEmail: text("declarant_email").notNull().default(""),
    declarantTelephone: text("declarant_telephone").notNull().default(""),
    statut: statutSignalementEnum("statut").notNull().default("nouveau"),
    assigneA: uuid("assigne_a").references(() => utilisateurs.id, {
      onDelete: "set null",
    }),
    notesInternes: text("notes_internes"),
    creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("signalements_statut_idx").on(table.statut)],
);

/* ------------------------------------------------------------------ */
/* Médias, contenu et paramètres                                       */
/* ------------------------------------------------------------------ */

/**
 * Photothèque.
 *
 * Une image peut venir de deux sources :
 *  - un fichier téléversé, stocké **en binaire dans la base** (`donnees`) ;
 *  - une adresse externe ou un fichier du projet (`url`).
 *
 * Le binaire en base est le seul moyen de garantir que les photos survivent en
 * ligne : les hébergements modernes n'ont pas de disque persistant, un fichier
 * écrit sur le serveur disparaît au premier redéploiement.
 *
 * Les images sont redimensionnées et compressées dans le navigateur avant
 * l'envoi, ce qui garde la base légère — environ 200 Ko par photo.
 */
export const medias = pgTable("medias", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Renseignée pour une image qui n'est pas stockée en base. */
  url: text("url"),
  /** Contenu binaire, pour une image téléversée. */
  donnees: bytea("donnees"),
  nomFichier: text("nom_fichier").notNull().default(""),
  typeMime: text("type_mime").notNull().default("image/jpeg"),
  largeur: integer("largeur"),
  hauteur: integer("hauteur"),
  alt: text("alt").notNull().default(""),
  legende: text("legende"),
  /** Taille en octets. */
  taille: integer("taille").notNull().default(0),
  televersePar: uuid("televerse_par").references(() => utilisateurs.id, {
    onDelete: "set null",
  }),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Textes et réglages modifiables depuis le back-office.
 * Une ligne par clé, la valeur est libre (texte, nombre, objet).
 */
export const contenuSite = pgTable(
  "contenu_site",
  {
    cle: text("cle").primaryKey(),
    rubrique: text("rubrique").notNull().default("general"),
    libelle: text("libelle").notNull().default(""),
    valeur: jsonb("valeur").$type<unknown>().notNull(),
    modifieLe: timestamp("modifie_le", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contenu_rubrique_idx").on(table.rubrique)],
);

/* ------------------------------------------------------------------ */
/* Journal d'activité                                                  */
/* ------------------------------------------------------------------ */

export const journalActivite = pgTable("journal_activite", {
  id: uuid("id").defaultRandom().primaryKey(),
  auteurId: uuid("auteur_id").references(() => utilisateurs.id, {
    onDelete: "set null",
  }),
  auteurNom: text("auteur_nom").notNull().default(""),
  texte: text("texte").notNull(),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});
