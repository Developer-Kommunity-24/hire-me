import { apiFetch } from './api-client'

export interface NotificationItem {
  id: string
  type: string
  payload: {
    applicationId?: string
    postingTitle?: string
    companyName?: string
    status?: string
    [key: string]: unknown
  }
  readAt: string | null
  createdAt: string
}

export const notificationsQueryKey = ['notifications'] as const

/**
 * Fetches user notifications ordered newest first (GET /api/notifications).
 */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiFetch<{ data: NotificationItem[] }>('/api/notifications')
  return data
}

/**
 * Marks a single notification as read (PATCH /api/notifications/:id/read).
 */
export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const { data } = await apiFetch<{ data: NotificationItem }>(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    {
      method: 'PATCH',
    },
  )
  return data
}

/**
 * Marks all notifications for the user as read (POST /api/notifications/read-all).
 */
export async function markAllNotificationsRead(): Promise<unknown> {
  const { data } = await apiFetch<{ data: unknown }>('/api/notifications/read-all', {
    method: 'POST',
  })
  return data
}

/**
 * Permanently deletes a notification (DELETE /api/notifications/:id).
 */
export async function deleteNotification(id: string): Promise<void> {
  await apiFetch<{ data: null }>(`/api/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
