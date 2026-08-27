import type { Metadata } from "next";
import { EnTetePageAdmin } from "@/components/admin/primitives";
import { FormulaireContenu } from "@/components/admin/FormulaireContenu";
import { exigerCapacite } from "@/lib/auth/garde";
import { entreesParRubrique } from "@/lib/donnees/contenu";

export const metadata: Metadata = { title: "Contenu du site" };
export const dynamic = "force-dynamic";

export default async function PageContenu() {
  await exigerCapacite("contenu:ecrire", "Contenu du site");

  const entrees = await entreesParRubrique("accueil");

  return (
    <>
      <EnTetePageAdmin
        titre="Contenu du site"
        sousTitre="Les textes de la page d’accueil. Les modifications sont visibles aussitôt."
      />

      <div className="mt-6 max-w-[820px]">
        <FormulaireContenu
          entrees={entrees}
          rubriques={[
            {
              cle: "accueil",
              titre: "Page d’accueil",
              description:
                "Le grand titre, la phrase d’accroche et les titres de sections.",
            },
          ]}
        />
      </div>
    </>
  );
}
