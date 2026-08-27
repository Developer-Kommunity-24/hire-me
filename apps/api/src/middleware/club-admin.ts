import { createMiddleware } from 'hono/factory'
import { and, eq, sql } from 'drizzle-orm'
import { clubAdmins, users } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

// ==========================================
// TYPES
// ==========================================

/**
 * Variables injected into Hono context by this middleware.
 *
 * `clubId` is the club the authenticated user administers. It is resolved once
 * per request and used by all club-member route handlers so the club is never
 * taken from the request body or URL — a volunteer cannot touch another club.
 */
export type ClubAdminVariables = { clubId: string }

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Resolves the calling user's administered club and guards club-admin routes.
 *
 * Must run after both `dbMiddleware` and `requireAuth` so that `c.var.db` and
 * `c.var.authUser` are already set. Returns 403 when the user has no row in
 * `club_admins`, preventing any cross-club data access.
 */
export const requireClubAdmin = createMiddleware<{
  Variables: DbVariables & AuthVariables & ClubAdminVariables
}>(async (c, next) => {
  const { db, authUser } = c.var

  const [adminRow] = await db
    .select({ clubId: clubAdmins.clubId })
    .from(clubAdmins)
    .innerJoin(users, eq(users.id, clubAdmins.userId))
    .where(
      and(
        eq(clubAdmins.userId, authUser.id),
        sql`${users.roles} @> ARRAY['club_admin']::user_role[]`,
      ),
    )
    .limit(1)

  if (!adminRow) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  c.set('clubId', adminRow.clubId)
  await next()
})
