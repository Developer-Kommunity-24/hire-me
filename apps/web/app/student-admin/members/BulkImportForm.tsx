'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { importMembers, membersQueryKey } from './members-data'

// ---- Schema ----
const memberRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  usn: z
    .string()
    .min(3, 'USN must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Invalid email'),
})

type MemberRow = z.infer<typeof memberRowSchema> & { error?: string }

export default function BulkImportForm() {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<MemberRow[]>([])

  const mutation = useMutation({
    mutationFn: importMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey })
      setRows([])
    },
  })

  async function processFile(file: File) {
    const text = await file.text()

    // Normalize \r\n, \r, and \n line endings, and drop blank lines
    // (including a trailing empty line at the end of the file).
    const lines = text
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const parsedRows: MemberRow[] = lines.slice(1).map((line) => {
      const [name = '', usn = '', email = ''] = line.split(',').map((value) => value.trim())

      const result = memberRowSchema.safeParse({ name, usn, email })
      return result.success
        ? { name, usn, email }
        : { name, usn, email, error: result.error.issues[0]?.message }
    })

    setRows(parsedRows)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
  }

  const hasErrors = rows.some((row) => row.error)

  function handleImport() {
    if (rows.length === 0 || hasErrors) return
    mutation.mutate(rows.map(({ name, usn, email }) => ({ name, usn, email })))
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <label
        htmlFor="csv-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-subtle rounded p-8 cursor-pointer text-text-muted"
      >
        <Upload size={24} />
        <p>Drag and drop your CSV file here, or click to browse</p>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>USN</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className={row.error ? 'bg-red-50' : undefined}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.usn}</TableCell>
                <TableCell>
                  {row.email}
                  {row.error && <span className="block text-xs text-red-500">{row.error}</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-500">
          {mutation.error instanceof Error ? mutation.error.message : 'Import failed'}
        </p>
      )}

      <Button
        onClick={handleImport}
        disabled={rows.length === 0 || hasErrors || mutation.isPending}
      >
        {mutation.isPending ? 'Importing…' : `Import ${rows.length} Members`}
      </Button>
    </div>
  )
}
