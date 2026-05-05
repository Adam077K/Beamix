# Beamix — PRD v5.2 + Build Plan v3.2 Amendments

**Date:** 2026-05-05
**Status:** CANONICAL — amends PRD v5.1 (`2026-05-04-PRD-wedge-launch-v5.1.md`) and Build Plan v3.1 (`2026-05-04-BUILD-PLAN-v3.1.md`). All prior PRD + Build Plan content remains valid except where explicitly overridden below.
**Lock authority:** Adam, 2026-05-05 red-team session. See `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md`.
**Predecessors:** PR #58 (PRD v5 + Build Plan v3) → PR #59 (verification audits) → PR #60 (PRD v5.1 + Build Plan v3.1 patches) → PR #61 (final feature AC restoration) → PR #62 (infra state lock 2026-05-05) → **this document (v5.2 amendments)**
**Domain:** beamixai.com. Customer-facing brand name remains **Beamix** — never write "BeamixAI."

> **Scope of this document:** This is an amendment layer. It does not re-publish PRD v5.1 in full. Readers must have PRD v5.1 open alongside this document. Where a section below says "amendment," the v5.1 text is superseded for that feature. Where v5.1 is silent, it remains authoritative.

---

## §1 — Frontmatter Cross-Reference

### Locked decisions applied in this document

| Red-team ID | Decision | Applied in |
|-------------|----------|-----------|
| R1 | SaaS-only at MVP | §2 (F16, F2 Phase 4, F1) |
| R3 | Workflow Builder Build-tier promotion | §3 (F19, F11, pricing table) |
| R4 | 4-agent QA gate after every build wave | §4 + cross-link to `2026-05-05-QA-GATE-PROCESS-v1.md` |
| R5 | Inngest tier: re-confirm ~5 customers | §4 (no code changes; memory file updated) |
| R6 | Israeli PPL compliance | §5 (Adam-only items) |
| R7 | Public scan permalink design | §2 (F1) + cross-link to `2026-05-05-DESIGN-public-scan-permalink-v1.md` |
| Hard reset | Clean-slate codebase + maintenance page | Cross-link to `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` |

### Ticket additions

Four new tickets added to Build Plan v3.2 (detailed in §6):

| Ticket | Title | Tier |
|--------|-------|------|
| T148 | Non-SaaS vertical waitlist email infra | Tier 1 |
| T149 | Public scan permalink visitor view | Tier 1 |
| T150 | Maintenance page (Cloudflare Worker) | Tier 0 |
| T151 | 4-agent QA gate process tooling | Tier 0 |

---

## §2 — Amendment R1: SaaS-Only at MVP

**Locked:** Adam, 2026-05-05. Source: red-team finding R1 — two verticals multiplies QA, onboarding copy, and Brief template complexity by approximately 40% for zero first-customer benefit. Marcus (B2B SaaS founder) is the wedge persona. Dani (e-commerce) is the MVP+30 expansion target.

---

### F16 Amendment — 1 Vertical KG at MVP

**v5.1 F16 text (retired for MVP):**
> "2 vertical knowledge graphs (SaaS + e-commerce)"

**v5.2 F16 (supersedes v5.1):**
> "1 vertical knowledge graph (SaaS) at MVP. The e-commerce vertical KG ships at MVP+30, alongside Yossi Agency Mode (F48)."

**Updated acceptance criteria (replaces v5.1 F16 AC in full):**

- [ ] Domain detection classifies signups as SaaS with ≥80% accuracy. Non-SaaS domains are classified as `"unrecognized"` — NOT as e-commerce, local, or any other vertical
- [ ] Competitor set pre-populated with 5 domain-specific SaaS competitors from the SaaS vertical KG on first scan
- [ ] Brief template uses SaaS-appropriate language (B2B growth, developer discovery, feature authority)
- [ ] FAQ Agent generates SaaS-specific questions (integrations, security, pricing comparisons, use cases for developer tools)
- [ ] Schema Doctor emits SaaS-appropriate schema types: `SoftwareApplication`, `FAQPage`, `HowTo`, `Organization`
- [ ] No e-commerce schema types (`Product`, `Offer`, `AggregateRating`) emitted at MVP — deferred to MVP+30 vertical KG expansion
- [ ] Non-SaaS domain detection triggers the vertical waitlist path (see F2 amendment and F1 amendment below)
- [ ] E-commerce vertical KG ticket moved to MVP+30 scope in Build Plan v3.2

