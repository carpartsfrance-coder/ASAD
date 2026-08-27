"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { sauverContenu } from "@/app/actions/contenu";
import { etatInitial } from "@/lib/etat-formulaire";
import { CarteAdmin } from "./primitives";
import { ChampAdmin, TexteAdmin, ZoneAdmin } from "./ChampsAdmin";

export interface EntreeContenu {
  cle: string;
  libelle: string;
  rubrique: string;
  valeur: unknown;
}

/** Édition des textes du site : une ligne par réglage. */
export function FormulaireContenu({
  entrees,
  rubriques,
}: {
  entrees: EntreeContenu[];
  /** Titre lisible de chaque rubrique, dans l'ordre d'affichage. */
  rubriques: Array<{ cle: string; titre: string; description?: string }>;
}) {
  const [etat, action, enCours] = useActionState(sauverContenu, etatInitial);

  return (
    <form action={action} className="space-y-6">
      {etat.statut !== "attente" && (
        <div
          role={etat.statut === "succes" ? "status" : "alert"}
          className={
            etat.statut === "succes"
              ? "flex items-start gap-3 rounded-[11px] border border-pri bg-succes px-4 py-3"
              : "flex items-start gap-3 rounded-[11px] border border-erreur bg-alerte px-4 py-3"
          }
        >
          {etat.statut === "succes" ? (
            <CircleCheck size={17} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-white" />
          ) : (
            <CircleAlert size={17} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-erreur" />
          )}
          <p className={etat.statut === "succes" ? "text-meta text-white" : "text-meta text-alerte-ink"}>
            {etat.message}
          </p>
        </div>
      )}

      {rubriques.map((rubrique) => {
        const lignes = entrees.filter((e) => e.rubrique === rubrique.cle);
        if (lignes.length === 0) return null;

        return (
          <CarteAdmin key={rubrique.cle} className="p-5 sm:p-6">
            <h2 className="text-[16px] font-bold text-ink">{rubrique.titre}</h2>
            {rubrique.description && (
              <p className="mt-1 text-tiny leading-[1.6] text-mut">{rubrique.description}</p>
            )}

            <div className="mt-5 space-y-5">
              {lignes.map((entree) => {
                const estTexte = typeof entree.valeur === "string";
                const valeur = estTexte
                  ? (entree.valeur as string)
                  : JSON.stringify(entree.valeur, null, 2);
                const longue = estTexte && valeur.length > 90;

                return (
                  <ChampAdmin
                    key={entree.cle}
                    id={entree.cle}
                    label={entree.libelle}
                    aide={estTexte ? undefined : "Format technique — modifiez avec précaution."}
                    erreur={etat.erreurs?.[entree.cle]}
                  >
                    {longue || !estTexte ? (
                      <ZoneAdmin
                        id={entree.cle}
                        name={entree.cle}
                        rows={estTexte ? 3 : 6}
                        defaultValue={valeur}
                        className={estTexte ? undefined : "font-mono text-tiny"}
                      />
                    ) : (
                      <TexteAdmin id={entree.cle} name={entree.cle} defaultValue={valeur} />
                    )}
                  </ChampAdmin>
                );
              })}
            </div>
          </CarteAdmin>
        );
      })}

      <div className="sticky bottom-0 rounded-media border border-line bg-white/95 p-4 backdrop-blur">
        <button
          type="submit"
          disabled={enCours}
          className="inline-flex h-10 items-center rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark disabled:opacity-60"
        >
          {enCours ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
