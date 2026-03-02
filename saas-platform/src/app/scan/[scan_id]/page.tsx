import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ScanResultsClient } from '@/components/scan/scan-results-client'

interface ScanResultsPageProps {
  params: Promise<{ scan_id: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function ScanResultsPage({ params }: ScanResultsPageProps) {
  const { scan_id } = await params

  if (!scan_id || !UUID_RE.test(scan_id)) {
    notFound()
  }

  return (
    <Suspense fallback={<ScanResultsLoading />}>
      <ScanResultsClient scanId={scan_id} />
    </Suspense>
  )
}

function ScanResultsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
        <p className="mt-4 text-[var(--color-muted)]">Loading scan...</p>
      </div>
    </div>
  )
}
