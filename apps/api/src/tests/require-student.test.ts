import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { requireStudent } from '../middleware/requireStudent.js'
import type { StudentVariables } from '../middleware/requireStudent.js'
import type { AuthVariables } from '../middleware/auth.js'
import type { DbVariables } from '../middleware/db.js'
import type { Database } from '@repo/db'

describe('requireStudent middleware', () => {
  const dummyAuthUser = {
    id: '11111111-2222-3333-4444-555555555555',
    email: 'student@example.com',
    name: 'Student Name',
  }

  function createApp(mockDb: Database, authUser = dummyAuthUser) {
    const testApp = new Hono<{
      Variables: DbVariables & AuthVariables & StudentVariables
    }>()

    testApp.use('*', async (c, next) => {
      c.set('db', mockDb)
      c.set('authUser', authUser)
      await next()
    })

    testApp.use('*', requireStudent)

    testApp.get('/test', (c) => c.json({ studentId: c.var.studentId }))

    return testApp
  }

  it('allows access when user already has a student profile', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: dummyAuthUser.id }]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ studentId: dummyAuthUser.id })
  })

  it('auto-initializes student profile when user has student role', async () => {
    let callCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            limit: vi.fn().mockImplementation(async () => {
              callCount++
              if (callCount === 1) {
                // First call: check studentProfiles -> returns empty
                return []
              }
              // Second call: check users -> returns user with student role
              return [{ roles: ['student'] }]
            }),
          })),
        })),
      })),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ userId: dummyAuthUser.id }]),
          }),
        }),
      }),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ studentId: dummyAuthUser.id })
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })

  it('403s when user does not have student profile and lacks student role', async () => {
    let callCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            limit: vi.fn().mockImplementation(async () => {
              callCount++
              if (callCount === 1) {
                // First call: check studentProfiles -> returns empty
                return []
              }
              // Second call: check users -> returns recruiter role only
              return [{ roles: ['recruiter'] }]
            }),
          })),
        })),
      })),
    } as unknown as Database

    const app = createApp(mockDb)
    const res = await app.request('/test')

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      error: 'Student profile required to apply to postings',
    })
  })
})
