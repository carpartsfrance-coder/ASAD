import { SignJWT, jwtVerify } from "jose";
import type { RoleUtilisateur } from "@/types";

/**
 * Sessions signées, sans état serveur.
 *
 * Le jeton est un JWT HS256 déposé dans un cookie `HttpOnly`. Ce module est
 * volontairement compatible avec le runtime Edge : il ne lit ni le disque, ni
 * l'annuaire des comptes. La vérification que le compte existe toujours et
 * qu'il est actif se fait côté serveur, dans `garde.ts`.
 */

export const NOM_COOKIE = "asad_session";

/** Durée d'une session ordinaire : deux heures d'inactivité. */
export const DUREE_SESSION_SECONDES = 2 * 60 * 60;

/** Durée d'une session « Rester connecté » : trente jours. */
export const DUREE_SESSION_PERSISTANTE_SECONDES = 30 * 24 * 60 * 60;

/** Au-delà de ce délai, le jeton est réémis pour prolonger la session. */
export const SEUIL_RENOUVELLEMENT_SECONDES = 15 * 60;

export interface ContenuSession {
  /** Identifiant du compte. */
  sub: string;
  email: string;
  nom: string;
  role: RoleUtilisateur;
  /** Session « Rester connecté ». */
  persistante: boolean;
  /** Émis le (timestamp UNIX, secondes). */
  iat: number;
  /** Expire le (timestamp UNIX, secondes). */
  exp: number;
}

let secretMemorise: Uint8Array | null = null;

/**
 * Clé de signature, issue de `ASAD_AUTH_SECRET`.
 * En production, son absence est une erreur bloquante : mieux vaut refuser
 * toute connexion que signer avec une clé devinable.
 */
function obtenirSecret(): Uint8Array {
  if (secretMemorise) return secretMemorise;

  const brut = process.env.ASAD_AUTH_SECRET?.trim();

  if (!brut || brut.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ASAD_AUTH_SECRET est absent ou trop court (32 caractères minimum). " +
          "Générez-le avec « npm run auth:secret ».",
      );
    }
    // Développement : clé éphémère, les sessions ne survivent pas au redémarrage.
    console.warn(
      "[ASAD] ASAD_AUTH_SECRET absent : clé de développement temporaire utilisée. " +
        "Lancez « npm run auth:secret » pour en générer une durable.",
    );
    secretMemorise = new TextEncoder().encode(
      "developpement-uniquement-ne-jamais-utiliser-en-production",
    );
    return secretMemorise;
  }

  secretMemorise = new TextEncoder().encode(brut);
  return secretMemorise;
}

export interface DonneesJeton {
  id: string;
  email: string;
  nom: string;
  role: RoleUtilisateur;
  persistante: boolean;
}

/** Signe un jeton de session. */
export async function signerSession(donnees: DonneesJeton): Promise<string> {
  const duree = donnees.persistante
    ? DUREE_SESSION_PERSISTANTE_SECONDES
    : DUREE_SESSION_SECONDES;

  return new SignJWT({
    email: donnees.email,
    nom: donnees.nom,
    role: donnees.role,
    persistante: donnees.persistante,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(donnees.id)
    .setIssuedAt()
    .setIssuer("asad")
    .setAudience("asad-admin")
    .setExpirationTime(`${duree}s`)
    .sign(obtenirSecret());
}

/** Vérifie un jeton. Renvoie `null` s'il est absent, expiré ou altéré. */
export async function verifierSession(
  jeton: string | undefined,
): Promise<ContenuSession | null> {
  if (!jeton) return null;

  try {
    const { payload } = await jwtVerify(jeton, obtenirSecret(), {
      algorithms: ["HS256"],
      issuer: "asad",
      audience: "asad-admin",
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.nom !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      nom: payload.nom,
      role: payload.role as RoleUtilisateur,
      persistante: payload.persistante === true,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    // Signature invalide, jeton expiré ou malformé : session absente.
    return null;
  }
}

/** Le jeton mérite-t-il d'être réémis pour prolonger la session ? */
export function doitEtreRenouvele(session: ContenuSession): boolean {
  const maintenant = Math.floor(Date.now() / 1000);
  return maintenant - session.iat > SEUIL_RENOUVELLEMENT_SECONDES;
}

/** Options du cookie de session. */
export function optionsCookie(persistante: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: persistante
      ? DUREE_SESSION_PERSISTANTE_SECONDES
      : DUREE_SESSION_SECONDES,
  };
}
