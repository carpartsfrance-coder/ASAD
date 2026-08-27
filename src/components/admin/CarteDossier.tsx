import { Mail, MapPin, Phone } from "lucide-react";
import { CarteAdmin, PiluleStatut, type TonStatut } from "./primitives";
import { formatDate } from "@/lib/format";

export interface OptionStatut {
  valeur: string;
  label: string;
}

/**
 * Carte d'un dossier reçu depuis le site : demande d'adoption, candidature,
 * signalement. Structure commune — identité, coordonnées, réponses, statut.
 */
export function CarteDossier({
  titre,
  sousTitre,
  date,
  email,
  telephone,
  commune,
  statut,
  statutLabel,
  ton,
  options,
  action,
  champsCaches,
  details,
}: {
  titre: string;
  sousTitre?: string;
  date: string;
  email?: string;
  telephone?: string;
  commune?: string;
  statut: string;
  statutLabel: string;
  ton: TonStatut;
  options: OptionStatut[];
  action: (data: FormData) => Promise<void>;
  champsCaches: Record<string, string>;
  details?: Array<{ libelle: string; valeur: string }>;
}) {
  return (
    <CarteAdmin className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body font-bold text-ink">{titre}</p>
          {sousTitre && <p className="text-tiny text-mut">{sousTitre}</p>}
          <p className="mt-0.5 text-tiny text-mut">
            Reçu le <time dateTime={date}>{formatDate(date)}</time>
          </p>
        </div>
        <PiluleStatut ton={ton}>{statutLabel}</PiluleStatut>
      </div>

      {(email || telephone || commune) && (
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-meta text-mut">
          {email && (
            <li className="flex items-center gap-2">
              <Mail size={15} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
              <a href={`mailto:${email}`} className="hover:text-pri">
                {email}
              </a>
            </li>
          )}
          {telephone && (
            <li className="flex items-center gap-2">
              <Phone size={15} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
              <a href={`tel:${telephone.replace(/\s/g, "")}`} className="hover:text-pri">
                {telephone}
              </a>
            </li>
          )}
          {commune && (
            <li className="flex items-center gap-2">
              <MapPin size={15} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
              {commune}
            </li>
          )}
        </ul>
      )}

      {details && details.length > 0 && (
        <details className="group mt-4">
          <summary className="cursor-pointer list-none text-meta font-semibold text-acc [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Voir les réponses</span>
            <span className="hidden group-open:inline">Masquer les réponses</span>
          </summary>
          <dl className="mt-3 space-y-2.5 rounded-media bg-subtil p-4">
            {details.map((d) => (
              <div key={d.libelle}>
                <dt className="text-tiny font-semibold text-ink">{d.libelle}</dt>
                <dd className="text-meta leading-[1.6] text-mut">{d.valeur}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <form action={action} className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {Object.entries(champsCaches).map(([nom, valeur]) => (
          <input key={nom} type="hidden" name={nom} value={valeur} />
        ))}

        <label htmlFor={`statut-${champsCaches.id}`} className="text-meta text-mut">
          Où en est ce dossier ?
        </label>
        <select
          id={`statut-${champsCaches.id}`}
          name="statut"
          defaultValue={statut}
          className="h-9 cursor-pointer rounded-btn border-[1.4px] border-line bg-white px-3 text-meta text-ink transition-colors duration-150 focus:border-acc focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.valeur} value={o.valeur}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
        >
          Enregistrer
        </button>
      </form>
    </CarteAdmin>
  );
}
