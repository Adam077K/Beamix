import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/scan', '/pricing', '/blog']
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password']
const PROTECTED_ROUTES = ['/dashboard', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  // Public API routes (no auth required)
  if (
    pathname.startsWith('/api/scan') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/stripe/webhooks')
  ) {
    return supabaseResponse
  }

  // Public routes pass through
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return supabaseResponse
  }

  // Auth routes: redirect to dashboard if logged in
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Protected routes: redirect to login if not logged in
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Protected API routes
  if (
    pathname.startsWith('/api/agents') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/businesses') ||
    pathname.startsWith('/api/queries') ||
    pathname.startsWith('/api/content') ||
    pathname.startsWith('/api/recommendations') ||
    pathname.startsWith('/api/credits') ||
    pathname.startsWith('/api/onboarding') ||
    pathname.startsWith('/api/stripe')
  ) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
