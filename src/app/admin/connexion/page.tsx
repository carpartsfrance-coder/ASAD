import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FormulaireConnexion } from "@/components/admin/FormulaireConnexion";
import { association, routes } from "@/content/site";
import { utilisateurCourant } from "@/lib/auth/garde";
import { auMoinsUnCompte } from "@/lib/auth/utilisateurs";

export const metadata: Metadata = {
  title: "Connexion à l’administration",
  robots: { index: false, follow: false },
};

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Déjà connecté : inutile de redemander.
  if (await utilisateurCourant()) redirect(routes.admin);

  const params = await searchParams;
  const sessionExpiree = params.session === "expiree";
  const suite = typeof params.suite === "string" ? params.suite : undefined;
  const compteConfigure = await auMoinsUnCompte();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Panneau de gauche */}
      <div className="hidden w-[44%] flex-col bg-pri p-10 lg:flex lg:px-[46px] lg:pt-10 lg:pb-11">
        <Logo variante="blanc" taille="footer" />

        <h2 className="mt-10 max-w-[420px] text-[30px] leading-[1.18] font-extrabold text-white">
          L’espace des bénévoles d’{association.nom}
        </h2>
        <p className="mt-4 max-w-[420px] text-body leading-[1.7] text-white/72">
          Publiez les fiches animaux, suivez les demandes d’adoption, modérez le
          livre d’or et pilotez les collectes d’urgence.
        </p>

        <div className="relative mt-8 flex-1 overflow-hidden rounded-card bg-white/10">
          <Image
            src="/images/pages/admin-connexion.jpg"
            alt="Bénévoles de l’association au travail auprès des animaux"
            fill
            sizes="44vw"
            className="object-cover"
            priority
          />
        </div>

        <p className="mt-6 flex items-center gap-2.5 text-tiny text-white/60">
          <Lock size={15} strokeWidth={1.8} aria-hidden="true" />
          Connexion chiffrée. Un bénévole ne voit que les dossiers qui lui sont attribués.
        </p>
      </div>

      {/* Formulaire */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <FormulaireConnexion sessionExpiree={sessionExpiree} suite={suite} />

          {!compteConfigure && (
            <p className="mt-6 rounded-[10px] border border-line bg-white p-4 text-tiny leading-[1.7] text-mut">
              <strong className="font-semibold text-ink">
                Aucun compte n’est encore configuré.
              </strong>{" "}
              Créez le premier depuis un terminal :
              <code className="mt-2 block rounded bg-subtil px-2 py-1.5 font-mono text-[11px] text-pri">
                npm run auth:demarrage
              </code>
            </p>
          )}

          <p className="mt-8 text-center text-tiny text-mut">
            <a href={routes.accueil} className="link-underline hover:text-pri">
              Retour au site public
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
