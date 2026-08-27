"use client";

import { useActionState } from "react";
import { envoyerMessageLivreOr } from "@/app/actions/livre-or-public";
import { etatInitial } from "@/lib/etat-formulaire";
import { ChampCase, ChampTexte, ChampZone } from "@/components/ui/Champ";
import { MentionsRgpd } from "@/components/ui/MentionsRgpd";
import { mentionLivreOr } from "@/content/rgpd";
import {
  AntiSpam,
  BoutonEnvoi,
  GrilleChamps,
  MessageEtat,
  PanneauSucces,
} from "./FormShell";

/**
 * Le seul formulaire public du site.
 *
 * Il ne publie rien : le message part en file d'attente et un bénévole décide
 * dans le back-office. Partout ailleurs, on joint l'association par e-mail ou
 * par téléphone.
 */
export function FormulaireLivreOr() {
  const [etat, action] = useActionState(envoyerMessageLivreOr, etatInitial);

  if (etat.statut === "succes") {
    return <PanneauSucces titre="Merci pour votre message" message={etat.message} />;
  }

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <AntiSpam />

      {etat.statut === "erreur" && <MessageEtat etat={etat} />}

      <GrilleChamps>
        <ChampTexte
          id="nomPublic"
          label="Nom affiché"
          requis
          aide="C’est ce nom qui apparaîtra publiquement. « Famille Martin » convient très bien."
          erreur={etat.erreurs?.nomPublic}
        />
        <ChampTexte
          id="email"
          label="Adresse e-mail"
          type="email"
          requis
          autoComplete="email"
          aide="Jamais publiée. Elle nous sert uniquement à vous répondre."
          erreur={etat.erreurs?.email}
        />
        <ChampTexte id="ville" label="Ville" aide="Facultatif." erreur={etat.erreurs?.ville} />
        <ChampTexte
          id="animal"
          label="Animal concerné"
          aide="Facultatif — le nom de l’animal que vous avez adopté ou accueilli."
          erreur={etat.erreurs?.animal}
        />
      </GrilleChamps>

      <ChampZone
        id="message"
        label="Votre message"
        requis
        rows={6}
        aide="Racontez-nous ce que devient votre compagnon. Trente caractères minimum."
        erreur={etat.erreurs?.message}
      />

      <div>
        <ChampCase id="consentement" requis>
          J’accepte que mon message, mon nom affiché et ma ville soient publiés
          dans le livre d’or après relecture par l’association.
        </ChampCase>
        {etat.erreurs?.consentement && (
          <p role="alert" className="mt-2 text-tiny font-semibold text-erreur">
            {etat.erreurs.consentement}
          </p>
        )}
      </div>

      <BoutonEnvoi>Envoyer mon message</BoutonEnvoi>

      <MentionsRgpd mention={mentionLivreOr} />
    </form>
  );
}
