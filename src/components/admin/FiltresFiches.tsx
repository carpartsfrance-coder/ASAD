"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/content/site";

const ONGLETS = [
  { cle: "tous", label: "Toutes" },
  { cle: "brouillon", label: "Brouillons" },
  { cle: "a_adopter", label: "À adopter" },
  { cle: "urgent", label: "Urgents" },
  { cle: "reserve", label: "Réservés" },
  { cle: "adopte", label: "Adoptés" },
] as const;

/** Filtres de la liste des fiches : onglets de statut et recherche. */
export function FiltresFiches({
  statutActif,
  recherche,
  compteurs,
}: {
  statutActif: string;
  recherche: string;
  compteurs: Record<string, number>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function naviguer(modifs: Record<string, string | null>) {
    const suivants = new URLSearchParams(params.toString());
    for (const [cle, valeur] of Object.entries(modifs)) {
      if (valeur === null || valeur === "" || valeur === "tous") suivants.delete(cle);
      else suivants.set(cle, valeur);
    }
    suivants.delete("enregistre");
    suivants.delete("supprime");
    const requete = suivants.toString();
    router.replace(requete ? `${routes.adminAnimaux}?${requete}` : routes.adminAnimaux);
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div role="tablist" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        {ONGLETS.map((onglet) => {
          const actif = statutActif === onglet.cle;
          return (
            <button
              key={onglet.cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => naviguer({ statut: onglet.cle })}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-btn px-3 text-meta transition-colors duration-150",
                actif
                  ? "bg-pri font-semibold text-white"
                  : "border border-line bg-white text-mut hover:border-pri hover:text-pri",
              )}
            >
              {onglet.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-micro font-bold",
                  actif ? "bg-white/20" : "bg-subtil text-mut",
                )}
              >
                {compteurs[onglet.cle] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <label htmlFor="recherche-fiches" className="sr-only">
          Rechercher une fiche
        </label>
        <Search
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mut"
        />
        <input
          id="recherche-fiches"
          type="search"
          defaultValue={recherche}
          onChange={(e) => naviguer({ q: e.target.value })}
          placeholder="Rechercher un nom, une commune…"
          className="h-9 w-full rounded-btn border-[1.4px] border-line bg-white pr-3 pl-9 text-meta text-ink transition-colors duration-150 placeholder:text-mut/70 focus:border-acc focus:outline-none sm:w-[280px]"
        />
      </div>
    </div>
  );
}
