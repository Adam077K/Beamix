# Beamix — Metrics by Page (Wave 3)
*Business Lead · 2026-04-20*
*Basis: 06-PRICING-V2.md · 07-AGENT-ROSTER-V2.md · 03-PAGE-INVENTORY.md · 02-VISUAL-DIRECTION.md · DATABASE_SCHEMA.md*

---

## 0. Design Principle

Every KPI shown must pass the "so what?" test. A number without a frame is decoration.
The frame is always one of: **delta vs. last week**, **vs. competitors**, **vs. category benchmark**, or **% of budget remaining**.

Adam's critique — "The strings don't mean anything" — applies to KPIs as much as copy.
"Score: 71" means nothing. "Score: 71 — 3 competitors rank above you on Perplexity" means something.

---

## 1. North-Star Metric Matrix

| Tier | Price | Primary value metric shown on Home | Secondary metrics (3) | Upgrade lever metric |
|------|-------|------------------------------------|----------------------|----------------------|
| **Discover** | $79/mo | **GEO Score** (0–100, delta vs. last scan) | Engine Coverage (X/3 engines mention you), Citations Count (total this month), Top Competitor SoV Gap (+/– pp vs. your rank) | "You're missing daily scans — Build users catch ranking drops 7x faster" [shown when score drops] |
| **Build** | $189/mo | **Citations Earned** (total AI citations this month, delta vs. last month) | Agent Work Completed (N runs), Query Coverage (tracked/50), Competitor Gap (your SoV vs. leader SoV) | "You've used 78/90 AI Runs — Scale users run 250/mo and never hit the cap" [shown at 80% credit usage] |
| **Scale** | $499/mo | **Share of Voice** (% across all 9 engines, trend direction) | Queries Won (you appear, competitors don't), Content Published (total items live), Agent Efficiency (avg score lift per run) |  N/A — upsell is top-up packs ($19/10 AI Runs) |

**Rationale for primary metric shift by tier:**
- Discover users need proof the problem is real → GEO Score makes the gap visible
- Build users are active fixers → Citations Earned is the output they're buying
- Scale users are competitive strategists → SoV is the war they're fighting

---

## 2. Per-Page KPI Lists

---

### 2.1 Home (`/home`)

**KPI Strip (sticky, 48px, always visible)**

| KPI | Discover | Build | Scale | DB Source |
|-----|----------|-------|-------|-----------|
| GEO Score | `71 ▲+4` | `71 ▲+4` | `71 ▲+4` | `scans.overall_score` — latest row per `business_id`, delta from previous row |
| Engine Coverage | `3/3 mention you` | `5/7 mention you` | `8/9 mention you` | `scan_engine_results` — COUNT(DISTINCT engine WHERE is_mentioned=true) / plan engine count |
| Citations This Month | `12 citations` | `23 citations` | `47 citations` | `scan_engine_results` — COUNT WHERE is_mentioned=true AND scanned_at > period_start (needs: `citation_count` aggregated per period — **needs new column or materialized view**) |
| AI Runs Remaining | `18/25 left` | `62/90 left` | `182/250 left` | `credit_pools` — `base_allocation + rollover_amount + topup_amount - used_amount - held_amount` |

**Tier additions:**
- Build adds: Competitor SoV gap in strip: `Leader: RivalCo 41% (+7pp above you)` — `get_competitors_summary` RPC
- Scale adds: "Queries Won This Week: 14" — queries where user appears and top competitor does not

**Empty-state copy (consequence-framed):**
> "No scan data yet. You can't see the gap if you haven't looked."
> "Run your first scan — takes 90 seconds, shows why ChatGPT ignores you."

**Upgrade hook — Home:**
When GEO Score delta is negative AND user is Discover: sticky banner under KPI strip reads "Your score dropped ▼3. Build users get daily scans to catch this before it gets worse. → Upgrade to Build."
UI location: `StickyKpiStrip` — add `[UpgradeBanner]` slot below strip, visible only when delta < 0 and tier = Discover.

---

### 2.2 Inbox (`/inbox`)

**KPI Strip:** None (Inbox is a task queue, not a metrics surface. Strip would add noise.)

**List-row data per item (these are the "KPIs" of the inbox — per-item signals):**

| Signal | Discover | Build | Scale | DB Source |
|--------|----------|-------|-------|-----------|
| Agent type badge | All tiers | All tiers | All tiers | `content_items.agent_type` |
| Impact estimate | Shown (locked for action) | Shown (actionable) | Shown (actionable) | `content_items.evidence` JSONB → `impact_estimate` field |
| Queries targeted | Shown | Shown | Shown | `content_items.target_queries` array — COUNT |
| GEO signals present | Stats ✓ / Citations ✓ / Quote ✓ | Same | Same | Parsed from `content_items.evidence.geo_signals` — **needs new field in evidence JSONB** |

**Tier gating:**
- Discover: first item fully visible, all others blurred with overlay count: "3 more drafts — Build unlocks full Inbox"
- Build + Scale: full Inbox

**Evidence panel (right pane) KPIs — shown per selected item:**
- Trigger query that prompted this agent run
- Target queries count with engine breakdown
- Impact estimate: "This page currently ranks #4 on Perplexity for [query] — this rewrite targets #1-2"
- Citation sources referenced (toggle-collapsed list from `content_items.evidence.citations`)

Source: `content_items.evidence` (JSONB) — fields: `trigger_source`, `target_queries`, `impact_estimate`, `citations[]`

**Empty-state copy:**
> "Your agents haven't surfaced anything yet — they run on your next scheduled scan."
> "Accept a suggestion on Home to trigger your first agent run."

**Upgrade hook — Inbox:**
When Discover user scrolls past first item: inline locked overlay on items 2-4: "Unlock [agent name] draft — Build tier includes full Inbox access. → Upgrade."
UI location: `InboxItemRow` — `opacity-50 blur-[2px]` + `UpgradeOverlay` component on items 2+.

---

### 2.3 Workspace (`/workspace/[jobId]`)

**No KPI strip.** Workspace is a focused editor — strip adds noise.

**Aside panel signals (280px fixed):**

| Signal | Discover | Build | Scale | DB Source |
|--------|----------|-------|-------|-----------|
| Agent type + run date | Locked (upgrade CTA) | Shown | Shown | `agent_jobs.agent_type`, `agent_jobs.completed_at` |
| QA score | — | Shown: "QA: 87/100" | Shown | `agent_jobs.qa_score` |
| GEO signal checklist | — | Stats ✓ / Citations ✓ / Quote ✓ | Stats ✓ / Citations ✓ / Quote ✓ | Parsed from evidence JSONB — **needs: `geo_signals` object in evidence** |
| Target queries count | — | "Targets 4 queries" | "Targets 4 queries" | `content_items.target_queries` array length |
| Version history | — | Last 3 versions | Full history | `content_versions.version_number`, `edited_by`, `created_at` |

**Empty-state copy (workspace opened on a job still running):**
> "Your agent is still working on this — usually done in 2-3 minutes."
> "You'll be notified in Inbox when it's ready to review."

**Upgrade hook — Workspace:**
Discover user landing on Workspace via direct URL: full paywall modal (not partial).
Copy: "Workspace editing is a Build feature. On Discover, agents run but you can only view outputs, not edit them before publishing."
UI: Modal blocks entire content area. [Upgrade to Build] CTA + [View read-only] secondary.

---

### 2.4 Scans (`/scans`)

**KPI Strip (sticky):**

| KPI | Discover | Build | Scale | DB Source |
|-----|----------|-------|-------|-----------|
| Latest Score | `71 ▲+4 vs. last week` | `71 ▲+4 vs. last week` | `71 ▲+4 vs. last week` | `scans.overall_score` + delta |
| Scans This Month | `4 scans` | `18 scans` | `47 scans` | COUNT(`scans` WHERE `business_id=$bid` AND `scanned_at > period_start`) |
| Engines Tracked | `3 engines` | `7 engines` | `9+ engines` | `plans.engines` array length from subscription |
| Best Engine | `Perplexity: #1` | `Perplexity: #1` | `Perplexity: #1` | `scan_engine_results` — engine with lowest `rank_position` in latest scan |

**List row data (per scan row, 52px):**
`[date] [score badge: 71] [delta: ▲+4] [engine pips: ●●●○●] [queries matched: 12] [status: Complete]`

Sources:
- `scans.overall_score`, `scans.score_delta_vs_prev`, `scans.scanned_at`, `scans.status`
- Engine pips: `scan_engine_results` — GROUP BY engine, filter WHERE `scan_id=$id`
- `queries matched`: COUNT of `scan_engine_results WHERE is_mentioned=true AND scan_id=$id`

**Tier gating on re-scan CTA:**
- Discover: "Run scan" button disabled with tooltip "Discover scans weekly — next scan in 5 days. Upgrade to Build for daily scans."
- Build: 1/day limit — button shows "Last scan: 6h ago" if within 24h
- Scale: always active

**Empty-state copy:**
> "No scans yet — you're flying blind on AI search."
> "Run your first scan and find out which AI engines know your business exists."

**Upgrade hook — Scans:**
After user views scan drilldown and sees engines where `is_mentioned=false`: inline CTA in the "not mentioned" engine card: "Build plan scans 7 engines — see if Claude and Grok know you exist."
UI: `EngineResultCard` with `is_mentioned=false` + Discover tier → show `UpgradeChip` below engine name.

---

### 2.5 Scan Drilldown (`/scans/[scanId]`)

**KPI Strip (sticky):**

| KPI | Discover | Build | Scale | DB Source |
|-----|----------|-------|-------|-----------|
| Score | `71` | `71` | `71` | `scans.overall_score` |
| Previous Score | `▲+4 vs. 67` | `▲+4 vs. 67` | `▲+4 vs. 67` | previous `scans` row for same `business_id` |
| Engines Mentioned | `3/3` | `5/7` | `8/9` | `scan_engine_results` — is_mentioned ratio |
| Queries Matched | `12 queries` | `12 queries` | `12 queries` | COUNT(`scan_engine_results WHERE is_mentioned=true`) |
| Date | `Apr 19, 2026` | Same | Same | `scans.scanned_at` |

**QueryByQueryTable (44px rows):**
Each row: `[query text] [engine] [rank: #2] [sentiment: Positive●] [cited: ✓]`

Sources:
- `scan_engine_results.prompt_text` (query text — **note: DB schema column is `prompt_text`; PRD also uses this; verify column exists**)
- `scan_engine_results.engine`
- `scan_engine_results.rank_position`
- `scan_engine_results.sentiment_score` → rendered as Positive/Neutral/Negative
- `scan_engine_results.is_mentioned` → cited badge

**Citation sources section (below query table):**
"Sources AI engines cited when they mentioned you this scan"
- `citation_sources.source_domain`, `citation_sources.mention_count`, `citation_sources.engines`
- Framed: "Yelp mentioned in 3/5 engines — your best citation source"

**Comparison view (Build + Scale):**
Side-by-side strip: `[This scan: 71] [Previous: 67] [Delta: +4pp]`
Per-engine delta: `ChatGPT: was #3 → now #1 ▲2 positions`
Source: previous scan `scan_engine_results` joined to current

**Empty-state copy (no previous scan for comparison):**
> "First scan — nothing to compare yet."
> "Run a second scan after making changes to see what moved."

**Upgrade hook — Scan Drilldown:**
When Discover user views engine cards for engines NOT in their 3-engine plan (Claude, AI Overviews, Grok, You.com): ghost engine cards with lock icon: "Build plan tracks Claude AI — is it recommending your competitors instead?"
UI: `EngineResultCard` in locked state — `opacity-40`, lock icon, inline upgrade chip.

---

### 2.6 Competitors (`/competitors`)

**KPI Strip (sticky):**

| KPI | Discover | Build | Scale | DB Source |
|-----|----------|-------|-------|-----------|
| Your SoV | `34%` | `34%` | `34%` | Computed from `scan_engine_results` — your appearances / total appearances across all tracked businesses |
| Leader SoV | `CompetitorA: 41%` | Same | Same | `get_competitors_summary` RPC |
| Gap | `−7pp` | `−7pp` | `−7pp` | leader_sov - your_sov |
| Tracked Competitors | `3/3` | `3/5` | `7/20` | COUNT(`competitors WHERE business_id=$bid`) / plan limit |

**Competitor table (44px rows):**
`[name] [SoV%: 41%] [ChatGPT●] [Gemini○] [Perplexity●] [trend: ▲+3pp this week]`

Sources:
- `competitors.name` (competitors table — **G3 gap: not in DATABASE_SCHEMA.md, needs confirmation**)
- `get_competitors_summary` RPC: per-competitor, per-engine appearance rates
- Trend: computed from historical scan comparison

**Win/Loss sidebar (260px aside):**
- `Win: 12 queries` / `Lose: 8 queries` / `Tied: 3 queries`
- "You appear on Perplexity where CompetitorA doesn't — 5 queries you're winning"
- Source: `scan_engine_results` — queries where both appear vs. only one appears

**Missed Queries section:**
"Queries where CompetitorA appears and you don't (top 5)"
Source: Queries from competitor scans (requires `competitor_appearances` table or cross-scan join — **needs architecture decision**)

**Empty-state copy:**
> "No competitors tracked — you can't close gaps you can't see."
> "Add your top 3 competitors and find out which AI queries they're winning that you're missing."

**Upgrade hook — Competitors:**
When Discover user tries to click "Add competitor" after tracking 3: modal: "You're tracking the maximum 3 competitors on Discover. Build tracks 5 — Scale tracks 20." [Upgrade to Build] + [Continue with 3].
UI: `AddCompetitorButton` — on click when at tier limit → `UpgradeModal`.

When Discover user sees a competitor ranked #1 on 4+ engines while user ranks #3+: inline banner in strategy aside: "CompetitorA dominates on Gemini. Build plan includes daily scans so you catch when they slip. → Upgrade."

---

### 2.7 Automation (`/automation`)

**KPI Strip (above table, not sticky for this page — header section instead):**

| KPI | Discover | Build | Scale | DB Source |
|-----|----------|-------|-------|-----------|
| AI Runs Used | `18/25 (72%)` | `62/90 (69%)` | `112/250 (45%)` | `credit_pools.used_amount / (base_allocation + rollover_amount + topup_amount)` |
| AI Runs Remaining | `7 left` | `28 left` | `138 left` | Available credits formula |
| Reset Date | `May 1` | `May 1` | `May 1` | `credit_pools.period_end` |
| Active Schedules | `2/3 running` | `2/3 running` | `5/unlimited` | COUNT(`automation_schedules WHERE is_paused=false`) / plan limit |

**Automation table row data (56px rows):**
`[Agent name] [Status: ● Live / ○ Off] [Cadence: Weekly ▾] [Last run: 2d ago] [Next run: In 5d] [Actions: toggle, ...]`
+ Inline sparkline (24×24px SVG) showing last 4 run outcomes (completed/failed dots)

Sources:
- `automation_schedules.agent_type`, `is_paused`, `cadence`, `last_run_at`, `next_run_at`
- `automation_schedules` — **needs schema confirmation (G2 gap)**
- Sparkline: `agent_jobs WHERE agent_type=$type AND created_at > NOW()-INTERVAL '30 days'` — last 4 status values

**Tier gating:**
- Discover: full page is locked with upgrade CTA overlay. Single visible row (greyed): "Weekly auto-scan is active on Discover. Build unlocks agent scheduling."
- Build: max 3 schedules — "Add schedule" disabled when at limit with tooltip "Build allows 3 active schedules — Scale is unlimited"
- Scale: unlimited

**Empty-state copy (no schedules configured):**
> "Automation is off — your competitors' agents are running while yours aren't."
> "Set your first agent schedule and let Beamix work while you sleep."

**Upgrade hook — Automation:**
When Build user has 3/3 schedules active and tries to add a 4th: modal: "You've hit the Build limit of 3 active schedules. Scale is unlimited." [Upgrade to Scale] + [Manage existing schedules].
When AI Runs hit 80% consumed on Build: inline banner above credit bar: "You've used 72 of 90 AI Runs. At this rate, you'll hit the cap before month end. Scale includes 250/mo. → Upgrade."
UI: `CreditBudgetBar` — add `<UpgradeBanner>` slot that renders when `used_amount / total > 0.80` and tier = Build.

---

### 2.8 Archive (`/archive`)

**No KPI strip.** Archive is a content library, not a metrics surface.

**Page-level summary bar (above list, static):**

| KPI | All tiers | DB Source |
|-----|-----------|-----------|
| Total approved | `23 items approved` | COUNT(`content_items WHERE status IN ('approved','published') AND user_id=$uid`) |
| Published to site | `14 live` | COUNT(`content_items WHERE status='published'`) |
| Pending verification | `3 awaiting` | COUNT(`content_items WHERE status='published' AND verification_status='pending'`) |
| Last approved | `2 days ago` | MAX(`content_items.updated_at WHERE status='approved'`) |

**List row data (per item):**
`[Agent type badge] [title] [status: Published ✓ / Approved / Pending verification] [date] [actions: copy, re-run]`

Sources:
- `content_items.agent_type`, `title`, `status`, `published_url`, `updated_at`
- Verification: `content_performance.verification_status` or inline `content_items` — **G7 gap: URL probe mechanism needs decision**

**Framing for verification status:**
- "Published — verified live Apr 17" = content confirmed at URL
- "Published — awaiting verification (48h)" = URL probe pending
- "Approved — not yet published" = user approved but hasn't published to site

**Empty-state copy:**
> "Nothing published yet — your approved drafts are sitting in Inbox."
> "Approve an agent draft in Inbox and publish it to see your work history here."

**Upgrade hook — Archive:**
When Discover user tries CSV export (Scale feature): button shows lock icon: "Export is a Scale feature." [Upgrade to Scale] or [Copy individual items].

---

## 3. ROI Math Per Tier

### Discover — $79/month

**Value delivered:**
- Weekly scan across 3 engines (ChatGPT, Gemini, Perplexity) — 4 scans/month
- 25 AI Runs/month at average 1.5 runs/action = ~16 agent actions/month
- Query tracking across 15 queries

**ROI back-of-envelope:**
- A GEO consultant charges $150–$300/hour for AI visibility audits (assumed — industry estimate for digital marketing consultants, 2026)
- Discover delivers visibility audit + agent recommendations equivalent to ~2–3 consulting hours/month
- 2 hours × $200/hr = $400/month in consulting value
- **Deliver-to-price multiple: ~5x** ($400 value / $79 price) (assumed — based on consulting rate benchmarks)
- Additional: citation monitoring prevents invisible ranking drops that cost customer-acquisition value. A missed citation on Perplexity = lost organic lead. For an SMB with $50 average lead value and 10 AI-sourced leads/month, 1 citation drop = $50–$150 revenue impact (assumed)

**Key assumption (flag):** The $200/hr consulting rate and 2-3hr equivalence are assumed — not validated with paying Discover customers. Validate in first 30 days with user interviews.

---

### Build — $189/month

**Value delivered:**
- Daily scans across 7 engines — ~28 scans/month
- 90 AI Runs/month at 1.5 runs/action = ~60 agent actions/month
- Content Optimizer + Freshness Agent + FAQ Builder running regularly
- Authority Blog Strategist: up to 20 articles/month at 3 runs each = 20 posts/month potential

**ROI back-of-envelope:**
- Content Optimizer rewrites: ~$150–$300/page for GEO-optimized content rewrite (freelance rate, assumed — comparable to Upwork 2026 rates for SEO content)
- FAQ Builder output: ~$75–$150/page
- At 4 rewrites + 4 FAQs/month (moderate usage): (4 × $200) + (4 × $100) = $1,200 content value
- Blog posts (if used): at $200/article, 5 articles = $1,000 in long-form content value
- **Conservative multiple: ~6x** ($1,200 content / $189 price) (assumed)
- Daily monitoring at 7 engines: competitive intelligence value. Ahrefs Brand Radar charges $828+/month for similar monitoring only. Beamix delivers monitoring + agent action for $189.
- **Monitoring value arbitrage vs. Ahrefs Brand Radar: 4.4x cheaper** (fact: Ahrefs pricing per source #15 in RESEARCH-SYNTHESIS.md)

---

### Scale — $499/month

**Value delivered:**
- On-demand scans across 9+ engines
- 250 AI Runs/month — ~166 agent actions/month
- Up to 40 blog posts/month via Authority Blog Strategist
- 20 competitors tracked daily

**ROI back-of-envelope:**
- Agency GEO management: $1,500–$30,000/month (fact: from DECISIONS.md Yael Test rationale — sourced from product rethink pricing research)
- Conservative agency comparison: even at low end ($1,500/mo for small agency), Beamix Scale = **3x cheaper** than the cheapest agency doing equivalent work (fact — cross-reference DECISIONS.md 2026-04-15)
- 40 blog posts at $200/post = $8,000/month in content production value (assumed — $200/post is mid-tier freelance, not premium)
- 20-competitor daily tracking: Ahrefs Brand Radar equivalent would cost $699/month (bundled AI indexes) + base Ahrefs ($129) = $828/month for monitoring only, no content generation
- **Scale deliver-to-price multiple: ~19x** (content value alone) / 1.66x vs. cheapest agency (conservative) (assumed — content value estimate needs user validation)

**Key assumption (flag):** The 40-post/month volume is theoretical max. Actual Scale user likely uses 10–15 posts/month. At 12 posts × $200 = $2,400 value → still 4.8x multiple.

---

## 4. Upgrade Hook Placement Map

| # | Page | Component | Trigger | Upgrade type | CTA |
|---|------|-----------|---------|--------------|-----|
| **H1** | Home | `StickyKpiStrip` → UpgradeBanner slot | GEO Score delta is negative AND tier=Discover | Inline banner below strip | "Score dropped ▼3. Build users catch this with daily scans. → Upgrade to Build" |
| **H2** | Inbox | `InboxItemRow` items 2–4 | Discover user scrolls past item 1 | Blur + overlay on each locked row | "Unlock [Agent Name] draft — [Upgrade to Build]" |
| **S1** | Scans (drilldown) | `EngineResultCard` for locked engines | Discover user views scan with engines not in their plan | Ghost card with lock | "Build plan tracks Claude AI — see if it's recommending your competitors. → Upgrade" |
| **C1** | Competitors | `AddCompetitorButton` | Discover user tries to add 4th competitor (at 3-limit) | Modal | "You're tracking the maximum on Discover. Build tracks 5. [Upgrade to Build]" |
| **A1** | Automation | `CreditBudgetBar` → UpgradeBanner slot | AI Runs > 80% consumed AND tier=Build | Inline banner above credit bar | "You've used 72/90 AI Runs — Scale includes 250/mo. [Upgrade to Scale]" |
| **A2** | Automation | `AddScheduleButton` | Build user at 3/3 schedules tries to add | Modal | "Build allows 3 active schedules. Scale is unlimited. [Upgrade to Scale]" |
| **W1** | Workspace | Full content area overlay | Discover user opens any workspace URL | Paywall modal | "Workspace editing is a Build feature. [Upgrade to Build] or [View read-only]" |
| **Ar1** | Archive | Export button | Discover/Build user clicks CSV export | Lock icon + tooltip | "Export is a Scale feature. [Upgrade to Scale]" |

**Rules for all upgrade hooks:**
1. Never more than one upgrade prompt visible at once on any page
2. H1 (score drop) and A1 (credit cap) are the highest-converting moments — invest UI quality here first
3. All modals have a "not now" / secondary escape — never trap the user
4. H2 (Inbox blur) renders ONLY if user actually has items 2+ — no fake locked items on empty state

---

## 5. Metric Anti-Patterns

| # | Metric to avoid | Why |
|---|----------------|-----|
| **1** | "Total scans ever run: 47" | Vanity accumulator. Zero decision utility. A user at scan 47 on month 2 and scan 47 on year 2 need completely different actions. Replace with: score trend, not count. |
| **2** | "Agents activated: 7/11" | Feature discovery metric, not outcome metric. User doesn't care how many agents are toggled on — they care if their score improved. Replace with: "Agents that improved your score: 3." |
| **3** | "Last scan: 3 days ago" (raw timestamp) | Time without context is meaningless. "3 days ago" means nothing unless the user knows their cadence. Replace with: "Last scan: 3 days ago — your next auto-scan is in 4 days" (Discover) or "Last scan: 3 days ago — run a manual scan now" (Build). |
| **4** | "AI Runs used: 62" (absolute count) | Absolute usage count without budget frame is uninterpretable. Replace with: "62/90 AI Runs used (69%) — 11 days left in period." Always show budget context. |
| **5** | "Content items: 23" (total items in system) | Archive size is a vanity metric. Doesn't tell user if content is working. Replace with: "23 items approved — 14 live on your site — 3 awaiting verification." Status breakdown over raw count. |

---

## 6. DB Source Summary (for Workers)

| KPI | Table | Column(s) | Flag |
|-----|-------|-----------|------|
| GEO Score | `scans` | `overall_score`, `scanned_at` | — |
| Score delta | `scans` | `score_delta_vs_prev` | — |
| Engine coverage | `scan_engine_results` | `engine`, `is_mentioned`, `scan_id` | — |
| Citations count | `scan_engine_results` | `is_mentioned`, `scanned_at` | Needs materialized view or period aggregation query |
| AI Runs remaining | `credit_pools` | `base_allocation + rollover_amount + topup_amount - used_amount - held_amount` | — |
| AI Runs reset date | `credit_pools` | `period_end` | — |
| Inbox unread count | `content_items` | `status='awaiting_review'`, `user_id` | — |
| Impact estimate | `content_items` | `evidence` JSONB → `impact_estimate` | Needs `impact_estimate` standardized in evidence schema |
| GEO signal flags | `content_items` | `evidence` JSONB → `geo_signals` | Needs `geo_signals` object in evidence JSONB spec |
| Competitor SoV | RPC | `get_competitors_summary` | Requires Wave 2 migration applied |
| Competitors tracked | `competitors` | COUNT by `business_id` | G3 gap — table existence needs confirmation |
| Automation schedules | `automation_schedules` | `cadence`, `is_paused`, `next_run_at`, `last_run_at` | G2 gap — schema not in DATABASE_SCHEMA.md |
| Sparkline data | `agent_jobs` | `status`, `created_at`, `agent_type` | — |
| Archive verified | `content_items` | `status='published'`, `published_url` | G7 gap — verification_status column may not exist |

---

## 7. Open Schema Gaps (flag to Build Lead before implementation)

These are the KPIs we want to show that have no confirmed DB source:

| # | KPI | Gap | Resolution path |
|---|-----|-----|-----------------|
| G2 | Automation cadence/schedule | `automation_schedules` table not in DATABASE_SCHEMA.md | Confirm schema or add migration |
| G3 | Competitor SoV | `competitors` table not in DATABASE_SCHEMA.md | Confirm or use `competitor_mentions` text[] in `scan_engine_results` |
| GX | Citations per period (Home KPI) | No aggregated citation count column | Add materialized view: `monthly_citation_counts(user_id, period, count)` |
| GX | `geo_signals` in evidence | JSONB schema for `content_items.evidence` not formally specified | Specify: `{trigger_source, target_queries, impact_estimate, citations[], geo_signals: {has_stats, has_citations, has_quotes}}` |

---

*All ROI numbers marked (assumed) are estimates based on comparable market rates. Validate with first 10 paying users before using in marketing copy.*
