import { and, desc, eq } from 'drizzle-orm'
import type { Application, Database } from '@repo/db'
import { applications, postings, recruiters, studentProfiles, users } from '@repo/db'
import { todayIST } from '../utils/date.js'
import { createNotification } from './notifications.controller.js'

/** A status as allowed by the `application_status` enum. */
export type ApplicationStatus = Application['status']

// ==========================================
// STATUS TRANSITIONS
// ==========================================

/**
 * The recruitment pipeline, as a forward-only graph.
 *
 * `applied` is the entry state and never a valid target. `accepted` and
 * `rejected` are terminal — once a decision is made it is not silently undone.
 * Skipping stages is allowed (e.g. `applied` straight to `shortlisted`) because
 * recruiters often decide without recording every intermediate step.
 */
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  applied: ['under_review', 'shortlisted', 'accepted', 'rejected'],
  under_review: ['shortlisted', 'accepted', 'rejected'],
  shortlisted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
}

/** Returns true when an application may move from `from` to `to`. */
export function isTransitionAllowed(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

// ==========================================
// TYPES
// ==========================================

/**
 * Signals why an application could not be created.
 *
 * `not_found`  — no posting with that id exists.
 * `closed`     — the posting is closed, expired, or past its deadline.
 * `duplicate`  — the student already applied to this posting.
 */
export type ApplyError = 'not_found' | 'closed' | 'duplicate'

export type ApplyResult = { ok: true; data: Application } | { ok: false; error: ApplyError }

/**
 * Signals why a status update was rejected.
 *
 * `not_found`          — no application with that id is owned by the caller.
 * `invalid_transition` — the target status is not reachable from the current one.
 */
export type UpdateStatusError = 'not_found' | 'invalid_transition'

export type UpdateStatusResult =
  | { ok: true; data: Application }
  | { ok: false; error: UpdateStatusError; from?: ApplicationStatus }

/** An application enriched with the posting it targets. */
export interface StudentApplication {
  id: string
  postingId: string
  status: ApplicationStatus
  appliedAt: Date
  updatedAt: Date
  posting: {
    title: string
    status: string
    deadline: string | null
    location: string | null
    employmentType: string
    companyName: string
  }
}

/** An application enriched with the applying student's profile. */
export interface Applicant {
  id: string
  studentId: string
  status: ApplicationStatus
  appliedAt: Date
  updatedAt: Date
  student: {
    fullName: string
    email: string
    headline: string | null
    resumeUrl: string | null
    githubUrl: string | null
    linkedinUrl: string | null
    gradYear: number | null
  }
}

// ==========================================
// CONSTRAINT ERROR DETECTION
// ==========================================

/**
 * Detects a duplicate application from a Postgres unique-constraint violation.
 *
 * The `idx_applications_posting_student` unique index is the single source of
 * truth for "one application per student per posting"; relying on its error
 * (rather than a pre-check) keeps the guarantee race-free.
 */
function isDuplicateApplication(err: unknown): boolean {
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message.includes('idx_applications_posting_student')
  }

  return false
}

// ==========================================
// NOTIFICATIONS
// ==========================================

/**
 * Best-effort notification insert.
 *
 * A failed notification must never fail the action that triggered it — the
 * application/status change is already persisted, and surfacing an error would
 * make the caller retry a write that has already happened.
 */
async function notifySafely(db: Database, input: Parameters<typeof createNotification>[1]) {
  try {
    await createNotification(db, input)
  } catch (err) {
    console.error('Failed to create notification', err)
  }
}

// ==========================================
// WRITES
// ==========================================

/**
 * Creates an application from `studentId` to `postingId`.
 *
 * Rejects postings that do not exist ({@link ApplyError}`not_found`), that are
 * closed/expired/past deadline ({@link ApplyError}`closed`), and repeat
 * applications ({@link ApplyError}`duplicate`).
 *
 * On success a best-effort `application_received` notification is written for
 * the posting's recruiter.
 */
export async function applyToPosting(
  db: Database,
  studentId: string,
  postingId: string,
): Promise<ApplyResult> {
  const today = todayIST()

  const [posting] = await db
    .select({
      id: postings.id,
      recruiterId: postings.recruiterId,
      title: postings.title,
      status: postings.status,
      deadline: postings.deadline,
    })
    .from(postings)
    .where(eq(postings.id, postingId))
    .limit(1)

  if (!posting) {
    return { ok: false, error: 'not_found' }
  }

  const isOpen =
    posting.status === 'active' && (posting.deadline === null || posting.deadline >= today)

  if (!isOpen) {
    return { ok: false, error: 'closed' }
  }

  try {
    const [application] = await db.insert(applications).values({ postingId, studentId }).returning()

    if (!application) {
      throw new Error('Insert returned no rows')
    }

    const [student] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1)

    await notifySafely(db, {
      userId: posting.recruiterId,
      type: 'application_received',
      payload: {
        postingId: posting.id,
        postingTitle: posting.title,
        applicantId: studentId,
        applicantName: student?.fullName ?? null,
      },
    })

    return { ok: true, data: application }
  } catch (err) {
    if (isDuplicateApplication(err)) {
      return { ok: false, error: 'duplicate' }
    }

    throw err
  }
}

