# Board Review — Frame 4 Proposal
## Seat 1: Product Manager
Date: 2026-04-26

---

## Section 1: Critique of Frames 1, 2, and 3

---

### Frame 1 — The Managed Service

**What it gets RIGHT.**

The positioning is correct. "Lower DAU = more value delivered" is not just a quip — it is a genuine product philosophy that Beamix's customer segment validates. The SMB owner-operator paying $189/month is not buying a dashboard they want to live in; they are buying relief from a problem they do not understand. Frame 1 takes that seriously. Email-as-primary-channel is also correct in principle: for the Sarah persona, email IS the product. The Wealthfront/Mint aesthetic matches the trust register of a financial service or chief-of-staff tool — which is exactly how Beamix should be positioned against Profound and Otterly, both of which feel like analytics dashboards that demand GEO expertise to interpret.

**What it gets WRONG.**

Frame 1 has no expansion story. If the app is an "escape hatch," what does Build → Scale look like to a user? The product at $499/month cannot feel identical to the product at $79/month in the UI — even if the underlying agent power is different. Expansion revenue requires the user to *feel* the gap between tiers at the product surface. Frame 1 never addresses this. One status pill and one number cannot communicate the difference between a 3-engine scan and an 11-engine scan, or between reactive agents and the Citation Predictor. The perceived value cliff is invisible.

**Retention mechanism.** Thin. If the app is barely visited, churn risk is high the moment a user questions the bill. "Did this work?" is a hard question to answer if you never had to visit the product. The weekly email is a retention surface only if it contains proof of value — Frame 1 does not specify the email content architecture at all.

**Churn risk.** Highest of the three frames. Users who never engage with the product have no switching cost. The moment a competitor runs a trial-offer ad, a user who "barely uses" Beamix will cancel.

**Competitive moat.** Weak. Frame 1's simplicity is indistinguishable from a competitor's simplicity with better email copywriting. It is a positioning strategy, not a product strategy. Otterly could match the email cadence tomorrow.

**The tier ladder.** Frame 1 never answers it. This is disqualifying for a product with a $79/$189/$499 pricing ladder.

---

### Frame 2 — The Operating Studio

**What it gets RIGHT.**

The craft investment is real, and craft at this level creates retention through delight. Users who live inside a Linear or a Notion do not switch — not because the competitor is worse, but because their tools have *texture* that builds emotional investment. The Notebook, the Reasoning Receipt, the card flips — each is individually defensible on the "we made something worth paying for" axis. Frame 2 also correctly identifies that Yossi ($499/month) is a real persona who will use the product daily and wants a rich, professional surface to show clients. The /reports Press button and the white-label PDF are Frame 2 at its best: craft that directly maps to a business outcome (agency client retention).

**What it gets WRONG.**

Frame 2 mistakes the customer. Sarah — who is the median Beamix buyer at $189/month — does not want to read an agent's journal. She wants outcomes. The Notebook, the Reasoning Receipt typed-in animation, the chip-in-prose mechanic on four surfaces — these are features for a GEO-curious power user who does not exist at SMB scale. Frame 2 builds for a user who *wants* to understand GEO, but Beamix's thesis is that the user *doesn't want to* and is paying to avoid it. Frame 2 commits the classic product error: building for the most vocal, most engaged early adopters (who do not represent the paying median).

**Retention mechanism.** Strong — but for the wrong persona. The Notebook and Reasoning Receipts create engagement loops for Yossi. They create friction and confusion for Sarah.

**Churn risk.** Medium-high for Sarah. She opens the app, sees a complex multi-surface product she does not need to understand, and her perception is "this feels like work." That is the opposite of the brand promise.

**Expansion driver.** Strong for Discover → Scale, but only for agency users. The agency workflow (white-label, Reports, multi-client switcher, Sentence Builder) is genuinely premium. The problem is it prices out the mid-tier.

**Competitive moat.** The moat is the craft, not the capability. That is a fragile moat — Google can match craft. Beamix's moat should be in the automation capability, which Frame 2 partially buries under design surface.

---

### Frame 3 — Calm by Default, Depth on Demand

**What it gets RIGHT.**

The diagnosis is correct. The philosophy is correct. "One Status / One Decision / One Number" is a genuinely good product principle, and the Vercel-style onboarding is the right call — credits-configuration is an anti-pattern that delays time-to-value by introducing an abstraction (credits) before the user has seen any value at all. The trust-tier router (auto-run vs pre-approve vs always-escalate) is the most important infrastructure decision in the entire spec, and Frame 3 correctly identifies it. The Monday Morning Digest as the headline mechanic is right for Sarah. The competitor research confirms Beamix has no peer in agent execution — and Frame 3 correctly focuses the surface on outcomes, not process.

**What it gets WRONG.**

