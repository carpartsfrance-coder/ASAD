import { readFileSync } from "node:fs";

/**
 * Charge `.env.local` si le fichier existe.
 *
 * Volontairement sans dépendance : ces scripts tournent aussi sur Render, où
 * seules les dépendances de production sont installées. En ligne, les variables
 * sont déjà fournies par l'hébergeur et ce chargement ne fait rien.
 */
export function chargerEnv(fichier = ".env.local") {
  let contenu;
  try {
    contenu = readFileSync(fichier, "utf8");
  } catch {
    return; // Absent en production : c'est normal.
  }

  for (const ligne of contenu.split("\n")) {
    const nette = ligne.trim();
    if (!nette || nette.startsWith("#")) continue;

    const separateur = nette.indexOf("=");
    if (separateur === -1) continue;

    const cle = nette.slice(0, separateur).trim();
    let valeur = nette.slice(separateur + 1).trim();

    // Retire les guillemets éventuels.
    if (
      (valeur.startsWith('"') && valeur.endsWith('"')) ||
      (valeur.startsWith("'") && valeur.endsWith("'"))
    ) {
      valeur = valeur.slice(1, -1);
    }

    // Les variables déjà posées par l'hébergeur gagnent toujours.
    if (process.env[cle] === undefined) process.env[cle] = valeur;
  }
}

/**
 * Options SSL de la connexion PostgreSQL.
 *
 * - en local, pas de chiffrement ;
 * - en ligne (Render, Neon, Supabase…), TLS activé ;
 * - si l'URL précise déjà `sslmode`, on la laisse décider.
 */
export function optionsSsl(url) {
  if (/[?&]sslmode=/.test(url)) return undefined;
  if (/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) return false;
  return "require";
}

/** Lit `DATABASE_URL` ou s'arrête avec un message lisible. */
export function urlBase() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error(
      "\n✗ DATABASE_URL est absent.\n" +
        "  En local  : renseignez-le dans .env.local (voir .env.example).\n" +
        "  Sur Render : il est fourni automatiquement par la base de données.\n",
    );
    process.exit(1);
  }
  return url;
}
