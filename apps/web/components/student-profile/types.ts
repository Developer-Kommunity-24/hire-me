import type { LucideIcon } from 'lucide-react'

export interface ProfileData {
  name: string
  degree: string
  university?: string
  graduationYear?: string
  location: string
  github: string
  email: string
  resumeLink?: string
  photoUrl: string
  isVerified: boolean
}

export interface Experience {
  id?: string
  title: string
  company: string
  location: string
  duration: string
  startDate?: string
  endDate?: string
  achievements: string[]
}

export interface Project {
  id?: string
  title: string
  description: string
  tags: string[]
  startDate?: string
  endDate?: string
}

export interface SkillCategory {
  label: string
  skills: string[]
  iconD?: string
}

export interface AcademicData {
  gpa: string
  major: string
  minor: string
  honors: string
  expectedGraduation: string
}

export interface FullProfileState {
  profile: ProfileData
  experiences: Experience[]
  projects: Project[]
  skills: SkillCategory[]
  academics: AcademicData
}

export interface UserAvatarProps {
  name: string
  photoUrl?: string
  size?: string
  className?: string
  round?: boolean | string
  textSizeRatio?: number
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface BasicInfoSectionProps {
  data: ProfileData
  onChange: (profile: ProfileData) => void
  errors?: Partial<Record<keyof ProfileData, string>>
}

export interface AcademicsEditSectionProps {
  academics: AcademicData
  onChange: (academics: AcademicData) => void
  errors?: Partial<Record<keyof AcademicData, string>>
}

export interface ExperienceEditSectionProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
  errors?: Record<number, Partial<Record<keyof Experience, string>>>
}

export interface ProjectsEditSectionProps {
  projects: Project[]
  onChange: (projects: Project[]) => void
  errors?: Record<number, Partial<Record<keyof Project, string>>>
}

export interface SkillsEditSectionProps {
  categories: SkillCategory[]
  onChange: (categories: SkillCategory[]) => void
}

export interface ProfileContextValue {
  profile: ProfileData
  experiences: Experience[]
  projects: Project[]
  skills: SkillCategory[]
  academics: AcademicData
  setProfile: (profile: ProfileData | ((prev: ProfileData) => ProfileData)) => void
  setExperiences: (experiences: Experience[] | ((prev: Experience[]) => Experience[])) => void
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void
  setSkills: (skills: SkillCategory[] | ((prev: SkillCategory[]) => SkillCategory[])) => void
  setAcademics: (academics: AcademicData | ((prev: AcademicData) => AcademicData)) => void
  saveAll: (data: FullProfileState) => void
  resetToDefault: () => void
}
