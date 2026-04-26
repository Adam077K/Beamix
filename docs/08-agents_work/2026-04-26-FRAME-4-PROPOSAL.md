# Beamix Frame 4 — PROPOSAL (Synthesis of 4-Seat Board Review)
Date: 2026-04-26
Status: PROPOSAL. Adam reviews, locks, or revises. Supersedes Frame 3 if locked.

---

## Why a Frame 4

Adam's instinct on Frame 3: **too minimalistic at the surface.** The 4-seat board confirmed it from four independent angles:

- **PM** — *"At $189-499/mo, Frame 3's above-the-fold communicates 'one thing is happening' when the value proposition is 'many things are happening simultaneously.' The calm at the surface is indistinguishable from inactivity."*
- **Designer** — *"'One sentence and one number' is a spec, not a visual. Frame 3 confuses 'calm' with 'empty.' Stripe is also 'a few numbers and charts' — but Stripe's are perfectly specified. Frame 3 describes content without saying what the page should look like."*
- **User Researcher** — *"Stripe / Linear / Vercel are calm-and-dense. Frame 3 is calm-and-empty. Sarah's stated preference is simplicity; her revealed preference is legible proof of work she can metabolize in 30-60 seconds."*
- **Visionary** — *"Frame 3 has no center of gravity. It's organized around a triad (Status / Decision / Number) that is a layout, not a worldview. Layouts don't define categories. Worldviews do."*

The board converged: Frame 3 has the right *philosophy* (calm tone, depth on demand, email as real channel) and wrong *execution* (sparse where it should be dense; reactive where it should be generative).

---

## The 4 board members' Frame 4 proposals at a glance

| Seat | Headline | Core move | Killer detail |
|---|---|---|---|
| **PM** | "Calm Signal, Rich Evidence" | Add an **Activity Pulse** (3 plain-text agent-action lines) above the fold + tier-visible per-engine strip | Per-engine strip with grayed-out gated engines is the in-product expansion driver Frame 3 missed |
| **Designer** | "Make invisible work visible at whatever level the user wants" | **Activity Ring** (hand-drawn pulsing gap circling the score) + **Crew Traces** (faint Rough.js underlines below text agents recently touched) | The product feels alive without demanding attention — "expensive" is felt through invisible 5,000 typographic decisions |
| **User Researcher** | "Calm surface, dense proof" | **Evidence Strip** (3 timestamped agent-action cards above the fold) + hybrid email cadence + monthly renewal anchor | The "sayable sentence" — Sarah at week 6 must walk away able to say "Schema Doctor fixed 3 errors Tuesday, Citation Fixer added 11 FAQs Wednesday, score up 5." That sentence IS the renewal. |
| **Visionary** | "Beamix as a firm rendered as software" (The Live Company) | **The Standing Order** (3-paragraph customer-written agreement persistent across every surface) + **House Memory** (compounding institutional knowledge) + **public-by-default permalinks** for every digest/scan/report | "Profound shows you what AI engines are saying about you. Beamix is the firm you hired to fix it — with a written agreement, an institutional memory, and a public record of every week's work." |

The four board files are committed alongside this synthesis: `seat-1-pm.md`, `seat-2-designer.md`, `seat-3-user.md`, `seat-4-visionary.md`.

---

## What the board AGREED on (7 cross-seat convergences — these go straight into Frame 4)

