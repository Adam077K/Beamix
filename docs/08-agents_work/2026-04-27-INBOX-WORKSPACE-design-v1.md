# Beamix — `/inbox` and `/workspace` Detailed Design v1

**Date:** 2026-04-27
**Author:** Senior Product Designer
**Status:** v1 — first detailed spec for the consent surface (`/inbox`) and the agent-at-work surface (`/workspace`).
**Sources of truth:**
- Frame 5 v2 (LOCKED) — `2026-04-26-FRAME-5-v2-FULL-VISION.md`
- Master Designer's Brief — `2026-04-26-BOARD3-seat-2-designer.md`
- Worldbuilder's Brief — `2026-04-26-BOARD3-seat-4-worldbuilder.md`
- Trust & Safety attack — `2026-04-26-BOARD2-seat-4-safety.md`
- Adam's stated /workspace vision — `2026-04-25-DECISIONS-CAPTURED.md`

These two surfaces are designed together because they share an interaction pattern — the customer either approves Beamix's work (`/inbox`) or watches Beamix do the work (`/workspace`). Designed in a single document, they enforce coherence: the same agent attribution, the same Beamix voice, the same Seal-draw ceremony on approval, the same hand-drawn register.

This is a design spec, not engineering spec. Pixels are at 1440×900 desktop unless stated. Motion timings are precise. Tokens reference the Master Designer's locked system (Section 1 of `BOARD3-seat-2-designer.md`).

---

# PART A — `/inbox` — the consent surface

## A1. The page job

### Who's here, why, how often

`/inbox` is the page where customers review Beamix's proposed work. It is the consent surface. It is the place where the customer's signature lives — every approval, every rejection, every modification. It is also the place where the Trust Architecture becomes visible: when the customer is keeping up, when the customer has fallen behind, and when Beamix has paused itself to wait for the customer to catch up.

Two customer archetypes use it differently:

- **Sarah** (B2B SaaS founder, 8-50 employees, plays both founder and marketing-operator roles) visits `/inbox` **once or twice per week**, typically Monday morning after reading the Monday Digest. She processes 3-8 items in a 4-minute session. Her primary interaction is approve. She rejects rarely. She modifies almost never. She is here because Beamix's proposal landed in her email and she's clearing decisions on her way to the rest of her day.
- **Yossi** (e-commerce / agency operator with 5-20 client workspaces) visits `/inbox` **daily**, sometimes multiple times. He may process 30-100 items per day across all clients. He uses keyboard shortcuts. He bulk-approves items in Brief-aligned categories. He cares about per-client filtering, per-agent filtering, and the audit log. For him, `/inbox` is the operational core of his agency.

Both share the same surface. Density and tier-gated affordances differentiate.

### The contract

**Only items that need human attention land in `/inbox`.**

This is critical and non-negotiable. The Trust Architecture's tier-of-trust system divides every agent action into three classes:

1. **Auto-run-post-review** (Schema fixes, FAQ additions, citation corrections): Beamix executes immediately, then logs the action. These DO NOT appear as items needing approval. They appear as **"Applied" notifications** in the Auto-completed tab — a different visual register, never demanding attention. Sarah can audit them but is not asked to act on them.
2. **Pre-approve** (Content rewrites, FAQ entries on sensitive topics, brand-voice-adjacent text): Beamix drafts and waits. These appear as **Pending** items in the central column.
3. **Always-escalate** (Pricing claims, brand-voice changes, regulated-vertical content per T&S Section 1): Beamix flags these explicitly. They appear as Pending items with red borders, a "Read carefully" header, and a Truth-File-violation indicator if applicable.

If the inbox is full of items the customer doesn't need to see, the contract is broken. The fix is to retune the trust tier router, not redesign the surface. Designers must respect: **`/inbox` is a high-signal queue, not a notification stream.**

### Relationship to Trust Architecture

