import { pgTable, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { notificationTypeEnum } from './enums'
import { users } from './users'

// ==========================================
// SYSTEM (Notifications)
// ==========================================

export const notifications = pgTable('notifications', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  payload: jsonb('payload')
    .notNull()
    .default(sql`'{}'`),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