1. **Frame 3's surface is too sparse to justify $189-499.** Above-the-fold needs explicit proof of work in the user's first 8-30 seconds.
2. **The "evidence of work" must be specific, dated, and sayable.** "Healthy and gaining" is not evidence; "Schema Doctor fixed 3 markup errors on /pricing — Tuesday 10:14am" is evidence.
3. **Tier visibility on the surface.** Frame 3's above-the-fold is identical at $79/$189/$499 — that kills expansion. The product surface must show what the user is paying for and what more they could get.
4. **/crew is NOT a roster museum with card flips.** It's either a people-page (Visionary) or digest authoring + roster (PM/User Researcher). Card flips with hand-written field notes are out.
5. **/onboarding magic moment must be DELIVERED work, not promised work.** Frame 3's "your crew is on it" is a promise; Frame 4 puts at least one concrete agent action in /home within 60-90s of Paddle payment. (PM, User Researcher, Visionary explicit.)
6. **The hybrid email cadence beats Monday-only.** Weekly Monday digest + event-triggered briefs (score-move >3 points, competitor change) + monthly renewal-anchor email. Frame 3's Monday-only digest is a single point of failure. (User Researcher, with PM concurrence.)
7. **The depth defaults should AGE with the user.** Week 1 user wants to verify everything; month 6 user wants to glance and leave. Frame 3 treats them identically. Frame 4 ramps depth-default down as `weeks_since_signup` grows.

---

## Where the board SPLIT (the fundamental Frame 4 question for Adam)

**Question: Is Beamix a managed service, or is it a firm?**

| Position | Seats holding it | What it implies |
|---|---|---|
| **Managed service with rich evidence** | PM, User Researcher, Designer | Frame 3 + Activity Pulse / Evidence Strip / Activity Ring / Crew Traces. Same category as Wealthfront/Mint/Mercury but for GEO. Compete on operational excellence + proof-density. |
| **A firm rendered as software** | Visionary | A different category entirely. Standing Order replaces Status sentence. House Memory replaces credit/scan history. Public permalinks replace dashboard screenshots. Compete on relationship architecture, not feature parity. |

**This is the choice you have to make.** The two paths are NOT mutually exclusive at the visual level (Activity Ring + Crew Traces work in both), but they ARE mutually exclusive at the architectural level. Standing Order + House Memory are massive product surfaces with their own data models and lifecycle. They're either central to the product or absent — they can't be a feature.

The Visionary's argument for "firm": Frame 3 caps Beamix at $30-150M ARR (acquired by Semrush in year 4). Frame 4-as-firm caps higher because the architecture is portable to content marketing, reputation, fractional CMO categories — Beamix becomes the substrate for AI-native services firms, not just a GEO tool.

The PM/User Researcher counter: SMBs don't write Standing Orders. Sarah won't type 3 paragraphs about what she wants. The "firm" metaphor needs a guided assembler fallback — and at that point, is it really different from a goals-and-preferences page?

**My (CEO) synthesis recommendation:** **Take the firm framing, but ship a guided assembler at launch.** Reasons:
- The firm framing IS more category-defining; Adam keeps invoking "billion-dollar feel" and category leadership; Frame 3's robo-advisor framing tops out before that.
- The Visionary's House Memory + public permalinks are genuine architectural moats that compound — Frame 3 has no compounding asset.
- The Standing Order, written as a guided assembler with menu-pick chips that output prose, is achievable at launch. Sarah picks 3-5 items from menus; the system formats them into prose; she reviews and signs. That's a 90-second flow.
- The Activity Pulse / Evidence Strip / Activity Ring / Crew Traces from the other 3 seats all WORK INSIDE the firm framing — they become the surfaces where the firm's work is visible.

If you reject the firm framing, Frame 4 collapses to Frame 3 + PM/Designer/User Researcher's evidence-density additions. That's a respectable Frame 4.5 — better than Frame 3 but not category-defining.

I'm proposing both versions below, with the firm version as the primary recommendation.

---

## Frame 4 (Primary recommendation) — "The Firm, with Proof"

### The metaphor (Visionary)

Beamix is a small firm of 11 specialists hired to handle your AI search visibility. The product surface is the firm's office: a roster of who works for you, a written agreement defining what they're for, a record of correspondence, a Monday digest signed by name, public receipts of every week's work that you can share.

Profound shows you data. Beamix IS the firm.

### The signature elements (composed from all 4 seats)

