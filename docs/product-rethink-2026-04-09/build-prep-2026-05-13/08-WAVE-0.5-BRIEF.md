# Wave 0.5 — Shared Types Contract (CEO Brief)

**Paste this entire file into the CEO session that ran Wave 0 (continuation), once all three Wave 0 PRs are merged.**

---

## Mission

Wave 0 produced the DB foundation, the agent system, and the app shell — but the frontend and backend don't yet share a single type contract. Wave 0.5 fixes that. One backend-developer creates the canonical types + Zod schemas that EVERY Wave 1 worker imports. Wave 1 cannot start until this merges.

**Estimated turns:** 8–15. This is a focused 2–4 hour task.

---

## Required Reading

1. `apps/web/src/lib/agents/types.ts` — types Worker 2 produced in Wave 0
2. `apps/web/src/lib/db/database.types.ts` — DB-mirrored types from Worker 1
3. `docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md` §TypeScript Types — single source for cross-layer interfaces
4. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/02-AUTOMATION-RULES.md` — for `Suggestion` + `AutomationRule` interfaces
5. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/03-DAY-1-FLOW.md` — for `Day1State`, `Day1StatusResponse`

---

## Single Worker — `backend-developer` (Sonnet)

**Worktree:** `.worktrees/shared-types`
**Branch:** `feat/shared-types`
**Owner of:** `apps/web/src/lib/types/`

**Brief to worker:**

