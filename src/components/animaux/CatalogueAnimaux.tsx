"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  PawPrint,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useFavoris } from "@/lib/favoris";
import { AnimalCard } from "@/components/animaux/AnimalCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  CLES_FILTRES,
  FILTRES_VIDES,
  compterFiltresActifs,
  filtrerAnimaux,
  libelleSexe,
  libelleStatut,
  libelleTaille,
  libelleTri,
  libelleTrancheAge,
  type FiltresAnimaux,
} from "@/lib/animaux";
import { routes } from "@/content/site";
import type { Animal } from "@/types";

const PAR_PAGE = 9;

/** Définition des six filtres en pilules, dans l'ordre de la maquette. */
const FILTRES: Array<{
  cle: keyof FiltresAnimaux;
  label: string;
  options: Array<{ valeur: string; label: string }>;
}> = [
  {
    cle: "espece",
    label: "Espèce",
    options: [
      { valeur: "toutes", label: "Toutes" },
      { valeur: "chien", label: "Chien" },
      { valeur: "chat", label: "Chat" },
      { valeur: "autre", label: "Autre" },
    ],
  },
  {
    cle: "sexe",
    label: "Sexe",
    options: [
      { valeur: "tous", label: "Tous" },
      { valeur: "male", label: libelleSexe.male },
      { valeur: "femelle", label: libelleSexe.femelle },
    ],
  },
  {
    cle: "age",
    label: "Âge",
    options: [
      { valeur: "tous", label: "Tous" },
      { valeur: "junior", label: libelleTrancheAge.junior },
      { valeur: "adulte", label: libelleTrancheAge.adulte },
      { valeur: "senior", label: libelleTrancheAge.senior },
    ],
  },
  {
    cle: "taille",
    label: "Taille",
    options: [
      { valeur: "toutes", label: "Toutes" },
      { valeur: "petit", label: libelleTaille.petit },
      { valeur: "moyen", label: libelleTaille.moyen },
      { valeur: "grand", label: libelleTaille.grand },
    ],
  },
  {
    cle: "compatibilite",
    label: "Compatibilité",
    options: [
      { valeur: "toutes", label: "Peu importe" },
      { valeur: "chiens", label: "Avec des chiens" },
      { valeur: "chats", label: "Avec des chats" },
      { valeur: "enfants", label: "Avec des enfants" },
    ],
  },
  {
    cle: "statut",
    label: "Statut",
    options: [
      { valeur: "tous", label: "Tous" },
      { valeur: "a_adopter", label: libelleStatut.a_adopter },
      { valeur: "urgent", label: libelleStatut.urgent },
      { valeur: "reserve", label: libelleStatut.reserve },
      /* Pas d'« Adopté » ici : ces fiches ont leur page, /adoptes. */
    ],
  },
];

const FLECHE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23616B7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "15px",
} as const;

/** Fusionne des filtres partiels d'URL avec les valeurs par défaut. */
function fusionner(partiels?: Partial<FiltresAnimaux>): FiltresAnimaux {
  const fusion = { ...FILTRES_VIDES };
  if (!partiels) return fusion;
  (Object.keys(FILTRES_VIDES) as Array<keyof FiltresAnimaux>).forEach((cle) => {
    const valeur = partiels[cle];
    if (valeur !== undefined && valeur !== "") {
      fusion[cle] = valeur as never;
    }
  });
  return fusion;
}

