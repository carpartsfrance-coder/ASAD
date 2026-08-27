import { ArrowRight, PawPrint, MessageSquareQuote } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";
import { CarteAdmin } from "./primitives";
import { routes } from "@/content/site";
import { peut } from "@/lib/auth/roles";
import type { RoleUtilisateur } from "@/types";

interface Tache {
  titre: string;
  detail: string;
  href: string;
  icone: React.ReactNode;
  compteur?: number;
}

/**
 * Raccourcis en grand format, pour les rôles au périmètre restreint.
 *
 * Plutôt qu'un tableau de bord dense, on affiche les deux ou trois gestes que
 * la personne vient réellement faire, en grand et nommés simplement.
 */
export function GuideRole({
  role,
  prenom,
  messagesEnAttente,
}: {
  role: RoleUtilisateur;
  prenom: string;
  messagesEnAttente: number;
}) {
  const taches: Tache[] = [];

  if (peut(role, "animaux:ecrire")) {
    taches.push({
      titre: "Gérer les animaux",
      detail: "Ajouter une fiche, modifier une photo, marquer un animal adopté.",
      href: routes.adminAnimaux,
      icone: <PawPrint size={24} strokeWidth={1.7} aria-hidden="true" />,
    });
  }

  if (peut(role, "livre-or:moderer")) {
    taches.push({
      titre: "Relire le livre d’or",
      detail:
        "Lire les messages reçus et choisir ceux qui sont publiés. Rien ne paraît sans votre accord.",
      href: routes.adminLivreOr,
      icone: <MessageSquareQuote size={24} strokeWidth={1.7} aria-hidden="true" />,
      compteur: messagesEnAttente,
    });
  }

  if (taches.length === 0) return null;

  return (
    <section aria-labelledby="titre-guide" className="mb-6">
      <h2 id="titre-guide" className="sr-only">
        Vos tâches
      </h2>

      <p className="mb-4 text-[15px] leading-[1.6] text-mut">
        Bonjour {prenom}. Voici ce que vous pouvez faire depuis cet espace.
      </p>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {taches.map((tache) => (
          <li key={tache.href}>
            <SmartLink href={tache.href} className="block h-full">
              <CarteAdmin className="flex h-full items-start gap-4 p-5 transition-colors duration-150 hover:border-acc sm:p-6">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-media bg-soft text-pri"
                >
                  {tache.icone}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[17px] font-bold text-ink">{tache.titre}</span>
                    {tache.compteur != null && tache.compteur > 0 && (
                      <span className="inline-flex h-6 items-center rounded-full bg-acc px-2.5 text-micro font-bold text-white">
                        {tache.compteur} en attente
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 block text-body leading-[1.6] text-mut">
                    {tache.detail}
                  </span>
                </span>

                <ArrowRight
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-acc"
                />
              </CarteAdmin>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
