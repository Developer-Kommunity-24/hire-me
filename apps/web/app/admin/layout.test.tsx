import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminLayout from './layout'

const mockUser = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUser(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('AdminLayout Role Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders admin content when user has core_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Platform Admin',
        email: 'admin@hire-me.college',
        roles: ['core_admin'],
      },
      isLoading: false,
    })

    render(
      <AdminLayout>
        <div>Super Admin Panel Content</div>
      </AdminLayout>,
    )

    expect(screen.getByText('Super Admin Panel Content')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('restricts access and redirects when user lacks core_admin role', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'student-1',
        name: 'Student User',
        email: 'student@example.com',
        roles: ['student'],
      },
      isLoading: false,
    })

    render(
      <AdminLayout>
        <div>Top Secret Admin Stuff</div>
      </AdminLayout>,
    )

    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    expect(screen.queryByText('Top Secret Admin Stuff')).not.toBeInTheDocument()
    expect(mockReplace).toHaveBeenCalledWith('/student/jobs')
  })
})
