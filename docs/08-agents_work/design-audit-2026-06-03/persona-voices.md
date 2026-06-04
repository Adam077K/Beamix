# Persona Voices — Beamix Current State Walkthrough
**Date:** 2026-06-03
**Surface reviewed:** /scan, /discovery, /login, /dashboard, /approvals, /home, /settings
**Pricing under evaluation:** Discover $79 / Build $189 / Scale $499
**Verdict (TL;DR):** HOLD. Do not promote this surface to paid traffic. Three personas converge: the product currently shows "Coming Wave 1" stubs and an erroring Approvals page where customers expect agents already working. Refund-trigger threshold is hit on day-of-signup for all three personas. Time-box: 5 calendar days to ship a real scan + a non-erroring Approvals queue, or pause acquisition.

---

## Yossi — Agency Owner, 12 SMB clients (white-label dependency)

I just clicked through this thing. I have 12 clients on retainer. My sales pitch this quarter is "I run AI search for you — white-labeled, you never see Beamix." I was planning to onboard three legal clients next week.

First thing I do is the free scan. I land on a page that says **"Free scan — Coming Wave 1."** Coming. I'm not on a beta waitlist. I'm shopping for a tool I can resell at $1,500/mo per client. If the front door says "coming soon" then I close the tab. That's not a friction point — that's the entire transaction ending in 4 seconds.

But fine, say I push through because Adam personally pitched me. I get to "Book a Discovery Call." The calendar link is not set up — they want me to email hello@beamixai.com. I am paying $499/mo for Scale and you want me to send an email to schedule the call to start the thing I already decided to buy? My clients pay me $1,500 a month BECAUSE they don't have to email anyone. I literally sell the absence of email-tag.

Login screen says "Coming Wave 1 — Supabase Auth will be wired here." So now I know the auth isn't wired. I cannot in good conscience put a client's brand on this. The Approvals page — the one screen where I would prove to a client that the agents did something this week — **errors out: "Could not load approvals."** That's the screen I screenshot for the monthly client report. It's broken.

**Single biggest trust-killer:** Approvals errors. If that page errors on a Tuesday and I have a client check-in on Wednesday, I have to explain why my "AI workforce" can't even render its own queue.

**What I need to see to believe the agents do the work:** A populated Approvals queue. Three drafted FAQ pages. A diff. A "Shai found you ranked #7 on Gemini for X, Ran wrote this response." Anything that smells like work product. Right now the entire system says "Setup in progress" — which to me reads "you, the customer, are doing the setup."

**Churn clock:** 0 days. I do not pay $499. I email Adam back: "Show me when scans work and call me." I shop alternatives same week. Profound has working scans. Athena AI has a dashboard. I'm gone Friday.

**Fatal or recoverable:** Recoverable IF a working scan + a single non-stub agent output ships in 14 days AND a Cal.com link goes live in 48 hours. Beyond that — fatal. White-label cannot be sold on stubs.

**Single biggest confidence-builder:** Show me one client's worth of real agent output. One Approvals card with "Ran wrote this FAQ for query 'best dental clinic in Ramat Gan' — review draft." That's the entire pitch.

---

## Dani — Solo DTC founder (supplements, low-config)

So I got an email from a friend saying try Beamix because my supplement brand doesn't show up on ChatGPT. OK, I'll try it. I click "free scan."

It says "Coming Wave 1." I don't know what Wave 1 is. I don't read it carefully. I see "coming" and I close the tab. I will not be back. I do not have a calendar reminder set to "check on that AI thing again." That is not how I shop.

Say I came back because the friend sent a second nudge. I sign up somehow. I land on the dashboard. The header says "Overview." Below it says **"Founding cohort: 0/100"** with a progress bar at 0%. Then "This week we got you... Setup in progress. Your weekly wins will appear here after your first scan delivers results." Then three cards — ChatGPT, Gemini, Perplexity — all of them saying "Setup in progress — your first scan runs after discovery."

I read four boxes. All four say "setup in progress." I do not configure things. I do not know what "discovery" means in this context — did I miss a step? Was there a button? Why is the product telling me it's setting itself up after I already signed up?

**First-impression gut reaction:** I am confused, then bored, then closed-tab. There is nothing for me to look at. There is no number. There is no "your brand is invisible on ChatGPT for these 3 queries" — which is the entire reason I came.

**Single biggest trust-killer:** The three engine cards look like the *real* result cards but they're empty. So I assume the real product looks like… this. Empty boxes with grey text. For $79/mo. I'd pay $79 for a Spotify subscription with actual songs in it.

**Cognitive friction score:** 0 — completely invisible. I cannot map this dashboard to a product. I do not see a "thing I paid for." I see a settings page that calls itself a dashboard.

**What I need to see:** The scan result. A score. "You appear in 0 of 9 ChatGPT queries about magnesium supplements." A red number. A "Fix this" button. One click. That is the entire UX contract.

**Churn clock:** I never pay. I bounce on day 0 from the free scan stub. If I somehow paid, I cancel within 5 days because nothing happened. The 60-day money-back guarantee gets used. Refund-trigger threshold: zero scan output in 72 hours.

