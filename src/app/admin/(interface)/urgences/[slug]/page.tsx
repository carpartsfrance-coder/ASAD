import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { EditeurCampagne } from "@/components/admin/EditeurCampagne";
import { EnTetePageAdmin } from "@/components/admin/primitives";
import { effacerCampagne } from "@/app/actions/editorial";
import { exigerCapacite } from "@/lib/auth/garde";
import { campagneParSlug } from "@/lib/donnees/editorial-ecriture";
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

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campagne = await campagneParSlug(slug);
  return { title: campagne?.titre ?? "Collecte introuvable" };
}

export default async function PageCampagneAdmin({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await exigerCapacite("urgences:ecrire", "Urgences");

  const { slug } = await params;
  const ligne = await campagneParSlug(slug);
  if (!ligne) notFound();

  const animaux = await optionsAnimaux();

  return (
    <>
      <EnTetePageAdmin titre={ligne.titre} sousTitre="Modifier la collecte" />

      <div className="mt-6">
        <EditeurCampagne
          animaux={animaux}
          animalId={ligne.animalId}
          campagne={{
            id: ligne.id,
            slug: ligne.slug,
            titre: ligne.titre,
            type: ligne.type,
            description: ligne.description,
            echeance: ligne.echeance,
            dateLimite: ligne.dateLimite ?? undefined,
            objectif: ligne.objectif,
            collecte: ligne.collecte,
            lienHelloAsso: ligne.lienHelloAsso ?? undefined,
            photo: { src: ligne.photoUrl, alt: ligne.photoAlt },
            statut: ligne.statut,
            ctaLabel: ligne.ctaLabel,
            remerciement: ligne.remerciement ?? undefined,
            misesAJour: ligne.misesAJour.map((m) => ({ date: m.date, texte: m.texte })),
            afficherSurAccueil: ligne.afficherSurAccueil,
          }}
        />
      </div>

      <form action={effacerCampagne} className="mt-4 rounded-media border border-line p-4">
        <input type="hidden" name="id" value={ligne.id} />
        <p className="text-meta font-semibold text-ink">Supprimer cette collecte</p>
        <p className="mt-1 text-tiny leading-[1.6] text-mut">
          Pour la retirer du site sans l’effacer, passez-la en « Terminée ».
        </p>
        <button
          type="submit"
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-btn border-[1.4px] border-erreur/40 bg-white px-3.5 text-meta font-semibold text-erreur transition-colors duration-150 hover:bg-alerte"
        >
          <Trash2 size={16} strokeWidth={1.9} aria-hidden="true" />
          Supprimer définitivement
        </button>
      </form>
    </>
  );
}
