/**
 * block-content — mock render data for each report block.
 *
 * Phase 1B design surface: every block in the catalog has a real, specific tile
 * body so the composed report never shows a placeholder. Numbers are anchored to
 * the Bright Smile Dental (Ramat Gan) story used across the demo fixtures.
 *
 * NEVER fake a sparkline: when a block has no time series, `series` is null and
 * EngineMicroSparkline renders its flat baseline instead.
 */

export interface EngineRow {
  engine: string
  value: number
  /** Last ~5 score points, or null for the flat baseline. */
  series: number[] | null
}

export interface DeltaRow {
  topic: string
  /** signed delta in rank positions; negative = moved up (better) */
  delta: number
  engine: string
}

export interface BlockTile {
  /** Catalog id this maps to */
  id: string
  /** Tile heading (Inter 600, 15px) */
  heading: string
  /** One-line caption under the heading */
  caption: string
  kind: 'user' | 'agent'
  /** Render shape — drives which body the tile component paints */
  shape: 'engines' | 'deltas' | 'figure' | 'narrative' | 'list'
  /** Big mono figure for 'figure' shape */
  figure?: string
  figureUnit?: string
  engines?: EngineRow[]
  deltas?: DeltaRow[]
  /** Narrative / list lines */
  lines?: string[]
}

export const BLOCK_TILES: Record<string, BlockTile> = {
  'blk-visibility-score': {
    id: 'blk-visibility-score',
    heading: 'Visibility Score',
    caption: 'Composite AI-search visibility across 6 answer engines',
    kind: 'user',
    shape: 'figure',
    figure: '68',
    figureUnit: '/ 100',
  },
  'blk-engine-breakdown': {
    id: 'blk-engine-breakdown',
    heading: 'Engine Breakdown',
    caption: 'Per-engine visibility, last 5 scans',
    kind: 'user',
    shape: 'engines',
    engines: [
      { engine: 'ChatGPT', value: 74, series: [61, 64, 66, 71, 74] },
      { engine: 'Perplexity', value: 70, series: [58, 62, 65, 67, 70] },
      { engine: 'Gemini', value: 63, series: [60, 61, 62, 62, 63] },
      { engine: 'Claude', value: 66, series: [55, 59, 61, 64, 66] },
      { engine: 'Google AIO', value: 58, series: [52, 54, 55, 57, 58] },
      { engine: 'Grok', value: 51, series: null },
    ],
  },
  'blk-rank-deltas': {
    id: 'blk-rank-deltas',
    heading: 'Rank Deltas',
    caption: 'Position changes since last month',
    kind: 'user',
    shape: 'deltas',
    deltas: [
      { topic: 'Invisalign Ramat Gan', delta: -4, engine: 'ChatGPT' },
      { topic: 'Emergency dentist near me', delta: -2, engine: 'Perplexity' },
      { topic: 'Teeth whitening cost', delta: -3, engine: 'Gemini' },
      { topic: 'Best dental clinic Ramat Gan', delta: 1, engine: 'Claude' },
      { topic: 'Dental implants Israel', delta: -1, engine: 'Google AIO' },
    ],
  },
  'blk-competitor-set': {
    id: 'blk-competitor-set',
    heading: 'Competitor Set',
    caption: 'Share of voice vs. tracked competitors',
    kind: 'user',
    shape: 'list',
    lines: [
      'Bright Smile Dental — 31% share of voice',
      'Smile Center — 27%',
      'Dr. Cohen Dental — 19%',
      'City Dental Ramat Gan — 14%',
      'Pearl Dental Studio — 9%',
    ],
  },
  'blk-scan-history': {
    id: 'blk-scan-history',
    heading: 'Scan History',
    caption: 'Visibility trajectory, last 5 monthly scans',
    kind: 'user',
    shape: 'engines',
    engines: [
      { engine: 'Composite', value: 68, series: [54, 58, 61, 65, 68] },
    ],
  },
  'blk-prompt-volume': {
    id: 'blk-prompt-volume',
    heading: 'Prompt Volume',
    caption: 'Tracked prompts answered by AI engines',
    kind: 'user',
    shape: 'figure',
    figure: '1,240',
    figureUnit: 'prompts',
  },
  'blk-traffic-attribution': {
    id: 'blk-traffic-attribution',
    heading: 'Traffic Attribution',
    caption: 'Sessions attributed to AI-search referrals',
    kind: 'user',
    shape: 'figure',
    figure: '342',
    figureUnit: 'sessions / mo',
  },
  'blk-sentiment-integrity': {
    id: 'blk-sentiment-integrity',
    heading: 'Sentiment Integrity',
    caption: 'How accurately engines describe your business',
    kind: 'user',
    shape: 'figure',
    figure: '92',
    figureUnit: '% accurate',
  },
  'blk-agent-activity': {
    id: 'blk-agent-activity',
    heading: 'Agent Activity',
    caption: 'What your agents shipped this period',
    kind: 'agent',
    shape: 'list',
    lines: [
      'Content Agent — published 4 GEO-optimized service pages',
      'Schema Agent — patched 11 LocalBusiness markup gaps',
      'FAQ Agent — answered 23 high-intent prompts',
      'Competitor Agent — flagged 2 share-of-voice losses',
    ],
  },
  'blk-ai-summary': {
    id: 'blk-ai-summary',
    heading: 'AI Summary',
    caption: 'Generated narrative for this report',
    kind: 'agent',
    shape: 'narrative',
    lines: [
      'Bright Smile Dental gained 14 points of composite visibility this month, driven by ChatGPT and Claude, where new Invisalign service pages now rank in the top three answers.',
      'The widest remaining gap is on Grok, where the clinic is still absent from emergency-care prompts — the recommended next move is a dedicated emergency-dentist page with structured hours markup.',
    ],
  },
}

/** Resolve a tile for a block id, falling back to a generic user tile. */
export function tileForBlock(
  id: string,
  label: string,
  kind: 'user' | 'agent',
): BlockTile {
  return (
    BLOCK_TILES[id] ?? {
      id,
      heading: label,
      caption: 'Live data renders here in your saved report.',
      kind,
      shape: 'list',
      lines: ['Connected to your latest scan.'],
    }
  )
}
