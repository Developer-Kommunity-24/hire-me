'use client'

import { ChevronDown, Search } from 'lucide-react'

type SortOption = 'newest' | 'deadline' | 'title'

type JobSearchProps = {
  search: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export default function JobSearch({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: JobSearchProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search jobs, companies, or skills..."
          className="h-12 w-full rounded-xl border border-border-subtle bg-card pl-11 pr-4 text-sm text-text-main outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
        />
      </div>

      <div className="relative lg:w-52">
        <label htmlFor="job-sort" className="sr-only">
          Sort jobs
        </label>

        <select
          id="job-sort"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="h-12 w-full appearance-none rounded-xl border border-border-subtle bg-card px-4 pr-10 text-sm font-medium text-text-main outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="compensation-high">Compensation: High to Low</option>
          <option value="compensation-low">Compensation: Low to High</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  )
}

export type { SortOption }
