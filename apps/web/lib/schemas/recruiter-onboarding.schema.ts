import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid website URL (e.g. https://company.com)',
  })

// Maintained for backward-compatibility with existing backend API shapes and hooks
export const recruiterOnboardingSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Please enter your company name')
    .max(100, 'Company name cannot exceed 100 characters'),
  companyMail: z
    .string()
    .trim()
    .min(1, 'Please enter your company work email')
    .max(255, 'Work email cannot exceed 255 characters')
    .email('Please enter a valid work email address'),
  companyUrl: optionalUrl,
  headquartersLocation: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional(),
})

export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardingSchema>

export const stepAboutYouSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Please enter your full name')
    .max(100, 'Full name cannot exceed 100 characters'),
  jobTitle: z
    .string()
    .trim()
    .min(1, 'Please enter your job title')
    .max(100, 'Job title cannot exceed 100 characters'),
})

export type StepAboutYouInput = z.infer<typeof stepAboutYouSchema>

export const stepCompanySchema = recruiterOnboardingSchema
export type StepCompanyInput = RecruiterOnboardingInput

export const stepBioReviewSchema = z.object({
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
})

export type StepBioReviewInput = z.infer<typeof stepBioReviewSchema>

export const recruiterWizardSchema = stepAboutYouSchema
  .merge(stepCompanySchema)
  .merge(stepBioReviewSchema)

export type RecruiterWizardInput = z.infer<typeof recruiterWizardSchema>

export type RecruiterStepNumber = 1 | 2 | 3

export const FIRST_STEP: RecruiterStepNumber = 1
export const SECOND_STEP: RecruiterStepNumber = 2
export const FINAL_STEP: RecruiterStepNumber = 3

export const STEP_1_FIELDS = ['fullName', 'jobTitle'] as const
export const STEP_2_FIELDS = [
  'companyName',
  'companyMail',
  'companyUrl',
  'headquartersLocation',
] as const
export const STEP_3_FIELDS = ['bio'] as const

export const DEFAULT_RECRUITER_WIZARD_VALUES: RecruiterWizardInput = {
  fullName: '',
  jobTitle: '',
  companyName: '',
  companyMail: '',
  companyUrl: '',
  headquartersLocation: '',
  bio: '',
}
