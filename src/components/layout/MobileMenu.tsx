"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { SmartLink } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";
import { ctas, liensInformations, navigationPrincipale } from "@/content/site";

interface MobileMenuProps {
  ouvert: boolean;
  onClose: () => void;
  estActif: (href: string) => boolean;
  lienDon: string;
  /** Bouton hamburger, pour lui rendre le focus à la fermeture. */
  declencheurRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Panneau de navigation mobile.
 *
 * Accessibilité : `role="dialog"` + `aria-modal`, fermeture à la touche Échap,
 * focus déplacé sur le panneau à l'ouverture puis rendu au bouton à la
 * fermeture, focus maintenu à l'intérieur du panneau, défilement de la page
 * bloqué tant qu'il est ouvert.
 */
export function MobileMenu({
  ouvert,
  onClose,
  estActif,
  lienDon,
  declencheurRef,
}: MobileMenuProps) {
  const panneauRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;

    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Copie locale : la ref peut avoir changé au moment du nettoyage.
    const declencheur = declencheurRef.current;

    const panneau = panneauRef.current;
    const focusables = () =>
      Array.from(
        panneau?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusables();
      if (elements.length === 0) return;

      const premier = elements[0];
      const dernier = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
        premier.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = precedent;
      declencheur?.focus();
    };
  }, [ouvert, onClose, declencheurRef]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-pri/45"
      />

      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-canvas shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo taille="footer" />
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full text-pri transition-colors duration-150 hover:bg-acc-soft"
          >
            <X size={22} strokeWidth={1.8} aria-hidden="true" />
            <span className="sr-only">Fermer le menu</span>
          </button>
        </div>

        <nav aria-label="Navigation principale" className="px-5 py-6">
          <ul className="flex flex-col gap-1">
            {navigationPrincipale.map((lien) => (
              <li key={lien.href}>
                <SmartLink
                  href={lien.href}
                  onClick={onClose}
                  aria-current={estActif(lien.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-[9px] px-3 py-3 text-[17px] transition-colors duration-150",
                    estActif(lien.href)
                      ? "bg-acc-soft font-semibold text-pri"
                      : "font-medium text-navlink hover:bg-white hover:text-pri",
                  )}
                >
                  {lien.label}
                </SmartLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              href={lienDon}
              externe
              variante="accent"
              taille="md"
              pleineLargeur
            >
              {ctas.don.label}
            </Button>
            <Button
              href={ctas.signaler.href}
              variante="contour"
              taille="md"
              pleineLargeur
            >
              {ctas.signaler.label}
            </Button>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 border-t border-line pt-6">
            {liensInformations.map((lien) => (
              <li key={lien.href}>
                <SmartLink
                  href={lien.href}
                  onClick={onClose}
                  className="text-meta text-mut transition-colors duration-150 hover:text-pri"
                >
                  {lien.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
