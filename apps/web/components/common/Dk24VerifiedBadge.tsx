import React from 'react'
import { cn } from '@/lib/utils'

export function Dk24VerifiedIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      {/* Scalloped rosette seal */}
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill="#48B854"
      />
      {/* Checkmark */}
      <path
        d="M8.5 12.5L11 15L16 9"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface Dk24VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  iconOnly?: boolean
  label?: string
}

export default function Dk24VerifiedBadge({
  size = 'sm',
  className,
  iconOnly = false,
  label = 'DK24 Verified',
}: Dk24VerifiedBadgeProps) {
  if (iconOnly) {
    return (
      <span className={cn('inline-flex items-center', className)} title={label}>
        <Dk24VerifiedIcon
          className={size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'}
        />
      </span>
    )
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size]

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs',
        sizeClasses,
        className,
      )}
    >
      <Dk24VerifiedIcon className={iconSizes} />
      <span>{label}</span>
    </span>
  )
}
