# Beamix -- Technical Architecture

> Complete technical specification for the Beamix GEO Platform. This document is the authoritative reference for all architecture, schema, API, and integration decisions.

---

## 1. System Architecture Overview

### High-Level Architecture

```
                            +------------------+
                            |     BROWSER      |
                            |   (SMB Owner)    |
                            +--------+---------+
                                     |
                                     | HTTPS
                                     v
                   +-----------------+------------------+
                   |          VERCEL EDGE NETWORK        |
                   |  (CDN, Static Assets, Edge Config)  |
                   +-----------------+------------------+
                                     |
                                     v
+--------------------------------------------------------------------+
|                    NEXT.JS APPLICATION (Vercel)                     |
|                                                                    |
|  +-------------------+  +-------------------+  +-----------------+ |
|  | Server Components |  | Client Components |  | API Route       | |
|  | (SSR, RSC)        |  | (Hydrated)        |  | Handlers        | |
|  | - Dashboard pages |  | - Modals, Forms   |  | - /api/scan     | |
|  | - Settings pages  |  | - Charts (Recharts)|  | - /api/agents   | |
|  | - Marketing pages |  | - Real-time polls |  | - /api/webhooks | |
|  +-------------------+  +-------------------+  +-----------------+ |
+------+------------------+------------------+-----------+-----------+
       |                  |                  |           |
       v                  v                  v           v
+------------+   +----------------+   +-----------+  +----------+
| SUPABASE   |   | n8n CLOUD      |   | STRIPE    |  | LLM APIs |
| - PostgreSQL|   | - AI Workflows |   | - Billing |  | - OpenAI |
| - Auth     |   | - Cron Jobs    |   | - Subs    |  | - Claude |
| - RLS      |   | - Webhooks     |   | - Credits |  | - Pplx   |
| - Realtime |   |                |   |           |  | - Gemini |
| - Storage  |   |                |   |           |  |          |
+------------+   +----------------+   +-----------+  +----------+
```

### Component Responsibilities

| Component | Responsibility | Communication |
|-----------|---------------|---------------|
| **Next.js Frontend** | UI rendering, form handling, real-time polling | HTTPS to API routes |
| **Next.js API Routes** | Auth enforcement, input validation, orchestration | Supabase SDK, HTTP to n8n |
| **Supabase** | Data persistence, auth, RLS, real-time subscriptions | PostgreSQL wire protocol |
| **n8n Cloud** | AI workflow orchestration, scheduled jobs, LLM calls | Webhook triggers, HTTP callbacks |
| **Stripe** | Subscription billing, payment processing | Webhooks to API routes |
| **LLM APIs** | Query ranking checks, content generation | Called exclusively from n8n |

### Key Design Decisions

1. **LLM calls happen ONLY in n8n** -- never from API routes directly. This centralizes cost tracking, retry logic, and rate limiting in one place.
2. **Fire-and-forget pattern** for agent execution -- API returns 202 Accepted immediately, frontend polls `agent_executions` table for status.
3. **RLS is the security boundary** -- even if an API route has a bug, Supabase RLS prevents data leakage across users.
4. **Credits are deducted AFTER success** -- if an agent fails, the user is not charged.

---

### Data Flow: Free Scan (Unauthenticated)

```
1. User visits /scan (marketing page)
2. Enters: website URL, business name, sector, location
3. Frontend: POST /api/scan/start
4. API Route:
   a. Rate-limit check (IP-based, max 3 scans/day per IP)
   b. Validate input with Zod
   c. Generate scan_token (UUID)
   d. Insert row into free_scans table (status='pending')
   e. Trigger n8n webhook: /webhook/free-scan
   f. Return { scan_token, status: 'processing' }
5. n8n Workflow (async, ~60-90s):
   a. Query 4 LLMs with 3 auto-generated prompts for sector+location
   b. Parse each response for brand mention, position, sentiment
   c. Write results to free_scan_results table
   d. Update free_scans.status = 'completed'
6. Frontend polls GET /api/scan/{scan_token}/status every 3s
7. When completed: redirect to /scan/{scan_token}/results
8. Results page renders: visibility score, per-LLM breakdown, CTA to sign up
```

