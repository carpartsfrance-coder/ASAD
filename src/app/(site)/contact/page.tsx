import type { Metadata } from "next";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FacebookIcon, InstagramIcon } from "@/components/brand/SocialIcons";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { questionsFrequentes } from "@/content/faq";
import { association, reseaux, routes } from "@/content/site";
import type { QuestionFrequente } from "@/types";

export const metadata: Metadata = {
  title: "Contact et questions fréquentes",
  description:
    "Une question sur une adoption, un don ou un signalement ? Contactez l’association ASAD, dans l’Hérault et le Gard, ou consultez les réponses aux questions les plus posées.",
  alternates: { canonical: routes.contact },
};

const RUBRIQUES: Array<{ cle: QuestionFrequente["categorie"]; titre: string }> = [
  { cle: "adoption", titre: "Adopter" },
  { cle: "famille-accueil", titre: "Famille d’accueil" },
  { cle: "dons", titre: "Dons" },
  { cle: "association", titre: "L’association" },
];

export default function PageContact() {
  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questionsFrequentes.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.reponse },
    })),
  };

  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Contact et FAQ" }]} />
      </Container>

      <PageHeader
        surtitre="Contact"
        titre="Nous contacter"
        chapo="Écrivez-nous ou appelez-nous : l’association est entièrement bénévole et répond dès que possible, généralement sous 72 heures. Beaucoup de réponses se trouvent déjà dans les questions fréquentes, plus bas."
      />

      <Container className="pt-10">
        {/* Deux façons de nous joindre, et seulement deux. */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col rounded-panel bg-white p-7 shadow-card">
            <Mail size={26} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
            <h2 className="mt-4 text-card font-bold text-ink">Par e-mail</h2>
            <p className="mt-2 text-meta leading-[1.65] text-mut">
              Le plus simple pour une question détaillée, ou pour joindre des
              photos.
            </p>
            <p className="mt-4 text-body font-semibold break-words text-ink">
              {association.email}
            </p>
            <Button
              href={`mailto:${association.email}`}
              variante="primaire"
              taille="md"
              className="mt-4 self-start"
            >
              Écrire un message
            </Button>
          </div>

          <div className="flex flex-col rounded-panel bg-white p-7 shadow-card">
            <Phone size={26} strokeWidth={1.7} aria-hidden="true" className="text-acc" />
            <h2 className="mt-4 text-card font-bold text-ink">Par téléphone</h2>
            <p className="mt-2 text-meta leading-[1.65] text-mut">
              Pour une situation urgente ou si vous préférez en parler de vive
              voix.
            </p>
            <p className="mt-4 text-body font-semibold text-ink">
              {association.telephone}
            </p>
            <Button
              href={`tel:${association.telephoneLien}`}
              variante="contourAccent"
              taille="md"
              className="mt-4 self-start"
            >
              Appeler l’association
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:gap-14">
          <div className="rounded-panel border border-line p-6">
            <h2 className="text-card font-bold text-ink">Où nous trouver</h2>
            <div className="mt-4 flex items-start gap-3 text-body text-mut">
              <MapPin size={18} strokeWidth={1.7} aria-hidden="true" className="mt-0.5 shrink-0 text-acc" />
              <address className="not-italic">
                {association.adresse.voie}
                <br />
                {association.adresse.codePostal} {association.adresse.ville}
                <br />
                Intervention sur l’{association.territoire}
              </address>
            </div>
            <p className="mt-5 text-meta leading-[1.65] text-mut">
              L’association ne dispose pas de refuge ouvert au public : les
              rencontres se font sur rendez-vous, au domicile des familles
              d’accueil.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="rounded-panel bg-warm p-6">
              <h2 className="text-card font-bold text-ink">Nous suivre</h2>
              <ul className="mt-4 flex gap-3">
                <li>
                  <SmartLink
                    href={reseaux.facebook}
                    className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-pri transition-colors duration-150 hover:bg-acc-soft"
                  >
                    <FacebookIcon size={18} />
                    <span className="sr-only">{association.nom} sur Facebook</span>
                  </SmartLink>
                </li>
                <li>
                  <SmartLink
                    href={reseaux.instagram}
                    className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-pri transition-colors duration-150 hover:bg-acc-soft"
                  >
                    <InstagramIcon size={18} />
                    <span className="sr-only">{association.nom} sur Instagram</span>
                  </SmartLink>
                </li>
              </ul>
            </div>

            <div className="rounded-panel border border-line p-6">
              <h2 className="text-body font-bold text-ink">Urgence animale</h2>
              <p className="mt-2 text-meta leading-[1.65] text-mut">
                Pour un animal gravement blessé, contactez directement un
                vétérinaire. Pour tout autre cas, utilisez notre{" "}
                <SmartLink
                  href={routes.signaler}
                  className="link-underline font-semibold text-acc hover:text-acc-dark"
                >
                  formulaire de signalement
                </SmartLink>
                .
              </p>
            </div>
          </aside>
        </div>
      </Container>

      {/* ---------------- Questions fréquentes ---------------- */}
      <Container as="section" id="faq" aria-labelledby="titre-faq" className="pt-20 pb-16 lg:pb-20">
        <SectionHeading
          id="titre-faq"
          titre="Questions fréquentes"
          sousTitre="Adoption, famille d’accueil, dons, fonctionnement : les réponses aux questions qui reviennent le plus."
          align="gauche"
        />

        <div className="mt-10 max-w-[820px] space-y-10">
          {RUBRIQUES.map((rubrique) => {
            const questions = questionsFrequentes.filter((q) => q.categorie === rubrique.cle);
            if (questions.length === 0) return null;

            return (
              <section key={rubrique.cle} aria-labelledby={`faq-${rubrique.cle}`}>
                <h3 id={`faq-${rubrique.cle}`} className="text-title font-extrabold text-ink">
                  {rubrique.titre}
                </h3>

                <ul className="mt-5 space-y-3">
                  {questions.map((question) => (
                    <li key={question.id}>
                      <details className="group rounded-card bg-white p-5 shadow-soft sm:p-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-card font-bold text-ink [&::-webkit-details-marker]:hidden">
                          {question.question}
                          <ChevronDown
                            size={20}
                            strokeWidth={2}
                            aria-hidden="true"
                            className="shrink-0 text-acc transition-transform duration-200 group-open:rotate-180"
                          />
                        </summary>
                        <p className="mt-3.5 text-quote leading-[1.72] text-mut">
                          {question.reponse}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
    </>
  );
}
