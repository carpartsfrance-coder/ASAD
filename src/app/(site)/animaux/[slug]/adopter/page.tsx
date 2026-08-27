import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Mail, MapPin, Phone, Ruler, Stethoscope } from "lucide-react";
import { BlocContact } from "@/components/ui/BlocContact";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { association, routes } from "@/content/site";
import { formatEuros } from "@/lib/format";
import { libelleEspeceAccordee, libelleTaille, resumeSante } from "@/lib/animaux";
import { animalParSlug } from "@/lib/donnees/animaux";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const animal = await animalParSlug(slug);

  if (!animal) return { title: "Animal introuvable" };

  return {
    title: `Adopter ${animal.nom}`,
    description: `Faites une demande d’adoption pour ${animal.nom}, ${libelleEspeceAccordee(animal).toLowerCase()} de ${animal.age} suivi par l’association ASAD.`,
    alternates: { canonical: routes.adopter(animal.slug) },
    robots: { index: false, follow: true },
  };
}

export default async function PageAdopter({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const animal = await animalParSlug(slug);

  if (!animal) notFound();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb
          maillons={[
            { label: "Nos animaux", href: routes.animaux },
            { label: animal.nom, href: routes.animal(animal.slug) },
            { label: "Demande d’adoption" },
          ]}
        />
      </Container>

      <Container className="pt-6 pb-16 lg:pb-20">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.022em] text-ink sm:text-[34px]">
          Demande d’adoption pour {animal.nom}
        </h1>
        <p className="mt-3 max-w-[640px] text-nav leading-[1.72] text-mut">
          Écrivez-nous ou appelez-nous. Nous en parlons ensemble, puis nous
          organisons une rencontre : ce que nous cherchons à savoir, c’est si
          votre foyer conviendra à {animal.nom}.
        </p>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_340px] lg:gap-[42px]">
          <div className="order-2 lg:order-1">
            <BlocContact
              titre={`Faire une demande pour ${animal.nom}`}
              intro="Aucun formulaire à remplir : dites-nous simplement qui vous êtes et où vous en êtes de votre projet. Nous répondons sous 72 heures."
              objet={`Demande d’adoption — ${animal.nom}`}
              aPreparer={[
                "Votre prénom, votre nom et votre commune.",
                "Votre logement : maison ou appartement, avec ou sans jardin clôturé.",
                "Qui vit avec vous, et l’âge des enfants s’il y en a.",
                "Les animaux déjà présents chez vous.",
                "Le temps où l’animal resterait seul dans la journée.",
                "Ce qui vous attire chez " + animal.nom + ".",
              ]}
            />
          </div>

          {/* Encadré latéral */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
            <div className="rounded-panel bg-white p-6 shadow-card">
              <p className="text-[12px] font-bold tracking-[0.11em] text-acc uppercase">
                Votre demande concerne
              </p>

              <div className="relative mt-4 h-[176px] overflow-hidden rounded-media bg-soft">
                <Image
                  src={animal.photoPrincipale.src}
                  alt={animal.photoPrincipale.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>

              <h2 className="mt-4 text-[21px] font-extrabold text-ink">{animal.nom}</h2>
              <p className="text-body text-mut">
                {libelleEspeceAccordee(animal)}, {animal.age}
              </p>

              <ul className="mt-4 space-y-2.5 text-body text-mut">
                <li className="flex items-center gap-2.5">
                  <MapPin size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-acc" />
                  {animal.commune}
                </li>
                <li className="flex items-center gap-2.5">
                  <Ruler size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-acc" />
                  {libelleTaille[animal.taille]}
                </li>
                <li className="flex items-center gap-2.5">
                  <Stethoscope size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-acc" />
                  {resumeSante(animal)}
                </li>
              </ul>

              <p className="mt-4 text-body text-mut">
                Participation aux frais :{" "}
                <strong className="font-bold text-ink">
                  {formatEuros(animal.fraisAdoption)}
                </strong>
              </p>

              <SmartLink
                href={routes.animal(animal.slug)}
                className="link-underline mt-4 inline-block text-body font-semibold text-acc hover:text-acc-dark"
              >
                Revoir sa fiche
              </SmartLink>
            </div>

            <div className="mt-4 rounded-panel border border-line p-5">
              <p className="text-body font-bold text-ink">Une question ?</p>
              <ul className="mt-3 space-y-2.5 text-body text-mut">
                <li className="flex items-center gap-2.5">
                  <Mail size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-acc" />
                  <a href={`mailto:${association.email}`} className="hover:text-pri">
                    {association.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-acc" />
                  <a href={`tel:${association.telephoneLien}`} className="hover:text-pri">
                    {association.telephone}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
