import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import {
  badgeRevocation,
  clubMemberships,
  clubs,
  notifications,
  studentProfiles,
  verificationRequests,
} from '@repo/db'
import type { BadgeRevocation, Database, VerificationRequest } from '@repo/db'

// ==========================================
// TYPES
// ==========================================

export interface VerificationSubmissionInput {
  usn: string
  clubId?: string | null
}

export interface MatchedMembershipSummary {
  id: string
  clubId: string
  clubName: string
  fullName: string
  usn: string
  role: string
}

export interface VerificationResponseData {
  request: VerificationRequest
  matchedMembership: MatchedMembershipSummary | null
  dk24Status: 'verified' | 'pending' | 'revoked'
  isResubmission: boolean
}

export type VerificationResult =
  | { ok: true; data: VerificationResponseData }
  | { ok: false; error: 'badge_revoked'; message: string }

export interface FlagBadgeRevocationInput {
  studentId: string
  clubMembershipId: string
  resolution?: string
  resolvedBy?: string
}

export interface ResolveBadgeRevocationInput {
  resolvedBy: string
  resolution: string
  restoreStatus?: 'none' | 'pending' | 'verified'
}

// ==========================================
// UTILITIES
// ==========================================

/**
 * Normalizes a USN for consistent comparison and storage.
 * Strips leading/trailing whitespace and converts to uppercase.
 */
export function normalizeUsn(usn: string): string {
  return usn.trim().toUpperCase()
}

// ==========================================
// VERIFICATION MATCHER
// ==========================================

/**
 * Executes the automatic DK24 student verification flow against club memberships.
 *
 * Matching rules:
 * 1. Checks for active/unresolved badge revocations on the student. If present,
 *    verification is rejected and student remains in 'revoked' status.
 * 2. Matches active memberships (`is_active = true`) where `usn` matches.
 * 3. If `clubId` is specified, matches within that specific club.
 * 4. Filters out memberships that have an unresolved badge revocation.
 * 5. Filters out memberships that are already claimed by another user
 *    (`userId IS NOT NULL AND userId != studentId`).
 * 6. If multiple eligible memberships match (e.g. across clubs), prioritizes the
 *    membership whose email matches the authenticated student's email.
 * 7. On successful match:
 *    - Links the membership: `club_memberships.user_id = studentId`.
 *    - Updates or creates `verification_requests` with `autoMatched = true`,
 *      `matchedClubMembershipId`, `clubId`, `appliedAt = now()`.
 *    - Increments `resubmitCount` if this is a resubmission.
 *    - Updates student profile: `student_profiles.dk24_status = 'verified'`.
 *    - Unlinks any previously matched different membership.
 *    - Emits a `verification_result` notification.
 * 8. On no match:
 *    - Updates or creates `verification_requests` with `autoMatched = false`,
 *      `appliedAt = null`.
 *    - Increments `resubmitCount` if this is a resubmission.
 *    - Updates student profile: `student_profiles.dk24_status = 'pending'`.
 *    - Unlinks any previously matched membership.
 *    - Emits a `verification_result` notification.
 */
