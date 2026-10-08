import { describe, expect, it, vi, beforeEach } from 'vitest'
import { app } from '../app.js'
import type { TalentResult } from '../controllers/talents.controller.js'

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

vi.mock('../controllers/talents.controller.ts', () => ({
  listTalents: vi.fn(),
}))

import { listTalents } from '../controllers/talents.controller.js'

// ==========================================
// FIXTURES
// ==========================================

function makeTalent(overrides: Partial<TalentResult> = {}): TalentResult {
  return {
    id: '00000000-0001-0000-0000-000000000001',
    fullName: 'Arjun Sharma',
    email: 'arjun.sharma@college.edu',
    headline: 'Full-Stack Developer | React & Node.js',
    bio: 'Final year CS student passionate about building scalable web apps.',
    gradYear: 2025,
    openToWork: true,
    dk24Status: 'verified',
    resumeUrl: 'https://cdn.hire-me.college/resumes/arjun-sharma.pdf',
    githubUrl: 'https://github.com/arjunsharma',
    linkedinUrl: 'https://linkedin.com/in/arjunsharma',
    otherLinks: null,
    consentGivenAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    projects: [
      {
        id: '00000000-0020-0000-0000-000000000001',
        title: 'hire-me Platform',
        description: 'Campus job-board with DK24 student verification...',
        role: 'Full-Stack Lead',
        contributions: 'Designed schema and built API',
        learnings: 'Drizzle ORM, Neon Postgres',
        skillsUsed: ['TypeScript', 'React', 'Hono', 'Drizzle ORM', 'PostgreSQL'],
        liveUrl: null,
        githubUrl: 'https://github.com/arjunsharma/hire-me',
        displayOrder: 0,
        createdAt: new Date('2025-01-01T00:00:00Z'),
      },
    ],
    ...overrides,
  }
}

// ==========================================
// HELPERS
// ==========================================

function request(path: string) {
  return app.request(path, {}, { DATABASE_URL })
}

// ==========================================
// TALENTS SEARCH ENDPOINT TESTS
// ==========================================

