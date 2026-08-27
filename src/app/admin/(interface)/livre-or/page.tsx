import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CarteAdmin, EnTetePageAdmin } from "@/components/admin/primitives";
import { CarteMessage } from "@/components/admin/CarteMessage";
import { OngletsLivreOr } from "@/components/admin/OngletsLivreOr";
import { exigerCapacite } from "@/lib/auth/garde";
import { compterMessages, tousLesMessages } from "@/lib/donnees/livre-or";
import type { StatutMessageLivreOr } from "@/types";

export const metadata: Metadata = { title: "Livre d’or" };
export const dynamic = "force-dynamic";

const STATUTS: StatutMessageLivreOr[] = [
  "en_attente",
  "publie",
  "refuse",
  "indesirable",
  "archive",
];

export default async function PageAdminLivreOr({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigerCapacite("livre-or:lire", "Livre d’or");

  const params = await searchParams;
  const brut = Array.isArray(params.statut) ? params.statut[0] : params.statut;
  const statut = (STATUTS.includes(brut as StatutMessageLivreOr)
    ? brut
    : "en_attente") as StatutMessageLivreOr;

  const [messages, compteurs] = await Promise.all([
    tousLesMessages(statut),
    compterMessages(),
  ]);

  return (
    <>
      <EnTetePageAdmin
        titre="Livre d’or"
        sousTitre="Relisez les messages reçus, puis choisissez ceux qui sont publiés."
      />


      <p className="mt-5 flex items-start gap-3 rounded-media border border-line bg-white p-4 text-meta leading-[1.6] text-mut">
        <Info size={17} strokeWidth={1.8} aria-hidden="true" className="mt-px shrink-0 text-acc" />
        <span>
          Aucun message ne paraît sur le site tant que vous ne l’avez pas publié.
          Vous pouvez changer d’avis à tout moment : un message publié peut être
          retiré, un message refusé peut être publié plus tard.
        </span>
      </p>

      <OngletsLivreOr statutActif={statut} compteurs={compteurs} />

      {messages.length === 0 ? (
        <CarteAdmin className="mt-4 p-10 text-center">
          <p className="text-body text-mut">
            {statut === "en_attente"
              ? "Aucun message en attente. Tout est à jour."
              : "Aucun message dans cette rubrique."}
          </p>
        </CarteAdmin>
      ) : (
        <ul className="mt-4 space-y-4">
          {messages.map((message) => (
            <li key={message.id}>
              <CarteMessage message={message} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
