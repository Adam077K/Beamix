# Beamix — Wedge Launch PRD v4

**Date:** 2026-04-29
**Status:** CANONICAL — supersedes v3 (2026-04-28), v2 (2026-04-28), and v1 (2026-04-27). All prior versions deprecated. Do not reference v1, v2, or v3 for feature decisions.
**Author:** Product Lead
**Lock authority:** Board Meeting Synthesis 2026-04-27 (23 locked decisions) + Design Board 2 Synthesis 2026-04-28 (5 contested locks) + Audit 3 Customer Journey Coherence Review 2026-04-27 (F32–F40) + Design Board Round 2/3 Synthesis 2026-04-28 (F41–F47 + design-system canon)
**Predecessors:** PR #53 (v3 + Build Plan v1) + PR #54 (Round 2/3 synthesis + Aria persona + PRD v4 amendments)
**Domain:** beamixai.com (updated 2026-04-29 — all prior `beamix.tech` references replaced). Customer-facing brand name remains **Beamix** — never write "BeamixAI."

> **DEPRECATION NOTICE:** PRD v3, v2, and v1 are superseded in their entirety. All acceptance criteria in prior versions are retired; the criteria here replace them. Do not reopen decisions locked in v3 or earlier. The 5 contested design decisions from Board 2 and all 23 Board Meeting locked decisions remain locked in this document.

---

## Table of Contents

