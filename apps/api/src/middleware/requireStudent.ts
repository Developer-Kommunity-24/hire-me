import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { studentProfiles } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

/**
 * `studentId` is only set once a `student_profiles` row is confirmed, so
 * downstream handlers can trust it.
 */
export type StudentVariables = { studentId: string }

/** Rejects the caller with 403 unless they have a student profile. */
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
