# Beamix Frame 5 — PROPOSAL (Second Board Synthesis: Structural Reframes)
Date: 2026-04-26
Status: PROPOSAL. Adam reviews and decides. Supersedes Frame 4 v2 if locked.

**Why a Frame 5:** Adam deployed a second 4-seat board in attack mode (Operator, Investor, Customer Voice, Trust & Safety) to pressure-test Frame 4 v2. The board found structural problems — not surface-density issues like Board 1 did. Frame 4 v2 was the right diagnosis (Frame 3 too sparse) but applied the wrong cure (more density of the wrong things). Frame 5 absorbs the structural attacks and rebuilds around what the 4 attack seats independently converged on.

The four board outputs are committed alongside this doc:
- `2026-04-26-BOARD2-seat-1-operator.md`
- `2026-04-26-BOARD2-seat-2-investor.md`
- `2026-04-26-BOARD2-seat-3-customer.md`
- `2026-04-26-BOARD2-seat-4-safety.md`

---

## What the second board independently converged on (the structural attacks)

Across 4 seats with no coordination, these issues showed up in 2+ outputs:

### Convergence 1 — "11 agents" is internal architecture, not a customer feature
- **Operator:** *"Sell the chef, not the recipe. Devin and Copilot are SINGLE-CHARACTER. Beamix picked multi-character. The 11 agents = roster, not architecture."*
- **Customer Voice (Sarah):** *"11 is too many. 3 would do. The names sound like internal accounting."*
- **Investor:** *"The 11 agents are a feature surface, not depth moat — Profound copies in 6-9 months."*

→ **Reframe:** Externally Beamix is ONE product. Internally there are 11 specialized agents doing the work. The customer interacts with **Beamix** (one personality, one voice), with the roster only visible in /crew for power users (Yossi).

### Convergence 2 — Standing Order as customer-authored is wrong
- **Operator:** *"Designer fantasy. <30% complete, <10% recall at day 7."*
- **Customer Voice:** *"SEO-consultant-questionnaire trauma. Reverse the flow — Beamix drafts, customer approves."*
- **Investor:** *"Copyable in 4-8 weeks. Not a moat."*

→ **Reframe:** Drop document theater. Replace with: free /scan public runs → Beamix proposes a 1-paragraph Brief based on findings → customer approves or edits → work starts. **Beamix authors. Customer signs.** Lower friction, higher acceptance, same psychological commitment.

### Convergence 3 — Autonomous-agent-on-production-site is the existential failure mode
- **Operator:** *"CS time bomb. Profound DELIBERATELY DOESN'T FIX — that's a signal you're ignoring."*
- **Investor:** *"Death story #3. Single brand-damage event = company over."*
- **Trust & Safety:** *"FAQ Agent legal liability. Schema collision = 7-week silent CTR bleed. Hebrew medical FAQ → lawsuit. 4 safety mechanisms must lock BEFORE MVP."*

→ **Reframe:** This is the most serious finding. Beamix's "agents that execute" wedge is real BUT requires a safety architecture Frame 4 v2 doesn't have. **Either lock the safety mechanisms before launch, OR pivot to "agents that propose, humans/customers execute" until the safety rails exist.** The status quo (auto-run-post-review with no review-debt counter, no Truth File, no incident runbook) is unshippable.

### Convergence 4 — Default-public permalinks is wrong for SMBs
- **Customer Voice:** *"DEAL-BREAKER. Sarah will not share her competitive performance on a public URL."*
- **Trust & Safety:** *"Hostile attack surface — competitors scrape, embarrassing weeks get cached."*

→ **Reframe:** Flip to **default-private with explicit share**. The public surface is `/scan` (the unauthenticated free scan, runnable by anyone) — that's where viral comes from. Customer-specific digests, scans, and reports are private by default. Customers can generate a public-share link for any specific artifact when they want to share.

### Convergence 5 — Pricing ladder caps the company
- **Operator:** *"$79/$189/$499 has 2.4x and 2.6x gaps — too compressed. Scale at $499 for 20 clients = $25/client subsidizes resellers. Caps at ~$30M."*
- **Investor:** *"At Frame 4 v2's pricing, ceilings at $137-313M ARR by year 5. Need a $1,499/mo upmarket tier by year 4 to clear $1B EV."*

