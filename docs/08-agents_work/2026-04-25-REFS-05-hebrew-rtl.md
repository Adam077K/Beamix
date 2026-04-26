# Reference Hunt 5 — Hebrew/RTL B2B References

Date: 2026-04-25
Goal: Get Beamix's Hebrew/RTL right by copying from products that already nailed it.
Researcher: researcher-hebrew-rtl (Opus 4.6)

---

## TOP 5 ANCHORS for Hebrew B2B SaaS

**Confidence: MEDIUM** — Based on public documentation, community forums, and design system analysis. Direct product inspection (logging in with Hebrew locale) was not performed.

### 1. Wix (wix.com) — The Gold Standard for Hebrew-Native Product

**WHY:** Wix is an Israeli company with Hebrew as a first-class language since day one. Their editor, dashboard, and account management all support full RTL Hebrew. They support all UTF-8 languages including Hebrew natively.

**WHAT TO COPY:**
1. **Language switcher in account settings** — Profile > Language & Region, clean dropdown
2. **Full dashboard RTL flip** — sidebar moves to right, content flows RTL
3. **Mixed-content handling** — their editor handles bidirectional text (Hebrew paragraph with English brand names) as a core feature, not an afterthought
4. **Hebrew font library** — Wix maintains a curated Hebrew font collection accessible in the editor
5. **Callback support in Hebrew** — even customer support operates in Hebrew
6. **RTL form builder** — although still improving (forms RTL is a noted gap), the pattern of progressive RTL rollout is instructive
7. **Account language vs. site language separation** — user can have Hebrew dashboard but build English sites

