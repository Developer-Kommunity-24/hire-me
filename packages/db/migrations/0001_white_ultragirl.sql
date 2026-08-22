ALTER TABLE "recruiters" ADD COLUMN "job_title" text;--> statement-breakpoint
ALTER TABLE "recruiters" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "recruiters" ADD COLUMN "is_complete" boolean DEFAULT false NOT NULL;