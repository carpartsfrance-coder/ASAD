"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/content/site";
import type { StatutMessageLivreOr } from "@/types";

const ONGLETS: Array<{ cle: StatutMessageLivreOr; label: string }> = [
  { cle: "en_attente", label: "À relire" },
  { cle: "publie", label: "Publiés" },
  { cle: "refuse", label: "Refusés" },
  { cle: "indesirable", label: "Indésirables" },
  { cle: "archive", label: "Archivés" },
];

export function OngletsLivreOr({
  statutActif,
  compteurs,
}: {
  statutActif: StatutMessageLivreOr;
  compteurs: Record<StatutMessageLivreOr, number>;
}) {
  const router = useRouter();

  return (
    <div role="tablist" aria-label="Filtrer les messages" className="mt-5 flex flex-wrap gap-2">
      {ONGLETS.map((onglet) => {
        const actif = statutActif === onglet.cle;
        return (
          <button
            key={onglet.cle}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => router.replace(`${routes.adminLivreOr}?statut=${onglet.cle}`)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-btn px-3.5 text-meta transition-colors duration-150",
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
              {compteurs[onglet.cle]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
