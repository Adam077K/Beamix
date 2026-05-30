import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Top-level await is used in deliverables.test.ts for dynamic import after mocks.
    pool: 'forks',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub out Next.js server-only guard — not a runtime module in tests
      'server-only': path.resolve(__dirname, './src/__tests__/__mocks__/server-only.ts'),
    },
  },
});
