/**
 * Applique les migrations de la base.
 *
 * Lancé automatiquement au démarrage du site (`npm start`), donc à chaque
 * déploiement sur Render : la base est toujours au niveau du code.
 * Les migrations déjà passées sont ignorées — relancer ce script ne casse rien.
 *
 * N'utilise que des dépendances de production (`postgres`, `drizzle-orm`) :
 * `drizzle-kit` n'est pas installé en ligne.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { chargerEnv, optionsSsl, urlBase } from "./env.mjs";

chargerEnv();

const url = urlBase();
const sql = postgres(url, { max: 1, ssl: optionsSsl(url), onnotice: () => {} });

try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("✓ Base à jour.");
} catch (erreur) {
  console.error("\n✗ Les migrations ont échoué :", erreur.message, "\n");
  process.exitCode = 1;
} finally {
  await sql.end();
}
