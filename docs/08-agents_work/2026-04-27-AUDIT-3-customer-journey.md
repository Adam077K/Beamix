# Audit 3 — Customer Journey

**Date:** 2026-04-27
**Auditor:** Customer Journey Auditor (senior product / UX strategist)
**Scope:** End-to-end Sarah (Marcus) and Yossi (Dani / agency operator) journeys against Frame 5 v2 specs (PRD, Onboarding, Home, Crew, Editorial, Inbox, Marketplace, Scans/Competitors, Design System).
**Verdict:** Specs are unusually strong at moments (the Brief signing, the Monthly Update, the /home five-second test). The journey breaks at the seams — between specs, in the silent days, in the questions no one wrote an answer for, and in the gap between "tech-native founder" and "actual human who has a dev team and a vacation calendar."

---

## 1. Sarah's end-to-end journey (B2B SaaS founder, "Marcus" archetype)

### Day -7 — first encounter

Sarah is on Twitter Tuesday morning. A founder she follows quote-tweets a Beamix `/scan` permalink: *"36/100. Three of my competitors cited; we're cited in two engines. Ouch."* The image preview is the cream-paper Frame 9 with a Fraunces diagnosis line and a Rough.js seal. The visual is unlike any SaaS share she's seen — it looks like a piece of stationery. She clicks.

**What's specified:** EDITORIAL spec §1 confirms `/scan` permalinks are designed to be shared on Twitter/LinkedIn and to do "introduction work" for non-customers.
**What feels right:** The permalink is private-by-default per PRD F1, but the share generates an OG card. Good.
**What breaks:** The PRD assumes word-of-mouth is the channel (PRD §1 "founder Twitter/X, Product Hunt, Hacker News"). But there is no defined social-share component on `/scan` itself — `Story 1.1` only confirms a public permalink, not the act of social sharing as a designed gesture. The first-time visitor who arrives via a quote-tweet sees a permalink that looks like the *result of someone else's scan* — there is no "scan yours" CTA framing for the borrowed-context visitor. **The viral loop is implied, not designed.**

### Day 0, 9:14am — Sarah scans her own domain

She types `acme-saas.com` into `/scan`, hits the button, and sees a 15-17 second animated reveal. Her score: 41/100. Three competitors above her. Three named gaps. The cream paper, the Fraunces diagnosis, the Rough.js seal — she's never seen a SaaS tool that respects typography this much.

**What's specified well:** EDITORIAL §1 nails the storyboard. The score, the diagnosis, the named competitors, the CTA "Fix this — start free."
**What breaks (subtle):** The PRD F1 says the score must be "specific, not low." But Sarah's score is 41 — perfectly specific, and uncomfortably low. The spec doesn't differentiate "starting from zero is normal" copy (Story 1.1 edge case) from "you're below average" copy. A 41 needs different framing than a 0. **The score-band copy ladder is unspecified.** Anti-anxiety pattern is in /home spec but not /scan spec — risk of inconsistent voice between the public scan and the post-signup product (a customer who saw "your competitors are eating you" on /scan should not see "everything's fine" on /home day 1).

### Day 0, 9:18am — Sarah signs up via Paddle

She clicks "Fix this — start free" → Paddle checkout. She picks Build $189. Paddle returns her to the product. Onboarding starts.

**What breaks:** PRD §1 (Marcus) explicitly says "single 'Get started — $79/mo or $189/mo' choice" at end of free scan. That is **not specified** as a /scan post-result tier-picker UI anywhere in the EDITORIAL or onboarding specs. Frame 10 of the storyboard ends at the CTA. Did Sarah pick her tier on /scan? On a pricing page? Inside Paddle? **The free-scan-to-tier-pick handoff has no design.** This is the highest-conversion micro-moment in the funnel and it is undesigned.

Also: Sarah's domain was `acme-saas.com` on /scan. After Paddle, she returns with `?scan_id=<uuid>`. The onboarding spec (§4.1) handles this well. Good.

### Day 0, 9:21am — Onboarding Step 1

Step 1 takes 18 seconds. Pre-filled, she edits nothing.

### Day 0, 9:21:18am — Step 2 (Lead Attribution)

She sees three Tel Aviv phone numbers. She does not have a Tel Aviv office — Acme is remote, with no main phone line at all. Her customers reach her on Intercom. She thinks: "what is this for me?" She clicks **Skip for now**.

