import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleUtilisateur, Utilisateur } from "@/types";
import { routes } from "@/content/site";
import { NOM_COOKIE, verifierSession } from "./session";
import { sansSecret, trouverParId } from "./utilisateurs";
import { peut, type Capacite } from "./roles";

/**
 * Gardes serveur du back-office.
 *
 * Le middleware filtre déjà les requêtes, mais il ne suffit pas : il ne voit
 * pas l'annuaire et peut être contourné. Chaque page protégée revérifie donc
 * ici que la session est valide, que le compte existe encore et qu'il est actif.
 */

/** Session courante, ou `null`. Ne touche pas à l'annuaire. */
export async function lireSession() {
  const magasin = await cookies();
  return verifierSession(magasin.get(NOM_COOKIE)?.value);
}

/**
 * Utilisateur courant, revalidé contre l'annuaire.
 * Renvoie `null` si la session est absente, si le compte a été supprimé ou
 * s'il a été désactivé depuis l'émission du jeton.
 */
export async function utilisateurCourant(): Promise<Utilisateur | null> {
  const session = await lireSession();
  if (!session) return null;

  const compte = await trouverParId(session.sub);
  if (!compte || compte.actif === false) return null;

  return sansSecret(compte);
}

/** Exige une session valide ; redirige vers la connexion sinon. */
export async function exigerUtilisateur(): Promise<Utilisateur> {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) redirect(`${routes.adminConnexion}?session=expiree`);
  return utilisateur;
}

/**
 * Exige une capacité précise.
 * À défaut, renvoie au tableau de bord avec un message d'accès refusé plutôt
 * qu'une page d'erreur : l'utilisateur garde un chemin de sortie.
 */
export async function exigerCapacite(
  capacite: Capacite,
  rubrique?: string,
): Promise<Utilisateur> {
  const utilisateur = await exigerUtilisateur();

  if (!peut(utilisateur.role, capacite)) {
    const parametre = rubrique ? `?acces=refuse&rubrique=${encodeURIComponent(rubrique)}` : "?acces=refuse";
    redirect(`${routes.admin}${parametre}`);
  }
  return utilisateur;
}

/** Exige l'un des rôles indiqués. */
export async function exigerRole(
  ...roles: RoleUtilisateur[]
): Promise<Utilisateur> {
  const utilisateur = await exigerUtilisateur();
  if (!roles.includes(utilisateur.role)) redirect(`${routes.admin}?acces=refuse`);
  return utilisateur;
}
