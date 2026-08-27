"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { BadgeStatut } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Photo, StatutAnimal } from "@/types";
import { VisionneusePhoto } from "@/components/ui/VisionneusePhoto";

/** Galerie de la fiche animal : photo principale, miniatures, agrandissement. */
export function GalerieAnimal({
  photos,
  nom,
  statut,
}: {
  photos: Photo[];
  nom: string;
  statut: StatutAnimal;
}) {
  const [active, setActive] = useState(0);
  const [agrandie, setAgrandie] = useState(false);
  const boutonPhotoRef = useRef<HTMLButtonElement>(null);

  const photo = photos[active] ?? photos[0];
  const adopte = statut === "adopte";

  return (
    <div>
      {/* Le badge se superpose à la photo : il est posé dans le même
          conteneur, pas décalé par une marge négative. */}
      <div className="relative">
        <button
          ref={boutonPhotoRef}
          type="button"
          onClick={() => setAgrandie(true)}
          className="group relative block h-[300px] w-full cursor-zoom-in overflow-hidden rounded-card bg-soft sm:h-[420px] lg:h-[520px]"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 62vw"
            priority
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
              adopte && "opacity-55",
            )}
          />

          {/* Indice visuel : la photo s’agrandit. */}
          <span
            aria-hidden="true"
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-meta font-semibold text-pri shadow-fav transition-colors duration-150 group-hover:bg-white"
          >
            <Expand size={16} strokeWidth={1.9} />
            Agrandir
          </span>

          <span className="sr-only">
            Voir la photo de {nom} en grand
            {photos.length > 1 && ` — photo ${active + 1} sur ${photos.length}`}
          </span>
        </button>

        <BadgeStatut
          statut={statut}
          taille="fiche"
          className="pointer-events-none absolute top-[18px] left-[18px]"
        />
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {photos.map((p, index) => (
            <li key={p.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative block h-[72px] w-full overflow-hidden rounded-[10px] border-2 transition-colors duration-150 sm:h-24",
                  index === active ? "border-acc" : "border-transparent hover:border-line",
                )}
              >
                <Image src={p.src} alt="" fill sizes="140px" className="object-cover" />
                <span className="sr-only">
                  Afficher la photo {index + 1} de {nom}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {agrandie && (
        <VisionneusePhoto
          photos={photos}
          index={active}
          libelle={`Photo de ${nom}`}
          onFermer={() => setAgrandie(false)}
          onChanger={photos.length > 1 ? setActive : undefined}
          declencheurRef={boutonPhotoRef}
        />
      )}
    </div>
  );
}
