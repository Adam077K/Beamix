# Fix Plan — PRD v5 → v5.1 + Build Plan v3 → v3.1
**Date:** 2026-05-04 (evening)
**Status:** Mechanical patch list. Next session applies these fixes directly via Edit operations on the existing v5/v3 files (NOT full rewrites — both files too large for single-pass agent regeneration).

**Why this approach:** First fix attempt failed. PRD v5.1 agent stalled (reading + writing 200K is too large for one agent run). Build Plan v3.1 agent hit Claude's 32K output token cap. Better to apply targeted Edits than regenerate.

---

## How to apply this plan

For each fix below:
1. Open the target file
2. Find the section
3. Apply the specific change shown
4. Verify with Read

Each fix is independent. Apply in any order.

---

## PRD v5 critical patches

### Patch P1 — Phase numbering drift (Audit 3 critical, Audit 4)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** §4 (Architecture overview / Option E phases)

**Find:** any reference to "Phase 4 = paddle-inline" or "Phase 4: paddle-inline"

**Replace with:** the corrected phase list:
```
/start has 8 phases:
  Phase 0 — enter-url
  Phase 1 — scanning
  Phase 2 — results
  Phase 3 — signup-overlay
  Phase 4 — vertical-confirm  (was: paddle-inline; Q6 lock moved Paddle to /home)
  Phase 5 — brief-co-author
  Phase 6 — brief-signing
  Phase 7 — truth-file
  Phase 8 — complete

Phase 9 — paid-activation lives on /home (NOT in /start flow)
  Triggered when customer clicks "Activate agents" on /home Free Account state
  Paddle inline modal appears
  Trial clock starts at successful Paddle checkout
```

**Update data carry-over table:** `paddle_subscription_id` is created at Phase 9 on /home, NOT at Phase 4 in /start. Free Account state = signed up + Brief signed + no Paddle. Paid Customer state = Paddle complete.

---

### Patch P2 — F19 Workflow Builder ACs restoration (Audit 1 C-1)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F19 Workflow Builder

**Find:** "Spec unchanged from v4" or any pointer to v4 for F19

**Replace with:** Full v4 F19 acceptance criteria (read from `2026-04-28-PRD-wedge-launch-v4.md` F19 section). Specifically must include:
- React Flow DAG editor with 240×88 → 220×72px nodes (Round 1 Kare lock)
- Cream-paper canvas at 30% opacity over white (Round 1 cream-paper lock)
- Node anatomy: header strip color-coded by category + status token (Round 1 Tufte cuts)
- Brief grounding cell in Inspector: cream + Fraunces 300 italic (Round 1 lock)
- First-time-per-session Brief grounding cell: 400ms fade + one-time Trace; subsequent 120ms fade
- Connection handles always visible at low priority (1px ink-4 ring 6×6, brand-blue dot on hover)
- Dry-run mode: spotlight on active node + 1 dot per active edge (Vercel Round 2 spec)
- "Skip cinema" option for users with ≥1 prior signed Brief in account (audit O-19, Yossi MVP partial-relief)
- Custom narration column replaces walking figure (Round 1 lock)

Cross-link: `2026-04-28-DESIGN-workflow-builder-canvas-v1.md` for full pixel spec.

---

### Patch P3 — F27 Print-the-Brief timer fix (Audit 1 C-2)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F27 Print-the-Brief

**Find:** "8-second auto-dismiss timer" or any auto-dismiss timing in F27

**Replace with:**
- "No auto-dismiss timer (WCAG 2.2.1 compliance — fix from onboarding audit O-8)"
- "Manual dismiss only — persists until customer explicitly closes OR 24h after Brief signing"
- Cross-link to §11 WCAG fix list

---

### Patch P4 — brief_quarterly_reviews table (Audit 1 C-3)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** Tier 0 Schema Migrations / Design system canon

**Add:**
```sql
-- For F24 Brief Re-Reading (quarterly trigger)
CREATE TABLE brief_quarterly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id),
  brief_id uuid NOT NULL REFERENCES briefs(id),
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL CHECK (action IN ('looks_good', 'edited')),
  session_id uuid NOT NULL,
  CONSTRAINT brief_quarterly_reviews_customer_idx
    UNIQUE (customer_id, brief_id, reviewed_at)
);

-- RLS: customer can only see their own reviews
ALTER TABLE brief_quarterly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY brief_quarterly_reviews_owner_select ON brief_quarterly_reviews
  FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY brief_quarterly_reviews_owner_insert ON brief_quarterly_reviews
  FOR INSERT WITH CHECK (customer_id = auth.uid());
```

---

### Patch P5 — Systemic AC restoration for "unchanged" features (Audit 1 C-4)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`

