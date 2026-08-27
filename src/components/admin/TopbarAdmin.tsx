"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, ChevronRight, Menu, Plus, Search } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";
import { initiales, navigationAdmin } from "@/content/admin";
import { libelleRole } from "@/lib/auth/roles";
import { routes } from "@/content/site";
import type { Utilisateur } from "@/types";
import { BoutonDeconnexion } from "./BoutonDeconnexion";

/** Fil d'Ariane déduit de l'URL courante. */
function useFilAriane(): string[] {
  const pathname = usePathname();
  const entree = [...navigationAdmin]
    .sort((a, b) => b.href.length - a.href.length)
    .find((e) => pathname.startsWith(e.href));

  if (!entree || entree.href === routes.admin) return ["Tableau de bord"];
  return ["Administration", entree.label];
}

export function TopbarAdmin({
  utilisateur,
  onOuvrirMenu,
}: {
  utilisateur: Utilisateur;
  onOuvrirMenu: () => void;
}) {
  const maillons = useFilAriane();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOuvert) return;

    function auClic(event: MouseEvent) {
      if (!conteneurRef.current?.contains(event.target as Node)) setMenuOuvert(false);
    }
    function auClavier(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOuvert(false);
    }

    document.addEventListener("mousedown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("mousedown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [menuOuvert]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-white px-4 sm:px-7">
      <button
        type="button"
        onClick={onOuvrirMenu}
        className="flex size-10 items-center justify-center rounded-btn border-[1.4px] border-line text-pri transition-colors duration-150 hover:border-pri lg:hidden"
      >
        <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
        <span className="sr-only">Ouvrir le menu</span>
      </button>

      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" className="hidden min-w-0 sm:block">
        <ol className="flex items-center gap-1.5 text-mini">
          {maillons.map((maillon, index) => (
            <li key={maillon} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={13} strokeWidth={1.8} aria-hidden="true" className="text-mut/45" />
              )}
              <span
                className={
                  index === maillons.length - 1 ? "font-semibold text-ink" : "text-mut"
                }
                aria-current={index === maillons.length - 1 ? "page" : undefined}
              >
                {maillon}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-3.5">
        {/* Recherche */}
        <div className="relative hidden xl:block">
          <label htmlFor="recherche-admin" className="sr-only">
            Rechercher dans le back-office
          </label>
          <Search
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mut"
          />
          <input
            id="recherche-admin"
            type="search"
            placeholder="Rechercher un animal, une demande…"
            className="h-10 w-[296px] rounded-btn border-[1.4px] border-line bg-subtil pr-3 pl-[37px] text-meta text-ink transition-colors duration-150 placeholder:text-mut/70 focus:border-acc focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-btn text-pri transition-colors duration-150 hover:bg-subtil"
        >
          <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute top-2 right-2.5 size-[7px] rounded-full border-2 border-white bg-erreur"
          />
          <span className="sr-only">Notifications — nouveautés à consulter</span>
        </button>

        {/* Menu utilisateur */}
        <div ref={conteneurRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOuvert((o) => !o)}
            aria-expanded={menuOuvert}
            aria-haspopup="menu"
            className="flex h-10 items-center gap-2 rounded-btn px-1.5 transition-colors duration-150 hover:bg-subtil"
          >
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-full bg-soft text-micro font-bold text-pri"
            >
              {initiales(utilisateur.nom)}
            </span>
            <ChevronDown size={15} strokeWidth={2} aria-hidden="true" className="text-mut" />
            <span className="sr-only">Menu de {utilisateur.nom}</span>
          </button>

          {menuOuvert && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-2 w-[226px] rounded-media border border-line bg-white p-2 shadow-[0_12px_30px_rgba(17,24,39,.14)]"
            >
              <div className="px-2.5 py-2">
                <p className="text-[14px] font-bold text-ink">{utilisateur.nom}</p>
                <p className="truncate text-tiny text-mut">{utilisateur.email}</p>
                <p className="mt-0.5 text-tiny text-mut">
                  {libelleRole[utilisateur.role]}
                </p>
              </div>

              <SmartLink
                href={routes.adminUtilisateurs}
                role="menuitem"
                className="flex h-[38px] items-center rounded-lg px-2.5 text-meta text-ink transition-colors duration-150 hover:bg-subtil"
              >
                Mon profil
              </SmartLink>
              <SmartLink
                href={routes.adminParametres}
                role="menuitem"
                className="flex h-[38px] items-center rounded-lg px-2.5 text-meta text-ink transition-colors duration-150 hover:bg-subtil"
              >
                Paramètres
              </SmartLink>

              <hr className="my-1.5 border-line" />

              <BoutonDeconnexion variante="menu" />
            </div>
          )}
        </div>

        {/* Action principale */}
        <SmartLink
          href={routes.adminAnimaux}
          className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-acc px-3.5 text-meta font-bold whitespace-nowrap text-white transition-colors duration-150 hover:bg-acc-dark"
        >
          <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
          <span className="hidden sm:inline">Ajouter un animal</span>
          <span className="sm:hidden">Ajouter</span>
        </SmartLink>
      </div>
    </header>
  );
}
