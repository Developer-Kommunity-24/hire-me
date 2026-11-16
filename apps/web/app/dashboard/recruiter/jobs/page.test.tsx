import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import JobPostingsPage from './page'
import * as postingsApi from '@/lib/postings-api'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard/recruiter/jobs',
}))

const samplePostings: postingsApi.JobPostingItem[] = [
  {
    id: 'post-1',
    title: 'Alpha Frontend Engineer',
    description: 'React developer',
    stack: ['React', 'TypeScript'],
    employmentType: 'full_time',
    workArrangement: 'remote',
    location: 'Remote',
    status: 'active',
    deadline: '2026-12-31',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    applicants: 30,
    inReview: 10,
    interviewing: 5,
  },
  {
    id: 'post-2',
    title: 'Beta Backend Architect',
    description: 'Node developer',
    stack: ['Node.js', 'PostgreSQL'],
    employmentType: 'full_time',
    workArrangement: 'in_person',
    location: 'Seattle, WA',
    status: 'closed',
    deadline: '2026-11-05',
    createdAt: '2026-11-04T10:00:00.000Z',
    updatedAt: '2026-11-04T10:00:00.000Z',
    applicants: 10,
    inReview: 2,
    interviewing: 1,
  },
]

function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>)
}

describe('JobPostingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(postingsApi, 'fetchMyPostings').mockResolvedValue(samplePostings)
  })

  it('renders page header and metric cards', async () => {
    renderWithProviders(<JobPostingsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Job Postings' })).toBeInTheDocument()
    expect(screen.getByText('Total Postings')).toBeInTheDocument()
    expect(screen.getByText('Active Postings')).toBeInTheDocument()

    expect(await screen.findByText('Alpha Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Beta Backend Architect')).toBeInTheDocument()
  })

  it('filters postings by search query', async () => {
    renderWithProviders(<JobPostingsPage />)

    expect(await screen.findByText('Alpha Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Beta Backend Architect')).toBeInTheDocument()

    const searchInput = screen.getByLabelText(/search postings/i)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })

    expect(screen.getByText('Alpha Frontend Engineer')).toBeInTheDocument()
    expect(screen.queryByText('Beta Backend Architect')).not.toBeInTheDocument()
  })

  it('shows empty state when no postings match search filter', async () => {
    renderWithProviders(<JobPostingsPage />)

    expect(await screen.findByText('Alpha Frontend Engineer')).toBeInTheDocument()

    const searchInput = screen.getByLabelText(/search postings/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent-query-string' } })

    expect(screen.getByText('No postings found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument()
  })

  it('opens create posting dialog when Create Posting button is clicked', async () => {
    renderWithProviders(<JobPostingsPage />)

    const createButtons = screen.getAllByRole('button', { name: /create posting/i })
    fireEvent.click(createButtons[0]!)

    expect(screen.getByRole('dialog', { name: /create job posting/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/job title \*/i)).toBeInTheDocument()
  })

  it('shows the error state when postings fail to load', async () => {
    vi.spyOn(postingsApi, 'fetchMyPostings').mockRejectedValue(new Error('Request failed'))

    renderWithProviders(<JobPostingsPage />)

    expect(
      await screen.findByText('Failed to load postings.', undefined, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('closes a posting and refreshes the list', async () => {
    const closeSpy = vi
      .spyOn(postingsApi, 'closePosting')
      .mockResolvedValue({ ...samplePostings[0]!, status: 'closed' })

    renderWithProviders(<JobPostingsPage />)

    expect(await screen.findByText('Alpha Frontend Engineer')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /open options menu for alpha frontend engineer/i }),
    )
    fireEvent.click(await screen.findByText('Close Posting'))
    fireEvent.click(screen.getByRole('button', { name: 'Close Posting' }))

    await waitFor(() => expect(closeSpy).toHaveBeenCalledWith('post-1', expect.anything()))
    await waitFor(() => expect(postingsApi.fetchMyPostings).toHaveBeenCalledTimes(2))
  })
})