Frame 3 undersells the product at $189 and $499 because it has hidden the proof of value below the fold. Here is the PM problem: at $189/month, a user who reads ONE status sentence and ONE number above the fold has NO cognitive evidence that 11 agents are working, that 6 AI engines are being monitored, that competitors are being tracked, that citations are increasing. The surface communicates "one thing is happening" when the value proposition is "many things are happening simultaneously on your behalf." The calm is correct as an emotional register. The problem is that calm at the surface without evidence of activity is indistinguishable from inactivity.

**The pricing ladder is invisible.** Frame 3's above-the-fold is identical at $79, $189, and $499. If the surface is "one status, one number," what does Build unlock that Discover doesn't? The user cannot answer that from the product surface. That matters at renewal time.

**Churn risk.** Medium. The Monday Morning Digest is the retention surface, but five sentences a week is a thin thread. If the score doesn't move, the digest reads as "nothing happened," and the user has no ambient product presence to remind them of the ongoing value.

**Expansion driver.** Weak. Frame 3 does not define what the /home looks like for a Scale user vs a Discover user. It does not surface what unlocks at Build (competitors gated?). The tier ladder needs to be visible at the product surface, not just described in a pricing page.

**The /home decision.** Frame 3 kills Adam's locked "8 sections of /home" from the PAGE-LIST-LOCKED doc. The original /home spec was explicit: "The homepage needs to summarize... it's in chart and animations and all of that. It's the page most users will be the most." Adam said this. Frame 3 contradicts it by stripping to a single status sentence above the fold. This is the core tension I am raising in this review.

---

## Section 2: Frame 4 Proposal — The Sweet Spot

---

### The Core Problem Frame 4 Must Solve

At $189/month, Beamix costs more than Otterly Standard ($189 — identical price, pure dashboard). At $499/month, Beamix costs more than AthenaHQ Self-Serve ($295 — broader engine coverage). Beamix can only justify its price by making it *immediately and visibly obvious* that it is doing more. "Trust us" is not enough. The user needs ambient evidence of ongoing autonomous work. Frame 3 correct on the calm register; wrong on how much evidence to surface.

Frame 4 is: **Calm Signal, Rich Evidence.**

The above-the-fold is calm. But it shows enough to prove the system is active.

---

### The Signature Move

Frame 3 says: "One Status / One Decision / One Number."

Frame 4 says: **"One Status / One Decision / One Number / One Activity Pulse.**

The Activity Pulse is a single compact strip — never more than 32px tall — that lives directly below the score on /home. It shows the last 3 agent actions as one-line summaries: "Schema Doctor: fixed 2 errors (4h ago)" / "Citation Fixer: added 7 FAQs (yesterday)" / "Competitor Monitor: you gained on Profound (2 days ago)." Plain Inter 13px. No animation. No click required.

This is not a feed. It is not a notification list. It is a heartbeat. The user reads it in under 5 seconds and knows: the system is alive, it has been working, here is the evidence.

The Status Token stays. The Decision Card stays. The score stays. The Activity Pulse adds exactly one thing: *proof that the agents ran*. Without it, the above-the-fold communicates a status but not a system.

---

### Surface Depth — How Much Above the Fold

Frame 3 strips too far. Frame 2 overloads. The right answer is:

**Above the fold on /home:**
1. Status sentence + color token (KEPT from Frame 3)
2. Score + delta, prominent (KEPT from Frame 3)
3. Decision Card if needed, nothing if not (KEPT from Frame 3)
4. Activity Pulse — last 3 agent actions, one line each, plain text (ADDED)
5. Tier badge — "Build plan: 6 engines active" / "Scale: all 11 agents + competitors" — a single line in muted text that reminds the user what they are paying for (ADDED)

This is still a 5-second above-the-fold read. But it communicates: status, magnitude, ongoing activity, and tier value. Frame 3's version communicates status and magnitude. The two additions cost zero scroll and add material perceived value.

**Below the fold on /home (Frame 4 restores much of what Frame 3 killed):**

The PAGE-LIST-LOCKED spec locked 8 /home sections. Adam explicitly described /home as the page where "everything is summarized" with "charts and animations." Frame 3 killed sections 2 through 8. Frame 4 restores them — but restructured:

- Section 1 (above fold): Status + Score + Decision + Activity Pulse + Tier Badge
- Section 2: KPI cards row — Mentions / Citations / Competitor Delta / Credits remaining. 4 cards. Each one is a concrete proof of value. This is not decoration; this is the user's answer to "is Beamix working?"
- Section 3: What your agents did this week — a plain-language 3-5 sentence paragraph. This is the Digest reproduced in the app. Not new content — the same digest Sarah reads in email, visible here for the user who opens the app instead of email.
- Section 4: Per-engine strip — 6+ engine pills with scores. Scale users see all 11 engines. Build users see their tier's engines. Discover users see 3. The strip IS the tier ladder made visible at the product surface.
- Section 5: 12-week score sparkline (thin, below the fold, for Yossi)
- Section 6: Top 3 fixes ready — "Run all (N credits)" CTA. This is the /home's revenue surface: more credits consumed = more engagement = retention.
- Section 7: Upcoming (next scan, next digest, next billing date)