**What breaks (the SaaS founder problem):** The lead-attribution model is built around the e-commerce/local-services archetype where customers call. **B2B SaaS customers do not call.** Marcus's renewal anchor is "developers asked Claude → clicked an attribution link → signed up." That is *all UTM*, no Twilio. The PRD F12 acceptance criteria say "Twilio number provisioned within 2 minutes" — fine — but the onboarding Step 2 leads with phone numbers, not UTM. For Sarah, Step 2 starts with a feature she does not use. The friction is real: she's not "skipping for later," she's mentally classifying Beamix as "not built for me." **The Lead Attribution panel needs vertical-aware framing — UTM-first for SaaS, Twilio-first for e-commerce/local.** The PRD names this as the renewal mechanic and the onboarding spec hands it as a phone hardware ceremony. Misaligned.

### Day 0, 9:22am — Step 3 (Brief)

Cream paper. Fraunces. The Brief reads: *"Beamix recommends focusing on developer-tooling and API-discovery queries on ChatGPT and Claude, where developers ask 'what's the best library for X' more than 'what's the cheapest tool.' Your homepage is missing SoftwareApplication schema; we'll add it. Three competitors — Acme, Vercel-rival, and DevToolsCo — are cited more often than you on these queries; we'll respond with question-anchored content under your brand. Don't change your brand voice without asking."*

She edits one chip (corrects a competitor name). She clicks **Approve and start.** Seal draws. 2.5 seconds. She feels something. She is no longer evaluating a tool; she's signed something.

**What breaks:** §5.6 of the onboarding spec explicitly says "There is no Reject button. Authoring a Brief is the constitutional act of becoming a Beamix customer." That's a strong stance. But what if Sarah fundamentally disagrees? What if the Brief proposes "emergency-plumbing queries" because the Industry Knowledge Graph misclassified her as a local home-services business (Risk 3 in the PRD: 20% misclassification rate)? The spec says she can edit chips down to 2 sentences and rewrite. **But there is no "this is wrong about my business — let me reclassify" affordance.** The vertical KG misclassification is a known 20% problem, and Step 3 has no escape hatch back to Step 1's industry combobox. The customer is forced to surgically rewrite a Brief whose entire frame is wrong for them.

### Day 0, 9:24am — Step 4 (Truth File)

