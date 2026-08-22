import { eq } from 'drizzle-orm'
import { recruiters, users } from '@repo/db'
import type { Database, Recruiter, NewRecruiter } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

/** Verified identity from a Neon Auth token. */
export interface AuthUserInput {
  id: string
  email: string
  name: string | null
}

// ==========================================
// READS
// ==========================================

/**
 * Looks up a recruiter by user id.
 *
 * @param db - Request-scoped Drizzle client.
 * @param userId - User id (the JWT `sub`).
 */
export async function getRecruiterByUserId(
  db: Database,
  userId: string,
): Promise<Recruiter | null> {
  const [recruiter] = await db
    .select()
    .from(recruiters)
    .where(eq(recruiters.userId, userId))
    .limit(1)
  return recruiter ?? null
}

// ==========================================
// WRITES
// ==========================================

/**
 * Upserts a recruiter profile.
 *
 * Creates a new recruiter row on first call, updates on subsequent calls.
 * Also updates users.fullName if provided in the payload.
 *
 * @param db - Request-scoped Drizzle client.
 * @param authUser - Verified identity from the token.
 * @param data - Recruiter profile data (all fields optional).
 * @returns The updated recruiter, or `null` if the user row disappeared.
 */
export async function upsertRecruiter(
  db: Database,
  authUser: AuthUserInput,
  data: Partial<{
    fullName: string
    jobTitle: string
    companyName: string
    companyMail: string
    companyUrl: string
    headquartersLocation: string
    bio: string
    isComplete: boolean
  }>,
): Promise<Recruiter | null> {
  // If fullName is provided, update the users table
  if (data.fullName) {
    await db
      .update(users)
      .set({ fullName: data.fullName, updatedAt: new Date() })
      .where(eq(users.id, authUser.id))
  }

  // Prepare recruiter data (exclude fullName as it's not a recruiter column)
  const recruiterData: NewRecruiter = {
    userId: authUser.id,
    companyName: data.companyName ?? '',
    companyMail: data.companyMail ?? '',
    companyUrl: data.companyUrl ?? null,
    headquartersLocation: data.headquartersLocation ?? null,
    jobTitle: data.jobTitle ?? null,
    bio: data.bio ?? null,
    isComplete: data.isComplete ?? false,
    isDeleted: false,
  }

  // Upsert recruiter profile
  const [recruiter] = await db
    .insert(recruiters)
    .values(recruiterData)
    .onConflictDoUpdate({
      target: recruiters.userId,
      set: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.companyMail !== undefined && { companyMail: data.companyMail }),
        ...(data.companyUrl !== undefined && { companyUrl: data.companyUrl }),
        ...(data.headquartersLocation !== undefined && {
          headquartersLocation: data.headquartersLocation,
        }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.isComplete !== undefined && { isComplete: data.isComplete }),
      },
    })
    .returning()

  return recruiter ?? null
}
