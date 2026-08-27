import { Heart } from "lucide-react";
import { barreAide } from "@/content/site";
import { SmartLink } from "@/components/ui/SmartLink";

/** Barre d'aide : point de contact d'urgence, toujours visible en haut de page. */
export function TopBar() {
  if (!barreAide.visible) return null;

  return (
    <div className="flex min-h-[44px] items-center justify-center gap-[9px] bg-pri px-4 py-2 text-center text-meta tracking-[0.005em] text-white">
      <Heart
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="hidden shrink-0 opacity-85 sm:block"
      />
      <span className="opacity-92">{barreAide.texte}</span>
      <SmartLink
        href={barreAide.lienHref}
        className="font-bold text-white underline underline-offset-[3px] hover:text-acc-light"
      >
        {barreAide.lienLabel}
      </SmartLink>
    </div>
  );
}
