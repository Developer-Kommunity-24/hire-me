'use client'

import { motion } from 'motion/react'

/** Eye pupil movement multipliers for relative mouse position [-1, 1] */
const PUPIL_MOVE_X = 3
const PUPIL_MOVE_Y = 2
const PUPIL_CENTER_OFFSET_X = 1.5
const PUPIL_CENTER_OFFSET_Y = 3.5

const HIGHLIGHT_MOVE_SCALE = 1.8
const HIGHLIGHT_OFFSET_Y = 1.8

interface StudentMascotHeroProps {
  mousePos: { x: number; y: number }
  blink: boolean
}

export function StudentMascotHero({ mousePos, blink }: StudentMascotHeroProps) {
  const pupilCx = mousePos.x * PUPIL_MOVE_X + PUPIL_CENTER_OFFSET_X
  const pupilCy = mousePos.y * PUPIL_MOVE_Y + PUPIL_CENTER_OFFSET_Y
  const highlightCx = mousePos.x * HIGHLIGHT_MOVE_SCALE
  const highlightCy = mousePos.y * HIGHLIGHT_MOVE_SCALE + HIGHLIGHT_OFFSET_Y

  return (
    <div className="lg:col-span-5 bg-gradient-to-b from-surface-hero-start to-surface-hero-end border-b lg:border-b-0 lg:border-r border-border-subtle/50 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Header Content */}
      <div className="space-y-4 z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-[1.2]">
            Let&apos;s build your <br />
            <span className="text-brand inline-flex items-center gap-1.5">career profile</span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm font-medium leading-relaxed mt-2 max-w-[360px]">
            A complete profile helps recruiters discover you and gives you better opportunities.
          </p>
        </div>
      </div>

      {/* Interactive 3D Mascot Character with Laptop */}
      <div className="relative w-full flex-1 min-h-[220px] max-h-[340px] flex items-center justify-center select-none py-1">
        <svg
          viewBox="35 65 310 195"
          className="w-full h-full max-h-[320px] overflow-visible drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="12"
                floodColor="#0F172A"
                floodOpacity="0.12"
              />
            </filter>
            <filter id="laptopShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="8"
                floodColor="#0F172A"
                floodOpacity="0.13"
              />
            </filter>

            <radialGradient id="greenClaySphere" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stopColor="var(--clay-sphere-start)" />
              <stop offset="28%" stopColor="var(--brand-green)" />
              <stop offset="70%" stopColor="var(--clay-sphere-mid2)" />
              <stop offset="90%" stopColor="var(--clay-sphere-dark)" />
              <stop offset="100%" stopColor="var(--clay-sphere-end)" />
            </radialGradient>

            <linearGradient id="capTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#333A44" />
              <stop offset="50%" stopColor="#22272E" />
              <stop offset="100%" stopColor="#14181F" />
            </linearGradient>
            <linearGradient id="capBevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#181D24" />
              <stop offset="100%" stopColor="#0D1015" />
            </linearGradient>

            <linearGradient id="laptopLid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="laptopBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Ground Shadow */}
          <ellipse cx="200" cy="245" rx="130" ry="10" fill="#0F172A" opacity="0.07" />

          {/* 3D Student Character */}
          <g transform="translate(130, 165)">
            <circle cx="0" cy="0" r="62" fill="url(#greenClaySphere)" filter="url(#clayShadow)" />

            {/* Graduation Cap */}
            <g transform="translate(-22, -60) rotate(-16)">
              <path d="M -24,10 C -24,-2 24,-2 24,10 C 24,18 -24,18 -24,10 Z" fill="#12161D" />
              <polygon points="-52,0 -52,5 0,22 52,5 52,0 0,17" fill="url(#capBevel)" />
              <polygon
                points="-52,0 0,-18 52,0 0,17"
                fill="url(#capTop)"
                stroke="#14181F"
                strokeWidth="1"
              />
              <ellipse cx="0" cy="0" rx="3.5" ry="2.5" fill="#10141A" />
              <path
                d="M 0,0 C -28,10 -38,22 -40,42"
                stroke="var(--brand-green)"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="-40" cy="42" rx="3.5" ry="3" fill="var(--clay-sphere-mid2)" />
              <path d="M -44,43 C -44,56 -36,56 -36,43 Z" fill="var(--brand-green)" />
            </g>

            {/* Left Eye */}
            <g transform="translate(-8, -4) rotate(-3)">
              <ellipse cx="0" cy="0" rx="13" ry="12" fill="#FFFFFF" />
              <motion.circle
                cx={pupilCx}
                cy={pupilCy}
                r={5}
                fill="#1A202C"
                animate={{ scaleY: blink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
              />
              {!blink && <circle cx={highlightCx} cy={highlightCy} r="1.8" fill="#FFFFFF" />}
            </g>

            {/* Right Eye */}
            <g transform="translate(22, -8) rotate(3)">
              <ellipse cx="0" cy="0" rx="13" ry="12" fill="#FFFFFF" />
              <motion.circle
                cx={pupilCx}
                cy={pupilCy}
                r={5}
                fill="#1A202C"
                animate={{ scaleY: blink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
              />
              {!blink && <circle cx={highlightCx} cy={highlightCy} r="1.8" fill="#FFFFFF" />}
            </g>

            {/* Smile */}
            <g transform="translate(8, 14)">
              <path d="M -10,-2 Q 0,12 10,-2 Q 0,3 -10,-2 Z" fill="#1A202C" />
            </g>
          </g>

          {/* 3D Laptop */}
          <g transform="translate(195, 180)" filter="url(#laptopShadow)">
            <polygon
              points="0,32 14,-32 96,-32 82,32"
              fill="url(#laptopLid)"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <polygon points="4,30 16,-28 92,-28 80,30" fill="#1E293B" />
            <line
              x1="25"
              y1="-14"
              x2="74"
              y2="-14"
              stroke="var(--brand-green)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="-5"
              x2="65"
              y2="-5"
              stroke="#38BDF8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="4"
              x2="55"
              y2="4"
              stroke="#818CF8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <polygon
              points="-12,42 0,32 82,32 100,42"
              fill="url(#laptopBase)"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <polygon points="32,39 36,35 58,35 55,39" fill="#CBD5E1" />
          </g>
        </svg>
      </div>
    </div>
  )
}
