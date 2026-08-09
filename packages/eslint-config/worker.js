import globals from 'globals'

import { config as baseConfig } from './base.js'

/**
 * ESLint config for Cloudflare Workers packages.
 *
 * Workers run on a Web-standard runtime, not Node, so the globals are the
 * service worker set rather than `globals.node`.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const workerConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.serviceworker, ...globals.browser },
    },
  },
]

export default workerConfig
