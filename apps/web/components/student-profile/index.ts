export { default as Sidebar } from './Sidebar'
export { default as ProfileHeader } from './ProfileHeader'
export { default as ExperienceTimeline } from './ExperienceTimeline'
export { default as ProjectsGrid } from './ProjectsGrid'
export { default as SkillsCard } from './SkillsCard'
export { default as AcademicsCard } from './AcademicsCard'
export { default as Footer } from './Footer'
export { default as UserAvatar } from './UserAvatar'
export { default as StudentProfileView } from './StudentProfileView'
export { default as EditProfileForm } from './edit/EditProfileForm'
export {
  ProfileProvider,
  useProfile,
  defaultProfile,
  defaultExperiences,
  defaultProjects,
  defaultSkillCategories,
  defaultAcademics,
} from './ProfileContext'
export {
  profileFormSchema,
  profileDataSchema,
  academicDataSchema,
  experienceItemSchema,
  projectItemSchema,
  skillCategorySchema,
  gpaSchema,
  githubUrlSchema,
  parseDateString,
  isDateOrderValid,
  parseGpa,
} from './schema'
export type { ProfileFormValues } from './schema'
export { saveProfileToApi } from './api'

export type {
  ProfileData,
  Experience,
  Project,
  SkillCategory,
  AcademicData,
  FullProfileState,
  NavItem,
  UserAvatarProps,
  ProfileContextValue,
  BasicInfoSectionProps,
  AcademicsEditSectionProps,
  ExperienceEditSectionProps,
  ProjectsEditSectionProps,
  SkillsEditSectionProps,
} from './types'