`/inbox` is the place where the **review-debt counter** lives (per T&S Section 4 mechanism #4). The counter is the load-bearing structure under the marketing claim "Beamix does the work." Without it, auto-run-post-review degrades silently to auto-run-no-review, and Beamix becomes the next AI safety story.

The counter is visible at the top of `/inbox` at all times. It is also mirrored at the top of `/home`. Both views update in real time. The counter has three states (covered in detail in A4) and can pause non-critical agent activity when in the active red state. This pause is the mechanism that prevents the Day-180 incident from T&S's Scenario 1.

The Brief underwrites everything. Every item in `/inbox` references the Brief clause that authorizes the proposed action ("references your Brief: '*show up for emergency-plumbing queries*'"). Brief clauses that don't appear in any item are dormant; the customer can prune them on `/settings → Brief`. The relationship is: the Brief is the constitution, `/inbox` is the place the customer signs amendments and ratifications.

---

## A2. Layout

`/inbox` is a 3-pane Linear-pattern surface customized for Beamix. At 1440px desktop, the layout is:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Topbar (60px)  ── Beamix wordmark · Search · Profile · Status pulse        │
├────────────┬────────────────────────────┬────────────────────────────────────┤
│            │  Header strip (88px)       │                                    │
│            │  ─ Tab nav + Counter ─     │                                    │
│            │                            │                                    │
│  Filter    │  Item list                 │  Preview pane                      │
│  Rail      │  (rows)                    │  (selected item full diff)         │
│  240 px    │  440 px                    │  ~600 px (≈ 40% of viewport)       │
│            │                            │                                    │
│            │                            │                                    │
│            │                            │                                    │
└────────────┴────────────────────────────┴────────────────────────────────────┘
                                                                    1440 px
```

Total: 240 + 440 + ~600 = 1280 plus 80px outer margins. The layout is content-width-locked at 1280; viewports above 1440 receive symmetric outer breathing space. Below 1280, the right pane progressively narrows. Below 1024, the layout collapses to mobile (Section A7).

### Filter rail (left, 240px wide, full-height)

Sticky to the left edge of viewport. Padding: 24px top, 16px horizontal. Background: `paper` (`#FFFFFF`). 1px right border at `border` token (rgba(10,10,10,0.06)).

**Top section — Review-debt counter (pinned at top, always visible):**

This is the load-bearing element of the entire page. It is *not* in the header; it is in the rail because (a) it is a persistent state, not a tab; (b) it must be visible regardless of which tab is active.

In the green/normal state (0–2 items un-reviewed):
```
┌─────────────────────────────┐
│ All caught up               │  <- 13px Inter 500 ink-2
│ Beamix is working in the    │
│ background.                 │  <- 13px Inter 400 ink-3
└─────────────────────────────┘
```
No icon, no border. Just a quiet two-line block.

In the yellow/notice state (3–4 items un-reviewed for 1–4 days):
```
┌─────────────────────────────┐
│ ● 3 items waiting since     │  <- 13px Fraunces italic 300 ink-2
│   Tuesday.                  │     6px amber dot
│ Beamix pauses non-critical  │  <- 12px Inter 400 ink-3
│ agents at 5 items + 5 days. │
└─────────────────────────────┘
```
The Fraunces italic here is a deliberate choice (per Master Designer 2.2): the counter *whispers, doesn't shout*. The amber dot is `#F59E0B`. Background: `paper-elev` with 1px `border-strong` left edge at brand-amber.

In the red/active state (5+ items, >5 days):
```
┌─────────────────────────────┐
│ ● 7 items waiting           │  <- 13px Fraunces italic 300 ink-2
│   since Apr 17.             │     6px red dot, pulsing
│                             │
│ Beamix has paused           │  <- 13px Inter 500 ink-2
│ non-critical agents.        │
│                             │
│ [ Catch up → ]              │  <- 13px Inter 500, brand-blue button, 32px tall
└─────────────────────────────┘
```
The red dot pulses on `motion/ring-pulse` (1200ms ease-in-out sine). The "Catch up" button triggers a guided bulk-review flow (described in A4). Background: `paper-elev` with 1px brand-red left edge.

The counter never shifts position. The states transition by content, not layout. This stability is the design.

**Middle section — Filter list (24px below counter, 16px section gap):**

```
TIER OF TRUST                <- 11px caps tracking 0.10em ink-4
  All                     12  <- 13px Inter 400 ink, count right-aligned 13px Geist Mono ink-4
  Pre-approve              7
  Always-escalate          1  <- count colored brand-red if >0
  Auto-applied (info)     ··  <- "··" instead of count (it's a stream, not a queue)

TOPIC
  Schema                   3
  FAQ                      4
  Citation                 2
  Content                  1
  Brand voice              1
  Pricing                  1

RECENCY
  Today                    2
  This week                7
  Older than a week        3
```

Each filter row is 32px tall, hover background `rgba(10,10,10,0.03)`, active state has a 2px brand-blue left border and `paper-elev` background. Counts are tabular (`tnum`). Multi-select via shift-click; clear-all link at the bottom.

**Tier-gated filters:**
- **Discover ($79/mo):** Sees `Tier of Trust` and `Topic`. No `Recency`. No `Per-client`.
- **Build ($189/mo):** Adds `Recency` and `Per-agent` (a roster of the 11 agents with monogram + name).
- **Scale ($499/mo):** Adds `Per-client` filter (Yossi's killer affordance — switches the entire `/inbox` queue between his client workspaces).

Tier gates render as muted (40% opacity) sections with a small padlock glyph and hover-tooltip "Available on Build →" / "Available on Scale →". Click → opens upgrade modal. This is *promotion in place*, not hidden capability — Sarah on Discover sees what Build offers, lightly.

**Bottom section — Bulk actions (sticky at rail bottom, 96px tall block, only appears when ≥1 item is selected):**

```
┌─────────────────────────────┐
│ 4 selected                  │  <- 13px Inter 500 ink
│                             │
│ [ Approve all ]             │  <- 36px brand-blue button
│ [ Reject all ]              │  <- 36px ghost
│ [ Clear selection ]         │  <- 32px text-link ink-3
└─────────────────────────────┘
```

Discoverable via shift-click on item rows or `Cmd+A` keyboard shortcut.

### Header strip (top of center+right panes, 88px tall)

Below the topbar, spanning columns 2 + 3 (1040px wide). Padding: 24px horizontal, 16px vertical.

**Tab navigation (left side):**
```
Pending [12]   Drafts [3]   Live [47]   Auto-applied [128]
```

Tabs are 14px Inter 500 caps, 0.06em tracking. 36px tall. Active tab has a 2px brand-blue underline and `ink` color; inactive tabs are `ink-3`. Counts are 12px Geist Mono ink-4 in square brackets (tabular).

- **Pending** — items waiting for the customer's decision. The default tab.
- **Drafts** — items the customer started to modify but didn't finish (auto-saved every 30s).
- **Live** — items the customer approved, applied, awaiting confirmation that Beamix's downstream pipeline succeeded.
- **Auto-applied** — the audit stream of auto-run-post-review actions. Different visual register (see A5).

**Right side — utilities:**
- A search field (240px wide, 36px tall) — placeholder "Search inbox…" — searches diff text + Brief clause references + agent names.
- A keyboard-shortcuts hint icon — clicking opens a Cmd+K-style overlay listing all shortcuts (`j`/`k` next/prev, `e` approve, `r` reject, `m` modify, `n` add note, `?` help).
- A density toggle (compact / cozy) — Yossi will use compact; Sarah will use the default cozy.

**Below the header strip:** a 1px `border` divider, then the item list and preview pane begin.

### Item list (center, 440px wide)

Sticky scroll container. Each item is a row.

**Row anatomy (cozy density, 112px tall):**

```
┌────────────────────────────────────────────────────┐
│  [ ]   ◐ Citation Fixer                  Apr 24    │  <- 16px top padding
│                                                    │
│  Add 11 FAQ entries to /services/                  │  <- headline, 16px Inter 500
│  emergency-plumbing                                │
│                                                    │
│  + 11 entries  · 0 errors  · est. +0.4 score       │  <- diff preview 13px Geist Mono
│                                                    │
│  [pre-approve · 32 sec read]                       │  <- tier badge, right-aligned
│                                       Press `e`    │  <- shortcut hint, 11px caps
└────────────────────────────────────────────────────┘
```

Components:

- **Checkbox (left, 16px):** Hidden until hover or keyboard navigation. `Shift+click` selects a range.
- **Agent monogram (◐):** 16×16 Rough.js circle, agent's color, consistent seed per agent (Master Designer 1.6). Citation Fixer is mid-blue; Schema Doctor is teal; FAQ Agent is amber-warm; etc. The roster of 11 colors is locked in `BOARD3-seat-2-designer.md`.
- **Agent name:** 14px Inter 500 ink. Externally-customer-facing surfaces say "Beamix"; **`/inbox` is the one place the agent name appears** because it's a power-user-adjacent surface (per Frame 5 v2: "Single-character externally; 11+ agents only in /crew for power users"). However, the row never says "Schema Doctor said"; it says "*Citation Fixer worked on this*" — attribution, not voice. Voice is always Beamix.
- **Date (right-aligned):** 13px Geist Mono ink-4. Format: "Apr 24" (current year), "Apr 24 '25" (prior year). Today's items: "Today", "2h ago".
- **Headline:** 16px Inter 500 ink, max 2 lines, ellipsis. The agent's one-sentence summary of what it did.
- **Diff preview:** 13px Geist Mono ink-3, 1 line. Quantitative summary. Plus signs are `score-good`, minus signs are `score-critical`, neutral facts are ink-3.
- **Tier badge (bottom-left):** A small pill, 24px tall, 11px Inter 500 caps with 0.06em tracking. Three variants:
  - `pre-approve` — `paper-elev` background, ink-3 text, no border
  - `always-escalate` — brand-red-soft background (rgba(239,68,68,0.06)), `score-critical` text, 1px brand-red border
  - `auto-applied` — `brand-blue-soft` background, brand-blue text — only appears in Auto-applied tab
- **Shortcut hint (bottom-right):** 11px caps Inter 500 ink-4. "Press `e`" only on the focused row. Helps Yossi internalize keyboard flow.

**Row states:**
- Default: `paper` background, `border` 1px bottom divider only (no full border).
- Hover: `paper-elev` background, divider deepens to `border-strong`. Cursor pointer.
- Selected/focused (keyboard or click): 2px brand-blue left border, `paper-elev` background. The preview pane updates simultaneously.
- Multi-selected (via checkbox): 2px brand-blue left border, `brand-blue-soft` background.
- Approved (mid-flight, before backend confirms): collapses to 56px with strikethrough headline + small "Approved · applying…" text. Hold for 800ms then animates out (slide up + fade), leaving a 40px "Item moved to Live →" toast in its place that auto-dismisses after 2s.

**Compact density (Yossi):** 64px tall rows. Headline truncates to 1 line. Diff preview hidden (visible only on hover). Tier badge becomes a 12×12 colored dot.

**Empty state:** when no items are pending, the list area renders the success state — see A2 below.

### Preview pane (right, ~600px wide / 40% of viewport)

The full diff + reasoning + decision affordances. Sticky scroll container with internal scroll (the pane has its own scroll while the item list has its own).

**Anatomy (top to bottom):**

**1. Header section (96px tall, sticky to top of pane):**
```
◐ Citation Fixer                 [pre-approve]
─────────────────────────────────────────────
references your Brief:
"show up for emergency plumbing queries"
```

- Agent monogram (32×32 Rough.js, agent color) + agent name (18px InterDisplay 500).
- Tier badge (top-right).
- A 1px divider.
- Brief clause reference: 13px Inter 400 ink-3, with the actual clause in 13px Fraunces italic 300 (the editorial register reminding the customer this traces back to their constitution). Click → scrolls to that clause in `/settings → Brief`.

**2. Body — the diff (~400-800px tall, scrolls):**

The diff is rendered code-style, with green (`score-good`) gutters for additions, red (`score-critical`) for removals. Monospace (Geist Mono 13px). Full content shown — not preview. Scrollable.

For Schema diffs:
```
{
  "@context": "https://schema.org",
+ "@type": "FAQPage",
+ "mainEntity": [
+   {
+     "@type": "Question",
+     "name": "Do you offer 24-hour emergency service?",
+     "acceptedAnswer": {
+       "@type": "Answer",
+       "text": "Yes, we serve Tel Aviv 24/7..."
+     }
+   },
    ...
}
```

For content rewrites:
```
- Our team brings decades of experience to every project.
+ We've handled emergency plumbing in Tel Aviv since 2012.
+ Same-day service for clogged drains, burst pipes, and water heaters.
```

For FAQ additions, each new entry appears as a card with question + answer pair.

**3. "Why this matters" section (collapsible, default expanded for first-time users, default collapsed for returning users):**

```
▼ Why we propose this
   Perplexity asks "who can come now?" 4× more often than
   "who's licensed?" on emergency-plumbing queries. We
   phrased the FAQ to answer that pattern. Citation
   probability estimated at 31% (currently 4%).
```

- Heading: 13px Inter 500 caps tracking, with chevron.
- Body: 14px Inter 400 ink-2, line-height 22. 2-3 sentences. The agent's reasoning, in Beamix-voice (not "I think" but "we phrased… because…").
- Confidence/probability is reported when available, with the methodology tucked into a small "How we calculate this →" link.

**4. Truth-File check (only on always-escalate items):**

```
─────────────────────────────────────────────
✓ Matches your Truth File on hours, services
✗ References pricing — your Truth File says
  "contact us" for pricing. Confirm before
  approving.
```

13px Inter 400, with `score-good` checkmarks and `score-critical` X marks. This is the visible enforcement of the Customer Truth File from T&S Section 4 mechanism #1.

**5. Decision buttons (sticky to bottom of pane, 88px tall, top divider 1px `border`):**

```
┌─────────────────────────────────────────────┐
│  [ Approve ]   [ Modify ]   [ Reject ]      │
│                                             │
│  + Add note to House Memory                 │
└─────────────────────────────────────────────┘
```

- **Approve:** Primary CTA. 44px tall, brand-blue background, white text, 8px radius. 14px Inter 500. Spans 240px wide. Keyboard shortcut `e` (for "execute"). On hover, a tiny Rough.js seal-mark draws itself in 200ms next to the button text — foreshadowing the artifact you're authorizing (Master Designer 2.2).
- **Modify:** Ghost button. 44px tall, transparent with `border-strong` 1px, ink text. 14px Inter 500. 120px wide. Keyboard shortcut `m`.
- **Reject:** Ghost with red text. 44px tall, transparent with red border at 24% opacity. `score-critical` text. 14px Inter 500. 120px wide. Keyboard shortcut `r`.
- **Add note:** Text-link below buttons, 13px Inter ink-3. Keyboard shortcut `n`. Opens the Margin Note inline editor (see A6).

The button row is **sticky** so it never disappears as the customer scrolls a long diff. This matters: a customer reading a 40-line schema diff should be able to approve without scrolling back.

### Empty state — "the success state"

When `Pending [0]` and the customer is in the Pending tab, the central column renders:

```
                                                    (centered, 640px max-width)



              [ 96×120 hand-drawn illustration ]
              (a desk drawer, slightly ajar, with
               a checkmark sketch — Rough.js, ink-3
               linework, locked seed for stability)



              Nothing for you.

              Beamix is working on 3 things in
              the background. We'll come find you.



              ── Your crew                            <- 22px Fraunces italic 300 ink-3
```

- Top breath: 96px from header strip
- Illustration: 96×120, Rough.js, locked seed (does not change between visits — the same desk drawer is part of the brand vocabulary)
- Headline: 32px InterDisplay 500 ink (text-h2)
- Body: 18px Inter 400 ink-3, line-height 28
- Signature: 22px Fraunces italic 300 ink-3, 96px below body — the brand's verbal seal (per Master Designer 1.4, the signature line *travels* across all surfaces)

The empty state IS the success state. The voice is unhurried, not promotional. There is no "Run a scan now" CTA, no upsell, no "Did you know Beamix can…" tooltip. Sarah closes the tab and goes back to her morning. That is the ceremony.

The illustration is one of the three hand-drawn illustrations Frame 5 v2 retained on emotionally-significant pages. The other two are the `/onboarding` Brief signature and the `/scan` strikethrough mechanic.

**Empty state for Drafts:** a different illustration (a pencil and small notebook, 96×120). Body: "No drafts in progress."

**Empty state for Live:** plain text, no illustration. "Nothing recently applied."

**Empty state for Auto-applied:** a chronological timeline (see A5). Never empty in normal operation.

---

## A3. The approval interaction — the Seal-draw ceremony

The moment the customer clicks Approve is the most important moment in `/inbox`. It is the cinematography of consent (per Master Designer Move 3). It is the moment the customer signs.

### The full sequence (timed to milliseconds)

**T = 0ms:** Customer clicks Approve (or presses `e`).

**T = 0–80ms:** The button receives `motion/pill-spring` — scale 1.0 → 0.96 → 1.04 → 1.0 over 280ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (mild back-out overshoot). This is the haptic feedback equivalent: the button *feels* clicked.

**T = 80ms:** Optimistic UI fires. The item row in the center column begins its collapse. Headline gets a strikethrough (`text-decoration: line-through; text-decoration-color: ink-3; text-decoration-thickness: 1px`). Row height animates 112 → 56px over 200ms ease-out. Background fades from `paper-elev` to `brand-blue-soft`.

**T = 100ms:** **Seal-draw begins.** A 24×24 Rough.js seal mark renders in the bottom-right corner of the preview pane, positioned 24px from the right edge and 24px above the button row. The mark is the same six-point Beamix sigil that appears at the bottom of the Brief, the Monthly Update, and the OG share card (per Master Designer 1.1). It draws via SVG `stroke-dashoffset` from full to zero over **600ms**, easing `cubic-bezier(0.4, 0, 0.2, 1)`. Color: `brand-blue` (#3370FF).

The drawing is hand-paced: 8 individual stroke segments (one per side of the star + connecting jitter marks) draw with 30ms staggered starts. The first stroke is the longest (the outer ring); the last strokes are tiny terminal jitters that give the seal its "stamped" feel. This is the `motion/seal-draw` token from the Master Designer's vocabulary.

**T = 700ms:** Seal-draw completes. A 50ms scale-overshoot lands it: 0.92 → 1.04 → 1.0 (`cubic-bezier(0.34, 1.56, 0.64, 1)`). The customer just signed.

**T = 700ms (parallel):** A toast appears at the top of the center column:
```
✓  Approved. Beamix is applying.       Undo
```
44px tall, 100% column width, brand-blue background at 6% opacity, brand-blue 1px top + bottom borders, ink text. 14px Inter 500. The "Undo" link is 13px Inter 500 brand-blue, right-aligned. The toast holds for **5 seconds** then fades. Pressing Undo within 5s reverses the approval (server-side roll-back is in flight; the optimistic UI rolls back instantly).

**T = 1000ms:** The collapsed row in the item list animates a slide-up (translate-y 0 → -56) + fade (opacity 1 → 0) over 300ms ease-in. The item is now in the Live tab.

**T = 1300ms:** The preview pane transitions to the next item in the queue. If no next item exists, the pane shows the empty state for "no item selected" — a 240×180 area centered with 13px Inter ink-4 text "Pick an item to review →".

**T = 1800ms:** The toast still holds. The Activity Ring on the topbar (the small 16×16 brand status pulse, present on every page) gives a single brighter pulse (`motion/topbar-status` brightening from opacity 0.6 to 1.0 and back over 800ms) — the system register that *something just got applied*.

**T = 5700ms:** Toast fades over 300ms ease-out.

**Total ceremony time: ~700ms primary feedback (Seal lands), ~1300ms full transition, ~5s toast persistence.**

### Reduced-motion fallback

When `prefers-reduced-motion: reduce`:
- The button still receives instant feedback (no spring; just background-color transition).
- The Seal appears in its final state (no draw animation) at T = 100ms with a 200ms opacity 0 → 1 fade. **The Seal still appears** — the meaning is preserved; only the motion is removed.
- The row collapse skips the height animation; it removes from the DOM at T = 200ms with a 200ms opacity fade.
- The toast is unchanged (it's an opacity transition, not a transform).
- The topbar pulse is replaced with a static brightness shift.

The Seal is a *first-class composition* in reduced-motion (per Master Designer 1.5: "Reduced motion is not a fallback — it's a *first-class composition*"). The customer with a vestibular condition still sees the brand mark land. The ceremony is not a moving image; it is *that the mark was placed.*

### Accessibility

- The Approve button has `aria-label="Approve and apply this proposal"`.
- On click, a polite `aria-live="polite"` region announces: "Approved. Beamix is applying. The next item is now visible." Screen readers receive this 200ms after the click (after the row transitions begin) so it doesn't conflict with the click feedback.
- The Seal-draw has `aria-hidden="true"` — it's decorative.
- The Undo affordance is keyboard-focusable and announces on focus.
- The toast has `role="status"` and dismisses with Esc.

### Reject and Modify variations

**Reject:**
- No Seal-draw. Reject is not a signing; it is a refusal. The visual register is correctly cooler.
- The button receives the same spring feedback.
- The row collapses with strikethrough but in `score-critical` (red) color.
- Toast: "Rejected. Beamix won't propose this again unless your Brief changes." 5s. The agent's House Memory records the rejection with the Brief clause that triggered the proposal — so it learns.
- A small follow-up modal opens (optional, dismissible): "Tell us why? *(optional, helps Beamix learn)*" with a 4-option chip selector: "Off-brand" / "Factually wrong" / "Wrong timing" / "Other (explain)". Submitting feeds into the agent's training loop. Skipping is fine.

**Modify:**
- No Seal-draw immediately. Opens an inline editor in the preview pane. The diff becomes editable: the customer can adjust the proposed text directly. Save button replaces Approve.
- On Save, the modified version goes back to Beamix for re-validation (per A8 edge cases). Beamix then either auto-applies (if the modification is within the original tier-of-trust scope) or surfaces it as a new pending item with Truth-File-revalidated status. The customer is told this transparently in a sub-banner: "Beamix will re-check this against your Truth File. We'll surface it again if anything needs attention."
- Once auto-applied, the Seal-draw fires with a small caption "Seal applied to your modified version" — same ceremony, same meaning.

The Seal is **earned by approval**, not given for any decision. The Reject flow's restraint is part of the design.

---

## A4. Review-debt visibility

The review-debt counter is the mechanism that makes the trust-tier system honest (per T&S Section 4 mechanism #4). Without it, "auto-run-post-review" silently degrades to "auto-run-no-review." With it, the customer's actual review is the load-bearing event.

### The three states (mechanic)

**State 1 — Green/Normal (0–2 items un-reviewed for ≤3 days):**
Counter copy: "All caught up" + "Beamix is working in the background."
Behavior: full agent autonomy. All trust tiers operate normally.
`/home` mirror: small green dot near the Crew at Work strip with text "All clear."

**State 2 — Yellow/Notice (3–4 items un-reviewed, OR 1+ items un-reviewed for >3 days):**
Counter copy: "● 3 items waiting since Tuesday." (Fraunces italic, amber dot)
Behavior: full autonomy continues. *No pause yet.* But the warning is now visible everywhere.
**Email triggered at the 3-day mark of yellow state:** subject line "Your inbox · 3 items waiting." Body: "Sarah — Beamix has 3 items waiting in your inbox. The most important is [link]. — Beamix." Plain text. Single CTA. Per Worldbuilder Section 4.
`/home` mirror: amber dot, copy "3 items waiting."

**State 3 — Red/Active pause (5+ items un-reviewed, AND >5 days old):**
Counter copy: "● 7 items waiting since Apr 17." + "Beamix has paused non-critical agents." (red dot, pulsing)
Behavior: **Beamix pauses non-critical agents.** Specifically:
- Auto-run-post-review actions (Schema fixes, FAQ additions, citation corrections) are paused. They queue but do not execute.
- Pre-approve and Always-escalate proposals continue (they don't auto-run anyway).
- Read-only agents (Mentions Tracker, Engine Coverage Scout) continue.
- Lead-attribution and tracked-call infrastructure continue.
- The customer is informed via the counter, an in-product banner on `/home`, and one (one!) email.

The pause is **the trust-protection mechanism**. It is the difference between Beamix and the next AI safety story (per T&S Section 2 Risk 1).

`/home` mirror: red dot pulsing, copy "Beamix paused. 7 items need you."

### The "Catch up" CTA (red-state recovery)

When in red state, the counter shows a "Catch up →" button. Clicking opens the **bulk-review flow**:

A modal-overlay (or slide-in panel; we'll use overlay for this version) renders the un-reviewed items in chronological order (oldest first). Each item appears full-width with the diff visible. The customer scrolls through and approves/rejects/modifies inline. There is **no skip-all** option; the customer must touch every item. The counter decrements live as the customer works.

Header of the bulk-review:
```
Catch up                                              7 items
─────────────────────────────────────────────────────────────
You haven't reviewed Beamix's work since Apr 17.
We've paused non-critical agents until you're caught up.
```

22px Fraunces italic 300 for the headline, 14px Inter 400 ink-3 for the body. The voice is direct, not punitive. Beamix is not scolding; it is reporting.

Per item:
```
1 of 7 · Apr 17

[diff content fills the visible area]

[Approve]  [Modify]  [Reject]
```

The customer can also press `j`/`k` to navigate within the catch-up flow — the same shortcuts as `/inbox`.

When the last item is processed, the modal closes with a single transition message:
```
✓ All caught up.
Beamix has resumed.

— Your crew
```
22px Fraunces italic 300, 4-line block, centered. Holds for 2 seconds, then dismisses. The counter on `/inbox` returns to green.

**Why a guided flow vs. allowing free `/inbox` navigation?** Because the red state means the customer's normal navigation isn't working. The guided flow forces a chronological pass that respects what Beamix was actually trying to do, in order. It also creates a cleaner audit log: every red-state recovery is a single chronological session that's easy to review later.

### Email at yellow + red states

Per Worldbuilder's communications calendar (Section 4):

**Yellow-state email (3-day mark):** plain text, signed, single CTA. ~80 words. Triggered once per yellow-state-entry; not repeated.

**Red-state email (entry into red state):** plain text, signed, single CTA. ~120 words. Includes the line "Beamix has paused non-critical agents until you've caught up — this is by design." This sets expectation: the pause is *the product working as intended*, not a bug.

No further emails in either state. Beamix does not nag. The counter on `/inbox` and `/home` is the persistent signal.

### `/home` mirror specification

The review-debt counter is mirrored above-the-fold on `/home` (per the Master Designer's `/home` spec, Section 2.1). The mirror is a single line, 14px Inter 400, with the colored dot:

- Green: `· All caught up` (ink-3)
- Yellow: `● 3 items waiting since Tuesday → ` (amber dot, Inter 500, link to `/inbox`)
- Red: `● Beamix paused. 7 items need you → ` (red dot pulsing, Inter 500, link to `/inbox`)

The mirror sits 24px below the Score cluster, in the same vertical alignment as the Status Sentence. It is *part of the editorial summary line* in red/yellow states. In green state, it is barely there — a quiet ink-3 line.

This mirror is critical: a customer who never visits `/inbox` directly but lands on `/home` daily will see the state. The counter goes everywhere the customer goes.

---

## A5. Item types + tiers of trust

`/inbox` items are not all equal. Three tiers of trust × multiple item types render differently. The visual treatment communicates the *gravity* of the decision before the customer reads any text.

### Pre-approve (default tier for content rewrites, FAQ entries, citation corrections that touch tone)

Visual register: standard. Default styling described in A2.

Examples:
- "Add 11 FAQ entries to /services/emergency-plumbing" (FAQ Agent)
- "Rewrite homepage hero paragraph" (Content Refresher)
- "Adjust 3 schema descriptions for citation pattern" (Schema Doctor + Citation Fixer)

Diff preview shows additions/removals quantitatively. Full diff visible on click. Reasoning expandable. Approve as a normal action.

### Always-escalate (brand voice changes, pricing claims, regulated-vertical content)

Visual register: **red-bordered**. The row in the item list has a 1px brand-red left border (replacing the standard `border` divider on that side). The tier badge is red (`always-escalate`). The headline is preceded by a small `⚑` glyph in `score-critical`.

In the preview pane:
- A persistent red banner at the top of the diff section: "*This change touches your brand voice. Read carefully before approving.*" (or "This change references pricing." / "This is a health-related claim and touches your Truth File.") 14px Inter 400 ink-2, 6% red background, 24px padding.
- The Truth-File check section is **always visible** for these (vs. collapsible for pre-approve items).
- The Approve button retains its brand-blue color (we don't make Approve red — that would conflate "approve" with "danger") but a small confirmation interstitial appears on click: a 2-second "Are you sure? This is a brand-voice change → [Confirm and approve]" inline modal. The customer must click twice to land the Seal. This is the friction the T&S Section 4 mechanism requires.

Examples:
- "Update FAQ to mention pricing 'starts at $99'" (FAQ Agent — flagged because Truth File says "contact us for pricing")
- "Rewrite About page in slightly more casual tone" (Content Refresher — flagged because of brand-voice fingerprint drift detected)
- "Add MedicalProcedure schema to /treatments/laser-hair-removal" (Schema Doctor — auto-flagged because regulated vertical)

Per T&S, these are the items where most Day-180 incidents occur. The visual register exists to slow Sarah down for 2 seconds.

### Auto-applied (information stream, not action items)

These appear ONLY in the **Auto-applied** tab. They never appear in Pending. Their visual register is muted:

```
┌────────────────────────────────────────────────────┐
│  ◐ Schema Doctor                  4 hours ago      │
│                                                    │
│  Fixed 3 structured-data errors on /pricing        │
│                                                    │
│  · per Brief clause: "tech-search-friendly site"   │
│  [auto-applied · view diff →]                      │
└────────────────────────────────────────────────────┘
```

- Background: `paper` (no elevation).
- Tier badge: `auto-applied` (brand-blue-soft).
- Smaller height (80px vs 112px).
- No Approve/Reject buttons. The action is in the past.
- "View diff →" link opens a read-only preview in the right pane.

The customer can't approve or reject these (they're already applied). They can:
- Read the diff.
- Add a Margin Note retrospectively (e.g., "Don't change schema descriptions on /pricing without asking — that page is sensitive").
- One-click rollback (a small "Undo" link in the right pane preview, available for 30 days per the reversal-by-default mechanism in T&S Section 4 #5). Rolling back fires its own Seal-draw (it's still a customer signature, just an inverse one).

The Auto-applied tab serves three purposes:
1. **Audit:** Customers can verify Beamix did what it claims.
2. **Learn:** Customers internalize the trust tier model by seeing what auto-runs.
3. **Margin Notes accumulate:** notes added to auto-applied items train Beamix on the customer's preferences.

### Tier of trust filter behavior

When the filter is set to "Pre-approve," only standard-styled items appear. When "Always-escalate," only red-bordered. When "Auto-applied (info)," only the muted register. When "All," all three appear with their distinct treatments — the customer's eye reads tier from the visual register at a glance, even in a mixed list.

### Brief clause grounding

**Every** item in `/inbox`, regardless of tier, references the Brief clause that authorizes (or surfaces) the proposed action. This is the constitutional thread per Master Designer Move 3. It also means the customer can *prune the Brief*: if they reject 3 items in a row that all reference the same clause, a small inline prompt appears: "These rejections all reference clause: '*respond to all competitor moves*'. Edit your Brief? →". Click → opens `/settings → Brief` with the clause pre-selected.

This mechanism makes the Brief a *living document* — not a static onboarding artifact.

---

## A6. Margin Note interaction

The Margin (per Master Designer 1.1) is one of the four sigils. In `/inbox`, it manifests as the **Margin Note interaction**: the customer can annotate any item with a note. Notes enter House Memory; agents read them on subsequent runs.

### How it works

In the preview pane, while reading the diff, the customer can highlight any portion of text. On highlight, a small inline action appears 8px above the selection:

```
[ + Add note to House Memory ]
```

The button is 28px tall, 11px Inter 500 caps, ink-2 text on `paper-elev` background, 1px `border` 6px radius. It floats. Clicking it opens an inline note input directly below the highlighted text:

```
┌────────────────────────────────────────────────────┐
│ Note about: "We've handled emergency plumbing      │
│              in Tel Aviv since 2012."              │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Don't say "since 2012" — we expanded to        │ │
│ │ Jerusalem in 2018. Phrase as "since 2018       │ │
│ │ across central Israel."                        │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [ Save note ]              Cancel                  │
└────────────────────────────────────────────────────┘
```

The input is a 3-line textarea expanding as the customer types. Save button is 32px tall ghost-with-brand-blue-text. Cancel is text-link.

On Save:
- The note attaches to House Memory with metadata: source agent, the highlighted text, the customer's note, timestamp, related Brief clause.
- The note appears as a small 14×14 Rough.js mark in the Margin (left edge of the item card in the list, and left edge of the preview pane). The mark is the brand-blue Margin glyph from the sigil system.
- The next run of any agent that touches this content will see the note in its prompt and adjust accordingly.
- The note also surfaces in the agent's profile page on `/crew` (per Master Designer 2.6), under that agent's "Notes from your principal" section.

### Keyboard shortcut

Pressing `n` while focused on an item opens an unscoped note ("note about this whole item, not a specific selection"). Useful for bulk feedback like "ignore competitor X — they're a partner, not a rival" attached to a Competitor Watch proposal.

### Note archive

All notes are accessible from `/crew → [agent] → Notes`. They are sorted by date. Each note shows: the source item, the highlighted text, the customer's note, the timestamp, and a link back to the original `/inbox` item. The customer can edit or delete notes at any time.

### Why this matters

Notes are the **training signal** that shapes Beamix to the specific customer. After 6 months, Sarah's Beamix knows things her competitors' tools never will: that she expanded to Jerusalem in 2018, that her Tuesday hours are different, that she doesn't compete with X but does compete with Y. This is the customer-specific knowledge moat.

It is also a **trust mechanism**: a customer who has authored 30 notes feels ownership. The agents are *hers*. She trained them.

---

## A7. Mobile

`/inbox` is a desktop-first surface (Sarah and Yossi both review at the desk). Mobile is the secondary surface — designed well, but not the primary craft target.

### Layout — single column

At ≤768px viewport:
- The 3-pane collapses to a single column.
- The filter rail becomes a Cmd+K-style filter sheet, accessible via a 44px-tall button at the top of the screen ("Filter · 12 items").
- The header strip shrinks to 56px and shows only the active tab + a tab switcher icon (right-aligned). Tap → bottom sheet with all 4 tabs.
- The item list fills the screen.
- Tapping an item slides in a full-screen preview pane from the right (300ms ease-out, `motion/card-entrance`).

### Item rows

64px tall (compact density default on mobile). Touch targets are 44px minimum. Headline truncates to 1 line. Diff preview hidden.

### Preview pane (full-screen mobile)

- Header: 56px tall, sticky. Contains a back-chevron (44×44 touch target) and the agent name + tier badge.
- Body: scrollable diff + reasoning + Truth-File check.
- Bottom action bar: sticky, 88px tall with safe-area inset. Three buttons full-width: Approve (brand-blue, 56px tall, 60% width), Modify (ghost, 20%), Reject (ghost-red, 20%).

### Swipe gestures (Yossi-volume mode)

For high-volume users (Build/Scale tier), opt-in swipe gestures in `/settings → Preferences`:
- **Swipe left** on an item card → approve
- **Swipe right** on an item card → reject
- Both gestures require a **first-time confirmation** — the very first swipe opens a modal: "*Quick-approve via swipe? Each swipe will Seal-and-apply. You can undo within 5 seconds.*" The customer confirms once; subsequent swipes are friction-free.

The swipe ceremony:
- Card tilts on drag (max ±12 degrees, follows finger).
- Background reveals brand-blue (left swipe = approve) or `score-critical` (right swipe = reject).
- Swipe past 30% threshold → release triggers the action with the same Seal-draw choreography as desktop (just scaled smaller, 16×16 seal).
- Same 5-second Undo toast.

This is Tinder-pattern, but with **explicit consent on first use**. The pattern is proven (Superhuman email triage, Apollo CRM, Linear iOS); the discipline is the first-time confirmation.

### Reduced motion

Same as desktop: Seal still appears, just without the draw animation.

### What mobile does NOT do well

The Margin Note text-highlight interaction is hard on mobile (text selection is OS-controlled, finicky). On mobile, we offer instead a single "Add note" button at the bottom of each preview that opens a simple 3-line note input. No highlight-to-annotate. This is a deliberate downgrade — the desktop interaction is the canonical one.

---

## A8. States and edge cases

### Loading state

When `/inbox` is fetching items (cold load):
- The 3-pane skeleton renders.
- Item rows render as 8 skeleton blocks (alternating opacity-pulse `paper-elev` rectangles, 200ms stagger). Skeleton pulse is `cubic-bezier(0.4, 0, 0.6, 1)`, 1200ms infinite, 0.6 → 1.0 opacity.
- Filter rail counts render as `··` (Geist Mono ink-4) until loaded.
- Preview pane is blank with a small ink-4 caption "Pick an item to review".
- Total skeleton time: <500ms target on broadband. Beyond 800ms, replace skeleton with a 22px Fraunces italic ink-3 line "Loading your inbox…" (per voice).

### Error state — couldn't load inbox

Top of center column, full-width banner:
```
─────────────────────────────────────────────────
Beamix couldn't load your inbox right now.

This is on us. We're already looking into it.
[ Try again ]                  Status page →
─────────────────────────────────────────────────
```

22px Fraunces italic 300 for the headline, 14px Inter 400 ink-2 for the body, brand-blue button + text-link. The voice is direct, owns the error, doesn't apologize preemptively. Per Worldbuilder voice rules: "Never apologizes preemptively."

The status page link goes to a Linear-grade `beamix.tech/status` (per Worldbuilder Section 3 channel #6 Changelog adjacency). If the issue is Beamix-wide, the page reflects it.

### Item failed to apply post-approve

Sometimes an approval lands the Seal but the downstream pipeline fails (the customer's CMS rejected the schema, the Truth File validation flagged an issue post-hoc, etc.).

The item appears in the **Live tab** with a red status indicator:
```
◐ Schema Doctor                                   ⊘ Failed
Fixed 3 structured-data errors on /pricing
[apply failed · see details]
```

Clicking opens a preview pane with:
- The original diff (what the customer approved).
- The error from the apply step ("HubSpot CMS rejected the schema: existing `@id` collision detected — see line 12").
- A "Why this happened" explanation in Beamix-voice.
- Two buttons: **Retry** (re-runs the apply step with the same customer approval — useful for transient errors) and **Discard** (removes the proposal, files an incident report so the agent can learn).
- A link to the audit log entry: `View audit trail →`. The audit log is at `/settings → Audit log` and is itself a tier-gated surface (Build+).

For always-escalate items that fail, an automatic email fires: "Sarah — an apply step failed on the schema change you approved this morning. We've rolled it back. Details: [link]. — Beamix." Plain text, signed, single CTA. Per Worldbuilder.

### Customer Modify changes the proposal significantly

When the customer uses Modify and substantially edits the proposal, Beamix re-validates. Possible outcomes:

1. **Within original scope:** the modified version still falls under the original tier of trust. Beamix applies it, fires the Seal-draw, and the item moves to Live.
2. **Crosses tier boundary (e.g., a pre-approve content rewrite is modified to include pricing):** the modified version is re-classified as always-escalate. The item stays in `/inbox` with a banner: "*Your modification changed the scope. Beamix will surface this for re-approval.*" The Seal does NOT draw yet — no signing on a modification that crossed tier. The customer must approve the modified version in a fresh decision cycle.
3. **Truth File violation introduced:** the modified version contradicts a Truth File entry. Beamix surfaces this as an inline warning: "*Your edit references hours that don't match your Truth File. Update Truth File or revise edit?*" with affordances to do either.

This re-validation is the mechanism that closes the loophole: a customer cannot bypass the tier system by Modify-ing a pre-approve item into something that should have been always-escalate.

### Stale items (>30 days un-reviewed)

Per the reversal-by-default mechanism (T&S #5), items un-reviewed for >30 days are **auto-rolled-back** and removed from `/inbox`. Before rollback, an email fires at day 25: "Sarah — 4 items in your inbox are about to expire. Beamix will roll them back if you don't get to them by [date]. — Beamix."

Rolled-back items appear in the Auto-applied tab (under a "Rolled back — expired" filter), with the customer's option to "Re-propose" (Beamix drafts a new proposal based on current state).

### Concurrent edits (Yossi multi-seat)

When two seats on Yossi's agency tier open the same item simultaneously:
- The first to land Approve/Reject wins. The second sees a polite "*Yossi just approved this — refreshing*" banner and the item updates.
- Margin Notes are concurrent-safe (they're additive, not overwriting).

---

# PART B — `/workspace` — the agent-at-work surface

## B1. The page job

### Who's here, when

`/workspace` is the page where the customer can watch Beamix actively working on a specific task. It is the *agent-walking-with-tools* surface. It is Adam's specifically stated vision realized: *"Pencil drawing of an agent like a team member walking around with tools — researching, asking model, remembering."*

### Demoted from sidebar; entry points

Per Frame 5 v2's IA decisions, `/workspace` is **demoted from the primary sidebar**. Most customers never visit it. Those who do arrive via two specific entry points:

1. **From `/home`:** the **Crew at Work strip** (per Master Designer 2.1, Section 6) shows the 11 agent monogram circles. When an agent is active, its monogram pulses brand-blue. Clicking the active monogram → `/workspace` filtered to that specific run.
2. **From `/inbox`:** the per-item preview pane has a "Watch this run →" link in the header section when the item is currently being executed. Clicking takes the customer to `/workspace` for that run.

There is no link from the sidebar. Power users who use `/workspace` regularly can pin it via `Cmd+K` (Linear-style command palette).

### Why most customers never visit

The Master Designer's argument (Section 2.3): "Most users never visit. Those who do are curious or debugging." This is correct. Sarah doesn't watch the agent run — she reads the digest on Monday and reviews the result in `/inbox`. The work happens out of sight.

Yossi visits more often, especially when debugging an agent's behavior or explaining a result to a client ("here's what Beamix is doing right now on your account — watch"). He may screen-share `/workspace` in a client call.

### The defining moment

The defining moment of `/workspace` is the *animation of the agent walking with tools* — Adam's stated vision. Not a status page. Not a log viewer. A visual journey that makes a 90-second runtime feel *worth watching*. This is the page-as-cinematography moment (Master Designer 2.3).

---

## B2. Layout

The page IS the journey. **No bounded card.** The courier flow runs down the page. This is a deliberate departure from the standard `/dashboard-with-cards` pattern.

### Top of page (104px tall, sticky)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Topbar (60px)                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│   [44px breath]                                                              │
│   Beamix is working on:                                                      │
│   Add FAQ schema to /services/emergency-plumbing                             │
│                                                                              │
│   Started 47 seconds ago · Citation Fixer · pre-approve                      │
│   [44px breath]                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

- "Beamix is working on:" — 13px Inter 500 caps, ink-3, tracking 0.10em
- Task description — 32px InterDisplay 500 ink (text-h2), max 2 lines
- Status line — 13px Geist Mono ink-3 with three components separated by `·`: elapsed time, agent name, tier badge inline

The page header stays sticky as the customer scrolls. After the run completes, the header swaps to "Done. 47s. 6 steps." (see B4).

### The courier flow — the journey

Below the header, the courier flow runs down the page. It is the page's primary content. Layout:

```
                    │
                    │  (vertical line, 1.5px Rough.js, brand-blue 28% opacity)
                    │
              ●─────│─────────────────────────────────  Step 1 (completed)
                    │     "Read your homepage" · 8s
                    │     [output panel, right of step]
                    │
              ●─────│─────────────────────────────────  Step 2 (completed)
                    │     "Looked up your Truth File" · 3s
                    │
              ◉─────│─────────────────────────────────  Step 3 (active, pulsing)
                    │     "Asking Perplexity 4 sample questions…"
                    │     (rotating microcopy)
                    │     [live output streaming on the right]
                    │
              ○─────│─────────────────────────────────  Step 4 (pending)
                    │     "Drafting FAQ entries" (dashed, 30% opacity)
                    │
              ○─────│─────────────────────────────────  Step 5 (pending)
                    │     "Validating against Truth File" (dashed)
                    │
              ○─────│─────────────────────────────────  Step 6 (pending)
                    │     "Submitting to your inbox" (dashed)
                    │
                    │
              [agent figure walking — the centerpiece animation,
               B3 below — sits at the active step, ~80×80px]
```

- The **vertical line** runs at ~28% from the left edge (LTR). At 1440px viewport with ~120px outer margin, the line sits at x = 280px from the viewport left.
- **Step circles:** 30px diameter, Rough.js, roughness 0.8, *consistent seed per agent* (so every Citation Fixer run draws steps in the same handwriting). Three states:
  - Completed: filled with brand-blue (1.5px stroke + small filled center mark, 8px diameter)
  - Active: hollow with a pulsing brand-blue stroke (`motion/ring-pulse`, 1200ms infinite)
  - Pending: hollow with 30% opacity, dashed (3px dash, 2px gap)
- **Step name:** 14px Inter 500 ink (active), ink-3 (completed), ink-4 30% (pending). 24px to the right of the step circle.
- **Substep microcopy (active step only):** 13px Inter 400 ink-3, rotating every 800ms with a 200ms cross-fade (`motion/microcopy-rotate`, per Master Designer 2.3). Examples on the active step:
  - "Asking Perplexity 4 sample questions…" (1.5s)
  - "Got it." (800ms)
  - "Reading the answer…" (1.5s)
  - "Cross-referencing with Truth File…" (1.5s)
- **Step duration:** 13px Geist Mono ink-4, right-aligned (e.g., "8s") on completed steps. Active step shows the live elapsed counter ("Step 3 · 12s and counting"). Pending steps show no duration.

### Output panel (right of completed and active steps)

The right side of the page shows the streaming output of each step. Layout:

- **Completed steps:** the output is shown as a 13-px Inter Regular block on `paper` background, ~480px wide, line-height 22, max 8 lines. If longer, truncated with "Show full output →" link that expands inline. Output is in Beamix-voice (the agent narrating what it found): "Found 12 emergency-plumbing queries on Perplexity. Top 3: 'plumber Tel Aviv 24/7', 'emergency plumber near me', 'burst pipe Tel Aviv'."
- **Active step:** the output streams in real-time. Token-by-token if the underlying model is streaming. Uses the same `motion/microcopy-rotate` as substeps, but on the *output panel* — text appearing word-by-word. A blinking cursor at the end of the latest word: 1px brand-blue, 800ms blink (linear, infinite). When the active step completes, the cursor disappears and the panel locks to its final state.
- **Pending steps:** no output panel.

The output text is on white (`paper`) — crisp Inter Regular 14px. It is **not** decorated. The decoration is in the journey (the courier line, the step circles, the walking figure). The output is the substance.

### Bottom of page

After the last step (or below pending steps if mid-run):

```
                    │
                    │
                    │
                    [end of line]


              [88px breath]


              ─────────────────────────────────────────────
              When this run completes, the result will land
              in your inbox.

              You can close this tab — Beamix will email
              you when it's ready.
              ─────────────────────────────────────────────
```

- Left-aligned at the same column as the step text (x = 304px).
- 14px Inter 400 ink-3, line-height 22.
- The voice is *unhurried* (per Worldbuilder Section 1: "Beamix doesn't demand attention").
- "Close this tab — Beamix will come find you" is the brand-defining line that appeared first on the post-Paddle landing (Worldbuilder Section 2 Day 0-3). Repetition is the binding.

### Pixel-precise positioning

| Element | x-position (LTR, 1440px) | y-position |
|---|---|---|
| Page outer margin | 120px each side | – |
| Topbar | 0–60 | 0–60 |
| Header sticky region | 60–164 | – |
| "Beamix is working on:" | 304 | 104 |
| Task description | 304 | 132 |
| Status line | 304 | 180 |
| Courier vertical line | 280 | starts at 224 |
| Step circle (centered on line) | 265–295 | 224 + (step-index × 144) |
| Step name | 304 | aligned with circle centerline + 4 |
| Substep microcopy | 304 | 24 below step name |
| Output panel | 480 | aligned with step + 0 |
| Walking figure | floating, see B3 | floating |
| Bottom unhurried text block | 304 | 88 below last step |

The 144px vertical step gap is intentional — it accommodates the active-step substep + output panel without crowding. Completed-step outputs collapse to 80px when the next step becomes active (the page rolls forward).

---

## B3. The agent-walking animation — Adam's specific vision

This is the page's defining moment. Adam's stated vision: *"Pencil drawing of an agent like a team member walking around with tools — researching, asking model, remembering."* This section translates that vision into a precise spec.

### The figure

A small (~80×80px) hand-drawn character. Rough.js linework, low fps (8–12 fps), giving it a hand-drawn animation feel like Claude.ai's loading state.

**Anatomy:**
- A simple *monogram-shaped body* (NOT a mascot face — this is critical per Adam's `2026-04-25 Beamie deferred`). The body is the agent's color (per the 11-agent palette in Master Designer 1.6) drawn as a 32×40px rough oval with two thin legs and two thin arms.
- A small head (16×16) — a hand-drawn circle in ink, with **no facial features** (no eyes, no mouth). The figure is genderless, faceless, role-only. This is intentional: faces invite anthropomorphism we are not designing for. A monogram is recognizable; a face is a character.
- The figure carries **a small toolbelt** — a 1px Rough.js horizontal line at waist height with hand-drawn tool icons hanging off it.

**The tools (~16×16 each, sketched in Rough.js):**
- 🔍 **Magnifying glass** — used during *Read* steps (reading the customer's site, reading a Truth File entry)
- 📖 **Book** — used during *Reference* steps (consulting House Memory, citing the Brief)
- 🔧 **Wrench** — used during *Apply* steps (writing schema, drafting FAQs)
- ✉ **Letter** — used during *Communicate* steps (preparing the inbox item, sending a notification)
- ⚡ **Spark/lightbulb** — used during *Think* steps (asking the model, reasoning)

The toolbelt holds 2-3 tools at any time; the figure swaps tools as it moves through steps. The swap is animated: 200ms cross-fade between tool sprites.

### The walking motion

The figure walks down the courier line, pausing at each step. Locomotion:

- **Walking gait:** 8 fps (a deliberately slow frame rate for the hand-drawn feel). 4 frames per gait cycle: contact-left, mid-stride-left, contact-right, mid-stride-right. Each gait cycle covers ~24px of vertical travel.
- **Speed:** ~1px per 100ms while walking (so a 144px gap between steps takes ~14 seconds of *walking time*). But the figure rarely walks for that long — it pauses at each step to *use a tool*.
- **Tool-use pause:** When the figure arrives at the active step, it stops and animates a tool-use gesture for the duration of the step. Three gesture types:
  - **Reading gesture:** holds magnifying glass to "head" (scaled up 1.1×), bobs up and down 4px, 1200ms cycle, 4 frames.
  - **Writing gesture:** holds wrench/letter forward, makes small "scribble" motion (rotating wrist 8 degrees back and forth), 800ms cycle, 4 frames.
  - **Thinking gesture:** holds lightbulb above head, lightbulb pulses (Rough.js stroke fades 60% → 100%), figure stands still, 1500ms cycle.
- **Step-to-step transition:** when a step completes, the figure walks down to the next step. ~14s walk for 144px gap, but this happens *only when the next step is genuinely starting*. Between steps that complete instantly, the figure jumps with a 200ms ease-out translate-y (no walking — it would be too slow).

### Frame rate philosophy

The 8–12fps choice is deliberate. Higher fps (60fps) makes the figure look like a polished cartoon; lower fps (8fps) makes it look like a sketchbook flip-book. Adam's vision is the latter (per the comparison to Claude.ai's loading state).

Implementation: pre-rendered 4-frame Rough.js sprite sheets per gesture, served as PNG sprites. The Rough.js seed is locked per agent (so Citation Fixer's figure looks identifiably itself across runs). On each animation tick, the next frame is shown for 125ms (8fps).

### Loop vs. once-per-task

The figure does NOT loop infinitely. It walks the journey *once*, in real time with the agent's actual progress. When the agent completes step 3, the figure walks to step 4. When the run finishes, the figure stands at the bottom of the journey (see B4). This is the design.

If the run takes 90 seconds, the figure walks for 90 seconds. If the run takes 8 minutes, the figure walks for 8 minutes (with long tool-use pauses at steps that take time). The figure is *coupled to the runtime*, not decorative.

### Position on the page

The figure floats. CSS:
- `position: fixed` while the customer is on `/workspace` (so it stays visible as the customer scrolls).
- `left: 240px` (40px to the left of the courier line, so the figure walks alongside the line, not on it).
- `top` is updated in JavaScript every 100ms based on its current step position. When the figure is between steps, `top` interpolates linearly.
- z-index: above the page background, below the topbar.

**Scroll behavior:** when the customer scrolls the page, the figure stays attached to its step (moving with the page content), not to the viewport. So if the customer scrolls past the figure, the figure scrolls off-screen. The exception: the customer can press `f` to "follow the figure" — the page auto-scrolls to keep the active step in the center of the viewport.

### Reduced-motion fallback

When `prefers-reduced-motion: reduce`:
- The figure is **static at the active step**. No walking. No gait animation.
- The tools change as steps change (200ms opacity fade between tool sprites — a reduced-motion-acceptable transition).
- The body and head remain visible.
- The figure is still part of the page — the meaning ("an agent is at this step") is preserved; only the locomotion is removed.

### Why this is the right level of motion

The figure is the *signature animation* of the product. It is what someone shows their friend ("look at this thing — there's a tiny pencil-drawn agent walking down the page"). It is also what makes a 90-second runtime feel *purposeful*: the customer sees the agent at step 3, holding a magnifying glass, "reading" — and the substep text confirms what they're seeing ("Asking Perplexity 4 sample questions").

It is what no competitor will ship. Profound shows a status bar. Otterly shows a log. Beamix shows a *team member at work*. That is the visual register Adam asked for.

**Performance budget:** the entire animation system (sprite sheets + scroll tracking + tool transitions) must fit in <60kb gzipped JS + <80kb of sprite assets. This is enforceable in CI per Master Designer Section 6 to Seat 3.

---

## B4. The roll-up state (when agent done)

When the run completes, the page transforms. **No ceremony, no fanfare.** Per Master Designer 2.3: "Completion (no ceremony): Steps collapse to 'Done. 47s. 6 steps.' One line. No stamp, no fanfare. Topbar status pulse returns to idle."

### The transition

**T = 0ms:** Last step completes. The active step circle fills (transitions from hollow + pulse to filled + static, 200ms ease-out).

**T = 200ms:** The figure stops at the bottom of the journey. Final stance: facing forward, no gesture. Static.

**T = 200ms:** All step substep texts (which were rotating on the active step) freeze on their final value.

**T = 500ms:** A summary block animates in below the last step:
```
                    │
                    │
              ●─────│  Step 6 — Submitting to your inbox · 4s
                    │
                    
              [88px breath]
              
              Done.  47s.  6 steps.
              The result is now in your inbox →
```
- "Done." — 32px InterDisplay 500 ink (text-h2). With period.
- "47s." — 32px InterDisplay 500 tabular ink-2.
- "6 steps." — 32px InterDisplay 500 tabular ink-2.
- All on one line, separated by 24px wide ink-4 dashes (`──── `).
- Below: 14px Inter 400 ink-3, with brand-blue link.

The summary block enters with `motion/card-entrance`: translate-y 6 → 0, opacity 0 → 1, 200ms `cubic-bezier(0.34, 1.56, 0.64, 1)`. The sleight back-out lands the moment.

**T = 700ms:** The header at the top of the page swaps from "Beamix is working on: …" to "Beamix finished: …" with a 200ms cross-fade. The status line updates from "47 seconds ago" to "Just now. View in inbox →".

**T = 1000ms:** The topbar status pulse returns to idle (the small 6px dot fades from active brand-blue to ink-4).

### The output text persists

All step output panels remain visible, scrollable, readable. The customer can scroll the entire journey post-completion to review what the agent did at each step. This is the *audit trail surfaced as a journey* — better than a log file, the same data.

### Persistence after navigation

If the customer navigates away and back, `/workspace?run_id=X` shows the *completed* journey indefinitely (until the run is archived after 90 days). The figure stays at the bottom. The summary stays. The output panels stay. This is `/workspace` doubling as a *historical record* for that specific run.

### Link to the inbox item

"The result is now in your inbox →" links to `/inbox?item=X`. Customers who want to immediately approve/reject the result can flow directly. Customers who want to walk away can — the result is also in their email if email notification is enabled.

### Why no Seal-draw on completion

The Seal is reserved for **customer signing**. Completion of an agent run is *Beamix's work*, not the customer's signature. There is nothing to sign here. The Seal will appear on `/inbox` when the customer approves the resulting item. Keeping the Seal scarce is what makes it meaningful.

---

## B5. Idle state / multi-agent state

### Idle (no agent running)

When the customer lands on `/workspace` and no run is in flight, the page renders:

```
                    [200px breath]


              No active runs.

              Beamix runs agents in the background. To
              start one, use your inbox or your home page.

              [80px breath]

              Last run: Citation Fixer · 12 minutes ago
              [ View last run → ]
```

- 32px InterDisplay 500 ink-2 ("No active runs.")
- 14px Inter 400 ink-3 body, line-height 22, max-width 480px
- 14px Inter 400 ink-3 status line with a brand-blue link to the most recent completed run

No illustration. The idle state is functional, not emotional. The empty state on `/inbox` (the desk drawer with checkmark) earns its illustration because it is a *success* state. `/workspace` idle is just *not now*.

### Multi-agent state (more than one run active)

When the customer arrives via `/home`'s Crew at Work strip and multiple agents are running simultaneously, the layout adds a **tab nav at the top**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│   [44px breath]                                                              │
│   Beamix is working on 3 things                                              │
│                                                                              │
│   [● Citation Fixer (active 47s)]  [● Schema Doctor (15s)]  [● FAQ (3s)]    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

- "Beamix is working on 3 things" — 32px InterDisplay 500 ink (text-h2).
- Tab nav — pills, 44px tall, rounded 8px, `paper-elev` background. Active tab has a 2px brand-blue underline. Each pill: agent monogram (16×16) + agent name + elapsed time. The pulsing brand-blue dot on each pill mirrors the activity.
- Each tab switches the courier flow below.

The walking figure switches when the tab switches — Citation Fixer's figure (mid-blue body) swaps for Schema Doctor's figure (teal body) with a 200ms cross-fade. This is one place where the walking figure is *not* coupled to a single run: it represents *the active agent on the visible tab*.

### Why we tab rather than show all journeys at once

Showing 3 simultaneous courier flows would create competing focal points and break the "page IS the journey" principle. The tab nav respects the focus model: one journey at a time. Yossi (the most likely multi-agent user) gets the affordance to switch quickly.

Sarah essentially never sees this state — she runs 1-3 agents per week, rarely concurrent, and almost never visits `/workspace`.

---

## B6. Mobile

`/workspace` on mobile (≤768px viewport) preserves the courier flow but adapts:

### Layout shifts

- Courier line shifts to the **left edge** (16px from viewport left).
- Step circles (24px diameter) sit on the line.
- Step names align 16px right of the circle, full-width minus 32px right margin.
- **Output panel stacks below each step** (not to the right). Each output block is full-width, 14px Inter 400 ink-2, max 5 lines (with "Show more →" expand).
- The walking figure scales down to **48×48px**, walks alongside the line at left = 4px (between line and edge).
- Active step output streaming with the same blinking cursor.

### Single-column reading

The mobile layout is a vertical scroll. The customer reads top-to-bottom, the agent's journey from start to finish. This is a comfortable reading experience and arguably *better suited* to the courier metaphor than desktop (which has horizontal complexity).

### Reduced motion

Same as desktop: figure static, tool transitions only.

### Performance

Sprite assets <40kb on mobile (fewer animation states needed at small size). JS budget <40kb gzipped. Lighthouse perf score >90 on mid-range Android.

### What mobile drops

- The "follow the figure" auto-scroll (`f` keyboard shortcut) is irrelevant on mobile.
- Multi-agent tab nav becomes a horizontal-scrolling pill bar at the top (16px padding, 44px tall pills).

---

## B7. States and edge cases

### Active step error

When a step fails mid-run (e.g., the model API timed out, the customer's site returned a 500 on a fetch):

- The active step circle transitions from pulsing brand-blue to a static `score-critical` (red) circle with a small `⊘` glyph in the center.
- The substep microcopy stops rotating; freezes on a final state: "*Hit an error. Investigating.*"
- The walking figure stops mid-stride and the toolbelt sprite changes to a small Rough.js question-mark glyph held at chest height (the figure is *thinking*, not failing).
- An inline error block appears below the step:

```
              ⊘  Step 3 hit an error.
              
              "Asking Perplexity 4 sample questions" —
              the model timed out after 30 seconds. Beamix
              will retry up to 3 times automatically.
              
              [ Retry now ]      Skip step →
```

- 14px Inter 400 ink-2 body.
- Two affordances: "Retry now" (brand-blue button, retries the step immediately, bypassing automatic retry timing) and "Skip step →" (text-link, available only for steps marked optional in the agent's DAG; otherwise greyed out).

If automatic retry succeeds within 30 seconds, the step recovers: circle returns to active, figure resumes walking, microcopy resumes. The error block dismisses with a 200ms fade.

If all retries fail: the run is marked Failed, the journey freezes at this step, and a Failed summary appears at the bottom of the page (similar to B4 roll-up but with red accent and a "Beamix is investigating" line). An incident is filed automatically per T&S Section 4 mechanism #7. The customer receives an email per the runbook.

### Long-running runs (>5 minutes)

For runs that take longer than 5 minutes (e.g., a Long-form Authority Builder draft, a multi-engine Citation Predictor analysis):

- The page auto-scrolls to keep the active step in viewport center. Smooth scroll, 400ms `cubic-bezier(0.4, 0, 0.2, 1)`. Customer can disable this with `f` keyboard shortcut (toggles "follow figure").
- Substep microcopy gets richer: "Drafting paragraph 3 of 7…" "Cross-checking with FAQ Agent's prior outputs…"
- A small "elapsed: 4m 12s" counter appears next to the agent name in the header (live-updating, 13px Geist Mono ink-3).
- After 10 minutes, a small banner appears below the header: "*This run is taking longer than usual. You can close this tab — Beamix will email you when it's done.*" Per voice. No anxiety injection.

### Network disconnect

When the customer's connection drops mid-run:
- The walking figure pauses (no animation tick).
- The active step circle continues pulsing (we don't know the run failed — only that we lost visibility).
- A subtle banner appears at the top of the page: "*Reconnecting…*" 13px Inter ink-3, light amber 6px dot.
- On reconnect, the page re-fetches the run state. If the run progressed during disconnect, the page fast-forwards (figure walks rapidly to the new step, output panels render with their final state, no animation playback for skipped progress). 800ms total fast-forward.
- If the run completed during disconnect, the page jumps directly to the roll-up state.

### Run was canceled (by the customer or by review-debt pause)

When a run is canceled:

- Active step → static gray circle (no fill, no pulse), 50% opacity.
- All pending steps → faded to 20% opacity.
- Walking figure → static, faded to 50% opacity.
- Below the journey: a banner "*This run was canceled. Reason: [reason].*" with a "Re-run →" button if applicable.

If the cancellation was due to red-state review-debt pause: "*Beamix paused this run because your inbox has 7 items waiting. Catch up to resume.*" with a link to the catch-up flow.

### Session timeout (customer authenticated session expires)

If the customer's session expires while watching `/workspace`:
- The page locks (overlay appears with "*Sign in to keep watching*").
- After sign-in, the page resumes from the current run state. No data is lost.

---

# PART C — Cross-surface coherence

## What's shared between `/inbox` and `/workspace`

The two surfaces share five elements that bind them as one design system:

### 1. Agent attribution

Both surfaces show **monograms** (Rough.js, 16×16 in lists, 32×32 in headers, 80×80 as the walking figure) in the agent's color, with the agent's name. The 11-agent palette is locked (Master Designer 1.6). The seed for each agent's Rough.js drawings is locked across the entire product — Citation Fixer's monogram is recognizably the same drawing on every surface.

This is also where "Beamix" voice meets "agent attribution" cleanly: the *attribution* is "Citation Fixer worked on this"; the *voice* is always "Beamix proposes this." Per Worldbuilder Section 1: "Always signs off as 'Beamix' externally. Never 'your AI Visibility Crew.' Never 'Schema Doctor.' (The roster is internal architecture; the voice is one.)" Both `/inbox` and `/workspace` are *power-user-adjacent* surfaces where the roster is named (per Frame 5 v2: "11+ agents only in /crew for power users"); but the *voice* of any text on these surfaces is still Beamix.

### 2. Beamix voice

Both surfaces use the four ingredients (Worldbuilder Section 1): direct, confident, warm, specific. Examples:
- `/inbox` empty state: "Nothing for you. Beamix is working on 3 things in the background."
- `/workspace` idle: "No active runs. To start one, use your inbox or your home page."
- `/inbox` red state: "Beamix has paused non-critical agents."
- `/workspace` long-running: "This run is taking longer than usual. You can close this tab — Beamix will email you when it's done."

The voice never apologizes preemptively, never uses SaaS-default verbs, always signs off "— Your crew" on emotionally significant blocks (the empty state, the red-state recovery completion, the catch-up complete message).

### 3. The Seal-draw on approve

The Seal is the **shared ceremony**. It appears:
- On `/inbox`: every time the customer approves an item.
- On `/onboarding`: when the customer signs the Brief.
- On `/scan` public: when the customer claims a scan.
- On the Monthly Update PDF: at the bottom, signed.
- On `/workspace`: it does NOT appear during the run. It appears only on `/inbox` when the customer approves the *result* of the run.

This scarcity is what makes the Seal meaningful. `/workspace` shows the work; `/inbox` is where the customer signs. Keeping these distinct is the design.

### 4. The courier-flow visual register

The hand-drawn step circles, the rough vertical line, the locked-seed Rough.js — these establish the *visual language of agent work*. The same register is hinted at in:
- `/inbox` item rows: the agent monogram is a Rough.js circle (same family).
- `/home`: the Crew at Work strip uses the same monograms.
- `/scans`: the Margin column uses the same monograms.
- The Brief (`/settings → Brief`): the seal mark is the same family.

A customer who has seen one of these surfaces sees the courier flow on `/workspace` as part of *the same product*, not a separate page. This is the cross-surface coherence test (Master Designer Section 3): "if you took a screenshot of any element from any surface and put it in front of a designer, they should be able to identify it as Beamix in 1.5 seconds."

### 5. The signature line

*"— Your crew"* in 22px Fraunces italic 300 appears on:
- `/inbox` empty state
- `/inbox` catch-up flow completion
- The Monday Digest
- The Monthly Update
- The Brief
- The OG share card
- The marketing site footer
- `/workspace`: NOT during the run, but in the bottom unhurried block ("Beamix will come find you.") which uses the same voice register without the literal "— Your crew" — because the run isn't a signed artifact yet, only an *in-flight task*.

### What's unique to each surface

| Element | `/inbox` | `/workspace` |
|---|---|---|
| Layout | 3-pane (filter / list / preview) | Single column courier flow |
| Primary motion | Seal-draw on approve | Walking figure + microcopy rotation |
| Customer agency | Decisions (approve / reject / modify / annotate) | Watching (read-only during run) |
| Empty state | Hand-drawn illustration + Fraunces line | Plain text, no illustration |
| Voice register | Direct + transactional ("Add 11 FAQ entries…") | Narrative + procedural ("Asking Perplexity 4 sample questions…") |
| Trust mechanism | Review-debt counter, Brief grounding | Provenance log + audit-trail-as-journey |
| Tier gating | Filters and bulk actions tier-gated | No tier gating — all customers see runs the same way |

The two surfaces are *complements*: `/inbox` is decision; `/workspace` is observation. Together they cover the full agent lifecycle — from started (visible on `/workspace`) to completed (a run summary persists on `/workspace`) to surfaced for review (lands in `/inbox`) to signed (Seal-draw on `/inbox`) to applied (Live tab on `/inbox`) to audit-able (Auto-applied tab on `/inbox` for the auto-run-post-review tier).

This is the consent-and-observation loop. It is the load-bearing UX of Beamix's autonomous-agent claim.

---

## Closing

`/inbox` and `/workspace` together resolve a specific design problem: how does an autonomous-agent product earn the customer's trust *while* doing autonomous work? The standard answer is "approve everything" (turning the agent into a tool) or "approve nothing" (turning the customer into a passive viewer of an analytics dashboard). Neither is what Beamix is.

`/inbox` is the surface that says: *here are the decisions only you can make, Brief-grounded, Truth-File-checked, signed by your hand.*

`/workspace` is the surface that says: *here is the work happening, narrated, observable, available if you want to see it.*

Between them sits the trust tier system (auto-run / pre-approve / always-escalate), enforced by the review-debt counter, made honest by the agent provenance protocol. The customer never has to guess what Beamix is doing — they can either watch it (on `/workspace`) or read its decisions (on `/inbox`) or skim its summaries (on `/home` and the Monday Digest).

The Seal-draw is the binding ceremony: a small Rough.js mark, drawn over 600ms, every time the customer signs. The walking figure with tools is the binding picture: a small hand-drawn agent, walking down the page, using a magnifying glass and a wrench. Both are quiet. Both are precise. Both are exactly what Adam asked for in his stated visions and what the Master Designer specified down to the curve.

Together, the two surfaces are what turns a SaaS dashboard into a *practice* — a working relationship with named, attributed, accountable agents, signed by a customer who knows what they signed.

That is the contract these two pages enforce. That is the design.

— *the senior product designer*
*Filed 2026-04-27*
