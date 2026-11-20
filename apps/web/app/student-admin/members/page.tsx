'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, Clock } from 'lucide-react'

import AddMembers from './AddMemberForm'
import BulkImportForm from './BulkImportForm'
import AllMembersTable from './AllMembersTable'
import RequestsTable from './RequestsTable'
import {
  fetchMembers,
  membersQueryKey,
  fetchClubRequests,
  clubRequestsQueryKey,
} from './members-data'

type TabValue = 'all' | 'requests' | 'individual' | 'bulk'

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  const { data: members = [] } = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  })

  const { data: requests = [] } = useQuery({
    queryKey: clubRequestsQueryKey,
    queryFn: fetchClubRequests,
  })

  const totalMembers = members.length

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Members</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between text-left hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Total Members</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3">{totalMembers}</div>
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span>Active This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3">34</div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between text-left hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-gray-500 text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Requests</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-3 flex items-center justify-between">
            <span>{requests.length}</span>
            {requests.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Action required
              </span>
            )}
          </div>
        </button>
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
            aria-selected={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-gray-900 text-gray-900 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {requests.length}
              </span>
            )}
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
        {activeTab === 'requests' && <RequestsTable />}
        {activeTab === 'individual' && <AddMembers />}
        {activeTab === 'bulk' && <BulkImportForm />}
      </div>
    </div>
  )
}
