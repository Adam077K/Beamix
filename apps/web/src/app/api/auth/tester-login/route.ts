/**
 * POST /api/auth/tester-login
 *
 * Bypasses normal signup for testers. Creates the shared tester account if it
 * doesn't exist, signs in, and sets auth cookies so the browser session is
 * established. Returns { ok: true, redirect: "/home" } on success.
 *
 * Kill switch: set DISABLE_TESTER_LOGIN=true in env to return 403.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

export async function POST() {
  // ── Kill switch ──────────────────────────────────────────────────────────
  if (process.env['DISABLE_TESTER_LOGIN'] === 'true') {
    return NextResponse.json(
      { error: { code: 'TESTER_LOGIN_DISABLED', message: 'Tester login is disabled.' } },
      { status: 403 },
    )
  }

  const testerEmail = process.env['TESTER_EMAIL'] ?? 'tester@beamix.tech'
  const testerPassword = process.env['TESTER_PASSWORD'] ?? 'Tester-Beamix-2026!'

  try {
    // ── Step 1: Try to sign in with tester credentials ───────────────────
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // Called from Server Component context — cookies are set by middleware
            }
          },
        },
      },
    )

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testerEmail,
      password: testerPassword,
    })

    // ── Step 2: If user doesn't exist yet, bootstrap via service-role ────
    if (signInError) {
      const isNotFound =
        signInError.message.toLowerCase().includes('invalid login credentials') ||
        signInError.message.toLowerCase().includes('user not found') ||
        signInError.message.toLowerCase().includes('email not confirmed')

      if (!isNotFound) {
        console.error('[tester-login] sign-in error:', signInError.message)
        return NextResponse.json(
          { error: { code: 'AUTH_ERROR', message: 'Tester sign-in failed.' } },
          { status: 500 },
        )
      }

      // Create the tester user via admin API (bypasses email confirmation)
      const adminClient = createServiceClient()
      const { error: createError } = await adminClient.auth.admin.createUser({
        email: testerEmail,
        password: testerPassword,
        email_confirm: true,
      })

      if (createError) {
        // User may already exist but password is wrong — not recoverable here
        console.error('[tester-login] createUser error:', createError.message)
        return NextResponse.json(
          { error: { code: 'BOOTSTRAP_ERROR', message: 'Failed to create tester account.' } },
          { status: 500 },
        )
      }

      // Re-attempt sign in after creation
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: testerEmail,
        password: testerPassword,
      })

      if (retryError) {
        console.error('[tester-login] sign-in retry error:', retryError.message)
        return NextResponse.json(
          { error: { code: 'AUTH_RETRY_ERROR', message: 'Tester sign-in failed after bootstrap.' } },
          { status: 500 },
        )
      }
    } else if (!signInData.session) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'Sign-in succeeded but no session was returned.' } },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, redirect: '/home' })
  } catch (err) {
    console.error('[tester-login] unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
