import { z } from 'zod'

export const studentStep1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  headline: z.string().optional(),
  bio: z.string().optional(),
})

export const studentStep2Schema = z.object({
  school: z.string().min(2, 'School/University name is required'),
  degree: z.string().min(2, 'Degree is required'),
  graduationYear: z.string().min(4, 'Graduation year is required'),
  gpa: z.string().optional(),
  specialization: z.string().optional(),
})

export const studentStep3Schema = z.object({
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  experienceRole: z.string().optional(),
  experienceCompany: z.string().optional(),
  experienceSummary: z.string().optional(),
})

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL (e.g. https://github.com/username)',
  })

export const studentStep4Schema = z.object({
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  resumeUrl: optionalUrl,
})

export const studentCompleteOnboardingSchema = studentStep1Schema
  .merge(studentStep2Schema)
  .merge(studentStep3Schema)
  .merge(studentStep4Schema)

export type StudentStep1Input = z.infer<typeof studentStep1Schema>
export type StudentStep2Input = z.infer<typeof studentStep2Schema>
export type StudentStep3Input = z.infer<typeof studentStep3Schema>
export type StudentStep4Input = z.infer<typeof studentStep4Schema>
export type StudentOnboardingInput = z.infer<typeof studentCompleteOnboardingSchema>
