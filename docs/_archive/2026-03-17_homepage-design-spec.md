# Homepage Design Specification
*Beamix GEO Platform — homepage-design-spec.md*
*Last updated: 2026-03-13*

---

## Overview

This document describes the visual design, layout, copy, and interaction behavior of the Beamix homepage. It is the authoritative reference for designers and frontend developers building this page.

---

## Developer Build Instructions

### Image Placeholders
All sections in this spec include images, screenshots, and videos marked as *"asset to be supplied."* During initial build, every image or video slot must be replaced with a **gray placeholder frame** — a `div` or `figure` with:
- Background: `#D9D9D9` (light gray)
- Dimensions matching the intended image ratio (e.g. 16:9 for video, 4:3 for dashboards, 1:1 for grid cells)
- Optional centered label in muted text indicating what goes there (e.g. `"Dashboard Screenshot — Scan Results"`)
- No broken `<img>` tags, no empty `src` attributes

This ensures the layout, spacing, and animations are fully functional and reviewable before final assets arrive.

### Animation Library
The scroll-driven sections (4 and 5) require a production-grade animation library. **Recommended: GSAP + ScrollTrigger** (industry standard for scroll-pinned, scrubbed animations). Framer Motion is acceptable for section-level entrance animations but insufficient for the scroll-pinned sequences.

### Copy Placeholders
All copy marked as *(TBD)* should use realistic placeholder text — not "Lorem ipsum." Use the described content intent (e.g. a fake dashboard label, a plausible stat) so the layout reads correctly during review.

---

## Section 1: Navigation Bar

A minimal, modern sticky navbar spanning the full viewport width.

