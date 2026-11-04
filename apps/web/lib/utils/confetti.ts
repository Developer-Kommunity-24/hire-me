import confetti, { type Options } from 'canvas-confetti'

export const CONFETTI_COLORS = ['#00C26D', '#34D399', '#10B981', '#3B82F6', '#6366F1']
export const ONBOARDING_REDIRECT_DELAY_MS = 1400

export function showConfetti(options?: Options) {
  try {
    void confetti({
      particleCount: 95,
      spread: 75,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS,
      ...options,
    })
  } catch {
    // Fallback when canvas environment is unavailable
  }
}
