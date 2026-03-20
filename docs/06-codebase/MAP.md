# Codebase Structure

> **Last synced:** March 2026 — aligned with 03-system-design/

## Directory Layout

```
saas-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Public auth pages (layout group)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (protected)/               # Protected dashboard (layout group with auth)
│   │   │   ├── layout.tsx             # Sidebar, navigation, logout
│   │   │   ├── dashboard/page.tsx                       # Overview: visibility gauge, trends, recs, activity
│   │   │   ├── dashboard/rankings/page.tsx              # Per-query, per-engine rankings table
│   │   │   ├── dashboard/recommendations/page.tsx       # AI-generated action items with "Fix with Agent"
│   │   │   ├── dashboard/content/page.tsx               # Content library (filterable)
│   │   │   ├── dashboard/content/[id]/page.tsx          # Content editor (Markdown + preview + versioning)
│   │   │   ├── dashboard/agents/page.tsx                # Agent hub — all 16 agents + run history
│   │   │   ├── dashboard/agents/[agent_id]/page.tsx     # Agent execution UI with streaming chat
│   │   │   ├── dashboard/competitors/page.tsx           # Competitive intelligence: share of voice, gaps
│   │   │   ├── dashboard/ai-readiness/page.tsx          # AI readiness score + improvement roadmap
│   │   │   ├── dashboard/notifications/page.tsx         # In-app notification center
│   │   │   ├── onboarding/page.tsx                      # 4-step: business -> queries -> competitors -> ready
│   │   │   └── settings/                                # 4-tab: business, billing (Paddle), prefs, integrations
│   │   ├── api/                       # API route handlers (~70+ routes across 14 groups)
│   │   │   ├── health/route.ts
│   │   │   ├── scan/                  # Free scan, manual scan, status, results, history
│   │   │   ├── agents/               # Execute (Inngest event), status, cancel, history, chat
│   │   │   ├── content/              # CRUD, publish to CMS, performance data
│   │   │   ├── dashboard/            # Overview, rankings, trends, competitors, recs, ai-readiness
│   │   │   ├── settings/             # Business profile, preferences, notifications, billing, integrations, language, export, account, password
│   │   │   ├── paddle/               # Status, portal link, webhooks, usage, invoices
│   │   │   ├── integrations/         # CRUD for WordPress, GA4, GSC, Slack, Cloudflare, test-connection
│   │   │   ├── alerts/               # Alert rules CRUD, notification list, mark read, preferences, bulk actions
│   │   │   ├── competitors/          # CRUD, comparison data
│   │   │   ├── workflows/            # CRUD, trigger, run history
│   │   │   ├── analytics/            # Prompt volumes, citation sources, brand narrative, content performance
│   │   │   ├── v1/                   # Public REST API — Business tier only (9 endpoints, API key auth)
│   │   │   ├── onboarding/complete/route.ts  # Complete onboarding, emit Inngest event
│   │   │   └── inngest/route.ts      # Inngest serve endpoint
│   │   ├── (marketing)/              # Public marketing pages
│   │   │   ├── pricing/page.tsx      # Plan comparison with feature matrix and FAQ
│   │   │   ├── blog/page.tsx         # Blog list
│   │   │   ├── blog/[slug]/page.tsx  # Blog post
│   │   │   ├── about/page.tsx        # Company story
│   │   │   ├── terms/page.tsx        # Terms of service
│   │   │   ├── privacy/page.tsx      # Privacy policy
│   │   │   └── docs/api/page.tsx     # REST API documentation (Business tier)
│   │   ├── scan/                     # Free scan flow
│   │   │   ├── page.tsx              # Scan input form
│   │   │   └── [scan_id]/page.tsx    # Public shareable results
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page (marketing homepage)
│   │   ├── globals.css               # Global styles + Tailwind
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── # landing/ — DEPRECATED and removed. Marketing site is in Framer.
│   │   ├── auth/                     # Auth form components
│   │   ├── onboarding/               # Onboarding flow components
│   │   ├── scan/                     # Scan results components
│   │   ├── pricing/                  # Pricing page components
│   │   └── email/                    # React Email templates (15 templates)
│   ├── inngest/                      # Inngest function definitions
│   │   ├── index.ts                  # Inngest client + function registry
│   │   ├── functions/
│   │   │   ├── scan-free.ts          # Free scan execution
│   │   │   ├── scan-manual.ts        # Manual scan execution
│   │   │   ├── agent-execute.ts      # Agent execution pipeline
│   │   │   └── # scan-scheduled.ts — PLANNED (not yet implemented): automated recurring scans for paid users
│   │   └── cron/                     # Cron job functions (8 functions)
│   ├── lib/
│   │   ├── api/                      # API utilities
│   │   │   ├── auth.ts               # getAuthenticatedUser(), checkCredits()
│   │   │   ├── errors.ts             # APIError, UnauthorizedError, BadRequestError, etc.
│   │   │   └── responses.ts          # successResponse(), errorResponse(), withErrorHandler()
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client (use client)
│   │   │   ├── server.ts             # Server client with cookie management
│   │   │   └── middleware.ts          # Auth middleware for protected routes
│   │   ├── hooks/                    # Custom React hooks (use client)
│   │   ├── react-query/
│   │   │   ├── client.ts             # QueryClient configuration
│   │   │   └── provider.tsx          # QueryClientProvider + devtools
│   │   ├── zustand/
│   │   │   └── stores/
│   │   │       └── ui-store.ts       # UI state (sidebar, modals, loading)
│   │   ├── types/
│   │   │   ├── index.ts              # App types (ScanResults, EngineResult, etc.)
│   │   │   └── database.types.ts     # Supabase generated types (16+ tables)
│   │   ├── openrouter.ts             # PRIMARY LLM gateway (2 keys: scan + agent)
│   │   ├── scan/                     # Scan engine logic
│   │   │   ├── engine-adapter.ts     # calls scan engines via OpenRouter
│   │   │   ├── parser.ts             # parse engine responses
│   │   │   ├── scorer.ts             # score visibility results
│   │   │   └── mock-engine.ts        # Mock scan engine with seeded PRNG
│   │   ├── agents/
│   │   │   └── llm-runner.ts         # agent content generation
│   │   ├── email/                    # Email sending logic
│   │   ├── utils/
│   │   │   └── index.ts              # Helper functions (cn(), formatting)
│   │   └── constants/
│   │       ├── industries.ts         # 25 industries with prompts + competitors
│   │       └── engines.ts            # LLM provider definitions
│   ├── public/
│   │   └── (static assets)
│   └── styles/
│       └── (additional CSS)
├── supabase/
│   └── migrations/                   # SQL migration files
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── middleware.ts                     # Next.js middleware for auth
├── .gitignore
└── .env.example
```

