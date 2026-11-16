import { apiFetch } from '@/lib/api-client'
import { parseDateString, parseGpa, parseGraduationYear } from './schema'
import { formatDuration } from './utils'
import type {
  AcademicData,
  Experience,
  FullProfileState,
  ProfileData,
  ProfileLink,
  Project,
  SkillCategory,
} from './types'

export const STUDENT_PROFILE_PATH = '/api/student/profile'
export const STUDENT_PROJECTS_PATH = '/api/student-data/projects'
export const STUDENT_EXPERIENCE_PATH = '/api/student-data/experience'

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

/** Shape returned by GET/POST/PATCH /api/student-data/projects. */
export interface ApiProject {
  id: string
  studentId: string
  title: string
  description: string | null
  role: string | null
  contributions: string | null
  learnings: string | null
  skillsUsed: string[] | null
  liveUrl: string | null
  githubUrl: string | null
  displayOrder: number
  createdAt: string
}

export interface CreateProjectInput {
  title: string
  description?: string | null
  role?: string | null
  contributions?: string | null
  learnings?: string | null
  skillsUsed?: string[] | null
  liveUrl?: string | null
  githubUrl?: string | null
  displayOrder?: number
}

/** Shape returned by GET/POST/PATCH /api/student-data/experience. */
export interface ApiExperience {
  id: string
  studentId: string
  companyName: string
  role: string
  startDate: string | null
  endDate: string | null
  contributions: string | null
  createdAt: string
}

export interface CreateExperienceInput {
  companyName: string
  role: string
  startDate?: string | null
  endDate?: string | null
  contributions?: string | null
}

export interface FullStudentProfileData {
  profile: StudentProfileResponse
  projects: ApiProject[]
  experiences: ApiExperience[]
}

