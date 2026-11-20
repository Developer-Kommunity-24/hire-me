import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StudentAdminLayout from './layout'

const mockUser = vi.fn()
const mockReplace = vi.fn()

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUser(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/student-admin/members',
  useRouter: () => ({ replace: mockReplace }),
}))

describe('StudentAdminLayout Access Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders student admin content when user has club_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'u-1',
        name: 'Club Lead',
        email: 'club@example.com',
        roles: ['student', 'club_admin'],
      },
      isLoading: false,
    })

    renderWithClient(
      <StudentAdminLayout>
        <div>Club Admin Protected Content</div>
      </StudentAdminLayout>,
    )

    expect(screen.getByText('Club Admin Protected Content')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('restricts access and redirects when user lacks club_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'u-2',
        name: 'Normal Student',
        email: 'student@example.com',
        roles: ['student'],
      },
      isLoading: false,
    })

    renderWithClient(
      <StudentAdminLayout>
        <div>Should Not Be Visible</div>
      </StudentAdminLayout>,
    )

    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    expect(screen.queryByText('Should Not Be Visible')).not.toBeInTheDocument()
    expect(mockReplace).toHaveBeenCalledWith('/student/jobs')
  })
})
