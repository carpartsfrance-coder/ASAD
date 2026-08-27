import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Connexion à la base.
 *
 * Une seule variable à renseigner : `DATABASE_URL`. La même chaîne fonctionne
 * en local (PostgreSQL sur la machine) et en ligne (Neon, Supabase, Vercel
 * Postgres…). Aucun contenu n'est stocké ailleurs.
 */

function urlBase(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL est absent. Renseignez la chaîne de connexion PostgreSQL " +
        "dans .env.local (voir .env.example), puis relancez.",
    );
  }
  return url;
}

/**
 * En développement, Next.js recharge les modules à chaque modification :
 * sans ce cache, chaque rechargement ouvrirait un nouveau pool de connexions.
 */
const global_ = globalThis as unknown as {
  __asadClientSql?: ReturnType<typeof postgres>;
};

/**
 * Chiffrement de la connexion.
 *
 * - en local, inutile ;
 * - en ligne (Render, Neon, Supabase…), TLS exigé ;
 * - si l'URL précise déjà `sslmode`, on la laisse décider.
 */
function optionsSsl(url: string): "require" | false | undefined {
  if (/[?&]sslmode=/.test(url)) return undefined;
  if (/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) return false;
  return "require";
}

function clientSql() {
  if (!global_.__asadClientSql) {
    const url = urlBase();

    global_.__asadClientSql = postgres(url, {
      // Les pools externes (Neon, Supabase, pgBouncer) ne gèrent pas
      // les requêtes préparées côté serveur.
      prepare: false,
      ssl: optionsSsl(url),
      max: process.env.NODE_ENV === "production" ? 5 : 2,
      idle_timeout: 20,
    });
  }
  return global_.__asadClientSql;
}

export const db = drizzle(clientSql(), { schema });

export { schema };