**Priority: MVP (SaaS only). E-commerce vertical KG: MVP+30.**

---

### F2 Amendment — Phase 4 Vertical-Confirm (SaaS-only at MVP)

**v5.1 Phase 4 text (retired for MVP):**
> "Confidence indicator picks SaaS or E-commerce or 'Coming Soon' badges for other verticals."

**v5.2 Phase 4 (supersedes v5.1 for this phase):**

Phase 4 `vertical-confirm` at MVP presents one primary path only: SaaS.

- If the domain detection confidence for SaaS is ≥80%: confidence indicator displays "92% sure you're B2B SaaS." with a confirm/edit control. Flow continues to Phase 5 as before.
- If the domain detection confidence for SaaS is <80% (i.e., domain looks like e-commerce, local business, or unrecognized): confidence indicator displays the most likely detected vertical label, followed immediately by: "We're starting with SaaS businesses. [Vertical] support is coming soon — drop your email and we'll tell you when we launch."
  - Email signup form renders inline (single field, Resend submission via T148)
  - On submit: thank-you confirmation text replaces form. No onward flow to Phase 5.
  - Customer exits the `/start` flow and enters the non-SaaS waitlist nurture sequence
  - `business_id` is NOT created for non-SaaS exits (no account in limbo)

**Rationale:** Prevents trust splinters identified in onboarding audit O-15 — a customer who enters a flow and hits a "vertical not supported yet" wall at Phase 7 (Truth File) loses confidence. Better to exit gracefully at Phase 4 with a clear waitlist promise than to proceed partially and fail late.

**Updated acceptance criteria for Phase 4:**

- [ ] SaaS-classified domains (≥80% confidence): existing Phase 4 flow unchanged — one-click confirm or change, `business_id` created on confirmation
- [ ] Non-SaaS domains: show detected vertical label + "coming soon" message + inline email form
- [ ] Non-SaaS email form submits to Resend Audience "Non-SaaS Waitlist" (created by T148)
- [ ] Thank-you confirmation text: "You're on the list. We'll let you know when [vertical] support launches."
- [ ] No `business_id`, no `brief_id`, no `truth_file_id` created for non-SaaS exits
- [ ] Non-SaaS exits are tracked in analytics with `vertical_exit` event (vertical label, domain, email submitted Y/N)

**Priority: MVP.**

---

### F1 Amendment — Free Scan Non-SaaS CTA

**v5.1 F1** is unchanged in its core behavior (public `/scan`, anonymous, shareable, 11-engine results, AI Visibility Cartogram on `/scans/[scan_id]` after claim). One CTA amendment applies:

**Post-scan CTA behavior at MVP:**

- If the scanned domain is classified as SaaS (≥80% confidence): existing CTA applies — "Fix this — start free" → routes to `/start`.
- If the scanned domain is classified as non-SaaS: the primary CTA changes to:

  > "We're starting with SaaS businesses at launch. Drop your email — we'll let you know when [your vertical] support opens."

  An inline email capture form replaces the "Fix this — start free" button for non-SaaS scan results. This converts e-commerce, local business, and other vertical visitors into a pre-launch waitlist rather than routing them into an onboarding flow that will dead-end at Phase 4.

**Additional acceptance criteria for F1 (append to v5.1 F1 AC):**

- [ ] Non-SaaS scan results display vertical-aware CTA: vertical label + waitlist email form instead of "Fix this — start free"
- [ ] Waitlist form submits to Resend "Non-SaaS Waitlist" Audience (same T148 infrastructure as Phase 4 exit)
- [ ] SaaS scan results retain the "Fix this — start free" CTA unchanged
- [ ] The public scan permalink view (F1 + R7 design) includes this vertical-conditional CTA — pixel spec in `2026-05-05-DESIGN-public-scan-permalink-v1.md` (cross-reference, not duplicated here)
- [ ] Vertical classification runs server-side at scan completion and is stored on the `free_scans` row as a `detected_vertical` column

**Priority: MVP.**

---

### Build Plan v3.2 — Amendments for R1

**T106 amendment (Phase 5 brief-co-author):**
The "Send setup instructions to your developer" button pre-fills for SaaS vertical only at MVP. The `vertical_aware` branch logic in T106 renders only the SaaS path (`UTM-first` setup instructions). E-commerce path (`Twilio-first`) defers to MVP+30 when the e-commerce vertical KG ships.

