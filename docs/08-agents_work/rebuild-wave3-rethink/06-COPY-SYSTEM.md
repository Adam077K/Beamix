# Beamix — Wave 3 Copy System
*Growth Lead · 2026-04-20*

---

## WARNING: HYPOTHESIS-BASED COPY

**USER-INSIGHTS.md is empty. No SMB customer interviews have been conducted.**

Every headline, label, and empty state in this document is a **hypothesis** based on:
- Product specs and JTBD assumptions from 03-PAGE-INVENTORY.md
- Category standard copy from Ahrefs Brand Radar and Profound (01-RESEARCH-SYNTHESIS.md)
- Brand voice rules from docs/BRAND_GUIDELINES.md

Every section marked `[HYPOTHESIS]` must be validated against real customer language.

**Adam's Week-1 Action:** Run 5 Israeli SMB discovery interviews. Ask: "When you think about AI search, what words come to mind? What does it feel like when a competitor shows up and you don't?" Bring verbatim answers back and rewrite every headline marked `[HYPOTHESIS]`.

---

## 0. Voice Rules

### The Three Dials

**Authoritative** — Beamix knows what it's talking about. No hedging. Statements, not suggestions.

| On-voice | Off-voice |
|----------|-----------|
| "3 competitors rank above you on Perplexity." | "Your ranking might be lower than competitors in some cases." |
| "You're invisible to ChatGPT." | "Your AI visibility may be limited." |
| "This agent rewrites your FAQ so AI engines cite it." | "This tool helps optimize your content for better AI performance." |

**Direct** — Lead with the consequence, not the process. One idea per sentence.

| On-voice | Off-voice |
|----------|-----------|
| "Run the scan. See where you're invisible." | "Get started today and discover your AI visibility insights." |
| "Approve this. It runs tonight." | "Please review and approve the following content if you're satisfied with it." |
| "Score dropped 4 points. Perplexity stopped citing you." | "There has been a change in your performance metrics." |

**Warm** — "you" and "your business" always. We work for you, not at you.

| On-voice | Off-voice |
|----------|-----------|
| "Your agents ran while you slept." | "Automated processes have been executed on your account." |
| "Nothing to review yet — agents run tonight." | "No items found in your queue." |
| "Looks like your competitors are ahead on Gemini. Fix that →" | "Competitor performance exceeds yours on the Gemini platform." |

---

### Hebrew Voice Rules

- חד לעניין (direct, to the point — no flowery opener)
- Active verbs first: "הסוכנים כתבו" not "נכתב על ידי הסוכנים"
- No English transliteration of marketing phrases — translate the meaning, not the words
- Example of the same three dials in Hebrew:
  - Authoritative: "3 מתחרים מדורגים מעליך ב-Perplexity." (not "ייתכן שמתחרים מופיעים לפניך")
  - Direct: "הרץ סריקה. ראה היכן אתה בלתי נראה." (not "התחל את המסע שלך לשיפור הנראות")
  - Warm: "הסוכנים שלך עבדו בזמן שישנת." (not "תהליכים אוטומטיים הושלמו")

---

### Banned Phrases

Never write these strings. If they appear in existing copy, replace them:

- "awesome" / "amazing" / "great"
- "let's" (in UI copy — too casual for a consequential tool)
- "your journey"
- "seamless" / "frictionless" / "effortless"
- "unlock" (as verb — use "access" or "get")
- "leverage" (as verb — use "use")
- "robust" / "powerful" / "comprehensive"
- "holistic" / "end-to-end"
- "AI-powered" (say what the AI actually does instead)
- "streamline"
- "optimize" (as a standalone verb — say what gets optimized and how)
- "Good" / "Fair" / "Poor" as standalone labels — always add the consequence
- "View details" — say what details do for the user
- "Get started" — specify the action
- "Loading..." — say what is loading
- "No items found" — say why and what to do

---

### Required Patterns

**Delta-prefix:** Always pair numbers with direction.
`▲+4 pts` not `4 pts` / `▼-7%` not `-7%` / `→ Stable` not `No change`

**Consequence-frame:** Follow every metric with its business meaning.
`Score: 71 — 3 competitors rank above you` not `Score: 71 (Good)`

**Action-verb CTAs:** First word is always a verb.
`Run scan` / `Approve draft` / `Fix this` / `Add competitor` / `Download report`

**Time-specific loading:** Name the thing being loaded.
`Scanning ChatGPT...` not `Loading...` / `Saving your edits...` not `Please wait...`

---

## 1. Headline Pattern Per Page

### 1.1 Home (`/home`) `[HYPOTHESIS]`

**Page title**
- EN: Your GEO score today
- HE: ציון ה-GEO שלך היום

**Subtitle (shown only on first load with no scans yet)**
- EN: Run your first scan. Find out where AI search can't find you.
- HE: הרץ את הסריקה הראשונה שלך. גלה היכן חיפוש AI לא מוצא אותך.

**Sticky KPI strip — "What's happening" summary**
- EN (when data present): `Score ▲+4 this week — 2 agents ran, 3 drafts waiting`
- EN (no change): `Score → stable — no scans in 7 days`
- EN (score dropped): `Score ▼-6 — Perplexity dropped your citation`
- HE (with data): `ציון ▲+4 השבוע — 2 סוכנים פעלו, 3 טיוטות ממתינות`
- HE (no change): `ציון → יציב — אין סריקות ב-7 הימים האחרונים`
- HE (dropped): `ציון ▼-6 — Perplexity הסיר את הציטוט שלך`

---

### 1.2 Inbox (`/inbox`) `[HYPOTHESIS]`

