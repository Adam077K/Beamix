# Beamix — Email System Spec

> **Last synced:** March 2026 — aligned with 03-system-design/

**Version:** 1.1
**Date:** 2026-02-28
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Status:** Updated

> Email provider: **Resend**. Templates: **React Email**. All sends go through one typed wrapper.

---

## Trial Duration — UPDATED ⚠️

**Trial duration:** **7 days** (updated 2026-03-05 per System Design v2.1). Starts on **first dashboard visit** (not signup).
- Trial nudge emails: Day 3 and Day 6 (not Day 7 and Day 12 as previously specced — update template names/timing below)
- `trial-day7.tsx` → rename logic to `trial-day3.tsx` (fires on Day 3 of trial)
- `trial-day12.tsx` → rename logic to `trial-day6.tsx` (fires on Day 6 of trial)
- Trial credit cap during trial: 5 agent credits

---

## Architecture

```
src/lib/email/
  resend.ts          — Resend client singleton
  send.ts            — sendEmail() wrapper
  events.ts          — 15 named trigger functions
  types.ts           — EmailPayload, EmailCategory, SendEmailResult
  templates/
    welcome.tsx
    scan-complete.tsx
    agent-complete.tsx
    trial-start.tsx
    trial-day7.tsx
    trial-day12.tsx
    trial-expired.tsx
    upgrade-confirmation.tsx
    invoice-receipt.tsx
    payment-failed.tsx
    cancellation.tsx
    weekly-digest.tsx
    ranking-drop.tsx
    competitor-moved.tsx
    magic-link.tsx     — override Supabase default
```

### `resend.ts`
```typescript
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
```

### `send.ts`
```typescript
import { resend } from './resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

export interface SendEmailOptions {
  to: string
  subject: string
  template: ReactElement
  from?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const html = render(opts.template)
    const { data, error } = await resend.emails.send({
      from: opts.from ?? 'Beamix <hello@beamix.io>',
      to: opts.to,
      subject: opts.subject,
      html,
      replyTo: opts.replyTo,
      tags: opts.tags,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[sendEmail] error', err)
    return { success: false, error: 'Internal email error' }
  }
}
```

### `events.ts` — Trigger functions

```typescript
// One named function per email event.
// Import in API routes / webhooks / cron handlers.

export async function sendWelcome(params: { to: string; firstName: string; scanId: string; score: number })
export async function sendScanComplete(params: { to: string; firstName: string; scanId: string; score: number; topEngine: string; topQuickWin: string })
export async function sendAgentComplete(params: { to: string; firstName: string; agentType: string; jobId: string; contentTitle: string; contentPreview: string })
export async function sendTrialStart(params: { to: string; firstName: string; trialEndsAt: Date; planName: string })
export async function sendTrialDay7(params: { to: string; firstName: string; scansCount: number; agentUsesCount: number; trialEndsAt: Date })
export async function sendTrialDay12(params: { to: string; firstName: string; trialEndsAt: Date })
export async function sendTrialExpired(params: { to: string; firstName: string })
export async function sendUpgradeConfirmation(params: { to: string; firstName: string; planName: string; nextBillingDate: Date })
export async function sendInvoiceReceipt(params: { to: string; firstName: string; amount: number; invoiceUrl: string })
export async function sendPaymentFailed(params: { to: string; firstName: string; retryDate: Date; updateBillingUrl: string })
export async function sendCancellationConfirmation(params: { to: string; firstName: string; accessUntil: Date })
export async function sendWeeklyDigest(params: { to: string; firstName: string; businessName: string; scoreChange: number; topMover: string; newCompetitorMentions: number; recommendedAction: string })
export async function sendRankingDrop(params: { to: string; firstName: string; businessName: string; engine: string; positionBefore: number; positionAfter: number; dashboardUrl: string })
export async function sendCompetitorMoved(params: { to: string; firstName: string; businessName: string; competitorName: string; engine: string })
```

---

## All 15 Emails

### 1. Welcome Email
- **Trigger:** Supabase `auth.users` INSERT → `handle_new_user()` DB function → Edge Function calls `sendWelcome()`
- **Subject:** `"Your AI visibility scan is ready — [score]/100"`
- **Content:**
  - Score badge (large number, color-coded)
  - Top 3 quick wins (blurred/teased)
  - CTA: "View Your Full Report →" → `/dashboard`
