'use client'

import React, { useMemo } from 'react'
import {
  BigHead,
  theme,
  eyesMap,
  eyebrowsMap,
  mouthsMap,
  hairMap,
  facialHairMap,
  clothingMap,
  accessoryMap,
  graphicsMap,
  hatMap,
  bodyMap,
  type AvatarProps,
} from '@bigheads/core'
import { cn } from '@/lib/utils'
import type { UserAvatarProps } from './types'

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

const skinTones = Object.keys(theme.colors.skin) as Array<keyof typeof theme.colors.skin>
const eyesList = Object.keys(eyesMap) as Array<keyof typeof eyesMap>
const eyebrowsList = Object.keys(eyebrowsMap) as Array<keyof typeof eyebrowsMap>
const mouthsList = Object.keys(mouthsMap) as Array<keyof typeof mouthsMap>
const hairList = Object.keys(hairMap) as Array<keyof typeof hairMap>
const hairColors = Object.keys(theme.colors.hair) as Array<keyof typeof theme.colors.hair>
const facialHairList = ['none', 'none', 'none', 'mediumBeard', 'stubble'] as Array<
  keyof typeof facialHairMap
>
const clothingList = ['shirt', 'dressShirt', 'vneck', 'tankTop', 'dress'] as Array<
  keyof typeof clothingMap
>
const clothingColors = Object.keys(theme.colors.clothing) as Array<
  keyof typeof theme.colors.clothing
>
const accessoriesList = ['none', 'none', 'roundGlasses', 'tinyGlasses', 'shades'] as Array<
  keyof typeof accessoryMap
>
const graphicsList = ['none', 'react', 'graphQL', 'gatsby', 'vue'] as Array<
  keyof typeof graphicsMap
>
const hatsList = ['none', 'none', 'none', 'beanie', 'turban'] as Array<keyof typeof hatMap>
const hatColors = Object.keys(theme.colors.clothing) as Array<keyof typeof theme.colors.clothing>
const bodies = ['chest', 'breasts'] as Array<keyof typeof bodyMap>
const lipColors = Object.keys(theme.colors.lipColors) as Array<keyof typeof theme.colors.lipColors>

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

export function getBigHeadOptions(seed = 'Alex Mercer'): AvatarProps {
  const hash = hashString(seed || 'Alex Mercer')
  function pick<T>(arr: T[], offset: number): T {
    return arr[(hash + offset) % arr.length]!
  }

  return {
    skinTone: pick(skinTones, 1),
    eyes: pick(eyesList, 2),
    eyebrows: pick(eyebrowsList, 3),
    mouth: pick(mouthsList, 4),
    hair: pick(hairList, 5),
    hairColor: pick(hairColors, 6),
    facialHair: pick(facialHairList, 7),
    clothing: pick(clothingList, 8),
    clothingColor: pick(clothingColors, 9),
    accessory: pick(accessoriesList, 10),
    graphic: pick(graphicsList, 11),
    hat: pick(hatsList, 12),
    hatColor: pick(hatColors, 13),
    body: pick(bodies, 14),
    circleColor: 'blue',
    lipColor: pick(lipColors, 15),
    mask: true,
    lashes: hash % 2 === 0,
  }
}

export function UserAvatar({ name, size = '96', className = '', round = true }: UserAvatarProps) {
  const isRound = round === true || round === 'true'
  const numericSize = parseFloat(String(size)) || 96
  const initials = getInitials(name)
  const sizePx = `${numericSize}px`
  const options = useMemo(() => getBigHeadOptions(name || 'User'), [name])

  return (
    <div
      className={cn(
        'sb-avatar relative flex shrink-0 items-center justify-center overflow-hidden select-none shadow-xs bg-[#3db5ff]',
        isRound ? 'rounded-full' : 'rounded-xl',
        className,
      )}
      style={{ width: sizePx, height: sizePx }}
      aria-label={name || 'User Avatar'}
    >
      <div className="w-full h-full flex items-center justify-center pointer-events-none scale-105">
        <BigHead {...options} />
      </div>
      <span className="sr-only">{initials}</span>
    </div>
  )
}

export default UserAvatar
