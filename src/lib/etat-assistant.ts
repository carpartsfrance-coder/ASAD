import type { FicheRedigee } from "@/lib/ia/redaction-animal";

/**
 * Résultat de l'assistant de rédaction.
 * Séparé de l'action serveur : un fichier « use server » ne peut exporter
 * que des fonctions asynchrones.
 */
export interface EtatAssistant {
  statut: "attente" | "succes" | "erreur";
  message?: string;
  proposition?: FicheRedigee;
}

export const etatAssistantInitial: EtatAssistant = { statut: "attente" };

/** Longueur maximale des notes envoyées — borne le coût d'un appel. */
export const NOTES_MAX = 4000;
