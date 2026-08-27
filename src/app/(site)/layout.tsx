import { PisteDePattes } from "@/components/ui/PisteDePattes";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { configSite } from "@/lib/donnees/config-site";

/** Coquille du site public : barre d'aide, en-tête, contenu, pied de page. */
export default async function LayoutSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* Les liens et coordonnées viennent de la base : les modifier depuis le
     back-office suffit, sans remise en ligne. */
  const config = await configSite();

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-[9px] focus:bg-pri focus:px-5 focus:py-3 focus:text-body focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>

      <TopBar />
      <Header lienDon={config.liens.don} />

      <main id="contenu">{children}</main>

      <Footer config={config} />

      {/* Décor : le back-office n'a pas ce gabarit, il n'en hérite donc pas. */}
      <PisteDePattes />
    </>
  );
}
