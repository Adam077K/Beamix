# CODEBASE-MAP.md — Beamix Product App

*Updated by: CEO audit — 2026-03-19*

---

## Project: Beamix (saas-platform/)

**Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS, Shadcn/UI, Supabase Auth, Paddle, Resend, Inngest, OpenRouter (LLM gateway)

---

## App Routes (src/app/)

### Auth — `(auth)/`
- `login/` — Supabase Auth login
- `signup/` — Supabase Auth signup
- `forgot-password/` — send reset email
- `reset-password/` — set new password
- `auth/callback/` — OAuth/magic link callback

### Protected Dashboard — `(protected)/dashboard/`
- `overview/` — main dashboard (scan scores, summary)
- `rankings/` — engine-by-engine ranking view
- `agents/[agent_id]/` — individual agent page (param: agent_id = snake_case type)
- `agents-hub/` — all agents overview
- `credits/` — credit balance and history
- `notifications/` — notification center
- `settings/` — 4-tab settings (business, billing, preferences, integrations)

### Public
- `scan/` — scan wizard (email-first step-by-step, anonymous)
- `pricing/` — pricing page with plan comparison
- `blog/[slug]/` — blog post viewer

### API Routes (app/api/)
- `scan/start` — fires Inngest scan event, returns 202
- `scan/free` — free scan endpoint
- `onboarding/complete` — upserts user_profiles, links free scan, fires recommendations
- `recommendations` — POST: auto-generates 4 recommendations via Claude Haiku
- `agents/execute` — starts agent job (hold credits → fire Inngest)
- `agents/status` — job status polling
- `paddle/webhooks` — Paddle billing events
- `inngest` — Inngest event handler

---

## Key Components (src/components/)

- `auth/` — login, signup, forgot-password forms
- `dashboard/` — sidebar, overview cards, rankings table, agents hub, credits display
- `onboarding/` — 4-step animated onboarding flow (464 lines)
- `scan/` — scan wizard, results display, engine score cards
- `email/` — 15+ Resend/React Email templates
- `shared/` — navbar, footer, shared UI elements
- `ui/` — Shadcn/UI primitives
- **DEPRECATED:** `landing/` — removed. Marketing lives in Framer.

---

## Core Libraries (src/lib/)

| File | Purpose |
|------|---------|
| `openrouter.ts` | **PRIMARY LLM gateway** — 2 keys (scan + agent), routes to all models |
| `scan/engine-adapter.ts` | Calls scan engines via OpenRouter |
| `scan/parser.ts` | Parses engine responses |
| `scan/scorer.ts` | Calculates visibility scores |
| `agents/llm-runner.ts` | Agent content generation via Claude Sonnet 4 |
| `agents/execute.ts` | Credit hold/confirm/release + Inngest job dispatch |
| `agents/credit-guard.ts` | RPCs: hold_credits, confirm_credits, release_credits |
| `agents/qa-gate.ts` | QA evaluation via Claude Haiku 4 |
| `agents/config.ts` | 7 agent configurations (type, prompts, output format) — **OUTDATED: rethink target is 11 MVP-1 agents per `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`. Build Lead should treat config.ts as frozen pending rewrite.** |
| `agents/mock-outputs.ts` | Mock outputs for dev/testing |
| `recommendations.ts` | Auto-generate recommendations via Claude Haiku 4 |

---

## Inngest (src/inngest/)

- `client.ts` — `new Inngest({ id: 'beamix' })`
- `functions/scan-free.ts` — processes free scans (trigger: `scan/free.started`)
- `functions/scan-manual.ts` — processes manual/paid scans (trigger: `scan/manual.started`)
- `functions/index.ts` — exports all functions
- **PLANNED (not built):** `functions/scan-scheduled.ts` — automated recurring scans for paid users

---

## Key Patterns

1. **All LLM calls → OpenRouter** — never import anthropic/openai SDK directly
2. **All scans → Inngest event-based** — API fires event, returns 202, Inngest processes async
3. **Credits → hold → confirm/release** — `hold_credits` before job, `confirm_credits` on success, `release_credits` on failure
4. **Auth → Supabase Auth** — no Clerk
5. **Payments → Paddle only** — no Stripe
6. **DB → Supabase with RLS** — all tables have row-level security
7. **Free scan import** — onboarding detects `?scan_id=` → links free_scan → creates business record → skips scan start

---

## Known Technical Debt

| Issue | Status |
|-------|--------|
| `20260318_reconciliation.sql` NOT applied to production | URGENT — credit RPCs broken in prod |
| Settings billing tab uses hardcoded data (not wired to Paddle) | Known |
| Settings integrations tab = "Coming Soon" | Intentional |
| `scan-scheduled.ts` (automated recurring scans) | Not built yet |
