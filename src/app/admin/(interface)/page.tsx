import type { Metadata } from "next";
import { ChevronRight, Clock, TrendingUp } from "lucide-react";
import { BandeauConfirmation } from "@/components/admin/BandeauConfirmation";
import { BandeauAccesRefuse } from "@/components/admin/BandeauAccesRefuse";
import { GuideRole } from "@/components/admin/GuideRole";
import { IconeAdmin } from "@/components/admin/IconeAdmin";
import {
  Avatar,
  BOUTON_SECONDAIRE,
  CarteAdmin,
  EnTeteCarte,
  EnTetePageAdmin,
  LigneCarte,
  PiluleStatut,
  type TonStatut,
} from "@/components/admin/primitives";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  adoptionsParMois,
  cartesAction,
  initiales,
  libelleStatutDemande,
  raccourcisTableauBord,
} from "@/content/admin";
import { campagnesActives } from "@/lib/donnees/editorial";
import { compterMessages } from "@/lib/donnees/livre-or";
import { dernieresActivites } from "@/lib/donnees/journal";
import { demandesRecentes, toutesLesDemandes } from "@/lib/donnees/demandes";
import { routes } from "@/content/site";
import { exigerUtilisateur } from "@/lib/auth/garde";
import { accedeALaRubrique, peut } from "@/lib/auth/roles";
import { formatDate, formatEuros, pourcentage } from "@/lib/format";
import { libelleStatut, sousTitreAnimal } from "@/lib/animaux";
import { compterParStatut, toutesLesFiches } from "@/lib/donnees/animaux";
import type { StatutAnimal, StatutDemande } from "@/types";

export const metadata: Metadata = { title: "Tableau de bord" };

/* Correspondance statut → couleur fonctionnelle. */
const TON_ANIMAL: Record<StatutAnimal, TonStatut> = {
  a_adopter: "info",
  urgent: "alerte",
  reserve: "attente",
  adopte: "neutre",
  brouillon: "neutre",
};

const TON_DEMANDE: Record<StatutDemande, TonStatut> = {
  nouvelle: "info",
  a_contacter: "attente",
  entretien_prevu: "attente",
  visite_prevue: "attente",
  acceptee: "succes",
  refusee: "alerte",
  classee: "neutre",
  archivee: "neutre",
};

