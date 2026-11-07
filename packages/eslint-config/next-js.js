import pluginNext from '@next/eslint-plugin-next'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import shadcn from '@shadcn/lint'

import { config as baseConfig } from './base.js'

/**
 * ESLint config for Next.js apps.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nextJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.serviceworker },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
      'react-hooks': pluginReactHooks,
      shadcn: shadcn,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'shadcn/no-restyle': 'error',
    },
  },
]

export default nextJsConfig
