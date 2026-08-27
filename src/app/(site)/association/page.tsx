import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { IconCircle } from "@/components/ui/IconCircle";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatIcon } from "@/components/ui/StatIcon";
import { Button } from "@/components/ui/Button";
import { pageAssociation } from "@/content/pages";
import { statistiques } from "@/content/statistiques";
import { association, routes } from "@/content/site";

export const metadata: Metadata = {
  title: "L’association",
  description:
    "ASAD est une association loi 1901 de protection animale, 100 % bénévole. Découvrez nos missions : recueillir, soigner, placer et sensibiliser.",
  alternates: { canonical: routes.association },
};

export default function PageAssociation() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "L’association" }]} />
      </Container>

      <PageHeader
        surtitre={association.formeJuridique}
        titre={pageAssociation.titre}
        chapo={pageAssociation.chapo}
        photo={pageAssociation.photo}
      />

      <Container className="pt-14 lg:pt-16">
        <ul className="grid grid-cols-1 divide-y divide-line rounded-panel bg-white py-6 shadow-stat sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:py-[30px]">
          {statistiques.map((stat) => (
            <li key={stat.id} className="flex items-center justify-center gap-5 px-6 py-5 sm:py-0">
              <IconCircle taille={64}>
                <StatIcon icone={stat.icone} />
              </IconCircle>
              <p>
                <span className="block text-[30px] leading-[1.1] font-extrabold text-pri lg:text-num">
                  {stat.valeur}
                </span>
                <span className="mt-0.5 block text-[15px] text-mut">{stat.libelle}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pt-16">
        <SectionHeading titre="Nos missions" align="gauche" />
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pageAssociation.missions.map((mission) => (
            <li
              key={mission.titre}
              className="rounded-card bg-white p-7 shadow-soft"
            >
              <h3 className="text-card font-bold text-ink">{mission.titre}</h3>
              <p className="mt-3 text-body leading-[1.65] text-mut">{mission.texte}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pt-16 pb-16 lg:pb-20">
        <div className="rounded-panel bg-warm p-7 sm:p-10">
          <SectionHeading titre="Notre fonctionnement" align="gauche" />
          <ul className="mt-6 space-y-4">
            {pageAssociation.fonctionnement.map((ligne) => (
              <li key={ligne} className="flex items-start gap-3 text-[16px] leading-[1.7] text-mut">
                <Check size={19} strokeWidth={2.1} aria-hidden="true" className="mt-1 shrink-0 text-acc" />
                {ligne}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={routes.aider} variante="primaire" taille="md">
              Nous aider
            </Button>
            <Button href={routes.contact} variante="contour" taille="md">
              Nous contacter
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
