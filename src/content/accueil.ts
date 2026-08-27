/**
 * Textes de la page d'accueil.
 * Regroupés ici pour être remplacés par le back-office sans toucher aux composants.
 */

export const hero = {
  surtitre: "Association de protection animale",
  titre: "Une seconde chance pour ceux qui n’ont plus personne",
  chapo:
    "ASAD recueille, soigne et protège les animaux abandonnés pour leur offrir un nouveau départ.",
  photo: {
    src: "/images/hero-chien-chat.jpg",
    alt: "Un chien et un chat recueillis par l’association, installés côte à côte en extérieur",
  },
  pastille: { valeur: "100 %", libelle: "bénévole" },
} as const;

export const sectionAnimaux = {
  titre: "Ils attendent une famille",
  sousTitre:
    "Offrez-leur la chaleur d’un foyer et écrivez ensemble une nouvelle histoire.",
  lienLabel: "Voir tous les animaux",
} as const;

export const sectionUrgences = {
  etiquette: "Urgences",
  titre: "Ils sont en détresse",
  chapo:
    "Ces animaux ont besoin d’une prise en charge immédiate : soins vétérinaires, sortie de fourrière ou placement sous 48 heures.",
  lienLabel: "Voir tous les cas urgents",
  ctaLabel: "Faire un don d’urgence",
} as const;

export const sectionAider = {
  titre: "Chaque geste peut changer une vie",
} as const;

export const sectionTemoignage = {
  titre: "Des nouvelles qui font chaud au cœur",
  lienLabel: "Lire d’autres histoires",
} as const;

export const sectionNewsletter = {
  titre: "Restez informé(e)",
  texte:
    "Inscrivez-vous à notre newsletter pour suivre nos actions et nos protégés.",
  placeholder: "Votre e-mail",
} as const;
