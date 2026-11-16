'use client'

import Link from 'next/link'
import { AlertCircle, RefreshCw, User } from 'lucide-react'
import Header from '@/components/common/Header'
import {
  ProfileHeader,
  ExperienceTimeline,
  ProjectsGrid,
  SkillsCard,
  AcademicsCard,
} from '@/components/student-profile'
import { mapStudentProfileToFullProfileState } from '@/components/student-profile/api'
import {
  useStudentExperiences,
  useStudentProfile,
  useStudentProjects,
} from '@/lib/hooks/use-student-profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function ProfileLoadingState() {
  return (
    <>
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto animate-fade-in">
        <div className="grid grid-cols-1 gap-6 sm:gap-7 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6 sm:space-y-7 min-w-0">
            <div className="h-52 w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
          </div>
          <aside className="space-y-6 sm:space-y-7" aria-label="Profile sidebar">
            <div className="h-80 w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
          </aside>
        </div>
      </main>
    </>
  )
}

function ProfileErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto animate-fade-in">
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

function ProfileEmptyState() {
  return (
    <>
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto animate-fade-in">
        <Card>
          <CardContent>
            <div className="py-14 text-center">
              <User className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h1 className="text-lg font-bold text-text-main">No profile data found</h1>
              <p className="text-sm text-text-muted mt-1 mb-5">
                Add your details to help recruiters learn more about you.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default function StudentProfileView() {
  const profileQuery = useStudentProfile()
  const projectsQuery = useStudentProjects()
  const experiencesQuery = useStudentExperiences()

  if (profileQuery.isPending) {
    return <ProfileLoadingState />
  }

  if (profileQuery.isError && !profileQuery.data) {
    return (
      <ProfileErrorState
        onRetry={() => {
          void profileQuery.refetch()
          void projectsQuery.refetch()
          void experiencesQuery.refetch()
        }}
      />
    )
  }

  if (!profileQuery.data) {
    return <ProfileEmptyState />
  }

  const { profile, experiences, projects, skills, academics } = mapStudentProfileToFullProfileState(
    profileQuery.data,
    projectsQuery.data ?? [],
    experiencesQuery.data ?? [],
  )

  const hasExperiences = experiences.length > 0
  const hasProjects = projects.length > 0
  const hasSkills = skills.some((category) => category.skills.length > 0)
  const hasAcademics = Boolean(
    academics.school ||
    academics.gpa ||
    academics.major ||
    academics.minor ||
    academics.honors ||
    academics.expectedGraduation,
  )
  const hasRightColumn = hasSkills || hasAcademics

  return (
    <>
      <Header userName={profile.name} />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto animate-fade-in">
        <div
          className={cn(
            'grid grid-cols-1 gap-6 sm:gap-7',
            hasRightColumn && 'xl:grid-cols-[1fr_300px]',
          )}
        >
          <div className="space-y-6 sm:space-y-7 min-w-0">
            <ProfileHeader profile={profile} />
            {hasExperiences && <ExperienceTimeline experiences={experiences} />}
            {hasProjects && <ProjectsGrid projects={projects} />}
          </div>

          {hasRightColumn && (
            <aside className="space-y-6 sm:space-y-7" aria-label="Profile sidebar">
              {hasSkills && <SkillsCard categories={skills} />}
              {hasAcademics && <AcademicsCard academics={academics} />}
            </aside>
          )}
        </div>
      </main>
    </>
  )
}
