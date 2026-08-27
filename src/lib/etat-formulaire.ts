/**
 * État partagé des formulaires.
 *
 * Ce module est volontairement séparé des actions serveur : un fichier
 * « use server » ne peut exporter que des fonctions asynchrones, jamais une
 * constante ni un type.
 */
export interface EtatFormulaire {
  statut: "attente" | "succes" | "erreur";
  message?: string;
  erreurs?: Record<string, string>;
  /** Référence de dossier communiquée au demandeur. Ex. « ADO-2026-0148 ». */
  reference?: string;
}

export const etatInitial: EtatFormulaire = { statut: "attente" };