export async function verifyStudentSubmission(
  db: Database,
  studentId: string,
  studentEmail: string,
  input: VerificationSubmissionInput,
): Promise<VerificationResult> {
  const normalizedUsn = normalizeUsn(input.usn)

  // 1. Check if the student has any unresolved badge revocations
  const [unresolvedRevocation] = await db
    .select()
    .from(badgeRevocation)
    .where(and(eq(badgeRevocation.studentId, studentId), isNull(badgeRevocation.resolvedAt)))
    .limit(1)

  if (unresolvedRevocation) {
    // Ensure student profile reflects revoked status
    await db
      .insert(studentProfiles)
      .values({
        userId: studentId,
        dk24Status: 'revoked',
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          dk24Status: 'revoked',
          updatedAt: new Date(),
        },
      })

    return {
      ok: false,
      error: 'badge_revoked',
      message: 'Student has an active badge revocation that has not been resolved',
    }
  }

  // 2. Query candidate memberships matching normalized USN
  const conditions = [eq(clubMemberships.usn, normalizedUsn), eq(clubMemberships.isActive, true)]

  if (input.clubId) {
    conditions.push(eq(clubMemberships.clubId, input.clubId))
  }

  const rawCandidates = await db
    .select({
      id: clubMemberships.id,
      clubId: clubMemberships.clubId,
      userId: clubMemberships.userId,
      role: clubMemberships.role,
      fullName: clubMemberships.fullName,
      usn: clubMemberships.usn,
      email: clubMemberships.email,
      isActive: clubMemberships.isActive,
      addedAt: clubMemberships.addedAt,
      clubName: clubs.name,
      clubIsActive: clubs.isActive,
    })
    .from(clubMemberships)
    .innerJoin(clubs, eq(clubMemberships.clubId, clubs.id))
    .where(and(...conditions, eq(clubs.isActive, true)))
    .orderBy(desc(clubMemberships.addedAt))

  // Find candidate memberships with active (unresolved) badge revocations
  const candidateIds = rawCandidates.map((c) => c.id)
  let membershipsWithRevocations = new Set<string>()

  if (candidateIds.length > 0) {
    const activeRevocations = await db
      .select({ clubMembershipId: badgeRevocation.clubMembershipId })
      .from(badgeRevocation)
      .where(
        and(
          inArray(badgeRevocation.clubMembershipId, candidateIds),
          isNull(badgeRevocation.resolvedAt),
        ),
      )
    membershipsWithRevocations = new Set(activeRevocations.map((r) => r.clubMembershipId))
  }

  const eligibleCandidates = rawCandidates.filter((candidate) => {
    // Must not have an active badge revocation on this membership
    if (membershipsWithRevocations.has(candidate.id)) {
      return false
    }
    // Must not be claimed by another user
    if (candidate.userId !== null && candidate.userId !== studentId) {
      return false
    }
    return true
  })

  // Priority: if an eligible candidate's email matches student's auth email, choose it first
  const normalizedEmail = studentEmail.trim().toLowerCase()
  let matchedMembership = eligibleCandidates.find(
    (c) => c.email.trim().toLowerCase() === normalizedEmail,
  )

  if (!matchedMembership && eligibleCandidates.length > 0) {
    matchedMembership = eligibleCandidates[0]
  }

  // 3. Check for existing verification request
  const [existingRequest] = await db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.studentId, studentId))
    .orderBy(desc(verificationRequests.submittedAt))
    .limit(1)

  const isResubmission = Boolean(existingRequest)
  const newResubmitCount = existingRequest ? existingRequest.resubmitCount + 1 : 0

  if (matchedMembership) {
    const targetClubId = matchedMembership.clubId
    const targetMembershipId = matchedMembership.id

    // Link the membership to the student
    await db
      .update(clubMemberships)
      .set({ userId: studentId })
      .where(eq(clubMemberships.id, targetMembershipId))

    // If previously matched to a different membership, unlink the old one
    if (
      existingRequest?.matchedClubMembershipId &&
      existingRequest.matchedClubMembershipId !== targetMembershipId
    ) {
      await db
        .update(clubMemberships)
        .set({ userId: null })
        .where(
          and(
            eq(clubMemberships.id, existingRequest.matchedClubMembershipId),
            eq(clubMemberships.userId, studentId),
          ),
        )
    }

    // Update studentProfile dk24Status to 'verified'
    await db
      .insert(studentProfiles)
      .values({
        userId: studentId,
        dk24Status: 'verified',
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          dk24Status: 'verified',
          updatedAt: new Date(),
        },
      })

    // Update or insert verification_requests
    let savedRequest: VerificationRequest
    if (existingRequest) {
      const [updated] = await db
        .update(verificationRequests)
        .set({
          usn: normalizedUsn,
          clubId: targetClubId,
          matchedClubMembershipId: targetMembershipId,
          autoMatched: true,
          appliedAt: new Date(),
          submittedAt: new Date(),
          resubmitCount: newResubmitCount,
        })
        .where(eq(verificationRequests.id, existingRequest.id))
        .returning()

      if (!updated) {
        throw new Error('Failed to update verification request')
      }
      savedRequest = updated
    } else {
      const [inserted] = await db
        .insert(verificationRequests)
        .values({
          studentId,
          usn: normalizedUsn,
          clubId: targetClubId,
          matchedClubMembershipId: targetMembershipId,
          autoMatched: true,
          appliedAt: new Date(),
          resubmitCount: 0,
        })
        .returning()

      if (!inserted) {
        throw new Error('Failed to insert verification request')
      }
      savedRequest = inserted
    }

    // Emit notification
    await db.insert(notifications).values({
      userId: studentId,
      type: 'verification_result',
      payload: {
        status: 'verified',
        message: `Your DK24 student status has been automatically verified via ${matchedMembership.clubName}!`,
        clubName: matchedMembership.clubName,
        usn: normalizedUsn,
      },
    })

    return {
      ok: true,
      data: {
        request: savedRequest,
        matchedMembership: {
          id: matchedMembership.id,
          clubId: matchedMembership.clubId,
          clubName: matchedMembership.clubName,
          fullName: matchedMembership.fullName,
          usn: matchedMembership.usn,
          role: matchedMembership.role,
        },
        dk24Status: 'verified',
        isResubmission,
      },
    }
  } else {
    // No match found
    // If previously matched, unlink old membership
    if (existingRequest?.matchedClubMembershipId) {
      await db
        .update(clubMemberships)
        .set({ userId: null })
        .where(
          and(
            eq(clubMemberships.id, existingRequest.matchedClubMembershipId),
            eq(clubMemberships.userId, studentId),
          ),
        )
    }

    // Set dk24Status to 'pending' (awaiting manual review)
    await db
      .insert(studentProfiles)
      .values({
        userId: studentId,
        dk24Status: 'pending',
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          dk24Status: 'pending',
          updatedAt: new Date(),
        },
      })

    // Update or insert verification_requests
    let savedRequest: VerificationRequest
    if (existingRequest) {
      const [updated] = await db
        .update(verificationRequests)
        .set({
          usn: normalizedUsn,
          clubId: input.clubId ?? null,
          matchedClubMembershipId: null,
          autoMatched: false,
          appliedAt: null,
          submittedAt: new Date(),
          resubmitCount: newResubmitCount,
        })
        .where(eq(verificationRequests.id, existingRequest.id))
        .returning()

      if (!updated) {
        throw new Error('Failed to update verification request')
      }
      savedRequest = updated
    } else {
      const [inserted] = await db
        .insert(verificationRequests)
        .values({
          studentId,
          usn: normalizedUsn,
          clubId: input.clubId ?? null,
          matchedClubMembershipId: null,
          autoMatched: false,
          appliedAt: null,
          resubmitCount: 0,
        })
        .returning()

      if (!inserted) {
        throw new Error('Failed to insert verification request')
      }
      savedRequest = inserted
    }

    // Emit notification
    await db.insert(notifications).values({
      userId: studentId,
      type: 'verification_result',
      payload: {
        status: 'pending',
        message: 'Your DK24 student verification request has been submitted and is pending review.',
        usn: normalizedUsn,
      },
    })

    return {
      ok: true,
      data: {
        request: savedRequest,
        matchedMembership: null,
        dk24Status: 'pending',
        isResubmission,
      },
    }
  }
}

