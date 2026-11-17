import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecruiterDashboard from './page'
import * as recruiterApi from '@/lib/recruiter-api'
import * as postingsApi from '@/lib/postings-api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/recruiter',
  useSearchParams: () => ({
    get: (key: string) => (key === 'jobId' ? 'all' : null),
  }),
}))

vi.mock('@/lib/recruiter-api', () => ({
  recruiterQueryKeys: {
    profile: ['recruiter', 'profile'],
  },
  fetchMyRecruiterProfile: vi.fn(),
  updateRecruiterProfile: vi.fn(),
  fetchPostingApplicants: vi.fn(),
  updateApplicationStatus: vi.fn(),
}))

vi.mock('@/lib/postings-api', () => ({
  recruiterPostingsQueryKey: ['postings', 'mine'],
  fetchMyPostings: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RecruiterDashboard />
    </QueryClientProvider>,
  )
}

describe('RecruiterDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(recruiterApi.fetchMyRecruiterProfile).mockResolvedValue({
      id: 'recruiter-1',
      userId: 'user-1',
      companyName: 'Acme Innovations',
      companyMail: 'recruiting@acme.com',
      companyUrl: 'https://acme.com',
      headquartersLocation: 'Bengaluru',
    })

    vi.mocked(postingsApi.fetchMyPostings).mockResolvedValue([
      {
        id: 'posting-1',
        title: 'Full-Stack Intern',
        description: 'Internship role',
        stack: ['TypeScript', 'React'],
        status: 'active',
        employmentType: 'internship',
        workArrangement: 'remote',
        location: 'Remote',
        deadline: '2026-12-31',
        createdAt: '2026-11-10T12:00:00Z',
        updatedAt: '2026-11-10T12:00:00Z',
        applicants: 1,
        inReview: 0,
        interviewing: 0,
      },
    ])

    vi.mocked(recruiterApi.fetchPostingApplicants).mockResolvedValue([
      {
        id: 'app-1',
        studentId: 'student-1',
        status: 'applied',
        appliedAt: '2026-11-10T12:00:00Z',
        updatedAt: '2026-11-10T12:00:00Z',
        student: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          headline: 'Full-Stack Developer',
          resumeUrl: 'https://example.com/resume.pdf',
          githubUrl: 'https://github.com/janedoe',
          linkedinUrl: 'https://linkedin.com/in/janedoe',
          gradYear: 2026,
        },
      },
    ])
  })

  it('renders company name, metric cards, and applicants list from the API', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Acme Innovations!/i)).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('Applied for: Full-Stack Intern')).toBeInTheDocument()
    })

    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Total Applicants')).toBeInTheDocument()
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument()
  })

  it('allows advancing an applicant to under_review', async () => {
    vi.mocked(recruiterApi.updateApplicationStatus).mockResolvedValue({
      id: 'app-1',
      status: 'under_review',
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    const reviewButton = screen.getByRole('button', { name: /^review$/i })
    expect(reviewButton).toBeInTheDocument()

    fireEvent.click(reviewButton)

    await waitFor(() => {
      expect(recruiterApi.updateApplicationStatus).toHaveBeenCalledWith('app-1', 'under_review')
    })
  })

  it('allows opening candidate profile details modal', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    const viewProfileButtons = screen.getAllByRole('button', { name: /view profile/i })
    fireEvent.click(viewProfileButtons[0]!)

    await waitFor(() => {
      expect(screen.getByText('Graduation Year: 2026')).toBeInTheDocument()
      expect(screen.getByText('View Resume')).toHaveAttribute(
        'href',
        'https://example.com/resume.pdf',
      )
    })
  })
})
