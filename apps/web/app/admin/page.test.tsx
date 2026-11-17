import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import AdminDashboardPage from './page'
import * as adminApi from '@/lib/admin-api'

vi.mock('@/lib/admin-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin-api')>()
  return {
    ...actual,
    fetchAdminStats: vi.fn(),
    fetchAdminClubs: vi.fn(),
    fetchClubAdmins: vi.fn(),
    fetchEligibleStudents: vi.fn(),
    appointClubAdmin: vi.fn(),
    removeClubAdmin: vi.fn(),
    createAdminClub: vi.fn(),
  }
})

function renderComponent() {
  return render(
    <Providers>
      <AdminDashboardPage />
    </Providers>,
  )
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(adminApi.fetchAdminStats).mockResolvedValue({
      students: 42,
      recruiters: 12,
      postings: 8,
      applications: 25,
      applicationsByStatus: {
        applied: 10,
        under_review: 5,
        shortlisted: 4,
        accepted: 3,
        rejected: 3,
      },
    })

    vi.mocked(adminApi.fetchAdminClubs).mockResolvedValue([
      {
        id: 'club-1',
        name: 'Developer Kommunity 24',
        slug: 'dk24',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    vi.mocked(adminApi.fetchClubAdmins).mockResolvedValue([
      {
        userId: 'u-1',
        clubId: 'club-1',
        userName: 'Aarav Sharma',
        userEmail: 'aarav@college.edu',
        clubName: 'Developer Kommunity 24',
      },
    ])

    vi.mocked(adminApi.fetchEligibleStudents).mockResolvedValue([
      {
        id: 'u-2',
        fullName: 'Diya Patel',
        email: 'diya@college.edu',
      },
    ])
  })

  it('renders student admins table and title', async () => {
    renderComponent()

    expect(screen.getByText('Super Administrator Portal')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
      expect(screen.getByText('aarav@college.edu')).toBeInTheDocument()
      expect(screen.getByText('Developer Kommunity 24')).toBeInTheDocument()
    })
  })

  it('allows opening appoint modal and appointing a student as club admin', async () => {
    vi.mocked(adminApi.appointClubAdmin).mockResolvedValue({
      user: { id: 'u-2' },
      clubAdmin: { userId: 'u-2', clubId: 'club-1' },
    })

    renderComponent()

    const appointBtn = screen.getByRole('button', { name: /Appoint Student Admin/i })
    fireEvent.click(appointBtn)

    await waitFor(() => {
      expect(screen.getByText('Diya Patel')).toBeInTheDocument()
    })

    // Select the student
    fireEvent.click(screen.getByText('Diya Patel'))

    // Select the club
    const clubSelect = screen.getByLabelText(/Assign to Club/i)
    fireEvent.change(clubSelect, { target: { value: 'club-1' } })

    // Submit appointment
    const submitBtn = screen.getByRole('button', { name: 'Appoint as Student Admin' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(adminApi.appointClubAdmin).toHaveBeenCalledWith({
        userId: 'u-2',
        clubId: 'club-1',
      })
    })
  })

  it('switches to System Metrics tab and displays stats', async () => {
    renderComponent()

    const metricsTab = screen.getByRole('button', { name: 'System Metrics' })
    fireEvent.click(metricsTab)

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument() // students
      expect(screen.getByText('12')).toBeInTheDocument() // recruiters
      expect(screen.getByText('8')).toBeInTheDocument() // postings
      expect(screen.getByText('25')).toBeInTheDocument() // applications
    })
  })

  it('switches to Clubs tab and displays clubs list', async () => {
    renderComponent()

    const clubsTab = screen.getByRole('button', { name: 'Clubs' })
    fireEvent.click(clubsTab)

    await waitFor(() => {
      expect(screen.getByText('Campus Clubs Directory')).toBeInTheDocument()
      expect(screen.getByText('Developer Kommunity 24')).toBeInTheDocument()
      expect(screen.getByText('dk24')).toBeInTheDocument()
    })
  })
})
