import type { MetadataRoute } from "next";
import { routes, siteUrl } from "@/content/site";
import { animauxPublies } from "@/lib/donnees/animaux";

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

  const fichesAnimaux: MetadataRoute.Sitemap = (await animauxPublies()).map((animal) => ({
    url: `${siteUrl}${routes.animal(animal.slug)}`,
    lastModified: new Date(animal.datePublication),
    changeFrequency: "weekly",
    priority: animal.statut === "adopte" ? 0.4 : 0.8,
  }));


  return [...pagesFixes, ...fichesAnimaux];
}