- **Required data:** `firstName`, `scanId`, `score`
- **Opt-out:** Not opt-outable (transactional)
- **Timing:** Immediate after user creation (with scan already imported via Option A flow)

---

### 2. Magic Link / Email Verification
- **Trigger:** Supabase Auth built-in (override template in Supabase Dashboard)
- **Subject:** `"Sign in to Beamix"`
- **Content:** Standard magic link button
- **Opt-out:** Not opt-outable

---

### 3. Scan Complete
- **Trigger:** Scan worker marks `scans.status = 'completed'` → calls `sendScanComplete()` from scan service
- **Subject:** `"Your GEO score: [score]/100 — here's what we found"`
- **Content:**
  - Score + change from last scan (↑/↓)
  - Top engine breakdown (3 engines, score per engine)
  - #1 quick win
  - CTA: "View Full Results →" → `/dashboard`
- **Required data:** `firstName`, `scanId`, `score`, `topEngine`, `topQuickWin`
- **Opt-out:** `notification_preferences.scan_complete_emails`
- **Timing:** Immediate when scan completes

---

### 4. Agent Job Complete
- **Trigger:** Agent worker marks `agent_jobs.status = 'completed'` → calls `sendAgentComplete()` from agent service
- **Subject:** `"[Agent Name] finished: [content title]"`
- **Content:**
  - Agent name + type
  - Content title + 2-sentence preview
  - Status badge (approved / needs review)
  - CTA: "Review Content →" → `/dashboard/content/[id]`
- **Required data:** `firstName`, `agentType`, `jobId`, `contentTitle`, `contentPreview`
- **Opt-out:** `notification_preferences.agent_complete_emails` (default: on)
- **Timing:** Immediate when job completes

---

### 5. Trial Start
- **Trigger:** First scan begins (`POST /api/scan/start` or `/api/scan/[id]/claim` for free scan import)
- **Subject:** `"Your 7-day Beamix trial has started"`
- **Content:**
  - What's included in trial
  - Trial end date (formatted)
  - "How to make the most of it" — 3 action items
  - CTA: "Go to Dashboard →"
- **Timing:** Immediate on trial start
- **Opt-out:** Not opt-outable (transactional trial notification)

---

### 6. Trial Day 3 Nudge
- **Trigger:** Inngest cron (`cron.trial-nudges`) — daily at 10:00 AM UTC. Checks `subscriptions` where `trial_starts_at + 3 days = today` and `status = 'trialing'` (midpoint of 7-day trial)
- **Subject:** `"Halfway through your trial — here's your progress"`
- **Content:**
  - Scans completed count
  - Agent uses count
  - Score change since trial start
  - CTA: "See What's Left to Improve →"
- **Timing:** Day 7 of trial, 09:00 user local time (approximate via UTC)
- **Opt-out:** Not opt-outable

---

### 7. Trial Day 6 — Urgency
- **Trigger:** Same Inngest cron, checks `trial_ends_at - now() <= 1 day`
- **Subject:** `"1 day left in your Beamix trial"`
- **Content:**
  - What gets locked when trial ends (list)
  - Current score + what they've improved
  - Pricing CTA: "Keep My Rankings →" → `/pricing`
- **Opt-out:** Not opt-outable

---

### 8. Trial Expired
- **Trigger:** Same cron, day after `trial_ends_at`
- **Subject:** `"Your trial has ended — keep your rankings"`
- **Content:**
  - What's now locked
  - Their final score summary
  - Upgrade options (3 plans)
  - CTA: "Choose a Plan →" → `/pricing`
- **Opt-out:** Not opt-outable (one-time send only)

---

### 9. Upgrade Confirmation
- **Trigger:** Paddle webhook `transaction.completed`
- **Subject:** `"Welcome to Beamix [Plan Name]"`
- **Content:**
  - Plan name + features now unlocked
  - Next billing date + amount
  - CTA: "Explore Your Dashboard →"
- **Opt-out:** Not opt-outable

---

### 10. Invoice Receipt
- **Trigger:** Paddle webhook `transaction.completed`
- **Subject:** `"Beamix receipt — [amount]"`
- **Content:**
  - Amount + date
  - Invoice PDF link
  - Plan name
