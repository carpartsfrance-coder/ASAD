import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

export type VarianteBouton = "primaire" | "accent" | "contour" | "contourAccent";
export type TailleBouton = "sm" | "md" | "lg";

const VARIANTES: Record<VarianteBouton, string> = {
  // Bouton plein foncé — « Voir les animaux »
  primaire: "bg-pri text-white hover:bg-pri-dark",
  // Bouton plein accent — « Faire un don »
  accent: "bg-acc text-white hover:bg-acc-dark",
  // Bouton fantôme neutre — « Signaler un animal »
  contour:
    "bg-white text-pri border-[1.4px] border-line hover:border-pri",
  // Bouton fantôme accent — « Nous soutenir »
  contourAccent:
    "bg-white text-acc border-[1.4px] border-acc hover:bg-acc-soft",
};

const TAILLES: Record<TailleBouton, string> = {
  sm: "h-[47px] px-6 text-body gap-2.5",
  md: "h-[52px] px-7 text-lead gap-3",
  lg: "h-[54px] px-[26px] text-lead gap-3",
};

const GRAISSES: Record<VarianteBouton, string> = {
  primaire: "font-semibold",
  accent: "font-bold",
  contour: "font-semibold",
  contourAccent: "font-semibold",
};

interface BaseProps {
  variante?: VarianteBouton;
  taille?: TailleBouton;
  /** Icône affichée à droite du libellé, comme dans la maquette. */
  icone?: React.ReactNode;
  pleineLargeur?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface BoutonLienProps extends BaseProps {
  href: string;
  externe?: boolean;
}

interface BoutonActionProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

function classes(
  variante: VarianteBouton,
  taille: TailleBouton,
  pleineLargeur: boolean | undefined,
  className: string | undefined,
) {
  return cn(
    "inline-flex items-center justify-center rounded-[10px] whitespace-nowrap",
    "transition-colors duration-150 disabled:opacity-60 disabled:pointer-events-none",
    VARIANTES[variante],
    GRAISSES[variante],
    TAILLES[taille],
    pleineLargeur && "w-full",
    className,
  );
}

/** Props propres au design system, à ne pas transmettre au DOM. */
const PROPS_STYLE = [
  "variante",
  "taille",
  "icone",
  "pleineLargeur",
  "className",
  "children",
  "href",
  "externe",
] as const;

/** Ne conserve que les attributs HTML valides pour un `<button>`. */
function attributsBouton(
  props: BoutonLienProps | BoutonActionProps,
): React.ButtonHTMLAttributes<HTMLButtonElement> {
  const attributs: Record<string, unknown> = {};
  for (const [cle, valeur] of Object.entries(props)) {
    if (!(PROPS_STYLE as readonly string[]).includes(cle)) {
      attributs[cle] = valeur;
    }
  }
  return attributs as React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Bouton du design system.
 * Rend un lien quand `href` est fourni, un `<button>` sinon.
 */
export function Button(props: BoutonLienProps | BoutonActionProps) {
  const {
    variante = "primaire",
    taille = "lg",
    icone,
    pleineLargeur,
    className,
    children,
  } = props;

  const contenu = (
    <>
      {children}
      {icone}
    </>
  );

  if (props.href) {
    const { href, externe } = props;
    return (
      <SmartLink
        href={href}
        externe={externe}
        className={classes(variante, taille, pleineLargeur, className)}
      >
        {contenu}
      </SmartLink>
    );
  }

  return (
    <button
      {...attributsBouton(props)}
      className={classes(variante, taille, pleineLargeur, className)}
    >
      {contenu}
    </button>
  );
}

/** Variante compacte utilisée dans l'en-tête (hauteur 47 px). */
export function BoutonHeader(
  props: Omit<BoutonLienProps, "taille"> & { taille?: never },
) {
  return <Button {...props} taille="sm" className={cn("rounded-[9px]", props.className)} />;
}
