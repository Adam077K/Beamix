/**
 * Audit log writer — writes rows to Supabase `audit_log` via REST API.
 *
 * Per ORCHESTRATION.md §2D (R3.6):
 *   The bridge is the FIRST writer (status: fired).
 *   Receiving agents write status: accepted.
 *   Inngest watcher writes the terminal status.
 *
 * Valid audit_log.status enum values (per ORCHESTRATION.md §2G + Errata 1):
 *   fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation
 *   | anthropic_error | linear_api_error | mem0_error | rate_limited | lock_lost | webhook_storm
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
  | "webhook_storm";

export interface AuditLogEntry {
  /** The terminal/current status of this audit row. */
  status: AuditStatus;
  /** Which agent or routine this row is attributed to (e.g. "ceo-entry-point", "cloudflare-bridge"). */
  agent: string;
  /** Linear ticket identifier (e.g. "BMX-101"). */
  linear_ticket?: string | null;
  /** Fan-in barrier key UUID — links parent + sub-ticket rows. */
  fan_in_key?: string | null;
  /** Nonce UUID from the trust-mode spec (replay prevention). */
  nonce?: string | null;
  /** Accrued API cost in USD for this session/run. */
  cost_usd?: number | null;
  /** Elapsed runtime in seconds. */
  runtime_s?: number | null;
  /** Path to the session file written by the agent, if any. */
  session_file?: string | null;
  /** UUID of the parent audit_log row — enables trace-tree view in /war-room. */
  parent_audit_log_id?: string | null;
  /** Full trust-mode spec JSON payload. */
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

  const payload: Record<string, unknown> = {
    status: entry.status,
    agent: entry.agent,
  };

  // Only include optional fields if they have a value
  if (entry.linear_ticket) payload.linear_ticket = entry.linear_ticket;
  if (entry.fan_in_key)    payload.fan_in_key    = entry.fan_in_key;
  if (entry.nonce)         payload.nonce         = entry.nonce;
  if (entry.cost_usd != null) payload.cost_usd   = entry.cost_usd;
  if (entry.runtime_s != null) payload.runtime_s = entry.runtime_s;
  if (entry.session_file)  payload.session_file  = entry.session_file;
  if (entry.parent_audit_log_id) payload.parent_audit_log_id = entry.parent_audit_log_id;
  if (entry.spec)          payload.spec          = entry.spec;

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
      // Log non-sensitive error context only — never log the key itself
      console.error(
        `[audit] write failed: HTTP ${response.status} ${response.statusText} for status=${entry.status} agent=${entry.agent}`
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
