import { and, asc, eq, ne, sql } from 'drizzle-orm'
import { applications, clubAdmins, clubs, postings, recruiters, users } from '@repo/db'
import type { Club, ClubAdmin, Database, User } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

export type CoreAdminRoleResult = { ok: true; user: User } | { ok: false; reason: 'not_found' }

export type ClubAdminWriteResult =
  | { ok: true; user: User; clubAdmin: ClubAdmin }
  | { ok: false; reason: 'user_not_found' | 'club_not_found' | 'already_assigned' }

export type ClubAdminAssignmentResult =
  | { ok: true; user: User; clubAdmin: ClubAdmin }
  | {
      ok: false
      reason: 'user_not_found' | 'missing_role' | 'club_not_found' | 'inactive_club'
    }

export type ClubAdminRemovalResult =
  { ok: true; user: User; clubAdmin: ClubAdmin } | { ok: false; reason: 'not_found' }

export interface ClubInput {
  name: string
  slug: string
}

export interface ClubUpdateInput {
  name?: string
  slug?: string
}

export type ClubWriteResult =
  | { ok: true; club: Club }
  | { ok: false; reason: 'not_found' | 'duplicate_name' | 'duplicate_slug' }

export type ClubListResult = { ok: true; clubs: Club[] }

export type ApplicationStatusCounts = {
  applied: number
  under_review: number
  shortlisted: number
  accepted: number
  rejected: number
}

export interface AdminStats {
  students: number
  recruiters: number
  postings: number
  applications: number
  applicationsByStatus: ApplicationStatusCounts
  applicationStatusCounts: ApplicationStatusCounts
}

// ==========================================
// WRITES
// ==========================================

/**
 * Counts the active platform records shown on the core-admin dashboard.
 *
 * @param db - Request-scoped Drizzle client.
 * @returns Platform-wide dashboard statistics.
 */
export async function getAdminStats(db: Database): Promise<AdminStats> {
  const [studentResult, recruiterResult, postingResult, applicationResult, statusResult] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(sql`${users.roles} @> ARRAY['student']::user_role[]`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(recruiters)
        .where(eq(recruiters.isDeleted, false)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(postings)
        .where(eq(postings.status, 'active')),
      db.select({ count: sql<number>`count(*)::int` }).from(applications),
      db
        .select({
          status: applications.status,
          count: sql<number>`count(*)::int`,
        })
        .from(applications)
        .groupBy(applications.status),
    ])

  const applicationsByStatus: ApplicationStatusCounts = {
    applied: 0,
    under_review: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
  }

  for (const row of statusResult) {
    const status = row.status as keyof ApplicationStatusCounts
    if (status in applicationsByStatus) {
      applicationsByStatus[status] = Number(row.count)
    }
  }

  return {
    students: studentResult[0]?.count ?? 0,
    recruiters: recruiterResult[0]?.count ?? 0,
    postings: postingResult[0]?.count ?? 0,
    applications: applicationResult[0]?.count ?? 0,
    applicationsByStatus,
    applicationStatusCounts: applicationsByStatus,
  }
}

/**
 * Adds the `core_admin` role to a user without changing any existing roles.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The user receiving the core-admin role.
 * @returns The updated user, or a `not_found` result when no user exists.
 */
export async function appointCoreAdmin(db: Database, userId: string): Promise<CoreAdminRoleResult> {
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
export async function removeCoreAdmin(db: Database, userId: string): Promise<CoreAdminRoleResult> {
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
 * Assigns an existing club admin to an active club.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - The club admin receiving the assignment.
 * @param clubId - The active club the user will administer.
 * @returns The user and assignment, or a domain error.
 */
export async function assignClubAdmin(
  db: Database,
  userId: string,
  clubId: string,
): Promise<ClubAdminAssignmentResult> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    return { ok: false, reason: 'user_not_found' }
  }

  if (!user.roles.includes('club_admin')) {
    return { ok: false, reason: 'missing_role' }
  }

  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1)

  if (!club) {
    return { ok: false, reason: 'club_not_found' }
  }

  if (!club.isActive) {
    return { ok: false, reason: 'inactive_club' }
  }

  const [assignment] = await db
    .insert(clubAdmins)
    .values({ userId, clubId })
    .onConflictDoUpdate({
      target: clubAdmins.userId,
      set: { clubId },
    })
    .returning()

  if (!assignment) {
    throw new Error('Failed to assign club admin')
  }

  return { ok: true, user, clubAdmin: assignment }
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

  const [deleted] = await db.delete(clubAdmins).where(eq(clubAdmins.userId, userId)).returning()

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

