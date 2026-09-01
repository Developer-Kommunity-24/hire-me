'use client'
import type { CandidateStatus } from '../data'

type TabId = CandidateStatus

type PipelineTabsProps = {
  activeTab: TabId
  onChange: (tab: TabId) => void
  counts: {
    applied: number
    under_review: number
    shortlisted: number
  }
}

export default function PipelineTabs({ activeTab, onChange, counts }: PipelineTabsProps) {
  const tabs = [
    {
      id: 'applied' as TabId,
      label: 'Applied',
      count: counts.applied,
    },
    {
      id: 'under_review' as TabId,
      label: 'Under Review',
      count: counts.under_review,
    },
    {
      id: 'shortlisted' as TabId,
      label: 'Shortlisted',
      count: counts.shortlisted,
    },
  ]

  return (
    <div className="flex gap-8 border-b border-gray-200">
      {tabs.map((tab) => {
        const active = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative pb-4 text-sm font-semibold transition ${
              active ? 'text-[#0F172A]' : 'text-[#6B7280] hover:text-[#0F172A]'
            }`}
          >
            {tab.label} ({tab.count})
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#00C378]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
