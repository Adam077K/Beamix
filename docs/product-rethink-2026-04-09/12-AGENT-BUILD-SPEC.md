# Agent System Build Spec — Worker Reference (2026-04-17)

> **This spec is the reference for Wave 0 Worker 2 (ai-engineer). Read `07-AGENT-ROSTER-V2.md` for business context.**

---

## Scope

This doc covers the complete technical implementation of the Beamix agent system. It is the authoritative reference for the ai-engineer building `src/lib/agents/` from scratch in Wave 0.

---

## Build Scope by Phase

### Wave 0 (Day 1–2 of execution)
- Config registry for all 11 agents
- 5-step pipeline runner (plan → research → do → QA → summarize)
- Model router
- Credit hold/confirm/release helpers
- Cross-agent coordination utilities (page_locks, topic_ledger)
- System prompts for all 11 agents (all 5 stages)
- Daily cap enforcement helpers

### Wave 1 (during parallel build)
- Inngest function wiring (`agent-execute.ts` — calls pipeline runner)
- Per-agent input validators (Zod)
- QA gate with Sonar citation verification

### Post-launch (not MVP scope)
- LLM-as-judge eval harness
- A/B prompt testing
- Per-tenant prompt overrides

---

## File Structure

```
src/lib/agents/
├── index.ts                    # Public API — re-exports everything consumers need
├── config/
│   ├── registry.ts             # AgentConfig[] — all 11 agents defined here
│   ├── prompts/
│   │   ├── query-mapper.ts
│   │   ├── content-optimizer.ts
│   │   ├── freshness-agent.ts
│   │   ├── faq-builder.ts
│   │   ├── schema-generator.ts
│   │   ├── offsite-presence-builder.ts
│   │   ├── review-presence-planner.ts
│   │   ├── entity-builder.ts
│   │   ├── authority-blog-strategist.ts
│   │   ├── performance-tracker.ts
│   │   └── reddit-presence-planner.ts
│   └── models.ts               # Model router table — maps agent + stage → model ID
├── pipeline/
│   ├── runner.ts               # runAgentPipeline() — orchestrates all 5 steps
│   ├── steps/
│   │   ├── plan.ts             # Step 1
│   │   ├── research.ts         # Step 2
│   │   ├── do.ts               # Step 3
│   │   ├── qa.ts               # Step 4
│   │   └── summarize.ts        # Step 5
│   └── context.ts              # AgentPipelineContext builder
├── coordination/
│   ├── page-locks.ts           # lockPage(), unlockPage(), isPageLocked()
│   └── topic-ledger.ts         # registerTopic(), isTopicCovered()
├── credits/
│   ├── guard.ts                # holdCredits(), confirmCredits(), releaseCredits()
│   └── daily-cap.ts            # checkDailyCap(), incrementDailyCap()
├── types.ts                    # All TypeScript interfaces (see below)
└── errors.ts                   # AgentError, QAFailedError, PageLockedError, CapExceededError
```

---

## TypeScript Types

All types live in `src/lib/agents/types.ts` and are re-exported from `src/lib/types/shared.ts` for frontend use.

