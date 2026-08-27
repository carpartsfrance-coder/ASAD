"use client";

import { useActionState, useState } from "react";
import { CircleAlert } from "lucide-react";
import { sauverCampagne } from "@/app/actions/editorial";
import { etatInitial } from "@/lib/etat-formulaire";
import { SmartLink } from "@/components/ui/SmartLink";
import { CarteAdmin } from "./primitives";
import { TeleverseurPhotos } from "./TeleverseurPhotos";
import {
  BarreActions,
  CaseAdmin,
  ChampAdmin,
  ListeAdmin,
  TexteAdmin,
  ZoneAdmin,
} from "./ChampsAdmin";
import { formatEuros, pourcentage } from "@/lib/format";
import { routes } from "@/content/site";
import type { Campagne } from "@/types";

export interface OptionAnimal {
  id: string;
  nom: string;
}

export function EditeurCampagne({
  campagne,
  animaux,
  animalId,
}: {
  campagne?: Campagne;
  animaux: OptionAnimal[];
  animalId?: string | null;
}) {
  const [etat, action, enCours] = useActionState(sauverCampagne, etatInitial);
  const [objectif, setObjectif] = useState(campagne?.objectif ?? 0);
  const [collecte, setCollecte] = useState(campagne?.collecte ?? 0);
  const erreurs = etat.erreurs ?? {};

  const part = pourcentage(collecte, objectif);

  return (
    <form action={action}>
      {campagne && <input type="hidden" name="id" value={campagne.id} />}

      {etat.statut === "erreur" && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-[11px] border border-erreur bg-alerte px-4 py-3.5"
        >
          <CircleAlert size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-white" />
          <p className="text-meta text-alerte-ink">{etat.message}</p>
        </div>
      )}

      <CarteAdmin className="space-y-5 p-5 sm:p-6">
        <ChampAdmin id="titre" label="Titre de la collecte" aide="« L’opération de Rio »" erreur={erreurs.titre}>
          <TexteAdmin id="titre" name="titre" defaultValue={campagne?.titre} required />
        </ChampAdmin>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChampAdmin id="animalId" label="Animal concerné" aide="Facultatif — relie la collecte à sa fiche.">
            <ListeAdmin
              id="animalId"
              name="animalId"
              defaultValue={animalId ?? ""}
              options={[{ valeur: "", label: "Aucun animal en particulier" }, ...animaux.map((a) => ({ valeur: a.id, label: a.nom }))]}
            />
          </ChampAdmin>
          <ChampAdmin id="type" label="Type de prise en charge" aide="« Chirurgie orthopédique », « Sortie de fourrière »">
            <TexteAdmin id="type" name="type" defaultValue={campagne?.type} />
          </ChampAdmin>
        </div>

        <ChampAdmin id="description" label="Pourquoi cette collecte" aide="Ce que le don finance, en quelques phrases.">
          <ZoneAdmin id="description" name="description" rows={4} defaultValue={campagne?.description} />
        </ChampAdmin>

        {/* Montants — toujours le montant réel, jamais une estimation */}
        <div className="rounded-media border border-line bg-subtil p-4">
          <p className="text-meta font-semibold text-ink">La collecte</p>
          <p className="mt-1 text-tiny leading-[1.6] text-mut">
            Saisissez le montant réellement reçu. La barre affichée sur le site en
            découle directement.
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <ChampAdmin id="objectif" label="Objectif, en euros" erreur={erreurs.objectif}>
              <TexteAdmin
                id="objectif"
                name="objectif"
                type="number"
                min={0}
                value={objectif}
                onChange={(e) => setObjectif(Number(e.target.value))}
              />
            </ChampAdmin>
            <ChampAdmin id="collecte" label="Déjà collecté, en euros" erreur={erreurs.collecte}>
              <TexteAdmin
                id="collecte"
                name="collecte"
                type="number"
                min={0}
                value={collecte}
                onChange={(e) => setCollecte(Number(e.target.value))}
              />
            </ChampAdmin>
          </div>

          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-acc" style={{ width: `${part}%` }} />
            </div>
            <p className="mt-2 text-tiny text-mut">
              {formatEuros(collecte)} sur {formatEuros(objectif)} — {part} %
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChampAdmin id="echeance" label="Échéance affichée" aide="« Opération sous 15 jours »">
            <TexteAdmin id="echeance" name="echeance" defaultValue={campagne?.echeance} />
          </ChampAdmin>
          <ChampAdmin id="dateLimite" label="Date limite" aide="Facultatif.">
            <TexteAdmin id="dateLimite" name="dateLimite" type="date" defaultValue={campagne?.dateLimite} />
          </ChampAdmin>

          <ChampAdmin id="ctaLabel" label="Texte du bouton" aide="« Aider Rio »">
            <TexteAdmin id="ctaLabel" name="ctaLabel" defaultValue={campagne?.ctaLabel ?? "Participer"} />
          </ChampAdmin>
          <ChampAdmin id="lienHelloAsso" label="Lien HelloAsso" aide="Laissez vide pour utiliser le lien d’urgence général.">
            <TexteAdmin id="lienHelloAsso" name="lienHelloAsso" defaultValue={campagne?.lienHelloAsso} />
          </ChampAdmin>
        </div>

        <div>
          <p className="text-meta font-semibold text-ink">Photo de la collecte</p>
          <div className="mt-2">
            <TeleverseurPhotos
              photosInitiales={campagne?.photo.src ? [campagne.photo] : []}
              nomChampUrls="photoUrl"
              nomChampAlts="photoAlt"
              legende="Glissez la photo ici"
            />
          </div>
        </div>

        <ChampAdmin
          id="misesAJour"
          label="Nouvelles de la collecte"
          aide="Une par ligne, sous la forme : 2026-08-20 | Bilan pré-opératoire réalisé."
        >
          <ZoneAdmin
            id="misesAJour"
            name="misesAJour"
            rows={4}
            defaultValue={campagne?.misesAJour.map((m) => `${m.date} | ${m.texte}`).join("\n")}
          />
        </ChampAdmin>

        <div className="space-y-5 border-t border-line pt-5">
          <ChampAdmin id="statut" label="État de la collecte">
            <ListeAdmin
              id="statut"
              name="statut"
              defaultValue={campagne?.statut ?? "active"}
              options={[
                { valeur: "active", label: "En cours — visible avec son bouton de don" },
                { valeur: "terminee", label: "Terminée — objectif atteint, bouton remplacé" },
              ]}
            />
          </ChampAdmin>

          <ChampAdmin id="remerciement" label="Remerciement" aide="Affiché quand la collecte est terminée.">
            <TexteAdmin id="remerciement" name="remerciement" defaultValue={campagne?.remerciement} />
          </ChampAdmin>

          <CaseAdmin
            id="afficherSurAccueil"
            label="Mettre en avant sur la page d’accueil"
            defaultChecked={campagne?.afficherSurAccueil}
          />
        </div>
      </CarteAdmin>

      <BarreActions
        enCours={enCours}
        libelle={campagne ? "Enregistrer" : "Lancer la collecte"}
        retour={
          <SmartLink
            href={routes.adminUrgences}
            className="text-meta font-semibold text-mut transition-colors duration-150 hover:text-pri"
          >
            Retour à la liste
          </SmartLink>
        }
      />
    </form>
  );
}
