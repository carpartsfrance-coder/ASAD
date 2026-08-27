import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/brand/Logo";
import { routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function PageIntrouvable() {
  return (
    <Container className="flex flex-col items-center py-24 text-center lg:py-32">
      <Logo />
      <p className="mt-10 text-tiny font-bold tracking-[0.2em] uppercase text-acc">
        Erreur 404
      </p>
      <h1 className="mt-4 max-w-[620px] text-[32px] leading-tight font-extrabold tracking-[-0.022em] text-ink sm:text-[42px]">
        Cette page a filé comme un chat
      </h1>
      <p className="mt-5 max-w-[480px] text-[16.5px] leading-[1.72] text-mut">
        La page que vous cherchez n’existe pas ou a été déplacée. Nos protégés,
        eux, sont toujours là.
      </p>
      <div className="mt-9 flex flex-col gap-4 sm:flex-row">
        <Button href={routes.animaux} variante="primaire" taille="md">
          Voir les animaux
        </Button>
        <Button href={routes.accueil} variante="contour" taille="md">
          Retour à l’accueil
        </Button>
      </div>
    </Container>
  );
}
