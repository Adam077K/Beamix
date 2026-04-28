# Brand & Distribution Lead — Board Meeting 2026-04-27

*Lens: distribution mechanics, brand-as-moat, copy/voice, virality.*
*Inputs: Frame 5 v2, Editorial surfaces spec, Customer Journey Audit, Wedge Launch PRD, customer archetypes Marcus / Dani / Yossi.*

---

## Q1: Monthly Update permalink — private vs public

### Distribution model

**Assumptions:**
- Active customer base at Month 6: 200 accounts (conservative, $1M ARR target)
- Scale/Build split: 60% Build (Marcus, Dani), 40% Scale (Yossi, larger operators)
- Monthly Update recipients per customer: 1-3 (founder + co-founder, or agency sends to client)

**Private model (Adam's prior lock):**

| Variable | Assumption | Reasoning |
|---|---|---|
| Customers who actively share | 30% | Requires deliberate "Generate share link" gesture — low spontaneity |
| Of those who share: via PDF email attachment | 50% | Default email behavior when no link is available |
| Of those who share: via explicit link (generated) | 50% | Made the effort; link copy is lower friction |
| Forwards per sharer per month | 1.5 | Monthly Update, not a viral moment — it goes to one co-founder or one board member |
| Non-customers reached (link path) | 30 people/month | 200 × 30% × 50% × 1.5 = 45 emails; 30 link-shares × 1 recipient = 30 |
| Non-customer → scan conversion | 4% | B2B cold intro rate for a referred artifact |
| Net new scans/month from Monthly Update | ~2 | 30 × 0.04 ≈ 1.2 + 45 PDF forwards with no URL = 0 scans from PDF path |

**Public model (Editorial spec default):**

| Variable | Assumption | Reasoning |
|---|---|---|
| Customers who share | 80% | Frictionless: "forward this" CTA built into the PDF and the email; sharing is the default gesture |
| All shares via link | 100% | No PDF-only path; the link IS the artifact |
| Forwards per sharer per month | 1.8 | Higher because they forward the URL, not an attachment — lower psychological cost |
| Non-customers reached | 288 people/month | 200 × 80% × 1.8 = 288 link-shares |
| Non-customer → scan conversion | 4% | Same rate; quality of referral is similar |
| Net new scans/month from Monthly Update | ~12 | 288 × 0.04 ≈ 11.5 |

**Delta: public generates ~6x more inbound scans from the Monthly Update channel than private.**

**Does the Marcus / Dani / Yossi mix change the answer?**

- Marcus (B2B SaaS founder): forwards to co-founder and occasionally a board member. High privacy concern — the Monthly Update contains competitor intelligence, attribution numbers, and specific agent actions on his site. He will not want a public URL indexed by competitors. Under public default, Marcus will flip the per-report privacy switch, which means he is opt-out, not opt-in. That's fine — the 80% figure already assumes 20% don't share.
- Dani (e-commerce operator): forwards to her agency or investor. Lower competitive sensitivity — her AI visibility numbers are not proprietary in the way Marcus's are. More likely to share casually. Public default serves Dani perfectly.
- Yossi (agency): sends the Monthly Update to 12 clients. Under white-label (Scale), it goes from his agency to each client. The URL is the artifact; the client does not need a share link because Yossi is the distribution. Yossi does NOT forward to non-clients — he is the distribution channel himself.

**Critical private-vs-public mismatch:** The Monthly Update contains the exact sentence that converts non-customers: *"In April, 14 AI-attributed sessions came from AI search."* That sentence, landing in an inbox via a forwarded PDF, has no URL to click, no scan CTA, and no Beamix OG card to arrest the eye. The PDF attachment path is a dead end for acquisition. The link path is the live wire.

### My pick: HYBRID (private default, but with a zero-friction "share" button built into the email and PDF)

Not "public default" — the Audit confirmed Marcus has a legitimate privacy concern about competitor intelligence in a public URL. Not "private only" — that kills the distribution flywheel.

### Reasoning

The EDITORIAL spec says "default-public, designed to be forwarded." Adam's lock says "default-private." Both are right about different customers. The resolution is not a binary — it is a sharing UX that makes the gesture feel like nothing.

The Monthly Update email ships with two CTAs:
1. Primary: `Open the full PDF →` (to the private permalink, authenticated)
2. Secondary, in 13px Geist Mono below the signature: `Forward a summary →` — this generates a **redacted public summary** (score, lead-attribution headline, and the Beamix signature line only — no competitor names, no specific agent actions). The redacted summary is what gets forwarded; it is public-by-design and contains zero competitive intelligence.

This gives Beamix the distribution flywheel without exposing Marcus's competitor intelligence. Yossi's white-label version sends the full PDF to his client (private, authenticated) and gives the client the option to generate a board-ready public summary separately.

The full Monthly Update permalink remains private-by-default. The summary share card is public-by-default. This is not complexity — it is two distinct artifacts with two distinct privacy models, designed for two distinct audiences.

**Numbers under hybrid model:** Assuming 60% of customers use the "Forward a summary" gesture (lower friction than explicit link generation, higher than full-document forward): 200 × 60% × 1.6 = 192 summary shares × 4% = ~8 net new scans/month. Meaningfully better than pure private; no competitive-intelligence risk.

---

## Q2: White-label digest signature

### Brand-impression model

**Setup:** Yossi at Scale: 12 clients × 12 months = 144 Monthly Updates per year.
Each Monthly Update is read by Yossi's client (1 read) and potentially forwarded to their stakeholder (estimated 0.4 additional reads). Total reads: 144 × 1.4 = ~202 reads/year.

**Each Monday Digest:** 12 clients × 52 weeks = 624 digest sends/year. Yossi reads all of them (agency operator). His clients receive them under the agency brand if white-labelled. Client reads: 624. Yossi's clients may screenshot and share — estimate 5% share rate = 31 additional brand impressions/year from digest.

**Scenario A — Beamix only:**

| Surface | Beamix brand impressions/year |
|---|---|
| 144 Monthly Updates (client sees "— Beamix") | 144 |
| 624 Monday Digests (client sees "— Beamix") | 624 |
| Yossi's proposal docs mentioning Beamix | ~24 (2/month) |
| Total Beamix impressions via Yossi | **792** |
| Referrals from Yossi to other agencies | Low: Yossi cannot resell. He uses Beamix internally. He does not advocate because there's nothing in it for him. |

**Scenario B — Agency only:**

| Surface | Beamix brand impressions/year |
|---|---|
| Monthly Updates (client sees Yossi's agency mark) | 0 (Beamix invisible) |
| Monday Digests (client sees agency mark) | 0 |
| Yossi's proposals: "powered by [agency]" | ~24 — again, Beamix invisible |
| Referrals from Yossi | High: Yossi can resell under his brand. If he gets 2 new agencies because he can offer this service, those 2 agencies × 12 clients × 144 Monthly Updates = 288 additional reads/year with 0 Beamix visibility |
| Total Beamix impressions | **0 direct. 2 potential referral accounts.** |

**Scenario C — Both, tier-gated (Scale = white-label + optional "Powered by Beamix" footer):**

| Surface | Beamix brand impressions/year |
|---|---|
| Monthly Updates (Yossi's mark + small footer) | 144 at reduced salience (footer-only) |
| Monday Digests (agency mark + footer) | 624 at reduced salience |
| Yossi as advocate | Medium-high: he can resell AND Beamix gets the footer impression |
| Referral accounts | Estimated 1.5 new agencies/year (Yossi advocates because he can build a service on it) |
| Total high-salience Beamix impressions | **~144 footer impressions + ~144 from referral agencies** |

**Cost of white-label vs gain:**
- Losing 792 direct impressions in Scenario A to get ~2 referral accounts (Scenario B) = poor trade. The referral accounts are anonymous — they have no Beamix brand awareness when they arrive.
- The "Powered by Beamix" footer (Scenario C) costs ~50% salience vs full brand presence but unlocks Yossi as a distribution channel. Stripe Atlas / Stripe Climate both use this pattern at scale. "Powered by Stripe" converts because Stripe is already trusted; "Powered by Beamix" converts in Year 2 when Beamix has brand weight. At Year 0, the footer is a brand investment, not a brand return — but it is the correct bet for a platform.

### My pick: BOTH — TIER-GATED (Scenario C)

### Reasoning

Beamix-only is the right answer for the first 6 months, while the brand is building. White-label without any brand presence is the right answer for Year 2+ when Yossi's reselling creates network effects Beamix cannot manufacture directly.

The "Powered by Beamix" footer is the bridge. It mirrors exactly what Stripe did with Atlas (2016-2018): the partner gets to white-label the product experience, Beamix gets a persistent footer impression on the highest-trust forwarded artifact in the customer relationship. Stripe did not suffer from this — they grew the brand through it.

The gate: white-label is Scale ($499/mo) only. Discover and Build always send with "— Beamix" signature. This creates an upgrade incentive for agencies: Yossi on Build cannot white-label; to resell under his brand, he must be on Scale. That is a $310/mo/account upgrade motivator — one of the strongest in the product.

### Designed signature line

**Discover and Build — no white-label:**
```
— Beamix
```
Rendered: 15px Geist Mono, `ink`, right-aligned in the Monday Digest footer. In the Monthly Update PDF: 16px Geist Mono italic, center-aligned under the body, above the cream paper bottom edge. No elaboration. The signature is the artifact's seal.

**Scale — white-label enabled:**
```
Prepared by [Agency Name]
Powered by Beamix
```
Rendered: `[Agency Name]` in 15px Inter 500, `ink`. `Powered by Beamix` in 12px Geist Mono, `ink-3` (subdued). The agency name is the primary signature; Beamix is the manufacturing credit. Visual hierarchy is clear: the client trusts the agency; Beamix gets the footnote impression.

**Design notes:** The "Powered by Beamix" line should never share typographic prominence with the agency name. It is footnote-grade — 12px, Geist Mono, `ink-3`. Do not give it brand-blue color; that would make it competitive with the agency mark. The restraint is the point: Beamix is confident enough not to fight for the spotlight on Yossi's artifact.

---

## Q3: Voice canon

### My pick: Model B

*"/home + /crew name agents ("Schema Doctor"). All emails, PDFs, and permalinks use "Beamix." Agents are characters inside the product but invisible outside.*

### Defense

Model A (Beamix everywhere) erases the crew metaphor entirely. The /home Evidence Strip loses its most human quality: "Schema Doctor fixed this" is a more interesting sentence than "Beamix fixed this." Inside the product, where the customer is oriented, agent names create a sense of a real team doing real work. The customer learns the crew. She starts saying "I need to check what Schema Doctor's been up to." That is retention language. Erasing that inside the product in the name of voice consistency loses real value.

Model C ("your crew" everywhere) keeps the metaphor but dissolves the characters. The crew becomes anonymous plural — a committee. Committees are forgettable. Schema Doctor is memorable. The named character is the brand asset.

Model B resolves the tension correctly: **inside the product, agents have names because the customer is oriented, logged in, using the system.** Outside the product — in every email, every PDF, every public permalink — the voice is "Beamix" because the audience may include non-customers, board members, co-founders, or Yossi's clients. The external audience has no context for who "Schema Doctor" is. "Beamix fixed this" is clear. "Schema Doctor fixed this" is confusing without the /crew page to explain it.

The signature question resolves itself under Model B: "— your crew" on the onboarding seal is wrong (it is a product surface internal to the customer's session, but the Seal is the constitutional moment — it should sign "— Beamix"). Onboarding Seal becomes "— Beamix." /home Evidence Strip stays "Schema Doctor: Added FAQ schema…" because /home is the inside of the product. Monday Digest signs "— Beamix." Monthly Update signs "— Beamix."

Marcus's preference: Beamix-named externally. He's showing the Monthly Update to his co-founder. He does not want to explain who Schema Doctor is at a board meeting.
Dani's preference: Either; she cares about the result, not the attribution. Model B works.
Yossi's preference: White-label anyway; the Beamix/crew question is moot on his artifacts. Inside his dashboard, he wants agent names — they help him explain to clients which specialist is working on their account.

### Canonical voice rule (3 sentences for Brand Guidelines)

Inside the product — /home Evidence Strip, /crew roster, /workspace step list, /inbox item attribution — agents are identified by name: "Schema Doctor added FAQ schema to /services/emergency." Outside the product — in all emails, all PDFs, all public permalinks, all share cards — the actor is always "Beamix": "Beamix added FAQ schema to your services pages." The onboarding Seal, the Monday Digest, the Monthly Update, and every event-triggered email all sign "— Beamix"; no Beamix communication addressed to a non-customer ever names a specific agent.

---

## Q4: Day 1-6 silence cadence

### Cadence overview

| Day | Trigger | Email name | One-line job |
|---|---|---|---|
| Day 0, T+10min | Post-onboarding Seal-draw completion | Welcome + first findings | Confirm Beamix is working; set Monday Digest expectation |
| Day 2 (or first completed agent action, whichever comes first) | First substantive agent output queued in /inbox | First finding ready | Pull customer back into the product with specific news |
| Day 4 | 3 days of silence since Day 0 email, no /inbox approval yet | Review-debt nudge | Surface the pending /inbox items without alarm |
| Day 5 (if Day 4 email not opened) | Pre-Monday teaser | Tomorrow: your first Beamix Monday | Frame Monday Digest before it arrives |

Four emails. The Day 5 email only sends if Day 4 was not opened (reduce cadence for engaged customers).

### Detailed copy per email

---

**Email 1 — Day 0, T+10min: Welcome + first findings**

Subject: `Beamix · welcome. here's what's already moving.`

Opening:
> Monday, April 27.
>
> Your Brief is signed. Beamix is working.
>
> Three things are already underway:
>
> — Schema Doctor scanned /services and found 4 schema gaps. Fix is queued for your review.
> — Citation Fixer is drafting 11 FAQ entries for your top-query pages.
> — Competitor Watch ran your first competitor sweep. Profound published 2 new comparison pages this week.
>
> One thing needs you: app.beamix.tech/inbox
>
> Your first Monday Digest lands next Monday at 8am. That's when you'll see the week's full scorecard.
>
> — Beamix

**Length:** 8-10 sentences. Plain text body, cream-paper header strip.
**CTA:** `app.beamix.tech/inbox` — raw link, no button. Operator-grade.
**Register:** Monday Digest register. Same voice. No congratulations. No "you're all set!" No exclamation points.
**Send condition:** Fires 10 minutes after onboarding Step 4 (Truth File) completion. Does not fire if customer is still active on /home (session active). Not a "welcome" email — Beamix does not celebrate; it reports.

---

**Email 2 — Day 2 (or first /inbox item, whichever first): First finding ready**

Subject: `Beamix · first finding ready — [top agent action in 4 words]`

Example subjects:
- `Beamix · first finding ready — 11 FAQ entries drafted`
- `Beamix · first finding ready — schema gap on /pricing`
- `Beamix · first finding ready — competitor published 3 new pages`

Opening:
> Wednesday, April 29.
>
> Schema Doctor finished its first pass on /services.
>
> It found 4 schema errors blocking citation on Perplexity and Claude. Fixes are drafted and waiting for your approval. This takes 2 minutes.
>
> → app.beamix.tech/inbox/[item_id]
>
> — Beamix

**Length:** 6-8 sentences. One finding, one link, one sentence explaining why it matters. No more.
**CTA:** Direct deep-link to the specific /inbox item. Not the /inbox root — the specific item.
**Register:** Plain-text body. Exact copy of the /inbox item's preview. The email IS the /inbox item; clicking the link opens the full context.
**Send condition:** Fires when the first substantive agent action clears pre-publication validation and is queued in /inbox. "Substantive" = a Schema Doctor fix, a Citation Fixer draft, or a Competitor Watch alert. Not a credit-balance update. Not a scan-complete ping (that fires separately per PRD F14 event-triggered emails).

---

**Email 3 — Day 4: Review-debt nudge (only if /inbox items ≥1 unreviewed)**

Subject: `Beamix · 3 things waiting for you`

Opening:
> Friday, May 1.
>
> Three items in your inbox have been waiting since Wednesday.
>
> The longest-waiting: Schema Doctor's FAQ draft for /services. Citation Fixer is holding its competitor-response draft until you approve the FAQ first — it's in the queue.
>
> This week's scan ran last night. Score is at 43 (up 2 from your scan on signup). Engine breakdown is in your inbox too.
>
> → app.beamix.tech/inbox
>
> — Beamix

**Length:** 6-8 sentences. Reports what's waiting. Names the dependency (Citation Fixer waiting on FAQ approval) — this is the specific detail that converts a skimmer into a clicker. Does not beg. Does not say "don't forget" or "just a quick reminder."
**CTA:** `/inbox` root link. By Day 4, the customer has multiple items; send them to the list, not a single item.
**Register:** Plain text body. Calm, factual. The "3 things waiting" subject line is the urgency signal — the email body does not repeat the urgency.
**Send condition:** Day 4 from signup. Only sends if /inbox review-debt ≥ 1 item AND customer has not logged in since Day 2. If they've been active, skip this email — they already know.

---

**Email 4 — Day 5: Pre-Monday teaser (only if Day 4 email was not opened)**

Subject: `Beamix · tomorrow: your first Monday Digest`

Opening:
> Saturday, May 2.
>
> Tomorrow at 8am, your first Monday Digest lands.
>
> This week Beamix ran your first full scan (score: 43), drafted 11 FAQ entries, and identified 2 competitor moves. Three items are in your inbox. The digest will summarize everything.
>
> If you want to review what's pending before Monday: app.beamix.tech/inbox
>
> — Beamix

**Length:** 5-6 sentences. Teases the Digest content without replacing it. The purpose is re-engagement: the customer who hasn't opened since Day 0 gets one more signal before Monday.
**CTA:** `/inbox` link, but framed as optional. "If you want to" — not a command. Beamix is not desperate.
**Register:** Same Monday Digest register. Saturday email that reads like the Monday email is the consistency signal: Beamix sounds the same at 8am on Monday as it does at any other time.
**Send condition:** Day 5 from signup. Only sends if Day 4 email was not opened. Maximum one email every 24 hours in this window — never stack Day 4 and Day 5 sends if Day 4 was delayed.

---

**Cross-cadence rules:**
- If customer opens the product on any day (session active), suppress that day's email.
- Maximum 4 emails in the Day 0-6 window. No exceptions.
- All 4 emails are in the Monday Digest register: plain-text body, cream-paper header strip, "— Beamix" signature, em-dash subject separator.
- No HTML marketing template at any point in this cadence. The customer signed up for Beamix, not a drip campaign.

---

## Q5: AI-citable content brief for the Framer marketing site

**200 words. Highest-leverage moves in 90 days.**

Beamix's content is not AI-citable today because the Framer site is mostly UI marketing copy — short headlines, feature bullets, pricing tables. Claude, Perplexity, and ChatGPT cite *authoritative, specific, long-form content* when answering questions. The Framer site has none.

**Move 1 — Publish one authoritative definitional page: "What is GEO (Generative Engine Optimization)?"**
This query is answered inconsistently by every AI engine. A 1,200-word page on beamix.tech that defines GEO, explains how it differs from SEO, gives a 5-step framework, and cites 3 studies becomes the canonical reference. AI engines cite definitional pages constantly. This is the single most AI-citable content type. Framer supports blog/CMS publishing. Write it now, optimize for the query cluster "generative engine optimization," "AI search visibility," "GEO marketing." Target: cited in Perplexity within 60 days of indexing.

**Move 2 — Add structured schema to the /scan public page.**
The public /scan page is Beamix's highest-traffic surface and currently has no FAQ schema. Adding `FAQPage` schema to 5 questions ("how does AI search visibility work?", "what is a GEO score?") gives Beamix's own domain AI-engine citations for the exact questions its customers are asking. The /scan page gets the schema; the Framer marketing blog gets the long-form.

Ship both in the same sprint. These are the distribution seeds.

---

## Single most important growth bet

The Day 1-6 silence cadence (Q4) is the highest-leverage decision in this board session — not because it is the most strategically interesting, but because it is the most immediately compounding. Every cohort of signups that signs up Tuesday and hears nothing until Monday is a cohort losing retention momentum at the moment of highest intent. Getting 4 plain-text emails right, in voice, with specific findings, converts a 60% Week-2 retention rate into something closer to 80%. That 20-point retention improvement, compounded across every cohort, is worth more than any acquisition channel discussed today. The emails cost a weekend of copy work to write and a sprint to instrument. The Monthly Update permalink debate and voice canon are important, but they affect the top of funnel and brand perception; the silence cadence affects whether the customers you already paid to acquire stay long enough to become the referrals that grow the top of funnel.

---

*End of Brand & Distribution Lead board input — 2026-04-27*
