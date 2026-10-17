import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'

// ==========================================
// AUTH MOCK
// ==========================================
// Token verification has its own suite (auth.test.ts). Here the caller is
// already authenticated so the route logic can be tested on its own.

const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    c.set('authUser', authUser)
    await next()
  },
  requireStudentRole: () => async (c: Context, next: Next) => {
    c.set('user', {
      id: authUser.id,
      fullName: authUser.name,
      email: authUser.email,
      role: 'student',
    })
    await next()
  },
}))

// ==========================================
// CONTROLLER MOCK
// ==========================================

vi.mock('../controllers/users.controller.ts', () => ({
  getUserById: vi.fn(),
  syncAuthUser: vi.fn(),
  setUserRole: vi.fn(),
}))

import { app } from '../app.js'
import { setUserRole, syncAuthUser } from '../controllers/users.controller.js'

// ==========================================
// FIXTURES
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeUser(overrides: Record<string, unknown> = {}): any {
  return {
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.name,
    roles: ['student'],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  }
}

// ==========================================
// HELPERS
// ==========================================

function patchRole(body: unknown) {
  return app.request('/api/users/me/role', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ==========================================
// GET /api/users/me
// ==========================================

describe('GET /api/users/me', () => {
  beforeEach(() => {
    vi.mocked(syncAuthUser).mockResolvedValue({ ok: true, user: makeUser() })
  })

  it('returns the synced user', async () => {
    const res = await app.request('/api/users/me')
    expect(res.status).toBe(200)

    const body = (await res.json()) as { user: { id: string; roles: string[] } }
    expect(body.user.id).toBe(authUser.id)
    expect(body.user.roles).toEqual(['student'])
  })

  it('passes the token identity to the controller', async () => {
    await app.request('/api/users/me')

    expect(syncAuthUser).toHaveBeenCalledWith(expect.anything(), authUser)
  })

  it('returns 409 when the email belongs to another user', async () => {
    vi.mocked(syncAuthUser).mockResolvedValue({ ok: false, reason: 'email_conflict' })

    const res = await app.request('/api/users/me')
    expect(res.status).toBe(409)

    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/already exists/i)
  })
})

// ==========================================
// PATCH /api/users/me/role
// ==========================================

describe('PATCH /api/users/me/role', () => {
  beforeEach(() => {
    vi.mocked(syncAuthUser).mockResolvedValue({ ok: true, user: makeUser() })
    vi.mocked(setUserRole).mockResolvedValue(makeUser())
  })

  it('saves the student role', async () => {
    const res = await patchRole({ role: 'student' })
    expect(res.status).toBe(200)

    expect(setUserRole).toHaveBeenCalledWith(expect.anything(), authUser.id, 'student')
  })

  it('saves the recruiter role', async () => {
    vi.mocked(setUserRole).mockResolvedValue(makeUser({ roles: ['recruiter'] }))

    const res = await patchRole({ role: 'recruiter' })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { user: { roles: string[] } }
    expect(body.user.roles).toEqual(['recruiter'])
    expect(setUserRole).toHaveBeenCalledWith(expect.anything(), authUser.id, 'recruiter')
  })

  it('creates the row before updating it', async () => {
    await patchRole({ role: 'student' })

    expect(syncAuthUser).toHaveBeenCalledWith(expect.anything(), authUser)
  })

  it('rejects core_admin so users cannot self-promote', async () => {
    const res = await patchRole({ role: 'core_admin' })

    expect(res.status).toBe(400)
    expect(setUserRole).not.toHaveBeenCalled()
  })

  it('rejects club_admin so users cannot self-promote', async () => {
    const res = await patchRole({ role: 'club_admin' })

    expect(res.status).toBe(400)
    expect(setUserRole).not.toHaveBeenCalled()
  })

  it('rejects a missing role', async () => {
    const res = await patchRole({})

    expect(res.status).toBe(400)
    expect(setUserRole).not.toHaveBeenCalled()
  })

  it('returns 409 without touching the role when the email conflicts', async () => {
    vi.mocked(syncAuthUser).mockResolvedValue({ ok: false, reason: 'email_conflict' })

    const res = await patchRole({ role: 'student' })

    expect(res.status).toBe(409)
    expect(setUserRole).not.toHaveBeenCalled()
  })

  it('returns 404 when the row disappeared between the sync and the update', async () => {
    vi.mocked(setUserRole).mockResolvedValue(null)

    const res = await patchRole({ role: 'student' })

    expect(res.status).toBe(404)
  })
})
