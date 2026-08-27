"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert, Info } from "lucide-react";

/**
 * Contrôle avant publication.
 *
 * L'assistant de rédaction ne remplit volontairement ni les cases de santé,
 * ni le numéro d'identification, ni les photos. Ce panneau rend visible, en
 * direct, ce qui manque encore — plutôt que de laisser la bénévole s'en
 * apercevoir au moment d'enregistrer.
 */

interface Point {
  cle: string;
  libelle: string;
  onglet: string;
  /** Bloquant : la fiche ne peut pas être publiée sans. */
  bloquant: boolean;
  rempli: boolean;
}

function valeur(form: HTMLFormElement, nom: string): string {
  const el = form.elements.namedItem(nom);
  return el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
    ? el.value.trim()
    : "";
}

function coche(form: HTMLFormElement, nom: string): boolean {
  const el = form.elements.namedItem(nom);
  return el instanceof HTMLInputElement ? el.checked : false;
}

function releve(form: HTMLFormElement): Point[] {
  const photos = valeur(form, "galerie")
    .split("\n")
    .filter((l) => l.trim() !== "").length;

  return [
    {
      cle: "descriptionCourte",
      libelle: "La description",
      onglet: "L’essentiel",
      bloquant: true,
      rempli: valeur(form, "descriptionCourte") !== "",
    },
    {
      cle: "galerie",
      libelle: "Au moins une photo",
      onglet: "L’essentiel",
      bloquant: true,
      rempli: photos > 0,
    },
    {
      cle: "sante",
      libelle: "Les cases vacciné / identifié / stérilisé",
      onglet: "Santé",
      bloquant: false,
      rempli:
        coche(form, "vaccine") || coche(form, "identifie") || coche(form, "sterilise"),
    },
    {
      cle: "fraisAdoption",
      libelle: "Les frais d’adoption",
      onglet: "Adoption",
      bloquant: false,
      rempli: Number(valeur(form, "fraisAdoption")) > 0,
    },
  ];
}

export function ControlePublication({ statut }: { statut: string }) {
  const [points, setPoints] = useState<Point[] | null>(null);

  useEffect(() => {
    const form = document
      .getElementById("controle-publication")
      ?.closest("form");
    if (!form) return;

    const relire = () => setPoints(releve(form));
    relire();

    form.addEventListener("input", relire);
    form.addEventListener("change", relire);
    return () => {
      form.removeEventListener("input", relire);
      form.removeEventListener("change", relire);
    };
  }, []);

  const manquants = points?.filter((p) => !p.rempli) ?? [];
  const bloquants = manquants.filter((p) => p.bloquant);
  const remarques = manquants.filter((p) => !p.bloquant);
  const brouillon = statut === "brouillon";

  return (
    <div
      id="controle-publication"
      className="mt-5 rounded-media border-[1.4px] border-line p-4"
    >
      <h3 className="flex items-center gap-2 text-meta font-bold text-ink">
        {manquants.length === 0 ? (
          <Check size={16} strokeWidth={2.4} aria-hidden="true" className="text-acc" />
        ) : (
          <Info size={16} strokeWidth={2} aria-hidden="true" className="text-mut" />
        )}
        Avant de publier
      </h3>

      {points === null ? (
        <p className="mt-2 text-tiny text-mut">Vérification…</p>
      ) : manquants.length === 0 ? (
        <p className="mt-2 text-tiny leading-[1.6] text-mut">
          Tout y est. La fiche peut être publiée.
        </p>
      ) : (
        <div aria-live="polite" className="mt-2 space-y-2.5">
          {bloquants.length > 0 && (
            <div>
              <p className="flex items-start gap-2 text-tiny font-semibold text-erreur">
                <CircleAlert size={14} strokeWidth={2.2} aria-hidden="true" className="mt-px shrink-0" />
                {brouillon
                  ? "Il manque ceci pour pouvoir publier :"
                  : "Il manque ceci — l’enregistrement sera refusé :"}
              </p>
              <ul className="mt-1.5 ml-6 list-disc space-y-1 text-tiny leading-[1.6] text-mut marker:text-erreur">
                {bloquants.map((p) => (
                  <li key={p.cle}>
                    {p.libelle} <span className="text-mut/70">— {p.onglet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {remarques.length > 0 && (
            <div>
              <p className="text-tiny font-semibold text-ink">
                À vérifier — la fiche partira quand même :
              </p>
              <ul className="mt-1.5 ml-6 list-disc space-y-1 text-tiny leading-[1.6] text-mut">
                {remarques.map((p) => (
                  <li key={p.cle}>
                    {p.libelle} <span className="text-mut/70">— {p.onglet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
