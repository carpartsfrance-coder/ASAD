/** Textes des pages éditoriales. */

export const pageCatalogue = {
  surtitre: "Adoption",
  titre: "Trouvez votre futur compagnon",
  chapo:
    "Chaque animal présenté ici a été recueilli, soigné et sociabilisé par l’association. Sa fiche décrit son caractère, ses besoins et les conditions de son adoption — prenez le temps de la lire avant de faire une demande.",
  encart: {
    titre: "Comment se passe une adoption ?",
    etapes: [
      { titre: "Vous faites une demande", texte: "Un formulaire en ligne, rattaché à la fiche de l’animal." },
      { titre: "Nous vous rappelons", texte: "Un bénévole vous contacte sous cinq jours ouvrés." },
      { titre: "Vous vous rencontrez", texte: "Chez sa famille d’accueil, autant de fois que nécessaire." },
      { titre: "L’adoption est signée", texte: "Visite du domicile, contrat, puis suivi pendant six mois." },
    ],
  },
  encartFinal: {
    titre: "Vous hésitez encore à adopter ?",
    texte:
      "Devenir famille d’accueil, c’est offrir une parenthèse à un animal sans s’engager à vie. L’association prend en charge tous les frais et vous accompagne.",
    ctaLabel: "Devenir famille d’accueil",
    photo: {
      src: "/images/pages/adoption-encart.jpg",
      alt: "Chien accueilli temporairement dans le salon d’une famille d’accueil",
    },
  },
} as const;

export const pageAssociation = {
  titre: "L’association",
  chapo:
    "ASAD est une association loi 1901 de protection animale, entièrement bénévole. Nous recueillons, soignons et plaçons les animaux abandonnés, blessés ou saisis.",
  photo: {
    src: "/images/pages/association.jpg",
    alt: "Bénévoles de l’association ASAD au travail auprès des animaux",
  },
  missions: [
    {
      titre: "Recueillir",
      texte:
        "Nous intervenons sur signalement : animal errant, blessé, abandonné ou saisi. Chaque prise en charge commence par un bilan vétérinaire.",
    },
    {
      titre: "Soigner",
      texte:
        "Identification, vaccination, stérilisation et traitements sont systématiquement réalisés avant toute proposition à l’adoption.",
    },
    {
      titre: "Placer",
      texte:
        "Nous ne travaillons qu’avec des familles d’accueil : aucun animal ne vit en box. Le placement définitif se fait après visite du domicile.",
    },
    {
      titre: "Sensibiliser",
      texte:
        "Nous menons des actions d’information sur la stérilisation, l’identification et la lutte contre l’abandon.",
    },
  ],
  fonctionnement: [
    "L’association ne rémunère personne : chaque euro reçu part directement dans les soins, la nourriture et le matériel.",
    "Les comptes sont présentés chaque année en assemblée générale et tenus à disposition des adhérents.",
    "Nous travaillons avec trois cliniques vétérinaires partenaires et un réseau de familles d’accueil sur quatre départements.",
  ],
} as const;

export const pageFamilleAccueil = {
  titre: "Devenir famille d’accueil",
  chapo:
    "Une famille d’accueil héberge temporairement un animal, le temps qu’il se rétablisse et qu’une famille définitive soit trouvée. C’est le maillon indispensable de notre fonctionnement.",
  photo: {
    src: "/images/pages/famille-accueil.jpg",
    alt: "Chien accueilli temporairement dans le salon d’une famille d’accueil",
  },
  engagements: [
    "L’association prend en charge l’intégralité des frais vétérinaires.",
    "La nourriture, la litière et le matériel sont fournis si besoin.",
    "Un référent bénévole vous accompagne et reste joignable à tout moment.",
    "La durée d’accueil est convenue à l’avance et peut être réévaluée.",
  ],
  attentes: [
    "Un logement adapté à l’animal accueilli.",
    "De la disponibilité, en particulier les premiers jours.",
    "L’accord de toutes les personnes du foyer.",
    "La capacité à conduire l’animal aux rendez-vous vétérinaires.",
  ],
  etapes: [
    { titre: "Candidature", texte: "Vous remplissez le formulaire ci-dessous." },
    { titre: "Échange", texte: "Un bénévole vous rappelle pour préciser vos disponibilités." },
    { titre: "Visite", texte: "Nous visitons votre domicile et validons ensemble le type d’animal." },
    { titre: "Accueil", texte: "L’animal arrive avec son matériel et son suivi vétérinaire." },
  ],
} as const;

export const pageBenevolat = {
  titre: "Devenir bénévole",
  chapo:
    "L’association fonctionne uniquement grâce à ses bénévoles. Quelques heures par mois suffisent déjà à faire la différence.",
  photo: {
    src: "/images/pages/benevolat.jpg",
    alt: "Équipe de bénévoles de l’association réunie lors d’un événement",
  },
  missions: [
    { titre: "Transport", texte: "Conduire un animal chez le vétérinaire ou vers sa famille d’accueil." },
    { titre: "Événements", texte: "Tenir un stand lors des collectes et des journées adoption." },
    { titre: "Communication", texte: "Photographier les animaux, rédiger les fiches, animer les réseaux." },
    { titre: "Administratif", texte: "Suivre les dossiers d’adoption et les rendez-vous vétérinaires." },
    { titre: "Collectes", texte: "Récupérer et stocker les dons de nourriture et de matériel." },
    { titre: "Soins", texte: "Aider aux soins quotidiens auprès des familles d’accueil." },
  ],
} as const;

export const pageUrgences = {
  titre: "Urgences vétérinaires",
  chapo:
    "Certaines prises en charge ne peuvent pas attendre. Ces campagnes financent des soins précis, pour un animal identifié, avec un objectif et une échéance.",
  photo: {
    src: "/images/pages/urgences.jpg",
    alt: "Animal pris en charge en urgence dans une clinique vétérinaire",
  },
} as const;

export const pageDon = {
  titre: "Faire un don",
  chapo:
    "Les dons sont collectés par HelloAsso, plateforme française sans commission pour les associations. Vous recevez votre reçu directement par e-mail.",
  photo: {
    src: "/images/pages/don.jpg",
    alt: "Chien et chat recueillis par l’association, bénéficiaires des dons",
  },
  affectation: [
    { poste: "Soins vétérinaires", part: "62 %" },
    { poste: "Nourriture et matériel", part: "24 %" },
    { poste: "Sorties de fourrière et transports", part: "14 %" },
  ],
} as const;

export const pageSignaler = {
  titre: "Signaler un animal",
  chapo:
    "Vous avez trouvé un animal errant, blessé ou en danger ? Décrivez la situation le plus précisément possible : nous rappelons dans les meilleurs délais.",
  urgenceVitale:
    "En cas d’urgence vitale (animal gravement blessé, accident de la route), contactez directement un vétérinaire ou les services de secours avant de remplir ce formulaire.",
} as const;
