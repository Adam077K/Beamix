/**
 * types.ts — Full type contracts for the Beamix agent system.
 *
 * Source of truth: docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md
 */

// ─── Plan tiers ────────────────────────────────────────────────────────────

export type PlanTier = 'discover' | 'build' | 'scale';

// ─── Agent identifiers (11 MVP-1 + 1 MVP-2) ────────────────────────────────

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
  | 'reddit_presence_planner'
  | 'video_seo_agent'; // MVP-2

export type AgentPriorityTier = 'deep-6' | 'lighter-5';

// ─── Pipeline stages ───────────────────────────────────────────────────────

export type PipelineStep = 'plan' | 'research' | 'do' | 'qa' | 'summarize';

// Alias kept for spec parity.
export type PipelineStage = PipelineStep;

// ─── Model choices ─────────────────────────────────────────────────────────

export type ClaudeModel =
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5'
  | 'claude-opus-4-6';

export type GeminiModel = 'gemini-2-0-flash' | 'gemini-2-5-pro';

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-5-mini';

export type PerplexityModel = 'sonar' | 'sonar-pro' | 'sonar-online';

export type ModelChoice =
  | ClaudeModel
  | GeminiModel
  | OpenAIModel
  | PerplexityModel;

export type ModelProvider = 'anthropic' | 'openrouter' | 'perplexity';

// ─── Credit + cap config ───────────────────────────────────────────────────

export type CreditCost = 0 | 1 | 2 | 3;

export type DailyCapByTier = Record<PlanTier, number | null>;

export interface AgentConfig {
  type: AgentType;
  /** Internal name. Never shown to end users. */
  displayName: string;
  /** User-facing label ("Optimize your homepage"). Never exposes agent names. */
  actionLabel: string;
  description: string;
  creditCost: CreditCost;
  /** true iff creditCost === 0 */
  isFree: boolean;
  /** null per tier = uses monthly credit pool (no daily cap). */
  dailyCapByTier: DailyCapByTier;
  availableOnTiers: PlanTier[];
  /** 5-step for credit-gated, 3-step for free. */
  steps: PipelineStep[];
  stepModels: Partial<Record<PipelineStep, ModelChoice>>;
  requiresPageLock: boolean;
  requiresTopicLedger: boolean;
  ymylRisk: 'low' | 'medium' | 'high';
  priorityTier: AgentPriorityTier;
  /** Rough $/run budget for monitoring. */
  estimatedCostUsd: number;
}

// ─── Input / output ────────────────────────────────────────────────────────

export interface AgentJobInput {
  jobId: string;
  agentType: AgentType;
  userId: string;
  businessId: string;
  planTier: PlanTier;
  targetUrl?: string;
  targetContent?: string;
  queryCluster?: string[];
  /** Free-form user override. Truncated to 500 chars and XML-escaped. */
  customInstructions?: string;
  scanId?: string;
}

export type ContentFormat =
  | 'markdown'
  | 'html'
  | 'json_ld'
  | 'structured_report'
  | 'plain_text';

export interface GEOSignalChecklist {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasExpertQuotes: boolean;
  hasFreshData: boolean;
  hasLocalContext: boolean;
}

export interface AgentJobOutput {
  jobId: string;
  agentType: AgentType;
  primaryContent: string;
  contentFormat: ContentFormat;
  summaryText: string;
  targetQueries: string[];
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  ymylRefused: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  costEntries: CostEntry[];
  totalCostUsd: number;
  durationMs: number;
}

// ─── QA ────────────────────────────────────────────────────────────────────

export interface CitationCheck {
  claim: string;
  verified: boolean;
  source?: string;
}

export interface QAResult {
  pass: boolean;
  issues: string[];
  geoSignals: GEOSignalChecklist;
  ymylFlagged: boolean;
  citationsVerified: CitationCheck[];
  retryRecommended: boolean;
  costEntries: CostEntry[];
}

// ─── Cost tracking ─────────────────────────────────────────────────────────

export interface CostEntry {
  step: PipelineStep | 'qa-citation';
  model: ModelChoice;
  provider: ModelProvider;
  promptTokens: number;
  completionTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  costUsd: number;
}

