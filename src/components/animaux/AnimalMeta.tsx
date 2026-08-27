import { MapPin, Mars, Ruler, Venus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Animal } from "@/types";
import { libelleSexe, libelleTaille } from "@/lib/animaux";

/** Ligne de méta d'une carte animal : sexe, taille et commune. */
export function AnimalMeta({
  animal,
  avecCommune = true,
  className,
}: {
  animal: Animal;
  avecCommune?: boolean;
  className?: string;
}) {
  const IconeSexe = animal.sexe === "femelle" ? Venus : Mars;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-meta text-mut",
        className,
      )}
    >
      <li className="inline-flex items-center gap-[7px]">
        <IconeSexe size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
        {libelleSexe[animal.sexe]}
      </li>
      <li className="inline-flex items-center gap-[7px]">
        <Ruler size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
        {libelleTaille[animal.taille]}
      </li>
      {avecCommune && (
        <li className="inline-flex items-center gap-[7px]">
          <MapPin size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
          {animal.commune}
        </li>
      )}
    </ul>
  );
}
