import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { studentProfiles } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

/**
 * Variables injected into Hono context by this middleware.
 *
 * `studentId` mirrors `authUser.id` but only exists once a `student_profiles`
 * row has been confirmed, so downstream handlers can trust it.
 */
export type StudentVariables = { studentId: string }

/**
 * Confirms the authenticated caller has a student profile.
 *
 * Mirrors {@link requireRecruiter} for the student side of the pipeline. The
 * `applications.student_id` foreign key points at `student_profiles`, so a
 * caller without a profile could never be persisted anyway — this rejects them
 * early with a clear 403.
 */
export const requireStudent = createMiddleware<{
  Variables: AuthVariables & DbVariables & StudentVariables
}>(async (c, next) => {
  const { authUser } = c.var
  const db = c.var.db

  const [student] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, authUser.id))
    .limit(1)

  if (!student) {
    return c.json({ error: 'Student profile required to apply to postings' }, 403)
  }

  c.set('studentId', student.userId)
  await next()
})
