import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import JobPostingCard from './JobPostingCard'
import type { JobPostingItem } from '@/lib/postings-api'

const sampleJob: JobPostingItem = {
  id: 'test-job-1',
  title: 'Full Stack Engineer',
  description: 'Build end-to-end web apps with Node and React.',
  stack: ['React', 'Node.js', 'PostgreSQL'],
  employmentType: 'full_time',
  workArrangement: 'hybrid',
  location: 'Bangalore, India',
  status: 'active',
  deadline: '2026-12-31',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  applicants: 15,
  inReview: 4,
  interviewing: 2,
}

describe('JobPostingCard', () => {
  it('renders job title, badges, location, and employment type', () => {
    render(<JobPostingCard job={sampleJob} />)

    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Bangalore, India')).toBeInTheDocument()
    expect(screen.getByText('Full-time')).toBeInTheDocument()
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('renders applicant counts correctly', () => {
    render(<JobPostingCard job={sampleJob} />)

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onViewApplicants callback when primary button is clicked', () => {
    const handleViewApplicants = vi.fn()
    render(<JobPostingCard job={sampleJob} onViewApplicants={handleViewApplicants} />)

    const btn = screen.getByRole('button', { name: /view applicants for full stack engineer/i })
    fireEvent.click(btn)

    expect(handleViewApplicants).toHaveBeenCalledWith('test-job-1')
  })

  it('calls onEditPosting callback when secondary button is clicked', () => {
    const handleEditPosting = vi.fn()
    render(<JobPostingCard job={sampleJob} onEditPosting={handleEditPosting} />)

    const btn = screen.getByRole('button', { name: /edit posting for full stack engineer/i })
    fireEvent.click(btn)

    expect(handleEditPosting).toHaveBeenCalledWith(sampleJob)
  })

  it('shows close confirmation dialog and calls onClosePosting on confirmation', async () => {
    const handleClose = vi.fn().mockResolvedValue(undefined)
    render(<JobPostingCard job={sampleJob} onClosePosting={handleClose} />)

    // Open options dropdown menu
    const menuTrigger = screen.getByRole('button', {
      name: /open options menu for full stack engineer/i,
    })
    fireEvent.click(menuTrigger)

    // Click "Close Posting" in menu
    const closeItem = await screen.findByText('Close Posting')
    fireEvent.click(closeItem)

    // Alert dialog opens
    expect(screen.getByText('Close this posting?')).toBeInTheDocument()

    // Confirm close
    const confirmBtn = screen.getByRole('button', { name: 'Close Posting' })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledWith('test-job-1')
    })
  })
})
