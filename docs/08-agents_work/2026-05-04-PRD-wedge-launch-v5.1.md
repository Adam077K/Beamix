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

**Renewal anchor:** The Day-14 event-triggered email — "a developer found you on Claude" — is the emotional renewal moment. Day-14 is measured from **Paddle checkout** (NOT signup, NOT Brief signed — per Q4/Q7 lock activation event redefinition). The trigger fires only for customers who reached the Paid Customer state and had ≥1 attribution event in their first 14 days post-checkout. The Monthly Update is the artifact Marcus forwards to Aria and his board chair. The forwarded PDF is the word-of-mouth lever.

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

**Phase 4 — `vertical-confirm`** (was Phase 5 in v5 pre-Q6-lock; was Step 1 in v4)
- Confidence indicator: "92% sure you're B2B SaaS."
- One-click confirm or change.
- `business_id` created on confirmation.

**Phase 5 — `brief-co-author`** (was Phase 6 in v5 pre-Q6-lock; was Step 2 in v4, enhanced per Q3)
- Three Claims pre-filled from scan data via Claude (customer reviews + edits, not types from blank).
- Right-column preview: shows what an /inbox item will look like with inline Brief grounding citation (`Authorized by your Brief: "[clause]" — clause N · Edit Brief →`). Teaches the architectural commitment in-context.
- Fraunces clauses on cream paper. Heebo 300 italic loaded if `[lang="he"]` (Q2 lock).
- "Send setup instructions to your developer" button: vertical-aware (SaaS = UTM-first; e-commerce = Twilio-first).

**Phase 6 — `brief-signing`** (was Phase 7 in v5 pre-Q6-lock; was Step 3 in v4)
- Seal stamps in 540ms using stamping easing curve. "— Beamix" in 300ms opacity fade.
- Arc's "Hand" dot present (1px ink-1 dot, fades in at t=120ms, fades out with seal-fade).
- "Print this Brief →" link appears post-Seal (F27).
- "Security & DPA" footer link (Q5 lock — small, 13px ink-3, below signature area. Link to /trust).
- 14-day money-back guarantee footer line (small, 13px ink-3).
- `brief_id` created on Seal landing.
- 10-minute undo window opens (F32).

**Phase 7 — `truth-file`** (was Phase 8 in v5 pre-Q6-lock; was Step 4 in v4)
- Vertical-conditional fields: `hours` and `service_area` fields are HIDDEN for SaaS vertical (O-18 fix).
- Three Claims already pre-filled from Phase 5 — customer reviews and edits, not enters from blank.
- `truth_file_id` created on completion.

**Phase 8 — `complete`** (post-onboarding, first dashboard visit — was Phase 9 in v5 pre-Q6-lock)
- If Paid Customer: standard /home with agents active. Day-1 auto-trigger pipeline fires (scan → rules engine → first 2-3 agent runs).
- If Free Account: /home with sample data populated (F52). "Activate agents" banner prominent.

**Phase 9 — `paid-activation`** lives on /home (NOT in /start flow)
- Triggered when customer clicks "Activate agents" on /home Free Account state.
- Paddle inline modal appears within /home. No external Paddle redirect.
- Pre-selects Discover ($79) by default. "Choose a different plan" link expands tier picker.
- Trial clock starts at successful Paddle checkout (Q4 + Q7 lock: activation event = Paddle checkout, NOT signup, NOT Brief signed).
- On completion: `paddle_subscription_id` created. Customer transitions to **Paid Customer** state (see F51).
- `paddle_subscription_id` is created at Phase 9 on /home, NOT at any phase within /start.

---

### Two-tier activation model (Q6 lock — see F51 for full spec)

| State | How customer enters | What they can do |
|-------|---------------------|-----------------|
| **Free Account** | Completed Phase 6 (Brief signed) but has not completed Phase 9 (Paddle) | View /home with sample data. See real scan results. No agent runs. |
| **Paid Customer** | Completed Phase 9 (Paddle checkout on /home) | All agents active. Trial clock running. Full product. |

The Paddle checkout is NOT forced during /start. Customer can dismiss the Paddle modal and continue to Brief signing as a Free Account. Conversion happens when the customer is ready — from /home "Activate agents" CTA.

---

### Data carried across phases (integrity contract)

| Entity | Created at phase | Carried forward to |
|--------|-----------------|-------------------|
| `scan_id` | Phase 0 or 1 | All subsequent phases |
| `user_id` | Phase 3 | All subsequent phases |
| `business_id` | Phase 4 | Phase 5, 6, 7, /home |
| `brief_id` | Phase 6 | Phase 7, all agent runs |
| `truth_file_id` | Phase 7 | All agent runs |
| `paddle_subscription_id` | Phase 9 on /home (NOT in /start) | /home, billing, agent runs |

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
ALTER TABLE brief_quarterly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY brief_quarterly_reviews_owner_select ON brief_quarterly_reviews
  FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY brief_quarterly_reviews_owner_insert ON brief_quarterly_reviews
  FOR INSERT WITH CHECK (customer_id = auth.uid());