### Data Flow: Agent Execution (Authenticated)

```
1. User on dashboard clicks "Generate Content" on a recommendation
2. Modal opens, user fills: topic, tone, word count
3. Frontend: POST /api/agents/content-writer
4. API Route:
   a. getAuthenticatedUser() -- 401 if no session
   b. Validate input with Zod schema
   c. Check credits: SELECT total_credits FROM credits WHERE user_id = $1
   d. If insufficient: return 402 with credits_required and credits_available
   e. Insert into agent_executions (status='pending', input_data=payload)
   f. POST to n8n webhook with { execution_id, user_id, ...payload }
   g. Return 202 { execution_id, status: 'processing' }
5. Frontend starts polling GET /api/agents/executions/{execution_id} every 5s
6. n8n Workflow (async, 2-5 min):
   a. Research phase (Perplexity sonar-pro)
   b. Outline phase (Claude claude-sonnet-4-5-20250929)
   c. Write phase (Claude claude-sonnet-4-5-20250929)
   d. Quality check (GPT-4o)
   e. If quality_score >= 0.7:
      - RPC call: deduct_credits(user_id, 3, 'content_generation', execution_id)
      - Insert into content_generations table
      - Update agent_executions.status = 'completed'
   f. If quality_score < 0.7: retry once, then fail gracefully
7. Frontend detects status='completed', fetches full result, displays in modal
```

### Data Flow: Dashboard Update (Scheduled)

```
1. n8n cron trigger: daily at 02:00 UTC
2. Fetch all active tracked_queries grouped by user
3. For each user batch (max 50 queries):
   a. Query 4 LLMs per query (parallel within n8n)
   b. Parse responses for mention, position, sentiment, competitors
   c. Batch insert into scan_results table
   d. Compare to previous day's results
   e. If significant change detected: flag for notification
4. After all users processed:
   a. Trigger recommendation regeneration for users with changes
5. Users see updated data next time they visit dashboard
   (React Query staleTime ensures fresh fetch)
```

---

## 2. Database Schema

### Schema Design Principles

- All tables use UUID primary keys (`gen_random_uuid()`)
- All tables include `created_at` (auto) and `updated_at` (trigger-maintained)
- JSONB for flexible/evolving structures (agent inputs/outputs, LLM metadata)
- Composite indexes on common query patterns
- RLS enabled on every table, no exceptions

### Entity Relationship Diagram

```
auth.users (Supabase managed)
    |
    +-- users (1:1, profile)
    |     |
    |     +-- businesses (1:many, user can track multiple brands)
    |     |     |
    |     |     +-- tracked_queries (1:many)
    |     |     |     |
    |     |     |     +-- scan_results (1:many, per-query snapshots)
    |     |     |     |     |
    |     |     |     |     +-- scan_result_details (1:many, per-LLM breakdown)
    |     |     |     |
    |     |     |     +-- recommendations (1:many)
    |     |     |
    |     |     +-- competitors (1:many)
    |     |
    |     +-- subscriptions (1:1 active)
    |     +-- credits (1:1 balance)
    |     +-- credit_transactions (1:many audit log)
    |     +-- agent_executions (1:many)
    |     |     |
    |     |     +-- content_generations (1:1 per content agent)
    |     |     +-- agent_outputs (1:many, generic output store)
    |     |
    |     +-- notification_preferences (1:1)
    |
    +-- free_scans (standalone, no auth required)
```

### Table Definitions

#### 2.1 `users`

