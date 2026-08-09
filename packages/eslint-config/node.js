import globals from 'globals'

import { config as baseConfig } from './base.js'

/**
 * ESLint config for Node.js server packages.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]

export default nodeConfig
