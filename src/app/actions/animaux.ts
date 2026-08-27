"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import {
  changerStatutAnimal,
  creerAnimal,
  modifierAnimal,
  slugDisponible,
  supprimerAnimal,
  type SaisieAnimal,
} from "@/lib/donnees/animaux-ecriture";
import { ficheParSlug } from "@/lib/donnees/animaux";
import { routes } from "@/content/site";
import type { EtatFormulaire } from "@/lib/etat-formulaire";
import { moisDepuisAge } from "@/lib/age";
import type { Compat, Espece, Sexe, StatutAnimal, Taille } from "@/types";

/**
 * Écriture des fiches animaux.
 *
 * Chaque action revérifie les droits : une action serveur est une porte
 * d'entrée publique, l'interface qui la déclenche n'est pas une protection.
 */

const ESPECES: Espece[] = ["chien", "chat", "autre"];
const SEXES: Sexe[] = ["male", "femelle"];
const TAILLES: Taille[] = ["petit", "moyen", "grand"];
const COMPATS: Compat[] = ["oui", "non", "a_tester", "avec_conditions"];
const STATUTS: StatutAnimal[] = ["brouillon", "a_adopter", "urgent", "reserve", "adopte"];

function texte(data: FormData, nom: string): string {
  const valeur = data.get(nom);
  return typeof valeur === "string" ? valeur.trim() : "";
}

function nombre(data: FormData, nom: string): number {
  const valeur = Number(texte(data, nom).replace(",", "."));
  return Number.isFinite(valeur) ? valeur : 0;
}

function coche(data: FormData, nom: string): boolean {
  return data.get(nom) != null;
}

