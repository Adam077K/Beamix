# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**AI Models (called directly from Next.js API routes):**
- OpenAI GPT-4o - Content generation, quality checking
  - SDK: OpenAI API (server-side)
  - Auth: `OPENAI_API_KEY` (server-side env var)

- Anthropic Claude Opus 4.5 - Content writing, research
  - SDK: Anthropic API (server-side)
  - Auth: `ANTHROPIC_API_KEY` (server-side env var)

- Perplexity API - Web research and current information
  - SDK: Perplexity HTTP API (server-side)
  - Auth: `PERPLEXITY_API_KEY` (server-side env var)

- Google Gemini - Ranking analysis and insights
  - SDK: Google AI Studio API (server-side)
  - Auth: `GOOGLE_AI_API_KEY` (server-side env var)

**AI Agent Orchestration:**
- Direct LLM integration via Next.js API routes — no external workflow tools
  - Agent endpoints in `src/app/api/agents/*` call LLM APIs directly
  - Trigger mechanism: POST requests from frontend to API routes
  - Implementation: Native fetch() calls to LLM provider APIs with JSON payloads

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

**Paddle (placeholder, not yet integrated):**
- `NEXT_PUBLIC_NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` - Public
- `PADDLE_API_KEY` - Secret
- `PADDLE_WEBHOOK_SECRET` - Secret
- `PADDLE_PRICE_*` - Multiple price IDs for plans and credits

**LLM APIs:**
- `OPENAI_API_KEY` - Secret, used in API routes
- `ANTHROPIC_API_KEY` - Secret, used in API routes
- `PERPLEXITY_API_KEY` - Secret, used in API routes
- `GOOGLE_AI_API_KEY` - Secret, used in API routes

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
- Paddle webhook endpoint - Empty directory `src/app/api/paddle/` (planned for Phase 2)

**Outgoing (API routes calling LLM APIs):**
- Agent execution on onboarding completion: `src/app/api/onboarding/complete/route.ts`
- Content writer agent: `src/app/api/agents/content-writer/route.ts`
- Competitor research agent: `src/app/api/agents/competitor-research/route.ts`
- Query researcher agent: `src/app/api/agents/query-researcher/route.ts`
- All call LLM provider APIs directly via fetch() with JSON payloads

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
