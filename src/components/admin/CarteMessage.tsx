import { Archive, Ban, Check, RotateCcw, X } from "lucide-react";
import {
  changerStatutMessage,
  repondreAuMessage,
  supprimerDefinitivement,
} from "@/app/actions/livre-or";
import { BoutonSuppression } from "./BoutonSuppression";
import { CarteAdmin, PiluleStatut, type TonStatut } from "./primitives";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { MessageLivreOr, StatutMessageLivreOr } from "@/types";

const LIBELLE: Record<StatutMessageLivreOr, string> = {
  en_attente: "À relire",
  publie: "Publié",
  refuse: "Refusé",
  indesirable: "Indésirable",
  archive: "Archivé",
};

const TON: Record<StatutMessageLivreOr, TonStatut> = {
  en_attente: "attente",
  publie: "succes",
  refuse: "alerte",
  indesirable: "alerte",
  archive: "neutre",
};

/** Bouton d'action de modération, dans son propre formulaire. */
function Action({
  id,
  statut,
  children,
  ton = "neutre",
}: {
  id: string;
  statut: StatutMessageLivreOr;
  children: React.ReactNode;
  ton?: "valider" | "refuser" | "neutre";
}) {
  return (
    <form action={changerStatutMessage}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="statut" value={statut} />
      <button
        type="submit"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-btn px-3.5 text-meta font-semibold transition-colors duration-150",
          ton === "valider" && "bg-acc text-white hover:bg-acc-dark",
          ton === "refuser" &&
            "border-[1.4px] border-erreur/40 bg-white text-erreur hover:bg-alerte",
          ton === "neutre" &&
            "border-[1.4px] border-line bg-white text-pri hover:border-pri",
        )}
      >
        {children}
      </button>
    </form>
  );
}

/** Une carte par message, avec les décisions possibles selon son état. */
export function CarteMessage({ message }: { message: MessageLivreOr }) {
  const { statut } = message;

  return (
    <CarteAdmin className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body font-bold text-ink">{message.nomPublic}</p>
          <p className="text-tiny text-mut">
            {message.ville && <>{message.ville} · </>}
            <time dateTime={message.date}>{formatDate(message.date)}</time>
            {message.animalNom && <> · à propos de {message.animalNom}</>}
          </p>
        </div>
        <PiluleStatut ton={TON[statut]}>{LIBELLE[statut]}</PiluleStatut>
      </div>

      <blockquote className="mt-4 border-l-2 border-line pl-4 text-body leading-[1.7] text-mut">
        <p>{message.message}</p>
      </blockquote>

      {message.reponsePublique && (
        <p className="mt-3 rounded-[10px] bg-soft p-3.5 text-meta leading-[1.6] text-pri">
          <strong className="font-semibold">Votre réponse :</strong>{" "}
          {message.reponsePublique}
        </p>
      )}

      {/* Réponse publique, facultative */}
      {statut !== "indesirable" && (
        <form action={repondreAuMessage} className="mt-4">
          <input type="hidden" name="id" value={message.id} />
          <label
            htmlFor={`reponse-${message.id}`}
            className="block text-meta font-semibold text-ink"
          >
            Répondre publiquement
          </label>
          <p className="mt-1 text-tiny text-mut">
            Facultatif. Votre réponse s’affiche sous le message sur le site.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id={`reponse-${message.id}`}
              name="reponse"
              defaultValue={message.reponsePublique ?? ""}
              placeholder="Merci pour ces nouvelles…"
              className="h-10 min-w-0 flex-1 rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta text-ink transition-colors duration-150 placeholder:text-mut/60 focus:border-acc focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Décisions */}
      <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line pt-4">
        {statut !== "publie" && (
          <Action id={message.id} statut="publie" ton="valider">
            <Check size={16} strokeWidth={2.2} aria-hidden="true" />
            Publier sur le site
          </Action>
        )}

        {statut === "publie" && (
          <Action id={message.id} statut="en_attente">
            <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
            Retirer du site
          </Action>
        )}

        {statut !== "refuse" && statut !== "indesirable" && (
          <Action id={message.id} statut="refuse" ton="refuser">
            <X size={16} strokeWidth={2.2} aria-hidden="true" />
            Ne pas publier
          </Action>
        )}

        {statut !== "indesirable" && (
          <Action id={message.id} statut="indesirable" ton="refuser">
            <Ban size={16} strokeWidth={1.9} aria-hidden="true" />
            Indésirable
          </Action>
        )}

        {statut !== "archive" && statut !== "indesirable" && (
          <Action id={message.id} statut="archive">
            <Archive size={16} strokeWidth={1.9} aria-hidden="true" />
            Archiver
          </Action>
        )}

        {statut === "indesirable" && (
          <>
            <Action id={message.id} statut="en_attente">
              <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
              Ce n’était pas du spam
            </Action>
            <form action={supprimerDefinitivement}>
              <input type="hidden" name="id" value={message.id} />
              <BoutonSuppression question="Supprimer ce message ? C’est irréversible." />
            </form>
          </>
        )}
      </div>
    </CarteAdmin>
  );
}
