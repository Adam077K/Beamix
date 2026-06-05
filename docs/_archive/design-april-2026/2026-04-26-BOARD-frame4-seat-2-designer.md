# Board Review — Frame 4 Proposal
**Seat 2: Product Designer**
Date: 2026-04-26

---

## Preamble

I've read all four documents. I want to name the underlying tension before critiquing anything: every frame debate is secretly a debate about what kind of product Beamix is. A tool? A service? A relationship? Each frame answers that question differently, and the design choices flow from the answer. Frame 1 says service. Frame 2 says relationship. Frame 3 says tool-as-service-hybrid. My Frame 4 proposal has a different answer entirely — one I'll get to.

---

## Section 1: Critiques

---

### Frame 1 — The Managed Service

Frame 1 is philosophically coherent and visually honest about what it is. The Wealthfront analogy holds: the user logs in once a month, sees a number going up, and logs out. The email is the product. The app is the receipt.

**What it gets right:**

The restraint is earned. "One Status pill + One Decision card + One Number" is a real editorial position, not laziness. It says: we respect you enough to boil this down. That's a premium signal — Stripe's invoice summary page does exactly this. The choice to center email as primary channel is also genuinely right for the customer described: 15-200 person SMBs where the owner or marketing lead checks email 40 times a day and the app maybe once a week.

**What's wrong:**

Frame 1 has no screenshot-able moment. The product has no visual identity. If you opened a tab from a competitor and a tab from Beamix under Frame 1, the Beamix tab would look like a side project built in a weekend. "Premium" is felt through specificity — the right weight of a font, the precise timing of a number counting up, the way a sparkline ticks over on hover. Frame 1 doesn't specify any of these. It treats visual restraint as if restraint is free. It isn't. Restraint only reads expensive when every remaining element is executed at extraordinary quality. Frame 1 doesn't address that execution bar.

The deeper problem: Frame 1 essentially concedes the product surface to email. The app becomes vestigial — a consent form with a single button. But users are paying $79-$499/month. They will open the app. When they do, they will form a judgment. "Is this worth what I'm paying?" A sparse white page with one number and one pill does not answer that question favorably. Wealthfront gets away with this because the number is going up and people trust mutual funds. Beamix's score going up is not yet a proven concept the user deeply believes in. The product surface needs to make the case — not loudly, but substantively.

**Daily-use feel after 6 months:** forgettable. The user never bonds with the product. They bond with the email. When the email stops arriving (pause subscription, quarterly lull, false-positive "healthy" reading), the user has no relationship to fall back on.

**Visual signature:** there is none. That's the problem.

**Premium or cheap?** It aspires to premium through absence. It reads as unfinished.

---

### Frame 2 — The Operating Studio

Frame 2 is the work of a designer who fell in love with the product at the expense of the user. I say this with respect — the individual moves are often excellent. The Notebook is genuinely distinctive. The Reasoning Receipt typed-in animation is the right trust mechanic. The Rivalry Strip dual-sparkline is a better visualization than any competitor ships. The Letter on /settings Profile tab is a lovely idea. The Sentence Builder on /schedules is the kind of thing that makes a product feel thoughtful rather than assembled.

**What it gets right:**

Frame 2 has a screenshot-able moment on almost every surface. The Notebook, the Rivalry Strip, the Receipt-tape ribbon — these are distinctive. They'd show up in a "beautiful SaaS dashboards" roundup. The hand-drawn register, used well, separates Beamix from every other GEO tool. The agent-first-person voice creates the "crew" metaphor at the surface level rather than just in the conceptual model. The visual signature is clear: hand-drawn craft meets crisp data.

**What's wrong:**

Twelve distinctive moves competing for attention is not a design system. It's a design festival. The problem is not that each individual move is wrong — it's that eleven of them cannot all be the protagonist. When the Receipt-tape ribbon, the Reasoning Receipt, the Letter, the Sentence Builder, the card flip, and the Notebook are all "signature moves," none of them is. The product doesn't know what it is.

