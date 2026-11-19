'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { UserAvatarProps } from './types'

export interface AnimalAvatarOption {
  id: string
  name: string
  icon: string
  bg: string
}

export const ANIMAL_AVATARS: AnimalAvatarOption[] = [
  { id: 'panda', name: 'Panda', icon: '🐼', bg: '#e0f2fe' },
  { id: 'fox', name: 'Fox', icon: '🦊', bg: '#ffedd5' },
  { id: 'koala', name: 'Koala', icon: '🐨', bg: '#f1f5f9' },
  { id: 'bear', name: 'Bear', icon: '🐻', bg: '#fef3c7' },
  { id: 'owl', name: 'Owl', icon: '🦉', bg: '#ede9fe' },
  { id: 'bunny', name: 'Bunny', icon: '🐰', bg: '#fce7f3' },
  { id: 'cat', name: 'Cat', icon: '🐱', bg: '#fae8ff' },
  { id: 'penguin', name: 'Penguin', icon: '🐧', bg: '#e2e8f0' },
]

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

/**
 * 8 Gender-Neutral Animal Avatars
 * Pure SVG vectors with accessible ARIA labeling and clean proportions.
 */

function PandaAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Panda">
      {/* Ears */}
      <circle cx="24" cy="26" r="14" fill="#1e293b" />
      <circle cx="24" cy="26" r="7" fill="#475569" />
      <circle cx="76" cy="26" r="14" fill="#1e293b" />
      <circle cx="76" cy="26" r="7" fill="#475569" />
      {/* Head */}
      <ellipse cx="50" cy="54" rx="38" ry="34" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      {/* Eye Patches */}
      <ellipse cx="34" cy="52" rx="10" ry="12" transform="rotate(-15 34 52)" fill="#1e293b" />
      <ellipse cx="66" cy="52" rx="10" ry="12" transform="rotate(15 66 52)" fill="#1e293b" />
      {/* Pupils & Eye Glint */}
      <circle cx="35" cy="51" r="3.5" fill="#ffffff" />
      <circle cx="36" cy="50" r="1.5" fill="#1e293b" />
      <circle cx="65" cy="51" r="3.5" fill="#ffffff" />
      <circle cx="64" cy="50" r="1.5" fill="#1e293b" />
      {/* Cute Nose */}
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#1e293b" />
      {/* Friendly Smile */}
      <path
        d="M44 67 Q50 72 56 67"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rosy Cheeks */}
      <circle cx="25" cy="60" r="4" fill="#fecdd3" opacity="0.6" />
      <circle cx="75" cy="60" r="4" fill="#fecdd3" opacity="0.6" />
    </svg>
  )
}

function FoxAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Fox">
      {/* Ears */}
      <polygon points="18,14 36,36 12,38" fill="#ea580c" />
      <polygon points="20,18 32,34 16,35" fill="#f8fafc" />
      <polygon points="82,14 64,36 88,38" fill="#ea580c" />
      <polygon points="80,18 68,34 84,35" fill="#f8fafc" />
      {/* Head */}
      <ellipse cx="50" cy="54" rx="38" ry="32" fill="#f97316" />
      {/* Cheeks / White fur patch */}
      <path
        d="M14 54 C16 74 38 82 50 82 C62 82 84 74 86 54 C74 58 60 50 50 58 C40 50 26 58 14 54 Z"
        fill="#ffffff"
      />
      {/* Eyes */}
      <circle cx="36" cy="50" r="4" fill="#0f172a" />
      <circle cx="37.5" cy="48.5" r="1.5" fill="#ffffff" />
      <circle cx="64" cy="50" r="4" fill="#0f172a" />
      <circle cx="65.5" cy="48.5" r="1.5" fill="#ffffff" />
      {/* Nose */}
      <ellipse cx="50" cy="67" rx="4.5" ry="3" fill="#0f172a" />
      {/* Smile */}
      <path
        d="M46 72 Q50 75 54 72"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function KoalaAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Koala">
      {/* Big Fluffy Ears */}
      <circle cx="20" cy="34" r="18" fill="#94a3b8" />
      <circle cx="20" cy="34" r="11" fill="#f1f5f9" />
      <circle cx="80" cy="34" r="18" fill="#94a3b8" />
      <circle cx="80" cy="34" r="11" fill="#f1f5f9" />
      {/* Head */}
      <ellipse cx="50" cy="56" rx="36" ry="32" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="34" cy="50" r="4" fill="#1e293b" />
      <circle cx="35.5" cy="48.5" r="1.5" fill="#ffffff" />
      <circle cx="66" cy="50" r="4" fill="#1e293b" />
      <circle cx="67.5" cy="48.5" r="1.5" fill="#ffffff" />
      {/* Big Characteristic Koala Nose */}
      <ellipse cx="50" cy="61" rx="8" ry="12" fill="#1e293b" />
      <ellipse cx="48" cy="57" rx="2" ry="4" fill="#475569" />
      {/* Mouth */}
      <path
        d="M46 76 Q50 78 54 76"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Blush */}
      <circle cx="26" cy="62" r="4" fill="#fda4af" opacity="0.6" />
      <circle cx="74" cy="62" r="4" fill="#fda4af" opacity="0.6" />
    </svg>
  )
}

function BearAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Bear">
      {/* Ears */}
      <circle cx="24" cy="26" r="13" fill="#92400e" />
      <circle cx="24" cy="26" r="7" fill="#fde68a" />
      <circle cx="76" cy="26" r="13" fill="#92400e" />
      <circle cx="76" cy="26" r="7" fill="#fde68a" />
      {/* Head */}
      <ellipse cx="50" cy="54" rx="36" ry="32" fill="#b45309" />
      {/* Snout / Muzzle */}
      <ellipse cx="50" cy="63" rx="16" ry="13" fill="#fef3c7" />
      {/* Eyes */}
      <circle cx="36" cy="49" r="3.5" fill="#1e293b" />
      <circle cx="37" cy="48" r="1.2" fill="#ffffff" />
      <circle cx="64" cy="49" r="3.5" fill="#1e293b" />
      <circle cx="65" cy="48" r="1.2" fill="#ffffff" />
      {/* Nose */}
      <ellipse cx="50" cy="59" rx="6" ry="4.5" fill="#1e293b" />
      {/* Smile */}
      <path
        d="M45 66 Q50 71 55 66"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cheeks */}
      <circle cx="26" cy="57" r="3.5" fill="#f87171" opacity="0.4" />
      <circle cx="74" cy="57" r="3.5" fill="#f87171" opacity="0.4" />
    </svg>
  )
}

function OwlAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Owl">
      {/* Feather Tufts / Horns */}
      <polygon points="26,16 38,32 18,36" fill="#6d28d9" />
      <polygon points="74,16 82,36 62,32" fill="#6d28d9" />
      {/* Head & Body */}
      <ellipse cx="50" cy="56" rx="36" ry="34" fill="#7c3aed" />
      {/* Belly Patch */}
      <ellipse cx="50" cy="68" rx="20" ry="18" fill="#ede9fe" />
      {/* Big Eyes Rings */}
      <circle cx="35" cy="48" r="13" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
      <circle cx="65" cy="48" r="13" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
      {/* Eye Pupils */}
      <circle cx="36" cy="48" r="7" fill="#1e1b4b" />
      <circle cx="38" cy="46" r="2.5" fill="#ffffff" />
      <circle cx="64" cy="48" r="7" fill="#1e1b4b" />
      <circle cx="66" cy="46" r="2.5" fill="#ffffff" />
      {/* Golden Beak */}
      <polygon points="46,55 54,55 50,65" fill="#f59e0b" />
    </svg>
  )
}

function BunnyAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Bunny">
      {/* Tall Ears */}
      <ellipse cx="34" cy="22" rx="8" ry="20" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <ellipse cx="34" cy="22" rx="4.5" ry="14" fill="#fbcfe8" />
      <ellipse cx="66" cy="22" rx="8" ry="20" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <ellipse cx="66" cy="22" rx="4.5" ry="14" fill="#fbcfe8" />
      {/* Head */}
      <ellipse cx="50" cy="60" rx="34" ry="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="37" cy="54" r="3.5" fill="#1e293b" />
      <circle cx="38" cy="53" r="1.2" fill="#ffffff" />
      <circle cx="63" cy="54" r="3.5" fill="#1e293b" />
      <circle cx="64" cy="53" r="1.2" fill="#ffffff" />
      {/* Pink Nose */}
      <polygon points="47,62 53,62 50,66" fill="#ec4899" />
      {/* Smile */}
      <path
        d="M46 68 Q50 71 54 68"
        stroke="#1e293b"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rosy Cheeks */}
      <circle cx="28" cy="62" r="4" fill="#f472b6" opacity="0.4" />
      <circle cx="72" cy="62" r="4" fill="#f472b6" opacity="0.4" />
    </svg>
  )
}

function CatAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" role="img" aria-label="Cat">
      {/* Pointy Ears */}
      <polygon points="18,18 36,36 14,40" fill="#c084fc" />
      <polygon points="21,23 32,34 18,37" fill="#fae8ff" />
      <polygon points="82,18 64,36 86,40" fill="#c084fc" />
      <polygon points="79,23 68,34 82,37" fill="#fae8ff" />
      {/* Head */}
      <ellipse cx="50" cy="56" rx="36" ry="30" fill="#e9d5ff" stroke="#c084fc" strokeWidth="1.5" />
      {/* Eyes */}
      <ellipse cx="36" cy="50" rx="4" ry="5" fill="#1e1b4b" />
      <circle cx="37.5" cy="48.5" r="1.5" fill="#ffffff" />
      <ellipse cx="64" cy="50" rx="4" ry="5" fill="#1e1b4b" />
      <circle cx="65.5" cy="48.5" r="1.5" fill="#ffffff" />
      {/* Whiskers */}
      <line
        x1="16"
        y1="58"
        x2="28"
        y2="59"
        stroke="#9333ea"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="64"
        x2="28"
        y2="62"
        stroke="#9333ea"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="84"
        y1="58"
        x2="72"
        y2="59"
        stroke="#9333ea"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="84"
        y1="64"
        x2="72"
        y2="62"
        stroke="#9333ea"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Nose */}
      <polygon points="47,60 53,60 50,64" fill="#a855f7" />
      {/* Smile */}
      <path
        d="M45 66 Q50 69 55 66"
        stroke="#581c87"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function PenguinAvatar() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className="w-full h-full"
      role="img"
      aria-label="Penguin"
    >
      {/* Body / Head */}
      <ellipse cx="50" cy="54" rx="35" ry="38" fill="#1e293b" />
      {/* White Face Mask */}
      <ellipse cx="37" cy="46" rx="14" ry="16" fill="#ffffff" />
      <ellipse cx="63" cy="46" rx="14" ry="16" fill="#ffffff" />
      <ellipse cx="50" cy="62" rx="22" ry="24" fill="#ffffff" />
      {/* Eyes */}
      <circle cx="38" cy="44" r="3.5" fill="#0f172a" />
      <circle cx="39" cy="43" r="1.2" fill="#ffffff" />
      <circle cx="62" cy="44" r="3.5" fill="#0f172a" />
      <circle cx="63" cy="43" r="1.2" fill="#ffffff" />
      {/* Cheeks */}
      <circle cx="28" cy="52" r="3" fill="#fca5a5" opacity="0.6" />
      <circle cx="72" cy="52" r="3" fill="#fca5a5" opacity="0.6" />
      {/* Bright Orange Beak */}
      <polygon points="44,53 56,53 50,64" fill="#f97316" />
    </svg>
  )
}

const AVATAR_COMPONENT_MAP: Record<string, () => React.JSX.Element> = {
  panda: PandaAvatar,
  fox: FoxAvatar,
  koala: KoalaAvatar,
  bear: BearAvatar,
  owl: OwlAvatar,
  bunny: BunnyAvatar,
  cat: CatAvatar,
  penguin: PenguinAvatar,
}

export function resolveAvatarId(name?: string, photoUrl?: string): string {
  // If photoUrl contains explicit avatar key e.g. "avatar:panda" or "panda"
  if (photoUrl) {
    const clean = photoUrl
      .replace(/^avatar:/, '')
      .toLowerCase()
      .trim()
    if (AVATAR_COMPONENT_MAP[clean]) {
      return clean
    }
  }

  // Fallback to deterministic hash of name
  const hash = hashString(name || 'User')
  return ANIMAL_AVATARS[hash % ANIMAL_AVATARS.length]!.id
}

export function UserAvatar({
  name,
  photoUrl,
  size = '96',
  className = '',
  round = true,
}: UserAvatarProps) {
  const isRound = round === true || round === 'true'
  const numericSize = parseFloat(String(size)) || 96
  const initials = getInitials(name)
  const sizePx = `${numericSize}px`

  const avatarId = useMemo(() => resolveAvatarId(name, photoUrl), [name, photoUrl])
  const avatarOption = useMemo(
    () => ANIMAL_AVATARS.find((a) => a.id === avatarId) || ANIMAL_AVATARS[0]!,
    [avatarId],
  )
  const Component = AVATAR_COMPONENT_MAP[avatarId] || PandaAvatar

  return (
    <div
      className={cn(
        'sb-avatar relative flex shrink-0 items-center justify-center overflow-hidden select-none shadow-xs transition-transform',
        isRound ? 'rounded-full' : 'rounded-xl',
        className,
      )}
      style={{
        width: sizePx,
        height: sizePx,
        backgroundColor: avatarOption.bg,
      }}
      aria-label={name || `${avatarOption.name} Avatar`}
    >
      <div className="w-full h-full p-1.5 flex items-center justify-center pointer-events-none scale-105">
        <Component />
      </div>
      <span className="sr-only">{initials}</span>
    </div>
  )
}

export default UserAvatar
