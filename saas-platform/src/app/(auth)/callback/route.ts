import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isSafeRedirect(path: string): boolean {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawRedirect = searchParams.get('redirect') ?? '/dashboard'
  const redirect = isSafeRedirect(rawRedirect) ? rawRedirect : '/dashboard'
  const scanId = searchParams.get('scan_id')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        const destination = scanId
          ? `/onboarding?scan_id=${encodeURIComponent(scanId)}`
          : redirect
        return NextResponse.redirect(`${origin}${destination}`)
      }
    } catch (err) {
      console.error('[Auth Callback] exchangeCodeForSession threw:', err)
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