More critically: Frame 2 misjudges the user. The Notebook invites the user to read agent journals. The Letter invites them to engage with their own profile as a narrative. The Sentence Builder invites them to think carefully about scheduling grammar. These are investments the Beamix customer — who hired Beamix specifically to not think about GEO — has not asked to make. The artisanal register communicates "this is for people who love craft." The actual customer might be a dentist checking whether their practice ranks in AI search. That dentist should feel: this is competent, trustworthy, and working. Not: this is made by someone who is deeply passionate about typography.

**Daily-use feel after 6 months:** exhausting. The moves that delighted at first visit become friction. The typing animation on the Reasoning Receipt — which was magical at session one — is a 1.5-second tax at session forty-seven. This is not a hypothetical. It is the documented design debt of every product that frontloads personality.

**"12 moves competing for attention" critique — does Frame 3 over-correct?** Yes, but the critique of Frame 2 is correct. The over-correction is a separate problem.

---

### Frame 3 — Calm by Default, Depth on Demand

Frame 3 is the most disciplined of the three frames. The "One Status / One Decision / One Number" triad is a real design principle, not a compromise. The interaction philosophy — trust is the default, engagement is optional — is correct for the customer. The five mechanics (Inbox as Run Log, Agents-in-the-Roster, Async Handoff via Digest, Parallel Worker Visibility, Post-Action Enhancement) are borrowed from the right references and translate correctly.

**What it gets right:**

The information hierarchy is finally right. Above the fold = the answer. Below the fold = the evidence. The email digest as primary channel is right. The trust-tier routing is right. The onboarding rebuild (Vercel pattern, first scan live) is right. /crew as digest authoring tool is right. These are all good design decisions.

**What's wrong:**

Frame 3 solves the Frame 2 problem by removing things. But removal is not design. You can't earn a billion-dollar feel by taking things away. You earn it by making what remains extraordinary.

The "One Status / One Decision / One Number" above-the-fold is not, by itself, a visual design. It's a content model. What does the status sentence look like, typographically? What is the weight of the status pill? What is the spatial relationship between the sentence and the score number? What happens to the score number on first load — does it count up, or does it just appear? Where does the hand-drawn register live if not on primary surfaces? How much whitespace surrounds the One Number? These are the decisions that make a product feel billion-dollar, and Frame 3 doesn't make them. It describes what content to show and at what level of prominence. It doesn't describe what it looks like.

The deeper problem: Frame 3 demotes the hand-drawn register to email, /scan public, and /reports cover. But the hand-drawn register is Beamix's only visual differentiator from competitors. Every GEO tool looks like a SaaS dashboard. If Beamix looks like a SaaS dashboard with "calmer chrome," it looks like a less-featured version of Profound or Otterly at 3x the price. The hand-drawn register is not decoration — it's the product's proof of character. If you remove it from the primary surfaces the user visits every day, you've removed the product's identity from the user's daily experience.

**The core diagnosis:** Frame 3 is correct about content hierarchy and interaction model. It is wrong about visual identity. It confuses "calm" with "empty." The goal is not a sparse page — it is a page where every element is exactly right, and the elements are calm. These are different.

**Does it feel like a real billion-dollar product?** No. The surface reads as a wireframe that hasn't been designed yet. "One sentence and one number" is a spec, not a visual. Stripe's home page is also "a few numbers and some charts" — but those numbers are in perfectly specified tabular Inter, the charts have exactly the right stroke weight, the card borders are `rgba(0,0,0,0.06)`, the spacing is an 8px grid executed with discipline. That's the billion-dollar quality. Frame 3 describes what to put on the page without saying what the page should look like.

---

## Section 2: Frame 4 Proposal

---

### The thesis

The real question isn't "how much restraint?" It's: **what is the thing Beamix does that no other product does, and how do we make that visible?**

The answer: Beamix's crew of AI agents is working on your business right now, all the time, invisibly. You don't manage them. You just benefit. The product's visual job is to make that invisible work legible without making it burdensome to understand.