> You are the gate between Wave 0 and Wave 1. You produce a single shared types contract that backend AND frontend workers import from. Mismatches between layers are caught at compile time after you ship, not runtime.
>
> Deliverables (exact file paths):
>
> **1. `apps/web/src/lib/types/shared.ts`** — re-exports + cross-layer interfaces
>
> Re-export every type from `src/lib/agents/types.ts` (already defined in Wave 0): `PlanTier`, `AgentType`, `PipelineStage`, `CreditCost`, `AgentConfig`, `AgentJobInput`, `AgentJobOutput`, `AgentPipelineContext`, `BusinessContext`, `ScanResult`, `EngineResult`, `QueryPosition`, `InboxItem`, `Suggestion`, `NotificationItem`, `DailyCapStatus`, `QAResult`, `CostEntry`, `GEOSignalChecklist`.
>
> Add these new interfaces (NOT yet in `agents/types.ts`):
>
> ```typescript
> // From 03-DAY-1-FLOW.md
> export type Day1State =
>   | 'waiting_webhook' | 'ensure_business' | 'query_mapper'
>   | 'scan_running' | 'rules' | 'complete' | 'error';
>
> export interface Day1StatusResponse {
>   state: Day1State;
>   progressPct: number; // 0..100
>   message: string;     // displayed to user
>   scanId?: string;
>   firstSuggestionId?: string;
> }
>
> // From 02-AUTOMATION-RULES.md
> export interface AutomationRule {
>   id: string;        // R01..R15
>   name: string;
>   triggerAgent: AgentType;
>   impact: 'low' | 'medium' | 'high';
>   availableOnTiers: PlanTier[];
>   cooldownDays: number;
> }
>
> // Tier feature gating
> export type FeatureKey =
>   | 'agent.authority_blog_strategist'
>   | 'agent.unlimited_competitors'
>   | 'inbox.bulk_approve'
>   | 'automation.unlimited_schedules'
>   | 'scan.daily_cadence'
>   | 'competitors.daily_refresh'
>   | 'export.bulk';
>
> export interface FeatureMap {
>   tier: PlanTier;
>   features: Record<FeatureKey, boolean>;
> }
>
> // Schedule
> export interface AutomationSchedule {
>   id: string;
>   userId: string;
>   businessId: string;
>   agentType: AgentType;
>   cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
>   nextRunAt: string;
>   lastRunAt: string | null;
>   isActive: boolean;
> }
>
> // Competitor
> export interface CompetitorData {
>   id: string;
>   businessId: string;
>   competitorName: string;
>   competitorUrl: string | null;
>   appearanceRateByEngine: Record<string, number>;
>   queriesWhereTheyWin: string[];
>   addedAt: string;
> }
>
> // Archive item
> export interface ArchiveItem extends InboxItem {
>   approvedAt: string;
>   publishedAt: string | null;
>   verificationStatus: 'pending_probe' | 'verified' | 'unverified';
>   externalUrl: string | null;
> }
>
> // User-facing labels — board April-18: "Agent names are internal only. Users see action labels."
> // Every UI surface that references an agent MUST use these labels, NOT the AgentType key
> // and NOT an `agentDisplayName` (which leaks the internal name). The string "GEO" never appears
> // in user-facing copy — use "AI Search Visibility".
> export interface AgentUserFacingLabel {
>   actionLabel: string;       // imperative, what the agent does: "Optimize this page"
>   sourceDescription: string; // for evidence-panel attribution: "Content rewrite"
> }
>
> export const USER_FACING_AGENT_LABELS: Record<AgentType, AgentUserFacingLabel> = {
>   query_mapper:              { actionLabel: 'Map your queries',                sourceDescription: 'Query analysis' },
>   content_optimizer:         { actionLabel: 'Optimize this page',              sourceDescription: 'Content rewrite' },
>   freshness_agent:           { actionLabel: 'Refresh this content',            sourceDescription: 'Content refresh' },
>   faq_builder:               { actionLabel: 'Build FAQs from your queries',    sourceDescription: 'FAQ + JSON-LD' },
>   schema_generator:          { actionLabel: 'Add structured data',             sourceDescription: 'Schema markup' },
>   offsite_presence_builder:  { actionLabel: 'Get listed in directories',       sourceDescription: 'Off-site listings' },
>   review_presence_planner:   { actionLabel: 'Acquire more reviews',            sourceDescription: 'Review acquisition plan' },
>   entity_builder:            { actionLabel: 'Strengthen your knowledge graph', sourceDescription: 'Entity signals' },
>   authority_blog_strategist: { actionLabel: 'Publish an authority post',       sourceDescription: 'Authority article' },
>   performance_tracker:       { actionLabel: "Track this week's movement",      sourceDescription: 'Performance tracking' },
>   reddit_presence_planner:   { actionLabel: 'Plan community presence',         sourceDescription: 'Community plan' },
> };
> ```
>
> **2. `apps/web/src/lib/types/api.ts`** — Zod schemas for every API contract
>
> One Zod schema per endpoint in the contract. Below is the complete list — every Wave 1 backend worker implements against these schemas; every Wave 1 frontend worker imports them for client validation. Anything missing here causes drift.
>
> Endpoints to schema (request body + response body):
>
> - `POST /api/scan/free` — public free scan
> - `GET /api/scan/free/[scanId]` — poll status
> - `POST /api/scan/start` — authenticated manual scan
> - `GET /api/scan/[scanId]` — scan detail
> - `GET /api/scans` — list user scans
> - `POST /api/agents/run` — enqueue agent job
> - `POST /api/agents/[jobId]/cancel`
> - `GET /api/agents/[type]` — agent config
> - `GET /api/suggestions` — ranked suggestions
> - `POST /api/suggestions/[id]/dismiss`
> - `POST /api/suggestions/[id]/run` — convert suggestion to agent job
> - `GET /api/inbox` — paginated inbox list
> - `GET /api/inbox/[itemId]` — single item
> - `POST /api/inbox/[itemId]/approve`
> - `POST /api/inbox/[itemId]/reject`
> - `POST /api/inbox/[itemId]/edit` — freshness chat editor
> - `GET /api/archive`
> - `POST /api/archive/[itemId]/publish` — mark published, queue URL probe
> - `GET /api/automation/schedules`
> - `POST /api/automation/schedules`
> - `PATCH /api/automation/schedules/[id]`
> - `DELETE /api/automation/schedules/[id]`
> - `POST /api/automation/kill-switch`
> - `GET /api/competitors`
> - `POST /api/competitors`
> - `DELETE /api/competitors/[id]`
> - `POST /api/billing/checkout` — create Paddle checkout
> - `POST /api/billing/portal` — Paddle customer portal redirect
> - `POST /api/billing/topup` — $19/10-runs purchase
> - `POST /api/webhooks/paddle` — Paddle webhook (request only — Paddle defines schema)
> - `GET /api/plan/features` — FeatureMap for current user
> - `GET /api/notifications` — paginated
> - `POST /api/notifications/read`
> - `GET /api/credits/balance` — current pool + daily cap status
> - `GET /api/onboarding/day1-status` — Day-1 polling endpoint, returns `Day1StatusResponse`
>
> Naming convention:
> ```typescript
> export const ScanStartRequest = z.object({ url: z.string().url(), ... });
> export type ScanStartRequest = z.infer<typeof ScanStartRequest>;
>
> export const ScanStartResponse = z.object({ scanId: z.string().uuid(), status: z.literal('queued') });
> export type ScanStartResponse = z.infer<typeof ScanStartResponse>;
> ```
>
> Every endpoint gets request + response schema + matching exported type. Use `z.infer<typeof ...>` pattern.
>
> **Security-bound Zod schemas (H2 + B3 + B4 from security audit — MANDATORY).** Every endpoint that accepts user-controlled string or URL data MUST use the validators below. Define them once in `api.ts` (or a sibling `validators.ts` re-exported from `api.ts`) and reuse:
>
> ```typescript
> // Shared validators — import these into every endpoint schema below
> export const SafeBusinessName = z.string().min(1).max(500).regex(/^[\p{L}\p{N}\s,.\-&'"()]+$/u, 'invalid characters');
> export const SafeService = z.string().min(1).max(200);
> export const SafeServices = z.array(SafeService).max(20);
> export const SafeCustomInstructions = z.string().max(2000);
>
> // notPrivateIP — async refiner that runs the SSRF url-guard (apps/web/src/lib/security/url-guard.ts).
> // In environments where DNS resolution isn't available (Edge), use the synchronous protocol+host-allowlist check.
> export const SafeExternalUrl = z.string().url().max(2048);
> // Backend route handlers MUST additionally call `validateExternalUrl(input)` before any fetch.
> ```
>
> Apply across the endpoint contract:
> - `POST /api/scan/free` request: `{ url: SafeExternalUrl, email?: z.string().email(), turnstileToken: z.string().min(1) }`
> - `POST /api/scan/start` request: `{ url: SafeExternalUrl }`
> - `POST /api/agents/run` request: `{ agentType: z.enum([...AGENT_TYPES]), businessId: z.string().uuid(), targetUrl: SafeExternalUrl.optional(), targetContent: z.string().max(50_000).optional(), customInstructions: SafeCustomInstructions.optional() }`
> - `POST /api/competitors` request: `{ competitorName: SafeBusinessName, competitorUrl: SafeExternalUrl }`
> - Any business-context shape: `{ name: SafeBusinessName, services: SafeServices, scanUrl: SafeExternalUrl, ... }`
>
> Endpoints accepting URLs always pair the schema with a backend-side `validateExternalUrl()` call before fetch (the schema alone does NOT defeat SSRF — it just blocks oversized / wrong-protocol inputs).
>
> **3. `apps/web/src/lib/types/events.ts`** — Inngest event registry (single source for event names + payloads)
>
> Exports an `EventName` union and per-event payload interfaces. All Wave 1 Inngest functions and webhook handlers import event types from this file — eliminates the BE-1↔BE-2 chicken-and-egg where BE-2 fires an event whose type only exists on BE-1's branch. `inngest/client.ts` (BE-1, Wave 1) re-exports these from here; `shared.ts` re-exports `EventName` so consumers can import everything from `@/lib/types`.
>
> ```typescript
> export type EventName =
>   | 'day1.onboarding'
>   | 'scan.completed'
>   | 'scan.free.completed'
>   | 'agent.job.requested'
>   | 'agent.job.completed'
>   | 'agent.job.failed'
>   | 'url-probe.queued'
>   | 'url-probe.completed'
>   | 'rules.evaluate'
>   | 'paddle.subscription.created'
>   | 'paddle.subscription.updated'
>   | 'paddle.subscription.cancelled'
>   | 'paddle.transaction.completed'
>   | 'budget.threshold_75'
>   | 'budget.threshold_100'
>   | 'kill_switch.engaged'
>   | 'daily.digest.send';
>
> export interface Day1OnboardingPayload { userId: string; subscriptionId: string; paddleCustomerId: string; idempotencyKey: string; }
> export interface ScanCompletedPayload { scanId: string; businessId: string; userId: string; }
> export interface AgentJobRequestedPayload { jobId: string; agentType: AgentType; userId: string; businessId: string; }
> // ... one interface per event name above; payloads strictly typed (no z.any).
> ```
>
> (Note: only ONE definition of `EventName` exists across the codebase — here. Security-side Fix Agent 2 may also reference `EventName`; both fixes point to this file. `shared.ts` re-exports it.)
>
> **4. `apps/web/src/lib/types/index.ts`** — barrel export
> ```typescript
> export * from './shared';
> export * from './api';
> export * from './events';
> ```
>
> **Shared hook + component prop contracts (G6 + G7):**
>
> Add to `shared.ts`:
> ```typescript
> import type { ReactNode } from 'react';
>
> // useInboxPolling() — owned by Wave 1 FE-1 in apps/web/src/hooks/use-inbox-polling.ts
> // BUT the result type lives here so all consumers (Home preview, Inbox page) share it.
> export interface UseInboxPollingResult {
>   items: InboxItem[];
>   isLoading: boolean;
>   error: Error | null;
>   refetch: () => void;
> }
>
> // PaywallGate — component lives in apps/web/src/components/paywall-gate.tsx (Wave 1 FE-3),
> // but Wave 1 FE-1 imports against this contract — must be defined here so FE-1 isn't blocked by FE-3.
> export interface PaywallGateProps {
>   feature: FeatureKey;
>   tier: PlanTier;
>   mode?: 'inline' | 'modal';
>   children: ReactNode;
>   fallback?: ReactNode;
> }
> ```
>
> **5. Verification:**
> - `pnpm typecheck` clean
> - No circular imports (verify with `madge --circular apps/web/src/lib/types/`)
> - Every API endpoint listed above has both Request and Response schemas exported
>
> Do NOT change anything in `src/lib/agents/`, `src/lib/db/`, or anywhere else. Stay inside `src/lib/types/`.
>
> Return structured JSON:
> ```
> {
>   "branch": "feat/shared-types",
>   "worktree": "<full path>",
>   "files_created": [
>     "apps/web/src/lib/types/shared.ts",
>     "apps/web/src/lib/types/api.ts",
>     "apps/web/src/lib/types/events.ts",
>     "apps/web/src/lib/types/index.ts"
>   ],
>   "endpoints_specced": <count>,
>   "interfaces_exported": <count>,
>   "typecheck_clean": true
> }
> ```

---

## QA Gate

Lite-tier QA (single review). This is type-only — no runtime behavior changes. Code reviewer verifies:
- Every endpoint in the list above has request+response schemas
- No interface re-defined (re-exports only from `agents/types.ts`)
- Zod schemas use strict types (no `z.any()` except where Paddle webhook payload genuinely is untyped)
- File compiles, no `unknown` propagated through public types

Adam reviews + merges. After merge, signal: "Wave 0.5 complete — ready for Wave 1."
