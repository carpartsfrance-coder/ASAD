"use server";

import { revalidatePath } from "next/cache";
import { exigerCapacite, lireSession } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import { hacherMotDePasse, LONGUEUR_MINIMALE } from "@/lib/auth/mots-de-passe";
import {
  creerUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  trouverParEmail,
  trouverParId,
} from "@/lib/auth/utilisateurs";
import { routes } from "@/content/site";
import type { EtatFormulaire } from "@/lib/etat-formulaire";
import type { RoleUtilisateur } from "@/types";

const ROLES: RoleUtilisateur[] = ["admin", "editeur", "benevole"];

function texte(data: FormData, nom: string): string {
  const v = data.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

/** Crée un compte, ou met à jour le mot de passe d'un compte existant. */
export async function sauverUtilisateur(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const auteur = await exigerCapacite("utilisateurs:gerer", "Utilisateurs");

  const id = texte(data, "id") || undefined;
  const nom = texte(data, "nom");
  const email = texte(data, "email").toLowerCase();
  const motDePasse = String(data.get("motDePasse") ?? "");
  const role = texte(data, "role") as RoleUtilisateur;

  const erreurs: Record<string, string> = {};
  if (nom.length < 2) erreurs.nom = "Le nom est obligatoire.";
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    erreurs.email = "Cette adresse e-mail ne semble pas valide.";
  }
  if (!ROLES.includes(role)) erreurs.role = "Choisissez un accès.";

  // Mot de passe obligatoire à la création, facultatif ensuite.
  if (!id && motDePasse.length < LONGUEUR_MINIMALE) {
    erreurs.motDePasse = `Le mot de passe doit contenir au moins ${LONGUEUR_MINIMALE} caractères.`;
  }
  if (id && motDePasse && motDePasse.length < LONGUEUR_MINIMALE) {
    erreurs.motDePasse = `Le mot de passe doit contenir au moins ${LONGUEUR_MINIMALE} caractères.`;
  }

  const existant = await trouverParEmail(email);
  if (existant && existant.id !== id) {
    erreurs.email = "Un compte utilise déjà cette adresse.";
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: "erreur", message: "Certaines informations manquent.", erreurs };
  }

  try {
    if (id) {
      await modifierUtilisateur(id, {
        nom,
        email,
        role,
        ...(motDePasse ? { motDePasseHash: await hacherMotDePasse(motDePasse) } : {}),
      });
      await consigner(auteur.id, auteur.nom, `a modifié le compte de ${nom}`);
    } else {
      await creerUtilisateur({
        nom,
        email,
        role,
        motDePasseHash: await hacherMotDePasse(motDePasse),
      });
      await consigner(auteur.id, auteur.nom, `a créé le compte de ${nom}`);
    }
  } catch (erreur) {
    console.error("[ASAD] Compte non enregistré", erreur);
    return { statut: "erreur", message: "Le compte n’a pas pu être enregistré." };
  }

  revalidatePath(routes.adminUtilisateurs);
  return {
    statut: "succes",
    message: id ? "Le compte a été mis à jour." : `Le compte de ${nom} a été créé.`,
  };
}

/** Active ou désactive un compte. Impossible de se désactiver soi-même. */
export async function basculerActivation(data: FormData): Promise<void> {
  const auteur = await exigerCapacite("utilisateurs:gerer", "Utilisateurs");
  const id = texte(data, "id");
  if (!id) return;

  const session = await lireSession();
  if (session?.sub === id) return;

  const compte = await trouverParId(id);
  if (!compte) return;

  await modifierUtilisateur(id, { actif: !compte.actif });
  await consigner(
    auteur.id,
    auteur.nom,
    `a ${compte.actif ? "désactivé" : "réactivé"} le compte de ${compte.nom}`,
  );
  revalidatePath(routes.adminUtilisateurs);
}

/** Supprime un compte. Impossible de supprimer le sien. */
export async function effacerUtilisateur(data: FormData): Promise<void> {
  const auteur = await exigerCapacite("utilisateurs:gerer", "Utilisateurs");
  const id = texte(data, "id");
  if (!id) return;

  const session = await lireSession();
  if (session?.sub === id) return;

  const compte = await trouverParId(id);
  if (!compte) return;

  await supprimerUtilisateur(id);
  await consigner(auteur.id, auteur.nom, `a supprimé le compte de ${compte.nom}`);
  revalidatePath(routes.adminUtilisateurs);
}
