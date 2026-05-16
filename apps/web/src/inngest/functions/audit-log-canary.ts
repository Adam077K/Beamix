/**
 * audit-log-canary.ts — Audit-log integrity heartbeat (D5 CC4).
 *
 * Origin: WS6 Deep Review — highest-leverage hardening item (D5, Control Check 4).
 * Q15 carve-out: This is the ONLY Inngest function that fires Telegram P0 alerts
 * regardless of the "no Telegram" rule (Q7). An audit_log failure is a P0 anomaly
 * (RLS misconfig / Supabase down / schema drift) that requires immediate human action.
 * All other observability functions remain silent-kill per Q7.
 *
 * Behaviour every 15 minutes:
 *   Step 1 — Write a canary row to audit_log via service-role client.
 *             row_kind='internal_event', event_kind='canary' (no 'canary' enum value
 *             in row_kind CHECK — only 'routine_dispatch' | 'internal_event').
 *             A fresh uuid nonce is embedded in spec so the read-back is unambiguous.
 *   Step 2 — Read the row back by nonce. Must return exactly 1 row.
 *   Step 3 — Update consecutive-failure counter stored in audit_log
 *             (event_kind='canary_failure_count', spec.count=N).
 *             On success: reset counter to 0, write event_kind='canary_pass'.
 *             On failure: increment counter. If counter ≥ 2: fire Telegram P0.
 *
 * Telegram deferred (Q15+Telegram-defer): if TELEGRAM_BOT_TOKEN is unset,
 * log alert text + write audit_log status='anomaly', event_kind='telegram_p0_pending'.
 * Do NOT fail the Inngest function — the anomaly is still recorded.
 *
 * Env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — consumed by createServiceRoleClient()
 *   TELEGRAM_BOT_TOKEN — Telegram Bot API token (may be unset)
 *   ADAM_TELEGRAM_CHAT_ID — Adam's personal Telegram chat ID (may be unset)
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

const CANARY_AGENT = 'audit-log-canary';
const CONSECUTIVE_FAIL_THRESHOLD = 2;

/** Generate a UUID v4 without relying on the crypto import (available in Node 18+). */
function newUuid(): string {
  return crypto.randomUUID();
}

/**
 * Read the most-recent canary_failure_count row from audit_log.
 * Returns 0 if none exists.
 */
async function readFailureCount(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('spec')
    .eq('agent', CANARY_AGENT)
    .eq('event_kind', 'canary_failure_count')
    .order('ts', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Can't read failure count — treat conservatively as 0 so we don't
    // double-alert if Supabase is only partially degraded.
    console.error('[audit-log-canary] Could not read failure count:', error.message);
    return 0;
  }

  if (!data) return 0;

  const spec = data.spec as Record<string, unknown>;
  return typeof spec['count'] === 'number' ? (spec['count'] as number) : 0;
}

/**
 * Persist the current failure counter to audit_log.
 * Uses status='anomaly' when count > 0 so /war-room page highlights it.
 * Uses status='complete' when count = 0 (reset after a successful pass).
 */
async function writeFailureCount(count: number): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from('audit_log').insert({
    agent: CANARY_AGENT,
    row_kind: 'internal_event',
    event_kind: 'canary_failure_count',
    status: count > 0 ? 'anomaly' : 'complete',
    spec: {
      event: 'canary_failure_count',
      count,
      ts: new Date().toISOString(),
    },
  });
}

/**
 * Fire a Telegram P0 alert via the notify.beamix.tech bridge
 * (direct Bot API post — notify.beamix.tech forwards to Telegram).
 *
 * If TELEGRAM_BOT_TOKEN is absent: log + write audit_log row and return.
 * Never throws — failure to alert must not crash the canary.
 */
async function fireTelegramP0(consecutiveFailures: number): Promise<void> {
  const supabase = createServiceRoleClient();
  const alertText =
    `🚨 P0: Audit-log canary failed ${consecutiveFailures}x consecutive. ` +
    `Service-role write or RLS misconfigured. Check Supabase immediately.`;

  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['ADAM_TELEGRAM_CHAT_ID'];

  if (!token || !chatId) {
    // Telegram deferred per Q15+Telegram-defer carve-out.
    console.error('[audit-log-canary] TELEGRAM DEFERRED — P0 ALERT TEXT:', alertText);
    await supabase.from('audit_log').insert({
      agent: CANARY_AGENT,
      row_kind: 'internal_event',
      event_kind: 'telegram_p0_pending',
      status: 'anomaly',
      spec: {
        event: 'canary_p0_alert_deferred',
        alert_text: alertText,
        consecutive_failures: consecutiveFailures,
        ts: new Date().toISOString(),
      },
      outcome: 'TELEGRAM_BOT_TOKEN or ADAM_TELEGRAM_CHAT_ID not set — alert logged only.',
    });
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: alertText }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error('[audit-log-canary] Telegram send failed:', response.status, body);
      await supabase.from('audit_log').insert({
        agent: CANARY_AGENT,
        row_kind: 'internal_event',
        event_kind: 'telegram_p0_pending',
        status: 'telegram_send_failed',
        spec: {
          event: 'canary_p0_alert_send_failed',
          http_status: response.status,
          alert_text: alertText,
          consecutive_failures: consecutiveFailures,
          ts: new Date().toISOString(),
        },
        outcome: `Telegram API returned ${response.status}. Alert not delivered.`,
      });
    } else {
      console.log('[audit-log-canary] Telegram P0 alert sent successfully.');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[audit-log-canary] Telegram fetch threw:', msg);
    // Do not re-throw — alert failure must not crash the canary function.
  }
}

