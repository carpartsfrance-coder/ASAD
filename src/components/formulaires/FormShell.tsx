"use client";

import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck } from "lucide-react";
import type { EtatFormulaire } from "@/lib/etat-formulaire";

/**
 * Piège à robots.
 *
 * Un champ que personne ne voit : un humain ne peut pas le remplir, un
 * automate le remplit toujours. Il est masqué visuellement mais retiré aussi
 * du parcours au clavier et de la lecture d'écran, pour ne gêner personne.
 */
export function AntiSpam() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="site">Ne remplissez pas ce champ</label>
      <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

/** Deux colonnes sur écran large, une seule sur téléphone. */
export function GrilleChamps({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/** Bouton d'envoi, qui se verrouille pendant la transmission. */
export function BoutonEnvoi({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[52px] items-center justify-center rounded-btn bg-acc px-7 text-lead font-semibold text-white transition-colors duration-150 hover:bg-acc-dark disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "Envoi en cours…" : children}
    </button>
  );
}

/** Bandeau d'erreur, annoncé aux lecteurs d'écran. */
export function MessageEtat({ etat }: { etat: EtatFormulaire }) {
  if (etat.statut !== "erreur") return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-erreur bg-erreur-bandeau px-4 py-3.5"
    >
      <CircleAlert size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-erreur" />
      <p className="text-meta font-semibold text-erreur">
        {etat.message ?? "Certaines informations sont manquantes ou incorrectes."}
      </p>
    </div>
  );
}

/** Ce qui remplace le formulaire une fois le message parti. */
export function PanneauSucces({ titre, message }: { titre: string; message?: string }) {
  return (
    <div
      role="status"
      className="rounded-panel bg-white p-7 shadow-card sm:p-9"
    >
      <CircleCheck size={30} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
      <h3 className="mt-4 text-title font-extrabold text-ink">{titre}</h3>
      {message && <p className="mt-3 max-w-[520px] text-body leading-[1.72] text-mut">{message}</p>}
    </div>
  );
}
