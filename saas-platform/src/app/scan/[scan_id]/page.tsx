import { Suspense } from 'react'
import { ScanResultsClient } from '@/components/scan/scan-results-client'

interface ScanResultsPageProps {
  params: Promise<{ scan_id: string }>
}

export default async function ScanResultsPage({ params }: ScanResultsPageProps) {
  const { scan_id } = await params

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
