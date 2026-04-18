/**
 * shared.ts — Domain types used by both backend and frontend.
 *
 * Pure TypeScript interfaces only (no Zod here).
 * Source of truth: docs/product-rethink-2026-04-09/
 */

import type { AgentType, PlanTier, AgentJobInput, AgentJobOutput } from '../agents/types';

// ─── Re-exports from agents/types ─────────────────────────────────────────

export type { PlanTier, AgentType, AgentJobInput, AgentJobOutput } from '../agents/types';

// ─── Suggestions feed ─────────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  userId: string;
  businessId: string;
  scanId: string | null;
  agentType: AgentType;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedRuns: number;
  status: 'pending' | 'accepted' | 'dismissed' | 'expired' | 'running' | 'completed';
  triggerRule: string | null;
  evidence: Record<string, unknown>;
  targetQueryIds: string[];
  targetUrl: string | null;
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

// ─── Inbox ────────────────────────────────────────────────────────────────

export interface InboxItem {
  id: string;
  userId: string;
  jobId: string;
  agentType: AgentType;
  /** User-facing label, e.g. "Optimize your homepage". Never exposes agent names. */
  actionLabel: string;
  title: string;
  previewMarkdown: string;
  fullMarkdown: string;
  targetUrl: string | null;
  evidence: InboxEvidence;
  status: 'draft' | 'awaiting_review' | 'approved' | 'rejected' | 'archived';
  ymylFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InboxEvidence {
  /** Which suggestion or event fired this inbox item. */
  triggerSource: string;
  targetQueries: string[];
  citations: Citation[];
  impactEstimate: string;
}

export interface Citation {
  url: string;
  title: string;
  excerpt: string;
  verified: boolean;
}

// ─── Scans ────────────────────────────────────────────────────────────────

export interface ScanSummary {
  id: string;
  userId: string;
  businessId: string;
  startedAt: string;
  completedAt: string | null;
  status: 'running' | 'completed' | 'failed';
  /** Visibility score 0-100, null while running. */
  score: number | null;
  scoreDelta: number | null;
  enginesSucceeded: number;
  enginesTotal: number;
}

/** Full scan result including engine-level and query-level breakdowns. */
export interface ScanResultFull extends ScanSummary {
  engineResults: ScanEngineResult[];
  queryPositions: ScanQueryPosition[];
  topCompetitors: Competitor[];
}

export interface ScanEngineResult {
  /** e.g. 'chatgpt' | 'gemini' | 'perplexity' | 'claude' */
  engine: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  mentionedCount: number;
  totalQueries: number;
  avgRankPosition: number | null;
}

export interface ScanQueryPosition {
  trackedQueryId: string;
  queryText: string;
  engine: string;
  isMentioned: boolean;
  rankPosition: number | null;
  snippet: string | null;
}

// ─── Competitors ──────────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  name: string;
  url: string;
  /** Share of AI search results where this competitor appears: 0-1. */
  appearanceRate: number;
  queriesWhereAppears: string[];
  /** Weekly mention counts (last 4 weeks), oldest-first. */
  fourWeekTrend: number[];
}

// ─── Automation ───────────────────────────────────────────────────────────

export interface AutomationSchedule {
  id: string;
  userId: string;
  agentType: AgentType;
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextRunAt: string;
  lastRunAt: string | null;
  isPaused: boolean;
  createdAt: string;
}

export interface AutomationStatus {
  globalKillSwitch: boolean;
  creditsUsedThisMonth: number;
  creditsCapThisMonth: number;
  creditsUsedPercent: number;
  schedules: AutomationSchedule[];
}

// ─── Archive ──────────────────────────────────────────────────────────────

export interface ArchiveItem {
  id: string;
  inboxItemId: string;
  userId: string;
  agentType: AgentType;
  /** User-facing label, mirrors InboxItem.actionLabel. */
  actionLabel: string;
  targetUrl: string | null;
  approvedAt: string;
  publishedAt: string | null;
  verificationStatus: 'pending' | 'verified' | 'unverified';
  estimatedImpact: string;
  formats: Array<'markdown' | 'html' | 'json_ld'>;
}

// ─── Notifications ────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type:
    | 'item_ready'
    | 'scan_complete'
    | 'budget_75'
    | 'budget_100'
    | 'competitor_alert'
    | 'payment_failed';
  title: string;
  body: string | null;
  actionUrl: string | null;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

// ─── Credits / caps ───────────────────────────────────────────────────────

export interface CreditBalance {
  runsUsedThisMonth: number;
  runsCapThisMonth: number;
  rolloverAmount: number;
  topupAmount: number;
  planTier: PlanTier;
}

export interface DailyCapStatus {
  agentType: AgentType;
  used: number;
  /** null = unlimited (no daily cap on this tier). */
  cap: number | null;
  /** ISO string for midnight UTC when the counter resets. */
  resetsAt: string;
}

// ─── Business context + user ──────────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  url: string;
  industry: string | null;
  location: string | null;
  /** Competitor URLs. */
  competitors: string[];
  services: string[];
}

export interface AppUser {
  id: string;
  email: string;
  planTier: PlanTier | null;
  onboardingCompletedAt: string | null;
}
