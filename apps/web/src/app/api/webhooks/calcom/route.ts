/**
 * POST /api/webhooks/calcom
 *
 * Receives Cal.com webhook events. Currently handles `BOOKING_CREATED`.
 *
 * Security:
 *   - Verifies `X-Cal-Signature-256` HMAC-SHA256 against CALCOM_WEBHOOK_SECRET.
 *   - Raw body is read BEFORE JSON.parse (signature is over the raw bytes).
 *   - Uses crypto.timingSafeEqual to prevent timing-oracle attacks.
 *
 * On a verified `BOOKING_CREATED` event:
 *   1. Writes a row to `discovery_sessions` (graceful TRY/CATCH — 202 either way).
 *   2. Fires Inngest event `discovery.booked` with { email, scan_id, booked_at, cal_booking_id }.
 *
 * Returns:
 *   202  accepted (always, to prevent Cal.com retry storms on non-critical errors)
 *   401  missing or invalid signature
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Zod — Cal.com booking payload (partial — only fields we care about)
// ---------------------------------------------------------------------------

const CalcomAttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  timeZone: z.string().optional(),
})

const CalcomBookingSchema = z.object({
  triggerEvent: z.string(),
  payload: z.object({
    uid: z.string(),
    title: z.string().optional(),
    startTime: z.string(),
    endTime: z.string().optional(),
    attendees: z.array(CalcomAttendeeSchema).min(1),
    /**
     * `description`/`additionalNotes` — Cal.com stores the booking notes field here.
     * We encode scan_id as "scan_id:<uuid>" in the notes when building the embed URL.
     */
    description: z.string().nullable().optional(),
    additionalNotes: z.string().nullable().optional(),
  }),
})

type CalcomBooking = z.infer<typeof CalcomBookingSchema>

// ---------------------------------------------------------------------------
// HMAC verification
// ---------------------------------------------------------------------------

/**
 * Returns true if the `X-Cal-Signature-256` header matches the expected HMAC-SHA256
 * of rawBody signed with CALCOM_WEBHOOK_SECRET.
 */
function verifyCalSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET
  if (!secret) {
    // Misconfigured — fail closed in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[webhooks/calcom] CALCOM_WEBHOOK_SECRET not set')
      return false
    }
    // In local dev without the secret, allow through for testing
    return true
  }

  if (!signatureHeader) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    // Signature header may arrive as "sha256=<hex>" or bare "<hex>" depending on Cal.com version
    const incoming = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice(7)
      : signatureHeader

    if (incoming.length !== expected.length) return false

    return timingSafeEqual(Buffer.from(incoming, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// scan_id extraction from notes field
// ---------------------------------------------------------------------------

/** Extracts scan_id from a Cal.com notes string of the form "scan_id:<uuid>". */
function extractScanId(notes: string | null | undefined): string | null {
  if (!notes) return null
  const match = /scan_id:([0-9a-f-]{36})/i.exec(notes)
  return match?.[1] ?? null
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars not configured')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// DB write — graceful; table may not yet exist in dev/staging
// ---------------------------------------------------------------------------

async function writeDiscoverySession(opts: {
  calBookingId: string
  email: string
  scanId: string | null
  bookedAt: string
}): Promise<void> {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase.from('discovery_sessions').insert({
      cal_booking_id: opts.calBookingId,
      email: opts.email.toLowerCase(),
      scan_id: opts.scanId,
      booked_at: opts.bookedAt,
      status: 'scheduled',
    })
    if (error) {
      console.error('[webhooks/calcom] discovery_sessions insert failed', {
        calBookingId: opts.calBookingId,
        error: error.message,
        code: error.code,
      })
    }
  } catch (err) {
    // Graceful — table may not exist in early dev; don't hard-fail
    console.error('[webhooks/calcom] discovery_sessions write threw', {
      calBookingId: opts.calBookingId,
      error: String(err),
    })
  }
}

// ---------------------------------------------------------------------------
// Inngest event
// ---------------------------------------------------------------------------

async function fireInngestEvent(opts: {
  email: string
  scanId: string | null
  bookedAt: string
  calBookingId: string
}): Promise<void> {
  try {
    const { inngest } = await import('@/inngest/client')
    await inngest.send({
      name: 'discovery.booked',
      data: {
        email: opts.email,
        scan_id: opts.scanId,
        booked_at: opts.bookedAt,
        cal_booking_id: opts.calBookingId,
      },
    } as Parameters<typeof inngest.send>[0])
  } catch (err) {
    // Non-fatal — log and continue; the DB row is the durable record
    console.error('[webhooks/calcom] Inngest send failed', {
      calBookingId: opts.calBookingId,
      error: String(err),
    })
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body FIRST — required for signature verification
  const rawBody = await req.text()

  // 2. Verify HMAC signature
  const signatureHeader = req.headers.get('X-Cal-Signature-256')
  if (!verifyCalSignature(rawBody, signatureHeader)) {
    console.error('[webhooks/calcom] Signature verification failed', {
      hasHeader: !!signatureHeader,
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse JSON
  let raw: unknown
  try {
    raw = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Validate against schema
  const parsed = CalcomBookingSchema.safeParse(raw)
  if (!parsed.success) {
    // Unknown event shape — log and ack (Cal.com sends many event types)
    console.warn('[webhooks/calcom] Unknown payload shape — ignoring', {
      triggerEvent: (raw as Record<string, unknown>)?.triggerEvent,
    })
    return NextResponse.json({ received: true }, { status: 202 })
  }

  const booking: CalcomBooking = parsed.data

  // 5. Only handle BOOKING_CREATED (ack others silently)
  if (booking.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ received: true }, { status: 202 })
  }

  const { payload } = booking
  const attendeeEmail = payload.attendees[0]!.email
  const notes = payload.description ?? payload.additionalNotes
  const scanId = extractScanId(notes)
  const bookedAt = payload.startTime

  // 6. Write to discovery_sessions (graceful)
  await writeDiscoverySession({
    calBookingId: payload.uid,
    email: attendeeEmail,
    scanId,
    bookedAt,
  })

  // 7. Fire Inngest event
  await fireInngestEvent({
    email: attendeeEmail,
    scanId,
    bookedAt,
    calBookingId: payload.uid,
  })

  return NextResponse.json({ received: true }, { status: 202 })
}