**T108 amendment (Phase 7 truth-file vertical-conditional):**
The `hours` and `service_area` fields are hidden for SaaS vertical (O-18 fix, unchanged from v5.1). At MVP, this is the only conditional logic needed — there is no e-commerce vertical to branch for. T108 scope at MVP: SaaS vertical only.

**F48 amendment (Yossi Agency Batch Onboarding — MVP+30):**
F48 now has an expanded scope at MVP+30: it ships alongside the e-commerce vertical KG (F16 MVP+30 component). When Yossi onboards a client who is an e-commerce operator, Phase 4 vertical-confirm must recognize the e-commerce vertical. F48 + e-commerce KG are bundled as a single MVP+30 release.

**New ticket T148** — see §6.

---

## §3 — Amendment R3: Workflow Builder Build-Tier Promotion

**Locked:** Adam, 2026-05-05. Source: red-team finding R3 — Scale-only gating restricts Workflow Builder to $499/mo customers. Promoting to Build ($189/mo) broadens value delivery, strengthens the Build tier value proposition, and increases the pool of customers who can use the feature day 1.

---

### F19 Amendment — Workflow Builder Build + Scale (was Scale-only)

**v5.1 F19 text (retired):**
> "React Flow DAG editor ships for Scale-tier users at MVP."
> "Build-tier customers see upgrade modal on `+ New Workflow` click — not the editor."

**v5.2 F19 (supersedes v5.1):**
> "React Flow DAG editor ships for Build-tier ($189/mo) AND Scale-tier ($499/mo) users at MVP. Discover-tier ($79/mo) does NOT have Workflow Builder access."

**Full updated F19 acceptance criteria (replaces v5.1 F19 AC for gating lines only; all other AC unchanged):**

- [ ] React Flow DAG editor is accessible to Build-tier and Scale-tier customers at MVP
- [ ] Discover-tier customers: no Workflow Builder UI visible anywhere in the product (not even a locked/greyed state — the feature does not surface at Discover)
- [ ] The `+ New Workflow` button on `/crew` is visible to Build + Scale; clicking opens the Workflow Builder. It is absent for Discover.
- [ ] "Agency review gate" node type available in node palette for Scale customers only (unchanged from v5.1)
- [ ] All other F19 AC from v5.1 (canvas, node anatomy, dry-run, narration column, Brief grounding cell, etc.) are UNCHANGED
- [ ] Feature-flag matrix updated: `WORKFLOW_BUILDER` flag is `true` for `plan_tier IN ('build', 'scale')`, `false` for `plan_tier = 'discover'` (or null/free)

**Priority: MVP (Build + Scale).**

---

### F11 Amendment — /crew Autonomy Controls (Build + Scale, was Scale-only)

**v5.1 F11 acceptance criteria line (retired):**
> "Scale customers see `+ New Workflow` button (F19). Build customers see button but clicking opens upgrade modal."

**v5.2 F11 (supersedes that line):**
> "Build + Scale customers see `+ New Workflow` button (F19). Clicking opens the Workflow Builder for both tiers. Discover customers do not see the button."

**Additional /crew autonomy control amendment:**

Per-agent autonomy level selectors (in row-expand) are accessible to Build + Scale customers. Discover customers see `/crew` with agent rows displayed but autonomy level controls are read-only (greyed, non-interactive, with a tooltip: "Autonomy controls are available on Build and Scale plans"). Discover customers can still trigger agents manually from /crew; they simply cannot modify autonomy levels.

**Updated /crew AC (append to v5.1 F11 AC):**

- [ ] Build + Scale: full autonomy level selector in row-expand (unchanged from v5.1)
- [ ] Discover: autonomy level selector is rendered but non-interactive. Tooltip on hover: "Available on Build and above." No upgrade modal — just the tooltip.
- [ ] `/crew` accessible to all tiers (Discover, Build, Scale) — it is not a gated route
- [ ] `+ New Workflow` button present for Build + Scale; absent for Discover

**Priority: MVP.**

---

### Pricing Page Implications

The v5.2 pricing comparison table must reflect the Workflow Builder tier change. The feature row for Workflow Builder now reads:

