import { cn } from "@/lib/cn";

/** Mise en forme des pages de texte long (mentions légales, confidentialité). */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[780px] text-[16px] leading-[1.75] text-mut",
        "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-title [&_h2]:font-extrabold [&_h2]:text-ink",
        "[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-card [&_h3]:font-bold [&_h3]:text-ink",
        "[&_p]:mt-3.5",
        "[&_ul]:mt-3.5 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-acc",
        "[&_dl]:mt-3.5 [&_dt]:font-semibold [&_dt]:text-ink [&_dd]:mb-3",
        "[&_a]:font-semibold [&_a]:text-acc [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-acc-dark",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
