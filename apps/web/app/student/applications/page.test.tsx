import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StudentApplicationsPage from './page'
import * as api from '@/lib/student-applications-api'
import { useApplicationsStore, initialStoreState } from '@/lib/stores/use-applications-store'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderWithProviders(ui: React.ReactElement) {
  const testClient = createTestQueryClient()
  return render(<QueryClientProvider client={testClient}>{ui}</QueryClientProvider>)
}

describe('StudentApplicationsPage with Zod, Zustand, and TanStack Query', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
    useApplicationsStore.setState(initialStoreState)
  })

  it('renders application dashboard with header and metric cards matching design', () => {
    renderWithProviders(<StudentApplicationsPage />)

    expect(screen.getByText('My Applications')).toBeInTheDocument()
    expect(
      screen.getByText('Track and manage your ongoing job and internship applications.'),
    ).toBeInTheDocument()

    // Metric cards
    expect(screen.getByRole('button', { name: /Filter by TOTAL APPLIED/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filter by INTERVIEWING/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filter by OFFERS/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filter by REJECTED/i })).toBeInTheDocument()

    // 5 total applications
    expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
      'Showing 1–5 of 5 applications',
    )
  })

  it('renders status badges, applied date, and stages for application cards', () => {
    renderWithProviders(<StudentApplicationsPage />)

    // Items from design screenshot
    expect(screen.getByText('Product Design Intern')).toBeInTheDocument()
    expect(screen.getByText('Backend Engineer (Full-Time)')).toBeInTheDocument()
    expect(screen.getByText('ML Engineer (Contract)')).toBeInTheDocument()

    // Company and metadata
    expect(screen.getByText('KreativeLabs')).toBeInTheDocument()
    expect(screen.getAllByText('NexaHire Technologies')[0]).toBeInTheDocument()

    // Stage callouts
    expect(screen.getByText('Stage: Official Offer Extended')).toBeInTheDocument()
    expect(screen.getByText('Stage: Final Round Interview')).toBeInTheDocument()
  })

  it('filters applications using Zustand store when clicking a metric card', async () => {
    renderWithProviders(<StudentApplicationsPage />)

    // Click "INTERVIEWING" metric card
    const interviewingCard = screen.getByRole('button', { name: /Filter by INTERVIEWING/i })
    await act(async () => {
      fireEvent.click(interviewingCard)
    })

    // Store state should reflect selection
    expect(useApplicationsStore.getState().selectedStatus).toBe('interviewing')

    // Should filter to interviewing
    expect(screen.getByText('Backend Engineer (Full-Time)')).toBeInTheDocument()
    expect(screen.queryByText('Product Design Intern')).not.toBeInTheDocument()
  })

  it('filters applications using Zustand store via search input', async () => {
    renderWithProviders(<StudentApplicationsPage />)

    const searchInput = screen.getByPlaceholderText(/Search by role, company, or status/i)
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Kreative' } })
    })

    // Store state should reflect search query
    expect(useApplicationsStore.getState().search).toBe('Kreative')

    expect(screen.getByText('Product Design Intern')).toBeInTheDocument()
    expect(screen.queryByText('Backend Engineer (Full-Time)')).not.toBeInTheDocument()
  })

  it('switches between List and Grid view modes via Zustand store', async () => {
    renderWithProviders(<StudentApplicationsPage />)

    const gridBtn = screen.getByRole('button', { name: /Grid view/i })
    await act(async () => {
      fireEvent.click(gridBtn)
    })
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true')
    expect(useApplicationsStore.getState().viewMode).toBe('grid')

    const listBtn = screen.getByRole('button', { name: /List view/i })
    await act(async () => {
      fireEvent.click(listBtn)
    })
    expect(listBtn).toHaveAttribute('aria-pressed', 'true')
    expect(useApplicationsStore.getState().viewMode).toBe('list')
  })

  it('expands and collapses milestone history inline without opening a popup dialog', async () => {
    renderWithProviders(<StudentApplicationsPage />)

    // Initially collapsed: milestone history is not shown
    expect(screen.queryByText('APPLICATION MILESTONE HISTORY')).not.toBeInTheDocument()

    // Click Backend Engineer card to expand inline
    const cardTitle = screen.getByText('Backend Engineer (Full-Time)')
    await act(async () => {
      fireEvent.click(cardTitle)
    })

    // Zustand store updated
    expect(useApplicationsStore.getState().expandedAppId).toBe('app-nexahire-be')

    // Now expanded inline: milestone history is visible
    expect(screen.getByText('APPLICATION MILESTONE HISTORY')).toBeInTheDocument()
    expect(screen.getByText('Recruiter Screening')).toBeInTheDocument()
    expect(screen.getByText('Architecture Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Final Leadership Interview')).toBeInTheDocument()

    // CRITICAL: Ensure NO modal/dialog popup is displayed!
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Toggle button now says Hide Details
    const hideBtn = screen.getByRole('button', { name: /Hide details/i })
    await act(async () => {
      fireEvent.click(hideBtn)
    })

    // Collapsed again
    expect(screen.queryByText('APPLICATION MILESTONE HISTORY')).not.toBeInTheDocument()
    expect(useApplicationsStore.getState().expandedAppId).toBeNull()
  })

  it('allows withdrawing an application via TanStack Query mutation with confirmation', async () => {
    vi.spyOn(api, 'fetchStudentApplications').mockResolvedValue(api.DEFAULT_STUDENT_APPLICATIONS)
    vi.spyOn(api, 'withdrawStudentApplication').mockResolvedValueOnce({
      success: true,
      id: 'app-nexahire-be',
    })

    renderWithProviders(<StudentApplicationsPage />)

    // Wait for initial fetch to settle
    await waitFor(() => {
      expect(screen.getByText('Backend Engineer (Full-Time)')).toBeInTheDocument()
    })

    // Expand the card
    const cardTitle = screen.getByText('Backend Engineer (Full-Time)')
    await act(async () => {
      fireEvent.click(cardTitle)
    })

    // Withdraw button inside expanded card
    const withdrawBtn = screen.getByRole('button', {
      name: /Withdraw application for Backend Engineer \(Full-Time\)/i,
    })
    await act(async () => {
      fireEvent.click(withdrawBtn)
    })

    // Confirmation alertdialog opens
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Withdraw Application?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /Confirm Withdrawal/i })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    await waitFor(() => {
      expect(screen.queryByText('Backend Engineer (Full-Time)')).not.toBeInTheDocument()
    })
  })
})
