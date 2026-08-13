import {
  pgTable,
  uuid,
  text,
  smallint,
  boolean,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { dk24StatusEnum } from './enums'
import { users } from './users'

// ==========================================
// ROLE-SPECIFIC TABLES (Subtypes)
// ==========================================

export const studentProfiles = pgTable('student_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  headline: text('headline'),
  gradYear: smallint('grad_year'),
  openToWork: boolean('open_to_work').notNull().default(false),
  resumeUrl: text('resume_url'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  otherLinks: jsonb('other_links'),
  dk24Status: dk24StatusEnum('dk24_status').notNull().default('none'),
  consentGivenAt: timestamp('consent_given_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const recruiters = pgTable('recruiters', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  companyMail: text('company_mail').notNull(),
  companyUrl: text('company_url'),
  headquartersLocation: text('headquarters_location'),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const clubs = pgTable('clubs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const clubAdmins = pgTable(
  'club_admins',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('idx_club_admins_user_club').on(table.userId, table.clubId)],
)

export type StudentProfile = typeof studentProfiles.$inferSelect
export type NewStudentProfile = typeof studentProfiles.$inferInsert
export type Recruiter = typeof recruiters.$inferSelect
export type NewRecruiter = typeof recruiters.$inferInsert
export type Club = typeof clubs.$inferSelect
export type NewClub = typeof clubs.$inferInsert
export type ClubAdmin = typeof clubAdmins.$inferSelect
export type NewClubAdmin = typeof clubAdmins.$inferInsert
