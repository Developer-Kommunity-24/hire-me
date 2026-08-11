CREATE TYPE "public"."achievement_type" AS ENUM('hackathon', 'certification', 'award', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('applied', 'under_review', 'shortlisted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."club_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."dk24_status" AS ENUM('none', 'pending', 'verified', 'rejected', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('internship', 'full_time', 'part_time', 'contract');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('new_matching_posting', 'application_received', 'status_changed', 'verification_result', 'recruiter_approved', 'admin_queue_reminder');--> statement-breakpoint
CREATE TYPE "public"."posting_status" AS ENUM('active', 'closed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'recruiter', 'core_admin', 'club_admin');--> statement-breakpoint
CREATE TYPE "public"."verification_decision" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."work_arrangement" AS ENUM('in_person', 'remote', 'hybrid');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"roles" "user_role"[] DEFAULT '{student}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "club_admins" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"club_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clubs_name_unique" UNIQUE("name"),
	CONSTRAINT "clubs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recruiters" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"company_mail" text NOT NULL,
	"company_url" text,
	"headquarters_location" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"headline" text,
	"grad_year" smallint,
	"open_to_work" boolean DEFAULT false NOT NULL,
	"resume_url" text,
	"github_url" text,
	"linkedin_url" text,
	"other_links" jsonb,
	"dk24_status" "dk24_status" DEFAULT 'none' NOT NULL,
	"consent_given_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"type" "achievement_type" DEFAULT 'other' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"phone" text,
	CONSTRAINT "contact_details_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"role" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"contributions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"role" text,
	"contributions" text,
	"learnings" text,
	"skills_used" text[],
	"live_url" text,
	"github_url" text,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"skill" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"posting_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"stack" text[],
	"employment_type" "employment_type" NOT NULL,
	"work_arrangement" "work_arrangement" NOT NULL,
	"seniority_level" text,
	"compensation" text,
	"location" text,
	"deadline" date,
	"status" "posting_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge_revocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"club_membership_id" uuid NOT NULL,
	"flagged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolution" text
);
--> statement-breakpoint
CREATE TABLE "club_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"user_id" uuid,
	"role" "club_role" DEFAULT 'member' NOT NULL,
	"full_name" text NOT NULL,
	"usn" text NOT NULL,
	"email" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"usn" text NOT NULL,
	"club_id" uuid,
	"matched_club_membership_id" uuid,
	"auto_matched" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_at" timestamp with time zone,
	"resubmit_count" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_admins" ADD CONSTRAINT "club_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_admins" ADD CONSTRAINT "club_admins_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_details" ADD CONSTRAINT "contact_details_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience" ADD CONSTRAINT "experience_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_posting_id_postings_id_fk" FOREIGN KEY ("posting_id") REFERENCES "public"."postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postings" ADD CONSTRAINT "postings_recruiter_id_recruiters_user_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_revocation" ADD CONSTRAINT "badge_revocation_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_revocation" ADD CONSTRAINT "badge_revocation_club_membership_id_club_memberships_id_fk" FOREIGN KEY ("club_membership_id") REFERENCES "public"."club_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_revocation" ADD CONSTRAINT "badge_revocation_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_matched_club_membership_id_club_memberships_id_fk" FOREIGN KEY ("matched_club_membership_id") REFERENCES "public"."club_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_club_admins_user_club" ON "club_admins" USING btree ("user_id","club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_skills_student_skill" ON "skills" USING btree ("student_id","skill");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_applications_posting_student" ON "applications" USING btree ("posting_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_revocation_pending" ON "badge_revocation" USING btree ("flagged_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_club_memberships_usn_active" ON "club_memberships" USING btree ("club_id","usn");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_club_memberships_email_active" ON "club_memberships" USING btree ("club_id","email");--> statement-breakpoint
CREATE INDEX "idx_club_memberships_email" ON "club_memberships" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_club_memberships_club" ON "club_memberships" USING btree ("club_id");