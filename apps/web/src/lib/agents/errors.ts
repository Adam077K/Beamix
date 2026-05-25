/**
 * Beamix Agent System — Error Types
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Error Types. Every pipeline failure surfaces as one of
 * these typed errors so callers (Inngest function, API route) can branch deterministically.
 */

import type { AgentType, PipelineStage, QAResult, DailyCapStatus } from './types';

/** Base error for every agent pipeline failure. */
export class AgentError extends Error {
  public readonly agentType: AgentType;
  public readonly stage: PipelineStage;
  public readonly jobId: string;
  public readonly retryable: boolean;

  constructor(
    agentType: AgentType,
    stage: PipelineStage,
    jobId: string,
    message: string,
    retryable = false,
  ) {
    super(message);
    this.name = 'AgentError';
    this.agentType = agentType;
    this.stage = stage;
    this.jobId = jobId;
    this.retryable = retryable;
    Object.setPrototypeOf(this, AgentError.prototype);
  }
}

/** QA gate failed after the single allowed retry. Not retryable — surfaces to the user. */
export class QAFailedError extends AgentError {
  public readonly qaResult: QAResult;

  constructor(agentType: AgentType, jobId: string, qaResult: QAResult) {
    super(agentType, 'qa', jobId, 'QA gate failed after retry', false);
    this.name = 'QAFailedError';
    this.qaResult = qaResult;
    Object.setPrototypeOf(this, QAFailedError.prototype);
  }
}

/** The target URL is already locked by another in-flight agent job. Retryable. */
export class PageLockedError extends AgentError {
  public readonly lockedUrl: string;

  constructor(agentType: AgentType, jobId: string, lockedUrl: string) {
    super(agentType, 'plan', jobId, `Page locked: ${lockedUrl}`, true);
    this.name = 'PageLockedError';
    this.lockedUrl = lockedUrl;
    Object.setPrototypeOf(this, PageLockedError.prototype);
  }
}

/** The user has hit the daily cap for this free agent. Not retryable today. */
export class CapExceededError extends AgentError {
  public readonly capStatus: DailyCapStatus;

  constructor(agentType: AgentType, jobId: string, capStatus: DailyCapStatus) {
    super(agentType, 'plan', jobId, 'Daily cap exceeded', false);
    this.name = 'CapExceededError';
    this.capStatus = capStatus;
    Object.setPrototypeOf(this, CapExceededError.prototype);
  }
}

/** The user does not have enough AI Runs in their credit pool. Not retryable. */
export class InsufficientCreditsError extends AgentError {
  constructor(agentType: AgentType, jobId: string) {
    super(agentType, 'plan', jobId, 'Insufficient credits', false);
    this.name = 'InsufficientCreditsError';
    Object.setPrototypeOf(this, InsufficientCreditsError.prototype);
  }
}

/**
 * An LLM provider call failed. `retryable` is `true` for rate-limit (429) and
 * overload (529 / 503) responses so the Inngest step layer can back off and retry.
 */
export class LLMProviderError extends AgentError {
  public readonly statusCode?: number;
  public readonly provider: string;

  constructor(
    agentType: AgentType,
    stage: PipelineStage,
    jobId: string,
    provider: string,
    message: string,
    statusCode?: number,
  ) {
    const retryable = statusCode === 429 || statusCode === 529 || statusCode === 503;
    super(agentType, stage, jobId, `LLM provider error (${provider}): ${message}`, retryable);
    this.name = 'LLMProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LLMProviderError.prototype);
  }
}

/** A topic the agent intended to produce is already covered in the topic ledger. */
export class TopicAlreadyCoveredError extends AgentError {
  public readonly topic: string;

  constructor(agentType: AgentType, jobId: string, topic: string) {
    super(agentType, 'plan', jobId, `Topic already covered: ${topic}`, false);
    this.name = 'TopicAlreadyCoveredError';
    this.topic = topic;
    Object.setPrototypeOf(this, TopicAlreadyCoveredError.prototype);
  }
}

/** A user-supplied input failed the prompt-injection / sanitization guard. */
export class UnsafeInputError extends AgentError {
  public readonly field: string;

  constructor(agentType: AgentType, jobId: string, field: string, reason: string) {
    super(agentType, 'plan', jobId, `Unsafe input in "${field}": ${reason}`, false);
    this.name = 'UnsafeInputError';
    this.field = field;
    Object.setPrototypeOf(this, UnsafeInputError.prototype);
  }
}
