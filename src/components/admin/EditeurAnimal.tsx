"use client";

import { useActionState, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, Eye, Save } from "lucide-react";
import { enregistrerFiche, supprimerFiche } from "@/app/actions/animaux";
import { BoutonSuppression } from "./BoutonSuppression";
import { etatInitial } from "@/lib/etat-formulaire";
import { SmartLink } from "@/components/ui/SmartLink";
import { CarteAdmin } from "./primitives";
import { TeleverseurPhotos } from "./TeleverseurPhotos";
import { BoutonReformuler } from "./BoutonReformuler";
import { ControlePublication } from "./ControlePublication";
import { cn } from "@/lib/cn";
import { routes } from "@/content/site";
import type { Animal } from "@/types";

/* ------------------------------------------------------------------ */
/* Briques de formulaire                                               */
/* ------------------------------------------------------------------ */

const CONTROLE =
  "w-full rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta text-ink " +
  "transition-colors duration-150 placeholder:text-mut/60 focus:border-acc focus:outline-none";

function Champ({
  id,
  label,
  aide,
  erreur,
  manquant,
  children,
  className,
}: {
  id: string;
  label: string;
  aide?: string;
  erreur?: string;
  /**
   * Champ nécessaire, encore vide. Signalé visuellement pour qu'on le repère
   * sans avoir à lire toute la page — « À remplir », pas « erreur » : rien
   * n'est encore raté, il reste à faire.
   */
  manquant?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bloc-focus",
        manquant &&
          "-ml-3 rounded-r-media border-l-[3px] border-l-acc bg-erreur-fond py-2.5 pr-3 pl-3",
        className,
      )}
    >
      <label
        htmlFor={id}
        className="flex flex-wrap items-center gap-2 text-meta font-semibold text-ink"
      >
        {label}
        {manquant && (
          <span className="rounded-full bg-acc px-2 py-0.5 text-[10.5px] font-bold tracking-[0.04em] uppercase text-white">
            À remplir
          </span>
        )}
      </label>
      {aide && <p className="mt-1 text-tiny leading-[1.5] text-mut">{aide}</p>}
      <div className="mt-2">{children}</div>
      {erreur && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-tiny font-semibold text-erreur">
          <CircleAlert size={13} strokeWidth={2.2} aria-hidden="true" />
          {erreur}
        </p>
      )}
    </div>
  );
}

function Texte(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROLE, "h-11", props.className)} />;
}

function Zone(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROLE, "resize-y py-2.5", props.className)} />;
}

