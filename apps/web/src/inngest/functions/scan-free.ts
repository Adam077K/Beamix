/**
 * Beamix — Free Scan Inngest Function
 *
 * Consumes `scan/free.requested` and drives the 4-stage GEO scan pipeline:
 *
 *   Stage 1: Perplexity research — gather structured business context
 *   Stage 2: Three engine queries (ChatGPT + Gemini + Perplexity) — in parallel
 *   Stage 3: Gemini Flash analysis — produce FreeScanResults
 *   Stage 4: Persist results — write to free_scans.results, mark complete
 *
 * Each stage is a separate Inngest step for memoisation across retries.
 * On any caught error: the scan row is marked failed and the error is re-thrown
 * so Inngest records the failure and applies retry policy.
 *
 * Concurrency: keyed on scan_id — one in-flight run per scan.
 * Retries: 2 (covers transient LLM/network failures).
 */

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

    // ── Step 0: Mark scan running ──────────────────────────────────────────
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

    try {
      // ── Step 1: Perplexity research ──────────────────────────────────────
      const businessContext = await step.run('perplexity-research', async () => {
        return researchBusiness(scanInput);
      });

      // ── Step 2: Three engine queries in parallel ─────────────────────────
      // Each engine is a separate step so Inngest can memoise them independently.
      // Promise.all runs all three concurrently within this step set.
      const [chatgptResult, geminiResult, perplexityResult] = await Promise.all([
        step.run('engine-chatgpt', () => queryEngine('chatgpt', businessContext, scanInput)),
        step.run('engine-gemini', () => queryEngine('gemini', businessContext, scanInput)),
        step.run('engine-perplexity', () => queryEngine('perplexity', businessContext, scanInput)),
      ]);

      // ── Step 3: Gemini Flash analysis ────────────────────────────────────
      const scanResults: FreeScanResults = await step.run('gemini-flash-analysis', async () => {
        return analyse([chatgptResult, geminiResult, perplexityResult], businessContext, scan_id);
      });

      // ── Step 4: Persist results ──────────────────────────────────────────
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
      const errorMessage =
        err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500);

      await step.run('mark-failed', async () => {
        const supabase = createAdminSupabaseClient();
        const { error: updateError } = await supabase
          .from('free_scans')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scan_id);
        if (updateError) {
          // Log but don't throw — we want to re-throw the original error below.
          console.error('[scan-free] Failed to mark scan as failed', {
            scan_id,
            update_error: updateError.message,
            original_error: errorMessage,
          });
        }
      });

      // Re-throw so Inngest records the failure and applies retry policy.
      throw err;
    }
  },
);
