CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google', 'apple');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'modified', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('client', 'tech');--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prompt" text NOT NULL,
	"generated_images" jsonb NOT NULL,
	"selected_image_url" text,
	"look_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color_palettes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"colors" jsonb NOT NULL,
	"brand_name" varchar(255),
	"is_public" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"look_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"tech_id" integer NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"client_message" text,
	"tech_response" text,
	"estimated_price" numeric(10, 2),
	"appointment_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"look_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "looks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"original_image_url" text,
	"ai_prompt" text,
	"nail_positions" jsonb,
	"is_public" boolean DEFAULT false,
	"share_token" varchar(100),
	"allow_collaborative_edit" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "looks_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"related_id" integer,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"design_request_id" integer,
	"rating" integer NOT NULL,
	"comment" text,
	"images" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"duration" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tech_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" varchar(255),
	"location" varchar(255),
	"bio" text,
	"rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"phone_number" varchar(50),
	"website" varchar(255),
	"instagram_handle" varchar(100),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tech_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"auth_provider" "auth_provider" DEFAULT 'email' NOT NULL,
	"user_type" "user_type" NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_look_id_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "public"."looks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color_palettes" ADD CONSTRAINT "color_palettes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_look_id_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "public"."looks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_tech_id_users_id_fk" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_look_id_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "public"."looks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "looks" ADD CONSTRAINT "looks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_design_request_id_design_requests_id_fk" FOREIGN KEY ("design_request_id") REFERENCES "public"."design_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_profiles" ADD CONSTRAINT "tech_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;