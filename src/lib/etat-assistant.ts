/** Longueur maximale du texte envoyé à l'assistant — borne le coût d'un appel. */
export const DESCRIPTION_MAX = 3000;

export interface EtatReformulation {
  statut: "attente" | "succes" | "erreur";
  message?: string;
  texte?: string;
}