#### 1. The Standing Order (Visionary)
A 3-paragraph (or shorter) written agreement between Sarah and her crew, in her own words. Lives at the top of /home as a 2-line excerpt with "Read the full order →" link. Referenced in every digest email. Editable; edits preserved as versioned letters.

**MVP delivery: Guided Assembler.** The user does NOT write 3 paragraphs from scratch. Onboarding presents:
- 5-8 chip menus that fill in the blanks of a sentence template
- Output is prose, not form: *"I want my crew to **get me cited on ChatGPT and Perplexity**. The most important AI engines for me are **ChatGPT, Perplexity, Gemini**. Don't change my brand voice without asking."*
- User signs (literally — animated pen-stroke). Order persists.
- Yossi at Scale can edit free-form for richer per-client orders.

This collapses Visionary's ambition with the User Researcher's behavioral concern.

#### 2. The Signed Status Sentence (Visionary + User Researcher)
Replaces Frame 3's bare status. The status reads as the crew speaking, not a system reporting:
- *"This week we shipped 6 fixes. Score is 78, up five. Nothing needs you."*
- Signed: small "— your crew" attribution.
- Color-coded by state (green/blue/amber).
- During score drops: User Researcher's "name cause + response + timeline" pattern.
  *"Score dipped 4 points — Profound published 12 new comparison pages. Citation Fixer is generating responses. Expect recovery within 2 weeks. — your crew"*

#### 3. The Evidence Strip (User Researcher) + Activity Ring (Designer)
Below the signed status, above the fold. Two integrated moves:

**Evidence Strip** — 3 timestamped agent-action cards in a horizontal row. Each card: *agent name + verb + object + timestamp + status*. Plain Inter, no decoration, click to expand inline.
- *"Schema Doctor fixed 3 markup errors on /pricing — Tue 10:14am — applied"*
- *"Citation Fixer added 11 FAQ entries — Wed 4:02am — applied"*
- *"Competitor Watch found you pulled even with Profound — Thu 8:30am — observed"*
- Empty week pattern: *"Quiet week — your crew ran 6 monitoring checks; nothing needed action."*

