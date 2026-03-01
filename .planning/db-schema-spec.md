# Beamix — Database Schema Spec
**Version:** 1.0
**Date:** 2026-02-28
**Status:** Draft — Source of Truth for DB + Backend

> This document supersedes all scattered SQL snippets in other specs.
> Every table, relation, and policy is defined here.
> The existing code (types/index.ts, API routes) references an older schema built around n8n and single-business-per-user — that schema is deprecated. Build against this document.

---

## A. Business Note — Usage Perception Strategy

לפני ה-schema, הנקודה שאדם העלה: **"לגרום ללקוחות לחשוב שיש להם הרבה שימושים."**

הגישה הנכונה היא **credit splitting** — במקום "5 agent uses", המשתמש רואה:

```
Content Credits:  12 / 30  ████████░░░░░░░░
Scan Credits:      3 / 4   ████████████░░░░
```

למה זה עובד:
- כל "agent use" מצריך 1 credit — אבל internally זה יכול להיות 3–8 LLM calls
- המשתמש לא רואה LLM calls, רק "uses"
- Split לסוגים → כל pool נראה "מלא" יותר מ-pool אחד גדול
- Rollover של 20% → תמיד יש "bonus" credits מוצגים בצבע שונה
- Top-up uses מוצגים נפרד ("+5 bonus") — תחושת שפע

**Schema מיישם זאת:** `credit_pools` table עם `pool_type` (content / scan / report).

---

## B. Relations Diagram

```
auth.users (Supabase managed)
    │
    └── user_profiles (1:1)
            │
            ├── businesses (1:N — per user)
            │       │
            │       ├── scans (1:N — per business)
            │       │       │
            │       │       ├── scan_queries (1:N — queries used per scan)
            │       │       ├── scan_engine_results (1:N — per engine per scan)
            │       │       ├── scan_engine_responses (1:N — truncated LLM text)
            │       │       └── scan_mentions (1:N — per engine: mention count + position)
            │       │
            │       ├── competitors (1:N — per business)
            │       │       │
            │       │       ├── competitor_scan_results (1:N — their rank in our scans)
            │       │       └── competitor_content_snapshots (1:N — their digital content)
            │       │
            │       └── tracked_queries (1:N — specific queries to track per business)
            │
            ├── subscriptions (1:1 — per user, not per business)
            │       │
            │       └── credit_pools (1:N — content / scan / report pools)
            │
            ├── agent_jobs (1:N — per user)
            │       │
            │       └── content_items (1:1 — output of each agent job)
            │
            └── free_scans (1:N — landing page scans, pre-signup)
                    │
                    └── (converted_to → scans.id after signup)
```

---

## C. Schema — Core Identity

---

### Table: `user_profiles`

Extends `auth.users`. One row per user.

```sql
CREATE TABLE public.user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    avatar_url      TEXT,
    timezone        TEXT NOT NULL DEFAULT 'UTC',
    interface_lang  TEXT NOT NULL DEFAULT 'en',    -- 'en' | 'he'
    content_lang    TEXT NOT NULL DEFAULT 'en',    -- 'en' | 'he' | 'both'
    onboarding_completed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
-- PK index is implicit.
-- No additional indexes needed — always looked up by id.
```

**RLS:**
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles: own row only"
    ON public.user_profiles
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
```

**Notes:**
- `handle_new_user()` trigger (created separately in Supabase) inserts a row here after `auth.users` insert.
- `onboarding_completed_at` is NULL until user completes the onboarding flow. The middleware gates `/dashboard` on this being non-NULL.

---

### Table: `businesses`

One user can have multiple businesses.

```sql
CREATE TABLE public.businesses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    website_url     TEXT NOT NULL,
    industry        TEXT NOT NULL,             -- must match industries constants
    location        TEXT NOT NULL,             -- free text: "Tel Aviv" / "New York"
    description     TEXT,                      -- 500 chars max, agent context
    services        TEXT[],                    -- up to 10 keywords
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    language        TEXT NOT NULL DEFAULT 'he',  -- inferred from location, editable
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT businesses_website_format CHECK (website_url ~* '^https?://')
);
```

**Indexes:**
```sql
CREATE INDEX businesses_user_id_idx ON public.businesses(user_id);
CREATE INDEX businesses_user_primary_idx ON public.businesses(user_id) WHERE is_primary = true;
```

**RLS:**
```sql
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses: own rows only"
    ON public.businesses
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

