# Beamix — Decisions Traceability Matrix
**Date:** 2026-05-05
**Author:** CEO audit pass
**Scope:** Final-integrity decision audit verifying every Adam-locked decision is durably recorded. Covers Q1–Q13, R1–R7, Board 1's 23 decisions, all locked design choices, pricing, infrastructure, personas, process, and outstanding pending items.
**Status:** COMPLETE — see verdict at §10.

---

## How to read this matrix

Each entry shows:
- **Decision summary** — what was locked
- **Primary record** — the canonical durable location
- **Also recorded in** — secondary references
- **Traceable from PRD v5.1+v5.2** — yes / partial / no
- **Status** — LOCKED / PENDING / DEFERRED
- **Signal** — 🟢 durably recorded + easy to find / 🟡 recorded but cross-reference weak / 🔴 not durably recorded or chat-only

---

## §1 — Q1–Q13: The 13 Architectural Decisions

### Q1: Yossi agency mode at MVP+30

**Decision:** Agency batch onboarding for multi-domain / multi-client orchestration deferred to MVP+30. Marcus is wedge; Yossi gets full ceremony at MVP per domain (Scale tier), batch mode ships alongside e-commerce KG at MVP+30.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §4 (F48, explicitly deferred), `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` locked decisions list (Q1 row marked ✅)

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §2 (F48 amendment), `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` O-1

**Traceable from PRD v5.1+v5.2:** Yes — F48 explicitly labelled MVP+30 in v5.1 ToC

**Status:** LOCKED

**Signal:** 🟢

---

### Q2: Heebo 300 italic for Hebrew

**Decision:** Heebo 300 italic loaded conditionally on `[lang="he"]` pages as Fraunces' Hebrew companion. Font stack: `font-family: 'Fraunces', 'Heebo', serif`. Geist Mono content gets explicit `dir="ltr"` to prevent mirrored URLs in Hebrew context.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` Feature 2 v5 acceptance criteria (Phase 5 Heebo bullet)

**Also recorded in:** `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` O-2, `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` Phase 6 description, `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` locked decisions list (Q2 row)

**Traceable from PRD v5.1+v5.2:** Yes — acceptance criteria item in F2 v5

**Status:** LOCKED

**Signal:** 🟢

---

### Q3: Brief grounding preview during Step 2 ships at MVP

**Decision:** During Phase 5 (brief-co-author) of /start, a right-column preview shows what an /inbox item looks like with inline Brief grounding citation (`Authorized by your Brief: "[clause]" — clause N · Edit Brief →`). This ships at MVP, not deferred.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` Feature 2 v5 Phase 5 description + acceptance criteria

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` locked decisions list (Q3 ✅), Phase 6 detail

**Traceable from PRD v5.1+v5.2:** Yes — explicit acceptance criteria bullet

**Status:** LOCKED

**Signal:** 🟢

---

### Q4: Activation = first /inbox approval within 7 days post-Paddle checkout

**Decision:** The activation event is defined as first /inbox approval. The activation window is 7 days (extended from the original 24h that was locked at Q4 in the flow architecture session, superseded by Q7). The clock starts at Paddle checkout, not at signup and not at Brief signing. `activation_event_at` column on subscriptions table is set on this event.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §2 Pricing ("Trial clock starts at Paddle checkout"), Tier 0 item 16 (`activation_event_at` column), Persona A renewal anchor description

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-2 (24h recommended extended to 7 days), Q7 decision

**Traceable from PRD v5.1+v5.2:** Yes — multiple references in v5.1; the 7-day window is implicit in Q7 which supersedes the original Q4 24h lock

**Note:** There is a minor cross-reference gap — PRD v5.1 says "activation_event_at = first /inbox approval" but the 7-day window duration is clearest in the flow architecture synthesis. The PRD does not spell out "7 days" explicitly in a single sentence.

**Status:** LOCKED

**Signal:** 🟡 (window duration scattered across two files; not stated in one place in PRD)

---

### Q5: Quiet "Security & DPA" footer link

**Decision:** A small 13px ink-3 "Security & DPA" link appears below the signature area in Phase 6 (brief-signing). Links to /trust. Small, not a banner — users who care click; others are not disrupted.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` Feature 2 v5 Phase 6 description + acceptance criteria

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` Phase 7 description (Q5 lock reference), `docs/08-agents_work/2026-05-04-ONBOARDING-AUDIT-SYNTHESIS.md` O-3

**Traceable from PRD v5.1+v5.2:** Yes — acceptance criteria bullet present

**Status:** LOCKED

**Signal:** 🟢

---

