import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Database } from '@repo/db'

vi.mock('../controllers/notifications.controller.js', () => ({
  createNotification: vi.fn(),
  sendEmail: vi.fn(),
}))

import { updateApplicationStatus } from '../controllers/applications.controller.js'
import { createNotification, sendEmail } from '../controllers/notifications.controller.js'

describe('updateApplicationStatus notifications and email wiring', () => {
  const applicationId = '11111111-1111-4111-8111-111111111111'
  const recruiterId = '22222222-2222-4222-8222-222222222222'
  const studentId = '33333333-3333-4333-8333-333333333333'
  const postingId = '44444444-4444-4444-8444-444444444444'

  const mockRow = {
    id: applicationId,
    status: 'applied' as const,
    studentId,
    studentEmail: 'student@example.com',
    postingId,
    postingTitle: 'Frontend Engineer',
    companyName: 'Acme Corp',
  }

  const updatedApplication = {
    id: applicationId,
    postingId,
    studentId,
    status: 'shortlisted' as const,
    appliedAt: new Date(),
    updatedAt: new Date(),
  }

  function createMockDb(
    rowResult: unknown[] = [mockRow],
    updateResult: unknown[] = [updatedApplication],
  ) {
    const selectQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(rowResult),
    }

    const updateQuery = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(updateResult),
    }

    return {
      select: vi.fn().mockReturnValue(selectQuery),
      update: vi.fn().mockReturnValue(updateQuery),
    } as unknown as Database
  }

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM_EMAIL
  })

  it('triggers createNotification and sendEmail on status change', async () => {
    const mockDb = createMockDb()
    vi.mocked(createNotification).mockResolvedValue({ id: 'notif-1' } as never)
    vi.mocked(sendEmail).mockResolvedValue({
      success: true,
      id: 'email-1',
      recipient: 'student@example.com',
      subject: 'Application Status Update',
    })

    const result = await updateApplicationStatus(
      mockDb,
      recruiterId,
      applicationId,
      'shortlisted',
      {
        apiKey: 'test-api-key',
        fromEmail: 'onboarding@resend.dev',
      },
    )

    expect(result).toEqual({ ok: true, data: updatedApplication })

    expect(createNotification).toHaveBeenCalledTimes(1)
    expect(createNotification).toHaveBeenCalledWith(mockDb, {
      userId: studentId,
      type: 'status_changed',
      payload: {
        postingId,
        postingTitle: 'Frontend Engineer',
        company: 'Acme Corp',
        newStatus: 'shortlisted',
      },
    })

    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(
      'test-api-key',
      'onboarding@resend.dev',
      'student@example.com',
      'Frontend Engineer',
      'Acme Corp',
      'shortlisted',
    )
  })

  it('falls back to environment variables when emailOptions are not passed', async () => {
    process.env.RESEND_API_KEY = 'env-resend-key'
    process.env.RESEND_FROM_EMAIL = 'notifications@hireme.dev'

    const mockDb = createMockDb()
    vi.mocked(createNotification).mockResolvedValue({ id: 'notif-1' } as never)
    vi.mocked(sendEmail).mockResolvedValue({
      success: true,
      id: 'email-1',
      recipient: 'student@example.com',
      subject: 'Application Status Update',
    })

    const result = await updateApplicationStatus(mockDb, recruiterId, applicationId, 'shortlisted')

    expect(result.ok).toBe(true)
    expect(sendEmail).toHaveBeenCalledWith(
      'env-resend-key',
      'notifications@hireme.dev',
      'student@example.com',
      'Frontend Engineer',
      'Acme Corp',
      'shortlisted',
    )
  })

  it('does not fail status update if createNotification or sendEmail throws', async () => {
    const mockDb = createMockDb()
    vi.mocked(createNotification).mockRejectedValue(new Error('Notification DB failure'))
    vi.mocked(sendEmail).mockRejectedValue(new Error('Resend network timeout'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await updateApplicationStatus(
      mockDb,
      recruiterId,
      applicationId,
      'shortlisted',
      { apiKey: 'key', fromEmail: 'from@resend.dev' },
    )

    expect(result).toEqual({ ok: true, data: updatedApplication })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create notification', expect.any(Error))
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send status update email',
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })

  it('does not trigger notifications or email if status transition is invalid', async () => {
    const mockDb = createMockDb([{ ...mockRow, status: 'rejected' }])

    const result = await updateApplicationStatus(mockDb, recruiterId, applicationId, 'under_review')

    expect(result).toEqual({
      ok: false,
      error: 'invalid_transition',
      from: 'rejected',
    })
    expect(createNotification).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('does not trigger notifications or email if application is not found', async () => {
    const mockDb = createMockDb([])

    const result = await updateApplicationStatus(mockDb, recruiterId, applicationId, 'shortlisted')

    expect(result).toEqual({ ok: false, error: 'not_found' })
    expect(createNotification).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
