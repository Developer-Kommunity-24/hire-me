import { z } from 'zod'

/** Body for `POST /api/applications`: the posting the student is applying to. */
export const createApplicationSchema = z.object({
  postingId: z.string().uuid(),
})

/**
 * Body for `PATCH /api/applications/:id/status`. `applied` is not a valid
 * target; ordering is enforced by the controller's transition map.
 */
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['under_review', 'shortlisted', 'accepted', 'rejected']),
})
