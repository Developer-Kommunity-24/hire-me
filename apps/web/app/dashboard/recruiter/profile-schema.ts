import { z } from 'zod'

export const recruiterProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  companyMail: z.string().trim().email('Enter a valid company email'),
  companyUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Enter a valid website URL'),
  headquartersLocation: z.string().trim().min(2, 'Enter the headquarters location'),
})

export type RecruiterProfileFormValues = z.infer<typeof recruiterProfileSchema>
