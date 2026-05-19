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

// ─── War-room / observability events (WS4) ───────────────────────────────

/** Fired by Supabase webhook → Inngest when an audit_log row is inserted. */
export interface AuditLogInsertedEvent {
  name: 'war-room/audit-log.inserted';
  data: {
    id: string;
    agent: string;
    status: string;
    cost_usd: number | null;
    linear_ticket: string | null;
    fan_in_key: string | null;
    nonce: string | null;
    ts: string;
  };
}

/** Fired when a Linear issue is updated — used by fan-in-watcher. */
export interface LinearIssueUpdatedEvent {
  name: 'linear/issue.updated';
  data: {
    issue_id: string;
    status: string;
    fan_in_key: string | null;
    session_id: string | null;
    /** The ticket identifier, e.g. "BMX-101". */
    identifier: string;
    parent_issue_id: string | null;
    comment_body: string | null;
    updated_at: string;
  };
}

/** Fired when a Routine is dispatched — used by routine-timeout-watcher. */
export interface RoutineFiredEvent {
  name: 'war-room/routine.fired';
  data: {
    routine_id: string;
    routine_name: string;
    audit_log_id: string;
    linear_ticket: string | null;
    max_runtime_minutes: number;
    fired_at: string;
  };
}

/** Fired when a parent ticket dispatches sub-tickets — for expiry watcher. */
export interface ParentTicketDispatchedEvent {
  name: 'war-room/parent-ticket.dispatched';
  data: {
    parent_ticket: string;
    fan_in_key: string;
    sub_ticket_count: number;
    dispatched_at: string;
  };
}

/** Fired by git push webhook — filtered by file path in each embed function. */
export interface GitPushEvent {
  name: 'git/push';
  data: {
    ref: string;
    /**
     * Paths of changed files in this push.
     * R7 fix: renamed from changed_files → changed_paths.
     * Matches GitHub webhook conventions (commits[].added/modified/removed)
     * and all 5 embed reader functions which read event.data.changed_paths.
     */
    changed_paths: string[];
    commit_sha: string;
    pushed_at: string;
    /** True if this push is a PR merge to main. */
    is_pr_merge: boolean;
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
  | BudgetAlertEvent
  | AuditLogInsertedEvent
  | LinearIssueUpdatedEvent
  | RoutineFiredEvent
  | ParentTicketDispatchedEvent
  | GitPushEvent;

export type BeamixEventMap = {
  [E in BeamixEvent as E['name']]: E;
};
