# Beamix — Wedge Launch PRD v5

**Date:** 2026-05-04
**Status:** CANONICAL — supersedes v4 (2026-04-29), v3 (2026-04-28), v2 (2026-04-28), and v1 (2026-04-27). All prior versions deprecated. Do not reference any prior version for feature decisions.
**Author:** Product Lead
**Lock authority:** PRD v4 locked decisions (Board Meeting 2026-04-27 + Design Board 2 2026-04-28) + Onboarding Audit 2026-05-04 (12 findings) + Flow Architecture Synthesis 2026-05-04 (Option E + 6 new findings) + 13 Adam-locked decisions (Q1–Q13, 2026-05-04)
**Predecessors:** PR #52 (v1) → PR #53 (v3 + Build Plan v1) → PR #54 (Round 2/3 synthesis + Aria persona + PRD v4 amendments) → PR #55 (PRD v4 canonical) → PR #56 (onboarding audit synthesis) → PR #57 (flow architecture synthesis + Option E) → this v5 consolidation
**Domain:** beamixai.com (all `beamix.tech` references retired). Customer-facing brand name remains **Beamix** — never write "BeamixAI."

> **DEPRECATION NOTICE:** PRD v4, v3, v2, and v1 are superseded in their entirety. All acceptance criteria in prior versions are retired. Do not reopen decisions locked in v4 or earlier. The 23 Board Meeting locked decisions, the 5 contested design decisions from Board 2, and the 13 Adam-locked decisions (Q1–Q13) from 2026-05-04 are all locked in this document and are not subject to reopening.

---

## Table of Contents

