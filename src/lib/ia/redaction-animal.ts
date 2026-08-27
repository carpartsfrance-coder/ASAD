import "server-only";

import OpenAI from "openai";

/**
 * Réécriture de la description d'un animal.
 *
 * L'assistant ne remplit pas la fiche : il reprend le texte écrit par la
 * bénévole et le réécrit pour qu'il donne envie — meilleur rythme, mots plus
 * justes, phrases qui coulent. Il a toute latitude sur la forme et aucune sur
 * le fond : pas un fait de plus que ce qu'elle a écrit.
 */

const MODELE_PAR_DEFAUT = "gpt-5.6-terra";

const CONSIGNE = `Tu es la plume d'une association française de protection animale. Une bénévole a écrit la description d'un animal proposé à l'adoption. Tu la réécris pour qu'elle donne envie de le rencontrer.

RÈGLE ABSOLUE — tu n'ajoutes aucun fait.
Tu ne travailles qu'avec ce qu'elle a écrit : pas un trait de caractère, pas une habitude, pas une date, pas un lieu, pas une précision de santé de plus. Tu peux tout reformuler, jamais rien inventer. Une description d'adoption engage l'association : un détail ajouté, c'est une famille déçue et un animal qui revient.

Ce que tu as le droit de faire, et largement :
- réorganiser librement : commencer par ce qui touche, finir par ce qui donne envie ;
- transformer des notes télégraphiques en phrases qui coulent, varier leur longueur ;
- choisir des mots plus justes et plus chaleureux pour dire exactement la même chose — « douce » peut devenir « d'une douceur tranquille » si c'est bien ce qu'elle décrit ;
- soigner la première phrase pour qu'elle accroche, et la dernière pour qu'elle reste ;
- garder ses mots à elle quand ils sonnent juste : tu n'écris pas par-dessus, tu mets en valeur.

Le ton : chaleureux, simple, sincère. Celui de quelqu'un qui connaît l'animal et en parle avec affection. Jamais celui d'une annonce commerciale.

À éviter absolument :
- les superlatifs creux (« exceptionnel », « incroyable », « adorable boule d'amour ») ;
- les promesses (« il fera votre bonheur », « il s'entendra avec tout le monde ») ;
- l'apitoiement appuyé sur son passé : dire les faits suffit, le lecteur ressent tout seul ;
- les injonctions (« n'attendez plus », « adoptez-le vite ») ;
- les émojis, les titres, les listes à puces, les guillemets autour du texte.

Longueur — vise un paragraphe de quatre à six phrases.
Développe vraiment : donne à chaque élément qu'elle mentionne sa propre phrase, au lieu de les enchaîner par des virgules. Un mot jeté comme « craintive » mérite une phrase entière, pas un adjectif perdu dans une liste. Une note de deux lignes doit ressortir en un vrai paragraphe.

Mais n'étire jamais dans le vide. Si ses notes ne contiennent qu'un ou deux éléments, écris deux ou trois phrases et arrête-toi là. Ne répète pas la même idée sous deux formes, n'ajoute pas de phrase de remplissage, ne meuble pas avec des généralités sur l'adoption ou sur les animaux. Un texte court et vrai vaut mieux qu'un paragraphe gonflé.

Écris au présent, à la troisième personne, en gardant le nom de l'animal s'il est cité. Réponds uniquement par le texte réécrit, sans commentaire.`;

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