/**
 * Moves an application to `newStatus`, but only when the posting it targets is
 * owned by `recruiterId`.
 *
 * Returns `not_found` when the application does not exist or belongs to another
 * recruiter (callers cannot tell the two apart), and `invalid_transition` when
 * the move violates {@link ALLOWED_TRANSITIONS}.
 *
 * On success `updated_at` is refreshed and a best-effort `status_changed`
 * notification is written for the applicant.
 */
export async function updateApplicationStatus(
  db: Database,
  recruiterId: string,
  applicationId: string,
  newStatus: Exclude<ApplicationStatus, 'applied'>,
): Promise<UpdateStatusResult> {
  const [row] = await db
    .select({
      id: applications.id,
      status: applications.status,
      studentId: applications.studentId,
      postingId: postings.id,
      postingTitle: postings.title,
      companyName: recruiters.companyName,
    })
    .from(applications)
    .innerJoin(postings, eq(applications.postingId, postings.id))
    .innerJoin(recruiters, eq(postings.recruiterId, recruiters.userId))
    .where(and(eq(applications.id, applicationId), eq(postings.recruiterId, recruiterId)))
    .limit(1)

  if (!row) {
    return { ok: false, error: 'not_found' }
  }

  if (!isTransitionAllowed(row.status, newStatus)) {
    return { ok: false, error: 'invalid_transition', from: row.status }
  }

  const [updated] = await db
    .update(applications)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(applications.id, applicationId))
    .returning()

  if (!updated) {
    return { ok: false, error: 'not_found' }
  }

  await notifySafely(db, {
    userId: row.studentId,
    type: 'status_changed',
    payload: {
      postingId: row.postingId,
      postingTitle: row.postingTitle,
      company: row.companyName,
      newStatus,
    },
  })

  return { ok: true, data: updated }
}

// ==========================================
// READS
// ==========================================

/** Lists the authenticated student's applications, newest first. */
export async function listOwnApplications(
  db: Database,
  studentId: string,
): Promise<StudentApplication[]> {
  const rows = await db
    .select({
      id: applications.id,
      postingId: applications.postingId,
      status: applications.status,
      appliedAt: applications.appliedAt,
      updatedAt: applications.updatedAt,
      posting: {
        title: postings.title,
        status: postings.status,
        deadline: postings.deadline,
        location: postings.location,
        employmentType: postings.employmentType,
        companyName: recruiters.companyName,
      },
    })
    .from(applications)
    .innerJoin(postings, eq(applications.postingId, postings.id))
    .innerJoin(recruiters, eq(postings.recruiterId, recruiters.userId))
    .where(eq(applications.studentId, studentId))
    .orderBy(desc(applications.appliedAt))

  return rows
}

/**
 * Lists every applicant for a posting, but only when `recruiterId` owns it.
 *
 * Returns `null` when the posting does not exist or belongs to another
 * recruiter, so ownership cannot be probed.
 */
export async function listApplicantsForPosting(
  db: Database,
  recruiterId: string,
  postingId: string,
): Promise<Applicant[] | null> {
  const [owned] = await db
    .select({ id: postings.id })
    .from(postings)
    .where(and(eq(postings.id, postingId), eq(postings.recruiterId, recruiterId)))
    .limit(1)

  if (!owned) {
    return null
  }

  return db
    .select({
      id: applications.id,
      studentId: applications.studentId,
      status: applications.status,
      appliedAt: applications.appliedAt,
      updatedAt: applications.updatedAt,
      student: {
        fullName: users.fullName,
        email: users.email,
        headline: studentProfiles.headline,
        resumeUrl: studentProfiles.resumeUrl,
        githubUrl: studentProfiles.githubUrl,
        linkedinUrl: studentProfiles.linkedinUrl,
        gradYear: studentProfiles.gradYear,
      },
    })
    .from(applications)
    .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.userId))
    .innerJoin(users, eq(applications.studentId, users.id))
    .where(eq(applications.postingId, postingId))
    .orderBy(desc(applications.appliedAt))
}
