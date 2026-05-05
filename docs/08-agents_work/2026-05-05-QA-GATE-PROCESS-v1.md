# Beamix — Multi-Wave QA Gate Process v1

**Date:** 2026-05-05
**Author:** CEO
**Status:** CANONICAL — process spec for all agent-driven build waves. Apply to every wave from Tier 0 onward.
**Trigger:** Adam R4 lock: "After every wave we need to deploy QA designer + QA backend + QA thinking + code quality QA — to research everything and make sure everything is up to standards."
**Context:** "Multi-agent parallel builds without a holistic review gate produce a committee product." — Red-Team Audit 2026-05-05

---

## How to use this document

Paste this at the top of any Build Lead's workflow brief. Every section is self-contained and machine-parseable. QA agents load only the sections marked as their **Required Reading**. Findings docs follow the fixed templates in §3. Severity gates are mechanical — no judgment calls.

---

## §1 — The Wave Model

### What constitutes a wave

A **wave** is a parallel dispatch of 3–6 worker agents, each implementing one ticket from the same Tier. Tickets in a wave share a dependency envelope: all tickets in the wave can proceed simultaneously because none depends on another ticket in the same wave.

**Wave naming convention:** `Tier-[N]-Wave-[M]` — e.g., `Tier-0-Wave-1`, `Tier-1-Wave-2`.

**Wave composition example:** Tier-0-Wave-1 = T58 + T59 + T60 + T93 + T94. These 5 tickets have no intra-wave dependencies and can run in parallel. Each worker returns to its own worktree branch.

### Wave boundaries

A wave **ends** when all dispatched tickets return one of:
- `COMPLETE` — branch pushed, files committed, acceptance criteria verified by worker
- `BLOCKED` — worker encountered a dependency or ambiguity it cannot resolve autonomously

A wave does NOT end when some tickets complete and others are still running. The Build Lead waits for every ticket to resolve before declaring wave-complete and dispatching QA. **Partial waves do not enter QA.**

### Wave size limits

| Wave size | Rule |
|-----------|------|
| 3–6 tickets | Standard. Preferred range. |
| 7+ tickets | Not permitted. Split into two sequential waves (Wave-N + Wave-N+1). |
| 1–2 tickets | Permitted only for L/XL-effort tickets (e.g., T100 alone as Tier-1-Wave-1). |

Smaller waves produce smaller QA diffs. Every ticket added to a wave increases the QA surface area quadratically, not linearly, because interactions between changes are what QA must evaluate.

### Wave dependency rules

**Tier N wave cannot begin until Tier N-1 final QA pass is complete and all 🔴 findings are resolved.**

Within a Tier, Wave-M+1 cannot begin until Wave-M passes QA and merges to main. This is the only enforced sequencing constraint. Within a wave, all tickets are parallel.

Exception: a BLOCKED ticket from Wave-N is resolved as a solo ticket in Wave-N+1 if the BLOCKED reason is self-contained (e.g., missing env var). Build Lead decides whether to hold the next wave or proceed in parallel.

### Wave records

Build Lead writes a wave-completion summary before dispatching QA. Format:

```
Wave: Tier-0-Wave-1
Tickets: T58, T59, T60, T93, T94
Status: COMPLETE (5/5) | COMPLETE (4/5), BLOCKED (1/5)
Branches: feat/T58, feat/T59, feat/T60, feat/T93, feat/T94
Files changed: [aggregate list from worker returns]
Ticket-specific ACs verified by worker: [list per ticket]
Known issues reported by workers: [list or "none"]
```

This summary is the input to QA dispatch. QA agents do not read individual ticket reports — they read the wave-completion summary and then inspect code directly.

---

## §2 — The 4 QA Agents

### 2.1 Design QA Agent

**Identity.** Design QA is a senior product designer who has internalized the Beamix Design System v1 and PRD v5 and treats both as constitutional law. She reviews every surface that a customer will see or touch. She cares about: pixel fidelity to design tokens, typography hierarchy, motion craft, the cream-paper register partition, voice canon compliance, and accessibility contrast. She does not care about: backend logic, TypeScript types, API contracts, or test coverage — those are other agents' territory. She does not have opinions; she has rules.

**Subagent type:** `design-critic` (existing role — specialist variant of code-reviewer)

**Model:** `claude-opus-4-6` (depth work; design judgment requires semantic reasoning about ambiguous visual states)

**Required reading (load before review):**
- `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` — full document
- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §F2 (phases), §F22 (cartogram), voice canon section
- Wave-completion summary from Build Lead

**Tool access:** Read, Grep, Bash (for running `pnpm build --analyze` and `pnpm lint`)

**Checklist — minimum 10 items evaluated per wave (apply only items relevant to changed files):**

