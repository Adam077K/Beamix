import Link from 'next/link'
import { Archive } from 'lucide-react'
import { ArchiveClient } from '@/components/archive/ArchiveClient'
import { Button } from '@/components/ui/button'

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
  if (mockArchive.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Archive size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nothing archived yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Content you approve in Inbox moves here. Mark it published once it&apos;s live on your site.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/inbox">Go to Inbox</Link>
        </Button>
      </div>
    )
  }

  return <ArchiveClient items={mockArchive} />
}
