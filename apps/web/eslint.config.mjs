import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Service-role import boundary (H4)
  // Forbid importing server-only modules from client/public surfaces
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Forbid service-role admin from non-server files
            {
              target: ['./src/app/(public)', './src/components'],
              from: ['./src/lib/db/admin', './src/lib/billing/paddle-webhook', './src/lib/server-only'],
              message:
                'Service-role modules (admin, paddle-webhook) must only be imported from Server Actions or Route Handlers. They are forbidden in (public) routes and components.',
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
