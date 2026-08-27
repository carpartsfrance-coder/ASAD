"use server";

import { exigerCapacite } from "@/lib/auth/garde";
import {
  AssistantIndisponible,
  redigerDepuisNotes,
} from "@/lib/ia/redaction-animal";
import { NOTES_MAX, type EtatAssistant } from "@/lib/etat-assistant";

/**
 * Rédige la partie descriptive d'une fiche à partir de notes libres.
 *
 * Les droits sont revérifiés ici : une action serveur est une porte d'entrée
 * publique, et un appel non authentifié consommerait le crédit de
 * l'association.
 */
export async function redigerFiche(
  notes: string,
  contexte?: { nom?: string; espece?: string; sexe?: string },
): Promise<EtatAssistant> {
  await exigerCapacite("animaux:ecrire", "Animaux");

  const propres = notes.trim();

  if (propres.length < 20) {
    return {
      statut: "erreur",
      message:
        "Écrivez d’abord quelques phrases sur l’animal : d’où il vient, son caractère, ce qu’il supporte.",
    };
  }

  if (propres.length > NOTES_MAX) {
    return {
      statut: "erreur",
      message: `Vos notes sont trop longues (${propres.length} caractères pour ${NOTES_MAX} maximum). Gardez l’essentiel.`,
    };
  }

  try {
    const proposition = await redigerDepuisNotes(propres, contexte);
    return { statut: "succes", proposition };
  } catch (erreur) {
    if (erreur instanceof AssistantIndisponible) {
      return {
        statut: "erreur",
        message:
          "L’assistant n’est pas configuré sur ce site. La fiche se remplit normalement à la main.",
      };
    }
    console.error("[ASAD] Assistant de rédaction", erreur);
    return {
      statut: "erreur",
      message:
        "L’assistant n’a pas répondu. Réessayez dans un instant — vos notes sont conservées.",
    };
  }
}
