import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  animaux as tAnimaux,
  campagnes as tCampagnes,
  misesAJourCampagne as tMisesAJour,
} from "@/db/schema";
import type { Campagne } from "@/types";





/* ------------------------------------------------------------------ */
/* Campagnes d'urgence                                                 */
/* ------------------------------------------------------------------ */

async function enCampagne(
  ligne: typeof tCampagnes.$inferSelect & { animalSlug?: string | null },
): Promise<Campagne> {
  const misesAJour = await db
    .select()
    .from(tMisesAJour)
    .where(eq(tMisesAJour.campagneId, ligne.id))
    .orderBy(desc(tMisesAJour.date));

  return {
    id: ligne.id,
    slug: ligne.slug,
    titre: ligne.titre,
    animalSlug: ligne.animalSlug ?? undefined,
    type: ligne.type,
    description: ligne.description,
    echeance: ligne.echeance,
    dateLimite: ligne.dateLimite ?? undefined,
    objectif: ligne.objectif,
    collecte: ligne.collecte,
    lienHelloAsso: ligne.lienHelloAsso ?? undefined,
    photo: { src: ligne.photoUrl, alt: ligne.photoAlt },
    statut: ligne.statut,
    ctaLabel: ligne.ctaLabel,
    remerciement: ligne.remerciement ?? undefined,
    misesAJour: misesAJour.map((m) => ({ date: m.date, texte: m.texte })),
    afficherSurAccueil: ligne.afficherSurAccueil,
  };
}

export async function toutesLesCampagnes(): Promise<Campagne[]> {
  const lignes = await db
    .select({
      id: tCampagnes.id,
      slug: tCampagnes.slug,
      titre: tCampagnes.titre,
      animalId: tCampagnes.animalId,
      type: tCampagnes.type,
      description: tCampagnes.description,
      echeance: tCampagnes.echeance,
      dateLimite: tCampagnes.dateLimite,
      objectif: tCampagnes.objectif,
      collecte: tCampagnes.collecte,
      lienHelloAsso: tCampagnes.lienHelloAsso,
      photoUrl: tCampagnes.photoUrl,
      photoAlt: tCampagnes.photoAlt,
      statut: tCampagnes.statut,
      ctaLabel: tCampagnes.ctaLabel,
      remerciement: tCampagnes.remerciement,
      afficherSurAccueil: tCampagnes.afficherSurAccueil,
      creeLe: tCampagnes.creeLe,
      animalSlug: tAnimaux.slug,
    })
    .from(tCampagnes)
    .leftJoin(tAnimaux, eq(tCampagnes.animalId, tAnimaux.id))
    .orderBy(tCampagnes.statut, desc(tCampagnes.creeLe));

  return Promise.all(lignes.map(enCampagne));
}

export async function campagnesActives(): Promise<Campagne[]> {
  return (await toutesLesCampagnes()).filter((c) => c.statut === "active");
}
