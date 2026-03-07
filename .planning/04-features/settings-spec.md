# Beamix — Settings & Billing Spec

> **Last synced:** March 2026 — aligned with 03-system-design/

**Version:** 1.1
**Date:** 2026-02-28
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Status:** Updated

> Settings is where trust is built or broken. The billing section especially must be transparent, predictable, and never surprising. No dark patterns.

---

## Trial Model — The Foundation

Before any UI spec, the trial logic must be clear because it affects every screen.

### Trial Rules

| Property | Value |
|---|---|
| Duration | 7 days from first dashboard visit (NOT from signup) |
| Credit card required to start | No |
| What's accessible during trial | Scan results, ranking data, leaderboard, competitor names, quick wins (3 free recs) |
| What's locked during trial | All AI agents, additional scans, full recommendations, content library |
| After trial expires (no upgrade) | Read-only state — all data persists, no features run |
| After upgrade | Immediate feature unlock — plan features active within seconds |

### Trial State Logic

```
User signs up → completes onboarding → arrives at /dashboard (FIRST VISIT)
     │
     ├── Trial starts (7 days from first dashboard visit)
     │       │
     │       ├── Can see: scan results, rankings, leaderboard, 3 quick wins
     │       └── Cannot use: agents, extra scans, full recommendations
     │
     ├── Day 7 passes without upgrade
     │       │
     │       └── Read-only state (indefinite)
     │               │
     │               └── All data visible but frozen
     │                   "Upgrade to continue" persistent banner
     │
     └── User upgrades at any point
             │
             └── Paddle Checkout → payment → webhook → plan_tier updated
                     │
                     └── Immediate unlock of all plan features
```

### Where Trial State Shows in the UI

| Location | Trial Behavior |
|---|---|
| Dashboard — Zone 3 (Action Queue) | Shows 3 items but all "Fix with Agent" buttons locked with lock icon + "Upgrade to unlock" |
| Dashboard — Zone 4 (Recent Activity) | "No content yet — agents unlock when you upgrade" |
| Agents page | All agent cards show lock icon overlay. Clicking shows upgrade modal. |
| Rankings page | Fully accessible — this is the "see your pain" data |
| Content page | Empty with locked state illustration |
| Sidebar — Agent usage | "0 / 0 — Upgrade to unlock agents" |

---

## Trial Banner

**Shown during active trial — top of every dashboard page, dismissible once per session:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ✦  Your free trial ends in [X] days.                           │
│     You can see your AI visibility — upgrade to fix it.         │
│                                [Choose a Plan →]    [✕ Dismiss] │
└─────────────────────────────────────────────────────────────────┘
```

**Color:** Amber/warm. Not red (not alarming), not green (not celebratory). It's a nudge.

**Copy variations by day:**
- Days 1–4: `"Your free trial ends in [X] days. You can see your AI visibility — upgrade to fix it."`
- Days 5–6: `"[X] days left in your trial. Your competitors are already ranking higher."`
- Day 7 (last day): `"Today is your last trial day. Don't lose access to your scan data."`

---

## Post-Trial Read-Only State

**When trial expires without upgrade:**

**Full-width banner (non-dismissible, persistent):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Your trial has ended. Your data is safe — upgrade to continue  │
│  fixing your AI visibility.                [Choose a Plan →]    │
└─────────────────────────────────────────────────────────────────┘
```

**Dashboard zones in read-only:**
- Zone 1 (Rank): Visible but shows "Last updated: [date of last scan]" — makes staleness visible
- Zone 2 (Leaderboard): Visible — competitors are still ahead, which is motivating
- Zone 3 (Action Queue): Items visible but all CTAs locked: `[🔒 Upgrade to Fix This]`
- Zone 4 (Recent Activity): Empty or shows locked state
- Zone 5 (Engine Status): Visible — no new scans running

**Agent pages:** All locked. Clicking any agent → upgrade modal.

**Scan page:** If user shares their `/scan/[id]` URL publicly, it remains accessible forever (per the 30-day rule, then expires gracefully).

---

## Settings Page (`/dashboard/settings`)

### Tab Structure

```
[Business Profile]  [Billing]  [Preferences]  [Integrations]
```

---

## Tab 1 — Business Profile

