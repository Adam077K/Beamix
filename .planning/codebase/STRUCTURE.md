# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```
saas-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Public auth pages (layout group)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (protected)/               # Protected dashboard (layout group with auth)
│   │   │   ├── layout.tsx             # Sidebar, navigation, logout
│   │   │   ├── dashboard/page.tsx     # Main dashboard with metrics
│   │   │   ├── dashboard/queries/page.tsx
│   │   │   ├── dashboard/content/page.tsx
│   │   │   ├── dashboard/reviews/page.tsx
│   │   │   ├── onboarding/page.tsx
│   │   │   └── settings/
│   │   ├── api/                       # API route handlers (organized by domain)
│   │   │   ├── health/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── queries/
│   │   │   │   ├── route.ts           # GET, POST /api/queries
│   │   │   │   └── [id]/route.ts      # GET, PUT, DELETE /api/queries/[id]
│   │   │   ├── content/
│   │   │   │   ├── route.ts           # GET, POST /api/content
│   │   │   │   └── [id]/route.ts      # GET, PUT, DELETE /api/content/[id]
│   │   │   ├── agents/                # AI agent endpoints (async)
│   │   │   │   ├── content-writer/route.ts
│   │   │   │   ├── query-researcher/route.ts
│   │   │   │   └── competitor-research/route.ts
│   │   │   ├── recommendations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── overview/route.ts
│   │   │   ├── credits/
│   │   │   │   ├── balance/route.ts
│   │   │   │   └── transactions/route.ts
│   │   │   ├── onboarding/
│   │   │   │   └── complete/route.ts
│   │   │   └── webhooks/
│   │   │       └── paddle/route.ts    # Paddle webhook handler
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Marketing homepage
│   │   ├── globals.css                # Global styles + Tailwind
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/                        # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── AnimatedCounter.tsx
│   │   │   ├── AnimatedGroup.tsx
│   │   │   ├── BounceCard.tsx
│   │   │   ├── container-scroll-animation.tsx
│   │   │   ├── StickyScrollFeatures.tsx
│   │   │   ├── TrustBadges.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   └── FAQAccordion.tsx
│   │   ├── dashboard/                 # Dashboard-specific components
│   │   │   ├── MetricsCard.tsx
│   │   │   ├── RankingChart.tsx
│   │   │   ├── QueryList.tsx
│   │   │   ├── ContentGaps.tsx
│   │   │   ├── ReviewInsights.tsx
│   │   │   └── CreditsIndicator.tsx
│   │   ├── landing/                   # Marketing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── CTA.tsx
│   │   ├── auth/                      # Auth form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── PasswordReset.tsx
│   │   └── onboarding/                # Onboarding flow components
│   │       ├── CompanyInfo.tsx
│   │       └── QuerySetup.tsx
│   ├── lib/
│   │   ├── api/                       # API utilities
│   │   │   ├── auth.ts                # getAuthenticatedUser(), checkCredits()
│   │   │   ├── errors.ts              # APIError, UnauthorizedError, BadRequestError, etc.
│   │   │   └── responses.ts           # successResponse(), errorResponse(), withErrorHandler()
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client (use client)
│   │   │   ├── server.ts              # Server client with cookie management
│   │   │   └── middleware.ts          # Auth middleware for protected routes
│   │   ├── hooks/                     # Custom React hooks (use client)
│   │   │   ├── useQueries.ts          # CRUD for tracked queries
│   │   │   ├── useDashboardData.ts    # Fetch dashboard metrics
│   │   │   ├── useCredits.ts          # Fetch credit balance
│   │   │   └── useAuth.ts             # Auth state (if exists)
│   │   ├── react-query/
│   │   │   ├── client.ts              # QueryClient configuration
│   │   │   └── provider.tsx           # QueryClientProvider + devtools
│   │   ├── zustand/
│   │   │   └── stores/
│   │   │       └── ui-store.ts        # UI state (sidebar, modals, loading)
│   │   ├── types/
│   │   │   └── index.ts               # Database types, API types, plan types
│   │   ├── utils/
│   │   │   └── index.ts               # Helper functions (cn(), formatting)
│   │   └── constants/
│   │       └── (if exists) config values
│   ├── public/
│   │   ├── logo.svg
│   │   ├── og-image.png
│   │   └── favicon.png
│   └── styles/
│       └── (any additional CSS modules)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_auth_tables.sql
│       ├── 003_rankings.sql
│       └── ... (database migrations)
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── middleware.ts                      # Next.js middleware for auth
├── .eslintrc.json
├── .gitignore
└── .env.example
```

## Directory Purposes

**`src/app/`** - Next.js App Router pages and layouts. Uses layout groups `(auth)` and `(protected)` for nested layouts with different auth requirements.

**`src/app/(auth)/`** - Public authentication pages (login, signup, forgot password). No auth middleware required. Shared layout for styling consistency.

**`src/app/(protected)/`** - Protected dashboard pages requiring authentication. Layout includes sidebar navigation, logout button. Middleware redirects unauthenticated users to `/login`.

**`src/app/api/`** - Next.js API route handlers organized by domain (queries, content, agents, etc.). Each route is a serverless function. POST requests trigger async agent executions via direct LLM API calls.

**`src/components/ui/`** - Shadcn UI component library (unstyled, Tailwind-based). Imported from `@/components/ui/` throughout codebase. Some custom animations added (AnimatedCounter, BounceCard, etc.).

**`src/components/dashboard/`** - Dashboard-specific components: MetricsCard (displays KPI), RankingChart (Recharts), QueryList (table), ReviewInsights, etc.

**`src/components/landing/`** - Marketing page components: Hero, Features, CTA.

**`src/lib/api/`** - API utilities: error handling, response formatting, authentication checks. All route handlers import from here.

**`src/lib/supabase/`** - Supabase client factories. `client.ts` for browser, `server.ts` for API routes, `middleware.ts` for auth middleware. Handles cookie-based session persistence.

**`src/lib/hooks/`** - Custom React hooks wrapping React Query. Each hook handles fetch with auth token, error states, loading states, and mutations.

**`src/lib/react-query/`** - React Query configuration (QueryClient, cache settings, devtools provider).

**`src/lib/zustand/stores/`** - Zustand state management stores for client-side UI state (sidebar, modals, global loading).

**`src/lib/types/`** - TypeScript type definitions for database schema, API responses, auth types, billing types. Single file: `index.ts`.

**`supabase/migrations/`** - SQL migration files for database schema. Run with Supabase CLI.

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Marketing homepage (root `/`)
- `src/app/(auth)/login/page.tsx`: Login page (`/login`)
- `src/app/(auth)/signup/page.tsx`: Signup page (`/signup`)
- `src/app/(protected)/dashboard/page.tsx`: Main dashboard (`/dashboard`, requires auth)

**Configuration:**
- `next.config.js`: Next.js configuration (image optimization, build settings)
- `tsconfig.json`: TypeScript config with path alias `@/*` → `src/*`
- `tailwind.config.ts`: Tailwind CSS configuration
- `.env.example`: Environment variable template (copy to `.env.local`)

**Core Logic:**
- `src/lib/api/auth.ts`: `getAuthenticatedUser()`, `checkCredits()` - used by all protected API routes
- `src/lib/api/responses.ts`: `successResponse()`, `errorResponse()`, `withErrorHandler()` - wraps all routes
- `src/lib/supabase/server.ts`: Server Supabase client - used in API routes
- `src/lib/types/index.ts`: All TypeScript types - import from here

**Testing:**
- No dedicated test files found. Manual testing via browser or API tools (Postman, curl).

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: PascalCase `ComponentName.tsx` (e.g., `MetricsCard.tsx`, `QueryList.tsx`)
- Hooks: `useHookName.ts` (React convention, e.g., `useQueries.ts`, `useDashboardData.ts`)
- Utilities: camelCase `utilityName.ts` (e.g., `errors.ts`, `responses.ts`)
- Types: camelCase or PascalCase in `index.ts` file (e.g., `TrackedQuery`, `ApiResponse`)

**Directories:**
- Feature domains: plural noun `queries`, `content`, `agents`, `credits` (maps to `/api/queries`, `/api/content`, etc.)
- Component categories: plural noun `dashboard`, `landing`, `auth`, `ui`
- Layout groups: parentheses `(auth)`, `(protected)` (Next.js convention for non-route directories)

**Code:**
- Variables/functions: camelCase (e.g., `isLoading`, `handleSubmit`, `fetchQueries`)
- Types/interfaces: PascalCase (e.g., `TrackedQuery`, `ApiResponse`)
- Constants: UPPER_SNAKE_CASE (e.g., `CONTENT_WRITER_COST = 3`)
- CSS classes: Tailwind utility classes (no BEM or custom CSS selectors)

## Where to Add New Code

**New Feature (e.g., "Add competitor comparison"):**
- Primary code: `src/app/api/agents/competitor-research/route.ts` (API endpoint)
- Components: `src/components/dashboard/CompetitorComparison.tsx` (display)
- Hook: `src/lib/hooks/useCompetitorData.ts` (fetch + cache)
- Types: Add to `src/lib/types/index.ts` (e.g., `interface CompetitorResult`)
- Pages: `src/app/(protected)/dashboard/competitors/page.tsx` (route)
- Database: `supabase/migrations/004_competitor_tables.sql`

**New Component/Module:**
- Implementation: `src/components/{category}/ComponentName.tsx`
- If reusable UI: `src/components/ui/ComponentName.tsx`
- If dashboard-specific: `src/components/dashboard/ComponentName.tsx`
- If landing/marketing: `src/components/landing/ComponentName.tsx`

**New API Endpoint:**
- Handler: `src/app/api/{domain}/route.ts` for GET/POST, or `src/app/api/{domain}/[id]/route.ts` for ID-based routes
- Authentication: Always call `getAuthenticatedUser()` first to verify session
- Error handling: Wrap handler with `withErrorHandler()` on export
- Response: Use `successResponse(data, meta)` for 200, throw custom errors for failures
- Agent execution: For async processing, call LLM APIs directly from the API route (fire-and-forget pattern)

**Utilities/Helpers:**
- Shared API utilities: `src/lib/api/{function}.ts` (e.g., `responses.ts`, `errors.ts`)
- Shared React hooks: `src/lib/hooks/{hookName}.ts`
- Shared types: `src/lib/types/index.ts`
- UI utilities: `src/lib/utils/index.ts` (e.g., `cn()` for Tailwind class merging)

**State Management:**
- Global UI state: `src/lib/zustand/stores/ui-store.ts` (sidebar, modals, loading)
- Server state: Use React Query via hooks in `src/lib/hooks/` (queries, dashboard data, credits)

## Special Directories

**`supabase/migrations/`:**
- Purpose: Version control for database schema
- Generated: No (manually written SQL)
- Committed: Yes (track schema changes in git)
- Usage: Run with `supabase db push` to apply migrations

**`.next/`:**
- Purpose: Build output directory (compiled Next.js, React bundles, type definitions)
- Generated: Yes (by `npm run build`)
- Committed: No (`.gitignore` excludes)
- Never edit manually

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (`.gitignore` excludes)
- Update with `npm install` or `npm update`

**`.env.local` (local dev only):**
- Purpose: Development environment variables
- Generated: No (copy from `.env.example`)
- Committed: No (`.gitignore` excludes, never commit secrets)
- Contains: Supabase keys, API tokens, webhook URLs

**`.env.production`:**
- Purpose: Production environment variables (set in Vercel dashboard)
- Generated: No (configured in Vercel)
- Committed: No (never check in production secrets)
- Contains: Live Supabase URL, Paddle keys, LLM API keys

