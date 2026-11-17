'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  adminQueryKeys,
  appointClubAdmin,
  createAdminClub,
  fetchAdminClubs,
  fetchAdminStats,
  fetchClubAdmins,
  fetchEligibleStudents,
  removeClubAdmin,
  type ClubAdminItem,
} from '@/lib/admin-api'

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'clubs'>('admins')

  // Search State for Student Admins Table
  const [adminSearch, setAdminSearch] = useState('')

  // Appoint Admin Modal State
  const [isAppointOpen, setIsAppointOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedClubId, setSelectedClubId] = useState('')

  // Create Club Modal State
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [newClubSlug, setNewClubSlug] = useState('')

  // Revoke Admin Confirmation
  const [pendingRevokeAdmin, setPendingRevokeAdmin] = useState<ClubAdminItem | null>(null)

  // Queries
  const { data: stats } = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
  })

  const { data: clubs = [] } = useQuery({
    queryKey: adminQueryKeys.clubs,
    queryFn: fetchAdminClubs,
  })

  const { data: clubAdmins = [], isLoading: isLoadingAdmins } = useQuery({
    queryKey: adminQueryKeys.clubAdmins,
    queryFn: fetchClubAdmins,
  })

  const { data: eligibleStudents = [] } = useQuery({
    queryKey: adminQueryKeys.students(studentSearch),
    queryFn: () => fetchEligibleStudents(studentSearch),
    enabled: isAppointOpen,
  })

  // Mutations
  const appointMutation = useMutation({
    mutationFn: (vars: { userId: string; clubId: string }) => appointClubAdmin(vars),
    onSuccess: () => {
      toast.success('Student assigned as Club Admin successfully!')
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clubAdmins })
      setIsAppointOpen(false)
      setSelectedStudentId('')
      setSelectedClubId('')
      setStudentSearch('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to appoint club admin')
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => removeClubAdmin(userId),
    onSuccess: () => {
      toast.success('Club Admin role removed successfully!')
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clubAdmins })
      setPendingRevokeAdmin(null)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove club admin')
    },
  })

  const createClubMutation = useMutation({
    mutationFn: (input: { name: string; slug: string }) => createAdminClub(input),
    onSuccess: () => {
      toast.success('Club created successfully!')
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.clubs })
      setIsCreateClubOpen(false)
      setNewClubName('')
      setNewClubSlug('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create club')
    },
  })

  // Filtered Club Admins
  const filteredAdmins = clubAdmins.filter(
    (item) =>
      item.userName.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.clubName.toLowerCase().includes(adminSearch.toLowerCase()),
  )

  const handleAppointSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedClubId) {
      toast.error('Please select both a student and a club')
      return
    }
    appointMutation.mutate({ userId: selectedStudentId, clubId: selectedClubId })
  }

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClubName.trim() || !newClubSlug.trim()) {
      toast.error('Name and slug are required')
      return
    }
    createClubMutation.mutate({ name: newClubName.trim(), slug: newClubSlug.trim().toLowerCase() })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Super Administrator Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign students as Student Admins, manage campus clubs, and monitor system metrics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admins'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Admins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clubs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clubs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Metrics
          </button>
        </div>
      </div>

      {/* Overview Tab: Metric Cards */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Students</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{stats.students}</div>
              <p className="text-xs text-slate-500 mt-1">Registered candidate profiles</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Recruiters</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{stats.recruiters}</div>
              <p className="text-xs text-slate-500 mt-1">Hiring companies and reps</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Active Job Postings</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{stats.postings}</div>
              <p className="text-xs text-slate-500 mt-1">Open campus opportunities</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Applications</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{stats.applications}</div>
              <p className="text-xs text-slate-500 mt-1">Total candidate submissions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">
              Application Pipeline Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Live count of candidate applications in each evaluation stage.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Applied</span>
                <span className="text-lg font-bold text-slate-900">
                  {stats.applicationsByStatus?.applied ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-700 block">Under Review</span>
                <span className="text-lg font-bold text-blue-900">
                  {stats.applicationsByStatus?.under_review ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-xs text-purple-700 block">Shortlisted</span>
                <span className="text-lg font-bold text-purple-900">
                  {stats.applicationsByStatus?.shortlisted ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 block">Accepted</span>
                <span className="text-lg font-bold text-emerald-900">
                  {stats.applicationsByStatus?.accepted ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs text-rose-700 block">Rejected</span>
                <span className="text-lg font-bold text-rose-900">
                  {stats.applicationsByStatus?.rejected ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Admins Management */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by student name, email, or club..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            <Button onClick={() => setIsAppointOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Appoint Student Admin</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200/80">
              <h2 className="text-base font-semibold text-slate-900">
                Assigned Club Administrators
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students listed here receive the &ldquo;Student Admin&rdquo; navigation link in
                their sidebar and can manage club rosters.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Club</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingAdmins ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Loading administrators…
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No student administrators assigned yet. Click &ldquo;Appoint Student
                        Admin&rdquo; above.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((item) => (
                      <tr key={item.userId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{item.userName}</td>
                        <td className="py-3 px-4 text-slate-600">{item.userEmail}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.clubName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setPendingRevokeAdmin(item)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label={`Revoke admin role from ${item.userName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Clubs Management */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-900">Campus Clubs Directory</h2>
            <Button onClick={() => setIsCreateClubOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Create New Club</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Club Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clubs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      No clubs found.
                    </td>
                  </tr>
                ) : (
                  clubs.map((club) => (
                    <tr key={club.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{club.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{club.slug}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            club.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {club.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Appoint Student Admin */}
      <AlertDialog open={isAppointOpen} onOpenChange={setIsAppointOpen}>
        <AlertDialogContent>
          <form onSubmit={handleAppointSubmit}>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <AlertDialogTitle>Appoint Student Administrator</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Assigning a student to a club grants them the &ldquo;club_admin&rdquo; role. They
                will instantly receive the Student Admin menu item in their sidebar.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-4">
              {/* Select Student */}
              <div className="space-y-1.5">
                <Label htmlFor="student-search">Search Student</Label>
                <Input
                  id="student-search"
                  placeholder="Filter students by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />

                <div className="mt-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {eligibleStudents.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      No matching students found.
                    </div>
                  ) : (
                    eligibleStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStudentId(s.id)}
                        className={`w-full text-left p-2.5 text-xs transition-colors flex items-center justify-between ${
                          selectedStudentId === s.id
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{s.fullName}</div>
                          <div className="text-slate-400">{s.email}</div>
                        </div>
                        {selectedStudentId === s.id && (
                          <span className="text-emerald-600 font-bold">Selected</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Select Club */}
              <div className="space-y-1.5">
                <Label htmlFor="club-select">Assign to Club</Label>
                <select
                  id="club-select"
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose a campus club --</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={() => setIsAppointOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={appointMutation.isPending || !selectedStudentId || !selectedClubId}
              >
                {appointMutation.isPending ? 'Assigning…' : 'Appoint as Student Admin'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: Create Club */}
      <AlertDialog open={isCreateClubOpen} onOpenChange={setIsCreateClubOpen}>
        <AlertDialogContent>
          <form onSubmit={handleCreateClubSubmit}>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Campus Club</AlertDialogTitle>
              <AlertDialogDescription>
                Add a new campus organization to which Student Admins and members can be attached.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="club-name">Club Name</Label>
                <Input
                  id="club-name"
                  placeholder="e.g. Developer Kommunity 24"
                  value={newClubName}
                  onChange={(e) => {
                    setNewClubName(e.target.value)
                    if (!newClubSlug) {
                      setNewClubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="club-slug">Slug Identifier</Label>
                <Input
                  id="club-slug"
                  placeholder="e.g. dk24"
                  value={newClubSlug}
                  onChange={(e) => setNewClubSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={() => setIsCreateClubOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={createClubMutation.isPending || !newClubName || !newClubSlug}
              >
                {createClubMutation.isPending ? 'Creating…' : 'Create Club'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation: Revoke Admin Dialog */}
      <AlertDialog
        open={pendingRevokeAdmin !== null}
        onOpenChange={(open) => !open && setPendingRevokeAdmin(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Student Admin Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {pendingRevokeAdmin?.userName} as the administrator of{' '}
              {pendingRevokeAdmin?.clubName}? They will immediately lose access to the Student Admin
              portal and member roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRevokeAdmin) {
                  revokeMutation.mutate(pendingRevokeAdmin.userId)
                }
              }}
            >
              {revokeMutation.isPending ? 'Revoking…' : 'Revoke Admin Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
