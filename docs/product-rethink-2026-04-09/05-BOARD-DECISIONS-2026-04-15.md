# Beamix Board Decisions — 2026-04-15

STATUS: DECIDED — Approved by Adam (founder). Supersedes open questions in `04-OPEN-QUESTIONS.md` and pricing/agent sections of `03-PRODUCT-VISION.md`.

---

## Session Context

- **Dates:** 2026-04-14 to 2026-04-15
- **Participants:** Adam (founder)
- **Purpose:** Resolve all open questions from the 2026-04-09 rethink. Approve final pricing, agent roster, interaction model, and UX architecture before build sprint.
- **Prior art:** `03-PRODUCT-VISION.md` (proposal), `04-OPEN-QUESTIONS.md` (questions), `02-GEO-RESEARCH.md` (research basis)
- **Status of this document:** Single source of truth for all build decisions going forward.

---

## Pricing (FINAL)

### New tiers

| Tier | Monthly | Annual (20% off) |
|------|---------|-----------------|
| **Discover** | $79/mo | $63/mo |
| **Build** | $189/mo | $151/mo |
| **Scale** | $499/mo | $399/mo |

**Previous pricing ($49/$149/$349 Starter/Pro/Business) is retired.**

### Pricing page behaviour
- Annual toggle defaults **ON**
- Build ($199) is the highlighted/recommended tier — anchored to Yael's $200 self-approval ceiling
- Scale ($499) is the decoy anchor, making Build look reasonable

### Trial model
- **7-day trial is killed entirely.** The startup cannot absorb agent/scan giveaway costs.
- Replace with: **14-day money-back guarantee** — plain refund, no credit-cap fine print.
- Monitor refund rate. Tighten policy only if refund rate exceeds 5%.
- **Free one-time scan** (pre-signup, anonymous) is kept.
- Free scan result shows: top-3 competitors outranking the user by name + specific queries they rank for.

---

## Agent Roster (FINAL)

Old 7-agent roster is killed. New roster is research-backed and GEO-specialized.

### MVP-1 (launch) — 11 agents

| # | Agent | Notes |
|---|-------|-------|
| 1 | **Query Mapper** | THE SPINE — every other agent reads from its output. Single source of truth for query clusters. |
| 2 | **Content Optimizer** | Rewrites existing pages. Injects stats, citations, expert quotes. Research baseline: +115% visibility lift. |
| 3 | **Freshness Agent** | Updates stale content. Includes inline chat editor (Cursor-style: select text → floating prompt → Haiku rewrite). Canonical name is Freshness Agent. (Early proposal used "Content Refresher" — that name is retired.) |
| 4 | **FAQ Builder** | Structured Q&A + FAQPage JSON-LD per query cluster. |
| 5 | **Schema Generator** | LocalBusiness / FAQ / Article JSON-LD. Deterministic output. |
| 6 | **Off-Site Presence Builder** | Finds directories, generates submission packages for user copy-paste. Formerly "Citation/Directory Builder." Free with daily cap (3/5/10 by tier). |
| 7 | **Review Presence Planner** | Review acquisition on Yelp, Google, TripAdvisor, G2. Not just analysis — active acquisition. |
| 8 | **Entity Builder** | Wikidata, Google Business Profile, knowledge graph signals. |
| 9 | **Authority Blog Strategist** | Listicle / comparison / data / how-to templates. GEO signals baked into every template. Build tier and above only. |
| 10 | **Performance Tracker** | Weekly rescan comparison. Before/after measurement. Primary retention hook. |
| 11 | **Reddit Presence Planner** | Community presence strategy. Basis: Perplexity sources 46.7% of citations from Reddit and community forums. |

### MVP-2 (month 2)

| # | Agent | Notes |
|---|-------|-------|
| 12 | **Video SEO Agent** | YouTube title/description optimizer. Basis: 23.3% of AI Overviews cite video content. |

### Killed agents
Social Strategy, old Competitor Intelligence (chat-based), old Content Writer, old Review Analyzer, llms.txt generator.

### Structural notes
- Blog Strategist is **not available on Discover** — forces upgrade to Build.
- Listicle and Comparison page formats live inside Blog Strategist as template choices, not as separate agents. Format is a legitimate GEO lever (listicles 5x more citable; comparisons 2.1x).

---

## Credit Model (FINAL)

Branded as **"AI Runs"**. 1 run = 1 agent execution. No variable pricing within a tier.

### Per-agent credit costs

