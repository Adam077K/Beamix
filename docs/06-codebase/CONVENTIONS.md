# Coding Conventions

> **Last synced:** March 2026 — aligned with 03-system-design/

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension
  - Example: `MetricsCard.tsx`, `QueryTable.tsx`, `RankingChart.tsx`
- API routes: kebab-case directories with `route.ts` files
  - Example: `/api/queries/route.ts`, `/api/credits/balance/route.ts`
- Utilities and hooks: camelCase with `.ts` or `.tsx` extension
  - Example: `useQueries.ts`, `useDashboardData.ts`, `index.ts`
- Inngest functions: kebab-case with `.ts` extension
  - Example: `scan-free.ts`, `agent-execute.ts`, `workflow-execute.ts`

**Functions:**
- camelCase for all functions
  - Regular functions: `formatDate()`, `getRankingChange()`, `truncate()`
  - Handlers: `handleGet()`, `handlePost()`, `handleDelete()`
  - Hooks: `useQueries()`, `useCreditsBalance()`, `useDashboardData()`
  - Utilities: `cn()`, `formatCurrency()`, `getInitials()`

**Variables:**
- camelCase for local variables and constants
- UPPER_SNAKE_CASE for true constants (rarely used)
- snake_case only for database column names and object keys matching database schema

**Types:**
- PascalCase for all TypeScript types and interfaces
  - Example: `MetricsCardProps`, `TrackedQuery`, `AuthenticatedUser`, `SuccessResponse<T>`
- Union types use string literals: `'high' | 'medium' | 'low'`

## Code Style

**Formatting:**
- ESLint enforces code style using `eslint-config-next` and `eslint-config-next/typescript`
- No Prettier config; ESLint rules are primary style guide
- Indentation: 2 spaces
- Line length: No strict limit enforced

**TypeScript:**
- Strict mode enabled: `"strict": true` in `tsconfig.json`
- No `any` types allowed without justification
- No `as unknown as` escape hatches
- `noEmit: true` — TypeScript used for type checking only, compilation via Next.js
- Path aliases: `@/*` maps to `./src/*`

**Zod:**
- Import from `zod/v4` (Zod v4 syntax)
- Zod validation on EVERY API endpoint — no exceptions
- Use Zod for environment variable validation at startup

## Architecture Rules

**Server Components by default:**
- Client Components (`'use client'`) only when interactivity is required (forms, state, event handlers, browser APIs)
- Server Components for data fetching, static rendering, layout

**All scan + agent work in Inngest functions:**
- API routes NEVER call LLM APIs directly
- API routes emit Inngest events and return 202
- All LLM pipelines, retries, and concurrency in `src/inngest/` functions

**No raw SQL from client:**
- All queries via Supabase client with RLS enforced
- Service role key only in Inngest functions + webhook handlers

**Credit system:**
- Hold/confirm/release pattern
- Hold credit on job start, confirm on success, release on failure
- Users never charged for failed agent executions
- Credit hold must be idempotent (Inngest step retries must not re-hold)

**Credential encryption:**
- AES-256-GCM for integration credentials (WordPress, GA4, GSC, Slack, Cloudflare)
- SHA-256 hashing for API keys
- LLM API keys in environment variables only

**No N+1 queries:**
- Always batch or join
- Apply date range filters at database level, not in application code

## Import Organization

**Order:**
1. React and Next.js imports
2. Third-party library imports
3. Local absolute imports (using `@/` alias)
4. Type imports (use `import type` for types only)

**Path Aliases:**
- `@/*` = `./src/*` — Used exclusively for all local imports

## Error Handling

**API Routes:**
- Use `withErrorHandler()` wrapper for consistent error handling
- Pattern: `export const GET = withErrorHandler(handleGet)`
- Throw custom error classes: `UnauthorizedError` (401), `BadRequestError` (400), `InsufficientCreditsError` (402), `NotFoundError` (404), `ForbiddenError` (403)
- `errorResponse()` converts exceptions to JSON with status codes
- Development mode includes stack traces; production hides them

**Frontend:**
- React Query handles async errors with `error` state in hooks
- Components check `isLoading` and `error` states
- Error boundaries for unexpected failures

**Inngest Functions:**
- Use `step.run()` for each retryable operation
- Failed steps retry automatically (configurable retry count)
- On final failure: release held credits, update job status to 'failed'

## API Response Format

**Success:**
```typescript
{
  success: true,
  data: T,
  meta: { timestamp: "2026-03-01T..." }
}
```

**Error:**
```typescript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE_STRING"
  },
  meta: { timestamp: "2026-03-01T..." }
}
```

## React Component Patterns

**Functional Components:**
- Always functional components with hooks, no class components
- Use `'use client'` directive for client-side components
- Server Components (no directive) when possible for performance

**Component Structure:**
```typescript
// 1. Imports (organized as above)
// 2. Interface definitions
// 3. Component function
// 4. Hooks at top of function body
// 5. Event handlers
// 6. Render logic
```

**Props:**
- Define interface/type for all component props
- Name interfaces as `{ComponentName}Props`
- Use destructuring in function signature

## Database Patterns

**Column Naming:**
- snake_case for all database columns (PostgreSQL convention)

**Critical DB Conventions (from System Design v2.1):**
- Use `scan_id` everywhere (NOT `scan_token`)
- Table: `scan_engine_results` (NOT `scan_engine_responses`)
- Table: `agent_jobs` (NOT `agent_executions`)
- Table: `content_items` (NOT `content_generations`)
- Table: `credit_pools` (NOT `credits`)
- Table: `user_profiles` (NOT `customers` or `users`)
- `subscription_status` enum: `'cancelled'` (UK spelling — NOT `'canceled'`)
- `plan_tier` enum: `'starter' | 'pro' | 'business'` — NO `'free'` value (free tier = null subscription)
- `agent_type` enum: `'competitor_intelligence'` (NOT `'competitor_research'`), `'faq_agent'` (NOT `'query_researcher'`)
- `sentiment_score`: integer 0-100 (NOT an enum)
- `content_output_format`: `'json_ld'`, `'plain_text'`, `'structured_report'` (NOT `'json-ld'` or `'json'`)
- `credit_transactions.transaction_type`: use `'topup'` (NOT `'bonus'`)

## State Management

**React Query (Server State):**
- Primary tool for API data fetching and caching
- Default: 5-minute staleTime, 10-minute gcTime
- Queries: `refetchOnWindowFocus: false`, `refetchOnReconnect: true`
- Mutations: 1 retry default

**Zustand (Client State):**
- UI-only state (modals, sidebar, loading messages)
- Store in `lib/zustand/stores/`
- Simple create/set pattern, no complex middleware

---

*Convention analysis: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*
