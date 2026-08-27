import type { Metadata } from "next";
import Image from "next/image";
import { Info, Quote } from "lucide-react";
import { FormulaireLivreOr } from "@/components/formulaires/FormulaireLivreOr";
import { AnimalGrid } from "@/components/animaux/AnimalGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { PhotoAgrandissable } from "@/components/ui/PhotoAgrandissable";
import { messagesPublies } from "@/lib/donnees/livre-or";
import { routes } from "@/content/site";
import { formatDate } from "@/lib/format";
import { animauxDisponibles } from "@/lib/donnees/animaux";

export const metadata: Metadata = {
  title: "Livre d’or",
  description:
    "Les messages des familles adoptantes et des familles d’accueil d’ASAD. Chaque message est relu par un bénévole avant publication.",
  alternates: { canonical: routes.livreOr },
};

export const dynamic = "force-dynamic";

export default async function PageLivreOr() {
  const messages = await messagesPublies();
  const disponibles = (await animauxDisponibles()).slice(0, 3);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Livre d’or" }]} />
      </Container>

      <PageHeader
        surtitre="Après l’adoption"
        titre="Des nouvelles qui font chaud au cœur"
        chapo="Les familles nous écrivent pour raconter ce que deviennent leurs compagnons. Chaque message est relu par un bénévole avant d’être publié."
      />

      {/* Règle de modération, annoncée clairement */}
      <Container className="pt-6">
        <p className="flex items-start gap-3 rounded-card border border-line bg-white p-5 text-body leading-[1.68] text-mut">
          <Info size={19} strokeWidth={1.8} aria-hidden="true" className="mt-px shrink-0 text-acc" />
          <span>
            Aucun message n’est publié automatiquement. Il n’y a ni note en étoiles,
            ni commentaire libre : ce livre d’or rassemble des témoignages relus, un
            par un, par l’association.
          </span>
        </p>
      </Container>

      {/* Messages publiés */}
      <Container as="section" aria-label="Messages publiés" className="pt-10">
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {messages.map((message) => (
            <li key={message.id}>
              <article className="flex h-full flex-col rounded-panel bg-white p-6 shadow-card sm:p-7">
                <Quote size={26} strokeWidth={1.6} aria-hidden="true" className="text-acc" />

                <blockquote className="mt-4 flex-1 text-quote leading-[1.78] text-citation italic">
                  <p>“ {message.message} ”</p>
                </blockquote>

                <footer className="mt-5 flex items-center gap-4 border-t border-line pt-5">
                  {message.photo && (
                    <PhotoAgrandissable
                      photo={message.photo}
                      libelle={`la photo envoyée par ${message.nomPublic}`}
                      indice="loupe"
                      className="size-14 shrink-0 rounded-full bg-soft"
                    >
                      <Image
                        src={message.photo.src}
                        alt={message.photo.alt}
                        fill
                        sizes="56px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </PhotoAgrandissable>
                  )}
                  <div className="min-w-0">
                    <p className="text-body font-bold text-ink">{message.nomPublic}</p>
                    <p className="text-meta text-mut">
                      {message.ville && <>{message.ville} · </>}
                      <time dateTime={message.date}>{formatDate(message.date)}</time>
                    </p>
                    {message.animalNom && (
                      <p className="mt-0.5 text-meta text-mut">
                        {message.animalSlug ? (
                          <SmartLink
                            href={routes.animal(message.animalSlug)}
                            className="link-underline font-semibold text-acc hover:text-acc-dark"
                          >
                            {message.animalNom}
                          </SmartLink>
                        ) : (
                          message.animalNom
                        )}
                      </p>
                    )}
                  </div>
                </footer>

                {message.reponsePublique && (
                  <p className="mt-4 rounded-[10px] bg-soft p-4 text-body leading-[1.65] text-pri">
                    <strong className="font-semibold">Réponse de l’association :</strong>{" "}
                    {message.reponsePublique}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ul>
      </Container>

      {/* Le seul formulaire du site : aucun message n'est publié sans relecture. */}
      <Container as="section" aria-labelledby="titre-formulaire" className="pt-16">
        <div className="max-w-[820px]">
          <SectionHeading
            id="titre-formulaire"
            titre="Laisser un message"
            sousTitre="Vous avez adopté ou accueilli un animal avec nous ? Racontez-nous la suite."
            align="gauche"
            className="mb-8"
          />
          <FormulaireLivreOr />
        </div>
      </Container>

      {disponibles.length > 0 && (
        <Container className="pt-16 pb-16 lg:pb-20">
          <SectionHeading
            titre="À qui le tour ?"
            sousTitre="Ces animaux attendent d’écrire la leur."
            align="gauche"
          />
          <AnimalGrid animaux={disponibles} className="mt-8" />
        </Container>
      )}
    </>
  );
}
