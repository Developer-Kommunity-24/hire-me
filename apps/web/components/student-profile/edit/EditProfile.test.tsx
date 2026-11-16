import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EditProfileForm from './EditProfileForm'
import UserAvatar from '../UserAvatar'
import StudentProfileView from '../StudentProfileView'
import * as profileApi from '../api'
import type { StudentProfileResponse } from '../api'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/student/profile',
}))

const sampleProfile: StudentProfileResponse = {
  id: 'student-1',
  email: 'jane@example.edu',
  fullName: 'Jane Doe',
  headline: 'Software Engineering Student',
  bio: 'Building accessible products for the web.',
  gradYear: 2026,
  openToWork: true,
  resumeUrl: 'https://example.com/resume.pdf',
  githubUrl: 'https://github.com/janedoe',
  linkedinUrl: 'https://linkedin.com/in/janedoe',
  otherLinks: {
    school: 'Stanford University',
    degree: 'B.S. Computer Science',
    gpa: 3.9,
    specialization: 'Artificial Intelligence',
    portfolioUrl: 'https://janedoe.dev',
    twitter: 'https://twitter.com/janedoe',
  },
  dk24Status: 'verified',
  phone: '+1234567890',
  completionPercentage: 90,
  skills: ['TypeScript', 'React'],
  experienceRole: 'Frontend Engineering Intern',
  experienceCompany: 'Acme Corp',
  experienceSummary: 'Built reusable UI components.\nImproved page performance by 25%.',
  school: 'Stanford University',
  degree: 'B.S. Computer Science',
  gpa: 3.9,
  specialization: 'Artificial Intelligence',
  portfolioUrl: 'https://janedoe.dev',
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function renderWithQueryClient(ui: React.ReactElement) {
  return render(<QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>)
}

describe('UserAvatar', () => {
  it('renders avatar container and initials fallback when no photoUrl is provided', () => {
    const { container } = render(<UserAvatar name="Alex Mercer" />)
    const avatar = container.querySelector('.sb-avatar')
    expect(avatar).toBeInTheDocument()
    expect(screen.getByText('AM')).toBeInTheDocument()
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
  beforeEach(() => {
    mockPush.mockClear()
    vi.spyOn(profileApi, 'fetchStudentProfile').mockResolvedValue(sampleProfile)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all 5 main sections and controls from the API profile', async () => {
    renderWithQueryClient(<EditProfileForm />)

    expect(
      await screen.findByRole('heading', { level: 1, name: /Edit Profile/i }),
    ).toBeInTheDocument()
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

    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Jane Doe')
    expect(screen.getByLabelText(/Headline \/ Degree Description/i)).toHaveValue(
      'Software Engineering Student',
    )
    expect(screen.getByLabelText(/University/i)).toHaveValue('Stanford University')
    expect(screen.getByLabelText(/Graduation Year/i)).toHaveValue('2026')
  })

  it('allows adding and removing skills', async () => {
    renderWithQueryClient(<EditProfileForm />)

    const addLangInput = await screen.findByPlaceholderText(/Add a skill to technical skills/i)
    fireEvent.change(addLangInput, { target: { value: 'Rust' } })
    fireEvent.keyDown(addLangInput, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('Rust')).toBeInTheDocument()

    const removeRustBtn = screen.getByRole('button', { name: /Remove Rust/i })
    fireEvent.click(removeRustBtn)
    expect(screen.queryByText('Rust')).not.toBeInTheDocument()
  })

  it('allows adding a new experience entry and deleting it', async () => {
    renderWithQueryClient(<EditProfileForm />)

    const addExpBtn = await screen.findByRole('button', { name: /Add Experience/i })
    fireEvent.click(addExpBtn)

    expect(screen.getByText('Experience #2')).toBeInTheDocument()

    const deleteExp2Btn = screen.getByRole('button', { name: /Delete experience 2/i })
    fireEvent.click(deleteExp2Btn)

    expect(screen.queryByText('Experience #2')).not.toBeInTheDocument()
  })

  it('allows adding a new project with tags and deleting it', async () => {
    renderWithQueryClient(<EditProfileForm />)

    const addProjBtn = await screen.findByRole('button', { name: /Add Project/i })
    fireEvent.click(addProjBtn)

    expect(screen.getByText('Project #1')).toBeInTheDocument()

    const tagInput = screen.getAllByPlaceholderText(/Add tech tag/i).pop()!
    fireEvent.change(tagInput, { target: { value: 'KUBERNETES' } })
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('KUBERNETES')).toBeInTheDocument()

    const deleteProj1Btn = screen.getByRole('button', { name: /Delete project 1/i })
    fireEvent.click(deleteProj1Btn)

    expect(screen.queryByText('Project #1')).not.toBeInTheDocument()
  })

  it('saves the mapped profile through the API and redirects', async () => {
    const updateSpy = vi.spyOn(profileApi, 'updateStudentProfile').mockResolvedValue({
      ...sampleProfile,
      fullName: 'Jane Smith',
    })

    renderWithQueryClient(<EditProfileForm />)

    const nameInput = await screen.findByLabelText(/Full Name/i)
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/student/profile')
    })

    expect(updateSpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        fullName: 'Jane Smith',
        headline: 'Software Engineering Student',
        school: 'Stanford University',
        degree: 'B.S. Computer Science',
        gpa: 3.9,
        specialization: 'Artificial Intelligence',
        gradYear: 2026,
        openToWork: true,
        phone: '+1234567890',
        bio: 'Building accessible products for the web.',
        linkedinUrl: 'https://linkedin.com/in/janedoe',
        portfolioUrl: 'https://janedoe.dev',
        skills: expect.arrayContaining(['TypeScript', 'React']),
        experienceRole: 'Frontend Engineering Intern',
        experienceCompany: 'Acme Corp',
        experienceSummary: 'Built reusable UI components.\nImproved page performance by 25%.',
      }),
    )
  })

  it('displays validation errors and does not submit when the full name is empty', async () => {
    const updateSpy = vi.spyOn(profileApi, 'updateStudentProfile')

    renderWithQueryClient(<EditProfileForm />)

    const nameInput = await screen.findByLabelText(/Full Name/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(updateSpy).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('navigates back to /student/profile on Cancel without saving', async () => {
    const updateSpy = vi.spyOn(profileApi, 'updateStudentProfile')

    renderWithQueryClient(<EditProfileForm />)

    await screen.findByRole('heading', { level: 1, name: /Edit Profile/i })
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    expect(mockPush).toHaveBeenCalledWith('/student/profile')
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('shows an error state and retries the profile request', async () => {
    const fetchSpy = vi
      .spyOn(profileApi, 'fetchStudentProfile')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(sampleProfile)

    renderWithQueryClient(<EditProfileForm />)

    expect(await screen.findByText(/Unable to load your profile/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /Edit Profile/i }),
    ).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})

describe('StudentProfileView integration', () => {
  beforeEach(() => {
    vi.spyOn(profileApi, 'fetchStudentProfile').mockResolvedValue(sampleProfile)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the API profile fields and no mock data', async () => {
    const { container } = renderWithQueryClient(<StudentProfileView />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
    expect(container.querySelector('.sb-avatar')).toBeInTheDocument()

    expect(screen.getByText('Software Engineering Student')).toBeInTheDocument()
    expect(screen.getByText('Building accessible products for the web.')).toBeInTheDocument()
    expect(screen.getByText('Verified Student')).toBeInTheDocument()
    expect(screen.getByText('Open to Work')).toBeInTheDocument()
    expect(screen.getByText('Profile completeness: 90%')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'jane@example.edu' })).toHaveAttribute(
      'href',
      'mailto:jane@example.edu',
    )
    expect(screen.getByRole('link', { name: '+1234567890' })).toHaveAttribute(
      'href',
      'tel:+1234567890',
    )
    expect(screen.getByRole('link', { name: /github.com\/janedoe/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Download CV/i })).toBeInTheDocument()

    expect(screen.getByText('TECHNICAL SKILLS')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()

    expect(screen.getByText('Frontend Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Built reusable UI components.')).toBeInTheDocument()
    expect(screen.getByText('Improved page performance by 25%.')).toBeInTheDocument()

    expect(screen.getByText('Stanford University')).toBeInTheDocument()
    expect(screen.getByText('B.S. Computer Science')).toBeInTheDocument()
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument()
    expect(screen.getByText('3.9')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Edit Profile/i })).toHaveAttribute(
      'href',
      '/student/profile/edit',
    )
    expect(screen.queryByText('Alex Mercer')).not.toBeInTheDocument()
  })
})
