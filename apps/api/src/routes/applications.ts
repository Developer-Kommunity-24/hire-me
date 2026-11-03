import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { DbVariables } from '../middleware/db.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { StudentVariables } from '../middleware/requireStudent.js'
import { requireAuth } from '../middleware/auth.js'
import { requireStudent } from '../middleware/requireStudent.js'
import { requireRecruiter } from '../middleware/requireRecruiter.js'
import {
  applyToPosting,
  listOwnApplications,
  updateApplicationStatus,
} from '../controllers/applications.controller.js'
import { createApplicationSchema, updateApplicationStatusSchema } from './applications.schemas.js'

const uuidSchema = z.uuid()

type ApplicationsEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables & StudentVariables & { recruiterId: string }
}

export const applicationsRouter = new Hono<ApplicationsEnv>()

// Every route below requires a verified Neon Auth bearer token.
applicationsRouter.use('*', requireAuth)

/**
 * POST /api/applications: apply to a posting.
 * 404 unknown posting; 409 closed/expired or already applied.
 */
applicationsRouter.post(
  '/',
  requireStudent,
  zValidator('json', createApplicationSchema),
  async (c) => {
    const { postingId } = c.req.valid('json')
    const result = await applyToPosting(c.var.db, c.var.studentId, postingId)

    if (!result.ok) {
      if (result.error === 'not_found') {
        return c.json({ error: 'Posting not found' }, 404)
      }

      if (result.error === 'closed') {
        return c.json({ error: 'This posting is closed or no longer accepting applications' }, 409)
      }

      return c.json({ error: 'You have already applied to this posting' }, 409)
    }

    return c.json({ data: result.data }, 201)
  },
)

/** GET /api/applications: the caller's applications, newest first. */
applicationsRouter.get('/', requireStudent, async (c) => {
  const rows = await listOwnApplications(c.var.db, c.var.studentId)
  return c.json({ data: rows })
})

/**
 * PATCH /api/applications/:id/status: owner recruiter moves an application.
 * 404 unknown or unowned; 409 illegal transition.
 */
applicationsRouter.patch(
  '/:id/status',
  requireRecruiter,
  zValidator('json', updateApplicationStatusSchema),
  async (c) => {
    const rawId = c.req.param('id')

    if (!uuidSchema.safeParse(rawId).success) {
      return c.json({ error: 'Application not found' }, 404)
    }

    const { status } = c.req.valid('json')
    const result = await updateApplicationStatus(c.var.db, c.var.recruiterId, rawId, status)

    if (!result.ok) {
      if (result.error === 'not_found') {
        return c.json({ error: 'Application not found' }, 404)
      }

      return c.json(
        { error: `Cannot move an application from "${result.from}" to "${status}"` },
        409,
      )
    }

    return c.json({ data: result.data })
  },
)