This is 7 sections, not Frame 3's 2. But they are organized around proof-of-value, not around craft. No hand-drawn illustrations on sections 2-7. No Excalifont. Clean Stripe-table visual register. Dense but calm.

---

### Email vs App Split

Frame 3 makes email primary. I partially agree — for Sarah, email IS the product. But the split should be tiered:

- **Discover users ($79):** Email is primary. App is the escape hatch. Monday Digest is the relationship. This is Frame 3 correct.
- **Build users ($189):** App and email are co-primary. The user who pays $189 should be visiting the app at least weekly to see competition data, check the per-engine strip, and manage the inbox. Design /home to reward that visit.
- **Scale users ($499):** App is primary for Yossi. He visits /home multiple times per week, uses /competitors daily, authors digests for clients in /crew, exports reports in /reports. Email is a notification layer, not the product.

This means /home needs to serve three engagement models at once. The above-fold design I described does this: Sarah reads Status + Score + Activity Pulse and is done. Yossi reads the same and then scrolls through all 7 sections. The depth is there; the calm is there; the tier ladder is visible.

---

### /home Redesign

See above-the-fold and below-the-fold spec in "Surface Depth" section. The key PM decisions:

1. The per-engine strip is the visible tier gate. Discover shows 3 engines. Build shows 6. Scale shows all 11. If a Discover user hovers the grayed-out engines, they see: "Unlock 8 more engines — upgrade to Build." This is the single most direct expansion driver in the product.

2. The KPI cards row must show numbers that can increase over time — Mentions, Citations, and Competitor Delta must all show their all-time trend, not just this week. A user who sees "Citations: 47 total (up from 12 when you joined)" has an anchor that makes cancellation feel costly.

3. The "Run all" CTA in the fixes section should show the credit cost inline. "Run all — 8 credits (52 remaining)" makes the credit system feel scarce and valuable, not bureaucratic.

---

### /onboarding Redesign

Frame 3's 2-step Vercel pattern is correct and should be kept with one addition.

The goal-selection in Step 2 is the right mechanic, but the three options Frame 3 proposes ("Get cited more," "Match competitor," "Show up for my category") need to be tied explicitly to the tier the user just paid for.

**Addition for Frame 4:** After goal selection, show one sentence: "On your Build plan, your crew will run [6 engines] and check [competitor tracking] every week toward this goal." This closes the gap between the pricing page and the onboarding — the user hears what they paid for at the moment they set their goal.

The first-scan-live magic moment is correct. Keep it.

---

### /crew Rebuild

Frame 3 turns /crew into a digest-authoring tool. This is wrong for one clear reason: it gives Sarah a new job. She now has to author or at least review a digest configuration. That is the opposite of Frame 3's own philosophy.

**Frame 4 /crew:** The page is the roster, and the roster is the evidence of value.

Above the fold: "Your 11-agent crew. All active." (or "8 of 11 active — 3 paused for your plan.") Below: a plain table of agents. Name / what they do in one sentence / what they did this week (count) / current state (Idle / Working / Scheduled). That is all Sarah needs.

Yossi's use case is handled by a single additional section below the roster table: "Monday Digest — sent to you (and 3 clients) this Monday." With a "Preview next digest" button and a per-client toggle. The digest authoring is ONE section on /crew, not the page's primary job.

The card-flip mechanic from Frame 2 can be resurrected in a constrained form: clicking an agent row expands it inline (no flip, just vertical expansion) to show: what this agent does, its last 5 actions, its autonomy setting. That serves Yossi's curiosity without adding Frame 2's mascot complexity.

---

### Tier Ladder — What Concretely Unlocks

This is the biggest gap in all three frames. None of them specifies what the product *looks like* at each tier. Frame 4 must answer this.

**Discover ($79):**
- /home: 3-engine strip (ChatGPT, Gemini, Perplexity) — grayed-out remaining engines visible with "upgrade" hover
- /competitors: locked — shows a preview card with upgrade CTA
- /crew: 4 agents active (Citation Fixer, Schema Doctor, FAQ Agent, Weekly Scanner)
- Monday Digest: yes
- /reports: locked

**Build ($189):**
- /home: 6-engine strip (adds Claude, AI Overviews, Grok) — grayed remaining engines visible
- /competitors: unlocked — full table + rivalry strip depth view
- /crew: 8 agents active (adds Competitor Monitor, Opportunity Finder, Content Optimizer)
- Monday Digest + weekly competitive brief (a second email: "Competitor moves this week")
- /reports: locked

