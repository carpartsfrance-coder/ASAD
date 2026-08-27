#!/usr/bin/env node
/**
 * Outils d'authentification ASAD.
 *
 *   node scripts/auth.mjs secret        Génère ASAD_AUTH_SECRET dans .env.local
 *   node scripts/auth.mjs utilisateur   Crée ou met à jour un compte
 *   node scripts/auth.mjs lister        Liste les comptes configurés
 *
 * Les mots de passe ne sont jamais stockés en clair : seule une empreinte
 * scrypt est enregistrée.
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

const scryptAsync = promisify(scrypt);
const RACINE = process.cwd();
const FICHIER_ENV = path.join(RACINE, ".env.local");
const ROLES = ["admin", "editeur", "benevole"];
const LONGUEUR_MINIMALE = 12;

const couleur = {
  gras: (t) => `\x1b[1m${t}\x1b[0m`,
  vert: (t) => `\x1b[32m${t}\x1b[0m`,
  rouge: (t) => `\x1b[31m${t}\x1b[0m`,
  gris: (t) => `\x1b[90m${t}\x1b[0m`,
};

/* ------------------------------------------------------------------ */
/* Saisie                                                              */
/* ------------------------------------------------------------------ */

/**
 * Une seule interface pour toute la session : en ouvrir une par question
 * ferait perdre les lignes suivantes quand l'entrée est redirigée.
 */
let interfaceLecture = null;

function obtenirInterface() {
  if (!interfaceLecture) {
    interfaceLecture = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: process.stdin.isTTY === true,
    });
  }
  return interfaceLecture;
}

function fermerInterface() {
  interfaceLecture?.close();
  interfaceLecture = null;
}

function demander(question) {
  const rl = obtenirInterface();
  return new Promise((resoudre) =>
    rl.question(question, (reponse) => resoudre(reponse.trim())),
  );
}

/** Saisie masquée : rien ne s'affiche, rien ne reste dans l'historique. */
function demanderSecret(question) {
  const rl = obtenirInterface();

  if (!process.stdin.isTTY) {
    // Entrée redirigée : le masquage n'a pas de sens.
    return new Promise((resoudre) => rl.question(question, resoudre));
  }

  return new Promise((resoudre) => {
    const ecrire = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (chaine) => ecrire(chaine.includes(question) ? chaine : "");
    rl.question(question, (reponse) => {
      rl._writeToOutput = ecrire;
      rl.output.write("\n");
      resoudre(reponse);
    });
  });
}

