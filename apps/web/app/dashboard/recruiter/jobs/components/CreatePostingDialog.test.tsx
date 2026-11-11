import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CreatePostingDialog from './CreatePostingDialog'

describe('CreatePostingDialog', () => {
  it('displays human-readable labels for default select values', () => {
    const handleClose = vi.fn()
    const handleSubmit = vi.fn()

    render(<CreatePostingDialog isOpen={true} onClose={handleClose} onSubmit={handleSubmit} />)

    // Employment type default is 'full_time' -> should display 'Full-time'
    const employmentTrigger = screen.getByRole('combobox', { name: /select employment type/i })
    expect(employmentTrigger).toHaveTextContent('Full-time')
    expect(screen.queryByText('full_time')).not.toBeInTheDocument()

    // Work arrangement default is 'hybrid' -> should display 'Hybrid'
    const arrangementTrigger = screen.getByRole('combobox', { name: /select work arrangement/i })
    expect(arrangementTrigger).toHaveTextContent('Hybrid')
    expect(screen.queryByText('hybrid')).not.toBeInTheDocument()
  })
})
