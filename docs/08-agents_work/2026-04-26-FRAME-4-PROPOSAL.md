# Beamix Frame 4 — PROPOSAL v2 (Positioning Locked: AI Visibility Crew, as SaaS)
Date: 2026-04-26
Status: PROPOSAL v2. Positioning locked by Adam. Architecture pending final lock on 5 sub-decisions.

**Changelog from v1 (committed earlier today):**
- v1 had two paths: "firm rendered as software" (Visionary's pitch) vs "managed service with rich evidence" (PM/Designer/User Researcher). Adam resolved to neither — locking **AI Visibility Crew, as SaaS**.
- "Firm" terminology dropped (it implied human service delivery). Replaced with "AI Visibility Crew."
- Analogues updated: Pilot/Mercury/Stripe Atlas (have humans) → GitHub Copilot Coding Agent / Devin / Lindy / Notion Custom Agents (pure software, agents-as-teammates).
- Frame 4.5 alternative section deleted (resolved by positioning lock).
- Three new artifacts added per Adam's direction:
  - **The Weekly Board Report** — separate from Monday Digest; for forwarding to management/clients
  - **Four work-attribute lenses** (Done / Found / Researched / Changed) — depth structure for /home + per-agent profile pages
  - **Agent attribution everywhere** — every action carries the agent's signature
- R4 research validation added (GEO category data).

---

## The locked positioning

**Beamix is your AI Visibility Crew. Eleven AI specialists working autonomously to make sure your business shows up when customers ask AI engines about you. They scan, diagnose, fix, monitor competitors, draft FAQs and content, and report progress. You watch the work and approve key decisions. No agencies. No marketing teams. One AI department for one specific job: showing up in AI search.**

**External (customer-facing):** "Your AI Visibility Crew"
**Industry/SEO-facing:** GEO (Generative Engine Optimization)
**Domain (technical):** AI Search Optimization

### The 3 segment-specific pitches

| Segment | Pitch | Substitution math |
|---|---|---|
| SMB without an SEO team | *"Get the AI marketing department you couldn't afford — focused on showing up when AI is asked about you."* | Net new spend; price compares to $0 prior. |
| SMB with an SEO/GEO agency on retainer | *"Replace your $5-20K/mo SEO/GEO retainer with an AI crew at $189/mo. Same outcomes, focused on AI search."* | $5-20K/mo → $189/mo = 96-99% cost reduction. Validated by R4 research. |
| Agency operator (Yossi, Scale tier) | *"Run AI Visibility Crews for 20 clients on Beamix's infrastructure, white-labeled at your subdomain. Weekly board reports auto-sent."* | $499/mo for 20 clients = $25/client/mo at zero marginal labor. |

---

## Validated by R4 research (April 2026 GEO category data)

Five HIGH-confidence findings validate the positioning:

1. **GEO is a real, fast-growing category.** $1B (2025) → $17-20B (2034) at 40-50% CAGR. $1.4B VC investment in 2024-2025. ChatGPT 900M weekly active users. AI Overviews 1.5B monthly users. YC ranked AI-native agencies #3 in Spring 2026 RFS.
2. **SMBs are losing leads silently.** Gartner: 25% organic search decline by 2026, 50% by 2028. Where AI Overviews appear, organic CTR drops 61%. AI-referred traffic converts 4.4-5x better than Google organic. Early GEO adopters get 6.6x higher citation rates.
3. **Price gap is real and large.** Tools $29-399/mo (passive dashboards). Agencies $1,500-15,000/mo (humans doing work). Beamix at $79-499 with executing agents fills the unfilled middle.
4. **"AI Visibility" is the right customer-facing language.** SMBs don't search "GEO." They search "show up in ChatGPT." Use "AI visibility" externally, "GEO" in industry/SEO content.
5. **Narrow positioning wins.** Vertical SaaS commands 25-30% valuation premium (8.6x vs 6.7x rev multiples). No category-defining SaaS started broad. "AI Marketing Department" would mean fighting HubSpot/Klaviyo with their distribution; "AI Visibility Crew" creates an open category.

Full research at `docs/08-agents_work/2026-04-26-R4-geo-positioning.md`.

The one caveat the researcher flagged: *"the positioning only works if the product actually delivers outcomes, not just dashboards."* Beamix's executing agents satisfy this precondition.

---

## Why a Frame 4 (the diagnosis the 4-seat board agreed on)

Adam's instinct on Frame 3: **too minimalistic at the surface.** All 4 board seats independently confirmed:

- **PM** — *"At $189-499/mo, Frame 3's above-the-fold communicates 'one thing is happening' when the value proposition is 'many things are happening simultaneously.' The calm at the surface is indistinguishable from inactivity."*
- **Designer** — *"'One sentence and one number' is a spec, not a visual. Frame 3 confuses 'calm' with 'empty.' Stripe is also 'a few numbers and charts' — but Stripe's are perfectly specified."*
- **User Researcher** — *"Stripe / Linear / Vercel are calm-and-dense. Frame 3 is calm-and-empty."*
- **Visionary** — *"Frame 3 is organized around a layout (Status / Decision / Number), not a worldview. Layouts don't define categories. Worldviews do."*

The 7 cross-seat agreements on the FIX:

1. Above-the-fold needs explicit, dated, sayable proof of work
2. Tier visibility on the surface (gated engines visible)
3. /crew is NOT a roster museum with card flips
4. Onboarding = DELIVERED work, not promised work
5. Hybrid email cadence (weekly + event-triggered + monthly renewal)
6. Depth defaults age with the user
7. Score-drop messaging: name cause + response + timeline

---

## Frame 4 — Your AI Visibility Crew, as SaaS

### The metaphor (clean)

Beamix is **a SaaS where the product is presented as a working AI team.** Eleven named, accountable agents with distinct scopes. They run continuously in the background — no humans behind them, no service delivery, no CRM. The customer experiences having hired an AI department for one specific outcome: showing up in AI search.

**The right software analogues** (correcting Visionary v1's analogue set):

| Drop (have humans) | Add (pure software, agents-as-teammates) |
|---|---|
| Pilot, Mercury, Stripe Atlas | **GitHub Copilot Coding Agent** — appears as contributor in same lists as humans, opens PRs, no human behind it |
| | **Devin (Cognition)** — autonomous AI engineer, sessions are work units, posts to Slack like a teammate |
| | **Lindy** — multi-agent SaaS, agents framed as colleagues with names and scope |
| | **Notion Custom Agents** — autonomous teammates with auditable run logs |

R2 research validated the pattern: *"The agents should not have a home. The product IS their home."*

### The signature elements

#### 1. The Standing Order (renamed positioning, mechanic intact)
A short written agreement between the user and their AI Crew, in plain English, defining what the crew is for. Persistent at top of /home as 2-line excerpt with "Read the full order →" link. Referenced in every digest email. Editable; edits preserved as versioned letters.

**MVP delivery: Guided Assembler, NOT free-form text.**
- Onboarding presents 5-8 chip-menus that fill in the blanks of a sentence template.
- Output reads as prose: *"I want my crew to **get cited on ChatGPT and Perplexity for plumbing-Tel-Aviv queries**. The most important AI engines for me are **ChatGPT, Perplexity, Gemini**. Don't change my brand voice without asking."*
- User signs (animated pen-stroke). Order persists.
- Yossi at Scale can edit free-form for richer per-client orders.

#### 2. Signed Status Sentence (replaces bare status)
Status reads as the crew speaking, not a system reporting:
- *"This week we shipped 6 fixes. Score is 78, up five. Nothing needs you. — your crew"*
- Color-coded by state (green/blue/amber).
- During score drops, User Researcher's anti-anxiety pattern: cause + response + timeline.
  *"Score dipped 4 points — Profound published 12 new comparison pages. Citation Fixer is generating responses. Expect recovery within 2 weeks. — your crew"*

#### 3. Evidence Strip + Activity Ring
Below the signed status, above the fold. Two integrated moves:

**Evidence Strip** — 3 timestamped agent-action cards in a horizontal row. Each: *agent + verb + object + timestamp + status*. Plain Inter, click to expand inline. Tier-aware: 3 cards on Discover/Build, 5 cards on Scale.
- *"Schema Doctor fixed 3 markup errors on /pricing — Tue 10:14am — applied"*
- *"Citation Fixer added 11 FAQ entries — Wed 4:02am — applied"*
- *"Competitor Watch found you pulled even with Profound — Thu 8:30am — observed"*
- Quiet weeks: *"Quiet week — your crew ran 6 monitoring checks; nothing needed action."*

**Activity Ring** — 2px stroke ring (#3370FF) circling the score number with a hand-drawn gap. Gap pulses (1200ms breath) when agents are working, static when idle. The product's screenshot-able signature.

#### 4. Crew Traces (ambient evidence)
Faint Rough.js underlines below text agents have recently modified. Roughness 0.6, #3370FF at 30% opacity. Not labeled. Power users (Yossi) learn them; Sarah doesn't need to.

#### 5. House Memory (the SaaS flywheel — pure software)
Every approval, rejection, margin note, and Standing Order edit is stored as structured agent-account memory. Software flywheel, no humans:
- Rejected suggestions train per-account agent constraints
- Inbox shrinks as agents pre-empt rejections
- 12-month correspondence accessible on /home Section 6 (Receipts list)
- Phase 2: aggregated learning across accounts (anonymized, opt-in) → "Other businesses in your category solved this by..."

This is the compounding asset Frame 3 lacked. Sarah doesn't leave because alternatives don't know her.

#### 6. Public Permalinks (the viral surface)
Every digest, every scan, every report has a permanent URL. Default-public with per-user toggle to private (decision for Adam — see open questions). Renders as beautifully-typeset shareable pages.

For Yossi at Scale: digests, scans, and Board Reports render at his white-label subdomain.

#### 7. Margin Note + Open Question (connection mechanics)
- **Margin Note** — annotate any digest/scan/report. Note enters House Memory; agents read it. Next digest references it: *"We saw your note about brand voice. Citation Fixer adjusted accordingly."*
- **Open Question** — bottom of every digest: "Anything you want to ask your crew?" One text area. Async, not chat. Next digest answers.

These replace Frame 2's notebook-as-personality and Frame 3's no-direct-channel.

#### 8. Hybrid email cadence
- **Weekly Monday Digest** — friendly, signed by crew, references Standing Order, links to permalink. Casual, story-form.
- **Event-triggered brief** — score moves >3 points OR competitor change OR high-confidence agent flag. Max 1 per 48hrs.
- **Monthly Renewal Email** — sent 7 days before billing. Generates the "sayable sentence" for renewal.

#### 9. **Weekly Board Report** (NEW — distinct from Monday Digest)
The artifact Sarah forwards to her CEO. The artifact Yossi sends to his client. Two different audiences from the Monday Digest, so it's a different artifact:

| Artifact | Audience | Voice | Format |
|---|---|---|---|
| **Monday Digest** | The user (operator) | Casual, signed by crew, story-form | 5-7 sentences in plain email |
| **Weekly Board Report** | The user's CEO/board/clients | Formal, executive-summary, data-rich | One-page PDF + permalink, Stripe-Press grade |

**Board Report contents:**
- Header: business name, week dates, Beamix branding (or white-label on Scale)
- KPI grid: Score (current + delta), Mentions, Citations, Engine coverage, Competitor delta
- 12-week trend chart (single line graph)
- "What we did this week" — 3-5 specific agent actions summarized for executives
- "What changed in your AI search visibility" — 1-2 paragraphs
- "What's next" — 1-2 sentences
- Signed by "Your AI Visibility Crew" with the agents who contributed listed below

**This is a major Yossi value-prop.** He stops writing client emails because Beamix wrote them. Each Board Report is a permalink — recipients see Beamix's brand (or Yossi's white-label) every week. **That's distribution.** The viral channel Frame 3 missed.

#### 10. Agent attribution everywhere (cross-cutting principle, NEW)
Per Adam's direction: *"users follow along and read all of the things that the agents have done, found, researched, changed."* Concretely:

- Every Inbox item: *"Citation Fixer drafted this on Tue 14:02."*
- Every change in /scans: *"Schema Doctor applied at Tue 14:02."*
- Every competitor finding in /competitors: *"Competitor Watch noticed Friday."*
- Every recommendation: *"FAQ Agent suggested this Wednesday."*
- Click any agent name anywhere → opens that agent's profile page (full history, scope, settings).

Attribution is the trust mechanism. Sarah doesn't need to read everything — but knowing every line is signed builds confidence.

#### 11. The four work-attribute lenses (NEW — depth structure)
Per Adam's direction. Every page exposes work in 4 lenses:

| Lens | Definition | Lives on |
|---|---|---|
| **Done** | Actions taken (drafts, schema fixes, FAQs added) | /inbox (pending review) + /scans (applied) |
| **Found** | Discoveries (gaps, opportunities, risks) | /scans drilldowns + /home Section 7 (insights) |
| **Researched** | Analysis output (competitor moves, query trends) | /competitors + per-agent profile pages |
| **Changed** | Modifications applied to user's site (with rollback) | /scans Completed Items + per-change permalinks |

These become tabs/filters on the per-agent profile page: click "Schema Doctor" → see Done / Found / Researched / Changed for that agent.

#### 12. Tier-visible UI
Above the fold on /home includes a single-line tier badge: *"Build plan — 6 engines, 8 agents active. Add competitors and 3 more engines on Scale →"*. Per-engine strip below the fold shows grayed-out gated engines. Activity Strip is tier-aware (3 cards on Discover/Build, 5 on Scale).

#### 13. Trust gradient (depth defaults age with user)
- Week 1-2: first Evidence Card auto-expanded. Tip: "Click to see what we did."
- Week 3-4: all cards collapsed; tip persists.
- Week 5+: cards collapsed, tip removed.
- Yossi: verbose default permanently (operational use).

---

## Page-by-page deltas vs Frame 3 LOCKED

### `/home` (most significant rebuild)

**Above the fold:**
1. Standing Order excerpt — 2 lines, InterDisplay 22px, soft grey
2. Signed status sentence — Inter 28px, signed "— your crew", color-coded
3. Score with Activity Ring (72px tabular) + delta + "calculated against N queries — Methodology →"
4. Evidence Strip — 3 timestamped agent-action cards (5 on Scale)
5. Decision Card — conditional, signed empty state if absent
6. Tier badge — single line ("Build plan, 6 engines, 8 agents — see what Scale adds →")

**Below the fold:**
7. Crew at Work — 11 agent monogram circles, pulsing if active. Hover for activity.
8. KPI cards row — Mentions / Citations / Competitor Delta / Engine coverage (4 cards, all-time + this-week)
9. This Week's Net Effect — single paragraph plain English
10. Score 12-week sparkline with hover-tooltips
11. Per-engine strip — tier-aware, gated engines grayed with upgrade hover
12. **Crew Traces** appear throughout below-fold text on items recently modified (≤24h)
13. **The Receipts list** — reverse-chronological digest/scan/Board-Report list, each with permalink icon (House Memory rendered)
14. Goal track — "67% of the way to [Standing Order clause]"
15. Next scheduled scan + next digest send

### `/inbox`

Frame 4: items framed as "exceeds your Standing Order." Inbox shows things the crew flagged BECAUSE they go beyond what the user pre-authorized. Items reference relevant clause. Approve/reject feeds House Memory; rejections optionally prompt "what was wrong?" → permanent agent constraint. **Every item attributed to its agent.**

### `/workspace`

Frame 4: demoted; accessible via "watch your crew work" link from /home Crew at Work strip. Linear-grade clarity. Agent attribution at the top of every step.

### `/scans`

Frame 4: Stripe table with the four lenses (Done / Found / Researched / Changed) as filters. Every row has a public-permalink icon. Click → opens public scan page. **Every action attributed.**

### `/competitors`

Frame 4: clean table primary. Rivalry Strip survives as depth view on row click. Each competitor row references the Standing Order clause that named it. **Every insight attributed to Competitor Watch agent.**

### `/crew`

Frame 4: rebuilt as the crew's people-page (per Visionary, in SaaS framing):
- "Your crew. 11 specialists working under your standing order."
- Roster list — agent name, role, what they did this week (in their own voice — *"I added 11 FAQ entries this week"*), success rate, attribution to Standing Order clauses.
- Click agent → agent's profile page with the four lenses (Done / Found / Researched / Changed) as tabs. Full work history, scope, settings, conversation log.
- Yossi: same page + "Compose this week's Board Report for client X" affordance.

### `/schedules`

Frame 4: unchanged from Frame 3 (calm admin table, no Sentence Builder).

### `/settings`

Frame 4: unchanged from Frame 3 (Stripe-replica forms, no Letter). New tab: **Standing Order** — full edit view of the user's order with version history.

### `/scan` (public)

Frame 4: unchanged from prior locked storyboard. Permalink renders as a public scan page on every shared scan URL.

### `/onboarding` (significant rebuild)

Frame 4 — "Hiring Your AI Visibility Crew":
1. Step 1 — Confirm the brief (≤30s): pre-filled from /scan public flow.
2. Step 2 — Sign your Standing Order (≤90s): guided assembler with 5-8 chip menus. Output is prose. User signs (animated pen-stroke).
3. Step 3 — The crew responds (the wow): /home loads with Standing Order excerpt at top + first agent's first finding pre-populated as Evidence Card #1. 11 agent monograms appear at bottom of fold one at a time, each with one-line introduction. *"We received your standing order. The crew is reading your homepage now. We'll send our first digest on Monday. — your crew."*

The "delivered work, not promise" pattern (User Researcher) inside the AI Crew framing.

### `/reports` (RENAMED to better describe what it is)

Frame 4: kept in scope. Generates two artifact types:
- **Weekly Board Reports** (auto-generated weekly, stored history)
- **On-demand snapshots** (point-in-time, custom date range)

Tool surface stays workmanlike (form). Artifact (PDF + permalink) is Stripe-Press grade. White-label override on Scale tier — Yossi's branding.

---

## Cross-cutting principles (Frame 4)

1. **Agent attribution everywhere.** Every action, finding, change, or recommendation carries the agent's signature. Click name → agent profile.
2. **Outcomes over process.** Show what changed; hide how it was done. Process is one click away; never primary.
3. **Calm tone, dense information.** Calm comes from visual hierarchy and low urgency, not from absence of content.
4. **Email is a primary channel, not a fallback.** Monday Digest + Weekly Board Report + event-triggered briefs + monthly renewal.
5. **Public permalinks make the product viral.** Every digest, scan, Board Report has a URL. Sharing = marketing.
6. **House Memory compounds.** Every interaction trains the crew on this account. Switching cost grows with time.

---

## Open questions for Adam (now 5, down from 6)

Q1 (firm vs managed-service) is **resolved** by your positioning lock. Five remain to lock Frame 4 fully:

1. **Standing Order — guided chip-assembler at MVP, free-form on Scale tier?** Recommended yes (User Researcher's behavioral concern about Sarah writing prose addressed; Yossi gets free-form for richer per-client orders).

2. **Public permalinks — default-public or default-private with toggle?** Default-public is the viral mechanic but requires resolving abuse vectors (scraping, competitor snooping). Recommended: default-public on Discover/Build (these users want exposure); per-domain toggle on Scale (Yossi may want client confidentiality).

3. **House Memory in week 1.** Empty at launch — does the product feel acceptable? Recommended: pre-seed Standing Order from /scan public data; first 2 weeks have inflated visible activity (more agents flagged "we noticed X"); position as "your crew is getting to know your business." Day-1 feels lighter than Day-90 by design, and that's OK if framed.

4. **Trust-tier defaults.** Schema fixes / FAQ additions / citation corrections auto-run-post-review; content rewrites pre-approve; pricing/brand always escalate. **Recommend Adam confirm or adjust.**

5. **Onboarding Step 2 chip-menu copy.** Need 5-8 chip menus that any SMB type (B2C local, B2B SaaS, e-comm, services) can answer in 60-90s. **Best dispatched to growth-lead.** Example menu:
   - "I want my crew to..." [show up on these AI engines / outrank competitors / generate FAQ-driven citations / monitor competitor moves]
   - "The most important engines for me are..." [multi-select from 11]
   - "My business is..." [B2C local / B2B SaaS / e-comm / services / other]
   - "Don't change without asking..." [brand voice / pricing copy / homepage hero / nothing]
   - etc.

---

## What this preserves and what it kills from Frame 3

### Preserved
- Trust-tier router (auto-run / pre-approve / always-escalate)
- /scan public 10-frame storyboard
- /reports white-label PDF artifact (now repositioned as Weekly Board Report)
- Stripe-table /scans, /competitors, /schedules, /settings primary surfaces
- English-only UI
- Engineering principle: outcomes over process

### Killed/replaced from Frame 3
- Bare status sentence ("Healthy and gaining") → Signed crew sentence
- "One Status / One Decision / One Number" triad → richer above-fold (Standing Order excerpt + Signed Status + Score-with-Ring + Evidence Strip + tier badge + Decision Card)
- Empty space when no decision needed → signed empty state
- /crew as digest-authoring tool → /crew as crew people-page
- Monday-only digest → hybrid (weekly + event-triggered + monthly + Weekly Board Report)
- Frame 3's onboarding Step 2 (3-option goal picker) → Standing Order guided assembler
- No board/client artifact → Weekly Board Report (the new viral surface)

---

## Recommended next moves (auto mode, no timelines)

Once Adam locks Q1-5:

**A. Visual design system consolidation** — Activity Ring component, Status Token, signed-status typography, Crew Traces token, Evidence Strip layout, type scale, color tokens, spacing rhythm, motion budget. (Designer's full spec is in seat-2.)

**B. Standing Order schema** — data model, version history, clause→agent mapping, edit log.

**C. Monday Digest template** — under AI Crew framing, signed, references Standing Order, links to permalink. Includes Open Question prompt.

**D. Weekly Board Report template** — separate artifact. Stripe-Press PDF + permalink. Auto-generates from agent-action data.

**E. Onboarding Step 2 guided assembler** — chip menus copy (handed to growth-lead).

**F. /home rebuild** — most surface changes land here. Build after the design system + Standing Order schema land.

**G. Public permalinks infrastructure** — auth model, sharing controls, white-label rendering.

**H. House Memory schema** — versioned approval/rejection record, agent constraint storage, inference rules.

**I. Per-agent profile pages** — with the four work-attribute lens tabs (Done / Found / Researched / Changed).

---

## The 5-second test (every Sarah session)

A Sarah session at week 6 walks away able to say (in any combination):
- *"My score is 78, up 5 this week."*
- *"Schema Doctor fixed 3 errors Tuesday."*
- *"Citation Fixer added 11 FAQs Wednesday."*
- *"My crew is closing the gap on Profound."*
- *"I forwarded the Board Report to my CEO yesterday."*

That sentence IS the renewal mechanism. Frame 4 builds for it explicitly. Frame 3 cannot produce it.

---

## The closing pitch (one paragraph)

> Beamix is your AI Visibility Crew. When a small business hires us, they sign a Standing Order — a short written agreement defining what their crew is for. Eleven AI specialists, named and accountable, go to work under it. They scan how AI engines see the business. They diagnose the gaps. They fix them — drafting FAQs, applying schema, monitoring competitors, refreshing content. Every Monday morning, the crew sends a digest signed in their own voice: what they did, what changed, what needs you. Every week, a board-grade report goes out for the user's CEO or clients — a one-page summary auto-generated, white-labeled at Scale tier. Every action carries the agent's signature; click any name to see their full work history. Every digest, scan, and report has a permalink the user can share. The competitors are dashboards. Beamix is the crew. The customer's job is to enter their URL and watch the work happen — or close the tab and read the email on Monday.

---

*End of Frame 4 PROPOSAL v2. Locked positioning. 5 sub-decisions remain for Adam to lock the architecture.*
