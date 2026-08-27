"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/content/site";
import type { EtatFormulaire } from "@/lib/etat-formulaire";
import {
  NOM_COOKIE,
  optionsCookie,
  signerSession,
} from "@/lib/auth/session";
import {
  comparaisonFactice,
  verifierMotDePasse,
} from "@/lib/auth/mots-de-passe";
import {
  auMoinsUnCompte,
  enregistrerConnexion,
  trouverParEmail,
} from "@/lib/auth/utilisateurs";
import {
  enregistrerEchec,
  etatTentatives,
  reinitialiser,
} from "@/lib/auth/limitation";
import { envoyerDemande } from "@/lib/notifications";
import { lireSession } from "@/lib/auth/garde";

/**
 * Authentification du back-office.
 *
 * Principes retenus :
 *  - le message d'erreur ne dit jamais si l'adresse existe ;
 *  - une comparaison factice est exécutée quand aucun compte ne correspond,
 *    pour que le temps de réponse ne trahisse rien ;
 *  - les tentatives sont limitées par adresse et par IP ;
 *  - la redirection après connexion est bornée au back-office.
 */

const ERREUR_IDENTIFIANTS = "Adresse e-mail ou mot de passe incorrect.";

const AUCUN_COMPTE =
  "Aucun compte n’est encore configuré. Créez-en un avec « npm run auth:demarrage ».";

/** Adresse IP de l'appelant, pour la limitation des tentatives. */
async function adresseAppelant(): Promise<string> {
  const entetes = await headers();
  const transmise = entetes.get("x-forwarded-for");
  if (transmise) return transmise.split(",")[0]!.trim();
  return entetes.get("x-real-ip") ?? "inconnue";
}

/** N'accepte qu'une destination interne au back-office. */
function destinationSure(suite: string | null): string {
  if (!suite) return routes.admin;
  if (!suite.startsWith("/admin") || suite.startsWith("//")) return routes.admin;
  if (suite.startsWith("/admin/connexion")) return routes.admin;
  return suite;
}

export async function seConnecter(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(data.get("motDePasse") ?? "");
  const persistante = data.get("persistante") != null;
  const suite = destinationSure(
    typeof data.get("suite") === "string" ? String(data.get("suite")) : null,
  );

  const erreurs: Record<string, string> = {};
  if (!email) erreurs.email = "Renseignez votre adresse e-mail.";
  if (!motDePasse) erreurs.motDePasse = "Renseignez votre mot de passe.";

  if (Object.keys(erreurs).length > 0) {
    return { statut: "erreur", erreurs };
  }

  if (!(await auMoinsUnCompte())) {
    return { statut: "erreur", message: AUCUN_COMPTE };
  }

  const cle = `${email}|${await adresseAppelant()}`;
  const limite = etatTentatives(cle);

  if (limite.bloque) {
    return {
      statut: "erreur",
      message: `Trop de tentatives. Réessayez dans ${limite.minutesAvantDeblocage} minute${limite.minutesAvantDeblocage > 1 ? "s" : ""}.`,
    };
  }

  const compte = await trouverParEmail(email);

  if (!compte) {
    // Même coût de calcul que pour un compte existant.
    await comparaisonFactice();
    const apres = enregistrerEchec(cle);
    return { statut: "erreur", message: messageEchec(apres.tentativesRestantes) };
  }

  const correspond = await verifierMotDePasse(motDePasse, compte.motDePasseHash);

  if (!correspond || compte.actif === false) {
    const apres = enregistrerEchec(cle);
    return { statut: "erreur", message: messageEchec(apres.tentativesRestantes) };
  }

  reinitialiser(cle);
  await enregistrerConnexion(compte.id);

  const jeton = await signerSession({
    id: compte.id,
    email: compte.email,
    nom: compte.nom,
    role: compte.role,
    persistante,
  });

  const magasin = await cookies();
  magasin.set(NOM_COOKIE, jeton, optionsCookie(persistante));

  redirect(suite);
}

function messageEchec(restantes: number): string {
  if (restantes <= 0) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  if (restantes <= 2) {
    return `${ERREUR_IDENTIFIANTS} Il vous reste ${restantes} tentative${restantes > 1 ? "s" : ""}.`;
  }
  return ERREUR_IDENTIFIANTS;
}

/** Ferme la session et renvoie à l'écran de connexion. */
export async function seDeconnecter(): Promise<void> {
  const magasin = await cookies();
  magasin.set(NOM_COOKIE, "", { ...optionsCookie(false), maxAge: 0 });
  redirect(routes.adminConnexion);
}

/**
 * Demande de réinitialisation.
 *
 * La réponse est volontairement identique, que le compte existe ou non.
 * L'envoi effectif du lien passe par le canal configuré dans
 * `lib/notifications.ts` ; sans configuration, la demande est journalisée.
 */
export async function demanderReinitialisation(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    return {
      statut: "erreur",
      erreurs: { email: "Cette adresse e-mail ne semble pas valide." },
    };
  }

  const compte = await trouverParEmail(email);

  if (compte) {
    try {
      await envoyerDemande({
        type: "reinitialisation-mot-de-passe",
        sujet: `Réinitialisation du mot de passe — ${compte.nom}`,
        valeurs: {
          compte: compte.email,
          role: compte.role,
          demandeLe: new Date().toISOString(),
        },
      });
    } catch (erreur) {
      console.error("[ASAD] Échec d’envoi du lien de réinitialisation", erreur);
    }
  }

  return {
    statut: "succes",
    message:
      "Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.",
  };
}

/** Utilisée par l'interface pour savoir si une session est ouverte. */
export async function sessionOuverte(): Promise<boolean> {
  return (await lireSession()) !== null;
}