| Feature | Discover $79 | Build $189 | Scale $499 |
|---------|-------------|-----------|-----------|
| Workflow Builder | — | ✓ | ✓ |
| Agent Builder | — | ✓ | ✓ |
| Agency review gate node | — | — | ✓ |

Previously this row showed Workflow Builder as Scale-only. The Build tier now has a materially stronger feature proposition, which reduces the "why not just stay on Discover?" objection.

**Pricing page AC amendment (append to v5.1 F4 pricing page AC):**
- [ ] Workflow Builder row shows Build ✓, Scale ✓, Discover —
- [ ] Agent Builder row shows Build ✓, Scale ✓, Discover —
- [ ] Agency review gate row shows Scale ✓ only (Build —, Discover —)

---

### Build Plan v3.2 — Amendments for R3

**T106–T110 amendment (Option E phase components):**
Any access-gate check for Workflow Builder-adjacent features in the `/start` flow checks `tier >= 'build'` (was `tier === 'scale'`). Specifically: the Skip-cinema option (T128) that refers to a prior Brief continues to apply to all paid tiers — no change there. The Workflow Builder node in the narration column preview during Phase 5 is now visible to Build-tier customers.

**Feature-flag matrix update:**
`WORKFLOW_BUILDER`: `build` → `true`, `scale` → `true`, `discover` → `false`
`AGENT_BUILDER`: same gating as Workflow Builder

**T130 (Yossi MVP+30 agency batch onboarding) unchanged:**
Agency batch onboarding for multi-domain / multi-client orchestration remains Scale-tier only. The Workflow Builder promotion to Build tier does not affect the multi-domain Scale requirement.

---

## §4 — Other Amendments

### Voice Canon Model B — Agent Name Reinforcement

**Addition to Design System Canon (§11 of PRD v5.1):**

The following agent names are **internal-only** and must never appear on any customer-facing surface outside of `/crew` and `/crew/[agent-id]`:

| Internal Name | Customer-facing display |
|--------------|------------------------|
| Schema Doctor | Not displayed (monogram `SD` on /crew only) |
| Citation Fixer | Not displayed (monogram `CF` on /crew only) |
| FAQ Agent | Not displayed (monogram `FA` on /crew only) |
| Competitor Watch | Not displayed (monogram `CW` on /crew only) |
| Trust File Auditor | Not displayed (monogram `TF` on /crew only) |
| Reporter | Not displayed (monogram `RP` on /crew only) |

On /inbox, /workspace, /scans, /home, /reports, and all email surfaces: agent work is described in first-person human voice without naming the agent. Examples:
- Correct: "I updated your FAQ schema to include 3 new questions about pricing comparisons."
- Incorrect: "FAQ Agent updated your FAQ schema."

Agent names appear only on `/crew` (full row: name visible) and `/crew/[agent-id]` (full profile). Monograms appear on agent-authored content in /workspace and /inbox row-level attribution.

**This reinforcement is additive to the existing Voice Canon Model B rules in MEMORY.md.**

---

### QA Gate Process — R4

**Cross-link:** Detailed QA gate process specification lives in `2026-05-05-QA-GATE-PROCESS-v1.md`. That document defines the 4-agent QA team, findings template, severity tiers, and merge gate criteria.

**Summary of the requirement (authoritative in the linked doc):**

After every build wave dispatch, before merging to `main`:
1. **Design QA agent** — visual accuracy against PRD v5.2 specs, motion canon compliance, cream-paper register, typography
2. **Backend QA agent** — API correctness, RLS policies, Inngest function contracts, Supabase schema integrity
3. **Code Quality QA agent** — TypeScript strictness, ESLint compliance, naming conventions, T62 block primitive interface conformance
4. **Frontend QA agent** — component props, accessibility (T98 WCAG fixes pass), mobile viewport correctness, Playwright smoke tests

All 4 must return PASS before any PR merges to `main`. A single FAIL blocks the merge and returns the work to the responsible worker. No exceptions.

**Build Plan v3.2 addition:**
QA gate is a cross-cutting process requirement on every tier (Tier 0 through Tier 5). It is not a separate tier or phase — it is a mandatory gate at the end of every wave. T151 (§6) adds pre-loaded QA agent prompt tooling to make dispatch fast.

---

### Public Scan Permalink Design — R7

**Cross-link:** Pixel spec for the public scan permalink visitor view lives in `2026-05-05-DESIGN-public-scan-permalink-v1.md`.

