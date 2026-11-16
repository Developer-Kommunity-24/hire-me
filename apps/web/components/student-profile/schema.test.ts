import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  githubUrlSchema,
  gpaSchema,
  isDateOrderValid,
  parseDateString,
  parseGpa,
  parseGraduationYear,
  profileFormSchema,
} from './schema'
import type { FullProfileState } from './types'

const validFormData: FullProfileState = {
  profile: {
    name: 'Alex Mercer',
    degree: 'B.S. Computer Science, Stanford University',
    university: 'Stanford University',
    graduationYear: '2025',
    location: 'San Francisco, CA',
    github: 'github.com/alexm',
    email: 'alex@example.edu',
    resumeLink: '',
    photoUrl: '',
    isVerified: true,
    bio: 'Avid software developer.',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/alexm',
    portfolio: 'https://alexm.dev',
    openToWork: true,
    completionPercentage: 100,
    otherLinks: [{ label: 'Twitter', url: 'https://twitter.com/alexm' }],
  },
  experiences: [
    {
      id: 'exp-1',
      title: 'Software Engineering Intern',
      company: 'Google',
      location: 'Mountain View, CA',
      startDate: 'JUN 2023',
      endDate: 'AUG 2023',
      duration: 'JUN 2023 — AUG 2023',
      achievements: ['Built a scalable microservice.'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Distributed Cache System',
      description: 'A fault-tolerant caching layer.',
      tags: ['C++', 'NETWORKING'],
    },
  ],
  skills: [
    {
      label: 'TECHNICAL SKILLS',
      skills: ['TypeScript', 'React'],
    },
  ],
  academics: {
    gpa: '3.9 / 4.0',
    major: 'Computer Science',
    minor: 'Mathematics',
    honors: "Dean's List",
    expectedGraduation: 'May 2025',
    school: 'Stanford University',
  },
}

describe('parseDateString & isDateOrderValid', () => {
  it('correctly parses month-year and year dates', () => {
    const d1 = parseDateString('JUN 2023')
    const d2 = parseDateString('AUG 2023')
    expect(d1).not.toBeNull()
    expect(d2).not.toBeNull()
    if (d1 && d2) {
      expect(d1.getTime()).toBeLessThan(d2.getTime())
    }
  })

  it('handles Present as a far-future date', () => {
    const past = parseDateString('JAN 2023')
    const present = parseDateString('Present')
    expect(present).not.toBeNull()
    if (past && present) {
      expect(past.getTime()).toBeLessThan(present.getTime())
    }
  })

  it('validates date ordering correctly', () => {
    expect(isDateOrderValid('JUN 2023', 'AUG 2023')).toBe(true)
    expect(isDateOrderValid('AUG 2023', 'JUN 2023')).toBe(false)
    expect(isDateOrderValid('2023', '2024')).toBe(true)
    expect(isDateOrderValid('2024', '2023')).toBe(false)
    expect(isDateOrderValid('JUN 2023', 'Present')).toBe(true)
    expect(isDateOrderValid('', 'AUG 2023')).toBe(true)
    expect(isDateOrderValid('JUN 2023', '')).toBe(true)
    expect(isDateOrderValid('', '')).toBe(true)
  })
})

describe('parseGraduationYear', () => {
  it('extracts a four-digit year from common formats', () => {
    expect(parseGraduationYear('2025')).toBe(2025)
    expect(parseGraduationYear('May 2025')).toBe(2025)
    expect(parseGraduationYear('Class of 2026')).toBe(2026)
    expect(parseGraduationYear('')).toBeNull()
    expect(parseGraduationYear('soon')).toBeNull()
  })
})

describe('parseGpa & gpaSchema', () => {
  it('parses formatted GPA with scale and single score', () => {
    expect(parseGpa('3.9 / 4.0')).toEqual({ score: 3.9, scale: 4.0 })
    expect(parseGpa('3.85/4.0')).toEqual({ score: 3.85, scale: 4.0 })
    expect(parseGpa('3.9')).toEqual({ score: 3.9 })
    expect(parseGpa('abc')).toBeNull()
  })

  it('validates valid GPAs', () => {
    expect(gpaSchema.safeParse('3.9 / 4.0').success).toBe(true)
    expect(gpaSchema.safeParse('3.9').success).toBe(true)
    expect(gpaSchema.safeParse('4.0 / 4.0').success).toBe(true)
    expect(gpaSchema.safeParse('9.5 / 10.0').success).toBe(true)
  })

  it('rejects invalid GPAs and out-of-range scores', () => {
    expect(gpaSchema.safeParse('').success).toBe(false)
    expect(gpaSchema.safeParse('abc').success).toBe(false)
    expect(gpaSchema.safeParse('4.5 / 4.0').success).toBe(false)
    expect(gpaSchema.safeParse('-1').success).toBe(false)
    expect(gpaSchema.safeParse('15.0').success).toBe(false)
  })
})

describe('githubUrlSchema', () => {
  it('accepts valid GitHub URLs and handles', () => {
    expect(githubUrlSchema.safeParse('').success).toBe(true)
    expect(githubUrlSchema.safeParse('github.com/alexm').success).toBe(true)
    expect(githubUrlSchema.safeParse('https://github.com/alexm').success).toBe(true)
    expect(githubUrlSchema.safeParse('http://github.com/alexm').success).toBe(true)
    expect(githubUrlSchema.safeParse('https://www.github.com/alex-mercer_123').success).toBe(true)
    expect(githubUrlSchema.safeParse('https://github.com/alexm/repo').success).toBe(true)
  })

  it('rejects non-GitHub URLs', () => {
    expect(githubUrlSchema.safeParse('https://facebook.com/alexm').success).toBe(false)
    expect(githubUrlSchema.safeParse('not-a-valid-url').success).toBe(false)
  })
})

describe('profileFormSchema full validation', () => {
  it('validates a valid state successfully', () => {
    const result = profileFormSchema.safeParse(validFormData)
    expect(result.success).toBe(true)
  })

  it('rejects when the required full name is missing', () => {
    const invalid = {
      ...validFormData,
      profile: { ...validFormData.profile, name: '' },
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i: z.ZodIssue) => i.path.join('.'))
      expect(paths).toContain('profile.name')
    }
  })

  it('allows partially completed academic details', () => {
    const result = profileFormSchema.safeParse({
      ...validFormData,
      academics: {
        gpa: '',
        major: '',
        minor: '',
        honors: '',
        expectedGraduation: '',
        school: '',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects when experience dates are inverted', () => {
    const firstExp = validFormData.experiences[0]
    expect(firstExp).toBeDefined()
    const invalid = {
      ...validFormData,
      experiences: [
        {
          ...firstExp!,
          startDate: 'AUG 2023',
          endDate: 'JUN 2023',
        },
      ],
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(
        (i: z.ZodIssue) => i.path.join('.') === 'experiences.0.endDate',
      )
      expect(issue).toBeDefined()
      expect(issue?.message).toMatch(/after start date/i)
    }
  })

  it('rejects when project dates are inverted', () => {
    const firstProj = validFormData.projects[0]
    expect(firstProj).toBeDefined()
    const invalid = {
      ...validFormData,
      projects: [
        {
          ...firstProj!,
          startDate: '2024',
          endDate: '2023',
        },
      ],
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(
        (i: z.ZodIssue) => i.path.join('.') === 'projects.0.endDate',
      )
      expect(issue).toBeDefined()
      expect(issue?.message).toMatch(/after start date/i)
    }
  })
})
