import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { DbVariables } from '../middleware/db.js'
import { listTalents } from '../controllers/talents.controller.js'
import { buildPaginationMeta, PAGINATION_DEFAULTS } from '../utils/pagination.js'

// ==========================================
// QUERY PARAM SCHEMAS
// ==========================================

const listTalentsSchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .refine((v) => v === undefined || /^[1-9]\d*$/.test(v), {
      message: 'page must be an integer greater than or equal to 1',
    })
    .transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) =>
      Math.min(PAGINATION_DEFAULTS.maxLimit, Math.max(1, parseInt(v ?? '20', 10) || 20)),
    ),

  // Free-text search
  q: z.string().trim().optional(),

  // Array filter: ?skills=React&skills=Node or comma-separated ?skills=React,Node
  skills: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined
      const raw = Array.isArray(v) ? v : v.split(',')
      const cleaned = raw.map((s) => s.trim()).filter(Boolean)
      return cleaned.length > 0 ? cleaned : undefined
    }),

  // Skill match mode: 'all' (default) vs 'any'
  skillMatchMode: z.enum(['all', 'any']).optional().default('all'),

  // Availability filter
  openToWork: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined
      return v === 'true'
    }),

  // DK24 verification status filter
  dk24Status: z.enum(['none', 'pending', 'verified', 'rejected', 'revoked']).optional(),

  // Graduation year filter
  gradYear: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) || undefined : undefined)),

  // Sorting
  sortBy: z.enum(['fullName', 'gradYear', 'updatedAt']).optional().default('updatedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ==========================================
// ROUTER
// ==========================================

export const talentsRouter = new Hono<{
  Bindings: { DATABASE_URL: string }
  Variables: DbVariables
}>()

/**
 * GET /api/talents
 * Returns a paginated list of student profiles matching filter criteria.
 *
 * Query params:
 *   page, limit         — pagination (default: 1, 20; max limit: 100)
 *   q                   — broad free-text search across profile info, skills, and projects
 *   skills              — structured skill filter (e.g. ?skills=React&skills=Node)
 *   skillMatchMode      — 'all' (default, AND) | 'any' (OR)
 *   openToWork          — 'true' | 'false'
 *   dk24Status          — 'none' | 'pending' | 'verified' | 'rejected' | 'revoked'
 *   gradYear            — graduation year (e.g. 2025)
 *   sortBy              — 'fullName' | 'gradYear' | 'updatedAt' (default: 'updatedAt')
 *   order               — 'asc' | 'desc' (default: 'desc')
 */
talentsRouter.get('/', zValidator('query', listTalentsSchema), async (c) => {
  const query = c.req.valid('query')
  const db = c.var.db

  const pagination = { page: query.page, limit: query.limit }
  const filters = {
    q: query.q,
    skills: query.skills,
    skillMatchMode: query.skillMatchMode,
    openToWork: query.openToWork,
    dk24Status: query.dk24Status,
    gradYear: query.gradYear,
    sortBy: query.sortBy,
    order: query.order,
  }

  const { rows, total } = await listTalents(db, filters, pagination)
  const meta = buildPaginationMeta(total, pagination)

  return c.json({ data: rows, meta })
})
