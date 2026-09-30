import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Call history must not leak between tests; `beforeEach` blocks re-arm the
    // return values they need.
    clearMocks: true,
    testTimeout: 60000,
  },
  resolve: {
    alias: {
      // `@repo/db` ships TypeScript sources — it has no build step — so tests
      // resolve straight to the entrypoint Vite can transpile.
      '@repo/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
    },
  },
})