**Notes:**
- `is_primary = true` marks the "main" business shown by default in the dashboard.
- Only one primary per user — enforced by application logic (not DB constraint) for simplicity. The partial index above speeds up `WHERE is_primary = true` queries.
- `industry` must match the constant list in `src/constants/industries.ts` — validated at the API layer, not DB layer.

---

## D. Schema — Subscriptions & Credits

---

### Table: `subscriptions`

One row per user. Stripe is the source of truth; this table mirrors it.

```sql
CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'cancelled',
    'expired'
);

CREATE TYPE plan_tier AS ENUM (
    'starter',
    'pro',
    'business'
);

CREATE TABLE public.subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_tier               plan_tier,                -- NULL = no paid plan (trial only)
    status                  subscription_status NOT NULL DEFAULT 'trialing',
    stripe_customer_id      TEXT UNIQUE,
    stripe_subscription_id  TEXT UNIQUE,
    stripe_price_id         TEXT,
    billing_interval        TEXT,                      -- 'month' | 'year'
    trial_started_at        TIMESTAMPTZ,               -- set when first scan starts (per founder decision)
    trial_ends_at           TIMESTAMPTZ,               -- trial_started_at + 7 days
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Trial start logic (per founder: trial starts when first scan begins):**
```
-- When free_scans INSERT fires (or scans INSERT for authenticated users):
-- If subscriptions.trial_started_at IS NULL:
--   SET trial_started_at = now()
--   SET trial_ends_at = now() + interval '7 days'
-- This is handled in the API layer (POST /api/scan/start), not a DB trigger.
```

**Indexes:**
```sql
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_stripe_customer_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX subscriptions_stripe_sub_idx ON public.subscriptions(stripe_subscription_id);
```

**RLS:**
```sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: own row only"
    ON public.subscriptions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Service role (webhooks) can bypass RLS — set via Supabase service_role key.
```

---

### Table: `credit_pools`

Split credits by type — creates perception of abundance (see Section A).

```sql
CREATE TYPE credit_pool_type AS ENUM (
    'agent',     -- agent uses (content writer, FAQ agent, etc.)
    'scan',      -- manual scan triggers
    'report'     -- exports (PDF, CSV) — reserved for future
);

CREATE TABLE public.credit_pools (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pool_type           credit_pool_type NOT NULL,
    base_allocation     INTEGER NOT NULL DEFAULT 0,    -- from current plan
    rollover_amount     INTEGER NOT NULL DEFAULT 0,    -- carried from previous period (max 20% of base)
    topup_amount        INTEGER NOT NULL DEFAULT 0,    -- purchased top-ups
    used_amount         INTEGER NOT NULL DEFAULT 0,    -- consumed this period
    period_start        TIMESTAMPTZ NOT NULL,
    period_end          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT credit_pools_unique_period UNIQUE (user_id, pool_type, period_start),
    CONSTRAINT credit_pools_no_negative CHECK (used_amount >= 0),
    CONSTRAINT credit_pools_no_over_use CHECK (used_amount <= base_allocation + rollover_amount + topup_amount)
);
```

**Computed (application layer):**
```
available = base_allocation + rollover_amount + topup_amount - used_amount
```

**Indexes:**
```sql
CREATE INDEX credit_pools_user_id_idx ON public.credit_pools(user_id);
CREATE INDEX credit_pools_active_idx ON public.credit_pools(user_id, pool_type)
    WHERE period_end > now();
```

**RLS:**
```sql
ALTER TABLE public.credit_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_pools: own rows only"
    ON public.credit_pools
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

**Plan allocations (reference — enforced in API layer):**
```
Plan       | agent credits | scan credits | report credits
-----------|---------------|--------------|---------------
starter    |     5         |     4/month  |       0
pro        |    15         |    10/month  |      10
business   |    50         |  unlimited*  |  unlimited*

* unlimited = high cap (e.g., 999) stored in base_allocation
```

**Rollover rule:** At period reset, `new_rollover = min(floor(prev_base * 0.20), prev_remaining)`.

---

### Table: `credit_transactions`

Immutable audit log. Every credit change creates a row here.

