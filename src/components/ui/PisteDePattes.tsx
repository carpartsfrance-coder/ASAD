"use client";

import { useEffect, useRef } from "react";
import { PawPrint } from "lucide-react";

/** Distance parcourue, en pixels, entre deux empreintes. */
const ESPACEMENT = 62;
/** Décalage latéral gauche/droite, pour que la marche alterne les pieds. */
const ECART_PIED = 8;
/** Nombre d'empreintes vivantes au maximum, quoi qu'il arrive. */
const PLAFOND = 12;

/**
 * Des empreintes de pattes qui se posent derrière la souris, puis s'effacent.
 *
 * Le DOM est manipulé directement plutôt que par l'état de React : une
 * empreinte tous les 62 pixels de souris, cela ferait des dizaines de rendus
 * par seconde pour un décor.
 *
 * L'effet ne se déclenche pas du tout au doigt (il n'y a pas de curseur à
 * suivre sur un écran tactile) ni si la personne a demandé moins d'animations.
 */
export function PisteDePattes() {
  const pisteRef = useRef<HTMLDivElement>(null);
  const modeleRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const piste = pisteRef.current;
    const modele = modeleRef.current;
    if (!piste || !modele) return;

    const souris = window.matchMedia("(pointer: fine)");
    const calme = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autorise = () => souris.matches && !calme.matches;

    const vivantes = new Set<Element>();
    let dernierX: number | null = null;
    let dernierY: number | null = null;
    let pied = 1;

    function effacerTout() {
      for (const patte of vivantes) patte.remove();
      vivantes.clear();
      dernierX = null;
      dernierY = null;
    }

    function poser(x: number, y: number, cap: number) {
      const patte = modele!.cloneNode(true) as SVGSVGElement;
      patte.removeAttribute("class");
      patte.classList.add("patte-posee");

      /* Un pas après l'autre, de part et d'autre de la trajectoire. */
      pied = -pied;
      const lateral = cap + Math.PI / 2;
      patte.style.left = `${x + Math.cos(lateral) * ECART_PIED * pied}px`;
      patte.style.top = `${y + Math.sin(lateral) * ECART_PIED * pied}px`;
      /* L'icône pointe vers le haut : on la tourne dans le sens de la marche. */
      patte.style.setProperty("--cap", `${(cap * 180) / Math.PI + 90}deg`);

      patte.addEventListener(
        "animationend",
        () => {
          patte.remove();
          vivantes.delete(patte);
        },
        { once: true },
      );

      piste!.appendChild(patte);
      vivantes.add(patte);

      /* Filet de sécurité : dans un onglet en arrière-plan les animations sont
         suspendues, `animationend` ne vient jamais et les pattes s'empilent. */
      while (vivantes.size > PLAFOND) {
        const plusVieille = vivantes.values().next().value;
        if (!plusVieille) break;
        plusVieille.remove();
        vivantes.delete(plusVieille);
      }
    }

    function surDeplacement(evenement: PointerEvent) {
      if (evenement.pointerType !== "mouse" || !autorise()) return;

      if (dernierX === null || dernierY === null) {
        dernierX = evenement.clientX;
        dernierY = evenement.clientY;
        return;
      }

      const dx = evenement.clientX - dernierX;
      const dy = evenement.clientY - dernierY;
      if (Math.hypot(dx, dy) < ESPACEMENT) return;

      dernierX = evenement.clientX;
      dernierY = evenement.clientY;
      poser(evenement.clientX, evenement.clientY, Math.atan2(dy, dx));
    }

    /* La souris sortie de la fenêtre, la piste repart de zéro : sinon elle
       tracerait un trait entre le point de sortie et le point de retour. */
    function surSortie() {
      dernierX = null;
      dernierY = null;
    }

    window.addEventListener("pointermove", surDeplacement, { passive: true });
    document.documentElement.addEventListener("pointerleave", surSortie);
    souris.addEventListener("change", effacerTout);
    calme.addEventListener("change", effacerTout);

    return () => {
      window.removeEventListener("pointermove", surDeplacement);
      document.documentElement.removeEventListener("pointerleave", surSortie);
      souris.removeEventListener("change", effacerTout);
      calme.removeEventListener("change", effacerTout);
      effacerTout();
    };
  }, []);

  return (
    <div ref={pisteRef} aria-hidden="true" className="piste-pattes">
      {/* Modèle recopié à chaque pas : une seule définition de l'empreinte. */}
      <PawPrint ref={modeleRef} strokeWidth={2.2} className="hidden" />
    </div>
  );
}
