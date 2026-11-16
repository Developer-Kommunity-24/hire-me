'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Check, RefreshCw, User } from 'lucide-react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Header from '@/components/common/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import BasicInfoSection from './BasicInfoSection'
import SkillsEditSection from './SkillsEditSection'
import ExperienceEditSection from './ExperienceEditSection'
import ProjectsEditSection from './ProjectsEditSection'
import AcademicsEditSection from './AcademicsEditSection'
import { profileFormSchema } from '../schema'
import { mapFullProfileStateToUpdateInput, mapStudentProfileToFullProfileState } from '../api'
import { useStudentProfile, useUpdateStudentProfile } from '@/lib/hooks/use-student-profile'
import type { FullProfileState, ProfileData, AcademicData, Experience, Project } from '../types'

function EditProfileLoadingState() {
  return (
    <>
      <Header backHref="/student/profile" backLabel="Back to Profile" />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto animate-fade-in">
        <div
          className="h-16 w-full animate-pulse rounded-xl bg-muted mb-6 sm:mb-8"
          aria-hidden="true"
        />
        <div className="space-y-6 sm:space-y-8">
          <div className="h-80 w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
          <div className="h-64 w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
        </div>
      </main>
    </>
  )
}

function EditProfileErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <Header backHref="/student/profile" backLabel="Back to Profile" />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto animate-fade-in">
        <Card>
          <CardContent>
            <div className="py-14 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h1 className="text-lg font-bold text-text-main">Unable to load your profile</h1>
              <p className="text-sm text-text-muted mt-1 mb-5">
                Something went wrong while fetching your profile. Please try again.
              </p>
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

function EditProfileEmptyState() {
  return (
    <>
      <Header backHref="/student/profile" backLabel="Back to Profile" />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto animate-fade-in">
        <Card>
          <CardContent>
            <div className="py-14 text-center">
              <User className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h1 className="text-lg font-bold text-text-main">No profile data found</h1>
              <p className="text-sm text-text-muted mt-1 mb-5">
                Your profile is not available right now. Return to your profile to try again.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/profile">Back to Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

function EditProfileFormContent({ initialData }: { initialData: FullProfileState }) {
  const router = useRouter()
  const updateProfile = useUpdateStudentProfile()

  const methods = useForm<FullProfileState>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profile: {
        ...initialData.profile,
        otherLinks: initialData.profile.otherLinks.map((link) => ({ ...link })),
      },
      experiences: initialData.experiences.map((exp) => ({
        ...exp,
        achievements: [...exp.achievements],
      })),
      projects: initialData.projects.map((project) => ({
        ...project,
        tags: [...project.tags],
      })),
      skills: initialData.skills.map((category) => ({
        ...category,
        skills: [...category.skills],
      })),
      academics: { ...initialData.academics },
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

  const handleProfileChange = (updatedProfile: ProfileData) => {
    setValue('profile', updatedProfile, { shouldValidate: true, shouldDirty: true })

    if (updatedProfile.graduationYear !== watchedProfile.graduationYear) {
      setValue(
        'academics',
        { ...watchedAcademics, expectedGraduation: updatedProfile.graduationYear ?? '' },
        { shouldValidate: true, shouldDirty: true },
      )
    }
  }

  const handleAcademicsChange = (updatedAcademics: AcademicData) => {
    setValue('academics', updatedAcademics, { shouldValidate: true, shouldDirty: true })

    if (updatedAcademics.expectedGraduation !== watchedAcademics.expectedGraduation) {
      setValue(
        'profile',
        { ...watchedProfile, graduationYear: updatedAcademics.expectedGraduation },
        { shouldValidate: true, shouldDirty: true },
      )
    }
  }

  const onSubmit = async (data: FullProfileState) => {
    try {
      await updateProfile.mutateAsync(mapFullProfileStateToUpdateInput(data))
      router.push('/student/profile')
    } catch {
      // The mutation hook surfaces the failure through a toast.
    }
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
      <Header
        userName={initialData.profile.name}
        backHref="/student/profile"
        backLabel="Back to Profile"
      />

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
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="default"
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  disabled={updateProfile.isPending}
                >
                  <Check className="w-4 h-4" />
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <BasicInfoSection
              data={watchedProfile}
              onChange={handleProfileChange}
              errors={profileErrors}
            />

            <SkillsEditSection control={control} />

            <ExperienceEditSection control={control} errors={experienceErrors} />

            <ProjectsEditSection control={control} errors={projectErrors} />

            <AcademicsEditSection
              academics={watchedAcademics}
              onChange={handleAcademicsChange}
              errors={academicErrors}
            />
          </div>
        </form>
      </main>
    </FormProvider>
  )
}

export default function EditProfileForm() {
  const { data, isPending, isError, refetch } = useStudentProfile()

  if (isPending) {
    return <EditProfileLoadingState />
  }

  if (isError && !data) {
    return <EditProfileErrorState onRetry={() => void refetch()} />
  }

  if (!data) {
    return <EditProfileEmptyState />
  }

  return <EditProfileFormContent initialData={mapStudentProfileToFullProfileState(data)} />
}
