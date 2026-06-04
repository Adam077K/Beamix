/**
 * Inngest Function — send-approval-pending-email
 *
 * Listens for `approval.created` events and sends the approval-pending email
 * to the customer with a signed-token CTA URL.
 *
 * Steps:
 *   1. load-approval-data    — fetch approval_queue row + customer email
 *   2. generate-signed-token — HMAC-SHA256 token via signApprovalToken
 *   3. send-email            — Resend via sendEmail helper
 *
 * Concurrency: keyed on customerId so overlapping approval.created events
 * for the same customer are serialised (avoids duplicate emails).
 *
 * Retries: 3 — covers transient Resend failures + Supabase blips.
 */

import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as React from 'react'
import { inngest } from '../client'
import { signApprovalToken } from '@/lib/approvals/signed-token'
import { sendEmail } from '@/lib/email/client'
import { ApprovalPendingEmail } from '@/lib/email/templates/approval-pending'
import type { Database } from '@/lib/db/database.types'

// ---------------------------------------------------------------------------
// Local types — approval_queue not yet in database.types.ts (schema drift)
// ---------------------------------------------------------------------------

interface ApprovalQueueSelectRow {
  id: string
  kind: string
  expires_at: string
  state: string
}

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------

/**
 * Raw (un-generic) service-role client for approval_queue queries.
 * approval_queue is not yet in database.types.ts; using Database generic would
 * produce TS2769 (unknown table). Results are cast to ApprovalQueueSelectRow.
 */
function getApprovalQueueClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[send-approval-pending-email] Missing Supabase service-role env vars')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Typed service-role client for user_profiles queries (uses Database generic). */
function getAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[send-approval-pending-email] Missing Supabase service-role env vars')
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// Kind → human description mapping (no agent names — Principle #9)
// ---------------------------------------------------------------------------

function kindToDescription(kind: string): string {
  const map: Record<string, string> = {
    content_publish: 'a content draft for your website',
    email_as_them: 'a draft email to send on your behalf',
    outreach: 'an outreach message',
    schema_push: 'a structured data update',
    listing_update: 'a business listing update',
    citation_submit: 'a citation for your business',
  }
  return map[kind] ?? 'an item ready for your review'
}

// ---------------------------------------------------------------------------
// APP_URL — used to build the CTA link
// ---------------------------------------------------------------------------

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.beamixai.com'
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

export const sendApprovalPendingEmail = inngest.createFunction(
  {
    id: 'send-approval-pending-email',
    retries: 3,
    concurrency: { key: 'event.data.customerId', limit: 1 },
  },
  { event: 'approval.created' },
  async ({ event, step }) => {
    const { approvalId, customerId } = event.data

    // ── Step 1: Load approval row + customer email ────────────────────────
    const approvalData = await step.run('load-approval-data', async (): Promise<{
      approvalId: string
      kind: string
      expiresAt: string
      customerEmail: string
      firstName: string
    } | null> => {
      // Un-generic client for approval_queue (not yet in database.types.ts)
      const aqClient = getApprovalQueueClient()

      // Fetch approval_queue row
      const { data: approvalRaw, error: approvalError } = await aqClient
        .from('approval_queue')
        .select('id, kind, expires_at, state')
        .eq('id', approvalId)
        .single()

      if (approvalError || !approvalRaw) {
        throw new Error(
          `[send-approval-pending-email] approval_queue row not found: ${approvalId}`
        )
      }

      const approval = approvalRaw as ApprovalQueueSelectRow

      if (approval.state !== 'pending') {
        // Already actioned — skip email
        return null
      }

      // Fetch customer email from user_profiles (typed client — user_profiles IS in database.types.ts)
      const admin = getAdminClient()
      const { data: profile, error: profileError } = await admin
        .from('user_profiles')
        .select('id, email, full_name')
        .eq('id', customerId)
        .single()

      if (profileError || !profile) {
        throw new Error(
          `[send-approval-pending-email] user_profiles row not found for customerId: ${customerId}`
        )
      }

      // Derive first name from full_name (e.g. "Jane Smith" → "Jane")
      const firstName = profile.full_name?.split(' ')[0]?.trim() ?? 'there'

      return {
        approvalId: approval.id,
        kind: approval.kind,
        expiresAt: approval.expires_at,
        customerEmail: profile.email,
        firstName,
      }
    })

    // Customer already actioned — nothing to do
    if (!approvalData) {
      return { skipped: true, reason: 'already_actioned' }
    }

    // ── Step 2: Generate signed token ─────────────────────────────────────
    const signedToken = await step.run('generate-signed-token', async () => {
      return signApprovalToken({
        approvalId: approvalData.approvalId,
        expiresAt: approvalData.expiresAt,
      })
    })

    // ── Step 3: Send approval-pending email ───────────────────────────────
    const emailResult = await step.run('send-email', async () => {
      const appUrl = getAppUrl()
      const ctaUrl = `${appUrl}/approvals/quick/${encodeURIComponent(signedToken)}`
      const description = kindToDescription(approvalData.kind)

      const result = await sendEmail({
        to: approvalData.customerEmail,
        subject: 'Action required — your review is needed',
        react: React.createElement(ApprovalPendingEmail, {
          firstName: approvalData.firstName,
          signedToken: ctaUrl, // pass the full URL as signedToken (template uses it directly)
          approvalDescription: description,
        }),
        text: [
          `${approvalData.firstName}, your input is needed.`,
          '',
          `Your team has prepared ${description}. Before it goes live, we need your sign-off.`,
          '',
          `Review & approve in one click: ${ctaUrl}`,
          '',
          'This link expires in 7 days. After that, you can review drafts from your dashboard.',
          '',
          '— Beamix',
        ].join('\n'),
      })

      if (!result.ok) {
        throw new Error(`[send-approval-pending-email] Email send failed: ${result.error}`)
      }

      return { messageId: result.messageId }
    })

    return {
      approvalId,
      customerId,
      messageId: emailResult.messageId,
    }
  }
)
