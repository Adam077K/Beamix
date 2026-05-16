# Board Member 5 — End-to-End Outcome Simulator

**Lens:** The customer-outcome simulator. Read the specs as scripts. Walk three real personas through what Wave 1-4 ships. Find where the journey delivers on the promise and where it collapses.

**Specs read:** 08-UX-ARCHITECTURE, 14-SCAN-UX-SPEC, 03-DAY-1-FLOW, 02-AUTOMATION-RULES, 04-EMPTY-STATES, 07-AGENT-ROSTER-V2, 09-WAVE-1-BRIEF, 18-LEGAL-PUBLISHING-PLAN, 19-SUPPORT-CHANNEL-SPEC.

---

## Verdict: CUSTOMER 50/50 — leans LOSE on Discover, leans WIN on Build

The Day-1 chain is genuinely good and the wound-reveal funnel is conversion-grade. But the gap between the spec's *promise* ("agents fix your visibility") and the *deliverable* (drafts you copy-paste, packages you submit manually, score that doesn't move for 28 days) is wider than the marketing implies. Build and Scale customers get enough activity inside the 14-day refund window to stay. Discover ($79) customers — 1 suggestion/day, weekly scans, weekly cadence — are the refund-risk tier and the spec quietly knows it.

---

## Persona A — Tel Aviv coffee shop owner (Hebrew, $79 Discover)

**Profile:** Yossi, 47, owns a third-wave cafe in Florentin. Hears about Beamix from a Hebrew Facebook group. Mobile, Chrome, iPhone 13.

### Minute 0–5 — Free scan

- **0:00** Lands on Framer site (Hebrew). Clicks "סרוק עכשיו" — `/scan`.
- **0:30** Form: URL (`florentin-coffee.co.il`), industry select, location, 3 competitors. The Haiku competitor autocomplete (per 14-SCAN-UX-SPEC) feels magical — it suggests two real competitors he knows. **DELIGHT.**
- **0:45** Industry select — "Food & Beverage" is fine. (If he'd picked legal/medical/financial he'd hit the waitlist gate — good defensive design, but coffee shop has no friction here.)
- **1:00** Scanning animation kicks in. Engine pills light up sequentially. Sonar pulse. Query ticker shows real-feeling queries: "best cafe in Florentin..." **DELIGHT — feels expensive.**
- **2:30** Wound-reveal. Score: **27**. "2 of 30 queries mention your business." "Your competitors appear in 14." Red font. The 3 visible fix cards + 8 blurred cards behind frosted glass.
- **3:00** **CONFUSION:** Is the score in Hebrew? Per the spec, Wave 1 ships English-first; Hebrew RTL only Wave 2. Yossi's UI is English. He understands "score: 27" but the fix-card descriptions ("Add FAQ schema to your homepage") are technical English. He half-understands.
- **4:00** Content Optimizer teaser card shows 3 sentences of his homepage rewritten — in English. He owns a Hebrew cafe site. **BREAK POINT #1: The free-scan teaser shows an English rewrite for a Hebrew business.** No spec line says the teaser localizes.

### Minute 5–10 — Paywall + checkout

- **5:30** Clicks "תקן את זה עכשיו" (or English equivalent) → Paywall modal. Build is highlighted at $189. Annual toggle ON by default (saves 20%). He picks Discover at $79 because Yossi runs on tight cash.
- **6:00** Paddle checkout overlay. Israeli credit card. Hebrew/English in Paddle's hosted UI is fine.
- **7:30** Payment succeeds. Webhook fires. Redirect to `/onboarding/post-payment`.

### Minute 10–60 — Day-1 chain