// ─── Business + scan context ───────────────────────────────────────────────

export interface BusinessContext {
  businessId: string;
  name: string;
  industry: string;
  location: string;
  services: string[];
  scanUrl: string;
  /** true when business falls into a YMYL category (medical, legal, finance). */
  ymylCategory: boolean;
  language: 'he' | 'en';
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

export interface ScanResult {
  scanId: string;
  completedAt: string;
  overallScore: number;
  engineResults: EngineResult[];
  queryPositions: QueryPosition[];
}

export interface CompetitorData {
  name: string;
  url: string;
  sharedQueries: string[];
}

export interface QueryIntelligenceData {
  queries: Array<{
    targetText: string;
    scanText: string;
    cluster: string;
  }>;
}

// ─── Pipeline context + coordination ───────────────────────────────────────

export interface UserContext {
  userId: string;
  email: string;
}

export interface BudgetContext {
  monthlyPriceUsd: number;
  allowedMaxCostUsd: number; // 15% of monthly price (cost circuit breaker)
  spentSoFarUsd: number;
}

export interface PageLockHandle {
  acquired: boolean;
  url: string;
  releasedAt?: string;
}

export interface PageLocks {
  acquire(url: string, jobId: string, agentType: AgentType): Promise<boolean>;
  release(url: string, jobId: string): Promise<void>;
  isLocked(url: string): Promise<boolean>;
}

export interface TopicLedger {
  check(businessId: string, topic: string): Promise<boolean>;
  register(
    businessId: string,
    topic: string,
    agentType: AgentType,
    jobId: string,
    contentItemId?: string | null
  ): Promise<void>;
  list(businessId: string): Promise<string[]>;
}

export interface DailyCapGuardApi {
  check(
    userId: string,
    agentType: AgentType,
    tier: PlanTier
  ): Promise<{ allowed: boolean; remaining: number; cap: number | null }>;
  increment(userId: string, agentType: AgentType): Promise<void>;
}

export interface AgentPipelineContext {
  input: AgentJobInput;
  config: AgentConfig;
  user: UserContext;
  business: BusinessContext;
  plan: PlanTier;
  scanData?: ScanResult;
  competitorData?: CompetitorData[];
  queryIntelligence?: QueryIntelligenceData;
  budget: BudgetContext;
  locks: {
    pageLocks: PageLocks;
    topicLedger: TopicLedger;
    dailyCapGuard: DailyCapGuardApi;
  };
}

// ─── LLM router primitives ─────────────────────────────────────────────────

export type MessageRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: MessageRole;
  content: string;
  /** Enable Anthropic prompt caching for this block. */
  cache?: boolean;
}

export interface LLMCallParams {
  model: ModelChoice;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Enable Anthropic prompt caching on the system prompt. Default true for Claude. */
  cache?: boolean;
  /** Agent step the call is attributed to (for cost logging). */
  step?: PipelineStep | 'qa-citation';
  jobId?: string;
  /**
   * Which OpenRouter key to use. 'scan' → OPENROUTER_SCAN_KEY, 'agent' → OPENROUTER_AGENT_KEY.
   * Defaults to 'agent'. Always pass 'scan' from the scan engine to track spend separately.
   */
  keyContext?: 'scan' | 'agent';
}

export interface LLMResponse {
  content: string;
  model: ModelChoice;
  provider: ModelProvider;
  stopReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    cacheReadTokens?: number;
    cacheCreationTokens?: number;
  };
  costUsd: number;
  costEntry: CostEntry;
  rawProviderResponse?: unknown;
}

// ─── YMYL refuse payload ───────────────────────────────────────────────────

export interface YmylRefusePayload {
  refused: true;
  reason: 'medical_diagnosis' | 'legal_advice' | 'investment_advice' | 'regulated_topic';
  explanation: string;
  suggestion?: string;
}

// ─── Circuit breaker ───────────────────────────────────────────────────────

export interface CircuitBreakerDecision {
  abort: boolean;
  reason?: string;
  estimatedCostUsd: number;
  cap: number;
}