| Cost | Agents | Daily Cap (Discover/Build/Scale) |
|------|--------|----------------------------------|
| **Free (unlimited, daily-capped)** | Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker | Schema: 20/20/20 · FAQ: 3/5/10 · Off-Site: 3/5/10 · Perf Tracker: unlimited |
| **1 run** | Query Mapper, Freshness Agent, Reddit Presence Planner | — |
| **2 runs** | Content Optimizer, Review Presence Planner, Entity Builder | — |
| **3 runs** | Authority Blog Strategist | — |

### Tier allocations

| Tier | Monthly Runs | Blog Cap | Rollover |
|------|-------------|----------|---------|
| Discover | 25 | — (not available) | 20% |
| Build | 90 | — | 20% |
| Scale | 250 | 40 runs/mo (COGS protection) | 20% |

### Unlimited (daily-capped) agents
Schema Generator, FAQ Builder, Off-Site Presence Builder, Performance Tracker — these run outside the main credit pool with the daily caps listed above.

---

## Scan & Engine Model (FINAL)

Scan credits are a **separate pool** from agent credits. They are not shared.

| Tier | Engines | Frequency |
|------|---------|-----------|
| Discover | 3 (ChatGPT, Gemini, Perplexity) | Weekly |
| Build | 7 (+ Claude, AI Overviews, Grok, You.com) | Daily |
| Scale | 9+ (all engines) | Daily + priority refresh |

Query Mapper is the single source of truth for queries on paid accounts. It replaces the legacy top-3 query generation that previously lived inside the free scan flow.

---

## LLM Model Rules (FINAL)

**Gateway:** OpenRouter (unified routing across all providers).

### Approved models only

| Provider | Approved models |
|----------|----------------|
| Anthropic | Claude Sonnet 4.6, Haiku 4.5, Opus 4.6 |
| Google | Gemini 2.0 Flash, Gemini 2.5 Pro |
| OpenAI | GPT-4o, GPT-4o-mini, GPT-5-mini |
| Perplexity | Sonar, Sonar Pro, Sonar Online |

**No DeepSeek. No Qwen. No other providers.**

### Routing rules

| Model | Use case |
|-------|---------|
| Haiku 4.5 | QA, classification, summarization, deterministic agents (all agents use Haiku for these steps) |
| Sonnet 4.6 | Creative long-form: Content Optimizer, Freshness Agent, Blog Strategist, Entity Builder, Off-Site Presence Builder |
| Haiku 4.5 | FAQ Builder do-stage (structured Q&A — cheaper, deterministic) |
| Sonar Online | All research steps that require fresh web data |

**Prompt caching:** System prompts + business context use Anthropic prompt caching (90% discount on cache reads).

---

## Product Philosophy (FINAL)

- **"Assisted, not autopilot"** — the user approves everything before it publishes.
- **Scheduled runs auto-draft into Inbox** — user pre-authorized the cadence, so auto-draft is appropriate. One-off suggestions require explicit accept → run.
- **"Publish" means Inbox delivery** — Beamix outputs to Inbox/Content Hub. User manually posts to their site. Beamix never writes to the user's website directly.
- **GEO improvement is continuous** — agents run on schedule, triggered by scan findings. Not a one-time fix.
- **Scans are the brain** — scan findings trigger the suggestion engine which spawns agent proposals.
- **Agents are invisible infrastructure** — no "Agent Hub" page. Agents are backend workers, not destinations.
- **Higher tiers = more automation frequency** — schedule cadence unlocks with tier.
- **Kill switch is sacred** — user can pause all automation instantly from any screen.

---

## Interaction Model (FINAL)

### Proactive suggestion flow
```
Scan runs → rules engine evaluates findings → suggestions queue populated
→ user accepts suggestion → agent runs in background
→ output lands in Inbox → user reviews / edits / approves
→ "Ready to post" moves to Archive
```

### By agent category

| Category | Flow |
|----------|------|
| Content agents (Content Optimizer, Blog Strategist, etc.) | Background run → notify user → review in Inbox |
| Off-site agents (Off-Site Presence Builder, Review Presence Planner, Entity Builder) | Produce "submission packages" — user does external action manually, marks done, next scan verifies |
| Intelligence agents (Query Mapper, Performance Tracker) | Ambient "Signals" feed — no action required from user |
| Lightweight agents (Schema Generator, FAQ Builder) | 45-second one-shot flow |

### Inline chat editor (Freshness Agent only)
Cursor-style: select text on any content item → floating prompt → Haiku rewrites in place.

