import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'
import { app } from '../app.js'
import { normalizeUsn } from '../controllers/verification.controller.js'
import type {
  VerificationResponseData,
  VerificationResult,
} from '../controllers/verification.controller.js'

// ==========================================
// TEST CONFIG
// ==========================================

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'
process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'
process.env.WEB_ORIGIN = 'http://localhost:3000'

// ==========================================
// AUTH MOCK
// ==========================================

const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'student@example.test',
    name: 'Test Student',
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

vi.mock('../controllers/verification.controller.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../controllers/verification.controller.js')>()
  return {
    ...actual,
    verifyStudentSubmission: vi.fn(),
    getStudentVerificationStatus: vi.fn(),
    flagBadgeRevocation: vi.fn(),
    resolveBadgeRevocation: vi.fn(),
    listPendingRevocations: vi.fn(),
    listVerificationRequests: vi.fn(),
  }
})

import {
  verifyStudentSubmission,
  getStudentVerificationStatus,
  flagBadgeRevocation,
  resolveBadgeRevocation,
  listPendingRevocations,
  listVerificationRequests,
} from '../controllers/verification.controller.js'

// ==========================================
// FIXTURES
// ==========================================

const mockMatchedData: VerificationResponseData = {
  request: {
    id: '22222222-2222-4222-8222-222222222222',
    studentId: authUser.id,
    usn: '1CS21CS010',
    clubId: '33333333-3333-4333-8333-333333333333',
    matchedClubMembershipId: '44444444-4444-4444-8444-444444444444',
    autoMatched: true,
    submittedAt: new Date('2026-10-01T00:00:00Z'),
    appliedAt: new Date('2026-10-01T00:00:00Z'),
    resubmitCount: 0,
  },
  matchedMembership: {
    id: '44444444-4444-4444-8444-444444444444',
    clubId: '33333333-3333-4333-8333-333333333333',
    clubName: 'ACM Student Chapter',
    fullName: 'Test Student',
    usn: '1CS21CS010',
    role: 'member',
  },
  dk24Status: 'verified',
  isResubmission: false,
}

const mockUnmatchedData: VerificationResponseData = {
  request: {
    id: '22222222-2222-4222-8222-222222222222',
    studentId: authUser.id,
    usn: '1CS21CS999',
    clubId: null,
    matchedClubMembershipId: null,
    autoMatched: false,
    submittedAt: new Date('2026-10-01T00:00:00Z'),
    appliedAt: null,
    resubmitCount: 0,
  },
  matchedMembership: null,
  dk24Status: 'pending',
  isResubmission: false,
}

// ==========================================
// TESTS
// ==========================================

