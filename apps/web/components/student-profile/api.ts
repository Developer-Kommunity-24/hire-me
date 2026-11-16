import { apiFetch } from '@/lib/api-client'
import { parseGpa, parseGraduationYear } from './schema'
import type {
  AcademicData,
  Experience,
  FullProfileState,
  ProfileData,
  ProfileLink,
  SkillCategory,
} from './types'

export const STUDENT_PROFILE_PATH = '/api/student/profile'

export type Dk24Status = 'none' | 'pending' | 'verified' | 'rejected'

/** Shape returned by GET/PUT /api/student/profile. */
export interface StudentProfileResponse {
  id: string
  email: string
  fullName: string
  headline: string | null
  bio: string | null
  gradYear: number | null
  openToWork: boolean
  resumeUrl: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  otherLinks: Record<string, unknown> | null
  dk24Status: Dk24Status
  phone: string | null
  completionPercentage: number
  skills: string[]
  experienceRole: string | null
  experienceCompany: string | null
  experienceSummary: string | null
  school: string | null
  degree: string | null
  gpa: number | null
  specialization: string | null
  portfolioUrl: string | null
}

/** Accepted by PUT /api/student/profile. */
export interface UpdateStudentProfileInput {
  fullName?: string
  bio?: string | null
  headline?: string | null
  gradYear?: number | null
  openToWork?: boolean
  resumeUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  otherLinks?: Record<string, unknown> | null
  phone?: string | null
  skills?: string[]
  experienceRole?: string | null
  experienceCompany?: string | null
  experienceSummary?: string | null
  school?: string | null
  degree?: string | null
  gpa?: number | null
  specialization?: string | null
  portfolioUrl?: string | null
}

const RESERVED_OTHER_LINK_KEYS = new Set([
  'school',
  'degree',
  'gpa',
  'specialization',
  'portfolioUrl',
])

function humanizeLinkLabel(key: string): string {
  const label = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\burl\b/gi, '')
    .trim()

  if (!label) return key

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function mapOtherLinks(value: Record<string, unknown> | null | undefined): ProfileLink[] {
  if (!value) return []

  return Object.entries(value)
    .filter(
      ([key, link]) =>
        !RESERVED_OTHER_LINK_KEYS.has(key) && typeof link === 'string' && link.trim() !== '',
    )
    .map(([key, link]) => ({
      label: humanizeLinkLabel(key),
      url: (link as string).trim(),
    }))
}

function splitSummary(summary: string | null | undefined): string[] {
  if (!summary) return []

  return summary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function toNullableString(value: string | undefined | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function flattenSkills(categories: SkillCategory[]): string[] {
  return Array.from(
    new Set(
      categories
        .flatMap((category) => category.skills)
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  )
}

export async function fetchStudentProfile(): Promise<StudentProfileResponse> {
  return apiFetch<StudentProfileResponse>(STUDENT_PROFILE_PATH)
}

export async function updateStudentProfile(
  input: UpdateStudentProfileInput,
): Promise<StudentProfileResponse> {
  return apiFetch<StudentProfileResponse>(STUDENT_PROFILE_PATH, {
    method: 'PUT',
    body: input,
  })
}

/**
 * Converts the backend profile payload into the view/form model used by the
 * existing profile components.
 */
export function mapStudentProfileToFullProfileState(
  profile: StudentProfileResponse,
): FullProfileState {
  const graduationYear = profile.gradYear !== null ? String(profile.gradYear) : ''
  const subtitle = profile.headline || profile.degree || ''

  const profileData: ProfileData = {
    name: profile.fullName || '',
    degree: subtitle,
    university: profile.school || '',
    graduationYear,
    location: '',
    github: profile.githubUrl || '',
    email: profile.email || '',
    resumeLink: profile.resumeUrl || '',
    photoUrl: '',
    isVerified: profile.dk24Status === 'verified',
    bio: profile.bio || '',
    phone: profile.phone || '',
    linkedin: profile.linkedinUrl || '',
    portfolio: profile.portfolioUrl || '',
    openToWork: profile.openToWork ?? false,
    completionPercentage: profile.completionPercentage ?? 0,
    otherLinks: mapOtherLinks(profile.otherLinks),
  }

  const achievements = splitSummary(profile.experienceSummary)
  const hasExperience = Boolean(profile.experienceRole || profile.experienceCompany)

  const experiences: Experience[] = hasExperience
    ? [
        {
          id: 'experience-0',
          title: profile.experienceRole || '',
          company: profile.experienceCompany || '',
          location: '',
          duration: '',
          achievements,
        },
      ]
    : []

  const skills: SkillCategory[] = [
    {
      label: 'TECHNICAL SKILLS',
      skills: profile.skills ?? [],
    },
  ]

  const academics: AcademicData = {
    gpa: profile.gpa !== null && profile.gpa !== undefined ? String(profile.gpa) : '',
    major: profile.degree || '',
    minor: profile.specialization || '',
    honors: '',
    expectedGraduation: graduationYear,
    school: profile.school || '',
  }

  return {
    profile: profileData,
    experiences,
    // The merged profile API does not expose project persistence.
    projects: [],
    skills,
    academics,
  }
}

/**
 * Converts the existing profile form state into the PUT /api/student/profile
 * payload. Fields without backend support (projects, extra experiences,
 * location, email, honors) are intentionally not sent.
 */
export function mapFullProfileStateToUpdateInput(
  state: FullProfileState,
): UpdateStudentProfileInput {
  const [experience] = state.experiences
  const parsedGpa = parseGpa(state.academics.gpa)
  const graduationYear =
    parseGraduationYear(state.profile.graduationYear) ??
    parseGraduationYear(state.academics.expectedGraduation)
  const summary =
    experience?.achievements
      .map((achievement) => achievement.trim())
      .filter(Boolean)
      .join('\n') ?? ''

  return {
    fullName: state.profile.name.trim(),
    headline: toNullableString(state.profile.degree),
    bio: toNullableString(state.profile.bio),
    gradYear: graduationYear,
    openToWork: state.profile.openToWork,
    resumeUrl: toNullableString(state.profile.resumeLink),
    githubUrl: toNullableString(state.profile.github),
    linkedinUrl: toNullableString(state.profile.linkedin),
    phone: toNullableString(state.profile.phone),
    skills: flattenSkills(state.skills),
    experienceRole: toNullableString(experience?.title),
    experienceCompany: toNullableString(experience?.company),
    experienceSummary: toNullableString(summary),
    school: toNullableString(state.profile.university),
    degree: toNullableString(state.academics.major),
    gpa: parsedGpa?.score ?? null,
    specialization: toNullableString(state.academics.minor),
    portfolioUrl: toNullableString(state.profile.portfolio),
  }
}
