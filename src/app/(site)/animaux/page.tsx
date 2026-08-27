import type { Metadata } from "next";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CatalogueAnimaux } from "@/components/animaux/CatalogueAnimaux";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageCatalogue } from "@/content/pages";
import { routes } from "@/content/site";
import { type FiltresAnimaux } from "@/lib/animaux";
import { animauxCatalogue } from "@/lib/donnees/animaux";

export const metadata: Metadata = {
  title: "Nos animaux à adopter",
  description:
    "Découvrez les chiens, chats et autres animaux à l’adoption chez ASAD, dans l’Hérault et le Gard. Filtrez par espèce, âge, sexe, taille, compatibilité et statut.",
  alternates: { canonical: routes.animaux },
};

export const dynamic = "force-dynamic";

export default async function PageAnimaux({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lire = (cle: string): string | undefined => {
    const valeur = params[cle];
    return Array.isArray(valeur) ? valeur[0] : valeur;
  };

  const filtresInitiaux: Partial<FiltresAnimaux> = {
    espece: lire("espece") as FiltresAnimaux["espece"],
    sexe: lire("sexe") as FiltresAnimaux["sexe"],
    age: lire("age") as FiltresAnimaux["age"],
    taille: lire("taille") as FiltresAnimaux["taille"],
    compatibilite: lire("compatibilite") as FiltresAnimaux["compatibilite"],
    statut: lire("statut") as FiltresAnimaux["statut"],
    recherche: lire("recherche"),
    tri: lire("tri") as FiltresAnimaux["tri"],
  };

  const pageInitiale = Math.max(1, Number(lire("page") ?? 1) || 1);

  return (
    <>
      <Container className="pt-3">
        <Breadcrumb maillons={[{ label: "Nos animaux" }]} />
      </Container>

      {/*
        Héro resserré : à 1366 × 900, les premières photos doivent être
        visibles sans faire défiler. Le texte reste, les marges maigrissent.
      */}
      <Container as="section" className="pt-3">
        <p className="mb-2.5 text-tiny font-bold tracking-[0.2em] text-pri uppercase">
          {pageCatalogue.surtitre}
        </p>
        <h1 className="max-w-[620px] text-[28px] leading-[1.14] font-extrabold tracking-[-0.022em] text-ink sm:text-[34px] lg:text-[38px]">
          {pageCatalogue.titre}
        </h1>
        <p className="mt-2.5 max-w-[68ch] text-nav leading-[1.6] text-mut">
          {pageCatalogue.chapo}
        </p>
      </Container>

      {/*
        « Comment adopter ? » — bandeau plat sur ordinateur, deux colonnes sur
        tablette, bloc repliable sur mobile pour ne pas repousser les cartes.
      */}
      <Container className="pt-4">
        {/* Mobile : replié par défaut, ouverture native et accessible. */}
        <details className="group rounded-panel bg-white shadow-card md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-body font-bold text-ink [&::-webkit-details-marker]:hidden">
            Comment adopter ?
            <ChevronDown
              size={19}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-acc transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <ol className="space-y-3.5 px-5 pb-5">
            {pageCatalogue.encart.etapes.map((etape, index) => (
              <li key={etape.titre} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-soft text-mini font-extrabold text-pri"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-body font-semibold text-ink">{etape.titre}</p>
                  <p className="mt-0.5 text-mini leading-[1.55] text-mut">{etape.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </details>

        {/* Tablette et ordinateur : un bandeau, deux puis quatre colonnes. */}
        <section
          aria-label={pageCatalogue.encart.titre}
          className="hidden rounded-panel bg-white px-5 py-3.5 shadow-card md:block"
        >
          <ol className="grid gap-x-6 gap-y-3.5 md:grid-cols-2 lg:grid-cols-4">
            {pageCatalogue.encart.etapes.map((etape, index) => (
              <li key={etape.titre} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-soft text-mini font-extrabold text-pri"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-mini font-bold text-ink">{etape.titre}</p>
                  <p className="mt-0.5 text-mini leading-[1.5] text-mut lg:hidden">{etape.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      {/* Recherche, filtres et grille */}
      <Container className="pt-4">
        <CatalogueAnimaux animaux={await animauxCatalogue()} filtresInitiaux={filtresInitiaux}
          pageInitiale={pageInitiale}
        />
      </Container>

      {/* Encadré final */}
      <Container className="pt-16 pb-16 lg:pb-20">
        <div className="grid items-center gap-7 rounded-panel bg-warm p-5 sm:p-[22px] lg:grid-cols-[0.62fr_1fr] lg:gap-10">
          <div className="relative h-[220px] overflow-hidden rounded-media bg-black/5 lg:h-[258px]">
            <Image
              src={pageCatalogue.encartFinal.photo.src}
              alt={pageCatalogue.encartFinal.photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="lg:pr-8">
            <h2 className="text-[21px] font-extrabold tracking-[-0.012em] text-ink lg:text-title">
              {pageCatalogue.encartFinal.titre}
            </h2>
            <p className="mt-3 max-w-[520px] text-nav leading-[1.72] text-mut">
              {pageCatalogue.encartFinal.texte}
            </p>
            <Button href={routes.rejoindre} variante="accent" taille="md" className="mt-6">
              {pageCatalogue.encartFinal.ctaLabel}
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
