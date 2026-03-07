# Architecture

> **Last synced:** March 2026 — aligned with 03-system-design/

**Source of truth:** `.planning/03-system-design/_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md`

## Pattern Overview

**Overall:** Layered N-tier architecture with clear separation between presentation, API, background jobs, and data layers, built on Next.js 16 with Inngest handling all async agent execution, scans, and cron jobs.

**Key Characteristics:**
- Server-client component split with Next.js 16 App Router for modern React patterns
- API layer built on Next.js route handlers with middleware-style error handling
- **Inngest-native async execution** — API routes emit events and return 202; Inngest handles all agent/scan/cron work with retry, concurrency control, and observability
- Real-time updates via Supabase Realtime (WebSocket) — frontend subscribes, not polling
- State management split: React Query for server state, Zustand for client UI state
- Database-enforced security through Supabase Row-Level Security (RLS) on all 32 tables

## Layers

**Presentation Layer (Frontend):**
- Purpose: Server and client components rendering UI, form handling, real-time data fetching
- Location: `src/app/` (page routes, layouts), `src/components/` (UI components)
- Contains: Next.js pages, React components with hooks, Shadcn UI components, animations (Framer Motion)
- Depends on: React Query (data), Zustand (UI state), Supabase client (auth), custom hooks
- Used by: Browser clients accessing `/` and authenticated routes

**API Layer (Route Handlers):**
- Purpose: Authentication enforcement, input validation, business logic, database operations, Inngest event emission
- Location: `src/app/api/` organized by domain (~70+ routes across 14 route groups)
- Contains: Next.js POST/GET/PUT/DELETE handlers with error wrapping, Supabase queries, Zod validation
- Depends on: `lib/api/auth.ts` (user verification), `lib/api/errors.ts` (error types), `lib/api/responses.ts` (response formatting), `lib/supabase/server.ts` (server client)
- Used by: Frontend via fetch calls, external systems via webhooks
- **Critical rule:** API routes NEVER call LLM APIs directly. All agent/scan work emits Inngest events and returns 202.

**State Management Layer:**
- **React Query:** Server state (queries, rankings, content, credits) — cached and synchronized via `src/lib/react-query/`
- **Zustand:** Client UI state (sidebar, modals, loading states) — managed in `src/lib/zustand/stores/ui-store.ts`

