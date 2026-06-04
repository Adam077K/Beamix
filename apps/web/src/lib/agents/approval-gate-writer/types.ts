/**
 * Approval-Gate Writer — public types.
 *
 * Mirrors the contract in `docs/04-features/specs/agent-approval-gate-writer.md`.
 */

/** approval_kind values from migration 20260525000001_agency_tables.sql. */
export type ApprovalKind =
  | 'content_publish'
  | 'email_as_them'
  | 'outreach'
  | 'schema_push'
  | 'listing_update'
  | 'citation_submit';

/** Artifact taxonomy from the PRD. Maps to ApprovalKind via mapArtifactToKind(). */
export type ArtifactType =
  | 'blog_post'
  | 'faq'
  | 'outreach_email'
  | 'schema_change'
  | 'citation_outreach'
  | 'listing_update';

export type RiskFlag =
  | 'ymyl'
  | 'ymyl_medical'
  | 'ymyl_legal'
  | 'ymyl_financial'
  | 'competitor_named'
  | 'geographic_claim';

/** The structured card returned by the LLM. */
export interface ApprovalCardDraft {
  title: string;
  value_one_liner: string;
  preview: string;
  approve_label: string;
  change_label: string;
  reject_label: string;
}

/**
 * Inngest event payload — `gated_publish.requested` triggers this agent.
 * The CTO / orchestration layer creates the event; we consume it.
 */
export interface GatedPublishRequestedEvent {
  customerId: string;
  /** The artifact taxonomy from the generating agent. */
  artifactType: ArtifactType;
  /** Stable ID of the underlying artifact (blog draft id, outreach id, etc). */
  artifactId: string;
  /** Full body for outreach emails; first 300 chars otherwise. */
  artifactPreview: string;
  /** Why this matters for AI search visibility — from the generating agent. */
  whyThisMatters: string;
  /** Human-readable target ("your blog at /resources, Tuesday 10am ET"). */
  publishTarget: string;
  /** Risk flags from upstream. We may add 'ymyl' downstream if we detect it. */
  riskFlags: RiskFlag[];
  /** Optional recipient context for outreach. */
  recipientContext?: string;
  /** Scheduled publish/send time. */
  scheduledFor?: string;
}

/** Public outcome the wrapping Inngest function inspects. */
export type ApprovalGateOutcome =
  | {
      kind: 'queued';
      approvalQueueId: string;
      approvalToken: string;
      draft: ApprovalCardDraft;
      costUsd: number;
      late_ymyl_catch: boolean;
    }
  | {
      kind: 'aborted';
      reason: 'llm_error' | 'draft_invalid' | 'cost_ceiling' | 'missing_brief';
      costUsd: number;
    };