export function CatalogueAnimaux({
  animaux,
  filtresInitiaux,
  pageInitiale = 1,
}: {
  animaux: Animal[];
  filtresInitiaux?: Partial<FiltresAnimaux>;
  /** Page lue dans l'URL, pour que le retour navigateur la retrouve. */
  pageInitiale?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [filtres, setFiltres] = useState<FiltresAnimaux>(() => fusionner(filtresInitiaux));
  const [page, setPage] = useState(Math.max(1, pageInitiale));
  const [panneauOuvert, setPanneauOuvert] = useState(false);
  const [coupsDeCoeurSeuls, setCoupsDeCoeurSeuls] = useState(false);

  /** Ce que la bénévole tape, avant le délai de grâce. */
  const [saisie, setSaisie] = useState(filtres.recherche);

  const favoris = useFavoris();
  const resultatsRef = useRef<HTMLDivElement>(null);
  const premierRendu = useRef(true);

  /* ------------------------------------------------------------------ */
  /* L'URL est la mémoire de la page : filtres, tri et page y vivent.    */
  /* ------------------------------------------------------------------ */

  const construireUrl = useCallback(
    (etat: FiltresAnimaux, numeroPage: number) => {
      const params = new URLSearchParams();
      (Object.keys(FILTRES_VIDES) as Array<keyof FiltresAnimaux>).forEach((cle) => {
        if (etat[cle] !== FILTRES_VIDES[cle]) params.set(cle, String(etat[cle]));
      });
      if (numeroPage > 1) params.set("page", String(numeroPage));
      const requete = params.toString();
      return (requete ? `${pathname}?${requete}` : pathname) as Route;
    },
    [pathname],
  );

  /**
   * Le retour du navigateur remet les paramètres d'URL dans les props : on
   * réaligne l'état local dessus.
   *
   * Ajustement pendant le rendu plutôt que dans un effet — c'est le motif
   * recommandé par React pour réagir à un changement de props, et il évite
   * un rendu intermédiaire avec l'ancien état.
   */
  const cleUrl = `${JSON.stringify(filtresInitiaux ?? {})}|${pageInitiale}`;
  const [cleSynchronisee, setCleSynchronisee] = useState(cleUrl);

  if (cleUrl !== cleSynchronisee) {
    const suivant = fusionner(filtresInitiaux);
    setCleSynchronisee(cleUrl);
    setFiltres(suivant);
    setSaisie(suivant.recherche);
    setPage(Math.max(1, pageInitiale));
  }

  /* Recherche dynamique : on attend 300 ms de silence avant d'appliquer. */
  useEffect(() => {
    if (saisie === filtres.recherche) return;
    const minuteur = setTimeout(() => {
      const suivant = { ...filtres, recherche: saisie };
      setFiltres(suivant);
      setPage(1);
      router.replace(construireUrl(suivant, 1), { scroll: false });
    }, 300);
    return () => clearTimeout(minuteur);
  }, [saisie, filtres, router, construireUrl]);

  /* ------------------------------------------------------------------ */
  /* Résultats                                                           */
  /* ------------------------------------------------------------------ */

  const resultats = useMemo(() => {
    const filtres_ = filtrerAnimaux(animaux, filtres);
    return coupsDeCoeurSeuls
      ? filtres_.filter((a) => favoris.includes(a.slug))
      : filtres_;
  }, [animaux, filtres, coupsDeCoeurSeuls, favoris]);

  const actifs = useMemo(() => compterFiltresActifs(filtres), [filtres]);

  const disponibles = useMemo(
    () => resultats.filter((a) => a.statut === "a_adopter" || a.statut === "urgent").length,
    [resultats],
  );

  /** Coups de cœur encore proposables ici — les adoptés n'y figurent pas. */
  const nbFavorisVisibles = useMemo(
    () => animaux.filter((a) => favoris.includes(a.slug)).length,
    [animaux, favoris],
  );

  const nbPages = Math.max(1, Math.ceil(resultats.length / PAR_PAGE));
  const pageSure = Math.min(page, nbPages);
  const visibles = resultats.slice((pageSure - 1) * PAR_PAGE, pageSure * PAR_PAGE);

  /* Après un changement de page, on remonte au début des résultats. */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    resultatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pageSure]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                             */
  /* ------------------------------------------------------------------ */

  function appliquer(suivant: FiltresAnimaux, numeroPage = 1) {
    setFiltres(suivant);
    setSaisie(suivant.recherche);
    setPage(numeroPage);
    router.push(construireUrl(suivant, numeroPage), { scroll: false });
  }

  function modifier(cle: keyof FiltresAnimaux, valeur: string) {
    appliquer({ ...filtres, [cle]: valeur });
  }

  function reinitialiser() {
    setCoupsDeCoeurSeuls(false);
    appliquer({ ...FILTRES_VIDES });
  }

  function allerPage(n: number) {
    setPage(n);
    router.push(construireUrl(filtres, n), { scroll: false });
  }

  /** Pastilles des filtres actifs, chacune supprimable. */
  const pastilles = CLES_FILTRES.filter(
    (cle) => filtres[cle] !== FILTRES_VIDES[cle],
  ).map((cle) => {
    const definition = FILTRES.find((f) => f.cle === cle);
    const valeur = String(filtres[cle]);
    const option = definition?.options.find((o) => o.valeur === valeur);
    return {
      cle,
      libelle: definition
        ? `${definition.label} : ${option?.label ?? valeur}`
        : `Recherche : « ${valeur} »`,
    };
  });

  return (
    <div>
      {/* ---------------- Recherche et filtres ---------------- */}
      <section
        aria-label="Rechercher et filtrer les animaux"
        className="rounded-panel bg-white p-4 shadow-stat sm:px-[26px] sm:pt-4 sm:pb-[18px]"
      >
        {/* La recherche s'applique d'elle-même : plus de bouton à chercher. */}
        <div className="relative">
          <label htmlFor="recherche-animal" className="sr-only">
            Rechercher un animal
          </label>
          <Search
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-[17px] -translate-y-1/2 text-mut"
          />
          <input
            id="recherche-animal"
            type="search"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Rechercher un nom, une race, une commune…"
            className="h-[52px] w-full rounded-cta border-[1.4px] border-line bg-white pr-4 pl-[46px] text-nav text-ink transition-colors duration-150 placeholder:text-mut/70 focus:border-acc focus:outline-none"
          />
        </div>

        {/* Écran large : les six menus en clair. */}
        <div className="mt-3 hidden flex-wrap items-center gap-2.5 md:flex">
          {FILTRES.map((filtre) => {
            const valeur = String(filtres[filtre.cle]);
            const actif = valeur !== String(FILTRES_VIDES[filtre.cle]);
            const optionActive = filtre.options.find((o) => o.valeur === valeur);

            return (
              <div key={filtre.cle} className="relative">
                <label htmlFor={`filtre-${filtre.cle}`} className="sr-only">
                  {filtre.label}
                </label>
                <select
                  id={`filtre-${filtre.cle}`}
                  value={valeur}
                  onChange={(e) => modifier(filtre.cle, e.target.value)}
                  style={FLECHE}
                  className={cn(
                    "h-11 cursor-pointer appearance-none rounded-btn border-[1.4px] pr-9 pl-3.5 text-body transition-colors duration-150 focus:outline-none",
                    actif
                      ? "border-acc bg-acc-soft font-semibold text-pri"
                      : "border-line bg-white text-mut hover:border-pri",
                  )}
                >
                  {filtre.options.map((o) => (
                    <option key={o.valeur} value={o.valeur}>
                      {o.valeur === String(FILTRES_VIDES[filtre.cle])
                        ? filtre.label
                        : `${filtre.label} : ${o.label}`}
                    </option>
                  ))}
                </select>
                <span className="sr-only">
                  {actif ? `Filtre actif : ${optionActive?.label}` : ""}
                </span>
              </div>
            );
          })}

        </div>

        {/* Mobile : un seul bouton, qui dit combien de filtres sont posés. */}
        <div className="mt-4 md:hidden">
          <button
            type="button"
            onClick={() => setPanneauOuvert(true)}
            aria-haspopup="dialog"
            aria-expanded={panneauOuvert}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-btn border-[1.4px] text-body font-semibold transition-colors duration-150",
              actifs > 0
                ? "border-acc bg-acc-soft text-pri"
                : "border-line bg-white text-pri hover:border-pri",
            )}
          >
            <SlidersHorizontal size={17} strokeWidth={1.9} aria-hidden="true" />
            Filtres ({actifs})
          </button>
        </div>
      </section>

      {/* ---------------- Filtres posés, retirables un à un ---------------- */}
      {(pastilles.length > 0 || coupsDeCoeurSeuls) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="sr-only">Filtres actifs :</span>

          {coupsDeCoeurSeuls && (
            <button
              type="button"
              onClick={() => setCoupsDeCoeurSeuls(false)}
              className="inline-flex items-center gap-2 rounded-full border-[1.4px] border-acc bg-acc-soft px-3.5 py-1.5 text-mini font-semibold text-pri transition-colors duration-150 hover:bg-white"
            >
              Mes coups de cœur
              <X size={13} strokeWidth={2.4} aria-hidden="true" />
              <span className="sr-only">— retirer ce filtre</span>
            </button>
          )}

          {pastilles.map((pastille) => (
            <button
              key={pastille.cle}
              type="button"
              onClick={() => modifier(pastille.cle, String(FILTRES_VIDES[pastille.cle]))}
              className="inline-flex items-center gap-2 rounded-full border-[1.4px] border-acc bg-acc-soft px-3.5 py-1.5 text-mini font-semibold text-pri transition-colors duration-150 hover:bg-white"
            >
              {pastille.libelle}
              <X size={13} strokeWidth={2.4} aria-hidden="true" />
              <span className="sr-only">— retirer ce filtre</span>
            </button>
          ))}

          <button
            type="button"
            onClick={reinitialiser}
            className="link-underline ml-1 text-mini font-semibold text-acc transition-colors duration-150 hover:text-acc-dark"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* ---------------- Compteur, coups de cœur et tri ---------------- */}
      <div
        ref={resultatsRef}
        id="resultats"
        className="mt-4 flex scroll-mt-28 flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-nav text-mut" role="status" aria-live="polite">
            <strong className="font-bold text-ink">
              {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
            </strong>
            {disponibles > 0 && (
              <>
                {" "}
                — dont {disponibles}{" "}
                {disponibles > 1 ? "animaux" : "animal"} à adopter dès maintenant
              </>
            )}
          </p>

          {/* Retrouver ce qu'on a mis de côté, sans quitter la page. */}
          <button
            type="button"
            onClick={() => {
              setCoupsDeCoeurSeuls((v) => !v);
              setPage(1);
            }}
            aria-pressed={coupsDeCoeurSeuls}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border-[1.4px] px-3.5 text-mini font-semibold transition-colors duration-150",
              coupsDeCoeurSeuls
                ? "border-acc bg-acc-soft text-pri"
                : "border-line bg-white text-mut hover:border-pri hover:text-pri",
            )}
          >
            <Heart
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className={coupsDeCoeurSeuls ? "fill-acc text-acc" : undefined}
            />
            Mes coups de cœur ({nbFavorisVisibles})
          </button>
        </div>

        <div className="relative">
          <label htmlFor="tri-animaux" className="sr-only">
            Trier les résultats
          </label>
          <select
            id="tri-animaux"
            value={filtres.tri}
            onChange={(e) => modifier("tri", e.target.value)}
            style={FLECHE}
            className="h-11 cursor-pointer appearance-none rounded-btn border-[1.4px] border-line bg-white pr-9 pl-3.5 text-body text-mut transition-colors duration-150 hover:border-pri focus:outline-none"
          >
            {(Object.keys(libelleTri) as Array<keyof typeof libelleTri>).map((cle) => (
              <option key={cle} value={cle}>
                Trier : {libelleTri[cle]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------------- Résultats ---------------- */}
      {visibles.length > 0 ? (
        <>
          <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[26px]">
            {visibles.map((animal, index) => (
              <li key={animal.id} className="flex">
                <AnimalCard animal={animal} priorite={index < 3} className="w-full" />
              </li>
            ))}
          </ul>

          {nbPages > 1 && (
            <nav aria-label="Pagination" className="mt-11 flex justify-center">
              <ul className="flex items-center gap-2">
                <li>
                  {pageSure === 1 ? (
                    <span
                      aria-hidden="true"
                      className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri opacity-40"
                    >
                      <ArrowLeft size={17} strokeWidth={1.9} />
                    </span>
                  ) : (
                    <Link
                      href={construireUrl(filtres, pageSure - 1)}
                      scroll={false}
                      onClick={() => allerPage(pageSure - 1)}
                      className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri"
                    >
                      <ArrowLeft size={17} strokeWidth={1.9} aria-hidden="true" />
                      <span className="sr-only">Page précédente</span>
                    </Link>
                  )}
                </li>

                {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <Link
                      href={construireUrl(filtres, n)}
                      scroll={false}
                      onClick={() => allerPage(n)}
                      aria-current={n === pageSure ? "page" : undefined}
                      className={cn(
                        "flex size-[42px] items-center justify-center rounded-btn text-body font-semibold transition-colors duration-150",
                        n === pageSure
                          ? "bg-pri text-white"
                          : "border border-line bg-white text-pri hover:border-pri",
                      )}
                    >
                      {n}
                      <span className="sr-only"> — page {n}</span>
                    </Link>
                  </li>
                ))}

                <li>
                  {pageSure === nbPages ? (
                    <span
                      aria-hidden="true"
                      className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri opacity-40"
                    >
                      <ArrowRight size={17} strokeWidth={1.9} />
                    </span>
                  ) : (
                    <Link
                      href={construireUrl(filtres, pageSure + 1)}
                      scroll={false}
                      onClick={() => allerPage(pageSure + 1)}
                      className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri"
                    >
                      <ArrowRight size={17} strokeWidth={1.9} aria-hidden="true" />
                      <span className="sr-only">Page suivante</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        /* ---------------- Aucun résultat ---------------- */
        <div className="mt-[30px] rounded-panel bg-white px-10 py-16 text-center sm:py-[74px]">
          <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-soft">
            <PawPrint size={44} strokeWidth={0} aria-hidden="true" className="fill-pri opacity-70" />
          </span>
          <h2 className="mt-6 text-title font-extrabold text-ink">
            {coupsDeCoeurSeuls && nbFavorisVisibles === 0
              ? "Vous n’avez pas encore de coup de cœur"
              : "Aucun animal ne correspond à ces critères"}
          </h2>
          <p className="mx-auto mt-3 max-w-[470px] text-nav leading-[1.7] text-mut">
            {coupsDeCoeurSeuls && nbFavorisVisibles === 0 ? (
              <>
                Touchez le cœur en haut d’une photo pour mettre un animal de côté.
                Vous le retrouverez ici, même après avoir fermé la page.
              </>
            ) : (
              <>
                Nos protégés changent régulièrement et de nouvelles fiches sont
                publiées chaque semaine. Élargissez votre recherche, ou dites-nous
                ce que vous cherchez : nous vous préviendrons.
              </>
            )}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={reinitialiser} variante="primaire" taille="md">
              {coupsDeCoeurSeuls ? "Voir tous les animaux" : "Réinitialiser les filtres"}
            </Button>
            <Button href={routes.contact} variante="contourAccent" taille="md">
              Être alerté par e-mail
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- Panneau des filtres, sur mobile ---------------- */}
      {panneauOuvert && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer les filtres"
            tabIndex={-1}
            onClick={() => setPanneauOuvert(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-pri/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtrer les animaux"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-panel bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-card font-bold text-ink">Filtres</h2>
              <button
                type="button"
                onClick={() => setPanneauOuvert(false)}
                className="flex size-11 items-center justify-center rounded-full text-pri transition-colors duration-150 hover:bg-acc-soft"
              >
                <X size={22} strokeWidth={1.9} aria-hidden="true" />
                <span className="sr-only">Fermer les filtres</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {FILTRES.map((filtre) => (
                <div key={filtre.cle}>
                  <label
                    htmlFor={`panneau-${filtre.cle}`}
                    className="block text-meta font-semibold text-ink"
                  >
                    {filtre.label}
                  </label>
                  <select
                    id={`panneau-${filtre.cle}`}
                    value={String(filtres[filtre.cle])}
                    onChange={(e) => modifier(filtre.cle, e.target.value)}
                    style={FLECHE}
                    className="mt-1.5 h-12 w-full cursor-pointer appearance-none rounded-btn border-[1.4px] border-line bg-white pr-9 pl-3.5 text-body text-ink transition-colors duration-150 focus:border-acc focus:outline-none"
                  >
                    {filtre.options.map((o) => (
                      <option key={o.valeur} value={o.valeur}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => setPanneauOuvert(false)}
                variante="primaire"
                taille="md"
                pleineLargeur
              >
                Voir les {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
              </Button>
              {actifs > 0 && (
                <Button
                  type="button"
                  onClick={() => {
                    reinitialiser();
                    setPanneauOuvert(false);
                  }}
                  variante="contour"
                  taille="md"
                  pleineLargeur
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
