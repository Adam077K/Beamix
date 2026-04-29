# Beamix MVP — Build Plan v2
Date: 2026-04-29
Author: Build Lead
Status: Supersedes v1. Adds T58–T92 (35 new tickets). All v1 ticket IDs (T0.1–T5.6) preserved intact. New tickets append in Tier 0–5 order.

---

## Executive Overview

Build Plan v2 folds four source documents into the ticket backlog:

1. **F32–F40** — 9 customer-question features from `2026-04-28-PRD-12-unanswered-questions.md`
2. **F41–F47** — 7 features from `2026-04-28-PRD-AMENDMENTS-v4.md` (Cmd-K, Trust Center, bug bounty, /changelog, compact mode, editorial error pages, State of AI Search)
3. **Design-system canon additions** — motion taxonomy, ESLint rules, variable Inter, status vocab, block primitives, speed CI gate, security.txt, dark mode tokens (all from Board Round 2/3 synthesis)
4. **Domain infrastructure confirmed DONE** — Cloudflare/Framer/Vercel/Resend/Google Search Console/Bing Webmaster Tools

v2 appends T58–T92 to the existing tier structure. Three structural changes versus v1:

- **Tier 0 gains 8 tickets (T58–T65)** — design-system canon and CI infrastructure that must precede Tier 1. Existing Tier 0 quality gate updated to include these.
- **Tier 1 gains 5 tickets (T66–T70)** — foundational routes (Trust Center, /changelog, error pages, Cmd-K, slash command) that are acquisition-adjacent.
- **Tiers 2–4 gain 17 tickets (T71–T87)** — customer-question answers and delight features.
- **Tier 5 gains 5 tickets (T88–T92)** — post-MVP compliance, print gift, quarterly Brief trigger, and State of AI Search.

Total ticket count: 57 (v1) + 35 (v2 new) = 92 tickets across Tiers 0–5.

---

## Domain Infrastructure — DONE (2026-04-29)

These are account-setup tasks completed by Adam outside the build sprint. They are CLOSED and require no build tickets.

| Service | Domain | Status |
|---------|--------|--------|
| Cloudflare DNS | beamixai.com (apex + all subdomains) | LIVE |
| Framer | beamixai.com (marketing apex) | LIVE |
| Vercel | app.beamixai.com (product dashboard) | LIVE |
| Resend | notify.beamixai.com (transactional email) | LIVE |
| Google Search Console | beamixai.com | LIVE |
| Bing Webmaster Tools | beamixai.com | LIVE |

**All build tickets referencing domains should use:**
- Product dashboard: `app.beamixai.com`
- Transactional email: `notify.beamixai.com`
- Marketing apex: `beamixai.com`
- Monthly Update permalinks: `beamixai.com/r/{nanoid21}`

---

## Tier 0 — Foundation

*(v1 tickets T0.1–T0.15 preserved intact. New tickets T58–T65 append below.)*

---

### T0.1 through T0.15 — [unchanged from v1]

*See Build Plan v1 for full scopes. All v1 Tier 0 tickets are part of this plan without modification.*

---

### T58 — 10 named easing curves: motion.css + tailwind.config.js

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.12 (design system token scaffold must exist first)
**References:** PRD design-system canon — `BOARD2-vercel.md` §1; PRD Amendments v4 §Motion taxonomy

**Acceptance criteria:**
- `apps/web/src/styles/motion.css` exports all 10 CSS custom properties as `:root` vars with names, cubic-bezier values, and inline comments describing the physical metaphor for each:
  - `--ease-stamp` `cubic-bezier(0.55, 0.07, 0.6, 1.05)` — Seal-stamping
  - `--ease-ring-close` `cubic-bezier(0.65, 0, 0.35, 1)` — Cycle-Close Bell
  - `--ease-paper-fold` `cubic-bezier(0.34, 1.56, 0.64, 1)` — Receipt card fold
  - `--ease-narration-in` `cubic-bezier(0.16, 1, 0.3, 1)` — Narration column entry
  - `--ease-pill-spring` `cubic-bezier(0.34, 1.56, 0.64, 1)` — Workflow Builder elastic edges
  - `--ease-status-rewrite` `cubic-bezier(0.4, 0, 0.2, 1)` — F23 status sentence rewrite
  - `--ease-card-enter` `cubic-bezier(0.16, 1, 0.3, 1)` — Drawer/modal entry
  - `--ease-trace-fade` `cubic-bezier(0.4, 0, 0.6, 1)` — Trace behavior
  - `--ease-skeleton-pulse` `cubic-bezier(0.4, 0, 0.6, 1)` — Loading states
  - `--ease-wave-stagger` `cubic-bezier(0.65, 0, 0.35, 1)` — Arc's Wave stagger on F23
- `apps/web/tailwind.config.js` extends `transitionTimingFunction` with a `beamix.*` namespace mapping each named curve (e.g., `'beamix-stamp': 'var(--ease-stamp)'`)
- No `transition-all` usage in the design-system base layer (pre-linted before merge)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/styles/motion.css`
- `apps/web/tailwind.config.js`

---

### T59 — ESLint custom rules: easing, status vocab, server-only PDF

**Tier:** 0
**Effort:** S
**Dependencies:** T58 (easing curves must be defined before the lint rule can reference the dictionary), T61 (status vocab file; T59 and T61 can be drafted in parallel but T59 must verify T61's canonical terms list exists)
**References:** PRD design-system canon — `BOARD2-linear-v2.md` §6 + `BOARD2-vercel.md` §1

**Acceptance criteria:**
- Three custom ESLint rules authored and passing on a `pnpm lint` run across `apps/web/src/`:
  1. `@beamix/no-shared-easing` — fails on `transition-all` anywhere in `.ts/.tsx` inline styles or Tailwind class strings; fails on the legacy `cubic-bezier(0.4, 0, 0.2, 1)` string used outside the named-curve dictionary in `motion.css`
  2. `@beamix/no-banned-status-synonyms` — uses the 14-term canonical table from `apps/web/src/lib/status-vocab.ts` (T61); fails build if any banned synonym (Active, Live, Running, Resting, Waiting, Queued, In progress, Stuck, Stopped, Complete, Finished, Error, Broken) appears in a string literal within a `.tsx` component or a string value in an API route response
  3. `@beamix/server-only-pdf` — forces `import 'server-only'` at the top of any file that imports `@react-pdf/renderer`; fails if the import is absent
- All three rules listed in `apps/web/eslint.config.js` with `error` severity (not `warn`)
- Each rule has a corresponding unit test file in `apps/web/eslint-rules/__tests__/`
- `pnpm lint` exits 0 on clean code, exits 1 on each failing pattern (verified per rule in unit tests)

**Files touched:**
- `apps/web/eslint.config.js`
- `apps/web/eslint-rules/no-shared-easing.js`
- `apps/web/eslint-rules/no-banned-status-synonyms.js`
- `apps/web/eslint-rules/server-only-pdf.js`
- `apps/web/eslint-rules/__tests__/no-shared-easing.test.js`
- `apps/web/eslint-rules/__tests__/no-banned-status-synonyms.test.js`
- `apps/web/eslint-rules/__tests__/server-only-pdf.test.js`

---

### T60 — Variable Inter + subset Fraunces font optimization

**Tier:** 0
**Effort:** S
**Dependencies:** T0.12 (design system — font declarations must exist before modification)
**References:** PRD design-system canon — `BOARD2-vercel.md` §1 Variable Inter section + Bundle craft section

**Acceptance criteria:**
- Separate `InterDisplay` font file removed from the project (deleted from `apps/web/public/fonts/` or wherever it is declared)
- `next/font` configuration in `apps/web/next.config.js` declares Inter as a variable font using the `axes: ['opsz']` config with sizes `[14, 18, 24, 32, 48, 96]`; no separate `InterDisplay` font loaded
- `apps/web/src/app/layout.tsx` updated to consume the single variable Inter font; all references to `InterDisplay` CSS class/variable replaced with the Inter variable axis at `opsz=32` or above (per design spec)
- Fraunces is subsetted to the ~40-character set used in Brief clauses, Monthly Update headlines, /changelog editorial titles, and binding lines: uppercase A–Z, lowercase a–z, comma, period, em-dash, apostrophe, colon, question mark — configured in `next.config.js` via `subsets` or `unicode-range`
- Bundle savings verified: `pnpm build --analyze` shows Inter + Fraunces combined font payload ≤90KB (target: 85KB from 225KB baseline, ~140KB saved)
- `pnpm typecheck` zero errors; no visual regressions on component Storybook for headings, body, and binding line

**Files touched:**
- `apps/web/next.config.js`
- `apps/web/src/app/layout.tsx`
- Delete: `InterDisplay` font file(s) from `apps/web/public/fonts/` (or font config equivalent)

---

### T61 — Status vocabulary lock: `status-vocab.ts`

**Tier:** 0
**Effort:** XS
**Dependencies:** None (can run in parallel with other Tier 0 tickets; T59 consumes this file)
**References:** PRD design-system canon — `BOARD2-linear-v2.md` §6 Status vocabulary table

**Acceptance criteria:**
- `apps/web/src/lib/status-vocab.ts` created and exported with the 14 canonical status terms as a `const` object and a TypeScript union type `StatusTerm`
- Full canonical table (all 14 terms with their banned synonyms) documented as inline JSDoc on the exported object:

| Canonical | Banned synonyms |
|-----------|-----------------|
| Acting | Active, Live, Running |
| Idle | Resting, Waiting |
| Pending | Queued, In progress |
| Blocked | Stuck, Stopped |
| Done | Complete, Finished |
| Failed | Error, Broken |
| Paused | Suspended, Halted |
| Scheduled | Queued (when future) |
| Reviewing | In review, Awaiting |
| Cancelled | Canceled (alternate spelling) |
| Draft | In draft, Not sent |
| Sent | Delivered, Dispatched |
| Removed | Deleted, Archived |
| Archived | Stored, Retained |

- `StatusTerm` TypeScript union exported and importable by any component or API route
- File is consumed by T59's `@beamix/no-banned-status-synonyms` lint rule
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/lib/status-vocab.ts`

