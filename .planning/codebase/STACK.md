# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- TypeScript 5.x - Entire codebase with strict mode enabled
- JavaScript (JSX/TSX) - React components, server components

**Secondary:**
- SQL - Database schema and migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js 20.x LTS (specified in package.json as compatible)

**Package Manager:**
- npm
- Lockfile: npm-lock.json

## Frameworks

**Core:**
- Next.js 16.1.4 - App Router (not Pages Router), React 19 SSR, API routes
- React 19.2.3 - UI library with strict TypeScript support
- React DOM 19.2.3 - DOM rendering

**Authentication:**
- Supabase Auth (built-in to Supabase) - Managed authentication service
- @supabase/ssr 0.8.0 - Server-side rendering auth helper
- Custom middleware in `src/lib/supabase/middleware.ts` for session updates

**State Management:**
- React Query (@tanstack/react-query) 5.90.21 - Server state (rankings, queries, credits)
- Zustand 5.0.11 - Client state (UI: sidebar, modals, loading states)
- React Hook Form 7.71.1 - Form state management with validation

**UI & Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- Shadcn/ui components - Headless UI built on Radix UI
- Lucide React 0.563.0 - Icon library
- Framer Motion 12.29.0 - Animation library
- Recharts 3.7.0 - Charting library for rankings/analytics

**Forms & Validation:**
- Zod 4.3.6 - Runtime schema validation
- @hookform/resolvers 5.2.2 - Bridge between React Hook Form and Zod
- Class Variance Authority 0.7.1 - CSS class composition

**Testing:**
- Not detected in package.json (Phase 2)

**Build/Dev:**
- ESLint 9.x - Linting with Next.js config
- eslint-config-next 16.1.4 - Next.js ESLint rules
- TypeScript - Strict type checking

**HTTP Client:**
- Axios 1.13.2 - For HTTP requests (alternative to fetch)
- Stripe 20.2.0 - Stripe SDK (for future payment processing)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.91.1 - Database, auth, and real-time queries
- @tanstack/react-query 5.90.21 - Server state caching, fetching, synchronization
- next 16.1.4 - Framework (App Router, SSR, API routes, deployment)
- react 19.2.3 - UI rendering

**Infrastructure:**
- @tanstack/react-query-devtools 5.91.3 - Development debugging for React Query
- Radix UI components (@radix-ui/*) - Accessible component primitives
- zod 4.3.6 - Type-safe validation

**Utilities:**
- clsx 2.1.1 - Conditional class names
- tailwind-merge 3.4.0 - Smart class merging for Tailwind

## Configuration

**Environment:**
- Supabase configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- Database connection: `DATABASE_URL` for migrations
- Stripe keys: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- n8n webhooks: `N8N_*_WEBHOOK` environment variables
- LLM API keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_API_KEY`
- App URL: `NEXT_PUBLIC_APP_URL`

**Build:**
- `next.config.ts` - Remote image patterns (unsplash.com)
- `tailwind.config.ts` - Not found (using default config)
- `eslint.config.mjs` - ESLint config with Next.js rules
- `postcss.config.mjs` - Tailwind CSS PostCSS plugin
- `tsconfig.json` - Strict mode, path aliases `@/*` → `./src/*`

## Platform Requirements

**Development:**
- Node.js 20.x
- npm
- Supabase CLI (for local database)
- TypeScript knowledge (strict mode)

**Production:**
- Vercel (for Next.js frontend + API routes)
- Supabase Cloud (PostgreSQL + Auth)
- n8n Cloud (workflow orchestration)
- Stripe (payment processing)

---

*Stack analysis: 2026-02-27*
