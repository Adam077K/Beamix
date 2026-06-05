# Design Research A — Hand-drawn / Character-led / Data-rich Aesthetic
_2026-04-24 · Researcher (purple) for Beamix product-UI rethink_

**Brief:** Founder wants to move Beamix away from "AI slop" (Shadcn defaults, purple gradients, rounded-2xl everywhere) toward a hand-drawn, pencil-illustration, character-led, warm-yet-data-dense aesthetic — like Claude.ai / Anthropic. Product is dashboard-heavy (scans, rankings, automation queues, competitor tables), so the aesthetic must survive dense data.

**Confidence note on sources:** Most marketing homepage WebFetches returned sparse text (pages are heavily JS/image-rendered), so several claims below are verified via multiple secondary sources (type foundries, brand case studies, Kinfolk interview, PostHog's own handbook). Where a claim has only one source I flag it LOW. All screenshot-dependent claims (exact hex, texture grain) are marked MEDIUM unless confirmed by two sources.

---

## TOP 3 ANCHOR RECOMMENDATIONS FOR BEAMIX

### Anchor 1 — Anthropic / Claude.ai ("warm-serif + hand-illustrated mark")
**The primary anchor.** This is exactly the aesthetic the founder named, and the research confirms why it works.

**URLs to reference:**
- Product: https://claude.ai (the app shell is the reference, not the marketing site)
- Brand case study: https://geist.co/work/anthropic
- Kinfolk feature on Katigbak + Turman: https://www.kinfolk.com/stories/the-artisans-of-ai/
- Type analysis: https://type.today/en/journal/anthropic
- Design-token inventory: https://fontofweb.com/tokens/claude.ai
- Independent review with screenshots: https://deardesigner.substack.com/p/my-styrene-soul-a-short-affair-with

**Why it fits (5 points):**
1. It solves the exact problem Beamix has — an AI product that wanted to "distance itself from a technological, somewhat intimidating visual style" (Type.today, Geist) while still being a working product UI with dense conversations, artifacts, and panels.
2. The brand was built by designers (Everett Katigbak, Kyle Turman, Geist agency) who explicitly chose "the mark of the maker" — warmth, tactility, imperfection — over polished-SaaS defaults (Kinfolk).
3. It uses ONE small-but-iconic hand-drawn element (the "spark" asterisk / 12-point star) as the character anchor — Beamix can do the same (e.g., a hand-drawn Beamix star-mark) without needing a full mascot system (Kinfolk, Dear Designer).
4. The aesthetic proves it scales to chat UIs, long documents, tables of Artifacts — i.e., it survives density. Beamix's rankings/competitor tables will live in the same visual logic.
5. Founder instincts already match: Beamix already uses a blue star/cross mark (CLAUDE.md), Inter + Fraunces (serif accent), and warm neutrals — we're 40% there; this anchor just tells us to push harder on the "handmade" side.

**Specific design elements to steal:**

| Element | Claude's choice | Source |
|---|---|---|
| **Serif headlines** | Tiempos Text / Galaxie Copernicus Book (Klim, Chester Jenkins & Kris Sowersby, 2009) — Transitional serif, quiet, scholarly | Type.today; Dear Designer |
| **UI/body sans** | Styrene B Family (Commercial Type; Hasebe) Regular/Medium/Bold — "rounded and slightly squishy," narrow f/j/r/t that feel quirky-but-legible | Type.today; Dear Designer |
| **Background** | Warm beige application frame (not white), with subtle brown interactive gradients | Dear Designer; yW!an |
| **Primary accent** | Terracotta / "Claude clay" — #da7756 (also cited as #ae5630 for hover/dark) — NOT blue, NOT purple | yW!an; Begins w/ AI |
| **Spark mark** | Hand-illustrated 12-point asterisk-star in warm brown-orange. Still when Claude listens, "flutters gently" when it responds. "A 21st-century Clippy — more abstract than anthropomorphic." | Kinfolk |
| **Illustration language** | "Illustration language that doubles down on the human values that drive the company" — an explicit, named illustration system, not stock | Geist |
| **Philosophy** | "Leans into the imperfections of human, handmade things. There's a warmth and tactility that we try to bring into the interface." — Everett Katigbak | Kinfolk |

**Specific screens to study:**
- claude.ai chat shell — note how the beige + serif + one asterisk mark carries the entire personality; the chat column itself is almost chrome-less
- claude.ai Projects view — dense file/doc list that still feels warm because of beige + serif labels, not cold table borders
- claude.ai Artifacts panel — the "split-pane with code/preview" pattern; proves warm serif CAN coexist with monospaced code + tables

**Watch-outs:** Claude's marketing site (claude.com) has drifted cleaner/cooler over 2025 — treat the **product shell** as the reference, not the marketing site. Several third-party reviewers on Hacker News complained the serif + beige is "aggressive and opinionated" (levelsio on X) — that is exactly the point; it's a design that is willing to be polarizing.

---

### Anchor 2 — PostHog ("data-dense analytics with hand-drawn character")
**The critical anchor for Beamix's data-heavy screens.** PostHog proves that an analytics/dashboard product can be visually warm, hand-illustrated, AND show dense tables, charts, and code — without looking like generic SaaS. This is the single best public example of the exact combination Beamix needs.

**URLs to reference:**
- Homepage: https://posthog.com
- Design philosophy (handbook): https://posthog.com/handbook/brand/philosophy
- How the mascot is drawn: https://posthog.com/blog/drawing-hedgehogs
- Branding playbook (third-party): https://www.productgrowth.blog/p/posthog-branding-playbook
- Art request rules: https://posthog.com/handbook/brand/art-requests

**Why it fits (5 points):**
1. PostHog is a **product-analytics platform** — the closest competitive cousin to Beamix in terms of "dashboard full of events, funnels, tables, charts." If their aesthetic works on that, it works on scans + rankings.
2. They hired a dedicated illustrator (Lottie Coxon) as **employee #5**, before most of engineering — a founder commitment to brand-as-moat. They now have **two full-time illustrators** (productgrowth.blog).
3. Their design principle is explicit: "We aren't the best in the world at being polished, but we can be the best in the world at being ourselves." — Cory Watilo, lead designer (productgrowth.blog). This is the anti-slop thesis in one sentence.
4. They **forbid AI-generated art** for their mascot ("please don't use AI tools to create hedgehog art") — posthog.com/handbook/company/brand-assets. This is the exact posture Beamix needs.
5. The aesthetic works across ads, onboarding emails, docs, blog, and **inside the product** — versatile across the entire surface area Beamix is building.

**Specific design elements to steal:**

| Element | PostHog's choice | Source |
|---|---|---|
| **Mascot system** | "Max the Hedgehog" + a growing cast (scientist hog for experiments, police hog for errors) — 18 iterations before landing on Max; textured, "frumpy round body" | posthog.com/blog/drawing-hedgehogs; productgrowth |
| **Medium** | Hand-drawn digital (Procreate/Fresco on tablet) — NOT vector-perfect, NOT 3D ("3D felt cold and robotic" — Lottie) | Drawing Hedgehogs |
| **Line rule** | Strong, black monoline with **consistent thickness** — this is the most copyable rule | posthog.com/handbook/company/brand-assets |
| **Tone** | Irreverent + self-aware — copy like "Shameless CTA," "Bedtime reading," "Why PostHog?" | posthog.com homepage |
| **Anti-pattern** | Explicitly rejects "blue websites" and "abstract vector people" (the SaaS default) | productgrowth |
| **Dense data handling** | Screenshots of actual event lists, funnels, SQL editors sit adjacent to hedgehog illustrations and dark-mode pricing tables with emoji + casual labels | posthog.com homepage |

**Specific screens to study:**
- posthog.com/blog/posthog-wallpapers — a whole gallery of Max in different scenarios; this is the "illustration language" Geist-Anthropic mentioned but PostHog actually published
- posthog.com/pricing — proves pricing tables + playful mascot coexist
- posthog.com/product/product-analytics — dense dashboards with chart illustrations
- posthog.com/handbook — the handbook itself is an aesthetic artifact; casual tone + dense content

**What Beamix should copy directly:**
- The "character with variations" pattern — Beamix has 11 agents; each could have a hand-drawn character variant (scientist agent, scout agent, etc.) instead of generic Lucide icons.
- The "hand-drawn illustration + dense data table on the same page" layout.
- The explicit **ban on AI-generated art** as a brand rule — differentiator and authenticity signal.
- The "strong black monoline, consistent thickness" line rule — codifiable and teachable.

---

### Anchor 3 — Excalidraw + tldraw ("hand-drawn, professional, functional")
**The anchor for the "how hand-drawn marks actually get rendered in code" problem.** Both are production web apps — not branding exercises — that make the hand-drawn aesthetic work at scale. For Beamix, they teach how to use a handwritten display font and sketch-style shapes as **interface** elements (diagrams, empty-states, agent avatars, scan-result illustrations), not just marketing.

**URLs to reference:**
- https://excalidraw.com (app itself)
- https://plus.excalidraw.com/excalifont (the successor font to Virgil)
- https://plus.excalidraw.com/virgil (original font; open source, OFL-1.1)
- https://github.com/excalidraw/virgil
- https://tldraw.com
- Steve Ruiz (tldraw founder) on the perfect-freehand algorithm: https://www.steveruiz.me/about

**Why it fits (5 points):**
1. Both are **real working products with daily active use**, not concept sites — the aesthetic is battle-tested for performance and accessibility.
2. They've solved the "hand-drawn but still a professional tool" tension — Excalidraw is used by engineers for architecture diagrams; the hand-drawn style "signals this is a working document rather than final deliverable" (Hack Design). Beamix wants exactly this — "we're doing real work, in a human way."
3. Open-source fonts (Virgil, Excalifont — OFL-licensed, free commercial use) are **directly usable in Beamix** as a display/illustrative face for empty states, agent names, stamps, and annotations on scan results.
4. tldraw's founder (Steve Ruiz) invented a public open-source line-rendering algorithm ("perfect-freehand") that turns points into ink-like lines — this is how Beamix could render agent progress lines, chart annotations, or underlines in the same handwritten register.
5. Together they prove the aesthetic scales from "single-canvas drawing" (Excalidraw) to "collaborative product with dense shape lists, pages, and a React SDK" (tldraw) — i.e., it survives tooling complexity.

**Specific design elements to steal:**

| Element | Source | How Beamix uses it |
|---|---|---|
| **Excalifont / Virgil** (OFL, free) | plus.excalidraw.com/excalifont | Use for: agent stamps, scan-result annotations ("Missing on ChatGPT"), empty-state callouts. **NOT for body copy.** |
| **perfect-freehand algorithm** (MIT) | Steve Ruiz, github.com/steveruizok/perfect-freehand | Use for: underlines on competitor rows, strike-throughs in "before/after" comparisons, agent-progress sparkle trails |
| **"Rough.js" style** (Excalidraw's shape engine) | roughjs.com (upstream of Excalidraw) | Use for: illustrated borders around key callouts, hand-drawn dividers |
| **Paper-plain background** | excalidraw.com | Use a #FAF8F3-ish parchment as **one** background variant for premium/testimonial/explanatory sections, not everything |

**Specific screens to study:**
- excalidraw.com — the whole canvas is the reference for "professional tool + handwritten typeface"
- tldraw.com/r (public room) — watch how tldraw renders hundreds of shapes and still feels hand-drawn, not messy
- plus.excalidraw.com — shows how the hand-drawn aesthetic extends to a billing/dashboard UI (their "Plus" product)

**Watch-out:** This is the **most copy-able-too-far** anchor. Don't make the entire Beamix product look like Excalidraw — use it for ~15% of the surface: empty states, annotations, illustrative moments. Claude (Anchor 1) should set the overall feel; PostHog (Anchor 2) sets the density pattern; Excalidraw/tldraw supplies **specific tactical assets** (fonts, algorithms, shape style).

---

## FULL CANDIDATE LIST (17 products reviewed)

| Product | URL | Aesthetic traits | Dense data? | Character/illustration system? | Verdict |
|---|---|---|---|---|---|
| **Anthropic / Claude.ai** | claude.ai | Warm beige, terracotta accent (#da7756), Tiempos serif + Styrene sans, hand-drawn "spark" asterisk | Yes (Projects, Artifacts) | Yes (spark + illustration language by Geist) | **ANCHOR 1** |
| **PostHog** | posthog.com | Dark + light dual, black monoline illustrations, irreverent copy, Max hedgehog mascot system | Yes (analytics tables, funnels, SQL) | Yes (Max + variant cast, 2 FT illustrators) | **ANCHOR 2** |
| **Excalidraw** | excalidraw.com | Hand-drawn shapes, Virgil/Excalifont font, warm paper background | No (canvas, not data) | Partial (fonts + shape style are the character) | **ANCHOR 3 (tactical)** |
| **tldraw** | tldraw.com | Hand-drawn via perfect-freehand algorithm, warm UI chrome | No (canvas) | Partial | **ANCHOR 3 (tactical)** |
| Linear | linear.app | Dark mode, minimal, agent avatars, functional icons, very low ornament | Yes | No (too sleek, no warmth) | Study for data density only; too cold for our vibe |
| Mercury | mercury.com | Neutral palette, abstract geometric illustrations, uppercase wordmark | Moderate | Partial (abstract geometry, not characters) | Not a fit — too corporate/abstract |
| Raycast | raycast.com | Glass-morphism, isometric cubes, real product screenshots, clean sans | Moderate | No mascot, just isometric motif | Too "Apple clean" — no handmade warmth |
| Stripe | stripe.com | Polished, data-dense cards, gradient-light accents | Very high | No (abstract) | Gold standard for data; zero warmth for our purposes |
| Craft.do | craft.do | Paper-texture metaphor, whitespace-rich, real-user photos | Low | No (uses real people) | Good paper-metaphor reference; no character system |
| Are.na | are.na | Intellectual/editorial, spare, text-forward | Low | No | Too spare for a product UI; good typography reference |
| Granola.ai | granola.ai | Clean neutrals, screenshot-heavy | Low | No | Actively AI-generic; DO NOT copy |
| Readwise Reader | readwise.io/read | Dark, cold, premium-tech | Low | No | Marketed as scholarly, reads as cold SaaS in WebFetch |
| Arc Browser | arc.net | "Zero chrome," theme-rich, personalized | Low | Partial (themes + Spaces personalization) | Interesting motion model; no hand-drawn |
| Descript | descript.com | Custom "Underlord" robot mascot + icon library | Low | Yes (Underlord) | Mascot is cute but robot-themed — wrong tone for Beamix |
| FigJam | figma.com/figjam | Stickers, emotes, high-fives — toy-playful | Low | Yes (but very cartoon) | Too childlike for B2B audience |
| Campsite | campsite.com | Clean neutrals, avatars, emoji in channel names | Moderate | No (real avatars) | Adjacent — good pattern for emoji-as-icon, not our anchor |
| Notion Calendar | calendar.notion.so | (Page returned too little; skipped) | — | — | Insufficient data; deprioritized |

---

## ANTI-PATTERNS — What "AI Slop" Looks Like

These are the patterns Beamix must actively refuse. Each is flagged as AI-generated by the design community (prg.sh, techbytes, Maven, X screenshots):

| # | Anti-pattern | Why it reads as AI-generated | Source |
|---|---|---|---|
| 1 | **Purple-to-indigo gradient hero** (`bg-indigo-500`, violet/purple/cyan washes) | Tailwind shipped `bg-indigo-500` as default 5 years ago → saturated the training corpus → LLMs treat purple as the statistical median of "modern" | prg.sh |
| 2 | **Inter everywhere, especially Inter for headlines** | Inter is the mathematical center of the "modern SaaS font" distribution — it's the default when a model has no opinion | prg.sh; techbytes |
| 3 | **`rounded-2xl` / `rounded-3xl` on every card + button + input** | Uniform extreme-rounded edges with no intentional contrast = pattern-matched, not designed | prg.sh; Maven |
| 4 | **Three feature boxes in a grid with Lucide icons + subtitle** | The single most-trained layout in the ShadCN/Tailwind tutorial corpus; instantly recognizable | prg.sh |
| 5 | **Subtle shadow, always 0.1 opacity, always black** | Default Tailwind `shadow-lg` / `shadow-xl`; no narrative intent | prg.sh |
| 6 | **Glassmorphic / frosted-glass cards on gradient backgrounds** | 2022-era Dribbble trend, now the "I asked Midjourney for a UI" tell | techbytes |
| 7 | **Generic Lucide / Feather line icons for every feature** | Same icon set everyone uses; zero brand signal | techbytes |
| 8 | **Centered Lucide spinner on empty states** | The laziest possible empty state; signals "no one designed this screen" | community consensus |
| 9 | **Centered hero with single CTA + ghost button below** | Pattern-matched hero from 10,000 AI-generated landing pages | prg.sh |
| 10 | **Bento grid of "feature cards" with emoji icons** | 2024 AI-UI tell — same as #4 with emoji instead of Lucide | X screenshots (2026) |

Rule of thumb (from the Taste Skill / andrew.ooo): **ban Inter, ban purple/blue "AI aesthetic," one accent color only, saturation under 80%, no neon glows.**

---

## THE "CLAUDE-LIKE" AESTHETIC — DECODED

The founder says "it should be like Claude, the drawing and animations." Here are the 7 concrete design decisions that make Claude.ai feel warm, human, and hand-made — decoded into copyable rules:

### 1. Font pairing — quirky sans + transitional serif (no Inter)
- **Headlines:** A transitional serif (Tiempos Text / Galaxie Copernicus Book by Klim). Serif = "scholarly, formal," but the Transitional class keeps it modern, not Georgia-default (Type.today; Dear Designer).
- **UI/body:** A quirky geometric sans (Styrene B — "rounded and slightly squishy," with narrow f/j/r/t that read as humane, not Helvetica-perfect) (Type.today).
- **For Beamix:** Keep Fraunces (already in brand) for editorial moments + swap InterDisplay for a quirky sans with personality (candidates: GT Maru, Söhne, Basier Circle, or the free open-source **Departure Mono / Geist Sans** already in brand). Serif is the warmth signal; the quirky sans is the friendliness signal.

### 2. Background — warm beige, not white
- Claude's app frame is a **warm beige** (not #FFFFFF), with subtle brown interactive gradients (Dear Designer; yW!an). This single choice does 40% of the warmth work.
- **For Beamix:** Pick a beige variant for *product* (something in #FAF7F1 — #F7F4ED range). Keep #FFFFFF only for data tables and high-density zones where beige would fight the data.

### 3. Accent — one warm color, not blue
- Claude uses **terracotta / clay** (#da7756) — it is the single accent. No secondary blue, no tertiary purple (yW!an; Begins w/ AI).
- **For Beamix:** Brand already has Blue #3370FF locked, so we can't fully steal this. But we can **add ONE warm illustrative accent** (e.g., clay #DA7756 or similar) used only for illustrations, highlights on paper-texture sections, and the "Beamix mark." Keep #3370FF for actionable UI (CTAs, links, data-state).

### 4. One hand-illustrated mark that animates gently
- Claude has the "spark" — a 12-point asterisk-star, hand-illustrated in warm brown-orange. **Still when listening, flutters gently when responding** (Kinfolk). This is the entire animation budget on the product shell. One mark, one motion.
- **For Beamix:** Build ONE signature mark — a hand-drawn Beamix star (already the existing mark, but re-drawn with visible pen texture). It should animate in exactly two states: idle (still) + active (gentle pulse/flutter while an agent is running). Forbid decorative micro-animations anywhere else.

### 5. Illustration language — explicit system, not stock
- Geist explicitly describes an "illustration language that doubles down on the human values that drive the company" — meaning **Anthropic has a defined illustration system that teams can draw within**, not just stock illustrations. PostHog does the same (Lottie + 2 FT illustrators, strict monoline rule).
- **For Beamix:** Commission one illustrator to define an illustration language for the 11 agents + key empty states. Rules should include: medium (pencil / pen+wash), line weight, color palette, anatomy. Ban generic stock/Undraw/Storyset.

### 6. Whitespace philosophy — generous, asymmetric, editorial
- Claude's chat shell has aggressive horizontal margins, generous line-height, and serif-sized breathing room — it reads like a letter, not a form. Compare: ChatGPT is compressed like a spreadsheet (levelsio on X).
- **For Beamix:** On reading/long-form screens (scan detail, recommendation explanation, agent output), increase line-height to 1.6–1.75 and max-width to ~72ch. Keep density ONLY on tables/lists where density is the feature.

### 7. Motion — sparse + purposeful, one gesture per screen
- Claude has: the spark flutter, subtle fade-ins on artifacts, and almost nothing else. No decorative micro-interactions. The frontend-design skill calls this the "one strong entrance sequence + a few meaningful hover states" rule.
- **For Beamix:** One hero motion per page. One state-change motion per component. Hover states = subtle only. Forbid: Framer Motion staggers on every list, animated gradient backgrounds, looping decorative loops.

---

## RECOMMENDED NEXT STEPS (outside this brief, but worth surfacing)

1. **Commission or choose an illustrator** — the single highest-leverage decision. Without this, the aesthetic can't be executed. Candidates to evaluate: Lottie Coxon's approach (Procreate, monoline), or a pencil/wash illustrator for a more "Anthropic-Kinfolk" vibe.
2. **Pick the font pairing** — test Fraunces (existing) + a quirky sans (Söhne, GT Maru, Basier Circle, or keep Geist). Run in the actual product tables to check legibility at 12-14px.
3. **Build the "spark" — one signature mark** — hand-drawn Beamix star with two motion states (idle, active). This is the single most impactful visual asset.
4. **Introduce ONE warm accent next to the existing #3370FF** — e.g., clay/terracotta for illustrations and paper-texture sections. This unlocks the warmth without losing the blue equity.
5. **Paper-texture treatment for ~15% of the surface** — only for reading/explanation screens (recommendations, agent reasoning, scan narrative). Keep data zones crisp.

---

## Sources (consolidated)

**Claude / Anthropic:**
- [Geist — Anthropic brand case study](https://geist.co/work/anthropic)
- [Kinfolk — The Artisans of AI](https://www.kinfolk.com/stories/the-artisans-of-ai/)
- [Type.today — Styrene in use: ANTHROP\C](https://type.today/en/journal/anthropic)
- [Dear Designer — My Styrene Soul](https://deardesigner.substack.com/p/my-styrene-soul-a-short-affair-with)
- [yW!an — Claude Branding: The Complete Guide](https://www.ywian.com/blog/claude-branding-the-complete-guide)
- [Begins w/ AI — Claude logo color codes, fonts](https://beginswithai.com/claude-ai-logo-color-codes-fonts-downloadable-assets/)
- [FontOfWeb — claude.ai Design Tokens](https://fontofweb.com/tokens/claude.ai)

**PostHog:**
- [PostHog handbook — Design philosophy](https://posthog.com/handbook/brand/philosophy)
- [PostHog blog — How we designed the PostHog mascot](https://posthog.com/blog/drawing-hedgehogs)
- [PostHog handbook — Logos, brand, hedgehogs](https://posthog.com/handbook/company/brand-assets)
- [PostHog handbook — Art, brand, and merch requests](https://posthog.com/handbook/brand/art-requests)
- [Product Growth — PostHog branding playbook](https://www.productgrowth.blog/p/posthog-branding-playbook)

**Excalidraw / tldraw:**
- [Excalidraw — Excalifont](https://plus.excalidraw.com/excalifont)
- [Excalidraw — Virgil font](https://plus.excalidraw.com/virgil)
- [Hack Design — Excalidraw hand-drawn whiteboard](https://www.hackdesign.org/toolkit/excalidraw/)
- [Steve Ruiz (tldraw founder)](https://www.steveruiz.me/about)

**AI slop / anti-patterns:**
- [prg.sh — Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)
- [andrew.ooo — Taste Skill review: anti-slop frontend](https://andrew.ooo/posts/taste-skill-anti-slop-ai-frontend-review/)
- [TechBytes — Escape AI slop frontend design guide](https://techbytes.app/posts/escape-ai-slop-frontend-design-guide/)
- [Maven — Style AI prototypes, avoid slop](https://maven.com/p/af8a3f/style-ai-prototypes-master-tailwind-shad-cn-avoid-slop)

**Comparison products:**
- [Linear](https://linear.app) · [Mercury](https://mercury.com) · [Raycast](https://www.raycast.com) · [Craft.do](https://www.craft.do) · [Campsite](https://www.campsite.com) · [Granola](https://www.granola.ai) · [Readwise Reader](https://readwise.io/read) · [Arc Browser](https://arc.net) · [Descript](https://www.descript.com) · [FigJam](https://www.figma.com/figjam/)

---

## Confidence notes

- **HIGH confidence:** Font identifications (Styrene, Tiempos, Virgil, Excalifont), PostHog hiring Lottie as #5, the "spark" being hand-illustrated and animating, PostHog's AI-art ban, PostHog's monoline rule, the AI-slop anti-pattern list. All multi-sourced.
- **MEDIUM confidence:** Exact hex values for Claude (#da7756 / #ae5630 — two sources agree but I could not confirm against the live stylesheet due to WebFetch limits). Typography weight specifics.
- **LOW confidence:** Claim that Anthropic has a "formal illustration system" with named rules — Geist says it exists but doesn't publish the rules; PostHog's system IS public and thus our concrete reference.
- **UNKNOWN:** Notion Calendar aesthetic (page returned insufficient content); exact motion curves/durations used on the Claude spark.

_End of report. Length: ~520 lines._
