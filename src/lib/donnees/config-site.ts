import "server-only";

import { db } from "@/db";
import { contenuSite } from "@/db/schema";
import { association, helloAsso, reseaux } from "@/content/site";
import { hero, sectionAnimaux, sectionAider, sectionTemoignage, sectionUrgences } from "@/content/accueil";
import { statistiques } from "@/content/statistiques";
import type { Photo, Statistique } from "@/types";

/**
 * Configuration éditable du site.
 *
 * Lue en base, avec repli sur les constantes du code : si une clé n'a pas
 * encore été semée, ou si la base est momentanément injoignable, le site
 * s'affiche quand même.
 */

/** Images livrées avec le site, servant de repli aux photos réglables. */
const PHOTOS_PAR_DEFAUT = {
  adoptes: [
    { src: "/images/animaux/lilou.jpg", alt: "Lilou, adoptée, installée chez elle" },
    { src: "/images/animaux/ficelle.jpg", alt: "Ficelle, adoptée, au soleil" },
    { src: "/images/animaux/caline.jpg", alt: "Câline, chatte recueillie par l’association" },
    { src: "/images/animaux/nala.jpg", alt: "Nala, chienne recueillie par l’association" },
  ] as const,
  association: {
    src: "/images/pages/association.jpg",
    alt: "Bénévoles de l’association auprès des animaux",
  },
  don: {
    src: "/images/pages/don.jpg",
    alt: "Animaux recueillis par l’association, bénéficiaires des dons",
  },
  adoption: {
    src: "/images/pages/adoption-encart.jpg",
    alt: "Chien accueilli temporairement dans une famille d’accueil",
  },
} as const;

export interface ConfigSite {
  hero: {
    surtitre: string;
    titre: string;
    chapo: string;
    photo: Photo;
  };
  titres: {
    animaux: string;
    animauxSousTitre: string;
    urgences: string;
    urgencesChapo: string;
    aider: string;
    temoignage: string;
  };
  /** Photos du site réglables depuis le back-office. */
  photos: {
    /** Les quatre visuels de la mosaïque, page « Adoptés ». */
    adoptes: Photo[];
    association: Photo;
    don: Photo;
    /** Encart de bas de page du catalogue. */
    adoption: Photo;
  };
  statistiques: Statistique[];
  association: {
    nom: string;
    description: string;
    email: string;
    telephone: string;
  };
  liens: {
    don: string;
    urgence: string;
    adhesion: string;
    page: string;
    facebook: string;
    instagram: string;
  };
}

/** Valeurs du code, utilisées en repli. */
function repli(): ConfigSite {
  return {
    hero: {
      surtitre: hero.surtitre,
      titre: hero.titre,
      chapo: hero.chapo,
      photo: hero.photo,
    },
    photos: {
      adoptes: [...PHOTOS_PAR_DEFAUT.adoptes],
      association: PHOTOS_PAR_DEFAUT.association,
      don: PHOTOS_PAR_DEFAUT.don,
      adoption: PHOTOS_PAR_DEFAUT.adoption,
    },
    titres: {
      animaux: sectionAnimaux.titre,
      animauxSousTitre: sectionAnimaux.sousTitre,
      urgences: sectionUrgences.titre,
      urgencesChapo: sectionUrgences.chapo,
      aider: sectionAider.titre,
      temoignage: sectionTemoignage.titre,
    },
    statistiques: [...statistiques],
    association: {
      nom: association.nom,
      description: association.description,
      email: association.email,
      telephone: association.telephone,
    },
    liens: {
      don: helloAsso.don,
      urgence: helloAsso.urgence,
      adhesion: helloAsso.adhesion,
      page: helloAsso.page,
      facebook: reseaux.facebook,
      instagram: reseaux.instagram,
    },
  };
}

export async function configSite(): Promise<ConfigSite> {
  const defaut = repli();

  let valeurs: Record<string, unknown> = {};
  try {
    const lignes = await db
      .select({ cle: contenuSite.cle, valeur: contenuSite.valeur })
      .from(contenuSite);
    valeurs = Object.fromEntries(lignes.map((l) => [l.cle, l.valeur]));
  } catch {
    // Base injoignable : on sert les valeurs du code.
    return defaut;
  }

  const chaine = (cle: string, secours: string): string =>
    typeof valeurs[cle] === "string" && valeurs[cle] ? (valeurs[cle] as string) : secours;

  return {
    hero: {
      surtitre: chaine("accueil.hero.surtitre", defaut.hero.surtitre),
      titre: chaine("accueil.hero.titre", defaut.hero.titre),
      chapo: chaine("accueil.hero.chapo", defaut.hero.chapo),
      photo: (valeurs["accueil.hero.photo"] as Photo) ?? defaut.hero.photo,
    },
    titres: {
      animaux: chaine("accueil.animaux.titre", defaut.titres.animaux),
      animauxSousTitre: chaine("accueil.animaux.sousTitre", defaut.titres.animauxSousTitre),
      urgences: chaine("accueil.urgences.titre", defaut.titres.urgences),
      urgencesChapo: chaine("accueil.urgences.chapo", defaut.titres.urgencesChapo),
      aider: chaine("accueil.aider.titre", defaut.titres.aider),
      temoignage: chaine("accueil.temoignage.titre", defaut.titres.temoignage),
    },
    /**
     * Photos réglables depuis le back-office.
     * Chaque clé retombe sur l'image livrée avec le site si elle n'a jamais
     * été changée.
     */
    photos: {
      adoptes: [1, 2, 3, 4].map(
        (n) =>
          (valeurs[`photos.adoptes.${n}`] as Photo) ?? PHOTOS_PAR_DEFAUT.adoptes[n - 1],
      ),
      association:
        (valeurs["photos.association"] as Photo) ?? PHOTOS_PAR_DEFAUT.association,
      don: (valeurs["photos.don"] as Photo) ?? PHOTOS_PAR_DEFAUT.don,
      adoption: (valeurs["photos.adoption"] as Photo) ?? PHOTOS_PAR_DEFAUT.adoption,
    },
    statistiques: Array.isArray(valeurs["accueil.statistiques"])
      ? (valeurs["accueil.statistiques"] as Statistique[])
      : defaut.statistiques,
    association: {
      nom: chaine("association.nom", defaut.association.nom),
      description: chaine("association.description", defaut.association.description),
      email: chaine("association.email", defaut.association.email),
      telephone: chaine("association.telephone", defaut.association.telephone),
    },
    liens: {
      don: chaine("liens.helloasso.don", defaut.liens.don),
      urgence: chaine("liens.helloasso.urgence", defaut.liens.urgence),
      adhesion: chaine("liens.helloasso.adhesion", defaut.liens.adhesion),
      page: chaine("liens.helloasso.page", defaut.liens.page),
      facebook: chaine("liens.facebook", defaut.liens.facebook),
      instagram: chaine("liens.instagram", defaut.liens.instagram),
    },
  };
}
