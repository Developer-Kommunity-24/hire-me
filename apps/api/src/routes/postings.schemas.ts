import { z } from 'zod'
import { todayIST } from '../utils/date.js'

/** Shared fields for create and update. */
const postingFieldsSchema = z.object({
  title: z.string().min(1, 'title is required').max(200),

  description: z.string().min(1, 'description is required'),

  stack: z.array(z.string()).min(1, 'at least one stack item is required'),

  employmentType: z.enum(['internship', 'full_time', 'part_time', 'contract']),

  workArrangement: z.enum(['in_person', 'remote', 'hybrid']),

  seniorityLevel: z.string().optional(),

  compensation: z.string().optional(),

  location: z.string().optional(),

  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
    .optional(),

  onBehalfOfRecruiterId: z.string().uuid().optional(),
})

/** Rejects deadlines before today in IST. */
function validateDeadlineNotPast(data: { deadline?: string }, ctx: z.RefinementCtx) {
  if (data.deadline && data.deadline < todayIST()) {
    ctx.addIssue({
      code: 'custom',
      path: ['deadline'],
      message: 'deadline cannot be before today',
    })
  }
}

export const createPostingSchema = postingFieldsSchema.superRefine(validateDeadlineNotPast)

/** PATCH fields are optional; at least one field is required. */
export const updatePostingSchema = postingFieldsSchema
  .omit({ onBehalfOfRecruiterId: true })
  .partial()
  .superRefine((data, ctx) => {
    validateDeadlineNotPast(data, ctx)

    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be provided',
      })
    }
  })
