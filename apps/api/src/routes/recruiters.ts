import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getRecruiterByUserId, upsertRecruiter } from '../controllers/recruiters.controller.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'

// ==========================================
// TYPES
// ==========================================

type RecruitersEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables
}

// ==========================================
// VALIDATION
// ==========================================

const recruiterUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
  companyMail: z.string().email().optional(),
  companyUrl: z.string().url().optional().or(z.literal('')),
  headquartersLocation: z.string().optional(),
  bio: z.string().optional(),
  isComplete: z.boolean().optional(),
})

// ==========================================
// ROUTER
// ==========================================

const recruitersRouter = new Hono<RecruitersEnv>()

// Every route below requires a verified Neon Auth bearer token.
recruitersRouter.use('*', requireAuth)

/**
 * GET /api/recruiters/me
 *
 * Returns the caller's recruiter row, or null if none exists yet.
 */
recruitersRouter.get('/me', async (c) => {
  const recruiter = await getRecruiterByUserId(c.var.db, c.var.authUser.id)

  return c.json({ recruiter })
})

/**
 * PATCH /api/recruiters/me
 *
 * Upserts the caller's recruiter profile.
 * Accepts all fields as optional for per-step saves and draft saving.
 */
recruitersRouter.patch(
  '/me',
  zValidator('json', recruiterUpdateSchema),
  async (c) => {
    const data = c.req.valid('json')

    const recruiter = await upsertRecruiter(c.var.db, c.var.authUser, data)

    if (!recruiter) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ recruiter })
  },
)

export { recruitersRouter }
