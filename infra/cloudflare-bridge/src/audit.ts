/**
 * Audit log writer — writes rows to Supabase `audit_log` via REST API.
 *
 * Per ORCHESTRATION.md §2D (R3.6):
 *   The bridge is the FIRST writer (status: fired).
 *   Receiving agents write status: accepted.
 *   Inngest watcher writes the terminal status.
 *
 * Valid audit_log.status enum (15 values, post-Q1):
 *   fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation
 *   | anthropic_error | linear_api_error | mem0_error | rate_limited | lock_lost | webhook_storm
 *   | telegram_send_failed
 *
 * Q3-LOCKED schema constraints (post-2026-05-08 migration):
 *   - row_kind NOT NULL CHECK ('routine_dispatch' | 'internal_event')
 *   - spec    NOT NULL (jsonb)
 *   - dispatch rows MUST have nonce (CHECK audit_log_dispatch_nonce_required)
 *   - partial UNIQUE on nonce only for routine_dispatch rows
 *
 * Auto-detection rules in this writer:
 *   1. row_kind defaults to 'internal_event' unless caller passes 'routine_dispatch'
 *      OR the entry carries both nonce AND spec (which then implies dispatch).
 *   2. If row_kind is 'routine_dispatch', nonce MUST be present (extracted from
 *      entry.spec.nonce if not explicitly supplied). Throws if neither found.
 *   3. spec is NOT NULL — always provided. For internal_event rows without an
 *      explicit spec, we synthesize a minimal one: { event, agent, ts, ...event_kind? }.
 */

export type AuditStatus =
  | "fired"
  | "accepted"
  | "complete"
  | "blocked"
  | "timeout"
  | "over_budget"
  | "anomaly"
  | "rule_violation"
  | "anthropic_error"
  | "linear_api_error"
  | "mem0_error"
  | "rate_limited"
  | "lock_lost"
  | "webhook_storm"
  | "telegram_send_failed";

export type AuditRowKind = "routine_dispatch" | "internal_event";

export interface AuditLogEntry {
  /** The terminal/current status of this audit row. */
  status: AuditStatus;
  /** Which agent or routine this row is attributed to (e.g. "ceo-entry-point", "cloudflare-bridge"). */
  agent: string;
  /** Q3-LOCKED discriminator — auto-detected if not set. */
  row_kind?: AuditRowKind;
  /** Optional event-kind label for internal_event rows (e.g. 'fan_in_complete', 'auto_unblock_max_attempts'). */
  event_kind?: string | null;
  /** Linear ticket identifier (e.g. "BMX-101"). */
  linear_ticket?: string | null;
  /** Fan-in barrier key UUID — links parent + sub-ticket rows. */
  fan_in_key?: string | null;
  /** Nonce UUID from the trust-mode spec (replay prevention). Required for routine_dispatch rows. */
  nonce?: string | null;
  /** Accrued API cost in USD for this session/run. */
  cost_usd?: number | null;
  /** Elapsed runtime in seconds. */
  runtime_s?: number | null;
  /** Path to the session file written by the agent, if any. */
  session_file?: string | null;
  /** UUID of the parent audit_log row — enables trace-tree view in /war-room. */
  parent_audit_log_id?: string | null;
  /** Full trust-mode spec JSON payload. NOT NULL in DB — auto-synthesized for internal events. */
  spec?: Record<string, unknown> | null;
}

/**
 * Writes a row to the `audit_log` Supabase table via the REST API.
 *
 * Uses service-role key to bypass RLS (the table policy is deny_all;
 * service role bypasses it per ORCHESTRATION.md §2D R3.11).
 *
 * Never logs the service role key or any secret value (per WS2 R3.12).
 */
export async function writeAuditLog(
  entry: AuditLogEntry,
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): Promise<{ id: string } | null> {
  const url = `${supabaseUrl}/rest/v1/audit_log`;

  // ── Resolve row_kind (Q3-LOCKED) ─────────────────────────────────
  // Auto-detect if not explicitly set: presence of nonce AND spec ⇒ routine_dispatch.
  // Otherwise default to internal_event (system bookkeeping rows from bridge/Inngest).
  const specNonce = (entry.spec as Record<string, unknown> | undefined)?.["nonce"];
  const effectiveNonce =
    entry.nonce ?? (typeof specNonce === "string" ? specNonce : null);

  const rowKind: AuditRowKind =
    entry.row_kind ??
    (effectiveNonce && entry.spec ? "routine_dispatch" : "internal_event");

  // ── Always provide spec (NOT NULL) — synthesize stub for internal events ───
  const finalSpec: Record<string, unknown> =
    entry.spec ?? {
      event: entry.status,
      agent: entry.agent,
      ts: new Date().toISOString(),
      ...(entry.event_kind ? { event_kind: entry.event_kind } : {}),
    };

  // ── Build payload ────────────────────────────────────────────────
  const payload: Record<string, unknown> = {
    status: entry.status,
    agent: entry.agent,
    row_kind: rowKind,
    spec: finalSpec,
  };

  // Routine dispatch rows MUST have nonce (CHECK audit_log_dispatch_nonce_required)
  if (rowKind === "routine_dispatch") {
    if (!effectiveNonce) {
      console.error(
        `[audit] dispatch row missing nonce — refusing to write; status=${entry.status} agent=${entry.agent}`
      );
      return null;
    }
    payload.nonce = effectiveNonce;
  } else if (effectiveNonce) {
    // Allow nonce on internal rows too (informational); just don't fail without it.
    payload.nonce = effectiveNonce;
  }

  if (entry.event_kind)         payload.event_kind          = entry.event_kind;
  if (entry.linear_ticket)      payload.linear_ticket       = entry.linear_ticket;
  if (entry.fan_in_key)         payload.fan_in_key          = entry.fan_in_key;
  if (entry.cost_usd != null)   payload.cost_usd            = entry.cost_usd;
  if (entry.runtime_s != null)  payload.runtime_s           = entry.runtime_s;
  if (entry.session_file)       payload.session_file        = entry.session_file;
  if (entry.parent_audit_log_id) payload.parent_audit_log_id = entry.parent_audit_log_id;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceRoleKey,
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error(
        `[audit] write failed: HTTP ${response.status} ${response.statusText} for status=${entry.status} agent=${entry.agent} row_kind=${rowKind} body=${bodyText.slice(0, 200)}`
      );
      return null;
    }

    const rows = await response.json() as Array<{ id: string }>;
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[audit] write exception for status=${entry.status} agent=${entry.agent}:`, err);
    return null;
  }
}