**Page title**
- EN: Inbox
- HE: תיבת דואר

**Subtitle (count-aware)**
- EN: `[N] drafts ready for your review` / `Nothing pending — agents run tonight`
- HE: `[N] טיוטות ממתינות לסקירתך` / `אין ממתינים — הסוכנים פועלים הלילה`

**Top-of-page summary**
- EN (with items): `3 agents finished — approve what works, edit what doesn't`
- EN (empty): `Your agents haven't surfaced anything new. Last run: [relative time].`
- HE (with items): `3 סוכנים סיימו — אשר מה שעובד, ערוך מה שלא`
- HE (empty): `הסוכנים שלך לא הביאו עדכונים חדשים. ריצה אחרונה: [זמן יחסי]`

---

### 1.3 Workspace (`/workspace/[jobId]`) `[HYPOTHESIS]`

**Page title** (agent-type aware)
- EN: `FAQ draft — ready for review` / `Content update — ready for review`
- HE: `טיוטת שאלות נפוצות — ממתינה לסקירה` / `עדכון תוכן — ממתין לסקירה`

**Subtitle**
- EN: Written by [Agent Name] on [date] · QA score [N]/100
- HE: נכתב על ידי [שם סוכן] ב-[תאריך] · ציון QA [N]/100

**Top-of-page summary**
- EN: `This draft targets [N] queries where competitors outrank you. Approve to publish.`
- HE: `הטיוטה הזו מטרגטת [N] שאילתות שבהן מתחרים מדורגים מעליך. אשר כדי לפרסם.`

---

### 1.4 Scans (`/scans`) `[HYPOTHESIS]`

**Page title**
- EN: Scan history
- HE: היסטוריית סריקות

**Subtitle**
- EN: `[N] scans · Latest: [score] [delta] · [N] engines checked`
- HE: `[N] סריקות · אחרונה: [ציון] [שינוי] · [N] מנועים נבדקו`

**Top-of-page summary**
- EN (score improving): `Your visibility improved [N] pts since [date]. Perplexity still doesn't cite you.`
- EN (score dropping): `Score dropped [N] pts since [date]. See which engine stopped citing you.`
- EN (no scans): `No scans yet. Run one to find out where AI can't find you.`
- HE (improving): `הנראות שלך השתפרה ב-[N] נקודות מאז [תאריך]. Perplexity עדיין לא מציג אותך.`
- HE (dropping): `הציון ירד ב-[N] נקודות מאז [תאריך]. ראה איזה מנוע הפסיק לצטט אותך.`
- HE (no scans): `עדיין אין סריקות. הרץ אחת כדי לגלות היכן AI לא מוצא אותך.`

---

### 1.5 Scan Drilldown (`/scans/[scanId]`) `[HYPOTHESIS]`

**Page title** (date + score)
- EN: `Scan — [date] · Score [N]`
- HE: `סריקה — [תאריך] · ציון [N]`

**Subtitle** (delta + top consequence)
- EN: `▲+4 vs last scan · ChatGPT cites you, Grok doesn't`
- EN (dropped): `▼-7 vs last scan · You dropped off Perplexity`
- HE: `▲+4 לעומת הסריקה הקודמת · ChatGPT מציין אותך, Grok לא`
- HE (dropped): `▼-7 לעומת הסריקה הקודמת · נעלמת מ-Perplexity`

**Sticky KPI strip summary**
- EN: `[Score] · Prev [N] · ▲/▼[delta] · [N]/5 engines cite you · [N] queries matched`
- HE: `[ציון] · קודם [N] · ▲/▼[שינוי] · [N]/5 מנועים מציינים אותך · [N] שאילתות תאמו`

---

### 1.6 Competitors (`/competitors`) `[HYPOTHESIS]`

**Page title**
- EN: Competitors
- HE: מתחרים

**Subtitle**
- EN: `Your share of voice vs [N] tracked competitors`
- HE: `נתח הקול שלך מול [N] מתחרים עוקבים`

**Sticky KPI strip summary**
- EN: `Your SoV: [N]% · Leader: [Competitor] [N]% · Gap: ▼-[N]pp · [N] queries you're both missing`
- EN (winning): `Your SoV: [N]% — you lead on 3 engines. [Competitor] beats you on Perplexity.`
- HE: `נתח הקול שלך: [N]% · מוביל: [מתחרה] [N]% · פער: ▼-[N]pp · [N] שאילתות שניכם מחמיצים`
- HE (winning): `נתח הקול שלך: [N]% — אתה מוביל ב-3 מנועים. [מתחרה] עולה עליך ב-Perplexity.`

---

### 1.7 Automation (`/automation`) `[HYPOTHESIS]`

**Page title**
- EN: Automation
- HE: אוטומציה

**Subtitle**
- EN: `[N] agents scheduled · [N] credits used of [N] this month`
- HE: `[N] סוכנים מתוזמנים · [N] קרדיטים נוצלו מתוך [N] החודש`

**Sticky KPI strip summary**
- EN: `[N]/[N] credits · Next run: [time] · [N] agents live · [N] paused`
- HE: `[N]/[N] קרדיטים · ריצה הבאה: [זמן] · [N] סוכנים פעילים · [N] מושהים`

---

### 1.8 Archive (`/archive`) `[HYPOTHESIS]`

**Page title**
- EN: Archive
- HE: ארכיון

**Subtitle**
- EN: `[N] pieces approved · [N] published · [N] pending verification`
- HE: `[N] פריטים אושרו · [N] פורסמו · [N] ממתינים לאימות`

