# Free Scan → Product Preview → Paywall — PRD

**Owner:** product-lead · **Status:** DRAFT for CEO board review · **Date:** 2026-04-14

## Problem
Yael (SMB marketer, non-technical) and Avi (SMB owner) don't know if they're visible in ChatGPT/Gemini/Perplexity. Current scan result page is standalone — user sees a number, clicks "Sign up," lands in an empty dashboard, and churns before hitting the aha moment. We need the scan result to *be* the product, so Yael feels what owning Beamix is like before she ever sees a credit-card form.

**Success metrics**
- Free scan → signup: ≥ 35% (today: untracked, est. 10-15%)
- Signup → paid (Discover $79): ≥ 18% within 72h
- Time from scan completion to first "unlock" CTA click: ≤ 90s median
- 3+ dashboard pages visited in preview mode before paywall: ≥ 60% of signups

## Out of Scope (v1)
- 7-day trial (killed — entry is free scan + paywall)
- Running any paid agent in preview
- Multi-business support in preview
- Rescan in preview (one scan, period)

---

## Part 1 — The Wound-Reveal Result Page

### Scroll order (Yael sees, top to bottom)

**1. Headline wound (above the fold)**
```
You appear in 2 of 30 queries your customers are asking.
Your 3 competitors appear in 21.
```
- Format: huge number `2/30` in #3370FF, sub-line in #6B7280
- No score yet — a score is abstract, a ratio is visceral
- Right rail: "Scanned across 7 AI engines · 30 real queries · 12 seconds ago"

**2. The named competitor reveal** (loss-aversion trigger)
```
When customers ask "best [industry] in [city]", AI recommends:
  1. [CompetitorA.com]       cited by 6 engines
  2. [CompetitorB.com]       cited by 5 engines
  3. [CompetitorC.com]       cited by 4 engines
  —
  47. [yourdomain.com]       cited by 1 engine (Perplexity only)
```
- Not hostile: frames competitors as "what AI recommends," not "who's beating you"
- The gap (1 → 47) stings on its own. Don't editorialize.

**3. Per-engine breakdown** — horizontal card row, one card per engine
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│ ChatGPT    │ │ Gemini     │ │ Perplexity │
│ 0/10       │ │ 1/10       │ │ 1/10       │
│ ✗ Not cited│ │ Rank #8    │ │ Rank #6    │
└────────────┘ └────────────┘ └────────────┘
```
- 7 engine cards (free scan hits 3; Pro+ shows 4 more as "locked" teasers)

**4. Query-level competitor grid** — the core data artifact
Table, first 5 queries visible, next 25 blurred:
| Query | You | CompA | CompB | CompC |
|-------|-----|-------|-------|-------|
| best [industry] in [city] | — | #2 | #5 | #7 |
| affordable [service] near me | #12 | #1 | #4 | #8 |
| [service] reviews [city] | — | #3 | — | #2 |

**5. The 3 visible fixes** (see Part 6 for scoring)
Each fix card:
```
┌─────────────────────────────────────────────┐
│ Add statistics + citations to your homepage │
│ Impact: +8-14 score pts · Effort: Low       │
│ Helps: ChatGPT, Perplexity                  │
│ Agent: Content Optimizer                    │
└─────────────────────────────────────────────┘
```

**6. Blurred "8 more problems found"**
- Titles partially readable (first 3 words), rest pixel-blurred
- Impact numbers visible ("+5 pts," "+12 pts") — credibility without giving it away
- Agent icons visible so Yael knows *which* capability unlocks the fix

**7. Proof/trust strip** (bottom)
`7 engines queried · 30 queries tested · 4 competitors analyzed · scan id: xxx · 2026-04-14 14:22`

### Data model

```typescript
ScanResult {
  scan_id: string
  business: { url, industry, location }
  competitors: [{ url, citations_count, rank_by_query: Record<query_id, number> }]
  queries: [{ id, text, user_rank: number|null, competitor_ranks: Record<url, number> }]
  engines: [{ name, queries_ran, user_citations, user_avg_rank }]
  fixes: Fix[]   // 3 visible + 8 locked
  visibility_ratio: { cited_in: number, total: number }
  scanned_at: timestamp
}

