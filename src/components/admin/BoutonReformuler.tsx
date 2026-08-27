"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, RotateCcw, Sparkles } from "lucide-react";
import { reformuler } from "@/app/actions/assistant";
import { cn } from "@/lib/cn";

/**
 * Met au propre le texte déjà écrit dans la description.
 *
 * L'assistant ne remplit pas la fiche et n'ajoute rien : il reprend les
 * phrases de la bénévole. Le résultat arrive dans le champ, où il reste
 * modifiable, et « Annuler » remet son texte d'origine.
 */
export function BoutonReformuler({ champ }: { champ: string }) {
  const ancre = useRef<HTMLDivElement>(null);
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const avant = useRef<string | null>(null);
  const [reformule, setReformule] = useState(false);

  function zone(): HTMLTextAreaElement | HTMLInputElement | null {
    const form = ancre.current?.closest("form");
    const el = form?.elements.namedItem(champ);
    return el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement
      ? el
      : null;
  }

  function poser(el: HTMLTextAreaElement | HTMLInputElement, valeur: string) {
    el.value = valeur;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function lancer() {
    setErreur(null);
    const el = zone();
    if (!el) return setErreur("Le champ n’a pas été trouvé. Rechargez la page.");

    const texte = el.value;
    const form = ancre.current?.closest("form");
    const lire = (nom: string) => {
      const c = form?.elements.namedItem(nom);
      return c instanceof HTMLInputElement || c instanceof HTMLSelectElement
        ? c.value
        : undefined;
    };

    demarrer(async () => {
      const resultat = await reformuler(texte, {
        nom: lire("nom"),
        espece: lire("espece"),
        sexe: lire("sexe"),
      });

      if (resultat.statut === "succes" && resultat.texte) {
        avant.current = texte;
        poser(el, resultat.texte);
        setReformule(true);
      } else {
        setErreur(resultat.message ?? "L’assistant n’a pas répondu.");
      }
    });
  }

  function annuler() {
    const el = zone();
    if (el && avant.current !== null) poser(el, avant.current);
    avant.current = null;
    setReformule(false);
  }

  return (
    <div ref={ancre} className="mt-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={lancer}
          disabled={enCours}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-btn border-[1.4px] border-acc bg-white px-3.5",
            "text-tiny font-semibold text-acc transition-colors duration-150",
            "hover:bg-acc-soft disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <Sparkles size={15} strokeWidth={1.9} aria-hidden="true" />
          {enCours ? "Je relis…" : "Mettre au propre"}
        </button>

        {reformule && (
          <button
            type="button"
            onClick={annuler}
            className="inline-flex h-9 items-center gap-2 rounded-btn border-[1.4px] border-line bg-white px-3 text-tiny font-semibold text-pri transition-colors duration-150 hover:border-pri"
          >
            <RotateCcw size={14} strokeWidth={1.9} aria-hidden="true" />
            Revenir à mon texte
          </button>
        )}

        <span className="text-tiny text-mut">
          {reformule
            ? "Relisez : l’assistant corrige le style, il n’ajoute rien."
            : "Corrige l’orthographe et les tournures, sans rien inventer."}
        </span>
      </div>

      <div aria-live="polite">
        {erreur && (
          <p className="mt-2 flex items-start gap-2 text-tiny text-erreur">
            <CircleAlert size={14} strokeWidth={2.2} aria-hidden="true" className="mt-px shrink-0" />
            {erreur}
          </p>
        )}
      </div>
    </div>
  );
}
