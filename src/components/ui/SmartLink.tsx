import Link from "next/link";
import type { Route } from "next";

export interface SmartLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Force l'ouverture dans un nouvel onglet (sinon déduit de l'URL). */
  externe?: boolean;
  children: React.ReactNode;
}

/** Une URL absolue mène vers un autre site. */
export function estExterne(href: string): boolean {
  return /^(https?:)?\/\//.test(href);
}

/**
 * Écrire un courriel ou passer un appel n'ouvre pas de page : c'est le logiciel
 * de messagerie ou le téléphone qui prend la main. Un `target="_blank"` y
 * laisserait un onglet vide, et annoncer « nouvelle fenêtre » serait faux.
 */
function passeLaMain(href: string): boolean {
  return /^(mailto|tel):/.test(href);
}

/**
 * Lien unique du site : `next/link` en interne, une balise `<a>` sécurisée
 * vers l'extérieur. C'est le seul endroit où les routes sont converties, ce
 * qui permet de piloter toutes les destinations depuis `content/site.ts`.
 */
export function SmartLink({
  href,
  externe,
  children,
  ...props
}: SmartLinkProps) {
  if (passeLaMain(href)) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  if (externe ?? estExterne(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
        <span className="sr-only"> (nouvelle fenêtre)</span>
      </a>
    );
  }

  return (
    <Link href={href as Route} {...props}>
      {children}
    </Link>
  );
}