```typescript
// Plan tiers
export type PlanTier = 'discover' | 'build' | 'scale';

// The 11 MVP-1 agent identifiers
export type AgentType =
  | 'query_mapper'
  | 'content_optimizer'
  | 'freshness_agent'
  | 'faq_builder'
  | 'schema_generator'
  | 'offsite_presence_builder'
  | 'review_presence_planner'
  | 'entity_builder'
  | 'authority_blog_strategist'
  | 'performance_tracker'
  | 'reddit_presence_planner';

// Pipeline stages
export type PipelineStage = 'plan' | 'research' | 'do' | 'qa' | 'summarize';

// Credit cost per agent run (matches 07-AGENT-ROSTER-V2.md Cost Classification)
export type CreditCost = 0 | 1 | 2 | 3;

// Agent configuration — one entry per agent in the registry
export interface AgentConfig {
  agentType: AgentType;
  displayName: string;
  creditCost: CreditCost;            // 0 = free (daily-capped), 1–3 = paid runs
  isFree: boolean;                   // true if creditCost === 0
  dailyCap: Record<PlanTier, number | null>; // null = unlimited
  availableOnTiers: PlanTier[];
  stages: PipelineStage[];           // free agents: ['plan', 'do', 'qa']
  requiresPageLock: boolean;         // true for Content Optimizer, Freshness, Blog Strategist
  requiresTopicLedger: boolean;      // true for Blog Strategist, FAQ Builder
  ymylRisk: 'low' | 'medium' | 'high';
}

// Input to the pipeline runner
export interface AgentJobInput {
  jobId: string;                     // agent_jobs.id from DB
  agentType: AgentType;
  userId: string;
  businessId: string;
  planTier: PlanTier;
  targetUrl?: string;                // for page-level agents
  targetContent?: string;            // pasted content (if no URL)
  queryCluster?: string[];           // from Query Mapper output
  customInstructions?: string;       // user override at job creation time
  scanId?: string;                   // linked scan for context
}

// Context assembled before pipeline starts (built by context.ts)
export interface AgentPipelineContext {
  input: AgentJobInput;
  config: AgentConfig;
  business: BusinessContext;
  scanData?: ScanResult;
  competitorData?: CompetitorData[];
  queryIntelligence?: QueryIntelligenceData;
  holdId?: string;                   // set after credits held
}

// Output from the full pipeline
export interface AgentJobOutput {
  jobId: string;
  agentType: AgentType;
  primaryContent: string;            // the main deliverable (markdown)
  contentFormat: 'markdown' | 'html' | 'json_ld' | 'structured_report' | 'plain_text';
  summaryText: string;               // 2–3 sentence summary for Inbox card
  targetQueries: string[];           // queries this content targets
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  costEntries: CostEntry[];          // one per LLM call made
  totalCostUsd: number;
  durationMs: number;
}

// GEO signal checklist (QA stage validates these)
export interface GEOSignalChecklist {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasExpertQuotes: boolean;
  hasFreshData: boolean;             // content references data < 90 days old
  hasLocalContext: boolean;          // mentions location if local business
}

// QA stage result
export interface QAResult {
  passed: boolean;
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  issues: string[];                  // human-readable issues if failed
  retryRecommended: boolean;
}

// Cost tracking per LLM call
export interface CostEntry {
  stage: PipelineStage;
  model: string;                     // full model ID (e.g., 'claude-sonnet-4-6')
  provider: 'openrouter' | 'perplexity';
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

// Business context injected into every prompt
export interface BusinessContext {
  businessId: string;
  name: string;
  industry: string;
  location: string;
  services: string[];
  scanUrl: string;
  ymylCategory: boolean;
  language: 'he' | 'en';
}

// Scan data available to pipeline
export interface ScanResult {
  scanId: string;
  completedAt: string;
  overallScore: number;
  engineResults: EngineResult[];
  queryPositions: QueryPosition[];
}

export interface EngineResult {
  engine: string;
  isMentioned: boolean;
  rankPosition: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  brandsMentioned: string[];
}

export interface QueryPosition {
  queryText: string;
  engine: string;
  position: number | null;
  isMentioned: boolean;
  competitorsMentioned: string[];
}

// Inbox item shape (shared with frontend)
export interface InboxItem {
  id: string;
  agentType: AgentType;
  status: 'draft' | 'review' | 'approved' | 'archived' | 'rejected';
  title: string;
  summaryText: string;
  primaryContent: string;
  contentFormat: AgentJobOutput['contentFormat'];
  targetQueries: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  ymylFlagged: boolean;
  geoSignals: GEOSignalChecklist;
  triggerReason: string;             // human-readable: "FAQ content was 45 days old"
  createdAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  verificationStatus: 'none' | 'pending_probe' | 'verified' | 'unverified';
}

// Suggestion (from rules engine output)
export interface Suggestion {
  id: string;
  agentType: AgentType;
  title: string;
  description: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  ruleId: string;                    // which rule triggered this
  creditCost: CreditCost;
  status: 'pending' | 'running' | 'dismissed';
  createdAt: string;
}

// Notification (for in-app notification center)
export interface NotificationItem {
  id: string;
  userId: string;
  type: 'item_ready' | 'scan_complete' | 'budget_75' | 'budget_100' | 'competitor_alert' | 'suggestion_generated';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  linkPath?: string;                 // e.g., '/inbox?item=abc'
}

// Daily cap status
export interface DailyCapStatus {
  agentType: AgentType;
  planTier: PlanTier;
  usedToday: number;
  cap: number | null;               // null = unlimited
  capReached: boolean;
}
```

