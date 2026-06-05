/**
 * Beamix — Free Scan Inngest Function
 *
 * Consumes `scan/free.requested` and drives the 4-stage GEO scan pipeline:
 *
 *   Step 0: check-budget   — re-read kill switch; fail-fast if scanning paused
 *   Step 1: mark-running   — queued → running, set started_at
 *   Step 2: research       — Perplexity gathers business context
 *   Step 3: engine-queries — ChatGPT + Gemini + Perplexity in parallel (single step)
 *   Step 4: analysis       — Gemini Flash produces FreeScanResults
 *   Step 5: persist-results — write to free_scans.results, mark complete
 *
 * Each stage is a separate Inngest step for memoisation across retries.
 * On any caught error: the scan row is marked failed and the error is re-thrown
 * so Inngest records the failure and applies retry policy.
 *
 * Concurrency: keyed on scan_id — one in-flight run per scan.
 * Retries: 2 (covers transient LLM/network failures).
 * NonRetriableError: thrown for config errors and budget blocks — burns no retries.
 */

import { NonRetriableError } from 'inngest';
import { createClient } from '@supabase/supabase-js';
import { inngest } from '../client';
import { researchBusiness } from '../../lib/scan/perplexity-research';
import { queryEngine } from '../../lib/scan/engine-query';
import { analyse } from '../../lib/scan/analysis';
import type { FreeScanResults } from '../../lib/scan/types';

// ---------------------------------------------------------------------------
// Admin Supabase client — pattern mirrors agent-execute.ts
// ---------------------------------------------------------------------------

function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ---------------------------------------------------------------------------
// Secret scrubber for error messages persisted to the DB
// ---------------------------------------------------------------------------

/** Patterns that could expose API keys or bearer tokens. */
const SECRET_PATTERN = /(bearer\s+\S+|sk-\S+|or-\S+)/gi;

/**
 * Sanitize an error message before writing to free_scans.error_message.
 * Maps upstream HTTP errors to category codes and strips secret-like tokens.
 */
function sanitizeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  // Map common upstream error patterns to opaque category codes
  const categorized = raw
    .replace(/OpenRouter\s+\d+xx\s+error[^)]*\)/gi, 'upstream_api_error')
    .replace(/OpenRouter\s+error\s+\d+[^:]*:[^)]*\)/gi, 'upstream_api_error')
    .replace(/OpenRouter\s+request\s+failed[^:]*:[^)]*\)/gi, 'upstream_network_error')
    .replace(/network\s+error/gi, 'upstream_network_error');
  // Strip any residual secret-like tokens
  const scrubbed = categorized.replace(SECRET_PATTERN, '[redacted]');
  return scrubbed.slice(0, 500);
}

// ---------------------------------------------------------------------------
// Kill-switch check (shared by route + Inngest function)
// ---------------------------------------------------------------------------

/**
 * Returns true if scanning is currently paused via the system_kill_switch table.
 * Row id=1 is the single control row. Absence of the row = not paused.
 */
async function isScanningPaused(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('system_kill_switch')
    .select('paused_until')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('[scan-free] Failed to read system_kill_switch', { error: error.message });
    // Fail open — don't block scans on a read error
    return false;
  }
  if (!data) return false;
  if (!data.paused_until) return false;

  // paused_until = future timestamp means scanning is paused
  return new Date(data.paused_until) > new Date();
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

/**
 * `scan-free` — runs one free GEO scan per `scan/free.requested` event.
 *
 * Returns { scan_id } on success.
 * On failure: marks the free_scan row as failed, then re-throws.
 */
export const scanFree = inngest.createFunction(
  {
    id: 'scan-free',
    retries: 2,
    // One in-flight scan per scan_id — idempotency guard.
    concurrency: { key: 'event.data.scan_id', limit: 1 },
  },
  { event: 'scan/free.requested' },
  async ({ event, step }) => {
    const { scan_id, business_name, website_url, domain } = event.data;
    const scanInput = { scan_id, business_name, website_url, domain };

    // ── Step 0: Belt-and-suspenders budget / kill-switch check ────────────
    // Re-reads the kill switch inside Inngest to guard against replayed or
    // manually triggered events that arrive after the route-level check.
    const paused = await step.run('check-budget', async () => {
      const supabase = createAdminSupabaseClient();
      return isScanningPaused(supabase);
    });

    if (paused) {
      // Mark the scan failed immediately — this is a deterministic block,
      // not a transient failure, so use NonRetriableError to burn no retries.
      const supabase = createAdminSupabaseClient();
      await supabase
        .from('free_scans')
        .update({
          status: 'failed',
          error_message: 'scanning_paused',
          completed_at: new Date().toISOString(),
        })
        .eq('id', scan_id);

      throw new NonRetriableError('scanning_paused');
    }

    try {
      // ── Step 1: Mark scan running ──────────────────────────────────────
      // Inside try so mark-failed covers a DB error here.
      await step.run('mark-running', async () => {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase
          .from('free_scans')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', scan_id);
        if (error) {
          console.error('[scan-free] Failed to mark scan running', {
            scan_id,
            error: error.message,
          });
          throw new Error(`Failed to mark scan running: ${error.message}`);
        }
      });

      // ── Step 2: Perplexity research ──────────────────────────────────────
      const businessContext = await step.run('perplexity-research', async () => {
        return researchBusiness(scanInput);
      });

      // ── Step 3: Three engine queries — single step for replay safety ─────
      // All three engines run in parallel inside ONE step.run call.
      // This is the documented safe pattern: Promise.all inside a single step
      // gives concurrent execution while keeping the memoisation boundary clean.
      const [chatgptResult, geminiResult, perplexityResult] = await step.run(
        'engine-queries',
        async () => {
          return Promise.all([
            queryEngine('chatgpt', businessContext, scanInput),
            queryEngine('gemini', businessContext, scanInput),
            queryEngine('perplexity', businessContext, scanInput),
          ]);
        },
      );

      // ── Step 4: Gemini Flash analysis ────────────────────────────────────
      const scanResults: FreeScanResults = await step.run('gemini-flash-analysis', async () => {
        return analyse([chatgptResult, geminiResult, perplexityResult], businessContext, scan_id);
      });

      // ── Step 5: Persist results ──────────────────────────────────────────
      await step.run('persist-results', async () => {
        const supabase = createAdminSupabaseClient();
        const { error } = await supabase
          .from('free_scans')
          .update({
            status: 'complete',
            results: scanResults,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scan_id);
        if (error) {
          console.error('[scan-free] Failed to persist scan results', {
            scan_id,
            error: error.message,
          });
          throw new Error(`Failed to persist scan results: ${error.message}`);
        }
      });

      return { scan_id };
    } catch (err) {
      // ── Error path: mark scan failed ──────────────────────────────────────
      // Use step.run so the mark-failed write is memoised on Inngest retry —
      // if the retry also fails, we don't double-write.
      const safeErrorMessage = sanitizeErrorMessage(err);

      await step.run('mark-failed', async () => {
        const supabase = createAdminSupabaseClient();
        const { error: updateError } = await supabase
          .from('free_scans')
          .update({
            status: 'failed',
            error_message: safeErrorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scan_id);
        if (updateError) {
          console.error('[scan-free] Failed to mark scan as failed', {
            scan_id,
            update_error: updateError.message,
            original_error: safeErrorMessage,
          });
        }
      });

      // Re-throw so Inngest records the failure and applies retry policy.
      throw err;
    }
  },
);
