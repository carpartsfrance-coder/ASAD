import { HandHeart, Heart, HousePlus, PawPrint, Users } from "lucide-react";
import type { Statistique } from "@/types";
import type { CleIconeAide } from "@/content/aider";

/** Icône du bandeau de chiffres. La patte est pleine, comme dans la maquette. */
export function StatIcon({
  icone,
  size = 30,
}: {
  icone: Statistique["icone"];
  size?: number;
}) {
  if (icone === "patte") {
    return (
      <PawPrint
        size={size}
        strokeWidth={0}
        aria-hidden="true"
        className="fill-current"
      />
    );
  }

  const Icone = icone === "maison-coeur" ? HousePlus : Heart;
  return <Icone size={size} strokeWidth={1.6} aria-hidden="true" />;
}

/** Icône des cartes « Chaque geste peut changer une vie ». */
export function AideIcon({
  icone,
  size = 34,
}: {
  icone: CleIconeAide;
  size?: number;
}) {
  const Icone =
    icone === "main-coeur" ? HandHeart : icone === "maison-coeur" ? HousePlus : Users;
  return <Icone size={size} strokeWidth={1.55} aria-hidden="true" />;
}
