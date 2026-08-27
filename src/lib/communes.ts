/**
 * Affichage homogène de la localisation d'un animal.
 *
 * Les fiches contiennent parfois seulement un numéro de département (« 13 »),
 * parfois une commune complète (« Alès (30) »). Sur les cartes, on n'affiche
 * jamais un numéro seul : à défaut de commune, on nomme le département.
 */

const DEPARTEMENTS: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
  "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
  "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
  "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "21": "Côte-d’Or",
  "22": "Côtes-d’Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs",
  "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
  "2A": "Corse-du-Sud", "2B": "Haute-Corse", "30": "Gard", "31": "Haute-Garonne",
  "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
  "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
  "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire",
  "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne",
  "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne",
  "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse",
  "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
  "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme",
  "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales",
  "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône",
  "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
  "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
  "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne",
  "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne",
  "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort",
  "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne", "95": "Val-d’Oise",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
  "974": "La Réunion", "976": "Mayotte",
};

/** Nom du département, ou `undefined` si le code est inconnu. */
export function nomDepartement(code: string): string | undefined {
  const propre = code.trim().toUpperCase();
  return DEPARTEMENTS[propre] ?? DEPARTEMENTS[propre.padStart(2, "0")];
}

/**
 * Localisation lisible, toujours au format « Commune (département) ».
 *
 * - « Alès (30) »        → inchangé ;
 * - « 13 »               → « Bouches-du-Rhône (13) » ;
 * - « Martigues »        → « Martigues » (pas de code à ajouter) ;
 * - vide                 → chaîne vide, l'appelant n'affiche alors rien.
 */
export function formatCommune(commune: string | undefined | null): string {
  const brut = (commune ?? "").trim();
  if (!brut) return "";

  // Déjà au bon format : « Commune (30) ».
  if (/\(\s*[0-9AB]{2,3}\s*\)\s*$/i.test(brut)) return brut;

  // Un simple code de département : on le nomme.
  if (/^[0-9AB]{2,3}$/i.test(brut)) {
    const nom = nomDepartement(brut);
    return nom ? `${nom} (${brut})` : `Département ${brut}`;
  }

  return brut;
}
