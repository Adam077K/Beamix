import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/signup']

// Routes that require authentication — unauthenticated requests are redirected to /login
const PROTECTED_ROUTES = ['/dashboard', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse: NextResponse
  let user: Awaited<ReturnType<typeof updateSession>>['user']

  try {
    ;({ supabaseResponse, user } = await updateSession(request))
  } catch (err) {
    console.warn(
      '[middleware] updateSession failed (likely missing Supabase env vars). ',
      err
    )

    // For protected paths, fail closed — do NOT pass through unauthenticated
    const isProtected =
      pathname.startsWith('/dashboard') ||
      (pathname.startsWith('/api') &&
        !pathname.startsWith('/api/scan/start') &&
        !pathname.startsWith('/api/paddle/webhooks') &&
        !pathname.startsWith('/api/inngest'))

    if (isProtected) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = ''
      loginUrl.searchParams.set('error', 'service_unavailable')
      return NextResponse.redirect(loginUrl)
    }

    // Public paths can pass through
    return NextResponse.next({ request })
  }

  // Redirect authenticated users away from auth pages (login, signup)
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  // Gate protected routes — unauthenticated → /login?next={path}
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Onboarding check: authenticated users on /dashboard/* without the completion
  // cookie are redirected to /onboarding until they finish the flow.
  // TODO: Cookie is set by /api/onboarding/complete on completion.
  if (
    user &&
    pathname.startsWith('/dashboard') &&
    request.cookies.get('beamix-onboarding-complete')?.value !== '1'
  ) {
    const onboardingUrl = request.nextUrl.clone()
    onboardingUrl.pathname = '/onboarding'
    onboardingUrl.search = ''
    return NextResponse.redirect(onboardingUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (svg, png, jpg, jpeg, gif, webp, ico)
     * - /api/inngest  (Inngest webhook — must be excluded from session refresh)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/inngest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
