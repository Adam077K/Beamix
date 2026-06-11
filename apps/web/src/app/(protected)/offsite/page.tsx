import { ToolPage } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { DEMO_OFFSITE } from '@/lib/demo/surfaces/offsite'
import { OffsiteTabs } from './_components/OffsiteTabs'

export const metadata = {
  title: 'Off-Site Manager — Beamix',
  description: 'Build and track your citation, directory, entity, reputation, and community presence.',
}

/**
 * /offsite — Citation / Off-Site Manager
 *
 * Uses the Console Spine (ToolPage) shell.
 * Zone 2 hosts <OffsiteTabs> — the 5-tab cockpit.
 * Phase 1 = design + mock data only; zero backend.
 *
 * Backed by 4 agents:
 *   offsite_presence_builder  → Directories tab (auto-publish, capped 3/5/10)
 *   entity_builder            → Entities tab (auto-publish)
 *   review_presence_planner   → Reputation tab (internal report)
 *   reddit_presence_planner   → Community tab (internal report)
 * Citations tab is read-only monitoring.
 */
export default function OffsitePage() {
  return (
    <ToolPage
      eyebrow="Bright Smile Dental · Ramat Gan"
      title="Off-Site Manager"
      whatThisDoes="Build citations, directories, entity signals, and community presence — the off-site layer that AI search engines weight heavily."
      contextStat={
        <ContextStat
          value={DEMO_OFFSITE.coverageScore}
          label="Coverage score"
          sparklinePoints={[...DEMO_OFFSITE.sparklinePoints]}
          currentScore={DEMO_OFFSITE.coverageScore}
        />
      }
      inputPanel={<OffsiteTabs />}
      state="idle"
      runControl={null}
      historyHref="/archive"
    />
  )
}
