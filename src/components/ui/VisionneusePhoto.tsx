"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/types";

/**
 * Affichage plein écran d'une photo.
 *
 * Accessibilité : `role="dialog"` + `aria-modal`, fermeture par Échap ou par
 * un clic hors de l'image, focus déplacé sur le bouton de fermeture puis rendu
 * à l'élément d'origine, défilement de la page bloqué. Les flèches du clavier
 * font défiler les photos quand il y en a plusieurs.
 */
/** Met une majuscule initiale, sans toucher au reste du libellé. */
function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function VisionneusePhoto({
  photos,
  index,
  libelle,
  onFermer,
  onChanger,
  declencheurRef,
}: {
  photos: Photo[];
  index: number;
  /** Décrit ce que la visionneuse affiche, pour les lecteurs d'écran. */
  libelle: string;
  onFermer: () => void;
  /** Absent quand il n'y a qu'une photo. */
  onChanger?: (index: number) => void;
  /** Bouton d'ouverture, pour lui rendre le focus à la fermeture. */
  declencheurRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const boutonFermerRef = useRef<HTMLButtonElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);

  const photo = photos[index];
  const plusieurs = photos.length > 1;

  const precedente = useCallback(() => {
    onChanger?.((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onChanger]);

  const suivante = useCallback(() => {
    onChanger?.((index + 1) % photos.length);
  }, [index, photos.length, onChanger]);

  useEffect(() => {
    const precedentOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Un clic ne donne pas le focus au bouton dans tous les navigateurs :
       on garde donc sa référence plutôt que de lire `document.activeElement`. */
    const declencheur = declencheurRef.current;
    boutonFermerRef.current?.focus();

    function auClavier(evenement: KeyboardEvent) {
      if (evenement.key === "Escape") {
        evenement.preventDefault();
        onFermer();
        return;
      }
      if (plusieurs && evenement.key === "ArrowLeft") {
        evenement.preventDefault();
        precedente();
        return;
      }
      if (plusieurs && evenement.key === "ArrowRight") {
        evenement.preventDefault();
        suivante();
        return;
      }
      if (evenement.key !== "Tab") return;

      // Le focus reste à l'intérieur de la visionneuse.
      const focusables = Array.from(
        panneauRef.current?.querySelectorAll<HTMLElement>("button") ?? [],
      );
      if (focusables.length === 0) return;

      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];

      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    }

    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("keydown", auClavier);
      document.body.style.overflow = precedentOverflow;
      declencheur?.focus();
    };
  }, [onFermer, plusieurs, precedente, suivante, declencheurRef]);

  return (
    <div
      ref={panneauRef}
      role="dialog"
      aria-modal="true"
      aria-label={majuscule(libelle)}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-pri/92 p-4 sm:p-8"
    >
      {/* Un clic à côté de l'image ferme la visionneuse. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onFermer}
        className="absolute inset-0 h-full w-full cursor-zoom-out"
      />

      <button
        ref={boutonFermerRef}
        type="button"
        onClick={onFermer}
        className="absolute top-4 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white text-pri transition-colors duration-150 hover:bg-acc-soft sm:top-6 sm:right-6"
      >
        <X size={24} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">Fermer la photo</span>
      </button>

      {plusieurs && (
        <>
          <button
            type="button"
            onClick={precedente}
            className="absolute left-3 z-10 flex size-12 items-center justify-center rounded-full bg-white text-pri transition-colors duration-150 hover:bg-acc-soft sm:left-6"
          >
            <ChevronLeft size={26} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Photo précédente</span>
          </button>
          <button
            type="button"
            onClick={suivante}
            className="absolute right-3 z-10 flex size-12 items-center justify-center rounded-full bg-white text-pri transition-colors duration-150 hover:bg-acc-soft sm:right-6"
          >
            <ChevronRight size={26} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Photo suivante</span>
          </button>
        </>
      )}

      <figure className="pointer-events-none relative z-[5] flex max-h-full w-full max-w-5xl flex-col items-center">
        <div className="relative h-[70vh] w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
            priority
          />
        </div>
        <figcaption className="mt-4 text-center text-body text-white/80">
          {photo.alt}
          {plusieurs && (
            <span className="mt-1 block text-meta text-white/60">
              Photo {index + 1} sur {photos.length}
            </span>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
