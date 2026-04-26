# Beamix Page List — LOCKED
Date: 2026-04-25
Status: LOCKED by Adam decisions. All page-list debate complete.

---

## Adam's decisions

**Q1. Path? → C (Hybrid)**
**Q2. /archive? → Absorb into /scans as "Completed Items" tab**
**Q3. Default landing? → /home**
**Q4. Mobile bottom nav 4 pages? → /home · /inbox · /scans · /crew**
**Q5. Ship all 8 /home sections? → Yes, all 8**

**Adam's reframe of /home (verbatim):** "I see a page that is giving out our customers everything they need in one page. And if they want to learn the most of the things we learned from our website. So the homepage needs to summarize. It's usually not just text. It's in chart and animations and all of that... It's the page most users will be the most."

**Adam's quality bar:** "Expert level grade of a SaaS product. Something they never seen before. Super professional, super expensive look. Real billion dollar company designed this."

---

## The 8 sidebar pages (LOCKED)

| # | Page | Purpose | Sarah-frequency | Yossi-frequency |
|---|---|---|---|---|
| 1 | `/home` | Rich overview — score + KPIs + trends + activity. The center of gravity. | daily, 30s glances | many×/day, 30s each |
| 2 | `/inbox` | Sibling work surface — review queue (3-pane Linear Triage) | weekly, 60-90s | 2-3×/day, 10-15min |
| 3 | `/workspace` | Agent execution viewer — vertical step list, streaming output | transient | active sessions |
| 4 | `/scans` | Scan history + per-scan deep dive. **Absorbs /archive** as "Completed Items" tab. | rare | daily |
| 5 | `/competitors` | Competitor intelligence (Build/Scale gated) | monthly | daily |
| 6 | `/crew` | 11-agent roster + per-agent settings | curiosity 1-2×/mo | weekly |
| 7 | `/schedules` | Recurring scans + auto-fix configs (renamed from /automation) | NEVER | weekly |
| 8 | `/settings` | 5 tabs: Profile / Billing / Language / Domains (Yossi) / Notifications | 2×/year | monthly |

## Plus 2 flow surfaces (NOT in sidebar)

| # | Surface | Type | Purpose |
|---|---|---|---|
| 9 | `/scan` | Public, no-auth | Acquisition — public scan + 15-17s reveal animation |
| 10 | `/onboarding/[1..4]` | Gated flow, post-Paddle | One-time setup — business profile, language, first agent, credits |

## Plus Scale-tier additional page (gated)

| # | Page | Tier | Purpose |
|---|---|---|---|
| 11 | `/reports` | Scale ($499) only | White-label PDF/CSV exports for Yossi's client deliverables |

## Chrome elements (NOT pages)

- **Multi-domain switcher** — top of sidebar, dropdown. Invisible to Sarah (one domain), critical for Yossi (20 domains).
- **Notifications bell** — top-right dropdown. System alerts (billing reminders, scan completed, schedule changed). Separate from /inbox review queue.
- **Cmd+K palette** — universal action surface
- **`?` cheatsheet overlay** — keyboard shortcut help

## Mobile bottom nav

4 visible: `/home` · `/inbox` · `/scans` · `/crew` · `More` (overflow includes /workspace, /competitors, /schedules, /settings)

---

## /home — 8 sections (locked, all ship at launch)

Vertical scroll, NO tabs. Top to bottom:

1. **Hero score block** — current score + delta + 12-week sparkline + 1-line diagnosis
2. **Top 3 fixes ready** — RecommendationCards with "Run all — N credits" CTA (action zone)
3. **Inbox pointer line** — "3 items in your Inbox awaiting review →"
4. **KPI cards row** — Mentions / Citations / Credits / Top competitor delta (each card clickable)
5. **Score trend chart** — line chart over weeks/months, hover tooltips
6. **Per-engine performance strip** — 9 engine pills with current scores, click any to drill to /scans/per-engine
7. **Recent activity feed** — last 5-10 events: scans completed, agents run, items approved
8. **What's coming up footer** — next scheduled scan, next agent run, next billing date

---

## /inbox structure (locked)

3-pane Linear Triage:
- Left rail: filters (by agent, by source, by priority, by client/domain — for Yossi)
- Center: item list with J/K nav and multi-select
- Right: preview + sticky ActionBar (Approve `A` / Reject `X` / Request Changes `R` / Cmd+A bulk)
- Tabs at top: Pending (default) / Drafts / Live (in-progress agent runs)
- Score chip in top-right is passive reference (NOT chrome, NOT a banner)

## /scans structure (locked, absorbs /archive)

Tabs:
- All Scans (default)
- **Completed Items** ← this is where /archive's content lives
- Per-Engine

Yossi's export workflow lives here.

---

## What's resolved that was previously open

- ✅ /archive as a top-level page → KILLED, lives as tab on /scans
- ✅ /home structure debate → LOCKED Path C (sibling to /inbox, rich content, no tabs)
- ✅ /workspace separate from /inbox → LOCKED separate
- ✅ /competitors separate from /scans → LOCKED separate
- ✅ /automation → /schedules rename → LOCKED
- ✅ /crew added → LOCKED
- ✅ /reports added (Scale-tier) → LOCKED
- ✅ Multi-domain switcher → LOCKED as chrome element
- ✅ Notification naming clash → /inbox stays for review, bell dropdown for system alerts
- ✅ Mobile bottom nav 4 → /home · /inbox · /scans · /crew
- ✅ Default landing → /home

## Still open (NOT page-list, but pricing/strategy)

- Multi-domain pricing model: $499 per account (20 domains incl) vs $499 per domain — drives whether Yossi exists as customer
- /scan in this Next.js repo or move to Framer at beamix.tech/scan — hosting/deployment question
- Whether email-copy of scan results creates a `/scan/[scanId]` second public route

These are downstream decisions, not page-list decisions.

---

## Next: page-by-page deep design (with billion-dollar quality bar)

Per Adam's stated order: pages first, then colors / palettes / fonts / sizes / spaces / components / micro-animations / UX-UI consistency.

Page-by-page deep design starts with `/home` (highest leverage, most-visited, brand-defining surface).
