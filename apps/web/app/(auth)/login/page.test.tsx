import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import LoginPage from './page'

// ==========================================
// MOCKS
// ==========================================

const { socialMock, pushMock, replaceMock } = vi.hoisted(() => ({
  socialMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    signIn: { social: socialMock },
    useSession: () => ({ data: null, isPending: false }),
  },
}))

// The illustration is ~1000 lines of animated SVG and irrelevant here.
vi.mock('./CharactersScene', () => ({
  CharactersScene: () => <div data-testid="characters-scene" />,
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>)
}

// ==========================================
// TESTS
// ==========================================

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    socialMock.mockResolvedValue({ error: null })
  })

  it('renders the Google and email options', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('starts the Google handshake and returns to role selection', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    await waitFor(() => {
      expect(socialMock).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/role-select',
      })
    })
  })

  it('shows a redirect notice while the handshake starts', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    expect(await screen.findByText(/taking you to google/i)).toBeInTheDocument()
  })

  it('surfaces a failure to start the handshake', async () => {
    socialMock.mockResolvedValue({ error: { message: 'Provider unavailable' } })

    renderWithProviders(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Provider unavailable')
  })

  it('redirects directly to dashboard when user already has an account', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exists: true,
        hasAccount: true,
        dashboardUrl: '/dashboard/recruiter',
      }),
    } as Response)

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'hr@byteforge.io' } })
    fireEvent.click(screen.getByRole('button', { name: /continue with email/i }))

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard/recruiter')
    })
  })

  it('shows error when entered email has no account in sign in mode', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: false }),
    } as Response)

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unknown@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /continue with email/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/account not found/i)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('validates email format with Zod schema', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } })
    fireEvent.click(screen.getByRole('button', { name: /continue with email/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /please enter a valid email address/i,
    )
  })
})
