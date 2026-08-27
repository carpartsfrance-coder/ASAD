import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Heart, PawPrint } from "lucide-react";
import { AnimalGrid } from "@/components/animaux/AnimalGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PhotoAgrandissable } from "@/components/ui/PhotoAgrandissable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { animauxAdoptes, animauxDisponibles } from "@/lib/donnees/animaux";
import { libelleEspeceAccordee } from "@/lib/animaux";
import { routes } from "@/content/site";
import { formatDate } from "@/lib/format";
import type { Animal } from "@/types";

export const metadata: Metadata = {
  title: "Ils ont trouvé leur famille",
  description:
    "Les animaux recueillis par l’ASAD qui ont trouvé une famille. Leur photo, la date de leur adoption et des nouvelles envoyées par ceux qui les accueillent.",
  alternates: { canonical: routes.adoptes },
};

export const dynamic = "force-dynamic";

/** Un animal adopté : sa photo d'un côté, son histoire de l'autre. */
function Retrouvailles({ animal, index }: { animal: Animal; index: number }) {
  const suite = animal.suiteAdoption;
  const photo = suite?.photo ?? animal.galerie[0];
  const inverse = index % 2 === 1;

  return (
    <article className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
      {photo && (
        <div className={inverse ? "lg:order-2" : undefined}>
          <PhotoAgrandissable
            photo={photo}
            libelle={`${animal.nom}, adopté${animal.sexe === "femelle" ? "e" : ""}`}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-panel bg-subtil"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
          </PhotoAgrandissable>
        </div>
      )}

      <div className={inverse ? "lg:order-1" : undefined}>
        <p className="inline-flex items-center gap-2 rounded-full bg-acc-soft px-3.5 py-1.5 text-mini font-bold tracking-[0.04em] uppercase text-acc-dark">
          <Heart size={14} strokeWidth={2.2} aria-hidden="true" className="fill-current" />
          Adopté{animal.sexe === "femelle" ? "e" : ""}
        </p>

        <h2 className="mt-4 text-[30px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-[36px]">
          {animal.nom}
        </h2>

        <p className="mt-2 text-lead text-mut">
          {libelleEspeceAccordee(animal)}
          {suite?.date && <> — {formatDate(suite.date)}</>}
          {suite?.famille && <> · {suite.famille}</>}
        </p>

        {suite?.citation && (
          <blockquote className="mt-6 border-l-[3px] border-acc pl-5">
            <p className="text-[19px] leading-[1.6] font-medium text-ink italic sm:text-[21px]">
              « {suite.citation} »
            </p>
          </blockquote>
        )}

        {suite?.recit && (
          <p className="mt-5 max-w-[52ch] text-quote leading-[1.75] text-mut">
            {suite.recit}
          </p>
        )}

        <SmartLink
          href={routes.animal(animal.slug)}
          className="mt-6 inline-flex items-center gap-2 text-body font-bold text-acc underline underline-offset-4 transition-colors duration-150 hover:text-acc-dark"
        >
          Revoir sa fiche
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </SmartLink>
      </div>
    </article>
  );
}

export default async function PageAdoptes() {
  const adoptes = await animauxAdoptes();
  const disponibles = (await animauxDisponibles()).slice(0, 3);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Adoptés" }]} />
      </Container>

      <PageHeader
        surtitre="Après l’adoption"
        titre="Ils ont trouvé leur famille"
        chapo="Chacun d’eux est arrivé perdu, blessé ou abandonné. Aujourd’hui ils dorment au chaud, quelque part, chez quelqu’un qui les attendait."
      />

      {/* Le compte, tiré des fiches — jamais un chiffre écrit à la main. */}
      {adoptes.length > 0 && (
        <Container className="pt-8">
          <p className="flex flex-wrap items-center justify-center gap-3 rounded-panel bg-warm px-6 py-7 text-center">
            <PawPrint size={26} strokeWidth={0} aria-hidden="true" className="fill-acc" />
            <span className="text-[26px] font-extrabold text-ink sm:text-[30px]">
              {adoptes.length}
            </span>
            <span className="text-lead text-mut">
              {adoptes.length > 1
                ? "animaux ont quitté leur famille d’accueil pour la leur."
                : "animal a quitté sa famille d’accueil pour la sienne."}
            </span>
          </p>
        </Container>
      )}

      <Container className="pt-14 lg:pt-16">
        {adoptes.length === 0 ? (
          <div className="rounded-panel border border-line bg-white px-6 py-14 text-center">
            <Heart size={34} strokeWidth={1.6} aria-hidden="true" className="mx-auto text-acc" />
            <p className="mt-5 text-card font-bold text-ink">
              La première histoire s’écrit en ce moment
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-body leading-[1.7] text-mut">
              Aucune adoption n’est encore publiée ici. Nos protégés attendent
              toujours, et cette page se remplira au fur et à mesure.
            </p>
            <SmartLink
              href={routes.animaux}
              className="mt-6 inline-flex items-center gap-2 text-body font-bold text-acc underline underline-offset-4 hover:text-acc-dark"
            >
              Voir les animaux à adopter
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
            </SmartLink>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-24">
            {adoptes.map((animal, index) => (
              <Retrouvailles key={animal.id} animal={animal} index={index} />
            ))}
          </div>
        )}
      </Container>

      {/* Le fil ne s'arrête pas là : d'autres attendent encore. */}
      {disponibles.length > 0 && (
        <Container className="pt-20 pb-16 lg:pb-20">
          <SectionHeading
            titre="À qui le tour ?"
            sousTitre="Ceux-là aussi attendent la maison où ils finiront leurs jours."
          />
          <AnimalGrid animaux={disponibles} className="mt-10" />
          <div className="mt-10 flex justify-center">
            <SmartLink
              href={routes.animaux}
              className="inline-flex h-12 items-center gap-2.5 rounded-cta bg-acc px-6 text-lead font-bold text-white transition-colors duration-150 hover:bg-acc-dark"
            >
              Voir tous les animaux
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </SmartLink>
          </div>
        </Container>
      )}
    </>
  );
}