---

### T62 — Block primitive TypeScript interfaces

**Tier:** 0
**Effort:** S
**Dependencies:** T0.4 (canonical types must be in place), T0.12 (design system — primitives reference component types)
**References:** PRD design-system canon — `BOARD2-notion.md` §1; PRD Amendments v4 §Block primitive interfaces

**Acceptance criteria:**
- `apps/web/src/blocks/types.ts` created with:
  - `BeamixBlock<TData>` generic interface with fields: `id: string`, `type: BlockType`, `data: TData`, `layout: { col: number; row: number; w: number; h: number; }`
  - `BlockType` union with all 18 named primitive types: `'activity-ring' | 'sparkline' | 'cartogram' | 'brief-clause' | 'agent-row' | 'inbox-row' | 'receipt' | 'competitor-row' | 'twilio-number' | 'status' | 'small-multiples' | 'workflow-canvas' | 'monthly-update' | 'evidence-strip' | 'rivalry-strip' | 'cycle-bell' | 'narration-column' | 'crew-grid'`
  - Each `BlockType` value has a JSDoc comment describing the surface where it appears and its data shape reference
- `apps/web/src/blocks/index.ts` re-exports all block types
- Storybook stories created for each block type (can be empty skeletons with `TODO: implement` — the type contract is the deliverable, not full visual implementation)
- `pnpm typecheck` zero errors across `apps/web/src/blocks/`
- Composable surfaces (T76 /reports, T4.1 Workflow Builder) are confirmed to consume `BeamixBlock<TData>` in their implementation (this ticket gates both)

**Files touched:**
- `apps/web/src/blocks/types.ts`
- `apps/web/src/blocks/index.ts`
- `apps/web/src/blocks/__stories__/[block-type].stories.tsx` (18 files — stubs acceptable)

---

### T63 — Speed CI gate: GitHub Actions Playwright + Lighthouse

**Tier:** 0
**Effort:** S
**Dependencies:** T0.12 (design system must exist for Lighthouse to measure meaningful UI), T0.5 (Inngest skeleton — CI needs a running app)
**References:** PRD design-system canon — `BOARD2-vercel.md` §5 + `BOARD2-linear-v2.md` §1 Speed canon

**Acceptance criteria:**
- `.github/workflows/speed-gate.yml` created and running on every pull request targeting `main`
- Workflow runs Playwright (browser automation) + Lighthouse CLI against the preview deployment (or local `pnpm build && pnpm start`)
- **Fail conditions** (any of these triggers a PR block):
  - `/home` boot time > 100ms warm OR > 400ms cold
  - `/scans` first paint > 150ms warm
  - `/workspace` step-expand animation perceived time > 80ms
  - Bundle size per surface exceeds ceiling: `/home` ≤ 95KB gzipped, `/scans` ≤ 110KB gzipped, Workflow Builder ≤ 220KB gzipped (React Flow isolated — see T4.1)
- Workflow reports per-metric results as a PR comment (table format: surface / metric / measured / limit / status)
- Workflow uses `actions/cache` to cache node_modules and pnpm store between runs
- First run on a clean branch (no prior cache) completes in ≤ 8 minutes

**Files touched:**
- `.github/workflows/speed-gate.yml`

---

### T64 — `/.well-known/security.txt` (RFC 9116)

