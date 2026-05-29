/**
 * Beamix — Digest Builder (Inngest cron)
 *
 * Cron:  Sunday 16:00 UTC  — pilot only.
 *        Customer-local-time scheduling is Phase 2 (out of scope here).
 * Id:    digest-builder
 *
 * Steps:
 *   1. fetch-active-customers   — pull businesses from DB (mock fallback if empty)
 *   2. process-customer-{id}    — per business: assemble DigestInput, call
 *                                  runDigestWriter, INSERT weekly_digests row
 *
 * OUT OF SCOPE (do not add):
 *   - Email send (Resend)
 *   - /approval/:id route
 *   - Real signed-URL generation (placeholder strings only)
 *   - Real scan/visibility computation (mock fixture for pilot)
 *
 * Idempotent: UNIQUE(customer_id, week_of) on weekly_digests absorbs duplicate
 * runs for the same business + week (returns `skipped` status, no error).
 */

import { randomUUID } from 'crypto'

import { inngest } from '../client'
import { getAdminClient } from '../../lib/agents/db/admin-client'
import { runDigestWriter } from '../../lib/agents/digest-writer/index'
import { getMockDigestInput } from '../../lib/digest/mock-input'
import type { DigestInput } from '../../lib/digest/mock-input'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CustomerRecord = {
  businessId: string
  businessName: string
  userId: string
}

type ProcessResult =
  | { status: 'inserted'; digestId: string }
  | { status: 'skipped' }
  | { status: 'error'; error: string }

// ---------------------------------------------------------------------------
// Cron function
// ---------------------------------------------------------------------------

/**
 * `digest-builder` — runs every Sunday at 16:00 UTC (pilot schedule).
 *
 * Fetches all active businesses, assembles a DigestInput per business,
 * invokes the digest-writer agent, and persists the result as a
 * `weekly_digests` row with `status='draft'`.
 *
 * Email dispatch (Resend) is NOT triggered here — that is Wave 2+.
 */
export const digestBuilder = inngest.createFunction(
  {
    id: 'digest-builder',
    retries: 2,
    // One run at a time — prevents double-inserts if a prior Sunday run is still processing.
    concurrency: { limit: 1 },
  },
  { cron: '0 16 * * 0' }, // Sunday 16:00 UTC
  async ({ step }) => {
    // ──────────────────────────────────────────────────────────────────────
    // Step 1 — Fetch active customers
    // ──────────────────────────────────────────────────────────────────────
    const customers = await step.run(
      'fetch-active-customers',
      async (): Promise<CustomerRecord[]> => {
        const db = getAdminClient()

        const { data: businesses, error } = await db
          .from('businesses')
          .select('id, name, user_id')
          .limit(100) // pilot ceiling — promote to cursor-pagination at scale

        if (error) {
          console.error('[digest-builder] Failed to fetch businesses', {
            error: error.message,
            code: error.code,
          })
          // Fallback to mock so the cron remains runnable during early pilot
          return [
            {
              businessId: 'mock-business-id',
              businessName: 'Mock Business (fallback)',
              userId: 'mock-user-id',
            },
          ]
        }

        if (!businesses || businesses.length === 0) {
          // No real customers yet — use mock for pilot smoke-test
          return [
            {
              businessId: 'mock-business-id',
              businessName: 'Mock Business (no customers)',
              userId: 'mock-user-id',
            },
          ]
        }

        return businesses.map((b) => ({
          businessId: b.id,
          businessName: b.name,
          userId: b.user_id,
        }))
      },
    )

    // ──────────────────────────────────────────────────────────────────────
    // Step 2 — Process each customer
    // ──────────────────────────────────────────────────────────────────────
    const summary = { inserted: 0, skipped: 0, errors: 0 }

    for (const customer of customers) {
      const result = await step.run(
        `process-customer-${customer.businessId}`,
        async (): Promise<ProcessResult> =>
          _processCustomer(customer),
      )

      if (result.status === 'inserted') summary.inserted++
      else if (result.status === 'skipped') summary.skipped++
      else summary.errors++
    }

    return summary
  },
)

// ---------------------------------------------------------------------------
// Manual / test invocation
// ---------------------------------------------------------------------------

/**
 * `runDigestBuilderForCustomer` — callable outside the cron for manual
 * triggering and test purposes.
 *
 * Pass a real `businessId` (UUID) from the `businesses` table, or
 * `'mock-customer-id'` to exercise the full pipeline with mock data.
 *
 * @example
 * ```ts
 * const result = await runDigestBuilderForCustomer('mock-customer-id')
 * // → { status: 'inserted', digestId: 'some-uuid' }
 * ```
 */
