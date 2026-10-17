import { createDb } from '@repo/db'
import { app } from './app.js'
import { expirePastDeadlinePostings } from './controllers/postings.controller.js'

type Bindings = { DATABASE_URL: string }

export default {
  fetch: app.fetch,

  /** Expires active postings whose deadlines have passed. */
  async scheduled(_controller: ScheduledController, env: Bindings): Promise<void> {
    const db = createDb(env.DATABASE_URL)
    const count = await expirePastDeadlinePostings(db)
    console.log(`[scheduled] expired ${count} posting(s) past deadline`)
  },
}
