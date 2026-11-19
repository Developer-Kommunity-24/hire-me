import { and, asc, desc, eq, isNull, or, sql } from 'drizzle-orm'
import {
  badgeRevocation,
  clubMemberships,
  clubs,
  notifications,
  studentProfiles,
  users,
  verificationRequests,
} from '@repo/db'
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
  isVerified?: boolean
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
    isVerified: true,
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
    // Check if an existing user matches by email
    const [existingUserByEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${normalized.email}`)
      .limit(1)

    let matchedUserId: string | null = existingUserByEmail?.id ?? null

    // If no user found by email, check if there's a pending verification request with this USN
    if (!matchedUserId) {
      const [pendingReq] = await db
        .select({ studentId: verificationRequests.studentId })
        .from(verificationRequests)
        .where(eq(verificationRequests.usn, normalized.usn))
        .orderBy(desc(verificationRequests.submittedAt))
        .limit(1)

      if (pendingReq) {
        matchedUserId = pendingReq.studentId
      }
    }

    const [member] = await db
      .insert(clubMemberships)
      .values({
        clubId,
        userId: matchedUserId,
        fullName: normalized.fullName,
        usn: normalized.usn,
        email: normalized.email,
      })
      .returning()

    if (!member) {
      throw new Error('Insert returned no rows')
    }

    // Award verified badge if a user account is linked
    if (matchedUserId) {
      await db
        .insert(studentProfiles)
        .values({
          userId: matchedUserId,
          dk24Status: 'verified',
        })
        .onConflictDoUpdate({
          target: studentProfiles.userId,
          set: {
            dk24Status: 'verified',
            updatedAt: new Date(),
          },
        })

      await db
        .update(verificationRequests)
        .set({
          clubId,
          matchedClubMembershipId: member.id,
          autoMatched: true,
          appliedAt: new Date(),
        })
        .where(
          and(
            eq(verificationRequests.studentId, matchedUserId),
            isNull(verificationRequests.appliedAt),
          ),
        )

      const [club] = await db
        .select({ name: clubs.name })
        .from(clubs)
        .where(eq(clubs.id, clubId))
        .limit(1)

      await db.insert(notifications).values({
        userId: matchedUserId,
        type: 'verification_result',
        payload: {
          status: 'verified',
          message: `You have been added to the ${club?.name ?? 'club'} roster and awarded the Verified Student badge!`,
          clubName: club?.name,
          usn: normalized.usn,
        },
      })
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

      await db
        .update(studentProfiles)
        .set({
          dk24Status: 'revoked',
          updatedAt: new Date(),
        })
        .where(eq(studentProfiles.userId, membership.userId))

      await db
        .update(verificationRequests)
        .set({
          autoMatched: false,
          appliedAt: null,
        })
        .where(
          and(
            eq(verificationRequests.studentId, membership.userId),
            eq(verificationRequests.matchedClubMembershipId, membership.id),
          ),
        )
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

// ==========================================
// CLUB VERIFICATION REQUESTS
// ==========================================

export interface ClubVerificationRequestItem {
  id: string
  studentId: string
  fullName: string
  email: string
  usn: string
  clubId: string | null
  submittedAt: Date | string
  resubmitCount: number
  status: 'pending' | 'verified' | 'rejected'
}

/**
 * Lists pending verification requests that students have sent to this club
 * (or without a club specified).
 */
export async function listClubVerificationRequests(
  db: Database,
  clubId: string,
): Promise<ClubVerificationRequestItem[]> {
  const rows = await db
    .select({
      id: verificationRequests.id,
      studentId: verificationRequests.studentId,
      fullName: users.fullName,
      email: users.email,
      usn: verificationRequests.usn,
      clubId: verificationRequests.clubId,
      submittedAt: verificationRequests.submittedAt,
      resubmitCount: verificationRequests.resubmitCount,
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.studentId, users.id))
    .where(
      and(
        or(eq(verificationRequests.clubId, clubId), isNull(verificationRequests.clubId)),
        isNull(verificationRequests.appliedAt),
        eq(verificationRequests.autoMatched, false),
      ),
    )
    .orderBy(desc(verificationRequests.submittedAt))

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    fullName: r.fullName,
    email: r.email,
    usn: r.usn,
    clubId: r.clubId,
    submittedAt: r.submittedAt,
    resubmitCount: r.resubmitCount,
    status: 'pending' as const,
  }))
}

/**
 * Accepts a student's verification request:
 * - Adds or reactivates them in club_memberships
 * - Updates studentProfile to verified (badge awarded!)
 * - Updates verificationRequest as applied/autoMatched
 * - Emits a notification
 */
export async function acceptClubVerificationRequest(
  db: Database,
  clubId: string,
  requestId: string,
): Promise<{ ok: true; data: ClubMemberResponse } | { ok: false; error: string; status: number }> {
  const [request] = await db
    .select()
    .from(verificationRequests)
    .where(
      and(
        eq(verificationRequests.id, requestId),
        or(eq(verificationRequests.clubId, clubId), isNull(verificationRequests.clubId)),
      ),
    )
    .limit(1)

  if (!request) {
    return { ok: false, error: 'Request not found', status: 404 }
  }

  const [studentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, request.studentId))
    .limit(1)

  if (!studentUser) {
    return { ok: false, error: 'Student user not found', status: 404 }
  }

  const [club] = await db
    .select({ name: clubs.name })
    .from(clubs)
    .where(eq(clubs.id, clubId))
    .limit(1)

  const clubName = club?.name ?? 'campus club'

  const normalizedEmail = studentUser.email.trim().toLowerCase()
  const normalizedUsn = request.usn.trim().toUpperCase()

  const [existingMembership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.clubId, clubId),
        or(eq(clubMemberships.usn, normalizedUsn), eq(clubMemberships.email, normalizedEmail)),
      ),
    )
    .limit(1)

  let finalMember: ClubMemberResponse
  let targetMembershipId: string

  if (existingMembership) {
    const [updated] = await db
      .update(clubMemberships)
      .set({
        userId: studentUser.id,
        fullName: studentUser.fullName,
        usn: normalizedUsn,
        email: normalizedEmail,
        isActive: true,
        addedAt: new Date(),
      })
      .where(eq(clubMemberships.id, existingMembership.id))
      .returning()

    if (!updated) {
      throw new Error('Failed to update club membership')
    }
    targetMembershipId = updated.id
    finalMember = toClubMemberResponse(updated)
  } else {
    const [inserted] = await db
      .insert(clubMemberships)
      .values({
        clubId,
        userId: studentUser.id,
        fullName: studentUser.fullName,
        usn: normalizedUsn,
        email: normalizedEmail,
        role: 'member',
        isActive: true,
      })
      .returning()

    if (!inserted) {
      throw new Error('Failed to insert club membership')
    }
    targetMembershipId = inserted.id
    finalMember = toClubMemberResponse(inserted)
  }

  // Update studentProfile dk24Status to 'verified'
  await db
    .insert(studentProfiles)
    .values({
      userId: studentUser.id,
      dk24Status: 'verified',
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
        dk24Status: 'verified',
        updatedAt: new Date(),
      },
    })

  // Update verificationRequests row
  await db
    .update(verificationRequests)
    .set({
      clubId,
      matchedClubMembershipId: targetMembershipId,
      autoMatched: true,
      appliedAt: new Date(),
    })
    .where(eq(verificationRequests.id, request.id))

  // Send notification
  await db.insert(notifications).values({
    userId: studentUser.id,
    type: 'verification_result',
    payload: {
      status: 'verified',
      message: `Your verification request has been accepted! You are now a verified member of ${clubName}.`,
      clubName,
      usn: normalizedUsn,
    },
  })

  return { ok: true, data: finalMember }
}

/**
 * Rejects a student's verification request:
 * - Marks verificationRequest as rejected (appliedAt = now(), autoMatched = false)
 * - Updates studentProfile to rejected
 * - Emits a notification
 */
export async function rejectClubVerificationRequest(
  db: Database,
  clubId: string,
  requestId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const [request] = await db
    .select()
    .from(verificationRequests)
    .where(
      and(
        eq(verificationRequests.id, requestId),
        or(eq(verificationRequests.clubId, clubId), isNull(verificationRequests.clubId)),
      ),
    )
    .limit(1)

  if (!request) {
    return { ok: false, error: 'Request not found', status: 404 }
  }

  const [club] = await db
    .select({ name: clubs.name })
    .from(clubs)
    .where(eq(clubs.id, clubId))
    .limit(1)

  const clubName = club?.name ?? 'campus club'

  // Mark request as resolved/rejected
  await db
    .update(verificationRequests)
    .set({
      clubId,
      appliedAt: new Date(),
      autoMatched: false,
    })
    .where(eq(verificationRequests.id, request.id))

  // Update student profile dk24Status to rejected
  await db
    .update(studentProfiles)
    .set({
      dk24Status: 'rejected',
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, request.studentId))

  // Send notification
  await db.insert(notifications).values({
    userId: request.studentId,
    type: 'verification_result',
    payload: {
      status: 'rejected',
      message: `Your verification request for ${clubName} was rejected.`,
      clubName,
      usn: request.usn,
    },
  })

  return { ok: true }
}
