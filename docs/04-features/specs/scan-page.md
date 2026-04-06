# Beamix — Scan Results Page Spec

> **Last synced:** March 2026 — aligned with 03-system-design/

**Route:** `/scan/[scan_id]`
**Version:** 1.1
**Date:** 2026-02-28
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Status:** Updated

> This page is the emotional core of the Beamix product. It is the moment a business owner discovers their AI visibility reality. Every design and copy decision must serve one goal: create enough emotional impact that the user signs up.

---

## Page Properties

- **Public:** Yes — accessible without login
- **Shareable:** Yes — unique URL per scan, persists 30 days
- **Auth state:** Works for both anonymous and logged-in users
- **Mobile:** Fully responsive — many users will open a shared link on mobile

---

## AI Engines — Coverage Decision (LOCKED — System Design v2.1)

**Phase 1 — Launch (4 engines, API):** ChatGPT, Gemini, Perplexity, Claude. Used by Free scan, Starter, and all paid tiers. Claude is Phase 1 — NOT a paid-only engine.
**Phase 2 — Growth (3 more, API):** + Grok (xAI), DeepSeek, You.com. Total: 7 engines. Available to Pro and Business tiers.
**Phase 3 — Deferred (3 more, browser simulation):** + Copilot, AI Overviews, Meta AI. Browser simulation only — deferred. Do NOT claim until shipped.

**Free scan** uses all 4 Phase 1 engines (ChatGPT, Gemini, Perplexity, Claude). Show 4 cards on results page.

**Copy guidance:** Free scan page: "Scan across 4 major AI search engines." Results page: Show exactly which engines ran (4 cards for free scan). Do NOT claim Copilot or AI Overviews until Phase 3 ships.

> *Updated 2026-03-08 — Engine counts corrected: Free/Starter=4 (Phase 1), Pro=7 (Phase 1+2), Business=10 (Phase 1+2+3). Claude is Phase 1 (all tiers including free). Phase 2: Grok, DeepSeek, You.com.*

**Placeholder in this spec:** "major AI engines" — replace with exact count and list when decided.

---

## Page Sections Overview

```
┌─────────────────────────────────────────────────────┐
│  SECTION 1: Header — Business identity + score       │
├─────────────────────────────────────────────────────┤
│  SECTION 2: THE ANIMATION — Ranking reveal           │
│  (This is the hero moment. Full screen on mobile.)   │
├─────────────────────────────────────────────────────┤
│  SECTION 3: Score breakdown — What the score means   │
├─────────────────────────────────────────────────────┤
│  SECTION 4: Per-engine breakdown                     │
├─────────────────────────────────────────────────────┤
│  SECTION 5: Top competitor callout                   │
├─────────────────────────────────────────────────────┤
│  SECTION 6: Quick wins (3 free recommendations)      │
├─────────────────────────────────────────────────────┤
│  SECTION 7: Conversion CTA — Blurred / gated area    │
├─────────────────────────────────────────────────────┤
│  SECTION 8: Share mechanic                           │
└─────────────────────────────────────────────────────┘
```

---

## Phase 0 — Scan Running State

**What the user sees while the scan is processing (30–60 seconds)**

**Layout:**
```
[Beamix logo — top left]

        Scanning [Business Name]
        across major AI engines...

   [ChatGPT logo]  ●●●  Checking...
   [Gemini logo]   ●●●  Checking...
   [Claude logo]   ●●●  In queue...
   [Perplexity]    ●●●  In queue...
   [...]           ●●●  In queue...

        Analyzing competitive landscape...
        Generating your visibility score...
```

**Animation behavior:**
- Each engine row animates sequentially — "Checking..." → "Analyzing..." → green checkmark
- Progress is fake-sequential (real processing is parallel on server) but gives the user something to watch
- Estimated time shown: "Results in about 60 seconds"
- Background: dark, atmospheric — mirrors the hero illustration mood

**Copy:**
- Header: `Scanning [Business Name]...`
- Subtext: `We're querying every major AI engine with real prompts about your business.`
- Bottom line: `Results in about 60 seconds — we'll show you exactly where you stand.`

**Dev note:** This screen is shown from the moment the scan is triggered until `status = 'completed'` in the database. Poll `/api/scan/[scan_id]/status` every 3 seconds.

---

## Phase 1 — Scan Complete → Animation Trigger

When `status = 'completed'`, the scan running screen transitions directly into the animation. No intermediate screen. The transition is the beginning of the animation.

**Transition:** The "Checking..." rows fade out. The screen darkens slightly. The ranking table fades in from below.

---

## THE ANIMATION SPEC — Ranking Reveal

> This is the emotional hero moment of the entire product. Every detail matters.

### Setup — The Ranking Table

Before the animation begins, a ranking table is visible but dimmed/blurred:

