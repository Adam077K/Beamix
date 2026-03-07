# Beamix — Dashboard Spec

> **Last synced:** March 2026 — aligned with 03-system-design/

**Version:** 1.1
**Date:** 2026-02-28
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Status:** Updated

> The dashboard is where the product lives. Every design decision flows from one principle: the user should feel like they have a competitive advantage — and that advantage is growing.

---

## Navigation Structure

### Sidebar (desktop) / Bottom nav (mobile)

```
┌─────────────────┐
│  BEAMIX         │
│                 │
│  ● Dashboard    │  ← Overview, visibility gauge, recs, activity
│  ○ Rankings     │  ← Per-query, per-engine drill-down
│  ○ Recommendations │ ← AI-generated action items + "Fix with Agent"
│  ○ Content      │  ← Content library + editor (/dashboard/content/[id])
│  ○ Agents       │  ← All 16 agent launchers + run history
│  ○ Competitors  │  ← Competitive intelligence dashboard (NEW)
│  ○ AI Readiness │  ← AI readiness score + roadmap (NEW)
│  ○ Settings     │  ← Business, billing (Paddle), preferences, integrations
│                 │
│  ─────────────  │
│                 │
│  [Plan: Pro]    │  ← Current plan badge
│  Credits: 8/15  │  ← Monthly usage bar (credit_pools)
│  [avatar] Name  │  ← User identity
└─────────────────┘
```

> **Updated 2026-03-05:** Added /dashboard/competitors, /dashboard/ai-readiness, /dashboard/recommendations as separate nav items per System Design v2.1. Agent hub now shows 16 agents (A1-A12 launch, A13-A16 growth phase).

**Mobile bottom nav (5 items max):**
`Dashboard | Rankings | Agents | Content | ··· (Settings)`

**Sidebar behavior:**
- Fixed on desktop, overlays on mobile (hamburger trigger)
- Active item has gradient highlight (existing code pattern — keep it)
- Agent usage bar updates in real-time after each execution
- Plan badge is clickable → opens billing settings

---

## Main Dashboard Page (`/dashboard`)

### Layout — Desktop

```
┌────────────────────────────────────────────────────────────────┐
│  Good morning, [Name].  Last scanned: 2 hours ago              │
├───────────────────────────┬────────────────────────────────────┤
│                           │                                    │
│   ZONE 1 — HERO           │   ZONE 2 — LEADERBOARD             │
│   Rank Position           │   Your position vs competitors     │
│                           │                                    │
│   #4                      │   #1  Competitor A    89           │
│   across AI search        │   #2  Competitor B    74           │
│   Insurance · Tel Aviv    │   #3  Competitor C    61           │
│                           │   #4  ► YOU ◄         47  ←glow   │
│   ▲ +2 since last week    │   #5  Competitor D    39           │
│   Visibility Score: 47    │                                    │
│                           │   [View Full Rankings →]           │
├───────────────────────────┴────────────────────────────────────┤
│                                                                │
│   ZONE 3 — ACTION QUEUE                                        │
│   Your next moves                                              │
│                                                                │
│   [HIGH]  You're missing a FAQ page.                          │
│           Gemini ranks businesses with FAQ content 2x higher. │
│           [Generate with FAQ Agent →]                         │
│                                                                │
│   [HIGH]  3 recent reviews mention "response time".           │
│           AI engines are picking this up as a negative signal.│
│           [Analyze with Review Agent →]                       │
│                                                                │
│   [MED]   Your competitor just published 3 new articles.      │
│           You're losing ground on 2 tracked queries.          │
│           [Run Competitor Intelligence →]                     │
│                                                                │
│   [View all 8 recommendations →]                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ZONE 4 — RECENT ACTIVITY          ZONE 5 — ENGINE STATUS    │
│                                                                │
│   Blog post: "Moving tips..."        ChatGPT    #3  ●●●●●     │
│   Status: Draft · 2 days ago         Gemini     —   ○○○○○     │
│   [Review →]                         Perplexity #2  ●●●●●●    │
│                                      Claude     #6  ●●●        │
│   Schema markup generated             ···        ·   ···       │
│   Status: Published · 5 days ago                               │
│   [View →]                           [See all engines →]       │
│                                                                │
│   FAQ page: "Insurance FAQ"          Next scan in: 4h 22m     │
│   Status: Pending Review             [Scan Now →]              │
│   [Review →]                                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Zone 1 — Hero Metric

**The rank position is the star. Everything else supports it.**

```
┌──────────────────────────────────────────┐
│                                          │
│   Your AI Search Rank                    │
│                                          │
│         #4                               │
│   ─────────────────────────              │
│   across AI search                       │
│   Insurance · Tel Aviv                   │
│                                          │
│   ▲ +2 positions since last week         │
│                                          │
│   ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄       │
│   Visibility Score    47 / 100           │
│   [████████░░░░░░░░░░]                   │
│                                          │
└──────────────────────────────────────────┘
```

**Design details:**
- `#4` is enormous — 96px, bold, white. This is the number they remember.
- Industry + Location in small muted text below — "Insurance · Tel Aviv"
- Movement indicator: green ▲ if improved, red ▼ if declined, gray — if flat
- `+2 since last week` — always shows delta from previous scan
- Visibility Score is secondary — smaller font, progress bar, below a divider

