import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { IconCircle } from "@/components/ui/IconCircle";
import { PageHeader } from "@/components/ui/PageHeader";
import { AideIcon } from "@/components/ui/StatIcon";
import { Button } from "@/components/ui/Button";
import { faconsAider } from "@/content/aider";
import { ctas, routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Nous aider",
  description:
    "Don, famille d’accueil, bénévolat : trois façons concrètes de soutenir ASAD et les animaux que l’association recueille.",
  alternates: { canonical: routes.aider },
};

export default function PageAider() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Nous aider" }]} />
      </Container>

      <PageHeader
        surtitre="Nous aider"
        titre="Chaque geste peut changer une vie"
        chapo="L’association fonctionne uniquement grâce à ses soutiens. Que vous ayez du temps, de la place ou quelques euros, il existe une façon d’aider qui vous ressemble."
      >
        <Button href={ctas.don.href} externe variante="accent" taille="md">
          {ctas.don.label}
        </Button>
      </PageHeader>

      <Container className="pt-12 pb-16 lg:pb-20">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {faconsAider.map((facon) => (
            <li key={facon.id} className="flex">
              <div className="flex w-full flex-col rounded-card bg-white p-7 shadow-soft">
                <IconCircle taille={72}>
                  <AideIcon icone={facon.icone} />
                </IconCircle>
                <h2 className="mt-5 text-card font-bold text-ink">{facon.titre}</h2>
                <p className="mt-3 mb-5 flex-1 text-body leading-[1.62] text-mut">
                  {facon.texte}
                </p>
                <ArrowLink href={facon.href} externe={facon.externe}>
                  {facon.lienLabel}
                </ArrowLink>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
