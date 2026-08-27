"use client";

import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Briques de formulaire partagées par les éditeurs du back-office. */

export const CONTROLE_ADMIN =
  "w-full rounded-btn border-[1.4px] border-line bg-white px-3.5 text-meta text-ink " +
  "transition-colors duration-150 placeholder:text-mut/60 focus:border-acc focus:outline-none";

export function ChampAdmin({
  id,
  label,
  aide,
  erreur,
  children,
  className,
}: {
  id: string;
  label: string;
  aide?: string;
  erreur?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-meta font-semibold text-ink">
        {label}
      </label>
      {aide && <p className="mt-1 text-tiny leading-[1.5] text-mut">{aide}</p>}
      <div className="mt-2">{children}</div>
      {erreur && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-tiny font-semibold text-erreur">
          <CircleAlert size={13} strokeWidth={2.2} aria-hidden="true" />
          {erreur}
        </p>
      )}
    </div>
  );
}

export function TexteAdmin(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROLE_ADMIN, "h-11", props.className)} />;
}

export function ZoneAdmin(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROLE_ADMIN, "resize-y py-2.5", props.className)} />;
}

export function ListeAdmin({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ valeur: string; label: string }>;
}) {
  return (
    <select {...props} className={cn(CONTROLE_ADMIN, "h-11 cursor-pointer")}>
      {options.map((o) => (
        <option key={o.valeur} value={o.valeur}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function CaseAdmin({
  id,
  label,
  defaultChecked,
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-meta text-ink">
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-[18px] shrink-0 rounded border-line accent-[var(--color-acc)]"
      />
      {label}
    </label>
  );
}

export function BarreActions({
  enCours,
  libelle,
  retour,
  children,
}: {
  enCours: boolean;
  libelle: string;
  retour: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 rounded-media border border-line bg-white/95 p-4 backdrop-blur">
      <button
        type="submit"
        disabled={enCours}
        className="inline-flex h-10 items-center gap-2 rounded-btn bg-acc px-4 text-meta font-bold text-white transition-colors duration-150 hover:bg-acc-dark disabled:opacity-60"
      >
        {enCours ? "Enregistrement…" : libelle}
      </button>
      {children}
      <div className="ml-auto">{retour}</div>
    </div>
  );
}
