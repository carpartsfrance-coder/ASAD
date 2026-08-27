import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { association, reseaux, siteUrl } from "@/content/site";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: association.nomComplet,
    template: `%s | ${association.nom}`,
  },
  description: association.description,
  applicationName: association.nom,
  keywords: [
    "protection animale",
    "adoption chien",
    "adoption chat",
    "famille d’accueil",
    "association animaux",
    "don association animale",
    "bénévolat animaux",
  ],
  authors: [{ name: association.nomComplet }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: association.nom,
    title: association.nomComplet,
    description: association.description,
    images: [
      {
        url: "/images/hero-chien-chat.jpg",
        width: 1400,
        height: 1340,
        alt: "Un chien et un chat recueillis par l’association ASAD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: association.nomComplet,
    description: association.description,
    images: ["/images/hero-chien-chat.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

/** Données structurées de l'association (schema.org). */
const donneesStructurees = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: association.nomComplet,
  alternateName: association.nom,
  legalName: association.signification,
  url: siteUrl,
  description: association.description,
  email: association.email,
  telephone: association.telephoneLien,
  logo: `${siteUrl}/marque/asad-complet.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: association.adresse.voie,
    postalCode: association.adresse.codePostal,
    addressLocality: association.adresse.ville,
    addressCountry: "FR",
  },
  sameAs: [reseaux.facebook, reseaux.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className="bg-canvas font-sans text-ink antialiased">
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
        />
      </body>
    </html>
  );
}