describe('Verification API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('normalizeUsn utility', () => {
    it('trims leading/trailing whitespace and converts to uppercase', () => {
      expect(normalizeUsn('  1cs21cs010  ')).toBe('1CS21CS010')
      expect(normalizeUsn('1dk24cs001')).toBe('1DK24CS001')
      expect(normalizeUsn('  1EE22EE015 ')).toBe('1EE22EE015')
    })
  })

  describe('POST /api/verifications', () => {
    it('returns 201 on successful auto-matched initial submission', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: true,
        data: mockMatchedData,
      })

      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010' }),
      })

      expect(res.status).toBe(201)
      const body = (await res.json()) as { data: VerificationResponseData }
      expect(body.data.request.autoMatched).toBe(true)
      expect(body.data.dk24Status).toBe('verified')
      expect(body.data.matchedMembership?.clubName).toBe('ACM Student Chapter')
      expect(body.data.isResubmission).toBe(false)
      expect(verifyStudentSubmission).toHaveBeenCalledWith(
        expect.anything(),
        authUser.id,
        authUser.email,
        { usn: '1CS21CS010' },
      )
    })

    it('returns 200 on resubmission with incremented resubmitCount', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: true,
        data: {
          ...mockMatchedData,
          request: {
            ...mockMatchedData.request,
            resubmitCount: 1,
          },
          isResubmission: true,
        },
      })

      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010' }),
      })

      expect(res.status).toBe(200)
      const body = (await res.json()) as { data: VerificationResponseData }
      expect(body.data.isResubmission).toBe(true)
      expect(body.data.request.resubmitCount).toBe(1)
    })

    it('returns 201 with status pending when no match is found', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: true,
        data: mockUnmatchedData,
      })

      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS999' }),
      })

      expect(res.status).toBe(201)
      const body = (await res.json()) as { data: VerificationResponseData }
      expect(body.data.request.autoMatched).toBe(false)
      expect(body.data.dk24Status).toBe('pending')
      expect(body.data.matchedMembership).toBeNull()
    })

    it('also responds on alias /api/verifications/verify', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: true,
        data: mockMatchedData,
      })

      const res = await app.request('/api/verifications/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010' }),
      })

      expect(res.status).toBe(201)
    })

    it('also responds on student alias /api/student/verification', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: true,
        data: mockMatchedData,
      })

      const res = await app.request('/api/student/verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010' }),
      })

      expect(res.status).toBe(201)
    })

    it('rejects an empty USN with 400', async () => {
      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '' }),
      })

      expect(res.status).toBe(400)
      expect(verifyStudentSubmission).not.toHaveBeenCalled()
    })

    it('rejects a USN exceeding max length with 400', async () => {
      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: 'A'.repeat(25) }),
      })

      expect(res.status).toBe(400)
      expect(verifyStudentSubmission).not.toHaveBeenCalled()
    })

    it('rejects an invalid clubId UUID with 400', async () => {
      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010', clubId: 'not-a-uuid' }),
      })

      expect(res.status).toBe(400)
      expect(verifyStudentSubmission).not.toHaveBeenCalled()
    })

    it('returns 403 when the student has an active badge revocation', async () => {
      vi.mocked(verifyStudentSubmission).mockResolvedValue({
        ok: false,
        error: 'badge_revoked',
        message: 'Student has an active badge revocation that has not been resolved',
      } as VerificationResult)

      const res = await app.request('/api/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ usn: '1CS21CS010' }),
      })

      expect(res.status).toBe(403)
      const body = (await res.json()) as { error: string }
      expect(body.error).toMatch(/badge revocation/i)
    })
  })

  describe('GET /api/verifications/me and /status', () => {
    it('returns the student verification status and matched membership', async () => {
      vi.mocked(getStudentVerificationStatus).mockResolvedValue({
        dk24Status: 'verified',
        request: mockMatchedData.request,
        matchedMembership: mockMatchedData.matchedMembership,
        activeRevocation: null,
      })

      const res = await app.request('/api/verifications/me')
      expect(res.status).toBe(200)

      const body = (await res.json()) as {
        data: {
          dk24Status: string
          request: typeof mockMatchedData.request
          matchedMembership: typeof mockMatchedData.matchedMembership
          activeRevocation: unknown
        }
      }
      expect(body.data.dk24Status).toBe('verified')
      expect(body.data.matchedMembership?.clubName).toBe('ACM Student Chapter')
      expect(body.data.activeRevocation).toBeNull()
      expect(getStudentVerificationStatus).toHaveBeenCalledWith(expect.anything(), authUser.id)
    })

    it('returns status on GET /api/verifications/status', async () => {
      vi.mocked(getStudentVerificationStatus).mockResolvedValue({
        dk24Status: 'none',
        request: null,
        matchedMembership: null,
        activeRevocation: null,
      })

      const res = await app.request('/api/verifications/status')
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: { dk24Status: string } }
      expect(body.data.dk24Status).toBe('none')
    })
  })

  describe('Badge Revocation Endpoints', () => {
    it('POST /api/verifications/revocations flags a badge revocation with 201', async () => {
      const mockRevocation = {
        id: '99999999-9999-4999-8999-999999999999',
        studentId: authUser.id,
        clubMembershipId: '44444444-4444-4444-8444-444444444444',
        flaggedAt: new Date('2026-10-02T00:00:00Z'),
        resolvedBy: authUser.id,
        resolvedAt: null,
        resolution: 'Violation of club conduct policy',
      }

      vi.mocked(flagBadgeRevocation).mockResolvedValue(mockRevocation)

      const res = await app.request('/api/verifications/revocations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          studentId: authUser.id,
          clubMembershipId: '44444444-4444-4444-8444-444444444444',
          resolution: 'Violation of club conduct policy',
        }),
      })

      expect(res.status).toBe(201)
      const body = (await res.json()) as { data: typeof mockRevocation }
      expect(body.data.id).toBe(mockRevocation.id)
      expect(flagBadgeRevocation).toHaveBeenCalledWith(expect.anything(), {
        studentId: authUser.id,
        clubMembershipId: '44444444-4444-4444-8444-444444444444',
        resolution: 'Violation of club conduct policy',
        resolvedBy: authUser.id,
      })
    })

    it('GET /api/verifications/revocations/pending returns pending revocations', async () => {
      const mockPending = [
        {
          id: '99999999-9999-4999-8999-999999999999',
          studentId: authUser.id,
          clubMembershipId: '44444444-4444-4444-8444-444444444444',
          flaggedAt: new Date('2026-10-02T00:00:00Z'),
          resolvedBy: null,
          resolvedAt: null,
          resolution: null,
        },
      ]

      vi.mocked(listPendingRevocations).mockResolvedValue(mockPending)

      const res = await app.request('/api/verifications/revocations/pending')
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: typeof mockPending }
      expect(body.data).toHaveLength(1)
      expect(body.data[0]?.id).toBe(mockPending[0]?.id)
    })

    it('PATCH /api/verifications/revocations/:id/resolve resolves a revocation', async () => {
      const mockResolved = {
        id: '99999999-9999-4999-8999-999999999999',
        studentId: authUser.id,
        clubMembershipId: '44444444-4444-4444-8444-444444444444',
        flaggedAt: new Date('2026-10-02T00:00:00Z'),
        resolvedBy: authUser.id,
        resolvedAt: new Date('2026-10-03T00:00:00Z'),
        resolution: 'Audit cleared: verified identity',
      }

      vi.mocked(resolveBadgeRevocation).mockResolvedValue({
        ok: true,
        data: mockResolved,
      })

      const res = await app.request(
        '/api/verifications/revocations/99999999-9999-4999-8999-999999999999/resolve',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            resolution: 'Audit cleared: verified identity',
            restoreStatus: 'verified',
          }),
        },
      )

      expect(res.status).toBe(200)
      const body = (await res.json()) as { data: typeof mockResolved }
      expect(body.data.resolution).toBe('Audit cleared: verified identity')
    })

    it('PATCH /api/verifications/revocations/:id/resolve returns 404 when not found', async () => {
      vi.mocked(resolveBadgeRevocation).mockResolvedValue({
        ok: false,
        error: 'not_found',
      })

      const res = await app.request(
        '/api/verifications/revocations/99999999-9999-4999-8999-999999999999/resolve',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            resolution: 'Audit cleared',
          }),
        },
      )

      expect(res.status).toBe(404)
    })

    it('PATCH /api/verifications/revocations/:id/resolve returns 404 for invalid UUID', async () => {
      const res = await app.request('/api/verifications/revocations/not-a-uuid/resolve', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          resolution: 'Audit cleared',
        }),
      })

      expect(res.status).toBe(404)
      expect(resolveBadgeRevocation).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/verifications/requests', () => {
    it('lists verification requests with pagination query parameters', async () => {
      vi.mocked(listVerificationRequests).mockResolvedValue([mockMatchedData.request])

      const res = await app.request('/api/verifications/requests?limit=10&offset=5')
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: (typeof mockMatchedData.request)[] }
      expect(body.data).toHaveLength(1)
      expect(listVerificationRequests).toHaveBeenCalledWith(expect.anything(), {
        limit: 10,
        offset: 5,
      })
    })
  })
})
