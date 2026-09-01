'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { sound } from './audio'

export interface CharacterSceneState {
  focusedField: 'none' | 'email' | 'submit' | 'google'
  emailLength: number
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  isHoveringSubmit: boolean
  isHoveringGoogle: boolean
  cursorPos: { x: number; y: number }
}

interface CharactersSceneProps {
  state: CharacterSceneState
  onCharacterPoke?: () => void
}

export function CharactersScene({ state, onCharacterPoke }: CharactersSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)
  const [pokeId, setPokeId] = useState<string | null>(null)
  const [typingTick, setTypingTick] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [clickTick, setClickTick] = useState(0)
  const [isClickReacting, setIsClickReacting] = useState(false)

  const prevLenRef = useRef(state.emailLength)

  useEffect(() => {
    if (state.emailLength !== prevLenRef.current) {
      prevLenRef.current = state.emailLength
      setTypingTick((t) => t + 1)
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 450)
      return () => clearTimeout(timer)
    }
  }, [state.emailLength])

  useEffect(() => {
    const handleGlobalClick = () => {
      setClickTick((t) => t + 1)
      setIsClickReacting(true)
      const timer = setTimeout(() => setIsClickReacting(false), 550)
      return () => clearTimeout(timer)
    }

    window.addEventListener('pointerdown', handleGlobalClick)
    return () => window.removeEventListener('pointerdown', handleGlobalClick)
  }, [])

  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setBlink(true)
        setTimeout(() => setBlink(false), 160)
      },
      3000 + Math.random() * 2000,
    )
    return () => clearInterval(blinkInterval)
  }, [])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setMousePos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    })
  }

  const getGaze = () => {
    if (state.isSuccess) return { x: 0, y: -0.7 }
    if (state.focusedField === 'email') {
      const jitter = (state.emailLength % 4) * 0.05
      return { x: 0.85 + jitter, y: 0.25 }
    }
    if (state.isHoveringSubmit || state.focusedField === 'submit') return { x: 0.8, y: 0.75 }
    if (state.isHoveringGoogle || state.focusedField === 'google') return { x: 0.75, y: 0.9 }
    return {
      x: Math.max(-1, Math.min(1, mousePos.x)),
      y: Math.max(-1, Math.min(1, mousePos.y)),
    }
  }

  const handlePoke = (characterName: string) => {
    setPokeId(characterName)

    switch (characterName) {
      case 'red':
        sound.playBoing()
        break
      case 'pink':
        sound.playBlush()
        break
      case 'cyan':
        sound.playFloat()
        break
      case 'blue':
        sound.playGiggle()
        break
      case 'yellow':
        sound.playSpin()
        break
      default:
        sound.playPop(440)
        break
    }

    if (onCharacterPoke) onCharacterPoke()
    setTimeout(() => {
      setPokeId(null)
    }, 850)
  }

  const gaze = getGaze()
  const isEmailFocused = state.focusedField === 'email'
  const isSuccess = state.isSuccess

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      id="characters-stage"
      className="relative w-full h-full min-h-[380px] sm:min-h-[420px] md:min-h-[560px] bg-stage overflow-hidden flex items-end justify-center select-none cursor-pointer p-2 sm:p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-surface-hero-start via-stage to-border-subtle pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-border-muted/50 to-transparent pointer-events-none" />

      <div className="relative w-full h-full max-w-[460px] flex items-end justify-center pb-2">
        <svg
          viewBox="15 65 320 325"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="charShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="6"
                floodColor="#0F172A"
                floodOpacity="0.08"
              />
            </filter>
            <radialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF1493" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFAEBE" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. RED MONSTER */}
          <g id="red-t-monster" onClick={() => handlePoke('red')} className="cursor-pointer">
            <motion.g
              animate={{
                y:
                  pokeId === 'red'
                    ? [-35, -30, 0]
                    : isClickReacting
                      ? -8
                      : isSuccess
                        ? -25
                        : isEmailFocused
                          ? -6
                          : 0,
                scaleY: pokeId === 'red' ? [1, 1.3, 0.95, 1] : isClickReacting ? 1.04 : 1,
                scaleX: pokeId === 'red' ? [1, 0.88, 1.04, 1] : 1,
                rotate: pokeId === 'red' ? [-6, 6, -3, 0] : isClickReacting ? -1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: pokeId === 'red' ? 400 : 320,
                damping: pokeId === 'red' ? 14 : 18,
              }}
              style={{ transformOrigin: '140px 385px' }}
            >
              <motion.g
                animate={{ scaleY: [1, 1.028, 1], scaleX: [1, 0.988, 1], y: [0, -2.5, 0] }}
                transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
                style={{ transformOrigin: '140px 385px' }}
              >
                <line
                  x1="110"
                  y1="140"
                  x2="152"
                  y2="385"
                  stroke="#FA4D6E"
                  strokeWidth="17"
                  strokeLinecap="round"
                />
                <line
                  x1="130"
                  y1="140"
                  x2="168"
                  y2="385"
                  stroke="#FA4D6E"
                  strokeWidth="17"
                  strokeLinecap="round"
                />
                <rect
                  x="30"
                  y="105"
                  width="160"
                  height="46"
                  rx="23"
                  fill="#FA4D6E"
                  filter="url(#charShadow)"
                />

                {pokeId === 'red' && (
                  <g opacity="0.8">
                    <line
                      x1="25"
                      y1="95"
                      x2="15"
                      y2="85"
                      stroke="#FA4D6E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="195"
                      y1="95"
                      x2="205"
                      y2="85"
                      stroke="#FA4D6E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="110"
                      y1="75"
                      x2="110"
                      y2="65"
                      stroke="#FA4D6E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                <g transform="translate(92, 102)">
                  <circle cx="0" cy="0" r="12" fill="#FFFFFF" stroke="#FA4D6E" strokeWidth="2" />
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={pokeId === 'red' ? 6.5 : 4.5}
                    fill="#1E2024"
                    animate={{
                      cx: pokeId === 'red' ? [0, -3, 3, 0] : gaze.x * 5,
                      cy: pokeId === 'red' ? -3 : gaze.y * 5,
                      scaleY: blink ? 0.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  />
                  {!blink && (
                    <circle cx={gaze.x * 4 - 1.5} cy={gaze.y * 4 - 1.5} r="1.5" fill="#FFFFFF" />
                  )}
                </g>

                <g transform="translate(122, 102)">
                  <circle cx="0" cy="0" r="12" fill="#FFFFFF" stroke="#FA4D6E" strokeWidth="2" />
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={pokeId === 'red' ? 6.5 : 4.5}
                    fill="#1E2024"
                    animate={{
                      cx: pokeId === 'red' ? [0, 3, -3, 0] : gaze.x * 5,
                      cy: pokeId === 'red' ? -3 : gaze.y * 5,
                      scaleY: blink ? 0.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  />
                  {!blink && (
                    <circle cx={gaze.x * 4 - 1.5} cy={gaze.y * 4 - 1.5} r="1.5" fill="#FFFFFF" />
                  )}
                </g>

                <g transform="translate(110, 128)">
                  {pokeId === 'red' ? (
                    <motion.g
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.45, 1.2] }}
                      transition={{ duration: 0.4 }}
                    >
                      <ellipse cx="0" cy="0" rx="16" ry="14" fill="#7F1D2E" />
                      <ellipse cx="0" cy="5" rx="10" ry="6" fill="#FA4D6E" opacity="0.6" />
                    </motion.g>
                  ) : isSuccess ? (
                    <motion.g
                      initial={{ scale: 0.6 }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 0.4 }}
                    >
                      <ellipse cx="0" cy="0" rx="15" ry="13" fill="#7F1D2E" />
                      <ellipse cx="0" cy="4" rx="9" ry="5" fill="#FA4D6E" opacity="0.4" />
                    </motion.g>
                  ) : isClickReacting ? (
                    <motion.g
                      key={`red-click-${clickTick}`}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.35, 1] }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <ellipse cx="0" cy="0" rx="14" ry="12" fill="#7F1D2E" />
                      <ellipse cx="0" cy="3" rx="7" ry="4" fill="#FA4D6E" opacity="0.5" />
                    </motion.g>
                  ) : isTyping ? (
                    <motion.ellipse
                      key={`red-type-${typingTick}`}
                      cx="0"
                      cy="0"
                      rx="12"
                      ry="10"
                      fill="#7F1D2E"
                      initial={{ scaleY: 0.4 }}
                      animate={{ scaleY: [0.4, 1.25, 0.4] }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <ellipse cx="0" cy="0" rx="13" ry="10" fill="#7F1D2E" />
                  )}
                </g>
              </motion.g>
            </motion.g>
          </g>

          {/* 2. PINK MONSTER */}
          <g id="pink-arch-monster" onClick={() => handlePoke('pink')} className="cursor-pointer">
            <motion.g
              animate={{
                y:
                  pokeId === 'pink'
                    ? -14
                    : isClickReacting
                      ? -7
                      : isSuccess
                        ? -22
                        : isEmailFocused
                          ? -4
                          : 0,
                rotate: pokeId === 'pink' ? [0, 4, 3] : 0,
                x: pokeId === 'pink' ? 4 : 0,
                scaleY: pokeId === 'pink' ? 1.05 : isClickReacting ? 1.03 : 1,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              style={{ transformOrigin: '237px 385px' }}
            >
              <motion.g
                animate={{ scaleY: [1, 1.025, 1], scaleX: [1, 0.992, 1], y: [0, -3.2, 0] }}
                transition={{ repeat: Infinity, duration: 3.9, ease: 'easeInOut', delay: 0.6 }}
                style={{ transformOrigin: '237px 385px' }}
              >
                <path
                  d="M 160,385 L 160,200 C 160,135 315,135 315,200 L 315,385 Z"
                  fill="#FFAEBE"
                  filter="url(#charShadow)"
                />

                {pokeId === 'pink' && (
                  <g>
                    <circle cx="195" cy="225" r="16" fill="url(#blushGlow)" />
                    <circle cx="195" cy="225" r="10" fill="#FF4081" opacity="0.65" />
                    <circle cx="282" cy="225" r="16" fill="url(#blushGlow)" />
                    <circle cx="282" cy="225" r="10" fill="#FF4081" opacity="0.65" />
                    <motion.g
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], y: -35, scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.8 }}
                    >
                      <path
                        d="M 235,160 C 235,152 243,152 243,160 C 243,168 235,174 235,174 C 235,174 227,168 227,160 C 227,152 235,152 235,160 Z"
                        fill="#FF2A6D"
                      />
                    </motion.g>
                  </g>
                )}

                <g transform="translate(240, 205)">
                  <circle cx="0" cy="0" r="22" fill="#FFFFFF" />
                  {pokeId === 'pink' ? (
                    <motion.path
                      d="M -14,2 Q 0,-10 14,2"
                      stroke="#1E2024"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={8}
                      fill="#1E2024"
                      animate={{ cx: gaze.x * 9, cy: gaze.y * 9, scaleY: blink ? 0.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                  )}
                  {!blink && !pokeId && (
                    <circle cx={gaze.x * 8 - 2.5} cy={gaze.y * 8 - 2.5} r="2.5" fill="#FFFFFF" />
                  )}
                  {blink && !pokeId && (
                    <line
                      x1="-18"
                      y1="0"
                      x2="18"
                      y2="0"
                      stroke="#FFAEBE"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  )}
                </g>

                <g transform="translate(262, 252)">
                  {pokeId === 'pink' ? (
                    <motion.g
                      initial={{ scale: 0.7 }}
                      animate={{ scale: [0.7, 1.25, 1] }}
                      transition={{ duration: 0.35 }}
                    >
                      <path d="M -12,-4 C -12,12 12,12 12,-4 Z" fill="#9F4D65" />
                      <path d="M -6,4 C -6,10 6,10 6,4 Z" fill="#F43F5E" />
                      <rect x="-7" y="-4" width="5.5" height="4.5" rx="1.5" fill="#FFFFFF" />
                      <rect x="1" y="-4" width="5.5" height="4.5" rx="1.5" fill="#FFFFFF" />
                    </motion.g>
                  ) : isSuccess ? (
                    <motion.g
                      initial={{ scale: 0.6 }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <path d="M -12,-8 C -12,16 12,16 12,-8 Z" fill="#9F4D65" />
                      <path d="M -6,8 C -6,14 6,14 6,8 Z" fill="#F43F5E" />
                      <rect x="-7" y="-8" width="6" height="5.5" rx="1.5" fill="#FFFFFF" />
                      <rect x="1" y="-8" width="6" height="5.5" rx="1.5" fill="#FFFFFF" />
                    </motion.g>
                  ) : isClickReacting ? (
                    <motion.g
                      key={`pink-click-${clickTick}`}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.35, 1] }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <path d="M -11,-7 C -11,14 11,14 11,-7 Z" fill="#9F4D65" />
                      <path d="M -5,6 C -5,12 5,12 5,6 Z" fill="#F43F5E" />
                      <rect x="-6" y="-7" width="5.5" height="5" rx="1.5" fill="#FFFFFF" />
                      <rect x="1" y="-7" width="5.5" height="5" rx="1.5" fill="#FFFFFF" />
                    </motion.g>
                  ) : isTyping ? (
                    <motion.g
                      key={`pink-type-${typingTick}`}
                      initial={{ scaleY: 0.4 }}
                      animate={{ scaleY: [0.4, 1.25, 0.4] }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M -9,-6 C -9,11 9,11 9,-6 Z" fill="#9F4D65" />
                      <rect x="-5.5" y="-6" width="5" height="4.5" rx="1.5" fill="#FFFFFF" />
                      <rect x="0.5" y="-6" width="5" height="4.5" rx="1.5" fill="#FFFFFF" />
                    </motion.g>
                  ) : (
                    <g>
                      <path d="M -9,-6 C -9,12 9,12 9,-6 Z" fill="#9F4D65" />
                      <rect x="-6" y="-6" width="5" height="5" rx="1.5" fill="#FFFFFF" />
                      <rect x="1" y="-6" width="5" height="5" rx="1.5" fill="#FFFFFF" />
                    </g>
                  )}
                </g>
              </motion.g>
            </motion.g>
          </g>

          {/* 3. CYAN MONSTER */}
          <g id="cyan-cloud-monster" onClick={() => handlePoke('cyan')} className="cursor-pointer">
            <motion.g
              animate={{
                y:
                  pokeId === 'cyan'
                    ? [-42, -35, 0]
                    : isClickReacting
                      ? -10
                      : isSuccess
                        ? -24
                        : isEmailFocused
                          ? [0, -5, 0]
                          : 0,
                x: pokeId === 'cyan' ? [-6, 6, -3, 0] : isEmailFocused ? 4 : 0,
                scale: pokeId === 'cyan' ? [1, 1.18, 0.98, 1] : isClickReacting ? 1.04 : 1,
              }}
              transition={{
                y: isEmailFocused
                  ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 280, damping: 16 },
                type: 'spring',
                stiffness: 280,
                damping: 16,
              }}
              style={{ transformOrigin: '104px 385px' }}
            >
              <motion.g
                animate={{ scaleY: [1, 1.035, 1], scaleX: [1, 0.98, 1], y: [0, -2.6, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 1.1 }}
                style={{ transformOrigin: '104px 385px' }}
              >
                <line
                  x1="88"
                  y1={pokeId === 'cyan' ? 320 : 300}
                  x2="88"
                  y2="385"
                  stroke="#68D5D9"
                  strokeWidth="15"
                  strokeLinecap="round"
                />
                <line
                  x1="120"
                  y1={pokeId === 'cyan' ? 320 : 300}
                  x2="120"
                  y2="385"
                  stroke="#68D5D9"
                  strokeWidth="15"
                  strokeLinecap="round"
                />

                {pokeId === 'cyan' && (
                  <g>
                    <circle cx="48" cy="235" r="5" fill="#68D5D9" opacity="0.6" />
                    <circle cx="160" cy="240" r="6" fill="#68D5D9" opacity="0.6" />
                    <circle cx="55" cy="215" r="3.5" fill="#68D5D9" opacity="0.4" />
                    <circle cx="152" cy="220" r="4" fill="#68D5D9" opacity="0.4" />
                  </g>
                )}

                <g transform="translate(104, 260)">
                  <path
                    d="M -48,-10 C -62,-28 -40,-54 -10,-48 C 10,-64 42,-52 50,-28 C 68,-18 68,16 50,34 C 44,56 14,60 -10,50 C -30,60 -60,42 -48,16 C -62,6 -58,-10 -48,-10 Z"
                    fill="#68D5D9"
                    filter="url(#charShadow)"
                  />
                  <g transform="translate(-16, -6)">
                    <circle cx="0" cy="0" r="12" fill="#FFFFFF" />
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={pokeId === 'cyan' ? 6 : 4.5}
                      fill="#1E2024"
                      animate={{ cx: gaze.x * 5, cy: gaze.y * 5, scaleY: blink ? 0.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle cx={gaze.x * 4 - 1.5} cy={gaze.y * 4 - 1.5} r="1.5" fill="#FFFFFF" />
                    )}
                  </g>
                  <g transform="translate(16, -6)">
                    <circle cx="0" cy="0" r="12" fill="#FFFFFF" />
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={pokeId === 'cyan' ? 6 : 4.5}
                      fill="#1E2024"
                      animate={{ cx: gaze.x * 5, cy: gaze.y * 5, scaleY: blink ? 0.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    />
                    {!blink && (
                      <circle cx={gaze.x * 4 - 1.5} cy={gaze.y * 4 - 1.5} r="1.5" fill="#FFFFFF" />
                    )}
                  </g>
                  <g transform="translate(0, 18)">
                    {pokeId === 'cyan' ? (
                      <motion.ellipse
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [0.5, 1.4, 1.1] }}
                        transition={{ duration: 0.35 }}
                        cx="0"
                        cy="0"
                        rx="12"
                        ry="14"
                        fill="#2A7B82"
                      />
                    ) : isSuccess ? (
                      <motion.ellipse
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ duration: 0.3 }}
                        cx="0"
                        cy="0"
                        rx="11"
                        ry="13"
                        fill="#2A7B82"
                      />
                    ) : isClickReacting ? (
                      <motion.ellipse
                        key={`cyan-click-${clickTick}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [0.5, 1.4, 1] }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        cx="0"
                        cy="0"
                        rx="10"
                        ry="12"
                        fill="#2A7B82"
                      />
                    ) : isTyping ? (
                      <motion.ellipse
                        key={`cyan-type-${typingTick}`}
                        cx="0"
                        cy="0"
                        rx="8"
                        ry="9"
                        fill="#2A7B82"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [0.5, 1.25, 0.5] }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <circle cx="0" cy="0" r="8" fill="#2A7B82" />
                    )}
                  </g>
                </g>
              </motion.g>
            </motion.g>
          </g>

          {/* 4. BLUE MONSTER */}
          <g id="blue-round-monster" onClick={() => handlePoke('blue')} className="cursor-pointer">
            <motion.g
              animate={{
                y: pokeId === 'blue' ? [-22, -18, 0] : isClickReacting ? -8 : isSuccess ? -22 : 0,
                x: pokeId === 'blue' ? [-10, 10, -8, 8, -5, 5, -2, 0] : 0,
                rotate: pokeId === 'blue' ? [-7, 7, -5, 5, -3, 3, 0] : 0,
                scale: pokeId === 'blue' ? [1, 1.15, 1.05, 1] : isClickReacting ? 1.04 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: pokeId === 'blue' ? 500 : 300,
                damping: pokeId === 'blue' ? 12 : 20,
              }}
              style={{ transformOrigin: '198px 385px' }}
            >
              <motion.g
                animate={{ scaleY: [1, 1.036, 1], scaleX: [1, 0.982, 1], y: [0, -2.4, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
                style={{ transformOrigin: '198px 385px' }}
              >
                <line
                  x1="184"
                  y1="330"
                  x2="184"
                  y2="385"
                  stroke="#388BFD"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <line
                  x1="212"
                  y1="330"
                  x2="212"
                  y2="385"
                  stroke="#388BFD"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {pokeId === 'blue' && (
                  <g opacity="0.85">
                    <path
                      d="M 142,275 Q 138,285 142,295"
                      stroke="#388BFD"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 254,275 Q 258,285 254,295"
                      stroke="#388BFD"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <motion.text
                      x="195"
                      y="235"
                      fontSize="16"
                      fontWeight="bold"
                      fill="#1C4B82"
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], y: -25 }}
                      transition={{ duration: 0.7 }}
                    >
                      ♪
                    </motion.text>
                  </g>
                )}

                <g transform="translate(198, 290)">
                  <circle cx="0" cy="0" r="48" fill="#388BFD" filter="url(#charShadow)" />
                  {pokeId === 'blue' ? (
                    <g>
                      <path
                        d="M -20,-16 L -10,-12 L -20,-8"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M 20,-16 L 10,-12 L 20,-8"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  ) : (
                    <>
                      <g transform="translate(-14, -16)">
                        <circle cx="0" cy="0" r="11" fill="#FFFFFF" />
                        <motion.circle
                          cx={0}
                          cy={0}
                          r={4}
                          fill="#1E2024"
                          animate={{ cx: gaze.x * 5, cy: gaze.y * 5, scaleY: blink ? 0.1 : 1 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        />
                        {!blink && (
                          <circle
                            cx={gaze.x * 4 - 1.2}
                            cy={gaze.y * 4 - 1.2}
                            r="1.3"
                            fill="#FFFFFF"
                          />
                        )}
                      </g>
                      <g transform="translate(14, -16)">
                        <circle cx="0" cy="0" r="11" fill="#FFFFFF" />
                        <motion.circle
                          cx={0}
                          cy={0}
                          r={4}
                          fill="#1E2024"
                          animate={{ cx: gaze.x * 5, cy: gaze.y * 5, scaleY: blink ? 0.1 : 1 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        />
                        {!blink && (
                          <circle
                            cx={gaze.x * 4 - 1.2}
                            cy={gaze.y * 4 - 1.2}
                            r="1.3"
                            fill="#FFFFFF"
                          />
                        )}
                      </g>
                    </>
                  )}

                  <g transform="translate(0, 10)">
                    {pokeId === 'blue' ? (
                      <motion.g
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [0.5, 1.4, 1.2] }}
                        transition={{ duration: 0.35 }}
                      >
                        <circle cx="0" cy="0" r="15" fill="#1C4B82" />
                        <rect x="-4.5" y="-15" width="9" height="7" rx="1.5" fill="#FFFFFF" />
                        <path d="M -6,6 C -6,11 6,11 6,6 Z" fill="#F43F5E" />
                      </motion.g>
                    ) : isSuccess ? (
                      <motion.g
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                      >
                        <circle cx="0" cy="0" r="14" fill="#1C4B82" />
                        <rect x="-4.5" y="-14" width="9" height="6.5" rx="1.5" fill="#FFFFFF" />
                      </motion.g>
                    ) : isClickReacting ? (
                      <motion.g
                        key={`blue-click-${clickTick}`}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: [0.5, 1.35, 1] }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      >
                        <circle cx="0" cy="0" r="13" fill="#1C4B82" />
                        <rect x="-4" y="-13" width="8" height="6" rx="1.5" fill="#FFFFFF" />
                      </motion.g>
                    ) : isTyping ? (
                      <motion.g
                        key={`blue-type-${typingTick}`}
                        initial={{ scaleY: 0.5 }}
                        animate={{ scaleY: [0.5, 1.25, 0.5] }}
                        transition={{ duration: 0.2 }}
                      >
                        <circle cx="0" cy="0" r="10" fill="#1C4B82" />
                        <rect x="-3" y="-10" width="6" height="5" rx="1" fill="#FFFFFF" />
                      </motion.g>
                    ) : (
                      <g>
                        <circle cx="0" cy="0" r="11" fill="#1C4B82" />
                        <rect x="-3.5" y="-11" width="7" height="5.5" rx="1.5" fill="#FFFFFF" />
                      </g>
                    )}
                  </g>
                </g>
              </motion.g>
            </motion.g>
          </g>

          {/* 5. YELLOW MONSTER */}
          <g
            id="yellow-mini-monster"
            onClick={() => handlePoke('yellow')}
            className="cursor-pointer"
          >
            <motion.g
              animate={{
                y:
                  pokeId === 'yellow'
                    ? [-38, -48, -20, 0]
                    : isClickReacting
                      ? -8
                      : isSuccess
                        ? -20
                        : 0,
                rotate: pokeId === 'yellow' ? [0, 180, 360] : 0,
                scale: pokeId === 'yellow' ? [1, 1.25, 1.1, 1] : isClickReacting ? 1.05 : 1,
              }}
              transition={{ duration: pokeId === 'yellow' ? 0.65 : 0.3, ease: 'easeInOut' }}
              style={{ transformOrigin: '303px 330px' }}
            >
              <motion.g
                animate={{ scaleY: [1, 1.045, 1], scaleX: [1, 0.975, 1], y: [0, -2.8, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 1.4 }}
                style={{ transformOrigin: '302px 385px' }}
              >
                <line
                  x1="294"
                  y1="350"
                  x2="294"
                  y2="385"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <line
                  x1="312"
                  y1="350"
                  x2="312"
                  y2="385"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {pokeId === 'yellow' && (
                  <g opacity="0.9">
                    <circle cx="275" cy="295" r="3" fill="#FBBF24" />
                    <circle cx="335" cy="300" r="3" fill="#FBBF24" />
                    <circle cx="303" cy="265" r="4" fill="#F59E0B" />
                  </g>
                )}

                <path
                  d="M 280,360 C 275,325 285,285 303,285 C 321,285 331,325 326,360 C 324,374 282,374 280,360 Z"
                  fill="#FBBF24"
                  filter="url(#charShadow)"
                />
                <circle cx="303" cy="278" r="4.5" fill="#F59E0B" />
                <line
                  x1="303"
                  y1="285"
                  x2="303"
                  y2="280"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <g transform="translate(296, 312)">
                  <circle cx="0" cy="0" r="7.5" fill="#FFFFFF" />
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={3}
                    fill="#1E2024"
                    animate={{ cx: gaze.x * 3.5, cy: gaze.y * 3.5, scaleY: blink ? 0.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  />
                  {!blink && (
                    <circle cx={gaze.x * 2.5 - 1} cy={gaze.y * 2.5 - 1} r="1" fill="#FFFFFF" />
                  )}
                </g>

                <g transform="translate(310, 312)">
                  <circle cx="0" cy="0" r="7.5" fill="#FFFFFF" />
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={3}
                    fill="#1E2024"
                    animate={{ cx: gaze.x * 3.5, cy: gaze.y * 3.5, scaleY: blink ? 0.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  />
                  {!blink && (
                    <circle cx={gaze.x * 2.5 - 1} cy={gaze.y * 2.5 - 1} r="1" fill="#FFFFFF" />
                  )}
                </g>

                <g transform="translate(303, 332)">
                  {pokeId === 'yellow' ? (
                    <motion.g
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.4, 1.1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <circle cx="0" cy="0" r="7.5" fill="#92400E" />
                      <circle cx="0" cy="2.5" r="3.5" fill="#F87171" />
                    </motion.g>
                  ) : isSuccess ? (
                    <motion.g
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.35 }}
                    >
                      <circle cx="0" cy="0" r="7" fill="#92400E" />
                      <path d="M -3,2 C -3,5 3,5 3,2 Z" fill="#F87171" />
                    </motion.g>
                  ) : isClickReacting ? (
                    <motion.g
                      key={`yellow-click-${clickTick}`}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.4, 1] }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <circle cx="0" cy="0" r="6.5" fill="#92400E" />
                      <circle cx="0" cy="2" r="2.5" fill="#F87171" />
                    </motion.g>
                  ) : isTyping ? (
                    <motion.ellipse
                      key={`yellow-type-${typingTick}`}
                      cx="0"
                      cy="0"
                      rx="5"
                      ry="5"
                      fill="#92400E"
                      initial={{ scaleY: 0.4 }}
                      animate={{ scaleY: [0.4, 1.3, 0.4] }}
                      transition={{ duration: 0.18 }}
                    />
                  ) : (
                    <path
                      d="M -5,-1 Q 0,4 5,-1"
                      stroke="#92400E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>
              </motion.g>
            </motion.g>
          </g>
        </svg>
      </div>
    </div>
  )
}