For EACH feature listed below, find the "Spec unchanged from v4" pointer and replace with the FULL v4 acceptance criteria block from `2026-04-28-PRD-wedge-launch-v4.md`. v4 is deprecated; v5.1 must be standalone.

Affected features (audit-identified): F20, F21, F23 (non-amended part), F24, F25, F28, F29, F31, F33, F34, F36, F38, F39, F40, F44, F45, F46.

(That's 17 feature sections to repopulate. Each is a "find 'Spec unchanged from v4' → copy v4 ACs verbatim into v5" mechanical operation.)

---

### Patch P6 — Office address collection (audit I-7 + F26 dependency)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F2 v5 (Option E) Phase 4 vertical-confirm OR Phase 7 truth-file

**Add:** optional `customer_profiles.office_address` field collection during Phase 7 truth-file. Required for F26 (Print-Once-As-Gift, MVP+30). Cream paper register, Fraunces label "Mailing address (optional — for shipping a Beamix gift at month 6)."

Schema: add `office_address jsonb` column to `customer_profiles` (line1, line2, city, state, postal, country).

---

### Patch P7 — F30 API extension restoration (audit I-?)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F30 Brief Grounding

**Find:** F30 amendments

**Add:** v4 amendment about API responses including `authorized_by_brief_clause` field with Brief clause UUID + truncated text (≤120 chars). Cross-link to API roadmap.

---

### Patch P8 — F42 Israeli + Yossi DPA addenda restoration
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F42 Trust Center / DPA

**Find:** F42 amendment v5

**Add:**
- Israeli DPA supplement note (Hebrew-language compliance for Israeli Privacy Protection Law)
- Yossi-style multi-client agency DPA addendum for sub-vendor pass-through

---

### Patch P9 — F12 Marcus Day-14 trigger anchor (audit I-?, Q4/Q7 lock)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F12 Lead Attribution Loop

**Find:** Day-14 evangelism trigger timing

**Replace with:** "Day-14 from Paddle checkout (NOT signup, NOT Brief signed — per Q4/Q7 lock activation event redefinition)."

---

### Patch P10 — Pre-Brief abandonment recovery (Audit 4 §4)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** Add new feature F55 OR amend F53

**Add F55 — Pre-Brief Abandonment Recovery (MVP)**:
- Day 1 + Day 3 + Day 7 emails for users who signed up but didn't sign Brief within 24h
- Cream paper register, voice canon Model B, Fraunces 300 italic
- Subject lines + body copy similar to F53 but tailored to "you started but didn't finish"
- Stop sending if user signs Brief

(F53 covers post-Brief Free Account recovery; F55 covers pre-Brief signup-only recovery.)

---

### Patch P11 — F47 State of AI Search data instrumentation (Audit 4 §1)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** F47 + Tier 0

**Add:**
- `state_of_search_eligible` consent flag at Phase 7 truth-file (opt-in for participation in annual report)
- Tables: `engine_consistency_metrics`, `vertical_citation_patterns`, `cohort_visibility_decay` (or similar — derive from `2026-04-28-RESEARCH-state-of-ai-search-undefer.md`)
- Daily aggregation Inngest job from MVP launch day 1
- Data retention: at least 12 months for longitudinal charts
- Without these from Day 1, F47 ships with insufficient data depth at MVP+90

---

### Patch P12 — Cookie consent banner (Audit 4 §5)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** Add new feature F56

**Add F56 — Cookie Consent Banner (MVP)**:
- Bottom-anchored banner on first visit
- Three buttons: "Accept all" / "Essential only" / "Customize"
- Cookie categories: Essential (auth, session), Analytics (PostHog/Plausible), Lead Attribution (Twilio + UTM tracking)
- GDPR + Israeli Privacy Protection Law compliance (no pre-checked boxes; explicit consent)
- Settings page section to revoke/modify
- Cream paper register, Fraunces label, voice canon Model B

---

### Patch P13 — Persistent dashboard RTL (Audit 4 §2 Dani gap)
**Target file:** `2026-05-04-PRD-wedge-launch-v5.md`
**Section:** Tier 0 design system canon

**Add:**
- All product surfaces (/home, /inbox, /workspace, /scans, /competitors, /crew, /settings, /brief, /reports, /security, /trust/*) MUST support `dir="rtl"` for Hebrew users
- Tailwind RTL plugin enabled (`tailwindcss-rtl`)
- Layout patterns flip in RTL; cartogram + monograms tested per cartogram pixel spec
- Heebo loaded conditionally on `[lang="he"]` pages
- Geist Mono technical content (URLs, phone numbers) gets explicit `dir="ltr"` to prevent mirrored URLs

---

## Build Plan v3 critical patches

### Patch B1 — T119 promotion (Audit 2 critical)
**Target file:** `2026-05-04-BUILD-PLAN-v3.md`
**Section:** Find T119 (Pre-fill Three Claims via Claude Haiku)

**Change:** Tier 3 → Tier 1
**Add dependency note:** "BLOCKS T106 (Phase 5 BriefCoAuthor)"

---

### Patch B2 — T120 promotion (Audit 2 critical)
**Target file:** `2026-05-04-BUILD-PLAN-v3.md`
**Section:** Find T120 (Hours field vertical-conditional)

**Change:** Tier 3 → Tier 1
**Add dependency note:** "BLOCKS T108 (Phase 7 TruthFile)"

---

### Patch B3 — T132 split (Audit 2)
**Target file:** `2026-05-04-BUILD-PLAN-v3.md`
**Section:** Find T132 (Public Dogfooding Scan)

**Replace with two tickets:**
- **T132a — Public Dogfooding Scan: BUILD (Tier 1, MVP)** — Inngest cron for Beamix's own scan; data accumulates from Day 1; private during MVP. Effort: S.
- **T132b — Public Dogfooding Scan: PUBLISH (Tier 5, MVP+30)** — make /scan/beamixai.com publicly accessible + announce. Effort: S.

---

### Patch B4 — Effort estimate adjustments
**Target file:** `2026-05-04-BUILD-PLAN-v3.md`

- T100 (/start route + state machine): bump from M to L
- (No other estimate changes)

---

### Patch B5 — New tickets to add (Audit 4 gaps)

Add the following new tickets:

#### T134 — Cookie Consent Banner (Tier 1, MVP)
- Maps to F56 (added in PRD v5.1 Patch P12)
- Files: `apps/web/src/components/cookie-banner.tsx` + `apps/web/src/app/api/consent/route.ts` + Settings page section
- Effort: S (~2 days)
- Deps: none

#### T135 — Sentry / error monitoring (Tier 0)
- `@sentry/nextjs` integration, source maps, env vars
- Files: `apps/web/sentry.client.config.ts` + `apps/web/sentry.server.config.ts` + Vercel env vars
- Effort: XS (~1 day)
- Deps: none

#### T136 — Structured logging + log aggregation (Tier 0)
- `pino` + Better Stack (Logtail) integration
- Files: `apps/web/src/lib/log.ts` + middleware + API route logging
- Effort: XS (~1 day)
- Deps: none

#### T137 — Playwright + Lighthouse perf CI gate (Tier 0)
- (This is essentially T63 from v2 — verify existence; if missing, add)
- GitHub Actions workflow on every PR
- Failure thresholds per Vercel review (/start ≤120ms warm, /home ≤95KB, etc.)
- Files: `.github/workflows/perf-gate.yml`
- Effort: S (~2-3 days)
- Deps: T100 (need /start route to exist)

#### T138 — Tailwind RTL plugin + global RTL audit (Tier 1)
- Maps to PRD v5.1 Patch P13
- `tailwindcss-rtl` install + audit all 7 dashboard surfaces + cartogram + monograms
- Files: `apps/web/tailwind.config.ts` + per-component class-flips
- Effort: M (~3-5 days)
- Deps: T100 + T62 (block primitives need RTL-aware)

#### T139 — Multi-client cockpit MVP partial (Tier 2, MVP)
- For Scale-tier customers with ≥2 active domains
- /home shows compact-mode cockpit table (one row per client; columns: domain, score, status, last-action)
- Full agency mode (F48) at MVP+30 (T130) — this is the MVP partial-relief
- Files: `apps/web/src/components/multi-client-cockpit.tsx` + /home conditional layout
- Effort: M (~3-4 days)
- Deps: T100, T112 (Free Account /home)

#### T140 — State of AI Search data instrumentation (Tier 0)
- Maps to PRD v5.1 Patch P11
- `state_of_search_eligible` consent flag + 3 metrics tables + daily Inngest aggregation job
- Files: Supabase migrations + `apps/web/src/inngest/functions/aggregate-state-of-search.ts`
- Effort: M (~3 days)
- Deps: none (foundational)

#### T141 — Pre-Brief abandonment recovery email (Tier 2, MVP)
- Maps to PRD v5.1 F55 (Patch P10)
- Day 1 + Day 3 + Day 7 emails for signup-but-no-Brief users
- Files: 3 Resend templates + Inngest scheduled job
- Effort: S (~2 days)
- Deps: T115 (recovery email infrastructure)

#### T142 — Paddle webhook checkout.failed handling (Tier 2, MVP)
- F4 amendment edge case
- User-friendly message + retry option + manual invoice fallback for Scale
- Files: `apps/web/src/app/api/webhooks/paddle/route.ts` + retry UI
- Effort: S (~1-2 days)

#### T143 — Mid-trial tier upgrade rules (Tier 2, MVP)
- Customer pays Discover then upgrades to Build mid-trial
- Pro-rate + carry-forward existing trial days
- Files: Paddle subscription update logic
- Effort: S (~2 days)

#### T144 — Twilio provisioning failover (Tier 2, MVP)
- Regional shortage in IL/EU/US → fallback to next available region with note in UI + alert
- Files: `apps/web/src/lib/twilio/provision.ts`
- Effort: S (~2 days)

#### T145 — Customer domain offline retry handling (Tier 2, MVP)
- Inngest scan retries with exponential backoff (5min/30min/2h/12h/24h)
- Flag customer after final failure with banner on /home
- Files: `apps/web/src/inngest/functions/scan-retry.ts`
- Effort: S (~1-2 days)

#### T146 — Audit + complete 18 Resend templates (Tier 1, MVP)
- Verify all 18 exist (15 v4 + 3 new free-account-recovery from T115)
- Build any missing templates
- List: trial-end, welcome, brief-approval-confirmation, monthly-update-notification, marcus-day-14-evangelism, scan-complete, agent-shipped-action, weekly-digest, billing-receipt, password-reset, team-invite, twilio-provisioned, beamix-did-not-do-notification, abandoned-day-1/3/7, free-account-recovery-day-3/7/14, plus pre-brief-abandonment-day-1/3/7 (from T141)
- Files: `apps/web/emails/*.tsx`
- Effort: M (~5-7 days for any missing templates)

#### T147 — Refund-rate KPI dashboard (Tier 2, MVP)
- Track refund rate weekly per tier
- Alert if >20% on any tier (auto-Slack to Adam)
- Files: `apps/web/src/app/admin/refund-dashboard/page.tsx` + Slack webhook
- Effort: S (~2 days)

---

### Patch B6 — Banner copy unification note
**Target file:** `2026-05-04-BUILD-PLAN-v3.md`
**Section:** T112 + T114 acceptance criteria

**Add note:** "Free Account /home banner copy MUST be unified across docs. Single canonical string: 'Activate agents to start fixing this →' (cream paper background, ink-2 text, brand-blue arrow)."

---

## Validation gates (before merging v5.1 + v3.1)

After applying all patches:
1. Re-run feature parity audit (v4 → v5.1) — verify no "Spec unchanged from v4" pointers remain
2. Re-run cross-doc consistency audit — verify Phase numbering aligned across all docs
3. Re-run build plan integrity audit — verify T119, T120 in Tier 1; T132 split applied; new tickets present
4. Spot-check: open `2026-05-04-PRD-wedge-launch-v5.1.md` and search for "beamix.tech" — should be zero matches
5. Spot-check: open Build Plan v3.1 and verify all dependency notes updated for tier promotions

---

## Blockers — Adam-only items (still pending)

These are NOT in the PRD/Build Plan patch list — they're external decisions/setups Adam owns:

1. **Google OAuth credentials** — same path as GitHub OAuth he set up earlier; needed for T95 to test E2E
2. **Paddle sandbox keys** — Paddle account + product creation; needed for T114 test
3. **DPA indemnification cap** — lawyer call needed
4. **Tech E&O insurance** — broker call needed
5. **Status page vendor pick** — Better Stack default ($24/mo) or alternative
6. **5 pre-build validations from architectural synthesis:**
   - 5-customer guerrilla test of A vs E mocks
   - Paddle Inline browser-compat test
   - Yossi multi-domain Option E path map
   - Phase 1→2 motion spec pixel design
   - Claim-this-scan public permalink test

---

## Recommended next-session execution

1. **Read this fix-plan first.**
2. **Apply PRD patches P1-P13** via direct Edit operations on `2026-05-04-PRD-wedge-launch-v5.md` → save as `2026-05-04-PRD-wedge-launch-v5.1.md`. Use one focused product-lead agent if needed; instruct it to apply ONLY these patches via Edit, not regenerate the file.
3. **Apply Build Plan patches B1-B6** via direct Edit operations on `2026-05-04-BUILD-PLAN-v3.md` → save as `2026-05-04-BUILD-PLAN-v3.1.md`. Use one focused build-lead agent if needed.
4. **Run validation gates** (re-audit if budget allows).
5. **Commit + PR + merge** v5.1 + v3.1 as a patch PR.
6. **Tier 0 build can begin** in parallel (T58-T65, T93-T99, T135-T137, T140 are all independent).

---

*End of fix-plan. Source: 4 verification audit docs at `2026-05-04-VERIFICATION-*.md`.*
