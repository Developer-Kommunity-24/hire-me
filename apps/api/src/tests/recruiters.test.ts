import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'

// ==========================================
// AUTH MOCK
// ==========================================

const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'recruiter@example.com',
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
// CONTROLLER MOCK
// ==========================================

vi.mock('../controllers/recruiters.controller.ts', () => ({
  getRecruiterByUserId: vi.fn(),
  upsertRecruiter: vi.fn(),
}))

import { app } from '../app.js'
import { getRecruiterByUserId, upsertRecruiter } from '../controllers/recruiters.controller.js'

// ==========================================
// FIXTURES
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRecruiter(overrides: Record<string, unknown> = {}): any {
  return {
    userId: authUser.id,
    companyName: 'Acme Inc',
    companyMail: 'recruiting@acme.com',
    companyUrl: 'https://acme.com',
    headquartersLocation: 'San Francisco, CA',
    jobTitle: 'Senior Technical Recruiter',
    bio: 'Looking for great talent.',
    isComplete: false,
    isDeleted: false,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  }
}

// ==========================================
// HELPERS
// ==========================================

function getRecruiterMe() {
  return app.request('/api/recruiters/me')
}

function patchRecruiterMe(body: unknown) {
  return app.request('/api/recruiters/me', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ==========================================
// GET /api/recruiters/me
// ==========================================

describe('GET /api/recruiters/me', () => {
  beforeEach(() => {
    vi.mocked(getRecruiterByUserId).mockResolvedValue(null)
  })

  it('returns null when no recruiter profile exists', async () => {
    const res = await getRecruiterMe()
    expect(res.status).toBe(200)

    const body = (await res.json()) as { recruiter: null }
    expect(body.recruiter).toBeNull()
  })

  it('returns the recruiter profile when it exists', async () => {
    vi.mocked(getRecruiterByUserId).mockResolvedValue(makeRecruiter())

    const res = await getRecruiterMe()
    expect(res.status).toBe(200)

    const body = (await res.json()) as { recruiter: { companyName: string } }
    expect(body.recruiter.companyName).toBe('Acme Inc')
  })

  it('passes the user id to the controller', async () => {
    await getRecruiterMe()

    expect(getRecruiterByUserId).toHaveBeenCalledWith(expect.anything(), authUser.id)
  })
})

// ==========================================
// PATCH /api/recruiters/me
// ==========================================

describe('PATCH /api/recruiters/me', () => {
  beforeEach(() => {
    vi.mocked(upsertRecruiter).mockResolvedValue(makeRecruiter())
  })

  it('upserts recruiter profile with valid data', async () => {
    const res = await patchRecruiterMe({
      fullName: 'Jane Recruiter',
      jobTitle: 'Senior Technical Recruiter',
      companyName: 'Acme Inc',
      companyMail: 'recruiting@acme.com',
      companyUrl: 'https://acme.com',
      headquartersLocation: 'San Francisco, CA',
      bio: 'Looking for great talent.',
      isComplete: true,
    })

    expect(res.status).toBe(200)

    expect(upsertRecruiter).toHaveBeenCalledWith(
      expect.anything(),
      authUser,
      expect.objectContaining({
        fullName: 'Jane Recruiter',
        jobTitle: 'Senior Technical Recruiter',
        companyName: 'Acme Inc',
        isComplete: true,
      }),
    )
  })

  it('accepts partial updates for draft saving', async () => {
    const res = await patchRecruiterMe({
      companyName: 'Acme Inc',
      companyMail: 'recruiting@acme.com',
    })

    expect(res.status).toBe(200)

    expect(upsertRecruiter).toHaveBeenCalledWith(
      expect.anything(),
      authUser,
      expect.objectContaining({
        companyName: 'Acme Inc',
        companyMail: 'recruiting@acme.com',
      }),
    )
  })

  it('validates email format', async () => {
    const res = await patchRecruiterMe({
      companyMail: 'not-an-email',
    })

    expect(res.status).toBe(400)
    expect(upsertRecruiter).not.toHaveBeenCalled()
  })

  it('validates URL format for companyUrl', async () => {
    const res = await patchRecruiterMe({
      companyUrl: 'not-a-url',
    })

    expect(res.status).toBe(400)
    expect(upsertRecruiter).not.toHaveBeenCalled()
  })

  it('accepts empty string for companyUrl', async () => {
    const res = await patchRecruiterMe({
      companyUrl: '',
    })

    expect(res.status).toBe(200)
    expect(upsertRecruiter).toHaveBeenCalled()
  })

  it('returns 404 when user row disappeared', async () => {
    vi.mocked(upsertRecruiter).mockResolvedValue(null)

    const res = await patchRecruiterMe({
      companyName: 'Acme Inc',
      companyMail: 'recruiting@acme.com',
    })

    expect(res.status).toBe(404)
  })

  it('requires non-empty strings for required fields when provided', async () => {
    const res = await patchRecruiterMe({
      jobTitle: '',
    })

    expect(res.status).toBe(400)
    expect(upsertRecruiter).not.toHaveBeenCalled()
  })
})
