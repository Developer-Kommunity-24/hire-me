import { BriefcaseBusiness, Users, Clock3 } from 'lucide-react'
type MetricCardProps = {
  title: string
  value: number
  delta: string
}

export default function MetricCard({ title, value, delta }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-text-main">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-page text-lg">
          {title === 'Active Jobs' && <BriefcaseBusiness />}
          {title === 'Total Applicants' && <Users />}
          {title === 'Pending Reviews' && <Clock3 />}
        </div>
      </div>

      <p className="mt-4 text-sm">
        <span className="font-semibold text-brand-green">{delta}</span>
      </p>
    </div>
  )
}
