import { createMiddleware } from 'hono/factory'
import { and, eq } from 'drizzle-orm'
import { recruiters } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

/**
 * Confirms the authenticated caller has an active recruiter profile.
 * Used on PATCH and close — no admin-on-behalf here.
 */
export const requireRecruiter = createMiddleware<{
  Variables: AuthVariables & DbVariables & { recruiterId: string }
}>(async (c, next) => {
  const { authUser } = c.var
  const db = c.var.db

  const [recruiter] = await db
    .select({ userId: recruiters.userId })
    .from(recruiters)
    .where(and(eq(recruiters.userId, authUser.id), eq(recruiters.isDeleted, false)))
    .limit(1)

  if (!recruiter) {
    return c.json({ error: 'Recruiter profile required to manage postings' }, 403)
  }

  c.set('recruiterId', recruiter.userId)
  await next()
})
