import { Heart } from "lucide-react";
import { UrgentCard } from "@/components/animaux/UrgentCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Etiquette } from "@/components/ui/Badge";
import { sectionUrgences } from "@/content/accueil";
import { configSite } from "@/lib/donnees/config-site";
import { routes } from "@/content/site";
import { urgencesAccueil } from "@/lib/donnees/animaux";

/** Bandeau sombre « Ils sont en détresse ». */
export async function UrgencesBand() {
  const [urgents, config] = await Promise.all([urgencesAccueil(3), configSite()]);
  if (urgents.length === 0) return null;

  return (
    <Container
      as="section"
      id="urgences"
      aria-labelledby="titre-urgences"
      className="pt-12 lg:pt-[58px]"
    >
      <div className="rounded-panel bg-pri px-6 pt-8 pb-9 sm:px-9 lg:px-[38px] lg:pt-[38px] lg:pb-10">
        <div className="mb-7 flex flex-col gap-6 lg:mb-[30px] lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <Etiquette>{sectionUrgences.etiquette}</Etiquette>
            <h2
              id="titre-urgences"
              className="mt-5 mb-3 text-[28px] leading-tight font-extrabold tracking-[-0.018em] text-white sm:text-[32px] lg:text-section"
            >
              {config.titres.urgences}
            </h2>
            <p className="max-w-[560px] text-lead leading-[1.68] text-white/78">
              {config.titres.urgencesChapo}
            </p>
          </div>

          <ArrowLink href={routes.urgences} ton="clair" taille="md" className="shrink-0 pb-1">
            {sectionUrgences.lienLabel}
          </ArrowLink>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {urgents.map((animal) => (
            <li key={animal.id} className="flex">
              <UrgentCard animal={animal} className="w-full" />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center lg:mt-[34px]">
          <Button
            href={config.liens.urgence}
            externe
            variante="accent"
            taille="md"
            icone={<Heart size={18} strokeWidth={1.8} aria-hidden="true" />}
          >
            {sectionUrgences.ctaLabel}
          </Button>
        </div>
      </div>
    </Container>
  );
}
