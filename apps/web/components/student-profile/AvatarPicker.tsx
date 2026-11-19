'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ANIMAL_AVATARS, UserAvatar } from './UserAvatar'

export interface AvatarPickerProps {
  value?: string
  onChange: (avatarId: string) => void
  className?: string
}

export function AvatarPicker({ value = 'panda', onChange, className }: AvatarPickerProps) {
  const currentAvatarId = (value || 'panda').replace(/^avatar:/, '').toLowerCase()

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          Choose Your Avatar{' '}
          <span className="text-slate-400 font-normal lowercase">(8 gender-neutral options)</span>
        </label>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {ANIMAL_AVATARS.map((option) => {
          const isSelected = currentAvatarId === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(`avatar:${option.id}`)}
              className={cn(
                'group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
                isSelected
                  ? 'border-brand bg-brand/5 shadow-xs scale-105'
                  : 'border-border-subtle hover:border-slate-300 hover:bg-slate-50/70',
              )}
              title={`Choose ${option.name}`}
            >
              <div className="relative">
                <UserAvatar
                  name={option.name}
                  photoUrl={`avatar:${option.id}`}
                  size="48"
                  round
                  className="shadow-xs"
                />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-tight transition-colors',
                  isSelected ? 'text-brand font-bold' : 'text-slate-600 group-hover:text-slate-900',
                )}
              >
                {option.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AvatarPicker