**F1 amendment addition (append to v5.1 F1 and the F1 amendment in §2 above):**

The public permalink at `/scan/[scan_id]` serves two audiences:
1. The scan owner (authenticated, has context)
2. An outsider who received a shared link and has never heard of Beamix

Audience 2 is the viral wedge. The design must answer: "What does a first-time outsider see, and does it make them want to scan their own domain?"

Key principles from R7 lock:
- AI Visibility Cartogram (F22) renders with progressive disclosure: a summary number ("Your site is mentioned in 3 of 11 AI engines") appears above the 550-cell cartogram. The number is the hook; the cartogram is the proof.
- "Get your free scan" CTA is prominent below the cartogram — large, full-width on mobile
- Brand presentation: Seal + "Beamix" wordmark at top. One-sentence brand descriptor: "AI visibility for businesses that mean it."
- Social-share OG card: title `"[Domain] — AI Visibility Score: [N]/100 | Beamix"`, description `"See how [domain] ranks across 11 AI engines. Run your own free scan."`, image: score ring with domain name
- The public permalink uses the vertical-conditional CTA from F1 amendment (§2 above)

**Build Plan v3.2 addition:**
T149 implements the public scan permalink visitor view per the pixel spec. T149 is Tier 1 because it depends on T100 (`/start` state machine — needs the scan-claim route to work) and T111 (scan permalink amendment).

---

### Inngest Tier Strategy — R5

**No PRD or Build Plan changes.**

The Inngest free-tier migration trigger remains: migrate to Inngest Pro at approximately 5 paying customers. This is re-confirmed from the 2026-05-05 red-team session. Adam's rationale: stay conservative, upgrade early rather than at the last moment.

Memory file `project_inngest_tier_strategy.md` updated 2026-05-05 to reflect re-confirmation.

No code changes. No new tickets. The cost ceiling instrumentation (Tier 0 item 8, Build Plan v3.1) covers monitoring until migration is triggered.

---

### Israeli PPL Compliance — R6

**New item in Adam-only decisions list (§5 below).**

Israeli Privacy Protection Law (PPA-2017 + 2022 amendments) is a launch-blocker for the primary Israeli market. This must be on the agenda for Adam's lawyer call alongside the DPA indemnification cap and E&O insurance.

No code changes at this stage. Legal review precedes any code changes. The R6 finding is captured as an open item — see §5 for the updated Adam-only decisions list.

---

### SOC 2 Type I Observation Timing

**Urgency note (cross-reference from F42 + T89 + T129):**

SOC 2 Type I requires an observation period of typically 60–90 days before the auditor can issue the report. If the target ship date for SOC 2 Type I is MVP+90, the auditor engagement must begin at MVP launch — meaning the auditor must be contracted and the observation period formally started within the first week of MVP going live.

**Action required:** Adam must engage the SOC 2 auditor approximately 2 weeks BEFORE MVP launch, so the observation period starts at or near launch day. If this is not done, the MVP+90 SOC 2 ship window slides.

This is listed in the Adam-only items below (§5) with explicit urgency framing.

---

## §5 — Updated Adam-Only Decisions

After R1–R7 lockdown, the following items require Adam's decision or action before specified gates. They are not blocked on any agent work.

| Item | Status | Gate |
|------|--------|------|
| **Q6 — Paddle inline placement validation** | Pending — R2 requires 10+ customer simulator tests using Opus-grade agents before Q6 locks in code | Before T116 (Paddle inline modal ticket) |
| **DPA indemnification cap** | Pending Adam's lawyer call | Before T66 (Trust Center) publishes |
| **Tech E&O insurance binding** | Pending broker call | Before T66 publishes |
| **Status page vendor pick** (Better Stack default $24/mo) | Pending Adam's pick | Before T68 (status page redirect) |
| **Israeli PPL legal review** (NEW — R6) | Pending discussion with Adam's lawyer — explicit "discuss before launch" flag. PPL is a launch-blocker for the Israeli market. | Before public launch to Israeli customers |
| **SOC 2 Type I auditor engagement** (URGENCY REFRESH) | Pending Adam's vendor vetting. Observation period must begin at MVP launch day for MVP+90 ship to be achievable. Engage auditor ~2 weeks BEFORE launch. | 2 weeks before MVP launch |
| **HackerOne bug bounty program** | Pending 1-day setup | Before T88 (MVP+30) |
| **GitHub OAuth App** (CLIENT_ID + CLIENT_SECRET) | Pending Adam setup | Before T19 (Workflow Builder Git-mode) |
| **Twilio account + first IL/US number** | Pending Adam setup | Before T75 (Lead Attribution F12) |
| **5 pre-build validations** (Option E) | Pending — must complete before merging Option E PR | Before T100 merges |

