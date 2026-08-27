/**
 * Déduit un âge en mois de ce qui est écrit dans « Âge affiché ».
 *
 * Ce nombre ne sert qu'au filtre du catalogue : il n'est plus demandé à la
 * saisie, on le calcule. Comprend « 3 ans », « 6 mois », « 1 an et demi »,
 * « environ 2 ans ». En cas de doute, renvoie 0 — l'animal sort simplement
 * du filtre par âge, il reste visible dans le catalogue.
 */
export function moisDepuisAge(age: string): number {
  const texte = age
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const demi = /\bet demi/.test(texte);

  const ans = texte.match(/(\d+(?:[.,]\d+)?)\s*an/);
  if (ans) {
    const valeur = Number(ans[1].replace(",", "."));
    return Math.round(valeur * 12 + (demi ? 6 : 0));
  }

  const mois = texte.match(/(\d+)\s*mois/);
  if (mois) return Number(mois[1]);

  return 0;
}