She fills hours (24/7 — it's a SaaS, no hours), services (5 product names from her docs), service area (global), three claims, voice words, never-say. 90 seconds.

**What breaks (small):** The hours field is mandatory ("Beamix will quote these in answers about availability"). For SaaS, hours are meaningless — the product is always available. The vertical-specific Truth File schema in PRD F3 says "SaaS Truth File asks about integrations, pricing model, target company size — not 'service area'." The onboarding spec §2.4 specifies the same six fields *for all verticals*. **Spec contradiction:** PRD says vertical-specific Truth File. Onboarding spec says one schema. Sarah hits this contradiction at 9:24am.

### Day 0, 9:25am — Magic moment on /home

She lands. Score counts up to 41. Ring draws. Fraunces line writes itself. Crew at Work strip lights up with 8 monogram circles. Evidence Card #1: "Schema Doctor is fixing 3 errors on /pricing." The rotating Fraunces line cycles every 6 seconds.

**What's specified well:** Onboarding §3 is the strongest moment in the entire specs package. The 7-second hand-off from Step 4 to /home is *cinema*.
**What breaks (subtle and dangerous):** §3 of onboarding spec depends on "the post-onboarding work cycle (which takes ~3-8 minutes in the background)" producing real Evidence Cards. **What happens if it takes 12 minutes?** The rotation is "hypnotic for ~30 seconds" but Sarah closes her tab at 9:27am to take a meeting. She returns at 11:00am. The Fraunces line still says *"Schema Doctor is fixing 3 errors on /pricing"* — except now Schema Doctor finished, but the post-onboarding work cycle that would settle the line into "Your crew shipped 6 changes this hour" hasn't been triggered because no-one was watching. **Or:** the cycle did complete, the line settled, but the rotating list of 7 lines is gone — and Sarah's first impression of /home is the static settled state, not the "watching crew assemble" cinema. The transition state is undesigned for the case where the customer leaves mid-rotation. **The magic moment is fragile to attention.**

### Day 1 — Tuesday

Sarah doesn't open Beamix. No email goes out (Monday Digest sends Mondays). Beamix is silent.

**What breaks:** **Day 1 through Day 6 is the dead zone.** No spec addresses the Tuesday-through-Sunday silence after onboarding. The onboarding magic moment promises *"Monday digest comes Monday at 7am"* — but Sarah signed up on a Tuesday. Her first Monday Digest is 6 days away. In the meantime, /home is frozen at her Monday-equivalent state. There is no Tuesday email saying "yesterday Beamix shipped 3 schema fixes — anything to know?" The product is presence-less for 6 days at the riskiest moment of the relationship. **Risk:** signups on Mon/Tue have a 6-day silence; signups on Sun/Mon have 1-day silence. Cohort difference is huge and not addressed.

### Day 3 — Thursday — first /inbox approval

Citation Fixer drafted 11 FAQ entries. /inbox icon shows a notification dot. Sarah sees the dot Wednesday evening on a context-switch, doesn't click, comes back Thursday. She approves 8, requests changes on 3.

**What's specified well:** /inbox spec is solid; the 3-pane Linear pattern, J/K nav, Approve/Reject/Request Changes all present.
**What breaks:** PRD §F4 says review-debt counter goes amber at 5 items, red at 10 (Q5 in open questions — "Recommend; confirm before design implementation"). It is *not confirmed*. /home spec §2.2.4 references "Working on three things" status sentence but does not specify the review-debt visual treatment threshold. **The threshold is unset.** Sarah has 3 pending items — is that calm or anxious? The product doesn't know.

### Day 7 — Monday morning — first Monday Digest

Sent Monday 8am customer-local. Plain-text-feeling email with a cream-paper header. 5 bullets. Score 47 (+6). Top fix: Schema Doctor added 3 schema blocks. Top competitor move: DevToolsCo gained 2 citations on "API monitoring" queries. Coming up: weekly scan tonight. Credit balance.

**What's specified well:** EDITORIAL §2 is the single best email spec I have ever read in a SaaS context. The plain-text-equivalent body, the Fraunces signature, the Rough.js sigil — pristine.
**What breaks:** The Day 0 anti-anxiety pattern from /home spec §4.5 ("Score dipped 4 points") is **not echoed in the Monday Digest spec**. EDITORIAL §2 covers a "Quiet week" digest but not a "Score dropped" digest. If Sarah's Monday Digest reads "Score: 38 (-3)" with no anti-anxiety frame, the digest creates the anxiety the /home page was designed to prevent. **The anti-anxiety pattern is /home-only; it must be replicated in email.**

Also: PRD F14 says "Lead Attribution headline (Build/Scale tier only)" appears in digest week 2 onward (per Story 3.2). For Sarah, who skipped Step 2's phone setup, **there will never be a Lead Attribution headline in her digest.** She is now a customer who paid for Build but receives a digest that's missing the renewal-anchor sentence. The digest has no fallback "set up tracking to see this" inline nudge — that's only on /home. The Monday Digest is the renewal mechanism, and for Sarah-who-skipped, it's silently amputated.

### Day 14 — first lead-attribution call

She set up UTM tags after week 1 (sent her dev a link to /settings → Lead Attribution). One developer clicked through her UTM-tagged URL after asking ChatGPT for "best API observability tool." She gets an event-triggered email: *"Your Beamix UTM URL got its first click."*

**What breaks:** PRD F12 says "Twilio number got its first call" — the email is for the phone path. **There is no parallel email spec for the UTM-first-click event.** SaaS founders are entirely UTM. The whole event-email system is phrased around phone calls. Marcus's renewal anchor (Twilio first-call email) does not exist for him.

Also: "Sarah needs to paste tracked phone numbers + UTM tags onto her landing pages. Most SaaS founders won't do this themselves; their dev does it." The spec assumes the customer does this. Onboarding Step 2 issues the numbers but does **not** generate a copy-paste snippet ready for a dev. There is no "send to your developer" handoff: no shareable instructions URL, no email-to-dev button, no Slack share. **The integration is dev work, but Beamix only speaks to founders.**

### Day 30 — first Monthly Update

First Monday of the month. Cream PDF lands. Headline: *"In April, 14 developers found Acme through AI search — up from 0 in March."* Sarah forwards to her co-founder. Renews implicitly.

**What's specified well:** EDITORIAL §3 is gift-quality. The Monthly Update PDF is the best SaaS retention artifact I've ever seen specced.
**What breaks (genuinely):** The Monthly Update default is **public permalink** ("Monthly Updates are designed to be forwarded… Sarah can flip a per-report privacy switch in /reports settings if she wants this one private"). For a B2B SaaS founder, a public URL with attribution numbers, top fixes, competitor moves — **that is competitive intelligence she does not want public.** PRD §1 ("Private by default — no competitor can see their scan results without explicit share") and EDITORIAL §3.3 (public default for Monthly Update) **directly contradict.** This is the highest-stakes contradiction in the specs.

### Day 75 — renewal anchor

Sarah's annual signup means renewal is in 11 months, not 75 days. But for her *month-to-month* mental renewal, week 11 is when she'd cancel if she's going to. The Monthly Update headline is the anchor. If month 3's headline is strong, she stays.

**What breaks:** **No spec addresses the month 3 dip.** Onboarding velocity peaks weeks 1-2; novelty fades weeks 3-6; the "is this still worth $189?" question crystallizes weeks 8-11. The PRD success metrics include "Monthly Update forward rate ≥15%" but no spec describes a re-engagement nudge between Monthly Updates. There are 3 Monday Digests + 1 Monthly Update per month — for Sarah, that's 4 emails/month. Spec is silent on what happens if she stops opening them.

### Day 90 — quiet renewal

She doesn't think about renewing. The Build subscription auto-charges. She gets a Paddle receipt.

**What breaks:** No spec addresses the **renewal touchpoint email** ("you've been with us 3 months — here's what changed in your AI visibility"). The Monthly Update is *one of* the renewal anchors but is not specifically a renewal milestone. PRD F13 mentions a "gracious cancel flow" but no "celebrate the milestone" email. Cancellation is anti-friction; renewal is friction-less to the point of invisibility. **The product never says thank you.**

### Day 180 — 6 months in

Score is now 73. Lead attribution shows 47 sessions/month. Sarah forwards every Monthly Update to her board. Beamix is part of her stack.

**What breaks:** **Year-1 milestones are unspecced.** No "first 6 months" report. No anniversary email. The customer's relationship deepens but the product has no way to acknowledge it. PRD §1 (Sarah's renewal anchor) imagines forwarding to a co-founder once. It does not imagine the 6th forward.

