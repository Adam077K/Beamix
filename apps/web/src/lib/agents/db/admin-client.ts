import 'server-only';

/**
 * Beamix Agent System — Service-Role Supabase Client
 *
 * The agent pipeline runs server-side (Inngest functions) and needs the service-role
 * key to write `agent_jobs`, call credit RPCs, and manage `page_locks` / `topic_ledger`
 * / `daily_cap_usage`. This file is `server-only` — the H4 import boundary forbids any
 * client/public bundle from importing it.
 *
 * Typed against `apps/web/src/lib/db/database.types.ts` (the Worker 1 DB contract).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';

let cached: SupabaseClient<Database> | null = null;

/**
 * Return a memoised service-role Supabase client. The agent pipeline always runs with
 * full DB access — RLS is bypassed deliberately for system-owned writes.
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  cached = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
