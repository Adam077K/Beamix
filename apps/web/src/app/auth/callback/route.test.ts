/**
 * Tests for GET /auth/callback — PKCE code-exchange + OAuth return handler.
 *
 * Mocked: @/lib/supabase/server (createServerSupabaseClient → auth.exchangeCodeForSession).
 * sanitizeNext is the real implementation (open-redirect guard is part of the contract).
 *
 * Branches covered:
 *   1. code + exchange success     → redirect to origin + sanitized next
 *   2. code + exchange error       → /login?error=auth
 *   3. code + exchange throws       → /login?error=auth
 *   4. no code                      → redirect to next, no exchange call
 *   5. OAuth provider ?error=...    → /login?error=auth, no exchange call
 *   6. open-redirect next           → falls back to /dashboard
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { exchangeCodeForSession } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession },
  })),
}))

import { GET } from './route'

function callbackReq(query: string) {
  return new NextRequest(`https://app.test/auth/callback${query}`)
}
function location(res: Response): string | null {
  return res.headers.get('location')
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GET /auth/callback', () => {
  it('exchanges the code and redirects to the sanitized next', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const res = await GET(callbackReq('?code=abc&next=/settings'))
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc')
    expect(location(res)).toBe('https://app.test/settings')
  })

  it('redirects to /login?error=auth when the exchange returns an error', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: 'bad code', status: 400 } })
    const res = await GET(callbackReq('?code=bad&next=/settings'))
    expect(location(res)).toBe('https://app.test/login?error=auth')
  })

  it('redirects to /login?error=auth when the exchange throws', async () => {
    exchangeCodeForSession.mockRejectedValue(new Error('boom'))
    const res = await GET(callbackReq('?code=x'))
    expect(location(res)).toBe('https://app.test/login?error=auth')
  })

  it('redirects to next without exchanging when no code is present', async () => {
    const res = await GET(callbackReq('?next=/dashboard'))
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(location(res)).toBe('https://app.test/dashboard')
  })

  it('redirects to /login?error=auth on an OAuth provider error, without exchanging', async () => {
    const res = await GET(callbackReq('?error=access_denied&error_description=denied'))
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(location(res)).toBe('https://app.test/login?error=auth')
  })

  it('defaults to /dashboard on a successful exchange with no next param', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const res = await GET(callbackReq('?code=abc'))
    expect(location(res)).toBe('https://app.test/dashboard')
  })

  it('prioritizes an OAuth ?error over a present ?code (no exchange)', async () => {
    const res = await GET(callbackReq('?code=abc&error=access_denied&next=/settings'))
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(location(res)).toBe('https://app.test/login?error=auth')
  })

  it('sanitizes an open-redirect next to /dashboard (with code)', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null })
    const abs = await GET(callbackReq(`?code=abc&next=${encodeURIComponent('https://evil.com')}`))
    expect(location(abs)).toBe('https://app.test/dashboard')
    const proto = await GET(callbackReq(`?code=abc&next=${encodeURIComponent('//evil.com')}`))
    expect(location(proto)).toBe('https://app.test/dashboard')
  })

  it('sanitizes an open-redirect next to /dashboard on the no-code path', async () => {
    const abs = await GET(callbackReq(`?next=${encodeURIComponent('https://evil.com')}`))
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(location(abs)).toBe('https://app.test/dashboard')
    const proto = await GET(callbackReq(`?next=${encodeURIComponent('//evil.com')}`))
    expect(location(proto)).toBe('https://app.test/dashboard')
  })

  it('logs the SANITIZED OAuth error, never the raw attacker-controlled value', async () => {
    await GET(callbackReq('?error=access_denied%0aX-Injected:evil'))
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ error: 'access_deniedX-Injectedevil' }),
    )
  })
})
