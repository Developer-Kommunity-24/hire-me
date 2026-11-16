import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select component', () => {
  it('renders the label corresponding to value when items prop is provided', () => {
    const items = {
      full_time: 'Full-time',
      internship: 'Internship',
    }

    render(
      <Select items={items} value="full_time">
        <SelectTrigger aria-label="Employment type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full_time">Full-time</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: 'Employment type' })).toHaveTextContent('Full-time')
    expect(screen.queryByText('full_time')).not.toBeInTheDocument()
  })

  it('automatically resolves and renders item labels when items prop is not provided', () => {
    render(
      <Select value="in_person">
        <SelectTrigger aria-label="Work arrangement">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in_person">On-site</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: 'Work arrangement' })).toHaveTextContent('On-site')
    expect(screen.queryByText('in_person')).not.toBeInTheDocument()
  })

  it('renders placeholder when no value is selected', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Select option">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: 'Select option' })).toHaveTextContent(
      'Choose an option',
    )
  })
})