This is a different design brief than "managed service" (Frame 1's brief) or "operating studio" (Frame 2's brief) or "calm dashboard" (Frame 3's brief). The brief is: **make invisible work visible, at whatever level of detail the user wants.**

That brief produces a specific design language. It's quiet at the surface. But there's evidence of work everywhere — small, unobtrusive, but present. The product feels *alive* even when it's not demanding attention. That's the Frame 4 bet.

---

### The signature visual move

The single most important visual move in Frame 4 is what I'll call **The Activity Ring**.

Not a progress ring — Beamix isn't tracking a goal. An activity ring. A thin ring (2px stroke, #3370FF) that circles the score number on /home. The ring is not complete. It has a small gap, and the gap is proportional to how much work is left in the current "improvement cycle." When agents are working, the ring pulses at the gap — a single 1200ms breath animation at the terminus, not along the whole ring. When nothing is running, the ring is static. When a cycle completes (weekly scan + all triggered fixes applied), the gap closes for one second, then reopens at the new baseline.

This is the equivalent of what Linear does with its priority dot or Stripe does with its payment status pill. It's a symbol the user internalizes in the first week and reads in 0.3 seconds every visit thereafter. It costs almost nothing to implement. It communicates: "work is in progress, you don't have to do anything, here's roughly where we are."

The ring is the signature move. It is the thing that appears in screenshots. It is the thing Yossi shows a client to explain what Beamix is doing. It is the thing that differentiates Beamix from a static dashboard.

Secondary signature: **Crew Traces**. Tiny, muted, hand-drawn underscores below specific text elements on /home that an agent has recently modified or acted on. If Citation Fixer updated your FAQ count this week, the "11 FAQs" below-the-fold text has a faint Rough.js underline, roughness 0.6, `#3370FF` at 30% opacity. Not labeled. Not explained. Just present. Users who notice it can click it. Users who don't notice it miss nothing. Over time, power users (Yossi) start looking for the traces because they've learned they mean "something changed here." It's the product's way of showing work without narrating it.

These two moves — the Activity Ring and Crew Traces — give Beamix a visual identity that is unique, connected to the product's core promise, and achievable without an illustration budget.

---

### Above-the-fold density — the right answer

Frame 3's "one sentence and one number" is too sparse. But the solution is not to add more content — it's to add more visual weight to the content that's there.

The above-the-fold should contain exactly these elements, but executed with full visual design intention:

1. **The score number.** 72px InterDisplay-Medium, tabular nums, `font-feature-settings: 'tnum', 'cv11', 'ss03'`. The Activity Ring circling it at 80px outer radius. Color: #0A0A0A in light mode. This is the hero element. It should dominate the fold.

2. **The delta.** Immediately adjacent, same baseline, 28px Inter-Medium. A semantic color chip: +5 in `#10B981` or -3 in `#EF4444`. Tabular. No label — the number speaks for itself.

3. **The status sentence.** Below the number cluster, 20px Inter-Regular, #6B7280. "Your crew is working." or "Healthy and gaining." or "One thing needs you." This is the only text copy above the fold.

4. **The Decision Card.** If "needs you" state: a card appears directly below the status sentence. 16px padding, `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 12px`, single action button. Otherwise: nothing here. No placeholder. No empty space container.

The total above-the-fold real estate at 1440px, 900px viewport: approximately 420px vertical. The rest is viewport. That's not sparse — that's a visual decision. The score and ring take up roughly 200px together. The status sentence is 32px. The decision card (when present) is 80px. Total: 312px of content, 108px of breathing room above/below. That's Stripe-grade density: one clear focal point, maximum air.

What makes this "expensive" rather than "empty": the Activity Ring is executing. The score number is in a considered typeface with considered feature settings. The spacing is a deliberate 8px-grid decision, not an accident. The color of the status sentence is #6B7280 — not #9CA3AF, not #4B5563. The specific muted tone matters. These are the invisible 5,000 decisions that make something feel like a billion dollars.

---

### /home design — section by section

**Section 1: Hero (above the fold)**
Score + Activity Ring + delta + status sentence + conditional Decision Card. See above.

**Section 2: This Week's Net Effect (48px below fold)**
One paragraph in Inter-Regular 15px, line-height 24px, max-width 560px. Plain English. "Your crew shipped 6 changes this week. ChatGPT now cites you on 4 new queries. Schema Doctor resolved 3 structured data errors. Citation Fixer added 11 FAQ entries." No headers. No bullets. A paragraph. This is the digest in miniature — the user gets the weekly summary inline, not just via email. Crew Traces appear here: the specific nouns that agents acted on ("3 structured data errors") have faint Rough.js underlines.

**Section 3: Score Trend**
A 280px-wide, 80px-tall sparkline using `perfect-freehand` stroke, thinning 0.5, 2% jitter, 1.5px base stroke. 12 weeks of history. #3370FF. No axes, no labels, no grid. Hover: crosshair + tooltip showing date + score. Below the line: one label "12-week trend" in 12px Inter caps, letter-spacing 0.08em, #9CA3AF.

**Section 4: Engine Quick-Strip**
Seven engine chips in a horizontal row. Each chip: engine name, mini score (16px tabular), mini delta. Active engines have solid chip background `rgba(51,112,255,0.08)`. Inactive or unsupported (on this plan) have 40% opacity. Click any chip → /scans filtered to that engine. This row is the densest element on /home — it's also the most actionable for Yossi.

**Section 5: Recent Crew Activity**
A vertical list of 3-5 agent actions from the past 7 days. Format: `[Agent Name] · [action in one gerund clause] · [time delta]`. Example: "Schema Doctor · fixed 3 structured data errors · 2 days ago." 14px Inter-Regular, 44px row height, hover background `rgba(0,0,0,0.03)`, click → /inbox for that item. Crew Traces appear here on the text of any result that's newer than 24 hours — the trace is the freshness indicator.

**Section 6: Next Scheduled Run**
A single line. "Next scan: Friday at 9am." 13px Inter-Regular, #6B7280. A small calendar-dot icon in #3370FF at 12px. Click → /schedules. Nothing else. No card, no container.

That is the complete /home. Approximately 720px of total content height at 1440px. The page isn't sparse — it's full, but each element has earned its place and is executed at exactly the right visual weight.

---

### The Status Token — keep, modify, replace?

Keep it. Modify it.

Frame 3's three states (Healthy / Acting / Needs You) are correct. The modification is: don't put the token in the topbar chrome. Put it on the hero, adjacent to the score number.

The topbar can have a minimal indicator — a single 6px dot, either green (Healthy), blue-pulsing (Acting), or amber (Needs You). That's enough for navigation chrome. The full Status Token — with label text + semantic color background — lives adjacent to the score number on /home, and in the email digest header, and on the /scan public result.

This is important: the Status Token should be a semantic pill, not a generic badge. Three specific background+text combinations:
- Healthy: `background: rgba(16,185,129,0.08)`, text `#059669`, border `rgba(16,185,129,0.16)` — calm, receding green
- Acting: `background: rgba(51,112,255,0.08)`, text `#3370FF`, border `rgba(51,112,255,0.16)` — brand blue, present
- Needs You: `background: rgba(245,158,11,0.08)`, text `#D97706`, border `rgba(245,158,11,0.16)` — amber, not alarming

These are not traffic lights. They are not alerts. They are status readouts. The visual register is calm — even "Needs You" doesn't flash or pulse.

---

### Depth-on-scroll mechanic

The problem with Frame 3's "depth on demand" is that users don't know it's there unless you show them it's there. A blank section below the fold invites exit, not scroll.

Frame 4's solution: **the fold has a visual tell.** Specifically: Section 2 (This Week's Net Effect) is partially visible — maybe 36px of it pokes above the bottom of the viewport on a 900px screen. This is not a scroll-indicator badge. It's just the natural consequence of sizing the hero correctly. The partial text is readable but cut off. The user scrolls. That's it. No "See more" button. No animated arrow. Just the natural reading instinct.

