import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  mapResetError,
  nextRecoveryGate,
  recoveryRedirectTo,
  loginSubmit,
  signupSubmit,
  oauthSubmit,
  forgotSubmit,
  resetSubmit,
  GENERIC_LOGIN_ERROR,
  GENERIC_OAUTH_ERROR,
  GENERIC_SIGNUP_ERROR,
  PASSWORD_RECOVERY_TIMEOUT_MS,
} from './auth-logic'

type AnyFn = ReturnType<typeof vi.fn>
function authMock(overrides: Record<string, AnyFn> = {}): SupabaseClient['auth'] {
  return {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  } as unknown as SupabaseClient['auth']
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('mapResetError', () => {
  it('422 → password-strength message', () => {
    expect(mapResetError(422)).toMatch(/strength/i)
  })
  it('other/undefined → invalid-or-expired message', () => {
    expect(mapResetError(undefined)).toMatch(/invalid or has expired/i)
    expect(mapResetError(401)).toMatch(/invalid or has expired/i)
  })
})

describe('nextRecoveryGate', () => {
  it('PASSWORD_RECOVERY unlocks from checking', () => {
    expect(nextRecoveryGate('PASSWORD_RECOVERY', 'checking')).toBe('ready')
  })
  it('a late PASSWORD_RECOVERY cannot resurrect an invalidated gate', () => {
    expect(nextRecoveryGate('PASSWORD_RECOVERY', 'invalid')).toBe('invalid')
  })
  it('unrelated events leave the gate unchanged', () => {
    expect(nextRecoveryGate('SIGNED_IN', 'checking')).toBe('checking')
  })
  it('PASSWORD_RECOVERY from ready stays ready (idempotent)', () => {
    expect(nextRecoveryGate('PASSWORD_RECOVERY', 'ready')).toBe('ready')
  })
})

describe('recoveryRedirectTo', () => {
  it('points directly at /reset-password', () => {
    expect(recoveryRedirectTo('https://app.test')).toBe('https://app.test/reset-password')
  })
})

describe('loginSubmit', () => {
  it('ok on success', async () => {
    const auth = authMock({ signInWithPassword: vi.fn().mockResolvedValue({ error: null }) })
    expect(await loginSubmit(auth, { email: 'a@b.com', password: 'x' })).toEqual({ ok: true })
  })
  it('generic message on error (no account-existence oracle)', async () => {
    const auth = authMock({
      signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Email not confirmed', status: 400 } }),
    })
    expect(await loginSubmit(auth, { email: 'a@b.com', password: 'x' })).toEqual({
      ok: false,
      message: GENERIC_LOGIN_ERROR,
    })
  })
  it('does not freeze on a thrown SDK error', async () => {
    const auth = authMock({ signInWithPassword: vi.fn().mockRejectedValue(new Error('network')) })
    expect(await loginSubmit(auth, { email: 'a@b.com', password: 'x' })).toEqual({
      ok: false,
      message: GENERIC_LOGIN_ERROR,
    })
  })
})

describe('signupSubmit', () => {
  it('generic message on error (no enumeration)', async () => {
    const auth = authMock({ signUp: vi.fn().mockResolvedValue({ error: { message: 'User already registered' } }) })
    expect(
      await signupSubmit(auth, { email: 'a@b.com', password: 'x', origin: 'https://app.test', next: '/dashboard' }),
    ).toEqual({ ok: false, message: GENERIC_SIGNUP_ERROR })
  })
  it('passes emailRedirectTo through the callback with encoded next', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null })
    await signupSubmit(authMock({ signUp }), {
      email: 'a@b.com',
      password: 'x',
      origin: 'https://app.test',
      next: '/settings',
    })
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { emailRedirectTo: 'https://app.test/auth/callback?next=%2Fsettings' },
      }),
    )
  })
  it('returns ok on success', async () => {
    const auth = authMock({ signUp: vi.fn().mockResolvedValue({ error: null }) })
    expect(
      await signupSubmit(auth, { email: 'a@b.com', password: 'x', origin: 'https://app.test', next: '/dashboard' }),
    ).toEqual({ ok: true })
  })
  it('does not freeze on a thrown SDK error', async () => {
    const auth = authMock({ signUp: vi.fn().mockRejectedValue(new Error('network')) })
    expect(
      await signupSubmit(auth, { email: 'a@b.com', password: 'x', origin: 'https://app.test', next: '/dashboard' }),
    ).toEqual({ ok: false, message: GENERIC_SIGNUP_ERROR })
  })
})

