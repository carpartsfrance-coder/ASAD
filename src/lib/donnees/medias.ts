import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { medias } from "@/db/schema";

/**
 * Photothèque : images stockées en base.
 * L'adresse publique d'une image est `/media/<identifiant>`.
 */

/** Taille maximale acceptée après compression dans le navigateur. */
export const TAILLE_MAX_OCTETS = 4 * 1024 * 1024;

export const TYPES_ACCEPTES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export function urlMedia(id: string): string {
  return `/media/${id}`;
}

export async function enregistrerMedia(donnees: {
  contenu: Buffer;
  typeMime: string;
  nomFichier: string;
  alt: string;
  largeur?: number;
  hauteur?: number;
  televersePar?: string;
}): Promise<{ id: string; url: string }> {
  const [ligne] = await db
    .insert(medias)
    .values({
      donnees: donnees.contenu,
      typeMime: donnees.typeMime,
      nomFichier: donnees.nomFichier,
      alt: donnees.alt,
      largeur: donnees.largeur ?? null,
      hauteur: donnees.hauteur ?? null,
      taille: donnees.contenu.length,
      televersePar: donnees.televersePar ?? null,
    })
    .returning({ id: medias.id });

  return { id: ligne.id, url: urlMedia(ligne.id) };
}

/** Liste sans le binaire — inutile de charger les images pour les lister. */
export async function listerMedias() {
  return db
    .select({
      id: medias.id,
      url: medias.url,
      nomFichier: medias.nomFichier,
      typeMime: medias.typeMime,
      largeur: medias.largeur,
      hauteur: medias.hauteur,
      alt: medias.alt,
      taille: medias.taille,
      creeLe: medias.creeLe,
    })
    .from(medias)
    .orderBy(desc(medias.creeLe));
}

export async function supprimerMedia(id: string): Promise<void> {
  await db.delete(medias).where(eq(medias.id, id));
}

/** Poids total de la photothèque, en octets. */
export async function poidsPhototheque(): Promise<number> {
  const [ligne] = await db
    .select({ total: sql<number>`coalesce(sum(${medias.taille}), 0)::bigint` })
    .from(medias);
  return Number(ligne.total);
}
