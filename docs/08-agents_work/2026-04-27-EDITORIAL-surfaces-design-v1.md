# Beamix — The Three Editorial Surfaces (Implementation Spec v1)

**Date:** 2026-04-27
**Author:** Editorial Product Designer
**Scope:** `/scan` public storyboard · Monday Digest email · Monthly Update PDF + permalink
**Status:** Implementation-ready. Companions, never replaces, the Master Designer's Section 2 spec.

---

## Why these three surfaces share a register

Beamix has two visual registers. The product (`/home`, `/inbox`, `/scans`, `/competitors`, `/crew`, `/schedules`, `/settings`) lives on bright paper white with Inter and clinical tables — that is the working surface. These three surfaces — `/scan`, the Monday Digest, the Monthly Update — live on cream paper (`#F7F2E8`) with Fraunces accents, hand-drawn sigils, and Margin annotations. That is the *artifact* register.

The artifact register tells a customer *"this is something to keep, forward, hold, photograph."* The product register tells them *"this is something to use."* Confusing the two is what kills most SaaS brands. We will not.

The three editorial surfaces are also the three places the brand is *most exposed to non-customers.* `/scan` is shared on Twitter and LinkedIn before signup. The Monthly Update is forwarded to CEOs, boards, agency clients. The Monday Digest — though private — is screenshotted and posted with the question *"is anyone else getting these from Beamix?"* These three artifacts do more new-business introductions than any ad will.

This spec is implementation-ready. A frontend developer should be able to read Section 1 and ship the storyboard. An email engineer should be able to read Section 2 and ship the digest. A backend engineer should be able to read Section 3 and ship the PDF + permalink renderer. Cross-surface tokens are isolated in Section 4 so the design system can implement them once.

---

# Section 1 — `/scan` public storyboard (implementation)

## 1.0 Surface purpose and constraints

`/scan` is the unauthenticated, viral acquisition surface. A user types a URL, Beamix scans them across 11 AI engines, the score lands, the diagnosis is delivered, and a CTA invites signup. The 10-frame storyboard runs ~15-17 seconds.

**Three things `/scan` must do simultaneously:**
1. **Be honest** — the scan is real, the score is calculated against actual engine responses, the diagnosis is specific. No theatre.
2. **Feel made by hand** — the cream paper, the pencil-stroke draws, the Excalifont accent, the strikethrough-and-rewrite mechanic — these say *"a person made this for you, not a dashboard generated it."*
3. **End with a permalink** — every scan produces a public, shareable URL at `/scan/[scan_id]`. This is the page that gets pasted into Slack and tweeted.

**Hard constraints (locked):**
- Total runtime: 15-17 seconds (Frame 1 → Frame 10 sticky CTA appearance). Cannot exceed 17s.
- Synchronous (not email-gated). User stays on the page through the entire reveal.
- Default-private permalinks for *authenticated* scans; **`/scan` public scans are public-by-default permalinks** (this surface is acquisition; private permalinks belong inside the product).
- All hand-drawn elements use Rough.js (canvas + SVG renderer) with deterministic seeds keyed off `scan_id` so repeated views produce identical drawings.
- Mobile-equivalent at 375px must complete in the same 15-17s; some frames simplify (engine grid wraps, score arc shrinks).

**Tech stack for this surface:**
- Next.js App Router page at `apps/web/app/scan/page.tsx` (input) and `apps/web/app/scan/[scan_id]/page.tsx` (result permalink)
- Rough.js for hand-drawn arcs, rectangles, score gauge, sigil seal
- `perfect-freehand` for the pencil-stroke underline and signature line
- Framer Motion for orchestration (`<motion.path pathLength>`, `staggerChildren`, AnimatePresence)
- Excalifont (handwritten accent — only on user-correctable fields in Frame 3)
- Fraunces 300 (display + diagnosis line) loaded via `next/font/google` with `display: 'block'` to prevent FOUT on the editorial line
- Background `#F7F2E8` cream-paper for the entire surface

## 1.1 Frame-by-frame breakdown

The 10 frames are choreographed against a single timeline. Each frame's `timeline_in` and `timeline_out` is fixed; the entrance animations have specified curves; the in-frame state holds until the next frame's entrance begins. There is overlap — this is not a slideshow.

### Frame 1 — URL input (`0.0s → 1.5s`)

**Visual layout.** Cream-paper full-bleed background. The page has zero chrome — no nav, no header, no footer. Centered on the page, vertically biased toward the upper third (the user is meant to feel they are looking at a piece of stationery, not a web app):

```
                                                               
                                                               
              the URL Beamix will scan                         
              ─────────────────────                            
              acmeplumbing.co.il_                              
                                                               
              press ↵ to begin                                 
                                                               
```

- The "the URL Beamix will scan" eyebrow is `text-xs` (11px Inter 500, caps, tracking 0.10em, color `ink-3`). 240px above the input.
- The pencil-stroke underline (`perfect-freehand`, 1.5px, `ink-2` at 65% opacity) sits below the input. Length 480px. Drawn from the start; not animated in this frame.
- The input itself is `text-h1` (48px InterDisplay 500, tabular, `ss03`, color `ink`). No border, no fill. The cursor is a 2px-wide blinking caret in `brand-blue` (CSS `caret-color: #3370FF`), 800ms on / 600ms off.
- The "press ↵ to begin" hint is `text-sm` (13px Inter 400, color `ink-4`), 32px below the underline. Subtle.

**Animation specs.**
- On page load: input gains focus via `autoFocus`. Cursor begins blinking at `t=0`. No other entrance animation; this is a still frame.
- As the user types, characters appear at the natural typing cadence. No character entrance animation here (we are not Granola; the user is typing their own URL, not watching it).
- On Enter (or paste-and-Enter, common on mobile), the page advances to Frame 2 immediately. No debounce, no validation pause.

**Microcopy.**
- Eyebrow: `the URL Beamix will scan`
- Hint: `press ↵ to begin` (lowercase, deliberate; Apple Human Interface posture)
- Placeholder (if input empty after 2s of focus, render in `ink-4`): `your business or competitor's URL`

**Error microcopy (covered in 1.4 below).**

**Why this opens the surface this way.** The single-input page is borrowed from Fast.com and Notion's empty-state philosophy: *the absence of chrome is the design.* The user is being told without words: this is for them; nothing else matters on this page until they decide what to scan.

### Frame 2 — URL goes (`1.5s → 2.8s`)

**Visual layout.** The URL the user typed remains center-stage. The eyebrow and hint fade out (linear opacity, 200ms). A hand-drawn rectangle sketches itself around the URL.

**Animation specs.**
- The Rough.js rectangle is rendered with Beamix Blue (`#3370FF`), 2px stroke equivalent, roughness 1.4, bowing 1.0, seed = a hash of `scan_id` so the wobble is deterministic.
- The rectangle draws side-by-side: top edge first (`pathLength` 0→1, 280ms ease-out), right edge (280ms), bottom edge (280ms), left edge closes the box (280ms). Total 1.12s of drawing. The slight overlap between sides — each side starts 80ms before the previous ends — keeps the energy continuous.
- Once the box closes, the URL inside it pulses once: `transform: scale(1.0) → scale(1.02) → scale(1.0)` over 400ms with `cubic-bezier(0.34, 1.56, 0.64, 1)`. This is the only "look at me" beat in the storyboard; it earns its keep because we are saying "Beamix has captured what you typed."
- The page background does not change.

**Microcopy.** None in this frame. The image is the message: *we have your URL.*

**Why this works.** The rectangle is the Beamix sigil grammar's first appearance — a hand-drawn line on cream paper. It re-appears in Frame 9 around the diagnosis and in the share card OG image. By the time the user sees the seal in Frame 10, they have already seen three Rough.js elements; the visual grammar is established.

### Frame 3 — Auto-detected business name + industry + language (`2.8s → 5.3s`)

**Visual layout.** Below the framed URL, three lines sketch in. Each is preceded by a small hand-drawn caret-arrow (Rough.js) pointing right. Each is annotated with what Beamix inferred. The user can correct any of them.

```
   ┌────────────────────────────────────┐
   │  acmeplumbing.co.il                │
   └────────────────────────────────────┘
       ↘
        Acme Plumbing                     ← business
        plumbing services                 ← industry
        Hebrew + English                  ← language
                                         
        looks right? press ↵ to scan      
```

**Layout specs.**
- The three lines are stacked, 16px between, indented 32px from the rectangle's left edge. The arrow→indent communicates derivation.
- Each line: business name in `text-h3` (22px InterDisplay 500), industry and language in `text-base` (15px Inter 400 `ink-2`). The labels on the right (`← business`, `← industry`, `← language`) are in **Excalifont 12px**, color `ink-3`. **This is the only place in the entire Beamix system where Excalifont appears.** Reserved for "this was figured out by hand" moments. The hand-written quality says: *Beamix made an educated guess; you can correct it.*
- Below the three lines, with 32px gap, the prompt: `looks right? press ↵ to scan` (13px Inter 400 `ink-3`).

**Animation specs.**
- The arrow draws (Rough.js, `pathLength` 0→1, 240ms each).
- Each value types in at 32 chars/sec with a Framer Motion `staggerChildren: 0.18` parent. The label on the right (`← business` etc.) fades in 100ms after the value finishes typing.
- Total entrance: ~1.9s for all three lines. Holds until the user acts or 600ms after the third line lands, whichever is later.
- If the user does not correct anything and presses ↵, advance to Frame 4. If the user clicks a value, the **strikethrough-and-rewrite mechanic** activates (1.2 below). If the user does nothing for 6s after the lines land, a tiny shimmer animates through the prompt line ("press ↵ to scan") to nudge.

