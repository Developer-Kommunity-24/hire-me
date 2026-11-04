import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { requireStudentRole } from '../middleware/student.js'
import type { StudentVariables } from '../middleware/student.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import type { Database } from '@repo/db'

describe('requireStudentRole middleware', () => {
  const dummyAuthUser = {
    id: '11111111-2222-3333-4444-555555555555',
    email: 'student@example.com',
    name: 'Student Name',
  }

  function createApp(mockDb?: Database | null, authUser = dummyAuthUser) {
    const testApp = new Hono<{
      Variables: DbVariables & AuthVariables & StudentVariables
    }>()

    testApp.use('*', async (c, next) => {
      if (mockDb !== null && mockDb !== undefined) {
        c.set('db', mockDb)
      }
      c.set('authUser', authUser)
      await next()
    })

    testApp.use('*', requireStudentRole())

    testApp.get('/test', (c) => c.json({ user: c.var.user }))

    return testApp
  }

  it('500s when database is not available on context', async () => {
    const app = createApp(null)
    const res = await app.request('/test')

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      error: 'Internal Server Error',
      message: 'Database not available.',
    })
  })

  it('401s when user record does not exist in database', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      error: 'Unauthorized',
      message: 'User record not found.',
    })
  })

  it('403s when user exists but does not have student role', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockResolvedValue([
              {
                id: dummyAuthUser.id,
                fullName: dummyAuthUser.name,
                email: dummyAuthUser.email,
                roles: ['recruiter'],
              },
            ]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      error: 'Forbidden',
      message: 'Only students can access this resource.',
    })
  })

  it('allows access and sets context user when user has student role', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockResolvedValue([
              {
                id: dummyAuthUser.id,
                fullName: dummyAuthUser.name,
                email: dummyAuthUser.email,
                roles: ['student'],
              },
            ]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      user: {
        id: dummyAuthUser.id,
        fullName: dummyAuthUser.name,
        email: dummyAuthUser.email,
        role: 'student',
      },
    })
  })

  it('allows access when user has multiple roles including student', async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: vi.fn().mockResolvedValue([
              {
                id: dummyAuthUser.id,
                fullName: dummyAuthUser.name,
                email: dummyAuthUser.email,
                roles: ['student', 'club_admin'],
              },
            ]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      user: {
        id: dummyAuthUser.id,
        fullName: dummyAuthUser.name,
        email: dummyAuthUser.email,
        role: 'student',
      },
    })
  })
})
