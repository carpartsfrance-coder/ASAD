import Image from "next/image";
import { Heart } from "lucide-react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { PhotoAgrandissable } from "@/components/ui/PhotoAgrandissable";
import { sectionTemoignage } from "@/content/accueil";
import { configSite } from "@/lib/donnees/config-site";
import { messagesPublies } from "@/lib/donnees/livre-or";
import { routes } from "@/content/site";

/**
 * Panneau « Des nouvelles qui font chaud au cœur ».
 * Le message provient du livre d'or : il a donc été relu et validé.
 */
export async function TestimonialPanel() {
  const [messages, config] = await Promise.all([messagesPublies(), configSite()]);
  const message = messages[0];
  if (!message) return null;

  const photo = message.photo ?? {
    src: "/images/temoignage-lilou.jpg",
    alt: "Animal adopté, installé confortablement chez sa famille",
  };

  return (
    <Container
      as="section"
      aria-labelledby="titre-temoignage"
      className="pt-12 pb-14 lg:pt-12 lg:pb-[66px]"
    >
      <div className="grid items-center gap-7 rounded-panel bg-warm p-5 sm:p-[22px] lg:grid-cols-[0.62fr_1fr] lg:gap-10">
        <PhotoAgrandissable
          photo={photo}
          libelle={`la photo envoyée par ${message.nomPublic}`}
          className="h-[220px] w-full rounded-media bg-black/5 lg:h-[258px]"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 38vw"
            loading="lazy"
            className="object-cover"
          />
        </PhotoAgrandissable>

        <div className="lg:pr-[30px]">
          <div className="flex items-center gap-3.5">
            <Heart
              size={27}
              strokeWidth={1.7}
              aria-hidden="true"
              className="shrink-0 text-pri"
            />
            <h2
              id="titre-temoignage"
              className="text-[21px] font-extrabold tracking-[-0.012em] text-ink lg:text-title"
            >
              {config.titres.temoignage}
            </h2>
          </div>

          <blockquote className="mt-5 max-w-[520px] text-quote leading-[1.78] text-citation italic">
            <p>“ {message.message} ”</p>
          </blockquote>

          <p className="mt-4.5 text-[14px] font-bold text-ink">– {message.nomPublic}</p>

          <ArrowLink href={routes.livreOr} className="mt-5">
            {sectionTemoignage.lienLabel}
          </ArrowLink>
        </div>
      </div>
    </Container>
  );
}
