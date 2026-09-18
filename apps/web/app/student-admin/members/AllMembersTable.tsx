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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  const someSelected = filteredIds.some((id) => selectedIds.includes(id))

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
    return <p className="p-4 text-text-muted">Loading members…</p>
  }

  if (isError) {
    return <p className="p-4 text-red-500">Couldn&apos;t load members.</p>
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <Input
          placeholder="Search by name, USN, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                aria-label="Select all members"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>USN</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(member.id)}
                  onCheckedChange={() => toggle(member.id)}
                  aria-label={`Select ${member.name}`}
                />
              </TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.usn}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.joinedDate}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingDeleteIds([member.id])}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredMembers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-text-muted">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {deleteMutation.isError && (
        <p className="text-sm text-red-500">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'Failed to delete member(s)'}
        </p>
      )}

      <Button
        variant="destructive"
        onClick={() => setPendingDeleteIds(selectedIds)}
        disabled={selectedIds.length === 0 || deleteMutation.isPending}
        className="self-start"
      >
        {deleteMutation.isPending ? 'Deleting…' : `Delete Selected (${selectedIds.length})`}
      </Button>

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
