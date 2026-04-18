/**
 * events.ts — Typed Inngest event payload definitions.
 *
 * Every event used in Beamix Inngest functions is defined here.
 * Import these types in both function definitions and callers.
 */

import type { AgentType } from '@/lib/agents/types';

// ─── Agent events ─────────────────────────────────────────────────────────

export interface AgentRunRequestedEvent {
  name: 'agent.run.requested';
  data: {
    jobId: string;
    agentType: AgentType;
    userId: string;
    businessId: string;
    planTier: 'discover' | 'build' | 'scale';
    targetUrl?: string;
    customInstructions?: string;
    sourceSuggestionId?: string;
    /** ISO timestamp when the job was enqueued. */
    enqueuedAt: string;
  };
}

export interface AgentRunCompletedEvent {
  name: 'agent.run.completed';
  data: {
    jobId: string;
    agentType: AgentType;
    userId: string;
    businessId: string;
    /** null = pipeline error, item still written as failed */
    inboxItemId: string | null;
    totalCostUsd: number;
    durationMs: number;
    completedAt: string;
  };
}

export interface AgentRunFailedEvent {
  name: 'agent.run.failed';
  data: {
    jobId: string;
    agentType: AgentType;
    userId: string;
    reason: string;
    failedAt: string;
  };
}

// ─── Scan events ──────────────────────────────────────────────────────────

export interface ScanStartedEvent {
  name: 'scan.started';
  data: {
    scanId: string;
    userId: string;
    businessId: string;
    engines: string[];
    startedAt: string;
  };
}

export interface ScanCompletedEvent {
  name: 'scan.completed';
  data: {
    scanId: string;
    userId: string;
    businessId: string;
    overallScore: number;
    previousScore: number | null;
    completedAt: string;
  };
}

// ─── Archive / publish events ─────────────────────────────────────────────

export interface ArchivePublishedEvent {
  name: 'archive.published';
  data: {
    archiveItemId: string;
    userId: string;
    businessId: string;
    /** The URL where the user says content was published. */
    publishedUrl: string | null;
    publishedAt: string;
  };
}

// ─── Billing / Paddle events ──────────────────────────────────────────────

export interface PaddleSubscriptionActivatedEvent {
  name: 'paddle.subscription.activated';
  data: {
    subscriptionId: string;
    userId: string;
    planTier: 'discover' | 'build' | 'scale';
    priceId: string;
    activatedAt: string;
  };
}

export interface PaddleSubscriptionCancelledEvent {
  name: 'paddle.subscription.cancelled';
  data: {
    subscriptionId: string;
    userId: string;
    planTier: 'discover' | 'build' | 'scale';
    cancelledAt: string;
  };
}

// ─── Budget events ────────────────────────────────────────────────────────

export interface BudgetAlertEvent {
  name: 'budget.alert';
  data: {
    userId: string;
    planTier: 'discover' | 'build' | 'scale';
    /** Percentage of monthly credit cap consumed: 75 or 100. */
    thresholdPercent: 75 | 100;
    runsUsed: number;
    runsCap: number;
    alertedAt: string;
  };
}

// ─── Union type for exhaustive handling ──────────────────────────────────

export type BeamixEvent =
  | AgentRunRequestedEvent
  | AgentRunCompletedEvent
  | AgentRunFailedEvent
  | ScanStartedEvent
  | ScanCompletedEvent
  | ArchivePublishedEvent
  | PaddleSubscriptionActivatedEvent
  | PaddleSubscriptionCancelledEvent
  | BudgetAlertEvent;

export type BeamixEventMap = {
  [E in BeamixEvent as E['name']]: E;
};
