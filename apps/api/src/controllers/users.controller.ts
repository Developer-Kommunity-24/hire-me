import { and, eq } from 'drizzle-orm'
import { recruiters, studentProfiles, users } from '@repo/db'
import type { Database, User } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

/** Roles a user is allowed to choose for themselves during onboarding. */
export type SelfAssignableRole = 'student' | 'recruiter'

/** Verified identity from a Neon Auth token. */
export interface AuthUserInput {
  id: string
  email: string
  name: string | null
}

export type SyncAuthUserResult = { ok: true; user: User } | { ok: false; reason: 'email_conflict' }

/**
 * Roles granted out-of-band by an administrator. Self-service role selection
 * must never remove these.
 */
const PRIVILEGED_ROLES: readonly string[] = ['core_admin', 'club_admin']

// ==========================================
// READS
// ==========================================

/**
 * Looks up a user by primary key.
 *
 * @param db - Request-scoped Drizzle client.
 * @param id - Neon Auth user id (the JWT `sub`).
 */
export async function getUserById(db: Database, id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

/**
 * Looks up a user by email address.
 *
 * @param db - Request-scoped Drizzle client.
 * @param email - User's email address.
 */
export async function getUserByEmail(db: Database, email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1)
  return user ?? null
}

/**
 * Checks whether a user has already finished onboarding, and resolves their dashboard URL.
 */
export async function getUserOnboardingStatus(
  db: Database,
  user: User,
): Promise<{ hasAccount: boolean; dashboardUrl: string }> {
  if (user.roles.includes('core_admin')) {
    return { hasAccount: true, dashboardUrl: '/admin' }
  }
  if (user.roles.includes('club_admin')) {
    return { hasAccount: true, dashboardUrl: '/student-admin/members' }
  }
  if (user.roles.includes('recruiter')) {
    try {
      const [recruiter] = await db
        .select({ userId: recruiters.userId })
        .from(recruiters)
        .where(and(eq(recruiters.userId, user.id), eq(recruiters.isDeleted, false)))
        .limit(1)
      const hasAccount = Boolean(recruiter)
      return { hasAccount, dashboardUrl: hasAccount ? '/dashboard/recruiter' : '/recruiter' }
    } catch {
      return { hasAccount: true, dashboardUrl: '/dashboard/recruiter' }
    }
  }

  // student
  try {
    const [profile] = await db
      .select({
        headline: studentProfiles.headline,
        gradYear: studentProfiles.gradYear,
        bio: studentProfiles.bio,
      })
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, user.id))
      .limit(1)
    const hasAccount = Boolean(profile && (profile.headline || profile.gradYear || profile.bio))
    return { hasAccount, dashboardUrl: hasAccount ? '/student/jobs' : '/student' }
  } catch {
    return { hasAccount: false, dashboardUrl: '/student' }
  }
}

// ==========================================
// WRITES
// ==========================================

/**
 * Creates or refreshes the domain user backing an authenticated session.
 *
 * `users.id` is set to the Neon Auth `sub` so the auth service and our own
 * tables share one identifier. `roles` is never written here — new rows take
 * the column default (`{student}`) and existing rows keep whatever they have.
 *
 * @returns The persisted user, or an `email_conflict` result when the email is
 *   already held by a different user id.
 */
export async function syncAuthUser(
  db: Database,
  authUser: AuthUserInput,
): Promise<SyncAuthUserResult> {
  const [conflicting] = await db
    .select()
    .from(users)
    .where(eq(users.email, authUser.email))
    .limit(1)

  // `users.email` is UNIQUE. A row holding this email under a different id is a
  // genuine collision — re-pointing it is unsafe because student_profiles and
  // recruiters carry foreign keys to users.id.
  if (conflicting && conflicting.id !== authUser.id) {
    return { ok: false, reason: 'email_conflict' }
  }

  const [user] = await db
    .insert(users)
    .values({
      id: authUser.id,
      email: authUser.email,
      // full_name is NOT NULL; fall back to the email address when the identity
      // provider gave us no name.
      fullName: authUser.name ?? authUser.email,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: authUser.email,
        // Only overwrite the stored name when we actually have one, so a
        // nameless token cannot blank out an existing profile.
        ...(authUser.name ? { fullName: authUser.name } : {}),
        updatedAt: new Date(),
      },
    })
    .returning()

  if (!user) {
    throw new Error('Failed to persist authenticated user')
  }

  return { ok: true, user }
}

/**
 * Sets the caller's self-assigned role, preserving any privileged roles.
 *
 * Without that preservation, an admin who revisited the onboarding screen would
 * silently demote themselves.
 *
 * @returns The updated user, or `null` if no such user exists.
 */
export async function setUserRole(
  db: Database,
  id: string,
  role: SelfAssignableRole,
): Promise<User | null> {
  const existing = await getUserById(db, id)

  if (!existing) {
    return null
  }

  const preserved = existing.roles.filter((existingRole) => PRIVILEGED_ROLES.includes(existingRole))

  const [updated] = await db
    .update(users)
    .set({ roles: [role, ...preserved], updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()

  return updated ?? null
}