### Q6: Paddle inline overlay on /home post-Brief opt-in (deferred from /start flow)

**Decision:** Paddle checkout is NOT in the /start flow. Customer proceeds through all 8 phases of /start (including Brief signing) as a Free Account without encountering Paddle. Paddle appears as an inline modal on /home triggered by "Activate agents" CTA. No redirect. Customer dismisses and returns whenever ready.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §4 Phase 9 description, §4 Two-tier activation model table, F4 (amended), F51

**Also in:** `docs/08-agents_work/2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md` — full 12-persona × 2-placement validation (92% vs 58% conversion). This is the supporting evidence for Q6. `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §5 (Q6 validation cross-link noted)

**Traceable from PRD v5.1+v5.2:** Yes — PRD v5.1 explicit. Customer simulator file is explicit cross-reference. PRD v5.2 §5 confirms Q6 stands with cross-link to simulator.

**Status:** LOCKED

**Signal:** 🟢

---

### Q7: 7-day activation window

**Decision:** Activation window extended from 24h (original Q4 lock) to 7 days. Allows for deliberate buyers, committee buyers, and weekend signups. Day-14 renewal trigger email fires at 14 days from Paddle checkout, not from signup.

**Primary record:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-2 (audit recommendation: extend to 7 days; decision row Q7 ✅)

**Also recorded in:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` Persona A description (Day-14 email measured from Paddle checkout)

**Traceable from PRD v5.1+v5.2:** Partial — the 7-day window duration is not stated explicitly in PRD v5.1 body text, only implied. The flow architecture synthesis document is the primary home for this specific number.

**Note:** The 7-day duration should be surfaced explicitly in F51 or F53 of PRD v5.1 for completeness. Currently requires cross-referencing the synthesis doc to confirm the number.

**Status:** LOCKED

**Signal:** 🟡 (number implicit in PRD, explicit only in synthesis doc)

---

### Q8: 14/14/30 money-back tier split + agent-run caps

**Decision:** Refund windows are tier-differentiated: Discover 14 days, Build 14 days, Scale 30 days. Agent-run caps during refund window: Discover 5 runs / Build 10 runs / Scale 20 runs; unlimited after refund window closes.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §2 Pricing ("Refund windows: Discover 14 days, Build 14 days, Scale 30 days. Agent-run caps during refund window…"), F54 (Refund Risk Mitigation: Agent-Run Caps)

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-3, Q8 decision row, `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_pricing_v2.md` (pricing locked)

**Traceable from PRD v5.1+v5.2:** Yes — explicit in §2 and F54

**Status:** LOCKED

**Signal:** 🟢

---

### Q9: Google OAuth as primary signup

**Decision:** Google OAuth is the primary auth method on the /start Phase 3 (signup-overlay). Email+password is secondary fallback. Google OAuth eliminates the verification email drop-off step. Supabase Auth configured with Google OAuth provider.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` Tier 0 item 13 ("Google OAuth provider configured in Supabase Auth"), Feature 2 v5 Phase 3 description, acceptance criteria bullet

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-4, Q9 row ✅

**Traceable from PRD v5.1+v5.2:** Yes — explicit in Tier 0 infrastructure list and F2 acceptance criteria

**Status:** LOCKED

**Signal:** 🟢

---

### Q10: Embeddable score badge ships at MVP+30

**Decision:** Score badge (customer embeds on their site linking back to their public scan permalink, showing AI Visibility score) defers to MVP+30. F49 in PRD.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` F49 (Embeddable Score Badge, MVP+30)

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-5, Q10 ✅

**Traceable from PRD v5.1+v5.2:** Yes — F49 clearly labelled MVP+30

**Status:** LOCKED (deferred to MVP+30)

**Signal:** 🟢

---

### Q11: Public dogfooding scan built MVP, published MVP+30

**Decision:** Beamix publishes its own AI search scan results publicly (Plausible-style). The scan infrastructure is built at MVP. The public scan at /scan/beamixai.com is published at MVP+30 once metrics are validated.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` F50 (Public Dogfooding Scan — "built MVP, published MVP+30")

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` N-6, Q11 ✅

**Traceable from PRD v5.1+v5.2:** Yes — F50 clearly labelled with built/published split

**Status:** LOCKED

**Signal:** 🟢

---

### Q12: Option E approved (unified /start route)