```sql
CREATE TYPE credit_transaction_type AS ENUM (
    'allocation',    -- monthly reset / plan start
    'usage',         -- agent job consumed credits
    'topup',         -- purchased top-up
    'rollover',      -- credits carried forward
    'refund',        -- admin refund
    'adjustment'     -- manual correction
);

CREATE TABLE public.credit_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pool_id         UUID NOT NULL REFERENCES public.credit_pools(id),
    pool_type       credit_pool_type NOT NULL,
    transaction_type credit_transaction_type NOT NULL,
    amount          INTEGER NOT NULL,             -- positive = credit, negative = debit
    balance_after   INTEGER NOT NULL,             -- pool remaining after this transaction
    description     TEXT,
    agent_job_id    UUID,                         -- FK to agent_jobs (nullable)
    stripe_invoice_id TEXT,                       -- for topup transactions
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX credit_transactions_pool_id_idx ON public.credit_transactions(pool_id);
CREATE INDEX credit_transactions_created_at_idx ON public.credit_transactions(created_at DESC);
```

**RLS:**
```sql
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions: own rows read-only"
    ON public.credit_transactions
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT/UPDATE only via service role (API server-side). No client writes.
```

---

## E. Schema — Free Scans (Pre-Signup)

---

### Table: `free_scans`

Landing page scans. Created before the user has an account.

```sql
CREATE TYPE scan_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'expired'
);

CREATE TABLE public.free_scans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_url         TEXT NOT NULL,
    business_name       TEXT NOT NULL,
    industry            TEXT NOT NULL,
    location            TEXT NOT NULL,
    status              scan_status NOT NULL DEFAULT 'pending',
    results_data        JSONB,                         -- ScanResultsData shape (see scan-page.md)
    converted_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    converted_to_scan_id UUID,                         -- FK to scans.id after import
    trial_started       BOOLEAN NOT NULL DEFAULT false, -- set true when trial clock begins
    ip_address          INET,                          -- for rate limiting (no account required)
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX free_scans_status_idx ON public.free_scans(status);
CREATE INDEX free_scans_converted_user_idx ON public.free_scans(converted_user_id) WHERE converted_user_id IS NOT NULL;
CREATE INDEX free_scans_expires_at_idx ON public.free_scans(expires_at);
CREATE INDEX free_scans_ip_created_idx ON public.free_scans(ip_address, created_at DESC);
```

**RLS:**
```sql
ALTER TABLE public.free_scans ENABLE ROW LEVEL SECURITY;

-- Public read by id (shareable URL — /scan/[id])
CREATE POLICY "free_scans: public read by id"
    ON public.free_scans
    FOR SELECT
    USING (true);   -- row-level access controlled by knowing the UUID (obscure by nature)

-- Only service role can INSERT/UPDATE (API server-side)
-- No authenticated user policy needed for writes — all via service role key
```

**Retention policy:**
- `expires_at` is 30 days from creation.
- A scheduled job (cron via pg_cron or Supabase Edge Function) runs nightly:
  `UPDATE free_scans SET status = 'expired' WHERE expires_at < now() AND status != 'expired'`
- After 90 days: `results_data` is NULLed (soft delete of heavy JSONB, keeps row for analytics).

**Conversion flow:**
When user signs up after free scan:
1. `UPDATE free_scans SET converted_user_id = $user_id WHERE id = $scan_id`
2. Import results into `scans` + `scan_engine_results` tables (normalized)
3. `UPDATE free_scans SET converted_to_scan_id = $new_scan_id`
4. `UPDATE subscriptions SET trial_started_at = free_scans.created_at` (trial retroactively starts from when they first scanned)

---

## F. Schema — Scan Infrastructure

---

### Table: `scans`

One row per scan run. Applies to both onboarding scans and recurring automated scans.

```sql
CREATE TABLE public.scans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status              scan_status NOT NULL DEFAULT 'pending',
    scan_type           TEXT NOT NULL DEFAULT 'scheduled',   -- 'scheduled' | 'manual' | 'onboarding' | 'imported'
    overall_score       SMALLINT CHECK (overall_score BETWEEN 0 AND 100),
    rank_position       SMALLINT,              -- NULL = not found in this scan
    projected_rank      SMALLINT,              -- estimated rank if not found
    total_businesses_in_category INTEGER,
    engines_scanned     TEXT[] NOT NULL DEFAULT '{}',        -- ['chatgpt','gemini',...]
    queries_count       SMALLINT NOT NULL DEFAULT 0,
    mentions_count      SMALLINT NOT NULL DEFAULT 0,
    error_message       TEXT,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX scans_business_id_idx ON public.scans(business_id);
CREATE INDEX scans_user_id_idx ON public.scans(user_id);
CREATE INDEX scans_status_idx ON public.scans(status) WHERE status IN ('pending', 'processing');
CREATE INDEX scans_completed_at_idx ON public.scans(business_id, completed_at DESC);
```