**Top-of-page summary**
- EN: `Everything your agents produced — and what you approved. Mark items as published to track their impact.`
- HE: `כל מה שהסוכנים שלך ייצרו — ומה שאישרת. סמן פריטים כ"פורסם" כדי לעקוב אחר ההשפעה.`

---

## 2. KPI / Label Library

**Rule:** Every label = what the number means for the business, not what it measures internally.

### Home Page Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Score` | `GEO score` | `ציון GEO` | Names the category clearly |
| `Score: 71` | `Score 71 — 3 competitors rank above you` | `ציון 71 — 3 מתחרים מדורגים מעליך` | Consequence-frame |
| `Good` (score tier) | `3 competitors rank above you` | `3 מתחרים מדורגים מעליך` | Kill neutral tier labels |
| `Citations: 23` | `23 sources cite you` | `23 מקורות מציינים אותך` | Active subject, not metric noun |
| `Engine Coverage` | `[N]/5 engines cite you` | `[N]/5 מנועים מציינים אותך` | Specific — "coverage" is jargon |
| `Rank: #2` | `Rank #2 — 1 competitor above you` | `דירוג #2 — מתחרה אחד לפניך` | Consequence-frame the gap |
| `+4` (delta) | `▲+4 this week` | `▲+4 השבוע` | Time-anchored delta |
| `Credits used` | `[N]/[N] credits used this month` | `[N]/[N] קרדיטים נוצלו החודש` | Budget-frame, not abstract count |
| `Next run` | `Next agent run: [time]` | `ריצת סוכן הבאה: [זמן]` | "Agent run" is specific |
| `Suggestions` | `Actions that would raise your score` | `פעולות שישפרו את הציון שלך` | JTBD-frame, not feature-name |
| `Impact: High` | `Could raise score [N]–[N] pts` | `עשוי להעלות ציון ב-[N]–[N] נקודות` | Replace adjective with number estimate |
| `Impact: Medium` | `Could raise score 3–5 pts` | `עשוי להעלות ציון ב-3–5 נקודות` | Same |
| `Run agent` | `Run this fix` | `הרץ את התיקון הזה` | "Fix" = consequence, not process |

### Scan List Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Scan` (date header) | `Scan — [date]` | `סריקה — [תאריך]` | Add date inline |
| `Score` (column) | `Score` + delta badge | `ציון` + תג שינוי | Delta is mandatory alongside score |
| `▲+4` | `▲+4 pts` | `▲+4 נקודות` | Units make deltas scannable |
| `▼-2` | `▼-2 pts` | `▼-2 נקודות` | Same |
| `Engines` (pip column) | `Engines citing you` | `מנועים שמציינים אותך` | Column header carries weight |
| `●●●○●` (pips) | Filled = cited / empty = not found | מלא = מוצג / ריק = לא נמצא | Tooltip on each pip with engine name |
| `Queries matched` | `[N] queries matched` | `[N] שאילתות תאמו` | Already decent — keep with numeral |
| `Run new scan` (CTA) | `Run new scan` | `הרץ סריקה חדשה` | Verb-first, keep |
| `View` (row action) | `See what changed →` | `ראה מה השתנה ←` | Consequence, not label |
| `Status: Complete` | `Complete` | `הושלם` | Simple, no change needed |
| `Status: Running` | `Scanning now...` | `סורק כעת...` | Present tense, specific |
| `Status: Failed` | `Scan failed — 0 results saved` | `הסריקה נכשלה — 0 תוצאות נשמרו` | Honest consequence |

### Scan Drilldown Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Mentioned` | `Cited — appears in response` | `מוצג — מופיע בתשובה` | Clarifies what "mentioned" means |
| `Not mentioned` | `Not found — [engine] didn't mention you` | `לא נמצא — [מנוע] לא ציין אותך` | Personalizes the absence |
| `Cited` | `Linked — AI engine cited your URL` | `מקושר — מנוע ה-AI ציטט את ה-URL שלך` | Distinction from unlinked mention |
| `Rank: #1` | `#1 — top result on [engine]` | `#1 — תוצאה ראשונה ב-[מנוע]` | Context for the rank |
| `Sentiment: Positive` | `Positive mention` | `אזכור חיובי` | Keep simple |
| `Sentiment: Neutral` | `Neutral mention` | `אזכור ניטרלי` | Keep |
| `Sentiment: Negative` | `Negative mention — review this` | `אזכור שלילי — כדאי לבדוק` | Soft action hint |
| `Score` (KPI strip) | `Score [N]` | `ציון [N]` | Already correct |
| `Prev` | `Previous scan: [N]` | `סריקה קודמת: [N]` | Spell out for clarity |
| `Delta` | `▲/▼[N] pts vs last scan` | `▲/▼[N] נקודות לעומת סריקה קודמת` | Time-anchored |
| `Engines` (KPI) | `[N]/5 engines cite you` | `[N]/5 מנועים מציינים אותך` | Same as Home, consistent |
| `Queries` (KPI) | `[N] queries matched` | `[N] שאילתות תאמו` | Consistent with scan list |
| `Download PDF` | `Download report` | `הורד דוח` | "Report" is the artifact |
| `Run comparison` | `Compare to previous scan` | `השווה לסריקה קודמת` | Action + object |
| `Run manual scan` | `Run new scan now` | `הרץ סריקה חדשה עכשיו` | Urgency from "now" |