## Page Map (25 Pages)

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Conversion page: hero, social proof, features, pricing, CTA |
| Free Scan | `/scan` | Anonymous 60-second AI visibility scan |
| Scan Results | `/scan/[scan_id]` | Public shareable results with signup CTA |
| Login | `/login` | Supabase Auth login |
| Signup | `/signup` | Registration with optional `?scan_id=` import |
| Forgot Password | `/forgot-password` | Password reset flow |
| Reset Password | `/(auth)/reset-password` | Set new password after email link |
| Onboarding | `/onboarding` | 4-step setup: business -> queries -> competitors -> ready |
| Dashboard Overview | `/dashboard` | Visibility score gauge, trend chart, recommendations, activity feed |
| Rankings | `/dashboard/rankings` | Per-query, per-engine visibility table with filters |
| Recommendations | `/dashboard/recommendations` | AI-generated action items with "Fix with Agent" buttons |
| Content Library | `/dashboard/content` | All generated content, filterable, with performance tracking |
| Content Editor | `/dashboard/content/[id]` | Markdown editor with preview, version history, publish-to-CMS |
| Agent Hub | `/dashboard/agents` | All 16 agents, run history, workflow setup |
| Agent Chat | `/dashboard/agents/[agent_id]` | Agent execution UI with real-time step progress |
| Competitive Intelligence | `/dashboard/competitors` | Share of voice, gap analysis, competitor profiles |
| AI Readiness | `/dashboard/ai-readiness` | Website audit score with improvement roadmap |
| Notifications | `/dashboard/notifications` | In-app notification center |
| Settings | `/dashboard/settings` | Business profile, billing, preferences, integrations (4 tabs) |
| Pricing | `/pricing` | Plan comparison with feature matrix and FAQ |
| Blog | `/blog` | SEO content marketing |
| About | `/about` | Company story |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |
| API Docs | `/docs/api` | REST API documentation (Business tier) |

