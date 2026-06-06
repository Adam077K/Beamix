import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    // Dev-only: Next.js dev/HMR (react-refresh) requires 'unsafe-eval'. Production
    // keeps the strict policy WITHOUT 'unsafe-eval' — no production security change.
    const isDev = process.env.NODE_ENV !== 'production'
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paddle.com https://challenges.cloudflare.com"
      : "script-src 'self' 'unsafe-inline' https://*.paddle.com https://challenges.cloudflare.com"
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // TODO Wave 0.5: replace 'unsafe-inline' with 'nonce-{nonce}' once middleware injects a per-request nonce.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.supabase.co https://api.openrouter.ai https://api.anthropic.com https://api.perplexity.ai https://api.resend.com",
              "frame-src https://*.paddle.com https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
