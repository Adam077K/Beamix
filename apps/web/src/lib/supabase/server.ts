import 'server-only'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/db/database.types'

/**
 * Supabase client for use in Server Components and Route Handlers.
 *
 * Uses the anon key + cookie-based session (mirrors middleware).
 * For service-role operations (agent pipeline, admin tasks) use
 * `src/lib/agents/db/admin-client.ts` instead.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
            )
          } catch {
            // In RSC context cookie writes are silently ignored — the middleware
            // is responsible for session refresh. This catch prevents the RSC
            // from throwing when a session cookie update is attempted.
          }
        },
      },
    },
  )
}
