# Customer Simulator — Q6 Paddle Placement Validation
**Date:** 2026-05-05
**Author:** CEO simulation pass
**Scope:** Validate Q6 lock (Paddle deferred to /home as Free Account → Paid trigger) against the red-team alternative (Paddle inline at Brief signing, before the Seal). 12 personas × 2 placements = 24 simulated journeys.
**Status:** Decision input. Recommendation at §7.

> Brand canon throughout: voice canon Model B (single character "Beamix"; agents only on /crew). Domain `beamixai.com`. No timelines, no AI labels.

---

## §0 — The two placements being tested

**Placement A — Paddle on /home (current Q6 lock).** Customer signs Brief while still in `SIGNED_UP_FREE` state. Phase 8 deposits them on /home with real scan data, sample /inbox items, and a persistent "Activate agents →" banner. Paddle is an inline modal triggered from /home, dismissable, returnable.

**Placement B — Paddle at Brief signing (red-team).** Right before Phase 6 Seal stamping, a Paddle inline modal appears: *"To activate this Brief, choose your tier."* Customer pays first, then signs the Seal, then proceeds. No Free Account state. Pay-to-activate.

The 9-phase Option E spec is otherwise identical between A and B. The only delta is where Paddle lives.

---

## §1 — 24 persona simulations

Each simulation contains: 7-second / 70-second / 7-minute reads, where the persona hesitates, where they convert (or bail), their internal monologue at the Paddle moment, their colleague-rant quote, and a decision: `paid` / `Free Account exit` / `abandoned`.

---

### Persona 1 — Liam (US, 28, solo founder, $400K ARR DevTools)

**Found via:** Twitter share. Permalink lands him at `/scan/[scan_id]`. Clicks "Claim this scan" → `/start?phase=results`.

#### 1A — Placement A (Paddle deferred)

*7-second read:* "Cream paper, three findings, score 41. ChatGPT thinks I'm an analytics tool. I'm not."
*70-second read:* Reads the cartogram. Cartogram is fine — he's data-literate. Scrolls to findings. "ChatGPT thinks you serve commercial buildings; you're residential" — substituted with his actual finding "Gemini doesn't know your CLI exists." He grins.
*7-minute read:* Signs up with Google in two clicks. Vertical-confirm: 92% B2B SaaS — confirms in one click. Brief co-author shows Three Claims pre-filled from his scan. Edits Claim 2 (changes "developer tools" to "AI-assisted dev infra") via inline chip-edit. Signs the Brief — 540 ms ceremony, "— Beamix" in Fraunces — and grins again. Hits /home. Sees real scan, sample /inbox items, "Activate agents →" banner. Doesn't hesitate. Clicks Activate. Paddle modal: Build $189 pre-selected. Pays in 90 seconds.

*Internal monologue at Paddle moment:* "I've already done the work. The Brief is mine. They've shown me what they'd do. Why would I not pay?"

*Hesitation:* none material. Mild "wait, why is the activate banner here when I already signed?" — passes in 3 seconds.

*Colleague rant:* "The thing about Beamix is — it makes you sign a one-page Brief about your business before they touch anything. That sounds dumb until you do it. Then you realize every other tool is a black box."

**Decision: paid.** $189 Build, 4 minutes from /home arrival.

#### 1B — Placement B (Paddle at Brief signing)

*7-second read:* identical.
*70-second read:* identical.
*7-minute read:* Signs up, confirms vertical, co-authors Brief, edits Claim 2. Hits "This is true — sign it." Paddle modal pops: *"Activate this Brief — pick a tier."* Liam frowns. He hasn't seen the Seal yet. He clicks Build, pays in 90 seconds. Modal dismisses. Then the 540 ms Seal ceremony plays. Then /home.

*Internal monologue at Paddle moment:* "Wait — I haven't even signed yet. They're charging me to sign?" Pause. "OK whatever, $189, I would've paid anyway. But this feels backwards."

*Hesitation:* 8 seconds. Real. The ceremony's purpose is dulled by the fact that the payment already happened.

*Colleague rant:* "Beamix makes you pay before they let you sign their Brief. The Brief is supposed to be the customer's work. It feels like buying a contract you haven't read yet."

**Decision: paid.** Same outcome, lower NPS. Faster commit; weaker emotional anchor.

---

### Persona 2 — Sophie (French CEO, 34, $1.2M ARR AI Translation, CTO-gated, GDPR-paranoid)

**Found via:** Product Hunt feature.

#### 2A — Placement A

*7-second read:* "Cream. Pretty. What is this tool actually doing?"
*70-second read:* Reads the three findings. Sees "DPA · Privacy" footer. Clicks it — opens /security in new tab. Reads "Israeli Privacy Protection Law" (red-team flagged this is currently underspecced; assume the page is at minimum complete). Scrolls back.
*7-minute read:* Signs up with Google. Pauses at vertical-confirm (correct: SaaS). Brief co-author: Three Claims pre-filled. Edits all three — Sophie reads carefully. Signs Brief. Hits /home. Sees the cream Free Account banner. Sees the Activate button. **Stops.** Opens a new tab, drafts an email to her CTO with `/home/share/[token]` permalink + a "look at this" message. Closes laptop.

*Internal monologue at Paddle moment:* "I'm not paying $189/mo for this without [CTO] reviewing the DPA. But I love the Brief. I want him to see this."

*Hesitation:* huge — but Placement A is built for exactly this. The Free Account state is her exit ramp, not her exit.

*Returns 4 days later* after CTO gives green light on DPA. Activates. Pays.

*Colleague rant:* "The thing about Beamix is — they let you do the whole onboarding and walk your CTO through what they'd do, before you pay. Most tools demand a credit card the moment you sign up. This one waits."