→ **Reframe:** Extend the ladder. Proposed shape:
- **Free** — public scan, one-time (acquisition surface)
- **Discover $79/mo** — solo SMB, 3 engines, basic agent set
- **Build $189/mo** — small SMB, 6 engines, full agent set
- **Scale $499/mo** — agency-curious or larger SMB, 11 engines, white-label digest
- **Agency $1,499/mo** (NEW) — agency operator with multi-client, dedicated workspace, true white-label, per-client billing
- **Enterprise** custom — 100+ employees, SSO, API, audit, compliance addons

This unblocks the 10x-story path the Investor required.

### Convergence 6 — The doc has 40% craft, missing distribution + lead-attribution + safety
- **Operator:** *"40% of Frame 4 is craft-for-craft. Real moats — proprietary AI engine response data, vertical knowledge graphs, distribution density, T&S rails — are NOT what Frame 4 prioritizes."*
- **Customer Voice (Sarah):** *"The renewal driver isn't score — it's 'the phone rang because of you.' That loop is missing."*
- **Trust & Safety:** *"4 mechanisms must lock before MVP — they're absent."*

→ **Reframe:** Cut 30% of Frame 4 v2's scope. Replace with:
- A **lead-attribution loop** (tracked phone numbers + tagged form fills) — the actual renewal mechanic
- A **distribution motor** (explicit pick from PLG / SEO content / partner channel / outbound / paid)
- A **first-100-customers vertical wedge** (one specific SMB sub-segment to win first)
- The **4 safety mechanisms** that lock before MVP launch
- A **proprietary AI-engine response dataset** (every scan adds to it; this becomes the data moat over time)

### Convergence 7 — The doc leans Yossi over Sarah
- **Customer Voice:** *"Frame 4 has more features for the agency operator than for the actual SMB. Sarah feels secondary in her own product."*
- **Operator:** *"Resellers should pay 4-10x what end-users pay. Frame 4 inverts this."*

→ **Reframe:** The product's primary user is Sarah (Discover/Build, the larger TAM). Yossi is a power-user variant on top, served at $1,499 Agency tier — not at $499 Scale.

### Convergence 8 — Frame 4 v2 is over-scoped for the team
- **Investor:** *"Series B spec on Series A budget. Cut 30%."*
- **Operator:** *"Plans that work only if 12 things go right. The team doesn't have 12 chances."*

→ **Reframe:** Frame 5 ships LESS, executes BETTER. Specifically: drop 4-surface chip-in-prose mechanic, drop card flips, drop hand-drawn ritual investments, drop personality voice across 11 agents at launch. Add: 4 safety rails, lead-attribution loop, vertical wedge content, distribution motor.

### Convergence 9 — Marketing copy must drop ALL jargon
- **Customer Voice:** *"Drop 'Crew', 'AI Visibility', 'GEO', 'Standing Order', 'artifacts', the 11 agent names from the front door."*
- **Operator:** *"The customer doesn't count agents."*

→ **Reframe:** External copy and marketing site language drop the internal architecture vocabulary. The front door is plain English: *"When customers ask ChatGPT for a plumber in your area, does your name come up? Probably not. Beamix fixes that."*

Internal documentation and the product's `/crew` power-user surface can keep the architectural language. The split is **front door vs. back office.**

---

## Frame 5 — The product, restated

### What it IS (one paragraph, plain English)

> Beamix scans how AI search engines see your business. When customers ask ChatGPT, Perplexity, Gemini, or Claude about businesses like yours, it tells you whether you show up — and if you don't, it does the work to fix it. Beamix runs autonomously: scanning weekly, finding gaps, drafting fixes (FAQs, schema, content tweaks). You approve the proposed fixes; Beamix applies them; you see the results in your phone calls and form submissions, tracked by Beamix. Most weeks you spend three minutes reviewing what changed. Most months you forward one update to your CEO and renew.

### What it IS NOT
- A dashboard
- A 11-named-AI-agent feature roster
- A document-signing ceremony
- A weekly auto-PDF
- A general AI marketing department
- A public scoreboard of your business's competitive performance

### The customer-facing pitch

**Front door (marketing site, /scan public, ad copy):**
> *"When customers ask ChatGPT for a plumber in your area, does your name come up? Probably not. Beamix fixes that."*

**Trial/signup CTA:**
> *"Run a free scan. We'll show you where you're missing."*

**Pricing page tagline:**
> *"Replace your $5,000/month SEO retainer with software that does the work."*

**No mention** in customer copy of: Crew, GEO, AI Visibility (use plainly), Standing Order, House Memory, agent names. Those are internal architecture terms.

---

## Frame 5 architecture (the corrections to Frame 4 v2)

