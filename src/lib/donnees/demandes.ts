import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { animaux as tAnimaux, demandesAdoption as tDemandes } from "@/db/schema";
import type { DemandeAdoption, StatutDemande } from "@/types";

function enDemande(ligne: typeof tDemandes.$inferSelect): DemandeAdoption {
  return {
    id: ligne.id,
    reference: ligne.reference,
    animalSlug: "",
    animalNom: ligne.animalNom,
    prenom: ligne.prenom,
    nom: ligne.nom,
    email: ligne.email,
    telephone: ligne.telephone,
    commune: ligne.commune,
    statut: ligne.statut,
    createdAt: ligne.creeLe.toISOString().slice(0, 10),
  };
}

/** Enregistre une demande reçue depuis le formulaire public. */
export async function enregistrerDemande(donnees: {
  reference: string;
  animalSlug?: string;
  animalNom: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  commune: string;
  codePostal: string;
  reponses: Record<string, string>;
}): Promise<void> {
  let animalId: string | null = null;

  if (donnees.animalSlug) {
    const [animal] = await db
      .select({ id: tAnimaux.id })
      .from(tAnimaux)
      .where(eq(tAnimaux.slug, donnees.animalSlug))
      .limit(1);
    animalId = animal?.id ?? null;
  }

  await db.insert(tDemandes).values({
    reference: donnees.reference,
    animalId,
    animalNom: donnees.animalNom,
    prenom: donnees.prenom,
    nom: donnees.nom,
    email: donnees.email,
    telephone: donnees.telephone,
    commune: donnees.commune,
    codePostal: donnees.codePostal,
    reponses: donnees.reponses,
  });
}

export async function toutesLesDemandes(limite?: number): Promise<DemandeAdoption[]> {
  const requete = db.select().from(tDemandes).orderBy(desc(tDemandes.creeLe));
  const lignes = limite ? await requete.limit(limite) : await requete;
  return lignes.map(enDemande);
}

export async function demandeParId(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [ligne] = await db.select().from(tDemandes).where(eq(tDemandes.id, id)).limit(1);
  return ligne;
}

export async function changerStatutDemande(
  id: string,
  statut: StatutDemande,
  notesInternes?: string,
): Promise<void> {
  await db
    .update(tDemandes)
    .set({ statut, ...(notesInternes !== undefined ? { notesInternes } : {}) })
    .where(eq(tDemandes.id, id));
}

/** Nombre de demandes reçues depuis sept jours. */
export async function demandesRecentes(): Promise<number> {
  const [{ nombre }] = await db
    .select({ nombre: sql<number>`count(*)::int` })
    .from(tDemandes)
    .where(sql`${tDemandes.creeLe} > now() - interval '7 days'`);
  return nombre;
}

export async function compterDemandesParStatut(): Promise<Record<string, number>> {
  const lignes = await db
    .select({ statut: tDemandes.statut, nombre: sql<number>`count(*)::int` })
    .from(tDemandes)
    .groupBy(tDemandes.statut);

  return Object.fromEntries(lignes.map((l) => [l.statut, l.nombre]));
}
