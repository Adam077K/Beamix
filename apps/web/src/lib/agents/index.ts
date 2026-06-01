/**
 * Beamix Agent System — Public API
 *
 * The single import surface for everything outside `src/lib/agents/`. Consumers
 * (the Inngest `agent-execute` function, the `/api/agents/run` route, the suggestion
 * rules engine) import from `@/lib/agents` — never from a deep internal path.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §File Structure (`index.ts`) and §Integration Points.
 */

// ---- Pipeline orchestrator -------------------------------------------------
export { runAgentPipeline } from './pipeline/runner';
export type { AgentPipelineResult } from './pipeline/runner';
export { buildPipelineContext } from './pipeline/context';

// ---- Config: registry + model router --------------------------------------
export {
  AGENT_REGISTRY,
  getAgentConfig,
  isAgentAvailable,
  resolveArtifactType,
} from './config/registry';
export {
  MODEL_ROUTER,
  resolveModel,
  runtimeProvider,
  computeCostUsd,
  CITATION_VERIFICATION_AGENTS,
  CITATION_VERIFICATION_MODEL,
} from './config/models';

// ---- Credits + daily cap ---------------------------------------------------
export { holdCredits, confirmCredits, releaseCredits } from './credits/guard';
export {
  checkDailyCap,
  incrementDailyCap,
  getDailyCapStatus,
} from './credits/daily-cap';

// ---- Cross-agent coordination ---------------------------------------------
export { lockPage, unlockPage, isPageLocked } from './coordination/page-locks';
export {
  registerTopic,
  isTopicCovered,
  getCoveredTopics,
} from './coordination/topic-ledger';

// ---- Security: input guard -------------------------------------------------
export {
  wrapUserData,
  wrapTargetContent,
  sanitizeBusinessName,
  sanitizeScanUrl,
  sanitizeCustomInstructions,
  withAgentContext,
  USER_DATA_SYSTEM_RULE,
} from './security/input-guard';

// ---- Errors ----------------------------------------------------------------
export {
  AgentError,
  QAFailedError,
  PageLockedError,
  CapExceededError,
  InsufficientCreditsError,
  LLMProviderError,
  TopicAlreadyCoveredError,
  UnsafeInputError,
} from './errors';

// ---- Digest-Writer agent (W2.2) -------------------------------------------
export {
  runDigestWriter,
  DIGEST_WRITER_SYSTEM_PROMPT,
  DigestInputSchema,
  DigestPayloadSchema,
  DigestWriterValidationError,
} from './digest-writer';
export type {
  DigestInput,
  DigestPayload,
  DigestWin,
  DigestApproval,
  DigestCustomerTier,
  DigestDeliverableType,
} from './digest-writer';

// ---- Types -----------------------------------------------------------------
export type {
  PlanTier,
  AgentType,
  PipelineStage,
  CreditCost,
  AgentConfig,
  AgentJobInput,
  AgentJobOutput,
  AgentPipelineContext,
  BusinessContext,
  ScanResult,
  EngineResult,
  QueryPosition,
  QueryIntelligenceData,
  CompetitorData,
  GEOSignalChecklist,
  QAResult,
  CitationVerificationResult,
  CostEntry,
  InboxItem,
  Suggestion,
  NotificationItem,
  DailyCapStatus,
} from './types';
