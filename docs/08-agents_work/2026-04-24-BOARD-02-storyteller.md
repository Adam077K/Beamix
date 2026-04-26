# Board Seat 2 — The Storyteller Critique
**Reviewer persona:** Duolingo / Pixar / Airbnb / Mailchimp / Slack-Slackbot story-first school
**Reviewing:** `2026-04-24-DESIGN-DIRECTION-v2.md` (651 lines) and `2026-04-24-R2-research-companion-character.md` (367 lines)
**Stance:** v2 is a well-engineered cage around the thing Beamix actually needs. The cage is called "anti-Clippy discipline." The thing it's preventing is the reason non-technical SMB owners would fall in love with this product.
**Warning:** I am going to fight. That is my job at this table. If I hedged, you'd have hired someone else.

---

## 1. WHAT V2 GETS RIGHT

Let me start by acknowledging — because I'm about to attack the rest — that v2 has genuinely excellent bones. I don't want to burn down a house I want to add rooms to.

**The thesis is correct.** v2 Line 8: "the interface is a stage where agents perform work the user can observe, not a dashboard where the user must interpret data." This is the whole game for non-technical SMBs. Every competitor sells dashboards. Beamix sells *watching someone competent do the work*. That framing is a 10x positioning choice, and v2 earns it.

**The 7-engine courier metaphor is brilliant.** The frame-by-frame Scan Storyboard (v2 §Frames 1-8, lines 140-162) is the single best thing in the document. The pivot from "character walking through the site" to "courier carrying the site to each model" (v2 line 138) is an actual piece of design thinking. Most design documents don't contain a single idea of this quality. v2 contains at least this one.

**The Stage as full-page modal is correct.** v2 line 166 — "the user should not be able to scroll away during the 30-second flow." This is Superhuman-level confidence. You are saying *this moment is the product*. Good. Hold that line.

**Gaze-not-glow (v2 Rule 4, line 51) is a genuine invention.** Separating the companion from the action surface is smarter than anything Copilot or Clippy ever did. When I attack later in Section 2, I'm not attacking this rule. Keep it.