### Day 365 — 1 year

Anniversary. PRD lists "Year-in-Review printed and mailed free" for Scale customers (EDITORIAL §3.3) but **not for Build customers like Sarah.** The Build customer gets nothing on day 365. **The single highest-trust moment of the relationship — "we made it a year" — has no artifact.**

---

## 2. Yossi's end-to-end journey (e-commerce / agency operator)

Yossi is the boutique-agency archetype: 5-15 client accounts on Beamix Scale ($499). He onboards each client domain, manages all of them from one dashboard, sends client-branded Monthly Updates each month.

### Day -7 to Day 0

Yossi heard about Beamix on a podcast. He runs a free /scan on his **own** agency site to evaluate. Score 22. He's not actually trying to fix his agency's score — he's running the scan to see whether the product is real. He shares the permalink in his agency Slack. Two of his clients see it. One asks: "can you do this for us?" That's Yossi's wedge.

**What breaks:** No spec addresses the **agency evaluation flow**. Yossi is not a customer testing the product on his own business; he is a buyer evaluating whether to buy Scale and use it on clients. The signup-as-evaluator vs. signup-as-customer distinction is undesigned. He needs to scan his clients' domains *before* signing up to know if Beamix is worth $499. /scan public lets him do that 1 domain at a time, anonymously. **There is no agency evaluator path** ("scan 5 client domains in batch, see what we'd find").

### Day 0 — Yossi signs up to Scale, onboards his FIRST client

Onboarding §4.4 confirms: "A Yossi-tier customer onboards their **first** domain in this flow. Multi-domain switcher and additional-domain onboarding are post-MVP." First domain is the standard Scale flow. Subsequent domains: abbreviated 2-step (Step 1 + Step 4 only).

**What breaks (massively):** Yossi has 12 clients. He onboards client 1 with the full 4-minute ceremony. Then he goes to add client 2. The abbreviated 2-step flow skips Step 2 (Lead Attribution) and Step 3 (Brief signing). **But the Brief is the constitutional act per onboarding §5.6 — and Yossi is now adding 11 more clients without any constitutional act per client.** The Brief is per-domain (per onboarding §4.4) but **the spec says it doesn't fire on subsequent domains.** Either the Brief is constitutional (then it must run for every client) or it isn't (then onboarding §3 is overstated). This is a load-bearing contradiction.

Also: For each new client Yossi adds, the **Truth File is required and mandatory.** That's 12 Truth Files × 6 fields × 90 seconds = ~108 minutes of typing. Onboarding §2.4 explicitly forbids skipping Truth File. **Yossi will hate this and find a workaround. The spec gives him none.**

### Day 0+ — multi-client switching

Yossi opens /home. He sees one client's data. He needs to switch. CREW spec §7.1 confirms a multi-client switcher in the topbar (Cmd+K Linear-grade). Good.