---

## Dashboard UX (FINAL)

### Sidebar navigation
`Home · Inbox · Scans · Automation · Archive · Competitors · Settings`

**"Agents" is removed from nav.** Agents are backend, not destinations.

### Page designs

| Page | Design |
|------|--------|
| **Home** | Feed pattern: score hero + suggestions queue + Inbox preview + automation status + Signals feed |
| **Inbox** | 3-pane Superhuman layout — filters column / item list / preview pane with evidence tab |
| **Scans** | Timeline + engine drilldown + diff view (before/after comparison) |
| **Automation** | Schedule cards + credit budget + kill switch |
| **Archive** | Approved/posted content history |
| **Competitors** | Competitor list + movement alerts. Share-of-voice is MVP-2. |
| **Settings** | 7 tabs: Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults |

---

## Free Scan → Preview → Paywall (FINAL)

### Pre-scan form
URL + industry + location + 3 competitor URLs (autocomplete-suggested).

### Scanning experience
60–90 second dark animation. Engines light up live as they complete. Query ticker shows queries being run.

### Result reveal
- Giant visibility score
- "2 of 30 queries" framing (reinforces scope)
- Top-3 competitors listed by name with specific queries they rank for
- 3 visible fixes + 8 blurred fixes
- Primary CTA: **"Fix this now →"** (action-first, not price-leading)
- Secondary: **"Explore the product first"** (plain text link)

### Preview mode
Email required. Auto-creates a preview account. User lands on `/dashboard` with real scan data populated. All pages accessible. Gating is feature-based, not time-based.

### Paywall triggers
- **Primary:** Click "Run Agent" anywhere in the dashboard
- **NOT** time-based (no 7-day countdown)
- One free FAQ Builder run per preview account (~$0.04 cost, creates aha moment)

### Email gates
- Soft gate on result page: 20-second delay prompt
- Hard gate on "Explore dashboard" CTA

### Paywall modal
- 880px modal (not full takeover)
- Contextual hook matching what the user tried to do
- All 3 tiers displayed, Build highlighted

---

## Rate Limits (FINAL)

### Content page caps (SOFT WARNING — user can override with confirmation)

| Tier | New pages/month |
|------|----------------|
| Discover | 4 |
| Build | 10 |
| Scale | 20 |

Research basis: sites publishing 50+ AI-generated pages/month saw ranking crashes within 60–90 days.

### Review request caps

| Tier | Review requests/month |
|------|----------------------|
| Discover | 5 |
| Build | 10 |
| Scale | 15–20 |

---

## Positioning & Copy (FINAL)

**Hero line:** "Your business, cited by ChatGPT. Not by luck. Not by waiting. Beamix does the work — you stay in control."

**Human-in-loop as feature:** "Like an agency team — they draft, you approve, you publish. Except this agency costs $189/mo instead of $3,000."

**Agency anchor:** "A GEO agency charges $1,500–$5,000/month. Beamix does the same work for $199."

**Hebrew loss-aversion hook:** "שלושה מתחרים מקבלים את הלקוחות שלך עכשיו"

---

## Safety (FINAL)

### YMYL hard-refuse
Medical diagnosis, legal advice, investment/crypto advice. Agent returns structured "refuse with reason" — no content generated.

### YMYL soft-gate
General health/finance education → forced human review + mandatory disclaimer appended.

### MVP vertical exclusions
Medical diagnostic, law-advisory, financial advisory, regulated Israeli professions. These verticals are excluded from MVP launch.

### Implementation
- Topic-risk classifier (Haiku) runs inside Query Mapper on every query cluster.
- Classifier re-runs at content generation time.
- Pre-launch eval: 5 golden test cases per agent. Haiku/Opus judges pass/fail. Any agent that fails its eval threshold ships as "Coming Soon."

---

## Hebrew (FINAL)

- **GEO benchmark study:** Research Lead runs 50-query × 4-engine study across Hebrew queries in parallel with the build sprint. Results gate Hebrew-first marketing decisions.
- **Hebrew prompt variants** required for all content-producing agents (Content Optimizer, Blog Strategist, FAQ Builder, Freshness Agent).
- **Israeli directory seed list:** d.co.il, Easy.co.il, Rest.co.il, Bizmap/B144, Zap.co.il
- **Israeli review platforms:** Google Reviews (primary), Rest, Zap, Easy, TripAdvisor-IL, Wolt (food)
- **Hebrew sister-font:** Heebo (paired with Inter for visual weight parity)

