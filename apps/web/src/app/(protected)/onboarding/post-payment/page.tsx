import type { Metadata } from 'next'
import { claimFreeScan, type ClaimResult } from '@/lib/scan/claim'
import { PostPaymentScan } from './_post-payment-scan'

export const metadata: Metadata = {
  title: 'Setting up your workspace',
}

/**
 * ACT 4 — POST-PAYMENT ONBOARDING (DESIGN-DIRECTION §5 #4).
 *
 * The moment after checkout: instead of a dead "setting up…" spinner, we
 * auto-kick the SAME instrument-grade scanning ledger on the new customer's
 * business. They watch the work happen, land on the verdict, and step into the
 * product already understanding what Beamix sees — then the CTA routes into the
 * dashboard.
 *
 * ACTIVATION BRIDGE (Phase 2):
 * If ?scan_id=<uuid> is present in the URL (carried from the free-scan signup
 * flow), we claim that scan server-side before rendering the UI. On success the
 * user lands in the dashboard with their free-scan data already imported.
 * Claim failures are non-fatal — onboarding continues normally.
 *
 * Rendered as a fixed full-bleed surface so it escapes the dashboard shell —
 * this is a full-screen onboarding beat, not a panel inside the sidebar.
 */

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PostPaymentPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawScanId = params['scan_id']
  const scanId = typeof rawScanId === 'string' ? rawScanId : undefined

  // Claim the free scan server-side if a scan_id was provided.
  // claimFreeScan is always non-throwing; result is non-fatal on error.
  let claimResult: ClaimResult | null = null
  if (scanId) {
    claimResult = await claimFreeScan(scanId)
  }

  return <PostPaymentScan claimResult={claimResult} />
}