```sql
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'he')),
  timezone    TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 2.2 `businesses`

A user can manage multiple brands/businesses. This separates identity from business context and enables future multi-brand support.

```sql
CREATE TABLE public.businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  website_url     TEXT,
  industry        TEXT,
  location        TEXT,
  description     TEXT,
  services        JSONB DEFAULT '[]'::jsonb,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE UNIQUE INDEX idx_businesses_primary ON businesses(user_id) WHERE is_primary = TRUE;
```

#### 2.3 `tracked_queries`

```sql
CREATE TABLE public.tracked_queries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_text      TEXT NOT NULL,
  query_category  TEXT,
  target_url      TEXT,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_scanned_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracked_queries_user_id ON tracked_queries(user_id);
CREATE INDEX idx_tracked_queries_business_id ON tracked_queries(business_id);
CREATE INDEX idx_tracked_queries_active ON tracked_queries(is_active) WHERE is_active = TRUE;
```

#### 2.4 `scan_results`

Parent record for a point-in-time check of a query across all LLMs.

```sql
CREATE TABLE public.scan_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id        UUID NOT NULL REFERENCES tracked_queries(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  scan_type       TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (scan_type IN ('initial', 'scheduled', 'manual', 'free')),
  overall_score   NUMERIC(4,2),
  mention_count   INTEGER NOT NULL DEFAULT 0,
  avg_position    NUMERIC(4,2),
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_results_query_id ON scan_results(query_id);
CREATE INDEX idx_scan_results_user_id ON scan_results(user_id);
CREATE INDEX idx_scan_results_scanned_at ON scan_results(scanned_at DESC);
CREATE INDEX idx_scan_results_composite ON scan_results(query_id, scanned_at DESC);
```

#### 2.5 `scan_result_details`

Per-LLM breakdown for each scan.

```sql
CREATE TYPE llm_provider AS ENUM (
  'chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews'
);

CREATE TYPE mention_sentiment AS ENUM ('positive', 'neutral', 'negative');

CREATE TABLE public.scan_result_details (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_result_id      UUID NOT NULL REFERENCES scan_results(id) ON DELETE CASCADE,
  llm_provider        llm_provider NOT NULL,
  is_mentioned        BOOLEAN NOT NULL DEFAULT FALSE,
  mention_position    INTEGER,
  mention_context     TEXT,
  sentiment           mention_sentiment,
  competitors_mentioned JSONB DEFAULT '[]'::jsonb,
  full_response_hash  TEXT,
  response_summary    TEXT,
  raw_prompt_used     TEXT,
  token_usage         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scan_details_scan_id ON scan_result_details(scan_result_id);
CREATE INDEX idx_scan_details_provider ON scan_result_details(llm_provider);
CREATE INDEX idx_scan_details_composite ON scan_result_details(scan_result_id, llm_provider);
```

#### 2.6 `recommendations`

```sql
CREATE TABLE public.recommendations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  query_id            UUID REFERENCES tracked_queries(id) ON DELETE SET NULL,
  recommendation_type TEXT NOT NULL
    CHECK (recommendation_type IN (
      'content_gap', 'schema_markup', 'faq_addition',
      'competitor_insight', 'review_improvement', 'social_strategy',
      'technical_optimization', 'keyword_optimization'
    )),
  priority            TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  action_items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_impact     TEXT CHECK (expected_impact IN ('high', 'medium', 'low')),
  supporting_data     JSONB DEFAULT '{}'::jsonb,
  agent_type          TEXT,
  credits_cost        INTEGER,
  status              TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'completed', 'dismissed')),
  dismissed_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_business_id ON recommendations(business_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
```

#### 2.7 `agent_executions`

```sql
CREATE TABLE public.agent_executions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
  agent_type          TEXT NOT NULL
    CHECK (agent_type IN (
      'content_writer', 'blog_writer', 'review_analyzer',
      'schema_optimizer', 'recommendations', 'social_strategy',
      'competitor_research', 'query_researcher', 'initial_analysis',
      'free_scan'
    )),
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data          JSONB NOT NULL,
  output_data         JSONB,
  error_message       TEXT,
  credits_charged     INTEGER DEFAULT 0,
  total_cost_usd      NUMERIC(8,4),
  llm_calls           JSONB DEFAULT '[]'::jsonb,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  execution_duration_ms INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_created ON agent_executions(created_at DESC);
```

#### 2.8 `content_generations`

```sql
CREATE TABLE public.content_generations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id        UUID NOT NULL REFERENCES agent_executions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
  content_type        TEXT NOT NULL
    CHECK (content_type IN (
      'blog_post', 'article', 'faq', 'product_description',
      'landing_page', 'schema_markup', 'social_post', 'review_response'
    )),
  title               TEXT,
  generated_content   TEXT NOT NULL,
  content_format      TEXT NOT NULL DEFAULT 'markdown'
    CHECK (content_format IN ('markdown', 'html', 'json', 'json-ld')),
  word_count          INTEGER,
  quality_score       NUMERIC(3,2),
  llm_optimization_score INTEGER,
  is_favorited        BOOLEAN NOT NULL DEFAULT FALSE,
  user_rating         INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback       TEXT,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_gen_user_id ON content_generations(user_id);
CREATE INDEX idx_content_gen_execution ON content_generations(execution_id);
CREATE INDEX idx_content_gen_type ON content_generations(content_type);
CREATE INDEX idx_content_gen_favorited ON content_generations(is_favorited) WHERE is_favorited = TRUE;
```

#### 2.9 `agent_outputs`

Generic output store for non-content agent results.

```sql
CREATE TABLE public.agent_outputs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id        UUID NOT NULL REFERENCES agent_executions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  output_type         TEXT NOT NULL
    CHECK (output_type IN (
      'competitor_report', 'query_suggestions', 'review_analysis',
      'social_strategy', 'schema_recommendations'
    )),
  title               TEXT,
  structured_data     JSONB NOT NULL,
  summary             TEXT,
  is_favorited        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_outputs_user_id ON agent_outputs(user_id);
CREATE INDEX idx_agent_outputs_execution ON agent_outputs(execution_id);
CREATE INDEX idx_agent_outputs_type ON agent_outputs(output_type);
```

#### 2.10 `subscriptions`

```sql
CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  plan_tier               TEXT NOT NULL
    CHECK (plan_tier IN ('free', 'starter', 'pro', 'enterprise')),
  status                  TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  trial_end               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 2.11 `plans`

```sql
CREATE TABLE public.plans (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  monthly_credits     INTEGER NOT NULL,
  max_queries         INTEGER NOT NULL,
  max_businesses      INTEGER NOT NULL DEFAULT 1,
  max_competitors     INTEGER NOT NULL DEFAULT 0,
  llm_providers       JSONB NOT NULL,
  features            JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_monthly_usd   NUMERIC(8,2),
  price_annual_usd    NUMERIC(8,2),
  stripe_price_monthly TEXT,
  stripe_price_annual  TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO plans VALUES
('free', 'Free', 0, 0, 1, 0, '["chatgpt","claude","perplexity","gemini"]', '["free_scan"]', 0, NULL, NULL, NULL, TRUE, NOW()),
('starter', 'Starter', 100, 10, 1, 3, '["chatgpt","claude","perplexity","gemini"]', '["content_writer","query_researcher","recommendations"]', 49, 470, NULL, NULL, TRUE, NOW()),
('pro', 'Professional', 500, 25, 3, 10, '["chatgpt","claude","perplexity","gemini","google_ai_overviews"]', '["all_agents","competitor_tracking","priority_support"]', 199, 1910, NULL, NULL, TRUE, NOW()),
('enterprise', 'Enterprise', 2000, -1, -1, -1, '["chatgpt","claude","perplexity","gemini","google_ai_overviews"]', '["all_agents","api_access","white_label","dedicated_support"]', 799, 7670, NULL, NULL, TRUE, NOW());
```

#### 2.12 `credits` and `credit_transactions`

```sql
CREATE TABLE public.credits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_credits       INTEGER NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
  monthly_allocation  INTEGER NOT NULL DEFAULT 0,
  rollover_credits    INTEGER NOT NULL DEFAULT 0,
  bonus_credits       INTEGER NOT NULL DEFAULT 0,
  last_reset_date     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.credit_transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type        TEXT NOT NULL
    CHECK (transaction_type IN ('debit', 'credit', 'monthly_allocation', 'bonus', 'rollover', 'refund')),
  amount                  INTEGER NOT NULL,
  balance_after           INTEGER NOT NULL,
  related_entity_type     TEXT,
  related_entity_id       UUID,
  description             TEXT,
  metadata                JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_tx_created ON credit_transactions(created_at DESC);
```

#### 2.13 `competitors`

```sql
CREATE TABLE public.competitors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  domain              TEXT,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2.14 `free_scans`

```sql
CREATE TABLE public.free_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_token      TEXT UNIQUE NOT NULL,
  website_url     TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  sector          TEXT NOT NULL,
  location        TEXT NOT NULL,
  ip_address      INET,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  overall_score   NUMERIC(4,2),
  results_data    JSONB,
  converted_user_id UUID REFERENCES users(id),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_free_scans_token ON free_scans(scan_token);
CREATE INDEX idx_free_scans_ip ON free_scans(ip_address);
```

### Database Functions

**`deduct_credits`** -- Safely deducts credits with row locking and transaction logging:

```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID, p_amount INTEGER, p_entity_type TEXT,
  p_entity_id UUID, p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_balance INTEGER; v_new INTEGER;
BEGIN
  SELECT total_credits INTO v_balance FROM credits WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN RETURN FALSE; END IF;
  v_new := v_balance - p_amount;
  UPDATE credits SET total_credits = v_new, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, related_entity_type, related_entity_id, description)
  VALUES (p_user_id, 'debit', -p_amount, v_new, p_entity_type, p_entity_id, p_description);
  RETURN TRUE;
