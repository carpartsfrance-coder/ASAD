/**
 * Alimente la base avec le contenu de départ.
 *
 * Reprend ce qui vivait dans `src/content/*.ts` et le transfère en base : à
 * partir de là, c'est la base qui fait foi. Le script est idempotent — on peut
 * le relancer sans créer de doublons.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { animaux as animauxSource } from "./donnees-initiales/animaux";
import { campagnes as campagnesSource } from "./donnees-initiales/campagnes";
import { messagesLivreOr as livreOrSource } from "./donnees-initiales/livre-or";
import { statistiques } from "@/content/statistiques";
import { hero, sectionAnimaux, sectionAider, sectionTemoignage, sectionUrgences } from "@/content/accueil";
import { association, helloAsso, reseaux } from "@/content/site";

const client = postgres(process.env.DATABASE_URL ?? "", { prepare: false, max: 1 });
const db = drizzle(client, { schema });

/** Convertit une date « AAAA-MM-JJ » en horodatage, ou `null`. */
function horodatage(iso?: string): Date | null {
  return iso ? new Date(`${iso}T12:00:00Z`) : null;
}

async function semerAnimaux() {
  let crees = 0;
  const parSlug = new Map<string, string>();

  for (const a of animauxSource) {
    const valeurs = {
      slug: a.slug,
      nom: a.nom,
      espece: a.espece,
      especeAutre: a.especeAutre ?? null,
      sexe: a.sexe,
      race: a.race,
      age: a.age,
      ageMois: a.ageMois,
      dateNaissanceEstimee: a.dateNaissanceEstimee ?? null,
      identification: a.identification ?? null,
      nombreAnimauxPortee: a.nombreAnimauxPortee ?? null,
      taille: a.taille,
      poidsKg: a.poidsKg ?? null,
      commune: a.commune,
      descriptionCourte: a.descriptionCourte,
      histoire: a.histoire,
      caractere: a.caractere,
      caractereNote: a.caractereNote ?? null,
      compatChiens: a.compatChiens,
      compatChats: a.compatChats,
      compatEnfants: a.compatEnfants,
      compatNotes: a.compatNotes ?? {},
      identifie: a.sante.identifie,
      vaccine: a.sante.vaccine,
      sterilise: a.sante.sterilise,
      santeResume: a.sante.resume ?? null,
      traitement: a.sante.traitement ?? null,
      environnement: a.environnement,
      environnementPoints: a.environnementPoints,
      conditions: a.conditions,
      fraisAdoption: a.fraisAdoption,
      statut: a.statut,
      afficherSurAccueil: a.afficherSurAccueil,
      dateArrivee: a.dateArrivee,
      datePublication: a.datePublication,
      familleAccueil: a.familleAccueil ?? null,
      urgenceMotif: a.urgence?.motif ?? null,
      urgenceDelai: a.urgence?.delai ?? null,
      urgenceCtaLabel: a.urgence?.ctaLabel ?? null,
      reserveDepuis: a.reserveDepuis ?? null,
      adoptionDate: a.suiteAdoption?.date ?? null,
      adoptionFamille: a.suiteAdoption?.famille ?? null,
      adoptionRecit: a.suiteAdoption?.recit ?? null,
      adoptionCitation: a.suiteAdoption?.citation ?? null,
      adoptionPhotoUrl: a.suiteAdoption?.photo?.src ?? null,
      adoptionPhotoAlt: a.suiteAdoption?.photo?.alt ?? null,
    };

    const [ligne] = await db
      .insert(schema.animaux)
      .values(valeurs)
      .onConflictDoUpdate({ target: schema.animaux.slug, set: valeurs })
      .returning({ id: schema.animaux.id });

    parSlug.set(a.slug, ligne.id);

    // Les photos sont réécrites intégralement : l'ordre fait foi.
    await db.delete(schema.photosAnimaux).where(eq(schema.photosAnimaux.animalId, ligne.id));
    await db.insert(schema.photosAnimaux).values(
      a.galerie.map((photo, index) => ({
        animalId: ligne.id,
        url: photo.src,
        alt: photo.alt,
        position: index,
      })),
    );
    crees += 1;
  }

  console.log(`  ${crees} animaux`);
  return parSlug;
}