**What breaks:** /home spec §2 makes **no mention** of a client switcher anywhere. /inbox spec doesn't mention it. /scans spec doesn't mention it. Only /crew spec specs it. **It is /crew-only or it is global** — the specs disagree. PRD Story 4.1 says "domain switcher at the top of the sidebar" — sidebar is also not specified anywhere else. Three different surfaces, three different switcher locations, no single source of truth.

### White-label digest authoring per client

EDITORIAL §2 + §3.3 confirm white-label is Scale only. Yossi configures a "custom Brief tone" in /settings; the Monthly Update voice is rendered in his voice with his agency wordmark.

**What breaks:** **The white-label authoring surface is undesigned.** "Yossi configures a custom Brief tone in /settings" — but there is no /settings tab spec for "white-label per client." Where does Yossi upload his agency logo? Where does he upload his client's logo (for per-client white-label)? Where does he write the white-label Brief tone *per client* (since each client has different voice)? CREW §7.2 says he can "Apply a per-client white-label logo + color (from his client's brand kit)" — but the brand-kit upload UI is not specified. The flow exists in name only.

Also: PRD F14 says "All emails signed 'Beamix' — no agent names, no 'your AI team'." White-label digest must override this — emails go out signed as Yossi's agency. **Spec contradiction:** PRD says always-Beamix signature; EDITORIAL §2 white-label section says agency wordmark replaces. Which wins?

### /crew Workflow Builder customization per client

Yossi on Scale gets the Workflow Builder. He builds a workflow: "When competitor X publishes a new product page, run Citation Fixer on my client's matching page, route the diff to me on Slack."

**What breaks:** PRD §5 says Workflow Builder ships **Year 1**, post-MVP. CREW §4 specs Workflow Builder fully. MARKETPLACE §4.1 says Workflow Builder ships at MVP-1.5. **Three specs, three different ship dates.** The CREW spec is the most ambitious — full DAG editor, 6-9 month engineering investment per MARKETPLACE §4.1. **At launch, Yossi has no Workflow Builder.** The Yossi journey breaks at "manual click-through across 12 clients five times a day."

Also: The Workflow Builder upgrade prompt for Build users (who hit the gate) is unspecified. The /crew spec gates it at Scale; what does a Build-tier user see when they click "+ Workflow"? Disabled button? Modal? Upgrade flow? **Undesigned.**

### "Compose this month's Monthly Update for client X"

Yossi at month-end has 12 Monthly Updates to send. He wants to bulk-trigger composition, review/edit each draft, and send.

**What breaks:** EDITORIAL §3 specs the Monthly Update as an automatic 1st-Monday send via Inngest job. **No spec addresses the agency operator's bulk-review flow.** Does Yossi see all 12 drafts in /inbox? Does he see them in /reports (a route mentioned in EDITORIAL but never specced)? Does he edit the white-label voice on each one before send? **The Yossi white-label review-and-send flow is the single most important Scale-tier workflow and it has no UI design.**

### Where Yossi's journey diverges from Sarah's specs

| Moment | Sarah's spec covers | Yossi's spec gaps |
|--------|---------------------|---|
| Onboarding Brief | Constitutional, with seal | Subsequent clients have no Brief at all |
| Truth File | Once per account | 12× per Yossi, no batch import |
| Lead Attribution | Per account | Per client, no client→Twilio mapping |
| /home | Per account | Switching context, where? |
| Monthly Update | Forward to co-founder | White-label compose+review for 12 clients |
| Workflow Builder | N/A | Promised but ship date contradicts |
| Multi-client switcher | N/A | Specced only on /crew |
| Renewal anchor | One forward/month | 12 forwards/month, multiplied retention impact undesigned |

---

## 3. Where the journey BREAKS

### 3.1 The onboarding magic moment depends on real-time work

Onboarding §3 says the post-onboarding work cycle takes 3-8 minutes. /home renders Evidence Card #1 ("Schema Doctor is fixing 3 errors on /pricing — started 8 sec ago") at 5000ms after landing. **What if the deeper scan didn't find 3 errors?** §5.4 specs the fall-through: proactive finding instead. Good. **What if the deeper scan hasn't completed by the time the customer lands on /home?** §5.5 covers this for Step 3 (Brief composition fallback). **It does not cover the equivalent for /home Evidence Card #1.** The customer lands on /home, sees a skeleton or a placeholder, and the magic dies. The fragile dependency: /home depends on Inngest job completing within ~7 seconds of route navigation. That's not how Inngest works at p99. **The magic moment is engineered against the median; the long tail is undesigned.**

### 3.2 No Reject button on the Brief — the trap door

