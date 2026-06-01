/**
 * Beamix Agent System — Type Contract
 *
 * Single-authored by Worker 2 (ai-engineer) per `12-AGENT-BUILD-SPEC.md` §TypeScript Types.
 * Wave 0.5 re-exports `InboxItem`, `Suggestion`, and `NotificationItem` from
 * `apps/web/src/lib/types/shared.ts` — it does NOT redefine them here.
 *
 * Every interface below mirrors a column shape in `apps/web/src/lib/db/database.types.ts`
 * (the DB contract committed by Worker 1 on `feat/db-foundation`).
 */

// ---------------------------------------------------------------------------
// 1. PlanTier — billing tiers (matches DB enum `plan_tier`)
// ---------------------------------------------------------------------------
export type PlanTier = 'discover' | 'build' | 'scale';

// ---------------------------------------------------------------------------
// 2. AgentType — the 11 MVP-1 agent identifiers (matches DB enum `agent_type`)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 3. PipelineStage — the 5 pipeline stages (matches DB enum `pipeline_stage`)
// ---------------------------------------------------------------------------
export type PipelineStage = 'plan' | 'research' | 'do' | 'qa' | 'summarize';

// ---------------------------------------------------------------------------
// 4. CreditCost — credit cost per agent run
// ---------------------------------------------------------------------------
export type CreditCost = 0 | 1 | 2 | 3;

// ---------------------------------------------------------------------------
// 5. AgentConfig — one entry per agent in `config/registry.ts`
// ---------------------------------------------------------------------------
export interface AgentConfig {
  agentType: AgentType;
  displayName: string;
  /** 0 = free (daily-capped), 1–3 = paid runs that consume AI Runs from the tier allocation. */
  creditCost: CreditCost;
  /** true if creditCost === 0. */
  isFree: boolean;
  /** Per-tier daily cap. `null` = unlimited. */
  dailyCap: Record<PlanTier, number | null>;
  availableOnTiers: PlanTier[];
  /** Free agents run `['plan', 'do', 'qa']`; credit-gated agents run all 5 stages. */
  stages: PipelineStage[];
  /** true for Content Optimizer, Freshness Agent, Authority Blog Strategist. */
  requiresPageLock: boolean;
  /** true for Authority Blog Strategist, FAQ Builder. */
  requiresTopicLedger: boolean;
  ymylRisk: 'low' | 'medium' | 'high';
  /**
   * true if the agent's output must go through the approval gate before publishing.
   * Gated = content publish, outreach, email-as-them.
   * Auto = schema, citations, listings, internal reports.
   * Per docs/03-system-design/ARCHITECTURE.md §Gating Rules (A3).
   */
  requiresApproval: boolean;
}

// ---------------------------------------------------------------------------
// 6. AgentJobInput — input to the pipeline runner
// ---------------------------------------------------------------------------
export interface AgentJobInput {
  /** `agent_jobs.id` from the DB. */
  jobId: string;
  agentType: AgentType;
  userId: string;
  businessId: string;
  planTier: PlanTier;
  /** For page-level agents (Content Optimizer, Freshness Agent). */
  targetUrl?: string;
  /** Pasted content if no URL is supplied. */
  targetContent?: string;
  /** From Query Mapper output. */
  queryCluster?: string[];
  /** User override supplied at job creation time. */
  customInstructions?: string;
  /** Linked scan that supplies engine context. */
  scanId?: string;
}

// ---------------------------------------------------------------------------
// 7. GEOSignalChecklist — QA stage validates these
// ---------------------------------------------------------------------------
export interface GEOSignalChecklist {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasExpertQuotes: boolean;
  /** Content references data < 90 days old. */
  hasFreshData: boolean;
  /** Mentions the location if the business is local. */
  hasLocalContext: boolean;
}

