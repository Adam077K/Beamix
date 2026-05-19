import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'OPENROUTER_API_KEY',
  'PERPLEXITY_API_KEY',
  'RESEND_API_KEY',
  'INNGEST_EVENT_KEY',
  'INNGEST_SIGNING_KEY',
  'PADDLE_API_KEY',
  'PADDLE_NOTIFICATION_SECRET',
  'PADDLE_PRICE_DISCOVER_MONTHLY',
  'PADDLE_PRICE_DISCOVER_ANNUAL',
  'PADDLE_PRICE_BUILD_MONTHLY',
  'PADDLE_PRICE_BUILD_ANNUAL',
  'PADDLE_PRICE_SCALE_MONTHLY',
  'PADDLE_PRICE_SCALE_ANNUAL',
  'PADDLE_PRICE_TOPUP',
  'SENTRY_DSN',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_POSTHOG_KEY',
] as const

export async function GET() {
  const missing = REQUIRED_ENV_KEYS.filter(
    (key) => !process.env[key] || process.env[key]!.trim() === ''
  )

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, missing }, { status: 503 })
  }

  return NextResponse.json(
    {
      ok: true,
      version: process.env.npm_package_version ?? 'unknown',
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
    },
    { status: 200 }
  )
}
