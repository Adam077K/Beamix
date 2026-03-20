# Patterns

Approved architectural patterns, anti-patterns, and reusable building blocks for this codebase.

<!-- Agent: build-lead + code-reviewer | When: Project initialization, after a major architectural decision, or when a pattern is proven stable and worth standardizing | Instructions: Approved Patterns must each have a concrete code example — abstract descriptions are insufficient. Anti-Patterns must explain WHY it is forbidden, not just that it is. When adding a pattern, verify it is already used in the codebase before marking it approved. If a pattern is under evaluation, mark it "Proposed" not "Approved". -->

---

## Approved Patterns

### Server Components by Default

**When to use:** Any component that does not need browser APIs, event listeners, or React hooks that manage client state.

**Example:**

```tsx
// app/dashboard/page.tsx — Server Component (no 'use client')
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: projects } = await supabase.from('projects').select('*')

  return <ProjectList projects={projects ?? []} />
}
```

---

### Zod Validation at Every Trust Boundary

**When to use:** All external input — API route bodies, Server Action arguments, URL params, environment variables, third-party webhook payloads.

**Example:**

```ts
// lib/schemas/project.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
```

---

### Server Actions for Mutations

**When to use:** All data mutations from the client — form submissions, button actions, optimistic updates.

**Example:**

```ts
// app/projects/actions.ts
'use server'
import { createProjectSchema } from '@/lib/schemas/project'
import { createClient } from '@/lib/supabase/server'

export async function createProject(input: unknown) {
  const validated = createProjectSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() }
  }
  const supabase = createClient()
  const { data, error } = await supabase.from('projects').insert(validated.data).select().single()
  if (error) return { success: false, error: { code: 'DB_ERROR', message: error.message } }
  return { success: true, data }
}
```

---

### _[Pattern Name — add more as needed]_

**When to use:** _[Situation that calls for this pattern]_

**Example:**

```ts
// _[file path]_
_[code example]_
```

---

## Anti-Patterns

### No `any` Types

**Why forbidden:** `any` disables TypeScript's type checker for the annotated value and everything that flows through it. Bugs that TypeScript would catch at compile time become runtime failures. Use `unknown` + type narrowing, or define a proper type.

```ts
// Wrong
function processData(data: any) { ... }

// Correct
function processData(data: unknown) {
  const validated = mySchema.parse(data)
  // now validated is fully typed
}
```

---

### No N+1 Queries

**Why forbidden:** A query inside a loop makes one DB round-trip per item. At 100 items, that is 100 round-trips. This causes visible latency at scale and can saturate connection pools.

```ts
// Wrong — 1 query per user
const users = await getUsers()
for (const user of users) {
  const profile = await getProfile(user.id) // N+1
}

// Correct — 1 query, JOIN or batch fetch
const usersWithProfiles = await supabase
  .from('users')
  .select('*, profiles(*)')
```

---

### No Secrets in Code

**Why forbidden:** Secrets committed to git are permanently exposed in history even if later removed. Rotate any secret that touches source control.

```ts
// Wrong
const client = createClient('https://xyz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6...')

// Correct
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

### No Unhandled Async Operations

**Why forbidden:** Unhandled promise rejections crash the process in Node.js and silently swallow errors in the browser, making bugs invisible.

```ts
// Wrong
async function handleClick() {
  await saveData() // what if this throws?
}

// Correct
async function handleClick() {
  try {
    await saveData()
  } catch (error) {
    toast.error('Failed to save. Please try again.')
    reportError(error)
  }
}
```

---

### _[Anti-pattern name — add more as needed]_

**Why forbidden:** _[Concrete explanation of the failure mode it causes]_

---

## Reusable Components / Utilities

| Name | Location | Purpose | Usage |
|------|----------|---------|-------|
| _[ComponentName]_ | `_[path]_` | _[What it does]_ | `_[import + usage example in 1 line]_` |
| _[utilityName]_ | `_[path]_` | _[What it does]_ | `_[import + usage example in 1 line]_` |
| _[ComponentName]_ | `_[path]_` | _[What it does]_ | `_[import + usage example in 1 line]_` |
| _[utilityName]_ | `_[path]_` | _[What it does]_ | `_[import + usage example in 1 line]_` |

---

## Data Fetching Patterns

_[Describe the approved data fetching approach for each context. Be specific about which library or mechanism is used and where.]_

**In Server Components (default):**
_[e.g. Direct Supabase server client. No SWR or React Query — data is fetched at render time, server-side.]_

```tsx
const supabase = createClient() // lib/supabase/server.ts
const { data } = await supabase.from('table').select('*')
```

**In Client Components (when realtime or user-triggered refetch is needed):**
_[e.g. SWR for client-side fetching. Only used when server rendering is not feasible.]_

```tsx
const { data, error, mutate } = useSWR('/api/resource', fetcher)
```

**Mutations:**
_[e.g. Server Actions — see Approved Patterns above.]_

---

## Authentication Patterns

_[Describe how auth state is accessed server-side and client-side, and how protected routes are enforced.]_

**Server-side auth check:**

```ts
// In Server Components or API routes
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) redirect('/sign-in')
```

**Client-side auth check:**

```tsx
import { useUser } from '@clerk/nextjs'

