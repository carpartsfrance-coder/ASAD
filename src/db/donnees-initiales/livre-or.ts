import type { MessageLivreOr } from "@/types";

/**
 * Messages de livre d'or du jeu de départ.
 * Chargés en base par `npm run db:seed`. La lecture passe ensuite par
 * `lib/donnees/livre-or.ts`.
 */
export const messagesLivreOr: MessageLivreOr[] = [
  {
    id: "lo-001",
    nomPublic: "Famille Martin",
    ville: "Bagnols-sur-Cèze",
    animalSlug: "lilou",
    animalNom: "Lilou",
    date: "2026-08-20",
    statut: "publie",
    message:
      "Adoptée il y a 6 mois, Lilou s’est parfaitement intégrée à notre famille. Câline, joueuse et pleine de vie, elle nous comble de bonheur chaque jour. Merci à toute l’équipe pour son accompagnement, et pour la patience de sa famille d’accueil.",
    photo: { src: "/images/livre-or/lilou.jpg", alt: "Lilou, chatte adoptée, allongée sur un plaid" },
    reponsePublique: "Merci pour ces nouvelles. Un immense bravo à sa famille d’accueil.",
  },
  {
    id: "lo-002",
    nomPublic: "Famille Ferrand",
    ville: "Frontignan",
    animalSlug: "ficelle",
    animalNom: "Ficelle",
    date: "2026-07-02",
    statut: "publie",
    message:
      "Ficelle a pris ses marques en une semaine. Elle dort sur le canapé, réclame ses croquettes à heure fixe et vient nous chercher pour jouer. Le suivi après l’adoption nous a beaucoup rassurés : nous avons pu poser toutes nos questions sans nous sentir jugés.",
    photo: { src: "/images/livre-or/tosca.jpg", alt: "Ficelle installée sur le canapé de sa famille" },
  },
  {
    id: "lo-003",
    nomPublic: "Sophie B.",
    ville: "Montpellier",
    date: "2026-06-14",
    statut: "publie",
    message:
      "Je suis famille d’accueil depuis deux ans. On pleure au départ de chacun, et on recommence le mois suivant. C’est la plus belle chose que j’aie faite de mes soirées libres.",
  },
  {
    id: "lo-004",
    nomPublic: "Famille Bouvier",
    ville: "Nîmes",
    animalNom: "Tosca",
    date: "2026-05-08",
    statut: "publie",
    message:
      "On nous avait prévenus : Tosca était réputée difficile, sur la défensive avec les inconnus. Nous avons fait cinq visites avant de l’emmener. Il a fallu six mois pour qu’elle accepte d’être touchée sans se raidir. Aujourd’hui, elle se couche sur le dos dès qu’on entre dans la pièce.",
    photo: { src: "/images/livre-or/nougat.jpg", alt: "Tosca, chienne adoptée, couchée devant une cheminée" },
    reponsePublique: "Votre patience a tout changé pour elle. Merci de nous avoir fait confiance.",
  },
  {
    id: "lo-005",
    nomPublic: "Marc et Hélène",
    ville: "Alès",
    date: "2026-04-30",
    statut: "publie",
    message:
      "Nougat est arrivé chez nous avec une patte plâtrée. Nous avons repris son protocole de rééducation à la maison pendant deux mois. Il ne garde aucune séquelle et court désormais plus vite que nos enfants.",
  },

  /* Messages non publics — visibles uniquement dans le back-office. */
  {
    id: "lo-006",
    nomPublic: "Julie R.",
    ville: "Sète",
    date: "2026-08-24",
    statut: "en_attente",
    message:
      "Merci pour tout ce que vous faites. J’aimerais témoigner de notre adoption de l’an dernier.",
  },
];

