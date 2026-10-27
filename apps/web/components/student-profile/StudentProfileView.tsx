'use client'

import Header from '@/components/common/Header'
import {
  ProfileHeader,
  ExperienceTimeline,
  ProjectsGrid,
  SkillsCard,
  AcademicsCard,
} from '@/components/student-profile'
import { useProfile } from '@/components/student-profile/ProfileContext'
import { cn } from '@/lib/utils'

export default function StudentProfileView() {
  const { profile, experiences, projects, skills, academics } = useProfile()

  const hasExperiences = experiences.length > 0
  const hasProjects = projects.length > 0
  const hasSkills = skills.length > 0
  const hasRightColumn = hasSkills || Boolean(academics)

  return (
    <>
      <Header />

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
              <AcademicsCard academics={academics} />
            </aside>
          )}
        </div>
      </main>
    </>
  )
}
