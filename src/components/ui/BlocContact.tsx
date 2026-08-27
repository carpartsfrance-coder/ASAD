import { Mail, Phone } from "lucide-react";
import { Button } from "./Button";
import { association } from "@/content/site";

interface BlocContactProps {
  titre?: string;
  intro?: string;
  /**
   * Ce qu'il est utile de préciser. Sans cette liste, l'association doit
   * relancer pour obtenir les mêmes informations que demandait le formulaire.
   */
  aPreparer?: string[];
  /** Objet pré-rempli du courriel, pour que les messages arrivent triés. */
  objet?: string;
  className?: string;
}

/**
 * Le seul moyen de joindre l'association : un e-mail ou un appel.
 *
 * Le site ne comporte aucun formulaire. L'adresse et le numéro sont donc
 * écrits en toutes lettres autant qu'en lien : un lien `mailto:` reste inerte
 * chez qui n'a pas de logiciel de messagerie configuré, il faut pouvoir
 * recopier l'adresse.
 */
export function BlocContact({
  titre = "Nous contacter",
  intro,
  aPreparer,
  objet,
  className,
}: BlocContactProps) {
  const lienMail = objet
    ? `mailto:${association.email}?subject=${encodeURIComponent(objet)}`
    : `mailto:${association.email}`;

  return (
    <section className={className} aria-label={titre}>
      <div className="rounded-panel bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-title font-extrabold text-ink">{titre}</h2>
        {intro && <p className="mt-3 max-w-[560px] text-body leading-[1.72] text-mut">{intro}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line p-5">
            <Mail size={22} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
            <p className="mt-3 text-meta font-semibold tracking-[0.08em] uppercase text-mut">
              Par e-mail
            </p>
            <p className="mt-1 text-body font-semibold break-words text-ink">
              {association.email}
            </p>
            <Button href={lienMail} variante="primaire" taille="md" className="mt-4">
              Écrire un message
            </Button>
          </div>

          <div className="rounded-card border border-line p-5">
            <Phone size={22} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
            <p className="mt-3 text-meta font-semibold tracking-[0.08em] uppercase text-mut">
              Par téléphone
            </p>
            <p className="mt-1 text-body font-semibold text-ink">{association.telephone}</p>
            <Button
              href={`tel:${association.telephoneLien}`}
              variante="contourAccent"
              taille="md"
              className="mt-4"
            >
              Appeler
            </Button>
          </div>
        </div>

        {aPreparer && aPreparer.length > 0 && (
          <div className="mt-6 rounded-card bg-subtil p-5">
            <h3 className="text-body font-bold text-ink">Pensez à nous préciser</h3>
            <ul className="mt-3 space-y-2 text-meta leading-[1.65] text-mut">
              {aPreparer.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 rounded-full bg-acc" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
