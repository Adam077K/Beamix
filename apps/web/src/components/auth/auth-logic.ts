/**
 * Pure, framework-free auth logic — extracted from the auth form components so the
 * security-critical paths are unit-testable in the node vitest env (no DOM stack).
 *
 * The form components stay thin: create the Supabase client, call one of these,
 * apply the returned outcome to local state. Every SDK call here is wrapped in
 * try/catch so a network-level throw can never freeze a form on 'submitting'.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

type Auth = SupabaseClient['auth']

export type SubmitOutcome = { ok: true } | { ok: false; message: string }

// Generic, enumeration-safe messages — never echo a raw Supabase error to the UI.
export const GENERIC_LOGIN_ERROR = 'Invalid email or password.'
export const GENERIC_OAUTH_ERROR = 'Google sign-in failed. Please try again.'
export const GENERIC_SIGNUP_ERROR =
  "We couldn't create your account. Please try again, or sign in instead."

/** How long the reset form waits for a PASSWORD_RECOVERY event before falling back to the invalid state. */
export const PASSWORD_RECOVERY_TIMEOUT_MS = 4000

/** Map a reset `updateUser` error status to a user-facing message. 422 = password policy. */
export function mapResetError(status: number | undefined): string {
  if (status === 422) {
    return 'That password does not meet the strength requirements. Try a stronger one.'
  }
  return 'This reset link is invalid or has expired. Request a new one from the sign-in page.'
}

export type Gate = 'checking' | 'ready' | 'invalid'

/**
 * Gate transition for the reset page. A PASSWORD_RECOVERY event unlocks the form,
 * BUT a late event must never resurrect an already-invalidated gate (so an expired
 * timeout can't be re-opened by a stray event).
 */
export function nextRecoveryGate(event: string, current: Gate): Gate {
  if (event === 'PASSWORD_RECOVERY') return current === 'invalid' ? 'invalid' : 'ready'
  return current
}

/** Recovery email lands directly on /reset-password (the client there fires PASSWORD_RECOVERY). */
export function recoveryRedirectTo(origin: string): string {
  return `${origin}/reset-password`
}

function callbackRedirectTo(origin: string, next: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`
}

export async function loginSubmit(
  auth: Auth,
  creds: { email: string; password: string },
): Promise<SubmitOutcome> {
  try {
    const { error } = await auth.signInWithPassword(creds)
    // Generic on ANY error — never distinguish wrong-password from no-such-account.
    if (error) return { ok: false, message: GENERIC_LOGIN_ERROR }
    return { ok: true }
  } catch {
    return { ok: false, message: GENERIC_LOGIN_ERROR }
  }
}

export async function signupSubmit(
  auth: Auth,
  opts: { email: string; password: string; origin: string; next: string },
): Promise<SubmitOutcome> {
  try {
    const { error } = await auth.signUp({
      email: opts.email,
      password: opts.password,
      options: { emailRedirectTo: callbackRedirectTo(opts.origin, opts.next) },
    })
    if (error) return { ok: false, message: GENERIC_SIGNUP_ERROR }
    return { ok: true }
  } catch {
    return { ok: false, message: GENERIC_SIGNUP_ERROR }
  }
}

export async function oauthSubmit(
  auth: Auth,
  opts: { origin: string; next: string },
): Promise<SubmitOutcome> {
  try {
    const { error } = await auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackRedirectTo(opts.origin, opts.next) },
    })
    if (error) return { ok: false, message: GENERIC_OAUTH_ERROR }
    return { ok: true }
  } catch {
    return { ok: false, message: GENERIC_OAUTH_ERROR }
  }
}

/**
 * Forgot-password: ALWAYS resolves successfully (anti-enumeration — never reveal
 * whether the email exists). Errors are swallowed (not surfaced, not logged
 * client-side where devtools could read them).
 */
export async function forgotSubmit(auth: Auth, email: string, origin: string): Promise<void> {
  try {
    await auth.resetPasswordForEmail(email, { redirectTo: recoveryRedirectTo(origin) })
  } catch {
    // swallow — the caller always shows the same "sent" state
  }
}

export async function resetSubmit(auth: Auth, password: string): Promise<SubmitOutcome> {
  try {
    const { error } = await auth.updateUser({ password })
    if (error) return { ok: false, message: mapResetError(error.status) }

    // Best-effort global revocation so a previously stolen session cannot outlive
    // the reset. Its failure (returned OR thrown) must NEVER flip the already-
    // successful password change into a failure — hence its own nested try/catch.
    try {
      const { error: signOutError } = await auth.signOut({ scope: 'global' })
      if (signOutError) {
        console.error('[reset-password] global signOut failed', { status: signOutError.status })
      }
    } catch {
      console.error('[reset-password] global signOut threw')
    }
    return { ok: true }
  } catch {
    return { ok: false, message: mapResetError(undefined) }
  }
}
