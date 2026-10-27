'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CandidateStatus } from '../data'

type PipelineTabsProps = {
  activeTab: CandidateStatus
  onChange: (tab: CandidateStatus) => void
  counts: {
    applied: number
    under_review: number
    shortlisted: number
  }
}

const tabs: {
  value: CandidateStatus
  label: string
}[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
]

export default function PipelineTabs({ activeTab, onChange, counts }: PipelineTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value: string) => onChange(value as CandidateStatus)}>
      <div className="w-full">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs">
                {counts[tab.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
