import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GENERIC_OAUTH_ERROR } from './auth-logic'

const signInWithOAuth = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithOAuth } }),
}))

import { handleGoogleOAuth } from './oauth-click'

beforeEach(() => {
  vi.clearAllMocks()
  // node env has no window — stub the only browser API the handler reads.
  vi.stubGlobal('window', { location: { origin: 'https://app.test' } })
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('handleGoogleOAuth', () => {
  it('calls onStart regardless of outcome', async () => {
    signInWithOAuth.mockResolvedValue({ error: null })
    const onStart = vi.fn()
    const onError = vi.fn()
    await handleGoogleOAuth('/dashboard', { onStart, onError })
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('calls onError with the generic message when the SDK returns an error', async () => {
    signInWithOAuth.mockResolvedValue({ error: { message: 'provider down' } })
    const onStart = vi.fn()
    const onError = vi.fn()
    await handleGoogleOAuth('/dashboard', { onStart, onError })
    expect(onError).toHaveBeenCalledWith(GENERIC_OAUTH_ERROR)
  })

  it('does NOT call onError on success', async () => {
    signInWithOAuth.mockResolvedValue({ error: null })
    const onStart = vi.fn()
    const onError = vi.fn()
    await handleGoogleOAuth('/dashboard', { onStart, onError })
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError (never throws) when the SDK rejects', async () => {
    signInWithOAuth.mockRejectedValue(new Error('network'))
    const onStart = vi.fn()
    const onError = vi.fn()
    await handleGoogleOAuth('/dashboard', { onStart, onError })
    expect(onError).toHaveBeenCalledWith(GENERIC_OAUTH_ERROR)
  })
})
