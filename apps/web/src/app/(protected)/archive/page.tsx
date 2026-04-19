import { ArchiveClient } from '@/components/archive/ArchiveClient'

const mockArchive = [
  {
    id: 'ar1',
    actionLabel: 'Optimize your homepage',
    approvedAt: '2026-04-18T10:00:00Z',
    publishedAt: '2026-04-18T15:00:00Z',
    targetUrl: 'https://example.com/',
    verificationStatus: 'verified',
    estimatedImpact: 'high' as const,
    formats: ['markdown', 'html'],
  },
  {
    id: 'ar2',
    actionLabel: 'Generate FAQ page',
    approvedAt: '2026-04-15T09:00:00Z',
    publishedAt: null,
    targetUrl: 'https://example.com/pricing',
    verificationStatus: 'pending',
    estimatedImpact: 'medium' as const,
    formats: ['markdown', 'json_ld'],
  },
  {
    id: 'ar3',
    actionLabel: 'Check directory listings',
    approvedAt: '2026-04-10T14:00:00Z',
    publishedAt: '2026-04-12T10:00:00Z',
    targetUrl: null,
    verificationStatus: 'unverified',
    estimatedImpact: 'medium' as const,
    formats: ['markdown'],
  },
]

export default function ArchivePage() {
  return <ArchiveClient items={mockArchive} />
}