**Completion Settle (signature motion #5, line 230).** The micro-bounce + border flash + "Done. Your FAQ schema is ready to review." is the right emotional register for an SMB at their desk on a Tuesday.

**The First Scan Reveal without a signup gate (v2 Open Question #3, line 632).** Correct. This is Superhuman's "aha before ask" playbook. It is the single highest-conversion decision in the document. Do not flinch on this.

**The anti-Clippy discipline, at its core, is earned.** v2's Rule 12 "five hard nevers" (line 98) exists because Clippy really did fail for those reasons. I will argue below that v2 over-corrected — but the starting point is correct. A mouth that auto-speaks unsolicited IS the Clippy failure. v2 is not wrong to fear it. v2 is wrong to conclude the answer is "no mouth at all."

Now — the attack.

---

## 2. WHAT V2 GETS WRONG (attack)

### Attack 1 — "No mouth, no arms, no body" is designer fear, not design judgment.

v2 line 103 ("the face emotes; it does not perform") reads like a principle. It is not a principle. It is a defense crouch. The argument v2 makes is: *Clippy had arms, Clippy failed, therefore arms cause failure.* That is not how causation works. **Clippy failed because of autonomy, not anatomy.** Clippy's arms were not the problem. Clippy's *timing*, *persistence*, and *non-dismissibility* were the problem — and v2 has already solved all three (Rules 7, 8, 11, 12). Having solved the actual failure modes, v2 then *also* amputates the character's expressive range as if double-insurance. It isn't double-insurance. It's loss.

Duo — the Duolingo owl — has arms, legs, eyes that roll, tears that stream, a beak that opens. Duolingo is the most successful character-driven consumer app of the last decade. 100M+ active users. An IPO. A viral TikTok strategy. Their character has *a body*. If arms-and-a-mouth caused failure, Duolingo would be dead. Duolingo is not dead. ([Duolingo company info](https://www.duolingo.com/info); [NPR on Duo's revival](https://www.npr.org/2025/02/26/nx-s1-5309785/duolingo-owl-mascot-lives))

v2 is citing Notion AI's face-only character as cover (line 51, Buck case study). But Notion AI's character *lives inside a specific AI panel for 3 seconds at a time.* Beamix's companion is persistent across the entire authenticated shell, for hours a day. Those are different design problems. You can't borrow the ergonomic choice for a 3-second micro-moment and apply it to a 4-hour daily presence and claim you've solved anything.

**Prediction:** v2 Beamie as specified will read as a polished sticker. Users will describe it as "cute" for one week and then stop noticing it. The product will feel less inhabited, not more.

### Attack 2 — "One character, not a cast" throws away your biggest unspoken brand asset.

Beamix has **11 agents** (CLAUDE.md line: "11 MVP-1 + 1 MVP-2 GEO-specialized agents"). Eleven. That is the entire product. An SMB owner is buying *an agency-in-a-box* — a team of specialists that act on their behalf. And v2 proposes to hide that entire team behind ONE silver-gray face with no mouth. (v2 line 642: "No cast of characters. One Beamie, that's it.")

This is a strategic miscommunication of what the user is buying.

Slack understood this. Slackbot is not alone — Slack's surface is populated with *app-specific bots*, each with their own avatar, voice, and purpose. ([Slack — Slackbot AI agent announcement](https://slack.com/blog/news/slackbot-context-aware-ai-agent-for-work)) Mailchimp has Freddie the chimp, but Mailchimp *also* has Omnivore, their fraud-detection engine, a distinct product identity. ([Mailchimp Freddie history](https://mailchimp.com/about/brand-assets/); Mailchimp's "Omnivore" naming convention for internal systems is well-documented in their engineering posts.) Duolingo does not have Duo alone — they have Lily, Bea, Zari, Junior, Lin, Falstaff, Vikram, and the rest of the cast. ([Duolingo character roster](https://duoplanet.com/duolingo-character-names/)) Each character represents a *role* — the grumpy teen, the enthusiastic kid, the elder scholar. Users form attachments to specific characters. The cast *is* the product's emotional topography.

v2's counter-argument (via R2 research, lines 183-186): "Too playful for SMBs. Cognitive overhead. Gendered risk." All three are weak.

- "Too playful" — who said your SMB users want *less* warmth than a Duolingo learner? The R2 research just *asserts* this without data. An exhausted plumbing-company owner at 10pm on a Tuesday wants *more* warmth than a 16-year-old doing a Spanish drill, not less.
- "Cognitive overhead" — a cast of 3-5 is less overhead than remembering which of your 11 agents does what. Characters are a *memory aid*, not a tax.
- "Gendered risk" — Clippy's gender problem was that 10 of 12 characters were male. The answer is "design a balanced cast," not "design one genderless abstraction." Genderless abstractions are a refusal to take a position, not a solution to a position.

**Prediction:** If you ship one Beamie, your Inbox will read as 11 indistinguishable job-cards. If you ship a cast, your Inbox will read as *a team that worked for you today.* The second version is worth 3x the MRR.

### Attack 3 — "Silent by default" conflates "not obnoxious" with "not speaking."

v2 Rule 6 (line 61) and Anti-Clippy Clause 1 (line 99): "Never auto-speak. Text only on user click. Never." Never is a long time.

The reason Clippy failed at auto-speech was that Clippy *interrupted*, *repeated*, and *asked questions the user hadn't consented to.* Not because it spoke. **Duolingo's Duo speaks constantly and is adored.** Every push notification is Duo's voice. The streak-loss dialogue is Duo begging. Duolingo went *more* anthropomorphic in 2024-2025 (the "Passion of the Duo" campaign, the Owl's fake-death marketing stunt), not less, and their engagement *grew*. ([NPR on Duolingo mascot strategy, 2025](https://www.npr.org/2025/02/26/nx-s1-5309785/duolingo-owl-mascot-lives))

Slackbot speaks unprompted — it nudges users about reminders, it interjects greetings, it DM's users on their first day. Slack has not failed. Mailchimp's Freddie waves and high-fives through the dashboard on first login. Intercom's Operator drops in mid-flow to offer help. ([Intercom — Resolution Bot / Operator](https://www.intercom.com/learning-center/resolution-bot)) *None of these products were killed by letting their character talk.* They were made by it.

v2's rule is: companion never speaks except via a 320px text field the user clicks to open (Rule 6, line 61). For Israeli SMB users who already fear AI tools, who need Hebrew reassurance ("סרקתי את האתר שלך. הנה מה שמצאתי.") at exactly the moment the scan completes — the product's refusal to say a single sentence out loud is an abdication. That's not discipline. That's cowardice disguised as restraint.

**Prediction:** v2 Beamie will feel mute. Mute AI in 2026 is conspicuously mute. Your competitors will let *their* characters talk, and Beamix will read as the one that's holding back.

### Attack 4 — "Floats in UI, no world, no environment" caps the product's imagination at Linear's ceiling.

v2 line 26: "Z-layer: above page content, below modals and overlays." Beamie is a bottom-right sticker. That's it. There is no world. No map. No workshop. No neighborhood. No *place*.

Duolingo has the Learning Path — a winding map that Duo walks down, with landmarks, shortcuts, and a legendary league climb. The map is not decoration. It is *navigation that feels like a place.* ([Duolingo Learning Path](https://blog.duolingo.com/learning-path/)) Pixar's Pizza Planet truck lives in *a world.* Airbnb's Bélo mark implies *a journey to somewhere.* Even Arc Browser — which v2 cites as inspiration (R2 line 106) — gives tabs *spatial identity* via spaces. ([Arc Spaces](https://arc.net/))

What if Beamix had **"The Workshop"** — a top-down view of the user's AI-presence as a small illustrated town or studio? Each of the 11 agents has a bench, a station, a workroom. When an agent runs, you see them at their bench. When the scan happens, you see the courier (whatever we call them) leave the workshop, carry the site-card to the 7 model-villages on the horizon, come back. When a recommendation lands in the Inbox, you see it get placed on a shelf labeled "For Adam to review."

This is not a metaphor-grab. This is the *difference between a product that feels like a tab and a product that feels like a place your business lives.* The former gets closed when the trial ends. The latter doesn't.

v2 explicitly rejects this (line 643: "No 3D. Flat Rive state-machine animation only."). That's a technology decision disguised as a design decision. A flat 2D illustrated world is not 3D. Animal Crossing is not 3D. Duolingo's map is not 3D. You can have a *place* without a Three.js budget.

**Prediction:** v2's flat-in-UI companion will feel like an assistant. A world + cast would feel like *a business partner who has a shop you visit.* The second framing is worth the entire retention curve.

### Attack 5 — "First Scan Reveal" is the best idea in v2 and v2 under-uses it by 10x.

v2 Part 4 (line 502) describes the Reveal as a 30-second animated sequence that ends with a bottom-bar: "Save your results and let our agents fix this — create a free account." That's it. A CTA bar.

You have just delivered the most emotionally charged moment in the entire customer journey — the user has watched a character carry their website to 7 AI models, watched each one think, watched the score materialize — and your conclusion is *a CTA*? Are you insane?

Duolingo turned "you missed a streak" into a cultural event. ([Duolingo streak-loss mechanics](https://blog.duolingo.com/streaks/)) Spotify Wrapped turned your listening history into the most-shared content on the internet every December. ([Spotify Wrapped 2024](https://newsroom.spotify.com/2024-12-04/your-2024-wrapped-is-here/)) Strava turned your Sunday run into a shareable artifact. ([Strava Monthly Summary](https://support.strava.com/hc/en-us/articles/115000962764)) These products understood that **the reveal moment is the marketing budget.**

Beamix's First Scan Reveal should produce a shareable artifact the user *wants* to send to their business partner. Something like:

- A **Scan Card** — a stylized image showing "yoursite.com scored 34/100 across 7 AI engines" with the engine pills, the character, and a "Scan it yourself at beamix.tech" attribution. Downloadable PNG, sharable URL, pinnable to social.
- A **Scan Replay link** — a public URL that replays the full 30-second animation for a specific scan. User sends to partner. Partner watches, sees Beamix, runs their own scan.
- A **"Compared to industry" stat** — "34/100 — 71% of plumbing companies score lower than you. Perplexity mentions you, ChatGPT doesn't. Here's why."
- A **video replay** — same replay link, but as a downloadable 30-second MP4 for LinkedIn/WhatsApp.

The Duolingo streak-loss model applies directly: **the user's scan score, good or bad, is emotionally charged data.** A bad score ("you rank in 1/7 engines") makes the user want to *share* because misery loves company AND because the shared scan implicitly advertises the tool that diagnosed it. A great score makes the user want to *brag.* Either way, Beamix wins.

v2 proposes literally none of this. The reveal ends with a save-your-results bar. That's a 10x underuse.

**Prediction:** Add one shareable Scan Card to the reveal flow and your free-scan-to-paid conversion will double. Add a public scan-replay URL and your organic acquisition curve bends.

### Attack 6 — "Beamie is genderless, named abstractly" is the most Silicon Valley sentence in v2.

v2 line 26: "Genderless and named abstractly." v2 Open Question 2 (line 630): suggestions are "a shape-based name (no human referent), an abstract name, or leaving it unnamed entirely."

No. This is the exact moment where v2's defense crouch becomes aesthetic.

"Genderless and abstract" was a 2020-era response to 2010-era character failures. It is not a 2026 strategy. *Characters have names and personalities and opinions.* Duo is masculine-coded. Freddie is masculine-coded. Slackbot has no gender but has a distinct voice. The failure of Clippy was not that he was male — it was that 10 of his 12 peers were also male. *Solve the cast composition, not by removing gender, but by designing a balanced cast.*

A shape-based name — "Pulse," "Orbit," "Prism" — is what a Stripe engineering team names an internal tool. It is not what a company whose customer is a 47-year-old Hebrew-speaking plumbing-company owner in Haifa names their helper. That user wants to be greeted by someone *with a name they can remember.* "שלום! קוראים לי [אסף/תמר/...]" lands. "I am Pulse." does not.

**My proposal:** Name the cast. Give them personalities. See Section 3.

### Attack 7 — The 12 Behavior Rules encode *discipline* but do not encode *delight*.

Count them: every one of v2's 12 rules (§ lines 30-105) is a *constraint*. Not one is a *delight trigger*. Rule 1: breathing at 4s. Rule 2: no entrance for returning users. Rule 3: thinking wave. Rule 4: gaze-not-glow. Rule 7: drag. Rule 8: dismiss. Rule 9: three-step tour then silent forever. Rule 11: silence timeout. Rule 12: five "nevers."

Where is "Rule 13: On Friday afternoon, if the user has not run a scan that week, Beamie leans slightly toward the scan button with a slightly tilted expression"?

Where is "Rule 14: On the user's first successful agent run, Beamie does a once-in-the-product-lifetime happy-dance that lasts 2 seconds and will never be seen again"?

Where is "Rule 15: On Hebrew Hanukkah (ט״ו בטבת), Beamie wears a tiny dreidel hat for that week"?

Duolingo has seasonal variations. Slack has Slackbot Easter eggs that have been viral tweet moments for a decade. (Try typing "/give finger" in Slack — the response is an internal joke from the early team.) These are the moments that make a product feel *inhabited* and give users reasons to post screenshots.

v2's framework is all "don't annoy" and zero "surprise and delight." That is an incomplete brief.

### Attack 8 — Hebrew is not mentioned once in v2.

I searched the entire 651-line document. The word "Hebrew" appears zero times. The word "RTL" appears zero times. The word "Israeli" appears zero times. (MEMORY.md explicitly identifies "Israeli businesses (primary) + global" as the target.)

A character who never speaks does not need to be translated. That's the only interpretation that explains this omission. v2's silent-default is convenient for the design team because they don't have to commit to a Hebrew voice. But the commitment is unavoidable — your users ARE Israeli. You're going to have to choose what the character-led microcopy reads like in Hebrew. The deferral is a cost.

And here's the thing: **Hebrew character-led interfaces are rarer than English ones.** If Beamix ships a genuinely warm Hebrew character voice, that's a *moat* against English-only US competitors (AthenaHQ, Profound, Peec AI, etc.). v2 gives up this moat by muting the character in both languages.

### Attack 9 — "No environments per page" means every page feels like the same page.

v2's per-page section (lines 436-499) describes Beamie's behavior on /home, /inbox, /scans, /crew. Beamie "points at" different things in each. But Beamie *looks the same everywhere.* The page backgrounds are identical `#FAFAFA`. The character is a constant.

Compare: Arc Browser's Spaces let you *theme* a space — work vs. personal vs. play — with different colors, different backgrounds, different tabs. You feel like you're in a different place. ([Arc Spaces](https://arc.net/))

What if:
- /home has a *warm morning light* feel — slight gold in the canvas, Beamie's eyes look forward.
- /inbox has a *desk feel* — slightly more saturated backdrop, Beamie positioned near a stack-of-papers illustration.
- /scans has a *workshop feel* — the engine pills ambient-visible in the background, Beamie already positioned toward them.
- /crew has a *control-room feel* — a row of agent-avatars along the top, Beamie in "manager" posture.

This is not a lot of extra production. It's backgrounds and a couple of character positions. The payoff is enormous: **each page feels like a different room, not the same page with different content.**

v2's "one environment, character floats on top" misses this entirely.

### Attack 10 — The R2 research that v2 relied on *chose the minimum-viable companion*, not the maximum-upside one.

Let me quote R2 line 165: "One companion. Not Duolingo's cast model. Reasoning: SMB owners are not teens learning Spanish; a cast adds cognitive load, introduces gendered risk (Clippy's focus-group failure), and dilutes the 'silent professional partner' register."

This is a *risk-minimization recommendation*, not an opportunity-maximization recommendation. R2 was implicitly briefed to answer: "What's the safest character we can ship that won't fail?" R2 was not briefed to answer: "What's the most emotionally resonant character system that would make non-technical SMBs describe Beamix to their friends?" Different brief, different answer.

The R2 confidence levels even tell you this (R2 lines 297-306): the "one character" recommendation is listed as MEDIUM confidence, inferential, not tested. The "silent by default" claim is grounded in Clippy's failure, not in any positive test of silent-vs-speaking. Everything opinionated in R2 is hedged.

Adam — you are being asked to ship the *minimum viable character.* You are a founder, not a PM at a FAANG. Your job is to ship the *maximum upside character* and then trim back if it fails. Ship the cast. Let them talk. Give them a world. Let users love it.

---

## 3. THE CASE FOR A CAST

Here is the roster I'd propose. It is mapped to Beamix's actual 11 agents (per CLAUDE.md + MEMORY.md references). I've consolidated the 11 agents into **5 archetypal characters** — each character represents a *role-family*, not a 1:1 agent. This keeps cognitive load low while giving users a team to root for.

### Character 1 — "Kavan" (כיוון / "direction")
**Agent role:** The strategist / coordinator. Oversees the scan, routes work, presents scores. This is the *face on the homepage*, the one who greets users.

**Personality:** Calm, competent, older-brother / older-sister energy. Gender-balanced in illustration (can be rendered androgynous or with a balanced wardrobe). Speaks first in onboarding. Voice register: "Let me show you what we found."

**Visual register:** 56×56px, warm charcoal body (not silver), blue accent scarf that shifts tone when active. *Has* a mouth — small, mostly closed, but smiles on completion events. Has visible arms (thin, expressive, not cartoony). Think: *a Pixar concept character, not a mascot.*

**Signature behavior:** When a scan completes, Kavan *presents* the score — a small "here-you-go" arm gesture toward the score ring. Lasts 600ms. Never repeats in the same session. This is v2's "Completion Settle" (signature motion #5) but with the character participating, not watching.

### Character 2 — "Fetch" (no Hebrew name — it's the courier, and the courier is supposed to feel slightly foreign, like someone who travels)
**Agent role:** The 7-engine scanner. The one who performs v2's courier choreography in the First Scan Reveal.

**Personality:** Restless, energetic, a little jittery, cheerful. The Hermes / Iris mythological courier register. Always in motion.

**Visual register:** Smaller than Kavan (48×48px), a runner's posture, satchel visible, a tiny badge showing the current engine being visited. *Has a mouth and arms* — the whole point of Fetch is that you see them *carry the site card* with their hands, not abstractly convey it.

**Signature behavior:** *This is v2's Scan Reveal courier.* v2 already has this character implicitly (lines 140-162) — it's just not named or personality-coded. Naming Fetch turns the Scan Reveal from "our mascot runs to engines" to "our courier *Fetch* went to 7 engines for you." That's a massive emotional upgrade for zero engineering cost.

### Character 3 — "Sofer" (סופר / "scribe")
**Agent role:** The content agents. FAQ Builder, Schema Agent, Content Optimizer, Freshness Monitor — anything that writes, edits, or structures content.

**Personality:** Bookish, methodical, slightly perfectionist, warm. The librarian / scholar register. Speaks in complete sentences. Loves nouns.

**Visual register:** Round spectacles, always holding a small scroll or tablet. When writing, a soft glowing quill animates above the scroll.

**Signature behavior:** When an Inbox item is a content artifact (FAQ draft, schema JSON, new page copy), Sofer's icon appears on the item card. When the user *approves* a content item, Sofer performs a small satisfied nod — "and we're done." 400ms animation. This turns approval from a click-button moment into *handing the work back to Sofer, who acknowledges it.*

### Character 4 — "Matza" (מצא / "finds / locates")
**Agent role:** The research and intelligence agents. Competitor Intelligence, Performance Tracker, Link Builder, anything that watches the outside world.

**Personality:** Curious, observant, quiet. The detective / analyst register. Doesn't say much; notices everything. Think: Columbo with a notebook.

**Visual register:** Magnifying glass prop permanently visible in one hand. A small notebook clipped to the belt. Eyes alert, slightly narrowed.

**Signature behavior:** When a competitor update is detected or a ranking shift occurs, Matza's avatar appears *at the top of the page for that notification only*, with a small "look at this" gesture toward the relevant item. Lasts 2 seconds, never repeats. This is v2's "nudge toward Inbox" pattern (Rule 5) but attributed to a specific character the user recognizes.

### Character 5 — "Roni" (רוני / a cheerful unisex name)
**Agent role:** The growth / celebration / progress agents. Not a separate agent in Beamix today — but *represents the user's journey.* Roni shows up when milestones happen.

**Personality:** Warm, celebratory, a little theatrical. The enthusiastic cousin at the wedding. Speaks rarely but memorably.

**Visual register:** Brighter colors, slightly larger than the others, confetti/spark effect available but rare.

**Signature behavior:** Appears *only* on milestone events: first scan complete, first agent run complete, first score improvement, first paid plan upgrade, weekly streak, monthly recap. Roni NEVER appears on routine events. Scarcity is the whole design. This is the Duolingo "mascot appears on a streak-save" moment — rare, therefore emotional.

### Why 5, not 11?

Eleven characters is *too many* — I'll concede that much to the R2 analysis. But 1 is too few. Five maps cleanly to the user's mental model ("my strategist, my scanner, my writer, my analyst, my celebrator") while letting each character *carry a subset of the 11 agents.* The agents are still there (Inbox badges still show `FAQ Builder`, `Schema Agent`, etc.). But the *character* the user feels is one of 5, not a floating silver abstraction.

**Total visual production:** 5 characters × 6 states each (idle, thinking, succeeded, blocked, error, signature) = 30 Rive states. v2's single-Beamie plan is 8 states. This is ~3.75x the production cost. That's real. But it's *one* designer's 4-6 week sprint, not a 6-month budget. For a character system that differentiates you from every English-speaking competitor? That's a no-brainer ROI.

---

## 4. THE CASE FOR PERSONALITY BEYOND A FACE

**Should Kavan (or whatever name replaces "Beamie") have a mouth? YES.**

Here's why the v2 argument is wrong:

**The "face emotes, does not perform" principle (v2 line 103) conflates two different dimensions.** A mouth doesn't mean the character *performs speech.* A mouth is an *expression surface.* Pixar characters have mouths and you trust them instantly — Wall-E's tiny eyes and no-mouth register is iconic, but Wall-E works because he's *surrounded* by characters who do have mouths (EVE, Captain, M-O). A world of only no-mouth characters is uncanny.

**A mouth lets you distinguish:**
- Neutral rest (closed, slightly curved)
- Thinking (slightly open, soft "o" shape — the micro-expression people make when processing)
- Succeeded (small smile, corners up, brief — 300ms)
- Blocked / confused (slight frown, asymmetric)
- Error (downturn, brief)

**Without a mouth, you have to do all this with eyebrows only.** Eyebrows can do thinking (v2's wave). They struggle with the difference between "succeeded" and "error resolved" and "blocked." You end up using color tint to carry the whole load (v2 Rule 10, line 82) — which is exactly what Clippy didn't have and is *still* not enough for an SMB user who's color-blind or working in bright sunlight.

### What a full-expression Kavan looks like (compared to v2 Beamie)

| Dimension | v2 Beamie | Full-expression Kavan |
|---|---|---|
| Face | Eyes, brows, nose only | Eyes, brows, nose, mouth (subtle) |
| Body | None (just a head/blob) | Implied shoulders + arms (abstract, not detailed) |
| Posture | Breathing scale only | Slight lean toward active elements (directional) |
| Hands | None | Occasionally visible (when presenting, when Sofer writes, when Fetch carries) |
| Mouth behavior | N/A | 4 states: closed rest, open thinking, closed smile, asymmetric frown |
| Arm behavior | N/A | Visible only on specific moments: presenting score, handing off work. Never idle-animated. |
| Clippy risk | "Low" per v2 | "Medium" — but mitigated by: never auto-speech, always dismissible, no repetition |

The Clippy-risk delta between v2-Beamie and full-expression Kavan is *tiny* once you've already committed to the other anti-Clippy rules (Rules 7, 8, 9, 11, 12). You are adding 15% risk for 3x expressive range. That's a great trade.

### The world Kavan lives in: "The Workshop"

Here's the sketch. It's the top-level metaphor for the entire product UI.

- **Home = Kavan's desk.** A top-down or 3/4-view illustration of a desk with a monitor showing the score. Kavan's chair is visible. When a scan completes, Kavan is *at the desk* looking at the monitor. On page load, the desk is framed gently, not realistically — it's a *nook*, not a full room.
- **Inbox = a shelf / outbox tray.** Each Inbox item is visually a small card placed on a shelf. Sofer placed the FAQ drafts there. Matza placed the competitor notes. The user walks up to the shelf (UI metaphor: opens the Inbox page) and reviews them.
- **Scans = the courier's gate.** Fetch stands at a small gate. When a scan runs, Fetch literally leaves through the gate, crosses the 7-engine-village skyline, and comes back. The scan IS Fetch's journey.
- **Crew = the team room.** A row of agent-stations. Each of the 5 character-archetypes has a station. Schedules are visible as a calendar on the wall.
- **Settings = the office / filing cabinet.** Kavan's filing cabinet. Bills, plan info, API keys. Paperwork. Boring but important. *No character nudges here* (v2 got this right).

This is not 3D. This is flat 2D illustration with parallax. One illustrator's work, 2-3 weeks. The payoff is that every time an SMB owner opens Beamix, they feel like they're *visiting a small office that works for them* — not logging into another SaaS dashboard.

### Is this too much?

I'll preempt the pushback. "A full illustrated world is too much for MVP." Fine. *Ship a minimal version of it.* Ship Kavan with a mouth and implied shoulders. Ship Fetch for the Scan Reveal. Ship Sofer's icon on content Inbox items. Don't ship the full workshop at launch. But *design for it* — so that the product has a world to grow into, instead of a silver blob to marginally embellish over time.

The strategic question isn't "can we ship all of this in MVP?" The strategic question is "does v2 foreclose this future, or leave it open?" v2 as written *forecloses it* — the "one minimalist Beamie, no mouth, no arms" decision is not a scaffolding. It's a terminus.

---

## 5. THE CASE FOR (CAREFUL) VOICE

v2 bans auto-speech. I propose three *tiers* of voice that together give you character without Clippy risk:

### Tier 1 — Emotive sounds (not speech). Always on (subject to user pref).
- Scan complete: a soft chime (1 note, ~200ms, like Linear's completion sound)
- Agent finishes work: a softer "done" tick
- Error: a gentle down-tone
- No voice. No language. Just tonal signaling.

This is NOT Clippy. This is Slack's message ping. This is Granola's completion chime. Slack, Granola, and Apple Messages all have this and none of them are Clippy. ([Slack notification sounds](https://slack.com/help/articles/201398467-Manage-your-notifications)) It's just ambient audio. v2 has zero sound at all (see v2 table line 83-91, every state shows "Sound: None"). That's an oversight, not a principle.

### Tier 2 — Single-line character speech, user-initiated OR at high-threshold moments.
When the user clicks Kavan, the inline text field (v2 Rule 6) opens. That field already exists. What v2 proposes is dry system text. What I propose:

- First visit: "Hi — I'm Kavan. Want to see how ChatGPT and Claude talk about your business?" (or in Hebrew: "היי, קוראים לי כיוון. תרצה לראות איך ChatGPT וClaude מדברים על העסק שלך?")
- Scan complete: "We scanned 7 AI tools. Here's where you stand."
- New Inbox item: "Sofer finished writing your FAQ. Want a look?"

These are two-sentence max. They're not auto-popped. They're shown inside the existing inline text field that already exists in v2. I am not adding a new surface. I am *adding warmth to the surface v2 already specified.*

### Tier 3 — Milestone speech, rare, special, memorable.
- First scan ever: Kavan says once, "Thanks for trusting us. Let's go find you some answers."
- First successful agent run: "You just shipped your first AI-ready FAQ. That's a big deal."
- Plan upgrade: Roni appears and says "Welcome to Build. We have a lot of work to do — let's get started."

These are the *Duolingo streak* moments. They're rare. They're earned. They're the only place the user ever hears long-form character voice. The scarcity is what makes them memorable.

### In Hebrew?

**Yes. Mandatory.** Your product is Israeli-primary (MEMORY.md). Every piece of character speech needs to be written in Hebrew-native, not translated. This means hiring a Hebrew copywriter for the 12-15 character lines the product needs. Budget: ~$500. ROI: your product feels like it was made for Israelis, not localized into Israeli. That's the difference between trust and suspicion for an Israeli SMB owner.

**When speech is the right channel vs. motion:**
- Motion: for state changes that are frequent (thinking, succeeded, active). Don't speak at users 20x a day.
- Speech: for moments that are infrequent and emotionally loaded (first scan, first approval, first milestone). Speak rarely, land hard.
- Sound: for confirmation of user actions (approve clicked, scan started). Tiny, tonal, always on.

v2 uses exactly one channel: motion. That's under-using the kit.

---

## 6. THE SHAREABLE FIRST SCAN

**This is the section Adam should print out and pin above his desk.**

v2 line 512-514 describes the First Scan Reveal ending with a CTA bar. That's a 10x underuse. Here's the redesign.

### The reveal (unchanged from v2 — this part is good):
8 frames, 30 seconds. Fetch (renamed from generic Beamie) carries the site card to 7 engines. Score materializes. v2's choreography is great.

### The reveal ends — THIS is where v2 stops and I start.

After the score materializes, **the score transforms into a Scan Card.** The Scan Card is a 1:1 shareable artifact:

**Visual layout (4:5 aspect ratio, optimized for social):**
- Top: User's domain in Geist Mono ("yoursite.com")
- Middle: The score ring at large scale — e.g. "34/100" with the color verdict ("Fair" in amber)
- Engine breakdown: 7 pill icons in an arc, each colored by performance. Some green ✓, some red ✗.
- Bottom: One insight, written by the product, in the character's voice: *"ChatGPT mentions you. Claude and Perplexity don't. Fixing your FAQ schema would help."*
- Corner: "Scan yours at beamix.tech" + Beamix logo

**Three share affordances, all optional, all one-click:**

1. **"Copy image"** — downloads the Scan Card as PNG. User can drop it into WhatsApp, LinkedIn, Twitter.
2. **"Share link"** — generates a public URL (e.g., `beamix.tech/scan/abc123`) that *replays the full 30-second Scan Reveal* from cached data. Anyone with the link can watch the animation + see the score card.
3. **"Get your own scan"** — a referral-coded link the user can send to a partner. Their partner can run a free scan. User gets credit if partner signs up.

### Why this is the whole marketing strategy

Duolingo's streak mechanic works because **losing a streak is social loss.** You tell friends. You scream about it on Twitter. Duolingo gets free acquisition from every streak loss because the emotional peak is shared.

Beamix's scan score has the same emotional peak structure:
- **Bad score ("4/100 — you're invisible in AI")** → user shares with their marketing person, their co-founder, their board. "Look at this — we need to fix this." Every share ships Beamix's logo.
- **Good score ("92/100 — you're winning")** → user shares with everyone as a humblebrag. "Even AI tools know us." Every share ships Beamix's logo.
- **Competitive score ("you scored 34, your competitor scored 67")** → user shares with their team to motivate action. Every share ships Beamix's logo.

The share is *not bolted on to the scan.* The share IS the scan's emotional conclusion. The reveal ends with the user wanting to tell someone.

### The Spotify Wrapped / Strava Summary model applied:

- **Scarcity:** One Scan Card per scan. The card has a date. Running a new scan creates a new card.
- **Evolution:** Later scans show the delta — "You improved from 34 → 47 in 3 weeks" — a visual transformation arc across scans.
- **Comparison:** "You scored higher than 62% of businesses in your industry." (Requires aggregate data; available after ~50 scans in the same category.)
- **Attribution:** Every shared card carries beamix.tech attribution. Every replay URL has beamix.tech framing. The viral loop is built-in.

### The Duolingo streak-lost model applied:

If a user runs a scan, gets a bad score, and then *doesn't come back within 7 days* — send them a weekly digest email with the Scan Card embedded. Subject: "Your AI visibility score is still 34. Want to change that?" This is not a new automation — it's the weekly digest cron already planned (CLAUDE.md / sessions references to weekly-digest). The addition is *attaching the Scan Card to the email* so the user sees the visual artifact they've been ignoring. The emotional friction of seeing your own bad score re-presented is the hook. Duolingo's streak-at-risk model, applied to AI visibility.

### What Adam needs to decide

The Scan Card is *one illustration template* + *one dynamic-image API endpoint* + *one share-modal UI.* That's 1-2 weeks of engineering. For 2-5x conversion and organic growth? It's the cheapest viral loop in the document. v2 omits it entirely. That is the single biggest missed opportunity in v2.

---

## 7. V2-MAXIMAL COUNTER-PROPOSAL (full spec)

Here is my counter-proposal. Not a rejection of v2 — an *expansion* of v2. Everything v2 got right stays. I add the warmth.

### 7.1 The Cast
Ship 5 characters at MVP: **Kavan** (strategist, homepage face), **Fetch** (courier, scan reveal), **Sofer** (writer, content inbox items), **Matza** (analyst, competitor/performance items), **Roni** (milestone celebrant, rare).
Each character has 6 Rive states: idle, thinking, succeeded, blocked, error, signature.
Each character has a Hebrew + English name. Personality documented in a one-page character bible per character.

### 7.2 The Lead Character (Kavan) Spec
- Face: eyes, brows, nose, AND mouth. Mouth has 4 expressions: rest, thinking (slight open), succeeded (closed smile), error (asymmetric frown).
- Body: implied shoulders + occasionally visible arms. Arms visible only during "presenting score" and "handing off Inbox item" moments.
- Size: 56×56px at rest; can scale to 80×80px during character-forward moments (first visit, first scan complete).
- Color: warm charcoal body with blue accent. Brighter than v2's "silver-warm." SMB users need warmth, not minimalism.
- Persistent in bottom-right (v2 rule — keep).
- All v2 drag / dismiss / silence-timeout rules apply (keep every anti-Clippy rule).

### 7.3 The World — "The Workshop"
- Each page has a subtle illustrated backdrop, not just a canvas color:
  - /home: Kavan's desk nook (framed softly, 12% opacity over the Canvas color)
  - /inbox: shelf-of-review-items visual
  - /scans: a courier's gate with 7 engine-village silhouettes on the horizon
  - /crew: the team-room with 5 character stations
  - /settings: plain — no illustration (correctly boring)
- Backdrops are static SVG illustrations, 50-150KB each. Loaded per-route.
- Total production: 4 illustrations + character assets. One illustrator, 3-4 weeks.

### 7.4 The Scan Reveal — Expanded
- v2's 8 frames stay exactly as specified.
- NEW: Frame 9 — the Scan Card materializes. Fetch hands the score to Kavan. Kavan presents it. The card appears in frame, downloadable.
- NEW: Scan Card has 3 share affordances: copy image, share link, invite.
- NEW: Each scan produces a public replay URL (no auth required to view).
- NEW: Scan Cards evolve over time — running a second scan shows a delta arc ("34 → 47") in the corner.

### 7.5 Voice — Three Tiers
- Tier 1 (sound): chime on scan complete, tick on agent done, down-tone on error. User can mute in Settings.
- Tier 2 (speech, click-initiated): existing inline text field (v2 Rule 6). Copy is written in character voice, Hebrew + English, by a copywriter.
- Tier 3 (speech, milestone only): Kavan / Roni speak on 6 specific lifetime events. Each line is 1-2 sentences max. Never repeats.

### 7.6 Per-Page Character Behavior (expands v2)
- /home: Kavan is at rest. On first visit, does the 3-step tour (v2 Rule 9). On return visits, *turns head slightly toward the score when the page loads.* Small, unrepeated per session.
- /inbox: When new items arrive, Sofer or Matza's icon appears on the item card (not Kavan). Kavan stays at rest. This *distributes attention* — the Inbox has its OWN characters, Kavan is the house host.
- /scans: Fetch is visible at the courier-gate backdrop. When scan runs, Fetch leaves. Kavan stays at desk.
- /crew: 5 character stations visible. The station of any currently-running character glows. User sees *which team-member is working.*
- /settings: no character. User-initiated only.

### 7.7 The First-Scan-to-Share Flow (end-to-end)
1. User enters URL (public, no auth).
2. Stage opens. Fetch picks up site. 30s Scan Reveal plays.
3. Score materializes. Kavan presents. Scan Card appears.
4. User sees 3 buttons: "Copy image" | "Share link" | "Save & fix this (sign up)"
5. Regardless of choice, Scan Card URL is public. Replay is public. Beamix attribution embedded.
6. If user signs up → Scan Card persists in their account. Future scans produce new Scan Cards. User builds a timeline.
7. If user leaves → 7 days later, digest email arrives with Scan Card + "Your score hasn't changed. Ready to fix it?"

### 7.8 Rive Production Budget
- 5 characters × 6 states = 30 Rive states
- Estimated: 1 Rive-specialist illustrator, 4-6 weeks, ~$12,000-$18,000 USD
- Alternative: AI-first-pass (Midjourney/ChatGPT for concept, manual Rive rig for state machine) — ~$6,000-$10,000
- Timeline: 6-8 weeks from brief to production-ready files
- Tradeoff vs v2: ~4x the budget for ~10x the emotional upside and ~2-5x the conversion

### 7.9 What I'd Cut from v2 to Afford This
- **Dark mode at launch:** v2 already cuts this (line 296). Stay cut.
- **"Full 8-state Beamie in Phase 3":** redirect this budget to the 5-character cast. Same Rive specialist, same timeline, more output.
- **Per-page micro-rebuilds in Phase 4:** stagger these to ship behind the character system so the product launches with character-forward, not styling-forward, differentiation.

### 7.10 What I'd Ship in MVP (if budget forces a single-character start)
Okay, I hear the counterargument: "5 characters is too much for MVP." Fine. Here's the staged plan:
- **MVP launch (week 0):** Ship Kavan (with mouth, with implied arms) as the single character. Scan Reveal uses Kavan-as-courier (not yet named Fetch).
- **Week 4 post-launch:** Introduce Fetch as the courier — pull the courier character *out* of Kavan. Kavan is now the "presenter" only.
- **Week 8:** Introduce Sofer + Matza as Inbox-item icons (no separate roaming character — just icons on item cards).
- **Week 12:** Introduce Roni for milestones only.
- **Month 6:** Introduce the Workshop backdrops per page.

This staged path ships *warmer than v2 at every stage* while respecting MVP timing. It's not "ship 5 characters or ship 1." It's "ship 1 with mouth and arms, and add the cast as the product grows."

### 7.11 Anti-Clippy Discipline — All Retained
Every one of v2's 12 behavior rules stays. Every anti-Clippy clause stays. The 7-day silence, the dismiss-in-one-click, the gaze-not-glow, the 3-step-tour-once — all of it stays. My proposal does NOT weaken the discipline. It *adds warmth within the discipline.* The cast is still silent-by-default. The characters still never auto-speak. The nudges still silence after dismissal. I am adding character *inside* the guardrails, not removing the guardrails.

---

## 8. CONCESSIONS — WHERE I AGREE WITH V2 (honest)

I want to be intellectually honest. Here are the places v2 is actually right and I was wrong (or would be wrong to push back):

**1. The courier metaphor in the Scan Reveal is better than my "cast does it together" intuition.** I considered arguing that the Scan Reveal should show all 5 characters participating. It shouldn't. Fetch (or whoever the courier is) carrying the site-card is a cleaner metaphor than "the whole team gets involved." Focus in storytelling beats ensemble. v2's courier single-character is correct here.

**2. The persistent-in-bottom-right placement is right.** I had a half-written attack about "what if Beamie moves around to be contextual" — but the R2 research is right that persistent placement is what makes the companion trustworthy. Don't let Kavan wander.

**3. Dark mode post-launch is right.** Scope discipline. No argument.

**4. `transition: all` ban, layout-animation ban, single-phase GPU composite rule** (v2 lines 249-252). All correct. No characterful rationale changes the GPU pipeline. These are engineering rules and they stay.

**5. The gaze-not-glow rule (v2 Rule 4) is my single favorite invention in the document** and I want to explicitly endorse it. It solves the Copilot dingbat problem better than any other product I've seen. Keep it verbatim.

**6. v2's Phase 0 quick-wins list** (lines 532-556) is all correct. Load InterDisplay, purge non-brand colors, wire the Inbox action stubs. None of my character argument is worth anything if the underlying product still looks like a half-built 2023 SaaS. Ship Phase 0 first. Then argue about characters.

**7. The "do not configure — do" principle in microcopy** (lines 382-430, "No jargon surfaces," "Show working, not configuring"). This is character voice already, just applied to copy instead of characters. v2 is *already doing* my argument at the copy layer. I am asking for consistency — extend it to the character layer too.

**8. The Stage is a full-page modal, no scroll.** I endorse this fully. The scan IS the product. Don't let users scroll past the proof-of-work moment.

---

## 9. THE SINGLE HARDEST QUESTION FOR ADAM

**Adam — answer this before you commit to v2 as-written:**

> "If a first-time Israeli plumbing-company owner runs the Beamix free scan on a Tuesday at 10pm after their kids are asleep, and the scan shows a score of 34/100, and they watch v2-Beamie (silver blob, no mouth, no arms, no voice) silently present the number — **will they remember the name of the product 48 hours later?** And will they tell one other person?"
>
> If your honest answer is *"probably not — but the product is solid enough that they might come back on their own,"* then v2 is enough.
>
> If your honest answer is *"that's the whole question — if they don't feel something, they're gone forever,"* then you cannot ship v2 as written. You need a character they remember, in a voice they remember, in a world they remember being in. And you need a Scan Card they can show their wife.
>
> Which answer is honest?

That's the question. Everything else in this critique descends from it.

---

## APPENDIX — Citations and Sources (my pattern library)

**Duolingo character strategy:**
- [Duolingo Learning Path + Duo's role](https://blog.duolingo.com/learning-path/)
- [NPR — Duolingo mascot revival and engagement strategy](https://www.npr.org/2025/02/26/nx-s1-5309785/duolingo-owl-mascot-lives)
- [Duolingo character roster](https://duoplanet.com/duolingo-character-names/)
- [Duolingo streak mechanics](https://blog.duolingo.com/streaks/)
- [Duolingo company scale](https://www.duolingo.com/info)

**Slack + Slackbot:**
- [Slack — Slackbot AI agent](https://slack.com/blog/news/slackbot-context-aware-ai-agent-for-work)
- [Slack notification sound design](https://slack.com/help/articles/201398467-Manage-your-notifications)

**Mailchimp + Freddie:**
- [Mailchimp brand assets & Freddie](https://mailchimp.com/about/brand-assets/)

**Intercom Operator:**
- [Intercom Resolution Bot / Operator](https://www.intercom.com/learning-center/resolution-bot)
- [Intercom Copilot](https://www.intercom.com/helpdesk/copilot)

**Spotify Wrapped (shareable reveal model):**
- [Spotify Wrapped 2024](https://newsroom.spotify.com/2024-12-04/your-2024-wrapped-is-here/)

**Strava (shareable summary model):**
- [Strava Monthly Summary](https://support.strava.com/hc/en-us/articles/115000962764)

**Arc Browser Spaces (spatial product identity):**
- [Arc browser](https://arc.net/)
- [Arc Max](https://arc.net/max)

**From v2 + R2 (endorsed sources I'm inheriting):**
- [BUCK — Notion AI case study](https://buck.co/work/notion-ai)
- [ElevenLabs Orb component](https://ui.elevenlabs.io/docs/components/orb)
- [Granola transcription docs](https://docs.granola.ai/help-center/taking-notes/transcription)
- [Wikipedia — Office Assistant (Clippy)](https://en.wikipedia.org/wiki/Office_Assistant)
- [Fast Company — Notion AI not Clippy](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)

---

**End of Board Seat 2 critique.** Fight me on any of this — I'll fight back.
