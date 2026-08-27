"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SmartLink } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";
import { initiales, navigationAdmin, type CompteursAdmin } from "@/content/admin";
import { accedeALaRubrique, libelleRole } from "@/lib/auth/roles";
import { routes } from "@/content/site";
import type { Utilisateur } from "@/types";
import { IconeAdmin } from "./IconeAdmin";
import { BoutonDeconnexion } from "./BoutonDeconnexion";

/** Barre latérale du back-office — 248 px, fond `--pri`, pleine hauteur. */
export function SidebarAdmin({
  utilisateur,
  compteurs,
  ouverte = false,
  onFermer,
}: {
  utilisateur: Utilisateur;
  /** Ce qui attend une décision, par rubrique. */
  compteurs: CompteursAdmin;
  /** Ouverture en tiroir sur petit écran. */
  ouverte?: boolean;
  onFermer?: () => void;
}) {
  const pathname = usePathname();

  /* Un bénévole ne voit que les rubriques auxquelles son rôle donne accès. */
  const entrees = navigationAdmin.filter((entree) =>
    accedeALaRubrique(utilisateur.role, entree.href),
  );

  function estActive(href: string): boolean {
    return href === routes.admin ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div
      className={cn(
        "flex h-full w-[248px] shrink-0 flex-col bg-pri px-3.5 pt-5 pb-4",
        ouverte ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="flex items-start justify-between px-2 pb-[22px]">
        <SmartLink href={routes.admin} className="block" aria-label="ASAD — tableau de bord">
          <Logo variante="blanc" taille="footer" />
          <span className="mt-1 block text-[10px] font-bold tracking-[0.14em] text-white/45 uppercase">
            Administration
          </span>
        </SmartLink>

        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="flex size-9 items-center justify-center rounded-btn text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} strokeWidth={1.9} aria-hidden="true" />
            <span className="sr-only">Fermer le menu</span>
          </button>
        )}
      </div>

      <nav aria-label="Navigation du back-office" className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {entrees.map((entree) => {
            const active = estActive(entree.href);
            /* Une pastille à zéro n'apprend rien : on ne l'affiche pas. */
            const enAttente = entree.compteur ? compteurs[entree.compteur] : 0;
            return (
              <li key={entree.href}>
                <SmartLink
                  href={entree.href}
                  onClick={onFermer}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-[38px] items-center gap-[11px] rounded-btn px-2.5 text-meta transition-colors duration-150",
                    active
                      ? "bg-acc font-bold text-white"
                      : "font-medium text-white/74 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <IconeAdmin cle={entree.icone} />
                  <span className="flex-1 truncate">{entree.label}</span>
                  {enAttente > 0 && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white",
                        active ? "bg-white/24" : "bg-white/14",
                      )}
                    >
                      {enAttente}
                      <span className="sr-only"> à traiter</span>
                    </span>
                  )}
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Carte utilisateur */}
      <div className="mt-auto border-t border-white/14 pt-3.5">
        <div className="flex items-center gap-3 px-2">
          <span
            aria-hidden="true"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-acc text-tiny font-bold text-white"
          >
            {initiales(utilisateur.nom)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-meta font-semibold text-white">
              {utilisateur.nom}
            </p>
            <p className="truncate text-micro text-white/50">
              {libelleRole[utilisateur.role]}
            </p>
          </div>
          <BoutonDeconnexion />
        </div>
      </div>
    </div>
  );
}