**Color states for rank number:**
- #1–3: Bright green — "You're dominating"
- #4–7: Amber — "You're competitive"
- #8–15: Red-orange — "You need to act"
- Not ranked: Red — "You're invisible"

**Dev note:** Rank is calculated as the user's average position across all AI engines and tracked queries combined, then compared to detected competitors in the same industry + location. Stored in the `scans` table. If no previous scan exists, no delta is shown.

---

### Zone 2 — Competitive Leaderboard

**The user sees themselves in context. This is the emotional driver.**

```
┌──────────────────────────────────────────┐
│  AI Search Leaderboard                   │
│  Insurance · Tel Aviv                    │
│                                          │
│  #1  Harel Insurance        89  ●●●●●●●● │
│  #2  Phoenix Group          74  ●●●●●●●  │
│  #3  Migdal Insurance       61  ●●●●●●   │
│  #4  ► Your Business ◄      47  ●●●●●    │ ← highlighted row
│  #5  AIG Israel             39  ●●●●     │
│                                          │
│           [View Full Rankings →]         │
└──────────────────────────────────────────┘
```

**Interaction:**
- Clicking a competitor row expands an inline detail: their score breakdown, which engines they rank on, a quick "Add to tracked competitors" button
- The user's row has a persistent glow/highlight — always visually distinct
- Rows update after each scan cycle

**Dev note:** Competitor list is built from: (1) user-added competitors, (2) competitors auto-detected from LLM responses during scan. Max 5 shown on dashboard overview. Full list in Rankings page.

---

### Zone 3 — Action Queue

**The pull mechanism. Personalized, specific, actionable.**

**Card structure:**

```
┌──────────────────────────────────────────────────────┐
│  [HIGH IMPACT]                                       │
│                                                      │
│  You're missing a FAQ page                           │
│                                                      │
│  Gemini ranks businesses with structured FAQ         │
│  content 2x higher for your query "best insurance    │
│  company Tel Aviv". Your top competitor has one.     │
│  You don't.                                          │
│                                                      │
│  Affects: ChatGPT, Gemini  ·  1 agent use           │
│                                                      │
│  [Generate with FAQ Agent →]    [I'll do it myself]  │
└──────────────────────────────────────────────────────┘
```

**Card anatomy:**
- Impact badge: HIGH (red-orange) / MEDIUM (amber) / LOW (muted)
- Title: specific, concrete action — never generic
- Body: 2–3 sentences. Always includes: what's missing, why it matters, which competitor has it
- Target engines: which AI engines this affects
- Cost: how many agent uses this will consume
- Primary CTA: "Generate with [Agent Name] →" — opens agent launcher modal
- Secondary CTA: "I'll do it myself" — marks as in-progress, shows guidance text