- **Left:** Beamix logo (wordmark + icon)
- **Center:** Primary navigation links — *How It Works*, *Why Beamix*, *Pricing*, *Blog*
- **Right:** Two CTAs — a ghost/text "Log In" button and a filled "Request a Demo" button (primary accent color: #023c65)
- Background: transparent on load, transitions to frosted/solid white on scroll
- Height: ~68px, with a clean bottom divider or subtle shadow

**Sticky CTA behavior (scroll-triggered):**
Once the hero URL input field exits the viewport (user has scrolled past the hero), the navbar right-side CTA transitions:
- "Request a Demo" → "Scan your site →"
- Transition: smooth crossfade, ~200ms
- Clicking "Scan your site →" anchor-scrolls back to the hero URL input
- Reverts to "Request a Demo" if the user scrolls back up to the hero

**Threshold:** Uses IntersectionObserver. Swaps to 'Scan your site →' when the hero URL input is LESS THAN 20% visible in the viewport. Reverts to 'Request a Demo' when the hero input is MORE THAN 20% visible. This prevents flickering at the boundary.

---

## Section 2: Hero

**Layout:** Two-column asymmetric layout. Left column contains all primary content (~65% viewport width). Right column is a passive social-proof strip (~30% width), vertically centered. Left column has left-alignment with a comfortable margin from the viewport edge — not flush to the left.

---

### 2.1 Page Load Animation

On initial load, the entire hero content enters with a **blur-to-sharp** transition — content starts slightly out of focus and resolves to crisp over ~600–800ms. Motion is smooth and organic, not jarring. No hard cuts or bounces.

---

### 2.2 Main Headline

Montserrat ExtraBold (800), 75px, line-height 70px. All caps. Arranged across 3 lines:

```
CUSTOMERS ASK AI.
[AI LOGO] AI DOESN'T KNOW
YOU EXIST.
```

**Inline AI Logo Square:**
On line 2, at the very start of the line before "AI DOESN'T KNOW", there is a **square container with rounded corners (~12px radius)** that cycles through rotating logos of AI platforms (ChatGPT, Gemini, Perplexity, Claude, Grok, etc.). The square is sized to match the cap height of the display font so it sits naturally inline with the text.

**Logo rotation animation — Slot Machine mechanic:**
The current logo slides *upward* and exits the frame; the next logo enters from below. A vertical slot-machine transition. Each logo is displayed for ~3 seconds, transition duration ~300ms ease-in-out. The motion is subtle and non-distracting.

---

### 2.3 Sub-headline

```
We scan, diagnose, and optimize your AI search presence so customers find you first.
```

- One line (wraps naturally at narrow viewports), positioned directly below the headline with ~16–20px spacing
- Font: ~18–20px, regular or medium weight (not bold)
- Color: muted (#78716C)
- Width: matches the headline block, does not extend to full viewport

---

### 2.4 URL Input Field

A single, self-contained input bar — shorter than the text block above it (~60–65% of headline width), on its own line below the sub-headline. **Rounded corners (~10–12px)**, border: `1px solid #E7E5E4` (Input Border token), white background.

**Left side:** Placeholder text in light gray styled like a real URL — e.g. `yourwebsite.com`. Input type: text, no visible label.

**Right side (inside the input bar):** A compact **"Scan Now"** CTA button with a small Beamix logo icon to its left.

- On hover over the button, the Beamix logo icon plays a **rotation/spin animation** in place (~360° smooth loop, ~600ms)
- Button background: primary accent color (#023c65), white text
- Button border radius: 8px (utility button style — NOT 12px landing CTA)
- Spacing between sub-headline and input: ~24–32px

---

### 2.5 Right Column — Logo Trust 

A vertical or staggered strip of **client/partner company logos** — rendered as thin wordmarks, possibly accompanied by a small brand icon. Displayed in a soft, muted style. Logo treatment: `filter: grayscale(1); opacity: 0.6;` — muted, not branded colors. On hover: `opacity: 0.85`, `200ms ease-out`.

Optional small eyebrow label above the strip: *"Trusted by teams at"* — very small, light typeface, muted color.

---

## Section 3: Product Demo Video

**Purpose:** Immediate product proof with atmospheric brand presence. The user sees Beamix in action before reading another word.

**Layout:**
- The video player does **not** span edge-to-edge. It is centered with horizontal padding, at roughly 85–90% of viewport width.
- It floats over a full-bleed **background image** — an atmospheric color-graded or architectural environment image (supplied separately) that bleeds to full viewport width.
- Aspect ratio: 16:9. Border radius: 12px. Drop shadow: `0 4px 24px rgba(0,0,0,0.10)` (lighter than standard card shadow — video floats, not sits).

**Video content:**
A product demo / explainer video showing Beamix in full flow — scan, results, agents, recommendations. *(Asset to be supplied.)*

**Playback behavior:**
- Autoplays on load: muted, looping — no user interaction required
- Optional: play/pause control appears on hover
- No autoplay audio — video is silent or has ambient sound only

**Autoplay fallback:** If autoplay is blocked (mobile, low-power mode, user preference), display the video poster frame (first frame of video, or a supplied static image). A centered play button appears over the poster. On click/tap, video plays inline.

**Scroll animation:**
As the user scrolls down from the hero, the video section enters with a **subtle upward reveal** — fade-in combined with a translate-y from ~20px → 0, triggered when the section enters the viewport (~200ms delay, 500ms duration, ease-out).

---

---

## Section 4: Scroll-Driven Storytelling — "The Problem & The Solution"

> **Asset note:** All product screenshots and background images for this section will be supplied separately. No UI mockups need to be generated.

This is a single, continuous **scroll-driven narrative sequence** — one unified experience that begins with the problem (a user invisible on AI) and ends with the solution (Beamix doing the work). There is no visual break between Part A and Part B; they share the same scroll context and motion language.

**Global animation rules for this section:**
- All elements **exit upward** as the user scrolls past them
- All elements **enter from below** as the user scrolls into them — standard upward fade (translate-y + opacity)
- Scroll is pinned / scrubbed — animations are tied directly to scroll position, not time-based triggers
- Typewriter animations (where specified) are smooth and fast — exponential ease, feels alive not mechanical

**blur-to-sharp is used in EXACTLY these 4 moments, and nowhere else:**
1. Section 4.1 header — *"Right now, someone is asking ChatGPT about a business like yours."*
2. Section 4.2 Step 3 — Only the final sentence: *"They never see your name."* (the other 2 problem sentences enter via standard upward fade)
3. Section 5.6 header — *"Now let's see what changed."*
4. Section 5.8 closing — *"Scan. Diagnose. Fix. Repeat."*

All other text in sections 4–5 uses standard upward fade only.

---

### 4.1 Section Header

Full-width, centered, large display text. Appears as the section enters the viewport via blur-to-sharp:

> *"Right now, someone is asking ChatGPT about a business like yours."*

This line sets the stage for everything that follows. Type: Montserrat ExtraBold (800), 52px, line-height 1.1. Color: `#000000`. After it resolves, the scroll continues into Part A.

---

### 4.2 Part A — The Problem

**A single continuous scroll sequence showing how a competitor is winning in AI search.**

---

#### Step 1: The ChatGPT Prompt

A rendered UI component styled as a ChatGPT conversation interface (dark background — background color: `#1E1E1E` (dark surface, not pure black) — familiar layout — not a screenshot, a coded component).

The input field animates with a **typewriter effect** — characters appear one by one, fast, with a slight exponential acceleration:

> `How can I eat healthy when I don't have time to cook?`

- The typing animation is smooth and cinematic — not robotic
- After the text completes, a beat of ~500ms pause
- Then the send button animates as pressed (subtle press-down effect)
- Then a brief "thinking" state (3 animated dots or similar)

---

#### Step 2: ChatGPT's Response

The response appears — a bulleted list of 5 businesses that offer healthy meal solutions. Each list item types in quickly, one after another. Each item types at approximately 60ms per character. The 80ms stagger delay begins from the END of the previous item's typing animation (not from its start). Total sequence for all 5 items: varies by character count, approximately 3–5 seconds.

The list reads approximately:
1. Factor – Delivers fully prepared healthy meals...
2. Sunbasket – Provides healthy meal kits...
3. Blue Apron – Sends ingredients and simple recipes...
4. Trifecta Nutrition – Offers ready-made healthy meals...
5. **[Competitor Business]** – *item 5*

---

#### Step 3: Zoom on Position 5

As the user continues scrolling, the viewport **zooms in** on the 5th item in the list — it fills more of the screen, the other items fade or blur out.

Below the ChatGPT component, the following text appears one sentence at a time, staggered as the user scrolls. No bullets — plain text, left-aligned or centered, impactful weight.

> *"Your competitor is getting the recommendation 1st. You're 5th."*
> *"This is happening in your industry. Every day. With your customers."*

Sentences 1–2 enter via standard upward fade (translate-y + opacity, 400ms ease-out). Sentence 3 ('They never see your name.') enters via blur-to-sharp.

> *"They never see your name."*

---

### 4.3 Transition: Problem → Solution

As the user scrolls past the last line of Part A, the Beamix URL input field from the hero reappears in context — **same component, now mid-page**, pre-filled or empty. The user watches (as a demonstration) the URL being typed in via typewriter animation:

> `yourbusiness.com`

The **"Scan Now" button** animates as clicked.

**Logo transition animation:**
1. The Beamix logo icon on the button begins to **spin**
2. It simultaneously **scales up** slightly
3. It then **detaches** from the button, drifts to the **horizontal and vertical center of the screen**, continuing to spin
4. It **accelerates upward**, exits the top of the viewport
5. The screen is momentarily clear — a clean frame wipe

This transition acts as a cinematic cut between the problem and the solution.

**Mobile fallback (< 768px):** The logo does not drift to screen center. Instead: on button tap, the logo icon scales to 1.5× in place, then fades out (opacity → 0) over 800ms ease-in. The transition into the scan sequence proceeds immediately after. No drift or cross-screen motion on mobile.

---

### 4.4 Part B — The Solution (Beamix at Work)

**A working/loading moment followed by three alternating dashboard screens.**

---

#### Step 1: Scan in Progress

After the logo exits upward, a brief **"system working" state** is shown:
- Abstract motion elements (pulsing rings, a progress signal, or scanning line animation)
- Conveys that the Beamix engine is running across AI platforms
- Duration tied to scroll distance — not a time-based wait
- Minimal, clean — no heavy UI, just motion suggesting computation

---

#### Step 2: Dashboard Screen 1 — Overview / Scan Results

**Layout:** Dashboard image on the **left** (~55% width). Text block + CTA button on the **right** (~35% width), vertically centered.

**Scroll entrance:** The dashboard image enters **small (from below)**, scales up to its final size as the user scrolls — a smooth zoom-from-small reveal tied directly to scroll position.

**Text (right side):** 1–3 words maximum. Short label copy, describing what this screen shows — e.g.:
> *"Your full picture."*
> *(or similar — TBD, to be finalized with copy pass)*

**CTA button:** "Learn More →" — appears below the text label, primary accent color.

**Image:** Product screenshot — Overview / Scan Results dashboard. *(Asset to be supplied.)*

---

#### Step 3: Dashboard Screen 2 — Rankings by AI Engine

**Layout:** Dashboard image on the **right** (~55% width). Text block on the **left** (~35% width), vertically centered. **No CTA button on this screen.**

**Scroll entrance:** Same scroll-scrubbed scale-up reveal as Screen 1, entering from below.

**Text (left side):** 1–3 words maximum.
> *(Copy TBD)*

**Image:** Product screenshot — Rankings by AI Engine view. *(Asset to be supplied.)*

---

#### Step 4: Dashboard Screen 3 — Agent Recommendations

**Layout:** Dashboard image on the **left** (~55% width). Text block on the **right** (~35% width), vertically centered. **No CTA button on this screen.**

**Scroll entrance:** Same scroll-scrubbed reveal, consistent with the pattern above.

**Text (right side):** 1–3 words maximum.
> *(Copy TBD)*

**Image:** Product screenshot — Agent Recommendations view. *(Asset to be supplied.)*

---

---

## Section 5: AI Agents — "The Work Gets Done"

> **Asset note:** All images in this section (agents hub graphic, 3×3 grid images, agent card icons) will be supplied separately.

This section is a **direct continuation** of the scroll narrative from Section 4. No visual break — same scroll context, same motion language (blur-to-sharp text, elements enter from below / exit upward).

---

### 5.1 Agents Hub Intro

**Layout:** Two-column. Graphic element on the **right** (~50% width). Text block + CTA button on the **left** (~40% width), vertically centered.

**Left side:**
- Short label text (1–3 words or a brief headline describing the agents hub — copy TBD)
- "Learn More →" CTA button below the text, primary accent color (#023c65)

**Right side:**
- A graphic / visual element representing the Agents Hub — showing agents activating and working. *(Asset to be supplied — likely an animated or static illustration of the agents hub UI.)*

**Scroll entrance:** Both sides enter via a standard upward fade as the user scrolls into this subsection.

---

### 5.2 Section Header — Agent Grid

A centered headline, full-width, appearing above the 3×3 grid via standard upward fade:

> *(Copy TBD — something conveying that Beamix deploys its agents to do the work for you)*

---

### 5.3 Agent Grid — 3×3 Parallax

A 3-column, 3-row grid of agent type images. All 3 columns are **visible simultaneously** on screen.

**Parallax behavior (scroll-pinned effect):**
- **Left column:** scrolls **upward** as the user scrolls down — moves counter to scroll direction
- **Right column:** scrolls **upward** as the user scrolls down — mirrors the left column
- **Middle column:** appears **stationary** (pinned in place relative to scroll) while the outer columns move

Parallax coefficients: Left column moves at 0.4× scroll velocity (counter to scroll direction). Right column mirrors left at 0.4×. Middle column is stationary at 0× (normal page scroll rate — does not move relative to scroll). Result: outer columns appear to drift upward as user scrolls down.

This creates a visual effect where the outer columns rise and the center column holds still, drawing focus to the middle.

**Grid contents:** 9 cells total (3 columns × 3 rows). The grid is a mix of two types:

- **Image cells (6–7):** Each contains a supplied image representing a specific agent type. *(Assets to be supplied.)*
- **Stat cards (2–3):** Spread across different rows/columns (exact positions TBD). Each stat card has:
  - Background: brand gradient (supplied by client)
  - Content: 1 large bold number + 1–2 word label in white
  - Examples: *"16 Agents Working"*, *"7 AI Engines"*, *"+340% Visibility"*
  - These add color, brand identity, and proof points directly within the grid

---

### 5.4 Center Card Expansion → Full-Screen Agents

As scrolling continues, the **center card of the middle column** (row 2, column 2 — the geometric center of the grid) begins to **scale up**. The expansion is tied directly to scroll position — smooth, continuous zoom from its grid size to **full viewport coverage**.

Expansion scroll distance: 800px. The center card zooms from grid size to full viewport coverage over exactly 800px of user scroll. Animation is tied directly to scroll position via a CSS scroll-driven animation or JS progress tracker (0–1 mapped to grid size → full viewport).

Once it fills the screen, the grid disappears and the full-screen state begins.

---

### 5.5 Full-Screen: Agents Completing

**Background:** Plain site background (#FAFAF9) — clean, no imagery.

**Content:** A vertically scrolling feed of **16 agent cards**, each rendered as a rounded-corner rectangle. Drop shadow: `0 1px 4px rgba(0,0,0,0.08)` (lighter than standard card shadow). Each card contains:
- Agent icon (left)
- Agent name (center/left) — Montserrat Medium (500), 13px, color `#000000`
- Checkmark indicator (right) — 16px, color `#023c65` (brand navy) — appears when the agent completes

**Animation — scroll-driven feed:**
1. Agent cards enter **from below**, rise upward into position one by one as the user scrolls
2. As each card settles, its **checkmark (✓) animates in** — a clean, satisfying tick
3. The feed continues rising as more agents complete — earlier cards scroll off the top
4. This continues until all **16 agents** have shown their checkmark
5. The screen remains pinned / locked during this sequence — the feed motion IS the scroll

Scroll-lock distance: 1,200px. The 16 agent cards animate in over 1,200px of scroll while the viewport is pinned. Each card occupies approximately 75px of scroll distance. Release condition: after card #16 receives its checkmark, the section unpins after an additional 200px buffer.

**Agent names and icons:** *(To be supplied by client — 16 total)*

---

### 5.6 Transition Header — "Now let's see what changed."

After all 16 agents complete, the feed exits upward and a centered, large heading appears via blur-to-sharp:

> *"Now let's see what changed."*

Type: Montserrat ExtraBold (800), 52px, line-height 1.1. Color: `#000000`.

This line acts as a narrative reset — signaling to the user that we're about to return to the AI engine to verify the results.

---

### 5.7 The Result — Back to ChatGPT

The same ChatGPT UI component from Section 4.2 reappears (background color: `#1E1E1E` — dark surface, not pure black). The same question types in via typewriter:

> `How can I eat healthy when I don't have time to cook?`

Same send animation. Same brief thinking state.

**The response appears — but this time it's different.**

The list of 5 businesses displays, and then:

**Stack reorder animation:**
- The user's business (previously at position 5) animates upward to **position 1**
- As it rises, the other 4 businesses **slide downward** to accommodate it
- Motion feels like a physical stack reorder — smooth, purposeful, ~400ms ease-out
- The user's business name **highlights** at position 1 (subtle emphasis — bold or accent color)

This is the payoff moment of the entire scroll narrative.

---

### 5.8 Closing Summary

A final centered section appears below the ChatGPT result, via blur-to-sharp:

A short, impactful summary of the full cycle the user just witnessed — structured as the 4-step Beamix process:

> **Scan. Diagnose. Fix. Repeat.**

Supporting line (1 sentence, muted color, smaller type) — *(copy TBD — summarizing that this cycle runs automatically and continuously for your business)*

Optional CTA below: "Start your free scan →" — primary accent button.

---

---

> **Messaging note (critical for Section 5 copy):** The agents do the work *for* the business owner — they write, fix, optimize, and improve on behalf of the user. This is the core value proposition for the SMB audience, who lack the time and staff to handle GEO optimization manually. All copy in Section 5 (agent grid header, closing summary, card labels) must reinforce this: *you don't do anything — Beamix handles it.*

---

*Next sections: Quote/Brand, Pricing, Integrations, Footer.*

---

## Section 6: Quote / Brand Moment

> **Design note:** This section is the approved exception to the general "no decorative background gradients" rule. The full-bleed gradient background is intentional here — it functions as a brand identity moment and emotional pause after the product narrative.

A full-bleed atmospheric section. The background is a **gradient image** in Beamix brand colors — supplied separately. This is a visual and emotional pause after the product narrative.

**Grain texture scope:** Applied ONLY on top of gradient backgrounds (Section 6 Quote Moment and any full-bleed brand gradient sections). NOT applied to white page sections, card surfaces, or the Section 4/5 scroll narrative (which uses white/neutral backgrounds). Rule: grain = gradient sections only.

**Grid lines scope:** Used on ONE section maximum per page. On the homepage, if used, apply to Section 6 (Quote Moment gradient). Disabled on Section 9 (photographic background).

**Layout:**
- Background: full-width, full-height gradient image (asset TBD — brand color palette gradient)
- Content is overlaid on top of the image

**Top-left:** A small eyebrow label or section tag — e.g. *"What we believe"* or a brand identifier. Small, light typeface.

**Center / primary content:** A single, prominent quote — large display type, white or light text against the gradient background.
> *(Quote TBD — either Beamix brand slogan or a statement from the founding team)*

**Bottom or below the quote:** A single CTA button:
> *"See the plans →"* — anchor-scrolls to Section 7 (Pricing) on the same page. Keeps the user in the conversion funnel.

**Scroll entrance:** The entire section enters as a standard upward reveal. No scroll-pin. Clean fade-in as the user arrives at this section.

---

## Section 7: Pricing

**Section header (centered):**
> *"Simple, transparent pricing."*

Smaller supporting line below (muted color, regular weight) — *(copy TBD)*

---

### 7.1 Monthly / Annual Toggle

A pill-style toggle switch positioned below the section header, center-aligned.

- Two states: **Monthly** / **Annual**
- Annual pricing is **33% cheaper** than monthly
- Monthly prices: $49 / $149 / $349
- Annual prices (per month, billed annually): $39 / $119 / $279
- Price transition: 300ms ease-out. Numbers fade out at `opacity: 0` (`150ms`), then new numbers fade in (`150ms`). No layout shift — all price containers are fixed-height.

---

### 7.2 Pricing Cards — Entrance Animation

Three pricing cards arranged in a horizontal row. All three animate in **simultaneously** when the section enters the viewport:

- **Left card (Starter — $49/mo):** slides in from the **left** edge of the screen, moves right to its position
- **Center card (Pro — $149/mo):** drops in from **above**, moves down to its position. This is the **recommended plan** — outlined with a thin dark navy border (#023c65)
- **Right card (Business — $349/mo):** slides in from the **right** edge of the screen, moves left to its position

All three land simultaneously. Motion: ease-out, ~500ms.

---

### 7.3 Card Contents

Each card is a rounded-corner rectangle, white background, minimal style. Shadow: `0 2px 8px rgba(0,0,0,0.08)` base. On hover: `0 12px 32px rgba(0,0,0,0.12)` with slight upward translate (`translateY(-2px)`). Transition: 200ms ease-out.

**Structure per card:**
- Plan name (e.g. *Starter*, *Pro*, *Business*)
- Price — large, bold display number. Monthly unit shown below (e.g. *per month*)
- Annual note when toggle is on annual (e.g. *"billed annually"*)
- Feature list — minimalist bullet points. *(Content TBD — to be supplied)*
- CTA button at bottom — *"Get started"* or *"Start free trial"*

**Center card (Pro) additional treatment:**
- Thin dark navy border (#023c65) around the entire card
- Optional "Most Popular" or "Recommended" badge — small, top of card, navy background white text

---

### 7.4 FAQ — Minimalist Accordion

Positioned below the pricing cards. A clean, focused FAQ that reduces pre-purchase friction.

**Layout:** Centered, max-width ~720px. No card border or background — plain white, flush with page.

**Style:** Each item is separated by a thin horizontal divider line. Question text is medium-weight, answer text is muted regular weight. Chevron icon (→ / ↓) on the right indicates open/closed state.

**Behavior:** Single accordion — opening one item closes the previous. Smooth height animation on open/close.

**Questions:** 5–7 items. *(Content TBD — to be supplied. Topics likely include: how the free scan works, what AI engines are covered, how agents make changes, pricing and billing, trial details.)*

---

## Section 8: Integrations & AI Engines Marquee

A horizontal scrolling section displaying partner companies, AI engines scanned, and integration partners.

**Layout:** Two rows of logo cards, stacked vertically.

**Each card contains:**
- Circular company logo (left)
- Company name (bold, small)
- 1–2 word description below (muted, smaller — e.g. *"AI search"*, *"Cloud storage"*, *"Work management"*)
- Card background: white (`#FFFFFF`). No gradient. These are UI cards, not atmospheric sections — they use the standard card surface color. Rounded corners, subtle shadow.

**Total companies:** ~20 across both rows.

**Animation — infinite marquee, opposite directions:**
- **Top row:** scrolls continuously **right → left**
- **Bottom row:** scrolls continuously **left → right**
- Both rows move at the same speed. Speed: Each row completes one full loop in 30 seconds (`animation-duration: 30s; animation-timing-function: linear; animation-iteration-count: infinite`). Seamless loop: achieved by duplicating the card list (2× content in DOM, first set visible, second set hidden until needed). No jump at loop point.
- No pause on hover required (but optional)

---

## Section 9: Footer

The footer **slides up as an overlay** — it visually covers the previous section as the user reaches the bottom of the page. Feels like a panel being pushed up from underneath.

**Background:** A full-bleed **clouds photograph** (asset TBD — to be supplied). The image spans the full footer width and height. If the clouds photograph asset is not available, fallback: Yale Blue (`#25426A`) → Blue Slate (`#536D84`) gradient, left-to-right. Text remains white (`#FFFFFF`).

**Content overlaid on the clouds image (all in white):**

**Top area:**
- Beamix logo (wordmark, white)
- Tagline: *"The GEO platform for SMBs"* — small, light weight, muted white
- Navigation links — a small set of key pages (e.g. *How It Works, Why Beamix, Pricing, Blog*)
- Social media icons (minimal, white)
- Legal/contact details — very small type (Privacy Policy, Terms of Service, contact email)

**Bottom area — large display text:**
- The word **"Beamix"** in very large display typography — white, bottom-aligned
- The **lower portion of the text is intentionally cropped** by the bottom edge of the viewport — only the top ~60–70% of the letterforms are visible
- This creates a cinematic, editorial closing frame

**Typography:** White throughout. Clean contrast against the clouds image.

---

*Homepage specification complete — pending: final copy pass, asset delivery (images, screenshots, quote, agent names, pricing details), and developer handoff.*
