import { createMiddleware } from 'hono/factory'
import { and, eq, sql } from 'drizzle-orm'
import { users } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Guards core-admin routes.
 *
 * Must run after both `dbMiddleware` and `requireAuth` so that `c.var.db` and
 * `c.var.authUser` are already set. Returns 403 when the user does not have
 * the `core_admin` role.
 */
export const requireCoreAdmin = createMiddleware<{
  Variables: DbVariables & AuthVariables
}>(async (c, next) => {
  const { db, authUser } = c.var

  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.id, authUser.id),
        sql`${users.roles} @> ARRAY['core_admin']::user_role[]`,
      ),
    )
    .limit(1)

  if (!adminUser) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await next()
})