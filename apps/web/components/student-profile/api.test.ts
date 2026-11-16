import { describe, expect, it } from 'vitest'
import {
  mapFullProfileStateToUpdateInput,
  mapStudentProfileToFullProfileState,
  type StudentProfileResponse,
} from './api'
import type { FullProfileState } from './types'

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
      honors: '',
      expectedGraduation: '2026',
      school: 'Stanford University',
    })

    expect(state.projects).toEqual([])
  })

  it('handles empty profile values without inventing data', () => {
    const state = mapStudentProfileToFullProfileState({
      ...backendProfile,
      fullName: '',
      email: '',
      headline: null,
      bio: null,
      gradYear: null,
      openToWork: false,
      resumeUrl: null,
      githubUrl: null,
      linkedinUrl: null,
      otherLinks: null,
      dk24Status: 'none',
      phone: null,
      completionPercentage: 0,
      skills: [],
      experienceRole: null,
      experienceCompany: null,
      experienceSummary: null,
      school: null,
      degree: null,
      gpa: null,
      specialization: null,
      portfolioUrl: null,
    })

    expect(state.profile).toMatchObject({
      name: '',
      degree: '',
      university: '',
      graduationYear: '',
      github: '',
      email: '',
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
  it('maps supported form values into the PUT payload', () => {
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
    })
  })

  it('does not send unsupported fields such as email, location, honors or projects', () => {
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
      },
      academics: {
        ...formState.academics,
        gpa: '',
        minor: '',
      },
    })

    expect(input.fullName).toBe('Jane Doe')
    expect(input.bio).toBeNull()
    expect(input.phone).toBeNull()
    expect(input.linkedinUrl).toBeNull()
    expect(input.portfolioUrl).toBeNull()
    expect(input.gpa).toBeNull()
    expect(input.specialization).toBeNull()
    expect(input.skills).toEqual([])
    expect(input.experienceRole).toBeNull()
    expect(input.experienceCompany).toBeNull()
    expect(input.experienceSummary).toBeNull()
  })

  it('uses the academics graduation year when the profile year is missing', () => {
    const input = mapFullProfileStateToUpdateInput({
      ...formState,
      profile: { ...formState.profile, graduationYear: '' },
      academics: { ...formState.academics, expectedGraduation: 'Class of 2027' },
    })

    expect(input.gradYear).toBe(2027)
  })
})
