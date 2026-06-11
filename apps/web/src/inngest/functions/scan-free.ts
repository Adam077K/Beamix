/**
 * Beamix — Free Scan Inngest Function
 *
 * Consumes `scan/free.requested` and drives the 4-stage GEO scan pipeline:
 *
 *   Step 0: check-budget     — re-read kill switch; fail-fast if scanning paused
 *   Step 1: mark-running     — queued → running, set started_at
 *   Step 2: research         — Perplexity gathers business context
 *   Step 3: engine-chatgpt   — ChatGPT engine query (separate step for live progress)
 *   Step 4: engine-gemini    — Gemini engine query  (separate step for live progress)
 *   Step 5: engine-perplexity— Perplexity engine query (separate step for live progress)
 *   Step 6: analysis         — Gemini Flash produces FreeScanResults
 *   Step 7: persist-results  — write to free_scans.results, mark complete
 *
 * Each stage is a separate Inngest step for memoisation across retries.
 * On any caught error: the scan row is marked failed and the error is re-thrown
 * so Inngest records the failure and applies retry policy.
 *
 * Progress is written to `scan_progress` (PII-free) at each engine boundary so
 * anonymous browsers can subscribe via Supabase Realtime or poll the fallback
 * endpoint. writeProgress is best-effort — errors there never abort the scan.
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
import { writeProgress } from '../../lib/scan/progress-writer';
import { assembleFreeScanV2 } from '../../lib/scan/assemble-free-scan-v2';
import type { FreeScanResults } from '../../lib/scan/types';
import {
  isScanMeasurementV2Enabled,
  buildV2Input,
  buildV2Deps,
  mapV2ToFreeScanResults,
} from './scan-free-v2-deps';

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
// Progress helpers
// ---------------------------------------------------------------------------

/**
 * Total number of queries each engine runs (one prompt per engine = 1 query).
 * Honest for v1 — future multi-query engines can update this constant.
 */
