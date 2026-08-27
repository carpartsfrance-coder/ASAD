import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  benevoles as tBenevoles,
  famillesAccueil as tFamilles,
  signalements as tSignalements,
} from "@/db/schema";

/**
 * Candidatures et signalements reçus depuis le site public.
 * Tout est conservé en base : rien ne dépend d'un e-mail qui pourrait se perdre.
 */

type Reponses = Record<string, string | string[]>;

/* ------------------------------------------------------------------ */
/* Familles d'accueil                                                  */
/* ------------------------------------------------------------------ */

export async function enregistrerFamille(donnees: {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  commune: string;
  reponses: Reponses;
}): Promise<void> {
  await db.insert(tFamilles).values(donnees);
}

export async function toutesLesFamilles() {
  return db.select().from(tFamilles).orderBy(desc(tFamilles.creeLe));
}

/* ------------------------------------------------------------------ */
/* Bénévoles                                                           */
/* ------------------------------------------------------------------ */

export async function enregistrerBenevole(donnees: {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  commune: string;
  reponses: Reponses;
}): Promise<void> {
  await db.insert(tBenevoles).values(donnees);
}

export async function tousLesBenevoles() {
  return db.select().from(tBenevoles).orderBy(desc(tBenevoles.creeLe));
}

/* ------------------------------------------------------------------ */
/* Signalements                                                        */
/* ------------------------------------------------------------------ */

/** Un animal blessé ou une maltraitance passent en priorité haute. */
function deduirePriorite(etat: string): "haute" | "moyenne" | "basse" {
  if (etat === "blesse" || etat === "maltraitance") return "haute";
  if (etat === "affaibli" || etat === "portee") return "moyenne";
  return "basse";
}

export async function enregistrerSignalement(donnees: {
  espece: string;
  etatApparent: string;
  lieu: string;
  situation: string;
  declarantNom: string;
  declarantEmail: string;
  declarantTelephone: string;
}): Promise<void> {
  await db.insert(tSignalements).values({
    ...donnees,
    priorite: deduirePriorite(donnees.etatApparent),
  });
}

export async function tousLesSignalements() {
  return db.select().from(tSignalements).orderBy(desc(tSignalements.creeLe));
}

/* ------------------------------------------------------------------ */
/* Compteurs du tableau de bord                                        */
/* ------------------------------------------------------------------ */

export async function compterEnAttente(): Promise<{
  familles: number;
  benevoles: number;
  signalements: number;
}> {
  const [familles] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tFamilles)
    .where(eq(tFamilles.statut, "nouvelle"));
  const [benevoles] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tBenevoles)
    .where(eq(tBenevoles.statut, "nouvelle"));
  const [signalements] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tSignalements)
    .where(sql`${tSignalements.statut} in ('nouveau','a_verifier')`);

  return { familles: familles.n, benevoles: benevoles.n, signalements: signalements.n };
}

/* ------------------------------------------------------------------ */
/* Changements de statut                                               */
/* ------------------------------------------------------------------ */

export async function changerStatutFamille(id: string, statut: typeof tFamilles.$inferSelect["statut"]) {
  await db.update(tFamilles).set({ statut }).where(eq(tFamilles.id, id));
}

export async function changerStatutBenevole(id: string, statut: typeof tBenevoles.$inferSelect["statut"]) {
  await db.update(tBenevoles).set({ statut }).where(eq(tBenevoles.id, id));
}

export async function changerStatutSignalement(
  id: string,
  statut: typeof tSignalements.$inferSelect["statut"],
) {
  await db.update(tSignalements).set({ statut }).where(eq(tSignalements.id, id));
}