**Purpose:** The data Beamix uses to scan and generate content. Keeping it accurate = better results.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Business Profile                           [Save Changes]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Business Name *                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Yael Insurance                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Website URL *                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  https://yael-insurance.co.il                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Industry *                                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Insurance                                             ▼  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Primary Market (City / Region) *                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Tel Aviv                                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Business Description (optional)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Brief description of what your business does.            │  │
│  │  Used to give agents context when generating content.     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  500 characters max                                             │
│                                                                 │
│  Services / Keywords (optional)                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [home insurance ✕] [car insurance ✕] [+ Add]            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  These help agents write more specific, relevant content.       │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Tracked Competitors                    3 / 3 (Starter limit)  │
│                                                                 │
│  ┌──────────────────────────────┐ [+ Add Competitor]           │
│  │  Phoenix Group               │ [✕]                          │
│  │  phoenix.co.il               │                              │
│  └──────────────────────────────┘                              │
│  ┌──────────────────────────────┐                              │
│  │  Harel Insurance             │ [✕]                          │
│  │  harel.co.il                 │                              │
│  └──────────────────────────────┘                              │
│                                                                 │
│  At your plan limit. [Upgrade to track more competitors →]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Business Name | Text | Yes | Used in all agent outputs and scan display |
| Website URL | URL | Yes | Primary scan target. Changing triggers recommendation refresh. |
| Industry | Dropdown | Yes | Must match industry constants (same list as onboarding) |
| Primary Market | Text | Yes | City/region. Changing triggers recommendation refresh. |
| Business Description | Textarea | No | 500 char max. Used as agent context. |
| Services/Keywords | Tag input | No | Up to 10 tags. Used in agent prompts. |
| Tracked Competitors | List of name+URL | No | Plan-limited (Starter: 3, Pro: 5, Business: 10) |

### Save Behavior
- "Save Changes" button is only active when there are unsaved changes (dirty state)
- Saves all fields at once on button click — not on blur
- Success toast: "Profile saved. We'll refresh your recommendations at the next scan."
- If URL or location changed: trigger recommendation regeneration flag in background (cron job picks this up on next cycle)

### Competitor Management
- "+ Add Competitor" opens small inline form: name (text) + URL (text)
- If at plan limit: button shows as disabled with tooltip "Upgrade to add more competitors"
- Delete: confirm prompt "Remove [Competitor Name] from tracking? Their historical data will be deleted."

---

## Tab 2 — Billing

### Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Billing                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CURRENT PLAN                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Pro Plan                              $149 / month       │  │
│  │  Billed monthly                                           │  │
│  │                                                           │  │
│  │  Next billing date: March 28, 2026                        │  │
│  │  Payment: Visa ending in 4242                             │  │
│  │                                                           │  │
│  │  [Change Plan]    [Update Payment Method]                 │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  USAGE THIS PERIOD                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  Agent Uses          │  │  Tracked Queries     │           │
│  │  8 / 15              │  │  18 / 25             │           │
│  │  [████████░░░░░░]    │  │  [████████████░░░]   │           │
│  │  Resets Mar 28       │  │  25 max on Pro       │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                 │
│  Need more agent uses this month?                               │
│  [5 uses — $15]   [15 uses — $35]                              │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  INVOICE HISTORY                                                │
│                                                                 │
│  Feb 28, 2026   Pro Plan   $149.00   [Download PDF]            │
│  Jan 28, 2026   Pro Plan   $149.00   [Download PDF]            │
│  Dec 28, 2025   Starter    $49.00    [Download PDF]            │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  [Cancel Subscription]                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Trial State — Billing Tab

**When user is in 7-day trial:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Billing                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FREE TRIAL                                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Free Trial                         [X] days remaining   │  │
│  │  No credit card on file                                   │  │
│  │                                                           │  │
│  │  During your trial, you can see your AI visibility        │  │
│  │  results. Upgrade to unlock agents and start fixing it.   │  │
│  │                                                           │  │
│  │  [Choose Your Plan →]                                     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  WHAT YOU GET WHEN YOU UPGRADE                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Starter     │  │  Pro         │  │  Business            │  │
│  │  $49/mo      │  │  $149/mo     │  │  $349/mo             │  │
│  │  5 agents    │  │  15 agents   │  │  50 agents           │  │
│  │  10 queries  │  │  25 queries  │  │  75 queries          │  │
│  │  [Select]    │  │  [Select]    │  │  [Select]            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  No credit card required during trial.                          │
│  Your scan data is saved and ready when you upgrade.            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Change Plan Flow

