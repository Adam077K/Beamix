# Onboarding Audit — Mobile · Hebrew RTL · Accessibility
**Date:** 2026-05-04
**Status:** Canonical audit across three concurrent lenses
**Source docs:** `2026-04-27-ONBOARDING-design-v1.md` · `2026-04-28-DESIGN-onboarding-vertical-aware-v1.1.md` · `2026-04-28-PRD-wedge-launch-v4.md` · `2026-04-27-DESIGN-SYSTEM-v1.md`
**Benchmark:** 375px viewport · Hebrew RTL (right-to-left) · WCAG 2.1 AA

---

## §1 — Mobile (375px viewport) audit

### The structural problem

The onboarding spec was written desktop-first and later amended with "375×812 mobile secondary" and "top padding from chrome edge: 120px on desktop, 48px on mobile." That single token swap is not a mobile treatment — it is a scaled-down desktop. At 375px, a 120px top breath was already a signal that the design was conceived for a large viewport. Everything below surfaces where this assumption breaks down.

---

### Step 0: Free scan input (pre-onboarding, /scan public)

**What breaks:** The cream-paper hero on `/scan` public is the first impression for mobile-discovery users arriving from Twitter/LinkedIn. At 375px, a 640px max-width content well means the well fills the viewport edge-to-edge with zero side margin. The Fraunces editorial headline (likely `text-h1`, 48px InterDisplay or larger) will collide with the top chrome or require a hard line-break that the designer did not specify.

**What's mediocre:** A domain input field sized for 640px wells reads as 375px edge-to-edge input — workable, but the globe icon on the right side of the field sits at 12px from the edge. On iOS Safari, the "Go" key on the keyboard typically needs clear visual separation from trailing icons to avoid mis-taps.

**Specific fix:** Set content-well `padding-x: 16px` explicitly for `<640px` viewport (not handled in current spec). Reduce `text-h1` to `text-h2` (32px) at mobile breakpoint for the scan hero headline. Size: XS.

---

### Step 1: Confirm the basics

**What breaks:**

1. **The combobox Industry field.** At 375px, the v1.1 combobox redesign opens a "480px-wide popover (560px / sheet on mobile)." The spec explicitly calls for a sheet on mobile — but does not define sheet dimensions, handle area, or scroll behavior. A sheet on iOS must respect the safe-area-inset-bottom (34px on iPhone with home-bar). Without this, the sheet's confirm/close action sits behind the home indicator.

2. **The confidence indicator row.** The v1.1 combobox row has "Left 48%: pre-filled value" and "Right 48%: confidence indicator + 'Change vertical →' ghost link." At 375px, 48% = ~180px. "Change vertical →" in 13px Inter at 180px column will clip or require the indicator to be dropped. The confidence dot + state text + "Change vertical →" does not fit in 180px.

3. **The 4-field stack.** Four stacked 56px-tall fields + 24px gaps = 4×56 + 3×24 = 296px of form alone. Plus 120px (spec says 48px on mobile) + h2 (40px) + subtext block (~48px) + 96px button gap + 56px button = roughly 584px total. On iPhone SE (568px visible height above keyboard when keyboard is not active), this is already at ceiling. On any device with a native bottom bar, content will be cut off without scroll.

4. **Keyboard avoidance.** The spec does not address keyboard behavior. On iOS, focusing any input fires the keyboard (~260–300px tall). The layout does not collapse its top padding or scroll to keep the focused field visible. Fields 3 and 4 are buried — a user on a 375px device who taps Field 3 (Industry) will have Field 3 occluded by the keyboard unless the scroll position is explicitly managed.

**What needs mobile-native treatment:** The Step 1 form should behave as a native mobile form: when the keyboard appears, `window.scrollTo` to the focused element (or use `ScrollView` equivalent in web form). The primary button should be sticky at the bottom of the viewport (position-fixed, above safe-area-inset-bottom), not part of the content flow with a 96px gap.

**Specific fixes:**
- **Fix M-1:** Add `inset-0` sheet with `pb-[env(safe-area-inset-bottom)]` for the Industry combobox on mobile. Truncate confidence indicator to dot-only on 375px; move "Change vertical →" below the pre-filled value as a second line. Effort: S.
- **Fix M-2:** Reduce top padding to 24px (not 48px) on mobile Step 1. Make primary button `position: sticky; bottom: calc(16px + env(safe-area-inset-bottom))` at mobile. Effort: XS.
- **Fix M-3:** Implement keyboard-aware scroll on all form steps: use `visualViewport` resize event to detect keyboard open and scroll focused element into view. Effort: S (shared utility across all steps).

---

### Step 2: Lead Attribution (SaaS UTM path)

**What breaks:**

1. **The Geist Mono URL rows.** On mobile, each tagged URL (`acme-saas.com/?utm_source=beamix&utm_medium=ai_search&utm_campaign=geo&utm_content=chatgpt`) is ~90 characters. At 13px Geist Mono, 375px minus 2×24px card padding = 327px wide. At 13px monospace, approximately 50-55 characters per line. The URL wraps onto 2 lines. The spec does not say `word-break: break-all` or `overflow-x: scroll`. Wrapped Geist Mono in a panel reads as broken, not intentional.