```

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

**What it does:** The unified `/start` route absorbs all entry paths into one continuous experience. 8 phases within /start: `enter-url → scanning → results → signup-overlay → vertical-confirm → brief-co-author → brief-signing → truth-file`. Completes at /home. Phase 9 (paid-activation / Paddle) lives on /home, not within /start. (Q6 lock: Paddle moved out of /start so customer can reach Brief as Free Account.)

See §4 Architecture Overview for full phase-by-phase spec.

**Key v5 changes from v4 F2:**
- Paddle is NOT in the /start flow. It is an inline modal on /home (Phase 9) that can be dismissed. Customer proceeds through /start to Brief signing as a Free Account without any Paddle step.
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
- [ ] Phase 4 (vertical-confirm): vertical classification shown with confidence indicator. One-click confirm or change.
- [ ] Phase 5 (brief-co-author): Three Claims pre-filled from scan data. Customer reviews + edits. Right-column preview shows /inbox item with inline Brief grounding citation.
- [ ] Phase 5: `hours` and `service_area` fields absent for SaaS-classified customers.
- [ ] Phase 5: Heebo 300 italic loaded and active on `[lang="he"]` pages as Fraunces companion font.
- [ ] Phase 5: "Send setup instructions to your developer" button present. Vertical-aware (SaaS = UTM first; e-commerce = Twilio first).
- [ ] Phase 6 (brief-signing): Brief consistency check runs before Seal. Contradictions surfaced to customer.
- [ ] Phase 6: Seal stamps in 540ms with stamping curve. "— Beamix" in 300ms opacity fade. Arc's "Hand" dot present.
- [ ] Phase 6: "Print this Brief →" link appears post-Seal (F27 spec applies).
- [ ] Phase 6: "Security & DPA" footer link visible (13px ink-3, links to /trust).
- [ ] Phase 6: 14-day money-back guarantee footer line visible (13px ink-3).
- [ ] Phase 6: 10-minute undo window opens after Seal lands (F32 spec applies).
- [ ] Phase 7 (truth-file): `hours` and `service_area` fields hidden for SaaS customers.
- [ ] Phase 7: Three Claims shown as pre-filled editable chips (not blank fields).
- [ ] Phase 7: Optional `office_address` field shown — cream paper register, Fraunces 300 italic label "Mailing address (optional — for shipping a Beamix gift at month 6)." Fields: line1, line2, city, state, postal, country. Not required to advance.
- [ ] `customer_profiles` table has `office_address jsonb` column (add to Tier 0 migrations if missing).
- [ ] Skip-cinema option visible for customers who have ≥1 prior signed Brief. Skips Phases 0–4 (scan cinema), enters at Phase 5 with pre-populated data from prior Brief as starting point.
- [ ] Dual-tab lock: if Phase 5 brief-co-author is open in two tabs, second tab shows "another session is editing — return there or take over."
- [ ] Flow is bookmarkable: each phase has URL state `/start?phase=[slug]`. Refresh restores to same phase.
- [ ] On completion as Paid Customer: first agent run queued automatically within 5 minutes.
- [ ] On completion as Free Account: /home shows sample data per F52.
- [ ] Onboarding completes in under 4 minutes for median Paid Customer path (Phases 3–7).
- [ ] Phase 9 (paid-activation on /home): Paddle inline modal triggered by "Activate agents" CTA. No redirect. On completion: `paddle_subscription_id` created and customer enters Paid Customer state.

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

**What it does:** Before any agent publishes any content or schema change, a validation step runs through a separate validator service. Five mandatory rules: (1) Claim verification against Truth File, (2) Brand Voice Fingerprint match, (3) Prohibited-term check, (4) Vertical-specific rules, (5) Sensitive-topic classifier. Validator binding uses a cryptographic signed token (60s TTL, bound to draft hash). Even on Full-auto mode, `uncertain` outcome → /inbox. No `ctx.publish()` escape exists.

**Acceptance criteria:**
- [ ] Every agent action producing customer-facing content routes through `ctx.validate(draft)` BEFORE `ctx.propose()` — no exceptions
- [ ] Validator is a separate server process. Agents have no direct write access to L4 site integration.
- [ ] `validate()` returns a signed token (60s TTL). `propose()` requires this token. Hash mismatch = propose rejected.
- [ ] First-party agents run against the same validator sandbox as future third-party agents — no privileged bypass
- [ ] `uncertain` validation outcome routes to /inbox regardless of customer's autonomy setting
- [ ] Validator unavailable for >15 minutes → all publishing suspended → /inbox banner "Beamix is in safe mode"
- [ ] Brand Voice Fingerprint computed at onboarding from customer's existing site. Cosine threshold: 0.85 for content, 0.75 for schema/FAQ.
- [ ] Auto-revise: validator calls `ctx.revise(draft, failures)` once. If revised draft passes, propose. If not, hard block.
- [ ] Validation failure reason shown to customer in plain English
- [ ] Review-debt counter visible at top of /inbox and in /home "Inbox pointer line"
- [ ] Per-agent autonomy levels: Always ask (default) / Ask for new types, auto-approve repeats (after 10 approvals) / Full-auto with weekly summary (after 30 approvals in a category)
- [ ] All 5 validator rules run on every propose — no partial validation

**Dependencies:** Truth File (F3), Brand Voice Fingerprint system, /inbox surface (F6)

**Amendment v5 (2026-05-04) — Billing placement:**
Pre-publication validation runs only for Paid Customers. Free Accounts (post-Brief, pre-Paddle) do not trigger agent runs and therefore do not reach the validator. The validator's relationship to Paddle is: `subscription.status = 'active'` is checked before any agent job dispatch. Free Account state means `subscription.status = 'free_account'` (no Paddle subscription yet) — agent dispatch is blocked.

**Amendment acceptance criteria (added in v5):**
- [ ] Agent dispatch blocked if `subscription.status` is `'free_account'` — no validator calls for Free Account state

**Priority: MVP**

---

### Feature 5: /home — the daily destination

**What it does:** Primary product surface. 8 locked sections in vertical scroll.

**Tier badge canonical strings (no variation, no other wording):**
- **Discover:** "Discover · 3 engines · 4 agents"
- **Build:** "Build · 6 engines · 6 agents"
- **Scale:** "Scale · 11 engines · 6 agents (+ 12 locked)"

**Section breakdown:**
1. **Hero score block** — AI visibility score (0–100) with Activity Ring, 12-week sparkline (rendered at full state at t=0, no path-draw entrance — Board 2 lock), delta vs last week, 1-line plain-English diagnosis
2. **Top 3 fixes ready** — RecommendationCards, "Run all — N credits" CTA
3. **Inbox pointer line** — count of items awaiting review. When zero: "Nothing needs your attention."
4. **KPI cards row** — Mentions / Citations / Credits used / Top competitor delta
5. **Score trend chart** — 12-week line, hover tooltips. No path-draw entrance animation.
6. **Per-engine performance strip** — engine pills (3 for Discover / 11 for Build+)
7. **Recent activity feed** — last 8 events (agent names used here)
8. **What's coming up footer** — next scheduled scan, next digest send, next billing date

**New elements on /home (Board 2 additions):**
- **Cycle-Close Bell** (F23): fires once per weekly cycle completion
- **Receipt-That-Prints card** (F25): appears above Evidence Strip on Monthly Update generation day
- **Brief binding line** (F31): 13px Fraunces 300 italic, ink-3, centered, anchored 24px above page footer chrome

**Activity Ring (Board 2 re-spec):**
- Renders at full geometry at t=0. No 1500ms ring-draw entrance animation (Board 2 lock).
- Ring stays still when agents are acting — TopbarStatus dot is the "agent acting" signal. `motion/ring-pulse` cut entirely (Board 2 lock).
- `motion/score-fill` cut on returning sessions. First-scan-ever keeps count-up moment. Subsequent visits: score renders at final value at t=0.

**Margin column:** Cut from /home Receipts. The Margin (typographic edge) survives only on artifact surfaces (Monthly Update PDF, Monday Digest header strip) with temporal decay: full opacity current week, 20% prior month, 6% archived.

**Changes from v2:**
- Ring entrance animation cut (Board 2 lock)
- ring-pulse motion token cut (Board 2 lock)
- score-fill on returning sessions cut (Board 2 lock)
- Sparkline path-draw entrance cut — renders at full state at t=0
- Margin column cut from Receipts
- Cycle-Close Bell (F23), Receipt-That-Prints (F25), Brief binding line (F31) added

**Acceptance criteria:**
- [ ] Tier badge renders exact canonical string — no other wording
- [ ] Activity Ring renders at full geometry at t=0 — no ring-draw entrance animation, no ring-pulse
- [ ] Score renders at final value at t=0 on returning sessions. count-up preserved for first-scan-ever only.
- [ ] Score sparkline renders at full state at t=0 on all loads (no path-draw entrance animation)
- [ ] Lead Attribution empty state is vertical-aware: SaaS = UTM-first copy. E-comm = Twilio-first copy.
- [ ] Margin column absent from home Receipts/activity feed rows
- [ ] Cycle-Close Bell fires per F23 specification on cycle completion
- [ ] Receipt-That-Prints card renders per F25 specification on Monthly Update generation day
- [ ] Brief binding line present per F31 specification — 13px Fraunces 300 italic, ink-3, centered, anchored 24px above footer chrome
- [ ] Page loads in <2s LCP on desktop, <3.5s on mobile
- [ ] Bottom mobile nav: /home · /inbox · /scans · /crew

**Dependencies:** Scan engine, agent system, Lead Attribution Loop (F12), Activity Ring, Rough.js, F23, F25, F31

**Amendment v5 (2026-05-04) — Free Account state on /home:**
When customer is in Free Account state (post-Brief, pre-Paddle), /home renders with sample data per F52. A persistent banner appears at the top of /home: "Beamix is ready — activate your agents to start improving your AI visibility." With a prominent "Activate agents →" CTA that opens the Paddle inline modal. The Activate banner uses a distinct token treatment (see Design System Canon §11). Real scan data (score, cartogram, per-engine strip) is shown using actual scan results from Phase 1–2. Agent activity feed and /inbox items are populated with sample data (marked with a subtle "Sample" label visible only to the Free Account customer, not on shared artifacts).

**Amendment acceptance criteria (added in v5):**
- [ ] Free Account banner: "Beamix is ready — activate your agents to start improving your AI visibility." with "Activate agents →" CTA
- [ ] Free Account banner absent for Paid Customers
- [ ] Free Account /home shows real scan data (actual score, real per-engine results)
- [ ] Free Account /home shows sample agent data per F52 (marked "Sample" to Free Account customer)

**Priority: MVP**

---

### Feature 6: /inbox — consent surface

**What it does:** 3-pane Linear-pattern review queue. Left rail: filters (by agent, source, priority). Center: item list with J/K keyboard navigation and multi-select. Right: content preview with sticky ActionBar (Approve `A` / Reject `X` / Request Changes `R`). Tabs: Pending (default) / Drafts / Live. Max-width: **1280px**.

**Seal on approval (Board 2 re-spec):** Seal-draw fires on single-item approval (click, NOT hover). Foreshadowing-on-hover cut entirely. Bulk-approve does NOT trigger Seal-draw animation.

**Brief grounding citation (F30):** Every item in /inbox row detail shows the authorizing Brief clause citation inline. See F30 for specification.

**Acceptance criteria:**
- [ ] Max-width of /inbox is 1280px
- [ ] J/K keyboard navigation works through item list without mouse
- [ ] Shift-click selects a range of items. Cmd+A selects all visible items in current filter view.
- [ ] When items selected: "Approve N items" button appears. Bulk-approve does NOT trigger Seal-draw animation.
- [ ] Seal-draw fires on individual approval click ONLY — never on hover over approve button (Board 2 lock)
- [ ] Brief grounding citation visible in /inbox row detail per F30 specification
- [ ] Review-debt counter visible at top of inbox and echoed on /home
- [ ] Each item shows: agent name, action type, before/after diff, Truth File references, provenance envelope fields
- [ ] "Request Changes" opens plain-text note field — agent re-runs with note as context
- [ ] Empty state: Rough.js hand-drawn illustration + "Inbox zero. Beamix is working."
- [ ] Cross-client bulk-approve: NOT in MVP, explicitly deferred to MVP-1.5
- [ ] Brief binding line present per F31 specification
- [ ] Sample /inbox items (F52) marked "Sample" visible to Free Account customer in appropriate treatment

**Dependencies:** Agent system, pre-publication validation (F4), Seal component (re-curved), Rough.js, F30, F31

**Priority: MVP**

---

### Feature 7: MVP agent roster (6 agents)

**Voice Canon Rule (all agents):** Agents are named on in-product surfaces (/home, /crew, /workspace, /inbox row attribution). "Beamix" is used on all external surfaces (emails, PDFs, Monthly Update permalinks, OG cards). Onboarding seal signs "— Beamix." No agent names appear in emails or PDFs. This is Model B — non-negotiable.

**Deterministic seed-per-agent (Board 2 lock):** Each agent's Rough.js monogram uses `seed(agentUuid) → path`. The same fingerprint recurs across every surface (monogram, PDF, OG card, email header). The seed-to-path function is brand canon, not codebase — changing it across versions is forbidden in the same way changing the Apple logo is forbidden. See Design Lock E in §3.

---

#### Agent 1 — Schema Doctor (MVP)
Audits and repairs JSON-LD structured data (Organization, Product, FAQ, Service, BreadcrumbList). Generates `llms.txt` manifest. SaaS: generates SoftwareApplication schema. E-commerce: generates Product + Offer schema. Every change goes through /inbox for approval.

#### Agent 2 — Citation Fixer (MVP)
Identifies 3–5 pages most likely to be cited by AI engines. Adds quotable-passage blocks optimized for citation grammar. Surgical additions only. Every addition goes through /inbox.

#### Agent 3 — FAQ Agent (MVP)
Generates 8–12 FAQ entries per customer based on vertical KG query patterns, Truth File, and multi-turn AI engine query analysis. Generates voice-search variants as secondary output.

#### Agent 4 — Competitor Watch (MVP, gated at Build+ tier)
Monitors citation patterns of up to 5 competitors across all 11 engines. Surfaces: when a competitor gains share, why, and what the customer can do about it. Gated at Build ($189) and Scale ($499).

#### Agent 5 — Trust File Auditor (MVP)
Runs weekly consistency checks. Catches hallucinations. Surfaces conflicts to /inbox only when discrepancy found.

#### Agent 6 — Reporter (MVP)
Generates Monday Digest and Monthly Update. External surfaces signed "— Beamix." See F14 and F22, F25, F28 for artifact additions from Board 2.

---

**Agents deferred (not in MVP):**
- Brand Voice Guard — MVP-1.5
- Long-form Authority Builder — MVP-1.5
- Content Refresher, Trend Spotter, Citation Predictor, Local SEO Specialist — Year 1
- Voice AI Optimizer, Visual/Multimodal Optimizer, Agent-Mediated Browsing Specialist, Reputation Defender, Industry KG Curator — Year 1 or later

**Priority: MVP**

---

### Feature 8: /workspace — agent execution viewer

**What it does:** Real-time agent execution view. Vertical step list with live status, streaming output per step, agent tool usage. Linked from /home activity feed when agent is active.

**Board 2 change — execution-as-narration replaces walking figure:** The courier-flow walking figure animation is cut (Tufte: decorative theatre). Replaced with an execution-as-narration column: while a node executes, a plain-English sentence pushes to a reading column on the right side, replacing the inspector temporarily. Example: *"Schema Doctor is reading /pricing for FAQPage schema. 2.3 seconds."* The execution becomes narration. Honors the spirit of "agents at work, visible, attributed, real" without the chartjunk problem.

**Microcopy-rotate cut (Board 2):** `motion/microcopy-rotate` token cut. Replace with one static step-verb-noun summary per step ("Analyzing /pricing" — not a cross-fading carousel of substep labels).

**Brief grounding citation (F30):** Every /workspace step output shows the authorizing Brief clause citation inline per F30 specification.

**Acceptance criteria:**
- [ ] /workspace accessible to all tiers including Discover
- [ ] Step list subscribes to `agent:runs:{customer_id}` Supabase Realtime channel. Falls back to 10s polling if connection fails.
- [ ] Walking figure animation absent. Execution-as-narration column present on right side during active runs.
- [ ] Narration column pushes one plain-English sentence per executing node. Returns to inspector display after node completes.
- [ ] Each step shows: tool name, target URL or field, status, duration
- [ ] Static step-verb-noun summary per step — no microcopy-rotate cross-fade carousel
- [ ] Customer can view past /workspace sessions (linked from /scans Completed Items)
- [ ] Failed runs show which step failed, why in plain English, and rollback action taken
- [ ] Agent name shown in /workspace header (in-product surface, Voice Canon Model B)
- [ ] Brief grounding citation visible per F30 specification on step outputs
- [ ] Brief binding line present per F31 specification

**Dependencies:** Supabase Realtime, Inngest, F30, F31

**Priority: MVP**

---

### Feature 9: /scans — historical record

**What it does:** Stripe-table-style scan history. 3 tabs: All Scans / Completed Items / Per-Engine. 4 work-attribute lenses as filter pills: Done / Found / Researched / Changed.

**Board 2 changes:**
- Margin column cut from /scans rows — recover 24px of horizontal real estate
- Per-engine mini-sparklines on row expansion: cut gradient (single 1.5px brand-blue stroke, no fade from ink-4 to brand)
- Engine micro-strip replaces 11 colored dots per row (56px-wide sparkbar showing 11 columns at 4px wide, column height 0–12px encoding engine delta)
- AI Visibility Cartogram (F22) renders on /scans/[scan_id] detail page

**Acceptance criteria:**
- [ ] All Scans tab: reverse-chronological, last 90 days default
- [ ] Completed Items tab: agent-completed actions with before/after state and "Rollback" button
- [ ] Per-Engine tab: per-engine score history as sparklines for all 11 engines — single 1.5px brand-blue stroke, no gradient
- [ ] 4 lens pills are action-tags (Done / Found / Researched / Changed)
- [ ] Margin column absent from all /scans rows
- [ ] Engine micro-strip (56px sparkbar, 11 columns, delta-encoded heights) replaces 11 colored dots per row
- [ ] "Share this scan" generates a public URL on demand (private by default) using nanoid21 format
- [ ] AI Visibility Cartogram renders on /scans/[scan_id] detail page per F22 specification
- [ ] Each scan row links to the /workspace session for that scan (if available)
- [ ] Brief binding line present per F31 specification
- [ ] Brief grounding citation visible in Done lens row expansion per F30 specification

**Dependencies:** Scan engine, F22, F30, F31

**Priority: MVP**

---

### Feature 10: /competitors — intelligence surface

**What it does:** Competitor citation dashboard. Table with Rivalry Strip on row click.

**Board 2 changes:**
- Margin column cut from /competitors rows
- Rivalry Strip dual-sparkline: 80ms stagger cut. Both lines render simultaneously, instantly, static. No path-draw entrance animation.
- Per-engine gradient cut on sparklines — single 1.5px brand-blue for customer, ink-2 at 40% for competitor

**Acceptance criteria:**
- [ ] Table shows up to 10 competitors (5 vertical-KG-pre-populated + up to 5 customer-added)
- [ ] Rivalry Strip opens as right-side panel on row click
- [ ] Rivalry Strip dual-sparkline: both lines render simultaneously at t=0 with no stagger and no path-draw animation
- [ ] Customer sparkline: 1.5px brand-blue. Competitor sparkline: ink-2 at 40%. No color gradient on either.
- [ ] Margin column absent from all /competitors rows
- [ ] Gated at Build ($189) and Scale ($499) — Discover sees competitor table with blurred Rivalry Strip and upgrade CTA
- [ ] Pre-populated competitors display "Beamix detected" badge
- [ ] Brief binding line present per F31 specification

**Dependencies:** Scan engine, Competitor Watch agent (F7)

**Priority: MVP (gated at Build+)**

---

### Feature 11: /crew — power-user customization

**What it does:** The 6 MVP agents displayed as a Stripe-style table. Monogram column: 16×16 deterministic-seed Rough.js mark per agent (seed from agent UUID — Board 2 lock). Size-conditional rendering: under 16px = color disc only; 16–32px = 2-letter monogram; above 48px = 2-letter + name label below.

**2-letter monograms locked (Board 2):** SD (Schema Doctor), CF (Citation Fixer), FA (FAQ Agent), CW (Competitor Watch), TFA (Trust File Auditor → TF), RP (Reporter). InterDisplay 500 caps. Below 16px: color disc only.

**18 agent colors locked before MVP launch** (test at 12px on cream paper for discrimination; document in design system as canon).

**Yearbook framing:** Preserved only in ceremonial states: (1) empty/first-load animation and (2) per-agent profile pages at `/crew/[agent-id]`.

**Acceptance criteria:**
- [ ] Default rendering is Stripe-style table: Agent / State / This week / Last action / Success rate
- [ ] Monogram column shows 16×16 deterministic-seed Rough.js mark per agent (seed = agent UUID). Same fingerprint across all surfaces.
- [ ] 2-letter monograms: SD, CF, FA, CW, TF, RP (or confirmed set before launch). InterDisplay 500 caps.
- [ ] Size-conditional rendering: <16px = color disc only; 16–32px = 2-letter monogram; >48px = 2-letter + name label
- [ ] 18 agent colors locked and tested at 12px on cream paper before MVP launch. Documented in design system.
- [ ] Row-expand shows: autonomy level selector, custom instructions (500-char), schedule override, manual trigger, last 10 actions, first-person blurb
- [ ] 6 active agent rows + 5 "Coming soon Q3 2026" rows below (lighter ink, no clickable actions)
- [ ] Per-agent autonomy level is independent per agent and per client
- [ ] Scale customers see `+ New Workflow` button (F19). Build customers see button but clicking opens upgrade modal.
- [ ] /crew accessible from mobile bottom nav as 4th item
- [ ] Brief binding line present per F31 specification

**Dependencies:** Deterministic seed-per-agent system (Tier 0 item 7), F19, F31

**Priority: MVP**

---

### Feature 12: Lead Attribution Loop

**Acceptance criteria:**
- [ ] Twilio number provisioned within 2 minutes of customer enabling Lead Attribution
- [ ] UTM-tagged URL auto-generated and visible in /settings → Lead Attribution tab
- [ ] Step 2 onboarding shows UTM panel first for SaaS-classified customers, Twilio-first for e-commerce
- [ ] "Send to developer" button sends plaintext snippet within 60 seconds
- [ ] 72-hour verification check: reminder email fires if neither Twilio nor UTM detected
- [ ] All customer-facing copy says "calls + UTM-attributed clicks" — not "form submissions"
- [ ] Event-triggered emails fire within 5 minutes of trigger event
- [ ] Monday Digest includes "this week: N attributed calls/clicks" line when data available
- [ ] Monthly Update PDF includes lead-attribution headline as opening line
- [ ] KPI card "Attributed Calls" in /home shows call count + delta

**Dependencies:** Twilio, UTM tracking, Resend, Inngest

**Amendment v5 (2026-05-04):** Twilio number provisioning trigger fires at Phase 9 Paddle checkout completion on /home — the paid-activation moment. Free Account customers do not receive Twilio numbers until Paddle checkout completes. AC "Twilio number provisioned within 2 minutes" applies from Paddle checkout (not Brief signing — Paid Customer state required).

**Amendment v5 (2026-05-04) — P9 Day-14 anchor:** Day-14 evangelism email trigger: Day-14 measured from **Paddle checkout** (NOT signup, NOT Brief signed — per Q4/Q7 lock activation event redefinition). Fires only for customers who reached Paid Customer state and had ≥1 attribution event in their first 14 days post-checkout.

**Priority: MVP**

---

### Feature 13: /settings

**What it does:** Settings with tabs. Per-client white-label config in multi-client switcher context.

**New in v3:**
- "Print operations summary" sub-page added (F29)
- Brief tab: includes "Regenerate Brief" and manual Brief editing flow (required for F24 quarterly re-reading)
- Optional office address field (used for F26)

**Tabs:**
- **Profile:** name, email, domain
- **Billing:** Paddle portal link, current tier, usage, top-up pack
- **Notifications:** email preferences, digest frequency
- **Business Facts (Truth File):** structured form editor, vertical-specific fields only
- **Lead Attribution:** Twilio number, UTM URL, attribution settings, verification status
- **Brief:** view + edit current Brief, re-generate option
- **Phone numbers:** Twilio numbers across clients
- **Per-client white-label (Scale only):** agency logo, brand color, email signature name, "Powered by Beamix" footer toggle
- **Print operations summary:** new sub-page per F29

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

**What it does:** Three categories of email. Day 1-6 silence cadence. Monthly Update PDF.

**Monthly Update PDF additions from Board 2:**
- Page 2 is now the AI Visibility Cartogram (F22)
- "What Beamix Did NOT Do" line added on Page 6 above closing Seal (F28)
- Margin (typographic edge) survives on Monthly Update PDF with temporal decay (full opacity current week; 20% prior month; 6% archived)

**Acceptance criteria:**
- [ ] Day 0 T+10min welcome email fires within 15 minutes of onboarding completion
- [ ] Day 2 email fires only when first /inbox item is created AND customer has not logged in that day
- [ ] Day 4 email: weekend-skip rule applies (send on next Monday if Saturday/Sunday)
- [ ] Day 5 email: only fires if Day 4 not opened AND customer has not logged in that day
- [ ] Monday Digest delivers plain text. Subject format: "Beamix · [date range]: [top metric]"
- [ ] Monthly Update PDF Page 2 is AI Visibility Cartogram per F22 specification
- [ ] Monthly Update PDF Page 6 includes "What Beamix Did NOT Do" line per F28 specification
- [ ] Margin on Monthly Update PDF uses temporal decay: full opacity for current week, 20% prior month, 6% archived
- [ ] Monthly Update PDF attachment included in delivery email regardless of permalink privacy
- [ ] Event-triggered attribution emails fire within 5 minutes of trigger event
- [ ] All emails signed "— Beamix" (Voice Canon Model B)
- [ ] "Powered by Beamix" Geist Mono 9pt footer in white-label emails (default ON, toggleable)
- [ ] All emails include one-click unsubscribe (CAN-SPAM compliance)
- [ ] Day 1-6 cadence default-ON for weeks 1–4. Opt-in after week 4.
- [ ] 3 Free Account recovery email templates present per F53 specification

**Dependencies:** Resend, Inngest, React-PDF, F22, F28

**Amendment v5 (2026-05-04):** Email template count updated from 15 → 18 (added 3 Free Account recovery templates per F53). Updated again for F55 Pre-Brief Abandonment Recovery (3 more) and F56 Cookie Consent Banner (1 — for cookie revocation confirmation). Total Resend templates at MVP: ~22.

**Priority: MVP**

---

### Feature 15: 11 text AI engine coverage

**Engine abbreviation corrections (Board 2):** "AI" → "AO" (Google AI Overviews). All 11 abbreviations rendered side-by-side at 11px before launch copy lock. Bing Copilot abbreviation: "MS" → "CP". ChatGPT: confirm "CG" vs "GP" at legibility audit.

**Acceptance criteria:**
- [ ] All 11 engines return citation data within 24 hours of scan trigger
- [ ] Scan failures retried automatically within 2 hours
- [ ] Citation envelope minimum fields: surface, query, brand_mentions, competitor_mentions, is_mentioned, citation_context
- [ ] Per-engine score (0–100) calculated and displayed in /home per-engine strip
- [ ] Discover tier: 3 engines (ChatGPT, Perplexity, Google AI Overviews recommended). Remaining 8 locked/grayed with upgrade CTA.
- [ ] Engine abbreviations: "AI" renamed "AO", all 11 tested at 11px before launch
- [ ] Cost ceiling instrumentation per-account — required at MVP

**Priority: MVP**

---

### Feature 16: 2 vertical knowledge graphs (SaaS + e-commerce)

*(No changes from v2.)*

**Acceptance criteria:**
- [ ] Domain detection classifies signups into SaaS or e-commerce with ≥80% accuracy
- [ ] Competitor set pre-populated with 5 domain-specific competitors from vertical KG on first scan
- [ ] Brief template uses vertical-appropriate language
- [ ] FAQ Agent generates vertical-specific questions
- [ ] Schema Doctor emits correct schema type

**Priority: MVP**

---

### Feature 17: Marketplace (re-spec without rewards)

*(No changes from v2. Browse + install Beamix-curated workflows only at MVP. Workflow publishing defers to MVP-1.5.)*

**Acceptance criteria:**
- [ ] At least 4 Beamix-authored workflows at launch
- [ ] Discover tier: full catalog visible, all install buttons show upgrade CTA
- [ ] Build tier: install up to 3 workflows
- [ ] Scale tier: unlimited installs
- [ ] No leaderboards, no rev-share references, no grant references, no Hall of Fame
- [ ] Workflow publishing by Scale users: NOT available at MVP

**Amendment v5 (2026-05-04):** At MVP, Marketplace is read-only — customers can browse + install Beamix-curated workflows. Workflow publishing (customer-authored workflows shared publicly) defers to MVP-1.5.

**Priority: MVP (constrained)**

---

### Feature 18: Incident runbook + rollback + Truth File integrity job

*(No changes from v2.)*

**Acceptance criteria:**
- [ ] Every agent-published action stores a revert payload at creation time
- [ ] Customer can rollback any action from /scans → Completed Items with single "Rollback" button
- [ ] Rollback completes within 60 seconds for content changes; within 5 minutes for schema changes
- [ ] Rollback confirmation email sent automatically
- [ ] Internal incident runbook written pre-launch
- [ ] Truth File integrity-hash nightly job: >50% field loss in 24h → Sev-1 alert + auto-pause all agents + /inbox banner
- [ ] Kill switch admin tool: one-click suspension of any marketplace workflow across all customers within 60 seconds

**Priority: MVP (pre-launch requirement)**

---

### Feature 19: Workflow Builder

**What it does:** Visual DAG editor built on React Flow. Tier-gated to Scale ($499) only for building and editing.

**Board 2 changes:**
- Canvas background: dot grid replaced with cream paper at 30% over paper-default (Design Lock C in §3). The canvas becomes a sheet of paper on which workflows are composed.
- Node anatomy: 24px category header strip (color-coded by category) + 12×12 status token. Cut: 16×16 monogram inside node body AND 1px agent-color left stripe. Header strip alone carries identity; status token carries state. (Board 2 lock — four redundant identifications reduced to two.)
- Node dimensions: 240×88 → 220×72. Config-summary line drops into inspector.
- Connection handles: visible at low priority always (1px ink-4 ring, 6×6). Brighten to brand-blue dot on hover. Not hidden until hover.
- Brief grounding cell in inspector: KEEP cream + Fraunces 300 italic (Board 2 lock — Design Lock B in §3). First selection per session: cell fades in over 400ms with one-time Trace under the clause. Subsequent selections: 120ms fade. The constitution feels invoked, not routine.

**Round 1 changes (2026-04-28 design doc lock):**
- Narration column replaces walking figure animation: during dry-run execution, the right inspector temporarily transforms into a narration column. Each executing node pushes a plain-English sentence (*"Schema Doctor is reading /pricing for FAQPage schema. 2.3s."*). 18px Inter 400 sentences, 12px gap. Active sentences in `--color-ink`; completed fade to `ink-2` over 30s. Narration column transitions back to inspector with 200ms cross-fade on dry-run complete. Full spec: `docs/08-agents_work/2026-04-28-DESIGN-workflow-builder-canvas-v1.md`.
- Skip-cinema option for users with ≥1 prior signed Brief: "You've done this before. Skip the ceremony and use defaults →" — Geist Mono 11px, `--color-ink-3`. Appears at Phase 5 (BriefCoAuthor) bottom. Locks Yossi at MVP partial-relief; full agency mode at MVP+30.

**Scope at MVP Day 1:**
- React Flow DAG editor — cream-paper canvas (30% over paper-default, not dot grid)
- 3–6 Beamix-authored workflow templates
- Trigger types at MVP: Schedule (cron-like UI) + Manual trigger only
- Action nodes at MVP: Run agent, Notify (Email + Slack), Conditional branch, Wait for condition
- Dry-run mode: `dry_run: true` flag on proposal envelope
- Per-step "Test this step" button
- Brief grounding visible per node (cream + Fraunces 300 cell in inspector per Design Lock B)
- Validation on every save: cycle detection, orphan node detection, cost estimate
- Linear versioning: 20 versions retained at MVP
- Resource conflict detection at save time

**Acceptance criteria:**
- [ ] React Flow DAG editor ships for Scale-tier users at MVP
- [ ] Canvas background is cream paper at 30% over paper-default — NOT a dot grid (Board 2 lock)
- [ ] Node anatomy: category header strip (color-coded) + status token ONLY. No 16×16 monogram in node body. No 1px agent-color left stripe.
- [ ] Node dimensions: 220×72px
- [ ] Connection handles: 1px ink-4 ring, 6×6, always visible. Brighten to brand-blue dot on hover.
- [ ] Trigger types at MVP: Schedule and Manual only. No event triggers.
- [ ] Dry-run mode: nothing writes to customer CMS. Output renders in /workspace.
- [ ] Dry-run execution: active node spotlighted (status indicator advances queued → running → completed → failed); 1 dot (4px brand-blue) travels per active edge at 480px/s via motion/path-draw.
- [ ] Narration column: during active dry-run, right inspector replaced by narration column. Each executing node pushes one sentence. 18px Inter 400, 12px gap, `--color-ink` active / `ink-2` completed. Narration column cross-fades back to inspector (200ms) on run complete. Walking figure animation absent.
- [ ] Brief grounding cell in inspector: cream paper + Fraunces 300 italic. First-per-session: 400ms fade-in + one-time Trace under clause. Subsequent: 120ms fade.
- [ ] Skip-cinema option visible for customers who have ≥1 prior signed Brief in their account. Appears at bottom of BriefCoAuthor phase: "You've done this before. Skip the ceremony and use defaults →" (Geist Mono 11px, `--color-ink-3`).
- [ ] Cycle detection, orphan node detection, cost estimate on every save
- [ ] Resource conflict detection at save time
- [ ] Linear versioning: "Save" creates new version. Last 20 retained.
- [ ] "Agency review gate" node type available in node palette (Scale only)
- [ ] Build-tier customers see upgrade modal on `+ New Workflow` click — not the editor
- [ ] Discover-tier customers see no workflow UI
- [ ] Brief grounding inline citation visible per F30 specification on Workflow Builder node inspector (1px rule + Inter italic variant, NOT cream cell — see F30 exception for WB Inspector which uses its own cream+Fraunces treatment per Design Lock B)
- [ ] Brief binding line present per F31 specification

**Design reference:** `docs/08-agents_work/2026-04-28-DESIGN-workflow-builder-canvas-v1.md`

**Deferred to MVP-1.5:** Event triggers, workflow publishing, loop node, run sub-workflow

**Priority: MVP (Scale-only)**

---

### Feature 20: /security public page

*(Voice canon: "cannot publish" not "refuses to publish" — per Board 2 Ive note. One-word change, massive trust signal.)*

**Acceptance criteria:**
- [ ] /security page live at beamixai.com at MVP launch
- [ ] Page is readable in 6 minutes at normal pace (target: 900–1200 words)
- [ ] All 10 sections have at least a paragraph of plain prose
- [ ] Sub-processors list maintained and linked
- [ ] GDPR DSAR endpoints documented with SLA
- [ ] No-training-on-customer-content statement explicit and prominent
- [ ] Twilio recording posture explicitly stated
- [ ] Contact for security disclosures present with response SLA
- [ ] Page is indexed (`noindex` NOT applied)
- [ ] Page linked from product footer, pricing page, onboarding Terms acknowledgment
- [ ] Copy uses "cannot publish" not "refuses to publish" (Board 2 voice canon note)
- [ ] Cream paper register KEPT on /security. Cream hex selection: research and confirm from 3 swatches on 3 displays before launch (current working value: #F7F2E8 — not final until swatch test).

**Amendment v4 (2026-04-28) — Aria's 5 fixes:**
1. §9 cryptographic primitive paragraph rewrite: name primitives (AES-256-GCM, Argon2id, libsodium, BoringSSL), name modes, name HMAC key storage (AWS KMS / Supabase Vault), rotation cadence (quarterly + 14d overlap), failure mode ("fails closed"), token format choice with reason (avoid JWT `alg=none`), static-analysis tool (Semgrep + custom AST rules)
2. Compliance section added + Trust Center link (covered by F42)
3. Bug bounty + security.txt section added (covered by F43)
4. Public DPA link at /trust/dpa (ungated; covered by F42)
5. Sub-processor table extended with 5 missing columns: controller/processor/joint-controller, underlying cloud, SOC 2/ISO 27001 status per sub-processor, last-audited-by-Beamix date, real DPA link per row (covered by F42 /trust/sub-processors)

**Priority: MVP (3 person-days)**

---

### Feature 21: Scale-tier DPA + agency indemnification clause

**Acceptance criteria:**
- [ ] Scale-tier DPA drafted before MVP launch
- [ ] Indemnification clause: lesser of (3× monthly subscription fee) or ($25,000/incident)
- [ ] Scope explicitly defined: covers errors that passed pre-publication validation
- [ ] DPA signed as part of Scale-tier checkout (Paddle)
- [ ] DPA accessible from /settings → Billing and /security page
- [ ] Tech E&O insurance bound before launch — minimum $1M/$1M

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

**What it does:** A moment of unrequested acknowledgment when the weekly scan completes and all auto-fixes have shipped. Equivalent to Apple Watch's haptic acknowledgment when rings close. Costs ~2 days of frontend work. Earns customer attention every Monday morning permanently.

**Trigger condition:** Weekly scan marked complete AND all auto-fix agent actions for that cycle have shipped (or been approved) within the same cycle window. Fires once per cycle-close per customer. Cannot replay in the same browser session.

**Sequence (total duration: 1,600ms):**
1. Activity Ring closes its 30° gap over 800ms (`motion/ring-close` — this is the ONE motion token kept for the Ring)
2. Simultaneously: surrounding KPI sparklines settle to their final positions with 200ms ease
3. Status sentence rewrites once: "Healthy and gaining." → "Cycle closed. {N} changes shipped this week."
4. Full state holds for 600ms
5. Ring re-opens at fresh 252° baseline (the next cycle's starting geometry)

**Non-replay rule:** Once the bell fires in a given session, it does not fire again regardless of navigation. The moment is not a notification; it is a curtain-close.

**Easing curves (Board 2 lock — distinct curves per motion moment):**
- Ring-close: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — smooth deceleration (the ring is settling, not bouncing)
- Sparkline settle: 200ms `ease-out`
- Status sentence rewrite: 150ms opacity cross-fade

**Why MVP:** The weekly cycle-close moment becomes the product's Monday morning presence. Customers who see it every week have a visceral sense that "Beamix finished." This is the kind of small, non-asked-for gesture that converts customers into evangelists. Engineering cost: ~2pd.

**Acceptance criteria:**
- [ ] Bell fires correctly on cycle close: scan complete + all auto-fixes shipped in cycle window
- [ ] Ring gap closes over 800ms with correct easing curve (smooth deceleration)
- [ ] KPI sparklines settle to final positions simultaneously with 200ms ease-out
- [ ] Status sentence rewrites from "Healthy and gaining." to "Cycle closed. {N} changes shipped this week." with 150ms opacity cross-fade
- [ ] Full state holds 600ms before ring re-opens at 252° baseline
- [ ] Does NOT fire if any auto-fix is still pending /inbox approval (all must be shipped or explicitly approved)
- [ ] Cannot replay in the same browser session (non-replay rule)
- [ ] Bell sequence does not fire on the first scan ever — only from second cycle onward (no data yet for "{N} changes shipped")
- [ ] Total sequence duration: 1,600ms from ring-close start to ring re-open

**Amendment v4 (2026-04-28) — Arc's "Wave" (preserved in v5.1):**
- Add: 60ms stagger left-to-right wave on the small-multiples sparkline strip BEFORE the settle animation. 11 cells × 60ms = 660ms total wave, then 200ms settle. (~1 day frontend)

**Dependencies:** F5 (/home), Activity Ring component, scan completion event (Inngest), agent action completion tracking

**Effort estimate:** ~2 person-days

**Priority: MVP**

---

### Feature 24: Brief Re-Reading — quarterly trigger

**What it does:** Once per quarter, on the customer's first Monday login of the new quarter, Beamix opens to the Brief — not /home — for up to 3 seconds. The Brief is the founding document; revisiting it quarterly keeps it alive and current. Closer to a LoveFrom royal cypher ceremony than any SaaS interaction pattern.

**Trigger:** First login of the quarter (Q1: Jan–Mar; Q2: Apr–Jun; Q3: Jul–Sep; Q4: Oct–Dec) on a Monday. Fires at most once per customer per quarter. Does not fire in the customer's first quarter (insufficient history).

**Presentation:**
- Full Brief page: cream paper, Fraunces clauses, standard Brief layout
- One editorial line at bottom: "It's been three months. Anything to update?" — 13px Inter 400, ink-3
- Two CTAs:
  - "Looks good →" (primary, right): refreshes Brief date stamp atomically; quarter marks as reviewed; redirects to /home
  - "Edit Brief →" (secondary, left): enters Brief editing flow in /settings → Brief tab
- Auto-redirect: if no CTA clicked within 3 seconds, redirect to /home automatically
- Customer can dismiss by clicking anywhere outside the two CTAs (same as "Looks good" — date stamps, quarter marks reviewed, redirects to /home)

**State management:**
- `brief_quarterly_reviews` table: `customer_id`, `quarter_key` (e.g., "2026-Q2"), `reviewed_at`, `action` ("looks_good" | "edit_brief")
- Before any Monday login, middleware checks if current quarter has a review record for this customer. If not: Brief intercept. If yes: skip.

**Why MVP:** The Brief is the constitutional document of every customer's account. A Brief that is never re-read drifts from reality within two quarters. The quarterly check costs 3 seconds of customer attention once per quarter. The "constitution stays alive" experience is the kind of thing that distinguishes Beamix from automation tools. Engineering cost: ~3pd.

**Acceptance criteria:**
- [ ] Triggers correctly: first Monday login of a new quarter, after customer's first quarter on platform
- [ ] Does NOT trigger in the customer's first quarter of use
- [ ] Full Brief page renders correctly: cream paper, Fraunces clauses, editorial line, two CTAs
- [ ] "Looks good →" click: updates `brief_quarterly_reviews` record atomically, redirects to /home within 200ms
- [ ] "Edit Brief →" click: navigates to /settings → Brief tab editing flow
- [ ] Auto-redirect to /home after 3 seconds if neither CTA clicked — timer visible as a subtle 3-second countdown line under the CTAs (1px ink-4, fading left-to-right)
- [ ] Dismiss (click outside CTAs) behaves as "Looks good →"
- [ ] Fires at most once per customer per quarter — subsequent Monday logins that quarter go directly to /home
- [ ] Timezone-aware: "Monday" is evaluated in customer's local timezone (derived from their account settings or browser)
- [ ] Does not interrupt if customer is in the middle of an /inbox approval flow (session detection: only fires on clean /home navigation, not mid-session tab switches)

**Dependencies:** Brief table (Tier 0), `brief_quarterly_reviews` table (new — add to Tier 0 Supabase migration), middleware, F13 (/settings Brief tab)

**Effort estimate:** ~3 person-days

**Priority: MVP**

---

### Feature 25: Receipt-That-Prints card

**What it does:** On the morning the Monthly Update PDF is generated (1st of the month, customer-local time), /home renders one new element above the Evidence Strip: a cream-paper card 96px tall with a paper-fold visual, Geist Mono date stamp, and a Fraunces 300 italic line reading "Your Monthly Update is ready." The card is the day-of moment — it exists only on the day it should. The email already notifies; this is the in-product presence.

**Visual treatment:**
- Card height: 96px
- Background: cream paper (matching `--color-cream` system token)
- Rough.js fold mark: deterministic seed keyed to `report_id` — a single vertical fold line, centered
- Date stamp: Geist Mono, 12px, ink-3, format: "APR · 2026"
- Body line: Fraunces 300 italic, 18px, ink-1: "Your Monthly Update is ready."
- CTA: "Read it →" — 13px Inter 500, brand-blue link, navigates to /reports/[report_id]
- Positioned: immediately above the Evidence Strip, below the KPI cards row

**Entrance animation (one-time):**
- 600ms paper-fold motion: clip-path reveal mimicking a sheet sliding from beneath another sheet
- Easing: `cubic-bezier(0.34, 0.0, 0.0, 1.0)` (the same stamping curve used by the Seal — material consistency)
- Animates in once on the morning it appears. Does not re-animate on page reload within the 24h window.

**Lifetime:**
- Appears within 1 hour of PDF generation on the 1st of the month (customer-local time)
- Stays visible for 24 hours
- After 24 hours: opacity-fades out over 600ms and disappears. Report is accessible in /reports going forward.
- Does not appear if customer navigated to /reports and read the report within the 24h window

**Why MVP:** The day-of moment for the renewal anchor artifact. The Monthly Update is the product's most important retention document; the Receipt-That-Prints is the in-product ceremony marking its arrival. Engineering cost: ~1pd. Sarah will tell another founder about it.

**Acceptance criteria:**
- [ ] Card appears on /home within 1 hour of PDF generation on the 1st of the month (customer-local time)
- [ ] Card is 96px tall, cream paper background, Rough.js fold mark (deterministic per report_id), Geist Mono date stamp, Fraunces 300 italic "Your Monthly Update is ready."
- [ ] Entrance animation: 600ms clip-path paper-fold, fires once on first render within 24h window. Does not re-animate on page reload.
- [ ] "Read it →" link navigates to correct /reports/[report_id]
- [ ] Card stays visible for 24 hours from appearance time
- [ ] After 24 hours: 600ms opacity-fade out. Card removed from DOM after fade.
- [ ] If customer opens /reports/[report_id] within 24h window: card marked as read, fades out on next /home load (within 10 minutes)
- [ ] If Monthly Update PDF generation fails, card does not appear — no orphaned "ready" cards for failed reports
- [ ] Card renders correctly on mobile (full width, 96px height maintained)

**Dependencies:** F14 (Monthly Update PDF generation, Reporter agent), F13 (/reports page), /home layout (F5), React-PDF

**Effort estimate:** ~1 person-day

**Priority: MVP**

---

### Feature 26: Print-Once-As-Gift — month 6

**What it does:** At the customer's month-6 anniversary, Beamix automatically sends a physical printed copy of the customer's most recent Monthly Update to their office. Heavyweight cream paper. Same Fraunces typesetting as the digital PDF. A real wax seal letterpressed on the cover (not Rough.js — actual letterpress). A Beamix bookmark inside: cream paper, single Fraunces line, dated. Cost: approximately $14 per customer (printing + shipping). Earns a tweet. Converts a customer into an evangelist. Apple did this with "Designed by Apple in California."

**Trigger:** Customer account age reaches 6 months (180 days from `created_at`). Fires exactly once. Does not fire if no office address is on file.

**Address collection:**
- Optional field in onboarding Step 1 ("Office address for reports — optional")
- Optional field surfaced in first cancel-flow attempt: "Before you go — would you like your Beamix report mailed to you? Add your address." This is not a dark pattern; it is an honest offer made once.
- Address stored in `customer_profiles.office_address` (optional, customer can update in /settings → Profile)

**Physical production:**
- Printing vendor: print-on-demand with global fulfillment capability (Lulu, Blurb, or equivalent with API)
- Paper: 60# cream stock or equivalent heavyweight cream
- Cover: letterpress wax seal (not digital) — coordinate with letterpress vendor
- Bookmark: cream paper card, Fraunces single line: "With regard — Beamix · [Month Year]"
- Shipping: tracked. Customer receives tracking notification email (plain text, signed "— Beamix")
- International shipping: supported if vendor has global fulfillment. If not available in customer's country: skip gracefully (no print sent, no error shown)

**Why Post-MVP:** Trigger is inherently 6 months after customer creation — no customer will be eligible at MVP launch. Engineering pipeline (print-on-demand API integration) requires ~3pd but there is no urgency at MVP.

**Acceptance criteria:**
- [ ] Trigger fires on customer's 180-day anniversary if office address is on file
- [ ] Does NOT fire if no address is on file — graceful skip, no error
- [ ] Fires exactly once per customer (idempotent — `print_gifts_sent` boolean on customer_profiles)
- [ ] Printing vendor receives correct content: most recent Monthly Update for that customer
- [ ] Physical product includes: heavyweight cream paper, letterpress wax seal cover, Beamix bookmark
- [ ] Customer receives tracking notification email within 24h of print order placed
- [ ] Ships within 5 business days of print order
- [ ] International: fires only if vendor has fulfillment coverage for customer's country
- [ ] Address collected as optional field in onboarding Step 1 and in first cancel-flow attempt

**Dependencies:** `customer_profiles.office_address` field (add to Tier 0 schema), print-on-demand vendor API (Lulu/Blurb or equivalent), Monthly Update PDF (F14), Inngest (month-6 trigger job)

**Effort estimate:** ~$14/customer cost + ~3 person-days engineering (print API integration + Inngest trigger)

**Priority: Post-MVP (month-6 milestone trigger — no customer eligible at launch)**

---

### Feature 27: Print-the-Brief button at onboarding end

*(Core spec unchanged from v4. Now fires at end of Phase 6 brief-signing in /start. Amendment below.)*

**Amendment v5.1 (onboarding audit O-8):** The Print-the-Brief offer overlay uses no auto-dismiss timer. WCAG 2.2.1 compliance requires manual dismiss only. The overlay persists until the customer explicitly closes it OR 24h after Brief signing — whichever comes first.

**Acceptance criteria (amendment):**
- [ ] No auto-dismiss timer on Print-the-Brief overlay (WCAG 2.2.1 compliance — fix from onboarding audit O-8)
- [ ] Manual dismiss only: overlay persists until customer explicitly closes OR 24h after Brief signing
- [ ] Close button present and keyboard-accessible (focus ring per WCAG 2.4.3)

**Priority: MVP**

---

### Feature 28: "What Beamix Did NOT Do" Monthly Update line

**What it does:** One line on Monthly Update PDF Page 6, positioned just above the closing Seal. Pattern: "Beamix considered {N} changes this month and rejected {M}. Rejection log: [link]." The line converts restraint into a visible product feature. It is one of the highest-leverage trust signals in the entire system — visible evidence that Beamix is deliberate, not indiscriminate.

**Data source:** `agent_jobs` table where `status = 'rejected'` for the customer's account in the given month period. `N` = total changes evaluated (all agent_jobs in period). `M` = rejected count. Both are factual counts from existing data.

**Visual treatment:**
- 13px Inter 400, `--color-ink-3`, single line
- Positioned: just above closing Seal on Page 6 of Monthly Update PDF
- The link "Rejection log: [link]" navigates to a filtered /scans view for that customer showing only rejected agent_jobs for the period

**Rejection log view:**
- Existing /scans page, filtered by: status = rejected AND date range = the report's month
- No new page needed — URL parameter filter on existing /scans

**Why MVP:** One line. The data already exists (`agent_jobs.status`). Zero UI work beyond the PDF template change and one filter parameter on /scans. Trust signal disproportionate to implementation cost.

**Acceptance criteria:**
- [ ] Line appears on Monthly Update PDF Page 6 just above closing Seal
- [ ] Typography: 13px Inter 400, ink-3
- [ ] Pattern: "Beamix considered {N} changes this month and rejected {M}. Rejection log: [link]"
- [ ] N and M are accurate counts from `agent_jobs` table for the customer + report period
- [ ] Link navigates to /scans filtered by status=rejected AND report date range
- [ ] If M = 0 (no rejections): line reads "Beamix evaluated {N} changes this month and published all {N}." (no link)
- [ ] If N = 0 (no activity this month): line is omitted entirely
- [ ] Line does not appear on pages other than Page 6 of the Monthly Update PDF

**Dependencies:** F14 (Monthly Update PDF), `agent_jobs` table (existing), /scans (F9) URL-parameter filtering

**Effort estimate:** Less than 1 person-day

**Priority: MVP**

---

### Feature 29: Printable A4 ops card in /settings

**What it does:** A new sub-page within /settings titled "Print operations summary." When printed or exported to PDF, it produces a single A4 portrait page summarizing the customer's Beamix configuration and active state. Yossi uses this to print one card per client and give it to the client's internal team. Marcus pins one in his workspace. The ops card makes Beamix legible to stakeholders who don't log in.

**Page content (single A4 portrait):**
- **Section 1 — Truth File essentials:** business name, key voice words (up to 5), never-say terms (up to 5), content tone
- **Section 2 — Active workflows:** workflow name + trigger type + last run time (one line each)
- **Section 3 — Active agents:** agent name + autonomy level + last action + last action date (one line each)
- **Section 4 — Upcoming:** next 3 scheduled fire times (date + workflow/agent name)
- **Footer:** "Generated by Beamix · [date] · beamixai.com" in Geist Mono 9pt, ink-4

**Design:**
- Primary typeface: Geist Mono throughout — clinical, no decoration
- Color: ink-2 on white paper (not cream — this is an ops document, not an artifact)
- No Rough.js, no Fraunces, no seals, no brand marks beyond footer text
- Print stylesheet: `@media print` — hides all product chrome, renders only card content
- "Print" button opens browser print dialog with correct print stylesheet active
- PDF export option: "Download as PDF" uses React-PDF (optional; browser print dialog is the primary path)

**Why MVP:** Total cost: one page, one print stylesheet, no new data fetching (all data already exists). Yossi will print one per client. Marcus will pin one. The ops card is the physical presence of Beamix in the customer's non-digital workflow.

**Acceptance criteria:**
- [ ] Sub-page accessible from /settings navigation as "Print operations summary"
- [ ] Page renders correctly in browser (non-print view) as a readable summary
- [ ] "Print" button opens browser print dialog with `@media print` stylesheet applied. Card prints to single A4 portrait page.
- [ ] All data on card is current at print time (not cached from last page load)
- [ ] Geist Mono throughout, ink-2 on white (not cream)
- [ ] No decorative elements — no Rough.js, no Seal, no Fraunces outside footer
- [ ] Footer: "Generated by Beamix · [date] · beamixai.com" in Geist Mono 9pt, ink-4
- [ ] Yossi can print 12 client cards (one per client, switching clients in the switcher) in under 2 minutes — performance target for the switcher + print flow combined
- [ ] Brief binding line NOT present on ops card print output (it is an artifact surface, not a product page)

**Dependencies:** F13 (/settings), multi-client switcher (for Yossi's 12-client use), F19 (workflow data), Truth File (F3)

**Effort estimate:** Less than 1 person-day

**Priority: MVP**

---

### Feature 30: Brief grounding inline citation everywhere

*(Core spec unchanged from v4. Amendment below.)*

**What it does:** Every agent action carries an inline citation back to the authorizing Brief clause. 1px brand-blue left rule + "Authorized by your Brief:" label + quoted clause text + "— clause N of M · Edit Brief →". Workflow Builder Inspector uses cream+Fraunces variant.

**Amendment v5 (2026-05-04):** The right-column Brief grounding preview in Phase 6 (brief-co-author) of /start ships at MVP per Q3 lock. This is a new instance of the Brief grounding pattern — a preview rendered BEFORE the Brief is signed, showing the customer what a future /inbox item will look like. It uses the standard citation treatment (1px brand-blue left rule + Inter 400 italic). It is NOT the Workflow Builder cream+Fraunces variant. The preview is illustrative (uses a placeholder clause from the in-progress Brief draft) and labeled "This is how Beamix will cite your Brief in every recommendation."

**Amendment v4 carried into v5 (2026-04-28):** Every Beamix API response includes `authorized_by_brief_clause` field with Brief clause UUID + truncated text (≤120 chars). Cross-link to API roadmap. The structural commitment carries into machine-readable surfaces.

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

**What it does:** A small Fraunces 300 italic line, anchored 24px above the page chrome footer, present on every product page. It rotates daily through the 4 Brief clauses — deterministically, by `hash(date + customer_id) mod 4`, so every customer sees a different clause on the same day. Silent furniture. Not a notification. Not a badge. Not interactive beyond the Edit Brief link. Ive's ambient brand presence — the constitution made visible everywhere.

**Visual treatment:**
- 13px Fraunces 300 italic
- `--color-ink-3`
- Centered
- Anchored 24px above page chrome footer
- Pattern: `"{Brief clause text}" — clause N of M · Edit Brief →`
- The clause text is quoted (Fraunces italic) and preceded by an opening quotation mark, followed by a closing one
- "— clause N of M · Edit Brief →" is 12px Inter 400, ink-4 (not Fraunces)
- No animation on page load. No badge. No hover state beyond the standard "Edit Brief →" link hover.

**Rotation logic:**
- `clauseIndex = hash(YYYY-MM-DD + customer_id) mod numClauses`
- Deterministic: same customer sees same clause all day. Different customers may see different clauses the same day.
- Updates at customer's local midnight

**Product pages where binding line appears:**
- /home
- /inbox
- /workspace
- /scans
- /competitors
- /crew
- /schedules
- /settings (all tabs)

**Pages where binding line does NOT appear (artifact and disclosure surfaces have own treatments):**
- /scan public (acquisition surface — not the product)
- /reports/[id] (artifact surface — Monthly Update has own Seal treatment)
- /security (disclosure surface — no binding line, no ambient brand)
- Any public-facing permalink page

**Why MVP:** Single shared component. ~1 person-day of work. Creates a persistent ambient connection between every product interaction and the founding document. The constitution becomes the wallpaper of the product — in the best possible sense.

**Acceptance criteria:**
- [ ] Binding line present on all listed product pages: /home, /inbox, /workspace, /scans, /competitors, /crew, /schedules, /settings
- [ ] Binding line absent on: /scan public, /reports/[id], /security, public permalink pages
- [ ] Typography: 13px Fraunces 300 italic, ink-3, centered
- [ ] Anchored 24px above page chrome footer on all listed pages
- [ ] Pattern: `"{clause text}" — clause N of M · Edit Brief →`
- [ ] Rotation: deterministic by `hash(date + customer_id) mod numClauses` — updates at local midnight
- [ ] No animation, no badge, no entrance effect
- [ ] "Edit Brief →" link navigates to /settings → Brief tab
- [ ] If customer has not yet approved a Brief (edge case: early onboarding state), binding line shows placeholder: "Your Brief is being prepared." — no clause text, no Edit link
- [ ] Renders correctly on mobile (wraps to 2 lines if needed; Fraunces italic clause text on first line, attribution on second)

**Dependencies:** Brief data (F2/F3), F13 (/settings Brief tab), shared layout component (PageChrome)

**Effort estimate:** ~1 person-day

**Priority: MVP**

---

### Feature 32: Brief Re-author and Undo Window

**Feature ID:** F32
**Surface:** /settings → Brief tab; onboarding post-Seal confirmation; /crew → per-client Brief tab (Yossi)

**What it does:**
Immediately after Brief approval, a 10-minute undo window is available. During the window, a small top-of-page banner reads: *"Your Brief was signed just now. Change your mind? You have N minutes to reopen it."* After the window closes, re-authoring is available at any time via /settings → Brief tab (non-destructive — always creates a new version, never deletes prior versions). Brief versions are retained in full and surfaced in an audit view. Quarterly re-reading (F24) already in PRD triggers the re-authorization flow; F32 fills the ad-hoc case.

**Voice and microcopy:**
- Undo banner: *"Your Brief was signed just now. Reopen it if anything needs correcting — you have 9 minutes."*
- /settings re-author: *"Your Brief is the foundation everything is built on. Edit it carefully — changes take effect at the next weekly cycle."*
- Confirmation after re-sign: *"Brief updated and signed. Beamix will apply the new direction in the next cycle."*

**User story:** As Marcus, I want to reopen my Brief within minutes of approving it so that I don't let a misclassification bake into weeks of agent work.

**Acceptance criteria:**
- [ ] 10-minute undo window: after Seal lands in onboarding, a banner counts down. Clicking "Reopen Brief" returns to Step 3 with Brief in edit state; Seal must be re-stamped to proceed.
- [ ] After 10-minute window closes, re-author available at /settings → Brief tab → "Edit Brief" button. Editing restores the chip editor UX from onboarding Step 3.
- [ ] Every Brief re-sign creates a new Brief version (Brief_version table, append-only). Old versions are never deleted.
- [ ] Brief audit log accessible in /settings → Brief tab → "Version history" — shows timestamp, diff of changes, who signed (always the account owner), and which agent actions were authorized under each version.
- [ ] Agents authorized under a previous Brief version retain their version reference in provenance envelope (brief_version_id). The customer can see which version authorized which action.
- [ ] When Brief is actively being edited, agents are paused for that client — a /home banner reads: *"Brief editing in progress. Beamix is paused until you save."*
- [ ] Re-author flow includes "This is still wrong about my business" escape hatch back to Step 1's industry combobox — same mechanic as onboarding (already locked in F2 acceptance criteria; this confirms it also applies in the /settings re-author flow).
- [ ] Brief re-sign in /settings requires Seal animation (540ms stamp, same ceremony as onboarding). Not a simple "Save" button.
- [ ] Per F24 (quarterly Brief Re-Reading): if customer clicks "Edit Brief" at the quarterly prompt, they enter the same re-author flow specified here.

**Build effort:** S — touches Brief table, brief_versions table (new), onboarding post-Seal state, /settings Brief tab. No new backend services.

**Edge cases:**
1. Customer edits Brief mid-agent-run: agent is already mid-execution when the Brief changes. The in-flight run completes under the prior version (brief_version_id is snapshotted at run-start, per Tier 0 item 12). The next run picks up the new version.
2. Yossi edits Brief for client 3 while client 7's agents are running: each client has an independent brief_version_id. Cross-client isolation is complete.
3. Customer re-opens Step 1 industry combobox, switches vertical from SaaS to E-commerce: this changes their vertical Knowledge Graph, Truth File required fields, and Brief template. Trigger a Truth File completeness check after re-sign; if required new fields are missing, route customer to /settings → Business Facts to fill them before agents resume.

**Priority: MVP**

---

### Feature 33: Team Seats and Role Permissions

**Feature ID:** F33
**Surface:** /settings → Team tab (new tab); /inbox approval actions; /settings → Billing

**What it does:**
Multi-seat access with two roles. Seat allotments: Discover = 1 seat (owner only), Build = 2 seats (owner + 1), Scale = 5 seats. Each invite is email-based. Roles: Owner (full access, billing, cancel, Brief re-sign) and Editor (can approve/reject /inbox items, view all data, cannot cancel, cannot re-sign Brief, cannot change billing). No Viewer role at MVP (deferred to MVP-1.5 — the edge case of read-only access is low frequency at wedge-launch scale).

**Voice and microcopy:**
- Invite button: *"Invite a teammate"*
- Role picker: *"Owner — full access, including billing"* / *"Editor — approve, review, and monitor. No billing access."*
- Invite email subject: *"[Name] invited you to manage [Business Name] on Beamix"*
- No AI labels in invite email — reads as human invitation.

**User story:** As Marcus, I want to add Leila as an Editor so that she can handle daily /inbox approvals without having access to billing or the ability to re-sign the Brief.

**Acceptance criteria:**
- [ ] /settings → Team tab shows current seats, available seats for tier, and invite form (email address + role selector).
- [ ] Invitation: Resend email with a 72-hour expiry link. Recipient creates Beamix account (or logs in) and is added to the account.
- [ ] Owner role: full access to all surfaces including Brief re-sign, billing, cancel, seat management, white-label config.
- [ ] Editor role: can view all data, approve/reject/request-changes in /inbox, view /workspace, trigger manual agent runs. Cannot: re-sign Brief, access Billing tab, cancel subscription, manage other seats, change white-label config.
- [ ] Seat limit enforced: Discover 1, Build 2, Scale 5. Attempting to invite beyond limit shows an upgrade prompt.
- [ ] Owner can remove a seat at any time. Removed Editor immediately loses access (next page load).
- [ ] Only one Owner per account. Owner transfer is available (under /settings → Team) — requires email confirmation from both current Owner and new Owner.
- [ ] Yossi context: per-client white-label config is in the client-switcher context. An Editor added to a Scale account can see all clients and approve /inbox items across all clients — same as the Owner. Per-client access restriction is MVP-1.5 (requires per-client role scoping).
- [ ] Audit log entry created on: invite sent, invite accepted, seat removed, Owner transferred.
- [ ] Paddle billing: seats are not separately billed at MVP. The tier price includes the seat allotment. Scale's 5 seats are included in the $499/mo.

**Build effort:** M — new `account_members` table, invite flow (Resend), role-based UI gates on Brief re-sign and Billing tab, seat-count enforcement.

**Edge cases:**
1. Editor approves an /inbox item that the Owner later reverses via rollback: both the Editor's approval and the Owner's rollback appear in the audit log with the actor's name.
2. Invited user already has a Beamix account on a different email: they accept the invite with their existing login. The invite is linked to the email address, not to a Beamix account ID — allow the recipient to choose which Beamix account to use when accepting.
3. Account reaches seat limit and tries to add another seat during a multi-client sprint: the upgrade prompt appears with one-click upgrade to next tier. If already on Scale: the prompt offers to contact sales for custom seat expansion (MVP-1.5 feature — at MVP, Scale is the ceiling).

**Priority: MVP**

---

### Feature 34: Customer Data Export (DSAR + Self-Service)

**Feature ID:** F34
**Surface:** /settings → Privacy & Data tab (new tab); /security page (already spec'd — links to this flow)

**What it does:**
Self-service export from /settings. Customer selects which data categories to include, requests the package, and receives a download link via email within 24 hours. For simple single-account exports the download is ready immediately (< 1s for accounts under 12 months). For agency-scale exports (Yossi, 12 clients) the export is queued and delivered within 4 hours. GDPR Article 20 right to portability is satisfied by this feature.

**Data categories available for export:**
- **Scans** — all scan results, per-engine data, historical scores (JSON + CSV)
- **Brief** — all Brief versions with timestamps (JSON + PDF)
- **Truth File** — full Truth File JSONB with version history (JSON)
- **Recommendations** — all generated recommendations with status (approved/rejected/pending) (CSV)
- **Agent actions** — full action ledger with provenance envelopes, Brief clause references, before/after diffs (JSON)
- **Lead Attribution** — call log, UTM click log (CSV)
- **Monthly Updates** — PDF archive of all Monthly Update PDFs generated
- **Account metadata** — account created date, tier history, billing summary (not payment card data)

**Voice and microcopy:**
- Tab label: *"Privacy & Data"*
- Export button: *"Export my data"*
- Confirmation: *"Your export is being prepared. You'll receive a download link at [email] within 24 hours."* (Or: *"Your export is ready. Download now."* for instant-ready cases.)
- GDPR note on page: *"Under GDPR Article 20, you have the right to receive your data in a portable format. This export satisfies that right."*
- No AI labels on any export content.

**User story:** As Marcus (and Aria), I want to export all of my Beamix data in standard formats so that I can verify what's stored and retain it if we ever switch tools.

**Acceptance criteria:**
- [ ] /settings → Privacy & Data tab present for all tiers.
- [ ] Customer can select one or more data categories and click "Export selected."
- [ ] Export package is a ZIP file containing the selected categories in their specified formats.
- [ ] Accounts under 12 months of data with < 500 agent actions: export is synchronous (ready on page, no email needed). Larger exports: Inngest job, email delivery within 4 hours.
- [ ] Monthly Update PDFs included as individual files (not re-rendered — use the stored PDFs from /reports).
- [ ] Export download link is a signed URL (expires 48 hours). Customer can re-request at any time.
- [ ] GDPR DSAR flow: customer can also submit a formal DSAR request from this page, which generates a support ticket with 30-day SLA. /security page documents the DSAR endpoint and SLA.
- [ ] Yossi on Scale: export is per-client (client-switcher context). "Export all clients" option generates one ZIP per client, delivered in a single archive. Scoped to that agency's data only.
- [ ] Agent actions export includes: action_id, agent_name, brief_clause_ref, brief_clause_text_at_time, before_state, after_state, validation_outcome, customer_decision (approved/rejected), timestamp.
- [ ] Truth File exported in JSON Schema-conformant format (already in F3 acceptance criteria — this feature wires the UI to that export function).
- [ ] Export does NOT include: payment card data (Paddle-held), other customers' data, internal Beamix operational logs.

**The /settings → Privacy & Data tab must also include (per Q8 resolution):**
- [ ] Storage region statement: *"Your data is stored in [Supabase region — e.g., Europe West 1]. This is set at account creation and cannot be changed."*
- [ ] Encryption statement: *"All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)."*
- [ ] Training opt-out: *"Beamix does not use your content or your customers' data to train AI models. This is a contractual commitment in our DPA."* Link to /security page for full DPA.
- [ ] Data retention summary: Brief and Truth File retained indefinitely while account is active; scan results retained 24 months (rolling); agent action ledger retained 24 months; Monthly Update PDFs retained 24 months.
- [ ] Sub-processors list: link to /security page sub-processors section.
- [ ] DSAR request link: *"Request a copy or deletion of your data"* — triggers the DSAR flow.
- [ ] Section header: *"Your data, on your terms."*

**Build effort:** M — Inngest export job, ZIP assembly, signed URL delivery via Resend, per-category serializers (most data is already stored in structured tables).

**Edge cases:**
1. Customer requests export during an active agent run: export is queued; the agent run completes before export captures the final state. Brief export captures the version active at time of request.
2. Customer exports, then cancels, then re-activates: export history (the list of prior export requests) is retained in /settings even during the cancellation period.
3. Yossi exports one client's data to hand off to that client directly: the export ZIP contains no cross-client data. Yossi receives the ZIP and forwards it. Beamix does not send it directly to the end-client.

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

**Feature ID:** F36
**Surface:** /settings → Profile tab → Domain field; migration wizard (full-screen flow, modal-style)

**What it does:**
Customer initiates a domain change from /settings → Profile. A guided 4-step migration wizard runs:
1. **Confirm new domain** — customer enters new domain, Beamix runs a quick ownership check (DNS TXT record or meta-tag verification, same pattern as Twilio verification).
2. **Review what changes** — Beamix shows a plain-English diff: "Your Brief will be updated to reference acme.dev. Your 47 scan results will remain in history labeled as acme-saas.com. Your Twilio number is placed on acme-saas.com — you'll need to update it."
3. **Update Brief** — customer reviews Brief with new domain inline, re-signs (Seal ceremony). Brief gets a new version under F32 versioning.
4. **Update Lead Attribution** — customer is shown a fresh developer snippet for the new domain. "Send to your developer" button (same as onboarding Step 2) fires the new snippet email.

**Scan history merge policy:** Historical scans under the old domain are retained in /scans, labeled "Old domain (acme-saas.com)." New scans run against the new domain. The two series are displayed together in /scans with a domain-change marker at the inflection date.

**Agent retraining:** On next scheduled scan cycle after domain migration, all 6 MVP agents re-run their baseline analysis against the new domain. Citation Fixer and FAQ Agent use new domain URLs in all future outputs.

**Voice and microcopy:**
- Settings trigger: *"Changing your domain? This takes 3 minutes and keeps your full history."*
- Wizard step 2: *"Here's what migrates automatically and what needs your attention."*
- Post-migration confirmation: *"Domain updated to acme.dev. Your Brief has been re-signed and Beamix is preparing a fresh analysis of your new domain."*

**User story:** As Sarah (rebranding to Acme Cloud), I want to migrate my domain without losing my scan history or having to start onboarding over so that my attribution numbers and Brief remain continuous.

**Acceptance criteria:**
- [ ] Domain field in /settings → Profile is editable. Clicking "Change domain" opens the migration wizard.
- [ ] Domain ownership verification: DNS TXT record or HTML meta-tag method. Customer has 72 hours to complete verification. Wizard paused (not blocked) until verified.
- [ ] Step 2 plain-English diff shows: Brief domain references, number of historical scans (labeled old), Twilio placement status, UTM URL status.
- [ ] Brief re-sign required (Seal ceremony, same spec as F32 re-author). Migration cannot complete without re-signed Brief.
- [ ] Old domain scans retained in /scans history, labeled with old domain. Domain-change marker appears as a divider row at the inflection date.
- [ ] Agent Memory (`agent_memory` table) entries linked to old domain: retained for provenance. New agent runs write to new domain context.
- [ ] Twilio numbers are NOT automatically moved to the new domain — customer must update their website. Developer snippet email is re-sent with new domain context.
- [ ] Inngest job queued after migration completion: runs all 6 MVP agents on new domain baseline. Customer sees "Beamix is analyzing your new domain" on /home for up to 30 minutes.
- [ ] If customer abandons wizard mid-flow (closes modal): domain is NOT changed. Wizard state is saved for 24 hours so they can resume.
- [ ] One domain migration permitted per 90 days (prevents abuse). If limit hit: customer sees a message to contact support.

**Build effort:** M — migration wizard UI, DNS verification service (reuse Twilio verification pattern), Brief re-version trigger, scan history labeling, Inngest post-migration baseline job.

**Edge cases:**
1. Customer migrates domain but the new domain scan finds the score is dramatically worse than the old domain: the Brief re-sign ceremony is followed immediately by the post-migration baseline run. /home shows the new score with a "Domain migration: fresh start" explanatory note.
2. Yossi migrates one client's domain while 11 other clients are running normally: migration is fully per-client. Other clients are unaffected.
3. Customer has a Twilio number active on the old domain and never updates their website after migrating: the old number continues to log calls under the old domain label in Lead Attribution history. These calls are labeled "Old domain" in /settings → Lead Attribution, not silently dropped.

**Priority: MVP**

---

### Feature 37: /reports — Monthly Update Archive and Review

**Feature ID:** F37
**Surface:** /reports route; mobile nav (not in the bottom 4 items — accessible from sidebar or "more" overflow)

**What it does:**
/reports is the archive and staging area for all Monthly Update PDFs. It is not a general analytics dashboard — it is specifically the Monthly Update management surface. For Yossi, it is also the bulk-review-and-send surface for 12 client reports per month.

**Page structure:**

**Primary view:** Table of Monthly Updates, reverse-chronological.
- Columns: Client (Scale only — single row otherwise) / Month / Status (Draft / Reviewed / Sent) / Attribution headline (one-line preview) / Privacy (Private / Share link active) / Actions
- Row actions: Preview (opens PDF in a modal), Edit (opens the draft in a text editor — same chip-editing UX as Brief), Approve and send, Generate share link, Revoke share link

**Draft state:** Monthly Updates in "Draft" status are those generated by the Reporter agent (F7) but not yet reviewed. For Discover/Build single-client accounts: a /home Receipt-That-Prints card (F25) appears when the draft is ready. Customer clicks through to /reports to review.

**For Yossi (Scale multi-client):** A "This month" filter shows all 12 drafts for the current month in one view. Status column shows which are ready to send, which need review, which have been sent. Per-draft "Always send automatically" toggle (suppresses the manual review step for that client — customer explicitly opts in per-client).

**Privacy controls:** The privacy settings for each Monthly Update are managed per-row in this table (matching the "Generate share link" mechanic from Q6/F35 amendment). The Monthly Update permalink is private by default (Board Decision #1 — already locked). "Generate share link" button generates a time-limited signed URL (7-day expiry, renewable). Recipients do not need a Beamix account to view. The signed share link is NOT indexed (X-Robots-Tag: noindex on these routes). Customer can revoke a share link from /reports (invalidates the signed URL immediately). Share links are generated per-report, not per-account.

**User story:** As Yossi, I want a single /reports page that shows all 12 of my clients' Monthly Update drafts so that I can review, edit, and send each one without clicking through 12 separate client contexts.

**Acceptance criteria:**
- [ ] /reports route accessible from product sidebar. Not in mobile bottom nav (bottom 4 reserved for /home, /inbox, /scans, /crew per F5 acceptance criteria).
- [ ] Table shows all Monthly Updates for the account (or per-client context on Scale). Reverse-chronological.
- [ ] Status column: Draft / Reviewed / Sent. Draft = generated, not yet reviewed. Reviewed = customer opened and read. Sent = delivered to email(s) + permalink live.
- [ ] "Preview" opens Monthly Update PDF in a modal (not a new tab). PDF is the React-PDF render (same artifact as emailed version).
- [ ] "Edit" opens a structured editor: the Monthly Update is composed of sections (attributed results, top fixes, competitor moves, "What Beamix Did Not Do" line). Each section is editable as text. Re-signing not required (Monthly Update is editorial, not constitutional like the Brief).
- [ ] "Approve and send": triggers Resend delivery of the email + PDF attachment. Sets status = Sent.
- [ ] For Scale tier: "This month" filter groups all client drafts. J/K keyboard navigation through drafts (same pattern as /inbox).
- [ ] Per-client "Always send automatically" toggle in /reports: opts that client into automatic send without manual review. Default: OFF (manual review required). Customer explicitly opts in per-client.
- [ ] Generate/revoke share link per Monthly Update row. Share link: 7-day signed URL, X-Robots-Tag: noindex, revocable.
- [ ] Receipt-That-Prints card on /home (F25) deep-links to the relevant /reports row.
- [ ] /reports route: Brief binding line present per F31 specification.
- [ ] Yossi context: in /reports, bulk "Approve and send all reviewed" button sends all Monthly Updates with status = Reviewed in one click. Does not affect status = Draft items.
- [ ] Reporter agent does not auto-send zero-attribution reports (zero calls + zero UTM clicks): escalates to /reports → Draft for manual review, overriding the auto-send toggle.

**Build effort:** M — new /reports route, table with status management, PDF modal renderer, per-client "auto-send" toggle, bulk-send action. React-PDF already in place (F14 dependency).

**Edge cases:**
1. Reporter agent generates a Monthly Update draft with a factual error (attribution number appears off): customer edits the draft in /reports. The edit history is logged. The sent version may differ from the agent-generated draft — this is by design (customer is the author; agent provides the first draft).
2. Customer deletes a Monthly Update from /reports: deletion removes the hosted permalink (if any) and the record from /reports. The PDF in the customer's email client is not retrievable by Beamix.

**Priority: MVP**

---

### Feature 38: Subscription Pause

**Feature ID:** F38
**Surface:** /settings → Billing tab → "Pause subscription" option (distinct from "Cancel")

**What it does:**
Customer can pause their subscription for 1 or 3 months. During a pause: no billing, no agent runs, no Monday Digest, no new inbox items. The account enters a "Paused" state — functionally similar to read-only mode from F35, but with a defined resume date and no data retention countdown (data is fully intact, not on a deletion clock).

**Paddle API support:** Paddle supports subscription pauses via their subscription management API. Pause creates a `pause_collection` on the subscription with a resume date. At resume date, billing resumes automatically on the existing plan. No new checkout required.

**During pause:**
- Login: full access (read-only — browse historical data)
- Scheduled agent runs: suspended
- Monday Digest: suspended
- Lead Attribution: Twilio numbers remain active, calls log (but no agent reactions)
- UTM URLs: active, clicks log (no agent reactions)
- Brief + Truth File + scan history: fully accessible
- /inbox: visible (shows items from before pause), no new items

**On resume:**
- Billing resumes on the resume date
- First agent run scheduled within 24 hours of resume
- Day 0 T+10min welcome email does NOT resend (not a new customer)
- A "Welcome back" email fires: *"Beamix is back at work. Your first scan since your pause will run tonight."*
- No re-onboarding required

**Voice and microcopy:**
- Pause option: *"Take a break — pause for 1 or 3 months. Your data stays intact. Billing pauses. Agents rest."*
- Confirm modal: *"Beamix will pause on [date] and resume on [resume date]. You'll be billed again then."*
- Pause active banner on /home: *"Beamix is paused until [date]. Your data is safe — resume early anytime."*
- Resume email: *"Beamix is back at work."*

**User story:** As Dani, I want to pause my subscription during my slow season so that I'm not paying for a service my team isn't using, without losing my history or having to re-onboard in October.

**Acceptance criteria:**
- [ ] /settings → Billing tab shows "Pause subscription" as a secondary option below "Cancel subscription."
- [ ] Pause options: 1 month or 3 months (radio buttons). Resume date calculated and shown before confirmation.
- [ ] Paddle API: `POST /subscriptions/{id}/pause` with `resume_at` timestamp. On Paddle-side resume, standard billing cycle resumes.
- [ ] During pause: all scheduled Inngest jobs for this account are suspended (check subscription_status before each run). Twilio numbers remain active and logging.
- [ ] "Resume early" button in /settings during pause: fires Paddle `POST /subscriptions/{id}/resume` immediately. Billing resumes from current date (prorated).
- [ ] On automatic resume date: Inngest job triggers first post-pause scan within 24 hours. "Welcome back" email fires within 15 minutes of resume.
- [ ] No Day 1-6 cadence emails on resume (not a new customer). Only the "Welcome back" email.
- [ ] Yossi context: pause is per-account, not per-client. All 12 client accounts pause simultaneously.
- [ ] Maximum 2 pauses per 12 months (prevents pause abuse as a substitute for cancellation).
- [ ] Pause is not available during trial period (not applicable at MVP — trial is 14-day money-back, not a free trial account state).

**Build effort:** S — Paddle pause API integration, subscription_status = 'paused' state handling, Inngest subscription-status check on every job, "Welcome back" email template, Billing tab UI additions.

**Edge cases:**
1. Customer pauses, then their pause period overlaps with a Monthly Update generation date: the Reporter agent does not run during pause. The Monthly Update for the paused month is skipped. No retroactive catch-up on resume — the Monthly Update simply does not exist for that month (noted in /reports with status "Paused — not generated").
2. Customer resumes early on the same day a Monday Digest was scheduled: the Monday Digest fires on the next Monday (not same-day — Inngest job checks if the current day is Monday and whether a digest has already sent this week before firing).
3. Customer on annual plan pauses: Paddle pause on annual subscription pauses the next renewal date accordingly. Annual billing is not prorated for a mid-year pause — the pause extends the subscription end date by the pause duration. Confirm this behavior with Paddle's API documentation before shipping.

**Priority: MVP**

---

### Feature 39: Competitor Removal and False-Positive Management

**Feature ID:** F39
**Surface:** /competitors → per-row action; competitor detail panel

**What it does:**
Extends the existing /competitors table (F10) with a "Remove" action on any competitor row — both KG-detected and customer-added. Removing a competitor removes it from the active set, logs the removal in the audit log, and instructs all relevant agents to exclude it from future work.

**Removal flow:**
1. Customer clicks "Remove" on a competitor row (or opens the competitor detail panel and clicks "Remove competitor").
2. A confirmation modal appears: *"Remove [Competitor Name]? Beamix will stop tracking them and won't mention them in future content. This does not undo past agent work."*
3. On confirm: competitor is moved to a "Removed" list (not deleted — retained for audit/rollback). The competitor no longer appears in the main /competitors table. All 6 MVP agents receive an updated exclusion list.
4. Removed competitors are visible in a collapsed "Removed" section at the bottom of /competitors — customer can "Restore" a removed competitor at any time.

**Agent retraining:** On next scan cycle after removal, Citation Fixer and FAQ Agent read the exclusion list and do not generate content targeting removed competitors.

**Audit log:** Removal is logged in the agent action ledger with: customer_id, removed_competitor_domain, removal_reason (optional free-text), timestamp, actor (Owner or Editor per F33).

**Voice and microcopy:**
- Remove button: *"Remove competitor"*
- Confirmation modal: *"Remove [Name]? Beamix stops tracking them and won't mention them in future recommendations. Past work isn't affected."*
- Restored badge: *"You removed this competitor on [date]."* (shown in restored row)

**User story:** As Sarah, I want to remove a competitor that Beamix auto-detected but that isn't actually my competitor so that agents don't waste credits generating content targeting the wrong company.

**Acceptance criteria:**
- [ ] "Remove" action available on every row in /competitors table — both KG-detected ("Beamix detected" badge rows) and customer-added rows.
- [ ] Removal moves competitor to a `removed` state (not deletion). Removed list accessible via "Show removed" toggle at bottom of /competitors.
- [ ] Confirmation modal: shows competitor name, one-sentence plain-English explanation of what changes. Optional free-text "Reason for removing" field (not required).
- [ ] On removal: agent exclusion list updated. All future Inngest agent runs read exclusion list before generating any competitor-targeting content.
- [ ] Removal does NOT roll back past agent work. Past /inbox items approved for competitors that were later removed remain in the action ledger as-is.
- [ ] "Restore" action on removed competitors: moves competitor back to active. Agents re-include them on next cycle. No re-confirmation needed.
- [ ] Removing a KG-detected competitor does NOT affect the KG itself (global Beamix data). It only removes the competitor from this customer's active set.
- [ ] Audit log entry on removal and on restore: actor, timestamp, competitor domain, reason (if provided).
- [ ] If customer removes all 5 KG-detected competitors and adds 0 custom competitors: /competitors shows "No competitors tracked" empty state with a prompt to add custom competitors.
- [ ] KG-detected competitor does NOT automatically re-add to the active list if it's in the customer's exclusion list. The exclusion list takes precedence over KG discovery. Hard rule.

**Build effort:** XS — additional row action in /competitors table, exclusion_list field on agent context, status column on competitors table (active/removed), audit log entry.

**Edge cases:**
1. Customer removes a competitor, then a new scan re-detects them via the KG: the exclusion list takes precedence. Not re-added.
2. Customer removes a competitor and later sees that competitor in a Monday Digest (because the Digest template referenced the competitor in historical context): the Monday Digest should not reference removed competitors in new paragraphs. Historical lines already generated are not retroactively edited.
3. Yossi removes a competitor for Client A but that same competitor is valid for Client B: competitor exclusion lists are per-client. Removing a competitor in Client A's context has no effect on Client B's competitor tracking.

**Priority: MVP**

---

### Feature 40: Multi-Domain Scale Tier — Seat and Domain Model

**Feature ID:** F40
**Surface:** Pricing page (Framer — out of this repo, but pricing model must be documented); /settings → Billing tab; client onboarding flow (abbreviated); multi-client cockpit

**Pricing model decision (locked in this document):**

| Tier | Domains included | Add-on domains | Notes |
|---|---|---|---|
| Discover $79 | 1 | N/A | Single domain, owner-only |
| Build $189 | 1 | N/A | Single domain, 2 seats (F33) |
| Scale $499 | 5 domains | $49/domain/month | Yossi's entry point; 12-client agency buys 5 included + 7 add-ons = $499 + 7×$49 = $842/mo |

**Rationale:** Scale at $499 with unlimited domains would undermine per-domain value. A $49/domain add-on is lower than Beamix's per-domain cost of service at scale (scan engine cost + agent compute) and well below what Yossi bills clients (₪9,000–₪15,000/month per client). This model aligns incentives: Yossi pays proportionally as he grows.

**White-label per-client config (locked by Board Decision #16 — not relitigated):**
Each domain on Scale has its own white-label config slot. Config is accessed from the multi-client cockpit → select client → "Brand settings." Not from /settings account-level.

**Multi-client cockpit:**
The multi-client cockpit is the Scale-tier /home equivalent for agency operators. It is a table view, not the standard /home rings-and-evidence layout.

**Cockpit columns:** Client name / Domain / AI Score (delta vs last week) / /Inbox count / Agents in error (0 is green) / Monthly Update status (Draft/Sent/Overdue) / Attribution headline (one-line)

**Cockpit row actions:** Open client dashboard (switches client context), Approve all pending /inbox items (single-client bulk-approve, already in F6), Trigger manual scan.

**User story:** As Yossi, I want a single table showing all 12 of my clients' current status so that my morning review takes 5 minutes, not 25.

**Acceptance criteria:**
- [ ] Scale tier includes 5 domains. Each additional domain is $49/month, billed via Paddle add-on product.
- [ ] /settings → Billing tab shows: current domain count, included domains (5), add-on domains purchased, per-domain add-on price, "Add a domain" button.
- [ ] "Add a domain" button: triggers Paddle add-on checkout for $49/month, then routes to full 4-step onboarding ceremony (including Brief signing). Every new domain added on Scale gets the full onboarding ceremony — no abbreviated flow. The "abbreviated 2-step" language from old onboarding spec is retired.
- [ ] Multi-client cockpit: visible on Scale tier at /home when multi-client context is detected (2+ domains active). Single-domain Scale accounts see standard /home.
- [ ] Cockpit shows: Client name / Score delta / Inbox count / Agents in error / Monthly Update status / Attribution headline.
- [ ] Per-client white-label config accessible from cockpit → client row → "Brand settings." Not from top-level /settings.
- [ ] "Powered by Beamix" footer (Geist Mono 9pt, --color-ink-4) default ON per-client, toggleable.
- [ ] Domain deletion: Scale customer can remove a domain from their account. The domain's data enters read-only mode (same as F35 cancellation model, 90 days). The $49/month add-on is cancelled via Paddle at next billing cycle.
- [ ] Cockpit Brief binding line (F31): present at cockpit footer, rotating through clauses of whichever client is most recently active.

**Build effort:** M — Paddle add-on product ($49/domain), multi-client cockpit view (new table view of /home for Scale multi-domain), domain count enforcement, per-domain onboarding trigger.

**Edge cases:**
1. Yossi's client count drops from 12 to 8 (3 clients leave): he cancels 4 add-on domains via Paddle. The 4 removed domains enter 90-day read-only mode per F35. At-domain-limit enforcement is checked at next billing cycle.
2. Scale customer with 1 domain upgrades to multi-client: they add their first additional domain via "Add a domain." The cockpit view activates automatically once the second domain is onboarded.
3. Two Yossi-type agencies are both Scale customers: there is no cross-account visibility. Each agency's client data is fully isolated behind Supabase RLS.

**Priority: MVP**

---

### Feature 41: Cmd-K command bar + slash command

**Feature ID:** F41
**Surface:** Global keyboard shortcut overlay (every page).

**User story:** As any persona, I want one keyboard shortcut to find anything, jump anywhere, run any agent action — so I don't have to navigate the product visually for common tasks.

**Acceptance criteria:**
- [ ] `Cmd-K` (Mac) / `Ctrl-K` (Win/Linux) opens command bar from any page
- [ ] Search across: pages (9 fixed surfaces + customer-created /reports surfaces), agents (6 MVP agents), scan results (last 30 days), Brief clauses (4 + custom), Twilio numbers, sub-processors, /changelog entries, Help Center
- [ ] Each result row shows: result type icon (16×16), result title (Inter 14px), Brief grounding citation (Geist Mono 11px ink-3) — every result authorized by a Brief clause shows it
- [ ] Recently used commands surfaced first (top 5)
- [ ] Sacred shortcuts: `Cmd-K then i` → /inbox, `Cmd-K then s` → /scans, `Cmd-K then a` → /workspace, `Cmd-K then b` → Brief, `Cmd-K then c` → /crew, `Cmd-K then ?` → help
- [ ] Slash command (`/`) opens block-insert palette (composable surfaces only — /reports + Workflow Builder Inspector at MVP)
- [ ] Visible hotkey hints in UI: `<kbd>` style next to button labels (e.g., "Approve `enter ↵`")
- [ ] Mobile fallback: tap global search icon (top-right of every page); same search results
- [ ] Close: Esc
- [ ] Zero-result query: shows "Nothing matches. Try [3 suggested searches]"
- [ ] Brief grounding: results from sources without a Brief clause (e.g., "Help Center" entries) show no citation row — citation is per-result, not forced

**Voice + microcopy:**
- Placeholder: "What are you looking for?"
- Empty state: "Type to search across your account, agents, and Brief."
- Brief grounding line on results: `Authorized by your Brief: "[clause N]"`

**Build effort:** M (~5 person-days). Touches: new component `CommandBar.tsx`, search index (Postgres FTS or in-memory at MVP scale), keyboard handler hook, mobile sheet variant.

**Priority: MVP**

---

### Feature 42: Trust Center at /trust + SOC 2 Type I

*(Core spec unchanged from v4. Amendment below.)*

**Amendment v5 (2026-05-04) — /trust crosslink from Phase 7 (Q5 lock):**
The Phase 7 (brief-signing) footer now includes a quiet "Security & DPA" link that routes to /trust. This is the mechanism by which Marcus can screenshot + forward to Aria before signing the Brief. Link treatment: 13px Inter 400, ink-3, positioned below the signature area alongside the 14-day money-back guarantee footer line. No banner, no CTA prominence — small and quiet. The ones who care will click; those who don't are not disrupted.

**Amendment v5 (2026-05-04):**
- Israeli DPA supplement note: Hebrew-language compliance for Israeli Privacy Protection Law (PPA-2017 + 2022 amendments)
- Yossi-style multi-client agency DPA addendum for sub-vendor pass-through (each Yossi-client gets the Beamix DPA terms inherited)
- Public DPA at `/trust/dpa` (ungated link), per Aria simulator §3

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

**Feature ID:** F43
**Surface:** `/.well-known/security.txt` + HackerOne program + `/trust/disclosure` page.

**User story:** As Aria, I trust vendors who treat external security research as input, not threat — so a public bounty signals operational maturity.

**Acceptance criteria:**
- [ ] `/.well-known/security.txt` published at MVP launch (zero-cost configuration)
- [ ] HackerOne program live at MVP+30: $500 minimum bounty, $20K annual ceiling, scope = beamixai.com + api.beamixai.com + customer dashboards
- [ ] Public disclosure page at `/trust/disclosure` — explains scope, payouts, response SLA (5 business days for triage, 30 for fix-or-mitigation)
- [ ] Acknowledgments page: monthly-updated list of researchers who reported valid issues (name + handle + month; opt-out available)
- [ ] Researcher reports issue in customer's site (out of scope): redirect with respectful note
- [ ] Critical Sev-1: emergency direct line to security-lead phone (paired with §10 of /security spec)

**Build effort:** XS (security.txt = 1 hour; HackerOne setup = 1 day; budget commit ~$20K/year ceiling).

**Priority: MVP**

---

### Feature 44: /changelog as canonical surface

**Feature ID:** F44
**Surface:** New route `/changelog` (public, indexed by Google + AI engines).

**User story:** As Marcus, I want to see what Beamix shipped this week so I know my vendor is alive — and as the press / AI engines, I want a citable artifact about Beamix's shipping cadence.

**Acceptance criteria:**
- [ ] `/changelog` route (public, no auth required)
- [ ] Cream paper editorial register (matches Monthly Update aesthetic)
- [ ] Weekly entries (Fridays) — every customer-impacting ship
- [ ] Each entry: dateline (Geist Mono 11px ALL CAPS), Fraunces 300 italic editorial title, ≤200 words body (Inter), 1 hero image or animated GIF (motion respects prefers-reduced-motion)
- [ ] Reading time signal at top of each entry: "3 min read"
- [ ] Brief grounding citation at bottom of each entry (rotating; F31 pattern)
- [ ] "Subscribe via email" CTA (Resend + RSS feed)
- [ ] Voice canon Model B (single-character "Beamix"; no agent names externally)
- [ ] /changelog gets its own OG share card (cream paper, dateline, Seal)
- [ ] /changelog/[slug] permalinks (each entry has stable URL)
- [ ] Quiet week: no entry; previous entry stays at top
- [ ] Major release week: multiple entries (still date-stamped per ship)

**Voice + microcopy:** "Friday, April 24 — We taught the FAQ Agent how Marcus's customers actually phrase questions. (3 min read)"

**Build effort:** S (~3 person-days; relies on existing CMS or markdown-files-in-repo pattern)

**Priority: MVP**

---

### Feature 45: Compact mode toggle

**Feature ID:** F45
**Surface:** Per-page toggle on /inbox, /scans, /crew (and other dense list views).

**User story:** As Yossi (12-client agency), I drown in current spacing. I need denser views to scan multiple clients without scrolling.

**Acceptance criteria:**
- [ ] Toggle in page header: 2-state segmented control (`Comfortable | Compact`); default `Comfortable`
- [ ] Yossi auto-default rule: if user has ≥2 active client domains → `Compact` auto-set on first /home visit (one-time, then sticky)
- [ ] Compact /inbox: 40px row height (down from 56px); 13px Inter; tighter visible action buttons
- [ ] Compact /scans: 32px row height (down from 56px); engine column micro-strip preserved; per-row hover detail still works
- [ ] Compact /crew: 48px row height (down from 72px); monogram size table per Round 1 (16px monogram in compact; 32px in comfortable)
- [ ] localStorage persistence per page (key: `beamix-density-{page}`)
- [ ] Cream-paper-register surfaces (Brief, Monthly Update, /changelog, /trust) NEVER compact — toggle hidden on those pages
- [ ] Compact does NOT change typography hierarchy (still readable; no smaller-than-13px body)
- [ ] Yossi removes 2nd client (drops to 1 client): compact stays sticky (don't downgrade automatically)
- [ ] Print stylesheet: always full-spacing (compact does not apply to print)

**Build effort:** XS (~2 person-days — simple state toggle + CSS class swap)

**Priority: MVP**

---

### Feature 46: Editorial error pages (404/500/maint/status)

**Feature ID:** F46
**Surface:** /404, /500, /maintenance, /status.

**User story:** As any user, when something breaks, I want the page to feel like Beamix — not a generic Next.js framework error.

**Acceptance criteria:**
- [ ] All 4 pages cream paper register, single Fraunces 300 italic line, Seal at top, dateline (Geist Mono "April 28, 2026 — 14:23 GMT")
- [ ] /404: "We couldn't find that page. The URL may have moved." + "[Take me home →]" CTA
- [ ] /500: "Something broke. Beamix is logging it now. Try again, or check our status." + status link
- [ ] /maintenance: "Beamix is performing scheduled maintenance. Returning at 03:00 GMT." + status link
- [ ] /status: external page (status.beamixai.com via Better Stack or equivalent) with current incident + 90-day uptime
- [ ] All pages have F31 Brief binding line at bottom
- [ ] All pages logged to Sentry / observability (404 vs 500 vs maintenance distinguished)
- [ ] /500 during database outage: page must serve from edge (no DB dependency)
- [ ] /maintenance: scheduled in advance; banner appears 24h before; redirects to /maintenance during window

**Voice + microcopy:** Single-character; calm; no apologies-as-disclaimers ("Sorry!" banned).

**Build effort:** S (~2 person-days for all 4 pages + status page setup)

**Priority: MVP**

---

### Feature 47: State of AI Search 2026

**Feature ID:** F47
**Surface:** `/state-of-ai-search` route + downloadable PDF + 50 hand-bound print copies.

**User story:** As Adam, I want a category-defining artifact that earns Beamix permanent citation as the authority on AI search visibility for SMBs.

**Acceptance criteria:**
- [ ] Ship at MVP+90 (data integrity + first-mover defense)
- [ ] 8 hero charts:
  1. Citation share by AI engine for SMBs (11 engines × 4 verticals)
  2. Schema.org markup citation lift (8× findings — confidence-tested)
  3. AI search loneliness cohort decay (≥60-day data required)
  4. Engine reliability ranking (consistency scoring)
  5. Engine divergence — where engines disagree about who matters
  6. Fastest-growing AI search citations of Q1 2026 (delta tracking)
  7. Verticals AI search engines cite most reliably (heatmap)
  8. The 30-day-after-launch invisibility curve (cohort data)
- [ ] 11-section editorial spine: Foreword (Adam's voice + Seal), Executive Summary, Methodology, Per-engine deep-dives (×4), Cross-engine cartogram view, Action chapter, Vertical chapter, Longitudinal chapter, Look-ahead, Colophon
- [ ] Voice canon Model B (single-character "Beamix Editorial" byline; no agent names)
- [ ] Cream paper register; Fraunces 300 italic for Section heads; Inter for body; Geist Mono for stats; cartogram on Page 2
- [ ] 50 hand-bound numbered print copies for first 50 paying customers (pairs with F26 Print-Once-As-Gift)
- [ ] 10 press-seeding copies, 10 archive copies
- [ ] Digital download: gated by email (list-building flywheel)
- [ ] OG share card: cream paper + cartogram preview + Seal
- [ ] Annual cadence locked (April every year — repeat with deeper data each year)
- [ ] Embargoed pre-brief to TechCrunch, Search Engine Land, MarketingProfs, Forbes Small-Business, Increment magazine
- [ ] Founder Twitter / podcast coordination (Adam writes 3 short-form pitches in advance)
- [ ] Insufficient data at MVP+90 (paying customers <50): publish 4-chart edition with explicit "more depth in 2027" footnote

**Build effort:** XL (~25 person-days: editorial 12, design 8, data 5; ~$45.5K total — editorial contractor $10-15K, designer $10-12K, print $3-5K, PR $10-15K)

**Priority: MVP+90**

**Amendment v5 (2026-05-04) — Data instrumentation must start at MVP launch:**
- Add `state_of_search_eligible` consent flag at Phase 7 truth-file (opt-in for participation in annual report)
- New tables (Tier 0 migrations):
  - `engine_consistency_metrics` — cross-engine citation consistency tracking
  - `vertical_citation_patterns` — vertical-specific citation behavior
  - `cohort_visibility_decay` — longitudinal cohort tracking for the loneliness chart
- Daily aggregation Inngest job from MVP launch day 1 (cron `0 3 * * *`)
- Data retention: 12+ months for longitudinal charts
- Without these from Day 1, F47 ships at MVP+90 with insufficient data depth.

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

### Feature F55: Pre-Brief Abandonment Recovery (NEW — MVP)

**Surface:** Email (Resend) + analytics tracking

**User story:** As a user who signed up but didn't complete the Brief in 24h, I want to be gently reminded so I can return and finish — without feeling pestered.

**Acceptance criteria:**
- Day 1 email if user signed up but didn't reach Phase 6 (brief-signing) within 24h
- Day 3 follow-up if still no Brief
- Day 7 final reminder if still no Brief; after Day 7, marked as cold lead
- Cream paper register, Fraunces 300 italic editorial line, voice canon Model B, "— Beamix" signature
- Subject line variants: "You started something. Want to finish?" / "Beamix is still here." / "Last note from Beamix."
- Stop sending if user signs Brief
- Track open/click rates per template
- Respects unsubscribe preferences

**Build effort:** S (~2 person-days; 3 Resend templates + 1 Inngest scheduled job)

**Edge cases:**
- User signs Brief mid-sequence: cancel remaining emails
- User unsubscribes from marketing: respect; still send essential transactional
- User signs up + immediately deletes account: don't send

---

### Feature F56: Cookie Consent Banner (NEW — MVP)

**Surface:** Bottom-anchored banner on first visit to any beamixai.com / app.beamixai.com page

**User story:** As an EU or Israeli user, I need to consent to non-essential cookies before they're set, per GDPR + Israeli Privacy Protection Law.

**Acceptance criteria:**
- Bottom-anchored banner on first visit (z-index above all content; cream paper register; not modal — browseable)
- Three buttons: "Accept all" / "Essential only" / "Customize"
- Cookie categories shown in Customize:
  - Essential: auth tokens, session, CSRF (always on, can't disable)
  - Analytics: PostHog or Plausible (default off)
  - Lead Attribution: Twilio + UTM tracking (default off)
- No pre-checked boxes (explicit consent only — GDPR + Israeli compliance)
- Settings page section to revoke/modify after initial choice
- 12-month consent expiry, then re-prompt
- Cream paper background, Fraunces label "Cookies that learn from you", voice canon Model B
- Banner hidden after choice; persists in localStorage + Supabase

**Build effort:** S (~2 person-days)

**Edge cases:**
- User on incognito mode: banner shows every session (no localStorage persistence)
- User changes choice in Settings: re-applies on next page load
- User from non-GDPR/non-Israel jurisdiction: banner still shows (uniform global compliance)

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

### RTL Support (Hebrew + Arabic-ready)

All product surfaces (`/start`, `/home`, `/inbox`, `/workspace`, `/scans`, `/competitors`, `/crew`, `/settings`, `/brief`, `/reports`, `/security`, `/trust/*`, `/changelog`) MUST support `dir="rtl"` for Hebrew users.

- Tailwind RTL plugin enabled (`tailwindcss-rtl`)
- Layout patterns flip in RTL: card alignment, button positioning, sigil placement, icon mirroring (where applicable)
- Cartogram (F22) tested per pixel spec — query labels right-aligned, engine labels horizontal
- Monogram positioning audited per design system canon
- Heebo 300 italic loaded conditionally on `[lang="he"]` pages (companion to Fraunces)
- Geist Mono technical content (URLs, phone numbers, code snippets) gets explicit `dir="ltr"` to prevent mirrored URLs
- Brand name "Beamix" stays Latin-script in RTL contexts (never "ביימיקס" — voice canon Model B)
- Tested on Chrome/Safari/Firefox + iOS/Android

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

Print-the-Brief dismiss behavior: No auto-dismiss timer (WCAG 2.2.1 compliance — fix from onboarding audit O-8). Manual dismiss only — persists until customer explicitly closes OR 24h after Brief signing.

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
