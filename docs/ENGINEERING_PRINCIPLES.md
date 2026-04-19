# Engineering Principles

> The coding standards, conventions, and workflow rules that every engineer on this project follows without exception.

<!--
AGENT INSTRUCTIONS
Agent: build-lead (owns this document) | code-reviewer (enforces and updates based on audit findings)
When:
  - Created at project start by build-lead based on stack choices in CLAUDE.md
  - Updated when a new tech stack decision is made — add to Tech Stack Decisions table
  - Code Reviewer updates Code Conventions when patterns drift from what's written here
  - Any agent can flag a gap; build-lead resolves it with an edit
How:
  1. Every entry must be a hard rule or a firm default — avoid "consider" or "try to"
  2. When a principle is violated in review, cite the specific numbered rule
  3. Tech Stack Decisions rationale must be honest — if it was convenience, say so
  4. Keep Performance and Security Standards measurable, not aspirational
-->

## Core Principles

1. **Correctness before cleverness.** Code that is obviously correct beats code that is impressively compact. Optimize for the next engineer reading it.
2. **No placeholders in production.** `TODO`, `FIXME`, `return null` stubs, and empty handlers are bugs, not drafts. Every function either does its job or throws a typed error.
3. **Fail loudly at the boundary.** Validate all external input (API requests, forms, env vars) with Zod at entry points. Inside the system, trust the types.
4. **Server first.** Default to React Server Components and server-side data fetching. Move to the client only when interactivity or browser APIs require it.
5. **Explicit over implicit.** Name things for what they do. Avoid magic, hidden side effects, or behavior that surprises readers.
6. **One source of truth.** Types, constants, and config live in one place and are imported everywhere else. Never copy-paste logic across files.
7. **Every async op has an error path.** Happy-path-only code is incomplete code. Network calls, DB queries, and file operations must handle failures explicitly.
8. **No N+1 queries.** Fetch related data with joins or batch calls. Loops that trigger individual DB queries are a deployment blocker.

---

## Tech Stack Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Frontend | Next.js 16 App Router, TypeScript strict, Tailwind CSS, Shadcn/UI | App Router enables RSC + streaming; strict TS catches schema drift early; Shadcn gives owned, editable components |
| Auth | Supabase Auth | Avoids an extra vendor — Supabase handles both auth and DB. RLS policies use the auth identity directly. |
| Database | Supabase (Postgres with RLS) | Managed Postgres + built-in auth + Realtime + Storage in one platform. RLS enforces row-level ownership at DB layer. |
| Payments | Paddle | Merchant of record model — Paddle handles EU VAT, global tax compliance. Better for international B2B SaaS than Stripe. |
| Email | Resend + React Email | React Email lets templates be typed, testable components. Resend has reliable deliverability and a simple API. |
| Background Jobs | Inngest | Event-driven, serverless step functions with built-in retry, concurrency control, and observability dashboard. No Redis/BullMQ infra to manage. |
| LLM Gateway | OpenRouter (2 keys: scan vs agent) | Unified billing across providers. Two keys: OPENROUTER_SCAN_KEY (scans) and OPENROUTER_AGENT_KEY (agents/QA). **Approved models only:** Claude (Sonnet 4.6, Haiku 4.5, Opus 4.6), GPT (4o, 4o-mini, GPT-5-mini), Gemini (2.0 Flash, 2.5 Pro), Perplexity (Sonar, Pro, Online). **Banned:** DeepSeek, Qwen, other providers. |
| Hosting | Vercel | Zero-config Next.js deployment, edge functions, preview environments, Vercel Analytics included. |

---

## Code Conventions

### Language & Types

- TypeScript strict mode is non-negotiable. `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess` all enabled.
- No `any`. No `as unknown as X`. Use proper type narrowing or a well-typed assertion function.
- Prefer `type` over `interface` for object shapes; use `interface` only when declaration merging is intentional.
- All external input validated with Zod schemas. Export the schema alongside the inferred type: `export type Foo = z.infer<typeof FooSchema>`.

### Naming

- **Files:** `kebab-case.ts` — always. Component files: `kebab-case.tsx`.
- **Components:** `PascalCase` — matches the export name exactly.
- **Functions & variables:** `camelCase`.
- **Constants:** `SCREAMING_SNAKE_CASE` for module-level compile-time constants.
- **Database columns:** `snake_case` — matches Postgres convention. Map to camelCase in app layer.
- **Zod schemas:** suffix with `Schema`, e.g. `UserSchema`. Inferred types drop the suffix: `User`.

