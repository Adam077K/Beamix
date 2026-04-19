import type { ScanSummary } from '@/lib/types/shared'
import { ScansClient } from '@/components/scans/ScansClient'

// Realistic mock data covering all status variants + multi-day grouping
const mockScans: ScanSummary[] = [
  {
    id: 's1',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago (today)
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 62,
    scoreDelta: 5,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
  {
    id: 's2',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago (today)
    completedAt: null,
    status: 'running',
    score: null,
    scoreDelta: null,
    enginesSucceeded: 3,
    enginesTotal: 7,
  },
  {
    id: 's3',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // yesterday
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 57,
    scoreDelta: 3,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
  {
    id: 's4',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // yesterday
    completedAt: null,
    status: 'failed',
    score: null,
    scoreDelta: null,
    enginesSucceeded: 0,
    enginesTotal: 7,
  },
  {
    id: 's5',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 54,
    scoreDelta: -2,
    enginesSucceeded: 6,
    enginesTotal: 7,
  },
  {
    id: 's6',
    userId: 'u1',
    businessId: 'b1',
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    status: 'completed',
    score: 56,
    scoreDelta: null,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
]

export default function ScansPage() {
  return <ScansClient scans={mockScans} />
}