**Show 3 on dashboard. Link to full recommendations list.**

**Ordering:** High impact first. Within same impact level: sort by which affects the most tracked queries.

**Dev note:** Recommendations are generated by the Recommendations Agent after each scan cycle. Stored in `recommendations` table. Each card links to `agent_type` — clicking "Generate with X Agent" opens the agent modal pre-filled with context from that recommendation.

---

### Zone 4 — Recent Activity

**The last 3 agent outputs. Status-driven.**

**Status badges:**
- `Draft` — gray — agent ran, content not yet reviewed
- `Pending Review` — amber — content generated, waiting for user
- `Published` — green — user marked as live
- `Failed` — red — agent execution failed, retry available

**Each row:**
```
Blog post: "5 moving tips for Tel Aviv families"
Draft · Generated 2 days ago · Blog Writer Agent
[Review & Publish →]
```

**If no activity yet:**
```
No content generated yet.
[Launch an agent →]
```

---

### Zone 5 — Engine Status

**At-a-glance: which AI engines see you, which don't.**

```
ChatGPT       #3   ●●●●●●●●○○
Gemini        —    ○○○○○○○○○○  ← Not Found
Perplexity    #2   ●●●●●●●●●○
Claude        #6   ●●●●○○○○○○
+ 2 more           ···
```

**Visual:**
- Filled dots = visibility strength (10 dots = max score)
- "—" = not found
- Engine logo icon next to name
- "Not Found" engines are muted/dimmed — creates urgency

**Below the engine list:**
```
Next scan: in 4h 22m   [Scan Now →]
```

Manual scan button — triggers immediate re-scan (rate limited per plan).

---

## First-Time State — New User, Scan Running

**The user arrives from signup. Their first scan is in progress (or about to run).**

