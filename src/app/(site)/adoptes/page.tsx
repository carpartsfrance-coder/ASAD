import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  HousePlus,
  Stethoscope,
  Target,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { AnimalCard } from "@/components/animaux/AnimalCard";
import { animauxAdoptes, animauxDisponibles } from "@/lib/donnees/animaux";
import { pageAdoptes } from "@/content/pages";
import { helloAsso, routes } from "@/content/site";
import type { Animal } from "@/types";
import { configSite } from "@/lib/donnees/config-site";

export const metadata: Metadata = {
  title: "Ils ont trouvé leur famille",
  description:
    "Recueillis, soignés et accompagnés par l’ASAD, ils vivent aujourd’hui une nouvelle histoire. Découvrez les animaux adoptés grâce à l’association.",
  alternates: { canonical: routes.adoptes },
};

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Petites briques propres à cette page                                */
/* ------------------------------------------------------------------ */

const ICONES = {
  cible: Target,
  soin: Stethoscope,
  maison: HousePlus,
  coeur: Heart,
  accueil: HousePlus,
} as const;

/** Bouton plein rouge, tel que décrit dans la maquette. */
function BoutonPlein({
  href,
  externe,
  children,
  className,
}: {
  href: string;
  externe?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      externe={externe}
      className={`inline-flex items-center justify-center rounded-btn bg-acc px-[26px] py-[17px] text-nav font-bold text-white transition-colors duration-150 hover:bg-acc-dark ${className ?? ""}`}
    >
      {children}
    </SmartLink>
  );
}

/** Bouton contour gris, second rôle. */
function BoutonContour({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={`inline-flex items-center justify-center rounded-btn border border-line bg-white px-[26px] py-4 text-nav font-semibold text-ink transition-colors duration-150 hover:border-pri ${className ?? ""}`}
    >
      {children}
    </SmartLink>
  );
}

/** Année d'adoption, pour le badge des cartes histoire. */
function anneeAdoption(animal: Animal): string | null {
  const date = animal.suiteAdoption?.date;
  return date ? date.slice(0, 4) : null;
}

/* ------------------------------------------------------------------ */