**Microcopy.**
- Auto-detected values are populated by Beamix's lightweight metadata fetch (HTML `<title>`, OpenGraph tags, lang attribute, schema.org Business markup if present, fallback to LLM inference on the homepage HTML).
- Industry copy is always lowercase, always 2-3 words ("plumbing services", "boutique B2B SaaS", "dental practice"). If Beamix is uncertain (no signal), the value is `(tell us your industry)` rendered in `ink-4` and clickable.
- Language copy is the rendered language(s) detected, comma-separated when multiple. Capitalized.

### 1.2 The strikethrough-and-rewrite mechanic (Frame 3's distinctive move)

This is the single most novel interaction on `/scan` and the share-worthy moment in the storyboard. When the user clicks any of the three auto-detected values, the value gets crossed out and the cursor enters a fresh writing position to the right.

**Behavior specification.**
1. Click any inferred value (e.g., `Acme Plumbing`).
2. The value gets a hand-drawn strikethrough (Rough.js, 1px, ink-2 at 80% opacity, drawn left-to-right with `pathLength` 0→1, 240ms ease-out). The line is *slightly* wavy; the seed is fresh per click (not deterministic — this is a personal correction).
3. As the strikethrough draws, the original text dims to `ink-3` over 200ms.
4. Immediately after the strikethrough completes, an inline input appears 12px to the right of the struck-through text. The input is bare — no border, no fill — using the same typography (22px InterDisplay 500). The cursor blinks in `brand-blue`. The user types the correction.
5. On blur or Enter, the input collapses; the new value appears in place of the input, in `ink` (full color), to the right of the struck-through original. The struck-through original *remains visible* — the page now reads `~~Acme Plumbing~~ Acme Plumbing & Sons`.
6. A small undo affordance appears below the corrected line (10px Inter 400 `ink-4`): `undo` (clickable). Clicking undo deletes the correction and removes the strikethrough; the original returns to full color.

**Why this is the viral moment.** Every other scanner forces the user to either accept what was inferred or open a separate "edit your details" form. The strikethrough-and-rewrite says: *Beamix's inference is visible; the user's correction is also visible; the artifact remembers both.* The user feels respected — their correction was an *act of authorship*, not a form submission. When they share the resulting permalink, the corrections are part of the artifact: `~~Acme Plumbing~~ Acme Plumbing & Sons` is what shows up on the share card. That is the strongest possible signal that *this is a real, edited record, not a marketing graphic.*

**Implementation note.** The strikethrough is a Rough.js `<line>` on a per-correction SVG layer absolutely positioned over the text node. The input is a `<input type="text">` styled to be fully transparent except for caret. The collapse animation is a CSS transition on input width (320ms ease-out width 0 → measured-width).

### Frame 4 — Engine logos + scan animation (`5.3s → 9.5s`)

**Visual layout.** The framed URL + corrections cluster slides up to the top quarter of the viewport (translate-y -120px, 600ms ease-out). The vacated area below fills with a horizontal arrangement of 11 engine bubbles.

```
   ┌────────────────────────────────────┐
   │  acmeplumbing.co.il                │
   └────────────────────────────────────┘
   ↘ Acme Plumbing & Sons · plumbing services · Hebrew + English

   asking 11 AI engines about you …

      ⊕      ⊕      ⊕      ⊕      ⊕      
   ChatGPT  Perplexity  Gemini  Claude  AO  

      ⊕      ⊕      ⊕      ⊕      ⊕      ⊕
   Grok  You.com  Copilot  Meta  Mistral  DeepSeek
```