const { user, isLoaded } = useUser()
if (!isLoaded) return <Skeleton />
if (!user) return <RedirectToSignIn />
```

**Middleware (route protection):**
_[e.g. `middleware.ts` at root uses Supabase Auth middleware to protect all routes under `(app)/` route group.]_

---

## Error Boundary Patterns

_[Describe where error boundaries are placed and how they behave.]_

**Route-level errors:** Next.js `error.tsx` files catch rendering errors within a route segment.

```tsx
// app/dashboard/error.tsx
'use client'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong loading the dashboard.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Component-level errors:** _[e.g. Use React's ErrorBoundary class component or a library like react-error-boundary for non-route UI sections that should degrade gracefully.]_

**Async Server Component errors:** _[e.g. Wrap in try/catch and render an inline error state — do not let the error propagate to the route-level error.tsx unless it is truly unrecoverable.]_

---

_Last updated: — | Updated by: —_


---

## Technical Concerns & Anti-Patterns

# Codebase Concerns

> **Last synced:** March 2026 — aligned with 03-system-design/
> **Note:** System Design v2.1 (March 2026) addresses many concerns below. Items marked RESOLVED were closed in that release. See `docs/03-system-design/ARCHITECTURE.md`.

## Tech Debt

**~~Fire-and-Forget Agent Calls~~ — RESOLVED by Inngest:**
- **Resolution:** All async agent/scan work now runs in Inngest functions with built-in retry, concurrency control, and step-level observability. API routes emit events and return 202.
- Remaining risk: Verify that NO agent logic remains in Next.js API route handlers — all agent execution must be in `src/inngest/` functions.

**~~Incomplete Paddle Integration~~ — RESOLVED:**
- Paddle webhooks implemented at `src/app/api/billing/webhooks/route.ts`
- Paddle is the only payment provider (no Stripe)

**LLM Cost at Scale (from System Design v2.1 section 5.4):**
- Risk: At 1,000 paying businesses, LLM costs estimated at **$15,000-$25,000/month**
- Breakdown: Scan operations $8K-14K/mo (5 Haiku parse calls per response), agent executions $2K-5K/mo, chat $200-500/mo
- Minimum ARPU needed: $15-25 across paid tiers to maintain healthy margins
- Free tier scans are loss leaders — budget must stay <5% of total LLM spend
- Mitigations: prompt caching, Perplexity query scaling, model right-sizing (Gemini Flash for bulk, Haiku for parsing), budget gates per user/tier
- Action: Re-validate cost estimates at 100, 500, and 1,000 paying customers

**Browser Simulation Deferred (Phase 3):**
- Copilot, AI Overviews, Meta AI require browser simulation — reliability is low
- Deferred to Phase 3 (after launch). Phase 1 covers ChatGPT/Gemini/Perplexity/Claude via API
- Risk: Competitors may close the gap in browser-accessible engines before Phase 3 ships

**Paddle Webhook Idempotency:**
- Risk: Paddle may retry webhook delivery, causing duplicate subscription updates or credit allocations
- Mitigation needed: Store processed webhook event IDs and skip duplicates
- Inngest handles retries for background work, but webhook handler itself must be idempotent

**Missing Environment Variable Validation:**
- Issue: Environment variables accessed with `!` (non-null assertion) without validation at startup
- Impact: App starts even if critical env vars are missing. Crashes at runtime.
- Fix: Create `src/lib/config/validate-env.ts` with Zod validation, run at app startup

**Complex Component Files:**
- Several components exceed 400+ lines mixing business logic with UI
- Files: `AnimatedDashboard.tsx` (777 lines), `scan-results-client.tsx` (940 lines), `signup-form.tsx` (485 lines)
- Fix: Extract into smaller components and custom hooks

## Known Bugs

**Onboarding Workflow Trigger:**
- The `onboarding/complete` API route must emit the `onboarding/complete` Inngest event
- This triggers the "New Business Onboarding" workflow: A13 + A14 + A11 (parallel) -> A4 -> notify
- Verify this event is correctly emitted and the workflow is registered in Inngest

**Missing Query Ownership Verification in Some Routes:**
- Some API routes don't verify user owns the resource before returning data
- Low risk (RLS policies catch this), but defense-in-depth best practice not followed everywhere
- Audit all GET endpoints to ensure `eq('user_id', user.id)` is always applied

**Potential Date Calculation Bug:**
- Monthly credit reset date calculation may be incorrect for months with different day counts
- Fix: Use date arithmetic library (date-fns) that handles month boundaries correctly

## Security Considerations

**Rate Limiting (Not Yet Implemented):**
- System design specifies per route, per user, per tier, per IP rate limiting
- Currently relies on Vercel's built-in protections and Inngest concurrency limits
- Must implement before launch — especially on `/api/scan/start` and `/api/agents/[agentType]/execute`

**Credit System Race Conditions:**
- Credit balance check is soft, not transactional
- Must implement optimistic locking on credits table: check + atomically decrement
- Inngest concurrency limits (3 per user) provide partial mitigation

**Insufficient Input Validation on Onboarding:**
- Website URL and company name are user-supplied but may contain XSS or injection vectors
- Fix: Use Zod schema validation on API route, sanitize HTML in company_name

**Error Response Information Disclosure:**
- Error messages may expose internal database schema in development mode
- Fix: Implement error ID tracking, return ID to client, log full details server-side

## Performance Bottlenecks

**Dashboard Data Query:**
- Dashboard overview query may fetch all data regardless of selected date range, filtering in application code
- Fix: Apply date range filter at database level + composite index on (user_id, created_at)

**React Query Polling:**
- Credits balance refetched every 5 minutes even if unchanged
- Fix: Use Supabase Realtime subscriptions instead of polling for live data

**Large Animated Component Rendering:**
- AnimatedDashboard uses requestAnimationFrame with state updates — causes full re-render per frame
- Fix: CSS animations or memoized sub-components with `will-change: transform`

## Fragile Areas

**Authentication State Management:**
- Files: `src/lib/supabase/middleware.ts`, `src/middleware.ts`
- Middleware reads session on every request. Silent refresh failure logs user out.
- Cookie-based session may have race conditions with concurrent requests.

**Credit System (Transactional Integrity):**
- Pattern: hold/confirm/release
- Users NEVER charged for failed agent executions
- Inngest step retries must NOT re-hold credits — credit hold must be idempotent
- No existing tests for concurrent credit scenarios — HIGH PRIORITY

**Data Consistency at Signup:**
- `handle_new_user` DB trigger must exist in migrations — creates `user_profiles`, `subscriptions`, `notification_preferences` rows atomically
- Migration: `supabase/migrations/20260302_signup_trigger.sql`
- Risk: If trigger missing, onboarding infinite loop occurs

## Scaling Limits

**Inngest Concurrency:**
- agent.execute: max 3 per user, 20 system-wide
- workflow.execute: max 5 total, 1 per user
- scan.free: 25 system-wide
- scan.scheduled: 50 system-wide (hourly cron batches)
- Monitor Inngest dashboard for queue depth and step failures

**Database Connection Pool:**
- Depends on Supabase plan tier
- Monitor connection count; upgrade plan or add PgBouncer if hitting limits

**LLM API Concurrency:**
- Rate limits per provider during peak hours
- Inngest concurrency controls provide queue management
- Show user queue position if waiting

## Dependencies at Risk

**Supabase SDK (^2.91.1):**
- Major version updates may break auth/RLS behavior
- Pin to minor version until tested

**Next.js 16:**
- New major version, edge cases still being discovered
- Pin to 16.1.4 (current stable patch)

**Framer Motion (^12.29.0):**
- Version updates may change animation timing
- Keep current version, only update for critical fixes

## Test Coverage Gaps

**HIGH PRIORITY (must test before launch):**
- API authentication — unauthorized requests properly rejected on all endpoints
- Credit deduction transactions — concurrent requests, race conditions
- Paddle webhook handling — signature verification, idempotency, subscription state transitions
- Supabase RLS policies — users cannot access other users' data

**MEDIUM PRIORITY:**
- Date range filtering on dashboard
- Inngest function retry behavior (credit hold idempotency)
- Content publish flow (agent output -> review -> CMS)

---

*Concerns audit: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*
