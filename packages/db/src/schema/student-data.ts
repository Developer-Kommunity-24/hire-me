import {
  pgTable,
  uuid,
  text,
  smallint,
  date,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { achievementTypeEnum } from './enums';
import { studentProfiles } from './profiles';

// ==========================================
// STUDENT-SPECIFIC DATA
// ==========================================

export const skills = pgTable(
  'skills',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
    skill: text('skill').notNull(),
  },
  (table) => [uniqueIndex('idx_skills_student_skill').on(table.studentId, table.skill)],
);

export const projects = pgTable('projects', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  role: text('role'),
  contributions: text('contributions'),
  learnings: text('learnings'),
  /**
   * text[] — Postgres text array for skills used on the project.
   */
  skillsUsed: text('skills_used').array(),
  liveUrl: text('live_url'),
  githubUrl: text('github_url'),
  displayOrder: smallint('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const experience = pgTable('experience', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  role: text('role').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  contributions: text('contributions'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const achievements = pgTable('achievements', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
  type: achievementTypeEnum('type').notNull().default('other'),
  title: text('title').notNull(),
  description: text('description'),
  date: date('date'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const contactDetails = pgTable('contact_details', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .unique()
    .references(() => studentProfiles.userId, { onDelete: 'cascade' }),
  phone: text('phone'),
});

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Experience = typeof experience.$inferSelect;
export type NewExperience = typeof experience.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type ContactDetail = typeof contactDetails.$inferSelect;
export type NewContactDetail = typeof contactDetails.$inferInsert;
