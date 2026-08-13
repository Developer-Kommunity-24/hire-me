import 'dotenv/config'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'

async function runLocalMigration() {
  console.log('🛠️  Migrating local PGLite database...')
  const client = new PGlite('./.db')
  const db = drizzle(client)

  // Applies all SQL files from the migrations folder to our local PGLite database
  await migrate(db, { migrationsFolder: './migrations' })

  console.log('✅ Local migration complete!')
  process.exit(0)
}

runLocalMigration().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
