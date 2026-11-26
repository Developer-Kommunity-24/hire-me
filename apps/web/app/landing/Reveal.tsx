'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Delay in seconds, handy for staggering siblings. */
  delay?: number
}

/**
 * Fades and lifts its children into view the first time they scroll on screen.
 * Falls back to a plain wrapper when the visitor prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
