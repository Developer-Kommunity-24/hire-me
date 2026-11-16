import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AuthUser } from '@/lib/hooks/use-auth'
import { ApplyButton } from './ApplyButton'
import type { Job } from '../../types/job'

// ==========================================
// MOCKS
// ==========================================
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockAuthUser: AuthUser = {
  id: 'student-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  roles: ['student'],
}

const mockUseAuth = vi.fn<() => { user: AuthUser | null; isLoading: boolean }>(() => ({
  user: mockAuthUser,
  isLoading: false,
}))

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/applications-api', () => ({
  applyToPosting: vi.fn(),
  listMyApplications: vi.fn().mockResolvedValue([]),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/lib/utils/confetti', () => ({
  showConfetti: vi.fn(),
}))

import { applyToPosting, listMyApplications } from '@/lib/applications-api'
import { toast } from 'sonner'
import { showConfetti } from '@/lib/utils/confetti'

const sampleJob: Job = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Full Stack Engineer',
  company: 'TechCorp',
  location: 'Bangalore, India',
  salaryRange: '₹12-18 LPA',
  category: 'Engineering',
  type: 'Full-time',
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ApplyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockAuthUser,
      isLoading: false,
    })
    vi.mocked(listMyApplications).mockResolvedValue([])
  })

  it('renders "Apply Now" button when student has not applied', async () => {
    renderWithClient(<ApplyButton job={sampleJob} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
    })
  })

  it('redirects to login when unauthenticated user clicks Apply Now', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    renderWithClient(<ApplyButton job={sampleJob} />)

    const btn = await screen.findByRole('button', { name: /apply now/i })
    fireEvent.click(btn)

    expect(mockPush).toHaveBeenCalledWith(`/login?callbackUrl=/jobs/${sampleJob.id}`)
  })

  it('shows error toast when non-student user clicks Apply Now', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockAuthUser, roles: ['recruiter'] },
      isLoading: false,
    })

    renderWithClient(<ApplyButton job={sampleJob} />)

    const btn = await screen.findByRole('button', { name: /apply now/i })
    fireEvent.click(btn)

    expect(toast.error).toHaveBeenCalledWith(
      'Only students can apply to jobs. Switch your active role to apply.',
    )
  })

  it('opens confirmation modal and submits application on confirm', async () => {
    vi.mocked(applyToPosting).mockResolvedValue({
      id: 'app-1',
      postingId: sampleJob.id,
      studentId: mockAuthUser.id,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    renderWithClient(<ApplyButton job={sampleJob} />)

    const applyBtn = await screen.findByRole('button', { name: /apply now/i })
    fireEvent.click(applyBtn)

    // Check modal contents
    expect(await screen.findByText(`Apply for ${sampleJob.title}`)).toBeInTheDocument()
    expect(screen.getByText(mockAuthUser.name)).toBeInTheDocument()
    expect(screen.getByText(mockAuthUser.email)).toBeInTheDocument()

    // Click confirm
    const submitBtn = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(applyToPosting).toHaveBeenCalledWith(sampleJob.id)
      expect(showConfetti).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully!')
    })

    // Should transition to applied state
    expect(await screen.findByRole('button', { name: /applied/i })).toBeDisabled()
    expect(screen.getByText('View Status')).toBeInTheDocument()
  })

  it('renders "Applied" state when posting is already in student applications', async () => {
    vi.mocked(listMyApplications).mockResolvedValue([
      {
        id: 'app-existing',
        postingId: sampleJob.id,
        status: 'applied',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posting: {
          title: sampleJob.title,
          status: 'active',
          deadline: null,
          location: sampleJob.location,
          employmentType: 'full_time',
          companyName: 'TechCorp',
        },
      },
    ])

    renderWithClient(<ApplyButton job={sampleJob} />)

    const appliedBtn = await screen.findByRole('button', { name: /applied/i })
    expect(appliedBtn).toBeDisabled()
    expect(screen.getByText('View Status')).toBeInTheDocument()
  })
})
