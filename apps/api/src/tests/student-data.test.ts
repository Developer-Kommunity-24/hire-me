import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context, Next } from 'hono'

const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    if (!c.req.header('Authorization')) return c.json({ error: 'Unauthorized' }, 401)
    c.set('authUser', authUser)
    await next()
  },
}))

vi.mock('../controllers/student-data.controller.ts', () => ({
  listSkills: vi.fn(),
  createSkill: vi.fn(),
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
  listProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  listExperience: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
  listAchievements: vi.fn(),
  createAchievement: vi.fn(),
  updateAchievement: vi.fn(),
  deleteAchievement: vi.fn(),
}))

import { app } from '../app.js'
import * as controller from '../controllers/student-data.controller.js'

const DATABASE_URL = 'postgresql://user:password@db.test/hireme'
process.env.DATABASE_URL = DATABASE_URL

const id = '22222222-2222-4222-8222-222222222222'

function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Authorization', 'Bearer test-token')
  return app.request(path, { ...init, headers }, { DATABASE_URL })
}

describe('Student data API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(controller.listSkills).mockResolvedValue([])
    vi.mocked(controller.listProjects).mockResolvedValue([])
    vi.mocked(controller.listExperience).mockResolvedValue([])
    vi.mocked(controller.listAchievements).mockResolvedValue([])
    vi.mocked(controller.deleteSkill).mockResolvedValue(true)
    vi.mocked(controller.deleteProject).mockResolvedValue(true)
    vi.mocked(controller.deleteExperience).mockResolvedValue(true)
    vi.mocked(controller.deleteAchievement).mockResolvedValue(true)
  })

  it('requires authentication', async () => {
    const response = await app.request('/api/student-data/skills')
    expect(response.status).toBe(401)
  })

  it('lists skills for the authenticated student', async () => {
    await request('/api/student-data/skills')
    expect(controller.listSkills).toHaveBeenCalledWith(expect.anything(), authUser.id)
  })

  it('lists all student resources for the authenticated student', async () => {
    await request('/api/student-data/projects')
    await request('/api/student-data/experience')
    await request('/api/student-data/achievements')

    expect(controller.listProjects).toHaveBeenCalledWith(expect.anything(), authUser.id)
    expect(controller.listExperience).toHaveBeenCalledWith(expect.anything(), authUser.id)
    expect(controller.listAchievements).toHaveBeenCalledWith(expect.anything(), authUser.id)
  })

  it('creates a trimmed skill for the authenticated student', async () => {
    vi.mocked(controller.createSkill).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, skill: 'TypeScript' },
    })
    const response = await request('/api/student-data/skills', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ skill: ' TypeScript ' }),
    })
    expect(response.status).toBe(201)
    expect(controller.createSkill).toHaveBeenCalledWith(expect.anything(), authUser.id, {
      skill: 'TypeScript',
    })
  })

  it('returns 409 for duplicate skills', async () => {
    vi.mocked(controller.createSkill).mockResolvedValue({ ok: false, error: 'duplicate' })
    const response = await request('/api/student-data/skills', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ skill: 'TypeScript' }),
    })
    expect(response.status).toBe(409)
  })

  it('returns 404 when the authenticated user has no student profile', async () => {
    vi.mocked(controller.createSkill).mockResolvedValue({
      ok: false,
      error: 'student_profile_missing',
    })
    vi.mocked(controller.createProject).mockResolvedValue({
      ok: false,
      error: 'student_profile_missing',
    })
    vi.mocked(controller.createExperience).mockResolvedValue({
      ok: false,
      error: 'student_profile_missing',
    })
    vi.mocked(controller.createAchievement).mockResolvedValue({
      ok: false,
      error: 'student_profile_missing',
    })

    const headers = { 'content-type': 'application/json' }
    expect(
      (
        await request('/api/student-data/skills', {
          method: 'POST',
          headers,
          body: JSON.stringify({ skill: 'TypeScript' }),
        })
      ).status,
    ).toBe(404)
    expect(
      (
        await request('/api/student-data/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'Project' }),
        })
      ).status,
    ).toBe(404)
    expect(
      (
        await request('/api/student-data/experience', {
          method: 'POST',
          headers,
          body: JSON.stringify({ companyName: 'Company', role: 'Engineer' }),
        })
      ).status,
    ).toBe(404)
    expect(
      (
        await request('/api/student-data/achievements', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'award', title: 'Award' }),
        })
      ).status,
    ).toBe(404)
  })

  it('validates required fields, dates, URLs, and achievement categories', async () => {
    const headers = { 'content-type': 'application/json' }
    expect(
      (
        await request('/api/student-data/skills', {
          method: 'POST',
          headers,
          body: JSON.stringify({ skill: '   ' }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'x', liveUrl: 'bad' }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'x', displayOrder: -1 }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/experience', {
          method: 'POST',
          headers,
          body: JSON.stringify({ role: 'y' }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/experience', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            companyName: 'x',
            role: 'y',
            startDate: '2025-02-01',
            endDate: '2025-01-01',
          }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/achievements', {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/achievements', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'medal', title: 'x' }),
        })
      ).status,
    ).toBe(400)
    expect(
      (
        await request('/api/student-data/achievements', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'award', title: 'x', date: '2025-99-99' }),
        })
      ).status,
    ).toBe(400)
  })

  it('scopes updates and deletes by authenticated ownership', async () => {
    vi.mocked(controller.updateProject).mockResolvedValue({ ok: false, error: 'not_found' })
    const response = await request(`/api/student-data/projects/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    })
    expect(response.status).toBe(404)
    expect(controller.updateProject).toHaveBeenCalledWith(expect.anything(), authUser.id, id, {
      title: 'Updated',
    })

    vi.mocked(controller.deleteAchievement).mockResolvedValue(false)
    const deleteResponse = await request(`/api/student-data/achievements/${id}`, {
      method: 'DELETE',
    })
    expect(deleteResponse.status).toBe(404)
    expect(controller.deleteAchievement).toHaveBeenCalledWith(expect.anything(), authUser.id, id)
  })

  it('returns 400 when a partial experience update creates an invalid date range', async () => {
    vi.mocked(controller.updateExperience).mockResolvedValue({
      ok: false,
      error: 'invalid_date_range',
    })
    const response = await request(`/api/student-data/experience/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endDate: '2024-01-01' }),
    })
    expect(response.status).toBe(400)
  })

  it('supports successful CRUD operations for projects, experience, and achievements', async () => {
    vi.mocked(controller.createSkill).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, skill: 'TypeScript' },
    })
    vi.mocked(controller.createProject).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, title: 'Project' },
    } as never)
    vi.mocked(controller.createExperience).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, companyName: 'Company', role: 'Engineer' },
    } as never)
    vi.mocked(controller.createAchievement).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, type: 'award', title: 'Award' },
    } as never)
    vi.mocked(controller.updateSkill).mockResolvedValue({
      ok: true,
      data: { id, studentId: authUser.id, skill: 'Go' },
    })
    vi.mocked(controller.updateProject).mockResolvedValue({ ok: true, data: { id } } as never)
    vi.mocked(controller.updateExperience).mockResolvedValue({ ok: true, data: { id } } as never)
    vi.mocked(controller.updateAchievement).mockResolvedValue({ ok: true, data: { id } } as never)

    const headers = { 'content-type': 'application/json' }
    expect(
      (
        await request('/api/student-data/skills', {
          method: 'POST',
          headers,
          body: JSON.stringify({ skill: 'TypeScript' }),
        })
      ).status,
    ).toBe(201)
    expect(
      (
        await request('/api/student-data/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: 'Project' }),
        })
      ).status,
    ).toBe(201)
    expect(
      (
        await request('/api/student-data/experience', {
          method: 'POST',
          headers,
          body: JSON.stringify({ companyName: 'Company', role: 'Engineer' }),
        })
      ).status,
    ).toBe(201)
    expect(
      (
        await request('/api/student-data/achievements', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'award', title: 'Award' }),
        })
      ).status,
    ).toBe(201)
    expect(
      (
        await request(`/api/student-data/skills/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ skill: 'Go' }),
        })
      ).status,
    ).toBe(200)
    expect(
      (
        await request(`/api/student-data/projects/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ title: 'Updated' }),
        })
      ).status,
    ).toBe(200)
    expect(
      (
        await request(`/api/student-data/experience/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ role: 'Senior Engineer' }),
        })
      ).status,
    ).toBe(200)
    expect(
      (
        await request(`/api/student-data/achievements/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ title: 'Updated' }),
        })
      ).status,
    ).toBe(200)
    expect((await request(`/api/student-data/skills/${id}`, { method: 'DELETE' })).status).toBe(200)
    expect((await request(`/api/student-data/projects/${id}`, { method: 'DELETE' })).status).toBe(
      200,
    )
    expect((await request(`/api/student-data/experience/${id}`, { method: 'DELETE' })).status).toBe(
      200,
    )
    expect(
      (await request(`/api/student-data/achievements/${id}`, { method: 'DELETE' })).status,
    ).toBe(200)
  })
})