The Crew Traces serve a secondary function here: they're the "trail of breadcrumbs" that makes users want to explore. A user notices a faint underline under "11 FAQs" and clicks it out of curiosity. They land in /inbox and see the actual change. Now they've found the depth layer organically, without the product ever saying "hey, there's depth here." That's the distinction between Frame 3's explicit "depth on demand" mechanic and Frame 4's ambient depth.

---

### Hand-drawn register — the right amount

Frame 2 had hand-drawn on 5+ primary surfaces. Frame 3 demoted to email, /scan, /reports cover. Frame 4's position: hand-drawn belongs on exactly the surfaces where the product is showing its work, not where it's asking the user to do work.

Specifically:
- **YES, primary surfaces:** The Activity Ring terminus (the gap point) is the one hand-drawn element above the fold on /home. It is not Rough.js — it's a subtle gap with a tiny hand-drawn dash, like a pencil mark. Crew Traces throughout /home below the fold.
- **YES, /workspace:** The agent execution view should have a lightly hand-drawn step list — Rough.js circles for step markers, roughness 0.8, consistent seeds. The page IS the journey here; the hand-drawn register communicates that this is a living process, not a database query.
- **YES, /scan public:** Locked. This is the acquisition surface; the strikethrough-and-rewrite mechanic stays. Full hand-drawn register is right here.
- **YES, email digest:** Header illustration, Crew Traces equivalent in the email body. The digest is an artifact the user opts into; hand-drawn is appropriate.
- **YES, /inbox empty state:** The empty inbox IS the success state. One small illustration — 96×96px, a desk drawer or a calm workspace sketch, Rough.js linework — that communicates "nothing here, everything's handled." This is earned because the empty state is emotionally significant.
- **YES, /reports PDF cover:** The artifact is the deliverable. Full craft here.
- **NO, /settings:** Completely clean. Stripe replica, no decoration.
- **NO, /schedules:** Admin. Table grammar only.
- **NO, /competitors:** Clinical intelligence. Data visualization stays crisp.
- **NO, /scans:** The receipt-tape mechanic was a great idea that Frame 3 correctly demoted. A Stripe table here is right.