/** Une ligne par élément — format de saisie le plus simple pour une liste. */
function lignes(data: FormData, nom: string): string[] {
  return texte(data, nom)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function choix<T extends string>(data: FormData, nom: string, valides: T[], defaut: T): T {
  const valeur = texte(data, nom) as T;
  return valides.includes(valeur) ? valeur : defaut;
}

/** Aujourd'hui au format AAAA-MM-JJ. */
function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

async function construireSaisie(
  data: FormData,
  idExistant?: string,
): Promise<{ saisie: SaisieAnimal | null; erreurs: Record<string, string> }> {
  const erreurs: Record<string, string> = {};

  const nom = texte(data, "nom");
  if (nom.length < 2) erreurs.nom = "Le nom est obligatoire.";

  const age = texte(data, "age");
  if (!age) erreurs.age = "L’âge est obligatoire — par exemple « 3 ans ».";

  const commune = texte(data, "commune");
  if (!commune) erreurs.commune = "La commune est obligatoire.";

  const statut = choix(data, "statut", STATUTS, "brouillon");

  // Une fiche publiée doit être présentable.
  if (statut !== "brouillon") {
    if (!texte(data, "descriptionCourte")) {
      erreurs.descriptionCourte =
        "La description est obligatoire pour publier la fiche.";
    }
    if (lignes(data, "galerie").length === 0) {
      erreurs.galerie = "Ajoutez au moins une photo pour publier la fiche.";
    }
  }

  if (Object.keys(erreurs).length > 0) return { saisie: null, erreurs };

  const slug = await slugDisponible(texte(data, "slug") || nom, idExistant);

  const urlsPhotos = lignes(data, "galerie");
  const altsPhotos = lignes(data, "galerieAlt");

  const saisie: SaisieAnimal = {
    slug,
    nom,
    espece: choix(data, "espece", ESPECES, "chien"),
    especeAutre: texte(data, "especeAutre") || undefined,
    sexe: choix(data, "sexe", SEXES, "male"),
    race: texte(data, "race") || null,
    // Calculé depuis « Âge affiché » : ce champ n'est plus saisi à la main.
    ageMois: moisDepuisAge(texte(data, "age")),
    age,
    dateNaissanceEstimee: texte(data, "dateNaissanceEstimee") || undefined,
    nombreAnimauxPortee: nombre(data, "nombreAnimauxPortee") || undefined,
    taille: choix(data, "taille", TAILLES, "moyen"),
    poidsKg: nombre(data, "poidsKg") || undefined,
    commune,
    descriptionCourte: texte(data, "descriptionCourte"),
    histoire: lignes(data, "histoire"),
    caractere: texte(data, "caractere")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    caractereNote: texte(data, "caractereNote") || undefined,
    compatChiens: choix(data, "compatChiens", COMPATS, "a_tester"),
    compatChats: choix(data, "compatChats", COMPATS, "a_tester"),
    compatEnfants: choix(data, "compatEnfants", COMPATS, "a_tester"),
    compatNotes: {
      chiens: texte(data, "compatNoteChiens") || undefined,
      chats: texte(data, "compatNoteChats") || undefined,
      enfants: texte(data, "compatNoteEnfants") || undefined,
    },
    sante: {
      identifie: coche(data, "identifie"),
      vaccine: coche(data, "vaccine"),
      sterilise: coche(data, "sterilise"),
      resume: texte(data, "santeResume") || undefined,
      traitement: texte(data, "traitement") || undefined,
    },
    environnement: texte(data, "environnement"),
    environnementPoints: lignes(data, "environnementPoints"),
    conditions: lignes(data, "conditions").map((ligne) => {
      const [titre, ...reste] = ligne.split("|");
      return { titre: titre.trim(), texte: reste.join("|").trim() };
    }),
    fraisAdoption: Math.max(0, Math.round(nombre(data, "fraisAdoption"))),
    statut,
    afficherSurAccueil: coche(data, "afficherSurAccueil"),
    dateArrivee: texte(data, "dateArrivee") || aujourdhui(),
    datePublication: texte(data, "datePublication") || aujourdhui(),
    familleAccueil: texte(data, "familleAccueil") || undefined,
    galerie: urlsPhotos.map((url, index) => ({
      src: url,
      alt: altsPhotos[index] ?? `${nom} — photo ${index + 1}`,
    })),
    urgence:
      statut === "urgent"
        ? {
            motif: texte(data, "urgenceMotif"),
            delai: texte(data, "urgenceDelai"),
            ctaLabel: texte(data, "urgenceCtaLabel") || `Aider ${nom}`,
          }
        : undefined,
    reserveDepuis: statut === "reserve" ? texte(data, "reserveDepuis") || aujourdhui() : undefined,
    suiteAdoption:
      statut === "adopte" && texte(data, "adoptionRecit")
        ? {
            date: texte(data, "adoptionDate") || aujourdhui(),
            famille: texte(data, "adoptionFamille"),
            recit: texte(data, "adoptionRecit"),
            citation: texte(data, "adoptionCitation") || undefined,
            photo: texte(data, "adoptionPhotoUrl")
              ? {
                  src: texte(data, "adoptionPhotoUrl"),
                  alt: texte(data, "adoptionPhotoAlt") || nom,
                }
              : undefined,
          }
        : undefined,
  };

  return { saisie, erreurs };
}

/** Rafraîchit les pages publiques concernées. */
function rafraichir(slug?: string) {
  revalidatePath("/");
  revalidatePath(routes.animaux);
  revalidatePath(routes.urgences);
  if (slug) revalidatePath(routes.animal(slug));
}

export async function enregistrerFiche(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerCapacite("animaux:ecrire", "Animaux");

  const id = texte(data, "id") || undefined;
  const { saisie, erreurs } = await construireSaisie(data, id);

  if (!saisie) {
    return {
      statut: "erreur",
      message: "Certaines informations sont manquantes ou incorrectes.",
      erreurs,
    };
  }

  try {
    const slug = id ? await modifierAnimal(id, saisie) : await creerAnimal(saisie);

    await consigner(
      utilisateur.id,
      utilisateur.nom,
      id
        ? `a modifié la fiche de ${saisie.nom}`
        : `a créé la fiche de ${saisie.nom}`,
    );

    rafraichir(slug);
    revalidatePath(routes.adminAnimaux);

    redirect(`${routes.adminAnimaux}/${slug}?enregistre=1`);
  } catch (erreur) {
    // `redirect` lève une exception de contrôle : on la laisse remonter.
    if (erreur && typeof erreur === "object" && "digest" in erreur) throw erreur;

    console.error("[ASAD] Fiche non enregistrée", erreur);
    return {
      statut: "erreur",
      message: "La fiche n’a pas pu être enregistrée. Réessayez.",
    };
  }
}

/** Changement de statut depuis la liste — publier, réserver, archiver. */
export async function changerStatut(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("animaux:ecrire", "Animaux");

  const id = texte(data, "id");
  const slug = texte(data, "slug");
  const statut = choix(data, "statut", STATUTS, "brouillon");
  if (!id) return;

  /**
   * Publier depuis la liste ne doit pas contourner les contrôles du
   * formulaire : une fiche incomplète reste en brouillon, et on renvoie la
   * bénévole vers l'éditeur, où le panneau « Avant de publier » dit ce qui
   * manque.
   */
  if (statut !== "brouillon" && slug) {
    const fiche = await ficheParSlug(slug);
    const incomplete =
      !fiche ||
      !fiche.descriptionCourte ||
      fiche.galerie.length === 0;

    if (incomplete) {
      redirect(`${routes.adminAnimaux}/${slug}`);
    }
  }

  await changerStatutAnimal(id, statut);
  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `a passé la fiche « ${texte(data, "nom") || slug} » en « ${statut.replace("_", " ")} »`,
  );

  rafraichir(slug);
  revalidatePath(routes.adminAnimaux);
}

/** Suppression — réservée aux brouillons : une fiche adoptée reste en ligne. */
export async function supprimerFiche(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("animaux:ecrire", "Animaux");

  const slug = texte(data, "slug");
  const fiche = slug ? await ficheParSlug(slug) : undefined;

  if (!fiche || fiche.statut !== "brouillon") return;

  await supprimerAnimal(fiche.id);
  await consigner(utilisateur.id, utilisateur.nom, `a supprimé le brouillon « ${fiche.nom} »`);

  revalidatePath(routes.adminAnimaux);
  redirect(`${routes.adminAnimaux}?supprime=1`);
}