**Data Access Layer:**
- Purpose: Provide authenticated clients (browser, API routes) to Supabase
- Location: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts` (auth middleware)
- Contains: Supabase client initialization with cookie-based session management
- Depends on: Supabase SDK, Next.js cookies API
- Used by: API routes, React components, hooks

**Inngest Background Layer:**
- Purpose: All async work — scans, agent execution, crons, multi-agent workflow chains
- Location: `src/inngest/` — Inngest function definitions. Served at `/api/inngest`
- Contains: 14 Inngest functions (see table below)
- Depends on: LLM APIs (OpenAI, Anthropic, Perplexity, Gemini, xAI, DeepSeek), Supabase (persist results)
- Pattern: API route emits Inngest event -> returns 202 -> Inngest executes function with retry/concurrency -> writes result to DB -> Supabase Realtime notifies frontend
- Service role key: Only used here and in webhook handlers (never in API routes or client)

**Authentication Layer:**
- Purpose: User session verification, credit balance checks
- Location: `src/lib/api/auth.ts` (middleware), `src/lib/supabase/middleware.ts` (session refresh)
- Contains: `getAuthenticatedUser()` function throwing `UnauthorizedError` if no session
- Depends on: Supabase Auth, Next.js cookies
- Used by: All API routes that require auth

## Database (32 Tables)

| Category | Tables | Key Design Decisions |
|----------|--------|---------------------|
| Core Identity (4) | user_profiles, businesses, plans, subscriptions | One subscription per user, trigger-created profiles |
| Billing (2) | credit_pools, credit_transactions | Hold/confirm/release pattern, 20% rollover cap |
| Scan (4) | free_scans, scans, scan_engine_results, citation_sources | Sentiment as 0-100 integer (not enum), dedicated citation tracking |
| Agent/Content (6) | agent_jobs, agent_job_steps, content_items, content_versions, content_performance, content_voice_profiles | 12 content types, editorial review queue, voice profiles |
| Intelligence (8) | competitors, competitor_scans, recommendations, tracked_queries, prompt_library, prompt_volumes, personas, brand_narratives | Prompt volume estimation, persona-based tracking |
| Workflow (2) | agent_workflows, workflow_runs | Event-triggered multi-agent chains |
| Alerts (3) | alert_rules, notifications, notification_preferences | 9 alert types, 3 channels, cooldown dedup |
| Platform (3) | integrations, api_keys, blog_posts | AES-256-GCM credential encryption |

RLS is enabled on every table. Service role key used only in Inngest functions and webhook handlers.

## Background Jobs (14 Inngest Functions)

| Function | Trigger | Duration | Concurrency |
|----------|---------|----------|-------------|
| `scan.free` | Event | 30-60s | 25 system |
| `scan.scheduled` | Cron (every 1h) | 60-120s | 50 system |
| `scan.manual` | Event | 60-120s | 10 system |
| `agent.execute` | Event | 60-300s | 3 per user, 20 system |
| `workflow.execute` | Event | 5-30min | 5 total, 1 per user |
| `alert.evaluate` | Event (post-scan) | 5-10s | 50 system |
| `cron.scheduled-scans` | Every 1 hour | 1-5min | 1 |
| `cron.monthly-credits` | 1st of month | 30s | 1 |
| `cron.trial-nudges` | Daily 10am | 30s | 1 |
| `cron.weekly-digest` | Monday 8AM UTC | 2min | 1 |
| `cron.prompt-volume-agg` | Weekly Sunday 3:30am UTC | 5-15min | 1 |
| `cron.cleanup` | Daily 4am | 1-5min | 1 |
| `cron.content-refresh-check` | Daily 6AM UTC | 5-20min | 1 |
| `cron.voice-refinement` | Weekly Sunday 3AM UTC | 5-10min | 1 |

## Inngest Event Registry

| Event Name | Emitted By | Consumed By | Payload |
|------------|-----------|-------------|---------|
| `scan/free.start` | `/api/scan/start` | `scan.free` | `{ scanId, businessUrl, language, ip }` |
| `scan/manual.start` | `/api/scan/start` (authenticated) | `scan.manual` | `{ scanId, businessId, userId }` |
| `scan/complete` | `scan.free`, `scan.manual`, `scan.scheduled` | `alert.evaluate`, workflows | `{ scanId, businessId, userId, scores }` |
| `agent/execute.start` | `/api/agents/[agentType]/execute` | `agent.execute` | `{ jobId, agentType, businessId, userId, params }` |
| `agent/execute.complete` | `agent.execute` | workflows, `alert.evaluate` | `{ jobId, agentType, businessId, contentId }` |
| `workflow/trigger` | `alert.evaluate`, manual | `workflow.execute` | `{ workflowId, triggerId, businessId }` |
| `onboarding/complete` | `/api/onboarding/complete` | workflows (New Business Onboarding) | `{ userId, businessId }` |
| `content/published` | `/api/content/publish` | workflows (Content Lifecycle) | `{ contentId, businessId, agentType }` |
| `billing/subscription.changed` | `/api/billing/webhooks` | `cron.monthly-credits` (immediate allocation) | `{ userId, planId, status }` |
| `alert/rule.triggered` | `alert.evaluate` | notification delivery | `{ alertRuleId, businessId, channel, payload }` |

## API Routes (~70+ across 14 route groups)

| Route Group | Routes | Auth | Purpose |
|-------------|--------|------|---------|
| `/api/scan/*` | 5 | Mixed | Free scan, manual scan, status, results, history |
| `/api/agents/*` | 5 | Required | Execute, status, cancel, history, chat |
| `/api/content/*` | 6 | Required | CRUD, publish to CMS, performance data |
| `/api/dashboard/*` | 6 | Required | Overview, rankings, trends, competitors, recommendations, ai-readiness |
| `/api/settings/*` | 9 | Required | Business profile, preferences, notifications, billing, integrations, language, export, account, password |
| `/api/billing/*` | 5 | Required | Status, portal link, Paddle webhooks, usage, invoices |
| `/api/integrations/*` | 6 | Required | CRUD for WordPress, GA4, GSC, Slack, Cloudflare, test-connection |
| `/api/alerts/*` | 5 | Required | Alert rules CRUD, notification list, mark read, preferences, bulk actions |
| `/api/competitors/*` | 3 | Required | CRUD, comparison data |
| `/api/workflows/*` | 4 | Required | CRUD, trigger, run history |
| `/api/analytics/*` | 4 | Required | Prompt volumes, citation sources, brand narrative, content performance |
| `/api/v1/*` | 9 | API key | Public REST API (Business tier) |
| `/api/onboarding/*` | 1 | Required | Complete onboarding |
| `/api/inngest` | 1 | Inngest key | Inngest serve endpoint |

## Data Flows

**Agent Execution (Inngest-native):**

1. User clicks "Fix This" on a recommendation or runs an agent from the hub
2. Submit -> `POST /api/agents/[agentType]/execute` (dynamic segment, e.g. `/api/agents/content_writer/execute`)
3. API route:
   - Calls `getAuthenticatedUser()` — throws 401 if not logged in
   - Validates input with Zod
   - Holds credit via `credit_pools` update (hold/confirm/release pattern)
   - Inserts record in `agent_jobs` table with status='pending'
   - Emits `agent/execute.start` Inngest event
   - Returns `{ jobId, status: 'processing' }` immediately (202 Accepted)
4. Inngest picks up `agent.execute` function, runs multi-stage LLM pipeline with retry/concurrency
5. On completion: writes output to `content_items` + `agent_job_steps`, confirms credit, emits `agent/execute.complete`
6. Frontend polls `GET /api/agents/[jobId]/status` every 3 seconds while status is 'pending' or 'running'
7. On failure: releases held credit (user never charged for failed executions)

**Full Scan Cycle:**

1. Trigger (free scan / manual / scheduled cron)
2. Prompt generation per industry + tracked queries
3. Engine queries (4-10 AI engines depending on tier)
4. Response parsing (6-stage pipeline: mention detection -> position extraction -> sentiment scoring -> citation extraction -> competitor extraction -> context window)
5. Scoring and storage to `scan_engine_results` + `citation_sources`
6. Alert evaluation (`alert.evaluate` Inngest function)
7. Dashboard update via Supabase Realtime

**Content Publish:**

Agent output -> user review/edit -> CMS publish (WordPress REST API for Pro tier) -> performance baseline -> tracking via `content_performance` table

**Alert Cycle:**

Data change -> rule evaluation -> deduplication (cooldown) -> channel routing (email/in-app/Slack) -> delivery

**Workflow Chain:**

Trigger event -> evaluate conditions -> queue agents -> execute in sequence -> report

## Key Abstractions

**Error Handling Abstraction:**
- Purpose: Standardized error responses with HTTP status codes and error codes
- Examples: `UnauthorizedError`, `BadRequestError`, `InsufficientCreditsError` in `src/lib/api/errors.ts`
- Pattern: Custom error classes extending `APIError` with preset status codes. All routes wrapped with `withErrorHandler()` which catches errors and formats responses.

**Response Formatting Abstraction:**
- Purpose: Consistent API response envelope
- Examples: `successResponse(data, meta)`, `errorResponse(error, statusCode)` in `src/lib/api/responses.ts`
- Pattern: All successful responses return `{ success: true, data, meta: { timestamp } }`, errors return `{ success: false, error: { message, code } }`

**Hooks Abstraction:**
- Purpose: Encapsulate data fetching logic with React Query + authentication
- Examples: `useQueries()`, `useDashboardData()`, `useCredits()` in `src/lib/hooks/`
- Pattern: Each hook uses React Query's `useQuery()` and `useMutation()`, returns `{ data, isLoading, error, mutations }`

**Supabase Client Abstraction:**
- Purpose: Provide different client instances for different contexts
- Examples: `createClient()` from `src/lib/supabase/client.ts` (browser), `createClient()` from `src/lib/supabase/server.ts` (API routes)
- Pattern: Browser client handles cookie-based auth, server client uses same but with explicit cookie management

## Security Architecture

| Concern | Approach |
|---------|----------|
| Authentication | Supabase Auth (email + magic link) |
| Authorization | RLS on every table (32 tables, all documented) |
| API Key Management | SHA-256 hashed, scoped (read/write/execute), rate limited |
| Credential Encryption | AES-256-GCM at application layer for integration credentials |
| Rate Limiting | Per route, per user, per tier, per IP |
| Input Validation | Zod on every API endpoint |
| GDPR | Data export, deletion cascades, anonymized prompt volumes |

## Cross-Cutting Concerns

**Logging:** `console.error()` and `console.log()` statements in API routes. No structured logging library. Logs appear in Vercel function logs.

**Validation:**
- Frontend: React Hook Form with Zod (via `resolvers: zodResolver()`)
- API: Zod schema validation on every route handler
- Supabase: Database constraints (NOT NULL, CHECK clauses, foreign keys)

**Authentication:**
- Frontend: Supabase session via JWT in cookies (automatic with `@supabase/ssr`)
- API: Session verification in `getAuthenticatedUser()` using `supabase.auth.getUser()`
- Database: RLS policies enforce user_id matching

**Data Encryption:**
- Passwords encrypted by Supabase Auth
- Integration credentials encrypted with AES-256-GCM at application layer
- API keys hashed with SHA-256
- LLM API keys stored in environment variables
- Database connections over TLS to Supabase cloud

**Rate Limiting:**
- Per route, per user, per tier, per IP (via middleware)
- Paddle handles payment rate limiting
- LLM provider rate limits managed via Inngest concurrency controls

---

*Architecture analysis: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*
