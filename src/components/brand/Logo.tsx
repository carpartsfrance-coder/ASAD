import Image from "next/image";
import { cn } from "@/lib/cn";
import { association } from "@/content/site";

/* Découpes du logo fourni par l'association (`marque-source/`, regénérables
   par `npm run marque`). Le pictogramme et le mot sont séparés pour rester
   lisibles aux petites tailles : le logo complet fait 3,4 fois plus large que
   haut, sa baseline tomberait à deux pixels dans un en-tête. */
const MARQUE = { src: "/marque/asad-marque.png", l: 580, h: 553 };
const MOT = { src: "/marque/asad-mot.png", l: 1268, h: 309 };
const MOT_BLANC = { src: "/marque/asad-mot-blanc.png", l: 1268, h: 309 };

/** Hauteurs en pixels, dans la proportion du logo d'origine (mot ≈ 0,56 × pictogramme). */
const TAILLES = {
  header: { marque: 42, mot: 24 },
  footer: { marque: 34, mot: 19 },
} as const;

interface LogoProps {
  /** `bicolore` sur fond clair, `blanc` sur fond sombre. */
  variante?: "bicolore" | "blanc";
  taille?: keyof typeof TAILLES;
  /** Déploie le sigle sous « ASAD », comme sur le logo de l'association. */
  avecSignification?: boolean;
  /** À réserver au logo de l'en-tête : lui seul est visible au chargement. */
  priorite?: boolean;
  className?: string;
}

/**
 * Le logo de l'association : un chien et un chat dans un cœur, puis « ASAD ».
 *
 * Sur fond sombre, le pictogramme est posé sur une pastille blanche — ses
 * contours sont noirs, il disparaîtrait autrement. Seul le mot change de
 * couleur ; le dessin, lui, n'est jamais retouché.
 *
 * `width` et `height` décrivent le fichier, la taille d'affichage est imposée
 * en CSS, et `sizes` dit au navigateur la largeur réelle à l'écran — sans quoi
 * il téléchargerait l'original de 1268 pixels de large pour l'afficher en 98.
 */
export function Logo({
  variante = "bicolore",
  taille = "header",
  avecSignification = false,
  priorite = false,
  className,
}: LogoProps) {
  const sombre = variante === "blanc";
  const dim = TAILLES[taille];
  const mot = sombre ? MOT_BLANC : MOT;

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          sombre && "rounded-full bg-white",
        )}
        style={sombre ? { height: dim.marque * 1.28, width: dim.marque * 1.28 } : undefined}
      >
        <Image
          src={MARQUE.src}
          width={MARQUE.l}
          height={MARQUE.h}
          sizes={`${Math.ceil((dim.marque * MARQUE.l) / MARQUE.h)}px`}
          alt=""
          aria-hidden="true"
          priority={priorite}
          className="block w-auto"
          style={{ height: dim.marque }}
        />
      </span>

      <span className="min-w-0">
        <Image
          src={mot.src}
          width={mot.l}
          height={mot.h}
          sizes={`${Math.ceil((dim.mot * mot.l) / mot.h)}px`}
          alt={association.nom}
          priority={priorite}
          className="block w-auto"
          style={{ height: dim.mot }}
        />
        {avecSignification && (
          <span
            className={cn(
              "mt-1 block text-[9px] leading-tight font-bold tracking-[0.13em] uppercase",
              sombre ? "text-white/60" : "text-mut",
            )}
          >
            {association.signification}
          </span>
        )}
      </span>
    </span>
  );
}
