import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  appointClubAdmin,
  appointCoreAdmin,
  assignClubAdmin,
  createClub,
  deactivateClub,
  getAdminStats,
  listClubs,
  removeClubAdmin,
  removeCoreAdmin,
  updateClub,
} from '../controllers/admin.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireCoreAdmin } from '../middleware/core-admin.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'

// ==========================================
// TYPES
// ==========================================

type AdminEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables
}

// ==========================================
// VALIDATION
// ==========================================

const appointCoreAdminSchema = z.object({
  userId: z.uuid(),
})

const appointClubAdminSchema = z.object({
  userId: z.uuid(),
  clubId: z.uuid(),
})

const createClubSchema = z.object({
  name: z.string().trim().min(1, 'Club name is required').max(255),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain lowercase letters, numbers, and hyphens',
    ),
})

const updateClubSchema = z
  .object({
    name: z.string().trim().min(1, 'Club name cannot be empty').max(255).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must contain lowercase letters, numbers, and hyphens',
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

const uuidSchema = z.uuid()

// ==========================================
// ROUTER
// ==========================================

export const adminRouter = new Hono<AdminEnv>()

// Every route requires an authenticated core administrator.
adminRouter.use('*', requireAuth)
adminRouter.use('*', requireCoreAdmin)

/**
 * GET /api/admin/stats
 *
 * Returns platform-wide counts for the core-admin dashboard, including
 * application totals broken down by status.
 */
adminRouter.get('/stats', async (c) => {
  const stats = await getAdminStats(c.var.db)
  return c.json({ data: stats })
})

/**
 * GET /api/admin/application-statuses
 *
 * Returns application counts grouped by status for dashboard charts.
 */
adminRouter.get('/application-statuses', async (c) => {
  const stats = await getAdminStats(c.var.db)
  return c.json({
    data: {
      applicationsByStatus: stats.applicationsByStatus,
      applicationStatusCounts: stats.applicationStatusCounts,
    },
  })
})

/**
 * GET /api/admin/application-stats
 *
 * Backward-compatible alias for application status counts.
 */
adminRouter.get('/application-stats', async (c) => {
  const stats = await getAdminStats(c.var.db)
  return c.json({
    data: {
      applicationsByStatus: stats.applicationsByStatus,
      applicationStatusCounts: stats.applicationStatusCounts,
    },
  })
})

/**
 * POST /api/admin/core-admins
 *
 * Appoints the core-admin role to an existing user. Existing roles are
 * preserved, and appointing an existing core admin is idempotent.
 */
adminRouter.post('/core-admins', zValidator('json', appointCoreAdminSchema), async (c) => {
  const { userId } = c.req.valid('json')
  const result = await appointCoreAdmin(c.var.db, userId)

  if (!result.ok) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: result.user })
})

/**
 * DELETE /api/admin/core-admins/:userId
 *
 * Removes the core-admin role from an existing user. Other roles are
 * preserved, and removing the role from a non-core admin is idempotent.
 */
adminRouter.delete('/core-admins/:userId', async (c) => {
  const userId = c.req.param('userId')

  if (!uuidSchema.safeParse(userId).success) {
    return c.json({ error: 'User not found' }, 404)
  }

  const result = await removeCoreAdmin(c.var.db, userId)

  if (!result.ok) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: result.user })
})

/**
 * POST /api/admin/club-admins
 *
 * Assigns an existing user to administer an existing club. The mapping and
 * role are kept synchronized, and a user can administer only one club.
 */
adminRouter.post('/club-admins', zValidator('json', appointClubAdminSchema), async (c) => {
  const { userId, clubId } = c.req.valid('json')
  const result = await appointClubAdmin(c.var.db, userId, clubId)

  if (!result.ok) {
    if (result.reason === 'already_assigned') {
      return c.json({ error: 'User is already assigned as a club admin' }, 409)
    }

    return c.json(
      { error: result.reason === 'user_not_found' ? 'User not found' : 'Club not found' },
      404,
    )
  }

  return c.json({ data: { user: result.user, clubAdmin: result.clubAdmin } }, 201)
})

