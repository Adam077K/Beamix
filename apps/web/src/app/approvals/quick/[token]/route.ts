/**
 * GET  /approvals/quick/[token]  — verify token and redirect to confirm UI
 * POST /approvals/quick/[token]  — verify token and call approveApprovalItem
 *
 * This route handles email-linked 1-click approval.
 *
 * GET flow:
 *   1. Decode & verify HMAC token (verifyApprovalToken)
 *   2. If invalid/expired → 410 Gone
 *   3. If valid → redirect to /approvals/quick/[token]/confirm (the confirm page)
 *      OR directly render (handled in the sibling page.tsx)
 *
 * POST flow:
 *   1. Decode & verify HMAC token
 *   2. Look up approval_queue row + check expires_at
 *   3. Call approveApprovalItem
 *   4. Redirect to /approvals with success indicator
 *
 * Security:
 *   - Token verified with HMAC (timingSafeEqual) before any DB lookup
 *   - Expired tokens return 410 Gone (not 401/403 to avoid oracle)
 *   - No session required — the signed token IS the authorization
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyApprovalToken } from '@/lib/approvals/signed-token'
// approval_queue is not yet in database.types.ts (schema drift).
// The admin client is created without the Database generic; results are cast to the
// local ApprovalQueueSelectRow type for type safety.

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goneResponse(): NextResponse {
  return new NextResponse(
    '<!doctype html><html><head><title>Link expired</title></head><body>' +
      '<h1>This approval link has expired or is invalid.</h1>' +
      '<p>Visit your <a href="/approvals">approvals dashboard</a> to review pending items.</p>' +
      '</body></html>',
    {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  )
}

// No Database generic — approval_queue not yet in database.types.ts.
// Results from un-generic createClient are typed as `any` by supabase-js,
// so property access (row.state, row.expires_at, etc.) compiles without casts.
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[approvals/quick] Missing Supabase service-role env vars')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// GET handler — verify token and redirect to confirm page
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params

  const payload = verifyApprovalToken(token)
  if (!payload) {
    return goneResponse()
  }

  // Double-check approval_queue row still exists and is pending
  try {
    const admin = getAdminClient()
    const { data: row, error } = await admin
      .from('approval_queue')
      .select('id, state, expires_at')
      .eq('id', payload.approvalId)
      .single()

    if (error || !row) {
      return goneResponse()
    }

    if (row.state !== 'pending') {
      // Already actioned — redirect to dashboard
      return NextResponse.redirect(new URL('/approvals?already_actioned=1', _req.url))
    }

    if (new Date(row.expires_at) < new Date()) {
      return goneResponse()
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/quick] DB lookup failed', { message })
    return goneResponse()
  }

  // Token is valid — redirect to the confirm page (page.tsx handles the UI)
  const confirmUrl = new URL(_req.url)
  confirmUrl.pathname = `/approvals/quick/${token}`
  // The page.tsx at this same path handles GET browser requests (route.ts handles programmatic)
  // We return the redirect to the same path with a query param to signal "show confirm UI"
  // Actually: in Next.js App Router, route.ts GET takes precedence over page.tsx for the same
  // segment. So we render the confirm HTML directly here.
  return renderConfirmPage(token, payload.approvalId)
}

// ---------------------------------------------------------------------------
// POST handler — approve via token
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params

  const payload = verifyApprovalToken(token)
  if (!payload) {
    return goneResponse()
  }

  // Verify approval_queue row is still pending
  try {
    const admin = getAdminClient()
    const { data: row, error } = await admin
      .from('approval_queue')
      .select('id, state, expires_at')
      .eq('id', payload.approvalId)
      .single()

    if (error || !row) {
      return goneResponse()
    }

    if (row.state !== 'pending') {
      return NextResponse.redirect(new URL('/approvals?already_actioned=1', req.url))
    }

    if (new Date(row.expires_at) < new Date()) {
      return goneResponse()
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/quick] DB lookup on POST failed', { message })
    return goneResponse()
  }

  // Token flow: use service-role client for the approval update directly,
  // because the customer may not have an active browser session.
  try {
    const admin = getAdminClient()
    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await admin
      .from('approval_queue')
      .update({ state: 'approved', acted_at: now })
      .eq('id', payload.approvalId)
      .eq('state', 'pending')
      .select('id, kind, customer_id')
      .single()

    if (updateError || !updated) {
      console.error('[approvals/quick] POST update failed', { updateError })
      return goneResponse()
    }

    // Write audit_log
    await admin.from('audit_log').insert({
      actor_id: updated.customer_id,
      actor_type: 'user',
      event_type: 'approval.approved',
      target_id: updated.id,
      target_table: 'approval_queue',
      payload: {
        approval_id: updated.id,
        kind: updated.kind,
        method: 'email_token',
        acted_at: now,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/quick] POST error', { message })
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 })
  }

  // Redirect to approvals dashboard with success toast hint
  return NextResponse.redirect(new URL('/approvals?approved=1', req.url))
}

// ---------------------------------------------------------------------------
// Confirm page HTML — minimal server-rendered UI
// ---------------------------------------------------------------------------

function renderConfirmPage(token: string, approvalId: string): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm approval — Beamix</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      background: #F7F7F7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
    }
    .logo { font-size: 20px; font-weight: 600; color: #0A0A0A; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 600; color: #0A0A0A; margin-bottom: 12px; }
    p { font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px; }
    .actions { display: flex; gap: 12px; }
    .btn-approve {
      flex: 1; background: #3370FF; color: #fff; border: none; border-radius: 8px;
      padding: 12px 20px; font-size: 15px; font-weight: 500; cursor: pointer;
    }
    .btn-approve:hover { background: #2558D4; }
    .btn-cancel {
      flex: 1; background: #fff; color: #374151; border: 1px solid #E5E7EB;
      border-radius: 8px; padding: 12px 20px; font-size: 15px; font-weight: 500;
      cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    }
    .btn-cancel:hover { background: #F7F7F7; }
    .note { font-size: 13px; color: #9CA3AF; margin-top: 20px; margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Beamix</div>
    <h1>Confirm your approval</h1>
    <p>You're about to approve an item from your review queue. This action cannot be undone from this link — you can still update it from your dashboard if needed.</p>
    <div class="actions">
      <form method="POST" action="/approvals/quick/${encodeURIComponent(token)}" style="flex:1">
        <input type="hidden" name="approval_id" value="${encodeURIComponent(approvalId)}" />
        <button type="submit" class="btn-approve">Approve</button>
      </form>
      <a href="/approvals" class="btn-cancel">Cancel</a>
    </div>
    <p class="note">Nothing is published without your explicit approval.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
