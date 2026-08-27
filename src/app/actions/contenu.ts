"use server";

import { revalidatePath } from "next/cache";
import { exigerCapacite } from "@/lib/auth/garde";
import { consigner } from "@/lib/donnees/journal";
import { enregistrerValeur, toutesLesEntrees } from "@/lib/donnees/contenu";
import type { EtatFormulaire } from "@/lib/etat-formulaire";

/**
 * Enregistre les textes et réglages du site.
 * Le formulaire renvoie une valeur par clé ; on ne touche qu'aux clés modifiées.
 */
export async function sauverContenu(
  _precedent: EtatFormulaire,
  data: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerCapacite("contenu:ecrire", "Contenu du site");

  const entrees = await toutesLesEntrees();
  let modifiees = 0;

  for (const entree of entrees) {
    const recu = data.get(entree.cle);
    if (typeof recu !== "string") continue;

    /* Les navigateurs envoient les retours à la ligne d'une zone de texte en
       CRLF : sans cette normalisation, toute valeur multiligne paraîtrait
       modifiée à chaque enregistrement. */
    const brut = recu.replace(/\r\n/g, "\n");

    /* Le formulaire affiche le JSON indenté : la comparaison doit se faire sur
       la même forme, sinon toute valeur non textuelle paraîtrait modifiée. */
    const actuelle =
      typeof entree.valeur === "string"
        ? entree.valeur
        : JSON.stringify(entree.valeur, null, 2);
    if (brut === actuelle) continue;

    // Une valeur d'origine textuelle reste textuelle ; sinon on relit du JSON.
    let valeur: unknown = brut;
    if (typeof entree.valeur !== "string") {
      try {
        valeur = JSON.parse(brut);
      } catch {
        return {
          statut: "erreur",
          message: `La valeur de « ${entree.libelle} » n’est pas au bon format.`,
          erreurs: { [entree.cle]: "Format attendu : JSON." },
        };
      }
    }

    await enregistrerValeur(entree.cle, valeur);
    modifiees += 1;
  }

  if (modifiees === 0) {
    return { statut: "succes", message: "Rien n’a changé." };
  }

  await consigner(
    utilisateur.id,
    utilisateur.nom,
    `a modifié ${modifiees} texte${modifiees > 1 ? "s" : ""} du site`,
  );

  revalidatePath("/", "layout");

  return {
    statut: "succes",
    message: `${modifiees} modification${modifiees > 1 ? "s" : ""} enregistrée${modifiees > 1 ? "s" : ""}.`,
  };
}