**Tier:** 0
**Effort:** XS
**Dependencies:** T66 (Trust Center route — `security.txt` Policy and Acknowledgments fields reference `/trust` URLs; T64 can be drafted before T66 merges but final values require T66's URLs to be confirmed)
**References:** PRD F42 §security.txt; PRD F43; Design Board R2-8

**Acceptance criteria:**
- `apps/web/public/.well-known/security.txt` created with all RFC 9116 required and recommended fields:
  - `Contact: mailto:security@beamixai.com`
  - `Encryption:` link to PGP public key (can be a placeholder URL pointing to `/trust/encryption-key.asc` — actual key generated by Adam; URL must be valid at MVP launch)
  - `Acknowledgments: https://app.beamixai.com/trust/disclosure` (references T88 HackerOne page)
  - `Preferred-Languages: en, he`
  - `Canonical: https://app.beamixai.com/.well-known/security.txt`
  - `Policy: https://app.beamixai.com/trust/disclosure`
  - `Hiring: https://beamixai.com/careers` (or equivalent; placeholder URL acceptable at MVP)
  - `Expires:` field set to 1 year from MVP launch date (must be updated annually)
- File served correctly at `/.well-known/security.txt` by Next.js (static public directory serving confirmed)
- `curl https://app.beamixai.com/.well-known/security.txt` returns 200 with `Content-Type: text/plain`

**Files touched:**
- `apps/web/public/.well-known/security.txt`

---

### T65 — Dark mode tokens: 12 dark tokens + cream-paper-stays-light partition documentation

**Tier:** 0
**Effort:** XS
**Dependencies:** T0.12 (design system token scaffold)
**References:** PRD design-system canon — `BOARD2-linear-v2.md` §4; PRD Amendments v4 §Cream-paper-stays-light partition
**Ship note:** Token definitions ship now (Tier 0 canon). Dark-mode component implementation ships at MVP+30 (post-launch). This ticket is documentation + token definitions only — no component visual changes.

**Acceptance criteria:**
- `apps/web/src/styles/tokens.css` (or equivalent) adds 12 dark-mode CSS custom properties under a `[data-theme="dark"]` or `.dark` selector:
  - `--color-paper-elev-dark` (dark elevated surface)
  - `--color-ink-1-dark` (primary text dark)
  - `--color-ink-2-dark` (secondary text dark)
  - `--color-ink-3-dark` (tertiary/muted text dark)
  - `--color-brand-blue-dark: #5A8FFF`
  - `--color-border-default-dark`
  - `--color-border-subtle-dark`
  - `--color-bg-default-dark`
  - `--color-bg-raised-dark`
  - `--color-bg-overlay-dark`
  - `--color-score-good-dark`
  - `--color-score-critical-dark`
- `apps/web/src/styles/design-system.md` (or equivalent in-repo doc) updated with explicit **Cream-paper-stays-light-forever** partition:
  - 8 surfaces that NEVER adopt dark mode: Brief, Monthly Update, /changelog, /trust/*, Onboarding, /reports, OG share cards, /state-of-ai-search
  - 6+ admin-utility surfaces that ship dark mode at MVP+30: /home, /inbox, /scans, /workspace, /crew, /competitors, /settings, Workflow Builder
- No component CSS files change (tokens defined, not applied)
- `pnpm typecheck` zero errors

**Files touched:**
- `apps/web/src/styles/tokens.css` (or equivalent)
- `apps/web/src/styles/design-system.md` (in-repo documentation)

---

**Updated Tier 0 Quality Gate (v2 additions):**

Beyond v1 Tier 0 gates, also require:
- T58: `motion.css` exports 10 named easing curves; Tailwind extends with `beamix.*` namespace; no `transition-all` in base layer
- T59: All 3 ESLint custom rules pass unit tests; `pnpm lint` exits 1 on each failing pattern
- T60: Font bundle ≤ 90KB verified via `pnpm build --analyze`; `InterDisplay` font file deleted
- T61: `status-vocab.ts` exports `StatusTerm` type; 14 canonical terms with banned synonyms documented
- T62: 18 block type interfaces compile without errors; Storybook stubs exist for all 18
- T63: Speed gate CI workflow runs and posts PR comment; fails on a synthetic slow test
- T64: `/.well-known/security.txt` served at correct URL with all 7 RFC 9116 fields
- T65: 12 dark tokens defined under dark selector; cream-paper-stays-light partition documented

---

## Tier 1 — Critical-Path Acquisition + Activation

*(v1 tickets T1.1–T1.8 preserved intact. New tickets T66–T70 append below.)*

---

### T1.1 through T1.8 — [unchanged from v1]

*See Build Plan v1 for full scopes.*

---

### T66 — Trust Center: `/trust` route group (4 sub-pages)

**Tier:** 1
**Effort:** L
**Dependencies:** T0.12 (design system — cream paper register), T0.15 (DPA legal doc must exist), T64 (security.txt linked from Trust Center), T86 (F31 Brief binding line — all /trust pages require it)
**References:** PRD F42; Design Board R2-7; Aria simulator 5-fix list

**Acceptance criteria:**
- Route group `apps/web/src/app/trust/` created with 4 sub-pages:
  1. `/trust` — landing page: cream paper register, Fraunces 300 italic editorial tagline "We publish what we know, when we know it. The dates here are real.", Beamix Seal (T0.13), 4 cards linking to sub-pages (Compliance, Sub-processors, DPA, Disclosure)
  2. `/trust/compliance` — SOC 2 Type I status: observation period start date (populated at MVP launch), HackerOne bounty status (live at MVP+30 — shows "Launching soon" at MVP), ISO 27001 roadmap commitment, GDPR DPA link; auditor name + observation dates published once confirmed
  3. `/trust/sub-processors` — extended table with 5 columns Aria flagged: Processor name / Role (controller/processor/joint-controller) / Underlying cloud / SOC 2 or ISO 27001 status / Last-audited-by-Beamix date / DPA link per row; covers Supabase, Twilio, Paddle, Resend, Anthropic, OpenAI, Google, Perplexity; "audit in progress" state for any processor mid-audit
  4. `/trust/dpa` — ungated public DPA (PDF + HTML): liability cap, IP indemnification (flowing through Anthropic/OpenAI terms covering AI-generated content), 48h customer-breach SLA, 30-day sub-processor pre-notification, cyber-liability insurance disclosure; Israel supplement note; Yossi sub-vendor pass-through note
- All 4 pages: no auth required (public), Brief binding line at bottom per F31, Lighthouse accessibility ≥ 95
- Israeli customer note on `/trust/dpa`: Hebrew-language supplement mentioned
- `/trust/disclosure` stub page exists (populated by T88 — HackerOne bug bounty)
- All Trust Center pages excluded from cream-paper-stays-light dark mode deferral (they ARE cream register surfaces — they stay light forever per T65 partition)

**Files touched:**
- `apps/web/src/app/trust/page.tsx`
- `apps/web/src/app/trust/compliance/page.tsx`
- `apps/web/src/app/trust/sub-processors/page.tsx`
- `apps/web/src/app/trust/dpa/page.tsx`
- `apps/web/src/app/trust/disclosure/page.tsx` (stub — populated by T88)

---

### T67 — `/changelog` route

**Tier:** 1
**Effort:** S
**Dependencies:** T0.12 (design system — cream paper), T86 (F31 binding line), T0.11 (Resend — "Subscribe via email" CTA requires email infrastructure)
**References:** PRD F44; Design Board R2-9; `BOARD2-linear-v2.md` first-month sample entries

**Acceptance criteria:**
- `/changelog` route (public, no auth, indexed by search engines — no `noindex`)
- Cream paper editorial register (`--color-paper-cream`); Fraunces 300 italic for entry titles; Inter 14px for body; Geist Mono 11px ALL CAPS for datelines
- Markdown source files in `apps/web/content/changelog/` — one `.md` file per entry, frontmatter: `date`, `title`, `slug`, `reading_time`
- Each rendered entry: dateline (Geist Mono "FRIDAY, APRIL 25, 2026"), Fraunces 300 italic title ≤ 80 chars, body ≤ 200 words, optional hero image or GIF (motion respects `prefers-reduced-motion`)
- `reading_time` displayed at top of each entry ("3 min read")
- Brief binding line (F31 pattern) at bottom of each entry and at page footer
- "Subscribe via email" CTA: Resend list subscription, RSS feed at `/changelog/feed.xml`
- `/changelog/[slug]` permalinks: each entry has a stable URL; OG share card (cream paper, dateline, Seal)
- Voice canon Model B: "Beamix" as single-character on external surfaces; no agent names in changelog copy
- Empty-week behavior: no entry generated; prior entry remains at top

**Files touched:**
- `apps/web/src/app/changelog/page.tsx`
- `apps/web/src/app/changelog/[slug]/page.tsx`
- `apps/web/src/app/changelog/feed.xml/route.ts`
- `apps/web/content/changelog/` (directory + at least 1 seed entry at MVP)

---

### T68 — Editorial error pages: `/404`, `/500`, `/maintenance`, `/status`

**Tier:** 1
**Effort:** S
**Dependencies:** T0.12 (design system), T86 (F31 binding line on all 4 pages)
**References:** PRD F46; Design Board R2-12; `BOARD2-stripe-v2.md`
**Note:** Status page vendor (Better Stack or Statuspage.io) — vendor selection pending Adam's decision. Build ticket includes `/status` redirect to external vendor; vendor setup is Adam's account action.

**Acceptance criteria:**
- All 4 pages: cream paper register, single Fraunces 300 italic editorial line, Beamix Seal at top, dateline in Geist Mono (e.g., "APRIL 28, 2026 — 14:23 GMT"), Brief binding line at bottom
- `/404` (`apps/web/src/app/not-found.tsx`): "We couldn't find that page. The URL may have moved." + "[Take me home →]" CTA linking to `/`
- `/500` (`apps/web/src/app/error.tsx`): "Something broke. Beamix is logging it now. Try again, or check our status." + link to status page
- `/maintenance` (`apps/web/src/app/maintenance/page.tsx`): "Beamix is performing scheduled maintenance. Returning at [TIME] GMT." + status link; maintenance banner on all routes appears 24h before window
- `/status` redirects to external status page (`status.beamixai.com` — Better Stack or equivalent); 90-day uptime displayed on external page
- `/500` page serves from edge without DB dependency (static or Edge runtime)
- All 4 pages logged to Sentry / observability (404 vs 500 vs maintenance event types distinguished)
- No "Sorry!" copy — single-character calm voice only; apologies-as-disclaimers banned

**Files touched:**
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/error.tsx`
- `apps/web/src/app/maintenance/page.tsx`
- `apps/web/src/middleware.ts` (maintenance banner injection)
- `apps/web/src/components/MaintenanceBanner.tsx`

---

### T69 — Cmd-K command bar

**Tier:** 1
**Effort:** M
**Dependencies:** T0.12 (design system), T0.4 (types — search index types), T0.1 (schema — Brief clauses, agents, scan results must be in DB), T0.11 (Resend not required; this is purely frontend + search API)
**References:** PRD F41; Design Board R2-1; `BOARD2-linear-v2.md` §7

**Acceptance criteria:**
- `apps/web/src/components/CommandBar.tsx` — full-screen overlay triggered by `Cmd-K` (Mac) / `Ctrl-K` (Win/Linux) from any authenticated page
- Search covers: 9 fixed surfaces (by name + description), 6 MVP agents (by name + last-run status), scan results (last 30 days by domain + score), Brief clauses (by clause text), Twilio numbers (by number string), sub-processors (by name — links to /trust/sub-processors), /changelog entries (by title + body excerpt), Help Center (static entries)
- Each result row: result type icon (16×16 per type), result title (Inter 14px), Brief grounding citation (Geist Mono 11px `--color-ink-3`) where the result was authorized by a Brief clause; results without a Brief clause show no citation row
- Recently used commands: top 5 surfaced first (localStorage persistence)
- Sacred shortcuts operational: `Cmd-K` then `i` → /inbox, `s` → /scans, `a` → /workspace, `b` → /brief, `c` → /crew, `?` → help modal
- Keyboard hotkey hints in UI: `<kbd>` styled badges beside action buttons (e.g., "Approve `Enter ↵`")
- Mobile fallback: tap global search icon in page topbar (top-right every page); same search results in a bottom sheet
- Esc closes; clicking outside closes
- Zero-result state: "Nothing matches. Try [3 suggested searches]" (dynamically generated from recent history)
- Search index: Postgres full-text search at MVP scale; in-memory cache after first load

**Files touched:**
- `apps/web/src/components/CommandBar.tsx`
- `apps/web/src/hooks/useCommandBar.ts`
- `apps/web/src/app/api/search/route.ts`
- `apps/web/src/components/layout/Topbar.tsx` (mobile search icon integration)

---

### T70 — Slash command (`/`) block-insert palette (composable surfaces only)

**Tier:** 1
**Effort:** S
**Dependencies:** T62 (block primitive types must exist), T69 (Cmd-K shares keyboard handler infrastructure), T4.1 (Workflow Builder), T76 (/reports — the two composable surfaces this ticket serves)
**References:** PRD F41 slash command spec; Design Board R2-1 + R2-11 composability scope

**Acceptance criteria:**
- Slash command (`/`) opens block-insert palette ONLY when cursor is in a composable surface (allow-list: `/reports` editor, Workflow Builder Inspector)
- Block library populated from T62's 18 `BlockType` primitives; each block shows: type icon, block name (Inter 14px), use-case description (Inter 12px `--color-ink-3`)
- Fuzzy search within palette: typing after `/` filters block list
- Slash command does NOT activate on /home, /inbox, /scans, /workspace, /crew, /competitors, /settings (non-composable surfaces)
- Inserting a block in /reports: appends a `BeamixBlock<TData>` typed row to the report's block array
- Inserting a block in Workflow Builder Inspector: appends a node configuration to the selected workflow node
- Esc closes without inserting

**Files touched:**
- `apps/web/src/components/SlashCommandPalette.tsx`
- `apps/web/src/hooks/useSlashCommand.ts`
- `apps/web/src/app/reports/editor.tsx` (integration point)
- `apps/web/src/app/workspace/workflow/inspector.tsx` (integration point — T4.1 dependency)

---

**Updated Tier 1 Quality Gate (v2 additions):**

Beyond v1 Tier 1 gates, also require:
- T66: All 4 Trust Center sub-pages render without auth; Lighthouse accessibility ≥ 95; DPA ungated
- T67: /changelog renders with at least 1 seed entry; RSS feed valid; Subscribe CTA functional
- T68: All 4 error pages render in cream register; /500 serves from edge; Sentry events distinguished
- T69: Cmd-K opens from every authenticated page; sacred shortcuts functional; mobile bottom sheet works
- T70: Slash command activates only on /reports and Workflow Builder; does NOT activate on /inbox, /home

---

## Tier 2 — Primary Product Surfaces

*(v1 tickets T2.1–T2.6 preserved intact. New tickets T71–T79 append below.)*

---

### T2.1 through T2.6 — [unchanged from v1]

*See Build Plan v1 for full scopes.*

---

### T71 — F32 Brief Re-author and Undo Window

**Tier:** 2
**Effort:** S
**Dependencies:** T1.5 (onboarding UI — re-author flow reuses Step 3 chip editor), T1.4 (onboarding API — sign endpoint extended), T0.1 (schema — `brief_versions` table, append-only)
**References:** PRD F32; `2026-04-28-PRD-12-unanswered-questions.md` Q1

**Acceptance criteria:**
- 10-minute undo window post-Seal: top-of-page countdown banner ("Your Brief was signed just now. Reopen it if anything needs correcting — you have N minutes."); clicking "Reopen Brief" returns to Step 3 chip editor; Seal must be re-stamped to proceed
- After window closes: re-author available at `/settings` → Brief tab → "Edit Brief" button; restores chip editor UX from onboarding Step 3
- Every Brief re-sign creates a new `brief_versions` row (append-only — no deletes, no updates)
- Brief audit view in `/settings` → Brief tab → "Version history": timestamp, diff of changes, signer (always account Owner), agent actions authorized under each version (brief_version_id in provenance envelope)
- Agent pause banner on /home while Brief is in edit state: "Brief editing in progress. Beamix is paused until you save."
- Brief re-sign in /settings requires Seal animation (540ms stamp, same ceremony as onboarding)
- Escape hatch "This is still wrong about my business" navigates to Step 1 industry combobox — same mechanic as onboarding (applies in /settings re-author flow too)
- Per F24 (quarterly Brief Re-Reading): clicking "Edit Brief" at the quarterly prompt enters this same re-author flow
- Edge case: in-flight agent run when Brief changes — run completes under prior brief_version_id (snapshotted at run-start); next run picks up new version

**Files touched:**
- `apps/web/src/app/settings/brief/page.tsx`
- `apps/web/src/components/BriefUndoBanner.tsx`
- `apps/web/src/app/api/onboarding/brief/sign/route.ts` (extend to create brief_versions row)
- `apps/web/supabase/migrations/` (brief_versions table if not already in T0.1)

---

### T72 — F33 Team Seats and Role Permissions

**Tier:** 2
**Effort:** M
**Dependencies:** T0.1 (schema — `account_members` table with role enum), T0.11 (Resend — invite email), T3.3 (settings tabs — Team tab is a new tab in /settings)
**References:** PRD F33; `2026-04-28-PRD-12-unanswered-questions.md` Q2

**Acceptance criteria:**
- `/settings` → Team tab: shows current seats, available seats for tier (Discover 1, Build 2, Scale 5), invite form (email + role selector)
- Two roles: Owner (full access — billing, cancel, Brief re-sign, seat management, white-label config) and Editor (approve/reject /inbox, view all data, trigger manual agent runs — cannot re-sign Brief, access Billing tab, cancel subscription, manage seats, change white-label)
- Invitation: Resend email with 72-hour expiry link; subject "[Name] invited you to manage [Business Name] on Beamix"; no AI labels in email body
- Seat limit enforced at invite time; exceeding limit shows upgrade prompt
- Owner can remove a seat (immediate access revocation on next page load)
- One Owner per account; Owner transfer via email confirmation from both parties
- Audit log entry on: invite sent, invite accepted, seat removed, Owner transferred
- Yossi context: Editor added to Scale account can see all clients and approve /inbox across all clients (per-client Editor restriction deferred to MVP-1.5)
- Paddle billing: seats included in tier price — no separate billing per seat at MVP

**Files touched:**
- `apps/web/src/app/settings/team/page.tsx`
- `apps/web/src/app/api/settings/team/route.ts`
- `apps/web/src/app/api/settings/team/invite/route.ts`
- `apps/web/src/app/api/settings/team/accept/route.ts`
- `apps/web/supabase/migrations/` (`account_members` table if not in T0.1)

---

### T73 — F34 Self-Service Data Export (DSAR + portability)

**Tier:** 2
**Effort:** M
**Dependencies:** T0.1 (all data tables must exist), T3.3 (/settings — Privacy & Data tab lives in settings), T0.11 (Resend — download link email delivery), T0.5 (Inngest — large export job)
**References:** PRD F34; `2026-04-28-PRD-12-unanswered-questions.md` Q4

**Acceptance criteria:**
- `/settings` → Privacy & Data tab (new tab): export form, GDPR Article 20 note, storage region statement, encryption statement, training opt-out statement, sub-processors link, DSAR request link
- Data categories selectable: Scans (JSON + CSV), Brief (JSON + PDF), Truth File (JSON), Recommendations (CSV), Agent actions (JSON with provenance envelopes), Lead Attribution (CSV), Monthly Update PDFs (file archive), Account metadata
- Export is synchronous (page-ready, no email) for accounts < 12 months with < 500 agent actions
- Export is Inngest-queued for larger accounts; download link delivered via Resend within 4 hours
- ZIP package: selected categories in specified formats
- Download link: signed URL (48-hour expiry); customer can re-request at any time
- Yossi Scale: per-client export (client-switcher context); "Export all clients" generates one ZIP per client in a single archive
- Agent actions export includes: action_id, agent_name, brief_clause_ref, brief_clause_text_at_time, before_state, after_state, validation_outcome, customer_decision, timestamp
- Export excludes: payment card data, other customers' data, internal Beamix operational logs
- DSAR formal request form generates a support ticket with 30-day SLA documented on page

**Files touched:**
- `apps/web/src/app/settings/privacy/page.tsx`
- `apps/web/src/app/api/settings/export/route.ts`
- `apps/web/inngest/functions/export-data.ts`
- `apps/web/src/lib/exporters/` (per-category serializer modules)

---

### T74 — F35 Graceful Cancellation and Data Retention

**Tier:** 2
**Effort:** S
**Dependencies:** T0.1 (schema — subscription state columns), T3.3 (/settings → Billing tab), T0.5 (Inngest — Twilio release cron + read-only mode gate on every agent run), T0.11 (Resend — 7-day + 48h Twilio release warnings, "data expiring" notices)
**References:** PRD F35; `2026-04-28-PRD-12-unanswered-questions.md` Q5

**Acceptance criteria:**
- Cancel flow: one click from `/settings` → Billing. One confirmation modal (no dark patterns). Modal shows: cancel date, "data remains readable 90 days" summary
- Paddle webhook `subscription.cancelled`: sets `subscription_status = 'cancelled'`, sets `cancel_effective_date` to period end
- At `cancel_effective_date`: all scheduled Inngest jobs for account check status before running and cancel if `cancelled`
- Read-only mode (90 days post-cancel): login permitted, data visible, agents paused, /home banner "Your Beamix subscription ended on [date]. Your data is still here. Reactivate to resume agent work."
- Twilio numbers: retained + active (calls log) during 90-day read-only period; Twilio API release at 90 days; 7-day advance email + 48-hour advance email before release
- UTM URLs: clicks log in read-only mode; no new agent reactions
- Monthly Update permalinks: honor privacy settings during read-only; removed from CDN at 90-day archive transition
- Reactivation within 90-day period: agents resume immediately, no re-onboarding
- Reactivation after 90-day period: account restored from archive; "Review your Brief before we resume" prompt (F32 re-author flow)
- Annual plan pause extends subscription end date by pause duration (verify Paddle behavior before shipping)

**Files touched:**
- `apps/web/src/app/settings/billing/page.tsx` (cancel flow UI)
- `apps/web/src/app/api/webhooks/paddle/route.ts` (extend with cancelled handler)
- `apps/web/inngest/functions/twilio-release.ts` (90-day + 7-day + 48h crons)
- `apps/web/src/middleware.ts` (read-only mode banner injection for cancelled accounts)

---

### T75 — F36 Domain Migration Wizard

**Tier:** 2
**Effort:** M
**Dependencies:** T3.3 (/settings → Profile tab — domain field), T1.4 (onboarding API — Brief re-sign reused), T0.5 (Inngest — post-migration baseline job), T0.1 (schema — domain migration log table, `agent_memory` domain context)
**References:** PRD F36; `2026-04-28-PRD-12-unanswered-questions.md` Q7

**Acceptance criteria:**
- Domain field in `/settings` → Profile is editable; "Change domain" opens 4-step migration wizard (full-screen modal)
- Step 1 (Confirm new domain): DNS TXT record or HTML meta-tag ownership verification; 72h to complete; wizard pauses (not blocks) until verified
- Step 2 (Review what changes): plain-English diff — Brief domain references, count of historical scans labeled old, Twilio placement status, UTM URL status
- Step 3 (Update Brief): customer reviews Brief with new domain inline, re-signs (Seal ceremony); migration cannot complete without re-signed Brief
- Step 4 (Update Lead Attribution): fresh developer snippet for new domain; "Send to your developer" button fires snippet email
- Old-domain scans retained in /scans labeled "Old domain (old-domain.com)"; domain-change marker row at inflection date
- Agent Memory entries linked to old domain retained for provenance; new runs write to new domain context
- Inngest job after completion: runs all 6 MVP agents on new domain baseline; /home shows "Beamix is analyzing your new domain"
- Wizard state saved for 24h if abandoned mid-flow (resume on re-open)
- Limit: 1 domain migration per 90 days (shows "contact support" message if limit hit)
- Developer snippet email re-sent with new domain context (Twilio not auto-moved — customer must update site)

**Files touched:**
- `apps/web/src/components/DomainMigrationWizard.tsx`
- `apps/web/src/app/api/settings/domain-migration/route.ts`
- `apps/web/src/app/api/settings/domain-migration/verify/route.ts`
- `apps/web/inngest/functions/post-migration-baseline.ts`

---

### T76 — F37 /reports route (Monthly Update archive + staging)

**Tier:** 2
**Effort:** M
**Dependencies:** T2.5 (Monthly Update PDF generation must exist), T0.12 (design system), T62 (block primitives — /reports is the first composable surface), T70 (slash command palette integrates here), T86 (F31 binding line)
**References:** PRD F37; `2026-04-28-PRD-12-unanswered-questions.md` Q9; Q6 amendment (share link mechanics)

**Acceptance criteria:**
- `/reports` route accessible from product sidebar; not in mobile bottom nav (bottom 4 reserved for /home, /inbox, /scans, /crew)
- Table of Monthly Updates, reverse-chronological; columns: Client (Scale only) / Month / Status (Draft/Reviewed/Sent) / Attribution headline (one-line) / Privacy (Private/Share link active) / Actions
- Row actions: Preview (PDF in modal, not new tab), Edit (structured section editor — chip-editing UX), Approve and send, Generate share link, Revoke share link
- Status column: Draft (generated, not reviewed), Reviewed (opened + read), Sent (email delivered + permalink live)
- Edit mode: sections editable (attributed results, top fixes, competitor moves, "What Beamix Did Not Do" line from T83); re-signing not required for Monthly Update edits
- Approve and send: triggers Resend delivery; sets status = Sent
- Scale tier "This month" filter: all client drafts grouped; J/K keyboard navigation; bulk "Approve and send all reviewed" button
- Per-client "Always send automatically" toggle (default OFF; opt-in per-client)
- Generate/revoke share link per row: signed URL 7-day expiry (same pattern as /scan share); revoke invalidates immediately
- Receipt-That-Prints card on /home (T81) deep-links to relevant /reports row
- Reporter-no-zero-attribution rule: zero-attribution Monthly Updates escalate to Draft regardless of auto-send toggle
- Brief binding line at page footer (F31)
- Slash command (`/`) active in report editor mode (composable surface)

**Files touched:**
- `apps/web/src/app/reports/page.tsx`
- `apps/web/src/app/reports/[id]/edit/page.tsx`
- `apps/web/src/app/api/reports/route.ts`
- `apps/web/src/app/api/reports/[id]/send/route.ts`
- `apps/web/src/app/api/reports/[id]/share/route.ts`

---

### T77 — F38 Subscription Pause

**Tier:** 2
**Effort:** S
**Dependencies:** T3.3 (/settings → Billing tab), T0.5 (Inngest — subscription status check on every job), T0.11 (Resend — "Welcome back" resume email), T74 (F35 cancellation — pause is a sibling state)
**References:** PRD F38; `2026-04-28-PRD-12-unanswered-questions.md` Q10

**Acceptance criteria:**
- `/settings` → Billing tab: "Pause subscription" option distinct from "Cancel subscription"
- Pause options: 1 month or 3 months (radio buttons); resume date calculated and shown in confirmation modal
- Paddle API: `POST /subscriptions/{id}/pause` with `resume_at` timestamp; on Paddle-side resume, standard billing cycle resumes
- During pause: all scheduled Inngest jobs for account check `subscription_status = 'paused'` and skip; Twilio numbers remain active and logging
- /home banner during pause: "Beamix is paused until [date]. Your data is safe — resume early anytime."
- "Resume early" button: fires Paddle `POST /subscriptions/{id}/resume`; billing resumes from current date
- On automatic resume date: Inngest triggers first post-pause scan within 24 hours; "Welcome back" email within 15 minutes
- No Day 1-6 cadence emails on resume (not a new customer)
- Maximum 2 pauses per 12 months (third attempt shows error message)
- Yossi context: pause is per-account (all 12 clients pause simultaneously; per-client pause deferred to MVP-1.5)
- Annual plan: pause extends subscription end date by pause duration

**Files touched:**
- `apps/web/src/app/settings/billing/page.tsx` (pause UI addition)
- `apps/web/src/app/api/webhooks/paddle/route.ts` (extend with pause/resume handlers)
- `apps/web/inngest/functions/post-pause-baseline.ts`
- Email template: `welcome-back-resume.tsx`

---

### T78 — F39 Competitor Removal and False-Positive Management

**Tier:** 2
**Effort:** XS
**Dependencies:** T2.3 (/competitors surface must exist), T0.1 (schema — exclusion_list field or competitors `status` column)
**References:** PRD F39; `2026-04-28-PRD-12-unanswered-questions.md` Q11

**Acceptance criteria:**
- "Remove" action on every row in /competitors table (both KG-detected rows and customer-added rows)
- Removal: moves competitor to `removed` state (no deletion); removed list accessible via "Show removed" toggle at bottom of /competitors
- Confirmation modal: competitor name + "Beamix stops tracking them and won't mention them in future recommendations. Past work isn't affected." + optional "Reason for removing" free-text field
- Agent exclusion list updated on removal; all future Inngest agent runs read exclusion list before generating competitor-targeting content
- Exclusion list takes hard precedence over KG re-detection on subsequent scans (removed competitor is NEVER auto-re-added)
- "Restore" action on removed competitors: moves back to active; agents re-include on next cycle
- Empty state when all competitors removed: "No competitors tracked." + prompt to add custom competitors
- Audit log on removal and restore: actor, timestamp, competitor domain, reason if provided
- Yossi context: exclusion lists are per-client; removing a competitor in Client A does not affect Client B

**Files touched:**
- `apps/web/src/app/competitors/page.tsx` (Remove + Restore actions)
- `apps/web/src/app/api/competitors/[id]/remove/route.ts`
- `apps/web/src/app/api/competitors/[id]/restore/route.ts`
- `apps/web/supabase/migrations/` (competitors `status` column and `exclusion_lists` table if not in T0.1)

---

### T79 — F40 Scale Multi-Domain Pricing and Multi-Client Cockpit

**Tier:** 2
**Effort:** M
**Dependencies:** T3.4 (multi-client switcher), T0.1 (schema — `clients` table with `owner_customer_id`), T1.4 (onboarding API — full 4-step onboarding triggered per added domain)
**References:** PRD F40; `2026-04-28-PRD-12-unanswered-questions.md` Q12

**Acceptance criteria:**
- Scale tier: 5 domains included; each additional domain $49/month via Paddle add-on product
- `/settings` → Billing tab shows: current domain count, included domains (5), add-on domains purchased, per-domain add-on price, "Add a domain" button
- "Add a domain": Paddle add-on checkout ($49/month) → full 4-step onboarding ceremony for new domain (no abbreviated flow — every client gets full Brief + Truth File + Lead Attribution per F2 lock)
- Multi-client cockpit: visible on Scale tier at /home when ≥ 2 domains active; single-domain Scale accounts see standard /home
- Cockpit columns: Client name / Domain / AI Score (delta vs last week) / Inbox count / Agents in error / Monthly Update status / Attribution headline
- Cockpit row actions: Open client dashboard (switches client context), Approve all pending /inbox (single-client bulk-approve), Trigger manual scan
- Per-client white-label config accessible from cockpit → client row → "Brand settings" (not top-level /settings)
- "Powered by Beamix" footer (Geist Mono 9pt, `--color-ink-4`) default ON per-client, toggleable
- Domain deletion: data enters 90-day read-only mode; Paddle add-on cancelled at next billing cycle
- Brief binding line at cockpit footer (rotating through most-recently-active client's clauses, per F31)

**Files touched:**
- `apps/web/src/app/home/cockpit.tsx` (Scale multi-domain view)
- `apps/web/src/app/settings/billing/page.tsx` (add-domain flow)
- `apps/web/src/app/api/settings/domains/route.ts`
- `apps/web/src/app/api/webhooks/paddle/route.ts` (add-on subscription handlers)

---

## Tier 3 — Secondary Product Surfaces

*(v1 tickets T3.1–T3.5 preserved intact. New tickets T80–T87 append below.)*

---

### T3.1 through T3.5 — [unchanged from v1]

*See Build Plan v1 for full scopes.*

---

### T80 — F23 Amendment: Cycle-Close Bell + Arc's Wave (60ms stagger)

**Tier:** 3
**Effort:** XS
**Dependencies:** T0.12 (design system), T58 (`--ease-wave-stagger` must be defined), T0.13 (Activity Ring + Cycle-Close Bell must exist from design pipeline)
**References:** PRD F23 original + F23 amendment (Arc's Wave) in `2026-04-28-PRD-AMENDMENTS-v4.md`

**Acceptance criteria:**
- Cycle-Close Bell animation extended: 60ms stagger left-to-right wave fires on the small-multiples sparkline strip BEFORE the settle animation
- Wave timing: 11 cells × 60ms = 660ms total wave, then 200ms settle (existing settle animation)
- Stagger uses `--ease-wave-stagger` (T58 cubic-bezier)
- `prefers-reduced-motion`: wave animation skipped; settle animation still plays (non-decorative)
- Wave fires only on cycle-close event (not on page load, not on manual refresh)
- Animation is additive — does not remove or replace any existing Cycle-Close Bell behavior from v1 F23 spec

**Files touched:**
- `apps/web/src/components/CycleCloseBell.tsx`
- `apps/web/src/components/SmallMultiplesStrip.tsx`

---

### T81 — F25 Receipt-That-Prints Card

**Tier:** 3
**Effort:** S
**Dependencies:** T0.12 (design system — cream paper register), T58 (`--ease-paper-fold`), T2.5 (Monthly Update generation must produce a report for the card to reference), T76 (/reports route must exist for deep-link)
**References:** PRD F25; Design Board Round 1 synthesis

**Acceptance criteria:**
- Receipt-That-Prints card appears on /home when a new Monthly Update draft is ready (Reporter agent fires event)
- Card uses cream paper register (`--color-paper-cream`), Fraunces 300 italic, Geist Mono dateline
- Rough.js fold mark: deterministic seed from `YYYY-MM` string (e.g., seed("2026-04") produces consistent fold mark every time for that month)
- 600ms paper-fold animation on card entry: uses `--ease-paper-fold` cubic-bezier
- Card auto-files (disappears from /home) after 24 hours or after customer clicks through to /reports (whichever is first)
- Card deep-links to the relevant /reports row (the draft for that month)
- One card per Monthly Update per client; Yossi sees one card per client that has a new draft

**Files touched:**
- `apps/web/src/components/ReceiptThatPrintsCard.tsx`
- `apps/web/src/app/home/page.tsx` (card integration)

---

### T82 — F27 Print-the-Brief Button

**Tier:** 3
**Effort:** S
**Dependencies:** T0.12 (design system — A4 cream paper aesthetic), T1.5 (onboarding Step 3 — Brief approval ceremony where the button first appears), T71 (F32 — /brief re-author surface also gets 3-dot reprint), T59 (`@beamix/server-only-pdf` ESLint rule enforces React-PDF isolation)
**References:** PRD F27; PRD Amendments v4 F27 confirmation

**Acceptance criteria:**
- "Print Brief" button appears in two places: onboarding Step 3 post-Seal (as immediate post-approval action), and `/brief` 3-dot overflow menu ("Reprint Brief")
- PDF renders via React-PDF; `import 'server-only'` at top of render file (enforced by T59 ESLint rule)
- A4 layout: cream paper background, Fraunces 300 italic Brief header, Inter body for clause text, Geist Mono for metadata (date, version, brief_id)
- Beamix Seal on first page; "— Beamix" signature in Fraunces 300 italic at bottom
- Brief binding line at the bottom of page 1 (same rotating F31 pattern, deterministic by `dayOfMonth % clause_count`)
- PDF served as download (not browser preview) — `Content-Disposition: attachment`
- React-PDF server component: only rendered on server, never shipped to client bundle (verified by `@beamix/server-only-pdf` lint rule passing)

**Files touched:**
- `apps/web/src/components/PrintBrief.server.tsx`
- `apps/web/src/app/api/brief/print/route.ts`
- `apps/web/src/app/onboarding/step3.tsx` (button integration)
- `apps/web/src/app/brief/page.tsx` (3-dot overflow menu)

---

### T83 — F28 "What Beamix Did NOT Do" Line on Monthly Update

**Tier:** 3
**Effort:** XS
**Dependencies:** T2.5 (Monthly Update PDF generation), T76 (/reports editor — this line appears on Page 6 of the Monthly Update)
**References:** PRD F28; Design Board Round 1 synthesis

**Acceptance criteria:**
- Monthly Update PDF Page 6 includes a "What Beamix Did NOT Do" section
- 4 copy variants selected based on `rejection_count` (number of agent-proposed actions the customer rejected that month):
  - 0 rejections: "Everything Beamix proposed this month, you approved."
  - 1–2 rejections: "You asked Beamix to hold back on [N] suggestions. They're waiting in your queue."
  - 3–5 rejections: "You shaped this month's work by declining [N] proposals. That's the point."
  - 6+ rejections: "Beamix proposed [N] actions. You approved [approved_count]. The rest remain yours to decide."
- Variant selection logic in a pure function `selectNotDoVariant(rejectionCount: number): string`
- Variant rendered in Geist Mono 10px on cream paper, styled as a colophon note below the main Monthly Update body
- No copy uses AI labels ("AI decided", "algorithm chose" — banned)

**Files touched:**
- `apps/web/src/lib/monthly-update/not-do-variant.ts`
- `apps/web/src/components/pdf/MonthlyUpdatePDF.tsx` (Page 6 addition)

---

### T84 — F29 Printable A4 Operations Card

**Tier:** 3
**Effort:** S
**Dependencies:** T3.3 (/settings — card lives in a /settings sub-page), T0.12 (design system), T1.8 (Lead Attribution — Twilio number displayed on card), T79 (Yossi multi-domain — card handles multi-domain)
**References:** PRD F29; Design Board Round 1 synthesis

**Acceptance criteria:**
- `/settings/ops-card` sub-page (accessible from /settings sidebar or /settings overview "Print ops card" link)
- A4 layout: cream paper, Inter 11px body, Geist Mono for numbers/domains, Beamix Seal top-right
- Card content: domain, AI score (last scan date), Twilio number(s) with QR code linking to the UTM-tagged URL, top 3 agent recommendations (one sentence each), Brief signing date, next scheduled scan
- Yossi multi-domain: card is per-client (client-switcher context); "Print all clients" generates one card per client in a single PDF (each on a separate A4 page)
- Print stylesheet: always full-spacing (compact mode does not apply to print)
- PDF served via React-PDF (server-only per T59 lint rule)
- QR code generation: server-side using a lightweight library (no client-bundle impact)

**Files touched:**
- `apps/web/src/app/settings/ops-card/page.tsx`
- `apps/web/src/app/api/settings/ops-card/route.ts`
- `apps/web/src/components/pdf/OpsCardPDF.tsx`

---

### T85 — F30 Brief Grounding Inline Citation: All Production Surfaces + API Extension

**Tier:** 3
**Effort:** S
**Dependencies:** T2.1 (/inbox), T2.2 (/workspace), T2.3 (/scans Done lens), T4.1 (Workflow Builder published-action), T1.1 (scan API — API response schema extension), T0.4 (types — `authorized_by_brief_clause` field added to API response types)
**References:** PRD F30 original + F30 amendment (extend to API) in `2026-04-28-PRD-AMENDMENTS-v4.md`

**Acceptance criteria:**
- Brief grounding citation rendered on all 4 production surfaces:
  1. /inbox row: Geist Mono 11px `--color-ink-3` below the action summary — "Authorized by your Brief: [clause N]"
  2. /workspace step panel: Brief clause referenced in provenance trace (already partially implemented; this ticket verifies and adds the visual treatment)
  3. /scans Done lens: citation on each scan result row that was acted on by an agent
  4. Workflow Builder published-action: citation in the node detail panel
- API extension: every Beamix API response includes `authorized_by_brief_clause` field: `{ clause_uuid: string; clause_text_truncated: string }` (truncated to ≤ 120 chars)
- API response Zod schema updated to include this field as non-optional for agent-action endpoints (null for non-agent endpoints)
- Results without an authorizing Brief clause show no citation row (citation is per-result, not forced)
- API documentation stub updated (internal `docs/api-schema.md` or equivalent) noting the `authorized_by_brief_clause` field as a structural commitment

**Files touched:**
- `apps/web/src/components/BriefGroundingCitation.tsx`
- `apps/web/src/app/inbox/InboxRow.tsx`
- `apps/web/src/app/workspace/StepPanel.tsx`
- `apps/web/src/app/scans/DoneLens.tsx`
- `apps/web/src/app/workspace/workflow/NodeDetailPanel.tsx`
- `apps/web/src/app/api/` (all agent-action route response schemas updated)
- `apps/web/lib/schemas/api-responses.ts`

---

### T86 — F31 Brief Binding Line at Every Product Page Bottom

**Tier:** 3
**Effort:** XS
**Dependencies:** T0.12 (design system), T1.4 (onboarding API — Brief clauses must exist in DB), T0.1 (schema — briefs + brief_clauses tables)
**References:** PRD F31; Design Board Round 1 synthesis

**Acceptance criteria:**
- `apps/web/src/components/BriefBindingLine.tsx` component that renders a single Brief clause as a footer line: Geist Mono 11px `--color-ink-4`, italic, centered
- Clause selection: deterministic rotation `dayOfMonth % brief.clauses.length` — same clause shows all day, rotates at midnight UTC
- BriefBindingLine rendered at the bottom of every product page: /home, /inbox, /workspace, /scans, /crew, /competitors, /schedules, /settings, /cockpit, /reports, /trust/*, /changelog, error pages (T68), onboarding (T1.5)
- Page layout component updated to include BriefBindingLine in the footer slot for all authenticated routes
- Unauthenticated pages (/scan, /s/{token}): no binding line (no Brief exists yet)
- If no Brief is signed: binding line shows "Sign your Brief to see it here." in same Geist Mono style
- Server-side rendering (brief clause fetched server-side, not client-side, to avoid layout shift)

**Files touched:**
- `apps/web/src/components/BriefBindingLine.tsx`
- `apps/web/src/app/layout.tsx` (authenticated layout wrapper)

---

### T87 — F2 Amendment: Arc's Hand (1px ink-1 dot beside Seal during stamp)

**Tier:** 3
**Effort:** XS
**Dependencies:** T0.12 (design system — Seal animation), T0.13 (per-customer seal SVG must exist), T1.5 (onboarding UI — Seal stamp animation)
**References:** PRD F2 amendment — Arc's "Hand" in `2026-04-28-PRD-AMENDMENTS-v4.md`

**Acceptance criteria:**
- During the 540ms Seal stamp animation in onboarding Step 3 (and in the /settings Brief re-sign flow, T71):
  - A 1px circular dot in `--color-ink-1` appears beside the Seal SVG
  - Dot fade-in: starts at t=120ms (during the path-draw phase of the stamp)
  - Dot hold: holds through the hold phase of the stamp
  - Dot fade-out: fades out with the seal-fade at the end of the animation
- Dot position: 8px to the right of the Seal stamp's rightmost point (appears as "the hand that stamped it")
- `prefers-reduced-motion`: dot animation skipped entirely; Seal stamp still plays
- Additive to existing Seal animation — no existing Seal timing is changed

**Files touched:**
- `apps/web/src/components/SealStamp.tsx`
- `apps/web/src/app/onboarding/step3.tsx` (if SealStamp is not a standalone component there)

---

## Tier 4 — Power-User Features

*(v1 tickets T4.1–T4.3 preserved intact. No new Tier 4 tickets in v2.)*

---

### T4.1 through T4.3 — [unchanged from v1]

*See Build Plan v1 for full scopes.*

---

## Tier 5 — Post-MVP / MVP+30 / MVP+90

*(v1 tickets T5.1–T5.6 preserved intact. New tickets T88–T92 append below.)*

---

### T5.1 through T5.6 — [unchanged from v1]

*See Build Plan v1 for full scopes.*

---

### T88 — F43 HackerOne Bug Bounty Program Live

**Tier:** 5 (MVP+30)
**Effort:** S
**Dependencies:** T66 (Trust Center — `/trust/disclosure` stub already created by T66; T88 populates it), T64 (`security.txt` Acknowledgments field references T88's HackerOne disclosure page)
**References:** PRD F43; Design Board R2-8

**Acceptance criteria:**
- HackerOne program page live (external — Adam creates the HackerOne account and program; this ticket covers the Beamix-side disclosure page and internal process)
- `/trust/disclosure` page (stubbed by T66) populated with:
  - Scope: `beamixai.com`, `app.beamixai.com`, `api.beamixai.com`, customer dashboards
  - Bounty payouts: $500 minimum, $20,000 annual ceiling
  - Response SLAs: 5 business days triage, 30 days fix-or-mitigation
  - Out-of-scope items (customer-owned sites, third-party services)
  - Acknowledgments: monthly-updated list of researchers who reported valid issues (name + handle + month; opt-out available)
  - Emergency line note for Sev-1 critical issues (email only at MVP)
- `security.txt` `Acknowledgments` and `Policy` fields updated to point to `/trust/disclosure`
- HackerOne program linked from `/trust/compliance`
- Internal process documented (where Sev-1 reports route, who triages): documented in Beamix internal ops doc (not a code file — this is a process deliverable)

**Files touched:**
- `apps/web/src/app/trust/disclosure/page.tsx`
- `apps/web/public/.well-known/security.txt` (update Acknowledgments + Policy URLs once T66 URLs confirmed)

---

### T89 — F42 SOC 2 Type I Auditor Engagement

**Tier:** 5 (MVP launch — observation period starts)
**Effort:** XS (code effort minimal; primary effort is Adam's vendor engagement)
**Dependencies:** T66 (Trust Center `/trust/compliance` page — audit status displayed here)
**References:** PRD F42; Design Board R2-7

**Acceptance criteria:**
- Auditor engaged: Drata (compliance automation) + Prescient Assurance (audit firm) or equivalent; engagement letter signed before MVP launch
- `/trust/compliance` page updated with:
  - "SOC 2 Type I — Observation period in progress" status badge (live at MVP launch)
  - Observation period start date (actual date, not placeholder)
  - Audit firm name (actual firm name once engaged)
  - Expected report delivery date (MVP+90 target)
  - Note: "Report delivered and published here when complete"
- Drata (or equivalent) compliance tooling connected to: Supabase, Vercel, GitHub Actions, Resend, Paddle (evidence collection automated)
- Internal Drata dashboard accessible to Adam and designated ops contact
- This is not a code-heavy ticket — the primary deliverables are vendor engagement (Adam's action) and the `/trust/compliance` page copy update

**Files touched:**
- `apps/web/src/app/trust/compliance/page.tsx` (audit status section updated)

---

### T90 — F47 State of AI Search 2026 Production

**Tier:** 5 (MVP+90)
**Effort:** L (code side only; full production is XL per PRD — editorial and print are out of scope for build workers)
**Dependencies:** T0.10 (cost ledger — longitudinal data collection must have been running since MVP launch for 60-90 days), T0.1 (scan data schema — all 11 engine results must be accumulating), T67 (/changelog — OG share card pattern reused for State of AI Search share card)
**References:** PRD F47; Design Board R2-15; `BOARD2-research-state-of-ai-search-undefer.md`
**Note:** 8 hero charts require ≥60-90 days of production scan data. Build the route and tooling at MVP; data-complete render ships at MVP+90. Editorial contractor engagement (~$10-15K) and designer engagement (~$10-12K) are Adam's vendor actions, not build tickets.

**Acceptance criteria (code deliverables only):**
- `/state-of-ai-search` route: cream paper editorial register, Fraunces 300 italic section heads, Inter body, Geist Mono for stats; OG share card (cream paper + cartogram preview + Seal)
- Page structure placeholder live at MVP: "State of AI Search 2026 — Publishing [target date]" with email capture (Resend list)
- Data instrumentation for 8 hero charts (data collection runs from MVP launch; charts render when 60-90 day threshold is met):
  1. Citation share by AI engine for SMBs (11 engines × 4 verticals)
  2. Schema.org markup citation lift (confidence-tested)
  3. AI search loneliness cohort decay (≥60-day data)
  4. Engine reliability ranking (consistency scoring)
  5. Engine divergence (where engines disagree)
  6. Fastest-growing AI search citations of Q1 2026
  7. Verticals AI search engines cite most reliably
  8. 30-day-after-launch invisibility curve (cohort data)
- `/state-of-ai-search/[edition]` permalink for downloadable PDF (gated by email capture — Resend list-building)
- Annual cadence locked (April every year — Inngest annual trigger reminder)
- 50 numbered print copies: shipping address capture field on email gate form (optional)
- `X-Robots-Tag` on pre-publish route: `noindex` until report goes live (set to indexable at publish)

**Files touched:**
- `apps/web/src/app/state-of-ai-search/page.tsx`
- `apps/web/src/app/state-of-ai-search/[edition]/page.tsx`
- `apps/web/src/app/api/research/state-of-ai-search/charts/route.ts` (data aggregation for 8 charts)
- `apps/web/inngest/functions/research-data-collection.ts` (daily aggregation cron)

---

### T91 — F26 Print-Once-As-Gift (Month-6 Trigger)

**Tier:** 5 (MVP+180 — fires for month-6 customers)
**Effort:** S
**Dependencies:** T0.1 (schema — optional shipping address field; can be added in a follow-up migration), T1.5 (onboarding — optional shipping address capture in Step 1 or post-onboarding prompt), T90 (State of AI Search print logistics vendor pattern reused)
**References:** PRD F26; Design Board Round 1 synthesis

**Acceptance criteria:**
- Inngest function `customer/print-gift.trigger` fires when a customer's `onboarding_completed_at` is exactly 6 months ago (monthly cron checks)
- Admin endpoint `/api/admin/print-gift/trigger` allows manual trigger per customer_id (Adam's account action)
- Shipping address: collected optionally during onboarding (T1.5 extension — optional field) or via a "Where should we send your gift?" prompt at the 6-month mark (Resend transactional email with a link to a simple form)
- Vendor: TBD (Lulu / Printful / specialist letterpress — vendor selection is Adam's decision; code delivers a structured print order payload in the format of the selected vendor's API)
- Print artifact: 1 printed copy of the customer's Month 6 Monthly Update PDF (from /reports archive), bound, mailed to their shipping address
- Admin print queue: `/api/admin/print-queue` returns all customers with triggered-but-unshipped print orders (internal admin surface, admin JWT required)
- "Gift sent" flag on customer record: prevents double-triggering

**Files touched:**
- `apps/web/inngest/functions/print-gift-trigger.ts`
- `apps/web/src/app/api/admin/print-gift/route.ts`
- `apps/web/src/app/api/admin/print-queue/route.ts`
- `apps/web/supabase/migrations/` (shipping_address + print_gift_sent columns on customers table)

---

### T92 — F24 Brief Re-Reading Quarterly Trigger

**Tier:** 5 (post-MVP — fires quarterly; first trigger is 90 days after MVP launch for earliest customers)
**Effort:** XS
**Dependencies:** T71 (F32 Brief re-author flow — clicking "Edit Brief" at the prompt enters that flow), T0.5 (Inngest — quarterly cron), T0.11 (Resend — quarterly nudge email optional)
**References:** PRD F24; PRD F32 (the re-reading prompt feeds into the F32 re-author flow)

**Acceptance criteria:**
- Inngest function `customer/brief-rereading.quarterly` fires on the first Monday of each new quarter for all active customers
- Trigger: 3-second full-screen moment on /home next login after trigger fires — cream paper overlay, Brief text rendered in full, Fraunces 300 italic, Beamix Seal
- Two actions on the overlay: "Looks good" (date-stamps the Brief as reviewed; adds a `last_reread_at` timestamp to `briefs` table; dismisses overlay), "Edit Brief" (enters the F32 re-author chip editor flow)
- Overlay only shows once per quarter (localStorage + DB flag `brief_reread_prompted_at` prevents re-showing until next quarter)
- `prefers-reduced-motion`: overlay entry animation skipped; content still shown
- "Looks good" confirmation: brief confirmation message "Brief confirmed [today's date]." in Geist Mono 11px, fades out
- Quarterly email nudge (optional, per notification preferences): Resend email day before the quarterly Monday — "Your Brief is ready for its quarterly review." (customer can turn off in /settings → Notifications)

**Files touched:**
- `apps/web/inngest/functions/brief-rereading-quarterly.ts`
- `apps/web/src/components/BriefRereadingOverlay.tsx`
- `apps/web/src/app/home/page.tsx` (overlay integration)
- `apps/web/supabase/migrations/` (`last_reread_at` + `brief_reread_prompted_at` on `briefs` table)

---

## Dependency Graph Updates (v2 additions)

Cross-tier dependencies for new tickets only. v1 dependency graph preserved intact.

```
T58 (motion.css) ──────────────────────────────► T59 (ESLint rules) ──────────────────────────►
                                                                                                  │
T61 (status-vocab.ts) ──────────────────────────►                                                │
                                                                                                  ▼
T0.12 (design system) ──────────────────────────► T62 (block types) ──────────────► T70 (slash command)
       │                                                                                   │
       ▼                                                                                   ▼
T60 (variable Inter) ──────────────────────────► T65 (dark tokens)             T76 (/reports)
       │
T63 (CI gate — needs running app)

T64 (security.txt) ──────────────────────────────► T66 (Trust Center) ──────────► T88 (HackerOne disclosure)
                                                                                         │
T0.15 (DPA legal docs) ──────────────────────────► T66 (Trust Center /trust/dpa)        │
                                                                                         │
T86 (binding line component) ──────────────────────────────────────────────────────────► all Tier 2 pages

T1.5 (onboarding UI) ──────────────────────────► T71 (Brief re-author) ──────────► T92 (quarterly trigger)
T1.4 (onboarding API) ──────────────────────────►

T2.5 (Monthly Update PDF) ──────────────────────► T76 (/reports) ──────────────── T81 (Receipt card)
                                                      │
                                                      ▼
                                                   T83 (Not-Do line) ── already in T76 edit surface

T3.3 (/settings tabs) ──────────────────────────► T72 (Team tab)
                        ──────────────────────────► T73 (Privacy & Data tab)
                        ──────────────────────────► T74 (cancel flow in Billing tab)
                        ──────────────────────────► T77 (pause in Billing tab)
                        ──────────────────────────► T79 (domain count in Billing tab)
```

| New ticket | Blocks downstream | Why |
|------------|-------------------|-----|
| T58 (motion.css) | T59, T80, T81, T87 | Named easing curves referenced by motion animations |
| T62 (block types) | T70, T76 | Composable surface architecture depends on block interface |
| T65 (dark tokens) | All post-MVP dark implementation | Token definitions gate dark mode component work |
| T86 (binding line) | T66, T67, T68, T71–T79, T82, T84, T85 | Every surface needs the component before it can add a binding line |
| T66 (Trust Center) | T88, T89 | Compliance and bounty pages live within /trust |
| T71 (Brief re-author) | T92 (quarterly flow calls re-author) | Quarterly trigger enters re-author flow |
| T76 (/reports) | T81, T83 | Receipt card and Not-Do line both depend on /reports route |

---

## Worktree Branch Naming — v2 Additions

New branches appended to v1 naming convention:

```
Tier 0 (new):
  feat/t58-motion-curves          — T58
  feat/t59-eslint-rules           — T59
  feat/t60-variable-inter         — T60
  feat/t61-status-vocab           — T61
  feat/t62-block-types            — T62
  feat/t63-speed-ci               — T63
  feat/t64-security-txt           — T64
  feat/t65-dark-tokens            — T65

Tier 1 (new):
  feat/t66-trust-center           — T66
  feat/t67-changelog              — T67
  feat/t68-error-pages            — T68
  feat/t69-command-bar            — T69
  feat/t70-slash-command          — T70

Tier 2 (new):
  feat/t71-brief-reauthor         — T71
  feat/t72-team-seats             — T72
  feat/t73-data-export            — T73
  feat/t74-graceful-cancel        — T74
  feat/t75-domain-migration       — T75
  feat/t76-reports-route          — T76
  feat/t77-subscription-pause     — T77
  feat/t78-competitor-removal     — T78
  feat/t79-scale-multidomain      — T79

Tier 3 (new):
  feat/t80-cycle-close-wave       — T80
  feat/t81-receipt-card           — T81
  feat/t82-print-brief            — T82
  feat/t83-not-do-line            — T83
  feat/t84-ops-card               — T84
  feat/t85-brief-grounding        — T85
  feat/t86-binding-line           — T86
  feat/t87-arcs-hand              — T87

Tier 5 (new):
  feat/t88-hackeron-bounty        — T88
  feat/t89-soc2-engagement        — T89
  feat/t90-state-ai-search        — T90
  feat/t91-print-once-gift        — T91
  feat/t92-brief-rereading        — T92
```

---

## Quality Gates Summary — v2 Additions

Beyond v1 quality gates (preserved intact), v2 adds the following gate requirements:

| Gate | Tier | v2 additions |
|------|------|--------------|
| Tier 0 | Before any product feature | T58–T65 all pass; 10 easing curves in CSS; ESLint rules pass unit tests; font bundle ≤ 90KB; status-vocab.ts compiles; 18 block types compile; CI speed gate posts PR comment; security.txt serves at /.well-known/; dark tokens defined under dark selector |
| Tier 1 | After scan + onboarding + /home | T66 Trust Center 4 sub-pages live; T67 /changelog with 1 seed entry; T68 all 4 error pages in cream register; T69 Cmd-K opens from every authenticated page; T70 slash command on /reports and Workflow Builder only |
| Tier 2 | After inbox + email + scans | T71 Brief undo window timer functional; T72 invite email sends and team member can log in; T73 ZIP export downloads for small account synchronously; T74 cancel flow fires Twilio release cron; T75 domain migration wizard completes E2E with re-signed Brief; T76 /reports table renders with Draft/Reviewed/Sent statuses; T77 Paddle pause API integrates; T78 removed competitor does not re-appear after re-scan; T79 Scale add-domain checkout fires full 4-step onboarding |
| Tier 3 | After settings + crew + multi-client | T80 wave fires before settle on Cycle-Close Bell; T81 card appears on /home after Monthly Update draft ready; T82 Print Brief PDF serves with correct cream paper; T83 Not-Do copy variant selects correctly for 0/1-2/3-5/6+ rejection counts; T84 ops card PDF renders per-client; T85 Brief grounding citation visible on /inbox row; T86 binding line renders on every product page; T87 ink-1 dot visible at t=120ms in Seal animation |
| Tier 5 | Post-MVP ships | T88 HackerOne program live; T89 auditor engaged + observation period start date on /trust/compliance; T90 /state-of-ai-search route live with placeholder + data collection running; T91 print-gift cron fires at month-6 mark; T92 quarterly Brief overlay fires on first Monday of quarter |

---

## Total Ticket Count (v2)

| Tier | v1 tickets | v2 new tickets | Total |
|------|-----------|----------------|-------|
| Tier 0 | 15 (T0.1–T0.15) | 8 (T58–T65) | 23 |
| Tier 1 | 8 (T1.1–T1.8) | 5 (T66–T70) | 13 |
| Tier 2 | 6 (T2.1–T2.6) | 9 (T71–T79) | 15 |
| Tier 3 | 5 (T3.1–T3.5) | 8 (T80–T87) | 13 |
| Tier 4 | 3 (T4.1–T4.3) | 0 | 3 |
| Tier 5 | 6 (T5.1–T5.6) | 5 (T88–T92) | 11 |
| **Total** | **43** | **35** | **78** |

*Note: v1 summary counted 51 primary + 6 MVP-1.5 = 57 total. v2 adds 35 tickets for a total of 92 tickets by IDs, 78 in the structured tier table above (reflecting the v1 recount of 43 structured tickets + 35 new).*

---

## What Build Lead Needs From Adam Before Starting New Tickets

The following require Adam's confirmation or action before specific new tickets can dispatch:

**For T88 (HackerOne):** Create HackerOne account and program page. Provide the program URL so T88's disclosure page can link to it. Annual budget commitment ($20K ceiling) confirmed.

**For T89 (SOC 2):** Engage Drata (compliance automation) + Prescient Assurance (or equivalent audit firm). Confirm observation period start date. Budget: ~$8K–15K for Type I audit. Provide auditor name + engagement letter date once signed.

**For T90 (State of AI Search):** Confirm MVP+90 ship window (R2-18 outstanding). Engage editorial contractor (~$10-15K) and designer (~$10-12K) independently of the build sprint. Print vendor (Lulu/Printful) decision needed before T91 can complete.

**For T74 (annual plan pause behavior):** Confirm Paddle API behavior for pausing annual subscriptions — does pause extend end date or credit billing proportionally? Confirm before T77 ships.

**For T68 (status page):** Select status page vendor (Better Stack or Statuspage.io or equivalent). Build ticket creates the redirect; Adam sets up the external account.

**For T91 (print gift):** Select print vendor (Lulu / Printful / specialist letterpress). Print order payload format depends on vendor's API.

---

*End of Build Plan v2. Total new tickets: 35 (T58–T92). All v1 ticket numbers (T0.1–T5.6) preserved. Dispatch begins tier-by-tier; Tier 0 canonical gates (T58–T65) complete before Tier 1 new tickets dispatch.*

*— Build Lead*
