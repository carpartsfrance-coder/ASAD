import { ChevronRight } from "lucide-react";
import { SmartLink } from "./SmartLink";
import { routes } from "@/content/site";

export interface MailleFilAriane {
  label: string;
  href?: string;
}

/** Fil d'Ariane des pages intérieures. */
export function Breadcrumb({ maillons }: { maillons: MailleFilAriane[] }) {
  const complet: MailleFilAriane[] = [
    { label: "Accueil", href: routes.accueil },
    ...maillons,
  ];

  return (
    <nav aria-label="Fil d’Ariane" className="text-meta text-mut">
      <ol className="flex flex-wrap items-center gap-1.5">
        {complet.map((maillon, index) => {
          const dernier = index === complet.length - 1;
          return (
            <li key={`${maillon.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" className="text-mut/60" />
              )}
              {maillon.href && !dernier ? (
                <SmartLink
                  href={maillon.href}
                  className="transition-colors duration-150 hover:text-pri"
                >
                  {maillon.label}
                </SmartLink>
              ) : (
                <span aria-current={dernier ? "page" : undefined} className="text-ink">
                  {maillon.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