async function semerCampagnes(animauxParSlug: Map<string, string>) {
  for (const c of campagnesSource) {
    const valeurs = {
      slug: c.slug,
      titre: c.titre,
      animalId: c.animalSlug ? (animauxParSlug.get(c.animalSlug) ?? null) : null,
      type: c.type,
      description: c.description,
      echeance: c.echeance,
      dateLimite: c.dateLimite ?? null,
      objectif: c.objectif,
      collecte: c.collecte,
      lienHelloAsso: c.lienHelloAsso ?? null,
      photoUrl: c.photo.src,
      photoAlt: c.photo.alt,
      statut: c.statut,
      ctaLabel: c.ctaLabel,
      remerciement: c.remerciement ?? null,
      afficherSurAccueil: c.afficherSurAccueil,
    };

    const [ligne] = await db
      .insert(schema.campagnes)
      .values(valeurs)
      .onConflictDoUpdate({ target: schema.campagnes.slug, set: valeurs })
      .returning({ id: schema.campagnes.id });

    await db
      .delete(schema.misesAJourCampagne)
      .where(eq(schema.misesAJourCampagne.campagneId, ligne.id));

    if (c.misesAJour.length > 0) {
      await db.insert(schema.misesAJourCampagne).values(
        c.misesAJour.map((m) => ({ campagneId: ligne.id, date: m.date, texte: m.texte })),
      );
    }
  }
  console.log(`  ${campagnesSource.length} campagnes`);
}


