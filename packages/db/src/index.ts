import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema/index'

export type { schema }

/**
 * Creates a Drizzle database client configured for Neon's serverless HTTP driver.
 *
 * Intended usage in a Cloudflare Worker:
 * ```ts
 * import { createDb } from '@repo/db';
 * const db = createDb(env.DATABASE_URL);
 * ```
 *
 * @param url - The Neon connection string (typically from an environment/secret binding).
 */
export function createDb(url: string) {
  const sql = neon(url)
  return drizzle(sql, { schema })
}

export type Database = ReturnType<typeof createDb>

export * from './schema/index'
