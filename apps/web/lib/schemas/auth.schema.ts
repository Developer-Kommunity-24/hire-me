import { z } from 'zod'

export const selfAssignableRoleSchema = z.enum(['student', 'recruiter'])
export type SelfAssignableRole = z.infer<typeof selfAssignableRoleSchema>

export const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

export type LoginInput = z.infer<typeof loginSchema>