Total: hand-drawn is present on 6 surfaces. It is absent on 4. Crucially, it is present on the surfaces that are about the product's work, and absent on the surfaces where the user is doing administrative work. That's the principle. The register maps to the meaning.

---

### Color, type, spacing — the canonical system

**Type scale (6 sizes, no more):**
| Role | Size | Weight | Font | Feature settings |
|---|---|---|---|---|
| Hero number (score) | 72px | 500 | InterDisplay | `tnum, cv11, ss03` |
| Section heading | 18px | 500 | InterDisplay | `cv11` |
| Body / row text | 14px | 400 | Inter | default |
| Label / caps | 12px | 500 | Inter | `smcp` or manual uppercase + tracking 0.08em |
| Caption / muted | 12px | 400 | Inter | default |
| Code / serial | 12px | 400 | Geist Mono | `tnum` |

No 11px. No 16px. No 24px. Six sizes, strictly enforced. The discipline is the design.

**Spacing: 8px base grid, 4px micro.**
- Component internal padding: 12px or 16px (never 10px, never 14px)
- Section vertical gap: 48px between major sections, 24px between subsections
- Card borders: `border-radius: 12px` on primary cards, `8px` on chips and pills
- Row height: 44px for all interactive rows (Stripe benchmark)
- Above-fold hero bottom margin: 48px to the fold indicator

**Colors:**
- Primary accent: `#3370FF`
- Text primary: `#0A0A0A`
- Text muted: `#6B7280`
- Text very muted: `#9CA3AF`
- Surface: `#FFFFFF`
- Surface elevated: `#F9FAFB` (not cream — cream is for artifacts, not UI)
- Border: `rgba(0,0,0,0.08)` (not `#E5E7EB` — the opacity-based approach responds correctly to dark mode)
- Score positive delta: `#10B981`
- Score negative delta: `#EF4444`
- Needs You amber: `#D97706`

**Neutral tone: warm gray, not blue-gray.** Per the Linear reference: neutrals biased toward greige, not slate. The `#6B7280` text muted is warm-neutral. The border at `rgba(0,0,0,0.08)` over white reads warm. This is the decision that separates "designed" from "default Tailwind."

---

### Motion budget

Frame 3 cut most animation. Frame 4 restores a specific subset, governed by a strict rule: **animation communicates state change. It does not decorate static states.**

