"use client";

import { useState } from "react";
import { CircleCheck, X } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";

/** Bandeau de confirmation, refermable, affiché en haut du tableau de bord. */
export function BandeauConfirmation({
  message,
  lien,
  lienLabel,
}: {
  message: string;
  lien?: string;
  lienLabel?: string;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-[11px] border border-pri bg-succes px-4 py-3.5"
    >
      <CircleCheck
        size={18}
        strokeWidth={2}
        aria-hidden="true"
        className="mt-px shrink-0 text-white"
      />
      <p className="flex-1 text-meta text-white">
        {message}
        {lien && lienLabel && (
          <>
            {" "}
            <SmartLink
              href={lien}
              className="font-semibold underline underline-offset-2 hover:no-underline"
            >
              {lienLabel}
            </SmartLink>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="-my-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors duration-150 hover:bg-white/15"
      >
        <X size={16} strokeWidth={2.2} aria-hidden="true" />
        <span className="sr-only">Fermer ce message</span>
      </button>
    </div>
  );
}
