# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**AI Models (for n8n workflows):**
- OpenAI GPT-4o - Content generation, quality checking
  - SDK: OpenAI API (called from n8n, not directly from app)
  - Auth: `OPENAI_API_KEY` (server-side, n8n credentials)

- Anthropic Claude Opus 4.5 - Content writing, research
  - SDK: Anthropic API (called from n8n)
  - Auth: `ANTHROPIC_API_KEY` (server-side, n8n credentials)

- Perplexity API - Web research and current information
  - SDK: Perplexity HTTP API (called from n8n)
  - Auth: `PERPLEXITY_API_KEY` (server-side, n8n credentials)

- Google Gemini - Ranking analysis and insights
  - SDK: Google AI Studio API (called from n8n)
  - Auth: `GOOGLE_AI_API_KEY` (server-side, n8n credentials)

**Workflow Orchestration:**
- n8n Cloud - AI agent orchestration platform
  - Integration: Webhook-based HTTP calls from Next.js API routes to n8n workflows
  - Webhooks configured:
    - `N8N_INITIAL_ANALYSIS_WEBHOOK` - Initial ranking analysis on onboarding completion
    - `N8N_CONTENT_WRITER_WEBHOOK` - Content generation agent
    - `N8N_COMPETITOR_RESEARCH_WEBHOOK` - Competitive analysis
    - `N8N_QUERY_RESEARCHER_WEBHOOK` - Query discovery and research
    - `N8N_SCHEDULED_RANKING_WEBHOOK` - Daily ranking updates (scheduled)
    - `N8N_RECOMMENDATION_GENERATOR_WEBHOOK` - Weekly recommendation generation
  - Trigger mechanism: POST requests from API routes in `src/app/api/agents/*`
  - Implementation: Native fetch() calls with JSON payloads

**Unsplash Integration:**
- Image CDN: images.unsplash.com
  - Purpose: Marketing page images
  - Config: `next.config.ts` remote patterns allow Unsplash images

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (public, for client-side)
  - Service role: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - Database URL: `DATABASE_URL` (for migrations)
  - Client: @supabase/supabase-js v2.91.1
  - Schema location: `supabase/migrations/`
  - Tables: users, subscriptions, credits, credit_transactions, tracked_queries, rankings, content_generations, recommendations, agent_executions

**File Storage:**
- Supabase Storage (built-in to Supabase)
  - Purpose: Profile avatars, generated content files
  - Access: Through Supabase client via `storage.from()` API

**Caching:**
- React Query - In-memory caching with 5-minute stale time
  - Config: `src/lib/react-query/client.ts`
  - Stale time: 5 minutes
  - GC time: 10 minutes
  - Refetch on reconnect: enabled

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in PostgreSQL auth)
  - Implementation: Email/password authentication
  - Session handling: Cookie-based with JWT tokens
  - Middleware: `src/lib/supabase/middleware.ts` refreshes sessions on each request
  - Client: `@supabase/ssr` library for SSR support
  - Protected routes: Enforced in middleware for `/dashboard`, `/onboarding`, `/settings`
  - Redirect logic: Unauthenticated users → login, authenticated users viewing auth pages → dashboard

## Monitoring & Observability

**Error Tracking:**
- Not detected (planned for Phase 2)
- Infrastructure: Sentry DSN environment variable exists but not configured

**Logs:**
- Console logging in API routes (appears in Vercel function logs)
- Structured logging in `src/lib/api/responses.ts` with error handler wrapper
- Development: React Query DevTools in `src/lib/react-query/provider.tsx` (disabled in production)

## CI/CD & Deployment

**Hosting:**
- Vercel - Hosting for Next.js frontend and API routes
  - Deployment: Automatic on git push to main/develop branches
  - Environment variables: Configured in Vercel project settings

**Database Deployment:**
- Supabase Cloud - Managed PostgreSQL hosting

**Workflow Deployment:**
- n8n Cloud - Managed workflow platform

**CI Pipeline:**
- Not detected as separate service
- Vercel deployments trigger on git push automatically
- Build process: `npm run build` (runs TypeScript check, builds Next.js)

## Environment Configuration

**Required env vars (from `.env.example`):**

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public, exposed to client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public, exposed to client
- `SUPABASE_SERVICE_ROLE_KEY` - Secret, server-side only
- `DATABASE_URL` - Secret, for migrations

**Stripe (placeholder, not yet integrated):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public
- `STRIPE_SECRET_KEY` - Secret
- `STRIPE_WEBHOOK_SECRET` - Secret
- `STRIPE_PRICE_*` - Multiple price IDs for plans and credits

**LLM APIs:**
- `OPENAI_API_KEY` - Secret, passed to n8n
- `ANTHROPIC_API_KEY` - Secret, passed to n8n
- `PERPLEXITY_API_KEY` - Secret, passed to n8n
- `GOOGLE_AI_API_KEY` - Secret, passed to n8n

**n8n:**
- `N8N_WEBHOOK_BASE_URL` - Workspace URL
- `N8N_API_KEY` - Secret, for triggering workflows
- `N8N_*_WEBHOOK` - Individual webhook URLs for each workflow

**App:**
- `NEXT_PUBLIC_APP_URL` - Public, app domain
- `NEXT_PUBLIC_APP_NAME` - Public, app branding
- `NODE_ENV` - development/production

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Production: Vercel Environment Variables (project settings)
- CI/CD: GitHub Secrets (if using GitHub Actions in future)

## Webhooks & Callbacks

**Incoming:**
- n8n workflow completion callbacks - Not yet implemented (workflows update database directly)
- Stripe webhook endpoint - Empty directory `src/app/api/stripe/` (planned for Phase 2)

**Outgoing (API routes calling webhooks):**
- POST to n8n initial analysis webhook on onboarding completion: `src/app/api/onboarding/complete/route.ts`
- POST to content writer webhook: `src/app/api/agents/content-writer/route.ts`
- POST to competitor research webhook: `src/app/api/agents/competitor-research/route.ts`
- POST to query researcher webhook: `src/app/api/agents/query-researcher/route.ts`
- All use standard fetch() with JSON request body containing agent parameters

**Webhook Pattern (all n8n webhooks):**
```typescript
fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
```

## API Route Structure

**Authentication API:**
- GET `/api/health` - Health check endpoint
- Supabase Auth handled by middleware, not custom endpoints yet

**Query Management:**
- GET/POST `/api/queries` - List and create tracked queries
- GET/PUT/DELETE `/api/queries/[id]` - Individual query operations

**Content Generation:**
- GET/POST `/api/content` - List and create content generations
- GET/PUT/DELETE `/api/content/[id]` - Individual content operations

**Agent Operations:**
- POST `/api/agents/content-writer` - Trigger content writing workflow
- POST `/api/agents/competitor-research` - Trigger competitor analysis
- POST `/api/agents/query-researcher` - Trigger query discovery

**Credits:**
- GET `/api/credits/balance` - Get user credit balance and tier
- GET `/api/credits/transactions` - Get credit transaction history

**Dashboard:**
- GET `/api/dashboard/overview` - Get dashboard data (rankings, stats)

**Recommendations:**
- GET `/api/recommendations` - List recommendations
- GET `/api/recommendations/[id]` - Individual recommendation

**Onboarding:**
- POST `/api/onboarding/complete` - Complete onboarding (triggers initial analysis webhook)

---

*Integration audit: 2026-02-27*
