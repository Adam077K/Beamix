# Marcus simulator — Board Walkthrough
Date: 2026-04-27

> First-person, in voice. B2B SaaS founder, $1.8M ARR, 30-person company. CTO co-founder Aria. 5 minutes/week budget for Beamix.

---

## Day -1: founder Twitter encounter

8:47 PM, Monday. I'm scrolling X waiting for a Vercel deploy. A founder I follow — does API observability, Series A, smart guy — quote-tweets a link with the caption: "36/100. Three competitors cited; we're cited in two engines. Ouch."

I click the link expecting another SaaS dashboard screenshot. I don't get one. I get this cream-paper page that looks like a diploma. Fraunces serif. Rough hand-drawn rectangle around his URL. A score arc that looks like someone sketched it with a Pilot pen. There's a line in italic that says something like *"Stronger on Perplexity than Claude. Top fix is FAQ schema."* And a hand-drawn seal at the bottom.

I screenshot it. I don't screenshot SaaS dashboards. I screenshotted this because it looks like an artifact, not a tool. That's the only reason I'm still on the page after 4 seconds.

Two things happen in my head at the same time: (1) "this is the design move I keep telling Liam we should steal," and (2) "wait, what's MY score?" The second thought is the dangerous one. I've been thinking about AI search visibility for two months. I know my dev-buyer is asking Claude "what's the best API monitoring tool" and I have no idea if I come up. That's been a low-grade migraine since February.

I don't sign up. I don't even click "scan yours." I open a new tab, type `/scan`, and start typing my domain. The fact that I hunted for the input instead of clicking a CTA is actually a *better* signal of intent than any funnel they could design. I'm here on my own steam.

---

## Day 0, 9:14am: scanning acme-saas.com

Tuesday morning. Coffee. I type `acme-saas.com`. Hit Enter. The hand-drawn rectangle sketches itself around my URL. OK, fine, this is the same thing I saw last night, but now it's MY URL and the wobble feels deliberate.

Then it auto-detects: *"Acme · API observability · English."* In handwritten font on the right. I click "API observability" and strike it through, write "developer tooling." That feels good. The strike-and-rewrite mechanic — I have to admit, that's a real design choice. Most tools would have made me click an "edit" pencil icon. This treats my correction like it's part of the document. I'd ship that.

Then 11 bubbles. Pulsing. Sample queries scrolling: *"best API monitoring for Node?"*, *"alternatives to Datadog under $100/mo?"*. Each bubble fills with a dot. ChatGPT — hollow. Claude — hollow. Perplexity — filled. Gemini — filled. AIO — hollow. I'm watching the dots and I can FEEL my pulse going up. This is theatrical, but it's theatrical in the way watching a deployment log is theatrical. The information is real.

Score lands. **41/100.** Three competitors above me. Cited in 2 of 11 engines. Top competitor cited in 7. Diagnosis line in Fraunces: *"41 out of 100. Beamix found 19 things to fix. The top three would move your score 14 points."*

Here's where I have to be honest as an operator: the cream paper is *almost* too much. If I'm at 41, do I want my emergency room report on stationery? It's a real question. A part of me thinks "this is the SaaS that thinks it's an art gallery." But then I look at the diagnosis line — "the top three would move your score 14 points" — and that's the sentence that overrides the design instinct. **It's a number, with a fix path, attached to a fear I already had.** I don't care that it's on cream paper anymore. I care that it's specific.

The performance is theatrical. The data isn't. That distinction is what saves it.

CTA: "Fix this — Beamix does the work." I click.

---

## Day 0 onboarding: Steps 1-4

**9:18am — Paddle.** I pick Build $189. $189/mo is noise. I burn $200/mo on tools that don't work. If this works for a quarter, it pays for itself. Click. Back to Beamix. URL has `?scan_id=` — good, they're not making me re-scan.

**Step 1 (9:19am, 22 seconds).** Fields are pre-filled. Domain, business name "Acme," industry "developer tooling" (my edit carried over — nice), location "Tel Aviv, Israel." I edit nothing. Click Continue. The 4-dot stepper at the top right looks clean. The 600ms fade-in of the form was the only motion and it didn't perform. Good.

