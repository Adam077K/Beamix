# External Integrations

> **Last synced:** March 2026 — aligned with 03-system-design/

**Source of truth:** `docs/03-system-design/ARCHITECTURE.md`

## OpenRouter (LLM Gateway)

Primary interface for all LLM calls. Replaces direct provider SDKs.

**Keys:**
- `OPENROUTER_SCAN_KEY` — scan engine queries (ChatGPT, Gemini, Perplexity, Claude)
- `OPENROUTER_AGENT_KEY` — agent execution, QA gates, recommendations

**Models routed:**
- `openai/gpt-4o` — ChatGPT scan engine
- `google/gemini-2.0-flash-001` — Gemini scan engine
- `perplexity/sonar-pro` — Perplexity scan engine
- `anthropic/claude-sonnet-4` — Claude scan engine + agent execution
- `anthropic/claude-haiku-4` — QA gate + recommendations

**File:** `src/lib/openrouter.ts`

## LLM APIs (called from Inngest functions via OpenRouter, NOT API routes directly)

All LLM calls go through OpenRouter. Models below are accessed via the OpenRouter gateway — not through individual provider SDKs.

**ChatGPT (openai/gpt-4o)** — Scan engine, QA gate, content generation
- Gateway: OpenRouter (`OPENROUTER_SCAN_KEY` for scan, `OPENROUTER_AGENT_KEY` for agents)

**Claude (multi-model):**
- `anthropic/claude-haiku-4` — Parsing, classification, extraction (~$0.001/call)
- `anthropic/claude-sonnet-4` — Content generation, analysis, reports (~$0.02-0.08/call)
- Gateway: OpenRouter (`OPENROUTER_AGENT_KEY`)
- Used in: Response parsing pipeline (Haiku), agent content stages (Sonnet)

**Perplexity Sonar Pro** — Real-time web research
- Gateway: OpenRouter (`OPENROUTER_AGENT_KEY`)
- Used in: Agent research stages, citation discovery

**Google Gemini 2.0 Flash** — Scan engine, high-volume classification
- Gateway: OpenRouter (`OPENROUTER_SCAN_KEY`)
- Used in: Scan engine (Phase 1), high-volume low-reasoning tasks

**xAI Grok** — Scan engine Phase 2
- Gateway: OpenRouter (`OPENROUTER_SCAN_KEY`)
- Used in: Scan engine query (Pro tier)

## Background Jobs

**Inngest** — Event-driven background job orchestration
- SDK: `inngest` (server-side)
- Serve endpoint: `/api/inngest`
- Auth: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- Functions: scan.free, scan.manual, agent.execute, 8 cron functions (scan-scheduled PLANNED)
- Pattern: API route emits event -> Inngest executes with retry/concurrency -> result written to DB -> Supabase Realtime notifies frontend
- NOT n8n — Inngest is the only background job system

## Billing

**Paddle** — Subscriptions, webhooks, billing portal
- SDK: Paddle Node SDK
- Client token: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (checkout overlay)
- Server: `PADDLE_API_KEY` (portal links, subscription management)
- Webhook secret: `PADDLE_WEBHOOK_SECRET` (signature verification)
- Price IDs: `PADDLE_PRICE_*` (starter/pro/business monthly/yearly)
- Webhook endpoint: `src/app/api/paddle/webhooks/route.ts`
- Events handled: subscription.created, subscription.updated, subscription.cancelled, transaction.completed
- NOT Stripe — Stripe was fully removed 2026-03-02

## Email

**Resend** — Transactional + marketing email delivery
- SDK: `resend` (server-side)
- Auth: `RESEND_API_KEY`
- 15 React Email templates
- Triggered by: Inngest cron functions (trial-nudges, weekly-digest) and lifecycle events

## Data Storage

**Supabase (PostgreSQL + Auth + Realtime + Storage)**
- Connection: `NEXT_PUBLIC_SUPABASE_URL` (public, for client-side)
- Anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, for client-side)
- Service role: `SUPABASE_SERVICE_ROLE_KEY` (server-side only — Inngest functions + webhooks only)
- Database URL: `DATABASE_URL` (for migrations)
- Client: @supabase/supabase-js v2.91.1
- Schema location: `supabase/migrations/`
- 32 tables across 8 categories
- RLS on every table
- Realtime: WebSocket subscriptions for live dashboard updates
- Storage: Profile avatars, generated content files

