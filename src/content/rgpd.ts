import { association, routes } from "./site";

/**
 * Mentions d'information des formulaires (recommandations CNIL).
 * Chaque formulaire doit préciser : pourquoi les données sont collectées,
 * qui les reçoit, combien de temps elles sont conservées et comment
 * exercer ses droits.
 */
export interface MentionRgpd {
  finalite: string;
  destinataire: string;
  conservation: string;
  droits: string;
}

const destinataireCommun = `Les informations transmises sont reçues par les bénévoles habilités de ${association.nom} et ne sont ni cédées ni vendues à des tiers.`;

const droitsCommuns = `Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur vos données. Pour l’exercer, écrivez à ${association.email}. Vous pouvez également introduire une réclamation auprès de la CNIL.`;

export const mentionAdoption: MentionRgpd = {
  finalite:
    "Les informations recueillies servent uniquement à instruire votre demande d’adoption : vérifier l’adéquation entre votre foyer et l’animal, puis organiser les échanges et la visite préalable.",
  destinataire: destinataireCommun,
  conservation:
    "Les demandes sont conservées 12 mois après le dernier échange, ou 3 ans après l’adoption pour assurer le suivi prévu au contrat.",
  droits: droitsCommuns,
};

export const mentionFamilleAccueil: MentionRgpd = {
  finalite:
    "Les informations recueillies servent uniquement à étudier votre candidature de famille d’accueil et à vous proposer un animal adapté à votre logement et à vos disponibilités.",
  destinataire: destinataireCommun,
  conservation:
    "Les candidatures sont conservées 12 mois après le dernier échange, ou pendant la durée de la collaboration si celle-ci se poursuit.",
  droits: droitsCommuns,
};

export const mentionBenevolat: MentionRgpd = {
  finalite:
    "Les informations recueillies servent uniquement à vous recontacter au sujet des missions de bénévolat correspondant à vos disponibilités.",
  destinataire: destinataireCommun,
  conservation:
    "Les candidatures sont conservées 12 mois après le dernier échange.",
  droits: droitsCommuns,
};

export const mentionContact: MentionRgpd = {
  finalite:
    "Les informations recueillies servent uniquement à répondre à votre message.",
  destinataire: destinataireCommun,
  conservation:
    "Les messages sont conservés 12 mois après la dernière réponse apportée.",
  droits: droitsCommuns,
};

export const mentionSignalement: MentionRgpd = {
  finalite:
    "Les informations recueillies servent uniquement à organiser l’intervention auprès de l’animal signalé et à vous recontacter si nous avons besoin de précisions.",
  destinataire: `${destinataireCommun} Elles peuvent être transmises aux services compétents (mairie, fourrière, vétérinaire) si la prise en charge l’exige.`,
  conservation:
    "Les signalements sont conservés 24 mois, durée nécessaire au suivi de l’animal concerné.",
  droits: droitsCommuns,
};

export const mentionLivreOr: MentionRgpd = {
  finalite:
    "Les informations recueillies servent à relire puis publier votre message dans le livre d’or. Seuls le nom affiché, la ville et le message sont rendus publics — jamais votre adresse e-mail.",
  destinataire: destinataireCommun,
  conservation:
    "Les messages publiés restent en ligne tant que vous ne demandez pas leur retrait. Les messages refusés sont supprimés sous 3 mois.",
  droits: droitsCommuns,
};

/** Lien vers la politique de confidentialité, affiché sous chaque formulaire. */
export const lienConfidentialite = {
  label: "Politique de confidentialité",
  href: routes.confidentialite,
};
