"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, RotateCcw, Sparkles } from "lucide-react";
import { redigerFiche } from "@/app/actions/assistant";
import { NOTES_MAX } from "@/lib/etat-assistant";
import type { FicheRedigee } from "@/lib/ia/redaction-animal";
import { cn } from "@/lib/cn";

/**
 * Assistant de rédaction : la bénévole raconte l'animal avec ses mots,
 * l'assistant remplit les champs rédigés du formulaire.
 *
 * Rien n'est enregistré : les valeurs sont posées dans le formulaire, où elles
 * sont relues, corrigées, et où « Annuler » les retire d'un clic.
 */

/** Champs remplis, avec leur libellé et l'onglet où les relire. */
const CHAMPS: Array<{ nom: keyof FicheRedigee; label: string; onglet: string }> = [
  { nom: "descriptionCourte", label: "Description courte", onglet: "Présentation" },
  { nom: "histoire", label: "Son histoire", onglet: "Présentation" },
  { nom: "caractere", label: "Traits de caractère", onglet: "Présentation" },
  { nom: "caractereNote", label: "Précision sur le caractère", onglet: "Présentation" },
  { nom: "taille", label: "Taille", onglet: "Identité" },
  { nom: "compatChiens", label: "Avec les chiens", onglet: "Compatibilités" },
  { nom: "compatChats", label: "Avec les chats", onglet: "Compatibilités" },
  { nom: "compatEnfants", label: "Avec les enfants", onglet: "Compatibilités" },
  { nom: "compatNoteChiens", label: "Précision chiens", onglet: "Compatibilités" },
  { nom: "compatNoteChats", label: "Précision chats", onglet: "Compatibilités" },
  { nom: "compatNoteEnfants", label: "Précision enfants", onglet: "Compatibilités" },
];

const EXEMPLE = `Chien croisé berger, 3 ans à peu près, trouvé errant vers Martigues en juin. Très peureux avec les hommes au début, ça va beaucoup mieux depuis deux mois. S'entend bien avec les autres chiennes de la famille d'accueil. Pas testé avec les chats. Très gourmand, apprend vite. Taille moyenne, environ 20 kg.`;

/** Met une valeur du modèle sous la forme attendue par le champ. */
function versTexte(valeur: unknown): string | null {
  if (valeur == null) return null;
  if (Array.isArray(valeur)) {
    const propres = valeur.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return propres.length ? propres.join(valeur.length > 0 && propres[0].length < 30 ? ", " : "\n") : null;
  }
  const texte = String(valeur).trim();
  return texte === "" ? null : texte;
}

