import { z } from 'zod'

/** Body for `POST /api/applications` — the posting the student is applying to. */
export const createApplicationSchema = z.object({
  postingId: z.string().uuid(),
})

/**
 * Body for `PATCH /api/applications/:id/status`.
 *
 * `applied` is deliberately absent: it is the initial state, never a target.
 * The route still relies on the controller's transition map for ordering, so an
 * out-of-order move (e.g. `under_review` → `applied`) is caught there.
 */
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['under_review', 'shortlisted', 'accepted', 'rejected']),
})
