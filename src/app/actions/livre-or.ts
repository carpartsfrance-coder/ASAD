"use server";

import { revalidatePath } from "next/cache";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import {
  messageParId,
  modererMessage,
  supprimerMessage,
} from "@/lib/donnees/livre-or";
import { routes } from "@/content/site";
import type { StatutMessageLivreOr } from "@/types";

/**
 * Modération du livre d'or.
 *
 * Aucun message n'est publié sans qu'une personne ne l'ait décidé ici.
 */

const STATUTS: StatutMessageLivreOr[] = [
  "en_attente",
  "publie",
  "refuse",
  "indesirable",
  "archive",
];

const VERBE: Record<StatutMessageLivreOr, string> = {
  en_attente: "a remis en attente",
  publie: "a publié",
  refuse: "a refusé",
  indesirable: "a marqué comme indésirable",
  archive: "a archivé",
};

export async function changerStatutMessage(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("livre-or:moderer", "Livre d’or");

  const id = String(data.get("id") ?? "");
  const statut = String(data.get("statut") ?? "") as StatutMessageLivreOr;
  if (!id || !STATUTS.includes(statut)) return;

  const message = await messageParId(id);
  if (!message) return;

  await modererMessage(id, statut, utilisateur.id);
  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `${VERBE[statut]} le message de ${message.nomPublic}`,
  );

  revalidatePath(routes.adminLivreOr);
  revalidatePath(routes.livreOr);
  revalidatePath("/");
}

/** Enregistre une réponse publique, sans changer le statut. */
export async function repondreAuMessage(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("livre-or:moderer", "Livre d’or");

  const id = String(data.get("id") ?? "");
  const reponse = String(data.get("reponse") ?? "").trim();
  if (!id) return;

  const message = await messageParId(id);
  if (!message) return;

  await modererMessage(id, message.statut, utilisateur.id, reponse);
  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `a répondu au message de ${message.nomPublic}`,
  );

  revalidatePath(routes.adminLivreOr);
  revalidatePath(routes.livreOr);
}

/** Suppression définitive — réservée aux indésirables. */
export async function supprimerDefinitivement(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("livre-or:moderer", "Livre d’or");

  const id = String(data.get("id") ?? "");
  const message = await messageParId(id);
  if (!message || message.statut !== "indesirable") return;

  await supprimerMessage(id);
  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `a supprimé un message indésirable de ${message.nomPublic}`,
  );

  revalidatePath(routes.adminLivreOr);
}

