import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

/* `promisify` perd la surcharge avec options : on la retype explicitement. */
const scryptAsync = promisify(scrypt) as (
  motDePasse: string | Buffer,
  sel: string | Buffer,
  longueur: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/* Paramètres scrypt — coût mémoire ~16 Mo, adapté à un usage interactif. */
const COUT = 16384; // N
const BLOC = 8; // r
const PARALLELISME = 1; // p
const LONGUEUR_CLE = 64;
const LONGUEUR_SEL = 16;

/** Longueur minimale acceptée pour un mot de passe. */
export const LONGUEUR_MINIMALE = 12;

/**
 * Hache un mot de passe avec scrypt.
 * Format produit : `scrypt$N$r$p$sel$empreinte` (base64url).
 */
export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(LONGUEUR_SEL);
  const empreinte = await scryptAsync(motDePasse.normalize("NFKC"), sel, LONGUEUR_CLE, {
    N: COUT,
    r: BLOC,
    p: PARALLELISME,
  });

  return [
    "scrypt",
    COUT,
    BLOC,
    PARALLELISME,
    sel.toString("base64url"),
    empreinte.toString("base64url"),
  ].join("$");
}

/**
 * Vérifie un mot de passe contre son empreinte, en temps constant.
 * Renvoie `false` sur toute empreinte malformée, jamais d'exception.
 */
export async function verifierMotDePasse(
  motDePasse: string,
  empreinteStockee: string,
): Promise<boolean> {
  try {
    const parties = empreinteStockee.split("$");
    if (parties.length !== 6 || parties[0] !== "scrypt") return false;

    const [, n, r, p, selB64, empreinteB64] = parties;
    const sel = Buffer.from(selB64, "base64url");
    const attendue = Buffer.from(empreinteB64, "base64url");

    const calculee = await scryptAsync(
      motDePasse.normalize("NFKC"),
      sel,
      attendue.length,
      { N: Number(n), r: Number(r), p: Number(p) },
    );

    if (calculee.length !== attendue.length) return false;
    return timingSafeEqual(calculee, attendue);
  } catch {
    return false;
  }
}

/**
 * Comparaison factice, exécutée quand aucun compte ne correspond.
 * Le temps de réponse reste identique : impossible de deviner, à la durée,
 * si une adresse existe.
 */
export async function comparaisonFactice(): Promise<void> {
  await scryptAsync("mot-de-passe-inexistant", randomBytes(LONGUEUR_SEL), LONGUEUR_CLE, {
    N: COUT,
    r: BLOC,
    p: PARALLELISME,
  });
}
