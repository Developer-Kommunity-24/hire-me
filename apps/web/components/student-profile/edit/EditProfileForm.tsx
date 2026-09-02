'use client'

import { type FormEvent, type MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile } from '@/components/student-profile/ProfileContext'
import { Button } from '@/components/ui/button'
import BasicInfoSection from './BasicInfoSection'
import SkillsEditSection from './SkillsEditSection'
import ExperienceEditSection from './ExperienceEditSection'
import ProjectsEditSection from './ProjectsEditSection'
import AcademicsEditSection from './AcademicsEditSection'
import { profileFormSchema } from '../schema'
import { saveProfileToApi } from '../api'
import type { FullProfileState, ProfileData, AcademicData, Experience, Project } from '../types'

export default function EditProfileForm() {
  const router = useRouter()
  const { profile, experiences, projects, skills, academics, saveAll } = useProfile()

  const {
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FullProfileState>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profile: { ...profile },
      experiences: experiences.map((exp) => ({
        ...exp,
        achievements: [...exp.achievements],
      })),
      projects: projects.map((p) => ({
        ...p,
        tags: [...p.tags],
      })),
      skills: skills.map((s) => ({
        ...s,
        skills: [...s.skills],
      })),
      academics: { ...academics },
    },
    mode: 'onTouched',
  })

  const watchedProfile = watch('profile')
  const watchedExperiences = watch('experiences')
  const watchedProjects = watch('projects')
  const watchedSkills = watch('skills')
  const watchedAcademics = watch('academics')

  const handleCancel = () => {
    router.push('/student/profile')
  }

  const handleSave = (e?: FormEvent | MouseEvent) => {
    if (e) e.preventDefault()

    const currentValues = getValues()
    const result = profileFormSchema.safeParse(currentValues)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        setError(path as unknown as `profile.${keyof ProfileData}`, {
          type: issue.code,
          message: issue.message,
        })
      }
      return
    }

    clearErrors()
    // Local persistence via ProfileContext
    saveAll(result.data as FullProfileState)
    // Structured hook for future backend API integration
    void saveProfileToApi(result.data as FullProfileState)
    router.push('/student/profile')
  }

  // Extract structured errors for section components
  const profileErrors: Partial<Record<keyof ProfileData, string>> = {
    name: errors.profile?.name?.message,
    degree: errors.profile?.degree?.message,
    github: errors.profile?.github?.message,
    email: errors.profile?.email?.message,
    resumeLink: errors.profile?.resumeLink?.message,
  }

  const academicErrors: Partial<Record<keyof AcademicData, string>> = {
    gpa: errors.academics?.gpa?.message,
    expectedGraduation: errors.academics?.expectedGraduation?.message,
    major: errors.academics?.major?.message,
  }

  const experienceErrors: Record<number, Partial<Record<keyof Experience, string>>> = {}
  if (Array.isArray(errors.experiences)) {
    errors.experiences.forEach((expErr, idx) => {
      if (expErr) {
        experienceErrors[idx] = {
          title: expErr.title?.message,
          company: expErr.company?.message,
          endDate: expErr.endDate?.message,
        }
      }
    })
  }

  const projectErrors: Record<number, Partial<Record<keyof Project, string>>> = {}
  if (Array.isArray(errors.projects)) {
    errors.projects.forEach((projErr, idx) => {
      if (projErr) {
        projectErrors[idx] = {
          title: projErr.title?.message,
          description: projErr.description?.message,
          endDate: projErr.endDate?.message,
        }
      }
    })
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border-subtle px-5 py-2.5 flex items-center justify-between shadow-xs">
        <Link
          href="/student/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Profile
        </Link>

        <a
          href="/help"
          className="text-sm text-text-muted hover:text-text-main transition-colors duration-150 flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          Need Help?
        </a>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Edit Profile</h1>
              <p className="text-sm text-text-muted mt-1">
                Update your information, technical skills, experiences, and academic achievements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleCancel} variant="secondary" size="md">
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-profile-form"
                variant="primary"
                size="md"
                onClick={handleSave}
              >
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <form id="edit-profile-form" onSubmit={handleSave} className="space-y-6 sm:space-y-8">
          <BasicInfoSection
            data={watchedProfile}
            onChange={(updatedProfile) =>
              setValue('profile', updatedProfile, { shouldValidate: true, shouldDirty: true })
            }
            errors={profileErrors}
          />

          <SkillsEditSection
            categories={watchedSkills}
            onChange={(updatedSkills) =>
              setValue('skills', updatedSkills, { shouldValidate: true, shouldDirty: true })
            }
          />

          <ExperienceEditSection
            experiences={watchedExperiences}
            onChange={(updatedExperiences) =>
              setValue('experiences', updatedExperiences, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            errors={experienceErrors}
          />

          <ProjectsEditSection
            projects={watchedProjects}
            onChange={(updatedProjects) =>
              setValue('projects', updatedProjects, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            errors={projectErrors}
          />

          <AcademicsEditSection
            academics={watchedAcademics}
            onChange={(updatedAcademics) =>
              setValue('academics', updatedAcademics, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            errors={academicErrors}
          />
        </form>
      </main>
    </>
  )
}