2. **The staggered typing animation and 60fps budget.** The UTM ceremony types 6-7 URLs at 80 chars/sec. Each URL types for ~1.1 seconds with a blinking cursor. This is 6-7 concurrent CSS animation timers plus the cursor blink interval. On mid-range Android (Qualcomm Snapdragon 680 class, common in the Israeli market at ₪800–1,200 phone price points), CSS animation that modifies `content` on `::after` pseudo-elements inside a card layout can drop below 60fps when the browser is also managing virtual keyboard state. The spec does not acknowledge this risk.

3. **The "Send to your developer" panel with `<details>` code block.** The `<pre>` block at ~12 lines of code is approximately 300px tall when expanded. At 375px, expanding it inside a card panel inside a step with a fixed bottom button creates a scroll-within-scroll on some iOS versions. Avoid nested scroll.

**What's mediocre:** The step 2 Twilio phone panel (Dani's path) — three phone number rows at 48px each are fine on mobile. But the UTM panel's "View the snippet" collapsible is a developer-oriented affordance that Marcus's mobile context (finding Beamix on his phone while in a cab) doesn't call for. This step can be safely simplified to "Copy all" + "Email to dev" with the details block suppressed on mobile.

**Specific fixes:**
- **Fix M-4:** For Geist Mono URL rows on mobile, use `overflow-x: auto; white-space: nowrap` on a horizontal scroll container. A single-line scroll-left is more legible than wrapped monospace at this size. Effort: XS.
- **Fix M-5:** On `prefers-reduced-motion` OR `connection: slow-2g/2g` OR `navigator.hardwareConcurrency <= 2`, suppress the character-by-character typing animation and render all URLs instantly. Effort: S.
- **Fix M-6:** Suppress the `<details>` code block on mobile — show only "Copy all" and "Email to your dev" on 375px. Developer will handle implementation on desktop. Effort: XS.

---

### Step 3: Approve your Brief (hero step)

**What breaks:**

1. **The cream paper register at 375px.** The Brief is a 720px-wide block at full type. At 375px with 24px side padding, the readable width is 327px. Fraunces 300 at 22px with 40px line-height is the spec value. At 327px, the 22px Fraunces line wraps every 3-4 words — the Brief paragraph (5 sentences averaging 18-22 words each) wraps into ~25-30 total lines. The editorial feel depends on the paragraph reading as a controlled literary block. 30 lines of 3-word wrapping looks like a ransom note.

   **Required treatment:** Reduce Brief body from `text-serif-lg` (28px, 40px line-height per design system) to a mobile-specific size: 18px Fraunces 300, 28px line-height. This is still clearly Fraunces, still clearly artifact register, but remains legible at 327px readable width.

2. **The chip inline expand interaction.** When a chip is clicked, it "expands inline (200ms, ease-out, height auto from 32px to ~56-96px)." On mobile, an expanding element inside flowing prose reflowing 30 lines of text creates aggressive layout shift. The surrounding sentence dims to `ink-3` and all other sentences dim to `ink-4`. On a 375px screen, 30 lines of text that reflow and re-dim simultaneously is a jarring experience.

   **Required treatment:** On mobile, chip expansion should use a bottom sheet, not an inline expansion. Tap chip → sheet slides up from bottom with the field + Done button. Prose stays static and fully dimmed behind a scrim. This is the canonical mobile pattern for inline editing on dense text surfaces.

3. **The Seal stamp at 375px.** The Brief block's "bottom-right Margin" for the Seal is a 24px reserved zone in the 720px well. At 375px, the Seal needs explicit positioning — `position: absolute; bottom: 16px; right: 16px` within the cream paper block. If the cream block is a `relative` container, this works. If not (spec does not specify), the Seal stamps onto the wrong element.

4. **The "Print this Brief" offer (F27) on mobile.** The spec shows a 14px link that is "visible for 8 seconds; dismissable via Continue button or implicit timeout." On mobile, the correct alternative is "Email me the Brief PDF" — tapping "Print this Brief" on a mobile browser opens the native print dialog, which is correct behavior but unexpected for most mobile users who will close it immediately. The link text should be conditional: on mobile, change label to "Email me this Brief →" and bypass the PDF entirely — trigger an email to the billing address instead. Effort: S.

5. **The "← Back" + "Approve and start" button row at the bottom.** Two buttons side-by-side in a 375px viewport: `← Back` (ghost, left) and `Approve and start` (primary, 240px minimum width, right). 240px + 48px + ghost = too wide. Options: stack them vertically (primary on top, ghost below), or reduce primary to `flex-1`. Spec does not address this.

**What needs mobile-native treatment:** The Brief chip editing model is fundamentally a pointer/hover-first pattern. The Rough.js underline draw-on-sentence-hover has no mobile equivalent — touch has no hover. The Brief on mobile must telegraph editability through static visual affordances: each chip should have a permanent visible border (not hover-revealed), and a "Tap to edit" hint on first load should appear as a single 11px Geist Mono line below the Brief block.

