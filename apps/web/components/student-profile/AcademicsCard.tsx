import { Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { defaultAcademics } from './ProfileContext'
import type { AcademicData } from './types'

function AcademicRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 first:pt-0">
      <dt className="text-sm text-text-muted font-normal">{label}</dt>
      <dd className="text-sm font-semibold text-text-main text-right">{value}</dd>
    </div>
  )
}

export default function AcademicsCard({
  academics = defaultAcademics,
}: {
  academics?: AcademicData
}) {
  const rows = [
    { label: 'GPA', value: academics.gpa },
    { label: 'Major', value: academics.major },
    { label: 'Minor', value: academics.minor },
    { label: 'Honors', value: academics.honors },
  ]

  return (
    <Card as="section" className="p-6 sm:p-7">
      <h2 className="text-lg font-bold text-text-main tracking-tight mb-4">Academics</h2>

      <dl className="divide-y divide-border-subtle">
        {rows.map((row) => (
          <AcademicRow key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>

      <div className="mt-4 bg-brand-light/80 rounded-2xl p-4 text-center border border-brand-mint/50 transition-all hover:bg-brand-light">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-brand-dark" />
          <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
            Expected Graduation
          </span>
        </div>
        <p className="text-sm font-bold text-text-main">
          <time>{academics.expectedGraduation}</time>
        </p>
      </div>
    </Card>
  )
}
