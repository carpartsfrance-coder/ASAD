import Image from "next/image";
import { Check, CircleAlert, Clock, Stethoscope } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";
import { PhotoAgrandissable } from "@/components/ui/PhotoAgrandissable";
import { helloAsso } from "@/content/site";
import { formatEuros, pourcentage } from "@/lib/format";
import { sousTitreAnimal } from "@/lib/animaux";
import { cn } from "@/lib/cn";
import type { Animal, Campagne } from "@/types";

/**
 * Carte d'une campagne d'urgence.
 *
 * Deux états : en cours (badge « URGENT », bouton de don) et terminée
 * (badge « TERMINÉE », image en retrait, bloc « Objectif atteint »).
 */
export function CampagneCard({
  campagne,
  animal,
  className,
}: {
  campagne: Campagne;
  /** Animal lié, résolu par la page — évite une requête par carte. */
  animal?: Animal;
  className?: string;
}) {
  const terminee = campagne.statut === "terminee";
  const part = pourcentage(campagne.collecte, campagne.objectif);
  const lienDon = campagne.lienHelloAsso ?? helloAsso.urgence;
  const nom = animal?.nom ?? campagne.titre.replace(/^L’opération de /, "");

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-urgent bg-white shadow-card",
        className,
      )}
    >
      <div className="relative h-[200px] shrink-0 bg-soft">
        <PhotoAgrandissable
          photo={campagne.photo}
          libelle={`la photo de ${nom}`}
          indice="loupe"
          className="absolute inset-0"
        >
          <Image
            src={campagne.photo.src}
            alt={campagne.photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className={cn("object-cover", terminee && "opacity-60")}
          />
        </PhotoAgrandissable>
        <span
          className={cn(
            "pointer-events-none absolute top-3.5 left-3.5 inline-flex items-center gap-[7px] rounded-full px-3 py-1.5 text-micro font-bold tracking-[0.05em] text-white uppercase",
            terminee ? "bg-track" : "bg-acc",
          )}
        >
          {terminee ? (
            <Check size={13} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <CircleAlert size={13} strokeWidth={2.2} aria-hidden="true" />
          )}
          {terminee ? "Terminée" : "Urgent"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-card font-bold text-ink">
          {nom}
          {animal && (
            <span className="text-body font-normal text-mut">
              {" "}
              — {sousTitreAnimal(animal)}
            </span>
          )}
        </h3>

        <p className="mt-2.5 text-body leading-[1.62] text-mut">
          {campagne.description}
        </p>

        <ul className="mt-4 space-y-2 text-mini font-semibold text-pri">
          <li className="flex items-center gap-2">
            <Stethoscope size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
            {campagne.type}
          </li>
          <li className="flex items-center gap-2">
            <Clock size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
            {campagne.echeance}
          </li>
        </ul>

        {/* Bloc de collecte — montant réel, jamais estimé */}
        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[18px] font-extrabold text-ink">
              {formatEuros(campagne.collecte)}
            </span>
            <span className="text-mini text-mut">
              sur {formatEuros(campagne.objectif)}
            </span>
          </div>

          <div
            className="mt-2.5 h-2 overflow-hidden rounded-full bg-soft"
            role="progressbar"
            aria-valuenow={part}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Collecte pour ${nom} : ${part} % de ${formatEuros(campagne.objectif)}`}
          >
            <div
              className={cn("h-full rounded-full", terminee ? "bg-track" : "bg-acc")}
              style={{ width: `${part}%` }}
            />
          </div>
          <p className="mt-1.5 text-tiny text-mut">{part} % de l’objectif</p>

          {terminee ? (
            <>
              <p className="mt-4 flex items-center justify-center gap-2 rounded-[9px] bg-soft px-4 py-3 text-body font-semibold text-pri">
                <Check size={17} strokeWidth={2.3} aria-hidden="true" />
                Objectif atteint
              </p>
              {campagne.remerciement && (
                <p className="mt-2.5 text-tiny leading-[1.6] text-mut">
                  {campagne.remerciement}
                </p>
              )}
            </>
          ) : (
            <SmartLink
              href={lienDon}
              externe
              className="mt-4 flex h-12 w-full items-center justify-center rounded-[9px] bg-acc text-body font-bold text-white transition-colors duration-150 hover:bg-acc-dark"
            >
              {campagne.ctaLabel}
            </SmartLink>
          )}
        </div>
      </div>
    </article>
  );
}
