import Image from "next/image";
import { ArrowRight, HandHeart, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TraceDePattes } from "./TraceDePattes";
import { configSite } from "@/lib/donnees/config-site";
import { ctas } from "@/content/site";

export async function Hero() {
  const { hero } = await configSite();

  /* Les pattes restent collées au dernier mot : sans ça, elles se
     retrouveraient seules sur une ligne dès que le titre se replie. */
  const mots = hero.titre.trim().split(/\s+/);
  const dernierMot = mots.pop() ?? "";
  const debutDuTitre = mots.join(" ");

  return (
    <Container
      as="section"
      aria-labelledby="titre-accueil"
      className="grid items-center gap-9 lg:grid-cols-[0.95fr_1fr] lg:gap-11"
    >
      {/* Colonne texte */}
      <div className="order-2 pb-10 lg:order-1 lg:pt-10 lg:pb-14">
        <p className="mb-4 text-tiny font-bold tracking-[0.2em] uppercase text-pri lg:mb-5">
          {hero.surtitre}
        </p>

        <h1
          id="titre-accueil"
          className="mb-5 max-w-[555px] text-[34px] leading-[1.12] font-extrabold tracking-[-0.022em] text-ink sm:text-[42px] lg:mb-[26px] lg:text-hero"
        >
          {debutDuTitre && `${debutDuTitre} `}
          <span className="whitespace-nowrap">
            {dernierMot}
            <TraceDePattes className="ml-[0.24em] translate-y-[-0.02em]" />
          </span>
        </h1>

        <p className="mb-8 max-w-[430px] text-[16.5px] leading-[1.72] text-mut lg:mb-[34px] lg:text-card">
          {hero.chapo}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            href={ctas.voirAnimaux.href}
            variante="primaire"
            icone={<ArrowRight size={19} strokeWidth={1.9} aria-hidden="true" />}
          >
            {ctas.voirAnimaux.label}
          </Button>

          <Button
            href={ctas.soutenir.href}
            variante="contourAccent"
            icone={<Heart size={18} strokeWidth={1.8} aria-hidden="true" />}
          >
            {ctas.soutenir.label}
          </Button>
        </div>
      </div>

      {/* Colonne image */}
      <div className="relative order-1 h-[380px] sm:h-[480px] lg:order-2 lg:h-[612px]">
        <div className="arch absolute inset-0 overflow-hidden bg-soft">
          <Image
            src={hero.photo.src}
            alt={hero.photo.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            priority
            className="object-cover"
          />
        </div>

        {/* Pastille flottante « 100 % bénévole » */}
        <div className="absolute right-4 bottom-5 flex items-center gap-3.5 rounded-card bg-white py-[15px] pr-[26px] pl-[18px] shadow-float lg:right-[26px] lg:bottom-[34px]">
          <HandHeart
            size={30}
            strokeWidth={1.6}
            aria-hidden="true"
            className="shrink-0 text-pri"
          />
          <p>
            <span className="block text-stat leading-[1.15] font-extrabold text-ink">
              {"100 %"}
            </span>
            <span className="block text-[14px] text-mut">
              {"bénévole"}
            </span>
          </p>
        </div>
      </div>
    </Container>
  );
}