## Directory Purposes

**`src/app/`** — Next.js App Router pages and layouts. Uses layout groups `(auth)` and `(protected)` for nested layouts with different auth requirements.

**`src/app/(auth)/`** — Public authentication pages (login, signup, forgot password). No auth middleware required. Shared layout for styling consistency.

**`src/app/(protected)/`** — Protected dashboard pages requiring authentication. Layout includes sidebar navigation, logout button. Middleware redirects unauthenticated users to `/login`.

**`src/app/api/`** — Next.js API route handlers organized by domain (~70+ routes across 14 groups). Each route is a serverless function. Agent/scan routes emit Inngest events and return 202 — they NEVER call LLM APIs directly.

**`src/inngest/`** — Inngest function definitions. All async work (scans, agent pipelines, crons, workflows) lives here. Registered via `/api/inngest` serve endpoint.

**`src/components/`** — React components organized by feature area (ui/, dashboard/, auth/, onboarding/, scan/, pricing/, email/). Note: `landing/` is DEPRECATED — marketing site is in Framer.

**`src/lib/`** — Shared libraries: API utilities, Supabase clients, hooks, React Query config, Zustand stores, types, constants. `openrouter.ts` is the primary LLM gateway.

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: PascalCase `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utilities: camelCase `utilityName.ts`
- Inngest functions: kebab-case `function-name.ts`

**Directories:**
- Feature domains: plural noun (`queries`, `content`, `agents`, `credits`)
- Component categories: plural noun (`dashboard`, `landing`, `auth`, `ui`)
- Layout groups: parentheses `(auth)`, `(protected)` (Next.js convention)

**Code:**
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: Tailwind utility classes

## Where to Add New Code

**New API Endpoint:**
- Handler: `src/app/api/{domain}/route.ts`
- Always call `getAuthenticatedUser()` first
- Always validate with Zod schema
- Wrap with `withErrorHandler()` on export
- Agent/async work: emit Inngest event, return 202. Implement logic in `src/inngest/`

**New Inngest Function:**
- Location: `src/inngest/functions/{functionName}.ts`
- Register in `src/inngest/index.ts`
- Pattern: `inngest.createFunction({ id, name }, { event }, async ({ event, step }) => { ... })`
- Use `step.run()` for each LLM call (each step retries independently)

**New Component:**
- Reusable UI: `src/components/ui/ComponentName.tsx`
- Dashboard-specific: `src/components/dashboard/ComponentName.tsx`
- Do NOT add to `src/components/landing/` — marketing site is in Framer

**New Hook:**
- Location: `src/lib/hooks/useHookName.ts`
- Use React Query for server state

**New Types:**
- Add to `src/lib/types/index.ts`

**Database Migration:**
- Location: `supabase/migrations/{timestamp}_{description}.sql`
- Run with `supabase db push`

---

*Structure analysis: 2026-02-27 | Updated: 2026-03-19 — agent route segment, Inngest functions directory, deprecated landing, added lib files, added pages*