export const auditLogCanary = inngest.createFunction(
  { id: 'audit-log-canary', retries: 0 }, // no retries — each cycle is independent
  { cron: '*/15 * * * *' }, // every 15 minutes
  async ({ step }) => {
    const nonce = newUuid();
    const ts = new Date().toISOString();

    // ----------------------------------------------------------------
    // Step 1: Write canary row to audit_log via service-role client.
    // row_kind='internal_event' — 'canary' is not a valid row_kind enum.
    // event_kind='canary' labels this as the heartbeat write.
    // status='fired' matches the audit_log status CHECK.
    // nonce embedded in spec (NOT the nonce column — partial UNIQUE index
    // on nonce column only applies to row_kind='routine_dispatch').
    // ----------------------------------------------------------------
    const writeResult = await step.run('write-canary', async () => {
      const supabase = createServiceRoleClient();
      const { error } = await supabase.from('audit_log').insert({
        agent: CANARY_AGENT,
        row_kind: 'internal_event',
        event_kind: 'canary',
        status: 'fired',
        spec: {
          event: 'canary',
          nonce,
          ts,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    });

    // ----------------------------------------------------------------
    // Step 2: Read back the canary row by nonce embedded in spec.
    // Must return exactly 1 row — proves service-role write + read work.
    // ----------------------------------------------------------------
    const readResult = await step.run('read-canary', async () => {
      if (!writeResult.success) {
        // Write already failed — skip read, report failure.
        return { success: false, error: 'write step failed — skipping read', count: 0 };
      }

      const supabase = createServiceRoleClient();

      // Query by agent + event_kind + spec nonce to identify exactly our row.
      // Supabase jsonb filter: spec->>'nonce' = nonce
      const { data, error } = await supabase
        .from('audit_log')
        .select('id, ts')
        .eq('agent', CANARY_AGENT)
        .eq('event_kind', 'canary')
        .eq('status', 'fired')
        .filter('spec->>\'nonce\'', 'eq', nonce)
        .limit(2); // limit 2 so we can detect duplicates too

      if (error) {
        return { success: false, error: error.message, count: 0 };
      }

      const count = (data ?? []).length;
      if (count !== 1) {
        return {
          success: false,
          error: `Expected exactly 1 canary row, got ${count}`,
          count,
        };
      }

      return { success: true, rowId: data![0]!.id, count };
    });

    const cycleSuccess = writeResult.success && readResult.success;

    // ----------------------------------------------------------------
    // Step 3: Update consecutive-failure counter + fire Telegram if ≥ 2.
    // ----------------------------------------------------------------
    const alertResult = await step.run('update-failure-counter', async () => {
      const supabase = createServiceRoleClient();

      if (cycleSuccess) {
        // Happy path: reset failure counter, write pass row.
        await writeFailureCount(0);
        await supabase.from('audit_log').insert({
          agent: CANARY_AGENT,
          row_kind: 'internal_event',
          event_kind: 'canary_pass',
          status: 'complete',
          spec: {
            event: 'canary_pass',
            nonce,
            ts,
          },
          outcome: `Canary write + read succeeded. Nonce ${nonce} verified.`,
        });
        return { alerted: false, consecutiveFailures: 0 };
      }

      // Failure path: increment counter.
      const previousCount = await readFailureCount();
      const newCount = previousCount + 1;
      await writeFailureCount(newCount);

      // Write failure audit row.
      const failureReason = !writeResult.success
        ? `write failed: ${writeResult.error}`
        : `read failed: ${readResult.error}`;

      await supabase.from('audit_log').insert({
        agent: CANARY_AGENT,
        row_kind: 'internal_event',
        event_kind: 'canary_fail',
        status: 'anomaly',
        spec: {
          event: 'canary_fail',
          nonce,
          ts,
          write_success: writeResult.success,
          read_success: readResult.success,
          write_error: writeResult.error ?? null,
          read_error: readResult.error ?? null,
          consecutive_failures: newCount,
        },
        outcome: failureReason,
      });

      if (newCount >= CONSECUTIVE_FAIL_THRESHOLD) {
        await fireTelegramP0(newCount);
        return { alerted: true, consecutiveFailures: newCount };
      }

      return { alerted: false, consecutiveFailures: newCount };
    });

    return {
      cycle: ts,
      nonce,
      write: writeResult.success,
      read: readResult.success,
      cyclePass: cycleSuccess,
      consecutiveFailures: alertResult.consecutiveFailures,
      telegramAlertFired: alertResult.alerted,
    };
  },
);
