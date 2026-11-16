import { describe, expect, it } from 'vitest'
import { isTransitionAllowed } from '../controllers/applications.controller.js'

describe('isTransitionAllowed', () => {
  it('allows moving from applied into any later stage', () => {
    expect(isTransitionAllowed('applied', 'under_review')).toBe(true)
    expect(isTransitionAllowed('applied', 'shortlisted')).toBe(true)
    expect(isTransitionAllowed('applied', 'accepted')).toBe(true)
    expect(isTransitionAllowed('applied', 'rejected')).toBe(true)
  })

  it('allows moving from under_review into later stages', () => {
    expect(isTransitionAllowed('under_review', 'shortlisted')).toBe(true)
    expect(isTransitionAllowed('under_review', 'accepted')).toBe(true)
    expect(isTransitionAllowed('under_review', 'rejected')).toBe(true)
  })

  it('allows moving from shortlisted to a decision', () => {
    expect(isTransitionAllowed('shortlisted', 'accepted')).toBe(true)
    expect(isTransitionAllowed('shortlisted', 'rejected')).toBe(true)
  })

  it('treats accepted and rejected as terminal', () => {
    expect(isTransitionAllowed('accepted', 'rejected')).toBe(false)
    expect(isTransitionAllowed('accepted', 'under_review')).toBe(false)
    expect(isTransitionAllowed('rejected', 'accepted')).toBe(false)
    expect(isTransitionAllowed('rejected', 'under_review')).toBe(false)
  })

  it('never allows a status to move backward to an earlier stage', () => {
    expect(isTransitionAllowed('under_review', 'applied')).toBe(false)
    expect(isTransitionAllowed('shortlisted', 'under_review')).toBe(false)
    expect(isTransitionAllowed('accepted', 'applied')).toBe(false)
    expect(isTransitionAllowed('rejected', 'applied')).toBe(false)
  })

  it('never allows a no-op move to the same status', () => {
    expect(isTransitionAllowed('applied', 'applied')).toBe(false)
    expect(isTransitionAllowed('under_review', 'under_review')).toBe(false)
    expect(isTransitionAllowed('accepted', 'accepted')).toBe(false)
  })
})
