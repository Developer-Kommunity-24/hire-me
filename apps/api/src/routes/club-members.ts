import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireClubAdmin } from '../middleware/club-admin.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import type { ClubAdminVariables } from '../middleware/club-admin.js'
import {
  listClubMembers,
  addClubMember,
  editClubMember,
  deleteClubMember,
} from '../controllers/club-members.controller.js'

// ==========================================
// TYPES
// ==========================================

type ClubMembersEnv = {
  Bindings: { DATABASE_URL: string; NEON_AUTH_BASE_URL: string }
  Variables: DbVariables & AuthVariables & ClubAdminVariables
}

// ==========================================
// VALIDATION
// ==========================================

const addMemberSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(255),
  usn: z
    .string()
    .trim()
    .min(1, 'USN is required')
    .max(20)
    .transform((value) => value.toUpperCase()),
  email: z.string().trim().toLowerCase().email('Must be a valid email address'),
})

const editMemberSchema = z
  .object({
    fullName: z.string().trim().min(1).max(255).optional(),
    usn: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .transform((value) => value.toUpperCase())
      .optional(),
    email: z.string().trim().toLowerCase().email('Must be a valid email address').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

const uuidSchema = z.string().uuid()

// ==========================================
// ROUTER
// ==========================================

export const clubMembersRouter = new Hono<ClubMembersEnv>()

// Every route requires a valid Neon Auth bearer token and a club_admins row.
clubMembersRouter.use('*', requireAuth)
clubMembersRouter.use('*', requireClubAdmin)

/**
 * GET /api/clubs/members
 *
 * Lists all members of the authenticated club admin's assigned club, ordered
 * by full name ascending.
 */
clubMembersRouter.get('/', async (c) => {
  const members = await listClubMembers(c.var.db, c.var.clubId)
  return c.json({ data: members })
})

/**
 * POST /api/clubs/members
 *
 * Adds a new member to the caller's club. Role always defaults to `'member'`.
 *
 * Body: { fullName, usn, email }
 *
 * Responds with 409 when the USN or email already exists within the club.
 */
clubMembersRouter.post('/', zValidator('json', addMemberSchema), async (c) => {
  const input = c.req.valid('json')
  const result = await addClubMember(c.var.db, c.var.clubId, input)

  if (!result.ok) {
    const message =
      result.error === 'duplicate_usn'
        ? 'A member with this USN already exists in your club'
        : 'A member with this email already exists in your club'

    return c.json({ error: message }, 409)
  }

  return c.json({ data: result.data }, 201)
})

/**
 * PATCH /api/clubs/members/:id
 *
 * Updates one or more fields on an existing membership within the caller's
 * club. Fields omitted from the body are left unchanged.
 *
 * Responds with 404 when the membership does not exist in this club, and 409
 * on a duplicate USN or email conflict.
 */
clubMembersRouter.patch('/:id', zValidator('json', editMemberSchema), async (c) => {
  const rawId = c.req.param('id')

  if (!uuidSchema.safeParse(rawId).success) {
    return c.json({ error: 'Member not found' }, 404)
  }

  const input = c.req.valid('json')
  const result = await editClubMember(c.var.db, c.var.clubId, rawId, input)

  if (!result.ok) {
    if (result.error === 'not_found') {
      return c.json({ error: 'Member not found' }, 404)
    }

    const message =
      result.error === 'duplicate_usn'
        ? 'A member with this USN already exists in your club'
        : 'A member with this email already exists in your club'

    return c.json({ error: message }, 409)
  }

  return c.json({ data: result.data })
})

/**
 * DELETE /api/clubs/members/:id
 *
 * Removes a membership from the caller's club.
 *
 * Responds with 404 when the membership does not exist in this club.
 */
clubMembersRouter.delete('/:id', async (c) => {
  const rawId = c.req.param('id')

  if (!uuidSchema.safeParse(rawId).success) {
    return c.json({ error: 'Member not found' }, 404)
  }

  const deleted = await deleteClubMember(c.var.db, c.var.clubId, rawId)

  if (!deleted) {
    return c.json({ error: 'Member not found' }, 404)
  }

  return c.json({ data: null }, 200)
})
