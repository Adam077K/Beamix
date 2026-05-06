# Onboarding Step 1–5 — Vertical-Aware Redesign v1.1
**Date:** 2026-04-28
**Owner:** Senior Product Designer (Beamix)
**Status:** Amends `2026-04-27-ONBOARDING-design-v1.md`. Surgical changes only.
**Source of locks:** Board synthesis 2026-04-27 (23 decisions), Marcus simulator §"plumber DNA leakage", Audit 3 §1.7 + §3.2, AI Engineer Truth File schema (shared base + vertical-extensions), Voice canon Model B.
**Surface:** `/onboarding/[1..4]` and the magic-moment landing on `/home`.
**Time target:** Unchanged. 4 minutes total. Step 1 ≤30s · Step 2 ≤30s · Step 3 ≤90s · Step 4 ≤60s · 7-second cinema on landing.

---

## 1. Why this redesign exists

Marcus's walkthrough on 2026-04-27 surfaced a rot under v1 we'd missed: **plumber DNA leaks through every step**. Step 2 issues three Tel Aviv phone numbers to a remote SaaS founder whose customers have never made a phone call. Step 4 demands business hours and service-area chips for a product available 24/7 to anyone with a laptop. The Brief — even when its prose is right — is anchored to the wrong vertical KG when the classifier is wrong (Risk 3: 20% misclass rate), and §5.6 of v1 forbids Reject. Marcus's exact words: *"Every second I'm on this page is a second where Beamix is showing me it was built for a plumber."*

The board's lock is unambiguous. Vertical-aware UI from Step 1 onward. SaaS path leads with UTM; e-commerce path leads with Twilio. Truth File required-field set differs per vertical via the `discriminatedUnion` schema. The seal signs *"— Beamix"* (Model B), not *"— your crew."* The Brief gets an escape hatch so the misclassified 1-in-5 customer can re-route their constitutional moment without abandoning the product.

v1.1 keeps every working frame from v1 — the 4-step IA, cream-paper register, Seal-draw cinematography, autosave + back/skip mechanics, the 7-second magic moment. It rewrites *only* the surfaces where vertical-awareness, the escape hatch, and the signature-line update demand it. **What changes is what Marcus's walk demanded; what stays is everything that survived him.**

---

## 2. Step 1 — Vertical-detection ceremony (≤30s)

### 2.1 What's new

v1's Step 1 had a single Industry combobox with `(change)` ghost link gated to confidence <70%. v1.1 elevates the Industry field to **the centerpiece of Step 1** — the moment Beamix announces *"we classified you, here's our confidence, change us if we're wrong."* Step 1 stays on `--color-paper` (cream is reserved for Step 3); the Industry field gets compositional weight equal to Website + Business Name combined.

### 2.2 Layout (640px well, on `--color-paper`)

```
[ 120px top breath ]

text-h2  "Confirm your business"             ink, 32px InterDisplay 500
text-base "We pulled this from your scan.    ink-3, 15px, max-w 480px
           Edit anything that's not right."  72px below h2

[ 48px gap ]

  Field 1 — WEBSITE                ← unchanged from v1
  Field 2 — BUSINESS NAME          ← unchanged from v1

  [ 24px gap ]

  Field 3 — INDUSTRY               ← redesigned
  Label (11px caps, ink-4):           "INDUSTRY"
  Helper (13px Inter, ink-3):         "We classified you as
                                       {vertical_label}. {confidence_text}
                                       Change us if we got it wrong."

  [ Combobox row, 56px tall, --color-paper, --color-border-strong ]
   Left 48%: pre-filled value, 16px Inter 400
   Right 48%: confidence indicator (dot + state) + "Change vertical →"
              ghost link, 13px ink-3 — ALWAYS visible

  [ 24px gap ]

  Field 4 — vertical-conditional (see §2.5)

[ 96px gap ]

  [ Back hidden ]                          [ Continue ]
```

### 2.3 Confidence indicator — three states

The IKG Curator returns confidence 0.0–1.0. Customer-facing mapping:

| Float | State | Indicator | Helper text |
|---|---|---|---|
| ≥0.85 | High | 6px filled `--color-healthy` | "92% confident — based on your homepage, schema, and competitor signals." |
| 0.65–0.84 | Medium | 6px filled `--color-needs-you` | "Pretty sure, not certain. Confirm or change us." |
| <0.65 | Low | 6px hollow ring `--color-ink-3` | "We took our best guess. Tell us what you actually do." |

The "Change vertical →" link is **always visible**, regardless of confidence. We never hide the escape.

### 2.4 The combobox — 12 verticals + "Other"

Click → 480px-wide popover (560px / sheet on mobile). Two sections:

```
ACTIVE NOW                                  (11px caps, ink-4)
●  B2B SaaS — developer tooling
●  E-commerce — DTC consumer goods

COMING SOON                                 (ink-4 caps, lighter)
○  Local services — home services           "Soon" pill, 11px Geist Mono
○  Local services — health & wellness       "Soon"
○  Local services — legal                   "Soon"
○  Professional services — agencies         "Soon"
○  Professional services — finance          "Soon"
○  Real estate                              "Soon"
○  Hospitality — restaurants & venues       "Soon"
○  Education — courses & cohorts            "Soon"
○  Non-profit & advocacy                    "Soon"
○  Creator economy & media                  "Soon"
───
◇  Other — describe in your words           [ free-text 40 char ]
```

"Coming soon" rows are **tappable with graceful fall-through**: clicking selects "Other" and pre-fills the descriptor with that vertical's label. Inline message: *"We don't have a specialist crew for this vertical yet — Beamix will use its generic playbook for now and graduate you when the {vertical} crew lands. We'll email you."* The roadmap is rendered as UI — Marcus and Dani see Beamix's ambition without a marketing page.

### 2.5 Field 4 — vertical-conditional

- **SaaS:** "WHERE ARE YOU HEADQUARTERED?" / *"For attribution + currency. Doesn't affect who you serve."* Optional.
- **E-comm:** "WHERE DO YOU SHIP?" / *"Your primary shipping market. Add more in Step 4."* Optional.
- **Other:** "PRIMARY LOCATION" (v1 default).

Switching Industry mid-Step-1 **re-renders Field 4's label/helper with a 200ms cross-fade**. The input stays mounted (preserves typed value). This is the **first physical proof of vertical-aware UX**.

### 2.6 Motion

- 0ms: page renders pre-filled.
- 100ms: 600ms fade-in on content well (unchanged from v1).
- On Industry change: 200ms cross-fade on Field 4's label/helper. New v1.1 beat.
- On confidence-state change (rare): indicator dot recolors over 200ms, no other motion.

### 2.7 Validation

`industry` resolves to a vertical KG ID OR "Other" + 1-40 char descriptor. Combobox commits on selection; "Other" requires non-empty descriptor before Continue enables. All other v1 §2.1 rules unchanged.

### 2.8 Time benchmark

High-confidence + no edits: **6s**. Medium-confidence + confirm: **18s**. Low-confidence + "Other" descriptor: **30s**.

---

## 3. The vertical bifurcation moment

Step 1's choice cascades into Steps 2, 3, 4, and the magic moment. The cascade is **visible by content, invisible by frame** — same product, same cinema, every word + field + example references their vertical. Shared visual language (cream paper, Seal-draw, 4-dot stepper, autosave tick, button motion, type scale) is **identical across paths**. Divergent content sits inside that shared frame.

| Surface | SaaS | E-comm | Other |
|---|---|---|---|
| Step 2 hero | UTM ceremony (§4) | Twilio ceremony (§5) | UTM-first, Twilio offered as secondary |
| Step 3 Brief | SaaS-vertical KG language | E-comm-vertical KG language | Generic Beamix template |
| Step 4 Truth File | SaaS extension fields | E-comm extension fields | Shared base + free-text extension |
| /home Evidence Card #1 | Schema Doctor first | Citation Fixer first | Highest-leverage finding |
| /home rotating Fraunces lines | SaaS-flavored | E-comm-flavored | Generic |

**What Marcus feels vs Dani:** Marcus walks Step 2 and sees a UTM tag generation ceremony — a string composer drawing into the page, a "Send to your developer" handoff with a copy-paste snippet ready for Liam. Dani walks Step 2 and sees three phone numbers fading in (v1 ceremony preserved), with copy *"when a customer asks ChatGPT for the best protein powder under $50 and your site comes up, this number tracks the call."* They walk the same product, different ceremonies. **Not skinning, not theming — aiming the moment at the customer who's actually here.**

---

## 4. Step 2 SaaS path — UTM-first ceremony (≤30s)

### 4.1 Purpose

Replace v1's phone-number theatre with a UTM tag generation ceremony. The customer watches Beamix compose tracked URLs, then hands them to their developer with a one-click "Send to your dev" mechanic. Lead Attribution Loop armed in the SaaS-native way.

### 4.2 Layout (640px well, on `--color-paper`)