### Competitors Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Your SoV` | `Your share of voice` | `נתח הקול שלך` | Spell out the first time |
| `Leader` | `Who leads` | `מי מוביל` | Clearer than corporate label |
| `Gap` | `Your gap to leader` | `הפער שלך מהמוביל` | Consequence-frame the gap |
| `Win` (W/L grid) | `You ranked higher` | `דורגת גבוה יותר` | Explains the win condition |
| `Loss` (W/L grid) | `Competitor ranked higher` | `המתחרה דורג גבוה יותר` | Same clarity |
| `Tied` | `Same rank` | `דירוג שווה` | Accurate |
| `Missed queries` | `Queries you're both missing` | `שאילתות שניכם מחמיצים` | "Both missing" = opportunity, not failure |
| `Appears` (competitor engine cell) | Filled circle = cited on this engine | מעגל מלא = מוצג במנוע זה | Tooltip per cell |
| `Missing` (competitor engine cell) | Empty circle = not cited | מעגל ריק = לא מוצג | Same |
| `Add competitor` | `Track a competitor` | `עקוב אחר מתחרה` | Track = continuous action, not one-time add |
| `Share of voice trend` | `12-week visibility trend` | `מגמת נראות — 12 שבועות` | Translates jargon |

### Inbox Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `All` (filter tab) | `All` | `הכל` | Keep — already functional |
| `Pending` (filter tab) | `Awaiting review` | `ממתין לסקירה` | Clearer action state |
| `Approved` (filter tab) | `Approved` | `אושר` | Keep |
| `Draft` (filter tab) | `Draft` | `טיוטה` | Keep |
| `Impact: High` | `High impact — could raise score [N]+ pts` | `השפעה גבוהה — עשוי להעלות ציון ב-[N]+ נקודות` | [HYPOTHESIS] — validate this resonates |
| `Approve` (action) | `Approve` | `אשר` | Already verb-first |
| `Request edit` (action) | `Request edit` | `בקש עריכה` | Keep |
| `Dismiss` (action) | `Dismiss` | `דחה` | Keep |
| `Open in Workspace` | `Edit in full workspace →` | `ערוך בסביבת העבודה המלאה ←` | Explains what workspace is |
| `Evidence` (aside panel) | `Why this was suggested` | `למה זה הוצע` | JTBD-frame the evidence |
| `Trigger source` | `What triggered this` | `מה הפעיל את זה` | Conversational |
| `Target queries` | `Queries this targets` | `שאילתות שזה מטרגט` | Active voice |
| `Impact estimate` | `Expected score impact` | `השפעה צפויה על הציון` | Connects to the KPI users care about |

### Automation Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Agent name` | `Agent` | `סוכן` | Shorter column header |
| `Status: Live` | `● Live` | `● פעיל` | Dot + word, consistent with status pattern |
| `Status: Off` | `○ Paused` | `○ מושהה` | "Paused" not "off" — implies temporary |
| `Cadence` | `Runs` | `מתי רץ` | Human language |
| `Last run` | `Last ran` | `רץ לאחרונה` | Past tense |
| `Next run` | `Runs next` | `ריצה הבאה` | Active phrasing |
| `Never` (last run cell) | `Not yet run` | `לא רץ עדיין` | Less ambiguous |
| `Kill switch` | `Pause all agents` | `השהה את כל הסוכנים` | Says what it does |
| `Credits used` | `Credits used this month` | `קרדיטים שנוצלו החודש` | Time-anchored |
| `Next reset` | `Resets on [date]` | `מתאפס ב-[תאריך]` | Specific date removes anxiety |
| `Actions (⋯)` | `⋯` tooltip: "Manage schedule" | `⋯` tooltip: "נהל לוח זמנים" | Tooltip replaces column label |
| `Add schedule` | `Schedule an agent` | `תזמן סוכן` | Verb-first |

### Archive Labels

| Current label | Proposed label (EN) | Proposed label (HE) | Rationale |
|--------------|---------------------|---------------------|-----------|
| `Approved` (status) | `Approved — ready to publish` | `אושר — מוכן לפרסום` | Consequential status |
| `Published` (status) | `Published — tracking impact` | `פורסם — עוקב אחר השפעה` | Shows system is watching |
| `Pending verification` | `Awaiting verification — check back in 48h` | `ממתין לאימות — בדוק שוב בעוד 48 שעות` | Manages expectation |
| `Verified` | `Verified — AI engine found this content` | `אומת — מנוע AI מצא את התוכן` | Explains what verified means |
| `Copy content` | `Copy to clipboard` | `העתק ללוח` | Specific |
| `Mark as published` | `Mark as published + enter URL` | `סמן כ"פורסם" + הזן URL` | Tells user what they need to provide |
| `Re-run agent` | `Refresh this content` | `רענן את התוכן הזה` | User language, not system language |
| `Export` (Scale) | `Export all as CSV` | `ייצא הכל כ-CSV` | Specific format |

---

## 3. Empty State Copy

**Rule:** Every empty state must (1) explain the system, not just the absence, and (2) tell the user what to do.

