import { createClient } from '@/lib/supabase/server'

export type ProgressRow = {
  id: number
  ts: string
  routine: string
  session_id: string | null
  step: string
  status: 'running' | 'done' | 'error'
  note: string | null
  cost_usd: number | null
  linear_ticket: string | null
}

export type AuditLogRow = {
  id: string
  parent_audit_log_id: string | null
  ts: string
  agent: string
  status: string
  outcome: string | null
  cost_usd: number | null
  runtime_s: number | null
  session_file: string | null
  linear_ticket: string | null
  fan_in_key: string | null
  nonce: string | null
}

export type AuditLogSummary = {
  rows: AuditLogRow[]
  total_cost: number
  routines_fired: number
  failures: number
}

// F3: truncated flag surfaces in the UI when depth or child count was capped.
export type TraceNode = AuditLogRow & {
  children: TraceNode[]
  truncated?: boolean
}

// F3: Guard against cycles (compromised bridge, buggy parent_audit_log_id) and infinite recursion.
const MAX_TRACE_DEPTH = 8

/**
 * Returns the 50 most recent running claude_progress rows.
 * Used by the NOW RUNNING section.
 */
export async function getRunningProgress(): Promise<ProgressRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claude_progress')
    .select('id, ts, routine, session_id, step, status, note, cost_usd, linear_ticket')
    .eq('status', 'running')
    .order('ts', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[war-room] getRunningProgress error:', error.message)
    return []
  }

  return (data ?? []) as ProgressRow[]
}

/**
 * Returns all audit_log rows for today, plus aggregated stats.
 * Used by the TODAY section.
 */
export async function getTodayAuditLog(): Promise<AuditLogSummary> {
  const supabase = await createClient()

  // Compute midnight UTC for today
  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()

  const { data, error } = await supabase
    .from('audit_log')
    .select(
      'id, parent_audit_log_id, ts, agent, status, outcome, cost_usd, runtime_s, session_file, linear_ticket, fan_in_key, nonce'
    )
    .gte('ts', todayStart)
    .order('ts', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[war-room] getTodayAuditLog error:', error.message)
    return { rows: [], total_cost: 0, routines_fired: 0, failures: 0 }
  }

  const rows = (data ?? []) as AuditLogRow[]

  const total_cost = rows.reduce((acc, r) => acc + (r.cost_usd ?? 0), 0)
  const routines_fired = rows.filter((r) => r.status === 'fired').length
  const failures = rows.filter((r) =>
    ['blocked', 'timeout', 'rule_violation', 'over_budget', 'anomaly'].includes(r.status)
  ).length

  return { rows, total_cost, routines_fired, failures }
}

/**
 * Loads the full audit_log tree rooted at `rootId` by recursively fetching children.
 * Used by the TRACE VIEW section.
 */
export async function getTraceTree(rootId: string): Promise<TraceNode | null> {
  const supabase = await createClient()

  // Fetch the root node
  const { data: rootData, error: rootError } = await supabase
    .from('audit_log')
    .select(
      'id, parent_audit_log_id, ts, agent, status, outcome, cost_usd, runtime_s, session_file, linear_ticket, fan_in_key, nonce'
    )
    .eq('id', rootId)
    .maybeSingle()

  if (rootError || !rootData) {
    console.error('[war-room] getTraceTree root error:', rootError?.message)
    return null
  }

  return buildTraceNode(rootData as AuditLogRow, supabase, new Set<string>(), 0)
}

// F3 + F5: Depth-limited, cycle-safe recursive tree builder.
// - MAX_TRACE_DEPTH (8) prevents stack overflow on cyclic parent_audit_log_id (compromised bridge).
// - visited Set detects genuine cycles (row A → B → A).
// - .limit(50) on children query bounds DB row volume; truncated flag surfaces the cap in UI.
async function buildTraceNode(
  row: AuditLogRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  visited: Set<string> = new Set<string>(),
  depth = 0
): Promise<TraceNode> {
  // Bail if depth exceeded or cycle detected — return leaf node with truncated marker.
  if (depth >= MAX_TRACE_DEPTH || visited.has(row.id)) {
    return { ...row, children: [], truncated: true }
  }

  // Mark this node as visited before recursing to detect cycles.
  visited.add(row.id)

  // F5: LIMIT 50 on children query. If exactly 50 returned, flag as truncated.
  const { data: childrenData, error } = await supabase
    .from('audit_log')
    .select(
      'id, parent_audit_log_id, ts, agent, status, outcome, cost_usd, runtime_s, session_file, linear_ticket, fan_in_key, nonce'
    )
    .eq('parent_audit_log_id', row.id)
    .order('ts', { ascending: true })
    .limit(50)

  if (error || !childrenData || childrenData.length === 0) {
    return { ...row, children: [] }
  }

  const childrenTruncated = childrenData.length === 50

  const children: TraceNode[] = await Promise.all(
    (childrenData as AuditLogRow[]).map((child) =>
      buildTraceNode(child, supabase, visited, depth + 1)
    )
  )

  return { ...row, children, truncated: childrenTruncated || undefined }
}

/**
 * Returns all root-level audit_log rows (no parent) for trace view selection.
 * Shows the last 20 root traces for today.
 */
export async function getRootTraces(): Promise<AuditLogRow[]> {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()

  const { data, error } = await supabase
    .from('audit_log')
    .select(
      'id, parent_audit_log_id, ts, agent, status, outcome, cost_usd, runtime_s, session_file, linear_ticket, fan_in_key, nonce'
    )
    .is('parent_audit_log_id', null)
    .gte('ts', todayStart)
    .order('ts', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[war-room] getRootTraces error:', error.message)
    return []
  }

  return (data ?? []) as AuditLogRow[]
}