**Triggered by:** "Change Plan" button on Billing tab, or "Upgrade" buttons anywhere in the app.

**Step 1 — Plan Comparison Modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Choose Your Plan                                        [✕]   │
│                                                                 │
│  [Monthly]  [Annual — Save 20%]   ← toggle                     │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  Starter   │  │  Pro         │  │  Business             │   │
│  │            │  │  [Current]   │  │                       │   │
│  │  $49/mo    │  │  $149/mo     │  │  $349/mo              │   │
│  │            │  │              │  │                       │   │
│  │  10 queries│  │  25 queries  │  │  75 queries           │   │
│  │  5 agents  │  │  15 agents   │  │  50 agents            │   │
│  │  Weekly    │  │  Every 3d    │  │  Daily scans          │   │
│  │  4 engines │  │  8 engines   │  │  10+ engines          │   │
│  │            │  │              │  │                       │   │
│  │  [Select]  │  │  Current     │  │  [Select]             │   │
│  └────────────┘  └──────────────┘  └───────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2 — Downgrade warning (if applicable):**
If user selects a lower plan than current:
```
┌─────────────────────────────────────────────────────────────────┐
│  Downgrade to Starter?                                   [✕]   │
│                                                                 │
│  You currently have 18 tracked queries.                         │
│  Starter allows 10. The extra 8 will be paused —               │
│  not deleted. You can reactivate them if you upgrade again.     │
│                                                                 │
│  You will also lose access to:                                  │
│  ✗  Review Analyzer agent                                       │
│  ✗  Social Strategy agent                                       │
│  ✗  5 competitor tracked slots                                  │
│                                                                 │
│  Changes take effect at end of current billing period.          │
│  (March 28, 2026)                                               │
│                                                                 │
│  [Cancel]              [Confirm Downgrade]                      │
└─────────────────────────────────────────────────────────────────┘
```

**Step 3 — Paddle Checkout (for upgrade or new plan after trial):**
- Redirect to Paddle-hosted checkout page
- Pre-filled with user email from Supabase auth
- On success: Paddle sends webhook → `transaction.completed`
- Webhook handler: updates `subscriptions` table, credits, plan_tier
- User redirected back to: `/dashboard/settings/billing?upgrade=success`

**Success state on return:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ✦  Welcome to Pro! Your plan is now active.                    │
│     All features are unlocked. Let's fix your visibility.       │
│                                          [Go to Dashboard →]   │
└─────────────────────────────────────────────────────────────────┘
```

### Update Payment Method

- Button: "Update Payment Method"
- Action: redirect to Paddle Customer Portal (`/api/paddle/create-portal-session`)
- Paddle Portal handles: card update, billing history download, subscription management
- On return: back to `/dashboard/settings/billing`

### Cancel Subscription Flow

**Button:** `Cancel Subscription` — small, muted, at bottom of Billing tab.

**Retention modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Before you go...                                        [✕]   │
│                                                                 │
│  You've improved your AI visibility by [X] points since        │
│  joining. Cancelling means:                                     │
│                                                                 │
│  ✗  No more weekly scans — you'll lose sight of competitors    │
│  ✗  Agents stop generating content for you                      │
│  ✗  Your ranking progress will stall                            │
│                                                                 │
│  Would you prefer to pause instead?                             │
│  Switch to Starter ($49/mo) and keep your scan history.         │
│                                                                 │
│  [Switch to Starter]     [Cancel Anyway]                        │
└─────────────────────────────────────────────────────────────────┘
```

**If "Cancel Anyway":**
- Cancel takes effect at end of current billing period
- User keeps access until then
- Toast: "Subscription cancelled. You have access until March 28, 2026."
- Paddle webhook `subscription.canceled` → update subscriptions table

### Add-On Purchase (Agent Top-Up)

```
Need more agent uses this month?

[5 uses for $15]    [15 uses for $35]
```

- Each button triggers Paddle Checkout in "payment" mode (one-time, not subscription)
- On success: webhook → `credit_pools` table updated → toast "5 agent uses added"

### Invoice History

- List: date, plan, amount, [Download PDF]
- PDF download links directly to Paddle-hosted invoice PDF
- Show last 12 invoices. "Load more" for older.

---

## Tab 3 — Preferences

