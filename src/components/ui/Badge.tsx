import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StatutAnimal } from "@/types";
import { libelleStatut } from "@/lib/animaux";

/**
 * Pastille de statut posée sur la photo des cartes animal.
 * Quatre variantes définies par le handoff.
 */
export function BadgeStatut({
  statut,
  taille = "carte",
  className,
}: {
  statut: StatutAnimal;
  /** `fiche` = version agrandie de la fiche animal (13 px, padding 8/16). */
  taille?: "carte" | "fiche";
  className?: string;
}) {
  if (statut === "brouillon") return null;

  const urgent = statut === "urgent";
  const dimensions =
    taille === "fiche" ? "px-4 py-2 text-mini" : "px-[13px] py-1.5 text-tiny";

  return (
    <span
      className={cn(
        "pointer-events-none inline-flex items-center rounded-full font-semibold",
        urgent
          ? "gap-[7px] bg-acc px-3 py-1.5 text-micro font-bold tracking-[0.05em] text-white uppercase"
          : dimensions,
        !urgent && statut === "a_adopter" && "bg-pri text-white",
        !urgent && statut === "reserve" && "border-[1.3px] border-line bg-white text-pri",
        !urgent && statut === "adopte" && "bg-track text-white",
        className,
      )}
    >
      {urgent && <CircleAlert size={13} strokeWidth={2.2} aria-hidden="true" />}
      {libelleStatut[statut]}
    </span>
  );
}

/** Étiquette rectangulaire « URGENCES » du bandeau sombre. */
export function Etiquette({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-[7px] bg-acc px-[13px] py-[7px] text-micro font-bold tracking-[0.08em] text-white uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Puce d'information neutre (caractère, compatibilité, catégorie…). */
export function Puce({
  children,
  ton = "soft",
  className,
}: {
  children: React.ReactNode;
  ton?: "soft" | "line" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 text-meta",
        "h-[34px]",
        ton === "soft" && "bg-soft text-pri",
        ton === "line" && "border border-line bg-white text-mut",
        ton === "accent" && "bg-acc-soft text-acc-dark",
        className,
      )}
    >
      {children}
    </span>
  );
}
