import "server-only";

import OpenAI from "openai";

/**
 * Reformulation de la description d'un animal.
 *
 * L'assistant ne remplit pas la fiche : il reprend le texte écrit par la
 * bénévole et le met au propre. Rien d'autre. Le contenu reste le sien.
 */

const MODELE_PAR_DEFAUT = "gpt-5.6-terra";

const CONSIGNE = `Tu mets au propre la description d'un animal proposé à l'adoption par une association française de protection animale. La bénévole a écrit ce texte ; tu le réécris mieux, tu ne le remplaces pas.

RÈGLE ABSOLUE — tu n'ajoutes aucune information.
Pas un trait de caractère, pas une date, pas un lieu, pas une précision de santé qui ne soit déjà dans son texte. Si son texte est court, ta réécriture est courte. Une description d'adoption engage l'association : un détail inventé, c'est une adoption qui échoue.

Ce que tu fais :
- corriger l'orthographe, la grammaire et la ponctuation ;
- remplacer le style télégraphique par des phrases complètes ;
- mettre au présent, à la troisième personne, en gardant le nom de l'animal s'il est cité ;
- garder un ton simple et chaleureux, sans emphase publicitaire ni superlatifs.

Ce que tu ne fais pas :
- pas de titre, pas de liste à puces, pas d'émoji ;
- aucune promesse sur la santé, le comportement futur ou la réussite de l'adoption ;
- pas de formule d'appel du type « adoptez-le vite » ou « n'attendez plus ».

Réponds uniquement par le texte réécrit, sans commentaire ni guillemets.`;

let client: OpenAI | null = null;

function clientOpenAi(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/** L'assistant n'est proposé que si une clé est configurée. */
export function assistantDisponible(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export class AssistantIndisponible extends Error {}

export async function reformulerDescription(
  texte: string,
  contexte?: { nom?: string; espece?: string; sexe?: string },
): Promise<string> {
  if (!assistantDisponible()) {
    throw new AssistantIndisponible("Aucune clé OpenAI n’est configurée.");
  }

  const entete = [
    contexte?.nom && `Nom de l'animal : ${contexte.nom}`,
    contexte?.espece && `Espèce : ${contexte.espece}`,
    contexte?.sexe && `Sexe : ${contexte.sexe}`,
  ]
    .filter(Boolean)
    .join("\n");

  const reponse = await clientOpenAi().responses.create({
    model: process.env.OPENAI_MODEL?.trim() || MODELE_PAR_DEFAUT,
    input: [
      { role: "system", content: CONSIGNE },
      {
        role: "user",
        content: `${entete ? `${entete}\n\n` : ""}Texte à mettre au propre :\n${texte}`,
      },
    ],
  });

  const resultat = reponse.output_text?.trim();
  if (!resultat) throw new Error("Le modèle n’a rien renvoyé d’exploitable.");
  return resultat;
}
