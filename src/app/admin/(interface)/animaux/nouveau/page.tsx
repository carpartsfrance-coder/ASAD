import type { Metadata } from "next";
import { EditeurAnimal } from "@/components/admin/EditeurAnimal";
import { EnTetePageAdmin } from "@/components/admin/primitives";
import { exigerCapacite } from "@/lib/auth/garde";

export const metadata: Metadata = { title: "Nouvel animal" };

export default async function PageNouvelAnimal() {
  await exigerCapacite("animaux:ecrire", "Animaux");

  return (
    <>
      <EnTetePageAdmin
        titre="Ajouter un animal"
        sousTitre="La fiche est créée en brouillon : elle n’apparaît sur le site que lorsque vous la publiez."
      />
      <div className="mt-6">
        <EditeurAnimal />
      </div>
    </>
  );
}
