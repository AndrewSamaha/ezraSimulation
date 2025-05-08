CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" uuid,
	"step_number" integer NOT NULL,
	"frame_duration" integer,
	"organism_calculation_time" integer,
	"fps" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "simulation_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"simulation_id" uuid,
	"step_number" integer NOT NULL,
	"step_data" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_step" integer DEFAULT 0,
	"configuration" json
);
--> statement-breakpoint
CREATE TABLE "step_unique_index" (
	"simulation_id" uuid,
	"step_number" integer NOT NULL,
	CONSTRAINT "step_unique_index_simulation_id_step_number_pk" PRIMARY KEY("simulation_id","step_number")
);
--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_steps" ADD CONSTRAINT "simulation_steps_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_unique_index" ADD CONSTRAINT "step_unique_index_simulation_id_simulations_id_fk" FOREIGN KEY ("simulation_id") REFERENCES "public"."simulations"("id") ON DELETE cascade ON UPDATE no action;