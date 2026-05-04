# Onboarding Audit — 4 Persona Walkthroughs
**Date:** 2026-05-04
**Author:** Persona simulator (Marcus / Dani / Yossi / Aria)
**Surfaces reviewed:** `/onboarding/[1..4]` v1 + vertical-aware v1.1 + magic-moment landing on `/home`
**Sources:** 2026-04-27-ONBOARDING-design-v1, 2026-04-28-DESIGN-onboarding-vertical-aware-v1.1, 2026-04-28-PRD-wedge-launch-v4 (F2 + Arc's Hand amendment), 2026-04-28-BOARD-aria-simulator, 2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS
**Lens:** what works, what breaks trust, what causes drop-off, what each persona would change.

---

## Marcus walks through Beamix onboarding

### The setup
Marcus saw Beamix in a TechCrunch round-up at 11:47pm, ran the free public scan on `acme-saas.com` while brushing his teeth, scored 41 on AI-search visibility ("worse than I thought, better than I feared"), and paid for Build ($189) on his phone before bed. He opens the Paddle return link the next morning at 7:42am with one coffee and the next standup at 8:30. He expects a tool. He's already half-prepared to forward the artifact to Aria for procurement signoff before Beamix touches a production credential.

### Step-by-step internal monologue

**Paddle return → /onboarding/1.** *"OK, four dots in the top right, no escape hatch wordmark. Step 1 of 4. Confirm your business. Helper says 'we pulled this from your scan' — good, they're not making me re-type."* Website is filled. Business name "Acme" is filled. Industry is filled — **"B2B SaaS — developer tooling" with a green dot, "92% confident"**. He sits up straighter. *"They actually classified me. They didn't put me in 'Local services — plumbing' like the v1 walkthrough I read about. The vertical-aware patch landed."* Field 4 says "WHERE ARE YOU HEADQUARTERED?" not "PRIMARY LOCATION" — *"that's the SaaS path. They're not asking me about service areas. Good."* He types "San Francisco" and hits Continue. **Time: 12 seconds. Feeling: recognized.**

**Step 2 (SaaS-path UTM ceremony).** Headline reads *"Set up attribution"* and the helper says explicitly *"No phone numbers — your customers don't call you."* Marcus laughs out loud. *"Whoever wrote that sentence has been burned by SaaS onboarding before."* He watches seven UTM URLs type themselves into the panel — `acme-saas.com/?utm_source=beamix&utm_medium=ai_search&utm_campaign=geo&utm_content=chatgpt`, then claude, then perplexity, etc. The "Send to your developer" panel offers a Copy snippet button + an "Email to your dev" button. He clicks Copy, pastes into Slack DM to Liam (his lead engineer): "deploy this when you can — Beamix attribution tags." Then clicks Continue. **Time: 35 seconds. Feeling: equipped, mildly delighted by the snippet handoff — that's a procurement-grade thoughtful detail.**

**Step 3 (Brief on cream paper).** Background fades from white to cream. *"Oh — they actually changed the surface. That's a different register."* The Brief renders in Fraunces 22px, four sentences. He reads: *"Beamix recommends focusing on developer-tooling queries on Claude and ChatGPT, where engineers ask 'best [category] tool for [use case]' more than vendor-name queries. Your homepage doesn't have product-category schema; we'll add it. Three competitors — LaunchDarkly, Statsig, and Unleash — are cited more often than you on these queries; we'll respond with category-anchored content. Don't change your brand voice without asking."* He stops. *"This isn't generic. They actually read my homepage. They named the right three competitors."* He clicks the `competitors` chip — multi-select, he removes Unleash and adds Flagsmith. The chip collapses. "Saved" ticks at the bottom. *"OK, I'm authoring this."* He clicks Approve and start. The Seal stamps in cream-on-blue, "— Beamix" appears in Fraunces italic underneath. The header line flips from `DRAFT v1` to `SIGNED Apr 28, 2026 — 7:48`. **Time: 70 seconds. Feeling: this is where I forward to Aria.** Marcus screenshots the signed Brief. Sends to Aria in Slack: "thoughts?"

**Step 3.5 — Print this Brief.** Thinks about it for half a second. Keeps moving. He's a founder; he doesn't print things.

**Step 4 (Truth File on white paper).** Background flips back to white — *"different register, different ask."* Six fields. **Hours** — *"wait, hours? I'm SaaS, my product is up 24/7."* He scrolls; the field is there but the helper now reads *"For your support availability — when can customers expect a human?"* Pre-filled "9am-6pm PT Mon-Fri" from his footer. *"OK fine, that's a reasonable read of what hours means for SaaS."* But there's a half-second of cognitive friction — the field exists. Services: pre-filled "Feature flags, A/B testing, experiment analytics, audience targeting" from his nav. He edits one entry. Service areas: pre-filled "global." Three claims: empty. He types "Bayesian + frequentist stats in one platform," "Sub-100ms flag evaluation at the edge," "SOC 2 Type II + ISO 27001." Brand voice: "direct," "technical," "warm." Never-say: "AI-powered" (chuckles — the irony is not lost). File this and start. **Time: 110 seconds. Feeling: authoritative, mild SaaS friction on the hours field.**

**Magic moment.** Score counts to 41. Ring draws around it. Fraunces line types: *"We received your Brief. We're reading your homepage right now."* Evidence Card #1 appears — Schema Doctor: "3 schema errors on /pricing — fixing now." Crew at Work strip with 8 monograms (Build tier) pulses on left-to-right. **Feeling: this thing is actually doing work in front of me.** He doesn't click anything. He watches for 40 seconds. The Fraunces line rotates: *"Schema Doctor is fixing 3 errors on /pricing."* Then *"Citation Fixer drafted 11 FAQ entries — they're in your Inbox."* The /inbox dot pulses amber 90 seconds in. He clicks it. **Activated.**

### The 3 moments that matter most for Marcus
- **Trust established:** Industry field showing "B2B SaaS — developer tooling, 92% confident" in Step 1. Plumber DNA absent from line one. He relaxed from that pixel forward.
- **Friction peak:** Step 4 hours field. A two-second hesitation — *"why is a SaaS being asked for hours?"* — that the helper text rescues but doesn't eliminate. If the helper text were missing, this is where he closes the tab and Slacks Aria "skip Beamix, this isn't built for us."
- **Delight unlocked:** The signed Brief on cream paper, with three correctly-named competitors and a chip he could click to swap one out. This is the moment "tool" became "crew" in his head.

### Marcus's verdict
**Activated. Forwarding to Aria for trust signoff before he lets Beamix touch production credentials, but he's continuing in the product in parallel.** Deciding factor: Step 1's confidence indicator + Step 3's accurate competitor naming. Beamix did not waste his morning. He's willing to give it the rest of the week.

### Marcus's 3 specific change requests
1. **Step 4, Field 1 (Hours): for SaaS path, change the label from "WHEN ARE YOU OPEN?" to "SUPPORT HOURS (HUMAN RESPONSE)"** and reorder it below Services. The current placement makes SaaS founders think for a half-second that they're being onboarded as a local business. Half-seconds compound.
2. **Step 2: add a "Verified" line below the snippet panel that polls every 30s for tag presence and renders ✓ when detected.** The verification check panel is in the v1.1 spec but the success state is buried; surface it as a top-line confirmation: "We've detected your tags on /pricing. Attribution is live." That single line is a procurement-grade trust artifact.
3. **Step 3: add a single ghost link below the Brief: "Forward this to your CTO for review →"** that generates a magic-link version of the signed Brief PDF. Marcus is not the only buyer; Aria is. Don't make him screenshot.

---

## Dani walks through Beamix onboarding

### The setup
Dani runs a Tel Aviv coffee roaster — two retail locations on Dizengoff and in Florentin, plus a Shopify store at $400K ARR. He saw a Beamix Instagram ad in Hebrew (a Framer landing page he scrolled past three times before tapping). Ran the free scan on his Shopify URL at 22:30 after closing the shop. Score: 38. Paid for Discover ($79) on his phone. He's back the next morning between the espresso machine and the 8am rush. He has six minutes before customers arrive. **He will quit if anything is in English-only or asks more than four questions.**

### Step-by-step internal monologue

**Onboarding/1 in Hebrew.** *"רגע — זה בעברית. טוב."* The page chrome flipped to RTL because his browser locale is `he-IL`. Step 1 dot, top-left. *"אישור על העסק שלך. כן, זה אני."* Website pre-filled. Business name pre-filled "קלייה תל אביב". Industry: **"E-commerce — DTC consumer goods" with a needs-you amber dot, "73% confident"** + a "Change vertical" link. *"Hmm, אבל אני גם חנות פיזית."* He clicks the link. The popover shows the 12 verticals. He sees "Local services — restaurants & venues" with a Soon pill. *"זה לא ממש הקטגוריה שלי גם."* He goes back to E-commerce. Field 4 reads "WHERE DO YOU SHIP?" — pre-filled "ישראל." *"OK, מספיק. ממשיכים."* **Time: 22 seconds. Feeling: skeptical-but-fast. The Hebrew is a relief; the vertical mismatch is a small splinter.**

**Step 2 (E-comm path — Twilio numbers).** *"מספרי טלפון? אני לא צריך מספרי טלפון. אני שופיפיי."* He sees three Israeli numbers fade in: +972-3-XXX-XXXX, +972-3-XXX-XXXX, +972-3-XXX-XXXX. The helper line: *"כשלקוח מתקשר אחרי שמצא אותך ב-ChatGPT או Perplexity, אנחנו מייחסים את השיחה."* *"אבל הלקוחות שלי לא מתקשרים — הם קונים אונליין."* He looks for "Skip for now" — finds it, ghost button to the left of "Issue & Continue." Clicks it. *"אם זה היה חוסם אותי הייתי הולך."* **Time: 18 seconds. Feeling: mildly annoyed. The path is wrong for an e-commerce-only seller. Skip rescues him.**

**Step 3 (Brief on cream).** Background goes cream. *"זה נראה אחר. יותר נחמד."* He reads the Hebrew Brief: four sentences in Fraunces (Hebrew falls back to Heebo or Assistant; the editorial register holds). *"Beamix ממליצה להתמקד בשאלות 'where to buy specialty coffee in Tel Aviv' ב-ChatGPT ו-Perplexity, שם לקוחות שואלים יותר על איכות הפולים מאשר על מחיר. אין לך schema של מוצר באתר; נוסיף. שלושה מתחרים — Cofix, נחמד קפה, ופלטפורם — מוזכרים יותר ממך בשאילתות האלו; נגיב עם תוכן חוויית-טעם תחת השם שלך. אל תשני את הטון של המותג בלי לשאול."* *"רגע, אבל אני לא מתחרה ישירות עם Cofix. הם רשת קפה זולה."* He clicks the `competitors` chip. Removes Cofix. Adds "Caffeine Lab." The chip collapses. *"בסדר, יותר נכון."* He clicks Approve. The Seal stamps. **Time: 95 seconds — most of it spent reading.** **Feeling: surprised that they got it 80% right; mildly delighted by being able to fix the wrong competitor.**

**Step 4 (Truth File).** White paper again. *"שוב טופס."* Hours: pre-filled "Sun-Thu 7-19, Fri 7-15, Sat closed" from his Shopify schema. *"זה נכון."* Services: pre-filled "Light roast, medium roast, dark roast, espresso blend, single-origin Ethiopia, single-origin Brazil" — six items. He adds "subscription box." Service areas: pre-filled "Israel, ships to EU." Three claims: empty. *"שלוש טענות. בסדר. 'Roasted weekly, never older than 7 days.' 'Direct relationships with farmers in Ethiopia and Brazil.' '15 שנה בתל אביב.'"* Brand voice: "warm," "honest," "Israeli." Never-say: skips. **Time: 95 seconds.** **Feeling: tired but done.**

**Magic moment.** Score 38. Ring draws. Fraunces line in Hebrew: *"קיבלנו את הבריף שלך. אנחנו קוראים את האתר עכשיו."* Evidence Card #1: Schema Doctor — "Adding Product schema to 14 product pages." Crew at Work strip: 3 monograms (Discover tier). He stares for 8 seconds. **Customers walk in.** He closes the laptop. **Activated, but he hasn't seen the Inbox yet.**

### The 3 moments that matter most for Dani
- **Trust established:** Hebrew RTL working from line one. If Step 1 had rendered in English his abandonment was 90% certain. The locale-aware chrome was the load-bearing trust signal.
- **Friction peak:** Step 2 issuing him three Israeli phone numbers when he's an e-commerce seller. The Skip button rescues him but the moment is wasted attention. **For E-comm path, Step 2 should default to UTM/checkout-tag ceremony, not Twilio.** The v1.1 spec says it does for SaaS but treats E-comm as Twilio-first; that's wrong for online-only e-comm.
- **Delight unlocked:** Editing the wrong competitor chip in Step 3. The 200ms feedback loop on a Hebrew chip click felt premium. He told two staff about it later.

### Dani's verdict
**Activated, but at risk.** Dani comes back to /home that afternoon and skims for 90 seconds, sees the Schema Doctor finished a fix, smiles. If by Monday he doesn't have one customer review or one citation he can show his wife, he downgrades to "I'll cancel after the trial." Deciding factor for activation: the Hebrew + the chip-edit on competitors. Risk factor for retention: needs a visible win in week 1.

### Dani's 3 specific change requests
1. **E-comm path, Step 2: default to UTM tag ceremony with Shopify-specific snippet, not Twilio.** Online-only e-commerce sellers don't take phone calls. Offer Twilio as a secondary option *"if you also have retail locations"* with one click. Don't issue numbers by default.
2. **Step 3: add one Hebrew-native sentence template in the chip vocabulary —** something like *"Don't translate idioms literally"* or *"Keep the Israeli warmth in English content"*. Right now the Brief reads like it was translated from English-first prose. A Hebrew-native voice constraint chip would tell Israeli customers *"this product was built with us in mind, not as an export."*
3. **Step 4, Field 4 (Three claims): change required count from 3 to "at least 1, up to 5."** Dani had to type three because the validator demands three. The third one ("15 שנה בתל אביב") was honest but added nothing the first two didn't already say. Padding undermines the field's purpose. Let confident operators stop at one strong claim.

---

## Yossi walks through Beamix onboarding

### The setup
Yossi runs a 12-client digital agency in Herzliya — five B2B SaaS, three e-commerce DTC brands, two restaurant groups, one law firm, one real-estate developer. He bought Beamix Scale ($499) yesterday after a friend at another agency told him "this might replace what we pay $2K/mo to a contractor for." He has 90 minutes blocked in his calendar this morning to onboard all 12 clients. **If a single client takes more than 8 minutes he doesn't finish today, and tomorrow is meetings.** He is the highest-LTV customer Beamix will see in MVP and the most likely to churn at month 2 if onboarding has any cumulative friction.

### Step-by-step internal monologue

**Onboarding/1 (client #1, B2B SaaS).** Speed-runs Step 1. URL pre-filled. Industry "B2B SaaS — developer tooling," 89% confident. *"OK, fine."* HQ field: types "TLV" — Continue. **Time: 9 seconds.** Step 2 SaaS UTM ceremony. He doesn't read; he's seen this pattern before in other tools. Continue. **Time: 12 seconds.** Step 3 Brief — he reads in 20 seconds, edits zero chips, signs. Seal stamps. *"OK that's a nice flourish but it costs me 2.5 seconds twelve times — that's 30 seconds of stamps I didn't ask for."* Step 4 Truth File — pre-fill from scan covers hours, services, service areas. He fills three claims from the client's About page (open in another tab). Brand voice: copies from the client's tone-of-voice doc. **Time: 4 minutes total for client 1.**

**Client #2 onwards.** Same flow. Same Seal-draw. Same Fraunces line typing. *"I cannot watch the 7-second magic-moment cinema twelve times."* By client 4 he's tabbed out to Slack while the cinema runs. By client 6 he realizes he can't skip the ceremony — there's no "I've done this before, just start" mode. By client 8 he's irritated. **Cumulative time at client 8: 40 minutes.** He's behind schedule.

**Client #5 (Israeli restaurant chain).** The vertical classifier puts them in "E-commerce — DTC consumer goods" at 67% confidence. *"Wrong. Restaurants."* He clicks Change vertical. The popover shows "Hospitality — restaurants & venues" with a **Soon** pill. *"זה הקטגוריה שלהם, אבל ה-crew לא קיים? אז מה אני אמור לעשות?"* He clicks it anyway — it falls through to "Other" with the descriptor pre-filled "Hospitality — restaurants & venues." Inline message: *"Beamix will use its generic playbook for now and graduate you when the {vertical} crew lands."* *"OK, אבל אני משלם $499 בשביל לקוחות שיקבלו playbook גנרי? זה מודיע לי שהם לא מוכנים בשבילי."* **Friction peak.** He doesn't quit, but he files a mental note: tell my friend the agency tool isn't ready for restaurant clients.

**Client #11 (the law firm).** "Coming Soon" again. Fall-through to Other. He's now done this three times. *"4 out of 12 of my clients are 'Coming Soon' verticals. I bought Scale tier and 33% of my book is on the generic playbook."* He finishes the 12th client at the 105-minute mark. **15 minutes over budget.**

**Multi-client switcher (post-onboarding).** He lands on /home for client 12. Looks for a workspace switcher. Finds it — top-left, dropdown showing all 12 client names. *"OK, that works. אבל איך אני רואה את כל הלקוחות במבט אחד?"* No agency dashboard. No multi-client overview. **Per the v1.1 spec, multi-domain switcher is post-MVP and Yossi onboards each domain via abbreviated 2-step flow on subsequent domains — but he didn't get the abbreviated flow because each "client" is a separate Scale account, not additional domains on one account.** He's been onboarding through the full 4-step flow 12 times. *"זה אסון."*

### The 3 moments that matter most for Yossi
- **Trust established:** Step 3 chip-editing of competitors on client 1. He saw the Brief was specific to that client's positioning, not generic. *"OK, this thing read the site."*
- **Friction peak:** The 7-second magic-moment cinema fires twelve times. The Seal-draw fires twelve times. Together they cost 40+ seconds of un-skippable ceremony per client. **Cumulative ceremony tax: ~8 minutes across 12 clients.** Add the 4 "Coming Soon" verticals burning trust on every restaurant/law/real-estate client.
- **Delight unlocked:** None at scale. The first Seal-draw is delightful; the twelfth is friction. There is no agency-mode delight moment in the current flow — no "you onboarded 12 clients in 90 minutes, here's the agency overview" cinema. The product treats him like 12 separate Marcuses.

### Yossi's verdict
**Activated under duress. At highest churn risk of any persona.** He'll run Beamix for a month, evaluate ROI per client, and either consolidate to 6 high-leverage clients or churn entirely. Deciding factor: whether the per-client weekly digest produces visible wins for the 8 verticals that *are* supported. The 4 "Coming Soon" clients are already mentally on the chopping block.

### Yossi's 3 specific change requests
1. **Add an "agency mode" toggle at signup that compresses the per-client onboarding to 90 seconds.** Skip the Step 3 Seal-draw ceremony entirely after client 1 (replace with a `BRIEF · v1 · SIGNED` static state on commit — same artifact, no animation). Skip the 7-second magic-moment cinema after client 1. Trust the agency operator: they've seen the ceremony, they don't need it twelve times.
2. **Build a real multi-client dashboard before MVP+30, not "post-MVP."** Top-level view: 12 client names, current AI-search score per client, last week's delta, alerts requiring attention. Without this, Beamix is 12 separate products glued together by a workspace switcher — not an agency tool.
3. **Step 1 vertical popover: when an agency hits "Coming Soon" for 3+ clients, surface a different message:** *"You manage clients in 4 verticals we don't have specialist crews for yet. We'll prioritize their roadmap based on agency demand. Tell us which to ship first."* Turn the friction into market intelligence + a commitment. Right now the "Coming Soon" pills make Yossi feel like he over-bought the tier.

---

## Aria reviews what Marcus forwarded

Aria is Marcus's hidden CTO co-founder at Acme. She did not go through onboarding personally. Marcus screenshotted the signed Brief + Seal at 7:48am Tuesday and Slacked: *"thoughts?"* with two PNGs and a link to `/security`. Aria opens Slack at 11:12am between her Linear standup and a Postgres incident review. She has 6 minutes.

### The 6-second read
Cream paper. Fraunces serif body. A six-point star Seal in brand-blue, hand-stamped, with the customer's hash-seeded micro-jitter. Geist Mono header line: `BRIEF · v1 · SIGNED Apr 28, 2026 — 7:48`. Signature line *"— Beamix"* in Fraunces italic 22px. *"OK — that's the right register. That's not a Loom-walkthrough company."* The cream paper + dateline + signature combo is the same fingerprint she sees on Stripe Press, Anthropic /trust, Linear /security, Vercel /trust. **First read: this vendor pretends to be an adult.** Second tell: the signature is *"— Beamix"* not *"— your crew"* or *"— the Beamix team."* Singular voice, single accountability surface. *"They've decided who signs. Good."* Third tell: the date and time are precise. Not "May 2026." Not "Q2." A specific minute. **That's a procurement signal.** She moves to read the body.

### The 60-second skim
She reads the four-sentence Brief. Names three competitors correctly (LaunchDarkly, Statsig, Flagsmith — Marcus replaced Unleash). Names two engines (Claude, ChatGPT). Names one schema gap (product-category schema on homepage). One voice constraint (*"Don't change your brand voice without asking"*). *"Specific. Not 'we'll improve your visibility.' Named entities. Named gaps. The chip-architecture is doing real work."* She notes the absence of marketing copy. No "AI-powered." No "leveraging machine learning." The Brief reads like a memo from a competent contractor's first week. **Trust signal: the prose register matches the visual register.** Mismatch would have been the kill shot — cream paper + buzzword body would have read as cosplay.

She switches to the `/security` link Marcus included. 11 sections, cream paper, dateline, six-stat ribbon. She runs the 60-second procurement skim — sub-processors table present (good), encryption section names AES-256 + TLS 1.3 (good but mode-of-operation not specified — first gap), no SOC 2 hero badge (either honest or a red flag), no published DPA URL (gap). **She has 7 procurement gaps in 60 seconds.** None are deal-breakers if Trust Center additions land by month-end. All are deal-breakers if hand-waved.

### The 6-minute deep read
She zooms into the Seal. The hand-stamped six-point star has a roughness signature. *"Rough.js with a customer-hash seed — every customer's seal is unique. That's a craft detail that costs nothing to fake but expensive to fake well. They didn't fake it."* She zooms into the typography. Fraunces 22px on cream, 40px line-height, opsz 144 — the optical-size axis is being used correctly for body editorial. *"Designer with taste. Not a $25/hr Fiverr Brief generator."* She checks the chip-architecture by reading the four sentences: each sentence has 2-4 editable spans, and the spans correspond to entities Marcus could have changed in 5 seconds. *"This isn't a generated artifact pretending to be authored. This is an authored artifact with surgical edit points."*

She opens the screenshot of the Truth File summary Marcus included. Hours, services, service areas, 3 claims, 3 voice words, never-say. **The structure is right.** The 3-claims field is a load-bearing trust mechanism: every agent output gets validated against those claims pre-publication. She's seen this pattern in compliance-aware platforms (it's how Anthropic's content policies cascade in their product surfaces). *"They've encoded the customer's facts into a structured object that downstream agents check against. That's the difference between a wrapper and a product."*

The cryptographic-primitive paragraph in `/security` §9 is the moment of truth. She reads it twice. HMAC-SHA-256 named correctly. 60-second TTL named. Hash-binding named. "There is no `publish()` API that bypasses this" architectural commitment. **70% there.** Missing: HMAC key storage location (KMS vs Vault vs env var?), token format choice (JWT vs custom envelope — JWT alg=none is the famous foot-gun), failure mode (closed vs open), static analysis tool (named or theatre?). *"Close enough not to block. Specific enough to ask three questions about."*

### Does she trust this?
**Conditionally yes.** The visual register is procurement-grade. The Brief language is specific, not generic. The Seal craft is real, not cosplay. The signature voice is single (Model B holds). The Truth File structure is load-bearing. The /security page has the right architecture and 7 gaps, all fixable.

**What builds confidence:**
- Cream-paper-with-dateline editorial register (Stripe Press fingerprint)
- Specific minute-precision signing timestamp
- Singular *"— Beamix"* signature (not "your crew")
- Hash-seeded Seal craft (per-customer micro-jitter)
- Fraunces 22px with opsz 144 (optical-size axis used correctly)
- Specific competitors named in Brief (not "industry leaders")
- HMAC-SHA-256 + 60-second TTL + hash-binding + "no `publish()` API that bypasses" in /security §9
- Sub-processor table with subscribe-to-changes link
- DSAR section wired to real endpoints (claimed)

**What breaks confidence:**
- No published DPA URL
- No SOC 2 / ISO 27001 / Trust Center section
- No `security.txt` at `/.well-known/security.txt`
- No bug-bounty
- AES mode of operation unspecified (CBC? GCM? CTR?)
- HMAC key storage + rotation cadence not in the prose paragraph
- No controller/processor/joint-controller column in sub-processor table
- No employee-access-controls section
- No SDLC / supply-chain section
- No business continuity / RTO-RPO numbers
- Token format (JWT vs custom envelope) not named

### Aria's Slack reply to Marcus (verbatim, 117 words)
> the visual register is right — cream paper, dated signature, singular voice, hash-seeded seal. they're pretending to be adults and the prose backs it up. brief is specific (named the right 3 competitors, named the schema gap). truth file structure is load-bearing — that 3-claims field is how they validate output pre-publish.
>
> 7 procurement gaps on /security: no published DPA, no SOC2/trust center, no security.txt, no bug bounty, AES mode unspecified, HMAC key storage missing from §9 prose, no controller/processor column on subprocessors. fixable.
>
> proceed to Build tier with three asks: published DPA, named SOC2 timeline + auditor, AES-mode + HMAC-key-storage spelled out. don't give them prod credentials til the DPA lands. — A

---

## Cross-persona patterns

### Friction patterns common across multiple personas
1. **The 7-second magic-moment cinema is un-skippable.** Marcus tolerates it once, Dani tolerates it once, Yossi has to watch it twelve times. **Add a ceremony-skip mode** triggered by agency-mode signup or by a "I've done this before" affordance.
2. **Step 4 hours field has cognitive friction for SaaS + e-commerce-only sellers.** Marcus stutters; Dani would stutter if she didn't have retail locations. The label needs to be vertical-conditional ("Support hours" for SaaS, "Customer-service hours" for online-only e-comm, "Open hours" for hospitality/services) — same pattern as Field 4 in Step 1.
3. **"Coming Soon" verticals are a trust splinter for any persona who lands on one.** For Yossi (4 of 12 clients), it's a cumulative trust collapse. The fall-through copy needs to convert friction into commitment ("we'll prioritize based on demand — tell us which") instead of an apology.

### Moments that work for everyone
1. **Step 1's vertical-aware confidence indicator.** Marcus relaxed at "92% confident." Dani saw "73%, change us if we got it wrong" and trusted the honesty. Yossi sped through 8 of 12 with high-confidence classifications. Aria approved the architectural decision implicitly. **This is the load-bearing trust moment of onboarding** — getting it right made everything downstream possible.
2. **The Seal + signature on cream paper.** Marcus screenshot-and-forward. Dani told staff. Yossi tolerated it 12 times without quitting. Aria approved it on first sight. **The artifact register is doing the trust-installation work the prose alone cannot do.**

### Personas at greatest abandonment risk
1. **Yossi (highest LTV, highest churn risk).** Cumulative ceremony tax + 4-of-12 unsupported verticals + no agency dashboard = a 30-day evaluation window followed by either consolidation or churn. **Without an agency mode and a multi-client dashboard before MVP+30, Yossi churns at month 2.** He represents the single highest-revenue retention question in MVP.
2. **Dani (middle LTV, retention-fragile).** Activates because Hebrew works and the Brief was 80% right. Retains only if week-1 produces a visible win — one citation, one review, one customer he can show his wife. **The /home rotation must surface his first concrete win within 7 days or he downgrades the cancel decision from "maybe" to "yes."**
