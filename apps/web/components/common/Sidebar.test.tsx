import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

const mockUser = vi.fn()

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUser(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/student/jobs',
}))

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders default student navigation items without Student Admin when user is not a club admin', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'u-1',
        name: 'Normal Student',
        email: 'student@example.com',
        roles: ['student'],
      },
      isLoading: false,
    })

    render(<Sidebar />)

    expect(screen.getByText('Job Feed')).toBeInTheDocument()
    expect(screen.getByText('My Applications')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()

    // Student Admin should NOT be present
    expect(screen.queryByText('Student Admin')).not.toBeInTheDocument()
  })

  it('renders the extra Student Admin navigation item when super admin has assigned club_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'u-2',
        name: 'Assigned Student Admin',
        email: 'clubadmin@example.com',
        roles: ['student', 'club_admin'],
      },
      isLoading: false,
    })

    render(<Sidebar />)

    expect(screen.getByText('Job Feed')).toBeInTheDocument()
    expect(screen.getByText('My Applications')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()

    // Student Admin SHOULD be present and link to /student-admin/members
    const studentAdminLink = screen.getByText('Student Admin')
    expect(studentAdminLink).toBeInTheDocument()
    expect(studentAdminLink.closest('a')).toHaveAttribute('href', '/student-admin/members')
  })

  it('renders the Super Admin navigation item when user has core_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'u-3',
        name: 'Super Admin',
        email: 'super@hire-me.college',
        roles: ['core_admin'],
      },
      isLoading: false,
    })

    render(<Sidebar />)

    const superAdminLink = screen.getByText('Super Admin')
    expect(superAdminLink).toBeInTheDocument()
    expect(superAdminLink.closest('a')).toHaveAttribute('href', '/admin')
  })
})