describe('GET /api/talents', () => {
  beforeEach(() => {
    vi.mocked(listTalents).mockResolvedValue({ rows: [], total: 0 })
  })

  it('returns 200 with data and pagination meta for default listing', async () => {
    const talent = makeTalent()
    vi.mocked(listTalents).mockResolvedValue({ rows: [talent], total: 1 })

    const res = await request('/api/talents')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe(talent.id)
    expect(body.data[0].fullName).toBe('Arjun Sharma')
    expect(body.data[0].skills).toEqual(['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'])
    expect(body.data[0].projects).toHaveLength(1)
    expect(body.data[0].projects[0].title).toBe('hire-me Platform')
    expect(body.meta).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('defaults pagination to page 1 and limit 20 when page is missing', async () => {
    await request('/api/talents')
    expect(listTalents).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      page: 1,
      limit: 20,
    })
  })

  it('accepts valid page=1 parameter', async () => {
    const res = await request('/api/talents?page=1')
    expect(res.status).toBe(200)
    expect(listTalents).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      page: 1,
      limit: 20,
    })
  })

  it('accepts valid page=2 parameter', async () => {
    const res = await request('/api/talents?page=2')
    expect(res.status).toBe(200)
    expect(listTalents).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      page: 2,
      limit: 20,
    })
  })

  it('passes custom page and limit to pagination params', async () => {
    await request('/api/talents?page=3&limit=15')
    expect(listTalents).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      page: 3,
      limit: 15,
    })
  })

  it('clamps max limit to 100', async () => {
    await request('/api/talents?limit=500')
    expect(listTalents).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      page: 1,
      limit: 100,
    })
  })

  it('passes free-text search (q) to the service', async () => {
    await request('/api/talents?q=React')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ q: 'React' }),
      expect.anything(),
    )
  })

  it('passes single skill filter to the service as an array with default ALL matchMode', async () => {
    await request('/api/talents?skills=React')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skills: ['React'],
        skillMatchMode: 'all',
      }),
      expect.anything(),
    )
  })

  it('passes multiple skill filters with default ALL match mode', async () => {
    await request('/api/talents?skills=Angular&skills=.NET')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skills: ['Angular', '.NET'],
        skillMatchMode: 'all',
      }),
      expect.anything(),
    )
  })

  it('supports skillMatchMode=any for OR skill filtering', async () => {
    await request('/api/talents?skills=Angular&skills=.NET&skillMatchMode=any')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skills: ['Angular', '.NET'],
        skillMatchMode: 'any',
      }),
      expect.anything(),
    )
  })

  it('supports comma-separated skills in query parameter', async () => {
    await request('/api/talents?skills=React,Node.js,PostgreSQL')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skills: ['React', 'Node.js', 'PostgreSQL'],
        skillMatchMode: 'all',
      }),
      expect.anything(),
    )
  })

  it('passes openToWork=true filter to the service', async () => {
    await request('/api/talents?openToWork=true')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ openToWork: true }),
      expect.anything(),
    )
  })

  it('passes openToWork=false filter to the service', async () => {
    await request('/api/talents?openToWork=false')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ openToWork: false }),
      expect.anything(),
    )
  })

  it('passes dk24Status filter to the service', async () => {
    await request('/api/talents?dk24Status=verified')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ dk24Status: 'verified' }),
      expect.anything(),
    )
  })

  it('passes gradYear filter to the service as a number', async () => {
    await request('/api/talents?gradYear=2025')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ gradYear: 2025 }),
      expect.anything(),
    )
  })

  it('passes sort and order options to the service', async () => {
    await request('/api/talents?sortBy=fullName&order=asc')
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sortBy: 'fullName', order: 'asc' }),
      expect.anything(),
    )
  })

  it('passes combined filters simultaneously', async () => {
    await request(
      '/api/talents?q=Full-Stack&skills=TypeScript&skills=React&skillMatchMode=all&openToWork=true&dk24Status=verified&gradYear=2025&sortBy=gradYear&order=desc',
    )
    expect(listTalents).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        q: 'Full-Stack',
        skills: ['TypeScript', 'React'],
        skillMatchMode: 'all',
        openToWork: true,
        dk24Status: 'verified',
        gradYear: 2025,
        sortBy: 'gradYear',
        order: 'desc',
      }),
      expect.anything(),
    )
  })

  it('returns empty data array when no students match', async () => {
    vi.mocked(listTalents).mockResolvedValue({ rows: [], total: 0 })

    const res = await request('/api/talents?q=NonExistentDeveloper')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toEqual([])
    expect(body.meta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('computes correct pagination meta for multiple pages', async () => {
    vi.mocked(listTalents).mockResolvedValue({ rows: [makeTalent()], total: 45 })

    const res = await request('/api/talents?page=2&limit=10')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.meta).toEqual({
      page: 2,
      limit: 10,
      total: 45,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    })
  })

  it('handles page beyond total pages gracefully', async () => {
    vi.mocked(listTalents).mockResolvedValue({ rows: [], total: 10 })

    const res = await request('/api/talents?page=5&limit=10')
    expect(res.status).toBe(200)

    const body = await json(res)
    expect(body.data).toEqual([])
    expect(body.meta).toEqual({
      page: 5,
      limit: 10,
      total: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: true,
    })
  })

  it('rejects page=0 with 400 Bad Request', async () => {
    const res = await request('/api/talents?page=0')
    expect(res.status).toBe(400)
  })

  it('rejects page=abc with 400 Bad Request', async () => {
    const res = await request('/api/talents?page=abc')
    expect(res.status).toBe(400)
  })

  it('rejects invalid dk24Status with 400 Bad Request', async () => {
    const res = await request('/api/talents?dk24Status=unknown_status')
    expect(res.status).toBe(400)
  })

  it('rejects invalid openToWork value with 400 Bad Request', async () => {
    const res = await request('/api/talents?openToWork=maybe')
    expect(res.status).toBe(400)
  })

  it('rejects invalid skillMatchMode with 400 Bad Request', async () => {
    const res = await request('/api/talents?skillMatchMode=exact')
    expect(res.status).toBe(400)
  })
})