---

## Open Questions — Resolved

All items from `04-OPEN-QUESTIONS.md` are now closed.

| Q# | Question | Decision |
|----|----------|----------|
| Q1 | Remove Social Strategy? | REMOVED entirely. Reddit/community presence covered by Reddit Presence Planner agent. |
| Q2 | Roadmap UX vs Agent Hub? | NEITHER — replaced by suggestion-based proactive model. No agent hub, no static roadmap. |
| Q3 | Engine-specific visibility — show or hide? | Option C confirmed. Show engine breakdown on dashboard; do not tag individual actions. |
| Q4 | Off-site execution model? | Option B (semi-automated). Agent generates submission packages; user copy-pastes to external platforms. |
| Q5 | QA gate — block missing GEO signals? | Auto-draft ON for scheduled runs only. One-off suggestions require explicit accept. |
| Q6 | Content rate limiting? | Soft warning (Option B). User can override with confirmation. |
| Q7 | What to build first? | All 11 agents ship at MVP launch. Single 2-week sprint. |
| Q8 | Has reconciliation migration been applied? | Day 1 task. Must be applied to production before any agent work begins. |
| Q9 | Pricing — is $49 too low? | YES. Updated to $79/$199/$499. |

---

## What Supersedes What

| This document supersedes | Section |
|--------------------------|---------|
| `03-PRODUCT-VISION.md` | Pricing, agent roster, interaction model, dashboard UX |
| `04-OPEN-QUESTIONS.md` | All open questions — all are now DECIDED |
| `MEMORY.md` LOCKED DECISIONS | Pricing section ($49/$149/$349 is retired) |

`01-PRODUCT-STATE.md` and `02-GEO-RESEARCH.md` are unaffected — they remain valid reference documents.

---

## Decisions Added 2026-04-17 (Continued Board Meeting)

### Annual Pricing
- Ship with annual pricing from day 1 (Discover $63/mo, Build $159/mo, Scale $399/mo annual)
- Note: refund exposure is 10x higher per incident on annual plans. Monitor closely.

### Top-Up Pack
- Ship $19 one-time purchase for 10 extra AI Runs at launch
- Prevents mid-month churn when users exhaust their allocation
- Paddle one-time product, not subscription

### Customer Validation
- Run 5 problem interviews with Israeli SMB owners in Week 1 of build sprint
- Focus: "Do you know if ChatGPT recommends your competitors? Would you pay to fix that?"
- Populate USER-INSIGHTS.md with real customer language
- Also conduct interviews with real customers during build

### Day-1 Auto-Trigger Pipeline (Dead Dashboard Fix)
- On Paddle payment confirmation, auto-fire Inngest event chain:
  1. Query Mapper runs (~30s) — generates 50 targeted queries
  2. Full paid scan starts (~60-90s) — uses Query Mapper queries, all tier engines
  3. Rules engine evaluates scan → populates suggestions (~5s)
  4. First 2-3 highest-impact agents auto-run (~30-60s each)
- Home page shows "Setting up your workspace..." progress card during this
- User sees populated dashboard within 5-10 minutes of payment
- This is architecturally significant: Paddle webhook → Inngest chain → pipeline

### Market Strategy
- Israel is primary market for now
- US expansion possible and may be needed for break-even (190-226 paying users needed at $35K/mo burn)
- Not blocking — plan English GTM by month 2 post-launch

### Sonar Citation Verification
- Add Perplexity Sonar verification step to agent QA pipeline
- Cost: ~$0.02/run extra
- Purpose: catch hallucinated statistics and fake citations that Haiku QA misses (~25% miss rate)
- Applied to: Content Optimizer, Freshness Agent, Authority Blog Strategist, FAQ Builder

### Assisted vs Autopilot — VALIDATED
- Research confirms 93-97% of marketers review AI content before publishing (Ahrefs n=879, HubSpot 2026)
- Zero credible sources recommend full autopilot as default for SMBs
- "Assisted not autopilot" is the CORRECT positioning — validated, not assumed
- Future consideration: optional "auto-approve for low-stakes content" as Scale-tier feature (post-MVP)

### Score Attribution Language
- Performance Tracker uses DIRECTIONAL language only
- "Trend observed" not "we improved your score by X%"
- AI engines give different answers every run — causal attribution is impossible with current data
- Leading indicators shown early (content published, actions completed, citations detected)

