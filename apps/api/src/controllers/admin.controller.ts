import { eq } from 'drizzle-orm'
import { clubAdmins, clubs, users } from '@repo/db'
import type { ClubAdmin, Database, User } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

export type CoreAdminRoleResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'not_found' }

export type ClubAdminWriteResult =
  | { ok: true; user: User; clubAdmin: ClubAdmin }
  | { ok: false; reason: 'user_not_found' | 'club_not_found' | 'already_assigned' }

export type ClubAdminRemovalResult =
  | { ok: true; user: User; clubAdmin: ClubAdmin }
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

/**
 * Assigns a user as the administrator of a club and adds the `club_admin`
 * role without changing any existing roles.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The user receiving the club-admin role.
 * @param clubId - The club the user will administer.
 * @returns The updated user and assignment, or a domain error.
 */
export async function appointClubAdmin(
  db: Database,
  userId: string,
  clubId: string,
): Promise<ClubAdminWriteResult> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    return { ok: false, reason: 'user_not_found' }
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1)

  if (!club) {
    return { ok: false, reason: 'club_not_found' }
  }

  const [assignment] = await db
    .insert(clubAdmins)
    .values({ userId, clubId })
    .onConflictDoNothing({ target: clubAdmins.userId })
    .returning()

  if (!assignment) {
    return { ok: false, reason: 'already_assigned' }
  }

  const roles = user.roles.includes('club_admin') ? user.roles : [...user.roles, 'club_admin']
  const [updated] = await db
    .update(users)
    .set({ roles, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  if (!updated) {
    throw new Error('Failed to synchronize club-admin role')
  }

  return { ok: true, user: updated, clubAdmin: assignment }
}

/**
 * Removes a user's club-admin assignment and the `club_admin` role.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The user losing the club-admin role.
 * @returns The updated user and removed assignment, or a not-found result.
 */
export async function removeClubAdmin(
  db: Database,
  userId: string,
): Promise<ClubAdminRemovalResult> {
  const [assignment] = await db
    .select()
    .from(clubAdmins)
    .where(eq(clubAdmins.userId, userId))
    .limit(1)

  if (!assignment) {
    return { ok: false, reason: 'not_found' }
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('Club admin assignment references a missing user')
  }

  const [deleted] = await db
    .delete(clubAdmins)
    .where(eq(clubAdmins.userId, userId))
    .returning()

  if (!deleted) {
    return { ok: false, reason: 'not_found' }
  }

  const [updated] = await db
    .update(users)
    .set({
      roles: user.roles.filter((role) => role !== 'club_admin'),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  if (!updated) {
    throw new Error('Failed to synchronize club-admin role removal')
  }

  return { ok: true, user: updated, clubAdmin: deleted }
}