---

## §6 — Build Plan v3.2 Ticket Additions

These four tickets are added to Build Plan v3.2. They append to the existing ticket registry (T134–T147 from Build Plan v3.1 verification audit patches). New IDs are T148–T151.

---

### T148 — Non-SaaS Vertical Waitlist Email Infra

**Tier:** 1
**Effort:** S
**Dependencies:** T0.9 (Resend setup — domain verified, send volume tier set), T108 (Phase 7 truth-file — vertical detection logic), T100 (Phase 4 vertical-confirm in `/start`)
**References:** PRD v5.2 §2 (F16 amendment, F2 amendment, F1 amendment); R1 red-team decision

**What it does:**
Provides the Resend infrastructure and email sequence for visitors who hit the non-SaaS exit path in Phase 4 of `/start` or the non-SaaS CTA on `/scan` public results. Converts non-SaaS visitors into a pre-launch waitlist rather than a dead end.

**Acceptance criteria:**
- [ ] Resend Audience created: "Non-SaaS Waitlist" with `audience_id` documented in `.env.example` as `RESEND_NON_SAAS_AUDIENCE_ID`
- [ ] API route `POST /api/waitlist/non-saas` accepts `{ email: string, detected_vertical: string, domain?: string }`, adds contact to the Resend audience, returns `{ ok: true }`
- [ ] Validation: email is valid format; `detected_vertical` must be a non-empty string. Returns 400 on invalid.
- [ ] Phase 4 non-SaaS exit path calls this endpoint on email form submit
- [ ] `/scan` public non-SaaS CTA calls the same endpoint
- [ ] Maintenance page Worker (T150) uses the Cloudflare-native Resend API call — does NOT use this Next.js route (separate implementation)
- [ ] Resend nurture sequence (3 emails): (1) confirmation at t=0 — "You're on the list. We built for SaaS first because it's where we know the problem best. [Vertical] support is next." (2) t+7 days — "While we build [vertical] support, here's what Beamix already does for SaaS businesses." (3) t+vertical-launch — "We're ready for you." Triggered by Inngest `waitlist/vertical.launch.requested` event
- [ ] Analytics event `waitlist_signup` fires with `{ vertical, source: 'phase4' | 'scan_cta' }`
- [ ] `pnpm typecheck` zero errors; Resend test send confirms delivery

**Files touched:**
- `apps/web/src/app/api/waitlist/non-saas/route.ts` (new)
- `apps/web/src/inngest/functions/waitlist-nurture.ts` (new)
- `apps/web/.env.example` (add `RESEND_NON_SAAS_AUDIENCE_ID`)

---

### T149 — Public Scan Permalink Visitor View

**Tier:** 1
**Effort:** M
**Dependencies:** T100 (phase state machine — scan-claim routing), T101 (Phase 0 enter-url component), T111 (`/scan` permalink amendment), F22 (AI Visibility Cartogram component must exist)
**References:** PRD v5.2 §4 (R7 amendment); `2026-05-05-DESIGN-public-scan-permalink-v1.md` (pixel spec — authoritative source for this ticket); R7 red-team decision

**What it does:**
Implements the public scan permalink page (`/scan/[scan_id]`) for unauthenticated visitors — the people who receive a shared scan link and have never heard of Beamix. This is the viral flywheel surface. The design must make every outsider want to scan their own domain.

