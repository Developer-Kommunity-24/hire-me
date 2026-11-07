import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'
process.env.WEB_ORIGIN = 'http://localhost:3000'

// ==========================================
// AUTH MOCK
// ==========================================

const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'recruiter@company.com',
    name: 'Jane Recruiter',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    c.set('authUser', authUser)
    await next()
  },
}))

// ==========================================
// CONTROLLER MOCKS
// ==========================================

vi.mock('../controllers/users.controller.ts', () => ({
  syncAuthUser: vi.fn(),
  setUserRole: vi.fn(),
}))

vi.mock('../controllers/recruiters.controller.ts', () => ({
  getRecruiterByUserId: vi.fn(),
  createRecruiterProfile: vi.fn(),
  updateRecruiterProfile: vi.fn(),
  deleteRecruiterProfile: vi.fn(),
  getPublicRecruiterById: vi.fn(),
}))

import { app } from '../app.js'
import { syncAuthUser } from '../controllers/users.controller.js'
import {
  createRecruiterProfile,
  deleteRecruiterProfile,
  getPublicRecruiterById,
  getRecruiterByUserId,
  updateRecruiterProfile,
} from '../controllers/recruiters.controller.js'

// ==========================================
// FIXTURES
// ==========================================

function makeRecruiter(overrides: Record<string, unknown> = {}) {
  return {
    userId: authUser.id,
    companyName: 'Acme Corp',
    companyMail: 'hr@acme.com',
    companyUrl: 'https://acme.com',
    headquartersLocation: 'San Francisco, CA',
    isDeleted: false,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  }
}

// ==========================================
// HELPERS
// ==========================================

function postProfile(body: unknown, path = '/api/recruiters/profile') {
  return app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function patchMe(body: unknown) {
  return app.request('/api/recruiters/me', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ==========================================
// POST /api/recruiters/profile (Onboarding)
// ==========================================

describe('POST /api/recruiters/profile', () => {
  beforeEach(() => {
    vi.mocked(syncAuthUser).mockResolvedValue({
      ok: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.name,
        roles: ['student'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    vi.mocked(createRecruiterProfile).mockResolvedValue({
      ok: true,
      data: makeRecruiter(),
    })
  })

  it('successfully creates recruiter profile', async () => {
    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'hr@acme.com',
      companyUrl: 'https://acme.com',
      headquartersLocation: 'San Francisco, CA',
    })

    expect(res.status).toBe(201)
    const body = (await res.json()) as { recruiter: { companyName: string } }
    expect(body.recruiter.companyName).toBe('Acme Corp')
    expect(createRecruiterProfile).toHaveBeenCalledWith(
      expect.anything(),
      authUser.id,
      expect.objectContaining({
        companyName: 'Acme Corp',
        companyMail: 'hr@acme.com',
      }),
    )
  })

  it('works via the POST /api/recruiters alias', async () => {
    const res = await postProfile(
      {
        companyName: 'Acme Corp',
        companyMail: 'hr@acme.com',
      },
      '/api/recruiters',
    )

    expect(res.status).toBe(201)
  })

  it('rejects companyName shorter than 2 characters with 400', async () => {
    const res = await postProfile({
      companyName: 'A',
      companyMail: 'hr@acme.com',
    })

    expect(res.status).toBe(400)
    expect(createRecruiterProfile).not.toHaveBeenCalled()
  })

  it('rejects invalid companyMail with 400', async () => {
    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'invalid-email',
    })

    expect(res.status).toBe(400)
    expect(createRecruiterProfile).not.toHaveBeenCalled()
  })

  it('rejects invalid companyUrl with 400', async () => {
    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'hr@acme.com',
      companyUrl: 'not-a-url',
    })

    expect(res.status).toBe(400)
    expect(createRecruiterProfile).not.toHaveBeenCalled()
  })

  it('allows empty string as companyUrl', async () => {
    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'hr@acme.com',
      companyUrl: '',
    })

    expect(res.status).toBe(201)
  })

  it('returns 409 when recruiter profile already exists', async () => {
    vi.mocked(createRecruiterProfile).mockResolvedValue({
      ok: false,
      error: 'profile_exists',
    })

    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'hr@acme.com',
    })

    expect(res.status).toBe(409)
    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/already exists/i)
  })

  it('returns 409 when auth user has email conflict', async () => {
    vi.mocked(syncAuthUser).mockResolvedValue({
      ok: false,
      reason: 'email_conflict',
    })

    const res = await postProfile({
      companyName: 'Acme Corp',
      companyMail: 'hr@acme.com',
    })

    expect(res.status).toBe(409)
    expect(createRecruiterProfile).not.toHaveBeenCalled()
  })
})

