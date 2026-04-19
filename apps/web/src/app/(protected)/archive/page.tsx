import { ArchiveClient } from '@/components/archive/ArchiveClient'

// Realistic mock data with varied states
const mockArchive = [
  {
    id: 'ar1',
    actionLabel: 'Optimize homepage for "AI accounting software"',
    approvedAt: '2026-04-18T10:00:00Z',
    publishedAt: '2026-04-18T15:30:00Z',
    targetUrl: 'https://example.com/',
    verificationStatus: 'verified' as const,
    estimatedImpact: 'high' as const,
    formats: ['markdown', 'html'],
  },
  {
    id: 'ar2',
    actionLabel: 'Generate FAQ for pricing page',
    approvedAt: '2026-04-15T09:00:00Z',
    publishedAt: null,
    targetUrl: 'https://example.com/pricing',
    verificationStatus: 'pending' as const,
    estimatedImpact: 'medium' as const,
    formats: ['markdown', 'json_ld'],
  },
  {
    id: 'ar3',
    actionLabel: 'Update directory listings for local search',
    approvedAt: '2026-04-10T14:00:00Z',
    publishedAt: '2026-04-12T10:00:00Z',
    targetUrl: null,
    verificationStatus: 'unverified' as const,
    estimatedImpact: 'medium' as const,
    formats: ['markdown'],
  },
  {
    id: 'ar4',
    actionLabel: 'Add structured data to product pages',
    approvedAt: '2026-04-07T11:00:00Z',
    publishedAt: '2026-04-08T09:00:00Z',
    targetUrl: 'https://example.com/products',
    verificationStatus: 'verified' as const,
    estimatedImpact: 'high' as const,
    formats: ['json_ld'],
  },
  {
    id: 'ar5',
    actionLabel: 'Refresh about page for brand queries',
    approvedAt: '2026-03-28T08:00:00Z',
    publishedAt: null,
    targetUrl: 'https://example.com/about',
    verificationStatus: 'pending' as const,
    estimatedImpact: 'low' as const,
    formats: ['markdown'],
  },
]

export default function ArchivePage() {
  return <ArchiveClient items={mockArchive} />
}
