import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Call history must not leak between tests; `beforeEach` blocks re-arm the
    // return values they need.
    clearMocks: true,
  },
  resolve: {
    alias: {
      // `@repo/db` ships TypeScript sources — it has no build step — so tests
      // resolve straight to the entrypoint Vite can transpile.
      '@repo/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
    },
  },
})
