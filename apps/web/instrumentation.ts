// Next.js instrumentation hook
// Routes to the correct Sentry config based on the runtime environment.
// Next.js calls register() once per server start for each runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  } else if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
