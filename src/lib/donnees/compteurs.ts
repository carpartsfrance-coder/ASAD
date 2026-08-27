import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { CompteursAdmin } from "@/content/admin";

/**
 * Les pastilles du menu du back-office.
 *
 * Un seul aller-retour : ces cinq comptes sont affichés sur toutes les pages
 * de l'administration, il serait dommage d'ouvrir cinq requêtes à chaque fois.
 */
export async function compteursAdmin(): Promise<CompteursAdmin> {
  const [ligne] = await db.execute<CompteursAdmin>(sql`
    select
      (select count(*)::int from demandes_adoption  where statut = 'nouvelle')                as "demandes",
      (select count(*)::int from familles_accueil   where statut = 'nouvelle')                as "familles",
      (select count(*)::int from benevoles          where statut = 'nouvelle')                as "benevoles",
      (select count(*)::int from signalements       where statut in ('nouveau','a_verifier')) as "signalements",
      (select count(*)::int from messages_livre_or  where statut = 'en_attente')              as "livreOr"
  `);

  return ligne;
}
