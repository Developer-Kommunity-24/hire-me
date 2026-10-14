'use client'

import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { UserAvatarProps } from './types'

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'S'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'S'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

export default function UserAvatar({
  name,
  photoUrl,
  size = '96',
  className = '',
  round = true,
  textSizeRatio = 2.2,
}: UserAvatarProps) {
  const isRound = round === true || round === 'true'
  const numericSize = parseFloat(String(size)) || 96
  const fontSize = Math.round(numericSize / (textSizeRatio || 2.2))
  const initials = getInitials(name)
  const sizePx = `${numericSize}px`

  return (
    <AvatarPrimitive.Root
      className={cn(
        'sb-avatar relative flex shrink-0 overflow-hidden select-none shadow-sm',
        isRound ? 'rounded-full' : 'rounded-lg',
        className,
      )}
      style={{ width: sizePx, height: sizePx }}
    >
      {photoUrl ? (
        <AvatarPrimitive.Image
          src={photoUrl}
          alt={name || 'Student profile photo'}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center bg-brand text-white font-bold tracking-wider uppercase',
          isRound ? 'rounded-full' : 'rounded-lg',
        )}
        style={{ fontSize: `${fontSize}px` }}
        aria-label={name || 'Student'}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