**RLS:**
```sql
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scans: own rows only"
    ON public.scans
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

### Table: `scan_queries`

The actual queries that were sent to AI engines during a scan.
This is critical — these queries become the basis for content creation.

```sql
CREATE TABLE public.scan_queries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id         UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    query_text      TEXT NOT NULL,             -- "best insurance company in Tel Aviv"
    query_type      TEXT NOT NULL,             -- 'local_service' | 'brand' | 'category' | 'comparison'
    is_tracked      BOOLEAN NOT NULL DEFAULT false,  -- user explicitly tracks this query
    engines_used    TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX scan_queries_scan_id_idx ON public.scan_queries(scan_id);
CREATE INDEX scan_queries_business_id_idx ON public.scan_queries(business_id);
CREATE INDEX scan_queries_tracked_idx ON public.scan_queries(business_id) WHERE is_tracked = true;
```

**RLS:** Inherited via business_id — user can only see queries for their own businesses.

```sql
ALTER TABLE public.scan_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_queries: own rows only"
    ON public.scan_queries
    FOR ALL
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );
```

---

### Table: `tracked_queries`

The specific queries a user wants to monitor over time (per plan limit).
Separate from `scan_queries` — these persist across scans.

```sql
CREATE TABLE public.tracked_queries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text      TEXT NOT NULL,
    added_source    TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'scan_suggested' | 'agent_suggested'
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT tracked_queries_unique UNIQUE (business_id, query_text)
);
```

**Plan limits (enforced at API layer):**
```
starter: 10 | pro: 25 | business: 75
```

**Indexes:**
```sql
CREATE INDEX tracked_queries_business_id_idx ON public.tracked_queries(business_id);
CREATE INDEX tracked_queries_user_id_idx ON public.tracked_queries(user_id);
```

**RLS:**
```sql
ALTER TABLE public.tracked_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_queries: own rows only"
    ON public.tracked_queries
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

### Table: `scan_engine_results`

Per-engine results for each scan. One row per engine per scan.

```sql
CREATE TABLE public.scan_engine_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id             UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    business_id         UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    engine              TEXT NOT NULL,          -- 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'grok' | 'llama' | 'copilot' | 'mistral'
    rank_position       SMALLINT,              -- NULL = not found
    is_mentioned        BOOLEAN NOT NULL DEFAULT false,
    is_cited            BOOLEAN NOT NULL DEFAULT false,
    mention_count       SMALLINT NOT NULL DEFAULT 0,
    sentiment           TEXT,                   -- 'positive' | 'neutral' | 'negative' | NULL
    confidence_score    NUMERIC(4,3),           -- 0.000–1.000
    queries_checked     SMALLINT NOT NULL DEFAULT 0,
    queries_mentioned   SMALLINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT scan_engine_results_unique UNIQUE (scan_id, engine),
    CONSTRAINT scan_engine_results_engine_check CHECK (
        engine IN ('chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'llama', 'copilot', 'mistral')
    )
);
```

**Indexes:**
```sql
CREATE INDEX scan_engine_results_scan_id_idx ON public.scan_engine_results(scan_id);
CREATE INDEX scan_engine_results_business_engine_idx ON public.scan_engine_results(business_id, engine);
```

**RLS:**
```sql
ALTER TABLE public.scan_engine_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_engine_results: own rows only"
    ON public.scan_engine_results
    FOR ALL
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );
```

---

### Table: `scan_engine_responses`

Truncated LLM response text. Stored for display in dashboard ("what did the engine say about you").

