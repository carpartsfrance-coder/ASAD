CREATE TYPE "public"."categorie_actualite" AS ENUM('sauvetage', 'evenement', 'association', 'appel');--> statement-breakpoint
CREATE TYPE "public"."compat" AS ENUM('oui', 'non', 'a_tester', 'avec_conditions');--> statement-breakpoint
CREATE TYPE "public"."espece" AS ENUM('chien', 'chat', 'autre');--> statement-breakpoint
CREATE TYPE "public"."priorite" AS ENUM('haute', 'moyenne', 'basse');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'editeur', 'benevole');--> statement-breakpoint
CREATE TYPE "public"."sexe" AS ENUM('male', 'femelle');--> statement-breakpoint
CREATE TYPE "public"."statut_animal" AS ENUM('brouillon', 'a_adopter', 'urgent', 'reserve', 'adopte');--> statement-breakpoint
CREATE TYPE "public"."statut_campagne" AS ENUM('active', 'terminee');--> statement-breakpoint
CREATE TYPE "public"."statut_candidature" AS ENUM('nouvelle', 'a_etudier', 'active', 'refusee', 'archivee');--> statement-breakpoint
CREATE TYPE "public"."statut_demande" AS ENUM('nouvelle', 'a_contacter', 'entretien_prevu', 'visite_prevue', 'acceptee', 'refusee', 'classee', 'archivee');--> statement-breakpoint
CREATE TYPE "public"."statut_message" AS ENUM('en_attente', 'publie', 'refuse', 'indesirable', 'archive');--> statement-breakpoint
CREATE TYPE "public"."statut_signalement" AS ENUM('nouveau', 'a_verifier', 'en_cours', 'intervention_prevue', 'pris_en_charge', 'transmis', 'sans_suite', 'cloture');--> statement-breakpoint
CREATE TYPE "public"."taille" AS ENUM('petit', 'moyen', 'grand');--> statement-breakpoint
CREATE TABLE "actualites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"categorie" "categorie_actualite" DEFAULT 'association' NOT NULL,
	"date" text NOT NULL,
	"chapo" text DEFAULT '' NOT NULL,
	"paragraphes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"photo_alt" text DEFAULT '' NOT NULL,
	"afficher_sur_accueil" boolean DEFAULT false NOT NULL,
	"publie" boolean DEFAULT false NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animaux" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"espece" "espece" NOT NULL,
	"espece_autre" text,
	"sexe" "sexe" NOT NULL,
	"race" text,
	"age" text NOT NULL,
	"age_mois" integer DEFAULT 0 NOT NULL,
	"date_naissance_estimee" text,
	"identification" text,
	"nombre_animaux_portee" integer,
	"taille" "taille" DEFAULT 'moyen' NOT NULL,
	"poids_kg" real,
	"commune" text DEFAULT '' NOT NULL,
	"description_courte" text DEFAULT '' NOT NULL,
	"histoire" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"caractere" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"caractere_note" text,
	"compat_chiens" "compat" DEFAULT 'a_tester' NOT NULL,
	"compat_chats" "compat" DEFAULT 'a_tester' NOT NULL,
	"compat_enfants" "compat" DEFAULT 'a_tester' NOT NULL,
	"compat_notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"identifie" boolean DEFAULT false NOT NULL,
	"vaccine" boolean DEFAULT false NOT NULL,
	"sterilise" boolean DEFAULT false NOT NULL,
	"sante_resume" text,
	"traitement" text,
	"environnement" text DEFAULT '' NOT NULL,
	"environnement_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"frais_adoption" integer DEFAULT 0 NOT NULL,
	"statut" "statut_animal" DEFAULT 'brouillon' NOT NULL,
	"afficher_sur_accueil" boolean DEFAULT false NOT NULL,
	"date_arrivee" text DEFAULT '' NOT NULL,
	"date_publication" text DEFAULT '' NOT NULL,
	"famille_accueil" text,
	"urgence_motif" text,
	"urgence_delai" text,
	"urgence_cta_label" text,
	"reserve_depuis" text,
	"adoption_date" text,
	"adoption_famille" text,
	"adoption_recit" text,
	"adoption_citation" text,
	"adoption_photo_url" text,
	"adoption_photo_alt" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benevoles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"commune" text DEFAULT '' NOT NULL,
	"reponses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statut" "statut_candidature" DEFAULT 'nouvelle' NOT NULL,
	"notes_internes" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campagnes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"animal_id" uuid,
	"type" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"echeance" text DEFAULT '' NOT NULL,
	"date_limite" text,
	"objectif" integer DEFAULT 0 NOT NULL,
	"collecte" integer DEFAULT 0 NOT NULL,
	"lien_hello_asso" text,
	"photo_url" text DEFAULT '' NOT NULL,
	"photo_alt" text DEFAULT '' NOT NULL,
	"statut" "statut_campagne" DEFAULT 'active' NOT NULL,
	"cta_label" text DEFAULT 'Participer' NOT NULL,
	"remerciement" text,
	"afficher_sur_accueil" boolean DEFAULT false NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contenu_site" (
	"cle" text PRIMARY KEY NOT NULL,
	"rubrique" text DEFAULT 'general' NOT NULL,
	"libelle" text DEFAULT '' NOT NULL,
	"valeur" jsonb NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandes_adoption" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"animal_id" uuid,
	"animal_nom" text DEFAULT '' NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"commune" text DEFAULT '' NOT NULL,
	"code_postal" text DEFAULT '' NOT NULL,
	"reponses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statut" "statut_demande" DEFAULT 'nouvelle' NOT NULL,
	"responsable_id" uuid,
	"notes_internes" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familles_accueil" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"commune" text DEFAULT '' NOT NULL,
	"reponses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statut" "statut_candidature" DEFAULT 'nouvelle' NOT NULL,
	"notes_internes" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_activite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auteur_id" uuid,
	"auteur_nom" text DEFAULT '' NOT NULL,
	"texte" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"legende" text,
	"taille" integer,
	"televerse_par" uuid,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages_livre_or" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom_public" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"ville" text,
	"message" text NOT NULL,
	"photo_url" text,
	"photo_alt" text,
	"animal_id" uuid,
	"animal_nom" text,
	"reponse_publique" text,
	"statut" "statut_message" DEFAULT 'en_attente' NOT NULL,
	"modere_par" uuid,
	"modere_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mises_a_jour_campagne" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campagne_id" uuid NOT NULL,
	"date" text NOT NULL,
	"texte" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos_animaux" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signalements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"priorite" "priorite" DEFAULT 'moyenne' NOT NULL,
	"espece" text DEFAULT '' NOT NULL,
	"etat_apparent" text DEFAULT '' NOT NULL,
	"lieu" text DEFAULT '' NOT NULL,
	"situation" text DEFAULT '' NOT NULL,
	"declarant_nom" text DEFAULT '' NOT NULL,
	"declarant_email" text DEFAULT '' NOT NULL,
	"declarant_telephone" text DEFAULT '' NOT NULL,
	"statut" "statut_signalement" DEFAULT 'nouveau' NOT NULL,
	"assigne_a" uuid,
	"notes_internes" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"mot_de_passe_hash" text NOT NULL,
	"role" "role" DEFAULT 'benevole' NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"derniere_connexion" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campagnes" ADD CONSTRAINT "campagnes_animal_id_animaux_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animaux"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_adoption" ADD CONSTRAINT "demandes_adoption_animal_id_animaux_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animaux"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_adoption" ADD CONSTRAINT "demandes_adoption_responsable_id_utilisateurs_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_activite" ADD CONSTRAINT "journal_activite_auteur_id_utilisateurs_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_televerse_par_utilisateurs_id_fk" FOREIGN KEY ("televerse_par") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_livre_or" ADD CONSTRAINT "messages_livre_or_animal_id_animaux_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animaux"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_livre_or" ADD CONSTRAINT "messages_livre_or_modere_par_utilisateurs_id_fk" FOREIGN KEY ("modere_par") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mises_a_jour_campagne" ADD CONSTRAINT "mises_a_jour_campagne_campagne_id_campagnes_id_fk" FOREIGN KEY ("campagne_id") REFERENCES "public"."campagnes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos_animaux" ADD CONSTRAINT "photos_animaux_animal_id_animaux_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animaux"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_assigne_a_utilisateurs_id_fk" FOREIGN KEY ("assigne_a") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "actualites_slug_unique" ON "actualites" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "animaux_slug_unique" ON "animaux" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "animaux_statut_idx" ON "animaux" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "campagnes_slug_unique" ON "campagnes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "contenu_rubrique_idx" ON "contenu_site" USING btree ("rubrique");--> statement-breakpoint
CREATE UNIQUE INDEX "demandes_reference_unique" ON "demandes_adoption" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "demandes_statut_idx" ON "demandes_adoption" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "livre_or_statut_idx" ON "messages_livre_or" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "photos_animal_idx" ON "photos_animaux" USING btree ("animal_id","position");--> statement-breakpoint
CREATE INDEX "signalements_statut_idx" ON "signalements" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "utilisateurs_email_unique" ON "utilisateurs" USING btree ("email");