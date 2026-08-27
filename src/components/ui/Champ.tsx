import { cn } from "@/lib/cn";

const CONTROLE =
  "w-full rounded-[9px] border border-line bg-white px-4 py-3 text-body text-ink " +
  "placeholder:text-mut/70 transition-colors duration-150 " +
  "focus:border-acc focus:outline-none aria-[invalid=true]:border-erreur";

interface ChampProps {
  id: string;
  label: string;
  /** Ajoute l'astérisque et l'attribut `required`. */
  requis?: boolean;
  /** Texte d'aide affiché sous le libellé. */
  aide?: string;
  erreur?: string;
  className?: string;
  children?: React.ReactNode;
}

function Enveloppe({
  id,
  label,
  requis,
  aide,
  erreur,
  className,
  children,
}: ChampProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-meta font-semibold text-ink">
        {label}
        {requis && (
          <span className="text-acc" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {requis && <span className="sr-only"> (obligatoire)</span>}
      </label>
      {aide && (
        <p id={`${id}-aide`} className="mt-1 text-mini text-mut">
          {aide}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {erreur && (
        <p id={`${id}-erreur`} role="alert" className="mt-1.5 text-mini font-semibold text-erreur">
          {erreur}
        </p>
      )}
    </div>
  );
}

type ChampTexteProps = ChampProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export function ChampTexte({
  id,
  label,
  requis,
  aide,
  erreur,
  className,
  ...input
}: ChampTexteProps) {
  return (
    <Enveloppe id={id} label={label} requis={requis} aide={aide} erreur={erreur} className={className}>
      <input
        id={id}
        name={id}
        required={requis}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={cn(aide && `${id}-aide`, erreur && `${id}-erreur`) || undefined}
        className={CONTROLE}
        {...input}
      />
    </Enveloppe>
  );
}

type ChampZoneProps = ChampProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

export function ChampZone({
  id,
  label,
  requis,
  aide,
  erreur,
  className,
  rows = 5,
  ...zone
}: ChampZoneProps) {
  return (
    <Enveloppe id={id} label={label} requis={requis} aide={aide} erreur={erreur} className={className}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={requis}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={cn(aide && `${id}-aide`, erreur && `${id}-erreur`) || undefined}
        className={cn(CONTROLE, "resize-y")}
        {...zone}
      />
    </Enveloppe>
  );
}

type ChampSelectProps = ChampProps & {
  options: Array<{ valeur: string; label: string }>;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id" | "className">;

export function ChampSelect({
  id,
  label,
  requis,
  aide,
  erreur,
  className,
  options,
  ...select
}: ChampSelectProps) {
  return (
    <Enveloppe id={id} label={label} requis={requis} aide={aide} erreur={erreur} className={className}>
      <select
        id={id}
        name={id}
        required={requis}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={cn(aide && `${id}-aide`, erreur && `${id}-erreur`) || undefined}
        className={cn(CONTROLE, "appearance-none bg-[length:0] pr-10")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23616B7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          backgroundSize: "18px",
        }}
        {...select}
      >
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.label}
          </option>
        ))}
      </select>
    </Enveloppe>
  );
}

/** Case à cocher avec libellé riche (consentement RGPD, options…). */
export function ChampCase({
  id,
  requis,
  children,
  ...input
}: {
  id: string;
  requis?: boolean;
  children: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type">) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={id}
        type="checkbox"
        required={requis}
        className="mt-0.5 size-[18px] shrink-0 rounded border-line accent-[var(--color-acc)]"
        {...input}
      />
      <label htmlFor={id} className="text-meta leading-[1.65] text-mut">
        {children}
        {requis && (
          <span className="text-acc" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
    </div>
  );
}

/** Groupe de cases à cocher (disponibilités, missions…). */
export function GroupeCases({
  legende,
  name,
  options,
  aide,
}: {
  legende: string;
  name: string;
  options: Array<{ valeur: string; label: string }>;
  aide?: string;
}) {
  return (
    <fieldset>
      <legend className="text-meta font-semibold text-ink">{legende}</legend>
      {aide && <p className="mt-1 text-mini text-mut">{aide}</p>}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {options.map((o) => (
          <div key={o.valeur} className="flex items-center gap-3">
            <input
              id={`${name}-${o.valeur}`}
              name={name}
              value={o.valeur}
              type="checkbox"
              className="size-[18px] shrink-0 rounded border-line accent-[var(--color-acc)]"
            />
            <label htmlFor={`${name}-${o.valeur}`} className="text-body text-mut">
              {o.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
