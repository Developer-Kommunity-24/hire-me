import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { Providers } from '@/app/providers'
import RoleSelectPage from './page'

// ==========================================
// MOCKS
// ==========================================

const { apiFetchMock, pushMock, replaceMock, sessionState } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  sessionState: {
    user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' } as unknown,
  },
}))

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    useSession: () => ({
      data: sessionState.user ? { user: sessionState.user } : null,
      isPending: false,
    }),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

// `ApiError` stays real so the page's `instanceof` checks behave as they do in
// the browser; only the network call is replaced.
vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>()
  return { ...actual, apiFetch: apiFetchMock }
})

function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>)
}

// ==========================================
// HELPERS
// ==========================================

function clickRole(role: 'student' | 'recruiter') {
  const label = role === 'student' ? /i'm a student/i : /i'm a recruiter/i
  fireEvent.click(screen.getByRole('button', { name: label }))
}

// ==========================================
// TESTS
// ==========================================

describe('RoleSelectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetchMock.mockResolvedValue({ user: { roles: ['student'], hasAccount: false } })
  })

  it('redirects directly to dashboard when user already has an account', async () => {
    apiFetchMock.mockResolvedValue({
      user: {
        roles: ['recruiter'],
        hasAccount: true,
        dashboardUrl: '/dashboard/recruiter',
      },
    })

    renderWithProviders(<RoleSelectPage />)

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard/recruiter')
    })
  })

  it('persists the student role before navigating', async () => {
    renderWithProviders(<RoleSelectPage />)

    clickRole('student')

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/users/me/role', {
        method: 'PATCH',
        body: { role: 'student' },
      })
    })
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/student'))
  })

  it('persists the recruiter role before navigating', async () => {
    renderWithProviders(<RoleSelectPage />)

    clickRole('recruiter')

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/users/me/role', {
        method: 'PATCH',
        body: { role: 'recruiter' },
      })
    })
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/recruiter'))
  })

  it('sends an expired session back to sign in', async () => {
    apiFetchMock.mockRejectedValue(new ApiError(401, 'Your session has expired.'))

    renderWithProviders(<RoleSelectPage />)
    clickRole('student')

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/login'))
    expect(pushMock).not.toHaveBeenCalledWith('/student')
  })

  it('reports a failed save and stays put', async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500, 'Something went wrong'))

    renderWithProviders(<RoleSelectPage />)
    clickRole('student')

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('reports a network failure in plain language', async () => {
    apiFetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    renderWithProviders(<RoleSelectPage />)
    clickRole('student')

    expect(await screen.findByRole('alert')).toHaveTextContent(/check your connection/i)
    expect(pushMock).not.toHaveBeenCalled()
  })
})
