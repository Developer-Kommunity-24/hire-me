import { and, asc, desc, eq, gte, ilike, isNull, lte, lt, or, sql } from 'drizzle-orm'
import type { Database, NewPosting, Posting } from '@repo/db'
import { postings, recruiters } from '@repo/db'
import { type PaginationParams, pageToOffset } from '../utils/pagination.js'
import { todayIST } from '../utils/date.js'

export type SortField = 'createdAt' | 'deadline' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface PostingFilters {
  /** Full-text search over title and description (case-insensitive partial match) */
  q?: string
  /** Technology stack tags — returns postings that share ≥1 tag (array overlap) */
  stack?: string[]
  /** Employment type — exact match */
  employmentType?: 'internship' | 'full_time' | 'part_time' | 'contract'
  /** Work arrangement — exact match */
  workArrangement?: 'in_person' | 'remote' | 'hybrid'
  /** Location — case-insensitive partial match */
  location?: string
  /** Deadline on or before this date (ISO 8601 date string, e.g. "2025-12-31") */
  deadlineBefore?: string
  /** Deadline on or after this date */
  deadlineAfter?: string
  /** Sort field */
  sortBy?: SortField
  /** Sort direction */
  order?: SortOrder
}

// Shape returned by both listing and detail queries
export const postingSelectFields = {
  id: postings.id,
  title: postings.title,
  description: postings.description,
  stack: postings.stack,
  employmentType: postings.employmentType,
  workArrangement: postings.workArrangement,
  seniorityLevel: postings.seniorityLevel,
  compensation: postings.compensation,
  location: postings.location,
  deadline: postings.deadline,
  status: postings.status,
  createdAt: postings.createdAt,
  updatedAt: postings.updatedAt,
  recruiter: {
    companyName: recruiters.companyName,
    companyUrl: recruiters.companyUrl,
    companyMail: recruiters.companyMail,
    headquartersLocation: recruiters.headquartersLocation,
  },
} as const

/**
 * Returns the SQL column expression to sort by.
 */
function sortColumn(field: SortField) {
  switch (field) {
    case 'deadline':
      return postings.deadline
    case 'title':
      return postings.title
    case 'createdAt':
    default:
      return postings.createdAt
  }
}

/**
 * Builds the WHERE conditions that are shared between the listing and count
 * queries. Active-only guard is always applied:
 *   status = 'active' AND (deadline IS NULL OR deadline >= today)
 */
function buildWhereConditions(filters: PostingFilters) {
  const today = todayIST()

  const conditions = [
    // Active-only guard
    eq(postings.status, 'active'),
    or(isNull(postings.deadline), gte(postings.deadline, today)),
  ]

  // Text search — ilike on title OR description
  if (filters.q) {
    const pattern = `%${filters.q}%`
    conditions.push(or(ilike(postings.title, pattern), ilike(postings.description, pattern))!)
  }

  // Stack filter — array overlap: posting.stack && ARRAY[...requested tags]
  if (filters.stack && filters.stack.length > 0) {
    // drizzle-orm 0.43 exposes arrayOverlaps; fall back to raw sql for safety
    const tagArray = sql`ARRAY[${sql.join(
      filters.stack.map((t) => sql`${t}`),
      sql`, `,
    )}]::text[]`
    conditions.push(sql`${postings.stack} && ${tagArray}`)
  }

  if (filters.employmentType) {
    conditions.push(eq(postings.employmentType, filters.employmentType))
  }

  if (filters.workArrangement) {
    conditions.push(eq(postings.workArrangement, filters.workArrangement))
  }

  // Location — partial match
  if (filters.location) {
    conditions.push(ilike(postings.location, `%${filters.location}%`))
  }

  if (filters.deadlineBefore) {
    conditions.push(lte(postings.deadline, filters.deadlineBefore))
  }
  if (filters.deadlineAfter) {
    conditions.push(gte(postings.deadline, filters.deadlineAfter))
  }

  return and(...conditions)
}

/**
 * Returns a paginated list of active, non-expired job postings with recruiter
 * details. Supports text search, multi-value filters, and deterministic sorting.
 */
