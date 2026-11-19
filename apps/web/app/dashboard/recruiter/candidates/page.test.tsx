import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CandidatesPage from './page'
import * as talentsApi from '@/lib/talents-api'
import * as postingsApi from '@/lib/postings-api'
import * as recruiterApi from '@/lib/recruiter-api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/recruiter/candidates',
  useSearchParams: () => ({
    get: (key: string) => (key === 'skill' ? null : null),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockTalentsResponse: talentsApi.TalentSearchResponse = {
  data: [
    {
      id: 'student-1',
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      headline: 'Full Stack Engineer & Open Source Contributor',
      bio: 'Building web applications with Next.js and Go. Passionate about system design.',
      gradYear: 2025,
      openToWork: true,
      dk24Status: 'verified',
      skills: ['React', 'TypeScript', 'Go', 'PostgreSQL'],
      degree: 'B.Tech Computer Science',
      school: 'DK24 Institute of Tech',
      githubUrl: 'https://github.com/aarav',
      linkedinUrl: 'https://linkedin.com/in/aarav',
      resumeUrl: 'https://resume.example.com/aarav.pdf',
      projects: [
        {
          id: 'proj-1',
          title: 'Distributed KV Store',
          description: 'A Raft-consensus key-value database in Go',
          skillsUsed: ['Go', 'gRPC', 'Raft'],
          liveUrl: 'https://kvstore.example.com',
          githubUrl: 'https://github.com/aarav/kvstore',
        },
      ],
    },
    {
      id: 'student-2',
      fullName: 'Bhavna Patel',
      email: 'bhavna@example.com',
      headline: 'Machine Learning & Python Developer',
      bio: 'Specializing in computer vision models and FastAPI microservices.',
      gradYear: 2026,
      openToWork: false,
      dk24Status: 'none',
      skills: ['Python', 'Docker', 'Machine Learning', 'FastAPI'],
      degree: 'B.E Information Science',
      school: 'State University',
      githubUrl: 'https://github.com/bhavna',
      linkedinUrl: 'https://linkedin.com/in/bhavna',
      resumeUrl: null,
      projects: [],
    },
  ],
  meta: {
    page: 1,
    limit: 12,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
}

const mockPostings: postingsApi.JobPostingItem[] = [
  {
    id: 'job-1',
    title: 'Frontend Engineer',
    description: 'React position',
    stack: ['React', 'TypeScript'],
    employmentType: 'full_time',
    workArrangement: 'remote',
    location: 'Remote',
    status: 'active',
    deadline: '2026-12-31',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
    applicants: 15,
    inReview: 5,
    interviewing: 2,
  },
]

const mockProfile: recruiterApi.RecruiterProfile = {
  id: 'rec-1',
  userId: 'usr-1',
  companyName: 'TechCorp India',
  companyMail: 'priya@techcorp.com',
  companyUrl: 'https://techcorp.com',
  headquartersLocation: 'Bangalore, India',
  createdAt: '2026-01-01T00:00:00Z',
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <CandidatesPage />
    </QueryClientProvider>,
  )
}

describe('CandidatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(talentsApi, 'searchTalents').mockResolvedValue(mockTalentsResponse)
    vi.spyOn(postingsApi, 'fetchMyPostings').mockResolvedValue(mockPostings)
    vi.spyOn(recruiterApi, 'fetchMyRecruiterProfile').mockResolvedValue(mockProfile)
  })

  it('renders directory title, candidate cards, and search input', async () => {
    renderComponent()

    expect(screen.getByText('Candidate Directory')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search candidates by name/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
      expect(screen.getByText('Bhavna Patel')).toBeInTheDocument()
    })

    expect(screen.getByText('Full Stack Engineer & Open Source Contributor')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('allows typing in search input to filter candidates', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search candidates by name/i)
    fireEvent.change(searchInput, { target: { value: 'React' } })

    await waitFor(() => {
      expect(talentsApi.searchTalents).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'React',
        }),
      )
    })
  })

  it('opens candidate profile modal when clicking View Profile', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    })

    const viewProfileButtons = screen.getAllByRole('button', { name: /View Profile/i })
    expect(viewProfileButtons[0]).toBeDefined()
    fireEvent.click(viewProfileButtons[0]!)

    await waitFor(() => {
      expect(screen.getByText('Distributed KV Store')).toBeInTheDocument()
      expect(screen.getByText(/A Raft-consensus key-value database in Go/i)).toBeInTheDocument()
    })
  })

  it('shows candidate email in View Profile modal and provides direct email links', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    })

    const viewProfileButtons = screen.getAllByRole('button', { name: /View Profile/i })
    expect(viewProfileButtons[0]).toBeDefined()
    fireEvent.click(viewProfileButtons[0]!)

    await waitFor(() => {
      expect(screen.getByText('aarav@example.com')).toBeInTheDocument()
    })

    const mailLinks = screen.getAllByRole('link', { name: /Mail|Send Email/i })
    expect(mailLinks.length).toBeGreaterThan(0)
    expect(mailLinks[0]).toHaveAttribute('href', 'mailto:aarav@example.com')
  })
})