export function AssistantFiche({
  nomInitial,
}: {
  nomInitial?: string;
}) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState("");
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [remplis, setRemplis] = useState<typeof CHAMPS>([]);
  const [ignores, setIgnores] = useState<typeof CHAMPS>([]);
  /** Valeurs d'avant, pour pouvoir tout remettre en place. */
  const avant = useRef<Map<string, string> | null>(null);

  function formulaire(): HTMLFormElement | null {
    return conteneurRef.current?.closest("form") ?? null;
  }

  function champ(form: HTMLFormElement, nom: string) {
    const el = form.elements.namedItem(nom);
    return el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
      ? el
      : null;
  }

  function appliquer(proposition: FicheRedigee) {
    const form = formulaire();
    if (!form) {
      setErreur("Le formulaire n’a pas été trouvé. Rechargez la page.");
      return;
    }

    const sauvegarde = new Map<string, string>();
    const poses: typeof CHAMPS = [];
    const vides: typeof CHAMPS = [];

    for (const definition of CHAMPS) {
      const valeur = versTexte(proposition[definition.nom]);
      if (valeur === null) {
        vides.push(definition);
        continue;
      }
      const el = champ(form, definition.nom);
      if (!el) continue;

      sauvegarde.set(definition.nom, el.value);
      el.value = valeur;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      poses.push(definition);
    }

    avant.current = sauvegarde;
    setRemplis(poses);
    setIgnores(vides);
  }

  function annuler() {
    const form = formulaire();
    if (!form || !avant.current) return;

    for (const [nom, valeur] of avant.current) {
      const el = champ(form, nom);
      if (el) {
        el.value = valeur;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
    avant.current = null;
    setRemplis([]);
    setIgnores([]);
  }

  function lancer() {
    setErreur(null);
    setRemplis([]);
    setIgnores([]);

    demarrer(async () => {
      const form = formulaire();
      const contexte = form
        ? {
            nom: champ(form, "nom")?.value || nomInitial,
            espece: champ(form, "espece")?.value,
            sexe: champ(form, "sexe")?.value,
          }
        : { nom: nomInitial };

      const resultat = await redigerFiche(notes, contexte);

      if (resultat.statut === "succes" && resultat.proposition) {
        appliquer(resultat.proposition);
      } else {
        setErreur(resultat.message ?? "L’assistant n’a pas répondu.");
      }
    });
  }

  const onglets = [...new Set(remplis.map((c) => c.onglet))];

  return (
    <div
      ref={conteneurRef}
      className="mb-6 rounded-panel border-[1.4px] border-acc/35 bg-acc-soft/50 p-5 sm:p-6"
    >
      <h2 className="flex items-center gap-2.5 text-card font-bold text-ink">
        <Sparkles size={19} strokeWidth={1.8} aria-hidden="true" className="text-acc" />
        Vous préférez raconter ?
      </h2>
      <p className="mt-2 max-w-[62ch] text-meta leading-[1.65] text-mut">
        Écrivez ce que vous savez de l’animal, comme vous le diriez à quelqu’un.
        L’assistant remplira la description, l’histoire, le caractère et les
        compatibilités. Vous relisez, vous corrigez, et vous seule enregistrez.
      </p>

      <label htmlFor="notes-assistant" className="mt-4 block text-meta font-semibold text-ink">
        Ce que vous savez de lui
      </label>
      <textarea
        id="notes-assistant"
        /* Volontairement sans `name` : ces notes sont un brouillon de travail,
           elles ne doivent pas partir avec la fiche à l'enregistrement. */
        rows={5}
        value={notes}
        maxLength={NOTES_MAX}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={EXEMPLE}
        className="mt-2 w-full resize-y rounded-btn border-[1.4px] border-line bg-white px-3.5 py-2.5 text-meta leading-[1.6] text-ink placeholder:text-mut/55 focus:border-acc focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={lancer}
          disabled={enCours || notes.trim().length < 20}
          className={cn(
            "inline-flex h-11 items-center gap-2.5 rounded-btn px-5 text-meta font-semibold transition-colors duration-150",
            "bg-acc text-white hover:bg-acc-dark",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <Sparkles size={17} strokeWidth={1.8} aria-hidden="true" />
          {enCours ? "Je rédige…" : "Remplir la fiche"}
        </button>

        {remplis.length > 0 && (
          <button
            type="button"
            onClick={annuler}
            className="inline-flex h-11 items-center gap-2 rounded-btn border-[1.4px] border-line bg-white px-4 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
          >
            <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
            Annuler
          </button>
        )}

        <span className="text-tiny text-mut">
          {notes.trim().length < 20
            ? "Quelques phrases suffisent pour commencer."
            : `${notes.length} / ${NOTES_MAX} caractères`}
        </span>
      </div>

      {/* Retour à la bénévole */}
      <div aria-live="polite">
        {erreur && (
          <p className="mt-4 flex items-start gap-2.5 rounded-btn border border-erreur/30 bg-white p-3.5 text-meta text-erreur">
            <CircleAlert size={17} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
            {erreur}
          </p>
        )}

        {remplis.length > 0 && (
          <div className="mt-4 rounded-btn border border-acc/30 bg-white p-4">
            <p className="flex items-center gap-2.5 text-meta font-semibold text-ink">
              <CircleCheck size={17} strokeWidth={2} aria-hidden="true" className="text-acc" />
              {remplis.length} champ{remplis.length > 1 ? "s" : ""} rempli
              {remplis.length > 1 ? "s" : ""} — à relire dans{" "}
              {onglets.length > 1 ? "les onglets" : "l’onglet"}{" "}
              {onglets.join(", ")}.
            </p>
            <p className="mt-2 text-tiny leading-[1.6] text-mut">
              {remplis.map((c) => c.label).join(" · ")}
            </p>

            {ignores.length > 0 && (
              <p className="mt-3 border-t border-line pt-3 text-tiny leading-[1.6] text-mut">
                <strong className="font-semibold text-ink">
                  Laissé vide, faute d’information dans vos notes :
                </strong>{" "}
                {ignores.map((c) => c.label).join(" · ")}. L’assistant ne devine
                jamais — complétez à la main si vous connaissez la réponse.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
