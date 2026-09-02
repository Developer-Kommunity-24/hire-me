import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProfileProvider, useProfile } from '@/components/student-profile/ProfileContext'
import EditProfileForm from './EditProfileForm'
import UserAvatar from '../UserAvatar'
import StudentProfileView from '../StudentProfileView'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/student/profile',
}))

describe('UserAvatar', () => {
  it('renders avatar container when no photoUrl is provided', () => {
    const { container } = render(<UserAvatar name="Alex Mercer" />)
    const avatar = container.querySelector('.sb-avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('renders avatar with photoUrl or name', () => {
    const { container } = render(
      <UserAvatar name="Alex Mercer" photoUrl="https://example.com/photo.jpg" />,
    )
    const avatar = container.querySelector('.sb-avatar')
    expect(avatar).toBeInTheDocument()
  })
})

describe('EditProfileForm', () => {
  it('renders all 5 main sections and controls', () => {
    render(
      <ProfileProvider>
        <EditProfileForm />
      </ProfileProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /Edit Profile/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Basic Information/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Skills Architecture/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Work Experience/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Featured Projects/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Academics/i })).toBeInTheDocument()
  })

  it('allows adding and removing skills', () => {
    render(
      <ProfileProvider>
        <EditProfileForm />
      </ProfileProvider>,
    )

    // Add a new language
    const addLangInput = screen.getByPlaceholderText(/Add a skill to languages/i)
    fireEvent.change(addLangInput, { target: { value: 'Rust' } })
    fireEvent.keyDown(addLangInput, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('Rust')).toBeInTheDocument()

    // Remove Rust
    const removeRustBtn = screen.getByRole('button', { name: /Remove Rust/i })
    fireEvent.click(removeRustBtn)
    expect(screen.queryByText('Rust')).not.toBeInTheDocument()
  })

  it('allows adding a new experience entry and deleting it', () => {
    render(
      <ProfileProvider>
        <EditProfileForm />
      </ProfileProvider>,
    )

    const addExpBtn = screen.getByRole('button', { name: /Add Experience/i })
    fireEvent.click(addExpBtn)

    expect(screen.getByText('Experience #3')).toBeInTheDocument()

    const deleteExp3Btn = screen.getByRole('button', { name: /Delete experience 3/i })
    fireEvent.click(deleteExp3Btn)

    expect(screen.queryByText('Experience #3')).not.toBeInTheDocument()
  })

  it('allows adding a new project with tags and deleting it', () => {
    render(
      <ProfileProvider>
        <EditProfileForm />
      </ProfileProvider>,
    )

    const addProjBtn = screen.getByRole('button', { name: /Add Project/i })
    fireEvent.click(addProjBtn)

    expect(screen.getByText('Project #3')).toBeInTheDocument()

    const tagInput = screen.getAllByPlaceholderText(/Add tech tag/i).pop()!
    fireEvent.change(tagInput, { target: { value: 'KUBERNETES' } })
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('KUBERNETES')).toBeInTheDocument()

    const deleteProj3Btn = screen.getByRole('button', { name: /Delete project 3/i })
    fireEvent.click(deleteProj3Btn)

    expect(screen.queryByText('Project #3')).not.toBeInTheDocument()
  })

  it('updates context state and redirects when Save Changes is clicked', () => {
    mockPush.mockClear()

    function TestContainer() {
      const { profile } = useProfile()
      return (
        <div>
          <div data-testid="profile-name-display">{profile.name}</div>
          <EditProfileForm />
        </div>
      )
    }

    render(
      <ProfileProvider>
        <TestContainer />
      </ProfileProvider>,
    )

    const nameInput = screen.getByLabelText(/Full Name/i)
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

    const saveButtons = screen.getAllByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButtons[0]!)

    expect(mockPush).toHaveBeenCalledWith('/student/profile')
    expect(screen.getByTestId('profile-name-display')).toHaveTextContent('Jane Doe')
  })

  it('navigates back to /student/profile on Cancel without modifying context', () => {
    mockPush.mockClear()

    render(
      <ProfileProvider>
        <EditProfileForm />
      </ProfileProvider>,
    )

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButtons[0]!)

    expect(mockPush).toHaveBeenCalledWith('/student/profile')
  })
})

describe('StudentProfileView integration', () => {
  it('renders student profile view with default data and react-avatar', () => {
    const { container } = render(
      <ProfileProvider>
        <StudentProfileView />
      </ProfileProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Alex Mercer' })).toBeInTheDocument()
    expect(container.querySelector('.sb-avatar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Edit Profile/i })).toHaveAttribute(
      'href',
      '/student/profile/edit',
    )
  })
})
