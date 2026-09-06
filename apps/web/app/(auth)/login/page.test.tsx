import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import LoginPage from './page'

// ==========================================
// MOCKS
// ==========================================

const { socialMock } = vi.hoisted(() => ({ socialMock: vi.fn() }))

vi.mock('@/lib/auth/client', () => ({
  authClient: { signIn: { social: socialMock } },
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

  it('does not fake a session when the email form is submitted', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /continue with email/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/isn't available yet/i)
    expect(socialMock).not.toHaveBeenCalled()
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