```
┌────────────────────────────────────────────────────────────────┐
│  Welcome, [Name]. Your first scan is running.                  │
├───────────────────────────┬────────────────────────────────────┤
│                           │                                    │
│   ZONE 1 — HERO           │   ZONE 2 — LEADERBOARD             │
│                           │                                    │
│   Scanning your           │   ┌─────────────────────────┐     │
│   business...             │   │  Scanning competitive   │     │
│                           │   │  landscape...           │     │
│   [animated spinner       │   │                         │     │
│    with AI engine logos   │   │  ▓▓▓░░░░░░░░░░░░░░░░░  │     │
│    appearing one by one]  │   │  Identifying competitors│     │
│                           │   └─────────────────────────┘     │
│   Usually takes 60–90s    │                                    │
├───────────────────────────┴────────────────────────────────────┤
│                                                                │
│   ZONE 3 — ACTION QUEUE                                        │
│                                                                │
│   ┌─────────────────────────────────────────────────────┐     │
│   │  Your action plan is being generated...             │     │
│   │  We'll show you exactly what to fix once the        │     │
│   │  scan is complete.                                   │     │
│   └─────────────────────────────────────────────────────┘     │
│                                                                │
│   While you wait — here's what Beamix looks for:              │
│   ✦ Your mention rate across AI engines                        │
│   ✦ Where your competitors outrank you                         │
│   ✦ Which content gaps are costing you leads                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ZONE 4 — RECENT ACTIVITY                                     │
│                                                                │
│   No agent activity yet. Your first recommendations            │
│   will appear here after the scan completes.                   │
│                                                                │
│   [Explore the Agents →]                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**First-time state behaviors:**
- All zones show skeleton/loading states or friendly empty states — never blank white space
- Zone 1 spinner shows AI engine logos appearing and "checking" sequentially
- Zone 3 shows educational content about what Beamix is doing — builds anticipation
- When scan completes: page auto-refreshes (via Supabase Realtime subscription on `free_scans` table) with a smooth transition — no manual refresh required
- A banner appears: "Your scan is ready! Here's your AI visibility report." with a brief animation

**Dev note:** Subscribe to Supabase Realtime on `scan_results` for the user's business. When first result appears, trigger page data refresh with React Query `invalidateQueries`.

---

## Returning User State — Week Over Week

**The dashboard evolves. Returning users should feel progress.**

**Changes from Week 1 to Week 4:**
- Zone 1: Rank number and delta update each scan. Trend line appears after 3+ scans.
- Zone 2: Competitors may change positions — creating competitive drama
- Zone 3: New recommendations replace completed ones. Dismissed ones never return.
- Zone 4: Grows with completed content. Becomes a portfolio of work done.
- Zone 5: Engines where user was "Not Found" may flip to ranked — celebrate this

**Progress celebration moments:**
- First time ranked on any engine: `"🎉 You're now visible on ChatGPT for the first time!"`
- Rank improvement: subtle animation on the rank number (count up/down)
- Competitor overtaken: `"You just passed Migdal Insurance. You're now #3."`
- These appear as toast notifications, not persistent banners

**Dev note:** Track previous scan state in React Query cache. Compare on each new scan load. Trigger celebration UI based on deltas.

---

## Rankings Page (`/dashboard/rankings`)

**The drill-down from the hero metric. Full data, full control.**

```
┌────────────────────────────────────────────────────────────────┐
│  Rankings                                     [+ Add Query]    │
│  10/25 queries tracked  ·  Last updated 2 hours ago            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Filters: [All Engines ▼]  [All Status ▼]  [This Month ▼]     │
│                                                                │
├──────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  Query           │ ChatGPT  │ Gemini   │Perplexity│  Claude  │  Trend   │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  best insurance  │   #3 ▲   │   —  ▼   │   #2 =   │   #5 ▲   │  ████▲  │
│  Tel Aviv        │          │          │          │          │         │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  insurance for   │   #7 ▼   │   #4 ▲   │   —  =   │   #8 ▼   │  ██▼    │
│  small business  │          │          │          │          │         │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  ...             │          │          │          │          │         │
└──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Row colors:**
- #1–3: Green
- #4–7: Amber
- #8+: Red-orange
- —: Gray/muted (not found)

**Row click → inline expansion:**
```
  ▼  best insurance company Tel Aviv

     Rank history (sparkline chart, 8 weeks)
     ChatGPT: ──3──4──5──3──3──2──3──3
     Gemini:  ──7──6──—──—──—──—──—──—

     Associated content:
     • "Insurance FAQ Tel Aviv" (published) → affected ChatGPT

     Competitor positions for this query:
     #1 Harel Insurance · #2 Phoenix Group · #3 You · #4 Migdal

     [Run AI Agent for this query →]
```

**Add Query flow:**
Modal: enter query text, set priority (High/Medium/Low), optional category. Validates against plan limit. Shows `X of Y queries used`.

---

## Agents Page (`/dashboard/agents`)