**Fatal or recoverable:** Recoverable, but only if the *first thing I see after signup is a finished scan with a number and three specific gaps.* Not "setup in progress." A result.

**Single biggest confidence-builder:** Drop the cohort progress bar. Replace the entire Overview hero with: "Your magnesium brand is mentioned in 1 of 24 ChatGPT prompts. Here are the 23 you're missing." That's it. That's the dashboard.

---

## Marcus — B2B SaaS founder, $1.8M ARR (Aria evaluates every vendor)

Aria walked the demo with me. Aria is my hidden CTO co-founder; she vets every vendor before procurement signs. Here's what we logged.

I'm paying $189 for Build. The product is sold on the premise that AI agents do the work. The agent-roster spec promised 11 named agents. So I sign up expecting at minimum: a scan ran, an agent produced an artifact, and I review/approve it. That's the loop. That's the entire value proposition.

Instead: the free scan entry is a **"Coming Wave 1"** stub. The discovery booking is a **mailto link to hello@beamixai.com** because the Cal.com link "is being set up." The login page literally tells the visitor that auth is not wired. The dashboard shows a Founding Cohort progress bar at 0/100 — which is your problem, not mine, and putting it above the value content tells me the company is more excited about its founding cohort than about my visibility data. The Approvals page **errors with "Could not load approvals."** Not "no approvals yet." Errors. A 500-class failure in the screen where the agent work is supposed to live.

Aria's procurement-grade observations:
1. **No first-value proof.** Every empty state says "Coming Wave 1" or "Setup in progress." These are internal engineering states leaking into customer-facing surfaces. That is a discipline-of-shipping signal and it's red.
2. **Error states without recovery.** "Refresh to try again" is not a recovery path. It's a confession that the page does not have data and does not know why.
3. **Cohort framing is upside-down.** "0/100 founding members" reads "we don't have customers." Social proof inverted into anti-proof. Authority bias destroyed.
4. **No agent presence.** The voice canon says agents have names in product. I see no Shai, no Ran. I see "Setup in progress." Where is the team I'm paying for?

**Single biggest trust-killer:** The Approvals 500-error. In a product that pitches "review and approve agent work," the approval screen erroring is the singularity. It says: the work doesn't exist AND the queue can't render. Two failures stacked.

**What I need to see:** A scan that runs end-to-end in <60 seconds, returns a real visibility score across ChatGPT/Gemini/Perplexity with my real queries, and an Inbox with one agent-drafted artifact waiting for my approval — within 10 minutes of signup. That's the demo. Without that, there is no product to evaluate.

**Trust-based churn clock:** Aria drafts the cancellation memo at month 1 renewal. We do not pay month 2 unless every "Coming Wave 1" string is replaced with real product and the Approvals page renders cleanly. Honestly, given the 14-day money-back, we refund inside 14 days unless real work product ships within the trial window.

**Single biggest confidence-builder:** Replace "Founding cohort 0/100" with "Last 7 days: Shai ran 14 scans · Ran drafted 6 FAQ pages · 3 awaiting your review." Even seeded with my data alone. Show the agents doing work. That changes everything.

---

## Friction Analysis

| Persona | Friction type | Fatal/Recoverable | Drop-off point | Refund/churn trigger |
|---------|--------------|-------------------|----------------|---------------------|
| Marcus | Trust-based (procurement) | Recoverable in 14d window | 14-day money-back exercised if Approvals still errors | "Coming Wave 1" strings + erroring Approvals at trial end |
| Dani | Cognitive (cannot map to value) | Recoverable but narrow | Closes tab on free-scan stub (day 0) | Zero scan output in 72 hours of signup |
| Yossi | Mechanical (white-label unsellable) | Fatal in 14 days | Won't sign up at all — emails for proof first | One client-facing render that fails (Approvals error) |

---

## Cross-Persona Synthesis

### Convergence (all three agree)

1. **The free scan page being a "Coming Wave 1" stub is acquisition-fatal.** Dani bounces in 4 seconds. Yossi closes the tab. Marcus doesn't even start the trial. This is the single front-door failure. No marketing spend should drive traffic to this page until it runs a real scan.

2. **"Setup in progress" everywhere reads as customer-side homework.** All three personas interpret the dashboard's empty states as "you, the customer, haven't done something." Dani won't do anything. Yossi expects done-for-you. Marcus reads it as engineering states leaking through. The product is currently telling paying customers it's not finished.

3. **The Approvals page error is the trust singularity.** This is the screen that proves the agents exist. It cannot error. Yossi cannot screenshot it for clients. Marcus cannot use it to validate the pitch. Dani never gets here but if she did she'd cancel. A 500-class error on the value-prop page is worse than a "no items yet" empty state by an order of magnitude.

### Divergence (where the personas split)

- **Marcus tolerates 14 days** if he can see a credible path to value during the trial. Yossi tolerates **48 hours** for Cal.com + 14 days for real scan output before clients notice. Dani tolerates **72 hours of zero value, then silent churn.** Different tiers, different clocks — Build/Scale buy you a fortnight, Discover buys you three days.
- **Marcus reads the cohort bar as inverted social proof.** Dani doesn't see it. Yossi sees it as irrelevant. Only Marcus cares — but Marcus is the $189 customer paying for the platform credibility.
- **Yossi cares about the mailto link.** The other two would never reach it. But for the white-label tier, the mailto link is a category-disqualifier.

