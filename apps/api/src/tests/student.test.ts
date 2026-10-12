/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'

// ==========================================
// AUTH MOCK
// ==========================================

const { studentUser, recruiterUser } = vi.hoisted(() => ({
  studentUser: {
    id: '00000000-1111-2222-3333-444444444444',
    email: 'teststudent@example.com',
    fullName: 'Test Student',
    role: 'student' as const,
  },
  recruiterUser: {
    id: '00000000-1111-2222-3333-555555555555',
    email: 'testrecruiter@example.com',
    fullName: 'Test Recruiter',
    role: 'recruiter' as const,
  },
}))

let currentAuthUser: typeof studentUser | typeof recruiterUser | null = studentUser

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    if (!currentAuthUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('authUser', {
      id: currentAuthUser.id,
      email: currentAuthUser.email,
      name: currentAuthUser.fullName,
    })
    await next()
  },
  requireStudentRole: () => async (c: Context, next: Next) => {
    const userIdHeader = c.req.header('x-user-id')
    const authHeader = c.req.header('Authorization')

    if (!userIdHeader && !authHeader && currentAuthUser === null) {
      return c.json(
        { error: 'Unauthorized', message: 'Missing Authorization or x-user-id header.' },
        401,
      )
    }

    let user: typeof studentUser | typeof recruiterUser | null = currentAuthUser
    if (userIdHeader === recruiterUser.id) {
      user = recruiterUser
    } else if (userIdHeader === studentUser.id) {
      user = studentUser
    } else if (userIdHeader === 'non-existent') {
      user = null
    }

    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'User record not found.' }, 401)
    }

    if (user.role !== 'student') {
      return c.json({ error: 'Forbidden', message: 'Only students can access this resource.' }, 403)
    }

    c.set('user', user)
    await next()
  },
}))

// ==========================================
// CONTROLLER MOCK
// ==========================================

vi.mock('../controllers/student.controller.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../controllers/student.controller.js')>()
  return {
    ...actual,
    getStudentProfile: vi.fn(),
    updateStudentProfile: vi.fn(),
  }
})

import { app } from '../app.js'
import {
  getStudentProfile,
  updateStudentProfile,
  calculateCompletionPercentage,
} from '../controllers/student.controller.js'

// ==========================================
// FIXTURES
// ==========================================

function makeMockProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: studentUser.id,
    email: studentUser.email,
    fullName: studentUser.fullName,
    headline: 'Software Engineer Intern',
    bio: 'Avid software developer.',
    gradYear: 2026,
    openToWork: true,
    resumeUrl: 'https://example.com/resume.pdf',
    githubUrl: 'https://github.com/teststudent',
    linkedinUrl: 'https://linkedin.com/in/teststudent',
    otherLinks: {
      school: 'Stanford',
      degree: 'BS CS',
      gpa: '3.9',
      specialization: 'AI/ML',
      portfolioUrl: 'https://teststudent.dev',
    },
    dk24Status: 'none',
    phone: '+1234567890',
    completionPercentage: 100,
    skills: ['React', 'TypeScript', 'Next.js'],
    experienceRole: 'Frontend Dev Intern',
    experienceCompany: 'Google',
    experienceSummary: 'Built cool things.',
    school: 'Stanford',
    degree: 'BS CS',
    gpa: '3.9',
    specialization: 'AI/ML',
    portfolioUrl: 'https://teststudent.dev',
    ...overrides,
  }
}

