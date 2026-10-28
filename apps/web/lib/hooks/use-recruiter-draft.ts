'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import type {
  RecruiterStepNumber,
  RecruiterWizardInput,
} from '@/lib/schemas/recruiter-onboarding.schema'

export const DRAFT_STORAGE_PREFIX = 'hireme:recruiter_draft:'

export function getRecruiterDraftKey(userId: string): string {
  return `${DRAFT_STORAGE_PREFIX}${userId}`
}

export interface RecruiterDraftState {
  step: RecruiterStepNumber
  values: RecruiterWizardInput
  updatedAt: string
}

export function useRecruiterDraft(userId?: string) {
  const loadDraft = useCallback((): RecruiterDraftState | null => {
    // Guard against reading before user ID is known to isolate drafts per user
    if (typeof window === 'undefined' || !userId) return null

    try {
      const raw = window.localStorage.getItem(getRecruiterDraftKey(userId))
      if (!raw) return null
      return JSON.parse(raw) as RecruiterDraftState
    } catch {
      return null
    }
  }, [userId])

  const saveDraft = useCallback(
    (step: RecruiterStepNumber, values: RecruiterWizardInput, showToast = true) => {
      // Guard against saving before user ID is known
      if (typeof window === 'undefined' || !userId) return

      try {
        const payload: RecruiterDraftState = {
          step,
          values,
          updatedAt: new Date().toISOString(),
        }
        window.localStorage.setItem(getRecruiterDraftKey(userId), JSON.stringify(payload))
        if (showToast) {
          toast.success('Draft saved on this device.')
        }
      } catch {
        if (showToast) {
          toast.error('Could not save draft to local storage.')
        }
      }
    },
    [userId],
  )

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined' || !userId) return

    try {
      window.localStorage.removeItem(getRecruiterDraftKey(userId))
    } catch {
      // Ignore storage clear errors
    }
  }, [userId])

  return {
    loadDraft,
    saveDraft,
    clearDraft,
  }
}
