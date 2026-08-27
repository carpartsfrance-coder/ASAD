import Image from "next/image";
import { Container } from "./Container";
import { PhotoAgrandissable } from "./PhotoAgrandissable";
import { cn } from "@/lib/cn";
import type { Photo } from "@/types";

interface PageHeaderProps {
  surtitre?: string;
  titre: string;
  chapo?: string;
  photo?: Photo;
  children?: React.ReactNode;
  className?: string;
}

/** En-tête des pages intérieures : sur-titre, H1, chapô et visuel optionnel. */
export function PageHeader({
  surtitre,
  titre,
  chapo,
  photo,
  children,
  className,
}: PageHeaderProps) {
  return (
    <Container as="header" className={cn("pt-10 pb-2 lg:pt-14", className)}>
      <div
        className={cn(
          photo && "grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]",
        )}
      >
        <div>
          {surtitre && (
            <p className="mb-5 text-tiny font-bold tracking-[0.2em] uppercase text-pri">
              {surtitre}
            </p>
          )}
          <h1 className="max-w-[720px] text-[32px] leading-[1.14] font-extrabold tracking-[-0.022em] text-ink sm:text-[40px] lg:text-[46px]">
            {titre}
          </h1>
          {chapo && (
            <p className="mt-5 max-w-[640px] text-[16.5px] leading-[1.72] text-mut lg:text-card">
              {chapo}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>

        {photo && (
          <PhotoAgrandissable
            photo={photo}
            libelle="cette photo"
            className="aspect-[4/3] w-full rounded-panel bg-soft lg:aspect-[7/5]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              priority
            />
          </PhotoAgrandissable>
        )}
      </div>
    </Container>
  );
}
