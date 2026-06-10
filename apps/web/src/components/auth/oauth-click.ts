'use client'

import { createClient } from '@/lib/supabase/client'
import { oauthSubmit } from './auth-logic'

/**
 * Shared Google-OAuth click handler for the Login + Signup forms — keeps the
 * client creation, redirect construction, and error handling in one place.
 * On success the SDK navigates the browser away; only the error path calls back.
 */
export async function handleGoogleOAuth(
  next: string,
  handlers: { onStart: () => void; onError: (message: string) => void },
): Promise<void> {
  handlers.onStart()
  const supabase = createClient()
  const outcome = await oauthSubmit(supabase.auth, { origin: window.location.origin, next })
  if (!outcome.ok) handlers.onError(outcome.message)
}
