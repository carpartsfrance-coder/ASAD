import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  animaux,
  campagnes,
  contenuSite,
  photosAnimaux,
} from "@/db/schema";

/**
 * Textes et réglages modifiables depuis le back-office.
 *
 * Une ligne par clé. La valeur est libre : chaîne, nombre ou objet. Les pages
 * publiques lisent ces valeurs via `valeurContenu`, avec un repli sur la
 * constante du code si la clé n'existe pas encore.
 */

export async function entreesParRubrique(rubrique: string) {
  return db
    .select()
    .from(contenuSite)
    .where(eq(contenuSite.rubrique, rubrique))
    .orderBy(asc(contenuSite.cle));
}

export async function toutesLesEntrees() {
  return db.select().from(contenuSite).orderBy(asc(contenuSite.rubrique), asc(contenuSite.cle));
}

/** Lit une valeur, avec repli sur la valeur fournie par le code. */
export async function valeurContenu<T>(cle: string, repli: T): Promise<T> {
  try {
    const [ligne] = await db
      .select({ valeur: contenuSite.valeur })
      .from(contenuSite)
      .where(eq(contenuSite.cle, cle))
      .limit(1);
    return ligne ? (ligne.valeur as T) : repli;
  } catch {
    return repli;
  }
}

export async function enregistrerValeur(cle: string, valeur: unknown): Promise<void> {
  await db
    .update(contenuSite)
    .set({ valeur, modifieLe: new Date() })
    .where(eq(contenuSite.cle, cle));
}

/** Toutes les images référencées dans la base — rubrique « Médias ». */
export async function mediasUtilises(): Promise<
  Array<{ url: string; usage: string; contexte: string }>
> {
  const [photos, animauxLignes, campagnesLignes] = await Promise.all([
    db.select({ url: photosAnimaux.url, nom: animaux.nom })
      .from(photosAnimaux)
      .innerJoin(animaux, eq(photosAnimaux.animalId, animaux.id)),
    db.select({ url: animaux.adoptionPhotoUrl, nom: animaux.nom }).from(animaux),
    db.select({ url: campagnes.photoUrl, nom: campagnes.titre }).from(campagnes),
  ]);

  const resultat: Array<{ url: string; usage: string; contexte: string }> = [];
  const vu = new Set<string>();

  const ajouter = (url: string | null, usage: string, contexte: string) => {
    if (!url) return;
    const cle = `${url}|${usage}|${contexte}`;
    if (vu.has(cle)) return;
    vu.add(cle);
    resultat.push({ url, usage, contexte });
  };

  photos.forEach((p) => ajouter(p.url, "Fiche animal", p.nom));
  animauxLignes.forEach((a) => ajouter(a.url, "Adoption", a.nom));
  campagnesLignes.forEach((c) => ajouter(c.url, "Collecte", c.nom));

  return resultat.sort((a, b) => a.url.localeCompare(b.url));
}