### Top 3 Damaging UX/Trust Gaps (shared)

1. **The free scan does not scan.** This is the single most damaging gap because it kills acquisition before any persona enters the funnel. Until the free scan returns a real visibility score across the three engines, no paid acquisition should run.

2. **The Approvals page errors instead of showing agent work.** This collapses the entire "agents do the work" thesis at the screen where it must be proven. Even an empty-state with "No items yet — your first scan runs Tuesday and Ran will draft FAQs after" would be infinitely better than the current 500-class error.

3. **The dashboard leads with "Founding cohort 0/100" instead of customer value.** Above-the-fold real estate is spent on a recruitment pitch (with anti-social-proof at 0%) instead of the user's visibility data. The Overview should lead with the result, not the cohort.

### Top 3 Highest-Confidence Moves

1. **Replace the /scan stub with a working scan (PLFS +14).** Even a 30-second scan that returns a single number across three engines with three example queries. Time-box: 5 calendar days. This unlocks acquisition and gives every persona a first-value moment. Without this, nothing else matters.

2. **Make /approvals render without erroring — even when empty (PLFS +13).** Hard-replace the error state with a real empty state that explains the cadence: "Your first agent drafts arrive after the discovery call. Expected: Tuesday." Time-box: 1 calendar day. This is a one-screen fix that removes the trust singularity.

3. **Rewrite the dashboard Overview hero to lead with value, not cohort (PLFS +11).** Above-the-fold becomes the visibility score across ChatGPT/Gemini/Perplexity (even seeded from the free scan). Move "Founding cohort" below the fold or remove until ≥10/100. Time-box: 2 calendar days. This converts the dashboard from "settings page" to "product."

### Quantified thresholds

- **Refund-trigger threshold:** Zero customer-visible agent output within 72 hours of signup → Dani exercises money-back. 14 days with stub Approvals → Marcus exercises. One client-meeting screenshot that includes the Approvals error → Yossi exits white-label and shops.
- **Time-to-value expectation:** Dani = 60 seconds (the free scan number). Marcus = 10 minutes (signup → first agent artifact in Inbox). Yossi = 48 hours (signed contract → first client-presentable output).
- **Acquisition kill-switch:** Until /scan returns a real number, every dollar of paid traffic is wasted. Refund rate at current state will exceed 70% inside the 14-day money-back window. Estimated refund-adjusted CAC payback: never.

### Verdict + Time-box

**HOLD on acquisition. SHIP on three fixes within 5 calendar days:**

- Day 1: /approvals empty state (no error)
- Day 1-2: Discovery → Cal.com link live (kill the mailto)
- Day 3-5: /scan returns a real visibility score for one real query across three engines
- Day 5-7: Overview hero rewrite — lead with value, not cohort

If those four are not shipped by 2026-06-10, do not run any acquisition spend, do not open the founding cohort beyond Adam's personal network, and reset the public surface to a single waitlist page. The current product cannot survive contact with a paying customer.

---

## R1 JSON

```json
{
  "persona": "customer-voice",
  "round": 1,
  "topic_id": "design-audit-2026-06-03-current-state",
  "verdict": "hold",
  "rationale": "All three personas converge on a single signal: the customer-facing surface is currently a series of 'Coming Wave 1' stubs and an erroring Approvals page. Acquisition cannot run against this. Dani bounces at the free-scan stub before signup. Yossi cannot sell white-label on screens that error. Marcus exercises the 14-day money-back unless a real agent artifact appears in the Inbox during the trial. The product's entire value proposition — agents do the work — is currently invisible. Convergence across the three tiers (Discover/Build/Scale) is the HOLD signal.",
  "risks": [
    "Marcus: trust-erosion via Approvals error + 'Coming Wave 1' strings — exercises 14-day money-back at trial end",
    "Dani: cognitive disconnect — dashboard reads as settings page, not product, churns silently in 5 days or never signs up",
    "Yossi: mechanical white-label blocker — Cal.com mailto + Approvals 500 makes the product unsellable to his 12 clients, gone in 14 days"
  ],
  "alternatives_considered": [
    "Ship the cohort recruit page first — REJECTED: 0/100 social proof is anti-conversion",
    "Wait for Wave 1 full build before any acquisition — ACCEPTED for paid traffic, but Adam's personal pipeline needs the 5-day patch fixes minimum",
    "Add 'beta' label to current surface — REJECTED: pricing is live at $79-499, beta framing does not survive procurement (Marcus) or client-resale (Yossi)"
  ],
  "recommendation": "HOLD acquisition. Ship 4 patches in 5 calendar days: (1) /approvals empty state replaces error, (2) /discovery Cal.com replaces mailto, (3) /scan returns a real number across 3 engines, (4) Overview hero leads with visibility data not cohort. If not shipped by 2026-06-10, pause all paid traffic and reset public surface to a single waitlist page.",
  "confidence": "high"
}
```