// ==========================================
// CLUB MANAGEMENT
// ==========================================

function classifyClubConstraintError(err: unknown): 'duplicate_name' | 'duplicate_slug' | null {
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    const message = (err as { message: string }).message

    if (message.includes('clubs_name_unique')) {
      return 'duplicate_name'
    }

    if (message.includes('clubs_slug_unique')) {
      return 'duplicate_slug'
    }
  }

  return null
}

/**
 * Lists all clubs, including inactive clubs, ordered by name ascending.
 *
 * @param db - Request-scoped Drizzle client.
 * @returns All clubs ordered by their display name.
 */
export async function listClubs(db: Database): Promise<ClubListResult> {
  const rows = await db.select().from(clubs).orderBy(asc(clubs.name))
  return { ok: true, clubs: rows }
}

/**
 * Creates a new active club with a unique name and slug.
 *
 * @param db - Request-scoped Drizzle client.
 * @param input - Normalized club name and slug.
 * @returns The created club or a duplicate-field error.
 */
export async function createClub(db: Database, input: ClubInput): Promise<ClubWriteResult> {
  const [sameName] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.name, input.name))
    .limit(1)

  if (sameName) {
    return { ok: false, reason: 'duplicate_name' }
  }

  const [sameSlug] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .where(eq(clubs.slug, input.slug))
    .limit(1)

  if (sameSlug) {
    return { ok: false, reason: 'duplicate_slug' }
  }

  try {
    const [club] = await db.insert(clubs).values(input).returning()

    if (!club) {
      throw new Error('Failed to create club')
    }

    return { ok: true, club }
  } catch (err) {
    const reason = classifyClubConstraintError(err)

    if (reason) {
      return { ok: false, reason }
    }

    throw err
  }
}

/**
 * Updates one or both unique club fields while preserving omitted fields.
 *
 * @param db - Request-scoped Drizzle client.
 * @param id - Club identifier.
 * @param input - Normalized fields to update.
 * @returns The updated club or a not-found/duplicate-field error.
 */
export async function updateClub(
  db: Database,
  id: string,
  input: ClubUpdateInput,
): Promise<ClubWriteResult> {
  const [existing] = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1)

  if (!existing) {
    return { ok: false, reason: 'not_found' }
  }

  if (input.name !== undefined) {
    const [sameName] = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(and(eq(clubs.name, input.name), ne(clubs.id, id)))
      .limit(1)

    if (sameName) {
      return { ok: false, reason: 'duplicate_name' }
    }
  }

  if (input.slug !== undefined) {
    const [sameSlug] = await db
      .select({ id: clubs.id })
      .from(clubs)
      .where(and(eq(clubs.slug, input.slug), ne(clubs.id, id)))
      .limit(1)

    if (sameSlug) {
      return { ok: false, reason: 'duplicate_slug' }
    }
  }

  try {
    const [updated] = await db.update(clubs).set(input).where(eq(clubs.id, id)).returning()

    if (!updated) {
      return { ok: false, reason: 'not_found' }
    }

    return { ok: true, club: updated }
  } catch (err) {
    const reason = classifyClubConstraintError(err)

    if (reason) {
      return { ok: false, reason }
    }

    throw err
  }
}

/**
 * Soft-deactivates an existing active club without deleting its row.
 *
 * @param db - Request-scoped Drizzle client.
 * @param id - Club identifier.
 * @returns The deactivated club or a not-found/already-inactive error.
 */
export async function deactivateClub(
  db: Database,
  id: string,
): Promise<{ ok: true; club: Club } | { ok: false; reason: 'not_found' | 'already_inactive' }> {
  const [existing] = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1)

  if (!existing) {
    return { ok: false, reason: 'not_found' }
  }

  if (!existing.isActive) {
    return { ok: false, reason: 'already_inactive' }
  }

  const [updated] = await db
    .update(clubs)
    .set({ isActive: false })
    .where(eq(clubs.id, id))
    .returning()

  if (!updated) {
    return { ok: false, reason: 'not_found' }
  }

  return { ok: true, club: updated }
}
