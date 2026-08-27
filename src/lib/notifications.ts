import "server-only";

import { association } from "@/content/site";

/** Le contenu d'une demande, tel qu'il sera relayé. */
export type Valeurs = Record<string, string | string[] | boolean | undefined>;

/**
 * Acheminement des demandes internes vers l'association.
 *
 * Le site public n'a plus aucun formulaire : il ne reste ici que les demandes
 * émises depuis le back-office, comme une réinitialisation de mot de passe.
 * Deux canaux, dans cet ordre —
 *   1. `ASAD_FORM_WEBHOOK_URL` : un webhook (Make, Zapier, n8n…) qui relaie
 *      la demande vers la boîte mail de l'association ;
 *   2. à défaut, la demande est journalisée côté serveur.
 *
 * Pour brancher un fournisseur d'e-mail (Resend, Brevo, MailerSend…),
 * il suffit d'ajouter un canal dans `envoyerDemande` ci-dessous.
 */
export interface Demande {
  /** Nature de la demande. */
  type: string;
  /** Sujet lisible, repris dans l'e-mail. */
  sujet: string;
  valeurs: Valeurs;
}

export async function envoyerDemande(demande: Demande): Promise<void> {
  const destinataire = process.env.ASAD_CONTACT_EMAIL ?? association.email;
  const webhook = process.env.ASAD_FORM_WEBHOOK_URL;

  const charge = {
    type: demande.type,
    sujet: demande.sujet,
    destinataire,
    recuLe: new Date().toISOString(),
    donnees: demande.valeurs,
  };

  if (webhook) {
    const reponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(charge),
    });
    if (!reponse.ok) {
      throw new Error(
        `Le relais des formulaires a répondu ${reponse.status}.`,
      );
    }
    return;
  }

  // Aucun canal configuré : on journalise pour ne rien perdre.
  console.info(
    `[ASAD] Nouvelle demande « ${demande.sujet} » à transmettre à ${destinataire}\n`,
    JSON.stringify(charge.donnees, null, 2),
  );
}