### Content Output Policy (NO AI Labels)
- Agent-generated content contains NO AI disclosure markers
- Content reads as professional human-written work
- "Assisted not autopilot" means user is the author — reviews, edits, publishes
- EU AI Act Article 50 disclosure obligation falls on publisher (user), not tool (Beamix)
- Blog Strategist prompt: removed "AI disclosure footer"
- Settings page: add tooltip noting user's disclosure responsibility
- Saved to agent memory as permanent policy

### Agent Naming — Canonical
- "Freshness Agent" is the canonical name (not "Content Refresher")
- Applied across all docs in Round 4 cleanup

### Spec Contradictions Resolved (April 17)
- Off-Site Presence Builder: FREE/unlimited with daily cap (3/5/10 by tier)
- Blog Strategist: NOT available on Discover tier
- Competitors page: Discover gets full page with 3 tracked competitors
- Settings: 7 tabs (Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults)
- UX doc paywall: fixed to show $79/$199/$499, removed trial references
- Daily caps for unlimited agents: Schema 20/day all tiers, FAQ 3/5/10, Off-Site 3/5/10, Performance Tracker unlimited

### Query Intelligence — Dual-Text Approach
- Query Mapper generates TWO versions per query:
  - `target_text`: specific, for agent optimization ("best commercial movers tel aviv for offices")
  - `scan_text`: natural user language for scanning ("I need to move my office in tel aviv, who do you recommend?")
- Scans use `scan_text` to simulate real user behavior — honest measurement
- Agents use `target_text` to optimize content toward specific queries
- Before/after is honest — score reflects what real users experience

### Content Workspace Vision
- Rich editor with GEO signal indicators (stats count, citation count, quote count, target queries)
- Inline rewrite via Freshness Agent's chat editor (select text → floating prompt → Haiku rewrite)
- MVP-1: markdown editor + inline chat + GEO signal sidebar
- MVP-2: auto-publish to CMS (WordPress first)
- "Publish" from Beamix = drops into Inbox/Archive. User copies to their website manually in MVP-1.

### Email Infrastructure
- Domain: beamix.tech (NOT beamix.io)
- Transactional email: notify.beamix.tech subdomain (Resend)
- Cold outreach: separate subdomain + separate provider (NOT Resend)
- Main domain: website only, no direct email sending
- Protects transactional deliverability from cold email reputation damage

---

## Decisions Added 2026-04-18 (8-Expert Audit)

### Build Tier Price Change
- Build tier: $189/mo (was $199). Annual: $151/mo.
- Reason: $199 = NIS 715, which is $1 over Yael's NIS 700 self-approval limit. $189 = NIS 680, under the limit.

### Agent Priority Tiers
- Deep 6 (20+ eval cases): Query Mapper, Content Optimizer, Blog Strategist, Performance Tracker, FAQ Builder, Off-Site Presence Builder
- Lighter 5 (5 eval cases): Freshness Agent, Schema Generator, Entity Builder, Review Planner, Reddit Planner
- All 11 ship at launch. Quality depth differs.

### Free Preview: FAQ Builder + Content Optimizer Teaser
- Free: FAQ Builder runs ($0.04), produces copy-pasteable FAQ + JSON-LD
- Teaser: Content Optimizer shows first 3 sentences of homepage rewrite, rest blurred. Zero cost.

### Query Review Gate (Day-1)
- User reviews top-10 queries before downstream agents fire
- Adds one user interaction to day-1 pipeline

### Guided Step-by-Step Path
- Home suggestions as numbered sequential steps with progress bar
- Not unordered suggestion cards

### PDF Report Export
- Professional one-page PDF: score, competitors, action plan
- Emailable to boss. React-pdf or puppeteer.

### LLM Architecture: Direct Anthropic + OpenRouter
- Direct Anthropic SDK for Claude models (80% of calls). Cheaper + resilient.
- OpenRouter for Gemini/GPT/Perplexity (scan engines).
- New env: ANTHROPIC_API_KEY

### Infrastructure Upgrades
- Inngest Pro ($75/mo) — free tier breaks at 10-15 users
- Health endpoint: /api/health validates all env vars
- 3-phase enum migration (not single file)

### Security: 10 Requirements in All Worker Briefs
SSRF validator, prompt injection sanitization, Cloudflare Turnstile, credit locking, webhook verification, RLS tests, npm audit, rehype-sanitize, rate limiting, cost circuit breaker.

### User-Facing Language Policy
- Agent names internal only. Users see action labels.
- "GEO" never shown. Use "AI Search Visibility."
- "AI Runs" → consider "Actions" or "Credits"
