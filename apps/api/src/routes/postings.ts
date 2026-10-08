import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { DbVariables } from '../middleware/db.js'
import type { AuthVariables } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRecruiter } from '../middleware/requireRecruiter.js'
import { requireRecruiterOrAdmin } from '../middleware/requireRecruiterOrAdmin.js'
import {
  listActivePostings,
  getPostingById,
  createPosting,
  listOwnPostings,
  updatePosting,
  closePosting,
} from '../controllers/postings.controller.js'
import { buildPaginationMeta, PAGINATION_DEFAULTS } from '../utils/pagination.js'
import { createPostingSchema, updatePostingSchema } from './postings.schemas.js'

const listPostingsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10) || 1)),
  limit: z
    .string()
    .optional()
    .transform((v) =>
      Math.min(PAGINATION_DEFAULTS.maxLimit, Math.max(1, parseInt(v ?? '20', 10) || 20)),
    ),

  q: z.string().optional(),

  stack: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined
      return Array.isArray(v) ? v : [v]
    }),

  employmentType: z.enum(['internship', 'full_time', 'part_time', 'contract']).optional(),
  workArrangement: z.enum(['in_person', 'remote', 'hybrid']).optional(),

  location: z.string().optional(),

  deadlineBefore: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
    .optional(),
  deadlineAfter: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
    .optional(),

  sortBy: z.enum(['createdAt', 'deadline', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const postingsRouter = new Hono<{
  Bindings: { DATABASE_URL: string }
  Variables: DbVariables & AuthVariables & { recruiterId: string }
}>()

postingsRouter.get('/', zValidator('query', listPostingsSchema), async (c) => {
  const query = c.req.valid('query')
  const db = c.var.db

  const pagination = { page: query.page, limit: query.limit }
  const filters = {
    q: query.q,
    stack: query.stack,
    employmentType: query.employmentType,
    workArrangement: query.workArrangement,
    location: query.location,
    deadlineBefore: query.deadlineBefore,
    deadlineAfter: query.deadlineAfter,
    sortBy: query.sortBy,
    order: query.order,
  }

  const { rows, total } = await listActivePostings(db, filters, pagination)
  const meta = buildPaginationMeta(total, pagination)

  return c.json({ data: rows, meta })
})

/** Admins must provide the recruiter they are creating for. */
postingsRouter.post(
  '/',
  requireAuth,
  zValidator('json', createPostingSchema),
  requireRecruiterOrAdmin,
  async (c) => {
    const { onBehalfOfRecruiterId: _onBehalfOfRecruiterId, ...input } = c.req.valid('json')
    const posting = await createPosting(c.var.db, c.var.recruiterId, input)
    return c.json({ data: posting }, 201)
  },
)

/** Registered before '/:id' so "mine" is not treated as a posting ID. */
postingsRouter.get('/mine', requireAuth, requireRecruiter, async (c) => {
  const rows = await listOwnPostings(c.var.db, c.var.recruiterId)
  return c.json({ data: rows })
})

postingsRouter.patch(
  '/:id',
  requireAuth,
  requireRecruiter,
  zValidator('json', updatePostingSchema),
  async (c) => {
    const updated = await updatePosting(
      c.var.db,
      c.req.param('id'),
      c.var.recruiterId,
      c.req.valid('json'),
    )
    if (!updated) {
      return c.json({ error: 'Posting not found' }, 404)
    }
    return c.json({ data: updated })
  },
)

postingsRouter.post('/:id/close', requireAuth, requireRecruiter, async (c) => {
  const closed = await closePosting(c.var.db, c.req.param('id'), c.var.recruiterId)
  if (!closed) {
    return c.json({ error: 'Posting not found' }, 404)
  }
  return c.json({ data: closed })
})

/** Registered last so parameterized routes don't swallow specific paths. */
postingsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.var.db

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return c.json({ error: 'Posting not found' }, 404)
  }

  const posting = await getPostingById(db, id)
  if (!posting) {
    return c.json({ error: 'Posting not found' }, 404)
  }

  return c.json({ data: posting })
})
