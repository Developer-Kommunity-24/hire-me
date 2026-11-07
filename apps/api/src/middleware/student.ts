import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { users, userRoleEnum } from '@repo/db'
import type { AuthVariables } from './auth.js'
import type { DbVariables } from './db.js'

// ==========================================
// TYPES
// ==========================================

export type UserRole = (typeof userRoleEnum.enumValues)[number]

export interface AuthedUser {
  id: string
  fullName: string | null
  email: string
  role: UserRole
}

export type StudentVariables = {
  user: AuthedUser
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthedUser
  }
}

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Hono middleware that checks the caller is a student.
 *  - Expects `requireAuth` and `dbMiddleware` to have already run (reads `authUser` and `db` from context).
 *  - 500 if the database is not available on the context.
 *  - 401 if the user does not exist in the database.
 *  - 403 if the user exists but does not have the `student` role.
 * On success, sets `user` on the context for downstream handlers.
 *
 * Usage: `router.use('*', requireAuth, requireStudentRole())`
 */
export function requireStudentRole() {
  return createMiddleware<{
    Variables: DbVariables & AuthVariables & StudentVariables
  }>(async (c, next) => {
    const authUser = c.get('authUser')

    const db = c.var.db
    if (!db) {
      return c.json({ error: 'Internal Server Error', message: 'Database not available.' }, 500)
    }

    const [user] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1)

    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'User record not found.' }, 401)
    }

    if (!user.roles.includes('student')) {
      return c.json({ error: 'Forbidden', message: 'Only students can access this resource.' }, 403)
    }

    c.set('user', {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: 'student',
    })

    await next()
  })
}
