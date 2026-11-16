'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink, Loader2, Send } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/hooks/use-auth'
import { applyToPosting, listMyApplications, ApiError } from '@/lib/applications-api'
import { showConfetti } from '@/lib/utils/confetti'
import type { Job } from '../../types/job'

interface ApplyButtonProps {
  job: Job
}

export function ApplyButton({ job }: ApplyButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAppliedLocally, setHasAppliedLocally] = useState(false)

  // Query student's applications to determine if they already applied to this posting
  const { data: myApplications, isLoading: isAppsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: listMyApplications,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  })

  const hasAlreadyApplied =
    hasAppliedLocally || Boolean(myApplications?.some((app) => app.postingId === job.id))

  const handleInitiateApply = () => {
    if (isAuthLoading) return

    if (!user) {
      router.push(`/login?callbackUrl=/jobs/${job.id}`)
      return
    }

    const isStudent = user.roles.includes('student')
    if (!isStudent) {
      toast.error('Only students can apply to jobs. Switch your active role to apply.')
      return
    }

    setIsOpen(true)
  }

  const handleConfirmApply = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await applyToPosting(job.id)
      showConfetti()
      toast.success('Application submitted successfully!')
      setHasAppliedLocally(true)
      setIsOpen(false)

      // Refresh applications cache across the app
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['student-applications'] })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setHasAppliedLocally(true)
          toast.info(err.message || 'You have already applied to this posting')
          setIsOpen(false)
          return
        }
        if (err.status === 403) {
          toast.error(err.message || 'Student profile required to apply to postings', {
            action: {
              label: 'Set up profile',
              onClick: () => router.push('/student/profile/edit'),
            },
          })
          return
        }
        toast.error(err.message)
      } else {
        toast.error('Failed to submit application. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAppsLoading && !hasAppliedLocally) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        Checking status...
      </Button>
    )
  }

  if (hasAlreadyApplied) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Applied
        </Button>
        <Link
          href="/student/applications"
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          View Status
        </Link>
      </div>
    )
  }

  return (
    <>
      <Button onClick={handleInitiateApply}>
        <Send className="w-4 h-4" />
        Apply Now
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply for {job.title}</AlertDialogTitle>
            <AlertDialogDescription>
              You are applying to <strong>{job.company || 'this position'}</strong>. Your verified
              student profile, contact info, resume, and skills will be shared with the hiring team.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {user && (
            <div className="rounded-lg border bg-slate-50/80 p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">{user.name}</span>
                <span className="text-slate-500">{user.email}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Want to update your resume or portfolio first?{' '}
                <Link
                  href="/student/profile/edit"
                  target="_blank"
                  className="text-emerald-600 font-medium inline-flex items-center gap-0.5 hover:underline"
                >
                  Edit profile <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirmApply} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
export default ApplyButton
