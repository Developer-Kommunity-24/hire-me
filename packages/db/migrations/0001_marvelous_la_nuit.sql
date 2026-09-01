DROP INDEX "idx_club_memberships_usn_active";--> statement-breakpoint
DROP INDEX "idx_club_memberships_email_active";--> statement-breakpoint
ALTER TABLE "club_memberships" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_club_memberships_usn_active" ON "club_memberships" USING btree ("club_id","usn") WHERE "club_memberships"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_club_memberships_email_active" ON "club_memberships" USING btree ("club_id","email") WHERE "club_memberships"."is_active" = true;