---

## Pipeline Architecture

### 5-Step Pipeline (credit-gated agents)

```
AgentJobInput
     │
     ▼
[PLAN]        Claude Sonnet 4.6 (Opus for Blog Strategist)
              Decompose task · validate business context completeness · select sub-strategy
     │
     ▼
[RESEARCH]    Perplexity Sonar Pro (or Sonar depending on agent)
              Pull scan data · competitor data · query intelligence · fresh citations
              (Skipped for FAQ Builder, Schema Generator — no external research needed)
     │
     ▼
[DO]          Claude Sonnet 4.6 / Opus / Gemini 2.0 Flash (per model router)
              Generate primary output — content rewrite, strategy doc, FAQ page, etc.
     │
     ▼
[QA]          Claude Haiku 4.5 (Sonnet for Content Optimizer, Entity Builder, Blog Strategist)
              Check GEO signals: stats ✓ citations ✓ quotes ✓ freshness ✓
              Check YMYL risk · flag issues · decide pass/fail
              If fail → retry DO step once · if second fail → surface to user with issues
     │
     ▼
[SUMMARIZE]   Claude Haiku 4.5
              Compress output for Inbox card (summaryText, 2–3 sentences)
              Build triggerReason string for evidence panel
     │
     ▼
AgentJobOutput → written to agent_jobs table → InboxItem inserted
```

### 3-Step Pipeline (free agents)

Free agents (Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker) run:

```
[PLAN] → [DO] → [QA]
```

No RESEARCH step (no external data needed). No SUMMARIZE step (output is short enough to display directly).

---

## Model Router Table

Full routing per agent and stage. See `07-AGENT-ROSTER-V2.md` for the definitive table. Implementation in `src/lib/agents/config/models.ts`:

```typescript
type ModelMap = Record<AgentType, Partial<Record<PipelineStage, string>>>;

// Model IDs are OpenRouter model strings
export const MODEL_ROUTER: ModelMap = {
  query_mapper:              { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar-pro', do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-haiku-4-5', summarize: 'anthropic/claude-haiku-4-5' },
  content_optimizer:         { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar',     do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-sonnet-4-6', summarize: 'anthropic/claude-haiku-4-5' },
  freshness_agent:           { plan: 'anthropic/claude-haiku-4-5',  research: 'perplexity/sonar',     do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-haiku-4-5', summarize: 'anthropic/claude-haiku-4-5' },
  faq_builder:               { plan: 'anthropic/claude-haiku-4-5',                                    do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-haiku-4-5' },
  schema_generator:          { plan: 'anthropic/claude-haiku-4-5',                                    do: 'anthropic/claude-haiku-4-5',   qa: 'anthropic/claude-haiku-4-5' },
  offsite_presence_builder:  { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar',     do: 'google/gemini-2.0-flash',     qa: 'anthropic/claude-haiku-4-5', summarize: 'anthropic/claude-haiku-4-5' },
  review_presence_planner:   { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar',     do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-haiku-4-5', summarize: 'anthropic/claude-haiku-4-5' },
  entity_builder:            { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar-pro', do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-sonnet-4-6', summarize: 'anthropic/claude-haiku-4-5' },
  authority_blog_strategist: { plan: 'anthropic/claude-opus-4-6',   research: 'perplexity/sonar-pro', do: 'anthropic/claude-opus-4-6',   qa: 'anthropic/claude-sonnet-4-6', summarize: 'anthropic/claude-haiku-4-5' },
  performance_tracker:       { plan: 'anthropic/claude-haiku-4-5',                                    do: 'google/gemini-2.0-flash',     qa: 'anthropic/claude-haiku-4-5' },
  reddit_presence_planner:   { plan: 'anthropic/claude-sonnet-4-6', research: 'perplexity/sonar-pro', do: 'anthropic/claude-sonnet-4-6', qa: 'anthropic/claude-haiku-4-5', summarize: 'anthropic/claude-haiku-4-5' },
};

// Prohibited: DeepSeek (any), Qwen (any) — not approved for customer data
```

