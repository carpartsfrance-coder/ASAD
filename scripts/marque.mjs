/**
 * Redécoupe le logo de l'association en tous les fichiers dont le site a besoin.
 *
 *   npm run marque
 *
 * La source est `marque-source/asad-logo-original.png`. Ce script ne la modifie
 * jamais : il en tire des découpes, et écrase les précédentes. Le repère de
 * découpe n'est pas codé en dur — il est retrouvé à chaque fois en cherchant la
 * plus large colonne vide entre le pictogramme et le mot, pour qu'un nouveau
 * logo aux proportions différentes passe sans retoucher le script.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SOURCE = "marque-source/asad-logo-original.png";
const PUBLIC = "public/marque";
const APP = "src/app";

/** Un pixel compte comme de l'encre s'il est visible et pas quasi blanc. */
const ALPHA_MINI = 40;
const CLARTE_MAXI = 235;

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels } = info;
const encre = (x, y) => {
  const i = (y * W + x) * channels;
  return (
    data[i + 3] > ALPHA_MINI &&
    (data[i] + data[i + 1] + data[i + 2]) / 3 < CLARTE_MAXI
  );
};

/** Boîte englobante de l'encre dans une zone. */
function boite(x0, x1, y0, y1) {
  let gauche = x1, droite = x0, haut = y1, bas = y0;
  for (let x = x0; x < x1; x++) {
    for (let y = y0; y < y1; y++) {
      if (!encre(x, y)) continue;
      if (x < gauche) gauche = x;
      if (x > droite) droite = x;
      if (y < haut) haut = y;
      if (y > bas) bas = y;
    }
  }
  if (droite < gauche) throw new Error(`Aucune encre entre x ${x0}–${x1}`);
  return { left: gauche, top: haut, width: droite - gauche + 1, height: bas - haut + 1 };
}

/** La plus large colonne vide : c'est la gouttière entre le dessin et le mot. */
function gouttiere(x0, x1) {
  const vide = (x) => {
    for (let y = 0; y < H; y++) if (encre(x, y)) return false;
    return true;
  };
  let meilleure = null, debut = null;
  for (let x = x0; x <= x1; x++) {
    if (vide(x)) {
      debut ??= x;
    } else if (debut !== null) {
      const plage = { debut, fin: x - 1, largeur: x - debut };
      if (!meilleure || plage.largeur > meilleure.largeur) meilleure = plage;
      debut = null;
    }
  }
  if (!meilleure) throw new Error("Pictogramme et mot ne sont pas séparés");
  return meilleure;
}

const complet = boite(0, W, 0, H);
const coupe = gouttiere(complet.left, complet.left + complet.width - 1);
const marque = boite(complet.left, coupe.debut, 0, H);
const bloc = boite(coupe.fin, complet.left + complet.width, 0, H);

/* Dans le bloc de droite, « ASAD » est la bande du haut, la baseline celle du
   bas : on les sépare sur la plus haute ligne vide. */
const ligneVide = (y) => {
  for (let x = bloc.left; x < bloc.left + bloc.width; x++) if (encre(x, y)) return false;
  return true;
};
let separation = null, hauteurTrou = 0, debutTrou = null;
for (let y = bloc.top; y < bloc.top + bloc.height; y++) {
  if (ligneVide(y)) {
    debutTrou ??= y;
  } else if (debutTrou !== null) {
    if (y - debutTrou > hauteurTrou) { hauteurTrou = y - debutTrou; separation = debutTrou; }
    debutTrou = null;
  }
}
const mot = separation ? boite(bloc.left, bloc.left + bloc.width, bloc.top, separation) : bloc;

const png = (s) => s.png({ palette: true, colours: 128, effort: 10 });
await mkdir(PUBLIC, { recursive: true });

await png(sharp(SOURCE).extract(marque)).toFile(path.join(PUBLIC, "asad-marque.png"));
await png(sharp(SOURCE).extract(mot)).toFile(path.join(PUBLIC, "asad-mot.png"));
await png(sharp(SOURCE).extract(complet)).toFile(path.join(PUBLIC, "asad-complet.png"));

/* Le mot en blanc, pour les fonds noirs : on ne garde que sa silhouette et on
   la repeint. La forme n'est jamais retouchée. */
const silhouette = await sharp(SOURCE)
  .extract(mot)
  .ensureAlpha()
  .extractChannel(3)
  .raw()
  .toBuffer();
await png(
  sharp({
    create: { width: mot.width, height: mot.height, channels: 3, background: "#ffffff" },
  }).joinChannel(silhouette, { raw: { width: mot.width, height: mot.height, channels: 1 } }),
).toFile(path.join(PUBLIC, "asad-mot-blanc.png"));

/**
 * Le pictogramme sur une pastille : ses contours sont noirs, il disparaîtrait
 * sur la barre d'onglets sombre d'un navigateur.
 */
async function tuile(cote, rayon, sortie) {
  const marge = Math.round(cote * 0.12);
  const dessin = await sharp(SOURCE)
    .extract(marque)
    .resize(cote - 2 * marge, cote - 2 * marge, { fit: "inside" })
    .toBuffer();
  const { width: dw, height: dh } = await sharp(dessin).metadata();
  const fond = Buffer.from(
    `<svg width="${cote}" height="${cote}"><rect width="${cote}" height="${cote}" rx="${rayon}" fill="#fff"/></svg>`,
  );
  await png(
    sharp({ create: { width: cote, height: cote, channels: 4, background: "#00000000" } })
      .composite([
        { input: fond },
        { input: dessin, left: Math.round((cote - dw) / 2), top: Math.round((cote - dh) / 2) },
      ]),
  ).toFile(sortie);
}

await tuile(512, 113, path.join(APP, "icon.png"));
await tuile(180, 0, path.join(APP, "apple-icon.png")); // Apple arrondit lui-même

/* Image de partage : le logo entier, centré sur blanc, au format des réseaux. */
const partage = await sharp(SOURCE)
  .extract(complet)
  .resize(1000, 380, { fit: "inside" })
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#ffffff" } })
  .composite([{ input: partage, gravity: "center" }])
  .png({ palette: true, colours: 128, effort: 10 })
  .toFile(path.join(PUBLIC, "asad-partage.png"));

console.log(`Source ${W}×${H}`);
console.log(`  pictogramme  ${marque.width}×${marque.height}`);
console.log(`  mot « ASAD » ${mot.width}×${mot.height}`);
console.log(`  logo entier  ${complet.width}×${complet.height}`);
console.log("Découpes écrites dans public/marque et src/app.");