END; $$;
```

**`allocate_monthly_credits`** -- Monthly reset with 20% rollover (capped at 50% of allocation):

```sql
CREATE OR REPLACE FUNCTION allocate_monthly_credits(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tier TEXT; v_alloc INTEGER; v_current INTEGER; v_rollover INTEGER; v_new INTEGER;
BEGIN
  SELECT plan_tier INTO v_tier FROM subscriptions WHERE user_id = p_user_id AND status IN ('active','trialing');
  IF v_tier IS NULL THEN RETURN; END IF;
  SELECT monthly_credits INTO v_alloc FROM plans WHERE id = v_tier;
  SELECT total_credits INTO v_current FROM credits WHERE user_id = p_user_id FOR UPDATE;
  v_rollover := LEAST(FLOOR(v_current * 0.2), FLOOR(v_alloc * 0.5));
  v_new := v_alloc + v_rollover;
  UPDATE credits SET total_credits = v_new, monthly_allocation = v_alloc, rollover_credits = v_rollover, last_reset_date = NOW(), updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description) VALUES (p_user_id, 'monthly_allocation', v_new, v_new, FORMAT('Monthly: %s + rollover: %s', v_alloc, v_rollover));
END; $$;
```

**`handle_new_user`** -- Trigger on auth.users insert:

```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.credits (user_id) VALUES (NEW.id);
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### RLS Policy Strategy

