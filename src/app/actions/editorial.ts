"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import {
  enregistrerCampagne,
  supprimerCampagne,
} from "@/lib/donnees/editorial-ecriture";
import { routes } from "@/content/site";
import type { EtatFormulaire } from "@/lib/etat-formulaire";
import type { StatutCampagne } from "@/types";

function texte(data: FormData, nom: string): string {
  const v = data.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

function nombre(data: FormData, nom: string): number {
  const v = Number(texte(data, nom).replace(",", "."));
  return Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
}

function lignes(data: FormData, nom: string): string[] {
  return texte(data, nom).split("\n").map((l) => l.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Campagnes d'urgence                                                 */
/* ------------------------------------------------------------------ */

export async function sauverCampagne(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerCapacite("urgences:ecrire", "Urgences");

  const titre = texte(data, "titre");
  const objectif = nombre(data, "objectif");
  const collecte = nombre(data, "collecte");
  const erreurs: Record<string, string> = {};

  if (titre.length < 3) erreurs.titre = "Le titre est obligatoire.";
  if (objectif <= 0) erreurs.objectif = "Indiquez l’objectif de la collecte, en euros.";
  if (collecte > objectif) {
    erreurs.collecte = "Le montant collecté ne peut pas dépasser l’objectif.";
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: "erreur", message: "Certaines informations manquent.", erreurs };
  }

  const id = texte(data, "id") || undefined;
  const statut = (texte(data, "statut") === "terminee" ? "terminee" : "active") as StatutCampagne;

  const slug = await enregistrerCampagne(
    {
      titre,
      animalId: texte(data, "animalId") || null,
      type: texte(data, "type"),
      description: texte(data, "description"),
      echeance: texte(data, "echeance"),
      dateLimite: texte(data, "dateLimite") || undefined,
      objectif,
      collecte,
      lienHelloAsso: texte(data, "lienHelloAsso") || undefined,
      photo: { src: texte(data, "photoUrl"), alt: texte(data, "photoAlt") },
      statut,
      ctaLabel: texte(data, "ctaLabel") || "Participer",
      remerciement: texte(data, "remerciement") || undefined,
      misesAJour: lignes(data, "misesAJour").map((ligne) => {
        const [date, ...reste] = ligne.split("|");
        return { date: date.trim(), texte: reste.join("|").trim() };
      }),
      afficherSurAccueil: data.get("afficherSurAccueil") != null,
      slug: texte(data, "slug") || undefined,
    },
    id,
  );

  await consigner(
    utilisateur.id,
    utilisateur.nom,
    id ? `a mis à jour la collecte « ${titre} »` : `a lancé la collecte « ${titre} »`,
  );

  revalidatePath(routes.urgences);
  revalidatePath("/");
  revalidatePath(routes.adminUrgences);
  redirect(`${routes.adminUrgences}?enregistre=1&slug=${slug}`);
}

export async function effacerCampagne(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("urgences:ecrire", "Urgences");
  const id = texte(data, "id");
  if (!id) return;

  await supprimerCampagne(id);
  await consigner(utilisateur.id, utilisateur.nom, "a supprimé une collecte");
  revalidatePath(routes.urgences);
  revalidatePath(routes.adminUrgences);
}
