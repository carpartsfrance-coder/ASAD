import { ShieldCheck } from "lucide-react";
import { SmartLink } from "./SmartLink";
import { lienConfidentialite, type MentionRgpd } from "@/content/rgpd";

/**
 * Mention d'information affichée sous le formulaire.
 *
 * La CNIL demande que chaque collecte dise quatre choses : pourquoi ces
 * données sont demandées, qui les reçoit, combien de temps elles sont
 * gardées, et comment revenir dessus. C'est ce que rend ce bloc.
 */
export function MentionsRgpd({ mention }: { mention: MentionRgpd }) {
  return (
    <div className="mt-6 rounded-card bg-subtil p-5">
      <p className="flex items-center gap-2 text-meta font-bold text-ink">
        <ShieldCheck size={17} strokeWidth={1.9} aria-hidden="true" className="text-acc" />
        Ce que deviennent vos informations
      </p>

      <dl className="mt-3 space-y-2.5 text-mini leading-[1.65] text-mut">
        <div>
          <dt className="inline font-semibold text-ink">Pourquoi : </dt>
          <dd className="inline">{mention.finalite}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Qui les reçoit : </dt>
          <dd className="inline">{mention.destinataire}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Combien de temps : </dt>
          <dd className="inline">{mention.conservation}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Vos droits : </dt>
          <dd className="inline">{mention.droits}</dd>
        </div>
      </dl>

      <SmartLink
        href={lienConfidentialite.href}
        className="link-underline mt-3 inline-block text-mini font-semibold text-acc hover:text-acc-dark"
      >
        {lienConfidentialite.label}
      </SmartLink>
    </div>
  );
}
