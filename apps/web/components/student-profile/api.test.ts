import { describe, expect, it, vi, afterEach } from 'vitest'
import * as apiClient from '@/lib/api-client'
import {
  mapFullProfileStateToUpdateInput,
  mapStudentProfileToFullProfileState,
  toIsoDate,
  formatExperienceDate,
  syncStudentProjects,
  syncStudentExperiences,
  type StudentProfileResponse,
  type ApiProject,
  type ApiExperience,
} from './api'
import type { FullProfileState, Project, Experience } from './types'

const backendProfile: StudentProfileResponse = {
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
    personalSite: 'https://janedoe.me',
    location: 'San Francisco, CA',
    honors: "Dean's List",
    emptyLink: '   ',
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

const formState: FullProfileState = {
  profile: {
    name: ' Jane Doe ',
    degree: 'Software Engineering Student',
    university: 'Stanford University',
    graduationYear: 'May 2026',
    location: 'San Francisco, CA',
    github: 'https://github.com/janedoe',
    email: 'jane@example.edu',
    resumeLink: 'https://example.com/resume.pdf',
    photoUrl: '',
    isVerified: true,
    bio: 'Building accessible products for the web.',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/janedoe',
    portfolio: 'https://janedoe.dev',
    openToWork: true,
    completionPercentage: 90,
    otherLinks: [{ label: 'Twitter', url: 'https://twitter.com/janedoe' }],
  },
  experiences: [
    {
      id: 'experience-0',
      title: 'Frontend Engineering Intern',
      company: 'Acme Corp',
      location: '',
      duration: '',
      achievements: [' Built reusable UI components. ', '', 'Improved page performance by 25%.'],
    },
  ],
  projects: [
    {
      id: 'project-0',
      title: 'Design System',
      description: 'A shared component library.',
      tags: ['React'],
    },
  ],
  skills: [
    { label: 'TECHNICAL SKILLS', skills: ['TypeScript', 'React', 'TypeScript'] },
    { label: 'TOOLS', skills: [' Docker ', ''] },
  ],
  academics: {
    gpa: '3.9 / 4.0',
    major: 'B.S. Computer Science',
    minor: 'Artificial Intelligence',
    honors: "Dean's List",
    expectedGraduation: 'May 2026',
    school: 'Stanford University',
  },
}

describe('mapStudentProfileToFullProfileState', () => {
  it('maps backend profile fields into the existing view model', () => {
    const state = mapStudentProfileToFullProfileState(backendProfile)

    expect(state.profile).toMatchObject({
      name: 'Jane Doe',
      degree: 'Software Engineering Student',
      university: 'Stanford University',
      graduationYear: '2026',
      location: 'San Francisco, CA',
      github: 'https://github.com/janedoe',
      email: 'jane@example.edu',
      resumeLink: 'https://example.com/resume.pdf',
      bio: 'Building accessible products for the web.',
      phone: '+1234567890',
      linkedin: 'https://linkedin.com/in/janedoe',
      portfolio: 'https://janedoe.dev',
      openToWork: true,
      completionPercentage: 90,
      isVerified: true,
    })

    expect(state.profile.otherLinks).toEqual([
      { label: 'Twitter', url: 'https://twitter.com/janedoe' },
      { label: 'Personal Site', url: 'https://janedoe.me' },
    ])

    expect(state.skills).toEqual([{ label: 'TECHNICAL SKILLS', skills: ['TypeScript', 'React'] }])

    expect(state.experiences).toEqual([
      {
        id: 'experience-0',
        title: 'Frontend Engineering Intern',
        company: 'Acme Corp',
        location: '',
        duration: '',
        achievements: ['Built reusable UI components.', 'Improved page performance by 25%.'],
      },
    ])

    expect(state.academics).toEqual({
      gpa: '3.9',
      major: 'B.S. Computer Science',
      minor: 'Artificial Intelligence',
      honors: "Dean's List",
      expectedGraduation: '2026',
      school: 'Stanford University',
    })

    expect(state.projects).toEqual([])
  })

  it('maps multiple experiences and projects when full data is provided', () => {
    const apiProjects: ApiProject[] = [
      {
        id: 'proj-1',
        studentId: 'student-1',
        title: 'Cloud Dashboard',
        description: 'Next.js analytics dashboard',
        role: 'Lead',
        contributions: null,
        learnings: null,
        skillsUsed: ['Next.js', 'Tailwind'],
        liveUrl: 'https://cloud.example.com',
        githubUrl: 'https://github.com/janedoe/cloud',
        displayOrder: 0,
        createdAt: '2026-01-01',
      },
    ]

    const apiExperiences: ApiExperience[] = [
      {
        id: 'exp-1',
        studentId: 'student-1',
        companyName: 'Stripe',
        role: 'Software Engineer Intern',
        startDate: '2024-05-01',
        endDate: '2024-08-31',
        contributions: 'Led payments API migration.',
        createdAt: '2026-01-01',
      },
      {
        id: 'exp-2',
        studentId: 'student-1',
        companyName: 'OpenAI',
        role: 'Research Intern',
        startDate: '2025-06-01',
        endDate: null,
        contributions: 'Evaluated LLM reasoning benchmarks.',
        createdAt: '2026-01-02',
      },
    ]

    const state = mapStudentProfileToFullProfileState({
      profile: backendProfile,
      projects: apiProjects,
      experiences: apiExperiences,
    })

    expect(state.projects).toHaveLength(1)
    expect(state.projects[0]).toEqual({
      id: 'proj-1',
      title: 'Cloud Dashboard',
      description: 'Next.js analytics dashboard',
      tags: ['Next.js', 'Tailwind'],
    })

    expect(state.experiences).toHaveLength(2)
    expect(state.experiences[0]).toMatchObject({
      id: 'exp-1',
      company: 'Stripe',
      title: 'Software Engineer Intern',
      duration: 'May 2024 — Aug 2024',
      achievements: ['Led payments API migration.'],
    })
    expect(state.experiences[1]).toMatchObject({
      id: 'exp-2',
      company: 'OpenAI',
      title: 'Research Intern',
      duration: 'Jun 2025 — Present',
      achievements: ['Evaluated LLM reasoning benchmarks.'],
    })
  })

  it('handles empty profile values without inventing data', () => {
    const state = mapStudentProfileToFullProfileState({
      ...backendProfile,
      fullName: '',
      headline: null,
      bio: null,
      gradYear: null,
      phone: null,
      resumeUrl: null,
      githubUrl: null,
      linkedinUrl: null,
      otherLinks: null,
      skills: [],
      experienceRole: null,
      experienceCompany: null,
      experienceSummary: null,
      school: null,
      degree: null,
      gpa: null,
      specialization: null,
      portfolioUrl: null,
      dk24Status: 'none',
      completionPercentage: 0,
      openToWork: false,
    })

    expect(state.profile).toMatchObject({
      name: '',
      degree: '',
      university: '',
      graduationYear: '',
      location: '',
      github: '',
      email: 'jane@example.edu',
      resumeLink: '',
      bio: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      openToWork: false,
      completionPercentage: 0,
      isVerified: false,
      otherLinks: [],
    })
    expect(state.experiences).toEqual([])
    expect(state.skills).toEqual([{ label: 'TECHNICAL SKILLS', skills: [] }])
    expect(state.academics).toEqual({
      gpa: '',
      major: '',
      minor: '',
      honors: '',
      expectedGraduation: '',
      school: '',
    })
  })

  it('falls back to the degree when no headline is present', () => {
    const state = mapStudentProfileToFullProfileState({
      ...backendProfile,
      headline: null,
    })

    expect(state.profile.degree).toBe('B.S. Computer Science')
  })
})

describe('mapFullProfileStateToUpdateInput', () => {
  it('maps supported form values into the PUT payload including otherLinks', () => {
    const input = mapFullProfileStateToUpdateInput(formState)

    expect(input).toEqual({
      fullName: 'Jane Doe',
      headline: 'Software Engineering Student',
      bio: 'Building accessible products for the web.',
      gradYear: 2026,
      openToWork: true,
      resumeUrl: 'https://example.com/resume.pdf',
      githubUrl: 'https://github.com/janedoe',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      phone: '+1234567890',
      skills: ['TypeScript', 'React', 'Docker'],
      experienceRole: 'Frontend Engineering Intern',
      experienceCompany: 'Acme Corp',
      experienceSummary: 'Built reusable UI components.\nImproved page performance by 25%.',
      school: 'Stanford University',
      degree: 'B.S. Computer Science',
      gpa: 3.9,
      specialization: 'Artificial Intelligence',
      portfolioUrl: 'https://janedoe.dev',
      otherLinks: {
        Twitter: 'https://twitter.com/janedoe',
        location: 'San Francisco, CA',
        honors: "Dean's List",
      },
    })
  })

  it('does not send unsupported fields as top-level properties', () => {
    const input = mapFullProfileStateToUpdateInput(formState) as Record<string, unknown>

    expect(input).not.toHaveProperty('email')
    expect(input).not.toHaveProperty('location')
    expect(input).not.toHaveProperty('honors')
    expect(input).not.toHaveProperty('projects')
    expect(input).not.toHaveProperty('completionPercentage')
  })

  it('sends null for empty optional fields and handles a missing experience', () => {
    const input = mapFullProfileStateToUpdateInput({
      ...formState,
      experiences: [],
      skills: [],
      profile: {
        ...formState.profile,
        bio: '   ',
        phone: '',
        linkedin: '',
        portfolio: '',
        location: '',
        otherLinks: [],
      },
      academics: {
        ...formState.academics,
        honors: '',
      },
    })

    expect(input.bio).toBeNull()
    expect(input.phone).toBeNull()
    expect(input.linkedinUrl).toBeNull()
    expect(input.portfolioUrl).toBeNull()
    expect(input.experienceRole).toBeNull()
    expect(input.experienceCompany).toBeNull()
    expect(input.experienceSummary).toBeNull()
    expect(input.otherLinks).toBeNull()
  })
})

describe('Date formatting utilities', () => {
  it('toIsoDate converts various human formats to YYYY-MM-DD or null', () => {
    expect(toIsoDate('2024-05-01')).toBe('2024-05-01')
    expect(toIsoDate('JUN 2023')).toBe('2023-06-01')
    expect(toIsoDate('Present')).toBeNull()
    expect(toIsoDate('current')).toBeNull()
    expect(toIsoDate('')).toBeNull()
    expect(toIsoDate(null)).toBeNull()
  })

  it('formatExperienceDate formats ISO dates to readable Month Year', () => {
    expect(formatExperienceDate('2024-05-01')).toBe('May 2024')
    expect(formatExperienceDate('2024-12-15')).toBe('Dec 2024')
    expect(formatExperienceDate('')).toBe('')
    expect(formatExperienceDate(null)).toBe('')
  })
})

describe('Sub-resource Synchronization', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('syncStudentProjects correctly updates, creates, and deletes projects concurrently', async () => {
    const existingProjects: ApiProject[] = [
      {
        id: 'proj-1',
        studentId: 'student-1',
        title: 'Old Title',
        description: null,
        role: null,
        contributions: null,
        learnings: null,
        skillsUsed: null,
        liveUrl: null,
        githubUrl: null,
        displayOrder: 0,
        createdAt: '2026-01-01',
      },
      {
        id: 'proj-2',
        studentId: 'student-1',
        title: 'Project to Delete',
        description: null,
        role: null,
        contributions: null,
        learnings: null,
        skillsUsed: null,
        liveUrl: null,
        githubUrl: null,
        displayOrder: 1,
        createdAt: '2026-01-01',
      },
    ]

    const calls: Array<{ url: string; method?: string; body?: unknown }> = []

    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (url, init) => {
      const path = typeof url === 'string' ? url : (url as URL).toString()
      calls.push({ url: path, method: init?.method, body: init?.body })

      if (path === '/api/student-data/projects' && (!init?.method || init.method === 'GET')) {
        return { data: existingProjects } as never
      }
      if (path === '/api/student-data/projects' && init?.method === 'POST') {
        return { data: { id: 'proj-3', ...(init.body as object) } } as never
      }
      if (init?.method === 'PATCH') {
        return { data: { id: 'proj-1', ...(init.body as object) } } as never
      }
      if (init?.method === 'DELETE') {
        return undefined as never
      }
      return {} as never
    })

    const inputProjects: Project[] = [
      {
        id: 'proj-1',
        title: 'Updated Title',
        description: 'New Description',
        tags: ['React'],
      },
      {
        id: 'temp-new-proj',
        title: 'Brand New Project',
        description: 'Brand new description',
        tags: ['TypeScript'],
      },
    ]

    await syncStudentProjects(inputProjects)

    const patchCall = calls.find(
      (c) => c.url === '/api/student-data/projects/proj-1' && c.method === 'PATCH',
    )
    expect(patchCall).toBeDefined()
    expect(patchCall?.body).toMatchObject({
      title: 'Updated Title',
      description: 'New Description',
      skillsUsed: ['React'],
    })

    const postCall = calls.find(
      (c) => c.url === '/api/student-data/projects' && c.method === 'POST',
    )
    expect(postCall).toBeDefined()
    expect(postCall?.body).toMatchObject({
      title: 'Brand New Project',
      description: 'Brand new description',
      skillsUsed: ['TypeScript'],
    })

    const deleteCall = calls.find(
      (c) => c.url === '/api/student-data/projects/proj-2' && c.method === 'DELETE',
    )
    expect(deleteCall).toBeDefined()
  })

  it('syncStudentExperiences correctly updates, creates, and deletes experiences', async () => {
    const existingExperiences: ApiExperience[] = [
      {
        id: 'exp-1',
        studentId: 'student-1',
        companyName: 'Old Company',
        role: 'Intern',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        contributions: 'Contributed code',
        createdAt: '2026-01-01',
      },
      {
        id: 'exp-2',
        studentId: 'student-1',
        companyName: 'Delete Company',
        role: 'Intern',
        startDate: '2023-01-01',
        endDate: '2023-05-01',
        contributions: null,
        createdAt: '2026-01-01',
      },
    ]

    const calls: Array<{ url: string; method?: string; body?: unknown }> = []

    vi.spyOn(apiClient, 'apiFetch').mockImplementation(async (url, init) => {
      const path = typeof url === 'string' ? url : (url as URL).toString()
      calls.push({ url: path, method: init?.method, body: init?.body })

      if (path === '/api/student-data/experience' && (!init?.method || init.method === 'GET')) {
        return { data: existingExperiences } as never
      }
      if (path === '/api/student-data/experience' && init?.method === 'POST') {
        return { data: { id: 'exp-3', ...(init.body as object) } } as never
      }
      if (init?.method === 'PATCH') {
        return { data: { id: 'exp-1', ...(init.body as object) } } as never
      }
      if (init?.method === 'DELETE') {
        return undefined as never
      }
      return {} as never
    })

    const inputExperiences: Experience[] = [
      {
        id: 'exp-1',
        title: 'Senior Intern',
        company: 'Updated Company',
        location: '',
        duration: '',
        startDate: 'JUN 2024',
        endDate: 'Present',
        achievements: ['Achievement A', 'Achievement B'],
      },
      {
        id: 'temp-new-exp',
        title: 'Full Stack Engineer',
        company: 'Startup Inc',
        location: '',
        duration: '',
        startDate: '2025-01-01',
        endDate: '2025-06-01',
        achievements: ['Launched MVP'],
      },
    ]

    await syncStudentExperiences(inputExperiences)

    const patchCall = calls.find(
      (c) => c.url === '/api/student-data/experience/exp-1' && c.method === 'PATCH',
    )
    expect(patchCall).toBeDefined()
    expect(patchCall?.body).toMatchObject({
      companyName: 'Updated Company',
      role: 'Senior Intern',
      startDate: '2024-06-01',
      endDate: null,
      contributions: 'Achievement A\nAchievement B',
    })

    const postCall = calls.find(
      (c) => c.url === '/api/student-data/experience' && c.method === 'POST',
    )
    expect(postCall).toBeDefined()
    expect(postCall?.body).toMatchObject({
      companyName: 'Startup Inc',
      role: 'Full Stack Engineer',
      startDate: '2025-01-01',
      endDate: '2025-06-01',
      contributions: 'Launched MVP',
    })

    const deleteCall = calls.find(
      (c) => c.url === '/api/student-data/experience/exp-2' && c.method === 'DELETE',
    )
    expect(deleteCall).toBeDefined()
  })
})
