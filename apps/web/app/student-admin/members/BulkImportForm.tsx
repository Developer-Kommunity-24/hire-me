'use client'

import { useRef, useState } from 'react'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { importMembers, membersQueryKey } from './members-data'

const memberRowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Invalid email'),
  avatarInitials: z.string().optional(),
  avatarColor: z.string().optional(),
})

type MemberRow = z.infer<typeof memberRowSchema> & { error?: string }

const initialPreviewRows: MemberRow[] = [
  {
    id: '1',
    name: 'Priya Nair',
    username: 'priyan',
    email: 'priyan@stanford.edu',
    avatarInitials: 'PN',
    avatarColor: 'bg-slate-700',
  },
  {
    id: '2',
    name: 'Marcus Webb',
    username: 'mwebb22',
    email: 'mwebb22@stanford.edu',
    avatarInitials: 'MW',
    avatarColor: 'bg-amber-700',
  },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  const first = parts[0][0] ?? ''
  const second = parts[parts.length - 1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

const colorPalette = [
  'bg-slate-700',
  'bg-amber-700',
  'bg-emerald-700',
  'bg-indigo-700',
  'bg-teal-700',
  'bg-rose-700',
]

export default function BulkImportForm() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<MemberRow[]>(initialPreviewRows)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingRow, setEditingRow] = useState<MemberRow | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: importMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey })
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 4000)
    },
  })

  async function processFile(file: File) {
    const text = await file.text()
    const lines = text
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length <= 1) return

    const parsedRows: MemberRow[] = lines.slice(1).map((line, idx) => {
      const [name = '', username = '', email = ''] = line.split(',').map((val) => val.trim())
      const id = String(Date.now() + idx)
      const initials = getInitials(name)
      const color = colorPalette[idx % colorPalette.length]

      const result = memberRowSchema.safeParse({ id, name, username, email })
      return result.success
        ? { id, name, username, email, avatarInitials: initials, avatarColor: color }
        : {
            id,
            name,
            username,
            email,
            avatarInitials: initials,
            avatarColor: color,
            error: result.error.issues[0]?.message,
          }
    })

    setRows(parsedRows)
    setSelectedIds([])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
      e.target.value = ''
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelectedIds(rows.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const allSelected = rows.length > 0 && selectedIds.length === rows.length
  const hasErrors = rows.some((row) => row.error)

  function handleImport() {
    if (rows.length === 0 || hasErrors) return
    const toImport = selectedIds.length > 0 ? rows.filter((r) => selectedIds.includes(r.id)) : rows

    mutation.mutate(toImport.map(({ name, username, email }) => ({ name, usn: username, email })))
  }

  function saveEditedRow(updated: MemberRow) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setEditingRow(null)
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Upload Dropzone Container */}
      <div className="flex flex-col items-center mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="w-72 sm:w-80 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-white shadow-2xs"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload CSV file"
        >
          <Upload className="w-6 h-6 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Drag and drop your CSV file here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload CSV Button */}
        <div className="mt-3">
          <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="py-3 px-4 text-xs font-semibold text-gray-600 w-16">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    aria-label="Select all rows"
                  />
                  <span>Check</span>
                </div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Name</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Username</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600">Email</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-right w-16">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isChecked = selectedIds.includes(row.id)
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50/60 transition-colors ${
                    row.error ? 'bg-red-50/70' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full text-white text-[11px] font-semibold flex items-center justify-center shrink-0 ${
                          row.avatarColor || 'bg-slate-700'
                        }`}
                      >
                        {row.avatarInitials || getInitials(row.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-normal">{row.username}</td>
                  <td className="py-3 px-4 text-sm">
                    <a
                      href={`mailto:${row.email}`}
                      className="text-blue-600 hover:underline font-normal"
                    >
                      {row.email}
                    </a>
                    {row.error && (
                      <span className="block text-xs text-red-500 mt-0.5">{row.error}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingRow(row)}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95 inline-flex items-center justify-center cursor-pointer"
                      aria-label={`Edit ${row.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  No members loaded. Upload a CSV file above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action / Status Area */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-4">
        <Button
          type="button"
          onClick={handleImport}
          disabled={rows.length === 0 || hasErrors || mutation.isPending}
        >
          {mutation.isPending ? 'Importing…' : 'Import Members'}
        </Button>

        {importSuccess && (
          <p className="text-sm font-medium text-emerald-600">Members imported successfully!</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-red-500">
            {mutation.error instanceof Error ? mutation.error.message : 'Import failed'}
          </p>
        )}
      </div>

      {/* Edit Row Modal */}
      {editingRow && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-dialog-title"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-dialog-title" className="text-base font-bold text-gray-900">
                Edit Member Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const name = String(formData.get('name') || '').trim()
                const username = String(formData.get('username') || '').trim()
                const email = String(formData.get('email') || '').trim()

                saveEditedRow({
                  ...editingRow,
                  name,
                  username,
                  email,
                  avatarInitials: getInitials(name),
                  error: undefined,
                })
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  defaultValue={editingRow.name}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-username"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="edit-username"
                  name="username"
                  defaultValue={editingRow.username}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingRow.email}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRow(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