/** Lit une option `--cle valeur` de la ligne de commande. */
function option(nom) {
  const index = process.argv.indexOf(`--${nom}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

/* ------------------------------------------------------------------ */
/* Fichiers                                                            */
/* ------------------------------------------------------------------ */

/** Connexion à la base, ouverte à la demande. */
let sql = null;

function baseDeDonnees() {
  if (!sql) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
      console.error(couleur.rouge("✗ DATABASE_URL est absent de .env.local."));
      console.error(couleur.gris("  Renseignez la chaîne de connexion PostgreSQL, puis relancez."));
      process.exit(1);
    }
    sql = postgres(url, { prepare: false, max: 1 });
  }
  return sql;
}

async function fermerBase() {
  if (sql) await sql.end();
  sql = null;
}

async function lireUtilisateurs() {
  const db = baseDeDonnees();
  try {
    return await db`
      select nom, email, role, actif, derniere_connexion as "derniereConnexion"
      from utilisateurs order by nom
    `;
  } catch (erreur) {
    if (erreur.code === "42P01") {
      console.error(couleur.rouge("✗ La table « utilisateurs » n’existe pas encore."));
      console.error(couleur.gris("  Lancez d’abord : npm run db:migrate"));
      process.exit(1);
    }
    throw erreur;
  }
}

/** Insère ou met à jour un compte, en une requête. */
async function enregistrerCompte({ email, nom, role, motDePasseHash }) {
  const db = baseDeDonnees();
  const [ligne] = await db`
    insert into utilisateurs (nom, email, mot_de_passe_hash, role, actif)
    values (${nom}, ${email}, ${motDePasseHash}, ${role}, true)
    on conflict (email) do update
      set nom = excluded.nom,
          mot_de_passe_hash = excluded.mot_de_passe_hash,
          role = excluded.role,
          actif = true
    returning (xmax = 0) as cree
  `;
  return ligne.cree;
}

async function lireEnv() {
  try {
    return await readFile(FICHIER_ENV, "utf8");
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/* Commandes                                                           */
/* ------------------------------------------------------------------ */

async function commandeSecret() {
  const contenu = await lireEnv();

  if (/^ASAD_AUTH_SECRET=.{32,}$/m.test(contenu)) {
    console.log(couleur.gris("Une clé existe déjà dans .env.local — rien à faire."));
    console.log(couleur.gris("Pour la remplacer, supprimez la ligne ASAD_AUTH_SECRET puis relancez."));
    return;
  }

  const secret = randomBytes(48).toString("base64url");
  const ligne = `ASAD_AUTH_SECRET=${secret}\n`;
  const nouveau = contenu.replace(/^ASAD_AUTH_SECRET=.*$/m, "").trimEnd();

  await writeFile(FICHIER_ENV, `${nouveau ? `${nouveau}\n` : ""}${ligne}`, "utf8");

  console.log(couleur.vert("✓ Clé de signature écrite dans .env.local"));
  console.log(couleur.gris("  En production, reportez cette même variable dans votre hébergeur."));
}

async function commandeUtilisateur() {
  /* Mode non interactif : utile pour un script de déploiement.
     Le mot de passe passe par une variable d'environnement, jamais par un
     argument de ligne de commande — les arguments restent dans l'historique. */
  const emailOption = option("email");
  const nonInteractif = Boolean(emailOption);

  if (nonInteractif) {
    return creerCompte({
      email: emailOption.toLowerCase(),
      nom: option("nom") ?? emailOption,
      role: option("role") ?? "admin",
      motDePasse: process.env.ASAD_NOUVEAU_MOT_DE_PASSE ?? "",
    });
  }

  console.log(couleur.gras("\nCréation d’un compte du back-office\n"));

  const email = (await demander("Adresse e-mail    : ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    console.error(couleur.rouge("✗ Adresse e-mail invalide."));
    process.exitCode = 1;
    return false;
  }

  const nom = await demander("Nom et prénom     : ");
  if (nom.length < 2) {
    console.error(couleur.rouge("✗ Le nom est obligatoire."));
    process.exitCode = 1;
    return;
  }

  const roleSaisi = (await demander(`Rôle (${ROLES.join(" / ")}) [admin] : `)) || "admin";
  if (!ROLES.includes(roleSaisi)) {
    console.error(couleur.rouge(`✗ Rôle inconnu. Valeurs acceptées : ${ROLES.join(", ")}.`));
    process.exitCode = 1;
    return;
  }

  const motDePasse = await demanderSecret(
    `Mot de passe (${LONGUEUR_MINIMALE} caractères minimum) : `,
  );
  if (motDePasse.length < LONGUEUR_MINIMALE) {
    console.error(couleur.rouge(`✗ Mot de passe trop court (${LONGUEUR_MINIMALE} caractères minimum).`));
    process.exitCode = 1;
    return;
  }

  const confirmation = await demanderSecret("Confirmez le mot de passe            : ");
  if (motDePasse !== confirmation) {
    console.error(couleur.rouge("✗ Les deux saisies diffèrent."));
    process.exitCode = 1;
    return;
  }

  return creerCompte({ email, nom, role: roleSaisi, motDePasse });
}

/** Écrit le compte, après validation. Renvoie `true` en cas de succès. */
async function creerCompte({ email, nom, role, motDePasse, silencieux = false }) {
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    console.error(couleur.rouge("✗ Adresse e-mail invalide."));
    process.exitCode = 1;
    return false;
  }
  if (!ROLES.includes(role)) {
    console.error(couleur.rouge(`✗ Rôle inconnu. Valeurs acceptées : ${ROLES.join(", ")}.`));
    process.exitCode = 1;
    return false;
  }
  if (nom.trim().length < 2) {
    console.error(couleur.rouge("✗ Le nom est obligatoire."));
    process.exitCode = 1;
    return false;
  }
  if (motDePasse.length < LONGUEUR_MINIMALE) {
    console.error(
      couleur.rouge(`✗ Mot de passe trop court (${LONGUEUR_MINIMALE} caractères minimum).`),
    );
    console.error(couleur.gris("  En mode non interactif : ASAD_NOUVEAU_MOT_DE_PASSE=… npm run auth:utilisateur -- --email …"));
    process.exitCode = 1;
    return false;
  }

  const roleSaisi = role;
  const sel = randomBytes(16);
  const empreinte = await scryptAsync(motDePasse.normalize("NFKC"), sel, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  const motDePasseHash = `scrypt$16384$8$1$${sel.toString("base64url")}$${empreinte.toString("base64url")}`;

  const cree = await enregistrerCompte({ email, nom, role: roleSaisi, motDePasseHash });

  if (!silencieux) {
    console.log(
      couleur.vert(
        cree ? `\n✓ Compte créé : ${email} (${roleSaisi})` : `\n✓ Compte mis à jour : ${email}`,
      ),
    );
  }
  if (silencieux) return true;
  console.log(couleur.gris("  Enregistré en base de données."));

  const env = await lireEnv();
  if (!/^ASAD_AUTH_SECRET=.{32,}$/m.test(env)) {
    console.log(couleur.gris("\n  Il reste à générer la clé de signature : npm run auth:secret"));
  }

  return true;
}

/**
 * Mise en route : crée les deux comptes du départ, avec le bon rôle.
 * Évite d'avoir à retenir les options de la commande « utilisateur ».
 */
async function commandeDemarrage() {
  console.log(couleur.gras("\nMise en route du back-office ASAD\n"));
  console.log("Deux comptes vont être créés :");
  console.log(couleur.gris("  1. le vôtre, avec l’accès complet ;"));
  console.log(couleur.gris("  2. celui de la personne qui gère les animaux et le livre d’or.\n"));
  console.log(couleur.gris("Les mots de passe ne s’affichent pas pendant la saisie. C’est normal.\n"));

  const existants = await lireUtilisateurs();
  if (existants.length > 0) {
    console.log(couleur.gris(`${existants.length} compte(s) déjà présent(s) — ils seront conservés.`));
    const suite = await demander("Continuer quand même ? (o/N) : ");
    if (suite.toLowerCase() !== "o") {
      console.log(couleur.gris("Abandon."));
      return;
    }
    console.log();
  }

  // --- Compte administrateur ---
  console.log(couleur.gras("1. Votre compte (accès complet)"));
  const emailAdmin = (await demander("   Adresse e-mail : ")).toLowerCase();
  const nomAdmin = await demander("   Nom et prénom  : ");
  const mdpAdmin = await demanderSecret(`   Mot de passe (${LONGUEUR_MINIMALE} caractères min.) : `);
  const mdpAdmin2 = await demanderSecret("   Confirmez                            : ");

  if (mdpAdmin !== mdpAdmin2) {
    console.error(couleur.rouge("\n✗ Les deux saisies diffèrent. Rien n’a été créé."));
    process.exitCode = 1;
    return;
  }
  const okAdmin = await creerCompte({
    email: emailAdmin,
    nom: nomAdmin,
    role: "admin",
    motDePasse: mdpAdmin,
    silencieux: true,
  });
  if (!okAdmin) return;
  console.log(couleur.vert(`   ✓ ${emailAdmin} — accès complet\n`));

  // --- Compte « animaux et livre d'or » ---
  console.log(couleur.gras("2. Le compte animaux et livre d’or"));
  console.log(couleur.gris("   Ce compte ne voit que trois rubriques : le tableau de bord,"));
  console.log(couleur.gris("   les animaux et le livre d’or. Rien d’autre.\n"));
  const emailEditeur = (await demander("   Adresse e-mail : ")).toLowerCase();
  const nomEditeur = await demander("   Nom et prénom  : ");
  const mdpEditeur = await demanderSecret(`   Mot de passe (${LONGUEUR_MINIMALE} caractères min.) : `);
  const mdpEditeur2 = await demanderSecret("   Confirmez                            : ");

  if (mdpEditeur !== mdpEditeur2) {
    console.error(couleur.rouge("\n✗ Les deux saisies diffèrent. Le second compte n’a pas été créé."));
    process.exitCode = 1;
    return;
  }
  const okEditeur = await creerCompte({
    email: emailEditeur,
    nom: nomEditeur,
    role: "editeur",
    motDePasse: mdpEditeur,
    silencieux: true,
  });
  if (!okEditeur) return;
  console.log(couleur.vert(`   ✓ ${emailEditeur} — animaux et livre d’or\n`));

  // --- Clé de signature ---
  const env = await lireEnv();
  if (!/^ASAD_AUTH_SECRET=.{32,}$/m.test(env)) {
    await commandeSecret();
  }

  console.log(couleur.gras("\nC’est prêt."));
  console.log(couleur.gris("  Lancez le site avec « npm run dev », puis ouvrez /admin/connexion.\n"));
}

async function commandeLister() {
  const utilisateurs = await lireUtilisateurs();

  if (utilisateurs.length === 0) {
    console.log(couleur.gris("Aucun compte configuré. Lancez : npm run auth:demarrage"));
    return;
  }

  console.log(couleur.gras(`\n${utilisateurs.length} compte(s) configuré(s)\n`));
  for (const u of utilisateurs) {
    const etat = u.actif === false ? couleur.rouge("désactivé") : couleur.vert("actif");
    console.log(`  ${u.email.padEnd(32)} ${u.role.padEnd(10)} ${etat}`);
  }
  console.log();
}

/* ------------------------------------------------------------------ */

const commandes = {
  demarrage: commandeDemarrage,
  secret: commandeSecret,
  utilisateur: commandeUtilisateur,
  lister: commandeLister,
};

const commande = process.argv[2];

if (!commande || !commandes[commande]) {
  console.log(`
${couleur.gras("Outils d’authentification ASAD")}

  npm run auth:demarrage     Crée les deux comptes du départ (guidé)
  npm run auth:secret        Génère la clé de signature des sessions
  npm run auth:utilisateur   Crée ou met à jour un compte
  npm run auth:lister        Liste les comptes configurés
`);
  process.exitCode = commande ? 1 : 0;
} else {
  try {
    await commandes[commande]();
  } finally {
    fermerInterface();
    await fermerBase();
  }
}