### File Structure

```
apps/web/src/
  app/                  # Next.js App Router pages and layouts
    (route-group)/      # Parenthesized groups for layout sharing
  components/           # Shared UI components (no business logic)
    ui/                 # Shadcn/UI primitives — do not edit directly
  features/             # Feature-scoped modules (components + logic co-located)
    [feature-name]/
      components/
      hooks/
      actions.ts        # Server Actions for this feature
      types.ts
  lib/                  # Utility functions, clients, shared helpers
    supabase/           # Supabase client + typed DB helpers
  types/                # Global types shared across features
packages/               # Shared UI / config packages (reserved, currently empty)
```

---

## Git Workflow

### Branch Naming

```
feat/[short-description]     # New feature
fix/[short-description]      # Bug fix
refactor/[short-description] # Refactor, no behavior change
chore/[short-description]    # Config, deps, tooling
test/[short-description]     # Test-only changes
```

### Commit Format (Conventional Commits)

```
type(scope): concise present-tense description

- bullet: what changed and why (not what the code does)
- bullet: second change if needed
```

Types: `feat` | `fix` | `refactor` | `test` | `chore` | `docs`
Scope: the feature or module name, e.g., `auth`, `billing`, `dashboard`

### PR Process

1. Branch from `main`. Work in a worktree (see `CLAUDE.md` Git Worktree Protocol).
2. All commits must be atomic — one logical change per commit.
3. PR description must include: what changed, why, how to test, and any migration steps.
4. Code Reviewer agent reviews before merge. QA Lead runs E2E before merge.
5. Squash merge to `main`. Delete branch after merge.
6. TypeScript must pass (`pnpm -F @beamix/web typecheck`) before merge. No type errors in CI.

---

## Testing Strategy

| Layer | Tool | Coverage Target | What to Test |
|-------|------|----------------|--------------|
| Unit | Vitest | 80% of business logic | Pure functions, transformations, validation schemas, state machines |
| Integration | Vitest + Supabase local | All API routes + server actions | API routes, server actions, DB queries with real data |
| E2E | Playwright | All critical user paths | Sign up, free scan, inbox approve, payment flow, error states |

**TDD rule:** Any function that can be expressed as `expect(fn(input)).toBe(output)` must have a test written before the implementation.

**What not to test:** UI layout, third-party library internals, one-liner wrappers around well-tested libs.

---

## Performance Standards

| Metric | Target | Tool |
|--------|--------|------|
| Core Web Vitals LCP | < 2.5s | Vercel Analytics / Lighthouse |
| Core Web Vitals CLS | < 0.1 | Vercel Analytics / Lighthouse |
| Core Web Vitals INP | < 200ms | Vercel Analytics / Lighthouse |
| API p99 response time | < 500ms | Vercel Analytics |
| DB query time (p95) | < 100ms | Supabase dashboard |
| JS bundle size (initial) | < 200KB gzipped | Next.js bundle analyzer |

**Mandatory:** Run `pnpm -F @beamix/web build` and check bundle output before every PR. Flag any chunk above 200KB to build-lead.

---

## Security Standards

- **Authentication:** All non-public routes protected at middleware level. Never rely on client-side auth checks alone.
- **Authorization:** Row-level security (RLS) enabled on all Supabase tables that contain user data. Test RLS policies in integration tests.
- **Input validation:** Zod on every API route and server action. Reject before processing.
- **Secrets:** Only via `process.env`. Validated with Zod at startup. Never hardcoded, never logged, never sent to the client.
- **Dependencies:** `pnpm audit` runs in CI. No high/critical vulnerabilities in production deps.
- **SQL injection:** Parameterized queries only. No string interpolation in SQL.
- **XSS:** Never use `dangerouslySetInnerHTML`. Use `rehype-sanitize` on all user-generated or agent-generated markdown before rendering.
- **SSRF:** Validate all user-supplied URLs before making server-side requests. Block internal IP ranges.
- **Prompt injection:** Sanitize business profile fields before injecting into LLM prompts.
- **Webhooks:** Verify HMAC signatures on all inbound webhooks (Paddle, Inngest).
- **Rate limiting:** Apply per-user rate limits on all public API routes and the /scan form.
- **Cost circuit breaker:** Hard-stop LLM spend if hourly cost exceeds threshold. Configured in Inngest budget-guard function.

---

_Last updated: 2026-04-19 | Updated by: technical-writer_

*Historical build plan archived to docs/_archive/2026-03-19_engineering-build-plan.md*
