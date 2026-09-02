'use client'

import Avatar from 'react-avatar'
import { cn } from '@/lib/utils'
import type { UserAvatarProps } from './types'

export default function UserAvatar({
  name,
  photoUrl,
  size = '96',
  className = '',
  round = true,
  textSizeRatio = 2.2,
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center overflow-hidden shrink-0 select-none shadow-sm',
        round ? 'rounded-full' : 'rounded-lg',
        className,
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Avatar
        name={name || 'Student'}
        src={photoUrl || undefined}
        size={size}
        round={round}
        textSizeRatio={textSizeRatio}
        color="var(--brand-green)"
        fgColor="#ffffff"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