| Page | State | Current copy | New copy (EN) | New copy (HE) | CTA text (EN) | CTA text (HE) |
|------|-------|-------------|---------------|---------------|---------------|---------------|
| Home | No scans yet | "Nothing to show yet" | `[HYPOTHESIS] No scan data yet — your score is unknown to AI engines right now` | `עדיין אין נתוני סריקה — ציון ה-GEO שלך עדיין לא ידוע` | `Run your first scan` | `הרץ את הסריקה הראשונה` |
| Home | No suggestions | "No suggestions available" | `[HYPOTHESIS] No actions queued — agents will surface fixes after your next scan` | `אין פעולות בתור — הסוכנים יזהו תיקונים אחרי הסריקה הבאה שלך` | `Run a scan` | `הרץ סריקה` |
| Inbox | No items | "Your inbox is empty" | `[HYPOTHESIS] Nothing to review yet — agents run on their schedule and surface drafts here` | `אין מה לסקור עדיין — הסוכנים פועלים לפי לוח הזמנים שלהם ומביאים טיוטות לכאן` | `Set up automation` | `הגדר אוטומציה` |
| Inbox | Filter: Awaiting | "No items pending" | `[HYPOTHESIS] No drafts waiting — you're caught up, or agents haven't run yet` | `אין טיוטות ממתינות — אתה מעודכן, או שהסוכנים עדיין לא רצו` | `Check automation schedule` | `בדוק לוח זמנים` |
| Workspace | No content loaded | "Loading content..." | → see Loading States section | — | — | — |
| Workspace | Content rejected | "Rejected" | `[HYPOTHESIS] You rejected this draft — the agent won't re-run until the next scheduled cycle` | `דחית את הטיוטה הזו — הסוכן לא ירוץ שוב עד לסבב הבא` | `Undo rejection` | `בטל דחייה` |
| Scans | No scans | "No scans found" | `[HYPOTHESIS] No scan history yet — run your first scan to see how AI engines see your business` | `עדיין אין היסטוריית סריקות — הרץ סריקה ראשונה כדי לראות איך מנועי AI רואים את העסק שלך` | `Run your first scan` | `הרץ את הסריקה הראשונה` |
| Scans | Scan running | "Scan in progress" | `Scanning [N] AI engines — results ready in ~2 minutes` | `סורק [N] מנועי AI — תוצאות מוכנות בעוד ~2 דקות` | `Stay on this page` | `הישאר בדף הזה` |
| Scan drilldown | No engine data | "No data available" | `[HYPOTHESIS] [Engine] didn't return data for this scan — it may have been unavailable at scan time` | `[מנוע] לא החזיר נתונים לסריקה הזו — ייתכן שלא היה זמין בעת הסריקה` | `Re-run scan` | `הרץ מחדש` |
| Competitors | No competitors added | "No competitors yet" | `[HYPOTHESIS] No competitors tracked — add a competitor to see who ranks above you on each AI engine` | `אין מתחרים במעקב — הוסף מתחרה כדי לראות מי מדורג מעליך בכל מנוע AI` | `Track a competitor` | `עקוב אחר מתחרה` |
| Competitors | No SoV data | "Share of voice unavailable" | `[HYPOTHESIS] Share of voice needs at least 2 scans to calculate — run another scan to unlock this view` | `נתח הקול דורש לפחות 2 סריקות לחישוב — הרץ סריקה נוספת כדי לפתוח תצוגה זו` | `Run a scan` | `הרץ סריקה` |
| Automation | No schedules | "No agents scheduled" | `[HYPOTHESIS] No agents scheduled yet — automation is how Beamix works for you while you're away` | `עדיין אין סוכנים מתוזמנים — האוטומציה היא האופן שבו Beamix עובד עבורך כשאתה לא כאן` | `Schedule your first agent` | `תזמן את הסוכן הראשון` |
| Automation | All paused (kill switch) | "Automation paused" | `All agents paused — nothing will run until you resume. Your schedule is saved.` | `כל הסוכנים מושהים — שום דבר לא ירוץ עד שתחדש. לוח הזמנים שלך שמור.` | `Resume all agents` | `חדש את כל הסוכנים` |
| Archive | No items | "Nothing archived" | `[HYPOTHESIS] Nothing approved yet — items you approve in Inbox appear here` | `עדיין לא אושר שום דבר — פריטים שאתה מאשר בתיבת הדואר יופיעו כאן` | `Go to Inbox` | `עבור לתיבת הדואר` |
| Archive | No published items | "No published content" | `[HYPOTHESIS] You haven't marked anything as published — mark approved items as published to track their impact` | `לא סימנת שום דבר כ"פורסם" — סמן פריטים שאושרו כ"פורסם" כדי לעקוב אחר ההשפעה` | `Mark an item as published` | `סמן פריט כ"פורסם"` |
| Settings (Integrations) | Coming soon | "Coming soon" | `GA4 and Search Console integration coming in the next update — connect to see which organic queries overlap your AI gap` | `אינטגרציה עם GA4 ו-Search Console תגיע בעדכון הבא — חבר כדי לראות אילו שאילתות אורגניות חופפות לפער ה-AI שלך` | `Get notified when ready` | `קבל התראה כשמוכן` |

---

## 4. Error State Copy

**Rule:** 1-line message (what happened) + 1-line CTA (what to do). No blame. No tech jargon exposed.