| Table | Model | SELECT | INSERT | UPDATE | DELETE |
|-------|-------|--------|--------|--------|--------|
| `users` | User-Owned | own | own | own | -- |
| `businesses` | User-Owned | own | own | own | own |
| `tracked_queries` | User-Owned | own | own | own | own |
| `scan_results` | Service-Write | own | service | -- | -- |
| `scan_result_details` | Service-Write | via join | service | -- | -- |
| `recommendations` | Mixed | own | service | own (status only) | -- |
| `agent_executions` | Service-Write | own | service | service | -- |
| `content_generations` | Mixed | own | service | own (rating/fav) | own |
| `agent_outputs` | Mixed | own | service | own (fav) | own |
| `subscriptions` | Service-Write | own | service | service | -- |
| `credits` | Service-Write | own | service | service | -- |
| `credit_transactions` | Service-Write | own | service | -- | -- |
| `competitors` | User-Owned | own | own | own | own |
| `plans` | Public-Read | all | service | service | -- |
| `free_scans` | No RLS | -- | -- | -- | -- |

"own" = `auth.uid() = user_id`, "service" = service role only, "all" = `TRUE`

---

## 3. AI Agent Architecture

### Agent Overview

| Agent | Credits | LLMs Used | Avg Time | Output |
|-------|---------|-----------|----------|--------|
| Content Writer | 3 | Perplexity + Claude Sonnet + GPT-4o | 2-5 min | Markdown article |
| Blog Writer | 3 | Perplexity + Claude Sonnet + GPT-4o | 3-6 min | Long-form blog post |
| Review Analyzer | 2 | Perplexity + Claude Sonnet | 1-2 min | Analysis report (JSONB) |
| Schema Optimizer | 2 | Perplexity + Claude Sonnet | 1-2 min | JSON-LD markup |
| Recommendations | 0 (system) | Claude Sonnet | 1-3 min | Recommendation records |
| Social Strategy | 2 | Perplexity + Claude Sonnet | 2-3 min | Content calendar (JSONB) |
| Competitor Research | 5 | All 4 LLMs + Claude Sonnet | 3-5 min | Intelligence report |
| Query Researcher | 2 | Perplexity + GPT-4o | 1-2 min | Suggested queries list |

