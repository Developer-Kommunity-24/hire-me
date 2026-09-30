import { Hono } from 'hono'
import { createDb } from '@repo/db'
import { requireAuth, requireStudentRole } from '../middleware/auth.js'
import type { AuthVariables, AuthedUser } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import {
  getStudentProfile,
  updateStudentProfile,
  type UpdateProfilePayload,
} from '../controllers/student.controller.js'

type StudentEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables & { user: AuthedUser }
}

export const studentRouter = new Hono<StudentEnv>()

studentRouter.use('*', requireAuth, requireStudentRole())

// Reasonable upper bounds for free-text / array fields.
// Adjust to match DB column limits if those differ.
const MAX_SHORT_TEXT = 200 // headline, school, degree, specialization, urls
const MAX_LONG_TEXT = 2000 // bio, experienceSummary
const MAX_SKILL_LENGTH = 100
const MAX_SKILLS_COUNT = 50

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
studentRouter.put('/profile', async (c) => {
  const authedUser = c.get('user')

  let body: UpdateProfilePayload
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Bad Request', message: 'Invalid JSON payload.' }, 400)
  }

  // Validation
  if (
    body.fullName !== undefined &&
    (typeof body.fullName !== 'string' || body.fullName.trim() === '')
  ) {
    return c.json(
      { error: 'Validation Error', message: 'fullName must be a non-empty string.' },
      400,
    )
  }
  if (body.fullName !== undefined && body.fullName.length > MAX_SHORT_TEXT) {
    return c.json(
      {
        error: 'Validation Error',
        message: `fullName must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (body.bio !== undefined && body.bio !== null && typeof body.bio !== 'string') {
    return c.json({ error: 'Validation Error', message: 'bio must be a string or null.' }, 400)
  }
  if (body.bio !== undefined && body.bio !== null && body.bio.length > MAX_LONG_TEXT) {
    return c.json(
      { error: 'Validation Error', message: `bio must be ${MAX_LONG_TEXT} characters or fewer.` },
      400,
    )
  }
  if (body.headline !== undefined && body.headline !== null && typeof body.headline !== 'string') {
    return c.json({ error: 'Validation Error', message: 'headline must be a string or null.' }, 400)
  }
  if (
    body.headline !== undefined &&
    body.headline !== null &&
    body.headline.length > MAX_SHORT_TEXT
  ) {
    return c.json(
      {
        error: 'Validation Error',
        message: `headline must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (
    body.gradYear !== undefined &&
    body.gradYear !== null &&
    (typeof body.gradYear !== 'number' || body.gradYear < 1900 || body.gradYear > 2100)
  ) {
    return c.json(
      { error: 'Validation Error', message: 'gradYear must be a valid year number.' },
      400,
    )
  }
  if (body.openToWork !== undefined && typeof body.openToWork !== 'boolean') {
    return c.json({ error: 'Validation Error', message: 'openToWork must be a boolean.' }, 400)
  }
  if (
    body.resumeUrl !== undefined &&
    body.resumeUrl !== null &&
    typeof body.resumeUrl !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'resumeUrl must be a string or null.' },
      400,
    )
  }
  if (
    body.githubUrl !== undefined &&
    body.githubUrl !== null &&
    typeof body.githubUrl !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'githubUrl must be a string or null.' },
      400,
    )
  }
  if (
    body.linkedinUrl !== undefined &&
    body.linkedinUrl !== null &&
    typeof body.linkedinUrl !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'linkedinUrl must be a string or null.' },
      400,
    )
  }
  if (
    body.otherLinks !== undefined &&
    body.otherLinks !== null &&
    (typeof body.otherLinks !== 'object' || Array.isArray(body.otherLinks))
  ) {
    return c.json(
      { error: 'Validation Error', message: 'otherLinks must be an object or null.' },
      400,
    )
  }
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
    return c.json({ error: 'Validation Error', message: 'phone must be a string or null.' }, 400)
  }
  if (
    body.skills !== undefined &&
    (!Array.isArray(body.skills) ||
      body.skills.some((s) => typeof s !== 'string' || s.trim() === ''))
  ) {
    return c.json(
      { error: 'Validation Error', message: 'skills must be an array of non-empty strings.' },
      400,
    )
  }
  if (body.skills !== undefined && body.skills.length > MAX_SKILLS_COUNT) {
    return c.json(
      {
        error: 'Validation Error',
        message: `skills cannot contain more than ${MAX_SKILLS_COUNT} entries.`,
      },
      400,
    )
  }
  if (body.skills !== undefined && body.skills.some((s) => s.length > MAX_SKILL_LENGTH)) {
    return c.json(
      {
        error: 'Validation Error',
        message: `each skill must be ${MAX_SKILL_LENGTH} characters or fewer.`,
      },
      400,
    )
  }
  if (
    body.experienceRole !== undefined &&
    body.experienceRole !== null &&
    typeof body.experienceRole !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'experienceRole must be a string or null.' },
      400,
    )
  }
  if (
    body.experienceRole !== undefined &&
    body.experienceRole !== null &&
    body.experienceRole.length > MAX_SHORT_TEXT
  ) {
    return c.json(
      {
        error: 'Validation Error',
        message: `experienceRole must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (
    body.experienceCompany !== undefined &&
    body.experienceCompany !== null &&
    typeof body.experienceCompany !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'experienceCompany must be a string or null.' },
      400,
    )
  }
  if (
    body.experienceCompany !== undefined &&
    body.experienceCompany !== null &&
    body.experienceCompany.length > MAX_SHORT_TEXT
  ) {
    return c.json(
      {
        error: 'Validation Error',
        message: `experienceCompany must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (
    body.experienceSummary !== undefined &&
    body.experienceSummary !== null &&
    typeof body.experienceSummary !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'experienceSummary must be a string or null.' },
      400,
    )
  }
  if (
    body.experienceSummary !== undefined &&
    body.experienceSummary !== null &&
    body.experienceSummary.length > MAX_LONG_TEXT
  ) {
    return c.json(
      {
        error: 'Validation Error',
        message: `experienceSummary must be ${MAX_LONG_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (body.school !== undefined && body.school !== null && typeof body.school !== 'string') {
    return c.json({ error: 'Validation Error', message: 'school must be a string or null.' }, 400)
  }
  if (body.school !== undefined && body.school !== null && body.school.length > MAX_SHORT_TEXT) {
    return c.json(
      {
        error: 'Validation Error',
        message: `school must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (body.degree !== undefined && body.degree !== null && typeof body.degree !== 'string') {
    return c.json({ error: 'Validation Error', message: 'degree must be a string or null.' }, 400)
  }
  if (body.degree !== undefined && body.degree !== null && body.degree.length > MAX_SHORT_TEXT) {
    return c.json(
      {
        error: 'Validation Error',
        message: `degree must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }

  // GPA: accepted as number, numeric string, or null/undefined. Validated
  // here AND coerced to a plain number, since the controller only accepts
  // numbers — without this coercion a string like "8.5" would pass this
  // router's checks but then throw inside the controller as an unhandled
  // 500 instead of a clean 400.
  if (
    body.gpa !== undefined &&
    body.gpa !== null &&
    typeof body.gpa !== 'string' &&
    typeof body.gpa !== 'number'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'gpa must be a number, string, or null.' },
      400,
    )
  }
  if (body.gpa !== undefined && body.gpa !== null) {
    const gpaStr = String(body.gpa).trim()
    if (gpaStr === '') {
      body.gpa = null
    } else {
      const gpaNum = Number(gpaStr)
      if (isNaN(gpaNum) || !/^\d+(\.\d+)?$/.test(gpaStr)) {
        return c.json({ error: 'Validation Error', message: 'GPA must be a numerical value.' }, 400)
      }
      if (gpaNum < 0 || gpaNum > 10) {
        return c.json({ error: 'Validation Error', message: 'GPA must be between 0 and 10.' }, 400)
      }
      body.gpa = gpaNum
    }
  }

  if (
    body.specialization !== undefined &&
    body.specialization !== null &&
    typeof body.specialization !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'specialization must be a string or null.' },
      400,
    )
  }
  if (
    body.specialization !== undefined &&
    body.specialization !== null &&
    body.specialization.length > MAX_SHORT_TEXT
  ) {
    return c.json(
      {
        error: 'Validation Error',
        message: `specialization must be ${MAX_SHORT_TEXT} characters or fewer.`,
      },
      400,
    )
  }
  if (
    body.portfolioUrl !== undefined &&
    body.portfolioUrl !== null &&
    typeof body.portfolioUrl !== 'string'
  ) {
    return c.json(
      { error: 'Validation Error', message: 'portfolioUrl must be a string or null.' },
      400,
    )
  }

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
      return c.json({ error: 'Not Found', message: 'Student account not found after update.' }, 404)
    }
    return c.json(profile)
  } catch (err) {
    console.error('[STUDENT_PROFILE] PUT /profile update failed:', err)
    return c.json(
      { error: 'Internal Server Error', message: 'Failed to update profile. Please try again.' },
      500,
    )
  }
})
