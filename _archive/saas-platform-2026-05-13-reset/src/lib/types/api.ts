/**
 * api.ts — Zod request/response schemas for all Wave 1 API routes.
 *
 * Frontend parses responses against these schemas.
 * Backend validates incoming requests against these schemas.
 *
 * Uses Zod v4 syntax. NO `any` types — use `z.unknown()` for dynamic values.
 */

import { z } from 'zod';

// Keep type-only imports for JSDoc/type usage — never leak into runtime bundle.
import type {
  Suggestion,
  InboxItem,
  ScanResultFull,
  ScanSummary,
  AutomationStatus,
  AutomationSchedule,
  ArchiveItem,
  NotificationItem,
  CreditBalance,
  DailyCapStatus,
  AppUser,
  BusinessProfile,
  Competitor,
} from './shared';
import type { PlanTier } from '../agents/types';

// Silence unused-import warnings for the type-only imports above.
// These are intentional — they keep IDE autocompletion accurate.
export type {
  Suggestion,
  InboxItem,
  ScanResultFull,
  ScanSummary,
  AutomationStatus,
  AutomationSchedule,
  ArchiveItem,
  NotificationItem,
  CreditBalance,
  DailyCapStatus,
  AppUser,
  BusinessProfile,
  Competitor,
  PlanTier,
};

// ─── Common primitives ────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();
export const IsoDateSchema = z.string().datetime();
export const PlanTierSchema = z.enum(['discover', 'build', 'scale']);
export const AgentTypeSchema = z.enum([
  'query_mapper',
  'content_optimizer',
  'freshness_agent',
  'faq_builder',
  'schema_generator',
  'offsite_presence_builder',
  'review_presence_planner',
  'entity_builder',
  'authority_blog_strategist',
  'performance_tracker',
  'reddit_presence_planner',
  'video_seo_agent',
]);

// ─── Agents ───────────────────────────────────────────────────────────────

export const AgentRunRequestSchema = z.object({
  agentType: AgentTypeSchema,
  businessId: UuidSchema,
  targetUrl: z.string().url().optional(),
  customInstructions: z.string().max(500).optional(),
  sourceSuggestionId: UuidSchema.optional(),
});
export type AgentRunRequest = z.infer<typeof AgentRunRequestSchema>;

export const AgentRunResponseSchema = z.object({
  jobId: UuidSchema,
  status: z.enum(['queued', 'running']),
  estimatedCreditsCost: z.number().int().min(0),
  estimatedCompletionAt: IsoDateSchema,
});
export type AgentRunResponse = z.infer<typeof AgentRunResponseSchema>;

export const AgentCancelRequestSchema = z.object({ jobId: UuidSchema });
export type AgentCancelRequest = z.infer<typeof AgentCancelRequestSchema>;

// ─── Suggestions ──────────────────────────────────────────────────────────

export const SuggestionsListQuerySchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'dismissed', 'expired', 'running', 'completed'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SuggestionsListQuery = z.infer<typeof SuggestionsListQuerySchema>;

export const SuggestionDismissRequestSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type SuggestionDismissRequest = z.infer<typeof SuggestionDismissRequestSchema>;

// ─── Scans ────────────────────────────────────────────────────────────────

export const ScanStartRequestSchema = z.object({
  businessId: UuidSchema,
  /** Specific engine keys to scan; defaults to the user's tier engine set. */
  engines: z.array(z.string()).optional(),
});
export type ScanStartRequest = z.infer<typeof ScanStartRequestSchema>;

export const ScanStartResponseSchema = z.object({
  scanId: UuidSchema,
  status: z.literal('queued'),
  estimatedCompletionAt: IsoDateSchema,
});
export type ScanStartResponse = z.infer<typeof ScanStartResponseSchema>;

// ─── Automation ───────────────────────────────────────────────────────────

export const AutomationScheduleUpsertSchema = z.object({
  agentType: AgentTypeSchema,
  cadence: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  isPaused: z.boolean().default(false),
});
export type AutomationScheduleUpsert = z.infer<typeof AutomationScheduleUpsertSchema>;

export const KillSwitchToggleSchema = z.object({ enabled: z.boolean() });
export type KillSwitchToggle = z.infer<typeof KillSwitchToggleSchema>;

// ─── Inbox ────────────────────────────────────────────────────────────────

export const InboxListQuerySchema = z.object({
  status: z
    .enum(['draft', 'awaiting_review', 'approved', 'rejected', 'archived'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});
export type InboxListQuery = z.infer<typeof InboxListQuerySchema>;

export const InboxItemActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'archive']),
  comment: z.string().max(500).optional(),
});
export type InboxItemAction = z.infer<typeof InboxItemActionSchema>;

export const InboxEditSchema = z.object({
  selectedText: z.string().min(1).max(2000),
  prompt: z.string().min(1).max(500),
});
export type InboxEdit = z.infer<typeof InboxEditSchema>;

// ─── Archive ──────────────────────────────────────────────────────────────

export const ArchivePublishRequestSchema = z.object({
  publishedUrl: z.string().url().optional(),
});
export type ArchivePublishRequest = z.infer<typeof ArchivePublishRequestSchema>;

// ─── Billing ──────────────────────────────────────────────────────────────

export const CheckoutRequestSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url().optional(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

export const PortalRequestSchema = z.object({});
export type PortalRequest = z.infer<typeof PortalRequestSchema>;

export const PortalResponseSchema = z.object({
  portalUrl: z.string().url(),
});
export type PortalResponse = z.infer<typeof PortalResponseSchema>;

// ─── Paddle webhook ───────────────────────────────────────────────────────

export const PaddleWebhookEventSchema = z.object({
  event_type: z.string(),
  event_id: z.string(),
  occurred_at: IsoDateSchema,
  data: z.record(z.string(), z.unknown()),
});
export type PaddleWebhookEvent = z.infer<typeof PaddleWebhookEventSchema>;

// ─── Notifications ────────────────────────────────────────────────────────

export const NotificationsListQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});
export type NotificationsListQuery = z.infer<typeof NotificationsListQuerySchema>;

export const NotificationReadRequestSchema = z
  .object({
    id: UuidSchema.optional(),
    all: z.boolean().optional(),
  })
  .refine((d) => d.id !== undefined || d.all === true, {
    message: 'either id or all must be set',
  });
export type NotificationReadRequest = z.infer<typeof NotificationReadRequestSchema>;

// ─── Feature gate ─────────────────────────────────────────────────────────

export const FeatureGateResponseSchema = z.object({
  planTier: PlanTierSchema.nullable(),
  features: z.object({
    blogStrategist: z.boolean(),
    automation: z.boolean(),
    bulkApprove: z.boolean(),
    competitorsPage: z.boolean(),
    /** -1 = unlimited */
    maxSchedules: z.number().int(),
    blogCap: z.number().int().optional(),
  }),
  dailyCaps: z.array(
    z.object({
      agentType: AgentTypeSchema,
      cap: z.number().int().nullable(),
    })
  ),
});
export type FeatureGateResponse = z.infer<typeof FeatureGateResponseSchema>;

// ─── Generic API error envelope ───────────────────────────────────────────

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
