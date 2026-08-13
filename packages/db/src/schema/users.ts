import { pgTable, uuid, text, timestamp, customType } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ==========================================
// CENTRAL USERS TABLE
// ==========================================

/**
 * Custom type for user_role[] — a native Postgres array of the user_role enum.
 * Drizzle does not expose .array() on pgEnum columns, so we use customType
 * to map the Postgres type directly.
 */
const userRoleArray = customType<{ data: string[]; driverData: string }>({
  dataType() {
    return 'user_role[]'
  },
})

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  roles: userRoleArray('roles')
    .notNull()
    .default(sql`'{student}'`),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
