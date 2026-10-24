import {
  pgTable,
  uuid,
  text,
  smallint,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { clubRoleEnum } from './enums'
import { users } from './users'
import { clubs, studentProfiles } from './profiles'

// ==========================================
// CLUBS & VERIFICATIONS
// ==========================================

export const clubMemberships = pgTable(
  'club_memberships',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
    /**
     * Nullable — membership record may exist before the user has an account.
     */
    userId: uuid('user_id').references(() => users.id),
    role: clubRoleEnum('role').notNull().default('member'),
    fullName: text('full_name').notNull(),
    usn: text('usn').notNull(),
    email: text('email').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    uniqueIndex('idx_club_memberships_usn_active')
      .on(table.clubId, table.usn)
      .where(sql`${table.isActive} = true`),
    uniqueIndex('idx_club_memberships_email_active')
      .on(table.clubId, table.email)
      .where(sql`${table.isActive} = true`),
    index('idx_club_memberships_email').on(table.email),
    index('idx_club_memberships_club').on(table.clubId),
  ],
)

export const verificationRequests = pgTable('verification_requests', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
  usn: text('usn').notNull(),
  /**
   * Nullable — student may not specify a club when submitting.
   */
  clubId: uuid('club_id').references(() => clubs.id),
  /**
   * Nullable — set when an auto-match is found against club_memberships.
   */
  matchedClubMembershipId: uuid('matched_club_membership_id').references(() => clubMemberships.id),
  autoMatched: boolean('auto_matched').notNull().default(false),
  submittedAt: timestamp('submitted_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  appliedAt: timestamp('applied_at', { withTimezone: true }),
  resubmitCount: smallint('resubmit_count').notNull().default(0),
})

export const badgeRevocation = pgTable(
  'badge_revocation',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
    clubMembershipId: uuid('club_membership_id')
      .notNull()
      .references(() => clubMemberships.id),
    flaggedAt: timestamp('flagged_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    /**
     * Nullable — unresolved revocations have no resolver yet.
     */
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolution: text('resolution'),
  },
  (table) => [index('idx_revocation_pending').on(table.flaggedAt)],
)

export type ClubMembership = typeof clubMemberships.$inferSelect
export type NewClubMembership = typeof clubMemberships.$inferInsert
export type VerificationRequest = typeof verificationRequests.$inferSelect
export type NewVerificationRequest = typeof verificationRequests.$inferInsert
export type BadgeRevocation = typeof badgeRevocation.$inferSelect
export type NewBadgeRevocation = typeof badgeRevocation.$inferInsert
