import type { Metadata } from "next";
import { EnTetePageAdmin } from "@/components/admin/primitives";
import { FormulaireContenu } from "@/components/admin/FormulaireContenu";
import { exigerCapacite } from "@/lib/auth/garde";
import { entreesParRubrique } from "@/lib/donnees/contenu";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function PageParametres() {
  await exigerCapacite("parametres:ecrire", "Paramètres");

  const [coordonnees, liens] = await Promise.all([
    entreesParRubrique("coordonnees"),
    entreesParRubrique("liens"),
  ]);

  return (
    <>
      <EnTetePageAdmin
        titre="Paramètres"
        sousTitre="Les coordonnées de l’association et les liens vers HelloAsso et les réseaux."
      />

      <div className="mt-6 max-w-[820px]">
        <FormulaireContenu
          entrees={[...coordonnees, ...liens]}
          rubriques={[
            {
              cle: "coordonnees",
              titre: "Coordonnées",
              description: "Affichées dans le pied de page, sur la page contact et dans les mentions légales.",
            },
            {
              cle: "liens",
              titre: "Liens externes",
              description:
                "HelloAsso encaisse les dons : ces adresses sont celles de vos formulaires.",
            },
          ]}
        />
      </div>
    </>
  );
}
