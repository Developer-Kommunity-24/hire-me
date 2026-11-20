import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import RequestsTable from './RequestsTable'

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}))

vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-client')>()
  return { ...actual, apiFetch: apiFetchMock }
})

function renderComponent() {
  return render(
    <Providers>
      <RequestsTable />
    </Providers>,
  )
}

describe('RequestsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders student requests and allows searching', async () => {
    apiFetchMock.mockResolvedValueOnce({
      data: [
        {
          id: 'req-1',
          studentId: 'stud-1',
          fullName: 'Aarav Sharma',
          usn: '1RV21CS050',
          email: 'aarav@example.com',
          submittedAt: '2026-03-20T10:00:00.000Z',
          status: 'pending',
        },
        {
          id: 'req-2',
          studentId: 'stud-2',
          fullName: 'Bhavna Patel',
          usn: '1RV21CS051',
          email: 'bhavna@example.com',
          submittedAt: '2026-03-21T10:00:00.000Z',
          status: 'pending',
        },
      ],
    })

    renderComponent()

    expect(screen.getByText('Loading requests…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
      expect(screen.getByText('Bhavna Patel')).toBeInTheDocument()
      expect(screen.getAllByText('Pending Review')).toHaveLength(2)
    })

    const searchInput = screen.getByPlaceholderText('Search requests by name, USN, or email')
    fireEvent.change(searchInput, { target: { value: 'aarav' } })

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    expect(screen.queryByText('Bhavna Patel')).not.toBeInTheDocument()
  })

  it('triggers accept flow when Accept button is clicked', async () => {
    apiFetchMock
      .mockResolvedValueOnce({
        data: [
          {
            id: 'req-1',
            studentId: 'stud-1',
            fullName: 'Aarav Sharma',
            usn: '1RV21CS050',
            email: 'aarav@example.com',
            submittedAt: '2026-03-20T10:00:00.000Z',
            status: 'pending',
          },
        ],
      })
      .mockResolvedValueOnce({ data: { id: 'm-1', fullName: 'Aarav Sharma' } }) // POST accept
      .mockResolvedValueOnce({ data: [] }) // refetch requests

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    })

    const acceptBtn = screen.getByRole('button', { name: 'Accept Aarav Sharma' })
    fireEvent.click(acceptBtn)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members/requests/req-1/accept', {
        method: 'POST',
      })
    })
  })

  it('triggers reject flow when Reject button and confirm dialog is clicked', async () => {
    apiFetchMock
      .mockResolvedValueOnce({
        data: [
          {
            id: 'req-1',
            studentId: 'stud-1',
            fullName: 'Aarav Sharma',
            usn: '1RV21CS050',
            email: 'aarav@example.com',
            submittedAt: '2026-03-20T10:00:00.000Z',
            status: 'pending',
          },
        ],
      })
      .mockResolvedValueOnce({ data: null }) // POST reject
      .mockResolvedValueOnce({ data: [] }) // refetch requests

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    })

    const rejectBtn = screen.getByRole('button', { name: 'Reject Aarav Sharma' })
    fireEvent.click(rejectBtn)

    expect(screen.getByText('Reject verification request?')).toBeInTheDocument()

    const confirmRejectBtn = screen.getByRole('button', { name: 'Reject Request' })
    fireEvent.click(confirmRejectBtn)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members/requests/req-1/reject', {
        method: 'POST',
      })
    })
  })
})
