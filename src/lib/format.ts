/** Formatage partagé (dates, montants, pourcentages). */

const formatteurDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatteurEuros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatDate(iso: string): string {
  return formatteurDate.format(new Date(`${iso}T12:00:00Z`));
}

export function formatEuros(montant: number): string {
  return formatteurEuros.format(montant);
}

/** Progression d'une collecte, bornée entre 0 et 100. */
export function pourcentage(collecte: number, objectif: number): number {
  if (objectif <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((collecte / objectif) * 100)));
}

/**
 * Élision devant un nom propre : « de Plume », mais « d’Oslo ».
 * Couvre les voyelles, leurs formes accentuées et le h muet le plus courant.
 */
export function deNom(nom: string): string {
  const premiere = nom
    .trim()
    .charAt(0)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  return /[aeiouyh]/.test(premiere) ? `d’${nom}` : `de ${nom}`;
}
