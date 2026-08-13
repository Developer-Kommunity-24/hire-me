import { neon } from '@neondatabase/serverless'
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http'
import { PGlite } from '@electric-sql/pglite'
import { drizzle as pgliteDrizzle } from 'drizzle-orm/pglite'
import * as schema from './schema/index'

/**
 * Returns a Drizzle database client.
 * If DATABASE_URL is present, connects to Neon Serverless Postgres.
 * If DATABASE_URL is missing, falls back to a local PGLite database (perfect for local dev without Docker).
 */
export async function getDb() {
  if (process.env.DATABASE_URL) {
    console.log('🔌 Connecting to remote PostgreSQL (Neon)...')
    const sql = neon(process.env.DATABASE_URL)
    return neonDrizzle(sql, { schema })
  } else {
    console.log('📦 No DATABASE_URL found. Using local PGLite database...')
    // Creates a local PostgreSQL database inside the `.db` folder
    const client = new PGlite('./.db')
    return pgliteDrizzle(client, { schema })
  }
}

export type DbClient = Awaited<ReturnType<typeof getDb>>
