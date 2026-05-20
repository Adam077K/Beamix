/**
 * Beamix Agent System — Page Locks
 *
 * Prevents Content Optimizer, Freshness Agent, and Authority Blog Strategist from
 * running on the same target URL simultaneously. Backed by the `page_locks` DB table
 * (Worker 1). Lock TTL is 2 hours, auto-expired by a daily Inngest sweep + the
 * `expires_at` check on read.
 *
 * The pipeline runner acquires the lock before the DO step and wraps the entire
 * pipeline in try/finally so `unlockPage()` always fires — even on a thrown error.
 */

import { getAdminClient } from '../db/admin-client';
import type { AgentType } from '../types';

/** Lock TTL in milliseconds — 2 hours, per `12-AGENT-BUILD-SPEC.md`. */
const LOCK_TTL_MS = 2 * 60 * 60 * 1000;

/** Normalize a URL for lock-key comparison — strips trailing slash + lowercases host. */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Attempt to lock a URL for an agent job. Returns `true` if the lock was acquired,
 * `false` if the URL is already locked by a different, non-expired job.
 *
 * @param url        Target URL to lock.
 * @param jobId      `agent_jobs.id` acquiring the lock (`locked_by`).
 * @param businessId Owning business — `page_locks.business_id`.
 */
export async function lockPage(
  url: string,
  jobId: string,
  businessId: string,
  // `agentType` is accepted for call-site symmetry with the spec signature and is
  // recorded implicitly via the `agent_jobs` row referenced by `locked_by`.
  _agentType: AgentType,
): Promise<boolean> {
  const client = getAdminClient();
  const normalized = normalizeUrl(url);
  const now = Date.now();

  // Clear any expired lock on this URL first so a stale row never blocks a new job.
  await client
    .from('page_locks')
    .delete()
    .eq('url', normalized)
    .lt('expires_at', new Date(now).toISOString());

  const expiresAt = new Date(now + LOCK_TTL_MS).toISOString();
  const { error } = await client.from('page_locks').insert({
    url: normalized,
    locked_by: jobId,
    business_id: businessId,
    expires_at: expiresAt,
  });

  if (error) {
    // A unique constraint on `url` means another live job holds the lock.
    if (error.code === '23505') return false;
    throw new Error(`lockPage failed for ${normalized}: ${error.message}`);
  }
  return true;
}

/**
 * Release a page lock. Idempotent — safe to call when no lock exists (the pipeline
 * runner's finally block calls this unconditionally). Scoped by `jobId` so a job can
 * only release its own lock.
 */
export async function unlockPage(url: string, jobId: string): Promise<void> {
  const { error } = await getAdminClient()
    .from('page_locks')
    .delete()
    .eq('url', normalizeUrl(url))
    .eq('locked_by', jobId);

  if (error) {
    throw new Error(`unlockPage failed for ${url}: ${error.message}`);
  }
}

/**
 * Check whether a URL is currently locked, without acquiring it. Used for pre-run
 * checks in the API layer. A lock whose `expires_at` is in the past counts as unlocked.
 */
export async function isPageLocked(url: string): Promise<boolean> {
  const { data, error } = await getAdminClient()
    .from('page_locks')
    .select('expires_at')
    .eq('url', normalizeUrl(url))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new Error(`isPageLocked failed for ${url}: ${error.message}`);
  }
  return data !== null;
}
