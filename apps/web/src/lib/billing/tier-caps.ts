/**
 * Beamix — Tier Deliverable Caps
 *
 * Authoritative tier-gate limits for monthly deliverable consumption.
 * Source: docs/product-rethink-2026-04-09/build-prep-2026-05-13/10-WAVE-2-BRIEF.md §W2.1
 * and 2026-05-28 WAVE-2-DISPATCH-BRIEF.md Group A.
 *
 * Active plan tiers (post agency-pivot): starter, growth, scale, professional.
 * Legacy tiers (discover, build) are deprecated; treated as starter for cap purposes.
 *
 * `null` = unlimited (Professional tier).
 *
 * Column names mirror `deliverables_per_customer_per_month` table columns:
 *   schema_pushed_count, faq_published_count, citation_submitted_count,
 *   content_published_count, outreach_email_count
 */

/** The monthly deliverable kind identifiers — mirror DB counter column names. */
export type DeliverableKind =
  | 'schema_pushed'
  | 'faq_published'
  | 'citation_submitted'
  | 'content_published'
  | 'outreach_email';

/** Per-tier monthly deliverable caps. `null` = unlimited. */
export interface DeliverableCaps {
  /** Schema markup pushes per month. */
  schema_pushed: number | null;
  /** FAQ page publishes per month. */
  faq_published: number | null;
  /** Citation submissions per month. */
  citation_submitted: number | null;
  /** Content (blog/page) publishes per month. */
  content_published: number | null;
  /** Outreach email sends per month. */
  outreach_email: number | null;
}

/**
 * All active plan tiers (post agency-pivot 2026-05-23).
 * Source: migration 20260525000002_plan_tier_rename.sql + 20260525000005_plan_tier_seed_and_deprecate.sql.
 */
export type AgencyPlanTier = 'starter' | 'growth' | 'scale' | 'professional';

/**
 * Monthly deliverable caps keyed by active plan tier.
 *
 * Tier mapping from Wave 2 brief §W2.1:
 *   Starter $499/mo:      schema 4, faq 2, citation 5,  content 10, outreach 0
 *   Growth $999/mo:       schema 12, faq 6, citation 15, content 20, outreach 0
 *   Scale $1,499/mo:      schema 24, faq 10, citation 30, content 50, outreach 10
 *   Professional $2,499:  all unlimited (null)
 *
 * Dispatch brief defaults (Group A, if above numbers differ):
 *   Starter {schema:50, citations:20, content:10}
 *   Growth 2×, Scale 5×, Professional unlimited
 *
 * The Wave 2 brief §W2.1 values are more specific and are used here.
 */
export const TIER_CAPS: Record<AgencyPlanTier, DeliverableCaps> = {
  starter: {
    schema_pushed: 4,
    faq_published: 2,
    citation_submitted: 5,
    content_published: 10,
    outreach_email: 0,
  },
  growth: {
    schema_pushed: 12,
    faq_published: 6,
    citation_submitted: 15,
    content_published: 20,
    outreach_email: 0,
  },
  scale: {
    schema_pushed: 24,
    faq_published: 10,
    citation_submitted: 30,
    content_published: 50,
    outreach_email: 10,
  },
  professional: {
    schema_pushed: null,
    faq_published: null,
    citation_submitted: null,
    content_published: null,
    outreach_email: null,
  },
} as const;

/**
 * Human-readable tier display names for customer-facing messages.
 * NO agent names — outcome-shaped copy per Engineering Principle #9.
 */
export const TIER_DISPLAY_NAME: Record<AgencyPlanTier, string> = {
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  professional: 'Professional',
} as const;

/**
 * Upgrade path: maps each tier to the next tier the customer should upgrade to.
 * Professional has no next tier.
 */
export const UPGRADE_TIER: Partial<Record<AgencyPlanTier, AgencyPlanTier>> = {
  starter: 'growth',
  growth: 'scale',
  scale: 'professional',
} as const;

/**
 * Human-readable deliverable kind labels for customer-facing messages.
 * NO agent names per Principle #9.
 */
export const DELIVERABLE_KIND_LABEL: Record<DeliverableKind, string> = {
  schema_pushed: 'schema updates',
  faq_published: 'FAQ pages',
  citation_submitted: 'citation submissions',
  content_published: 'content publishes',
  outreach_email: 'outreach emails',
} as const;

/**
 * Map a DB column counter name to the DeliverableKind.
 * Useful when reading raw rows from `deliverables_per_customer_per_month`.
 */
export const DB_COLUMN_TO_KIND: Record<string, DeliverableKind> = {
  schema_pushed_count: 'schema_pushed',
  faq_published_count: 'faq_published',
  citation_submitted_count: 'citation_submitted',
  content_published_count: 'content_published',
  outreach_email_count: 'outreach_email',
} as const;

/**
 * Map a DeliverableKind to its DB column name in `deliverables_per_customer_per_month`.
 */
export const KIND_TO_DB_COLUMN: Record<DeliverableKind, string> = {
  schema_pushed: 'schema_pushed_count',
  faq_published: 'faq_published_count',
  citation_submitted: 'citation_submitted_count',
  content_published: 'content_published_count',
  outreach_email: 'outreach_email_count',
} as const;

/**
 * Normalise a raw `plan_tier` DB enum value (including deprecated legacy tiers)
 * to an `AgencyPlanTier`. Legacy tiers (discover, build) fall back to `starter`.
 */
export function toAgencyTier(rawTier: string): AgencyPlanTier {
  switch (rawTier) {
    case 'starter':
    case 'growth':
    case 'scale':
    case 'professional':
      return rawTier;
    // Legacy deprecated tiers — treat as starter for cap purposes.
    case 'discover':
    case 'build':
    default:
      return 'starter';
  }
}
