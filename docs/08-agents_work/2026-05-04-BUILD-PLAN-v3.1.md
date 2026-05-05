# Beamix MVP — Build Plan v3.1
Date: 2026-05-04 (patched 2026-05-05)
Author: Build Lead
Status: v3.1 patch of v3. Supersedes v3. All v1 ticket IDs (T0.1–T5.6) and v2 ticket IDs (T58–T92) preserved intact. New tickets T93–T133 from v3 + T134–T147 from v3.1 verification audit patches. T119 and T120 promoted Tier 3 → Tier 1. T100 effort bumped M → L. T132 split into T132a (Tier 1) + T132b (Tier 5).

---

## Executive Overview

Build Plan v3 folds five source documents into the ticket backlog:

1. **Option E unified `/start` architecture** — `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` — 11 new Tier 1 tickets (T100–T110) plus one Tier 1 amendment (T111)
2. **Two-tier activation model + Paddle-deferred UX** — 6 new Tier 2 tickets (T112–T117) plus one Tier 2 redefinition (T118)
3. **12 onboarding audit fixes** — `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` — 10 new tickets across Tiers 0 and 3 (T119–T128)
4. **Tier 0 design-system canon additions** — 7 new Tier 0 tickets (T93–T99)
5. **Post-MVP F48–F54 + compliance tracking** — 5 new Tier 5 tickets (T129–T133)

v3 appends T93–T133 to the existing Tier 0–5 structure. Four structural changes versus v2:

- **Tier 0 gains 7 tickets (T93–T99)** — Heebo font, phase-transition motion canon, Google OAuth config, two-tier UI state tokens, deploy smoke test, WCAG fixes, status page. These are design-system and infrastructure prerequisites for Option E.
- **Tier 1 gains 12 tickets (T100–T111)** — the complete Option E `/start` route state machine (T100) and all 9 phases as discrete components (T101–T109), plus cross-phase animation orchestration (T110) and a `/scan` permalink amendment (T111).
- **Tier 2 gains 7 tickets (T112–T118)** — two-tier activation states, Free Account /home and sample /inbox, paid-activation Paddle modal, recovery emails, agent caps, money-back tier split, and activation event redefinition.
- **Tier 3 gains 10 onboarding audit tickets (T119–T128)** — pre-fill claims API, vertical-conditional hours field, skip-cinema, coming-soon reframe, guarantee surfacing, dual-tab lock, pre-Seal consistency check, orphan Twilio cleanup, mobile typography fix, reduced-motion coverage.
- **Tier 5 gains 5 tickets (T129–T133)** — SOC 2 observation note, Yossi agency batch onboarding, embeddable score badge, public dogfooding scan, and Plausible-style transparency page.

Total ticket count: 92 (v2) + 41 (v3 new) = 133 tickets across Tiers 0–5.

### Adam-Locked Decisions (all confirmed 2026-05-04)

| ID | Decision |
|----|----------|
| Q1 | Yossi agency batch onboarding at MVP+30 (not MVP) |
| Q2 | Heebo 300 italic as Fraunces' Hebrew companion; font-family stack: `'Fraunces', 'Heebo', serif` |
| Q3 | Brief grounding preview (right-column inline-citation preview) ships at MVP during Phase 5 of `/start` |
| Q4 | Activation = first /inbox approval within 7 days post-Paddle-checkout (extended from 24h per N-2) |
| Q5 | Quiet "Security & DPA" footer link (not a banner) during Phase 6 + Phase 7 of `/start` |
| Q6 | Paddle inline-overlay placement during `/start` (no redirect) — deferred post-onboarding phases (Free Account gates the modal, not onboarding) |
| Q7 | Activation window extended to 7 days (was 24h at Q4) |
| Q8 | Money-back tier split: Discover 14d / Build 14d / Scale 30d |
| Q9 | Google OAuth as primary signup method; email+password as fallback |
| Q10 | Embeddable score badge at MVP+30 |
| Q11 | Publish Beamix's own scan publicly (dogfooding) — build at MVP, publish at MVP+30 |
| Q12 | Adopt Option E (unified `/start` route + peer-public `/scan`) |
| Q13 | Ship Option E at MVP |

---

## Domain Infrastructure — DONE (updated 2026-05-04)

Status: PRODUCTION READY / CURRENT. No build tickets required.

| Service | Domain | Status |
|---------|--------|--------|
| Cloudflare DNS | beamixai.com (apex + all subdomains) | LIVE |
| Framer | beamixai.com (marketing apex) | LIVE |
| Vercel | app.beamixai.com (product dashboard) | LIVE |
| Resend | notify.beamixai.com (transactional email) | Verified |
| Inngest | Production keys rotated | Current |
| Google Search Console | beamixai.com | Configured |
| Bing Webmaster Tools | beamixai.com | Configured |

**All build tickets referencing domains should use:**
- Product dashboard: `app.beamixai.com`
- Transactional email: `notify.beamixai.com`
- Marketing apex: `beamixai.com`
- Monthly Update permalinks: `beamixai.com/r/{nanoid21}`

---

## Tier 0 — Foundation

*(v1 tickets T0.1–T0.15 and v2 tickets T58–T65 preserved intact. New tickets T93–T99 append below.)*

---

### T93 — Heebo 300 italic: conditional load on `[lang="he"]` pages

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.12 (design system token scaffold must exist), T60 (variable Inter optimization — font config is in same file)
**References:** Onboarding audit O-2; Q2 decision; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-2

**Acceptance criteria:**
- `apps/web/next.config.js` font configuration adds Heebo as a `next/font/google` font with weight `['300']` and style `['italic']`; loaded only when `lang="he"` is active on the document (`conditional: true` pattern or equivalent Next.js font strategy)
- `apps/web/src/app/layout.tsx` updated to apply Heebo CSS variable conditionally on `[lang="he"]` selector
- `apps/web/src/styles/typography.css` updated with the canonical Hebrew font stack: `font-family: 'Fraunces', 'Heebo', serif;` as a CSS custom property `--font-brief-clauses-he`
- Geist Mono elements (URLs, phone numbers, numeric values) within Hebrew-language contexts have explicit `dir="ltr"` attribute to prevent mirrored rendering
- `pnpm typecheck` zero errors; `pnpm build --analyze` confirms Heebo is NOT in the main bundle (conditionally split)

**Files touched:**
- `apps/web/next.config.js`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/styles/typography.css`

---

### T94 — Phase-transition motion canon: 140ms cross-fade default + Phase 6 Seal exception

**Tier:** 0
**Effort:** XS
**Dependencies:** T58 (named easing curves in `motion.css` must exist — T94 adds to the same file)
**References:** Flow Architecture Synthesis §Option E phases; Q12 Option E approval

**Acceptance criteria:**
- `apps/web/src/styles/motion.css` adds two new CSS custom properties:
  - `--duration-phase-transition: 140ms` — canonical cross-fade duration for all `/start` phase transitions
  - `--duration-seal-ceremony: 540ms` — Phase 6 Seal stamping exception (already specced in T87; document here as a named constant)
- Inline comment on `--duration-phase-transition`: "Default for all /start phase cross-fades. Do NOT override except for the Seal ceremony (Phase 6). Verified against Vercel motion canon §cross-fade."
- Inline comment on `--duration-seal-ceremony`: "Phase 6 exception — bespoke stamping ceremony. Not a generic transition. See T87 SealStamp.tsx."
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/styles/motion.css`

---

### T95 — Google OAuth as primary signup method

**Tier:** 0
**Effort:** S
**Dependencies:** T0.1 (schema — users/subscriptions tables must exist), T0.12 (design system — auth UI button styling)
**References:** Onboarding audit N-4; Q9 decision; `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §N-4

**Acceptance criteria:**
- Supabase Auth Google provider configured in the Supabase project settings; `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables documented in `apps/web/.env.example`
- Auth UI in `/start` Phase 3 (signup-overlay) and `/login` page updated:
  - Google OAuth button is the PRIMARY CTA (full-width, above the fold, `--color-ink-1` background with Google "G" icon per Google brand guidelines)
  - Email+password fields appear below as a secondary option labeled "Or use email"
  - "Continue with Google" button triggers Supabase `signInWithOAuth({ provider: 'google' })` with `redirectTo` set to the current `/start` phase state URL (preserves scan_id + phase context)
- OAuth callback route `apps/web/src/app/auth/callback/route.ts` handles Google OAuth return correctly: preserves `scan_id` query param from state; routes to correct `/start` phase after auth
- handle_new_user trigger fires on Google OAuth signup identically to email signup (verify with Supabase Auth hook)
- `pnpm typecheck` zero errors; Playwright E2E smoke test: Google OAuth button renders and initiates redirect (mock OAuth provider in test)

**Files touched:**
- `apps/web/src/app/auth/callback/route.ts`
- `apps/web/src/app/start/components/SignupOverlay.tsx` (created by T104 — T95 provides the provider config T104 depends on)
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/.env.example`

---

### T96 — Two-tier UI state tokens (Free Account banner, Paid Customer banner)

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.12 (design system token scaffold)
**References:** Q6 decision (Paddle deferred post-onboarding); T112 (Free Account /home state consumes these tokens); F51

**Acceptance criteria:**
- `apps/web/src/styles/tokens.css` (or equivalent) adds two new semantic token groups:
  - **Free Account state tokens** (applied when user has completed `/start` but has no active Paddle subscription):
    - `--color-free-account-banner-bg: #FFF8E1` (warm cream — distinct from paper cream)
    - `--color-free-account-banner-border: #F59E0B` (amber)
    - `--color-free-account-banner-text: #92400E` (dark amber)
  - **Paid Customer state tokens** (applied when user has an active Paddle subscription):
    - `--color-paid-customer-indicator-bg: #EFF6FF` (blue tint)
    - `--color-paid-customer-indicator-text: #1D4ED8` (blue — same family as `#3370FF` primary)
