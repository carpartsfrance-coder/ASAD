import type { Metadata } from "next";
import { AdoptionSection } from "@/components/accueil/AdoptionSection";
import { HelpSection } from "@/components/accueil/HelpSection";
import { Hero } from "@/components/accueil/Hero";
import { StatsBand } from "@/components/accueil/StatsBand";
import { TestimonialPanel } from "@/components/accueil/TestimonialPanel";
import { UrgencesBand } from "@/components/accueil/UrgencesBand";
import { association } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: association.nomComplet },
  description:
    "ASAD recueille, soigne et protège les animaux abandonnés. Découvrez les chiens et chats à adopter, soutenez nos urgences vétérinaires ou devenez famille d’accueil.",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default function PageAccueil() {
  return (
    <>
      <Hero />
      <StatsBand />
      <AdoptionSection />
      <UrgencesBand />
      <HelpSection />
      <TestimonialPanel />
    </>
  );
}
