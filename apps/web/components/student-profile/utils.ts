import { Code2, Database, Wrench, type LucideIcon } from 'lucide-react'

/**
 * Maps a skill category label to an appropriate Lucide icon component.
 */
export function getCategoryIcon(label: string): LucideIcon {
  const upper = label.toUpperCase()
  if (upper.includes('LANG')) return Code2
  if (upper.includes('DATA')) return Database
  return Wrench
}

/**
 * Formats start and end dates into a readable date range.
 */
export function formatDuration(startDate?: string, endDate?: string): string {
  const start = startDate?.trim() || ''
  const end = endDate?.trim() || ''
  if (start && end) return `${start} — ${end}`
  return start || end
}