**Acceptance criteria:**
- [ ] `/scan/[scan_id]` route is server-rendered (RSC) and accessible without authentication
- [ ] If `scan_id` is private (owner has not shared it): page renders "This scan is private" message with "Get your free scan" CTA — no results disclosed
- [ ] If `scan_id` is shared: full scan results render per pixel spec in `2026-05-05-DESIGN-public-scan-permalink-v1.md`
- [ ] Progressive disclosure on AI Visibility Cartogram (F22): summary number renders above the 550-cell cartogram ("Mentioned in N of 11 AI engines") — 1 sentence, Inter 18px, ink-2
- [ ] "Get your free scan" CTA: full-width on mobile, large on desktop. Routes to `/start` (Phase 0 enter-url). Styled with `--color-ink-1` background (primary button style)
- [ ] Vertical-conditional CTA: if `detected_vertical` on the scan record is non-SaaS, the CTA renders as the waitlist form (per T148 + F1 amendment in §2) instead of "Get your free scan"
- [ ] Brand header: Seal + "Beamix" wordmark. One-sentence descriptor: "AI visibility for businesses that mean it."
- [ ] Brief binding line present at page bottom per F31
- [ ] OG meta tags: `og:title = "[Domain] — AI Visibility Score: [N]/100 | Beamix"`, `og:description = "See how [domain] ranks across 11 AI engines. Run your own free scan."`, `og:image` = score ring with domain name (server-generated via `@vercel/og`)
- [ ] "Claim this scan" CTA visible only when viewer is NOT the scan owner (unauthenticated or authenticated as a different user). Routes to `/start?phase=results&scan_id=[id]` (per F1 v5.1 amendment, unchanged)
- [ ] If viewer IS the scan owner (authenticated, matches `scan.user_id`): "Claim this scan" is absent; link to `/scans/[scan_id]` in the product instead
- [ ] Page handles stale/expired scans gracefully: if scan is older than 30 days, shows a "This scan has expired" message + "Run a new scan for [domain]" CTA pre-filling the domain in `/start`
- [ ] `pnpm typecheck` zero errors; Playwright snapshot test confirms public permalink renders without authentication

**Files touched:**
- `apps/web/src/app/scan/[scanId]/page.tsx` (new or replace existing stub)
- `apps/web/src/components/scan/PublicScanView.tsx` (new)
- `apps/web/src/components/scan/ScanCartogramSummary.tsx` (new — wrapper for F22 with progressive disclosure)

---

### T150 — Maintenance Page (Cloudflare Worker)

**Tier:** 0
**Effort:** XS
**Dependencies:** None (this is a Cloudflare-level deployment, not a Next.js build dependency)
**References:** `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` §3 (full Worker spec, HTML, env vars); §2 P4 checklist (pre-reset confirmation)

**What it does:**
Deploys a Cloudflare Worker to `app.beamixai.com/*` that serves a branded maintenance page during the hard reset period. Collects emails for relaunch notification via Resend. Removed when the Tier 0 clean-slate build is production-ready.

**Acceptance criteria:**
- [ ] Cloudflare Worker deployed to Cloudflare account and routed to `app.beamixai.com/*`
- [ ] Maintenance page renders the HTML specified in `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` §3 exactly: Seal + "Beamix" wordmark, Fraunces 300 italic headline "We're rebuilding.", Inter 18px sub-line, single email input, "Notify me" button
- [ ] Email form POSTs to `/api/waitlist` endpoint on the Worker (not a Next.js route — Worker-native)
- [ ] Worker uses `RESEND_API_KEY` + `RESEND_WAITLIST_AUDIENCE_ID` environment variables set in Cloudflare Worker settings
- [ ] Resend Audience "Beamix Relaunch Waitlist" exists and receives submissions correctly
- [ ] `Cache-Control: no-cache, no-store, must-revalidate` on all responses
- [ ] Footer links: `/security` → `https://beamixai.com/security`, `/trust` → `https://beamixai.com/trust` (static pages on marketing Framer site; survive the product reset)
- [ ] Mobile Safari + Chrome Android render correctly (Fraunces italic loads from Google Fonts CDN)
- [ ] Binding line present: "AI visibility for businesses that mean it. — Beamix"
- [ ] Worker is disabled (route deleted) when the Tier 0 production build is deployed to `app.beamixai.com`

**Files touched:**
- Cloudflare Worker dashboard only (not a repo file — Worker script is self-contained)
- `docs/08-agents_work/2026-05-05-HARD-RESET-EXECUTION-PLAN.md` (already contains the full Worker script)

---

### T151 — 4-Agent QA Gate Process Tooling

**Tier:** 0
**Effort:** S
**Dependencies:** None (process tooling, not code dependencies)
**References:** PRD v5.2 §4 (R4 — QA gate after every build wave); `2026-05-05-QA-GATE-PROCESS-v1.md` (authoritative spec for the QA gate process)

