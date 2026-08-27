"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, PawPrint, Search } from "lucide-react";
import { AnimalCard } from "@/components/animaux/AnimalCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
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
      { valeur: "adopte", label: libelleStatut.adopte },
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
}: {
  animaux: Animal[];
  filtresInitiaux?: Partial<FiltresAnimaux>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filtres, setFiltres] = useState<FiltresAnimaux>(() => fusionner(filtresInitiaux));
  const [page, setPage] = useState(1);

  const resultats = useMemo(() => filtrerAnimaux(animaux, filtres), [animaux, filtres]);
  const actifs = useMemo(() => compterFiltresActifs(filtres), [filtres]);

  const disponibles = useMemo(
    () => resultats.filter((a) => a.statut === "a_adopter" || a.statut === "urgent").length,
    [resultats],
  );

  const nbPages = Math.max(1, Math.ceil(resultats.length / PAR_PAGE));
  const pageSure = Math.min(page, nbPages);
  const visibles = resultats.slice((pageSure - 1) * PAR_PAGE, pageSure * PAR_PAGE);

  /* L'URL reflète les filtres : le lien reste partageable. */
  useEffect(() => {
    const params = new URLSearchParams();
    (Object.keys(FILTRES_VIDES) as Array<keyof FiltresAnimaux>).forEach((cle) => {
      if (filtres[cle] !== FILTRES_VIDES[cle]) params.set(cle, String(filtres[cle]));
    });
    const requete = params.toString();
    router.replace(requete ? `${pathname}?${requete}` : pathname, { scroll: false });
  }, [filtres, pathname, router]);

  function modifier(cle: keyof FiltresAnimaux, valeur: string) {
    setFiltres((precedent) => ({ ...precedent, [cle]: valeur }));
    setPage(1);
  }

  function reinitialiser() {
    setFiltres({ ...FILTRES_VIDES });
    setPage(1);
  }

  return (
    <div>
      {/* ---------------- Recherche et filtres ---------------- */}
      <section
        aria-label="Rechercher et filtrer les animaux"
        className="rounded-panel bg-white p-5 shadow-stat sm:px-[26px] sm:pt-[22px] sm:pb-6"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
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
              value={filtres.recherche}
              onChange={(e) => modifier("recherche", e.target.value)}
              placeholder="Rechercher un nom, une race, une commune…"
              className="h-[52px] w-full rounded-cta border-[1.4px] border-line bg-white pr-4 pl-[46px] text-nav text-ink transition-colors duration-150 placeholder:text-mut/70 focus:border-acc focus:outline-none"
            />
          </div>
          <Button type="submit" variante="primaire" taille="md" className="h-[52px] shrink-0">
            Rechercher
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
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

          {actifs > 0 && (
            <button
              type="button"
              onClick={reinitialiser}
              className="link-underline inline-flex items-center gap-2 text-body font-semibold text-acc transition-colors duration-150 hover:text-acc-dark"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      {/* ---------------- Compteur et tri ---------------- */}
      <div className="mt-[26px] flex flex-wrap items-center justify-between gap-4">
        <p className="text-nav text-mut" role="status" aria-live="polite">
          <strong className="font-bold text-ink">
            {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
          </strong>
          {disponibles > 0 && (
            <> — dont {disponibles} animal{disponibles > 1 ? "aux" : ""} à adopter dès maintenant</>
          )}
        </p>

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
          <ul className="mt-[30px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[26px]">
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
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pageSure === 1}
                    className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri disabled:opacity-40 disabled:hover:border-line"
                  >
                    <ArrowLeft size={17} strokeWidth={1.9} aria-hidden="true" />
                    <span className="sr-only">Page précédente</span>
                  </button>
                </li>

                {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === pageSure ? "page" : undefined}
                      className={cn(
                        "size-[42px] rounded-btn text-body font-semibold transition-colors duration-150",
                        n === pageSure
                          ? "bg-pri text-white"
                          : "border border-line bg-white text-pri hover:border-pri",
                      )}
                    >
                      {n}
                      <span className="sr-only"> — page {n}</span>
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(nbPages, p + 1))}
                    disabled={pageSure === nbPages}
                    className="flex size-[42px] items-center justify-center rounded-btn border border-line bg-white text-pri transition-colors duration-150 hover:border-pri disabled:opacity-40 disabled:hover:border-line"
                  >
                    <ArrowRight size={17} strokeWidth={1.9} aria-hidden="true" />
                    <span className="sr-only">Page suivante</span>
                  </button>
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
            Aucun animal ne correspond à ces critères
          </h2>
          <p className="mx-auto mt-3 max-w-[470px] text-nav leading-[1.7] text-mut">
            Nos protégés changent régulièrement et de nouvelles fiches sont publiées
            chaque semaine. Élargissez votre recherche, ou dites-nous ce que vous
            cherchez : nous vous préviendrons.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={reinitialiser} variante="primaire" taille="md">
              Réinitialiser les filtres
            </Button>
            <Button href={routes.contact} variante="contourAccent" taille="md">
              Être alerté par e-mail
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
