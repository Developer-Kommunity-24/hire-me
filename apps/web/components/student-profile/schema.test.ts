import { describe, expect, it } from 'vitest'
import {
  githubUrlSchema,
  gpaSchema,
  isDateOrderValid,
  parseDateString,
  parseGpa,
  profileFormSchema,
} from './schema'
import {
  defaultProfile,
  defaultExperiences,
  defaultProjects,
  defaultSkillCategories,
  defaultAcademics,
} from './ProfileContext'

describe('parseDateString & isDateOrderValid', () => {
  it('correctly parses month-year and year dates', () => {
    const d1 = parseDateString('JUN 2023')
    const d2 = parseDateString('AUG 2023')
    expect(d1).not.toBeNull()
    expect(d2).not.toBeNull()
    expect(d1!.getTime()).toBeLessThan(d2!.getTime())
  })

  it('handles Present as a far-future date', () => {
    const past = parseDateString('JAN 2023')
    const present = parseDateString('Present')
    expect(present).not.toBeNull()
    expect(past!.getTime()).toBeLessThan(present!.getTime())
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
  const validFormData = {
    profile: defaultProfile,
    experiences: defaultExperiences,
    projects: defaultProjects,
    skills: defaultSkillCategories,
    academics: defaultAcademics,
  }

  it('validates default valid state successfully', () => {
    const result = profileFormSchema.safeParse(validFormData)
    expect(result.success).toBe(true)
  })

  it('rejects when required profile fields are missing', () => {
    const invalid = {
      ...validFormData,
      profile: { ...validFormData.profile, name: '', degree: '' },
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('profile.name')
      expect(paths).toContain('profile.degree')
    }
  })

  it('rejects when experience dates are inverted', () => {
    const invalid = {
      ...validFormData,
      experiences: [
        {
          ...validFormData.experiences[0]!,
          startDate: 'AUG 2023',
          endDate: 'JUN 2023',
        },
      ],
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'experiences.0.endDate')
      expect(issue).toBeDefined()
      expect(issue?.message).toMatch(/after start date/i)
    }
  })

  it('rejects when project dates are inverted', () => {
    const invalid = {
      ...validFormData,
      projects: [
        {
          ...validFormData.projects[0]!,
          startDate: '2024',
          endDate: '2023',
        },
      ],
    }
    const result = profileFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'projects.0.endDate')
      expect(issue).toBeDefined()
      expect(issue?.message).toMatch(/after start date/i)
    }
  })
})
