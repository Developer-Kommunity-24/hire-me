import React from 'react'
import { Job } from '../../types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const JobDetails = ({ job }: { job: Job }) => {
  const aboutRole = job.aboutRole ?? [job.description ?? 'No description provided.']
  const responsibilities = job.responsibilities ?? []
  const qualifications = job.qualifications ?? []

  return (
    <Card className="p-2 space-y-6 rounded-2xl">
      {/* About the Role */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">About the Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
        {aboutRole.map((paragraph: string, idx: number) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </CardContent>

      {/* Key Responsibilities */}
      {responsibilities.length > 0 && (
        <>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-lg font-bold">Key Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {responsibilities.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </>
      )}

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-lg font-bold">Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {qualifications.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </>
      )}
    </Card>
  )
}
