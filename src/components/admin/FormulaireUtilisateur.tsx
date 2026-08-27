"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { sauverUtilisateur } from "@/app/actions/utilisateurs";
import { etatInitial } from "@/lib/etat-formulaire";
import { CarteAdmin } from "./primitives";
import { ChampAdmin, ListeAdmin, TexteAdmin } from "./ChampsAdmin";
import { libelleRole } from "@/lib/auth/roles";

const ROLES = [
  { valeur: "editeur", label: `${libelleRole.editeur} — animaux et livre d’or seulement` },
  { valeur: "admin", label: `${libelleRole.admin} — toutes les rubriques` },
  { valeur: "benevole", label: `${libelleRole.benevole} — lecture seule` },
];

/** Création d'un compte du back-office. */
export function FormulaireUtilisateur() {
  const [etat, action, enCours] = useActionState(sauverUtilisateur, etatInitial);
  const erreurs = etat.erreurs ?? {};

  return (
    <CarteAdmin className="p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-ink">Ajouter un compte</h2>
      <p className="mt-1 text-tiny leading-[1.6] text-mut">
        La personne se connectera sur /admin/connexion avec cette adresse et ce
        mot de passe. Communiquez-lui le mot de passe de vive voix, pas par e-mail.
      </p>

      {etat.statut === "succes" && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-[11px] border border-pri bg-succes px-4 py-3"
        >
          <CircleCheck size={17} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-white" />
          <p className="text-meta text-white">{etat.message}</p>
        </div>
      )}

      {etat.statut === "erreur" && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-[11px] border border-erreur bg-alerte px-4 py-3"
        >
          <CircleAlert size={17} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-white" />
          <p className="text-meta text-alerte-ink">{etat.message}</p>
        </div>
      )}

      <form action={action} className="mt-5 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <ChampAdmin id="nom" label="Nom et prénom" erreur={erreurs.nom}>
            <TexteAdmin id="nom" name="nom" required />
          </ChampAdmin>
          <ChampAdmin id="email" label="Adresse e-mail" erreur={erreurs.email}>
            <TexteAdmin id="email" name="email" type="email" autoComplete="off" required />
          </ChampAdmin>
        </div>

        <ChampAdmin
          id="motDePasse"
          label="Mot de passe"
          aide="Douze caractères minimum. Il n’est jamais stocké tel quel."
          erreur={erreurs.motDePasse}
        >
          <TexteAdmin id="motDePasse" name="motDePasse" type="password" autoComplete="new-password" required />
        </ChampAdmin>

        <ChampAdmin id="role" label="Ce que la personne pourra faire" erreur={erreurs.role}>
          <ListeAdmin id="role" name="role" defaultValue="editeur" options={ROLES} />
        </ChampAdmin>

        <button
          type="submit"
          disabled={enCours}
          className="inline-flex h-10 items-center rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark disabled:opacity-60"
        >
          {enCours ? "Création…" : "Créer le compte"}
        </button>
      </form>
    </CarteAdmin>
  );
}
