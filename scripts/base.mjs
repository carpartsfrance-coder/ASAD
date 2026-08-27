/**
 * Copie de la base ASAD entre la machine locale et l'hébergeur.
 *
 *   npm run db:exporter              → écrit sauvegarde-asad.sql
 *   npm run db:importer -- "<url>"   → recharge ce fichier dans la base visée
 *
 * L'export contient TOUT : structure, contenu, photos téléversées et comptes
 * du back-office. C'est ce fichier qu'on envoie sur Render la première fois.
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

import { chargerEnv, urlBase } from "./env.mjs";

chargerEnv();

const FICHIER = "sauvegarde-asad.sql";
const action = process.argv[2];

function lancer(commande, args, options = {}) {
  const resultat = spawnSync(commande, args, { stdio: "inherit", ...options });

  if (resultat.error?.code === "ENOENT") {
    console.error(
      `\n✗ « ${commande} » est introuvable.\n` +
        "  Installez les outils PostgreSQL : brew install libpq\n",
    );
    process.exit(1);
  }
  return resultat.status === 0;
}

function poids(fichier) {
  const octets = statSync(fichier).size;
  return octets > 1024 * 1024
    ? `${(octets / 1024 / 1024).toFixed(1)} Mo`
    : `${Math.round(octets / 1024)} ko`;
}

if (action === "exporter") {
  const url = urlBase();
  console.log("Export de la base locale…");

  const ok = lancer("pg_dump", [
    url,
    "--no-owner",
    "--no-privileges",
    "--clean",
    "--if-exists",
    "--file",
    FICHIER,
  ]);

  if (!ok || !existsSync(FICHIER)) {
    console.error("\n✗ L'export a échoué.\n");
    process.exit(1);
  }

  console.log(`\n✓ ${FICHIER} écrit (${poids(FICHIER)}).`);
  console.log("  Envoyez-le sur l'hébergeur avec :");
  console.log('  npm run db:importer -- "<URL de la base Render>"\n');
} else if (action === "importer") {
  const cible = process.argv[3]?.trim();

  if (!cible) {
    console.error(
      '\n✗ Indiquez la base d\'arrivée :\n  npm run db:importer -- "<URL de la base Render>"\n',
    );
    process.exit(1);
  }
  if (!existsSync(FICHIER)) {
    console.error(
      `\n✗ ${FICHIER} est introuvable. Lancez d'abord : npm run db:exporter\n`,
    );
    process.exit(1);
  }

  const hote = cible.replace(/:[^:@/]*@/, ":***@");
  console.log(`Import de ${FICHIER} (${poids(FICHIER)}) vers ${hote}…\n`);

  const ok = lancer("psql", [
    cible,
    "--quiet",
    "--set",
    "ON_ERROR_STOP=1",
    "--file",
    FICHIER,
  ]);

  if (!ok) {
    console.error("\n✗ L'import a échoué. Rien n'a été modifié en local.\n");
    process.exit(1);
  }

  console.log("\n✓ Base copiée. Vérification :");
  lancer("psql", [
    cible,
    "--quiet",
    "--tuples-only",
    "--command",
    "SELECT '  '||relname||' : '||n_live_tup FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY relname;",
  ]);
  console.log("");
} else {
  console.log(
    "\nUsage :\n" +
      "  npm run db:exporter              copie la base locale dans sauvegarde-asad.sql\n" +
      '  npm run db:importer -- "<url>"   recharge ce fichier dans la base visée\n',
  );
  process.exit(1);
}
