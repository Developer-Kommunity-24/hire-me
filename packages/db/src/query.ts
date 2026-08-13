import 'dotenv/config'
import { eq } from 'drizzle-orm'
import * as schema from './schema/index'
import { getDb } from './db-client'

async function testQueries() {
  const db = await getDb()
  console.log('🚀 Running Drizzle queries...\n')

  // Query 1: Fetch all users
  const allUsers = await db.select().from(schema.users)
  console.log('--- 👤 All Users ---')
  console.log(allUsers.slice(0, 3), '...\n') // Just printing first 3 to save space

  // Query 2: Standard Join (Get students who are 'verified')
  const verifiedStudents = await db
    .select({
      name: schema.users.fullName,
      email: schema.users.email,
      headline: schema.studentProfiles.headline,
      verifiedStatus: schema.studentProfiles.dk24Status,
    })
    .from(schema.users)
    .innerJoin(schema.studentProfiles, eq(schema.users.id, schema.studentProfiles.userId))
    .where(eq(schema.studentProfiles.dk24Status, 'verified'))

  console.log('--- ✅ Verified Students (Join) ---')
  console.log(verifiedStudents, '\n')

  // Query 3: Active Job Postings
  const activePostings = await db
    .select({
      title: schema.postings.title,
      type: schema.postings.employmentType,
      company: schema.recruiters.companyName,
    })
    .from(schema.postings)
    .innerJoin(schema.recruiters, eq(schema.postings.recruiterId, schema.recruiters.userId))
    .where(eq(schema.postings.status, 'active'))

  console.log('--- 💼 Active Job Postings ---')
  console.log(activePostings)
}

testQueries().catch((err) => {
  console.error('Query failed:', err)
})