```
  RANK    BUSINESS                AI VISIBILITY
  ─────────────────────────────────────────────
   #1     [Competitor A]          ████████████  89
   #2     [Competitor B]          ██████████    74
   #3     [Competitor C]          ████████      61
   #4     [Competitor D]          ██████        48
   ...
   #?     [YOUR BUSINESS]         ░░░░░░░░░░    ??
```

**Table design:**
- Each row is a solid card/block — not a thin table row. Chunky, visible, has weight.
- Competitor blocks: dark background, muted — they are the "before" state
- User's business block: distinctive color — #3370FF blue glow, slightly larger than competitors
- The user's block starts at the BOTTOM of the visible list

**Combined score:** One score per business, aggregated across all AI engines scanned. Not per-engine in this view.

---

### Animation Sequence

#### Phase A — Charge-Up (0.0s → 2.0s)

The user's business block, sitting at the bottom, begins to charge.

- **Shake/tremble:** The block vibrates horizontally — subtle at first (±2px), intensifying to ±6px over 1.5 seconds. Frequency increases as it charges.
- **Light beams converge:** From the four corners and sides of the screen, thin rays of blue/white light travel INWARD toward the business block. They converge into the block like energy being absorbed.
- **Block glow intensifies:** The block's border glow brightens from dim → bright #3370FF blue. An inner pulse expands outward from the block center.
- **Sound design note (future):** A low rising hum, like powering up. Not required for v1.

**Timing:**
- 0.0s: Beams begin appearing at screen edges, traveling inward
- 0.5s: Block begins trembling
- 1.5s: Beams reach the block, absorbed
- 2.0s: Block is fully charged — flash of white light, trembling stops abruptly

**Dev note:** Implement beams as absolutely-positioned `<div>` elements with CSS transforms and transition animations. The tremble is a keyframe animation on `transform: translateX()`. The convergence can use SVG lines with stroke-dashoffset animation.

---

#### Phase B — Ascent (2.0s → 4.5s)

The block launches upward through the ranking table.

- **Launch:** After the charge flash, the block begins moving upward. Not floating — it MOVES. Accelerates quickly, then slightly decelerates as it passes each competitor.
- **Passing competitors:** As the user's block passes each competitor row, the competitor block briefly illuminates (blue tinge) then dims back to muted. Like a shockwave passing through them.
- **Trail:** A faint blue trail/streak follows the block as it ascends. Fades within 0.3s.
- **Competitors displaced:** Competitor blocks subtly shift downward as the user's block passes them — they yield position.

**Timing per position:**
- Each position takes ~0.3–0.4s to pass
- Total ascent time scales with number of positions climbed
- Maximum ascent time capped at 3.5s regardless of distance (compress timing if many competitors)

**Dev note:** Animate using CSS `transform: translateY()` with a custom easing curve. Use `framer-motion` layout animations for the competitor reordering. The key is that the blocks physically rearrange — not just numbers changing.

---

#### Phase C — Landing, Variant A: Business IS Ranked (4.5s → 6.0s)

The block arrives at the business's actual current position and settles.

- **Deceleration:** Block slows dramatically in the last 0.5 positions, like a car braking.
- **Settlement:** Block lands with a subtle bounce (spring physics). The blue glow pulses once — a "locked in" feeling.
- **Score reveal:** The business's AI Visibility Score counts up from 0 to actual score. Duration: 1.0s. Number font is large, bold.
- **Position badge:** A badge appears on the block: `#[N] across AI search`
- **Status label:** Color-coded label appears below score:
  - Score 0–30: `Critical — You're nearly invisible` (red)
  - Score 31–60: `Fair — You have room to grow` (amber)
  - Score 61–80: `Good — You're being seen` (green)
  - Score 81–100: `Excellent — You're highly visible` (bright green)

**Copy on block (when settled):**
```
[Business Name]
#3 across AI search
━━━━━━━━━━━━━━━
Visibility Score: 47/100
Fair — You have room to grow
```

---

#### Phase C — Landing, Variant B: Business is NOT FOUND (4.5s → 6.5s)

The block rises, but has no real destination. It rises to a projected position — where Beamix estimates it COULD rank after optimization.

- **Projected position:** Calculated based on industry averages and scan data. Shown as a "ghost" position — dotted border, slightly transparent.
- **Landing:** Block settles into the projected (ghost) position with the same spring bounce, but the block itself has a slightly different visual treatment — a dotted/dashed border instead of solid.
- **Score reveal:** Score counts up to actual score (likely 0–15 for a not-found business). Then a second counter appears below showing "Projected: XX/100" in a different color.
- **Label:** `Currently invisible to AI search`
- **Projection label (below the block, prominent):**

```
┌─────────────────────────────────────────────┐
│  ✦  With Beamix optimization:               │
│     You could rank #[N] within 30 days       │
└─────────────────────────────────────────────┘
```

