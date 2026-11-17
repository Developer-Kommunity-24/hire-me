import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationsPopover from './NotificationsPopover'
import * as notifApi from '@/lib/notifications-api'

vi.mock('@/lib/notifications-api', () => ({
  notificationsQueryKey: ['notifications'],
  fetchNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsPopover />
    </QueryClientProvider>,
  )
}

describe('NotificationsPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(notifApi.fetchNotifications).mockResolvedValue([
      {
        id: 'notif-1',
        type: 'status_changed',
        payload: {
          postingTitle: 'Frontend Engineer',
          companyName: 'Acme Corp',
          status: 'shortlisted',
        },
        readAt: null,
        createdAt: '2026-11-10T12:00:00Z',
      },
    ])
  })

  it('renders trigger button and shows notification items when opened', async () => {
    renderComponent()

    const trigger = screen.getByRole('button', { name: /notifications/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument()
      expect(screen.getByText(/Status updated to shortlisted/i)).toBeInTheDocument()
    })
  })

  it('allows marking notification as read', async () => {
    vi.mocked(notifApi.markNotificationRead).mockResolvedValue({
      id: 'notif-1',
      type: 'status_changed',
      payload: {},
      readAt: '2026-11-10T12:05:00Z',
      createdAt: '2026-11-10T12:00:00Z',
    })

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => {
      expect(screen.getByTitle('Mark as read')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTitle('Mark as read'))

    await waitFor(() => {
      expect(notifApi.markNotificationRead).toHaveBeenCalledWith('notif-1')
    })
  })
})
