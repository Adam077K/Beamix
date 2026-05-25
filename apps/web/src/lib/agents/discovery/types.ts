/**
 * Discovery Agent — Type Definitions
 *
 * All types that flow through the Discovery Agent pipeline.
 * The BrandFingerprint output schema MUST match the `brand_fingerprints` table
 * column-for-column (see docs/03-system-design/DATABASE_SCHEMA.md §0.1).
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Evidence-link prefix allowlists — shared by the Zod schema (validation)
// and the tool executor (audit logging). Exported so tools.ts can reference
// them without duplicating the source of truth.
// ---------------------------------------------------------------------------

/** Prefixes the LLM is permitted to use in evidence_links values. */
export const EVIDENCE_LLM_ALLOWED_PREFIXES = ['transcript:', 'site_crawl:', 'gbp:'] as const;

/**
 * Prefixes reserved exclusively for server/human code.
 * Any LLM attempt to use one of these is a security event.
 */
export const EVIDENCE_RESERVED_PREFIXES = [
  'adam_manual:',
  'customer_edit:',
  'system_inferred:',
  'external:',
] as const;

// ---------------------------------------------------------------------------
// DiscoveryInput — everything the agent has before the conversation starts
// ---------------------------------------------------------------------------
export interface DiscoveryInput {
  /** Paying customer's Supabase user ID. */
  customerId: string;
  /** Primary domain for the business. */
  businessUrl: string;
  /** Pre-call survey answers (sent 24h before). */
  preSurvey?: {
    goalIn90Days?: string;
    aiMisunderstanding?: string;
    neverConfusedWith?: string;
  };
  /** Vertical drives the question bank branch. */
  vertical: 'b2b_saas' | 'solo_lawyer' | 'single_location_dental' | 'other';
  /** Scan results from the free scan, if available. */
  scanResults?: {
    overallScore: number;
    mentionedBy: string[];
    competitorsMentioned: string[];
  };
  /** Tier-gated max question count. */
  maxQuestions: 15 | 20 | 25;
}

// ---------------------------------------------------------------------------
// DiscoveryMessage — a single turn in the discovery conversation
// ---------------------------------------------------------------------------
export interface DiscoveryMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// BrandFingerprint — the emit_brand_fingerprint tool output schema.
// Matches brand_fingerprints table columns 1:1.
// ---------------------------------------------------------------------------
export const BrandFingerprintSchema = z.object({
  /** FK → user_profiles.user_id. Set by the tool. */
  customer_id: z.string().uuid(),
  /** Tone descriptors, banned words, must-use phrases. */
  voice: z.object({
    tone_descriptors: z.array(z.string()),
    reading_level: z.enum(['8', '10', '12', 'college']),
    person: z.enum(['first', 'third']),
    humor: z.enum(['none', 'dry', 'warm']),
    forbidden_phrases: z.array(z.string()),
    preferred_phrases: z.array(z.string()),
    voice_samples: z.array(
      z.object({
        source: z.string(),
        text: z.string(),
      }),
    ),
  }),
  /** Ideal customer profile + segments. */
  icp: z.object({
    primary_segment: z.string(),
    secondary_segments: z.array(z.string()),
    buyer_jtbd: z.string(),
    decision_triggers: z.array(z.string()),
  }),
  /** Products/services with positioning. */
  offerings: z.array(
    z.object({
      name: z.string(),
      is_primary: z.boolean(),
      geo_constraints: z.array(z.string()),
      service_area_km: z.number().nullable(),
    }),
  ),
  /** External sources customer trusts. */
  authoritative_citations: z.array(z.string()),
  /** Things the brand should always do. */
  do_list: z.array(z.string()),
  /** Things the brand should never do. */
  dont_list: z.array(z.string()),
  /** Owner identity for email-as-them workflows. */
  owner_identity: z.object({
    name: z.string(),
    title: z.string(),
    linkedin_url: z.string().nullable(),
    photo_url: z.string().nullable(),
  }),
  /** Populated if session was recorded. */
  discovery_transcript_url: z.string().nullable(),
  /** NULL until Adam reviews (customer #1–50 gate). */
  adam_reviewed_at: z.string().datetime().nullable(),
  /** Confidence score 0.0–1.0 reflecting data grounding. */
  confidence_score: z.number().min(0).max(1),
  /** Per-field evidence links. */
  evidence_links: z.record(
    z.string().refine(
      (val) => {
        // Reject any value that starts with a reserved prefix — only server/human code may set these
        if (EVIDENCE_RESERVED_PREFIXES.some((p) => val.startsWith(p))) return false;
        // Accept only values starting with an LLM-allowed prefix
        return EVIDENCE_LLM_ALLOWED_PREFIXES.some((p) => val.startsWith(p));
      },
      { message: 'evidence_link value must start with one of: transcript:, site_crawl:, gbp: — reserved prefixes (adam_manual:, customer_edit:, system_inferred:, external:) are not allowed' },
    ),
  ),
  /** True when YMYL content detected — forces human approval on all downstream. */
  requires_human_approval: z.boolean(),
  /** brief_version_id — uuid v4, generated on every emit. */
  brief_version_id: z.string().uuid(),
  /** Competitor set captured during discovery. */
  competitor_set: z.array(
    z.object({
      name: z.string(),
      url: z.string().nullable(),
      relationship: z.enum(['direct', 'adjacent', 'aspirational']),
    }),
  ),
  /** Approval style preferences. */
  approval_style: z.object({
    default_mode: z.enum(['auto', 'digest_one_click', 'always_human']),
    ymyl_override: z.literal('always_human'),
    preferred_review_cadence: z.enum(['weekly', 'biweekly']),
  }),
  /** Hard-no topics, claims, and competitor comparisons. */
  hard_nos: z.object({
    topics: z.array(z.string()),
    claims: z.array(z.string()),
    competitors_to_never_compare: z.array(z.string()),
  }),
});