### 1. The Brief (replaces Standing Order)
After the user runs a free /scan and signs up, Beamix generates a 1-paragraph **Brief** based on what it found. Plain English, customer-specific:

> *"Beamix recommends focusing on showing up when local plumbing questions are asked on ChatGPT and Perplexity. Your homepage doesn't have FAQ schema; we'll add it. Three of your competitors are cited more often than you on emergency plumbing queries; we'll respond. Don't let us change your brand voice without asking."*

The user reads, edits any sentence they disagree with (chips appear on click for editable phrases), approves with one button. Beamix authors. Customer signs. Total time: ~60 seconds.

### 2. Beamix as one product, with internal roster (replaces 11 named agents on the front door)
- The customer interacts with **Beamix** (one voice, one personality).
- Internally 11 specialized agents exist; visible only in `/crew` for power users.
- All Inbox items, scans, and reports say "Beamix did X" — not "Schema Doctor did X."
- The /crew page is for Yossi who wants to see the org chart; Sarah may never visit.
- This is the Devin / Copilot Coding Agent pattern (single-character externally, multi-agent internally). R2 north star applied properly.

### 3. The Lead Attribution Loop (NEW — replaces score-as-renewal-mechanic)
Sarah doesn't care about score. She cares about whether her phone rang. Beamix needs to make this loop visible:

- **Tracked phone numbers**: at signup, Beamix issues the customer 1-3 trackable forwarding phone numbers (Twilio or similar). The customer puts them on landing pages or AI-engine answers Beamix optimizes for. Calls forward to the real number; Beamix logs the source.
- **Tagged form submissions**: Beamix-recommended FAQ entries include a UTM-style tag; form-fill events with that tag are attributed.
- **Monthly Update** (rebranded from Weekly Board Report) opens with: *"This month: 47 calls and 12 form submissions came in through Beamix-attributed channels. That's up from 23 last month."*

This is the renewal mechanism. Score is a leading indicator; calls/leads is the lagging indicator that justifies the spend.

### 4. The Monthly Update (replaces Weekly Board Report)
- **Frequency**: monthly, not weekly. Customer Voice: *"Weekly is too frequent. My CEO doesn't read weekly auto-PDFs."*
- **Format**: 1-page email + permalink. Lead-attribution numbers as the headline. Score and engine coverage as supporting data. 3 specific things Beamix did this month with rollback links. Plain English, no agent names.
- **For Yossi at Agency tier**: same artifact, white-labeled, generated per-client.

The Monday Digest (weekly, casual, friendly) survives as the operator-facing channel. The Monthly Update is the forward-to-the-CEO artifact.

### 5. Default-private with explicit share (replaces default-public permalinks)
- All customer-specific artifacts (digests, scans, Monthly Updates) are **private by default**.
- Each artifact has a "Generate share link" button → produces a public URL the customer can send.
- The viral surface is `/scan` (unauthenticated, anyone can run).
- Yossi at Agency tier renders his client digests at his subdomain; client-by-client privacy controlled by Yossi.

### 6. The Trust Architecture (NEW — Trust & Safety's 4 mechanisms LOCK before MVP)
1. **Customer Truth File**: mandatory onboarding step. Customer uploads/types canonical facts about their business — hours, services, locations, key claims. Every agent action references this file. Hallucinations are caught at validation.
2. **Per-agent class pre-publication validation**: every agent output passes automated checks before going live. FAQ Agent's output checked against Truth File + brand-voice fingerprint. Schema Doctor's output validated against existing schema (no collisions).
3. **Review-debt counter**: tracks how much auto-run-post-review work has piled up un-reviewed. At threshold (e.g., 8 items un-reviewed for >5 days), agents PAUSE auto-run and require explicit catch-up. Prevents "Sarah didn't look = silent approval."
4. **Incident-response runbook**: published SLA. When customer flags damage (broken site, wrong content, brand violation), Beamix has a documented response pipeline including rollback, audit, customer-facing apology, RCA. E&O insurance posture clarified before MVP.

The 3 additional safety mechanisms (brand-voice fingerprinting, reversal-by-default 30-day sunset, agent-disagreement protocol) ship in MVP-1.5.

### 7. Pricing ladder rework
- **Free**: public scan, one-time. Acquisition surface.
- **Discover $79/mo**: 3 engines, 4 agents active, weekly scan, monthly update.
- **Build $189/mo**: 6 engines, full agent set, weekly scan, weekly digest + monthly update, lead-attribution loop, competitor monitoring (1).
- **Scale $499/mo**: 11 engines, full agent set, daily scan, full lead-attribution suite, competitor monitoring (5), Citation Predictor (R1 gap).
- **Agency $1,499/mo** (NEW): 20 client workspaces with white-label, multi-client digest authoring, per-client subdomain rendering, agency dashboard, dedicated CSM (Phase 2).
- **Enterprise** custom: 100+ employees, SSO, API, audit, compliance addons, SLA.

