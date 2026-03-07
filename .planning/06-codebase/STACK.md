# Technology Stack

> **Last synced:** March 2026 — aligned with 03-system-design/

**Source of truth:** `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` section 4.1

## Languages

**Primary:**
- TypeScript 5.x — Entire codebase with strict mode enabled
- JavaScript (JSX/TSX) — React components, server components

**Secondary:**
- SQL — Database schema and migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js 20.x LTS (specified in package.json as compatible)

**Package Manager:**
- npm
- Lockfile: npm-lock.json

## Frameworks

**Core:**
- Next.js 16.1.4 — App Router (not Pages Router), React 19 SSR, API routes
- React 19.2.3 — UI library with strict TypeScript support
- React DOM 19.2.3 — DOM rendering

**Authentication:**
- Supabase Auth (built-in to Supabase) — Managed authentication service
- @supabase/ssr 0.8.0 — Server-side rendering auth helper
- Custom middleware in `src/lib/supabase/middleware.ts` for session updates

**State Management:**
- React Query (@tanstack/react-query) 5.90.21 — Server state (rankings, queries, credits)
- Zustand 5.0.11 — Client state (UI: sidebar, modals, loading states)
- React Hook Form 7.71.1 — Form state management with validation

**UI & Styling:**
- Tailwind CSS 4.x — Utility-first CSS framework (CSS-based config via `@tailwindcss/postcss`, no tailwind.config.ts)
- Shadcn/ui components — Headless UI built on Radix UI
- Lucide React 0.563.0 — Icon library
- Framer Motion 12.29.0 — Animation library
- Recharts 3.7.0 — Charting library for rankings/analytics

**Forms & Validation:**
- Zod 4.3.6 — Runtime schema validation (import from `zod/v4`)
- @hookform/resolvers 5.2.2 — Bridge between React Hook Form and Zod
- Class Variance Authority 0.7.1 — CSS class composition

**Background Jobs:**
- Inngest — Event-driven background job orchestration for scans, agents, crons, workflows
  - SDK: `inngest` (server-side)
  - Serve endpoint: `/api/inngest`
  - 14 functions: scan.free, scan.scheduled, scan.manual, agent.execute, workflow.execute, alert.evaluate, 8 cron functions
  - NOT n8n — Inngest is the only background job system

**Billing:**
- Paddle — Subscriptions, webhooks, billing portal (NOT Stripe — Stripe was fully removed 2026-03-02)
  - SDK: Paddle Node SDK
  - Client token: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
  - Server: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`

**Email:**
- Resend — Transactional + marketing email delivery
  - SDK: `resend` (server-side)
  - Auth: `RESEND_API_KEY`
- React Email — Email template components (15 templates)

**LLM APIs:**
- OpenAI GPT-4o — QA gate, fact checking, content generation
  - Auth: `OPENAI_API_KEY`
- Anthropic Claude (multi-model):
  - Haiku 4.5 — Parsing, classification, extraction (~$0.001/call)
  - Sonnet 4.6 — Content generation, analysis, reports (~$0.02-0.08/call)
  - Opus 4.6 — Voice extraction, narrative analysis (~$0.10-0.30/call)
  - Auth: `ANTHROPIC_API_KEY`
- Google Gemini 2.0 Flash — Bulk classification, scan engine (~$0.0005/call)
  - Auth: `GOOGLE_AI_API_KEY`
- Perplexity Sonar Pro — Real-time web research (~$0.01-0.03/call)
  - Auth: `PERPLEXITY_API_KEY`
- xAI Grok — Scan engine Phase 2
  - Auth: `XAI_API_KEY`
- DeepSeek — Scan engine Phase 2
  - Auth: `DEEPSEEK_API_KEY`

**Testing:**
- Not yet configured (Phase 2 — see TESTING.md for planned setup)

**Build/Dev:**
- ESLint 9.x — Linting with Next.js config
- eslint-config-next 16.1.4 — Next.js ESLint rules
- TypeScript — Strict type checking

**HTTP Client:**
- Axios 1.13.2 — For HTTP requests (alternative to fetch)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.91.1 — Database, auth, and real-time queries
- @tanstack/react-query 5.90.21 — Server state caching, fetching, synchronization
- next 16.1.4 — Framework (App Router, SSR, API routes, deployment)
- react 19.2.3 — UI rendering

**Infrastructure:**
- @tanstack/react-query-devtools 5.91.3 — Development debugging for React Query
- Radix UI components (@radix-ui/*) — Accessible component primitives
- zod 4.3.6 — Type-safe validation

**Utilities:**
- clsx 2.1.1 — Conditional class names
- tailwind-merge 3.4.0 — Smart class merging for Tailwind

## Configuration

**Environment:**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key: `SUPABASE_SERVICE_ROLE_KEY` (server-side only, Inngest + webhooks only)
- Database connection: `DATABASE_URL` for migrations
- Paddle: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_*`
- LLM APIs: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`, `XAI_API_KEY`, `DEEPSEEK_API_KEY`
- Email: `RESEND_API_KEY`
- Background jobs: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- App: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

**Build:**
- `next.config.ts` — Remote image patterns (unsplash.com)
- Tailwind v4 — CSS-based config via `@tailwindcss/postcss` (no tailwind.config.ts)
- `eslint.config.mjs` — ESLint config with Next.js rules
- `postcss.config.mjs` — Tailwind CSS PostCSS plugin
- `tsconfig.json` — Strict mode, path aliases `@/*` -> `./src/*`

## Platform Requirements

**Development:**
- Node.js 20.x
- npm
- Supabase CLI (for local database)
- TypeScript knowledge (strict mode)

**Production:**
- Vercel (for Next.js frontend + API routes)
- Supabase Cloud (PostgreSQL + Auth + Realtime + Storage)
- Paddle (payment processing)
- Inngest Cloud (background job execution)
- Resend (email delivery)

---

*Stack analysis: 2026-02-27 | Updated: March 2026 — synced with System Design v2.1*
