import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  campagnes as tCampagnes,
  misesAJourCampagne as tMaj,
} from "@/db/schema";
import type { Campagne } from "@/types";

/** Transforme un titre en identifiant d'URL. */
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function slugLibre(
  table: typeof tCampagnes,
  base: string,
  idExistant?: string,
): Promise<string> {
  const racine = slugifier(base) || "sans-titre";
  let candidat = racine;
  let suffixe = 2;

  for (;;) {
    const [ligne] = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.slug, candidat))
      .limit(1);
    if (!ligne || ligne.id === idExistant) return candidat;
    candidat = `${racine}-${suffixe++}`;
  }
}




/* ------------------------------------------------------------------ */
/* Campagnes                                                           */
/* ------------------------------------------------------------------ */

export type SaisieCampagne = Omit<Campagne, "id" | "slug" | "animalSlug"> & {
  slug?: string;
  animalId?: string | null;
};

export async function enregistrerCampagne(
  saisie: SaisieCampagne,
  id?: string,
): Promise<string> {
  const slug = await slugLibre(tCampagnes, saisie.slug || saisie.titre, id);

  const valeurs = {
    slug,
    titre: saisie.titre,
    animalId: saisie.animalId ?? null,
    type: saisie.type,
    description: saisie.description,
    echeance: saisie.echeance,
    dateLimite: saisie.dateLimite ?? null,
    objectif: saisie.objectif,
    collecte: saisie.collecte,
    lienHelloAsso: saisie.lienHelloAsso ?? null,
    photoUrl: saisie.photo.src,
    photoAlt: saisie.photo.alt,
    statut: saisie.statut,
    ctaLabel: saisie.ctaLabel,
    remerciement: saisie.remerciement ?? null,
    afficherSurAccueil: saisie.afficherSurAccueil,
  };

  let campagneId = id;
  if (id) {
    await db.update(tCampagnes).set(valeurs).where(eq(tCampagnes.id, id));
  } else {
    const [ligne] = await db.insert(tCampagnes).values(valeurs).returning({ id: tCampagnes.id });
    campagneId = ligne.id;
  }

  if (campagneId) {
    await db.delete(tMaj).where(eq(tMaj.campagneId, campagneId));
    if (saisie.misesAJour.length > 0) {
      await db.insert(tMaj).values(
        saisie.misesAJour.map((m) => ({ campagneId, date: m.date, texte: m.texte })),
      );
    }
  }
  return slug;
}

export async function supprimerCampagne(id: string): Promise<void> {
  await db.delete(tCampagnes).where(eq(tCampagnes.id, id));
}

export async function campagneParSlug(slug: string) {
  const [ligne] = await db.select().from(tCampagnes).where(eq(tCampagnes.slug, slug)).limit(1);
  if (!ligne) return undefined;

  const misesAJour = await db.select().from(tMaj).where(eq(tMaj.campagneId, ligne.id));
  return { ...ligne, misesAJour };
}