```
text-h2   "Set up attribution"
text-base "When a developer asks Claude or ChatGPT for a tool
           like yours and your site shows up, we tag the click.
           You'll see 'A developer found you on Claude' in your
           inbox the moment it happens. No phone numbers — your
           customers don't call you."

[ 48px gap ]

[ Tagged URL composer panel — paper-elev, border, 12px radius, 24px pad ]
  Label: "YOUR TAGGED URLS"
  Row 1: acme-saas.com/?utm_source=beamix&utm_medium=ai_search
                       &utm_campaign=geo&utm_content=chatgpt
         13px Geist Mono, ink, with [ Copy ] ghost on right
         Below: 11px Geist Mono ink-4, "for ChatGPT-attributed clicks"
  Rows 2–7: same, one per active engine on tier
  Footer: "We'll add tags for {N more} engines on Scale." (ink-4)

[ 24px gap ]

[ Send-to-developer panel — paper-elev, same chrome ]
  Label: "SEND TO YOUR DEVELOPER"
  [ 📋 Copy snippet ]    [ ✉ Email to your dev ]
  ▸ View the snippet — collapsible <details>, 13px Geist Mono
    <pre> on paper bg, --color-border, 8px radius, ~12 lines

[ 24px gap ]

[ Verification check panel — paper-elev, same chrome ]
  Label: "VERIFICATION"
  ⌛ Checking acme-saas.com for our tags…       (initial)
  ✓  Tags detected on /pricing                  (success, healthy)
  ◯  Tags not yet placed — that's OK            (pending, ink-3)
  ⚠  Tags missing — see snippet above           (failure, needs-you)
  Helper: "We re-check every 30 seconds. You don't need to wait —
          we'll email you the moment it lands."

[ 96px gap ]

  [ ← Back ]   [ I'll set this up later ]   [ Continue ]
              ghost                          primary brand-blue
```

### 4.3 Motion — the UTM ceremony

v1's 700/1000/1300ms phone-fade is replaced with a **string-composing animation**. Each URL types itself at **80 chars/sec** (~1.0–1.4s per URL); cursor blinks at line-end during typing.

