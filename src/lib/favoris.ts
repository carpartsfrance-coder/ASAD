/**
 * Petit magasin des « coups de cœur », persisté dans le navigateur.
 *
 * Exposé sous forme d'un magasin externe (`useSyncExternalStore`) : l'état est
 * partagé entre toutes les cartes affichées et reste synchronisé d'un onglet à
 * l'autre, sans effet de bord au montage.
 */
const CLE_STOCKAGE = "asad:favoris";

const abonnes = new Set<() => void>();

function lireBrut(): string {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) ?? "[]";
  } catch {
    // Stockage indisponible (navigation privée, cookies bloqués).
    return "[]";
  }
}

function prevenir(): void {
  abonnes.forEach((rappel) => rappel());
}

export function sAbonnerAuxFavoris(rappel: () => void): () => void {
  abonnes.add(rappel);
  window.addEventListener("storage", rappel);
  return () => {
    abonnes.delete(rappel);
    window.removeEventListener("storage", rappel);
  };
}

/** Instantané côté client : une chaîne, donc une référence stable. */
export function instantaneFavoris(): string {
  return lireBrut();
}

/** Instantané côté serveur : aucun favori connu au rendu initial. */
export function instantaneFavorisServeur(): string {
  return "[]";
}

export function analyserFavoris(brut: string): string[] {
  try {
    const valeur: unknown = JSON.parse(brut);
    return Array.isArray(valeur) ? (valeur as string[]) : [];
  } catch {
    return [];
  }
}

/** Ajoute ou retire un animal des favoris, puis prévient les abonnés. */
export function basculerFavori(slug: string): void {
  const actuels = analyserFavoris(lireBrut());
  const suivants = actuels.includes(slug)
    ? actuels.filter((s) => s !== slug)
    : [...actuels, slug];

  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(suivants));
  } catch {
    // Le basculement reste effectif pour la session en cours.
  }
  prevenir();
}
