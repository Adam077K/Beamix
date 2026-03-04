# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Layered N-tier architecture with clear separation between presentation, API, and data layers, built on Next.js 14 with serverless functions orchestrating LLM API calls directly.

**Key Characteristics:**
- Server-client component split with Next.js App Router for modern React patterns
- API layer built on Next.js route handlers with middleware-style error handling
- Async agent execution model: API routes call LLM APIs directly and run independently
- State management split: React Query for server state, Zustand for client UI state
- Database-enforced security through Supabase Row-Level Security (RLS)

## Layers

**Presentation Layer (Frontend):**
- Purpose: Server and client components rendering UI, form handling, real-time data fetching
- Location: `src/app/` (page routes, layouts), `src/components/` (UI components)
- Contains: Next.js pages, React components with hooks, Shadcn UI components, animations (Framer Motion)
- Depends on: React Query (data), Zustand (UI state), Supabase client (auth), custom hooks
- Used by: Browser clients accessing `/` and authenticated routes

**API Layer (Route Handlers):**
- Purpose: Authentication enforcement, input validation, business logic, database operations, external service triggering
- Location: `src/app/api/` organized by domain (queries, content, agents, credits, dashboard)
- Contains: Next.js POST/GET/PUT/DELETE handlers with error wrapping, Supabase queries, direct LLM API calls
- Depends on: `lib/api/auth.ts` (user verification), `lib/api/errors.ts` (error types), `lib/api/responses.ts` (response formatting), `lib/supabase/server.ts` (server client)
- Used by: Frontend via fetch calls, external systems via webhooks

**State Management Layer:**
- **React Query:** Server state (queries, rankings, content, credits) - cached and synchronized via `src/lib/react-query/`
- **Zustand:** Client UI state (sidebar, modals, loading states) - managed in `src/lib/zustand/stores/ui-store.ts`

**Data Access Layer:**
- Purpose: Provide authenticated clients (browser, API routes) to Supabase
- Location: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts` (auth middleware)
- Contains: Supabase client initialization with cookie-based session management
- Depends on: Supabase SDK, Next.js cookies API
- Used by: API routes, React components, hooks

**Async Agent Execution Layer:**
- Purpose: AI workflow orchestration - calling LLMs, processing results asynchronously
- Location: Next.js API routes in `src/app/api/agents/` calling LLM APIs directly
- Contains: Agent logic for content generation, competitor research, recommendations
- Depends on: LLM APIs (OpenAI, Anthropic, Perplexity, Gemini), Supabase (write results)
- Used by: Frontend triggering agent executions via POST requests to API routes

**Authentication Layer:**
- Purpose: User session verification, credit balance checks
- Location: `src/lib/api/auth.ts` (middleware), `src/lib/supabase/middleware.ts` (session refresh)
- Contains: `getAuthenticatedUser()` function throwing `UnauthorizedError` if no session
- Depends on: Supabase Auth, Next.js cookies
- Used by: All API routes that require auth

## Data Flow

**User Onboarding & Queries:**

1. User visits `/signup`, fills form (name, company, email, password)
2. Submit → `POST /api/auth/signup` (Supabase)
3. User redirected to onboarding, adds tracked queries
4. Submit → `POST /api/queries` validates input, stores in `tracked_queries` table with user_id
5. Frontend polls `GET /api/queries` via React Query hook `useQueries()`, caches result

**Content Generation (Async):**

1. User visits `/dashboard/content`, clicks "Generate"
2. Modal opens with form (topic, type, tone)
3. Submit → `POST /api/agents/content-writer`
4. API route:
   - Calls `getAuthenticatedUser()` - throws 401 if not logged in
   - Validates input (topic length, format)
   - Calls `checkCredits()` - throws 402 if insufficient
   - Inserts record in `agent_executions` table with status='pending'
   - Calls LLM APIs directly via async execution (fire-and-forget pattern)
   - Returns `{ execution_id, status: 'processing' }` immediately (202 Accepted pattern)
5. Frontend receives execution_id, starts polling `GET /api/dashboard/overview` every 5 seconds
6. When `agent_executions.status` changes to 'completed', agent has written result to `content_generations` table
7. Frontend displays result to user, deducts credits in `credit_transactions` table

**Rankings Check (Scheduled):**

1. Scheduled job triggers daily at 9 AM UTC
2. Fetches all active queries per user
3. Calls ChatGPT, Claude, Perplexity, Gemini with each query
4. Stores results in `ranking_results` table
5. Calculates `avg_ranking` per query
6. Triggers recommendation generation if thresholds met

**State Management:**

- **Server State (React Query):**
  - `useQueries()` fetches and caches `/api/queries`
  - `useDashboardData()` fetches `/api/dashboard/overview` with date range filters
  - `useCredits()` fetches `/api/credits/balance`
  - Mutations invalidate cache to refresh on mutation success

- **Client State (Zustand):**
  - `useUIStore()` manages sidebar open/close, modal visibility, global loading states
  - Not persisted to localStorage (reset on page refresh)

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
- Pattern: Each hook uses React Query's `useQuery()` and `useMutation()`, handles auth token in fetch headers, returns `{ data, isLoading, error, mutations }`

**Supabase Client Abstraction:**
- Purpose: Provide different client instances for different contexts
- Examples: `createClient()` from `src/lib/supabase/client.ts` (browser), `createClient()` from `src/lib/supabase/server.ts` (API routes)
- Pattern: Browser client handles cookie-based auth, server client uses same but with explicit cookie management

## Entry Points

**Web Application:**
- Location: `src/app/page.tsx` (marketing homepage)
- Triggers: Browser GET request to `/`
- Responsibilities: Render landing page with CTA to signup

**Authentication Pages:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`
- Triggers: Browser navigation to `/login`, `/signup`
- Responsibilities: Render auth forms, call Supabase auth methods

