import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client used by Inngest functions and server-side
 * background jobs that must bypass RLS (e.g. suggestion writes, scan
 * writes, cross-user aggregations).
 *
 * NEVER import this from client components or edge routes tied to a
 * user session — it has full DB access.
 */
export function createServiceClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required for service client',
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
