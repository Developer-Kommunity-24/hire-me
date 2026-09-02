'use client'

import { HelpCircle } from 'lucide-react'
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
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border-subtle px-5 py-2.5 flex items-center justify-end shadow-xs">
        <a
          href="/help"
          className="text-sm text-text-muted hover:text-text-main transition-colors duration-150 flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          Need Help?
        </a>
      </header>

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
