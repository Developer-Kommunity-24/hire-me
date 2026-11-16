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
  optionalGpaSchema,
  githubUrlSchema,
  parseDateString,
  parseGraduationYear,
  isDateOrderValid,
  parseGpa,
} from './schema'
export type {
  ProfileFormValues,
  ProfileDataValues,
  ExperienceItemValues,
  ProjectItemValues,
  SkillCategoryValues,
  AcademicDataValues,
  ExperienceItem,
  ProjectItem,
} from './schema'
export {
  fetchStudentProfile,
  updateStudentProfile,
  mapStudentProfileToFullProfileState,
  mapFullProfileStateToUpdateInput,
  STUDENT_PROFILE_PATH,
  STUDENT_PROJECTS_PATH,
  STUDENT_EXPERIENCE_PATH,
  fetchStudentProjects,
  createStudentProject,
  updateStudentProject,
  deleteStudentProject,
  fetchStudentExperiences,
  createStudentExperience,
  updateStudentExperience,
  deleteStudentExperience,
  syncStudentProjects,
  syncStudentExperiences,
  fetchFullStudentProfile,
  saveFullStudentProfile,
  toIsoDate,
  formatExperienceDate,
} from './api'
export type {
  StudentProfileResponse,
  UpdateStudentProfileInput,
  Dk24Status,
  ApiProject,
  CreateProjectInput,
  ApiExperience,
  CreateExperienceInput,
  FullStudentProfileData,
} from './api'

export type {
  ProfileData,
  ProfileLink,
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
