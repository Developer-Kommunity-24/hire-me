import { pgTable, uuid, text, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import {
  employmentTypeEnum,
  workArrangementEnum,
  postingStatusEnum,
  applicationStatusEnum,
} from './enums'
import { recruiters, studentProfiles } from './profiles'

// ==========================================
// RECRUITMENT & JOB POSTINGS
// ==========================================

export const postings = pgTable('postings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recruiterId: uuid('recruiter_id')
    .notNull()
    .references(() => recruiters.userId, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  /**
   * text[] — Postgres text array for the tech stack.
   */
  stack: text('stack').array(),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  workArrangement: workArrangementEnum('work_arrangement').notNull(),
  seniorityLevel: text('seniority_level'),
  compensation: text('compensation'),
  location: text('location'),
  deadline: date('deadline'),
  status: postingStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const applications = pgTable(
  'applications',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    postingId: uuid('posting_id')
      .notNull()
      .references(() => postings.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
    status: applicationStatusEnum('status').notNull().default('applied'),
    appliedAt: timestamp('applied_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [uniqueIndex('idx_applications_posting_student').on(table.postingId, table.studentId)],
)

export type Posting = typeof postings.$inferSelect
export type NewPosting = typeof postings.$inferInsert
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
