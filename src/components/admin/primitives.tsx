import { cn } from "@/lib/cn";
import { SmartLink } from "@/components/ui/SmartLink";

/* ------------------------------------------------------------------ */
/* Statuts — couleurs fonctionnelles du back-office                    */
/* ------------------------------------------------------------------ */

export type TonStatut = "info" | "attente" | "alerte" | "neutre" | "succes";

const TONS: Record<TonStatut, string> = {
  info: "bg-soft text-pri",
  attente: "bg-attente text-attente-ink",
  alerte: "bg-alerte text-alerte-ink",
  neutre: "bg-neutre text-neutre-ink",
  succes: "bg-succes text-succes-ink",
};

/** Pilule de statut : hauteur 24, 11.5 px / 700. */
export function PiluleStatut({
  ton,
  children,
  className,
}: {
  ton: TonStatut;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-micro font-bold whitespace-nowrap",
        TONS[ton],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

export function CarteAdmin({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-media border border-line bg-white shadow-[0_1px_2px_rgba(17,24,39,.03)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function EnTeteCarte({
  titre,
  lien,
  lienLabel = "Tout voir",
}: {
  titre: string;
  lien?: string;
  lienLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-[18px] pb-3.5">
      <h2 className="text-[16px] font-bold text-ink">{titre}</h2>
      {lien && (
        <SmartLink
          href={lien}
          className="text-tiny font-semibold text-acc transition-colors duration-150 hover:text-acc-dark"
        >
          {lienLabel}
        </SmartLink>
      )}
    </div>
  );
}

/** Ligne de liste : padding 11/20, filet supérieur. */
export function LigneCarte({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex items-center gap-3.5 border-t border-line px-5 py-[11px]", className)}>
      {children}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* En-tête de page                                                     */
/* ------------------------------------------------------------------ */

export function EnTetePageAdmin({
  titre,
  sousTitre,
  actions,
}: {
  titre: string;
  sousTitre?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.015em] text-ink sm:text-[25px]">
          {titre}
        </h1>
        {sousTitre && <p className="mt-1 text-[14px] text-mut">{sousTitre}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Boutons admin                                                       */
/* ------------------------------------------------------------------ */

export const BOUTON_PRINCIPAL =
  "inline-flex h-10 items-center gap-2 rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark";

export const BOUTON_SECONDAIRE =
  "inline-flex h-[38px] items-center gap-2 rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri";

/** Avatar de personne : cercle 36 px, initiales. */
export function Avatar({
  initiales,
  className,
}: {
  initiales: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-tiny font-bold text-pri",
        className,
      )}
    >
      {initiales}
    </span>
  );
}
