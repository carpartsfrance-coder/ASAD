import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { journalActivite } from "@/db/schema";

/**
 * Journal d'activité du back-office.
 * Sert à savoir qui a fait quoi, sans avoir à demander.
 */
export async function dernieresActivites(limite = 6) {
  return db
    .select()
    .from(journalActivite)
    .orderBy(desc(journalActivite.creeLe))
    .limit(limite);
}

/** Consigne une action. N'échoue jamais : le journal ne doit rien bloquer. */
export async function consigner(
  auteurId: string | null,
  auteurNom: string,
  texte: string,
): Promise<void> {
  try {
    await db.insert(journalActivite).values({ auteurId, auteurNom, texte });
  } catch (erreur) {
    console.error("[ASAD] Journal non écrit", erreur);
  }
}
