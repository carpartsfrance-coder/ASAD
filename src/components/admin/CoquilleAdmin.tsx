"use client";

import { useState } from "react";
import type { Utilisateur } from "@/types";
import type { CompteursAdmin } from "@/content/admin";
import { SidebarAdmin } from "./SidebarAdmin";
import { TopbarAdmin } from "./TopbarAdmin";

/** Coquille du back-office : barre latérale, barre supérieure, contenu. */
export function CoquilleAdmin({
  utilisateur,
  compteurs,
  children,
}: {
  utilisateur: Utilisateur;
  compteurs: CompteursAdmin;
  children: React.ReactNode;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    /* Le back-office garde un fond légèrement teinté : ses cartes sont
       blanches, elles se détacheraient mal sur du blanc pur. */
    <div className="flex min-h-screen bg-subtil">
      {/* Barre latérale fixe en desktop */}
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarAdmin utilisateur={utilisateur} compteurs={compteurs} />
      </aside>

      {/* Tiroir sur petit écran */}
      {menuOuvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            tabIndex={-1}
            onClick={() => setMenuOuvert(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-pri/45"
          />
          <div className="absolute inset-y-0 left-0 h-full">
            <SidebarAdmin
              utilisateur={utilisateur}
              compteurs={compteurs}
              ouverte
              onFermer={() => setMenuOuvert(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopbarAdmin utilisateur={utilisateur} onOuvrirMenu={() => setMenuOuvert(true)} />
        <main className="flex-1 px-4 pt-6 pb-10 sm:px-7 sm:pb-10">{children}</main>
      </div>
    </div>
  );
}
