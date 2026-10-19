import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import type { Database } from '@repo/db'
import { projects, skills, studentProfiles, users } from '@repo/db'
import { type PaginationParams, pageToOffset } from '../utils/pagination.js'

// ==========================================
// TYPES
// ==========================================

export type TalentSortField = 'fullName' | 'gradYear' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'
export type SkillMatchMode = 'all' | 'any'

export interface TalentFilters {
  /** Free-text search across profile info, skills, and project content */
  q?: string
  /** Structured skill filter from the skills table */
  skills?: string[]
  /** Whether student must match ALL skills (default) or ANY skill */
  skillMatchMode?: SkillMatchMode
  /** Filter by openToWork status */
  openToWork?: boolean
  /** Filter by DK24 verification status */
  dk24Status?: 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
  /** Filter by graduation year */
  gradYear?: number
  /** Sort field */
  sortBy?: TalentSortField
  /** Sort direction */
  order?: SortOrder
}

export interface TalentProject {
  id: string
  title: string
  description: string | null
  role: string | null
  contributions: string | null
  learnings: string | null
  skillsUsed: string[] | null
  liveUrl: string | null
  githubUrl: string | null
  displayOrder: number
  createdAt: Date
}

export interface TalentResult {
  id: string
  fullName: string
  email: string
  headline: string | null
  bio: string | null
  gradYear: number | null
  openToWork: boolean
  dk24Status: 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
  resumeUrl: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  otherLinks: unknown
  consentGivenAt: Date | null
  updatedAt: Date
  skills: string[]
  projects: TalentProject[]
}

// ==========================================
// QUERY BUILDER HELPERS
// ==========================================

function sortColumn(field: TalentSortField) {
  switch (field) {
    case 'fullName':
      return users.fullName
    case 'gradYear':
      return studentProfiles.gradYear
    case 'updatedAt':
    default:
      return studentProfiles.updatedAt
  }
}

/**
 * Builds the WHERE conditions for talent search.
 */
function buildWhereConditions(filters: TalentFilters) {
  const conditions = []

  // Free-text search (q) across name, headline, bio, skills, and project content
  if (filters.q) {
    const pattern = `%${filters.q}%`
    conditions.push(
      or(
        ilike(users.fullName, pattern),
        ilike(studentProfiles.headline, pattern),
        ilike(studentProfiles.bio, pattern),
        sql`EXISTS (
          SELECT 1 FROM ${skills}
          WHERE ${skills.studentId} = ${studentProfiles.userId}
          AND ${skills.skill} ILIKE ${pattern}
        )`,
        sql`EXISTS (
          SELECT 1 FROM ${projects}
          WHERE ${projects.studentId} = ${studentProfiles.userId}
          AND (
            ${projects.title} ILIKE ${pattern}
            OR ${projects.description} ILIKE ${pattern}
            OR ${projects.role} ILIKE ${pattern}
            OR ${projects.contributions} ILIKE ${pattern}
            OR array_to_string(${projects.skillsUsed}, ' ') ILIKE ${pattern}
          )
        )`,
      )!,
    )
  }

  // Structured skills filter (skills table as single source of truth)
  if (filters.skills && filters.skills.length > 0) {
    const matchMode = filters.skillMatchMode ?? 'all'

    if (matchMode === 'any') {
      const skillConditions = filters.skills.map((s) => ilike(skills.skill, s))
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${skills}
          WHERE ${skills.studentId} = ${studentProfiles.userId}
          AND (${or(...skillConditions)})
        )`,
      )
    } else {
      // 'all' mode (default): student must possess every specified skill
      for (const s of filters.skills) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${skills}
            WHERE ${skills.studentId} = ${studentProfiles.userId}
            AND ${skills.skill} ILIKE ${s}
          )`,
        )
      }
    }
  }

  // openToWork filter
  if (filters.openToWork !== undefined) {
    conditions.push(eq(studentProfiles.openToWork, filters.openToWork))
  }

  // dk24Status filter
  if (filters.dk24Status) {
    conditions.push(eq(studentProfiles.dk24Status, filters.dk24Status))
  }

  // gradYear filter
  if (filters.gradYear !== undefined) {
    conditions.push(eq(studentProfiles.gradYear, filters.gradYear))
  }

  return conditions.length > 0 ? and(...conditions) : undefined
}

