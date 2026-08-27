import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

interface ArrowLinkProps {
  href: string;
  externe?: boolean;
  children: React.ReactNode;
  /** `accent` sur fond clair, `clair` sur le bandeau sombre. */
  ton?: "accent" | "clair";
  taille?: "sm" | "md";
  className?: string;
}

/**
 * Lien souligné suivi d'une flèche — motif récurrent de la maquette
 * (« Voir tous les animaux », « Je donne », « Lire d'autres histoires »…).
 */
export function ArrowLink({
  href,
  externe,
  children,
  ton = "accent",
  taille = "sm",
  className,
}: ArrowLinkProps) {
  return (
    <SmartLink
      href={href}
      externe={externe}
      className={cn(
        "link-underline inline-flex items-center font-semibold transition-colors duration-150",
        taille === "sm" ? "gap-2.5 text-body" : "gap-[11px] text-nav",
        ton === "accent" ? "text-acc hover:text-acc-dark" : "text-white hover:text-acc-light",
        className,
      )}
    >
      {children}
      <ArrowRight
        size={taille === "sm" ? 16 : 17}
        strokeWidth={1.9}
        aria-hidden="true"
        className="shrink-0"
      />
    </SmartLink>
  );
}
