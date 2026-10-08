import { createMiddleware } from 'hono/factory'
import { and, eq } from 'drizzle-orm'
import { recruiters, users } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'
import type { createPostingSchema } from '../routes/postings.schemas.js'
import type { z } from 'zod'

type CreatePostingBody = z.output<typeof createPostingSchema>

type RequireRecruiterOrAdminEnv = {
  Variables: AuthVariables & DbVariables & { recruiterId: string }
}

type RequireRecruiterOrAdminInput = {
  in: { json: CreatePostingBody }
  out: { json: CreatePostingBody }
}

/**
 * Allows active recruiters to create postings and core admins to create
 * postings on behalf of an active recruiter.
 */
export const requireRecruiterOrAdmin = createMiddleware<
  RequireRecruiterOrAdminEnv,
  string,
  RequireRecruiterOrAdminInput
>(async (c, next) => {
  const { authUser } = c.var
  const db = c.var.db

  const [callerUser] = await db
    .select({ roles: users.roles })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  const isAdmin = callerUser?.roles.includes('core_admin') ?? false

  if (isAdmin) {
    const { onBehalfOfRecruiterId } = c.req.valid('json')

    if (!onBehalfOfRecruiterId) {
      return c.json({ error: 'onBehalfOfRecruiterId is required for core admins' }, 400)
    }

    const [target] = await db
      .select({ userId: recruiters.userId })
      .from(recruiters)
      .where(and(eq(recruiters.userId, onBehalfOfRecruiterId), eq(recruiters.isDeleted, false)))
      .limit(1)

    if (!target) {
      return c.json({ error: 'Target recruiter not found' }, 404)
    }

    c.set('recruiterId', target.userId)
    return next()
  }

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