Fix {
  id, title, description,
  impact_points: number,       // see Part 6
  effort: 'low'|'medium'|'high',
  engines_helped: string[],
  agent_type: AgentType,
  tier_required: 'discover'|'build'|'scale',
  visible_in_preview: boolean
}
```

---

## Part 2 — Preview-In-Product (Option B wins)

**Decision: Option B — result IS a dashboard page, preview account auto-created.**

### Why B over A/C
- A (standalone → signup → empty dash): we lose them at "signup" because they haven't felt the product yet
- C (hybrid 5-min timer): arbitrary, creates urgency-anxiety instead of curiosity, and requires the same infra as B
- B: the scan *becomes* the product. Yael clicks "Rankings" in the sidebar and sees real data about *her business*. This is the aha. Signup becomes "save my work," not "commit to a tool I haven't touched."

**Auto-preview account:** On scan completion we create a `preview_users` row keyed by email (collected post-scan, see Part 4), mint a preview session cookie (30-day TTL), and redirect to `/dashboard`. No password yet. Signup later converts preview → full account.

### Per-page preview visibility matrix

| Page | Visible in preview | Blocked / blurred | Paywall trigger on |
|------|-------------------|-------------------|---------------------|
| Dashboard Overview | Headline ratio, score (34/100), 3 engine KPI cards, "last scan" card | Trend charts (need history), "next scheduled scan" card | Clicking "Schedule weekly scans" |
| Rankings | Full per-engine table for the 3 free-scan engines, full query grid | 4 other engines shown as locked cards ("Unlock Claude, Grok, You.com, AI Overviews") | Clicking a locked engine card |
| Recommendations | Top 3 fixes full detail | Fixes #4-#11 blurred title + visible impact/agent icons | Clicking any blurred rec OR "See all 11" |
| Agents | All 10 agent cards visible with descriptions, "helps with X engines" badge | "Run agent" button replaced with "Unlock to run" | Clicking "Run" on any agent |
| Content Library | Empty state with preview: "Your agents' output will live here — here's what Yael's looks like" + 2 sample content cards (watermarked "SAMPLE") | Actual creation | Clicking "Create content" |
| Competitors | The 3 competitor URLs they entered, rank positions from scan, citation counts | Competitor score trendlines, "track changes" toggle | Clicking "Track this competitor weekly" |
| Settings | Email, business URL, industry, location (editable), language toggle | Billing tab blurred, Integrations "Coming soon" | Clicking Billing |
| AI Readiness / Scan | Redirect to existing scan result | N/A | N/A |

**Sidebar badge:** a persistent `Preview Mode · Unlock full access` pill at the top, clickable → paywall modal.

---

## Part 3 — Paywall Trigger Moments (ordered by friction, low → high)

Triggers fire a **context-aware paywall modal** (not a redirect). Each modal headline references the thing they just tried to do.

1. **Click "Unlock to run" on any agent** — highest intent, primary trigger. Modal: "Activate [Agent Name] — it helps you with [engines]. Start from $79/mo."
2. **Click a blurred recommendation** — "See all 11 fixes. Discover tier unlocks recommendations + runs the first 3 for you."
3. **Click a locked engine card** on Rankings — "See how you rank in Claude / Grok / AI Overviews. Build tier scans all 7."
4. **Click "See all 11" on recommendations list**
5. **Click sidebar "Unlock" pill** — lowest intent, generic pricing modal
6. **Click Billing tab** — same modal
7. **Soft trigger after 3 page views in preview** — non-blocking banner, not a modal: "You've explored 3 pages. Ready to activate your team?"

**No time-based lock.** Preview persists 30 days. Email nudges at 24h, 72h, 7d, 14d.

---

## Part 4 — Data Collection Sequence

### Pre-scan form (homepage / Framer → POST to this app's `/api/scan/start`)
Minimum viable scan inputs:
- Website URL (required, validated)
- Industry (required, dropdown from `src/constants/industries.ts`)
- Location (required, city + country)
- **Top 3 competitor URLs (required, NEW)** — inline input with "Not sure? We'll suggest them" fallback that runs a quick LLM lookup
- Email: **NOT collected here** (friction kills scan-starts)

### Post-scan email gate (soft, not hard)
After scan completes, result page renders fully for 20 seconds, then a slide-up strip:
> *"Save your results? We'll email you this scan + notify you when competitors move."*
> `[email input] [Save & continue]` · "Skip for now" (small)

- Non-blocking. Skipping still lets them explore result page.
- BUT: entering the product dashboard (clicking "Explore your dashboard" CTA) **requires email**. This is the preview-account creation gate.
- Rationale: the result page is the hook, the dashboard is the commitment. Email for dashboard is fair trade.

### Signup form (commit to paid)
Triggered from any paywall modal:
- Email (prefilled from preview account)
- Password (or OAuth: Google)
- Paddle checkout inline (tier + billing cycle pre-selected from the modal context)
- Name is optional, captured later in settings

---

## Part 5 — CTA Rewrite

Five candidates:
1. "Activate my AI team"
2. "Get me into the answers"
3. "Start fixing my visibility"
4. "Put my agents to work"
5. "Turn my 2/30 into 25/30"

**Winner: #5 — "Turn my 2/30 into 25/30"** (numbers personalized from scan).

Defense: outcome-driven, specific, uses *their* number. It names the gap and promises to close it. Every other CTA is a verb without a destination. #5 has a destination. Fallback if the ratio is embarrassing-high (e.g., 18/30): use #1 "Activate my AI team" as default.

**Secondary CTAs (contextual per modal):**
- Agent modal: "Put [Agent Name] to work"
- Recommendations modal: "Show me all 11 fixes"
- Engine modal: "Scan me across all 7 engines"

Price is shown *below* the CTA as `from $79/mo · cancel anytime`, never in the button.

---

## Part 6 — Impact Scoring Logic (for the 3 visible fixes)

Each fix's `impact_points` needs to feel credible. Hybrid model:

**Heuristic base (deterministic, auditable):**
```
impact_base = sum over engines_helped of engine_weight × fix_lever_weight
```
- `engine_weight`: share of SMB-relevant AI traffic (ChatGPT 0.45, Gemini 0.25, Perplexity 0.15, Claude 0.08, others 0.07)
- `fix_lever_weight`: from GEO research (see 03-PRODUCT-VISION.md)
  - Stats + citations injection: 0.40 (proven +40-115%)
  - Schema / JSON-LD: 0.15
  - FAQ coverage: 0.20
  - Citation/directory building: 0.35
  - Content refresh: 0.25
  - Entity/Wikidata: 0.20

**Situational multiplier (LLM, per business):**
Claude Haiku takes the scan result + fix + competitor deltas and returns a 0.5-1.5 multiplier + one-sentence reasoning. Cached per scan.

**Final:**
```
impact_points = round(impact_base × situational_multiplier × 100)  // clamp 3-25
```

Result: a fix reads "+8-14 score pts" (we show a range = heuristic ± 30%). Range wording protects credibility when the actual post-rescan lift varies.

**Effort** is a static property of the agent type (Content Optimizer = Low, Entity Builder = High).
**Tier required** is derived from `agent_type → minimum_tier` mapping: Discover includes Content Optimizer, FAQ Builder, Schema Generator; Build adds Content Refresher, Citation Builder, Review Planner, Blog Strategist; Scale adds Entity Builder, Competitor Tracker, Performance Analyzer.

---

## User Stories

- As **Yael**, I want to see exactly which competitors AI recommends instead of me, so I feel the cost of inaction in 10 seconds.
- As **Yael**, I want to click into "Rankings" and see *my* data on a real dashboard, so I know what I'm buying before I pay.
- As **Avi**, I want to try clicking an agent and have the paywall show me exactly which agent and what it does, so the upgrade feels like a purchase, not a gate.
- As a returning preview user, I want to come back within 30 days via email and resume exactly where I was, so I don't lose context.

## Acceptance Criteria

- [ ] Given a completed free scan, when the user lands on result page, then they see headline ratio, 3 named competitors, per-engine cards, query grid (5 visible / 25 blurred), 3 visible fixes, 8 blurred fixes, and proof strip — in this order.
- [ ] Given the user provides email post-scan, when they click "Explore your dashboard," then a preview account is created and they land on `/dashboard` with all 8 preview pages accessible per the visibility matrix.
- [ ] Given the user clicks "Unlock to run" on any agent, when the paywall modal opens, then the modal headline references that specific agent and the primary CTA reads "Put [Agent Name] to work."
- [ ] Given the user has not converted within 24h, when the nudge email fires, then it deep-links back to their preview dashboard (no re-auth required within 30-day cookie).
- [ ] Given a fix is shown on the result page, when the user hovers its impact, then they see the heuristic basis ("ChatGPT + Perplexity, stats+citations lever") — not just a number.
- [ ] Given the scan returns visibility ≥ 20/30, the CTA auto-swaps from "Turn my X/30 into 25/30" to "Activate my AI team."

## RICE
Reach: ~4,000 free scans/qtr (est.) · Impact: 3 (activation is the whole funnel) · Confidence: 70% · Effort: 5 weeks · **Score: 1,680**

## Handoff
Build Lead owns implementation. Key new surfaces:
- `src/app/scan/[scan_id]/page.tsx` (rebuild to match Part 1 scroll order)
- `src/app/(protected)/dashboard/*` — add preview-mode gating per Part 2 matrix
- New: `src/lib/preview/` — preview account creation, session cookie, paywall-trigger context
- New: `src/lib/scoring/impact.ts` — Part 6 heuristic + Haiku multiplier
- Schema: `preview_users` table, `fixes` table (generated per scan), `scans.competitor_urls` column
