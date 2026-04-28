# `/onboarding` — Detailed Design Spec v1

**Date:** 2026-04-27
**Owner:** Senior Product Designer (Beamix)
**Status:** v1 — ready for build review
**Source of truth:** Frame 5 v2 (locked), Board 3 Seat 2 (Master Designer), R3 onboarding audit (Vercel north star), Page List Locked (4-step flow)
**Surface:** `/onboarding/[1..4]` — gated, post-Paddle, one-time per account
**Time target:** 4 minutes total. Step 1 ≤30s · Step 2 ≤30s · Step 3 ≤90s · Step 4 ≤60s · Magic-moment transition ≤6s.

---

## 1. The onboarding philosophy + 4-minute target

Onboarding is the most expensive surface in the product and the cheapest one to get wrong. It is the place where the customer decides whether they paid for a tool or hired a crew. Every gesture in these four steps is engineered to push that decision toward "crew."

The dominant pattern in B2B SaaS (Linear, Notion, Vercel, Cursor) is **"the product IS the onboarding."** Linear's onboarding is creating an issue. Vercel's is shipping a deployment. Cursor's is writing a line of code with AI. Beamix's onboarding has to be **the moment Beamix delivers work** — not the moment Beamix is configured. By the end of Step 3 the customer is approving a paragraph Beamix authored about their actual business. By Step 4 they are filing the truth that governs everything Beamix will ever do for them. By the time they land on `/home`, the first agent has already produced its first finding on their real site. They paid; we shipped before they finished setup.

The philosophy is **"delivered work, not promise."** Most onboarding flows ask the customer to imagine future value. Beamix shows past-tense, present-tense, and future-tense value at the same screen: *"We already scanned your site (past). We're fixing 3 schema errors right now (present). Monday digest comes Monday (future)."* This is the trust frame that has to install in 4 minutes and then hold for 18 months.

The cinematography matters because onboarding is the **founding document of the relationship.** The Brief is a constitution; signing it is the constitutional moment; the Seal-draw is the public record of that signing. If we render the Brief in Inter on a white card with a blue button, we have shipped a SaaS confirmation step. If we render it on cream paper in Fraunces with a hand-drawn seal that strokes itself onto the page when the customer approves, we have shipped a *signing*. The customer leaves the screen with a different posture toward the product. They are not a user. They are the principal who hired a crew and signed the work order.

What the customer should feel at each step:

- **Step 1 (30s) — recognized.** Beamix already knows who they are. Their URL, business name, and industry are pre-filled from the public scan. They are confirming, not re-typing. This is the anti-form-fatigue move; it tells them Beamix respects their time before asking for anything.
- **Step 2 (30s) — equipped.** Beamix is issuing them tracked phone numbers and UTM tags right now. The numbers fade in one at a time. By the time they reach Step 3, they already have hardware in their hand. *"We brought tools."* Skippable, because not every customer is ready for attribution on day one.
- **Step 3 (90s) — read.** Beamix has read their site (deeper scan ran in the background during steps 1-2) and written one paragraph that names the work. The customer reads it. Edits any sentence by clicking a chip. Signs by clicking a single button. The Seal draws itself. They are no longer "trying" Beamix; they have authorized it.
- **Step 4 (60s) — authoritative.** They tell Beamix the canonical facts about their business — hours, services, key claims, voice. Every sentence Beamix ever writes will be checked against this file before publication. They have just become the source of truth.
- **Magic moment (instant) — proven.** `/home` boots up with their score, their Ring drawing around it, their first crew finding already pinned as Evidence Card #1, and the Crew at Work strip showing 18 monograms appearing one by one. The product is not introducing itself. The product is already working.

A 4-minute target is generous; the floor is 90 seconds for an experienced operator who skips Step 2 and approves the Brief without edits. The ceiling is 7 minutes for a careful operator who edits 3 chips in the Brief and types a complete Truth File. We design for both ends; both are wins.

---

## 2. Step-by-step design

### 2.0 Global frame (applies to all 4 steps)

**Viewport.** Designed for 1440×900 desktop primary, 375×812 mobile secondary. Min supported: 360px wide.

**Page chrome.** No global topbar. No sidebar. The onboarding takes the full viewport. The only persistent UI is:

- **Top-left:** the Beamix wordmark + sigil mark, 24px tall, `ink` color. Click does nothing during onboarding (no escape hatch — they're paying for this, finish it).
- **Top-right:** a 4-dot stepper. Each dot is 8×8, 8px gap. States: filled `brand-blue` for active, filled `ink-3` for completed (with a tiny Rough.js tick at 60% opacity overlaid), `border-strong` outline for upcoming. The dots are not clickable backwards — Step 2 is skippable but not re-enterable. Right of the dots, a 13px Geist Mono label `STEP 1 OF 4` with `tnum`, `ink-3`.
- **No "Skip" link** at the top. Skip lives only inside Step 2's primary panel as a deliberately-styled affordance.

**Background.** `paper` (`#FFFFFF`) on Steps 1, 2, 4. **`paper-cream` (`#F7F2E8`)** on Step 3 only. The background change at Step 3 is the cinematography — the customer feels the surface change beneath them as they enter the signing register.

**Content well.** Centered, max-width 640px on Steps 1, 2, 4. Max-width 720px on Step 3 (the Brief needs more room to breathe). Top padding from chrome edge: 120px on desktop, 48px on mobile.

**Forward motion.** A single primary button at the bottom of every step, 56px tall, 240px wide, `brand-blue`, white text, 16px Inter 500, 12px radius. Disabled state is `border-strong` outline with `ink-3` text. The button is anchored 96px below the last form element on desktop, 48px on mobile.

**Backward motion.** A small ghost button left of the primary, 13px Inter `ink-3`, label `← Back`. Visible on Steps 2, 3, 4. Step 1 has none (they came from Paddle).

**Autosave.** Every field saves to draft on blur (200ms debounce, then network). A 13px Geist Mono `ink-4` line *"Saved"* fades in at the bottom-right corner of the content well for 800ms after each save. If autosave fails: the line reads *"Couldn't save — we'll keep trying"* in `needs-you` color, no error modal. The customer keeps typing.

**Audio.** Silent across the entire flow. The Seal-draw is silent. No click sounds, no chimes, no transitions. Beamix is a serious operator; serious operators don't ding.

**Motion budget per step:** ≤1.6s of choreographed motion on first paint. After that, only on-interaction motion (chip click, button hover, autosave tick).

**Keyboard.** `Tab` advances fields. `Enter` on the last field submits the step (= clicks primary). `Esc` does nothing (no escape from onboarding). `Cmd+Z` works on text inputs, not on chip edits (chip edits autosave; the chip is the undo target).

**Reduced motion.** Every motion below has a designed static state. The Seal appears finished. The signature appears in place. The Score appears at value. The Ring appears static.

---

### 2.1 Step 1 — Confirm the basics (≤30s)

**Purpose.** Re-affirm the data Beamix already has from the public scan. Anti-form-fatigue. Establish "we know you."

**Layout (640px well):**

```
[ 120px top breath ]

text-h2 (32px InterDisplay 500)        ← "Confirm your business"
                                          1 line, ink

text-base 15px Inter ink-3             ← "We pulled this from your scan. Edit
72px below the h2, max-width 480px        anything that's not right."

[ 48px gap ]

  Field 1 — Website                    ← stacked label + input
  Label: 11px Inter caps tracking 0.10em ink-4 "WEBSITE"
  Input: 56px tall, 16px Inter 400, 12px horizontal pad,
         border-strong, 8px radius, paper background.
         Pre-filled: "https://acme-plumbing.com"
         Right-aligned inline icon: 16px globe glyph, ink-4

  [ 24px gap ]

  Field 2 — Business name
  Label: "BUSINESS NAME"
  Input: pre-filled "Acme Plumbing"

  [ 24px gap ]

  Field 3 — Industry
  Label: "INDUSTRY"
  Input: combobox, 56px tall, dropdown indicator on right.
         Pre-filled "Local home services — Plumbing"
         (matched from one of the 12 vertical knowledge graphs)

  [ 24px gap ]

  Field 4 — Primary location (city, region)
  Label: "PRIMARY LOCATION"
  Input: text field. Pre-filled "Tel Aviv, Israel" if detectable
         from the scan; empty + placeholder "Where do most of your
         customers come from?" if not.

[ 96px gap ]

  [ ← Back hidden ]                    [ Continue ]   ← primary button
```

**Pre-fill rules.**
- `website`: from the URL the customer scanned. Always present.
- `business_name`: from `og:site_name`, then `<title>`, then domain heuristic. Always populated; customer can edit.
- `industry`: classified by the Industry Knowledge Graph Curator agent during the public scan. We commit to one match (highest-confidence vertical) and put `(change)` ghost link below the field if confidence < 70%. The combobox lists the 12 vertical KGs + an "Other" option that triggers a generic Truth File schema in Step 4.
- `primary_location`: from address schema, `og:locale`, hreflang, or business directory match. Empty if none detected.

**Validation.**
- `website` must be a parseable URL with TLD. Inline error 13px Inter `score-critical` below field: *"That doesn't look like a website. Check it?"*
- `business_name` 1-80 chars, can't be empty.
- `industry` must be a non-Other vertical OR Other + a free-text descriptor (40 chars max).
- `primary_location` is optional. If empty, defaults to `null` and Beamix infers later.

**Errors.** Inline only. No modal, no toast, no top banner. The primary button stays disabled until all required fields validate.

**Motion.**
- 0ms: page renders with all fields pre-filled (no typed-in animation — these values were already known).
- 100ms: a 600ms fade-in (linear, opacity 0 → 1) runs once on the entire content well. This is the *only* entrance choreography; it tells the customer "we just composed this for you."
- On field focus: `border` shifts to `brand-blue` over 100ms. No glow, no shadow.
- On valid + complete: the primary button transitions from disabled to enabled with `motion/pill-spring` (back-out, 280ms). The button announcing itself is the cue.

**Time benchmark.** Operator who edits nothing: 5 seconds (skim, click Continue). Operator who corrects industry + adds location: 25 seconds.

---

### 2.2 Step 2 — Set up Lead Attribution (≤30s, skippable)

**Purpose.** Issue trackable Twilio numbers + UTM tags now, so the Lead Attribution Loop is live before the first scan completes. This is the renewal mechanic — the customer who can later say "you got me 23 calls last month" stays. Skippable because not every customer is ready, but heavily encouraged via the Designer's editorial copy.

**Layout (640px well):**

```
[ 120px top breath ]

text-h2 — "Set up call tracking"
                                                           1 line

text-base — "Beamix issues you a tracked phone number that
forwards to your real line. When customers call after finding
you in ChatGPT or Perplexity, we attribute the call. You see
'Beamix got you 23 calls this month' on your home page."

72px below h2, max-width 560px, ink-3, line-height 24px.

[ 48px gap ]

[ Issued numbers panel — paper-elev background, border, 12px radius, 24px pad ]

  Label: "YOUR NEW NUMBERS"  (11px caps)

  [ Number 1 row — appears with 200ms fade ]
  ☎ +972-3-XXX-XXXX  ·  forwards to your existing line
  13px Geist Mono ink, 16px Inter ink-3 below
  Right-aligned: a tiny "Copy" ghost button

  [ Number 2, Number 3 — same, fade in staggered 300ms ]

  Below the 3 numbers, 24px below the last row:
  ghost text "We'll add up to 3 more on Build, unlimited on Scale."
  13px Inter ink-4

[ 24px gap ]

[ UTM tags panel — same chrome ]

  Label: "UTM TAGS WE'LL USE"
  4 chips on one row:
  utm_source=beamix · utm_medium=ai_search · utm_campaign=geo · utm_content=[engine]
  Each chip: 32px tall, 11px Geist Mono, 12px horizontal pad, paper bg, border.

[ 96px gap ]

  [ ← Back ]   [ Skip for now ]   [ Issue & Continue ]
              ghost, ink-3        primary, brand-blue
```

**Skip mechanics.**

The "Skip for now" button is a ghost button — `border` outline, 56px tall, 160px wide, `ink-3` text, 14px Inter 400. It is **deliberately less prominent** than "Issue & Continue" but **more prominent than a hidden link.** The label is "Skip for now" not "Skip" — the "for now" is a copywriter's nudge: this is deferred, not refused. Click → Step 2 marks `attribution_status = "skipped"` in DB → advances to Step 3. The customer can return any time via `/settings → Phone numbers` tab.

If skipped, Step 2's stepper dot becomes `ink-3` filled with a *hollow* tick (not the solid completed tick). At 60% opacity. This is a subtle visual record: "you skipped, but it's not closed."

If completed, the 3 phone numbers persist into `/settings` and appear as the customer's owned hardware.

**Provisioning failure.** If Twilio provisioning fails (network error, region unsupported, balance), the panel shows a single line at `needs-you` color: *"We couldn't issue numbers right now. We'll keep trying in the background. Continue without — we'll surface them in Settings when ready."* The "Issue & Continue" button changes to "Continue" (no issuance attempt repeated; background job takes over). No retry button — the customer doesn't fix Twilio outages.

**Motion.**
- 0ms: page renders with empty numbers panel.
- 100ms: the entire content well fades in (600ms linear).
- 700ms: number 1 fades in (200ms).
- 1000ms: number 2.
- 1300ms: number 3.
- After the third lands, the "Issue & Continue" primary button receives its `motion/pill-spring` enable cue.

The cumulative effect: the customer feels Beamix is *doing something for them* during this step — issuing physical hardware. It's the only step where the page itself performs work in real time.

**Time benchmark.** 8 seconds if they hit "Issue & Continue" the moment numbers finish loading; 25 seconds if they read the explanation.

---

### 2.3 Step 3 — Approve your Brief (≤90s) — THE HERO STEP

**Purpose.** The cinematic peak. The customer reads a paragraph Beamix authored about their actual business, edits any sentence by clicking a chip, signs by clicking a single button, watches the Seal draw itself onto the page. The constitution is now in force.

**Background change.** The body background transitions from `paper` to `paper-cream` (`#F7F2E8`) over 800ms (linear, opacity cross-fade between two layered backgrounds). Simultaneously, the chrome wordmark + stepper shift from black-on-white to black-on-cream (no change to the elements themselves — the cream behind them is enough). The customer **feels the surface change beneath them.** This is the entry into the artifact register.

**Layout (720px well):**

```
[ 120px top breath, on cream ]

text-h2 — "Your Brief"
ink, 32px InterDisplay 500.

[ 24px gap ]

text-base — "We read your site. Here's what we propose to do.
Click any sentence to edit it. Approve when it reads right."
ink-3, 15px, max-width 560px, line-height 24px.

[ 72px gap ]

[ THE BRIEF — the artifact ]

A 720px-wide block, no border, no card chrome. Just type on cream.
Top edge has a tiny Geist Mono 11px caps line:
"BRIEF · DRAFT v1 · Apr 27, 2026"  — ink-4, 0.10em tracking

[ 24px gap ]

[ The Brief paragraph — text-serif-lg, 22px Fraunces 300, opsz 144,
  soft 100, wonk 0, ss01, 40px line-height, ink ]

"Beamix recommends focusing on emergency-plumbing queries on
ChatGPT and Perplexity, where customers in Tel Aviv ask 'who can
come now?' more than 'who's licensed?' Your homepage doesn't have
FAQ schema; we'll add it. Three competitors — RotoTel, ZipPipe,
and Drainmasters — are cited more often than you on these queries;
we'll respond with question-anchored content under your brand. Don't
change your brand voice without asking."

  ↑ Each underlined-style sentence (5 sentences here) becomes a
    "Brief sentence", a discrete unit. Hover state: a Rough.js
    underline draws beneath the entire sentence (1.5px, brand-blue
    28%, roughness 0.6, 200ms).

  ↑ Within each sentence, certain spans are CHIPS (see chip rules).
    Chips appear inline as soft brand-blue-soft pills with the value
    in regular text weight. Hover: chip border darkens to brand-blue.

[ 48px gap ]

[ Bottom-right of the Brief block: a 24px Margin reserved for the seal.
  Empty until approval. ]

[ 96px gap ]

  [ ← Back ]                                    [ Approve and start ]
                                              primary, brand-blue, 56px
                                              centered horizontally OR
                                              right-aligned within well
```

**Chip mechanics — the editing model.**

The Brief is a structured object, not free-text. Each sentence is a template with named slots (chips). Examples of chip types in the example Brief above:

| Chip type | Example value | What clicking does |
|---|---|---|
| `vertical_focus` | "emergency-plumbing queries" | Opens a dropdown of detected vertical query clusters from the scan. Customer picks one or types a custom phrase (40 char max). |
| `engines` | "ChatGPT and Perplexity" | Opens a multi-select of the 11 text engines. Min 1, max 11. Defaults to the engines where the customer ranks worst (most leverage). |
| `geography` | "Tel Aviv" | Free-text city/region field. 40 char max. |
| `query_pattern` | "'who can come now?' more than 'who's licensed?'" | Editable as a free-text contrast pair. The two clauses are separate inputs joined by "more than". |
| `competitors` | "RotoTel, ZipPipe, and Drainmasters" | Multi-add chip with autocomplete from the competitor scan. Min 0, max 5. |
| `voice_constraint` | "Don't change your brand voice without asking" | Toggleable assertion: this sentence can be removed entirely, or its boolean inverted to "Feel free to evolve our voice." |

**Chip interaction.** Click a chip → it expands inline (200ms, ease-out, height auto from 32px to ~56-96px depending on type). The expanded state has the editing input + a tiny "Done" pill (28px, brand-blue) and an "Esc" hint (11px Geist Mono ink-4). Click outside or press Esc or click Done → chip collapses with the new value, autosaves (200ms POST), and a 13px Geist Mono "Saved" tick fades in at the bottom-right corner of the well for 800ms.

While a chip is expanded, the surrounding sentence text dims to `ink-3` and the Brief's other sentences dim to `ink-4`. The active chip is the only thing at full ink. This is the **focus discipline** — editing one chip doesn't visually pollute the rest.

**Sentence-level edit.** Below each sentence, on hover, a tiny ghost link appears: `Edit whole sentence` (11px Geist Mono ink-4). Click → the entire sentence becomes a textarea pre-filled with its current rendered text. Saving regenerates that sentence as free-text (loses chip structure for that sentence). This is the escape hatch for customers who want to fully rewrite. Used sparingly; chip-editing covers 90% of cases.

**Sentence-level remove.** Each sentence has a tiny `×` glyph (11px ink-4) at its right margin, only visible on hover. Click → the sentence fades out (200ms) and the others reflow. Min 2 sentences in a Brief; the `×` disables on the second-to-last sentence with a tooltip "Briefs need at least 2 sentences."

**Add-sentence.** Below the last sentence, a 13px Inter ink-4 ghost line: `+ Add a sentence`. Click → opens a small picker of 6 sentence templates (geography expansion, additional engines, content-type focus, response cadence, exclusion clause, custom). Picker is a popover, 320px wide. Pick → new sentence inserts above the picker, with default values filled.

**Auto-save & versioning.** Every chip edit, sentence edit, or sentence add/remove autosaves and increments a hidden draft version counter. The customer's chosen version is committed to v1 only on Approve. If they navigate away mid-edit and return, the draft is restored (server-side draft state keyed by user_id).

**The "Approve and start" button.**

State 1 (draft has unsaved chip): button label is `Save and approve` and is `border-strong` outline (not solid).
State 2 (all saved): button label `Approve and start`, solid `brand-blue`, white text, 56px tall, 240px wide. 16px Inter 500. The button has a faint Rough.js seal-mark glyph next to the label, drawn at 24% opacity, 12×12. On hover, the seal-mark draws to 100% opacity over 200ms — the foreshadowing of the artifact you're about to author.

**The Seal-draw signature ceremony.**

This is the single most important interaction in the entire product. Every detail below is load-bearing.

Sequence (triggered by clicking "Approve and start"):

1. **0ms — button transition.** The button fades to `paper-elev` background with `ink-3` label "Signing…" (200ms cross-fade). The seal-mark inside the button vanishes simultaneously.
2. **200ms — Brief block scrolls** (if needed) to ensure the bottom-right Margin of the Brief is in viewport. Smooth, 400ms ease-out.
3. **400ms — the Seal stamps.** A `Rough.js` six-point star (the Beamix sigil mark from the logo), 32×32, rendered with `roughness: 1.4`, `bowing: 1.0`, `seed: <user_id_hash>` (so every customer's Seal has its own micro-jitter — *their* seal, not a stamp). Stroke `brand-blue` (`#3370FF`), 1.5px.

   **Seal-draw is a STAMPING motion, not a tracing motion (re-curved 2026-04-28).** 540ms total: 240ms path-draw with `cubic-bezier(0.34, 0.0, 0.0, 1.0)` + 100ms hold + 200ms ink-bleed (stroke deepens from 60% opacity to 100%). The Seal is stamped, not drawn. Strokes appear in hand-order (outer hexagon perimeter first, then inner star points) but as one decisive press, not a slow pen tracing.
4. **940ms — the Seal lands.** A 50ms scale-overshoot (`motion/pill-spring`, `cubic-bezier(0.34, 1.56, 0.64, 1)`, scale 1.0 → 1.04 → 1.0). This is the "stamp on paper" beat — already implicit in the ink-bleed phase, kept here for the final visual settle.
5. **1300ms — the signature appears.** After the Seal completes its 540ms stamping motion, the line "— Beamix" appears in 22px Fraunces italic 300, opsz 144, ink, with a 300ms opacity fade-in (NOT a stroke-draw, NOT a letter-by-letter pen animation). The Seal IS the signature; the typed wordmark is the read-back. (Cut 2026-04-28 — Rams + Ive convergence: "the same gesture twice — like pressing send and then pressing send.")
6. **1900ms — the Brief is "filed."** Three things happen in parallel over 600ms:
   - The Geist Mono header line at the top of the Brief block changes from `BRIEF · DRAFT v1 · Apr 27, 2026` to `BRIEF · v1 · SIGNED Apr 27, 2026 — 14:32` (cross-fade 200ms).
   - All chips lose their interactive affordance: hover/click do nothing; cursor becomes `default`; chip backgrounds shift from `brand-blue-soft` to `paper-cream-darker` (a hair darker than background, ~`#F2EBDA`). The sentences become read-only prose.
   - The "Approve and start" button is replaced (cross-fade) by a 13px Geist Mono ink-3 line: *"Signed. Continuing…"*
7. **2500ms — page transitions to Step 4.** Background cross-fades from `paper-cream` back to `paper` (800ms). The Brief artifact slides upward and out of the viewport (translate-y -120px, opacity → 0, 600ms, ease-in). Step 4's content fades in (400ms, starting at 2700ms).

**Total signature ceremony duration: ~2.5 seconds.** The customer watches the Seal draw, sees the signature appear in their crew's "hand," sees the document stamp itself as filed. They have not been waiting; they have been *witnessing*.

**Audio.** Silent. The Designer's stated rule: serious operators don't ding. The motion is the ceremony.

**Reduced motion.** The Seal appears finished at 0ms with no draw animation. The signature appears in place. The header line shows the signed state immediately. The button cross-fades to "Signed. Continuing…" at 200ms. Total reduced-motion duration: 800ms.

**Errors during signing.** If the Brief commit fails (network), the button reverts to `Approve and start` solid state with a 13px Inter `needs-you` line below: *"Couldn't file the Brief — try again?"* No modal. The Seal does not draw on retry; the customer clicks the button and the full ceremony plays on success.

**Time benchmark.** Customer who reads + approves without edits: 35 seconds (read 25s + signing 2.5s + buffer). Customer who edits 2 chips: 70 seconds. Customer who restructures sentences: 90+ seconds.

---

### Step 3.5 — "Print this Brief" (F27, one-time offer)

After the Seal lands and the signature appears, a single offer renders below the Brief:

- 14px Inter 400 ink-3 link "Print this Brief →"
- Centered, 32px below the signature line
- Visible for 8 seconds; dismissable via Continue button or implicit timeout
- Click → generates a single A4 PDF of the Brief in cream-paper editorial register (cream paper, Fraunces 300, signed Seal, dated)
- Server-side generation via existing React-PDF infrastructure (zero net new engineering)
- One-time offer per Brief signing — never appears again

Most customers won't click. The 7% who do print and pin to a wall become evangelists. Cost: <1pd.

---

### 2.4 Step 4 — Upload your Truth File (≤60s)

**Purpose.** Mandatory. The customer types or uploads canonical facts about their business. Every agent output Beamix ever ships will be checked against this file before publishing. Truth File is the **trust mechanism** — it's why we can promise pre-publication validation, brand-voice fingerprinting, and incident runbooks.

**Layout (640px well, back on white paper):**

```
[ 120px top breath, on paper ]

text-h2 — "What's true about your business"
ink, 32px InterDisplay 500.

[ 24px gap ]

text-base — "Beamix checks every word it publishes against this
file. If something here is wrong, agents will quietly produce
wrong things forever. Take a minute."
ink-3, 15px, max-width 560px, line-height 24px.

[ 48px gap ]

[ Truth File form — structured fields, not free-text textarea ]

Each field has:
  Label (11px caps tracking 0.10em ink-4)
  Helper line (13px Inter ink-3, line below the label)
  Input (varies by field type)

  Field 1 — Business hours
  Label: "WHEN ARE YOU OPEN?"
  Helper: "Beamix will quote these in answers about availability."
  Input: A 7-row mini-table (Mon-Sun), each row has two 80px-wide
         time fields (open / close) + a "Closed" checkbox. Pre-filled
         from schema markup if detected; empty otherwise.
         Compact: total ~280px tall.

  [ 24px gap ]

  Field 2 — Services / products
  Label: "WHAT DO YOU OFFER?"
  Helper: "List the 5-15 things you actually sell. One per line."
  Input: A multi-line list. Each line is a chip-input row (32px tall,
         add new row by pressing Enter). Pre-filled from scan if
         detected (services schema, navigation, h2/h3 headings on
         /services pages).

  [ 24px gap ]

  Field 3 — Service areas
  Label: "WHERE DO YOU SERVE?"
  Helper: "Cities, regions, or 'national' / 'global'."
  Input: chip-input row. Free-text chips, comma or Enter to add.

  [ 24px gap ]

  Field 4 — Three claims you can defend
  Label: "WHAT'S TRUE ABOUT YOU THAT MOST COMPETITORS CAN'T SAY?"
  Helper: "Examples: '24/7 emergency response,' 'Licensed in 4
           regions,' '20 years in business.' Three short claims."
  Input: 3 single-line text fields, stacked, 56px tall each.
         Placeholder text on each: "e.g., 24/7 emergency response"

  [ 24px gap ]

  Field 5 — Brand voice
  Label: "HOW DO YOU SOUND?"
  Helper: "Three words. Beamix will write to match."
  Input: 3 single-line text fields side-by-side (each 184px wide,
         24px gap). Placeholder on first: "e.g., direct"

  [ 24px gap ]

  Field 6 — Anything Beamix should never say
  Label: "ANYTHING WE SHOULD NEVER SAY?"
  Helper: "Words, claims, comparisons. Optional but powerful."
  Input: textarea, 4 rows tall (~96px), ink, paper, 8px radius.

[ 96px gap ]

  [ ← Back ]                              [ File this and start ]
                                          primary, brand-blue
```

**Validation (the mandatory question).**

Truth File is mandatory. Empty Truth File means we cannot ship pre-publication validation, which means we cannot ship the Trust Architecture, which means we cannot ship MVP. So we enforce minimums:

- **Field 1 (hours):** at least one day of the week must have hours OR be marked Closed. (Allows businesses that are always-open to fill 24:00 - 24:00; allows seasonal businesses to mark all-Closed if they're between seasons.)
- **Field 2 (services):** at least 1 entry. No upper limit.
- **Field 3 (service areas):** at least 1 chip OR a single chip "global."
- **Field 4 (claims):** all 3 fields required, each ≥10 chars. This is the hardest field and the most important; it is the single biggest source of agent errors when missing.
- **Field 5 (voice):** all 3 words required, each 1 word, 1-20 chars.
- **Field 6 (never-say):** optional. May be empty.

The primary button "File this and start" is **disabled** until all required fields validate. Inline errors below each field on blur. No top banner. Like Step 1, the disabled-to-enabled transition uses `motion/pill-spring`.

**The "I'll do this later" trap.**

There is no "Skip" button on Step 4. There is no "Fill in defaults" button. There is no "Beamix will guess" affordance. The customer has to type. **This is the deliberate friction** — the Trust Architecture lives or dies on Truth File quality, and an empty file is the highest-cost outcome for the relationship.

If the customer abandons at Step 4 (closes tab, navigates away), their Step 1-3 state is fully saved (Brief is signed in DB; phone numbers are issued). They return and land directly back at Step 4 with whatever Step 4 fields they had partially filled. They are *blocked* from `/home` until Step 4 is complete. The dashboard route checks `truth_file_filed_at` and redirects to `/onboarding/4` if null.

**Validation depth (server-side checks).**

On submit, the server runs three quick validation checks before `truth_file_filed_at = NOW()`:

1. **Hours sanity:** at least one day has open ≠ close (or is Closed). Reject obvious garbage like all 0:00-0:00 (other than all-Closed seasonal).
2. **Services length:** average chip length > 3 chars (rejects "a", "b", "c" garbage rows).
3. **Claims substance:** each claim has ≥3 words OR ≥10 non-whitespace chars. Rejects "yes" / "we do" / "good".

If any check fails, the form re-renders with inline errors at `needs-you` color: *"This claim is too short — say more."* The customer fixes and re-submits. We do not block on stylistic quality, only on obvious garbage. **We trust the customer; we just don't trust their first draft when their first draft is empty.**

**Pre-fill from Step 1-3.**

By the time the customer reaches Step 4, the deeper background scan has produced Truth File candidates:
- Hours from `OpeningHours` schema or footer regex
- Services from `Service` schema, navigation menus, h2/h3 on `/services`
- Service areas from `address` schema, `og:locale`, hreflang, `areaServed`

These candidates are **pre-filled but visibly marked** — each pre-filled chip has a tiny brand-blue dot at its top-right corner (4px). On hover: tooltip *"Beamix found this on your site. Edit if it's wrong."* The customer can clear the field and start fresh. The dot disappears once they edit.

**Time benchmark.** Operator with pre-fill matching reality: 30 seconds (skim, edit one field, type 3 claims). Operator without pre-fill: 90 seconds (types everything). Operator who takes their time: 3 minutes.

---

## 3. The magic moment — landing on `/home`

The transition from Step 4 to `/home` is the second-most-important moment in the flow (after the Seal-draw). The customer has filed. The product must now show that filing already produced work.

**The transition itself.**

Customer clicks "File this and start" on Step 4. Sequence:

1. **0ms — the button transitions.** Cross-fade to `paper-elev` with ink-3 label "Filing…" (200ms). A 16×16 Rough.js seal-mark draws to the right of the label over 600ms (same Seal as Step 3, but smaller — this is the second Seal of the customer's relationship: the Truth File is also signed work).
2. **800ms — Step 4 content fades out.** The form fades to opacity 0 over 400ms. Background remains `paper`.
3. **1200ms — page commits.** Browser navigates to `/home` (client-side route, not full reload — the SPA shell is already loaded).
4. **1200-1800ms — `/home` skeleton renders.** Sidebar appears (instant), top-bar appears, content area is empty paper.
5. **1800ms — the Score begins counting up.** From 0 to the customer's actual score (e.g., 47). 1200ms ease-out-expo. *Slower than the daily count-up* (800ms) — this is ceremonial. The Ring is empty during this.
6. **1900ms — the Ring begins drawing** around the Score. SVG arc stroke-dashoffset → 0 over 1500ms with `cubic-bezier(0.4, 0, 0.2, 1)`. Starts at -90° (top), draws clockwise to +252°, leaving the gap at top-right. The Rough.js dash terminus appears in the final 200ms.
7. **3000ms — the Score lands at value, the Ring is closed-with-gap, the gap begins its first pulse.** This is the user's first encounter with the canonical /home hero state.
8. **3000ms — the editorial summary line writes itself.** Below the Score+Ring: *"We received your Brief. We're reading your homepage right now."* in 22px Fraunces 300 (text-serif-lg). Typed character-by-character at 40 chars/sec (~2 seconds for the line). Cursor blinks at the end during typing.
9. **5000ms — Evidence Card #1 slides up.** Below the editorial line, a `paper-elev` card with `border`, 12px radius, 24px pad, ~140px tall. Spring entrance (`motion/card-entrance`, translate-y 12 → 0, opacity 0 → 1, 280ms back-out). Contents:
   - Top: agent monogram (Schema Doctor, 16×16 Rough.js, agent's color) + agent name in 14px Inter 500
   - Headline (16px Inter 500 ink): *"3 schema errors on /pricing — fixing now"*
   - Diff preview (13px Geist Mono ink-3): *"+ Service schema · + LocalBusiness · - duplicate FAQ id"*
   - Right-side timestamp (13px Geist Mono ink-4): *"started 8 sec ago"*
   - The card has a faint pulsing brand-blue dot at its top-right corner — work in progress.
10. **5500ms — the Crew at Work strip appears.** Below the Evidence Card, a horizontal 56px-tall strip with 18 agent monogram circles (16×16 Rough.js, each a different agent color, each with their own seed). The strip fades in as a whole (300ms), then each monogram pulses on individually with a 80ms stagger from left to right (total: 80ms × 18 = 1440ms). Active agents pulse continuously at 1200ms; idle ones are static at 60% opacity.
11. **7000ms — final state.** The page is composed: Score 47 in the Ring, Fraunces editorial line below, Evidence Card #1 with pulsing work indicator, Crew at Work strip with 18 monograms (some pulsing), and below the fold: Section 2 onward (Score Trend skeleton, KPI cards skeleton, Receipts skeleton — all rendered but not yet animated; they animate on first scroll).

**Total transition duration: ~7 seconds from clicking "File this and start" to fully composed `/home`.** The customer is not waiting; they are watching their crew assemble.

**The micro-text rotation under the Status Sentence.**

The Fraunces editorial line *"We received your Brief. We're reading your homepage right now."* is the **starting state** of a continuously-rotating micro-text under the Score-cluster. While Beamix runs the post-onboarding work cycle (which takes ~3-8 minutes in the background), the line rotates every 6 seconds with cross-fade (`motion/microcopy-rotate`, 200ms cross-fade, 5800ms hold):

- *"We received your Brief. We're reading your homepage right now."*
- *"Schema Doctor is fixing 3 errors on /pricing."*
- *"Citation Fixer drafted 11 FAQ entries — they're in your Inbox."*
- *"Competitor Watch is reading RotoTel's pricing page."*
- *"FAQ Agent is matching how Perplexity asks questions in your vertical."*
- *"Long-form Authority Builder is drafting one pillar piece — review on Friday."*
- *"Trust File Auditor checked everything against your Truth File. All clear."*

The rotation continues until the post-onboarding work cycle completes (~3-8 minutes), at which point the line **settles** into the canonical /home state: *"Your crew shipped 6 changes this hour. One thing needs you."* with a Decision Card slide-up. From that moment forward, /home behaves like the daily-destination /home (no more rotation, just the static editorial line + Activity Ring pulsing).

**When does the customer's first interaction happen?**

The customer is **not interrupted with a CTA.** No "Got it — show me Beamix" button. No tour overlay. No "Click here to continue." They have just landed on their working `/home`. The product is performing in front of them. They can:

- Stay and watch (most common — the rotation is hypnotic for ~30 seconds)
- Click any monogram in the Crew at Work strip (opens that agent's profile in /crew)
- Click the Evidence Card (opens the diff preview drawer; can approve/reject from there)
- Scroll down to see the rest of /home (Score Trend, KPI cards, etc.)
- Use Cmd+K to navigate anywhere

The intent is: **the customer leaves onboarding and immediately becomes a /home user.** There is no "post-onboarding tutorial." The rotating micro-text plus the Crew at Work strip plus the live Evidence Card teach the surface by demonstration. After 30-60 seconds the customer has implicitly learned: this is where I see what my crew is doing.

**The first /inbox notification.**

Within ~90 seconds of landing on /home, the **/inbox icon in the sidebar gets a notification dot** — the first item is ready for the customer's review. Citation Fixer has drafted 11 FAQ entries; they need approval. The dot is `needs-you` amber, 6px, with a faint pulsing glow. This is the **primary call-to-action** without ever rendering a CTA. The customer notices the dot and clicks. That click is their first authored decision in the product (separate from approving the Brief).

**The Monday Digest promise.**

The rotation includes one line that names the future cadence: *"Monday digest comes Monday at 7am — that's when you'll see the full week."* This sets the temporal contract and prevents the customer from refreshing /home obsessively for hours waiting for "more."

---

## 4. Variations

### 4.1 Free /scan public → signup flow (the dominant path)

The customer ran a free public scan at `/scan` (or `beamix.tech/scan` if hosted on Framer), saw their score, hit a CTA "Run weekly. Fix automatically." → Paddle checkout → returned to product. They expect Beamix to know who they are.

**What carries forward:** `scan_id` is appended to the Paddle return URL. On `/onboarding/1` mount, the server fetches the scan record and pre-fills:
- `website` (always)
- `business_name` (from scan's enriched metadata)
- `industry` (from the IKG Curator's classification)
- `primary_location` (if extracted)
- A snapshot of the public scan's findings (used by Step 3's Brief composition)

The customer reaches Step 1 with all 4 fields populated. They confirm in 5 seconds and continue. By Step 3, Beamix has already drafted the Brief from the scan's findings + the deeper background scan running during Steps 1-2. The Brief feels prescient because it is.

**What's different:** the welcome line on Step 1's page header reads *"We pulled this from your scan."* (scan-context). The customer is told that what they're seeing is continuity, not magic.

### 4.2 Direct signup (no prior `/scan`)

Some customers will sign up directly — from the Framer marketing site's "Start free" CTA, or from a referral link, or from cold outreach. They have no `scan_id`. Beamix must run the public scan as part of onboarding.

**Flow modification:** Step 1 is replaced by a **Step 0** (a fifth step at the front, but still labeled "1 of 4" to the customer):

```
text-h2 — "Where can we find you?"
text-base — "Drop your URL. We'll scan you against 11 AI engines
            in about 90 seconds. Then we'll show you what we found."

[ Single field: URL input, 56px tall, autofocus, 16px Inter ]
[ Primary: "Scan and continue" ]
```

Click → the scan runs in the background (no separate "scanning" page; the customer advances to a *condensed* Step 1 immediately, where the URL is pre-filled and the other 3 fields are filled progressively as the scan completes). The Step 1 fields populate in real time over ~30 seconds:
- `business_name` populates at ~5s (fastest; from `og:site_name`)
- `industry` populates at ~15s (after IKG Curator runs)
- `primary_location` populates at ~25s (after schema/locale extraction)

Each field populates with a 200ms fade-in. The customer sees Beamix discovering them. This is the **direct-signup magic moment** — a 30-second scan reveal happens *while they're already inside the product.*

By Step 3, the public scan is complete and the Brief is drafted from it. By the time of the magic-moment landing, the deeper scan has produced Evidence Card #1 just like the public-scan path.

**Total time for direct signup is ~5 minutes** (additional 30s for scan reveal during Step 1). Acceptable.

### 4.3 Tier differences (Discover vs Build vs Scale)

The 4 onboarding steps are **identical across all 3 tiers.** Tier-specific differences are minimal and absorbed into copy + Step 2 specifics:

| Element | Discover ($79) | Build ($189) | Scale ($499) |
|---|---|---|---|
| Step 2 phone numbers issued | 1 | 3 | 5 (with note: *"Unlimited on Scale — request more in Settings"*) |
| Step 3 Brief — engines mentioned | 3 engines | up to 7 engines | up to 11 engines (full coverage) |
| Step 3 Brief — competitors mentioned | up to 1 | up to 3 | up to 5 |
| Step 3 Brief — agents mentioned | 3 agents | 8 agents | 18 agents (full crew) |
| Step 4 Truth File fields | identical 6 fields | identical | identical |
| Magic-moment Crew at Work strip | 3 monograms | 8 monograms | 18 monograms |
| Magic-moment Evidence Card #1 | from Schema Doctor or Citation Fixer | from any of 8 | from any of 18 |

The Brief's text is generated from a vertical-specific template; the count of engines/competitors/agents named scales to tier. The customer sees their crew sized to their plan from the very first paragraph. **No upgrade prompts, no "unlock more agents" CTAs during onboarding** — that would break the trust frame. Upgrade prompts live on `/home` after week 1.

### 4.4 Agency / multi-domain (Yossi at Scale)

A Yossi-tier customer (Scale plan, agency operator) onboards their **first** domain in this flow. The flow is identical to the standard Scale flow. The multi-domain switcher and additional-domain onboarding are post-MVP; for v1, Yossi sees the standard flow on first domain and adds subsequent domains via `/settings → Domains` with an abbreviated 2-step flow (Step 1 + Step 4 only, since the Brief is per-domain but Step 2 attribution and Step 3's full ceremony only fire on the primary).

---

## 5. Error and edge states

### 5.1 Customer abandons mid-flow

Every step's state is server-persisted. The customer can close the tab at any point and return.

- **Abandon during Step 1:** they return to Step 1 with the pre-filled fields intact. They lose nothing.
- **Abandon during Step 2 (skipped or partial):** if they hit "Skip for now," `attribution_status = 'skipped'` — they advance to Step 3. If they closed the tab without skipping or continuing, they return to Step 2 fresh; numbers were not yet provisioned.
- **Abandon during Step 3 (Brief partial edit):** the draft Brief (with their chip edits) is saved server-side. They return to Step 3 with their edits intact. The Geist Mono header line reads *"BRIEF · DRAFT v1 · last edited 2 hours ago."* They can continue editing or approve as-is.
- **Abandon during Step 3 mid-signing-ceremony:** if they close the tab during the 2.5s Seal-draw animation, the Brief commit either succeeded (server-side) or failed (transaction rolled back). On return: if commit succeeded, they go directly to Step 4; if failed, they return to Step 3 with the Brief in draft state (no Seal in the Margin). The animation does not replay.
- **Abandon during Step 4:** their partial Truth File fields persist (autosaved on blur). They return to Step 4 and finish. The dashboard route blocks `/home` access until Step 4 is filed.

**Re-entry messaging.** On any return, the top of the active step renders an additional 13px Geist Mono ink-4 line above the h2: *"Picking up where you left off — 4 minutes ago."* (Relative timestamp.) It does not interrupt; it acknowledges.

### 5.2 Truth File seems garbage

Defined in §2.4 validation. Server-side checks:
- Hours all-empty → blocked
- Services average chip length < 3 chars → flagged with inline errors
- Claims < 10 chars each → blocked

We do not validate **content quality** (we cannot tell whether "We are the best" is true or false). We only block obvious garbage. The Trust Architecture's downstream pre-publication validation catches bad content; Truth File submission only catches structurally empty submissions.

### 5.3 Twilio phone provisioning fails (Step 2)

Defined in §2.2. The panel renders the failure state inline; "Issue & Continue" becomes "Continue"; provisioning retries in background; phone numbers surface in `/settings → Phone numbers` when ready. The customer is not blocked.

If Twilio is *down for the entire region* (Israel only, e.g.), the panel surfaces a regional message: *"Phone tracking isn't available in your region right now. We'll email you when it's ready."* The Step 2 dot becomes `ink-3` filled (skipped), and Step 2 is functionally bypassed.

### 5.4 First scan finds nothing meaningful (clean site, low-leverage)

Some customers — early-stage SaaS companies with thin content, or agencies running on unusually clean stacks — will produce a deeper scan with no obvious schema errors, FAQ gaps, or competitor citation gaps. What's Evidence Card #1?

In this case, the scan engine produces a **proactive finding** instead of a fix:

- *"Your site is technically clean. We found 3 query opportunities where you could rank but don't yet — Citation Fixer drafted entry FAQs. Approve in your Inbox."*

Or:

- *"You're already cited 4 times across ChatGPT and Perplexity. Three of those citations are stale (>90 days). Content Refresher is updating them now."*

The Evidence Card #1 must always exist on `/home` first paint; if no fix-flavored finding is available, it's a research-flavored finding. The fall-through hierarchy:

1. Schema/structure fix (if errors detected) — most common
2. FAQ/content gap (if query gaps detected) — next most common
3. Citation refresh (if stale citations detected)
4. Competitor response draft (if competitor moves detected)
5. Proactive opportunity finding (always available — produced by Trend Spotter on clean sites)

We never show an empty Evidence Card or "We didn't find anything" — that would violate the "delivered work" rule.

### 5.5 Brief composition fails

Step 3 depends on the deeper background scan completing during Steps 1-2 (or earlier, if from public scan path). If the deeper scan is not complete by the time the customer reaches Step 3 (rare, ~5% of cases on a slow site):

- The page renders Step 3's chrome (cream paper, header, helper line) but the Brief block shows a 22px Fraunces 300 placeholder with three pulsing dots: *"Drafting your Brief…"* The dots cycle every 600ms.
- A 13px Geist Mono line below: *"This usually takes 30-60 seconds. Stick around — we'll be done before you finish reading this sentence."*
- When the scan completes, the Brief content fades in (400ms) and the placeholder fades out simultaneously. The customer reads + edits + approves normally.

If the deeper scan **fails** entirely (rare, ~0.5%), Step 3 falls back to a **template Brief** generated from Step 1's industry classification only. The customer sees a slightly more generic Brief — fewer specifics about their actual site — but the flow continues. The signature ceremony is identical. We log the failure and the Trust File Auditor agent flags it for engineering follow-up.

### 5.6 Customer rejects the Brief entirely

There is **no "Reject" button** on Step 3. This is intentional — the Brief is a draft we're proposing, not a contract we're forcing. The customer's options are:

1. Edit chips until they agree
2. Edit whole sentences to rewrite
3. Remove sentences they disagree with (down to 2 sentences min)
4. Approve as-is

If they want to "start over," they can click `Edit whole sentence` on every sentence and rewrite each. This is the deliberate design: the Brief is theirs to shape, but they don't get to walk away from the act of authoring one. **Authoring a Brief is the constitutional act of becoming a Beamix customer.** Refusing to author one means they don't have a relationship with the product.

In practice, Briefs are highly editable, and most customers tweak 1-2 chips and approve. If a customer truly cannot be made to author one, they will close the tab — and the customer success system catches that abandonment via instrumentation (event: `onboarding_step_3_abandoned`, ≥10 minutes on page with no approve) and triggers a personal outreach (Layer 3 of the customer success model — the one Customer Lead human).

---

## 6. Mobile experience (375×812, designed)

The 4 steps on mobile preserve the philosophy and the cinematography. The cream-paper Fraunces register on Step 3 is the hardest constraint; we hold it.

**Global mobile chrome.**
- Top-left wordmark + sigil 24px tall, 16px from edges.
- Top-right: 4-dot stepper, slightly smaller (6×6 dots, 6px gap), 16px from edges. Geist Mono label below the dots: `1/4` (compact).
- Content well: 100vw with 24px horizontal padding (so effective content width is 327px on 375px screen).
- Top breath: 64px on mobile (vs 120px on desktop).
- Primary button: 100% width, 56px tall, anchored at the bottom of the content with 32px gap above. On Step 1, 2, 4: button is in normal flow. On Step 3: button sticks to the viewport bottom with `paper-cream` background and 24px top + 32px bottom padding (so the cream Brief above scrolls beneath the sticky button).

**Step 1 (mobile).** Same fields, stacked, full-width. Each field is 56px tall. Total step content: ~480px tall. Fits in viewport with the primary button sticky at the bottom, no scroll needed for the form itself.

**Step 2 (mobile).** Phone numbers panel takes full width. Each number row is on its own line (icon + number stacked above the helper line). UTM tags wrap to 2 lines (2 chips per line). Skip button + primary button stack vertically — Skip on top (ghost), Continue below (primary, full-width). This is the one place mobile reorders for thumb reachability.

**Step 3 (mobile) — the hardest.** The cream-paper background covers the entire viewport. The Brief block is full-width minus 24px gutters. **Fraunces at 22px is preserved** — we do not shrink it on mobile because the editorial register depends on the type. Line-height stays 40px (1.8x). The Brief becomes vertically taller (~720px on mobile vs ~520px on desktop), so the customer scrolls. The Geist Mono header (`BRIEF · DRAFT v1 · ...`) is sticky at the top of the Brief block during scroll, not the page top.

Chip editing on mobile:
- Chip click expands inline. The keyboard appears. The Brief block scrolls so the active chip stays in the upper third of the viewport (auto-scroll, 200ms).
- For dropdowns (engines, vertical_focus) the picker becomes a bottom sheet (full-width, max 60vh tall) instead of inline expansion. Standard iOS/Android bottom-sheet pattern with a drag handle at the top.

Seal-draw on mobile:
- The Seal renders at 24×24 (smaller than desktop's 32×32 — the bottom-right margin of the Brief is tighter on mobile).
- The signature line "— Beamix" renders centered below the Brief at 18px Fraunces italic (slightly smaller than desktop's 22px to preserve the editorial proportion at narrow widths).
- The signing animation duration is identical (800ms Seal + 600ms signature = 1.4s of motion).

**Step 4 (mobile).** Form fields stack vertically. The 7-day hours mini-table becomes a single accordion: tap "Set hours" → expands a per-day list. The 3 brand-voice fields stack instead of side-by-side (each 100% width, 56px tall). All other fields are the same, full-width.

**Magic-moment landing on mobile.** /home renders the same hero hierarchy but vertically stacked. Score+Ring on top (centered, 200px diameter — same size as desktop, because the Score is the centerpiece and we don't shrink it). Editorial Fraunces line below. Evidence Card #1 below that, full-width. Crew at Work strip below — on mobile, the 18 monograms scroll horizontally with overflow-x: scroll; one row, 16×16 monograms with 12px gaps. Pulse choreography unchanged.

**Mobile time benchmark.** All four steps + magic moment in 5 minutes for a careful operator on a 4G connection.

---

## 7. Microcopy in detail (every screen)

### Step 1 — Confirm the basics

| Element | Copy |
|---|---|
| Page h2 | Confirm your business |
| Helper | We pulled this from your scan. Edit anything that's not right. |
| Field 1 label | WEBSITE |
| Field 1 placeholder | https://yourbusiness.com |
| Field 1 error (invalid URL) | That doesn't look like a website. Check it? |
| Field 2 label | BUSINESS NAME |
| Field 2 error (empty) | We need a name to put on things. |
| Field 3 label | INDUSTRY |
| Field 3 helper (low confidence) | (change) |
| Field 3 "Other" placeholder | Type what you do in 2-3 words |
| Field 4 label | PRIMARY LOCATION |
| Field 4 placeholder | Where do most of your customers come from? |
| Primary button | Continue |
| Disabled button hint (on hover) | Fill in the required fields above |

### Step 2 — Lead Attribution

| Element | Copy |
|---|---|
| Page h2 | Set up call tracking |
| Helper | Beamix issues you a tracked phone number that forwards to your real line. When customers call after finding you in ChatGPT or Perplexity, we attribute the call. You see "Beamix got you 23 calls this month" on your home page. |
| Numbers panel label | YOUR NEW NUMBERS |
| Per-number subline | forwards to your existing line |
| Numbers footer (Discover) | We'll add up to 2 more on Build, unlimited on Scale. |
| Numbers footer (Build) | We'll add up to 2 more on Scale. |
| Numbers footer (Scale) | Need more? Tell us in Settings. |
| UTM panel label | UTM TAGS WE'LL USE |
| Provisioning failure | We couldn't issue numbers right now. We'll keep trying in the background. Continue without — we'll surface them in Settings when ready. |
| Regional unsupported | Phone tracking isn't available in your region right now. We'll email you when it's ready. |
| Skip button | Skip for now |
| Primary button (provisioned) | Issue & Continue |
| Primary button (failed) | Continue |
| Back button | ← Back |

### Step 3 — Approve your Brief

| Element | Copy |
|---|---|
| Page h2 | Your Brief |
| Helper | We read your site. Here's what we propose to do. Click any sentence to edit it. Approve when it reads right. |
| Header line (draft) | BRIEF · DRAFT v1 · {date} |
| Header line (signed) | BRIEF · v1 · SIGNED {date} — {time} |
| Brief paragraph | (vertical-specific template — 4-6 sentences from chip composition) |
| Chip-edit prompt | Edit whole sentence |
| Sentence-remove tooltip (on disabled) | Briefs need at least 2 sentences. |
| Add sentence | + Add a sentence |
| Add-sentence picker labels | Geography · Engines · Content focus · Cadence · Exclusion · Custom |
| Primary button (saved) | Approve and start |
| Primary button (unsaved chip) | Save and approve |
| Signing button state | Signing… |
| Post-sign state | Signed. Continuing… |
| Signature line (drawn) | — Beamix |
| Save indicator | Saved |
| Save failure | Couldn't save — we'll keep trying |
| Brief commit failure | Couldn't file the Brief — try again? |
| Brief draft loading state | Drafting your Brief… |
| Brief loading helper | This usually takes 30-60 seconds. Stick around — we'll be done before you finish reading this sentence. |

### Step 4 — Truth File

| Element | Copy |
|---|---|
| Page h2 | What's true about your business |
| Helper | Beamix checks every word it publishes against this file. If something here is wrong, agents will quietly produce wrong things forever. Take a minute. |
| Field 1 label | WHEN ARE YOU OPEN? |
| Field 1 helper | Beamix will quote these in answers about availability. |
| Field 1 closed-checkbox | Closed |
| Field 2 label | WHAT DO YOU OFFER? |
| Field 2 helper | List the 5-15 things you actually sell. One per line. |
| Field 2 placeholder | e.g., emergency drain unclogging |
| Field 2 add row hint | Press Enter to add another |
| Field 3 label | WHERE DO YOU SERVE? |
| Field 3 helper | Cities, regions, or "national" / "global". |
| Field 3 placeholder | e.g., Tel Aviv |
| Field 4 label | WHAT'S TRUE ABOUT YOU THAT MOST COMPETITORS CAN'T SAY? |
| Field 4 helper | Examples: "24/7 emergency response," "Licensed in 4 regions," "20 years in business." Three short claims. |
| Field 4 placeholder 1 | e.g., 24/7 emergency response |
| Field 4 placeholder 2 | e.g., Licensed in 4 regions |
| Field 4 placeholder 3 | e.g., 20 years in business |
| Field 4 error (too short) | This claim is too short — say more. |
| Field 5 label | HOW DO YOU SOUND? |
| Field 5 helper | Three words. Beamix will write to match. |
| Field 5 placeholders | e.g., direct · honest · unhurried |
| Field 6 label | ANYTHING WE SHOULD NEVER SAY? |
| Field 6 helper | Words, claims, comparisons. Optional but powerful. |
| Field 6 placeholder | e.g., never compare us to ZipPipe by name. |
| Pre-fill tooltip | Beamix found this on your site. Edit if it's wrong. |
| Primary button | File this and start |
| Filing button state | Filing… |
| Disabled button hint | Fill in the required fields above |

### Magic-moment landing (rotating Fraunces lines on /home)

| Order | Line |
|---|---|
| 0 (initial, on first paint) | We received your Brief. We're reading your homepage right now. |
| 1 | Schema Doctor is fixing 3 errors on /pricing. |
| 2 | Citation Fixer drafted 11 FAQ entries — they're in your Inbox. |
| 3 | Competitor Watch is reading {top_competitor}'s pricing page. |
| 4 | FAQ Agent is matching how Perplexity asks questions in your vertical. |
| 5 | Long-form Authority Builder is drafting one pillar piece — review on Friday. |
| 6 | Trust File Auditor checked everything against your Truth File. All clear. |
| 7 (settled state, after work cycle completes) | Your crew shipped {N} changes this hour. {needs_you_count} thing needs you. |

### Re-entry banner (any step)

| Trigger | Copy |
|---|---|
| Returning <5 min | Picking up where you left off — {N} minutes ago. |
| Returning <1 day | Welcome back. Your draft is here. |
| Returning >1 day | Your draft from {date}. Edit or start fresh. |

**Voice rules applied throughout:**
- No "Welcome!" or "Welcome back!" greetings. Direct.
- No exclamation marks anywhere.
- No "Awesome!" / "Great!" / "You're all set!" celebration copy.
- Specific verbs: *file, draft, issue, sign, ship, fix, read, approve.* Not *configure, set up, customize, manage.*
- Numbers are concrete: "11 FAQ entries," "3 schema errors," "23 calls." Not "many" or "several."
- Time is concrete: "Monday at 7am," "in 30-60 seconds," "8 sec ago." Not "soon" or "shortly."
- The product speaks as "we" or "Beamix" — never "I" (Beamix is plural — Beamix). The signature line is "— Beamix."

---

## 8. Frontend notes

**Stack alignment.** Next.js 16 App Router. Each step is a route segment under `app/onboarding/[step]/page.tsx`. Layout `app/onboarding/layout.tsx` holds the chrome (wordmark + 4-dot stepper) and the background-color logic (paper vs paper-cream by step).

**State.** Onboarding state is server-persisted in Supabase tables: `onboarding_progress` (one row per user, columns `step_1_completed_at`, `step_2_completed_at` or `step_2_skipped_at`, `step_3_brief_id`, `step_4_truth_file_id`), `briefs` (versioned), `truth_files`, `phone_numbers` (provisioned via Twilio webhook). Server actions write all state. No client-side context for cross-step state — every step reads from the server.

**Brief composition.** A server-side Inngest job composes the Brief from `(scan_data, vertical_kg, tier)`. Triggered on Step 1 submit; runs in background during Steps 1-2; result fetched on Step 3 mount with a 60s timeout. Composition uses Claude Sonnet for the prose generation, with chip slot extraction handled deterministically post-generation (template-fitting). Persisted to `briefs` table as a structured object: `{sentences: [{template_id, slot_values: {...}, free_text: null}]}`.

**Chip rendering.** Each chip is a React component that toggles between display and edit modes. Display mode: a `<span>` with `brand-blue-soft` background and ink text. Edit mode: an inline component (input, multi-select, textarea) sized to the chip type. State held in local React state during edit; committed to server on blur or Done click via server action.

**Seal-draw animation.** SVG path with stroke-dasharray equal to the path's `getTotalLength()`. Animate stroke-dashoffset from full length to 0 via Framer Motion `<motion.path>` (or CSS animation if reduced-motion). Path is generated once per user via `roughjs` server-side at signup (deterministic from `seed = hash(user_id)`) and persisted as raw SVG in `users.seal_svg`. Re-used on the Brief, the Monthly Update PDF header, the OG share card, and the Inbox approve button.

**Signature line pen-stroke.** Pre-extracted SVG outline of the text "— Beamix" rendered in Fraunces italic 300 at 22px (or 18px on mobile). Outline extracted at build time using `opentype.js` from the licensed Fraunces font file; persisted as a static SVG in `public/onboarding/signature-stroke.svg`. The path is animated via stroke-dashoffset over 600ms.

**Fonts.** Inter, InterDisplay, Fraunces, Geist Mono. Self-hosted (woff2) under `public/fonts/`. Preloaded in `<head>` for the onboarding routes specifically. Fraunces is 100kb compressed; preloading is required to avoid FOUT on Step 3's cream-paper render.

**Performance budget.** Each onboarding step's initial JS bundle ≤140kb gzipped (Next.js page bundle + dependencies). The `roughjs` package is lazy-loaded only on Step 3 (~12kb). Framer Motion is shared across the app (already loaded on /home). No additional libraries.

**Accessibility.**
- All chips are `role="button"` with `aria-label` describing what they edit. Expanded chips become `<form>` regions with `role="dialog"` and labeled inputs.
- The Seal-draw and signature-stroke animations are `aria-hidden="true"` on the SVG itself; an `aria-live="polite"` region announces *"Brief signed"* when the ceremony completes.
- Keyboard-only flow: Tab through fields, Enter on primary button, no traps. Focus visible at all times (2px brand-blue outline, 2px offset).
- Reduced-motion media query honored on every animation.
- Color contrast: all text on cream paper (`#F7F2E8`) meets WCAG AA at 22px (Fraunces ink #0A0A0A on cream is 14.5:1 — well above the 4.5:1 required).

**Analytics events to instrument.**
- `onboarding_step_1_viewed`, `_submitted`, `_validation_failed`
- `onboarding_step_2_skipped`, `_completed`, `_provisioning_failed`
- `onboarding_step_3_brief_drafted`, `_chip_edited` (with chip_type), `_sentence_removed`, `_sentence_added`, `_signed`, `_abandoned`
- `onboarding_step_4_field_filled` (per field), `_filed`, `_validation_failed`
- `onboarding_completed` (top-line conversion event)
- `magic_moment_evidence_card_clicked`, `_inbox_first_click_at` (time-to-first-decision)

**Server-side feature flags.** A single flag `onboarding_v1_enabled`. If disabled, customers route to a fallback minimal-form flow (Step 1 only, no Brief, no Seal). For incident response only.

---

## Closing

This is the version of `/onboarding` that ships in 4 minutes, signs the customer in 2.5 seconds of cinematography, and hands them a `/home` where their crew is already at work. It is the version that makes the rest of the product believable. Every detail above is load-bearing. Strip the cream paper and Fraunces and we ship a SaaS confirmation step. Strip the Seal-draw and we ship a button click. Strip the Truth File and we ship an empty Trust Architecture. Keep all three and we ship the front door of a category-defining company.

— *the senior product designer*
