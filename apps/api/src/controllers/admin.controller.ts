import { eq } from 'drizzle-orm'
import { users } from '@repo/db'
import type { Database, User } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

export type CoreAdminRoleResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'not_found' }

// ==========================================
// WRITES
// ==========================================

/**
 * Adds the `core_admin` role to a user without changing any existing roles.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The user receiving the core-admin role.
 * @returns The updated user, or a `not_found` result when no user exists.
 */
export async function appointCoreAdmin(
  db: Database,
  userId: string,
): Promise<CoreAdminRoleResult> {
  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!existing) {
    return { ok: false, reason: 'not_found' }
  }

  if (existing.roles.includes('core_admin')) {
    return { ok: true, user: existing }
  }

  const [updated] = await db
    .update(users)
    .set({ roles: [...existing.roles, 'core_admin'], updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  if (!updated) {
    return { ok: false, reason: 'not_found' }
  }

  return { ok: true, user: updated }
}

/**
 * Removes the `core_admin` role from a user without changing any other roles.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The user losing the core-admin role.
 * @returns The updated user, or a `not_found` result when no user exists.
 */
export async function removeCoreAdmin(
  db: Database,
  userId: string,
): Promise<CoreAdminRoleResult> {
  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!existing) {
    return { ok: false, reason: 'not_found' }
  }

  if (!existing.roles.includes('core_admin')) {
    return { ok: true, user: existing }
  }

  const [updated] = await db
    .update(users)
    .set({
      roles: existing.roles.filter((role) => role !== 'core_admin'),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  if (!updated) {
    return { ok: false, reason: 'not_found' }
  }

  return { ok: true, user: updated }
}
