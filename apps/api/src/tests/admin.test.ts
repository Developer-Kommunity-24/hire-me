import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = '******db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL

const { authUser, fakeDb, middlewareState } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
  },
  fakeDb: {},
  middlewareState: {
    coreAdmin: true,
  },
}))

vi.mock('../middleware/db.ts', () => ({
  dbMiddleware: async (c: Context, next: Next) => {
    c.set('db', fakeDb)
    await next()
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    c.set('authUser', authUser)
    await next()
  },
}))

vi.mock('../middleware/core-admin.ts', () => ({
  requireCoreAdmin: async (c: Context, next: Next) => {
    if (!middlewareState.coreAdmin) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  },
}))

vi.mock('../controllers/admin.controller.ts', () => ({
  appointClubAdmin: vi.fn(),
  appointCoreAdmin: vi.fn(),
  removeClubAdmin: vi.fn(),
  removeCoreAdmin: vi.fn(),
}))

import { app } from '../app.js'
import {
  appointClubAdmin,
  appointCoreAdmin,
  removeClubAdmin,
  removeCoreAdmin,
} from '../controllers/admin.controller.js'

const targetUserId = '22222222-2222-4222-8222-222222222222'

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: targetUserId,
    email: 'grace@example.com',
    fullName: 'Grace Hopper',
    roles: ['student'],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  }
}

function request(path: string, init: RequestInit = {}) {
  return app.request(
    path,
    {
      headers: { 'content-type': 'application/json' },
      ...init,
    },
    { DATABASE_URL },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  middlewareState.coreAdmin = true
})

describe('Core-admin role API', () => {
  it('requires the caller to be a core admin', async () => {
    middlewareState.coreAdmin = false

    const res = await request('/api/admin/core-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId }),
    })

    expect(res.status).toBe(403)
    expect(appointCoreAdmin).not.toHaveBeenCalled()
  })

  it('rejects an invalid user id when appointing a core admin', async () => {
    const res = await request('/api/admin/core-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: 'not-a-uuid' }),
    })

    expect(res.status).toBe(400)
    expect(appointCoreAdmin).not.toHaveBeenCalled()
  })

  it('appoints a core admin and returns the updated user', async () => {
    const user = makeUser({ roles: ['student', 'core_admin'] })
    vi.mocked(appointCoreAdmin).mockResolvedValue({ ok: true, user })

    const res = await request('/api/admin/core-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      user: { id: targetUserId, roles: ['student', 'core_admin'] },
    })
    expect(appointCoreAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId)
  })

  it('returns 404 when appointing a missing user', async () => {
    vi.mocked(appointCoreAdmin).mockResolvedValue({ ok: false, reason: 'not_found' })

    const res = await request('/api/admin/core-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId }),
    })

    expect(res.status).toBe(404)
  })

  it('removes core admin and returns the updated user', async () => {
    const user = makeUser({ roles: ['student', 'recruiter'] })
    vi.mocked(removeCoreAdmin).mockResolvedValue({ ok: true, user })

    const res = await request(`/api/admin/core-admins/${targetUserId}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      user: { id: targetUserId, roles: ['student', 'recruiter'] },
    })
    expect(removeCoreAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId)
  })

  it('returns 404 for an invalid user id when removing a core admin', async () => {
    const res = await request('/api/admin/core-admins/not-a-uuid', {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
    expect(removeCoreAdmin).not.toHaveBeenCalled()
  })

  it('returns 404 when removing the role from a missing user', async () => {
    vi.mocked(removeCoreAdmin).mockResolvedValue({ ok: false, reason: 'not_found' })

    const res = await request(`/api/admin/core-admins/${targetUserId}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
  })
})

describe('Club-admin role API', () => {
  const clubId = '33333333-3333-4333-8333-333333333333'

  it('requires the caller to be a core admin', async () => {
    middlewareState.coreAdmin = false

    const res = await request('/api/admin/club-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, clubId }),
    })

    expect(res.status).toBe(403)
    expect(appointClubAdmin).not.toHaveBeenCalled()
  })

  it('appoints a club admin and returns the assignment', async () => {
    const user = makeUser({ roles: ['student', 'club_admin'] })
    const clubAdmin = { userId: targetUserId, clubId }
    vi.mocked(appointClubAdmin).mockResolvedValue({ ok: true, user, clubAdmin })

    const res = await request('/api/admin/club-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, clubId }),
    })

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        user: { id: targetUserId, roles: ['student', 'club_admin'] },
        clubAdmin,
      },
    })
    expect(appointClubAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId, clubId)
  })

  it('returns 409 for a duplicate club-admin appointment', async () => {
    vi.mocked(appointClubAdmin).mockResolvedValue({ ok: false, reason: 'already_assigned' })

    const res = await request('/api/admin/club-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, clubId }),
    })

    expect(res.status).toBe(409)
  })

  it.each([
    ['user_not_found', 'User not found'],
    ['club_not_found', 'Club not found'],
  ] as const)('returns 404 when %s', async (reason, message) => {
    vi.mocked(appointClubAdmin).mockResolvedValue({ ok: false, reason })

    const res = await request('/api/admin/club-admins', {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, clubId }),
    })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({ error: message })
  })

  it('removes a club admin and returns the updated assignment', async () => {
    const user = makeUser({ roles: ['student', 'recruiter'] })
    const clubAdmin = { userId: targetUserId, clubId }
    vi.mocked(removeClubAdmin).mockResolvedValue({ ok: true, user, clubAdmin })

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        user: { id: targetUserId, roles: ['student', 'recruiter'] },
        clubAdmin,
      },
    })
    expect(removeClubAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId)
  })

  it('returns 404 when removing a non-existent club admin', async () => {
    vi.mocked(removeClubAdmin).mockResolvedValue({ ok: false, reason: 'not_found' })

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
  })
})
