# Beamix — Integration Hub & Billing System Spec

> **Version:** 1.0
> **Date:** 2026-03-08
> **Author:** Atlas (CTO)
> **Status:** Ready for implementation
> **Audience:** Engineers building integrations, billing, and the public API. Assumes no prior reading of system design docs.

---

## Critical Notes Before Reading

**Stripe is not used.** It was removed on 2026-03-02. Paddle is the ONLY payment provider. Any reference to Stripe in code or comments is a bug.

**'cancelled' is spelled with two Ls.** The `subscriptions.status` enum uses UK English: `'cancelled'`. Using `'canceled'` (US spelling) will cause silent bugs at the database level. This is the most common copy-paste error in this codebase.

**Free tier = null plan.** There is no `'free'` value in `plan_tier`. Free tier is represented as `subscriptions.plan_id = NULL`. The valid plan tier values are: `'starter' | 'pro' | 'business'`.

---

## 1. Feature Overview

This document covers three interconnected systems:

### Integration Hub
Connects Beamix to external tools so that:
- Generated content can be published to WordPress with one click (Pro+)
- Alert notifications can be delivered to Slack (Growth Phase)
- Traffic data from Google Analytics 4 correlates with visibility scores (Growth Phase)
- Search ranking data from Google Search Console enriches prompts (Growth Phase)
- AI crawler activity on the user's site is tracked via Cloudflare (Business tier, Moat Builder)

### Billing System (Paddle)
Handles:
- Subscription checkout, plan changes, and cancellation via Paddle
- Monthly credit allocation (base + rollover)
- One-time credit top-up purchases
- Hold/confirm/release credit pattern during agent execution
- Trial system: 7-day trial starting on first dashboard visit

### Public REST API (Business Tier)
Provides a developer REST API for Business tier subscribers to access their Beamix data programmatically, trigger scans, and run agents from external systems.

---

## 2. Integration Hub — Settings → Integrations Tab

All integrations are displayed in the Settings → Integrations tab. Each integration has a status badge (Connected / Coming Soon / Available).

### 2.1 Integration Availability by Phase

| Integration | Plan Requirement | Phase | Status |
|-------------|-----------------|-------|--------|
| WordPress | Pro+ | Launch | Available |
| GA4 | Pro+ | Growth Phase | Coming Soon |
| Google Search Console | Pro+ | Growth Phase | Coming Soon |
| Slack | Pro+ | Growth Phase | Coming Soon |
| Cloudflare | Business | Moat Builder | Coming Soon |
| API Keys | Business | Moat Builder | Coming Soon |

### 2.2 Why Each Integration Exists

**WordPress (Pro+, launch-critical):** The most important integration at launch. Users generate content via agents, then want to publish it directly to their website without leaving Beamix. Without this integration, they copy-paste. With it, they click "Publish to WordPress" from the content editor. This closes the scan → fix → publish loop.

**GA4 (Growth Phase):** Correlates AI visibility improvements with actual traffic from AI referral sources (chatgpt.com, perplexity.ai, claude.ai, etc.). Closes the revenue attribution gap — currently we can show score improvements, but not "this content improvement drove 340 extra sessions from Perplexity." Three competitors (AthenaHQ, Gauge, Goodie) already have this.

**Google Search Console (Growth Phase):** Traditional search rankings are a leading indicator of AI visibility. GSC data helps the scan engine generate better prompts ("what keywords does this business already rank for?") and enriches competitive analysis. Pulls weekly.

**Slack (Growth Phase):** Routes alert notifications to Slack channels. Primary use case: teams where the marketing person wants to share visibility alerts in a shared Slack channel without everyone logging into Beamix.

**Cloudflare (Business, Moat Builder):** When a user points Cloudflare at their domain, we can pull bot analytics to show which AI crawlers (GPTBot, ClaudeBot, Google-Extended) visit their site and which pages they access. This is the only way to get AI crawler data without a manual logs setup.

**API Keys (Business, Moat Builder):** Lets Business tier customers integrate Beamix data into their own dashboards, automate scans from CI/CD pipelines, or build custom reporting.

---

## 3. Integration Data Model

### 3.1 `integrations` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Owner (FK → auth.users(id) ON DELETE CASCADE) |
| business_id | uuid | NOT NULL | Associated business (FK → businesses(id) ON DELETE CASCADE) |
| provider | text | NOT NULL | CHECK IN ('wordpress', 'ga4', 'gsc', 'slack', 'cloudflare') |
| credentials | jsonb | NOT NULL | AES-256-GCM encrypted at application layer |
| config | jsonb | '{}' | Non-secret settings (site URL, property ID, channel name) |
| status | text | 'active' | CHECK IN ('active', 'inactive', 'error', 'expired') |
| last_sync_at | timestamptz | NULL | Last successful data pull |
| last_error | text | NULL | Most recent error message for UI display |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | |

**Indexes:**
- `idx_integrations_user_provider` on `(user_id, provider)` — quick lookup of "does user have this integration?"
- UNIQUE on `(business_id, provider)` — one connection per provider per business

**RLS:** Full CRUD for own businesses

### 3.2 Credential Encryption

Integration credentials (WordPress Application Passwords, OAuth tokens, Slack webhook URLs, Cloudflare API tokens) are encrypted at the **application layer** before being stored in Supabase. The encryption happens in the API route handler, not at the database layer.

**Algorithm:** AES-256-GCM
**Why GCM mode:** Provides authenticated encryption — both confidentiality and integrity. If the ciphertext is tampered with, decryption fails with an authentication error.
**Key:** `CREDENTIALS_ENCRYPTION_KEY` environment variable (32 bytes, hex-encoded, 64 hex characters)
**Storage format in JSONB:** `{ "iv": "hex", "authTag": "hex", "data": "hex" }`
**IV:** Random per-encryption (16 bytes). NEVER reuse an IV.

