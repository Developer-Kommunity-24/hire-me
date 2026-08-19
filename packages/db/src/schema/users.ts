import { pgTable, uuid, text, timestamp, customType } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ==========================================
// CENTRAL USERS TABLE
// ==========================================

// ==========================================
// user_role[] CONVERSION
// ==========================================

/**
 * Decodes a `user_role[]` value as the driver hands it over.
 *
 * Postgres reports a user-defined enum array under an OID the Neon HTTP driver
 * has no parser for, so it returns the raw array literal (`{student}`) as a
 * string. PGlite, used for local dev, decodes arrays itself and returns a real
 * array — hence both branches.
 *
 * Splitting on commas is sufficient because every `user_role` label is a bare
 * lowercase identifier (see `enums.ts`); none can contain a comma or a quote.
 */
export function parseUserRoleArray(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value
  }

  const inner = value.replace(/^\{/, '').replace(/\}$/, '')

  // `{}` is the empty array, not an array holding one empty string.
  if (inner === '') {
    return []
  }

  return inner.split(',').map((role) => role.replace(/^"/, '').replace(/"$/, ''))
}

/** Encodes roles as a Postgres array literal for the driver. */
export function formatUserRoleArray(value: string[]): string {
  return `{${value.join(',')}}`
}

/**
 * Custom type for user_role[] — a native Postgres array of the user_role enum.
 * Drizzle does not expose .array() on pgEnum columns, so we use customType
 * to map the Postgres type directly.
 *
 * Both conversions are required, not optional polish: without `fromDriver`,
 * `roles` arrives as the literal string `{student}` while TypeScript still
 * believes it is `string[]`, so every array method on it throws.
 */
const userRoleArray = customType<{ data: string[]; driverData: string | string[] }>({
  dataType() {
    return 'user_role[]'
  },

  fromDriver: parseUserRoleArray,
  toDriver: formatUserRoleArray,
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
