import { BriefcaseBusiness, Users, Clock3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MetricCardProps = {
  title: string
  value: number
  delta: string
}

const icons = {
  'Active Jobs': BriefcaseBusiness,
  'Total Applicants': Users,
  'Pending Reviews': Clock3,
}

export default function MetricCard({ title, value, delta }: MetricCardProps) {
  const Icon = icons[title as keyof typeof icons]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
        {delta && <p className="text-xs text-muted-foreground">{delta}</p>}
      </CardContent>
    </Card>
  )
}
