import { ToolPage } from '@/components/console/ToolPage'
import { ContextStat } from '@/components/console/ContextStat'
import { DEMO_OFFSITE } from '@/lib/demo/surfaces/offsite'
import { OffsiteTabs, type OffsiteSurfaceState } from './_components/OffsiteTabs'
import { OffsiteRail } from './_components/OffsiteRail'

export const metadata = {
  title: 'Off-Site Manager — Beamix',
  description: 'Build and track your citation, directory, entity, reputation, and community presence.',
}

/**
 * Optional `?state=` param drives which surface state renders, replacing the
 * removed on-page debug strip (P1.3). Only honored outside production so QA can
 * capture empty/loading/error/success without any control UI shipping.
 */
const DEMO_STATES: readonly OffsiteSurfaceState[] = [
  'idle',
  'loading',
  'empty',
  'error',
  'success',
  'running',
]

function resolveInitialState(raw: string | string[] | undefined): OffsiteSurfaceState {
  if (process.env.NODE_ENV === 'production') return 'idle'
  const value = Array.isArray(raw) ? raw[0] : raw
  return DEMO_STATES.includes(value as OffsiteSurfaceState)
    ? (value as OffsiteSurfaceState)
    : 'idle'
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
export default async function OffsitePage({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string | string[] }>
}) {
  const params = (await searchParams) ?? {}
  const initialState = resolveInitialState(params.state)

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
      inputPanel={<OffsiteTabs initialState={initialState} />}
      state="idle"
      runControl={null}
      historyHref="/archive"
      widthMode="wide"
      rail={<OffsiteRail />}
    />
  )
}