**Activity Ring** — 2px stroke ring (#3370FF) circling the score number with a hand-drawn gap. The gap pulses (1200ms breath) when agents are working, static when idle. Identifies Beamix in screenshots without decoration.

These two together solve the "is anything happening?" question in 8 seconds, with both ambient (ring) and explicit (cards) evidence.

#### 4. Crew Traces (Designer)
Faint Rough.js underlines below text agents have recently modified. Roughness 0.6, #3370FF at 30% opacity. Not labeled. Not explained. Power users (Yossi) learn them; Sarah doesn't need to. The "invisible work made visible" token applied at depth.

#### 5. Public Permalinks (Visionary)
Every digest, every scan, every report has a permanent URL: `app.beamix.tech/firms/[slug]/digests/2026-04-27`. Public by default (with a per-user toggle to private). The shareable artifact Frame 3 missed entirely.

Mechanic: Stripe payment receipts → Linear issue links → GitHub commits → Beamix digests/scans/reports. Sharing is the marketing surface.

For Yossi at Scale: digests render at his white-label subdomain.

#### 6. House Memory (Visionary)
Every approval, rejection, margin note, and Standing Order edit accumulates as the firm's institutional memory of how to work for this client. Not a chat log — a structured corpus that:
- Trains agent constraints per-account ("she rejected this style 4 times → don't try this style")
- Powers the Inbox to shrink over time (agents pre-empt rejections)
- Renders /home Section 6 as the "receipts list" — a reverse-chronological correspondence file

This is the compounding asset the prior frames lacked.

#### 7. Margin Note + Open Question (Visionary)
Two new connection mechanics:
- **Margin Note** — annotate any digest, scan, or report. The note enters House Memory; agents read it. Next digest references it: *"We saw your note about brand voice. Citation Fixer adjusted accordingly."*
- **Open Question** — bottom of every digest: "Anything you want to ask your crew?" One text area. Async, not chat. Next digest answers.

These replace Frame 2's notebook-as-personality and Frame 3's no-direct-channel.

#### 8. Hybrid email cadence (User Researcher)
- **Weekly Monday digest** — kept (signed by crew, references Standing Order, links to public permalink)
- **Event-triggered brief** — when score moves >3 pts OR competitor change OR high-confidence agent flag. Max 1 per 48hrs.
- **Monthly renewal email** — sent 7 days before billing date. The "sayable sentence" generator. *"This month, your crew shipped N changes. Top three: [...]. Score moved X → Y. Renewing on [date]."* Lives also on `/account/value`.

#### 9. Tier-visible UI (PM)
Above the fold on /home includes a single-line tier badge: *"Build plan — 6 engines, 8 agents active. Add competitors and 3 more engines on Scale →"*. Per-engine strip below the fold shows grayed-out gated engines. Activity Pulse / Evidence Strip is tier-aware (3 cards on Discover, 5 on Scale).

#### 10. Trust gradient (User Researcher)
- Week 1-2: first Evidence Card auto-expanded. Tip: "Click to see what we did."
- Week 3-4: all cards collapsed; tip persists.
- Week 5+: cards collapsed, tip removed.
- Yossi: verbose default permanently (operational use, not trust-building).

### The 5-second test (User Researcher's "moment of truth")

A Sarah session at week 6 walks away able to say (in any combination):
- *"My score is 78, up 5 this week."*
- *"Schema Doctor fixed 3 errors Tuesday."*
- *"Citation Fixer added 11 FAQs Wednesday."*
- *"My crew is closing the gap on Profound."*

That sentence IS the retention mechanism. Frame 4 builds for it explicitly. Frame 3 cannot produce it.

---

## Page-by-page deltas vs Frame 3 LOCKED

### `/home` (most significant rebuild)

**Above the fold (Frame 4):**
1. Standing Order excerpt — 2 lines, InterDisplay 22px, soft grey, "Read the full order →"
2. Signed status sentence — Inter 28px, signed "— your crew", color-coded
3. Score number with Activity Ring (72px tabular) + delta + "calculated against N queries → Methodology" footnote
4. Evidence Strip — 3 timestamped agent-action cards (5 cards on Scale)
5. Decision Card — conditional, signed empty state if absent ("Nothing exceeds your standing order this week. — your crew")

**Below the fold (Frame 4):**
6. Crew at Work — small horizontal strip of 11 agent monograms, pulsing if active. Hover for activity.
7. This Week's Net Effect — single paragraph, plain English (Designer's Section 2)
8. Score 12-week sparkline with hover-tooltips
9. Per-engine strip — tier-aware, gated engines grayed with upgrade hover
10. Crew Traces appear throughout below-fold text on items recently modified (≤24h)
11. The Receipts — reverse-chronological digest/scan/report list, each with permalink icon (House Memory rendered)
12. Goal track — "67% of the way to [Standing Order clause]"
13. Next scheduled scan + next digest send

### `/inbox`

**Frame 4:** Same structure as Frame 3, but inbox items are framed as "exceeds your Standing Order" — the Inbox shows things the crew flagged BECAUSE they go beyond what Sarah pre-authorized. Items reference the relevant clause. Approve/reject feeds House Memory; rejections optionally prompt "what was wrong?" → permanent agent constraint.

### `/workspace`

**Frame 4:** Demoted further — accessible via "watch your crew work" link from /home Crew at Work strip. The agent execution stream is unchanged from Frame 3 (Linear-grade clarity, no courier flow).

### `/scans`

