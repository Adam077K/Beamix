# Atlas — Agent Memory

## Completed Phases (2026-03-01)

### Phase 0 — Bootstrap (commit `0b54e50`)
- All deps installed, shadcn 13 components, Tailwind v4 design tokens, Outfit+Inter fonts, Providers, directory structure

### Phase 1 — Core Infrastructure & Auth (commits `8e06986` + `8e74821`)
- Supabase clients: browser, server, service role, middleware helper returning `{supabaseResponse, user}`
- Auth routes at `/login`, `/signup`, `/forgot-password`, `/callback` (NOT `/auth/` prefix)
- Middleware with PUBLIC_ROUTES/AUTH_ROUTES/PROTECTED_ROUTES arrays
- Database types: 16 tables in `src/lib/types/database.types.ts`
- App types: `src/lib/types/index.ts` (ScanResults, EngineResult, etc.)
- Industries: 25 entries with prompts + competitors in `src/constants/industries.ts`

### Phase 2 — Scan Engine Mock (commits `b3de0cc` + `4e6f4b7`) — COMPLETE
- Mock engine with seeded PRNG at `src/lib/scan/mock-engine.ts` — function: `runMockScan` (async)
- API routes use Supabase `free_scans` table via service client (not in-memory store)
- Validation schema field: `url` (not `website_url`) — mapped to `website_url` for DB storage
- API: POST /api/scan/start (202), GET status, GET results — all hit Supabase
- Scan form at `/scan` with top bar (login/signup), trust pills, localStorage save
- Results at `/scan/[scan_id]` — Server Component wrapper + ScanResultsClient
- ScanResultsClient at `src/components/scan/scan-results-client.tsx` includes:
  - Per-engine processing indicators (ChatGPT checking, Gemini analyzing, etc.)
  - DotsIndicator (10 dots filled by score)
  - Score breakdown gradient bar with animated marker
  - Top Competitor callout (amber card with threat analysis)
  - Quick Wins (first 3 free)
  - Gated/blurred CTA ("5 more personalized fixes" behind blur overlay)
  - Share section (copy link, LinkedIn, X)
  - Conversion CTA
- In-memory store at `src/lib/scan/store.ts` — still exists but UNUSED (can delete)

### Phase 3 — Landing Page (by Lyra, commit unknown)
- Landing page components in `src/components/landing/` (untracked, not yet committed)

## Key Patterns

- **Tailwind v4** — CSS-based config via `@tailwindcss/postcss`, no tailwind.config.ts
- **Next.js 16** — middleware works but shows deprecation warning (recommends "proxy")
- **Zod v4** — import from `zod/v4` (not `zod`)
- **useSearchParams** requires Suspense boundary wrapper (build fails without it)
- **Framer Motion ease** — must use `as const` on ease strings for strict TS
- **Auth routes** — under `(auth)` route group, NOT nested `/auth/` prefix
- **Supabase Json type** — use `JSON.parse(JSON.stringify(obj)) as Json` for safe JSONB casting
- **free_scans.scan_token** — this is the public scan_id used in URLs, NOT the table's `id` column

## Next Session Priority

1. Task #5 (Onboarding Flow) is unblocked and ready
2. Task #4 (Landing Page) was done by Lyra — landing components need committing
3. Tasks #6-12 still blocked on later phases