const QUERIES_PER_ENGINE = 1;

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

    // ── Feature flag: evaluate ONCE at function entry ─────────────────────────
    // isScanMeasurementV2Enabled() reads process.env at call time. Capturing it here
    // (before any await) ensures a consistent branch is taken for the entire execution
    // — including Inngest retries that re-enter this function body. If the env var
    // were read again deeper in the pipeline (e.g. inside a step callback), a flag
    // flip between the original run and a retry could mix v1 memo keys with v2 step
    // logic and cause Inngest to replay the wrong memoised step result.
    const useV2 = isScanMeasurementV2Enabled();

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

      // Write terminal progress so the frontend stops polling/waiting.
      await writeProgress(scan_id, { done: true, status: 'failed' });

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
        // Seed progress row — status running, all engines queued.
        await writeProgress(scan_id, { status: 'running', progress: 0 });
      });

      // ── Step 2: Perplexity research ──────────────────────────────────────
      const businessContext = await step.run('perplexity-research', async () => {
        return researchBusiness(scanInput);
      });

      // ── FLAG BRANCH: v2 measurement path (SCAN_MEASUREMENT_V2=true, OFF in prod) ──
      //
      // When the flag is ON:
      //   - Runs assembleFreeScanV2() in a single Inngest step.
      //   - Maps the result to a backward-compatible FreeScanResults blob.
      //   - Falls through to the SAME persist-results step as the v1 path.
      //
      // When the flag is OFF (default/prod):
      //   - The entire v2 branch is skipped. Steps 3–6 (engine-chatgpt, engine-gemini,
      //     engine-perplexity, gemini-flash-analysis) run byte-identically to the prior
      //     implementation. No v1 behavior is altered.
      //
      // Step design trade-off (one step vs many):
      //   Using a single 'scan-v2-assemble' step keeps the Inngest memoisation boundary
      //   at the whole v2 pipeline. A partial retry will re-run all v2 sub-stages.
      //   Splitting probes into individual steps would mirror the v1 structure and give
      //   finer retry granularity, but would require a larger refactor of assembleFreeScanV2
      //   to expose per-engine step boundaries. The single-step approach is correct for
      //   this wave; per-engine memoisation is a Wave 8 refactor when retry patterns are
      //   better understood.

      if (useV2) {
        const v2Blob: FreeScanResults = await step.run('scan-v2-assemble', async () => {
          await writeProgress(scan_id, {
            status: 'running',
            progress: 0.1,
            currentQuery: 'Running v2 measurement pipeline',
          });

          const supabase = createAdminSupabaseClient();
          const v2Input = buildV2Input(businessContext, scanInput);
          const v2Deps = buildV2Deps(supabase);

          const v2Result = await assembleFreeScanV2(v2Input, v2Deps);

          await writeProgress(scan_id, {
            status: 'running',
            progress: 0.85,
            currentQuery: null,
          });

          return mapV2ToFreeScanResults(v2Result);
        });

        // ── Step 7 (v2): Persist results ────────────────────────────────────
        // Reuses the same persist-results step name so Inngest idempotency still
        // prevents double-writes on retry.
        await step.run('persist-results', async () => {
          const supabase = createAdminSupabaseClient();
          const { error } = await supabase
            .from('free_scans')
            .update({
              status: 'complete',
              results: v2Blob,
              completed_at: new Date().toISOString(),
            })
            .eq('id', scan_id);
          if (error) {
            console.error('[scan-free] Failed to persist v2 scan results', {
              scan_id,
              error: error.message,
            });
            throw new Error(`Failed to persist v2 scan results: ${error.message}`);
          }
          await writeProgress(scan_id, {
            done: true,
            progress: 1,
            status: 'complete',
            currentQuery: null,
          });
        });

        return { scan_id };
      }

      // ── Step 3: ChatGPT engine query ──────────────────────────────────────
      // Each engine is its own step for Inngest memoisation AND live progress.
      // On entry: set engine status='querying'. On completion: 'done'.
      // On error: set 'error' INSIDE the step (memoised on retry), then re-throw.
      //
      // currentQuery uses generic engine-name strings — NO business_name or domain
      // to keep scan_progress PII-free (field is readable by anon browsers).
      const chatgptResult = await step.run('engine-chatgpt', async () => {
        await writeProgress(scan_id, {
          engines: [{ id: 'chatgpt', status: 'querying', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          progress: 0.1,
          currentQuery: 'Querying ChatGPT for AI search visibility',
        });

        try {
          const result = await queryEngine('chatgpt', businessContext, scanInput);
          await writeProgress(scan_id, {
            engines: [{ id: 'chatgpt', status: 'done', queryCount: QUERIES_PER_ENGINE, totalQueries: QUERIES_PER_ENGINE }],
            progress: 0.35,
            currentQuery: null,
          });
          return result;
        } catch (err) {
          await writeProgress(scan_id, {
            engines: [{ id: 'chatgpt', status: 'error', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          });
          throw err;
        }
      });

      // ── Step 4: Gemini engine query ──────────────────────────────────────
      const geminiResult = await step.run('engine-gemini', async () => {
        await writeProgress(scan_id, {
          engines: [{ id: 'gemini', status: 'querying', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          progress: 0.4,
          currentQuery: 'Querying Gemini for AI search visibility',
        });

        try {
          const result = await queryEngine('gemini', businessContext, scanInput);
          await writeProgress(scan_id, {
            engines: [{ id: 'gemini', status: 'done', queryCount: QUERIES_PER_ENGINE, totalQueries: QUERIES_PER_ENGINE }],
            progress: 0.6,
            currentQuery: null,
          });
          return result;
        } catch (err) {
          await writeProgress(scan_id, {
            engines: [{ id: 'gemini', status: 'error', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          });
          throw err;
        }
      });

      // ── Step 5: Perplexity engine query ──────────────────────────────────
      const perplexityResult = await step.run('engine-perplexity', async () => {
        await writeProgress(scan_id, {
          engines: [{ id: 'perplexity', status: 'querying', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          progress: 0.65,
          currentQuery: 'Querying Perplexity for AI search visibility',
        });

        try {
          const result = await queryEngine('perplexity', businessContext, scanInput);
          await writeProgress(scan_id, {
            engines: [{ id: 'perplexity', status: 'done', queryCount: QUERIES_PER_ENGINE, totalQueries: QUERIES_PER_ENGINE }],
            progress: 0.85,
            currentQuery: null,
          });
          return result;
        } catch (err) {
          await writeProgress(scan_id, {
            engines: [{ id: 'perplexity', status: 'error', queryCount: 0, totalQueries: QUERIES_PER_ENGINE }],
          });
          throw err;
        }
      });

      // ── Step 6: Gemini Flash analysis ────────────────────────────────────
      const scanResults: FreeScanResults = await step.run('gemini-flash-analysis', async () => {
        return analyse([chatgptResult, geminiResult, perplexityResult], businessContext, scan_id);
      });

      // ── Step 7: Persist results ──────────────────────────────────────────
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
        // Mark progress complete — triggers the frontend reveal.
        // progress writes to scan_progress only; free_scans.results is above.
        await writeProgress(scan_id, {
          done: true,
          progress: 1,
          status: 'complete',
          currentQuery: null,
        });
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
        // Also mark progress as failed so the frontend stops polling.
        await writeProgress(scan_id, {
          done: true,
          status: 'failed',
        });
      });

      // Re-throw so Inngest records the failure and applies retry policy.
      throw err;
    }
  },
);
