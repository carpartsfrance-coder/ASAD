/** Repères éditoriaux de la page Urgences — ne changent pas d'une campagne à l'autre. */

/** Ce que finance un don — bloc « Où va votre don » de la page Urgences. */
export const affectationsDon = [
  { montant: 25, titre: "un rappel de vaccin", texte: "Protège un animal contre les maladies les plus courantes." },
  { montant: 70, titre: "une identification", texte: "Puce électronique et enregistrement au fichier national." },
  { montant: 150, titre: "une stérilisation", texte: "Empêche de nouvelles portées non désirées." },
  { montant: 600, titre: "une opération", texte: "Couvre une chirurgie courante, anesthésie comprise." },
] as const;

export const typesUrgence = [
  "Soins et opérations vétérinaires",
  "Sorties de fourrière",
  "Placements sous 48 heures",
] as const;
