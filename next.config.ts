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
    // Formats modernes servis automatiquement par next/image.
    formats: ["image/avif", "image/webp"],
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
