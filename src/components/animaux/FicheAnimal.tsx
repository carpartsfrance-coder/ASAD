import {
  Baby,
  CalendarDays,
  Cat,
  Check,
  Dog,
  Heart,
  MapPin,
  Mars,
  Minus,
  Ruler,
  ScanLine,
  Stethoscope,
  Venus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Puce } from "@/components/ui/Badge";
import { SmartLink } from "@/components/ui/SmartLink";
import { deNom, formatDate, formatEuros } from "@/lib/format";
import {
  libelleCompat,
  libelleEspeceAccordee,
  libelleRace,
  libelleSexe,
  libelleStatut,
  libelleTaille,
  resumeSante,
} from "@/lib/animaux";
import { association, helloAsso, routes } from "@/content/site";
import { cn } from "@/lib/cn";
import type { Animal, Compat } from "@/types";
import { GalerieAnimal } from "./GalerieAnimal";

/* ------------------------------------------------------------------ */
/* Briques internes                                                    */
/* ------------------------------------------------------------------ */

function Carte({
  titre,
  children,
  ton = "blanc",
  className,
}: {
  titre: string;
  children: React.ReactNode;
  ton?: "blanc" | "warm";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mt-[22px] rounded-card px-6 py-7 sm:px-[30px] sm:py-7",
        ton === "blanc" ? "bg-white shadow-card" : "bg-warm",
        className,
      )}
    >
      <h2 className="text-[20px] font-extrabold tracking-[-0.012em] text-ink sm:text-[22px]">
        {titre}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRapide({
  icone,
  etiquette,
  valeur,
}: {
  icone: React.ReactNode;
  etiquette: string;
  valeur: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-soft text-pri"
      >
        {icone}
      </span>
      <div className="min-w-0">
        <dt className="text-[12px] font-semibold tracking-[0.06em] text-mut uppercase">
          {etiquette}
        </dt>
        <dd className="mt-0.5 text-nav font-semibold break-words text-ink">{valeur}</dd>
      </div>
    </div>
  );
}

function VerdictCompat({ valeur }: { valeur: Compat }) {
  const positif = valeur === "oui";
  const negatif = valeur === "non";

  return (
    <span
      className={cn(
        "inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-mini font-semibold",
        positif && "bg-soft text-pri",
        negatif && "bg-alerte text-alerte-ink",
        !positif && !negatif && "border border-line bg-white text-mut",
      )}
    >
      {positif && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}
      {negatif && <X size={14} strokeWidth={2.4} aria-hidden="true" />}
      {!positif && !negatif && <Minus size={14} strokeWidth={2.4} aria-hidden="true" />}
      {libelleCompat[valeur]}
    </span>
  );
}

function LigneCompat({
  icone,
  libelle,
  note,
  valeur,
}: {
  icone: React.ReactNode;
  libelle: string;
  note?: string;
  valeur: Compat;
}) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-3.5 last:border-b-0">
      <span
        aria-hidden="true"
        className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-soft text-pri"
      >
        {icone}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-nav font-bold text-ink">{libelle}</p>
        {note && <p className="mt-0.5 text-body text-mut">{note}</p>}
      </div>
      <VerdictCompat valeur={valeur} />
    </li>
  );
}

