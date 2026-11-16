'use client'

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type {
  ProfileData,
  Experience,
  Project,
  SkillCategory,
  AcademicData,
  FullProfileState,
  ProfileContextValue,
} from './types'

export const defaultProfile: ProfileData = {
  name: '',
  degree: '',
  university: '',
  graduationYear: '',
  location: '',
  github: '',
  email: '',
  resumeLink: '',
  photoUrl: '',
  isVerified: false,
  bio: '',
  phone: '',
  linkedin: '',
  portfolio: '',
  openToWork: false,
  completionPercentage: 0,
  otherLinks: [],
}

export const defaultExperiences: Experience[] = []

export const defaultProjects: Project[] = []

export const defaultSkillCategories: SkillCategory[] = []

export const defaultAcademics: AcademicData = {
  gpa: '',
  major: '',
  minor: '',
  honors: '',
  expectedGraduation: '',
  school: '',
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [experiences, setExperiences] = useState<Experience[]>(defaultExperiences)
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [skills, setSkills] = useState<SkillCategory[]>(defaultSkillCategories)
  const [academics, setAcademics] = useState<AcademicData>(defaultAcademics)

  const saveAll = useCallback((data: FullProfileState) => {
    setProfile(data.profile)
    setExperiences(data.experiences)
    setProjects(data.projects)
    setSkills(data.skills)
    setAcademics(data.academics)
  }, [])

  const resetToDefault = useCallback(() => {
    setProfile(defaultProfile)
    setExperiences(defaultExperiences)
    setProjects(defaultProjects)
    setSkills(defaultSkillCategories)
    setAcademics(defaultAcademics)
  }, [])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      experiences,
      projects,
      skills,
      academics,
      setProfile,
      setExperiences,
      setProjects,
      setSkills,
      setAcademics,
      saveAll,
      resetToDefault,
    }),
    [profile, experiences, projects, skills, academics, saveAll, resetToDefault],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export function useOptionalProfile(): ProfileContextValue | null {
  return useContext(ProfileContext)
}

export { ProfileContext }