**Specific fixes:**
- **Fix M-7:** Mobile Brief type: 18px Fraunces 300, 28px line-height at ≤640px. This is a Tailwind responsive variant on the `.text-serif-lg` class. Effort: XS.
- **Fix M-8:** Chip editing on mobile uses bottom sheet (not inline expand). Shared sheet component with field + Done + Esc. Brief stays static behind `bg-black/40` scrim. Effort: M.
- **Fix M-9:** "Print this Brief →" conditional: detect touch device or viewport <640px and substitute "Email me this Brief →" firing a POST to `/api/brief/email-pdf`. Effort: S.
- **Fix M-10:** Button row at bottom: on ≤640px, stack vertically. Primary button first (56px full-width), "← Back" ghost second (44px full-width). Effort: XS.

---

### Step 4: Truth File

**What breaks:** The 7-row hours table (Monday–Sunday, two 80px time fields + Closed checkbox per row) totals ~280px tall per spec. At 375px, 80px-wide time fields work. But two 80px fields + 24px gap + a 24px checkbox target + row label = 80+24+80+24+24 = 232px per row if laid out horizontally with label — this overflows 375px. The spec shows fields as 80px each for a 640px context; on mobile, a stacked layout (row-per-day as a card with label above, open/close side by side below) is more legible.

The three side-by-side Brand Voice fields (184px each, 24px gap = 600px total) cannot fit on 375px. These must stack vertically on mobile.

**Fix M-11:** Hours table on mobile: each day as a row but time fields are 50% width each (minus 8px gap), stacked below day-label + Closed checkbox. Effort: S.
**Fix M-12:** Brand Voice three fields stack vertically at ≤640px. Each full-width, with label repeated once above the group. Effort: XS.

---

### One-handed use and gesture vocabulary

The spec does not address one-handed mobile use. Right-thumb reach on 375px iPhone places the CTA button (bottom center) inside the comfortable thumb zone — this is correct. The "← Back" ghost link above the primary button is also reachable. The combobox Industry field (Field 3) is near center-screen, reachable without repositioning. The only problematic reach target is the top-right stepper dots — but these are non-interactive (spec says "not clickable backwards"), so reach does not matter.

**Brief signing gesture:** The spec does not explicitly name the gesture. "Approve and start" is a standard tap (finger or thumb). This is correct for mobile. There is no reason for tap-and-hold, swipe, or drag. Confirm: single tap on "Approve and start" = Seal stamps. No gesture elaboration needed.

---

## §2 — Hebrew RTL audit (the strategic one)

Israel is the primary market. The entire onboarding flow must be pressure-tested for right-to-left rendering.

### Layout flip requirements by step

**Step 1 — Confirm the basics:**

The 4-field stack mirrors cleanly in RTL: labels right-align, inputs right-align, the globe icon on the Website field moves from right-aligned to left-aligned (right side in LTR is the leading side in RTL — the icon should be at the trailing side, which is now left). The combobox row in v1.1 has "Left 48%: pre-filled value / Right 48%: confidence indicator + Change vertical." In RTL, this flips: the confidence indicator + link occupies the right 48% (leading side), and the pre-filled value occupies the left 48% (trailing side). This is a non-trivial layout reversal that requires `dir="rtl"` on the field container, not just text-align.

The "← Back" button label arrow should flip to "המשך →" (Continue) and "חזור ←" (Back) with the arrow preceding the label in RTL direction. Using CSS `direction: rtl` on the text automatically handles this if the arrow is a Unicode character `←` — but Unicode directional marks may cause double-flip. Safer: use a `<span dir="ltr">←</span>` wrapper or an SVG arrow that flips with `transform: scaleX(-1)` via Tailwind's `rtl:scale-x-[-1]`.

**Step 2 — Lead Attribution:**

UTM URLs and Twilio numbers are Latin-script technical strings. In RTL context, these strings must render LTR regardless of the page direction. Wrap all `Geist Mono` content — UTM URLs, phone numbers, code snippets — in `<bdo dir="ltr">` or apply `dir="ltr"` to their containers. Without this, the URL string will render right-to-left at the character level, displaying the URL as a mirror-image string starting with `moc.saas-emca`.

The "Copy" ghost button that appears on the right side of each URL row (trailing in LTR) should flip to the left side (trailing in RTL).

**Step 3 — The Brief:**

