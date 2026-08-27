import type { Metadata } from "next";
import { Heart, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { lienDon, montantsDon } from "@/content/aider";
import { pageDon } from "@/content/pages";
import { helloAsso, routes } from "@/content/site";
import { formatEuros } from "@/lib/format";

export const metadata: Metadata = {
  title: "Faire un don",
  description:
    "Soutenez ASAD par un don ponctuel ou mensuel via HelloAsso. Vos dons financent les soins vétérinaires, la nourriture et les sorties de fourrière.",
  alternates: { canonical: routes.don },
};

export default function PageFaireUnDon() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb
          maillons={[
            { label: "Faire un don" },
          ]}
        />
      </Container>

      <PageHeader
        surtitre="Dons"
        titre={pageDon.titre}
        chapo={pageDon.chapo}
        photo={pageDon.photo}
      >
        <div className="flex flex-wrap gap-4">
          <Button
            href={helloAsso.don}
            externe
            variante="accent"
            taille="md"
            icone={<Heart size={18} strokeWidth={1.8} aria-hidden="true" />}
          >
            Faire un don
          </Button>
          <Button href={helloAsso.adhesion} externe variante="contour" taille="md">
            Adhérer à l’association
          </Button>
        </div>
      </PageHeader>

      {/* Montants suggérés — chaque bouton ouvre HelloAsso */}
      <Container className="pt-14 lg:pt-16">
        <SectionHeading
          titre="Ce que votre don permet"
          sousTitre="Chaque montant ouvre le formulaire sécurisé HelloAsso, déjà pré-rempli."
          align="gauche"
        />
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {montantsDon.map((palier) => (
            <li key={palier.montant} className="flex">
              <SmartLink
                href={lienDon(palier.montant)}
                externe
                className="group flex w-full flex-col rounded-card bg-white p-6 shadow-soft transition-shadow duration-200 hover:shadow-[0_10px_28px_rgba(20,32,24,.11)]"
              >
                <span className="text-[30px] font-extrabold text-pri">
                  {formatEuros(palier.montant)}
                </span>
                <span className="mt-2 flex-1 text-body leading-[1.6] text-mut">
                  {palier.effet}
                </span>
                <span className="link-underline mt-4 inline-block text-body font-semibold text-acc group-hover:text-acc-dark">
                  Je donne {formatEuros(palier.montant)}
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </Container>

      {/* Formulaire HelloAsso intégré, si l'URL d'iframe est configurée */}
      {helloAsso.iframe && (
        <Container className="pt-14">
          <SectionHeading titre="Donner directement ici" align="gauche" />
          <div className="mt-6 overflow-hidden rounded-panel bg-white shadow-card">
            <iframe
              src={helloAsso.iframe}
              title="Formulaire de don HelloAsso"
              className="h-[750px] w-full border-0"
              loading="lazy"
            />
          </div>
        </Container>
      )}

      <Container className="pt-14 pb-16 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <section
            aria-labelledby="titre-affectation"
            className="rounded-panel bg-warm p-7 sm:p-8"
          >
            <h2 id="titre-affectation" className="text-title font-extrabold text-ink">
              Où va votre don
            </h2>
            <dl className="mt-6 space-y-4">
              {pageDon.affectation.map((ligne) => (
                <div key={ligne.poste} className="flex items-baseline justify-between gap-4">
                  <dt className="text-body text-mut">{ligne.poste}</dt>
                  <dd className="text-card font-extrabold text-pri">{ligne.part}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="titre-securite"
            className="rounded-panel bg-white p-7 shadow-soft sm:p-8"
          >
            <h2
              id="titre-securite"
              className="flex items-center gap-2.5 text-title font-extrabold text-ink"
            >
              <ShieldCheck size={24} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
              Un paiement sécurisé
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-mut">
              Les dons sont encaissés par HelloAsso, plateforme française de
              paiement dédiée aux associations. ASAD n’a accès à aucune donnée
              bancaire : le site ne traite ni ne conserve de moyen de paiement.
            </p>
            <p className="mt-4 text-[16px] leading-[1.7] text-mut">
              Un reçu de paiement vous est adressé automatiquement par e-mail. À
              ce jour, l’association n’est pas habilitée à délivrer de reçu
              ouvrant droit à une réduction d’impôt.
            </p>
            <SmartLink
              href={helloAsso.page}
              externe
              className="link-underline mt-5 inline-block text-body font-semibold text-acc hover:text-acc-dark"
            >
              Voir notre page HelloAsso
            </SmartLink>
          </section>
        </div>
      </Container>
    </>
  );
}