**Scale ($499):**
- /home: all 11 engines, all 11 agents, Activity Pulse shows citation prediction confidence ("Citation Predictor: your FAQ page has 78% chance of citation — we optimized it")
- /competitors: full trajectory charts, rival movement alerts
- /crew: all 11 agents + Citation Predictor (the Scale differentiator per R1 gap analysis)
- Monday Digest + competitive brief + monthly client digest (white-label)
- /reports: unlocked — white-label PDF exports

The per-engine strip on /home is the most visible expression of the tier ladder. The user sees what they are getting and exactly what they could get more of. This drives expansion without a sales motion.

---

### The User-Crew Connection

Frame 3 makes the Monday Morning Digest the headline mechanic. That is the right mechanic for retention — but it is thin as an emotional connection.

**Frame 4 adds one element:** the agent names are real and consistent. "Citation Fixer ran 4 FAQs" is less compelling than "Your Citation Fixer added 4 FAQs your customers are asking ChatGPT." The crew should have names that the user internalizes as "my team" — not mascots (Frame 2 mistake), not generic labels (Frame 3's bland count).

The digest copy should be written in first person from the crew as a unit: "We ran a competitor check this week. You're now ahead of [Rival] on Perplexity by 4 points. We're targeting their gap on ChatGPT next." This is team-speak, not system-speak. It creates emotional continuity between digests.

The /crew page reinforces this by showing agent names consistently, always in the same order, always with their weekly count. Users who visit /crew monthly will recognize their agents by name. That recognition is retention.

---

### Retention Loop

The retention loop in Frame 4 runs on three rails, which is stronger than any single-frame retention mechanic:

1. **Monday Digest (email rail)** — weekly proof-of-value, five sentences, same format every week. If the score improves, this email is the best retention tool in the product. If it doesn't, it surfaces the problem before the user discovers it via churn.

2. **Score trend (app rail)** — the 12-week sparkline below the fold on /home is a visual anchor to past investment. A user who sees their score grow from 41 to 73 over 12 weeks has a sunk-cost that makes cancellation psychologically costly. This is the Duolingo streak mechanic in a professional product.

3. **Competitive brief (Build/Scale email rail)** — a second weekly email for Build and Scale users: "Competitor moves this week." This is new in Frame 4. It creates urgency: "We found [Rival] gained on you on Gemini. Your Citation Fixer is responding." Users do not cancel a service that is actively responding to threats.

---

## Section 3: Open Questions for the Board

**For the Designer:**
Frame 4 restores 7 /home sections but demands that sections 2-7 are calm and evidence-dense, not craft-intensive. What does "Stripe-table visual register" look like at billion-dollar quality when applied to KPI cards and agent activity? Is there a design idiom that communicates premium without hand-drawn elements? The Activity Pulse (3 agent actions, one line each) needs a visual treatment that distinguishes it from a notification list without being decorative.

**For the User Researcher:**
Does Sarah actually open the Monday Digest? Or does she mark it read without opening, like every other SaaS digest email? If she does not open, the retention loop collapses for the Discover tier. What evidence do we have — from comparable products (Wealthfront, Mint, Mailchimp weekly stats) — about digest open rates in the SMB segment? This is the single highest-risk assumption in Frame 3 and Frame 4.

**For the Visionary:**
The Citation Predictor agent (from R1 gap analysis: AthenaHQ's ACE feature is Enterprise-only at a competitor) is the most defensible Scale-tier differentiator identified in research. It predicts citation probability before content is published and tells the user what to change. Does this fit Beamix's automation model (suggest → approve → agents execute)? If yes, what does the /home Activity Pulse entry look like for a citation prediction run? The Visionary should define the customer promise around this feature.

**For All Seats:**
The per-engine strip on /home as the visible tier gate is the most aggressive expansion mechanic I am proposing. Showing grayed-out engines with an "upgrade" hover on every /home visit may feel pushy for a managed-service product that promises calm. But if we do NOT show the tier gate on the product surface, we have no in-product expansion driver and must rely on billing-page upgrades driven by email campaigns. Is the tradeoff acceptable? I take the position: show the gate, but make it passive (greyed out, not a CTA banner). The other seats should weigh in.

**For the Build Lead (not a board seat, but this needs an answer before build starts):**
The trust-tier router (auto-run / pre-approve / always-escalate) is the product's most important infrastructure component, and Frame 3 leaves it as a question mark. Before any /home or /inbox UI is built, the trust-tier defaults need to be locked. My recommendation: ship with a conservative default (everything pre-approves) and loosen over time as the user builds trust. The onboarding Step 2 goal selection should set the initial trust profile. But this is an engineering architecture question, not a design question, and it needs an answer before the Design Lead has a final spec to build from.