- `apps/web/src/lib/account-state.ts` created with `AccountState = 'free' | 'paid' | 'paused' | 'cancelled'` TypeScript union and a `getAccountState(userId: string): Promise<AccountState>` server utility function that reads `subscriptions.status` from Supabase
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/styles/tokens.css`
- `apps/web/src/lib/account-state.ts`

---

### T97 — handle_new_user trigger smoke test at deploy time

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.1 (schema — users/user_profiles/subscriptions/notification_preferences tables must exist)
**References:** Onboarding audit O-6; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-6; MEMORY.md onboarding bug 2026-03-02

**Acceptance criteria:**
- `apps/web/scripts/smoke-test-signup-trigger.ts` created: TypeScript script that creates a synthetic test user via Supabase Admin API, waits 500ms for trigger to fire, then asserts that `user_profiles`, `subscriptions`, and `notification_preferences` rows exist for the test user ID; deletes the test user on completion (cleanup guaranteed regardless of pass/fail via try/finally)
- `.github/workflows/deploy-smoke-test.yml` runs this script after every deploy to staging (not production); fails the workflow if trigger assertions fail; reports pass/fail in the GitHub Actions summary
- Script exits with code 0 on success, code 1 on failure (assertion error or timeout)
- `pnpm typecheck` zero errors on the script file
- Script documented with inline comments explaining the handle_new_user trigger regression risk

**Files touched:**
- `apps/web/scripts/smoke-test-signup-trigger.ts`
- `.github/workflows/deploy-smoke-test.yml`

---

### T98 — 4 WCAG 2.1 AA token contrast fixes + focus ring + Print-the-Brief dismiss

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.12 (design system token scaffold — modifying existing tokens), T82 (Print-the-Brief button exists — auto-dismiss removal modifies its behavior)
**References:** Onboarding audit O-8; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-8

**Acceptance criteria:**
- `apps/web/src/styles/tokens.css` adds 3 new `-text` variant tokens with AA-compliant contrast (≥4.5:1 against `--color-paper-cream` background):
  - `--color-score-excellent-text: #047857` (WCAG AA pass — darker than Excellent chart color)
  - `--color-needs-you-text: #B45309` (WCAG AA pass — darker amber for action-required states)
  - `--color-ink-4-text: #6B7280` (WCAG AA pass on white; replaces failing `--color-ink-4` usage in text contexts)
- Focus ring update in `apps/web/src/styles/tokens.css` and any global CSS: focus ring changed from `rgba(51, 112, 255, 0.25)` (25% opacity — WCAG fail) to `2px solid #3370FF` outer ring (solid, WCAG AA pass); applies globally to all interactive elements via `:focus-visible`
- `apps/web/src/components/PrintBrief.server.tsx` (or its trigger button) updated: auto-dismiss timer removed entirely; Print-the-Brief modal/panel persists until user explicitly dismisses (persists 24h+ as specced); no `setTimeout` or equivalent timer on dismiss
- `pnpm typecheck` zero errors; no visual regressions on Storybook for affected token usages

**Files touched:**
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/global.css` (or equivalent — focus ring global rule)
- `apps/web/src/components/PrintBrief.server.tsx` (auto-dismiss removal)

---

### T99 — Status page vendor integration (Better Stack default)

**Tier:** 0
**Effort:** XS
**Dependencies:** T68 (error pages — `/status` redirect is specced in T68; T99 populates the redirect target and creates the vendor account)
**References:** PRD F46; Build Plan v2 T68 §Note on vendor selection; Q13 ship at MVP

**Acceptance criteria:**
- Better Stack account created at `status.beamixai.com` (Adam account action — cost $24/mo; noted in ticket for Adam to complete; code deliverable is the redirect only)
- `apps/web/src/app/status/redirect.ts` (or `route.ts`) created: Next.js redirect from `app.beamixai.com/status` → `status.beamixai.com` with HTTP 301
- T68's `/status` route wired to this redirect target (confirm T68's `apps/web/src/app/not-found.tsx` and `apps/web/src/app/error.tsx` both link to `/status` and the link resolves correctly to the external vendor page)
- Uptime monitors configured on Better Stack for: `app.beamixai.com` (product dashboard), `app.beamixai.com/api/health` (API health endpoint), `notify.beamixai.com` (email delivery) — Adam account action; not a code deliverable
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/status/route.ts`

---

**Updated Tier 0 Quality Gate (v3 additions):**

Beyond v2 Tier 0 gates, also require:
- T93: Heebo 300 italic loads conditionally on `[lang="he"]`; NOT in main bundle
- T94: `--duration-phase-transition: 140ms` and `--duration-seal-ceremony: 540ms` defined in `motion.css`
- T95: Google OAuth button renders as primary CTA on signup; OAuth callback preserves `scan_id` query param
- T96: Free Account + Paid Customer token groups defined and compile; `getAccountState()` function exports correctly
- T97: Smoke test script runs against staging and assertions pass; GitHub Actions workflow exits 0
- T98: WCAG AA contrast passes for 3 new `-text` variants; focus ring is solid 2px; no `setTimeout` on Print-the-Brief dismiss
- T99: `/status` redirects to `status.beamixai.com` with HTTP 301

---

## Tier 1 — Critical-Path Acquisition + Activation

*(v1 tickets T1.1–T1.8 and v2 tickets T66–T70 preserved intact. New tickets T100–T111 append below.)*

---

### T100 — `/start` route + phase state machine (Zustand store + URL params)

**Tier:** 1
**Effort:** L
**Note:** Bumped from M to L per verification audit. Scope: 9 phases + state machine + URL params + 5 entry paths + recovery handling justifies L.
**Dependencies:** T93 (Heebo font), T94 (phase-transition motion canon), T95 (Google OAuth configured), T96 (account state tokens), T0.12 (design system), T0.1 (schema — scan_id, user_id, business_id data flow)
**References:** Flow Architecture Synthesis §Option E; Q12 (approve Option E); Q13 (ship at MVP); `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §Page-level architecture

**Acceptance criteria:**
- `apps/web/src/app/start/page.tsx` created: root `/start` route that renders the current phase component based on Zustand store state
- `apps/web/src/store/start-flow.ts` created: Zustand store with:
  - `phase: Phase` — union type: `'enter-url' | 'scanning' | 'results' | 'signup-overlay' | 'vertical-confirm' | 'brief-co-author' | 'brief-signing' | 'truth-file' | 'complete'`
  - `scanId: string | null`
  - `userId: string | null`
  - `businessId: string | null`
  - `briefId: string | null`
  - `paddleSubscriptionId: string | null`
  - `setPhase(phase: Phase): void`
  - `setContextData(data: Partial<StartFlowContext>): void`
  - `reset(): void`
- URL param sync: `?phase=[phase]&scan_id=[id]` — store hydrates from URL on page load; URL updates on every phase change (browser Back button navigates to prior phase)
- Entry-path routing:
  - Direct signup (no `scan_id`): initializes at `enter-url` phase
  - "Claim this scan" from `/scan/[id]` permalink: initializes at `results` phase with `scan_id` pre-loaded (scan_id passed as `?scan_id=[id]` query param)
- Phase components (T101–T109) are dynamically imported (`next/dynamic`) per phase to minimize initial bundle
- `pnpm typecheck` zero errors; `@beamix/no-shared-easing` lint rule passes (no `transition-all` in start route files)

**Files touched:**
- `apps/web/src/app/start/page.tsx`
- `apps/web/src/store/start-flow.ts`
- `apps/web/src/types/start-flow.ts` (Phase union + StartFlowContext interface)

---

### T101 — Phase 0 `enter-url` component

**Tier:** 1
**Effort:** S
**Dependencies:** T100 (`/start` route + Zustand store must exist)
**References:** Flow Architecture Synthesis §Phase 0; Q12

**Acceptance criteria:**
- `apps/web/src/app/start/phases/EnterUrl.tsx` created: single-field form component for Phase 0
- Input: `type="url"` domain field, `placeholder="yourdomain.com"`, Inter 16px, cream paper background
- Validation: strips `https://`, `http://`, trailing slashes; rejects clearly invalid strings (no dot, >253 chars)
- Submit behavior: calls `/api/scan/start` to initiate scan, sets `scan_id` in Zustand store, transitions to `scanning` phase
- Inline validation error: "Enter a valid domain — e.g., yourdomain.com" (no "Sorry!")
- CTA button: "Scan my site →" in `--color-brand-blue` primary style; loading state during submit ("Scanning…" disabled)
- Keyboard: Enter key submits; no double-submit on rapid Enter
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/EnterUrl.tsx`

---

### T102 — Phase 1 `scanning` component (60–90s wait state)

**Tier:** 1
**Effort:** S
**Dependencies:** T100 (`/start` route), T94 (phase-transition timing), T0.12 (design system — cream paper)
**References:** Flow Architecture Synthesis §Phase 1; Q12

**Acceptance criteria:**
- `apps/web/src/app/start/phases/Scanning.tsx` created: 60–90 second wait state component
- Cream paper register (`--color-paper-cream` background); Fraunces 300 italic editorial copy
- Engagement copy: 3 rotating paragraphs shown sequentially during scan (Inter 15px, `--color-ink-2`):
  1. "We're checking how AI search engines see your business right now."
  2. "Our agents are reading what ChatGPT, Perplexity, and Gemini say about you."
  3. "Almost there — compiling your visibility score."
- Agent monogram preview: 3 agent initials (Geist Mono, `--color-ink-3`, 24px, opacity 0.4) float in the background — visual teaser of the crew waiting to work
- Progress: indeterminate linear progress bar using `--color-brand-blue` at 40% opacity; no fake percentage
- Polled via `/api/scan/status/[scan_id]`: polls every 3 seconds; on `status: 'complete'` transitions to `results` phase
- Timeout handling: if scan exceeds 120s, shows "This is taking longer than usual. We'll email your results when ready." with email capture field
- `pnpm typecheck` zero errors; `prefers-reduced-motion`: rotating copy still shows; floating monograms static

**Files touched:**
- `apps/web/src/app/start/phases/Scanning.tsx`

---

### T103 — Phase 2 `results` component (cartogram + 3 findings + signup overlay trigger)

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (`/start` route), T102 (scanning phase completes before results load), T0.12 (design system), T95 (Google OAuth — signup overlay uses it)
**References:** Flow Architecture Synthesis §Phase 2; Q12; N-3 (money-back guarantee on scan results page)

**Acceptance criteria:**
- `apps/web/src/app/start/phases/Results.tsx` created: scan results phase component
- Cartogram: renders AI visibility cartogram (engine-by-engine grid; reuses scan results display from existing `/scan` public page); Discover score displayed prominently (Fraunces 300 italic, large)
- Top 3 findings: plain-language gap summary ("ChatGPT mentions you as a category, not by name", "Perplexity found no schema.org markup"); Inter 15px, `--color-ink-1`
- Signup-overlay trigger: after 10 seconds of results display, slide-up signup overlay appears automatically (T104 component); overlay does NOT block scrolling of results behind it
- Manual trigger: "Want our agents to fix this?" CTA button always visible (does not wait 10s)
- Money-back guarantee footer: "All Beamix plans include a 14-day money-back guarantee." in Geist Mono 11px `--color-ink-3` at bottom of results — visible without scroll on desktop (per N-3, Q8)
- `pnpm typecheck` zero errors; `prefers-reduced-motion`: slide-up animation replaced with fade-in

**Files touched:**
- `apps/web/src/app/start/phases/Results.tsx`

---

### T104 — Phase 3 `signup-overlay` component

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (`/start` route), T95 (Google OAuth must be configured), T103 (results phase renders before signup-overlay slides up)
**References:** Flow Architecture Synthesis §Phase 3; Q9 (Google OAuth primary); Q12

**Acceptance criteria:**
- `apps/web/src/app/start/phases/SignupOverlay.tsx` created: bottom-sheet overlay that slides up from the bottom of Phase 2 results
- Headline: "Want our agents to fix this?" (Fraunces 300 italic, 24px)
- Primary CTA: "Continue with Google" — full-width, `--color-ink-1` background, Google "G" icon; calls `supabase.auth.signInWithOAuth({ provider: 'google' })` with state preserving `scan_id` and target phase
- Secondary CTA: "Or use email" — reveals email+password fields inline (no page navigation); Supabase email auth with link confirmation
- Tertiary options (two links below primary CTA):
  - "Save my results — email me the PDF" → captures email only, triggers PDF email via Resend, exits `/start` flow (cold lead → nurture sequence)
  - "Claim this scan later" → dismisses overlay; results remain visible for 30 minutes (localStorage timer), then overlay re-appears
- "Already have an account? Sign in →" link below all options
- On successful auth: Zustand store receives `user_id`; transitions to `vertical-confirm` phase (Phase 4)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/SignupOverlay.tsx`