```
┌─────────────────────────────────────────────────────────────────┐
│  Preferences                                [Save Changes]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Interface Language                                             │
│  ○ English        ● עברית (Hebrew)                             │
│  Changes the dashboard language and layout direction.           │
│                                                                 │
│  Content Generation Language                                    │
│  ○ English        ○ Hebrew        ● Both (agent decides)        │
│  Default language for content agents produce.                   │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  Email Notifications                                            │
│                                                                 │
│  [✓]  Weekly ranking digest (every Monday)                      │
│  [✓]  When agents finish generating content                     │
│  [✓]  When your ranking changes significantly (±3 positions)    │
│  [ ]  Product updates and new features                          │
│  [ ]  Marketing tips and GEO guides                             │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  Timezone                                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Asia/Jerusalem (UTC+2)                                ▼  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  Used for scan timing and email delivery.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Dev note:** Interface language switch is immediate — no page reload. Uses React state + i18n context. RTL layout activates instantly when Hebrew is selected. Content generation language is stored in user preferences and read by all agent modals as default.

---

## Tab 4 — Integrations

Per System Design v2.1, the integration hub supports 5 platforms (+ Paddle billing, which is in the Billing tab):

```
┌─────────────────────────────────────────────────────────────────┐
│  Integrations                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Connect Beamix to your platforms.                              │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   WordPress      │  │  Google          │  │  Google      │  │
│  │   CMS Publish    │  │  Analytics (GA4) │  │  Search      │  │
│  │   [Pro+]         │  │  [Growth Phase]  │  │  Console     │  │
│  │   [Connect →]    │  │  [Coming Soon]   │  │  [Growth]    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │   Slack          │  │  Cloudflare      │                     │
│  │   Alert Delivery │  │  DNS/CDN         │                     │
│  │   [Growth Phase] │  │  [Business]      │                     │
│  │   [Coming Soon]  │  │  [Coming Soon]   │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                 │
│  ─────────────────────────────────────────────────────────      │
│                                                                 │
│  [ ] Notify me when integrations launch                         │
│                                                                 │
│  We'll email you as each integration becomes available.         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Dev note:** WordPress is launch-critical (Pro tier, one-click CMS publish). GA4, GSC, Slack are Growth Phase. Cloudflare is Moat Builder (Business tier). All integration credentials encrypted with AES-256-GCM at application layer. OAuth flow for GA4/GSC. "Notify me" toggle is boolean in `notification_preferences`.

---

## Locked States During Trial — Detailed

### Agents Page (Trial)

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Agents                                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔒  Agents unlock when you choose a plan               │   │
│  │  Your scan showed [X] fixable issues. Agents fix them.  │   │
│  │  [Choose a Plan →]              [X] days left in trial  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Content      │  │ Blog Writer  │  │ FAQ Agent    │          │
│  │ Writer       │  │              │  │              │          │
│  │              │  │              │  │              │          │
│  │  [🔒 Locked] │  │  [🔒 Locked] │  │  [🔒 Locked] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ... (all 16 agents locked during trial)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Action Queue Cards (Trial)

```
┌──────────────────────────────────────────────────────┐
│  [HIGH IMPACT]                                       │
│  You're missing a FAQ page                           │
│                                                      │
│  Gemini ranks businesses with FAQ content 2x higher. │
│  Your competitor Harel Insurance has one. You don't. │
│                                                      │
│  Affects: ChatGPT, Gemini  ·  1 agent use            │
│                                                      │
│  [🔒 Upgrade to Fix This →]                          │
└──────────────────────────────────────────────────────┘
```

**Dev note:** During trial, all "Fix with Agent" buttons render as `[🔒 Upgrade to Fix This →]`. Clicking opens the upgrade modal (plan selection → Paddle Checkout). The recommendation data is real — only the action is gated.

---

## Paddle Webhook Events to Handle

| Event | Action |
|---|---|
| `transaction.completed` | Activate subscription, update plan_tier, allocate credits |
| `customer.subscription.updated` | Sync plan changes, update limits |
| `subscription.canceled` | Downgrade to read-only, clear plan_tier |
| `transaction.completed` | Record invoice, reset monthly credits |
| `transaction.payment_failed` | Flag subscription as past_due, show payment failure banner |
| `subscription.trial_expiring` | Send email 2 days before trial ends (Paddle handles this) |

**Dev note:** All webhook events must be idempotent — check `event.id` before processing to handle duplicates.

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent)*
*Trial duration: 7 days from first dashboard visit, no credit card required. 5 agent credit cap during trial. Read-only after trial expires.*