Approved animations:
- **Score count-up on first load / first visit:** 800ms, ease-out. The number increments from 0 to the current score. Fires once per session (sessionStorage flag). This is the "your score is" moment. It earns the motion budget because it communicates that the number was calculated, not just fetched.
- **Activity Ring gap pulse:** 1200ms CSS keyframe modulating opacity 0.4 → 1.0 at the terminus only. Not the whole ring. `prefers-reduced-motion: reduce` → static ring.
- **Sparkline path-draw on /home:** First load per session, 1000ms ease-out, `clip-path` from left. The trend line draws itself once. This is data-level motion — it communicates that this is a trend, not a snapshot.
- **Crew Trace fade-in:** 300ms opacity fade when a trace first becomes visible in viewport. Subtle. If `prefers-reduced-motion`, skip.
- **Decision Card entrance:** 200ms spring with 6px translate-y. One element. Earns it because it's the thing requiring user action.
- **/workspace step draw:** The courier flow draws progressively as steps complete. Each step circle draws over 400ms. This is operational animation — it communicates real-time progress.

Not approved:
- Hero shimmer or gradient shift (Frame 2 had this). Too decorative.
- Page transition animations (deferred — not in MVP scope).
- Card hover lifts or scale transforms. Linear's "invisible details" philosophy: hover states should be felt, not watched.
- Any animation that repeats more than once per session on the same element.

---

### Empty states

The right number is three, not five (Frame 2) and not one (Frame 3).

1. **/home first-ever visit (no data yet):** One illustration, 120×120px, Rough.js linework. A simple house-and-magnifying-glass sketch — sparse, not cute. Caption: "Your crew is scanning. First results in your inbox within 24 hours." CTA: "Check your email settings." This is the emotional peak of onboarding — the product has just promised something. The illustration communicates warmth and forward momentum.

2. **/inbox empty (nothing to review):** The success state. Smaller illustration — 80×80px, a simple checkmark sketched in Rough.js or a closed laptop. Caption: "Nothing needs you. Your crew is working on 3 things." This is earned emotional design: the emptiness is reassurance, not failure.

3. **/competitors empty (no competitors added):** One illustration, 80×80px, the two-figure side-by-side sketch already locked. Caption: "Add a competitor to see how you compare." CTA: input field, inline, with placeholder "Try chatgpt.com or your top search rival."

Every other empty state — /scans empty, /workspace idle, /schedules empty — uses clean text only. No illustration. The discipline is: illustrations only where the emotional register matters. Empty /scans has no emotional register. Empty /inbox does.

---

### Personality and voice

Frame 2 put agent-first-person voice on five surfaces. Frame 3 demoted to email and depth views. Frame 4's position: voice belongs where the product is narrating its own work, not where the user is navigating the product.

Concretely:
- **Agent-first-person voice is used in:** the weekly digest email, /inbox individual item expansion (the Reasoning Receipt), /workspace step microcopy rotation, /crew per-agent activity descriptions.
- **Product-voice (neutral, terse) is used in:** /home status sentence, navigation, labels, empty states, settings, /scans table.
- **User-facing copy (second person, warm) is used in:** onboarding, decision cards, any state where the product is asking something of the user.

The personality isn't in every surface — it's in the work artifacts. When Yossi clicks into a /inbox item and reads the Reasoning Receipt, the agent voice is present and specific. "I rewrote three FAQ entries because Perplexity's most common question about your business is 'what's the price?' — not 'how does it work?' I phrased them the way Perplexity asks, not the way you'd write them in a brochure." That voice is the personality. It doesn't need to be in the navigation label.

---

### Mobile

None of the prior frames specced mobile seriously. This is a mistake. SMB owners check their phones between meetings. Here's the mobile daily experience for Frame 4:

**Above the fold on mobile (375px, 812px):**
The Activity Ring + score number, centered, takes approximately 180px. Below it: the status sentence in 17px Inter (larger than desktop — more comfortable thumb-scrolling distance). Below that: the conditional Decision Card at full width. Total above-fold content: ~280px. The rest of the screen is free. The partial text of Section 2 peeks at the bottom — same fold mechanic as desktop, same invitation to scroll.

**Navigation:** Bottom tab bar, 5 items: Home / Inbox / Scans / Crew / More. The "More" tab contains /competitors, /schedules, /settings, /workspace. Beamix is not a complex-navigation product — users come to see status and approve things. The bottom tab bar with five items serves both Sarah (who comes for Home + inbox) and Yossi (who also checks Scans + Crew daily).

