import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api-client'
import RecruiterOnboardingPage from './page'

// ==========================================
// MOCKS
// ==========================================

const { apiFetchMock, pushMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
  pushMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>()
  return { ...actual, apiFetch: apiFetchMock }
})

// Mock confetti to avoid canvas errors in test environment
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// ==========================================
// TESTS
// ==========================================

describe('RecruiterOnboardingPage', () => {
  beforeEach(() => {
    apiFetchMock.mockReset()
    // Default successful mock for all tests
    apiFetchMock.mockImplementation((url: string) => {
      if (url === '/api/users/me') {
        return Promise.resolve({ user: { fullName: 'Test User' } })
      }
      if (url === '/api/recruiters/me') {
        return Promise.resolve({ recruiter: null })
      }
      return Promise.resolve({})
    })
  })

  it('loads user data on mount', async () => {
    render(<RecruiterOnboardingPage />)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/users/me')
    })
  })

  it('prefills full name from user data', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for component to render with data
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    const fullNameInput = screen.getByPlaceholderText('e.g. Alex Chen')
    expect(fullNameInput).toHaveValue('Test User')
  })

  it('shows step 1 validation error when required fields are missing', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    // Clear the prefilled name
    const fullNameInput = screen.getByPlaceholderText('e.g. Alex Chen')
    fireEvent.change(fullNameInput, { target: { value: '' } })

    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please fill in your full name and job title/i)).toBeInTheDocument()
    })
  })

  it('saves draft when Save Draft is clicked', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    const saveDraftButton = screen.getByText('Save Draft')
    fireEvent.click(saveDraftButton)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/recruiters/me', {
        method: 'PATCH',
        body: expect.objectContaining({
          fullName: 'Test User',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Draft saved successfully')).toBeInTheDocument()
    })
  })

  it('shows step 2 validation error when required fields are missing', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    // Fill step 1 and proceed
    const jobTitleInput = screen.getByPlaceholderText('e.g. Senior Technical Recruiter')
    fireEvent.change(jobTitleInput, { target: { value: 'Recruiter' } })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Company Details')).toBeInTheDocument()
    })

    // Try to proceed without filling required fields
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please provide your company name and work email/i)).toBeInTheDocument()
    })
  })

  it('navigates through steps when validation passes', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    // Fill step 1
    const jobTitleInput = screen.getByPlaceholderText('e.g. Senior Technical Recruiter')
    fireEvent.change(jobTitleInput, { target: { value: 'Recruiter' } })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Company Details')).toBeInTheDocument()
    })

    // Fill step 2
    const companyNameInput = screen.getByPlaceholderText('e.g. Acme Innovations Inc.')
    fireEvent.change(companyNameInput, { target: { value: 'Acme Inc' } })

    const companyMailInput = screen.getByPlaceholderText('recruiting@company.com')
    fireEvent.change(companyMailInput, { target: { value: 'recruiter@acme.com' } })

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Bio & Review')).toBeInTheDocument()
    })
  })

  it('final submit requires all required fields and sets isComplete', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    // Fill all steps
    const jobTitleInput = screen.getByPlaceholderText('e.g. Senior Technical Recruiter')
    fireEvent.change(jobTitleInput, { target: { value: 'Recruiter' } })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Company Details')).toBeInTheDocument()
    })

    const companyNameInput = screen.getByPlaceholderText('e.g. Acme Innovations Inc.')
    fireEvent.change(companyNameInput, { target: { value: 'Acme Inc' } })

    const companyMailInput = screen.getByPlaceholderText('recruiting@company.com')
    fireEvent.change(companyMailInput, { target: { value: 'recruiter@acme.com' } })

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Bio & Review')).toBeInTheDocument()
    })

    // Complete setup
    const completeButton = screen.getByText('Complete Setup')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/recruiters/me', {
        method: 'PATCH',
        body: expect.objectContaining({
          isComplete: true,
        }),
      })
    })
  })

  it('redirects to login on 401 error', async () => {
    apiFetchMock.mockRejectedValue(new ApiError(401, 'Your session has expired.'))

    render(<RecruiterOnboardingPage />)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error message on API failure', async () => {
    // First call succeeds (load user), second call succeeds (load recruiter), third call fails (save draft)
    apiFetchMock
      .mockResolvedValueOnce({ user: { fullName: 'Test User' } })
      .mockResolvedValueOnce({ recruiter: null })
      .mockRejectedValueOnce(new ApiError(500, 'Something went wrong'))

    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    const saveDraftButton = screen.getByText('Save Draft')
    fireEvent.click(saveDraftButton)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('redirects to landing if profile is already complete', async () => {
    apiFetchMock.mockImplementation((url: string) => {
      if (url === '/api/users/me') {
        return Promise.resolve({ user: { fullName: 'Test User' } })
      }
      if (url === '/api/recruiters/me') {
        return Promise.resolve({ 
          recruiter: { 
            companyName: 'Acme Inc',
            companyMail: 'recruiter@acme.com',
            companyUrl: null,
            headquartersLocation: null,
            jobTitle: 'Recruiter',
            bio: null,
            isComplete: true 
          } 
        })
      }
      return Promise.resolve({})
    })

    render(<RecruiterOnboardingPage />)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/landing')
    })
  })

  it('back button on step 1 goes to role-select', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/role-select')
    })
  })

  it('back button on step 2 goes to step 1', async () => {
    render(<RecruiterOnboardingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalled()
    })

    // Fill step 1 and proceed
    const jobTitleInput = screen.getByPlaceholderText('e.g. Senior Technical Recruiter')
    fireEvent.change(jobTitleInput, { target: { value: 'Recruiter' } })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Company Details')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('About you')).toBeInTheDocument()
    })
  })
})
