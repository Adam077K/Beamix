import { type NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/auth/next-param'

/**
 * Auth callback — handles the PKCE code exchange for:
 * - Email/password magic-link confirmation
 * - OAuth provider redirects (Google, etc.)
 *
 * After a successful exchange the user is redirected to the `next` param
 * (sanitized to same-origin paths only). On error redirects to /login.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const next = sanitizeNext(searchParams.get('next'), '/dashboard')

  // OAuth providers redirect back with ?error=... when the user denies access or
  // the provider fails. Surface it on the login screen instead of silently
  // proceeding to a destination the user never authenticated for.
  if (oauthError) {
    console.error('[auth/callback] OAuth provider error', {
      error: oauthError,
      description: searchParams.get('error_description'),
    })
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error', {
          message: error.message,
          status: error.status,
        })
        return NextResponse.redirect(`${origin}/login?error=auth`)
      }
    } catch (err) {
      console.error('[auth/callback] unexpected error during code exchange', { err })
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }
  }

  // No code present means there is nothing to exchange (e.g. a stale or
  // already-consumed link). This is benign — `next` is sanitized to a same-origin
  // path — so send the user on to their destination.
  return NextResponse.redirect(`${origin}${next}`)
}
