import type { Metadata } from "next";
import { Heart, Image as ImageIcon, Scissors, ScanLine, Stethoscope, Syringe } from "lucide-react";
import { CampagneCard } from "@/components/animaux/CampagneCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Etiquette } from "@/components/ui/Badge";
import { SmartLink } from "@/components/ui/SmartLink";
import { affectationsDon, typesUrgence } from "@/content/urgences";
import { toutesLesCampagnes } from "@/lib/donnees/editorial";
import { animauxPublies } from "@/lib/donnees/animaux";
import { helloAsso, routes } from "@/content/site";
import { formatDate, formatEuros } from "@/lib/format";

export const metadata: Metadata = {
  title: "Urgences vétérinaires",
  description:
    "Soins, opérations, sorties de fourrière et placements sous 48 heures : soutenez les campagnes d’urgence d’ASAD. Chaque collecte finance des soins précis, pour un animal identifié.",
  alternates: { canonical: routes.urgences },
};

const ICONES = [Syringe, ScanLine, Scissors, Stethoscope];

export const dynamic = "force-dynamic";

export default async function PageUrgences() {
  const campagnes = await toutesLesCampagnes();
  const animaux = await animauxPublies();
  const parSlug = new Map(animaux.map((a) => [a.slug, a]));

  const enCours = campagnes.filter((c) => c.statut === "active");
  const terminees = campagnes.filter((c) => c.statut === "terminee");
  const toutes = [...enCours, ...terminees];

  const derniereMaj = campagnes
    .flatMap((c) => c.misesAJour.map((m) => m.date))
    .sort((a, b) => b.localeCompare(a))[0];

  return (
    <>
      {/* ---------------- Héro pleine largeur ---------------- */}
      <section className="bg-pri py-12 lg:pt-[54px] lg:pb-[58px]">
        <Container>
          <Etiquette>Urgences</Etiquette>

          <h1 className="mt-5 max-w-[760px] text-[32px] leading-[1.14] font-extrabold tracking-[-0.022em] text-white sm:text-[40px] lg:text-[46px]">
            Ils ne peuvent pas attendre
          </h1>

          <p className="mt-4 max-w-[630px] text-[16.5px] leading-[1.74] text-white/78">
            Certaines prises en charge ne se reportent pas. Ces campagnes financent
            des soins précis, pour un animal identifié, avec un objectif et une
            échéance. Le montant affiché est le montant réellement collecté.
          </p>

          <ul className="mt-7 flex flex-wrap gap-3">
            {typesUrgence.map((type) => (
              <li
                key={type}
                className="inline-flex h-[42px] items-center rounded-full border-[1.3px] border-white/32 px-5 text-body text-white/85"
              >
                {type}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="pt-6">
        <Breadcrumb maillons={[{ label: "Urgences vétérinaires" }]} />
      </Container>

      {/* ---------------- Campagnes ---------------- */}
      <Container as="section" aria-labelledby="titre-campagnes" className="pt-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              id="titre-campagnes"
              className="text-[26px] font-extrabold tracking-[-0.018em] text-ink sm:text-[32px]"
            >
              Les collectes en cours
            </h2>
            <p className="mt-2.5 max-w-[600px] text-nav leading-[1.7] text-mut">
              Chaque euro va directement au vétérinaire ou à la fourrière concernée.
              Aucune commission n’est prélevée par l’association.
            </p>
          </div>
          {derniereMaj && (
            <p className="text-meta text-mut">
              Mis à jour le {formatDate(derniereMaj)}
            </p>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {toutes.map((campagne) => (
            <li key={campagne.id} className="flex">
              <CampagneCard
                campagne={campagne}
                animal={campagne.animalSlug ? parSlug.get(campagne.animalSlug) : undefined}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </Container>

      {/* ---------------- Où va votre don ---------------- */}
      <Container as="section" aria-labelledby="titre-affectation" className="pt-16">
        <h2
          id="titre-affectation"
          className="text-[26px] font-extrabold tracking-[-0.018em] text-ink sm:text-[32px]"
        >
          Où va votre don
        </h2>
        <p className="mt-2.5 max-w-[620px] text-nav leading-[1.7] text-mut">
          L’association est 100 % bénévole : personne n’est rémunéré. Voici ce que
          représente concrètement un don.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {affectationsDon.map((ligne, index) => {
            const Icone = ICONES[index % ICONES.length];
            return (
              <li key={ligne.montant} className="rounded-card bg-white p-6 shadow-soft">
                <span className="flex size-14 items-center justify-center rounded-full bg-soft text-pri">
                  <Icone size={26} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <p className="mt-4 text-[28px] font-extrabold text-pri">
                  {formatEuros(ligne.montant)}
                </p>
                <p className="mt-1 text-lead font-bold text-ink">{ligne.titre}</p>
                <p className="mt-2 text-[14px] leading-[1.62] text-mut">{ligne.texte}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 max-w-[720px] text-body leading-[1.7] text-mut">
          Les sommes non utilisées par une campagne rejoignent le fonds d’urgence de
          l’association, qui finance les prises en charge imprévues. Son emploi est
          présenté chaque année en assemblée générale.
        </p>
      </Container>

      {/* ---------------- CTA HelloAsso ---------------- */}
      <Container className="pt-16 pb-16 lg:pb-20">
        <div className="grid items-center gap-10 rounded-panel bg-warm p-7 sm:p-10 lg:grid-cols-[1fr_0.85fr] lg:p-[42px]">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-[-0.015em] text-ink sm:text-[30px]">
              Soutenir le fonds d’urgence
            </h2>
            <p className="mt-4 max-w-[520px] text-nav leading-[1.72] text-mut">
              Un don ponctuel ou mensuel permet d’intervenir sans attendre qu’une
              collecte soit lancée. C’est ce qui nous permet de dire oui à une prise
              en charge le jour même.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Button
                href={helloAsso.don}
                externe
                variante="accent"
                taille="lg"
                icone={<Heart size={18} strokeWidth={1.8} aria-hidden="true" />}
              >
                Donner sur HelloAsso
              </Button>
              <SmartLink
                href={routes.don}
                className="link-underline text-body font-semibold text-acc hover:text-acc-dark"
              >
                Voir toutes les façons de donner
              </SmartLink>
            </div>

            <p className="mt-6 max-w-[520px] text-meta leading-[1.7] text-mut">
              L’association n’est pas habilitée à délivrer de reçu ouvrant droit à
              une réduction d’impôt. Un reçu de paiement vous est adressé par
              HelloAsso après chaque don.
            </p>
          </div>

          {/* Zone réservée au widget HelloAsso */}
          {helloAsso.iframe ? (
            <div className="overflow-hidden rounded-urgent bg-white shadow-card">
              <iframe
                src={helloAsso.iframe}
                title="Formulaire de don HelloAsso"
                className="h-[420px] w-full border-0"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex min-h-[236px] flex-col items-center justify-center gap-3 rounded-urgent border-[1.6px] border-dashed border-pri/25 bg-white/55 p-8 text-center">
              <ImageIcon size={30} strokeWidth={1.5} aria-hidden="true" className="text-mut" />
              <p className="text-body font-semibold text-mut">
                Emplacement du widget HelloAsso
              </p>
              <p className="max-w-[280px] text-tiny leading-[1.6] text-mut">
                Renseignez <code className="font-mono">NEXT_PUBLIC_HELLOASSO_IFRAME</code>{" "}
                pour l’afficher ici.
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
