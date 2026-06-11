/**
 * Blog Studio — /blog-studio
 *
 * Phase 1: Design + mock data only. Zero backend wiring.
 *
 * Surface:
 *   - Discover tier: first-class gate (TierLockBanner explains value + upgrade path).
 *   - Build/Scale: full 5-zone Console Spine with 5-stage pipeline ledger,
 *     long-form markdown editor, and "Send to approvals" gated flow.
 *
 * All four states designed: tier-locked (Discover), empty (Build/Scale), loading
 * (ledger), populated (rich dental authority draft), error (onRetry).
 *
 * Agent: authority_blog_strategist — availableOnTiers=['build','scale'],
 * requiresApproval=true, ymylRisk='high', 5-step pipeline.
 * See: apps/web/src/lib/agents/config/registry.ts
 */

import { BlogEditor } from './_components/BlogEditor'

/**
 * Demo tier — change to 'discover' to preview the tier-locked state.
 * In production this will come from the user's subscription.
 */
const DEMO_PLAN_TIER = 'build' as 'discover' | 'build' | 'scale'

export default function BlogStudioPage() {
  return <BlogEditor planTier={DEMO_PLAN_TIER} />
}
