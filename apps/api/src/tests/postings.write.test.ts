import { beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../app.js'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json()
}

const mockState = vi.hoisted(() => ({
  recruiter: {
    outcome: 'allow' as 'allow' | 'forbidden',
    recruiterId: 'recruiter-1',
  },
  recruiterOrAdmin: {
    outcome: 'allow' as 'allow' | 'forbidden' | 'adminMissingTarget' | 'adminTargetNotFound',
    recruiterId: 'recruiter-1',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: vi.fn(async (_c, next) => {
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

vi.mock('../middleware/requireRecruiterOrAdmin.ts', () => ({
  requireRecruiterOrAdmin: vi.fn(async (c, next) => {
    switch (mockState.recruiterOrAdmin.outcome) {
      case 'forbidden':
        return c.json({ error: 'Recruiter profile required to manage postings' }, 403)
      case 'adminMissingTarget':
        return c.json({ error: 'onBehalfOfRecruiterId is required for core admins' }, 400)
      case 'adminTargetNotFound':
        return c.json({ error: 'Target recruiter not found' }, 404)
      case 'allow':
      default:
        c.set('recruiterId', mockState.recruiterOrAdmin.recruiterId)
        await next()
    }
  }),
}))

vi.mock('../controllers/postings.controller.ts', () => ({
  createPosting: vi.fn(),
  listOwnPostings: vi.fn(),
  updatePosting: vi.fn(),
  closePosting: vi.fn(),
}))

import {
  createPosting,
  listOwnPostings,
  updatePosting,
  closePosting,
} from '../controllers/postings.controller.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePosting(overrides: Record<string, unknown> = {}): any {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    recruiterId: 'recruiter-1',
    title: 'Software Engineer Intern',
    description: 'Build cool things with TypeScript.',
    stack: ['typescript', 'react'],
    employmentType: 'internship',
    workArrangement: 'remote',
    seniorityLevel: 'junior',
    compensation: '$30/hr',
    location: 'Remote',
    deadline: '2099-12-31',
    status: 'active',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  }
}

const validCreateBody = {
  title: 'Frontend Intern',
  description: 'Build UI',
  stack: ['react', 'typescript'],
  employmentType: 'internship',
  workArrangement: 'remote',
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
  mockState.recruiter = { outcome: 'allow', recruiterId: 'recruiter-1' }
  mockState.recruiterOrAdmin = { outcome: 'allow', recruiterId: 'recruiter-1' }
})

describe('POST /api/postings', () => {
  it('returns 201 and creates the posting for an allowed recruiter', async () => {
    const posting = makePosting()
    vi.mocked(createPosting).mockResolvedValue(posting)

    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(validCreateBody),
    })

    expect(res.status).toBe(201)
    const body = await json(res)
    expect(body.data.id).toBe(posting.id)

    expect(createPosting).toHaveBeenCalledWith(
      expect.anything(),
      'recruiter-1',
      expect.not.objectContaining({ onBehalfOfRecruiterId: expect.anything() }),
    )
  })

  it('rejects a body missing title with 400', async () => {
    const { title: _title, ...bodyWithoutTitle } = validCreateBody
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(bodyWithoutTitle),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('rejects a body missing description with 400', async () => {
    const { description: _description, ...bodyWithoutDescription } = validCreateBody
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(bodyWithoutDescription),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('rejects a body missing stack with 400', async () => {
    const { stack: _stack, ...bodyWithoutStack } = validCreateBody
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(bodyWithoutStack),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('rejects an invalid employmentType with 400', async () => {
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify({ ...validCreateBody, employmentType: 'freelance' }),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('rejects an invalid workArrangement with 400', async () => {
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify({ ...validCreateBody, workArrangement: 'onsite' }),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('rejects a deadline before today with 400', async () => {
    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify({ ...validCreateBody, deadline: '2020-01-01' }),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiterOrAdmin = { outcome: 'forbidden', recruiterId: '' }

    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(validCreateBody),
    })
    expect(res.status).toBe(403)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('returns 400 when the middleware reports a missing onBehalfOfRecruiterId', async () => {
    mockState.recruiterOrAdmin = { outcome: 'adminMissingTarget', recruiterId: '' }

    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify(validCreateBody),
    })
    expect(res.status).toBe(400)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('returns 404 when the middleware reports the target recruiter was not found', async () => {
    mockState.recruiterOrAdmin = { outcome: 'adminTargetNotFound', recruiterId: '' }

    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify({
        ...validCreateBody,
        onBehalfOfRecruiterId: '11111111-1111-4111-8111-111111111111',
      }),
    })
    expect(res.status).toBe(404)
    expect(createPosting).not.toHaveBeenCalled()
  })

  it('passes the recruiterId set by middleware to createPosting', async () => {
    mockState.recruiterOrAdmin = { outcome: 'allow', recruiterId: 'target-recruiter-id' }
    const posting = makePosting({ recruiterId: 'target-recruiter-id' })
    vi.mocked(createPosting).mockResolvedValue(posting)

    const res = await request('/api/postings', {
      method: 'POST',
      body: JSON.stringify({
        ...validCreateBody,
        onBehalfOfRecruiterId: '11111111-1111-4111-8111-111111111111',
      }),
    })

    expect(res.status).toBe(201)
    expect(createPosting).toHaveBeenCalledWith(
      expect.anything(),
      'target-recruiter-id',
      expect.anything(),
    )
  })
})

describe('GET /api/postings/mine', () => {
  it("returns 200 with the caller's postings", async () => {
    const posting = makePosting()
    vi.mocked(listOwnPostings).mockResolvedValue([posting])

    const res = await request('/api/postings/mine')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe(posting.id)
    expect(listOwnPostings).toHaveBeenCalledWith(expect.anything(), 'recruiter-1')
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiter = { outcome: 'forbidden', recruiterId: '' }

    const res = await request('/api/postings/mine')
    expect(res.status).toBe(403)
    expect(listOwnPostings).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/postings/:id', () => {
  const id = '11111111-1111-4111-8111-111111111111'

  it('returns 404 for a non-UUID id without calling the controller', async () => {
    const res = await request('/api/postings/not-a-uuid', {
      method: 'PATCH',
      body: JSON.stringify({ location: 'Bengaluru' }),
    })

    expect(res.status).toBe(404)
    expect(updatePosting).not.toHaveBeenCalled()
  })

  it('returns 200 with the updated posting', async () => {
    const updated = makePosting({ location: 'Bengaluru' })
    vi.mocked(updatePosting).mockResolvedValue(updated)

    const res = await request(`/api/postings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ location: 'Bengaluru' }),
    })

    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.data.location).toBe('Bengaluru')
    expect(updatePosting).toHaveBeenCalledWith(expect.anything(), id, 'recruiter-1', {
      location: 'Bengaluru',
    })
  })

  it('returns 404 when the controller reports not found or not owned', async () => {
    vi.mocked(updatePosting).mockResolvedValue(null)

    const res = await request(`/api/postings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ location: 'Bengaluru' }),
    })

    expect(res.status).toBe(404)
  })

  it('rejects an empty patch body with 400', async () => {
    const res = await request(`/api/postings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)
    expect(updatePosting).not.toHaveBeenCalled()
  })

  it('rejects a deadline before today with 400', async () => {
    const res = await request(`/api/postings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        deadline: '2020-01-01',
      }),
    })

    expect(res.status).toBe(400)
    expect(updatePosting).not.toHaveBeenCalled()
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiter = { outcome: 'forbidden', recruiterId: '' }

    const res = await request(`/api/postings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ location: 'Bengaluru' }),
    })

    expect(res.status).toBe(403)
    expect(updatePosting).not.toHaveBeenCalled()
  })
})

describe('POST /api/postings/:id/close', () => {
  const id = '11111111-1111-4111-8111-111111111111'

  it('returns 404 for a non-UUID id without calling the controller', async () => {
    const res = await request('/api/postings/not-a-uuid/close', {
      method: 'POST',
    })

    expect(res.status).toBe(404)
    expect(closePosting).not.toHaveBeenCalled()
  })

  it('returns 200 with status closed', async () => {
    const closed = makePosting({ status: 'closed' })
    vi.mocked(closePosting).mockResolvedValue(closed)

    const res = await request(`/api/postings/${id}/close`, { method: 'POST' })
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data.status).toBe('closed')
    expect(closePosting).toHaveBeenCalledWith(expect.anything(), id, 'recruiter-1')
  })

  it('returns 404 when the controller reports not found or not owned', async () => {
    vi.mocked(closePosting).mockResolvedValue(null)

    const res = await request(`/api/postings/${id}/close`, { method: 'POST' })
    expect(res.status).toBe(404)
  })

  it('returns 403 when the middleware reports no recruiter profile', async () => {
    mockState.recruiter = { outcome: 'forbidden', recruiterId: '' }

    const res = await request(`/api/postings/${id}/close`, { method: 'POST' })
    expect(res.status).toBe(403)
    expect(closePosting).not.toHaveBeenCalled()
  })
})
