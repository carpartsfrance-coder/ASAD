import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { IconCircle } from "@/components/ui/IconCircle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AideIcon } from "@/components/ui/StatIcon";
import { configSite } from "@/lib/donnees/config-site";
import { faconsAider } from "@/content/aider";

/** Section « Chaque geste peut changer une vie ». */
export async function HelpSection() {
  const config = await configSite();

  return (
    <Container
      as="section"
      id="aider"
      aria-labelledby="titre-aider"
      className="pt-14 lg:pt-[66px]"
    >
      <SectionHeading
        id="titre-aider"
        titre={config.titres.aider}
        className="mb-9 lg:mb-10"
      />

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[26px]">
        {faconsAider.map((facon) => (
          <li key={facon.id} className="flex">
            <div className="flex w-full gap-5 rounded-card bg-white px-7 pt-7 pb-6.5 shadow-soft lg:gap-[22px] lg:p-7 lg:pb-[26px]">
              <IconCircle taille={72}>
                <AideIcon icone={facon.icone} />
              </IconCircle>

              <div>
                <h3 className="mb-2.5 text-card font-bold text-ink">
                  {facon.titre}
                </h3>
                <p className="mb-4 text-body leading-[1.62] text-mut">
                  {facon.texte}
                </p>
                <ArrowLink href={facon.href} externe={facon.externe}>
                  {facon.lienLabel}
                </ArrowLink>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
