import { and, asc, eq } from 'drizzle-orm'
import { clubMemberships } from '@repo/db'
import type { Database, ClubMembership } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

export interface AddMemberInput {
  fullName: string
  usn: string
  email: string
}

export interface EditMemberInput {
  fullName?: string
  usn?: string
  email?: string
}

/**
 * Signals why a write was rejected.
 *
 * `duplicate_usn`   — a row with the same (club_id, usn) already exists.
 * `duplicate_email` — a row with the same (club_id, email) already exists.
 * `not_found`       — the targeted membership id does not exist in this club.
 */
export type MemberWriteError = 'duplicate_usn' | 'duplicate_email' | 'not_found'

export type MemberWriteResult<T> = { ok: true; data: T } | { ok: false; error: MemberWriteError }

// ==========================================
// CONSTRAINT ERROR DETECTION
// ==========================================

/**
 * Maps a Postgres unique-constraint violation to a domain error.
 *
 * Both indexes live on `club_memberships`:
 *   idx_club_memberships_usn_active   → (club_id, usn)
 *   idx_club_memberships_email_active → (club_id, email)
 */
function classifyConstraintError(err: unknown): MemberWriteError | null {
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    const msg = (err as { message: string }).message

    if (msg.includes('idx_club_memberships_usn_active')) {
      return 'duplicate_usn'
    }

    if (msg.includes('idx_club_memberships_email_active')) {
      return 'duplicate_email'
    }
  }

  return null
}

// ==========================================
// READS
// ==========================================

/**
 * Returns all members of a club ordered by full name ascending.
 *
 * @param db     - Request-scoped Drizzle client.
 * @param clubId - The club whose members to list.
 */
export async function listClubMembers(db: Database, clubId: string): Promise<ClubMembership[]> {
  return db
    .select()
    .from(clubMemberships)
    .where(eq(clubMemberships.clubId, clubId))
    .orderBy(asc(clubMemberships.fullName))
}

// ==========================================
// WRITES
// ==========================================

/**
 * Inserts a new club membership record.
 *
 * `role` always defaults to `'member'` — the API does not expose role
 * assignment. `userId` is left null; it will be linked later when the
 * member registers and their USN is matched during verification.
 *
 * @returns The inserted row on success, or a domain error on constraint
 *   violation.
 */
export async function addClubMember(
  db: Database,
  clubId: string,
  input: AddMemberInput,
): Promise<MemberWriteResult<ClubMembership>> {
  try {
    const [member] = await db
      .insert(clubMemberships)
      .values({
        clubId,
        fullName: input.fullName,
        usn: input.usn,
        email: input.email,
      })
      .returning()

    if (!member) {
      throw new Error('Insert returned no rows')
    }

    return { ok: true, data: member }
  } catch (err) {
    const constraintError = classifyConstraintError(err)

    if (constraintError) {
      return { ok: false, error: constraintError }
    }

    throw err
  }
}

/**
 * Updates one or more fields on an existing membership within the caller's club.
 *
 * The `clubId` guard in the WHERE clause ensures a volunteer cannot edit a
 * member belonging to a different club even if they supply a valid membership
 * id from another club.
 *
 * @returns The updated row on success, a `not_found` error when the membership
 *   does not exist in this club, or a duplicate error on constraint violation.
 */
export async function editClubMember(
  db: Database,
  clubId: string,
  memberId: string,
  input: EditMemberInput,
): Promise<MemberWriteResult<ClubMembership>> {
  try {
    const [member] = await db
      .update(clubMemberships)
      .set({
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.usn !== undefined ? { usn: input.usn } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
      })
      .where(and(eq(clubMemberships.id, memberId), eq(clubMemberships.clubId, clubId)))
      .returning()

    if (!member) {
      return { ok: false, error: 'not_found' }
    }

    return { ok: true, data: member }
  } catch (err) {
    const constraintError = classifyConstraintError(err)

    if (constraintError) {
      return { ok: false, error: constraintError }
    }

    throw err
  }
}

/**
 * Deletes a membership within the caller's club.
 *
 * The `clubId` guard in the WHERE clause provides the same cross-club
 * protection as `editClubMember`.
 *
 * @returns `true` when a row was deleted, `false` when no matching row was
 *   found in this club.
 */
export async function deleteClubMember(
  db: Database,
  clubId: string,
  memberId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(clubMemberships)
    .where(and(eq(clubMemberships.id, memberId), eq(clubMemberships.clubId, clubId)))
    .returning({ id: clubMemberships.id })

  return deleted.length > 0
}
