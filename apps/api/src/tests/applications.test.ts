import { beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../app.js'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json()
}

const mockState = vi.hoisted(() => ({
  student: {
    outcome: 'allow' as 'allow' | 'forbidden',
    studentId: 'student-1',
  },
  recruiter: {
    outcome: 'allow' as 'allow' | 'forbidden',
    recruiterId: 'recruiter-1',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: vi.fn(async (_c, next) => {
    await next()
  }),
}))

vi.mock('../middleware/requireStudent.ts', () => ({
  requireStudent: vi.fn(async (c, next) => {
    if (mockState.student.outcome === 'forbidden') {
      return c.json({ error: 'Student profile required to apply to postings' }, 403)
    }
    c.set('studentId', mockState.student.studentId)
    await next()
  }),
}))

vi.mock('../middleware/requireRecruiter.ts', () => ({
  requireRecruiter: vi.fn(async (c, next) => {
    if (mockState.recruiter.outcome === 'forbidden') {
      return c.json({ error: 'Recruiter profile required to manage postings' }, 403)
    }
    c.set('recruiterId', mockState.recruiter.recruiterId)
    await next()
  }),
}))

vi.mock('../controllers/applications.controller.ts', () => ({
  applyToPosting: vi.fn(),
  listOwnApplications: vi.fn(),
  updateApplicationStatus: vi.fn(),
  listApplicantsForPosting: vi.fn(),
}))

import {
  applyToPosting,
  listOwnApplications,
  updateApplicationStatus,
  listApplicantsForPosting,
} from '../controllers/applications.controller.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeApplication(overrides: Record<string, unknown> = {}): any {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    postingId: '22222222-2222-4222-8222-222222222222',
    studentId: 'student-1',
    status: 'applied',
    appliedAt: new Date('2026-10-06T10:00:00Z'),
    updatedAt: new Date('2026-10-06T10:00:00Z'),
    ...overrides,
  }
}

function request(path: string, init: RequestInit = {}) {
  return app.request(
    path,
    {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    },
    { DATABASE_URL },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockState.student = { outcome: 'allow', studentId: 'student-1' }
  mockState.recruiter = { outcome: 'allow', recruiterId: 'recruiter-1' }
})

describe('POST /api/applications', () => {
  const postingId = '22222222-2222-4222-8222-222222222222'

  it('returns 201 and creates the application for an open posting', async () => {
    const application = makeApplication()
    vi.mocked(applyToPosting).mockResolvedValue({ ok: true, data: application })

    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId }),
    })

    expect(res.status).toBe(201)
    const body = await json(res)
    expect(body.data.id).toBe(application.id)

    expect(applyToPosting).toHaveBeenCalledWith(expect.anything(), 'student-1', postingId)
  })

  it('rejects a body missing postingId with 400', async () => {
    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)
    expect(applyToPosting).not.toHaveBeenCalled()
  })

  it('rejects a non-UUID postingId with 400', async () => {
    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId: 'not-a-uuid' }),
    })

    expect(res.status).toBe(400)
    expect(applyToPosting).not.toHaveBeenCalled()
  })

  it('returns 403 when the middleware reports no student profile', async () => {
    mockState.student = { outcome: 'forbidden', studentId: '' }

    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId }),
    })

    expect(res.status).toBe(403)
    expect(applyToPosting).not.toHaveBeenCalled()
  })

  it('returns 404 when the posting does not exist', async () => {
    vi.mocked(applyToPosting).mockResolvedValue({ ok: false, error: 'not_found' })

    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId }),
    })

    expect(res.status).toBe(404)
  })

  it('returns 409 when the posting is closed or expired', async () => {
    vi.mocked(applyToPosting).mockResolvedValue({ ok: false, error: 'closed' })

    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId }),
    })

    expect(res.status).toBe(409)
  })

  it('returns 409 when the student already applied', async () => {
    vi.mocked(applyToPosting).mockResolvedValue({ ok: false, error: 'duplicate' })

    const res = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ postingId }),
    })

    expect(res.status).toBe(409)
  })
})

describe('GET /api/applications', () => {
  it("returns 200 with the caller's applications", async () => {
    const application = makeApplication()
    vi.mocked(listOwnApplications).mockResolvedValue([application])

    const res = await request('/api/applications')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe(application.id)
    expect(listOwnApplications).toHaveBeenCalledWith(expect.anything(), 'student-1')
  })

  it('returns 403 when the middleware reports no student profile', async () => {
    mockState.student = { outcome: 'forbidden', studentId: '' }

    const res = await request('/api/applications')
    expect(res.status).toBe(403)
    expect(listOwnApplications).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/applications/:id/status', () => {
  const id = '11111111-1111-4111-8111-111111111111'

  it('returns 404 for a non-UUID id without calling the controller', async () => {
    const res = await request('/api/applications/not-a-uuid/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'under_review' }),
    })

    expect(res.status).toBe(404)
    expect(updateApplicationStatus).not.toHaveBeenCalled()
  })

  it('returns 200 with the updated application', async () => {
    const updated = makeApplication({ status: 'shortlisted' })
    vi.mocked(updateApplicationStatus).mockResolvedValue({ ok: true, data: updated })

    const res = await request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'shortlisted' }),
    })

    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.data.status).toBe('shortlisted')

    expect(updateApplicationStatus).toHaveBeenCalledWith(
      expect.anything(),
      'recruiter-1',
      id,
      'shortlisted',
    )
  })

  it('returns 404 when the application is unknown or unowned', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue({ ok: false, error: 'not_found' })

    const res = await request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'under_review' }),
    })

    expect(res.status).toBe(404)
  })

  it('returns 409 when the transition is not allowed', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue({
      ok: false,
      error: 'invalid_transition',
      from: 'accepted',
    })

    const res = await request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    })

    expect(res.status).toBe(409)
  })

  it('rejects the initial "applied" status as a target with 400', async () => {
    const res = await request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'applied' }),
    })

    expect(res.status).toBe(400)
    expect(updateApplicationStatus).not.toHaveBeenCalled()
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiter = { outcome: 'forbidden', recruiterId: '' }

    const res = await request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'under_review' }),
    })

    expect(res.status).toBe(403)
    expect(updateApplicationStatus).not.toHaveBeenCalled()
  })
})

describe('GET /api/postings/:id/applications', () => {
  const postingId = '22222222-2222-4222-8222-222222222222'

  it('returns 404 for a non-UUID id without calling the controller', async () => {
    const res = await request('/api/postings/not-a-uuid/applications')
    expect(res.status).toBe(404)
    expect(listApplicantsForPosting).not.toHaveBeenCalled()
  })

  it('returns 200 with the applicants', async () => {
    const applicant = { id: 'app-1', studentId: 'student-1', status: 'applied' }
    vi.mocked(listApplicantsForPosting).mockResolvedValue([applicant as never])

    const res = await request(`/api/postings/${postingId}/applications`)
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toHaveLength(1)
    expect(listApplicantsForPosting).toHaveBeenCalledWith(
      expect.anything(),
      'recruiter-1',
      postingId,
    )
  })

  it('returns 404 when the posting is unowned or unknown', async () => {
    vi.mocked(listApplicantsForPosting).mockResolvedValue(null)

    const res = await request(`/api/postings/${postingId}/applications`)
    expect(res.status).toBe(404)
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiter = { outcome: 'forbidden', recruiterId: '' }

    const res = await request(`/api/postings/${postingId}/applications`)
    expect(res.status).toBe(403)
    expect(listApplicantsForPosting).not.toHaveBeenCalled()
  })
})
