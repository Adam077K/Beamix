import type { Metadata } from 'next'
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
 * Rendered as a fixed full-bleed surface so it escapes the dashboard shell —
 * this is a full-screen onboarding beat, not a panel inside the sidebar.
 *
 * Real-engine seam: `domain` / `businessName` come from the just-completed
 * onboarding record (Supabase `businesses` row). Mock placeholder for now.
 */
export default function PostPaymentPage() {
  return <PostPaymentScan />
}
