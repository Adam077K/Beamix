# Beamix Homepage — Component Spec
*Design Lead spec — 2026-03-13 — Pencil MCP unavailable, spec path used*
*Source: docs/05-marketing/homepage-design-spec.md + reference images in saas-platform/public/Reference photos approx/*

---

## Architecture Decision

The current `saas-platform/src/app/page.tsx` imports ~14 fragmented `hp-*` components that do not match the spec. This rebuild **replaces the entire homepage** with a cohesive scroll-driven narrative. All existing `hp-*` components are preserved on disk (do not delete) but are unwired from page.tsx.

**New component file list (all in `src/components/landing/`):**
- `hp-nav-v2.tsx` — Sticky nav with scroll-adaptive CTA
- `hp-hero-v2.tsx` — Two-column hero + slot-machine AI logo
- `hp-demo-video.tsx` — Atmospheric video section
- `hp-scroll-story.tsx` — Scroll-driven narrative (Sections 4+5 combined)
- `hp-quote-moment.tsx` — Full-bleed navy quote section
- `hp-pricing-v2.tsx` — Animated pricing cards + FAQ accordion
- `hp-integrations.tsx` — Infinite marquee two-row
- `hp-footer-v2.tsx` — Footer with oversized BEAMIX text

**New page.tsx imports ONLY these 8 components.**

---

## Global Design Tokens

```
Background:      #FAFAF9
Primary text:    #141310
Muted text:      #78716C
Primary accent:  #023c65 (navy)
Accent hover:    #013f6c
Card surface:    #FFFFFF
Card border:     #F9FAFB
Divider:         #E7E5E4
Dark surface:    #1E1E1E (ChatGPT mock background)
```

**Typography:** Spec says Montserrat. Project uses `var(--font-outfit)` for headings (Outfit loaded in layout.tsx — closest available). Use `var(--font-outfit)` for all display/heading text. Use `var(--font-inter)` for body and UI text.
- Display headlines: 800 weight, uppercase where spec says ALL CAPS
- Body: Inter `var(--font-inter)`

**Animation library:** Framer Motion (already installed). Use `useScroll` + `useTransform` for scroll-pinned sequences. No GSAP required.

---

## Section 1 — `hp-nav-v2.tsx`

**File:** `src/components/landing/hp-nav-v2.tsx`

```tsx
'use client'
// State: scrolled (boolean), heroInputVisible (boolean via IntersectionObserver)
```

**Visual spec:**
- Height: 68px. Fixed/sticky top-0 z-50.
- Background: transparent on load; on scroll > 20px: `bg-white/90 backdrop-blur-md border-b border-[#E7E5E4]`
- Logo: `<Image src="/logo/Beamix_logo_with_name_blue.svg" alt="Beamix" />` — existing asset
- Center links: "How It Works" `/how-it-works`, "Why Beamix" `/why-beamix`, "Pricing" `/pricing`, "Blog" — gap-8, text-sm, `#78716C` with `#141310` hover, `var(--font-inter)`
- Right CTAs:
  - When hero URL input IS visible (>20% in viewport): "Log In" (ghost text) + "Request a Demo" (navy button)
  - When hero URL input NOT visible (<20%): crossfade — "Request a Demo" becomes "Scan your site →" (same navy button, anchor-scrolls to `#hero-url-input`)
  - IntersectionObserver threshold: 0.2 on `#hero-url-input` element
  - Transition: opacity crossfade 200ms

**JSX outline:**
```tsx
<motion.nav
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="fixed top-0 left-0 right-0 z-50 h-[68px] transition-all duration-300"
  style={{ background: scrolled ? 'rgba(250,250,249,0.9)' : 'transparent' }}
  role="navigation"
  aria-label="Main navigation"
>
  <div className="max-w-[1440px] mx-auto px-20 h-full flex items-center justify-between">
    <Logo />     {/* Image: /logo/Beamix_logo_with_name_blue.svg */}
    <CenterLinks />
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm text-[#78716C] px-3 py-2 hover:text-[#141310]">Log In</Link>
      <AnimatePresence mode="wait">
        {heroVisible ? (
          <motion.div key="demo-btn" ...>
            <Link href="#" className="bg-[#023c65] text-white text-sm px-4 py-2 rounded-lg">
              Request a Demo
            </Link>
          </motion.div>
        ) : (
          <motion.div key="scan-btn" ...>
            <a href="#hero-url-input" className="bg-[#023c65] text-white text-sm px-4 py-2 rounded-lg">
              Scan your site →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</motion.nav>
```

**Accessibility:** `role="navigation"`, `aria-label="Main navigation"`. Focus ring: `focus-visible:ring-2 focus-visible:ring-[#023c65] focus-visible:ring-offset-2` on all interactive elements. Min 44×44px touch targets.

---

## Section 2 — `hp-hero-v2.tsx`

**File:** `src/components/landing/hp-hero-v2.tsx`

**Visual spec:**
- `pt-[68px]` (nav height offset). Min-height: 720px. Background: `#FAFAF9`.
- Two-column layout: left col `w-[65%]`, right col `w-[30%]`, 5% gap. Left-aligned. `px-20` from left edge.

**2.1 Page load animation:**
```tsx
// Entire hero: initial={{ filter: 'blur(8px)', opacity: 0 }} animate={{ filter: 'blur(0px)', opacity: 1 }}
// transition={{ duration: 0.7, ease: 'easeOut' }}
```

**2.2 Headline — slot machine AI logo:**
```
Line 1: "CUSTOMERS ASK AI."
Line 2: [AI LOGO SQUARE] + "AI DOESN'T KNOW"
Line 3: "YOU EXIST."
```
- 75px, 800w, `var(--font-outfit)`, uppercase, `#141310`, line-height: 70px
- Line 2 uses `flex items-center gap-4`

AI Logo Square:
- 68×68px, `bg-[#023c65]`, `rounded-[12px]`, `overflow-hidden`
- Cycles through: ChatGPT (text "GPT"), Gemini (text "G"), Perplexity (text "P"), Claude (text "C"), Grok (text "X")
- Animation: `AnimatePresence mode="wait"`, each logo: `initial={{ y: 40, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`, `exit={{ y: -40, opacity: 0 }}`
- Transition: 300ms ease-in-out. Display duration: 3000ms per logo.
- Logo content: white text on navy square, 24px 800w centered

**2.3 Subheadline:**
```
"We scan, diagnose, and optimize your AI search presence so customers find you first."
```
- 18px, regular, `#78716C`, `var(--font-inter)`, `max-w-[580px]`, mt-5

**2.4 URL Input:**
```tsx
<div id="hero-url-input" className="mt-8">
  <form
    onSubmit={handleScan}
    className="relative flex items-center w-[460px] h-[56px] bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden"
  >
    <label htmlFor="url-input" className="sr-only">Enter your website URL</label>
    <input
      id="url-input"
      type="text"
      placeholder="yourwebsite.com"
      className="flex-1 px-4 text-sm text-[#141310] placeholder:text-[#D9D9D9] outline-none bg-transparent"
      style={{ fontFamily: 'var(--font-inter)' }}
    />
    <button
      type="submit"
      aria-label="Scan website"
      className="mr-2 flex items-center gap-2 bg-[#023c65] text-white text-xs font-semibold px-4 h-[40px] rounded-[8px] hover:bg-[#013f6c] transition-colors focus-visible:ring-2 focus-visible:ring-[#023c65] focus-visible:ring-offset-2"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Beamix logo icon — spins 360 on button hover */}
      <motion.span animate={{ rotate: isHovered ? 360 : 0 }} transition={{ duration: 0.6, ease: 'linear', repeat: isHovered ? Infinity : 0 }}>
        ✦
      </motion.span>
      Scan Now
    </button>
  </form>
</div>
```

**2.5 Right column — trust strip:**
- `flex flex-col gap-4 pl-8`
- Eyebrow: "Trusted by teams at" — 11px, `#78716C`, mb-2
- 5 placeholder rects: `w-[140px] h-[36px] bg-[#D9D9D9] rounded opacity-60 hover:opacity-85 transition-opacity duration-200`
- Alternating `ml-4` offset on items 2, 4 for staggered visual rhythm

**Mobile (< 768px):** Single column. Right trust strip hidden (`hidden md:flex`). Input width: 100%.

**Accessibility:**
- `<section aria-label="Hero">`
- URL input: `id="url-input"`, `<label htmlFor="url-input" className="sr-only">`
- Slot machine: `aria-live="off"` (decorative animation), `aria-hidden="true"` on the animated square

---

## Section 3 — `hp-demo-video.tsx`

**File:** `src/components/landing/hp-demo-video.tsx`

**Visual spec:**
- Full-width section, min-height: 900px
- Background: `#D9D9D9` (atmospheric image placeholder; real image to be supplied)
- Video player: centered, `max-w-[1224px] mx-auto`, aspect-ratio 16:9, `rounded-[12px]`, `shadow-[0_4px_24px_rgba(0,0,0,0.10)]`
- Vertical padding: 80px top

**Video placeholder (no video asset yet):**
```tsx
<div className="relative w-full aspect-video bg-[#1E1E1E] rounded-[12px] flex items-center justify-center">
  <span className="text-white/50 text-base" style={{ fontFamily: 'var(--font-inter)' }}>
    Product Demo Video
  </span>
  <button
    className="absolute w-20 h-20 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white"
    aria-label="Play product demo video"
  >
    <span className="text-white text-2xl ml-1">▶</span>
  </button>
</div>
```

**When real video is supplied:** Replace with `<video autoPlay muted loop playsInline poster="..." className="rounded-[12px] w-full">`. Show play button overlay when autoplay blocked.

**Scroll entrance:**
```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true, amount: 0.1 })
// <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}>
```

**Accessibility:** `<section aria-label="Product demonstration">`. Video: `aria-label="Beamix product demo"`.

---

## Section 4+5 — `hp-scroll-story.tsx`

**File:** `src/components/landing/hp-scroll-story.tsx`

This component is the most complex. It implements the full scroll-driven narrative. Use sub-components internally.

### Scroll architecture

```tsx
// Outer wrapper: very tall, sets scroll distance
// <div ref={containerRef} style={{ height: '600vh' }}>
//   <div className="sticky top-0 h-screen overflow-hidden">
//     {/* All scroll-animated content lives here */}
//   </div>
// </div>
const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
```

Use `useTransform(scrollYProgress, [from, to], [startValue, endValue])` for each animated element.

### 4.1 — Section Header
```tsx
// Appears at scrollYProgress 0–0.05
// blur-to-sharp: useTransform(progress, [0, 0.05], [8, 0]) → filter blur
// opacity: useTransform(progress, [0, 0.03, 0.2], [0, 1, 1])
// "Right now, someone is asking ChatGPT about a business like yours."
// 52px, 800w, var(--font-outfit), #141310, centered, max-w-[900px] mx-auto
```

### 4.2 — ChatGPT Mock UI (Sub-component: `<ChatGptMock />`)

```tsx
// Positioned center of viewport
// Appears at scrollYProgress ~0.05
// opacity: useTransform(progress, [0.04, 0.08], [0, 1])

// Visual: dark rounded card, #1E1E1E bg, rounded-[16px]
// Width: 800px max, centered
// Input row: #2A2A2A bg, rounded-[12px], 56px height
// Question text appears via typewriter when opacity reaches 1
// After question: send button animation, thinking dots, then response items

// useTypewriter hook:
function useTypewriter(text: string, active: boolean, charDelay = 40) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) { clearInterval(interval); setDone(true) }
    }, charDelay)
    return () => clearInterval(interval)
  }, [active, text, charDelay])
  return { displayed, done }
}
```

**Response list items (typed sequentially after question done):**
```
1. Factor – Delivers fully prepared healthy meals that only need to be heated.
2. Sunbasket – Provides healthy meal kits with organic ingredients.
3. Blue Apron – Sends ingredients and simple recipes so you can cook quickly.
4. Trifecta Nutrition – Offers ready-made meals designed for athletes.
5. [Your Competitor] – A service in your area that is thriving in AI search.
```
Item 5 has `bg-[rgba(2,60,101,0.2)] rounded` highlight, white bold text. Items 1-4 are `#E5E5E5`.

### 4.2 Step 3 — Problem Sentences

```tsx
// Below ChatGPT mock
// Sentence 1: upward fade, useTransform(progress, [0.15, 0.18], [30, 0]) for y, [0,1] for opacity
// Sentence 2: upward fade, progress [0.18, 0.21]
// Sentence 3: blur-to-sharp, progress [0.21, 0.25]
// "Your competitor is getting the recommendation 1st. You're 5th." — 24px, 600w, centered
// "This is happening in your industry. Every day. With your customers." — 24px, 600w, centered
// "They never see your name." — 28px, 800w, centered, blur-to-sharp
```

### 4.3 — Transition Input Bar

```tsx
// Appears at progress ~0.25
// Same input component as hero but mid-page, centered
// Typewriter in input: "yourbusiness.com" types automatically
// Button click animation: useTransform scales button at progress 0.28
// Logo detach + drift: complex CSS transform sequence
//   - Logo position animates from button → center of screen (fixed translate)
//   - Simultaneously spins, scales 1 → 1.3
//   - Then y: 0 → -100vh over progress 0.29–0.32
// Mobile fallback: use useReducedMotion() — skip drift, do scale+fade in place
```

### 4.4 — Dashboard Screens (alternating layout)

Each dashboard section at a scroll milestone. All image placeholders `#D9D9D9 rounded-[12px]`.

**Scan-in-progress rings** (progress 0.30–0.34):
```tsx
// 3 concentric rings: 80px, 140px, 200px diameter
// border: 2px solid #023c65
// border-radius: 50%
// CSS keyframe: @keyframes pulse-ring { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
// Stagger: animation-delay 0s, 0.3s, 0.6s
```

**Dashboard 1** (progress 0.34–0.50, image left):
```tsx
// Image: left ~55% width, h-[460px], bg-[#D9D9D9] rounded-[12px]
// Scale entrance: useTransform(progress, [0.34, 0.40], [0.85, 1])
// Text right: "Your full picture." — 36px, 800w
// CTA: "Learn More →" — bg-[#023c65], white, rounded-lg
```

**Dashboard 2** (progress 0.50–0.62, image right):
```tsx
// Image: right ~55%, text left
// "Engine by engine." — 36px, 800w
// No CTA
```

**Dashboard 3** (progress 0.62–0.72, image left):
```tsx
// Image: left ~55%, text right
// "Fix it for you." — 36px, 800w
// No CTA
```

### 5.1 — Agents Hub Intro (progress 0.72–0.78)

```tsx
// Two-column: left text + CTA, right graphic placeholder
// "Your agents, on it." — 36px, 800w
// "Learn More →" navy button
// Right: gray 640×440 placeholder
```

### 5.2 — Section Header (progress ~0.78)

```tsx
// "We do the work. You get the results."
// 52px, 800w, centered, upward fade
```

### 5.3 — 3×3 Parallax Grid (progress 0.78–0.85)

```tsx
// Grid: 3 cols, 3 rows, 390×390px cells, 20px gaps
// Left col: useTransform(progress, [0.78, 0.85], [0, -120]) → y
// Right col: same
// Middle col: no transform

// Cell contents:
// Row 1: [gray] | [STAT: navy, "16\nAgents Working"] | [gray]
// Row 2: [gray] | [gray — CENTER EXPANDING CELL] | [STAT: navy, "7\nAI Engines"]
// Row 3: [gray] | [gray] | [STAT: navy, "+340%\nVisibility"]

// Stat cards: bg-[#023c65] rounded-[12px]
// Number: text-white text-[80px] font-[800] var(--font-outfit)
// Label: text-white/70 text-[18px]
```

### 5.4 — Center Card Expansion (progress 0.85–0.87)

```tsx
// Center cell (row2, col2): scale from 1 → ~3.7 over 800px scroll
// scaleX: useTransform(progress, [0.85, 0.87], [1, viewportWidth / cellWidth])
// scaleY: similar calculation
// transformOrigin: center of cell
// Grid opacity: useTransform(progress, [0.86, 0.87], [1, 0])
```

### 5.5 — Agent Feed Full-Screen (progress 0.87–0.93)

```tsx
// Background: #FAFAF9, full viewport
// 16 agent cards in centered column, max-w-[480px] mx-auto
// Each card: white bg, rounded-[10px], shadow-[0_1px_4px_rgba(0,0,0,0.08)]
// Height: 60px, flex items-center gap-3 px-4
// Left: gray circle 24×24 (icon placeholder)
// Center: agent name, var(--font-inter) 500w 13px #141310
// Right: ✓ checkmark — appears when that card's scroll milestone is reached
//   scale: 0→1, opacity: 0→1 over 100ms

// Cards rise in one by one (1200px / 16 = 75px scroll per card)
// Each card i appears at: progress = 0.87 + (i / 16) * 0.06
```

Agent names (16):
Content Optimizer, Schema Agent, FAQ Builder, Citation Fixer, Competitor Intelligence, Local Signal Agent, Review Responder, Meta Optimizer, Internal Linker, E-E-A-T Builder, Snippet Enhancer, Structured Data Agent, Topical Authority Agent, Voice Search Agent, Brand Signal Agent, AI Mention Agent

### 5.6 — Transition Header (progress ~0.93)

```tsx
// "Now let's see what changed."
// 52px, 800w, centered, blur-to-sharp
// blur: useTransform(progress, [0.93, 0.95], [12, 0])
// opacity: useTransform(progress, [0.93, 0.95], [0, 1])
```

### 5.7 — ChatGPT Round 2 (progress 0.95–0.98)

```tsx
// Same ChatGPT mock component, same question typewriter
// Response appears with stack reorder animation:
// - Initially shows business at position 5 (all items visible)
// - After 500ms: business card at pos 5 animates y: 0 → -[4 * itemHeight]px
// - Items 1-4 animate y: 0 → +itemHeight
// - Motion: spring({ stiffness: 300, damping: 30 }), ~400ms
// - Business at pos 1: bg highlight rgba(2,60,101,0.25), text bold white
```

### 5.8 — Closing Summary (progress 0.98–1.0)

```tsx
// "Scan. Diagnose. Fix. Repeat." — 52px, 800w, centered, blur-to-sharp
// "Beamix runs automatically and continuously — your business keeps rising in AI search, without lifting a finger."
//   18px, #78716C, centered, max-w-[600px]
// "Start your free scan →" — bg-[#023c65] button, white, 48px height, centered
//   href="/scan"
```

**Reduced motion fallback for entire section:**
```tsx
const prefersReducedMotion = useReducedMotion()
// If true: render all content statically, no scroll-pinning, no animations
// Wrap in standard <section> with normal document flow
```

**Accessibility:**
- `<section aria-label="How Beamix works">`
- ChatGPT mock: `role="presentation"`, `aria-hidden="true"` on animated elements
- All text content is real DOM text (not images), readable by screen readers
- Agent names visible in DOM even if animated

---

## Section 6 — `hp-quote-moment.tsx`

**File:** `src/components/landing/hp-quote-moment.tsx`

**Visual spec:**
- Full-bleed section, min-height: 640px
- Background: `#023c65` solid (gradient image to be supplied; fallback is this color)
- Optional grain texture: `<svg>` noise filter overlay at `opacity-[0.03]` (grain = gradient sections only per spec)
- Optional 12-column grid lines: white at 20% opacity (applied here only, per spec)

**Content:**
```tsx
<section
  aria-label="Brand statement"
  className="relative min-h-[640px] bg-[#023c65] flex flex-col overflow-hidden"
>
  {/* Grain overlay */}
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
    <svg width="100%" height="100%"><filter id="noise">...</filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>
  </div>

  {/* Eyebrow */}
  <p className="text-white/50 text-[12px] absolute top-20 left-20" style={{ fontFamily: 'var(--font-inter)' }}>
    What we believe
  </p>

  {/* Quote */}
  <div className="flex-1 flex items-center justify-center px-20">
    <blockquote className="text-white text-[52px] font-[800] text-center max-w-[900px] leading-[1.1]" style={{ fontFamily: 'var(--font-outfit)' }}>
      Every business deserves to be found by the customers already looking for them.
    </blockquote>
  </div>

  {/* CTA */}
  <div className="flex justify-center pb-20">
    <a href="#pricing-section" aria-label="See pricing plans"
       className="bg-white/15 border border-white/20 text-white text-[15px] px-8 h-[48px] flex items-center rounded-lg hover:bg-white/25 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#023c65]">
      See the plans →
    </a>
  </div>
</section>
```

**Scroll entrance:** Standard upward reveal, `useInView`, `motion.section`, `initial={{ opacity: 0, y: 30 }}`.

---

## Section 7 — `hp-pricing-v2.tsx`

**File:** `src/components/landing/hp-pricing-v2.tsx`

**Visual spec — header:**
```tsx
<section id="pricing-section" aria-label="Pricing" className="bg-[#FAFAF9] py-[120px] px-6">
  <h2 className="text-[52px] font-[800] text-center text-[#141310] leading-[1.1]" style={{ fontFamily: 'var(--font-outfit)' }}>
    Simple, transparent pricing.
  </h2>
  <p className="text-[18px] text-[#78716C] text-center mt-4" style={{ fontFamily: 'var(--font-inter)' }}>
    No contracts. Cancel any time. 7-day free trial included.
  </p>
```

**Monthly/Annual toggle:**
```tsx
const [annual, setAnnual] = useState(false)
// Pill container: w-[200px] h-[44px] bg-[#F5F4F2] rounded-[22px] relative, centered
// Active pill: motion.div with layoutId="active-pill", w-[96px] h-[36px] bg-white rounded-[18px] absolute
// Tap on "Monthly"/"Annual" updates state, active pill slides with layout animation (Framer Motion)
// Price values: fixed-height container for price numbers, opacity crossfade 150ms
```

**Prices:**
```
Monthly: Starter $49 / Pro $149 / Business $349
Annual:  Starter $39 / Pro $119 / Business $279
```

**Cards entrance animation:**
```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true, amount: 0.2 })
// All 3 animate simultaneously when section enters viewport:
// Starter: initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
// Pro:     initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
// Business:initial={{ x: 60, opacity: 0 }}  animate={{ x: 0, opacity: 1 }}
// duration: 0.5, ease: 'easeOut', all simultaneous (no delay between cards)
```

**Card grid:** `grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1280px] mx-auto mt-16`

**Starter Card:**
```tsx
<motion.div className="bg-white rounded-[16px] p-8 flex flex-col hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-[2px] transition-all duration-200">
  <h3 className="text-[20px] font-[700] text-[#141310]">Starter</h3>
  <div className="h-[80px]"> {/* fixed height prevents layout shift */}
    <AnimatePresence mode="wait">
      <motion.p key={annual ? 'annual' : 'monthly'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="text-[64px] font-[800] text-[#141310] leading-none">
        {annual ? '$39' : '$49'}
      </motion.p>
    </AnimatePresence>
  </div>
  <p className="text-[15px] text-[#78716C]">per month</p>
  <p className="text-[13px] text-[#78716C] opacity-70">{annual ? 'billed annually' : ' '}</p>
  <hr className="border-[#E7E5E4] my-6" />
  <ul className="space-y-2 flex-1">
    {['3 AI engines (ChatGPT, Gemini, Perplexity)', 'Weekly scans', '5 agent credits/month', 'Core recommendations', 'Email reports'].map(f => (
      <li key={f} className="flex items-center gap-2 text-sm text-[#78716C]">
        <Check size={14} className="text-[#023c65] shrink-0" />
        {f}
      </li>
    ))}
  </ul>
  <Link href="/signup" className="mt-8 w-full text-center bg-[#023c65] text-white py-3 rounded-lg text-[15px] font-[600] hover:bg-[#013f6c] transition-colors focus-visible:ring-2 focus-visible:ring-[#023c65] focus-visible:ring-offset-2">
    Start free trial
  </Link>
</motion.div>
```

**Pro Card** — additionally: `border-2 border-[#023c65]`, "Most Popular" badge (`bg-[#023c65]` pill, white text 12px, centered at top, negative top offset `mt-[-12px]`).

**Business Card** — same structure as Starter with Business prices/features.

**FAQ Accordion:**
```tsx
// Below cards, max-w-[720px] mx-auto mt-[80px]
// State: openIndex (number | null)
// Each item: question button + animated answer panel
// role="list", each item role="listitem"
// Question button: aria-expanded={open}, aria-controls={panelId}
// Answer panel: id={panelId}, role="region", aria-labelledby={questionId}
// Height animation: AnimatePresence + motion.div initial={{ height: 0, opacity: 0 }}
```

Questions + Answers:
1. "How does the free scan work?" → "Enter your website URL and we scan ChatGPT, Gemini, and Perplexity to show how AI search engines see your business — no account needed."
2. "Which AI engines does Beamix scan?" → "Starter: ChatGPT, Gemini, Perplexity. Pro: 7 engines including Claude, Grok, Google AI Overviews, You.com. Business: 9+ engines."
3. "How do agents make changes to my content?" → "Agents generate optimized content — meta descriptions, FAQs, schema markup, citations. You review and approve before anything goes live."
4. "Can I cancel at any time?" → "Yes, cancel any time from your settings. No cancellation fees. Your data remains accessible for 30 days after cancellation."
5. "What happens after the 7-day trial ends?" → "Your account upgrades to the plan you selected. You'll be notified before any charge. If you don't upgrade, your account downgrades to a limited free tier."

---

## Section 8 — `hp-integrations.tsx`

**File:** `src/components/landing/hp-integrations.tsx`

**Visual spec:**
```tsx
<section aria-label="Partner integrations" className="bg-[#FAFAF9] py-[80px] overflow-hidden">
  <h3 className="text-[28px] font-[800] text-[#141310] text-center mb-[48px] max-w-[640px] mx-auto px-6">
    Works with the tools you already use.
  </h3>
  {/* Row 1: scrolls right→left */}
  <div className="overflow-hidden mb-4" aria-hidden="true">
    <motion.div
      className="flex gap-4"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
    >
      {[...row1Cards, ...row1Cards].map((card, i) => <IntegCard key={i} {...card} />)}
    </motion.div>
  </div>
  {/* Row 2: scrolls left→right */}
  <div className="overflow-hidden" aria-hidden="true">
    <motion.div
      className="flex gap-4"
      animate={{ x: ['-50%', '0%'] }}
      transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
    >
      {[...row2Cards, ...row2Cards].map((card, i) => <IntegCard key={i} {...card} />)}
    </motion.div>
  </div>
</section>
```

**IntegCard component:**
```tsx
// width: 160px, height: 100px (shrink-0)
// bg-white rounded-[12px] border border-[#F9FAFB] flex flex-col items-center justify-center gap-1.5 p-4
// Icon: 32×32 gray circle (company logo placeholder)
// Name: text-[13px] font-[600] text-[#141310] var(--font-inter)
// Description: text-[11px] text-[#78716C] var(--font-inter)
```

Row 1 cards: `[{ name: 'ChatGPT', desc: 'AI search' }, { name: 'Gemini', desc: 'AI search' }, { name: 'Perplexity', desc: 'AI search' }, { name: 'Claude', desc: 'AI search' }, { name: 'Grok', desc: 'AI search' }, { name: 'Google AI', desc: 'AI Overviews' }, { name: 'You.com', desc: 'AI search' }, { name: 'Bing', desc: 'AI search' }]`

Row 2 cards: `[{ name: 'OneDrive', desc: 'Cloud storage' }, { name: 'GitHub', desc: 'Code hosting' }, { name: 'Monday.com', desc: 'Work management' }, { name: 'Zoho CRM', desc: 'CRM' }, { name: 'Notion', desc: 'Docs & notes' }, { name: 'Dropbox', desc: 'Cloud storage' }, { name: 'WhatsApp', desc: 'Messaging' }, { name: 'Slack', desc: 'Team chat' }]`

---

## Section 9 — `hp-footer-v2.tsx`

**File:** `src/components/landing/hp-footer-v2.tsx`

**Visual spec:**
```tsx
<footer
  role="contentinfo"
  className="relative min-h-[840px] overflow-hidden"
  style={{ background: 'linear-gradient(135deg, #25426A 0%, #536D84 100%)' }}
  // If clouds photo asset supplied: use bg-[url('/homepage/clouds-footer.jpg')] bg-cover bg-center
>
  {/* Top content row */}
  <div className="flex items-start justify-between px-20 pt-20">
    {/* Logo + tagline */}
    <div>
      <Link href="/" aria-label="Beamix home">
        <span className="text-white text-[22px] font-[800]" style={{ fontFamily: 'var(--font-outfit)' }}>BEAMIX</span>
      </Link>
      <p className="text-white/60 text-[13px] mt-1" style={{ fontFamily: 'var(--font-inter)' }}>The GEO platform for SMBs</p>
    </div>

    {/* Nav links */}
    <nav aria-label="Footer navigation" className="flex gap-8">
      {['How It Works', 'Why Beamix', 'Pricing', 'Blog'].map(label => (
        <Link key={label} href={...} className="text-white/70 text-[13px] hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white">
          {label}
        </Link>
      ))}
    </nav>

    {/* Social icons */}
    <div className="flex gap-2">
      <a href="https://twitter.com/beamix" aria-label="Twitter" className="w-7 h-7 rounded-[6px] bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white" />
      <a href="https://linkedin.com/company/beamix" aria-label="LinkedIn" className="w-7 h-7 rounded-[6px] bg-white/20 ..." />
      <a href="https://instagram.com/beamix" aria-label="Instagram" className="w-7 h-7 rounded-[6px] bg-white/20 ..." />
    </div>
  </div>

  {/* Legal */}
  <div className="px-20 mt-6">
    <p className="text-white/40 text-[11px]" style={{ fontFamily: 'var(--font-inter)' }}>
      Privacy Policy · Terms of Service · hello@beamix.ai
    </p>
  </div>

  {/* Large BEAMIX display text — bottom-aligned, partially cropped */}
  <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '340px' }} aria-hidden="true">
    <p className="text-white/12 font-[800] leading-none select-none whitespace-nowrap"
       style={{ fontSize: '280px', fontFamily: 'var(--font-outfit)', position: 'absolute', bottom: '-40px', left: '-20px' }}>
      BEAMIX
    </p>
  </div>
</footer>
```

**Overlay slide-up effect:**
```tsx
// The footer appears to slide up over the integrations section above it.
// Achieved by: footer has position relative with a high z-index, or parent wraps with sticky behavior.
// Simple approach: wrap footer in a div with sticky bottom-0 and negative margin-top: -100px
// As user scrolls past integrations section, footer visually overlaps from below.
```

---

## Updated `page.tsx`

```tsx
// src/app/page.tsx
import { HpNavV2 }        from '@/components/landing/hp-nav-v2'
import { HpHeroV2 }       from '@/components/landing/hp-hero-v2'
import { HpDemoVideo }    from '@/components/landing/hp-demo-video'
import { HpScrollStory }  from '@/components/landing/hp-scroll-story'
import { HpQuoteMoment }  from '@/components/landing/hp-quote-moment'
import { HpPricingV2 }    from '@/components/landing/hp-pricing-v2'
import { HpIntegrations } from '@/components/landing/hp-integrations'
import { HpFooterV2 }     from '@/components/landing/hp-footer-v2'

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF9] overflow-x-hidden">
      <HpNavV2 />
      <HpHeroV2 />
      <HpDemoVideo />
      <HpScrollStory />
      <HpQuoteMoment />
      <HpPricingV2 />
      <HpIntegrations />
      <HpFooterV2 />
    </main>
  )
}
```

---

## Implementation Rules for Frontend Developer

1. **No placeholder text** — use real copy from this spec everywhere. No "Lorem ipsum".
2. **No empty renders** — all interactive components handle loading, empty, error, success states.
3. **Reduced motion** — `useReducedMotion()` from Framer Motion. When true: disable all animations, render content statically in normal document flow.
4. **Mobile-first breakpoints:**
   - Hero: single column on mobile, right trust strip `hidden md:flex`, input 100% width
   - Scroll story: on mobile, disable scroll-pinning. Show content in static vertical layout.
   - Pricing grid: `grid-cols-1 md:grid-cols-3`
   - Integrations: same marquee works at all widths
5. **Font variables:** `var(--font-outfit)` for all display/heading text. `var(--font-inter)` for body/UI.
6. **TypeScript strict** — all props typed, no `any`.
7. **Framer Motion** — already installed. Use `useScroll`, `useTransform`, `useInView`, `AnimatePresence`, `useReducedMotion`.
8. **Do NOT delete** existing `hp-*` components — only update `page.tsx` to use new `v2` variants.
9. **Git worktree** — work in `.worktrees/feat-homepage-rebuild` branch `feat/homepage-rebuild`.
10. **Images:** All placeholders use `#D9D9D9` gray rects with centered labels. No broken `<img>` tags.

---

## WCAG Requirements (all must pass)

- Color contrast minimums (all verified):
  - `#78716C` on `#FAFAF9` = 4.61:1 ✓ (passes AA)
  - `#141310` on `#FAFAF9` = 16.7:1 ✓
  - White on `#023c65` = 8.6:1 ✓
  - `#D9D9D9` is decorative only (no text on it without contrast check)
- Minimum 44×44px touch targets on all interactive elements
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#023c65] focus-visible:ring-offset-2` on buttons/links (white ring on dark sections)
- All images: descriptive `alt` text. Decorative: `alt=""`.
- Animated content: `prefers-reduced-motion` respected at component level
- No color-only information conveyance
- All interactive elements keyboard-accessible, tab order matches visual order

---

## Asset Map

| Asset | Status | Path |
|-------|--------|------|
| Logo SVG (blue) | Available | `/public/logo/Beamix_logo_with_name_blue.svg` |
| Hero city image | Available | `/public/homepage/Hero_homepage_city.png` |
| Dashboard screenshots | Use `#D9D9D9` placeholder | To be supplied |
| Demo video | Use dark placeholder rect | To be supplied |
| Agent hub graphic | Use `#D9D9D9` placeholder | To be supplied |
| Footer clouds photo | Use `#25426A→#536D84` gradient | To be supplied at `/public/homepage/clouds-footer.jpg` |
| AI engine logos | Use text initials on navy | To be supplied |
