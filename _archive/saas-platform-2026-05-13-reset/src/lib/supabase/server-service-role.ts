/**
 * server-service-role.ts — Named alias for the service-role Supabase client.
 *
 * Rename from createServiceClient → createServiceRoleClient for clarity.
 * The name makes the bypass intent explicit:
 *   "Service role required — bypasses RLS for internal observability writes."
 *
 * Import this instead of `createServiceClient` from './service' in all
 * Inngest functions and server-side background jobs.
 */
export { createServiceClient as createServiceRoleClient } from './service';
