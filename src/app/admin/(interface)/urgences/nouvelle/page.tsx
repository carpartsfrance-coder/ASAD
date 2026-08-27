import type { Metadata } from "next";
import { EditeurCampagne } from "@/components/admin/EditeurCampagne";
import { EnTetePageAdmin } from "@/components/admin/primitives";
import { exigerCapacite } from "@/lib/auth/garde";
import { db } from "@/db";
import { animaux as tAnimaux } from "@/db/schema";
import { ne } from "drizzle-orm";

/** Liste des animaux proposables comme sujet d'une collecte. */
async function optionsAnimaux() {
  const lignes = await db
    .select({ id: tAnimaux.id, nom: tAnimaux.nom })
    .from(tAnimaux)
    .where(ne(tAnimaux.statut, "brouillon"))
    .orderBy(tAnimaux.nom);
  return lignes;
}

export const metadata: Metadata = { title: "Nouvelle collecte" };
export const dynamic = "force-dynamic";

export default async function PageNouvelleCampagne() {
  await exigerCapacite("urgences:ecrire", "Urgences");
  const animaux = await optionsAnimaux();

  return (
    <>
      <EnTetePageAdmin
        titre="Lancer une collecte"
        sousTitre="Indiquez un objectif et le montant déjà reçu : la barre du site en découle."
      />
      <div className="mt-6">
        <EditeurCampagne animaux={animaux} />
      </div>
    </>
  );
}