**Protected Dashboard:**
- Location: `src/app/(protected)/dashboard/page.tsx` and child routes
- Triggers: Browser navigation to `/dashboard/*` (redirects to `/login` if not authenticated)
- Responsibilities: Render dashboard with sidebar, fetch and display user data

**API Health Check:**
- Location: `src/app/api/health/route.ts`
- Triggers: External monitoring tools or health checks
- Responsibilities: Return 200 status to confirm API availability

**Query Management:**
- Location: `src/app/api/queries/route.ts`, `src/app/api/queries/[id]/route.ts`
- Triggers: Frontend via `useQueries()` hook or direct fetch calls
- Responsibilities: CRUD operations on `tracked_queries` table with user_id filtering

**Agent Endpoints:**
- Location: `src/app/api/agents/{content-writer,query-researcher,competitor-research}/route.ts`
- Triggers: Frontend form submissions triggering async content generation
- Responsibilities: Validate input, check credits, create execution record, execute agent via LLM API calls

**Webhooks:**
- Location: Not yet implemented, would be at `src/app/api/paddle/webhooks`
- Triggers: Paddle events
- Responsibilities: Verify webhook signature, update database state based on external events

## Error Handling

**Strategy:** Custom error classes with semantic HTTP status codes and error codes, wrapped handlers catching and formatting errors.

**Patterns:**

1. **Authentication Errors:**
   - `UnauthorizedError` (401) thrown by `getAuthenticatedUser()` if no session
   - Caught by `withErrorHandler()`, returned as `{ success: false, error: { code: 'UNAUTHORIZED' } }`
   - Frontend redirects to `/login` on 401 response

2. **Validation Errors:**
   - `BadRequestError` (400) thrown in API routes for invalid input (length, format, duplicates)
   - Message includes specific validation failure: "Query text must be at least 10 characters"
   - Frontend displays to user

3. **Credit Errors:**
   - `InsufficientCreditsError` (402) thrown by `checkCredits()` if balance < required
   - Includes required credits in message
   - Frontend shows "Upgrade" CTA

4. **Database Errors:**
   - Generic `Error` thrown with message from Supabase
   - `withErrorHandler()` catches and returns 500 with "Internal server error"
   - Development mode includes stack trace in response

5. **Async Processing Errors:**
   - Agent execution errors are logged in `agent_executions` table (status='failed', error_message)
   - Frontend polls and displays error to user
   - No error response sent to frontend (since API returned 202)

## Cross-Cutting Concerns

**Logging:** `console.error()` and `console.log()` statements in API routes. No structured logging library. Logs appear in Vercel function logs.

**Validation:**
- Frontend: React Hook Form with Zod (via `resolvers: zodResolver()`)
- API: Manual validation in route handlers (string length, enum values, format checks)
- Supabase: Database constraints (NOT NULL, CHECK clauses, foreign keys)

**Authentication:**
- Frontend: Supabase session via JWT in cookies (automatic with `@supabase/ssr`)
- API: Session verification in `getAuthenticatedUser()` using `supabase.auth.getUser()`
- Database: RLS policies enforce user_id matching - even with stolen JWT, users can only access own data

**Authorization:**
- No explicit authorization checks (no roles/permissions)
- All users see dashboard and can generate content (unless insufficient credits)
- Database RLS policies prevent users seeing other users' data via direct queries

**Data Encryption:**
- Passwords encrypted by Supabase Auth
- LLM API keys stored in environment variables
- Database connections over TLS to Supabase cloud

**Rate Limiting:**
- Not implemented in code (would be in Vercel Function Layer or API middleware)
- Paddle handles payment rate limiting
- LLM provider rate limits apply per API key

