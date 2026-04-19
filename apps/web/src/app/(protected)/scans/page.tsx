import type { ScanSummary } from '@/lib/types/shared'
import { ScansClient } from '@/components/scans/ScansClient'

/**
 * Mock data — replace with real Supabase fetch when wiring up the API.
 * Sorted latest first by startedAt.
 */
const mockScans: ScanSummary[] = [
  {
    id: 's1',
    userId: 'u1',
    businessId: 'b1',
    startedAt: '2026-04-19T08:00:00Z',
    completedAt: '2026-04-19T08:02:14Z',
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
    startedAt: '2026-04-12T08:00:00Z',
    completedAt: '2026-04-12T08:01:53Z',
    status: 'completed',
    score: 57,
    scoreDelta: 3,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
  {
    id: 's3',
    userId: 'u1',
    businessId: 'b1',
    startedAt: '2026-04-05T08:00:00Z',
    completedAt: '2026-04-05T08:02:07Z',
    status: 'completed',
    score: 54,
    scoreDelta: -2,
    enginesSucceeded: 6,
    enginesTotal: 7,
  },
  {
    id: 's4',
    userId: 'u1',
    businessId: 'b1',
    startedAt: '2026-03-29T08:00:00Z',
    completedAt: '2026-03-29T08:02:01Z',
    status: 'completed',
    score: 56,
    scoreDelta: null,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
]

export default function ScansPage() {
  // ScansClient handles all states: loading / empty / error / success
  // Pass isLoading / error props once real data fetching is wired
  return <ScansClient scans={mockScans} />
}
