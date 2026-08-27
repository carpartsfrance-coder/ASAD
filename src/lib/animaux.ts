import type { Animal, Compat, Espece, Sexe, StatutAnimal, Taille } from "@/types";

/**
 * Fonctions pures : libellés, filtres, tri.
 *
 * Aucune lecture de données ici — celle-ci passe par `lib/donnees/animaux.ts`,
 * qui interroge la base. Ce module reste utilisable côté client.
 */

/* ------------------------------------------------------------------ */
/* Libellés d'affichage                                                */
/* ------------------------------------------------------------------ */

export const libelleEspece: Record<Espece, string> = {
  chien: "Chien",
  chat: "Chat",
  autre: "Autre",
};

/** Forme accordée au sexe : « Chien » / « Chienne ». */
export function libelleEspeceAccordee(animal: Animal): string {
  if (animal.espece === "autre") return animal.especeAutre ?? "Autre";
  if (animal.espece === "chien") return animal.sexe === "femelle" ? "Chienne" : "Chien";
  return animal.sexe === "femelle" ? "Chatte" : "Chat";
}

export const libelleSexe: Record<Sexe, string> = {
  male: "Mâle",
  femelle: "Femelle",
};

export const libelleTaille: Record<Taille, string> = {
  petit: "Petit",
  moyen: "Moyen",
  grand: "Grand",
};

export const libelleStatut: Record<StatutAnimal, string> = {
  brouillon: "Brouillon",
  a_adopter: "À adopter",
  urgent: "Urgent",
  reserve: "Réservé",
  adopte: "Adopté",
};

export const libelleCompat: Record<Compat, string> = {
  oui: "Oui",
  non: "Non",
  a_tester: "À tester",
  avec_conditions: "Avec conditions",
};

/** Sous-titre « Chien, 3 ans » affiché à côté du nom. */
export function sousTitreAnimal(animal: Animal): string {
  return `${libelleEspeceAccordee(animal)}, ${animal.age}`;
}

/** Mention de race conforme au code rural : `null` ⇒ formule explicite. */
export function libelleRace(animal: Animal): string {
  return animal.race ?? "Non précisée";
}

/** Résumé de santé affiché dans les informations rapides. */
export function resumeSante(animal: Animal): string {
  const acquis: string[] = [];
  if (animal.sante.identifie) acquis.push("Identifié");
  if (animal.sante.vaccine) acquis.push("Vacciné");
  if (animal.sante.sterilise) acquis.push("Stérilisé");
  return acquis.length > 0 ? acquis.join(" · ") : "À compléter";
}

/* ------------------------------------------------------------------ */
/* Filtres et tri du catalogue                                         */
/* ------------------------------------------------------------------ */

export type TrancheAge = "junior" | "adulte" | "senior";

export const libelleTrancheAge: Record<TrancheAge, string> = {
  junior: "Moins de 2 ans",
  adulte: "2 à 7 ans",
  senior: "7 ans et plus",
};

export function trancheAge(animal: Animal): TrancheAge {
  if (animal.ageMois < 24) return "junior";
  if (animal.ageMois < 84) return "adulte";
  return "senior";
}

/** Filtre « Compatibilité » du catalogue : avec qui l'animal peut vivre. */
export type FiltreCompat = "chiens" | "chats" | "enfants";

export const libelleFiltreCompat: Record<FiltreCompat, string> = {
  chiens: "Avec des chiens",
  chats: "Avec des chats",
  enfants: "Avec des enfants",
};

export type TriCatalogue = "recents" | "anciens" | "nom";

export const libelleTri: Record<TriCatalogue, string> = {
  recents: "Plus récents",
  anciens: "Plus anciens",
  nom: "Ordre alphabétique",
};

export interface FiltresAnimaux {
  espece: Espece | "toutes";
  sexe: Sexe | "tous";
  age: TrancheAge | "tous";
  taille: Taille | "toutes";
  compatibilite: FiltreCompat | "toutes";
  statut: StatutAnimal | "tous";
  recherche: string;
  tri: TriCatalogue;
}

export const FILTRES_VIDES: FiltresAnimaux = {
  espece: "toutes",
  sexe: "tous",
  age: "tous",
  taille: "toutes",
  compatibilite: "toutes",
  statut: "tous",
  recherche: "",
  tri: "recents",
};

/** Clés réellement filtrantes (le tri n'en fait pas partie). */
export const CLES_FILTRES = [
  "espece",
  "sexe",
  "age",
  "taille",
  "compatibilite",
  "statut",
  "recherche",
] as const;

function compatOk(animal: Animal, cible: FiltreCompat): boolean {
  const valeur =
    cible === "chiens"
      ? animal.compatChiens
      : cible === "chats"
        ? animal.compatChats
        : animal.compatEnfants;
  return valeur === "oui" || valeur === "avec_conditions";
}

export function filtrerAnimaux(
  liste: Animal[],
  filtres: FiltresAnimaux,
): Animal[] {
  const recherche = filtres.recherche.trim().toLowerCase();

  const resultats = liste.filter((animal) => {
    if (filtres.espece !== "toutes" && animal.espece !== filtres.espece) return false;
    if (filtres.sexe !== "tous" && animal.sexe !== filtres.sexe) return false;
    if (filtres.age !== "tous" && trancheAge(animal) !== filtres.age) return false;
    if (filtres.taille !== "toutes" && animal.taille !== filtres.taille) return false;
    if (filtres.statut !== "tous" && animal.statut !== filtres.statut) return false;
    if (filtres.compatibilite !== "toutes" && !compatOk(animal, filtres.compatibilite)) {
      return false;
    }
    if (recherche) {
      const champs = [
        animal.nom,
        animal.race ?? "",
        animal.commune,
        animal.descriptionCourte,
        ...animal.caractere,
      ]
        .join(" ")
        .toLowerCase();
      if (!champs.includes(recherche)) return false;
    }
    return true;
  });

  return trierAnimaux(resultats, filtres.tri);
}

export function trierAnimaux(liste: Animal[], tri: TriCatalogue): Animal[] {
  const copie = [...liste];
  if (tri === "nom") {
    return copie.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }
  return copie.sort((a, b) =>
    tri === "recents"
      ? b.datePublication.localeCompare(a.datePublication)
      : a.datePublication.localeCompare(b.datePublication),
  );
}

/** Nombre de filtres actifs, hors tri — pilote l'affichage de « Réinitialiser ». */
export function compterFiltresActifs(filtres: FiltresAnimaux): number {
  return CLES_FILTRES.filter((cle) => filtres[cle] !== FILTRES_VIDES[cle]).length;
}