| Error type | User-facing message (EN) | User-facing message (HE) | CTA (EN) | CTA (HE) |
|-----------|--------------------------|--------------------------|----------|----------|
| Network error | `Can't reach the server — check your connection` | `לא ניתן להגיע לשרת — בדוק את החיבור` | `Try again` | `נסה שוב` |
| Auth session expired | `Your session expired — sign in again to keep working` | `הסשן שלך פג — התחבר שוב כדי להמשיך` | `Sign in` | `התחבר` |
| Tier limit hit (scans) | `You've run your scan for today — manual scans reset at midnight` | `ניצלת את הסריקה של היום — הסריקות הידניות מתאפסות בחצות` | `Upgrade to Scale for unlimited scans` | `שדרג ל-Scale לסריקות ללא הגבלה` |
| Tier limit hit (Workspace) | `Workspace is available on Build and Scale plans` | `סביבת העבודה זמינה בתוכניות Build ו-Scale` | `See what's included in Build →` | `ראה מה כלול ב-Build ←` |
| Tier limit hit (competitors) | `You've reached your competitor limit — Scale tracks unlimited competitors` | `הגעת למגבלת המתחרים שלך — Scale עוקב אחר מתחרים ללא הגבלה` | `Upgrade to Scale` | `שדרג ל-Scale` |
| Migration not applied | `This feature isn't available yet — we're finishing the setup` | `התכונה הזו עדיין לא זמינה — אנחנו מסיימים את ההגדרה` | `Refresh the page` | `רענן את הדף` |
| Scan failed (partial) | `Scan completed with errors — [N] of [N] engines returned data` | `הסריקה הושלמה עם שגיאות — [N] מתוך [N] מנועים החזירו נתונים` | `See partial results` | `ראה תוצאות חלקיות` |
| Scan failed (total) | `Scan failed — nothing was saved. This sometimes happens. Try again.` | `הסריקה נכשלה — לא נשמר שום דבר. זה קורה לפעמים. נסה שוב.` | `Run scan again` | `הרץ שוב` |
| Agent failed | `This agent hit an error and stopped early — your credits weren't charged` | `הסוכן הזה נתקל בשגיאה ועצר — הקרדיטים שלך לא נגבו` | `Retry this agent` | `נסה שוב את הסוכן` |
| Payment failed | `Payment didn't go through — update your card to restore access` | `התשלום לא עבר — עדכן את הכרטיס כדי לשחזר גישה` | `Update payment method` | `עדכן אמצעי תשלום` |
| Rate limit (API) | `Too many requests at once — slow down a bit` | `יותר מדי בקשות בו-זמנית — האט קצת` | `Wait 30 seconds and try again` | `המתן 30 שניות ונסה שוב` |
| Save failed (Workspace) | `Your edits didn't save — copy your work before refreshing` | `העריכות שלך לא נשמרו — העתק את עבודתך לפני הרענון` | `Try saving again` | `נסה לשמור שוב` |
| PDF export failed | `Report couldn't be generated — try again or copy the data manually` | `לא ניתן היה ליצור את הדוח — נסה שוב או העתק את הנתונים ידנית` | `Try again` | `נסה שוב` |

---

## 5. Loading State Copy

**Rule:** Say what is loading, not that something is loading. Present participle verb.

| Loading context | Loading string (EN) | Loading string (HE) |
|----------------|---------------------|---------------------|
| Free scan (public page) — querying engines | `Scanning ChatGPT...` | `סורק את ChatGPT...` |
| Free scan — second engine | `Scanning Perplexity...` | `סורק את Perplexity...` |
| Free scan — third engine | `Scanning Gemini...` | `סורק את Gemini...` |
| Free scan — compiling results | `Calculating your GEO score...` | `מחשב את ציון ה-GEO שלך...` |
| Home page initial load | `Loading your dashboard...` | `טוען את הדשבורד שלך...` |
| Running a paid scan | `Scanning [N] AI engines — about 2 minutes` | `סורק [N] מנועי AI — כ-2 דקות` |
| Running an agent | `[Agent name] is working — this takes 1–3 minutes` | `[שם הסוכן] עובד — זה לוקח 1–3 דקות` |
| Saving workspace edits | `Saving your edits...` | `שומר את העריכות שלך...` |
| Approving a draft | `Approving...` | `מאשר...` |
| Loading inbox item | `Loading draft...` | `טוען טיוטה...` |
| Generating PDF report | `Building your report...` | `בונה את הדוח שלך...` |
| Loading scan drilldown | `Loading scan results...` | `טוען תוצאות סריקה...` |
| Loading competitors data | `Calculating share of voice...` | `מחשב נתח קול...` |
| Automation: scheduling | `Scheduling agent...` | `מתזמן סוכן...` |
| Settings: saving | `Saving changes...` | `שומר שינויים...` |
| Streaming agent output (Workspace) | `[Agent name] is writing...` | `[שם הסוכן] כותב...` |

---

## 6. CTA Pattern Library

**Rule:** First word = action verb. Specific object. No generic "Get started" or "Learn more."

| CTA context | Button label (EN) | Button label (HE) | Notes |
|------------|-------------------|-------------------|-------|
| First scan from Home (no data state) | `Run your first scan` | `הרץ את הסריקה הראשונה שלך` | [HYPOTHESIS] |
| Scan list — trigger new scan | `Run new scan` | `הרץ סריקה חדשה` | Tier-gated |
| Scan drilldown — re-run | `Run new scan now` | `הרץ סריקה חדשה עכשיו` | "now" adds urgency |
| Scan drilldown — compare | `Compare to previous scan` | `השווה לסריקה קודמת` | |
| Scan drilldown — export | `Download report` | `הורד דוח` | |
| Inbox — approve item | `Approve` | `אשר` | Keep short — in action bar |
| Inbox — edit item | `Request edit` | `בקש עריכה` | |
| Inbox — open full editor | `Edit in full workspace →` | `ערוך בסביבת העבודה המלאה ←` | |
| Workspace — approve final | `Approve and save` | `אשר ושמור` | |
| Workspace — save draft | `Save draft` | `שמור טיוטה` | |
| Workspace — reject | `Reject draft` | `דחה טיוטה` | Destructive styling |
| Home suggestion — run agent | `Run this fix` | `הרץ את התיקון הזה` | [HYPOTHESIS] "fix" resonates |
| Competitors — add | `Track a competitor` | `עקוב אחר מתחרה` | |
| Competitors — scan gap action | `Fix this gap →` | `תקן את הפער הזה ←` | Links to agent suggestion |
| Automation — add schedule | `Schedule an agent` | `תזמן סוכן` | |
| Automation — pause one | `Pause this agent` | `השהה סוכן זה` | |
| Automation — resume all | `Resume all agents` | `חדש את כל הסוכנים` | Kill-switch off action |
| Archive — mark published | `Mark as published` | `סמן כ"פורסם"` | |
| Archive — copy | `Copy to clipboard` | `העתק ללוח` | |
| Archive — re-run | `Refresh this content` | `רענן תוכן זה` | |
| Tier gate — any | `See what's in [Plan] →` | `ראה מה כלול ב-[תוכנית] ←` | Positive frame |
| Settings — save any tab | `Save changes` | `שמור שינויים` | |
| Onboarding — finish | `Go to my dashboard` | `עבור לדשבורד שלי` | |
| Onboarding — skip integrations | `Skip for now` | `דלג לעת עתה` | Low-pressure |
| Error — retry | `Try again` | `נסה שוב` | |