**React Query** — In-memory caching
- Config: `src/lib/react-query/client.ts`
- Stale time: 5 minutes
- GC time: 10 minutes
- Refetch on reconnect: enabled

## Third-Party Integrations (User-Configured)

**WordPress** (Pro tier) — Content publishing
- Method: WordPress REST API
- Auth: User provides site URL + application password
- Credentials: AES-256-GCM encrypted at application layer, stored in `integrations` table
- Used by: Content publish flow (agent output -> review -> CMS publish)

**Google Analytics 4** — Traffic + conversion tracking
- Method: OAuth 2.0
- Data pull: Weekly Inngest cron job
- Metrics: Referral traffic from AI engines, conversion tracking
- Credentials: OAuth tokens stored encrypted in `integrations` table

**Google Search Console** — Search performance data
- Method: OAuth 2.0
- Data pull: Weekly Inngest cron job
- Metrics: Search queries, impressions, clicks, position data

**Slack** — Alert notifications
- Method: Incoming webhook URL
- Auth: User provides webhook URL
- Used by: Alert system — visibility drops, competitor overtakes, credit warnings

**Cloudflare** — Technical optimizations
- Method: Zone API
- Auth: API token
- Used for: Technical SEO optimizations (headers, redirects, etc.)

## Public REST API (Business Tier Only)

- 9 endpoints under `/api/v1/`
- Auth: API key (SHA-256 hashed, scoped read/write/execute, rate limited)
- Endpoints: visibility scores, scan history, content library, agent execution, recommendations, competitors, settings, export, webhooks

## Authentication & Identity

**Supabase Auth:**
- Implementation: Email/password + magic link authentication
- Session handling: Cookie-based with JWT tokens
- Middleware: `src/lib/supabase/middleware.ts` refreshes sessions on each request
- Client: `@supabase/ssr` library for SSR support
- Protected routes: Enforced in middleware for `/dashboard`, `/onboarding`, `/settings`
- Redirect logic: Unauthenticated users -> login, authenticated users viewing auth pages -> dashboard

## Hosting & Deployment

**Vercel** — Next.js frontend + API routes
- Deployment: Automatic on git push to main
- Environment variables: Configured in Vercel project settings

**Supabase Cloud** — Managed PostgreSQL + Auth + Realtime + Storage

**Inngest Cloud** — Background job execution and monitoring

## Monitoring & Observability

**Error Tracking:**
- Not yet configured (planned: Sentry)

**Logs:**
- Console logging in API routes (appears in Vercel function logs)
- Inngest dashboard for background job monitoring (retries, failures, queue depth)
- React Query DevTools in development

## Webhooks

**Incoming:**
- Paddle: `src/app/api/paddle/webhooks/route.ts` — subscription lifecycle events
- Inngest: `/api/inngest/route.ts` — Inngest serve endpoint

**Outgoing (from Inngest functions via OpenRouter):**
- LLM API calls (routed through OpenRouter: ChatGPT, Claude, Perplexity, Gemini, Grok)
- Resend email delivery
- WordPress REST API (content publishing)
- Slack webhooks (alert notifications)

## Environment Configuration

**Required env vars:**

| Category | Variables | Scope |
|----------|-----------|-------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` | Server only |
| Paddle | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Public |
| Paddle | `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_*` | Server only |
| LLMs (OpenRouter) | `OPENROUTER_SCAN_KEY`, `OPENROUTER_AGENT_KEY` | Server only |
| Email | `RESEND_API_KEY` | Server only |
| Inngest | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Server only |
| App | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` | Public |

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Production: Vercel Environment Variables (project settings)

---

*Integration audit: 2026-02-27 | Updated: 2026-03-19 — added OpenRouter gateway section, updated Paddle webhook path to api/paddle/webhooks, replaced direct LLM SDK refs with OpenRouter routing*
