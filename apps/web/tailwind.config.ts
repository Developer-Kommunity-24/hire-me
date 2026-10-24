import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00c26d',
          hover: '#00a85c',
          dark: '#00874a',
          light: '#e8f8f2',
          mint: '#a7f3d0',
          emerald: '#10b981',
          glow: 'rgba(0, 194, 109, 0.22)',
        },
        recruiter: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          dark: '#6d28d9',
          light: '#efefff',
          muted: '#a78bfa',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        page: {
          DEFAULT: '#f8fafc',
          subtle: '#e9eef5',
        },
        stage: '#eef2f6',
        card: '#ffffff',
        surface: {
          hero: {
            start: '#f9fcfa',
            end: '#f1f8f5',
          },
        },
        border: {
          subtle: '#e2e8f0',
          muted: '#cbd5e1',
        },
        text: {
          main: '#0f172a',
          muted: '#64748b',
        },
        action: {
          dark: '#0f172a',
          'dark-hover': '#000000',
        },
        linkedin: '#0a66c2',
        monster: {
          red: { DEFAULT: '#fa4d6e', dark: '#7f1d2e' },
          pink: { DEFAULT: '#ffaebe', dark: '#9f4d65' },
          cyan: { DEFAULT: '#68d5d9', dark: '#2a7b82' },
          blue: { DEFAULT: '#388bfd', dark: '#1c4b82' },
        },
        clay: {
          sphere: {
            start: '#25eb8f',
            mid1: '#00c26d',
            mid2: '#009e56',
            dark: '#007f45',
            end: '#006336',
          },
        },
      },
    },
  },
}

export default config
