# Beamix — System Architecture Layer

> **Author:** Atlas (CTO)
> **Date:** 2026-03-04
> **Scope:** Complete system architecture for the Beamix GEO Platform — database, APIs, data flow, infrastructure, security, caching, and connections between all layers.
> **Audience:** Engineering team building this system. Every design decision is justified. No code snippets. No pricing. No timelines.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Database Design (Complete Schema)](#2-database-design-complete-schema)
3. [API Layer Design](#3-api-layer-design)
4. [Background Job Architecture (Inngest)](#4-background-job-architecture-inngest)
5. [External Service Integration Map](#5-external-service-integration-map)
6. [Caching Strategy](#6-caching-strategy)
7. [Security Architecture](#7-security-architecture)
8. [Data Flow Diagrams](#8-data-flow-diagrams)

---

## 1. System Overview

### 1.1 High-Level Architecture

Beamix is a monolithic Next.js application deployed on Vercel that communicates with Supabase for persistence, Inngest for background job orchestration, and multiple LLM providers for its core scan and agent functionality. The system follows a layered architecture where every user request flows through authentication, authorization, and validation before reaching business logic.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                              │
│  Browser (React 19)                                                          │
│  ├── Server Components (SSR on Vercel Edge)                                  │
│  ├── Client Components (React Query for cache + polling)                     │
│  └── Supabase Realtime (WebSocket for live updates)                          │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │ HTTPS
┌────────────────────────────────▼─────────────────────────────────────────────┐
│                           APPLICATION LAYER                                   │
│                                                                              │
│  Next.js 16 App Router (Vercel Serverless Functions)                         │
│  ├── Middleware (auth gate, route protection, rate limiting)                  │
│  ├── API Routes (/api/*) — Zod-validated, RLS-enforced                       │
│  ├── Server Actions (form mutations)                                         │
│  └── Inngest Serve Endpoint (/api/inngest)                                   │
└───┬─────────────┬──────────────┬──────────────┬──────────────┬───────────────┘
    │             │              │              │              │
    ▼             ▼              ▼              ▼              ▼
┌────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐ ┌───────────────┐
│Supabase│ │ Inngest  │ │ LLM APIs   │ │ Paddle    │ │ External      │
│        │ │          │ │            │ │           │ │ Services      │
│- Auth  │ │- Scans   │ │- OpenAI    │ │- Checkout │ │               │
│- PgSQL │ │- Agents  │ │- Anthropic │ │- Webhooks │ │- Resend       │
│- RLS   │ │- Crons   │ │- Google AI │ │- Portal   │ │- Sentry       │
│- Rtime │ │- Alerts  │ │- Perplexity│ │           │ │- WordPress API│
│- Store │ │- Cleanup │ │- xAI       │ │           │ │- GA4 API      │
│        │ │          │ │- DeepSeek  │ │           │ │- GSC API      │
│        │ │          │ │            │ │           │ │- Slack API    │
│        │ │          │ │            │ │           │ │- Cloudflare   │
└────────┘ └──────────┘ └────────────┘ └───────────┘ └───────────────┘
```

### 1.2 Layer Responsibilities

| Layer | Responsibility | Key Constraint |
|-------|---------------|----------------|
| **Client** | Rendering, interaction, client-side caching, real-time subscriptions | Server Components by default; Client Components only when interactivity is required |
| **Application** | Request validation (Zod), authentication (Supabase session), authorization (RLS + middleware), business logic orchestration, response shaping | Every external input is Zod-validated. Every database query goes through RLS. No raw SQL from client. |
| **Persistence** | All state: user data, scan results, content, billing records, audit trails | Supabase PostgreSQL with RLS on every table. Service role key used only in Inngest functions and webhook handlers. |
| **Background** | Long-running operations: scans (30-120s), agent pipelines (60-300s), cron jobs, alert evaluation | Inngest step functions with per-step retry, concurrency control, and timeout. All scan and agent work happens here — never in API route handlers. |
| **External** | LLM inference, payment processing, email delivery, CMS publishing, analytics data ingestion | Each external service has an adapter with timeout, retry, circuit breaker, and cost tracking. Failures in external services never crash the system — they produce degraded results or retryable errors. |

### 1.3 Data Flow Overview

All data in Beamix flows through one of five primary pipelines:

1. **Scan Pipeline:** User or cron trigger sends event to Inngest. Inngest function generates prompts, fans out to LLM engines in parallel, parses responses via a classifier LLM, computes scores, stores results in Supabase, triggers alert evaluation, and updates the dashboard via Realtime subscription.

2. **Agent Pipeline:** User triggers agent execution. API places a credit hold, inserts a pending job, and sends event to Inngest. Inngest function assembles business context, runs a multi-step LLM pipeline (research, outline, write, QA), confirms or releases the credit hold based on quality gate, stores output, and notifies the user.

3. **Content Pipeline:** Agent output enters the content library as a draft. User reviews, edits (inline Markdown), optionally publishes to WordPress via integration adapter. Publication triggers a content performance tracking entry that correlates subsequent scan results with the published content.

4. **Alert Pipeline:** Every scan completion and significant data change emits an Inngest event. The alert evaluation function checks all applicable rules for the business, deduplicates against recent alerts, routes through configured channels (in-app, email, Slack), and records the notification.

5. **Billing Pipeline:** Paddle webhooks drive subscription state changes. Credit allocation runs monthly via Inngest cron. Credit holds and confirmations run as part of agent execution. All billing state changes are recorded as audit-trail transactions.

---

## 2. Database Design (Complete Schema)

All tables live in the `public` schema in Supabase PostgreSQL. Supabase Auth manages the `auth.users` table; all other tables reference `auth.users(id)` as the user identity. Every table has RLS enabled. Service role key bypasses RLS for background job writes.

### 2.1 Core Identity Tables

#### `user_profiles`

Stores user metadata beyond what Supabase Auth provides. Created automatically by a database trigger (`handle_new_user`) on `auth.users` insert.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Links to Supabase Auth |
| full_name | text | | Display name |
| avatar_url | text | | Profile picture URL |
| locale | text | DEFAULT 'en', CHECK IN ('en', 'he') | UI language preference |
| timezone | text | DEFAULT 'UTC' | User timezone for cron scheduling |
| onboarding_completed_at | timestamptz | | NULL until onboarding completes |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Account creation |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last profile update |

**Indexes:** Unique index on `user_id` (implicit from UNIQUE constraint).
**RLS:** Users can SELECT and UPDATE their own row only (`user_id = auth.uid()`). INSERT is handled by the trigger (service role). DELETE cascades from auth.users.

#### `businesses`

Each user can manage multiple businesses. A business is the central entity that scans, agents, competitors, and content are associated with.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| name | text | NOT NULL | Business display name |
| website_url | text | NOT NULL | Primary website |
| industry | text | NOT NULL | Industry key (maps to constants/industries.ts) |
| location | text | | Business location (city or region) |
| services | text[] | DEFAULT '{}' | Array of services offered |
| description | text | | Business description for agent context |
| logo_url | text | | Business logo |
| language | text | DEFAULT 'en', CHECK IN ('en', 'he') | Content language |
| last_scanned_at | timestamptz | | Timestamp of most recent scan |
| next_scan_at | timestamptz | | Scheduled next scan time |
| is_primary | boolean | DEFAULT false | User's primary business |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_businesses_user_id` on `(user_id)` — lookup all businesses for a user.
- `idx_businesses_next_scan` on `(next_scan_at)` WHERE `next_scan_at IS NOT NULL` — cron scan scheduler uses this to find businesses due for scanning.

**RLS:** Users can SELECT, INSERT, UPDATE, DELETE their own businesses (`user_id = auth.uid()`).

### 2.2 Subscription & Billing Tables

#### `plans`

Reference table. Read-only for all users. Managed by service role.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| name | text | NOT NULL | Plan display name |
| tier | text | NOT NULL, CHECK IN ('starter', 'pro', 'business') | Tier identifier |
| paddle_product_id | text | UNIQUE | Paddle product mapping |
| monthly_agent_uses | integer | NOT NULL | Agent executions per month |
| max_tracked_queries | integer | NOT NULL | Query tracking limit |
| max_competitors | integer | NOT NULL | Competitor tracking limit |
| max_businesses | integer | NOT NULL, DEFAULT 1 | Multi-business limit |
| scan_frequency_days | integer | NOT NULL | Days between auto-scans |
| engines | text[] | NOT NULL | Array of engine IDs available |
| features | jsonb | DEFAULT '{}' | Feature flags (ask_beamix, api_access, etc.) |
| is_active | boolean | DEFAULT true | Whether plan is currently offered |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** Unique index on `paddle_product_id` for webhook lookup.
**RLS:** All authenticated users can SELECT. Only service role can INSERT/UPDATE.

#### `subscriptions`

One active subscription per user. Created by the `handle_new_user` trigger with null plan (free tier). Updated by Paddle webhooks.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) ON DELETE CASCADE | One subscription per user |
| plan_id | uuid | FK → plans(id) | NULL means free tier (no active plan) |
| paddle_subscription_id | text | UNIQUE | Paddle subscription reference |
| paddle_customer_id | text | | Paddle customer reference |
| status | text | NOT NULL, DEFAULT 'trialing', CHECK IN ('trialing', 'active', 'past_due', 'cancelled', 'paused') | UK spelling for 'cancelled' — matches Paddle |
| trial_starts_at | timestamptz | | Set on first dashboard visit |
| trial_ends_at | timestamptz | | trial_starts_at + 7 days |
| current_period_start | timestamptz | | Billing period start |
| current_period_end | timestamptz | | Billing period end |
| cancel_at | timestamptz | | Scheduled cancellation date |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- Unique on `user_id` (implicit).
- Unique on `paddle_subscription_id` for webhook lookup.
- `idx_subscriptions_status` on `(status)` WHERE `status IN ('active', 'trialing')` — active subscriber queries.

**RLS:** Users can SELECT their own subscription. Only service role can INSERT/UPDATE (driven by webhooks and triggers).

#### `credit_pools`

Tracks agent usage credits per user per billing cycle. A user may have multiple pools (monthly allocation + top-up purchases), distinguished by `pool_type`.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Credit owner |
| pool_type | text | NOT NULL, DEFAULT 'monthly', CHECK IN ('monthly', 'topup', 'trial') | Pool category — 'trial' is temporary (5 credits, deleted on first paid upgrade) |
| base_allocation | integer | NOT NULL, DEFAULT 0 | Monthly plan allocation |
| rollover_amount | integer | NOT NULL, DEFAULT 0 | Rolled over from previous month (capped at 20% of base) |
| topup_amount | integer | NOT NULL, DEFAULT 0 | One-time purchased credits |
| used_amount | integer | NOT NULL, DEFAULT 0 | Credits consumed this period |
| held_amount | integer | NOT NULL, DEFAULT 0 | Credits reserved for in-progress agents |
| period_start | timestamptz | NOT NULL, DEFAULT NOW() | Current billing period start |
| period_end | timestamptz | | Current billing period end |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Available credits computation:** `base_allocation + rollover_amount + topup_amount - used_amount - held_amount`. This is enforced by the `hold_credits` RPC function which checks this value is >= requested hold amount.

**Indexes:** UNIQUE on `(user_id, pool_type)` — a user has exactly one pool of each type: one 'monthly', one 'topup', one 'trial'. Trial pool is deleted on upgrade to paid plan; allocate_monthly_credits RPC handles this.
**RLS:** Users can SELECT their own pools. Only service role can INSERT/UPDATE (credit operations happen in Inngest).

#### `credit_transactions`

Immutable audit trail of every credit operation.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Transaction owner |
| pool_id | uuid | NOT NULL, FK → credit_pools(id) | Associated pool |
| pool_type | text | NOT NULL, DEFAULT 'monthly' | Pool type at time of transaction |
| transaction_type | text | NOT NULL, CHECK IN ('allocation', 'hold', 'confirm', 'release', 'topup', 'rollover', 'expire', 'system_grant') | Operation type — no 'bonus', use 'topup'. 'system_grant' for zero-cost system-initiated agent runs (onboarding). |
| amount | integer | NOT NULL | Positive for additions, negative for deductions |
| balance_after | integer | NOT NULL | Running balance after this transaction |
| agent_job_id | uuid | FK → agent_jobs(id) | For hold/confirm/release — links to the job |
| description | text | | Human-readable description |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_credit_txn_user_date` on `(user_id, created_at DESC)` — transaction history queries.
- `idx_credit_txn_job` on `(agent_job_id)` WHERE `agent_job_id IS NOT NULL` — lookup transactions for a specific agent job.

**RLS:** Users can SELECT their own transactions. Only service role can INSERT.

#### Credit System RPCs

All credit operations are implemented as PostgreSQL RPC functions called via `supabase.rpc()`. They use `SELECT ... FOR UPDATE` row-level locking to prevent race conditions from concurrent agent executions.

**`hold_credits(p_user_id uuid, p_amount integer, p_job_id uuid) → jsonb`**

Reserves credits for an in-progress agent job. Returns `{ success: true, pool_id }` or `{ success: false, error: 'insufficient_credits' }`.

Logic:
1. `SELECT ... FOR UPDATE` on `credit_pools` WHERE `user_id = p_user_id` ORDER BY `pool_type = 'monthly'` first (monthly pool is consumed before topup).
2. Compute available: `base_allocation + rollover_amount + topup_amount - used_amount - held_amount` summed across all pools.
3. If available < `p_amount`: return error.
4. **Idempotency guard (Inngest retry safety):** Check `credit_transactions` for existing `transaction_type = 'hold'` with `agent_job_id = p_job_id`. If found, return the existing hold's pool_id without creating a duplicate.
5. Deduct from monthly pool first. If monthly pool has insufficient available, split across monthly and topup pools.
6. INCREMENT `held_amount` on the affected pool(s).
7. INSERT `credit_transactions` row(s) with `transaction_type = 'hold'`, `agent_job_id = p_job_id`.
8. Return success with the primary pool_id.

Transaction isolation: `SERIALIZABLE` (prevents phantom reads on concurrent holds).

**`confirm_credits(p_job_id uuid) → jsonb`**

Moves held credits to consumed after successful agent completion. Returns `{ success: true }` or `{ success: false, error: 'no_hold_found' }`.

Logic:
1. Find `credit_transactions` WHERE `agent_job_id = p_job_id` AND `transaction_type = 'hold'`. If none: return error.
2. **Idempotency guard:** Check for existing `transaction_type = 'confirm'` with same `p_job_id`. If found, return success without double-confirming.
3. `SELECT ... FOR UPDATE` on the affected `credit_pools` row(s).
4. DECREMENT `held_amount`, INCREMENT `used_amount` by the held amount.
5. INSERT `credit_transactions` row with `transaction_type = 'confirm'`.
6. Return success.

**`release_credits(p_job_id uuid) → jsonb`**

Releases held credits back to available after agent failure or cancellation. Returns `{ success: true }` or `{ success: false, error: 'no_hold_found' }`.

Logic:
1. Find `credit_transactions` WHERE `agent_job_id = p_job_id` AND `transaction_type = 'hold'`. If none: return error.
2. **Idempotency guard:** Check for existing `transaction_type = 'release'` with same `p_job_id`. If found, return success without double-releasing.
3. `SELECT ... FOR UPDATE` on the affected `credit_pools` row(s).
4. DECREMENT `held_amount` by the held amount.
5. INSERT `credit_transactions` row with `transaction_type = 'release'`.
6. Return success.

**`allocate_monthly_credits(p_user_id uuid, p_plan_id uuid) → jsonb`**

Allocates monthly credit quota. Called by `cron.monthly-credits` on the 1st of each month. Returns `{ success: true, allocated: N }`.

Logic:
1. **Idempotency guard:** Check if a `credit_transactions` row with `transaction_type = 'allocation'` exists for this user in the current calendar month. If found, return success without re-allocating.
2. Look up `plans` row by `p_plan_id` to get `monthly_agent_uses`.
3. `SELECT ... FOR UPDATE` on `credit_pools` WHERE `user_id = p_user_id` AND `pool_type = 'monthly'`.
4. Compute rollover: `MIN(base_allocation - used_amount, FLOOR(base_allocation * 0.20))`. Negative values clamped to 0.
5. SET `rollover_amount` = computed rollover, `base_allocation` = plan's `monthly_agent_uses`, `used_amount` = 0, `held_amount` = 0, `period_start` = NOW(), `period_end` = end of current month.
6. If user had a `trial` pool: delete it (trial credits are replaced by the full monthly allocation on first payment).
6. INSERT `credit_transactions` row with `transaction_type = 'allocation'`.
7. INSERT `credit_transactions` row with `transaction_type = 'rollover'` if rollover > 0.
8. Return success with allocated amount.

**Stuck hold cleanup:** A cron job (`cron.cleanup`) releases any credits where `transaction_type = 'hold'` with no corresponding 'confirm' or 'release' and `created_at < NOW() - INTERVAL '2 hours'`. This catches agent functions that timed out or crashed without confirming or releasing.

#### System-Initiated Onboarding Agents

When a user completes onboarding (`onboarding.complete` event), three agents are automatically triggered: A13 (Content Voice Trainer), A14 (Content Pattern Analyzer), and A11 (Recommendations). These are **system-initiated** and **bypass the credit system entirely**.

**Business rules:**
- System-initiated agents fire only when `user_profiles.onboarding_completed_at IS NULL` at the time of the event. Once set, this timestamp is permanent — no replay is possible.
- After completion, `onboarding_completed_at` is set immediately (before agent events are emitted), so duplicate `onboarding.complete` events are no-ops.
- System-initiated agent runs are logged in `credit_transactions` as `transaction_type = 'system_grant'` with `amount = 0` for cost monitoring and audit trail. They do NOT decrement any credit pool.
- These agents are one-time setup only. Users cannot re-trigger them. To regenerate a voice profile or pattern analysis, the user must use the standard agent execution flow with normal credit deduction.

**`credit_transactions.transaction_type` update:** Add `'system_grant'` to the CHECK constraint: `CHECK IN ('allocation', 'hold', 'confirm', 'release', 'topup', 'rollover', 'expire', 'system_grant')`.

### 2.3 Scan Tables

#### `free_scans`

Anonymous, unauthenticated scans. No user FK. Public access (no RLS). Cleaned up after 14 days by cron.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Internal primary key |
| scan_id | text | UNIQUE, NOT NULL | Public identifier used in URLs (nanoid) |
| business_name | text | NOT NULL | Name entered by user |
| website_url | text | NOT NULL | URL entered by user |
| industry | text | NOT NULL | Selected industry |
| location | text | | Optional location |
| language | text | DEFAULT 'en' | Scan language |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'processing', 'completed', 'failed') | Scan lifecycle state |
| results_data | jsonb | | Full scan results blob |
| ip_address | text | | For rate limiting (3 per IP per 24h) |
| converted_user_id | uuid | FK → auth.users(id) | Set when user signs up and imports this scan |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| completed_at | timestamptz | | When scan finished |

**Indexes:**
- Unique on `scan_id` (implicit).
- `idx_free_scans_ip_date` on `(ip_address, created_at)` — rate limit check queries.
- `idx_free_scans_status` on `(status)` WHERE `status = 'pending'` — processing queue.
- `idx_free_scans_cleanup` on `(created_at)` WHERE `converted_user_id IS NULL` — 14-day cleanup cron.

**RLS:** Disabled. Free scans are accessed by scan_id (unguessable nanoid). Rate limiting is IP-based in the API route.

#### `scans`

Authenticated scans for paying users. Each scan represents one scan cycle for one business.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Scanned business |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Scan owner |
| scan_type | text | NOT NULL, CHECK IN ('scheduled', 'manual', 'import') | How scan was triggered |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'processing', 'completed', 'failed') | Lifecycle |
| overall_score | integer | CHECK (0-100) | Composite visibility score |
| engines_queried | text[] | | Which engines were queried |
| prompts_used | integer | | Number of prompts sent |
| results_summary | jsonb | | Aggregated results (quick wins, top competitor, etc.) |
| error_message | text | | If status = 'failed' |
| scanned_at | timestamptz | NOT NULL, DEFAULT NOW() | When scan was initiated |
| completed_at | timestamptz | | When scan finished |

**Indexes:**
- `idx_scans_biz_date` on `(business_id, scanned_at DESC)` — dashboard trend chart queries. This is the most-queried index in the system.
- `idx_scans_user_date` on `(user_id, scanned_at DESC)` — user's scan history.
- `idx_scans_status` on `(status)` WHERE `status IN ('pending', 'processing')` — active scan lookups.

**RLS:** Users can SELECT scans where `user_id = auth.uid()`. Only service role can INSERT/UPDATE (scans are created by Inngest functions).

#### `scan_engine_results`

Per-engine results for each scan. Normalized rows, not JSONB blob. One row per engine per prompt per scan.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| scan_id | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | Parent scan |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Denormalized for query performance |
| engine | text | NOT NULL | Engine identifier (chatgpt, claude, gemini, etc.) |
| prompt_text | text | NOT NULL | The exact prompt sent |
| prompt_category | text | CHECK IN ('recommendation', 'comparison', 'specific', 'review', 'authority') | Prompt type |
| is_mentioned | boolean | NOT NULL, DEFAULT false | Whether business was mentioned |
| rank_position | integer | CHECK (>= 1) | Position in response (1st, 2nd, etc.) or NULL |
| sentiment_score | integer | CHECK (0-100) | Numeric sentiment (0=negative, 50=neutral, 100=positive). NOT an enum — finer granularity for trend analysis. |
| mention_context | text | | 2-3 sentences surrounding the mention |
| competitors_mentioned | text[] | DEFAULT '{}' | Other businesses found in response |
| citations | jsonb | DEFAULT '[]' | Array of {url, title, domain} objects — source-level citation tracking |
| prompt_library_id | uuid | FK → prompt_library(id) | Links scan result to the prompt template used — enables prompt volume aggregation without text matching |
| raw_response_hash | text | | SHA-256 of raw response (for deduplication/change detection) |
| tokens_used | integer | | LLM tokens consumed |
| latency_ms | integer | | Response time |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_engine_results_scan` on `(scan_id)` — join from scans to engine results.
- `idx_engine_results_biz_engine` on `(business_id, engine)` — per-engine trend queries.
- `idx_engine_results_biz_date` on `(business_id, created_at DESC)` — time-series queries.

**RLS:** Users can SELECT via join through scans (`business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())`). Only service role can INSERT.

**Design justification for sentiment_score as integer (0-100):** The gap analysis identified that competitors (Peec, SE Visible, Goodie) use a numeric 0-100 scale rather than a three-value enum. A numeric scale enables meaningful trend analysis (sentiment trending from 72 to 58 over 30 days), allows threshold-based alerting (alert when sentiment drops below 40), and provides finer-grained competitive benchmarking. The classification LLM outputs a numeric score during the parsing step; this preserves the full information rather than bucketing it.

#### `citation_sources` (NEW)

Dedicated tracking of which URLs AI engines cite when discussing a business. Aggregated from `scan_engine_results.citations` for fast querying and historical tracking. One of the key competitive gaps identified — Airefs built their entire product around source-level citation tracking.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business being cited about |
| source_url | text | NOT NULL | The cited URL |
| source_domain | text | NOT NULL | Extracted domain for grouping |
| source_title | text | | Page title if extractable |
| first_seen_at | timestamptz | NOT NULL, DEFAULT NOW() | When this source first appeared |
| last_seen_at | timestamptz | NOT NULL, DEFAULT NOW() | Most recent appearance |
| mention_count | integer | NOT NULL, DEFAULT 1 | Total times cited across all scans |
| engines | text[] | NOT NULL | Which engines cite this source |
| sentiment_avg | integer | | Average sentiment when this source is cited |
| is_own_domain | boolean | NOT NULL, DEFAULT false | Whether the cited URL belongs to the business |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_citation_sources_biz` on `(business_id, mention_count DESC)` — top cited sources for a business.
- `idx_citation_sources_domain` on `(business_id, source_domain)` — domain-level grouping.
- UNIQUE on `(business_id, source_url)` — one row per source per business, updated on each scan.

**RLS:** Users can SELECT where `business_id` belongs to them. Only service role can INSERT/UPDATE (populated by scan pipeline).

**Upsert pattern:** After each scan, the pipeline processes citations from `scan_engine_results`, and for each URL: INSERT on conflict `(business_id, source_url)` DO UPDATE SET `last_seen_at = NOW()`, `mention_count = mention_count + 1`, merge engine arrays, recompute `sentiment_avg`.

### 2.4 Agent & Content Tables

#### `agent_jobs`

Tracks every agent execution — pending, running, completed, failed.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Job owner |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Target business |
| agent_type | text | NOT NULL, CHECK IN ('content_writer', 'blog_writer', 'schema_optimizer', 'recommendations', 'faq_agent', 'review_analyzer', 'social_strategy', 'competitor_intelligence', 'citation_builder', 'llms_txt', 'ai_readiness', 'content_voice_trainer', 'content_pattern_analyzer', 'content_refresh', 'brand_narrative_analyst') | Which agent runs |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'running', 'completed', 'failed', 'cancelled') | Job lifecycle |
| input_data | jsonb | NOT NULL, DEFAULT '{}' | User-provided parameters (topic, tone, word count, etc.) |
| output_data | jsonb | | For non-content agents: full output. For content agents: summary only (content goes to content_items). |
| qa_score | numeric(3,2) | | Quality gate score (0.00-1.00) |
| error_message | text | | Error details if failed |
| inngest_run_id | text | | Inngest function run ID for correlation |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| completed_at | timestamptz | | |

**Indexes:**
- `idx_agent_jobs_user_created` on `(user_id, created_at DESC)` — user's job history.
- `idx_agent_jobs_biz_type` on `(business_id, agent_type)` — "last run of this agent for this business".
- `idx_agent_jobs_status` on `(status)` WHERE `status IN ('pending', 'running')` — active job monitoring.

**RLS:** Users can SELECT their own jobs. Only service role can INSERT/UPDATE (job lifecycle managed by Inngest).

#### `agent_job_steps`

Individual steps within an agent execution. Provides granular progress tracking for the chat UI.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| agent_job_id | uuid | NOT NULL, FK → agent_jobs(id) ON DELETE CASCADE | Parent job |
| step_name | text | NOT NULL | Step identifier (research, outline, write, qa, finalize) |
| step_order | integer | NOT NULL | Execution sequence |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'running', 'completed', 'failed', 'skipped') | Step lifecycle |
| input_summary | text | | What went into this step |
| output_summary | text | | What came out (for display in chat) |
| model_used | text | | Which LLM model ran this step |
| tokens_used | integer | | Token consumption |
| duration_ms | integer | | Step execution time |
| started_at | timestamptz | | |
| completed_at | timestamptz | | |

**Indexes:** `idx_job_steps_job` on `(agent_job_id, step_order)` — ordered steps for a job.
**RLS:** Users can SELECT steps where the parent `agent_job_id` belongs to them (join through agent_jobs). Service role writes.

#### `content_items`

Every piece of content generated by agents. The user's content library.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Content owner |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Associated business |
| agent_job_id | uuid | FK → agent_jobs(id) | Which agent created this |
| agent_type | text | NOT NULL | Agent that generated (denormalized for filtering) |
| content_type | text | NOT NULL, CHECK IN ('article', 'blog_post', 'faq', 'social_post', 'schema_markup', 'llms_txt', 'outreach_template', 'comparison', 'ranked_list', 'location_page', 'case_study', 'product_deep_dive') | Content template type — expanded to 12 types per competitive analysis |
| title | text | NOT NULL | Content title |
| content_body | text | NOT NULL | Full content (Markdown) |
| meta_description | text | | SEO meta description |
| content_format | text | NOT NULL, DEFAULT 'markdown', CHECK IN ('markdown', 'html', 'json_ld', 'plain_text', 'structured_report') | Output format |
| status | text | NOT NULL, DEFAULT 'draft', CHECK IN ('draft', 'in_review', 'approved', 'published', 'archived') | Content lifecycle. 'in_review' enables editorial review queue. |
| language | text | DEFAULT 'en' | Content language |
| word_count | integer | | Computed word count |
| tags | text[] | DEFAULT '{}' | User-assigned tags |
| published_url | text | | External URL after CMS publish |
| published_at | timestamptz | | When published to CMS |
| is_favorited | boolean | DEFAULT false | User bookmarked |
| voice_profile_id | uuid | FK → content_voice_profiles(id) | Voice profile used for generation |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_content_items_user` on `(user_id, created_at DESC)` — content library listing.
- `idx_content_items_biz_type` on `(business_id, content_type)` — filtered views.
- `idx_content_items_status` on `(status)` WHERE `status = 'in_review'` — editorial review queue.

**RLS:** Users can SELECT, UPDATE (title, status, content_body, is_favorited, tags), and DELETE their own content. Only service role can INSERT (agent pipeline creates content).

**Design justification for expanded content_type:** The gap analysis identified that Rank Prompt ships 6 typed content generators while Beamix had generic "article" and "blog_post" only. Typed templates (comparison, ranked_list, location_page, case_study, product_deep_dive) allow each content type to follow distinct structural patterns optimized for AI citation. The agent pipeline uses the content_type to select the appropriate prompt template and output structure.

#### `content_versions`

Version history for user edits. Immutable append-only table.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| content_item_id | uuid | NOT NULL, FK → content_items(id) ON DELETE CASCADE | Parent content |
| version_number | integer | NOT NULL | Sequential version (1, 2, 3...) |
| content_body | text | NOT NULL | Full content at this version |
| edited_by | text | NOT NULL, DEFAULT 'user', CHECK IN ('user', 'agent', 'system') | Who made this version |
| change_summary | text | | What changed |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_content_versions_item` on `(content_item_id, version_number DESC)` — version history.
**RLS:** Users can SELECT versions for their own content. Service role inserts.

#### `content_performance` (NEW)

Tracks how published content impacts AI visibility over time. Closes the "content ROI" gap identified in the competitive analysis — Bear AI, Gauge, Goodie, and Spotlight all track this.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| content_item_id | uuid | NOT NULL, FK → content_items(id) ON DELETE CASCADE | Published content being tracked |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Denormalized for query performance |
| scan_id | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | The scan that measured this |
| measurement_date | date | NOT NULL | Date of measurement |
| visibility_score_before | integer | | Business's visibility score at publication time |
| visibility_score_after | integer | | Visibility score at measurement time |
| score_delta | integer | | Computed: after - before |
| mention_count_before | integer | | Engine mentions at publication |
| mention_count_after | integer | | Engine mentions at measurement |
| avg_position_before | numeric(4,1) | | Average rank position at publication |
| avg_position_after | numeric(4,1) | | Average rank position at measurement |
| engines_mentioning | text[] | | Which engines now mention the business in relation to content topics |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_content_perf_item` on `(content_item_id, measurement_date DESC)` — performance timeline for a specific content piece.
- `idx_content_perf_biz` on `(business_id, measurement_date DESC)` — all content performance for a business.
- UNIQUE on `(content_item_id, scan_id)` — one measurement per content per scan.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by scan pipeline post-processing).

**Pipeline:** After each scheduled scan completes, the pipeline identifies all published `content_items` for the business, computes the delta between publication-time baseline metrics and current scan metrics, and inserts a `content_performance` row. The baseline is captured at publication time by snapshotting the most recent scan metrics.

#### `content_voice_profiles` (NEW)

Stores trained voice profiles for content generation. Addresses the "Author Stamp" gap — Goodie AI's key differentiator.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business this voice belongs to |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| name | text | NOT NULL | Profile name (e.g., "Formal Blog Voice", "Casual Social Voice") |
| voice_description | text | NOT NULL | LLM-generated description of the voice: tone, sentence structure, vocabulary patterns, formality level |
| training_sources | jsonb | NOT NULL, DEFAULT '[]' | Array of {type, url_or_id, excerpt_count} — what was analyzed to build this profile |
| example_excerpts | text[] | NOT NULL, DEFAULT '{}' | 5-10 representative text excerpts (used as few-shot examples in agent prompts) |
| vocabulary_patterns | jsonb | DEFAULT '{}' | Extracted patterns: preferred words, avoided words, sentence length distribution, paragraph structure |
| is_default | boolean | DEFAULT false | Default voice for this business |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Training pipeline:** User provides website URL or selects existing content items. System crawls pages (cheerio), extracts text content, sends to Claude Opus (`claude-opus-4-6`) for voice analysis (tone, structure, vocabulary patterns, formality), generates a `voice_description` and selects representative `example_excerpts`. These are then injected into content agent prompts as style guidance. **Model justification:** Opus is used instead of Sonnet because voice profile quality is critical — the voice profile affects all subsequent content output across every content-generating agent. The higher model cost is justified by the compounding quality impact.

**Indexes:** `idx_voice_profiles_biz` on `(business_id)`.
**RLS:** Users can SELECT, INSERT, UPDATE, DELETE for their own businesses.

### 2.5 Intelligence Tables

#### `competitors`

Businesses tracked as competitors.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | User's business this competitor is tracked against |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| name | text | NOT NULL | Competitor business name |
| domain | text | | Competitor website domain |
| source | text | DEFAULT 'manual', CHECK IN ('manual', 'auto_detected') | How competitor was added |
| is_active | boolean | DEFAULT true | Whether actively tracked |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_competitors_biz` on `(business_id)` WHERE `is_active = true`.
**RLS:** Users can SELECT, INSERT, UPDATE, DELETE for their own businesses.
**Tier limits enforced at API layer:** Starter 3, Pro 5, Business 10.

#### `competitor_scans`

Results when we scan for competitor visibility alongside the user's business.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| scan_id | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | Parent scan |
| competitor_id | uuid | NOT NULL, FK → competitors(id) ON DELETE CASCADE | Which competitor |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Denormalized |
| engine | text | NOT NULL | Engine queried |
| is_mentioned | boolean | NOT NULL, DEFAULT false | Was competitor mentioned |
| rank_position | integer | | Competitor's position |
| sentiment_score | integer | CHECK (0-100) | Sentiment toward competitor |
| mention_context | text | | Context snippet |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_comp_scans_scan` on `(scan_id)` — all competitor results for a scan.
- `idx_comp_scans_competitor` on `(competitor_id, created_at DESC)` — competitor visibility trend.
- UNIQUE on `(competitor_id, scan_id)` — one result per competitor per scan.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts.

#### `recommendations`

AI-generated action items, created automatically after each scan by the Recommendations Agent.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business these apply to |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| scan_id | uuid | FK → scans(id) | Which scan generated this |
| title | text | NOT NULL | Recommendation title |
| description | text | NOT NULL | Detailed description |
| recommendation_type | text | NOT NULL, CHECK IN ('content', 'technical', 'outreach', 'optimization') | Category |
| impact | text | NOT NULL, CHECK IN ('high', 'medium', 'low') | Estimated impact |
| effort | text | NOT NULL, CHECK IN ('high', 'medium', 'low') | Estimated effort |
| suggested_agent | text | | Which agent could execute this (agent_type value) |
| status | text | NOT NULL, DEFAULT 'new', CHECK IN ('new', 'in_progress', 'completed', 'dismissed') | User action state |
| evidence | text | | Supporting data from scan results |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_recs_biz_status` on `(business_id, status)` WHERE `status IN ('new', 'in_progress')` — active recommendations.
- `idx_recs_biz_created` on `(business_id, created_at DESC)` — recommendation history.

**RLS:** Users can SELECT their own. Can UPDATE status only (new → in_progress, in_progress → completed, any → dismissed). Service role inserts.

#### `tracked_queries`

Prompts/queries a business actively monitors across AI engines.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business tracking this query |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| query_text | text | NOT NULL | The prompt being tracked |
| category | text | CHECK IN ('recommendation', 'comparison', 'specific', 'review', 'authority') | Prompt category |
| is_active | boolean | DEFAULT true | Whether currently tracked |
| source | text | DEFAULT 'manual', CHECK IN ('manual', 'auto_suggested', 'imported') | How query was added |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_tracked_queries_biz` on `(business_id)` WHERE `is_active = true`.
**RLS:** Full CRUD for own businesses.
**Tier limits enforced at API layer:** Starter 10, Pro 25, Business 75.

### 2.6 Prompt Intelligence Tables (NEW)

These tables close the "prompt volume data" gap — the single largest data gap vs enterprise competitors (Profound, Writesonic, Ahrefs all have proprietary prompt datasets).

#### `prompt_library` (NEW)

Curated library of prompts organized by industry and category. Seeded from industry constants and enriched over time from scan data.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| prompt_text | text | NOT NULL | The prompt template |
| industry | text | NOT NULL | Industry this prompt applies to |
| category | text | NOT NULL, CHECK IN ('recommendation', 'comparison', 'specific', 'review', 'authority') | Prompt type |
| language | text | NOT NULL, DEFAULT 'en' | Prompt language |
| location_template | boolean | DEFAULT false | Whether prompt contains {location} placeholder |
| estimated_volume | integer | DEFAULT 0 | Estimated monthly conversation volume (aggregated from scans) |
| trending_direction | text | DEFAULT 'stable', CHECK IN ('rising', 'stable', 'declining') | Trend based on recent volume changes |
| sample_size | integer | DEFAULT 0 | Number of scans that contribute to volume estimate |
| last_volume_update | timestamptz | | When volume estimate was last recalculated |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_prompt_lib_industry` on `(industry, category)` — prompt suggestions per industry.
- `idx_prompt_lib_volume` on `(industry, estimated_volume DESC)` — top prompts by volume.

**RLS:** All authenticated users can SELECT. Service role inserts and updates.

**Volume estimation approach:** Beamix cannot match Profound's 130M conversation panel, but can build a lightweight proxy. Every time a prompt is used in a scan across any Beamix user, the system records whether the AI engine provided a substantive answer (not a refusal or generic response). The ratio of "substantive responses" to "total queries" across engines, multiplied by a scaling factor based on Beamix's total user base, produces an estimated volume. As the user base grows, these estimates become more accurate. This is analogous to how early SEO tools estimated keyword volumes from toolbar data before Google provided official numbers.

#### `prompt_volumes` (NEW)

Time-series data for prompt volume tracking. One row per prompt per measurement period.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| prompt_library_id | uuid | NOT NULL, FK → prompt_library(id) ON DELETE CASCADE | Which prompt |
| measurement_period | date | NOT NULL | Week start date |
| scan_count | integer | NOT NULL, DEFAULT 0 | Number of scans using this prompt this period |
| mention_rate | numeric(5,4) | | % of scans where businesses were mentioned |
| avg_position | numeric(4,1) | | Average rank position across all results |
| competitor_density | numeric(5,4) | | Average number of competitors mentioned per response |
| engine_coverage | jsonb | DEFAULT '{}' | Per-engine mention rates |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_prompt_vol_prompt_date` on `(prompt_library_id, measurement_period DESC)` — time series for a prompt.
- UNIQUE on `(prompt_library_id, measurement_period)` — one measurement per prompt per period.

**RLS:** All authenticated users can SELECT (aggregated, anonymized data). Service role inserts.

**Aggregation pipeline:** A weekly Inngest cron job processes all `scan_engine_results` from the past week, groups by prompt text (normalized), updates `prompt_library.estimated_volume` and `trending_direction`, and inserts `prompt_volumes` rows. No individual user data is exposed — only aggregate statistics.

### 2.7 Workflow & Automation Tables (NEW)

These tables close the "agent workflow/chain" gap. Profound's Workflows feature allows event-triggered multi-agent automation. Beamix needs this to automate the "visibility drop → audit → draft → review → publish" cycle.

#### `agent_workflows` (NEW)

User-defined automation workflows that chain agents together based on trigger events.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business this workflow applies to |
| name | text | NOT NULL | Workflow name (e.g., "Auto-fix visibility drops") |
| description | text | | What this workflow does |
| trigger_type | text | NOT NULL, CHECK IN ('visibility_drop', 'scan_complete', 'competitor_overtake', 'schedule', 'manual', 'content_published', 'sentiment_shift') | What starts the workflow |
| trigger_config | jsonb | NOT NULL, DEFAULT '{}' | Trigger parameters (threshold, schedule cron, etc.) |
| steps | jsonb | NOT NULL | Ordered array of {agent_type, input_config, condition, depends_on} — the workflow definition |
| is_active | boolean | DEFAULT true | Whether workflow is enabled |
| max_runs_per_month | integer | DEFAULT 10 | Safety limit |
| runs_this_month | integer | DEFAULT 0 | Counter (reset by monthly cron) |
| last_run_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**steps JSONB schema (Zod-validated on API write):**

```typescript
const WorkflowStepSchema = z.object({
  step_order: z.number().int().min(1),           // Execution sequence (1-based)
  agent_type: z.enum([...AGENT_TYPES]),           // Which agent to run
  input_config: z.record(z.unknown()).default({}), // Agent-specific parameters (topic, tone, etc.)
  condition: z.string().nullable().default(null),  // JS-like expression evaluated against previous step output
                                                   // e.g., "previous_step.qa_score < 0.6" or "previous_step.output_data.score < 60"
                                                   // null = always execute
  depends_on: z.array(z.number().int()).default([]), // step_order values this step waits for
  on_failure: z.enum(["skip", "abort"]).default("skip"), // What to do if this step fails
});

const WorkflowStepsSchema = z.array(WorkflowStepSchema).min(1).max(10);
```

Steps can depend on previous steps and reference their output in conditions. Maximum 10 steps per workflow to cap resource usage.

**Indexes:** `idx_workflows_biz` on `(business_id)` WHERE `is_active = true`.
**RLS:** Full CRUD for own businesses.

#### `workflow_runs` (NEW)

Execution history of workflow instances.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| workflow_id | uuid | NOT NULL, FK → agent_workflows(id) ON DELETE CASCADE | Which workflow |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| trigger_event | jsonb | NOT NULL | The event that triggered this run |
| status | text | NOT NULL, DEFAULT 'running', CHECK IN ('running', 'completed', 'failed', 'cancelled') | Run lifecycle |
| steps_completed | integer | DEFAULT 0 | Progress counter |
| steps_total | integer | NOT NULL | Total steps in workflow |
| agent_job_ids | uuid[] | DEFAULT '{}' | Array of agent_job IDs created during this run |
| results_summary | jsonb | | Aggregated results from all steps |
| credits_used | integer | DEFAULT 0 | Total credits consumed |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| completed_at | timestamptz | | |

**Indexes:** `idx_workflow_runs_workflow` on `(workflow_id, started_at DESC)`.
**RLS:** Users can SELECT their own. Service role inserts/updates.

### 2.8 Brand Intelligence Tables (NEW)

#### `personas` (NEW)

Buyer personas for persona-based visibility tracking. Addresses the Scrunch-style differentiation.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business these personas belong to |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| name | text | NOT NULL | Persona name (e.g., "Tech-Savvy Small Business Owner") |
| description | text | | Persona description |
| prompt_modifiers | text[] | DEFAULT '{}' | Phrases appended to prompts for persona-specific scanning ("as a startup founder", "for a small restaurant") |
| journey_stage | text | CHECK IN ('awareness', 'consideration', 'decision') | Funnel stage this persona represents |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_personas_biz` on `(business_id)`.
**RLS:** Full CRUD for own businesses.

#### `brand_narratives` (NEW)

Stores analyzed brand narratives — what AI says about a business and WHY. Addresses AthenaHQ's ACE (Athena Citation Engine) gap.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business being analyzed |
| scan_id | uuid | NOT NULL, FK → scans(id) ON DELETE CASCADE | Which scan produced this analysis |
| narrative_summary | text | NOT NULL | LLM-generated summary: "AI positions your brand as X because Y" |
| key_themes | jsonb | NOT NULL | Array of {theme, frequency, sentiment, engines} — recurring narrative themes |
| brand_positioning | text | | How AI positions the brand relative to competitors |
| misperceptions | jsonb | DEFAULT '[]' | Array of {claim, correction, severity} — things AI gets wrong |
| narrative_score | integer | CHECK (0-100) | Overall brand narrative health score |
| compared_to_previous | jsonb | | Delta analysis: what changed since last scan |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_brand_narratives_biz` on `(business_id, created_at DESC)`.
**RLS:** Users can SELECT for their own businesses. Service role inserts.

**Pipeline:** After each scan completes and engine results are stored, a separate Inngest step sends all mention contexts and competitor contexts to Claude Sonnet with a narrative analysis prompt. The model identifies recurring themes, brand positioning statements, and factual inaccuracies. The output is stored as a `brand_narratives` row and compared to the previous analysis for change detection.

#### `competitor_share_of_voice` (NEW)

Weekly share-of-voice data, computed by `cron.weekly-digest`. Stores the percentage of AI engine mentions each competitor captures relative to the business.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business being analyzed |
| competitor_id | uuid | NOT NULL, FK → competitors(id) ON DELETE CASCADE | Competitor being measured |
| week_start | date | NOT NULL | Start of the measurement week (Monday) |
| voice_share_pct | numeric(5,2) | NOT NULL | Percentage of mentions this competitor captures (0.00-100.00) |
| mention_count | integer | NOT NULL, DEFAULT 0 | Total mentions for this competitor during the week |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_sov_biz_week` on `(business_id, week_start DESC)` — weekly share-of-voice trends.
- UNIQUE on `(business_id, competitor_id, week_start)` — one measurement per competitor per week.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (computed by `cron.weekly-digest`).

**Computation:** For each business, the weekly digest cron aggregates all `scan_engine_results` and `competitor_scans` from the past 7 days. It counts total mentions per entity (the business + each tracked competitor), then computes each entity's share as a percentage of total mentions. The business itself is stored in `competitor_share_of_voice` with `competitor_id = NULL` to represent self-share.

#### `crawler_detections` (NEW)

AI crawler visit data pulled from Cloudflare integration. Tracks which AI bots visit the user's site.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business site being crawled |
| crawler_name | text | NOT NULL | Normalized AI crawler name (e.g., 'GPTBot', 'ClaudeBot', 'Google-Extended') |
| detected_at | timestamptz | NOT NULL | When the crawl was detected |
| page_url | text | | Which page was accessed |
| user_agent | text | | Full user agent string |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_crawler_biz_date` on `(business_id, detected_at DESC)` — recent crawler activity.
- `idx_crawler_biz_name` on `(business_id, crawler_name)` — per-crawler trends.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by Cloudflare integration sync).

#### `ai_readiness_history` (NEW)

Weekly AI readiness score snapshots for trend analysis. Populated by a weekly cron job.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business measured |
| score | integer | NOT NULL, CHECK (score >= 0 AND score <= 100) | Overall AI readiness score |
| score_breakdown | jsonb | NOT NULL, DEFAULT '{}' | Per-category scores: { schema_markup, content_freshness, structured_data, mobile_friendly, page_speed } |
| recorded_at | timestamptz | NOT NULL, DEFAULT NOW() | When this snapshot was taken |

**Indexes:**
- `idx_readiness_biz_date` on `(business_id, recorded_at DESC)` — readiness trend queries.
- UNIQUE on `(business_id, recorded_at::date)` — one snapshot per business per day.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by weekly cron).

### 2.9 Alert & Notification Tables

#### `alert_rules`

User-configurable alert rules. Each rule defines a condition that triggers a notification.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business to monitor |
| alert_type | text | NOT NULL, CHECK IN ('visibility_drop', 'visibility_improvement', 'new_competitor', 'competitor_overtake', 'sentiment_shift', 'credit_low', 'content_performance', 'scan_complete', 'agent_complete', 'trial_ending') | Alert category |
| threshold | jsonb | NOT NULL | Threshold config (e.g., {drop_percent: 15} or {score_below: 40}) |
| channels | text[] | NOT NULL, DEFAULT '{inapp}' | Array of 'inapp', 'email', 'slack' |
| is_active | boolean | DEFAULT true | |
| cooldown_hours | integer | DEFAULT 24 | Deduplication window |
| last_triggered_at | timestamptz | | For deduplication |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_alert_rules_biz` on `(business_id)` WHERE `is_active = true`.
**RLS:** Full CRUD for own businesses.

#### `notifications`

In-app notification history.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Recipient |
| type | text | NOT NULL | Alert type that generated this |
| severity | text | NOT NULL, DEFAULT 'low', CHECK IN ('high', 'medium', 'low') | Visual priority |
| title | text | NOT NULL | Notification title |
| body | text | NOT NULL | Notification body |
| action_url | text | | Deep link into dashboard |
| is_read | boolean | NOT NULL, DEFAULT false | |
| read_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_notifications_user_unread` on `(user_id, is_read)` WHERE `is_read = FALSE` — unread notification count and listing.
**RLS:** Users can SELECT their own. Can UPDATE `is_read` and `read_at` only. Service role inserts.
**Retention:** 90 days. Cleaned by cron.

#### `notification_preferences`

Per-user notification channel preferences.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| email_enabled | boolean | DEFAULT true | Receive email notifications |
| email_digest | text | DEFAULT 'daily', CHECK IN ('realtime', 'daily', 'weekly', 'off') | Email frequency |
| inapp_enabled | boolean | DEFAULT true | In-app notifications |
| slack_webhook_url | text | | Slack incoming webhook |
| slack_enabled | boolean | DEFAULT false | Slack notifications |
| quiet_hours_start | time | | Do not disturb start |
| quiet_hours_end | time | | Do not disturb end |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**RLS:** Users can SELECT and UPDATE their own. Created by trigger.

### 2.10 Integration & API Tables

#### `integrations`

Third-party service connections per business.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Associated business |
| provider | text | NOT NULL, CHECK IN ('wordpress', 'ga4', 'gsc', 'slack', 'cloudflare') | Service provider |
| credentials | jsonb | NOT NULL | AES-256-GCM encrypted at application layer (see Security section) |
| config | jsonb | DEFAULT '{}' | Provider-specific settings (site URL, property ID, etc.) |
| status | text | DEFAULT 'active', CHECK IN ('active', 'inactive', 'error', 'expired') | Connection health |
| last_sync_at | timestamptz | | Last successful data sync |
| last_error | text | | Most recent error message |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_integrations_user_provider` on `(user_id, provider)` — lookup user's integration for a provider.
- UNIQUE on `(business_id, provider)` — one connection per provider per business.

**RLS:** Full CRUD for own businesses.

#### `ga4_metrics` (NEW)

Daily GA4 traffic data pulled by integration sync. Tracks AI referral traffic attribution.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business this data belongs to |
| date | date | NOT NULL | Measurement date |
| sessions | integer | NOT NULL, DEFAULT 0 | Total sessions |
| organic_sessions | integer | NOT NULL, DEFAULT 0 | Sessions from organic search |
| ai_referral_sessions | integer | NOT NULL, DEFAULT 0 | Sessions from AI referral domains (chatgpt.com, perplexity.ai, claude.ai, etc.) |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_ga4_metrics_biz_date` on `(business_id, date DESC)` — time-series queries.
- UNIQUE on `(business_id, date)` — one row per business per day, upserted on each sync.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by GA4 integration sync cron).

#### `gsc_data` (NEW)

Google Search Console data pulled by integration sync. Provides traditional search context for GEO insights.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| business_id | uuid | NOT NULL, FK → businesses(id) ON DELETE CASCADE | Business this data belongs to |
| date | date | NOT NULL | Measurement date |
| query | text | NOT NULL | Search query |
| clicks | integer | NOT NULL, DEFAULT 0 | Click count |
| impressions | integer | NOT NULL, DEFAULT 0 | Impression count |
| position | numeric(5,1) | | Average position |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_gsc_data_biz_date` on `(business_id, date DESC)` — time-series queries.
- `idx_gsc_data_biz_query` on `(business_id, query)` — per-query trend queries.
- UNIQUE on `(business_id, date, query)` — one row per business per query per day.

**RLS:** Users can SELECT where `business_id` belongs to them. Service role inserts (populated by GSC integration sync cron).

#### `api_keys`

API access for Business tier users.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner |
| key_hash | text | NOT NULL | SHA-256 hash of the API key (never store plaintext) |
| key_prefix | text | NOT NULL | First 8 characters for display (bmx_abc12345...) |
| name | text | NOT NULL, DEFAULT 'Default' | User-assigned name |
| scopes | text[] | DEFAULT '{read}', CHECK (scopes <@ ARRAY['read', 'write', 'execute']::text[]) | Permission scopes — uses array containment operator to validate all elements |
| rate_limit | integer | DEFAULT 100 | Requests per minute for this key |
| last_used_at | timestamptz | | |
| expires_at | timestamptz | | NULL means no expiry |
| is_active | boolean | DEFAULT true | Can be disabled without deletion |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_api_keys_hash` on `(key_hash)` — O(1) lookup on every API request.
- `idx_api_keys_user` on `(user_id)`.

**RLS:** Full CRUD for own keys.

### 2.11 CMS Tables

#### `blog_posts`

Internal blog/CMS for Beamix's own content marketing.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| slug | text | UNIQUE, NOT NULL | URL slug |
| title | text | NOT NULL | Post title |
| content | text | NOT NULL | Full Markdown content |
| excerpt | text | | Summary text |
| cover_image_url | text | | Hero image URL |
| author | text | NOT NULL, DEFAULT 'Beamix Team' | Author name |
| category | text | | Category (nullable) |
| tags | text[] | DEFAULT '{}' | Tags |
| is_published | boolean | DEFAULT false | Published state |
| published_at | timestamptz | | |
| view_count | integer | NOT NULL, DEFAULT 0 | Page views (incremented by analytics cron or API) |
| seo_title | text | | Custom SEO title |
| seo_description | text | | Custom meta description |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Indexes:** Unique on `slug`. `idx_blog_published` on `(is_published, published_at DESC)` WHERE `is_published = true`.
**RLS:** All users can SELECT published posts. Service role manages CRUD.
**View counting:** `POST /api/blog/[slug]/view` increments `view_count` via `UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = $1`. No auth required. Rate limited to 1 per IP per slug per hour via Upstash to prevent abuse.

### 2.12 Auto-Update Triggers

All tables with `updated_at` columns require an automatic trigger to keep the value current:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply to every table with `updated_at`: `user_profiles`, `businesses`, `subscriptions`, `credit_pools`, `content_items`, `content_voice_profiles`, `agent_workflows`, `notification_preferences`, `integrations`, `api_keys`, `blog_posts`:

```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.13 Complete Table Summary

| # | Table | Purpose | Row Growth Rate | RLS |
|---|-------|---------|----------------|-----|
| 1 | user_profiles | User metadata | 1 per signup | Own |
| 2 | businesses | User's businesses | 1-3 per user | Own |
| 3 | plans | Subscription tiers | Static (3-5 rows) | Public read |
| 4 | subscriptions | User subscriptions | 1 per user | Own read, service write |
| 5 | credit_pools | Agent credit balances | 1 per user | Own read, service write |
| 6 | credit_transactions | Credit audit trail | ~50/user/month | Own read, service write |
| 7 | free_scans | Anonymous scans | High (viral loop), 14d retention | No RLS |
| 8 | scans | Authenticated scans | 1-30/business/month by tier | Own read, service write |
| 9 | scan_engine_results | Per-engine per-prompt results | 4-10x scans count | Own read (via join), service write |
| 10 | citation_sources | Aggregated citation URLs | ~20/business, updated per scan | Own read, service write |
| 11 | agent_jobs | Agent execution records | ~15/user/month | Own read, service write |
| 12 | agent_job_steps | Per-step agent progress | 4-6x agent_jobs | Own read (via join), service write |
| 13 | content_items | Generated content library | ~15/user/month | Own CRUD, service insert |
| 14 | content_versions | Content edit history | ~2x content_items | Own read, service write |
| 15 | content_performance | Content ROI tracking | 1 per content per scan | Own read, service write |
| 16 | content_voice_profiles | Brand voice profiles | 1-3/business | Own CRUD |
| 17 | competitors | Tracked competitors | 3-10/business | Own CRUD |
| 18 | competitor_scans | Competitor scan results | Proportional to scans | Own read, service write |
| 19 | recommendations | AI-generated action items | 5-8/scan | Own read + status update, service write |
| 20 | tracked_queries | Monitored prompts | 10-75/business by tier | Own CRUD |
| 21 | prompt_library | Curated prompt templates | ~500/industry, growing | Public read, service write |
| 22 | prompt_volumes | Prompt volume time series | Weekly per prompt | Public read, service write |
| 23 | agent_workflows | User-defined automations | 1-5/business | Own CRUD |
| 24 | workflow_runs | Workflow execution history | ~10/workflow/month | Own read, service write |
| 25 | personas | Buyer personas | 2-5/business | Own CRUD |
| 26 | brand_narratives | Brand narrative analysis | 1/scan | Own read, service write |
| 27 | alert_rules | User alert configurations | 3-9/business | Own CRUD |
| 28 | notifications | In-app notifications | ~10/user/week, 90d retention | Own read + mark read, service write |
| 29 | notification_preferences | Notification settings | 1/user | Own CRUD |
| 30 | integrations | Third-party connections | 0-5/business | Own CRUD |
| 31 | api_keys | Public API credentials | 1-3/user (Business tier) | Own CRUD |
| 32 | blog_posts | Beamix blog CMS | Low (editorial) | Public read, service write |
| 33 | ga4_metrics | GA4 traffic data (daily AI referral tracking) | 1/business/day (with integration) | Own read, service write |
| 34 | gsc_data | Google Search Console query data | ~50/business/week | Own read, service write |
| 35 | competitor_share_of_voice | Weekly share-of-voice percentages | ~5-10/business/week | Own read, service write |
| 36 | crawler_detections | AI crawler visit records from Cloudflare | Variable per business | Own read, service write |
| 37 | ai_readiness_history | Weekly AI readiness score snapshots | 1/business/week | Own read, service write |
| 38 | scan_regions | Per-business city/region scan targets | 1-20/business by tier | Own CRUD, service read |
| 39 | exploration_cache | Industry-level conversation explorer result cache | Shared (no user data), 24h TTL | No RLS (no user data), service write |

**Note:** Rate limiting is handled by Upstash Redis (`@upstash/ratelimit`) — no database table is needed for rate limit counters.

---

## 3. API Layer Design

All API routes live under `src/app/api/`. Every route follows these universal patterns:

**Authentication:** Extract Supabase session from cookies via `createClient()`. Return 401 if no session. Exception: `/api/scan/start` (anonymous), `/api/scan/[scan_id]/status` (anonymous), `/api/scan/[scan_id]/results` (anonymous), `/api/inngest` (Inngest signing key), `/api/billing/webhooks` (Paddle signature verification).

**Validation:** Every request body and query parameter is validated with Zod before any business logic runs. Validation errors return 400 with a structured error body: `{ error: string, details?: ZodError['issues'] }`.

**Response shape:** Success responses follow `{ data: T }` for GET requests and `{ data: T, message?: string }` for mutations. Error responses follow `{ error: string, code?: string }`.

**Rate limiting:** Applied per route group, per user (authenticated) or per IP (anonymous). Handled by Upstash Redis (`@upstash/ratelimit`) — no database table needed. Returns 429 with `Retry-After` header when exceeded.

### 3.1 Scan Routes — `/api/scan/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/scan/start` | POST | None (IP rate limited) | Start anonymous free scan |
| `/api/scan/[scan_id]/status` | GET | None | Poll scan status |
| `/api/scan/[scan_id]/results` | GET | None | Get completed scan results |
| `/api/scan/manual` | POST | Required | Trigger manual scan for a business |
| `/api/scan/history` | GET | Required | List scan history for a business |
| `/api/scan/regions` | GET/POST/DELETE | Required | CRUD for scan_regions table. GET lists regions; POST adds a city (tier-limited: Starter=1, Pro=5, Business=20); DELETE removes a non-home region. |

**POST /api/scan/start**
- Input: `{ business_name: string, website_url: string(url), industry: string, location?: string, language?: 'en' | 'he' }`
- Rate limit: 3 per IP per 24 hours
- Process: Validate input. Check IP rate limit against `free_scans` table. Generate nanoid for `scan_id`. Insert row into `free_scans` with status 'pending'. Send Inngest event `scan/free.start`. Return 202 with `{ data: { scan_id } }`.
- Error: 429 if rate limited. 400 if validation fails.

**GET /api/scan/[scan_id]/status**
- Input: `scan_id` path parameter
- Process: Lookup `free_scans` by `scan_id`. Return status and partial progress data.
- Response: `{ data: { status, progress_pct?, engines_completed? } }`
- Error: 404 if scan not found.

**GET /api/scan/[scan_id]/results**
- Input: `scan_id` path parameter
- Process: Lookup `free_scans` by `scan_id` where status = 'completed'. Return full `results_data`.
- Error: 404 if not found. 202 if still processing.

**POST /api/scan/manual**
- Input: `{ business_id: uuid }`
- Auth: Required. User must own business.
- Rate limit: By tier (Starter 1/week, Pro 1/day, Business 1/hour)
- Process: Verify subscription tier. Check rate limit. Create `scans` row. Send Inngest event `scan/manual.start`. Return 202 with `{ data: { scan_id } }`.

### 3.2 Agent Routes — `/api/agents/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/agents/[agentType]/execute` | POST | Required | Trigger agent execution |
| `/api/agents/executions/[id]` | GET | Required | Get execution status/result |
| `/api/agents/executions/[id]` | DELETE | Required | Cancel running execution |
| `/api/agents/history` | GET | Required | List past executions |
| `/api/agents/chat` | POST | Required (Pro+) | Ask Beamix streaming chat |

**POST /api/agents/[agentType]/execute**
- Input: Agent-specific Zod schema (varies by agent type — topic, tone, word_count, target_queries, etc.)
- Auth: Required. Must have active subscription (trialing or active).
- Process: Validate agent type is available for user's tier. Check credit availability via `credit_pools`. Place credit hold via `hold_credits` RPC. Insert `agent_jobs` row. Send Inngest event `agent/execute`. Return 202 with `{ data: { job_id } }`.
- Error: 402 if insufficient credits. 403 if agent not available for tier.

**GET /api/agents/executions/[id]**
- Process: Lookup `agent_jobs` with joined `agent_job_steps`. Return status, progress, output if completed.
- Polling: Client polls every 3 seconds while status is 'pending' or 'running'.

**POST /api/agents/chat**
- Input: `{ message: string, business_id: uuid, conversation_history?: Message[] }`
- Auth: Pro+ tier required.
- Process: Assemble business context. Stream response via Server-Sent Events. No credit charge.

### 3.3 Content Routes — `/api/content/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/content` | GET | Required | List content library (paginated, filterable) |
| `/api/content/[id]` | GET | Required | Get single content item with versions |
| `/api/content/[id]` | PATCH | Required | Update content (title, body, status, tags) |
| `/api/content/[id]` | DELETE | Required | Delete content item |
| `/api/content/[id]/publish` | POST | Required | Publish to CMS integration |
| `/api/content/[id]/performance` | GET | Required | Get content performance data |

**GET /api/content**
- Query params: `business_id`, `content_type?`, `status?`, `agent_type?`, `page`, `per_page`
- Response: Paginated list with total count.

**PATCH /api/content/[id]**
- Input: Partial update — any of `{ title?, content_body?, status?, tags?, is_favorited? }`
- Process: Validate ownership. If `content_body` changes, create a `content_versions` row before updating. Update `content_items`.

**POST /api/content/[id]/publish**
- Input: `{ provider: 'wordpress', publish_as?: 'draft' | 'publish' }`
- Process: Lookup integration for business + provider. Decrypt credentials. Call CMS API. Update `content_items` with `published_url` and `published_at`. Snapshot current scan metrics for `content_performance` baseline.

### 3.4 Dashboard Routes — `/api/dashboard/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/dashboard/overview` | GET | Required | All dashboard widget data |
| `/api/dashboard/rankings` | GET | Required | Rankings table data |
| `/api/dashboard/trends` | GET | Required | Score time series |
| `/api/dashboard/competitors` | GET | Required | Competitor comparison data |
| `/api/dashboard/citations` | GET | Required | Citation source analytics |
| `/api/dashboard/narrative` | GET | Required | Brand narrative analysis |

**GET /api/dashboard/overview**
- Query: `business_id`
- Response: Composite object with latest visibility score, score delta vs previous scan, per-engine breakdown, top 3 recommendations, recent agent activity (last 5 jobs), credit usage, content library count.
- Caching: 5-minute stale time on client. Cache-Control: `s-maxage=300, stale-while-revalidate=600`.

**GET /api/dashboard/citations**
- Query: `business_id`, `period?` (7d, 30d, 90d)
- Response: Top citation sources, grouped by domain, with mention counts and trend data.

### 3.5 Settings Routes — `/api/settings/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/settings/profile` | GET/PATCH | Required | User profile |
| `/api/settings/business` | GET/PATCH | Required | Business profile |
| `/api/settings/preferences` | GET/PATCH | Required | Notification preferences |
| `/api/settings/integrations` | GET | Required | List integrations |
| `/api/settings/integrations/[provider]` | POST/DELETE | Required | Connect/disconnect integration |
| `/api/settings/voice-profiles` | GET/POST | Required | Manage voice profiles |
| `/api/settings/voice-profiles/[id]` | PATCH/DELETE | Required | Update/delete voice profile |
| `/api/settings/voice-profiles/train` | POST | Required | Train new voice profile from URL |
| `/api/settings/export` | POST | Required | GDPR data export — generates full user data package |

**POST /api/settings/export**
- Auth: Required.
- Process: Collects all user data: profile, businesses, scans, scan_engine_results, content_items, agent_jobs, recommendations, alert_rules, notification_preferences, credit_pools, credit_transactions. Generates JSON package. Sends download link via email (Resend). Large exports are generated async via Inngest and emailed when ready.
- Response: `{ data: { export_id, status: 'processing' } }` — 202 Accepted.
- Rate limit: 1 per user per 24 hours.

### 3.6 Billing Routes — `/api/billing/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/billing/checkout` | POST | Required | Create Paddle checkout session |
| `/api/billing/portal` | POST | Required | Get Paddle customer portal URL |
| `/api/billing/webhooks` | POST | Paddle signature | Process Paddle webhook events |
| `/api/billing/credits/topup` | POST | Required | Purchase additional credits |
| `/api/billing/usage` | GET | Required | Current billing period usage |

**POST /api/billing/webhooks**
- Auth: Paddle webhook signature verification (not user session).
- Events handled: `subscription.created`, `subscription.updated`, `subscription.cancelled`, `subscription.past_due`, `transaction.completed`, `transaction.payment_failed`.
- Process: Verify signature. Update `subscriptions` table. On new subscription: allocate credits via `credit_pools`. On cancellation: schedule downgrade. On payment failure: send email notification.

### 3.7 Integration Routes — `/api/integrations/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/integrations/wordpress/publish` | POST | Required | Publish content to WordPress |
| `/api/integrations/ga4/connect` | POST | Required | Initiate GA4 OAuth flow |
| `/api/integrations/ga4/callback` | GET | Required | GA4 OAuth callback |
| `/api/integrations/gsc/connect` | POST | Required | Initiate GSC OAuth flow |
| `/api/integrations/gsc/callback` | GET | Required | GSC OAuth callback |
| `/api/integrations/slack/webhook` | POST | Required | Save Slack webhook URL |

### 3.8 Alert & Competitor Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/alerts/rules` | GET/POST | Required | List/create alert rules |
| `/api/alerts/rules/[id]` | PATCH/DELETE | Required | Update/delete alert rule |
| `/api/alerts/notifications` | GET | Required | List user notifications (paginated, 20 per page) |
| `/api/alerts/notifications/[id]` | PATCH | Required | Mark single notification as read |
| `/api/alerts/notifications/mark-all-read` | POST | Required | Mark all unread notifications as read |
| `/api/recommendations` | GET | Required | List recommendations for a business (query: business_id, status?, impact?, page, per_page) |
| `/api/recommendations/[id]` | PATCH | Required | Update recommendation status (new → in_progress, in_progress → completed, any → dismissed) |
| `/api/competitors` | GET/POST | Required | List/add competitors |
| `/api/competitors/[id]` | PATCH/DELETE | Required | Update/delete competitor |
| `/api/crawlers` | GET | Required | List AI crawler detections for a business (query: business_id, period?) |

### 3.9 Workflow Routes (NEW) — `/api/workflows/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/workflows` | GET/POST | Required (Pro+) | List/create workflows |
| `/api/workflows/[id]` | GET/PATCH/DELETE | Required | Manage workflow |
| `/api/workflows/[id]/run` | POST | Required | Manually trigger workflow |
| `/api/workflows/[id]/runs` | GET | Required | List workflow run history |

### 3.10 Analytics Routes — `/api/analytics/*`

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/analytics/content-performance` | GET | Required | Content ROI data |
| `/api/analytics/prompt-volumes` | GET | Required | Prompt volume estimates |
| `/api/analytics/prompt-trends` | GET | Required | Trending prompts by industry |
| `/api/analytics/brand-narrative` | GET | Required | Brand narrative analysis |
| `/api/analytics/crawler-feed` | GET | Required (Pro+) | AI bot crawl activity from Cloudflare integration. Params: businessId, days (7/30/90), bot (optional). |
| `/api/analytics/explore` | POST | Required (Pro+) | Conversation Explorer — generates industry query suggestions via Haiku (Pro) or Perplexity Sonar (Business). Caches results 24h per (industry, location, seedTopic, source). |
| `/api/analytics/prompt-volume` | GET | Required | Per-query volume data — real GSC impressions (Pro+) or estimated band (all tiers). |
| `/api/dashboard/web-mentions` | GET | Required (All paid) | Web mentions from citation_sources where mention_type='web_mention'. Params: businessId, since, limit. |

### 3.11 Public API Routes — `/api/v1/*`

All `/api/v1/*` routes require API key authentication (Business tier only). API key is passed via `Authorization: Bearer bmx_...` header. Key is hashed with SHA-256 and looked up in `api_keys` table. Scopes are checked per route.

Rate limit: 100 requests per minute per API key (configurable per key).

| Route | Method | Scope | Purpose |
|-------|--------|-------|---------|
| `/api/v1/scans` | GET | read | Scan history |
| `/api/v1/scans/[id]` | GET | read | Single scan with engine results |
| `/api/v1/rankings` | GET | read | Current rankings |
| `/api/v1/visibility/score` | GET | read | Current visibility score |
| `/api/v1/visibility/history` | GET | read | Score time series |
| `/api/v1/competitors` | GET | read | Tracked competitors |
| `/api/v1/content` | GET | read | Content library |
| `/api/v1/agents/[type]/execute` | POST | execute | Trigger agent |
| `/api/v1/agents/executions/[id]` | GET | read | Execution status |

### 3.12 Onboarding & Preferences Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/onboarding/complete` | POST | Required | Complete onboarding flow |
| `/api/onboarding/suggest-competitors` | POST | Required | Auto-suggest competitors via Perplexity+Haiku. Body: businessType, city, country, websiteUrl. Rate limit: 3/user/day. Results are ephemeral (not persisted). |
| `/api/preferences` | GET/PATCH | Required | User preferences (locale, timezone) |

**POST /api/onboarding/complete**
- Input: `{ business_name, website_url, industry, location?, services?, scan_id? }`
- Process: UPSERT `user_profiles` (set onboarding_completed_at). Create `businesses` record. If `scan_id` provided: link `free_scans.converted_user_id`, convert free scan results into `scans` + `scan_engine_results`. Set trial dates on `subscriptions`. Allocate trial credit pool: INSERT INTO credit_pools (user_id, pool_type, base_allocation) VALUES (user_id, 'trial', 5) — 5 credits for entire trial period. Create default `alert_rules`. Create default `tracked_queries` from industry constants.

---

## 4. Background Job Architecture (Inngest)

Inngest is the central orchestration layer for all long-running operations. The Inngest serve endpoint is at `/api/inngest`. All functions are registered in a single registry file.

### 4.1 Why Inngest

Vercel serverless functions have a 10-60 second timeout depending on plan. Scan cycles take 30-120 seconds (multiple LLM API calls in parallel). Agent pipelines take 60-300 seconds (multi-step LLM processing). These operations must survive timeouts, support per-step retry, and provide observability. Inngest step functions run each step independently, resuming from the last successful step on retry. No Redis, no BullMQ, no infrastructure to manage.

### 4.2 Inngest Functions Registry

#### Scan Functions

**`scan.free.run`**
- Trigger: Event `scan/free.start`
- Concurrency: 25 total (system-wide)
- Timeout: 120s
- Retries: 1
- Steps:
  1. `generate-prompts` — Generate 3 prompts based on business name, industry, location, language (recommendation, comparison, specific)
  2. `query-and-crawl` — Fan out to 3 free-tier engines (ChatGPT, Gemini, Perplexity) in parallel + crawl website via cheerio for AI readiness. Promise.allSettled ensures partial results if one engine fails. (Claude is Pro-tier only. Bing Copilot removed — no public API.)
  3. `parse-responses` — Send each raw response to Claude Haiku for mention detection, position extraction, sentiment scoring (0-100), citation extraction, competitor identification
  4. `compute-scores` — Compute visibility score (weighted average across engines), AI readiness score (5 categories), generate quick wins, extract leaderboard
  5. `store-results` — UPDATE `free_scans` with results_data and status='completed'
  6. `aggregate-prompt-data` — Upsert prompt usage statistics into `prompt_library` for volume estimation

**`scan.scheduled.run`**
- Trigger: Event `scan/scheduled.start` (emitted by `cron.scheduled-scans`)
- Concurrency: 50 total, 1 per user (prevents one user from monopolizing the queue)
- Timeout: 300s
- Retries: 1
- Steps:
  1. `fetch-context` — Load business, tracked queries, competitors, subscription tier
  2. `generate-prompts` — 5 prompts per tracked query (all categories)
  3. `query-engines` — Fan out to tier-appropriate engines (4/8/10+). Per-engine rate limiting. Promise.allSettled.
  4. `parse-responses` — Claude Haiku classification for each response
  5. `compute-scores` — Visibility score, per-engine breakdown
  6. `store-results` — Batch INSERT into `scans` + `scan_engine_results`
  7. `upsert-citations` — Aggregate citations into `citation_sources`
  8. `analyze-narrative` — Send mention contexts to Claude Sonnet for brand narrative analysis, store in `brand_narratives`
  9. `compute-content-performance` — For each published content_item, compute delta and insert `content_performance` row
  10. `compare-previous` — Compare to previous scan, compute deltas
  11. `generate-recommendations` — Run Recommendations Agent (0 credits) to produce prioritized action items
  12. `evaluate-alerts` — Check all active `alert_rules` for this business against deltas
  13. `evaluate-workflows` — Check if any active `agent_workflows` should trigger based on scan results
  14. `update-schedule` — Set `businesses.last_scanned_at` and compute `next_scan_at`

**`scan.manual.run`**
- Trigger: Event `scan/manual.start`
- Concurrency: 10 total, 1 per user
- Timeout: 300s
- Retries: 1
- Steps: Same as scheduled scan.

#### Agent Functions

**`agent.execute`**
- Trigger: Event `agent/execute`
- Concurrency: 20 total, 5 per user (key: `event.data.userId`)
- Timeout: 600s
- Retries: 1
- Steps:
  1. `assemble-context` — Load full business context (business details, last 3 scans, last 10 content items, competitors, recommendations, voice profile if set)
  2. `research` — Agent-specific research step (Perplexity sonar-pro for most agents, scan data for FAQ/Schema agents)
  3. `outline` — Generate content structure (Claude Sonnet)
  4. `write` — Full content generation (Claude Sonnet, with voice profile examples if available)
  5. `qa` — Quality gate (GPT-4o, score 0.00-1.00)
  6. `finalize` — If QA >= 0.7: confirm credit hold, store output, insert content_item if applicable, notify user. If QA < 0.7 on first try: retry write step with adjusted parameters. If still < 0.7: release credit hold, mark job failed, notify user.

**~~`agent.ask-beamix`~~ REMOVED** — Ask Beamix requires SSE streaming which is incompatible with Inngest background functions. It is implemented as a direct API route handler at `/api/agents/chat` (see Section 3). Not an Inngest function.

**`cron.content-refresh-check`**
- Trigger: Cron `0 6 * * *` (daily at 6AM UTC)
- Concurrency: 1 (singleton)
- Timeout: 300s
- Retries: 2
- Steps:
  1. `find-stale-content` — Query `content_items` where `updated_at < NOW() - INTERVAL '30 days'` AND `status = 'published'`. Group by business.
  2. `evaluate-refresh-need` — For each stale item, check if related scan scores have changed since content was created. If score delta > 10 points, flag for refresh.
  3. `trigger-refresh-agents` — For each flagged item, emit `agent/execute` event with `agent_type = 'content_refresh'` (respects credit availability — skips if insufficient credits).
  4. `record-check` — Log the check results for observability.

**`cron.voice-refinement`**
- Trigger: Cron `0 3 * * 0` (weekly, Sunday 3:00AM UTC)
- Concurrency: 1 (singleton)
- Timeout: 600s
- Retries: 1
- Steps:
  1. `find-eligible-profiles` — Query `voice_profiles` that have been used by ≥3 content agents since last refinement.
  2. `collect-performance-data` — For each profile, gather content performance metrics (scan score changes post-publication).
  3. `refine-voice` — Run Claude Opus (`claude-opus-4-6`) with the existing voice profile + performance feedback to produce an updated voice profile. Store as new version (keeps previous version for rollback). Quality-critical — voice profile affects all content output.
  4. `notify-users` — Send in-app notification that voice profile has been refined with summary of changes.

#### Workflow Functions (NEW)

**`workflow.execute`**
- Trigger: Event `workflow/execute`
- Concurrency: 5 per user (key: `event.data.userId`)
- Timeout: 1800s (30 minutes — workflows chain multiple agents)
- Retries: 0 (individual agent steps have their own retries)
- Steps: Dynamic based on workflow definition.
  1. `validate-workflow` — Check workflow is active, user has credits, monthly run limit not exceeded
  2. `create-run` — Insert `workflow_runs` row
  3. For each step in workflow.steps (sequential):
     a. `evaluate-condition` — Check step's condition against previous step outputs
     b. `execute-agent` — Place credit hold, insert agent_job, send `agent/execute` event, wait for completion (Inngest `waitForEvent`)
     c. `record-step` — Update workflow_runs.steps_completed
  4. `finalize-run` — Update workflow_runs status, compute total credits used, notify user

#### Alert Functions

**`alert.evaluate`**
- Trigger: Event `alert/evaluate`
- Concurrency: 50 total
- Timeout: 30s
- Retries: 2
- Steps:
  1. `fetch-rules` — Load active alert_rules for business
  2. `evaluate-rules` — For each rule: check threshold against provided context data. Check deduplication (cooldown_hours vs last_triggered_at).
  3. `route-notifications` — For each triggered alert: check notification_preferences, create notification in DB, send email via Resend if configured, POST to Slack webhook if configured.

#### Data Functions

**`gdpr.export`**
- Trigger: Event `gdpr/export-requested`
- Concurrency: 5 total, 1 per user
- Timeout: 300s
- Retries: 1
- Steps:
  1. `gather-data` — Query all user data from all tables: user_profiles, businesses, scans, scan_engine_results, content_items, content_versions, agent_jobs, recommendations, alert_rules, notification_preferences, credit_pools, credit_transactions, competitors, tracked_queries, integrations (credentials excluded), api_keys (hashes excluded).
  2. `serialize` — Serialize all data to a JSON package with table names as top-level keys.
  3. `upload` — Upload JSON file to Supabase Storage (bucket: `gdpr-exports`, path: `{user_id}/{timestamp}.json`). Set expiry: 24 hours.
  4. `notify` — Send download link via Resend using the `gdpr-export-ready` email template. Link is a signed Supabase Storage URL valid for 24 hours.
  5. `schedule-cleanup` — Send a delayed Inngest event (`gdpr/export-cleanup`) scheduled for 24 hours later to delete the file from storage.

**`gdpr.export-cleanup`**
- Trigger: Event `gdpr/export-cleanup`
- Concurrency: 10 total
- Timeout: 30s
- Retries: 2
- Steps:
  1. `delete-file` — Delete the export file from Supabase Storage.

#### Cron Functions

| Function | Schedule | Concurrency | Timeout | Purpose |
|----------|----------|-------------|---------|---------|
| `cron.scheduled-scans` | `*/30 * * * *` (every 30 min) | 1 | 600s | Fires every 30 minutes. For Business tier: runs priority-query cycles (top 5 queries × 3 engines, Gemini Flash parsing) every 30 min; full scans (all queries × 7 engines, Haiku parsing) every 6 hours. For Pro/Starter: continues hourly polling. Sends `scan/scheduled.start` or `scan/priority.start` events. Net cost for Business: -$15.30/month vs old 4h cadence (Strategy D). |
| `cron.monthly-credits` | `0 0 1 * *` (1st of month midnight) | 1 | 300s | For each active subscriber: compute rollover (20% cap of base), reset `used_amount` to 0, set new `base_allocation` from plan, record transactions. Reset `workflow.runs_this_month` counters. |
| `cron.trial-nudges` | `0 10 * * *` (daily 10AM UTC) | 1 | 120s | Find users where trial_ends_at is 3 days away and no nudge sent. Send Resend email. |
| `cron.weekly-digest` | `0 8 * * 1` (Monday 8AM UTC) | 1 | 300s | For each subscribed user: compile weekly summary (score changes, agent activity, recommendations). Send via Resend. |
| `cron.prompt-volume-aggregation` | `30 3 * * 0` (Sunday 3:30AM UTC) | 1 | 300s | Aggregate week's scan data into `prompt_library` volume estimates and `prompt_volumes` time series. Staggered 30 min after voice-refinement (3:00AM) to avoid concurrent load. |
| `cron.cleanup` | `0 4 * * *` (daily 4AM UTC) | 1 | 120s | Delete free_scans older than 14 days where `converted_user_id IS NULL`. Delete notifications older than 90 days. Purge expired API keys. Release stuck credit holds older than 2 hours. Delete `exploration_cache` rows where `expires_at < NOW()`. |
| `cron.crawler-feed-sync` | `0 3 * * *` (daily 3AM UTC) | 10 | 90s | For each business with active Cloudflare integration: call Cloudflare Analytics GraphQL API, filter AI bot user-agents, aggregate by (bot_name, page_path), upsert into `crawler_detections`. Optional Haiku narrative summary for Pro+ businesses with >20 events. Runs in parallel batches of 10. |
| `cron.query-recluster` | `0 4 * * 0` (Sunday 4AM UTC) | 5 | 300s | Re-classify `tracked_queries` rows where `cluster_confidence < 0.7` AND `cluster_overridden = false`. Uses Haiku classification. Processes up to 500 queries per run in batches of 100. Skips user-overridden clusters. |
| `cron.gsc-sync` | `0 2 * * 0` (Sunday 2AM UTC) | 5 | 300s | For each business with active GSC integration: pull last 7 days of query data from Google Search Console API, upsert into `gsc_data`, refresh `prompt_volumes` confidence scores for matched queries. Handles token refresh on `invalid_grant`. Immediate sync also triggered by `gsc/connected` event on OAuth completion. |
| `cron.priority-score-update` | `0 1 * * *` (daily 1AM UTC) | 5 | 120s | Recompute `priority_score` for all tracked_queries: `(normalized_volume_rank × 0.6) + (volatility_score × 0.4)`. Sets `is_priority = true` for top 5 per business. No LLM calls — pure SQL computation. Business tier only. |

### 4.3 Event Flow

```
User triggers scan → API sends "scan/free.start" event
                  → Inngest picks up event
                  → Runs scan.free.run function
                  → On completion: sends "alert/evaluate" event
                  → Inngest picks up alert event
                  → Runs alert.evaluate function

User triggers agent → API sends "agent/execute" event
                   → Inngest picks up event
                   → Runs agent.execute function
                   → On completion: may send "alert/evaluate" event

Cron fires hourly → cron.scheduled-scans runs
                  → Sends N "scan/scheduled.start" events (one per business)
                  → Each scan runs independently
                  → Each scan completion sends "alert/evaluate"
                  → Each scan may trigger "workflow/execute" if conditions match

Workflow trigger → API sends "workflow/execute" event
               → Inngest picks up event
               → Runs workflow.execute function
               → For each step: sends "agent/execute" event + waits
               → On completion: sends summary notification
```

### 4.4 Failure Handling

| Failure Mode | Response |
|-------------|----------|
| LLM API timeout | Inngest retries the specific step (1 retry). If still fails: partial results returned (allSettled). |
| LLM API rate limit (429) | Exponential backoff built into engine adapter. Inngest step retry provides second attempt. |
| Supabase write error | Inngest retries step. Credit hold remains until explicit release. |
| Inngest function timeout | Function marked failed. Credit holds are released by a daily cleanup cron that finds held credits older than 1 hour. |
| Paddle webhook fails | Paddle retries with exponential backoff. Webhook handler is idempotent (upsert based on subscription_id). |
| User cancels agent mid-execution | DELETE endpoint marks job as cancelled. Inngest cancellation API stops function. Credit hold released. |

---

## 5. External Service Integration Map

### 5.1 Supabase

**What it provides:** PostgreSQL database, Row Level Security, Authentication (email/password, OAuth), Realtime subscriptions (WebSocket), File Storage (logos, exports), Edge Functions (not used — we use Vercel).

**Connection method:** Three client types:
1. Browser client (anon key) — used in Client Components. All queries go through RLS.
2. Server client (anon key + cookies) — used in Server Components and API routes. Authenticates via session cookie, queries through RLS.
3. Service client (service_role key) — used in Inngest functions and webhook handlers only. Bypasses RLS. Never exposed to client.

**Data flow:** Bidirectional. Client reads via RLS. Background jobs write via service role. Realtime pushes changes back to client via WebSocket subscriptions.

**Failure modes:** Connection pool exhaustion (mitigation: pgBouncer, connection limits in Inngest concurrency settings). Region outage (mitigation: none in Phase 1 — single region. Phase 3: read replicas). Slow queries (mitigation: indexes, EXPLAIN ANALYZE, materialized views for dashboards at scale).

**Rate limits:** 500 connections per project (free tier), 1500 (Pro). Inngest concurrency settings keep total background connections under 50.

### 5.2 LLM Providers

#### OpenAI (ChatGPT + GPT-4o)

**What it provides:** Scan engine queries (ChatGPT-like responses), QA scoring (GPT-4o for quality gate), response parsing assistance.

**Connection:** REST API via `openai` SDK. API key in env vars.

**Data flow:** Outbound only. We send prompts, receive completions. No data stored on OpenAI's side (API usage, not fine-tuning).

**Rate limits:** 500 RPM (Tier 2), 10K TPM. Managed by engine adapter rate limiter.

**Failure modes:** 429 (rate limited) — exponential backoff. 500/503 (server error) — retry once via Inngest step. Budget exceeded — daily budget tracking per engine, circuit breaker stops calls when dailyBudgetUsd reached.

**Cost tracking:** Each call records `tokens_used` in `scan_engine_results`. Daily aggregation for budget monitoring.

#### Anthropic (Claude)

**What it provides:** Scan engine queries (Claude responses), content generation (Sonnet for all writing steps), response parsing (Haiku for fast classification), brand narrative analysis.

**Connection:** REST API via `@anthropic-ai/sdk`. API key in env vars.

**Rate limits:** 200 RPM. Haiku: higher throughput, cheaper — used for parsing.

**Failure modes:** Same pattern as OpenAI. Additionally: Anthropic has stricter content policies — some prompts may receive refusals. These are treated as "not mentioned" in scan results, not as errors.

#### Google AI (Gemini)

**What it provides:** Scan engine queries. Cheapest engine — used for high-volume scanning.

**Connection:** REST API via `@google/generative-ai`. API key in env vars.

**Rate limits:** 500 RPM (gemini-2.0-flash). Highest throughput of all engines.

#### Perplexity

**What it provides:** Scan engine queries (with native citation URLs), agent research step (real-time web data).

**Connection:** REST API (OpenAI-compatible endpoint). API key in env vars.

**Rate limits:** 40 RPM. Lowest throughput — most rate-limited engine. Concurrency capped at 5.

**Unique value:** Only engine that returns structured citations natively. These feed directly into `citation_sources`.

#### xAI (Grok)

**What it provides:** Scan engine queries. Pro+ tier only.

**Connection:** REST API. API key in env vars.

**Rate limits:** 50 RPM. Newer API, less stable. Higher error rate expected.

#### DeepSeek

**What it provides:** Scan engine queries. Cheapest per-token cost.

**Connection:** REST API (OpenAI-compatible). API key in env vars.

**Rate limits:** 50 RPM.

### 5.3 Paddle

**What it provides:** Subscription billing, checkout, customer portal, webhook events.

**Connection:** Server-side SDK + client-side Paddle.js for checkout overlay.

**Data flow:** Bidirectional. We create checkout sessions (outbound). Paddle sends webhook events (inbound) for subscription lifecycle changes.

**Failure modes:** Webhook delivery failure — Paddle retries with exponential backoff. Our handler is idempotent. Checkout failure — client-side error handling with retry guidance.

**Rate limits:** Not a concern — low volume.

### 5.4 Resend

**What it provides:** Transactional email delivery (15 templates), digest emails.

**Connection:** REST API via `resend` SDK. API key in env vars.

**Data flow:** Outbound only. React Email templates rendered server-side, sent via Resend API.

**Failure modes:** 429 (rate limited) — queue and retry. Bounce — logged, no automatic action.

**Rate limits:** 100 emails/day (free tier), unlimited (Pro). Batch sending for digests.

### 5.5 WordPress API

**What it provides:** Content publishing from Beamix content library to user's WordPress site.

**Connection:** WordPress REST API (`/wp-json/wp/v2/posts`). Authenticated via Application Passwords stored encrypted in `integrations.credentials`.

**Data flow:** Outbound. We POST content, WordPress confirms creation.

**Failure modes:** 401 (expired credentials) — mark integration status as 'error', notify user. 403 (insufficient permissions) — same. Timeout — retry once.

### 5.6 Google Analytics 4 (GA4) API

**What it provides:** AI traffic attribution. Identifies visitors from AI referral domains (chatgpt.com, perplexity.ai, claude.ai, etc.).

**Connection:** OAuth2 flow. Refresh token stored encrypted in `integrations.credentials`. Data API v1 for reporting.

**Data flow:** Inbound. Daily Inngest cron fetches GA4 reporting data filtered by AI referral domains.

**Failure modes:** Token expired — refresh via OAuth. Refresh fails — mark integration as 'expired', notify user.

### 5.7 Google Search Console (GSC) API (NEW)

**What it provides:** Traditional search data — keyword rankings, click-through rates, indexed pages. This data feeds back into the scan engine for smarter prompt generation ("what keywords does this business already rank for in traditional search?") and provides a bridge between traditional SEO and GEO visibility.

**Connection:** OAuth2 flow (same Google OAuth consent as GA4 — can request both scopes simultaneously). Refresh token stored encrypted.

**Data flow:** Inbound. Weekly Inngest cron fetches top queries, pages, and indexing data.

**Failure modes:** Same as GA4 — token refresh flow, expiration handling.

**Why this matters competitively:** 3 competitors (AthenaHQ, Gauge, Goodie) already integrate GSC. Traditional search rankings are a leading indicator of AI search visibility — businesses that rank well in Google tend to be cited more by AI engines because LLMs train on indexed web content.

### 5.8 Slack API

**What it provides:** Alert delivery to Slack channels.

**Connection:** Phase 1: Incoming Webhooks (user pastes webhook URL). Phase 2: Full Slack app with OAuth for richer formatting and channel selection.

**Data flow:** Outbound. We POST Block Kit formatted messages to webhook URL.

**Failure modes:** 404 (webhook deleted) — mark integration as 'error'. Timeout — retry once.

### 5.9 Cloudflare

**What it provides:** AI crawler detection data. Which AI bots visit the user's site, which pages they access.

**Connection:** Cloudflare Analytics API via API token stored in integrations.

**Data flow:** Inbound. Periodic Inngest job fetches bot analytics data filtered by known AI bot user agents.

### 5.10 Browserbase

**What it provides:** Managed Playwright browser sessions for scanning AI engines that have no public API — Bing Copilot, Google AI Overviews, Google AI Mode.

**Why not Vercel serverless:** Vercel's 10-second function timeout kills browser sessions. Browserbase sessions run inside Inngest step functions (5-minute limit) where browser interaction completes reliably.

**Connection:** `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` env vars. Adapter at `src/lib/scan/browserbase-client.ts`. Session concurrency cap: 5 (Browserbase rate limit).

**Cost:** ~$0.10/session. Pro user on weekly scans: 60 sessions/month = $6/user/month. Gated to Pro+.

**Data flow:** Outbound. Inngest scan function opens sessions, submits prompts via DOM interaction, extracts AI response text, closes session. Results flow through the same 5-stage Haiku parsing pipeline as API-based engines. Results stored in `scan_engine_results` with `collection_method = 'browser'`.

---

## 6. Caching Strategy

### 6.1 Three-Layer Cache Architecture

```
Browser (React Query)
    → Vercel Edge (Next.js Cache / CDN)
        → Supabase (PostgreSQL indexes + query planning)
```

No Redis until 10K+ users. The three-layer architecture provides sufficient performance for early-stage traffic patterns.

### 6.2 Client-Side Cache (React Query)

| Data | staleTime | refetchOnWindowFocus | Polling |
|------|-----------|---------------------|---------|
| Dashboard overview | 5 min | Yes | No |
| Rankings table | 10 min | Yes | No |
| Content library | 5 min | Yes | No |
| Agent execution status | 0 (always fresh) | Yes | 3s while running |
| Scan status | 0 | Yes | 3s while processing |
| Prompt volumes | 30 min | No | No |
| Citation sources | 10 min | Yes | No |
| Brand narrative | 10 min | Yes | No |
| User profile/settings | 60 min | Yes | No |
| Plans (reference data) | 24 hours | No | No |

**Invalidation:** On scan completion, all dashboard-related queries are invalidated via `queryClient.invalidateQueries({ queryKey: ['dashboard'] })`. On agent completion, content library queries are invalidated. This is triggered by Supabase Realtime subscription on the `scans` and `agent_jobs` tables.

### 6.3 Server-Side Cache (Next.js / Vercel)

| Route | Cache Strategy | Duration | Revalidation |
|-------|---------------|----------|--------------|
| `/api/dashboard/overview` | `s-maxage=300, stale-while-revalidate=600` | 5 min | On scan complete (tag-based) |
| `/api/dashboard/rankings` | `s-maxage=600` | 10 min | On scan complete |
| `/api/analytics/prompt-volumes` | `s-maxage=3600` | 1 hour | Weekly (cron updates) |
| `/api/v1/*` (public API) | `s-maxage=60` | 1 min | On data change |
| Blog posts | ISR `revalidate=3600` | 1 hour | On publish |
| Landing page | Static (build time) | Until redeploy | On content change |

### 6.4 Database-Level Optimization

Instead of a cache layer, optimize the source:

**Indexes** — Covering indexes on all frequently queried columns (detailed per table in Section 2).

**Materialized Views** (Phase 3, 10K+ users) — For expensive aggregation queries:
- `mv_business_visibility_trends` — pre-computed daily score aggregation per business
- `mv_competitor_share_of_voice` — pre-computed share of voice percentages
- `mv_prompt_volume_summary` — pre-computed prompt volume rankings by industry

**Connection Pooling** — pgBouncer in transaction mode (Supabase provides this on Pro plans). Limits total database connections to prevent exhaustion from Inngest parallel functions.

### 6.5 Cache Warming

On scan completion (the most impactful data-changing event), the scan pipeline's final step issues a fetch to the dashboard overview endpoint, warming the server-side cache immediately. This means the user navigating to the dashboard after receiving a "scan complete" notification always hits warm cache.

---

## 7. Security Architecture

### 7.1 Authentication Flow

Beamix uses Supabase Auth with email/password and OAuth (Google) providers.

```
1. User submits login form
2. Supabase Auth validates credentials, issues JWT + refresh token
3. Tokens stored in httpOnly cookies (server-side cookie management)
4. Every request: middleware extracts session from cookies via createServerClient
5. If session expired: Supabase SDK auto-refreshes using refresh token
6. If refresh fails: redirect to /login
```

**Session management:**
- Access token: 1 hour TTL
- Refresh token: 30 day TTL
- Cookies: httpOnly, Secure, SameSite=Lax
- No localStorage token storage (prevents XSS token theft)

### 7.2 Authorization (RLS Matrix)

Every table has RLS enabled. This is the core authorization mechanism — even if application code has a bug, the database enforces access control.

**Policy patterns used:**

1. **Own data:** `auth.uid() = user_id` — user can only access their own rows
2. **Own via join:** `business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())` — for tables that don't have a direct user_id FK
3. **Public read:** `true` — anyone can read (plans, published blog posts)
4. **Service write:** No RLS policy for INSERT/UPDATE — only service role key (which bypasses RLS) can write. This ensures all writes go through validated business logic.

Full RLS matrix (abbreviated — all 32 tables are covered):

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_profiles | own | service (trigger) | own | cascade |
| businesses | own | own | own | own |
| subscriptions | own | service | service | cascade |
| credit_pools | own | service | service | cascade |
| credit_transactions | own | service | — | — |
| free_scans | no RLS | no RLS | no RLS | no RLS |
| scans | own | service | service | — |
| scan_engine_results | own (via join) | service | — | cascade |
| citation_sources | own (via join) | service | service | cascade |
| agent_jobs | own | service | service | — |
| agent_job_steps | own (via join) | service | service | cascade |
| content_items | own | service | own (partial) | own |
| content_versions | own (via join) | service | — | cascade |
| content_performance | own (via join) | service | — | cascade |
| content_voice_profiles | own | own | own | own |
| competitors | own | own | own | own |
| competitor_scans | own (via join) | service | — | cascade |
| recommendations | own | service | own (status) | — |
| tracked_queries | own | own | own | own |
| prompt_library | all authenticated | service | service | — |
| prompt_volumes | all authenticated | service | — | — |
| agent_workflows | own | own | own | own |
| workflow_runs | own | service | service | cascade |
| personas | own | own | own | own |
| brand_narratives | own (via join) | service | — | cascade |
| alert_rules | own | own | own | own |
| notifications | own | service | own (is_read) | — |
| notification_preferences | own | service (trigger) | own | cascade |
| integrations | own | own | own | own |
| api_keys | own | own | — | own |
| plans | all | service | service | — |
| blog_posts | public (published) | service | service | — |
| ga4_metrics | own (via join) | service | — | cascade |
| gsc_data | own (via join) | service | — | cascade |
| competitor_share_of_voice | own (via join) | service | — | cascade |
| crawler_detections | own (via join) | service | — | cascade |
| ai_readiness_history | own (via join) | service | — | cascade |

### 7.3 API Key Management

Public API keys (Business tier) follow security best practices:

1. **Generation:** Cryptographically random 32-byte key, prefixed with `bmx_` for identification.
2. **Storage:** Only the SHA-256 hash is stored in `api_keys.key_hash`. The plaintext key is shown to the user exactly once at creation and never stored.
3. **Lookup:** On each API request, the provided key is hashed and looked up via the index on `key_hash`.
4. **Scopes:** Each key has an array of scopes (`read`, `write`, `execute`). Routes check scope before processing.
5. **Rotation:** Users can create new keys and delete old ones. No key modification.
6. **Expiration:** Optional `expires_at`. Checked on every request.

### 7.4 Credential Encryption for Integrations

Integration credentials (WordPress passwords, OAuth tokens, Slack webhooks) are encrypted at the application layer before storage in Supabase.

**Algorithm:** AES-256-GCM (authenticated encryption — provides both confidentiality and integrity)
**Key management:** `CREDENTIALS_ENCRYPTION_KEY` env var (32 bytes hex). Stored in Vercel environment variables only.
**Format:** `iv:authTag:ciphertext` (hex encoded). IV is random per encryption.
**Access:** Only the application server can decrypt. Supabase stores encrypted blobs — even database administrators cannot read credentials.

### 7.5 Rate Limiting Strategy

All rate limiting uses **Upstash Redis** via `@upstash/ratelimit` with the **sliding window** algorithm. In-memory counters are not used — they do not work on Vercel serverless (each function invocation gets a fresh memory space). Rate limiting is handled entirely by Upstash Redis — no database table is needed for rate limit counters.

**Environment variables:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

| Route | Limit | Scope | Method |
|-------|-------|-------|--------|
| POST /api/scan/start (no auth) | 3 per 24h | Per IP | Upstash sliding window |
| POST /api/scan/start (auth, free) | 1 per 24h | Per user | Upstash sliding window |
| POST /api/scan/manual | Tier-based (1/week, 1/day, 1/hour) | Per user | Upstash sliding window |
| POST /api/agents/*/execute | 10 per hour | Per user | Upstash sliding window |
| POST /api/agents/chat | 30 per hour | Per user | Upstash sliding window |
| GET /api/dashboard/* | 60 per minute | Per user | Upstash sliding window |
| POST /api/billing/portal | 10 per hour | Per user | Upstash sliding window |
| POST /api/billing/webhooks | 100 per minute | Per IP | Upstash sliding window |
| /api/v1/* | 100 per minute | Per API key | Upstash sliding window (key: `api:{key_prefix}`) |
| All other routes | 30 per minute | Per user | Upstash sliding window |

**Response on limit exceeded:** 429 with `Retry-After` header (seconds until window resets).

**Implementation pattern:**
```
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Example: agent chat limiter
const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  prefix: "ratelimit:agents:chat",
});

// In route handler:
const { success, reset } = await chatLimiter.limit(userId);
if (!success) {
  return Response.json({ error: "Rate limit exceeded" }, {
    status: 429,
    headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) },
  });
}
```

### 7.6 GDPR Compliance

| Requirement | Implementation |
|------------|----------------|
| Right to access | `/api/settings/export` — generates full data export (JSON) for user |
| Right to erasure | Account deletion cascades through all tables (ON DELETE CASCADE). Service deletes Paddle customer, Resend contact. |
| Data minimization | Free scans: 14-day retention. Notifications: 90-day retention. IP addresses: stored only in free_scans, deleted with scan. |
| Consent | Cookie consent banner. Email opt-in (notification_preferences). |
| Data portability | Export as JSON includes: profile, businesses, scans, content, recommendations |
| Breach notification | Sentry monitoring + Supabase audit logs. Notification process documented. |

### 7.7 Additional Security Measures

**CSRF Protection:** Supabase Auth uses httpOnly cookies + SameSite=Lax. API routes verify session origin.

**Input Sanitization:** All user input is Zod-validated. Markdown content is sanitized before rendering (DOMPurify for client-side rendering, no dangerouslySetInnerHTML with raw user input).

**Dependency Security:** Dependabot enabled. No unnecessary packages. Lockfile integrity verification in CI.

**Secrets Management:** All secrets in Vercel environment variables. No secrets in code, .env files committed, or client-side bundles. NEXT_PUBLIC_ prefix used only for Supabase anon key (safe — RLS enforces access control).

---

## 8. Data Flow Diagrams

### 8.1 Full Scan Cycle

This is the most important data flow in the system — it touches scan, citation, narrative, content performance, recommendation, alert, and workflow subsystems.

```
TRIGGER
  │
  ├─ Free scan: User submits form on /scan → POST /api/scan/start → Inngest "scan/free.start"
  ├─ Scheduled: Cron every hour → finds due businesses (next_scan_at <= NOW()) → Inngest "scan/scheduled.start" per business
  └─ Manual: User clicks "Run Scan" → POST /api/scan/manual → Inngest "scan/manual.start"
  │
  ▼
STEP 1: CONTEXT ASSEMBLY
  │ Load business details, tracked queries, competitors, subscription tier
  │ Determine engine list by tier: Free=4, Starter=4, Pro=8, Business=10+
  │ Generate prompts: Free=3, Scheduled=5 per tracked query, Manual=same as scheduled
  │
  ▼
STEP 2: ENGINE QUERY FAN-OUT
  │
  │  ┌─ ChatGPT (OpenAI API) ──────────┐
  │  ├─ Claude (Anthropic API) ─────────┤
  │  ├─ Gemini (Google AI API) ─────────┤  Promise.allSettled
  │  ├─ Perplexity (Perplexity API) ────┤  (partial results OK)
  │  ├─ Grok (xAI API) [Pro+] ─────────┤
  │  ├─ DeepSeek (DeepSeek API) [Pro+] ─┤
  │  └─ (Future engines) [Business] ───┘
  │
  │  Parallel: Website crawl (cheerio) for AI readiness scoring
  │
  ▼
STEP 3: RESPONSE PARSING (per engine response)
  │ Send raw response + business name to Claude Haiku:
  │ → Is business mentioned? (fuzzy: exact, domain, normalized, Hebrew transliteration)
  │ → Position extraction (ordinal rank: 1st, 2nd, etc.)
  │ → Sentiment scoring (0-100 numeric, not enum)
  │ → Citation URL extraction (array of {url, title, domain})
  │ → Competitor name extraction
  │ → Context window (2-3 sentences around mention)
  │
  ▼
STEP 4: SCORE COMPUTATION
  │ Per-engine score: mention (40pts) + position bonus (5-30pts) + sentiment bonus (0-30pts) = 0-100
  │ Overall score: weighted average across engines
  │ AI readiness score: 5 categories from website crawl
  │ Competitor scores: same computation for each tracked competitor
  │
  ▼
STEP 5: STORAGE
  │ INSERT scans row (overall_score, engines_queried, status=completed)
  │ BATCH INSERT scan_engine_results (one per engine per prompt)
  │ UPSERT citation_sources (aggregate URLs across this and previous scans)
  │ INSERT brand_narratives (LLM analysis of mention contexts)
  │
  ▼
STEP 6: POST-SCAN ANALYSIS
  │
  │  ┌─ Content Performance ──────────────────────────────────────────┐
  │  │  For each published content_item for this business:            │
  │  │  Compute visibility delta since publication                    │
  │  │  INSERT content_performance row                                │
  │  └────────────────────────────────────────────────────────────────┘
  │
  │  ┌─ Recommendations ──────────────────────────────────────────────┐
  │  │  Send scan results + business context to Claude Sonnet         │
  │  │  Generate 5-8 prioritized action items                         │
  │  │  INSERT recommendations rows                                   │
  │  └────────────────────────────────────────────────────────────────┘
  │
  │  ┌─ Prompt Volume Aggregation ────────────────────────────────────┐
  │  │  For each prompt used: upsert prompt_library volume estimate   │
  │  └────────────────────────────────────────────────────────────────┘
  │
  ▼
STEP 7: ALERT EVALUATION
  │ Load active alert_rules for this business
  │ Compare current scan vs previous: visibility drop? competitor overtake? sentiment shift?
  │ Check deduplication: was this alert triggered within cooldown_hours?
  │ For triggered alerts: route to configured channels (in-app, email, Slack)
  │
  ▼
STEP 8: WORKFLOW EVALUATION
  │ Load active agent_workflows for this business
  │ Check trigger conditions: visibility_drop threshold, competitor_overtake, scan_complete
  │ If triggered: send "workflow/execute" event (starts agent chain)
  │
  ▼
STEP 9: SCHEDULE UPDATE
  │ SET businesses.last_scanned_at = NOW()
  │ SET businesses.next_scan_at = NOW() + scan_frequency_days (from plan)
  │
  ▼
STEP 10: CACHE WARM
  │ Fetch dashboard overview endpoint to warm server cache
  │ Supabase Realtime broadcasts scan completion to connected clients
  │ React Query in browser receives Realtime event, invalidates stale queries
```

### 8.2 Agent Execution Cycle

```
TRIGGER
  │ User clicks "Run Agent" in Agent Hub → POST /api/agents/[type]/execute
  │
  ▼
PRE-FLIGHT (in API route, synchronous)
  │ Zod validate input (agent-specific schema)
  │ Verify subscription tier allows this agent
  │ Check credit_pools: available credits >= 1
  │ Place credit HOLD via hold_credits RPC
  │   → credit_pools.held_amount += 1
  │   → INSERT credit_transactions (type='hold')
  │ INSERT agent_jobs (status='pending')
  │ INSERT agent_job_steps (5 steps, all status='pending')
  │ Send Inngest event "agent/execute"
  │ Return 202 { job_id }
  │
  ▼
STEP 1: CONTEXT ASSEMBLY (Inngest step: "assemble-context")
  │ UPDATE agent_job_steps step 1 → 'running'
  │ Load in parallel:
  │   → Business details (name, industry, services, location)
  │   → Last 3 scan results with engine breakdowns
  │   → Last 10 content items (avoid duplication)
  │   → Tracked competitors
  │   → Active recommendations (status != dismissed)
  │   → Content voice profile (if set for this business)
  │ UPDATE agent_job_steps step 1 → 'completed'
  │
  ▼
STEP 2: RESEARCH (Inngest step: "research")
  │ UPDATE agent_job_steps step 2 → 'running'
  │ Agent-specific:
  │   Content Writer / Blog Writer → Perplexity sonar-pro (real-time web data)
  │   Schema Optimizer → cheerio page fetch + existing schema detection
  │   FAQ Agent → Extract questions from scan response contexts
  │   Competitor Intel → Multi-engine scan for competitor
  │   Review Analyzer → Perplexity search for recent reviews
  │ UPDATE agent_job_steps step 2 → 'completed'
  │
  ▼
STEP 3: OUTLINE (Inngest step: "outline")
  │ UPDATE agent_job_steps step 3 → 'running'
  │ Claude Sonnet: Generate content structure from research + business context
  │ If voice profile exists: include voice description + example excerpts in prompt
  │ UPDATE agent_job_steps step 3 → 'completed'
  │
  ▼
STEP 4: WRITE (Inngest step: "write")
  │ UPDATE agent_job_steps step 4 → 'running'
  │ Claude Sonnet: Generate full output from outline + research
  │ Content-type-specific templates applied (comparison, ranked_list, etc.)
  │ UPDATE agent_job_steps step 4 → 'completed'
  │
  ▼
STEP 5: QUALITY GATE (Inngest step: "qa")
  │ UPDATE agent_job_steps step 5 → 'running'
  │ GPT-4o: Score 0.00-1.00 on: accuracy, relevance, completeness, GEO optimization
  │
  │ IF qa_score >= 0.70:
  │   → Confirm credit hold via confirm_credit_hold RPC
  │     → credit_pools.used_amount += 1, held_amount -= 1
  │     → INSERT credit_transactions (type='confirm')
  │   → UPDATE agent_jobs (status='completed', qa_score, output_data)
  │   → If content-producing agent: INSERT content_items (status='draft')
  │   → Send notification (in-app)
  │   → UPDATE agent_job_steps step 5 → 'completed'
  │
  │ IF qa_score < 0.70 (first attempt):
  │   → Retry STEP 4 (write) with adjusted parameters (higher temperature, different angle)
  │   → Re-run QA
  │
  │ IF qa_score < 0.70 (second attempt):
  │   → Release credit hold via release_credit_hold RPC
  │     → credit_pools.held_amount -= 1
  │     → INSERT credit_transactions (type='release')
  │   → UPDATE agent_jobs (status='failed', error_message="Quality below threshold")
  │   → Send notification (in-app: "Agent could not produce quality output")
  │   → UPDATE agent_job_steps step 5 → 'failed'
```

### 8.3 Content Publish Flow

```
CONTENT CREATION (via agent pipeline)
  │ Agent completes → INSERT content_items (status='draft')
  │
  ▼
USER REVIEW
  │ User views content in Content Library
  │ User edits inline (Markdown textarea)
  │   → On save: INSERT content_versions (version N+1, edited_by='user')
  │   → UPDATE content_items.content_body
  │ User can:
  │   → Change status to 'in_review' (editorial queue)
  │   → Change status to 'approved'
  │   → Copy to clipboard / Download as HTML or Markdown
  │
  ▼
PUBLISH TO CMS (optional)
  │ User clicks "Publish to WordPress"
  │ POST /api/content/[id]/publish
  │
  │ Process:
  │   → Lookup integration for business + wordpress
  │   → Decrypt credentials (AES-256-GCM)
  │   → Convert Markdown → HTML
  │   → POST /wp-json/wp/v2/posts { title, content, status: 'draft' }
  │   → WordPress returns post URL
  │   → UPDATE content_items: published_url, published_at, status='published'
  │
  ▼
PERFORMANCE TRACKING BEGINS
  │ At publication: Snapshot current visibility metrics as baseline
  │   → Store: visibility_score_before, mention_count_before, avg_position_before
  │
  │ On each subsequent scan (days/weeks later):
  │   → content_performance pipeline checks all published content for this business
  │   → Computes delta: current metrics - baseline metrics
  │   → INSERT content_performance row
  │
  │ Dashboard shows: "This blog post improved your ChatGPT visibility from position 0 to position 2"
```

### 8.4 Alert Cycle

```
TRIGGER EVENT
  │ Scan completion: "alert/evaluate" Inngest event with scan context
  │ Agent completion: "alert/evaluate" Inngest event with job context
  │ Credit change: "alert/evaluate" Inngest event with credit context
  │ Content performance change: detected during scan post-processing
  │
  ▼
RULE EVALUATION
  │ Load all active alert_rules for the business
  │ For each rule:
  │   │
  │   ├─ visibility_drop: current_score < previous_score * (1 - threshold/100)
  │   ├─ visibility_improvement: current_score > previous_score * (1 + threshold/100)
  │   ├─ new_competitor: competitor in engine results NOT in competitors table
  │   ├─ competitor_overtake: a competitor's avg rank_position surpasses the business's
  │   │    avg rank_position for the same query set over 2 consecutive scans.
  │   │    Data source: scan_engine_results joined on scan_id for current + previous scan.
  │   │    Fires once per competitor per overtake event (not on every scan where they lead).
  │   ├─ sentiment_shift: dominant sentiment changed (positive→negative or vice versa)
  │   ├─ credit_low: available_credits / base_allocation < threshold_percent
  │   ├─ content_performance: fires when a content_item's visibility_score_after drops
  │   │    >20% vs the 30-day rolling average of its content_performance rows.
  │   │    Data source: content_performance table for the specific content_item.
  │   ├─ scan_complete: fires after every scan completion for the business. No threshold.
  │   │    Useful for "notify me after every scan" rules. Always triggers if rule is active.
  │   ├─ agent_complete: fires after every agent_jobs completion for the user.
  │   │    Includes job summary (agent_type, status, qa_score) in notification body.
  │   └─ trial_ending: fires when subscriptions.trial_ends_at - NOW() <= threshold.days.
  │        Evaluated by cron.trial-nudges (not by scan-triggered alert.evaluate).
  │        Cross-referenced here for completeness — actual delivery is via cron.
  │
  ▼
DEDUPLICATION
  │ For each triggered rule:
  │   → Generate deduplication key: {rule_id}:{date}:{specific_context}
  │   → Check: last_triggered_at + cooldown_hours > NOW()?
  │   → If within cooldown: skip (no duplicate alert)
  │   → If outside cooldown: proceed
  │
  ▼
CHANNEL ROUTING
  │ For each non-duplicate alert:
  │   → Check notification_preferences
  │   → Check quiet hours (if configured)
  │
  │   IN-APP:
  │     → INSERT notifications row
  │     → Supabase Realtime broadcasts to connected client
  │     → Client shows toast / updates bell icon
  │
  │   EMAIL:
  │     → Select Resend template by alert type
  │     → Render React Email template with alert data
  │     → Send via Resend API
  │     → (Respects email_digest setting: realtime, daily, weekly)
  │
  │   SLACK:
  │     → Format Block Kit message with alert data
  │     → POST to slack_webhook_url from notification_preferences
  │
  │ UPDATE alert_rules.last_triggered_at = NOW()
```

### 8.5 Workflow Chain Execution (NEW)

```
TRIGGER
  │
  ├─ Scan-triggered: Scan post-processing detects matching workflow trigger condition
  │    e.g., visibility_drop with threshold matched
  ├─ Schedule-triggered: Cron evaluates workflow schedules
  └─ Manual: User clicks "Run Workflow" → POST /api/workflows/[id]/run
  │
  ▼
VALIDATION
  │ Check workflow is_active
  │ Check runs_this_month < max_runs_per_month
  │ Estimate total credits needed (sum of agent steps)
  │ Check credit_pools has sufficient available credits
  │ INSERT workflow_runs (status='running')
  │
  ▼
STEP EXECUTION (sequential, orchestrated by Inngest)
  │
  │ FOR EACH step in workflow.steps:
  │   │
  │   ├─ EVALUATE CONDITION
  │   │    If step has a condition (e.g., "previous_step.score < 60"):
  │   │      → Evaluate against previous step's output
  │   │      → If false: mark step as 'skipped', continue to next
  │   │
  │   ├─ EXECUTE AGENT
  │   │    → Place credit hold for 1 credit
  │   │    → INSERT agent_jobs for this step's agent_type
  │   │    → Send "agent/execute" Inngest event
  │   │    → WAIT for completion (Inngest waitForEvent on "agent/complete" filtered by job_id)
  │   │    → Collect output for condition evaluation in subsequent steps
  │   │
  │   └─ HANDLE FAILURE
  │        → If agent fails and on_failure='skip': mark step skipped, continue
  │        → If agent fails and on_failure='abort': mark run as 'failed', release remaining holds
  │
  ▼
FINALIZE
  │ UPDATE workflow_runs: status, steps_completed, credits_used, results_summary
  │ INCREMENT agent_workflows.runs_this_month
  │ Send notification: "Workflow '{name}' completed — {steps_completed}/{steps_total} steps succeeded, {credits_used} credits used"
```

### 8.6 Multi-Region Scanning Concept (Future)

The gap analysis identified that competitors (Goodie, Peec, Profound, Rank Prompt) support multi-region scanning. While not implemented in Phase 1, the architecture supports it through the following design:

**Approach:** Geographic proxy services (not self-hosted VPNs). When a business configures scan regions (e.g., US-East, IL, UK), the scan pipeline routes engine queries through proxy endpoints that provide geographic IP addresses. AI engines serve location-influenced responses based on the apparent geography of the requester.

**Data model impact:** `scans` table gets an optional `scan_region` column. `scan_engine_results` gets an optional `region` column. Dashboard queries group by region when multi-region is active.

**Why deferred:** Single-region (Vercel US-East) is sufficient for the Israeli SMB primary market. Multi-region adds cost (proxy services) and complexity (region-aware scheduling, region-segmented dashboards). Implement when expanding globally.

---

> **This document defines every table, every API route, every background job, every external integration, every cache rule, and every security policy in the Beamix system. It is the single source of truth for system architecture. When in doubt about how something connects, this document has the answer.**