**The launchpad for all AI agents. Pull-based — user chooses.**

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  AI Agents                                                     │
│  Agent uses this month: 8 / 15   [████████░░░░░░░]            │
│  Need more? [Top up →]                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ ✦ Content Writer │  │ ✦ Blog Writer    │  │ ✦ FAQ Agent  │ │
│  │                  │  │                  │  │              │ │
│  │ Write GEO-       │  │ Long-form posts  │  │ Structured   │ │
│  │ optimized pages  │  │ that get cited   │  │ Q&A pages    │ │
│  │ for your site    │  │ by AI engines    │  │ for your site│ │
│  │                  │  │                  │  │              │ │
│  │ 1 agent use      │  │ 1 agent use      │  │ 1 agent use  │ │
│  │                  │  │                  │  │              │ │
│  │ [Launch →]       │  │ [Launch →]       │  │ [Launch →]   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ ✦ Schema Agent   │  │ ✦ Review Agent   │  │ ✦ Competitor │ │
│  │                  │  │                  │  │   Intel      │ │
│  │ JSON-LD markup   │  │ Analyze reviews, │  │              │ │
│  │ that helps AI    │  │ improve signals  │  │ Research how │ │
│  │ understand you   │  │ AI engines read  │  │ competitors  │ │
│  │                  │  │                  │  │ outrank you  │ │
│  │ 1 agent use      │  │ 1 agent use      │  │ 2 agent uses │ │
│  │                  │  │                  │  │              │ │
│  │ [Launch →]       │  │ [Launch →]       │  │ [Launch →]   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                │
│  ┌──────────────────┐                                          │
│  │ ✦ Social         │                                          │
│  │   Strategy       │  (Pro+ only — locked on Starter)         │
│  │                  │                                          │
│  │ Content calendar │                                          │
│  │ + ready-to-post  │                                          │
│  │ copy             │                                          │
│  │                  │                                          │
│  │ 1 agent use      │                                          │
│  │                  │                                          │
│  │ [Lock icon] Pro+ │                                          │
│  └──────────────────┘                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Agent card states:**
- Available: normal card, Launch button active
- Locked (plan): card has lock icon overlay, clicking → upgrade modal
- Running: card shows spinner, "Running..." — button disabled
- Out of uses: card grayed out, "0 uses remaining · [Top up →]"

### Agent Launch Modal

When user clicks Launch on any agent:

```
┌─────────────────────────────────────────────────────┐
│  Blog Writer Agent                            [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Topic                                              │
│  [Moving tips for Tel Aviv families        ]        │  ← pre-filled from recommendation if launched from there
│                                                     │
│  Target queries (select from your tracked list)     │
│  [✓] best moving company tel aviv                   │
│  [✓] moving tips israel                             │
│  [ ] relocation services tel aviv                   │
│                                                     │
│  Tone                                               │
│  [Educational ▼]                                    │
│                                                     │
│  Length                                             │
│  [Standard (1000–1500 words) ▼]                     │
│                                                     │
│  Language                                           │
│  [English ▼]                                        │
│                                                     │
│  ─────────────────────────────────────────────      │
│  This will use 1 agent use (8 of 15 remaining)      │
│                                                     │
│  [Cancel]              [Generate →]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**After clicking Generate:**
- Modal closes
- Toast: "Blog Writer is running. We'll notify you when it's ready. (~2 min)"
- Agent execution tracked in `agent_jobs` table
- User can navigate away — result appears in Content tab when complete
- Badge appears on Content nav item: `Content (1 pending)`

---

## Content Page (`/dashboard/content`)

**The output library. Everything Beamix's agents have created.**

```
┌────────────────────────────────────────────────────────────────┐
│  Content Library                                               │
│                                                                │
│  [All ▼]  [Blog Posts]  [Web Pages]  [Schema]  [Social]       │
│  [All Status ▼]  [Sort: Newest ▼]                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Blog Post                              ● Pending Review │  │
│  │  "5 Moving Tips for Tel Aviv Families"                   │  │
│  │  Blog Writer Agent · 2 days ago · 1,247 words            │  │
│  │                                                          │  │
│  │  Targets: "moving tips tel aviv", "moving company israel"│  │
│  │  Est. impact: +2 positions on ChatGPT for top query      │  │
│  │                                                          │  │
│  │  [Preview]  [Edit]  [Copy]  [Mark as Published]          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Schema Markup                              ● Published  │  │
│  │  LocalBusiness JSON-LD — Homepage                        │  │
│  │  Schema Agent · 5 days ago                               │  │
│  │                                                          │  │
│  │  Targets: all queries (site-wide impact)                 │  │
│  │  Published: Feb 23, 2026                                 │  │
│  │                                                          │  │
│  │  [View]  [Copy Code]  [Download]                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Content Item — Single View (`/dashboard/content/[id]`)

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back to Content                                             │
│                                                                │
│  Blog Post · Blog Writer Agent · Feb 26, 2026                  │
│  Status: Pending Review                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  "5 Moving Tips for Tel Aviv Families"                         │
│                                                                │
│  [Meta description: "Planning a move to Tel Aviv? Here are..."]│
│                                                                │
│  ─────────────────────────────────────────────────────         │
│  [Rendered content preview — formatted, readable]              │
│                                                                │
│  Introduction...                                               │
│  ## Tip 1: Start with a timeline                               │
│  Content content content...                                    │
│  ## Tip 2: ...                                                 │
│  ...                                                           │
│  ## FAQ                                                        │
│  **Q: How long does a typical Tel Aviv move take?**            │
│  A: ...                                                        │
│  ─────────────────────────────────────────────────────         │
│                                                                │
│  [Edit inline]  [Copy Markdown]  [Copy HTML]  [Download]       │
│                                                                │
│  ─────────────────────────────────────────────────────         │
│  Publishing                                                    │
│  Copy this content and publish it to your website.             │
│  Once it's live, mark it here so we can track its impact.      │
│                                                                │
│  [✓ Mark as Published]                                         │
│                                                                │
│  ─────────────────────────────────────────────────────         │
│  Rate this output                                              │
│  [★★★★☆]  [Leave feedback]                                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Edit flow:** Clicking "Edit inline" opens a lightweight editor (not a full modal). User can edit text directly on the page. Changes auto-save. User controls the final output before publishing.

