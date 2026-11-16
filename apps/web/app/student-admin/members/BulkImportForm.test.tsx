import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import BulkImportForm from './BulkImportForm'

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
      <BulkImportForm />
    </Providers>,
  )
}

describe('BulkImportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses uploaded CSV file, displays preview rows, and triggers import', async () => {
    renderComponent()

    const csvContent = 'Name,Username,Email\nJohn Doe,johndoe,john@example.com'
    const file = new File([csvContent], 'members.csv', { type: 'text/csv' })

    const input = screen.getByLabelText('Upload CSV file').querySelector('input')!
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('johndoe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    apiFetchMock.mockResolvedValueOnce({
      data: {
        id: '1',
        fullName: 'John Doe',
        usn: 'johndoe',
        email: 'john@example.com',
      },
    })

    const importButton = screen.getByRole('button', { name: 'Import Members' })
    fireEvent.click(importButton)

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/api/clubs/members', {
        method: 'POST',
        body: {
          fullName: 'John Doe',
          usn: 'johndoe',
          email: 'john@example.com',
        },
      })
      expect(screen.getByText('Members imported successfully!')).toBeInTheDocument()
    })
  })
})