**Frame 4:** Unchanged from Frame 3 (Stripe table, no receipt-tape ribbon). New addition: every scan row has a public-permalink icon. Click → opens the public scan page (the /scan public storyboard rendered with this scan's data) on a permanent URL.

### `/competitors`

**Frame 4:** Unchanged from Frame 3 surface (clean table). Rivalry Strip survives as depth view on row click. Each competitor row references the Standing Order clause that named it (if user named it in onboarding) or just shows the metric.

### `/crew`

**Frame 4:** Rebuilt as the firm's people-page (Visionary's vision):
- Above: "Your crew. 11 specialists working under your standing order."
- Roster list — agent name, role, what they did this week (in their own voice — *"I added 11 FAQ entries this week"*), success rate.
- Each agent's standing-order clause numbers shown ("Citation Fixer answers to clauses 1, 3, 7").
- Click agent → agent's employee page: scope, full work history, settings, conversation log with this user.
- Yossi sees a "Compose this Monday's note for client X" affordance — same page, expanded role.

### `/schedules`

**Frame 4:** Unchanged from Frame 3 (calm admin table, no Sentence Builder).

### `/settings`

**Frame 4:** Unchanged from Frame 3 (Stripe-replica forms, no Letter). New tab: **Standing Order** — full edit view of the user's order, with version history.

### `/scan` (public)

**Frame 4:** Unchanged from prior locked storyboard. Strikethrough-and-rewrite Frame 3 mechanic survives. Permalink renders as a public scan page that appears on every shared scan URL.

### `/onboarding` (significant rebuild)

**Frame 4 — "The Founding of the Firm":**
1. Step 1 — Confirm the brief (≤30s): pre-filled from /scan public flow.
2. Step 2 — Sign your Standing Order (≤90s): guided assembler with 5-8 chip menus. Output is prose. User signs (animated pen-stroke).
3. Step 3 — The crew responds (the wow): /home loads with Standing Order excerpt at top + first agent's first finding pre-populated as Evidence Card #1 (from a scan that started running at Step 1). 11 agent monograms appear at bottom of fold one at a time, each with one-line introduction. *"We received your standing order. The crew is reading your homepage now. We'll send our first digest on Monday. — your crew."*

The "delivered work, not promise" pattern (User Researcher) inside the firm framing (Visionary).

### `/reports`

**Frame 4:** Unchanged from Frame 3 (workmanlike form, Stripe-Press PDF). New: every PDF cover renders the client's Standing Order on the inside cover. The white-label digest export renders at Yossi's subdomain as a public permalink.

---

## Frame 4 Alternative (Adam-rejects-firm-framing) — "Frame 4.5: Calm, Dense, Proven"

If you reject the Visionary's firm metaphor, Frame 4 collapses to Frame 3 + PM/Designer/User Researcher additions:

