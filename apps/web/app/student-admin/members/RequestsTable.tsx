'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clock, Search, X } from 'lucide-react'
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

import {
  acceptMemberRequest,
  clubRequestsQueryKey,
  fetchClubRequests,
  membersQueryKey,
  rejectMemberRequest,
  type MemberRequest,
} from './members-data'

export default function RequestsTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pendingRejectItem, setPendingRejectItem] = useState<MemberRequest | null>(null)

  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: clubRequestsQueryKey,
    queryFn: fetchClubRequests,
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptMemberRequest(id),
    onSuccess: (_data, id) => {
      const acceptedReq = requests.find((r) => r.id === id)
      toast.success(
        acceptedReq
          ? `Request accepted! ${acceptedReq.name} is now a verified member.`
          : 'Request accepted! Member added with verified badge.',
      )
      queryClient.invalidateQueries({ queryKey: clubRequestsQueryKey })
      queryClient.invalidateQueries({ queryKey: membersQueryKey })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to accept request')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectMemberRequest(id),
    onSuccess: () => {
      toast.success('Request rejected.')
      queryClient.invalidateQueries({ queryKey: clubRequestsQueryKey })
      setPendingRejectItem(null)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reject request')
    },
  })

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return requests
    return requests.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.usn.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query),
    )
  }, [requests, search])

  if (isLoading) {
    return <p className="p-4 text-gray-500">Loading requests…</p>
  }

  if (isError) {
    return <p className="p-4 text-red-500">Couldn&apos;t load verification requests.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search requests by name, USN, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
        />
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Student Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">USN / Roll Number</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Email</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Submitted Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{req.name}</td>
                <td className="py-3 px-4 text-sm font-mono text-gray-600">{req.usn}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <a href={`mailto:${req.email}`} className="text-blue-600 hover:underline">
                    {req.email}
                  </a>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{req.submittedAt ?? '—'}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Review
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(req.id)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      aria-label={`Accept ${req.name}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingRejectItem(req)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      aria-label={`Reject ${req.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  No pending student requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog
        open={pendingRejectItem !== null}
        onOpenChange={(open) => !open && setPendingRejectItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject verification request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the verification request for{' '}
              <strong>{pendingRejectItem?.name}</strong> ({pendingRejectItem?.usn})? They will be
              notified of the decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRejectItem) {
                  rejectMutation.mutate(pendingRejectItem.id)
                }
              }}
            >
              {rejectMutation.isPending ? 'Rejecting…' : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
