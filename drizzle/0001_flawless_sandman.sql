ALTER TABLE "medias" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "taille" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "taille" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "donnees" "bytea";--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "nom_fichier" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "type_mime" text DEFAULT 'image/jpeg' NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "largeur" integer;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "hauteur" integer;