---

### T105 — Phase 4 `vertical-confirm` component (confidence indicator + 1-click confirm)

**Tier:** 1
**Effort:** S
**Dependencies:** T100 (`/start` route), T104 (signup-overlay creates user before vertical-confirm loads), T0.1 (schema — businesses table, vertical enum)
**References:** Flow Architecture Synthesis §Phase 4 ("vertical-confirm"); Onboarding audit O-17 (confidence indicator is the strongest Round 1 keep — protect it)

**Acceptance criteria:**
- `apps/web/src/app/start/phases/VerticalConfirm.tsx` created
- Confidence indicator: "We're 92% sure you're [detected vertical]" — Inter 15px, `--color-ink-2`; confidence percentage derived from ML vertical detection logic (passes through from scan data)
- One-click confirm: "Yes, that's right →" button transitions immediately to `brief-co-author` phase; sets `business_id` in Zustand store via `/api/business/create` call
- Change vertical: inline vertical combobox appears on "That's not right"; options from `src/constants/industries.ts`; "Coming Soon" verticals reframed as "Generic Beamix mode" (per T122 — can be a forward dependency or inline change)
- Combobox selection confirms with same "Yes, that's right →" CTA
- No ceremony — this is a quick confirmation step; no Fraunces, no cream paper animation (Inter register)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/VerticalConfirm.tsx`

---

### T106 — Phase 5 `brief-co-author` component

**Tier:** 1
**Effort:** L
**Dependencies:** T100 (`/start` route), T105 (vertical confirmed + business_id exists before Brief authoring), T119 (pre-fill Three Claims API — T106 calls T119's endpoint to populate claims), T93 (Heebo for Hebrew Brief clauses), T94 (phase-transition timing)
**References:** Flow Architecture Synthesis §Phase 6 (called "brief-co-author"); Q3 (grounding preview ships at MVP); Q5 (quiet "Security & DPA" footer link)

**Acceptance criteria:**
- `apps/web/src/app/start/phases/BriefCoAuthor.tsx` created: cream paper Brief co-authoring component
- Layout: two-column on desktop (≥1024px), single-column on mobile
  - Left column: Brief clause chip editor (reuses onboarding Step 2 UX from T1.5); Three Claims pre-filled from scan data via T119 API (customer reviews + edits)
  - Right column (desktop only): inline citation preview panel showing what an `/inbox` item will look like with Brief grounding citation — "Authorized by your Brief: '[clause]' — clause 1 · Edit Brief →" (per Q3 decision; cream paper, Geist Mono 11px)
- Brief clauses: Fraunces 300 italic for clause display text; Inter for editing input
- Heebo fallback: `font-family: var(--font-brief-clauses-he)` on clause text (activated by T93 when `lang="he"`)
- "Security & DPA" quiet footer link during this phase: Geist Mono 10px, `--color-ink-4`, links to `/trust` (per Q5)
- CTA: "Review my Brief →" transitions to `brief-signing` phase; sends Brief data to `/api/brief/draft` endpoint
- `pnpm typecheck` zero errors; `pnpm -F @beamix/web lint` zero errors (T59 ESLint rules pass)

**Files touched:**
- `apps/web/src/app/start/phases/BriefCoAuthor.tsx`
- `apps/web/src/app/api/brief/draft/route.ts` (creates draft Brief from Phase 5 data)

---

### T107 — Phase 6 `brief-signing` component (Seal ceremony + Arc's Hand + signature)

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (`/start` route), T106 (Brief draft must exist before signing), T87 (Arc's Hand dot spec — T107 implements it in the `/start` context; T87 adds it to the `/settings` re-sign context), T0.13 (per-customer Seal SVG), T94 (`--duration-seal-ceremony: 540ms`)
**References:** Flow Architecture Synthesis §Phase 7 ("brief-signing"); Onboarding audit O-14 (14-day guarantee footer); Q5 (quiet "Security & DPA" link)

**Acceptance criteria:**
- `apps/web/src/app/start/phases/BriefSigning.tsx` created: Seal stamping ceremony phase
- Seal animation: 540ms stamp using `--ease-stamp` easing curve (T58) and `--duration-seal-ceremony` (T94); per-customer Seal SVG (T0.13)
- Arc's Hand: 1px `--color-ink-1` dot appears at t=120ms beside the Seal rightmost point, holds through stamp, fades out with Seal fade (per T87 spec)
- "— Beamix" signature: Fraunces 300 italic, opacity-fade from 0→1 beginning at t=300ms (midpoint of stamp animation)
- "Print the Brief" option visible post-stamp: links to T82 print functionality (no auto-dismiss timer per T98)
- Money-back guarantee footer: "All Beamix plans include a 14-day money-back guarantee." in Geist Mono 11px (per Q8, O-14)
- "Security & DPA" quiet footer link: same treatment as Phase 5 (per Q5)
- On Seal animation complete: calls `/api/brief/sign` endpoint; receives `brief_id`; sets `brief_id` in Zustand store; transitions to `truth-file` phase
- `prefers-reduced-motion`: Seal appears without animation; dot and signature appear without fade; transitions immediately to ready state
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/BriefSigning.tsx`
- `apps/web/src/app/api/brief/sign/route.ts` (signs Brief, creates `brief_versions` row, returns `brief_id`)

---

### T108 — Phase 7 `truth-file` component (vertical-conditional fields)

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (`/start` route), T107 (Brief signed + `brief_id` in Zustand store), T120 (hours field vertical-conditional logic — T120 is XS and should merge before T108)
**References:** Flow Architecture Synthesis §Phase 8 ("truth-file"); Onboarding audit O-18 (hours field vertical-conditional); Q5 (quiet "Security & DPA" footer)

**Acceptance criteria:**
- `apps/web/src/app/start/phases/TruthFile.tsx` created: structured data collection phase
- Fields collected:
  - Business name (pre-filled from scan domain; editable)
  - Business description (3-sentence prompt; Inter textarea)
  - Three Claims (pre-filled from Phase 5 Brief authoring; customer reviews in this step — final confirmation)
  - Business hours (vertical-conditional: SHOWN for E-commerce and Local verticals; HIDDEN for SaaS — per T120 + Q decision O-18)
  - Primary service or product category (dropdown from `src/constants/industries.ts`)
- All fields: Inter 15px, cream paper background, standard Shadcn/UI form components
- "Security & DPA" quiet footer link: same treatment as Phases 5–6 (per Q5)
- CTA: "Finish setup →" calls `/api/truth-file/create`; receives `truth_file_id`; transitions to `complete` phase
- Edge cases: if user navigates Back to Phase 6 and re-signs, `truth_file_id` is cleared and must be re-created
- `pnpm typecheck` zero errors; Zod validation schema on all fields

**Files touched:**
- `apps/web/src/app/start/phases/TruthFile.tsx`
- `apps/web/src/app/api/truth-file/create/route.ts`

---

### T109 — Phase 8 `complete` component (welcome state)

**Tier:** 1
**Effort:** S
**Dependencies:** T100 (`/start` route), T108 (truth-file complete — all context data in Zustand store), T96 (account state tokens — determines whether user sees Free Account or Paid banner on /home)
**References:** Flow Architecture Synthesis §Phase 9 ("/home" destination); Q6 (Paddle is post-onboarding, not mid-onboarding); Q12

**Acceptance criteria:**
- `apps/web/src/app/start/phases/Complete.tsx` created: success state component
- Layout: cream paper card (Shadcn card with `--color-paper-cream` background), centered on page
- Headline: "Welcome to Beamix." — Fraunces 300 italic, 32px, `--color-ink-1`
- Subtext: "Your Brief is signed. Your agents are ready." — Inter 15px, `--color-ink-2`
- Beamix Seal displayed (static — no animation on this final card)
- "Take me to my dashboard →" CTA: primary blue button, navigates to `/home`; sets `onboarding_completed_at` timestamp via UPSERT (if not already set by truth-file endpoint)
- Free Account state: user arrives at `/home` in Free Account state (no Paddle checkout yet — per Q6, Paddle modal is triggered from `/home` by "Activate agents" button, not during `/start`)
- Confetti or celebration animation: deferred (not in MVP scope — cream paper card is sufficient)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/Complete.tsx`

---

### T110 — Cross-phase animation orchestration (140ms cross-fade + Phase 6 exception)

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (`/start` route + Zustand store), T101–T109 (all phase components), T94 (phase-transition timing constants)
**References:** Flow Architecture Synthesis §Cross-phase transitions; Q12; Q13

**Acceptance criteria:**
- `apps/web/src/app/start/PhaseTransition.tsx` created: wrapper component that orchestrates cross-fade between phases
- Default transition: 140ms cross-fade using `--duration-phase-transition` and `--ease-trace-fade` (T58) for all phase-to-phase transitions
- Phase 6 exception: brief-signing phase entry uses `--ease-stamp` timing (540ms) — NO cross-fade on entry; Seal animation IS the transition
- Implementation: CSS `opacity` cross-fade using React `useEffect` + `transition`; exiting phase fades out while entering phase fades in; overlap is ≤ 70ms (half of 140ms) to prevent content collision
- Scroll position reset on every phase change (scroll to top of `/start` container)
- URL param updated on every phase change (triggers `router.replace` with new `?phase=` param; does not push to browser history — avoids double-entry)
- `prefers-reduced-motion`: all cross-fades disabled; phases snap immediately
- `pnpm typecheck` zero errors; `@beamix/no-shared-easing` lint rule passes (no `transition-all`)

**Files touched:**
- `apps/web/src/app/start/PhaseTransition.tsx`
- `apps/web/src/app/start/page.tsx` (integrates PhaseTransition wrapper)

---

### T111 — Public scan permalink "Claim this scan" CTA

**Tier:** 1
**Effort:** XS
**Dependencies:** T100 (`/start` route must exist and accept `?scan_id=` + `?phase=results` params)
**References:** Flow Architecture Synthesis §"Claim this scan" pattern; §/scan (public, unauthenticated)

**Acceptance criteria:**
- `apps/web/src/app/scan/[scan_id]/page.tsx` updated: adds a "Claim this scan" CTA button/link below the scan results (visible to unauthenticated visitors only)
- CTA text: "Claim this scan — let our agents fix these gaps" (Inter 15px, primary blue button)
- CTA link: `/start?phase=results&scan_id=[scan_id]` — routes user into `/start` at Phase 2 with the existing scan pre-loaded
- Authenticated users: CTA is replaced with "View in your dashboard →" link to `/scans/[scan_id]`
- CTA is NOT shown on private scan permalinks (where `is_public = false`; use RLS or server-side check)
- Money-back guarantee line visible on public scan permalink (same pattern as T103 Phase 2): "All Beamix plans include a 14-day money-back guarantee." — per Q8, N-3
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/scan/[scan_id]/page.tsx`