```sql
CREATE TABLE public.scan_engine_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id         UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    engine          TEXT NOT NULL,
    query_id        UUID REFERENCES public.scan_queries(id) ON DELETE SET NULL,
    response_text   TEXT NOT NULL,             -- truncated to 1,000 chars max
    business_excerpt TEXT,                     -- the specific sentence(s) mentioning the business
    char_count      SMALLINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Retention policy:**
- Full `response_text` retained for 90 days.
- After 90 days: `response_text` set to NULL, `business_excerpt` retained indefinitely.
- Scheduled job handles this. `business_excerpt` is the valuable part for the user.

**Indexes:**
```sql
CREATE INDEX scan_engine_responses_scan_id_idx ON public.scan_engine_responses(scan_id);
CREATE INDEX scan_engine_responses_engine_idx ON public.scan_engine_responses(scan_id, engine);
```

**RLS:**
```sql
ALTER TABLE public.scan_engine_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_engine_responses: own rows only"
    ON public.scan_engine_responses
    FOR SELECT
    USING (
        scan_id IN (
            SELECT id FROM public.scans WHERE user_id = auth.uid()
        )
    );
-- INSERT/UPDATE only via service role
```

---

### Table: `scan_mentions`

Detailed mention tracking per engine per query — the most granular scan data.

```sql
CREATE TABLE public.scan_mentions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id         UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    engine          TEXT NOT NULL,
    query_id        UUID REFERENCES public.scan_queries(id) ON DELETE SET NULL,
    mention_position SMALLINT,                 -- ordinal position in response (1st, 2nd, etc.)
    mention_context TEXT,                      -- the sentence(s) surrounding the mention
    mention_type    TEXT,                      -- 'direct' | 'indirect' | 'citation'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX scan_mentions_scan_id_idx ON public.scan_mentions(scan_id);
CREATE INDEX scan_mentions_engine_idx ON public.scan_mentions(scan_id, engine);
```

**RLS:** Same pattern as `scan_engine_responses` — read via scan ownership.

```sql
ALTER TABLE public.scan_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_mentions: own rows only"
    ON public.scan_mentions
    FOR SELECT
    USING (
        scan_id IN (
            SELECT id FROM public.scans WHERE user_id = auth.uid()
        )
    );
```

---

## G. Schema — Competitors

---

### Table: `competitors`

Competitors tracked per business. Added manually or imported from scan results.

```sql
CREATE TABLE public.competitors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    website_url     TEXT NOT NULL,
    source          TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'scan_detected' | 'agent_suggested'
    is_active       BOOLEAN NOT NULL DEFAULT true,
    first_seen_score SMALLINT,                  -- their score when first added
    latest_score    SMALLINT,                   -- most recent scan score
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT competitors_unique UNIQUE (business_id, website_url)
);
```

**Plan limits (enforced at API layer):**
```
starter: 3 | pro: 5 | business: 10
```

**Indexes:**
```sql
CREATE INDEX competitors_business_id_idx ON public.competitors(business_id);
CREATE INDEX competitors_user_id_idx ON public.competitors(user_id);
```

**RLS:**
```sql
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitors: own rows only"
    ON public.competitors
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

### Table: `competitor_scan_results`

Their ranking data extracted from each of our scans.
Note: we don't scan competitors directly — we extract their position from our own scans.

```sql
CREATE TABLE public.competitor_scan_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id   UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
    scan_id         UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    engine          TEXT NOT NULL,
    rank_position   SMALLINT,
    is_mentioned    BOOLEAN NOT NULL DEFAULT false,
    score           SMALLINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT competitor_scan_results_unique UNIQUE (competitor_id, scan_id, engine)
);
```

**Indexes:**
```sql
CREATE INDEX competitor_scan_results_competitor_id_idx ON public.competitor_scan_results(competitor_id);
CREATE INDEX competitor_scan_results_scan_id_idx ON public.competitor_scan_results(scan_id);
```

**RLS:**
```sql
ALTER TABLE public.competitor_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitor_scan_results: own rows only"
    ON public.competitor_scan_results
    FOR SELECT
    USING (
        competitor_id IN (
            SELECT id FROM public.competitors WHERE user_id = auth.uid()
        )
    );
```

---

### Table: `competitor_content_snapshots`

Digital footprint of competitors — content they publish, changes detected.
This is what feeds the "Your competitor just published 3 new articles" alert in the dashboard.