const RESERVED_OTHER_LINK_KEYS = new Set([
  'school',
  'degree',
  'gpa',
  'specialization',
  'portfolioUrl',
  'location',
  'honors',
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

export function toIsoDate(dateStr?: string | null): string | null {
  if (!dateStr) return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (/^(present|current|now)$/i.test(trimmed)) return null

  const d = parseDateString(trimmed)
  if (!d || isNaN(d.getTime()) || d.getFullYear() === 9999) return null

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatExperienceDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  if (!trimmed) return ''
  const d = parseDateString(trimmed)
  if (!d || isNaN(d.getTime())) return trimmed
  if (d.getFullYear() === 9999) return 'Present'
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[d.getMonth()]} ${d.getFullYear()}`
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

export async function fetchStudentProjects(): Promise<ApiProject[]> {
  const res = await apiFetch<{ data: ApiProject[] }>(STUDENT_PROJECTS_PATH)
  return res.data ?? []
}

export async function createStudentProject(input: CreateProjectInput): Promise<ApiProject> {
  const res = await apiFetch<{ data: ApiProject }>(STUDENT_PROJECTS_PATH, {
    method: 'POST',
    body: input,
  })
  return res.data
}

export async function updateStudentProject(
  id: string,
  input: Partial<CreateProjectInput>,
): Promise<ApiProject> {
  const res = await apiFetch<{ data: ApiProject }>(`${STUDENT_PROJECTS_PATH}/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return res.data
}

export async function deleteStudentProject(id: string): Promise<void> {
  await apiFetch<void>(`${STUDENT_PROJECTS_PATH}/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchStudentExperiences(): Promise<ApiExperience[]> {
  const res = await apiFetch<{ data: ApiExperience[] }>(STUDENT_EXPERIENCE_PATH)
  return res.data ?? []
}

export async function createStudentExperience(
  input: CreateExperienceInput,
): Promise<ApiExperience> {
  const res = await apiFetch<{ data: ApiExperience }>(STUDENT_EXPERIENCE_PATH, {
    method: 'POST',
    body: input,
  })
  return res.data
}

export async function updateStudentExperience(
  id: string,
  input: Partial<CreateExperienceInput>,
): Promise<ApiExperience> {
  const res = await apiFetch<{ data: ApiExperience }>(`${STUDENT_EXPERIENCE_PATH}/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return res.data
}

export async function deleteStudentExperience(id: string): Promise<void> {
  await apiFetch<void>(`${STUDENT_EXPERIENCE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

export async function syncStudentProjects(projects: Project[]): Promise<void> {
  const existing = await fetchStudentProjects()
  const existingById = new Map(existing.map((p) => [p.id, p]))
  const keptIds = new Set<string>()
  const tasks: Promise<unknown>[] = []

  for (const [index, proj] of projects.entries()) {
    if (!proj || !proj.title.trim()) continue

    const payload: CreateProjectInput = {
      title: proj.title.trim(),
      description: proj.description?.trim() || null,
      skillsUsed: proj.tags && proj.tags.length > 0 ? proj.tags : null,
      displayOrder: index,
    }

    if (proj.id && existingById.has(proj.id)) {
      keptIds.add(proj.id)
      tasks.push(
        updateStudentProject(proj.id, payload).catch((err) => {
          console.error(`Failed to update project ${proj.id}:`, err)
        }),
      )
    } else {
      tasks.push(
        createStudentProject(payload).catch((err) => {
          console.error('Failed to create project:', err)
          return null
        }),
      )
    }
  }

  for (const item of existing) {
    if (!keptIds.has(item.id)) {
      tasks.push(
        deleteStudentProject(item.id).catch((err) => {
          console.error(`Failed to delete project ${item.id}:`, err)
        }),
      )
    }
  }

  await Promise.all(tasks)
}

export async function syncStudentExperiences(experiences: Experience[]): Promise<void> {
  const existing = await fetchStudentExperiences()
  const existingById = new Map(existing.map((e) => [e.id, e]))
  const keptIds = new Set<string>()
  const tasks: Promise<unknown>[] = []

  for (const exp of experiences) {
    if (!exp.title?.trim() || !exp.company?.trim()) continue

    const contributions =
      exp.achievements
        ?.map((a) => a.trim())
        .filter(Boolean)
        .join('\n') || null

    const payload: CreateExperienceInput = {
      companyName: exp.company.trim(),
      role: exp.title.trim(),
      startDate: toIsoDate(exp.startDate),
      endDate: toIsoDate(exp.endDate),
      contributions,
    }

    if (exp.id && existingById.has(exp.id)) {
      keptIds.add(exp.id)
      tasks.push(
        updateStudentExperience(exp.id, payload).catch((err) => {
          console.error(`Failed to update experience ${exp.id}:`, err)
        }),
      )
    } else {
      tasks.push(
        createStudentExperience(payload).catch((err) => {
          console.error('Failed to create experience:', err)
          return null
        }),
      )
    }
  }

  for (const item of existing) {
    if (!keptIds.has(item.id)) {
      tasks.push(
        deleteStudentExperience(item.id).catch((err) => {
          console.error(`Failed to delete experience ${item.id}:`, err)
        }),
      )
    }
  }

  await Promise.all(tasks)
}

export async function fetchFullStudentProfile(): Promise<FullStudentProfileData> {
  const profile = await fetchStudentProfile()
  const [projects, experiences] = await Promise.all([
    fetchStudentProjects().catch(() => []),
    fetchStudentExperiences().catch(() => []),
  ])

  return { profile, projects, experiences }
}

export async function saveFullStudentProfile(
  state: FullProfileState,
): Promise<StudentProfileResponse> {
  const updatedProfile = await updateStudentProfile(mapFullProfileStateToUpdateInput(state))
  await Promise.allSettled([
    syncStudentProjects(state.projects),
    syncStudentExperiences(state.experiences),
  ])

  return updatedProfile
}

/**
 * Converts the backend profile payload into the view/form model used by the
 * profile components.
 */
export function mapStudentProfileToFullProfileState(
  input: StudentProfileResponse | FullStudentProfileData,
  extraProjects: ApiProject[] = [],
  extraExperiences: ApiExperience[] = [],
): FullProfileState {
  const isFullData =
    'profile' in input && typeof input.profile === 'object' && input.profile !== null
  const profile = isFullData
    ? (input as FullStudentProfileData).profile
    : (input as StudentProfileResponse)
  const apiProjects = isFullData ? (input as FullStudentProfileData).projects : extraProjects
  const apiExperiences = isFullData
    ? (input as FullStudentProfileData).experiences
    : extraExperiences

  const otherLinksRaw =
    profile.otherLinks &&
    typeof profile.otherLinks === 'object' &&
    !Array.isArray(profile.otherLinks)
      ? (profile.otherLinks as Record<string, unknown>)
      : {}

  const graduationYear =
    profile.gradYear !== null && profile.gradYear !== undefined ? String(profile.gradYear) : ''
  const subtitle = profile.headline || profile.degree || ''
  const location = typeof otherLinksRaw.location === 'string' ? otherLinksRaw.location : ''
  const honors = typeof otherLinksRaw.honors === 'string' ? otherLinksRaw.honors : ''

  const profileData: ProfileData = {
    name: profile.fullName || '',
    degree: subtitle,
    university: profile.school || '',
    graduationYear,
    location,
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

  let experiences: Experience[] = []
  if (apiExperiences.length > 0) {
    experiences = apiExperiences.map((exp, idx) => {
      const achievements = splitSummary(exp.contributions)
      const startDateFormatted = formatExperienceDate(exp.startDate)
      const endDateFormatted = exp.endDate ? formatExperienceDate(exp.endDate) : 'Present'
      const duration =
        startDateFormatted || exp.endDate
          ? formatDuration(startDateFormatted, endDateFormatted)
          : ''

      return {
        id: exp.id || `experience-${idx}`,
        title: exp.role || '',
        company: exp.companyName || '',
        location: '',
        startDate: startDateFormatted || exp.startDate || '',
        endDate: exp.endDate ? endDateFormatted || exp.endDate : 'Present',
        duration,
        achievements,
      }
    })
  } else {
    const achievements = splitSummary(profile.experienceSummary)
    const hasExperience = Boolean(profile.experienceRole || profile.experienceCompany)
    if (hasExperience) {
      experiences = [
        {
          id: 'experience-0',
          title: profile.experienceRole || '',
          company: profile.experienceCompany || '',
          location: '',
          duration: '',
          achievements,
        },
      ]
    }
  }

  let projects: Project[] = []
  if (apiProjects.length > 0) {
    projects = apiProjects.map((p, idx) => ({
      id: p.id || `project-${idx}`,
      title: p.title || '',
      description: p.description || '',
      tags: p.skillsUsed || [],
    }))
  }

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
    honors,
    expectedGraduation: graduationYear,
    school: profile.school || '',
  }

  return {
    profile: profileData,
    experiences,
    projects,
    skills,
    academics,
  }
}

/**
 * Converts the profile form state into the PUT /api/student/profile
 * payload. Unsupported top-level fields like location and honors are saved into otherLinks.
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

  const otherLinks: Record<string, unknown> = {}
  for (const link of state.profile.otherLinks) {
    if (link.label && link.url) {
      otherLinks[link.label] = link.url
    }
  }
  if (state.profile.location?.trim()) {
    otherLinks.location = state.profile.location.trim()
  }
  if (state.academics.honors?.trim()) {
    otherLinks.honors = state.academics.honors.trim()
  }

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
    otherLinks: Object.keys(otherLinks).length > 0 ? otherLinks : null,
  }
}
