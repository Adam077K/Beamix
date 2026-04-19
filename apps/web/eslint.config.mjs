// ESLint 9 flat config for Next.js 16
// eslint-config-next@16 ships a flat-config-compatible array export — import directly.
// No FlatCompat shim needed.
import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    // Project-level overrides
    rules: {
      // Allow unused vars prefixed with _ (common TS pattern)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]