**Decision:** Option E — unified `/start` route absorbing all onboarding entry paths, with public `/scan` preserved as peer marketing surface. The "scan vs onboarding" false binary resolved by making both coexist: `/scan` for viral acquisition, `/start` for conversion.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §4 full Architecture Overview, deprecation notice on Feature 2 v4

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` full Option E description + ⭐ verdict, Q12 in decision list

**Traceable from PRD v5.1+v5.2:** Yes — §4 is the entire architectural section of v5.1

**Status:** LOCKED

**Signal:** 🟢

---

### Q13: Option E ships at MVP

**Decision:** Option E is not deferred to MVP+30. It ships as the architecture at MVP launch. Build effort accepted (M-L) for the conversion and brand-coherence gains.

**Primary record:** `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §4 header "Decision locked: Q12 + Q13 (Adam, 2026-05-04). Option E ships at MVP launch."

**Also recorded in:** `docs/08-agents_work/2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` Q13 decision in the open question list, CEO recommendation paragraph

**Traceable from PRD v5.1+v5.2:** Yes — §4 explicit

**Status:** LOCKED

**Signal:** 🟢

---

## §2 — R1–R7: Red-Team Decisions (2026-05-05)

### R1: SaaS-only at MVP (e-commerce → MVP+30)

**Decision:** Only the SaaS vertical ships at MVP. E-commerce vertical KG defers to MVP+30. Marcus is the wedge persona. Dani (e-commerce) enters at MVP+30.

**Primary record:** `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R1 (LOCKED), `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §2 (F16 amendment, F2 amendment, F1 amendment — full AC specified)

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §1 frontmatter cross-reference table

**Traceable from PRD v5.1+v5.2:** Yes — v5.2 §2 is the canonical amendment. v5.1 F16 says "2 vertical KGs"; v5.2 overrides to 1 at MVP.

**Status:** LOCKED

**Signal:** 🟢

---

### R2: 12-persona simulator validated Q6 (Paddle on /home wins 92% vs 58%)

**Decision:** Customer simulator using 12 distinct personas × 2 Paddle placements validated that Placement A (Paddle deferred to /home) converts at ~92% vs Placement B (Paddle at Brief signing) at ~58%. Q6 lock confirmed. PRD v5.1 requires no amendment.

**Primary record:** `docs/08-agents_work/2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md` — full 12-persona simulation (~5,500 words). §7 recommendation is authoritative. `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R2

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §5 Adam-only items (Q6 noted as "pending" only because the simulator output needs a post-launch A/B test; the lock itself stands)

**Traceable from PRD v5.1+v5.2:** Yes — cross-link in v5.2 §5

**Status:** LOCKED

**Signal:** 🟢

---

### R3: Workflow Builder → Build + Scale tiers (was Scale-only)

**Decision:** Workflow Builder (F19) and Agent Builder access promoted from Scale-only to Build + Scale. Discover tier gets no Workflow Builder (not even a greyed state — feature is absent for Discover). The `+ New Workflow` button on /crew is present for Build and Scale; absent for Discover.

**Primary record:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §3 (F19 amendment + F11 amendment + pricing table amendment), `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R3

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §1 table (R3 row)

**Traceable from PRD v5.1+v5.2:** Yes — v5.2 §3 is the canonical amendment. Note that PRD v5.1 §5 F19 still says Scale-only; v5.2 overrides this explicitly.

**Status:** LOCKED

**Signal:** 🟢

---

### R4: Multi-wave QA gate (4 agents after every wave)

**Decision:** After every build wave dispatch, before merging to main, 4 QA agents must all return PASS: Design QA, Backend QA, Code Quality QA, Frontend QA. A single FAIL blocks the merge. No exceptions.

**Primary record:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §4 (QA Gate Process — R4), `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R4

**Also recorded in:** T151 ticket spec in `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §6, cross-link to `2026-05-05-QA-GATE-PROCESS-v1.md` (to be authored — currently noted as "to be authored" in v5.2)

**Traceable from PRD v5.1+v5.2:** Yes — v5.2 §4 contains the full description. The `QA-GATE-PROCESS-v1.md` file is referenced but not yet authored; T151 covers its creation.

**Note:** Until `2026-05-05-QA-GATE-PROCESS-v1.md` is written, the QA gate detail lives only in v5.2 §4. T151 ensures the spec file gets created, but it is not yet a durable standalone document.

**Status:** LOCKED

**Signal:** 🟡 (decision locked; detailed spec file not yet created — T151 tracks creation)

---

### R5: Inngest tier — keep ~5 paying customers trigger (re-confirmed)

**Decision:** Migrate from Inngest free tier to Inngest Pro ($150/mo) at approximately 5 paying customers OR ≥75–80% free-tier usage. Conservative trigger confirmed. No change from prior lock.

