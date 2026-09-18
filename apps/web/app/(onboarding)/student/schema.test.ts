import { describe, expect, it } from 'vitest'
import {
  studentCompleteOnboardingSchema,
  studentStep1Schema,
  studentStep2Schema,
  studentStep3Schema,
  studentStep4Schema,
} from '@/lib/schemas/student-onboarding.schema'

describe('studentCompleteOnboardingSchema', () => {
  const validData = {
    fullName: 'Alex Chen',
    headline: 'CS Student | Full-Stack Developer',
    bio: 'Enthusiastic developer looking for opportunities.',
    school: 'Stanford University',
    degree: 'B.S. Computer Science',
    graduationYear: '2026',
    gpa: '3.9',
    specialization: 'AI / Machine Learning',
    skills: ['React', 'TypeScript', 'Next.js'],
    experienceRole: 'Frontend Intern',
    experienceCompany: 'DK24 Labs',
    experienceSummary: 'Built key UI components',
    githubUrl: 'https://github.com/alexchen',
    linkedinUrl: 'https://linkedin.com/in/alexchen',
    portfolioUrl: 'https://alexchen.dev',
    resumeUrl: 'https://drive.google.com/resume.pdf',
  }

  it('validates a valid student onboarding data object', () => {
    const result = studentCompleteOnboardingSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('fails validation when fullName is too short or empty', () => {
    const resultEmpty = studentStep1Schema.safeParse({ fullName: '' })
    expect(resultEmpty.success).toBe(false)

    const resultShort = studentStep1Schema.safeParse({ fullName: 'A' })
    expect(resultShort.success).toBe(false)
  })

  it('fails validation when school or degree is empty', () => {
    const invalidSchool = studentStep2Schema.safeParse({
      school: '',
      degree: 'B.S.',
      graduationYear: '2026',
    })
    expect(invalidSchool.success).toBe(false)

    const invalidDegree = studentStep2Schema.safeParse({
      school: 'Stanford',
      degree: '',
      graduationYear: '2026',
    })
    expect(invalidDegree.success).toBe(false)
  })

  it('fails validation when skills array is empty', () => {
    const invalidSkills = studentStep3Schema.safeParse({
      skills: [],
    })
    expect(invalidSkills.success).toBe(false)
  })

  it('validates optional URLs correctly', () => {
    const validUrls = studentStep4Schema.safeParse({
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      portfolioUrl: '',
      resumeUrl: '',
    })
    expect(validUrls.success).toBe(true)

    const invalidUrl = studentStep4Schema.safeParse({
      githubUrl: 'not-a-valid-url',
      linkedinUrl: '',
      portfolioUrl: '',
      resumeUrl: '',
    })
    expect(invalidUrl.success).toBe(false)
  })
})
