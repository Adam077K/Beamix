import type { ScanSummaryExtended, EngineStatus } from '@/components/scans/ScansClient'
import { ScansClient } from '@/components/scans/ScansClient'

// ─── Mock engine status helpers ───────────────────────────────────────────────

function makeStatus(
  chatgpt: boolean,
  gemini: boolean,
  perplexity: boolean,
  claude: boolean,
  aio: boolean,
  grok: boolean,
  youcom: boolean,
): EngineStatus {
  const keys = ['chatgpt', 'gemini', 'perplexity', 'claude', 'aio', 'grok', 'youcom'] as const
  const vals = [chatgpt, gemini, perplexity, claude, aio, grok, youcom]
  const result: EngineStatus = {}
  keys.forEach((k, i) => {
    result[k] = vals[i] ? 'mentioned' : 'not_mentioned'
  })
  return result
}

function countMentioned(status: EngineStatus): number {
  return Object.values(status).filter((v) => v === 'mentioned').length
}

// ─── Realistic mock data ──────────────────────────────────────────────────────

// These scores tell a real story: dropped in early April, recovered mid-April
const SCORE_HISTORY = [48, 51, 54, 52, 49, 56, 57, 62]

function buildSparkline(upToIndex: number): number[] {
  return SCORE_HISTORY.slice(Math.max(0, upToIndex - 5), upToIndex + 1)
}

const s1Status = makeStatus(true, true, true, false, true, false, false)
const s3Status = makeStatus(true, true, true, false, true, false, true)
const s5Status = makeStatus(true, true, false, false, false, false, false)
const s6Status = makeStatus(true, true, true, true, false, false, false)
const s7Status = makeStatus(true, false, true, false, false, false, false)
const s8Status = makeStatus(false, true, false, false, false, false, false)

const mockScans: ScanSummaryExtended[] = [
  {
    id: 's1',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 62,
    scoreDelta: 5,
    enginesSucceeded: 7,
    enginesTotal: 7,
    engineStatus: s1Status,
    mentionedCount: countMentioned(s1Status),
    sparkline: buildSparkline(7),
  },
  {
    id: 's2',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    status: 'running',
    score: null,
    scoreDelta: null,
    enginesSucceeded: 3,
    enginesTotal: 7,
    engineStatus: {
      chatgpt: 'mentioned',
      gemini: 'mentioned',
      perplexity: 'mentioned',
      claude: 'not_tested',
      aio: 'not_tested',
      grok: 'not_tested',
      youcom: 'not_tested',
    },
    mentionedCount: 3,
    sparkline: buildSparkline(6),
  },
  {
    id: 's3',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 57,
    scoreDelta: 3,
    enginesSucceeded: 7,
    enginesTotal: 7,
    engineStatus: s3Status,
    mentionedCount: countMentioned(s3Status),
    sparkline: buildSparkline(6),
  },
  {
    id: 's4',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    status: 'failed',
    score: null,
    scoreDelta: null,
    enginesSucceeded: 0,
    enginesTotal: 7,
    engineStatus: {},
    mentionedCount: 0,
    sparkline: buildSparkline(5),
  },
  {
    id: 's5',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 54,
    scoreDelta: -2,
    enginesSucceeded: 6,
    enginesTotal: 7,
    engineStatus: s5Status,
    mentionedCount: countMentioned(s5Status),
    sparkline: buildSparkline(4),
  },
  {
    id: 's6',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 56,
    scoreDelta: null,
    enginesSucceeded: 7,
    enginesTotal: 7,
    engineStatus: s6Status,
    mentionedCount: countMentioned(s6Status),
    sparkline: buildSparkline(3),
  },
  {
    id: 's7',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 51,
    scoreDelta: 3,
    enginesSucceeded: 5,
    enginesTotal: 7,
    engineStatus: s7Status,
    mentionedCount: countMentioned(s7Status),
    sparkline: buildSparkline(2),
  },
  {
    id: 's8',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 48,
    scoreDelta: -3,
    enginesSucceeded: 3,
    enginesTotal: 7,
    engineStatus: s8Status,
    mentionedCount: countMentioned(s8Status),
    sparkline: buildSparkline(1),
  },
]

export default function ScansPage() {
  return <ScansClient scans={mockScans} />
}
