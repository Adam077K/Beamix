import Link from 'next/link'
import { Archive } from 'lucide-react'
import { ArchiveClient } from '@/components/archive/ArchiveClient'
import { Button } from '@/components/ui/button'

const mockArchive = [
  {
    id: 'ar1',
    actionLabel: 'Optimize your homepage copy for GEO visibility',
    agentType: 'content_optimizer',
    approvedAt: '2026-04-17T10:00:00Z',
    publishedAt: '2026-04-17T15:00:00Z',
    targetUrl: 'https://example.com/',
    verificationStatus: 'verified',
    estimatedImpact: 'high' as const,
    formats: ['markdown', 'html'],
  },
  {
    id: 'ar2',
    actionLabel: 'Generate FAQ page for pricing section',
    agentType: 'faq_agent',
    approvedAt: '2026-04-14T09:00:00Z',
    publishedAt: null,
    targetUrl: 'https://example.com/pricing',
    verificationStatus: 'pending',
    estimatedImpact: 'medium' as const,
    formats: ['markdown', 'json_ld'],
  },
  {
    id: 'ar3',
    actionLabel: 'Update directory listings across citation sources',
    agentType: 'citation_agent',
    approvedAt: '2026-04-09T14:00:00Z',
    publishedAt: '2026-04-11T10:00:00Z',
    targetUrl: null,
    verificationStatus: 'unverified',
    estimatedImpact: 'medium' as const,
    formats: ['markdown'],
  },
]

export default function ArchivePage() {
  if (mockArchive.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center mx-4 sm:mx-8 mt-6">
        <Archive size={32} className="mb-4 text-gray-300" aria-hidden="true" />
        <h3 className="text-base font-medium text-gray-700 mb-1">Nothing here yet</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-sm">
          Approved and rejected items will archive here for reference.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white rounded-lg">
          <Link href="/inbox">Go to Inbox</Link>
        </Button>
      </div>
    )
  }

  return <ArchiveClient items={mockArchive} />
}
