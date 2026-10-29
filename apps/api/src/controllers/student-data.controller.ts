import { and, asc, desc, eq } from 'drizzle-orm'
import { achievements, experience, projects, studentProfiles, skills } from '@repo/db'
import type { Database } from '@repo/db'

export type SkillInput = { skill: string }
export type ProjectInput = {
  title: string
  description?: string | null
  role?: string | null
  contributions?: string | null
  learnings?: string | null
  skillsUsed?: string[] | null
  liveUrl?: string | null
  githubUrl?: string | null
  displayOrder?: number
}
export type ExperienceInput = {
  companyName: string
  role: string
  startDate?: string | null
  endDate?: string | null
  contributions?: string | null
}
export type AchievementInput = {
  type?: 'hackathon' | 'certification' | 'award' | 'other'
  title: string
  description?: string | null
  date?: string | null
}

export type WriteResult<T> =
  { ok: true; data: T } | { ok: false; error: 'duplicate' | 'not_found' | 'invalid_date_range' }
export type CreateResult<T> =
  { ok: true; data: T } | { ok: false; error: 'student_profile_missing' | 'duplicate' }

function isConstraintError(error: unknown, constraint: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { message: string }).message.includes(constraint)
  )
}

export async function listSkills(db: Database, studentId: string) {
  return db
    .select()
    .from(skills)
    .where(eq(skills.studentId, studentId))
    .orderBy(asc(skills.skill), asc(skills.id))
}

export async function createSkill(
  db: Database,
  studentId: string,
  input: SkillInput,
): Promise<CreateResult<typeof skills.$inferSelect>> {
  const [profile] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1)

  if (!profile) return { ok: false, error: 'student_profile_missing' }

  try {
    const [data] = await db
      .insert(skills)
      .values({ ...input, studentId })
      .returning()
    if (!data) throw new Error('Insert returned no rows')
    return { ok: true, data }
  } catch (error) {
    if (isConstraintError(error, 'idx_skills_student_skill'))
      return { ok: false, error: 'duplicate' }
    throw error
  }
}

export async function updateSkill(
  db: Database,
  studentId: string,
  id: string,
  input: SkillInput,
): Promise<WriteResult<typeof skills.$inferSelect>> {
  try {
    const [data] = await db
      .update(skills)
      .set({ skill: input.skill })
      .where(and(eq(skills.id, id), eq(skills.studentId, studentId)))
      .returning()
    return data ? { ok: true, data } : { ok: false, error: 'not_found' }
  } catch (error) {
    if (isConstraintError(error, 'idx_skills_student_skill'))
      return { ok: false, error: 'duplicate' }
    throw error
  }
}

export async function deleteSkill(db: Database, studentId: string, id: string) {
  const [data] = await db
    .delete(skills)
    .where(and(eq(skills.id, id), eq(skills.studentId, studentId)))
    .returning({ id: skills.id })
  return Boolean(data)
}

export async function listProjects(db: Database, studentId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.studentId, studentId))
    .orderBy(asc(projects.displayOrder), asc(projects.createdAt), asc(projects.id))
}

export async function createProject(db: Database, studentId: string, input: ProjectInput) {
  const [profile] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1)

  if (!profile) return { ok: false as const, error: 'student_profile_missing' as const }

  const [data] = await db
    .insert(projects)
    .values({ ...input, studentId })
    .returning()
  if (!data) throw new Error('Insert returned no rows')
  return { ok: true as const, data }
}

export async function updateProject(
  db: Database,
  studentId: string,
  id: string,
  input: Partial<ProjectInput>,
): Promise<WriteResult<typeof projects.$inferSelect>> {
  const [data] = await db
    .update(projects)
    .set(input)
    .where(and(eq(projects.id, id), eq(projects.studentId, studentId)))
    .returning()
  return data ? { ok: true, data } : { ok: false, error: 'not_found' }
}

export async function deleteProject(db: Database, studentId: string, id: string) {
  const [data] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.studentId, studentId)))
    .returning({ id: projects.id })
  return Boolean(data)
}

export async function listExperience(db: Database, studentId: string) {
  return db
    .select()
    .from(experience)
    .where(eq(experience.studentId, studentId))
    .orderBy(desc(experience.startDate), desc(experience.createdAt), asc(experience.id))
}

export async function createExperience(db: Database, studentId: string, input: ExperienceInput) {
  const [profile] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1)

  if (!profile) return { ok: false as const, error: 'student_profile_missing' as const }

  const [data] = await db
    .insert(experience)
    .values({ ...input, studentId })
    .returning()
  if (!data) throw new Error('Insert returned no rows')
  return { ok: true as const, data }
}

export async function updateExperience(
  db: Database,
  studentId: string,
  id: string,
  input: Partial<ExperienceInput>,
): Promise<WriteResult<typeof experience.$inferSelect>> {
  const data = await db
    .select()
    .from(experience)
    .where(and(eq(experience.id, id), eq(experience.studentId, studentId)))
    .limit(1)

  if (data.length === 0) return { ok: false, error: 'not_found' }

  const existing = data[0]
  if (!existing) return { ok: false, error: 'not_found' }
  const startDate = Object.prototype.hasOwnProperty.call(input, 'startDate')
    ? (input.startDate ?? null)
    : existing.startDate
  const endDate = Object.prototype.hasOwnProperty.call(input, 'endDate')
    ? (input.endDate ?? null)
    : existing.endDate

  if (startDate && endDate && endDate < startDate) {
    return { ok: false, error: 'invalid_date_range' }
  }

  const [updated] = await db
    .update(experience)
    .set(input)
    .where(and(eq(experience.id, id), eq(experience.studentId, studentId)))
    .returning()
  return updated ? { ok: true, data: updated } : { ok: false, error: 'not_found' }
}

export async function deleteExperience(db: Database, studentId: string, id: string) {
  const [data] = await db
    .delete(experience)
    .where(and(eq(experience.id, id), eq(experience.studentId, studentId)))
    .returning({ id: experience.id })
  return Boolean(data)
}

export async function listAchievements(db: Database, studentId: string) {
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.studentId, studentId))
    .orderBy(desc(achievements.date), desc(achievements.createdAt), asc(achievements.id))
}

export async function createAchievement(db: Database, studentId: string, input: AchievementInput) {
  const [profile] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1)

  if (!profile) return { ok: false as const, error: 'student_profile_missing' as const }

  const [data] = await db
    .insert(achievements)
    .values({ ...input, studentId })
    .returning()
  if (!data) throw new Error('Insert returned no rows')
  return { ok: true as const, data }
}

export async function updateAchievement(
  db: Database,
  studentId: string,
  id: string,
  input: Partial<AchievementInput>,
): Promise<WriteResult<typeof achievements.$inferSelect>> {
  const [data] = await db
    .update(achievements)
    .set(input)
    .where(and(eq(achievements.id, id), eq(achievements.studentId, studentId)))
    .returning()
  return data ? { ok: true, data } : { ok: false, error: 'not_found' }
}

export async function deleteAchievement(db: Database, studentId: string, id: string) {
  const [data] = await db
    .delete(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.studentId, studentId)))
    .returning({ id: achievements.id })
  return Boolean(data)
}
