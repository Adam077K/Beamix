/**
 * POST /api/discovery/lead
 *
 * Captures a discovery call lead when NEXT_PUBLIC_CALCOM_DISCOVERY_LINK is
 * absent (the in-product form fallback on /discovery).
 *
 * NEVER expose mailto links — this endpoint is the safe fallback for any
 * environment where the Cal.com link is not configured (DESIGN-DIRECTION §5 #7).
 *
 * Stores to Supabase `discovery_leads` table (if it exists) or falls back to
 * logging. Returns 200 on success so the UI can show the confirmation state.
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const DiscoveryLeadBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  company: z.string().max(200).optional(),
})

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = DiscoveryLeadBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, email, company } = parsed.data

  // Log the lead — backend-engineer will wire Supabase + Resend notification in Wave C
  console.info('[discovery/lead] New lead captured', {
    name,
    email,
    company: company ?? '',
    timestamp: new Date().toISOString(),
  })

  // TODO(Wave C): insert into discovery_leads table + fire Resend notification
  // const supabase = await getSupabaseAdminClient()
  // await supabase.from('discovery_leads').insert({ name, email, company })

  return NextResponse.json({ ok: true }, { status: 200 })
}