---

**Updated Tier 1 Quality Gate (v3 additions):**

Beyond v2 Tier 1 gates, also require:
- T100: `/start` route renders; Zustand store initializes; URL params hydrate phase state; Back button navigates to prior phase
- T101–T109: each phase component renders in isolation (Storybook story or Playwright snapshot)
- T110: phase cross-fade completes in ≤140ms (not Phase 6); `prefers-reduced-motion` snaps immediately
- T111: "Claim this scan" CTA renders on public permalink for unauthenticated users; link resolves to `/start?phase=results&scan_id=[id]`

---

## Tier 2 — Primary Product Surfaces

*(v1 tickets T2.1–T2.6 and v2 tickets T71–T79 preserved intact. New tickets T112–T118 append below.)*

---

### T112 — Free Account state on /home (post-Brief, pre-Paddle)

**Tier:** 2
**Effort:** M
**Dependencies:** T109 (complete phase routes to /home), T96 (account state tokens), T113 (sample /inbox data populated at same time as Free Account /home), T0.1 (schema — subscriptions table with `status` column)
**References:** Flow Architecture Synthesis §Q6 (Paddle deferred); F51 (Free Account state); Q6 decision

**Acceptance criteria:**
- `/home` page updated to detect account state via `getAccountState(userId)` (T96 utility function) server-side
- Free Account banner (when `accountState === 'free'`): uses `--color-free-account-banner-bg` and `--color-free-account-banner-border` tokens (T96); displays at top of `/home` content area (below topbar, above everything else)
- Banner copy: **canonical string — "Activate agents to start fixing this →"** (cream paper background, ink-2 text, brand-blue arrow). Free Account /home banner copy MUST be unified across all docs. Single canonical string: 'Activate agents to start fixing this →' (cream paper background, ink-2 text, brand-blue arrow).
- Banner CTA: "Activate agents →" — primary blue button; triggers T114 Paddle inline modal
- Below banner: real scan data renders (from the user's `/start` scan); /home is not a skeleton — scan results are available
- Sample `/inbox` items visible (from T113): marked with a small "Sample" label in Geist Mono 10px `--color-ink-3`
- No agent run scheduling in Free Account state (Inngest jobs do not fire for `accountState === 'free'`)
- Paid Customer state (`accountState === 'paid'`): banner hidden; `/home` renders normally per existing T2.x spec
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/home/page.tsx`
- `apps/web/src/components/FreeAccountBanner.tsx`

---

### T113 — Sample /inbox + /workspace data for Free Account state

**Tier:** 2
**Effort:** M
**Dependencies:** T112 (Free Account /home must exist to display sample data), T0.1 (schema — inbox_items table, agent_jobs table), T119 (pre-fill Three Claims API — sample inbox items are derived from scan + Brief data)
**References:** F52; Flow Architecture Synthesis §Q6; Q13

**Acceptance criteria:**
- Server-side function `apps/web/src/lib/sample-data/generate-sample-inbox.ts` created: takes `scan_id` and `brief_id`, calls Claude Haiku to generate 3–5 sample agent recommendation items based on scan findings; returns structured inbox item objects
- Each sample item includes:
  - Agent name (one of the 6 MVP agents)
  - Action summary: plain-language recommendation derived from scan gap (Inter 14px)
  - Brief grounding citation stub: "Authorized by your Brief: '[clause]'" — but clause is from the actual Brief
  - "Sample — activate to run real recommendations." label in Geist Mono 10px `--color-ink-3`
- Sample items inserted into `inbox_items` table with `status = 'sample'` (new enum value — add migration)
- Sample items are READ-ONLY: approve/reject actions are disabled on `status = 'sample'` items; clicking approve shows "Activate agents to approve real recommendations" inline message
- Sample items cleared automatically when user upgrades to Paid (Paddle webhook handler deletes `status = 'sample'` rows and triggers first real agent run)
- Sample /workspace item: one sample workflow step visible in `/workspace` in Free Account state (same "Sample" label treatment)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/lib/sample-data/generate-sample-inbox.ts`
- `apps/web/src/app/inbox/page.tsx` (sample item rendering + disabled approve/reject)
- `apps/web/src/app/workspace/page.tsx` (sample workflow step)
- `apps/web/supabase/migrations/` (`status` enum addition: `'sample'` value)

---

### T114 — Paid-activation Paddle inline modal (triggered from /home, not during onboarding)

**Tier:** 2
**Effort:** M
**Dependencies:** T112 (Free Account /home + "Activate agents" button that triggers this modal), T96 (account state tokens), T117 (money-back tier split must be specced before modal copy is finalized), T0.11 (Resend — post-checkout welcome email)
**References:** F4 Amendment v5; Q6 (Paddle inline-overlay, not redirect); Q8 (14/14/30 money-back surfacing); N-1
**Banner copy note:** The "Activate agents" CTA string that triggers this modal MUST use canonical copy: 'Activate agents to start fixing this →' (cream paper background, ink-2 text, brand-blue arrow). Free Account /home banner copy MUST be unified across all docs.

**Acceptance criteria:**
- `apps/web/src/components/PaddleActivationModal.tsx` created: full-screen overlay triggered by "Activate agents" button on /home Free Account banner
- Modal layout: cream paper card, Fraunces 300 italic headline "Choose your plan"
- Tier selector: 3 cards (Discover $79 / Build $189 / Scale $499); Discover selected by default; each card shows: price, feature bullets, money-back guarantee surfaced per tier (Discover: "14-day money-back", Build: "14-day money-back", Scale: "30-day money-back" per Q8)
- Paddle inline checkout: `Paddle.Checkout.open()` renders inline in modal (not a redirect); on `checkout.completed` event: Zustand account state updated to `'paid'`; modal closes; `/home` re-renders without Free Account banner; Resend post-checkout welcome email fires
- "Already have a code?" promo code field (optional — beneath tier cards)
- Escape key dismisses modal; returns to Free Account /home state unchanged
- `pnpm typecheck` zero errors; Paddle sandbox environment tested before production merge

**Files touched:**
- `apps/web/src/components/PaddleActivationModal.tsx`
- `apps/web/src/app/home/page.tsx` (modal trigger integration)
- `apps/web/src/app/api/webhooks/paddle/route.ts` (extend — handle Free Account → Paid state transition)

---

### T115 — Day-3 / Day-7 / Day-14 Free Account recovery emails

**Tier:** 2
**Effort:** M
**Dependencies:** T112 (Free Account state must exist — emails fire only for `accountState === 'free'` users), T114 (Paddle activation modal — email CTAs link to it; emails fire based on elapsed time since `/start` completion), T0.11 (Resend infrastructure)
**References:** F53; Q8 (money-back guarantee surfaced in emails); Voice canon Model B

**Acceptance criteria:**
- 3 Resend email templates created, each in cream-paper register:
  1. `apps/web/emails/free-account-recovery-day3.tsx` — Day 3 after `/start` completion; subject: "Your Beamix scan is waiting"; Fraunces 300 italic headline; body: scan score recap + top 1 gap from scan; CTA: "Activate agents →"; footer: "Beamix — 14-day money-back guarantee"
  2. `apps/web/emails/free-account-recovery-day7.tsx` — Day 7; subject: "Three things Beamix found on [domain]"; body: 3 specific scan findings (personalized from scan data); CTA: "Fix this →"; money-back guarantee footer
  3. `apps/web/emails/free-account-recovery-day14.tsx` — Day 14; subject: "Last call — your Beamix results"; urgency-without-dark-pattern voice ("Your scan results are still here when you're ready."); CTA: "See results →"; money-back guarantee footer; soft opt-out link: "Don't want these? [unsubscribe]"
- Inngest function `apps/web/inngest/functions/free-account-recovery.ts`: triggered daily; queries all `accountState === 'free'` users; fires correct template based on `(today - onboarding_completed_at)` in days
- Voice canon Model B compliance: emails signed "— Beamix" not "— your crew" or agent names
- No AI labels in email body
- Resend list: recovery emails sent via `notify.beamixai.com`; unsubscribe honored immediately
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/emails/free-account-recovery-day3.tsx`
- `apps/web/emails/free-account-recovery-day7.tsx`
- `apps/web/emails/free-account-recovery-day14.tsx`
- `apps/web/inngest/functions/free-account-recovery.ts`

---

### T116 — Agent-run caps during refund window

**Tier:** 2
**Effort:** S
**Dependencies:** T117 (money-back tier split defines refund window durations — T116 must run after T117), T114 (Paddle activation modal — refund window starts at Paddle checkout completion), T0.1 (schema — agent run tracking, subscription `paddle_checkout_at` timestamp)
**References:** F54; Q8 (14/14/30 refund window defines the cap duration)

**Acceptance criteria:**
- Hard cap per tier during refund window (days 1 through refund_window_days from Paddle checkout):
  - Discover ($79): 5 agent runs
  - Build ($189): 10 agent runs
  - Scale ($499): 20 agent runs
- Cap enforcement in Inngest agent-execute function: before each agent run, query `agent_jobs` count WHERE `user_id = $1 AND created_at > $paddle_checkout_at AND created_at < $paddle_checkout_at + $refund_window_days`; if count ≥ cap, reject run with `status = 'capped'`
- Customer notification: inline /home banner when cap is approached (≥80% of cap used): "You've used [N] of [cap] agent runs during your trial period. [cap - N] remaining."
- Customer notification at cap: "You've used your [tier] trial runs. Your agents will resume automatically after [refund window end date]."
- Disclosure during onboarding: Phase 8 (Complete) component (T109) mentions cap in Geist Mono 11px footer: "Your first [N] agent runs are included during the [X]-day trial period."
- After refund window ends: cap lifted automatically; agent runs resume without customer action
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/inngest/functions/agent-execute.ts` (cap enforcement gate)
- `apps/web/src/app/home/page.tsx` (cap banner integration)
- `apps/web/src/app/start/phases/Complete.tsx` (cap disclosure footer — T109 integration)

---

### T117 — Money-back tier split: Discover 14d / Build 14d / Scale 30d

**Tier:** 2
**Effort:** XS
**Dependencies:** T114 (Paddle activation modal — refund window surface), T74 (graceful cancellation — refund window affects cancellation flow logic)
**References:** F35 Amendment v5; Q8 decision; `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §N-3

**Acceptance criteria:**
- `apps/web/src/lib/paddle/refund-windows.ts` created: constant map `REFUND_WINDOW_DAYS: Record<PlanTier, number> = { discover: 14, build: 14, scale: 30 }` exported as the canonical source of truth
- Paddle webhook handler `apps/web/src/app/api/webhooks/paddle/route.ts` updated: on `subscription.created`, stores `paddle_checkout_at` timestamp and reads `plan_tier` from Paddle price metadata; associates correct `refund_window_days` with the subscription record
- All UI surfaces that surface the guarantee updated to use `REFUND_WINDOW_DAYS[tier]` rather than a hardcoded "14 days": T103 (Phase 2 results footer), T107 (Phase 6 signing footer), T114 (Paddle activation modal tier cards), T111 (scan permalink footer)
- Cancellation flow in T74 updated: reads `REFUND_WINDOW_DAYS[tier]` to display correct guarantee duration in cancel confirmation modal
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/lib/paddle/refund-windows.ts`
- `apps/web/src/app/api/webhooks/paddle/route.ts`

---

### T118 — Activation event redefinition: first /inbox approval within 7 days post-Paddle-checkout

**Tier:** 2
**Effort:** S
**Dependencies:** T114 (Paddle activation modal — trial clock starts here), T113 (sample /inbox data — sample approvals do NOT count as activation), T112 (Free Account /home)
**References:** Onboarding audit O-5; Q4 decision (24h → 7d per Q7); Q7 decision; `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` §N-2; Marcus Day-14 evangelism trigger (F12) must be recalculated from activation date

**Acceptance criteria:**
- `apps/web/src/lib/activation.ts` created: `ACTIVATION_WINDOW_DAYS = 7` constant; `recordActivation(userId: string): Promise<void>` function that sets `subscriptions.activated_at = now()` and fires `customer/activated` Inngest event
- Activation trigger: fires on first `/inbox` item approval WHERE `inbox_items.status = 'approved'` AND `inbox_items.status != 'sample'` AND approval timestamp is within 7 days of `subscriptions.paddle_checkout_at`
- Late activation (approval after 7-day window): does NOT count as "activated" for lifecycle analytics; still recorded as `subscriptions.first_approval_at` for operational metrics
- Analytics event updated: `analytics.track('customer_activated', { userId, daysAfterCheckout, planTier })` — replaces any prior 24h activation event
- Marcus Day-14 evangelism trigger (F12 / T1.3 or equivalent): recalculated from `subscriptions.activated_at` (not from `paddle_checkout_at`); Day 14 from activation date, not checkout date
- Sample inbox item approvals: `inbox_items.status = 'sample'` approvals explicitly excluded from activation logic (server-side guard)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/lib/activation.ts`
- `apps/web/src/app/api/inbox/[id]/approve/route.ts` (integrates `recordActivation` call)
- `apps/web/inngest/functions/agent-execute.ts` (Marcus Day-14 trigger timing update)

---

## Tier 3 — Secondary Product Surfaces + Onboarding Audit Fixes

*(v1 tickets T3.1–T3.5 and v2 tickets T80–T87 preserved intact. New tickets T119–T128 append below.)*

---

### T119 — Pre-fill Three Claims from scan data (server-side API)

**Tier:** 1
**Effort:** S
**Dependencies:** T0.1 (schema — scan data must be in DB), T0.4 (types — scan result schema), T106 (Phase 5 BriefCoAuthor calls this endpoint — T119 must merge before T106 goes to production)
**Dependency note:** BLOCKS T106 (Phase 5 BriefCoAuthor — same Tier 1; T119 must complete first)
**References:** Onboarding audit O-4 (highest CRO leverage); Q3 decision; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-4

**Acceptance criteria:**
- `apps/web/src/app/api/brief/prefill/route.ts` created: `POST /api/brief/prefill` endpoint
- Request body: `{ scan_id: string; brief_draft: { clauses: string[] } }` (Zod validated)
- Server-side logic: reads scan results for `scan_id` (FAQs, services detected, brand language extracted from scan engine results); sends to Claude Haiku with a structured prompt that generates 3 draft Brief claims from the scan data; returns `{ prefilled_claims: string[3] }`
- Response: 3 claims in plain English, 1-2 sentences each, from the customer's perspective ("We help [target customers] to [outcome]" pattern)
- Endpoint is authenticated (requires valid session cookie); scan_id must belong to the authenticated user OR be an unconverted free scan linked to the session
- Fallback: if scan data is insufficient (too few engine results), returns 3 generic prompt starters: ["What makes your business unique:", "Who your ideal customers are:", "What outcome you deliver:"]
- Response time target: ≤ 8 seconds (Claude Haiku — fast path); client shows "Generating your claims…" spinner during wait
- `pnpm typecheck` zero errors; Zod schema for request + response

**Files touched:**
- `apps/web/src/app/api/brief/prefill/route.ts`

---

### T120 — Step 4 hours field vertical-conditional

**Tier:** 1
**Effort:** XS
**Dependencies:** T108 (TruthFile phase component — T120's logic is consumed by T108; must merge before or in same PR as T108)
**Dependency note:** BLOCKS T108 (Phase 7 TruthFile — same Tier 1; T120 must complete first)
**References:** Onboarding audit O-18; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-18; Q decision O-18

**Acceptance criteria:**
- `apps/web/src/lib/vertical-conditions.ts` created (or extended if file exists): `shouldShowHoursField(vertical: string): boolean` — returns `false` for `'saas'`, `true` for all other verticals (E-commerce, Local, Healthcare, Legal, etc.)
- TruthFile component (T108) consumes `shouldShowHoursField(vertical)` to conditionally render the hours field
- Hours field when hidden: entirely removed from DOM (not just `display: none`) so it does not submit empty data or cause validation errors
- Hours field when shown: existing UX (time range picker or text input); no changes to the field itself
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/lib/vertical-conditions.ts`
- `apps/web/src/app/start/phases/TruthFile.tsx` (consumes `shouldShowHoursField`)

---

### T121 — Skip-cinema for repeat-Brief users (agency partial relief)

**Tier:** 3
**Effort:** S
**Dependencies:** T100 (`/start` route + Zustand store), T107 (BriefSigning phase is the "cinema" being skipped), T0.1 (schema — briefs table with customer's prior Brief count)
**References:** Onboarding audit O-19; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-19; Q1 (Yossi agency batch at MVP+30; this ticket is the MVP partial relief)

**Acceptance criteria:**
- Server-side check in `/start` route load: `SELECT COUNT(*) FROM briefs WHERE owner_id = $user_id AND status = 'signed'`; if count ≥ 1, user is a "repeat Brief" user
- For repeat-Brief users: "skip cinema" option appears at the bottom of Phase 5 (BriefCoAuthor): "You've done this before. Skip the ceremony and use defaults →" — Geist Mono 11px, `--color-ink-3`
- Skip behavior: bypasses BriefSigning ceremony animation (540ms); Brief is signed immediately server-side; transitions directly to TruthFile phase; Seal is shown as a static stamp (no animation)
- Brief signing still happens (audit trail preserved); only the ceremony UI is skipped
- Non-repeat users (count = 0): no skip option shown; full ceremony plays
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/page.tsx` (repeat-Brief check on load)
- `apps/web/src/app/start/phases/BriefCoAuthor.tsx` (skip-cinema link)
- `apps/web/src/app/start/phases/BriefSigning.tsx` (skip mode: static Seal + immediate transition)

---

### T122 — "Coming Soon" vertical reframe

**Tier:** 3
**Effort:** XS
**Dependencies:** T105 (VerticalConfirm phase uses the vertical combobox — T122 updates combobox labels)
**References:** Onboarding audit O-15; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-15

**Acceptance criteria:**
- All "Coming Soon" vertical badge labels replaced in `apps/web/src/constants/industries.ts` and any component that renders them: the string "Coming Soon" does not appear in any vertical option
- Replacement copy for non-MVP verticals: "Generic Beamix mode — full feature set, vertical-tuning coming later"
- Replacement is inline text (no badge, no icon) in Inter 13px `--color-ink-3` beneath the vertical option label in the combobox dropdown
- MVP verticals (SaaS, E-commerce) show NO annotation — only non-MVP verticals show the reframe copy
- Copy does NOT commit to a date or release name ("coming later" — no "Q3 2026" or similar)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/constants/industries.ts`
- `apps/web/src/app/start/phases/VerticalConfirm.tsx` (combobox dropdown rendering)

---

### T123 — 14-day money-back guarantee surfacing (scan results + signing phases)

**Tier:** 3
**Effort:** XS
**Dependencies:** T117 (money-back tier split — `REFUND_WINDOW_DAYS` constant provides correct values per tier), T103 (Phase 2 Results), T107 (Phase 6 BriefSigning), T111 (scan permalink)
**References:** Onboarding audit O-14; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-14; N-3; Q8

**Acceptance criteria:**
- Guarantee line added to 3 surfaces (if not already added by T103, T107, T111 which may include it inline — confirm no duplication):
  1. Phase 2 results footer: "All Beamix plans include a 14-day money-back guarantee." — Geist Mono 11px `--color-ink-3`
  2. Phase 6 BriefSigning footer: same line (for Scale: "30-day money-back guarantee" once tier is known post-T114 Paddle selection — use 14d as default pre-selection)
  3. Public scan permalink (`/scan/[scan_id]`): same line below results
- All three instances use `REFUND_WINDOW_DAYS` from T117 for the correct tier-aware text post-Paddle selection; pre-selection defaults to 14d
- No "Sorry!", no exclamation points, no dark patterns in the guarantee copy
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/Results.tsx` (verify guarantee line present; add if missing)
- `apps/web/src/app/start/phases/BriefSigning.tsx` (verify guarantee line present; add if missing)
- `apps/web/src/app/scan/[scan_id]/page.tsx` (verify guarantee line present; add if missing)

---

### T124 — Dual-tab Brief lock (optimistic tab-lock + Postgres advisory lock)

**Tier:** 3
**Effort:** M
**Dependencies:** T106 (BriefCoAuthor phase — lock applied here), T0.1 (schema — briefs table), T0.5 (Inngest not required; lock is server-side Postgres)
**References:** Onboarding audit O-11; Failure mode FM-04; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-11

**Acceptance criteria:**
- Postgres advisory lock acquired when user enters BriefCoAuthor phase: `SELECT pg_try_advisory_lock(brief_id::bigint)` via Supabase RPC at phase entry
- Lock held for 90 seconds (server-side TTL via Supabase edge function or Inngest step); released on phase exit (sign or navigate away)
- Optimistic client-side tab detection: if a second tab opens the same Brief session (same `brief_id` in Zustand + URL), the newer tab shows: "Another tab is editing this Brief. Return to that tab or take over." — Fraunces 300 italic, cream paper
- "Take over" action: acquires advisory lock on the new tab; releases on the prior tab (prior tab shows "This tab is no longer editing." + "Return to start →" link)
- Advisory lock release: fires on `beforeunload` event (window close) + on explicit phase transition away from BriefCoAuthor
- If lock fails (lock held by another session): show "Someone on your team is editing this Brief right now. Try again in a moment." (edge case for team seat accounts, T72)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/phases/BriefCoAuthor.tsx` (lock acquire/release + UI state)
- `apps/web/src/app/api/brief/lock/route.ts` (acquire and release endpoints)
- `apps/web/supabase/migrations/` (Supabase RPC wrapper for `pg_try_advisory_lock` if needed)

---

### T125 — Brief consistency check pre-Seal (Claude Haiku fast check)

**Tier:** 3
**Effort:** S
**Dependencies:** T107 (BriefSigning phase — consistency check fires before Seal animation begins), T119 (pre-fill API — if claims are pre-filled, they may have less contradiction risk; still check)
**References:** Onboarding audit O-12; Failure mode FM-11; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-12

**Acceptance criteria:**
- `apps/web/src/app/api/brief/consistency-check/route.ts` created: `POST /api/brief/consistency-check` endpoint
- Request body: `{ clauses: string[] }` (all Brief clauses; Zod validated)
- Server-side: sends clauses to Claude Haiku with prompt: "Check these Brief clauses for contradictions. Reply with JSON: `{ contradictions: [{ clause_a: number, clause_b: number, description: string }] }`. If no contradictions, return empty array."
- Response: `{ contradictions: Array<{ clause_a: number, clause_b: number, description: string }> }`
- BriefSigning phase integration: before initiating Seal animation, calls this endpoint; if `contradictions.length > 0`, shows inline contradiction panel:
  - Yellow warning card (cream paper, amber border): "We found a conflict in your Brief:" + list of contradiction descriptions
  - Two actions: "Fix it" (navigates back to BriefCoAuthor phase) or "Sign anyway" (proceeds with Seal animation despite contradictions; logs `has_contradictions: true` on the Brief record)
- If `contradictions.length === 0` or API call fails (timeout > 3s): proceeds with Seal animation immediately (fail-open — don't block signing on API failure)
- Response time target: ≤ 3 seconds (Claude Haiku fast path); spinner shown during check
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/api/brief/consistency-check/route.ts`
- `apps/web/src/app/start/phases/BriefSigning.tsx` (pre-Seal check integration)

---

### T126 — Orphan Twilio numbers cleanup cron (with REST DELETE step)

**Tier:** 3
**Effort:** S
**Dependencies:** T74 (graceful cancellation — abandoned accounts trigger same cleanup path), T0.5 (Inngest — cron job), T0.1 (schema — customers/subscriptions `deleted_at` column)
**References:** Onboarding audit O-7; Failure mode FM-19; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-7; T74 (prior Twilio release cron — T126 extends it)

**Acceptance criteria:**
- `apps/web/inngest/functions/twilio-release.ts` (created by T74) extended: a new step added for "orphan cleanup" distinct from the 90-day grace-period release
- Orphan definition: Twilio numbers whose `customer_id` maps to an account with `onboarding_completed_at IS NULL AND created_at < NOW() - INTERVAL '30 days'` — user started `/start` but never completed onboarding
- Orphan cleanup cron: runs daily; queries Supabase for orphan accounts; for each orphan account, calls Twilio REST API `DELETE /2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers/{PhoneNumberSid}` for each number with `friendly_name LIKE '%[customer_id]%'`
- Cost impact: $1.25/mo per orphan number; target: zero orphan numbers older than 30 days
- Audit log: each Twilio DELETE logged to Supabase `operations_log` table (number, customer_id, deleted_at, success/failure)
- Failure handling: if Twilio API returns non-2xx, log error + retry once; after 2 failures, flag for manual review (admin email to Adam's address)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/inngest/functions/twilio-release.ts` (orphan cleanup step addition)
- `apps/web/supabase/migrations/` (`operations_log` table if not already in schema)

---

### T127 — Mobile Step 5 typography fix (Fraunces 22px → 18px/28px at <600px)

**Tier:** 3
**Effort:** XS
**Dependencies:** T106 (BriefCoAuthor phase — the Brief clause display at Step 5/Phase 5 is what breaks on mobile)
**References:** Onboarding audit O-10; Form-factor audit §mobile Step 3 (renamed Phase 5 in Option E); `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-10

**Acceptance criteria:**
- `apps/web/src/styles/typography.css` (or Tailwind config) updated with mobile responsive rule:
  - Fraunces clause text: `font-size: 22px` at ≥600px (existing), `font-size: 18px; line-height: 28px` at <600px (new breakpoint rule)
  - Applied specifically to `.brief-clause-text` class (or equivalent selector used in BriefCoAuthor.tsx clause display)
- BriefCoAuthor.tsx (T106) uses the `.brief-clause-text` class on all clause display elements
- Visual test: render Phase 5 (BriefCoAuthor) at 375px width (iPhone SE); confirm no clause text wraps at ≤3 words per line
- `pnpm typecheck` zero errors; no Tailwind `transition-all` usage (lint rule T59 passes)

**Files touched:**
- `apps/web/src/styles/typography.css`
- `apps/web/src/app/start/phases/BriefCoAuthor.tsx` (class name applied to clause text)

---

### T128 — `useReducedMotion()` hook coverage on Rough.js animations

**Tier:** 3
**Effort:** XS
**Dependencies:** T0.12 (design system), T87 (Arc's Hand animation — must respect reduced motion), T107 (BriefSigning phase — Seal animation), T80 (Cycle-Close Bell wave — must respect reduced motion)
**References:** Onboarding audit O-8 (WCAG 2.2.1); `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-8

**Acceptance criteria:**
- `apps/web/src/hooks/useReducedMotion.ts` created (or verified to exist): standard `matchMedia('(prefers-reduced-motion: reduce)')` hook returning `boolean`
- Coverage audit: the following animation components must import and respect `useReducedMotion()`:
  1. `SealStamp.tsx` — if `reducedMotion`, Seal renders statically (no stamp animation, no Arc's Hand dot fade)
  2. `CycleCloseBell.tsx` — if `reducedMotion`, wave animation skipped; settle animation still plays (non-decorative)
  3. `SmallMultiplesStrip.tsx` (T80) — if `reducedMotion`, wave skipped
  4. Any Rough.js component (counter animations, ring draws) — if `reducedMotion`, Rough.js renders final state without animation
- WCAG 2.2.1 compliance: no time limits on motion; `prefers-reduced-motion` is respected globally
- `pnpm typecheck` zero errors; grep for `useReducedMotion` confirms all 4+ components import it

**Files touched:**
- `apps/web/src/hooks/useReducedMotion.ts`
- `apps/web/src/components/SealStamp.tsx`
- `apps/web/src/components/CycleCloseBell.tsx`
- `apps/web/src/components/SmallMultiplesStrip.tsx`

---

## Tier 4 — Power-User Features

*(v1 tickets T4.1–T4.3 preserved intact. No new Tier 4 tickets in v3.)*

---

## Tier 5 — Post-MVP / MVP+30 / MVP+90

*(v1 tickets T5.1–T5.6 and v2 tickets T88–T92 preserved intact. New tickets T129–T133 append below.)*

---

### T129 — SOC 2 Type I observation period note (T89 update)

**Tier:** 5 (tracking only — no code change required)
**Effort:** tracking only
**Dependencies:** T89 (SOC 2 auditor engagement ticket — T129 is a tracking amendment, not a replacement)
**References:** Onboarding audit O-16; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-16; T89

**Note:** SOC 2 Type I report ships at MVP+90. The observation period MUST start at MVP launch for the 90-day observation to be valid. This ticket is a reminder to Adam that the auditor engagement (T89) and observation start date are time-locked to MVP launch day. No code deliverable.

**Acceptance criteria:**
- Auditor engagement (T89 prerequisite) confirmed with start date before or on MVP launch day
- `/trust/compliance` page (T66 + T89) shows "Observation period in progress" with the actual MVP launch date as the start date — not a placeholder
- This ticket is CLOSED when T89 is marked complete with a real start date in the compliance page
- No code files touched beyond what T89 already specifies

**Files touched:** None (Adam operational action; T89 compliance page updated with real date)

---

### T130 — F48 Yossi Agency Batch Onboarding (MVP+30)

**Tier:** 5 (MVP+30)
**Effort:** L
**Dependencies:** T100 (`/start` route state machine), T106 (BriefCoAuthor phase), T121 (skip-cinema for repeat-Brief users is the MVP partial relief that precedes T130), T79 (Scale multi-domain cockpit)
**References:** Onboarding audit O-1; `2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` §O-1; F48 (new feature added by v3 — not in v1 or v2)

**Acceptance criteria:**
- Multi-client cockpit on `/home` (Scale tier) upgraded with "Add client" batch flow distinct from the standard `/start` onboarding
- Batch flow entry: "Add another client" button in cockpit → opens abbreviated `/start` flow for client #2+:
  - Phase 0 (enter-url): unchanged
  - Phase 1 (scanning): unchanged
  - Phase 2 (results): unchanged — each client gets full results
  - Phase 3 (signup-overlay): SKIPPED (user already authenticated)
  - Phase 4 (vertical-confirm): unchanged — each client may be a different vertical
  - Phase 5 (brief-co-author): pre-filled from prior client's Brief (customer edits diffs, not full re-authoring); claim count reduced to 1 mandatory + 2 optional for client #3+
  - Phase 6 (brief-signing): full Seal ceremony for client #2; skip-cinema option for client #3+
  - Phase 7 (truth-file): unchanged
  - Phase 8 (complete): shows multi-client cockpit view, not single /home
- Per-client abbreviated ceremony target: ≤ 2 minutes for client #2; ≤ 90 seconds for client #3+
- Optional "skip ceremony, accept defaults" for client #3+ (Scale tier only): creates Brief from prior client defaults, signs without customer review; shows audit note "Brief auto-accepted from client defaults" in Brief audit trail
- "We saved your progress on [N] of [total] clients — finish when ready" recovery email if batch is abandoned mid-flow (Inngest cron, Day 7)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/start/page.tsx` (batch mode flag + abbreviated phase config)
- `apps/web/src/app/home/cockpit.tsx` ("Add another client" button + batch entry)
- `apps/web/emails/yossi-batch-recovery.tsx` (recovery email template)
- `apps/web/inngest/functions/batch-onboarding-recovery.ts`

---

### T131 — F49 Embeddable Score Badge (MVP+30)

**Tier:** 5 (MVP+30)
**Effort:** M
**Dependencies:** T111 (public scan permalink — badge click-through goes to `/scan/[scan_id]`), T0.1 (schema — scan scores stored in DB), T0.12 (design system — badge styling)
**References:** Flow Architecture Synthesis §N-5; Q10 decision (MVP+30); F49 (new feature added by v3)

**Acceptance criteria:**
- Badge generator page at `/settings/badge` (authenticated): shows a live preview of the Beamix score badge; provides embed code (HTML `<script>` tag + `<img>` fallback)
- Badge visual: "AI Search Visibility: [score]/100 — Verified by Beamix" in Geist Mono; Beamix Seal at left; blue score indicator; width 320px × height 60px
- Badge serves as a signed SVG/PNG from `apps/web/src/app/api/badge/[scan_id]/route.ts`: endpoint verifies `scan_id` is public; returns SVG with current score embedded; cache-control 24h
- Script tag embed: `<script src="https://app.beamixai.com/badge.js" data-scan-id="[id]"></script>` — lightweight script (≤2KB) that appends the badge image to the nearest parent element
- Badge is only available when scan permalink is public (per customer's privacy setting)
- Click-through: badge links to `/scan/[scan_id]` public permalink — the viral acquisition moment (per Flow Architecture Synthesis §N-5)
- Badge copy format: "Verified by Beamix" not "Powered by AI" (no AI labels per rule)
- `pnpm typecheck` zero errors; badge SVG renders correctly in Safari, Chrome, Firefox

**Files touched:**
- `apps/web/src/app/settings/badge/page.tsx`
- `apps/web/src/app/api/badge/[scan_id]/route.ts`
- `apps/web/public/badge.js`

---

### T132a — Public Dogfooding Scan: BUILD (Tier 1, MVP)

**Tier:** 1
**Effort:** S
**Dependencies:** T100 (`/start` route + scan infrastructure), T140 (State of AI Search data instrumentation — data accumulates from Day 1)
**References:** Flow Architecture Synthesis §N-6; Q11 decision (build at MVP, publish at MVP+30); F50 (new feature added by v3)

**Acceptance criteria:**
- Inngest cron set up for Beamix's own domain (`beamixai.com`) scan; runs weekly from MVP launch Day 1
- Scan results stored in production DB as a real customer scan with a dedicated `scan_id`; data accumulates from Day 1
- Permalink at `/scan/beamixai.com` (or `/scan/[beamix_scan_id]`) exists in codebase and renders correctly — but is NOT publicly announced at MVP (direct-link-only; private during MVP)
- Supabase row created in `scans` table for `beamixai.com`
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/inngest/functions/dogfood-scan.ts` (weekly cron)
- Supabase row in `scans` table for `beamixai.com`

---

### T132b — Public Dogfooding Scan: PUBLISH (Tier 5, MVP+30)

**Tier:** 5
**Effort:** S
**Dependencies:** T132a (BUILD must complete first; permalink must exist before publishing)
**References:** Q11 decision; F50; editorial framing spec

**Acceptance criteria:**
- `/scan/beamixai.com` permalink made publicly accessible (remove any auth guard if present)
- Editorial framing on the public scan page: Fraunces 300 italic note: "This is Beamix scanning itself. We publish our own results because we believe in the work." (Inter 15px below) — no marketing copy
- `/changelog` entry added announcing the public page
- Adam publishes social post at MVP+30 milestone
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/scan/[scan_id]/page.tsx` (editorial framing component — conditional on `is_beamix_scan` flag)
- `/changelog` entry

---

### T133 — Plausible-style "X uses Beamix" transparency page (opt-in aggregate scan permalinks)

**Tier:** 5 (MVP+30)
**Effort:** M
**Dependencies:** T132 (dogfooding scan — Beamix's own scan is the seed entry), T111 (public scan permalink infrastructure), T0.1 (schema — scan privacy settings)
**References:** Flow Architecture Synthesis §N-6; F50 support; Q11 decision; Q10 (embeddable badge drives opt-in traffic to this page)

**Acceptance criteria:**
- `/wall` route (or `/transparency`) created: public page listing anonymous customer scan permalinks that have opted into public visibility
- Opt-in toggle: in `/settings` → Privacy & Data tab (T73) — "Include my scan in Beamix's public wall" (default OFF; explicit opt-in only)
- Each wall entry: scan score, domain (or "Anonymous business in [vertical]" if customer opts for anonymity), scan date, "View scan →" link to public permalink
- Beamix's own scan (`beamixai.com`) is always pinned first on the wall (T132)
- Wall sorted by scan score descending; filter by vertical (dropdown)
- Wall does not show customer name, email, or any PII — domain + score + vertical only
- "X businesses trust Beamix with their AI visibility" — count shown at top (Fraunces 300 italic, large)
- Cream paper editorial register; no dark mode on this surface (light-forever per T65 partition)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/app/wall/page.tsx`
- `apps/web/src/app/api/wall/route.ts`
- `apps/web/src/app/settings/privacy/page.tsx` (opt-in toggle — T73 integration)
- `apps/web/supabase/migrations/` (`include_in_wall: boolean` column on scans or businesses table)

---

## NEW TICKETS — Added 2026-05-05 from verification audit findings

### T134 — Cookie Consent Banner (Tier 1, MVP)
**Maps to:** F56 (PRD v5.1 Patch P12)
**Acceptance criteria:**
- Bottom-anchored banner on first visit; cream paper register; not modal
- Three buttons (Accept all / Essential only / Customize) with cookie categories
- GDPR + Israeli compliance (no pre-checked boxes)
- Settings page revoke flow + 12-month re-prompt
**Files:** `apps/web/src/components/cookie-banner.tsx`, `apps/web/src/app/api/consent/route.ts`, Settings page section
**Effort:** S
**Deps:** none

### T135 — Sentry / error monitoring (Tier 0)
**Maps to:** Strategic completeness audit gap
**Acceptance criteria:**
- `@sentry/nextjs` integration, source maps, env vars
- Server + client error capture, performance monitoring optional
- Slack alert webhook for Sev-1 errors
**Files:** `apps/web/sentry.client.config.ts`, `apps/web/sentry.server.config.ts`, Vercel env vars
**Effort:** XS (~1 day)
**Deps:** none

### T136 — Structured logging + log aggregation (Tier 0)
**Maps to:** Strategic completeness audit gap
**Acceptance criteria:**
- `pino` logger + Better Stack (Logtail) integration
- Request ID middleware + structured fields
- Log retention 30 days minimum
**Files:** `apps/web/src/lib/log.ts`, middleware additions, API route logging
**Effort:** XS (~1 day)
**Deps:** none

### T137 — Playwright + Lighthouse perf CI gate (Tier 0)
**Maps to:** Vercel Round 2 + Linear Round 2 reviews; verify T63 status
**Acceptance criteria:**
- GitHub Actions workflow on every PR
- Failure thresholds: /start ≤120ms warm, /home ≤95KB, /scans ≤110KB, Workflow Builder ≤220KB
- Bundle size diff vs main branch reported in PR comment
**Files:** `.github/workflows/perf-gate.yml`, Playwright config + Lighthouse CI config
**Effort:** S (~2-3 days)
**Deps:** T100 (need /start route to test)

### T138 — Tailwind RTL plugin + global RTL audit (Tier 1)
**Maps to:** PRD v5.1 Patch P13 + Audit 4 Dani gap
**Acceptance criteria:**
- `tailwindcss-rtl` plugin installed + configured
- All 7 dashboard surfaces (/home, /inbox, /workspace, /scans, /competitors, /crew, /settings) audited for RTL correctness
- Cartogram + monograms tested per pixel spec
- Geist Mono technical content gets explicit `dir="ltr"`
**Files:** `apps/web/tailwind.config.ts` + per-component class flips
**Effort:** M (~3-5 days)
**Deps:** T100, T62 (block primitives need RTL-aware)

### T139 — Multi-client cockpit MVP partial (Tier 2, MVP)
**Maps to:** Audit 4 Yossi gap; partial-relief before F48 ships at MVP+30
**Acceptance criteria:**
- For Scale-tier customers with ≥2 active domains, /home shows compact cockpit table
- Columns: domain, score, status, last-action
- Full agency mode (F48) ships at MVP+30 (T130)
**Files:** `apps/web/src/components/multi-client-cockpit.tsx`, /home conditional layout
**Effort:** M (~3-4 days)
**Deps:** T100, T112 (Free Account /home)

### T140 — State of AI Search data instrumentation (Tier 0)
**Maps to:** PRD v5.1 Patch P11 (F47 amendment)
**Acceptance criteria:**
- `state_of_search_eligible` consent flag at Phase 7 truth-file
- Tables: `engine_consistency_metrics`, `vertical_citation_patterns`, `cohort_visibility_decay`
- Daily aggregation Inngest job from MVP launch day 1 (cron `0 3 * * *`)
- Data retention 12+ months
**Files:** Supabase migrations + `apps/web/src/inngest/functions/aggregate-state-of-search.ts`
**Effort:** M (~3 days)
**Deps:** none (foundational; UNBLOCKS T90 F47 production at MVP+90)

### T141 — Pre-Brief abandonment recovery email (Tier 2, MVP)
**Maps to:** PRD v5.1 F55 (Patch P10)
**Acceptance criteria:**
- Day 1 + Day 3 + Day 7 emails for signup-but-no-Brief users
- Cream paper register, Fraunces 300 italic, voice canon Model B
- Stop sending on Brief sign or unsubscribe
**Files:** 3 Resend templates + Inngest scheduled job
**Effort:** S (~2 days)
**Deps:** T115 (recovery email infrastructure)

### T142 — Paddle webhook checkout.failed handling (Tier 2, MVP)
**Maps to:** F4 Amendment edge case + Audit 4 §4
**Acceptance criteria:**
- User-friendly message on card decline + retry option
- Manual invoice fallback for Scale tier
- 3DS challenge UI flow
**Files:** `apps/web/src/app/api/webhooks/paddle/route.ts`, retry UI component
**Effort:** S (~1-2 days)

### T143 — Mid-trial tier upgrade rules (Tier 2, MVP)
**Maps to:** Audit 4 §4 edge case
**Acceptance criteria:**
- Customer pays Discover then upgrades to Build mid-trial → pro-rate + carry-forward existing trial days
- Paddle subscription update logic
- Confirmation email
**Files:** Paddle subscription update handler
**Effort:** S (~2 days)

### T144 — Twilio provisioning failover (Tier 2, MVP)
**Maps to:** Audit FM-17 + Audit 4 §4
**Acceptance criteria:**
- Regional shortage in IL/EU/US → fallback to next available region
- UI note "Provisioned a [US] number due to regional availability — works for your audience"
- Track + alert (Slack webhook)
**Files:** `apps/web/src/lib/twilio/provision.ts`
**Effort:** S (~2 days)

### T145 — Customer domain offline retry handling (Tier 2, MVP)
**Maps to:** Audit 4 §4 edge case
**Acceptance criteria:**
- Inngest scan retries with exponential backoff (5min/30min/2h/12h/24h)
- After final failure, banner on /home: "Your domain wasn't reachable in our last scan"
**Files:** `apps/web/src/inngest/functions/scan-retry.ts`
**Effort:** S (~1-2 days)

### T146 — Audit + complete 18 Resend templates (Tier 1, MVP)
**Maps to:** Audit 2 §7 gap + T0.11 verification
**Acceptance criteria:**
- All 18 templates exist (15 v4 + 3 new free-account-recovery from T115)
- List: trial-end, welcome, brief-approval-confirmation, monthly-update-notification, marcus-day-14-evangelism, scan-complete, agent-shipped-action, weekly-digest, billing-receipt, password-reset, team-invite, twilio-provisioned, beamix-did-not-do-notification, free-account-recovery-day-3/7/14, plus pre-brief-abandonment-day-1/3/7 (from T141)
- Cream paper register where appropriate, voice canon Model B
**Files:** `apps/web/emails/*.tsx`
**Effort:** M (~5-7 days for any missing templates)

### T147 — Refund-rate KPI dashboard (Tier 2, MVP)
**Maps to:** PRD v5 F35 amendment + Audit 4 risk register
**Acceptance criteria:**
- Track refund rate weekly per tier (Discover/Build/Scale)
- Alert via Slack webhook if >20% on any tier
- Visible to Adam in /admin route
**Files:** `apps/web/src/app/admin/refund-dashboard/page.tsx` + Slack webhook
**Effort:** S (~2 days)

---

## Updated Dependency Graph (v3 additions)

Cross-tier dependencies for new tickets only. v1 and v2 dependency graphs preserved intact.

```
Tier 0 (new):
T93 (Heebo) ────────────────────────────────────► T106 (BriefCoAuthor — uses Heebo in Hebrew context)
T94 (phase-transition canon) ──────────────────► T110 (cross-phase animation orchestration)
T95 (Google OAuth) ────────────────────────────► T104 (signup-overlay — OAuth button)
T96 (account state tokens) ────────────────────► T112 (Free Account /home)
T97 (smoke test) ──────────────────────────────► (runs at deploy, gates no tickets but prevents prod outage)
T98 (WCAG fixes) ──────────────────────────────► T128 (reduced-motion coverage — same a11y canon)
T99 (status page) ─────────────────────────────► (completes T68 /status redirect chain)

Tier 1 — Option E core:
T100 (/start route) ────────────────────────────► T101, T102, T103, T104, T105, T106, T107, T108, T109, T110, T111
T119 (pre-fill claims API) ─────────────────────► T106 (BriefCoAuthor calls /api/brief/prefill)
T95 (Google OAuth) ─────────────────────────────► T104 (SignupOverlay — OAuth button)
T117 (tier split) ──────────────────────────────► T116 (caps use refund window duration)
T117 (tier split) ──────────────────────────────► T114 (Paddle modal shows per-tier guarantee)

Tier 2 — Activation model:
T112 (Free Account /home) ──────────────────────► T113 (sample inbox), T114 (Paddle modal), T115 (recovery emails)
T114 (Paddle modal) ────────────────────────────► T115 (recovery emails — emails fire based on time since T114 completion)
T117 (tier split) ──────────────────────────────► T116 (caps), T114 (modal), T123 (guarantee lines)

Tier 3 — Onboarding audit fixes:
T120 (hours field) ─────────────────────────────► T108 (TruthFile — consumes shouldShowHoursField)
T121 (skip-cinema) ─────────────────────────────► T130 (Yossi batch — T121 is MVP partial relief; T130 is MVP+30 full solution)
T119 (pre-fill API) ────────────────────────────► T106 (forward dep — T119 must ship before T106)

Tier 5:
T130 (Yossi batch) ─────────────────────────────► T121 (precondition — skip-cinema must ship first)
T131 (badge) ───────────────────────────────────► T111 (scan permalink — badge click-through)
T132 (dogfooding) ──────────────────────────────► T133 (wall page — Beamix scan is seed entry)
```

| New ticket | Blocks downstream | Why |
|------------|-------------------|-----|
| T93 (Heebo) | T106 (BriefCoAuthor) | Hebrew clause rendering requires Heebo |
| T94 (motion canon) | T110 (phase orchestration) | Phase cross-fade timing depends on canon constants |
| T95 (Google OAuth) | T104 (SignupOverlay) | OAuth provider must be configured before UI can call it |
| T96 (account state tokens) | T112, T113, T114 | Free Account state detection needed across activation flow |
| T100 (/start route) | T101–T111 | All phase components mount inside the /start route |
| T119 (pre-fill API) | T106 (BriefCoAuthor) | Phase 5 calls /api/brief/prefill on load |
| T117 (tier split) | T116, T114, T123 | Refund window durations used in caps, modal, guarantee lines |
| T112 (Free Account /home) | T115 (recovery emails) | Emails fire based on Free Account state |
| T120 (vertical-conditional hours) | T108 (TruthFile) | Should ship in same PR or before T108 |
| T121 (skip-cinema) | T130 (Yossi batch) | Skip-cinema is the MVP precursor to full batch mode |
| T132 (dogfooding scan) | T133 (wall page) | Beamix's own scan seeds the transparency wall |

---

## Worktree Branch Naming — v3 Additions

New branches appended to v2 naming convention:

```
Tier 0 (new):
  feat/t93-heebo-font             — T93
  feat/t94-phase-motion-canon     — T94
  feat/t95-google-oauth           — T95
  feat/t96-account-state-tokens   — T96
  feat/t97-signup-smoke-test      — T97
  feat/t98-wcag-fixes             — T98
  feat/t99-status-page            — T99

Tier 1 (new):
  feat/t100-start-route           — T100
  feat/t101-enter-url             — T101
  feat/t102-scanning              — T102
  feat/t103-results               — T103
  feat/t104-signup-overlay        — T104
  feat/t105-vertical-confirm      — T105
  feat/t106-brief-co-author       — T106
  feat/t107-brief-signing         — T107
  feat/t108-truth-file            — T108
  feat/t109-complete              — T109
  feat/t110-phase-animation       — T110
  feat/t111-claim-scan-cta        — T111

Tier 2 (new):
  feat/t112-free-account-home     — T112
  feat/t113-sample-inbox-data     — T113
  feat/t114-paddle-activation     — T114
  feat/t115-recovery-emails       — T115
  feat/t116-agent-run-caps        — T116
  feat/t117-refund-window-split   — T117
  feat/t118-activation-event      — T118

Tier 3 (new):
  feat/t119-prefill-claims        — T119
  feat/t120-hours-vertical        — T120
  feat/t121-skip-cinema           — T121
  feat/t122-coming-soon-reframe   — T122
  feat/t123-guarantee-surfacing   — T123
  feat/t124-dual-tab-lock         — T124
  feat/t125-brief-consistency     — T125
  feat/t126-twilio-orphan-cleanup — T126
  feat/t127-mobile-typography     — T127
  feat/t128-reduced-motion        — T128

Tier 5 (new):
  feat/t129-soc2-observation-note — T129
  feat/t130-yossi-batch           — T130
  feat/t131-score-badge           — T131
  feat/t132-dogfooding-scan       — T132
  feat/t133-transparency-wall     — T133
```

---

## Quality Gates Summary — v3 Additions

Beyond v2 quality gates (preserved intact), v3 adds the following gate requirements:

| Gate | Tier | v3 additions |
|------|------|--------------|
| Tier 0 | Before Option E Tier 1 work | T93 Heebo not in main bundle; T94 motion canon constants defined; T95 Google OAuth provider configured in Supabase; T96 `getAccountState()` exports correctly; T97 smoke test passes against staging; T98 WCAG AA contrast verified, focus ring solid, no Print-the-Brief auto-dismiss; T99 `/status` redirects with 301 |
| Tier 1 | After Option E `/start` route ships | T100 `/start` route renders + URL param hydrates phase; T101-T109 each phase renders and transitions correctly; T110 cross-fade ≤140ms; T111 "Claim this scan" CTA on public permalink; T119 `/api/brief/prefill` returns 3 claims in ≤8s |
| Tier 2 | After Free Account activation model | T112 Free Account banner visible on /home for free users; T113 sample inbox items have "Sample" label and approve action disabled; T114 Paddle modal closes and account state updates to 'paid'; T115 Day-3 email sends to free account users; T116 agent run cap enforced per tier; T117 `REFUND_WINDOW_DAYS` used in all guarantee surfaces; T118 sample approval does not trigger activation |
| Tier 3 | After onboarding audit fixes | T120 hours field hidden for SaaS vertical; T121 skip-cinema option visible for repeat-Brief users; T122 no "Coming Soon" string in vertical options; T123 guarantee line present on 3 surfaces; T124 advisory lock acquired on BriefCoAuthor entry; T125 consistency check fires pre-Seal; T126 orphan Twilio numbers deleted within 30 days; T127 Fraunces renders at 18px at <600px; T128 `useReducedMotion()` imported in 4+ animation components |
| Tier 5 | Post-MVP ships | T130 batch onboarding ≤2min per client #2+; T131 badge SVG renders per-score; T132 `/scan/beamixai.com` permalink publicly accessible; T133 wall page shows opt-in scans + Beamix seed entry |

---

## Total Ticket Count (v3.1)

| Tier | v1 tickets | v2 new tickets | v3 new tickets | v3.1 new tickets | Total |
|------|-----------|----------------|----------------|------------------|-------|
| Tier 0 | 15 (T0.1–T0.15) | 8 (T58–T65) | 7 (T93–T99) | 3 (T135, T136, T137, T140) | 33 |
| Tier 1 | 8 (T1.1–T1.8) | 5 (T66–T70) | 12 (T100–T111) | 5 (T119↑, T120↑, T132a↑, T134, T138, T146) | 30 |
| Tier 2 | 6 (T2.1–T2.6) | 9 (T71–T79) | 7 (T112–T118) | 7 (T139, T141, T142, T143, T144, T145, T147) | 29 |
| Tier 3 | 5 (T3.1–T3.5) | 8 (T80–T87) | 8 (T121–T128) | 0 (T119, T120 promoted out) | 21 |
| Tier 4 | 3 (T4.1–T4.3) | 0 | 0 | 0 | 3 |
| Tier 5 | 6 (T5.1–T5.6) | 5 (T88–T92) | 5 (T129–T133) | 1 (T132b split) | 17 |
| **Total** | **43** | **35** | **41** | **14 new + 2 promoted** | **133** |

*Note: v3.1 adds 14 net-new tickets (T134–T147) and applies tier promotions: T119 + T120 moved Tier 3 → Tier 1; T132 split into T132a (Tier 1) + T132b (Tier 5). Total unique ticket IDs: 147 (including v1 alpha-suffixed IDs and T132a/T132b split).*
*↑ = promoted from lower tier in v3.1 patch.*

---

## What Build Lead Needs From Adam Before Starting v3 Tickets

- **T99:** Confirm Better Stack as status page vendor (or substitute — default is Better Stack at $24/mo); create account at `status.beamixai.com`
- **T95:** Provide Google OAuth client ID and secret (registered at `console.cloud.google.com` for the `app.beamixai.com` redirect URI) — stored in Vercel env vars; not committed to repo
- **T114:** Confirm Paddle price IDs for Discover / Build / Scale tiers (needed for `Paddle.Checkout.open()` price config in modal)
- **T129 / T89:** Confirm auditor engagement timeline — T89 observation period must start on MVP launch day; Adam to sign engagement letter before MVP ships
- **T130:** Confirm Yossi batch onboarding scope is locked at MVP+30 (confirmed Q1 — recording here for handoff clarity)
