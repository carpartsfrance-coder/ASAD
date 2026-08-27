import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";
import { association, routes, siteUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site de l’association ${association.nom}.`,
  alternates: { canonical: routes.mentions },
  robots: { index: true, follow: true },
};

export default function PageMentions() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb maillons={[{ label: "Mentions légales" }]} />
      </Container>

      <PageHeader titre="Mentions légales" />

      <Container className="pt-6 pb-16 lg:pb-20">
        <Prose>
          <h2>Éditeur du site</h2>
          <dl>
            <dt>Dénomination</dt>
            <dd>{association.nomComplet}</dd>
            <dt>Forme juridique</dt>
            <dd>{association.formeJuridique}</dd>
            <dt>Numéro RNA</dt>
            <dd>{association.rna}</dd>
            <dt>Siège social</dt>
            <dd>
              {association.adresse.voie}, {association.adresse.codePostal}{" "}
              {association.adresse.ville}, {association.adresse.pays}
            </dd>
            <dt>Contact</dt>
            <dd>
              <a href={`mailto:${association.email}`}>{association.email}</a> —{" "}
              {association.telephone}
            </dd>
            <dt>Directeur de la publication</dt>
            <dd>Le président de l’association.</dd>
          </dl>

          <h2>Hébergement</h2>
          <p>
            Le site <strong>{siteUrl}</strong> est hébergé par son prestataire
            technique. Les coordonnées complètes de l’hébergeur sont à compléter
            avant la mise en ligne.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus de ce site (textes, photographies,
            illustrations, logo) est la propriété de l’association ou de ses
            partenaires. Toute reproduction, même partielle, est soumise à
            autorisation écrite préalable.
          </p>
          <p>
            Les photographies des animaux sont réalisées par les bénévoles et les
            familles d’accueil. Elles ne peuvent pas être réutilisées sans accord.
          </p>

          <h2>Offres de cession d’animaux</h2>
          <p>
            Chaque fiche d’animal proposé à l’adoption précise l’espèce, le
            sexe, l’âge et la race lorsqu’elle est connue. Le nombre d’animaux de
            la portée est indiqué lorsqu’il s’agit d’une cession de portée. Le
            numéro d’identification est communiqué à l’adoptant au moment de la
            signature du contrat.
          </p>
          <p>
            L’association ne pratique aucune vente d’animaux : les frais demandés
            correspondent à une participation aux dépenses déjà engagées
            (identification, vaccination, stérilisation, soins).
          </p>

          <h2>Dons</h2>
          <p>
            Les dons sont collectés par HelloAsso. Aucune donnée bancaire n’est
            traitée ni conservée par l’association ou par ce site.
          </p>

          <h2>Liens externes</h2>
          <p>
            Ce site comporte des liens vers des sites tiers (HelloAsso, réseaux
            sociaux). L’association n’exerce aucun contrôle sur leur contenu et ne
            saurait être tenue responsable de leur utilisation.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Les traitements de données mis en œuvre sur ce site sont détaillés
            dans la{" "}
            <a href={routes.confidentialite}>politique de confidentialité</a>.
          </p>
        </Prose>
      </Container>
    </>
  );
}
