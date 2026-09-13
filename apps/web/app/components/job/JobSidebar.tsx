import React from 'react'
import { Building2, Users, Calendar, Code2 } from 'lucide-react'
import { Job } from '../../types/job'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const JobSidebar = ({ job }: { job: Job }) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-lg font-bold">Company Overview</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Industry</p>
            <p className="font-medium">{job.companyOverview?.industry ?? 'Technology'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Company Size</p>
            <p className="font-medium">{job.companyOverview?.size ?? '50-200 employees'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Founded</p>
            <p className="font-medium">{job.companyOverview?.founded ?? '2020'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Code2 className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Tech Stack</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(job.companyOverview?.techStack ?? ['TypeScript', 'Next.js', 'Hono']).map(
                (tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-xs font-normal">
                    {tech}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
