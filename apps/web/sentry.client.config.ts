// Sentry browser SDK configuration
// Loaded automatically by Next.js for client-side error tracking
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% of transactions sent to Sentry for performance monitoring
  tracesSampleRate: 0.1,

  // Session Replay: capture 10% of all sessions, 100% of error sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
})
