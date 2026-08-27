import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon } from "@/components/brand/SocialIcons";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  association,
  liensInformations,
  mentionLegale,
  navigationPied,
  routes,
} from "@/content/site";
import type { ConfigSite } from "@/lib/donnees/config-site";

const LIEN_PIED =
  "text-white/74 transition-colors duration-150 hover:text-white";

const CERCLE_SOCIAL =
  "flex size-[38px] items-center justify-center rounded-full border-[1.3px] border-white/40 text-white transition-colors duration-150 hover:bg-white/12";

function ColonneLiens({
  titre,
  liens,
}: {
  titre: string;
  liens: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className="mt-1 mb-4 text-lead font-bold text-white">{titre}</h2>
      <ul className="flex flex-col gap-2.5 text-meta">
        {liens.map((lien) => (
          <li key={lien.href}>
            <SmartLink href={lien.href} className={LIEN_PIED}>
              {lien.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ config }: { config: ConfigSite }) {
  return (
    <footer className="bg-pri pt-12 text-white">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1.15fr_1.3fr] lg:gap-[46px]">
          {/* Marque */}
          <div>
            <SmartLink href={routes.accueil} aria-label="ASAD — retour à l’accueil">
              <Logo variante="blanc" taille="footer" avecSignification />
            </SmartLink>
            <p className="mt-4 max-w-[265px] text-meta leading-[1.68] text-white/72">
              {config.association.description}
            </p>

            <ul className="mt-6 flex gap-3">
              <li>
                <SmartLink href={config.liens.facebook} className={CERCLE_SOCIAL}>
                  <FacebookIcon size={17} />
                  <span className="sr-only">
                    {association.nom} sur Facebook
                  </span>
                </SmartLink>
              </li>
              <li>
                <SmartLink href={config.liens.instagram} className={CERCLE_SOCIAL}>
                  <InstagramIcon size={17} />
                  <span className="sr-only">
                    {association.nom} sur Instagram
                  </span>
                </SmartLink>
              </li>
              <li>
                <a href={`mailto:${config.association.email}`} className={CERCLE_SOCIAL}>
                  <Mail size={17} strokeWidth={1.7} aria-hidden="true" />
                  <span className="sr-only">
                    Écrire à {config.association.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <ColonneLiens titre="Navigation" liens={navigationPied} />
          <ColonneLiens titre="Informations" liens={liensInformations} />

          {/* Le site n'a aucun formulaire : on nous joint ici, et nulle part ailleurs. */}
          <div>
            <h2 className="mt-1 mb-3.5 text-lead font-bold text-white">Nous joindre</h2>
            <ul className="space-y-3 text-meta text-white/72">
              <li>
                <a
                  href={`mailto:${config.association.email}`}
                  className="font-semibold break-words text-white transition-colors duration-150 hover:text-acc-light"
                >
                  {config.association.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${association.telephoneLien}`}
                  className="font-semibold text-white transition-colors duration-150 hover:text-acc-light"
                >
                  {config.association.telephone}
                </a>
              </li>
            </ul>
            <p className="mt-4 max-w-[245px] text-meta leading-[1.68] text-white/72">
              L’association est entièrement bénévole : nous répondons dès que
              possible, généralement sous 72 heures.
            </p>
          </div>
        </div>
      </Container>

      <Container className="mt-9">
        <p className="border-t border-white/16 px-0 pt-4 pb-5 text-center text-tiny text-white/62">
          {mentionLegale}
        </p>
      </Container>
    </footer>
  );
}