describe('oauthSubmit', () => {
  it('generic message + no throw on error', async () => {
    const auth = authMock({ signInWithOAuth: vi.fn().mockResolvedValue({ error: { message: 'provider down' } }) })
    expect(await oauthSubmit(auth, { origin: 'https://app.test', next: '/dashboard' })).toEqual({
      ok: false,
      message: GENERIC_OAUTH_ERROR,
    })
  })
  it('ok when the SDK begins the redirect', async () => {
    const auth = authMock({ signInWithOAuth: vi.fn().mockResolvedValue({ error: null }) })
    expect(await oauthSubmit(auth, { origin: 'https://app.test', next: '/dashboard' })).toEqual({ ok: true })
  })
  it('passes the callback redirectTo with encoded next', async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ error: null })
    await oauthSubmit(authMock({ signInWithOAuth }), { origin: 'https://app.test', next: '/settings' })
    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: { redirectTo: 'https://app.test/auth/callback?next=%2Fsettings' },
      }),
    )
  })
  it('does not throw on a thrown SDK error', async () => {
    const auth = authMock({ signInWithOAuth: vi.fn().mockRejectedValue(new Error('network')) })
    expect(await oauthSubmit(auth, { origin: 'https://app.test', next: '/dashboard' })).toEqual({
      ok: false,
      message: GENERIC_OAUTH_ERROR,
    })
  })
})

describe('forgotSubmit (anti-enumeration)', () => {
  it('resolves regardless of an error result', async () => {
    const auth = authMock({ resetPasswordForEmail: vi.fn().mockResolvedValue({ error: { message: 'rate limit' } }) })
    await expect(forgotSubmit(auth, 'a@b.com', 'https://app.test')).resolves.toBeUndefined()
  })
  it('resolves even if the SDK throws', async () => {
    const auth = authMock({ resetPasswordForEmail: vi.fn().mockRejectedValue(new Error('boom')) })
    await expect(forgotSubmit(auth, 'a@b.com', 'https://app.test')).resolves.toBeUndefined()
  })
  it('uses the /reset-password redirectTo', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null })
    await forgotSubmit(authMock({ resetPasswordForEmail }), 'a@b.com', 'https://app.test')
    expect(resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', {
      redirectTo: 'https://app.test/reset-password',
    })
  })
})

describe('resetSubmit', () => {
  it('calls global signOut after a successful update', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    const auth = authMock({ updateUser: vi.fn().mockResolvedValue({ error: null }), signOut })
    expect(await resetSubmit(auth, 'newpass12')).toEqual({ ok: true })
    expect(signOut).toHaveBeenCalledWith({ scope: 'global' })
  })
  it('maps a 422 to the strength message', async () => {
    const auth = authMock({ updateUser: vi.fn().mockResolvedValue({ error: { status: 422 } }) })
    const out = await resetSubmit(auth, 'weak')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.message).toMatch(/strength/i)
  })
  it('still succeeds if signOut fails, but logs it (revocation not silently swallowed)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const auth = authMock({
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: { status: 500 } }),
    })
    expect(await resetSubmit(auth, 'newpass12')).toEqual({ ok: true })
    expect(errSpy).toHaveBeenCalled()
  })
  it('on a thrown updateUser returns ok:false with the invalid-or-expired message', async () => {
    const auth = authMock({ updateUser: vi.fn().mockRejectedValue(new Error('network')) })
    const out = await resetSubmit(auth, 'newpass12')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.message).toMatch(/invalid or has expired/i)
  })
  it('still returns ok:true when signOut THROWS after a successful update', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const auth = authMock({
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockRejectedValue(new Error('network')),
    })
    expect(await resetSubmit(auth, 'newpass12')).toEqual({ ok: true })
    expect(errSpy).toHaveBeenCalled()
  })
})

describe('PASSWORD_RECOVERY_TIMEOUT_MS', () => {
  it('equals 4000 (regression guard — gate timeout must not silently drift)', () => {
    expect(PASSWORD_RECOVERY_TIMEOUT_MS).toBe(4000)
  })
})