/**
 * PATCH /api/admin/club-admins/:userId
 *
 * Assigns an existing club admin to an active club, replacing any existing
 * assignment for that user.
 */
adminRouter.patch(
  '/club-admins/:userId',
  async (c, next) => {
    if (!uuidSchema.safeParse(c.req.param('userId')).success) {
      return c.json({ error: 'User not found' }, 400)
    }

    await next()
  },
  zValidator('json', z.object({ clubId: z.uuid() })),
  async (c) => {
    const userId = c.req.param('userId')
    const { clubId } = c.req.valid('json')
    const result = await assignClubAdmin(c.var.db, userId, clubId)

    if (!result.ok) {
      if (result.reason === 'user_not_found' || result.reason === 'club_not_found') {
        return c.json(
          { error: result.reason === 'user_not_found' ? 'User not found' : 'Club not found' },
          404,
        )
      }

      return c.json(
        {
          error: result.reason === 'missing_role' ? 'User is not a club admin' : 'Club is inactive',
        },
        400,
      )
    }

    return c.json({ data: { user: result.user, clubAdmin: result.clubAdmin } })
  },
)

/**
 * DELETE /api/admin/club-admins/:userId
 *
 * Removes the user's club-admin mapping and role. Other roles are preserved.
 */
adminRouter.delete('/club-admins/:userId', async (c) => {
  const userId = c.req.param('userId')

  if (!uuidSchema.safeParse(userId).success) {
    return c.json({ error: 'Club admin not found' }, 404)
  }

  const result = await removeClubAdmin(c.var.db, userId)

  if (!result.ok) {
    return c.json({ error: 'Club admin not found' }, 404)
  }

  return c.json({ data: { user: result.user, clubAdmin: result.clubAdmin } })
})

/**
 * GET /api/admin/clubs
 *
 * Lists every club, including inactive clubs, ordered by name.
 */
adminRouter.get('/clubs', async (c) => {
  const result = await listClubs(c.var.db)
  return c.json({ data: result.clubs })
})

/**
 * POST /api/admin/clubs
 *
 * Creates an active club after normalizing and validating its name and slug.
 */
adminRouter.post('/clubs', zValidator('json', createClubSchema), async (c) => {
  const result = await createClub(c.var.db, c.req.valid('json'))

  if (!result.ok) {
    return c.json(
      {
        error:
          result.reason === 'duplicate_name'
            ? 'Club name already exists'
            : 'Club slug already exists',
      },
      409,
    )
  }

  return c.json({ data: result.club }, 201)
})

/**
 * PATCH /api/admin/clubs/:id
 *
 * Updates either club field independently while preserving omitted fields.
 */
adminRouter.patch(
  '/clubs/:id',
  async (c, next) => {
    if (!uuidSchema.safeParse(c.req.param('id')).success) {
      return c.json({ error: 'Club not found' }, 404)
    }

    await next()
  },
  zValidator('json', updateClubSchema),
  async (c) => {
    const id = c.req.param('id')
    const result = await updateClub(c.var.db, id, c.req.valid('json'))

    if (!result.ok) {
      if (result.reason === 'not_found') {
        return c.json({ error: 'Club not found' }, 404)
      }

      return c.json(
        {
          error:
            result.reason === 'duplicate_name'
              ? 'Club name already exists'
              : 'Club slug already exists',
        },
        409,
      )
    }

    return c.json({ data: result.club })
  },
)

/**
 * DELETE /api/admin/clubs/:id
 *
 * Soft-deactivates a club and retains its database row.
 */
adminRouter.delete('/clubs/:id', async (c) => {
  const id = c.req.param('id')

  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Club not found' }, 404)
  }

  const result = await deactivateClub(c.var.db, id)

  if (!result.ok) {
    return c.json(
      {
        error: result.reason === 'already_inactive' ? 'Club is already inactive' : 'Club not found',
      },
      result.reason === 'already_inactive' ? 409 : 404,
    )
  }

  return c.json({ data: result.club })
})