The Investor's $1,499/mo upmarket and the Operator's "Scale-as-reseller-loophole" concern are both addressed.

### 8. The first-100-customers vertical wedge (NEW — needs Adam's choice)
Operator: pick a vertical. Without one, marketing copy can't be sharp and the agents can't be optimized.

Top 4 candidate verticals (need to be evaluated for: TAM size + GEO pain intensity + reachability + Adam's domain affinity):
- **Local home services** (plumbers, electricians, HVAC, locksmiths). Estimated 3M businesses in US/EU. High AI-search pain (emergency queries). Low tech sophistication. Easy reach via local SEO content.
- **Local healthcare clinics** (dentists, physical therapists, dermatology). High lift, strict compliance (HIPAA, regulated content). Higher willingness to pay. Trust & Safety risk highest.
- **Boutique B2B SaaS (10-50 employees)**. Highest sophistication, smaller TAM, but easiest to reach via PLG/content. Yossi-adjacent.
- **Local professional services** (lawyers, accountants, financial advisors). Regulated content (high T&S risk), moderate TAM, very high willingness to pay.

**Recommendation: Local home services.** Largest TAM, lowest T&S risk class, sharpest pain ("emergency plumbing near me" → ChatGPT answers), reachable through local SEO content + paid local ads. **Adam's call.**

### 9. The distribution motor (NEW — needs Adam's choice)
Operator: pick from 9 motors. Without one, growth is luck.

Top 3 candidates for SMB at this price point:
- **Content-led PLG**: Beamix publishes industry-specific GEO playbooks ("How plumbers show up in ChatGPT") that rank for the early-adopter queries. Free /scan as the conversion surface. Slow but compounding. Best for software-first competitors.
- **Local agency channel**: 1,000-3,000 small marketing agencies in US/EU could resell Beamix at a margin. Reach them via cold outbound + agency-targeted webinars. Faster GTM but requires Agency tier ($1,499/mo) and channel-management.
- **Vertical-specific paid**: Google/Meta ads on "show up in ChatGPT" + similar terms, targeted to the chosen vertical (e.g., plumbers). Fast feedback loop. Higher CAC.

**Recommendation: Content-led PLG primary, Agency channel secondary at $1,499 tier, paid as accelerant.** All three eventually but content-PLG is the only one that compounds without ongoing capital.

### 10. The data moat (NEW — proprietary AI-engine response dataset)
Operator: real moats include "proprietary AI engine response data." Beamix runs 1,000+ scans per customer per month across 11 engines on hundreds of queries. **That's a proprietary dataset on what AI engines actually answer for SMB-relevant queries — and how those answers change over time.** No competitor has it (Profound has bigger but enterprise-focused).

This dataset becomes:
- The training signal for Beamix's own optimization agents (House Memory, but at the platform level)
- A separately monetizable product layer (industry reports, "State of GEO" newsletter — *deferred per Adam's prior memory*)
- The defensibility moat that compounds with customer count

**Action**: even at MVP, every scan output is structured and stored as part of the platform corpus, not just per-customer.

---

## Page-by-page deltas (Frame 5 vs Frame 4 v2)

### `/home`

**Above the fold (FRAME 5, simplified from Frame 4 v2):**
1. **Lead-attribution headline** — *"This month: 23 calls and 8 form submissions came in through Beamix. Up 4x vs March."* — the renewal-driving number
2. **Score + delta** — secondary, below leads
3. **3-evidence cards** — *"Beamix added 11 FAQ entries this week — applied"*. NO agent names. NO Activity Ring (Designer's flourish that's craft, not moat).
4. **Decision card** — conditional

**Below the fold:**
- Engine quick-strip (tier-aware)
- Score 12-week sparkline
- This week's net effect (paragraph)
- Recent activity list (signed "Beamix")
- Receipts list (House Memory rendered)

**Killed**: Standing Order excerpt, Crew at Work strip with 11 monograms, Crew Traces (the Designer's faint underlines — pretty, not moat).

### `/inbox`

Items framed as "exceeds your Brief" — pending changes the customer needs to approve. Each: what Beamix proposes, why, the diff, Approve / Reject / Modify. Review-debt counter visible: *"You have 3 items un-reviewed since last week. Beamix will pause auto-run if 5+ stay un-reviewed for 5 days."*

### `/workspace`

Demoted further. Reachable via "watch what Beamix is doing" link. Linear-grade clarity. NO agent names; just "Beamix is working on FAQ updates."

### `/scans`

Stripe table. Four work-attribute lenses (Done / Found / Researched / Changed) survive as filters. NO public-permalink-by-default; "share this scan" button generates link on demand.

### `/competitors`

Clean table. Rivalry Strip as depth view. Each row references the Brief clause that named the competitor.

### `/crew` (Power-user surface — Yossi, optional)
THE one place the 11-agent architecture is visible. People-page format. Sarah may never visit. Yossi uses for tuning per-agent autonomy and composing client digests.

For Sarah, /crew is just "Behind the scenes — meet the specialists doing the work" — visited once for curiosity, never again.

### `/schedules`, `/settings`, `/scan` (public)

Unchanged from Frame 4 v2.

### `/onboarding` (rebuilt — "Brief approval" replaces "Standing Order signing")

1. **Step 1 — Confirm the basics** (≤30s): pre-filled from /scan public.
2. **Step 2 — Set your phone numbers / form tags for lead attribution** (≤30s): Beamix issues 1-3 forwarding phone numbers, generates UTM tags. **Skip allowed; can add later.**
3. **Step 3 — Approve your Brief** (≤90s): Beamix's first scan ran during steps 1-2; its output is presented as a 1-paragraph Brief. Customer reads, edits any sentence (chips appear on click), approves.
4. **Step 4 — Upload your Truth File** (≤60s): mandatory. Customer types or uploads canonical facts about their business. Used by every agent for hallucination prevention.
5. **Magic moment**: /home loads with first agent action already in progress. *"Beamix is fixing 3 schema errors right now. We'll send you a Monday digest."*

### `/reports` → repositioned as "Monthly Update + on-demand exports"

- **Monthly Update**: auto-generated, 1-page email + permalink, lead-attribution headline, monthly cadence
- **On-demand export**: user generates point-in-time PDF for any date range
- Yossi at Agency tier: white-label both, render at his subdomain

---

## Open questions for Adam (the structural ones — these block Frame 5 lock)

1. **The "billion-dollar" definition.** Investor flagged: Frame 5 ceilings at $137-313M ARR by year 5 = $1.2-2.4B EV at 8x. **Billion by EV (valuation)? Or billion by ARR (revenue)?** They imply different roadmaps. EV-billion is plausible at 5-8% probability with Frame 5; ARR-billion requires substantially more (international expansion, second SKU, Enterprise tier, agency channel productization). **Pick one.**

2. **Vertical wedge for first 100 customers.** Local home services / local healthcare / boutique B2B SaaS / local professional services? My recommendation: home services. **Your call; this becomes the marketing-content investment.**

3. **Distribution motor primary pick.** Content-led PLG / Agency channel / Vertical paid? My recommendation: PLG primary, Agency channel secondary, paid accelerant. **Your call; this is the GTM hire profile.**

4. **Pricing ladder.** Add Agency $1,499/mo and Enterprise custom tiers? My recommendation: yes. **Your call.**

5. **Commercial co-founder / CRO timing.** Investor's specific call: hire by month 9. The "AI agents replace GTM humans" thesis hasn't been validated at vertical SaaS scale. **Your call; this challenges the small-team thesis.**

6. **The trust architecture lock-before-MVP.** 4 safety mechanisms: Truth File, pre-publication validation, review-debt counter, incident runbook + E&O insurance posture. Trust & Safety says these CANNOT be deferred to MVP-1.5. **Confirm — and we add ~3-4 weeks to MVP build for the safety rails, OR we ship without and accept the risk.**

7. **Single-character vs multi-character on the front door.** Frame 5 says single-character ("Beamix did this") externally with the 11-agent roster only in /crew. Frame 4 v2 said multi-character everywhere. **Confirm the single-character flip.**

8. **Default-private permalinks.** Customer Voice says deal-breaker. Frame 5 flips to default-private with explicit share. **Confirm.**

9. **Brief authorship — Beamix-drafts vs customer-writes.** Frame 5 says Beamix drafts; customer approves. Frame 4 v2 said customer-authored guided assembler. **Confirm the reversal.**

10. **30% scope cut.** Investor + Operator agree Frame 4 v2 is over-scoped. Specific candidates to cut: Activity Ring, Crew Traces, the 4-surface chip-in-prose mechanic, all card-flip/animation craft, hand-drawn ritual investments beyond /scan public. **Confirm the cuts; OR push back on which to keep.**

---

## What this preserves and what it kills from Frame 4 v2

### Preserved (the real wins of Frame 4 v2)
- Above-the-fold has explicit evidence of work (just no agent names on it now)
- Hybrid email cadence (weekly digest + event-triggered + monthly)
- Trust gradient by user age
- Tier visibility on the surface
- /scan public 10-frame storyboard (acquisition surface)
- /reports white-label PDF (now as Monthly Update)
- Stripe-table page surfaces

### Killed/replaced from Frame 4 v2
- Standing Order (customer-authored) → **Brief (Beamix-authored, customer-approved)**
- 11 agent names on every surface → **"Beamix" everywhere except /crew**
- Default-public permalinks → **default-private with explicit share**
- Weekly Board Report → **Monthly Update**
- Activity Ring + Crew Traces → **dropped (craft, not moat)**
- The four work-attribute lenses on /home depth → **kept on /scans only (not surfaced on /home)**
- Score as renewal mechanic → **lead-attribution loop as renewal mechanic**
- "AI Visibility Crew" customer-facing → **"Beamix" customer-facing; "AI Visibility Crew" is internal**
- Pricing 3-tier → **5-tier (Free / Discover / Build / Scale / Agency / Enterprise)**

### NEW in Frame 5 (the 4-board attacks absorbed)
- **Lead Attribution Loop** (tracked phone numbers, tagged forms — Customer Voice's renewal mechanic)
- **Customer Truth File** (mandatory onboarding — Trust & Safety mechanism #1)
- **Pre-publication validation** (every agent output checked — T&S #2)
- **Review-debt counter** (auto-pause when un-reviewed work piles up — T&S #3)
- **Incident-response runbook** (published SLA, RCA process, E&O insurance — T&S #4)
- **Brief** (Beamix-authored, customer-approved — replaces Standing Order)
- **Monthly Update** (lead-attribution headline — replaces Weekly Board Report)
- **Vertical wedge content** (first 100 customers from one vertical — Operator's first-100 fix)
- **Distribution motor** (PLG/Agency/Paid pick — Operator's GTM motor fix)
- **Pricing ladder extension** (Agency $1,499 + Enterprise — Operator + Investor)
- **Proprietary AI-engine response dataset** (every scan adds to platform corpus — Operator's data moat)

---

## What this means for the build path

### Tier 0 — Pre-MVP (lock before any build)
1. Adam answers Q1-10 above
2. Trust & Safety architecture: Truth File schema, pre-publication validation rules, review-debt counter logic, incident runbook
3. Pricing ladder confirmed
4. Vertical wedge confirmed; first vertical-specific Brief template drafted
5. Distribution motor confirmed; first content piece (e.g., "How [chosen vertical] businesses show up in ChatGPT") commissioned

### Tier 1 — Foundation
- Status Token component (3 states)
- Decision Card component
- Trust-tier router (with review-debt counter integrated)
- Truth File schema + onboarding step
- Lead-attribution loop infrastructure (phone numbers + tag system)
- Pre-publication validation framework
- /scan public (locked storyboard)
- Beamix-as-one-product copy across all surfaces

### Tier 2 — Primary surfaces
- /onboarding (new 4-step Brief approval flow)
- /home (lead-attribution headline above-the-fold)
- /inbox (with review-debt visibility)
- /scans (Stripe table + 4 lenses on filters)

### Tier 3 — Secondary
- /competitors, /crew (power-user), /schedules, /settings
- Monday Digest + Monthly Update templates
- Public permalink generator (on-demand)

### Tier 4 — Agency tier ($1,499)
- Multi-client workspace
- Per-client white-label rendering at subdomain
- Agency dashboard
- Per-client billing

### Tier 5 — Enterprise
- SSO, API, audit, compliance addons, SLA

---

## The closing

Frame 5 ships less, executes harder, and is honest about what's a moat vs what's craft. It absorbs every structural attack from the second board and corrects the customer-voice-misalignment Frame 4 v2 had. It preserves the wins of Frame 4 v2 (above-the-fold density, hybrid email, trust gradient) while removing the parts the second board credibly identified as Series-B-spec-on-Series-A-budget.

The four board outputs are committed. The 10 open questions are surfaced. Adam's call.

---

*End of Frame 5 PROPOSAL. 4-seat board synthesis. Adam locks or revises.*