export default async function PageTableauDeBord({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const utilisateur = await exigerUtilisateur();
  const params = await searchParams;
  const accesRefuse = params.acces === "refuse";
  const rubriqueRefusee =
    typeof params.rubrique === "string" ? params.rubrique : undefined;

  /* Tous les chiffres viennent de la base : ils reflètent l'état réel. */
  const [parStatut, messages, campagnes, demandes, nbRecentes] = await Promise.all([
    compterParStatut(),
    compterMessages(),
    campagnesActives(),
    toutesLesDemandes(5),
    demandesRecentes(),
  ]);

  const compter = (statut: StatutAnimal) => parStatut[statut];
  const messagesEnAttente = messages.en_attente;

  /* Chaque bloc n'apparaît que si le rôle peut en faire quelque chose. */
  const voitAnimaux = peut(utilisateur.role, "animaux:lire");
  const voitDemandes = peut(utilisateur.role, "demandes:lire");
  const voitUrgences = peut(utilisateur.role, "urgences:lire");
  const voitLivreOr = peut(utilisateur.role, "livre-or:lire");
  const perimetreRestreint = !voitDemandes;

  const kpis = [
    voitAnimaux && { etiquette: "Animaux à adopter", valeur: compter("a_adopter"), note: "Fiches en ligne", icone: "animaux" as const, ton: "info" as const },
    voitAnimaux && { etiquette: "Animaux urgents", valeur: compter("urgent"), note: "Prise en charge immédiate", icone: "signalements" as const, ton: "alerte" as const },
    voitAnimaux && { etiquette: "Animaux réservés", valeur: compter("reserve"), note: "Adoption en cours", icone: "familles" as const, ton: "attente" as const },
    voitDemandes && { etiquette: "Nouvelles demandes", valeur: nbRecentes, note: "Depuis 7 jours", icone: "demandes" as const, ton: "info" as const },
    voitLivreOr && !voitDemandes && { etiquette: "Livre d’or à valider", valeur: messagesEnAttente, note: "Messages à relire", icone: "livre-or" as const, ton: "info" as const },
  ].filter((k) => k !== false && k !== undefined);

  const maxAdoptions = Math.max(...adoptionsParMois.map((m) => m.valeur));
  const totalAdoptions = adoptionsParMois.reduce((somme, m) => somme + m.valeur, 0);
  const urgencesActives = campagnes;
  const derniersAnimaux = (await toutesLesFiches()).slice(0, 5);

  const prenom = utilisateur.nom.split(" ")[0];

  /* Les raccourcis suivent les droits du rôle. */
  const raccourcis = raccourcisTableauBord.filter((r) =>
    accedeALaRubrique(utilisateur.role, r.href),
  );
  const journal = await dernieresActivites(6);
  const actions = cartesAction
    .filter((c) => accedeALaRubrique(utilisateur.role, c.href))
    .map((c) =>
      c.href === routes.adminLivreOr ? { ...c, compteur: messagesEnAttente } : c,
    );

  return (
    <>
      {accesRefuse && <BandeauAccesRefuse rubrique={rubriqueRefusee} />}

      <BandeauConfirmation
        message="Fiche publiée. « Gribouille » est en ligne depuis 9 h 12."
        lien={routes.animal("gribouille")}
        lienLabel="Voir la fiche"
      />

      {perimetreRestreint ? (
        <GuideRole
          role={utilisateur.role}
          prenom={prenom}
          messagesEnAttente={messagesEnAttente}
        />
      ) : (
        <EnTetePageAdmin
          titre={`Bonjour ${prenom}`}
          sousTitre="Voici ce qui demande votre attention aujourd’hui."
          actions={raccourcis.map((raccourci) => (
            <SmartLink key={raccourci.href} href={raccourci.href} className={BOUTON_SECONDAIRE}>
              {raccourci.label}
            </SmartLink>
          ))}
        />
      )}

      {/* ---------------- Indicateurs ---------------- */}
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <li key={kpi.etiquette}>
            <CarteAdmin className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-micro font-semibold tracking-[0.09em] text-mut uppercase">
                  {kpi.etiquette}
                </p>
                <PiluleStatut ton={kpi.ton} className="size-9 justify-center rounded-[10px] p-0">
                  <IconeAdmin cle={kpi.icone} size={17} />
                </PiluleStatut>
              </div>
              <p className="mt-3 text-[30px] leading-none font-extrabold text-ink">
                {kpi.valeur}
              </p>
              <p className="mt-2 text-tiny text-mut">{kpi.note}</p>
            </CarteAdmin>
          </li>
        ))}
      </ul>

      {/* ---------------- Cartes d'action ---------------- */}
      {!perimetreRestreint && (
      <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {actions.map((carte) => (
          <li key={carte.href}>
            <SmartLink href={carte.href} className="block">
              <CarteAdmin className="flex items-center gap-4 p-4 transition-colors duration-150 hover:border-acc">
                <span
                  aria-hidden="true"
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-soft text-meta font-bold text-pri"
                >
                  {carte.compteur}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-bold text-ink">{carte.label}</span>
                  <span className="block text-tiny text-mut">{carte.sousTitre}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2} aria-hidden="true" className="shrink-0 text-mut" />
              </CarteAdmin>
            </SmartLink>
          </li>
        ))}
      </ul>
      )}

      {/* ---------------- Graphique + urgences ---------------- */}
      <div className={`mt-4 grid grid-cols-1 gap-4 ${voitUrgences ? "xl:grid-cols-[1.35fr_1fr]" : ""}`}>
        <CarteAdmin>
          <div className="flex items-center justify-between gap-4 px-5 pt-[18px] pb-3.5">
            <h2 className="text-[16px] font-bold text-ink">Adoptions par mois</h2>
            <PiluleStatut ton="succes">
              <TrendingUp size={13} strokeWidth={2.2} aria-hidden="true" className="mr-1" />
              +18 % sur 3 mois
            </PiluleStatut>
          </div>

          <div className="px-5 pb-5">
            <p className="text-tiny text-mut">
              {totalAdoptions} adoptions conclues depuis janvier 2026.
            </p>

            {/* Les barres sont en pourcentage : la colonne doit occuper toute la
                hauteur pour que ce pourcentage ait une référence. */}
            <div className="mt-4 flex h-[186px] gap-2 sm:gap-3">
              {adoptionsParMois.map((mois) => (
                <div
                  key={mois.mois}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-micro font-bold text-ink">{mois.valeur}</span>
                  <div
                    className="w-full rounded-t-md bg-acc"
                    style={{ height: `${(mois.valeur / maxAdoptions) * 100}%` }}
                  >
                    <span className="sr-only">
                      {mois.valeur} adoptions en {mois.mois}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2 border-t border-line pt-2 sm:gap-3">
              {adoptionsParMois.map((mois) => (
                <span key={mois.mois} className="flex-1 text-center text-micro text-mut">
                  {mois.mois}
                </span>
              ))}
            </div>
          </div>
        </CarteAdmin>

        {voitUrgences && (
        <CarteAdmin>
          <EnTeteCarte titre="Urgences actives" lien={routes.adminUrgences} />
          <ul>
            {urgencesActives.map((campagne) => {
              const part = pourcentage(campagne.collecte, campagne.objectif);
              return (
                <LigneCarte key={campagne.id} className="flex-col items-stretch gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-body font-semibold text-ink">{campagne.titre}</p>
                    <p className="shrink-0 text-tiny text-mut">
                      {formatEuros(campagne.collecte)} / {formatEuros(campagne.objectif)}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                    <div className="h-full rounded-full bg-acc" style={{ width: `${part}%` }} />
                  </div>
                  <p className="flex items-center gap-1.5 text-micro text-mut">
                    <Clock size={12} strokeWidth={1.9} aria-hidden="true" />
                    {campagne.echeance}
                  </p>
                </LigneCarte>
              );
            })}
          </ul>
        </CarteAdmin>
        )}
      </div>

      {/* ---------------- Derniers animaux et demandes ---------------- */}
      <div className={`mt-4 grid grid-cols-1 gap-4 ${voitDemandes ? "lg:grid-cols-2" : ""}`}>
        {voitAnimaux && (
        <CarteAdmin>
          <EnTeteCarte titre="Derniers animaux ajoutés" lien={routes.adminAnimaux} />
          <ul>
            {derniersAnimaux.map((animal) => (
              <LigneCarte key={animal.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animal.photoPrincipale.src}
                  alt=""
                  className="size-10 shrink-0 rounded-btn bg-soft object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{animal.nom}</p>
                  <p className="truncate text-tiny text-mut">
                    {sousTitreAnimal(animal)} · {animal.commune}
                  </p>
                </div>
                <PiluleStatut ton={TON_ANIMAL[animal.statut]}>
                  {libelleStatut[animal.statut]}
                </PiluleStatut>
                <time
                  dateTime={animal.datePublication}
                  className="hidden shrink-0 text-tiny text-mut sm:block"
                >
                  {formatDate(animal.datePublication)}
                </time>
              </LigneCarte>
            ))}
          </ul>
        </CarteAdmin>
        )}

        {voitDemandes && (
        <CarteAdmin>
          <EnTeteCarte titre="Dernières demandes reçues" lien={routes.adminDemandes} />
          <ul>
            {demandes.map((demande) => (
              <LigneCarte key={demande.id}>
                <Avatar initiales={initiales(`${demande.prenom} ${demande.nom}`)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">
                    {demande.prenom} {demande.nom}
                  </p>
                  <p className="truncate text-tiny text-mut">
                    {demande.animalNom} · {demande.reference}
                  </p>
                </div>
                <PiluleStatut ton={TON_DEMANDE[demande.statut]}>
                  {libelleStatutDemande[demande.statut]}
                </PiluleStatut>
                <time
                  dateTime={demande.createdAt}
                  className="hidden shrink-0 text-tiny text-mut sm:block"
                >
                  {formatDate(demande.createdAt)}
                </time>
              </LigneCarte>
            ))}
          </ul>
        </CarteAdmin>
        )}
      </div>

      {/* ---------------- Activité récente ---------------- */}
      {!perimetreRestreint && journal.length > 0 && (
      <CarteAdmin className="mt-4">
        <EnTeteCarte titre="Activité récente" />
        <ul>
          {journal.map((entree) => (
            <LigneCarte key={entree.id}>
              <span
                aria-hidden="true"
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-soft text-micro font-bold text-pri"
              >
                {initiales(entree.auteurNom)}
              </span>
              <p className="min-w-0 flex-1 text-meta text-mut">
                <strong className="font-semibold text-ink">{entree.auteurNom}</strong>{" "}
                {entree.texte}
              </p>
              <time
                dateTime={entree.creeLe.toISOString()}
                className="shrink-0 text-tiny text-mut"
              >
                {formatDate(entree.creeLe.toISOString().slice(0, 10))}
              </time>
            </LigneCarte>
          ))}
        </ul>
      </CarteAdmin>
      )}
    </>
  );
}
