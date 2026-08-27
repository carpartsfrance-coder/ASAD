import type { Campagne } from "@/types";

/**
 * Campagnes du jeu de départ, chargées en base par `npm run db:seed`.
 *
 * Campagnes d'urgence vétérinaire.
 *
 * Règle de gestion : les collectes affichent un montant réel. On ne calcule
 * jamais une progression à partir d'une estimation.
 */
export const campagnes: Campagne[] = [
  {
    id: "cam-001",
    slug: "operation-rio",
    titre: "L’opération de Rio",
    animalSlug: "rio",
    type: "Chirurgie orthopédique",
    description:
      "Rio souffre d’une rupture des ligaments croisés. L’opération est indispensable pour lui éviter des douleurs chroniques et lui redonner une vie normale.",
    echeance: "Opération sous 15 jours",
    dateLimite: "2026-09-10",
    objectif: 4000,
    collecte: 2460,
    photo: {
      src: "/images/animaux/rio.jpg",
      alt: "Rio, pris en charge par ASAD",
    },
    statut: "active",
    ctaLabel: "Aider Rio",
    misesAJour: [
      { date: "2026-08-20", texte: "Bilan pré-opératoire réalisé, Rio est en bonne condition générale." },
      { date: "2026-08-12", texte: "Rendez-vous chirurgical bloqué chez notre vétérinaire partenaire." },
    ],
    afficherSurAccueil: true,
  },
  {
    id: "cam-002",
    slug: "sortie-fourriere-milo",
    titre: "La sortie de fourrière de Milo",
    animalSlug: "milo",
    type: "Sortie de fourrière",
    description:
      "Le délai légal de garde de Milo est dépassé. Sa sortie doit être financée sous 48 heures pour qu’il rejoigne une famille d’accueil.",
    echeance: "Sortie sous 48 heures",
    dateLimite: "2026-08-28",
    objectif: 320,
    collecte: 180,
    photo: {
      src: "/images/animaux/milo.jpg",
      alt: "Milo, pris en charge par ASAD",
    },
    statut: "active",
    ctaLabel: "Accueillir Milo",
    misesAJour: [
      { date: "2026-08-24", texte: "Une famille d’accueil s’est portée volontaire à Alès." },
    ],
    afficherSurAccueil: true,
  },
  {
    id: "cam-003",
    slug: "soins-java",
    titre: "Les soins de Java",
    animalSlug: "java",
    type: "Soins et renutrition",
    description:
      "Java suit un protocole de renutrition et un traitement vétérinaire quotidien. Sa remise sur pied demande plusieurs semaines de soins.",
    echeance: "Soins en cours",
    objectif: 1200,
    collecte: 410,
    photo: {
      src: "/images/animaux/java.jpg",
      alt: "Java, prise en charge par ASAD",
    },
    statut: "active",
    ctaLabel: "Aider Java",
    misesAJour: [
      { date: "2026-08-18", texte: "Java a repris 1,8 kg depuis son arrivée." },
    ],
    afficherSurAccueil: true,
  },
  {
    id: "cam-004",
    slug: "operation-nesma",
    titre: "L’opération de Nesma",
    type: "Chirurgie terminée",
    description:
      "Nesma a été opérée d’une fracture du bassin après un accident de la route. L’intervention et son suivi ont été intégralement financés par vos dons.",
    echeance: "Opérée le 2 août",
    objectif: 1850,
    collecte: 1850,
    photo: {
      src: "/images/urgences/nesma.jpg",
      alt: "Nesma, prise en charge par ASAD",
    },
    statut: "terminee",
    ctaLabel: "Terminée",
    remerciement:
      "Merci aux 63 personnes qui ont participé. Nesma marche à nouveau normalement.",
    misesAJour: [
      { date: "2026-08-16", texte: "Contrôle post-opératoire : consolidation conforme." },
      { date: "2026-08-02", texte: "Opération réalisée avec succès." },
    ],
    afficherSurAccueil: false,
  },
];

