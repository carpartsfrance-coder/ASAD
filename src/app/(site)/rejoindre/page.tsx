import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { BlocContact } from "@/components/ui/BlocContact";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pageBenevolat, pageFamilleAccueil } from "@/content/pages";
import { routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Rejoindre ASAD",
  description:
    "Devenez famille d’accueil ou bénévole chez ASAD. Frais vétérinaires pris en charge, matériel fourni, accompagnement par un bénévole référent.",
  alternates: { canonical: routes.rejoindre },
};

export default function PageRejoindre() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Rejoindre ASAD" }]} />
      </Container>

      <PageHeader
        surtitre="Rejoindre l’association"
        titre="Deux façons de nous rejoindre"
        chapo="Accueillir un animal chez vous, ou donner de votre temps. Les deux sont indispensables, et aucune expérience n’est exigée."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="#famille-accueil" variante="primaire" taille="md">
            Devenir famille d’accueil
          </Button>
          <Button href="#benevolat" variante="contour" taille="md">
            Devenir bénévole
          </Button>
        </div>
      </PageHeader>

      {/* ---------------- Famille d'accueil ---------------- */}
      <Container as="section" id="famille-accueil" aria-labelledby="titre-fa" className="pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHeading
              id="titre-fa"
              titre={pageFamilleAccueil.titre}
              sousTitre={pageFamilleAccueil.chapo}
              align="gauche"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-soft">
            <Image
              src={pageFamilleAccueil.photo.src}
              alt={pageFamilleAccueil.photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-panel bg-white p-7 shadow-soft sm:p-8">
            <h3 className="text-title font-extrabold text-ink">
              Ce que l’association prend en charge
            </h3>
            <ul className="mt-5 space-y-3.5">
              {pageFamilleAccueil.engagements.map((ligne) => (
                <li key={ligne} className="flex items-start gap-3 text-body leading-[1.65] text-mut">
                  <Check size={18} strokeWidth={2.1} aria-hidden="true" className="mt-0.5 shrink-0 text-acc" />
                  {ligne}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel bg-warm p-7 sm:p-8">
            <h3 className="text-title font-extrabold text-ink">
              Ce que nous vous demandons
            </h3>
            <ul className="mt-5 space-y-3.5">
              {pageFamilleAccueil.attentes.map((ligne) => (
                <li key={ligne} className="flex items-start gap-3 text-body leading-[1.65] text-mut">
                  <Check size={18} strokeWidth={2.1} aria-hidden="true" className="mt-0.5 shrink-0 text-acc" />
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-12 text-title font-extrabold text-ink">Comment ça se passe</h3>
        <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pageFamilleAccueil.etapes.map((etape, index) => (
            <li key={etape.titre} className="rounded-card bg-white p-6 shadow-soft">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-soft text-body font-extrabold text-pri"
              >
                {index + 1}
              </span>
              <h4 className="mt-4 text-card font-bold text-ink">{etape.titre}</h4>
              <p className="mt-2 text-body leading-[1.62] text-mut">{etape.texte}</p>
            </li>
          ))}
        </ol>

        <BlocContact
          className="mt-12 max-w-[820px]"
          titre="Vous proposer comme famille d’accueil"
          intro="Aucune expérience n’est exigée : nous vous accompagnons pas à pas. Écrivez-nous ou appelez-nous, nous en parlons tranquillement."
          objet="Candidature — famille d’accueil"
          aPreparer={[
            "Votre prénom, votre nom et votre commune.",
            "Votre logement : maison ou appartement, jardin clôturé ou non.",
            "Les animaux et les enfants déjà présents chez vous.",
            "Les espèces que vous vous sentez d’accueillir, et à partir de quand.",
            "Le temps où l’animal resterait seul dans la journée.",
          ]}
        />
      </Container>

      {/* ---------------- Bénévolat ---------------- */}
      <Container as="section" id="benevolat" aria-labelledby="titre-benevolat" className="pt-20 pb-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHeading
              id="titre-benevolat"
              titre={pageBenevolat.titre}
              sousTitre={pageBenevolat.chapo}
              align="gauche"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-soft">
            <Image
              src={pageBenevolat.photo.src}
              alt={pageBenevolat.photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </div>

        <h3 className="mt-10 text-title font-extrabold text-ink">Les missions</h3>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageBenevolat.missions.map((mission) => (
            <li key={mission.titre} className="rounded-card bg-white p-6 shadow-soft">
              <h4 className="text-card font-bold text-ink">{mission.titre}</h4>
              <p className="mt-2.5 text-body leading-[1.62] text-mut">{mission.texte}</p>
            </li>
          ))}
        </ul>

        <BlocContact
          className="mt-12 max-w-[820px]"
          titre="Rejoindre l’équipe"
          intro="Dites-nous vos disponibilités : nous vous proposerons les missions qui s’en rapprochent."
          objet="Candidature — bénévolat"
          aPreparer={[
            "Votre prénom, votre nom et votre commune.",
            "Les missions qui vous tentent le plus.",
            "Vos disponibilités : quels jours, à quelle fréquence.",
            "Si vous êtes véhiculé, ce qui aide beaucoup pour les transports.",
          ]}
        />
      </Container>
    </>
  );
}
