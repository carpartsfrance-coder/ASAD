import { PawPrint } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Trois pas d'animal qui arrivent au bout du titre d'accueil.
 *
 * Chaque patte entre par la gauche, un peu plus marquée que la précédente :
 * quelqu'un s'approche. L'animation ne joue qu'une fois, au chargement — une
 * boucle serait pénible à côté d'un texte qu'on lit.
 *
 * Purement décoratif : masqué aux lecteurs d'écran, et taillé en `em` pour
 * suivre le titre quelle que soit la taille de l'écran.
 */
const PAS = [
  { pivot: "-14deg", teinte: 0.38, taille: "0.34em", decalage: "0.06em" },
  { pivot: "8deg", teinte: 0.62, taille: "0.38em", decalage: "-0.04em" },
  { pivot: "-5deg", teinte: 1, taille: "0.42em", decalage: "0.02em" },
];

export function TraceDePattes({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("trace-pattes inline-flex items-end gap-[0.1em] text-acc", className)}
    >
      {PAS.map((pas, i) => (
        <PawPrint
          key={pas.pivot}
          strokeWidth={2}
          className="block shrink-0"
          style={
            {
              width: pas.taille,
              height: pas.taille,
              marginBottom: pas.decalage,
              animationDelay: `${560 + i * 200}ms`,
              "--pivot": pas.pivot,
              "--teinte": pas.teinte,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
