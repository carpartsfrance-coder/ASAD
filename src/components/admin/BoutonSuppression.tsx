"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";

/**
 * Suppression définitive, en deux temps.
 *
 * Le premier clic ne supprime rien : il remplace le bouton par une question.
 * C'est la seule action irréversible du back-office, elle ne doit pas pouvoir
 * partir sur une fausse manœuvre. La question se referme d'elle-même au bout
 * de dix secondes, pour ne pas laisser un piège ouvert dans la page.
 */
export function BoutonSuppression({
  libelle = "Supprimer définitivement",
  question = "Supprimer définitivement ? C’est irréversible.",
  ...soumission
}: {
  libelle?: string;
  /** Question posée après le premier clic. */
  question?: string;
  /** Passés tels quels au bouton de confirmation (formAction, name, value…). */
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  formNoValidate?: boolean;
  name?: string;
  value?: string;
}) {
  const [demande, setDemande] = useState(false);
  const confirmerRef = useRef<HTMLButtonElement>(null);
  const declencheurRef = useRef<HTMLButtonElement>(null);
  /* Le bouton d'origine est démonté pendant la question : on ne peut lui
     rendre le clavier qu'au rendu suivant, une fois qu'il est revenu. */
  const rendreLeFocus = useRef(false);

  useEffect(() => {
    if (demande) {
      confirmerRef.current?.focus();
      const minuterie = setTimeout(() => {
        rendreLeFocus.current = true;
        setDemande(false);
      }, 10_000);
      return () => clearTimeout(minuterie);
    }

    if (rendreLeFocus.current) {
      rendreLeFocus.current = false;
      declencheurRef.current?.focus();
    }
  }, [demande]);

  function annuler() {
    rendreLeFocus.current = true;
    setDemande(false);
  }

  if (!demande) {
    return (
      <button
        ref={declencheurRef}
        type="button"
        onClick={() => setDemande(true)}
        className="inline-flex h-9 items-center gap-2 rounded-btn border-[1.4px] border-erreur/40 bg-white px-3.5 text-meta font-semibold text-erreur transition-colors duration-150 hover:bg-alerte"
      >
        <Trash2 size={16} strokeWidth={1.9} aria-hidden="true" />
        {libelle}
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label={question}
      className="inline-flex flex-wrap items-center gap-2 rounded-btn border-[1.4px] border-erreur/40 bg-erreur-fond px-3 py-2"
    >
      <p className="text-meta font-semibold text-erreur">{question}</p>

      <button
        ref={confirmerRef}
        type="submit"
        {...soumission}
        className="inline-flex h-8 items-center gap-2 rounded-btn bg-erreur px-3 text-meta font-bold text-white transition-colors duration-150 hover:brightness-90"
      >
        <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
        Oui, supprimer
      </button>

      <button
        type="button"
        onClick={annuler}
        className="inline-flex h-8 items-center gap-1.5 rounded-btn border-[1.4px] border-line bg-white px-3 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
        Annuler
      </button>
    </div>
  );
}
