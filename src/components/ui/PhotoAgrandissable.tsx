"use client";

import { useRef, useState } from "react";
import { Expand } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Photo } from "@/types";
import { VisionneusePhoto } from "./VisionneusePhoto";

/**
 * Rend une photo cliquable : elle s'ouvre en grand.
 *
 * Le composant n'impose aucun style à l'image — on lui passe l'image déjà
 * mise en forme. Il ajoute seulement le bouton, l'indice visuel et la
 * visionneuse.
 */
export function PhotoAgrandissable({
  photo,
  photos,
  index = 0,
  libelle,
  indice = "pastille",
  className,
  children,
}: {
  /** Photo affichée, quand il n'y en a qu'une. */
  photo?: Photo;
  /** Série complète, pour pouvoir naviguer d'une photo à l'autre. */
  photos?: Photo[];
  index?: number;
  libelle: string;
  /**
   * `pastille` : mention « Agrandir » en bas à droite — pour les grandes images.
   * `loupe` : petite icône — pour les vignettes, où la pastille serait trop grosse.
   */
  indice?: "pastille" | "loupe";
  className?: string;
  children: React.ReactNode;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [courante, setCourante] = useState(index);
  const boutonRef = useRef<HTMLButtonElement>(null);

  const serie = photos ?? (photo ? [photo] : []);
  if (serie.length === 0) return <>{children}</>;

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        onClick={() => {
          setCourante(index);
          setOuverte(true);
        }}
        className={cn("group relative block cursor-zoom-in overflow-hidden", className)}
      >
        {children}

        {indice === "pastille" ? (
          <span
            aria-hidden="true"
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-meta font-semibold text-pri shadow-fav transition-colors duration-150 group-hover:bg-white"
          >
            <Expand size={16} strokeWidth={1.9} />
            Agrandir
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="absolute right-1.5 bottom-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-pri shadow-fav transition-colors duration-150 group-hover:bg-white"
          >
            <Expand size={13} strokeWidth={2} />
          </span>
        )}

        <span className="sr-only">Voir {libelle} en grand</span>
      </button>

      {ouverte && (
        <VisionneusePhoto
          photos={serie}
          index={courante}
          libelle={libelle}
          onFermer={() => setOuverte(false)}
          onChanger={serie.length > 1 ? setCourante : undefined}
          declencheurRef={boutonRef}
        />
      )}
    </>
  );
}
