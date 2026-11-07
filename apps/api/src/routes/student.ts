import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createDb } from '@repo/db'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import { requireStudentRole } from '../middleware/student.js'
import type { StudentVariables } from '../middleware/student.js'
import type { DbVariables } from '../middleware/db.js'
import {
  getStudentProfile,
  updateStudentProfile,
  type UpdateProfilePayload,
} from '../controllers/student.controller.js'

type StudentEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables & StudentVariables
}

export const studentRouter = new Hono<StudentEnv>()

studentRouter.use('*', requireAuth, requireStudentRole())

// Reasonable upper bounds for free-text / array fields.
const MAX_SHORT_TEXT = 200 // headline, school, degree, specialization, urls
const MAX_LONG_TEXT = 2000 // bio, experienceSummary
const MAX_SKILL_LENGTH = 100
const MAX_SKILLS_COUNT = 50

// GPA: accepted as number, numeric string, or null/undefined, and coerced to number | null.
const gpaSchema = z
  .union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((val, ctx) => {
    if (val === undefined) return undefined
    if (val === null) return null
    const str = String(val).trim()
    if (str === '') return null
    const num = Number(str)
    if (Number.isNaN(num) || !/^\d+(\.\d+)?$/.test(str)) {
      ctx.addIssue({
        code: 'custom',
        message: 'GPA must be a numerical value.',
      })
      return z.NEVER
    }
    if (num < 0 || num > 10) {
      ctx.addIssue({
        code: 'custom',
        message: 'GPA must be between 0 and 10.',
      })
      return z.NEVER
    }
    return num
  })

export const updateStudentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'fullName must be a non-empty string.')
    .max(MAX_SHORT_TEXT, `fullName must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .optional(),
  bio: z
    .string()
    .max(MAX_LONG_TEXT, `bio must be ${MAX_LONG_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  headline: z
    .string()
    .max(MAX_SHORT_TEXT, `headline must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  gradYear: z
    .number()
    .int('gradYear must be a valid year number.')
    .min(1900, 'gradYear must be a valid year number.')
    .max(2100, 'gradYear must be a valid year number.')
    .nullable()
    .optional(),
  openToWork: z.boolean().optional(),
  resumeUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  otherLinks: z.record(z.string(), z.unknown()).nullable().optional(),
  phone: z.string().nullable().optional(),
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'skills must be an array of non-empty strings.')
        .max(MAX_SKILL_LENGTH, `each skill must be ${MAX_SKILL_LENGTH} characters or fewer.`),
    )
    .max(MAX_SKILLS_COUNT, `skills cannot contain more than ${MAX_SKILLS_COUNT} entries.`)
    .optional(),
  experienceRole: z
    .string()
    .max(MAX_SHORT_TEXT, `experienceRole must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  experienceCompany: z
    .string()
    .max(MAX_SHORT_TEXT, `experienceCompany must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  experienceSummary: z
    .string()
    .max(MAX_LONG_TEXT, `experienceSummary must be ${MAX_LONG_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  school: z
    .string()
    .max(MAX_SHORT_TEXT, `school must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  degree: z
    .string()
    .max(MAX_SHORT_TEXT, `degree must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  gpa: gpaSchema,
  specialization: z
    .string()
    .max(MAX_SHORT_TEXT, `specialization must be ${MAX_SHORT_TEXT} characters or fewer.`)
    .nullable()
    .optional(),
  portfolioUrl: z.string().nullable().optional(),
})

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>

// Middleware to catch malformed JSON payloads gracefully
studentRouter.use('*', async (c, next) => {
  if (c.req.method === 'PUT' && c.req.path.endsWith('/profile')) {
    const contentType = c.req.header('Content-Type')
    if (contentType?.includes('application/json')) {
      try {
        await c.req.raw.clone().json()
      } catch {
        return c.json({ error: 'Bad Request', message: 'Invalid JSON payload.' }, 400)
      }
    }
  }
  await next()
})

// GET /api/student/profile
studentRouter.get('/profile', async (c) => {
  const authedUser = c.get('user')

  const db = c.var.db ?? (c.env?.DATABASE_URL ? createDb(c.env.DATABASE_URL) : undefined)
  if (!db) {
    console.error('[STUDENT_PROFILE] GET /profile failed: DB client not found')
    return c.json(
      { error: 'Internal Server Error', message: 'Unable to load profile right now.' },
      500,
    )
  }

  try {
    const profile = await getStudentProfile(db, authedUser.id)
    if (!profile) {
      return c.json({ error: 'Not Found', message: 'Student account not found.' }, 404)
    }
    return c.json(profile)
  } catch (err) {
    console.error('[STUDENT_PROFILE] GET /profile fetch failed:', err)
    return c.json(
      { error: 'Internal Server Error', message: 'Unable to load profile right now.' },
      500,
    )
  }
})

// PUT /api/student/profile
studentRouter.put(
  '/profile',
  zValidator('json', updateStudentProfileSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: result.error.issues[0]?.message ?? 'Validation failed',
          issues: result.error.issues,
        },
        400,
      )
    }
  }),
  async (c) => {
    const authedUser = c.get('user')
    const body: UpdateProfilePayload = c.req.valid('json')

    const db = c.var.db ?? (c.env?.DATABASE_URL ? createDb(c.env.DATABASE_URL) : undefined)
    if (!db) {
      console.error('[STUDENT_PROFILE] PUT /profile failed: DB client not found')
      return c.json(
        { error: 'Internal Server Error', message: 'Unable to update profile right now.' },
        500,
      )
    }

    try {
      const profile = await updateStudentProfile(db, authedUser.id, body)
      if (!profile) {
        return c.json(
          { error: 'Not Found', message: 'Student account not found after update.' },
          404,
        )
      }
      return c.json(profile)
    } catch (err) {
      console.error('[STUDENT_PROFILE] PUT /profile update failed:', err)
      return c.json(
        { error: 'Internal Server Error', message: 'Failed to update profile. Please try again.' },
        500,
      )
    }
  },
)