export async function runDigestBuilderForCustomer(
  businessId: string,
): Promise<ProcessResult> {
  return _processCustomer({
    businessId,
    businessName: 'Manual invocation',
    userId: 'unknown', // userId not needed for manual invocation; businessId is the FK
  })
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Core per-customer processing: assemble DigestInput → run agent → insert row.
 * Extracted so both the cron `step.run` and `runDigestBuilderForCustomer` share
 * a single code path.
 */
async function _processCustomer(
  customer: CustomerRecord,
): Promise<ProcessResult> {
  const db = getAdminClient()
  const weekOf = _getWeekOf()

  // 2a. Assemble DigestInput (live DB → mock fallback)
  let input: DigestInput
  try {
    input = await _assembleDigestInput(db, customer, weekOf)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[digest-builder] assembleDigestInput failed — using mock fixture', {
      businessId: customer.businessId,
      error: message,
    })
    input = getMockDigestInput(customer.businessId)
  }

  // 2b. Call digest-writer agent
  let agentOutput
  try {
    agentOutput = await runDigestWriter(input)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[digest-builder] runDigestWriter failed', {
      businessId: customer.businessId,
      error: message,
    })
    return { status: 'error', error: message }
  }

  // 2c. INSERT weekly_digests row
  // TODO(W2.2-typegen): remove cast after `pnpm supabase gen types` regenerates
  //   database.types.ts to include the weekly_digests table — non-blocking on pilot ship.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = db as any
  const { data: inserted, error: insertError } = await (dbAny
    .from('weekly_digests')
    .insert({
      customer_id: customer.businessId,
      week_of: weekOf,
      payload_json: agentOutput,
      rendered_html: (agentOutput as Record<string, unknown>)['bodyHtml'] ?? null,
      status: 'draft',
    })
    .select('id')
    .single() as Promise<{ data: { id: string } | null; error: { code: string; message: string } | null }>)

  if (insertError) {
    // 23505 = unique_violation → digest already exists for this business + week
    if (insertError.code === '23505') {
      return { status: 'skipped' }
    }
    console.error('[digest-builder] weekly_digests insert failed', {
      businessId: customer.businessId,
      weekOf,
      error: insertError.message,
      code: insertError.code,
    })
    return { status: 'error', error: insertError.message }
  }

  if (!inserted) {
    return { status: 'error', error: 'Insert returned no row' }
  }

  return { status: 'inserted', digestId: inserted.id }
}

/**
 * Returns the ISO datetime (YYYY-MM-DDThh:mm:ss.sssZ) of the most recent Monday
 * at midnight UTC. The cron fires on Sunday 16:00 UTC, so we anchor the digest
 * week to the Monday that started it.
 *
 * DigestInput.weekOf is z.string().datetime() — must be full ISO, not a date-only string.
 */