---

## Agent Config Registry

`src/lib/agents/config/registry.ts` exports `AGENT_REGISTRY: AgentConfig[]`. Every agent has one entry. The fields below map directly to the `AgentConfig` interface.

| Agent | creditCost | isFree | dailyCap (D/B/S) | tiers | stages | pageLock | topicLedger | ymylRisk |
|-------|-----------|--------|-------------------|-------|--------|----------|-------------|---------|
| query_mapper | 1 | false | null/null/null | all | 5-step | false | false | low |
| content_optimizer | 2 | false | null/null/null | all | 5-step | true | false | medium |
| freshness_agent | 1 | false | null/null/null | all | 5-step | true | false | low |
| faq_builder | 0 | true | 3/5/10 | all | 3-step | false | true | medium |
| schema_generator | 0 | true | 20/20/20 | all | 3-step | false | false | low |
| offsite_presence_builder | 0 | true | 3/5/10 | all | 5-step | false | false | low |
| review_presence_planner | 2 | false | null/null/null | all | 5-step | false | false | low |
| entity_builder | 2 | false | null/null/null | all | 5-step | false | false | low |
| authority_blog_strategist | 3 | false | null/null/null | build, scale | 5-step | false | true | high |
| performance_tracker | 0 | true | null/null/null | all | 3-step | false | false | low |
| reddit_presence_planner | 1 | false | null/null/null | all | 5-step | false | false | low |

---

## Cross-Agent Coordination

### page_locks (`src/lib/agents/coordination/page-locks.ts`)

Prevents Content Optimizer, Freshness Agent, and Authority Blog Strategist from running on the same target URL simultaneously.

```typescript
// Lock a URL for an agent job. Returns false if already locked.
lockPage(url: string, jobId: string, agentType: AgentType): Promise<boolean>

// Release the lock when job completes or fails.
unlockPage(url: string, jobId: string): Promise<void>

// Check without locking (for pre-run checks).
isPageLocked(url: string): Promise<boolean>
```

Implementation: writes to `page_locks` DB table. Lock TTL: 2 hours (auto-expire via DB trigger). Pipeline runner calls `lockPage()` before DO step; wraps entire pipeline in try/finally to ensure `unlockPage()` always fires.

### topic_ledger (`src/lib/agents/coordination/topic-ledger.ts`)

Prevents Authority Blog Strategist and FAQ Builder from generating duplicate topic coverage.

```typescript
// Register a topic as covered after successful job completion.
registerTopic(businessId: string, topic: string, agentType: AgentType, jobId: string): Promise<void>

// Check if a topic is already covered (call before DO step).
isTopicCovered(businessId: string, topic: string): Promise<boolean>

// Returns list of covered topics for a business (for PLAN step context injection).
getCoveredTopics(businessId: string): Promise<string[]>
```

Implementation: writes to `topic_ledger` DB table. No TTL — topics remain covered indefinitely (prevents content duplication over the lifetime of the account).

---

## Credit System Integration

All credit operations go through `src/lib/agents/credits/guard.ts`. These call the DB RPCs directly.

```typescript
// Hold credits before starting pipeline. Returns holdId (= jobId).
// Throws CapExceededError if credit_pools.available < required amount.
holdCredits(userId: string, agentType: AgentType, jobId: string): Promise<void>

// Confirm hold after successful pipeline completion. Deducts from pool.
confirmCredits(jobId: string): Promise<void>

// Release hold on failure. Restores credits to pool.
releaseCredits(jobId: string): Promise<void>
```

