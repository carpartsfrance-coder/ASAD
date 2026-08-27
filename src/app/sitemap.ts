import type { MetadataRoute } from "next";
import { routes, siteUrl } from "@/content/site";
import { animauxPublies } from "@/lib/donnees/animaux";

/**
 * Généré à chaque requête, jamais à la compilation.
 *
 * Deux raisons : le plan du site doit refléter les animaux publiés à l'instant
 * T, et surtout la compilation ne doit jamais dépendre de la base — au premier
 * déploiement, les tables n'existent pas encore quand le build tourne.
 */
export const dynamic = "force-dynamic";

/** Plan du site : pages fixes + fiches animaux et actualités. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();

  const pagesFixes: MetadataRoute.Sitemap = (
    [
      { url: routes.accueil, priority: 1, changeFrequency: "weekly" },
      { url: routes.animaux, priority: 0.9, changeFrequency: "daily" },
      { url: routes.urgences, priority: 0.9, changeFrequency: "daily" },
      { url: routes.don, priority: 0.8, changeFrequency: "monthly" },
      { url: routes.rejoindre, priority: 0.8, changeFrequency: "monthly" },
      { url: routes.aider, priority: 0.7, changeFrequency: "monthly" },
      { url: routes.association, priority: 0.7, changeFrequency: "monthly" },
      { url: routes.livreOr, priority: 0.6, changeFrequency: "weekly" },
      { url: routes.signaler, priority: 0.6, changeFrequency: "yearly" },
      { url: routes.contact, priority: 0.6, changeFrequency: "yearly" },
      { url: routes.mentions, priority: 0.2, changeFrequency: "yearly" },
      { url: routes.confidentialite, priority: 0.2, changeFrequency: "yearly" },
      { url: routes.cookies, priority: 0.2, changeFrequency: "yearly" },
    ] as const
  ).map((page) => ({
    ...page,
    url: `${siteUrl}${page.url}`,
    lastModified: maintenant,
  }));

  /**
   * Si la base est indisponible, on sert quand même le plan des pages fixes
   * plutôt que de renvoyer une erreur aux moteurs de recherche.
   */
  let fichesAnimaux: MetadataRoute.Sitemap = [];
  try {
    fichesAnimaux = (await animauxPublies()).map((animal) => ({
      url: `${siteUrl}${routes.animal(animal.slug)}`,
      lastModified: new Date(animal.datePublication),
      changeFrequency: "weekly",
      priority: animal.statut === "adopte" ? 0.4 : 0.8,
    }));
  } catch (erreur) {
    console.error(
      "[ASAD] Plan du site : les fiches animaux n'ont pas pu être lues.",
      erreur,
    );
  }

  return [...pagesFixes, ...fichesAnimaux];
}
