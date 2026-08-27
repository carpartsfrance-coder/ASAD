"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { seDeconnecter } from "@/app/actions/authentification";
import { cn } from "@/lib/cn";

function Bouton({ variante }: { variante: "icone" | "menu" }) {
  const { pending } = useFormStatus();

  if (variante === "menu") {
    return (
      <button
        type="submit"
        role="menuitem"
        disabled={pending}
        className="flex h-[38px] w-full items-center rounded-lg px-2.5 text-left text-meta font-semibold text-erreur transition-colors duration-150 hover:bg-alerte disabled:opacity-60"
      >
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex size-[30px] items-center justify-center rounded-btn text-white/70",
        "transition-colors duration-150 hover:bg-white/12 hover:text-white disabled:opacity-60",
      )}
    >
      <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">{pending ? "Déconnexion en cours" : "Se déconnecter"}</span>
    </button>
  );
}

/** Déconnexion : un vrai formulaire, pour que l'action serveur efface le cookie. */
export function BoutonDeconnexion({ variante = "icone" }: { variante?: "icone" | "menu" }) {
  return (
    <form action={seDeconnecter} className={variante === "menu" ? "w-full" : undefined}>
      <Bouton variante={variante} />
    </form>
  );
}
