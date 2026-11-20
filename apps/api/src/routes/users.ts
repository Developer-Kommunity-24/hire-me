import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  getUserByEmail,
  getUserOnboardingStatus,
  setUserRole,
  syncAuthUser,
} from '../controllers/users.controller.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'

// ==========================================
// TYPES
// ==========================================

type UsersEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Roles accepted from the onboarding screen.
 *
 * `core_admin` and `club_admin` are deliberately absent — they are granted by an
 * administrator, and accepting them here would let anyone self-promote.
 */
const roleUpdateSchema = z.object({
  role: z.enum(['student', 'recruiter']),
})

const EMAIL_CONFLICT_MESSAGE = 'An account with this email address already exists'

// ==========================================
// ROUTER
// ==========================================

const usersRouter = new Hono<UsersEnv>()

/**
 * GET /api/users/check-email?email=...
 *
 * Public endpoint to check if an email already belongs to a registered user.
 * Returns their role and direct dashboard URL if they already have an account.
 */
usersRouter.get('/check-email', async (c) => {
  const email = c.req.query('email')
  if (!email) {
    return c.json({ error: 'Email query parameter is required' }, 400)
  }

  const user = await getUserByEmail(c.var.db, email)
  if (!user) {
    return c.json({ exists: false })
  }

  const { hasAccount, dashboardUrl } = await getUserOnboardingStatus(c.var.db, user)

  return c.json({
    exists: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    },
    hasAccount,
    dashboardUrl,
  })
})

// Every route below requires a verified Neon Auth bearer token.
usersRouter.use('*', requireAuth)

/**
 * GET /api/users/me
 *
 * Returns the caller's domain user, creating the row on first sign-in and
 * refreshing email/name from the token afterwards.
 */
usersRouter.get('/me', async (c) => {
  const result = await syncAuthUser(c.var.db, c.var.authUser)

  if (!result.ok) {
    return c.json({ error: EMAIL_CONFLICT_MESSAGE }, 409)
  }

  const user = result.user
  const { hasAccount, dashboardUrl } = await getUserOnboardingStatus(c.var.db, user)

  return c.json({
    user: {
      ...user,
      hasAccount,
      dashboardUrl,
    },
  })
})

/**
 * PATCH /api/users/me/role
 *
 * Persists the role chosen during onboarding, replacing the caller's
 * self-assignable role and leaving any admin grants untouched.
 */
usersRouter.patch('/me/role', zValidator('json', roleUpdateSchema), async (c) => {
  const { role } = c.req.valid('json')

  // Role selection can be the first authenticated request of a session, so
  // ensure the row exists before updating it.
  const sync = await syncAuthUser(c.var.db, c.var.authUser)

  if (!sync.ok) {
    return c.json({ error: EMAIL_CONFLICT_MESSAGE }, 409)
  }

  const user = await setUserRole(c.var.db, c.var.authUser.id, role)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

export { usersRouter }