export async function listActivePostings(
  db: Database,
  filters: PostingFilters,
  pagination: PaginationParams,
): Promise<{
  rows: (typeof postingSelectFields extends Record<string, infer V> ? V : never)[]
  total: number
}> {
  const where = buildWhereConditions(filters)

  const sortBy = filters.sortBy ?? 'createdAt'
  const order = filters.order ?? 'desc'
  const col = sortColumn(sortBy)
  const orderExpr = order === 'asc' ? asc(col) : desc(col)
  // Secondary sort on id ensures deterministic ordering when primary key ties
  const secondaryOrder = asc(postings.id)

  const offset = pageToOffset(pagination.page, pagination.limit)

  const [rows, countResult] = await Promise.all([
    db
      .select(postingSelectFields)
      .from(postings)
      .innerJoin(recruiters, eq(postings.recruiterId, recruiters.userId))
      .where(where)
      .orderBy(orderExpr, secondaryOrder)
      .limit(pagination.limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(postings)
      .innerJoin(recruiters, eq(postings.recruiterId, recruiters.userId))
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { rows: rows as any[], total }
}

/**
 * Returns full details for a single posting (must be active and not expired).
 * Returns `null` when the posting does not exist, is closed, or is expired.
 */
export async function getPostingById(db: Database, id: string) {
  const today = todayIST()

  const rows = await db
    .select(postingSelectFields)
    .from(postings)
    .innerJoin(recruiters, eq(postings.recruiterId, recruiters.userId))
    .where(
      and(
        eq(postings.id, id),
        eq(postings.status, 'active'),
        or(isNull(postings.deadline), gte(postings.deadline, today)),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

/**
 * Flips a posting to 'expired' if its deadline has passed and it's still
 * 'active'. Called on every write-side read as a safety net between
 * scheduled sweeps (see expirePastDeadlinePostings) — not a replacement
 * for the cron, since it only fires on request.
 */
async function expireIfPastDeadline(db: Database, posting: Posting): Promise<Posting> {
  const today = todayIST()

  if (posting.status === 'active' && posting.deadline && posting.deadline < today) {
    const [updated] = await db
      .update(postings)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(eq(postings.id, posting.id))
      .returning()
    return updated ?? posting
  }

  return posting
}

/**
 * Bulk-expires every posting that is still 'active' but past its deadline.
 * This is the actual "automatic" expiration — invoked on a schedule (see
 * index.ts's `scheduled` handler), independent of any request.
 *
 * @returns number of postings expired in this sweep.
 */
export async function expirePastDeadlinePostings(db: Database): Promise<number> {
  const today = todayIST()

  const expired = await db
    .update(postings)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(and(eq(postings.status, 'active'), lt(postings.deadline, today)))
    .returning({ id: postings.id })

  return expired.length
}

/** Creates a posting owned by `recruiterId`. */
export async function createPosting(
  db: Database,
  recruiterId: string,
  input: Omit<NewPosting, 'id' | 'recruiterId' | 'status' | 'createdAt' | 'updatedAt'>,
): Promise<Posting> {
  const [posting] = await db
    .insert(postings)
    .values({ ...input, recruiterId })
    .returning()

  if (!posting) {
    throw new Error('Failed to create posting')
  }

  return posting
}

/** Lists all postings owned by the recruiter, including closed and expired. */
export async function listOwnPostings(db: Database, recruiterId: string): Promise<Posting[]> {
  const rows = await db
    .select()
    .from(postings)
    .where(eq(postings.recruiterId, recruiterId))
    .orderBy(desc(postings.createdAt))

  return Promise.all(rows.map((row) => expireIfPastDeadline(db, row)))
}

/**
 * Updates a posting, but only if `recruiterId` owns it.
 * Returns `null` if the posting doesn't exist or belongs to someone else —
 * callers shouldn't be able to tell the difference.
 */
export async function updatePosting(
  db: Database,
  id: string,
  recruiterId: string,
  patch: Partial<Omit<NewPosting, 'id' | 'recruiterId' | 'status' | 'createdAt' | 'updatedAt'>>,
): Promise<Posting | null> {
  const [updated] = await db
    .update(postings)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(postings.id, id), eq(postings.recruiterId, recruiterId)))
    .returning()

  return updated ?? null
}

/**
 * Closes a posting, but only if `recruiterId` owns it.
 * Returns `null` if the posting doesn't exist or belongs to someone else.
 */
export async function closePosting(
  db: Database,
  id: string,
  recruiterId: string,
): Promise<Posting | null> {
  const [closed] = await db
    .update(postings)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(and(eq(postings.id, id), eq(postings.recruiterId, recruiterId)))
    .returning()

  return closed ?? null
}
