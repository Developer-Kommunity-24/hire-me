import { eq } from 'drizzle-orm'
import { recruiters, users } from '@repo/db'
import type { Database, Recruiter, NewRecruiter } from '@repo/db'

export interface AuthUserInput {
  id: string
  email: string
  name: string | null
}

export interface UpsertRecruiterInput {
  fullName?: string
  jobTitle?: string
  companyName?: string
  companyMail?: string
  companyUrl?: string
  headquartersLocation?: string
  bio?: string
  isComplete?: boolean
}

export function buildNewRecruiter(userId: string, data: UpsertRecruiterInput): NewRecruiter {
  return {
    userId,
    companyName: data.companyName ?? '',
    companyMail: data.companyMail ?? '',
    companyUrl: data.companyUrl ?? null,
    headquartersLocation: data.headquartersLocation ?? null,
    jobTitle: data.jobTitle ?? null,
    bio: data.bio ?? null,
    isComplete: data.isComplete ?? false,
    isDeleted: false,
  }
}

export function buildRecruiterUpdateFields(data: UpsertRecruiterInput): Partial<NewRecruiter> {
  const updateSet: Partial<NewRecruiter> = {}
  if (data.companyName !== undefined) updateSet.companyName = data.companyName
  if (data.companyMail !== undefined) updateSet.companyMail = data.companyMail
  if (data.companyUrl !== undefined) updateSet.companyUrl = data.companyUrl
  if (data.headquartersLocation !== undefined)
    updateSet.headquartersLocation = data.headquartersLocation
  if (data.jobTitle !== undefined) updateSet.jobTitle = data.jobTitle
  if (data.bio !== undefined) updateSet.bio = data.bio
  if (data.isComplete !== undefined) updateSet.isComplete = data.isComplete
  return updateSet
}

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

export async function upsertRecruiter(
  db: Database,
  authUser: AuthUserInput,
  data: UpsertRecruiterInput,
): Promise<Recruiter | null> {
  if (data.fullName) {
    await db
      .update(users)
      .set({ fullName: data.fullName, updatedAt: new Date() })
      .where(eq(users.id, authUser.id))
  }

  const recruiterData = buildNewRecruiter(authUser.id, data)
  const updateSet = buildRecruiterUpdateFields(data)

  const [recruiter] = await db
    .insert(recruiters)
    .values(recruiterData)
    .onConflictDoUpdate({
      target: recruiters.userId,
      set: updateSet,
    })
    .returning()

  return recruiter ?? null
}
