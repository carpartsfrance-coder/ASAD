import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";
import { BlocContact } from "@/components/ui/BlocContact";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageSignaler } from "@/content/pages";
import { routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Signaler un animal",
  description:
    "Vous avez trouvé un animal errant, blessé ou en danger ? Signalez-le à ASAD : un bénévole vous rappelle dans les meilleurs délais.",
  alternates: { canonical: routes.signaler },
};

export default function PageSignaler() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Signaler un animal" }]} />
      </Container>

      <PageHeader
        surtitre="Signalement"
        titre={pageSignaler.titre}
        chapo={pageSignaler.chapo}
      />

      <Container className="pt-8 pb-16 lg:pb-20">
        <div className="max-w-[820px]">
          <div
            role="note"
            className="flex items-start gap-3 rounded-card border border-acc/30 bg-acc-soft p-5 text-body leading-[1.65] text-pri"
          >
            <CircleAlert size={20} strokeWidth={1.9} aria-hidden="true" className="mt-px shrink-0 text-acc" />
            <p>{pageSignaler.urgenceVitale}</p>
          </div>

          <BlocContact
            className="mt-10"
            titre="Signalez-nous l’animal"
            intro="Appelez-nous si la situation est urgente : c’est le plus rapide. Sinon, écrivez-nous, en joignant une photo si vous en avez une."
            objet="Signalement d’un animal"
            aPreparer={[
              "Le lieu le plus précis possible : commune, rue, point de repère.",
              "L’espèce et l’état de l’animal : blessé, errant, très maigre, effrayé.",
              "Depuis quand vous l’observez, et s’il est toujours sur place.",
              "Une photo, si vous avez pu en prendre une sans le mettre en fuite.",
              "Votre numéro de téléphone, pour que nous puissions vous rappeler.",
            ]}
          />
        </div>
      </Container>
    </>
  );
}