RPC signatures (from DB schema):
```sql
hold_credits(p_user_id uuid, p_amount int, p_job_id uuid)
confirm_credits(p_job_id uuid)
release_credits(p_job_id uuid)
```

The jobId IS the hold reference — no separate holdId needed.

### Daily Cap Enforcement (`src/lib/agents/credits/daily-cap.ts`)

```typescript
// Check if user has hit their daily cap for this agent type.
// Returns DailyCapStatus. Throws CapExceededError if cap reached.
checkDailyCap(userId: string, agentType: AgentType, planTier: PlanTier): Promise<DailyCapStatus>

// Increment usage counter. Call after successful DO step.
incrementDailyCap(userId: string, agentType: AgentType): Promise<void>
```

Reads/writes `daily_cap_usage` table. Resets at midnight UTC via DB scheduled function or cron.

---

## System Prompt Rules (All Agents)

These rules apply to every prompt in the system without exception.

1. **No AI disclosure.** No "drafted with AI assistance", no "as an AI", no disclosure markers of any kind. Content reads as professional, human-quality work. See `07-AGENT-ROSTER-V2.md` Content Output Policy.
2. **Business context first.** Every prompt injects `BusinessContext` before the task instruction. Generic output is a failure mode.
3. **GEO signals mandatory.** Content-producing agents must include at least one statistic, one citation, and one expert quote in output. QA step enforces this.
4. **YMYL awareness.** If `business.ymylCategory === true`, PLAN step adds "This is a YMYL category (health/finance/legal). Flag any medical, legal, or financial claims in your output." QA step checks for YMYL risk regardless.
5. **Language respect.** If `business.language === 'he'`, output is in Hebrew. If `'en'`, output is in English. Never mix within a single content piece.

---

## Integration Points

| Consumer | What it uses | Import path |
|----------|-------------|-------------|
| `src/inngest/functions/agent-execute.ts` | `runAgentPipeline()`, `AgentJobInput` | `@/lib/agents` |
| `src/app/api/agents/run/route.ts` | `AgentConfig`, `checkDailyCap()`, `canAccess()` | `@/lib/agents`, `@/lib/feature-gate` |
| `src/app/(protected)/inbox/` | `InboxItem`, `AgentType` | `@/lib/types/shared` |
| `src/inngest/functions/automation-dispatcher.ts` | `AGENT_REGISTRY`, `AgentConfig` | `@/lib/agents` |
| `src/lib/suggestions/rules.ts` | `AgentType`, `Suggestion` | `@/lib/agents/types` |

---

## Error Types (`src/lib/agents/errors.ts`)

```typescript
export class AgentError extends Error {
  constructor(
    public agentType: AgentType,
    public stage: PipelineStage,
    public jobId: string,
    message: string,
    public retryable: boolean = false
  ) { super(message); }
}

export class QAFailedError extends AgentError {
  constructor(agentType: AgentType, jobId: string, public qaResult: QAResult) {
    super(agentType, 'qa', jobId, 'QA gate failed after retry', false);
  }
}

export class PageLockedError extends AgentError {
  constructor(agentType: AgentType, jobId: string, public lockedUrl: string) {
    super(agentType, 'plan', jobId, `Page locked: ${lockedUrl}`, true);
  }
}

export class CapExceededError extends AgentError {
  constructor(agentType: AgentType, jobId: string, public capStatus: DailyCapStatus) {
    super(agentType, 'plan', jobId, 'Daily cap exceeded', false);
  }
}

export class InsufficientCreditsError extends AgentError {
  constructor(agentType: AgentType, jobId: string) {
    super(agentType, 'plan', jobId, 'Insufficient credits', false);
  }
}
```

---

## Pre-Launch Evaluation Criteria

Before any agent ships, it must pass (see `07-AGENT-ROSTER-V2.md` §Pre-Launch Evaluation Criteria):

- 5 golden test cases per agent (distinct business profiles)
- 4/5 outputs rated publish-ready by human reviewer
- 100% of content outputs include at least one GEO signal (stats/citation/quote where applicable)
- QA gate catches generic output and flags for retry
- Engine-specific recommendations match documented citation patterns
- No AI disclosure language in any output
