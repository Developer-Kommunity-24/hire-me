import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { studentProfiles, users } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

/**
 * `studentId` is only set once a `student_profiles` row is confirmed, so
 * downstream handlers can trust it.
 */
export type StudentVariables = { studentId: string }

/** Rejects the caller with 403 unless they have a student profile or student role. */
export const requireStudent = createMiddleware<{
  Variables: AuthVariables & DbVariables & StudentVariables
}>(async (c, next) => {
  const { authUser } = c.var
  const db = c.var.db

  let [student] = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, authUser.id))
    .limit(1)

  if (!student) {
    const [user] = await db
      .select({ roles: users.roles })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)

    if (user && user.roles.includes('student')) {
      const [newProfile] = await db
        .insert(studentProfiles)
        .values({
          userId: authUser.id,
          headline: null,
          bio: null,
          gradYear: null,
          openToWork: false,
          resumeUrl: null,
          githubUrl: null,
          linkedinUrl: null,
          otherLinks: null,
          dk24Status: 'none',
        })
        .onConflictDoNothing()
        .returning({ userId: studentProfiles.userId })

      student =
        newProfile ??
        (
          await db
            .select({ userId: studentProfiles.userId })
            .from(studentProfiles)
            .where(eq(studentProfiles.userId, authUser.id))
            .limit(1)
        )[0]
    }
  }

  if (!student) {
    return c.json({ error: 'Student profile required to apply to postings' }, 403)
  }

  c.set('studentId', student.userId)
  await next()
})
