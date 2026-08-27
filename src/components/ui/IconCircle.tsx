import { cn } from "@/lib/cn";

/** Cercle pastel contenant une icône — bandeau de chiffres (64 px) et cartes d'aide (72 px). */
export function IconCircle({
  children,
  taille = 64,
  className,
}: {
  children: React.ReactNode;
  taille?: 64 | 72;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-soft text-pri",
        taille === 64 ? "size-16" : "size-[72px]",
        className,
      )}
    >
      {children}
    </span>
  );
}
