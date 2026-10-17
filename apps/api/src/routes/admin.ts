import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { appointCoreAdmin, removeCoreAdmin } from '../controllers/admin.controller.js'
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

const uuidSchema = z.uuid()

// ==========================================
// ROUTER
// ==========================================

export const adminRouter = new Hono<AdminEnv>()

// Every route requires an authenticated core administrator.
adminRouter.use('*', requireAuth)
adminRouter.use('*', requireCoreAdmin)

/**
 * POST /api/admin/core-admins
 *
 * Appoints the core-admin role to an existing user. Existing roles are
 * preserved, and appointing an existing core admin is idempotent.
 */
adminRouter.post(
  '/core-admins',
  zValidator('json', appointCoreAdminSchema),
  async (c) => {
    const { userId } = c.req.valid('json')
    const result = await appointCoreAdmin(c.var.db, userId)

    if (!result.ok) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user: result.user })
  },
)

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
