CREATE TYPE "public"."card_status" AS ENUM('inactive', 'active', 'blocked');--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"last_four_digits" varchar(4) NOT NULL,
	"status" "card_status" DEFAULT 'inactive' NOT NULL,
	"spending_limit" integer NOT NULL,
	"current_spend" integer DEFAULT 0 NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;