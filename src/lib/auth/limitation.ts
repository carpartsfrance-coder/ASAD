import "server-only";

/**
 * Limitation des tentatives de connexion.
 *
 * Compteur en mémoire : il se réinitialise au redémarrage du serveur et n'est
 * pas partagé entre plusieurs instances. C'est suffisant pour freiner une
 * attaque par force brute sur un site associatif ; un déploiement multi-instance
 * demanderait un magasin partagé (Redis, base de données).
 */

const MAX_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000;

interface Compteur {
  tentatives: number;
  /** Fin du blocage, en millisecondes. */
  expireLe: number;
}

const compteurs = new Map<string, Compteur>();

/** Purge les entrées expirées — évite que la table ne grossisse sans fin. */
function purger(maintenant: number): void {
  for (const [cle, compteur] of compteurs) {
    if (compteur.expireLe <= maintenant) compteurs.delete(cle);
  }
}

export interface EtatLimitation {
  bloque: boolean;
  tentativesRestantes: number;
  /** Minutes avant déblocage, quand `bloque` vaut `true`. */
  minutesAvantDeblocage: number;
}

export function etatTentatives(cle: string): EtatLimitation {
  const maintenant = Date.now();
  purger(maintenant);

  const compteur = compteurs.get(cle);
  if (!compteur || compteur.expireLe <= maintenant) {
    return { bloque: false, tentativesRestantes: MAX_TENTATIVES, minutesAvantDeblocage: 0 };
  }

  const restantes = Math.max(0, MAX_TENTATIVES - compteur.tentatives);
  return {
    bloque: restantes === 0,
    tentativesRestantes: restantes,
    minutesAvantDeblocage: Math.ceil((compteur.expireLe - maintenant) / 60000),
  };
}

/** Enregistre un échec et renvoie le nouvel état. */
export function enregistrerEchec(cle: string): EtatLimitation {
  const maintenant = Date.now();
  purger(maintenant);

  const compteur = compteurs.get(cle);
  if (!compteur || compteur.expireLe <= maintenant) {
    compteurs.set(cle, { tentatives: 1, expireLe: maintenant + FENETRE_MS });
  } else {
    compteur.tentatives += 1;
    compteur.expireLe = maintenant + FENETRE_MS;
  }

  return etatTentatives(cle);
}

/** Efface le compteur après une connexion réussie. */
export function reinitialiser(cle: string): void {
  compteurs.delete(cle);
}