**Encryption function (server-side only):**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.CREDENTIALS_ENCRYPTION_KEY!, 'hex')

export function encryptCredentials(plaintext: object): { iv: string; authTag: string; data: string } {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(plaintext), 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted.toString('hex'),
  }
}

export function decryptCredentials(encrypted: { iv: string; authTag: string; data: string }): object {
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(encrypted.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.data, 'hex')),
    decipher.final(),
  ])
  return JSON.parse(decrypted.toString('utf8'))
}
```

**What this protects against:**
- Database breach: attacker gets the Supabase database but not Vercel env vars → credentials are useless
- Supabase employee access: cannot read credentials without the application-layer key
- Tampered data: GCM auth tag will fail if encrypted blob is modified

**What this does NOT protect against:** A compromised Vercel deployment that has access to both the database and the env var. This is an accepted risk — no practical defense at the application layer.

### 3.3 `api_keys` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Owner (FK → auth.users(id) ON DELETE CASCADE) |
| key_hash | text | NOT NULL | SHA-256 hash of the full API key. NEVER store plaintext. |
| key_prefix | text | NOT NULL | First 8 characters of the key (e.g., `bmx_abc1`) — shown in UI for identification |
| name | text | 'Default' | User-assigned label |
| scopes | text[] | '{read}' | CHECK (scopes <@ ARRAY['read', 'write', 'execute']::text[]) |
| rate_limit | integer | 100 | Requests per minute |
| last_used_at | timestamptz | NULL | |
| expires_at | timestamptz | NULL | NULL = no expiry |
| is_active | boolean | true | Can be disabled without deletion |
| created_at | timestamptz | NOW() | |

**Indexes:**
- `idx_api_keys_hash` on `(key_hash)` — O(1) lookup on every API request. This index is critical — every `/api/v1/*` request hits it.
- `idx_api_keys_user` on `(user_id)`

**RLS:** Full CRUD for own keys. UPDATE is restricted — you cannot change `key_hash` (immutable security property).

---

## 4. WordPress Integration — Technical Deep Dive

WordPress is the only launch-critical integration. Everything in this section must be implemented before launch.

### 4.1 Setup Flow

The user connects WordPress from Settings → Integrations → WordPress → "Connect":

1. User provides:
   - **Site URL** (e.g., `https://yael-insurance.co.il`) — stored in `integrations.config.site_url`
   - **Username** (their WordPress login username)
   - **Application Password** — generated in WordPress admin under Users → Profile → Application Passwords. NOT their login password.

2. Beamix immediately tests the connection (see §4.2)

3. If connection succeeds: encrypt credentials, insert `integrations` row, show "Connected" badge

4. What is stored in `integrations.credentials` (before encryption):
```json
{
  "username": "yael",
  "application_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
}
```

5. What is stored in `integrations.config` (plaintext, non-secret):
```json
{
  "site_url": "https://yael-insurance.co.il",
  "rest_api_base": "https://yael-insurance.co.il/wp-json/wp/v2"
}
```

### 4.2 Connection Test

**Route:** `POST /api/integrations/[id]/test-connection`
(Also called internally during initial setup before the integration row is created)

**What it does:**
1. Decrypt credentials from `integrations.credentials`
2. Construct Basic Auth header: `base64(username:application_password)`
3. Make GET request to `{site_url}/wp-json/wp/v2/users/me` with Authorization header
4. If 200 → connection valid, return `{ data: { connected: true, user_display_name: "..." } }`
5. If 401 → credentials wrong, return `{ error: "Invalid credentials. Check your username and Application Password." }`
6. If any other error → return `{ error: "Could not reach your WordPress site." }`

WordPress Application Passwords were introduced in WordPress 5.6 (2020). They look like `Abcd EfGh IjKl MnOp QrSt UvWx` — 24 characters in 6 groups of 4.

### 4.3 Content Publishing Flow

**Route:** `POST /api/content/[id]/publish`
**Input:** `{ provider: 'wordpress', publish_as: 'draft' | 'publish' }`

Full flow:

1. **Fetch content:** Load `content_items` row by `id`. Verify `content_body` is non-empty.

2. **Fetch integration:** Load `integrations` WHERE `business_id = content.business_id AND provider = 'wordpress' AND status = 'active'`. If not found: 400 "WordPress not connected for this business."

3. **Decrypt credentials:** Call `decryptCredentials(integration.credentials)`.

4. **Convert Markdown to HTML:**
   ```typescript
   import { marked } from 'marked'
   const htmlContent = marked.parse(content.content_body)
   ```
   Do NOT skip this step — WordPress expects HTML in the `content` field, not Markdown.

5. **POST to WordPress REST API:**
   ```
   POST {site_url}/wp-json/wp/v2/posts
   Authorization: Basic base64(username:application_password)
   Content-Type: application/json

   {
     "title": content.title,
     "content": htmlContent,
     "status": publish_as === 'publish' ? 'publish' : 'draft',
     "excerpt": content.meta_description ?? '',
     "meta": {
       "_yoast_wpseo_metadesc": content.meta_description ?? ''
     }
   }
   ```

6. **Handle response:**
   - 201 Created: extract `response.link` (the public URL), update `content_items` with `published_url`, `published_at`
   - 401: credentials expired → update `integrations.status = 'error'`, `integrations.last_error = "Credentials expired"`. Return 401 with message "WordPress credentials have expired. Reconnect in Settings."
   - 403: insufficient permissions → integration error, return 403 with message "Your WordPress user doesn't have permission to publish posts."
   - Timeout (>30s): return 503 "WordPress timed out. Your site may be slow or unreachable."

7. **Capture performance baseline:** After successful publish, snapshot current scan metrics:
   ```sql
   INSERT INTO content_performance (
     content_item_id, business_id, scan_id,
     measurement_date, visibility_score_before,
     mention_count_before, avg_position_before
   )
   SELECT
     $content_id, $business_id, scans.id,
     CURRENT_DATE, scans.overall_score,
     ...(aggregate from scan_engine_results)
   FROM scans
   WHERE business_id = $business_id AND status = 'completed'
   ORDER BY completed_at DESC LIMIT 1
   ```
   This baseline is used 30 days later to measure whether the content improved visibility.

8. **Emit event:**
   ```json
   { "name": "content/published", "data": { "contentId": "...", "businessId": "..." } }
   ```
   This triggers the Content Lifecycle workflow (§7.3 of alert-workflow-spec.md).

### 4.4 Duplicate Post Detection

WordPress does not deduplicate by title. If a user clicks "Publish" twice quickly, they will create two identical posts.

**Prevention:**
- After publishing: store the WordPress post ID in `content_items.published_url` (the URL contains the post ID)
- Before publishing: check if `content_items.published_at IS NOT NULL`. If yes: show error "This content has already been published to WordPress. [View it]."
- The UI "Publish to WordPress" button should disable immediately on click.

---

## 5. Paddle Billing Integration

### 5.1 Paddle Is the Only Payment Provider

Stripe was removed from this project on 2026-03-02. No Stripe code, no Stripe imports, no Stripe references anywhere. If you find Stripe references in the codebase: delete them.

**Paddle vs. Stripe in this codebase:**
- Payment processing: Paddle (Paddle.js client-side overlay + server-side webhooks)
- Invoice PDFs: Paddle-hosted
- Customer portal: Paddle Customer Portal (for plan changes, card updates, invoice history)
- Webhook events: Paddle events (not Stripe events — different field names and structure)

### 5.2 Subscription States

The `subscriptions.status` column valid values:
```
'trialing'   -- Active 7-day trial (no payment method required)
'active'     -- Paid subscription, in good standing
'past_due'   -- Payment failed, grace period
'cancelled'  -- UK spelling, two Ls. Subscription ends at current_period_end.
'paused'     -- Manually paused by user (not yet implemented in UI)
```

**Common bug:** Using `'canceled'` (one L, US spelling) will not match any row in the database. The CHECK constraint will reject it at INSERT. Always use `'cancelled'`.

### 5.3 Plan Tiers

The `plans.tier` column valid values: `'starter' | 'pro' | 'business'`

There is NO `'free'` tier in this column. Free tier is represented as `subscriptions.plan_id = NULL`. Never insert a plans row with `tier = 'free'`.

**Plan lookup pattern:**
```typescript
// CORRECT: check for free tier
const isFree = subscription.plan_id === null
const planTier = subscription.plan?.tier ?? null  // null for free tier

// WRONG: this will never match
if (planTier === 'free') { ... }
```

### 5.4 Checkout Flow

**User action:** Clicks "Upgrade" or "Choose Plan" anywhere in the app.

**Step 1:** Client calls `POST /api/billing/checkout`
```json
{
  "plan_id": "uuid",      // from plans table
  "billing_period": "monthly" | "annual"
}
```

**Step 2:** API handler (server-side)
```
1. Load plans row by plan_id, get paddle_product_id
2. Load subscriptions row for user, get paddle_customer_id (if exists)
3. Call Paddle SDK to create checkout:
   paddle.transactions.create({
     items: [{ price_id: paddlePriceId, quantity: 1 }],
     customer_id: paddle_customer_id,  // pre-fill if existing customer
     customer: { email: user.email },  // for new customers
     success_url: '/dashboard/settings?tab=billing&upgrade=success',
     cancel_url: '/dashboard/settings?tab=billing',
   })
4. Return { data: { checkout_url: string } }
```

**Step 3:** Client redirects to Paddle-hosted checkout URL (or Paddle overlay).

**Step 4:** On success, Paddle sends webhooks. Client redirected to `success_url`.

**Step 5:** On `success_url`: show success toast "Welcome to [Plan]! Your plan is now active." The subscription is already updated via webhook before the redirect.

### 5.5 Webhook Handling

**Route:** `POST /api/billing/webhooks`
**Auth:** Paddle webhook signature verification (NOT user session auth)

**Signature verification (must happen before any processing):**
```typescript
import { Paddle } from '@paddle/paddle-node-sdk'

const paddle = new Paddle(process.env.PADDLE_API_KEY!)

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('Paddle-Signature')

  if (!signature) return Response.json({ error: 'Missing signature' }, { status: 401 })

  let event
  try {
    event = paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET!, signature)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Process event by type
  await processWebhookEvent(event)
  return Response.json({ received: true })
}
```

**Idempotency:** Check `event.event_id` before processing. Store processed event IDs (in a separate table or Redis) and skip if already processed. Paddle retries failed webhooks with exponential backoff.

#### Webhook Events and Handlers

**`subscription.created`**
Fired when a user subscribes for the first time or after a cancelled subscription.

```
1. Look up subscriptions row by user_id (from event.data.custom_data.user_id)
2. UPDATE subscriptions SET:
   paddle_subscription_id = event.data.id,
   paddle_customer_id = event.data.customer_id,
   plan_id = (SELECT id FROM plans WHERE paddle_product_id = event.data.items[0].price.product_id),
   status = 'active',
   current_period_start = event.data.current_billing_period.starts_at,
   current_period_end = event.data.current_billing_period.ends_at
3. Allocate monthly credits:
   supabase.rpc('allocate_monthly_credits', { p_user_id: userId, p_plan_id: planId })
4. Emit Inngest event: billing/subscription.changed
5. Send upgrade confirmation email: sendUpgradeConfirmation()
6. Send invoice receipt email: sendInvoiceReceipt()
```

**`subscription.updated`**
Fired on plan changes, billing period changes, and status updates.

```
1. Look up subscriptions row by paddle_subscription_id
2. UPDATE subscriptions SET:
   plan_id = new plan (if changed),
   status = event.data.status,
   current_period_start = ...,
   current_period_end = ...
3. If plan changed AND new plan is higher tier:
   supabase.rpc('allocate_monthly_credits', { ... })  -- re-allocate for new plan
4. Emit Inngest event: billing/subscription.changed
```

**`subscription.cancelled`** — NOTE: UK spelling in Paddle's event name

```
1. Look up subscriptions by paddle_subscription_id
2. UPDATE subscriptions SET:
   status = 'cancelled',  -- UK spelling, two Ls
   cancel_at = event.data.scheduled_change.effective_at  -- future date when access ends
3. DO NOT immediately remove access. User retains access until current_period_end.
4. Send cancellation confirmation email: sendCancellationConfirmation()
```

**`transaction.completed`**
Fired when a payment succeeds (covers both subscription renewals and one-time top-up purchases).

```
1. If event.data.subscription_id is set → subscription renewal:
   - Update current_period_start, current_period_end
   - Allocate next month's credits:
     supabase.rpc('allocate_monthly_credits', { ... })
   - Send invoice receipt email

2. If event.data.custom_data.type = 'credit_topup':
   - Update credit_pools: topup_amount += purchased_credits
   - Insert credit_transactions row: { transaction_type: 'topup', amount: credits }
   - Send receipt email
   - Show toast "X credits added to your account"
```

**`transaction.payment_failed`**

```
1. Look up subscription by paddle_subscription_id
2. UPDATE subscriptions SET status = 'past_due'
3. Send payment failed email: sendPaymentFailed()
4. Create in-app notification: "Action required: your payment failed"
```

### 5.6 Billing Portal

**Route:** `POST /api/billing/portal`
**Returns:** Paddle Customer Portal URL where the user can:
- Update payment method
- Download invoice history
- Manage subscription (upgrade/downgrade)
- Cancel subscription

```typescript
const session = await paddle.customerPortalSessions.create(
  paddleCustomerId,
  {
    urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
    }
  }
)
return Response.json({ data: { url: session.urls.general } })
```

The client navigates to this URL. Paddle Portal handles everything. On return, the `success` URL is the settings billing tab.

---

## 6. Credit System — Technical Deep Dive

### 6.1 `credit_pools` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Credit owner |
| pool_type | text | 'monthly' | CHECK IN ('monthly', 'topup', 'trial') |
| base_allocation | integer | 0 | Monthly plan allocation |
| rollover_amount | integer | 0 | Credits carried over from previous month (max 20% of base) |
| topup_amount | integer | 0 | One-time purchased credits |
| used_amount | integer | 0 | Credits consumed this period |
| held_amount | integer | 0 | Credits currently reserved for in-progress agent jobs |
| period_start | timestamptz | NOW() | Billing period start |
| period_end | timestamptz | NULL | Billing period end |
| created_at | timestamptz | NOW() | |
| updated_at | timestamptz | NOW() | |

**Available credits formula:**
```
available = base_allocation + rollover_amount + topup_amount - used_amount - held_amount
```

This is computed application-side from pool values. There is no `available_credits` column — it is computed. The `hold_credits` RPC function enforces this formula with a FOR UPDATE lock.

**Pool types:**
- `monthly` — Main pool, reset each billing cycle
- `topup` — One-time purchased credits that do NOT expire with billing cycle
- `trial` — Created at onboarding (5 credits for trial period). **Deleted when user upgrades to paid plan.**

**UNIQUE constraint:** `(user_id, pool_type)` — a user has exactly one pool of each type.

### 6.2 `credit_transactions` Table

Immutable audit trail. Never updated, only inserted.

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Transaction owner |
| pool_id | uuid | NOT NULL | FK → credit_pools(id). REQUIRED — cannot be null. |
| pool_type | text | 'monthly' | Pool type at time of transaction |
| transaction_type | text | NOT NULL | See valid values below |
| amount | integer | NOT NULL | Positive for additions, negative for deductions |
| balance_after | integer | NOT NULL | Running balance after this transaction |
| agent_job_id | uuid | NULL | FK → agent_jobs(id). Required for hold/confirm/release. |
| description | text | NULL | Human-readable description |
| created_at | timestamptz | NOW() | |

**Valid `transaction_type` values:**
```
'allocation'    -- Monthly credit grant from cron.monthly-credits
'hold'          -- Credits reserved before agent starts
'confirm'       -- Hold made permanent after agent success
'release'       -- Hold cancelled after agent failure
'topup'         -- One-time credit purchase (NOT 'bonus' -- 'bonus' is not a valid value)
'rollover'      -- Credits carried over from previous month
'expire'        -- Credits that expired at period end
'system_grant'  -- Zero-cost system agent (onboarding agents: amount = 0)
```

**Important:** `pool_id` AND `pool_type` are BOTH required on every insert. The `pool_type` denormalizes what type the pool was at transaction time — needed for analytics queries without a join.

### 6.3 Hold / Confirm / Release Pattern

This pattern prevents two critical failure modes:
1. Credits charged for an agent that failed before completing
2. Two concurrent agents double-spending the same credit balance

**The flow:**

```
HOLD (before agent starts)
    |
    |-- Agent starts running
    |
    |-- SUCCESS → CONFIRM (credits permanently consumed)
    |
    `-- FAILURE → RELEASE (credits returned to available)
```

**Step 1 — HOLD (in `/api/agents/[agentType]/execute`):**
```typescript
const holdResult = await supabase.rpc('hold_credits', {
  p_user_id: userId,
  p_amount: agentCreditCost,  // 1 for most agents, 0 for recommendations
  p_job_id: newJobId,
})
if (!holdResult.data.success) {
  return Response.json({ error: 'Insufficient credits' }, { status: 402 })
}
// Proceed: insert agent_jobs, emit agent/execute event
```

**Step 2 — CONFIRM (in `agent.execute` Inngest function, on success):**
```typescript
await supabase.rpc('confirm_credits', { p_job_id: jobId })
// Updates: held_amount -= cost, used_amount += cost
// Inserts credit_transactions: { transaction_type: 'confirm', amount: -cost }
```

**Step 3 — RELEASE (in `agent.execute` Inngest function, on failure):**
```typescript
await supabase.rpc('release_credits', { p_job_id: jobId })
// Updates: held_amount -= cost (no change to used_amount)
// Inserts credit_transactions: { transaction_type: 'release', amount: +cost }
```

**Idempotency guards:** Each RPC function (`hold_credits`, `confirm_credits`, `release_credits`) checks for an existing transaction with the same `agent_job_id` before inserting. This is critical for Inngest retry safety — if a step is retried, it will not double-hold or double-confirm.

**Race condition protection:** The `hold_credits` RPC uses `SELECT ... FOR UPDATE` with `SERIALIZABLE` transaction isolation. This prevents two concurrent agents from both seeing "3 credits available" and both deducting, resulting in -1 credits.

**Stuck hold cleanup:** `cron.cleanup` (daily at 4AM UTC) releases any holds where `transaction_type = 'hold'` has no corresponding 'confirm' or 'release' and `created_at < NOW() - INTERVAL '2 hours'`. This catches agent functions that timed out or crashed.

### 6.4 Monthly Credit Allocation

**Inngest function:** `cron.monthly-credits`
**Schedule:** `0 0 1 * *` (1st of every month at midnight UTC)
**Concurrency:** 1 (singleton)
**Timeout:** 300 seconds

**Process:**
1. Query all `subscriptions` where `status IN ('active', 'trialing')` and `plan_id IS NOT NULL`
2. For each subscriber: call `supabase.rpc('allocate_monthly_credits', { p_user_id: userId, p_plan_id: planId })`

**RPC parameters:** BOTH `p_user_id` AND `p_plan_id` are REQUIRED. Calling with only `p_user_id` will fail. This is a common bug source.

**What `allocate_monthly_credits` does:**
1. Idempotency check: if an 'allocation' transaction exists for this user in the current calendar month, return without re-allocating
2. Compute rollover: `MIN(base_allocation - used_amount, FLOOR(base_allocation * 0.20))`, clamped to >= 0
3. Update `credit_pools`:
   - `rollover_amount` = computed rollover
   - `base_allocation` = plan's `monthly_agent_uses`
   - `used_amount` = 0 (reset)
   - `held_amount` = 0 (reset — any held credits from previous period are released)
   - `period_start` = NOW()
   - `period_end` = end of current month
4. Delete trial pool if it exists: `DELETE FROM credit_pools WHERE user_id = $p_user_id AND pool_type = 'trial'`
5. Insert `credit_transactions` with `transaction_type = 'allocation'`
6. If rollover > 0: insert `credit_transactions` with `transaction_type = 'rollover'`

**Rollover cap:** Maximum 20% of `base_allocation` carries over. If a user had 15 base credits and used 12, they have 3 remaining → 20% of 15 = 3 → full 3 carry over. If they used 0, 20% of 15 = 3 → only 3 carry over (not 15).

### 6.5 Trial System

**Trial starts:** First dashboard visit (`GET /dashboard`). The dashboard layout Server Component checks `subscriptions.trial_starts_at`. If null: set `trial_starts_at = NOW()`, `trial_ends_at = NOW() + 7 days`. This requires a service-role update to `subscriptions`.

**Trial credit pool:** Created at `POST /api/onboarding/complete`:
```sql
INSERT INTO credit_pools (user_id, pool_type, base_allocation)
VALUES ($user_id, 'trial', 5)
```
5 credits total for the entire trial period. This pool is consumed by any agent execution during trial.

**Trial ends:** On `trial_ends_at`, the subscription remains `status = 'trialing'` (Supabase doesn't auto-expire). The `cron.trial-nudges` function sends trial expiry email. The dashboard layout checks `trial_ends_at < NOW()` to show the expired trial state.

**Trial-to-paid transition:** When `transaction.completed` webhook fires for a new subscription:
1. `allocate_monthly_credits` deletes the trial pool
2. Full monthly allocation is created
3. `subscriptions.status` → `'active'`
4. All features unlock immediately

**Trial credit cap:** During trial, only agents that consume from the `trial` pool can run. The `hold_credits` RPC draws from `monthly` pool first, then `topup`. During trial, only the `trial` pool exists. So the user gets exactly 5 agent executions regardless.

### 6.6 Credit Top-Up (One-Time Purchase)

**Route:** `POST /api/billing/checkout` with body:
```json
{
  "type": "credit_topup",
  "credits": 5,  // or 15
  "paddle_price_id": "pri_xxx"
}
```

This triggers a Paddle one-time payment (not subscription). On `transaction.completed` webhook:
```
1. Check event.data.custom_data.type === 'credit_topup'
2. Get credit amount from event.data.custom_data.credits
3. UPDATE credit_pools SET topup_amount = topup_amount + credits
   WHERE user_id = userId AND pool_type = 'topup'
4. If topup pool doesn't exist: INSERT new credit_pools row with pool_type = 'topup'
5. INSERT credit_transactions: { transaction_type: 'topup', amount: credits, pool_type: 'topup' }
```

Top-up credits (`topup` pool) do NOT expire at the end of the billing period. They persist until used.

---

## 7. Trial System — Billing Tab UX State

The Settings → Billing tab shows different content depending on subscription state:

| State | `status` | `plan_id` | What user sees |
|-------|----------|-----------|----------------|
| Active trial | `trialing` | NULL | Free Trial card, "X days remaining", plan selection |
| Expired trial | `trialing` | NULL | "Trial ended" card, upgrade CTA, all features locked |
| Active subscription | `active` | non-null | Current plan card, usage meters, invoice history |
| Past due | `past_due` | non-null | Warning banner, "Update Payment Method" CTA |
| Cancelled | `cancelled` | non-null | "Access until [date]" card, re-subscribe CTA |

**Checking trial expiry in dashboard layout (Server Component):**
```typescript
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*, plan:plans(*)')
  .eq('user_id', userId)
  .single()

const isTrialExpired =
  subscription.status === 'trialing' &&
  subscription.plan_id === null &&
  subscription.trial_ends_at !== null &&
  new Date(subscription.trial_ends_at) < new Date()

const isOnPaidPlan = subscription.status === 'active'
```

---

## 8. Public REST API (Business Tier)

### 8.1 Overview

The public REST API lives at `/api/v1/*`. It is exclusively for Business tier subscribers. The API is documented at `/docs/api`.

**Authentication method:** Bearer token in Authorization header:
```
Authorization: Bearer bmx_abc12345defgh67ijklmnop890
```

Not Supabase session. Not cookies. Bearer token only.

### 8.2 API Key Format

Keys are generated with the format `bmx_` + 28 cryptographically random characters:
- Prefix `bmx_` identifies it as a Beamix API key (useful for secret scanning in GitHub)
- 28 random characters from a URL-safe character set
- Total length: 32 characters
- Example: `bmx_K7mP9xRqN2wLvC4jH8sYtB1n`

**Generation (one-time, shown to user ONCE):**
```typescript
import { randomBytes } from 'node:crypto'
import { createHash } from 'node:crypto'

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomPart = randomBytes(21).toString('base64url').slice(0, 28)
  const key = `bmx_${randomPart}`
  const hash = createHash('sha256').update(key).digest('hex')
  const prefix = key.slice(0, 12)  // 'bmx_' + first 8 chars
  return { key, hash, prefix }
}
```

The `key` (plaintext) is shown to the user exactly once. Only `hash` and `prefix` are stored in `api_keys`.

### 8.3 API Key Authentication Middleware

Every `/api/v1/*` request passes through this middleware:

```typescript
async function authenticateApiKey(request: Request): Promise<{ userId: string; scopes: string[] } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const providedKey = authHeader.slice(7)  // remove 'Bearer '
  const keyHash = createHash('sha256').update(providedKey).digest('hex')

  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('user_id, scopes, is_active, expires_at')
    .eq('key_hash', keyHash)
    .single()

  if (!apiKey) return null
  if (!apiKey.is_active) return null
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return null

  // Update last_used_at (fire-and-forget, don't await)
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash).then(() => {})

  return { userId: apiKey.user_id, scopes: apiKey.scopes }
}
```

### 8.4 Rate Limiting

Per key, using Upstash Redis sliding window:
- Default: 100 requests per minute
- Key: `api:${key_prefix}` (avoids storing the full key or hash in Redis)

Response headers on every `/api/v1/*` response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709123456  (Unix timestamp of window reset)
```

On limit exceeded: 429 with `Retry-After` header.

### 8.5 Available Endpoints

All endpoints support cursor-based pagination for list responses. Cursor is an opaque string (base64-encoded `{ id, created_at }` of the last item). Pass `?cursor=xxx` for the next page.

**Pagination response shape:**
```json
{
  "data": [...],
  "meta": {
    "has_more": true,
    "next_cursor": "base64string",
    "count": 20
  }
}
```

---

#### `GET /api/v1/businesses`

**Scope required:** `read`

Returns the authenticated user's businesses.

**Response:**
```json
{
  "data": [{
    "id": "uuid",
    "name": "Yael Insurance",
    "website_url": "https://yael-insurance.co.il",
    "industry": "insurance",
    "location": "Tel Aviv",
    "last_scanned_at": "2026-03-07T10:30:00Z"
  }]
}
```

---

#### `GET /api/v1/scans`

**Scope required:** `read`
**Query params:** `business_id` (required), `limit` (default 20, max 100), `cursor`

Returns scan history for a business.

**Response:**
```json
{
  "data": [{
    "id": "uuid",
    "business_id": "uuid",
    "scan_type": "scheduled",
    "status": "completed",
    "overall_score": 74,
    "engines_queried": ["chatgpt", "gemini", "perplexity", "claude"],
    "scanned_at": "2026-03-07T10:30:00Z",
    "completed_at": "2026-03-07T10:32:15Z"
  }],
  "meta": { "has_more": true, "next_cursor": "...", "count": 20 }
}
```

---

#### `GET /api/v1/scans/[id]`

**Scope required:** `read`

Returns a single scan with all engine results.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "overall_score": 74,
    "engine_results": [{
      "engine": "chatgpt",
      "is_mentioned": true,
      "rank_position": 2,
      "sentiment_score": 78,
      "mention_context": "Yael Insurance is one of the top-rated insurance agencies in Tel Aviv..."
    }]
  }
}
```

---

#### `POST /api/v1/scans/trigger`

**Scope required:** `execute`

Triggers a manual scan for a business.

**Request body:**
```json
{ "business_id": "uuid" }
```

**Response:** 202 Accepted
```json
{ "data": { "scan_id": "uuid", "status": "processing" } }
```

Rate limit: 1 per business per day (same as manual scan tier limit). Returns 429 if at limit.

---

#### `GET /api/v1/content`

**Scope required:** `read`
**Query params:** `business_id`, `status?`, `content_type?`, `limit`, `cursor`

Returns content library items.

---

#### `GET /api/v1/agents/history`

**Scope required:** `read`
**Query params:** `business_id`, `agent_type?`, `limit`, `cursor`

Returns agent execution history.

---

#### `GET /api/v1/analytics/visibility`

**Scope required:** `read`
**Query params:** `business_id`, `period` (7d | 30d | 90d)

Returns visibility score time series.

**Response:**
```json
{
  "data": {
    "current_score": 74,
    "period_start_score": 58,
    "change": 16,
    "trend": [{
      "date": "2026-03-01",
      "score": 58
    }, {
      "date": "2026-03-07",
      "score": 74
    }]
  }
}
```

---

#### `GET /api/v1/competitors`

**Scope required:** `read`
**Query params:** `business_id`

Returns tracked competitors with their current visibility data.

---

#### `GET /api/v1/credits`

**Scope required:** `read`

Returns current credit balance and usage.

**Response:**
```json
{
  "data": {
    "available": 7,
    "base_allocation": 15,
    "rollover_amount": 2,
    "topup_amount": 0,
    "used_amount": 8,
    "held_amount": 0,
    "period_end": "2026-03-31T23:59:59Z"
  }
}
```

---

## 9. Billing API Routes

### `GET /api/billing/status`

**Auth:** Required (Supabase session)

Returns current subscription state and credit usage for the billing tab UI.

**Response:**
```json
{
  "data": {
    "subscription": {
      "status": "active",
      "plan_tier": "pro",
      "plan_name": "Pro",
      "billing_amount": 14900,
      "billing_currency": "USD",
      "current_period_end": "2026-03-28T00:00:00Z",
      "cancel_at": null
    },
    "credits": {
      "available": 7,
      "used": 8,
      "total": 15
    },
    "trial": {
      "is_trialing": false,
      "days_remaining": null,
      "trial_ends_at": null
    }
  }
}
```

---

### `POST /api/billing/checkout`

**Auth:** Required

**Request body:**
```json
{
  "plan_id": "uuid",
  "billing_period": "monthly"
}
```

OR for credit top-up:
```json
{
  "type": "credit_topup",
  "credits": 5
}
```

**Response:**
```json
{ "data": { "checkout_url": "https://checkout.paddle.com/checkout/..." } }
```

---

### `POST /api/billing/portal`

**Auth:** Required

No request body.

**Response:**
```json
{ "data": { "url": "https://customer-portal.paddle.com/..." } }
```

The client navigates to this URL. Returns 404 if user has no Paddle customer ID (never subscribed).

---

### `POST /api/billing/webhooks`

**Auth:** Paddle signature verification (NO user session)

Process Paddle webhook events. See §5.5 for full event handling.

**Response:** Always 200 (Paddle retries on any other status):
```json
{ "received": true }
```

---

### `GET /api/billing/usage`

**Auth:** Required

**Query params:** `business_id?`

Returns credit usage history (transactions) for the current billing period.

**Response:**
```json
{
  "data": [{
    "id": "uuid",
    "transaction_type": "hold",
    "amount": -1,
    "balance_after": 9,
    "description": "Content Writer agent execution",
    "agent_job_id": "uuid",
    "created_at": "2026-03-05T14:22:00Z"
  }],
  "meta": { "period_start": "...", "period_end": "..." }
}
```

---

### `GET /api/billing/invoices`

**Auth:** Required

Returns Paddle invoice history. This data is fetched from the Paddle API (not stored locally, except for amounts in the UI display).

---

## 10. Integration API Routes

### `GET /api/integrations`

**Auth:** Required
**Query params:** `business_id`

Returns all integrations for a business, with credentials OMITTED from response.

**Response:**
```json
{
  "data": [{
    "id": "uuid",
    "provider": "wordpress",
    "config": { "site_url": "https://yael-insurance.co.il" },
    "status": "active",
    "last_sync_at": "2026-03-07T10:00:00Z",
    "last_error": null
  }]
}
```

---

### `POST /api/integrations`

**Auth:** Required

Add a new integration.

**Request body:**
```json
{
  "business_id": "uuid",
  "provider": "wordpress",
  "credentials": {
    "username": "yael",
    "application_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
  },
  "config": {
    "site_url": "https://yael-insurance.co.il"
  }
}
```

**Process:**
1. Validate provider is available for user's plan tier (e.g., WordPress requires Pro+)
2. Check UNIQUE constraint: `(business_id, provider)` — one per provider
3. Test connection (call `testConnection(provider, credentials, config)`)
4. If connection fails: return 400 with provider-specific error message
5. Encrypt credentials: `encryptCredentials(credentials)`
6. INSERT `integrations` row
7. Return integration without credentials

---

### `PATCH /api/integrations/[id]`

**Auth:** Required

Update integration credentials or config (e.g., user changed their WordPress password).

**Request body:**
```json
{
  "credentials": { ... },
  "config": { ... }
}
```

Partial update. If `credentials` provided: re-encrypt and store. Test connection if credentials changed.

---

### `DELETE /api/integrations/[id]`

**Auth:** Required

Remove integration. Credentials are deleted from the database.

**Response:** `{ data: { deleted: true } }`

---

### `POST /api/integrations/[id]/test-connection`

**Auth:** Required

Re-test an existing integration's connection health.

**Process:**
1. Load integration, decrypt credentials
2. Run provider-specific health check
3. Update `integrations.status` and `last_error` based on result
4. Return result

**Response:**
```json
{ "data": { "connected": true, "message": "Connected as yael@yael-insurance.co.il" } }
```
OR:
```json
{ "data": { "connected": false, "message": "Credentials expired. Please reconnect." } }
```

---

### `GET /api/settings/export`

**Auth:** Required
**Rate limit:** 1 per user per 24 hours

Triggers GDPR data export. Runs asynchronously via Inngest — does not stream data in response.

**Process:**
1. Emit `gdpr/export-requested` Inngest event
2. Return immediately with 202

**Response:**
```json
{ "data": { "status": "processing", "message": "We'll email you a download link within 15 minutes." } }
```

The `gdpr.export` Inngest function collects all user data (excludes encrypted credentials and API key plaintext), uploads to Supabase Storage, sends download link via Resend, and auto-deletes the file after 24 hours.

---

## 11. Security Architecture

### 11.1 API Key Storage (Business Tier)

Never log, store, or return API key plaintext after initial creation:

```
KEY LIFECYCLE:
Generation → plaintext shown to user ONCE in a modal ("Copy this key — you won't see it again")
           → hash(SHA-256) stored in api_keys.key_hash
           → prefix stored in api_keys.key_prefix (for display)
           → plaintext DISCARDED

Request    → client sends full key in Authorization header
           → server hashes it: SHA-256(key)
           → lookup: api_keys WHERE key_hash = hash
           → scopes checked, request processed

Rotation   → user generates new key (new plaintext generated, shown once)
           → old key can be deleted (or left active until manually revoked)
```

### 11.2 Paddle Webhook Signature Verification

Every webhook must verify the Paddle signature before processing. See §5.5 for implementation. **Never process a Paddle webhook without signature verification** — this is an attack vector (replay attacks, spoofed events).

Paddle provides the `Paddle-Signature` header with a timestamp and HMAC-SHA256 signature:
```
Paddle-Signature: ts=1709123456;h1=abc123def456...
```

The official Paddle Node SDK (`@paddle/paddle-node-sdk`) handles verification via `paddle.webhooks.unmarshal()`.

### 11.3 Integration Credential Encryption

See §3.2 for the full AES-256-GCM implementation. Key principles:

1. Credentials are encrypted BEFORE going to the database. The Supabase service role client never touches plaintext credentials.
2. `CREDENTIALS_ENCRYPTION_KEY` is stored ONLY in Vercel environment variables. Never in `.env` files, never committed.
3. The IV is random per-encryption. Storing the same credential twice produces different ciphertext.
4. Decryption failures (wrong key, tampered data) throw errors — they do not return empty/null silently.

### 11.4 Rate Limiting Reference

| Route | Limit | Scope |
|-------|-------|-------|
| POST /api/billing/checkout | 10/hour | Per user |
| POST /api/billing/portal | 10/hour | Per user |
| POST /api/billing/webhooks | 100/minute | Per IP |
| POST /api/integrations | 20/hour | Per user |
| POST /api/integrations/[id]/test-connection | 10/hour | Per user |
| GET /api/settings/export | 1/24h | Per user |
| GET /api/v1/* | 100/minute | Per API key |

### 11.5 GDPR Data Handling

**Data export:** `/api/settings/export` includes all user data. Credentials in `integrations` are EXCLUDED from the export (they contain third-party auth tokens that should not be exported). API key hashes are EXCLUDED (not useful to user, a security leak if exported in bulk). The export includes key names, prefixes, and metadata.

**Data deletion:** Deleting a user account cascades `ON DELETE CASCADE` through:
- user_profiles → businesses → scans → scan_engine_results → ...
- subscriptions → credit_pools → credit_transactions
- notifications → notification_preferences
- integrations (credentials are deleted, no orphaned encrypted data)
- api_keys (hash deleted — no other cleanup needed)

Additionally: call Paddle API to cancel any active subscriptions and delete customer. Call Resend API to remove contact.

---

## Appendix A: Environment Variables Required

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `PADDLE_API_KEY` | Paddle server-side SDK | Billing routes |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook signature | Webhook handler |
| `PADDLE_CLIENT_TOKEN` | Paddle.js client-side | Checkout overlay |
| `CREDENTIALS_ENCRYPTION_KEY` | AES-256-GCM key (64 hex chars) | Integration credential storage |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | All rate-limited routes |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | All rate-limited routes |
| `NEXT_PUBLIC_APP_URL` | Redirect URLs for Paddle | Billing portal return URL |

---

## Appendix B: Integration Provider Setup Reference

### WordPress Application Password Setup

Users must enable Application Passwords in WordPress (requires WordPress 5.6+, SSL):
1. WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords" section
3. Enter name "Beamix" → click "Add New Application Password"
4. Copy the generated password (shown once)
5. Paste into Beamix Settings → Integrations → WordPress

If the user's WordPress installation has Application Passwords disabled (common on some hosts), they will see a 404 on the `/wp-json/wp/v2/users/me` test endpoint. Error message should say: "Application Passwords may not be enabled on your WordPress site. Contact your hosting provider."

### Slack Webhook URL Setup

Phase 1 uses Incoming Webhooks (simple, no OAuth required):
1. User goes to api.slack.com → Your Apps
2. Creates a new app → Incoming Webhooks
3. Activates Incoming Webhooks, clicks "Add New Webhook to Workspace"
4. Selects channel → Copy webhook URL
5. Pastes into Beamix Settings → Integrations → Slack

The webhook URL format: `https://hooks.slack.com/services/...` (copy from Slack app settings)

---

*Document version: 1.0 | Created: 2026-03-08 | Author: Atlas (CTO)*
*Source: BEAMIX_SYSTEM_DESIGN.md, _SYSTEM_DESIGN_ARCHITECTURE_LAYER.md §2.2, §2.10, §3.6, §3.7, §3.11, §5.3, §5.5-5.9, §7.3-7.4, settings-spec.md*
