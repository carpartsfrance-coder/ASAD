import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { animaux as tAnimaux, photosAnimaux as tPhotos } from "@/db/schema";
import type { Animal } from "@/types";

/** Données acceptées par l'éditeur de fiche. */
export type SaisieAnimal = Omit<
  Animal,
  "id" | "nbDemandes" | "photoPrincipale" | "galerie" | "sante" | "urgence" | "suiteAdoption"
> & {
  sante: Animal["sante"];
  galerie: Animal["galerie"];
  urgence?: Animal["urgence"];
  suiteAdoption?: Animal["suiteAdoption"];
};

/** Transforme un nom en identifiant d'URL. */
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Trouve un slug libre, en suffixant si nécessaire. */
export async function slugDisponible(base: string, idExistant?: string): Promise<string> {
  const racine = slugifier(base) || "animal";
  let candidat = racine;
  let suffixe = 2;

  for (;;) {
    const [ligne] = await db
      .select({ id: tAnimaux.id })
      .from(tAnimaux)
      .where(eq(tAnimaux.slug, candidat))
      .limit(1);

    if (!ligne || ligne.id === idExistant) return candidat;
    candidat = `${racine}-${suffixe++}`;
  }
}

function enColonnes(saisie: SaisieAnimal) {
  return {
    slug: saisie.slug,
    nom: saisie.nom,
    espece: saisie.espece,
    especeAutre: saisie.especeAutre ?? null,
    sexe: saisie.sexe,
    race: saisie.race,
    age: saisie.age,
    ageMois: saisie.ageMois,
    dateNaissanceEstimee: saisie.dateNaissanceEstimee ?? null,
    identification: saisie.identification ?? null,
    nombreAnimauxPortee: saisie.nombreAnimauxPortee ?? null,
    taille: saisie.taille,
    poidsKg: saisie.poidsKg ?? null,
    commune: saisie.commune,
    descriptionCourte: saisie.descriptionCourte,
    histoire: saisie.histoire,
    caractere: saisie.caractere,
    caractereNote: saisie.caractereNote ?? null,
    compatChiens: saisie.compatChiens,
    compatChats: saisie.compatChats,
    compatEnfants: saisie.compatEnfants,
    compatNotes: saisie.compatNotes ?? {},
    identifie: saisie.sante.identifie,
    vaccine: saisie.sante.vaccine,
    sterilise: saisie.sante.sterilise,
    santeResume: saisie.sante.resume ?? null,
    traitement: saisie.sante.traitement ?? null,
    environnement: saisie.environnement,
    environnementPoints: saisie.environnementPoints,
    conditions: saisie.conditions,
    fraisAdoption: saisie.fraisAdoption,
    statut: saisie.statut,
    afficherSurAccueil: saisie.afficherSurAccueil,
    dateArrivee: saisie.dateArrivee,
    datePublication: saisie.datePublication,
    familleAccueil: saisie.familleAccueil ?? null,
    urgenceMotif: saisie.urgence?.motif ?? null,
    urgenceDelai: saisie.urgence?.delai ?? null,
    urgenceCtaLabel: saisie.urgence?.ctaLabel ?? null,
    reserveDepuis: saisie.reserveDepuis ?? null,
    adoptionDate: saisie.suiteAdoption?.date ?? null,
    adoptionFamille: saisie.suiteAdoption?.famille ?? null,
    adoptionRecit: saisie.suiteAdoption?.recit ?? null,
    adoptionCitation: saisie.suiteAdoption?.citation ?? null,
    adoptionPhotoUrl: saisie.suiteAdoption?.photo?.src ?? null,
    adoptionPhotoAlt: saisie.suiteAdoption?.photo?.alt ?? null,
    modifieLe: new Date(),
  };
}

/** Réécrit la galerie : l'ordre des photos fait foi. */
async function remplacerPhotos(animalId: string, galerie: Animal["galerie"]) {
  await db.delete(tPhotos).where(eq(tPhotos.animalId, animalId));

  const valides = galerie.filter((p) => p.src.trim() !== "");
  if (valides.length === 0) return;

  await db.insert(tPhotos).values(
    valides.map((photo, index) => ({
      animalId,
      url: photo.src.trim(),
      alt: photo.alt.trim(),
      position: index,
    })),
  );
}

export async function creerAnimal(saisie: SaisieAnimal): Promise<string> {
  const [ligne] = await db
    .insert(tAnimaux)
    .values(enColonnes(saisie))
    .returning({ id: tAnimaux.id, slug: tAnimaux.slug });

  await remplacerPhotos(ligne.id, saisie.galerie);
  return ligne.slug;
}

export async function modifierAnimal(id: string, saisie: SaisieAnimal): Promise<string> {
  await db.update(tAnimaux).set(enColonnes(saisie)).where(eq(tAnimaux.id, id));
  await remplacerPhotos(id, saisie.galerie);
  return saisie.slug;
}

/**
 * Une fiche adoptée n'est jamais supprimée : elle bascule en « adopte ».
 * La suppression n'est proposée que pour les brouillons.
 */
export async function supprimerAnimal(id: string): Promise<void> {
  await db.delete(tAnimaux).where(eq(tAnimaux.id, id));
}

export async function changerStatutAnimal(
  id: string,
  statut: Animal["statut"],
): Promise<void> {
  await db
    .update(tAnimaux)
    .set({ statut, modifieLe: new Date() })
    .where(eq(tAnimaux.id, id));
}
