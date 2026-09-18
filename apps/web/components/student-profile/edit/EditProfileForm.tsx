'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle, Check } from 'lucide-react'
import { useForm, FormProvider } from 'react-hook-form'
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

  const methods = useForm<FullProfileState>({
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

  const {
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = methods

  const watchedProfile = watch('profile')
  const watchedAcademics = watch('academics')

  const handleCancel = () => {
    router.push('/student/profile')
  }

  const onSubmit = (data: FullProfileState) => {
    // Local persistence via ProfileContext
    saveAll(data)
    // Structured hook for future backend API integration
    void saveProfileToApi(data)
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
    <FormProvider {...methods}>
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
        <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-main">Edit Profile</h1>
                <p className="text-sm text-text-muted mt-1">
                  Update your information, technical skills, experiences, and academic achievements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleCancel} variant="secondary" size="default">
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="default">
                  <Check className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <BasicInfoSection
              data={watchedProfile}
              onChange={(updatedProfile) =>
                setValue('profile', updatedProfile, { shouldValidate: true, shouldDirty: true })
              }
              errors={profileErrors}
            />

            <SkillsEditSection control={control} />

            <ExperienceEditSection control={control} errors={experienceErrors} />

            <ProjectsEditSection control={control} errors={projectErrors} />

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
          </div>
        </form>
      </main>
    </FormProvider>
  )
}