function LigneSante({ actif, libelle }: { actif: boolean; libelle: string }) {
  return (
    <li className="flex items-center gap-2.5 text-nav">
      {actif ? (
        <Check size={18} strokeWidth={2.3} aria-hidden="true" className="shrink-0 text-acc" />
      ) : (
        <X size={18} strokeWidth={2.3} aria-hidden="true" className="shrink-0 text-mut" />
      )}
      <span className={actif ? "text-ink" : "text-mut"}>{libelle}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Colonne principale                                                  */
/* ------------------------------------------------------------------ */

export function ColonneAnimal({ animal }: { animal: Animal }) {
  const IconeSexe = animal.sexe === "femelle" ? Venus : Mars;

  return (
    <div>
      <GalerieAnimal photos={animal.galerie} nom={animal.nom} statut={animal.statut} />

      <h1 className="mt-7 text-[32px] leading-tight font-extrabold tracking-[-0.022em] text-ink sm:text-[42px]">
        {animal.nom}
      </h1>

      <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-quote text-mut">
        <span>
          {libelleEspeceAccordee(animal)}, {animal.age}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin size={17} strokeWidth={1.7} aria-hidden="true" />
          {animal.familleAccueil ? "Famille d’accueil à " : ""}
          {animal.commune}
        </span>
      </p>

      {/* Informations rapides */}
      <dl className="mt-6 grid grid-cols-1 gap-x-[18px] gap-y-[22px] rounded-card bg-white p-6 shadow-card sm:grid-cols-2 lg:grid-cols-3">
        <InfoRapide
          icone={<IconeSexe size={19} strokeWidth={1.7} />}
          etiquette="Sexe"
          valeur={libelleSexe[animal.sexe]}
        />
        <InfoRapide
          icone={<Ruler size={19} strokeWidth={1.7} />}
          etiquette="Taille"
          valeur={
            animal.poidsKg
              ? `${libelleTaille[animal.taille]} · ${animal.poidsKg.toLocaleString("fr-FR")} kg`
              : libelleTaille[animal.taille]
          }
        />
        <InfoRapide
          icone={<Heart size={19} strokeWidth={1.7} />}
          etiquette="Race"
          valeur={libelleRace(animal)}
        />
        <InfoRapide
          icone={<ScanLine size={19} strokeWidth={1.7} />}
          etiquette="Identification"
          valeur={animal.identification ?? "En cours"}
        />
        <InfoRapide
          icone={<Stethoscope size={19} strokeWidth={1.7} />}
          etiquette="Santé"
          valeur={resumeSante(animal)}
        />
        <InfoRapide
          icone={<CalendarDays size={19} strokeWidth={1.7} />}
          etiquette="À l’adoption depuis"
          valeur={formatDate(animal.datePublication)}
        />
      </dl>

      {/* 1. Histoire */}
      <Carte titre={`L’histoire ${deNom(animal.nom)}`}>
        <div className="space-y-3.5">
          {animal.histoire.map((paragraphe, index) => (
            <p key={index} className="text-quote leading-[1.75] text-mut">
              {paragraphe}
            </p>
          ))}
        </div>
      </Carte>

      {/* 2. Caractère */}
      <Carte titre="Son caractère">
        <ul className="flex flex-wrap gap-2.5">
          {animal.caractere.map((trait) => (
            <li key={trait}>
              <Puce>{trait}</Puce>
            </li>
          ))}
        </ul>
        {animal.caractereNote && (
          <p className="mt-4 text-quote leading-[1.75] text-mut">{animal.caractereNote}</p>
        )}
      </Carte>

      {/* 3. Compatibilité */}
      <Carte titre="Compatibilité">
        <ul>
          <LigneCompat
            icone={<Dog size={19} strokeWidth={1.7} />}
            libelle="Avec les chiens"
            note={animal.compatNotes?.chiens}
            valeur={animal.compatChiens}
          />
          <LigneCompat
            icone={<Cat size={19} strokeWidth={1.7} />}
            libelle="Avec les chats"
            note={animal.compatNotes?.chats}
            valeur={animal.compatChats}
          />
          <LigneCompat
            icone={<Baby size={19} strokeWidth={1.7} />}
            libelle="Avec les enfants"
            note={animal.compatNotes?.enfants}
            valeur={animal.compatEnfants}
          />
        </ul>
      </Carte>

      {/* 4. Santé */}
      <Carte titre="Santé">
        <ul className="space-y-3">
          <LigneSante actif={animal.sante.identifie} libelle="Identifié" />
          <LigneSante actif={animal.sante.vaccine} libelle="Vacciné" />
          <LigneSante actif={animal.sante.sterilise} libelle="Stérilisé" />
        </ul>
        {animal.sante.resume && (
          <p className="mt-4 text-quote leading-[1.75] text-mut">{animal.sante.resume}</p>
        )}
        {animal.sante.traitement && (
          <p className="mt-3 rounded-[10px] bg-soft p-4 text-body leading-[1.65] text-pri">
            {animal.sante.traitement}
          </p>
        )}
      </Carte>

      {/* 5. Environnement recherché */}
      {animal.environnementPoints.length > 0 && (
        <Carte titre="L’environnement recherché">
          <p className="text-quote leading-[1.75] text-mut">{animal.environnement}</p>
          <ul className="mt-4 space-y-2.5">
            {animal.environnementPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-nav text-mut">
                <Check size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-acc" />
                {point}
              </li>
            ))}
          </ul>
        </Carte>
      )}

      {/* 6. Conditions d'adoption */}
      {animal.conditions.length > 0 && (
        <Carte titre="Conditions d’adoption">
          <p className="text-quote leading-[1.75] text-mut">
            Participation aux frais engagés par l’association :{" "}
            <strong className="font-bold text-ink">{formatEuros(animal.fraisAdoption)}</strong>.
          </p>
          <ol className="mt-5 space-y-4">
            {animal.conditions.map((etape, index) => (
              <li key={etape.titre} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-soft text-body font-extrabold text-pri"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-nav font-bold text-ink">{etape.titre}</p>
                  <p className="mt-1 text-body leading-[1.65] text-mut">{etape.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </Carte>
      )}

      {/* 7. Informations réglementaires */}
      <Carte titre="Informations réglementaires" ton="warm">
        <dl className="grid gap-x-8 gap-y-1.5 text-meta text-mut sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="font-semibold text-ink">Espèce :</dt>
            <dd>{libelleEspeceAccordee(animal)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-ink">Sexe :</dt>
            <dd>{libelleSexe[animal.sexe]}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-ink">Âge :</dt>
            <dd>{animal.age}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-ink">Race :</dt>
            <dd>{libelleRace(animal)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-ink">Identification :</dt>
            <dd>{animal.identification ?? "En cours"}</dd>
          </div>
          {animal.nombreAnimauxPortee != null && (
            <div className="flex gap-2">
              <dt className="font-semibold text-ink">Animaux de la portée :</dt>
              <dd>{animal.nombreAnimauxPortee}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-meta leading-[1.65] text-mut">
          Mentions prévues à l’article L.214-8-1 du code rural et de la pêche maritime
          pour les offres de cession d’animaux de compagnie. {association.nom} ne
          pratique aucune vente : les frais demandés correspondent à une participation
          aux dépenses déjà engagées.
        </p>
      </Carte>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Encadré latéral                                                     */
/* ------------------------------------------------------------------ */

function LigneEncadre({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-[11px] last:border-b-0">
      <dt className="text-body text-mut">{libelle}</dt>
      <dd className="text-body font-semibold text-ink">{valeur}</dd>
    </div>
  );
}

export function EncadreAnimal({ animal }: { animal: Animal }) {
  return (
    <div className="lg:sticky lg:top-6">
      <div className="rounded-panel bg-white px-6 pt-6 pb-[26px] shadow-[0_4px_20px_rgba(20,32,24,.075)]">
        <div className="flex items-center gap-3.5">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-media bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={animal.photoPrincipale.src}
              alt=""
              className="size-full object-cover"
            />
          </span>
          <div>
            <p className="text-[20px] font-extrabold text-ink">{animal.nom}</p>
            <p className="text-body text-mut">
              {libelleEspeceAccordee(animal)}, {animal.age}
            </p>
          </div>
        </div>

        <dl className="mt-5">
          <LigneEncadre libelle="Statut" valeur={libelleStatut[animal.statut]} />
          <LigneEncadre libelle="Localisation" valeur={animal.commune} />
          <LigneEncadre
            libelle="Frais d’adoption"
            valeur={formatEuros(animal.fraisAdoption)}
          />
          <LigneEncadre libelle="Réponse sous" valeur="5 jours ouvrés" />
        </dl>

        {/* Le contenu dépend du statut de l'animal. */}
        {(animal.statut === "a_adopter" || animal.statut === "urgent") && (
          <div className="mt-6">
            <Button
              href={routes.adopter(animal.slug)}
              variante="accent"
              taille="lg"
              pleineLargeur
              icone={<Heart size={18} strokeWidth={1.8} aria-hidden="true" />}
            >
              Faire une demande d’adoption
            </Button>
            <Button
              href={routes.contact}
              variante="contour"
              taille="md"
              pleineLargeur
              className="mt-3"
            >
              Poser une question
            </Button>
            <p className="mt-4 text-meta leading-[1.65] text-mut">
              Faire une demande ne vous engage à rien. Nous échangeons d’abord par
              téléphone, puis vous rencontrez {animal.nom} avant toute décision.
            </p>
          </div>
        )}

        {animal.statut === "reserve" && (
          <div className="mt-6">
            <div className="rounded-[10px] bg-soft p-4">
              <p className="text-nav font-bold text-pri">
                Une demande est en cours d’étude
              </p>
              <p className="mt-1.5 text-body leading-[1.65] text-pri/80">
                {animal.nom} est réservé
                {animal.reserveDepuis ? ` depuis le ${formatDate(animal.reserveDepuis)}` : ""}.
                Si l’adoption ne se confirmait pas, sa fiche redeviendrait disponible.
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-4 flex h-[54px] w-full cursor-not-allowed items-center justify-center rounded-cta bg-line text-lead font-semibold text-mut"
            >
              Demande d’adoption indisponible
            </button>
            <SmartLink
              href={routes.animaux}
              className="link-underline mt-4 inline-block text-body font-semibold text-acc hover:text-acc-dark"
            >
              Voir les autres animaux
            </SmartLink>
          </div>
        )}

        {animal.statut === "adopte" && animal.suiteAdoption && (
          <div className="mt-6">
            <div className="rounded-[10px] bg-warm p-4">
              <p className="text-nav font-bold text-ink">
                {animal.nom} a trouvé sa famille
              </p>
              <p className="mt-2 text-body leading-[1.68] text-mut">
                {animal.suiteAdoption.recit}
              </p>
              {animal.suiteAdoption.citation && (
                <blockquote className="mt-3 text-body leading-[1.7] text-citation italic">
                  <p>“ {animal.suiteAdoption.citation} ”</p>
                </blockquote>
              )}
              <p className="mt-3 text-mini font-bold text-ink">
                — {animal.suiteAdoption.famille}, {formatDate(animal.suiteAdoption.date)}
              </p>
            </div>
            <Button
              href={routes.animaux}
              variante="primaire"
              taille="md"
              pleineLargeur
              className="mt-4"
            >
              Voir les animaux à adopter
            </Button>
          </div>
        )}
      </div>

      {/* Bloc secondaire */}
      <div className="mt-4 rounded-panel border border-line p-5">
        <p className="text-body font-bold text-ink">Vous ne pouvez pas adopter ?</p>
        <p className="mt-1.5 text-meta leading-[1.65] text-mut">
          Un don finance les soins, la nourriture et le quotidien de nos protégés.
        </p>
        <SmartLink
          href={helloAsso.don}
          externe
          className="link-underline mt-3 inline-block text-body font-semibold text-acc hover:text-acc-dark"
        >
          Faire un don
        </SmartLink>
      </div>
    </div>
  );
}
