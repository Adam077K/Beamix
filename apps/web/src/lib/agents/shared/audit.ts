/**
 * Audit log helper — thin, dependency-free shim that lets agents write
 * `audit_log` rows without each agent importing Supabase directly.
 *
 * Errors are non-fatal: an audit_log write failure must NEVER block a
 * customer-facing action. The error is logged and swallowed.
 */

export interface AuditEntry {
  actor_type: 'agent' | 'system' | 'user' | 'anonymous';
  event_type: string;
  payload?: Record<string, unknown>;
  target_id?: string | null;
  target_table?: string | null;
  actor_id?: string | null;
}

/**
 * Minimal Supabase-shaped client interface — we only need `.from(...).insert(...)`.
 * Lets tests pass a stub without dragging in the full Supabase types.
 */
export interface AuditClient {
  from: (table: string) => {
    insert: (rows: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
}

/**
 * Best-effort insert into `audit_log`. Always resolves — never throws.
 */
export async function logAudit(client: AuditClient, entry: AuditEntry): Promise<void> {
  try {
    const { error } = await client.from('audit_log').insert({
      actor_type: entry.actor_type,
      event_type: entry.event_type,
      payload: entry.payload ?? {},
      target_id: entry.target_id ?? null,
      target_table: entry.target_table ?? null,
      actor_id: entry.actor_id ?? null,
    });
    if (error) {
      console.error('[audit] insert failed', { event_type: entry.event_type, error: error.message });
    }
  } catch (err) {
    console.error('[audit] insert threw', {
      event_type: entry.event_type,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