1. **Token compliance** — No hardcoded color hex values in any `.tsx`, `.css`, or `.module.css` file. Every color reference uses a `--color-*` CSS custom property from Design System §1.1. Grep for `#[0-9a-fA-F]{3,6}` in changed files and flag every hit.
2. **Spacing compliance** — No spacing values outside the permitted set `{4, 8, 12, 16, 24, 48, 72, 120}px` plus the two named exceptions `{6px pill, 10px form}`. Grep for `px` values in className strings and inline styles.
3. **Typography hierarchy** — Fraunces (`font-serif`, `--font-brief-clauses`) appears ONLY on cream-paper-register surfaces (Brief body, Monthly Update PDF, `/scan` public editorial copy, email digest header). Never on product UI chrome. Inter covers all body and UI. InterDisplay covers headings and score numbers. Geist Mono covers timestamps, scan IDs, code.
4. **Motion tokens** — No `transition-all` in any changed file (lint rule `@beamix/no-shared-easing`). All transitions reference a named `--duration-*` or `--ease-*` CSS custom property. Grep for `transition-all`, `ease-in`, `ease-out`, `ease-in-out` as raw strings (not token references).
5. **Reduced motion** — Every animated component checks `prefers-reduced-motion`. Rough.js animations, phase cross-fades, Seal ceremony, Bell wave: all must have a `useReducedMotion()` guard that snaps immediately or skips decorative animation.
6. **Cream-paper partition** — `--color-paper-cream` (`#F7F2E8`) appears ONLY on: Brief background, Monthly Update PDF, `/scan` public hero, email digest header strip, OG share card. Never on product UI chrome (`/home`, `/inbox`, `/workspace`, `/crew`, `/settings`, `/scans`). Any use of cream on a product chrome surface is a P1.
7. **Voice canon compliance** — Grep changed files for: `BeamixAI` (must be `Beamix`), agent names in email/PDF/permalink output strings (`Schema Doctor`, `Citation Fixer`, `FAQ Agent`, `Competitor Watch`, `Trust File Auditor`, `Reporter` in any string that routes to email template, PDF generation, or public permalink). Agent names are permitted only on: `/home` Evidence Strip, /crew, /workspace, /inbox row attribution.
8. **Brief grounding citation** — Any Phase 5 (`brief-co-author`) or Phase 6 (`brief-signing`) component must render the right-column inline-citation preview (F30 Amendment v5). Verify `BriefCoAuthor.tsx` and `BriefSigning.tsx` include the citation panel when F30 is in scope for the wave.
9. **Mobile treatment** — Changed components must render without overflow, truncation errors, or broken layout at 375px viewport width. Playwright snapshot at 375px if component affects any user-facing surface.
10. **Hebrew RTL treatment** — If a changed component renders on a surface that supports `[lang="he"]`, verify: `dir="rtl"` on the container, Heebo font stack applied (`--font-brief-clauses-he`), Geist Mono elements inside RTL context have explicit `dir="ltr"`.
11. **WCAG 2.1 AA contrast** — Any text rendered on cream background (`--color-paper-cream`) must use the `-text` variant tokens (e.g., `--color-score-excellent-text` not `--color-score-excellent`). Focus rings must be `2px solid #3370FF` (T98). Grep for focus-visible rules in changed CSS.
12. **Sigil placement rules** — Ring appears only at 96px+ on `/home` above-fold, `/scan` public, Monthly Update PDF header. Seal replaces Ring below 96px. Monogram used only for agent avatar circles. Trace appears only on text the system modified within 24h (temporal, not decorative).

**Output format:**

```markdown
## Design QA — [Wave ID] — [Date]

### Summary
[1-2 sentences: overall assessment]

### Findings

| ID | Severity | File | Line(s) | Finding | Rule | Fix |
|----|----------|------|---------|---------|------|-----|
| DQ-001 | 🔴 P1 | path/to/file.tsx | 47 | `#FFCCBB` hardcoded on card background | Token §1.1 | Replace with `--color-paper-elev` |
| DQ-002 | 🟡 P2 | ... | ... | ... | ... | ... |
| DQ-003 | 🟢 P3 | ... | ... | ... | ... | ... |

