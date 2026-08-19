import { describe, expect, it, vi, beforeEach } from 'vitest'
import { app } from '../app.js'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'

process.env.DATABASE_URL = DATABASE_URL

/** Parse a Response body as JSON with a loose type for easy test assertions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(res: Response): Promise<any> {
  return res.json()
}

// ==========================================
// SERVICE MOCK
// ==========================================
// We mock the service layer so tests don't require a real database.
// Each test configures the mock return values it needs.

vi.mock('../controllers/postings.controller.ts', () => ({
  listActivePostings: vi.fn(),
  getPostingById: vi.fn(),
}))

import { listActivePostings, getPostingById } from '../controllers/postings.controller.js'

// ==========================================
// FIXTURES
// ==========================================

const mockRecruiter = {
  companyName: 'Acme Corp',
  companyUrl: 'https://acme.example.com',
  companyMail: 'jobs@acme.example.com',
  headquartersLocation: 'San Francisco, CA',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePosting(overrides: Record<string, unknown> = {}): any {
  return {
    id: '00000000-0000-0000-0000-000000000001',
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
    recruiter: mockRecruiter,
    ...overrides,
  }
}

// ==========================================
// HELPERS
// ==========================================

/** Makes a request to the app with a fake DATABASE_URL so the db middleware doesn't throw before the mocked service runs. */
function request(path: string) {
  return app.request(path, {}, { DATABASE_URL })
}

// ==========================================
// LIST ENDPOINT
// ==========================================

describe('GET /api/postings', () => {
  beforeEach(() => {
    vi.mocked(listActivePostings).mockResolvedValue({ rows: [], total: 0 })
  })

  it('returns 200 with data and meta', async () => {
    const posting = makePosting()
    vi.mocked(listActivePostings).mockResolvedValue({ rows: [posting], total: 1 })

    const res = await request('/api/postings')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe(posting.id)
    expect(body.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('passes text search query to the service', async () => {
    await request('/api/postings?q=TypeScript')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ q: 'TypeScript' }),
      expect.anything(),
    )
  })

  it('passes stack filter to the service as an array', async () => {
    await request('/api/postings?stack=react&stack=typescript')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stack: ['react', 'typescript'] }),
      expect.anything(),
    )
  })

  it('passes a single stack value as a one-element array', async () => {
    await request('/api/postings?stack=go')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stack: ['go'] }),
      expect.anything(),
    )
  })

  it('passes employmentType filter to the service', async () => {
    await request('/api/postings?employmentType=full_time')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ employmentType: 'full_time' }),
      expect.anything(),
    )
  })

  it('passes workArrangement filter to the service', async () => {
    await request('/api/postings?workArrangement=remote')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ workArrangement: 'remote' }),
      expect.anything(),
    )
  })

  it('passes location filter to the service', async () => {
    await request('/api/postings?location=Berlin')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ location: 'Berlin' }),
      expect.anything(),
    )
  })

  it('passes deadlineBefore filter to the service', async () => {
    await request('/api/postings?deadlineBefore=2025-12-31')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ deadlineBefore: '2025-12-31' }),
      expect.anything(),
    )
  })

  it('passes deadlineAfter filter to the service', async () => {
    await request('/api/postings?deadlineAfter=2025-01-01')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ deadlineAfter: '2025-01-01' }),
      expect.anything(),
    )
  })

  it('rejects an invalid deadline format with 400', async () => {
    const res = await request('/api/postings?deadlineBefore=31-12-2025')
    expect(res.status).toBe(400)
  })

  it('rejects an unknown employmentType with 400', async () => {
    const res = await request('/api/postings?employmentType=freelance')
    expect(res.status).toBe(400)
  })

  it('passes sortBy and order to the service', async () => {
    await request('/api/postings?sortBy=deadline&order=asc')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sortBy: 'deadline', order: 'asc' }),
      expect.anything(),
    )
  })

  it('defaults sortBy=createdAt and order=desc', async () => {
    await request('/api/postings')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sortBy: 'createdAt', order: 'desc' }),
      expect.anything(),
    )
  })

  it('passes pagination params to the service', async () => {
    await request('/api/postings?page=3&limit=10')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ page: 3, limit: 10 }),
    )
  })

  it('clamps limit to 100', async () => {
    await request('/api/postings?limit=999')
    expect(listActivePostings).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 100 }),
    )
  })

  it('computes correct pagination meta for multiple pages', async () => {
    vi.mocked(listActivePostings).mockResolvedValue({
      rows: Array.from({ length: 5 }, (_, i) =>
        makePosting({ id: `00000000-0000-0000-0000-00000000000${i + 1}` }),
      ),
      total: 83,
    })

    const res = await request('/api/postings?page=2&limit=5')
    const body = await json(res)

    expect(body.meta).toMatchObject({
      page: 2,
      limit: 5,
      total: 83,
      totalPages: 17,
      hasNext: true,
      hasPrev: true,
    })
  })

  it('returns an empty data array when no postings match', async () => {
    vi.mocked(listActivePostings).mockResolvedValue({ rows: [], total: 0 })
    const res = await request('/api/postings')
    const body = await json(res)
    expect(body.data).toEqual([])
    expect(body.meta.total).toBe(0)
  })
})

// ==========================================
// DETAIL ENDPOINT
// ==========================================

describe('GET /api/postings/:id', () => {
  const validId = '123e4567-e89b-12d3-a456-426614174000'

  beforeEach(() => {
    vi.mocked(getPostingById).mockResolvedValue(null)
  })

  it('returns 200 with posting data when found', async () => {
    const posting = makePosting({ id: validId })
    vi.mocked(getPostingById).mockResolvedValue(posting)

    const res = await request(`/api/postings/${validId}`)
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data.id).toBe(validId)
    expect(body.data.recruiter.companyName).toBe('Acme Corp')
  })

  it('returns 404 when the posting does not exist', async () => {
    vi.mocked(getPostingById).mockResolvedValue(null)
    const res = await request(`/api/postings/${validId}`)
    expect(res.status).toBe(404)
  })

  it('returns 404 for a non-UUID id without hitting the service', async () => {
    const res = await request('/api/postings/not-a-uuid')
    expect(res.status).toBe(404)
    // Service should not have been called for an obviously invalid ID
    expect(getPostingById).not.toHaveBeenCalled()
  })

  it('passes the posting id to the service', async () => {
    const posting = makePosting({ id: validId })
    vi.mocked(getPostingById).mockResolvedValue(posting)

    await request(`/api/postings/${validId}`)
    expect(getPostingById).toHaveBeenCalledWith(expect.anything(), validId)
  })

  it('returns the complete recruiter details in the response', async () => {
    const posting = makePosting({ id: validId })
    vi.mocked(getPostingById).mockResolvedValue(posting)

    const res = await request(`/api/postings/${validId}`)
    const body = await json(res)

    expect(body.data.recruiter).toEqual(mockRecruiter)
  })
})