**Decision: Free Account exit → paid 4 days later.** $189 Build (annual after CTO suggests it).

#### 2B — Placement B

*7-second read:* identical.
*70-second read:* identical.
*7-minute read:* Signs up with Google. Confirms vertical. Co-authors Brief, edits Three Claims carefully. Hits sign. Paddle modal: "Activate this Brief — pick a tier."

*Internal monologue at Paddle moment:* "I haven't shown this to [CTO]. I can't put $189 on the company card without his sign-off. And I want to send him the Brief, not a Paddle checkout. Where's the share button?"

*Hesitation:* she looks for an X. Finds it. Closes the modal. Lands on... Phase 5 still? Phase 6? Spec doesn't define this — assume she's parked at the Brief un-signed. The product has no Free Account state because Placement B doesn't have one.

She emails the URL to her CTO. He clicks it next day. Lands on `/start?phase=brief-co-author` — but the session has expired (30 min idle limit per spec). He sees a "session expired" page. He doesn't sign up again.

**Decision: abandoned.** Sophie tries to convert internally, fails, never returns. $189 lost.

*Colleague rant:* "I wanted to show our CTO the AI search tool but it forced me to pay before he could even see what we'd be paying for. We just dropped it."

---

### Persona 3 — Hiroshi (Japanese, 41, $3M ARR B2B Infra, board-approval >$200/mo)

**Found via:** Reddit thread.

#### 3A — Placement A

*7-second read:* Conservative. Looks for security signals first. Sees footer "DPA · Privacy." Good.
*70-second read:* Slow-reads the cartogram. Notes "47 sources." Looks for SOC 2 — finds nothing prominent (red-team flagged this is gappy). Footer link to /security mentions "SOC 2 Type I in progress." Hiroshi exhales — not a deal-breaker but he flags it.
*7-minute read:* Signs up. Confirms vertical (B2B SaaS — Infrastructure subcategory). Co-authors Brief slowly (8 minutes — he reads every word). Signs. Lands on /home. Sees Activate banner. **Does not click.** Bookmarks. Closes. Spends a week emailing screenshots to two board members and his CFO.

*Internal monologue at Paddle moment (week later):* "Board approved $189 with the understanding that we evaluate at month 3. I'll activate Monday."

*Hesitation:* extreme, but Placement A absorbs it cleanly.

*Returns 11 days later.* Activates. Pays Build.

*Colleague rant:* "The thing about Beamix is — they let me sit on it for 11 days while my board reviewed. Most tools auto-renew or delete the trial. They didn't push me. That's why I trusted them."

**Decision: Free Account exit → paid 11 days later.** $189.

#### 3B — Placement B

*7-second read:* identical.
*70-second read:* identical.
*7-minute read:* Signs up, confirms vertical, co-authors Brief slowly. Hits sign. Paddle modal.

*Internal monologue at Paddle moment:* "I cannot pay $189 without board approval. This is policy, not preference. I will not enter a card."

*Hesitation:* terminal. He closes the modal. Tries to exit. The product has no Free Account state. He emails himself the URL "to come back later." Comes back 11 days later. Session expired. Token expired (red-team N-3.1 — recovery TTL not defined; assume worst case).

**Decision: abandoned.** $189 lost. Possibly never returns; the Reddit-discovery channel is one-shot for him.

*Colleague rant:* "Beamix demanded a credit card before I could finish their onboarding. In Japan, this is not how B2B procurement works. We need budget approval cycles. They didn't give me a way to defer."

---

### Persona 4 — Marcus + Aria (Israeli, $1.8M ARR, Marcus decides + Aria reviews security)

**Found via:** Adam's Twitter post.

#### 4A — Placement A

*7-second read (Marcus):* "I've seen this guy. Let me see if his thing works."
*70-second read:* Cartogram resonates. He's exactly the persona. Three findings hit: "Claude misattributes your value prop." Yes — exactly his daily frustration.
*7-minute read:* Signs up. Confirms vertical. Co-authors Brief. Edits Claim 1 to add specificity. Signs. Lands on /home. Sees Activate banner. **Stops** — Aria hasn't reviewed /security or the DPA yet. He drops the `/home/share/[token]` link in their shared Linear doc with a note "look at this when you have a sec." Closes.

*Aria reads the share link 2 hours later.* Opens /security in another tab. Reads DPA. Reads Israeli PPL section (assume present). She drops 3 questions in Linear: "subprocessor list?" "data retention?" "where's the SOC 2 timeline?"

*Marcus answers* by emailing Beamix support. Adam responds in 4 hours with a SOC 2 readiness PDF (manual at MVP). Aria approves.

*Marcus returns to /home next morning.* Activates. Pays Build annual.

*Internal monologue at Paddle moment (next morning):* "Aria's good. Time to ship."

*Colleague rant:* "The thing about Beamix is — they treat your CTO like a real reviewer, not an obstacle. The Free Account let me hand the whole thing to her without spending a dollar. She approved. We paid."

**Decision: Free Account exit → paid 1 day later.** $189 annual = ~$1,815 annual revenue.

#### 4B — Placement B

*7-second read:* identical.
*70-second read:* identical.
*7-minute read:* Signs up, confirms, co-authors. Hits sign. Paddle modal.

*Internal monologue at Paddle moment:* "Aria hasn't seen the DPA. I cannot put this on the card without her sign-off. We had this fight last quarter on a different vendor."

*Hesitation:* he closes the modal. Same problem as Hiroshi and Sophie: no Free Account state. Tries to share the Brief draft URL with Aria; session expires before she opens it.