- **Visual treatment:** The ghost position above shows competitor blocks that are displaced — as if making room. This communicates possibility without deceiving.

**Dev note:** The projected position is a server-calculated estimate stored in `free_scans.results_data` as `projected_rank`. Algorithm: median rank of businesses in same industry + location that completed optimization with Beamix. For v1, this can be a simple heuristic (e.g., top-third of industry average).

---

#### Phase D — Full Results Reveal (6.0s → 7.5s)

After the block settles, the rest of the page reveals itself below the animation.

- The animation component stays visible at the top (scrollable past)
- Below it, sections fade in sequentially with 0.15s stagger between each card
- Scroll is now enabled (locked during animation)
- A subtle prompt appears: `↓ See your full breakdown` with a gentle bounce arrow

**Dev note:** Lock `overflow: hidden` on body during animation. Unlock after Phase D begins. Use `IntersectionObserver` to trigger section reveals as user scrolls.

---

## Section 1 — Page Header

**Positioned above the animation. Visible before animation begins.**

```
[Beamix logo]

  AI Visibility Report
  [Business Name]
  [website-url.com]  ·  [Industry]  ·  [Location]

  Scanned: February 28, 2026 · Across [N] AI engines
```

**Copy:**
- `AI Visibility Report` — small label, muted
- Business name: large, bold, white
- URL + industry + location: small, muted, single line
- Scan timestamp: very small, bottom of header

---

## Section 3 — Score Breakdown

**What the score means — shown after animation**

```
Your AI Visibility Score: 47/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  0          47              100
  ●──────────●───────────────○
  Invisible        You       Dominating
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What this means:
When potential customers ask AI engines about your
industry and location, your business is mentioned in
roughly [X]% of relevant queries.

Your top competitor scores [XX]/100.
```

**Score legend:**
- 0–30: Red zone — "AI search does not know you exist"
- 31–60: Amber zone — "You appear occasionally, but inconsistently"
- 61–80: Green zone — "You're visible. Now optimize."
- 81–100: Bright green — "You're dominating AI search in your category"

---

## Section 4 — Per-Engine Breakdown

**Collapsed by default. User can expand.**

```
[Expand: See breakdown by AI engine ▼]
```

When expanded:
```
  ChatGPT         #4    ████████░░  Mentioned positively
  Perplexity      #2    ██████████  Top result
  Gemini          —     ░░░░░░░░░░  Not found
  Claude          #7    ████░░░░░░  Mentioned briefly
  [Other engines] ...
```

**Dev note:** This section pulls from `scan_engine_results` per LLM (columns: engine, rank_position, is_mentioned, sentiment, business_id, scan_id). Show only engines that were actually scanned for this scan. Future engines can be added without redesign.

---

## Section 5 — Top Competitor Callout

**One standout competitor — the most emotionally impactful data point.**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⚠  Your top competitor outranks you            │
│                                                 │
│  [Competitor Name]  scores  [XX]/100            │
│  They appear in [X]x more AI queries than you.  │
│                                                 │
│  The gap: [XX] points                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Copy variations:**
- If competitor is far ahead: `[Competitor] is dominating AI search in your category. Every day, customers who should be finding you are finding them.`
- If competitor is close: `You're within striking distance of [Competitor]. A few targeted improvements could put you ahead.`
- If user IS #1: `You're the most visible business in your category on AI search. Let's make sure you stay there.`

---

## Section 6 — Quick Wins (Free)

**3 specific, actionable recommendations — shown free, no signup required.**

```
  Your 3 Biggest Opportunities

  ┌─────────────────────────────────────────┐
  │  [HIGH IMPACT]                          │
  │  Add a structured FAQ page              │
  │  AI engines prioritize businesses with  │
  │  clear Q&A content. You don't have one. │
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │  [HIGH IMPACT]                          │
  │  Add LocalBusiness schema markup        │
  │  Your website is missing JSON-LD data.  │
  │  Gemini and ChatGPT can't map your      │
  │  service area without it.               │
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │  [MEDIUM IMPACT]                        │
  │  Publish content about [Industry Topic] │
  │  Your competitor ranks #1 for this      │
  │  query. You have no content targeting   │
  │  it.                                    │
  └─────────────────────────────────────────┘
```

**Below the 3 cards — blurred teaser:**
```
  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  │  [BLURRED]  5 more high-impact fixes    │
  │  [BLURRED]  waiting for you...          │
  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                   [Unlock Free →]
```

---

## Section 7 — Conversion CTA

**The most important section. Creates urgency without being pushy.**

**Headline:**
`Your business has [X] fixable visibility gaps. Our agents fix them for you.`

**Subheadline:**
`Create a free account to save this scan, see your full action plan, and let Beamix's AI agents start fixing your visibility.`

