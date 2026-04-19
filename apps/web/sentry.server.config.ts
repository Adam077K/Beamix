// Sentry Node.js SDK configuration
// Loaded automatically by Next.js for server-side error tracking
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // 10% of transactions sent to Sentry for performance monitoring
  tracesSampleRate: 0.1,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
})