1. [ICP — The Wedge Customer Profile](#1-icp)
2. [MVP Feature Scope](#2-mvp-feature-scope)
   - Tier 0 Infrastructure
   - F1 /scan public (acquisition surface)
   - F2 Onboarding flow
   - F3 Truth File
   - F4 Pre-publication validation
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
   - F17 Marketplace (re-spec without rewards)
   - F18 Incident runbook + rollback + Truth File integrity job
   - F19 Workflow Builder
   - F20 /security public page
   - F21 Scale-tier DPA + agency indemnification clause
   - F22 AI Visibility Cartogram
   - F23 Cycle-Close Bell
   - F24 Brief Re-Reading — quarterly trigger
   - F25 Receipt-That-Prints card
   - F26 Print-Once-As-Gift — month 6 (Post-MVP)
   - F27 Print-the-Brief button at onboarding end
   - F28 "What Beamix Did NOT Do" Monthly Update line
   - F29 Printable A4 ops card in /settings
   - F30 Brief grounding inline citation everywhere
   - F31 Brief binding line at every product page bottom
   - F32 Brief Re-author and Undo Window
   - F33 Team Seats and Role Permissions
   - F34 Customer Data Export (DSAR + Self-Service)
   - F35 Graceful Cancellation and Data Retention
   - F36 Domain Migration Flow
   - F37 /reports — Monthly Update Archive and Review
   - F38 Subscription Pause
   - F39 Competitor Removal and False-Positive Management
   - F40 Multi-Domain Scale Tier — Seat and Domain Model
   - F41 Cmd-K command bar + slash command
   - F42 Trust Center at /trust + SOC 2 Type I
   - F43 Vulnerability disclosure + bug bounty
   - F44 /changelog as canonical surface
   - F45 Compact mode toggle
   - F46 Editorial error pages (404/500/maint/status)
   - F47 State of AI Search 2026
3. [Locked Design Decisions Cascading from Board 2 (2026-04-28)](#3-locked-design-decisions)
4. [User Stories](#4-user-stories)
5. [Success Metrics](#5-success-metrics)
6. [Out of Scope for MVP](#6-out-of-scope)
7. [Risks and Open Product Questions](#7-risks-and-open-questions)
8. [Design System Canon](#8-design-system-canon)
9. [Outstanding Adam-Decisions](#9-outstanding-adam-decisions)
10. [Domain Infrastructure Status](#10-domain-infrastructure-status)

---

## Frame 5 v2 Strategic Positioning

Beamix is not an AI search rank tracker. It is the AI visibility operating layer for SMBs — the first product that closes the loop between "customers are finding me through AI" and "here is the proof, here is what we changed, here is the attributed revenue."

**The wedge:** Every SMB founder has typed their product category into ChatGPT and not seen their business. That is the entry pain. Beamix converts that pain into a scan result (the product demo), then into a paid account, then into weekly evidence that the problem is being solved.

**The moat:** The Brief. Every Beamix account is governed by a founding document the customer personally approved. Every agent action cites it. Every renewal is anchored to the moment the customer stamped their Brief. Competitors can copy the dashboard. They cannot copy the constitutional architecture.

**The flywheel:** Scan → signup → Brief approval → weekly agent work → Monday Digest → Monthly Update PDF forwarded to investor/co-founder → word-of-mouth referral → new scan.

---

## Pricing + Tiers

| Tier | Monthly | Annual | Engines | Seats | Domains |
|------|---------|--------|---------|-------|---------|
| Discover | $79/mo | $63/mo | 3 | 1 | 1 |
| Build | $189/mo | $151/mo | 6 | 2 | 1 |
| Scale | $499/mo | $399/mo | 11 | 5 | 5 included + $49/domain/mo add-on |

Trial model: 14-day money-back guarantee. No free-trial account state. One-time free scan remains at /scan public.

---

## 1. ICP — The Wedge Customer Profile

### Who Beamix is building for at launch

The wedge is not a broad SMB market. It is two specific operator archetypes who share four traits: they are tech-native, already paying for SaaS tooling, comfortable with autonomous software acting on their behalf, and deeply motivated by a specific, named fear — "customers are asking AI where to find us, and we are not in the answer."

---

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
- **"Send to your developer"** handoff in Step 2 is critical — his clients' CTOs place UTM tags, not Yossi.
- **Monthly Update /reports index** showing all 12 clients with per-client J/K nav and Auto-send / Review / Always-edit settings.

**Renewal anchor:** The Workflow Builder full DAG editor at MVP Day 1 + per-client white-label + multi-client cockpit. Without all three, Scale is not worth $499/month.

---

### Persona D: Aria (Marcus's Hidden CTO Co-Founder)

**Archetype:** CTO co-founder at a B2B SaaS company (Marcus's company). Engineering background. Not a daily Beamix user — a one-time procurement-grade evaluator who resurfaces at renewal time. Aria reviews vendor security posture before Marcus's month-3 renewal. If Aria finds gaps, the renewal dies.

**Aria's evaluation criteria:** Sub-processor table with complete columns (controller/processor status, underlying cloud, SOC 2/ISO 27001 per vendor, last-audited-by-Beamix date, real DPA link). Public DPA with liability cap, IP indemnification flowing through Anthropic/OpenAI terms, 48h customer-breach SLA, 30d sub-processor pre-notification, cyber-liability insurance disclosure. Cryptographic primitives named (not gestured at): AES-256-GCM, Argon2id, libsodium, BoringSSL. Bug bounty program live. SOC 2 observation period started. Vulnerability disclosure policy published.

**What Aria is NOT:** A daily user. A persona who cares about onboarding UX or weekly digest copy. Aria reads `/trust`, `/security`, and the DPA — nothing else.

**Why Aria is canonical (4th persona):** The renewal decision belongs to Marcus but the renewal veto belongs to Aria. Every feature on `/trust`, F42, F43, F20 amendment, and the sub-processor table exists because of Aria. She is the hidden gate. Her sign-off converts a satisfied Marcus into a multi-year customer. See `docs/08-agents_work/BOARD-aria-simulator.md` for the full Aria simulation session that produced the five specific security fixes now in F20 and F42.

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

## 2. MVP Feature Scope

### Priority key

- **MVP** — must ship at launch (Tier 0 infrastructure + all features below)
- **MVP-1.5** — ship within 6–8 weeks of launch (fast follow)
- **Year 1** — ships post-traction
- **Year 1.5+** — full vision, deferred
- **Post-MVP** — explicitly triggered by milestone (e.g., month-6 anniversary)

### Tier 0 Infrastructure (must complete before any feature build begins)

The following infrastructure must be built and verified before any agent touches a real customer domain. This is not optional and does not move in parallel with feature work.

1. **Canonical type files** (`apps/web/types/`): `EvidenceCard.ts`, `Brief.ts`, `TruthFile.ts`, `ProvenanceEnvelope.ts`, `AgentRunState.ts`
2. **Supabase schema migration** (all Tier 0 tables + RLS): `briefs`, `truth_files`, `artifact_ledger`, `margin_notes`, `agent_memory` (pgvector), `provenance_steps`, `agent_run_state`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `workflows`, `workflow_nodes`, `workflow_edges`, `workflow_versions`
3. **Inngest free-tier setup** + `runAgent` skeleton + smoke test + free-tier usage telemetry dashboard (migration trigger)
4. **Supabase Realtime channel** + client hook (`agent:runs:{customer_id}`) + polling fallback at 10s
5. **Pre-publication validator service** (separate process; cryptographic signed-token: 60s TTL, draft-hash bound)
6. **Truth File integrity-hash nightly job** (Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h)
7. **Build-time pipeline:** opentype.js Fraunces signature extractor + per-agent Rough.js monogram generator (deterministic seed-per-agent UUID — see Design Lock E in §3) + per-customer seal generator (Inngest job at signup)
8. **Cost ceiling instrumentation** (per-customer monthly scan-cost ledger + alarm)
9. **Resend setup** + send-volume tier + bounce handler + DKIM/SPF/DMARC on notify.beamixai.com
10. **DPA + /security page + privacy posture documentation** (technical-writer + legal advisor)
11. **`brief_clause_ref` field on provenance envelope** — every agent action stores the authorizing Brief clause reference at creation time (required for F30 Brief grounding citation rendering)
12. **Brief clause snapshot** stored alongside each agent action at creation time (Brief text may change; citation must reference the clause as it read when the action was authorized)

---

### Feature 1: /scan public (acquisition surface)

**What it does:** Unauthenticated visitor enters their domain. Beamix runs a scan against 11 text AI engines using top 10 queries for their vertical. A 15–17 second animated reveal shows AI visibility score (0–100), which engines mention them, which mention competitors, and 3 specific gaps. Public permalink is generated (private by default — sharing requires one explicit click). CTA: "Fix this — start free." A Trust File integrity-hash nightly job runs on all stored scan results (cross-references F18). Lead attribution claims on this surface state "calls + UTM-attributed clicks" — the phrase "form submissions" does NOT appear in any copy until the customer-site JS snippet ships at MVP-1.5.

**Why MVP:** Primary acquisition channel. Every referral drives to this page. The scan result IS the product demo.

**Changes from v2:**
- Engine abbreviations updated per Design Lock (renaming): "AI" → "AO" for Google AI Overviews. "CG" → "GP" (or confirmed at render audit). "MS" → "CP" for Bing Copilot. All 11 engine abbreviations rendered side-by-side at 11px and legibility-confirmed before lock.
- AI Visibility Cartogram (F22) renders on /scans/[scan_id] detail page — public scan result surfaces cartogram once user claims their scan and enters the dashboard.

**Acceptance criteria:**
- [ ] Visitor enters a domain and clicks Scan — completes in under 20 seconds
- [ ] Score (0–100) displays with delta vs vertical benchmark ("below average for B2B SaaS")
- [ ] At least 3 specific engine citations shown (engine name, query context)
- [ ] At least 2 competitor citations shown ("your top competitor appears in X more engines")
- [ ] Permalink generated and private by default — sharing requires one explicit click ("Generate share link")
- [ ] "Start free" CTA links directly to signup with `?scan_id=` parameter
- [ ] Two-column tier picker below scan results: Discover ($79) vs Build ($189) with one-line differentiator each. Scale not shown at /scan.
- [ ] Lead attribution copy reads "calls + UTM-attributed clicks" — no mention of "form submissions"
- [ ] Cream-paper aesthetic background, Fraunces accent, stamp/seal motif — reserved for /scan only
- [ ] Mobile-responsive, loads in <3s on 4G
- [ ] `X-Robots-Tag: noindex, nofollow` on all private permalink routes; scan result public page indexable
- [ ] Engine abbreviations: "AI" renamed to "AO" (Google AI Overviews). All 11 abbreviations legibility-tested at 11px before launch copy is set.

**Dependencies:** AI engine scan infrastructure (11 engines), vertical detection, score algorithm

**Priority: MVP**

---

### Feature 2: Onboarding flow (Brief approval ceremony)

**What it does:** 4-step post-Paddle onboarding. Step 1: business profile (domain, category, location — pre-filled from scan if `?scan_id=` present). Step 2: Lead Attribution — vertical-aware: SaaS-classified customers see UTM-first; e-commerce / local-services customers see Twilio-first. Step 2 includes "Send setup instructions to your developer" button. Step 3: Brief approval — Beamix authors a 1-paragraph Brief; customer reads, edits chips, approves. Brief includes "This doesn't describe my business" escape hatch. Step 4: Truth File.

**Seal ceremony (Board 2 re-spec):** The Seal stamps in 540ms using a stamping easing curve (`cubic-bezier(0.34, 0.0, 0.0, 1.0)` or equivalent — a hand lifting from paper, not a CSS fade). After the Seal lands: "— Beamix" appears in a 300ms opacity fade. No pen-stroke letter-by-letter animation. No signature-stroke motion token. The Seal IS the signature; the typed wordmark is the read-back. One ceremony, not two. See Design Lock C (Board 2) in §3.

**Print-the-Brief offer:** After Seal lands, a "Print this Brief →" link appears below the signature area. See F27 for full specification.

**Why MVP:** Without onboarding, there is no Brief, no Truth File foundation, and no agent context. The Brief approval is the product's first trust-establishing moment.

**Changes from v2:**
- Seal-draw re-curved to 540ms stamping curve (Board 2 lock). Signature-stroke pen animation cut entirely. "— Beamix" opacity-fade only (300ms).
- "Print this Brief →" offer added post-Seal (F27)
- Customer office address field added as optional input in Step 1 (required for F26 Print-Once-As-Gift; optional — no friction if skipped)

**Acceptance criteria:**
- [ ] Step 2 content is vertical-aware: SaaS sees UTM panel prominently, Twilio as secondary collapsed. E-commerce and local-services see Twilio prominently, UTM as secondary.
- [ ] "Send setup instructions to your developer" button present in Step 2. Clicking opens email-address field (pre-filled from billing email, editable). Sends plaintext snippet: UTM tag + Twilio number. Fires immediately on click.
- [ ] 72-hour verification check: if Twilio number or UTM tag not detected on customer's domain 72h after setup, a reminder email fires
- [ ] Step 3 includes "This doesn't describe my business" link (13px, ink-3 color, below chip editors). Clicking navigates to Step 1 with industry combobox pre-focused.
- [ ] Onboarding detects `?scan_id=` — skips redundant scan, imports data, pre-fills business profile
- [ ] Brief is Beamix-authored (not customer-written). Editing uses chip menus.
- [ ] Seal stamps in 540ms using stamping easing curve. "— Beamix" appears in 300ms opacity fade ONLY — no stroke-draw, no letter-by-letter pen animation.
- [ ] "Print this Brief →" link appears below signature area after Seal lands (see F27 for acceptance criteria)
- [ ] Optional office address field in Step 1 (used for F26 at month 6; no validation required at onboarding)
- [ ] After approval: first agent run queued automatically; customer sees "Beamix is working" confirmation
- [ ] Onboarding completes in under 4 minutes for median customer
- [ ] Every client account (including Yossi's 12 clients) gets full Brief ceremony, full Truth File, full Lead Attribution setup — no shortcut flow

**Amendment v4 (2026-04-28):**
- Add: 1px ink-1 dot beside the Seal during the 540ms stamp animation. The dot fades in at t=120ms (during the path-draw phase), holds during the hold phase, fades out with the seal-fade. Reads as "the hand that stamped it." (Arc's "Hand" — ~1 day frontend)

**Dependencies:** Vertical classification, Brief template (2 verticals at launch), Seal-draw animation component (re-curved), Truth File schema (F3), F27

**Priority: MVP**

---

### Feature 3: Truth File (Trust Architecture — non-negotiable pre-launch)

**What it does:** A structured per-customer document storing authoritative facts about their business. Implemented as a shared base schema + vertical-extensions (Zod `discriminatedUnion` keyed by `vertical_id`, per-vertical schema versioning). Single Postgres row + JSONB. Every agent action cites the Truth File as a source. Agents cannot publish factual claims that contradict the Truth File.

**Base schema fields (all verticals):**
- `business_name`, `domain`, `vertical_id`
- `voice_words` (array, ≤8 entries, customer-authored)
- `never_say` (array, exact + semantic matching)
- `prohibited_claims` (array, hard-block on any output)
- `contact_email`, `contact_phone` (optional)
- `content_tone` (enum: technical / conversational / authoritative / warm)
- `competitors` (array of domains, ≤10)

**SaaS vertical-extension fields:**
- `integrations` (array of product names)
- `pricing_model` (enum: per-seat / per-api-call / flat / usage-based / hybrid)
- `target_company_size` (string, e.g., "10–500 engineers")
- `claims_to_repeat` (array, ≤5)
- `schema_type` = `SoftwareApplication` (fixed)
- `hours` and `service_area` fields: NOT present in SaaS schema

**E-commerce vertical-extension fields:**
- `product_categories` (array)
- `shipping_regions` (array)
- `return_policy` (string)
- `price_range` (min/max in customer's currency)
- `schema_type` = `Product + Offer`
- `allergen_claims` (optional, safety-sensitive — auto-escalates to manual review)

**Local services vertical-extension fields (future, not MVP):**
- `hours`, `service_area`, `certifications` — reserved for vertical 3+ build

**Why MVP:** Trust Architecture lock. Without it, agents can publish incorrect facts. One bad agent action costs more in trust than 10 good actions earn.

**Acceptance criteria:**
- [ ] Truth File stores as single Postgres row with JSONB for vertical-extension fields
- [ ] Zod schema uses `discriminatedUnion` keyed by `vertical_id` — `parseTruthFile(data)` returns typed vertical-specific object or throws
- [ ] SaaS Truth File schema does NOT include `hours` or `service_area` fields
- [ ] E-commerce Truth File schema does NOT include `integrations` or `pricing_model` fields
- [ ] Every agent pre-publication check includes Truth File validation (claim verification + prohibited-term check + voice match)
- [ ] Customer can view, edit, and add to Truth File in `/settings → Business Facts` — structured form (not raw JSON) with vertical-specific fields only
- [ ] Customer can see which agent actions referenced which Truth File fields (provenance, accessible from /inbox item detail)
- [ ] Truth File is exported in JSON Schema-conformant format if customer cancels or requests DSAR export
- [ ] Agents are hard-blocked from publishing claims in `prohibited_claims` array — no auto-revise, hard block
- [ ] Per-vertical schema versioning: schema_version field on each TF JSONB; migrations non-destructive

**Dependencies:** Vertical classification (F16), agent provenance system

**Priority: MVP (must ship before any agent goes live)**

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

**Dependencies:** Agent system, pre-publication validation (F4), Seal component (re-curved), Rough.js, F30, F31

**Priority: MVP**

---

### Feature 7: MVP agent roster (6 agents ship at launch)

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

*(No changes from v2 — specification unchanged.)*

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

**Dependencies:** Resend, Inngest, React-PDF, F22, F28

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
- [ ] Brief grounding cell in inspector: cream paper + Fraunces 300 italic. First-per-session: 400ms fade-in + one-time Trace under clause. Subsequent: 120ms fade.
- [ ] Cycle detection, orphan node detection, cost estimate on every save
- [ ] Resource conflict detection at save time
- [ ] Linear versioning: "Save" creates new version. Last 20 retained.
- [ ] "Agency review gate" node type available in node palette (Scale only)
- [ ] Build-tier customers see upgrade modal on `+ New Workflow` click — not the editor
- [ ] Discover-tier customers see no workflow UI
- [ ] Brief grounding inline citation visible per F30 specification on Workflow Builder node inspector (1px rule + Inter italic variant, NOT cream cell — see F30 exception for WB Inspector which uses its own cream+Fraunces treatment per Design Lock B)
- [ ] Brief binding line present per F31 specification

**Deferred to MVP-1.5:** Event triggers, workflow publishing, loop node, run sub-workflow

**Priority: MVP (Scale-only)**

---

### Feature 20: /security public page

*(No changes from v2. Voice canon: "cannot publish" not "refuses to publish" — per Board 2 Ive note. One-word change, massive trust signal.)*

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

*(No changes from v2.)*

**Acceptance criteria:**
- [ ] Scale-tier DPA drafted before MVP launch
- [ ] Indemnification clause: lesser of (3× monthly subscription fee) or ($25,000/incident)
- [ ] Scope explicitly defined: covers errors that passed pre-publication validation
- [ ] DPA signed as part of Scale-tier checkout (Paddle)
- [ ] DPA accessible from /settings → Billing and /security page
- [ ] Tech E&O insurance bound before launch — minimum $1M/$1M

**Priority: MVP (legal advisor task)**

---

### Feature 22: AI Visibility Cartogram (NEW — MVP)

**What it does:** A single-page data artifact showing the customer's entire AI search visibility frontier in one image. 50 queries × 11 engines = 550 cells. Each cell color-coded, carrying one character glyph. The reader scans the cartogram and sees in one image: which queries they own, which they are losing, which engines are friendly, which are hostile. Tufte's "John Snow cholera map of GEO." No GEO competitor has shipped this. The data is already collected by the scan engine — the renderer is new.

**Cell color coding (4 states):**
- `--color-brand` (brand-blue): customer cited at top position (1–3)
- `--color-ink-3`: customer cited but late position (4+)
- `--color-paper-elev` (elevated paper): not cited
- `--color-score-critical-soft` (soft red, #FCE3E3): competitor cited instead of customer

**Cell glyph (1 character, 11px Inter caps):**
- Position number (1, 2, or 3) if customer cited at top position
- Competitor initial if competitor cited instead
- Empty if not cited

**Direct labeling:**
- Queries: listed down left margin, 11px Inter caps, ink-2
- Engines: listed across top, 11px Inter caps, ink-2
- No legend — color and glyph are self-explanatory at the scale

**Rendering rules:**
- No animation, no gradient, no entrance effect — renders at full state at t=0 (Tufte: "Beautiful Evidence canon")
- Static HTML grid, 550 cells, conditional formatting via CSS classes
- Mobile responsive: cell size scales to maintain grid shape

**Surfaces where cartogram renders:**
1. /scans/[scan_id] detail page (primary surface — authenticated, post-scan)
2. Monthly Update PDF Page 2 (replaces prior Page 2 layout)
3. Public OG share card for /scan public (visible when scan result is shared)

**Why MVP:** The data is already collected (every scan captures per-engine per-query rank). Implementation cost is low (550-cell HTML grid with conditional formatting). Strategic effect is category-defining — the cartogram is what Sarah and Yossi screenshot and share. No GEO product has shipped this at launch.

**Acceptance criteria:**
- [ ] Cartogram renders within 2 seconds of page load on /scans/[scan_id] detail
- [ ] All 550 cells correctly color-coded per 4-state scheme above
- [ ] Glyphs readable at cell size (11px Inter caps, position number or competitor initial)
- [ ] Query labels down left margin, engine labels across top — 11px Inter caps, ink-2, direct-labeled
- [ ] No animation, no gradient, no entrance effect — renders at full state at t=0
- [ ] Mobile responsive: cell size scales, grid shape maintained. Minimum readable on 375px viewport.
- [ ] Cartogram present on Monthly Update PDF Page 2
- [ ] Cartogram used as OG image for public /scan share card
- [ ] Engine abbreviation corrections applied (AO for AI Overviews, etc.)
- [ ] Pilot readability validation: show 10 customers and confirm they can identify "which engines are friendly" in under 10 seconds without instruction

**Amendment v4 (2026-04-28) — Implementation lock:**
- CSS Grid implementation (NOT canvas) for product surfaces (a11y + procurement-grade requirement per Aria)
- 14×12px cells (locked from cartogram pixel spec)
- 11 engines × 50 queries = 550 cells; total artifact 468×697px
- SVG for OG share card + Monthly Update PDF
- Two new design tokens: `--color-cartogram-grid-bg`, `--color-score-critical-soft` (#FCE3E3)

**Dependencies:** Scan engine (per-engine per-query rank data), React-PDF (PDF rendering), F9 (/scans detail page), F14 (Monthly Update)

**Effort estimate:** ~5 person-days (renderer + Monthly Update integration + OG card)

**Priority: MVP**

---

### Feature 23: Cycle-Close Bell (NEW — MVP)

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

**Amendment v4 (2026-04-28) — Arc's "Wave":**
- Add: 60ms stagger left-to-right wave on the small-multiples sparkline strip BEFORE the settle animation. 11 cells × 60ms = 660ms total wave, then 200ms settle. (~1 day frontend)

**Dependencies:** F5 (/home), Activity Ring component, scan completion event (Inngest), agent action completion tracking

**Effort estimate:** ~2 person-days

**Priority: MVP**

---

### Feature 24: Brief Re-Reading — quarterly trigger (NEW — MVP)

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

### Feature 25: Receipt-That-Prints card (NEW — MVP)

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

### Feature 26: Print-Once-As-Gift — month 6 (NEW — Post-MVP)

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

### Feature 27: Print-the-Brief button at onboarding end (NEW — MVP)

**What it does:** After the Seal lands at the end of Step 3 Brief approval, a single offer appears below the signature area. A 14px Inter 400, ink-3 link reading "Print this Brief →". Visible for 8 seconds. Dismissable by clicking the Continue button (which also advances onboarding). One-time — never appears again after this moment. This is the 7% moment: most customers will not click. The 7% who do will print it and pin it to a wall.

**Print output:**
- Single A4 page (portrait)
- Background: cream paper (`--color-cream`)
- Typography: Fraunces 300 throughout, same register as the Brief itself
- Content: Brief text in full, chip-selected values listed below, Seal graphic (static, not animated), "— Beamix" signature, date stamp (Geist Mono, 11px, ink-3)
- Format: PDF download via browser (React-PDF — the same infrastructure used for Monthly Update; zero new engineering)
- File name: `your-beamix-brief-[YYYY-MM-DD].pdf`

**Timing:**
- Appears: immediately after Seal lands (0ms delay)
- Disappears: after 8 seconds of inactivity, OR when customer clicks "Continue" button, whichever first
- Fade-out: 300ms opacity fade

**Why MVP:** Zero new engineering (React-PDF infrastructure exists). Smallest move in the list, highest return per pixel. The Brief as a physical artifact is a trust-establishing gesture no competitor makes.

**Acceptance criteria:**
- [ ] "Print this Brief →" link appears below signature area immediately after Seal lands in Step 3
- [ ] Link is 14px Inter 400, ink-3 color
- [ ] Visible for 8 seconds. After 8 seconds: 300ms opacity fade-out and DOM removal
- [ ] Clicking "Continue" dismisses the link immediately (before 8s timer) and advances onboarding
- [ ] Clicking "Print this Brief →": generates A4 PDF within 3 seconds via React-PDF. PDF downloads automatically. Onboarding does NOT advance — customer stays on Step 3 until they click Continue.
- [ ] PDF: cream paper, Fraunces 300, full Brief text, Seal graphic, "— Beamix" signature, date stamp in Geist Mono 11px
- [ ] File name: `your-beamix-brief-[YYYY-MM-DD].pdf`
- [ ] Appears exactly once per customer — never shown again after onboarding Step 3
- [ ] PDF generation does not block onboarding Continue flow (async generation, non-blocking)

**Dependencies:** React-PDF (existing infrastructure), Seal component (static version for PDF), Brief data (F2/F3)

**Effort estimate:** Less than 1 person-day

**Priority: MVP**

---

### Feature 28: "What Beamix Did NOT Do" Monthly Update line (NEW — MVP)

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

### Feature 29: Printable A4 ops card in /settings (NEW — MVP)

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

### Feature 30: Brief grounding inline citation everywhere (NEW — MVP)

**What it does:** Every agent action across product surfaces carries an inline citation back to the authorizing Brief clause. This is Rams' structural commitment — not a graphic treatment, but an architectural one. It makes the Brief ubiquitous and constitutional: every customer-facing agent output is visibly grounded in the founding document the customer approved. Uncopyable not because it is a design pattern but because it is a data architecture decision.

**Visual treatment (standard — all surfaces except Workflow Builder Inspector):**
- 1px brand-blue left rule
- Label: "Authorized by your Brief:" in text-xs caps, ink-3
- Quoted clause: Inter 400 italic, 14px, ink-2: the exact clause text as it read when the action was authorized (snapshotted at creation time)
- Attribution: "— clause N of M" + "Edit Brief →" link in 12px Inter 400, ink-3
- Link navigates to /settings → Brief tab, Brief editing flow

**Visual treatment (Workflow Builder Inspector only — Design Lock B in §3):**
- Cream paper cell + Fraunces 300 italic clause text (the "constitutional moment" treatment)
- First selection per session: 400ms fade-in + one-time Trace under clause
- Subsequent selections: 120ms fade
- Same "Edit Brief →" link

**Surfaces where citation appears:**
1. /inbox row detail (right panel, below before/after diff)
2. /workspace step output (below step output text)
3. /scans Done lens row expansion (below action summary)
4. /home Evidence Strip cards (below action headline)
5. Workflow Builder node inspector (cream+Fraunces variant per Design Lock B)

**Data architecture:**
- Every agent action record stores `brief_clause_ref` in provenance envelope at creation time (Tier 0 requirement)
- `brief_clause_snapshot` field stores the exact clause text as it read when the action was authorized
- Even if the customer later edits their Brief, the citation shows the clause text that authorized this specific action
- Brief clause refs use format: `clause_N` where N is the clause index (1-indexed)

**Why MVP:** This is the feature that makes Beamix constitutionally different from every other AI automation tool. Every competing tool acts autonomously with no reference to a founding document. Beamix acts with every action traceable back to a clause the customer personally approved. The citation is the proof. Engineering cost: ~3pd for consistent rendering across all surfaces.

**Acceptance criteria:**
- [ ] Every customer-facing agent action on all listed surfaces has a visible Brief citation
- [ ] Standard citation treatment: 1px brand-blue left rule + "Authorized by your Brief:" label + quoted clause text (Inter 400 italic 14px) + "— clause N of M · Edit Brief →"
- [ ] Workflow Builder Inspector uses cream+Fraunces variant per Design Lock B (§3)
- [ ] "Edit Brief →" link navigates to /settings → Brief tab, Brief editing flow on all surfaces
- [ ] Clause text shown is the snapshotted text at time of action creation — not the current Brief text
- [ ] Actions taken before F30 ships (historical actions): citation renders as "Authorized by your Brief (clause text unavailable for this action)" — graceful fallback, no broken UI
- [ ] `brief_clause_ref` and `brief_clause_snapshot` fields present in provenance envelope for all actions created after F30 ships (Tier 0 requirement)
- [ ] Citation is non-interactive except for the "Edit Brief →" link — no expand/collapse, no tooltip on the clause text itself
- [ ] Citation renders correctly on mobile in /inbox and /home (text-xs label wraps gracefully)

**Amendment v4 (2026-04-28) — Extend to API:**
- Every Beamix API response includes `authorized_by_brief_clause` field with the Brief clause UUID + truncated text (≤120 chars)
- API documentation (when shipped at month 6-9 post-MVP per Stripe v2 roadmap) shows the Brief grounding field as a structural commitment
- Effort: ~2 days backend (every API route + response schema)

**Dependencies:** Tier 0 provenance envelope schema (items 11 and 12 in Tier 0 list), Brief data (F2/F3), all listed surfaces (F5, F6, F8, F9, F19)

**Effort estimate:** ~3 person-days (per-action citation rendering across all surfaces)

**Priority: MVP**

---

### Feature 31: Brief binding line at every product page bottom (NEW — MVP)

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

**Feature ID:** F35
**Surface:** /settings → Billing tab (cancel flow); post-cancel state of all product routes; Paddle webhook handler

**What it does:**
Cancellation is one click, no dark patterns (already in F13). What this feature adds is the full spec of the post-cancel state. Cancel takes effect at the end of the current billing period (Paddle subscription cancel behavior). During the wind-down period (from cancel click to period end), all agents continue running normally. After period end, the account enters **Read-only mode** for 90 days. After 90 days of inactivity, the account enters **Archive mode** indefinitely.

**Post-cancel state table:**

| Feature | Wind-down (to period end) | Read-only (90 days) | Archive (90+ days) |
|---|---|---|---|
| Login | Full access | Full access — read-only UI | Login permitted; data accessible via export request only |
| /home | Full | Data visible, no new agent runs | Redirect to reactivation page |
| /inbox | Full | Visible, no new approvals needed | Not accessible |
| Scheduled agent runs | Run normally | Cancelled immediately | N/A |
| Twilio numbers | Active | Retained + active (calls log to /settings, no new triggers) | Released after 90 days |
| UTM URLs | Active | Active (clicks log, no new agents react) | URLs return 404 |
| Monthly Update permalinks | Public/private per setting | Remain accessible per privacy setting | Removed from public CDN after 90 days |
| Brief, Truth File, scan history | Full | Readable | Export available via DSAR for 2 years |
| Per-client data (Yossi) | Full | Readable | Same as above |

**Voice and microcopy:**
- Cancel confirmation: *"Your subscription will end on [date]. Until then, everything continues as normal. After that, your data remains readable for 90 days."*
- Read-only mode banner: *"Your Beamix subscription ended on [date]. Your data is still here. Reactivate to resume agent work."*
- Reactivation CTA: *"Pick up where you left off — your Brief, history, and data are waiting."* (Not "start fresh" — continuity framing.)
- Twilio release notice at 90 days: *"Your Twilio numbers will be released in 7 days. Update your website before then to avoid broken call tracking."*

**User story:** As Marcus, I want to know that if I cancel and come back in 3 months, my Brief, my scan history, and my attribution numbers are all still there, so that reactivation feels like resuming, not starting over.

**Acceptance criteria:**
- [ ] Cancel flow: one click from /settings → Billing. No dark patterns. No "are you sure × 3" loops. One confirmation modal with cancel date and data retention summary.
- [ ] Paddle webhook: on `subscription.cancelled`, set `subscription_status = 'cancelled'`, set `cancel_effective_date` to period end.
- [ ] Scheduled agent runs: paused immediately when `cancel_effective_date` is reached (Inngest job checks subscription status before each run).
- [ ] Twilio numbers: retained in read-only mode. Released (Twilio API) 90 days after cancel effective date. Customer receives a 7-day advance email warning before release.
- [ ] UTM URLs: continue to log clicks in read-only mode. No new agent reactions to UTM click events.
- [ ] Monthly Update permalinks: honor per-report privacy setting during read-only mode. Removed from public CDN at 90-day archive transition.
- [ ] Brief, Truth File, scan history, agent action ledger: readable during 90-day read-only period. Not deleted. Accessible via data export (F34) for 2 years post-cancel.
- [ ] Reactivation: customer picks any tier, Paddle restores subscription. Account state is immediately restored to last active state — no re-onboarding required.
- [ ] If customer reactivates within 90-day read-only period: agents resume from current state. Brief is in force. No new onboarding.
- [ ] If customer reactivates after 90-day archive period: account state restored from archive. Customer sees a "Review your Brief before we resume" prompt (Brief Re-reading flow from F32) — the Brief may be stale after a long gap.
- [ ] Monthly Update permalink copies: PDFs that were emailed remain in recipients' inboxes — email delivery is not retractable. Only the hosted permalink is removed.

**Build effort:** S — Paddle webhook handler amendment, scheduled Twilio release job (Inngest), read-only mode UI gate, reactivation path.

**Edge cases:**
1. Customer cancels but their dev hasn't removed the Twilio number from the website yet when the 90-day release fires: Beamix sends a 7-day advance email and a 48-hour advance email. If the number is still receiving calls at release time, the release proceeds (Beamix cannot control what is on the customer's website). The /settings Lead Attribution tab shows "Number released" with the release date.
2. Yossi (agency Scale) cancels: all 12 client accounts enter the same read-only → archive lifecycle simultaneously. Per-client export (F34) is available during the 90-day read-only window.
3. Customer requests GDPR deletion before the 2-year retention period: DSAR deletion requests are honored — account enters immediate deletion. Monthly Update PDFs that were emailed remain in recipients' inboxes (outside Beamix's control, and are the customer's property). Beamix's stored copies are deleted.

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

**Feature ID:** F42
**Surface:** New route group `/trust` with sub-pages.

**User story:** As Aria (CTO co-founder of Marcus's company), I need a procurement-ready trust artifact that surfaces compliance status, sub-processors, DPA, and ongoing security posture — so I can sign off Marcus's vendor onboarding without a 6-week security review.

**Acceptance criteria:**
- [ ] `/trust` — landing page (cream paper register, Fraunces 300 italic editorial line, Beamix Seal); 4 cards linking to sub-pages
- [ ] `/trust/compliance` — SOC 2 Type I status (live observation period start date), HackerOne bounty live status, ISO 27001 roadmap commitment, GDPR DPA link
- [ ] `/trust/sub-processors` — extended table with 5 columns Aria flagged: controller/processor/joint-controller, underlying cloud, SOC 2/ISO 27001 status per sub-processor, last-audited-by-Beamix date, real DPA link per row
- [ ] `/trust/dpa` — ungated public DPA link (PDF + HTML version); covers liability cap + carve-outs, IP indemnification flowing through Anthropic/OpenAI terms covering AI-generated content (Beamix-specific load-bearing), 48h customer-breach SLA, 30d sub-processor pre-notification, cyber-liability insurance disclosure
- [ ] `/.well-known/security.txt` — RFC 9116 compliant (`Contact:`, `Encryption:`, `Acknowledgments:`, `Preferred-Languages:`, `Canonical:`, `Policy:`, `Hiring:`)
- [ ] SOC 2 Type I observation period START at MVP launch; report DELIVERED at MVP+90 (audit firm name + observation dates published on /trust/compliance)
- [ ] Each page has Brief binding line at bottom (F31 — rotating Brief clause)
- [ ] Customer in Israel: DPA includes hebrew-language-supplement note
- [ ] Customer is Yossi (multi-client agency): DPA addendum for sub-vendor pass-through
- [ ] Sub-processor mid-audit: "audit in progress" status row instead of date

**Voice + microcopy:** "We publish what we know, when we know it. The dates here are real."

**Build effort:** L (~10 person-days backend/frontend; auditor engagement is parallel — Drata + Prescient Assurance or equivalent ~$8K-15K Type I)

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

---

## 3. Locked Design Decisions Cascading from Board 2 (2026-04-28)

**Authority:** These decisions were contested at Design Board 2 (April 28, 2026) and are now locked by Adam's confirmation. They supersede any prior design spec, designer instructions, or agent assumptions. Do not reopen.

---

### Lock A — Score+Ring keeps as identity geometry

**Decision:** The Activity Ring is KEPT as identity geometry. Tufte's data-ink-ratio critique is acknowledged and accepted as a design tension — the Ring's purpose is identity and framing, not data encoding. The arc is not a progress bar. The number inside is the data; the arc is the frame.

**What changes (Board 2 cuts to go with the keep):**
- `motion/ring-pulse` token: CUT ENTIRELY. Ring stays completely still when agents are acting. TopbarStatus dot is the canonical "agent acting" signal.
- `motion/ring-draw` entrance (1500ms): CUT ENTIRELY. Ring renders at full geometry at t=0 on all loads.
- `motion/score-fill` on returning sessions: CUT. Score renders at final value at t=0 on sessions after first scan.
- The Ring is now, effectively, a still photograph — a frame around the score.
- ONE new motion token added: `motion/ring-close` (the Cycle-Close Bell in F23). This is the only moment the Ring moves. It is earned by closing a cycle.

**What does NOT change:**
- Ring geometry: 252° arc, 30° gap, 2px brand-blue stroke, Rough.js terminus seam (deterministic seed from customer_id — separate from the agent UUID seed; the customer's Ring terminus is theirs for their account lifetime)
- Ring size: 200px on /home, appropriately scaled on /scan public and Monthly Update header
- Ring placement: /home above-fold, /scan public hero, Monthly Update PDF cover

**Rationale:** 3 of 4 legends (Ive, Rams, Kare) defend the Ring. Tufte's critique is the lone strong-cut voice. Ive's defense is architecturally correct: Ring as frame + number as figure is "separated." Accept the tension.

---

### Lock B — Brief grounding cell stays cream+Fraunces in Workflow Builder Inspector only

**Decision:** The cream paper + Fraunces 300 italic Brief grounding cell in the Workflow Builder node inspector is KEPT. It is the "iPhone unlock animation of this product" — the constitutional moment made visible inside the most utilitarian surface in Beamix.

**What this means:**
- Workflow Builder Inspector Brief grounding cell: cream paper background, Fraunces 300 italic clause text, 13px, ink-1. This is the ONLY surface in Admin Utility with a register-shift.
- All other surfaces (F30): standard treatment — 1px brand-blue left rule + Inter 400 italic 14px.
- The cream+Fraunces treatment is earned precisely because it is singular — one register-shift in Admin Utility gives it constitutional weight. If it appeared on 5 surfaces it would become noise.

**First-time-per-session improvement (Ive's refinement):**
- First node selection that triggers the Brief grounding cell in a session: cell fades in over 400ms with a one-time Trace under the clause (Trace behavior, not Trace mark — it does not redraw on subsequent selections)
- Subsequent node selections in the same session: 120ms fade only
- The first invocation per session feels invoked; subsequent feel routine

**Rationale:** 2 of 3 legends (Ive, Tufte) defend it explicitly and specifically, with the critical qualifier "only if held to the Inspector — singularity creates weight." Rams' alternative (1px rule + Inter italic) is technically correct but loses the constitutional weight. Keep and improve.

---

### Lock C — Workflow Builder canvas = cream paper at 30% over paper-default

**Decision:** The Workflow Builder canvas background is CHANGED from dot grid to cream paper at 30% opacity over `--color-paper` (white). The canvas becomes a sheet of paper on which workflows are composed.

**What this means:**
- Background: `background-color: color-mix(in srgb, var(--color-cream) 30%, var(--color-paper))` (or equivalent CSS)
- No dot grid, no grid lines, no pattern background
- React Flow canvas renders on this cream wash
- Nodes (white cards with colored header strips) read against cream wash
- This is a single CSS property change

**Rationale:** Ive's version is sharper than the prior Designer's "Admin Utility = clinical canvas" spec. The dot grid makes Workflow Builder look like every other React Flow DAG editor (Retool, n8n, Make). The cream wash makes it unmistakably Beamix. This overrides the prior "Admin Utility = clinical canvas" register rule specifically for the canvas background only — the node anatomy remains clinical (white cards, Inter, no Fraunces in node body).

---

### Lock D — /workspace execution-as-narration replaces walking figure

**Decision:** The courier-flow walking figure animation is CUT. The execution-as-narration column (Ive's proposal, Tufte's convergence) ships instead.

**What this means:**
- Walking figure animation: removed from /workspace header and execution state
- Execution-as-narration column: while any node is executing, the right-side inspector is temporarily replaced by a plain-English narration column. Each executing node pushes one sentence. Example: "Schema Doctor is reading /pricing for FAQPage schema. 2.3 seconds." When the node completes, the inspector returns.
- This is the in-product thesis: "agents at work, visible, attributed, real" — narration makes agent cognition legible without decorative chartjunk

**What this does NOT change:**
- /workspace step list structure (still shows pending / running / done / failed per step)
- Duration and tool usage per step (still shown)
- Past session accessibility

**Rationale:** Tufte cuts the walking figure (decorative theatre); Ive replaces it with execution-as-narration. Adam's original vision ("agent like a team member walking around with tools") is honored in spirit — the narration is the agent's voice during execution, more truthful than an animation of walking. The narration costs ~3 person-days less than the walking gait animation.

---

### Lock E — Rough.js deterministic seed-per-agent ships as brand canon

**Decision:** Rough.js marks use deterministic seeds keyed to agent UUID. Per-render variance is rejected. Kare's MoMA-grade move: `seed(agentUUID) → path` is the brand spine.

**What this means technically:**
- Each of the 18 agents has a UUID. `seed(agentUUID)` generates that agent's Rough.js path parameters. The same parameters recur on every surface, every render, for that agent's lifetime in the product.
- Schema Doctor's specific scribble is the same across 3,000 renders on 300 customer screens. Across the Monthly Update PDF, the /crew monogram, the /inbox attribution mark, the email header. Same seed, same path.
- The function `seed(agentUUID) → path` is documented in the brand spec as brand canon — not in the codebase as a configuration. Changing it in a future version is forbidden in the same way changing the Apple logo is forbidden.
- The 18 agents are not 18 designed monograms; they are 18 applications of one function to 18 UUIDs. Design one rule; generate 18 fingerprints.

**What this does NOT mean:**
- Customer Ring terminus seed (customer_id → terminus shape): independent from agent seeds. The customer's Ring terminus is their own stable mark. Same logic — deterministic from customer_id — but a separate parameter space.
- Ive's "per-render variance" alternative is acknowledged as aesthetically purer and rejected for strategic reasons: brand recognition requires the fingerprint consistency Kare describes.

**Month 6 roadmap item:** Design 18 unique hand-drawn glyphs to replace the generated monograms (Kare: "scaffolding calcifies into Slack-avatar territory if not replaced"). Add to Year 1 design sprint.

---

## 4. User Stories

### Critical path 1: First-time visitor → /scan public → signup

**Story 1.1:** As a B2B SaaS founder who just saw a competitor's scan result on X/Twitter, I want to scan my own domain immediately so that I can see whether my product appears in ChatGPT and Claude before my developer customers do.

**Acceptance criteria:**
- Given I visit /scan, when I enter my domain and click Scan, then I see a score and citation breakdown within 20 seconds on cream paper
- Given the scan completes showing my competitor in 7 engines and me in 2, when I read the tier picker below results, then I see "Discover ($79) · 3 engines" vs "Build ($189) · 6 engines + Competitor Watch"
- Given I click "Start free" on Build, when I complete Paddle checkout, then my scan data is pre-loaded into my dashboard via `?scan_id=` — no redundant scan

**Edge case:** Score is 0. UI shows "Starting from zero is normal — here's what Beamix does in the first 30 days." Not a failure state.

---

**Story 1.2:** As an e-commerce operator who sells supplements, I want the scan to show me my competitive gap without using technical jargon so that I understand the problem before deciding to pay.

**Acceptance criteria:**
- Given the scan completes, when I view above-the-fold results, then no technical jargon appears (no "schema," no "GEO," no "citation envelope")
- Given I see a competitor listed, when I hover their name, then a tooltip says "This brand appears in X AI engines when someone searches for [supplement category]"
- Given I see the 3 gaps, then each has plain-English framing

---

### Critical path 2: Signup → onboarding → Brief approval → first agent run

**Story 2.1:** As a B2B SaaS founder completing onboarding, I want Step 2 to show me UTM tracking prominently so that Beamix feels built for my business from the first minute.

**Acceptance criteria:**
- Given my domain was classified as B2B SaaS, when I reach Step 2, then the UTM panel is prominently featured and the phone number section is collapsed
- Given I see the UTM URL, when I click "Send to developer," then they receive a plaintext snippet within 60 seconds
- Given 72 hours have passed, when neither UTM nor Twilio is detected on my domain, then I receive a plain-text reminder email

---

**Story 2.2:** As a new customer at the end of onboarding, I want to see the Seal land cleanly so that I know the Brief has been approved and Beamix is now working from it.

**Acceptance criteria:**
- Given I click "Approve Brief" in Step 3, when the Seal stamps, then it takes 540ms with a stamping curve (not a slow trace). "— Beamix" appears in 300ms opacity fade after Seal lands. No pen-stroke animation.
- Given the Seal lands, when I look below the signature, then I see "Print this Brief →" in 14px Inter 400 ink-3 — visible for 8 seconds, then fades
- Given 8 seconds pass without clicking "Print this Brief →", when I see the link fade, then I am not required to interact with it — Continue still advances me

---

**Story 2.3:** As a new customer finishing onboarding, I want "Print this Brief →" to give me a clean A4 PDF so that I can pin the Brief in my workspace.

**Acceptance criteria:**
- Given I click "Print this Brief →", when the PDF generates, then it downloads within 3 seconds as a cream-paper A4 with Fraunces 300, Seal graphic, "— Beamix" signature, and today's date
- Given the PDF is open, when I read it, then it contains my Brief text exactly as approved — not a template, my specific Brief

---

### Critical path 3: Marcus's weekly use (open /home → see lead attribution → close tab)

**Story 3.1:** As a 30-person company founder with 6 minutes per week for Beamix, I want the /home page to show me the one thing that matters this week so that I can close the tab and move on.

**Acceptance criteria:**
- Given I open /home on a Monday, when the page loads, then the Activity Ring is already at full geometry — no 1.5-second animation before I can read the score
- Given my score improved 6 points this week, when I see the delta, then I also see which agent action caused it
- Given I have zero pending /inbox items, when I load /home, then Inbox pointer line says "Nothing needs your attention"
- Given it is Monday and last week's cycle completed, when I look at the Activity Ring, then it shows a fresh 252° open arc

---

**Story 3.2:** As a B2B SaaS founder on a Monday morning, I want the Cycle-Close Bell to acknowledge that last week's work is done so that I have a moment of satisfaction before moving on.

**Acceptance criteria:**
- Given all of last week's auto-fixes have shipped, when I open /home on Monday, then I see the Ring close its 30° gap over 800ms, the sparklines settle, and the status sentence rewrite to "Cycle closed. {N} changes shipped this week."
- Given the sequence completes (1,600ms), when I see the Ring re-open at 252°, then it is already showing my current week's starting geometry — ready for this cycle
- Given I reload /home immediately after seeing the Bell, when the page loads, then the Bell does not fire again in the same session

---

**Story 3.3:** As a customer on the 1st of the month, I want a cream-paper card in my /home to tell me my Monthly Update is ready so that I notice it before checking email.

**Acceptance criteria:**
- Given it is the morning of the 1st of the month and my Monthly Update was generated, when I open /home, then I see a 96px cream-paper card above the Evidence Strip with "Your Monthly Update is ready." in Fraunces italic
- Given I click "Read it →", when the page navigates, then I land on the correct /reports/[id] page for this month's report
- Given I opened the report and return to /home the next day, when the page loads, then the card is gone

---

### Critical path 4: Yossi's daily routine (12 clients, Scale tier)

**Story 4.1:** As a digital agency owner managing 12 clients, I want bulk-approve in /inbox and a Brief binding line confirming each action's authorization so that my morning review sweep is fast and auditable.

**Acceptance criteria:**
- Given I am in client Halevi Plumbing's /inbox with 14 pending items, when I press Cmd+A, then all 14 are selected and "Approve 14 items" appears
- Given I expand one item in the right panel before bulk-approving, when I read the detail, then I see the Brief citation: "Authorized by your Brief: '[clause text]' — clause 2 of 4 · Edit Brief →"
- Given I click "Approve 14 items," when processed, then items passing validator are approved immediately. No Seal animation fires.
- Given I navigate to /scans, when I look at the page bottom, then I see the Brief binding line in Fraunces italic rotating the day's clause

---

**Story 4.2:** As a Scale-tier agency owner at the end of the month, I want to print one A4 ops card per client so that I can hand each client a one-page summary of what Beamix is doing.

**Acceptance criteria:**
- Given I switch to client TechCorp in the client switcher, when I navigate to /settings → "Print operations summary," then I see TechCorp's Truth File essentials, active workflows, active agents, and next 3 fire times
- Given I click "Print," when the print dialog opens, then the output fits to a single A4 portrait page
- Given I switch to client Halevi Plumbing and print again, when the card prints, then it shows Halevi Plumbing's data — completely independent from TechCorp's card

---

### Critical path 5: The renewal moment

**Story 5.1:** As a customer at month 3, I want a Monthly Update I can forward to my co-founder or investor so that Beamix justifies itself without me having to explain it.

**Acceptance criteria:**
- Given it is the first Monday of the month, when the Monthly Update email arrives, then the first visible line is the lead-attribution headline
- Given I open the PDF, when I see Page 2, then I see the AI Visibility Cartogram — a 550-cell grid showing exactly which engines and queries I own vs. my competitors
- Given I read page 6, when I reach just above the Seal, then I see the "What Beamix Did NOT Do" line: "Beamix considered {N} changes this month and rejected {M}."
- Given I want to share the report, when I click "Generate share link," then I get a private unguessable URL

---

**Story 5.2:** As a customer at the start of my second quarter, I want Beamix to show me my Brief briefly when I log in on Monday so that I can confirm it still describes my business.

**Acceptance criteria:**
- Given it is the first Monday of a new quarter and I have been a customer for more than one quarter, when I log in, then Beamix opens to my Brief page — not /home
- Given I read the Brief, when I see "It's been three months. Anything to update?" at the bottom, then I either click "Looks good →" or "Edit Brief →"
- Given I click "Looks good →", when the page responds, then I am redirected to /home within 200ms and the Brief date stamp has updated
- Given I do nothing for 3 seconds, when the timer expires, then I am automatically redirected to /home

---

### Critical path 6: The first incident (agent error → rollback)

*(No changes from v2.)*

**Story 6.1:** As a customer whose agent published incorrect information, I want to undo the change immediately so that my website is not showing wrong data to AI engines.

**Acceptance criteria:**
- Given an agent published a change I realize was wrong, when I navigate to /scans → Completed Items, then I see a "Rollback" button with a Brief citation showing which clause authorized the action
- Given I click Rollback, when it processes, then the change is reverted within 60 seconds and I receive a rollback confirmation email
- Given the rollback completes, when I check /home, then activity feed shows "Beamix rolled back [action] at [time]"
- Given my Truth File was corrupted, when the nightly integrity job runs, then I receive a Sev-1 alert and all agents are paused

---

### Critical path 7: Marcus's CTO (the hidden buyer)

*(No changes from v2.)*

**Story 7.1:** As a CTO co-founder reviewing the security page before renewal, I want a plain-prose security posture document readable in 6 minutes so that I can approve the renewal without a vendor security questionnaire.

**Acceptance criteria:**
- Given I navigate to beamixai.com/security, when the page loads, then it is a 6-minute-readable document — not a PDF, not a gated form
- Given I read the DSAR section, when I look for GDPR endpoints, then Articles 15, 17, 20, and 33 are all present with SLA and delivery format
- Given I read the security capabilities, when I find the publishing posture, then it says "cannot publish" — not "refuses to publish"
- Given I read the no-training clause, when I find it, then it explicitly states Beamix does not train general AI models on customer content

---

## 5. Success Metrics

### Framework

Beamix's core thesis: customers who see attributed leads renew; customers who don't, churn. Every metric traces back to that thesis.

The 10 features added in v3 are primarily trust, retention, and evangelism features — they do not change the activation or acquisition metrics but they add new retention and word-of-mouth signals.

---

### Activation metrics (Day 0 – Day 7)

**Onboarding completion rate**
Target: ≥65% of signups complete all 4 onboarding steps (including Brief approval) within 24 hours.
Measured: `onboarding_completed_at` vs `created_at`.

**Time to first evidence**
Target: <90 seconds from onboarding completion to first visible Beamix action in /home activity feed.

**First scan completion rate**
Target: ≥90% of signups who complete onboarding see a completed scan within 2 hours.

**Day 2 email open rate**
Target: ≥55% open rate on the Day 2 "first finding" email.

**"Print this Brief" click rate (F27)**
Target: ≥7% of customers who complete onboarding click "Print this Brief →".
Rationale: Ive estimated "the 7% who do will pin it to a wall." Even at 5%, this is a highly engaged cohort. Track correlation between print-click and 90-day retention.

---

### Engagement metrics (Day 7 – Day 30)

**Monday Digest open rate**
Target: ≥40% on weeks 2–8.

**Weekly active rate**
Target: ≥50% of customers visit /home at least once per week in weeks 2–8.

**/inbox approval rate**
Target: ≥60% of /inbox items approved within 7 days of creation.

**Cycle-Close Bell exposure rate (F23)**
Target: ≥70% of customers who complete at least 1 full weekly cycle see the Cycle-Close Bell at least once in their first 30 days.
Rationale: The Bell requires a completed cycle AND all auto-fixes shipped. If fewer than 70% of customers are completing full cycles, the product has an engagement/autonomy-setting problem upstream.

**AI Visibility Cartogram view rate (F22)**
Target: ≥60% of customers who receive their first Monthly Update navigate to Page 2 (cartogram) — measured via PDF scroll telemetry or /reports page dwell time.

---

### Retention metrics (Day 30 – Day 90)

**Lead Attribution loop closure rate**
Target: ≥40% of Build and Scale customers receive at least 1 attributed call or session within first 30 days.

**Monthly Update forward rate**
Target: ≥15% of Monthly Update recipients click "forward this," download the PDF, or generate a share link within 7 days of delivery.

**Receipt-That-Prints engagement (F25)**
Target: ≥40% of customers who see the Receipt-That-Prints card click "Read it →" within 24 hours.
Rationale: The card exists to drive Monthly Update opens. If fewer than 40% click through, the card is not doing its job.

**Brief binding line edit rate (F31)**
Target: ≥5% of customers click "Edit Brief →" from the binding line within their first 90 days.
Rationale: The binding line is ambient furniture — an edit rate above 5% indicates it is surfacing genuine Brief drift. Below 1% indicates it is either invisible or the Brief is staying accurate. Both are acceptable; this metric diagnoses the former.

**Net Revenue Retention at 90 days**
Target: ≥90% NRR.

**Free-to-paid conversion from /scan public**
Target: ≥8% of public scan completions convert to a paid plan within 14 days.

---

### Growth metrics (Day 90 – Day 180)

**Marketplace workflow installs per customer at 90 days**
Target: ≥25% of Build+ customers have installed at least 1 Marketplace workflow by day 90.

**Scale-tier activation rate (Workflow Builder)**
Target: ≥30% of Scale customers create at least 1 workflow within their first 60 days.

**Scan public shares**
Target: ≥5% of public scan completions result in a share URL generated within 7 days of signup.

**AI Visibility Cartogram shares (F22)**
Target: ≥3% of customers who view the cartogram share it (generate a share link or screenshot the /scans detail page) within 7 days. This is the word-of-mouth trigger for the cartogram.

**Brief Re-Reading completion rate (F24)**
Target: ≥80% of customers who see the quarterly Brief Re-Reading complete it (click "Looks good" or "Edit Brief" within 3 seconds before auto-redirect fires).
Rationale: The 3-second auto-redirect is generous — a "completion" that happens via auto-redirect counts. Below 80% completion suggests the intercept is confusing or the timing is wrong.

---

### North star metric

**Lead Attribution Loop closure rate at 30 days.** A customer who can say "Beamix got me a call last week" tells someone else. This is the metric the CEO reviews weekly.

**Secondary north star (word-of-mouth proxy):** Monthly Update PDF forward/share rate. A customer who forwards the Monthly Update to their board or investor is 3× less likely to cancel in the following 30 days.

---

## 6. Out of Scope for MVP

The following are explicitly deferred. Do not build, do not design, do not ship.

### Workflow features deferred to MVP-1.5

- **Event triggers** in Workflow Builder: `competitor.published`, `score-change`, external webhook, Truth File/Brief change trigger, API-call trigger
- **Workflow publishing to marketplace** by Scale users (cross-tenant Truth File binding ships first, 4-week telemetry minimum)
- **Loop node** and **Run sub-workflow** in Workflow Builder
- **WordPress plugin** for L2 site integration
- **Shopify App / API integration**
- **Cross-client bulk-approve** in /inbox
- **Customer-site JS snippet** for form attribution

### Agents deferred

- Long-form Authority Builder — MVP-1.5
- Brand Voice Guard (standalone) — MVP-1.5
- Content Refresher, Trend Spotter, Citation Predictor (standalone ML model), Local SEO Specialist — Year 1
- Voice AI Optimizer, Visual/Multimodal Optimizer, Agent-Mediated Browsing Specialist, Reputation Defender, Industry KG Curator — Year 1 or later

### AI surfaces deferred

- Voice AI surfaces (Alexa+, Siri, Google Assistant) — Year 1
- Multimodal surfaces (Google Lens AI, GPT vision) — Year 1
- Agent-mediated browsing (ChatGPT Atlas, OpenAI Operator) — Year 1

### Vertical knowledge graphs deferred (2 of 12 ship)

10 of 12 verticals deferred: local home services, healthcare, professional services, restaurants, automotive, real estate, beauty, education, fitness, pet services.

### Platform / ecosystem features deferred

- **Third-party Agent SDK** — Year 1
- **EU region data residency** — MVP-1.5
- **White-label custom subdomain** — Year 1
- **Predictive Layer** — Year 1
- **House Memory** as queryable archive — Year 1.5
- **Content Studio** (Cursor-for-content) — Year 1.5
- **Reputation Layer** — Year 1.5
- **Beamix Sessions** (annual summit) — Year 2
- **Beamix Newsletter** — MVP-1.5
- **Operators' Room** (Slack community) — Year 1 Q3
- **International / non-English UI** — Year 1
- **SOC 2 Type II certification** — Year 1 Q4
- **Revenue-share mechanic for workflow publishers** — Year 1 roadmap
- **Multi-client cockpit / `/cockpit` route** — MVP-1.5 (NOTE: multi-client cockpit is NOW in F40 at MVP for Scale. This deferral applies to a standalone `/cockpit` route separate from /home)
- **Viewer role** (read-only seat) — MVP-1.5

### Design system items deferred post-launch

- **18 unique hand-drawn agent glyphs** replacing generated monograms — Year 1 design sprint (Kare: "scaffolding calcifies into Slack-avatar territory if not replaced by month 6")
- **Cream hex final lock** (#F7F2E8 is the working value — swatch test required before launch: 3 swatches printed and photographed under 3 light conditions on 3 displays)
- **Seal geometry final lock** (must specify total path length, stroke width per size, corner roundness, gap proportion, optical center at 16/20/24/32/48px — cultural-readability audit for 4-pointed asterisk vs chamfered plus sign)

### F26 Print-Once-As-Gift

Explicitly deferred to month-6 post-launch milestone. No customer will be eligible at MVP launch. Print-on-demand vendor selection and API integration planned for post-MVP backlog.

---

## 7. Risks and Open Product Questions

### Risk 1: Trust Architecture is the critical path

The Trust Architecture (Truth File, pre-publication validator, review-debt counter, Truth File integrity job, incident runbook) adds 3–4 weeks to the build timeline as Tier 0 infrastructure. If skipped or rushed, one bad agent action creates catastrophic churn and reputational damage. Marcus explicitly said: "One bad agent action on a live page = instant cancel." This risk is non-negotiable. Mitigation: Trust Architecture completes before any agent runs against a real customer domain. No partial-credit. See Tier 0 checklist in §2.

---

### Risk 2: Lead Attribution Loop integration is harder than it looks

Twilio provisioning is straightforward. The hard part: ensuring the Twilio number and UTM URL actually get embedded in AI-engine-cited content. The customer-site JS snippet for form attribution is not available at MVP (honest copy required: "calls + UTM-attributed clicks" only). Mitigation: dedicated integration testing of Lead Attribution in every agent's output pipeline. Explicit 72-hour verification check. Clear copy.

---

### Risk 3: Vertical classification accuracy

If domain classification is wrong, the wrong vertical KG is applied. The 80% accuracy target means ~20% of customers will be misclassified without a fallback. Mitigation: always offer Step 1 manual override and the Step 3 "This doesn't describe my business" escape hatch. Re-classification available in /settings → Business Facts.

---

### Risk 4: Scan volume costs at launch

11 engines × daily/weekly schedules × growing customer count creates a real infrastructure cost curve. Mitigation: per-customer scan-cost ledger + alarm instrumented from Day 0 (Tier 0 item). Per-account scan budget ceiling. Optimize highest-cost engines first.

---

### Risk 5: Shopify integration gap limits e-commerce value at MVP

E-commerce operators on Shopify expect product schema from their catalog, not from a manual Truth File. At MVP, Schema Doctor generates Product schema from Truth File only. Mitigation: clear onboarding guidance for e-commerce customers on filling Truth File product categories manually. Prioritize Shopify integration in MVP-1.5 sprint.

---

### Risk 6: Inngest free-tier wall-clock constraint

MVP launches on Inngest free tier (50K steps/month, shorter wall-clock timeouts). Some agents — particularly Reporter (Monthly Update PDF) and Citation Fixer (multi-page rewrites) — may approach free-tier wall-clock limits on complex runs. Mitigation: chunk longer work across multiple Inngest steps at design time. Migrate to Inngest Pro ($150/mo) at ~5 paying customers OR ≥75-80% of free-tier ceiling. Workflow Builder workflows must include cost estimates at save time.

---

### Risk 7: Cross-tenant Truth File binding for workflow publishing is untested at MVP

Workflow Builder ships at MVP for private workflows. Workflow publishing defers to MVP-1.5. Mitigation: build cross-tenant binding during MVP sprint, test internally against 3 reference customer fixtures, run 4 weeks of production telemetry on real Scale customer private workflows, then open publishing. Hold the MVP-1.5 date in writing.

---

### Risk 8: AI Visibility Cartogram readability at scale

50 queries × 11 engines = 550 cells at 14×12px (CSS Grid implementation) produces a grid approximately 468×697px. Risks: (a) 50 queries may be too few for meaningful pattern recognition; (b) 50 queries may be too many for a clean overview; (c) glyph density at 11px Inter caps in cells may create visual noise at smaller viewport sizes.

**Mitigation:** Pilot the cartogram with 10 early customers before full launch. Measure: can they identify "which engines are friendly" in under 10 seconds without instruction? Tune cell size (range: 14–18px), glyph size, and query count (30–50) based on pilot feedback. Do not tune by committee — one person reads it cold and reports what they understand in 10 seconds.

---

### Risk 9: Brief grounding citation rendering performance at scale

F30 requires every agent action to carry a Brief clause citation inline across 5 surfaces. This means every page render for /inbox, /workspace, /scans Done lens, /home Evidence Strip, and Workflow Builder performs at least one citation lookup per visible action. At scale (Yossi's 168 items/session), this is up to 168 additional clause lookups per page render.

**Mitigation:** Cache `brief_clause_snapshot` in the `agent_jobs` / provenance envelope records at creation time (Tier 0 requirement — see item 12 in Tier 0 list). At render time: no additional DB query required — the snapshot is embedded in the action record. The citation data travels with the action, not fetched from the Brief table on every render. This eliminates the N+1 problem. Verify implementation before MVP launch via load test simulating Yossi's 168-item /inbox.

---

### Risk 10: Print-Once-As-Gift logistics (F26)

F26 depends on: (a) customer providing an office address during onboarding or cancel flow, (b) print-on-demand vendor having global fulfillment coverage, (c) monthly print jobs completing and shipping within 5 business days, (d) no package losses or wrong-address deliveries affecting trust.

**Mitigation:**
- Address collection is optional at every touchpoint — no friction, no mandate. Only customers who provided an address receive the gift.
- Partner with a print-on-demand vendor that has global fulfillment (Lulu or Blurb are the first candidates — evaluate API quality, paper stock options, and international coverage before committing).
- International: only ship to countries where the vendor confirms reliable fulfillment. If vendor cannot confirm a country, skip gracefully.
- Build the trigger as idempotent (`print_gifts_sent` boolean on customer_profiles) — even if the Inngest job fires twice, the gift is sent at most once.
- This is a month-6 post-MVP feature — logistics can be tested and refined on the first 10 customers before scale.

---

### Open Product Questions

**Q4 (Discover tier engine lock):** Recommended lock: ChatGPT, Perplexity, Google AI Overviews as the 3 Discover engines. Confirm with Adam before launch copy. Once confirmed, update /home tier badge string and product tour.

**Q5 (Review-debt counter thresholds):** Locked: Amber = 3 pending items AND 1–4 days since oldest item created. Red = 5 pending items AND >5 days. These thresholds are locked; do not reopen.

**Q6 (Cream hex final lock):** Working value: #F7F2E8. Must be confirmed by swatch test (3 swatches printed, photographed under 3 light conditions, viewed on 3 displays) before launch. Ive: "The most consequential color in the system; deserves the work." Assign to design team as a pre-launch Tier 0 task.

**Q7 (Seal geometry lock):** Seal path not yet fully specified (total path length, stroke width per size, corner roundness, gap proportion, optical center). Must be specced and tested at 16/20/24/32/48px on white paper and cream paper before launch. Cultural-readability audit: confirm as 4-pointed asterisk or chamfered plus sign — not Star of David, not Christian cross. Assign to design team as pre-launch task.

---

## 8. Design System Canon

The following are non-feature build-canon additions required alongside MVP. They do not earn feature IDs but are load-bearing.

### Motion taxonomy — 10 named easing curves

Add to `apps/web/src/styles/motion.css` and `tailwind.config.js`:

```css
:root {
  --ease-stamp: cubic-bezier(0.55, 0.07, 0.6, 1.05);     /* Seal-stamping */
  --ease-ring-close: cubic-bezier(0.65, 0, 0.35, 1);      /* Cycle-Close Bell */
  --ease-paper-fold: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Receipt card */
  --ease-narration-in: cubic-bezier(0.16, 1, 0.3, 1);     /* Narration column */
  --ease-pill-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* WB elastic edges */
  --ease-status-rewrite: cubic-bezier(0.4, 0, 0.2, 1);    /* F23 status sentence */
  --ease-card-enter: cubic-bezier(0.16, 1, 0.3, 1);       /* Drawer/modal */
  --ease-trace-fade: cubic-bezier(0.4, 0, 0.6, 1);        /* Trace behavior */
  --ease-skeleton-pulse: cubic-bezier(0.4, 0, 0.6, 1);    /* Loading states */
  --ease-wave-stagger: cubic-bezier(0.65, 0, 0.35, 1);    /* Arc's Wave on F23 */
}
```

ESLint rule: `@beamix/no-shared-easing` blocks `transition-all` and raw `cubic-bezier(0.4, 0, 0.2, 1)` outside the named-curve dictionary.

### Typography — Variable Inter + subset Fraunces

- Drop separate InterDisplay font file; use Inter Variable axis `opsz` with values 14, 18, 24, 32, 48, 96 (saves ~70KB)
- Subset Fraunces to ~40 chars (uppercase + lowercase + punctuation used in Brief clauses + Monthly Update headlines + /changelog editorial titles + binding lines): saves ~375KB
- Total font payload: 225KB → 85KB (140KB saved per cold load)
- Build config in `apps/web/next.config.js` font subset + `next/font` variable axis

### Status vocabulary lock — 14 canonical terms

Add to `apps/web/src/lib/status-vocab.ts` + ESLint rule `@beamix/no-banned-status-synonyms`:

| Canonical | Banned synonyms |
|-----------|-----------------|
| Acting | Active, Live, Running |
| Idle | Resting, Waiting |
| Pending | Queued, In progress |
| Blocked | Stuck, Stopped |
| Done | Complete, Finished |
| Failed | Error, Broken |

(Full 14-term table in `BOARD2-linear-v2.md` §6)

### Block primitive interfaces — TypeScript

Per Notion's hybrid recommendation (architect now, ship at MVP-1.5+):

```typescript
// apps/web/src/blocks/types.ts
export interface BeamixBlock<TData> {
  id: string;
  type: BlockType;
  data: TData;
  layout: { col: number; row: number; w: number; h: number; };
}

export type BlockType =
  | 'activity-ring' | 'sparkline' | 'cartogram' | 'brief-clause'
  | 'agent-row' | 'inbox-row' | 'receipt' | 'competitor-row'
  | 'twilio-number' | 'status' | 'small-multiples' | 'workflow-canvas'
  | 'monthly-update' | 'evidence-strip' | 'rivalry-strip' | 'cycle-bell'
  | 'narration-column' | 'crew-grid';
```

18 primitives spec'd in `BOARD2-notion.md` §1.

### Speed CI gate

GitHub Actions workflow runs Playwright + Lighthouse on every PR. Fails on:
- /home boot >100ms warm OR >400ms cold
- /scans paint >150ms warm
- /workspace step expand >80ms perceived
- Bundle size per surface (/home ≤95KB, /scans ≤110KB, Workflow Builder ≤220KB)

Workflow file: `.github/workflows/speed-gate.yml`

### Cream-paper-stays-light partition

Document in design system: 8 surfaces stay cream/light forever (Brief, Monthly Update, /changelog, /trust/*, Onboarding, /reports, OG share cards, /state-of-ai-search). 6 admin-utility surfaces ship dark mode at MVP+30 (/home, /inbox, /scans, /workspace, /crew, /competitors, /settings, Workflow Builder).

Dark token additions per `BOARD2-linear-v2.md` §4: 12 dark tokens including `--color-paper-elev-dark`, `--color-ink-1-dark`, `--color-brand-blue-dark` (#5A8FFF).

### Framer Motion — Drop at MVP

Drop Framer Motion entirely. Build `useChoreography` hook on raw CSS + WAAPI. This eliminates a ~30KB per-page dependency and forces the 10 named easing curves to be used explicitly rather than relying on Framer's defaults.

### Dark mode plan — partition not deferral

Lock the cream-stays-light partition now. Document in DESIGN-SYSTEM v1: 6 admin-utility surfaces ship dark mode at MVP+30; 8 cream-register surfaces stay light forever (canon). Token additions per Linear v2 (12 dark tokens); brand-blue-dark = #5A8FFF (locked).

---

## 9. Outstanding Adam-Decisions

**R2-18: State of AI Search timing — PENDING ADAM CONFIRMATION**
Research recommended MVP+90 (current spec in F47); Stripe v2 recommended MVP launch. The diff is data integrity vs first-impression-coordination.

CEO recommendation: Adam confirms MVP+90. Defensible: the 6 longitudinal charts make the report worth its title; without them, it's "Snapshot of AI Search" — different artifact. Adam can override and ship at MVP launch with 2-chart-only edition + commitment-to-update-quarterly — but the strategic case for MVP+90 is strongest.

Decision needed: Adam confirms MVP+90 launch window, OR overrides to MVP-launch + accepts 2-chart edition.

**R2-19: Composability scope — PENDING ADAM CONFIRMATION**
Notion recommended /reports as first composable surface + architect primitives now + system-wide slash command at MVP.

Current spec: /reports + Workflow Builder Inspector as the composable allow-list at MVP. Slash command ships at MVP but inserts into the composable-surface allow-list only.

Decision needed: Adam confirms /reports + Workflow Builder as the composable allow-list at MVP, OR expands scope.

---

## 10. Domain Infrastructure Status

All domain infrastructure configured 2026-04-29. Status: complete.

| Surface | Configuration | Status |
|---------|---------------|--------|
| Cloudflare DNS | beamixai.com nameservers pointed to Cloudflare | Configured 2026-04-29 |
| Framer apex | beamixai.com apex domain pointed to Framer marketing site | Configured 2026-04-29 |
| Vercel app subdomain | app.beamixai.com pointed to Vercel Next.js product dashboard | Configured 2026-04-29 |
| Resend notify subdomain | notify.beamixai.com DKIM/SPF/DMARC configured for transactional email via Resend | Configured 2026-04-29 |
| Google Search Console | beamixai.com verified and indexed | Configured 2026-04-29 |
| Bing Webmaster Tools | beamixai.com verified | Configured 2026-04-29 |

All references in this document use `beamixai.com`, `app.beamixai.com`, and `notify.beamixai.com`. The old domain `beamix.tech` is retired. Customer-facing brand name remains **Beamix** — never write "BeamixAI" in any copy, email, or UI.

---

## Feature ID Summary — Complete v4 Set

| ID | Name | Priority | Build Effort |
|----|------|----------|--------------|
| F1 | /scan public | MVP | M |
| F2 | Onboarding flow | MVP | M |
| F3 | Truth File | MVP | M |
| F4 | Pre-publication validation | MVP | L |
| F5 | /home | MVP | M |
| F6 | /inbox | MVP | M |
| F7 | MVP agent roster (6 agents) | MVP | L |
| F8 | /workspace | MVP | M |
| F9 | /scans | MVP | S |
| F10 | /competitors | MVP (Build+) | S |
| F11 | /crew | MVP | S |
| F12 | Lead Attribution Loop | MVP | M |
| F13 | /settings | MVP | M |
| F14 | Email infrastructure | MVP | M |
| F15 | 11 text AI engine coverage | MVP | L |
| F16 | 2 vertical knowledge graphs | MVP | L |
| F17 | Marketplace | MVP (constrained) | S |
| F18 | Incident runbook + rollback | MVP | M |
| F19 | Workflow Builder | MVP (Scale-only) | XL |
| F20 | /security public page | MVP | S |
| F21 | Scale-tier DPA | MVP | S |
| F22 | AI Visibility Cartogram | MVP | M |
| F23 | Cycle-Close Bell | MVP | S |
| F24 | Brief Re-Reading quarterly | MVP | S |
| F25 | Receipt-That-Prints card | MVP | XS |
| F26 | Print-Once-As-Gift | Post-MVP | S |
| F27 | Print-the-Brief button | MVP | XS |
| F28 | "What Beamix Did NOT Do" line | MVP | XS |
| F29 | Printable A4 ops card | MVP | XS |
| F30 | Brief grounding citation | MVP | M |
| F31 | Brief binding line | MVP | XS |
| F32 | Brief Re-author + Undo Window | MVP | S |
| F33 | Team Seats + Role Permissions | MVP | M |
| F34 | Customer Data Export (DSAR) | MVP | M |
| F35 | Graceful Cancellation + Retention | MVP | S |
| F36 | Domain Migration Flow | MVP | M |
| F37 | /reports route | MVP | M |
| F38 | Subscription Pause | MVP | S |
| F39 | Competitor Removal | MVP | XS |
| F40 | Multi-Domain Scale Tier | MVP | M |
| F41 | Cmd-K command bar | MVP | M |
| F42 | Trust Center /trust + SOC 2 | MVP | L |
| F43 | Vulnerability disclosure + bounty | MVP | XS |
| F44 | /changelog | MVP | S |
| F45 | Compact mode toggle | MVP | XS |
| F46 | Editorial error pages | MVP | S |
| F47 | State of AI Search 2026 | MVP+90 | XL |

**Total: 47 features. 45 MVP / 1 Post-MVP (F26) / 1 MVP+90 (F47).**

---

*End of PRD v4. This document is the canonical build specification for the Beamix wedge launch. Build Lead starts from this document. Acceptance criteria in §2 are the definition of done for each feature. Tier 0 infrastructure completes before any feature build begins.*

*PRD v3 (2026-04-28-PRD-wedge-launch-v3.md), v2, and v1 are deprecated. Do not reference any prior version for feature decisions.*