### Pass / Block verdict
[PASS — no 🔴 findings] | [BLOCK — [N] 🔴 findings must be resolved before merge]
```

**Severity definitions:**

- **🔴 P1 (blocks merge):** Token violation directly visible to a customer. Voice canon violation on a customer-facing surface. Cream-paper partition violation on a product chrome surface. Any hardcoded color hex. `transition-all` on an animated component. Missing reduced-motion guard on a motion-heavy component. `BeamixAI` in any customer-visible string.
- **🟡 P2 (fix this wave):** Spacing value outside permitted set (but not customer-visible as a major layout break). Typography hierarchy inconsistency (e.g., body text using InterDisplay weight instead of Inter 400). Motion timing off by >20% from token value (e.g., 600ms where 540ms is locked). Missing mobile treatment that causes truncation but not complete breakage.
- **🟢 P3 (next-wave backlog):** Minor polish: letter-spacing slightly off on `text-xs` labels. Shadow token using slightly warm-biased value but within acceptable range. Optional enhancement: could add Fraunces accent on an editorial sentence that currently uses Inter.
- **✅ Noted (no action):** Deliberate deviation from system with clear justification in code comment. Known future ticket reference present.

---

### 2.2 Backend QA Agent

**Identity.** Backend QA is a senior security-aware API engineer who has read every Supabase, Inngest, Resend, and Paddle integration spec in the PRD. He reviews API routes, database RLS policies, webhook handlers, Inngest job functions, email pipelines, and billing state transitions. He cares about: correctness, security, idempotency, and data integrity under failure. He does not care about visual design or component composition. He is paid to find the vulnerability nobody thought to check.

**Subagent type:** `security-engineer` (existing role — applies full security audit posture to backend changes)

**Model:** `claude-sonnet-4-6` (systematic rule-checking; pattern matching against known RLS/Zod/webhook patterns)

**Required reading (load before review):**
- `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §F4 (billing), §F14 (email), §F51 (activation model), §F54 (agent-run caps)
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` — Tier 0 DB schema tickets (T0.1), Inngest tickets, Paddle webhook tickets
- Wave-completion summary from Build Lead

**Tool access:** Read, Grep, Bash (for `pnpm typecheck`, `pnpm lint`, Supabase MCP for RLS inspection)

**Supabase MCP obligation:** Use `mcp__supabase__execute_sql` to verify RLS policies on any table touched by the wave. Do not trust code comments — verify against live DB policy definitions.

**Checklist — evaluated per wave (apply only items relevant to changed files):**

1. **Zod validation on all API route inputs** — Every `POST`, `PUT`, `PATCH` route handler parses `request.json()` through a Zod schema before using any field. No raw destructuring of `req.body`. Grep for `request.json()` without a subsequent `.parse(` or `.safeParse(`.
2. **RLS policies present on every Supabase table touched** — Use `mcp__supabase__execute_sql` to run `SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename IN ([affected tables])`. Every user-owned table must have at minimum a SELECT + INSERT policy with `auth.uid() = customer_id` or equivalent ownership check.
3. **Inngest functions idempotent** — Every `inngest.createFunction` handler uses the `event.id` or a business-level idempotency key to prevent double-execution on retry. Check that DB writes inside Inngest steps are upserts (not raw inserts) or are guarded by a status check.
4. **Inngest error handling** — Every Inngest step has either a `try/catch` that produces a structured error event, or the Inngest function-level `onFailure` handler is wired. No silent failures. Check that failed Inngest jobs update the relevant DB row status to `'error'` rather than leaving it in `'running'`.
5. **Webhook signature verification** — Every Paddle webhook handler calls `paddle.webhooks.unmarshal(rawBody, webhookSecret)` (or equivalent SDK method) before processing any payload. No processing of unsigned webhook payloads. Grep for `paddle` webhook routes without signature verification.
6. **Paddle subscription state machine correctness** — State transitions: `active → cancelled → past_due → paused` must be handled correctly in the webhook handler. Cancellation must set `subscriptions.status = 'cancelled'` (UK spelling per DB enum). Check that cancellation does NOT immediately delete data — retention logic per F35 must be respected.
7. **Email template correctness via Resend** — Changed email templates render without missing variables. Every `resend.emails.send()` call includes `from: 'notify@notify.beamixai.com'`, a `to:` that comes from a verified user record (not user input), and a subject line. No unescaped user-controlled content in HTML email templates.
8. **Database transaction atomicity** — Multi-table writes (e.g., creating a `scans` row AND `scan_engine_results` rows together) are wrapped in a Supabase RPC function or use `BEGIN/COMMIT` pattern. No partial writes visible to the user on failure.
9. **N+1 query detection** — Any server component or API route that fetches a list and then fetches per-item detail in a loop is a P1. Grep for `forEach` / `map` inside an `async` function that also calls `supabase.from(`.
10. **Rate limiting on public endpoints** — `/api/scan/start` and any other unauthenticated POST endpoint must have rate limiting. Verify Upstash Redis or equivalent rate-limiter is called before the business logic. Unauthenticated endpoints with no rate limiting on an XS or S change are P1.
11. **Agent-run caps enforcement** — Any ticket touching `agent_jobs` creation must check the refund-window cap (F54): `SELECT COUNT(*) FROM agent_jobs WHERE user_id = ? AND created_at > (NOW() - INTERVAL '14 days')` before inserting. Cap limits: Discover 5, Build 10, Scale unlimited.
12. **Environment variable handling** — No secrets in code. All sensitive values read from `process.env`. New env vars documented in `.env.example`. Grep for hardcoded API keys, webhook secrets, or database URLs in changed files.

**Output format:** Same structure as Design QA — findings table with ID prefix `BQ-`, severity, file, line, finding, rule violated, fix.

**Severity definitions:**

- **🔴 P1 (blocks merge):** Missing Zod validation on any POST/PUT route. Missing RLS policy on any table with user-owned data. Unsigned webhook handler processing Paddle events. N+1 query on any list-fetch endpoint. Hardcoded secret in source code. Missing rate limiting on a public POST endpoint.
- **🟡 P2 (fix this wave):** Inngest function lacks `onFailure` handler (fire-and-forget failure). Database write is not atomic where it should be (multi-step but not strictly required to be atomic by business logic). Email template renders correctly but `from` address is not the canonical `notify@notify.beamixai.com`. Paddle state transition handles `cancelled` but not `past_due`.
- **🟢 P3 (next-wave backlog):** Logging could be more structured (currently plain `console.error`). Inngest function retry configuration uses defaults (could be tightened). Missing index on a table column that will be queried frequently post-launch but is not on the critical path now.
- **✅ Noted (no action):** Known deferred security hardening with explicit DECISIONS.md entry. Deliberate eventual-consistency pattern with comment explaining the tradeoff.

---

### 2.3 Code Quality QA Agent ("Thinking QA")

**Identity.** Code Quality QA is a principal engineer who has seen every anti-pattern at scale and is paid to catch architectural mistakes before they become load-bearing. She reviews naming, abstraction levels, TypeScript strictness, test coverage on critical paths, state management hygiene, and ESLint custom rule compliance. She is not a critic for the sake of criticism — her standard is: "Will a second engineer understand this in 6 months without asking?" She does not review visual output or security posture; those are other agents' domains.

**Subagent type:** `code-reviewer` (existing role — applies architectural quality posture)

**Model:** `claude-opus-4-6` (architectural reasoning; recognizes premature abstraction and naming intent failures that pattern-matching cannot catch)

**Required reading (load before review):**
- `docs/ENGINEERING_PRINCIPLES.md` (if present — architecture conventions)
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` — ticket ACs for the wave (verify implementation matches spec)
- Wave-completion summary from Build Lead

**Tool access:** Read, Grep, Bash (for `pnpm typecheck`, `pnpm lint`, `pnpm test`)

**Checklist — evaluated per wave:**

1. **TypeScript strict mode — no `any`** — Grep for `: any`, `as any`, `// @ts-ignore`, `// @ts-nocheck` in changed files. Every instance is a P1 unless it is in a test helper file with a clear comment explaining why `any` is unavoidable.
2. **ESLint custom rules pass** — Run `pnpm lint` on changed files. Beamix-specific rules: `@beamix/no-shared-easing` (no `transition-all`), `@beamix/no-banned-status-synonyms` (no `complete`, `done`, `finished` as DB status values — use canonical enum values), `@beamix/server-only-pdf` (PDF generation code must not appear in client-side components). All lint errors are P1.
3. **Naming clarity** — Function names describe what they do (`generateSampleInboxItems`, not `gen` or `makeItems`). Variable names are not single letters outside of `i/j` loop indices. Component names match their file names. Props interface names follow `ComponentNameProps` pattern. Flag any names that require context to interpret.
4. **Abstraction level** — No premature generalization. A function that is only called once and handles only one use case should not be abstracted into a generic utility. Conversely, logic duplicated across 3+ files should be extracted. Flag both directions.
5. **Test coverage on critical paths** — Auth flow, billing state transitions, agent-job creation, and `/start` phase state machine must have unit or integration tests. New critical-path code without tests is P2 (not P1 because test-writing may be a subsequent wave's task) unless the ticket's ACs explicitly required tests and they were omitted (then P1).
6. **Zustand store hygiene** — Store files in `apps/web/src/store/` must: export a typed store hook, not expose raw `set` to consumers, have a `reset()` action for test teardown. No store state that is derivable from other store state (derive with selectors, not redundant state fields).
7. **No dead code** — No functions defined but never called. No imports that are unused (TypeScript will catch most, but check for `import type` that is only used as a comment reference). No commented-out code blocks without an explicit `// TODO: [ticket]` reference.
8. **No TODO comments without ticket reference** — `// TODO: fix later` is P2. `// TODO: T115 — Day-7 email timing` is acceptable. Grep for `TODO`, `FIXME`, `HACK`, `XXX` without a Ticket ID following.
9. **File structure adherence** — New files placed in the correct directory per PRD architecture: API routes in `apps/web/src/app/api/`, server utilities in `apps/web/src/lib/`, Zustand stores in `apps/web/src/store/`, reusable UI components in `apps/web/src/components/`, page components in `apps/web/src/app/[route]/`. Files in the wrong location are P2.
10. **Component composition sanity** — No prop drilling deeper than 3 levels (use context or store). No component files longer than 300 lines (split into sub-components). No logic mixed into render functions that belongs in a hook or utility.
11. **Server vs client boundary** — Next.js server components must not import client-only code (React hooks, browser APIs). Client components must be explicitly marked `'use client'`. Verify no server-side secret leaks into client-side rendered output.
12. **Import hygiene** — No circular imports. No importing from `apps/web/src/app/` into `apps/web/src/lib/` (lib must not depend on app-layer code). Verify with `pnpm typecheck` — circular imports surface as type errors in strict mode.

**Output format:** Same structure — findings table with ID prefix `CQ-`, severity, file, line, finding, rule, fix.

**Severity definitions:**

- **🔴 P1 (blocks merge):** `: any` or `@ts-ignore` in production code paths. ESLint custom rule violation (`no-shared-easing`, `server-only-pdf`). Circular import. Server component importing a React hook. Missing required ticket ACs that the worker reported as COMPLETE but are verifiably absent.
- **🟡 P2 (fix this wave):** TODO without ticket reference. File in wrong directory. Component over 300 lines without clear justification. Missing test on a critical-path function that the ticket AC specified. Prop drilling past 3 levels.
- **🟢 P3 (next-wave backlog):** Naming inconsistency that is clear but suboptimal. Abstraction opportunity identified but not urgent. Test coverage on non-critical path.
- **✅ Noted (no action):** Well-commented intentional deviation. Acknowledged tech debt with DECISIONS.md entry. Temporarily verbose code with a clear refactor ticket in backlog.

---

### 2.4 Frontend QA Agent

**Identity.** Frontend QA is a senior front-end engineer who thinks in breakpoints, hydration boundaries, bundle budgets, and accessibility trees. He reviews component rendering fidelity across viewports, hydration correctness, Core Web Vitals impact, keyboard navigation, screen reader compatibility, and loading/empty/error state completeness. He does not review design tokens (Design QA owns that) or backend security (Backend QA owns that). He is the last line before a real user encounters the product.

**Subagent type:** `test-engineer` (existing role — applies browser + accessibility testing posture using Playwright MCP)

**Model:** `claude-sonnet-4-6` (systematic browser testing; pattern-matching against known hydration and A11y failure modes)

**Required reading (load before review):**
- `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` §1.3 (spacing, max-widths), §1.4 (shadows)
- `docs/08-agents_work/2026-05-04-BUILD-PLAN-v3.1.md` T63 (Playwright + Lighthouse perf CI gate ACs — perf thresholds)
- Wave-completion summary from Build Lead

**Tool access:** Read, Grep, Bash, Playwright MCP (`mcp__playwright__*`)

**Playwright MCP obligation:** For any wave that touches user-facing components, use `mcp__playwright__browser_snapshot` and `mcp__playwright__browser_take_screenshot` at 375px and 1440px before filing findings.

**Checklist — evaluated per wave:**

1. **Breakpoint rendering** — Playwright snapshots at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop) for every changed page or route. Flag any overflow, clipped text, broken grid layout, or missing mobile-specific treatment.
2. **Hydration mismatches** — Run `pnpm build && pnpm start` in the worktree and check browser console for `Hydration failed` warnings. Any hydration error is P1 — it means the server render differs from the client render, which causes layout flash and potential data loss.
3. **Bundle size delta** — Run `pnpm build --analyze` (T63 CI gate). Thresholds per T63: initial JS bundle < 180KB gzipped; LCP ≤ 2.5s at simulated 4G; CLS < 0.05. Any new wave that pushes beyond these thresholds is P1 if the threshold was previously passing, P2 if the threshold was already failing (track separately).
4. **Accessibility tree** — Use `mcp__playwright__browser_snapshot` to capture the accessibility tree for any new interactive component. Verify: buttons have accessible names, form inputs have associated `<label>` elements, images have `alt` text, headings follow a logical hierarchy (no skipping h1→h3).
5. **Keyboard navigation** — Use `mcp__playwright__browser_press_key` to tab through all interactive elements on changed pages. Every button, link, and form field must be reachable and activatable via keyboard alone. No keyboard traps. Focus order must follow visual order.
6. **Loading, empty, error state completeness** — Every component that fetches async data must render: a loading skeleton (not a blank div), an empty state with explanatory copy, and an error state with a retry action. Missing any of the three is P2. Missing all three is P1.
7. **Screen reader announcements** — Dynamic content changes (new inbox items, phase transitions, toast messages) must use `aria-live` regions or `role="status"` where appropriate. Verify with `mcp__playwright__browser_snapshot` accessibility tree — look for live regions on notification surfaces.
8. **Motion performance budget** — Phase cross-fades and Rough.js animations must complete within a 60fps frame budget on a simulated mid-range Android (use Playwright with CPU throttle 4x). Janky animations (dropped frames visible in Chrome DevTools trace) are P2. Any animation that causes CLS is P1.
9. **Cream-paper RTL correctness** — If the wave touches any surface used in `[lang="he"]` mode, verify `dir="rtl"` renders without broken alignment. Brief body in RTL must left-align (visually right-align for Hebrew readers) without text overflow. Heebo loaded correctly via `mcp__playwright__browser_snapshot` — check `document.fonts.check('300 italic 16px Heebo')` via `browser_evaluate`.
10. **Heebo conditional load** — If T93 is in scope or any Hebrew-language surface is touched, verify via `mcp__playwright__browser_evaluate` that Heebo is NOT in the main bundle (check `performance.getEntriesByType('resource')`  for Heebo font on an English-language page — it should not be present).
11. **`next/image` usage for all images** — All `<img>` tags must be replaced with `next/image` (`<Image>` from `'next/image'`). Raw `<img>` tags are P2 (performance, not security).
12. **Form error handling** — Form submissions that fail must display inline error messages adjacent to the relevant field, not just a toast. Zod parse errors from the server must be mapped to field-level errors in the UI. Forms that swallow errors silently are P1.

**Output format:** Same structure — findings table with ID prefix `FQ-`, severity, file, line, finding, rule, fix.

**Severity definitions:**

- **🔴 P1 (blocks merge):** Hydration mismatch. Bundle size exceeds T63 threshold (where threshold was previously passing). Missing ALL three states (loading + empty + error) on an async data component. Keyboard trap (user cannot navigate past an interactive element). Form error swallowed silently. CLS-causing animation.
- **🟡 P2 (fix this wave):** Missing one of loading/empty/error states (but not all three). Breakpoint rendering issue causing text clipping at 375px. Raw `<img>` tag. Missing `aria-live` on a notification surface. Heebo loaded on non-Hebrew page (bundle pollution).
- **🟢 P3 (next-wave backlog):** Accessibility improvement that is above minimum requirement (e.g., better landmark regions). Minor CLS that is below threshold but visible. Image without `alt` on a decorative (non-informative) element.
- **✅ Noted (no action):** Known third-party widget with inaccessible internals — documented, no fix available. Intentional loading state divergence with explicit comment.

---

## §3 — The QA Hand-off Protocol

### Step 1 — Build Lead wave-completion summary

Before dispatching QA, Build Lead writes the following structured summary. This is the ONLY input QA agents read from the Build Lead — they do not re-read individual worker returns.

```yaml
wave_id: "Tier-0-Wave-1"
date: "2026-05-06"
tickets_dispatched: [T58, T59, T60, T93, T94]
tickets_complete: [T58, T59, T60, T93, T94]
tickets_blocked: []
branches:
  - feat/T58
  - feat/T59
  - feat/T60
  - feat/T93
  - feat/T94
files_changed_aggregate:
  - apps/web/src/styles/tokens.css
  - apps/web/src/styles/motion.css
  - apps/web/next.config.js
  - apps/web/src/app/layout.tsx
  - apps/web/src/styles/typography.css
known_worker_reported_issues: "T93 worker flagged: Heebo conditional load not yet testable until Playwright smoke added (T137)"
qa_scope_note: "Token + font additions only. No page-level rendering changes. Frontend QA scope is limited to bundle audit + typecheck."
```

### Step 2 — Parallel QA dispatch

Build Lead dispatches all 4 QA agents simultaneously. Each receives:
- The wave-completion summary (YAML above)
- Their specific Required Reading list (§2.x)
- The findings doc template (§3 below)
- Access to the worktree branches (read-only)

QA agents do not coordinate with each other. They are parallel and independent. Design QA does not wait for Backend QA. Each returns a findings doc.

### Step 3 — QA agent time budget

| Agent | Target wall-clock |
|-------|-------------------|
| Design QA | ≤ 10 min |
| Backend QA | ≤ 10 min |
| Code Quality QA | ≤ 10 min |
| Frontend QA | ≤ 10 min |
| **Total parallel** | **≤ 10 min** (all 4 run simultaneously) |

QA prompts are tight by design. Agents do not explore beyond changed files. If an agent exceeds its budget, it files a P3 on scope (not a gate) and returns.

### Step 4 — CEO synthesis

CEO reads all 4 findings docs and applies the gate rules:

| Finding type | Gate action |
|-------------|-------------|
| Any 🔴 P1 | Block merge. Return to Build Lead with P1 list. |
| Any 🟡 P2 | Fix in this wave before merge. Build Lead assigns to original worker or a repair worker. |
| Any 🟢 P3 | Add to next wave's backlog. Do not block. |
| Any ✅ Noted | Log, no action. |

### Step 5 — Worker repair cycle

For each 🔴 P1 and 🟡 P2 finding:
1. Build Lead assigns the fix to the original worker (same worktree branch).
2. Worker fixes and commits to the same branch.
3. Build Lead writes a repair-wave summary (abbreviated — only the changed files).
4. Only the QA agent(s) whose findings included the P1/P2 re-run (not all 4). Scope: changed files only.

### Step 6 — Merge gate

Once all 🔴 findings are resolved:
- Build Lead confirms all branches pass `pnpm typecheck` and `pnpm lint`
- Build Lead merges wave branches to `main` in dependency order (no intra-wave conflicts because parallel workers used separate branches)
- Next wave dispatched

### Findings doc format (canonical template)

```markdown
## [Design|Backend|Code Quality|Frontend] QA — [Wave ID] — [Date]

**Agent:** [agent type]
**Scope:** [ticket IDs reviewed]
**Files inspected:** [list]

### Summary
[1-2 sentences: overall assessment. E.g., "3 P1 findings blocking merge. 2 P2s require same-wave fix. Wave otherwise structurally sound."]

### Findings

| ID | Severity | File | Line(s) | Finding | Rule ref | Recommended fix |
|----|----------|------|---------|---------|----------|-----------------|
| [prefix]-001 | 🔴 P1 | file.tsx | 47 | [precise description] | [doc + section] | [specific fix] |
| [prefix]-002 | 🟡 P2 | ... | ... | ... | ... | ... |
| [prefix]-003 | 🟢 P3 | ... | ... | ... | ... | ... |
| [prefix]-004 | ✅ | ... | ... | ... | ... | [none required] |

### Gate verdict
🔴 **BLOCK** — [N] P1 findings. Must resolve before merge.
OR
✅ **PASS** — No P1 findings. [N] P2s assigned for same-wave repair.
```

---

## §4 — Severity Tier Rules with Examples

### Design QA

**🔴 P1 — blocks merge:**
- `BeamixAI` in any customer-visible string in an email template, OG card, or public-facing component — voice canon violation per Design System voice canon §.
- `--color-paper-cream` applied as background on `/workspace` route (product chrome surface) — cream-paper partition violation per Design System §1.1.
- Cartogram cell color `#FFCCBB` hardcoded in `CartogramCell.tsx` — no token reference — token compliance violation.
- `transition-all duration-200` on the Seal ceremony component — banned by `@beamix/no-shared-easing` lint rule; breaks predictable motion canon.
- Fraunces font applied to `/home` topbar navigation text — typography domain violation (Fraunces is artifact-register only).

**🟡 P2 — fix this wave:**
- Gap between Brief clauses is `margin-bottom: 16px` where Design System §1.3 specifies 24px for component-to-component spacing.
- Phase 6 Seal stamping animation uses `--duration-phase-transition: 140ms` instead of `--duration-seal-ceremony: 540ms` — timing token mismatch per T94.
- Mobile (375px) score display clips the Ring SVG — Ring partially off-screen at the breakpoint.
- `--color-score-excellent` used as text color (not the `-text` variant) on cream background — WCAG AA contrast failure.

**🟢 P3 — next-wave backlog:**
- `text-h3` heading in /scans page could benefit from `cv11` font feature setting for warmer optical rendering — minor refinement, not a spec violation.
- Topbar logo renders at 22px; could be 24px for better optical weight — within acceptable range, minor.

---

### Backend QA

**🔴 P1 — blocks merge:**
- `POST /api/scan/start` parses `const { url } = await request.json()` without Zod schema — unvalidated user input used directly — Zod validation rule violation.
- `brief_versions` table has no RLS policy — any authenticated user can `SELECT * FROM brief_versions` — RLS policy rule violation.
- Paddle webhook handler in `/api/webhooks/paddle/route.ts` calls `payload.event_type` before calling `paddle.webhooks.unmarshal()` — unsigned payload processing — webhook signature rule violation.
- `GET /api/home` fetches `businesses` rows then runs a per-business loop fetching `scans` — N+1 query on every dashboard load.
- `/api/recommendations` endpoint has no rate limiting and is unauthenticated — rate limiting rule violation.

**🟡 P2 — fix this wave:**
- `inngest.createFunction` for `scan-weekly` has no `onFailure` handler — failed weekly scans leave `scans.status = 'running'` indefinitely.
- `subscriptions` update on Paddle `subscription.cancelled` event does not set `cancelled_at` timestamp — retention logic incomplete per F35.
- Monthly Digest email template sends from `no-reply@beamixai.com` instead of `notify@notify.beamixai.com` — canonical from-address violation.
- Agent-run cap check uses `created_at > NOW() - INTERVAL '30 days'` instead of 14 days — F54 cap window spec mismatch.

**🟢 P3 — next-wave backlog:**
- `console.error` in the Inngest scan function — should use structured logger for log aggregation (T136 scope).
- `scan_engine_results` table missing index on `(scan_id, engine)` — will matter at volume but not blocking now.

---

### Code Quality QA

**🔴 P1 — blocks merge:**
- `const data = response.json() as any` in `apps/web/src/lib/engines/perplexity.ts` — `as any` cast in production code path — TypeScript strict violation.
- `@ts-ignore` above a Supabase query in `apps/web/src/lib/sample-data/generate-sample-inbox.ts` — TypeScript suppression in production code — strict mode violation.
- ESLint `@beamix/server-only-pdf` rule fires: PDF generation call inside a `'use client'` component — server-only code in client boundary violation.
- Worker returned COMPLETE on T100 but `apps/web/src/store/start-flow.ts` does not export a `reset()` action — ticket AC explicitly required `reset()` — AC miss flagged as P1.
- Circular import detected: `apps/web/src/lib/account-state.ts` imports from `apps/web/src/store/start-flow.ts` which imports from `apps/web/src/lib/account-state.ts`.

**🟡 P2 — fix this wave:**
- `// TODO: fix the edge case` in `BriefCoAuthor.tsx` line 143 — no ticket reference — TODO without ticket rule violation.
- `generateSampleInboxItems` function duplicated verbatim in `apps/web/src/lib/sample-data/generate-sample-inbox.ts` and `apps/web/src/app/api/sample/route.ts` — abstraction should be in lib, not duplicated.
- `StartFlowPhase.tsx` is 387 lines — over the 300-line component limit. Split into `PhaseShell.tsx` + `PhaseContent.tsx`.
- `apps/web/src/app/home/page.tsx` updated but the new `FreeAccountBanner` component lives at `apps/web/src/app/home/FreeAccountBanner.tsx` — should be at `apps/web/src/components/FreeAccountBanner.tsx` (reusable component in wrong directory).

**🟢 P3 — next-wave backlog:**
- `useStartFlow` hook could extract the URL-sync logic into a `useSyncPhaseToUrl` sub-hook for clarity — not urgent.
- Variable name `d` used in a date-formatting utility — acceptable for date abbreviation but `date` would be clearer.

---

### Frontend QA

**🔴 P1 — blocks merge:**
- Browser console shows `Warning: Hydration failed because the initial UI does not match what was rendered on the server` on `/start` page — phase store initializes differently on server vs client.
- Initial JS bundle is 214KB gzipped after T103 (results component) merge — exceeds T63 threshold of 180KB. Largest contributor: Rough.js loaded eagerly instead of dynamically.
- `<Select>` component in Phase 4 vertical-confirm has no keyboard `Enter` activation — user cannot confirm vertical without mouse — keyboard navigation failure.
- Free Account banner has no loading state — on first render, page flashes from no-banner to banner state (CLS visible at 375px) — CLS-causing render pattern.
- Contact form in `/settings` submits without displaying field-level errors — server Zod errors not mapped to field level — form error swallowing.

**🟡 P2 — fix this wave:**
- Phase 2 results component (cartogram) has no empty state for zero engine results — blank white area with no explanation shown when scan returns 0 matches.
- At 375px, Brief co-author text in Phase 5 clips the right margin by 8px — spacing bug at mobile breakpoint.
- OG share card in `T111` uses raw `<img>` tag for the Beamix logo — should use `next/image`.
- `aria-live="polite"` missing on the `/inbox` new-item notification area — screen readers do not announce new items.

**🟢 P3 — next-wave backlog:**
- Heebo font check via `document.fonts.check()` in Phase 5 when `lang="he"` is set — enhancement, not required for accessibility.
- Score display on `/home` could benefit from `aria-label="AI visibility score: 72 out of 100"` for more descriptive screen reader announcement — currently reads as "72" only.

---

## §5 — When QA Finds Wave-Breaking Issues

A **wave-breaking issue** is a 🔴 P1 finding that implies the architectural approach of the wave is wrong — not just that a file has a bug, but that the design decision itself needs to be reconsidered.

**Examples of wave-breaking vs fixable P1s:**
- *Fixable P1:* Missing Zod validation on a route — add it, re-run Backend QA, done.
- *Wave-breaking P1:* The Zustand store for `/start` phase state is initialized on the server in a way that causes hydration mismatches on every phase transition — the store initialization strategy itself is wrong, not just one edge case.

**Protocol for wave-breaking findings:**

1. QA agent labels the finding `🔴 P1 — WAVE-BREAKING` in the findings table.
2. CEO reads the finding and decides within one turn:
   - **Rollback wave** — revert all branches in the wave; redesign the approach; re-dispatch as a new wave.
   - **Fix in next wave** — accept the current wave as-is with the known issue documented; the next wave's first ticket is the fix. Only valid if the issue does not risk data corruption or security exposure.
   - **Accept and document tradeoff** — accept the current approach with the known limitation; document in `DECISIONS.md` with the full tradeoff.
3. CEO's decision is recorded in `DECISIONS.md` within the same session.
4. If rollback is chosen: Build Lead marks all wave branches as `reverted/[wave-id]` and archives worker commits. No merge to main.

**What QA agents do NOT decide:** QA agents find and classify. They do not decide whether to rollback. That is CEO's domain. A QA agent that recommends "rollback" has overstepped; it should say "This finding implies the initialization strategy is structurally incorrect — CEO should evaluate rollback vs fix-forward."

---

## §6 — Zero-Friction QA Infrastructure

The process is only as fast as its slowest step. These rules keep QA from becoming the bottleneck.

### Pre-loaded QA agent prompts

Build Lead does not write QA agent prompts from scratch each wave. Each QA agent has a standing brief template stored in `.agent/prompts/qa-[type]-v1.md`:

```
.agent/prompts/
  qa-design-v1.md      — Design QA standing brief
  qa-backend-v1.md     — Backend QA standing brief
  qa-code-quality-v1.md — Code Quality QA standing brief
  qa-frontend-v1.md    — Frontend QA standing brief
```

Each template includes: agent identity paragraph, required reading list, checklist (verbatim from §2), output format (verbatim from §3), severity definitions (verbatim from §4). Build Lead fills in only: wave ID, wave-completion summary, files changed. Nothing else changes between waves.

### Machine-parseable findings docs

The findings table format in §3 is parseable by a simple script. CEO reads the `Gate verdict` line at the bottom of each doc — no need to parse the full table unless there are P1s to investigate.

### Severity is mechanical

Severity definitions in §4 are written as deterministic rules, not judgment calls. "Is this a P1?" has a yes/no answer for every rule in §2. QA agents do not negotiate severity. If a finding matches a P1 rule, it is P1. Build Lead can escalate to CEO if a P1 feels disproportionate — but the QA agent does not self-downgrade.

### Build Lead wave-completion summary is structured input

The YAML format in §3 Step 1 is the same every wave. No narrative, no summaries in prose, no ambiguity about which files changed. QA agents parse it in seconds and go directly to code inspection.

### Reusable QA patterns

Patterns that appear across multiple waves are extracted to `.agent/skills/beamix-qa-patterns-v1/SKILL.md`. Examples:
- "Verify Supabase RLS for new table pattern"
- "Check Inngest idempotency pattern"
- "Verify cream-paper partition on new route"
- "Run Playwright RTL snapshot on Hebrew-enabled component"

QA agents load this skills file instead of re-deriving the pattern each time.

### Repair-wave scoping

When workers fix P1/P2 findings, the re-run QA scope is ONLY the changed files — not the full wave. If Backend QA found 2 P1s in `route.ts` and `webhooks.ts`, the repair Backend QA runs only against those 2 files. This cuts repair QA time by 80%.

---

## §7 — Integration into Build Plan v3.1

Each row below is a defined QA gate. After each wave's QA pass, all 🔴 findings must be resolved before the next wave dispatches.

| Wave | Tickets | QA scope focus |
|------|---------|---------------|
| **Tier-0-Wave-1** | T58, T59, T60, T93, T94 | Design: token scaffold, typography file, motion canon. Backend: schema tables, RLS on new tables. Code: token CSS file structure. Frontend: no page-level changes, bundle audit only. |
| **Tier-0-Wave-2** | T61, T62, T63, T64, T65, T96 | Design: design system CSS audit, Storybook if present. Backend: env var setup, no RLS changes. Code: lint config, TypeScript config strictness. Frontend: T63 Playwright + Lighthouse CI gate — this is the performance baseline wave. |
| **Tier-0-Wave-3** | T95, T97, T98, T99, T135, T136, T137, T140 | Backend: Google OAuth callback, smoke test script, Sentry wiring. Code: script files in `scripts/` directory. Frontend: WCAG contrast tokens (T98), focus ring. Design: focus ring visual inspection. |
| **Tier-1-Wave-1** | T100 (alone — L effort) | All 4 QA agents at full depth. T100 is the `/start` route + Zustand state machine — the highest-risk ticket in the entire plan. Frontend: hydration mismatch check is the primary concern. Code: store initialization, TypeScript types for Phase union. Backend: no API routes in T100 but verify Zustand store does not leak server state. Design: no visual output but verify phase type union matches design system phase names. |
| **Tier-1-Wave-2** | T101, T102, T103, T104, T105 | Five phase components. Design QA: cream-paper partition (T103 results cartogram), token compliance, Fraunces usage (T104 signup overlay — not an artifact surface). Frontend: breakpoint rendering at 375px for every phase component, hydration check per component. Backend: no new routes but T104 triggers Supabase `signInWithOAuth` — verify OAuth callback correctness. Code: component file lengths, prop interface naming. |
| **Tier-1-Wave-3** | T106, T107, T108, T109, T110 | Design QA: Phase 6 Seal ceremony (T107) is highest-risk design item in the build — Rough.js arc, 540ms timing, cream-paper register. Motion tokens. Seal-as-mark-not-Ring rule. Frontend: reduced-motion guard on T107 and T110. Code: animation orchestration in T110 — no premature abstraction. Backend: T108 truth-file fields — Zod validation on vertical-conditional data. |
| **Tier-1-Wave-4** | T111, T132a, T134, T138, T146 | Design: "Claim this scan" CTA voice canon (T111). Cookie banner (T134) — no brand voice issues. Frontend: RTL audit (T138) — this is the wave where RTL receives dedicated Frontend QA focus. Backend: T146 Resend template audit — all 18 templates checked for `from` address, agent name leaks in email body. |
| **Tier-2-Wave-1** | T112, T113, T119 | Design: Free Account banner token usage (T112), cream-paper NOT on banner (use `--color-free-account-banner-bg`). Backend: sample inbox items RLS (T113), agent-run cap check (T119 pre-fill API). Frontend: Free Account banner loading state (P1 risk), empty state for sample inbox. Code: `generate-sample-inbox.ts` abstraction — lib not duplicated in route. |
| **Tier-2-Wave-2** | T114, T115, T116, T117, T118 | Backend QA depth wave: Paddle inline modal (T114) — signature verification, subscription creation state machine. Recovery emails (T115) — Resend from address, suppression logic. Agent-run caps (T116) — cap window 14 days not 30. Money-back tier split (T117) — Paddle product ID mapping correct. Design: Paddle modal on cream vs chrome — partition check. |
| **Tier-2-Wave-3** | T120, T121, T122, T123, T124 | Design: skip-cinema (T121) — voice canon, no new agent names. Guarantee surfacing (T123) — brand copy "14-day money-back". Code: dual-tab lock (T124) — Postgres advisory lock + Zustand optimistic lock — abstraction level review. Backend: T124 advisory lock — idempotency, lock release on crash. Frontend: T122 "Coming Soon" vertical reframe — mobile at 375px. |
| **Tier-2-Wave-4** | T125, T126, T127, T128, T139 | Code Quality focus wave: T125 Claude Haiku fast check — async boundary correct, no `any` in AI response parsing. Frontend: T127 mobile typography fix verification — Playwright 375px snapshot of Phase 5. T128 reduced-motion coverage — `useReducedMotion()` in every animated component. Backend: T126 Twilio cleanup cron — idempotency. |
| **Tier-3-Wave-1** | T66, T67, T68, T69, T70 | (v2 Tier 2 tickets now in Tier 3 context) Standard 4-agent pass. Backend: `/api/agents` routes — Zod + RLS. Frontend: /workspace rendering, /inbox loading states. Design: /inbox Linear-pattern — cream NOT on inbox chrome. Code: agent execution pipeline — no circular imports. |
| **Tier-3-Wave-2** | T71, T72, T73, T74, T75 | Primary product surfaces. Design: /home token compliance — score display at 96px, Ring geometry. Frontend: /home hydration (server-rendered score), /scans breakpoints. Backend: /home data fetching — N+1 query risk. Code: Zustand store usage in /home — no prop drilling. |
| **Tier-3-Wave-3** | T76, T77, T78, T79 | (v2 secondary surfaces) Standard pass. |
| **Tier-4-Wave-1** | T80–T92 (power-user features) | Full 4-agent pass. These are high-complexity tickets (Workflow Builder foundation data model, Cycle-Close Bell, Monthly Update PDF). Backend QA at depth: PDF generation server-only, Monthly Update RLS. Design: Monthly Update PDF uses cream register correctly. |
| **Tier-5-Wave-1** | T129–T133, T141–T147 | Post-MVP / MVP+30 features. Backend: T129 SOC 2 observation note — no new security surface but compliance tracking. Code: T130 agency batch onboarding — abstraction level for multi-client data. Frontend: T131 embeddable badge — cross-origin iframe concerns. |

**Total estimated QA waves: 16 waves.**

At 10 minutes per QA pass (4 agents parallel), total QA time across the full build: **~160 minutes (~2.7 hours)** of active QA agent compute. Wall-clock: ~160 minutes of Build Lead coordination time distributed across the build.

---

## §8 — Output Spec: QA Agent Prompt Templates (stub)

The four standing brief files referenced in §6 follow this structure. Build Lead copies and fills in wave-specific fields.

**File:** `.agent/prompts/qa-design-v1.md`

```markdown
# Design QA — Standing Brief v1

You are Design QA for Beamix. [Identity paragraph from §2.1]

## Wave context
Wave ID: [FILL]
Wave-completion summary: [FILL — paste YAML]
Files changed: [FILL]

## Required reading
[Load verbatim from §2.1 Required reading]

## Checklist
[Load verbatim from §2.1 Checklist — 12 items]

## Output format
[Load verbatim from §3 findings doc template]

## Severity definitions
[Load verbatim from §4 Design QA severity]

## Time budget
≤ 10 minutes. Do not expand scope beyond the files listed. File findings against what you find, not what you suspect might be wrong elsewhere.
```

Identical structure for `qa-backend-v1.md`, `qa-code-quality-v1.md`, `qa-frontend-v1.md` — substituting §2.2, §2.3, §2.4 content respectively.

---

## Appendix — Quick Reference

### Severity gate summary

| Severity | Symbol | Gate action | Who decides |
|----------|--------|-------------|-------------|
| P1 | 🔴 | Block merge | Automatic — no discretion |
| P2 | 🟡 | Fix this wave | Build Lead assigns |
| P3 | 🟢 | Next-wave backlog | Build Lead logs |
| Noted | ✅ | No action | QA agent documents |

### QA agent model assignments

| Agent | Model | Rationale |
|-------|-------|-----------|
| Design QA | Opus 4.6 | Visual judgment requires semantic reasoning about ambiguous design states |
| Backend QA | Sonnet 4.6 | Systematic rule-checking; pattern matching; Supabase MCP calls |
| Code Quality QA | Opus 4.6 | Architectural intent recognition; naming intent failures |
| Frontend QA | Sonnet 4.6 | Playwright automation; systematic breakpoint checking |

### Mandatory MCP usage per QA agent

| Agent | Mandatory MCP | Use |
|-------|---------------|-----|
| Backend QA | `mcp__supabase__execute_sql` | Verify RLS policies on affected tables — do not trust code comments |
| Frontend QA | `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_take_screenshot` | Breakpoint snapshots at 375px and 1440px on every wave touching user-facing components |

### File prefixes for findings IDs

| Agent | ID prefix |
|-------|-----------|
| Design QA | `DQ-` |
| Backend QA | `BQ-` |
| Code Quality QA | `CQ-` |
| Frontend QA | `FQ-` |

---

*End of QA Gate Process v1. Update version to v2 when: severity definitions require revision based on build learnings, new ESLint rules are added, or new MCP tools become available.*