**The Activity Ring on mobile:** same ring, smaller — 64px outer radius instead of 80px. The score number is 56px instead of 72px. Same pulse behavior at the terminus.

**Mobile-specific motion reduction:** on iOS, the `prefer-reduced-motion` setting is commonly enabled by battery-saver mode. Assume most mobile users get a static version. Design the static version to stand independently. The score just appears. The ring is static. The sparkline is rendered. All information is present; the motion is enhancement only.

**The Decision Card on mobile:** full-width, 16px margins on each side. The action button is `min-height: 44px` for thumb accessibility. This is the primary mobile action. It should feel large and confident.

---

### Cross-page coherence — the 5 design tokens that repeat everywhere

These are the elements that make the product feel like one product, not a collection of pages:

1. **The Status Token.** Three states, three semantic color combinations. Appears on: topbar (6px dot only), /home hero, email digest header, /scan public result, /reports PDF cover. The token is Beamix's brand mark for "we know what's happening."

2. **The Activity Ring.** Only on /home — but it's the hero element. Its specificity (the hand-drawn gap, the pulse) is what makes the product identifiable in a screenshot.

3. **Crew Traces.** The faint Rough.js underline below text that agents have recently modified. Appears on: /home below-fold text, /inbox item lists (on new items), /workspace completed step labels. This is the "invisible work made visible" token.

4. **44px interactive rows.** Every clickable row in every table or list is exactly 44px tall, with hover at `rgba(0,0,0,0.03)`. From /scans to /inbox to /crew to /schedules — the row height is consistent. The density is the same. This is the "this was made by professionals" signal.

5. **Tabular numerals + InterDisplay on all numbers.** Every score, every delta, every count in the product uses `font-feature-settings: 'tnum'` and InterDisplay or Geist Mono. Numbers are vertically aligned across rows. This is the Stripe benchmark, and it's the single fastest visual quality upgrade available at zero cost.

---

## Section 3: Open Questions for the Board

**1. For the PM seat:** Frame 4's Activity Ring is predicated on the product actually running continuous agent work. How frequently are agents actually running per user per week? If the average SMB user has 3-4 agent actions per week, the ring pulses 3-4 times. If it's 0-1, the ring is static almost always — and a static ring provides no dynamic value. What's the expected action density per user per week at launch, and does the UI degrade gracefully when action density is low?

**2. For the User Researcher seat:** The Crew Traces mechanic — faint underlines on text that agents have recently modified — is a discovery mechanic. It assumes users will notice and become curious. Is there evidence that the Beamix customer type (SMB owner, small marketing team) has the attention budget to notice subtle visual cues on a dashboard they're checking for 30 seconds? Or does this mechanic serve only Yossi (power user) and go unnoticed by Sarah? If Sarah misses all the Traces, the product feels "same as last week" to her even when work happened.

**3. For the Visionary seat:** The "invisible work made visible" thesis requires that agents are actually doing significant, comprehensible work — not just running maintenance scans. If agents are running but the output is "we checked and everything looks fine," the Activity Ring and Crew Traces communicate energy around emptiness. Is there a risk that the design over-promises the product's work output in weeks when not much changed? And is that a design problem or a product roadmap problem?

**4. For the PM + Visionary seats jointly:** Frame 4's signature visual move (the Activity Ring) is tightly coupled to the "agents working continuously" model. If the product pivots toward a less autonomous model — more "review and approve before acting" — the ring becomes misleading (it pulses even when agents are only in a "pending approval" state). Is the trust-tier default (auto-run for most actions, pre-approve for content changes) locked, or is it still variable? Because the ring design only works if the default is auto-run.

**5. For all seats:** Frame 4 retains the Reasoning Receipt in /inbox (typed-in on first selection per session, instant thereafter). Frame 3 killed it. My position is that the Receipt is the single most important trust-building mechanic in the product for the first 90 days — it's the moment a user understands that the agent reasoned, not just executed. But it adds build cost and has the session-one tax noted in Frame 2's critique. Does the board want to re-examine the Receipt decision, or is the "keep it, frequency-gate it" approach settled?

---

*Filed by the Designer seat. Push hard or don't build.*
