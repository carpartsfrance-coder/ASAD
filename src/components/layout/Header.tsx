"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BoutonHeader } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";
import { ctas, navigationPrincipale, routes } from "@/content/site";
import { MobileMenu } from "./MobileMenu";

export function Header({ lienDon }: { lienDon: string }) {
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const boutonMenuRef = useRef<HTMLButtonElement>(null);

  const estActif = useCallback(
    (href: string) =>
      href === routes.accueil ? pathname === href : pathname.startsWith(href),
    [pathname],
  );

  const fermer = useCallback(() => setMenuOuvert(false), []);

  /**
   * L'en-tête reste visible pendant qu'on descend : la navigation et le
   * bouton de don restent à portée. Le filet et l'ombre n'apparaissent qu'une
   * fois la page défilée, pour ne pas alourdir le haut de l'accueil.
   */
  const [decolle, setDecolle] = useState(false);

  useEffect(() => {
    const auDefilement = () => setDecolle(window.scrollY > 8);
    auDefilement();
    window.addEventListener("scroll", auDefilement, { passive: true });
    return () => window.removeEventListener("scroll", auDefilement);
  }, []);

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-40 bg-canvas transition-shadow duration-200",
          decolle && "border-b border-line shadow-[0_2px_12px_rgba(20,32,24,.06)]",
        )}
      >
      <Container as="header" className="flex items-center gap-6 py-4 lg:gap-6 lg:py-[18px] xl:gap-11">
        <SmartLink
          href={routes.accueil}
          className="shrink-0"
          aria-label={`${"ASAD"} — retour à l’accueil`}
        >
          <Logo priorite />
        </SmartLink>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-[21px] text-nav font-medium lg:flex xl:gap-[30px]"
        >
          {navigationPrincipale.map((lien) => {
            const actif = estActif(lien.href);
            return (
              <SmartLink
                key={lien.href}
                href={lien.href}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "border-b-[2.5px] pb-[7px] transition-colors duration-150",
                  actif
                    ? "border-acc font-semibold text-ink"
                    : "border-transparent text-navlink hover:text-pri",
                )}
              >
                {lien.label}
              </SmartLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:gap-3.5">
          {/* Les utilitaires `hidden` et `inline-flex` du bouton entreraient en
              conflit : on masque donc via des conteneurs dédiés. */}
          <div className="hidden lg:block">
            <BoutonHeader href={ctas.signaler.href} variante="contour">
              {ctas.signaler.label}
            </BoutonHeader>
          </div>

          <div className="hidden sm:block">
            <BoutonHeader
              href={lienDon}
              externe
              variante="accent"
            >
              {ctas.don.label}
            </BoutonHeader>
          </div>

          <button
            ref={boutonMenuRef}
            type="button"
            onClick={() => setMenuOuvert(true)}
            aria-expanded={menuOuvert}
            aria-haspopup="dialog"
            className="flex size-11 items-center justify-center rounded-[9px] border-[1.4px] border-line bg-white text-pri transition-colors duration-150 hover:border-pri lg:hidden"
          >
            <Menu size={22} strokeWidth={1.8} aria-hidden="true" />
            <span className="sr-only">Ouvrir le menu</span>
          </button>
        </div>
      </Container>
      </div>

      <MobileMenu
        ouvert={menuOuvert}
        onClose={fermer}
        estActif={estActif}
        lienDon={lienDon}
        declencheurRef={boutonMenuRef}
      />
    </>
  );
}
