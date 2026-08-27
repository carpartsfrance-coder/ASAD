"use client";

/** Dimension maximale conservée : au-delà, rien ne se voit à l'écran. */
const DIMENSION_MAX = 1600;
const QUALITE = 0.82;

/**
 * Redimensionne et compresse une image dans le navigateur, avant l'envoi.
 *
 * Une photo de téléphone fait souvent 5 Mo ; après ce passage elle en fait
 * environ 200 Ko, sans différence visible. L'envoi est plus rapide et la base
 * reste légère.
 */
export async function preparerImage(
  fichier: File,
): Promise<{ blob: Blob; largeur: number; hauteur: number }> {
  // `from-image` applique l'orientation EXIF : les photos prises à la
  // verticale ne se retrouvent pas couchées.
  const bitmap = await createImageBitmap(fichier, { imageOrientation: "from-image" });

  const echelle = Math.min(1, DIMENSION_MAX / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;

  const contexte = toile.getContext("2d");
  if (!contexte) throw new Error("Impossible de préparer l’image.");

  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resoudre) =>
    toile.toBlob(resoudre, "image/jpeg", QUALITE),
  );
  if (!blob) throw new Error("Impossible de compresser l’image.");

  return { blob, largeur, hauteur };
}