---

## Settings Page (`/dashboard/settings`)

**Tabbed layout.**

```
Tabs: [Business Profile]  [Billing]  [Preferences]  [Integrations]  [Team (coming soon)]
```

**Business Profile:** Business name, URL, industry, location, description, services, logo upload, competitor list.

**Billing:** Current plan, usage stats (queries, agent uses), billing cycle, next invoice date, payment method, invoice history, upgrade/downgrade flow, cancel.

**Preferences:** Interface language (EN/HE), content generation language, email notification frequency, timezone.

**Integrations:**
```
┌─────────────────────────────────────────────────────────────┐
│  Integrations                                               │
│                                                             │
│  Connect Beamix to your platforms.                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  WordPress   │  │  Google      │  │  Google      │      │
│  │  (Pro+)      │  │  Analytics   │  │  Search      │      │
│  │  CMS publish │  │  GA4         │  │  Console     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Slack      │  │  Cloudflare  │                         │
│  │  Alerts      │  │  (Business)  │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                             │
│  [Notify me when integrations launch →]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
**Dev note:** WordPress integration is launch-critical (Pro tier). GA4, GSC, Slack are Growth Phase. Cloudflare is Moat Builder. "Notify me" toggle saves boolean to `notification_preferences`. Per System Design v2.1: all integration credentials encrypted with AES-256-GCM.

---

## Edge Cases & States

### No Data States

| Zone | Empty State Copy |
|---|---|
| Hero — no scan yet | "Your scan is running. Results in ~60 seconds." |
| Hero — scan failed | "Scan encountered an issue. [Retry →]" |
| Leaderboard — no competitors | "We're identifying competitors in your category..." |
| Action Queue — no recommendations | "You're all caught up. We'll generate new recommendations after your next scan." |
| Recent Activity — no agents run | "No content yet. [Launch your first agent →]" |
| Engine Status — no scan | "Engine breakdown will appear after your first scan." |

### Plan Limit States

| Situation | UI Treatment |
|---|---|
| Queries at limit | "Add Query" button shows: "10/10 queries used · [Upgrade to add more]" |
| Agent uses at 0 | Agent cards grayed, "Top up" banner in Zone 3 |
| Agent uses at 80% | Subtle warning bar on Agents page: "5 uses remaining this month" |
| Competitor limit reached | Add competitor button disabled with upgrade prompt |

---

## Data Sources — What Powers Each Zone

| Zone | Primary Data Source | Update Trigger |
|---|---|---|
| Hero rank | `scans` + `scan_engine_results` (aggregated) | Each scan cycle |
| Leaderboard | `competitors` + their `scan_engine_results` | Each scan cycle |
| Action Queue | `recommendations` table | After each scan + manual refresh |
| Recent Activity | `agent_jobs` + `content_items` | Real-time (Supabase Realtime) |
| Engine Status | `scan_engine_results` per engine | Each scan cycle |
| Agent usage | `credit_pools` table | After each execution |

**Dev note:** Use React Query with `staleTime` per zone:
- Rank / Leaderboard: 5 min
- Action Queue: 5 min
- Recent Activity: 30 sec (near real-time feel)
- Agent usage: 30 sec
- Engine Status: 5 min

---

## Theme & Visual Language

**Existing code uses dark theme — keep it.**

Key visual principles:
- Rank number (#4): massive, bold, white. It's the hero.
- Movement delta (▲ +2): green if positive, red if negative. Never ambiguous.
- Competitor rows: muted dark cards. User's row: glows with cyan/primary border.
- Agent cards: consistent size, icon-driven, not text-heavy.
- Status badges: pill-shaped. Colors: gray (Draft), amber (Pending), green (Published), red (Failed).
- Empty states: never blank — always show a friendly message + action.

---

## Agent List — Complete (16 Agents, A1-A16)

### Launch Agents (A1-A12)

| # | Agent | Credits | Plan Required | Output |
|---|---|---|---|---|
| A1 | Content Writer | 1 | Starter+ | GEO-optimized website pages |
| A2 | Blog Writer | 1 | Starter+ | Long-form blog posts |
| A3 | Schema Optimizer | 1 | Starter+ | JSON-LD structured data |
| A4 | Recommendations | 0 (system) | All | Prioritized action items (auto after scan) |
| A5 | FAQ Agent | 1 | Starter+ | FAQ content matching AI queries |
| A6 | Review Analyzer | 1 | Pro+ | Reputation analysis + response templates |
| A7 | Social Strategy | 1 | Pro+ | 30-day social content calendar |
| A8 | Competitor Intelligence | 1 | Pro+ | Deep competitive analysis + action items |
| A9 | Citation Builder | 1 | Pro+ | Outreach templates for citation sources |
| A10 | LLMS.txt Generator | 1 | Starter+ | AI-readable site description file |
| A11 | AI Readiness Auditor | 1 | Starter+ | Comprehensive website AI audit |
| A12 | Ask Beamix | 0 (Pro+) | Pro+ | Conversational data analyst (streaming) |

### Growth Phase Agents (A13-A16)

| # | Agent | Credits | Plan Required | Output |
|---|---|---|---|---|
| A13 | Content Voice Trainer | 1 | Pro+ | Learn business's writing voice |
| A14 | Content Pattern Analyzer | 1 | Pro+ | What makes cited content succeed |
| A15 | Content Refresh Agent | 1 | Pro+ | Audit + update stale content |
| A16 | Brand Narrative Analyst | 1 | Business | WHY AI says what it says |

**Total: 16 agents.** Starter gets A1-A5, A10-A11. Pro+ gets A1-A16 (except A16). Business gets all 16.

### Additional Dashboard Features (per System Design v2.1)

- **Content Voice Profiles:** `/dashboard/content` shows voice profile status per business. Trained by A13.
- **Agent Workflow Chains:** Event-triggered multi-agent automation (e.g., Visibility Drop → A4 → A8 → A1 → Notify). Configured in `/dashboard/agents`.
- **Alert System:** 9 alert types (visibility, sentiment, competitor, credit, content performance). Settings in `/dashboard/settings` preferences tab. Notifications: in-app + email + Slack.
- **Citation Analytics:** Source-level citation tracking in `/dashboard/rankings` row expansion. Shows which URLs are cited instead of the user's business.

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent) + Founder*
*Source of truth for the Beamix dashboard — the core product experience.*