**Step 2 (9:19:30am — and here's where I get annoyed).** "Set up call tracking." Three Tel Aviv phone numbers fade in: +972-3-XXX-XXXX. Forwarding to my real line. Copy buttons. *"We'll add up to 3 more on Build."*

Acme is a remote SaaS. We do not have a phone number. Customers do not call us. Customers Intercom us, Slack us, or open a GitHub issue. I'm staring at three phone numbers I don't need and the page is performing the act of *issuing me hardware*. For a B2B SaaS founder, this is the wrong ceremony. Every second I'm on this page is a second where Beamix is showing me it was built for a plumber.

I want UTM tags first. UTMs are how I close the loop — `?utm_source=beamix&utm_medium=ai_search`. That's the part that proves a developer asked Claude and clicked through. The phone numbers are a Dani feature, not a Marcus feature.

I click "Skip for now." I'm not RAGE-quitting, but I've mentally docked Beamix half a trust point. The dot in the stepper goes hollow. Fine. I keep going. **But the board needs to know: this step needs to invert for SaaS verticals.** UTM panel first, big and confident. Phone-numbers panel below as a *"if your customers also call you"* secondary. The audit caught this. Fix it.

**Step 3 (9:20am — the Brief).** Background fades from white to cream. I feel it. I'll admit it.

The Brief reads: *"Beamix recommends focusing on developer-tooling and API-discovery queries on ChatGPT and Claude, where developers ask 'what's the best library for X' more than 'what's the cheapest tool.' Your homepage is missing SoftwareApplication schema; we'll add it. Three competitors — DataDog, Honeycomb, and Vercel-rival — are cited more often than you on these queries; we'll respond with question-anchored content under your brand. Don't change your brand voice without asking."*

I read that twice. It's not ChatGPT-output sludge. It names my actual competitors. It mentions SoftwareApplication schema, which is the right schema. It says "don't change your brand voice without asking" — which is exactly the sentence I was going to type if asked. Whoever prompted that LLM understood the customer.

I edit one chip — change "Vercel-rival" to "DevToolsCo." Click "Approve and start." The seal draws onto the page in 2.5 seconds. I feel something dumb. Like I just signed a constitution. Worse: I pulled out my phone to screenshot it. **I never screenshot SaaS confirmation states.** The cream paper earned this moment.

**Step 4 (9:23am, 75 seconds).** Truth File. Shared base + vertical-extensions, per the board. My fields: integrations (15 of them), pricing model (per-seat, per-API-call), target company size (10–500 engineers), three claims I'd want repeated, voice words ("technical, dry, no marketing fluff"), never-say ("blazingly fast", "10x", "AI-powered").

Hours: 24/7. Service area: global. Both fields exist. Both feel weird for SaaS. Per the audit and the board's vertical-extension decision, these should not appear in the SaaS schema at all. **Fix this.** Right now I'm filling out fields that don't apply to me, which is the same problem as Step 2 — the product still leaks its plumber DNA.

I hit Continue. Confetti? No. Just a transition. Good.

---

## Day 0 magic moment on /home

9:25am. /home boots. Score counts 0 → 41 in 800ms. Ring draws around it in `brand-blue`. Activity Ring pulses. The status sentence below: *"Working on three things."* I have no lead-attribution data yet (Day 0, no clicks possible). The lead-attribution headline is in its empty state: *"Lead attribution starts collecting data 24 hours after you connect a tracked phone number."* With a "Connect a number →" link.

OK — here's a problem. I just *skipped* phone numbers in Step 2. The empty state is telling me to go connect a number. But for me, attribution lives in UTMs. The empty state doesn't acknowledge UTM as a path. It assumes phone is the path. **A SaaS user who skipped phone should see "Lead attribution starts when developers click your tagged URL — copy your UTM here →".** Different empty state per vertical. Otherwise the renewal anchor is misframed for me.

Below: Decision Card is absent (nothing pending Day 0). Evidence Strip: three cards. *"2 hours ago — Beamix scanned 11 engines."* *"38 minutes ago — Beamix queued schema repair."* *"Just now — Beamix proposed 8 FAQ entries."* The mono timestamp + verb + object grammar — that's the right grammar. I read all three in 4 seconds. I trust them. The score is 41, the page is calm, and I have a path forward.

The Crew at Work strip with monograms lighting up — yeah, that hits. I close the tab at 9:27am to take a meeting. I'll be back Wednesday at the earliest.

**5-second test verdict: I pass it.** Lead attribution headline empty state needs vertical awareness. Everything else lands.

---

## Day 1-6 silence + the 4 cadence emails

I signed Tuesday. First Monday Digest is 6 days out. Without a fill cadence, /home is frozen and my inbox is empty. That's where most B2B SaaS dies — Day 0 wow, Day 6 ghost. The audit caught this. The board approved 4 emails. Walking through them:

**Day 0, 9:35am — Welcome email.** "Sarah, Beamix is scanning your site overnight. Here's what to expect Monday." Plain text. Two sentences. The expectation-setting is exactly right — it tells me when to come back, and tells me NOT to come back before Monday. I'd appreciate this. Files away.

**Day 2 (Thursday), 8:00am — First finding.** "Beamix finished its first deep scan. Schema Doctor found 3 fixable errors on /pricing. They're queued for your approval — review when ready." With a permalink to /inbox. **This works for me.** It's specific. It's a number. There's something to do that takes 30 seconds.

**Day 4 (Saturday), 10:00am — Review-debt nudge.** "You have 3 items waiting in /inbox. Approving them takes ~90 seconds." Hmm. Saturday morning. This is borderline. If I'm in vacation mode I'll be mildly annoyed. **Recommend: send Day 4 only on weekdays. If Day 4 falls on a weekend, push to Day 5 morning.** Otherwise this is the email I'd unsubscribe from.

**Day 5 (Sunday), 5:00pm — Pre-Monday teaser.** "Tomorrow's first Monday Digest: score is up 4. Beamix shipped 5 changes this week." Actually — I love this. It pre-frames the Monday Digest so when I open it Monday morning I'm continuing a story, not starting one. Good editorial instinct.

**Net:** 4 emails in the silence is the right move. Day 4 timing needs the weekend rule. Subject lines matter — make them all start with "Beamix · " (the Monday Digest pattern) so they sort together in Gmail. I forward emails to Aria; consistent subject prefixes matter.

---

## Day 7: first Monday Digest

7:00am Monday. Plain text. Subject: *"Beamix · Apr 21–27: score up 4, 6 changes shipped."*

Body:
> Monday, April 27. Quiet productive week. Score 47 (+6). Beamix shipped 6 changes, found 4 new citations on Perplexity, watched DevToolsCo move on /api-monitoring queries.
>
> Mon · Added SoftwareApplication schema to /home, /pricing.
> Tue · Fixed canonical tags on /docs.
> Thu · Drafted 11 FAQ entries on /api-monitoring. **Awaiting your approval.**
> Sat · Watched DevToolsCo publish 3 comparison pages. Beamix queued response.
>
> → Approve 11 FAQ drafts. ~90 seconds.
>
> Credits: 38/120 used.
> Next scan: Friday.
>
> — Beamix

I read this in 12 seconds. I forward it to Aria with the line "this is what I bought." Aria opens it, sees the score is up 6, sees the action list, sees a real competitor named, and replies "ok cool." That is the entire point of the email. **It beats every SaaS email I currently get.** Linear sends notification garbage. Vercel sends deploy logs. Stripe sends balance updates. None of them tell me a story. This does.

The Geist Mono `Mon ·`, `Tue ·` prefix gives it terminal-DX feel. The plain-text discipline is a *signal* to me that the operator who built this knew to NOT send an HTML email.

---

## Day 14: first attribution

I sent the UTM link to my dev Liam in Slack on Day 8: "stick this on our `/blog` and `/docs` canonical URLs." Liam shipped it Day 9.

Day 14, 2:47pm: I get an event-triggered email. Subject: *"Beamix · first attributed click."* Body:

> A developer clicked your Beamix UTM URL after asking Claude "best API observability with low overhead." They landed on /docs/getting-started. Session lasted 4:12. They didn't sign up — yet. But the loop is closed: ChatGPT search → your tagged URL → your docs.
>
> This week so far: 3 attributed sessions.
>
> — Beamix

I forwarded that to Aria with the subject line "this is the moment I'm renewing." The *moment* is not the click — it's the email proving the loop closed. The Fraunces signature, the prose register, the technical-truth in Geist Mono ("4:12") — Beamix is the only product that has ever made me feel this kind of operator-respect. That's a $189/mo emotional anchor.

**One nit:** the subject line "first attributed click" is fine. But for me a better subject is "Beamix · a developer found you on Claude." Lead with the channel and the actor. The UTM is just the proof.

---

## Day 30: Monthly Update + forward to Aria

May 1, 7:00am. Email arrives. Plain text. Subject: *"Beamix · April 2026 update."*

> Aria,
>
> April's Monthly Update is ready. The headline:
> 9 attributed sessions and 1 conversion came in through Beamix-attributed channels — up from 0 last month.
>
> Read it: app.beamix.tech/reports/...
> Download PDF: app.beamix.tech/reports/...pdf
>
> — Beamix

PDF attached. I open it on my iPad in bed.

**Page 1 (cover).** Cream paper. "Acme" in 64px Fraunces, vertical center. Pull-quote in italic: *"This month, one developer asked Claude where to find API observability, found you, and signed up."* Activity Ring at the bottom with "47" inside. **I gasp at the pull-quote.** That's the sentence I'm going to quote in my next board update. It's the sentence I would forward to my YC group chat.

**Page 2 (Lead Attribution).** "9 attributed sessions and 1 conversion." The mono numbers next to Fraunces prose — that's a typographic move I haven't seen done well by any SaaS report. Most reports are dashboards in PDF clothing. This is a *letter*. Below, the attribution table: each session, query asked, time, engine. Geist Mono.

**Page 3 (score trajectory).** Sparkline. Two annotations: *"Apr 4 — FAQ schema went live"* and *"Apr 21 — Score crossed 47."*

**Pages 4-6.** Action narrative. Forward-look. Beamix wax seal closing. Permalink at the bottom in Geist Mono.

This is the artifact. I forward to Aria first (he's CTO, he's the one I trust to validate), then to Marcus K. (my board chair, who's been asking what we're doing about AI-search). Aria replies in two minutes: "this is good. renewal lock-in." Marcus K. replies "send me the Beamix founder's contact, my other portcos need this." That's two things I cannot get from a Mixpanel dashboard.

**The "Generate share link" button:** I find it on /reports. The fact that it's an explicit click instead of public-by-default is correct. I would have been pissed if my April attribution numbers were on an indexable URL the moment I forwarded it to Marcus K. and he tweeted a screenshot. Private default is right. **I generate one share link, expiry 30 days, send to Marcus K.** That's the right gesture.

The friction is correct. It's NOT asking permission — it's giving me a deliberate authoring move. There's a difference.

---

## /crew: the day I'm curious

Wednesday Week 2, 4:30pm. I'm waiting for a build. I click /crew out of curiosity.

Table grammar. 18 rows. Monogram column on the left. Columns: Agent / State / This week / Last action / Success rate. 6 unlocked rows (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter). 12 rows below in a "Coming soon" treatment, lighter ink, no actions.

I sort by "this week action count." Schema Doctor has 14 actions. Citation Fixer has 8. Reporter has 1. I click Schema Doctor's row — it expands. First-person blurb: *"I read your site's structured data and fix what AI engines need to find you. I never publish a schema change without your approval."* That blurb is what I want to paste into Slack when Liam asks "what does the Schema Doctor agent actually do."

This reads like an ops console. Not a Pokédex. The locked row treatment is right — I see "Brand Voice Guard — coming soon Q3 2026" and feel the upgrade ladder without feeling sold to. Yossi is right that the table grammar scales — for me with one domain it's already useful; for him with 12 clients it's the only way it works.

**The yearbook impulse stays where it belongs:** on /crew/[agent-id] detail pages. Roster is operational. Detail page is character. Two surfaces, two jobs. The board converged correctly here.

One thing I want and don't see: a "tell me what this agent actually changed on my site this week, with diffs" view per agent. Right now the row-expand shows the blurb + last 10 actions. I want the diffs accessible from there. **MVP-1.5 ask, not blocker.**

---

## My verdicts on every board decision

**1. Permalink default = private.** ✅ AGREE. I would have canceled if my April attribution numbers were indexable. The "Generate share link" button is the correct authoring move. Don't ever change this.

**2. /crew = table grammar.** ✅ AGREE. I scan tables. Cards are for one-time visits. Yearbook DNA preserved through monogram column + first-person row-expand is exactly right. Don't reopen this.

**3. White-label sig = both, tier-gated.** 🟡 NEED MORE INFO — but lean AGREE. I'm not Yossi. I don't care for my own use. As an operator I read it as: "Build keeps the Beamix mark, Scale unlocks white-label." Standard SaaS pattern. The optional "Powered by Beamix" footer link on Scale white-label is correct. The per-client (not per-account) config Yossi demanded is the load-bearing detail — make sure that's actually in the implementation, not just the spec.

**4. Voice canon = Model B.** ✅ AGREE. Agents named on /home + /crew. "Beamix" on emails/PDFs/permalinks. I want to see how the sausage is made when I'm INSIDE the product. I would NEVER forward a PDF to Aria signed *"— Schema Doctor."* That's a Saturday-morning cartoon. The current model is correct.

**5. Workspace on all tiers.** ✅ AGREE. Agree hard. Watching agents work is the magic-moment retention move. Gating it would kill the "feels alive" thesis. Even on Discover $79, give them /workspace read-only.

**6. Marketplace install gated to Build+.** ✅ AGREE. Discover gets browse-only as upgrade trigger. Build gets install. Scale gets publish. Clean ladder. I won't install workflows month 1, but at month 3 if a fellow B2B SaaS founder publishes a "weekly competitor digest" workflow I'll one-click install it. That's worth the gating.

**7. Workflow Builder gated to Scale-only.** ✅ AGREE. 80% of Build customers will never use it. Gating it preserves the $189→$499 upsell story. The 20% of Build customers who want it ARE the customers who should upgrade. The upsell modal needs to be beautiful, not annoying — show 3 example workflows, not a paywall.

**8. T&S: Workflow Builder ships at MVP for private use; PUBLISHING defers to MVP-1.5.** 🟡 NEED MORE INFO. I'd ship private-use at MVP, agreed. Publishing creates a moderation surface I don't have time to think about as a customer, but I'd want to know — at MVP-1.5, can I publish a workflow with my agency-grade Truth File and not leak it? T&S's "each agent runs against the INSTALLER'S Truth File, not Yossi's" answer is the right architecture. As long as that's enforced cryptographically (signed-token binding), I'm fine deferring publish.

**9. L2 site integration: manual paste + Git-mode at MVP.** ✅ AGREE. Liam is going to copy-paste the schema diff into a PR. That's our normal workflow. I'd go further: ship a GitHub App at MVP-1.5 that opens PRs directly from /inbox approve actions. That's a 30-minute workflow saved per change. Liam would love it.

**10. Day 1-6 silence cadence: 4 emails.** 🟡 AGREE WITH MOD. Yes, but the Day 4 (Saturday) email needs a weekday rule. Saturday morning emails from a productivity tool feel like spam. Push to Day 5 weekday. Otherwise I'd unsub from one and lose trust in all four.

**11. AI Engineer's Full-auto question: uncertain → always /inbox.** ✅ AGREE. Strongly. The whole reason I bought Beamix is the Trust Architecture. If an agent's confidence is below threshold, route it to /inbox with the failure reason in plain English. Auto-publishing uncertain output costs more in trust than 100 confident actions earn back. Ship this conservatively. I'd rather have 3 extra items in /inbox than one wrong claim on my site.

**12. Truth File schema: shared base + vertical-extensions.** ✅ AGREE. CRITICAL. Right now the spec drift is real — Step 4 onboarding asks me hours and service area for a SaaS company. That's the plumber DNA leaking. Shared base (business name, voice words, prohibited claims) + SaaS extension (integrations, pricing model, target company size) + e-commerce extension (shipping regions, return policy, product categories) is the only way this scales to multiple verticals. Fix this in the build, not the spec.

**13. T&S Truth File enforcement: cryptographic signed-token binding `validate()` to `propose()`.** ✅ AGREE — and this matters to me more than the board thinks. I'm a CEO with a CTO co-founder. Aria will read the security architecture before we hit month 3. If T&S says "the SDK refuses to publish without conformance" without a cryptographic primitive, Aria will laugh at it. Signed token, 60s TTL, bound to draft hash, hash mismatch fails — that's the only answer that survives a CTO security review. Ship this. The day Aria reads the security doc and nods, my renewal is locked.

**14. T&S GDPR/DSAR posture: US-East default, SCCs for non-US, Article 15/17/20/33 endpoints.** ✅ AGREE — and this matters specifically because I have B2B EU customers. When my German enterprise customer asks "is your AI search vendor GDPR-compliant," I need to forward a one-page Beamix posture doc. Article 15 (access), 17 (deletion), 20 (portability), 33 (breach notification) endpoints are the load-bearing four. SCCs for the EU sub-processor relationship. Ship the posture doc as a public PDF on beamix.tech/legal so I can forward without asking for it. **This is a B2B-specific requirement the board might underweight; for a SaaS like mine, it's a deal-breaker if absent.**

---

## Three things the board missed about my reality as a B2B SaaS founder

1. **The plumber DNA is still leaking.** Step 2 Lead Attribution leads with phone numbers. /home empty state asks me to "connect a number." Truth File asks for hours and service area. Every one of these is a 1-second moment where I think "this product was built for a different customer." I'll forgive 2-3 of those moments because the core thesis is right. I won't forgive 10. **Vertical-aware UI from Step 1 onward is the build-quality bar.** Not a polish item. A retention item.

2. **My renewal email is the Day 14 attribution event, not the Day 30 Monthly Update.** The Monthly Update is the *artifact* I forward. The Day 14 event-triggered email — "a developer found you on Claude" — is the moment I emotionally renew. The board specced the Monthly Update beautifully. The board is under-investing in event-triggered moments between digests. Each attributed-click email is a micro-renewal. Build a small library: first attributed click, first signup attributed, first competitor displaced, score crosses a threshold. 4-6 events that fire when something concrete happens. They are cheaper to build than a Monthly Update and they hit harder per-dollar.

3. **The CTO is a hidden buyer.** Aria doesn't pay the bill. But if Aria reads the security architecture and laughs at it, my renewal dies regardless of how many calls Beamix attributes. The board's T&S posture (signed-token binding, capability-based runtime, network egress block, GDPR posture doc) is the technical-credibility moat. Ship it visibly — a `/security` page on beamix.tech that any CTO can read in 6 minutes. This is the equivalent of Stripe's `stripe.com/docs/security`. Without it, I can't bring Aria along, and without Aria I can't justify upgrading to Scale at month 9.

---

## What would make me cancel

Three things, in order: (1) **One bad agent action on a live page.** A wrong claim, a hallucinated integration, a fact contradicting our Truth File. Not "we'll fix it in the next release" — instant cancel. Trust Architecture is the entire reason I'm here. (2) **Six weeks with no attributed traffic AND a flat score.** I bought a renewal mechanic. If the mechanic doesn't fire, I'm churning. (3) **A public Monthly Update permalink leaking my attribution numbers because someone shipped a public-default toggle "to drive virality."** That's a fire-the-vendor moment.

## What would make me write a Twitter thread evangelizing Beamix

The Day 14 attribution email — "a developer asked Claude about API observability, found you, signed up" — combined with seeing the Monthly Update PDF on cream paper and realizing my CTO is reading it without complaining about the design. That's the moment I write a thread. Not "Beamix is great." A thread titled *"How my AI-search funnel went from invisible to 9 attributed sessions in 30 days."* With screenshots of the cream-paper PDF. That thread does more for Beamix than any ad ever will. Build for that thread.
