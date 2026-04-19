import { BarChart3 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ScanSummary } from '@/lib/types/shared'
import { ScansClient } from '@/components/scans/ScansClient'

const mockScans: ScanSummary[] = [
  {
    id: 's1',
    userId: 'u1',
    businessId: 'b1',
    startedAt: '2026-04-19T08:00:00Z',
    completedAt: '2026-04-19T08:02:00Z',
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
    completedAt: '2026-04-12T08:02:00Z',
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
    completedAt: '2026-04-05T08:02:00Z',
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
    completedAt: '2026-03-29T08:02:00Z',
    status: 'completed',
    score: 56,
    scoreDelta: null,
    enginesSucceeded: 7,
    enginesTotal: 7,
  },
]

export default async function ScansPage() {
  const t = await getTranslations('scans')

  if (mockScans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <BarChart3 size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">{t('emptyStatePrimaryTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {t('emptyStatePrimaryBody')}
        </p>
      </div>
    )
  }

  return <ScansClient scans={mockScans} />
}
