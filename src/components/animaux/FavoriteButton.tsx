"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  analyserFavoris,
  basculerFavori,
  instantaneFavoris,
  instantaneFavorisServeur,
  sAbonnerAuxFavoris,
} from "@/lib/favoris";

/**
 * Bouton « coup de cœur » des cartes animal.
 * Bascule visuelle + persistance locale, en attendant un compte utilisateur.
 */
export function FavoriteButton({
  slug,
  nom,
  className,
}: {
  slug: string;
  nom: string;
  className?: string;
}) {
  const brut = useSyncExternalStore(
    sAbonnerAuxFavoris,
    instantaneFavoris,
    instantaneFavorisServeur,
  );

  const favori = useMemo(() => analyserFavoris(brut).includes(slug), [brut, slug]);

  return (
    <button
      type="button"
      onClick={() => basculerFavori(slug)}
      aria-pressed={favori}
      className={cn(
        "z-10 flex size-[38px] items-center justify-center rounded-full bg-white shadow-fav",
        "transition-colors duration-150 hover:bg-acc-soft",
        className,
      )}
    >
      <Heart
        size={19}
        strokeWidth={1.7}
        aria-hidden="true"
        className={cn(
          "transition-colors duration-150",
          favori ? "fill-acc text-acc" : "text-pri",
        )}
      />
      <span className="sr-only">
        {favori
          ? `Retirer ${nom} de mes coups de cœur`
          : `Ajouter ${nom} à mes coups de cœur`}
      </span>
    </button>
  );
}