Source: [Wix Help Center — Languages](https://support.wix.com/en/article/languages-available-in-the-wix-site-builders) | [Wix Multilingual RTL](https://support.wix.com/en/article/wix-multilingual-using-multi-state-boxes-to-switch-from-ltr-to-rtl)

### 2. Google Workspace Hebrew (Google Israel "Goliath" Project)

**WHY:** Google Israel ran a massive Hebrew localization project called "Goliath" that rewrote their entire Hebrew UI. This is the most documented case study of Hebrew B2B microcopy done right. Kinneret Yifrah (Israel's most prominent UX writer) led the effort.

**WHAT TO COPY:**
1. **Transcreation over translation** — they rewrote, not translated. "Search Google or type URL" became a conversational Hebrew sentence
2. **Avoiding imperatives** — Hebrew imperatives are gendered and feel aggressive. Google switched to softer forms: "Getting started with..." instead of "Start" (male imperative)
3. **"Compose" became "New Email"** — functional description over abstract verbs
4. **English fallback for established terms** — "Campaign" and "Track" stayed in English because Hebrew users found English more familiar. But "Tab" (לשונית) stayed Hebrew because it was established
5. **Four core principles:** inclusive addressing, avoid imperatives, thoughtful terminology, friendly tone
6. **Plural + gender-neutral phrasing** — systematically replaced gendered forms
7. **Natural, fluent, authentic language** — their stated goal was Hebrew that sounds like Hebrew, not translated English

Source: [Google Israel Goliath Project — Kinneret Yifrah on Medium](https://medium.com/@Kinneret/a-glimpse-into-google-israels-great-language-and-localization-update-project-9fa83f4489c9)

### 3. monday.com — Israeli B2B SaaS at Scale

**WHY:** Largest Israeli B2B SaaS with partial Hebrew support. Their Vibe design system is public and well-documented. Instructive both for what they do well and where they fall short.

**WHAT TO COPY:**
1. **Language switch in profile settings** — Profile > Language and Region tab
2. **RTL text support in WorkForms** — Hebrew + Arabic text alignment
3. **Font stack insight** — monday.com uses Figtree (primary) + Poppins + Roboto for their platform. Figtree does NOT support Hebrew — meaning they likely fall back to system fonts or a secondary Hebrew font for Hebrew content
4. **Vibe Design System** is public at vibe.monday.com — study their spacing, type scale, and component patterns

**WHAT NOT TO COPY:**
5. **Incomplete Hebrew support** — community forums show ongoing requests for full Hebrew language support, RTL email alignment, and comprehensive localization. Their RTL is partial, not full.
6. **Emails are still LTR** — a known pain point for Hebrew users
7. **Font gap** — primary font (Figtree) lacks Hebrew glyphs, creating a typographic mismatch

Source: [monday.com Available Languages](https://support.monday.com/hc/en-us/articles/360003503760-Available-languages-for-monday-com) | [monday.com RTL Feature Request](https://community.monday.com/t/feature-support-language-from-righ-to-left-hebrew/24732) | [monday.com Brand Typography](https://www.brand-monday.com/typography) | [Vibe Design System Typography](https://vibe.monday.com/?path=/docs/foundations-typography--docs)

### 4. Bit (bit.co.il) — Israeli Fintech, Hebrew-First Consumer App

**WHY:** Bit is Israel's dominant peer-to-peer payment app (Bank Hapoalim). It is Hebrew-first by design, used by millions of Israelis daily. The product never feels "translated" because Hebrew IS the primary language.

**WHAT TO COPY:**
1. **Hebrew-first, English-second mindset** — the entire UX is designed for Hebrew readers
2. **NIS currency display** — prices in ₪ with Hebrew formatting conventions
3. **Israeli payment method integration** — Bit, Paybox as first-class options
4. **Conversational Hebrew tone** — friendly, direct, no formal register
5. **Date formatting** — Israeli date conventions (DD/MM/YYYY)
6. **Phone number formatting** — Israeli format with 05X prefixes

Source: Observation-based (Israeli market knowledge). **Confidence: LOW** — no direct inspection performed.

### 5. shadcn/ui (RTL Implementation Reference)

**WHY:** This is Beamix's component library. shadcn/ui has first-class RTL support since late 2024, making it the most directly actionable reference.

**WHAT TO COPY:**
1. **`rtl: true` in `components.json`** — single toggle enables RTL transformation
2. **CSS logical properties** — `left-*`/`right-*` auto-convert to `start-*`/`end-*`
3. **Directional animation transforms** — `slide-in-from-right` becomes `slide-in-from-end`
4. **`DirectionProvider` component** — wraps the app for RTL context
5. **Icon flip via `rtl:rotate-180` class** — for directional icons
6. **Font recommendation: Noto family** paired with Inter or Geist for RTL
7. **Migration path** — `pnpm dlx shadcn@latest migrate rtl [path]` for existing installations

Source: [shadcn/ui RTL Documentation](https://ui.shadcn.com/docs/rtl)

---

## FULL REFERENCE LIBRARY

**Confidence: MEDIUM overall.** Direct product inspection was limited; most data from public docs, community forums, and design system documentation.

### Israeli B2B SaaS Products

| # | Product | URL | Hebrew Access | Typography | Mixed Content | RTL Nav | Language Switcher | Verdict for Beamix |
|---|---------|-----|---------------|------------|---------------|---------|-------------------|--------------------|
| 1 | **Wix** | wix.com | Account Settings > Language > עברית | Hebrew font library (many options); editor supports custom Hebrew fonts | Excellent — bidirectional text is core product feature | Full dashboard RTL flip, sidebar moves right | Profile > Language & Region dropdown | **PRIMARY ANCHOR** — study their dashboard RTL patterns |
| 2 | **monday.com** | monday.com | Profile > Language and Region | Figtree (no Hebrew) + Poppins + Roboto; Hebrew likely system fallback | Partial — WorkForms has RTL, emails do not | Partial RTL support | Profile settings dropdown | **CAUTIONARY** — shows what incomplete Hebrew looks like |
| 3 | **Fiverr** | fiverr.com | Footer language selector / fiverr.com/he | Not documented publicly | Brand names stay English within Hebrew flow | Partial — marketplace adapts, not full dashboard flip | Footer dropdown | Study marketplace category naming in Hebrew |
| 4 | **eToro** | etoro.com | App language settings | Not documented publicly | Financial data (USD, percentages) stays LTR within RTL | Reported partial RTL | Settings | Financial data display patterns (numbers, charts) |
| 5 | **Lemonade** | lemonade.com | Israeli market detection | Custom brand fonts; specifics undocumented for Hebrew | Insurance terms mix Hebrew + English | Unknown depth | Unknown | Insurance/fintech claim flow in Hebrew |

### Israeli Consumer Apps (for Design Language)

| # | Product | URL | Hebrew Access | Key Pattern to Study |
|---|---------|-----|---------------|---------------------|
| 6 | **Bit** | bit.co.il | Default (Hebrew-first) | Hebrew-first consumer fintech UX, NIS formatting, conversational tone |
| 7 | **Pango** | pango.co.il | Default (Hebrew-first) | Hebrew navigation, parking/transit app in Hebrew |
| 8 | **Gett** | gett.com | Israeli app store version | Ride-hailing in Hebrew, map + Hebrew address integration |

### Global Products with Hebrew RTL Support

| # | Product | URL | Hebrew Access | Key Pattern to Study |
|---|---------|-----|---------------|---------------------|
| 9 | **Google Workspace** | workspace.google.com | Settings > Language > עברית | Gold-standard transcreation via Goliath project, microcopy voice |
| 10 | **Microsoft Office** | office.com | Settings > Language | RTL paragraph direction, Excel RTL column ordering, date formatting |
| 11 | **shadcn/ui** | ui.shadcn.com/docs/rtl | `rtl: true` in config | Component-level RTL transformation, CSS logical properties |

### Products with Known Hebrew Gaps (Anti-References)

| # | Product | Issue | Lesson |
|---|---------|-------|--------|
| 12 | **monday.com** | Emails stuck in LTR; font stack lacks Hebrew glyphs | Don't ship RTL without covering ALL surfaces (emails, notifications, exports) |
| 13 | **Slack** | Hebrew text renders but UI stays LTR | Input-level RTL without layout RTL feels broken |
| 14 | **Notion** | Hebrew text support added recently; layout remains LTR | Text direction is not the same as layout direction |

---

## HEBREW TYPOGRAPHY STACK FOR BEAMIX

**Confidence: HIGH for font selection.** Based on Google Fonts documentation, designer portfolios, open-source license verification, and Israeli type design community sources.

### The Problem

Beamix uses **Inter** (body) and **InterDisplay** (headings) for English. Neither supports Hebrew glyphs. A Hebrew font pair is needed that:
- Matches Inter's geometric, neutral, modern character
- Has sufficient weight range for both UI and display use
- Is free for commercial use (OFL license)
- Renders well at 14px (UI), 24px (subheadings), and 64px (hero)
- Is actively maintained with good hinting

### RECOMMENDATION: Hebrew Display Font = Rubik

**Rubik** is the recommended Hebrew display font for Beamix.

| Attribute | Detail |
|-----------|--------|
| **Designer** | Philipp Hubert & Sebastian Fischer (Latin/Cyrillic); Meir Sadan (Hebrew revision) |
| **Foundry** | Hubert & Fischer, expanded by Cyreal |
| **License** | SIL Open Font License v1.1 — free for commercial use |
| **Weights** | Variable font, weight axis 300-900 (Light through Black) + Italic |
| **Hebrew support** | Full, revised by native Hebrew reader Meir Sadan with proper proportions, spacing, vowel marks |
| **Scripts** | Latin, Cyrillic, Hebrew |
| **Google Fonts** | Yes — [fonts.google.com/specimen/Rubik](https://fonts.google.com/specimen/Rubik) |
| **Why for Beamix** | Rubik is described as the most popular/used font in Israel. Its slightly rounded geometric structure mirrors Inter's clean neutrality. The variable font axis (300-900) matches Inter's weight range perfectly. Both are geometric sans-serifs with similar x-heights. Rubik at 64px has confident, authoritative presence for hero headlines in Hebrew. At 14px it remains highly readable for UI text. |

**Pairing rationale:** Inter and Rubik share a geometric DNA — both are neo-grotesque sans-serifs with generous counters and even stroke widths. Rubik's slightly rounded corners add warmth that works well for Beamix's "smart partner" brand personality. The weight ranges align: Inter 100-900, Rubik 300-900.

Sources: [Rubik on Google Fonts](https://fonts.google.com/specimen/Rubik) | [Rubik Hebrew by Meir Sadan](https://sadan.com/rubik.html) | [GitHub — googlefonts/rubik](https://github.com/googlefonts/rubik)

### RECOMMENDATION: Hebrew Body Font = Heebo

**Heebo** is the recommended Hebrew body font for Beamix.

| Attribute | Detail |
|-----------|--------|
| **Designer** | Oded Ezer (Hebrew); extends Christian Robertson's Roboto to Hebrew |
| **License** | SIL Open Font License — free for commercial use |
| **Weights** | Variable font, 100-900 (Thin through Black) |
| **Hebrew support** | Full, designed by acclaimed Israeli type designer Oded Ezer |
| **Google Fonts** | Yes — [fonts.google.com/specimen/Heebo](https://fonts.google.com/specimen/Heebo) |
| **Why for Beamix** | Heebo extends Roboto's Latin design to Hebrew. Since Inter and Roboto share the same neo-grotesque lineage, Heebo naturally harmonizes with Inter for body text. At 14-16px body sizes, Heebo is clean and highly readable. The full 100-900 weight range matches Inter exactly. |

**Alternative considered:** Assistant (by Ben Nathan, designed as Hebrew companion to Source Sans Pro). Assistant has only 6 weights vs Heebo's full variable axis, and its design heritage traces to Source Sans Pro rather than the Roboto/Inter lineage. Heebo is the closer match.

Sources: [Heebo on Google Fonts](https://fonts.google.com/specimen/Heebo) | [GitHub — OdedEzer/heebo](https://github.com/OdedEzer/heebo) | [Heebo on Adobe Fonts](https://fonts.adobe.com/fonts/heebo)

### Full Typography Stack

```
English:
  Display:  InterDisplay (500-700)
  Body:     Inter (400-600)
  Code:     Geist Mono

Hebrew:
  Display:  Rubik (500-700)
  Body:     Heebo (400-600)
  Code:     Geist Mono (Latin numerals in code stay LTR)

Serif accent (dark sections, testimonials):
  English:  Fraunces (300-400)
  Hebrew:   Frank Ruhl Libre (400-700) — classic Hebrew serif, OFL license
```

### Webfont Loading Strategy

```css
/* Subset Hebrew glyphs to reduce payload */
@font-face {
  font-family: 'Rubik';
  src: url('/fonts/rubik-hebrew-var.woff2') format('woff2');
  unicode-range: U+0590-05FF, U+FB1D-FB4F; /* Hebrew block */
  font-display: swap;
}

@font-face {
  font-family: 'Heebo';
  src: url('/fonts/heebo-hebrew-var.woff2') format('woff2');
  unicode-range: U+0590-05FF, U+FB1D-FB4F;
  font-display: swap;
}
```

**Loading order:** Inter/InterDisplay load first (English is primary). Rubik/Heebo load on demand when Hebrew content is detected or user switches locale. Use `font-display: swap` to prevent FOIT. Subset to Hebrew Unicode range (U+0590-05FF) to keep payload under 30KB per font.

### Other Hebrew Fonts Evaluated

| Font | Weights | License | Verdict |
|------|---------|---------|---------|
| **Assistant** | 6 (ExtraLight-Black) | OFL | Good alternative to Heebo; designed for Source Sans Pro pairing, not Inter |
| **Frank Ruhl Libre** | Variable (Light-Black) | OFL | Best Hebrew serif; use for testimonial/accent sections. Pairs with Fraunces. |
| **Secular One** | 1 (Regular only) | OFL | Beautiful humanistic sans but single weight kills it for UI use |
| **Suez One** | 1 (Regular only) | OFL | Display serif; single weight, too limited |
| **Varela Round** | 1 (Regular only) | OFL | Friendly rounded sans; single weight, can't build a UI system |
| **Karantina** | 3 (Light, Regular, Bold) | OFL | Display/headline only; too eccentric for B2B SaaS |
| **Open Sans** | Variable | Apache 2.0 | Has Hebrew subset but less personality than Rubik/Heebo |
| **Noto Sans Hebrew** | Variable | OFL | Google's "universal" fallback; technically solid but generic |

---

## RTL UI MIRROR RULES — The Design System

**Confidence: HIGH.** Based on Material Design bidirectionality guidelines, shadcn/ui RTL documentation, and multiple RTL design guides.

### Core Principle

RTL layout is the **logical mirror** of LTR layout. Use CSS logical properties (`margin-inline-start` not `margin-left`) so the same code serves both directions.

### Layout Rules

| Element | LTR (English) | RTL (Hebrew) | Implementation |
|---------|---------------|-------------- |----------------|
| **Sidebar** | Left side | Right side | `inset-inline-start: 0` |
| **Content flow** | Left to right | Right to left | `dir="rtl"` on `<html>` |
| **Navigation tabs** | Left-aligned, first tab on left | Right-aligned, first tab on right | Flexbox `direction: rtl` or logical properties |
| **Breadcrumbs** | Home > Section > Page (left to right) | Home > Section > Page (right to left) | Separator arrows also flip |
| **Progress bars** | Fill from left | Fill from right | `direction: rtl` on container |
| **Scroll position** | Scrollbar on right | Scrollbar on left | Browser handles automatically |
| **Text alignment** | Left-aligned body text | Right-aligned body text | `text-align: start` (not `left`) |

### Icon Mirroring Rules (per Material Design)

**MUST mirror (directional icons):**
- Back/forward arrows
- Navigation arrows (next/previous)
- Text indent icons
- List bullet alignment
- Reply/forward icons
- Undo/redo arrows
- Volume slider direction
- Progress/time-passage indicators (linear)

**MUST NOT mirror (universal icons):**
- Play/pause/stop (media controls are universal)
- Checkmarks
- Plus/minus/close (X)
- Search (magnifying glass)
- Settings (gear)
- Clock/time (circular time is universal)
- Download/upload arrows (gravity-based, not directional)
- Music notes
- Camera/photo icons
- Lock/unlock

**Beamix-specific:** The scan/radar icon should NOT mirror. Chart icons should NOT mirror (Y-axis stays on left in both LTR and RTL for data readability). Star/rating icons should NOT mirror.

Source: [Material Design Bidirectionality](https://m2.material.io/design/usability/bidirectionality.html) | [shadcn/ui RTL](https://ui.shadcn.com/docs/rtl)

### Button Placement in Dialogs

| Pattern | LTR | RTL |
|---------|-----|-----|
| **Confirm/Cancel** | Cancel (left), Confirm (right) | Cancel (right), Confirm (left) |
| **Primary action** | Right-most position | Left-most position |
| **Destructive action** | Right-most, red | Left-most, red |

**Rule:** Primary action is always on the **inline-end** side. Use `justify-content: flex-end` with logical ordering.

### Numerals and Mixed Content

- **Western Arabic numerals (0-9) stay LTR** within RTL text flow. The Unicode Bidi Algorithm handles this automatically.
- **Phone numbers:** Display LTR within RTL context (054-123-4567 reads the same)
- **Currency:** ₪ symbol goes BEFORE the number in Hebrew (₪79/חודש), after in English ($79/mo)
- **Percentages:** Number + % stays LTR (80%)
- **Dates:** DD/MM/YYYY in Hebrew (not MM/DD/YYYY). Day names in Hebrew. Use `Intl.DateTimeFormat('he-IL')`
- **URLs and email addresses:** Always LTR, even within RTL text
- **Brand names:** Stay in English/Latin script (Beamix, ChatGPT, Google)
- **Punctuation in mixed text:** Period/comma follows the language of the sentence it terminates. A period ending an English phrase within Hebrew text stays on the left of the English phrase.

### Form Patterns

| Element | RTL Behavior |
|---------|-------------|
| **Labels** | Right-aligned, above or to the right of input |
| **Text inputs** | Right-aligned text, cursor starts on right |
| **Placeholder text** | Right-aligned |
| **Validation messages** | Right-aligned, below input |
| **Submit button** | Left side of form (inline-end) |
| **Multi-step forms** | Step 1 on right, progress flows right-to-left |
| **Checkboxes** | Check on right side of label |
| **Dropdown arrows** | Left side of select (inline-end) |

### Table/Data Patterns

- **Column order mirrors:** First column (most important) is on the right in RTL
- **Sorting arrows** stay in column headers but position flips
- **Row actions** (edit, delete) move to the left side (inline-end)
- **Numeric columns** remain left-aligned within their cells for readability (numbers are always LTR)
- **Pagination** flips: Previous on right, Next on left

### Drawer/Modal/Sheet

- **Side drawers** open from the right in RTL (inline-start)
- **Close button (X)** moves to the top-left in RTL
- **Modal content** follows RTL text alignment
- **Toast/notification** slides in from the right (inline-start)

### Pill/Chip/Badge

- **Dismiss (X) button** on left side of pill in RTL (inline-end)
- **Icon + text badges**: icon on right, text on left
- **Status badges** don't mirror (color dots are non-directional)

---

## BEAMIX UI VOICE IN HEBREW — Micro-copy

**Confidence: MEDIUM.** Based on Google Israel Goliath project principles, Israeli B2B communication norms, and GEO industry terminology from Israeli practitioners. Not validated with native Hebrew UX writers.

### Voice Principles for Beamix Hebrew

1. **Transcreate, don't translate.** Every Hebrew string should sound like it was written in Hebrew first.
2. **Avoid male imperatives.** Hebrew imperatives are gendered. Use infinitive forms or question forms instead.
3. **Keep English for established tech terms.** Terms like AI, SEO, GEO, ChatGPT stay in English. Don't force Hebrew translations that nobody uses.
4. **Conversational but professional.** Israeli B2B tone is direct and informal (Israelis instinctively ask for "less formal"), but not sloppy. Think "smart colleague" not "corporate letter."
5. **Use plural forms (אתם/כם) for gender neutrality** where possible, or rephrase to avoid gendered forms entirely.
6. **Short.** Hebrew has a smaller lexicon than English. Shorter strings feel more natural in Hebrew.

### Key Concept Translations

| # | English (EN) | Hebrew (HE) | Notes |
|---|-------------|-------------|-------|
| 1 | **AI Visibility Score** | **ציון נראות ב-AI** | "ציון" = score, "נראות" = visibility. "ב-AI" keeps AI in English (universally understood in Israel). Do NOT use "בינה מלאכותית" in the UI — too formal and long. |
| 2 | **Run a Scan** | **הפעלת סריקה** | Infinitive form ("Activating a scan") avoids gendered imperative. NOT "סרוק" (male imperative) or "סירקי" (female imperative). |
| 3 | **Inbox / Review** | **תיבת דואר / סקירה** | "תיבת דואר" is established. For review context: "לבדיקה שלך" ("for your review") is more natural than literal "סקירה". |
| 4 | **Recommendations** | **המלצות** | Well-established Hebrew word. Works perfectly. |
| 5 | **Agents / Crew** | **סוכנים** or **הצוות** | "סוכנים" = agents (literal). "הצוות שלך" = "your crew/team" (warmer). Recommend "הצוות" for Beamix's personality. |
| 6 | **Connect Your Business** | **חברו את העסק שלכם** | Plural imperative (gender-neutral). Or infinitive: "חיבור העסק שלך" ("Connecting your business"). |
| 7 | **Dashboard** | **לוח בקרה** | Established Hebrew tech term. Alternatively keep "Dashboard" in English — both are common in Israeli B2B. |
| 8 | **Settings** | **הגדרות** | Standard, no debate. |
| 9 | **Scan Results** | **תוצאות הסריקה** | Clean, direct. |
| 10 | **Content Optimizer** | **אופטימיזציית תוכן** | Mix is natural in Hebrew tech. "אופטימיזציה" is a borrowed word everyone uses. |
| 11 | **Competitor Analysis** | **ניתוח מתחרים** | Standard business Hebrew. |
| 12 | **Your AI Search Visibility** | **הנראות שלך בחיפוש AI** | Possessive "שלך" (your) + "נראות" + "בחיפוש AI" |
| 13 | **Get Started** | **בואו נתחיל** | "Let's start" — inclusive, gender-neutral, conversational. Per Google Israel pattern. |
| 14 | **Upgrade Plan** | **שדרוג מסלול** | "שדרוג" = upgrade, "מסלול" = plan/track (established for pricing tiers). |
| 15 | **Trial Period** | **תקופת ניסיון** | Standard. |
| 16 | **Monthly / Annually** | **חודשי / שנתי** | Standard. Pricing: ₪79/חודש (not חודש/₪79). |
| 17 | **Notifications** | **התראות** | Standard. |
| 18 | **Search Engines** | **מנועי חיפוש** | Well-established. Everyone knows this term. |
| 19 | **Mentioned / Not Mentioned** | **מוזכר / לא מוזכר** | For scan results showing AI engine mentions. |
| 20 | **Improve Your Ranking** | **שפרו את הדירוג שלכם** | Plural imperative (gender-neutral). "דירוג" = ranking. |

### GEO-Specific Hebrew Vocabulary

**Confidence: MEDIUM.** Based on Israeli GEO practitioner Nati Elimelech's Hebrew site and Israeli AI industry sources.

| English Term | Hebrew Term | Status |
|-------------|-------------|--------|
| GEO (Generative Engine Optimization) | GEO (ג'יאו) | Keep in English — the term is new, no Hebrew equivalent exists |
| AI Overview | AI Overview | Keep in English — Google's feature name |
| Entity Authority | סמכות יישות | Used by Israeli GEO practitioners |
| Structured Data | מידע מובנה | Established technical term |
| GEO Audit | ביקורת GEO | Mix: Hebrew action + English acronym |
| Citations (from AI) | ציטוטים | Standard Hebrew |
| AI Search Visibility | נראות בחיפוש AI | Used by Nati Elimelech (natielimelech.com) |

**Key insight:** Very few Israeli companies have built "entity authority" in Hebrew yet. This means Beamix has a positioning opportunity — the Hebrew vocabulary for GEO is not yet settled. Whoever establishes the terms wins.

Source: [Nati Elimelech GEO Israel](https://en.natielimelech.com/geo) | [Israel National AI Program](https://aiisrael.org.il/)

---

## CONTENT AGENT OUTPUT — Hebrew Voice

**Confidence: MEDIUM.** Based on Israeli communication norms research and Google Israel localization principles.

### When Beamix's Content Optimizer Produces Hebrew Content

The output must sound like a native Hebrew copywriter wrote it, not like ChatGPT translated English. Here are the rules:

### 10 Tone Rules for Hebrew B2B/SMB Content

1. **Use conversational-professional register.** Not academic Hebrew (שפת אקדמיה), not street slang (סלנג). The sweet spot is educated Israeli speaking to a peer. Think Calcalist articles, not Haaretz editorials.

2. **Shorter sentences than English.** Hebrew has a smaller lexicon. Long compound sentences feel foreign. Break them up.

3. **Keep technical terms in English when they're industry-standard.** SEO, AI, GEO, ChatGPT, Google, FAQ — these stay in English within Hebrew text. Do NOT write "אופטימיזציית מנוע יוצר" for "Generative Engine Optimization."

4. **Use active voice.** Hebrew passive (נפעל/הופעל) sounds bureaucratic. "אנחנו ממליצים" (we recommend) not "מומלץ" (it is recommended).

5. **Address the reader directly with plural "you" (אתם).** Avoids gender. "אתם יכולים לשפר" (you can improve) works for any audience.

6. **Avoid literal translation of English idioms.** "Take your business to the next level" does NOT become "קחו את העסק שלכם לשלב הבא" — that sounds translated. Instead: "שדרגו את הנוכחות הדיגיטלית שלכם" (upgrade your digital presence).

7. **Numbers and data stay in Western Arabic (0-9).** Hebrew uses the same numerals. Write "80% מהלקוחות" not "שמונים אחוז."

8. **Format for Israeli conventions.** Dates: 25 באפריל 2026. Currency: ₪79. Phone: 054-123-4567.

9. **FAQ answers should be direct and actionable.** Israeli SMB owners don't want fluff. First sentence = the answer. Then explain. Not the other way around.

10. **Avoid over-politeness.** English "We would like to kindly suggest that you might want to consider..." becomes "אנחנו ממליצים ל..." (We recommend to...) in Hebrew. Israelis find excessive politeness suspicious.

### Example: Hebrew FAQ for an Israeli Dentist

**Bad (translated English):**
> שאלה: מהם השירותים שאתם מציעים?
> תשובה: אנחנו שמחים להציע מגוון רחב של שירותים דנטליים מקצועיים, כולל טיפולי שיניים כלליים, הלבנת שיניים, ושיקום הפה המלא. נשמח לספר לכם עוד!

**Good (native Hebrew):**
> שאלה: אילו טיפולים אתם מבצעים?
> תשובה: אנחנו מבצעים טיפולי שיניים כלליים, הלבנות, שתלים, ושיקום פה מלא. המרפאה שלנו ברמת גן מצוידת בטכנולוגיה מתקדמת ומאפשרת טיפול מהיר ומדויק. צרו קשר ונתאם תור.

**Why it's better:** Direct. Shorter. Answers first, then details. "צרו קשר" (contact us) is standard B2B Hebrew CTA. No "we're happy to" filler.

---

## HEBREW-DISPLAY FONT LIVE TEST

**Confidence: HIGH for URLs.** These are publicly available Google Fonts specimens.

### View Rubik Hebrew Live

- **Google Fonts specimen:** [fonts.google.com/specimen/Rubik](https://fonts.google.com/specimen/Rubik) — type Hebrew text in the preview, adjust size slider to 14px / 24px / 64px
- **Rubik Hebrew by Meir Sadan:** [sadan.com/rubik.html](https://sadan.com/rubik.html) — designer's portfolio with specimens

### View Heebo Live

- **Google Fonts specimen:** [fonts.google.com/specimen/Heebo](https://fonts.google.com/specimen/Heebo) — type Hebrew text, adjust sizes
- **Oded Ezer portfolio:** [GitHub — OdedEzer/heebo](https://github.com/OdedEzer/heebo) — design process

### View Frank Ruhl Libre Live (Serif Accent)

- **Google Fonts specimen:** [fonts.google.com/specimen/Frank+Ruhl+Libre](https://fonts.google.com/specimen/Frank+Ruhl+Libre) — for testimonial/dark sections

### Quick Test Instructions for Adam

1. Go to fonts.google.com/specimen/Rubik
2. In the "Type here to preview text" field, enter: **Beamix — ניתוח נראות AI לעסקים**
3. Set size to 64px — this is your Hebrew headline
4. Set size to 24px — this is your Hebrew subheadline
5. Set size to 14px — this is your Hebrew body/UI text
6. Compare weight 500 (medium) and 700 (bold) for headings
7. Repeat for Heebo at the same sizes for body text comparison

---

## ANTI-PATTERNS — Hebrew Translations That Feel "Translated"

**Confidence: HIGH.** Based on Google Israel Goliath project learnings, Israeli UX writing community, and RTL design best practices.

### 1. Gendered Imperatives

**The problem:** Hebrew verbs are gendered. "Click here" has a male form (לחץ כאן) and female form (לחצי כאן). Using male-default excludes half your users. Using both (לחץ/י כאן) is ugly.

**The fix:** Use infinitive ("לחיצה כאן"), question form ("רוצים ללחוץ?"), or rephrase entirely.

### 2. Over-Literal Translation of English UI Patterns

**The problem:** "Get started" → "קבלו התחלה" is grammatically valid but sounds alien. Nobody says that in Hebrew.

**The fix:** "בואו נתחיל" (let's start) or "התחלת עבודה" (beginning work).

### 3. English Sentence Structure in Hebrew

**The problem:** English puts modifiers before nouns ("AI visibility score"). Hebrew puts them after ("ציון נראות AI"). Translators who follow English word order produce Hebrew that reads backwards.

**The fix:** Always restructure for Hebrew noun-modifier order.

### 4. Formal Register Where Informal is Expected

**The problem:** Using "אנו" (we, formal) instead of "אנחנו" (we, conversational). Using "הנכם" (you are, formal) instead of "אתם" (you, conversational). This sounds like a government form, not a SaaS product.

**The fix:** Use conversational register throughout the product UI. Save formal Hebrew for legal documents only.

### 5. Mixing Hebrew and English Inconsistently

**The problem:** Some screens translate everything ("מנוע חיפוש מבוסס בינה מלאכותית") while others keep English ("AI search engine"). Users can't form a mental model.

**The fix:** Establish a glossary. Technical terms that Israeli users know in English (AI, SEO, GEO, FAQ, CTA) stay in English always. Hebrew equivalents that are established (מנוע חיפוש, המלצות, הגדרות) stay in Hebrew always. Document the rule and enforce it.

### 6. LTR-Only Design with Hebrew Text

**The problem:** Text reads right-to-left but the sidebar, navigation, and buttons stay in LTR positions. This is the most common "bolted-on" indicator. monday.com's email system suffers from this.

**The fix:** Full layout mirror. Sidebar right. Primary actions on inline-end. Use CSS logical properties.

### 7. Ignoring Israeli Date/Currency/Phone Conventions

**The problem:** Showing dates as "04/25/2026" (US format) or prices as "$79" when the user is in Hebrew mode.

**The fix:** 25/04/2026 or 25 באפריל 2026. ₪79/חודש. Phone: 054-123-4567. Use `Intl.DateTimeFormat('he-IL')` and `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`.

---

## IMPLEMENTATION NOTES FOR BEAMIX

### Recommended i18n Library

**next-intl** — designed specifically for Next.js App Router, ~2KB client bundle, native Server Component support. Hebrew translations rendered server-side add zero bytes to client bundle.

Source: [next-intl documentation](https://next-intl.dev/docs/getting-started/app-router)

### shadcn/ui RTL Setup

```bash
# Enable RTL in components.json
# Set rtl: true
# Run migration for existing components:
pnpm dlx shadcn@latest migrate rtl apps/web/src/components/ui
```

### HTML Direction

```tsx
// apps/web/app/layout.tsx
const RTL_LOCALES = ['he', 'ar'];

export default function RootLayout({ params }: { params: { locale: string } }) {
  const dir = RTL_LOCALES.includes(params.locale) ? 'rtl' : 'ltr';
  return (
    <html lang={params.locale} dir={dir}>
      <body className={dir === 'rtl' ? 'font-heebo' : 'font-inter'}>
        {/* ... */}
      </body>
    </html>
  );
}
```

### Tailwind Config Addition

```js
// tailwind.config.ts
fontFamily: {
  inter: ['Inter', 'sans-serif'],
  'inter-display': ['InterDisplay', 'Inter', 'sans-serif'],
  heebo: ['Heebo', 'sans-serif'],
  rubik: ['Rubik', 'sans-serif'],
  'frank-ruhl': ['"Frank Ruhl Libre"', 'serif'],
}
```

---

## CONFIDENCE SUMMARY

| Section | Confidence | Reason |
|---------|-----------|--------|
| Top 5 Anchors | MEDIUM | Based on public docs and community forums, not direct product inspection |
| Full Reference Library | MEDIUM | Many products couldn't be deeply inspected for Hebrew-specific implementation |
| Hebrew Typography Stack | HIGH | Based on Google Fonts official data, designer portfolios, open-source repos, OFL licenses verified |
| RTL UI Mirror Rules | HIGH | Based on Material Design official guidelines and shadcn/ui documentation |
| Beamix UI Voice in Hebrew | MEDIUM | Based on Google Israel principles and Israeli communication norms; not validated by native Hebrew UX writer |
| Content Agent Output | MEDIUM | Tone rules derived from communication research; example quality should be validated by native speaker |
| Anti-Patterns | HIGH | Well-documented patterns from multiple sources |

### Gaps / Unknown

- **Direct product screenshots** of Wix, monday.com, and Fiverr in Hebrew mode were not captured
- **monday.com's actual Hebrew fallback font** is unknown (Figtree lacks Hebrew; system font stack unconfirmed)
- **Lemonade and eToro Hebrew implementations** could not be deeply inspected
- **Native Hebrew UX writer review** — all microcopy translations should be validated by a native Hebrew speaker before implementation
- **Kinneret Yifrah** (nemala.co.il) is Israel's leading UX writer — hiring her or her studio for Beamix Hebrew microcopy review would be high-value
- **AlefAlefAlef** (alefalefalef.co.il) is Israel's premier Hebrew type foundry — they offer paid Hebrew fonts that may outperform Google Fonts options for premium feel

---

*End of Reference Hunt 5 — Hebrew/RTL B2B References*
