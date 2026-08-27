"use server";

import { revalidatePath } from "next/cache";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import {
  TAILLE_MAX_OCTETS,
  TYPES_ACCEPTES,
  enregistrerMedia,
  supprimerMedia,
} from "@/lib/donnees/medias";
import { routes } from "@/content/site";

export interface ResultatTeleversement {
  ok: boolean;
  /** Adresse à utiliser dans les fiches : `/media/<identifiant>`. */
  url?: string;
  erreur?: string;
}

/**
 * Reçoit une image et l'enregistre en base.
 *
 * Le navigateur a déjà redimensionné et compressé le fichier : on vérifie
 * quand même le type et la taille, car une action serveur est une porte
 * d'entrée publique.
 */
export async function televerserImage(data: FormData): Promise<ResultatTeleversement> {
  const utilisateur = await exigerCapacite("animaux:ecrire", "Médias");

  const fichier = data.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, erreur: "Aucun fichier reçu." };
  }

  if (!TYPES_ACCEPTES.includes(fichier.type as (typeof TYPES_ACCEPTES)[number])) {
    return {
      ok: false,
      erreur: "Format non accepté. Utilisez une photo JPEG, PNG ou WebP.",
    };
  }

  if (fichier.size > TAILLE_MAX_OCTETS) {
    return {
      ok: false,
      erreur: "Cette image est trop lourde, même après compression.",
    };
  }

  try {
    const contenu = Buffer.from(await fichier.arrayBuffer());
    const largeur = Number(data.get("largeur")) || undefined;
    const hauteur = Number(data.get("hauteur")) || undefined;

    const media = await enregistrerMedia({
      contenu,
      typeMime: fichier.type,
      nomFichier: fichier.name,
      alt: String(data.get("alt") ?? ""),
      largeur,
      hauteur,
      televersePar: utilisateur.id,
    });

    return { ok: true, url: media.url };
  } catch (erreur) {
    console.error("[ASAD] Image non enregistrée", erreur);
    return { ok: false, erreur: "L’image n’a pas pu être enregistrée. Réessayez." };
  }
}

/** Supprime une image de la photothèque. */
export async function effacerMedia(data: FormData): Promise<void> {
  const utilisateur = await exigerCapacite("medias:ecrire", "Médias");

  const id = String(data.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  await supprimerMedia(id);
  await consigner(utilisateur.id, utilisateur.nom, "a supprimé une image");
  revalidatePath(routes.adminMedias);
}
