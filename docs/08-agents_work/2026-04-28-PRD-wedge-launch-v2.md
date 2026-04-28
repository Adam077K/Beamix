# Beamix — Wedge Launch PRD v2

**Date:** 2026-04-28
**Status:** CANONICAL — supersedes v1 (2026-04-27). v1 is deprecated. Do not reference v1 for feature decisions.
**Author:** Product Lead
**Lock authority:** Board Meeting Synthesis 2026-04-27, confirmed by Adam 2026-04-28. See `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` for the 23 locked decisions.
**Inputs:** PRD-wedge-launch-v1, BOARD-MEETING-SYNTHESIS, BOARD-product-lead, BOARD-customer-voice, BOARD-yossi-simulator, BOARD-marcus-simulator, BOARD-trust-safety, DECISIONS.md

> **DEPRECATION NOTICE — v1:** PRD-wedge-launch-v1.md is superseded by this document in its entirety. Agents reading the spec set must use v2 only. All acceptance criteria in v1 are retired; the criteria in v2 replace them. Do not open decisions already locked in v2.

---

## Table of Contents

1. [ICP — The Wedge Customer Profile](#1-icp)
2. [MVP Feature Scope](#2-mvp-feature-scope)
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
   - F19 Workflow Builder (NEW — promoted from Year 1)
   - F20 /security public page (NEW)
   - F21 Scale-tier DPA + agency indemnification clause (NEW)
3. [User Stories](#3-user-stories)
4. [Success Metrics](#4-success-metrics)
5. [Out of Scope for MVP](#5-out-of-scope)
6. [Risks and Open Product Questions](#6-risks-and-open-questions)

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

### Tier 0 Infrastructure (must complete before any feature build begins)

The following infrastructure must be built and verified before any agent touches a real customer domain. This is not optional and does not move in parallel with feature work.

1. **Canonical type files** (`apps/web/types/`): `EvidenceCard.ts`, `Brief.ts`, `TruthFile.ts`, `ProvenanceEnvelope.ts`, `AgentRunState.ts`
2. **Supabase schema migration** (all Tier 0 tables + RLS): `briefs`, `truth_files`, `artifact_ledger`, `margin_notes`, `agent_memory` (pgvector), `provenance_steps`, `agent_run_state`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `workflows`, `workflow_nodes`, `workflow_edges`, `workflow_versions`
3. **Inngest free-tier setup** + `runAgent` skeleton + smoke test + free-tier usage telemetry dashboard (migration trigger)
4. **Supabase Realtime channel** + client hook (`agent:runs:{customer_id}`) + polling fallback at 10s
5. **Pre-publication validator service** (separate process; cryptographic signed-token: 60s TTL, draft-hash bound)
6. **Truth File integrity-hash nightly job** (Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h)
7. **Build-time pipeline:** opentype.js Fraunces signature extractor + per-agent Rough.js monogram generator + per-customer seal generator (Inngest job at signup)
8. **Cost ceiling instrumentation** (per-customer monthly scan-cost ledger + alarm)
9. **Resend setup** + send-volume tier + bounce handler + DKIM/SPF/DMARC on notify.beamix.tech
10. **DPA + /security page + privacy posture documentation** (technical-writer + legal advisor)

---

### Feature 1: /scan public (acquisition surface)

**What it does:** Unauthenticated visitor enters their domain. Beamix runs a scan against 11 text AI engines using top 10 queries for their vertical. A 15–17 second animated reveal shows AI visibility score (0–100), which engines mention them, which mention competitors, and 3 specific gaps. Public permalink is generated (private by default — sharing requires one explicit click). CTA: "Fix this — start free." A Trust File integrity-hash nightly job runs on all stored scan results (cross-references F18). Lead attribution claims on this surface state "calls + UTM-attributed clicks" — the phrase "form submissions" does NOT appear in any copy until the customer-site JS snippet ships at MVP-1.5.

**Why MVP:** Primary acquisition channel. Every referral drives to this page. The scan result IS the product demo.

**Changes from v1:**
- Trust File integrity-hash nightly job cross-referenced (F18)
- Lead-attribution claim copy updated: "calls + UTM-attributed clicks" only. "Form submissions" removed from all /scan copy until JS snippet ships MVP-1.5.

**Acceptance criteria:**
- [ ] Visitor enters a domain and clicks Scan — completes in under 20 seconds
- [ ] Score (0–100) displays with delta vs vertical benchmark ("below average for B2B SaaS")
- [ ] At least 3 specific engine citations shown (engine name, query context)
- [ ] At least 2 competitor citations shown ("your top competitor appears in X more engines")
- [ ] Permalink generated and private by default — sharing requires one explicit click ("Generate share link")
- [ ] "Start free" CTA links directly to signup with `?scan_id=` parameter
- [ ] Two-column tier picker below scan results: Discover ($79) vs Build ($189) with one-line differentiator each. Scale not shown at /scan.
- [ ] Lead attribution copy reads "calls + UTM-attributed clicks" — no mention of "form submissions"
- [ ] Cream-paper aesthetic (`#F7F2E8` background, Fraunces accent, stamp/seal motif) — reserved for /scan only
- [ ] Mobile-responsive, loads in <3s on 4G
- [ ] `X-Robots-Tag: noindex, nofollow` on all private permalink routes; scan result public page indexable

**Dependencies:** AI engine scan infrastructure (11 engines), vertical detection, score algorithm

**Priority: MVP**

---

### Feature 2: Onboarding flow (Brief approval ceremony)

**What it does:** 4-step post-Paddle onboarding. Step 1: business profile (domain, category, location — pre-filled from scan if `?scan_id=` present). Step 2: Lead Attribution — **vertical-aware**: SaaS-classified customers see UTM-first ("Track which AI engines send you signups — copy your tagged URL"), with Twilio phone number as secondary collapsed option; e-commerce / local-services customers see Twilio-first. Step 2 includes "Send setup instructions to your developer" button (emails the customer's developer a plaintext snippet). Step 3: Brief approval — Beamix authors a 1-paragraph Brief; customer reads, edits chips, approves. Brief includes "This doesn't describe my business" escape hatch (13px, ink-3, below chip editors) that navigates back to Step 1 with industry combobox focused. Step 4: Truth File. Seal signs "— Beamix." (Not "— your crew" — that language is retired per Voice Canon Model B.)

**Why MVP:** Without onboarding, there is no Brief, no Truth File foundation, and no agent context. The Brief approval is the product's first trust-establishing moment.

**Changes from v1:**
- Step 2 is vertical-aware. SaaS leads with UTM; e-commerce leads with Twilio.
- "Send to your developer" button ships in Step 2 (with email field + verification check at 72h)
- "This doesn't describe my business" escape hatch added to Step 3 (resolves audit BLOCKER #9 and PRD Risk 3)
- Seal signature changed from "— your crew" to "— Beamix" per Voice Canon Model B
- Onboarding applies to EVERY client for Yossi — no shortcuts per client

**Acceptance criteria:**
- [ ] Step 2 content is vertical-aware: SaaS sees UTM panel prominently, Twilio as secondary collapsed. E-commerce and local-services see Twilio prominently, UTM as secondary.
- [ ] "Send setup instructions to your developer" button present in Step 2. Clicking opens email-address field (pre-filled from billing email, editable). Sends plaintext snippet: UTM tag + Twilio number. Fires immediately on click.
- [ ] 72-hour verification check: if Twilio number or UTM tag not detected on customer's domain 72h after setup, a reminder email fires ("Your attribution tracking hasn't been verified yet — here's how to check")
- [ ] Step 3 includes "This doesn't describe my business" link (13px, ink-3 color, below chip editors). Clicking navigates to Step 1 with industry combobox pre-focused and inline note: "We may have misclassified your business. Pick the right category below." Brief re-generates from new vertical.
- [ ] Onboarding detects `?scan_id=` — skips redundant scan, imports data, pre-fills business profile
- [ ] Brief is Beamix-authored (not customer-written). Editing uses chip menus, covers: primary location, service/product category, target customer, top 3 competitors, content tone
- [ ] Seal-draw animation fires on Brief approval (hand-drawn SVG stroke, 800ms, fires once per customer). Seal signs "— Beamix."
- [ ] After approval: first agent run queued automatically; customer sees "Beamix is working" confirmation
- [ ] Onboarding completes in under 4 minutes for median customer
- [ ] Every client account (including Yossi's 12 clients) gets full Brief ceremony, full Truth File, full Lead Attribution setup — no shortcut flow

**Dependencies:** Vertical classification, Brief template (2 verticals at launch), Seal-draw animation component, Truth File schema (F3)

**Priority: MVP**

---

### Feature 3: Truth File (Trust Architecture — non-negotiable pre-launch)

**What it does:** A structured per-customer document storing authoritative facts about their business. Implemented as a **shared base schema + vertical-extensions** (Zod `discriminatedUnion` keyed by `vertical_id`, per-vertical schema versioning). Single Postgres row + JSONB. Every agent action cites the Truth File as a source. Agents cannot publish factual claims that contradict the Truth File.

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
- `hours` and `service_area` fields: **NOT present in SaaS schema**

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

**Changes from v1:**
- Schema is now shared base + vertical-extensions (Zod discriminatedUnion). Previously specified as vertical-specific only.
- `hours` and `service_area` explicitly excluded from SaaS schema (resolves Marcus's "plumber DNA" finding)
- Per-vertical schema versioning added
- Single Postgres row + JSONB architecture specified

**Acceptance criteria:**
- [ ] Truth File stores as single Postgres row with JSONB for vertical-extension fields
- [ ] Zod schema uses `discriminatedUnion` keyed by `vertical_id` — `parseTruthFile(data)` returns typed vertical-specific object or throws
- [ ] SaaS Truth File schema does NOT include `hours` or `service_area` fields — those inputs do not appear in SaaS onboarding Step 4
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

**What it does:** Before any agent publishes any content or schema change, a validation step runs through a separate validator service. Five mandatory rules: (1) Claim verification against Truth File, (2) Brand Voice Fingerprint match (cosine against onboarding-computed style vector), (3) Prohibited-term check (exact + semantic), (4) Vertical-specific rules (SaaS hallucinated-integration detector; e-commerce price-claim rule), (5) Sensitive-topic classifier (health, legal, financial, pricing claims → manual escalation regardless of autonomy setting). Validator binding uses a **cryptographic signed token**: `validate()` returns a signed token (60s TTL, bound to draft hash). `propose()` requires valid token + hash match. Cached token from prior `validate()` fails on hash mismatch. Even on Full-auto mode, `uncertain` outcome → /inbox. No `ctx.publish()` escape exists in the capability-based runtime. Brand Voice Fingerprint algorithm: cosine similarity of style embeddings against a fingerprint vector computed at onboarding from customer's existing site content. Threshold: 0.85 for content, 0.75 for schema/FAQ outputs.

**Why MVP:** The Trust Architecture lock. The pre-publication gate answers "what will NEVER happen without me clicking yes?"

**Changes from v1:**
- Cryptographic signed-token binding explicitly specified (60s TTL, draft-hash bound)
- Capability-based runtime confirmed: no `ctx.publish()` escape exists
- Full-auto mode conservatively bounded: `uncertain` → /inbox always
- Brand Voice Fingerprint algorithm spec added
- Validator unavailable = brownout posture: ALL publishing suspended, /inbox shows "Beamix is in safe mode"

**Acceptance criteria:**
- [ ] Every agent action producing customer-facing content routes through `ctx.validate(draft)` BEFORE `ctx.propose()` — no exceptions
- [ ] Validator is a separate server process. Agents have no direct write access to L4 site integration.
- [ ] `validate()` returns a signed token (60s TTL). `propose()` requires this token. Hash mismatch = propose rejected.
- [ ] First-party agents run against the same validator sandbox as future third-party agents — no privileged bypass
- [ ] `uncertain` validation outcome routes to /inbox regardless of customer's autonomy setting (Full-auto, Smart auto, or Always ask)
- [ ] Validator unavailable for >15 minutes → all publishing suspended → /inbox banner "Beamix is in safe mode — no changes will publish until this is resolved"
- [ ] Brand Voice Fingerprint computed at onboarding from customer's existing site. Cosine threshold: 0.85 for content, 0.75 for schema/FAQ. Below threshold → BLOCK + auto-revise once.
- [ ] Auto-revise: validator calls `ctx.revise(draft, failures)` once. If revised draft passes, propose. If not, hard block.
- [ ] Validation failure reason shown to customer in plain English (not error codes). Example: "This FAQ entry mentions 'we offer 30-day returns' — but your Business Facts say 'no returns policy.' Beamix did not publish this."
- [ ] Review-debt counter visible at top of /inbox and in /home "Inbox pointer line"
- [ ] Per-agent autonomy levels: Always ask (default) / Ask for new types, auto-approve repeats (after 10 approvals) / Full-auto with weekly summary (after 30 approvals in a category)
- [ ] All 5 validator rules run on every propose — no partial validation

**Dependencies:** Truth File (F3), Brand Voice Fingerprint system, /inbox surface (F6)

**Priority: MVP**

---

### Feature 5: /home — the daily destination

**What it does:** Primary product surface. 8 locked sections in vertical scroll. Tier badge canonical strings (no variation, no other wording):
- **Discover:** "Discover · 3 engines · 4 agents"
- **Build:** "Build · 6 engines · 6 agents"
- **Scale:** "Scale · 11 engines · 6 agents (+ 12 locked)"

Lead Attribution empty state is **vertical-aware**: SaaS customer who skipped phone setup sees "Lead attribution starts when developers click your tagged URL — copy your UTM here →". E-commerce customer sees "Connect your Beamix number to start tracking AI-attributed calls."

**Section breakdown:**
1. **Hero score block** — AI visibility score (0–100) with Activity Ring, 12-week sparkline path-draw on load, delta vs last week, 1-line plain-English diagnosis
2. **Top 3 fixes ready** — RecommendationCards, "Run all — N credits" CTA, per-card shows agent name + estimated impact
3. **Inbox pointer line** — count of items awaiting review, links to /inbox. When zero: "Nothing needs your attention."
4. **KPI cards row** — Mentions / Citations / Credits used / Top competitor delta
5. **Score trend chart** — 12-week line, hover tooltips
6. **Per-engine performance strip** — engine pills (3 for Discover / 11 for Build+), locked engines grayed
7. **Recent activity feed** — last 8 events (agent names used here — this is an in-product surface per Voice Canon Model B)
8. **What's coming up footer** — next scheduled scan, next digest send, next billing date

**Changes from v1:**
- Tier badge strings locked with exact canonical wording (eliminates agent-count contradiction)
- Lead Attribution empty state is vertical-aware (resolves Marcus's Day 0 mismatch on /home)
- Per-engine strip correctly scoped: 3 engines for Discover, 11 for Build+

**Acceptance criteria:**
- [ ] Tier badge renders exact canonical string: "Discover · 3 engines · 4 agents" / "Build · 6 engines · 6 agents" / "Scale · 11 engines · 6 agents (+ 12 locked)" — no other wording
- [ ] Activity Ring renders around score (2px stroke, Rough.js terminus seam). Pulses (3s period, opacity) when agent is actively working.
- [ ] Score sparkline path-draws on first load (800ms). Smooth re-renders on revisit.
- [ ] Lead Attribution empty state is vertical-aware: SaaS = UTM-first copy. E-comm = Twilio-first copy.
- [ ] Lead-attribution headline appears once data is available (typically 14+ days after UTM setup or call tracking). Graceful absence if no data.
- [ ] Recent activity feed uses agent names (Schema Doctor, Citation Fixer, etc.) — in-product surface, Voice Canon Model B
- [ ] Per-engine strip shows locked/grayed engines for lower tiers with upgrade prompt on hover
- [ ] Page loads in <2s LCP on desktop, <3.5s on mobile
- [ ] Bottom mobile nav: /home · /inbox · /scans · /crew

**Dependencies:** Scan engine, agent system, Lead Attribution Loop (F12), Activity Ring, Rough.js

**Priority: MVP**

---

### Feature 6: /inbox — consent surface

**What it does:** 3-pane Linear-pattern review queue. Left rail: filters (by agent, source, priority). Center: item list with J/K keyboard navigation and multi-select. Right: content preview with sticky ActionBar (Approve `A` / Reject `X` / Request Changes `R`). Tabs: Pending (default) / Drafts / Live. Max-width: **1280px** (not 880px — corrects earlier design system error). Seal-draw animation fires on single-item approval (600ms, non-blocking). Empty state = "Inbox zero. Beamix is working." with Rough.js illustration.

**Bulk-approve (ships at MVP within single-client view):** Multi-select via shift-click + Cmd+A selects all visible items. "Approve N items" action button appears in center pane when items selected. Bulk-approve does NOT trigger Seal-draw animation (too frequent). Cross-client bulk-approve defers to MVP-1.5.

**Changes from v1:**
- Bulk-approve (Cmd+A + shift-click multi-select) ships at MVP within single-client view
- Max-width corrected to 1280px (was 880px in design system — that was an error)
- Cross-client bulk-approve explicitly deferred to MVP-1.5

**Acceptance criteria:**
- [ ] Max-width of /inbox is 1280px
- [ ] J/K keyboard navigation works through item list without mouse
- [ ] Shift-click selects a range of items. Cmd+A selects all visible items in current filter view.
- [ ] When items selected: "Approve N items" button appears in center pane header. Clicking approves all selected items that pass validator (items that would fail go to individual review in /inbox with reason).
- [ ] Bulk-approve does NOT trigger Seal-draw animation
- [ ] Seal-draw animation fires on individual approval (pen-stroke SVG, 600ms, non-blocking)
- [ ] Review-debt counter visible at top of inbox and echoed on /home
- [ ] Each item shows: agent name, action type, before/after diff (for content changes), Truth File references used, provenance envelope fields
- [ ] "Request Changes" opens a plain-text note field — agent re-runs with note as context
- [ ] Empty state: Rough.js hand-drawn illustration + "Inbox zero. Beamix is working."
- [ ] Cross-client bulk-approve (Cmd+A across all clients at once): NOT in MVP, explicitly deferred to MVP-1.5

**Dependencies:** Agent system, pre-publication validation (F4), Seal component, Rough.js

**Priority: MVP**

---

### Feature 7: MVP agent roster (6 agents ship at launch)

**Voice Canon Rule (all agents):** Agents are named on in-product surfaces (/home, /crew, /workspace, /inbox row attribution). "Beamix" is used on all external surfaces (emails, PDFs, Monthly Update permalinks, OG cards). Onboarding seal signs "— Beamix." Onboarding Step 3 brief-attribution sidebar uses "— Beamix." No agent names appear in emails or PDFs. This is Model B — non-negotiable.

---

#### Agent 1 — Schema Doctor (MVP)
Audits and repairs JSON-LD structured data (Organization, Product, FAQ, Service, BreadcrumbList). Generates `llms.txt` manifest. SaaS: generates SoftwareApplication schema. E-commerce: generates Product + Offer schema with pricing, availability, image attributes. Runs weekly or on schema change. Every change goes through /inbox for approval.

**Why MVP:** Schema is highest-leverage, lowest-risk intervention. Fully reversible. Customers see clear before/after.

#### Agent 2 — Citation Fixer (MVP)
Identifies 3–5 pages most likely to be cited by AI engines. Adds quotable-passage blocks (H2 + 2–3 self-contained sentences) optimized for citation grammar of ChatGPT, Perplexity, and Claude. Surgical additions only — not full-page rewrites. Every addition goes through /inbox.

**Why MVP:** Visible, dramatic before/after diff. Citation lift measurable in subsequent scans.

#### Agent 3 — FAQ Agent (MVP)
Generates 8–12 FAQ entries per customer based on vertical KG query patterns, Truth File, and multi-turn AI engine query analysis. Places FAQ as JSON-LD schema + visible H2+answer blocks. Generates voice-search variants (longer, conversational phrasing) as secondary output.

**Why MVP:** FAQ content is the highest-citation-probability content type across all 11 engines.

#### Agent 4 — Competitor Watch (MVP, gated at Build+ tier)
Monitors citation patterns of up to 5 competitors across all 11 engines. Surfaces: when a competitor gains share on a specific query cluster, why (retrieval-cluster analysis), and what customer can do about it. Competitor set pre-populated from vertical KG.

**Why MVP:** Highest-engagement agent. The competitive comparison is the emotional hook that converts free-to-paid and prevents churn.

**Gating:** Build ($189) and Scale ($499) only. Discover sees the feature name but it's locked with upgrade CTA.

#### Agent 5 — Trust File Auditor (MVP)
Runs weekly consistency checks: scans customer's domain, Google Business Profile (if connected), and AI engine citations for factual discrepancies. Surfaces conflicts ("your website says 24/7; ChatGPT says closes at 6pm — which is correct?"). Catches hallucinations. Prioritizes by severity. Runs silently; surfaces to /inbox only when discrepancy found.

**Why MVP:** Without this agent, Truth File goes stale. Stale Truth File = agents write corrections that are themselves incorrect.

#### Agent 6 — Reporter (MVP)
Generates Monday Digest (plain-text email, 5 bullets) and Monthly Update (cream-paper PDF + private-by-default permalink). Monthly Update opens with lead-attribution headline. Reporter runs on schedule and on-demand. External surfaces: signed "Beamix" — not agent names, not "your crew."

**Why MVP:** Reporter closes the renewal loop. Monday Digest is the product's weekly presence. Monthly Update is the forward-to-your-investor artifact.

---

**Agents deferred (not in MVP):**
- Brand Voice Guard — MVP-1.5 (standalone; runs as validation layer at MVP)
- Long-form Authority Builder — MVP-1.5
- Content Refresher — Year 1 (requires 90+ days of scan history)
- Trend Spotter — Year 1
- Citation Predictor — Year 1 (standalone ML model; rule-based confidence signal at MVP)
- Local SEO Specialist — Year 1
- Voice AI Optimizer, Visual/Multimodal Optimizer, Agent-Mediated Browsing Specialist, Reputation Defender, Industry KG Curator — Year 1 or later

---

### Feature 8: /workspace — agent execution viewer

**What it does:** Real-time agent execution view. Vertical step list with live status (pending / running / done / failed), streaming output per step, agent tool usage (which URLs fetched, which Truth File fields checked). Linked from /home activity feed when agent is active. Courier-flow animation in header during active runs. Transient but accessible as a past session from /scans.

**Real-time channel:** Supabase Realtime broadcast mode, one channel per customer (`agent:runs:{customer_id}`). Polling fallback at 10s if WebSocket connection fails.

**Tier access:** ALL tiers including Discover. Workspace is the "Beamix is alive" thesis. Gating it kills retention.

**Changes from v1:** Real-time channel implementation specified (Supabase Realtime broadcast + 10s polling fallback). Tier access confirmed for all tiers.

**Acceptance criteria:**
- [ ] /workspace accessible to all tiers including Discover
- [ ] Step list subscribes to `agent:runs:{customer_id}` Supabase Realtime channel. Falls back to 10s polling if connection fails.
- [ ] Each step shows: tool name, target URL or field, status, duration
- [ ] Courier-flow animation plays during active runs (pauses on completion)
- [ ] Customer can view past /workspace sessions (linked from /scans Completed Items)
- [ ] Failed runs show which step failed, why in plain English, and rollback action taken
- [ ] Agent name shown in /workspace header (in-product surface, Model B Voice Canon applies: agent names used)

**Priority: MVP**

---

### Feature 9: /scans — historical record

**What it does:** Stripe-table-style scan history. 3 tabs: All Scans / Completed Items / Per-Engine. Each row: scan date, trigger (scheduled/manual), score at scan time, engines covered, delta vs previous, attribution. 4 work-attribute lenses as filter pills: Done / Found / Researched / Changed (these are action-tags, not agent-attribution buckets — resolves audit §2.7). Row click expands to per-scan deep dive.

**Acceptance criteria:**
- [ ] All Scans tab: reverse-chronological, last 90 days default
- [ ] Completed Items tab: agent-completed actions with before/after state and "Rollback" button
- [ ] Per-Engine tab: per-engine score history as sparklines for all 11 engines
- [ ] 4 lens pills are action-tags (Done = action completed; Found = gap surfaced; Researched = analysis run; Changed = change approved and applied) — not agent-attribution labels
- [ ] "Share this scan" generates a public URL on demand (private by default) using nanoid21 format
- [ ] Each scan row links to the /workspace session for that scan (if available)

**Priority: MVP**

---

### Feature 10: /competitors — intelligence surface

**What it does:** Competitor citation dashboard. Table: competitor name, score, engine coverage, citation delta (7-day), trend arrow. Row click opens Rivalry Strip (dual-sparkline: customer blue, competitor gray, per-engine tabs, 12-week range). Competitor set pre-populated from vertical KG. Customer can add up to 5 custom competitors.

**Acceptance criteria:**
- [ ] Table shows up to 10 competitors (5 vertical-KG-pre-populated + up to 5 customer-added)
- [ ] Rivalry Strip opens as right-side panel on row click (not new page)
- [ ] Gated at Build ($189) and Scale ($499) — Discover sees competitor table with blurred Rivalry Strip and upgrade CTA
- [ ] Pre-populated competitors display "Beamix detected" badge
- [ ] Competitor delta column: +/- change in citation count over 7 days

**Priority: MVP (gated at Build+)**

---

### Feature 11: /crew — power-user customization

**What it does:** The 6 MVP agents displayed as a Stripe-style table (default rendering). Columns: Agent / State / This week / Last action / Success rate. Monogram column on left (16×16 Rough.js mark, color-keyed per agent). Row expands to per-agent settings: autonomy level, custom instructions (500-char plain text), schedule override, manual trigger, activity log (last 10 actions). First-person "what I do" blurb in row-expand (pasteable to Slack). 5 additional agents shown as "Coming soon Q3 2026" rows below the active 6 (lighter ink, no actions).

**Yearbook framing:** Retired from §1 prose and from the roster view entirely. Yearbook DNA preserved in ceremonial states only: (1) empty/first-load animation and (2) per-agent profile pages at `/crew/[agent-id]` (96px monogram hero, portrait layout, first-person narrative).

**Workflow Builder access:** Scale-tier only. Build customers who click `+ New Workflow` see a tier-upgrade modal showing 3 example workflows. Discover sees no workflow UI.

**Multi-client context:** When Yossi switches to a different client, /crew shows that client's agents with their autonomous state. Per-client autonomy presets (Always ask / Smart auto / Full auto) are independent per-client, per-agent.

**Changes from v1:**
- Default rendering changed from card grid to Stripe-style table (board lock #2)
- Yearbook framing removed from roster; preserved only in ceremonial states
- Workflow Builder access tier-gated to Scale only (board lock #7)
- 5 "Coming soon" locked rows below 6 active agents (not 12 future-tier-locked rows — the "coming soon" label is for not-yet-built; "locked" is for tier-gated)

**Acceptance criteria:**
- [ ] Default rendering is Stripe-style table with sortable columns: Agent / State / This week / Last action / Success rate
- [ ] Monogram column shows 16×16 Rough.js mark per agent (no AI-purple in chrome; Margin color applies only as a data surface in /workspace)
- [ ] Row-expand shows: autonomy level selector, custom instructions (500-char plain text), schedule override, manual trigger button, last 10 actions log, first-person "what I do" blurb (4 lines max)
- [ ] 6 active agent rows + 5 "Coming soon Q3 2026" rows below (lighter ink, no clickable actions)
- [ ] Per-agent autonomy level is independent from other agents and from global default
- [ ] Manual trigger button queues an immediate run (one run per agent per day limit)
- [ ] `/crew/[agent-id]` profile pages use portrait layout with 96px monogram hero and first-person narrative (yearbook DNA preserved here)
- [ ] Scale customers see `+ New Workflow` button linking to Workflow Builder (F19). Build customers see the button but clicking opens tier-upgrade modal with 3 example workflows. Discover customers see no workflow UI.
- [ ] /crew accessible from mobile bottom nav as the 4th item

**Priority: MVP**

---

### Feature 12: Lead Attribution Loop

**What it does:** Two-channel attribution system. (1) Twilio dynamic phone number: provisions a local number forwarding to customer's real number. Calls logged as AI-attributed leads. (2) UTM-tagged URL: `?utm_source=beamix&utm_medium=ai-search` generated for each customer; clicks logged. Step 2 of onboarding is vertical-aware — SaaS customers see UTM-first, e-commerce see Twilio-first. "Send setup instructions to your developer" button in Step 2 emails plaintext snippet (UTM tag + Twilio number). Verification check at 72h post-setup. 4–6 event-triggered emails fire on milestone attribution events.

**Honest copy at MVP:** Lead attribution claims in all copy read "calls + UTM-attributed clicks." The phrase "form submissions" does NOT appear in any customer-facing copy until the customer-site JS snippet ships at MVP-1.5.

**Event-triggered attribution emails (4–6 events, plain text, signed "— Beamix"):**
1. First UTM-attributed click (subject: "Beamix · a [role] found you on [engine]")
2. First AI-attributed signup (subject: "Beamix · your first attributed signup")
3. First competitor displaced (Competitor Watch surfaces that customer overtook a competitor on a query cluster)
4. Monthly attribution threshold crossed (e.g., "you hit 10 attributed sessions this month")
5. Optional: score crosses a milestone (30, 50, 75, 100)
6. Optional: first AI-attributed phone call (if Twilio enabled)

**Changes from v1:**
- Step 2 vertical-aware onboarding (SaaS UTM-first, e-comm Twilio-first)
- "Send to your developer" button + verification check ship at MVP
- Form submissions language removed from all copy until JS snippet ships MVP-1.5
- 4–6 event-triggered attribution emails specified (Marcus's "evangelism trigger")

**Acceptance criteria:**
- [ ] Twilio number provisioned within 2 minutes of customer enabling Lead Attribution
- [ ] UTM-tagged URL auto-generated and visible in /settings → Lead Attribution tab
- [ ] Step 2 onboarding shows UTM panel first for SaaS-classified customers, Twilio-first for e-commerce
- [ ] "Send to developer" button in Step 2 sends plaintext snippet to specified email address within 60 seconds
- [ ] 72-hour verification check: if neither Twilio number nor UTM tag detected on domain 72h post-setup, reminder email fires
- [ ] All customer-facing copy says "calls + UTM-attributed clicks" — not "form submissions"
- [ ] Event-triggered email fires within 5 minutes of trigger event for: first attributed click, first attributed signup, first competitor displaced
- [ ] Monday Digest includes "this week: N attributed calls/clicks" line when data is available
- [ ] Monthly Update PDF includes lead-attribution headline as document's opening line
- [ ] KPI card "Attributed Calls" in /home shows call count + delta vs previous month

**Dependencies:** Twilio, UTM tracking, Resend (event-triggered emails), Inngest (trigger functions)

**Priority: MVP**

---

### Feature 13: /settings

**What it does:** Settings with tabs. White-label config is **per-client, not per-account** — it lives in the multi-client switcher context (Yossi-tier Scale requirement). Each client has independent white-label config accessible when that client is active in the switcher.

**Tabs:**
- **Profile:** name, email, domain
- **Billing:** Paddle portal link, current tier, usage, top-up pack ($19/10 AI Runs)
- **Notifications:** email preferences, digest frequency, D0–D5 cadence opt-out
- **Business Facts (Truth File):** structured form editor with vertical-specific fields only (no `hours`/`service_area` for SaaS accounts)
- **Lead Attribution:** Twilio number, UTM URL, attribution settings, verification status
- **Brief:** view + edit current Brief, re-generate option
- **Phone numbers:** Twilio numbers across all active clients (Scale) or current client
- **Per-client white-label (Scale only):** appears in client-switcher context. Per-client fields: agency logo upload, primary brand color, email signature name, "Powered by Beamix" footer toggle (default ON). Cream paper persists across all white-label.

**Changes from v1:**
- White-label config is per-client, not per-account
- Brief tab added (view + edit current Brief)
- Phone numbers tab added
- Per-client white-label tab location clarified (in multi-client switcher context, not top-level account settings)

**Acceptance criteria:**
- [ ] Per-client white-label config accessible from client-switcher context, not from top-level /settings. Each client has independent: agency logo, brand color, email signature name, "Powered by Beamix" footer on/off.
- [ ] "Powered by Beamix" footer toggleable per-client (default ON). Scale-only.
- [ ] Truth File editor in Business Facts shows only vertical-appropriate fields (SaaS: no hours/service area shown)
- [ ] Brief tab shows current Brief text + chip editors for re-editing + "Regenerate Brief" button
- [ ] Billing tab links to Paddle customer portal
- [ ] Cancel flow: one click, no dark patterns, no "are you sure?" loops. Confirmation page: plain-English summary of what will happen (data retained 30 days, export available, agents paused).
- [ ] Notification settings include: Monday Digest opt-out, scan completion emails on/off, /inbox new items on/off, Day 2/4/5 cadence emails on/off

**Priority: MVP**

---

### Feature 14: Email infrastructure

**What it does:** Three categories of email, plus the Day 1-6 silence cadence.

**Day 1-6 silence cadence (4 emails, plain-text, signed "— Beamix"):**
- **Day 0 T+10min — Welcome:** "Beamix is working — here's what to expect Monday." 2 sentences. Sets expectations, tells customer NOT to come back before Monday.
- **Day 2 — First finding:** Fires when first /inbox item is created. "Beamix found something — your first review is ready." 4 lines + /inbox link. Only fires if customer has NOT logged into product that day.
- **Day 4 — Review-debt nudge:** "You have N items waiting in /inbox. Approving them takes ~90 seconds." **Skip Saturday and Sunday — if Day 4 falls on Saturday or Sunday, send on the next business day (Monday).** Only fires if customer has NOT logged into product that day.
- **Day 5 — Pre-Monday teaser:** "Tomorrow's Digest: score up N. Beamix shipped N changes this week." Only fires if Day 4 email was not opened AND customer has NOT logged in that day. Skip if Day 5 is Sunday.

**Suppression rule:** Suppress any Day 1-6 cadence email if customer logged into product on that calendar day.

All Day 1-6 emails are default-ON for weeks 1–4 of a new account. After week 4: opt-in. Customer can configure in /settings → Notifications.

**Recurring email types:**
- **Monday Digest:** plain-text (no HTML template), 5–6 bullets, sent Monday 8am customer-local time. Subject format: "Beamix · [date range]: [top metric]." Signed "— Beamix." 6-sentence maximum on body. Geist Mono `Mon ·`, `Tue ·` prefix on action bullets creates terminal-DX feel.
- **Event-triggered emails (attribution milestones):** See F12 for specification.
- **Monthly Update delivery email:** short plain-text with PDF attached + /reports permalink link. PDF attached regardless of permalink privacy state.

**Monthly Update PDF (cream-paper, private permalink):** Renders in cream-paper aesthetic (`#F7F2E8`), Fraunces accent, lead-attribution headline as opening line. Page 1: cover with 64px Fraunces business name + pull-quote ("This month, one developer asked Claude where to find [product], found you, and signed up."). Pages 2+: attribution table (Geist Mono numbers), score trajectory sparkline with annotations, action narrative, forward-look, Beamix wax seal closing. Signed "— Beamix." White-label exception for Scale: signature becomes agency name if white-label is configured for that client.

**White-label email rule:** When Scale white-label is active for a client, "Beamix" in email signatures is replaced by the agency name. "Powered by Beamix" footer appears in Geist Mono 9pt at `--color-ink-4` unless toggled OFF in per-client config. This is the only override to Voice Canon Model B.

**Changes from v1:**
- Day 1-6 cadence fully specified (4 emails with exact trigger conditions)
- Saturday/Sunday weekend-skip rule added to Day 4 (Marcus's feedback)
- Suppression rule: any email skipped if customer logged into product that day
- Default-on weeks 1-4, opt-in after
- 4–6 event-triggered attribution emails added (Marcus's "evangelism trigger" — moved from F12 for specification clarity, cross-referenced there)
- Monthly Update pull-quote spec added
- White-label email rule explicitly stated

**Acceptance criteria:**
- [ ] Day 0 T+10min welcome email fires within 15 minutes of onboarding completion
- [ ] Day 2 email fires only when first /inbox item is created AND customer has not logged in that day
- [ ] Day 4 email: if calendar day is Saturday or Sunday, email is sent on next Monday morning instead. Only fires if customer has not logged in that day.
- [ ] Day 5 email: only fires if Day 4 email not opened AND customer has not logged in that day. Skip if Day 5 is Sunday.
- [ ] Monday Digest delivers plain text (no HTML template). Subject format: "Beamix · [date range]: [top metric]"
- [ ] Monthly Update PDF attachment included in delivery email regardless of permalink privacy
- [ ] Permalink in delivery email resolves to private route (auth required) unless customer has explicitly made it public
- [ ] Event-triggered attribution emails fire within 5 minutes of trigger event
- [ ] All emails signed "Beamix" (Voice Canon Model B). White-label Scale exception: agency name replaces "Beamix" in signature.
- [ ] "Powered by Beamix" Geist Mono 9pt footer in white-label emails (default ON, toggleable per-client)
- [ ] All emails include one-click unsubscribe (CAN-SPAM compliance)
- [ ] Day 1-6 cadence default-ON for weeks 1–4. Opt-in after week 4.
- [ ] Customer can configure Day 2/4/5 emails in /settings → Notifications

**Priority: MVP**

---

### Feature 15: 11 text AI engine coverage

**What it does:** Scan infrastructure covering all 11 text AI engines. Tier-gated display: Discover customers see 3 engines on /home. Build/Scale see all 11. The 3 locked Discover engines (recommended: ChatGPT, Perplexity, Google AI Overviews — highest reach + clearest citation patterns — confirm as final lock before launch copy) are the entry point; the upgrade to Build unlocks 8 more engines.

**Scan schedule:**
- Real-time engines (Perplexity, Grok, AI Overviews): daily
- Crawl-based engines (ChatGPT default, Claude, Gemini app): weekly
- Remaining engines: weekly

**Changes from v1:** Discover tier engine list recommended as ChatGPT, Perplexity, Google AI Overviews (see Open Product Questions Q4 for final lock confirmation).

**Acceptance criteria:**
- [ ] All 11 engines return citation data within 24 hours of scan trigger
- [ ] Scan failures retried automatically within 2 hours. Customer only notified if all 3 retries fail.
- [ ] Citation envelope minimum fields: surface, query, brand_mentions (position + sentiment), competitor_mentions (brand + position), is_mentioned (boolean), citation_context (sentence)
- [ ] Per-engine score (0–100) calculated and displayed in /home per-engine strip
- [ ] Discover tier /home per-engine strip shows 3 engines (recommended: ChatGPT, Perplexity, Google AI Overviews). Remaining 8 shown as locked/grayed with upgrade CTA.
- [ ] Cost ceiling instrumentation per-account (per-customer monthly scan-cost ledger + alarm) — required at MVP

**Priority: MVP**

---

### Feature 16: 2 vertical knowledge graphs (SaaS + e-commerce)

**What it does:** Platform-level datasets for Boutique B2B SaaS and E-Commerce SMB. Each graph: top 500 queries, retrieval-cluster map per query cluster, top-cited content shapes, vertical-specific Truth File schema (covered in F3), vertical-specific competitor universe, vertical-specific Brief template, vertical-specific agent specializations.

**Acceptance criteria:**
- [ ] Domain detection classifies signups into SaaS or e-commerce with ≥80% accuracy. Fallback: onboarding Step 1 combobox.
- [ ] Competitor set pre-populated with 5 domain-specific competitors from vertical KG on first scan
- [ ] Brief template uses vertical-appropriate language (SaaS: "integrations, target company size, ICP"; e-commerce: "product categories, shipping, return policy")
- [ ] FAQ Agent generates vertical-specific questions (SaaS: "what integrations does X support?"; e-commerce: "does X ship internationally?")
- [ ] Schema Doctor emits correct schema type (SaaS: SoftwareApplication; e-commerce: Product + Offer)

**Priority: MVP**

---

### Feature 17: Marketplace (re-spec without rewards)

**What it does:** Browsable catalog of Beamix-curated agent workflows. No reward system — leaderboards, $50K grant pool, top-10 rev-share boost, and Hall of Fame are all removed entirely. Marketplace ships with: browse grid + install Beamix-curated workflows + install counts + star ratings as visible signals.

**Tier-gating:**
- **Discover ($79):** Browse catalog read-only. "Install — Build plan or higher" CTA on all install buttons. Discover customers see the full catalog as a window into what's possible — this is the upgrade trigger.
- **Build ($189):** Full browse + install up to 3 workflows at one time.
- **Scale ($499):** Unlimited installs + Workflow Builder (F19) + workflow publishing (MVP-1.5 after cross-tenant Truth File binding ships and gets 4 weeks of telemetry).

**Workflow publishing by Scale users defers to MVP-1.5.** At MVP: browse + install Beamix-curated workflows only.

**Discovery (editorial, not algorithmic):** Default sort is editorial curation keyed to signed-in customer's vertical (SaaS customer sees SaaS-relevant listings first; e-commerce first for e-commerce). Available sort options: Most installed (30 days) / Highest rated / Newest.

**Spotlight strip:** Editorial rotation — not Most-Improvement winner. Rotates between: (a) featured workflow template, (b) vertically relevant agent, (c) new listing announcement. Beamix controls editorial calendar.

**T&S review pipeline (4-stage) remains intact.** Review is safety-and-quality function, not reward-contingent. Stage 1: automated checks (<60s). Stage 2: sandbox dynamic test against 3 reference customer fixtures (5–15min). Stage 3: Beamix human review (1–3 business days). Stage 4: listing publication with "Reviewed by Beamix" badge.

**Changes from v1:** Entire rewards system removed (leaderboards, $50K grant pool, top-10 rev-share boost, Hall of Fame, "Power User" badge after 30 days, reward badges on cards). Discover changed from "no install CTA" to explicit "Install — Build plan or higher" upgrade CTA. Workflow publishing explicitly deferred to MVP-1.5.

**Acceptance criteria:**
- [ ] Marketplace page (accessible from /crew "Browse more" CTA) shows at least 4 Beamix-authored workflows at launch
- [ ] Discover tier: full catalog visible, all install buttons show "Install — Build plan or higher" CTA that opens upgrade modal
- [ ] Build tier: install up to 3 workflows. Installed workflow appears in /crew within 5 seconds.
- [ ] Scale tier: unlimited installs
- [ ] Install count badge on each card (factual metric, not a reward)
- [ ] Star rating on each card (customer satisfaction metric, not a reward)
- [ ] Spotlight strip is editorial (not algorithmic)
- [ ] No leaderboards, no rev-share references, no grant references, no Hall of Fame, no "Power User" badges in any marketplace surface
- [ ] Workflow publishing by Scale users: NOT available at MVP. Publishing UI defers to MVP-1.5 (cross-tenant Truth File binding ships first, 4-week telemetry minimum).
- [ ] External launch communications: "library of expert workflows" (not "ecosystem," not "platform" — overpromising)

**Priority: MVP (constrained — browse + install only)**

---

### Feature 18: Incident runbook + rollback + Truth File integrity job

**What it does:** Automated rollback capability for every agent action. Every published change stores a revert payload. Customer one-click rollback from /scans → Completed Items. Internal incident runbook with severity levels, escalation paths, and SLA. **Truth File integrity-hash nightly job** (new in v2): nightly comparison of TF hash vs previous-day hash. >50% field-loss in 24h → Sev-1 alert + auto-pause-all-agents for that customer.

**Why MVP:** The Trust Architecture is non-negotiable before launch. The Truth File integrity tripwire closes Scenario C (the 6-7 day detection gap identified in board round 2).

**Changes from v1:** Truth File integrity-hash nightly job added. Sev-1 alert and auto-pause-all-agents on >50% field loss. Auto-pause-all-agents is new.

**Acceptance criteria:**
- [ ] Every agent-published action stores a revert payload at creation time
- [ ] Customer can rollback any action from /scans → Completed Items with a single "Rollback" button
- [ ] Rollback completes within 60 seconds for content changes; within 5 minutes for schema changes
- [ ] Rollback confirmation email sent to customer automatically (signed "Beamix")
- [ ] Internal incident runbook written pre-launch covering: severity classification (cosmetic / significant / data-loss / compliance), escalation path, SLA per severity, comms templates per severity
- [ ] **Truth File integrity-hash nightly job:** every TF write computes SHA-256 hash stored alongside TF. Nightly job compares current hash vs previous-day hash. If >50% of TF fields were lost/changed in a single 24h window: Sev-1 alert fires → all agents for that customer auto-paused → /inbox banner for customer: "We detected an unexpected change to your Business Facts. Agents are paused for your protection. Review your Business Facts to resume." + email notification.
- [ ] Incident runbook includes Scenario C (Truth File corruption) with PITR restoration path and per-action rollback sequence
- [ ] Kill switch admin tool: one-click suspension of all installs of any marketplace workflow across all customers. Propagates within 60 seconds.

**Priority: MVP (pre-launch requirement)**

---

### Feature 19: Workflow Builder (NEW — promoted from Year 1)

**What it does:** Visual DAG editor built on React Flow. Tier-gated to Scale ($499) only for building and editing. Build-tier customers see a "viewer + template preview" modal when they click `+ New Workflow`. Discover sees no workflow UI.

**Scope at MVP Day 1:**
- React Flow DAG editor — full canvas with pan, zoom, minimap (clinical canvas treatment — NOT Rough.js; Rough.js is reserved for hand-crafted accent moments)
- 3–6 Beamix-authored workflow templates preloaded as starters (Daily monitoring, Weekly digest with custom report, Monthly client review)
- **Trigger types at MVP:** Schedule (cron-like UI) + Manual trigger only
- **Action nodes at MVP:** Run agent (any of 6 MVP agents), Notify (Email + Slack), Conditional branch (If/Else), Wait for condition
- **Dry-run mode:** Real LLM execution with `dry_run: true` flag on the proposal envelope. No mock-site sandbox. Output renders as preview in /workspace; nothing writes to customer's CMS. This is the Architect's elegant solution — saves ~3 weeks vs mock-site sandbox.
- Per-step "Test this step" button — critical for Scale users debugging per-client workflows without risking live data
- Brief grounding visible per node (node inspector shows relevant Truth File fields + Brief excerpt in Fraunces 300 on cream)
- Validation on every save: cycle detection, orphan node detection, cost estimate per run
- Linear versioning: each save creates a new version. Up to 20 versions retained at MVP.
- Resource conflict detection: two write-scope agents on overlapping URL paths in one execution caught at save time

**Deferred to MVP-1.5:**
- Event triggers: `competitor.published`, `score-change`, external webhook, Truth File/Brief change trigger, API-call trigger
- Workflow publishing to marketplace (cross-tenant Truth File binding ships first, 4 weeks of production telemetry minimum)
- Loop node (iterate over competitors[] or clients[])
- Run sub-workflow (child workflow execution)
- Cross-agent composition at workflow level

**Deferred to Year 1:**
- Full event-trigger library (custom webhooks, Beamix CRM-event triggers)
- Workflow Template Marketplace as separate catalog surface
- Visual workflow analytics (per-node success rate, credit cost over time)
- Workflow collaboration (multi-user editing)
- Python SDK for code-first workflow authoring

**Agency-operator node (first-class):** "Agency review gate" — pauses execution until Scale account owner approves in Slack/Inbox/email. Primary use case: Yossi's "route diff to me, not my client, before pushing." This template promoted to first-class node type, surfaced under "Agency operator templates" in workflow template library.

**Why MVP (promoted from Year 1):** Workflow Builder is what makes Scale worth $499/month for Yossi. Viewer-only at MVP is a stub — Yossi cannot author per-client automation packs from a read-only template runner. React Flow as canvas primitive makes this achievable at quality. Schedule triggers + dry-run + 3 templates delivers Yossi's core use case without the engineering complexity of event triggers.

**Acceptance criteria:**
- [ ] React Flow DAG editor ships for Scale-tier users at MVP
- [ ] Trigger types available at MVP: Schedule (cron UI) and Manual only. No event triggers.
- [ ] Dry-run mode: `dry_run: true` flag on proposal envelope. Renders output as preview in /workspace. Nothing writes to customer CMS. Same real LLM execution as production.
- [ ] Per-step "Test this step" button triggers dry-run of that node in isolation
- [ ] 3 Beamix-authored templates available in template picker on `+ New Workflow`
- [ ] Brief grounding visible in node inspector: relevant Truth File fields + Brief excerpt in Fraunces 300 on cream panel
- [ ] Cycle detection, orphan node detection, cost estimate shown on every save before committing
- [ ] Resource conflict detection: two write-scope agents on overlapping URL paths caught at save time, shown as inline warning
- [ ] Linear versioning: "Save" creates new version. Version dropdown shows last 20. Version names are auto-generated timestamps.
- [ ] "Agency review gate" node type available in node palette (Scale only)
- [ ] Build-tier customers who click `+ New Workflow` see a tier-upgrade modal showing 3 example workflows with descriptions. No editor visible.
- [ ] Discover-tier customers see no workflow UI anywhere in /crew
- [ ] Workflow execution uses Inngest free-tier infrastructure. MVP agent workflows must fit inside Inngest free-tier wall-clock. Any workflow estimated to exceed free-tier limits surfaced as a warning to user at save time.

**Priority: MVP (Scale-only)**

---

### Feature 20: /security public page (NEW)

**What it does:** A Stripe-style 6-minute-readable public security and privacy page at `beamix.tech/security` (or `/trust`). The goal is to pass CTO review (the "Aria buyer gate") without requiring a sales call. Marcus's CTO Aria will read this before month 3. Without it, the Build → Scale upgrade for B2B SaaS founders doesn't happen.

**Coverage sections (readable prose, not only bullets):**

1. **Data storage and region:** US-East default at MVP. Standard Contractual Clauses (SCCs) in DPA for non-US customers. EU region (separate Supabase project) ships at MVP-1.5. All data AES-256 at rest (Supabase default). TLS in transit.

2. **Data retention policy:** Account data retained lifetime + 30 days post-cancel. Scan results: 90 days hot, 2 years cold. Provenance log: 7 years (append-only, immutable S3 bucket). Audit log: 7 years (GDPR + EU AI Act windows). Truth File and Brief: deleted 60 days post-cancel (hard delete, not soft).

3. **DSAR and data subject rights (Article 15/17/20/33):**
   - Article 15 (Access): /settings → Privacy → "Export my data." Target 7-day delivery, 30-day SLA maximum. Delivered as signed S3 URL.
   - Article 17 (Erasure): Hard delete within 30 days of request. Audit log retains hashed pointers (legitimate-interest carve-out, disclosed in DPA).
   - Article 20 (Portability): Export format JSON Schema-conformant (anti-lock-in by design).
   - Article 33 (Breach notification): Affected customers notified within 72 hours of breach confirmation.

4. **Encryption posture:** AES-256 at rest, TLS 1.2/1.3 in transit. Customer Truth File and Brief accessed only by customer session, agent runtime (sandboxed, signed envelopes), and on-call engineers via break-glass MFA-auth (audit-logged).

5. **Audit logs:** Immutable, 7-year retention. Append-only Postgres (partitioned monthly) replicated to S3 (hourly). No UPDATE/DELETE for app role. Admin access via MFA only. Customers can DSAR-export their own log.

6. **No training on customer content:** Explicit DPA clause: Beamix does not use Truth File content, Brief content, scan results, or agent outputs for training general LLM models. Customer content processed only for the customer's own service.

7. **Twilio call recordings:** Not stored at MVP. Metadata only (caller number, duration, timestamp). Recordings stay in Twilio 30 days, then deleted. Customer's obligation to callers (two-party-consent states) is their own.

8. **Sub-processors list:** Supabase (DB + Auth), Twilio (phone attribution), Paddle (billing — merchant of record), Resend (email), Anthropic (Claude API), OpenAI (GPT API), Google (Gemini API), Perplexity (Sonar API). Maintained at this URL.

9. **Security disclosure contact:** security@beamix.tech (or dedicated form). Response SLA: 72 hours for triage.

10. **In-progress certifications:** SOC 2 Type II target Year 1 Q4. GDPR Article 44 compliance (EU region) at MVP-1.5.

**Why MVP:** This is not a polish item — it is the "Aria buyer gate" for every B2B SaaS sale. Marcus's CTO will read it before month 3. Without it, the Build → Scale upgrade fails for the entire B2B SaaS cohort. It is also trivial to build relative to its sales value (technical-writer + 3 person-days).

**Acceptance criteria:**
- [ ] /security (or /trust) page live at beamix.tech at MVP launch — not a redirect to a PDF, a real page
- [ ] Page is readable in 6 minutes at normal pace (target: 900–1200 words)
- [ ] All 10 sections above have at least a paragraph of plain prose — not only bullets
- [ ] Sub-processors list maintained and linked from the page
- [ ] GDPR DSAR endpoints documented with SLA
- [ ] No-training-on-customer-content statement is explicit and prominent
- [ ] Twilio recording posture explicitly stated
- [ ] Contact for security disclosures (email or form) present with response SLA
- [ ] Page is indexed (`noindex` NOT applied to /security)
- [ ] Page linked from product footer, pricing page, and onboarding Terms acknowledgment

**Priority: MVP (3 person-days)**

---

### Feature 21: Scale-tier DPA + agency indemnification clause (NEW)

**What it does:** A Data Processing Agreement (DPA) for Scale-tier customers that includes mutual indemnification: Beamix indemnifies the Scale-tier agency customer for content/factual errors that pass Beamix's pre-publication validation. Cap at the lesser of (3× monthly subscription) or ($25,000/incident). Legal advisor and business-lead draft contract terms before MVP ships.

**Why MVP:** Yossi's churn-line. "My client sues ME, not Beamix. Without explicit indemnification in the Scale-tier DPA, I'm carrying agency-liability tax I can't price into my retainer." Without this clause, Scale tier is not worth $499/month to the agency archetype — and agencies are the highest-LTV customers.

**Scope of indemnification:**
- Covers: factual content errors that passed Beamix's pre-publication validator (claim verification + Brand Voice Fingerprint + prohibited-term check + vertical-specific rules + sensitive-topic classifier all cleared)
- Does NOT cover: errors in customer's own Truth File that the customer entered incorrectly; content the customer edited after validation; content the customer approved against Beamix's validator recommendation; errors in areas where customer explicitly disabled validator rules

**Acceptance criteria:**
- [ ] Scale-tier DPA document drafted by legal advisor before MVP launch
- [ ] Indemnification clause present with explicit cap: lesser of (3× monthly subscription fee) or ($25,000/incident)
- [ ] Scope of indemnification explicitly defined: covers errors that passed pre-publication validation, not customer-authored errors
- [ ] DPA signed as part of Scale-tier checkout flow (Paddle checkout includes DPA acceptance step for Scale tier)
- [ ] DPA accessible from /settings → Billing and from /security page
- [ ] Tech E&O insurance bound before launch — minimum $1M/$1M covering the indemnification clause exposure

**Priority: MVP (legal advisor task — must complete before Scale tier is purchasable)**

---

## 3. User Stories

### Critical path 1: First-time visitor → /scan public → signup

**Story 1.1:** As a B2B SaaS founder who just saw a competitor's scan result on X/Twitter, I want to scan my own domain immediately so that I can see whether my product appears in ChatGPT and Claude before my developer customers do.

**Acceptance criteria:**
- Given I visit /scan, when I enter my domain and click Scan, then I see a score and citation breakdown within 20 seconds on cream paper
- Given the scan completes showing my competitor in 7 engines and me in 2, when I read the tier picker below results, then I see "Discover ($79) · 3 engines" vs "Build ($189) · 6 engines + Competitor Watch" — the differentiation is immediate
- Given I click "Start free" on Build, when I complete Paddle checkout, then my scan data is pre-loaded into my dashboard via `?scan_id=` — no redundant scan

**Edge case:** Score is 0. UI shows "Starting from zero is normal — here's what Beamix does in the first 30 days" with a specific 30-day action plan. Not a failure state.

---

**Story 1.2:** As an e-commerce operator who sells supplements, I want the scan to show me my competitive gap without using technical jargon so that I understand the problem before deciding to pay.

**Acceptance criteria:**
- Given the scan completes, when I view above-the-fold results, then no technical jargon appears (no "schema," no "GEO," no "citation envelope")
- Given I see a competitor listed, when I hover their name, then a tooltip says "This brand appears in X AI engines when someone searches for [supplement category]"
- Given I see the 3 gaps, then each has plain-English framing ("AI engines can't see your pricing — add it and you'll appear in 3 more engines")

---

### Critical path 2: Signup → onboarding → Brief approval → first agent run

**Story 2.1:** As a B2B SaaS founder completing Paddle checkout, I want Step 2 to show me UTM tracking (not phone numbers) so that Beamix feels built for my type of business from the first minute.

**Acceptance criteria:**
- Given my domain was classified as B2B SaaS, when I reach Step 2 of onboarding, then the UTM panel is prominently featured and the phone number section is collapsed under "Also: track phone calls"
- Given I see the UTM URL, when I click "Send to developer," then I enter my developer's email and they receive a plaintext snippet within 60 seconds
- Given 72 hours have passed, when neither UTM nor Twilio is detected on my domain, then I receive a plain-text reminder email with verification steps

---

**Story 2.2:** As a new customer worried about agents touching my website, I want to understand what will never happen without my approval before anything runs.

**Acceptance criteria:**
- Given I am in Step 3 Brief approval, when I click "What will Beamix change?", then a single-screen overlay shows: "Beamix will NEVER publish anything to your website without your approval in /inbox. Everything goes there first."
- Given I complete onboarding, when the first agent run completes, then my first /inbox item shows a full preview before anything is published — including which Truth File fields were referenced
- Given the seal draws on "— Beamix," when I see it, then the animation fires exactly once, taking 800ms, and I am taken to /home showing "Beamix is working"

---

### Critical path 3: Marcus's weekly use (open /home → see lead attribution → close tab)

**Story 3.1:** As a 30-person company founder with 6 minutes per week for Beamix, I want the /home page to show me the one thing that matters this week so that I can close the tab and move on.

**Acceptance criteria:**
- Given I open /home on a Monday, when the page loads, then the most important item is first (lead-attribution headline if data is available, score change otherwise — never a nav menu or empty state)
- Given my score improved 6 points this week, when I see the delta, then I also see which agent action caused it (linked to the /inbox completed item)
- Given I have zero pending /inbox items, when I load /home, then Inbox pointer line says "Nothing needs your attention" (not a number)

---

**Story 3.2:** As a B2B SaaS founder at Day 14, I want to receive a "first attributed click" email so that I know the lead attribution loop has closed.

**Acceptance criteria:**
- Given a developer clicked my UTM link after an AI search, when the event fires, then I receive a plain-text email within 5 minutes. Subject: "Beamix · a developer found you on [engine]"
- Given I read the email, when I see the session detail ("landed on /docs/getting-started, 4:12 session"), then I can forward it to my CTO as proof the attribution loop works
- Given the email is plain text, when I receive it on my phone at 2:47pm, then it reads like an operator-grade signal — not a marketing email

---

### Critical path 4: Yossi's daily routine (12 clients, Scale tier)

**Story 4.1:** As a digital agency owner managing 12 clients, I want bulk-approve in /inbox so that my morning review sweep takes 20 minutes instead of 84 minutes.

**Acceptance criteria:**
- Given I am in client Halevi Plumbing's /inbox with 14 pending items, when I press Cmd+A, then all 14 items are selected and an "Approve 14 items" button appears
- Given I click "Approve 14 items," when items are processed, then items that pass validator at ≥0.9 confidence are approved immediately; items that fail are returned to /inbox with failure reason. No Seal-draw animation fires.
- Given the sweep is complete, when I switch to the next client via the client switcher, then I see that client's /inbox with its own count — independent queue

---

**Story 4.2:** As a Scale-tier agency owner, I want per-client white-label config so that TechCorp's Monthly Update shows my agency logo and their brand color, while Halevi Plumbing's shows a different config.

**Acceptance criteria:**
- Given I switch to TechCorp in the client switcher, when I navigate to the white-label tab, then I see TechCorp-specific config: agency logo upload, primary brand color (#1A4DBE in this case), email signature name, "Powered by Beamix" footer toggle
- Given I configure TechCorp's white-label, when Reporter generates the Monthly Update, then the PDF shows my agency logo + TechCorp's brand color + "Powered by Beamix" footer in Geist Mono 9pt — NOT "Beamix" as the signer
- Given I switch to Halevi Plumbing, when I check white-label config, then it has completely independent settings from TechCorp — changing one does not affect the other

---

### Critical path 5: The renewal moment

**Story 5.1:** As a customer at month 3, I want a Monthly Update I can forward to my co-founder or investor so that Beamix justifies itself without me having to explain it.

**Acceptance criteria:**
- Given it is the first Monday of the month, when the Monthly Update email arrives, then the first visible line is the lead-attribution headline ("In [month], 9 AI-attributed sessions — up from 0 last month")
- Given I open the PDF, when I see page 1, then there is a pull-quote in 64px Fraunces that captures a specific attribution event in one sentence — the sentence I would forward to my board
- Given I want to share the report, when I click "Generate share link" in /reports, then I get a private unguessable URL (`beamix.tech/r/{nanoid21}`) with optional 30-day expiry — the action feels deliberate, not automatic

---

### Critical path 6: The first incident (agent error → rollback)

**Story 6.1:** As a customer whose agent published incorrect information, I want to undo the change immediately so that my website is not showing wrong data to AI engines.

**Acceptance criteria:**
- Given an agent published a change I realize was wrong, when I navigate to /scans → Completed Items, then I see a "Rollback" button next to the action
- Given I click Rollback, when it processes, then the change is reverted within 60 seconds and I receive a rollback confirmation email
- Given the rollback completes, when I check /home, then activity feed shows "Beamix rolled back [action] at [time]" — not silent
- Given my Truth File was corrupted (>50% field loss in 24h), when the nightly integrity job runs, then I receive a Sev-1 alert, all agents are paused, and /inbox shows "We detected an unexpected change to your Business Facts. Agents are paused for your protection."

---

### Critical path 7: Marcus's CTO (the hidden buyer)

**Story 7.1:** As a CTO co-founder who my CEO just told "check out this Beamix security page before we renew," I want to read a plain-prose security posture document in 6 minutes so that I can say "ok" to the renewal without asking for a vendor security questionnaire.

**Acceptance criteria:**
- Given I navigate to beamix.tech/security, when the page loads, then I see a 6-minute-readable document (not a PDF download, not a gated form)
- Given I read the DSAR section, when I look for GDPR Article 15/17/20/33 endpoints, then they are all present with SLA and delivery format
- Given I read the no-training clause, when I find it, then it says explicitly "Beamix does not use your Truth File, Brief, scan results, or agent outputs to train general AI models"
- Given I read the audit log section, when I see the retention spec, then it says "7-year immutable retention" — and I understand I could reconstruct every agent action if I needed to

---

## 4. Success Metrics

### Framework

Beamix's core thesis: customers who see attributed leads renew; customers who don't, churn. Every metric traces back to that thesis.

---

### Activation metrics (Day 0 – Day 7)

**Onboarding completion rate**
Target: ≥65% of signups complete all 4 onboarding steps (including Brief approval) within 24 hours.
Measured: `onboarding_completed_at` vs `created_at`.

**Time to first evidence**
Target: <90 seconds from onboarding completion to first visible Beamix action in /home activity feed (first scan result or first /inbox item).
Why: Customers who see first evidence in session 1 have 2× higher 30-day retention.

**First scan completion rate**
Target: ≥90% of signups who complete onboarding see a completed scan within 2 hours.
Why 90%: this is a system reliability floor, not a product target.

**Day 2 email open rate**
Target: ≥55% open rate on the Day 2 "first finding" email (triggered email to a warm, just-onboarded customer — should outperform typical SaaS promotional email).

---

### Engagement metrics (Day 7 – Day 30)

**Monday Digest open rate**
Target: ≥40% on weeks 2–8.
Benchmark: average SaaS transactional email open rate 20–30%. 40% is achievable because the Monday Digest is plain-text and content-specific.

**Weekly active rate**
Target: ≥50% of customers visit /home at least once per week in weeks 2–8.

**/inbox approval rate**
Target: ≥60% of /inbox items approved (not rejected or ignored) within 7 days of creation.

**Review-debt two-axis threshold (amber/red):**
- **Amber:** 3 pending items AND 1–4 days since oldest item was created
- **Red:** 5 pending items AND >5 days since oldest item was created
These thresholds drive visual state of review-debt counter on /home and /inbox.

---

### Retention metrics (Day 30 – Day 90)

**Lead Attribution loop closure rate**
Target: ≥40% of Build and Scale customers receive at least 1 Twilio-attributed call or UTM-attributed session within their first 30 days.
This is the most important early metric. Customers who close the attribution loop have dramatically higher renewal rates.

**Monthly Update forward rate**
Target: ≥15% of Monthly Update recipients click "forward this," download the PDF, or generate a share link within 7 days of delivery.
A customer who forwards the Monthly Update is 3× less likely to cancel in the following 30 days.

**Net Revenue Retention at 90 days**
Target: ≥90% NRR.
Breakdown: ≤10% churn + ≥5% expansion (Discover → Build upgrades offsetting some churn).
Below 90% NRR at 90 days = product-market fit problem or onboarding failure.

**Free-to-paid conversion from /scan public**
Target: ≥8% of public scan completions convert to a paid plan within 14 days.

---

### Growth metrics (Day 90 – Day 180)

**Marketplace workflow installs per customer at 90 days**
Target: ≥25% of Build+ customers have installed at least 1 Marketplace workflow by day 90.

**Scan public shares**
Target: ≥5% of public scan completions result in a share URL generated within 7 days of signup.

**Scale-tier activation rate (Workflow Builder)**
Target: ≥30% of Scale customers create at least 1 workflow in Workflow Builder within their first 60 days.
Why: Workflow Builder is the stated reason to upgrade to Scale. If it's not being used, Scale retention is at risk.

---

### North star metric

**Lead Attribution Loop closure rate at 30 days.** A customer who can say "Beamix got me a call last week" tells someone else. This is the metric the CEO reviews weekly.

---

## 5. Out of Scope for MVP

The following are explicitly deferred. Do not build, do not design, do not ship.

### Workflow features deferred to MVP-1.5

- **Event triggers** in Workflow Builder: `competitor.published`, `score-change`, external webhook, Truth File/Brief change trigger, API-call trigger
- **Workflow publishing to marketplace** by Scale users (cross-tenant Truth File binding ships first, 4-week telemetry minimum before publishing opens)
- **Loop node** (iterate over competitors[] or clients[]) in Workflow Builder
- **Run sub-workflow** (child workflow execution)
- **WordPress plugin** for L2 site integration (manual paste + GitHub PR mode ships at MVP; plugin builds in parallel)
- **Shopify App / API integration** (e-commerce Schema Doctor uses Truth File at MVP; Shopify catalog pull is MVP-1.5)
- **Cross-client bulk-approve** in /inbox (within-client bulk-approve ships; cross-client defers)
- **Customer-site JS snippet** for form attribution (form submissions deferred; calls + UTM-attributed clicks only at MVP)

### Agents deferred

- Long-form Authority Builder — MVP-1.5
- Brand Voice Guard (standalone /crew agent) — MVP-1.5 (runs as validation layer at MVP)
- Content Refresher — Year 1 (requires 90+ days of scan history)
- Trend Spotter — Year 1
- Citation Predictor (standalone ML model) — Year 1 (rule-based confidence signal at MVP)
- Local SEO Specialist — Year 1
- Voice AI Optimizer — Year 1 (voice surfaces deferred)
- Visual/Multimodal Optimizer — Year 1
- Agent-Mediated Browsing Specialist — Year 1
- Reputation Defender — Year 1
- Industry KG Curator — Year 1

### AI surfaces deferred

- Voice AI surfaces (Alexa+, Siri, Google Assistant) — Year 1
- Multimodal surfaces (Google Lens AI, GPT vision) — Year 1
- Agent-mediated browsing (ChatGPT Atlas, OpenAI Operator) — Year 1

### Vertical knowledge graphs deferred (2 of 12 ship)

10 of 12 verticals deferred: local home services, healthcare, professional services, restaurants, automotive, real estate, beauty, education, fitness, pet services. Only B2B SaaS and E-Commerce SMB ship at MVP.

### Platform / ecosystem features deferred

- **Third-party Agent SDK and external developer program** — Year 1 (marketplace at MVP is Beamix-curated workflows only)
- **EU region data residency** (separate Supabase project) — MVP-1.5
- **White-label custom subdomain** (e.g., yossiagency.beamix.tech) — Year 1 (per-client white-label of PDF/email ships at MVP)
- **Predictive Layer** (Citation Predictor ML model, Score Trajectory Forecasting, Competitor-Move Forecasting) — Year 1
- **House Memory** as queryable natural-language archive — Year 1.5
- **Content Studio** (Cursor-for-content co-authoring) — Year 1.5
- **Reputation Layer** (reviews, social mentions, news) — Year 1.5
- **Beamix Sessions** (annual summit) — Year 2
- **State of AI Search annual report** — Year 1 Q4
- **Beamix Newsletter ("The Front Door")** — MVP-1.5
- **Operators' Room** (invite-only Slack community) — Year 1 Q3 (needs 50+ active customers)
- **International / non-English UI** — Year 1 (Hebrew content generation supported in agents at MVP; product UI English-only)
- **SOC 2 Type II certification** — Year 1 Q4
- **Revenue-share mechanic for workflow publishers** — Year 1 roadmap (acknowledge in Scale-tier DPA as a future program)
- **Multi-client cockpit / `/cockpit` route** — MVP-1.5 (the multi-client switcher is MVP; the single-view all-clients dashboard row is MVP-1.5)

---

## 6. Risks and Open Product Questions

### Risk 1: Trust Architecture is the critical path

The Trust Architecture (Truth File, pre-publication validator with cryptographic signed-token, review-debt counter, Truth File integrity job, incident runbook) adds 3–4 weeks to the build timeline as Tier 0 infrastructure. If skipped or rushed, one bad agent action creates catastrophic churn and reputational damage. Marcus explicitly said: "One bad agent action on a live page = instant cancel." This risk is non-negotiable. Mitigation: Trust Architecture completes before any agent runs against a real customer domain. No partial-credit. See Tier 0 checklist in §2.

---

### Risk 2: Lead Attribution Loop integration is harder than it looks

Twilio provisioning is straightforward. The hard part: ensuring the Twilio number and UTM URL actually get embedded in AI-engine-cited content. If Schema Doctor and Citation Fixer don't include the attribution mechanisms in the right places, calls and clicks won't be attributed. The "send to developer" handoff in Step 2 helps adoption but doesn't close the technical gap — the agent output pipeline must explicitly route the Twilio number and UTM URL into every content output. The customer-site JS snippet for form attribution is not available at MVP (this is a known gap — honest copy required: "calls + UTM-attributed clicks" only). Mitigation: dedicated integration testing of Lead Attribution in every agent's output pipeline. Explicit 72-hour verification check. Clear copy.

---

### Risk 3: Vertical classification accuracy

If domain classification is wrong, the wrong vertical KG is applied — a SaaS product getting e-commerce FAQ templates is embarrassing. The 80% accuracy target means ~20% of customers will be misclassified without a fallback. Mitigation: always offer Step 1 manual override ("which best describes your business?") and the Step 3 "This doesn't describe my business" escape hatch. Re-classification available in /settings → Business Facts.

---

### Risk 4: Scan volume costs at launch

11 engines × daily/weekly schedules × growing customer count creates a real infrastructure cost curve. Residential IP proxy costs and browser simulation costs are variable. Mitigation: per-customer scan-cost ledger + alarm instrumented from Day 0 (Tier 0 item). Per-account scan budget ceiling. Optimize highest-cost engines first.

---

### Risk 5: Shopify integration gap limits e-commerce value at MVP

E-commerce operators on Shopify expect product schema from their catalog, not from a manual Truth File. At MVP, Schema Doctor generates Product schema from Truth File only. The Shopify App or API integration is MVP-1.5. Known limitation that may reduce e-commerce conversion relative to SaaS conversion at launch. Mitigation: clear onboarding guidance for e-commerce customers on filling Truth File product categories manually. Prioritize Shopify integration in MVP-1.5 sprint.

---

### Risk 6 (NEW): Inngest free-tier wall-clock constraint

MVP launches on Inngest free tier (50K steps/month, shorter wall-clock timeouts per Adam's decision). Some MVP agents — particularly Reporter (Monthly Update PDF generation) and Citation Fixer (multi-page content rewrites) — may approach free-tier wall-clock limits on complex runs. Mitigation: chunk longer work across multiple Inngest steps at design time. Instrument per-agent step count and wall-clock usage. Migrate to Inngest Pro ($150/mo) at ~5 paying customers OR ≥75-80% of free-tier ceiling (whichever first). Migration is one-click on Inngest side. Workflow Builder workflows must include cost estimates at save time; any workflow estimated to exceed free-tier limits shows a warning.

---

### Risk 7 (NEW): Cross-tenant Truth File binding for workflow publishing is untested at MVP

Workflow Builder ships at MVP for private workflows. Workflow publishing to marketplace defers to MVP-1.5 because the cross-tenant Truth File binding (installer's Truth File, not Yossi's) is new engineering that has never been tested in production. T&S identified this as the highest-risk MVP feature if publishing had shipped Day 1. Mitigation: build cross-tenant binding during the MVP sprint (it's Tier 0 architecture), test it internally against 3 reference customer fixtures (SaaS / e-commerce / agency), deploy to production, run 4 weeks of telemetry on real Scale customer private workflows, then open publishing in MVP-1.5. If binding shows anomalies in telemetry, delay publishing further. Hold the MVP-1.5 publishing date in writing — Yossi explicitly said not to slip it to Year 1.

---

### Open Product Questions

**Q1 (Multi-domain Scale tier):** Current assumption: Scale = up to 20 domains at flat rate. If real-world Scale-tier usage shows Yossi needing >20 domains before the "Agency" conversation, this assumption needs revision. Confirm with Adam if usage signals suggest revising the ceiling. Do not change without CEO sign-off.

**Q4 (Discover tier engine lock):** Recommended lock: ChatGPT, Perplexity, Google AI Overviews as the 3 Discover engines. Rationale: highest reach + clearest citation patterns across both personas. Confirm with Adam before launch copy is written. Once confirmed, update /home tier badge string ("Discover · 3 engines · 4 agents" will need clarifying footnote or product tour noting which 3).

**Q5 (Review-debt counter thresholds):** Locked per board: Amber = 3 pending items AND 1–4 days since oldest item created. Red = 5 pending items AND >5 days. These thresholds are now locked; do not reopen.

---

*End of PRD v2. This document is the canonical build specification for the Beamix wedge launch. Build Lead should start from this document. Acceptance criteria in §2 are the definition of done for each feature. Tier 0 infrastructure (listed in §2 preamble) completes before any feature build begins.*

*PRD v1 (2026-04-27-PRD-wedge-launch-v1.md) is deprecated. Do not reference it for feature decisions.*