### Content Writer Agent -- Detailed Pipeline

| Step | LLM | Model | Why | Temp | Max Tokens |
|------|-----|-------|-----|------|------------|
| 1. Research | Perplexity | sonar-pro | Real-time web data + citations | 0.5 | 1500 |
| 2. Outline | Claude | claude-sonnet-4-5-20250929 | Strong structural reasoning | 0.7 | 2000 |
| 3. Write | Claude | claude-sonnet-4-5-20250929 | Best long-form quality per dollar | 0.7 | 4000 |
| 4. QA | OpenAI | gpt-4o | Fast cheap validation | 0.3 | 1000 |

**n8n Workflow**:
```
[Webhook] -> [Validate] -> [Create Execution Record]
  -> [Research (Perplexity)] -> [Outline (Claude)] -> [Write (Claude)]
  -> [Quality Check (GPT-4o)] -> [quality >= 0.7?]
      YES -> [Deduct Credits] -> [Store Content] -> [Mark Completed]
      NO  -> [Retry with feedback] -> [Re-check] -> [Fail if still bad]
```

**Input Schema** (Zod):
```typescript
z.object({
  user_id: z.string().uuid(),
  business_id: z.string().uuid(),
  topic: z.string().min(10).max(500),
  content_type: z.enum(['article','blog_post','faq','landing_page','product_description']),
  target_queries: z.array(z.string()).min(1).max(5),
  tone: z.enum(['professional','friendly','expert']).default('professional'),
  word_count: z.number().int().min(500).max(2500).default(1200),
  include_faq: z.boolean().default(true),
  key_points: z.array(z.string()).optional(),
})
```

### Review Analyzer -- Output Format

Stored in `agent_outputs` (type: `review_analysis`):
```json
{
  "overall_sentiment": "positive",
  "sentiment_score": 0.72,
  "total_reviews_analyzed": 47,
  "themes": {
    "positive": ["fast service", "professional staff"],
    "negative": ["slow response time", "scheduling issues"]
  },
  "platforms": {"google": {"count": 28, "avg_rating": 4.3}},
  "recommendations": ["Address scheduling complaints by adding online booking"],
  "response_templates": [{"for": "positive_review", "template": "Thank you for..."}]
}
```

