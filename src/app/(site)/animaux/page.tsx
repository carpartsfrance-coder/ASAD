import type { Metadata } from "next";
import Image from "next/image";
import { CatalogueAnimaux } from "@/components/animaux/CatalogueAnimaux";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageCatalogue } from "@/content/pages";
import { routes } from "@/content/site";
import { type FiltresAnimaux } from "@/lib/animaux";
import { animauxPublies } from "@/lib/donnees/animaux";

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

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Nos animaux" }]} />
      </Container>

      {/* Héro compact */}
      <Container as="section" className="grid gap-8 pt-[30px] lg:grid-cols-[1fr_0.82fr] lg:gap-12">
        <div>
          <p className="mb-4 text-tiny font-bold tracking-[0.2em] text-pri uppercase">
            {pageCatalogue.surtitre}
          </p>
          <h1 className="max-w-[520px] text-[32px] leading-[1.14] font-extrabold tracking-[-0.022em] text-ink sm:text-[40px] lg:text-[46px]">
            {pageCatalogue.titre}
          </h1>
          <p className="mt-5 max-w-[560px] text-[16.5px] leading-[1.74] text-mut">
            {pageCatalogue.chapo}
          </p>
        </div>

        {/* Encart « Comment se passe une adoption ? » */}
        <aside className="rounded-panel bg-white px-6 pt-[26px] pb-6 shadow-card sm:px-7">
          <h2 className="text-card font-bold text-ink">{pageCatalogue.encart.titre}</h2>
          <ol className="mt-4 space-y-4">
            {pageCatalogue.encart.etapes.map((etape, index) => (
              <li key={etape.titre} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-soft text-mini font-extrabold text-pri"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-body font-semibold text-ink">{etape.titre}</p>
                  <p className="mt-0.5 text-body leading-[1.6] text-mut">{etape.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </Container>

      {/* Recherche, filtres et grille */}
      <Container className="pt-10">
        <CatalogueAnimaux animaux={await animauxPublies()} filtresInitiaux={filtresInitiaux} />
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
