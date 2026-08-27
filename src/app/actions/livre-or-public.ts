"use server";

import { revalidatePath } from "next/cache";
import { enregistrerMessage } from "@/lib/donnees/livre-or";
import { routes } from "@/content/site";
import type { EtatFormulaire } from "@/lib/etat-formulaire";

/**
 * Dépôt d'un message dans le livre d'or.
 *
 * C'est le seul formulaire public du site. Rien n'est publié ici : le message
 * part en file d'attente, un bénévole le relit et décide dans le back-office.
 */

const MESSAGE_MINI = 30;

function texte(data: FormData, nom: string): string {
  const valeur = data.get(nom);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/** Vérification volontairement large : on refuse l'absurde, pas l'inhabituel. */
function emailValide(valeur: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);
}

export async function envoyerMessageLivreOr(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  /* Piège à robots : un humain ne voit pas ce champ. On répond comme si tout
     allait bien, pour ne pas apprendre à l'automate ce qui l'a trahi. */
  if (texte(data, "site")) {
    return { statut: "succes", message: "Merci ! Votre message a bien été reçu." };
  }

  const nomPublic = texte(data, "nomPublic");
  const email = texte(data, "email");
  const ville = texte(data, "ville");
  const animal = texte(data, "animal");
  const message = texte(data, "message");

  const erreurs: Record<string, string> = {};

  if (!nomPublic) erreurs.nomPublic = "Indiquez le nom à afficher sous votre message.";
  if (!email) erreurs.email = "Nous avons besoin de votre e-mail pour vous répondre.";
  else if (!emailValide(email)) erreurs.email = "Cette adresse e-mail ne semble pas valide.";
  if (!message) erreurs.message = "Votre message est vide.";
  else if (message.length < MESSAGE_MINI) {
    erreurs.message = `Racontez-nous un peu plus : ${MESSAGE_MINI} caractères au minimum.`;
  }
  if (data.get("consentement") !== "on") {
    erreurs.consentement = "Merci de confirmer votre accord pour la publication.";
  }

  if (Object.keys(erreurs).length > 0) {
    return {
      statut: "erreur",
      message: "Certaines informations sont manquantes ou incorrectes.",
      erreurs,
    };
  }

  await enregistrerMessage({ nomPublic, email, ville, animalNom: animal, message });

  revalidatePath(routes.adminLivreOr);

  return {
    statut: "succes",
    message:
      "Merci ! Votre message a bien été reçu. Il sera relu par un bénévole avant publication : aucun message n’est mis en ligne automatiquement.",
  };
}