**What's inside (teased):**
```
  Create your free account and unlock:

  ✦  Full action plan (8 recommendations, not just 3)
  ✦  AI agents that write the content for you
  ✦  Weekly re-scans to track your progress
  ✦  Side-by-side competitor comparison
```

**Primary CTA Button (large, full-width on mobile):**
`Fix My Visibility — Create Free Account →`

**Secondary option:**
`Already have an account? Log in to save this scan`

**Trust signals below button:**
`7-day free trial · No credit card required · Cancel anytime`

**Dev note:** The CTA button passes `?scan_id=[scan_id]` to the signup URL so the scan is linked to the account automatically after registration. This is the critical conversion handoff.

### Scan Methodology Limitations Disclosure

Below the per-engine breakdown (Section 4), include a small expandable disclosure:

```
[ℹ️ How we scan — methodology note ▼]

Results are based on API queries to each AI engine and may differ from what a user
sees in the consumer chat interface. API responses may not reflect personalization,
location-based filtering, or UI-level formatting applied by each engine.

Beamix measures an "AI visibility signal" — a reliable indicator that correlates
with consumer-facing visibility, but not an exact ranking guarantee.
```

**Dev note:** This disclosure is required per Intelligence Layer §1.5 (Scan Methodology Limitations). Keep it collapsed by default. Use "AI visibility signal" or "AI visibility indicator" — not "AI ranking" — in all marketing copy.

---

## Section 8 — Share Mechanic

**Bottom of page. Lightweight.**

```
  Share your AI visibility score

  [Copy Link]   [Share on LinkedIn]   [Share on X]

  "I just discovered my AI visibility score is 47/100.
   Find out yours at beamix.io"
```

**Pre-written share copy:**
- LinkedIn: `I just ran an AI visibility scan on [Business]. Score: [X]/100. If your business isn't showing up when people ask ChatGPT or Gemini for recommendations, you're losing leads you don't even know about. Free scan: beamix.io`
- X/Twitter: `Just found out [Business] scores [X]/100 for AI search visibility. Is your business invisible to ChatGPT? Find out free: beamix.io`

**Dev note:** Share URL is the scan's own `/scan/[scan_id]` — it's public and shareable. The shared page shows the same results. If the scan is for a competitor's business that a user ran on purpose, the share still works (the URL is the only access key).

---

## Data Requirements

The following data must be present in `free_scans.results_data` (JSONB) for this page to render:

```typescript
interface ScanResultsData {
  overall_score: number;                    // 0–100
  rank_position: number | null;             // null = not found
  projected_rank: number;                   // Always present — used for Not Found variant
  total_businesses_in_category: number;     // For "X out of Y" framing
  competitors: {
    name: string;
    score: number;
    rank: number;
  }[];
  top_competitor: {
    name: string;
    score: number;
    rank: number;
  };
  per_engine_results: {
    engine: string;                         // 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | ...
    rank: number | null;
    sentiment_score: number;                // 0-100 integer (0=very negative, 50=neutral, 100=very positive)
    sentiment_label: 'positive' | 'neutral' | 'negative';  // Derived from score: 0-33=negative, 34-66=neutral, 67-100=positive
    mentioned: boolean;
  }[];
  ai_readiness_score?: number;              // 0-100 AI readiness audit score (quick assessment from website analysis)
  quick_wins: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];                                      // Exactly 3 for free scan
  full_recommendations_count: number;       // How many total recs are gated
}
```

---

## States & Edge Cases

| State | What to show |
|---|---|
| Score = 0, not mentioned anywhere | Variant B animation. Competitor table still shows. Strong "you have nowhere to go but up" framing. |
| Score = 100, ranked #1 everywhere | Special celebration state. Confetti. "You're already dominating. Let's keep you there." |
| Only 1–2 competitors found | Table still works with fewer rows. Animation still runs. |
| No competitors found | Table shows "No competitors detected in this category" — but user's block still animates against a generic benchmark. |
| Scan failed / timeout | Error state: "Scan encountered an issue." Retry button. No charge to platform budget. |
| Scan accessed after 30 days | Expired state: "This scan has expired. Run a new free scan to see your current results." |

---

## Animation — Implementation Notes

**Recommended library:** Framer Motion (already in project dependencies)

**Key animation primitives needed:**
- `useAnimate` hook for sequenced animation phases
- `layout` prop on competitor blocks for smooth reordering
- Custom SVG beam component for light ray convergence
- `spring` physics for the settlement/bounce on landing

**Performance:**
- Run animation only once on first load. If user refreshes, skip to final state.
- Use `prefers-reduced-motion` media query — if true, skip directly to final state with a simple fade.
- Mobile: Simplify beam animation (fewer beams, shorter duration).

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent) + Founder*
*This spec defines the scan results page — the emotional core of the Beamix product.*
