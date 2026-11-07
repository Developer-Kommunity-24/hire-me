'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, Clock } from 'lucide-react'

import AddMembers from './AddMemberForm'
import BulkImportForm from './BulkImportForm'
import AllMembersTable from './AllMembersTable'
import { fetchMembers, membersQueryKey } from './members-data'

type TabValue = 'all' | 'individual' | 'bulk'

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('bulk')

  const { data: members = [] } = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  })

  const totalMembers = members.length > 0 ? members.length : 128

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Members</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Total Members</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3">{totalMembers}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span>Active This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3">34</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Pending Invites</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3">5</div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8" role="tablist" aria-label="Member management tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'all'
                ? 'border-gray-900 text-gray-900 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Members
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'individual'}
            onClick={() => setActiveTab('individual')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'individual'
                ? 'border-gray-900 text-gray-900 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Individually
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bulk'}
            onClick={() => setActiveTab('bulk')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'bulk'
                ? 'border-gray-900 text-gray-900 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Import
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'all' && <AllMembersTable />}
        {activeTab === 'individual' && <AddMembers />}
        {activeTab === 'bulk' && <BulkImportForm />}
      </div>
    </div>
  )
}
