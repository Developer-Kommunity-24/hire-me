import { and, eq } from 'drizzle-orm'
import { recruiters } from '@repo/db'
import type { Database, Recruiter } from '@repo/db'
import { setUserRole } from './users.controller.js'

// ==========================================
// TYPES
// ==========================================

export interface CreateRecruiterInput {
  companyName: string
  companyMail: string
  companyUrl?: string | null
  headquartersLocation?: string | null
}

export interface UpdateRecruiterInput {
  companyName?: string
  companyMail?: string
  companyUrl?: string | null
  headquartersLocation?: string | null
}

export interface PublicRecruiter {
  userId: string
  companyName: string
  companyUrl: string | null
  companyMail: string
  headquartersLocation: string | null
  createdAt: Date
}

export type RecruiterWriteError = 'profile_exists' | 'not_found'

export type RecruiterWriteResult<T> =
  { ok: true; data: T } | { ok: false; error: RecruiterWriteError }

// ==========================================
// READS
// ==========================================

/**
 * Returns the active recruiter profile for the given user ID.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - Domain user ID (matches auth token sub).
 */
export async function getRecruiterByUserId(
  db: Database,
  userId: string,
): Promise<Recruiter | null> {
  const [recruiter] = await db
    .select()
    .from(recruiters)
    .where(and(eq(recruiters.userId, userId), eq(recruiters.isDeleted, false)))
    .limit(1)

  return recruiter ?? null
}

/**
 * Returns public company profile information for a recruiter by their user ID.
 * Returns null if the recruiter does not exist or has been deactivated.
 */
export async function getPublicRecruiterById(
  db: Database,
  id: string,
): Promise<PublicRecruiter | null> {
  const [recruiter] = await db
    .select({
      userId: recruiters.userId,
      companyName: recruiters.companyName,
      companyUrl: recruiters.companyUrl,
      companyMail: recruiters.companyMail,
      headquartersLocation: recruiters.headquartersLocation,
      createdAt: recruiters.createdAt,
    })
    .from(recruiters)
    .where(and(eq(recruiters.userId, id), eq(recruiters.isDeleted, false)))
    .limit(1)

  return recruiter ?? null
}

// ==========================================
// WRITES
// ==========================================

/**
 * Creates or reactivates a recruiter profile for onboarding.
 * Also synchronizes the user's role to 'recruiter'.
 *
 * @returns The persisted recruiter profile, or an error if an active profile already exists.
 */
export async function createRecruiterProfile(
  db: Database,
  userId: string,
  input: CreateRecruiterInput,
): Promise<RecruiterWriteResult<Recruiter>> {
  const [existing] = await db
    .select()
    .from(recruiters)
    .where(eq(recruiters.userId, userId))
    .limit(1)

  if (existing && !existing.isDeleted) {
    return { ok: false, error: 'profile_exists' }
  }

  const companyName = input.companyName.trim()
  const companyMail = input.companyMail.trim().toLowerCase()
  const companyUrl = input.companyUrl?.trim() || null
  const headquartersLocation = input.headquartersLocation?.trim() || null

  let recruiter: Recruiter | undefined

  if (existing && existing.isDeleted) {
    // Reactivate and update previously deleted profile
    const [updated] = await db
      .update(recruiters)
      .set({
        companyName,
        companyMail,
        companyUrl,
        headquartersLocation,
        isDeleted: false,
      })
      .where(eq(recruiters.userId, userId))
      .returning()

    recruiter = updated
  } else {
    // Fresh profile insert
    const [inserted] = await db
      .insert(recruiters)
      .values({
        userId,
        companyName,
        companyMail,
        companyUrl,
        headquartersLocation,
        isDeleted: false,
      })
      .returning()

    recruiter = inserted
  }

  if (!recruiter) {
    throw new Error('Failed to persist recruiter profile')
  }

  // Ensure 'recruiter' is assigned to user's roles
  await setUserRole(db, userId, 'recruiter')

  return { ok: true, data: recruiter }
}

/**
 * Updates an existing recruiter profile.
 *
 * @returns The updated profile on success, or 'not_found' if no active profile exists.
 */
export async function updateRecruiterProfile(
  db: Database,
  userId: string,
  input: UpdateRecruiterInput,
): Promise<RecruiterWriteResult<Recruiter>> {
  const existing = await getRecruiterByUserId(db, userId)

  if (!existing) {
    return { ok: false, error: 'not_found' }
  }

  const patch: Partial<typeof recruiters.$inferInsert> = {}

  if (input.companyName !== undefined) {
    patch.companyName = input.companyName.trim()
  }
  if (input.companyMail !== undefined) {
    patch.companyMail = input.companyMail.trim().toLowerCase()
  }
  if (input.companyUrl !== undefined) {
    patch.companyUrl = input.companyUrl ? input.companyUrl.trim() : null
  }
  if (input.headquartersLocation !== undefined) {
    patch.headquartersLocation = input.headquartersLocation
      ? input.headquartersLocation.trim()
      : null
  }

  const [updated] = await db
    .update(recruiters)
    .set(patch)
    .where(and(eq(recruiters.userId, userId), eq(recruiters.isDeleted, false)))
    .returning()

  if (!updated) {
    return { ok: false, error: 'not_found' }
  }

  return { ok: true, data: updated }
}

/**
 * Soft-deletes a recruiter profile by setting `isDeleted = true`.
 *
 * @returns `true` if deactivated, `false` if not found.
 */
export async function deleteRecruiterProfile(db: Database, userId: string): Promise<boolean> {
  const [deleted] = await db
    .update(recruiters)
    .set({ isDeleted: true })
    .where(and(eq(recruiters.userId, userId), eq(recruiters.isDeleted, false)))
    .returning()

  return Boolean(deleted)
}
