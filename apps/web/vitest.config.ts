import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}', 'components/**/*.test.{ts,tsx}', 'lib/**/*.test.ts'],
    clearMocks: true,
  },
  resolve: {
    // Mirrors the `@/*` path mapping in tsconfig.json.
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
