"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, MailCheck, TriangleAlert } from "lucide-react";
import {
  demanderReinitialisation,
  seConnecter,
} from "@/app/actions/authentification";
import { etatInitial } from "@/lib/etat-formulaire";
import { cn } from "@/lib/cn";
import { association } from "@/content/site";

type Ecran = "connexion" | "oubli" | "envoye" | "expiree";

const CHAMP =
  "h-[46px] w-full rounded-btn border-[1.4px] bg-white px-4 text-meta text-ink " +
  "transition-colors duration-150 placeholder:text-mut/70 focus:outline-none";

function classesChamp(erreur?: boolean) {
  return cn(
    CHAMP,
    erreur ? "border-erreur bg-erreur-fond focus:border-erreur" : "border-line focus:border-acc",
  );
}

function Libelle({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-mini font-semibold text-ink">
      {children}
    </label>
  );
}

function Bandeau({
  ton,
  children,
}: {
  ton: "alerte" | "attente";
  children: React.ReactNode;
}) {
  const alerte = ton === "alerte";
  const Icone = alerte ? CircleAlert : TriangleAlert;

  return (
    <div
      role={alerte ? "alert" : "status"}
      className={cn(
        "mt-5 flex items-start gap-3 rounded-[11px] border px-4 py-3.5",
        alerte ? "border-erreur bg-alerte" : "border-attente-ink/25 bg-attente",
      )}
    >
      <Icone
        size={18}
        strokeWidth={2}
        aria-hidden="true"
        className={cn("mt-px shrink-0", alerte ? "text-erreur" : "text-attente-ink")}
      />
      <p
        className={cn(
          "text-meta leading-[1.6]",
          alerte ? "text-alerte-ink" : "text-attente-ink",
        )}
      >
        {children}
      </p>
    </div>
  );
}

/**
 * Formulaire de connexion au back-office — cinq états.
 *
 * La vérification des identifiants se fait entièrement côté serveur
 * (`seConnecter`) : le navigateur ne voit jamais d'empreinte ni de règle.
 */
