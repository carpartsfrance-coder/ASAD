import { cn } from "@/lib/cn";
import type { Animal } from "@/types";
import { AnimalCard } from "./AnimalCard";

/** Grille de cartes animal : 3 → 2 → 1 colonne. */
export function AnimalGrid({
  animaux,
  prioriserPremieres = 0,
  className,
}: {
  animaux: Animal[];
  /** Nombre de photos chargées en priorité. */
  prioriserPremieres?: number;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[26px]",
        className,
      )}
    >
      {animaux.map((animal, index) => (
        <li key={animal.id} className="flex">
          <AnimalCard
            animal={animal}
            priorite={index < prioriserPremieres}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