function Liste({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ valeur: string; label: string }>;
}) {
  return (
    <select {...props} className={cn(CONTROLE, "h-11 cursor-pointer")}>
      {options.map((o) => (
        <option key={o.valeur} value={o.valeur}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Case({
  id,
  label,
  defaultChecked,
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-meta text-ink">
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-[18px] shrink-0 rounded border-line accent-[var(--color-acc)]"
      />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Onglets                                                             */
/* ------------------------------------------------------------------ */

/**
 * Les étapes du complément — tout ce qui n'est pas nécessaire pour publier.
 *
 * L'écran d'entrée, lui, n'est pas dans cette liste : c'est « l'essentiel »,
 * les sept champs qui suffisent à mettre un animal en ligne.
 */
const ONGLETS = [
  {
    cle: "identite",
    label: "Détails",
    titre: "Quelques précisions",
    phrase: "Sa race, sa taille, son poids, où il est hébergé.",
  },
  {
    cle: "presentation",
    label: "Caractère",
    titre: "Comment est-il ?",
    phrase: "Quelques mots qui le décrivent, affichés en pastilles sur sa fiche.",
  },
  {
    cle: "compatibilites",
    label: "Compatibilités",
    titre: "Avec qui peut-il vivre ?",
    phrase: "Ce qu'il supporte : les autres chiens, les chats, les enfants.",
  },
  {
    cle: "sante",
    label: "Santé",
    titre: "Où en est sa santé ?",
    phrase: "Vacciné, identifié, stérilisé, et les soins en cours s'il y en a.",
  },
  {
    cle: "adoption",
    label: "Adoption",
    titre: "À quelles conditions ?",
    phrase: "Les frais demandés et ce que vous attendez de la future famille.",
  },
  {
    cle: "publication",
    label: "Réglages",
    titre: "Réglages de la fiche",
    phrase: "Urgence, réservation, adresse de la page — à ne toucher qu'au besoin.",
  },
] as const;

type CleOnglet = (typeof ONGLETS)[number]["cle"];
/** « essentiel » est l'écran d'entrée, pas une étape du complément. */
type Vue = CleOnglet | "essentiel";

const OPTIONS_COMPAT = [
  { valeur: "oui", label: "Oui" },
  { valeur: "non", label: "Non" },
  { valeur: "a_tester", label: "À tester" },
  { valeur: "avec_conditions", label: "Avec conditions" },
];

const OPTIONS_STATUT = [
  { valeur: "brouillon", label: "Brouillon — invisible sur le site" },
  { valeur: "a_adopter", label: "À adopter — visible, adoption ouverte" },
  { valeur: "urgent", label: "Urgent — visible, mis en avant" },
  { valeur: "reserve", label: "Réservé — visible, adoption suspendue" },
  { valeur: "adopte", label: "Adopté — la fiche reste en ligne avec son histoire" },
];

/* ------------------------------------------------------------------ */
/* Éditeur                                                             */
/* ------------------------------------------------------------------ */

export function EditeurAnimal({
  fiche,
  assistantDisponible = false,
}: {
  fiche?: Animal;
  /** L'assistant de rédaction n'apparaît que si une clé OpenAI est configurée. */
  assistantDisponible?: boolean;
}) {
  const [onglet, setOnglet] = useState<Vue>("essentiel");
  const [statut, setStatut] = useState(fiche?.statut ?? "brouillon");
  const [etat, action, enCours] = useActionState(enregistrerFiche, etatInitial);

  const erreurs = etat.erreurs ?? {};
  const nouvelle = !fiche;

  /** Une étape reste montée mais masquée : la saisie n'est jamais perdue. */
  const panneau = (cle: Vue) =>
    cn("space-y-5", onglet === cle ? "block" : "hidden");

  /**
   * Champs nécessaires encore vides, relus à chaque frappe.
   * `nom`, `age` et `commune` sont exigés dès l'enregistrement ; la
   * description et la photo le sont pour publier.
   */
  const [manquants, setManquants] = useState<string[]>([]);

  useEffect(() => {
    const form = document.getElementById("parcours-fiche")?.closest("form");
    if (!form) return;

    const relire = () => {
      const vide = (nom: string) => {
        const el = form.elements.namedItem(nom);
        return el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement
          ? el.value.trim() === ""
          : false;
      };
      setManquants(
        ["nom", "age", "commune", "descriptionCourte"].filter(vide),
      );
    };

    relire();
    form.addEventListener("input", relire);
    form.addEventListener("change", relire);
    return () => {
      form.removeEventListener("input", relire);
      form.removeEventListener("change", relire);
    };
  }, []);

  const aRemplir = (nom: string) => manquants.includes(nom);

  const surEssentiel = onglet === "essentiel";
  const indexEtape = ONGLETS.findIndex((o) => o.cle === onglet);
  const etape = ONGLETS[indexEtape];
  const premiere = indexEtape === 0;
  const derniere = indexEtape === ONGLETS.length - 1;

  /** Change d'étape et remonte : sinon on reste au milieu du formulaire. */
  const allerA = (cle: Vue) => {
    setOnglet(cle);
    document
      .getElementById("parcours-fiche")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <form action={action}>
      {fiche && <input type="hidden" name="id" value={fiche.id} />}

      {/* En-tête : titre simple sur l'essentiel, parcours sur le complément */}
      <div
        id="parcours-fiche"
        className="scroll-mt-4 rounded-media border-[1.4px] border-line bg-white p-4 sm:p-5"
      >
        {surEssentiel ? (
          <>
            <p className="text-tiny font-bold tracking-[0.08em] uppercase text-acc">
              L’essentiel
            </p>
            <h2 className="mt-2 text-card font-extrabold text-ink">
              De quoi mettre l’animal en ligne
            </h2>
            <p className="mt-1 text-meta leading-[1.6] text-mut">
              Sept champs suffisent. Tout le reste est facultatif et peut
              attendre.
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-tiny font-bold tracking-[0.08em] uppercase text-acc">
                Compléter — étape {indexEtape + 1} sur {ONGLETS.length}
              </p>
              <button
                type="button"
                onClick={() => allerA("essentiel")}
                className="text-tiny font-semibold text-mut underline underline-offset-2 transition-colors duration-150 hover:text-pri"
              >
                Revenir à l’essentiel
              </button>
            </div>

            <div
              className="mt-2.5 flex gap-1"
              role="progressbar"
              aria-valuenow={indexEtape + 1}
              aria-valuemin={1}
              aria-valuemax={ONGLETS.length}
              aria-label={`Étape ${indexEtape + 1} sur ${ONGLETS.length} : ${etape.titre}`}
            >
              {ONGLETS.map((o, i) => (
                <span
                  key={o.cle}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-200",
                    i <= indexEtape ? "bg-acc" : "bg-line",
                  )}
                />
              ))}
            </div>

            <h2 className="mt-4 text-card font-extrabold text-ink">{etape.titre}</h2>
            <p className="mt-1 text-meta leading-[1.6] text-mut">{etape.phrase}</p>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
              {ONGLETS.map((o, i) => {
                const actif = onglet === o.cle;
                return (
                  <button
                    key={o.cle}
                    type="button"
                    aria-current={actif ? "step" : undefined}
                    onClick={() => allerA(o.cle)}
                    className={cn(
                      "h-7 rounded-full px-2.5 text-tiny transition-colors duration-150",
                      actif
                        ? "bg-pri font-semibold text-white"
                        : i < indexEtape
                          ? "text-acc hover:bg-acc-soft"
                          : "text-mut hover:bg-acc-soft hover:text-pri",
                    )}
                  >
                    {i + 1}. {o.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {etat.statut === "erreur" && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-[11px] border border-erreur bg-alerte px-4 py-3.5"
        >
          <CircleAlert size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-white" />
          <p className="text-meta text-alerte-ink">{etat.message}</p>
        </div>
      )}

      <CarteAdmin className="projecteur mt-4 p-5 sm:p-6">
        {/* ---------------- L'essentiel ---------------- */}
        <div className={panneau("essentiel")}>
          <p className="text-meta leading-[1.6] text-mut">
            De quoi mettre l’animal en ligne. Le reste est facultatif et peut
            attendre : vous pourrez y revenir quand vous aurez le temps.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Champ id="nom" label="Nom de l’animal" erreur={erreurs.nom} manquant={aRemplir("nom")}>
              <Texte id="nom" name="nom" defaultValue={fiche?.nom} required />
            </Champ>
            <Champ id="espece" label="Espèce">
              <Liste
                id="espece"
                name="espece"
                defaultValue={fiche?.espece ?? "chien"}
                options={[
                  { valeur: "chien", label: "Chien" },
                  { valeur: "chat", label: "Chat" },
                  { valeur: "autre", label: "Autre" },
                ]}
              />
            </Champ>
            <Champ id="especeAutre" label="Préciser l’espèce" aide="À remplir seulement si vous avez choisi « Autre ».">
              <Texte id="especeAutre" name="especeAutre" defaultValue={fiche?.especeAutre} placeholder="Lapin nain" />
            </Champ>
            <Champ id="sexe" label="Sexe">
              <Liste
                id="sexe"
                name="sexe"
                defaultValue={fiche?.sexe ?? "male"}
                options={[
                  { valeur: "male", label: "Mâle" },
                  { valeur: "femelle", label: "Femelle" },
                ]}
              />
            </Champ>
            <Champ id="age" label="Âge affiché" aide="Tel qu’il apparaîtra sur le site : « 3 ans », « 6 mois »." erreur={erreurs.age} manquant={aRemplir("age")}>
              <Texte id="age" name="age" defaultValue={fiche?.age} required />
            </Champ>
            <Champ id="commune" label="Où se trouve l’animal" aide="Commune et département : « Lunel (34) »." erreur={erreurs.commune} manquant={aRemplir("commune")}>
              <Texte id="commune" name="commune" defaultValue={fiche?.commune} required />
            </Champ>
          </div>

          <Champ
            id="descriptionCourte"
            manquant={aRemplir("descriptionCourte")}
            label="Description"
            aide="Qui il est, d’où il vient, son caractère. Quelques phrases suffisent — écrivez comme vous parlez, l’assistant met au propre."
            erreur={erreurs.descriptionCourte}
          >
            <Zone id="descriptionCourte" name="descriptionCourte" rows={8} defaultValue={fiche?.descriptionCourte} />
            {assistantDisponible && <BoutonReformuler champ="descriptionCourte" />}
          </Champ>

          <div className="bloc-focus">
          <TeleverseurPhotos
            photosInitiales={fiche?.galerie}
            legende="Glissez les photos de l’animal ici"
            erreur={erreurs.galerie}
          />
          </div>

          <Champ
            id="statut"
            label="État de la fiche"
            aide="C’est ce qui décide si la fiche est visible sur le site, et comment."
          >
            <Liste
              id="statut"
              name="statut"
              defaultValue={fiche?.statut ?? "brouillon"}
              onChange={(e) => setStatut(e.target.value as Animal["statut"])}
              options={OPTIONS_STATUT}
            />
          </Champ>
        </div>

        {/* ---------------- Identité ---------------- */}
        <div className={panneau("identite")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ id="race" label="Race" aide="Laissez vide si vous ne la connaissez pas.">
              <Texte id="race" name="race" defaultValue={fiche?.race ?? ""} placeholder="Labrador croisé" />
            </Champ>
            <Champ id="dateNaissanceEstimee" label="Date de naissance estimée">
              <Texte id="dateNaissanceEstimee" name="dateNaissanceEstimee" type="date" defaultValue={fiche?.dateNaissanceEstimee} />
            </Champ>
            <Champ id="taille" label="Taille">
              <Liste
                id="taille"
                name="taille"
                defaultValue={fiche?.taille ?? "moyen"}
                options={[
                  { valeur: "petit", label: "Petit" },
                  { valeur: "moyen", label: "Moyen" },
                  { valeur: "grand", label: "Grand" },
                ]}
              />
            </Champ>
            <Champ id="poidsKg" label="Poids en kilos">
              <Texte id="poidsKg" name="poidsKg" type="number" step="0.1" min={0} defaultValue={fiche?.poidsKg} />
            </Champ>
            <Champ id="familleAccueil" label="Famille d’accueil" aide="Facultatif — affiché sur la fiche.">
              <Texte id="familleAccueil" name="familleAccueil" defaultValue={fiche?.familleAccueil} />
            </Champ>
            <Champ id="nombreAnimauxPortee" label="Animaux de la portée" aide="À remplir uniquement pour une cession de portée.">
              <Texte id="nombreAnimauxPortee" name="nombreAnimauxPortee" type="number" min={0} defaultValue={fiche?.nombreAnimauxPortee} />
            </Champ>
          </div>
        </div>

        {/* ---------------- Présentation ---------------- */}
        <div className={panneau("presentation")}>
          {/* L'histoire n'est plus saisie séparément : une seule description.
              La valeur existante est conservée telle quelle. */}
          <input type="hidden" name="histoire" defaultValue={fiche?.histoire.join("\n") ?? ""} />
          <Champ id="caractere" label="Traits de caractère" aide="Séparés par des virgules : Doux, Joueur, Sociable.">
            <Texte id="caractere" name="caractere" defaultValue={fiche?.caractere.join(", ")} />
          </Champ>
          <input type="hidden" name="caractereNote" defaultValue={fiche?.caractereNote ?? ""} />
        </div>

        {/* ---------------- Compatibilités ---------------- */}
        <div className={panneau("compatibilites")}>
          <p className="text-meta leading-[1.6] text-mut">
            Ce que l’animal supporte. Choisissez « À tester » si vous ne savez pas :
            c’est plus honnête, et cela évite les mauvaises surprises.
          </p>
          {(
            [
              ["chiens", "Avec les chiens", fiche?.compatChiens, fiche?.compatNotes?.chiens],
              ["chats", "Avec les chats", fiche?.compatChats, fiche?.compatNotes?.chats],
              ["enfants", "Avec les enfants", fiche?.compatEnfants, fiche?.compatNotes?.enfants],
            ] as const
          ).map(([cle, label, valeur, note]) => {
            const champ = `compat${cle.charAt(0).toUpperCase()}${cle.slice(1)}`;
            return (
              <div key={cle} className="grid gap-5 sm:grid-cols-[220px_1fr]">
                <Champ id={champ} label={label}>
                  <Liste id={champ} name={champ} defaultValue={valeur ?? "a_tester"} options={OPTIONS_COMPAT} />
                </Champ>
                <Champ id={`compatNote${cle}`} label="Précision" aide="Facultatif — affiché à côté de la réponse.">
                  <Texte
                    id={`compatNote${cle}`}
                    name={`compatNote${cle.charAt(0).toUpperCase()}${cle.slice(1)}`}
                    defaultValue={note}
                  />
                </Champ>
              </div>
            );
          })}
        </div>

        {/* ---------------- Santé ---------------- */}
        <div className={panneau("sante")}>
          <div className="space-y-3">
            <Case id="identifie" label="Identifié (puce ou tatouage)" defaultChecked={fiche?.sante.identifie} />
            <Case id="vaccine" label="Vacciné" defaultChecked={fiche?.sante.vaccine} />
            <Case id="sterilise" label="Stérilisé" defaultChecked={fiche?.sante.sterilise} />
          </div>
          <Champ id="santeResume" label="État de santé" aide="Une phrase, affichée sur la fiche.">
            <Zone id="santeResume" name="santeResume" rows={2} defaultValue={fiche?.sante.resume} />
          </Champ>
          <Champ id="traitement" label="Traitement ou soin en cours" aide="Facultatif — mis en évidence sur la fiche.">
            <Zone id="traitement" name="traitement" rows={3} defaultValue={fiche?.sante.traitement} />
          </Champ>
        </div>

        {/* ---------------- Adoption ---------------- */}
        <div className={panneau("adoption")}>
          <Champ id="environnement" label="Le foyer recherché" aide="Un paragraphe.">
            <Zone id="environnement" name="environnement" rows={3} defaultValue={fiche?.environnement} />
          </Champ>
          <Champ id="environnementPoints" label="Points importants" aide="Un par ligne. Ils s’affichent avec une coche.">
            <Zone id="environnementPoints" name="environnementPoints" rows={4} defaultValue={fiche?.environnementPoints.join("\n")} />
          </Champ>
          <Champ
            id="conditions"
            label="Étapes de l’adoption"
            aide="Une étape par ligne, sous la forme : Titre | explication."
          >
            <Zone
              id="conditions"
              name="conditions"
              rows={5}
              defaultValue={fiche?.conditions.map((c) => `${c.titre} | ${c.texte}`).join("\n")}
              placeholder={"Votre demande | Vous remplissez le formulaire en ligne."}
            />
          </Champ>
          <Champ id="fraisAdoption" label="Participation aux frais, en euros">
            <Texte id="fraisAdoption" name="fraisAdoption" type="number" min={0} defaultValue={fiche?.fraisAdoption ?? 0} />
          </Champ>
        </div>

        {/* ---------------- Publication ---------------- */}
        <div className={panneau("publication")}>

          {statut === "urgent" && (
            <div className="space-y-5 rounded-media border border-line bg-subtil p-4">
              <p className="text-meta font-semibold text-ink">Informations d’urgence</p>
              <Champ id="urgenceMotif" label="Pourquoi c’est urgent" aide="Une phrase, affichée sur la carte.">
                <Zone id="urgenceMotif" name="urgenceMotif" rows={2} defaultValue={fiche?.urgence?.motif} />
              </Champ>
              <div className="grid gap-5 sm:grid-cols-2">
                <Champ id="urgenceDelai" label="Délai" aide="« Opération sous 15 jours »">
                  <Texte id="urgenceDelai" name="urgenceDelai" defaultValue={fiche?.urgence?.delai} />
                </Champ>
                <Champ id="urgenceCtaLabel" label="Texte du bouton" aide="« Aider Rio »">
                  <Texte id="urgenceCtaLabel" name="urgenceCtaLabel" defaultValue={fiche?.urgence?.ctaLabel} />
                </Champ>
              </div>
            </div>
          )}

          {statut === "reserve" && (
            <Champ id="reserveDepuis" label="Réservé depuis le">
              <Texte id="reserveDepuis" name="reserveDepuis" type="date" defaultValue={fiche?.reserveDepuis} />
            </Champ>
          )}

          {statut === "adopte" && (
            <div className="space-y-5 rounded-media border border-line bg-subtil p-4">
              <p className="text-meta font-semibold text-ink">Son adoption</p>
              <p className="text-tiny leading-[1.6] text-mut">
                La fiche reste en ligne. Le formulaire disparaît et laisse place à ce récit.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Champ id="adoptionDate" label="Date de l’adoption">
                  <Texte id="adoptionDate" name="adoptionDate" type="date" defaultValue={fiche?.suiteAdoption?.date} />
                </Champ>
                <Champ id="adoptionFamille" label="La famille" aide="« Famille Martin »">
                  <Texte id="adoptionFamille" name="adoptionFamille" defaultValue={fiche?.suiteAdoption?.famille} />
                </Champ>
              </div>
              <Champ id="adoptionRecit" label="Les nouvelles" aide="Ce que la famille vous a écrit.">
                <Zone id="adoptionRecit" name="adoptionRecit" rows={4} defaultValue={fiche?.suiteAdoption?.recit} />
              </Champ>
              <Champ id="adoptionCitation" label="Phrase à mettre en avant" aide="Facultatif — affichée en italique.">
                <Texte id="adoptionCitation" name="adoptionCitation" defaultValue={fiche?.suiteAdoption?.citation} />
              </Champ>
              <div>
                <p className="text-meta font-semibold text-ink">
                  Photo dans sa nouvelle famille
                </p>
                <div className="mt-2">
                  <TeleverseurPhotos
                    photosInitiales={
                      fiche?.suiteAdoption?.photo ? [fiche.suiteAdoption.photo] : []
                    }
                    nomChampUrls="adoptionPhotoUrl"
                    nomChampAlts="adoptionPhotoAlt"
                    legende="Glissez la photo ici"
                  />
                </div>
              </div>
            </div>
          )}

          <Case
            id="afficherSurAccueil"
            label="Mettre en avant sur la page d’accueil"
            defaultChecked={fiche?.afficherSurAccueil}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Champ id="dateArrivee" label="Arrivée à l’association">
              <Texte id="dateArrivee" name="dateArrivee" type="date" defaultValue={fiche?.dateArrivee} />
            </Champ>
            <Champ id="datePublication" label="Date de mise en ligne" aide="Sert au tri « plus récents » du catalogue.">
              <Texte id="datePublication" name="datePublication" type="date" defaultValue={fiche?.datePublication} />
            </Champ>
          </div>

          <Champ
            id="slug"
            label="Adresse de la page"
            aide="Laissez vide pour qu’elle soit créée à partir du nom. Évitez de la changer une fois la fiche publiée."
          >
            <Texte id="slug" name="slug" defaultValue={fiche?.slug} placeholder="oslo" />
          </Champ>
        </div>
        {(surEssentiel || onglet === "publication") && (
          <ControlePublication statut={statut} />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          {surEssentiel ? (
            <>
              <p className="text-tiny leading-[1.6] text-mut">
                Vous pouvez enregistrer maintenant et compléter plus tard.
              </p>
              <button
                type="button"
                onClick={() => allerA(ONGLETS[0].cle)}
                className="ml-auto inline-flex h-11 items-center gap-2.5 rounded-btn border-[1.4px] border-line bg-white px-4 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
              >
                Compléter la fiche
                <span className="text-tiny font-normal text-mut">(facultatif)</span>
                <ChevronRight size={17} strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  allerA(premiere ? "essentiel" : ONGLETS[indexEtape - 1].cle)
                }
                className="inline-flex h-11 items-center gap-2 rounded-btn border-[1.4px] border-line bg-white px-4 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
              >
                <ChevronLeft size={17} strokeWidth={2} aria-hidden="true" />
                {premiere ? "L’essentiel" : ONGLETS[indexEtape - 1].label}
              </button>

              {!derniere ? (
                <button
                  type="button"
                  onClick={() => allerA(ONGLETS[indexEtape + 1].cle)}
                  className="ml-auto inline-flex h-11 items-center gap-2.5 rounded-btn bg-pri px-5 text-meta font-bold text-white transition-colors duration-150 hover:bg-pri-dark"
                >
                  Continuer — {ONGLETS[indexEtape + 1].label}
                  <ChevronRight size={17} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : (
                <p className="ml-auto text-tiny text-mut">
                  Dernière étape — enregistrez ci-dessous.
                </p>
              )}
            </>
          )}
        </div>
      </CarteAdmin>

      {/* ---------------- Barre d'actions ---------------- */}
      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 rounded-media border border-line bg-white/95 p-4 backdrop-blur">
        {/*
          Tant que le parcours n'est pas terminé, enregistrer n'est pas l'action
          attendue : le bouton reste discret et son libellé dit bien qu'on met
          de côté, pas qu'on a fini. « Continuer » garde la vedette.
        */}
        <button
          type="submit"
          disabled={enCours}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-btn px-4 text-meta transition-colors duration-150 disabled:opacity-60",
            surEssentiel || derniere
              ? "bg-acc font-bold text-white hover:bg-acc-dark"
              : "border-[1.4px] border-line bg-white font-semibold text-pri hover:border-pri",
          )}
        >
          <Save size={17} strokeWidth={2} aria-hidden="true" />
          {enCours
            ? "Enregistrement…"
            : surEssentiel || derniere
              ? nouvelle
                ? "Créer la fiche"
                : "Enregistrer"
              : "Enregistrer et continuer plus tard"}
        </button>

        {fiche && fiche.statut !== "brouillon" && (
          <SmartLink
            href={routes.animal(fiche.slug)}
            className="inline-flex h-10 items-center gap-2 rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta font-semibold text-pri transition-colors duration-150 hover:border-pri"
          >
            <Eye size={17} strokeWidth={1.8} aria-hidden="true" />
            Voir sur le site
          </SmartLink>
        )}

        <SmartLink
          href={routes.adminAnimaux}
          className="ml-auto text-meta font-semibold text-mut transition-colors duration-150 hover:text-pri"
        >
          Retour à la liste
        </SmartLink>
      </div>

      {fiche?.statut === "brouillon" && (
        <div className="mt-4 rounded-media border border-line p-4">
          <p className="text-meta font-semibold text-ink">Supprimer ce brouillon</p>
          <p className="mt-1 text-tiny leading-[1.6] text-mut">
            Seuls les brouillons peuvent être supprimés. Une fiche publiée est
            conservée : elle passe en « Adopté » plutôt que d’être effacée.
          </p>
          <div className="mt-3">
            <BoutonSuppression
              question="Supprimer ce brouillon ? C’est irréversible."
              formAction={supprimerFiche}
              formNoValidate
              name="slug"
              value={fiche.slug}
            />
          </div>
        </div>
      )}
    </form>
  );
}