// ==========================================
// SERVICE FUNCTIONS
// ==========================================

/**
 * Returns a paginated list of candidate student profiles with aggregated skills
 * and projects, filtered by skills, verification status, availability, and keyword search.
 */
export async function listTalents(
  db: Database,
  filters: TalentFilters,
  pagination: PaginationParams,
): Promise<{
  rows: TalentResult[]
  total: number
}> {
  const where = buildWhereConditions(filters)

  const sortBy = filters.sortBy ?? 'updatedAt'
  const order = filters.order ?? 'desc'
  const col = sortColumn(sortBy)
  const orderExpr = order === 'asc' ? asc(col) : desc(col)
  // Secondary sort on users.id ensures deterministic pagination ordering
  const secondaryOrder = asc(users.id)

  const offset = pageToOffset(pagination.page, pagination.limit)

  const [studentRows, countResult] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        headline: studentProfiles.headline,
        bio: studentProfiles.bio,
        gradYear: studentProfiles.gradYear,
        openToWork: studentProfiles.openToWork,
        dk24Status: studentProfiles.dk24Status,
        resumeUrl: studentProfiles.resumeUrl,
        githubUrl: studentProfiles.githubUrl,
        linkedinUrl: studentProfiles.linkedinUrl,
        otherLinks: studentProfiles.otherLinks,
        consentGivenAt: studentProfiles.consentGivenAt,
        updatedAt: studentProfiles.updatedAt,
      })
      .from(users)
      .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(where)
      .orderBy(orderExpr, secondaryOrder)
      .limit(pagination.limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0

  if (studentRows.length === 0) {
    return { rows: [], total }
  }

  const studentIds = studentRows.map((s) => s.id)

  // Two-stage batch hydration avoids 1-to-many Cartesian explosion during pagination
  const [skillRows, projectRows] = await Promise.all([
    db
      .select({
        studentId: skills.studentId,
        skill: skills.skill,
      })
      .from(skills)
      .where(inArray(skills.studentId, studentIds)),

    db
      .select({
        id: projects.id,
        studentId: projects.studentId,
        title: projects.title,
        description: projects.description,
        role: projects.role,
        contributions: projects.contributions,
        learnings: projects.learnings,
        skillsUsed: projects.skillsUsed,
        liveUrl: projects.liveUrl,
        githubUrl: projects.githubUrl,
        displayOrder: projects.displayOrder,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(inArray(projects.studentId, studentIds))
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt)),
  ])

  const skillsByStudentId = new Map<string, string[]>()
  for (const s of skillRows) {
    const list = skillsByStudentId.get(s.studentId) ?? []
    list.push(s.skill)
    skillsByStudentId.set(s.studentId, list)
  }

  const projectsByStudentId = new Map<string, TalentProject[]>()
  for (const p of projectRows) {
    const list = projectsByStudentId.get(p.studentId) ?? []
    list.push({
      id: p.id,
      title: p.title,
      description: p.description,
      role: p.role,
      contributions: p.contributions,
      learnings: p.learnings,
      skillsUsed: p.skillsUsed,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      displayOrder: p.displayOrder,
      createdAt: p.createdAt,
    })
    projectsByStudentId.set(p.studentId, list)
  }

  const rows: TalentResult[] = studentRows.map((s) => ({
    ...s,
    skills: skillsByStudentId.get(s.id) ?? [],
    projects: projectsByStudentId.get(s.id) ?? [],
  }))

  return { rows, total }
}
