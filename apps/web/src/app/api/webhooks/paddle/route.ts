/**
 * POST /api/webhooks/paddle
 *
 * Receives and processes Paddle webhook events.
 * Verifies HMAC signature before processing.
 *
 * Handled events:
 * - subscription.created  → upsert subscriptions row + fire Inngest activation event + welcome email
 * - subscription.updated  → upsert subscriptions row
 * - subscription.canceled → mark subscription canceled
 * - transaction.payment_failed → insert notification for user + payment-failed email
 */

import { NextResponse } from 'next/server'
import { Paddle, EventName } from '@paddle/paddle-node-sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { inngest } from '@/inngest/client'
import { sendEmail } from '@/lib/resend/send'
import { welcomeHtml, welcomeText } from '@/lib/resend/templates/welcome'
import { paymentFailedHtml, paymentFailedText } from '@/lib/resend/templates/payment-failed'

const paddle = new Paddle(process.env['PADDLE_API_KEY'] ?? '')
const webhookSecret = process.env['PADDLE_WEBHOOK_SECRET'] ?? ''

const APP_BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.beamix.tech'

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature') ?? ''
  const raw = await req.text()

  let event
  try {
    event = await paddle.webhooks.unmarshal(raw, webhookSecret, signature)
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: 'Paddle webhook verification failed' } },
      { status: 401 },
    )
  }

  if (!event) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated: {
      const sub = event.data as {
        id: string
        customerId: string
        status: string
        customData?: { user_id?: string }
        items?: Array<{ price?: { id?: string } }>
        currentBillingPeriod?: { endsAt?: string }
      }
      const userId = sub.customData?.user_id
      if (!userId) break

      const priceId = sub.items?.[0]?.price?.id
      const planTier = resolvePlanTier(priceId)

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan_tier: planTier,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId,
          status: sub.status,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

      if (event.eventType === EventName.SubscriptionCreated && planTier) {
        await inngest.send({
          name: 'paddle.subscription.activated',
          data: {
            subscriptionId: sub.id,
            userId,
            planTier,
            priceId: priceId ?? '',
            activatedAt: new Date().toISOString(),
          },
        })

        // Send welcome email on new subscription
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email, first_name')
            .eq('user_id', userId)
            .maybeSingle()
          if (profile?.email) {
            const dashboardUrl = `${APP_BASE_URL}/dashboard`
            const props = {
              firstName: profile.first_name ?? '',
              dashboardUrl,
            }
            await sendEmail({
              to: profile.email,
              subject: 'Welcome to Beamix',
              html: welcomeHtml(props),
              text: welcomeText(props),
            })
          }
        } catch (err) {
          console.error('[paddle-webhook] Failed to send welcome email:', err)
        }
      }
      break
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data as { id: string }
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('paddle_subscription_id', sub.id)
      break
    }

    case EventName.TransactionPaymentFailed: {
      const tx = event.data as {
        id: string
        customData?: { user_id?: string }
        details?: {
          totals?: { total?: string; currencyCode?: string }
          payments?: Array<{ methodDetails?: unknown; scheduledAt?: string | null }>
        }
      }
      const userId = tx.customData?.user_id
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'payment_failed',
          title: 'Payment failed',
          body: "We couldn't process your payment. Update your billing details to keep your plan active.",
          action_url: '/settings?tab=billing',
          payload: { transactionId: tx.id },
        })

        // Send payment-failed email
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email, first_name')
            .eq('user_id', userId)
            .maybeSingle()
          if (profile?.email) {
            const rawTotal = tx.details?.totals?.total
            const amount = rawTotal ? formatAmount(rawTotal, tx.details?.totals?.currencyCode) : 'your subscription amount'
            const scheduledAt = tx.details?.payments?.[0]?.scheduledAt ?? null
            const nextRetryDate = scheduledAt
              ? new Date(scheduledAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : null
            const billingUrl = `${APP_BASE_URL}/settings?tab=billing`
            const props = {
              firstName: profile.first_name ?? '',
              billingUrl,
              amount,
              nextRetryDate,
            }
            await sendEmail({
              to: profile.email,
              subject: 'Payment failed — Beamix',
              html: paymentFailedHtml(props),
              text: paymentFailedText(props),
            })
          }
        } catch (err) {
          console.error('[paddle-webhook] Failed to send payment-failed email:', err)
        }
      }
      break
    }

    // TransactionCompleted — let subscription.updated handle subscription state
    default:
      break
  }

  return NextResponse.json({ ok: true })
}

function resolvePlanTier(
  priceId: string | undefined,
): 'discover' | 'build' | 'scale' | null {
  if (!priceId) return null
  if (
    priceId === process.env['PADDLE_PRICE_DISCOVER_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_DISCOVER_ANNUAL']
  )
    return 'discover'
  if (
    priceId === process.env['PADDLE_PRICE_BUILD_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_BUILD_ANNUAL']
  )
    return 'build'
  if (
    priceId === process.env['PADDLE_PRICE_SCALE_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_SCALE_ANNUAL']
  )
    return 'scale'
  return null
}

/**
 * Formats a Paddle amount (in lowest currency unit, e.g. cents) to a human-readable string.
 * Falls back to the raw value if currency is unknown.
 */
function formatAmount(raw: string, currencyCode?: string): string {
  const numeric = parseFloat(raw)
  if (isNaN(numeric)) return raw
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode ?? 'USD',
      minimumFractionDigits: 2,
    }).format(numeric / 100)
  } catch {
    return raw
  }
}
