import { Lock } from "lucide-react";

/**
 * Affiché quand un utilisateur atteint une rubrique interdite à son rôle.
 * On explique plutôt que d'afficher une page d'erreur sans issue.
 */
export function BandeauAccesRefuse({ rubrique }: { rubrique?: string }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-[11px] border border-erreur bg-alerte px-4 py-3.5"
    >
      <Lock size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-erreur" />
      <p className="text-meta leading-[1.6] text-alerte-ink">
        {rubrique
          ? `Votre rôle ne donne pas accès à la rubrique « ${rubrique} ».`
          : "Votre rôle ne donne pas accès à cette rubrique."}{" "}
        Demandez à un administrateur de faire évoluer vos droits si vous en avez besoin.
      </p>
    </div>
  );
}
