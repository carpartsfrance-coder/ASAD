import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { animaux as tAnimaux, photosAnimaux as tPhotos } from "@/db/schema";
import type { Animal, Photo, StatutAnimal } from "@/types";

/**
 * Lecture des fiches animaux.
 *
 * Seul point d'accès aux données : les composants ne connaissent que le type
 * `Animal`, jamais le schéma de la base.
 */

type LigneAnimal = typeof tAnimaux.$inferSelect;
type LignePhoto = typeof tPhotos.$inferSelect;

const PHOTO_DEFAUT: Photo = {
  src: "/images/animaux/oslo-1.jpg",
  alt: "Photo à venir",
};

/** Assemble une ligne de base et ses photos en objet métier. */
function enAnimal(ligne: LigneAnimal, photos: LignePhoto[]): Animal {
  const galerie: Photo[] = photos
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ src: p.url, alt: p.alt }));

  return {
    id: ligne.id,
    slug: ligne.slug,
    nom: ligne.nom,
    espece: ligne.espece,
    especeAutre: ligne.especeAutre ?? undefined,
    sexe: ligne.sexe,
    race: ligne.race,
    age: ligne.age,
    ageMois: ligne.ageMois,
    dateNaissanceEstimee: ligne.dateNaissanceEstimee ?? undefined,
    identification: ligne.identification ?? undefined,
    nombreAnimauxPortee: ligne.nombreAnimauxPortee ?? undefined,
    taille: ligne.taille,
    poidsKg: ligne.poidsKg ?? undefined,
    commune: ligne.commune,
    photoPrincipale: galerie[0] ?? PHOTO_DEFAUT,
    galerie: galerie.length > 0 ? galerie : [PHOTO_DEFAUT],
    descriptionCourte: ligne.descriptionCourte,
    histoire: ligne.histoire,
    caractere: ligne.caractere,
    caractereNote: ligne.caractereNote ?? undefined,
    compatChiens: ligne.compatChiens,
    compatChats: ligne.compatChats,
    compatEnfants: ligne.compatEnfants,
    compatNotes: ligne.compatNotes,
    sante: {
      identifie: ligne.identifie,
      vaccine: ligne.vaccine,
      sterilise: ligne.sterilise,
      resume: ligne.santeResume ?? undefined,
      traitement: ligne.traitement ?? undefined,
    },
    environnement: ligne.environnement,
    environnementPoints: ligne.environnementPoints,
    conditions: ligne.conditions,
    fraisAdoption: ligne.fraisAdoption,
    statut: ligne.statut,
    afficherSurAccueil: ligne.afficherSurAccueil,
    dateArrivee: ligne.dateArrivee,
    datePublication: ligne.datePublication,
    nbDemandes: 0,
    familleAccueil: ligne.familleAccueil ?? undefined,
    urgence: ligne.urgenceMotif
      ? {
          motif: ligne.urgenceMotif,
          delai: ligne.urgenceDelai ?? "",
          ctaLabel: ligne.urgenceCtaLabel ?? `Aider ${ligne.nom}`,
        }
      : undefined,
    reserveDepuis: ligne.reserveDepuis ?? undefined,
    suiteAdoption: ligne.adoptionRecit
      ? {
          date: ligne.adoptionDate ?? "",
          famille: ligne.adoptionFamille ?? "",
          recit: ligne.adoptionRecit,
          citation: ligne.adoptionCitation ?? undefined,
          photo: ligne.adoptionPhotoUrl
            ? { src: ligne.adoptionPhotoUrl, alt: ligne.adoptionPhotoAlt ?? "" }
            : undefined,
        }
      : undefined,
  };
}

/** Charge les photos de plusieurs animaux en une requête. */
async function photosDe(ids: string[]): Promise<Map<string, LignePhoto[]>> {
  const carte = new Map<string, LignePhoto[]>();
  if (ids.length === 0) return carte;

  const lignes = await db
    .select()
    .from(tPhotos)
    .where(sql`${tPhotos.animalId} in ${sql.raw(`(${ids.map((id) => `'${id}'`).join(",")})`)}`)
    .orderBy(asc(tPhotos.position));

  for (const photo of lignes) {
    const liste = carte.get(photo.animalId) ?? [];
    liste.push(photo);
    carte.set(photo.animalId, liste);
  }
  return carte;
}

async function assembler(lignes: LigneAnimal[]): Promise<Animal[]> {
  const photos = await photosDe(lignes.map((l) => l.id));
  return lignes.map((ligne) => enAnimal(ligne, photos.get(ligne.id) ?? []));
}

/* ------------------------------------------------------------------ */
/* Lecture publique                                                    */
/* ------------------------------------------------------------------ */