**What it does:**
Pre-loads system prompts, findings templates, and severity tier rules for the 4 QA agents so that dispatching a QA wave is a single action, not a manual prompt-writing exercise each time. Makes the R4 requirement operationally frictionless.

**Acceptance criteria:**
- [ ] `docs/08-agents_work/2026-05-05-QA-GATE-PROCESS-v1.md` exists and contains the full QA gate spec (authored separately — this ticket tracks its creation as a prerequisite)
- [ ] Four QA agent prompt files created at `.agent/prompts/qa/`:
  - `design-qa.md` — Design QA agent system prompt: visual accuracy, motion canon, cream-paper register, typography checks vs PRD v5.2
  - `backend-qa.md` — Backend QA agent system prompt: API contracts, RLS, Supabase schema, Inngest function signatures
  - `code-quality-qa.md` — Code Quality QA agent system prompt: TypeScript strictness, ESLint, naming conventions, block primitive conformance
  - `frontend-qa.md` — Frontend QA agent system prompt: component props, WCAG, mobile viewport, Playwright smoke test checklist
- [ ] QA findings template at `.agent/templates/qa-findings.md`: structured markdown with sections for PASS/FAIL verdict, severity (Sev-1/Sev-2/Sev-3), finding description, affected file/component, fix required
- [ ] Severity tier definitions documented:
  - Sev-1: blocks merge entirely (broken functionality, security issue, PRD AC violation)
  - Sev-2: must fix in follow-up ticket before next wave dispatch (design drift, accessibility failure)
  - Sev-3: note only (minor polish, nice-to-have improvement)
- [ ] Merge rule documented: all 4 QA agents must return PASS (zero Sev-1, zero Sev-2) before PR merges to `main`
- [ ] Build Lead dispatch template at `.agent/templates/qa-dispatch.md`: single prompt the Build Lead pastes to trigger all 4 QA agents in parallel for a given PR/branch

**Files touched:**
- `.agent/prompts/qa/design-qa.md` (new)
- `.agent/prompts/qa/backend-qa.md` (new)
- `.agent/prompts/qa/code-quality-qa.md` (new)
- `.agent/prompts/qa/frontend-qa.md` (new)
- `.agent/templates/qa-findings.md` (new)
- `.agent/templates/qa-dispatch.md` (new)
- `docs/08-agents_work/2026-05-05-QA-GATE-PROCESS-v1.md` (new — authored by this ticket or as a parallel deliverable)

---

## Summary of Changes vs v5.1 / v3.1

| Area | v5.1 / v3.1 | v5.2 / v3.2 |
|------|------------|-------------|
| F16 Vertical KGs at MVP | 2 (SaaS + e-commerce) | 1 (SaaS only); e-commerce → MVP+30 |
| Phase 4 vertical-confirm | SaaS / E-commerce / "Coming Soon" | SaaS confirm OR non-SaaS exit + waitlist |
| /scan non-SaaS CTA | "Fix this — start free" for all | SaaS → "Fix this — start free"; non-SaaS → waitlist form |
| F19 Workflow Builder gate | Scale-only ($499) | Build + Scale ($189+); Discover excluded |
| F11 /crew autonomy controls | Scale full, Build upgrade modal | Build + Scale full; Discover read-only |
| Pricing table Workflow Builder | Scale ✓ only | Build ✓ + Scale ✓ |
| QA process | Informal | Mandatory 4-agent gate after every wave |
| Adam-only items | 8 items | 10 items (added Israeli PPL + SOC 2 urgency) |
| Build Plan ticket count | T0.1–T147 (147 tickets) | T0.1–T151 (151 tickets; T148–T151 new) |

---

*Cross-references:*
- `2026-05-04-PRD-wedge-launch-v5.1.md` — canonical PRD; v5.2 amends, does not replace
- `2026-05-04-BUILD-PLAN-v3.1.md` — canonical Build Plan; v3.2 appends T148–T151 and amends gating logic
- `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` — hard reset execution plan (supersedes CODEBASE-CLEANUP-PLAN.md)
- `2026-05-05-INFRA-STATE-COMPLETE.md` — all infrastructure state as of 2026-05-05
- `2026-05-05-DESIGN-public-scan-permalink-v1.md` — pixel spec for T149 (to be authored)
- `2026-05-05-QA-GATE-PROCESS-v1.md` — full QA gate process spec (to be authored, required by T151)
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` — source of all R1–R7 decisions
