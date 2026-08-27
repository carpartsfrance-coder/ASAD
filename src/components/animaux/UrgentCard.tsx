import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { BadgeStatut } from "@/components/ui/Badge";
import { SmartLink } from "@/components/ui/SmartLink";
import { routes } from "@/content/site";
import { sousTitreAnimal } from "@/lib/animaux";
import { cn } from "@/lib/cn";
import type { Animal } from "@/types";

/**
 * Carte du bandeau « Ils sont en détresse ».
 * Posée sur fond sombre : pas d'ombre, rayon 13 px.
 */
export function UrgentCard({
  animal,
  className,
}: {
  animal: Animal;
  className?: string;
}) {
  const urgence = animal.urgence;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-urgent bg-white",
        className,
      )}
    >
      <div className="relative h-[190px] shrink-0 overflow-hidden bg-soft sm:h-[210px]">
        <Image
          src={animal.photoPrincipale.src}
          alt={animal.photoPrincipale.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <BadgeStatut statut="urgent" className="absolute top-3.5 left-3.5" />
      </div>

      <div className="flex flex-1 flex-col px-[22px] pt-5 pb-6">
        <h3 className="mb-2.5 text-card font-bold text-ink">
          {animal.nom}{" "}
          <span className="text-body font-normal text-mut">
            — {sousTitreAnimal(animal)}
          </span>
        </h3>

        <p className="mb-4 text-body leading-[1.62] text-mut">
          {urgence?.motif ?? animal.descriptionCourte}
        </p>

        {urgence && (
          <p className="mb-4 flex items-center gap-2 text-mini font-semibold text-pri">
            <Clock size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
            {urgence.delai}
          </p>
        )}

        <SmartLink
          href={routes.animal(animal.slug)}
          className="link-underline mt-auto inline-flex items-center gap-2.5 self-start text-body font-semibold text-acc transition-colors duration-150 hover:text-acc-dark after:absolute after:inset-0 after:content-['']"
        >
          {urgence?.ctaLabel ?? `Aider ${animal.nom}`}
          <ArrowRight size={16} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
        </SmartLink>
      </div>
    </article>
  );
}
