import { cn } from "@/lib/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "header" | "footer" | "nav" | "main" | "article";
  children: React.ReactNode;
}

/**
 * Conteneur du design : 1360 px maximum, centré, 40 px de marge latérale
 * en desktop (réduits sur les petits écrans).
 */
export function Container({
  children,
  className,
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[1360px] px-5 sm:px-7 lg:px-10", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
