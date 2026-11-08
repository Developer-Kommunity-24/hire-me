'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  BackendEmploymentType,
  BackendWorkArrangement,
  CreatePostingInput,
} from '@/lib/postings-api'

interface CreatePostingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreatePostingInput) => Promise<void>
  isSubmitting?: boolean
}

export default function CreatePostingDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreatePostingDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stackInput, setStackInput] = useState('')
  const [employmentType, setEmploymentType] = useState<BackendEmploymentType>('full_time')
  const [workArrangement, setWorkArrangement] = useState<BackendWorkArrangement>('hybrid')
  const [location, setLocation] = useState('')
  const [compensation, setCompensation] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Job title is required')
      return
    }

    if (!description.trim()) {
      setError('Job description is required')
      return
    }

    const stack = stackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (stack.length === 0) {
      setError('Please provide at least one tech stack tag (comma-separated)')
      return
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        stack,
        employmentType,
        workArrangement,
        location: location.trim() || undefined,
        compensation: compensation.trim() || undefined,
        deadline: deadline.trim() || undefined,
      })

      setTitle('')
      setDescription('')
      setStackInput('')
      setEmploymentType('full_time')
      setWorkArrangement('hybrid')
      setLocation('')
      setCompensation('')
      setDeadline('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job posting')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-posting-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 id="create-posting-title" className="text-xl font-bold text-text-main">
              Create Job Posting
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Publish a new career opportunity for DK24 students and candidates.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted transition-all hover:bg-slate-50 hover:text-text-main hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="posting-title">Job Title *</Label>
            <Input
              id="posting-title"
              placeholder="e.g. Senior Frontend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="posting-description">Description *</Label>
            <textarea
              id="posting-description"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="posting-stack">Tech Stack (comma-separated) *</Label>
            <Input
              id="posting-stack"
              placeholder="e.g. React, TypeScript, Next.js, Tailwind CSS"
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Employment Type *</Label>
              <div className="w-full">
                <Select
                  value={employmentType}
                  onValueChange={(val) => setEmploymentType(val as BackendEmploymentType)}
                >
                  <SelectTrigger aria-label="Select employment type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Work Arrangement *</Label>
              <div className="w-full">
                <Select
                  value={workArrangement}
                  onValueChange={(val) => setWorkArrangement(val as BackendWorkArrangement)}
                >
                  <SelectTrigger aria-label="Select work arrangement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="posting-location">Location</Label>
              <Input
                id="posting-location"
                placeholder="e.g. Bangalore, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="posting-compensation">Compensation</Label>
              <Input
                id="posting-compensation"
                placeholder="e.g. ₹12,00,000 - ₹18,00,000"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="posting-deadline">Application Deadline (optional)</Label>
            <Input
              id="posting-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Publish Posting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
