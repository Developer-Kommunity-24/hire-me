import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Context, Next } from 'hono'

const DATABASE_URL = 'postgresql://user:pass@db.test/hireme'
const SERVICE_KEY = 'secret-test-service-key-123'

process.env.DATABASE_URL = DATABASE_URL
process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/api/v1/projects/test-project'
process.env.INTERNAL_SERVICE_KEY = SERVICE_KEY

// ==========================================
// AUTH MOCK
// ==========================================
const { authUser } = vi.hoisted(() => ({
  authUser: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
  },
}))

vi.mock('../middleware/auth.ts', () => ({
  requireAuth: async (c: Context, next: Next) => {
    const authHeader = c.req.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('authUser', authUser)
    await next()
  },
}))

// ==========================================
// CONTROLLER MOCKS
// ==========================================
vi.mock('../controllers/notifications.controller.ts', () => ({
  listNotifications: vi.fn(),
  createNotification: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  sendEmail: vi.fn(),
}))

import { app } from '../app.js'
import {
  listNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendEmail,
} from '../controllers/notifications.controller.js'

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.INTERNAL_SERVICE_KEY = SERVICE_KEY
  })

  // ==========================================
  // SERVICE-TO-SERVICE: POST /send-email
  // ==========================================
  describe('POST /api/notifications/send-email', () => {
    const validPayload = {
      studentEmail: 'student@example.com',
      postingTitle: 'Frontend Engineer',
      companyName: 'Acme Corp',
      status: 'shortlisted',
    }

    it('401s when x-service-key header is missing', async () => {
      const res = await app.request('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(401)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('401s when x-service-key header is incorrect', async () => {
      const res = await app.request('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': 'wrong-key',
        },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(401)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('500s when INTERNAL_SERVICE_KEY is not configured on server', async () => {
      delete process.env.INTERNAL_SERVICE_KEY

      const res = await app.request('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': SERVICE_KEY,
        },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(500)
    })

    it('validates request body fields (400 on invalid email)', async () => {
      const res = await app.request('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': SERVICE_KEY,
        },
        body: JSON.stringify({ ...validPayload, studentEmail: 'not-an-email' }),
      })

      expect(res.status).toBe(400)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('sends email successfully with valid service key and body', async () => {
      vi.mocked(sendEmail).mockResolvedValue({
        success: true,
        simulated: true,
        recipient: 'student@example.com',
        subject: 'Application Status Update',
      })

      const res = await app.request('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': SERVICE_KEY,
        },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(200)
      expect(sendEmail).toHaveBeenCalledWith(
        undefined,
        'student@example.com',
        'Frontend Engineer',
        'Acme Corp',
        'shortlisted',
      )
    })
  })

  // ==========================================
  // SERVICE-TO-SERVICE: POST / (create notification)
  // ==========================================
  describe('POST /api/notifications', () => {
    const validNotification = {
      userId: '11111111-1111-4111-8111-111111111111',
      type: 'status_changed',
      payload: { status: 'shortlisted' },
    }

    it('401s when x-service-key header is missing', async () => {
      const res = await app.request('/api/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validNotification),
      })

      expect(res.status).toBe(401)
      expect(createNotification).not.toHaveBeenCalled()
    })

    it('400s on invalid notification type enum', async () => {
      const res = await app.request('/api/notifications', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': SERVICE_KEY,
        },
        body: JSON.stringify({ ...validNotification, type: 'invalid_type' }),
      })

      expect(res.status).toBe(400)
    })

    it('creates notification successfully with valid service key', async () => {
      vi.mocked(createNotification).mockResolvedValue({
        id: '22222222-2222-4222-8222-222222222222',
        userId: validNotification.userId,
        type: 'status_changed',
        payload: validNotification.payload,
        readAt: null,
        createdAt: new Date(),
      })

      const res = await app.request('/api/notifications', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': SERVICE_KEY,
        },
        body: JSON.stringify(validNotification),
      })

      expect(res.status).toBe(201)
      expect(createNotification).toHaveBeenCalledWith(expect.anything(), validNotification)
    })
  })

  // ==========================================
  // USER-FACING: GET /api/notifications
  // ==========================================
  describe('GET /api/notifications', () => {
    it('401s without user Bearer token', async () => {
      const res = await app.request('/api/notifications')
      expect(res.status).toBe(401)
    })

    it('returns notifications for authenticated user', async () => {
      const mockList = [
        {
          id: '22222222-2222-4222-8222-222222222222',
          userId: authUser.id,
          type: 'status_changed' as const,
          payload: {},
          readAt: null,
          createdAt: new Date(),
        },
      ]
      vi.mocked(listNotifications).mockResolvedValue(mockList)

      const res = await app.request('/api/notifications', {
        headers: { authorization: 'Bearer test-token' },
      })

      expect(res.status).toBe(200)
      expect(listNotifications).toHaveBeenCalledWith(expect.anything(), authUser.id)
    })
  })

  // ==========================================
  // USER-FACING: PATCH /api/notifications/:id/read
  // ==========================================
  describe('PATCH /api/notifications/:id/read', () => {
    it('401s without user Bearer token', async () => {
      const res = await app.request(
        '/api/notifications/22222222-2222-4222-8222-222222222222/read',
        {
          method: 'PATCH',
        },
      )
      expect(res.status).toBe(401)
    })

    it('404s for invalid UUID without calling controller', async () => {
      const res = await app.request('/api/notifications/invalid-uuid/read', {
        method: 'PATCH',
        headers: { authorization: 'Bearer test-token' },
      })
      expect(res.status).toBe(404)
      expect(markNotificationAsRead).not.toHaveBeenCalled()
    })

    it('marks notification as read for authenticated user', async () => {
      vi.mocked(markNotificationAsRead).mockResolvedValue({
        id: '22222222-2222-4222-8222-222222222222',
        userId: authUser.id,
        type: 'status_changed',
        payload: {},
        readAt: new Date(),
        createdAt: new Date(),
      })

      const res = await app.request(
        '/api/notifications/22222222-2222-4222-8222-222222222222/read',
        {
          method: 'PATCH',
          headers: { authorization: 'Bearer test-token' },
        },
      )

      expect(res.status).toBe(200)
      expect(markNotificationAsRead).toHaveBeenCalledWith(
        expect.anything(),
        authUser.id,
        '22222222-2222-4222-8222-222222222222',
      )
    })
  })

  // ==========================================
  // USER-FACING: POST /api/notifications/read-all
  // ==========================================
  describe('POST /api/notifications/read-all', () => {
    it('401s without user Bearer token', async () => {
      const res = await app.request('/api/notifications/read-all', {
        method: 'POST',
      })
      expect(res.status).toBe(401)
    })

    it('marks all notifications as read for authenticated user', async () => {
      vi.mocked(markAllNotificationsAsRead).mockResolvedValue([])

      const res = await app.request('/api/notifications/read-all', {
        method: 'POST',
        headers: { authorization: 'Bearer test-token' },
      })

      expect(res.status).toBe(200)
      expect(markAllNotificationsAsRead).toHaveBeenCalledWith(expect.anything(), authUser.id)
    })
  })
})
