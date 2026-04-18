import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isSafeRedirect(path: string): boolean {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const rawRedirect = searchParams.get('redirect') ?? '/dashboard'
  const redirect = isSafeRedirect(rawRedirect) ? rawRedirect : '/dashboard'
  const scanId = searchParams.get('scan_id')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Password-recovery flow — send user to set a new password
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // Regular auth (signup confirmation, OAuth) — route based on onboarding status.
        // The onboarding cookie is checked here via the incoming request cookies.
        // If the cookie is absent, the user has not completed onboarding yet.
        const onboardingComplete =
          request.cookies.get('beamix-onboarding-complete')?.value === '1'

        if (onboardingComplete) {
          return NextResponse.redirect(`${origin}${redirect}`)
        }

        // Route to onboarding, carrying scan_id if the free-scan import flow is active
        const destination = scanId
          ? `/onboarding?scan_id=${encodeURIComponent(scanId)}`
          : '/onboarding'

        return NextResponse.redirect(`${origin}${destination}`)
      }
    } catch (err) {
      console.error('[Auth Callback] exchangeCodeForSession threw:', err)
    }
  }

  // Auth code exchange failed — redirect to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