§5.6 of onboarding spec is explicit: there is no Reject button. Customers must edit until they agree. **What if the Industry Knowledge Graph misclassified Sarah's SaaS as plumbing (Risk 3 in PRD: 20% misclassification rate)?** She gets a Brief about "emergency-plumbing queries on ChatGPT and Perplexity" and her actual business is dev tools. She cannot reject. She cannot reclassify (the industry combobox is on Step 1; Step 3 has no link back). She must surgically rewrite every chip in every sentence to convert "emergency-plumbing" → "API monitoring" — but the chips are typed (`vertical_focus`, `query_pattern`) and the chip dropdowns are *populated from the wrong vertical KG*. **She is stuck inside the wrong vertical's chip universe with no escape.** Either there must be a "this is fundamentally wrong about my business" affordance on Step 3, or Step 1's industry combobox must be re-openable from Step 3. The Brief without an escape hatch is a trust killer for the 20% misclassified.

### 3.3 Lead Attribution friction is dev work, not founder work

PRD F12 acceptance says "Twilio number provisioned within 2 minutes." Beamix issues the number. Beamix shows Sarah the number. **Beamix does not put the number on her website.** That's her dev. Same for UTM tags — Beamix generates them; her dev places them.

**The friction handoff is undesigned:**
- No "send setup instructions to your developer" email
- No copy-paste snippet ready for paste into a CMS
- No verification flow ("we detected your Twilio number on /pricing — good")
- No "your dev hasn't placed the number yet" reminder

The Lead Attribution Loop is the renewal mechanism (PRD F12). **It is gated on a dev task no one mentioned to the dev.** Sarah's Twilio number sits unused for weeks; her Monday Digest never gets the headline; renewal anchor never lands.

### 3.4 Day 0 → Day 7 silence

The customer signs up Tuesday morning. Magic moment fires. Then the product is silent for 5 days until Monday Digest. The /inbox notification dot fires Day 3 (per Onboarding §3 — first /inbox item arrives ~90s after landing). But after Day 3, what? The product becomes a place she has to remember to check. There is no Wednesday-Sunday email cadence — the Monday Digest is weekly. /home doesn't change much. **The product disappears for the customer's most uncertain week.** No spec addresses this gap.

### 3.5 Anti-anxiety pattern is /home-only

/home spec §4.5 specifies a calm score-drop frame: *"Score dipped 4 points."* Monday Digest spec EDITORIAL §2 has examples for "quiet week" and gain weeks but no spec for score-drop weeks. Monthly Update spec EDITORIAL §3 emphasizes upward narrative ("47 calls + 12 form submissions, up 4×") with no specced frame for a down month. **If Sarah's score drops, the Monday Digest and the Monthly Update can read alarmist while /home reads calm.** Customer receives three different emotional frames for the same data depending on which surface she's on. Voice consistency breaks.

### 3.6 Marketplace first-party vs third-party clarity

PRD F17 says MVP marketplace = "Beamix-authored additional agent workflows (not third-party at launch)." MARKETPLACE §1.4 confirms: "10-12 listings total at launch" — all first-party. **What does the customer see?** Per CREW §5, marketplace agents get a `Third-party` badge after install. **At MVP, there are no third-party agents** — so the badge never shows. Good.

But: the customer cannot tell that the marketplace catalog is *all* first-party. The "Powered by Beamix" framing is missing. Sarah might think she's choosing among "real" third-party agents (like a Zapier app store) when in fact she's choosing among Beamix-authored variants. **If she trusts third-party more than first-party (Zapier psychology), she is misled.** If she trusts first-party more (Apple App Store psychology), she undervalues the catalog. Either way, the messaging is undesigned. The customer does not have the model "these are all Beamix's own work."

### 3.7 Workflow Builder gate for Build users

