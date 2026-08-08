CREATE TYPE "public"."categorie_intrant" AS ENUM('SEMENCE', 'ENGRAIS', 'PESTICIDE', 'HERBICIDE', 'FONGICIDE', 'INSECTICIDE', 'OUTIL', 'CARBURANT', 'AUTRE');--> statement-breakpoint
CREATE TYPE "public"."niveau_alerte" AS ENUM('INFO', 'WARNING', 'DANGER', 'CRITIQUE');--> statement-breakpoint
CREATE TYPE "public"."statut_alerte" AS ENUM('ACTIVE', 'ACQUITTEE', 'RESOLUE');--> statement-breakpoint
CREATE TYPE "public"."statut_employe" AS ENUM('ACTIF', 'CONGE', 'SUSPENDU', 'INACTIF');--> statement-breakpoint
CREATE TYPE "public"."statut_facture" AS ENUM('BROUILLON', 'VALIDEE', 'PAYEE', 'PARTIELLEMENT', 'IMPAYEE');--> statement-breakpoint
CREATE TYPE "public"."statut_stock" AS ENUM('RUPTURE', 'CRITIQUE', 'FAIBLE', 'OK', 'SURSTOCK');--> statement-breakpoint
CREATE TYPE "public"."type_alerte" AS ENUM('STOCK_FAIBLE', 'STOCK_CRITIQUE', 'RUPTURE', 'SURSTOCK', 'PEREMPTION');--> statement-breakpoint
CREATE TYPE "public"."type_compte" AS ENUM('CAISSE', 'BANQUE');--> statement-breakpoint
CREATE TYPE "public"."type_contrat" AS ENUM('CDI', 'CDD', 'JOURNALIER', 'PRESTATAIRE');--> statement-breakpoint
CREATE TYPE "public"."type_mouvement" AS ENUM('ENTREE', 'SORTIE', 'AJUSTEMENT');--> statement-breakpoint
CREATE TYPE "public"."type_transaction" AS ENUM('ENTREE', 'SORTIE');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(120) NOT NULL,
	"type" "type_compte" DEFAULT 'CAISSE' NOT NULL,
	"solde" numeric(16, 2) DEFAULT '0' NOT NULL,
	"devise" varchar(10) DEFAULT 'CDF' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_role" varchar(40),
	"user_name" varchar(150),
	"title" varchar(200) DEFAULT 'Nouvelle conversation' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"provider" varchar(40),
	"tokens_used" integer,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(80) NOT NULL,
	"value" text,
	"description" varchar(200),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "alerte_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"niveau" "niveau_alerte" NOT NULL,
	"type" "type_alerte" NOT NULL,
	"message" text NOT NULL,
	"statut" "statut_alerte" DEFAULT 'ACTIVE' NOT NULL,
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"seuil" numeric(12, 2),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"extrait" text NOT NULL,
	"contenu" text NOT NULL,
	"image" text,
	"auteur" varchar(150) DEFAULT 'Direction KasayiMultiBusiness' NOT NULL,
	"categorie" varchar(60),
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"date" date NOT NULL,
	"check_in" varchar(10),
	"check_out" varchar(10),
	"statut" varchar(20) DEFAULT 'present' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"module" varchar(40) NOT NULL,
	"table" varchar(60),
	"record_id" varchar(60),
	"old_values" jsonb,
	"new_values" jsonb,
	"ip" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"location" varchar(200),
	"telephone" varchar(30),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"type" varchar(60),
	"description" text,
	"montant" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"unite" varchar(20),
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"prix_achat" numeric(14, 2) DEFAULT '0' NOT NULL,
	"seuil_alerte" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"numero" varchar(60),
	"montant_ht" numeric(16, 2) DEFAULT '0' NOT NULL,
	"taxe" numeric(16, 2) DEFAULT '0' NOT NULL,
	"total_ttc" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"statut" varchar(20) DEFAULT 'emise' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"client" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"date_souhaitee" date,
	"nb_personnes" integer,
	"description" text,
	"statut" varchar(20) DEFAULT 'nouvelle' NOT NULL,
	"event_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_purchase" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"prix_achat" numeric(14, 2) DEFAULT '0' NOT NULL,
	"fournisseur" varchar(150),
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"nom" varchar(150) NOT NULL,
	"role" varchar(100),
	"cout" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" text NOT NULL,
	"telephone" varchar(30),
	"entreprise" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"email" varchar(150),
	"adresse" text,
	"type" varchar(20) DEFAULT 'particulier' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commerce_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(200) NOT NULL,
	"categorie" varchar(80),
	"unite" varchar(20) DEFAULT 'pièce' NOT NULL,
	"prix_achat" numeric(14, 2) DEFAULT '0' NOT NULL,
	"prix_vente" numeric(14, 2) DEFAULT '0' NOT NULL,
	"stock_min" numeric(12, 2) DEFAULT '0' NOT NULL,
	"stock" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commerce_purchase" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur" varchar(150),
	"reference" varchar(80),
	"total" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) DEFAULT 'KasayiMultiBusiness' NOT NULL,
	"slogan" varchar(200),
	"adresse" varchar(250),
	"ville" varchar(100),
	"telephone" varchar(30),
	"email" varchar(150),
	"nif" varchar(50),
	"rc" varchar(50),
	"rccm" varchar(50),
	"devise_principale" varchar(10) DEFAULT 'CDF' NOT NULL,
	"tva_taux" numeric(5, 2) DEFAULT '16' NOT NULL,
	"logo_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"sujet" varchar(200),
	"activite" varchar(60),
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "culture" (
	"id" serial PRIMARY KEY NOT NULL,
	"parcelle_id" integer NOT NULL,
	"nom" varchar(150) NOT NULL,
	"variete" varchar(100),
	"date_semis" date,
	"date_recolte_prevue" date,
	"superficie" numeric(12, 2) DEFAULT '0' NOT NULL,
	"main_oeuvre" numeric(14, 2) DEFAULT '0' NOT NULL,
	"statut" varchar(20) DEFAULT 'en_cours' NOT NULL,
	"responsable" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "depense" (
	"id" serial PRIMARY KEY NOT NULL,
	"nature" varchar(100) NOT NULL,
	"montant" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"activite" varchar(40) DEFAULT 'general' NOT NULL,
	"categorie" varchar(60),
	"responsable" varchar(150),
	"mode_paiement" varchar(40),
	"justificatif" varchar(200),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"numero_permis" varchar(50),
	"permis_expiration" date,
	"vehicle_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"type" varchar(40) DEFAULT 'autre' NOT NULL,
	"nom_fichier" varchar(200),
	"url" text,
	"date_ajout" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"type" varchar(40) NOT NULL,
	"description" text NOT NULL,
	"date" date,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"matricule" varchar(30),
	"prenom" varchar(100) NOT NULL,
	"nom" varchar(100) NOT NULL,
	"genre" varchar(10),
	"date_naissance" date,
	"lieu_naissance" varchar(150),
	"situation_familiale" varchar(30),
	"nb_enfants" integer DEFAULT 0 NOT NULL,
	"telephone" varchar(30),
	"email" varchar(150),
	"adresse" text,
	"cin" varchar(30),
	"photo_url" varchar(300),
	"date_embauche" date,
	"type_contrat" "type_contrat" DEFAULT 'CDI' NOT NULL,
	"departement" varchar(80),
	"poste" varchar(100),
	"grade" varchar(80),
	"salaire_base" numeric(14, 2) DEFAULT '0' NOT NULL,
	"statut" "statut_employe" DEFAULT 'ACTIF' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom_client" varchar(150) NOT NULL,
	"type_evenement" varchar(80),
	"date_evenement" timestamp with time zone,
	"lieu" varchar(200),
	"nb_invites" integer,
	"montant_total" numeric(16, 2) DEFAULT '0' NOT NULL,
	"statut" varchar(20) DEFAULT 'planifie' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"devise" varchar(10) NOT NULL,
	"rate" numeric(18, 4) NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"set_by" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(250) NOT NULL,
	"reponse" text NOT NULL,
	"categorie" varchar(60),
	"ordre" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fournisseur" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"email" varchar(150),
	"adresse" text,
	"contact" varchar(150),
	"type_semence" varchar(100),
	"conditions_paiement" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_record" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"date" date,
	"litres" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cout" numeric(14, 2) DEFAULT '0' NOT NULL,
	"odometer" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaves" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"type" varchar(40) NOT NULL,
	"date_debut" date NOT NULL,
	"date_fin" date NOT NULL,
	"jours" numeric(6, 1) DEFAULT '1' NOT NULL,
	"statut" varchar(20) DEFAULT 'pending' NOT NULL,
	"approuve_par" varchar(150)
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" varchar(150),
	"success" boolean DEFAULT true NOT NULL,
	"reason" varchar(150),
	"ip" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"date" date,
	"type" varchar(60),
	"description" text,
	"cout" numeric(14, 2) DEFAULT '0' NOT NULL,
	"prochain_km" integer,
	"prochaine_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"description" text,
	"prix_par_personne" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mouvement_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "type_mouvement" NOT NULL,
	"quantite" numeric(14, 2) NOT NULL,
	"prix_achat" numeric(14, 4),
	"motif" varchar(200),
	"reference" varchar(100),
	"mode_paiement" varchar(40),
	"fournisseur_id" integer,
	"quantite_avant" numeric(14, 2) NOT NULL,
	"quantite_apres" numeric(14, 2) NOT NULL,
	"cmup_avant" numeric(14, 4) NOT NULL,
	"cmup_apres" numeric(14, 4) NOT NULL,
	"valeur" numeric(16, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"source" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(150) NOT NULL,
	"message" text,
	"type" varchar(40),
	"link" varchar(200),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcelle" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"localisation" varchar(200),
	"surface" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unite_surface" varchar(10) DEFAULT 'ha' NOT NULL,
	"statut" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payables" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur" varchar(150) NOT NULL,
	"module" varchar(40),
	"reference" varchar(100),
	"montant_total" numeric(16, 2) DEFAULT '0' NOT NULL,
	"montant_paye" numeric(16, 2) DEFAULT '0' NOT NULL,
	"reste" numeric(16, 2) DEFAULT '0' NOT NULL,
	"echeance" date,
	"statut" "statut_facture" DEFAULT 'IMPAYEE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"mois" integer NOT NULL,
	"annee" integer NOT NULL,
	"salaire_base" numeric(14, 2) DEFAULT '0' NOT NULL,
	"heures_sup" numeric(14, 2) DEFAULT '0' NOT NULL,
	"primes" numeric(14, 2) DEFAULT '0' NOT NULL,
	"deductions" numeric(14, 2) DEFAULT '0' NOT NULL,
	"cnss" numeric(14, 2) DEFAULT '0' NOT NULL,
	"ipr" numeric(14, 2) DEFAULT '0' NOT NULL,
	"salaire_net" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date_paiement" timestamp with time zone,
	"statut" varchar(20) DEFAULT 'brouillon' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" varchar(40) NOT NULL,
	"action" varchar(40) NOT NULL,
	"description" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "produit_intrant" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(200) NOT NULL,
	"categorie" "categorie_intrant" DEFAULT 'AUTRE' NOT NULL,
	"unite" varchar(20) DEFAULT 'kg' NOT NULL,
	"description" text,
	"seuil_alerte" numeric(12, 2) DEFAULT '0' NOT NULL,
	"seuil_critique" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" varchar(60),
	"description" text,
	"montant" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"numero" varchar(60),
	"montant_ht" numeric(16, 2) DEFAULT '0' NOT NULL,
	"taxe" numeric(16, 2) DEFAULT '0' NOT NULL,
	"total_ttc" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"echeance" date,
	"statut" varchar(20) DEFAULT 'emise' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_material" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"designation" varchar(150) NOT NULL,
	"quantite" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unite" varchar(20),
	"cout_unitaire" numeric(14, 2) DEFAULT '0' NOT NULL,
	"fournisseur" varchar(150),
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"montant" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"methode" varchar(40),
	"reference" varchar(80),
	"statut" varchar(20) DEFAULT 'recu' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"avancement" numeric(5, 2) DEFAULT '0' NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"nom" varchar(150) NOT NULL,
	"role" varchar(100),
	"cout_main_oeuvre" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(200) NOT NULL,
	"type" varchar(80),
	"client" varchar(150),
	"localisation" varchar(200),
	"date_debut" date,
	"date_fin" date,
	"budget" numeric(16, 2) DEFAULT '0' NOT NULL,
	"avancement" numeric(5, 2) DEFAULT '0' NOT NULL,
	"statut" varchar(20) DEFAULT 'encours' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receivables" (
	"id" serial PRIMARY KEY NOT NULL,
	"client" varchar(150) NOT NULL,
	"module" varchar(40),
	"reference" varchar(100),
	"montant_total" numeric(16, 2) DEFAULT '0' NOT NULL,
	"montant_paye" numeric(16, 2) DEFAULT '0' NOT NULL,
	"reste" numeric(16, 2) DEFAULT '0' NOT NULL,
	"echeance" date,
	"statut" "statut_facture" DEFAULT 'IMPAYEE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recette" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(100) NOT NULL,
	"description" varchar(200),
	"montant" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"activite" varchar(40) DEFAULT 'general' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recolte" (
	"id" serial PRIMARY KEY NOT NULL,
	"culture_id" integer NOT NULL,
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unite" varchar(20),
	"qualite" varchar(40),
	"pertes" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" varchar(40) NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"designation" varchar(200) NOT NULL,
	"quantite" numeric(14, 2) NOT NULL,
	"prix_unitaire" numeric(14, 2) NOT NULL,
	"total" numeric(16, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"client" varchar(150),
	"reference" varchar(100),
	"total_ht" numeric(16, 2) DEFAULT '0' NOT NULL,
	"taxe" numeric(16, 2) DEFAULT '0' NOT NULL,
	"total_ttc" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"statut" "statut_facture" DEFAULT 'BROUILLON' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_account_id" integer,
	"nom" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"telephone" varchar(30),
	"activite" varchar(60),
	"description" text NOT NULL,
	"statut" varchar(20) DEFAULT 'nouveau' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"nom" varchar(120) NOT NULL,
	"emoji" varchar(10),
	"accroche" varchar(120),
	"description" text,
	"image" text,
	"points" jsonb,
	"ordre" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stock_intrant" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"cmup" numeric(14, 4) DEFAULT '0' NOT NULL,
	"valeur_stock" numeric(16, 2) DEFAULT '0' NOT NULL,
	"statut" "statut_stock" DEFAULT 'OK' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_contract" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"reference" varchar(60),
	"objet" varchar(200),
	"montant" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date_signature" date,
	"date_debut" date,
	"date_fin" date,
	"statut" varchar(20) DEFAULT 'signe' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(40) NOT NULL,
	"periode" varchar(20),
	"montant" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date_paiement" date,
	"echeance" date,
	"reference" varchar(80),
	"statut" varchar(20) DEFAULT 'a_payer' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toll" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer,
	"lieu" varchar(120),
	"cout" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traitement_culture" (
	"id" serial PRIMARY KEY NOT NULL,
	"culture_id" integer NOT NULL,
	"type" varchar(60),
	"produit" varchar(150),
	"quantite" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unite" varchar(20),
	"cout" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"type" "type_transaction" NOT NULL,
	"montant" numeric(16, 2) NOT NULL,
	"description" text,
	"module" varchar(40),
	"reference" varchar(100),
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_account_id" integer NOT NULL,
	"to_account_id" integer NOT NULL,
	"montant" numeric(16, 2) NOT NULL,
	"description" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"type" varchar(60),
	"description" text,
	"montant" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"driver_id" integer,
	"client" varchar(150),
	"origine" varchar(120),
	"destination" varchar(120),
	"date_depart" timestamp with time zone,
	"date_retour" timestamp with time zone,
	"kilometrage" integer,
	"revenu" numeric(16, 2) DEFAULT '0' NOT NULL,
	"statut" varchar(20) DEFAULT 'planifie' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" text,
	"role_id" varchar(40),
	"is_active" boolean DEFAULT true NOT NULL,
	"avatar" text,
	"phone" varchar(30),
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"type" varchar(40) DEFAULT 'assurance' NOT NULL,
	"numero" varchar(80),
	"date_emission" date,
	"date_expiration" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_rental" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(150) NOT NULL,
	"proprietaire" varchar(150),
	"cout_location" numeric(14, 2) DEFAULT '0' NOT NULL,
	"date_debut" date,
	"date_fin" date,
	"statut" varchar(20) DEFAULT 'en_cours' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"plaque" varchar(30) NOT NULL,
	"marque" varchar(80),
	"modele" varchar(80),
	"type" varchar(60),
	"capacite" varchar(40),
	"statut" varchar(20) DEFAULT 'actif' NOT NULL,
	"date_achat" date,
	"annee" integer,
	"cout_achat" numeric(16, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vente_agricole" (
	"id" serial PRIMARY KEY NOT NULL,
	"culture_id" integer NOT NULL,
	"produit" varchar(150),
	"client" varchar(150),
	"quantite" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unite" varchar(20),
	"prix_unitaire" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total" numeric(16, 2) DEFAULT '0' NOT NULL,
	"date" date,
	"montant_paye" numeric(16, 2) DEFAULT '0' NOT NULL,
	"statut_paiement" varchar(20) DEFAULT 'non_paye' NOT NULL,
	"date_paiement" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_conversation_id_ai_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerte_stock" ADD CONSTRAINT "alerte_stock_produit_id_produit_intrant_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit_intrant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_expense" ADD CONSTRAINT "catering_expense_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_invoice" ADD CONSTRAINT "catering_invoice_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_order" ADD CONSTRAINT "catering_order_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_purchase" ADD CONSTRAINT "catering_purchase_ingredient_id_catering_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."catering_ingredient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_staff" ADD CONSTRAINT "catering_staff_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "culture" ADD CONSTRAINT "culture_parcelle_id_parcelle_id_fk" FOREIGN KEY ("parcelle_id") REFERENCES "public"."parcelle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_history" ADD CONSTRAINT "employee_history_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_record" ADD CONSTRAINT "fuel_record_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mouvement_stock" ADD CONSTRAINT "mouvement_stock_produit_id_produit_intrant_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit_intrant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mouvement_stock" ADD CONSTRAINT "mouvement_stock_fournisseur_id_fournisseur_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseur"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_expense" ADD CONSTRAINT "project_expense_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_invoice" ADD CONSTRAINT "project_invoice_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_material" ADD CONSTRAINT "project_material_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_payment" ADD CONSTRAINT "project_payment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team" ADD CONSTRAINT "project_team_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recolte" ADD CONSTRAINT "recolte_culture_id_culture_id_fk" FOREIGN KEY ("culture_id") REFERENCES "public"."culture"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_client_account_id_client_accounts_id_fk" FOREIGN KEY ("client_account_id") REFERENCES "public"."client_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_intrant" ADD CONSTRAINT "stock_intrant_produit_id_produit_intrant_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit_intrant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_contract" ADD CONSTRAINT "sub_contract_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toll" ADD CONSTRAINT "toll_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traitement_culture" ADD CONSTRAINT "traitement_culture_culture_id_culture_id_fk" FOREIGN KEY ("culture_id") REFERENCES "public"."culture"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_expense" ADD CONSTRAINT "transport_expense_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_document" ADD CONSTRAINT "vehicle_document_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente_agricole" ADD CONSTRAINT "vente_agricole_culture_id_culture_id_fk" FOREIGN KEY ("culture_id") REFERENCES "public"."culture"("id") ON DELETE cascade ON UPDATE no action;