```sql
CREATE TABLE public.competitor_content_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id   UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
    snapshot_type   TEXT NOT NULL,             -- 'page' | 'blog_post' | 'faq' | 'schema' | 'review_count' | 'social_post'
    url             TEXT,
    title           TEXT,
    summary         TEXT,                      -- 500 chars max — what changed / what this content is
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_new          BOOLEAN NOT NULL DEFAULT true,     -- set to false after user views it
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX competitor_content_snapshots_competitor_id_idx ON public.competitor_content_snapshots(competitor_id);
CREATE INDEX competitor_content_snapshots_detected_at_idx ON public.competitor_content_snapshots(competitor_id, detected_at DESC);
CREATE INDEX competitor_content_snapshots_new_idx ON public.competitor_content_snapshots(competitor_id) WHERE is_new = true;
```

**RLS:**
```sql
ALTER TABLE public.competitor_content_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitor_content_snapshots: own rows only"
    ON public.competitor_content_snapshots
    FOR SELECT
    USING (
        competitor_id IN (
            SELECT id FROM public.competitors WHERE user_id = auth.uid()
        )
    );
```

---

## H. Schema — Agents & Content

---

### Table: `agent_jobs`

Every agent execution — the full lifecycle from trigger to result.

```sql
CREATE TYPE agent_job_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE agent_type AS ENUM (
    'content_writer',
    'blog_writer',
    'faq_agent',
    'schema_optimizer',
    'review_analyzer',
    'social_strategy',
    'competitor_intelligence'
);

CREATE TABLE public.agent_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_type      agent_type NOT NULL,
    status          agent_job_status NOT NULL DEFAULT 'pending',
    credits_cost    SMALLINT NOT NULL DEFAULT 1,           -- 1 for most, 2 for Competitor Intelligence
    input_params    JSONB NOT NULL DEFAULT '{}',           -- topic, tone, query_id, competitor_id, etc.
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    runtime_ms      INTEGER,
    llm_calls_count SMALLINT NOT NULL DEFAULT 0,           -- internal, not shown to user
    llm_cost_usd    NUMERIC(10,6),                         -- internal cost tracking, not shown to user
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Important:** `llm_calls_count` and `llm_cost_usd` are internal fields — never exposed to the frontend. One "agent use" = 1 credit deducted, regardless of how many LLM calls it took internally.

**Indexes:**
```sql
CREATE INDEX agent_jobs_user_id_idx ON public.agent_jobs(user_id);
CREATE INDEX agent_jobs_business_id_idx ON public.agent_jobs(business_id);
CREATE INDEX agent_jobs_status_idx ON public.agent_jobs(status) WHERE status IN ('pending', 'running');
CREATE INDEX agent_jobs_created_at_idx ON public.agent_jobs(user_id, created_at DESC);
```

**RLS:**
```sql
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_jobs: own rows only"
    ON public.agent_jobs
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT/UPDATE only via service role
```

---

### Table: `content_items`

Output of agent jobs. One content item per job (1:1 with agent_jobs on completion).

```sql
CREATE TYPE content_item_status AS ENUM (
    'draft',
    'ready',
    'published',
    'archived'
);

CREATE TYPE content_format AS ENUM (
    'markdown',
    'html',
    'json_ld',
    'plain_text',
    'structured_report'   -- for Review Analyzer, Competitor Intelligence
);

CREATE TABLE public.content_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_job_id    UUID NOT NULL REFERENCES public.agent_jobs(id) ON DELETE CASCADE,
    agent_type      agent_type NOT NULL,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,             -- full content body
    content_format  content_format NOT NULL DEFAULT 'markdown',
    word_count      INTEGER,
    status          content_item_status NOT NULL DEFAULT 'ready',
    metadata        JSONB NOT NULL DEFAULT '{}',   -- agent-specific: { target_query, schema_type, etc. }
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**`metadata` shape by agent type:**
```
content_writer:         { target_query: string, tone: string, length: string }
blog_writer:            { target_query: string, h1: string, word_count_target: number }
faq_agent:              { questions_count: number, target_queries: string[] }
schema_optimizer:       { schema_type: 'LocalBusiness' | 'FAQPage' | 'Article', target_url: string }
review_analyzer:        { review_count: number, avg_rating: number, top_issues: string[] }
social_strategy:        { platforms: string[], post_count: number }
competitor_intelligence:{ competitor_id: string, gap_count: number, opportunity_count: number }
```

