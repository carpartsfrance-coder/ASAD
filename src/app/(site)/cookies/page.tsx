import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";
import { association, routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Cookies",
  description: `Les traceurs utilisés par le site de l’association ${association.nom}, et pourquoi aucun bandeau de consentement n’est nécessaire.`,
  alternates: { canonical: routes.cookies },
};

export default function PageCookies() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Cookies" }]} />
      </Container>

      <PageHeader
        titre="Cookies et traceurs"
        chapo="Ce site n’utilise aucun cookie publicitaire, aucun traceur tiers et aucun outil de mesure d’audience. Aucun bandeau de consentement n’est donc nécessaire."
      />

      <Container className="pt-6 pb-16 lg:pb-20">
        <Prose>
          <h2>Ce que le site ne fait pas</h2>
          <ul>
            <li>Aucun cookie publicitaire ni de reciblage.</li>
            <li>Aucun outil de mesure d’audience (ni Google Analytics, ni équivalent).</li>
            <li>Aucun bouton de réseau social qui vous piste : nos liens sont de simples liens.</li>
            <li>Aucune revente ni partage de données à des fins commerciales.</li>
          </ul>

          <h2>Le stockage local de votre navigateur</h2>
          <p>
            Une seule information est enregistrée dans votre navigateur : la liste de
            vos <strong>coups de cœur</strong>, quand vous cliquez sur le cœur d’une
            fiche animal. Elle sert uniquement à réafficher vos choix lors de votre
            prochaine visite.
          </p>
          <p>
            Cette information reste sur votre appareil. Elle n’est jamais transmise à
            l’association, ni à qui que ce soit d’autre. Vider les données de site de
            votre navigateur l’efface définitivement.
          </p>

          <h2>Les services tiers</h2>
          <p>
            Lorsque vous cliquez sur un bouton de don, vous quittez ce site pour{" "}
            <strong>HelloAsso</strong>, qui applique sa propre politique de cookies.
            Si un formulaire HelloAsso est intégré à une page, il est chargé depuis
            leurs serveurs et peut déposer ses propres traceurs — dans ce cas, leur
            politique s’applique.
          </p>
          <p>
            La police de caractères du site est hébergée avec le site lui-même :
            aucune requête n’est envoyée à un service externe pour l’afficher.
          </p>

          <h2>En savoir plus</h2>
          <p>
            Le détail des données que vous nous transmettez volontairement figure
            dans la <a href={routes.confidentialite}>politique de confidentialité</a>.
            Pour toute question, écrivez à{" "}
            <a href={`mailto:${association.email}`}>{association.email}</a>.
          </p>
        </Prose>
      </Container>
    </>
  );
}
