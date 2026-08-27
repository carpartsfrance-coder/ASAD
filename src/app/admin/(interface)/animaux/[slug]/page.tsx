import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BandeauConfirmation } from "@/components/admin/BandeauConfirmation";
import { EditeurAnimal } from "@/components/admin/EditeurAnimal";
import { EnTetePageAdmin, PiluleStatut } from "@/components/admin/primitives";
import { exigerCapacite } from "@/lib/auth/garde";
import { ficheParSlug } from "@/lib/donnees/animaux";
import { libelleStatut, sousTitreAnimal } from "@/lib/animaux";
import { routes } from "@/content/site";
import { TON_STATUT } from "../page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fiche = await ficheParSlug(slug);
  return { title: fiche ? fiche.nom : "Fiche introuvable" };
}

export default async function PageFicheAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigerCapacite("animaux:ecrire", "Animaux");

  const { slug } = await params;
  const fiche = await ficheParSlug(slug);
  if (!fiche) notFound();

  const params2 = await searchParams;

  return (
    <>
      {params2.enregistre && (
        <BandeauConfirmation
          message={`La fiche de ${fiche.nom} a bien été enregistrée.`}
          lien={fiche.statut !== "brouillon" ? routes.animal(fiche.slug) : undefined}
          lienLabel="Voir sur le site"
        />
      )}

      <EnTetePageAdmin
        titre={fiche.nom}
        sousTitre={`${sousTitreAnimal(fiche)} · ${fiche.commune}`}
        actions={
          <PiluleStatut ton={TON_STATUT[fiche.statut]}>
            {libelleStatut[fiche.statut]}
          </PiluleStatut>
        }
      />

      <div className="mt-6">
        <EditeurAnimal fiche={fiche} />
      </div>
    </>
  );
}