**Primary record:** `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_inngest_tier_strategy.md` (updated 2026-05-05), `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R5

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §4 (Inngest Tier Strategy — R5, noting no code changes)

**Traceable from PRD v5.1+v5.2:** Partial — v5.2 §4 acknowledges R5 and notes no PRD changes required. The actual trigger threshold lives in the memory file.

**Status:** LOCKED

**Signal:** 🟢

---

### R6: Israeli PPL compliance — pending Adam's lawyer call

**Decision:** Israeli Privacy Protection Law (PPA-2017 + 2022 amendments) is a launch-blocker for the Israeli market. Flagged as pending legal review. Must be on the agenda for Adam's lawyer call alongside DPA cap and E&O insurance.

**Primary record:** `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R6, `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §5 Adam-only items table (Israeli PPL row)

**Also recorded in:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §4 (Israeli PPL Compliance — R6 section)

**Traceable from PRD v5.1+v5.2:** Yes — v5.2 §4 and §5 both reference R6

**Status:** PENDING (Adam's lawyer call required before public launch to Israeli customers)

**Signal:** 🟢

---

### R7: Public scan permalink design — locked, designed

**Decision:** `/scan/[scan_id]` public visitor view designed for the viral acquisition flywheel. Key design elements: progressive disclosure on cartogram (summary number above the 550-cell grid), "Get your free scan" CTA full-width mobile, brand header (Seal + "Beamix" + one-sentence descriptor), social OG card spec. Vertical-conditional CTA for non-SaaS visitors (waitlist form instead of "Fix this — start free").

**Primary record:** `docs/08-agents_work/2026-05-05-PRD-AMENDMENTS-v5.2.md` §4 (Public Scan Permalink Design — R7), T149 ticket spec in §6. Cross-link to `2026-05-05-DESIGN-public-scan-permalink-v1.md` (noted as "to be authored — authoritative pixel spec")

**Also recorded in:** `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` R7, cartogram phase 2 note

**Traceable from PRD v5.1+v5.2:** Yes — v5.2 §4 and T149 are durable. The pixel spec file is referenced but noted as "to be authored" — T149 depends on it.

**Note:** `2026-05-05-DESIGN-public-scan-permalink-v1.md` is not yet written. T149 AC references it as authoritative. This is a minor gap — the decision is locked and described, but the pixel-level spec file is pending.

**Status:** LOCKED (decision); pixel spec file PENDING (T149 prerequisite)

**Signal:** 🟡 (decision locked and summarized; pixel spec file referenced but not yet authored)

---

## §3 — Board 1's 23 Strategic Decisions

Source: `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` (all 23 locked 2026-04-28).

| # | Decision | PRD v5.1 Reference | Signal |
|---|---|---|---|
| 1 | Monthly Update permalink private by default, explicit share button | F1 AC ("private by default"), Persona shared traits table | 🟢 |
| 2 | /crew layout: Stripe-style table default, yearbook DNA in ceremonial states only | F11 (/crew spec), §6 locked design decisions | 🟢 |
| 3 | White-label digest signature: Discover/Build = "Beamix" (non-removable); Scale = agency-primary + "Powered by Beamix" footer | F40 (Multi-Domain Scale Tier), §6 design section | 🟢 |
| 4 | Voice canon Model B: agents named in product; "Beamix" on all external surfaces | §1 Frame 5 v2, PRD v5.2 §4 (agent name reinforcement), MEMORY.md `project_voice_canon_model_b.md` | 🟢 |
| 5 | Workspace (/workspace) accessible to all tiers including Discover | F8 (/workspace spec) | 🟢 |
| 6 | Marketplace install gated to Build+; Discover sees catalog read-only | F17 (Marketplace) | 🟢 |
| 7 | Workflow Builder originally Scale-only (superseded by R3 → now Build+Scale) | v5.2 §3 F19 amendment supersedes this; old lock documented in Board 1 synthesis | 🟢 (updated by R3) |
| 8 | Truth File schema: shared base + vertical-extensions as Zod discriminatedUnion keyed by vertical_id | F3 (Truth File), Tier 0 item 2 | 🟢 |
| 9 | Full-auto semantics: even Full-auto routes "uncertain" outcome to /inbox, never auto-publishes | F9 (/scans), F6 (/inbox), §9 Trust Architecture section | 🟢 |
| 10 | Pre-publication validator: cryptographic signed-token (60s TTL, draft-hash bound) | Tier 0 item 5, F18 | 🟢 |
| 11 | L2 site integration: manual paste + Git-mode (GitHub PR) at MVP; WordPress plugin at MVP-1.5 | F12 (Lead Attribution, integration spec) | 🟢 |
| 12 | Real-time channel: Supabase Realtime broadcast mode, one channel per customer, polling fallback at 10s | Tier 0 item 4 | 🟢 |
| 13 | Inngest free tier at MVP; migrate to Pro at ~5 paying customers (Adam-locked over Architect's Pro-from-day-1) | Tier 0 item 3, MEMORY.md `project_inngest_tier_strategy.md`, R5 re-confirmed | 🟢 |
| 14 | Day 1–6 email cadence: 4 emails, weekend-skip rule, signed "— Beamix" | F14 (Email infrastructure) | 🟢 |
| 15 | /security public page ships at MVP | F20 (/security public page) | 🟢 |
| 16 (2.1) | White-label is per-CLIENT, not per-account | MEMORY.md `project_white_label_per_client.md`, F40 | 🟢 |
| 17 (2.2) | Bulk-approve in /inbox at MVP (shift-click multi-select + Cmd+A, single-client) | F6 (/inbox spec) | 🟢 |
| 18 (2.3) | Plumber DNA: vertical-aware UI from Step 1; SaaS leads with UTM, not Twilio | F2 v5 Phase 5 description, F12 | 🟢 |
| 19 (2.4) | Truth File integrity tripwire: nightly hash comparison, Sev-1 alert + auto-pause on >50% field loss | Tier 0 item 6, F18 | 🟢 |
| 20 (2.5) | Agency indemnification DPA clause: Scale-tier DPA, mutual indemnification, cap at lesser of 3× monthly or $25K/incident | F21 (Scale-tier DPA + indemnification clause) — cap amount pending Adam's lawyer call | 🟡 (cap amount still pending lawyer call) |
| 21 (2.6) | Workflow Builder dry-run: real LLM execution with `dry_run: true` flag, no mock sandbox needed | F19 (Workflow Builder) | 🟢 |
| 22 (Tension A) | Workflow Builder MVP scope: full DAG editor + dry-run + 3 templates day 1; event triggers + publishing → MVP-1.5 | F19 + MEMORY.md `project_workflow_builder_mvp_scope.md` | 🟢 |
| 23 (Tension B) | Workflow publishing deferred to MVP-1.5 (cross-tenant Truth File binding ships first) | F17 (Marketplace, publishing notes), F19 | 🟢 |

**Summary for §3:** 22 of 23 decisions are 🟢 durably recorded. Decision 20 (indemnification cap amount) is 🟡 because the dollar cap is pending Adam's lawyer call, though the obligation to have a cap is locked.

---

## §4 — Locked Design Choices from Round 1/2/3 Design Board

### 65 surgical edits applied to specs (Round 1)

**Primary record:** `docs/08-agents_work/2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` — full 37 decisions enumerated (items 1–37, including strong convergences, two-legend convergences, single-legend proposals)

**Traceable from PRD v5.1+v5.2:** Yes — §6 (Locked Design Decisions from Board 2) in v5.1 documents the design locks. Individual features reference their Board 1 origins.

**Signal:** 🟢

**Key individual design locks below:**

| Design lock | Source | PRD v5.1 reference | Signal |
|---|---|---|---|
| Seal 540ms stamping curve + "— Beamix" 300ms opacity fade (not stroke-draw) | Board 1 item 3, Board 2 item 2 | F2 v5 Phase 6 ("Seal stamps in 540ms…") | 🟢 |
| Arc's Hand: 1px ink-1 dot at t=120ms during seal stamp | Round 2/3 synthesis R2-17 | F2 v5 Phase 6 acceptance criteria | 🟢 |
| Cycle-Close Bell + Arc's Wave (60ms stagger) | Board 1 item 25, Round 2/3 R2-17 | F23 (Cycle-Close Bell) | 🟢 |
| 10 named easing curves + ESLint rules | Round 2/3 synthesis R2-4 | §11 Design System Canon, PRD v5.1 | 🟢 |
| Variable Inter + subset Fraunces (~40 chars, saves ~140KB) | Round 2/3 R2-5 | §11 Design System Canon | 🟢 |
| Block primitive interfaces (18 types, TypeScript interfaces) | Round 2/3 R2-11 | Tier 0 implicit; §11 Design System Canon | 🟡 (in §11 of PRD v5.1 but no dedicated Tier 0 ticket in Build Plan v3.1 — may need explicit ticket) |
| Speed CI gate (Playwright + Lighthouse on PR) | Round 2/3 R2-13 | Build Plan v3.1 (Tier 0 amendment) | 🟢 |
| Status vocabulary lock (14 canonical terms) + ESLint rule | Round 2/3 R2-2 | §11 Design System Canon | 🟢 |
| Cartogram CSS Grid 14×12px implementation (not canvas) | Round 2/3 R2-6 | F22 amendment in v5.1 §5 | 🟢 |
| Cream paper stays light forever (8 surfaces) / dark mode partition at MVP+30 for 6 admin-utility surfaces | Round 2/3 R2-3 | §11 Design System Canon | 🟢 |
| Voice canon Model B: single character externally; agents only on /crew | Board 1 item 4, PRD v5.2 §4 reinforcement | §1 positioning, §3 personas, v5.2 §4 | 🟢 |
| Deterministic seed-per-agent fingerprint function (not per-render variance) | Board 1 item 23 | Tier 0 item 7 ("per-agent Rough.js monogram generator with deterministic seed-per-agent UUID") | 🟢 |
| Aria — 4th canonical persona (Marcus's hidden CTO co-founder) | Round 2/3 synthesis persona canon addition | §3 Persona D, MEMORY.md `project_aria_4th_persona.md` | 🟢 |

### 17 actionable additions from Round 2/3

**Primary record:** `docs/08-agents_work/2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` — R2-1 through R2-17 (plus R2-18 through R2-20 contested decisions)

**Traceable from PRD v5.1:** Yes — PRD v5.1 §5 lists F41–F47 (Cmd-K, Trust Center, bug bounty, /changelog, compact mode, error pages, State of AI Search) as features added from Board 2/3.

**Signal:** 🟢 (all 17 additions have either a feature ID in v5.1 or a design system canon entry in §11)

---

### Frame 5 v2 strategic positioning

**Primary record:** `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md` — 8 strategic questions locked. `docs/08-agents_work/2026-05-04-PRD-wedge-launch-v5.1.md` §1 Frame 5 v2 Strategic Positioning

**Traceable from PRD v5.1:** Yes — §1 is the canonical positioning statement

**Signal:** 🟢

---

## §5 — Pricing + Monetization Decisions

| Decision | Primary record | Signal |
|---|---|---|
| Discover $79/mo + $63/mo annual | PRD v5.1 §2, MEMORY.md `project_pricing_v2.md` | 🟢 |
| Build $189/mo + $151/mo annual | PRD v5.1 §2, MEMORY.md `project_pricing_v2.md` | 🟢 |
| Scale $499/mo + $399/mo annual | PRD v5.1 §2, MEMORY.md `project_pricing_v2.md` | 🟢 |
| Multi-domain add-on $49/mo (Scale) | PRD v5.1 §2 tier table ("5 included + $49/domain/mo add-on"), F40 | 🟢 |
| 14/14/30 money-back tier split | PRD v5.1 §2, F54 (Refund Risk Mitigation), Q8 lock | 🟢 |
| Agent-run caps during refund window (5/10/20) | PRD v5.1 §2 ("Agent-run caps during refund window"), F54 | 🟢 |
| 11 AI engines coverage (Discover 3, Build 6, Scale 11) | PRD v5.1 §2 tier table (Engines column: 3/6/11), F15 | 🟢 (Note: PRD v5.1 §2 shows Discover 3, Build 6, Scale 11 — the "Discover 3, Build 7, Scale 11" formulation in some MEMORY.md files may reflect an earlier version; v5.1 is canonical) |
| 6 MVP agents (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter) | PRD v5.1 F7 (MVP Agent Roster) | 🟢 |

---

## §6 — Infrastructure Decisions

| Decision | Primary record | Also in | Signal |
|---|---|---|---|
| Domain: beamixai.com (LIVE) | PRD v5.1 header ("Domain: beamixai.com") + deprecation notice | MEMORY.md project_domain.md (still shows beamix.tech — see note) | 🟡 (MEMORY.md domain file may be stale — references notify.beamix.tech; notify.beamixai.com is the active domain per v5.1 Tier 0 item 9) |
| Brand: "Beamix" (never "BeamixAI") | PRD v5.1 header, v5.2 header, all docs | MEMORY.md | 🟢 |
| Stack: Next.js 16 + React 19 + Supabase + Paddle + Inngest + Resend + Cloudflare DNS | PRD v5.1 Domain Infrastructure Status §14 | CLAUDE.md stack section | 🟢 |
| No Stripe, no n8n | MEMORY.md LOCKED DECISIONS, CLAUDE.md | PRD v5.1 F4 (Paddle only) | 🟢 |
| Google OAuth primary auth | PRD v5.1 Tier 0 item 13, Q9 lock | Flow architecture synthesis | 🟢 |
| Inngest free tier → migrate at ~5 paying customers | MEMORY.md project_inngest_tier_strategy.md | PRD v5.1 Tier 0 item 3, v5.2 §4 R5 | 🟢 |

**Note on domain:** `MEMORY.md` index entry `project_domain.md` references `notify.beamix.tech` for transactional email. PRD v5.1 Tier 0 item 9 specifies `notify.beamixai.com`. This is a stale cross-reference. Not a decision gap — the v5.1 canonical domain is correct — but the MEMORY.md index entry should be updated.

---

## §7 — Persona Canon

| Persona | Primary record | Signal |
|---|---|---|
| Marcus (B2B SaaS founder) | PRD v5.1 §3 Persona A (full profile, renewal anchor, tier mapping) | 🟢 |
| Dani (e-commerce/Hebrew) | PRD v5.1 §3 Persona B | 🟢 |
| Yossi (multi-client agency) | PRD v5.1 §3 Persona C (critical requirements itemized) | 🟢 |
| Aria (Marcus's CTO co-founder, 4th persona — added 2026-04-28) | PRD v5.1 §3 Persona D (full profile), MEMORY.md project_aria_4th_persona.md, Round 2/3 synthesis persona section | 🟢 |

---

## §8 — Process Decisions

| Decision | Primary record | Signal |
|---|---|---|
| Multi-wave QA gate (R4 lock) | PRD v5.2 §4, MEMORY.md project_red_team_decisions_2026_05_05.md R4, T151 | 🟡 (spec file QA-GATE-PROCESS-v1.md not yet authored) |
| Hard reset codebase (apps/web/src/ wipe, fresh scaffold) | MEMORY.md project_red_team_decisions_2026_05_05.md (Hard reset section), cross-link to `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` | 🟢 (execution plan doc exists per v5.2 cross-references) |
| Maintenance page during reset (Cloudflare Worker on app.beamixai.com) | T150 ticket spec in v5.2 §6, cross-link to HARD-RESET-EXECUTION-PLAN.md §3 | 🟢 |
| Tag snapshot before reset | MEMORY.md red-team decisions (Hard reset caveats: `git tag mvp-cleanup-snapshot-2026-05-05`) | 🟢 |
| 5 pre-build validations (post-Option E) | PRD v5.1 §4 Pre-build validations section | 🟢 |
| Per-PR incremental deploys (Vercel preview + CI gate) | Build Plan v3.1 (Tier 0 Speed CI gate item), Round 2/3 R2-13 | 🟢 |

---

## §9 — Outstanding Pending Decisions (Adam-only)

The following items are documented as pending and are NOT gaps in the decision record — they are explicitly flagged as Adam-only gates.

| Item | Where recorded | Gate |
|---|---|---|
| GitHub OAuth App (CLIENT_ID + CLIENT_SECRET) | PRD v5.2 §5 Adam-only table | Before T19 (Workflow Builder Git-mode) |
| Twilio account + first IL/US number | PRD v5.2 §5 Adam-only table | Before T75 (Lead Attribution F12) |
| DPA indemnification cap (exact dollar amount) | PRD v5.2 §5 Adam-only table | Before T66 (Trust Center) publishes |
| Tech E&O insurance binding | PRD v5.2 §5 Adam-only table | Before T66 publishes |
| Status page vendor pick (Better Stack $24/mo default) | PRD v5.2 §5 Adam-only table | Before T68 |
| Israeli PPL compliance (R6) | PRD v5.2 §4 + §5, MEMORY.md R6 | Before public launch to Israeli customers |
| SOC 2 Type I auditor engagement (auditor must start at MVP launch day for MVP+90 ship) | PRD v5.2 §4 (SOC 2 urgency note) + §5 | 2 weeks before MVP launch |
| HackerOne bug bounty program (1-day setup) | PRD v5.2 §5 Adam-only table | Before T88 (MVP+30) |
| 5 pre-build validations confirmation | PRD v5.1 §4 pre-build validations, PRD v5.2 §5 Adam-only table | Before T100 merges |
| 8-item hard reset confirmation checklist | MEMORY.md red-team decisions (Hard reset caveats) | Before executing hard reset |

**Signal for pending items:** All 10 are durably recorded in PRD v5.2 §5. No pending items are chat-only.

**Signal:** 🟢

---

## §10 — Severity-Ranked Findings

### 🔴 Critical — Not documented anywhere durable

**None found.** All decisions reviewed have at least one durable file as their primary record. No decisions are chat-only.

---

### 🟡 Important — Documented but cross-references weak or partially incomplete

**1. Q4/Q7 activation window: 7-day duration not stated explicitly in PRD v5.1 body**
- The activation window of 7 days is clearest in `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` (N-2 + Q7 row). PRD v5.1 says activation event = first /inbox approval, Paddle checkout starts the clock, but does not state "7 days" in a single clean sentence within the feature spec or the pricing section.
- **Recommended fix in master handoff:** add a one-line callout to PRD v5.1 §2 or F51: "The activation window is 7 days from Paddle checkout. If no /inbox approval within 7 days, Day-7 recovery email fires (F53)."

**2. QA-GATE-PROCESS-v1.md not yet written (R4, T151)**
- R4 decision is locked. T151 exists. But the actual process spec file is "to be authored." Until it exists, the QA gate process detail lives only in v5.2 §4.
- **Recommended fix:** T151 is Tier 0 — must be one of the first deliverables before wave 1 dispatch.

**3. R7 pixel spec file not yet written**
- `2026-05-05-DESIGN-public-scan-permalink-v1.md` is referenced as the authoritative pixel spec for T149 but has "to be authored" status. T149 acceptance criteria depend on it.
- **Recommended fix:** Author the pixel spec as part of design prep before T149 is dispatched to a worker.

**4. Board Decision 20 (Agency DPA indemnification cap dollar amount) — pending lawyer call**
- The obligation to have a cap is locked. The specific dollar amount ($25K/incident cap) is noted in the Board 1 synthesis but is pending Adam's lawyer confirmation.
- **Recommended fix:** Once lawyer call happens, lock the cap amount in F21 acceptance criteria in PRD v5.1.

**5. MEMORY.md domain index entry stale (notify.beamix.tech vs notify.beamixai.com)**
- Minor but could cause confusion if agents read the MEMORY.md index and try to configure notify.beamix.tech.
- **Recommended fix:** Update `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_domain.md` to reflect notify.beamixai.com.

**6. Block primitive interfaces (18 types) — no dedicated Tier 0 ticket in Build Plan**
- Locked in design system canon (§11 of PRD v5.1, Round 2/3 R2-11) but there is no explicit Tier 0 ticket in Build Plan v3.1/v3.2 for creating the TypeScript block interface files.
- **Recommended fix:** Confirm that the TypeScript interfaces for the 18 block primitives are created as part of Tier 0 canonical type files (Tier 0 item 1) or add a dedicated sub-ticket.

---

### 🟢 Verified — Durably recorded, easy to find

All decisions in §1 (except Q4/Q7 window duration nuance and Q7), §2 (except R4 spec file and R7 pixel spec), §3 (22 of 23), all of §5, all of §6 (except domain index note), all of §7, and all pending items in §9 are durably recorded and easily findable.

The canonical document chain for any decision lookup is:
1. PRD v5.1 (`2026-05-04-PRD-wedge-launch-v5.1.md`) — features, architecture, personas, pricing
2. PRD v5.2 (`2026-05-05-PRD-AMENDMENTS-v5.2.md`) — R1, R3, R4, R5, R6, R7 amendments
3. Red-team memory file (`~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md`) — R1–R7 concise entries
4. Flow architecture synthesis (`2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md`) — Q1–Q13 with N-1 through N-6 supporting
5. Board 1 synthesis (`2026-04-27-BOARD-MEETING-SYNTHESIS.md`) — 23 strategic decisions locked 2026-04-28
6. Design Board Round 1 (`2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md`) — 65 surgical edits
7. Design Board Round 2/3 (`2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md`) — 17 additions

---

## Final Verdict

**MINOR_GAPS 🟡**

Every decision is durably recorded. There are zero 🔴 Critical gaps. Six 🟡 Important items require attention before the master handoff is considered complete:

1. State the 7-day activation window explicitly in PRD v5.1 §2 or F51 (one sentence)
2. Author `2026-05-05-QA-GATE-PROCESS-v1.md` (T151 — Tier 0)
3. Author `2026-05-05-DESIGN-public-scan-permalink-v1.md` (prerequisite for T149)
4. Lock DPA indemnification cap dollar amount in F21 after Adam's lawyer call
5. Update `project_domain.md` memory file from notify.beamix.tech → notify.beamixai.com
6. Confirm block primitive TypeScript interfaces are covered by Tier 0 item 1 or add sub-ticket

None of these gaps represent lost decisions. All locked decisions are durably recorded in at least one file that survives session resets. Safe to commit the master handoff with these 6 items tracked as follow-up actions.

---

*Audit scope: Q1–Q13 (13 items), R1–R7 (7 items), Board 1 strategic decisions (23 items), design board locks from Rounds 1/2/3, pricing decisions (8 items), infrastructure decisions (6 items), persona canon (4 personas), process decisions (6 items), pending items (10 items). Total: ~90 decision points reviewed.*
