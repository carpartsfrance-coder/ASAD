import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalGrid } from "@/components/animaux/AnimalGrid";
import { ColonneAnimal, EncadreAnimal } from "@/components/animaux/FicheAnimal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { routes, siteUrl } from "@/content/site";
import { libelleEspeceAccordee, libelleRace, libelleSexe } from "@/lib/animaux";
import { animalParSlug, animauxSimilaires } from "@/lib/donnees/animaux";

/* Le contenu vient de la base : la page se rend à chaque visite,
   pour que les modifications du back-office soient visibles aussitôt. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const animal = await animalParSlug(slug);

  if (!animal) return { title: "Animal introuvable" };

  const titre = `${animal.nom} — ${libelleEspeceAccordee(animal)}, ${animal.age}`;
  const description =
    animal.statut === "adopte"
      ? `${animal.nom} a trouvé sa famille. Découvrez son histoire et les animaux qui attendent encore la leur.`
      : `${animal.descriptionCourte} ${animal.nom} est à l’adoption chez ASAD, ${animal.commune}.`;

  return {
    title: titre,
    description,
    alternates: { canonical: routes.animal(animal.slug) },
    openGraph: {
      title: titre,
      description,
      type: "article",
      images: [{ url: animal.photoPrincipale.src, alt: animal.photoPrincipale.alt }],
    },
  };
}

export default async function PageAnimal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const animal = await animalParSlug(slug);

  if (!animal) notFound();

  const similaires = await animauxSimilaires(animal, 3);

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: animal.nom,
    description: animal.descriptionCourte,
    image: `${siteUrl}${animal.photoPrincipale.src}`,
    category: libelleEspeceAccordee(animal),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Espèce", value: libelleEspeceAccordee(animal) },
      { "@type": "PropertyValue", name: "Sexe", value: libelleSexe[animal.sexe] },
      { "@type": "PropertyValue", name: "Âge", value: animal.age },
      { "@type": "PropertyValue", name: "Race", value: libelleRace(animal) },
      ...(animal.identification
        ? [{ "@type": "PropertyValue", name: "Identification", value: animal.identification }]
        : []),
    ],
    offers: {
      "@type": "Offer",
      price: animal.fraisAdoption,
      priceCurrency: "EUR",
      availability:
        animal.statut === "a_adopter" || animal.statut === "urgent"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}${routes.animal(animal.slug)}`,
    },
  };

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb
          maillons={[
            { label: "Nos animaux", href: routes.animaux },
            { label: animal.nom },
          ]}
        />
      </Container>

      <Container className="pt-6 lg:pt-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_372px] lg:gap-[42px]">
          <ColonneAnimal animal={animal} />
          <EncadreAnimal animal={animal} />
        </div>
      </Container>

      {similaires.length > 0 && (
        <Container className="pt-16 pb-16 lg:pb-20">
          <SectionHeading titre="Vous pourriez aussi les aimer" />
          <AnimalGrid animaux={similaires} className="mt-10" />
        </Container>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
    </>
  );
}
