import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { defaultProjects } from './ProfileContext'
import type { Project } from './types'

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      as="article"
      className="p-6 sm:p-7 flex flex-col hover:-translate-y-1 hover:border-brand/40 hover:shadow-md cursor-default group transition-all duration-200"
    >
      <h3 className="font-bold text-text-main text-lg tracking-tight mb-2 group-hover:text-brand transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-text-muted mb-4 flex-1 leading-relaxed">{project.description}</p>
      <ul className="flex flex-wrap gap-2" aria-label={`Technologies used in ${project.title}`}>
        {project.tags.map((tag) => (
          <li key={tag}>
            <Badge variant="outline">{tag}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function ProjectsGrid({ projects = defaultProjects }: { projects?: Project[] }) {
  return (
    <section aria-labelledby="projects-heading">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-main mb-3.5">
        <span id="projects-heading">Projects</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {projects.map((project, idx) => (
          <ProjectCard key={project.id || `${project.title}-${idx}`} project={project} />
        ))}
      </div>
    </section>
  )
}