// ==========================================
// GET /api/recruiters/me
// ==========================================

describe('GET /api/recruiters/me', () => {
  it('returns recruiter profile when found', async () => {
    vi.mocked(getRecruiterByUserId).mockResolvedValue(makeRecruiter())

    const res = await app.request('/api/recruiters/me')
    expect(res.status).toBe(200)

    const body = (await res.json()) as { recruiter: { companyName: string } }
    expect(body.recruiter.companyName).toBe('Acme Corp')
    expect(getRecruiterByUserId).toHaveBeenCalledWith(expect.anything(), authUser.id)
  })

  it('returns 404 when recruiter profile not found', async () => {
    vi.mocked(getRecruiterByUserId).mockResolvedValue(null)

    const res = await app.request('/api/recruiters/me')
    expect(res.status).toBe(404)

    const body = (await res.json()) as { error: string }
    expect(body.error).toMatch(/not found/i)
  })
})

// ==========================================
// PATCH /api/recruiters/me
// ==========================================

describe('PATCH /api/recruiters/me', () => {
  it('updates recruiter profile fields', async () => {
    vi.mocked(updateRecruiterProfile).mockResolvedValue({
      ok: true,
      data: makeRecruiter({ companyName: 'Acme Global' }),
    })

    const res = await patchMe({ companyName: 'Acme Global' })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { recruiter: { companyName: string } }
    expect(body.recruiter.companyName).toBe('Acme Global')
  })

  it('rejects empty update body with 400', async () => {
    const res = await patchMe({})
    expect(res.status).toBe(400)
    expect(updateRecruiterProfile).not.toHaveBeenCalled()
  })

  it('returns 404 if profile does not exist', async () => {
    vi.mocked(updateRecruiterProfile).mockResolvedValue({
      ok: false,
      error: 'not_found',
    })

    const res = await patchMe({ companyName: 'New Name' })
    expect(res.status).toBe(404)
  })
})

// ==========================================
// DELETE /api/recruiters/me
// ==========================================

describe('DELETE /api/recruiters/me', () => {
  it('soft-deletes recruiter profile', async () => {
    vi.mocked(deleteRecruiterProfile).mockResolvedValue(true)

    const res = await app.request('/api/recruiters/me', { method: 'DELETE' })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { success: boolean }
    expect(body.success).toBe(true)
    expect(deleteRecruiterProfile).toHaveBeenCalledWith(expect.anything(), authUser.id)
  })

  it('returns 404 when profile to delete not found', async () => {
    vi.mocked(deleteRecruiterProfile).mockResolvedValue(false)

    const res = await app.request('/api/recruiters/me', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})

// ==========================================
// GET /api/recruiters/:id
// ==========================================

describe('GET /api/recruiters/:id', () => {
  const validId = '33333333-3333-4333-8333-333333333333'

  it('returns 200 with public recruiter details', async () => {
    vi.mocked(getPublicRecruiterById).mockResolvedValue({
      userId: validId,
      companyName: 'Public Corp',
      companyUrl: 'https://public.example.com',
      companyMail: 'contact@public.example.com',
      headquartersLocation: 'New York, NY',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    })

    const res = await app.request(`/api/recruiters/${validId}`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: { companyName: string } }
    expect(body.data.companyName).toBe('Public Corp')
    expect(getPublicRecruiterById).toHaveBeenCalledWith(expect.anything(), validId)
  })

  it('returns 404 for invalid UUID format', async () => {
    const res = await app.request('/api/recruiters/not-a-uuid')
    expect(res.status).toBe(404)
    expect(getPublicRecruiterById).not.toHaveBeenCalled()
  })

  it('returns 404 when recruiter not found', async () => {
    vi.mocked(getPublicRecruiterById).mockResolvedValue(null)

    const res = await app.request(`/api/recruiters/${validId}`)
    expect(res.status).toBe(404)
  })
})
