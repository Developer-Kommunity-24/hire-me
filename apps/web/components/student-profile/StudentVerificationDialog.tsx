'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Loader2, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchActiveClubs, submitVerification } from '@/lib/verification-api'

interface StudentVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function StudentVerificationDialog({
  isOpen,
  onClose,
}: StudentVerificationDialogProps) {
  const [usn, setUsn] = useState('')
  const [selectedClubId, setSelectedClubId] = useState('')
  const queryClient = useQueryClient()

  const { data: clubs = [] } = useQuery({
    queryKey: ['active-clubs'],
    queryFn: fetchActiveClubs,
    enabled: isOpen,
  })

  const verifyMutation = useMutation({
    mutationFn: (vars: { usn: string; clubId?: string | null }) =>
      submitVerification({
        usn: vars.usn.trim().toUpperCase(),
        clubId: vars.clubId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['verifications', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['club', 'requests'] })
      if (data.status === 'verified') {
        toast.success(
          data.clubName
            ? `Verified successfully via ${data.clubName}!`
            : 'Verified successfully! DK24 badge awarded.',
        )
      } else {
        toast.info(
          'Verification request submitted! Awaiting matching club roster or student admin approval.',
        )
      }
      onClose()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Verification submission failed')
    },
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!usn.trim()) {
      toast.error('Please enter your University Seat Number (USN)')
      return
    }
    verifyMutation.mutate({ usn, clubId: selectedClubId || null })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-sans"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center border border-brand-mint text-brand-dark">
            <ShieldCheck className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-main">DK24 Student Verification</h2>
            <p className="text-xs text-text-muted">Verify your university roster enrollment</p>
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Enter your official University Seat Number (USN). If your club administrator has
          registered you in an active club roster, your verified student badge will be awarded
          automatically. If not yet added, your request will be sent to the club administrator for
          review.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="usn-input"
              className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
            >
              University Seat Number (USN)
            </label>
            <Input
              id="usn-input"
              type="text"
              placeholder="e.g. 4SO21CS001"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              disabled={verifyMutation.isPending}
              autoFocus
            />
          </div>

          {clubs.length > 0 && (
            <div>
              <label
                htmlFor="club-select"
                className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
              >
                Campus Club (Optional)
              </label>
              <select
                id="club-select"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                disabled={verifyMutation.isPending}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="">-- Choose your campus club --</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={verifyMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4 mr-1.5" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