- Activity Pulse / Evidence Strip above the fold (3 cards, plain text)
- Activity Ring + Crew Traces (Designer's signature)
- Tier-visible per-engine strip and Activity Pulse
- Hybrid email cadence (weekly + event-triggered + monthly renewal)
- Trust gradient by user-age
- /crew rebuilt as digest authoring + roster (Frame 3's plan, kept)
- Onboarding stays Vercel-pattern but adds "first evidence card pre-populated" within 60-90s

**No Standing Order. No House Memory. No public permalinks. No Margin Note. No Open Question.**

Frame 4.5 is a respectable answer — better than Frame 3 — but doesn't claim the category. PM, Designer, User Researcher all converge on this version when stripped of Visionary's worldview. It's the "smart compromise" Frame 3 was trying to be, executed with proper density.

---

## Open questions for Adam (consolidated from board's 20+ questions)

The board collectively raised over 20 questions. I'm surfacing the **6 that block Frame 4 lock**:

1. **Firm vs managed-service framing.** Lock the Visionary's "firm rendered as software" worldview, or stay in managed-service category? This is the decision that determines everything below.

2. **Standing Order — guided assembler vs free-form vs cut entirely.** If we lock firm framing: do we ship the guided assembler (recommended, 90s onboarding step) or the free-form text area (Visionary's preferred, but User Researcher's high-risk bet on Sarah's writing willingness)?

3. **Public permalinks — default-public or default-private with toggle.** Public-by-default is the viral mechanic but requires resolving abuse vectors, scraping, and competitor-snooping. PM raised this. The marketing upside is significant; the operational complexity is non-trivial.

4. **House Memory build-in-week-1.** The flywheel is the moat, but it's empty at launch. Does the product feel acceptable in week 1 with no accumulated memory? Visionary's Q4 — needs an answer.

5. **Trust-tier defaults.** Frame 3 raised this; still unanswered. Proposed: schema fixes / FAQ additions / citation corrections run auto-with-post-review; content rewrites pre-approve; pricing/brand copy always escalates. This affects Inbox volume and the "exceeds your Standing Order" framing.

6. **Onboarding Step 2 chip menus — content lock.** The guided assembler needs 5-8 chip menus. What are the canonical 5-8 questions/chip-options that all SMB types (B2C local, B2B SaaS, e-comm, services) can answer in 60-90s? This is a copy-write task best handed to growth-lead.

---

## Recommended next moves

If you lock Frame 4 (the firm version):
- **A.** Lock answer to Q1-3 above (firm framing, guided assembler, permalink policy).
- **B.** Spec the **Standing Order schema** (data model, version history, clause→agent mapping).
- **C.** Spec the **Monday Morning Digest** template under firm framing (signed, references Standing Order, links to permalink).
- **D.** Spec the **Onboarding Step 2 guided assembler** (chip menus, prose template, signature mechanic).
- **E.** Visual design system consolidation — Activity Ring component, Status Token, signed status typography, Crew Traces token.
- **F.** Begin /home rebuild (this is the surface where the most changes land).

If you lock Frame 4.5 (managed service version):
- A simpler path: Frame 3 + density additions. /onboarding pre-loads first evidence card. /home gets Activity Pulse + Activity Ring + Crew Traces + tier-visible per-engine strip. /crew stays as Frame 3 spec'd. 80% of Frame 3's build queue survives unchanged.

---

## What this preserves and what it kills from Frame 3

### Preserved (works in both Frame 4 and Frame 4.5)
- Trust-tier router (auto-run / pre-approve / always-escalate)
- /scan public 10-frame storyboard
- /reports white-label PDF artifact (Stripe-Press cover)
- Stripe-table /scans, /competitors, /schedules, /settings primary surfaces
- English-only UI
- Engineering principle: outcomes over process

### Killed/replaced from Frame 3
- Bare status sentence ("Healthy and gaining") → Signed crew sentence
- One Status / One Decision / One Number triad → quintet (adds Standing Order excerpt + Evidence Strip + Activity Ring)
- Empty space when no decision needed → signed empty state ("Nothing exceeds your standing order this week. — your crew")
- /crew as digest authoring tool → /crew as people-page (Frame 4) or stays as digest authoring (Frame 4.5)
- Monday-only digest → hybrid cadence (weekly + event-triggered + monthly renewal)
- Frame 3's onboarding Step 2 (3-option goal picker) → Standing Order guided assembler (Frame 4) or stays + first-evidence-card pre-populated (Frame 4.5)

---

## Closing — what the 4 seats agree the customer should feel

Stripped of frame politics, all 4 seats agree on the felt experience:

1. **Sarah opens Beamix in week 6.** In 8 seconds she sees: one signed status sentence ("we shipped 6 fixes; score 78, up 5"), her score with a hand-drawn ring around it, and 3 specific agent actions with timestamps. She reads. Closes the tab. Renews next month.

2. **Yossi opens Beamix in week 24.** In 30 seconds he reads /home, scrolls to the receipts list, clicks last week's digest permalink, copies the URL into his client email. Generates this week's white-label PDF. Closes the tab. Renews next month at $499.

3. **Both feel they have a real team working for them, not a dashboard reporting at them.**

Frame 4's job is to deliver that felt experience. Frame 4 (firm) does it through a more ambitious metaphor; Frame 4.5 (managed service) does it through density alone. Both beat Frame 3.

The choice is yours.
