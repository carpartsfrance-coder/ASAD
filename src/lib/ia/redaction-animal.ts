import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

/**
 * Assistant de rédaction des fiches animaux.
 *
 * À partir des notes écrites par une bénévole, il propose de quoi remplir la
 * partie rédigée de la fiche. Il ne remplace jamais sa saisie : le résultat
 * arrive dans le formulaire, où il est relu et corrigé avant enregistrement.
 *
 * Ce que l'assistant NE touche PAS, volontairement :
 *   nom, espèce, sexe, âge, race, identification, nombre d'animaux de la
 *   portée, vacciné / identifié / stérilisé.
 * Ce sont les mentions prévues par le code rural (art. L.214-8-1) et des
 * affirmations sanitaires : elles engagent l'association, elles restent
 * saisies à la main.
 */

const MODELE_PAR_DEFAUT = "gpt-5.6-terra";

const Compatibilite = z
  .enum(["oui", "non", "a_tester", "avec_conditions"])
  .nullable();

const FicheRedigee = z.object({
  descriptionCourte: z
    .string()
    .nullable()
    .describe("Deux ou trois phrases de présentation, au présent."),
  histoire: z
    .array(z.string())
    .nullable()
    .describe("Le parcours de l'animal, un paragraphe par entrée."),
  caractere: z
    .array(z.string())
    .nullable()
    .describe("Traits de caractère en un ou deux mots, avec une majuscule."),
  caractereNote: z
    .string()
    .nullable()
    .describe("Une ou deux phrases de nuance sur le caractère."),
  taille: z.enum(["petit", "moyen", "grand"]).nullable(),
  compatChiens: Compatibilite,
  compatChats: Compatibilite,
  compatEnfants: Compatibilite,
  compatNoteChiens: z.string().nullable(),
  compatNoteChats: z.string().nullable(),
  compatNoteEnfants: z.string().nullable(),
});

export type FicheRedigee = z.infer<typeof FicheRedigee>;

const CONSIGNE = `Tu aides une bénévole d'une association française de protection animale à remplir la fiche d'un animal proposé à l'adoption, à partir des notes qu'elle vient d'écrire.

RÈGLE ABSOLUE — tu n'inventes rien.
Tu reformules uniquement ce qui figure dans les notes. Si une information n'y est pas, tu réponds null pour ce champ. Jamais une supposition, jamais une valeur « par défaut », jamais un détail ajouté pour faire joli. Une fiche d'adoption engage l'association : un trait de caractère inventé, c'est une adoption qui échoue.

Comment écrire :
- français simple et chaleureux, sans emphase publicitaire ni superlatifs ;
- au présent, à la troisième personne, en parlant de l'animal par son nom s'il est donné ;
- des phrases courtes ; pas d'émojis, pas de titres, pas de listes à puces dans les textes ;
- ne promets rien sur la santé, le comportement futur ou le résultat de l'adoption ;
- ne mentionne ni prix, ni frais, ni date, sauf s'ils sont dans les notes.

Champ par champ :
- descriptionCourte : deux ou trois phrases, ce qu'on lit en haut de la fiche.
- histoire : le parcours de l'animal, un paragraphe par entrée du tableau. Uniquement ce que disent les notes. Si elles ne racontent rien du passé, réponds null.
- caractere : des traits en un ou deux mots, première lettre en majuscule (« Doux », « Joueur », « Craintif au début »). Au plus six.
- caractereNote : une ou deux phrases de nuance, seulement si les notes apportent une précision utile.
- taille : uniquement si les notes permettent de trancher (gabarit, poids, race).
- compatChiens / compatChats / compatEnfants : « oui » ou « non » seulement si les notes l'affirment ; « avec_conditions » si elles posent une réserve explicite ; « a_tester » si elles disent que ça n'a pas été testé ; null si elles n'en parlent pas du tout.
- compatNote… : une courte précision, seulement si les notes en donnent une.`;

let client: OpenAI | null = null;

function clientOpenAi(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/** L'assistant n'est proposé que si une clé est configurée. */
export function assistantDisponible(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export class AssistantIndisponible extends Error {}

/**
 * Transforme des notes libres en contenu de fiche.
 * Lève `AssistantIndisponible` si aucune clé n'est configurée.
 */
export async function redigerDepuisNotes(
  notes: string,
  contexte?: { nom?: string; espece?: string; sexe?: string },
): Promise<FicheRedigee> {
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

  const reponse = await clientOpenAi().responses.parse({
    model: process.env.OPENAI_MODEL?.trim() || MODELE_PAR_DEFAUT,
    input: [
      { role: "system", content: CONSIGNE },
      {
        role: "user",
        content: `${entete ? `${entete}\n\n` : ""}Notes de la bénévole :\n${notes}`,
      },
    ],
    text: { format: zodTextFormat(FicheRedigee, "fiche_animal") },
  });

  const resultat = reponse.output_parsed;
  if (!resultat) {
    throw new Error("Le modèle n’a rien renvoyé d’exploitable.");
  }
  return resultat;
}
