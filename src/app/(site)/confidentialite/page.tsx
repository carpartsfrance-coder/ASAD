import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";
import { association, routes } from "@/content/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment l’association ${association.nom} collecte, utilise et conserve vos données personnelles.`,
  alternates: { canonical: routes.confidentialite },
};

export default function PageConfidentialite() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Politique de confidentialité" }]} />
      </Container>

      <PageHeader
        titre="Politique de confidentialité"
        chapo="Cette page décrit les données que l’association collecte via ce site, l’usage qui en est fait, leur durée de conservation et la façon d’exercer vos droits."
      />

      <Container className="pt-6 pb-16 lg:pb-20">
        <Prose>
          <h2>Responsable de traitement</h2>
          <p>
            {association.nomComplet}, {association.adresse.voie},{" "}
            {association.adresse.codePostal} {association.adresse.ville}. Contact :{" "}
            <a href={`mailto:${association.email}`}>{association.email}</a>.
          </p>

          <h2>Données collectées et finalités</h2>
          <p>
            Le site ne collecte aucune donnée à votre insu. Les seules données
            recueillies sont celles que vous saisissez volontairement dans les
            formulaires :
          </p>
          <ul>
            <li>
              <strong>Demande d’adoption</strong> — identité, coordonnées, commune et
              code postal, tranche d’âge, logement, composition du foyer, animaux
              présents, temps d’absence, expérience, garde pendant les vacances,
              activité envisagée et motivation. Finalité : instruire la demande et
              vérifier l’adéquation entre votre foyer et l’animal.
            </li>
            <li>
              <strong>Candidature famille d’accueil</strong> — identité, coordonnées,
              logement, espèces et durée d’accueil possibles. Finalité : étudier la
              candidature et proposer un animal adapté.
            </li>
            <li>
              <strong>Candidature bénévole</strong> — identité, coordonnées, missions
              souhaitées et disponibilités. Finalité : proposer des missions
              correspondantes.
            </li>
            <li>
              <strong>Signalement d’un animal</strong> — identité, coordonnées, lieu
              et description de la situation. Finalité : organiser l’intervention.
            </li>
            <li>
              <strong>Message de contact</strong> — identité, coordonnées, sujet et
              message. Finalité : répondre à la demande.
            </li>
            <li>
              <strong>Livre d’or</strong> — nom affiché, ville, adresse e-mail et
              message. Seuls le nom affiché, la ville et le message sont rendus
              publics, après relecture. Votre adresse e-mail n’est jamais publiée.
            </li>
            <li>
              <strong>Newsletter</strong> — adresse e-mail uniquement. Finalité :
              envoyer les actualités de l’association.
            </li>
          </ul>

          <h2>Base légale</h2>
          <p>
            Les traitements reposent sur votre <strong>consentement</strong>,
            recueilli par une case à cocher explicite avant tout envoi, et sur
            l’<strong>intérêt légitime</strong> de l’association à assurer le suivi
            des animaux qu’elle place.
          </p>

          <h2>Destinataires</h2>
          <p>
            Vos informations sont reçues par les bénévoles habilités de
            l’association. Elles ne sont ni vendues, ni cédées, ni utilisées à des
            fins publicitaires. Elles peuvent être transmises aux services compétents
            (mairie, fourrière, vétérinaire) lorsqu’un signalement l’exige.
          </p>
          <p>
            Au sein de l’association, l’accès est limité : un bénévole ne consulte
            que les dossiers qui lui sont attribués.
          </p>

          <h2>Durées de conservation</h2>
          <ul>
            <li>Demandes d’adoption : 12 mois après le dernier échange, 3 ans en cas d’adoption (suivi contractuel).</li>
            <li>Candidatures famille d’accueil et bénévolat : 12 mois après le dernier échange, ou la durée de la collaboration.</li>
            <li>Messages de contact : 12 mois après la dernière réponse.</li>
            <li>Signalements : 24 mois, pour le suivi de l’animal concerné.</li>
            <li>Livre d’or : les messages publiés restent en ligne jusqu’à votre demande de retrait ; les messages refusés sont supprimés sous 3 mois.</li>
            <li>Newsletter : jusqu’à votre désinscription.</li>
          </ul>

          <h2>Vos droits</h2>
          <p>
            Vous disposez d’un droit d’accès, de rectification, d’effacement, de
            limitation, d’opposition et de portabilité de vos données, ainsi que du
            droit de retirer votre consentement à tout moment. Pour l’exercer,
            écrivez à <a href={`mailto:${association.email}`}>{association.email}</a>.
          </p>
          <p>
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas
            respectés, vous pouvez adresser une réclamation à la CNIL —{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            .
          </p>

          <h2>Cookies et mesure d’audience</h2>
          <p>
            Ce site ne dépose <strong>aucun cookie publicitaire</strong> ni traceur
            tiers. Le détail figure sur la page{" "}
            <a href={routes.cookies}>Cookies</a>.
          </p>

          <h2>Paiements et dons</h2>
          <p>
            Les dons sont traités par HelloAsso, qui agit comme responsable de
            traitement pour les données de paiement. L’association n’a accès à aucune
            coordonnée bancaire.
          </p>

          <h2>Sécurité</h2>
          <p>
            Les échanges avec ce site sont chiffrés (HTTPS). L’accès aux demandes
            reçues est limité aux bénévoles qui en ont besoin pour leur mission.
          </p>

          <h2>Modifications</h2>
          <p>
            Cette politique peut évoluer. Toute modification substantielle sera
            signalée sur cette page. Voir également les{" "}
            <a href={routes.mentions}>mentions légales</a>.
          </p>
        </Prose>
      </Container>
    </>
  );
}