function _getWeekOf(): string {
  const d = new Date()
  // Sunday = 0, Monday = 1. Back up to the Monday that started this week.
  const dayOfWeek = d.getUTCDay() // 0=Sun
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  d.setUTCDate(d.getUTCDate() - daysToMonday)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Assembles a DigestInput from live DB data, matching the canonical schema in
 * `apps/web/src/lib/digest/mock-input.ts`.
 *
 * Source tables:
 *   - approval_queue    → openApprovalCards (state='pending', not expired)
 *   - scan_engine_results → visibilityDeltas
 *   - content_items     → deliverables
 *
 * Throws on critical DB failure so the caller can fall back to mock fixture.
 * Non-critical failures (scan data unavailable, etc.) are logged and produce
 * empty arrays / default values — the digest is still sent.
 */
async function _assembleDigestInput(
  db: ReturnType<typeof getAdminClient>,
  customer: CustomerRecord,
  weekOf: string,
): Promise<DigestInput> {
  const weekStart = new Date(weekOf)
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)

  // ── Open approval cards ──────────────────────────────────────────────────
  // TODO(W2.2-typegen): remove cast after `pnpm supabase gen types` regenerates
  //   database.types.ts to include the approval_queue table — non-blocking on pilot ship.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = db as any
  type ApprovalRow = {
    id: string
    kind: string | null
    resource: Record<string, unknown> | null
    expires_at: string
    approval_token: string | null
  }
  const { data: approvalRows, error: approvalError } = (await dbAny
    .from('approval_queue')
    .select('id, kind, resource, expires_at, approval_token')
    .eq('customer_id', customer.businessId)
    .eq('state', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true })
    .limit(10)) as { data: ApprovalRow[] | null; error: { message: string } | null }

  if (approvalError) {
    console.error('[digest-builder] approval_queue query failed', {
      businessId: customer.businessId,
      error: approvalError.message,
    })
  }

  const kindToDeliverableType = (
    kind: string | null,
  ): 'schema' | 'faq' | 'citation' | 'content' | 'outreach' => {
    const map: Record<string, 'schema' | 'faq' | 'citation' | 'content' | 'outreach'> = {
      schema_push: 'schema',
      faq_agent: 'faq',
      citation_submit: 'citation',
      content_publish: 'content',
      email_as_them: 'outreach',
      outreach: 'outreach',
      listing_update: 'content',
    }
    return kind !== null ? (map[kind] ?? 'content') : 'content'
  }

  const openApprovalCards = (approvalRows ?? []).map((row) => {
    const resourceTitle =
      row.resource !== null && typeof row.resource === 'object'
        ? (row.resource['title'] as string | undefined)
        : undefined
    const titleBase = _describeApproval(row.kind ?? 'unknown', row.resource)
    const title = resourceTitle ?? titleBase
    const approveUrl = `https://app.beamixai.com/approvals/${encodeURIComponent(row.id)}?token=${encodeURIComponent(String(row.approval_token ?? ''))}`
    return {
      approvalId: row.id,
      title: title.slice(0, 120),
      type: kindToDeliverableType(row.kind),
      approveUrl,
      previewText: titleBase,
      expiresAt: row.expires_at,
    }
  })

  // ── Visibility deltas (scan_engine_results) ──────────────────────────────
  type EngineRow = {
    engine: string
    rank_position: number | null
    is_mentioned: boolean
    created_at: string
  }

  // Fetch this week + 4 weeks back to compute deltas
  const fourWeeksAgo = new Date(weekStart)
  fourWeeksAgo.setUTCDate(fourWeeksAgo.getUTCDate() - 28)

  const { data: engineResults, error: erError } = await db
    .from('scan_engine_results')
    .select('engine, rank_position, is_mentioned, created_at')
    .eq('business_id', customer.businessId)
    .gte('created_at', fourWeeksAgo.toISOString())
    .lte('created_at', weekEnd.toISOString())
    .order('created_at', { ascending: false })

  if (erError) {
    console.error('[digest-builder] scan_engine_results query failed', {
      businessId: customer.businessId,
      error: erError.message,
    })
  }

  const rows = (engineResults ?? []) as EngineRow[]

  // Partition rows by engine and by time bucket
  const thisWeekStartMs = weekStart.getTime()
  const thisWeekEndMs = weekEnd.getTime()
  const lastWeekStartMs = new Date(weekStart)
  lastWeekStartMs.setUTCDate(lastWeekStartMs.getUTCDate() - 7)
  const lastWeekStartTime = lastWeekStartMs.getTime()
  const lastWeekEndTime = thisWeekStartMs
  const fourWeeksAgoTime = fourWeeksAgo.getTime()

  type BucketRows = Map<string, EngineRow[]>
  const thisWeekByEngine: BucketRows = new Map()
  const lastWeekByEngine: BucketRows = new Map()
  const fourWeeksByEngine: BucketRows = new Map()

  for (const row of rows) {
    const ts = new Date(row.created_at).getTime()
    const engine = row.engine
    if (ts >= thisWeekStartMs && ts < thisWeekEndMs) {
      const arr = thisWeekByEngine.get(engine) ?? []
      arr.push(row); thisWeekByEngine.set(engine, arr)
    } else if (ts >= lastWeekStartTime && ts < lastWeekEndTime) {
      const arr = lastWeekByEngine.get(engine) ?? []
      arr.push(row); lastWeekByEngine.set(engine, arr)
    } else if (ts >= fourWeeksAgoTime) {
      const arr = fourWeeksByEngine.get(engine) ?? []
      arr.push(row); fourWeeksByEngine.set(engine, arr)
    }
  }

  const allEngines = new Set([
    ...thisWeekByEngine.keys(),
    ...lastWeekByEngine.keys(),
    ...fourWeeksByEngine.keys(),
  ])

  /** Average mention-based score (0–100) for a bucket. */
  const bucketScore = (bucketRows: EngineRow[]): number | null => {
    if (bucketRows.length === 0) return null
    const mentioned = bucketRows.filter((r) => r.is_mentioned).length
    return Math.round((mentioned / bucketRows.length) * 100)
  }

  const visibilityDeltas = Array.from(allEngines).map((engine) => {
    const thisWeekScore = bucketScore(thisWeekByEngine.get(engine) ?? [])
    const lastWeekScore = bucketScore(lastWeekByEngine.get(engine) ?? [])
    const fourWeeksScore = bucketScore(fourWeeksByEngine.get(engine) ?? [])
    return {
      engine,
      thisWeek: thisWeekScore ?? 0,
      lastWeek: lastWeekScore,
      fourWeeksAgo: fourWeeksScore,
      delta:
        thisWeekScore !== null && lastWeekScore !== null
          ? thisWeekScore - lastWeekScore
          : null,
    }
  })

  // ── Deliverables (content_items published this week) ─────────────────────
  const { data: contentItems, error: contentError } = await db
    .from('content_items')
    .select('id, agent_type, created_at')
    .eq('business_id', customer.businessId)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (contentError) {
    console.error('[digest-builder] content_items query failed', {
      businessId: customer.businessId,
      error: contentError.message,
    })
  }

  type ContentRow = { id: string; agent_type: string | null; created_at: string }

  const agentTypeToDeliverableType = (
    agentType: string | null,
  ): 'schema' | 'faq' | 'citation' | 'content' | 'outreach' => {
    const map: Record<string, 'schema' | 'faq' | 'citation' | 'content' | 'outreach'> = {
      schema_agent: 'schema',
      faq_agent: 'faq',
      citation_agent: 'citation',
      content_agent: 'content',
    }
    return agentType !== null ? (map[agentType] ?? 'content') : 'content'
  }

  const deliverables = (contentItems ?? []).map((row: ContentRow) => ({
    workLogId: row.id,
    type: agentTypeToDeliverableType(row.agent_type),
    description: _describeContentItem(row.agent_type),
    completedAt: row.created_at,
  }))

  // ── Placeholder URL pass-throughs (real signing is Wave 2+) ─────────────
  const approveAllUrl = 'https://app.beamixai.com/approvals?token=PILOT_PLACEHOLDER'
  const unsubscribeUrl = `https://app.beamixai.com/u/${encodeURIComponent(customer.userId)}/unsub`

  // ── Assemble + return ────────────────────────────────────────────────────
  return {
    digestId: randomUUID(),
    customerId: customer.businessId,
    customerName: customer.businessName,
    customerDisplayName: customer.businessName,
    customerTier: 'growth', // default tier for pilot; real tier lookup is Wave 2+
    locale: 'en',
    weekOf,
    brandBrief: {
      voiceTone: 'clear, professional, results-focused',
      kpis: ['AI search visibility', 'new customer inquiries'],
      industry: 'General',
    },
    deliverables,
    visibilityDeltas,
    newlyWonQueries: [],
    openApprovalCards,
    causalTrails: [],
    historicalDigests: [],
    approveAllUrl,
    unsubscribeUrl,
    upcomingDeliverables: [],
  }
}

/** Human-readable description for an approval_queue kind + resource. */
function _describeApproval(
  kind: string,
  resource: Record<string, unknown> | null,
): string {
  const kindLabels: Record<string, string> = {
    content_publish: 'Content piece ready to publish',
    email_as_them: 'Outreach email on your behalf',
    outreach: 'Outreach action requiring sign-off',
    schema_push: 'Schema update for your website',
    listing_update: 'Business listing update',
    citation_submit: 'Citation submission for a directory',
  }
  const title =
    resource !== null && typeof resource === 'object'
      ? (resource['title'] as string | undefined)
      : undefined
  const base = kindLabels[kind] ?? 'Item requiring your review'
  return title ? `${base}: "${title}"` : base
}

/** Human-readable description for a content_items row. */
function _describeContentItem(agentType: string | null): string {
  const labels: Record<string, string> = {
    faq_agent: 'FAQ published',
    schema_agent: 'Schema markup updated',
    citation_agent: 'Citation submitted',
    content_agent: 'Content piece published',
  }
  return agentType !== null
    ? (labels[agentType] ?? `${agentType} output published`)
    : 'Content published'
}
