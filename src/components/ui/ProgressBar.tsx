import { formatEuros, pourcentage } from "@/lib/format";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  collecte: number;
  objectif: number;
  ton?: "clair" | "sombre";
  className?: string;
}

/** Barre de collecte d'une campagne d'urgence. */
export function ProgressBar({
  collecte,
  objectif,
  ton = "clair",
  className,
}: ProgressBarProps) {
  const part = pourcentage(collecte, objectif);
  const sombre = ton === "sombre";

  return (
    <div className={className}>
      <p className={cn("text-lead", sombre ? "text-white" : "text-ink")}>
        <strong className="font-bold">{formatEuros(collecte)}</strong>{" "}
        <span className={sombre ? "text-white/78" : "text-mut"}>
          collectés sur {formatEuros(objectif)}
        </span>
      </p>

      <div className="mt-3 flex items-center gap-4">
        <div
          className={cn(
            "h-2.5 flex-1 overflow-hidden rounded-full",
            sombre ? "bg-white/20" : "bg-line",
          )}
          role="progressbar"
          aria-valuenow={part}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Collecte : ${part} % de l’objectif de ${formatEuros(objectif)}`}
        >
          <div
            className="h-full rounded-full bg-acc transition-[width] duration-500"
            style={{ width: `${part}%` }}
          />
        </div>
        <span
          className={cn(
            "shrink-0 text-meta font-semibold tabular-nums",
            sombre ? "text-white" : "text-pri",
          )}
        >
          {part} %
        </span>
      </div>
    </div>
  );
}