export function FormulaireConnexion({
  sessionExpiree,
  suite,
}: {
  sessionExpiree?: boolean;
  /** Destination d'origine, restaurée après connexion. */
  suite?: string;
}) {
  const [ecran, setEcran] = useState<Ecran>(sessionExpiree ? "expiree" : "connexion");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [emailSaisi, setEmailSaisi] = useState("");

  const [etatConnexion, actionConnexion, connexionEnCours] = useActionState(
    seConnecter,
    etatInitial,
  );
  const [etatOubli, actionOubli, oubliEnCours] = useActionState(
    demanderReinitialisation,
    etatInitial,
  );

  /* ---------------- Lien envoyé ---------------- */
  if (ecran === "envoye" || etatOubli.statut === "succes") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-[74px] items-center justify-center rounded-full bg-soft">
          <MailCheck size={32} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
        </span>
        <h1 className="mt-5 text-title font-extrabold text-ink">Lien envoyé</h1>
        <p className="mt-3 text-body leading-[1.7] text-mut">
          Si un compte existe pour{" "}
          <strong className="font-bold text-ink">{emailSaisi}</strong>, vous recevrez
          un lien de réinitialisation d’ici quelques minutes.
        </p>
        <p className="mt-3 text-meta leading-[1.65] text-mut">
          Pensez à vérifier vos courriers indésirables.
        </p>
        <button
          type="button"
          onClick={() => setEcran("connexion")}
          className="mt-6 h-12 w-full rounded-btn bg-acc text-nav font-bold text-white transition-colors duration-150 hover:bg-acc-dark"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  /* ---------------- Mot de passe oublié ---------------- */
  if (ecran === "oubli") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEcran("connexion")}
          className="link-underline text-meta font-semibold text-acc transition-colors duration-150 hover:text-acc-dark"
        >
          ← Retour à la connexion
        </button>

        <h1 className="mt-5 text-[26px] font-extrabold text-ink">Mot de passe oublié</h1>
        <p className="mt-2 text-body leading-[1.7] text-mut">
          Indiquez votre adresse e-mail : nous vous envoyons un lien pour choisir un
          nouveau mot de passe.
        </p>

        <form action={actionOubli} className="mt-6" noValidate>
          <Libelle htmlFor="email-oubli">Adresse e-mail</Libelle>
          <input
            id="email-oubli"
            name="email"
            type="email"
            value={emailSaisi}
            onChange={(e) => setEmailSaisi(e.target.value)}
            autoComplete="email"
            aria-invalid={etatOubli.erreurs?.email ? true : undefined}
            className={classesChamp(!!etatOubli.erreurs?.email)}
          />
          {etatOubli.erreurs?.email && (
            <p role="alert" className="mt-1.5 text-tiny font-semibold text-erreur">
              {etatOubli.erreurs.email}
            </p>
          )}

          <button
            type="submit"
            disabled={oubliEnCours}
            className="mt-5 h-12 w-full rounded-btn bg-acc text-nav font-bold text-white transition-colors duration-150 hover:bg-acc-dark disabled:opacity-70"
          >
            {oubliEnCours ? "Envoi en cours…" : "Envoyer le lien"}
          </button>
        </form>
      </div>
    );
  }

  /* ---------------- Connexion et session expirée ---------------- */
  const expiree = ecran === "expiree";

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-ink">
        {expiree ? "Session expirée" : "Accès à l’administration"}
      </h1>
      <p className="mt-2 text-body leading-[1.7] text-mut">
        {expiree
          ? "Reconnectez-vous pour reprendre là où vous en étiez."
          : "Espace réservé aux bénévoles habilités de l’association."}
      </p>

      {expiree && (
        <Bandeau ton="attente">
          Vous avez été déconnecté après deux heures d’inactivité. Votre travail en
          cours a été enregistré en brouillon.
        </Bandeau>
      )}

      {etatConnexion.statut === "erreur" && etatConnexion.message && (
        <Bandeau ton="alerte">{etatConnexion.message}</Bandeau>
      )}

      <form action={actionConnexion} className="mt-6" noValidate>
        {suite && <input type="hidden" name="suite" value={suite} />}

        <div className="mb-4">
          <Libelle htmlFor="email-admin">Adresse e-mail</Libelle>
          <input
            id="email-admin"
            name="email"
            type="email"
            defaultValue={emailSaisi}
            onChange={(e) => setEmailSaisi(e.target.value)}
            autoComplete="username"
            required
            aria-invalid={etatConnexion.erreurs?.email ? true : undefined}
            className={classesChamp(!!etatConnexion.erreurs?.email)}
          />
          {etatConnexion.erreurs?.email && (
            <p role="alert" className="mt-1.5 text-tiny font-semibold text-erreur">
              {etatConnexion.erreurs.email}
            </p>
          )}
        </div>

        <div>
          <Libelle htmlFor="mdp-admin">Mot de passe</Libelle>
          <div className="relative">
            <input
              id="mdp-admin"
              name="motDePasse"
              type={motDePasseVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={etatConnexion.erreurs?.motDePasse ? true : undefined}
              className={cn(classesChamp(!!etatConnexion.erreurs?.motDePasse), "pr-12")}
            />
            <button
              type="button"
              onClick={() => setMotDePasseVisible((v) => !v)}
              aria-pressed={motDePasseVisible}
              className="absolute top-0 right-0 flex h-[46px] w-11 items-center justify-center rounded-r-btn text-mut transition-colors duration-150 hover:text-pri"
            >
              {motDePasseVisible ? (
                <EyeOff size={18} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
              )}
              <span className="sr-only">
                {motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              </span>
            </button>
          </div>
          {etatConnexion.erreurs?.motDePasse && (
            <p role="alert" className="mt-1.5 text-tiny font-semibold text-erreur">
              {etatConnexion.erreurs.motDePasse}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 text-meta text-mut">
            <input
              type="checkbox"
              name="persistante"
              className="size-[18px] rounded border-line accent-[var(--color-acc)]"
            />
            Rester connecté
          </label>

          <button
            type="button"
            onClick={() => setEcran("oubli")}
            className="link-underline text-meta font-semibold text-acc transition-colors duration-150 hover:text-acc-dark"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          disabled={connexionEnCours}
          className="mt-6 h-12 w-full rounded-btn bg-acc text-nav font-bold text-white transition-colors duration-150 hover:bg-acc-dark disabled:opacity-70"
        >
          {connexionEnCours
            ? "Connexion en cours…"
            : expiree
              ? "Déverrouiller la session"
              : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-meta leading-[1.65] text-mut">
        Pas encore de compte ? Demandez une invitation à un administrateur, ou
        écrivez à{" "}
        <a
          href={`mailto:${association.email}`}
          className="link-underline font-semibold text-acc hover:text-acc-dark"
        >
          {association.email}
        </a>
        .
      </p>
    </div>
  );
}