**Indexes:**
```sql
CREATE INDEX content_items_user_id_idx ON public.content_items(user_id);
CREATE INDEX content_items_business_id_idx ON public.content_items(business_id);
CREATE INDEX content_items_agent_type_idx ON public.content_items(business_id, agent_type);
CREATE INDEX content_items_status_idx ON public.content_items(user_id, status);
CREATE INDEX content_items_created_at_idx ON public.content_items(user_id, created_at DESC);
```

**RLS:**
```sql
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items: own rows only"
    ON public.content_items
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

## I. Schema — Recommendations

Recommendations are generated from scan results. They populate the Action Queue in the dashboard.

```sql
CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE recommendation_status AS ENUM ('pending', 'in_progress', 'done', 'dismissed');

CREATE TABLE public.recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scan_id         UUID REFERENCES public.scans(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    priority        recommendation_priority NOT NULL DEFAULT 'medium',
    status          recommendation_status NOT NULL DEFAULT 'pending',
    suggested_agent agent_type,                    -- which agent should fix this
    affects_engines TEXT[],                        -- which engines this impacts
    agent_job_id    UUID REFERENCES public.agent_jobs(id) ON DELETE SET NULL,  -- set when actioned
    is_free_preview BOOLEAN NOT NULL DEFAULT false,  -- top 3 shown on free scan page
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX recommendations_business_id_idx ON public.recommendations(business_id);
CREATE INDEX recommendations_status_idx ON public.recommendations(business_id, status);
CREATE INDEX recommendations_priority_idx ON public.recommendations(business_id, priority, status);
```

**RLS:**
```sql
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recommendations: own rows only"
    ON public.recommendations
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

## J. Schema — Blog & SEO Infrastructure

Per Adam's requirement: blog publishing infrastructure for SEO traffic. Schema supports it; content lives in the DB for editorial control and reuse.

```sql
CREATE TYPE blog_post_status AS ENUM (
    'draft',
    'scheduled',
    'published',
    'archived'
);

CREATE TABLE public.blog_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    meta_description TEXT,                     -- 155 chars max
    og_title        TEXT,
    og_description  TEXT,
    og_image_url    TEXT,
    content         TEXT NOT NULL,             -- Markdown (rendered at display time)
    excerpt         TEXT,                      -- 200 chars max — shown in listing
    author_name     TEXT NOT NULL DEFAULT 'Beamix Team',
    author_avatar_url TEXT,
    status          blog_post_status NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMPTZ,
    lang            TEXT NOT NULL DEFAULT 'en',  -- 'en' | 'he'
    tags            TEXT[],
    reading_time_minutes SMALLINT,
    view_count      INTEGER NOT NULL DEFAULT 0,
    canonical_url   TEXT,                      -- for cross-posted content
    structured_data JSONB,                     -- JSON-LD Article schema, pre-generated
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX blog_posts_status_published_idx ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX blog_posts_lang_idx ON public.blog_posts(lang, status);
CREATE INDEX blog_posts_tags_idx ON public.blog_posts USING GIN(tags);
```

**RLS:**
```sql
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published posts
CREATE POLICY "blog_posts: public read published"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published');

-- Admin writes: service role only (no user-facing blog editor in MVP)
```

**Notes:**
- Blog CMS is admin-only in MVP (no public editor). Posts are inserted via service role (scripts or Supabase Studio).
- `structured_data` holds the pre-generated JSON-LD `Article` schema — served in `<script type="application/ld+json">` for SEO.
- Hebrew posts: separate rows with `lang = 'he'` — not translated versions of the same row. This allows independent editorial control.
- `/blog` route queries `WHERE status = 'published' ORDER BY published_at DESC`.
- `/blog/[slug]` queries `WHERE slug = $slug AND status = 'published'`.

---

## K. Schema — Notification Preferences

```sql
CREATE TABLE public.notification_preferences (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    weekly_digest               BOOLEAN NOT NULL DEFAULT true,
    daily_digest                BOOLEAN NOT NULL DEFAULT false,   -- business plan only
    agent_completion            BOOLEAN NOT NULL DEFAULT true,
    ranking_change_alerts       BOOLEAN NOT NULL DEFAULT true,
    product_updates             BOOLEAN NOT NULL DEFAULT false,
    marketing_tips              BOOLEAN NOT NULL DEFAULT false,
    integration_launch_notify   BOOLEAN NOT NULL DEFAULT false,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:**
```sql
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences: own row only"
    ON public.notification_preferences
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
```

---

## L. Supabase Functions & Triggers

### Trigger: `handle_new_user`

Fires after every `auth.users` INSERT. Creates the initial rows for a new account.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, full_name, created_at)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', now());

    -- Create subscription row (trial not started yet — starts on first scan)
    INSERT INTO public.subscriptions (user_id, status, created_at)
    VALUES (NEW.id, 'trialing', now());

    -- Create notification preferences (defaults)
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Trigger: `update_updated_at`

Auto-update `updated_at` on any row change. Apply to all mutable tables.

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply to each table that has updated_at:
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.credit_pools
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.scans
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.competitors
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agent_jobs
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.content_items
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.recommendations
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
```

---

## M. Migration from Old Schema

הקוד הנוכחי משתמש בטבלאות ישנות. אלו הצפויות להיות מוחלפות:

| Old table | Replaced by | Notes |
|-----------|-------------|-------|
| `users` (custom) | `user_profiles` | Supabase auth.users is the source of truth |
| `llm_rankings` | `scan_engine_results` + `scan_mentions` | Split into normalized tables |
| `competitor_tracking` | `competitors` | Renamed + added business_id |
| `agent_executions` | `agent_jobs` | Renamed, extended |
| `credits` | `credit_pools` + `credit_transactions` | Split for pool-type model |
| `subscriptions` | `subscriptions` | Same name, extended schema |
| `free_scans` | `free_scans` | New — didn't exist before |
| `scan_queries` | `scan_queries` + `tracked_queries` | Split: per-scan vs. persistent |

**Migration strategy:** Build new schema in parallel (new tables), migrate data in a one-time script, then remove old tables. Do not attempt in-place ALTER on production.

---

## N. Complete Table List

| Table | Rows (est. at 1k users) | Purpose |
|-------|------------------------|---------|
| `user_profiles` | 1k | User identity extension |
| `businesses` | 2k–5k | Businesses per user |
| `subscriptions` | 1k | One per user |
| `credit_pools` | 3k | 3 pool types per user |
| `credit_transactions` | 50k+ | Immutable audit log |
| `free_scans` | 20k+ | Landing page scans (high volume) |
| `scans` | 10k+ | Authenticated recurring scans |
| `scan_queries` | 100k+ | Queries per scan (high volume) |
| `tracked_queries` | 15k | Persistent tracked queries |
| `scan_engine_results` | 80k+ | Per engine per scan |
| `scan_engine_responses` | 100k+ | LLM response text (trimmed after 90d) |
| `scan_mentions` | 200k+ | Granular mention data |
| `competitors` | 5k | Tracked competitors |
| `competitor_scan_results` | 30k+ | Their rank in our scans |
| `competitor_content_snapshots` | 50k+ | Their digital changes |
| `agent_jobs` | 20k+ | Agent execution log |
| `content_items` | 20k+ | Agent outputs |
| `recommendations` | 30k+ | Action queue items |
| `blog_posts` | <100 | Marketing blog |
| `notification_preferences` | 1k | Per-user email prefs |

---

## O. Open Decisions Still Needed

הפריטים הבאים נמצאים מחוץ ל-scope של spec זה ודורשים decision:

1. **C1 resolved** — engines confirmed: `chatgpt, gemini, perplexity, claude, grok, llama, copilot, mistral`.
2. **C2 resolved** — standardize on `scan_id` (UUID) everywhere. `scan_token` deprecated.
3. **C3 resolved — Option A** — Free scan מיובא לדשבורד לאחר signup. Onboarding לא מפעיל סקן חדש אם יש scan_id. Trial מתחיל רטרואקטיבית מ-free_scans.created_at.
4. **C4 resolved** — Trial starts when first scan begins (`free_scans` INSERT or `scans` INSERT).
5. **C6 resolved** — No n8n. All automation is custom code.
6. **I6** — Manual scan rate limits: Starter 1/week, Pro 1/day, Business unlimited — pending approval.
7. **Email system** — Resend integration spec not yet written. Schema has `notification_preferences` but email templates are not designed.

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent)*
*This document is the DB source of truth. All other specs' SQL snippets are superseded by this document.*
*Next: Backend Architecture Spec (`backend-architecture-spec.md`)*