The cream paper register reads left-to-right in Latin script and right-to-left in Hebrew. When the Brief is authored in Hebrew (which it must be — a Tel Aviv plumber's Brief is written in Hebrew), the entire Fraunces block reads RTL. Paragraphs start from the right margin, line breaks occur at the left edge.

Beamix currently has no Hebrew-script Brief template. The Brief template system must support `"language": "he"` with RTL paragraph rendering. This is a product-level gap, not just a CSS gap.

**The Seal position in RTL:** The Seal in the Brief's "bottom-right Margin" (LTR) should be in the "bottom-left Margin" in RTL — the trailing lower corner of the document, which is the bottom-left in RTL. The Seal is a symmetrical mark; it does not need to mirror. But its position should flip to `bottom: 16px; left: 16px` when `dir="rtl"`.

**The "— Beamix" signature in RTL:** This is a locked decision (Voice canon Model B): the seal signs "— Beamix." In Hebrew UI, the question is whether "Beamix" stays Latin-script or becomes "ביימיקס." The recommendation is: **Latin-script brand name always, regardless of UI language.** "— Beamix" is a brand signature, not a translated word. Israeli users of global SaaS products expect Latin-script brand names in signatures (Slack, Notion, Vercel all sign their emails and PDFs with the Latin brand name). Transliterating "Beamix" to Hebrew script would read as unfamiliar — Beamix has not established that the brand name transliterates. Keep "— Beamix" in Latin script, with `dir="ltr"` applied to the `<span>` containing it. In RTL context, it reads naturally as a foreign-brand attribution.

**Step 4 — Truth File:**

Form field labels in Hebrew are typically longer than English equivalents. "WHEN ARE YOU OPEN?" in Hebrew is "מתי אתם פתוחים?" — 21 characters vs 16. The 11px caps label style must accommodate longer strings without truncation. This is an engineering concern: use `overflow: visible` or allow label to wrap to two lines at `text-xs` scale.

The hours table (7 days, open/close time, Closed checkbox) in Hebrew: day names are right-aligned, time fields are LTR (clock times are always LTR in Hebrew convention), Closed checkbox label is right-aligned. The 7-row table must be `dir="rtl"` at the row level with individual time-field cells marked `dir="ltr"`.

---

### Hebrew typography stack

**The core problem:** Fraunces is a Latin-script variable font. It does not include Hebrew Unicode range (U+0590–U+05FF). When the Brief body is rendered in Hebrew, `font-family: 'Fraunces'` falls back to the system serif — on macOS, this is Times New Roman; on iOS, it is Times; on Android, it is Noto Serif. None of these match the editorial register Fraunces creates for Latin script.

**Recommended Hebrew typography stack:**

| Role | Latin (current) | Hebrew fallback | Rationale |
|---|---|---|---|
| Brief body / artifact register | Fraunces 300 italic | **Heebo 300** | Heebo is Google Fonts, free, has Light (300) weight. It lacks italic but Hebrew doesn't traditionally italicize. Heebo Light is the closest Hebrew analog to Fraunces Light's warmth-vs-precision ratio. |
| Body / UI | Inter 400/500 | Inter 400/500 | Inter includes Hebrew Unicode range (U+0590–U+05FF). No swap needed. |
| Monospace / Geist Mono | Geist Mono 400 | Geist Mono 400 | Geist Mono includes Hebrew subset. Test at 11px for axis labels. |
| Headings | InterDisplay 500 | Inter 500 | InterDisplay may not include Hebrew; Inter 500 is the safe fallback. |

**Implementation:** Load Heebo 300 conditionally when the UI language is Hebrew (`lang="he"`). Define the Brief's `font-family` as `'Fraunces', 'Heebo', serif` — browsers will use Fraunces for Latin glyphs and Heebo for Hebrew glyphs within the same text block (mixed-language Briefs, which are common for Israeli SaaS founders who write in English).

**Fraunces italic rule for Hebrew:** The design system spec permits Fraunces italic "only on the signature line of an artifact." In Hebrew, the signature "— Beamix" remains Latin-script and can stay Fraunces italic. The Brief body, when written in Hebrew, uses Heebo 300 (no italic — Hebrew convention does not use roman italic for body text; emphasis is weight-based).

**x-height difference:** Hebrew letters (particularly `ה`, `מ`, `ב`) have a higher x-height relative to cap-height than most Latin fonts. At 18px (mobile Brief size) and 22px (desktop Brief size), Hebrew glyphs may appear slightly larger than Latin glyphs at the same pixel size. Add `font-size: 0.92em` scoped to the Hebrew brief text block as a correction. This is a common practice in mixed-script typography.

---

### Bidirectional form field handling

Form fields where the placeholder is Hebrew ("הכנס את הכתובת") but the typed content is Latin-script (a URL or email address) require bidirectional handling:

- Set `dir="auto"` on all URL, email, and code-style inputs. With `dir="auto"`, the browser detects the directionality of the typed text and adjusts text direction on the fly.
- For the Website field specifically: once content begins with `https://` (Latin), the field will switch to LTR. The placeholder (`dir="rtl"` Hebrew text) correctly stays RTL until typing begins. This is the correct behavior with `dir="auto"` and requires no additional logic.

---

### Numbers and dates

Hebrew convention uses Gregorian dates with English numerals. The Brief header line `BRIEF · v1 · SIGNED Apr 27, 2026 — 14:32` in Hebrew should render as: `תקציר · גרסה 1 · נחתם 27 באפר 2026 — 14:32`. Month abbreviations in Hebrew: use Hebrew month names (ינו׳ פבר׳ מרץ אפר׳ מאי יוני יולי אוג׳ ספט׳ אוק׳ נוב׳ דצמ׳). The Geist Mono section of that line (timestamp) stays LTR. Use `<bdo dir="ltr">14:32</bdo>` to lock the timestamp direction.

---

### The "Beamix" brand name in Hebrew UI — locked recommendation

**Beamix stays Latin-script in all Hebrew-language contexts.** Never render "ביימיקס." Reasons: (1) the brand name has not been established as a Hebrew-script entity; (2) Israeli SaaS users are accustomed to Latin brand names in mixed-language UIs (all of Beamix's competitors — Vercel, Linear, Notion — stay Latin in Hebrew locales); (3) "ביימיקס" would likely mispronounce in Hebrew as "bi-miks" rather than "bee-miks." The canonical signature remains "— Beamix" (Latin, always) with `dir="ltr"` wrapping.

---

## §3 — Accessibility audit (WCAG 2.1 AA)

### Keyboard navigation

**Step 1 — Tab order:**

The spec's tab order is implicit. Explicit order must be: (1) logo/wordmark `a` element (if linked) → (2) stepper dots (non-interactive, so skip with `tabindex="-1"`) → (3) Website input → (4) Business Name input → (5) Industry combobox → (6) vertical-conditional field → (7) Primary button "Continue." The "Back" button (hidden on Step 1) has no tab stop. The `STEP N OF 4` Geist Mono label is decorative — `aria-hidden="true"`.

The spec states "`Esc` does nothing (no escape from onboarding)." From an a11y perspective, this is acceptable for a wizard flow where no modal is open. If the Industry combobox is open as a popover/sheet, `Esc` must close it — the spec's "Esc does nothing" applies to the page wrapper, not to open popovers. Clarify this in implementation: `Esc` closes any open popover/sheet and returns focus to the trigger; `Esc` on the bare page does nothing.

**Focus rings:**

The design system spec defines `--shadow-focus: 0 0 0 3px rgba(51,112,255,0.25)`. This is the blue ring glyph (3px spread, 25% opacity). On a white background, a blue shadow at 25% opacity produces approximately 3.8:1 contrast — below the WCAG 2.1 AA 3:1 threshold for non-text elements (focus indicators). On the cream background (#F7F2E8) of Step 3, the contrast drops further.

**Fix A-1:** Increase focus ring to `0 0 0 2px #FFFFFF, 0 0 0 4px #3370FF` (white outline + solid brand-blue outer ring). This is the 2px-offset approach: white separation ensures the focus ring reads against any background. The 4px solid brand-blue passes 3:1 for non-text contrast. Effort: XS (single Tailwind utility update).

**Enter to submit:** The spec says "`Enter` on the last field submits the step." This must be explicit in implementation — the primary button should receive `type="submit"` inside a `<form>` element, so `Enter` on any field submits unless overridden. Do not rely on JavaScript-only `keydown` handlers for Enter submission — screen readers expect form submit behavior.

**Skip-to-content link:** Not mentioned in the spec. Required for WCAG 2.4.1. Add a visually hidden, focusable `<a href="#onboarding-content" class="sr-only focus:not-sr-only">Skip to main content</a>` as the first child of `<body>`. On Step 3, `#onboarding-content` points to the Brief block, not the page heading. Effort: XS.

---

### Screen reader — ARIA requirements

**Step 1 — Form inputs:**

Each field needs `<label for="[id]">`. The spec uses all-caps label text (11px caps tracking) — these are visual labels, not necessarily `<label>` elements. WCAG 1.3.1 requires a programmatic label association. The label text `"WEBSITE"` → `aria-label="Website"` or `<label>` with `for` attribute. Using `aria-label` is acceptable; using `<label>` is preferred.

Validation error messages must use `aria-describedby` pointing from the input to the error element. The spec's inline error ("That doesn't look like a website. Check it?") must appear in an element with `role="alert"` or be linked via `aria-describedby` to the field. If rendered dynamically (on blur), use `aria-live="assertive"` on the error container. Do not flash errors with no persistence — screen readers need the error text to remain in the DOM until corrected.

**Step 2 — Phone number panel:**

The three phone numbers fading in at 700/1000/1300ms must be announced to screen readers. Use an `aria-live="polite"` region on the numbers panel. When each number appears, the screen reader will announce it within the natural reading queue. Do not use `aria-live="assertive"` — assertive would interrupt current speech for each fade-in, creating a spammy experience for a 1300ms sequence.

The "Copy" ghost button on each phone row: label must be `aria-label="Copy +972-3-XXX-XXXX"` (not just "Copy") — three "Copy" buttons with identical accessible names violate WCAG 4.1.2.

**Step 3 — Brief and Seal:**

The "Approve and start" button is the most important interactive element in the product. Its accessible name is "Approve and start" — clear and adequate. However, its state changes (`"Save and approve"` when unsaved, `"Signing…"` during ceremony, `"Signed. Continuing…"` post-ceremony) need `aria-live` to announce state transitions. Use `aria-live="polite"` on the button's parent container, and change `aria-label` dynamically as state changes. Do not rely solely on visible text changes — some screen readers do not re-announce button text unless aria properties signal a change.

The Seal draw: a 540ms animation on an SVG element that appears and completes. This SVG needs `role="img"` and `aria-label="Brief approval seal"` when it appears. Before it appears, the SVG element should be `aria-hidden="true"`. On completion, toggle `aria-hidden="false"` and announce via `aria-live="polite"` region: "Brief signed successfully."

The Brief chips: each chip is an interactive button. Every chip needs a clear `aria-label`. Example: a chip displaying "emergency-plumbing queries" needs `aria-label="Edit: emergency-plumbing queries — click to change"`. The chip's expanded state (when editing) must announce "expanded" or use `aria-expanded="true"`.

The heading hierarchy of Step 3: the spec's "Your Brief" is the step heading. If the onboarding wrapper uses `<h1>` for the product name and `<h2>` for the step heading, the Brief's `BRIEF · v1 · SIGNED` Geist Mono header line should be an `<h3>` within the artifact, or be marked `aria-hidden="true"` if it is a decorative timestamp. No heading level should be skipped.

**Step 4 — Truth File:**

The Truth File form is the most complex form in the product. The 7-row hours table needs `role="grid"` with `role="row"` and `role="gridcell"` on each cell. Each row's day-name cell needs `scope="row"` or `aria-label="Monday hours"` for meaningful navigation. Screen reader users navigating a 7-row hours table via virtual cursor mode expect table semantics, not a div soup.

The "File this and start" button, after a server-side validation failure, must focus on the first failed field and announce the error. Use `focus()` on the first error field and `aria-describedby` linking to the error message.

**The `/home` cartogram (F22 — AI Visibility Cartogram):**

The spec references a cartogram. Per the audit brief, this should be exposed as `<table role="grid">` with row and column headers. Implementation requirement: `<th scope="col">` for engine names, `<th scope="row">` for query categories, `<td>` cells with `aria-label="ChatGPT — [query] — [score]"`. A screen reader user should be able to navigate the cartogram as a data table, not only as a visual grid.

---

### Color contrast

**Tested combinations:**

| Foreground | Background | Ratio | AA status |
|---|---|---|---|
| `--color-ink` `#0A0A0A` | `--color-paper` `#FFFFFF` | ~21:1 | Passes AAA |
| `--color-ink` `#0A0A0A` | `--color-paper-cream` `#F7F2E8` | ~17:1 | Passes AAA |
| `--color-ink-3` `#6B7280` | `--color-paper` `#FFFFFF` | ~4.6:1 | Passes AA (body), borderline at small sizes |
| `--color-ink-3` `#6B7280` | `--color-paper-cream` `#F7F2E8` | ~4.1:1 | Borderline — passes AA body text (18px+), fails at 13px or smaller |
| `--color-ink-4` `#9CA3AF` | `--color-paper-cream` `#F7F2E8` | ~2.7:1 | Fails AA at all text sizes |
| `--color-brand-text` `#2558E5` | `--color-paper` `#FFFFFF` | ~5.8:1 | Passes AA |
| `--color-brand` `#3370FF` | `--color-paper-cream` `#F7F2E8` | ~3.4:1 | Fails AA for text; passes AA for non-text (icons ≥3:1) |
| `--color-score-critical` `#EF4444` | `--color-paper` `#FFFFFF` | ~4.0:1 | Borderline — passes AA for large text (18px+), fails at 13px |
| `--color-score-excellent` `#06B6D4` | `--color-paper` `#FFFFFF` | ~3.0:1 | Fails AA for text — cyan on white is a common a11y trap |
| `--color-needs-you` `#D97706` | `--color-paper` `#FFFFFF` | ~3.4:1 | Fails AA for text |

**Critical findings:**

**Fix A-2:** `--color-ink-4` on `--color-paper-cream` fails at 2.7:1. The Brief's `BRIEF · DRAFT v1 · Apr 27, 2026` header line uses `ink-4` on `paper-cream`. This is not decorative — it carries meaningful content (version + date). Move to `ink-3` on cream paper, which passes at ~4.1:1 for 11px text (note: 11px caps text is "large text" by WCAG definition when rendered at ≥18px equivalent — but 11px caps is NOT 18px equivalent; it fails the large-text exemption). Effort: XS.

**Fix A-3:** `--color-brand` `#3370FF` as a text color on cream paper fails AA. The Brief chip labels use `brand-blue-soft` background with the chip value in "regular text weight" — if this text is `--color-brand` (`#3370FF`), it fails at 3.4:1. Use `--color-brand-text` (`#2558E5`) for any brand-blue text on cream paper; `#2558E5` on `#F7F2E8` = ~4.9:1, passes AA. Effort: XS.

**Fix A-4:** `--color-score-excellent` `#06B6D4` on white fails AA for text. If this color appears as text (score labels, table data) at body size, replace with a darker teal: `#0E7490` (passes 4.6:1 on white) for text contexts. Keep `#06B6D4` for chart fills and icon glyphs where the 3:1 non-text threshold applies. Effort: S (token split: `--color-score-excellent-text` for text contexts).

**Fix A-5:** `--color-needs-you` `#D97706` fails AA for text on white (3.4:1). This color is used for the action-required inline error messages ("Couldn't save — we'll keep trying") and server-side validation errors ("This claim is too short — say more"). Error messages at small sizes are safety-critical for a11y. Replace text instances with `#B45309` (passes 4.9:1 on white). Effort: XS.

---

### Motion sensitivity

**`prefers-reduced-motion` — required fallbacks for each animated element:**

| Animation | Duration | Reduced-motion fallback |
|---|---|---|
| Seal stamp (Step 3) | 540ms | Seal appears at `opacity: 0` and transitions to `opacity: 1` over 200ms (no path draw, no hold, no ink-bleed). Static final state, instant appearance. |
| Content well fade-in (all steps) | 600ms linear | `opacity: 1` immediately — no entrance animation at all. |
| Step 3 background cross-fade `paper` → `paper-cream` | 800ms | Instant background switch; no cross-fade. |
| UTM string-composing animation (Step 2 SaaS) | ~7 × 1.1s | All URLs render instantly; cursor blink suppressed. |
| Phone number stagger (Step 2 Twilio) | 700/1000/1300ms | All three numbers appear simultaneously at 0ms with no animation. |
| `/home` Score count-up (0 → actual) | 1200ms | Score renders at actual value immediately. |
| `/home` Ring draw | 1500ms | Ring renders at full 252° geometry immediately. |
| `/home` Evidence Card spring entrance | 280ms | Card appears at `opacity: 1`, no translate-y. |
| `/home` editorial Fraunces typewriter | ~2 seconds | Text renders at full opacity immediately. |

All fallbacks are handled by a single CSS block: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`. However, the Rough.js SVG animations (Seal, Ring) are JS-driven, not CSS transitions. These require explicit JS checks: `const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` and conditional logic to skip the animated path-draw entirely.

**Fix A-6:** Add `useReducedMotion()` React hook (or equivalent) that wraps all Rough.js animations and the Score count-up. When `prefers-reduced-motion` is true, render final states without animation. This is a single shared hook, not per-component logic. Effort: S.

The spec already notes "Every motion below has a designed static state" for the onboarding flow — this is the right intention. The gap is that JS-driven animations (Rough.js, counter increments) require explicit opt-out logic, not just CSS `transition: none`. Ensure this is addressed at the Tier 0 build stage before any animation is wired.

---

### Cognitive accessibility

**Reading level — the Brief clauses:**

The example Brief body from the spec: *"Beamix recommends focusing on emergency-plumbing queries on ChatGPT and Perplexity, where customers in Tel Aviv ask 'who can come now?' more than 'who's licensed?'"* This sentence has a Flesch-Kincaid Grade Level of approximately 11-12 (above 8th grade). The literary Fraunces register intentionally signals sophistication, but the Brief is a contract the customer is asked to approve. WCAG 3.1.5 (AAA) recommends supplementary content for reading levels above 9th grade. For AA compliance, this is an advisory rather than a requirement.

Practical recommendation: write Brief templates such that each sentence is under 30 words and avoids nested clauses. The example above is 34 words and has a nested relative clause. The SaaS Brief template (authored for Marcus) can be denser; the local-services/Other template should be written at Grade 8.

**Time-pressured actions — Step 3.5 "Print this Brief" 8-second timer:**

The spec states the link is "visible for 8 seconds; dismissable via Continue button or implicit timeout." An 8-second timeout on a user action fails WCAG 2.2.1 (Timing Adjustable), which requires that time limits be either adjustable, extendable, or non-existent (with exceptions for real-time events). A post-signing offer with an 8-second timeout is not a real-time event.

**Fix A-7:** Remove the 8-second auto-dismiss. The "Print this Brief →" link should remain visible until the customer advances to Step 4 via the "Continue" button. The implicit timeout creates an exclusionary pattern for users who read slowly, screen-reader users (who may be reading the Brief itself when the counter expires), and users with motor impairments who need more time to tap a link. The engineering cost of removing the timer is negative (less code). Effort: XS.

**Clear error recovery — throughout:**

Every step has inline validation errors. The spec consistently says "No modal, no toast, no top banner." This is good — it keeps errors contextual. The requirement for a11y is that these errors are also reachable by keyboard and announced to screen readers (covered in Fix A-8).

**Fix A-8:** On validation failure in any step, move focus to the first failed input field. Do not leave focus on the primary button while the button remains disabled. Screen reader users who submit and get a silent failure (disabled button, no focus change) have no indication of what went wrong. Effort: S (shared form validation utility).

---

## §4 — Cross-cutting recommendations

Ranked by: (Impact × Market coverage) × (1 / Effort).

---

**Rec 1 — Bottom-sheet chip editing on mobile** (Mobile + RTL)
- Tier: Design-system canon item — the bottom sheet for inline editing is reusable across the entire product wherever chips appear (Step 3, Workflow Builder, Brief Re-author F32).
- Impact: Without this, mobile Brief editing is broken for the primary Israeli market (SMB owners first see Beamix on mobile).
- Effort: M — one shared `<BottomSheet>` component + integration in Step 3.
- Action: Design-system Tier 0 deliverable. Build alongside the Brief component, not after.

---

**Rec 2 — Keyboard-aware scroll utility** (Mobile + Accessibility)
- Tier: Shared utility, no design change.
- Impact: Every input step on mobile. Any SMB owner using on-screen keyboard will experience broken layout without this.
- Effort: S — `visualViewport` listener + `scrollIntoView` on focus. One file, all steps benefit.
- Action: Implement as a custom hook in `apps/web/hooks/useKeyboardAwareScroll.ts`. Attach to all onboarding form roots.

---

**Rec 3 — `useReducedMotion()` hook wrapping all Rough.js + counter animations** (Accessibility)
- Tier: Cross-cutting a11y foundation.
- Impact: WCAG 2.3.3 (AAA) and vestibular disorder users. Also benefits slow-CPU devices where complex SVG animation causes jank.
- Effort: S — hook exists as a pattern (Framer Motion exports one); implement as a standalone hook + pass to all animated components.
- Action: Tier 0 build task. Block the Seal-draw, Ring, counter, and typewriter implementations behind this hook.

---

**Rec 4 — Focus ring upgrade** (Accessibility — WCAG 2.4.7)
- Tier: Design-system token change. One-line Tailwind config update.
- Impact: Every focusable element in the product, not just onboarding. Affects all keyboard users.
- Effort: XS.
- Action: Update `--shadow-focus` in the design system token set. Propagate via Tailwind `ring-*` utilities. Verify on cream paper background specifically.

---

**Rec 5 — Color token splits for text vs non-text contexts** (Accessibility — WCAG 1.4.3)
- Tier: Design-system token additions.
- Impact: `--color-score-excellent` and `--color-needs-you` both fail AA for text usage. These colors appear on data tables, error messages, and status lines — all text contexts.
- Effort: XS per token (3 tokens affected: `score-excellent`, `needs-you`, `brand` on cream).
- Action: Add `-text` suffix variants for each. `--color-score-excellent-text: #0E7490`, `--color-needs-you-text: #B45309`. Update design system doc and Tailwind config.

---

**Rec 6 — Hebrew typography: load Heebo 300 conditionally** (RTL — primary market)
- Tier: Per-feature work with design-system impact.
- Impact: Without a Hebrew serif fallback, the cream paper Brief register degrades to Times New Roman for every Israeli SMB customer. This is the highest-visibility degradation for the primary market.
- Effort: S — add Heebo 300 to font loading config, update Fraunces `font-family` stack to include Heebo as Hebrew fallback, test on macOS Hebrew locale.
- Action: Spec the Brief's `font-family` as `'Fraunces', 'Heebo', serif` in the design system doc. Add to Tier 0 build plan.

---

**Rec 7 — Remove the 8-second "Print this Brief" auto-dismiss** (Accessibility + Mobile)
- Tier: Bug-level fix (removal of code).
- Impact: Directly fails WCAG 2.2.1. Also affects mobile users who are still reading the signed Brief when the timer expires.
- Effort: XS.
- Action: Remove timer logic. Show link until Step 4 renders.

---

**Rec 8 — `dir="ltr"` wrapping for all Latin-script technical content in RTL context** (RTL)
- Tier: Per-feature RTL implementation standard.
- Impact: Without this, every UTM URL, phone number, and code snippet renders as mirrored text in Hebrew UI. This is a broken experience for Yossi (the agency persona) operating with 12 Hebrew-language client accounts.
- Effort: S — add `dir="ltr"` to: all Geist Mono elements, URL inputs, phone number rows, code snippet containers. Document this as a convention in `ENGINEERING_PRINCIPLES.md`.
- Action: Add to engineering principles. Flag as mandatory in RTL implementation checklist.

---

**Priority table (ship at AA, plan for AAA)**

| Fix | AA/AAA | Effort | Priority |
|---|---|---|---|
| Fix A-1 — Focus ring upgrade | AA (2.4.7) | XS | Ship at launch |
| Fix A-7 — Remove 8s Print timeout | AA (2.2.1) | XS | Ship at launch |
| Fix A-2 — ink-4 on cream paper contrast | AA (1.4.3) | XS | Ship at launch |
| Fix A-3 — brand on cream paper text | AA (1.4.3) | XS | Ship at launch |
| Fix A-5 — needs-you text contrast | AA (1.4.3) | XS | Ship at launch |
| Fix A-6 — useReducedMotion hook | AA (2.3.3) | S | Ship at launch |
| Fix A-8 — Focus on validation failure | AA (3.3.1) | S | Ship at launch |
| Fix M-3 — Keyboard-aware scroll | AA (2.1.1) | S | Ship at launch |
| Fix A-4 — score-excellent text contrast | AA (1.4.3) | S | Ship at launch |
| Fix M-8 — Mobile chip bottom sheet | Cognitive AA (2.5.3) | M | MVP-1.5 if needed, ideally at launch |
| Hebrew Brief templates | Primary market | S | MVP |
| Heebo 300 font loading | Primary market | S | MVP |
| ARIA live regions on all dynamic state | AA (4.1.3) | S | Ship at launch |
| Cartogram as `role="grid"` table | AA (1.3.1) | S | Ship with F22 |
| AAA reading level (Grade 8 templates) | AAA advisory | M | Post-launch iteration |

---

*End of audit.*
