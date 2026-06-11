import { ContentTabs } from './_components/ContentTabs'

export const metadata = {
  title: 'Content Editor — Beamix',
  description:
    'Optimize, refresh, and build FAQ content for AI search visibility — review and approve before publishing.',
}

/**
 * /content — Content Editor
 *
 * Phase 1: design + mock data. Zero backend. All data from demo fixtures.
 *
 * Three agents:
 *   - content_optimizer (Optimize tab) — requiresPageLock, requiresApproval
 *   - freshness_agent  (Refresh tab)  — requiresPageLock, requiresApproval
 *   - faq_builder      (FAQ tab)      — daily-capped, requiresApproval
 *
 * All agents are GATED: output routes to /approvals before publishing.
 */
export default function ContentPage() {
  return <ContentTabs />
}