**Engine bubble specs.**
- Each bubble: 96px diameter, **clean SVG circle (NOT Rough.js)** — Beamix's hand-drawn discipline is reserved for Beamix's own actors (agents, sigils, marks). Engines are utility — third-party services we monitor, not our crew. Stroke `ink-2` at 50% opacity at rest. (Engine treatment locked 2026-04-28 per Kare's call: "We drew our crew; we did not draw OpenAI.")
- Inside the bubble: the engine's 2-letter abbreviation in 32px InterDisplay 500. Engine logos are NOT used (licensing risk + visual inconsistency). Two-letter abbreviations: `CG` (ChatGPT), `PX` (Perplexity), `GM` (Gemini), `CL` (Claude), `AO` (AI Overviews — renamed 2026-04-28 from `AI`, collision with category-name "AI"), `GR` (Grok), `YC` (You.com), `CP` (Bing Copilot — was `MS`, locked 2026-04-28 per Design System), `MA` (Meta), `MI` (Mistral), `DS` (DeepSeek).
- Below each bubble: engine name in `text-xs` caps tracking (11px Inter 500, 0.10em, `ink-3`).
- Bubbles arrange in a deliberately asymmetric two-row grid (5 + 6 layout). The asymmetry is the design — a perfect 11-on-a-circle would feel like a stock infographic. The asymmetric grid feels human.

**Animation specs.**
- Bubbles enter staggered: 11 bubbles × 80ms stagger = 880ms total entrance. Each bubble: opacity 0→1, scale 0.92→1.0, with `cubic-bezier(0.34, 1.56, 0.64, 1)` for a tiny overshoot.
- Once all 11 are present (~6.2s), each bubble starts pulsing — Rough.js stroke opacity 50% → 100% → 50% over 1200ms `ease-in-out sine`, infinite, but each bubble's pulse is offset by 0-300ms randomly. The collective effect is a soft *shimmer* across the bubble array.
- Sample queries appear above the bubble cluster, one at a time, typing in for 600ms then erasing for 200ms, then the next types in. Examples: `"emergency plumber tel aviv?"`, `"24-hour drain repair?"`, `"licensed plumber rishon lezion?"`. These are pulled from the user's industry (Beamix has a per-vertical sample-query bank). 13px Inter 400 italic `ink-3`. The italics here are a one-time exception to the no-Inter-italics rule because we are quoting end-user queries — *they are real questions someone might type.*
- As each engine completes its query (real backend call, parallelized via `Promise.all` against the 11 engine APIs), its bubble fills with a small Rough.js dot in the center: filled `brand-blue` if a mention was found, hollow `ink-3` if not. The fill animates in 240ms scale 0→1 with overshoot.
- The "asking 11 AI engines about you …" line above the bubbles is `text-serif-lg` (22px Fraunces 300). It fades in with the bubbles. When all 11 complete, this line cross-fades (200ms) to: `Beamix asked 11 engines. 7 mentioned you, 4 didn't.` The number is dynamic; the formatting is consistent.

**Why Frame 4 is 4.2 seconds.** It is the longest frame because it is the *evidence* frame. The user has to feel the work happening. The pulsing bubbles + scrolling sample queries + per-engine result fills are three simultaneous motion threads, each carrying meaning. Total motion budget here is ~3.6 seconds of overlapping animation.

### Frame 5 — Going back to scan page (consolidation) (`9.5s → 10.5s`)

**Visual layout.** The 11 bubbles consolidate. They animate inward toward a central point (the location where the score arc will appear), shrinking and fading to ~30% opacity.

**Animation specs.**
- Each bubble: simultaneously translate toward the central point (calculated as the centroid of the 11 bubble positions, then 120px below that), scale 1.0 → 0.4, opacity 1.0 → 0.3, over 800ms with `cubic-bezier(0.4, 0, 0.2, 1)`.
- The "Beamix asked 11 engines…" line fades to 60% opacity and shrinks to `text-base` size, sliding to a position above the consolidation point.
- The result is a small cluster of 11 dim bubbles arranged in a tight ring at the consolidation point, like a constellation around an empty center. This empty center is where the score will land.

**Microcopy.** The line above the cluster reads: `now Beamix scores you …` in `text-serif-lg` (22px Fraunces 300, `ink-2`). It fades in over 300ms.

**Why this transitional frame exists.** Without it, Frame 4 cuts to Frame 6 with a hard stylistic shift (from many bubbles to one big arc). The consolidation gives the eye a *trajectory* — the 11 engines are the *input* to the score; the score is what they collectively produce. The animation is the calculation.

### Frame 6 — Score arc outline (`10.5s → 11.5s`)

**Visual layout.** Centered in the empty space at the consolidation point, a hand-drawn semicircular arc sketches itself. This is the score gauge's *outline only.* No number yet.

**Animation specs.**
- The arc is a Rough.js path: semicircle, 200px outer diameter, opening downward (180° span from -90° to +90° measured from horizontal). Stroke `ink-2`, 2px. Rough.js roughness 0.8 (less wobbly than Frame 4 bubbles — this is the climactic mark, more composed).
- The arc draws in over 1000ms with `cubic-bezier(0.4, 0, 0.2, 1)` using `pathLength` 0→1.
- Below the arc's bottom-center (at the diameter), the future number's typography is hinted with a 4px-tall `ink-4` baseline tick mark — invisible to most viewers but anchoring the eye for what comes next.

**Microcopy.** None. The arc is the entire visual.

### Frame 7 — Score count-up (the climactic moment) (`11.5s → 13.0s`)

**Visual layout.** Inside the arc, the user's score number fades in at 0 and counts up to its actual value. As it counts, the arc *fills in* below — the inner area of the arc gradually colors with the score-color tier.

This is the moment the user has been waiting 11.5 seconds for. It must feel *earned*.

**Animation specs.**
- The number itself: `text-display` (96px InterDisplay 500, tabular, `ss03`, color `ink`). Centered horizontally, baseline at the diameter line of the arc.
- The count-up animates from 0 to the final score over 1200ms with `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). The tabular numerals (`tnum`) are essential here — the digit shifts must not jitter.
- The arc fill: a second Rough.js path, drawn just inside the outline, sweeping from -90° toward the score's terminal angle (mapped: 0=−90°, 100=+90°). Fill color is determined by score tier:
  - 85+: `score-excellent` (#06B6D4) at 14% opacity
  - 70-84: `score-good` (#10B981) at 14% opacity
  - 50-69: `score-fair` (#F59E0B) at 14% opacity
  - <50: `score-critical` (#EF4444) at 14% opacity
  The opacity is intentionally low — this is editorial, not infographic. The fill *suggests* the tier; the number *is* the score.
- Number and arc-fill animate **synchronously** — same 1200ms duration, same easing. The eye reads the number rising while the color rises behind it.
- After the count completes, a 400ms hold, then `+5 vs industry median` (or the relevant comparison) types in below the number in `text-base` (15px Inter 400 `ink-3`). The `+5` portion is colored `score-good`; `vs industry median` stays `ink-3`.

**Microcopy.** Below the number, after count-up: `[delta] vs industry median` where delta is signed. Industry median is computed per-vertical from Beamix's aggregated scan corpus. If the data is sparse, the line falls back to `your AI search visibility score` (no delta, descriptive only).

**Why this is the climax.** Speedtest taught us 15 years ago that a number ticking up against a calculated maximum is one of the most satisfying interactions on the web. The count-up is not theatre — the score is calculated, the count animates to its real value, the color tier reflects the actual tier. We are not *performing* the calculation; we are *animating its conclusion.*

### Frame 8 — Engine-by-engine grid reveal (`13.0s → 14.5s`)

**Visual layout.** The score arc and number persist. Below them, with 72px gap, the engine grid materializes — a clean 4-column data grid with no hand-drawn elements. This is the data layer; after 13 seconds of cream paper and Rough.js, the user gets *crisp typography* and the relief is part of the design.

```
   ┌──────┬──────┬──────┬──────┐
   │ ChatGPT │ 88 │ +12 │ ▲▲▲▲▲ │
   ├──────┼──────┼──────┼──────┤
   │ Perplexity │ 71 │ −3 │ ▲▲▲   │
   ...
```

**Grid specs.**
- 11 rows × 4 columns. Row height 44px. Total grid width 640px.
- Columns: Engine name (12px Inter 500 caps tracking 0.06em `ink-2`) · Score (18px InterDisplay tabular `ss03` `ink`) · Delta vs last scan or industry (13px Inter 500 `tnum`, semantic color) · Citation strength bar (5 small Rough.js triangles in `brand-blue`, filled or hollow per citation count).
- Background: `paper` white (#FFFFFF), not cream. The grid is a small product-register *island* inside the cream-paper /scan surface — a deliberate register-shift signaling "here's the data."
- Border: 1px `border` (rgba(10,10,10,0.06)) on the outer rectangle, dividers between rows.
- Inside the grid, no hand-drawn elements except the small triangle bars.

**Animation specs.**
- The grid container fades in (300ms opacity 0→1, no transform).
- Rows reveal in cascade: 11 rows × 60ms stagger = 660ms. Each row: opacity 0→1 + translate-y 4px → 0, 200ms ease-out.
- The triangle bars draw in *after* the row text appears — 100ms delay after row reveal, then triangles fill 60ms each, left to right.

**Microcopy.** None outside the grid cells. The grid speaks for itself.

**Why the register-shift here works.** The /scan storyboard has been hand-drawn for 13 seconds. Now we are showing data. If we kept the hand-drawn register on the data grid, it would feel *unserious* — like a doodle pretending to be a report. The shift to clean tabular data signals: *the editorial wrapper is the package; the data inside is exact.* This is the same move Stripe makes when its marketing site is editorial but the dashboard is clinical. The customer absorbs both registers and trusts both.

### Frame 9 — Diagnosis line in Fraunces italic (`14.5s → 15.8s`)

**Visual layout.** Below the engine grid, with 48px gap, a single Fraunces-italic line of editorial diagnosis. Centered on a 720px max-width column. Behind the line, a hand-drawn rectangle sketches in to frame it (echoing Frame 2's rectangle around the URL — the visual rhyme says: *we framed your input, now we frame our verdict.*).

**Layout specs.**
- The line: `text-serif-lg` (28px Fraunces 300, opsz 144, soft 100, wonk 0, italic), `ink`, line-height 40px. Max 2 lines.
- The framing rectangle: Rough.js, 2px stroke `ink-3` at 70% opacity, padding 32px around the text. Drawn over 800ms (`pathLength` 0→1) once the text is fully in.
- Below the rectangle, a tiny Rough.js "—" dash (6px wide, `ink-3`) and the word `Beamix` in 13px Geist Mono, both as a center-aligned signature. This is the **first appearance of the signed "— Beamix" attribution** in the user's journey; from this moment on, every Beamix artifact closes with this signature.

**Animation specs.**
- The diagnosis line types in at 36 chars/sec (faster than typical type-on; this is the editorial verdict, it should land confidently). Approximately 800-1000ms of typing.
- After the line completes, a 300ms pause.
- Then the framing rectangle draws (800ms, sequential sides as in Frame 2 but tighter — 200ms per side).
- Then the signature "— Beamix" fades in over 300ms.

**Microcopy formula.** The diagnosis is generated by an LLM call against the scan results, but the *shape* is fixed:

> `[Score]/100. Stronger on [best engine]. Weakest on [worst engine]. [Top fix in plain English].`

Examples:

> *"73 out of 100. Stronger on ChatGPT than Perplexity. Top fix is FAQ schema."*

> *"61 out of 100. You're cited on Gemini, missing on Claude. Top fix is the about-us page."*

> *"88 out of 100. Cited on every major engine. Watch Profound — they shipped 12 comparison pages this month."*

The diagnosis must always include three components: the score, the engine asymmetry (one strength, one weakness), and the next action. Voice rules: direct, specific, no apology, no "we recommend" softening — just the verdict.

### Frame 10 — Sticky bottom CTA (`15.8s → 17.0s`)

**Visual layout.** A sticky bar slides up from the bottom of the viewport. Cream paper background (slightly elevated tone — `paper-elev` cream, ~3% darker), full bleed, 96px tall. Inside, a single editorial headline + a primary CTA button + a secondary text link.

```
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │   Save these results — try Beamix free for 14 days          │
   │                                          [ Start free ] · email me a copy
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
```

**Layout specs.**
- Headline: `text-serif-lg` (22px Fraunces 300 italic), `ink`. 22px is one size smaller than the Frame 9 diagnosis — the diagnosis is the verdict, the CTA is the next step, type hierarchy reflects that.
- Primary button: brand-blue background, white text, 14px Inter 500, 8px radius (NOT pill on this surface — pills belong to the marketing Framer site; the product UI uses `rounded-lg`). Padding 12×24. Label: `Start free`.
- Secondary text link: 14px Inter 400, `ink-3`, underline on hover. Label: `email me a copy`.

**Animation specs.**
- The bar enters with a translate-y +96px → 0 over 320ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (the same back-out as the Decision Card on /home — visual rhyme between surfaces).
- After 4 seconds of idle, the arrow glyph inside the primary button bounces once: translate-x 0 → 4 → 0 over 480ms. Repeats every 8 seconds. Subtle, not nagging.

**Microcopy variants.** The headline rotates per scan score:
- Score 85+: `Beamix can't make 88 better — but we can make sure it stays there.` (CTA: `Start monitoring`)
- Score 70-84: `Save these results — try Beamix free for 14 days.` (CTA: `Start free`)
- Score 50-69: `Beamix can fix most of this. Want help?` (CTA: `Start fixing`)
- Score <50: `This is fixable. Beamix does the work.` (CTA: `Start fixing`)

**Secondary CTA copy:** Always `email me a copy` — sends the public permalink to an email the user provides. This captures the lead without forcing signup; ~30% of these emails convert to signup within 14 days.

## 1.3 The post-scan permanent permalink page (`/scan/[scan_id]`)

Every scan produces a permalink at `/scan/[scan_id]`. This URL is the page the user shares. It is **the same page they just experienced**, in its post-Frame-10 final state, but with three differences:

1. **No animation.** The permalink page renders the final state of all 10 frames simultaneously. No count-up, no draw-in, no engine bubble pulse. The score is on screen at full value the moment the page loads. (Reduced-motion compositions become the default.)
2. **`Re-run this scan` micro-link.** A small text link below the engine grid, 13px Inter 400 `ink-3`: `Re-run this scan` (rescans live, costs nothing, animates the new score on top of the old one with a delta callout).
3. **An OG-image is generated server-side** the moment the scan completes (1.6 below). The permalink's `<meta property="og:image">` points to it.

**Layout of the permalink page (top to bottom):**

1. **Eyebrow:** small caps `BEAMIX SCAN · [date]`, 11px Inter caps, `ink-3`, 96px from top.
2. **The framed URL** (from Frame 2), with corrections (from Frame 3) if any. The user's original input plus their edits, preserved as artifact.
3. **The engine grid** (Frame 8), unchanged.
4. **The score arc + number** (Frames 6+7), centered, scaled slightly larger (240px arc, 120px number).
5. **The diagnosis** (Frame 9), framed in Rough.js, signed `— Beamix` in Geist Mono.
6. **CTA bar** (Frame 10), sticky at the bottom only on the user's *own* scan (when shared with others, the CTA is non-sticky and appears in normal flow at the bottom of the page).
7. **Footer microcopy:** `Generated [date] by Beamix. [permalink URL]. Run your own scan →` — this is the only footer; Geist Mono 11px `ink-3`.

**Why every scan needs a permalink:** the share-card distribution mechanic. Every public scan that gets shared is a Beamix brand impression. Worldbuilder calls this "/scan-as-content." The permalink IS the content.

## 1.4 Mobile breakpoint (375px)

The same 10-frame storyboard runs on mobile, with these adaptations:

- **Frame 1-3:** identical, but the input column is 320px max-width and the eyebrow drops to 32px above the input (vs 240px on desktop — mobile compresses the breath).
- **Frame 4:** the engine bubbles wrap to a 3-column grid (3+3+3+2 layout for 11 bubbles). Bubble diameter shrinks to 64px. Sample queries scroll above as before.
- **Frame 5:** consolidation works the same; the centroid is closer (smaller distances to travel).
- **Frame 6+7:** the score arc shrinks from 200px to 160px outer diameter. Score number from 96px to 80px. Still tabular `ss03`, still the single climactic moment.
- **Frame 8:** the engine grid stacks. Each row becomes a card: engine name + score on top line, delta + citation bar on bottom line. Card padding 16px, card height 64px. Total grid 11 cards × 64px = 704px tall — the user scrolls.
- **Frame 9:** diagnosis line max-width 320px, Fraunces drops to 22px (text-h3 in serif equivalent). The framing rectangle stays.
- **Frame 10:** sticky bar full-width, stacked layout — headline above, CTA + secondary below, 16px gap.

**Total runtime on mobile:** still 15-17 seconds. Some entrance motion is faster (60fps on mobile is harder; we shave 100-200ms off the longest stages).

## 1.5 Error states

`/scan` will fail in predictable ways. Each failure has a designed state on cream paper, with the same editorial discipline.

**Error 1 — URL unreachable** (4xx/5xx response on the metadata fetch).
- Trigger: the URL the user typed doesn't resolve, returns 404, or actively blocks bots.
- Visual: replace Frame 3 with a single Fraunces-italic line: `Couldn't reach acmeplumbing.co.il. Did you mean acme-plumbing.co.il?` The mistyped URL is offered as a correction with a single underline, click-to-accept. If no correction can be inferred, fall back to: `Beamix couldn't reach this URL. Try another?`
- The framed URL rectangle from Frame 2 is *redrawn in `score-critical` red at 30% opacity* to signal the failure visually.

**Error 2 — Insufficient inferred metadata** (Beamix can't extract business name or industry).
- Trigger: the page loads but has no `<title>`, no OpenGraph, no schema, and the LLM inference returns low-confidence.
- Visual: Frame 3 renders with the prompts visible but values empty: `(tell us your business name)`, `(tell us your industry)`, `(tell us your language)`. Each is `ink-4` and clickable to enter text inline using the strikethrough-and-rewrite mechanic (skipping the strikethrough, since there's nothing to strike through; just goes straight to the inline input).
- Microcopy at top: `Beamix needs a few details from you before scanning.` (Fraunces, 22px italic, `ink-2`.)

**Error 3 — Engine timeout (one or more of the 11)**.
- Trigger: an engine API takes >12s to respond.
- Visual: that engine's bubble in Frame 4 fades to 30% opacity, and a small Rough.js `?` (Excalifont) appears inside instead of the result dot. The score in Frame 7 is calculated against the engines that did respond, with a footnote in the Frame 8 grid: `1 engine timed out — this score is from 10/11 engines.` The footnote is 11px Inter `ink-3`.

**Error 4 — Rate limit** (`/scan` is hit too many times from the same IP).
- Trigger: Beamix rate limits at 10 free scans/IP/day.
- Visual: a single Fraunces line replaces the entire input page: `You've used your free scans for today. They reset in [N] hours. If you want to scan more often, [Beamix Discover is $79/mo →]`. Quiet, no apology, no error styling.

**Error 5 — Network failure**.
- Trigger: client loses connectivity mid-scan.
- Visual: the in-progress engine bubbles freeze; a small line appears below the cluster: `Lost connection. We'll resume when you're back online.` 13px Inter `ink-3`. On reconnection, scan resumes from the last completed engine.

All error states preserve the cream-paper register and the typographic discipline. *Errors are also editorial.*

## 1.6 Open Graph share card (the OG image at `/scan/[scan_id]`)

Generated server-side via Vercel OG (`next/og`) the moment the scan completes. The OG image is the most beautiful share card any GEO product has ever shipped.

**Spec:**
- Dimensions: 1200×630 (Twitter / LinkedIn / Slack standard).
- Background: `paper-cream` (`#F7F2E8`) full bleed.
- Top-left: small Beamix wordmark + cross/star mark (32px tall), `ink`.
- Center-left (vertical center): the user's domain in 36px Fraunces 300, color `ink`. Two lines max.
- Center-right: the Activity Ring drawn around the score number. 280px arc, 96px number. Same rendering as the live page.
- Below the score: the 1-line diagnosis in 22px Fraunces italic 300, max 1 line, ellipsis if too long.
- Bottom-right: the Beamix wax-seal (Rough.js, 32×32), then `— Beamix` in 16px Geist Mono.
- Bottom-left: tiny `app.beamix.tech/scan/[scan_id]` URL in 12px Geist Mono `ink-3`.

The whole image is *one composition*, not a templated card with overlays. Every element is positioned for the specific score and domain. Beamix's OG image is the cream-paper register's most concentrated form: it is what the brand looks like in 1.6 megapixels.

## 1.7 Microcopy register summary for `/scan`

| Beat | Copy |
|---|---|
| Frame 1 eyebrow | `the URL Beamix will scan` |
| Frame 1 hint | `press ↵ to begin` |
| Frame 3 prompt | `looks right? press ↵ to scan` |
| Frame 4 opener | `asking 11 AI engines about you …` |
| Frame 4 closer | `Beamix asked 11 engines. [N] mentioned you, [M] didn't.` |
| Frame 5 transition | `now Beamix scores you …` |
| Frame 7 below score | `[+/-N] vs industry median` |
| Frame 9 diagnosis | `[score]/100. Stronger on [X]. Weakest on [Y]. Top fix is [Z].` |
| Frame 9 signature | `— Beamix` (Geist Mono) |
| Frame 10 (mid score) | `Save these results — try Beamix free for 14 days.` |
| Permalink eyebrow | `BEAMIX SCAN · [date]` |
| Permalink footer | `Generated [date] by Beamix. Run your own scan →` |

Microcopy rules for `/scan`:
- Never use exclamation points.
- Never start a sentence with a capitalized "Welcome" or "Hello".
- Numbers are always digits (`73 out of 100`, never `seventy-three`).
- Engine names are spelled in their canonical form (`ChatGPT`, `Perplexity`, `AI Overviews`).
- The signature line is always `— Beamix` (em-dash + space + capital B). Never `your AI crew`. Never `Schema Doctor`. Never `we`.

---

# Section 2 — Monday Digest email

## 2.0 Format decision: **HTML with cream-paper header strip, plain-text-equivalent body, and a permalink**

The Worldbuilder argued for plain-text-default. The Master Designer argued for cream-paper-header HTML. After weighing both, the call is **hybrid HTML**: a 32px-tall cream-paper header strip with the Beamix wordmark + sigil, then a body rendered in clean Inter that *reads like plain text* (no marketing graphics, no embedded screenshots, no buttons-in-tables, no gradient backgrounds). The body uses a single accent color (brand-blue) for permalinks. The signature is Fraunces italic. Every digest also has a public permalink at `app.beamix.tech/digest/[digest_id]` for the user.

**Justification.**
- Plain-text-default is right *philosophically* (operator-grade signal, no marketing-template feel) but wrong in *2026 deliverability*: many email providers strip plain-text from the rich-rendering pipeline, hurt the engagement metrics that drive inbox placement, and make it harder for the user to recognize the email as Beamix at a glance. The 32px cream strip + sigil is the recognition signal that takes 80ms of eye time. Without it, the email looks like the seventh of seventy emails Sarah received that morning.
- However: the *body* must read as plain-text-equivalent. No background-color cells. No embedded imagery beyond the header. No buttons that aren't links. The visual restraint inside the body is the operator-grade discipline; the cream header is the brand recognition.
- A permalink lives at `app.beamix.tech/digest/[digest_id]` for any user who prefers the web version, who wants to forward the rich rendering, or who wants to read on a device that strips HTML.

**This decision satisfies both arguments.** The brand is immediately recognizable; the body respects the operator's attention.

## 2.1 Subject line formula

Every subject follows one of three shapes, chosen by digest content:

1. **`Beamix · this week, [N] [unit] [shipped/found/needs you]`**
   - `Beamix · this week, 6 changes shipped`
   - `Beamix · this week, 3 things need you`
   - `Beamix · this week, your first attributed call`

2. **`Beamix · [date span]: [headline]`** (used for milestone weeks)
   - `Beamix · Apr 21–27: your first attributed call came in`
   - `Beamix · Apr 21–27: score crossed 80`

3. **`Beamix · quiet week`** (used when nothing shipped — once every ~10 weeks; the honesty earns trust)

Rules:
- The em-dash separator (` · `) is non-negotiable. It's the visual signature of Beamix subject lines across all email types.
- Lowercase after the dash. Always.
- Numbers as digits, even small ones (`6`, not `six`).
- Maximum 56 characters total. Most clients truncate at 60.
- Never includes the customer's first name or business name. The email recipient *is* Sarah; we don't need to remind her.

## 2.2 Email structure (HTML version)

The digest is a single-column 600px-wide email. Apple Mail / Gmail / Outlook all render this width consistently.

```
┌──────────────────────────────────────────────────────────┐
│ [32px cream strip — paper-cream #F7F2E8]                 │
│  ◊ Beamix                              Apr 21–27         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│  Monday, April 27.                                       │
│                                                          │
│  This week Beamix shipped 6 changes, found 3 new         │
│  citations on Perplexity, and watched 2 competitor       │
│  moves. Score is up 4 to 78. One thing needs you.        │
│                                                          │
│  ─────                                                   │
│                                                          │
│  This month: 23 calls and 8 form submissions came in     │
│  through Beamix-attributed channels — up 1.4× vs March.  │
│                                                          │
│  ─────                                                   │
│                                                          │
│  What we did                                             │
│                                                          │
│  Mon · Added 11 FAQ entries to /services/emergency.      │
│        → app.beamix.tech/scans/abc123                    │
│                                                          │
│  Tue · Fixed structured-data errors on /pricing.         │
│        → app.beamix.tech/scans/abc124                    │
│                                                          │
│  Thu · Drafted competitor response to Profound's new     │
│        comparison page. Awaiting your approval.          │
│        → app.beamix.tech/inbox/abc125                    │
│                                                          │
│  ─────                                                   │
│                                                          │
│  Score                                                   │
│                                                          │
│  78 (+4)   ▁▁▂▂▃▄▄▅▅▆▆▇                                  │
│            12-week trend                                 │
│                                                          │
│  ─────                                                   │
│                                                          │
│  One thing needs you                                     │
│                                                          │
│  → Approve a homepage hero rewrite. ~30 seconds.         │
│    app.beamix.tech/inbox/abc125                          │
│                                                          │
│  ─────                                                   │
│                                                          │
│  Read this on the web → app.beamix.tech/digest/wk-17     │
│                                                          │
│                                                          │
│  — Beamix                                                │
│                                                          │
│ ──────────────────────────────────────────────────────── │
│  pause digests · unsubscribe · report content            │
│  Beamix · beamix.tech                                    │
└──────────────────────────────────────────────────────────┘
```

**Element specs.**

**The cream header strip.** 32px tall. `paper-cream` (#F7F2E8) background. Inside, on the left: a 16×16 Rough.js sigil mark (the Beamix cross/star, drawn) followed by `Beamix` in 14px InterDisplay 500. On the right: the date span in 12px Geist Mono `ink-3`. 16px horizontal padding. The strip is the only chrome on the email; the body below is pure white.

**Body background.** `#FFFFFF`. Body padding: 32px horizontal, 40px vertical.

**Greeting line.** `Monday, April 27.` Always this exact format: weekday, comma, month, day, period. 18px Inter 400, `ink`. **No "Hi Sarah!", no "Hey there", no "Hope your weekend was good".** The date is the entire greeting. This is Beamix-direct.

**Status sentence.** A single paragraph below the greeting, 16px Inter 400 `ink-2`, line-height 26px. 2-3 sentences max. Summarizes what happened this week. Always specific (numbers, named outcomes).

**The horizontal rules (`─────`).** These are not actual `<hr>` tags. They are 32px-wide ASCII dashes (`─` U+2500) rendered in 11px Inter `ink-4`, centered in their own paragraph. The deliberate use of typographic dashes (not graphic rules) keeps the email feeling like a letter.

**Lead Attribution headline (Build/Scale tier only).** Single sentence, 18px Inter 400 `ink`. The lead-attribution number is the headline of the second block. Fraunces is *not* used here — Fraunces is reserved for the closing signature and (occasionally) for Monthly Updates. The Digest body stays Inter throughout to read as plain-text-equivalent. Discover-tier digests omit this block entirely.

**"What we did" section.** 14px Inter 500 caps tracking 0.06em as the eyebrow header. Below: a list of 3-7 dated actions, each as: `Day · [action sentence]. → [permalink]`. Day abbreviation in Geist Mono 13px `ink-3` (the day is the row's anchor). Action sentence in 15px Inter 400 `ink`. Permalink on the next line, indented 8 chars (visual indent via leading whitespace), 13px Inter 400 `brand-blue`, underlined.

**Score block.** A simple line: the score number + delta + a 12-character ASCII sparkline rendered in `ink-3` at 13px Geist Mono. The ASCII sparkline uses Unicode block characters (`▁▂▃▄▅▆▇█`) for the 12-week values. Below: `12-week trend` in 11px Inter caps tracking, `ink-4`. **No image.** The ASCII sparkline is durable across all clients, never breaks, and feels intentionally tactile.

**One thing needs you (conditional).** Only renders if there's a pending Inbox item that exceeds the Brief's auto-approval threshold. Format: `→ [action]. ~[time estimate].` followed by the inbox permalink. The arrow glyph is the only call-to-action affordance — no buttons.

**Permalink to web digest.** `Read this on the web → [URL]` in 13px Inter 400 `ink-3`. Tiny but always present.

**Signature.** `— Beamix` in **22px Fraunces 300 italic, opsz 144**, `ink`. 32px above the footer. This is the only Fraunces in the entire email body — the editorial seal. Email clients that don't load custom fonts fall back to system serif italic, which is acceptable; the italic + em-dash glyph carries the signature's identity.

**Footer.** 11px Inter `ink-4`. Three actions separated by middle-dots (`·`): `pause digests`, `unsubscribe`, `report content`. Below: `Beamix · beamix.tech`. All footer links are `ink-4` underlined.

## 2.3 Voice — examples of good and bad copy

**Good (Beamix voice):**
- *"This week Beamix shipped 6 changes, found 3 new citations on Perplexity, and watched 2 competitor moves."*
- *"Profound published 12 comparison pages this month; we drafted 4 responses, awaiting your approval."*
- *"Your first attributed call came in at 4:02pm Tuesday. 3 minutes, recorded."*
- *"Quiet week. Two scans ran clean; nothing needed you."*

**Bad (not Beamix voice):**
- *"We're excited to share this week's progress!"* — exclamation point, "excited", marketing register.
- *"Hi Sarah! Hope you had a great weekend!"* — apologetic, generic, fluffy.
- *"Our AI agents have been hard at work optimizing your visibility."* — "AI agents", plural agent names exposed externally, "optimizing", abstract claim.
- *"You've got an inbox full of items waiting for review."* — vague, anxiety-inducing, no number.

**Voice rules summarized:**
- Direct: state the thing.
- Specific: name the action, the engine, the number, the day.
- Brief: cut every word that doesn't carry signal.
- Signed: every email closes with `— Beamix`.

## 2.4 Personalization variables

Every digest fills in:
- `[date_span]` — `Apr 21–27`
- `[weekday + date]` — `Monday, April 27`
- `[changes_shipped_count]`
- `[citations_found_count]`
- `[engines_with_new_citations]` — comma-separated list
- `[competitor_moves_count]`
- `[score]`
- `[score_delta]`
- `[lead_attribution_calls]` (Build+ tier only)
- `[lead_attribution_form_subs]` (Build+ tier only)
- `[lead_attribution_delta_vs_last_month]` — ratio, e.g., `1.4×`
- `[needs_you_item]` — title + estimated time + permalink (or null)
- `[action_list]` — array of `{day, sentence, permalink}` objects, max 7
- `[12_week_score_array]` — used to render the ASCII sparkline
- `[digest_permalink]`

The customer's first name is **not** used. The customer's business name is **not** used. The recipient is the only person reading; we don't need to remind them who they are.

## 2.5 Tier variations

| Tier | What appears in the digest |
|---|---|
| Discover ($79) | Greeting · Status sentence · What we did · Score · One thing needs you · Permalink · Signature. **No Lead Attribution block.** |
| Build ($189) | All of Discover + Lead Attribution headline (calls + form submissions + delta) |
| Scale ($499) | All of Build + per-client breakdowns when the customer manages multiple businesses (one digest per client, each branded with the client's name in the subject — `Beamix · Sarah's Plumbing · this week, 6 changes shipped`). White-label option available — Yossi's agency wordmark replaces Beamix's in the cream header for delivery to his clients. |

The Discover digest is shorter on purpose — fewer signals, but the signature is the same. As Sarah upgrades to Build, the Lead Attribution block appears as a *gain* from her upgrade — visible value attached to a tier change.

## 2.6 Send timing

- **Day:** Monday.
- **Time:** 9:00 AM in the customer's local timezone (Beamix stores `customer_timezone` from onboarding; falls back to America/New_York if unset).
- **Frequency:** Weekly, with no skip allowed. Even if the week was quiet, the digest still sends — the consistency is the trust mechanism. A "quiet week" digest reads: *"Quiet week. Two scans ran clean; nothing needed you. Score steady at 78."* And signs off `— Beamix`.

## 2.7 Reply-to and infrastructure

- From: `beamix@notify.beamix.tech`
- Reply-to: `hello@beamix.tech` (a real human reads these; one-Customer-Lead model per Frame 5 v2)
- DKIM/SPF/DMARC: full alignment on `notify.beamix.tech`
- Per Resend best practices: domain verified, separate from transactional flow if scale demands

---

# Section 3 — Monthly Update PDF + permalink (the gift-quality artifact)

## 3.0 Why this is the most important editorial surface

The Monday Digest is private, fast, weekly. The Monthly Update is the artifact Sarah forwards. *That forwarding is the distribution mechanic.* When Sarah sends the PDF to her CEO, accountant, or board, the recipient forms a 30-second impression of Beamix from the typography alone. If the artifact looks gift-quality, Sarah is implicitly endorsed (her vendor is serious); Beamix is implicitly endorsed (someone serious chose them). When Yossi sends a white-labeled version to his agency client, the same dynamic applies but with Yossi's brand on the cover.

Most GEO competitors send a CSV export or a charts-dump PDF. The Monthly Update is *not* a charts-dump. It is **a 6-page letter on cream paper, signed**, that happens to contain the data.

## 3.1 The 6-page composition

A4 / US Letter (the same template renders both, with margin adjustments). Cream-paper background (`#F7F2E8`) on every page. Margins: 1.25 inches on print, 96px on web.

### Page 1 — Cover

**The single page that decides whether the recipient turns to page 2.**

Layout (top to bottom):
- Top-left: tiny Beamix wordmark (`Beamix` in 16px InterDisplay 500) + the cross/star sigil mark, 24px tall total. **Or** Yossi's agency wordmark in white-label mode.
- Top-right: month + year in 12px Geist Mono `ink-3`. Format: `MARCH 2026`.
- Vertical center, large: the customer's business name in 64px Fraunces 300, opsz 144, `ink`. Two lines max if long.
- Below the business name, with 32px gap: a single editorial pull-quote in 28px Fraunces italic 300 `ink-2`, max 3 lines, max 80 words. This is the *hook* — the one sentence that makes the recipient turn to page 2. Pull quotes are LLM-generated from the month's data, picked by editorial heuristics (most distinctive number, most consequential change, or most quotable narrative beat). Examples:
  > *"This month, the phone rang 47 times because of work Beamix did in February."*
  > *"You crossed 80 on April 4th. That's the threshold where AI engines start citing you in default answers."*
  > *"Three competitors moved this month. None of them caught up to you."*
- Bottom of the page, 96px from the bottom edge: the Beamix Activity Ring, drawn in `brand-blue` 2px stroke, 96px diameter, with the score inside in 48px InterDisplay tabular `ss03` `ink`. This is the cycle-snapshot Ring — static, not pulsing, since this is print.
- Bottom-right corner: tiny Geist Mono `ink-3`: `monthly update · march 2026`.

The cover is **deliberately sparse.** No charts, no tables, no logos other than the wordmark. The empty space is the design — it tells the recipient *"this is a letter, not a report."*

### Page 2 — Lead Attribution headline

The most important page after the cover. The headline number is what Sarah's CEO scans for.

Layout:
- Page eyebrow: `LEAD ATTRIBUTION` in 11px Inter caps tracking 0.10em `ink-3`. 96px from top.
- Below, with 24px gap: the headline number-sentence, in 48px Fraunces 300 `ink`, line-height 64px:
  > *"This month: **47 calls** and **12 form submissions** came in through Beamix-attributed channels."*
  - The numbers (`47 calls`, `12 form submissions`) are wrapped in 48px Geist Mono 500 (tabular numerals, `ss01` for slashed zero). The mix of Fraunces (the prose voice) and Geist Mono (the *data* voice) inside one sentence is the Monthly Update's typographic signature.
- Below, with 32px gap: a 16px Inter 400 `ink-2` paragraph providing context:
  > *"That's up from 11 calls and 3 form submissions in March — a 4.2× increase. The biggest driver: emergency-plumbing FAQ schema went live April 4th and now appears in default answers from ChatGPT, Perplexity, and Gemini."*
- Below, with 48px gap: a small attribution table, 11 rows max, showing each call's source (engine, query, time, duration, recording link). Geist Mono 12px for data, Inter 13px for column headers. Cream rows alternate with `paper-elev` cream (slightly darker tone, ~3%).
- Page footer: page number `2 / 6` in 11px Geist Mono `ink-4`, centered.

**Page 2 redesign (2026-04-28 amendment — F22 AI Visibility Cartogram):**

The Monthly Update Page 2 carries the AI Visibility Cartogram as its primary chart:

- A 50-queries × 11-engines = 550-cell grid, ~880×600px, single-page artifact
- Each cell 24×24px, color-coded:
  - `--color-brand` if customer is cited in a top position (1-3) on this query/engine
  - `--color-ink-3` if cited but late (4+)
  - `--color-paper-elev` if not cited
  - `rgba(239, 68, 68, 0.20)` (`--color-score-critical-soft`) if a competitor is cited instead
- Each cell carries a 1-character glyph: position number (1-3) or competitor initial
- Direct-labeled: queries down the left margin (11px Inter caps); engines across the top (11px Inter caps)
- No animation, no gradient, no decoration — Tufte-canonical Beautiful Evidence

The cartogram is also rendered on `/scans/[scan_id]` and as the OG share card. *The "John Snow cholera map of GEO."* The data is already collected (every scan captures per-engine per-query rank). Renderer = 550-cell HTML grid with conditional formatting.

Page 2 was previously the lead-attribution headline + 11-row table; now it carries: (top) lead-attribution headline + 4 micro-charts (calls/day-30d, forms/day-30d, score/week-12w, citations/week-12w each at 120×80px) + (bottom) the cartogram.

Discover-tier accounts that don't have Lead Attribution active receive a **modified Page 2** with the heading `WHAT YOU SHIPPED` and a different headline:
> *"This month: **3 score gains** and **6 fixes shipped** without any work from you."*

### Page 3 — Score + 12-week trajectory + engine breakdown

Layout:
- Page eyebrow: `SCORE & TRAJECTORY`.
- Below: the score in 96px Fraunces 300 `ink` + the delta in 32px Geist Mono `score-good` (or appropriate semantic color). E.g., `78 (+4)`.
- Below, the 12-week trajectory chart: a `perfect-freehand` rendered sparkline, 480×120, `brand-blue` 2px line. Six axis ticks below the chart in 11px Geist Mono `ink-4` showing month abbreviations. Two key inflection points are annotated with small Rough.js circles + a 11px caption above each: e.g., `Mar 4 — FAQ schema launched`, `Apr 4 — Score crossed 80`.
- Below the chart, a small horizontal engine breakdown: 11 chips in a row, each with engine name (12px Inter caps), score (16px InterDisplay tabular), delta (11px Inter, semantic). Cream chips with `border` outline.
- Page footer: `3 / 6`.

### Page 4 — What we did this month

**Page 4 redesign (2026-04-28 — Tufte's small-multiples action timeline):**

Replaces prior 5-7 prose action blocks with a high-density action-bar timeline:

- One row per agent action this month (typically 12-30 actions)
- Each row: 11px Geist Mono date, 16×16 agent monogram (2-letter, deterministic seed), 13px verb+object sentence, **48×16px micro-bar showing score impact attributed to this action**
- All bars zero-aligned on the same x-scale (visually comparable)
- Sorted by impact (largest impact first)
- Reader scans the bar column and sees in 3 seconds which actions moved the needle

The action rows are signed at the entity level as **"Beamix"** — *"Beamix added"*, *"Beamix fixed"*, *"Beamix watched"*, *"Beamix drafted"*. **Never "Schema Doctor added," never "Citation Fixer drafted."** This is the single-character rule from Frame 5 v2 — externally, the brand is one entity. The agent roster is internal architecture exposed only on `/crew`. (Monograms in the row carry agent identity at a glance, but the verb subject remains "Beamix.")

Page footer: `4 / 6`.

### Page 5 — What changed in your AI search visibility (the narrative page)

This is the editorial page. 1-2 paragraphs of *narrative*, in 18px Fraunces 300 line-height 28px, max-width 540px (single column, generous left/right margin). The voice is direct, executive-readable, and free of jargon.

Example:
> *"April was the month emergency-plumbing queries started defaulting to your business name on three of the eleven AI engines we monitor. The shift happened around April 4th, after FAQ schema went live. Perplexity moved first, then Gemini followed within 48 hours. ChatGPT took two more weeks to incorporate the citation pattern."*
>
> *"Profound — your most active competitor — published 12 comparison pages targeting your category this month. Eight of them are well-built. Beamix has drafted four responses; one has been published, three are in your inbox awaiting approval. None of these have changed your rankings yet, but the pattern matters: Profound is investing in AI-search content. Watch them."*
>
> *"Three new query patterns emerged this month that didn't exist 60 days ago: 'plumber near me that takes credit cards,' 'plumber that comes today,' and 'plumber for old buildings.' Beamix is drafting content for each."*

Page footer: `5 / 6`.

### Page 6 — What's next + signature

Layout:
- Page eyebrow: `WHAT'S NEXT`.
- 1-2 sentences forward-looking, in 18px Fraunces 300 `ink`:
  > *"Next month, Beamix will publish 18 FAQ drafts queued in your Inbox. Schema Doctor will validate each entry against your Truth File before publishing. Watch for your first citation on Claude — we're 2-3 weeks away."*
- Below, 32px gap.
- **Final line, just above the closing Seal (F28, locked 2026-04-28):**

  > *"Beamix considered {N} changes this month and rejected {M}. Rejection log: [link]"*

  13px Inter 400 `ink-3`, single line, centered. Converts restraint into a visible product feature.

- Below, 64px gap.
- The Beamix wax-seal mark, drawn (Rough.js, `brand-blue` 2px stroke, 48×48 — twice the size of the cover seal; the closing seal is always larger, broadsheet typesetting tradition). Centered horizontally.
- Below the seal, with 24px gap: the signature line in 28px Fraunces 300 italic, opsz 144, `ink`:
  > *— Beamix*
- Below, 16px gap: in 11px Geist Mono `ink-3`, centered: `Generated April 27, 2026 by Beamix for Acme Plumbing.`
- Below, 8px gap: the report's permalink `app.beamix.tech/reports/abc-123-456` in 11px Geist Mono `ink-3`.
- Bottom of the page (footer): `6 / 6`.

The closing page is the *artifact moment*. The seal is hand-drawn. The signature is Fraunces italic. The permalink is Geist Mono — this is technical truth. Three voices in three lines, choreographed.

## 3.2 The web permalink (`app.beamix.tech/reports/[report_id]`)

The same content, rendered as a long-scrolling web page. Same cream-paper background. Same typography (Fraunces loaded via Google Fonts with `display: 'block'`; same Geist Mono and Inter).

**Differences from the PDF:**
- Single column, 720px max-width, vertically scrolling — the user does not see "pages," but the page-break rhythm is preserved through 96px vertical gaps between sections.
- The Activity Ring on the cover is *animated* — drawn over 1500ms on first scroll into view (and remains static thereafter).
- The 12-week trajectory chart is interactive: hover reveals the date and score for each point.
- The Lead Attribution table on Page 2 has clickable call-recording links (open Twilio recording in a new tab).
- A persistent top bar (only on the web version) gives `Download PDF` + `Share link` actions in 13px Inter `ink-3`, top-right.

The web permalink is shareable, **but private by default.** *(2026-04-28 board lock: this section's prior default-public draft was overridden. T&S explicitly rejected hybrid-redaction as new attack surface. The forwarding mechanic survives via the email PDF attachment — customers can forward the email to their CEO/board with the artifact embedded. To create a public link, the customer clicks an explicit "Generate share link" button in `/reports` settings — that gesture issues an unguessable nanoid URL with a 30-day default expiry, indexability blocked, rate-limited, multi-tenant-isolated routing per Trust & Safety §1.)*

## 3.3 PDF generation — the build approach

**Decision: React-PDF (`@react-pdf/renderer`) for the PDF, with the same React components reused on the web permalink (just with web-CSS instead of React-PDF's StyleSheet).**

Why React-PDF over alternatives:
- **vs Browserless / Puppeteer headless rendering**: more reliable on font loading (no FOUT issues), much smaller compute footprint, predictable rendering across runs, no browser-version drift.
- **vs Latex/PrinceXML**: React-PDF lets us share the layout primitives between web and PDF; designers can iterate on one component and update both surfaces.
- **vs Vercel OG (`next/og`)**: Vercel OG is great for single-image cards but doesn't scale to 6-page documents.

**Implementation:**
- Component tree: `<MonthlyUpdate report={...} mode="pdf" />` and `<MonthlyUpdate report={...} mode="web" />`. The same component reads `mode` and emits either React-PDF primitives (`<Page>`, `<Text>`, `<View>`) or HTML elements with Tailwind classes.
- Fonts: Inter, InterDisplay, Fraunces, Geist Mono — all loaded into the React-PDF runtime via `Font.register()`. Fraunces uses the variable axes (opsz, soft, wonk) — React-PDF supports variable fonts as of v3.
- Rough.js elements (the Activity Ring, the seal, the sparkline annotations): pre-rendered as SVG strings server-side using Node.js + JSDOM + Rough.js, then embedded into React-PDF as `<Svg>` elements. The seeds are deterministic per `report_id`.
- The `perfect-freehand` 12-week sparkline is also pre-rendered to SVG server-side and embedded.
- PDF generation runs in an Inngest job: the moment a Monthly Update is generated (1st of the month, customer-local), the job renders the PDF, uploads to Supabase Storage, generates the public permalink page, and queues the email.

## 3.4 Tier variations

| Tier | Cover | Page 2 (Lead Attribution) | Pages 3-6 | Print run |
|---|---|---|---|---|
| Discover ($79) | Standard | Modified — "WHAT YOU SHIPPED" instead of attribution data | Standard | None — PDF + web permalink only |
| Build ($189) | Standard | Standard Lead Attribution data | Standard | None — PDF + web permalink only |
| Scale ($499) | Standard **or** white-label (Yossi's agency wordmark replaces Beamix's) | Per-client Lead Attribution data | Per-client narrative; multi-domain support (one report per managed business) | Optional — Scale customers can opt-in to a printed Year-in-Review at month 12, mailed free |

**White-label specifics for Scale.**
- Yossi configures his agency's wordmark, primary color (replaces brand-blue throughout), and domain (`reports.yossiagency.com`) in `/settings/whitelabel`.
- The seal mark is replaced with a custom seal that Yossi can design (Beamix provides a template; Yossi swaps the central glyph).
- The signature line on Page 6 changes from `— Beamix` to `— [Yossi's agency name]`. Yossi can override this per-client too.
- The cover, Page 2 headline, Page 4 narrative, and Page 6 forward-look are all rendered with Yossi's voice (he configures a custom Brief tone in `/settings`); the data is identical.
- Beamix's name appears nowhere on the white-labeled artifact. The footer reads `Generated by [agency] for [client], April 27, 2026.`
- A small `Powered by Beamix` link can optionally appear in the web permalink footer; it's off by default for Scale white-label, and Yossi can re-enable it.

## 3.5 Microcopy register — Monthly Update voice

The Monthly Update is the *most editorial* surface in Beamix's stack. The voice is direct, confident, executive-readable. Examples:

**Good:**
- *"This month, the phone rang 47 times because of work Beamix did in February."*
- *"Perplexity moved first, then Gemini followed within 48 hours."*
- *"Watch Profound. They're investing."*
- *"You crossed 80 on April 4th."*

**Bad:**
- *"We're thrilled to report another month of progress!"* — exclamation, "thrilled", marketing.
- *"Our AI agents have been busy optimizing your visibility across all major engines."* — abstract, multi-agent, "optimizing".
- *"This month was a great success for your AI search presence!"* — vague, valedictory.
- *"As we look forward to next month, we're excited to continue our partnership."* — corporate, fluffy, no information.

**Voice rules for Monthly Update:**
- Every sentence carries a fact (a number, a date, a named entity).
- Use the customer's business name once on the cover; never again in the body.
- Use the customer's industry vocabulary (plumbing terms for plumbers, schema terms for SaaS founders).
- Use Beamix as the actor. Never "we" without antecedent. Never agent names.
- Use the past tense for what happened, the present tense for the current state, the future tense (sparingly) for what's next.
- Numbers are always digits. Always tabular. Always `tnum`.

## 3.6 The accompanying email (delivers the Monthly Update)

The Monthly Update is delivered by a short email — under 80 words. Subject line: `Beamix · April 2026 update`.

Body:
```
Sarah,

April's Monthly Update is ready. The headline:
47 calls and 12 form submissions came in through
Beamix-attributed channels — up 4.2× vs March.

Read it: app.beamix.tech/reports/[report_id]
Download PDF: app.beamix.tech/reports/[report_id].pdf

— Beamix
```

The accompanying email is *not* the artifact. It is the *handoff* to the artifact. The same plain-text-equivalent discipline as the Monday Digest. Same cream header strip, same Fraunces signature, same permalink-first posture.

(Yes, this is the only email where the customer's first name appears in the greeting — because this email asks them to do something specific, namely *open a 6-page artifact*. The personalization earns its place by signaling: this is for you, and it is worth your time.)

---

# Section 4 — Cross-surface coherence

The three editorial surfaces (`/scan`, Monday Digest, Monthly Update) plus the four product surfaces (`/home`, `/inbox`, the rest of the app) and the Framer marketing site form **seven surfaces** that must feel like one designer made all of them. The Master Designer specified five "travel moves" that bind these surfaces. Section 4 of this spec specifies how those travel moves render on the three editorial surfaces.

## 4.1 What travels across all three editorial surfaces

| Token | `/scan` | Monday Digest | Monthly Update |
|---|---|---|---|
| **Cream paper background** (`#F7F2E8`) | Full bleed, all 10 frames + permalink | 32px header strip only | Full bleed, all 6 pages + web permalink |
| **The seal mark** (Rough.js cross/star) | Bottom-right of OG share card; embedded in Frame 9 signature | 16×16 in cream header strip | 24×24 on cover, 48×48 on page 6 (closing seal larger — typesetting tradition) |
| **The signature line `— Beamix`** | Frame 9, after diagnosis (Geist Mono); Frame 10 doesn't include signature (it's a CTA, not an artifact close) | After body, before footer (Fraunces italic 22px) | Page 6 closing (Fraunces italic 28px), and accompanying email closing |
| **Fraunces 300 italic for editorial accents** | Frame 4 opener, Frame 5 transition, Frame 9 diagnosis, Frame 10 headline | Reserved for signature line only — body stays Inter for plain-text feel | Cover pull-quote, Page 2 headline-sentence, Page 4 action headlines, Page 5 narrative, Page 6 forward-look + signature |
| **Geist Mono for technical truth** | Frame 8 grid (mostly InterDisplay, but timestamps and IDs in Mono); permalink eyebrow + footer | Action list day prefixes (`Mon · `, `Tue · `); date span in header; ASCII sparkline | Date stamps, page numbers, permalinks, generation footer |
| **The Margin (24px-wide vertical strip on the left edge)** | Persists down the entire `/scan` permalink page; on each frame the Margin holds Rough.js attributions to the agent that contributed | NOT in the email body (limited horizontal real estate) — but the cream header strip carries the brand mark, fulfilling the same "left-edge identity" function | Persists down all 6 pages — Geist Mono date stamps in the Margin on Pages 2-5 echo each event's chronology |
| **`brand-blue` (#3370FF)** for active states / links / chrome accents | Rough.js rectangle around URL (Frame 2) and diagnosis (Frame 9); CTA button (Frame 10); arc fill at score-tier excellent | Permalinks; "Read this on the web" link; the small `→` glyph before action items | Sparkline line on Page 3; "next" affordances; permalinks on Page 4 |

## 4.2 What's surface-specific

| Element | Surface | Why |
|---|---|---|
| Excalifont (handwritten) | `/scan` Frame 3 only | The user is being shown an *inferred guess they can correct* — handwriting signals "in pencil, editable." Used nowhere else. |
| Score arc (gauge with score number inside) | `/scan` Frame 7 + permalink + OG; Monthly Update Page 3 (and as a small static element on cover) | The Score is the climactic data point. It belongs on artifacts that summarize a moment in time. The Monday Digest does not include the arc — it's weekly, not summary, and the ASCII sparkline is sufficient. |
| Activity Ring (the live, pulsing version) | `/home` only — never on editorial surfaces | The Ring is the live work-cycle signal. On a static artifact, the Ring's pulse is meaningless; we use the static cycle-snapshot Ring instead, on `/scan` permalinks and Monthly Update covers. |
| Strikethrough-and-rewrite mechanic | `/scan` Frame 3 only | This is the user-input correction mechanic. Belongs to the surface where the user is providing data. |
| Engine-by-engine grid | `/scan` Frame 8; Monthly Update Page 3 (compact horizontal version) | The Monday Digest references engines in prose only. The grid is for surfaces where the user wants to *see all 11 at a glance.* |
| Lead Attribution table | Monthly Update Page 2 only | The Digest references the headline number in prose; the full attribution table belongs to the monthly artifact. |

## 4.3 The continuity test

Take a screenshot of any element from any of the three editorial surfaces. Show it to a designer who has never seen Beamix. They should be able to identify it as Beamix in under 1.5 seconds. The strongest identification cues, in order:
1. **The cream paper** (`#F7F2E8`) — instantly recognizable, especially next to a generic SaaS dashboard.
2. **The Fraunces italic signature `— Beamix`** — the typeface + the em-dash + the lowercase wordmark form a unique signature.
3. **The Rough.js seal mark** — the hand-drawn cross/star is unique to Beamix's visual grammar.
4. **The combination of Inter (body) + Fraunces (accent) + Geist Mono (data)** — three voices, calibrated.
5. **The Margin column with Rough.js agent fingerprints** — present on `/scan` permalinks and Monthly Updates.

If any of these five elements appears, a designer should think *"this is the AI-search-visibility company that does editorial PDFs."* That is the brand recognition target.

**Margin temporal decay (2026-04-28 amendment per Ive):**

Margin marks on Monthly Update PDF and Monday Digest header strip carry temporal decay:
- Current week actions: 100% opacity
- Prior month: 20% opacity
- Archived (>3 months): 6% opacity

The Margin becomes a horizon line: present is dense, past dissolves. Past actions visible but distant.

---

# Section 5 — Microcopy register (the editorial voice across all three surfaces)

The three editorial surfaces share one voice. It is not the same as the product UI's voice (which is more clinical) or the marketing site's voice (which is more punchy). The editorial voice is **direct, warm-clinical, specific, and brief.**

## 5.1 The four ingredients (in priority order)

1. **Direct.** State the thing. No "We're excited to share." No "We hope this finds you well." No throat-clearing. The reader's first 6 seconds of attention is precious; spend it on signal.

2. **Warm-clinical.** The voice is not cold (no "Per our analysis…"), not gushy (no "Such an exciting milestone!!"). It is the voice of a senior contractor who has done good work and is reporting back factually — but who genuinely respects the customer.

3. **Specific.** Numbers, timestamps, named outcomes. Replace every adjective with a number when possible. *"Significant improvement"* → *"+4 score, +12 citations on Perplexity, 47 calls."* The specificity is the trust mechanism.

4. **Brief.** Executive readability. The Monthly Update is 6 pages, but Page 2's headline is *one sentence*. The Monday Digest is one screen. The `/scan` diagnosis is one line. Beamix never pads.

## 5.2 Voice examples per surface

### `/scan` voice examples

**Headlines (Frame 4 + Frame 5):**
- *"asking 11 AI engines about you …"*
- *"Beamix asked 11 engines. 7 mentioned you, 4 didn't."*
- *"now Beamix scores you …"*

**Diagnoses (Frame 9, all variants):**
- *"73 out of 100. Stronger on ChatGPT than Perplexity. Top fix is FAQ schema."*
- *"61 out of 100. You're cited on Gemini, missing on Claude. Top fix is your about-us page."*
- *"88 out of 100. Cited on every major engine. Watch Profound — they shipped 12 comparison pages this month."*
- *"42 out of 100. Beamix found 19 things to fix. The top three would move your score 14 points."*

**CTA headlines (Frame 10, by score tier):**
- 85+: *"Beamix can't make 88 better — but we can make sure it stays there."*
- 70-84: *"Save these results — try Beamix free for 14 days."*
- 50-69: *"Beamix can fix most of this. Want help?"*
- <50: *"This is fixable. Beamix does the work."*

### Monday Digest voice examples

**Subject lines:**
- *"Beamix · this week, 6 changes shipped"*
- *"Beamix · Apr 21–27: your first attributed call came in"*
- *"Beamix · quiet week"*

**Greeting + status sentence:**
> *"Monday, April 27.*
>
> *This week Beamix shipped 6 changes, found 3 new citations on Perplexity, and watched 2 competitor moves. Score is up 4 to 78. One thing needs you."*

**Action list (with day prefix):**
- *"Mon · Added 11 FAQ entries to /services/emergency."*
- *"Tue · Fixed structured-data errors on /pricing."*
- *"Thu · Drafted competitor response to Profound's new comparison page. Awaiting your approval."*

**One-thing-needs-you call:**
- *"→ Approve a homepage hero rewrite. ~30 seconds."*

**Quiet-week digest:**
> *"Monday, April 13.*
>
> *Quiet week. Two scans ran clean; nothing needed you. Score steady at 78. Next scan: Friday.*
>
> *— Beamix"*

### Monthly Update voice examples

**Cover pull-quotes:**
- *"This month, the phone rang 47 times because of work Beamix did in February."*
- *"You crossed 80 on April 4th."*
- *"Three competitors moved this month. None of them caught up."*
- *"April was the month Perplexity started naming you in default answers."*

**Page 2 headline sentences:**
- *"This month: **47 calls** and **12 form submissions** came in through Beamix-attributed channels."*
- *"This month: **3 score gains** and **6 fixes shipped** without any work from you."* (Discover variant)

**Page 4 action headlines:**
- *"Beamix added 23 FAQ entries to /services/emergency-plumbing."*
- *"Beamix fixed 5 structured-data errors that blocked your hours from showing in AI Overviews."*
- *"Beamix watched Profound and Otterly. Both shipped comparison pages; we drafted responses to all of Profound's, queued in your Inbox."*

**Page 5 narrative:**
> *"April was the month emergency-plumbing queries started defaulting to your business name on three of the eleven AI engines we monitor. The shift happened around April 4th, after FAQ schema went live. Perplexity moved first, then Gemini followed within 48 hours. ChatGPT took two more weeks to incorporate the citation pattern."*

**Page 6 forward-look:**
- *"Next month, Beamix will publish 18 FAQ drafts queued in your Inbox. Schema Doctor will validate each entry against your Truth File before publishing. Watch for your first citation on Claude — we're 2-3 weeks away."*

**Closing signature:**
- *"— Beamix"* (always)

## 5.3 Voice anti-patterns (forbidden across all three surfaces)

- **Exclamation points.** Used at most once per artifact — and only when the news genuinely warrants ("Your first attributed call!"). Otherwise, never.
- **The word "we" without antecedent.** Acceptable: *"We at Beamix saw…"*, *"We added 11 FAQ entries…"*. Forbidden: *"We believe AI search is the future."*, *"We're excited to…"*.
- **SaaS-default verbs.** No "leverage," "unlock," "elevate," "supercharge," "empower," "transform," "synergize," "revolutionize."
- **Greetings beyond the date.** No "Hi Sarah," no "Hope you had a great weekend," no "Thanks for being a Beamix customer."
- **The fourth-wall break.** No "As an AI agent, I…" No "Our AI is working on…" The customer-facing brand is one entity (Beamix); the AI nature is internal architecture, not voice content.
- **Apologetic preambles.** No "Sorry to bother you, but…" No "I know you're busy, but…" The artifact is sent because it's worth sending; the act of sending it does not require an apology.
- **Adjective stacking.** *"Comprehensive, in-depth analysis"* → *"6-page report"*. *"Significant, meaningful improvement"* → *"+4 score"*.
- **Marketing register.** No "We're thrilled to announce…" No "Big news!" No "[Customer], you're going to love this…"

## 5.4 The signature line discipline

Every Beamix-authored artifact ends with `— Beamix`. The em-dash is U+2014 (`—`), not two hyphens. There is one space between the dash and the word. The word `Beamix` is title-case, not all-caps, not all-lowercase. The line is rendered in:

| Surface | Typography |
|---|---|
| `/scan` Frame 9 | 13px Geist Mono `ink` |
| `/scan` permalink footer | 11px Geist Mono `ink-3` (in the generated-by line) |
| Monday Digest body close | 22px Fraunces 300 italic, opsz 144, `ink` |
| Monthly Update Page 6 | 28px Fraunces 300 italic, opsz 144, `ink` |
| OG share card | 16px Geist Mono `ink` |
| Accompanying email (delivers Monthly Update) | 14px Fraunces 300 italic, `ink` |

The variation in size + typeface (Mono vs Fraunces) is meaningful: **Geist Mono signature** signals technical truth (a record, a footnote, a technical receipt); **Fraunces italic signature** signals authorship (a letter, a verdict, a document). The two are not interchangeable.

The signature is the brand's verbal seal. It travels across every surface. It is the last word on every artifact.

---

# Closing

The three editorial surfaces are not three isolated assets. They are the three places Beamix's brand most often meets a non-customer (`/scan`'s permalink shared on Twitter), an executive (the Monthly Update forwarded to a CEO), or the customer themselves at their most reflective moment of the week (Monday morning, 9am, the Digest in the inbox).

If they are designed at this level — cream paper, Fraunces italic, hand-drawn seals, signed *— Beamix*, the editorial discipline that no GEO competitor will match — they do most of Beamix's distribution work for free. The forwarded PDF is an introduction. The shared `/scan` permalink is an ad. The screenshot of the Monday Digest is a testimonial.

This is the editorial register. It is reserved for these surfaces. It does not appear in the product UI. It does not appear on the Framer marketing site (which has its own editorial discipline, but with different proportions and a pill-shaped CTA). It is the most concentrated form of Beamix as *a publication, not a tool.*

Three years from now, when a designer reverse-engineers Beamix in a Figma file labeled *"how Beamix did it,"* these three artifacts are the first three frames they recreate.

Implementation can begin immediately on any of the three surfaces independently. Cross-surface tokens (Section 4) should be extracted into the design system *before* any of the three surfaces is built, so the seal, the signature line, the cream paper, and the typography are shared primitives from day one.

— *the editorial product designer*
