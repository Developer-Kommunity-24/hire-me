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
  name: 'Alex Mercer',
  degree: "B.S. Computer Science, Stanford University '25",
  university: 'Stanford University',
  graduationYear: '2025',
  location: 'San Francisco, CA',
  github: 'github.com/alexm',
  email: 'alex@example.edu',
  resumeLink: '',
  photoUrl: '',
  isVerified: true,
}

export const defaultExperiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    startDate: 'JUN 2023',
    endDate: 'AUG 2023',
    duration: 'JUN 2023 — AUG 2023',
    achievements: [
      'Developed a highly scalable microservice using Go and gRPC, improving data processing speed by 25%.',
      'Collaborated with cross-functional teams to design and implement new API endpoints.',
      'Optimized database queries in PostgreSQL, reducing latency for search results by 40%.',
    ],
  },
  {
    id: 'exp-2',
    title: 'Backend Developer (Part-time)',
    company: 'StartupX',
    location: 'Remote',
    startDate: 'JAN 2023',
    endDate: 'MAY 2023',
    duration: 'JAN 2023 — MAY 2023',
    achievements: [
      'Maintained and optimized PostgreSQL databases for user analytics.',
      'Built RESTful APIs in Node.js/Express for the core mobile application.',
      'Implemented automated testing with Jest, achieving 90% code coverage.',
    ],
  },
]

export const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Distributed Cache System',
    description:
      'A robust, fault-tolerant distributed caching layer built in C++ mimicking Redis-like behavior with consistent hashing.',
    tags: ['C++', 'NETWORKING', 'DISTRIBUTED SYSTEMS'],
  },
  {
    id: 'proj-2',
    title: 'ML Trading Bot',
    description:
      'Algorithmic trading bot using Python and TensorFlow to predict short-term market trends with 72% historical accuracy.',
    tags: ['PYTHON', 'TENSORFLOW', 'FINANCE'],
  },
]

export const defaultSkillCategories: SkillCategory[] = [
  {
    label: 'LANGUAGES',
    skills: ['Python', 'Java', 'C++', 'JavaScript', 'Go'],
  },
  {
    label: 'FRAMEWORKS & TOOLS',
    skills: ['React', 'Node.js', 'Docker', 'Git', 'AWS'],
  },
  {
    label: 'DATABASE',
    skills: ['PostgreSQL', 'Redis', 'MongoDB'],
  },
]

export const defaultAcademics: AcademicData = {
  gpa: '3.9 / 4.0',
  major: 'Computer Science',
  minor: 'Mathematics',
  honors: "Dean's List (All Semesters)",
  expectedGraduation: 'May 2025',
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
