'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  SlidersHorizontal,
  FileText,
  AlertCircle,
  RotateCcw,
  List as ListIcon,
  LayoutGrid,
  HelpCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import {
  DEFAULT_STUDENT_APPLICATIONS,
  type ApplicationStatus,
  type SortOption,
} from '@/lib/student-applications-api'
import {
  useStudentApplications,
  useWithdrawApplication,
  useApplicationsMetrics,
} from '@/lib/hooks/use-student-applications'
import { useApplicationsStore } from '@/lib/stores/use-applications-store'
import { MetricCards } from './components/MetricCards'
import { ApplicationCard } from './components/ApplicationCard'
import { Pagination } from './components/Pagination'
import { cn } from '@/lib/utils'

export default function StudentApplicationsPage() {
  // TanStack Query (Server State)
  const {
    data: applications = DEFAULT_STUDENT_APPLICATIONS,
    isLoading,
    isError,
    refetch,
  } = useStudentApplications()
  const withdrawMutation = useWithdrawApplication()

  // Zustand Store (Client UI State)
  const searchQuery = useApplicationsStore((s) => s.search)
  const setSearchQuery = useApplicationsStore((s) => s.setSearch)
  const selectedStatus = useApplicationsStore((s) => s.selectedStatus)
  const setSelectedStatus = useApplicationsStore((s) => s.setSelectedStatus)
  const sortBy = useApplicationsStore((s) => s.sortBy)
  const setSortBy = useApplicationsStore((s) => s.setSortBy)
  const viewMode = useApplicationsStore((s) => s.viewMode)
  const setViewMode = useApplicationsStore((s) => s.setViewMode)
  const expandedCardId = useApplicationsStore((s) => s.expandedAppId)
  const toggleExpanded = useApplicationsStore((s) => s.toggleExpanded)
  const currentPage = useApplicationsStore((s) => s.currentPage)
  const setCurrentPage = useApplicationsStore((s) => s.setCurrentPage)
  const pageSize = useApplicationsStore((s) => s.pageSize)
  const setPageSize = useApplicationsStore((s) => s.setPageSize)
  const resetFilters = useApplicationsStore((s) => s.resetFilters)

  // Local dialog UI state
  const [showFilterPills, setShowFilterPills] = useState(false)
  const [withdrawCandidateId, setWithdrawCandidateId] = useState<string | null>(null)

  // Calculate live metrics using TanStack data
  const metrics = useApplicationsMetrics(applications)

  // Filter & sort applications
  const filteredApplications = useMemo(() => {
    let list = [...applications]

    // Filter by status
    if (selectedStatus !== 'all') {
      list = list.filter((app) => app.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (app) =>
          app.roleTitle.toLowerCase().includes(q) ||
          app.companyName.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          app.status.toLowerCase().includes(q) ||
          app.currentMilestone.toLowerCase().includes(q) ||
          app.stack?.some((tech) => tech.toLowerCase().includes(q)),
      )
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'status') {
        const statusRank: Record<ApplicationStatus, number> = {
          accepted: 1,
          interviewing: 2,
          under_review: 3,
          applied: 4,
          rejected: 5,
        }
        return (statusRank[a.status] || 99) - (statusRank[b.status] || 99)
      }
      if (sortBy === 'date-desc') {
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      }
      if (sortBy === 'date-asc') {
        return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName)
      }
      return 0
    })

    return list
  }, [applications, selectedStatus, searchQuery, sortBy])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize))
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredApplications.slice(start, start + pageSize)
  }, [filteredApplications, currentPage, pageSize])

  // Handle status filter change
  const handleSelectStatus = (status: ApplicationStatus | 'all') => {
    setSelectedStatus(status)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle withdraw confirm
  const handleConfirmWithdraw = async () => {
    if (!withdrawCandidateId) return

    try {
      await withdrawMutation.mutateAsync(withdrawCandidateId)
    } finally {
      setWithdrawCandidateId(null)
    }
  }

  // Status filter pills
  const statusTabs: { id: ApplicationStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: metrics.total },
    { id: 'interviewing', label: 'Interviewing', count: metrics.interviewing },
    { id: 'accepted', label: 'Offers', count: metrics.offers },
    { id: 'under_review', label: 'Under Review', count: metrics.underReview },
    { id: 'applied', label: 'Applied', count: metrics.applied },
    { id: 'rejected', label: 'Rejected', count: metrics.rejected },
  ]

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in font-sans">
      {/* Top Bar: Need Help Header */}
      <div className="flex items-center justify-between pb-2">
        <div />
        <Link
          href="#help"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Need Help?</span>
        </Link>
      </div>

      {/* Main Header with Title & Top-Right Filter/Sort Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your ongoing job and internship applications.
          </p>
        </div>

        {/* Top Right Controls: Filters Button + Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilterPills(!showFilterPills)}
            aria-label="Toggle filters"
            aria-expanded={showFilterPills}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs',
              showFilterPills || selectedStatus !== 'all'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {selectedStatus !== 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <div className="relative">
            <select
              value={sortBy}
              aria-label="Sort applications"
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none text-xs font-medium bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="status">Sort By: Status</option>
              <option value="date-desc">Sort By: Newest</option>
              <option value="date-asc">Sort By: Oldest</option>
              <option value="company">Sort By: Company</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {isError && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to synchronize applications with the server. Using cached data.</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Summary Cards Row */}
      <section aria-label="Application Metrics Summary" className="border-b border-slate-100 pb-5">
        <MetricCards
          metrics={metrics}
          selectedStatus={selectedStatus}
          onSelectStatus={handleSelectStatus}
        />
      </section>

      {/* Collapsible Filter Pills Panel */}
      {showFilterPills && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none animate-fade-in">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectStatus(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded-full',
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Search Input Bar + List/Grid View Mode Toggles */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or status..."
            className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Mode Switcher: List vs Grid */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 bg-white shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
              viewMode === 'grid'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>
      </section>

      {/* Comprehensive Applications List with Accordion Expand */}
      <section aria-label="Application Status List" className="space-y-4">
        {isLoading && applications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2.5 w-1/2">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="h-8 bg-slate-100 rounded-lg w-24" />
              </div>
            ))}
          </div>
        ) : paginatedApplications.length > 0 ? (
          <div
            className={cn(
              viewMode === 'list'
                ? 'space-y-3.5'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4',
            )}
          >
            {paginatedApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                isExpanded={expandedCardId === app.id}
                onToggleExpand={() => toggleExpanded(app.id)}
                onWithdraw={(id) => setWithdrawCandidateId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedStatus !== 'all'
                ? 'No applications match your active search or filters.'
                : 'You have not submitted any job applications yet.'}
            </p>
            {(searchQuery || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredApplications.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          pageSizeOptions={[6, 12, 24]}
        />
      </section>

      {/* Withdraw Confirmation Modal */}
      {withdrawCandidateId && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setWithdrawCandidateId(null)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4 animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Withdraw Application?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to withdraw this application? The hiring team will be notified
                and your scheduled interviews will be cancelled. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawCandidateId(null)}
                disabled={withdrawMutation.isPending}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawMutation.isPending}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {withdrawMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Withdrawal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
