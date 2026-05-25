import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Verify auth server-side — getUser() revalidates the JWT with Supabase Auth Server,
  // unlike getSession() which only reads the cookie without server verification.
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Guard (protected) routes — redirect to /login when no authenticated user.
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/approvals') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/inbox') ||
    pathname.startsWith('/scans') ||
    pathname.startsWith('/automation') ||
    pathname.startsWith('/archive') ||
    pathname.startsWith('/competitors') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding')

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /api/health     (public health check)
     * - /_next/*        (Next.js internals)
     * - /login          (auth)
     * - /signup         (auth)
     * - /scan           (public one-time scan)
     * - Static assets: .ico, .svg, .png, .jpg, .jpeg, .webp, .woff, .woff2
     */
    '/((?!api/health|_next/static|_next/image|login|signup|scan|.*\\.(?:ico|svg|png|jpg|jpeg|webp|woff2?)$).*)',
  ],
}
