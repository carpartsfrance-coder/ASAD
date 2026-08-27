"use server";

import { exigerCapacite } from "@/lib/auth/garde";
import {
  AssistantIndisponible,
  reformulerDescription,
} from "@/lib/ia/redaction-animal";
import { DESCRIPTION_MAX, type EtatReformulation } from "@/lib/etat-assistant";

/**
 * Met au propre la description écrite par la bénévole.
 *
 * Les droits sont revérifiés ici : une action serveur est une porte d'entrée
 * publique, et un appel non authentifié consommerait le crédit de
 * l'association.
 */
export async function reformuler(
  texte: string,
  contexte?: { nom?: string; espece?: string; sexe?: string },
): Promise<EtatReformulation> {
  await exigerCapacite("animaux:ecrire", "Animaux");

  const propre = texte.trim();

  if (propre.length < 20) {
    return {
      statut: "erreur",
      message:
        "Écrivez d’abord quelques phrases : l’assistant met au propre, il n’invente pas.",
    };
  }

  if (propre.length > DESCRIPTION_MAX) {
    return {
      statut: "erreur",
      message: `Texte trop long (${propre.length} caractères pour ${DESCRIPTION_MAX} maximum).`,
    };
  }

  try {
    return { statut: "succes", texte: await reformulerDescription(propre, contexte) };
  } catch (erreur) {
    if (erreur instanceof AssistantIndisponible) {
      return {
        statut: "erreur",
        message: "L’assistant n’est pas configuré sur ce site.",
      };
    }
    console.error("[ASAD] Reformulation", erreur);
    return {
      statut: "erreur",
      message:
        "L’assistant n’a pas répondu. Réessayez — votre texte est intact.",
    };
  }
}
