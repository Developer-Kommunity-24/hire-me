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
    authenticated: true,
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
    if (!middlewareState.authenticated) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
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
  assignClubAdmin: vi.fn(),
  createClub: vi.fn(),
  deactivateClub: vi.fn(),
  getAdminStats: vi.fn(),
  listClubs: vi.fn(),
  removeClubAdmin: vi.fn(),
  removeCoreAdmin: vi.fn(),
  updateClub: vi.fn(),
}))

import { app } from '../app.js'
import {
  appointClubAdmin,
  appointCoreAdmin,
  assignClubAdmin,
  createClub,
  deactivateClub,
  getAdminStats,
  listClubs,
  removeClubAdmin,
  removeCoreAdmin,
  updateClub,
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
  middlewareState.authenticated = true
  middlewareState.coreAdmin = true
})

describe('Admin statistics API', () => {
  it('returns platform-wide statistics', async () => {
    vi.mocked(getAdminStats).mockResolvedValue({
      students: 154,
      recruiters: 32,
      postings: 67,
      applications: 482,
      applicationsByStatus: {
        applied: 190,
        under_review: 120,
        shortlisted: 90,
        accepted: 50,
        rejected: 32,
      },
      applicationStatusCounts: {
        applied: 190,
        under_review: 120,
        shortlisted: 90,
        accepted: 50,
        rejected: 32,
      },
    })

    const res = await request('/api/admin/stats')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      data: {
        students: 154,
        recruiters: 32,
        postings: 67,
        applications: 482,
        applicationsByStatus: {
          applied: 190,
          under_review: 120,
          shortlisted: 90,
          accepted: 50,
          rejected: 32,
        },
        applicationStatusCounts: {
          applied: 190,
          under_review: 120,
          shortlisted: 90,
          accepted: 50,
          rejected: 32,
        },
      },
    })
    expect(getAdminStats).toHaveBeenCalledWith(expect.anything())
  })

  it('returns zero counts for an empty database', async () => {
    vi.mocked(getAdminStats).mockResolvedValue({
      students: 0,
      recruiters: 0,
      postings: 0,
      applications: 0,
      applicationsByStatus: {
        applied: 0,
        under_review: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
      },
      applicationStatusCounts: {
        applied: 0,
        under_review: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
      },
    })

    const res = await request('/api/admin/stats')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      data: {
        students: 0,
        recruiters: 0,
        postings: 0,
        applications: 0,
        applicationsByStatus: {
          applied: 0,
          under_review: 0,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
        },
        applicationStatusCounts: {
          applied: 0,
          under_review: 0,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
        },
      },
    })
  })

  it('returns counts for multiple records', async () => {
    vi.mocked(getAdminStats).mockResolvedValue({
      students: 3,
      recruiters: 2,
      postings: 4,
      applications: 7,
      applicationsByStatus: {
        applied: 2,
        under_review: 1,
        shortlisted: 2,
        accepted: 1,
        rejected: 1,
      },
      applicationStatusCounts: {
        applied: 2,
        under_review: 1,
        shortlisted: 2,
        accepted: 1,
        rejected: 1,
      },
    })

    const res = await request('/api/admin/stats')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      data: {
        students: 3,
        recruiters: 2,
        postings: 4,
        applications: 7,
        applicationsByStatus: {
          applied: 2,
          under_review: 1,
          shortlisted: 2,
          accepted: 1,
          rejected: 1,
        },
        applicationStatusCounts: {
          applied: 2,
          under_review: 1,
          shortlisted: 2,
          accepted: 1,
          rejected: 1,
        },
      },
    })
  })

  it('excludes soft-deleted recruiters and postings from the returned counts', async () => {
    vi.mocked(getAdminStats).mockResolvedValue({
      students: 1,
      recruiters: 1,
      postings: 2,
      applications: 3,
      applicationsByStatus: {
        applied: 1,
        under_review: 1,
        shortlisted: 0,
        accepted: 1,
        rejected: 0,
      },
      applicationStatusCounts: {
        applied: 1,
        under_review: 1,
        shortlisted: 0,
        accepted: 1,
        rejected: 0,
      },
    })

    const res = await request('/api/admin/stats')

    await expect(res.json()).resolves.toEqual({
      data: {
        students: 1,
        recruiters: 1,
        postings: 2,
        applications: 3,
        applicationsByStatus: {
          applied: 1,
          under_review: 1,
          shortlisted: 0,
          accepted: 1,
          rejected: 0,
        },
        applicationStatusCounts: {
          applied: 1,
          under_review: 1,
          shortlisted: 0,
          accepted: 1,
          rejected: 0,
        },
      },
    })
  })

  it('returns 401 when unauthenticated', async () => {
    middlewareState.authenticated = false

    const res = await request('/api/admin/stats')

    expect(res.status).toBe(401)
    expect(getAdminStats).not.toHaveBeenCalled()
  })

  it('returns 403 for a non-core-admin', async () => {
    middlewareState.coreAdmin = false

    const res = await request('/api/admin/stats')

    expect(res.status).toBe(403)
    expect(getAdminStats).not.toHaveBeenCalled()
  })
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

  it('assigns an existing club admin to a club', async () => {
    const user = makeUser({ roles: ['student', 'club_admin'] })
    const clubAdmin = { userId: targetUserId, clubId }
    vi.mocked(assignClubAdmin).mockResolvedValue({ ok: true, user, clubAdmin })

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ clubId }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        user: { id: targetUserId, roles: ['student', 'club_admin'] },
        clubAdmin,
      },
    })
    expect(assignClubAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId, clubId)
  })

  it('updates an existing club-admin assignment', async () => {
    const newClubId = '44444444-4444-4444-8444-444444444444'
    const user = makeUser({ roles: ['club_admin'] })
    const clubAdmin = { userId: targetUserId, clubId: newClubId }
    vi.mocked(assignClubAdmin).mockResolvedValue({ ok: true, user, clubAdmin })

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ clubId: newClubId }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ data: { clubAdmin } })
    expect(assignClubAdmin).toHaveBeenCalledWith(expect.anything(), targetUserId, newClubId)
  })

  it.each([
    ['user_not_found', 404, 'User not found'],
    ['club_not_found', 404, 'Club not found'],
    ['missing_role', 400, 'User is not a club admin'],
    ['inactive_club', 400, 'Club is inactive'],
  ] as const)('returns the expected status when %s', async (reason, status, message) => {
    vi.mocked(assignClubAdmin).mockResolvedValue({ ok: false, reason })

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ clubId }),
    })

    expect(res.status).toBe(status)
    await expect(res.json()).resolves.toEqual({ error: message })
  })

  it('rejects a non-core-admin assignment request', async () => {
    middlewareState.coreAdmin = false

    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ clubId }),
    })

    expect(res.status).toBe(403)
    expect(assignClubAdmin).not.toHaveBeenCalled()
  })

  it('rejects an invalid user UUID', async () => {
    const res = await request('/api/admin/club-admins/not-a-uuid', {
      method: 'PATCH',
      body: JSON.stringify({ clubId }),
    })

    expect(res.status).toBe(400)
    expect(assignClubAdmin).not.toHaveBeenCalled()
  })

  it('rejects an invalid club UUID', async () => {
    const res = await request(`/api/admin/club-admins/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ clubId: 'not-a-uuid' }),
    })

    expect(res.status).toBe(400)
    expect(assignClubAdmin).not.toHaveBeenCalled()
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

describe('Club management API', () => {
  const clubId = '33333333-3333-4333-8333-333333333333'
  const club = {
    id: clubId,
    name: 'Google Developer Student Club',
    slug: 'gdsc',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
  }

  it('requires the caller to be a core admin', async () => {
    middlewareState.coreAdmin = false

    const res = await request('/api/admin/clubs')

    expect(res.status).toBe(403)
    expect(listClubs).not.toHaveBeenCalled()
  })

  it('lists active and inactive clubs', async () => {
    vi.mocked(listClubs).mockResolvedValue({
      ok: true,
      clubs: [club, { ...club, id: '44444444-4444-4444-8444-444444444444', isActive: false }],
    })

    const res = await request('/api/admin/clubs')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ data: { length: 2 } })
  })

  it('creates a club', async () => {
    vi.mocked(createClub).mockResolvedValue({ ok: true, club })

    const res = await request('/api/admin/clubs', {
      method: 'POST',
      body: JSON.stringify({ name: ' Google Developer Student Club ', slug: 'GDSC' }),
    })

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({ data: { id: clubId, slug: 'gdsc' } })
    expect(createClub).toHaveBeenCalledWith(expect.anything(), {
      name: 'Google Developer Student Club',
      slug: 'gdsc',
    })
  })

  it.each([
    ['duplicate_name', 'Club name already exists'],
    ['duplicate_slug', 'Club slug already exists'],
  ] as const)('returns 409 for %s', async (reason, message) => {
    vi.mocked(createClub).mockResolvedValue({ ok: false, reason })

    const res = await request('/api/admin/clubs', {
      method: 'POST',
      body: JSON.stringify({ name: club.name, slug: club.slug }),
    })

    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toEqual({ error: message })
  })

  it('updates a club name', async () => {
    vi.mocked(updateClub).mockResolvedValue({
      ok: true,
      club: { ...club, name: 'Updated Club' },
    })

    const res = await request(`/api/admin/clubs/${clubId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: ' Updated Club ' }),
    })

    expect(res.status).toBe(200)
    expect(updateClub).toHaveBeenCalledWith(expect.anything(), clubId, { name: 'Updated Club' })
  })

  it('updates a club slug', async () => {
    vi.mocked(updateClub).mockResolvedValue({
      ok: true,
      club: { ...club, slug: 'updated-club' },
    })

    const res = await request(`/api/admin/clubs/${clubId}`, {
      method: 'PATCH',
      body: JSON.stringify({ slug: 'UPDATED-CLUB' }),
    })

    expect(res.status).toBe(200)
    expect(updateClub).toHaveBeenCalledWith(expect.anything(), clubId, { slug: 'updated-club' })
  })

  it('returns 404 when updating a missing club', async () => {
    vi.mocked(updateClub).mockResolvedValue({ ok: false, reason: 'not_found' })

    const res = await request(`/api/admin/clubs/${clubId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Missing Club' }),
    })

    expect(res.status).toBe(404)
  })

  it('deactivates a club', async () => {
    vi.mocked(deactivateClub).mockResolvedValue({
      ok: true,
      club: { ...club, isActive: false },
    })

    const res = await request(`/api/admin/clubs/${clubId}`, { method: 'DELETE' })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ data: { isActive: false } })
    expect(deactivateClub).toHaveBeenCalledWith(expect.anything(), clubId)
  })

  it('returns 409 when deactivating an already inactive club', async () => {
    vi.mocked(deactivateClub).mockResolvedValue({ ok: false, reason: 'already_inactive' })

    const res = await request(`/api/admin/clubs/${clubId}`, { method: 'DELETE' })

    expect(res.status).toBe(409)
  })

  it('returns 404 for an invalid club id', async () => {
    const res = await request('/api/admin/clubs/not-a-uuid', { method: 'PATCH', body: '{}' })

    expect(res.status).toBe(404)
    expect(updateClub).not.toHaveBeenCalled()
  })
})
