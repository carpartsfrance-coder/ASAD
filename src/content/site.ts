/**
 * Configuration générale du site ASAD.
 *
 * ⚙️  TOUS LES LIENS DU SITE SONT DÉFINIS ICI.
 * Pour changer une destination (HelloAsso, réseaux sociaux, e-mail…),
 * modifier ce fichier — ou poser la variable d'environnement correspondante
 * (voir `.env.example`) sans toucher au code.
 */

/* ------------------------------------------------------------------ */
/* Identité de l'association                                           */
/* ------------------------------------------------------------------ */

export const association = {
  nom: "ASAD",
  /** ASAD est un sigle : c'est ce qu'il veut dire. */
  nomComplet: "ASAD — Association Sauvetage Animaux en Détresse",
  /** Le nom déployé seul, tel qu'il figure sous le logo. */
  signification: "Association Sauvetage Animaux en Détresse",
  baseline: "Association de protection animale 100 % bénévole — Hérault et Gard",
  description:
    "Association de protection animale 100 % bénévole. Nous recueillons les animaux abandonnés, les confions à des familles d’accueil et leur trouvons une famille pour la vie.",
  email: "Asad13@wanadoo.fr",
  telephone: "06 63 39 05 29",
  /** Format international, pour les liens `tel:`. */
  telephoneLien: "+33663390529",
  adresse: {
    voie: "10 Plage du Jai",
    codePostal: "13220",
    ville: "Châteauneuf-les-Martigues",
    pays: "France",
  },
  /**
   * Départements d'intervention — vérifié sur les fiches : les animaux sont
   * tous placés dans l'Hérault (34) et le Gard (30).
   * À ne pas déduire de l'adresse du siège, qui est déclarée dans le 13.
   */
  territoire: "Hérault et Gard",
  /** Numéro RNA (registre national des associations) — à compléter. */
  rna: "W000000000",
  /** Association loi 1901. */
  formeJuridique: "Association loi 1901",
} as const;

/** URL canonique du site — sert au sitemap et aux métadonnées Open Graph. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://asad.fr";

/* ------------------------------------------------------------------ */
/* Liens externes — HelloAsso, réseaux sociaux                         */
/* ------------------------------------------------------------------ */

/**
 * Liens HelloAsso.
 *
 * Remplacer les URL ci-dessous par les vrais formulaires de l'association,
 * ou définir les variables d'environnement `NEXT_PUBLIC_HELLOASSO_*`.
 * Le paiement n'est pas développé côté site : HelloAsso s'en charge.
 */
export const helloAsso = {
  /** Formulaire de don ponctuel ou récurrent. */
  don:
    process.env.NEXT_PUBLIC_HELLOASSO_DON ??
    "https://www.helloasso.com/associations/asad/formulaires/don",
  /** Formulaire dédié aux urgences vétérinaires. */
  urgence:
    process.env.NEXT_PUBLIC_HELLOASSO_URGENCE ??
    "https://www.helloasso.com/associations/asad/formulaires/urgence-veterinaire",
  /** Adhésion / soutien annuel. */
  adhesion:
    process.env.NEXT_PUBLIC_HELLOASSO_ADHESION ??
    "https://www.helloasso.com/associations/asad/adhesions/adhesion",
  /**
   * URL du formulaire HelloAsso à intégrer en iframe sur la page de don.
   * Laisser vide pour n'afficher que les boutons (aucun iframe rendu).
   */
  iframe: process.env.NEXT_PUBLIC_HELLOASSO_IFRAME ?? "",
  /** Page publique de l'association sur HelloAsso. */
  page:
    process.env.NEXT_PUBLIC_HELLOASSO_PAGE ??
    "https://www.helloasso.com/associations/asad",
} as const;

export const reseaux = {
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/asad",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/asad",
} as const;

/* ------------------------------------------------------------------ */
/* Routes internes                                                     */
/* ------------------------------------------------------------------ */

export const routes = {
  accueil: "/",
  animaux: "/animaux",
  animal: (slug: string) => `/animaux/${slug}`,
  adopter: (slug: string) => `/animaux/${slug}/adopter`,
  urgences: "/urgences",
  association: "/association",
  aider: "/nous-aider",
  don: "/don",
  rejoindre: "/rejoindre",
  signaler: "/signaler",
  adoptes: "/adoptes",
  livreOr: "/livre-or",
  contact: "/contact",
  mentions: "/mentions-legales",
  confidentialite: "/confidentialite",
  cookies: "/cookies",

  /* Back-office */
  admin: "/admin",
  adminConnexion: "/admin/connexion",
  adminAnimaux: "/admin/animaux",
  adminDemandes: "/admin/demandes",
  adminFamilles: "/admin/familles",
  adminBenevoles: "/admin/benevoles",
  adminSignalements: "/admin/signalements",
  adminUrgences: "/admin/urgences",
  adminLivreOr: "/admin/livre-or",
  adminMedias: "/admin/medias",
  adminContenu: "/admin/contenu",
  adminParametres: "/admin/parametres",
  adminUtilisateurs: "/admin/utilisateurs",
} as const;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface LienNav {
  label: string;
  href: string;
}

export const navigationPrincipale: LienNav[] = [
  { label: "Accueil", href: routes.accueil },
  { label: "Nos animaux", href: routes.animaux },
  { label: "L’association", href: routes.association },
  { label: "Nous aider", href: routes.aider },
  { label: "Adoptés", href: routes.adoptes },
  { label: "Livre d’or", href: routes.livreOr },
];

export const navigationPied: LienNav[] = navigationPrincipale;

export const liensInformations: LienNav[] = [
  { label: "Contact et FAQ", href: routes.contact },
  { label: "Mentions légales", href: routes.mentions },
  { label: "Confidentialité", href: routes.confidentialite },
  { label: "Cookies", href: routes.cookies },
];

/* ------------------------------------------------------------------ */
/* Boutons d'appel à l'action — libellé + destination                  */
/* ------------------------------------------------------------------ */

export const ctas = {
  don: { label: "Faire un don", href: helloAsso.don, externe: true },
  donUrgence: {
    label: "Faire un don d’urgence",
    href: helloAsso.urgence,
    externe: true,
  },
  signaler: { label: "Signaler un animal", href: routes.signaler, externe: false },
  voirAnimaux: { label: "Voir les animaux", href: routes.animaux, externe: false },
  soutenir: { label: "Nous soutenir", href: routes.aider, externe: false },
} as const;

/* ------------------------------------------------------------------ */
/* Barre d'aide (haut de page)                                         */
/* ------------------------------------------------------------------ */

export const barreAide = {
  texte: "Besoin d’aide pour un animal ?",
  lienLabel: "Contactez-nous",
  lienHref: routes.contact,
  /** Passer à `false` pour masquer la barre. */
  visible: true,
} as const;

/** Mention légale du pied de page. */
export const mentionLegale = `© ${association.nom} – ${association.signification} – Tous droits réservés.`;