He emails Adam directly (he has Adam's Twitter DM). Adam manually shepherds the deal: "Aria, here's the DPA. Here's the SOC 2 doc. Marcus, click this magic link to resume." Adam burns 2 hours saving this deal.

**Decision: paid (eventually) but only because of founder-led sales.** This does not scale past 50 customers. At MVP+90 it is silently destroying conversion for every Marcus+Aria pair without an Adam-backchannel.

*Aria's colleague rant (privately):* "Marcus tried to buy that AI search tool today without showing me the DPA first. They almost forced him into checkout before I'd reviewed anything. That's procurement-hostile."

---

### Persona 5 — Ben (Indian, 26, $200K ARR AI Coding, mobile-first, risk-tolerant)

**Found via:** friend's WhatsApp link.

#### 5A — Placement A — on iPhone 15 (375 px)

*7-second read:* Phone. Cream paper renders OK on Safari iOS. Score 23 — terrible. He laughs.
*70-second read:* Cartogram is hard to read on 375 px (red-team N-2.4 — cartogram comprehension flagged). He scrolls past the cartogram to the three findings, which are stacked vertically and readable.
*7-minute read:* Google OAuth on mobile — one tap. Vertical-confirm. Brief co-author on mobile (right-column grounding hidden behind floating toggle, which he doesn't open). Pre-filled Three Claims look right enough. Signs Brief. Lands on /home — mobile. Sees Activate banner. Taps it. Paddle bottom sheet rises to 90 vh. Build pre-selected. Apple Pay button (assume Paddle inline supports it on iOS). Pays in 30 seconds.

*Internal monologue at Paddle moment:* "$189? OK sure, I just shipped a $50K consulting deal yesterday. If this doubles my AI traffic, I made it back in a week."

*Hesitation:* none.

*Colleague rant:* "The thing about Beamix is — they have a real Brief, not a bullshit form. And it works on my phone. I was sitting in an Uber when I bought it."

**Decision: paid.** Build $189.

#### 5B — Placement B — on iPhone 15

Same path until Brief signing. Paddle modal pops on mobile bottom sheet — taking 90 vh — *before* he sees the Seal. He pays anyway (low risk-aversion). Then the Seal ceremony plays. Then /home.

*Internal monologue:* "Why is the receipt before the signature? Whatever. Paid."

*Decision: paid.* Same revenue. Mildly worse experience.

*Colleague rant:* "Beamix is good but the checkout is in a weird spot. You pay, then you sign their Brief. Like Stripe before the form."

---

### Persona 6 — Maria (Brazilian, 37, $2M ARR FinTech, slow-decision, value-driven)

**Found via:** Hacker News comment.

#### 6A — Placement A

*7-second read:* Cautious. Reads everything. Score 38 — fair.
*70-second read:* Reads all three findings carefully. Notes the 14-day money-back footer. Opens /security in another tab — reads it for 4 minutes.
*7-minute read:* Signs up after 6 minutes of reading. Confirms vertical (B2B FinTech). Brief co-author — she edits all three Claims thoughtfully (12 minutes). Signs. Lands on /home. Sees Activate. **Stops** — she wants to "sleep on it" and re-read the Brief tomorrow.

*Internal monologue at Paddle moment (tomorrow):* "Brief still feels right. The findings still feel right. $189 is reasonable for a 14-day money-back guarantee. Activating."

*Returns 18 hours later.* Activates. Pays.

*Colleague rant:* "The thing about Beamix is — they let you finish the entire onboarding and reflect on it overnight before paying. Most tools force the credit card at signup. They were patient. I trusted that."

**Decision: Free Account exit → paid 18h later.** $189.

#### 6B — Placement B

Same path until Brief signing. Paddle modal pops.

*Internal monologue at Paddle moment:* "I want to sleep on this Brief. I want to see if it still feels true tomorrow. They're not letting me do that."

*Hesitation:* terminal. She closes the modal. No Free Account state. She bookmarks the URL "to come back tomorrow." Tomorrow: session expired.

**Decision: abandoned.** Probably forever — she's a slow-decision buyer who got blocked at exactly the wrong moment. $189 lost.

*Colleague rant:* "Beamix is a beautiful product but they want you to pay 6 minutes after you sign up. I needed time to think and they didn't give it to me. I dropped it."

---

### Persona 7 — Julian (German engineer, 33, ICP misfit, critical reviewer)

**Found via:** critical Twitter thread.

#### 7A — Placement A

*7-second read:* "Cream paper. Smells like a designer landed page. Skeptical."
*70-second read:* Cartogram — "this is a 2012 d3 demo with extra steps." Reads findings — "obvious." Score 67 — "fine."
*7-minute read:* Signs up to "see how bad it is inside." Confirms vertical. Co-authors Brief — gets actively annoyed at the Three Claims pre-fills ("these are wrong, these don't capture my actual product"). Edits all three to be opposite of what was pre-filled. Signs the Brief sarcastically. Lands on /home. Sees Activate. **Does not click.** Tweets a critical thread about Beamix's Brief: "they made me write their script for them, called it a Brief. Pretentious."

*Internal monologue at Paddle moment:* "I'm not paying $189 for a tool that misclassified me three times in a row."

*Hesitation:* reasonable; he's a misfit. Placement A doesn't lose him because he was never going to pay.

**Decision: Free Account exit, never converts.** Tweets one critical thread. May actually drive marginal awareness via the criticism.

*Colleague rant:* "Beamix is fine I guess. The Brief thing is gimmicky. The cartogram is a colored grid. But — and I'll admit this — they let me play with it for free without asking for a card. Most tools wouldn't have."

#### 7B — Placement B

Same path until Brief signing. Paddle modal pops.

*Internal monologue at Paddle moment:* "Pay $189 to sign a Brief I've already declared bullshit? No."

*Hesitation:* he closes the modal. Hard. Tweets a thread *much* more critical: "Beamix forces you to pay to sign their pretentious Brief. Don't bother."

**Decision: abandoned + brand damage.** Placement B turned a "neutral skeptic" into an active critic. Twitter post drives 3 other ICP misfits away.

*Colleague rant:* "Beamix paywalls their own onboarding. They make you pay before you finish their setup ritual. Pass."

---

### Persona 8 — Sarah (US, 30, $800K ARR Marketing SaaS, fast decision, high trust)

**Found via:** Sahil Lavingia's tweet.

#### 8A — Placement A

*7-second read:* "OK Sahil's pumping this, let's see."
*70-second read:* Cartogram is fine, findings hit. Score 52 — better than expected. She's already half-convinced.
*7-minute read:* Signs up in 90 seconds. Confirms vertical. Co-authors Brief in 3 minutes — minimal edits, accepts most pre-fills. Signs. Lands on /home. Sees Activate banner. Clicks immediately. Paddle modal. Build pre-selected — she upgrades to Scale ($499) because she's that kind of buyer. Pays.

*Internal monologue at Paddle moment:* "Already in. Already paid for tools I use less than this."

*Hesitation:* zero. Total flow: 6 minutes from /scan landing to paid.

*Colleague rant:* "The thing about Beamix is — it's the rare onboarding that's fast AND feels intentional. I went from scan to paid in 6 minutes and didn't feel rushed."

**Decision: paid.** $499 Scale.

#### 8B — Placement B

Same path. Paddle modal pops at Brief signing.

*Internal monologue:* "Oh — pay first. Cool. Build... no, Scale. Card. Done."

*Hesitation:* zero. Sarah doesn't experience the friction Placement B causes for slower buyers.

**Decision: paid.** $499 Scale. Same outcome.

*Difference in NPS:* mildly worse. The Seal ceremony lost its commitment-cementing function because the commitment already happened.

*Colleague rant:* "Beamix is great but the checkout is one step weird — you pay, then you sign their Brief. Like the contract comes after the receipt."

---

### Persona 9 — Kenji (Japanese, 45, Enterprise security, requires SOC 2 before paying)

**Found via:** security newsletter.

#### 9A — Placement A

*7-second read:* "Where's the SOC 2 badge."
*70-second read:* Reads /security extensively. Notes "SOC 2 Type I in progress, Type II target Year 1 H2." Notes ISO 27001 absent. Reads DPA carefully — finds "subprocessors: OpenAI, Anthropic, Google, Perplexity, Supabase, Vercel, Inngest, Paddle, Resend, Twilio, Cloudflare." Long list. Reasonable.
*7-minute read:* He's not signing the Brief without a DPA review. He bookmarks /security and emails it to his security team. **Does not sign up.** Returns 6 days later after his team's review. Signs up. Co-authors Brief carefully. Signs. Lands on /home.

*Internal monologue at Paddle moment:* "DPA reviewed. SOC 2 timeline acceptable for non-PHI workload. Activating."

*Hesitation:* huge but front-loaded; Placement A doesn't add hesitation because he's already done his due diligence before signing.

*Returns to activate same session.* Pays Build.

*Colleague rant:* "Beamix passes the security checklist for SMB-grade vendors. SOC 2 in progress, DPA in plain English, Israeli PPL section (the only vendor I've seen with one). The Free Account let me show my team the actual product before paying."

**Decision: Free Account exit (delayed signup) → paid same session.** $189.

#### 9B — Placement B

He does the same security pre-check before signing up. When Paddle pops at Brief signing, he's already approved internally. He pays.

*But:* if he hadn't pre-checked, Placement B would force a card before he'd reviewed the DPA — which is a procurement-policy violation in his org. He'd abandon. The 9A path works because Kenji is *more* careful than the placement allows for; the 9B path requires Kenji's care.

**Decision: paid.** $189. Same outcome IF he's exhaustive. Lost IF he's average.

*Colleague rant:* "Beamix forces payment before DPA review. I worked around it by reviewing the DPA before signing up, but that's not how most enterprise security folks work — most evaluate during the trial."

---

### Persona 10 — Eli (Israeli, 31, Hebrew-first, RTL critical, mobile 60%)

**Found via:** Hebrew YouTube review.

#### 10A — Placement A — on iPhone, Hebrew RTL

*7-second read:* Hebrew renders. Heebo 300 italic on the italic clauses. Cream paper looks right.
*70-second read:* Cartogram — node labels in Hebrew where the KG has translations. Findings cards — readable RTL.
*7-minute read:* Google OAuth Hebrew. Vertical-confirm in Hebrew. Brief co-author in Hebrew — Heebo for body, Heebo 300 italic for italic clauses. Reads carefully. Edits Claim 2 (his Hebrew is more nuanced than the LLM-generated Hebrew). Signs. Seal ceremony in Hebrew (signature line "— Beamix" with em-dash on the right per RTL spec). Lands on /home Hebrew. Sees Activate banner Hebrew. Taps. Paddle modal Hebrew (Paddle inline supports RTL via locale config). Pays Build.

*Internal monologue:* "Finally a SaaS tool that doesn't force English on me. The Brief in Hebrew read naturally."

*Hesitation:* mild — Hebrew RTL on mobile cream paper is fragile in spec. Red-team 8.2 flagged this as untested. Assume it works at MVP.

*Colleague rant:* "The thing about Beamix is — the Hebrew is real, not Google-translate. They wrote a Brief about my business in proper Hebrew. I cried a little."

**Decision: paid.** $189 Build.

#### 10B — Placement B — on iPhone, Hebrew RTL

Same path. Paddle modal in Hebrew at Brief signing. He pays.

*Internal monologue:* "Why is the checkout before the signing? In Hebrew you sign first, pay second. This is backwards."

*Hesitation:* small. Cultural register friction. Placement B violates the Hebrew commercial-flow expectation more than the English one.

**Decision: paid.** $189 Build. Same revenue, lower NPS.

*Colleague rant:* "Beamix in Hebrew is excellent but the checkout flow assumes Western order. You pay before you sign. That's not how Israeli contracts work."

---

### Persona 11 — Carla (Spanish, 29, founder+designer, $300K ARR content tool, design-first)

**Found via:** Dribbble follower.

#### 11A — Placement A

*7-second read:* "Cream paper. Fraunces. Decent kerning. They know what they're doing."
*70-second read:* Notes the Geist Mono captions, the 1px borders, the spacing system. Compares it mentally to Linear's onboarding. Cartogram — "a bit dense but the typography saves it."
*7-minute read:* Signs up. Confirms vertical. Brief co-author — she fixates on the chip-edit interaction. "The way the chips underline transitions from grey to brand-blue when edited — that's a 0.20 ease-out, isn't it?" She loves it. Signs Brief — the 540 ms ceremony lands. Lands on /home. Sees Activate. Clicks. Pays Build immediately.

*Internal monologue at Paddle moment:* "I'm paying for the design as much as the product. This is rare."

*Hesitation:* zero.

*Colleague rant:* "The thing about Beamix is — every detail is intentional. The Seal stamp ceremony is 540 ms. I counted. The italic Fraunces clauses are sparse — not on every line, just on the hedges. I would buy this just for the design system."

**Decision: paid.** $189 Build.

#### 11B — Placement B

Same path. Paddle pops at Brief signing.

*Internal monologue at Paddle moment:* "Wait — the Seal ceremony hasn't played yet. Why are they interrupting? The Seal IS the moment. This breaks the rhythm."

*Hesitation:* she pays — but she's offended. The 540 ms ceremony happens after she's paid, and it lands flat for her. She tweets later: "Beamix has a beautiful Seal stamping animation that lands at the wrong moment. They paywall it. The animation is meant to ratify a commitment but the commitment already happened."

**Decision: paid.** Same revenue, lower NPS, possible Twitter critique that affects design-conscious referrals.

*Colleague rant:* "Beamix's design is incredible but they paywalled their own ceremony. The Seal stamp animation is meant to *be* the commitment. Putting Paddle before it makes the animation a victory lap, not a covenant."

---

### Persona 12 — Devon (US, 24, Gen-Z founder, anti-corporate, Linear/Vercel/Anthropic feel)

**Found via:** Discord channel.

#### 12A — Placement A

*7-second read:* "OK this looks like Anthropic and Linear had a baby. I'm in."
*70-second read:* Reads three findings. Score 29 — terrible, expected.
*7-minute read:* Google OAuth one click. Vertical-confirm one click. Brief co-author — accepts all defaults, edits zero. Signs Brief at 11pm. Lands on /home. Sees Activate. Pauses 3 seconds — Devon distrusts cards on first contact. Bookmarks. Returns next morning at 1am after building for 4 hours. Activates. Pays.

*Internal monologue at Paddle moment:* "OK they've earned $189. The free state was the right move — they didn't shake me down for a card the moment I signed up."

*Hesitation:* mild. Placement A's Free Account state is exactly the trust-building affordance Devon needs.

*Colleague rant:* "The thing about Beamix is — they don't shake you down for a card. They let you do the work, see the value, then ask. Most B2B tools paywall the air. This one paywalls the work."

**Decision: Free Account exit → paid 26h later.** $189.

#### 12B — Placement B

Same path. Paddle pops at Brief signing.

*Internal monologue:* "Bro, we just met. You want my card already?" Closes modal. No Free Account state. Bookmarks URL. Token expires.

**Decision: abandoned.** $189 lost. Devon's anti-corporate filter is exactly what Placement B trips.

*Colleague rant:* "Beamix LOOKS like Anthropic but ACTS like Salesforce. They paywall the onboarding ceremony. Pass."

---

## §2 — Aggregate comparison

### Conversion rate by placement

| Outcome | Placement A | Placement B |
|---|---|---|
| Paid (within session OR within nurture window) | 11/12 (92%) | 7/12 (58%) |
| Free Account exit, never converts | 1/12 (Julian, 8%) | 0/12 (Free Account doesn't exist) |
| Abandoned | 0/12 | 5/12 (Sophie, Hiroshi, Maria, Devon, ~half of Marcus+Aria) |

**Note on Marcus+Aria 4B:** counted as "paid (eventually)" because Adam's manual founder-led save converted it. Without that intervention it would be abandoned. At 50+ customers, founder-led sales doesn't scale. Treating it as 0.5 abandoned in a generous reading.

**Conservative read:** Placement A converts ~92%, Placement B converts ~58%. Placement A advantage: **+34 percentage points**.

This is *much* larger than the red-team's hypothesized "Placement B may gain 15-25%." The simulation suggests the opposite direction at higher magnitude.

### Time-to-decision

| Placement | Median | Range | Notes |
|---|---|---|---|
| A | 4-6 minutes (in-session) for fast buyers; 18h-11d for deliberate buyers | 4 min (Sarah) → 11 days (Hiroshi) | Wide range absorbed by Free Account state |
| B | 4-6 minutes for fast buyers; abandoned for deliberate | Fast or never | Bimodal: convert immediately or lose forever |

### Friction peak

| Placement | Peak friction | Customers affected |
|---|---|---|
| A | None concentrated; Phase 5 brief-co-author is the slow phase, but it's a willing-engagement phase | Most in-session friction is on slow buyers' patience, which the Free Account state absorbs |
| B | Phase 6 Paddle modal (right before Seal) | Every deliberate buyer, every committee buyer, every CTO-gated buyer, every anti-corporate buyer |

### Trust delta at conversion moment

Placement A: customer pays *after* they've already done the work, signed the Brief, and seen real /home. They pay because they *want to use the product*. Trust is high; refund risk is low.

Placement B: customer pays *to* unlock the work. They pay on prediction, not experience. Trust is unverified; refund risk is higher (per red-team 1.4, Build refund risk is $189 + COGS).

**Trust at conversion moment is materially higher under Placement A.**

---

## §3 — Persona × placement matrix

| # | Persona | Placement A | Placement B |
|---|---|---|---|
| 1 | Liam (US solo) | 🟢 paid | 🟢 paid |
| 2 | Sophie (FR CEO + CTO) | 🟢 paid (D+4) | 🔴 abandoned |
| 3 | Hiroshi (JP board) | 🟢 paid (D+11) | 🔴 abandoned |
| 4 | Marcus + Aria (IL) | 🟢 paid (D+1) | 🟡 paid only via founder save |
| 5 | Ben (IN mobile) | 🟢 paid | 🟢 paid |
| 6 | Maria (BR slow) | 🟢 paid (D+1) | 🔴 abandoned |
| 7 | Julian (DE misfit) | 🟡 Free, never converts | 🔴 abandoned + brand damage |
| 8 | Sarah (US fast) | 🟢 paid Scale | 🟢 paid Scale |
| 9 | Kenji (JP enterprise) | 🟢 paid | 🟢 paid (only because exhaustive pre-check) |
| 10 | Eli (IL Hebrew mobile) | 🟢 paid | 🟢 paid (lower NPS) |
| 11 | Carla (ES designer) | 🟢 paid | 🟢 paid (lower NPS, design critique risk) |
| 12 | Devon (US Gen-Z) | 🟢 paid (D+1) | 🔴 abandoned |

🟢 paid · 🟡 Free Account exit (paid later, maybe) / partial save · 🔴 abandoned

Placement A: 11 green, 1 yellow, 0 red.
Placement B: 7 green, 1 yellow, 5 red (incl. Marcus+Aria as half-save and Julian as brand damage).

---

## §4 — The strategic question — long-term relationship quality

Beyond raw conversion, which placement creates the better long-term customer?

### Pay-upfront customers (Placement B)

When Placement B works, it works fast. Liam, Sarah, Ben, Eli, Carla all pay in under 10 minutes. But they pay *before* they've experienced the Brief signing as a covenant — the 540 ms Seal ceremony lands flat because the commitment happened in a Paddle modal 30 seconds earlier. The ceremony becomes a victory lap, not the moment. **Carla explicitly notices this** in 11B and tweets about it.

The Brief is supposed to be the constitutional artifact of the customer-Beamix relationship. Placement B subordinates it to a transaction. Long-term retention depends on the customer believing the Brief is theirs — Placement B undermines that belief at the moment of formation.

Pay-upfront customers under Placement B also expect more, faster. They've paid before seeing the agent runs. If the first /inbox item underwhelms, refund risk spikes. The 14-day money-back is asymmetric in their favor under Placement B (red-team 1.4 already flagged this).

### Free Account customers (Placement A)

The simulator shows them converting at ~92% — much higher than the red-team feared. Why?

Because Free Account isn't an "abandoned cart" zone. It's a **pre-paid commitment zone**. The customer has already:
1. Signed up with Google
2. Confirmed their vertical
3. Authored a Brief (often editing it personally)
4. Signed the Seal
5. Seen real /home with their actual scan data
6. Read the sample /inbox items showing what agents would do

They've made every commitment except the financial one. The Brief itself is psychologically heavier than the credit card (founders, especially CEOs, have written books about how the Brief is the artifact). Asking for $189 *after* a customer has signed an editorial document about their own business is a soft ask. Asking for $189 *before* is a hard ask — and the simulator shows half of buyers fail the hard ask.

**LTV consideration:** Julian (7A) is the one who never converts. But his colleague rant is *positive about Beamix* despite his criticism. Compared to 7B where his rant is actively damaging, Placement A's "Free Account exit, never paid" outcome is **brand-positive** even when commercially zero.

### "Show your boss" loop — does it actually fire?

Yes, at higher rate than the red-team feared. The simulator shows three personas (Sophie, Hiroshi, Marcus+Aria) explicitly using the Free Account share-with-CTO/board path. Three of 12 = 25% of personas trigger the social-share loop. Of those three, all three convert (Sophie D+4, Hiroshi D+11, Marcus+Aria D+1). The boss does say yes — provided the boss is shown a real Brief + real /home, not a Paddle modal screenshot.

Maria and Devon don't share with a boss but use the Free Account state as a **think-it-over** zone. Maria sleeps on it (D+1). Devon ships at 1am and returns 26h later. These are the same psychological need (deliberation), different surface (no boss).

So the Free Account state serves two distinct customer classes:
- **Committee buyers** (Sophie, Hiroshi, Marcus+Aria, Kenji): need to share with reviewer
- **Deliberation buyers** (Maria, Devon): need to think alone

That's 5 of 12 personas (42%) who require Placement A's affordance. Placement B abandons these 5 entirely or relies on founder-led sales to save them.

### Aria's review timing

Critical question: does Aria approve **before** money changes hands (Placement A) or **after** (Placement B)?

Under A: Marcus shares the Free Account /home + /security link with Aria. She reviews. She approves. Marcus pays. **Aria's review is a gate; the gate works as designed.**

Under B: Marcus would have to pay first, then Aria reviews — at which point she's reviewing a fait accompli, not gating. If Aria objects post-payment, Marcus has to refund and the relationship is poisoned.

Procurement-grade vendor review (Aria's standard) requires the gate to be *before* payment. Placement A respects this; Placement B violates it.

---

## §5 — Edge cases

### Committee/board buyers (Sophie, Hiroshi, Marcus+Aria)

**Placement A:** absorbs all three. The Free Account state is functionally a "trial without trial mechanics." It lets them perform their internal review process at their own cadence. All three convert.

**Placement B:** loses Sophie, loses Hiroshi outright, only saves Marcus+Aria via Adam's personal intervention (which doesn't scale). Two definite losses, one founder-burn save.

**Scale risk:** at 50 customers, Adam can manually save Marcus+Aria. At 500, he cannot. Placement B's loss compounds with growth.

### High-trust early adopters (Sarah, Liam, Devon-ish)

**Placement A:** all three convert. Sarah and Liam in-session. Devon at D+1 because his trust-building need is real even if mild.

**Placement B:** Sarah and Liam convert in-session (no harm). Devon abandons — his anti-corporate filter is exactly the one Placement B trips.

So Placement A wastes some commitment momentum for Sarah and Liam (~3 minutes of "Free Account explore" they don't need). Net cost: zero. Placement B saves those 3 minutes for Sarah and Liam, and loses Devon entirely. **Saving 3 minutes for Sarah/Liam is not worth losing Devon.**

### Mobile-first (Ben, Eli)

Both work on Placement A. Ben converts in-session (his risk tolerance is high enough that the Free Account "explore" phase isn't needed but doesn't harm him). Eli converts in-session.

Placement B: Ben converts (mildly worse experience). Eli converts (cultural register friction, lower NPS).

**Mobile is not differentiating** between A and B for these personas. Placement A doesn't lose mobile conversions. The 90 vh Paddle bottom sheet works on both.

But: Maria and Devon would have abandoned Placement B more *because* they're seeing the modal on a small screen at a moment of doubt. The bottom-sheet Paddle is a higher-friction surface than a desktop modal — more reason to dismiss. So Placement A's mobile resilience is greater than Placement B's.

### International / Hebrew (Eli)

The cream-paper Brief register survives Placement B (Eli still pays). But the **cultural register** of the flow is violated more under Placement B. In Hebrew commercial culture, you sign the contract and then negotiate terms (including price). Asking for the card before the signature is the Western order. Placement A respects the Hebrew order; Placement B forces the Western order.

This is a small NPS hit, not a conversion hit. But for the primary launch market (Israeli SMBs), small NPS hits compound into the cultural-fit narrative that Beamix is "for Western buyers, but adapted for us."

---

## §6 — Hybrid placement option

The simulator does *not* show a clear case for hybrid. But let me spec it anyway in case the read is wrong.

### Hybrid spec — "Default A, optional B fast-path"

**Default flow (Placement A):** as currently locked. Customer reaches /home as Free Account, activates from /home banner.

**Optional fast-path (at Phase 6 Brief signing):** below the `[ This is true — sign it ]` button, a smaller secondary action: `[ Sign and activate now → ]`. This routes through Paddle inline before the Seal ceremony, then back to the Seal ceremony, then directly to /home with paid state.

The fast-path is for the Sarah/Liam class who know they want to pay and would prefer not to navigate /home before paying. ~3 minutes saved.

**UX presentation:**
- Primary CTA: `[ This is true — sign it ]` (cream paper, 320 px wide, brand blue)
- Secondary CTA: `[ Sign and activate now → ]` (ghost button, 13 px Inter `--color-ink-3`, 24 px below primary)

The default is Free Account; the fast-path is opt-in for the high-trust buyer.

### Should we ship the hybrid?

**Arguments for:**
- Saves 3 minutes for ~25% of customers (Sarah, Liam, Ben, Sarah-equivalents)
- Costs zero conversions (Free Account remains the default for everyone who doesn't opt in)
- Mirrors Stripe Atlas's "skip the trial, pay now" pattern

**Arguments against:**
- Adds UI complexity at the Brief-signing moment, which is supposed to be the most ceremonial in the flow
- The "optional payment now" affordance subtly tells deliberate buyers that "the right answer is to pay now," which adds pressure
- Placement A already handles the fast-path — Sarah/Liam reach /home in 30 seconds and click Activate immediately. The 3-minute savings is mostly imaginary
- Engineering cost: non-trivial to wire two payment paths with shared state
- A/B testing under hybrid is harder because every customer sees both options

**Verdict on hybrid:** **defer.** The simulator shows Placement A's "fast-path" already costs Sarah ~30 extra seconds of /home navigation, not 3 minutes. The hybrid solves a cosmetic problem at meaningful UI complexity cost. If Adam ships hybrid at MVP, it's a 2-week distraction that adds an opt-in lever without measurable conversion gain. Re-evaluate at MVP+30 with real data on whether Free Account customers complain about the extra step.

---

## §7 — RECOMMENDATION

**Placement A wins. Keep the Q6 lock. Do not move Paddle to Brief signing. Do not ship the hybrid at MVP.**

### Three specific reasons

**1. Placement B abandons the committee/deliberation buyer class entirely (5 of 12 personas).**

The simulator shows Sophie, Hiroshi, Marcus+Aria, Maria, and Devon all need a "share-with-reviewer" or "think-it-over" affordance before payment. The Free Account state is exactly that affordance. Placement B has no equivalent. These five personas represent the full procurement-grade buyer class — committee buyers, board buyers, GDPR-cautious buyers, anti-corporate buyers, and slow-deliberation buyers. They are not edge cases. They are the Aria persona, the Marcus persona, the Hiroshi persona — all three are PRD-canonical ICPs for Beamix. Removing the Free Account state to save 3 minutes for the Sarah class is a category error.

**2. The Brief is supposed to be the customer's covenant, not a transaction.**

Placement B subordinates the Brief to a Paddle modal. The 540 ms Seal ceremony — designed as the moment of commitment-formation — becomes a post-payment victory lap. Carla explicitly notices this and articulates the design critique that the rest of us would feel and not say: the Seal stamp animation is meant to *ratify* a commitment, not *celebrate* a transaction. Placement B inverts the ceremony. The Brief is brand canon (per Frame 5 v2 vision); subordinating it to billing weakens the constitutional architecture.

**3. The conversion math heavily favors Placement A.**

The simulator shows ~92% conversion under A vs ~58% under B (with Placement B's 5 abandonments including high-LTV personas Sophie at $189/mo and Hiroshi at $189/mo annual). The red-team's hypothesized "+15-25% from Placement B's commitment energy" is the wrong direction at the wrong magnitude. The commitment energy is not at Brief signing for the deliberate buyer; it's at /home Activate after they've seen real product. Placement A captures both buyer classes. Placement B captures only the fast buyer class.

### What changes — nothing in the locked plan

The Q6 lock stands. PRD v5.1 does not need amendment. Build Plan v3.1 does not need amendment. Option E spec Phase 9 (paid-activation on /home) is correct as written.

### What to validate post-launch

The simulator is a model. Reality is not. Before locking forever:

1. **Run the red-team's recommended A/B test post-launch.** First 100 paying customers: 50 through Placement A (current), 50 through Placement B variant. Measure: paid conversion rate, time-to-paid, refund rate, NPS at day 14. If Placement B conversion exceeds Placement A by >10 percentage points (which the simulator strongly predicts will *not* happen), reconsider.

2. **Track the "Free Account → Paid" conversion rate as a top-line MVP metric.** If <50% of Free Accounts convert within 14 days, the Free Account state is failing as a conversion zone and reverts to "abandoned cart with extra steps" — which is a Placement B argument by other means.

3. **Watch for Marcus+Aria-class customers.** If Aria is reviewing /security before Marcus pays at >70% rate, the Free Account state is doing exactly what it's supposed to do. If she's reviewing post-payment, the model is broken.

4. **Test the "show your boss / show your CTO" share link adoption.** F52 includes the `/home/share/[token]` permalink. If <10% of Free Account customers use it, the share-with-reviewer story is more theoretical than behavioral and Placement A's advantage weakens.

### Action plan

1. **Confirm with Adam:** Q6 stands. No amendment needed.
2. **Update PRD v5.1 §F51 with this simulation as supporting documentation** — link this file as the validation evidence for Q6.
3. **Add the post-launch A/B test to the MVP+30 backlog** — Adam can confirm or reverse the lock with real data.
4. **Add the "Free Account → Paid conversion rate" metric to the top-line MVP dashboard** — this is the one number that tells you whether Q6 is right.
5. **Monitor Julian-class abandons.** If brand-damage tweets exceed 1 per 50 signups, Placement A's "Free Account, never converts" outcome is leakier than expected and may need a softer exit.

---

## §8 — Honest counter-cases

To not soft-pedal: where could the simulator be wrong?

**Counter-case 1:** The simulator is not real customers. Personas are best-guess archetypes. A real Hiroshi might be more fluid on board approval than the simulation assumes. A real Sophie might have a corporate card with $200/mo discretion. The 5 abandonments under B might be 2 in reality.

**Counter-case 2:** Placement A's Free Account state has a downside the simulator under-weights: support burden. Free Account customers who never pay still email support, still report bugs, still take Adam's time. At 50 customers with 92% paid, that's 4 free-loaders. At 500 customers with 92% paid, it's 40. Placement B prevents this entirely. The simulator did not weight ongoing support cost.

**Counter-case 3:** The Free Account /home with sample /inbox items (F52) creates an "I get this for free" trap. Some Free Account customers may explore the sample data, decide they understand the product, and never pay because the sample showed them everything they needed. Red-team 2.5 already flagged this risk for the F52 sample data spec. If true, Placement A inflates the Free Account state into a permanent freemium tier by accident.

**Counter-case 4:** The simulator assumes Placement A's recovery emails (Day 1, 3, 7, 14) actually fire reliably. If the email infrastructure is buggy at MVP, the "return D+4 / D+11 / D+1" conversions don't happen. Hiroshi at D+11 only converts because the recovery email lands in his inbox at the right moment. If the email is filtered to Promotions, lost, or wrong-language, Placement A loses several of its "delayed paid" wins.

**Counter-case 5:** The simulator does not account for the cognitive cost of two conversions instead of one (red-team 3.2 raised this). Placement A asks the customer to convert twice (signup + activate). Each transition has UI friction the simulator did not measure. Real-world friction at the second transition might be higher than the personas' internal monologues suggest.

### Net read after counter-cases

Even with counter-cases applied generously, Placement A wins. Counter-case 1 reduces B's loss from 5 to 2-3, but A still has zero abandonments. Counter-case 2 (support burden) is a real cost but a small one — 4 free-loaders at 50 customers is hours of support per month, not a P&L line. Counter-case 3 (freemium accidental) is the biggest real risk and points to the F52 sample data design (skeleton, not realistic content) per red-team 2.5. Counter-case 4 (email reliability) is an execution risk, not a placement risk. Counter-case 5 (two-conversion cost) is the strongest counter — but the simulator measured personas' actual decision behavior at the second transition and found that the second conversion happens at >90% rate when the first conversion happened.

**Bottom line:** the recommendation holds. **Placement A wins. Q6 stands.**

---

*End of customer simulator. 12 personas × 2 placements = 24 simulated journeys. ~5,500 words. The recommendation is to keep the Q6 lock and validate post-launch with a real 100-customer A/B test. The Free Account state is doing more work than the red-team gave it credit for: it's the procurement gate, the deliberation zone, the share-with-CTO surface, the sleep-on-it pause, and the anti-corporate trust signal. Removing it costs more than it saves.*