// ==========================================
// STATUS READS
// ==========================================

/**
 * Returns current verification status, latest verification request,
 * matched membership info, and any active badge revocation for a student.
 */
export async function getStudentVerificationStatus(
  db: Database,
  studentId: string,
): Promise<{
  dk24Status: string
  request: VerificationRequest | null
  matchedMembership: MatchedMembershipSummary | null
  activeRevocation: BadgeRevocation | null
}> {
  const [profile] = await db
    .select({ dk24Status: studentProfiles.dk24Status })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1)

  const [request] = await db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.studentId, studentId))
    .orderBy(desc(verificationRequests.submittedAt))
    .limit(1)

  let matchedMembership: MatchedMembershipSummary | null = null
  if (request?.matchedClubMembershipId) {
    const [membership] = await db
      .select({
        id: clubMemberships.id,
        clubId: clubMemberships.clubId,
        clubName: clubs.name,
        fullName: clubMemberships.fullName,
        usn: clubMemberships.usn,
        role: clubMemberships.role,
      })
      .from(clubMemberships)
      .innerJoin(clubs, eq(clubMemberships.clubId, clubs.id))
      .where(eq(clubMemberships.id, request.matchedClubMembershipId))
      .limit(1)

    if (membership) {
      matchedMembership = membership
    }
  }

  const [activeRevocation] = await db
    .select()
    .from(badgeRevocation)
    .where(and(eq(badgeRevocation.studentId, studentId), isNull(badgeRevocation.resolvedAt)))
    .limit(1)

  return {
    dk24Status: profile?.dk24Status ?? 'none',
    request: request ?? null,
    matchedMembership,
    activeRevocation: activeRevocation ?? null,
  }
}