- **10:00** Post-payment screen: "Confirming payment…" Progress bar at 10%. Polls every 3s. **GOOD.**
- **10:30** "Setting up your workspace…" 25%.
- **11:00** "Mapping how AI engines see Florentin Coffee…" Query Mapper running.
- **12:30** **Query Review Gate.** Top-10 queries surface for review. Half are English ("best coffee Tel Aviv"), half are Hebrew transliterated badly ("ha-kafe ha-tov b'florentin"). **FRICTION.** Yossi edits 3, removes 2. Clicks "Confirm queries."
- **13:00** "Scanning 3 engines for your queries…" 50%.
- **15:00** Discover gets 3 engines (ChatGPT, Gemini, Perplexity). Each takes ~30s. 75%.
- **16:00** "Analyzing and prioritizing…" Rules engine + ranker.
- **16:30** Step E auto-runs 2-3 highest-impact agents (Schema Generator + FAQ Builder + maybe Freshness). Drafts appear live with "drafted ✓" check marks. **DELIGHT — this is the dead-dashboard cure working as specced.**
- **17:00** Redirect to `/home`. Score (27) + 1 visible suggestion + 2 blurred + 3 drafted Inbox items. Notification: "Your workspace is set up. 3 suggested actions are ready and 3 drafts are waiting in your Inbox."
- **17:30** **CONFUSION:** Yossi opens Inbox. 3 drafts: Schema Generator (JSON-LD code block), FAQ page (English), Freshness Agent rewrite of his About page (English). He needed Hebrew. **BREAK POINT #2: Auto-run agents on Day-1 produced English output for a Hebrew business.** No language detection on Step E. Wave 2 Hebrew prompts haven't shipped yet.
- **20:00** He clicks Approve on Schema Generator (it's just JSON-LD, language-neutral). Approve modal: "Copy to your `<head>` tag." He doesn't know what a `<head>` tag is. **FRICTION — no "send to my developer" CTA.**
- **30:00** He rejects the English FAQ. Approves Freshness Agent but doesn't know how to apply it (copy markdown where?). **FRICTION — Archive copy-MD CTA is there but the "how to apply" is a one-line tooltip.**
- **45:00** He pokes around. Competitors page works — 3 competitors tracked. Automation page is locked (Discover tier). Scans shows the one scan. Settings is mostly fine.
- **60:00** First hour ends. Score 27. 1 approved item (the schema). 1 archived. Nothing published. Notification badge cleared.

**Emotion at minute 60:** "I paid 290 shekels for this. It's pretty. The team did real work. But I can't use most of it because it's English."

### Day 1–7 — First week

- **Day 1, evening:** Welcome email arrives (Hebrew? Spec doesn't say — see 19-SUPPORT-CHANNEL-SPEC: bilingual auto-acknowledge for support, but welcome-onboarded template language is unspecced in 09-WAVE-1-BRIEF).
- **Day 2:** No new scan (Discover = weekly). No new suggestions (Discover = 1/day on dashboard, but the rules engine only re-fires on scan completion). **Home looks identical to Day 1.** Inbox unchanged. **BREAK POINT #3: Discover's daily cadence + weekly scan means Days 2-6 have nothing new to look at.**
- **Day 3:** Yossi logs in. Same suggestion. Same drafts in archive. Leading-indicator panel says "1 action completed this week." That's it.
- **Day 4:** Email digest at 7am (max 1/day). What does it say? Nothing changed on his account. The email digest aggregator probably skips sending. **He doesn't get an email — silent week.**
- **Day 5:** Yossi checks once, leaves. No hook.
- **Day 6:** Same.
- **Day 7:** Scheduled weekly scan fires automatically. Score: 28 (+1, noise). Rules engine fires. New suggestion appears. New auto-run drafts? No — auto-run is Day-1-only per 03-DAY-1-FLOW Step E. **The scheduled scan produces suggestions but not drafted content. He has to manually click "Run" on a suggestion to get a draft.** On Discover, "Run" works but each run consumes 1-3 AI Runs from his 25/mo allocation.

### Day 8–14 — Refund-window-closing week

- **Day 8:** Score still 27-28. No citations yet (per 08-UX-ARCHITECTURE §10 Expectations Timeline: "Week 1–2: Activity indicators only. No score movement yet.").
- **Day 10:** Leading-indicator panel: "Content published this week: 0." Yossi didn't publish anything because the drafts were English. **The leading indicators are zero.**
- **Day 13:** Refund window closes Day 14. Yossi sees:
  - Score: 28 (was 27)
  - Citations detected: 0
  - Actions completed: 1 (the schema he never deployed)
  - Content published: 0
  - Next scheduled run: tomorrow
- **Day 13 emotion:** "What did I pay for?" **BREAK POINT #4: Activation-vs-refund-window collapse for Hebrew Discover users.** ADQ-5 50%-consumed cap doesn't save him — he's consumed <50% of 25 runs, so refund is full.
- **Day 14:** Yossi emails support@beamixai.com in Hebrew. Plain routes to Adam personally (Hebrew tag). Adam offers a free month or a Hebrew prompt preview. Maybe Yossi stays. Maybe not.

### Day 15–28 — First citation period

(If Yossi didn't refund.) Per the timeline, Week 3–4 is when first Perplexity/Gemini citations could appear. But Yossi has 0 published content. **There is nothing to be cited.** Score won't move.

### Day 29–31 — Month 1 review

- Yossi cancels via Paddle portal. Reason: "Didn't work for Hebrew."
- This persona REFUNDS or CHURNS at month 1 with ~70% probability.

---

## Persona B — US SMB e-commerce ($189 Build)

**Profile:** Sarah, 38, owns a DTC sustainable-skincare Shopify store in Portland. English-native. Desktop, Chrome.

### Minute 0–60

- Free scan: clean. Score 41. Wound-reveal hits — she sees her top competitor (an Allure-darling brand) at score 67. Loss-aversion lands. Clicks "Fix this now."
- Build at $189 (annual: $151). She picks Build.
- Day-1 chain: Query Mapper produces 50 e-commerce queries. Query Review Gate — she keeps 8, drops 2. Confirm. 7 engines scan (Build tier). Rules engine fires 6 rules — Haiku ranker prioritizes. Top 3 suggestions surface. Auto-run produces a Schema draft for her product page, an FAQ page draft ("sustainable skincare FAQ"), and a Freshness rewrite of her "About our ingredients" page. **All three drafts are usable. English. Real.**
- At minute 60: Score 41, 3 approved Inbox items pending review, evidence panel shows real citations from her competitor's site that she can crib from.

### Day 1–7

- Day 1: Approves Schema. Pastes into Shopify theme.liquid. Approves FAQ draft, copies markdown, pastes into a new Shopify page. Marks both "published" in Archive.
- Day 2: Build = daily scans. New scan fires overnight. Rules re-evaluate. 1 new suggestion: Content Optimizer for her best-selling product page. Cost: 2 AI Runs. She runs it. Draft lands in Inbox 90s later.
- Day 3-6: Pattern continues. ~5 actions/week.
- Day 7: Leading-indicator panel shows "Content published this week: 3. Actions completed: 5. Citations detected: 0 (still too early). Next scheduled run: tomorrow."

### Day 8–14

- Day 10: Authority Blog Strategist runs (Build tier unlocked). 1500-word listicle: "8 Sustainable Skincare Brands Worth Your Money." Lands in Inbox.
- **BREAK POINT #5: Edit surface for Authority Blog draft.** Spec says: textarea + react-markdown, no TipTap. Sarah wants to edit 1500 words inline. She can use the textarea. It's painful for long-form. Inline chat editor is Freshness Agent only. She ends up copying to Notion to edit, then pasting back. **FRICTION but not fatal.**
- Day 13: First citation appears on Perplexity for "best sustainable skincare brands" — her listicle (which she published Day 11) is cited. Leading-indicator panel: "Citations detected: 1." **DELIGHT — this is the magic moment.**
- Day 14: Refund window closes. Sarah does NOT refund. She tells a friend.

### Day 15–28

- Daily scans show score climbing 41 → 47. 4 more citations across Perplexity + Gemini.
- Sarah hits her 90 AI Runs cap on Day 22. Top-up modal: $19 for 10 runs. She buys it.
- Performance Tracker fires comparisons after each new scan. "Your product page is now cited on 2 new queries." Real before/after.

### Day 29–31

- Month 1 review: Score 47 (+6), 7 published pieces, 6 citations across 3 engines.
- Sarah RENEWS. **Build is where the product works.**

---

## Persona C — Marketing agency on Scale ($499)

**Profile:** Marcus, agency owner, managing 5 SMB clients. English. Wants to white-label reports for clients.

### Minute 0–60

- Scans 1 client's site (his agency's own marketing site as a test first). Result page → Scale tier paywall → checkout. Day-1 chain runs for his agency site.
- Auto-run produces drafts. Marcus is impressed by the speed.

### Day 1–7

- Marcus wants to add his 5 client businesses.
- **BREAK POINT #6: Multi-tenant / multi-client workflow is not specced.** The Beamix data model is `user → 1 business`. Per the 08-UX-ARCHITECTURE Business tab in Settings: "business name, industry, location, services array, scan URL." Single business per account. Marcus would need to either (a) buy 5 Scale subscriptions ($2,495/mo) or (b) cycle his business profile and lose history. **Neither works for agency workflow.**
- Marcus searches for white-label. Nothing in the spec. Per memory `project_white_label_per_client`, white-label is intended per-client — but it's not in MVP-1.
- Marcus emails support: "Do you support agency multi-client?" Adam replies: "Not yet — coming." Marcus refunds Day 4 (ADQ-5: he's used ~5% of runs, full refund).

### Activation cliff at refund

- **Persona C REFUNDS at Day 4 with ~95% probability.** Scale isn't built for agencies in MVP-1 even though the price-point implies it.

---

## Top 5 break points (where customer journey collapses)

1. **Hebrew Discover users get English agent output Day 1-14.** Wave 2 ships Hebrew prompts, refund window closes Day 14. The 1-3 auto-run drafts on Day 1 (the dead-dashboard cure) fire BEFORE Hebrew prompts exist. Yossi's $79 buys him 14 days of unusable drafts. *Fix: Detect business language in Step A; if Hebrew, skip auto-run agents that produce text and surface "Hebrew agents coming Day X" with credit refund.*

2. **Discover Days 2-6 are silent.** Weekly scan + 1 suggestion + no scheduled drafts = nothing happens for 5 days. The leading-indicator panel exists but if customer hasn't published anything, every indicator is zero. *Fix: On Discover, schedule a Freshness Agent or FAQ Builder draft mid-week as a "we kept working" pulse.*

3. **Auto-run drafts have no "how to apply" guidance.** Schema is `<script type="application/ld+json">` code. FAQ is markdown. Freshness rewrite is markdown. Non-technical SMB owners don't know where to paste any of this. Spec mentions "copy to clipboard" but no per-CMS guides, no "send to developer" email CTA. *Fix: Per-output deployment instructions (Shopify/WordPress/Wix/Webflow templates).*

4. **Activation evidence at Day 13 for low-activity users is zero.** Leading-indicator panel was added specifically to bridge the refund-window gap, but if the user didn't publish anything (because drafts didn't fit their CMS / language), every indicator stays at zero. The refund decision happens with literal zero positive signal.

5. **Multi-tenant / agency workflow doesn't exist.** Scale tier at $499 implies professional use. 20 competitors tracked, 250 AI Runs, but only ONE business. Agencies hit this in <1 day and bounce.

---

## Top 3 delight moments (what makes someone tell a friend)

1. **The wound-reveal at minute 2:30.** Score animation + competitor loss-aversion + 8 blurred cards = visceral. Best surface in the product. Conversion-grade as specced.

2. **The Day-1 chain progress UI showing real drafted-content cards appear live.** "drafting…" → "drafted ✓" is the killer detail — the product *did work for you* during checkout. Beats every competitor's "log in and start configuring" empty dashboard.

3. **First citation on Perplexity Week 2.** When the leading-indicator "Citations detected" counter goes from 0 to 1, with the actual citing URL displayed in the Inbox evidence panel — that's the moment the customer believes the product works. Sarah tells her DTC slack about this.

---

## Activation cliff vs refund window — concrete prediction

**14-day refund rate prediction by tier (given what Wave 1-4 ships):**

| Tier | Prediction | Driver |
|------|------------|--------|
| Discover Hebrew | ~50-60% refund | English drafts, silent week, zero activation evidence |
| Discover English | ~25-30% refund | Silent week 2-6 problem; some users wait for the week-7 scan and stay |
| Build (English) | ~10-15% refund | Daily scans + 90 AI Runs + Authority Blog produces visible work; first citation typically lands Day 10-14 |
| Scale (English) | ~30-40% refund (mostly agencies) | Strong for single-business power users, kills agencies who expected multi-client |

**Combined refund rate at launch with Discover/Build/Scale split assumed at 40/45/15:** roughly **22-27%**. ADQ-5 50%-cap saves Build/Scale partial revenue but doesn't help Discover (consumption < 50%).

**Hidden risk:** the 50% cap only triggers above 50% consumption. Discover users have 25 runs — most refund-requesters will be under 12 runs consumed. They get full refunds and Beamix loses the full $79 + Paddle fees.

---

## One thing to add for customer success

**Per-CMS deployment helper for drafted content.** Every Inbox item from Schema Generator, FAQ Builder, Content Optimizer, and Freshness Agent needs a "How to apply this" panel detecting the user's CMS (Shopify / WordPress / Wix / Webflow / custom — from `businesses.scanUrl` heuristic) and showing platform-specific paste instructions, plus a "Email this to my developer" CTA that sends the draft + instructions to a specified address.

Cost: <8 hours of frontend work, zero LLM cost (templates by platform). Impact: turns the "I have a markdown blob and don't know what to do" moment — which is the silent killer between Approve and Publish — into a 30-second action. Without this, the leading-indicator "Content published this week" stays at zero for non-technical users, the refund-window evidence panel stays empty, and Discover churns.

This is the single highest-leverage missing piece between "draft produced" and "customer believes Beamix works."
