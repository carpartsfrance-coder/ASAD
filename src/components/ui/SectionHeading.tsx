import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  titre: string;
  sousTitre?: string;
  /** Aligné au centre par défaut, comme dans la maquette. */
  align?: "centre" | "gauche";
  ton?: "sombre" | "clair";
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Titre de section : 35 px / 800, interlettrage -0.018em. */
export function SectionHeading({
  titre,
  sousTitre,
  align = "centre",
  ton = "sombre",
  id,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "centre" && "text-center", className)}>
      <h2
        id={id}
        className={cn(
          "text-[28px] leading-tight font-extrabold tracking-[-0.018em] sm:text-[32px] lg:text-section",
          ton === "sombre" ? "text-ink" : "text-white",
        )}
      >
        {titre}
      </h2>
      {sousTitre && (
        <p
          className={cn(
            "mt-3.5 text-lead",
            ton === "sombre" ? "text-mut" : "text-white/78",
            align === "gauche" && "max-w-[560px] leading-[1.68]",
          )}
        >
          {sousTitre}
        </p>
      )}
      {children}
    </div>
  );
}