describe('Student Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentAuthUser = studentUser
  })

  describe('GET /api/student/profile', () => {
    it('fails with 401 if unauthorized (missing auth/user)', async () => {
      currentAuthUser = null
      const res = await app.request('/api/student/profile')
      expect(res.status).toBe(401)
      const data = (await res.json()) as any
      expect(data.error).toBe('Unauthorized')
    })

    it('fails with 403 if authenticated user is not a student', async () => {
      const res = await app.request('/api/student/profile', {
        headers: {
          'x-user-id': recruiterUser.id,
        },
      })
      expect(res.status).toBe(403)
      const data = (await res.json()) as any
      expect(data.error).toBe('Forbidden')
    })

    it('successfully fetches student profile', async () => {
      const mockProfile = makeMockProfile()
      vi.mocked(getStudentProfile).mockResolvedValueOnce(mockProfile as any)

      const res = await app.request('/api/student/profile', {
        headers: {
          'x-user-id': studentUser.id,
        },
      })

      expect(res.status).toBe(200)
      const data = (await res.json()) as any
      expect(data.id).toBe(studentUser.id)
      expect(data.email).toBe(studentUser.email)
      expect(data.fullName).toBe('Test Student')
      expect(data.headline).toBe('Software Engineer Intern')
      expect(data.completionPercentage).toBe(100)
      expect(getStudentProfile).toHaveBeenCalledTimes(1)
    })

    it('returns 404 when student account is not found', async () => {
      vi.mocked(getStudentProfile).mockResolvedValueOnce(null)

      const res = await app.request('/api/student/profile', {
        headers: {
          'x-user-id': studentUser.id,
        },
      })

      expect(res.status).toBe(404)
      const data = (await res.json()) as any
      expect(data.error).toBe('Not Found')
    })

    it('returns 500 when getStudentProfile throws', async () => {
      vi.mocked(getStudentProfile).mockRejectedValueOnce(new Error('DB failure'))

      const res = await app.request('/api/student/profile', {
        headers: {
          'x-user-id': studentUser.id,
        },
      })

      expect(res.status).toBe(500)
      const data = (await res.json()) as any
      expect(data.error).toBe('Internal Server Error')
    })
  })

  describe('PUT /api/student/profile', () => {
    it('successfully updates student profile and returns updated values', async () => {
      const updatedProfile = makeMockProfile({
        fullName: 'Test Student Updated',
        bio: 'Updated bio',
      })
      vi.mocked(updateStudentProfile).mockResolvedValueOnce(updatedProfile as any)

      const payload = {
        fullName: 'Test Student Updated',
        bio: 'Updated bio',
        headline: 'Software Engineer Intern',
        gradYear: 2026,
        openToWork: true,
        resumeUrl: 'https://example.com/resume.pdf',
        githubUrl: 'https://github.com/teststudent',
        linkedinUrl: 'https://linkedin.com/in/teststudent',
        phone: '+1234567890',
        otherLinks: { portfolio: 'https://teststudent.dev' },
        skills: ['React', 'TypeScript', 'Next.js'],
        experienceRole: 'Frontend Dev Intern',
        experienceCompany: 'Google',
        experienceSummary: 'Built cool things.',
        school: 'Stanford',
        degree: 'BS CS',
        gpa: 3.9,
        specialization: 'AI/ML',
        portfolioUrl: 'https://teststudent.dev',
      }

      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      expect(res.status).toBe(200)
      const data = (await res.json()) as any
      expect(data.fullName).toBe('Test Student Updated')
      expect(data.bio).toBe('Updated bio')
      expect(updateStudentProfile).toHaveBeenCalledTimes(1)
      expect(updateStudentProfile).toHaveBeenCalledWith(expect.anything(), studentUser.id, payload)
    })

    it('fails with 400 for validation errors (invalid gradYear)', async () => {
      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradYear: 1850,
        }),
      })

      expect(res.status).toBe(400)
      const data = (await res.json()) as any
      expect(data.error).toBe('Validation Error')
      expect(updateStudentProfile).not.toHaveBeenCalled()
    })

    it('fails with 400 for invalid fullName (empty string)', async () => {
      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: '   ',
        }),
      })

      expect(res.status).toBe(400)
      const data = (await res.json()) as any
      expect(data.error).toBe('Validation Error')
    })

    it('fails with 400 for invalid skills array', async () => {
      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: ['React', ''],
        }),
      })

      expect(res.status).toBe(400)
      const data = (await res.json()) as any
      expect(data.error).toBe('Validation Error')
    })

    it('fails with 400 for malformed JSON payload', async () => {
      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: 'invalid-json{',
      })

      expect(res.status).toBe(400)
      const data = (await res.json()) as any
      expect(data.error).toBe('Bad Request')
    })

    it('returns 404 if student profile not found after update', async () => {
      vi.mocked(updateStudentProfile).mockResolvedValueOnce(null)

      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: 'Some bio',
        }),
      })

      expect(res.status).toBe(404)
      const data = (await res.json()) as any
      expect(data.error).toBe('Not Found')
    })

    it('returns 500 if updateStudentProfile throws', async () => {
      vi.mocked(updateStudentProfile).mockRejectedValueOnce(new Error('Update failed'))

      const res = await app.request('/api/student/profile', {
        method: 'PUT',
        headers: {
          'x-user-id': studentUser.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: 'Some bio',
        }),
      })

      expect(res.status).toBe(500)
      const data = (await res.json()) as any
      expect(data.error).toBe('Internal Server Error')
    })
  })

  describe('calculateCompletionPercentage', () => {
    it('returns 0 when profile is completely empty', () => {
      expect(calculateCompletionPercentage({})).toBe(0)
    })

    it('returns 15 when only fullName exists', () => {
      expect(calculateCompletionPercentage({ fullName: 'Test Student' })).toBe(15)
    })

    it('returns 100 when all profile fields are present', () => {
      expect(
        calculateCompletionPercentage({
          fullName: 'Test Student',
          headline: 'Engineer',
          bio: 'Bio text',
          gradYear: 2026,
          phone: '+1234567890',
          resumeUrl: 'https://example.com/resume.pdf',
          githubUrl: 'https://github.com/teststudent',
          linkedinUrl: 'https://linkedin.com/in/teststudent',
        }),
      ).toBe(100)
    })

    it('computes correct percentage when social links are lacking (85%)', () => {
      expect(
        calculateCompletionPercentage({
          fullName: 'Test Student',
          headline: 'Engineer',
          bio: 'Bio text',
          gradYear: 2026,
          phone: '+1234567890',
          resumeUrl: 'https://example.com/resume.pdf',
          githubUrl: null,
          linkedinUrl: null,
        }),
      ).toBe(85)
    })

    it('ignores whitespace-only strings', () => {
      expect(
        calculateCompletionPercentage({
          fullName: '   ',
          headline: '  ',
          bio: '',
          gradYear: null,
        }),
      ).toBe(0)
    })
  })
})
