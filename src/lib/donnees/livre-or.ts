import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { animaux as tAnimaux, messagesLivreOr as tMessages } from "@/db/schema";
import type { MessageLivreOr, StatutMessageLivreOr } from "@/types";

/**
 * Livre d'or.
 *
 * Règle de gestion : aucun message n'est publié sans validation humaine.
 * `messagesPublies()` ne retourne donc que le statut « publie ».
 */

type Ligne = typeof tMessages.$inferSelect & { animalSlug?: string | null };

function enMessage(ligne: Ligne): MessageLivreOr {
  return {
    id: ligne.id,
    nomPublic: ligne.nomPublic,
    ville: ligne.ville ?? undefined,
    message: ligne.message,
    photo: ligne.photoUrl
      ? { src: ligne.photoUrl, alt: ligne.photoAlt ?? "" }
      : undefined,
    animalSlug: ligne.animalSlug ?? undefined,
    animalNom: ligne.animalNom ?? undefined,
    date: ligne.creeLe.toISOString().slice(0, 10),
    statut: ligne.statut,
    reponsePublique: ligne.reponsePublique ?? undefined,
  };
}

/** Messages affichés sur la page publique. */
export async function messagesPublies(): Promise<MessageLivreOr[]> {
  const lignes = await db
    .select({
      ...getColonnes(),
      animalSlug: tAnimaux.slug,
    })
    .from(tMessages)
    .leftJoin(tAnimaux, eq(tMessages.animalId, tAnimaux.id))
    .where(eq(tMessages.statut, "publie"))
    .orderBy(desc(tMessages.creeLe));

  return lignes.map(enMessage);
}

/** Tous les messages, pour la modération. */
export async function tousLesMessages(
  statut?: StatutMessageLivreOr,
): Promise<MessageLivreOr[]> {
  const base = db
    .select({ ...getColonnes(), animalSlug: tAnimaux.slug })
    .from(tMessages)
    .leftJoin(tAnimaux, eq(tMessages.animalId, tAnimaux.id));

  const lignes = statut
    ? await base.where(eq(tMessages.statut, statut)).orderBy(desc(tMessages.creeLe))
    : await base.orderBy(desc(tMessages.creeLe));

  return lignes.map(enMessage);
}

export async function messageParId(id: string): Promise<MessageLivreOr | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;

  const [ligne] = await db
    .select({ ...getColonnes(), animalSlug: tAnimaux.slug })
    .from(tMessages)
    .leftJoin(tAnimaux, eq(tMessages.animalId, tAnimaux.id))
    .where(eq(tMessages.id, id))
    .limit(1);

  return ligne ? enMessage(ligne) : undefined;
}

/** Nombre de messages par statut — compteurs de la modération. */
export async function compterMessages(): Promise<Record<StatutMessageLivreOr, number>> {
  const lignes = await db
    .select({ statut: tMessages.statut, nombre: sql<number>`count(*)::int` })
    .from(tMessages)
    .groupBy(tMessages.statut);

  const compte: Record<StatutMessageLivreOr, number> = {
    en_attente: 0,
    publie: 0,
    refuse: 0,
    indesirable: 0,
    archive: 0,
  };
  for (const ligne of lignes) compte[ligne.statut] = ligne.nombre;
  return compte;
}

/** Enregistre un message reçu depuis le formulaire public. */
export async function enregistrerMessage(donnees: {
  nomPublic: string;
  email: string;
  ville?: string;
  message: string;
  animalNom?: string;
}): Promise<void> {
  await db.insert(tMessages).values({
    nomPublic: donnees.nomPublic,
    email: donnees.email,
    ville: donnees.ville || null,
    message: donnees.message,
    animalNom: donnees.animalNom || null,
    // Toujours en attente : rien ne paraît sans relecture.
    statut: "en_attente",
  });
}

/** Change le statut d'un message et note qui l'a fait. */
export async function modererMessage(
  id: string,
  statut: StatutMessageLivreOr,
  moderateurId: string,
  reponsePublique?: string,
): Promise<void> {
  await db
    .update(tMessages)
    .set({
      statut,
      moderePar: moderateurId,
      modereLe: new Date(),
      ...(reponsePublique !== undefined
        ? { reponsePublique: reponsePublique || null }
        : {}),
    })
    .where(eq(tMessages.id, id));
}

export async function supprimerMessage(id: string): Promise<void> {
  await db.delete(tMessages).where(eq(tMessages.id, id));
}

/* Colonnes du message, sans l'e-mail — jamais exposé au public. */
function getColonnes() {
  return {
    id: tMessages.id,
    nomPublic: tMessages.nomPublic,
    email: tMessages.email,
    ville: tMessages.ville,
    message: tMessages.message,
    photoUrl: tMessages.photoUrl,
    photoAlt: tMessages.photoAlt,
    animalId: tMessages.animalId,
    animalNom: tMessages.animalNom,
    reponsePublique: tMessages.reponsePublique,
    statut: tMessages.statut,
    moderePar: tMessages.moderePar,
    modereLe: tMessages.modereLe,
    creeLe: tMessages.creeLe,
  };
}