1. [Frame 5 v2 Strategic Positioning](#1-frame-5-v2)
2. [Pricing + Tiers](#2-pricing)
3. [Personas — 4 Canonical](#3-personas)
4. [Architecture Overview — Option E Unified /start Flow](#4-architecture)
5. [MVP Feature Scope](#5-features)
   - Tier 0 Infrastructure
   - F1 /scan public
   - F2 Onboarding flow — **REPLACED v5** (now /start unified route)
   - F3 Truth File
   - F4 Billing + Paddle activation — **REPLACED v5** (post-Brief opt-in)
   - F5 /home
   - F6 /inbox
   - F7 MVP agent roster (6 agents)
   - F8 /workspace
   - F9 /scans
   - F10 /competitors
   - F11 /crew
   - F12 Lead Attribution Loop
   - F13 /settings
   - F14 Email infrastructure
   - F15 11 text AI engine coverage
   - F16 2 vertical knowledge graphs
   - F17 Marketplace
   - F18 Incident runbook + rollback + Truth File integrity job
   - F19 Workflow Builder
   - F20 /security public page
   - F21 Scale-tier DPA + agency indemnification clause
   - F22 AI Visibility Cartogram — **Amendment v5**
   - F23 Cycle-Close Bell
   - F24 Brief Re-Reading — quarterly trigger
   - F25 Receipt-That-Prints card
   - F26 Print-Once-As-Gift (Post-MVP)
   - F27 Print-the-Brief button at onboarding end
   - F28 "What Beamix Did NOT Do" Monthly Update line
   - F29 Printable A4 ops card in /settings
   - F30 Brief grounding inline citation — **Amendment v5**
   - F31 Brief binding line at every product page bottom
   - F32 Brief Re-author and Undo Window
   - F33 Team Seats and Role Permissions
   - F34 Customer Data Export (DSAR + Self-Service)
   - F35 Graceful Cancellation and Data Retention — **Amendment v5**
   - F36 Domain Migration Flow
   - F37 /reports — Monthly Update Archive and Review
   - F38 Subscription Pause
   - F39 Competitor Removal and False-Positive Management
   - F40 Multi-Domain Scale Tier — Seat and Domain Model
   - F41 Cmd-K command bar + slash command
   - F42 Trust Center at /trust + SOC 2 Type I — **Amendment v5**
   - F43 Vulnerability disclosure + bug bounty
   - F44 /changelog as canonical surface
   - F45 Compact mode toggle
   - F46 Editorial error pages (404/500/maint/status)
   - F47 State of AI Search 2026
   - F48 Yossi Agency Batch Onboarding (MVP+30) — **NEW**
   - F49 Embeddable Score Badge (MVP+30) — **NEW**
   - F50 Public Dogfooding Scan (built MVP, published MVP+30) — **NEW**
   - F51 Two-Tier Activation Model (MVP) — **NEW**
   - F52 Free Account /home Sample Data Population (MVP) — **NEW**
   - F53 Day-N Free Account Recovery Email Sequence (MVP) — **NEW**
   - F54 Refund Risk Mitigation: Agent-Run Caps (MVP) — **NEW**
6. [Locked Design Decisions from Board 2 (2026-04-28)](#6-locked-design)
7. [User Stories](#7-user-stories)
8. [Success Metrics](#8-success-metrics)
9. [Out of Scope for MVP](#9-out-of-scope)
10. [Risks and Open Product Questions](#10-risks)
11. [Design System Canon — v5 Additions](#11-design-system)
12. [Outstanding Adam-Decisions](#12-outstanding)
13. [Predecessors + Version History](#13-version-history)
14. [Domain Infrastructure Status](#14-domain-infrastructure)

---

## 1. Frame 5 v2 Strategic Positioning

Beamix is not an AI search rank tracker. It is the AI visibility operating layer for SMBs — the first product that closes the loop between "customers are finding me through AI" and "here is the proof, here is what we changed, here is the attributed revenue."

**The wedge:** Every SMB founder has typed their product category into ChatGPT and not seen their business. That is the entry pain. Beamix converts that pain into a scan result (the product demo), then into a paid account, then into weekly evidence that the problem is being solved.

**The moat:** The Brief. Every Beamix account is governed by a founding document the customer personally approved. Every agent action cites it. Every renewal is anchored to the moment the customer stamped their Brief. Competitors can copy the dashboard. They cannot copy the constitutional architecture.

**The flywheel:** Scan → signup → Brief approval → weekly agent work → Monday Digest → Monthly Update PDF forwarded to investor/co-founder → word-of-mouth referral → new scan.

---

## 2. Pricing + Tiers

| Tier | Monthly | Annual | Engines | Seats | Domains |
|------|---------|--------|---------|-------|---------|
| Discover | $79/mo | $63/mo | 3 | 1 | 1 |
| Build | $189/mo | $151/mo | 6 | 2 | 1 |
| Scale | $499/mo | $399/mo | 11 | 5 | 5 included + $49/domain/mo add-on |

**Trial model (v5 update):** Two-tier activation. Free Account (signed up + Brief signed, no agents). Paid Customer (post-Paddle checkout, agents active). Trial clock starts at Paddle checkout. Refund windows: Discover 14 days, Build 14 days, Scale 30 days. Agent-run caps during refund window: Discover 5 runs / Build 10 / Scale 20; unlimited after refund window closes. One-time free scan at /scan preserved.

---

## 3. Personas — 4 Canonical

### Persona A: The B2B SaaS Founder (Marcus)

**Archetype:** Founder or co-founder of a dev tools, vertical SaaS, or infrastructure SaaS company. 10–100 employees. Revenue $500K–$5M ARR.

**Day in the life:** Marcus starts his morning with a Slack scroll. He opens Mixpanel, checks signups and MRR, glances at LinkedIn. His attention budget for any non-core tool is six minutes per week — he has a board deck to finish and two customer calls before lunch. Nobody on his team owns AI visibility. He noticed two months ago that when he typed their product category into ChatGPT, a competitor came up and his product did not. He sent a Slack to his growth hire. Nobody answered definitively.

**Tech sophistication:** High. Fluent in Linear, Vercel, Retool, Notion, Stripe dashboards. Will not write a marketing strategy brief during onboarding. Will approve a draft Beamix writes for him.

**Team:** Marketing (1 generalist), growth (1 paid/SEO hire), product (2–4), engineering (5–15). No dedicated content team. No AI visibility expertise. **Hidden CTO buyer:** Aria, Marcus's co-founder, will read the security architecture before month 3. If Aria laughs at it, Marcus's renewal dies regardless of attribution numbers. The /security public page and cryptographic Trust Architecture are the hidden renewal gates.

**Discovery path:** Founder X/Twitter, Product Hunt, Hacker News, VC portfolio Slacks. Converts on a free scan that shows his competitor in 7 engines and him in 2.

**Tier mapping:**
- **Discover $79** — unlikely. Will see 3-engine limit and immediately want more. Entry test before upgrading.
- **Build $189** — primary Marcus tier. "Put it on the company card" money. Cheaper than one hour with his SEO consultant.
- **Scale $499** — Marcus at 50–100 employees with a Head of Marketing, or after proving the attribution loop works and wanting Workflow Builder.

**Job-to-be-done:** Beamix is the AI visibility hire that never takes a vacation, sends a Monday morning email, and proves via lead attribution when a customer found him through AI. Mental category: automated marketing retainer at $189/mo that replaces what a $3,000/mo agency did badly.

**Renewal anchor:** The Day 14 event-triggered email — "a developer found you on Claude" — is the emotional renewal moment. The Monthly Update is the artifact Marcus forwards to Aria and his board chair. The forwarded PDF is the word-of-mouth lever.

---

### Persona B: The E-Commerce Operator (Dani)

**Archetype:** Owner or head of growth at a direct-to-consumer brand on Shopify. 3–10 employees. Revenue $2M–$10M annual. Supplements, kitchen products, skincare, outdoor gear, specialty food.

**Day in the life:** Dani checks Shopify revenue, ROAS in Meta Ads Manager, skims email. She has a content creator, a paid media buyer, and a part-time SEO freelancer. Meta performance is declining. AI search is the emerging channel she cannot quantify yet. She spends $20,000–$50,000/month on paid combined; if AI can generate 3–5% of what paid generates at a fraction of the cost, she is interested.

**Tech sophistication:** Moderate-high. Comfortable with Shopify, Klaviyo, Triple Whale, GA4. Uses AI for copywriting. Will not configure JSON-LD schema herself.

**Discovery path:** Podcasts (My First Million, Marketing Made Simple), Instagram and TikTok ads for SaaS tools, Shopify community recommendations.

**Tier mapping:**
- **Discover $79** — right entry for smaller operators ($2M–$3M). Upgrades to Build within 60 days if she sees results.
- **Build $189** — primary Dani tier. Long-form Authority Builder (MVP-1.5) is her primary value driver: pillar content written autonomously at $189/mo beats any SEO agency.
- **Scale $499** — Dani at 15-person brand doing $8M+ with a Head of Marketing, or the Shopify Plus operator wanting white-label reports for investor updates.

**Job-to-be-done:** Beamix is Dani's automated AI channel manager — the AI search manager she could never hire as a person — sitting alongside her paid media manager, SEO manager, and social media manager.

**Renewal anchor:** The Lead Attribution Loop. When the monthly update says "Beamix generated 47 qualified sessions from AI engines with an average order value of $92," she renews before reading the rest.

---

### Persona C: The Digital Agency Owner (Yossi)

**Archetype:** Boutique digital agency owner. Tel Aviv. 12 client domains on Scale $499/month. Billing clients ₪9,000–₪15,000/month retainers. Single operator + one part-timer + Beamix as his 5-person growth team.

**Critical requirements identified by simulator:**
- Every client gets full Brief ceremony, full Truth File, full Lead Attribution. No shortcuts per client.
- **Multi-client cockpit:** A single `/dashboard` or `/cockpit` table showing all clients — score delta, /inbox count, agents in error, monthly update status, attribution headline. One scan of one page saves 25 minutes daily.
- **Bulk-approve in /inbox at MVP** (Cmd+A or multi-select within single-client view). Without it, 168 items × 30 seconds = 84 minutes morning routine. Churn at month 4.
- **Per-client white-label config**, not per-account. Each of 12 clients has different brand colors, logo, voice, and agency relationship terms.
- **"Send to your developer"** handoff in the Brief phase is critical — his clients' CTOs place UTM tags, not Yossi.
- **Monthly Update /reports index** showing all 12 clients with per-client J/K nav and Auto-send / Review / Always-edit settings.

**Renewal anchor:** The Workflow Builder full DAG editor at MVP Day 1 + per-client white-label + multi-client cockpit. Without all three, Scale is not worth $499/month.

---

### Persona D: Aria (Marcus's Hidden CTO Co-Founder)

**Archetype:** CTO co-founder at a B2B SaaS company (Marcus's company). Engineering background. Not a daily Beamix user — a one-time procurement-grade evaluator who resurfaces at renewal time. Aria reviews vendor security posture before Marcus's month-3 renewal. If Aria finds gaps, the renewal dies.

**Aria's evaluation criteria:** Sub-processor table with complete columns (controller/processor status, underlying cloud, SOC 2/ISO 27001 per vendor, last-audited-by-Beamix date, real DPA link). Public DPA with liability cap, IP indemnification flowing through Anthropic/OpenAI terms, 48h customer-breach SLA, 30d sub-processor pre-notification, cyber-liability insurance disclosure. Cryptographic primitives named (not gestured at): AES-256-GCM, Argon2id, libsodium, BoringSSL. Bug bounty program live. SOC 2 observation period started. Vulnerability disclosure policy published.

**What Aria is NOT:** A daily user. A persona who cares about onboarding UX or weekly digest copy. Aria reads `/trust`, `/security`, and the DPA — nothing else.

**Why Aria is canonical (4th persona):** The renewal decision belongs to Marcus but the renewal veto belongs to Aria. Every feature on `/trust`, F42, F43, F20 amendment, and the sub-processor table exists because of Aria. She is the hidden gate. Her sign-off converts a satisfied Marcus into a multi-year customer.

**Surface:** `/trust`, `/security`, `/trust/dpa`, `/trust/compliance`, `/trust/sub-processors`. Never /home, never /inbox, never /crew.

---

### Shared traits across all personas

| Trait | How it shapes Beamix |
|---|---|
| Attention budget: 6–10 min/week | Email is the product. Dashboard is the backup. |
| Trust gradient: cautious with autonomy | Draft-then-approve by default. Auto-approve only after pattern established. |
| Private by default — unanimous across all three | Monthly Update permalinks PRIVATE by default. No exceptions. |
| Proof-over-promise | Lead Attribution Loop is the renewal mechanism, not the score. |
| Tech-native, not tech-expert | No jargon in the UI. "Schema" = "how AI reads your site." |
| Already paying for SaaS | $189/mo is not a barrier. ROI clarity is. |
| Buys on word-of-mouth | Month 2 referral is more important than Month 1 upgrade. |

---

## 4. Architecture Overview — Option E Unified /start Flow

**Decision locked:** Q12 + Q13 (Adam, 2026-05-04). Option E ships at MVP launch.

### The architectural principle

The "scan vs onboarding" question in PRD v4 was a false binary. The right answer: both, with one continuous narrative once the user commits. Public `/scan` is preserved as a peer marketing surface (viral wedge, anonymous, shareable). The signup-and-onboarding experience is absorbed into one unified `/start` route with a phase-based state machine.

This is the architecture that makes Q3 (Brief grounding preview during Brief co-author) and Q9 (Google OAuth primary) and Q6 (Paddle inline, not a redirect) structurally coherent. Without Option E, these three decisions are hacks bolted onto a disconnected flow. With Option E, they are natural phases in one continuous narrative.

**Pixel-level detail for the /start flow lives in:** `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md`

---

### The two surfaces

**`/scan` (public, unauthenticated — unchanged)**
- Standalone scan tool. Anonymous visitor enters domain, gets scan results.
- Shareable permalinks at `/scan/[scan_id]` (private by default; sharing is one explicit click).
- "Claim this scan" CTA on public permalinks → routes to `/start?phase=results&scan_id=[id]`
- Free scan is its own entry point and viral wedge. It is NOT a step in /start.
- Public `/scan` preserves the distribution flywheel (Sarah tweets her result; visitor lands, scans their own domain, enters /start).

**`/start` (unified onboarding state machine — new in v5)**
- Absorbs all entry paths: anonymous-scan-first AND direct-signup.
- Phase state machine with 9 phases. Phases are bookmarked in URL state: `/start?phase=[phase-slug]`.
- Cream-paper editorial register holds across all phases.
- Data integrity contract: `scan_id` → `user_id` → `paddle_subscription_id` → `business_id` → `brief_id` → `truth_file_id`. Each created at the phase where it becomes known.
- On refresh or return visit: state is restored from URL + session. Customer does not re-enter phases they completed.

---

### The 9 phases of /start

**Phase 0 — `enter-url`** (only for direct-signup path; skipped if `?scan_id=` present)
- Single domain field, auto-submit on paste.
- Auto-runs scan in background after submit. Transitions to Phase 1.

**Phase 1 — `scanning`**
- 30–90s wait state. Engagement copy. Agent monogram preview.
- Cream paper register begins here (or earlier for direct-signup).
- Progress indicator: dots, not a percentage bar.

**Phase 2 — `results`**
- Scan results render: score (0–100), AI Visibility Cartogram (see F22), citations, gap summary.
- 14-day money-back guarantee surfaced in footer ("All plans include a 14-day money-back guarantee."). Scale is 30-day — copy adjusts at tier selection.
- Signup-overlay slides up after ~10 seconds of dwell time. Headline: "Want our agents to fix this?"
- "Skip — just send me the scan" → email scan results PDF + enter cold-lead Resend nurture sequence, exit flow.

**Phase 3 — `signup-overlay`**
- Google OAuth as primary CTA (Q9 lock). Email+password as secondary.
- On success: `user_id` created. Flow continues to Phase 4.

**Phase 4 — `paddle-inline`** (Paddle modal, no redirect — Q6 lock)
- Paddle modal appears as inline overlay within `/start`. No redirect to external Paddle URL.
- Pre-selects Discover ($79) by default. "Choose a different plan" link expands tier picker.
- Trial clock starts here (Q4 + Q7 lock: activation = first /inbox approval within 7 days of this moment).
- On completion: `paddle_subscription_id` created. Customer is now a **Paid Customer** (see F51).
- On dismiss without completing: customer enters **Free Account** state (see F51). Paddle overlay is available again from /home "Activate agents" CTA.

**Phase 5 — `vertical-confirm`** (current Step 1 in v4)
- Confidence indicator: "92% sure you're B2B SaaS."
- One-click confirm or change.
- `business_id` created on confirmation.

**Phase 6 — `brief-co-author`** (current Step 2 in v4, enhanced per Q3)
- Three Claims pre-filled from scan data via Claude (customer reviews + edits, not types from blank).
- Right-column preview: shows what an /inbox item will look like with inline Brief grounding citation (`Authorized by your Brief: "[clause]" — clause N · Edit Brief →`). Teaches the architectural commitment in-context.
- Fraunces clauses on cream paper. Heebo 300 italic loaded if `[lang="he"]` (Q2 lock).
- "Send setup instructions to your developer" button: vertical-aware (SaaS = UTM-first; e-commerce = Twilio-first).

**Phase 7 — `brief-signing`** (current Step 3 in v4)
- Seal stamps in 540ms using stamping easing curve. "— Beamix" in 300ms opacity fade.
- Arc's "Hand" dot present (1px ink-1 dot, fades in at t=120ms, fades out with seal-fade).
- "Print this Brief →" link appears post-Seal (F27).
- "Security & DPA" footer link (Q5 lock — small, 13px ink-3, below signature area. Link to /trust).
- 14-day money-back guarantee footer line (small, 13px ink-3).
- `brief_id` created on Seal landing.
- 10-minute undo window opens (F32).

**Phase 8 — `truth-file`** (current Step 4 in v4)
- Vertical-conditional fields: `hours` and `service_area` fields are HIDDEN for SaaS vertical (O-18 fix).
- Three Claims already pre-filled from Phase 6 — customer reviews and edits, not enters from blank.
- `truth_file_id` created on completion.

**Phase 9 — `/home`** (post-onboarding, first dashboard visit)
- If Paid Customer: standard /home with agents active. Day-1 auto-trigger pipeline fires (scan → rules engine → first 2-3 agent runs).
- If Free Account: /home with sample data populated (F52). "Activate agents" banner prominent.
- Activation gate: first /inbox approval starts the 7-day activation window (Q4 + Q7 lock).

---

### Two-tier activation model (Q6 lock — see F51 for full spec)

| State | How customer enters | What they can do |
|-------|---------------------|-----------------|
| **Free Account** | Completed Phase 7 (Brief signed) but dismissed Paddle modal | View /home with sample data. See real scan results. No agent runs. |
| **Paid Customer** | Completed Phase 4 (Paddle checkout) | All agents active. Trial clock running. Full product. |

The Paddle checkout is NOT forced during /start. Customer can dismiss the Paddle modal and continue to Brief signing as a Free Account. Conversion happens when the customer is ready — from /home "Activate agents" CTA.

---

### Data carried across phases (integrity contract)

| Entity | Created at phase | Carried forward to |
|--------|-----------------|-------------------|
| `scan_id` | Phase 0 or 1 | All subsequent phases |
| `user_id` | Phase 3 | All subsequent phases |
| `paddle_subscription_id` | Phase 4 (if completed) | /home, billing, agent runs |
| `business_id` | Phase 5 | Phase 6, 7, 8, /home |
| `brief_id` | Phase 7 | Phase 8, all agent runs |
| `truth_file_id` | Phase 8 | All agent runs |

---

### Pre-build validations (from architectural synthesis — 5 items to verify before locking final build)

1. 5-customer guerrilla test of Option A vs Option E mocks — confirm conversion hypothesis.
2. Paddle inline overlay reliability across browsers — Safari iOS, Chrome Android, low-end devices.
3. Map Yossi's path through Option E for client #2+ — confirm Phase 0.5 branch needed or not.
4. Pixel-spec the Phase 1→2 transition (scan completion → results reveal) — most consequential motion moment.
5. Confirm "claim this scan" pattern on public permalinks routes correctly to `/start?phase=results&scan_id=[id]`.

---

## 5. MVP Feature Scope

### Priority key

- **MVP** — must ship at launch
- **MVP+30** — ship within 30 days of launch
- **MVP+90** — ship at 90 days post-launch
- **MVP-1.5** — ship within 6–8 weeks of launch
- **Year 1** — ships post-traction
- **Post-MVP** — explicitly triggered by milestone (e.g., month-6 anniversary)

---

### Tier 0 Infrastructure

The following infrastructure must be built and verified before any feature build begins.

1. **Canonical type files** (`apps/web/types/`): `EvidenceCard.ts`, `Brief.ts`, `TruthFile.ts`, `ProvenanceEnvelope.ts`, `AgentRunState.ts`
2. **Supabase schema migration** (all Tier 0 tables + RLS): `briefs`, `truth_files`, `artifact_ledger`, `margin_notes`, `agent_memory` (pgvector), `provenance_steps`, `agent_run_state`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `workflows`, `workflow_nodes`, `workflow_edges`, `workflow_versions`
3. **Inngest free-tier setup** + `runAgent` skeleton + smoke test + free-tier usage telemetry dashboard
4. **Supabase Realtime channel** + client hook (`agent:runs:{customer_id}`) + polling fallback at 10s
5. **Pre-publication validator service** (separate process; cryptographic signed-token: 60s TTL, draft-hash bound)
6. **Truth File integrity-hash nightly job** (Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h)
7. **Build-time pipeline:** opentype.js Fraunces signature extractor + per-agent Rough.js monogram generator (deterministic seed-per-agent UUID) + per-customer seal generator (Inngest job at signup)
8. **Cost ceiling instrumentation** (per-customer monthly scan-cost ledger + alarm)
9. **Resend setup** + send-volume tier + bounce handler + DKIM/SPF/DMARC on notify.beamixai.com
10. **DPA + /security page + privacy posture documentation**
11. **`brief_clause_ref` field on provenance envelope** — every agent action stores the authorizing Brief clause reference at creation time
12. **Brief clause snapshot** stored alongside each agent action at creation time
13. **NEW (v5):** Google OAuth provider configured in Supabase Auth (Q9 lock — primary auth method)
14. **NEW (v5):** `/start` route + phase state machine (URL-bookmarked phases, session restoration on refresh)
15. **NEW (v5):** `free_account_state` column on `subscriptions` table — distinguishes Free Account (post-Brief, pre-Paddle) from Paid Customer
16. **NEW (v5):** `activation_event_at` column on `subscriptions` — set on first /inbox approval. Used for 7-day activation window calculation.
17. **NEW (v5):** `refund_window_runs_used` counter on `subscriptions` — tracks agent runs consumed during refund window for F54 cap enforcement
18. **NEW (v5):** handle_new_user trigger smoke test — deploy-time check creates test user in staging post-migration, verifies `user_profiles` + `subscriptions` + `notification_preferences` rows exist

---

### Feature 1: /scan public (acquisition surface)

**What it does:** Unauthenticated visitor enters their domain. Beamix runs a scan against 11 text AI engines using top 10 queries for their vertical. A 15–17 second animated reveal shows AI visibility score (0–100), which engines mention them, which mention competitors, and 3 specific gaps. Public permalink is generated (private by default — sharing requires one explicit click). CTA: "Fix this — start free." A Trust File integrity-hash nightly job runs on all stored scan results (cross-references F18). Lead attribution claims on this surface state "calls + UTM-attributed clicks" — the phrase "form submissions" does NOT appear in any copy until the customer-site JS snippet ships at MVP-1.5.

**Amendment v5 (2026-05-04):** /scan stays exactly as-is — public, anonymous, shareable. The signed-up flow no longer lives at /scan. Customers who click "Fix this — start free" are routed to `/start` (Phase 2 or Phase 3 depending on path). Customers who click "Claim this scan" on a public permalink are routed to `/start?phase=results&scan_id=[id]`. The /scan route itself is unchanged.

**Why MVP:** Primary acquisition channel. Every referral drives to this page. The scan result IS the product demo.

**Changes from v4:**
- Engine abbreviations: "AI" → "AO" (Google AI Overviews). All 11 abbreviations legibility-tested at 11px.
- AI Visibility Cartogram (F22) renders on /scans/[scan_id] detail page after customer claims scan.
- 14-day money-back guarantee surfaced below scan results (before signup CTA). Scale 30-day shown if Scale is selected.
- "Claim this scan" CTA on public permalinks routes to `/start?phase=results&scan_id=[id]` (Option E integration).

**Acceptance criteria:**
- [ ] Visitor enters a domain and clicks Scan — completes in under 20 seconds
- [ ] Score (0–100) displays with delta vs vertical benchmark ("below average for B2B SaaS")
- [ ] At least 3 specific engine citations shown
- [ ] At least 2 competitor citations shown
- [ ] Permalink generated and private by default — sharing requires one explicit click ("Generate share link")
- [ ] "Start free" CTA routes to `/start` (Phase 0 or Phase 2 with scan_id)
- [ ] "Claim this scan" CTA on public permalinks routes to `/start?phase=results&scan_id=[id]`
- [ ] Two-column tier picker below scan results: Discover ($79) vs Build ($189). Scale not shown at /scan.
- [ ] 14-day money-back guarantee visible below tier picker (plain text, 13px ink-3)
- [ ] Lead attribution copy reads "calls + UTM-attributed clicks" — no mention of "form submissions"
- [ ] Cream-paper aesthetic background, Fraunces accent, stamp/seal motif
- [ ] Mobile-responsive, loads in <3s on 4G
- [ ] `X-Robots-Tag: noindex, nofollow` on all private permalink routes; scan result public page indexable
- [ ] Engine abbreviations: "AI" renamed to "AO". All 11 tested at 11px before launch.

**Priority: MVP**

---

### Feature 2: Onboarding flow — DEPRECATED (v4 spec)

**DEPRECATION NOTICE (v5):** The 4-step post-Paddle onboarding described in PRD v4 Feature 2 is DEPRECATED. It is replaced by the unified `/start` route with 9 phases. See §4 Architecture Overview for the full spec. For pixel-level detail, see `docs/08-agents_work/2026-05-04-OPTION-E-START-FLOW-SPEC.md`.

---

### Feature 2 v5: Onboarding — unified /start route

**What it does:** The unified `/start` route absorbs all entry paths into one continuous experience. 9 phases: `enter-url → scanning → results → signup-overlay → paddle-inline → vertical-confirm → brief-co-author → brief-signing → truth-file`. Completes at /home.

See §4 Architecture Overview for full phase-by-phase spec.

**Key v5 changes from v4 F2:**
- Paddle is NOT in the onboarding ceremony. It is an inline modal in Phase 4 that can be dismissed. Customer can proceed to Brief signing as a Free Account.
- Google OAuth is the primary auth method (Q9 lock). Email+password is secondary.
- Three Claims in Phase 6 (brief-co-author) are pre-filled from scan data via Claude. Customer reviews and edits — does not type from blank. This requires `scan_id` carry-through from Phase 1.
- Right-column preview in Phase 6 shows what an /inbox item looks like with Brief grounding citation. Teaches the architectural commitment in-context (Q3 lock).
- `hours` and `service_area` fields in Phase 8 (truth-file) are HIDDEN for SaaS-classified customers. Shown for e-commerce and local services only (O-18 fix).
- "Security & DPA" footer link in Phase 7 (brief-signing): small, 13px ink-3, links to /trust (Q5 lock).
- 14-day money-back guarantee footer line in Phase 7 (O-14 fix).
- Skip-cinema option for customers with ≥1 prior signed Brief (Yossi's repeat clients, O-19 fix).
- Brief consistency check runs at Phase 7 (pre-Seal): Claude Haiku checks for contradictory clauses. If contradictions detected, surfaced before signing (O-12 fix).
- Dual-tab Brief write protection: optimistic 90-second tab-lock prevents silent data corruption. If a second tab opens Phase 6, first tab shows "another tab is editing — return there or take over" (O-11 fix).

**Seal ceremony (unchanged from v4):** 540ms stamping curve (`cubic-bezier(0.34, 0.0, 0.0, 1.0)` or equivalent). "— Beamix" in 300ms opacity fade. Arc's "Hand" dot (1px ink-1, fades in at t=120ms, fades out with seal-fade). No pen-stroke animation. No letter-by-letter sequence.

**Acceptance criteria:**
- [ ] Phase 3 (signup-overlay): Google OAuth is the primary CTA. Email+password is secondary option.
- [ ] Phase 4 (paddle-inline): Paddle appears as inline modal within /start. No external Paddle redirect. Modal is dismissable — customer continues as Free Account if dismissed.
- [ ] Phase 5 (vertical-confirm): vertical classification shown with confidence indicator. One-click confirm or change.
- [ ] Phase 6 (brief-co-author): Three Claims pre-filled from scan data. Customer reviews + edits. Right-column preview shows /inbox item with inline Brief grounding citation.
- [ ] Phase 6: `hours` and `service_area` fields absent for SaaS-classified customers.
- [ ] Phase 6: Heebo 300 italic loaded and active on `[lang="he"]` pages as Fraunces companion font.
- [ ] Phase 6: "Send setup instructions to your developer" button present. Vertical-aware (SaaS = UTM first; e-commerce = Twilio first).
- [ ] Phase 7 (brief-signing): Brief consistency check runs before Seal. Contradictions surfaced to customer.
- [ ] Phase 7: Seal stamps in 540ms with stamping curve. "— Beamix" in 300ms opacity fade. Arc's "Hand" dot present.
- [ ] Phase 7: "Print this Brief →" link appears post-Seal (F27 spec applies).
- [ ] Phase 7: "Security & DPA" footer link visible (13px ink-3, links to /trust).
- [ ] Phase 7: 14-day money-back guarantee footer line visible (13px ink-3).
- [ ] Phase 7: 10-minute undo window opens after Seal lands (F32 spec applies).
- [ ] Phase 8 (truth-file): `hours` and `service_area` fields hidden for SaaS customers.
- [ ] Phase 8: Three Claims shown as pre-filled editable chips (not blank fields).
- [ ] Skip-cinema option visible for customers who have ≥1 prior signed Brief. Skips Phases 0–5 (scan cinema), enters at Phase 6 with pre-populated data from prior Brief as starting point.
- [ ] Dual-tab lock: if Phase 6 brief-co-author is open in two tabs, second tab shows "another session is editing — return there or take over."
- [ ] Flow is bookmarkable: each phase has URL state `/start?phase=[slug]`. Refresh restores to same phase.
- [ ] On completion as Paid Customer: first agent run queued automatically within 5 minutes.
- [ ] On completion as Free Account: /home shows sample data per F52.
- [ ] Onboarding completes in under 4 minutes for median Paid Customer path (Phases 3–8).

**Dependencies:** Vertical classification, Brief template (2 verticals at launch), Seal-draw animation component, Truth File schema (F3), F27, F51, F52, Google OAuth in Supabase Auth

**Priority: MVP**

---

### Feature 3: Truth File

*(No changes from v4. Full spec preserved.)*

**What it does:** A structured per-customer document storing authoritative facts about their business. Zod `discriminatedUnion` keyed by `vertical_id`. Single Postgres row + JSONB. Every agent action cites the Truth File. Agents cannot publish factual claims that contradict the Truth File.

**Base schema fields (all verticals):** `business_name`, `domain`, `vertical_id`, `voice_words` (array, ≤8), `never_say` (array), `prohibited_claims` (array), `contact_email`, `contact_phone` (optional), `content_tone` (enum), `competitors` (array, ≤10).

**SaaS vertical-extension:** `integrations`, `pricing_model`, `target_company_size`, `claims_to_repeat` (≤5), `schema_type` = SoftwareApplication. `hours` and `service_area` fields NOT present.

**E-commerce vertical-extension:** `product_categories`, `shipping_regions`, `return_policy`, `price_range`, `schema_type` = Product + Offer, `allergen_claims` (optional, auto-escalates to manual review).

**Acceptance criteria:**
- [ ] Truth File stores as single Postgres row with JSONB for vertical-extension fields
- [ ] Zod schema uses `discriminatedUnion` keyed by `vertical_id`
- [ ] SaaS Truth File schema does NOT include `hours` or `service_area` fields
- [ ] E-commerce Truth File schema does NOT include `integrations` or `pricing_model` fields
- [ ] Every agent pre-publication check includes Truth File validation
- [ ] Customer can view, edit, and add to Truth File in `/settings → Business Facts`
- [ ] Customer can see which agent actions referenced which Truth File fields
- [ ] Truth File exported in JSON Schema-conformant format on DSAR
- [ ] Agents are hard-blocked from publishing claims in `prohibited_claims` array
- [ ] Per-vertical schema versioning: `schema_version` field on each TF JSONB; migrations non-destructive

**Priority: MVP (must ship before any agent goes live)**

---

### Feature 4: Billing + Paddle activation — DEPRECATED (v4 spec)

**DEPRECATION NOTICE (v5):** The v4 spec for Feature 4 (Pre-publication validation) is unchanged. The BILLING section is amended below. Feature 4 in v4 described pre-publication validation, not billing directly — the billing story was embedded in F2. In v5, billing is re-architected as F51 (Two-Tier Activation Model) and F54 (Refund Risk Mitigation).

---

### Feature 4: Pre-publication validation + review-debt counter

*(Spec unchanged from v4. Amendment below.)*

**What it does:** Before any agent publishes, a validation step runs through a separate validator service. Five mandatory rules: (1) Claim verification against Truth File, (2) Brand Voice Fingerprint match, (3) Prohibited-term check, (4) Vertical-specific rules, (5) Sensitive-topic classifier. Validator binding uses a cryptographic signed token (60s TTL, bound to draft hash). Even on Full-auto mode, `uncertain` outcome → /inbox.

**Amendment v5 (2026-05-04) — Billing placement:**
Pre-publication validation runs only for Paid Customers. Free Accounts (post-Brief, pre-Paddle) do not trigger agent runs and therefore do not reach the validator. The validator's relationship to Paddle is: `subscription.status = 'active'` is checked before any agent job dispatch. Free Account state means `subscription.status = 'free_account'` (no Paddle subscription yet) — agent dispatch is blocked.

**Acceptance criteria:**
- [ ] Every agent action producing customer-facing content routes through `ctx.validate(draft)` BEFORE `ctx.propose()`
- [ ] Validator is a separate server process. Agents have no direct write access to L4 site integration.
- [ ] `validate()` returns a signed token (60s TTL). `propose()` requires this token. Hash mismatch = propose rejected.
- [ ] First-party agents run against the same validator sandbox as future third-party agents
- [ ] `uncertain` validation outcome routes to /inbox regardless of customer's autonomy setting
- [ ] Validator unavailable for >15 minutes → all publishing suspended → /inbox banner "Beamix is in safe mode"
- [ ] Brand Voice Fingerprint computed at onboarding. Cosine threshold: 0.85 for content, 0.75 for schema/FAQ.
- [ ] Auto-revise: validator calls `ctx.revise(draft, failures)` once. If revised draft passes, propose. If not, hard block.
- [ ] Validation failure reason shown to customer in plain English
- [ ] Review-debt counter visible at top of /inbox and in /home "Inbox pointer line"
- [ ] Per-agent autonomy levels: Always ask / Ask for new types auto-approve repeats (after 10) / Full-auto with weekly summary (after 30)
- [ ] Agent dispatch blocked if `subscription.status` is `'free_account'` — no validator calls for Free Account state

**Priority: MVP**

---

### Feature 5: /home — the daily destination

*(Spec unchanged from v4. Amendment below for Free Account state.)*

**What it does:** Primary product surface. 8 locked sections in vertical scroll.

**Tier badge canonical strings (no variation):**
- **Discover:** "Discover · 3 engines · 4 agents"
- **Build:** "Build · 6 engines · 6 agents"
- **Scale:** "Scale · 11 engines · 6 agents (+ 12 locked)"

**Section breakdown:**
1. **Hero score block** — AI visibility score (0–100) with Activity Ring, 12-week sparkline (full state at t=0), delta vs last week, 1-line plain-English diagnosis
2. **Top 3 fixes ready** — RecommendationCards, "Run all — N credits" CTA
3. **Inbox pointer line** — count of items awaiting review. When zero: "Nothing needs your attention."
4. **KPI cards row** — Mentions / Citations / Credits used / Top competitor delta
5. **Score trend chart** — 12-week line, hover tooltips. No path-draw entrance animation.
6. **Per-engine performance strip** — engine pills (3 for Discover / 11 for Build+)
7. **Recent activity feed** — last 8 events
8. **What's coming up footer** — next scheduled scan, next digest send, next billing date

**Amendment v5 (2026-05-04) — Free Account state on /home:**
When customer is in Free Account state (post-Brief, pre-Paddle), /home renders with sample data per F52. A persistent banner appears at the top of /home: "Beamix is ready — activate your agents to start improving your AI visibility." With a prominent "Activate agents →" CTA that opens the Paddle inline modal. The Activate banner uses a distinct token treatment (see Design System Canon §11). Real scan data (score, cartogram, per-engine strip) is shown using actual scan results from Phase 1–2. Agent activity feed and /inbox items are populated with sample data (marked with a subtle "Sample" label visible only to the Free Account customer, not on shared artifacts).

**Acceptance criteria:**
- [ ] Tier badge renders exact canonical string
- [ ] Activity Ring renders at full geometry at t=0 — no ring-draw entrance animation
- [ ] Score renders at final value at t=0 on returning sessions. count-up preserved for first-scan-ever only.
- [ ] Score sparkline renders at full state at t=0
- [ ] Lead Attribution empty state is vertical-aware
- [ ] Margin column absent from home Receipts/activity feed rows
- [ ] Cycle-Close Bell fires per F23 specification
- [ ] Receipt-That-Prints card renders per F25 specification
- [ ] Brief binding line present per F31 specification — 13px Fraunces 300 italic, ink-3, centered, anchored 24px above footer chrome
- [ ] Page loads in <2s LCP on desktop, <3.5s on mobile
- [ ] Bottom mobile nav: /home · /inbox · /scans · /crew
- [ ] Free Account banner: "Beamix is ready — activate your agents to start improving your AI visibility." with "Activate agents →" CTA
- [ ] Free Account banner absent for Paid Customers
- [ ] Free Account /home shows real scan data (actual score, real per-engine results)
- [ ] Free Account /home shows sample agent data per F52 (marked "Sample" to Free Account customer)

**Priority: MVP**

---

### Feature 6: /inbox — consent surface

*(Spec unchanged from v4.)*

**What it does:** 3-pane Linear-pattern review queue. Left rail: filters. Center: item list with J/K navigation and multi-select. Right: content preview with sticky ActionBar (Approve `A` / Reject `X` / Request Changes `R`). Tabs: Pending / Drafts / Live. Max-width: 1280px.

**Acceptance criteria:**
- [ ] Max-width of /inbox is 1280px
- [ ] J/K keyboard navigation works through item list
- [ ] Shift-click selects a range. Cmd+A selects all visible items in current filter view.
- [ ] "Approve N items" button on multi-select. Bulk-approve does NOT trigger Seal-draw animation.
- [ ] Seal-draw fires on individual approval click ONLY — never on hover
- [ ] Brief grounding citation visible in /inbox row detail per F30 specification
- [ ] Review-debt counter visible at top of inbox and echoed on /home
- [ ] Each item shows: agent name, action type, before/after diff, Truth File references, provenance envelope fields
- [ ] "Request Changes" opens plain-text note field
- [ ] Empty state: Rough.js illustration + "Inbox zero. Beamix is working."
- [ ] Cross-client bulk-approve: NOT in MVP (deferred to MVP-1.5)
- [ ] Brief binding line present per F31 specification
- [ ] Sample /inbox items (F52) marked "Sample" visible to Free Account customer in appropriate treatment

**Priority: MVP**

---

### Feature 7: MVP agent roster (6 agents)

*(Spec unchanged from v4.)*

**Voice Canon Rule (all agents):** Agents named on in-product surfaces (/home, /crew, /workspace, /inbox). "Beamix" on all external surfaces. Onboarding seal signs "— Beamix." No agent names in emails or PDFs. Model B — non-negotiable.

**Deterministic seed-per-agent:** Each agent's Rough.js monogram uses `seed(agentUuid) → path`. Same fingerprint across all surfaces for the agent's lifetime.

#### Agent 1 — Schema Doctor (MVP)
Audits and repairs JSON-LD structured data. Generates `llms.txt` manifest. SaaS: SoftwareApplication schema. E-commerce: Product + Offer schema.

#### Agent 2 — Citation Fixer (MVP)
Identifies 3–5 pages most likely to be cited by AI engines. Adds quotable-passage blocks.

#### Agent 3 — FAQ Agent (MVP)
Generates 8–12 FAQ entries per customer based on vertical KG query patterns and Truth File.

#### Agent 4 — Competitor Watch (MVP, gated at Build+ tier)
Monitors citation patterns of up to 5 competitors across all 11 engines.

#### Agent 5 — Trust File Auditor (MVP)
Weekly consistency checks. Catches hallucinations. Surfaces conflicts to /inbox only when discrepancy found.

#### Agent 6 — Reporter (MVP)
Generates Monday Digest and Monthly Update. External surfaces signed "— Beamix."

**Agents deferred:** Brand Voice Guard, Long-form Authority Builder (MVP-1.5). Content Refresher, Trend Spotter, Citation Predictor, Local SEO Specialist (Year 1).

**Priority: MVP**

---

### Feature 8: /workspace — agent execution viewer

*(Spec unchanged from v4.)*

**What it does:** Real-time agent execution view. Vertical step list with live status. Execution-as-narration column replaces walking figure (Board 2 lock).

**Acceptance criteria:**
- [ ] /workspace accessible to all tiers including Discover
- [ ] Step list subscribes to `agent:runs:{customer_id}` Supabase Realtime channel. Polls at 10s on fail.
- [ ] Walking figure animation absent. Execution-as-narration column present.
- [ ] Narration pushes one plain-English sentence per executing node.
- [ ] Each step shows: tool name, target URL or field, status, duration
- [ ] Static step-verb-noun summary per step — no microcopy-rotate cross-fade carousel
- [ ] Customer can view past /workspace sessions
- [ ] Failed runs show which step failed, why, and rollback action taken
- [ ] Brief grounding citation visible per F30 specification on step outputs
- [ ] Brief binding line present per F31 specification

**Priority: MVP**

---

### Feature 9: /scans — historical record

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] All Scans tab: reverse-chronological, last 90 days default
- [ ] Completed Items tab: agent-completed actions with before/after state and "Rollback" button
- [ ] Per-Engine tab: per-engine score history — single 1.5px brand-blue stroke, no gradient
- [ ] 4 lens pills: Done / Found / Researched / Changed
- [ ] Margin column absent from all /scans rows
- [ ] Engine micro-strip (56px sparkbar) replaces 11 colored dots per row
- [ ] "Share this scan" generates a public URL on demand (private by default)
- [ ] AI Visibility Cartogram renders on /scans/[scan_id] detail page per F22 specification
- [ ] Each scan row links to the /workspace session for that scan
- [ ] Brief binding line present per F31 specification

**Priority: MVP**

---

### Feature 10: /competitors — intelligence surface

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] Table shows up to 10 competitors
- [ ] Rivalry Strip opens as right-side panel on row click
- [ ] Rivalry Strip dual-sparkline: both lines render simultaneously at t=0, no stagger, no path-draw
- [ ] Customer sparkline: 1.5px brand-blue. Competitor sparkline: ink-2 at 40%.
- [ ] Margin column absent
- [ ] Gated at Build ($189) and Scale ($499) — Discover sees blurred Rivalry Strip + upgrade CTA
- [ ] Pre-populated competitors display "Beamix detected" badge
- [ ] Brief binding line present per F31 specification

**Priority: MVP (gated at Build+)**

---

### Feature 11: /crew — power-user customization

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] Default rendering is Stripe-style table: Agent / State / This week / Last action / Success rate
- [ ] Monogram column shows 16×16 deterministic-seed Rough.js mark per agent
- [ ] 2-letter monograms: SD, CF, FA, CW, TF, RP
- [ ] Size-conditional rendering: <16px = color disc; 16–32px = 2-letter monogram; >48px = 2-letter + name
- [ ] 18 agent colors locked and tested at 12px on cream paper before MVP launch
- [ ] Row-expand shows: autonomy level selector, custom instructions (500-char), schedule override, manual trigger, last 10 actions
- [ ] 6 active agent rows + 5 "Coming soon" rows
- [ ] Scale customers see `+ New Workflow` button (F19). Build sees button but clicking opens upgrade modal.
- [ ] Brief binding line present per F31 specification

**Priority: MVP**

---

### Feature 12: Lead Attribution Loop

*(Spec unchanged from v4. Cross-reference: Twilio number provisioning trigger fires at Phase 4 Paddle checkout completion — the paid-activation moment. Free Account customers do not receive Twilio numbers until Paddle checkout completes.)*

**Acceptance criteria:**
- [ ] Twilio number provisioned within 2 minutes of Paddle checkout completion (not Brief signing — Paid Customer state required)
- [ ] UTM-tagged URL auto-generated and visible in /settings → Lead Attribution tab
- [ ] Phase 6 (brief-co-author) shows UTM panel first for SaaS-classified customers, Twilio-first for e-commerce
- [ ] "Send to developer" button sends plaintext snippet within 60 seconds
- [ ] 72-hour verification check: reminder email fires if neither Twilio nor UTM detected
- [ ] All customer-facing copy says "calls + UTM-attributed clicks" — not "form submissions"
- [ ] Event-triggered emails fire within 5 minutes of trigger event
- [ ] Monday Digest includes "this week: N attributed calls/clicks" line when data available
- [ ] Monthly Update PDF includes lead-attribution headline as opening line
- [ ] KPI card "Attributed Calls" in /home shows call count + delta

**Priority: MVP**

---

### Feature 13: /settings

*(Spec unchanged from v4.)*

**Tabs:** Profile · Billing · Notifications · Business Facts (Truth File) · Lead Attribution · Brief · Phone numbers · Per-client white-label (Scale only) · Print operations summary · Privacy & Data

**Acceptance criteria:**
- [ ] Per-client white-label config accessible from client-switcher context
- [ ] "Powered by Beamix" footer toggleable per-client (default ON). Scale-only.
- [ ] Truth File editor shows only vertical-appropriate fields
- [ ] Brief tab shows current Brief text + chip editors + "Regenerate Brief" button
- [ ] Billing tab links to Paddle customer portal
- [ ] Cancel flow: one click, no dark patterns
- [ ] "Print operations summary" sub-page present per F29 specification
- [ ] Brief binding line present per F31 specification

**Priority: MVP**

---

### Feature 14: Email infrastructure

*(Spec unchanged from v4, with email count update.)*

**What it does:** Three categories of email. Day 1-6 silence cadence. Monthly Update PDF. Day-N Free Account recovery sequence (F53 — new in v5, adds 3 email templates).

**Template count: 15 (v4) → 18 (v5, adding 3 Free Account recovery emails per F53).**

**Acceptance criteria:**
- [ ] Day 0 T+10min welcome email fires within 15 minutes of Phase 8 completion (truth-file complete)
- [ ] Day 2 email fires only when first /inbox item is created AND customer has not logged in that day
- [ ] Day 4 email: weekend-skip rule applies
- [ ] Day 5 email: only fires if Day 4 not opened AND customer has not logged in that day
- [ ] Monday Digest delivers plain text. Subject: "Beamix · [date range]: [top metric]"
- [ ] Monthly Update PDF Page 2 is AI Visibility Cartogram per F22 specification
- [ ] Monthly Update PDF Page 6 includes "What Beamix Did NOT Do" line per F28 specification
- [ ] Monthly Update PDF attachment included regardless of permalink privacy setting
- [ ] Event-triggered attribution emails fire within 5 minutes
- [ ] All emails signed "— Beamix" (Voice Canon Model B)
- [ ] "Powered by Beamix" Geist Mono 9pt footer in white-label emails
- [ ] All emails include one-click unsubscribe
- [ ] Day 1-6 cadence default-ON for weeks 1–4
- [ ] 3 Free Account recovery email templates present per F53 specification

**Priority: MVP**

---

### Feature 15: 11 text AI engine coverage

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] All 11 engines return citation data within 24 hours of scan trigger
- [ ] Scan failures retried automatically within 2 hours
- [ ] Citation envelope minimum fields: surface, query, brand_mentions, competitor_mentions, is_mentioned, citation_context
- [ ] Per-engine score (0–100) calculated and displayed in /home per-engine strip
- [ ] Discover tier: 3 engines. Remaining 8 locked/grayed with upgrade CTA.
- [ ] Engine abbreviations: "AI" renamed "AO", all 11 tested at 11px before launch
- [ ] Cost ceiling instrumentation per-account

**Priority: MVP**

---

### Feature 16: 2 vertical knowledge graphs (SaaS + e-commerce)

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] Domain detection classifies signups into SaaS or e-commerce with ≥80% accuracy
- [ ] Competitor set pre-populated with 5 domain-specific competitors on first scan
- [ ] Brief template uses vertical-appropriate language
- [ ] FAQ Agent generates vertical-specific questions
- [ ] Schema Doctor emits correct schema type

**Priority: MVP**

---

### Feature 17: Marketplace

*(Spec unchanged from v4. Browse + install Beamix-curated workflows only at MVP. Workflow publishing defers to MVP-1.5.)*

**Acceptance criteria:**
- [ ] At least 4 Beamix-authored workflows at launch
- [ ] Discover tier: full catalog visible, all install buttons show upgrade CTA
- [ ] Build tier: install up to 3 workflows
- [ ] Scale tier: unlimited installs
- [ ] No leaderboards, no rev-share references
- [ ] Workflow publishing by Scale users: NOT available at MVP

**Priority: MVP (constrained)**

---

### Feature 18: Incident runbook + rollback + Truth File integrity job

*(Spec unchanged from v4.)*

**Acceptance criteria:**
- [ ] Every agent-published action stores a revert payload at creation time
- [ ] Customer can rollback any action from /scans → Completed Items with single "Rollback" button
- [ ] Rollback completes within 60 seconds for content; within 5 minutes for schema
- [ ] Rollback confirmation email sent automatically
- [ ] Internal incident runbook written pre-launch
- [ ] Truth File integrity-hash nightly job: >50% field loss → Sev-1 alert + auto-pause all agents
- [ ] Kill switch: one-click suspension of any marketplace workflow within 60 seconds

**Priority: MVP (pre-launch requirement)**

---

### Feature 19: Workflow Builder

*(Spec unchanged from v4. Scale-only. React Flow DAG editor. Cream-paper canvas.)*

See full v4 spec for complete acceptance criteria. No changes in v5.

**Priority: MVP (Scale-only)**

---

### Feature 20: /security public page

*(Spec unchanged from v4. Aria's 5 fixes applied. "cannot publish" not "refuses to publish.")*

**Priority: MVP (3 person-days)**

---

### Feature 21: Scale-tier DPA + agency indemnification clause

*(Spec unchanged from v4.)*

**Priority: MVP (legal advisor task)**

---

### Feature 22: AI Visibility Cartogram

*(Core spec unchanged from v4. Amendment below.)*

**What it does:** 50 queries × 11 engines = 550 cells. Each cell color-coded, carrying one character glyph. Renders at full state at t=0. CSS Grid implementation (not canvas). 14×12px cells. 468×697px total artifact.

**Amendment v5 (2026-05-04):** Cartogram now appears in Phase 2 (results) of the /start flow. This is in addition to its existing surfaces (not a replacement). The public /scan/[scan_id] permalink cartogram rendering is unchanged. Monthly Update PDF Page 2 is unchanged.

**Surfaces where cartogram renders (v5 updated list):**
1. Phase 2 (`results`) of /start — scan results visible before signup
2. /scans/[scan_id] detail page (primary authenticated surface)
3. Monthly Update PDF Page 2
4. Public OG share card for /scan public

**Acceptance criteria (all v4 criteria preserved, plus):**
- [ ] Cartogram renders in Phase 2 of /start (results phase) — visible to anonymous users before signup
- [ ] Cartogram renders within 2 seconds of page load
- [ ] All 550 cells correctly color-coded per 4-state scheme
- [ ] Glyphs readable at cell size (11px Inter caps)
- [ ] No animation, no gradient, no entrance effect — renders at full state at t=0
- [ ] Mobile responsive: minimum readable on 375px viewport
- [ ] Cartogram present on Monthly Update PDF Page 2
- [ ] Cartogram used as OG image for public /scan share card
- [ ] Engine abbreviation corrections applied (AO for AI Overviews)

**Priority: MVP**

---

### Feature 23: Cycle-Close Bell

*(Spec unchanged from v4. Amendment: Wave added in v4 Amendment preserved.)*

**Priority: MVP**

---

### Feature 24: Brief Re-Reading — quarterly trigger

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 25: Receipt-That-Prints card

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 26: Print-Once-As-Gift — month 6

*(Spec unchanged from v4. Explicitly Post-MVP.)*

**Priority: Post-MVP (month-6 milestone trigger)**

---

### Feature 27: Print-the-Brief button at onboarding end

*(Spec unchanged from v4. Now fires at end of Phase 7 brief-signing in /start.)*

**Priority: MVP**

---

### Feature 28: "What Beamix Did NOT Do" Monthly Update line

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 29: Printable A4 ops card in /settings

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 30: Brief grounding inline citation everywhere

*(Core spec unchanged from v4. Amendment below.)*

**What it does:** Every agent action carries an inline citation back to the authorizing Brief clause. 1px brand-blue left rule + "Authorized by your Brief:" label + quoted clause text + "— clause N of M · Edit Brief →". Workflow Builder Inspector uses cream+Fraunces variant.

**Amendment v5 (2026-05-04):** The right-column Brief grounding preview in Phase 6 (brief-co-author) of /start ships at MVP per Q3 lock. This is a new instance of the Brief grounding pattern — a preview rendered BEFORE the Brief is signed, showing the customer what a future /inbox item will look like. It uses the standard citation treatment (1px brand-blue left rule + Inter 400 italic). It is NOT the Workflow Builder cream+Fraunces variant. The preview is illustrative (uses a placeholder clause from the in-progress Brief draft) and labeled "This is how Beamix will cite your Brief in every recommendation."

**Acceptance criteria (all v4 criteria preserved, plus):**
- [ ] Phase 6 (brief-co-author) of /start shows Brief grounding preview in right column
- [ ] Preview uses standard citation treatment (1px brand-blue left rule + Inter 400 italic 14px)
- [ ] Preview is labeled "This is how Beamix will cite your Brief in every recommendation"
- [ ] Preview updates in real-time as customer edits Brief clauses in Phase 6
- [ ] Every customer-facing agent action on all listed surfaces has a visible Brief citation (unchanged from v4)
- [ ] Standard treatment: 1px brand-blue left rule + "Authorized by your Brief:" + quoted clause + "— clause N of M · Edit Brief →"
- [ ] Workflow Builder Inspector uses cream+Fraunces variant per Design Lock B
- [ ] Clause text shown is snapshotted text at time of action creation
- [ ] `brief_clause_ref` and `brief_clause_snapshot` fields present in provenance envelope

**Priority: MVP**

---

### Feature 31: Brief binding line at every product page bottom

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 32: Brief Re-author and Undo Window

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 33: Team Seats and Role Permissions

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 34: Customer Data Export (DSAR + Self-Service)

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 35: Graceful Cancellation and Data Retention

*(Core spec unchanged from v4. Amendments below.)*

**Amendment v5 (2026-05-04) — Tier-split refund windows (Q8 lock):**
- Discover: 14-day money-back
- Build: 14-day money-back
- Scale: 30-day money-back

Refund window starts at Paddle checkout completion (Paid Customer activation), not at Brief signing.

**Amendment v5 (2026-05-04) — Agent-run caps during refund window (Q8 lock, see F54):**
During the refund window, agent runs are capped per tier:
- Discover: 5 agent runs during refund window
- Build: 10 agent runs during refund window
- Scale: 20 agent runs during refund window

After the refund window closes, caps lift and runs are unlimited per tier allocation. Customer is notified of cap during Phase 7 (brief-signing) and at Paddle checkout: "Your full scan + [N] agent runs included in your [refund window] guarantee period; unlimited after Day [N+1]."

**Amendment v5 (2026-05-04) — Abandoned-mid-onboarding Twilio cleanup:**
Accounts that provision a Twilio number (via Phase 6 brief-co-author) but never complete Paddle checkout (Free Account or true abandoned) are included in the 30-day cleanup cron. Each Twilio number's `friendly_name` includes the `customer_id`; cron releases all numbers for accounts marked `deleted_at` OR accounts in `free_account` state that have been inactive for 30 days.

**Acceptance criteria (all v4 criteria preserved, plus):**
- [ ] Refund window: Discover 14 days, Build 14 days, Scale 30 days from Paddle checkout
- [ ] Agent-run caps enforced per tier during refund window (F54 spec)
- [ ] Refund window duration displayed at Paddle checkout and at Phase 7 brief-signing footer
- [ ] Post-refund-window: caps lift automatically, no customer action required
- [ ] Abandoned-mid-onboarding Twilio cleanup: 30-day cron includes accounts in `free_account` state inactive ≥30 days

**Priority: MVP**

---

### Feature 36: Domain Migration Flow

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 37: /reports — Monthly Update Archive and Review

*(Spec unchanged from v4. No changes in v5.)*

**Priority: MVP**

---

### Feature 38: Subscription Pause

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 39: Competitor Removal and False-Positive Management

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 40: Multi-Domain Scale Tier — Seat and Domain Model

*(Spec unchanged from v4. No changes in v5.)*

**Priority: MVP**

---

### Feature 41: Cmd-K command bar + slash command

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 42: Trust Center at /trust + SOC 2 Type I

*(Core spec unchanged from v4. Amendment below.)*

**Amendment v5 (2026-05-04) — /trust crosslink from Phase 7 (Q5 lock):**
The Phase 7 (brief-signing) footer now includes a quiet "Security & DPA" link that routes to /trust. This is the mechanism by which Marcus can screenshot + forward to Aria before signing the Brief. Link treatment: 13px Inter 400, ink-3, positioned below the signature area alongside the 14-day money-back guarantee footer line. No banner, no CTA prominence — small and quiet. The ones who care will click; those who don't are not disrupted.

**Acceptance criteria (all v4 criteria preserved, plus):**
- [ ] Phase 7 (brief-signing) of /start includes "Security & DPA" footer link (13px ink-3, links to /trust)
- [ ] Link is non-intrusive — same visual weight as 14-day money-back footer line
- [ ] /trust landing page present with 4 cards linking to sub-pages
- [ ] /trust/compliance — SOC 2 Type I status, HackerOne status, GDPR DPA link
- [ ] /trust/sub-processors — extended table with all 5 Aria-required columns
- [ ] /trust/dpa — ungated public DPA
- [ ] /.well-known/security.txt — RFC 9116 compliant
- [ ] Sub-processor controller/processor column present (previously missing, now required)

**Priority: MVP**

---

### Feature 43: Vulnerability disclosure + bug bounty

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 44: /changelog as canonical surface

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 45: Compact mode toggle

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 46: Editorial error pages

*(Spec unchanged from v4.)*

**Priority: MVP**

---

### Feature 47: State of AI Search 2026

*(Spec unchanged from v4. Ships MVP+90.)*

**Priority: MVP+90**

---

### Feature 48: Yossi Agency Batch Onboarding (MVP+30)

**Feature ID:** F48
**Priority:** MVP+30 (Q1 lock — Adam confirmed 2026-05-04)

**What it does:** For agency operators with ≥1 prior signed Brief in their account, the /start flow offers a batch onboarding mode. Adding a new client domain (client #2, #3, etc.) shortcuts the 9-phase ceremony to a 2–3 phase flow: domain entry → scan + results → pre-filled Brief co-author (using the prior client's Brief as a template, then vertically adapted by Claude for the new domain). Full Brief signing ceremony preserved (Seal lands on every Brief regardless). Reduces per-additional-client onboarding time from ~8 minutes to ~2 minutes.

**Trigger:** Customer is in `/start` for a new domain AND their account has ≥1 prior `brief_id` with `status = 'signed'`.

**Scope:**
- Pre-fill Brief from prior client domain as starting template, then Claude adapts it vertically for the new domain.
- Customer reviews and edits adapted Brief in Phase 6.
- Seal ceremony unchanged — every Brief is fully signed.
- "Skip cinema" option (O-19 fix) extended to full skip-to-Phase-6 for client #3+: customer sees "You've done this before — skip to Brief" CTA.
- Multi-client cockpit at /home for Scale accounts (table view — already in F40). In v5 at MVP: cockpit shown when ≥2 active domains, not waiting for full batch mode.
- Recovery email for Yossi: if customer has saved progress on ≥3 domains but hasn't completed all of them, a Day-7 email fires: "Your clients need their Brief — you have N in progress." Voice canon Model B.

**What is NOT included (remains full ceremony):**
- Truth File: each new client gets a full fresh Truth File (no inheritance from prior client).
- Lead Attribution: each new client gets a fresh Twilio number + UTM URL.

**User story:** As Yossi, I want to add my 8th client in under 2 minutes instead of 8 so that batch onboarding doesn't consume my whole afternoon.

**Acceptance criteria:**
- [ ] Batch mode triggers when customer has ≥1 prior signed Brief and is starting a new domain
- [ ] Phase 6 Brief is pre-populated from prior client Brief, then Claude-adapted for new domain's vertical
- [ ] "Skip to Brief" CTA visible for clients #3+ with ≥2 prior signed Briefs
- [ ] Full Seal ceremony preserved on every Brief regardless of batch mode
- [ ] Each new domain gets a fresh Truth File (no inheritance)
- [ ] Each new domain gets a fresh Twilio number + UTM URL on Paddle checkout
- [ ] Day-7 recovery email fires if ≥3 in-progress domains exist without completed Brief
- [ ] Recovery email: voice canon Model B. Copy: "Your clients need their Brief — you have N in progress."
- [ ] Batch mode only available when ≥1 prior signed Brief exists in account

**Dependencies:** F2 v5 (/start route), F3 (Truth File), F12 (Lead Attribution), F14 (Email infrastructure)

---

### Feature 49: Embeddable Score Badge (MVP+30)

**Feature ID:** F49
**Priority:** MVP+30 (Q10 lock — Adam confirmed 2026-05-04)

**What it does:** Customers with AI visibility scores above a threshold (suggested: ≥70/100) can display a verified Beamix badge on their own website. Badge reads: "AI Search Visibility: [score]/100 — Verified by Beamix." Click-through goes to the customer's public scan permalink at `/scan/[scan_id]`. Score updates automatically on each weekly scan cycle (badge re-fetches via CDN-served badge image URL).

**Pattern:** Lighthouse-style embeddable badge. Customers embed a single `<img>` tag or `<script>` snippet. The badge image is served from Beamix's CDN, updated on each scan cycle. No customer JS execution required for the static `<img>` version.

**Badge spec:**
- Two variants: Light (cream paper background, ink-1 text) and Dark (ink-1 background, paper text)
- Dimensions: 160×40px (standard), 200×50px (large)
- Typography: Geist Mono for score number, Inter 400 for label text
- Beamix mark: 16×16 brand-blue star at left
- Score updates: badge image URL is stable; CDN serves updated image after each scan cycle completes

**Access gating:** Available to all Paid Customers. Score must be ≥70/100 to generate badge (customers below threshold see "Improve your score to unlock the badge" in /settings).

**Acceptance criteria:**
- [ ] Badge generation UI in /settings → Profile tab: "Display your AI visibility score on your site"
- [ ] Threshold: score ≥70/100 required. Customers below threshold see locked state + score gap message.
- [ ] Two variants available: Light and Dark
- [ ] `<img>` embed snippet and `<script>` snippet both provided
- [ ] Badge image URL is stable and CDN-served. Updates within 1 hour of scan cycle completion.
- [ ] Click-through routes to customer's public scan permalink at `/scan/[scan_id]`
- [ ] Scan permalink is auto-made-public when badge is generated (customer confirms this in badge generation flow — one explicit step)
- [ ] Badge does not render for Free Account customers (Paid Customer state required)
- [ ] Beamix /settings shows all customers who have generated a badge (internal visibility)

**Dependencies:** F1 (/scan public permalinks), F9 (/scans), scan completion Inngest event, CDN badge image serving

---

### Feature 50: Public Dogfooding Scan (built MVP, published MVP+30)

**Feature ID:** F50
**Priority:** Built at MVP, published at MVP+30 (Q11 lock — Adam confirmed 2026-05-04)

**What it does:** Beamix publishes its own AI visibility data at `/scan/beamixai.com`. Beamix's own domain is scanned weekly by its own agents. The results — score, cartogram, per-engine breakdown, improvement trend — are public. This is the Plausible-style transparency move: "we eat our own cooking and show you the plate."

**Pattern:** The public `/scan/beamixai.com` permalink is a permanently public scan result page. It uses the same scan infrastructure as customer scans. It is not a marketing page — it is a live data artifact.

**Why publish at MVP+30 and not MVP launch:** The first scan result is a baseline. Publishing at MVP+30 means there is at least 30 days of trend data, making the cartogram and sparkline more meaningful. Publishing at launch day 0 shows a single data point with no context.

**What is built at MVP:** The Beamix domain is added as an internal customer account and scanned weekly from Day 1. Results are stored. The public permalink exists but is marked as unpublished (accessible by direct URL, not indexed).

**What ships at MVP+30:** The permalink is made public (indexed). A blog post / social post from Adam launches it: "We publish our own AI search visibility data. Here it is." Pairs with F47 (State of AI Search 2026) as a companion transparency artifact.

**Acceptance criteria:**
- [ ] Beamix domain added as internal scan account at MVP build — weekly scans running from launch
- [ ] `/scan/beamixai.com` permalink exists at MVP with scan data (not indexed until MVP+30)
- [ ] At MVP+30: permalink made public, Google-indexed, listed in /changelog
- [ ] Page shows: current score, 30-day trend sparkline, full cartogram, per-engine breakdown
- [ ] Data updates weekly (same cadence as customer scans)
- [ ] No login required to view
- [ ] Page uses standard /scan permalink design (cream paper, Fraunces accent)
- [ ] "Scan your own domain" CTA present on page routes to /start

**Dependencies:** F1 (/scan infrastructure), F9 (/scans), /start route (F2 v5)

---

### Feature 51: Two-Tier Activation Model (MVP)

**Feature ID:** F51
**Priority:** MVP (Q6 lock — Adam confirmed 2026-05-04)

**What it does:** Replaces the single-state model in v4 (where Paddle checkout was assumed to happen during onboarding) with a two-tier model. Customer can complete the Brief ceremony and access a limited version of the product without paying. Payment is presented as an inline modal when the customer is ready — not as a gate during onboarding.

**Two states:**

**Free Account (post-Brief, pre-Paddle):**
- Customer has completed Phase 7 (Brief signed) but dismissed the Paddle modal in Phase 4, OR entered /start via a path that didn't trigger Phase 4.
- Has a `brief_id` and `truth_file_id` but no `paddle_subscription_id`.
- `subscriptions.status = 'free_account'` (custom status, not Paddle-generated).
- Can access: /home (with sample data per F52), /scans (scan results from Phase 1–2), /trust, /security, /changelog.
- Cannot: run agents, access /inbox (real items), access /crew autonomy settings, access /workspace (real runs).
- /home shows: real scan data (score, cartogram, per-engine results from Phase 1–2 scan). Sample /inbox recommendations (F52).
- Activation CTA: persistent "Activate agents →" banner on /home. Also surfaced in: empty /inbox state, /crew page header.

**Paid Customer (post-Paddle checkout):**
- Has `paddle_subscription_id`.
- `subscriptions.status = 'active'` (standard Paddle status).
- Full product access. Agents active. Trial clock running from Paddle checkout moment.
- Day-1 auto-trigger pipeline fires (scan → rules engine → first 2-3 agent runs within 5–10 minutes).

**Conversion moment:** Customer clicks "Activate agents →" on /home → Paddle inline modal appears → checkout completes → modal dismisses → /home refreshes to Paid Customer state → first agents queued.

**User story:** As Marcus, I want to see what Beamix would do for my business before committing, so I can show my Head of Marketing the sample recommendations and get buy-in before paying.

**Acceptance criteria:**
- [ ] Free Account state exists as a distinct subscription status (`free_account`) in Supabase
- [ ] Customers who dismiss Phase 4 Paddle modal enter Free Account state and continue to Phase 5–8
- [ ] Free Account /home shows real scan data + sample agent recommendations (F52)
- [ ] Free Account /home shows "Activate agents →" banner with Paddle inline modal trigger
- [ ] Free Account /inbox is accessible but contains only sample items (F52) — no real agent-generated items
- [ ] Free Account agent dispatch is blocked at Inngest job level (subscription status check)
- [ ] Paid Customer state activates immediately on Paddle checkout completion
- [ ] Paid Customer Day-1 auto-trigger pipeline fires within 5 minutes of Paddle checkout
- [ ] Conversion from Free Account to Paid Customer requires no re-onboarding — Brief and Truth File carry forward
- [ ] "Activate agents →" Paddle modal pre-selects the tier the customer selected during /start (stored in session)
- [ ] Free Account recovery emails (F53) target this state

**Dependencies:** F2 v5 (/start route), F5 (/home), F52 (sample data), F53 (recovery emails), F54 (agent-run caps), Paddle inline integration

---

### Feature 52: Free Account /home Sample Data Population (MVP)

**Feature ID:** F52
**Priority:** MVP (enables F51 Free Account value demonstration)

**What it does:** When a customer enters Free Account state (post-Brief, pre-Paddle), /home is populated with 3–5 illustrative agent recommendations based on their actual scan results. The recommendations show what Beamix's agents would do — the specific actions, the expected outcome, the Brief clause that would authorize each action. They are clearly marked as sample recommendations to the Free Account customer.

**Sample data rules:**
- Generated by Claude Haiku at the moment the customer completes Phase 8 (truth-file) as a Free Account.
- Uses real scan data (their actual scan results, score, missing citations, competitor gaps) to generate realistic recommendations.
- Generated recommendations match the customer's vertical and Brief content.
- 3–5 items max. Not a full /inbox simulation — just enough to show the pattern.
- Each item shows: agent name, action type, "what Beamix would do" summary, expected outcome, Brief clause citation (illustrative).
- Items marked with a subtle treatment visible only to the Free Account customer: "Sample recommendation — activate to run this for real."
- Once customer activates (Paddle checkout), sample items are replaced by real agent-generated items within 5–10 minutes. Sample items are removed from /inbox immediately on Paid Customer activation.

**What sample data does NOT include:**
- Any actual changes to the customer's website or domain.
- Any Twilio provisioning or UTM URL generation.
- Any real agent execution or LLM calls beyond the Haiku recommendation generation.

**Acceptance criteria:**
- [ ] Sample recommendations generated at completion of Phase 8 when customer is in Free Account state
- [ ] 3–5 sample /inbox items generated using Claude Haiku based on real scan data
- [ ] Each sample item is realistic: uses customer's actual domain, vertical, Brief content as context
- [ ] Each sample item shows: agent name, action type, expected outcome, illustrative Brief clause citation
- [ ] Sample items marked "Sample — activate to run this for real" (visible only to Free Account customer)
- [ ] Sample items are NOT visible on shared artifacts (Monthly Update, PDF exports) — internal only
- [ ] On Paid Customer activation: sample items removed from /inbox immediately. Real agent items replace within 10 minutes.
- [ ] /home Real scan data (score, cartogram, per-engine strip) visible in Free Account state — these are real, not sample
- [ ] Sample generation uses Claude Haiku (cost-optimized — XS per generation)
- [ ] If scan data is insufficient to generate realistic samples: show a reduced set of 2–3 generic-vertical recommendations with appropriate framing

**Dependencies:** F51 (Two-Tier Activation Model), F2 v5 (/start), F3 (Truth File), F6 (/inbox), scan data from Phase 1–2

---

### Feature 53: Day-N Free Account Recovery Email Sequence (MVP)

**Feature ID:** F53
**Priority:** MVP

**What it does:** A 3-email plain-text sequence targeting Free Account customers (post-Brief, pre-Paddle) who have not activated within N days. Voice canon Model B. Cream-paper register. Specific copy below.

**Sequence:**

**Email 1 — Day 3 (subject: "Your Beamix recommendations are ready")**
Body: "We ran your scan and built your Brief. Your agents are ready to go.

Here is what Schema Doctor found on [domain]: [2-3 bullet points from sample recommendations, plain text].

Your agents are waiting. [Activate now →] — it takes 30 seconds.

— Beamix"

**Email 2 — Day 7 (subject: "A week ago, we scanned [domain]")**
Body: "[Domain]'s AI search score is [score]/100. Your top competitor appears in [N] more engines than you do.

Beamix can fix the top 3 gaps this week. Your Brief is signed and waiting.

[See what Beamix would do →]

— Beamix"

**Email 3 — Day 14 (subject: "Your Brief is still here")**
Body: "Two weeks ago you signed a Brief for [domain]. Your agents have been waiting.

If the timing wasn't right, your Brief is still here whenever you're ready. It takes 30 seconds to activate.

If you have questions, reply to this email.

— Beamix"

**Suppression rules:**
- Stop sequence when customer activates (Paddle checkout).
- Stop sequence if customer cancels their Free Account (requests deletion).
- Skip any email if customer logged in on the day the email would send.

**Acceptance criteria:**
- [ ] Day-3 email fires 3 days after Phase 8 completion for Free Account customers
- [ ] Day-7 email fires 7 days after Phase 8 completion — only if customer has not activated
- [ ] Day-14 email fires 14 days after Phase 8 completion — only if customer has not activated
- [ ] All 3 emails suppressed when customer activates (Paddle checkout completes)
- [ ] All 3 emails suppressed if customer logged in on the send day
- [ ] Email 1 includes 2-3 bullet points derived from the customer's sample recommendations (F52)
- [ ] Email 2 includes customer's actual scan score and competitor gap (real data)
- [ ] All 3 emails signed "— Beamix" (voice canon Model B)
- [ ] No AI labels, no marketing speak — plain text, reads as human-written
- [ ] All 3 email templates present in Resend (total template count: 18)
- [ ] Unsubscribe link present in all 3 (CAN-SPAM)

**Dependencies:** F51 (Free Account state), F52 (sample recommendations for Email 1 content), F14 (email infrastructure, Resend)

---

### Feature 54: Refund Risk Mitigation: Agent-Run Caps (MVP)

**Feature ID:** F54
**Priority:** MVP (Q8 lock — Adam confirmed 2026-05-04)

**What it does:** During the refund window (Discover 14 days, Build 14 days, Scale 30 days from Paddle checkout), agent runs are capped per tier to mitigate refund risk. After the refund window closes, caps lift entirely and runs are unlimited per the customer's tier allocation.

**Caps:**
- Discover: 5 agent runs during refund window
- Build: 10 agent runs during refund window
- Scale: 20 agent runs during refund window

**Customer communication:** Customer is notified at two moments:
1. Phase 7 (brief-signing) footer: "Your full scan + [N] agent runs included in your [refund-window-days]-day guarantee period; unlimited after Day [refund-window-days + 1]."
2. Paddle checkout confirmation: same message, displayed in the checkout success state.

**Cap enforcement logic:**
- `refund_window_runs_used` counter on `subscriptions` table (Tier 0 item 17).
- `refund_window_ends_at` timestamp on `subscriptions` (set at Paddle checkout to `checkout_at + refund_window_days`).
- Before each Inngest agent job dispatch: check `refund_window_ends_at > now()` AND `refund_window_runs_used >= cap_for_tier`. If both true: block dispatch, show /home notification "You've used your trial runs — full runs begin on [refund_window_ends_at + 1 day]."
- If `refund_window_ends_at <= now()`: cap is lifted entirely — counter is no longer checked.

**Cap notification in product:**
- /home shows a subtle cap indicator when `refund_window_runs_used >= cap_for_tier * 0.8` (80% of cap used): "You've used [N] of your [cap] trial runs. Unlimited runs begin on [date]."
- Full-cap hit: /home shows "Trial runs used. Your unlimited runs begin on [date]." with a countdown.

**Acceptance criteria:**
- [ ] Agent-run caps enforced during refund window: Discover 5, Build 10, Scale 20
- [ ] `refund_window_runs_used` counter increments on each completed agent job
- [ ] `refund_window_ends_at` set at Paddle checkout for each new Paid Customer
- [ ] Cap check runs before every Inngest agent job dispatch
- [ ] After `refund_window_ends_at` passes: cap check is skipped entirely — unlimited runs
- [ ] Customer notified of cap at Phase 7 brief-signing footer (13px ink-3)
- [ ] Customer notified of cap at Paddle checkout success state
- [ ] /home shows cap indicator at 80% usage and at full-cap hit
- [ ] Cap indicator absent after refund window closes
- [ ] Cap counter is per-customer, not per-agent-type

**Dependencies:** F51 (Two-Tier Activation), F35 Amendment (refund window tier split), Inngest agent dispatch

---

## 6. Locked Design Decisions from Board 2 (2026-04-28)

*(All 5 design locks unchanged from v4. Full spec preserved.)*

**Lock A — Score+Ring keeps as identity geometry.** Activity Ring is KEPT. `motion/ring-pulse` CUT. `motion/ring-draw` CUT. `motion/score-fill` on returning sessions CUT. Only `motion/ring-close` (Cycle-Close Bell) survives.

**Lock B — Brief grounding cell stays cream+Fraunces in Workflow Builder Inspector only.** All other surfaces use standard treatment (1px brand-blue left rule + Inter 400 italic). First node selection per session: 400ms fade-in + one-time Trace. Subsequent: 120ms fade.

**Lock C — Workflow Builder canvas = cream paper at 30% over paper-default.** Not a dot grid.

**Lock D — /workspace execution-as-narration replaces walking figure.** Narration column pushes one plain-English sentence per executing node.

**Lock E — Rough.js deterministic seed-per-agent ships as brand canon.** `seed(agentUUID) → path` is documented in brand spec. Changing across versions is forbidden.

---

## 7. User Stories

*(All user stories from v4 preserved. New user stories for v5 additions below.)*

### Critical path 1: First-time visitor → /scan public → signup
*(Unchanged from v4 — Stories 1.1 and 1.2)*

### Critical path 2: Signup → /start → Brief approval → first agent run
*(Updated for Option E architecture)*

**Story 2.0 (new in v5):** As a first-time visitor who landed on a public scan result shared on X/Twitter, I want to claim the scan result and start my own account without re-entering my domain.

**Acceptance criteria:**
- Given I land on `/scan/[scan_id]` (public permalink), when I click "Claim this scan," then I am routed to `/start?phase=results&scan_id=[id]` with the scan results already loaded
- Given I am in Phase 2 (results) of /start, when I see the signup-overlay after ~10 seconds, then I see Google OAuth as the primary CTA and email+password as secondary
- Given I dismiss the Paddle modal in Phase 4, when I continue through the flow, then I complete my Brief as a Free Account and land on /home with sample recommendations

**Story 2.1 (unchanged from v4 — UTM onboarding for SaaS):** As a B2B SaaS founder completing onboarding, I want Phase 6 to show me UTM tracking prominently so that Beamix feels built for my business from the first minute.

**Story 2.2 (updated for v5 — Seal ceremony):**

**Acceptance criteria:**
- Given I complete Phase 6 (brief-co-author), when I see the Brief preview in the right column, then I see exactly what an /inbox item will look like with the inline citation "Authorized by your Brief: '[clause]' — clause N · Edit Brief →"
- Given I click "Sign Brief" in Phase 7, when the Seal stamps, then it takes 540ms with a stamping curve. "— Beamix" appears in 300ms opacity fade. Arc's Hand dot is visible.
- Given the Seal lands, when I look below the signature, then I see both "Print this Brief →" (14px Inter ink-3) AND "Security & DPA" (13px Inter ink-3) AND the 14-day guarantee line — all in the footer, all unobtrusive.

**Story 2.3 (new in v5 — Free Account value demonstration):** As a new customer who dismissed the Paddle modal, I want /home to show me realistic sample recommendations so I can show my Head of Marketing what Beamix will do before committing.

**Acceptance criteria:**
- Given I completed my Brief as a Free Account, when I land on /home, then I see a banner "Activate agents →" AND 3–5 sample /inbox items showing specific recommendations for my domain
- Given I look at a sample recommendation, when I read the detail, then it shows my actual domain, my vertical, a specific action Beamix would take, and a Brief clause citation
- Given I click "Activate agents →", when the Paddle modal appears, then my tier is pre-selected from my /start session and my Brief carries forward — no re-onboarding

### Critical paths 3–7
*(Unchanged from v4 — Stories 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 7.1)*

---

## 8. Success Metrics

*(All v4 metrics preserved. New metrics for v5 additions below.)*

### Activation metrics (Day 0 – Day 7)

**Onboarding completion rate**
Target: ≥65% of signups complete all phases of /start (including Brief approval) within 24 hours.

**Free Account → Paid Customer conversion**
Target: ≥40% of Free Account customers complete Paddle checkout within 7 days of Brief signing.
Rationale: Free Account state is a deliberate funnel step, not a fallback. 40% reflects high-intent visitors who need to show the product to a decision-maker before paying.

**Free Account Day-3 email CTR**
Target: ≥15% click-through on "Activate now →" in the Day-3 recovery email.
Rationale: Customer has just seen sample recommendations 3 days ago. Recall is high. CTR below 10% suggests sample recommendations are not compelling enough.

**Time to first evidence**
Target: <90 seconds from Phase 8 completion (for Paid Customer) to first visible Beamix action in /home activity feed.

**Google OAuth adoption rate**
Target: ≥70% of new signups use Google OAuth (not email+password).
Rationale: Google OAuth eliminates the email verification drop-off. Below 60% suggests the OAuth button placement needs prominence adjustment.

**"Print this Brief" click rate (F27)**
Target: ≥7% of customers who complete Phase 7 click "Print this Brief →".

### Engagement metrics (Day 7 – Day 30)
*(Unchanged from v4)*

### Retention metrics (Day 30 – Day 90)
*(Unchanged from v4)*

**Embeddable badge adoption (F49)**
Target: ≥10% of Paid Customers with score ≥70 generate an embeddable badge within 30 days of eligibility.
Rationale: Badge is a distribution lever. Low adoption suggests eligibility threshold (70/100) is too high or badge generation UI is not prominent enough.

**Public dogfooding scan page views (F50)**
Target: ≥500 unique views within 30 days of MVP+30 publication.

### North star metric
*(Unchanged from v4)* Lead Attribution Loop closure rate at 30 days.

**Secondary north star (word-of-mouth proxy):** Monthly Update PDF forward/share rate.

---

## 9. Out of Scope for MVP

*(All v4 out-of-scope items preserved. Additions below.)*

### New deferred items (v5)

- **Cross-client bulk-approve in /inbox** — MVP-1.5 (per-client bulk-approve ships at MVP per F6)
- **Per-client role scoping for Editor seats** — MVP-1.5 (F33 — editors see all clients at MVP)
- **Customer-site JS snippet for form attribution** — MVP-1.5
- **Workflow event triggers** — MVP-1.5
- **Workflow publishing to marketplace** — MVP-1.5
- **WordPress plugin** — MVP-1.5
- **/cockpit standalone route** — MVP-1.5 (multi-client cockpit lives at /home for Scale per F40)
- **Dark mode for admin-utility surfaces** — MVP+30 (6 surfaces: /home, /inbox, /scans, /workspace, /crew, /competitors, /settings, Workflow Builder)

### Items deferred per prior versions (unchanged)
- Agents: Long-form Authority Builder, Brand Voice Guard (MVP-1.5). Content Refresher, Trend Spotter, Citation Predictor, Local SEO Specialist (Year 1).
- 10 of 12 vertical knowledge graphs (Year 1)
- Voice AI surfaces, Multimodal surfaces, Agent-mediated browsing (Year 1)
- Third-party Agent SDK (Year 1)
- White-label custom subdomain (Year 1)
- House Memory as queryable archive (Year 1.5)
- Content Studio (Year 1.5)
- Beamix Sessions (Year 2)

---

## 10. Risks and Open Product Questions

*(All v4 risks preserved. Additions below.)*

### Risk 11: Paddle inline overlay cross-browser reliability

The Paddle inline modal must work on Safari iOS, Chrome Android, Firefox, and low-end Android devices. Paddle's inline integration is documented but requires testing across devices before launch.

**Mitigation:** Test Paddle inline overlay in sandbox mode across ≥5 browser/device combinations before MVP launch. If Paddle inline is unreliable on a target browser, fallback to new-tab Paddle checkout for that browser only (with a "you'll return here after checkout" note).

---

### Risk 12: Free Account → Paid conversion rate

If Free Account conversion is below 30% at Day 7, the two-tier model has created a funnel leak rather than a funnel improvement.

**Mitigation:** Measure Free Account → Paid conversion weekly. If below 30% at Day 14: (a) increase sample recommendation quality (more specific to customer's domain), (b) adjust "Activate agents" CTA prominence on /home, (c) review Day-3 recovery email copy. Do not increase friction in the Free Account state — that makes conversion worse.

---

### Risk 13: Option E build effort delaying MVP

Option E is estimated at M–L effort (3–4 weeks of integration work). If the build timeline is tight, the risk is that Option E is partially shipped (some phases incomplete) and creates a broken experience.

**Mitigation:** Define a clear MVP-floor for Option E: the minimum viable path is Phases 3–8 (signup-overlay → truth-file) wired into one URL with URL-bookmarked state. Phases 0–2 (enter-url → results) can ship as Option A fallback if time-constrained, with Option E phases 0–2 completing at MVP+14.

---

### Open Product Questions (v5)

All Q1–Q13 are locked by Adam (2026-05-04). No open questions remain in this document.

**5 pre-build validations pending (not questions, but tasks):**
1. 5-customer guerrilla test of Option A vs Option E mocks
2. Paddle inline reliability across browsers
3. Yossi's path through Option E for client #2+
4. Pixel-spec Phase 1→2 transition (scan completion → results reveal)
5. "Claim this scan" routing from public permalinks

---

## 11. Design System Canon — v5 Additions

*(All v4 design system canon preserved. Additions below.)*

### Hebrew typography stack (Q2 lock)

Heebo 300 italic ships at MVP as Fraunces' Hebrew companion.

**Font loading rule:**
```css
font-family: 'Fraunces', 'Heebo', serif;
```

Heebo 300 is loaded conditionally on `[lang="he"]` pages only (not globally — saves ~45KB on non-Hebrew sessions). Fraunces remains the primary font for all non-Hebrew text.

Geist Mono technical content (URLs, phone numbers, scan IDs) must have explicit `dir="ltr"` to prevent mirrored URLs in RTL context.

**Build config:** `next/font` conditional loading based on `lang` attribute at the `<html>` level. Hebrew detection at account creation (browser locale + user preference, stored in `user_profiles.language`).

---

### Phase-transition motion canon

140ms cross-fade is the default transition between /start phases. Applied via `--ease-trace-fade` easing curve.

**Exception — Phase 7 Seal ceremony:** The Seal stamping is NOT a cross-fade. It uses `--ease-stamp` (540ms). The "— Beamix" wordmark uses `--ease-trace-fade` (300ms). The Arc's Hand dot uses a separate 120ms opacity fade. These three animations are independent and sequential, not cross-faded.

**Exception — Phase 1→2 transition (scan completion → results reveal):** This is the most consequential motion moment in the /start flow. It must be pixel-specced separately before implementation. Working spec: 400ms dissolve from the scanning wait state to the results state, with the cartogram and score rendering at t=0 of the results state (no path-draw entrance). The transition is the only animation; the data arrives fully rendered.

---

### Two-tier UI states — token treatments

**Free Account banner (on /home):**
- Background: `--color-brand-blue` at 8% opacity over `--color-paper` (light blue wash)
- Border: 1px `--color-brand-blue` at 30% opacity (top border only)
- Text: `--color-ink-1` (standard body)
- CTA button: standard primary button (brand-blue fill, paper text)
- Typography: Inter 400, 14px body. "Activate agents →" CTA in Inter 500 14px.

**Paid Customer banner:** Not shown. Paid Customer state has no persistent banner.

**Sample data treatment (Free Account /inbox items):**
- Left border: 2px `--color-ink-4` (muted, not the standard brand-blue)
- "Sample" label: Geist Mono 9px, `--color-ink-4`, `text-transform: uppercase`, positioned at top-right of each sample item card
- Opacity: 1.0 (fully readable — "sample" is a label, not a visual dimming)
- Sample items NEVER appear in shared artifacts (PDF exports, Monthly Update, /reports)

---

### WCAG 2.1 AA fixes (O-8 from onboarding audit)

Four token additions to resolve contrast failures:

```css
:root {
  --color-score-excellent-text: #0E8A7A;     /* Darker variant for text on cream */
  --color-needs-you-text: #B84A00;            /* Darker variant for text on cream */
  --color-ink-4-on-cream: #6B6B6B;           /* Ink-4 with 4.5:1 minimum on cream bg */
}
```

Focus ring fix: replace `box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.25)` with `outline: 2px solid var(--color-brand-blue); outline-offset: 2px` (solid ring, no opacity).

Print-the-Brief auto-dismiss timer: REMOVED. Timer now manual-dismiss only (click "Continue" or click outside the offer). No 8-second auto-dismiss that fails WCAG 2.2.1. The offer persists until customer explicitly continues.

`useReducedMotion()` hook: audit coverage for Rough.js JS animations (Seal, Ring, counter). All three must check `useReducedMotion()` and skip to final state if true.

---

### Mobile breakpoint typography — Brief register

Fraunces at 22px on screens ≤600px readable width wraps every 3–4 words, collapsing the editorial register.

**Responsive rule:**
```css
@media (max-width: 600px) {
  .fraunces-editorial {
    font-size: 18px;
    line-height: 28px;
  }
}
```

Applies to: Phase 6 and Phase 7 of /start (brief-co-author and brief-signing), /settings Brief tab, Brief Re-Reading intercept (F24), Monthly Update headings.

---

### Motion taxonomy additions (v5)

Add to existing 10-curve taxonomy:

```css
:root {
  --ease-phase-transition: cubic-bezier(0.4, 0, 0.6, 1);   /* /start phase cross-fades (140ms) */
  --ease-results-reveal: cubic-bezier(0.16, 1, 0.3, 1);    /* Phase 1→2 dissolve (400ms) */
}
```

---

## 12. Outstanding Adam-Decisions

**None.** All Q1–Q13 are locked by Adam (2026-05-04).

**5 pre-build validations remain** (not decisions — tasks to complete before implementation lock):
1. Guerrilla test Option A vs Option E mocks with 5 prospective customers
2. Paddle inline cross-browser testing
3. Yossi path through Option E for client #2+
4. Pixel-spec Phase 1→2 transition
5. "Claim this scan" routing validation on public permalinks

---

## 13. Predecessors + Version History

| Version | Date | Key changes |
|---------|------|-------------|
| v1 | 2026-04-27 | Initial PRD. F1–F31. Board Meeting 23 decisions. |
| v2 | 2026-04-28 | Design Board 2. F32–F40 added. 5 design locks (A–E). |
| v3 | 2026-04-28 | F41–F47 added. Aria persona. 47-feature complete set. |
| v4 | 2026-04-29 | Canonical consolidation. PRD v3/v2/v1 deprecated. Domain beamixai.com. Build Plan v1 + v2. |
| v5 | 2026-05-04 | Option E architecture. Two-tier activation. F48–F54 added. 13 Adam decisions (Q1–Q13) locked. Onboarding audit fixes. Hebrew typography. WCAG fixes. This document. |

**Git PRs:**
- PR #52: v1 — initial PRD
- PR #53: v3 + Build Plan v1
- PR #54: Round 2/3 design board + Aria persona + PRD v4 amendments
- PR #55: PRD v4 canonical + Build Plan v2
- PR #56: Onboarding audit synthesis (2026-05-04)
- PR #57: Flow architecture synthesis + Option E (2026-05-04)
- This document ships in the same PR as the v5 consolidation.

---

## 14. Domain Infrastructure Status

All domain infrastructure live and verified. Updated 2026-05-04.

| Surface | Configuration | Status |
|---------|---------------|--------|
| Cloudflare DNS | beamixai.com nameservers → Cloudflare | Live (configured 2026-04-29) |
| Framer apex | beamixai.com → Framer marketing site | Live (configured 2026-04-29) |
| Vercel app subdomain | app.beamixai.com → Vercel Next.js product | Live (configured 2026-04-29; production deployed) |
| Resend notify subdomain | notify.beamixai.com DKIM/SPF/DMARC | Live (configured 2026-04-29) |
| Google Search Console | beamixai.com verified and indexed | Live (configured 2026-04-29) |
| Bing Webmaster Tools | beamixai.com verified | Live (configured 2026-04-29) |

**Product at app.beamixai.com:** Production deployment live as of 2026-04-29. All references in this document use `beamixai.com`, `app.beamixai.com`, and `notify.beamixai.com`. The old domain `beamix.tech` is retired. Customer-facing brand name remains **Beamix** — never write "BeamixAI."

---

## Feature ID Summary — Complete v5 Set

| ID | Name | Priority | Build Effort | v5 Status |
|----|------|----------|--------------|-----------|
| F1 | /scan public | MVP | M | Amended |
| F2 | Onboarding — /start unified route | MVP | L | **REPLACED** |
| F3 | Truth File | MVP | M | Unchanged |
| F4 | Pre-publication validation | MVP | L | Amended |
| F5 | /home | MVP | M | Amended |
| F6 | /inbox | MVP | M | Amended |
| F7 | MVP agent roster (6 agents) | MVP | L | Unchanged |
| F8 | /workspace | MVP | M | Unchanged |
| F9 | /scans | MVP | S | Unchanged |
| F10 | /competitors | MVP (Build+) | S | Unchanged |
| F11 | /crew | MVP | S | Unchanged |
| F12 | Lead Attribution Loop | MVP | M | Amended |
| F13 | /settings | MVP | M | Unchanged |
| F14 | Email infrastructure | MVP | M | Amended |
| F15 | 11 text AI engine coverage | MVP | L | Unchanged |
| F16 | 2 vertical knowledge graphs | MVP | L | Unchanged |
| F17 | Marketplace | MVP (constrained) | S | Unchanged |
| F18 | Incident runbook + rollback | MVP | M | Unchanged |
| F19 | Workflow Builder | MVP (Scale-only) | XL | Unchanged |
| F20 | /security public page | MVP | S | Unchanged |
| F21 | Scale-tier DPA | MVP | S | Unchanged |
| F22 | AI Visibility Cartogram | MVP | M | Amended |
| F23 | Cycle-Close Bell | MVP | S | Unchanged |
| F24 | Brief Re-Reading quarterly | MVP | S | Unchanged |
| F25 | Receipt-That-Prints card | MVP | XS | Unchanged |
| F26 | Print-Once-As-Gift | Post-MVP | S | Unchanged |
| F27 | Print-the-Brief button | MVP | XS | Unchanged |
| F28 | "What Beamix Did NOT Do" line | MVP | XS | Unchanged |
| F29 | Printable A4 ops card | MVP | XS | Unchanged |
| F30 | Brief grounding citation | MVP | M | Amended |
| F31 | Brief binding line | MVP | XS | Unchanged |
| F32 | Brief Re-author + Undo Window | MVP | S | Unchanged |
| F33 | Team Seats + Role Permissions | MVP | M | Unchanged |
| F34 | Customer Data Export (DSAR) | MVP | M | Unchanged |
| F35 | Graceful Cancellation + Retention | MVP | S | Amended |
| F36 | Domain Migration Flow | MVP | M | Unchanged |
| F37 | /reports route | MVP | M | Unchanged |
| F38 | Subscription Pause | MVP | S | Unchanged |
| F39 | Competitor Removal | MVP | XS | Unchanged |
| F40 | Multi-Domain Scale Tier | MVP | M | Unchanged |
| F41 | Cmd-K command bar | MVP | M | Unchanged |
| F42 | Trust Center /trust + SOC 2 | MVP | L | Amended |
| F43 | Vulnerability disclosure + bounty | MVP | XS | Unchanged |
| F44 | /changelog | MVP | S | Unchanged |
| F45 | Compact mode toggle | MVP | XS | Unchanged |
| F46 | Editorial error pages | MVP | S | Unchanged |
| F47 | State of AI Search 2026 | MVP+90 | XL | Unchanged |
| F48 | Agency Batch Onboarding | MVP+30 | M | **NEW** |
| F49 | Embeddable Score Badge | MVP+30 | S | **NEW** |
| F50 | Public Dogfooding Scan | Built MVP / Published MVP+30 | XS | **NEW** |
| F51 | Two-Tier Activation Model | MVP | M | **NEW** |
| F52 | Free Account Sample Data | MVP | S | **NEW** |
| F53 | Free Account Recovery Emails | MVP | S | **NEW** |
| F54 | Refund Risk: Agent-Run Caps | MVP | S | **NEW** |

**Total: 54 features. 48 MVP / 1 Post-MVP (F26) / 1 MVP+90 (F47) / 3 MVP+30 (F48, F49, F50 publish) / 1 MVP+30 publish + MVP built (F50).**

---

*End of PRD v5. This document is the canonical build specification for the Beamix wedge launch. Build Lead starts from this document. Acceptance criteria in §5 are the definition of done for each feature. Tier 0 infrastructure completes before any feature build begins.*

*PRD v4 (2026-04-29), v3, v2, and v1 are deprecated. Do not reference any prior version for feature decisions.*
