import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import {
  flagBadgeRevocation,
  getStudentVerificationStatus,
  listPendingRevocations,
  listVerificationRequests,
  resolveBadgeRevocation,
  verifyStudentSubmission,
} from '../controllers/verification.controller.js'

// ==========================================
// TYPES
// ==========================================

type VerificationEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const verificationSubmissionSchema = z.object({
  usn: z.string().trim().min(1, 'USN is required').max(20, 'USN must be at most 20 characters'),
  clubId: z.string().uuid('Invalid club ID').optional().nullable(),
})

const flagRevocationSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  clubMembershipId: z.string().uuid('Invalid club membership ID'),
  resolution: z.string().trim().optional(),
})

const resolveRevocationSchema = z.object({
  resolution: z.string().trim().min(1, 'Resolution description is required'),
  restoreStatus: z.enum(['none', 'pending', 'verified']).optional(),
})

const uuidSchema = z.string().uuid()

const paginationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().max(100).optional()),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().nonnegative().optional()),
})

// ==========================================
// ROUTER
// ==========================================

export const verificationRouter = new Hono<VerificationEnv>()

// All verification endpoints require an authenticated bearer token.
verificationRouter.use('*', requireAuth)

/**
 * POST /api/verifications
 * POST /api/verifications/verify
 *
 * Submits or resubmits student verification. Matches the supplied USN (and
 * optional clubId) against active club memberships.
 *
 * - Auto-matches and marks 'verified' on success.
 * - Marks 'pending' on no match.
 * - Increments resubmitCount if this student has submitted previously.
 * - Blocks verification if student has an active/unresolved badge revocation.
 */
verificationRouter.post('/', zValidator('json', verificationSubmissionSchema), async (c) => {
  const input = c.req.valid('json')
  const { id: studentId, email: studentEmail } = c.var.authUser

  const result = await verifyStudentSubmission(c.var.db, studentId, studentEmail, input)

  if (!result.ok) {
    if (result.error === 'badge_revoked') {
      return c.json({ error: result.message }, 403)
    }
    return c.json({ error: result.message }, 400)
  }

  const statusCode = result.data.isResubmission ? 200 : 201
  return c.json({ data: result.data }, statusCode)
})

verificationRouter.post('/verify', zValidator('json', verificationSubmissionSchema), async (c) => {
  const input = c.req.valid('json')
  const { id: studentId, email: studentEmail } = c.var.authUser

  const result = await verifyStudentSubmission(c.var.db, studentId, studentEmail, input)

  if (!result.ok) {
    if (result.error === 'badge_revoked') {
      return c.json({ error: result.message }, 403)
    }
    return c.json({ error: result.message }, 400)
  }

  const statusCode = result.data.isResubmission ? 200 : 201
  return c.json({ data: result.data }, statusCode)
})

/**
 * GET /api/verifications/me
 * GET /api/verifications/status
 *
 * Returns the current student's verification status, latest verification
 * request, matched membership, and active revocation (if any).
 */
verificationRouter.get('/me', async (c) => {
  const status = await getStudentVerificationStatus(c.var.db, c.var.authUser.id)
  return c.json({ data: status })
})

verificationRouter.get('/status', async (c) => {
  const status = await getStudentVerificationStatus(c.var.db, c.var.authUser.id)
  return c.json({ data: status })
})

/**
 * GET /api/verifications
 *
 * Defaults to returning current student's status.
 */
verificationRouter.get('/', async (c) => {
  const status = await getStudentVerificationStatus(c.var.db, c.var.authUser.id)
  return c.json({ data: status })
})

/**
 * GET /api/verifications/requests
 *
 * Lists verification requests with optional limit and offset pagination.
 */
verificationRouter.get('/requests', zValidator('query', paginationQuerySchema), async (c) => {
  const { limit, offset } = c.req.valid('query')
  const requests = await listVerificationRequests(c.var.db, { limit, offset })
  return c.json({ data: requests })
})

/**
 * POST /api/verifications/revocations
 *
 * Flags a badge revocation for a student and club membership.
 * Automatically marks the student's dk24Status as 'revoked'.
 */
verificationRouter.post('/revocations', zValidator('json', flagRevocationSchema), async (c) => {
  const input = c.req.valid('json')

  const revocation = await flagBadgeRevocation(c.var.db, {
    studentId: input.studentId,
    clubMembershipId: input.clubMembershipId,
    resolution: input.resolution,
    resolvedBy: c.var.authUser.id,
  })

  return c.json({ data: revocation }, 201)
})

/**
 * GET /api/verifications/revocations/pending
 *
 * Lists all pending (unresolved) badge revocations for administrative review.
 */
verificationRouter.get('/revocations/pending', async (c) => {
  const revocations = await listPendingRevocations(c.var.db)
  return c.json({ data: revocations })
})

/**
 * PATCH /api/verifications/revocations/:id/resolve
 *
 * Resolves an active badge revocation record, recording the resolver and note.
 * Optionally restores the student's verification status.
 */
verificationRouter.patch(
  '/revocations/:id/resolve',
  zValidator('json', resolveRevocationSchema),
  async (c) => {
    const rawId = c.req.param('id')

    if (!uuidSchema.safeParse(rawId).success) {
      return c.json({ error: 'Revocation record not found' }, 404)
    }

    const input = c.req.valid('json')
    const result = await resolveBadgeRevocation(c.var.db, rawId, {
      resolvedBy: c.var.authUser.id,
      resolution: input.resolution,
      restoreStatus: input.restoreStatus,
    })

    if (!result.ok) {
      return c.json({ error: 'Revocation record not found' }, 404)
    }

    return c.json({ data: result.data })
  },
)
