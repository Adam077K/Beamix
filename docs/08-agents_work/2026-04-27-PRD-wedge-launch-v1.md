# Beamix — Wedge Launch PRD v1
**Date:** 2026-04-27
**Status:** CANONICAL — translates Frame 5 v2 LOCKED strategy into shippable features
**Author:** Product Lead
**Inputs:** Frame 5 v2 Full Vision, Board 3 Domain Expert, Page List LOCKED, Board 2 Customer Voice, R4 GEO Positioning

---

## Table of Contents

1. [ICP — The Wedge Customer Profile](#1-icp)
2. [MVP Feature Scope](#2-mvp-feature-scope)
3. [User Stories](#3-user-stories)
4. [Success Metrics](#4-success-metrics)
5. [Out of Scope for MVP](#5-out-of-scope)
6. [Risks and Open Product Questions](#6-risks-and-open-questions)

---

## 1. ICP — The Wedge Customer Profile

### Who Beamix is building for at launch

The wedge is not a broad SMB market. It is two specific operator archetypes who share four traits: they are tech-native, already paying for SaaS tooling, comfortable with autonomous software acting on their behalf, and deeply motivated by a specific, named fear — "customers are asking AI where to find us, and we are not in the answer."

---

### Persona A: The B2B SaaS Founder

**Archetype:** Founder or co-founder of a dev tools, vertical SaaS, or infrastructure SaaS company. 10–100 employees. Raised a seed or Series A. Revenue is $500K–$5M ARR. The company competes in a crowded category where differentiation is difficult.

**Name for this PRD:** Marcus (to distinguish from the plumber-voice document; same urgency, different context)

**Day in the life (as it touches Beamix):**
Marcus starts his morning with a Slack scroll. He opens his analytics dashboard — Mixpanel or Amplitude — checks signups and MRR, then opens LinkedIn for 3 minutes. His attention budget for any non-core tool is tight: he has a product to ship, a board deck to finish, and two customer calls before lunch. He does not have a marketing manager. He has a growth hire who focuses on paid and SEO, but nobody owns AI visibility. He noticed two months ago that when he typed their product category into ChatGPT, a competitor came up and his product did not. He sent a Slack message to his growth hire: "why aren't we showing up in ChatGPT?" Nobody answered definitively.

**Tech sophistication:** High. Marcus uses Linear, Vercel, Retool, Notion, Stripe dashboards fluently. He is comfortable with new SaaS products and does not need hand-holding through setup. He will tolerate a setup flow that asks for a domain, a business category, and a competitor name — and he expects the product to pre-populate the rest. He will not write a marketing strategy brief during onboarding. He will approve a draft that Beamix writes for him.

**Team structure:** Marketing (1 generalist), growth (1 paid/SEO hire), product (2–4), engineering (5–15). No dedicated content team. No AI visibility expertise. The growth hire may become the day-to-day Beamix user, but Marcus makes the buying decision.

**How he finds tools:** Founder Twitter/X, Product Hunt, Hacker News Show HN, and colleague Slack communities (VC portfolio Slacks, YC group chats, SaaStr Slack). He will try a free scan if someone he respects shares the link. He converts to paid after seeing his company not appear in a scan result — and seeing a competitor appear.

**What convinces him to try:** A free public scan that shows his company's AI visibility score. The number does not need to be low; it needs to be specific. "You appear in 2 of 11 AI engines for your top 5 queries. Your main competitor appears in 7 of 11." That sentence converts him.

**What converts him to paid:** Seeing the scan and thinking: "this is my SEO consultant problem but for the new channel, and this product will fix it for me without me having to manage it." He converts at the end of the free scan with a single "Get started — $79/mo or $189/mo" choice.

**Tier mapping:**
- **Discover $79** — unlikely for Marcus. He will see the engine count (3 engines on Discover) and immediately want more. Used mostly as a test before upgrading.
- **Build $189** — the primary Marcus tier. All 11 text engines, 8 agents, includes the Citation Predictor (Discover does not). This is "put it on the company card" money — he can approve without a budget meeting. For Marcus, $189/mo is cheaper than one hour with his SEO consultant.
- **Scale $499** — Marcus at Scale is a 50–100-employee company where a Head of Marketing approves the budget. Or Marcus himself if he has churned twice from Build without results and believes the advanced features (Workflow Builder, white-label Monthly Update for his own board) justify the upgrade. Scale is not the primary acquisition tier.

**Why AI visibility specifically:** Marcus's exact fear is: "we want developers to ask Claude or ChatGPT 'what's the best API for X' and get our product as the answer." His buyers are technical; they use AI tools to discover products. The developer-asking-an-AI-for-a-tool-recommendation is Marcus's new first touchpoint. His sales funnel starts in ChatGPT. He cannot ignore it.

**Job-to-be-done:** Beamix is Marcus's AI visibility hire that never takes a vacation, does not need to be managed, sends him a Monday morning email, and can prove (via lead attribution) when a customer found him through AI. It occupies the mental category of "automated marketing retainer" — what he was paying an agency $3,000/mo to do badly, except Beamix does it for $189/mo continuously. Not a dashboard. Not an "SEO tool." The AI-era distribution channel, run on autopilot.

**Renewal anchor:** The Lead Attribution headline in the Monthly Update. "In March, 14 developers asked Claude about API tools in your category and found your product. We know because 9 of them clicked your tagged attribution link." Marcus forwards that to his co-founder. He renews for a year.

---

### Persona B: The E-Commerce Operator

**Archetype:** Owner or head of growth at a direct-to-consumer e-commerce brand on Shopify. 3–10 employees. Revenue is $2M–$10M annual (the $5M ARR "Shopify store" archetype). They sell a physical or digital product in a category with AI-discoverable intent — supplements, kitchen products, skincare, outdoor gear, specialty food.

**Name for this PRD:** Dani (gender-neutral; operators in this category are diverse)

**Day in the life:**
Dani's morning is: check revenue in Shopify analytics, check ROAS in Meta Ads Manager, skim email. She has a content creator posting UGC, a paid media buyer, and maybe a part-time SEO freelancer. She has not thought about AI search as a category yet, but she has noticed that her Meta ad performance is declining and she is unsure where the new discovery channel is. She is spending $20,000–$50,000/month on Meta and Google ads combined. If AI search can generate even 3–5% of what paid generates, and at a fraction of the cost, she is interested.

**Tech sophistication:** Moderate-high. Dani is comfortable with Shopify, Klaviyo, Triple Whale, Google Analytics 4. She uses AI tools (ChatGPT for copywriting, Midjourney for creative concepts) but is not a developer. She will not configure JSON-LD schema herself. She expects Beamix to handle technical work without explaining it.

**Team structure:** Paid media (1), content/UGC (1), part-time SEO (1 contractor), occasional agency. No AI visibility expertise.

**How she finds tools:** Podcasts (My First Million, Marketing Made Simple, e-commerce specific shows), Instagram and TikTok ads for SaaS tools, Shopify App Store (less relevant here but indicates discovery behavior), Klaviyo and Triple Whale in-product recommendations. She will try a free scan if a podcast host or influencer in her category mentions it.

**What convinces her to try:** A free public scan that shows "When someone asks ChatGPT or Perplexity for the best [product category], you are not in the answer. Here are the brands that are." This hits her competitively. She has a strong brand identity and does not want to be invisible.

**What converts her to paid:** The scan result combined with the framing: "Beamix fixes this. Automatically. Here is what your listing on AI engines will look like after 30 days." The price ($79 or $189) is noise compared to her paid media budget. The question is not price. The question is whether it actually works.

**Tier mapping:**
- **Discover $79** — the right entry point for smaller operators ($2M–$3M). Three engines, 5 agents. The "try before you commit" tier. She will upgrade to Build within 60 days if she sees results.
- **Build $189** — primary Dani tier. All 11 engines, 8 agents, Long-form Authority Builder (her primary value driver — Beamix writes pillar content under her domain). This is category-defining for her: no SEO agency writes pillar content autonomously at $189/mo.
- **Scale $499** — Dani at Scale is the 15-person brand doing $8M+ that has a Head of Marketing. Or the Shopify-plus operator who wants white-label reports for investor updates.

**Why AI visibility specifically:** Dani's fear is: "a shopper asks ChatGPT for the best protein powder under $50, and the answer is my competitor, not me." The conversion data backs the fear: AI-referred visitors convert at 4–5x traditional organic search. One sale from an AI referral is worth four from Google. She cannot afford to be invisible in the new channel.

**Job-to-be-done:** Beamix is Dani's automated AI channel manager. She already has a paid media manager, an SEO manager, and a social media manager. Beamix is the AI search manager she could never hire as a person. It occupies the category of "new distribution channel on autopilot" — sitting alongside her existing channel investments.

**Renewal anchor:** The Lead Attribution Loop. A dedicated Beamix phone number or UTM-tagged URL that proves "this customer found you through AI search." When Dani's monthly update says "Beamix generated 47 qualified sessions from AI engines with an average order value of $92," she renews before reading the rest.

---

### Shared traits across both personas

| Trait | How it shapes Beamix |
|---|---|
| Attention budget: max 6–10 min/week | Email is the product. Dashboard is the backup. |
| Trust gradient: cautious with autonomy | Draft-then-approve by default. Auto-approve only after pattern-established. |
| Private by default | No competitor can see their scan results or Monthly Update without explicit share. |
| Proof-over-promise | Lead Attribution Loop is not a nice-to-have — it is the renewal mechanism. |
| Tech-native, not tech-expert | No jargon in the UI. "Schema" = "how AI reads your site." |
| Already paying for SaaS | $189/mo is not a barrier. ROI clarity is the barrier. |
| Buys on word-of-mouth | Month 2 referral is more important than Month 1 upgrade. |

---

## 2. MVP Feature Scope

### Priority key

- **MVP** — must ship at launch
- **MVP-1.5** — ship within 6–8 weeks of launch (fast follow)
- **Year 1** — ships in Year 1, post-traction
- **Year 1.5+** — full vision, deferred

---

### Feature 1: /scan public (acquisition surface)

**What it does:** Unauthenticated visitor enters their domain. Beamix runs a scan against 11 text AI engines using the top 10 queries for their vertical. A 15–17 second animated reveal shows their AI visibility score (0–100), which engines mention them, which mention competitors, and 3 specific gaps. Public permalink is generated (private by default, requires explicit share). CTA: "Fix this — start free."

**Why MVP:** This is the primary acquisition channel. Every referral, every social share, every cold email drives to this page. Without it, there is no top-of-funnel. The scan result IS the product demo.

**Acceptance criteria:**
- [ ] Visitor enters a domain URL and clicks "Scan" — scan completes in under 20 seconds
- [ ] Score (0–100) displays with delta vs vertical benchmark (e.g., "below average for B2B SaaS")
- [ ] At least 3 specific engine citations shown (which engines mention them, with query context)
- [ ] At least 2 competitor citations shown ("your top competitor appears in X more engines")
- [ ] Permalink is generated but private by default — sharing requires one explicit click
- [ ] "Start free" CTA links directly to signup with `?scan_id=` parameter (scan imports to dashboard on signup)
- [ ] Cream-paper aesthetic (off-white `#F7F2E8` background, Fraunces accent text, stamp/seal motif) — RESERVED for this surface only
- [ ] Mobile-responsive, loads in <3s on 4G

**Dependencies:** AI engine scan infrastructure (11 engines), vertical detection, score algorithm

**Priority: MVP**

---

### Feature 2: Onboarding flow (Brief approval ceremony)

**What it does:** 4-step post-Paddle onboarding. Step 1: business profile (domain, category, location — pre-filled from scan if `?scan_id=` present). Step 2: first scan initiated (if not from public scan). Step 3: Brief approval — Beamix authors a 1-paragraph Brief from the scan data; customer reads, edits chips, approves with Seal-draw animation. Step 4: first agent queued, dashboard ready.

**Why MVP:** Without onboarding, there is no Brief, no Truth File foundation, and no agent context. The Brief approval is the product's first trust-establishing moment.

**Acceptance criteria:**
- [ ] Onboarding detects `?scan_id=` — skips redundant scan, imports data, pre-fills business profile
- [ ] Brief is Beamix-authored (not customer-written): 1 paragraph in plain English, generated from scan + vertical KG
- [ ] Brief editing uses chip menus (no free-form text in v1), covers: primary location, service/product category, target customer, top 3 competitors, content tone
- [ ] Seal-draw animation fires on Brief approval (hand-drawn SVG stroke over signature line, 800ms, fires once)
- [ ] After approval: first agent run is queued automatically; customer sees "Beamix is working" confirmation
- [ ] Onboarding completes in under 4 minutes for median customer
- [ ] No step requires customer to write marketing strategy — all steps are confirm/select/approve

**Dependencies:** Scan data, Brief template (vertical-specific, 2 verticals at launch), Seal-draw animation component

**Priority: MVP**

---

### Feature 3: Truth File (Trust Architecture — non-negotiable pre-launch)

**What it does:** A structured per-customer document storing authoritative facts about their business: hours, services, service area, pricing signals, certifications, contact details, prohibited claims. Every agent action cites the Truth File as a source. Agents cannot publish factual claims that contradict the Truth File. Customer edits Truth File in `/settings` under "Business Facts" tab.

**Why MVP:** This is the Trust Architecture lock (Q3 from Frame 5 v2). Without it, agents can publish incorrect facts, creating liability and customer churn. One bad agent action (wrong hours published, service they don't offer mentioned) costs more in trust than 10 good actions earn. Ships before any agent touches a live page.

**Acceptance criteria:**
- [ ] Truth File schema is vertical-specific: SaaS Truth File asks about integrations, pricing model, target company size; e-commerce Truth File asks about shipping regions, return policy, product categories — not "service area"
- [ ] Every agent pre-publication check includes a Truth File validation step (factual claims cross-checked)
- [ ] Customer can view, edit, and add to Truth File in `/settings → Business Facts`
- [ ] Customer can see which agent actions referenced which Truth File fields (provenance, accessible from `/inbox` item detail)
- [ ] Truth File is exported if customer cancels or requests data export
- [ ] Agents are blocked from publishing claims marked "prohibited" in Truth File

**Dependencies:** Vertical KG schemas (2 at launch), agent provenance system

**Priority: MVP (must ship before any agent goes live)**

---

### Feature 4: Pre-publication validation + review-debt counter

**What it does:** Before any agent publishes any content or schema change, a validation step runs: (1) Brand Voice Guard checks against customer's established voice fingerprint, (2) Trust File Auditor checks factual accuracy, (3) Citation Predictor scores publication probability (Scale tier). Items that fail validation go to /inbox with failure reason. Review-debt counter tracks how many items are pending customer review.

**Why MVP:** The Trust Architecture lock. Customers are justifiably afraid of autonomous agents touching their web presence. The pre-publication gate is the answer to the question "what will NEVER happen without me clicking yes?"

**Acceptance criteria:**
- [ ] Every agent action that produces customer-facing content is gated behind a validation check before appearing in /inbox
- [ ] Validation failure reason is shown to customer in plain English (not error codes)
- [ ] Review-debt counter is visible at the top of /inbox and in the /home "Inbox pointer line"
- [ ] Customer can set per-agent autonomy level in /crew: "Always ask" (default for new customers), "Ask for new types, auto-approve repeats" (available after 10 approvals), "Auto-apply, weekly summary" (available after 30 approvals in a category)
- [ ] Weekly summary email ("here's what we did automatically this week, anything wrong?") is sent to customers on Auto-apply mode

**Dependencies:** Brand Voice Guard agent, Trust File Auditor agent, /inbox surface

**Priority: MVP**

---

### Feature 5: /home — the daily destination

**What it does:** The primary product surface. All 8 locked sections ship at launch (per page-list decision). Vertical scroll, no tabs.

Section breakdown:
1. **Hero score block** — AI visibility score (0–100) with Activity Ring, 12-week sparkline path-draw on load, delta vs last week, 1-line diagnosis in plain English
2. **Top 3 fixes ready** — RecommendationCards from agents, "Run all — N credits" CTA, each card shows which agent, estimated impact
3. **Inbox pointer line** — count of items awaiting review, links to /inbox
4. **KPI cards row** — Mentions / Citations / Credits used / Top competitor delta (each clickable to drill deeper)
5. **Score trend chart** — 12-week line, hover tooltips
6. **Per-engine performance strip** — 11 engine pills, scores, gated engines grayed for lower tiers, click to drill to /scans/per-engine
7. **Recent activity feed** — last 8 events: scans, agent runs, approvals
8. **What's coming up footer** — next scheduled scan, next digest send, next billing date

Lead-attribution headline (when data is available, typically after 14 days): *"This month: 14 AI-attributed sessions. Up 3x vs last month."*

**Why MVP:** This is the page most customers will live on. It IS the product for the Sarah-archetype who spends 6 minutes per week. Every element is load-bearing.

**Acceptance criteria:**
- [ ] Activity Ring renders around score number with 2px stroke, hand-drawn Rough.js terminus seam
- [ ] Ring pulses (subtle, 3s period, opacity animation) when an agent is actively working
- [ ] Score sparkline path-draws on first load (800ms path-draw animation)
- [ ] Per-engine strip shows all 11 engines; grayed/locked engines show upgrade prompt on hover
- [ ] RecommendationCards show: which agent created, action type, estimated citation lift, credit cost
- [ ] Lead-attribution headline appears once Lead Attribution Loop has data (graceful absence if no data yet)
- [ ] "Crew Traces" visual treatment (faint Rough.js underlines) on content items modified ≤24h
- [ ] Page loads in <2s (LCP ≤2.5s on desktop, ≤3.5s on mobile)
- [ ] All 8 sections render correctly on mobile (bottom nav: /home · /inbox · /scans · /crew)

**Dependencies:** Scan engine, agent system, Lead Attribution Loop (for headline), Activity Ring component, Rough.js integration

**Priority: MVP**

---

### Feature 6: /inbox — consent surface

**What it does:** 3-pane Linear-pattern review queue. Left rail: filters (by agent, source, priority). Center: item list with J/K keyboard navigation and multi-select. Right: content preview with sticky ActionBar (Approve `A` / Reject `X` / Request Changes `R` / Cmd+A bulk approve). Tabs: Pending (default) / Drafts / Live. Seal-draw animation fires on single-item approval. Empty state = success state with hand-drawn Rough.js illustration ("Inbox zero. Beamix is working.").

**Why MVP:** Every agent output passes through /inbox before going live. Without this surface, there is no customer consent mechanism and no Trust Architecture.

**Acceptance criteria:**
- [ ] J/K keyboard navigation works through item list without mouse
- [ ] Seal-draw animation fires on individual approval (pen-stroke SVG, 600ms, non-blocking)
- [ ] Bulk approve (Cmd+A) does NOT trigger Seal-draw (too frequent to be meaningful)
- [ ] Review-debt counter visible at top of inbox and echoed on /home
- [ ] Each item shows: which agent, what action, before/after diff (for content changes), Truth File references used
- [ ] "Request Changes" opens a plain-text note to the agent (agent re-runs with note as context)
- [ ] Empty state renders hand-drawn Rough.js illustration (the only hand-drawn illustration on this surface)

**Dependencies:** Agent system, pre-publication validation, Seal component, Rough.js

**Priority: MVP**

---

### Feature 7: MVP agent roster (6 agents ship at launch)

**Why 6 and not 11 or 18:** At MVP, agents need to (1) produce clear evidence the customer can see and understand, (2) operate safely within the Trust Architecture, and (3) cover the highest-value jobs for both SaaS and e-commerce wedge customers. The 6 below were selected by impact-to-complexity ratio and by how directly they close the Lead Attribution loop.

#### Agent 1 — Schema Doctor (MVP)
Audits and repairs JSON-LD structured data (Organization, Product, FAQ, Service, BreadcrumbList). Generates `llms.txt` manifest. For SaaS: generates SoftwareApplication schema. For e-commerce: generates Product + Offer schema with pricing, availability, image attributes. Runs on schedule (weekly or on schema change). Every change goes through /inbox for approval.

**Why MVP:** Schema is the single highest-leverage, lowest-risk intervention. It does not change visible content. It is fully reversible. Customers can see the before/after. High citation lift per unit of effort.

#### Agent 2 — Citation Fixer (MVP)
Identifies the 3–5 pages on the customer's domain most likely to be cited by AI engines. Rewrites or adds quotable-passage blocks (H2 + 2–3 self-contained sentences) optimized for the citation grammar of ChatGPT, Perplexity, and Claude. Does NOT rewrite the entire page — only surgical additions.

**Why MVP:** This is the visible-to-customer fix. Before/after diff in /inbox is dramatic: "we added 3 AI-optimized paragraphs to your About page." Citation lift is measurable in subsequent scans.

#### Agent 3 — FAQ Agent (MVP)
Generates 8–12 FAQ entries per customer based on the vertical KG query patterns, the customer's Truth File, and multi-turn AI engine query analysis. Places FAQ as JSON-LD FAQ schema and as visible H2 + answer blocks on designated pages. Generates voice-search variants (longer, conversational phrasing) as a secondary output.

**Why MVP:** FAQ content is the #1 highest-citation-probability content type across all 11 engines. It is also easy for customers to review and approve. The voice-search variant is a differentiator no competitor ships at MVP.

#### Agent 4 — Competitor Watch (MVP)
Monitors the citation patterns of up to 5 competitors per customer across all 11 engines. Surfaces: when a competitor gains share on a specific query cluster, why (retrieval-cluster analysis), and what the customer can do about it. Competitor set is pre-populated from the vertical KG on signup (customer does not have to type competitor names).

**Why MVP:** Competitor Watch is the single highest-engagement agent. Seeing "Joe's Plumbing is now cited on 7 engines; you're on 3; here's why" is the emotional hook that converts free-to-paid and prevents churn. It is also the feature most likely to generate word-of-mouth ("you need to see what Beamix showed me about my competitors").

**Note:** Competitor Watch is gated at Build ($189) and Scale ($499). Not available on Discover ($79). This creates the most visible upgrade reason.

#### Agent 5 — Trust File Auditor (MVP)
Runs weekly consistency checks: scans the customer's own domain, Google Business Profile (if connected), and AI engine citations for factual discrepancies. Surfaces conflicts ("your website says you're open 24/7; ChatGPT says you close at 6pm — which is correct?"). Catches hallucinations. Prioritizes by severity. Runs silently; only surfaces to /inbox when a discrepancy is found.

**Why MVP:** Without this agent, the Truth File goes stale. A stale Truth File is worse than no Truth File — agents will write corrections that are themselves incorrect. Trust File Auditor is the maintenance layer that keeps all other agents accurate.

#### Agent 6 — Reporter (MVP)
Generates the Monday Digest (plain-text email, 5 bullets, what changed, what's next, credit balance) and the Monthly Update (gift-quality PDF + permalink, lead-attribution headline, counterfactual lift statement, "forwarding to your CEO" CTA). Reporter runs at scheduled intervals and on-demand.

**Why MVP:** Reporter closes the renewal loop. The Monday Digest is the product's presence in the customer's week without requiring them to log in. The Monthly Update is the artifact they forward to their investor or co-founder. Without Reporter, there is no renewal anchor.

---

#### Agents deferred (not in MVP):
- Content Refresher — MVP-1.5 (requires 90+ days of scan history to calculate decay curves)
- Trend Spotter — Year 1 (requires vertical KG query-demand dataset to reach forecasting threshold)
- Brand Voice Guard — MVP-1.5 (runs in the background as validation layer at MVP; becomes a standalone agent in 1.5)
- Citation Predictor — Year 1 (per-engine citation probability model requires 6+ months of scan data per vertical)
- Local SEO Specialist — Year 1 (separate surface; requires GBP API integration)
- Long-form Authority Builder — MVP-1.5 (high-value for e-commerce; defer to test schema + FAQ lift first)

---

### Feature 8: /workspace — agent execution viewer

**What it does:** The "courier-flow" animation page. When an agent is running, /workspace shows a vertical step list with real-time status (pending / running / done / failed), streaming output per step, and the agent's tool usage (which URLs it fetched, which Truth File fields it checked). The page is transient — linked from /home activity feed when an agent is active. The visual metaphor is a person walking with tools (animation tokens: courier-walk loop, tool-pickup at each step, delivery moment at completion).

**Why MVP:** This is the "proof that Beamix is actually doing something" surface. Customers who doubt autonomous software need to see the work happening. One visit to /workspace while an agent runs converts skeptics.

**Acceptance criteria:**
- [ ] Each agent run creates a /workspace session linked from /home activity feed
- [ ] Step list updates in real-time (1–2s polling or WebSocket)
- [ ] Each step shows: tool name, target URL or field, status, duration
- [ ] Courier-flow animation plays in the header during active runs (pauses on completion)
- [ ] Customer can view past completed /workspace sessions (linked from /scans)
- [ ] Page gracefully handles failed runs: shows which step failed, why (plain English), and the rollback action taken

**Priority: MVP**

---

### Feature 9: /scans — historical record

**What it does:** Stripe-table-style scan history. 3 tabs: All Scans / Completed Items (absorbs /archive) / Per-Engine. Each row: scan date, trigger (scheduled/manual/on-demand), score at scan time, engines covered, delta vs previous scan, attribution to "Beamix" or "manual." 4 work-attribute lenses as filter pills: Done / Found / Researched / Changed. Row click expands to per-scan deep dive (per-engine breakdown, query-level citation details, agent actions triggered by this scan).

**Why MVP:** Without scan history, customers cannot evaluate ROI or track progress. The 4 lenses (Done/Found/Researched/Changed) are the "receipts" that prove what Beamix did — the non-negotiable evidence for renewal.

**Acceptance criteria:**
- [ ] All Scans tab loads with reverse-chronological scan list (last 90 days default, expandable)
- [ ] Completed Items tab shows agent-completed actions with before/after state
- [ ] Per-Engine tab shows per-engine score history as sparklines for each of the 11 engines
- [ ] 4 lens pills filter correctly: Done (agent completed), Found (scan surfaced a gap), Researched (agent ran analysis), Changed (agent made a change, approved by customer)
- [ ] "Share this scan" generates a public URL on demand (private by default)
- [ ] Each scan row links to the /workspace session for that scan (if available)

**Priority: MVP**

---

### Feature 10: /competitors — intelligence surface

**What it does:** Competitor citation dashboard. Clean table: competitor name, score, engine coverage count, citation delta (7-day), trend arrow. Row click opens the Rivalry Strip — a dual-sparkline depth view (customer vs competitor, per-engine, 12 weeks). Competitor set is pre-populated from the vertical KG. Customer can add up to 5 custom competitors.

**Why MVP:** Competitor Watch agent surfaces the data; /competitors is the UI. Without this page, Competitor Watch's output has no home. The Rivalry Strip dual-sparkline is a design move no competitor ships.

**Acceptance criteria:**
- [ ] Table shows up to 10 competitors (5 vertical-KG-pre-populated + up to 5 customer-added)
- [ ] Rivalry Strip opens on row click as a right-side panel (not a new page): dual-sparkline (customer blue, competitor gray), per-engine tabs, 12-week range
- [ ] Competitor delta column shows: +/- change in citation count over 7 days
- [ ] Gated at Build ($189) and Scale ($499) — Discover tier sees competitor table with blurred Rivalry Strip and upgrade CTA
- [ ] Pre-populated competitors display "Beamix detected" badge (shows customer the vertical KG at work)

**Priority: MVP (gated at Build+)**

---

### Feature 11: /crew — power-user customization

**What it does:** The 6 MVP agents (later 11 at full vision) displayed as monogram circles in a grid. Each agent has: name, status (active/paused/running), last run timestamp, and a settings panel on click. Settings panel: autonomy level (Always ask / Smart auto / Full auto), custom instructions (plain-text field — what the customer wants this agent to know about their business beyond the Brief), scheduling override (frequency), manual trigger button, and per-agent activity log (last 10 actions).

**Why MVP:** /crew is the customization surface that converts tech-native customers (Marcus, Yossi) from users to advocates. It is the "I feel in control" surface. Without it, all agents behave identically regardless of customer nuance.

**Acceptance criteria:**
- [ ] Agent monogram circles pulse with Activity Ring animation when agent is actively running
- [ ] Per-agent autonomy level is separate from global default (set during onboarding)
- [ ] Custom instructions field accepts up to 500 characters of plain text per agent
- [ ] Manual trigger button queues an immediate agent run (one run per agent per day limit)
- [ ] Activity log shows last 10 actions per agent with timestamps, action type, and outcome
- [ ] /crew is accessible via mobile bottom nav as the 4th item

**Priority: MVP**

---

### Feature 12: Lead Attribution Loop

**What it does:** Two-channel attribution system. (1) Twilio dynamic phone number: Beamix provisions a local phone number for the customer's area that forwards to their real number. Number is embedded in AI engine citations and on designated pages. Calls to this number are logged as "AI-attributed leads." (2) UTM-tagged URL: Beamix generates a `?utm_source=beamix&utm_medium=ai-search` URL that the customer can use as their primary website URL in AI-engine-optimized content. Clicks to this URL are logged.

**Why MVP:** The Lead Attribution Loop is the renewal mechanism. Without it, the Monthly Update cannot contain the lead-attribution headline, and customers have no way to connect Beamix's work to their phone ringing or leads arriving. This is the single most important retention feature.

**Acceptance criteria:**
- [ ] Twilio number provisioned within 2 minutes of customer enabling Lead Attribution in /settings
- [ ] Call logs visible in /home KPI cards (calls this month / calls vs previous month)
- [ ] UTM-tagged URL auto-generated and visible in /settings → Lead Attribution
- [ ] Monday Digest includes "this week: N attributed calls/clicks" when data is available
- [ ] Monthly Update PDF includes lead-attribution headline as the document's opening line
- [ ] Attribution setup wizard in onboarding (optional step 4.5 — customer can skip but is nudged)

**Dependencies:** Twilio integration, UTM parameter tracking (can be handled in Next.js middleware)

**Priority: MVP**

---

### Feature 13: /schedules and /settings

**What they do:**
- **/schedules:** Configure recurring scan frequency (daily/weekly/monthly per engine tier), auto-fix triggers (run this agent when score drops below X), and notification preferences (email on scan complete, email on /inbox new items).
- **/settings:** 5 tabs. Profile (name, email, domain), Billing (Paddle portal link, current tier, usage), Notifications (email preferences, digest frequency), Business Facts (Truth File editor), Lead Attribution (Twilio number, UTM URL, attribution settings).

**Why MVP:** Settings are load-bearing for both Trust Architecture (Truth File lives here) and Lead Attribution (setup lives here).

**Acceptance criteria:**
- [ ] Truth File editor in /settings → Business Facts is a structured form (not raw JSON) with vertical-specific fields
- [ ] Billing tab links to Paddle customer portal for self-serve upgrades, downgrades, and cancellation
- [ ] Cancel flow is gracious: no dark patterns, no "are you sure?" loops — one click to cancel, with a calm "we're sorry to see you go, here's how to export your data" confirmation
- [ ] Notification settings include: Monday Digest opt-out, scan completion emails on/off, /inbox new items on/off

**Priority: MVP**

---

### Feature 14: Email infrastructure

**What it does:** Three email types at MVP.
1. **Monday Digest** — plain-text, 5 bullets, sent Monday 8am customer-local time. Content: score this week, top change made, top competitor move, what's coming up, credit balance. Signed "Beamix." 6-sentence maximum.
2. **Event-triggered emails** — scan completed, new /inbox item requiring review, Lead Attribution first call received ("Your Beamix number got its first call").
3. **Monthly Update** — 1-page PDF + permalink, sent first Monday of the month. PDF renders in cream-paper register (`#F7F2E8`), Fraunces accent, lead-attribution headline, counterfactual lift paragraph, "forward this" CTA.

**Why MVP:** The Monday Digest is the product's weekly presence in the customer's inbox. Without it, customers forget Beamix exists between visits. The Monthly Update is the renewal anchor artifact.

**Acceptance criteria:**
- [ ] Monday Digest delivers plain text (no HTML template styling — this is intentional and communicates "operator-grade signal, not marketing email")
- [ ] Monthly Update PDF renders in cream-paper aesthetic, not the product UI aesthetic
- [ ] Event-triggered emails fire within 2 minutes of trigger event
- [ ] All emails signed "Beamix" — no agent names, no "your AI team"
- [ ] All emails include one-click unsubscribe (CAN-SPAM compliance)
- [ ] Customer can configure email frequency in /settings → Notifications

**Priority: MVP**

---

### Feature 15: 11 text AI engine coverage

**What it does:** Scan infrastructure covering all 11 text AI engines: ChatGPT, Perplexity, Gemini, Claude, AI Overviews, Grok, You.com, Bing Copilot, Meta AI, Mistral Le Chat, DeepSeek. Each engine scanned with appropriate method (API where available, residential-IP browser simulation where not). Citation envelope stored per scan per engine per query.

**Scan schedule:**
- Real-time engines (Perplexity, Grok, AI Overviews): daily
- Crawl-based engines (ChatGPT default, Claude, Gemini app): weekly
- Remaining engines: weekly

**Why MVP:** 11 engines is the competitive moat claim at launch. "We monitor all 11 major AI engines" is the marketing sentence. Monitoring 3 or 5 is insufficient to justify $79–$499/mo.

**Acceptance criteria:**
- [ ] All 11 engines return citation data within 24 hours of scan trigger
- [ ] Scan failures (engine down, rate limited) are retried automatically within 2 hours
- [ ] Scan failure is surfaced to customer only if all 3 retries fail ("Perplexity scan delayed — will retry at 6am")
- [ ] Citation envelope stores minimum fields: surface, query, brand_mentions (position + sentiment), competitor_mentions (brand + position), is_mentioned (boolean), citation_context (sentence)
- [ ] Per-engine score (0–100) calculated and displayed in /home per-engine strip

**Priority: MVP**

---

### Feature 16: 2 vertical knowledge graphs (SaaS + e-commerce)

**What it does:** Platform-level datasets for Boutique B2B SaaS and E-Commerce SMB verticals. Each graph contains: top 500 queries, retrieval-cluster map per query cluster, top-cited content shapes, vertical-specific Truth File schema, vertical-specific competitor universe, vertical-specific Brief template, and vertical-specific agent specializations (SaaS-Schema-Doctor, Ecommerce-FAQ-Agent).

**Why MVP:** The vertical KG is what makes the product feel immediately intelligent at onboarding. Pre-populated competitors, vertical-specific Brief language, and query patterns tuned to the customer's actual business create the "how did it know that?" first impression. Generic GEO tools cannot replicate this.

**Acceptance criteria:**
- [ ] Domain detection classifies new signups into SaaS or e-commerce with ≥80% accuracy (fallback: onboarding asks "which best describes your business?")
- [ ] Competitor set pre-populated with 5 domain-specific competitors from the vertical KG on first scan
- [ ] Brief template uses vertical-appropriate language (SaaS Brief mentions "integrations, target company size, ICP"; e-commerce Brief mentions "product categories, shipping, return policy")
- [ ] FAQ Agent generates vertical-specific questions (SaaS: "what integrations does X support?"; e-commerce: "does X ship internationally?")
- [ ] Schema Doctor emits correct schema type (SaaS: SoftwareApplication; e-commerce: Product + Offer)

**Priority: MVP**

---

### Feature 17: Marketplace + Agent SDK + Rewards (Q7 LOCKED — ships at launch)

**What it does:** The Marketplace is the platform extension surface. At MVP, it ships in a constrained form: a browsable catalog of Beamix-authored additional agent workflows (not third-party at launch — third-party SDK is Year 1). Agents are specialized variants: "SaaS Pillar Content Pack" (Long-form Authority Builder preset for SaaS), "E-Commerce Product Page Optimizer" (Citation Fixer preset for product pages). Customer installs a marketplace agent; it appears in /crew.

**Rewards:** Customers who have installed and regularly used Marketplace agents for 30+ days receive a "Beamix Power User" badge visible in /crew and on their /scan public share. Agents with high install rates (top 3/month) are featured. This is the reward mechanic for Q7 LOCKED.

**Why MVP (constrained):** Q7 is LOCKED — ship with reward system at launch. The constrained version (Beamix-authored workflows only, no third-party SDK) delivers the marketplace motion without the engineering overhead of third-party extensibility.

**Acceptance criteria:**
- [ ] Marketplace page (accessible from /crew "Browse more" CTA) shows at least 4 agent workflows at launch
- [ ] Install flow: single click to add workflow to /crew; workflow appears immediately
- [ ] Reward badge: "Power User" badge appears in /crew UI after 30 days of marketplace agent use
- [ ] Featured agents section shows top 3 most-installed in the past 30 days
- [ ] Third-party Agent SDK: architecture is designed for it; public documentation is a stub; first third-party agents are Year 1

**Priority: MVP (constrained form)**

---

### Feature 18: Incident runbook + rollback (Trust Architecture completion)

**What it does:** Automated rollback capability for every agent action. Every published change (schema deployment, content addition, FAQ block) is stored with a revert payload. Customer can one-click rollback any action from /scans → Completed Items. The incident runbook is an internal document (not customer-facing) defining severity levels, escalation paths, and SLA for agent errors.

**Why MVP:** The Trust Architecture is non-negotiable before launch. Customers must know that a bad agent action can be undone. "One-click rollback" is the answer to "what happens if an agent does something dumb?"

**Acceptance criteria:**
- [ ] Every agent-published action stores a revert payload at creation time
- [ ] Customer can rollback any action from /scans → Completed Items with a single "Undo" button
- [ ] Rollback completes within 60 seconds for content changes; within 5 minutes for schema changes
- [ ] Rollback confirmation email sent to customer automatically
- [ ] Internal incident runbook is written (not customer-facing) before launch, covering: severity classification (cosmetic / significant / data-loss / compliance), escalation path, SLA per severity

**Priority: MVP (pre-launch requirement)**

---

## 3. User Stories

### Critical path 1: First-time visitor → /scan public → signup

**Story 1.1:** As a B2B SaaS founder who just heard about AI search visibility, I want to scan my domain for free so that I can see exactly how visible my product is in ChatGPT and Perplexity before committing to anything.

**Acceptance criteria:**
- Given I visit /scan, when I enter my domain and click Scan, then I see a score and citation breakdown within 20 seconds
- Given the scan completes, when I see my competitor is cited in 7 engines and I'm in 2, then a "Fix this" CTA is immediately visible without scrolling
- Given I click "Start free," when I complete signup, then my scan data is pre-loaded into my dashboard with `?scan_id=` parameter (no redundant scan)

**Edge case:** User scans a domain that has zero AI citations — score is 0. UI shows encouragement ("Starting from zero is normal — here's what Beamix does in the first 30 days") not failure state.

---

**Story 1.2:** As an e-commerce operator with no SEO background, I want the scan to show me my competitive gap in plain language so that I understand the problem without needing to know what "schema" or "GEO" means.

**Acceptance criteria:**
- Given the scan completes, when I view results, then no technical jargon appears in the above-the-fold view (no "structured data," no "GEO," no "citation envelope")
- Given I see a competitor listed, when I hover over their name, then a tooltip says "This brand appears in X AI engines when someone searches for [category]"
- Given I complete the scan, when I see the 3 gaps, then each gap has a plain-English action ("Add your hours and service area to your website in a format AI can read")

---

### Critical path 2: Signup → onboarding → Brief approval → first agent run

**Story 2.1:** As a new Beamix customer who just completed Paddle checkout, I want Beamix to draft my Brief for me so that I don't have to write a marketing strategy document just to get started.

**Acceptance criteria:**
- Given I complete checkout, when I arrive at Step 3 of onboarding, then I see a Beamix-authored Brief paragraph (not a blank text field)
- Given I see the Brief, when I want to edit it, then I use chip menus (not free-form writing) — covering: location, category, competitors, tone
- Given I approve the Brief, when the Seal-draw animation fires, then I see "Beamix is on it — first scan starting now" within 2 seconds

---

**Story 2.2:** As a new customer who is nervous about autonomous agents touching my website, I want to understand what will NEVER happen without my approval before any agent runs.

**Acceptance criteria:**
- Given I am in onboarding Step 3, when I click "What will Beamix change?", then a single-screen overlay shows a clear list: "Beamix will NEVER change your website without your approval. Everything goes to your Inbox first."
- Given I complete onboarding, when the first agent run completes, then my first /inbox item appears with a full preview of the change before anything is published
- Given I reject an /inbox item, when the agent re-runs with my rejection note, then I receive a new /inbox item (not a revert to the same output)

---

### Critical path 3: Sarah's weekly use (open /home → see lead attribution → close tab)

**Story 3.1:** As a 47-person business owner with 6 minutes per week for Beamix, I want the /home page to show me the one thing I need to know this week so that I can close the tab and move on.

**Acceptance criteria:**
- Given I open /home on a Monday, when the page loads, then the most important item is the first visible thing (score change or lead-attribution headline, not a nav menu)
- Given my score improved this week, when I see the delta, then I also see which specific agent action caused it (linked to /inbox completed item)
- Given I have no pending /inbox items, when I load /home, then the Inbox pointer line says "Nothing needs your attention" (not a number)

---

**Story 3.2:** As a business owner who cares about real leads (not scores), I want to see lead-attributed calls and form fills on /home so that I can connect Beamix's work to my actual business.

**Acceptance criteria:**
- Given my Twilio number has received calls, when I open /home, then the lead-attribution headline shows call count and delta vs previous month
- Given I click the KPI card for "Attributed Calls," when the detail opens, then I see a list of calls (date, duration, number — not caller identity) and the AI engine query that likely triggered the visit
- Given I have not set up Lead Attribution, when I open /home, then a non-intrusive banner says "Set up lead tracking to see how many calls Beamix is generating — takes 2 minutes"

---

### Critical path 4: Yossi's daily use (open /home → check inbox → tune crew agent → check competitors)

**Story 4.1:** As a digital agency owner managing 20 client domains, I want a multi-domain switcher so that I can move between clients without logging out and back in.

**Acceptance criteria:**
- Given I have multiple domains on my Scale account, when I click the domain switcher at the top of the sidebar, then I see all my domains with their current scores as a dropdown
- Given I select a different domain, when the page switches, then /home, /inbox, and /scans all show that domain's data within 1 second
- Given I have a new /inbox item for a specific client, when the notification appears, then it shows the client domain name (not just "1 new item")

---

**Story 4.2:** As a power user who knows which agent behavior I want to customize, I want to set custom instructions per agent in /crew so that Schema Doctor for my healthcare client behaves differently from Schema Doctor for my e-commerce client.

**Acceptance criteria:**
- Given I open /crew and click Schema Doctor, when the settings panel opens, then I see a "Custom Instructions" plain-text field (domain-specific)
- Given I type "never modify schema on the /blog subdirectory," when Schema Doctor next runs, then it skips /blog entirely and notes the skip in its /workspace log
- Given I change a per-agent autonomy level to "Full auto," when the agent runs, then the action still appears in /scans → Completed Items with a "Beamix auto-applied" label

---

### Critical path 5: The renewal moment

**Story 5.1:** As a customer at month 3, I want to receive a Monthly Update I can forward to my co-founder so that I can justify the $189/month and renew without having to explain it myself.

**Acceptance criteria:**
- Given it's the first Monday of the month, when I receive the Monthly Update email, then the first line is the lead-attribution headline ("In [month], [N] AI-attributed sessions — up [X]% vs last month")
- Given I open the Monthly Update PDF, when I read the counterfactual paragraph, then it includes a statement like "Without the FAQ additions Beamix made in February, we estimate 9 fewer attributed sessions"
- Given I click "Forward this to your team," when I forward the email, then the PDF attachment is included and the public permalink is available (but private by default — the customer must explicitly share)

---

### Critical path 6: The first incident (agent error → rollback)

**Story 6.1:** As a customer whose agent published incorrect information, I want to undo the change immediately so that my website is not showing wrong data to visitors or AI engines.

**Acceptance criteria:**
- Given an agent published a change that I realize was incorrect, when I navigate to /scans → Completed Items, then I see a "Rollback" button next to the action
- Given I click Rollback, when the action processes, then the change is reverted within 60 seconds and I receive a confirmation email
- Given the rollback completes, when I check /home, then the activity feed shows "Beamix rolled back [action] at [time]" (not silent)
- Given a content change is live on my site, when I request rollback, then the agent does not re-run the failed action automatically — it waits for my next approval

---

### Critical path 7: Marketplace flow

**Story 7.1:** As a Build-tier customer who wants a specialized agent for my SaaS product page optimization, I want to browse the Marketplace and install a workflow without needing an engineer.

**Acceptance criteria:**
- Given I open /crew and click "Browse more," when the Marketplace page loads, then I see at least 4 workflows with: name, description, estimated time-to-result, credit cost per run
- Given I click "Install" on a workflow, when the installation completes, then the new agent appears in my /crew grid within 5 seconds
- Given I have used a Marketplace agent for 30 days, when I open /crew, then a "Power User" badge appears near my name/account header

---

## 4. Success Metrics

### What success looks like — framework

Beamix's core thesis is: customers who see attributed leads renew; customers who don't, churn. Every metric below traces back to that thesis.

---

### Activation metrics (Day 0 – Day 7)

**Onboarding completion rate**
Target: ≥65% of signups complete all 4 onboarding steps (including Brief approval) within 24 hours.
Measured by: `onboarding_completed_at` timestamp vs `created_at`.
Why this target: HubSpot/Intercom benchmarks for guided onboarding completion hover at 60–70%. Below 65% indicates onboarding friction (too long, too much required input).

**Time to first evidence**
Target: <90 seconds from onboarding completion to first visible Beamix action in /home activity feed (first scan result or first /inbox item).
Measured by: time delta between `onboarding_completed_at` and first `scan_completed` event.
Why this metric: "First evidence" is the moment the product feels real. Customers who see it in the first session have 2x higher 30-day retention in similar SaaS products.

**First scan completion rate**
Target: ≥90% of signups who complete onboarding also see a completed scan within 2 hours.
Why 90%: scans failing or timing out silently is death. This is a system reliability floor, not a product target.

---

### Engagement metrics (Day 7 – Day 30)

**Monday Digest open rate**
Target: ≥40% on weeks 2–8 (after initial novelty fades).
Measured by: email open events from Resend.
Benchmark context: average SaaS transactional email open rate is 20–30%; we target 40% because the Monday Digest is plain-text and content-specific (not promotional). If open rates drop below 30%, Digest content or sending cadence needs revision.

**Weekly active rate (days with at least one /home visit)**
Target: ≥50% of customers visit /home at least once per week in weeks 2–8.
Why this target: Customers who visit once per week have dramatically higher 90-day retention than those who visit monthly. 50% weekly active in weeks 2–8 is the activation floor.

**/inbox approval rate**
Target: ≥60% of /inbox items are approved (not rejected or ignored) within 7 days of creation.
Why this matters: low approval rate = customers not trusting agent outputs OR customers not using the product. Either way, the agent content quality or review UX needs fixing.

---

### Retention metrics (Day 30 – Day 90)

**Lead Attribution loop closure rate**
Target: ≥40% of Build and Scale customers receive at least 1 Twilio-attributed call or UTM-attributed session within their first 30 days.
This is the most important early metric. Customers who close the attribution loop have dramatically higher renewal rates. 40% is achievable if the Twilio number is embedded in agent-optimized content within the first 14 days of activation.

**Monthly Update forward rate**
Target: ≥15% of Monthly Update recipients click "forward this" or download the PDF within 7 days of delivery.
Why this is the renewal-anchor metric: a customer who forwards the Monthly Update to their co-founder, investor, or team has socially committed to the product. They are 3x less likely to cancel in the following 30 days. Track as the leading indicator for renewal.

**Net Revenue Retention at 90 days**
Target: ≥90% NRR at 90 days.
Breakdown: ≤10% churn rate + ≥5% expansion (Discover → Build upgrades offsetting some churn).
Why 90%: below 90% NRR at 90 days indicates either a product-market fit problem or an onboarding failure. This is the go/no-go metric for continuing to scale acquisition.

**Free-to-paid conversion rate from /scan public**
Target: ≥8% of public scan completions convert to a paid plan within 14 days.
Benchmark context: free-to-paid conversion for vertical SaaS with a strong free diagnostic typically runs 5–12%. 8% is achievable if the scan result creates urgency (competitor gap clearly visible) and the CTA is frictionless.

---

### Growth metrics (Day 90 – Day 180)

**Marketplace agent installs per customer at 90 days**
Target: ≥25% of Build+ customers have installed at least 1 Marketplace workflow by day 90.
Why this matters: Marketplace installs are a leading indicator of product depth engagement (the Yossi motion) and increase switching cost.

**Scan public shares**
Target: ≥5% of public scan completions result in a customer sharing their scan URL within 7 days of signup.
Why: the /scan public artifact is the viral acquisition lever. 5% share rate × growing customer base creates compounding top-of-funnel.

**Referral rate**
Target: ≥10% of paid customers refer at least 1 other business within 90 days.
Measured by: coupon code usage or referral link tracking.
No formal referral program is needed at launch — this measures organic word-of-mouth, which is the primary growth channel for both personas.

---

### North star metric

**Lead Attribution Loop closure rate at 30 days** — because this single metric predicts both renewal and word-of-mouth better than any other in the funnel. A customer who can say "Beamix got me a call last week" is a customer who tells someone else. This is the metric the CEO reviews weekly.

---

## 5. Out of Scope for MVP

The following features are explicitly deferred. They appear in the Frame 5 v2 Full Vision but do not ship at wedge launch.

### AI surfaces deferred (11 text engines ship; the other 8 do not)

**Voice AI surfaces (Alexa+, Siri with Apple Intelligence, Google Assistant/Gemini-backed):** Deferred to Year 1. Scan infrastructure for voice requires a separate technical stack (audio response capture, spoken-word citation analysis). Market share is meaningful but secondary to text-AI at launch. Architecture is designed for it from day one (scan envelope schema supports voice surface type).

**Multimodal surfaces (Google Lens AI, GPT-5 vision modes):** Deferred to Year 1. Image-anchor optimization requires a different agent skillset (Visual/Multimodal Optimizer) and image-schema infrastructure not present in MVP.

**Agent-mediated browsing (ChatGPT Atlas, OpenAI Operator, Claude Computer Use):** Deferred to Year 1. Machine-readable endpoint optimization is a meaningful wedge when agent-browsing user penetration reaches ≥5% — not yet at MVP launch.

### Vertical knowledge graphs deferred (2 of 12 ship)

10 of 12 vertical KGs are deferred: local home services, healthcare, professional services, restaurants, automotive, real estate, beauty, education, fitness, and pet services. Only **B2B SaaS** and **E-Commerce SMB** ship at MVP. Each additional vertical requires a dedicated KG build (query dataset, retrieval-cluster map, Truth File schema, Brief template, compliance constraints). Year 1 target: add 3–4 more verticals based on signup distribution.

### Agents deferred (6 of the 6 MVP agents ship; 5 additional agents are Year 1)

The following agents from the 18-agent full-vision roster are deferred:
1. **Voice AI Optimizer** — Year 1 (voice surfaces deferred)
2. **Visual/Multimodal Optimizer** — Year 1 (multimodal surfaces deferred)
3. **Agent-Mediated Browsing Specialist** — Year 1 (agent browsing surfaces deferred)
4. **Citation Predictor** (standalone) — Year 1 (requires 6+ months of scan data per vertical for the ML model; runs as validation layer inside pre-publication check at MVP)
5. **Long-form Authority Builder** — MVP-1.5 (high value for e-commerce; first need to validate schema + FAQ lift in weeks 1–8)
6. **Reputation Defender** — Year 1 (continuous negative-citation scan is meaningful at scale; at MVP, Trust File Auditor covers the acute cases)
7. **Industry Knowledge Graph Curator** — Year 1 (platform-level agent; the KG itself ships at MVP as a static dataset; the agent that maintains and expands it ships Year 1)

Brand Voice Guard ships at MVP as a validation layer (inside pre-publication check) but does not appear as a standalone /crew agent until MVP-1.5 when the statistical fingerprint has been trained on 30+ days of customer content.

Content Refresher and Trend Spotter are Year 1 — they require 90+ days of scan history to be accurate.

### Platform / ecosystem features deferred

**Third-party Agent SDK:** The marketplace architecture ships at MVP (Beamix-authored workflows), but the public third-party SDK and external developer program are Year 1. No third-party agents at launch.

**Workflow Builder (DAG-style):** Year 1. The power user feature for Yossi ("if competitor X publishes Y, run Z") requires the DAG orchestration layer. Architecture supports it; UI ships Year 1.

**Predictive Layer (Citation Predictor model, Score Trajectory Forecasting, Competitor-Move Forecasting, Engine Update Impact alerts):** Year 1. The ML models require 6+ months of proprietary scan data. The Citation Predictor at MVP is a rule-based confidence signal, not a trained model.

**House Memory as queryable archive (natural-language search over history):** Year 1.5. RAG over customer history is powerful at year 2; premature at month 1.

**Content Studio (Cursor-for-content hybrid co-authoring):** Year 1.5.

**Reputation Layer (reviews, social mentions, news):** Year 1.5. TAM expansion; core product must win first.

**White-label /reports for Yossi:** Scale tier only, ships at MVP but is limited to PDF + CSV exports. Full subdomain white-label is Year 1.

**Beamix Sessions:** Year 2 (annual customer summit).

**State of AI Search annual report:** Year 1 Q4 (requires rich dataset; deferred per Q4 Frame 5 lock).

**Beamix Power User and Certified Agency programs:** Year 1 Q3 (requires 100+ customers and 5+ agencies to seed meaningfully).

**International / non-English UI:** Year 1. English only at MVP. Hebrew-language content generation is supported within agents (FAQ Agent and Brand Voice Guard handle Hebrew output) but the product UI ships in English only.

**Beamix Newsletter ("The Front Door"):** MVP-1.5. Launch the product first, then the owned media channel.

**Operators' Room (invite-only Slack community):** Year 1 Q3. Needs 50+ active customers to be meaningful.

---

## 6. Risks and Open Product Questions

### Risk 1: Trust Architecture is the critical path

The Trust Architecture (Truth File, pre-publication validation, review-debt counter, incident runbook) adds 3–4 weeks to the build timeline. If skipped or rushed, one bad agent action (wrong price published, competitor misrepresented, hours incorrect) can cause catastrophic churn and reputational damage. This is the highest-severity risk. Mitigation: Trust Architecture locks before any agent goes live against customer domains. No exceptions.

### Risk 2: Lead Attribution Loop is harder than it looks

Twilio provisioning is straightforward; the hard part is ensuring the Twilio number actually gets embedded in AI-engine-cited content. If Schema Doctor and Citation Fixer don't include the Twilio number in the right places, calls won't be attributed. The technical and content integration between the Lead Attribution Layer (L5 in the architecture) and the agent outputs needs explicit testing before launch. Mitigation: dedicated integration testing for Lead Attribution in every agent's output pipeline.

### Risk 3: Vertical classification accuracy

If domain classification into SaaS or e-commerce is wrong, the wrong vertical KG is applied. A SaaS product getting e-commerce FAQ templates is embarrassing and harmful. The 80% accuracy target for automated classification means ~20% of customers will be misclassified without a fallback. Mitigation: always offer onboarding Step 1 as a manual override ("which best describes your business?") and make re-classification available in /settings.

### Risk 4: Scan volume costs at launch

11 engines × daily/weekly scan schedules × growing customer count creates a real infrastructure cost curve. Residential IP proxy costs and browser simulation costs are variable. If the customer base scales to 500+ accounts before per-customer scan cost is optimized, infrastructure costs could outpace revenue. Mitigation: instrument scan cost per customer per engine from day one. Set a per-account scan budget ceiling; optimize the highest-cost engines first.

### Risk 5: The e-commerce vertical requires Shopify integration to reach full value

E-commerce operators running on Shopify expect product schema to be generated from their product catalog, not from a manual Truth File. Without a Shopify API integration, the e-commerce KG is significantly less powerful. At MVP, Schema Doctor generates Product schema from the Truth File (manual input). The Shopify App or API integration is MVP-1.5. This is a known limitation that may reduce e-commerce conversion relative to SaaS conversion at launch.

### Open product questions

**Q1: Multi-domain pricing for Scale tier**
The pricing model for Scale ($499) has not specified whether it includes multiple domains (Yossi's use case) or whether multi-domain is priced separately. If Scale includes 20 domains, Yossi is well-served. If Scale is per-domain, the agency use case requires a separate "Agency" tier that Frame 5 v2 explicitly deferred. This decision must be made before launch copy is written. Current assumption: Scale includes up to 20 domains. Confirm or override.

**Q2: /scan public hosting**
The /scan public surface can be hosted in this Next.js repo (apps/web/) or moved to Framer (beamix.tech/scan) for design flexibility and performance. The decision affects how the cream-paper aesthetic is maintained across updates and whether the scan result page can share components with the onboarding flow. Current assumption: /scan lives in Next.js repo (simpler deployment, shared auth context for `?scan_id=` handoff).

**Q3: Email-copy of scan results as a separate /scan/[scanId] route**
When a scan result is emailed to the customer, should clicking through go to a separate public `/scan/[scanId]` route (a second public route) or to the authenticated dashboard? If public, it can be shared; if authenticated, it is private by default. Current assumption: email CTA goes to authenticated dashboard; sharing a scan generates a separate public permalink on demand.

**Q4: Discover tier engine count and agent count**
Discover ($79) is specified as "3 engines" but it is not defined which 3. The highest-signal choice is ChatGPT, Perplexity, and Google AI Overviews — the three with the highest reach and clearest citation patterns. Locking this in before launch copy allows the Discover → Build upgrade path to be clearly messaged ("unlock 8 more engines").

**Q5: Review-debt counter threshold for "at risk" state**
The review-debt counter is visible on /home. At what count does it change visual state (e.g., turns amber at 5, red at 15)? This threshold drives customer behavior — set too low and it creates anxiety; set too high and customers miss the urgency signal. Recommend: amber at 5 pending items, red at 10. Confirm before design implementation.

---

*End of PRD v1. This document translates Frame 5 v2 LOCKED strategy into build-ready requirements. A frontend developer, backend developer, and AI engineer should be able to start from this document without asking what to build.*

*Next: hand off to Build Lead with spec path + top acceptance criteria.*
