import { and, asc, eq } from 'drizzle-orm'
import { badgeRevocation, clubMemberships, studentProfiles } from '@repo/db'
import type { Database, ClubMembership } from '@repo/db'

const ACTIVE_CLUB_MEMBER = eq(clubMemberships.isActive, true)

export interface ClubMemberResponse {
  id: string
  clubId: string
  fullName: string
  usn: string
  email: string
  role: string
  addedAt: Date | string | null
  userId: string | null
}

export function normalizeMemberInput(input: AddMemberInput | EditMemberInput): {
  fullName: string
  usn: string
  email: string
} {
  const fullName = input.fullName?.trim() ?? ''
  const usn = input.usn?.trim().toUpperCase() ?? ''
  const email = input.email?.trim().toLowerCase() ?? ''

  return { fullName, usn, email }
}

function toClubMemberResponse(
  member: Pick<
    ClubMembership,
    'id' | 'clubId' | 'fullName' | 'usn' | 'email' | 'role' | 'addedAt' | 'userId'
  >,
): ClubMemberResponse {
  return {
    id: member.id,
    clubId: member.clubId,
    fullName: member.fullName,
    usn: member.usn,
    email: member.email,
    role: member.role,
    addedAt: member.addedAt,
    userId: member.userId,
  }
}

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
export async function listClubMembers(db: Database, clubId: string): Promise<ClubMemberResponse[]> {
  const members = await db
    .select({
      id: clubMemberships.id,
      clubId: clubMemberships.clubId,
      fullName: clubMemberships.fullName,
      usn: clubMemberships.usn,
      email: clubMemberships.email,
      role: clubMemberships.role,
      addedAt: clubMemberships.addedAt,
      userId: clubMemberships.userId,
    })
    .from(clubMemberships)
    .where(and(eq(clubMemberships.clubId, clubId), ACTIVE_CLUB_MEMBER))
    .orderBy(asc(clubMemberships.fullName))

  return members.map(toClubMemberResponse)
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
): Promise<MemberWriteResult<ClubMemberResponse>> {
  const normalized = normalizeMemberInput(input)

  try {
    const [member] = await db
      .insert(clubMemberships)
      .values({
        clubId,
        fullName: normalized.fullName,
        usn: normalized.usn,
        email: normalized.email,
      })
      .returning()

    if (!member) {
      throw new Error('Insert returned no rows')
    }

    return { ok: true, data: toClubMemberResponse(member) }
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
): Promise<MemberWriteResult<ClubMemberResponse>> {
  const normalized = normalizeMemberInput(input)

  try {
    const [member] = await db
      .update(clubMemberships)
      .set({
        ...(input.fullName !== undefined ? { fullName: normalized.fullName } : {}),
        ...(input.usn !== undefined ? { usn: normalized.usn } : {}),
        ...(input.email !== undefined ? { email: normalized.email } : {}),
      })
      .where(
        and(
          eq(clubMemberships.id, memberId),
          eq(clubMemberships.clubId, clubId),
          ACTIVE_CLUB_MEMBER,
        ),
      )
      .returning()

    if (!member) {
      return { ok: false, error: 'not_found' }
    }

    return { ok: true, data: toClubMemberResponse(member) }
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
 * When the deleted member has a linked user account (`userId` is set), a
 * `badge_revocation` record is written before the row is removed so that
 * the deletion is auditable. Members without a linked account are removed
 * without a revocation entry because `badge_revocation.student_id` is NOT
 * NULL and requires an existing `student_profiles` row.
 *
 * @returns `true` when a row was deleted, `false` when no matching row was
 *   found in this club.
 */
export async function deleteClubMember(
  db: Database,
  clubId: string,
  memberId: string,
): Promise<boolean> {
  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(eq(clubMemberships.id, memberId), eq(clubMemberships.clubId, clubId), ACTIVE_CLUB_MEMBER),
    )
    .limit(1)

  if (!membership) {
    return false
  }

  if (membership.userId) {
    const [profile] = await db
      .select({ userId: studentProfiles.userId })
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, membership.userId))
      .limit(1)

    if (profile) {
      await db.insert(badgeRevocation).values({
        studentId: membership.userId,
        clubMembershipId: membership.id,
      })
    }
  }

  await db
    .update(clubMemberships)
    .set({
      isActive: false,
    })
    .where(
      and(eq(clubMemberships.id, memberId), eq(clubMemberships.clubId, clubId), ACTIVE_CLUB_MEMBER),
    )

  return true
}
