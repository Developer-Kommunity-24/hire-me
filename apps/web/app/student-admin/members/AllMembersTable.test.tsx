import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import AllMembersTable from './AllMembersTable'

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
      <AllMembersTable />
    </Providers>,
  )
}

describe('AllMembersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders member rows and allows searching', async () => {
    apiFetchMock.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          fullName: 'Priya Nair',
          usn: '1RV21CS001',
          email: 'priya@example.com',
          addedAt: '2026-03-01T00:00:00.000Z',
        },
        {
          id: '2',
          fullName: 'Marcus Webb',
          usn: '1RV21CS002',
          email: 'marcus@example.com',
          addedAt: '2026-03-02T00:00:00.000Z',
        },
      ],
    })

    renderComponent()

    expect(screen.getByText('Loading members…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument()
      expect(screen.getByText('Marcus Webb')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by name, USN, or email')
    fireEvent.change(searchInput, { target: { value: 'priya' } })

    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
    expect(screen.queryByText('Marcus Webb')).not.toBeInTheDocument()
  })

  it('triggers delete flow when delete button is confirmed', async () => {
    apiFetchMock
      .mockResolvedValueOnce({
        data: [
          {
            id: '1',
            fullName: 'Priya Nair',
            usn: '1RV21CS001',
            email: 'priya@example.com',
            addedAt: '2026-03-01T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ data: null }) // DELETE
      .mockResolvedValueOnce({ data: [] }) // refetch query onSettled

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: 'Delete Priya Nair' })
    fireEvent.click(deleteBtn)

    expect(screen.getByText('Delete this member?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members/1', { method: 'DELETE' })
    })
  })
})
