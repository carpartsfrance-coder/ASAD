import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Le dossier du projet est la racine : sans cela, Next.js remonte jusqu'au
   * répertoire personnel à cause d'un `package-lock.json` qui s'y trouve.
   */
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  images: {
    /**
     * WebP seulement, pas d'AVIF.
     *
     * L'AVIF pèse ~40 % de moins mais coûte 3 à 4 fois plus de temps
     * processeur à fabriquer. Sur une petite instance (0,5 cœur), c'est ce
     * qui rendait l'affichage des photos lent à la première visite.
     */
    formats: ["image/webp"],

    /**
     * Chaque largeur demandée déclenche un encodage distinct. Les photos du
     * site font 900 px de côté et ne s'affichent jamais au-delà de ~700 px :
     * cette liste réduite évite de fabriquer des variantes que personne ne
     * regarde, sans changer ce que voit le visiteur.
     */
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384],

    /**
     * Durée de conservation d'une image déjà fabriquée (30 jours).
     * Par défaut Next la réencode toutes les 4 heures, ce qui n'a aucun sens
     * pour des photos qui ne changent pas.
     *
     * ⚠️ Si vous remplacez une photo de `public/images/`, donnez-lui un nom
     * différent : sinon les visiteurs déjà venus verront l'ancienne pendant
     * 30 jours. Les photos ajoutées depuis le back-office n'ont pas ce
     * problème, leur adresse est unique.
     */
    minimumCacheTTL: 60 * 60 * 24 * 30,

    /**
     * Photos hébergées en dehors du projet (CDN d'un futur back-office).
     * Ajouter ici les domaines autorisés, par exemple `cdn.sanity.io`.
     */
    remotePatterns: [],
  },

  // Ne pas exposer la version de Next.js dans les en-têtes de réponse.
  poweredByHeader: false,
};

export default nextConfig;