async function semerLivreOr(animauxParSlug: Map<string, string>) {
  // Pas de clé naturelle : on ne sème que si la table est vide.
  const [{ nombre }] = await db
    .select({ nombre: sql<number>`count(*)::int` })
    .from(schema.messagesLivreOr);

  if (nombre > 0) {
    console.log(`  livre d’or déjà alimenté (${nombre} messages), ignoré`);
    return;
  }

  await db.insert(schema.messagesLivreOr).values(
    livreOrSource.map((m) => ({
      nomPublic: m.nomPublic,
      email: `${m.nomPublic.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      ville: m.ville ?? null,
      message: m.message,
      photoUrl: m.photo?.src ?? null,
      photoAlt: m.photo?.alt ?? null,
      animalId: m.animalSlug ? (animauxParSlug.get(m.animalSlug) ?? null) : null,
      animalNom: m.animalNom ?? null,
      reponsePublique: m.reponsePublique ?? null,
      statut: m.statut,
      creeLe: horodatage(m.date) ?? new Date(),
    })),
  );
  console.log(`  ${livreOrSource.length} messages de livre d’or`);
}

/** Textes et réglages que le back-office pourra modifier. */
async function semerContenu() {
  const entrees: Array<{ cle: string; rubrique: string; libelle: string; valeur: unknown }> = [
    { cle: "accueil.hero.surtitre", rubrique: "accueil", libelle: "Sur-titre du héro", valeur: hero.surtitre },
    { cle: "accueil.hero.titre", rubrique: "accueil", libelle: "Titre principal", valeur: hero.titre },
    { cle: "accueil.hero.chapo", rubrique: "accueil", libelle: "Phrase d’accroche", valeur: hero.chapo },
    { cle: "accueil.hero.photo", rubrique: "accueil", libelle: "Photo du héro", valeur: hero.photo },
    { cle: "accueil.animaux.titre", rubrique: "accueil", libelle: "Titre « Ils attendent une famille »", valeur: sectionAnimaux.titre },
    { cle: "accueil.animaux.sousTitre", rubrique: "accueil", libelle: "Sous-titre animaux", valeur: sectionAnimaux.sousTitre },
    { cle: "accueil.urgences.titre", rubrique: "accueil", libelle: "Titre urgences", valeur: sectionUrgences.titre },
    { cle: "accueil.urgences.chapo", rubrique: "accueil", libelle: "Chapô urgences", valeur: sectionUrgences.chapo },
    { cle: "accueil.aider.titre", rubrique: "accueil", libelle: "Titre « Nous aider »", valeur: sectionAider.titre },
    { cle: "accueil.temoignage.titre", rubrique: "accueil", libelle: "Titre témoignage", valeur: sectionTemoignage.titre },
    { cle: "accueil.statistiques", rubrique: "accueil", libelle: "Chiffres-clés", valeur: statistiques },

    { cle: "association.nom", rubrique: "coordonnees", libelle: "Nom de l’association", valeur: association.nom },
    { cle: "association.description", rubrique: "coordonnees", libelle: "Description", valeur: association.description },
    { cle: "association.email", rubrique: "coordonnees", libelle: "Adresse e-mail", valeur: association.email },
    { cle: "association.telephone", rubrique: "coordonnees", libelle: "Téléphone", valeur: association.telephone },
    { cle: "association.adresse", rubrique: "coordonnees", libelle: "Adresse postale", valeur: association.adresse },
    { cle: "association.rna", rubrique: "coordonnees", libelle: "Numéro RNA", valeur: association.rna },

    { cle: "liens.helloasso.don", rubrique: "liens", libelle: "HelloAsso — don", valeur: helloAsso.don },
    { cle: "liens.helloasso.urgence", rubrique: "liens", libelle: "HelloAsso — urgences", valeur: helloAsso.urgence },
    { cle: "liens.helloasso.adhesion", rubrique: "liens", libelle: "HelloAsso — adhésion", valeur: helloAsso.adhesion },
    { cle: "liens.helloasso.page", rubrique: "liens", libelle: "HelloAsso — page publique", valeur: helloAsso.page },
    { cle: "liens.facebook", rubrique: "liens", libelle: "Facebook", valeur: reseaux.facebook },
    { cle: "liens.instagram", rubrique: "liens", libelle: "Instagram", valeur: reseaux.instagram },
  ];

  for (const e of entrees) {
    await db
      .insert(schema.contenuSite)
      .values(e)
      .onConflictDoNothing({ target: schema.contenuSite.cle });
  }
  console.log(`  ${entrees.length} entrées de contenu`);
}

/** Reprend les comptes du fichier local, s'il en reste. */
async function reprendreComptes() {
  const { readFile } = await import("node:fs/promises");
  try {
    const brut = await readFile("data/utilisateurs.json", "utf8");
    const comptes = JSON.parse(brut) as Array<{
      nom: string;
      email: string;
      motDePasseHash: string;
      role: "admin" | "editeur" | "benevole";
      actif?: boolean;
    }>;

    for (const c of comptes) {
      await db
        .insert(schema.utilisateurs)
        .values({
          nom: c.nom,
          email: c.email.toLowerCase(),
          motDePasseHash: c.motDePasseHash,
          role: c.role,
          actif: c.actif !== false,
        })
        .onConflictDoNothing({ target: schema.utilisateurs.email });
    }
    if (comptes.length > 0) console.log(`  ${comptes.length} compte(s) repris depuis le fichier`);
  } catch {
    // Aucun fichier : les comptes seront créés par « npm run auth:demarrage ».
  }
}

async function main() {
  console.log("Alimentation de la base ASAD :");
  const animauxParSlug = await semerAnimaux();
  await semerCampagnes(animauxParSlug);
  await semerLivreOr(animauxParSlug);
  await semerContenu();
  await reprendreComptes();
  console.log("Terminé.");
  await client.end();
}

main().catch(async (erreur) => {
  console.error(erreur);
  await client.end();
  process.exit(1);
});