export default async function PageAdoptes() {
  const adoptes = await animauxAdoptes();
  const disponibles = (await animauxDisponibles()).slice(0, 3);

  /* Mosaïque du héro : quatre photos réglées depuis le back-office. */
  const config = await configSite();
  const mosaique = config.photos.adoptes.filter((p) => p?.src).slice(0, 4);

  return (
    <>
      {/* ---------------- 1. Héro ---------------- */}
      <Container as="section" className="pt-6 pb-14 lg:pt-11 lg:pb-[60px]">
        <div className="grid gap-10 lg:grid-cols-[600px_1fr] lg:gap-14">
          <div className="lg:pt-5">
            <Breadcrumb maillons={[{ label: "Adoptés" }]} />

            <p className="mt-8 text-mini font-extrabold tracking-[0.14em] uppercase text-acc lg:mt-11">
              {pageAdoptes.surtitre}
            </p>

            <h1 className="mt-5 text-[36px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink lg:text-[58px] lg:leading-[1.06] lg:tracking-[-0.03em]">
              {pageAdoptes.titreLigne1}
              <br className="hidden lg:inline" />{" "}
              {pageAdoptes.titreLigne2}
            </h1>

            <p className="mt-6 max-w-[430px] text-[15px] leading-[1.65] text-mut lg:text-[17px]">
              {pageAdoptes.chapo}
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row lg:mt-9">
              <BoutonPlein href={routes.animaux} className="max-sm:w-full">
                Voir les animaux à adopter
              </BoutonPlein>
              <BoutonContour href={routes.rejoindre} className="max-sm:w-full">
                Devenir famille d’accueil
              </BoutonContour>
            </div>
          </div>

          {/* Mosaïque : 2 × 2 sur grand écran, une grande + trois vignettes sur mobile. */}
          {mosaique.length > 0 && (
            <div>
              <div className="relative h-[190px] overflow-hidden rounded-media bg-subtil lg:hidden">
                <Image
                  src={mosaique[0].src}
                  alt={mosaique[0].alt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 lg:hidden">
                {mosaique.slice(1, 4).map((photo) => (
                  <div
                    key={photo.src}
                    className="relative h-[92px] overflow-hidden rounded-[10px] bg-subtil"
                  >
                    <Image src={photo.src} alt={photo.alt} fill sizes="33vw" className="object-cover" />
                  </div>
                ))}
              </div>

              <div className="hidden grid-cols-2 gap-3.5 lg:grid lg:grid-rows-[250px_250px]">
                {mosaique.map((photo, index) => (
                  <div
                    key={photo.src}
                    className="relative overflow-hidden rounded-card bg-subtil"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="25vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* ---------------- 2. Le parcours en quatre étapes ---------------- */}
      <section aria-label={pageAdoptes.parcours.libelle} className="bg-subtil">
        <Container className="py-[30px] lg:py-11">
          <p className="mb-4 text-micro font-extrabold tracking-[0.14em] uppercase text-mut lg:hidden">
            {pageAdoptes.parcours.libelle}
          </p>
          <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[34px]">
            {pageAdoptes.parcours.etapes.map((etape, index) => {
              const Icone = ICONES[etape.icone];
              return (
                <li
                  key={etape.titre}
                  className="rounded-media border border-line bg-white p-4 lg:border-0 lg:bg-transparent lg:p-0"
                >
                  <div className="flex items-center justify-between lg:justify-start">
                    <span
                      aria-hidden="true"
                      className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-acc text-mini font-extrabold text-white lg:size-[30px] lg:text-body"
                    >
                      {index + 1}
                    </span>
                    <Icone
                      size={22}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="text-ink lg:hidden"
                    />
                  </div>
                  <p className="mt-3 text-nav font-bold text-ink">{etape.titre}</p>
                  <p className="mt-1.5 text-mini leading-[1.55] text-mut lg:leading-[1.6]">
                    {etape.texte}
                  </p>
                  <Icone
                    size={28}
                    strokeWidth={1.4}
                    aria-hidden="true"
                    className="mt-4 ml-11 hidden text-ink lg:block"
                  />
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ---------------- 3. Leur nouvelle vie ---------------- */}
      <Container className="pt-12 lg:pt-16">
        <h2 className="text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
          {pageAdoptes.histoires.titre}
        </h2>

        {adoptes.length === 0 ? (
          <p className="mt-6 max-w-[52ch] text-quote leading-[1.7] text-mut">
            La première histoire s’écrit en ce moment. Cette page se remplira au
            fur et à mesure des adoptions.
          </p>
        ) : (
          <div className="mt-7 space-y-6 lg:space-y-[26px]">
            {adoptes.map((animal, index) => {
              const photo = animal.suiteAdoption?.photo ?? animal.galerie[0];
              const annee = anneeAdoption(animal);
              const feminin = animal.sexe === "femelle";
              const photoADroite = index % 2 === 1;

              return (
                <article
                  key={animal.id}
                  className="group grid overflow-hidden rounded-panel border border-line bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,.08)] lg:grid-cols-2"
                >
                  {photo && (
                    <div
                      className={`relative h-[220px] lg:h-auto lg:min-h-[380px] ${
                        photoADroite ? "lg:order-2" : ""
                      }`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        loading="lazy"
                        className="object-cover"
                      />
                      {annee && (
                        <span className="absolute top-3 left-3 rounded-tag bg-white px-3 py-1.5 text-micro font-extrabold tracking-[0.1em] uppercase text-acc lg:hidden">
                          Adopté{feminin ? "e" : ""} en {annee}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col px-5 pt-5 lg:px-11 lg:py-10 ${
                      photoADroite ? "lg:order-1" : ""
                    }`}
                  >
                    {annee && (
                      <span className="hidden w-fit rounded-tag bg-acc-soft px-3 py-[7px] text-micro font-extrabold tracking-[0.1em] uppercase text-acc lg:mb-[22px] lg:inline-block">
                        Adopté{feminin ? "e" : ""} en {annee}
                      </span>
                    )}

                    <h3 className="text-[24px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink lg:text-[30px]">
                      {animal.nom}
                    </h3>

                    <p className="mt-4 max-w-[460px] text-[15px] leading-[1.7] text-mut lg:text-quote">
                      {animal.suiteAdoption?.recit || animal.descriptionCourte}
                    </p>

                    <SmartLink
                      href={routes.animal(animal.slug)}
                      className="mt-5 -mx-5 flex min-h-[52px] items-center justify-between border-t border-line px-5 text-nav font-bold text-acc transition-colors duration-150 hover:text-acc-dark lg:mx-0 lg:mt-auto lg:min-h-0 lg:justify-start lg:gap-2.5 lg:border-0 lg:px-0 lg:pt-8"
                    >
                      Découvrir {feminin ? "son" : "son"} histoire
                      <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                    </SmartLink>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>

      {/* ---------------- 4. Bandeau éditorial ---------------- */}
      <Container className="pt-8">
        <div className="rounded-card bg-subtil p-5 sm:flex sm:items-center sm:gap-6 sm:px-[34px] sm:py-7">
          <span
            aria-hidden="true"
            className="flex size-[52px] shrink-0 items-center justify-center rounded-media bg-acc-soft sm:size-[60px]"
          >
            <Heart size={20} strokeWidth={1.8} className="text-acc" />
          </span>
          <div className="mt-4 sm:mt-0">
            <p className="text-[19px] font-extrabold text-ink sm:text-[20px]">
              {pageAdoptes.bandeau.titre}
            </p>
            <p className="mt-1 text-nav text-mut">{pageAdoptes.bandeau.texte}</p>
          </div>
          <SmartLink
            href={routes.livreOr}
            className="mt-4 flex min-h-[50px] items-center justify-between rounded-cta bg-white px-4 text-nav font-bold text-acc transition-colors duration-150 hover:text-acc-dark sm:mt-0 sm:ml-auto sm:min-h-0 sm:gap-2.5 sm:bg-transparent sm:px-0 sm:whitespace-nowrap"
          >
            {pageAdoptes.bandeau.lienLabel}
            <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
          </SmartLink>
        </div>
      </Container>

      {/* ---------------- 5. Animaux encore disponibles ---------------- */}
      {disponibles.length > 0 && (
        <Container className="pt-12 lg:pt-16">
          <h2 className="text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
            {pageAdoptes.disponibles.titre}
          </h2>
          <p className="mt-2.5 text-quote text-mut">{pageAdoptes.disponibles.sousTitre}</p>

          {/* Carrousel à défilement sur mobile, grille dès la tablette. */}
          <ul className="-mx-5 mt-7 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {disponibles.map((animal) => (
              <li key={animal.id} className="flex w-[258px] shrink-0 snap-start sm:w-auto">
                <AnimalCard animal={animal} className="w-full" />
              </li>
            ))}
          </ul>

          <p className="mt-1 text-tiny text-mut sm:hidden">Faites défiler</p>

          <div className="mt-8 flex justify-center">
            <BoutonPlein href={routes.animaux} className="max-sm:w-full">
              {pageAdoptes.disponibles.ctaLabel}
            </BoutonPlein>
          </div>
        </Container>
      )}

      {/* ---------------- 6. Actions finales ---------------- */}
      <Container className="pt-14 pb-16 lg:pt-14 lg:pb-16">
        <div className="rounded-panel bg-acc-soft px-[18px] py-6 sm:px-10 sm:py-9">
          <ul className="grid gap-0 sm:grid-cols-3">
            {pageAdoptes.actions.map((action, index) => {
              const Icone = ICONES[action.icone];
              const destinations = [routes.animaux, routes.rejoindre, helloAsso.don];
              const destination = destinations[index];

              return (
                <li
                  key={action.titre}
                  className={`border-t border-acc/20 pt-[22px] first:border-t-0 first:pt-0 sm:border-t-0 sm:px-4 sm:pt-0 ${
                    index === 1 ? "sm:border-x sm:border-acc/20 sm:px-8" : ""
                  } ${index > 0 ? "mt-[22px] sm:mt-0" : ""}`}
                >
                  <div className="flex items-center gap-3.5 sm:block">
                    <span
                      aria-hidden="true"
                      className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-acc sm:size-[62px]"
                    >
                      <Icone size={22} strokeWidth={1.7} className="text-white sm:size-[26px]" />
                    </span>
                    <h2 className="text-[18px] font-extrabold text-ink sm:mt-4">
                      {action.titre}
                    </h2>
                  </div>

                  <p className="mt-3 text-body leading-[1.55] text-mut">{action.texte}</p>

                  <SmartLink
                    href={destination}
                    externe={index === 2}
                    className="mt-4 flex min-h-[52px] items-center justify-center rounded-cta border border-acc bg-white px-[18px] text-nav font-bold text-acc transition-colors duration-150 hover:bg-acc hover:text-white sm:mt-5 sm:inline-flex sm:min-h-0 sm:rounded-btn sm:py-3 sm:text-mini"
                  >
                    {action.ctaLabel}
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </>
  );
}
