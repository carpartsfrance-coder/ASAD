import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs as tableUtilisateurs } from "@/db/schema";
import type { RoleUtilisateur, Utilisateur } from "@/types";

/**
 * Annuaire des comptes du back-office.
 *
 * Les comptes vivent en base : rien n'est stocké sur le disque du serveur, ce
 * qui permet au site de fonctionner en ligne sur un hébergement sans disque
 * persistant.
 */

export interface UtilisateurStocke extends Utilisateur {
  /** Empreinte scrypt — jamais le mot de passe en clair. */
  motDePasseHash: string;
}

function enUtilisateur(ligne: typeof tableUtilisateurs.$inferSelect): UtilisateurStocke {
  return {
    id: ligne.id,
    nom: ligne.nom,
    email: ligne.email,
    role: ligne.role,
    actif: ligne.actif,
    derniereConnexion: ligne.derniereConnexion?.toISOString(),
    motDePasseHash: ligne.motDePasseHash,
  };
}

/** Charge tous les comptes. */
export async function chargerUtilisateurs(): Promise<UtilisateurStocke[]> {
  const lignes = await db.select().from(tableUtilisateurs).orderBy(tableUtilisateurs.nom);
  return lignes.map(enUtilisateur);
}

/** Recherche un compte par adresse e-mail, insensible à la casse. */
export async function trouverParEmail(
  email: string,
): Promise<UtilisateurStocke | undefined> {
  const cible = email.trim().toLowerCase();
  const [ligne] = await db
    .select()
    .from(tableUtilisateurs)
    .where(eq(tableUtilisateurs.email, cible))
    .limit(1);

  return ligne ? enUtilisateur(ligne) : undefined;
}

export async function trouverParId(
  id: string,
): Promise<UtilisateurStocke | undefined> {
  // Un identifiant qui n'est pas un UUID ferait échouer la requête.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;

  const [ligne] = await db
    .select()
    .from(tableUtilisateurs)
    .where(eq(tableUtilisateurs.id, id))
    .limit(1);

  return ligne ? enUtilisateur(ligne) : undefined;
}

/** Y a-t-il au moins un compte ? */
export async function auMoinsUnCompte(): Promise<boolean> {
  try {
    const [{ nombre }] = await db
      .select({ nombre: sql<number>`count(*)::int` })
      .from(tableUtilisateurs);
    return nombre > 0;
  } catch {
    // Base injoignable : on laisse la connexion afficher son propre message.
    return false;
  }
}

export async function enregistrerConnexion(id: string): Promise<void> {
  await db
    .update(tableUtilisateurs)
    .set({ derniereConnexion: new Date() })
    .where(eq(tableUtilisateurs.id, id));
}

/* ------------------------------------------------------------------ */
/* Écriture — rubrique « Utilisateurs » du back-office                 */
/* ------------------------------------------------------------------ */

export async function creerUtilisateur(donnees: {
  nom: string;
  email: string;
  motDePasseHash: string;
  role: RoleUtilisateur;
}): Promise<Utilisateur> {
  const [ligne] = await db
    .insert(tableUtilisateurs)
    .values({ ...donnees, email: donnees.email.trim().toLowerCase() })
    .returning();

  return sansSecret(enUtilisateur(ligne));
}

export async function modifierUtilisateur(
  id: string,
  donnees: Partial<{
    nom: string;
    email: string;
    role: RoleUtilisateur;
    actif: boolean;
    motDePasseHash: string;
  }>,
): Promise<void> {
  const valeurs = { ...donnees };
  if (valeurs.email) valeurs.email = valeurs.email.trim().toLowerCase();

  await db.update(tableUtilisateurs).set(valeurs).where(eq(tableUtilisateurs.id, id));
}

export async function supprimerUtilisateur(id: string): Promise<void> {
  await db.delete(tableUtilisateurs).where(eq(tableUtilisateurs.id, id));
}

/** Retire l'empreinte avant toute sortie vers l'interface. */
export function sansSecret(utilisateur: UtilisateurStocke): Utilisateur {
  const { motDePasseHash: _empreinte, ...reste } = utilisateur;
  void _empreinte;
  return reste;
}
