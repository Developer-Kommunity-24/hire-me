import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid website URL (e.g. https://company.com)',
  })

export const recruiterOnboardingSchema = z.object({
  companyName: z.string().min(2, 'Please enter your company name'),
  companyMail: z
    .string()
    .min(1, 'Please enter your company work email')
    .email('Please enter a valid work email address'),
  companyUrl: optionalUrl,
  headquartersLocation: z.string().optional(),
})

export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardingSchema>