// ---------------------------------------------------------------------------
// 8. CostEntry — cost tracking per LLM call
// ---------------------------------------------------------------------------
export interface CostEntry {
  stage: PipelineStage;
  /** Full model ID, e.g. `claude-sonnet-4-6` or `perplexity/sonar-pro`. */
  model: string;
  provider: 'anthropic' | 'openrouter' | 'perplexity';
  promptTokens: number;
  completionTokens: number;
  /** Anthropic prompt-cache read tokens (billed at 10% of input). 0 for non-Anthropic. */
  cacheReadTokens: number;
  /** Anthropic prompt-cache write tokens (billed at 125% of input). 0 for non-Anthropic. */
  cacheWriteTokens: number;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// 9. AgentJobOutput — output from the full pipeline
// ---------------------------------------------------------------------------
export interface AgentJobOutput {
  jobId: string;
  agentType: AgentType;
  /** The main deliverable. */
  primaryContent: string;
  contentFormat: 'markdown' | 'html' | 'json_ld' | 'structured_report' | 'plain_text';
  /** 2–3 sentence summary for the Inbox card. */
  summaryText: string;
  /** Queries this content targets. */
  targetQueries: string[];
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  /** One entry per LLM call made across all stages. */
  costEntries: CostEntry[];
  totalCostUsd: number;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// 10. BusinessContext — business profile injected into every prompt
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 11. EngineResult — per-engine scan result row
// ---------------------------------------------------------------------------
export interface EngineResult {
  engine: string;
  isMentioned: boolean;
  rankPosition: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  brandsMentioned: string[];
}

// ---------------------------------------------------------------------------
// 12. QueryPosition — per-query, per-engine ranking position
// ---------------------------------------------------------------------------
export interface QueryPosition {
  queryText: string;
  engine: string;
  position: number | null;
  isMentioned: boolean;
  competitorsMentioned: string[];
}

// ---------------------------------------------------------------------------
// 13. ScanResult — scan data available to the pipeline
// ---------------------------------------------------------------------------
export interface ScanResult {
  scanId: string;
  completedAt: string;
  overallScore: number;
  engineResults: EngineResult[];
  queryPositions: QueryPosition[];
}

// ---------------------------------------------------------------------------
// 14. QueryIntelligenceData — F4: injected into PLAN/RESEARCH for content agents
// ---------------------------------------------------------------------------
export interface QueryIntelligenceData {
  /** Top 10 by volume × intent. */
  topQueries: string[];
  /** Queries where competitors appear. */
  competitorOverlapQueries: string[];
  /** Queries with a low brand-mention rate. */
  underServedQueries: string[];
  /** query → days-since-content-update. */
  freshnessScores: Record<string, number>;
}

/**
 * CompetitorData — F5: canonically defined in `apps/web/src/lib/types/shared.ts` (Wave 0.5).
 * The agent system only consumes it; this minimal shape is the structural contract used
 * inside `AgentPipelineContext` until Wave 0.5 publishes the canonical definition.
 */
export interface CompetitorData {
  competitorId: string;
  name: string;
  domain: string;
  mentionRate: number;
  topQueries: string[];
}

// ---------------------------------------------------------------------------
// 15. AgentPipelineContext — context assembled before the pipeline starts
// ---------------------------------------------------------------------------
export interface AgentPipelineContext {
  input: AgentJobInput;
  config: AgentConfig;
  business: BusinessContext;
  scanData?: ScanResult;
  competitorData?: CompetitorData[];
  queryIntelligence?: QueryIntelligenceData;
  /** Set after credits are held — equal to `input.jobId` per the credit system. */
  holdId?: string;
}

// ---------------------------------------------------------------------------
// 16. QAResult — QA stage result
// ---------------------------------------------------------------------------
export interface QAResult {
  passed: boolean;
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  /** Human-readable issues if QA failed. */
  issues: string[];
  retryRecommended: boolean;
  /** Perplexity Sonar citation-verification result for content-publishing agents. */
  citationVerification?: CitationVerificationResult;
}

/**
 * Perplexity Sonar citation-verification result. Populated by the QA stage for
 * Content Optimizer, Authority Blog Strategist, and FAQ Builder.
 */
export interface CitationVerificationResult {
  verified: boolean;
  /** Citations the Sonar probe could not corroborate against a live source. */
  unverifiedClaims: string[];
  checkedClaimCount: number;
}

// ---------------------------------------------------------------------------
// 17. InboxItem — Inbox card shape (domain-wide; Wave 0.5 re-exports)
// ---------------------------------------------------------------------------
export interface InboxItem {
  id: string;
  agentType: AgentType;
  /** Matches DB enum `inbox_status`. F1 — includes `failed`. */
  status: 'draft' | 'review' | 'approved' | 'archived' | 'rejected' | 'failed';
  title: string;
  summaryText: string;
  primaryContent: string;
  contentFormat: AgentJobOutput['contentFormat'];
  targetQueries: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  ymylFlagged: boolean;
  geoSignals: GEOSignalChecklist;
  /** Human-readable: "FAQ content was 45 days old". */
  triggerReason: string;
  createdAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  /** F6 — `ArchiveItem.verificationStatus` (Wave 0.5) MUST reuse these 4 values. */
  verificationStatus: 'none' | 'pending_probe' | 'verified' | 'unverified';
}

// ---------------------------------------------------------------------------
// 18. Suggestion — from the rules-engine output (domain-wide; Wave 0.5 re-exports)
// ---------------------------------------------------------------------------
export interface Suggestion {
  id: string;
  agentType: AgentType;
  title: string;
  description: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  /** Which rule triggered this suggestion. */
  ruleId: string;
  creditCost: CreditCost;
  /** Matches DB enum `suggestion_status`. F2 — includes `converted`. */
  status: 'pending' | 'running' | 'dismissed' | 'converted';
  createdAt: string;
}

// ---------------------------------------------------------------------------
// 19. NotificationItem — in-app notification center (domain-wide; Wave 0.5 re-exports)
// ---------------------------------------------------------------------------
export interface NotificationItem {
  id: string;
  userId: string;
  /** Matches DB enum `notification_type`. F3 — includes `day1_ready`, `run_failed`. */
  type:
    | 'item_ready'
    | 'scan_complete'
    | 'budget_75'
    | 'budget_100'
    | 'competitor_alert'
    | 'suggestion_generated'
    | 'day1_ready'
    | 'run_failed';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  /** e.g. `/inbox?item=abc`. */
  linkPath?: string;
}

// ---------------------------------------------------------------------------
// DailyCapStatus — daily cap status (referenced by CapExceededError + middleware)
// ---------------------------------------------------------------------------
export interface DailyCapStatus {
  agentType: AgentType;
  planTier: PlanTier;
  usedToday: number;
  /** `null` = unlimited. */
  cap: number | null;
  capReached: boolean;
}