// ==========================================
// BADGE REVOCATIONS
// ==========================================

/**
 * Records a badge revocation against a student and their club membership.
 * Automatically updates `student_profiles.dk24_status = 'revoked'`.
 */
export async function flagBadgeRevocation(
  db: Database,
  input: FlagBadgeRevocationInput,
): Promise<BadgeRevocation> {
  const isResolved = Boolean(input.resolvedBy)

  const [revocation] = await db
    .insert(badgeRevocation)
    .values({
      studentId: input.studentId,
      clubMembershipId: input.clubMembershipId,
      resolvedBy: input.resolvedBy ?? null,
      resolvedAt: isResolved ? new Date() : null,
      resolution: input.resolution ?? null,
    })
    .returning()

  if (!revocation) {
    throw new Error('Failed to create badge revocation record')
  }

  // Update studentProfile dk24Status to 'revoked'
  await db
    .insert(studentProfiles)
    .values({
      userId: input.studentId,
      dk24Status: 'revoked',
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
        dk24Status: 'revoked',
        updatedAt: new Date(),
      },
    })

  // Mark verification request as no longer auto-matched if linked
  await db
    .update(verificationRequests)
    .set({
      autoMatched: false,
      appliedAt: null,
    })
    .where(
      and(
        eq(verificationRequests.studentId, input.studentId),
        eq(verificationRequests.matchedClubMembershipId, input.clubMembershipId),
      ),
    )

  return revocation
}

/**
 * Resolves an existing badge revocation record with an audit note and resolver.
 * Optionally restores the student's DK24 verification status.
 */
export async function resolveBadgeRevocation(
  db: Database,
  revocationId: string,
  input: ResolveBadgeRevocationInput,
): Promise<{ ok: true; data: BadgeRevocation } | { ok: false; error: 'not_found' }> {
  const [existing] = await db
    .select()
    .from(badgeRevocation)
    .where(eq(badgeRevocation.id, revocationId))
    .limit(1)

  if (!existing) {
    return { ok: false, error: 'not_found' }
  }

  const [updated] = await db
    .update(badgeRevocation)
    .set({
      resolvedBy: input.resolvedBy,
      resolvedAt: new Date(),
      resolution: input.resolution,
    })
    .where(eq(badgeRevocation.id, revocationId))
    .returning()

  if (!updated) {
    throw new Error('Failed to update badge revocation record')
  }

  if (input.restoreStatus) {
    await db
      .update(studentProfiles)
      .set({
        dk24Status: input.restoreStatus,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, existing.studentId))
  }

  return { ok: true, data: updated }
}

/**
 * Lists all pending (unresolved) badge revocations.
 * Leverages `idx_revocation_pending` on `flagged_at`.
 */
export async function listPendingRevocations(db: Database): Promise<BadgeRevocation[]> {
  return db
    .select()
    .from(badgeRevocation)
    .where(isNull(badgeRevocation.resolvedAt))
    .orderBy(desc(badgeRevocation.flaggedAt))
}

/**
 * Lists verification requests with pagination.
 */
export async function listVerificationRequests(
  db: Database,
  options: { limit?: number; offset?: number } = {},
): Promise<VerificationRequest[]> {
  const limit = Math.min(options.limit ?? 50, 100)
  const offset = options.offset ?? 0

  return db
    .select()
    .from(verificationRequests)
    .orderBy(desc(verificationRequests.submittedAt))
    .limit(limit)
    .offset(offset)
}
