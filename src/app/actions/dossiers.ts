"use server";

import { revalidatePath } from "next/cache";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import { changerStatutDemande } from "@/lib/donnees/demandes";
import {
  changerStatutBenevole,
  changerStatutFamille,
  changerStatutSignalement,
} from "@/lib/donnees/candidatures";
import { routes } from "@/content/site";
import type { StatutDemande } from "@/types";

/** Changements de statut des dossiers reçus depuis le site. */

function champ(data: FormData, nom: string): string {
  const v = data.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

export async function majDemande(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("demandes:ecrire", "Demandes d’adoption");
  const id = champ(data, "id");
  const statut = champ(data, "statut") as StatutDemande;
  if (!id || !statut) return;

  await changerStatutDemande(id, statut, champ(data, "notes") || undefined);
  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `a mis à jour la demande ${champ(data, "reference")}`,
  );
  revalidatePath(routes.adminDemandes);
}

export async function majFamille(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("familles:ecrire", "Familles d’accueil");
  const id = champ(data, "id");
  if (!id) return;

  await changerStatutFamille(id, champ(data, "statut") as never);
  await consigner(utilisateur.id, utilisateur.nom, `a mis à jour une candidature famille d’accueil`);
  revalidatePath(routes.adminFamilles);
}

export async function majBenevole(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("benevoles:ecrire", "Bénévoles");
  const id = champ(data, "id");
  if (!id) return;

  await changerStatutBenevole(id, champ(data, "statut") as never);
  await consigner(utilisateur.id, utilisateur.nom, `a mis à jour une candidature bénévole`);
  revalidatePath(routes.adminBenevoles);
}

export async function majSignalement(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("signalements:ecrire", "Signalements");
  const id = champ(data, "id");
  if (!id) return;

  await changerStatutSignalement(id, champ(data, "statut") as never);
  await consigner(utilisateur.id, utilisateur.nom, `a mis à jour un signalement`);
  revalidatePath(routes.adminSignalements);
}
