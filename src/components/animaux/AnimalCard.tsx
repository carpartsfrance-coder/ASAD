import Image from "next/image";
import { BadgeStatut } from "@/components/ui/Badge";
import { SmartLink } from "@/components/ui/SmartLink";
import { routes } from "@/content/site";
import { sousTitreAnimal } from "@/lib/animaux";
import { cn } from "@/lib/cn";
import type { Animal } from "@/types";
import { AnimalMeta } from "./AnimalMeta";
import { FavoriteButton } from "./FavoriteButton";

/** Carte animal — identique sur l'accueil et dans le catalogue. */
export function AnimalCard({
  animal,
  priorite = false,
  avecCommune = true,
  className,
}: {
  animal: Animal;
  /** Charge la photo en priorité (premières cartes visibles). */
  priorite?: boolean;
  avecCommune?: boolean;
  className?: string;
}) {
  const adopte = animal.statut === "adopte";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card",
        "transition-shadow duration-200 hover:shadow-[0_10px_28px_rgba(20,32,24,.11)]",
        className,
      )}
    >
      <div className="relative h-[260px] shrink-0 overflow-hidden bg-soft sm:h-[286px]">
        <Image
          src={animal.photoPrincipale.src}
          alt={animal.photoPrincipale.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priorite}
          loading={priorite ? undefined : "lazy"}
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-[1.03]",
            // Une fiche adoptée reste en ligne, mais visuellement en retrait.
            adopte && "opacity-55",
          )}
        />

        <BadgeStatut statut={animal.statut} className="absolute top-[15px] left-[15px]" />

        <FavoriteButton
          slug={animal.slug}
          nom={animal.nom}
          className="absolute top-[13px] right-[13px]"
        />
      </div>

      <div className="px-5 pt-[18px] pb-5">
        <h3 className="text-card font-bold text-ink">
          <SmartLink
            href={routes.animal(animal.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {animal.nom}
          </SmartLink>{" "}
          <span className="text-body font-normal text-mut">
            — {sousTitreAnimal(animal)}
          </span>
        </h3>

        <AnimalMeta animal={animal} avecCommune={avecCommune} className="mt-3" />
      </div>
    </article>
  );
}