1. **0ms:** page renders, empty panel. **100ms:** well fades in (600ms linear).
2. **700ms:** Row 1 starts typing. Base `acme-saas.com/?` appears instant; query-string types letter-by-letter. ~1.1s.
3. **1800ms:** Row 1 helper line fades in (200ms). **2000ms:** Row 2 starts. **100ms gap between rows** (faster than v1's 300ms — more rows here).

Discover (3 engines): ~3.6s. Build (6): ~7.2s. Scale (11): ~13.2s.

**Continue enables when Row 1 completes** — remaining rows continue composing in background while customer reads. This is the only step where the page itself performs work in real time (v1's architecture preserved, strings instead of numbers). After all rows finish, verification begins polling at 2s, then every 30s.

### 4.4 Send-to-developer handoff (audit §3.3 missing piece)

**📋 Copy snippet** — clipboard copy. 13px Geist Mono "Copied — paste into your dev's Slack" tick fades for 2s.

**✉ Email to your dev** — 320px popover, email input pre-filled to `dev@{domain}` if detected. Templated email from `notify.beamix.tech`, signed *"— Beamix"*, subject *"Beamix · attribution snippet for {customer-name}"*. Plain-text body: *"{Customer} just signed up for Beamix and asked us to share this snippet with you. It tags AI-search traffic to {domain} so we can attribute clicks. Paste into your canonical-tag config or your `<head>`. Beamix will verify within 30 seconds of placement."* Attachment: `.txt` snippet. **No HTML email; no marketing flourish.** After Send: *"Sent to liam@acme-saas.com — Beamix will let you know when they paste it."*

### 4.5 Verification

Pings domain every 30s for the Beamix tracker. **Initial:** ⌛ pulsing dot. **Success:** ✓ healthy. **Pending (>30s):** ◯ ink-3. **Failure (>5min):** ⚠ needs-you. State persists into `/settings → Attribution`.

### 4.6 "I'll set this up later"

Promoted from v1's "Skip for now" to a **considered third option** between Back and Continue. Click → marks `attribution_setup = 'deferred'`, advances to Step 3, adds a /home Lead Attribution KPI card nudge: *"You haven't set up attribution yet — copy your tagged URLs"* with deep-link to `/settings → Attribution`. If Continue is clicked before verification success, we still advance — Beamix doesn't block onboarding on a dev task. Step 2 dot becomes v1's hollow tick.

### 4.7 Vocabulary + benchmark

SaaS vocabulary: *attribution, tagged URLs, clicks, sessions, AI-engine traffic, your developer, your `<head>`, your canonical tag.* Time: Continue at Row 1 complete **3s**; read + copy + email dev **45s**; wait for verification success **60s**.

---

## 5. Step 2 e-commerce path — Twilio-first ceremony (≤30s)

### 5.1 Preserved from v1

Layout, motion (700/1000/1300ms phone-number fade), 3-number panel, UTM tags strip below, "Skip for now" / "Issue & Continue" buttons. **This is Dani's ceremony, and it works.**

### 5.2 Three deltas vs v1

**(a) Helper copy rewrite:**
> "When a customer asks ChatGPT for the best protein powder under $50, or asks Perplexity 'what supplement brand has 90-day returns' — and your site comes up — this number tracks the call. You see 'Beamix got you 23 calls this month' in your inbox."

**(b) UTM panel renamed:** "UTM TAGS WE'LL USE" → **"PLUS UTM TAGS FOR YOUR PRODUCT PAGES"**. Helper: *"For shoppers who click through instead of calling. We tag every product link."*

**(c) Send-to-developer handoff added:** Same `📋 Copy snippet` + `✉ Email to your dev` buttons as SaaS path, but with e-comm-tailored snippet targeting `<link rel="canonical">` placement on `/products/*` and `/collections/*` URLs. Email pre-fills to `dev@{domain}` or `webmaster@{domain}`.

### 5.3 Time benchmark

Unchanged: 8s if hit Issue & Continue immediately, 25s if read.

---

## 6. Step 3 Brief — with escape hatch (≤90s)

### 6.1 Preserved

Cream-paper transition, Fraunces 22px Brief paragraph, chip mechanics, sentence-level edit/remove/add, autosave & versioning, Approve & Start button, Seal-draw signature ceremony. **§5.6 of v1 stands in spirit:** no Reject button. The Brief is constitutional; authorship cannot be refused. What was missing was a route to **re-author the constitution under the right vertical KG when classification was wrong** — that's what §6.2 adds.

### 6.2 The escape hatch — "↻ This doesn't describe my business"

Below the Brief paragraph, **left-aligned, 24px below the last sentence's `× remove` glyph margin**:

```
↻ This doesn't describe my business
   13px Inter, ink-3, with a Rough.js return-arrow glyph at 24% opacity.
   Hover: ink, glyph fills to 60%.
```

**Always visible. Never hidden behind hover.** The customer with a wrong-vertical Brief sees the escape from first paint.

**Click behavior:**

1. **0ms — confirm modal** (centered, 480px, paper on cream, shadow-lg, 12px radius). Not the only escape — the deliberation gate before destroying chip edits.
   - Title (text-h3): *"Re-route this Brief?"*
   - Body (text-base, ink-3): *"We classified you as **{current vertical}**. If that's wrong, we'll re-open the industry picker and draft a new Brief from scratch in the right vertical. Your current chip edits will be saved as a draft you can return to — they won't be lost."*
   - **Ghost button:** "Keep editing this one"
   - **Primary:** "Pick a different vertical"
2. On primary → modal dismisses (200ms fade). Page returns to **Step 1** with the **Industry combobox auto-opened**, focused, helper text reading *"What did we get wrong?"* in `--color-needs-you`. Existing Brief moves to `briefs.discarded_drafts` (preserved, not deleted). 4-dot stepper highlights Step 1 again.
3. Customer picks new vertical → Continue. Step 2 plays in the new vertical's ceremony (skippable as always). Step 3 re-drafts the Brief from the **new vertical's KG** in the background while Step 2 plays. By the time customer reaches the new Step 3, the new Brief is ready.

### 6.3 Edge cases

- **Multiple re-routes:** If customer escapes more than twice in a session, the second confirm modal adds a tertiary link: *"Use 'Other' instead →"* — jumps directly to "Other" + free-text.
- **Discarded drafts:** Recoverable in `/settings → Brief history`. Customer can copy text but can't resurrect the seal — only one signed Brief lives at a time.
- **Re-route after sign:** Replaced by `/settings → Re-author Brief` flow (out of scope for MVP onboarding spec).

### 6.4 The chip universe vertical-bind

When a chip popover opens, the header reads in 11px Geist Mono caps:

```
QUERY PATTERNS · B2B SaaS — developer tooling
```

A tiny but load-bearing UI move: every chip edit shows *which vertical's universe they're inside*. If they see "B2B SaaS" while reading "emergency-plumbing queries," the dissonance is evident in the same gesture, and the escape hatch is right below the Brief.

### 6.5 Brief draft fallback (calibrated to confidence)

If IKG returned medium confidence (0.65–0.84) at Step 1, the Brief generator **automatically holds back its strongest claims**: shorter (3–4 sentences vs 5–6), softer hedges ("Beamix recommends starting with…" vs "Beamix recommends focusing on…"), one closing sentence: *"If this doesn't sound like your business, swap our vertical above."* This sentence **inline-links to the escape-hatch confirm modal** — a second route in. Confidence calibration of language is an ethical move, not just UX — the Brief admits its uncertainty when warranted.

### 6.6 Time benchmark

High-confidence read + approve: **35s** (unchanged from v1). Misclassified escape + re-run: **+90s** for round-trip. Acceptable; better than abandonment.

---

## 7. Step 4 vertical-aware Truth File (≤60s)

### 7.1 Schema architecture (per AI Engineer board lock)

Truth File is a Zod `discriminatedUnion` keyed by `vertical_id`. **Shared base** applies to every vertical. **Vertical extensions** are conditional. Customer sees one form; switching vertical (via the escape hatch) re-renders the form.

### 7.2 Shared base fields (every vertical)

| # | Label | Type | Required | Min validation |
|---|---|---|---|---|
| Base.1 | BUSINESS NAME | text 1-80 char | yes | 1 char |
| Base.2 | VOICE — three words | 3 × 1-word fields | yes | 3 fields, each 1 word, 1-20 char |
| Base.3 | THREE CLAIMS YOU CAN DEFEND | 3 × textarea | yes | each ≥10 chars or ≥3 words |
| Base.4 | ANYTHING WE SHOULD NEVER SAY | textarea | optional | none |

Voice + claims + never-say is the **trust core** — every word Beamix publishes is checked against these regardless of vertical.

### 7.3 SaaS extension fields

Replaces v1's hours / services / service-area triple:

| # | Label | Type | Required | Helper |
|---|---|---|---|---|
| SaaS.1 | INTEGRATIONS YOU OFFER | chip-input list, 5–25 | yes (≥3) | "What does your product connect to? Beamix names these in answers like 'works with Slack, GitHub, and Datadog.'" |
| SaaS.2 | PRICING MODEL | radio + conditional sub-fields | yes | "How do customers pay you? Beamix won't quote a price unless this matches your site." Options: `per-seat` · `per-usage` · `flat-tier` · `freemium` · `usage-based-tiered` · `custom`. |
| SaaS.3 | TARGET COMPANY SIZE | combobox 1-select | yes | "Beamix uses this to qualify mentions. Don't show your tool to a 50-person company looking for enterprise." Options: `solo / 1-10` · `11-50` · `51-200` · `201-1000` · `1000+` · `any`. |

**No hours field. No service-area field.** SaaS form components literally don't render. Marcus's "every one of these is a 1-second moment where I think this product was built for a different customer" killed at the schema level.

### 7.4 E-commerce extension fields

| # | Label | Type | Required | Helper |
|---|---|---|---|---|
| Ecom.1 | SHIPPING REGIONS | chip-input list | yes (≥1) | "Where do you ship? Beamix won't recommend you to a UK shopper if you only ship US." |
| Ecom.2 | RETURN POLICY | textarea, 1-3 sentences | yes | "Days to return + condition. Beamix quotes this verbatim. 'No returns' is also a valid answer." |
| Ecom.3 | PRODUCT CATEGORIES | chip-input list, 3–15 | yes (≥3) | "The product types you sell — 'protein powder', 'creatine', 'pre-workout'. Beamix matches these to ChatGPT shopping queries." |

### 7.5 "Other" fallback fields

| Other.1 | THE 5–15 THINGS YOU OFFER | chip-input list, 5–15 | yes (≥3) | "List what you actually sell or do. One per line." |
| Other.2 | WHERE YOU OPERATE | chip-input list | yes (≥1) | "Cities, regions, or 'global' / 'national'." |
| Other.3 | WHEN YOU'RE OPEN | 7-day mini-table OR "always available" radio | yes | "Most generic businesses have hours. SaaS-style 'always-on' products: pick that radio." |

Safety net for "Coming soon" verticals — same rough shape as v1 but presented as **generic catch-all**, not as the implicit-default-for-everyone.

### 7.6 Layout (640px well, on `--color-paper`)

```
text-h2   "What's true about your business"
text-base "Beamix checks every word it publishes against this file.
           {vertical-conditional second sentence}. Take a minute."

  ↑ vertical-conditional second sentence:
    SaaS:  "Especially your integrations and pricing model — a wrong
            claim about either is a deal-killer."
    Ecom:  "Especially your shipping and return policy — these decide
            whether a shopper trusts the answer."
    Other: "Get the basics right and the rest follows."

[ 48px gap ]

[ Truth File form ]

  ── SHARED BASE ──                    (11px Geist Mono caps eyebrow,
                                        ink-4, 0.10em, 1px hairline left+right)

  Base.1 BUSINESS NAME
  Base.2 VOICE — three words
  Base.3 THREE CLAIMS YOU CAN DEFEND
  Base.4 ANYTHING WE SHOULD NEVER SAY

  ── {VERTICAL} SPECIFICS ──           (same eyebrow treatment)

  [ extension fields per §7.3 / §7.4 / §7.5 ]

[ 96px gap ]

  [ ← Back ]                                  [ File this and start ]
```

The eyebrow labels are *the receipt that the form is doing the right thing for the customer* — Marcus sees "── B2B SAAS SPECIFICS ──" and instantly knows Beamix understood him.

### 7.7 Pre-fill rules per vertical

- **SaaS:** Integrations from `<meta name="generator">`, robots-discoverable docs, footer "integrates with" sections. Pricing model from `/pricing` page schema or h2/h3 patterns. Target company size from copy heuristics ("for teams of 10-100"). v1 brand-blue dot indicator.
- **E-comm:** Shipping regions from address schema, hreflang, footer "Ships to". Return policy from `/returns` or `/policies/refund` (structured extraction). Product categories from `/collections/*` URL pattern + nav menu.
- **Other:** v1 logic preserved.

### 7.8 Validation

Required-field set enforced per vertical. Server-side garbage-checks from v1 §2.4 preserved (claims ≥10 chars, voice exactly 3 words). SaaS-specific: integration list ≥3 entries each ≥3 chars (rejects `a, b, c`); pricing-model radio must be selected.

### 7.9 Time benchmarks

SaaS with high pre-fill: **40s**. SaaS without pre-fill: **90s**. E-comm with high pre-fill: **35s**. "Other": **90s**.

---

## 8. Step 5 magic moment + first-agent-by-vertical

### 8.1 Cinematography preserved

The 7-second cinema from v1 §3 is preserved verbatim: button transition → Step 4 fade-out → SPA navigation → /home skeleton → Score count-up (1200ms) → Ring draw (1500ms) → Fraunces line types → Evidence Card #1 slide-up at 5000ms → Crew at Work strip pulses on at 5500ms with 80ms stagger.

### 8.2 First-agent-by-vertical

| Vertical | First agent | Why |
|---|---|---|
| **B2B SaaS** | **Schema Doctor** | SaaS sites have highest concentration of `SoftwareApplication` / `FAQPage` / pricing-page schema gaps. Evidence Card: *"3 schema errors on /pricing — fixing now"*; diff *"+ SoftwareApplication · + FAQPage on /pricing · - duplicate FAQ id"*. |
| **E-commerce** | **Citation Fixer** | E-comm sites already have `Product` schema (Shopify ships it). Leverage is in **product-query citations**. Evidence Card: *"11 product FAQ entries drafted — review in your Inbox"*; diff *"+ ChatGPT-style answers for /collections/protein"*. |
| **Other** | Highest-leverage finding | Schema Doctor first if errors detected; Citation Fixer otherwise. |

Implemented as vertical-keyed priority list in the Inngest scan job. Customer sees the right card on first paint.

### 8.3 Rotating Fraunces lines — vertical-flavored

**SaaS rotation:**
- *"We received your Brief. We're reading your homepage right now."*
- *"Schema Doctor is fixing 3 errors on /pricing."*
- *"Citation Fixer drafted 11 developer-FAQ entries — they're in your Inbox."*
- *"Competitor Watch is reading {top_competitor}'s docs."*
- *"FAQ Agent is matching how Claude asks 'best library for' questions."*
- *"Trust File Auditor checked your integration claims against your Truth File. All clear."*
- (settled): *"Beamix shipped {N} changes this hour. {needs_you_count} thing needs you."*

**E-comm rotation:**
- *"We received your Brief. We're reading your /collections pages."*
- *"Citation Fixer drafted 11 product-question entries for ChatGPT."*
- *"Schema Doctor is auditing Product schema on /collections/protein."*
- *"Competitor Watch is reading {top_competitor}'s shipping page."*
- *"FAQ Agent is matching how shoppers ask 'is X worth it' on Perplexity."*
- *"Trust File Auditor checked your return-policy claims. All clear."*
- (settled): same canonical line.

### 8.4 Lead Attribution empty-state vertical-conditional

Marcus called this out: *"A SaaS user who skipped phone should see 'Lead attribution starts when developers click your tagged URL — copy your UTM here →'."*

**SaaS empty state:**
> "Lead attribution starts when developers click your tagged URLs.
> Copy your UTM here → / Send to your dev →"

**E-comm empty state:**
> "Lead attribution starts 24 hours after your tracked phone number is live on your site.
> Copy your number → / Connect a number →"

**Other empty state:**
> "Lead attribution starts when traffic lands on a tagged URL or a tracked number rings.
> Choose your method →"

This carries through to /home spec — empty-state is **never plumber-shaped on a SaaS account**.

---

## 9. Signature canon update — "— Beamix"

### 9.1 The change

Voice canon Model B locks: external-facing artifact surfaces sign **"— Beamix"**, not "— your crew." The Brief is an artifact — even though it's in-product, it's the founding document the customer authored *with* Beamix. Step 3 signature: *"— your crew"* → **"— Beamix"**.

### 9.2 Motion + typography spec

**Updated 2026-04-28 — pen-stroke cut (Rams + Ive convergence).** The 1300ms signature beat stays in the timeline, but the mechanic changes: the line "— Beamix" appears via 300ms opacity fade-in, NOT a stroke-draw or letter-by-letter pen animation. The Seal IS the signature; the typed wordmark is the read-back. Cutting reasoning: "the same gesture twice — like pressing send and then pressing send."

- **Typography:** "— Beamix" rendered as live text (Fraunces italic 300, 22px, opsz 144, soft 100, wonk 0, ss01, `--color-ink`). No pre-extracted SVG outline required for animation. The opentype.js extractor pipeline can be removed from build (it remains optional only if static SVG glyphs are needed for the print PDF).
- **Animation:** 300ms opacity fade-in, curve `cubic-bezier(0.4, 0, 0.2, 1)`. No stroke-dasharray. No letter-by-letter timing.
- **Capitalization:** capital B, lowercase rest (matches marketing wordmark — preserves brand recognition between in-product and external surfaces).
- **Position:** below Brief, right-aligned to Seal's bottom-right margin (preserved from v1).
- **Mobile:** 18px Fraunces italic 300 (preserved scale-down).

### 9.3 What stays unchanged

- Seal-draw at 400ms (six-point sigil, seeded from `user_id` hash) — **re-curved 2026-04-28 to 540ms STAMPING motion: 240ms path-draw with `cubic-bezier(0.34, 0.0, 0.0, 1.0)` + 100ms hold + 200ms ink-bleed (60% → 100% opacity).** The Seal is stamped, not drawn.
- 50ms scale-overshoot at 940ms (was 1200ms; shifts forward with the shorter Seal duration).
- Geist Mono header cross-fade `BRIEF · DRAFT v1` → `BRIEF · v1 · SIGNED ...`.
- Chip-deactivation sweep at 1900ms.
- Page transition to Step 4 at 2500ms.
- **Total signature ceremony: 2.5s. Unchanged.**

### 9.4 Cascade

| Surface | v1 | v1.1 |
|---|---|---|
| Step 3 Seal | "— your crew" | **"— Beamix"** |
| Magic-moment rotation (settled) | "Your crew shipped {N} changes" | "Beamix shipped {N} changes" |
| /home settled status sentence | "Your crew shipped 6 changes this week" | "Beamix shipped 6 changes this week" |
| Email signatures | "— Beamix" | preserved |
| Monthly Update PDF signature | "— Beamix" | preserved |

`/crew` keeps agent names (Schema Doctor's first-person blurb stays). `/workspace` keeps agent names. **Model B holds: agents are named where the customer is *inside the system*; "Beamix" signs anything the customer leaves the system holding.**

### 9.5 Step 3.5 — "Print this Brief" (F27, 2026-04-28 addition)

After the Seal lands and the signature appears, a single offer renders below the Brief:

- 14px Inter 400 ink-3 link "Print this Brief →"
- Centered, 32px below the signature line
- Visible for 8 seconds; dismissable via Continue button or implicit timeout
- Click → generates a single A4 PDF of the Brief in cream-paper editorial register (cream paper, Fraunces 300, signed Seal, dated)
- Server-side generation via existing React-PDF infrastructure (zero net new engineering)
- One-time offer per Brief signing — never appears again

Most customers won't click. The 7% who do print and pin to a wall become evangelists. Cost: <1pd.

---

## 10. Accessibility, mobile, motion preservation, autosave

All preserved from v1 §6 + §8. v1.1 specifics:

- **Reduced motion:** UTM ceremony renders all rows instantly; verification check shows static success/pending; Field 4 cross-fade is instant.
- **Keyboard:** Industry combobox arrow-key navigable, Enter to select, Esc to close. Escape-hatch confirm modal traps focus.
- **Screen readers:** confidence indicator `aria-label` matches helper. Eyebrow caps are `<h3>` semantically. Escape hatch link `aria-label="Re-classify your business and re-draft the Brief"`. Signature draw `aria-hidden="true"` with `aria-live="polite"` announcing *"Brief signed — Beamix"* on completion.
- **Color contrast:** Confidence indicators (`--color-healthy`, `--color-needs-you`, `--color-ink-3`) all pass 3:1 against paper/paper-elev at 6×6 dot size; helper text 4.5:1.
- **Mobile:** Industry combobox becomes bottom-sheet. Field 4 cross-fade preserved. Escape-hatch confirm is bottom-sheet (max 60vh). UTM composer rows wrap cleanly at 327px effective width — line-break after `&utm_medium=...`.
- **Autosave:** Industry combobox saves on selection commit. Vertical change triggers server action persisting `vertical_id` and re-keying all subsequent step state.

---

## 11. Delta vs v1

### Changed

| Section | v1 → v1.1 |
|---|---|
| Step 1 Industry | Pre-filled combobox, `(change)` if conf <70% → confidence-indicator ceremony, always-visible "Change vertical →", 12-vertical roadmap with "Coming soon", "Other" + free-text fallback |
| Step 1 Field 4 | Fixed "PRIMARY LOCATION" → vertical-conditional (HQ for SaaS, Shipping for e-comm, Location for Other) |
| Step 2 SaaS path | (didn't exist) → UTM ceremony, string-composer animation, Send-to-developer handoff, verification check |
| Step 2 e-comm path | Single Step 2 design → preserved as e-comm path; copy refined; Send-to-dev handoff added |
| Step 3 Brief escape | No reject / no escape → "↻ This doesn't describe my business" + confirm modal + re-route |
| Step 3 Brief language | Single template → vertical-bound chip dropdowns; popover header shows current vertical; medium-conf Brief uses softer hedges |
| Step 4 schema | Fixed 6 fields → shared base (4) + vertical extensions (3 SaaS / 3 e-comm / 3 Other) + eyebrow separators |
| Step 3 signature | "— your crew" → **"— Beamix"** (Model B) |
| /home first agent | Schema Doctor default → vertical-bound (Schema Doctor / Citation Fixer / fall-through) |
| /home empty states | Phone-only → vertical-conditional |
| /home rotating lines | Generic crew → vertical-flavored |
| /home settled status | "Your crew shipped…" → "Beamix shipped…" |

### Unchanged

4-step IA, 4-minute target, 4-dot stepper, no top "Skip". Layout primitives (640/720px wells, 120px top breath, 96px primary gap, 56px buttons, 8/12/24/48/72/96/120 scale). Step 1 Field 1 + Field 2. Cream-paper transition into Step 3 (800ms). Chip mechanics (click-expand, sentence-edit, sentence-remove ×, add-sentence picker, 200ms). Seal-draw at 400ms (Rough.js, 32×32, brand-blue 1.5px, seeded, 800ms). 50ms scale-overshoot at 1200ms; Geist Mono header cross-fade at 1900ms. 2.5s total signature ceremony. 7-second magic-moment cinema. /inbox notification dot ~90s after landing. Voice rules. Re-entry banners. Autosave + 800ms "Saved" tick. Reduced-motion designed static states. Mobile chrome (24px gutters, 64px top breath, sticky primary on Step 3). Tier differences (engines/agents counts) with vertical-aware nuances.

### Deleted

Phone-number ceremony as *universal* Step 2 (preserved as e-comm path). Fixed 6-field Truth File. "— your crew" signature. Single Industry combobox treatment. The "(change)" sub-link gated to conf <70%.

---

## 12. Reference exemplars analyzed

**Vercel — framework detection.** Confident claim, shown basis, never-hidden override. "Framework Preset: Next.js — Override" is the spiritual ancestor of "Change vertical →". Vercel renders dryly; Beamix renders with editorial weight because the classification *governs everything downstream*.

**Linear — workspace setup.** Required fields feel inevitable through pre-fill quality, not restrictive UI. v1.1's vertical pre-fill mirrors Linear's email-to-team-name auto-derivation. Beamix exposes *confidence* — Linear's pre-fills are deterministic; ours are probabilistic and we say so.

**Cursor — AI-detection moment.** Magic moment is when the system demonstrates, with the user's own data, that it understood them. v1.1's Brief is Beamix's equivalent. Cursor can be wrong-in-the-moment without breaking trust (next keystroke fixes it); the Brief is a *constitutional* error if wrong. The escape hatch is what makes the constitutional moment safe to enter.

**Stripe Atlas — business-type vertical-detection.** Curated dropdown routes the rest of the flow accordingly. v1.1's Truth File schema discrimination on `vertical_id` is the same architectural move — same Zod `discriminatedUnion` pattern. Atlas renders per-type forms in identical chrome with only fields differing; v1.1 holds the same discipline.

**What v1.1 adds beyond exemplars:** None surface a **constitutional artifact** the way the Brief does. None sign with a wax seal. None carry the **anti-anxiety cinematography**. Vertical-aware pattern from Atlas; confidence-driven mechanic from Vercel; non-skippable-friction-with-pre-fill from Linear; **escape-hatch back into the constitutional moment after re-routing the vertical** is Beamix-original — none of them sign a constitution.

---

## Closing

v1.1 ships in 4 minutes, recognizes Marcus and Dani as different humans by Step 1 second 6, hands Marcus a UTM tag for Liam and Dani a phone number for her ringer, signs Marcus's constitution as a SaaS founder and Dani's as an e-comm operator with the same wax seal but with vertically-correct chips, and lets either of them re-author their entire constitution with an "↻ This doesn't describe my business" link if Beamix got the vertical wrong. **Plumber DNA is excised at the schema level, not patched at the copy level.** The signature is "— Beamix" because the constitution is theirs *with* Beamix, not Beamix's *to* them.

Strip the vertical-conditional cascade and we ship the bolt-on Marcus walked away from. Strip the escape hatch and we lose the 20% of misclassified to abandonment. Strip the schema discrimination and we ask SaaS founders for business hours and forfeit Marcus's renewal. Keep all three and onboarding becomes the moment where a B2B SaaS founder, a DTC operator, and an "I'll describe it in my own words" creator each feel — same product, same cinema, three constitutional moments — that this product was built for them.

— *the senior product designer*
