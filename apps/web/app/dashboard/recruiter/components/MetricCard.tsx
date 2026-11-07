import type { ComponentType } from 'react'
import { AlertCircle, Archive, Briefcase, BriefcaseBusiness, Clock3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MetricCardProps = {
  title: string
  value: number
  delta?: string
  icon?: ComponentType<{ className?: string }>
}

const defaultIcons: Record<string, ComponentType<{ className?: string }>> = {
  'Active Jobs': BriefcaseBusiness,
  'Total Applicants': Users,
  'Pending Reviews': Clock3,
  'Total Postings': Briefcase,
  'Active Postings': BriefcaseBusiness,
  'Closed Postings': Archive,
  'Expired Postings': AlertCircle,
}

export default function MetricCard({ title, value, delta, icon }: MetricCardProps) {
  const Icon = icon ?? defaultIcons[title]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
        {delta ? <p className="text-xs text-muted-foreground">{delta}</p> : null}
      </CardContent>
    </Card>
  )
}
