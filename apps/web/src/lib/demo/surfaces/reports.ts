import type {
  DemoReports,
  ReportBlock,
  SavedReport,
  ActiveReport,
  ReportConnector,
} from './types'

/**
 * DEMO_REPORTS — Reports & Exports surface fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: the owner has saved two reports — a monthly GEO report and an
 * Invisalign campaign brief. The active report in progress is the June 2026
 * Monthly GEO Report. White-label sharing and Looker/Tableau connectors are
 * gated (Build/Scale tier).
 */

// ---------------------------------------------------------------------------
// Block catalog
// ---------------------------------------------------------------------------

const blockCatalog: ReportBlock[] = [
  { id: 'blk-visibility-score', label: 'Visibility Score', kind: 'user' },
  { id: 'blk-engine-breakdown', label: 'Engine Breakdown', kind: 'user' },
  { id: 'blk-rank-deltas', label: 'Rank Deltas Table', kind: 'user' },
  { id: 'blk-competitor-set', label: 'Competitor Set', kind: 'user' },
  { id: 'blk-scan-history', label: 'Scan History', kind: 'user' },
  { id: 'blk-agent-activity', label: 'Agent Activity', kind: 'agent' },
  { id: 'blk-ai-summary', label: 'AI Summary', kind: 'agent' },
  { id: 'blk-prompt-volume', label: 'Prompt Volume', kind: 'user' },
  { id: 'blk-traffic-attribution', label: 'Traffic Attribution', kind: 'user' },
  { id: 'blk-sentiment-integrity', label: 'Sentiment Integrity', kind: 'user' },
]

// ---------------------------------------------------------------------------
// Saved reports
// ---------------------------------------------------------------------------

const savedReports: SavedReport[] = [
  {
    id: 'rpt-1',
    name: 'Monthly GEO Report — Bright Smile · May 2026',
    blockCount: 7,
    lastSaved: '2 Jun 2026 · 14:23',
    shareUrl: null,
  },
  {
    id: 'rpt-2',
    name: 'Invisalign Campaign Brief — Jun 2026',
    blockCount: 4,
    lastSaved: '5 Jun 2026 · 10:47',
    shareUrl: 'https://reports.beamixai.com/share/rpt-inv-2026-06',
  },
  {
    id: 'rpt-3',
    name: 'Competitor Snapshot — Smile Center Deep Dive',
    blockCount: 3,
    lastSaved: '9 Jun 2026 · 16:02',
    shareUrl: null,
  },
]

// ---------------------------------------------------------------------------
// Active report in progress
// ---------------------------------------------------------------------------

const activeReport: ActiveReport = {
  title: 'Monthly GEO Report — Bright Smile · Jun 2026',
  blocks: [
    'blk-visibility-score',
    'blk-engine-breakdown',
    'blk-rank-deltas',
    'blk-competitor-set',
    'blk-agent-activity',
    'blk-traffic-attribution',
    'blk-ai-summary',
  ],
}

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

const connectors: ReportConnector[] = [
  { name: 'CSV', gated: false },
  { name: 'PDF', gated: false },
  { name: 'Looker Studio', gated: true },
  { name: 'Tableau', gated: true },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_REPORTS: DemoReports = {
  blockCatalog,
  savedReports,
  activeReport,
  connectors,
}
