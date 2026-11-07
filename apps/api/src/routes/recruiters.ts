import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  createRecruiterProfile,
  deleteRecruiterProfile,
  getPublicRecruiterById,
  getRecruiterByUserId,
  updateRecruiterProfile,
} from '../controllers/recruiters.controller.js'
import { syncAuthUser } from '../controllers/users.controller.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'

// ==========================================
// TYPES
// ==========================================

type RecruitersEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & Partial<AuthVariables>
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid website URL (e.g. https://company.com)',
  })
  .optional()
  .nullable()

export const createRecruiterProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  companyMail: z
    .string()
    .trim()
    .min(1, 'Company work email is required')
    .email('Please enter a valid work email address'),
  companyUrl: optionalUrl,
  headquartersLocation: z.string().trim().optional().nullable(),
})

export const updateRecruiterProfileSchema = z
  .object({
    companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').optional(),
    companyMail: z.string().trim().email('Please enter a valid work email address').optional(),
    companyUrl: optionalUrl,
    headquartersLocation: z.string().trim().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  })

const uuidSchema = z.string().uuid()
const EMAIL_CONFLICT_MESSAGE = 'An account with this email address already exists'

// ==========================================
// ROUTER
// ==========================================

export const recruitersRouter = new Hono<RecruitersEnv>()

/**
 * POST /api/recruiters/profile
 * Primary onboarding endpoint: creates the recruiter profile and ensures the
 * user has the 'recruiter' role assigned.
 */
recruitersRouter.post(
  '/profile',
  requireAuth,
  zValidator('json', createRecruiterProfileSchema),
  async (c) => {
    const authUser = c.get('authUser')!
    const input = c.req.valid('json')

    // Ensure user row is synced in domain table
    const sync = await syncAuthUser(c.var.db, authUser)
    if (!sync.ok) {
      return c.json({ error: EMAIL_CONFLICT_MESSAGE }, 409)
    }

    const result = await createRecruiterProfile(c.var.db, authUser.id, input)

    if (!result.ok) {
      if (result.error === 'profile_exists') {
        return c.json({ error: 'Recruiter profile already exists' }, 409)
      }
      return c.json({ error: 'Failed to create recruiter profile' }, 500)
    }

    return c.json({ recruiter: result.data }, 201)
  },
)

/**
 * Alias POST /api/recruiters for convenience
 */
recruitersRouter.post(
  '/',
  requireAuth,
  zValidator('json', createRecruiterProfileSchema),
  async (c) => {
    const authUser = c.get('authUser')!
    const input = c.req.valid('json')

    const sync = await syncAuthUser(c.var.db, authUser)
    if (!sync.ok) {
      return c.json({ error: EMAIL_CONFLICT_MESSAGE }, 409)
    }

    const result = await createRecruiterProfile(c.var.db, authUser.id, input)

    if (!result.ok) {
      if (result.error === 'profile_exists') {
        return c.json({ error: 'Recruiter profile already exists' }, 409)
      }
      return c.json({ error: 'Failed to create recruiter profile' }, 500)
    }

    return c.json({ recruiter: result.data }, 201)
  },
)

/**
 * GET /api/recruiters/me
 * Retrieves current authenticated user's recruiter profile.
 * Returns 404 if profile does not exist or was deleted.
 */
recruitersRouter.get('/me', requireAuth, async (c) => {
  const authUser = c.get('authUser')!
  const recruiter = await getRecruiterByUserId(c.var.db, authUser.id)

  if (!recruiter) {
    return c.json({ error: 'Recruiter profile not found' }, 404)
  }

  return c.json({ recruiter })
})

/**
 * PATCH /api/recruiters/me
 * Updates current recruiter profile fields.
 */
recruitersRouter.patch(
  '/me',
  requireAuth,
  zValidator('json', updateRecruiterProfileSchema),
  async (c) => {
    const authUser = c.get('authUser')!
    const input = c.req.valid('json')

    const result = await updateRecruiterProfile(c.var.db, authUser.id, input)

    if (!result.ok) {
      if (result.error === 'not_found') {
        return c.json({ error: 'Recruiter profile not found' }, 404)
      }
      return c.json({ error: 'Failed to update recruiter profile' }, 500)
    }

    return c.json({ recruiter: result.data })
  },
)

/**
 * DELETE /api/recruiters/me
 * Soft-deletes the current recruiter profile.
 */
recruitersRouter.delete('/me', requireAuth, async (c) => {
  const authUser = c.get('authUser')!
  const deleted = await deleteRecruiterProfile(c.var.db, authUser.id)

  if (!deleted) {
    return c.json({ error: 'Recruiter profile not found' }, 404)
  }

  return c.json({ success: true })
})

/**
 * GET /api/recruiters/:id
 * Public endpoint to fetch company details for a recruiter by user ID.
 */
recruitersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Recruiter not found' }, 404)
  }

  const recruiter = await getPublicRecruiterById(c.var.db, id)

  if (!recruiter) {
    return c.json({ error: 'Recruiter not found' }, 404)
  }

  return c.json({ data: recruiter })
})
