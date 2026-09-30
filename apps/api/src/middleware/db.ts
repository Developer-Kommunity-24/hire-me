import { createMiddleware } from 'hono/factory'
import type { Database } from '@repo/db'
import { createDb } from '@repo/db'
import { env } from 'hono/adapter'

/**
 * Variables injected into Hono context by this middleware.
 */
export type DbVariables = {
  db: Database
}

/**
 * Reads DATABASE_URL from the Worker's env bindings (set via .dev.vars locally
 * or wrangler secret in production) and attaches a Drizzle database client to
 * `c.var.db` so route handlers don't have to create one.
 */
export const dbMiddleware = createMiddleware<{
  Bindings: { DATABASE_URL: string }
  Variables: DbVariables
}>(async (c, next) => {
  const bindings = env(c)
  const db = createDb(bindings.DATABASE_URL)
  c.set('db', db)
  await next()
})