- **Opt-out:** Not opt-outable

---

### 11. Payment Failed
- **Trigger:** Paddle webhook `transaction.payment_failed`
- **Subject:** `"Action required: payment failed"`
- **Content:**
  - Amount that failed
  - Retry date (Paddle auto-retries)
  - CTA: "Update Payment Method →" → Paddle billing portal
- **Opt-out:** Not opt-outable

---

### 12. Cancellation Confirmation
- **Trigger:** Paddle webhook `subscription.canceled`
- **Subject:** `"Your Beamix subscription has been cancelled"`
- **Content:**
  - Access until date (end of billing period)
  - Data retention notice (we keep their data)
  - Re-subscribe CTA (subtle, no coupon)
- **Opt-out:** Not opt-outable
- **Note:** No discount coupon in cancellation — avoids training users to cancel for discounts

---

### 13. Weekly Digest
- **Trigger:** Vercel Cron every Monday 08:00 UTC → `/api/cron/weekly-digest`
  - Batches users (50 per batch, 1s delay between batches — Resend rate limit)
  - Skips users opted out or with no scans in 30 days
- **Subject:** `"Your AI visibility this week: [↑/↓ X points]"`
- **Content:**
  - GEO score change (week-over-week)
  - Top engine mover
  - New competitor mentions
  - Recommended action (top unresolved quick win)
  - CTA: "View Dashboard →"
- **Opt-out:** `notification_preferences.weekly_digest` (default: on)

---

### 14. Significant Ranking Drop Alert
- **Trigger:** Post-scan comparison in scan service. If any engine ranking drops ≥ 3 positions vs. last scan → fire alert
- **Subject:** `"Alert: Your [Engine] ranking dropped"`
- **Content:**
  - Engine name + position change (e.g., "ChatGPT: #3 → #6")
  - Likely cause (if determinable)
  - CTA: "View Dashboard →"
- **Opt-out:** `notification_preferences.ranking_alerts` (default: on)
- **Throttle:** Max 1 alert per business per 24h

---

### 15. Competitor Moved Above You
- **Trigger:** Post-scan competitor comparison. If competitor moves ahead in any engine
- **Subject:** `"[Competitor] is now outranking you on [Engine]"`
- **Content:**
  - Competitor name + engine
  - Their estimated score vs. yours
  - CTA: "See Competitor Analysis →" → `/dashboard/competitors`
- **Opt-out:** `notification_preferences.competitor_alerts` (default: on)
- **Throttle:** Max 1 alert per competitor per 48h

---

## Cron Config (Inngest)

Per System Design v2.1, all cron jobs run as Inngest functions (not Vercel Cron):

| Function | Schedule | Purpose |
|---|---|---|
| `cron.trial-nudges` | Daily 10:00 AM UTC | Day 3 and Day 6 trial nudge emails |
| `cron.weekly-digest` | Monday 8:00 AM UTC | Weekly ranking digest to all active users |

All Inngest functions are served via `/api/inngest` endpoint. Inngest handles retry, concurrency, and observability.

---

## `notification_preferences` Table

```sql
CREATE TABLE public.notification_preferences (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Email preferences
    scan_complete_emails    BOOLEAN NOT NULL DEFAULT true,
    agent_complete_emails   BOOLEAN NOT NULL DEFAULT true,
    weekly_digest           BOOLEAN NOT NULL DEFAULT true,
    ranking_alerts          BOOLEAN NOT NULL DEFAULT true,
    competitor_alerts       BOOLEAN NOT NULL DEFAULT true,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create on signup
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_prefs
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_notification_preferences();
```

**RLS:**
```sql
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: own preferences only"
    ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);
```

---

## Category Summary

| Category | Opt-outable | Emails |
|---|---|---|
| TRANSACTIONAL | No | Welcome, Magic Link, Scan Complete*, Upgrade, Receipt, Payment Failed, Cancellation |
| TRIAL | No | Trial Start, Day 7, Day 12, Expired |
| ENGAGEMENT | Yes | Agent Complete, Weekly Digest, Ranking Drop, Competitor Moved |

*Scan Complete: opt-outable after the first scan (first scan = welcome flow, subsequent = opt-out allowed)
