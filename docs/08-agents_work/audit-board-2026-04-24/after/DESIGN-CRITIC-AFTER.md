# Design Critic — After Credibility-Pass Fixes (2026-04-24)

**URL:** https://beamix.vercel.app (tester account)
**Viewports:** 1440×900 desktop + 375×812 mobile
**Baseline:** Nina graded c8d92ed at 2.5/5 (AI slop territory)
**Target:** ≥3.5/5

## Per-Screenshot Findings

### 01 — Login desktop — PASS
Tester button carries visible blue tint (`#3370FF` @ ~5% bg, `#3370FF` border + label) so it reads as the secondary primary, not neutral. Caption below: "Demo account with sample data — no signup required". Divider "or explore the demo" separates it from the main sign-in CTA. Clean hierarchy.

### 02 — Home desktop — PASS
Engine cards render with 2-letter initials on colored chips: CG / GM / PX / CL / GK / AI / YC. No `??` fallbacks. Mention rates are varied and believable: 83%, 67%, 100%, 67%, 67%, 67%, 100%. KPI tooltip `ⓘ` glyphs visible on all four top-row labels (AI VISIBILITY SCORE, CITATIONS THIS MONTH, AI IMPRESSIONS ADDED, ACTIONS USED THIS MONTH). Right rail with Recent Activity / Inbox / Automation summary reads professional.

### 03 — Home mobile 375×812 — PASS
Sidebar hidden. Hamburger (☰) top-left, Beamix wordmark beside it. Content stacks cleanly; KPI and engine cards wrap to 2-col grid. No layout break.

### 04 — Scans desktop — PASS
Timestamps varied across rows: 10:17, 09:10, 16:03, 12:56, 14:49, 10:42, 09:35, 18:28, 12:21, 11:14, 15:07, 14:00 — zero duplicates. Date-group headers appear ONCE each (YESTERDAY, EARLIER THIS WEEK, 19 APR, 16 APR, 14 APR, 11 APR, 9 APR, 6 APR, 4 APR, 2 APR, 30 MAR, 27 MAR). Score trend chart present. Badges (Scheduled / Manual / Initial) color-differentiated.

### 05 — Competitors desktop — PASS
Head-to-head matrix uses tabular numerals — 78% / 69% / 67% / 100% columns align perfectly across rows. Competitor URLs clean: `ahrefs.com/brand-radar`, `tryprofound.com`, `otterly.ai`, `sparktoro.com`, `buzzworthy.ai`. No `https://https://` doubling. Strategy delta cards on right rail neat.

### 06 — Automation desktop — ⚠️ DEGRADED
Page title correctly reads "Schedules" (not "Auto-pilot") — PASS. BUT agent-label casing is mixed: "FAQ Builder", "Content Optimizer", "Freshness Agent", "Competitor Intel" are Title Case, while `schema_generator` still renders as snake_case in both the main table AND the Recent Runs side rail. Proper-casing was applied partially — one enum value slipped through.

### 07 — Settings ?tab=billing — PASS
Deep-link `?tab=billing` opens Billing tab with sidebar row highlighted in blue (not Profile). Shows Current Plan + Manage billing / Change plan actions + Invoice history empty state + "14-day money-back guarantee on all plans" footnote.

### 08 — Trial banner — ⚠️ CONDITIONAL
Tester account shows a BLACK strip reading "Preview mode — upgrade to unlock agents" with Upgrade CTA. Banner bg = `rgb(10,10,10)`. The ticket expected a BLUE strip "Build trial · Day X of 14" — that's a separate variant for real Build-tier trialists, not applicable to the tester account. The preview variant itself renders correctly. Cannot verify the trial variant from a tester session — flag as INDETERMINATE, not a regression.

### 09 — Inbox desktop — ❌ FAIL
Three of four agent labels proper-cased in list ("Content Optimizer", "Competitor Intel", "FAQ Builder") but `freshness_agent` renders snake_case in BOTH the inbox row AND the detail pane header ("freshness_agent · Awaiting review"). This is exactly the miss called out in the ticket. Same root cause as #06 — one enum isn't being passed through the label formatter.

## Overall Score: 3.8 / 5

Up from 2.5 baseline. Target ≥3.5 cleared.

### What moved the needle
- Engine cards with real initials + varied data (was the most AI-slop tell)
- Tabular numerals on competitor matrix (suddenly reads like a real dashboard)
- Scan timestamps varied (was the most damning ctrl-c/ctrl-v signal)
- KPI tooltip affordances
- Mobile hamburger
- Login tester button has real hierarchy

### What's blocking 4+
1. **`freshness_agent` + `schema_generator` snake_case leak** — two enum values bypass the humanize formatter. Trivial fix, huge perception cost. Every other agent reads correctly which makes the slip MORE obvious, not less.
2. **KPI tooltip not interactive** — `ⓘ` glyph rendered but no `lucide-info` class detected and no hover behavior in snapshot. Reads as decoration, not an affordance.
3. **Inbox detail pane header** repeats the raw enum value instead of agent label + rich subject pairing (e.g. "Freshness Agent · Refreshed About Page").
4. **Empty-states raw** — scan detail page with identical 100% for all 7 engines looks like a seed artifact; worth varying.
5. **No real focus rings audited** — all measured via screenshots, not keyboard traversal.

### Net
This is a legitimate 3.5–4 surface. Two label bugs and one tooltip affordance are the difference between "demo-grade SaaS" and "Linear-adjacent craft." Fix the two snake_case leaks in the agent-type label util and the score bumps to 4.0 without more work.