### Schema Optimizer -- Output Format

Stored in `content_generations` (type: `schema_markup`, format: `json-ld`):
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "MoveMaster Relocation",
  "url": "https://example.com",
  "address": {"@type": "PostalAddress", "addressLocality": "Tel Aviv"}
}
```

---

## 4. LLM Querying System

### Prompt Template System

Each query is tested with 3 prompt variations per LLM to reduce single-prompt bias:

```typescript
const SECTOR_PROMPTS: Record<string, string[]> = {
  relocation: [
    "I'm moving to {{location}}. What relocation companies do you recommend?",
    "Who provides the best moving services in {{location}}?",
    "Compare the top relocation services in {{location}} for international moves."
  ],
  insurance: [
    "What insurance companies in {{location}} offer the best coverage?",
    "I need insurance in {{location}}. Who should I consider?",
    "Compare insurance providers in {{location}} by price and coverage."
  ],
  general: [
    "What are the best {{query}} in {{location}}?",
    "I need {{query}} in {{location}}. What are my options?",
    "Can you recommend {{query}} providers in {{location}}?"
  ]
};
```

### Response Parsing

Each LLM response is parsed by GPT-4o-mini (cheapest parser):

```
Analyze this LLM response for business visibility:
Response: """{{llm_response}}"""
Business: "{{business_name}}" / "{{domain}}"

Return JSON:
{
  "is_mentioned": boolean,
  "mention_position": number | null,
  "mention_context": string | null,
  "sentiment": "positive"|"neutral"|"negative"|null,
  "competitors": [{"name": string, "position": number, "sentiment": string}]
}
```

### Visibility Scoring

```typescript
function calculateVisibilityScore(details: ScanResultDetail[]): number {
  const weights = { chatgpt: 0.30, claude: 0.25, perplexity: 0.20, gemini: 0.20, google_ai_overviews: 0.05 };
  let score = 0;
  for (const d of details) {
    const w = weights[d.llm_provider] ?? 0;
    if (d.is_mentioned) {
      const posScore = d.mention_position ? Math.max(0, 10 - (d.mention_position - 1) * 1.5) : 5;
      const sentBonus = d.sentiment === 'positive' ? 1 : d.sentiment === 'negative' ? -1 : 0;
      score += (posScore + sentBonus) * w;
    }
  }
  return Math.round(score * 100) / 100; // 0.00-10.00
}
```

### Cost Per Operation

| Operation | Est. Cost | Paid By |
|-----------|----------|---------|
| Free scan (4 LLMs x 3 prompts) | $0.08-0.15 | Platform |
| Daily ranking (1 query x 4 LLMs) | $0.02-0.04 | Platform |
| Content Writer Agent | $0.10-0.15 | User (3 credits) |
| Weekly recommendations (per user) | $0.03-0.05 | Platform |

---

## 5. API Routes Design

### Complete Route Map

```
GET   /api/health

POST  /api/scan/start
GET   /api/scan/{token}/status
GET   /api/scan/{token}/results

POST  /api/onboarding/business
POST  /api/onboarding/queries
POST  /api/onboarding/complete

GET   /api/businesses
POST  /api/businesses
GET   /api/businesses/{id}
PUT   /api/businesses/{id}
DELETE/api/businesses/{id}

GET   /api/queries
POST  /api/queries
GET   /api/queries/{id}
PUT   /api/queries/{id}
DELETE/api/queries/{id}

GET   /api/dashboard/overview
GET   /api/dashboard/rankings
GET   /api/dashboard/competitors

GET   /api/recommendations
PUT   /api/recommendations/{id}/status