---

## 7. Tier-Locked Copy

**Rule:** Never shame. Name what's locked + which tier unlocks it + one-line benefit. Positive frame.

### TL-1: Workspace (Discover tier) `[HYPOTHESIS]`

**Lock message (EN):** `Full workspace editing is available on Build and Scale — the plan built for businesses that are actively publishing content.`

**Lock message (HE):** `עריכת סביבת עבודה מלאה זמינה ב-Build ו-Scale — התוכנית שנבנתה לעסקים שמפרסמים תוכן באופן פעיל.`

**Unlock hook (EN):** `Build ($189/mo) — edit every agent draft, approve and publish in one flow`

**Unlock hook (HE):** `Build ($189/mo) — ערוך כל טיוטת סוכן, אשר ופרסם בתהליך אחד`

**CTA:** `See what's in Build →` / `ראה מה כלול ב-Build ←`

---

### TL-2: Manual re-scan (Discover tier) `[HYPOTHESIS]`

**Lock message (EN):** `Discover includes automated weekly scans — manual re-scans are available on Build.`

**Lock message (HE):** `Discover כולל סריקות שבועיות אוטומטיות — סריקות ידניות זמינות ב-Build.`

**Unlock hook (EN):** `Build includes 1 manual re-scan per day — run one after you publish new content`

**Unlock hook (HE):** `Build כולל סריקה ידנית אחת ביום — הרץ אחת אחרי שמפרסמים תוכן חדש`

**CTA:** `Upgrade to Build` / `שדרג ל-Build`

---

### TL-3: Automation (Discover tier) `[HYPOTHESIS]`

**Lock message (EN):** `Automation is available on Build and Scale — your agents run on a schedule, not just on demand.`

**Lock message (HE):** `האוטומציה זמינה ב-Build ו-Scale — הסוכנים שלך רצים לפי לוח זמנים, לא רק לפי דרישה.`

**Unlock hook (EN):** `Build schedules up to 3 agents to run weekly — set it once, agents work while you sleep`

**Unlock hook (HE):** `Build מתזמן עד 3 סוכנים לריצה שבועית — הגדר פעם אחת, הסוכנים עובדים בזמן שאתה ישן`

**CTA:** `See Build →` / `ראה Build ←`

---

### TL-4: Competitor tracking over 3 (Build tier) `[HYPOTHESIS]`

**Lock message (EN):** `You've tracked 3 competitors — Scale removes this limit.`

**Lock message (HE):** `עקבת אחרי 3 מתחרים — Scale מסיר את המגבלה הזו.`

**Unlock hook (EN):** `Scale tracks unlimited competitors with daily refresh — see every new gap as it appears`

**Unlock hook (HE):** `Scale עוקב אחר מתחרים ללא הגבלה עם רענון יומי — ראה כל פער חדש כשהוא מופיע`

**CTA:** `Upgrade to Scale` / `שדרג ל-Scale`

---

### TL-5: PDF export (Build tier) `[HYPOTHESIS]`

**Lock message (EN):** `PDF report export is a Scale feature — useful when sharing results with clients or stakeholders.`

**Lock message (HE):** `ייצוא דוח PDF הוא תכונת Scale — שימושי כשמשתפים תוצאות עם לקוחות או בעלי עניין.`

**Unlock hook (EN):** `Scale includes branded PDF reports — export any scan and share it in one click`

**Unlock hook (HE):** `Scale כולל דוחות PDF ממותגים — ייצא כל סריקה ושתף בלחיצה אחת`

**CTA:** `Upgrade to Scale` / `שדרג ל-Scale`

---

### TL-6: CSV export from Archive (Build tier) `[HYPOTHESIS]`

**Lock message (EN):** `CSV export of your archive is available on Scale.`

**Lock message (HE):** `ייצוא CSV מהארכיון זמין ב-Scale.`

**Unlock hook (EN):** `Scale exports your full content history as CSV — easy to analyze or hand off to your team`

**Unlock hook (HE):** `Scale מייצא את כל היסטוריית התוכן שלך כ-CSV — קל לניתוח או להעברה לצוות`

**CTA:** `See Scale →` / `ראה Scale ←`

---

### TL-7: Inbox item locked (Discover tier, 2nd+ item) `[HYPOTHESIS]`

**Lock message (EN):** `You can review 1 agent draft on Discover. Build unlocks the full Inbox.`

**Lock message (HE):** `ניתן לסקור טיוטת סוכן אחת ב-Discover. Build פותח את תיבת הדואר המלאה.`

**Unlock hook (EN):** `Build — unlimited inbox items, full editor, bulk approve`

**Unlock hook (HE):** `Build — פריטים ללא הגבלה, עורך מלא, אישור בכמות`

**CTA:** `Unlock full Inbox` / `פתח תיבת דואר מלאה`

---

## 8. Microcopy — Form Labels and Hints