PRD §5 says Workflow Builder is Year 1. CREW spec ships it at MVP and gates at Scale. MARKETPLACE §4.1 ships it at MVP-1.5. **Build user clicks `+ Workflow` button. What happens?**
- Spec A: button is disabled (no spec for the disabled-state copy)
- Spec B: button shows upgrade prompt (no spec for the prompt's design)
- Spec C: button doesn't exist (CREW §3.1 says it exists, in roster header)

This is the highest-friction tier-up moment in the product, and it is **three different specs deep undefined.** The Build → Scale upgrade flow is the company's path from $189 to $499 ARR/customer. There is no "compelling moment" UI for it.

---

## 4. Where the language drifts

The product voice should be unified. Audit reveals **5 distinct voice registers** competing across surfaces.

### 4.1 Who did the work?

- /home Evidence Strip: *"Schema Doctor: Added FAQ schema to /services/emergency-plumbing"* (agent-named)
- Monday Digest: *"Beamix added FAQ schema to your services pages"* (Beamix-named, agent erased)
- Onboarding magic-moment rotation: *"Schema Doctor is fixing 3 errors on /pricing"* (agent-named again)
- Monthly Update: *"In April, Beamix added 11 FAQ blocks across your service pages"* (Beamix-named)
- /crew agent profile: *"Schema Doctor's last 10 actions"* (agent-named, agent-as-character)

**Two voices fighting:** the *crew-as-individuals* voice (Schema Doctor did, FAQ Agent did) vs. *Beamix-as-monolith* voice (Beamix did). PRD F14 says "All emails signed 'Beamix' — no agent names." But /home and /crew center agent names. A customer who reads /home Tuesday and Monday Digest the next Monday sees two different actors take credit for the same work.

**Recommendation:** Pick a model. Either agents are named in surfaces (and the email signature is "— your crew") or agents are nameless mechanism (and only the /crew page is the personnel directory). Mixing is dissonance.

### 4.2 "Crew" vs "Beamix" vs "your AI team"

- Onboarding signature: *"— your crew"* (Fraunces italic)
- /home rotating line: *"Your crew shipped 6 changes this hour"* (crew)
- Monthly Update: signed *"— Beamix"* (Beamix)
- PRD F14: "no 'your AI team'"
- /crew spec: "the labor pool" "the personnel file" "running a team"

Three different words for the same group. **"Crew" is the strongest word** — it appears in the most editorially designed surfaces (Onboarding seal, /home rotation, /crew page name). But the Monthly Update — the most forwarded artifact — signs as "Beamix." **The artifact most likely to introduce non-customers to the brand uses the weakest of the three names.**

### 4.3 "Inbox" vs "Inbox pointer line" vs "needs you"

- /home shows "One thing needs you." (the canonical Decision Card phrase)
- /inbox Section 2.6 calls it "review-debt counter"
- PRD F4 calls it "review-debt counter"
- Onboarding §3 calls it "inbox notification dot"

Customer-facing voice should be *needs you* / *one thing needs you*. Internal/operator voice is *review-debt*. The internal voice is bleeding into UI specs (PRD §F4 acceptance criteria say "review-debt counter is visible at top of /inbox" — that's the user-facing label, not the internal name). **Voice contamination from spec-language to UI-language.**

---

## 5. Decisions the customer faces with no spec'd answer

For each, I checked all 9 specs.

| Question | Answer in specs? |
|----------|-----|
| **"Can I undo this Brief approval?"** | NO. Onboarding §5.6 explicitly says no. But there is no /settings → "Re-author my Brief" path either. The Brief is signed once and never re-edited. What about 6 months in when the business has pivoted? Undesigned. |
| **"How do I add a teammate to my Beamix account?"** | NO. No spec mentions multi-user accounts. Sarah's growth hire is the day-to-day user; Marcus is the buyer (per PRD §1). One account, one login? Two seats? SSO? Undesigned. |
| **"Where do I see my Twilio phone numbers?"** | YES — /settings → Lead Attribution (PRD F13). But onboarding spec also says /settings → Phone numbers tab. **Two tab names.** |
| **"Can I export my data?"** | PARTIAL. PRD F3 says Truth File is exported on cancel. /crew §6 has Export → CSV/JSON/PDF for audit log. But there is no global "export all my Beamix data" affordance. GDPR DSAR? Unspecced. |
| **"What happens if I cancel?"** | PARTIAL. PRD F13 says "gracious cancel flow, one click, here's how to export." But what happens to my Twilio number? My UTM URLs that are live on my website? My Monthly Update permalinks (which are *public by default*)? The data ghost left behind is undesigned. |
| **"Can I share my Monthly Update without the public-permalink concern?"** | YES — EDITORIAL §3.3 says per-report privacy switch in /reports settings. **But /reports is mentioned twice across all specs and never specced as a route.** Where does Sarah find the privacy switch? |
| **"Can I pause my subscription for a month?"** | NO. No spec mentions pausing. Cancel-or-stay is the only model. Seasonal businesses (Risk 3 mentions seasonal) cannot pause. |
| **"Why did the agent do this?"** | PARTIAL. /inbox shows Truth File references used. /workspace shows step-by-step. But no "explain in plain English why this action was chosen" affordance. The provenance is technical, not narrative. |
| **"Can I block an agent from touching specific pages?"** | YES — /crew custom instructions ("never modify schema on the /blog subdirectory"). But this is per-agent and free-text. There is no global "do-not-touch list" for all agents. A high-stakes legal page on Sarah's site needs a global rule. |
| **"What if a competitor I added is wrong?"** | PARTIAL. /competitors lets her add up to 5 custom competitors. No spec for *removing* a Beamix-detected competitor — the vertical-KG-pre-populated 5. If the KG misclassified one, Sarah is stuck with it. |
| **"What if my domain changes?"** | NO SPEC. Sarah migrates from acme-saas.com to acme.dev. The Brief, Truth File, scan history, attribution numbers are all bound to the original domain. Domain migration is undesigned. |
| **"What about my data privacy / where is my data stored?"** | NO SPEC. No privacy/data section in any spec. For SaaS founders selling B2B, this is a checkbox they need before payment. |

---

## 6. Top 7 customer-experience BLOCKERS

The 7 highest-priority items for the next CEO to resolve before build.

### Blocker 1 — The free-scan → tier-pick handoff is undesigned
The single highest-conversion moment in the funnel (PRD §1: "single 'Get started — $79 or $189' choice at end of free scan") has no UI spec. Frame 10 of /scan ends at a CTA; what the CTA opens is undefined. Specify: pricing micro-page, in-line tier picker on /scan permalink, or Paddle pre-filled checkout link per tier.

### Blocker 2 — Lead Attribution is e-commerce-shaped; SaaS is the primary wedge
Onboarding Step 2 leads with phone numbers; PRD §1 says Marcus's renewal anchor is UTM-based. The flow is mis-aimed for the primary persona. Specify: vertical-aware Step 2 (UTM-first for SaaS, Twilio-first for local/ecom), and a "send to your developer" handoff with copy-paste snippets and a verification check.

### Blocker 3 — The Brief has no escape hatch from a misclassified vertical
Onboarding §5.6 forbids Reject. Vertical KG misclassifies 20% (Risk 3). The intersection breaks the Brief for 1-in-5 customers. Specify: a "this is wrong about my business" affordance on Step 3 that re-opens Step 1's industry classification.

### Blocker 4 — The Day 1-6 silence is undesigned
The product's most fragile week (Mon-signup → next-Monday-Digest is 6 days) has no email cadence and no on-product reactivation. The /home rotating line settles within 8 minutes of magic moment, then the page is static. Specify: a Day 2-3 "first finding ready" event-triggered email + a Day 5 "your week so far" pre-Monday teaser.

### Blocker 5 — Spec contradictions on Monthly Update privacy, Workflow Builder ship date, and white-label signature
These three contradictions must be resolved before build, in writing:
- Monthly Update default: PRD says private-by-default; EDITORIAL says public-by-default. **Pick one, document why.**
- Workflow Builder ship date: PRD says Year 1; CREW says MVP; MARKETPLACE says MVP-1.5. **Pick one.**
- White-label digest signature: PRD says always "Beamix"; EDITORIAL §2 white-label says agency name. **Pick a precedence.**

### Blocker 6 — The Yossi multi-client experience is a stub
First-client onboarding is the standard 4-step. Subsequent clients are abbreviated 2-step (no Brief, no Lead Attribution). The multi-client switcher is /crew-only. The white-label per-client compose flow is undesigned. The bulk Monthly Update review is undesigned. **Yossi at scale is the $499 tier's existence — and the experience for him is a sketch.** Specify: per-client onboarding (full or abbreviated, with the Brief explicitly skipped or explicitly included), global topbar switcher, /reports route for white-label compose-and-send.

### Blocker 7 — Voice drift between agent-named and Beamix-named surfaces
"Schema Doctor did X" on /home; "Beamix did X" on Monday Digest; "Beamix" signature on Monthly Update; "your crew" signature on onboarding. Pick a single canonical voice model. Recommend: agents are named on /home and /crew (where the user is *inside* the system); the unified voice is "your crew" or "Beamix" everywhere it leaves the product (emails, PDFs, share permalinks). Document the model in DESIGN-SYSTEM as a hard rule.

---

## Closing

The specs are uncommonly strong on the *peak moments* — the Brief signing, the Monthly Update PDF, the /home five-second test, the /scan storyboard. They are weak on the *seams* — between specs, between days, between personas, between "here is the screen" and "here is the customer's question." The 7 blockers above are seam-work. None of them require new vision; they require the next CEO to walk a customer through the journey end-to-end with a finger and ask, at every joint, *"and then what?"*

The most consequential single insight: **the journey is built for Marcus on /scan, Sarah on /home, Yossi on /crew — and the same product has to feel coherent to all three on all three surfaces.** Right now each surface is shaped to its primary persona and the cross-persona experience falls between specs. Resolve the 7 blockers and the journey closes.

— Customer Journey Auditor
