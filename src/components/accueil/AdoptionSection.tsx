import { AnimalGrid } from "@/components/animaux/AnimalGrid";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { configSite } from "@/lib/donnees/config-site";
import { routes } from "@/content/site";
import { animauxAccueil } from "@/lib/donnees/animaux";

/** Section « Ils attendent une famille ». */
export async function AdoptionSection() {
  const [selection, config] = await Promise.all([animauxAccueil(3), configSite()]);

  return (
    <Container
      as="section"
      id="animaux"
      aria-labelledby="titre-animaux"
      className="pt-14 lg:pt-[74px]"
    >
      <SectionHeading
        id="titre-animaux"
        titre={config.titres.animaux}
        sousTitre={config.titres.animauxSousTitre}
      >
        <div className="mt-6 flex justify-center">
          <ArrowLink href={routes.animaux} taille="md">
            {"Voir tous les animaux"}
          </ArrowLink>
        </div>
      </SectionHeading>

      <AnimalGrid animaux={selection} className="mt-10 lg:mt-[42px]" />
    </Container>
  );
}