/** Fiches visibles du public : tout sauf les brouillons. */
export async function animauxPublies(): Promise<Animal[]> {
  const lignes = await db
    .select()
    .from(tAnimaux)
    .where(ne(tAnimaux.statut, "brouillon"))
    .orderBy(desc(tAnimaux.datePublication));

  return assembler(lignes);
}

/** Animaux que l'on peut adopter dès maintenant. */
export async function animauxDisponibles(): Promise<Animal[]> {
  const lignes = await db
    .select()
    .from(tAnimaux)
    .where(sql`${tAnimaux.statut} in ('a_adopter','urgent')`)
    .orderBy(desc(tAnimaux.datePublication));

  return assembler(lignes);
}

export async function animauxUrgents(limite?: number): Promise<Animal[]> {
  const requete = db
    .select()
    .from(tAnimaux)
    .where(eq(tAnimaux.statut, "urgent"))
    .orderBy(desc(tAnimaux.datePublication));

  const lignes = limite ? await requete.limit(limite) : await requete;
  return assembler(lignes);
}

/** Sélection de la page d'accueil : les fiches mises en avant d'abord. */
export async function animauxAccueil(limite = 3): Promise<Animal[]> {
  const lignes = await db
    .select()
    .from(tAnimaux)
    .where(eq(tAnimaux.statut, "a_adopter"))
    .orderBy(desc(tAnimaux.afficherSurAccueil), desc(tAnimaux.datePublication))
    .limit(limite);

  return assembler(lignes);
}

export async function urgencesAccueil(limite = 3): Promise<Animal[]> {
  return animauxUrgents(limite);
}

export async function animalParSlug(slug: string): Promise<Animal | undefined> {
  const [ligne] = await db
    .select()
    .from(tAnimaux)
    .where(and(eq(tAnimaux.slug, slug), ne(tAnimaux.statut, "brouillon")))
    .limit(1);

  if (!ligne) return undefined;

  const photos = await db
    .select()
    .from(tPhotos)
    .where(eq(tPhotos.animalId, ligne.id))
    .orderBy(asc(tPhotos.position));

  return enAnimal(ligne, photos);
}

/** Suggestions affichées en bas d'une fiche : même espèce en priorité. */
export async function animauxSimilaires(animal: Animal, limite = 3): Promise<Animal[]> {
  const lignes = await db
    .select()
    .from(tAnimaux)
    .where(
      and(
        sql`${tAnimaux.statut} in ('a_adopter','urgent')`,
        ne(tAnimaux.slug, animal.slug),
      ),
    )
    .orderBy(
      sql`case when ${tAnimaux.espece} = ${animal.espece} then 0 else 1 end`,
      desc(tAnimaux.datePublication),
    )
    .limit(limite);

  return assembler(lignes);
}

/** Tous les slugs publiés — sert au sitemap. */
export async function slugsAnimaux(): Promise<string[]> {
  const lignes = await db
    .select({ slug: tAnimaux.slug })
    .from(tAnimaux)
    .where(ne(tAnimaux.statut, "brouillon"));

  return lignes.map((l) => l.slug);
}

/* ------------------------------------------------------------------ */
/* Lecture back-office                                                 */
/* ------------------------------------------------------------------ */

/** Toutes les fiches, brouillons compris. */
export async function toutesLesFiches(): Promise<Animal[]> {
  const lignes = await db.select().from(tAnimaux).orderBy(desc(tAnimaux.modifieLe));
  return assembler(lignes);
}

/** Fiche par slug, brouillons compris — pour l'éditeur. */
export async function ficheParSlug(slug: string): Promise<Animal | undefined> {
  const [ligne] = await db.select().from(tAnimaux).where(eq(tAnimaux.slug, slug)).limit(1);
  if (!ligne) return undefined;

  const photos = await db
    .select()
    .from(tPhotos)
    .where(eq(tPhotos.animalId, ligne.id))
    .orderBy(asc(tPhotos.position));

  return enAnimal(ligne, photos);
}

/** Compte les fiches par statut — indicateurs du tableau de bord. */
export async function compterParStatut(): Promise<Record<StatutAnimal, number>> {
  const lignes = await db
    .select({ statut: tAnimaux.statut, nombre: sql<number>`count(*)::int` })
    .from(tAnimaux)
    .groupBy(tAnimaux.statut);

  const compte: Record<StatutAnimal, number> = {
    brouillon: 0,
    a_adopter: 0,
    urgent: 0,
    reserve: 0,
    adopte: 0,
  };
  for (const ligne of lignes) compte[ligne.statut] = ligne.nombre;
  return compte;
}
