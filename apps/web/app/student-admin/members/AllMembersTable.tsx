'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'

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

import { deleteMembers, fetchMembers, membersQueryKey } from './members-data'

export default function AllMembersTable() {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[] | null>(null)

  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMembers,
    onSuccess: (_data, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey })
      setSelectedIds((prev) => prev.filter((id) => !deletedIds.includes(id)))
    },
  })

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return members
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.usn.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    )
  }, [members, search])

  const filteredIds = filteredMembers.map((m) => m.id)
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id))

  function toggle(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...filteredIds]))
      }
      return prev.filter((id) => !filteredIds.includes(id))
    })
  }

  function confirmDelete() {
    if (pendingDeleteIds && pendingDeleteIds.length > 0) {
      deleteMutation.mutate(pendingDeleteIds)
    }
    setPendingDeleteIds(null)
  }

  if (isLoading) {
    return <p className="p-4 text-gray-500">Loading members…</p>
  }

  if (isError) {
    return <p className="p-4 text-red-500">Couldn&apos;t load members.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, USN, or email"
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
              <th className="py-3 px-4 w-12 text-xs font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all members"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">USN / Username</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Email</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Joined Date</th>
              <th className="py-3 px-4 w-12 text-xs font-semibold text-gray-600 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.id)}
                    onChange={() => toggle(member.id)}
                    aria-label={`Select ${member.name}`}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{member.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{member.usn}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                    {member.email}
                  </a>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{member.joinedDate}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteIds([member.id])}
                    disabled={deleteMutation.isPending}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-rose-50 transition-all active:scale-95 inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                    aria-label={`Delete ${member.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteMutation.isError && (
        <p className="text-sm text-red-500">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'Failed to delete member(s)'}
        </p>
      )}

      {/* Delete Action Button */}
      <div className="flex justify-start">
        <Button
          variant="destructive"
          onClick={() => setPendingDeleteIds(selectedIds)}
          disabled={selectedIds.length === 0 || deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting…' : `Delete Selected (${selectedIds.length})`}
        </Button>
      </div>

      {/* Confirm Delete Alert Dialog */}
      <AlertDialog
        open={pendingDeleteIds !== null}
        onOpenChange={(open) => !open && setPendingDeleteIds(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeleteIds && pendingDeleteIds.length === 1
                ? 'Delete this member?'
                : `Delete ${pendingDeleteIds?.length ?? 0} members?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove{' '}
              {pendingDeleteIds && pendingDeleteIds.length === 1 ? 'this member' : 'these members'}{' '}
              from the roster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