**Rule:** Hint text answers "why do you need this?" or "what format?" — not just "enter your X."

### Business Profile (Settings → Business tab) `[HYPOTHESIS]`

| Field label | Hint text (EN) | Hint text (HE) |
|-------------|---------------|----------------|
| Business name | `The name AI engines should mention when someone asks about your category` | `השם שמנועי AI צריכים להזכיר כשמישהו שואל על הקטגוריה שלך` |
| Website URL | `Include https:// — e.g. https://www.yoursite.com` | `כלול https:// — לדוגמה: https://www.yoursite.co.il` |
| Industry | `Choose the closest match — this affects which queries your scan targets` | `בחר את ההתאמה הקרובה ביותר — זה משפיע על אילו שאילתות הסריקה שלך מטרגטת` |
| Business description | `1–3 sentences about what you do and who you serve. Agents use this to write in your voice. (120 chars max)` | `1–3 משפטים על מה שאתה עושה ומי הלקוחות שלך. הסוכנים משתמשים בזה כדי לכתוב בקולך. (עד 120 תווים)` |
| Location (city/region) | `Used to target local AI queries — "best [service] in [city]"` | `משמש לטרגוט שאילתות AI מקומיות — "הכי טוב [שירות] ב[עיר]"` |
| Services offered | `Add your main services — each one becomes a tracked keyword category` | `הוסף את השירותים העיקריים שלך — כל אחד הופך לקטגוריית מילות מפתח עוקבת` |
| Languages served | `If you serve customers in Hebrew and English, AI queries in both languages will be tracked` | `אם אתה משרת לקוחות בעברית ובאנגלית, שאילתות AI בשתי השפות יעוקבו` |

---

### User Profile (Settings → Profile tab)

| Field label | Hint text (EN) | Hint text (HE) |
|-------------|---------------|----------------|
| Full name | `Your name as it appears in team notifications` | `שמך כפי שמופיע בהתראות הצוות` |
| Timezone | `Determines when your scheduled scans and agent runs occur` | `קובע מתי מתבצעות הסריקות המתוזמנות וריצות הסוכנים שלך` |
| Language | `Beamix UI will switch to your selected language` | `ממשק Beamix יעבור לשפה שבחרת` |

---

### Automation Defaults (Settings → Automation Defaults tab) `[HYPOTHESIS]`

| Field label | Hint text (EN) | Hint text (HE) |
|-------------|---------------|----------------|
| Default cadence | `New agents you add will default to this frequency — you can override per agent` | `סוכנים חדשים שתוסיף יוגדרו כברירת מחדל לתדירות זו — תוכל לשנות לכל סוכן בנפרד` |
| Monthly credit cap | `Agents stop running if this limit is hit — prevents unexpected overages` | `הסוכנים מפסיקים לרוץ אם מגיעים למגבלה זו — מונע חריגות בלתי צפויות` |
| Notify on completion | `You'll get an email when an agent finishes a run — useful if you're not checking daily` | `תקבל אימייל כשסוכן מסיים ריצה — שימושי אם אינך בודק מדי יום` |

---

### Notifications (Settings → Notifications tab)

| Field label | Hint text (EN) | Hint text (HE) |
|-------------|---------------|----------------|
| Score change alerts | `Get notified when your GEO score changes by 5+ points` | `קבל התראה כשציון ה-GEO שלך משתנה ב-5+ נקודות` |
| New draft ready | `Get notified when an agent finishes a draft and it's ready to review` | `קבל התראה כשסוכן מסיים טיוטה והיא מוכנה לסקירה` |
| Competitor alert | `Get notified when a competitor's share of voice jumps by 5%+ (Scale only)` | `קבל התראה כשנתח הקול של מתחרה עולה ב-5%+ (Scale בלבד)` |
| Digest time | `Weekly summary email — sent at this time on Mondays` | `אימייל סיכום שבועי — נשלח בשעה זו בימי שני` |

---

### Onboarding (post-payment)

| Field label | Hint text (EN) | Hint text (HE) |
|-------------|---------------|----------------|
| Business website | `We'll use this as the home page for your first paid scan` | `נשתמש בזה כדף הבית לסריקה הראשונה שלך` |
| Main service or product | `In 5 words or less — what does your business sell or do? This seeds your first scan queries.` | `ב-5 מילים או פחות — מה העסק שלך מוכר או עושה? זה מזין את שאילתות הסריקה הראשונה שלך.` |
| GA4 / Search Console connect | `Optional — connect to see which organic traffic gaps match your AI visibility gaps. Takes 30 seconds.` | `אופציונלי — חבר כדי לראות אילו פערים בתנועה אורגנית תואמים לפערי הנראות ב-AI שלך. לוקח 30 שניות.` |

---

## Session Summary

**File:** `docs/08-agents_work/rebuild-wave3-rethink/06-COPY-SYSTEM.md`

**What was written:**
Full copy system covering 8 pages, voice rules, 40+ KPI labels, 16 empty states, 13 error states, 17 loading states, 25+ CTAs, 7 tier-lock scenarios, and 20+ form hints — all with EN + HE pairs.

**Customer phrases used:**
None from USER-INSIGHTS.md (file is empty). All copy is hypothesis-based. Flagged throughout.

**Key metrics targets:**
- Zero occurrences of banned phrases in final deliverable
- Every label carries consequence, not just category
- Every empty state explains the system + gives an action
- HE strings are translated in meaning, not transliterated

**Session flag:** USER-INSIGHTS.md empty. All copy marked `[HYPOTHESIS]`. Run 5 Israeli SMB interviews before treating any headline as validated.
