import { z } from 'zod'

/**
 * Parses various date string formats (e.g. "JUN 2023", "2023-06", "06/2023", "2023", "Present").
 */
export function parseDateString(dateStr?: string): Date | null {
  if (!dateStr) return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null
  if (/^(present|current|now)$/i.test(trimmed)) {
    // Treat 'Present' as future/ongoing
    return new Date(9999, 11, 31)
  }

  // Handle format like "JUN 2023" or "June 2023" or "Jan, 2023"
  const monthYearMatch = trimmed.match(/^([a-zA-Z]+)[,\s/-]+(\d{4})$/)
  if (monthYearMatch) {
    const d = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`)
    if (!isNaN(d.getTime())) return d
  }

  // Handle numeric format like "06/2023" or "6-2023"
  const numMonthYear = trimmed.match(/^(\d{1,2})[\s/-]+(\d{4})$/)
  if (numMonthYear) {
    const month = parseInt(numMonthYear[1]!, 10) - 1
    const year = parseInt(numMonthYear[2]!, 10)
    return new Date(year, month, 1)
  }

  // Handle Year only like "2023"
  const yearOnly = trimmed.match(/^(\d{4})$/)
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1]!, 10), 0, 1)
  }

  const direct = Date.parse(trimmed)
  if (!isNaN(direct)) {
    return new Date(direct)
  }

  return null
}

/**
 * Validates that start date comes before or on end date.
 */
export function isDateOrderValid(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true
  const start = parseDateString(startDate)
  const end = parseDateString(endDate)
  if (!start || !end) return true
  return start.getTime() <= end.getTime()
}

/**
 * Parses GPA in forms like "3.9 / 4.0", "3.9/4.0", "3.9", "9.2 / 10.0".
 */
export function parseGpa(val: string): { score: number; scale?: number } | null {
  const trimmed = val.trim()
  if (!trimmed) return null

  const scaleMatch = trimmed.match(/^(\d+(\.\d+)?)\s*\/\s*(\d+(\.\d+)?)$/)
  if (scaleMatch) {
    const score = parseFloat(scaleMatch[1]!)
    const scale = parseFloat(scaleMatch[3]!)
    if (isNaN(score) || isNaN(scale) || scale <= 0) return null
    return { score, scale }
  }

  const singleMatch = trimmed.match(/^(\d+(\.\d+)?)$/)
  if (singleMatch) {
    const score = parseFloat(singleMatch[1]!)
    if (isNaN(score)) return null
    return { score }
  }

  return null
}

/**
 * GitHub URL schema: allows empty string or valid GitHub URL / handle with github.com
 */
export const githubUrlSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true
    return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+(\/.*)?$/i.test(val.trim())
  },
  {
    message: 'Invalid GitHub URL format (e.g. github.com/username or https://github.com/username)',
  },
)

/**
 * GPA schema: validates non-empty string and valid numerical range.
 */
export const gpaSchema = z
  .string()
  .min(1, 'GPA is required')
  .refine(
    (val) => {
      const parsed = parseGpa(val)
      if (!parsed) return false
      if (parsed.scale !== undefined) {
        return parsed.score >= 0 && parsed.score <= parsed.scale
      }
      return parsed.score >= 0 && parsed.score <= 10.0
    },
    {
      message: 'Invalid GPA (must be between 0.0 and 4.0 or score / scale, e.g. 3.9 / 4.0)',
    },
  )

/**
 * Experience item schema with date ordering validation.
 */
export const experienceItemSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, 'Position / role is required'),
    company: z.string().min(1, 'Company is required'),
    location: z.string(),
    duration: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    achievements: z.array(z.string()),
  })
  .refine((data) => isDateOrderValid(data.startDate, data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

/**
 * Project item schema with date ordering validation.
 */
export const projectItemSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, 'Project title is required'),
    description: z.string().min(1, 'Project description is required'),
    tags: z.array(z.string()),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine((data) => isDateOrderValid(data.startDate, data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

/**
 * Skill category schema.
 */
export const skillCategorySchema = z.object({
  label: z.string(),
  skills: z.array(z.string()),
  iconD: z.string().optional(),
})

/**
 * Profile info schema with required fields and format validation.
 */
export const profileDataSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  degree: z.string().min(1, 'Headline / degree is required'),
  university: z.string().optional(),
  graduationYear: z.string().optional(),
  location: z.string(),
  github: githubUrlSchema,
  email: z.string().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email address',
  }),
  resumeLink: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Invalid URL format' },
    ),
  photoUrl: z.string(),
  isVerified: z.boolean(),
})

/**
 * Academics schema.
 */
export const academicDataSchema = z.object({
  gpa: gpaSchema,
  major: z.string().min(1, 'Major is required'),
  minor: z.string(),
  honors: z.string(),
  expectedGraduation: z.string().min(1, 'Expected graduation date is required'),
})

/**
 * Complete reusable profile form schema.
 */
export const profileFormSchema = z.object({
  profile: profileDataSchema,
  experiences: z.array(experienceItemSchema),
  projects: z.array(projectItemSchema),
  skills: z.array(skillCategorySchema),
  academics: academicDataSchema,
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
