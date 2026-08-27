import { routes, helloAsso } from "./site";

export type CleIconeAide = "main-coeur" | "maison-coeur" | "benevoles";

export interface FaconAider {
  id: string;
  icone: CleIconeAide;
  titre: string;
  texte: string;
  lienLabel: string;
  href: string;
  externe: boolean;
}

/** Les trois façons d'aider, section « Chaque geste peut changer une vie ». */
export const faconsAider: FaconAider[] = [
  {
    id: "aide-don",
    icone: "main-coeur",
    titre: "Faire un don",
    texte:
      "Vos dons financent les soins, la nourriture et le quotidien de nos protégés.",
    lienLabel: "Je donne",
    href: routes.don,
    externe: false,
  },
  {
    id: "aide-fa",
    icone: "maison-coeur",
    titre: "Devenir famille d’accueil",
    texte:
      "Accueillez temporairement un animal et aidez-le à reprendre confiance.",
    lienLabel: "En savoir plus",
    href: `${routes.rejoindre}#famille-accueil`,
    externe: false,
  },
  {
    id: "aide-benevolat",
    icone: "benevoles",
    titre: "Être bénévole",
    texte:
      "Donnez de votre temps et de votre énergie pour faire la différence.",
    lienLabel: "Rejoindre l’équipe",
    href: `${routes.rejoindre}#benevolat`,
    externe: false,
  },
];

/** Montants proposés sur la page de don — chacun renvoie vers HelloAsso. */
export const montantsDon = [
  { montant: 10, effet: "Une semaine de croquettes pour un chat" },
  { montant: 25, effet: "Une identification par puce électronique" },
  { montant: 50, effet: "Un vaccin complet" },
  { montant: 120, effet: "Une stérilisation" },
] as const;

/** Lien de don, construit avec le montant pré-rempli quand HelloAsso l'accepte. */
export function lienDon(montant?: number): string {
  if (!montant) return helloAsso.don;
  const separateur = helloAsso.don.includes("?") ? "&" : "?";
  return `${helloAsso.don}${separateur}amount=${montant}`;
}