export type BrandFingerprint = z.infer<typeof BrandFingerprintSchema>;

// ---------------------------------------------------------------------------
// DiscoveryChunk — streaming output from runDiscoveryAgent()
// ---------------------------------------------------------------------------
export type DiscoveryChunk =
  | {
      type: 'text_delta';
      text: string;
    }
  | {
      type: 'question_asked';
      questionIndex: number;
      totalQuestions: number;
      text: string;
    }
  | {
      type: 'tool_use';
      toolName: string;
      toolInput: Record<string, unknown>;
    }
  | {
      type: 'tool_result';
      toolName: string;
      success: boolean;
      preview: string;
    }
  | {
      type: 'ymyl_flag';
      reason: string;
    }
  | {
      type: 'brand_fingerprint_emitted';
      fingerprint: BrandFingerprint;
    }
  | {
      type: 'cost_log';
      model: string;
      inputTokens: number;
      outputTokens: number;
      cacheReadTokens: number;
      costUsd: number;
    }
  | {
      type: 'cost_alert';
      totalCostUsd: number;
      threshold: number;
    }
  | {
      type: 'done';
      sessionId: string;
      totalCostUsd: number;
    }
  | {
      type: 'error';
      message: string;
      retryable: boolean;
    };

// ---------------------------------------------------------------------------
// SiteCrawlResult — output of fetch_site_content tool
// ---------------------------------------------------------------------------
export interface SiteCrawlResult {
  url: string;
  title: string;
  description: string;
  headlines: string[];
  bodyText: string;
  /** True if Cheerio found no meaningful content. */
  isEmpty: boolean;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// GBPResult — output of fetch_gbp tool
// ---------------------------------------------------------------------------
export interface GBPResult {
  error: 'not_implemented';
}

// ---------------------------------------------------------------------------
// DiscoverySessionState — mutable state across the streaming session
// ---------------------------------------------------------------------------
export interface DiscoverySessionState {
  sessionId: string;
  customerId: string;
  messages: DiscoveryMessage[];
  questionCount: number;
  totalCostUsd: number;
  ymylDetected: boolean;
  ymylReasons: string[];
  fingerprint: BrandFingerprint | null;
  completedAt: string | null;
}