POST  /api/agents/content-writer
POST  /api/agents/blog-writer
POST  /api/agents/review-analyzer
POST  /api/agents/schema-optimizer
POST  /api/agents/social-strategy
POST  /api/agents/competitor-research
POST  /api/agents/query-researcher
GET   /api/agents/executions
GET   /api/agents/executions/{id}

GET   /api/content
GET   /api/content/{id}
PUT   /api/content/{id}/rating
PUT   /api/content/{id}/favorite
DELETE/api/content/{id}

GET   /api/credits/balance
GET   /api/credits/transactions

POST  /api/stripe/create-checkout-session
POST  /api/stripe/create-portal-session
GET   /api/stripe/subscription-status

POST  /api/webhooks/stripe
POST  /api/webhooks/n8n

GET   /api/settings/profile
PUT   /api/settings/profile
GET   /api/settings/notifications
PUT   /api/settings/notifications
```

### Authentication Flow

```
Signup: Frontend -> Supabase Auth -> trigger handle_new_user()
Login:  Frontend -> Supabase Auth -> JWT in httpOnly cookies
API:    middleware.ts refreshes session -> API route calls supabase.auth.getUser()
        -> 401 if invalid
```

### Webhook Handling

**Stripe**: Verify signature with raw body, process idempotently (check event.id), handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.trial_will_end`.

**n8n Callbacks**: Verify `x-api-key` header, update `agent_executions` table.

---

## 6. Internationalization Architecture

### i18n Routing

URL prefix routing with `[locale]` segment:

```
/en/dashboard    (English, LTR)
/he/dashboard    (Hebrew, RTL)
/dashboard       (redirects to detected locale)
```

### RTL/LTR

Root layout sets `dir="rtl"|"ltr"` and `lang` attribute based on locale. Tailwind logical properties (`ps-4`, `me-2`) handle directional spacing.

### Translation Files

```
src/i18n/dictionaries/en.json
src/i18n/dictionaries/he.json
```

Flat key format: `"dashboard.metrics.avgRanking": "Average Ranking"`. Loaded via async `getDictionary(locale)` in Server Components.

---

## 7. Performance & Scalability

### Caching Strategy

| Data | Location | TTL |
|------|----------|-----|
| Dashboard metrics | React Query | 5 min staleTime |
| Credit balance | React Query | 30s staleTime |
| Plan details | React Query | 1 hour staleTime |
| LLM responses | n8n internal | 6 hours |
| Free scan results | Supabase | 7 day TTL |

### Background Jobs (all in n8n Cloud)

| Job | Frequency | Timeout |
|-----|-----------|---------|
| Daily ranking check | Daily 02:00 UTC | 30 min |
| Weekly recommendations | Monday 03:00 UTC | 15 min |
| Credit allocation | On Stripe webhook | 5s |
| Agent execution | On-demand | 10 min |

### Monthly Platform Cost (100 users, 10 queries each)

Daily rankings: $600-1,200 | Recommendations: $12-20 | Supabase: $25 | n8n: $50 | Vercel: $20 | **Total: ~$700-1,300/mo**

---

## 8. Security

### Rate Limiting

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `POST /api/scan/start` | 3 | 24 hours | Per IP |
| `POST /api/agents/*` | 10 | 1 hour | Per user |
| `POST /api/auth/login` | 5 | 15 minutes | Per IP |
| `POST /api/auth/signup` | 3 | 1 hour | Per IP |
| `GET /api/dashboard/*` | 60 | 1 minute | Per user |

### Key Separation

LLM API keys exist ONLY in n8n Cloud credentials -- never in Vercel env vars. This prevents accidental client-side exposure.

### Input Validation

All external input validated with Zod: API bodies, URL params, query strings, webhook payloads (after signature verification).

### Environment Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  N8N_WEBHOOK_SECRET: z.string().min(16),
});
export const env = envSchema.parse(process.env);
```

---

*Document version: 1.0 | Created: 2026-02-27 | Author: Atlas (CTO Agent)*