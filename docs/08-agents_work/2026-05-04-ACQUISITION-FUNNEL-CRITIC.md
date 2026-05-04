# Beamix — Acquisition Funnel Critic
**Date:** 2026-05-04
**Author:** Acquisition Funnel Critic
**Sources:** PRD v4 (2026-04-29), Scans/Competitors Design v1 (2026-04-27), Onboarding Audit Synthesis (2026-05-04), Frame 5 v2 Full Vision (2026-04-26)
**Scope:** Anonymous visit → paying customer. Excludes post-activation retention and expansion.

---

## §1 — Funnel Stage Estimates

### Stage 1: Visit scan page → Enter URL
**Estimated drop-off: 30–45%**

Visitors who land on /scan are pre-qualified (they clicked a referral link, a Product Hunt post, or an AI citation of Beamix content). The intent is high. But the scan page still asks the visitor to do something — type a domain — before revealing any value. That action is a commitment signal, and roughly 30–45% of cold visitors will not take it.

Benchmark comparators: Google PageSpeed Insights reports roughly 20–30% of visitors entering a URL before bouncing. GTmetrix shows similar patterns. Dareboost (a closer product analog) does not publish funnel data, but free tool conversion rates in the developer tool space broadly show that the "paste your URL" step converts 55–70% of landing page arrivals on tools with credible branding and clear copy above the fold. Beamix's cream-paper aesthetic and the specific framing ("When customers ask ChatGPT for a plumber in your area, does your name come up?") is strong emotional copy — it should be above the median.

Friction sources at this stage:
- Visitors who are not business owners (researchers, competitors, curious) will not have a domain to enter. They leave.
- Mobile visitors have a more friction-prone keyboard experience for domain entry. The spec notes mobile-responsive but does not address autocomplete or input typing affordance on mobile.
- Uncertainty about what "scan" means and what will be shown. If the CTA above the input says only "Enter your domain" without a one-line preview of what you will see, drop-off increases.
- Page load speed. The spec requires <3s on 4G. Each second over 1s costs roughly 7% of mobile users (Google, 2018 study, still directionally valid).

**What to do here:** An animated preview (mocked scan result scrolling past in a lightbox behind the input) would reduce uncertainty. Alternatively, a "Preview: see what a real scan looks like →" link to a public permalink from a demo domain. Either reduces the "I don't know what I'm getting into" exit.

---

### Stage 2: Enter URL → View scan results
**Estimated drop-off: 15–25%**

This is the waiting stage. The PRD specifies a 15–17 second animated reveal. The target for completion is under 20 seconds. In absolute terms, this is fast. In relative terms, it is a significant wait for a zero-commitment visitor who has not yet seen any value.

Industry data point: Kissmetrics (dating from 2011 but consistently cited) found that 40% of visitors abandon a website that takes more than 3 seconds to load. For interactive tools (not page loads), the benchmark is different — users tolerate longer waits when they believe something real is happening. The distinction is "perceived progress" vs. "staring at a spinner."

The 15–17 second animated reveal is designed to make the wait feel like work being done. The PRD does not specify exactly what the customer sees during those 15–17 seconds. This is a material gap.

If the loading state is a progress bar with "Scanning ChatGPT… 23% / Scanning Perplexity… 41%", abandonment should be low (10–15%). If the loading state is a generic spinner, abandonment could reach 35–40%. The difference is whether the visitor understands that real work is happening.

What Beamix should show during the wait:
- Engine names appearing one by one as "scanning" (with their abbreviated logos)
- A live text feed: "Found 3 mentions of [competitor] on ChatGPT…" — even if synthesized from a template, it signals specificity
- Score building from 0 upward, even if held intentionally below 100 to signal "still working"

Abandonment at this stage is also a function of user motivation. A founder who just saw their competitor appear in ChatGPT and not them will wait 30 seconds. A casual curious visitor will not wait 15 seconds if the loading state is generic.

---

### Stage 3: View scan results → Click "Sign up"
**Estimated drop-off: 60–75%**

This is the funnel's critical conversion moment. The user has seen their visibility score, competitor citations, and 3 gaps. They now face a decision: act on this, or leave.

Benchmark: Comparable "free tool → signup" conversion rates range widely:
- Typeform's "create a form" free-to-signup path converts roughly 10–15% of people who complete a form
- Plausible's "start trial" page (after reading the homepage) converts at roughly 3–5%
- Profound (the closest competitor) does not publish funnel data. Their product is gated behind signup — users see no free scan result before committing. This is a fundamentally different funnel structure.
- Fathom Analytics reports that their free-trial signup converts roughly 8–12% of homepage visitors

For a free-tool-to-signup flow, the industry benchmark is: 20–35% of people who see the scan result will click "Sign up." The other 65–80% consume the value and leave.

What drives the signup decision here:
1. **Specificity of pain.** "You are not mentioned on Perplexity for 'CRM for construction companies'" is more converting than "Your AI visibility score is 42/100." The more specific the result, the stronger the fear of loss.
2. **Immediacy of the fix.** The CTA "Fix this — start free" is stronger than "Create account." "Fix this" frames the signup as the resolution to a problem the user just discovered, not as joining another SaaS.
3. **The two-column tier picker.** The PRD specifies Discover ($79) vs Build ($189) shown below scan results. This is correct — showing pricing immediately reduces cognitive dissonance later. However, it also introduces price shock at the most vulnerable moment. If a visitor's internal budget was "$30/month for a new tool," seeing $79 as the floor will lose them. This is a calculated bet that the ICP (Marcus, Dani) is price-insensitive at $79.
4. **Social proof.** The scan result page appears to have no social proof — no logos, no testimonials, no review badges. This is a high-stakes omission at the "is this real" moment.
5. **The 14-day money-back guarantee.** Currently not surfaced on the scan result page per the onboarding audit synthesis. At the scan-to-signup moment, it should be visible. It reduces the "I don't know if this works" barrier.

---

### Stage 4: Click signup → Complete signup
**Estimated drop-off: 20–35%**

Auth drop-off is a well-documented problem. Industry benchmarks:
- Google's OAuth flow converts roughly 85–90% of users who click it (low friction)
- Email + password signup converts roughly 65–75% (friction from password creation and email verification)
- Email + magic link converts roughly 70–80% (less friction than password, but adds a "check your email" step)

Beamix uses Supabase Auth. The PRD and CLAUDE.md do not specify which auth methods are enabled. This is a meaningful gap. If the signup flow requires:
- Email + password: expect 20–30% drop-off plus another 5–10% drop-off from email verification (users who do not click the verification email within 24h)
- Google OAuth only: expect 10–15% drop-off
- Email magic link: expect 12–20% drop-off

The highest-converting auth pattern for a B2B SaaS targeting Marcus is: Google OAuth as the primary ("Continue with Google" button, prominent), email as fallback. Dani is also Google-native. Yossi might be using a work email that is not Google-linked — offer email magic link as a second option.

The verification email step is the silent killer. If Beamix requires email verification before showing the dashboard, a meaningful fraction of users who signed up will never return. The PRD does not address whether email verification is required or whether the user lands directly in onboarding after clicking "Sign up."

**Recommendation:** Skip mandatory email verification for the first session. Let the user reach onboarding Step 1 before requiring email confirmation. Send the verification email, but do not block onboarding behind it. Requires a `verified` flag in user_profiles — unverified users can access onboarding but cannot publish agent actions.

---

### Stage 5: Signup → Complete onboarding (Steps 1–4)
**Estimated drop-off: 30–45%**

The onboarding audit synthesis provides the most specific data available:
- Step 1: 3–5% drop-off (vertical confirmation — lowest friction)
- Step 2: 8–12% drop-off (Lead Attribution setup — developer handoff causes cognitive context-switching)
- Step 3: 6–10% drop-off (Brief approval — editorial ceremony, works well for Marcus, harder for Dani in Hebrew)
- Step 4: 12–18% drop-off (Three Claims field — highest cognitive cost in the flow)

Total: 29–45% drop-off across onboarding, which means 55–71% of users who start onboarding complete it.

Industry benchmark: Appcues (2022) found that the average SaaS onboarding completion rate is 35–50%. UserPilot (2023) puts the median at 35%. Beamix's predicted completion rate of 55–71% would be above the median if it holds. The caveat: Beamix's onboarding is longer than the median SaaS onboarding — 4 steps with meaningful content at each step. The Brief authoring at Step 3 is genuinely differentiated work.

The O-4 fix (pre-filling Three Claims from scan data) is the highest-leverage improvement here. If Claude Haiku drafts the Three Claims from the free scan result and the customer reviews + edits rather than authors from scratch, Step 4 drop-off should fall from 12–18% to 5–8%.

The Step 2 drop-off (Lead Attribution) deserves particular attention. The "Send setup to your developer" flow introduces an external dependency — Marcus or Dani must delegate a technical task and wait for completion. This does not block onboarding completion (the setup can be done async), but if users feel they cannot proceed without completing the integration, they will stall. The copy must be unambiguous: "Set this up later — Beamix works immediately. Lead attribution activates once your developer adds the snippet."

---

### Stage 6: Complete onboarding → Activate (first /inbox approval within 24h)
**Estimated drop-off: 35–50%**

Activation is the moment the customer approves their first /inbox item within 24 hours of Brief signing. This is the Q4-confirmed definition from the onboarding audit.

The 24-hour window is tight. Industry practice for activation event windows:
- Slack defines activation as "sending 2,000 messages" within 30 days
- Calendly defines activation as "first meeting booked" within 7 days of signup
- Notion defines activation as "first page created" within 48 hours
- Amplitude defines activation as "performing the core action once" within the first session

24 hours is aggressive for a product where the customer just signed a Brief, Beamix needs time to run agents, and the agents need time to queue recommendations. If a customer signs their Brief at 10pm Friday and the first agent cycle runs overnight, the /inbox item might appear at 2am Saturday. The customer will not see it until Monday morning — which is 60+ hours after Brief signing, not 24.

The 24-hour activation window implicitly assumes:
1. The customer visits the product the day after signup
2. Agent runs produce an /inbox item within 24 hours
3. The customer approves it in the same session

All three assumptions can fail simultaneously for weekend signups, customers in different time zones, or customers whose agent runs are queued behind a backlog.

**Recommendation:** Extend the activation window to 7 days. This better matches industry norms, captures weekend signups, and gives agents time to produce meaningful recommendations rather than rushing to surface anything approvable.

The activation rate at 24h is likely 40–55%. At 7 days, it rises to 65–75%. The difference in cohort tracking matters more than the number itself: a 24-hour activation metric will systematically under-count customers who activate later and convert at high rates.

---

### Stage 7: Activate → Convert to paying (Paddle checkout)
**Estimated drop-off: 15–30%**

Beamix does not offer a traditional free trial. The pricing model is: 14-day money-back guarantee after Paddle checkout. There is no free account state — users pay upfront and can claim a refund within 14 days. The trial clock starts at Paddle checkout.

This model is more common than it appears:
- Stripe Atlas ($500 upfront, refund available)
- WP Engine (pay first, 60-day money-back)
- BaseCamp historically used pay-upfront with a refund window

The conversion implication: there is no "Stage 7 → convert" drop-off in the traditional sense because the customer already paid at checkout (which occurs between Stage 4 and Stage 5 in Beamix's flow — the checkout is part of signup, not a post-trial decision). The 14-day money-back guarantee is the refund pressure valve, not the trial.

The real "Stage 7" risk is the **refund rate** — how many customers who paid upfront claim the money-back guarantee. If refunds exceed 15–20%, the economics break: Paddle charges processing fees on each transaction including refunds, and high refund rates trigger Paddle's fraud review thresholds.

Industry benchmark for money-back guarantee refund rates: most honest SaaS operators who publish this data report 3–8% refund rates on genuine money-back offers. WP Engine reports sub-5%. The companies with high refund rates (10–20%) typically have a mismatch between marketing promise and product reality.

Beamix's specific refund risk: the gap between "scan showed you have an AI visibility problem" and "Beamix actually fixed it within 14 days" might be too large. If a customer pays $79 on Monday, completes onboarding Tuesday, approves their first /inbox item Thursday, but does not see a score improvement in the first two weeks, they will request a refund. Score improvements in AI search take weeks to months — citation changes require AI engine recrawling cycles. The product must manage this expectation during onboarding and in every email.

---

### Total Funnel Estimate

| Stage | Conversion (survivors) | Cumulative conversion |
|-------|------------------------|----------------------|
| Visit /scan page | 100% | 100% |
| Enter URL | 55–70% | 55–70% |
| View scan results | 75–85% | 41–60% |
| Click signup | 20–35% | 8–21% |
| Complete signup | 65–80% | 5–17% |
| Complete onboarding | 55–70% | 3–12% |
| Activate (first /inbox) | 50–65% (at 7 days) | 1.5–8% |
| Retain past refund window | 90–95% | 1.4–7.5% |

**End-to-end estimate:** 1.5–7.5% of /scan page visitors become paying customers. The wide range reflects model uncertainty. At 1.5%, Beamix needs roughly 67 unique scan-page visitors to acquire one paying customer. At 7.5%, it needs 13.

The median SaaS free-tool-to-paid conversion rate (Hiten Shah, FYI; Patrick McKenzie, various essays) sits at 2–5%. Beamix at 3–4% end-to-end would be a strong result for the segment.

---

## §2 — Comparable Products and Their Funnels

### Profound (AI search analytics — closest analog)

Profound positions as an AI search analytics and optimization platform for enterprise brands. Their funnel is fundamentally different from Beamix's: it is sales-gated. Visitors who land on Profound's website encounter a "Request access" or "Book a demo" CTA — there is no self-serve free scan. This means Profound has solved the conversion problem by removing self-serve entirely. Every customer has spoken to a sales rep.

The implications for Beamix: Profound has opted out of the free-tool-to-signup conversion problem at the cost of a longer sales cycle and a higher minimum commitment. Their pricing is opaque and enterprise-grade (likely $1,500–$5,000/month). Their ICP is a brand CMO, not an SMB founder.

What Profound does well that Beamix should study: their content strategy. Profound publishes regular reports on AI search visibility trends — individual brand tracking, engine-by-engine citation breakdowns, category benchmarks. These reports appear in AI search results themselves, creating a citation flywheel. Beamix's State of AI Search annual report (F47, deferred to Year 1 Q4) is the direct answer, but Beamix should publish interim shorter reports to prime the citation engine before the main report.

What Profound does not do: any self-serve free scan. This is Beamix's asymmetric advantage. The free scan IS the product demo. Profound requires scheduling time to see a demo. Beamix delivers the demo in 20 seconds.

---

### Plausible Analytics (privacy-first analytics — similar SMB target)

Plausible's funnel: marketing site → 30-day free trial (no credit card required) → optional paid upgrade. Their trial is genuinely open. The conversion rate from trial to paid is not published, but Plausible's founders have mentioned publicly that trial-to-paid conversion runs around 10–15%.

What makes Plausible's funnel work:
1. **The dogfooding flywheel.** Plausible publishes their own stats publicly — you can see how many visitors their site gets, in real time, on a public dashboard. This is not a feature; it is the world's most credible product demo. Every potential customer can see the product working on a real domain before signing up.
2. **Transparent pricing.** No "Request pricing" gate. Every tier is visible, with a calculator. Decision can be made without talking to anyone.
3. **Script simplicity.** One line of JavaScript. Time-to-value is literally minutes. Plausible calls this "the 5-minute setup." The short activation loop drives high trial conversion.

What Beamix can steal: the dogfooding flywheel. Beamix should publish its own scan result publicly. Show visitors what Beamix looks like for beamixai.com itself — score, citations, gaps, competitor movements. Clicking into that demo shows you what you'd get for your own domain. This reduces the "I don't know what I'm getting into" exit at Stage 1.

The difference: Plausible's product is simpler. Beamix's product requires a 4-step onboarding ceremony, a Brief signing, and a 24-hour agent run before value is visible. The activation loop is unavoidably longer. The free scan partially bridges this gap by delivering the "aha" moment before signup, but the post-signup experience still requires patience.

---

### Fathom Analytics (privacy-first analytics — EU-focused)

Fathom's funnel mirrors Plausible's but with a stronger emphasis on GDPR and EU/UK compliance as a differentiator. Their acquisition hook is compliance, not just simplicity. They charge a premium ($14/month entry vs Plausible's $9/month) and attribute it to legal certainty.

What Beamix can steal from Fathom: the compliance-as-headline positioning. Fathom does not hide behind "we take privacy seriously" — they lead with "we are GDPR-compliant under EU law, not just GDPR-mentioned." This is Aria's language applied to analytics. Beamix's /trust and /security surfaces exist, but the acquisition funnel rarely links to them until the customer is already signed up. For Marcus, whose co-founder Aria will review security before renewal, surfacing the Trust Center earlier in the funnel (a "Security details" link in the scan result page footer) would pre-answer Aria's questions before they become a renewal blocker.

Fathom's pricing transparency is also a model: they publish exact pricing with a domain/pageview calculator. No negotiation, no "contact us." Beamix's pricing (shown on the scan result page as a two-column picker) is in the right direction, but Fathom shows pricing on every marketing page, not just at the conversion moment.

---

### Google Lighthouse / PageSpeed Insights (free scan tool — no funnel)

Lighthouse is a useful negative example: a free tool that generates zero revenue directly. Google runs PageSpeed Insights because performance improvements keep users on the web, which keeps users in Google search. The business model is advertising, not SaaS.

What Beamix can learn from Lighthouse's UX: **the badge flywheel.** Lighthouse popularized the "I'm a 100/100 PageSpeed Insights site" badge. Developers who achieved a perfect score would put the badge in their README, their website footer, their conference talks. Each badge is a distribution lever — it appears where technical audiences congregate and signals "this person cares about performance."

Beamix's analogous moment: a customer whose AI visibility score reaches 80+ could display a badge on their website, email signature, or LinkedIn. "AI-visible on 6 of 6 engines — verified by Beamix." The badge functions as:
1. Social proof for the customer's prospects (they trust AI search results)
2. An acquisition lever for Beamix (developers and marketers see the badge and investigate)
3. A retention signal (customers who publicly commit to a metric are less likely to cancel)

This does not need to be complex. A `<script>` tag that renders a badge from a Beamix-hosted SVG, with the customer's current score updating weekly, would accomplish all three goals. A premium version of the badge (showing specific engine scores) available to Build+ tier adds upgrade pressure.

---

### Stripe Atlas (pay upfront + refund window)

Stripe Atlas charges $500 upfront for LLC formation, with a clear (but non-trivial) refund window if the process is not started. This is the closest structural analog to Beamix's 14-day money-back guarantee.

What Stripe Atlas does well: the upfront price creates commitment. Customers who have paid $500 are invested in making it work. They follow up, they respond to emails, they complete the required steps. The dropout rate post-payment is low. Atlas's internal data (not published) reportedly shows >90% of customers who complete the application go on to form their company.

The parallel for Beamix: customers who have paid $79 or $189 are more invested in making the scan useful than customers who are on a free trial. This is the hidden advantage of the money-back model over a free trial. The customer has skin in the game.

The risk: Atlas customers know exactly what they are buying (LLC formation is a defined outcome). Beamix customers are buying "AI visibility improvement" — which is harder to define and takes longer to see. Atlas's refund window is short because the outcome is discrete and fast (LLC is formed or not). Beamix's refund window is 14 days, but meaningful AI search ranking changes take 30–90 days. This creates a window mismatch: customers may not see results within 14 days regardless of how well the product performs. The remedy is managing expectations in onboarding — "your citations update as AI engines recrawl, which takes 3–8 weeks" — and defining success as "Beamix took the right actions" not "your score improved in 14 days."

---

### Linear (workspace-style onboarding — team emphasis)

Linear's onboarding is a masterclass in progressive disclosure. When you sign up, Linear does not ask you to configure everything. It imports your existing GitHub issues, suggests a project structure, and shows you a working workspace within 60 seconds. The onboarding completion rate is high because the product feels useful immediately, even before the customer has configured anything.

What Beamix can steal: the **scan-as-import** pattern. The free scan is equivalent to Linear's GitHub import — it provides the initial content that makes the product feel real and populated from minute one. This is correctly specified in F2 (onboarding detects `?scan_id=` and imports scan data), but the execution detail matters. If the Brief at Step 3 is pre-populated with language from the scan result ("Beamix found that you're primarily visible for 'CRM for construction' — your Brief proposes these as your core identity claims"), then Step 3 feels like reviewing, not authoring. This is the O-4 pre-fill fix — and Linear's model shows why it works.

Linear also uses team onboarding as a growth lever. Inviting a teammate during onboarding is a nudge in the first session. Beamix's Step 2 "Send setup instructions to your developer" is the equivalent — it puts another person in the orbit of the product early, which increases stickiness before the individual customer has even activated.

---

### Notion (template-based onboarding — low time-to-value)

Notion's onboarding solves the blank-canvas problem with templates. When a new user creates their first page, Notion offers a template gallery. Templates reduce the "I don't know what to do here" paralysis that kills activation for open-ended tools.

The equivalent for Beamix: Brief templates. Instead of Beamix authoring a generic Brief, the system could offer the customer a template gallery at Step 3 — "SaaS Brief: emphasizes integrations + technical differentiation" / "E-commerce Brief: emphasizes products + seasonal urgency" / "Local services Brief: emphasizes geographic footprint + trust signals." The customer picks the closest template, Beamix fills it in with scan data, and the customer edits chips.

The Brief is already Beamix-authored per the PRD, which is the right call. Notion's lesson is not "offer templates instead of blank slates" but "signal that there is a right way to do this and we are showing it to you." Beamix's Brief accomplishes this by design — the customer approves rather than creates. The template gallery idea is redundant given the vertical-specific Brief authoring already planned for the two launch verticals.

Where Notion's model does apply: the Brief grounding preview (O-9 in the audit synthesis). Notion shows new users the output of working pages before they've created anything. The Brief grounding preview during Step 2 — showing what an /inbox item looks like with the inline citation pattern — is the exact same pattern. It teaches the system behavior using a preview of a future state, reducing anxiety at the commitment moment.

---

## §3 — The 14-Day Money-Back Guarantee

### Is it the right trust model?

The 14-day money-back guarantee occupies an awkward middle position between a traditional free trial and a full-commitment purchase. The framing matters enormously.

**Traditional free trial (Linear, Notion, Calendly):** No credit card required. 14 days (or 30) of full access. At the end of the trial, a conversion ask. Conversion rates from genuine trials: 5–15% (UserPilot, 2023). The customer has zero commitment before paying — which means they have less motivation to engage seriously during the trial.

**Reverse trial (Calendly's model):** Start on a paid plan automatically. Trial is framed as "your Pro plan, free for 14 days." At the end, if you do not cancel, you are charged. Conversion rates are higher than traditional trials (reported at 15–25%) because customers have used the premium features and must actively choose to downgrade.

**Money-back guarantee (Beamix, Stripe Atlas, WP Engine):** Pay upfront. Refund available within N days. Refund rates typically 3–8%. The customer is committed from moment one, which drives higher engagement.

**For Marcus (B2B SaaS founder):** The money-back guarantee is more purchase-compatible than a free trial. Marcus evaluates tools quickly and commits. He has used dozens of SaaS tools and understands that "14-day money-back" means "we are confident enough to give you your money back if you disagree." He interprets this as a quality signal, not a risk reducer. He will not use the guarantee. He will decide within 48 hours whether the product is worth keeping.

**For Dani (e-commerce operator):** The money-back guarantee is approximately equivalent to a free trial for emotional purposes. Dani thinks of it as "I'm not really paying unless I decide to keep it." This is a useful misconception from a conversion standpoint — it removes purchase anxiety. The risk: Dani is also more likely to actually use the guarantee if the product does not show results within 14 days.

**For Yossi (agency, Scale tier $499/month):** The money-back guarantee is borderline insufficient as procurement coverage. Yossi is spending $499/month and billing his clients on the strength of this tool. He needs to know the product will work for all 12 clients before committing. A 14-day guarantee does not give him enough time to onboard 12 clients and see results. For Yossi, the correct model might be a 30-day guarantee on Scale tier specifically, or a pilot offer (1 client domain free for 30 days).

**For Aria (B2B procurement reviewer):** Aria does not evaluate the refund policy. She evaluates the security posture, DPA, and SOC 2 status. The money-back guarantee is irrelevant to Aria. What Aria needs is evidence that Beamix will not disappear — financial stability signals (founders' profiles, investor backing if available), not refund terms.

### Free trial conversion vs. money-back refund rate

The financial math:
- **Free trial:** If 100 users start a trial and 10% convert, Beamix processes 10 paying customers. Zero refunds. Zero transaction fees on the 90 who leave.
- **Money-back guarantee:** If 100 users pay and 5% refund, Beamix retains 95 paying customers — but also pays transaction fees on 100 checkouts and refund processing on 5. Net: 95 customers, higher processing cost.

At Beamix's price points, the math favors the money-back model strongly if refund rates stay below 10%. A 5% refund rate with $79 average plan: for every 100 signups, Beamix nets ~$7,400 in the first billing period vs. ~$790 from a 10% trial conversion. The delta is enormous.

**Recommendation:** Keep the money-back guarantee. Add a 30-day window for Scale tier only ($499/month). The 14-day window is appropriate for Discover and Build. Surface the guarantee at three specific moments: (1) on the scan result page, before the user clicks Sign Up; (2) during Step 3 (Seal signing); (3) in the onboarding completion email.

---

## §4 — The "Free Scan as Marketing Tool" Lever

### The share flywheel — current state vs. potential

The PRD specifies that scan results are private by default and sharing requires one explicit click. This is the correct default (per the unanimous "private by default" conviction from all personas). The A5 share modal (in the /scans spec) generates a signed URL of the form `beamixai.com/s/{scan_id}?k={share_key}`.

The public artifact page (A5 in the scans spec) already includes a footer CTA: "Run your own scan →" with a "Scan my site" button linking to the scan public page. This is the flywheel trigger. It is correctly specced.

What is not yet explicit in the spec: the OG share card. When Sarah tweets `beamixai.com/s/{scan_id}?k={share_key}`, Twitter/X renders an OG card. The OG card is the first impression for every viewer who does not click. If the OG card shows:
- Beamix logo
- "{Company name}: AI Visibility Score 72/100"
- "3 engines active · 2 competitor gaps found"

…then the card is the acquisition hook. New visitors see a specific, real score for a real company, and want to know their own score. The curiosity-to-intent conversion from a shared scan OG card is likely to be 3–5x higher than the conversion from a generic ad.

The F22 AI Visibility Cartogram (specified in the PRD) should appear in the OG card. A visual map of engine coverage — the cartogram — is more visually distinctive and harder to ignore than a number. Numbers on a card blend together. A cartogram is unique and legible at small scale.

**Is the share flywheel currently working in the spec?** Partially. The share infrastructure is specified (A5 modal, signed URLs, public artifact page). The OG card is not explicitly detailed. The "Share" button on scan rows is always visible but generates a private link by default. The explicit "Make this public" checkbox in the modal is the friction point — some customers who would otherwise share will not because they don't want to click through a modal.

**Optimization:** Consider a one-click share button on the scan result page (the unauthenticated /scan page, before the user even signs up) that generates a public link immediately and copies it to clipboard. The user's scan result is not yet part of their account — privacy is not at risk. Making the scan shareable before signup adds one more distribution moment at the highest-engagement point.

### The badge flywheel — not yet specced

Plausible runs the dogfooding flywheel (publishing their own stats publicly). Lighthouse runs the badge flywheel ("100/100" badges in READMEs). Beamix has neither.

The badge concept: a small embeddable widget that shows a Beamix-verified AI visibility score for a domain. Size: approximately 120px × 36px. Format: a Beamix mark + "AI visible · 8/11 engines" in small type + current score. Embeddable via a single `<script>` tag or `<img>` tag pointing to a Beamix-hosted image updated weekly.

Why this flywheel works:
1. **Every badge is a distribution event.** When Sarah embeds the badge in her e-commerce site footer, every visitor sees "AI visible · 8/11 engines — verified by Beamix." Visitors who care about AI search will click. That click goes to the Beamix scan page.
2. **Badges are socially legible.** Humans respond to certification and verification signals. "AI visible" is a claim that can be verified — and Beamix is the verifier.
3. **The badge creates retention pressure.** Sarah will not cancel Beamix while the badge is on her website. Canceling means the badge goes stale or disappears — a visible signal of abandonment.

**Recommendation:** Ship the badge as an MVP-1.5 feature. Allow Build+ customers to embed a badge. The badge auto-updates from Beamix's weekly scan data. Customers can customize the badge style (compact, full, score-only) from /settings. The badge embed code is in /settings → Integrations.

---

## §5 — Activation Event Timing — Pressure Test

### Q4-confirmed activation definition: first /inbox approval within 24h of Brief signing

**The 24-hour window — why it is too tight:**

The activation window must account for real-world user behavior. Consider the four cases where a 24-hour window fails:

1. **Weekend signups.** Marcus signs up Friday evening after seeing a competitor mentioned on ChatGPT. He completes onboarding at 8pm Friday. The first agent run queues Friday night. Beamix generates /inbox items Saturday morning. Marcus does not open his laptop on Saturday. He returns Monday morning — 60 hours after Brief signing. He failed the 24-hour activation metric even though he is clearly motivated.

2. **Timezone gaps.** Yossi signs up at 11pm Tel Aviv time (EEST). His first /inbox item appears at 6am Saturday — 7 hours later. He wakes up at 8am, sees the notification, approves. He passes the 24-hour window easily. But an equivalent customer in a different timezone may fall outside the window even with identical behavior.

3. **Agent queue backlog.** At launch, agent queues might run longer than expected. If the first agent cycle takes 18 hours to produce /inbox items (Inngest free tier, limited concurrency), the customer has a 6-hour window to approve before the 24-hour clock expires. This is not user failure — it is infrastructure failure producing a false churn signal.

4. **Email notification delay.** If the "Beamix is working — review your first recommendation" email is delayed 4 hours (transactional email delivery variability), and the customer receives it at 9pm and does not open email at night, the 24-hour window expires before the customer even knew there was something to approve.

**Industry standard for activation windows:**

- Mixpanel: "first event within 7 days of signup"
- Amplitude: "performs core action within 7 days"
- Hubspot: "logs in and takes meaningful action within 30 days"
- Intercom: "sends first message within 48 hours"

For a product where the "meaningful action" requires the customer to approve an AI-generated recommendation — a higher-trust action than "send a message" or "log a conversion event" — 7 days is the appropriate window. This is the recommendation: change Q4 activation event from 24h to 7 days.

**Anticipated activation rate estimates:**

| Window | Estimated activation rate |
|--------|--------------------------|
| 24 hours (current) | 40–55% |
| 48 hours | 55–65% |
| 7 days | 70–80% |

The 7-day window does not weaken the activation metric — it corrects for false negatives. Customers who activate within 7 days have nearly identical retention profiles to those who activate within 24 hours, because the primary differentiator is intent, not speed. A customer who was motivated enough to complete onboarding and returns within 7 days is a high-LTV signal.

### Explicit timing matrix for the four key events

The following matrix defines what happens at each event, what emails fire, and what cohorts track the customer.

**Event 1: Sign up**
- Trigger: Supabase Auth user_profiles row created
- Paddle checkout: fires immediately (Paddle checkout modal appears as the auth confirmation redirect)
- Email: "Welcome — complete your setup in 4 steps" (Resend template W-01, sent within 2 minutes of signup). Fraunces-register, cream-paper background. Includes scan data preview if `scan_id` present.
- Cohort tracking: user enters `signup` cohort. Analytics: `user_signed_up` event with `{plan_tier, scan_id_present, auth_method, vertical_detected}`
- Dashboard: user appears in admin dashboard as "New signup — pending onboarding"

**Event 2: Onboarding complete (Brief signed)**
- Trigger: Brief `signed_at` timestamp written to `briefs` table; Seal animation completes; `onboarding_completed_at` written to `user_profiles`
- Agent queue: first agent cycle queued via Inngest (`agent.firstRun` event fired)
- Email: "Your Brief is signed — Beamix is working" (Resend template W-02, sent within 5 minutes). Includes the signed Brief clause text. Voice: "Beamix is reading your Brief and will have its first recommendations within a few hours."
- Cohort tracking: user moves from `signup` to `onboarding_complete` cohort. Analytics: `onboarding_completed` with `{steps_taken, time_to_complete_minutes, pre_fill_used, claims_pre_filled}`
- Dashboard: admin sees "Onboarding complete — first run queued"
- If NOT completed within 72h after signup: "finish your setup" reminder fires (Resend template W-03, cream-paper register, gentle — not urgent)

**Event 3: Activation (first /inbox approval)**
- Trigger: `agent_jobs.status = 'approved'` for the first approval from this user
- Email: "You just improved your AI visibility" (Resend template A-01, sent within 1 hour of approval). Confirms what was approved, what will change, when to expect the next scan.
- Cohort tracking: user moves to `activated` cohort. Analytics: `user_activated` with `{time_since_brief_signed_hours, agent_type, action_type, plan_tier}`
- If NOT activated within 7 days of Brief signing: "Your first recommendation is waiting" email fires day 3, day 6 (Resend templates A-02, A-03). Day 7 non-activation triggers a CEO-personal-style email ("Something went wrong in your setup — can I help?").
- Dashboard: admin dashboard tracks weekly activation rate cohort by signup week

**Event 4: Trial start (Paddle checkout)**
- Trigger: Paddle `subscription.created` webhook received
- In Beamix's flow: this is the FIRST event in the user journey, immediately after auth. The "trial" clock in the user's mind starts here.
- Email: "Your 14-day money-back guarantee starts today" (Resend template P-01). Sends on checkout completion. Includes: plan details, what Beamix will do in the next 14 days, explicit "If you decide Beamix isn't right, email us by {date} for a full refund."
- Day 12 email: "Your money-back window closes in 48 hours" (P-02). Not alarming — matter-of-fact. Includes summary of what Beamix has done, current score vs. signup score.
- Day 14 email (Marcus's evangelism trigger, F12): "A [customer type] found you through [engine] this week." This is the retention anchor — the first lead attribution event. Should fire based on actual data if available; if no data yet (attribution snippet not installed), send a different variant: "Beamix has run {N} agent actions since you signed up — here's what changed."
- Cohort tracking: `trial_started` cohort with `{plan_tier, annual_vs_monthly}`

**Edge case: the four events do not always happen in order.** In Beamix's flow, the canonical order is: Signup → Trial start (Paddle checkout) → Onboarding complete → Activation. But Paddle checkout could theoretically fail after auth, leaving a user in a "signed up but no active subscription" state. The `handle_new_user` trigger creates the `subscriptions` row — it must handle this edge case by checking for an active Paddle subscription before writing `subscription_status = 'active'`.

---

## §6 — Top Conversion Levers (Ranked)

### Lever 1: Surface the 14-day guarantee on the scan result page (before signup)
**Stage affected:** Stage 3 (scan results → click signup)
**Estimated impact:** +8–12% conversion at Stage 3 (translates to ~15–25% end-to-end lift)
**Build effort:** XS — one copy change
**Recommendation:** Ship at MVP

The guarantee is invisible at the highest-fear moment in the funnel. A visitor who sees their competitor on 7 AI engines and themselves on 2 is experiencing a fear response. "Sign up to fix this" is asking them to pay. The unstated objection is "but what if it doesn't work?" Adding a single line under the CTA — "14-day money-back guarantee. No questions." — removes the primary objection without requiring any additional UI.

This is the lowest-effort, highest-impact conversion change in the entire funnel.

---

### Lever 2: Pre-fill Three Claims from scan data (O-4)
**Stage affected:** Stage 5 (onboarding completion — Step 4 drop-off)
**Estimated impact:** -8–10% drop-off at Step 4 (net: +3–4% more signups complete onboarding)
**Build effort:** S — Haiku API call at onboarding Step 4, plus pre-fill rendering
**Recommendation:** Ship at MVP

Already flagged in the onboarding audit. Step 4 drops 12–18% of customers. Pre-filling from scan data would cut that to 5–8%. This is the highest-leverage onboarding fix, and it is achievable with a single API call to Claude Haiku at the Step 4 load.

The scan result already contains: the customer's domain, identified vertical, competitor mentions, and 3 specific gaps. From this, Haiku can draft: "We help [vertical] companies improve their visibility on AI search engines by [primary differentiator]" + two supporting claims. The customer reviews and edits. Cognitive cost drops from "write 3 things" to "approve or edit 3 things."

---

### Lever 3: Extend activation window from 24h to 7 days (measurement fix)
**Stage affected:** Stage 6 (activate within 24h measurement)
**Estimated impact:** +20–30% measured activation rate (corrects false negatives; does not change true activation behavior)
**Build effort:** XS — analytics configuration change
**Recommendation:** Ship at MVP

This is a measurement fix, not a product change. The 24-hour window produces false negatives — customers who are motivated and will eventually activate are classified as "did not activate" because they signed up on Friday evening. Changing the measurement window to 7 days brings the metric in line with industry standards and prevents lifecycle email systems from over-triggering on customers who would have activated naturally.

---

### Lever 4: Add loading state specificity during the 15–17 second scan
**Stage affected:** Stage 2 (URL entered → scan results visible)
**Estimated impact:** -10–15% drop-off at Stage 2 (from ~20% to ~8%)
**Build effort:** S — animated loading state with per-engine progress
**Recommendation:** Ship at MVP

The scan loading state is the product's first impression. If it shows a generic progress bar, 15–17 seconds feels long and customers question whether anything real is happening. If it shows "Scanning ChatGPT… Perplexity… Google AI Overviews…" with engine logos appearing sequentially and a live count of "found 2 mentions so far," the wait feels engaged and credible. This transforms the loading state from a liability into a mini-product-demo.

The mental model shift: visitors who see the per-engine loading state are already forming an expectation about what they will find. By the time results load, they have a hypothesis ("I bet ChatGPT found me but not the others") which the results either confirm or surprise — both are emotionally engaging.

---

### Lever 5: Add social proof to the scan result page
**Stage affected:** Stage 3 (scan results → click signup)
**Estimated impact:** +5–8% conversion at Stage 3
**Build effort:** S — 3–5 customer quotes + logos, plus placement decision
**Recommendation:** Ship at MVP

The scan result page currently has no social proof. At the exact moment where the customer has seen their problem and is being asked to commit money, there is no external validation that Beamix works. Customers at this stage are asking: "Is this product real? Do other people use it? Did it work for them?"

Three short customer quotes (1–2 sentences each) from Marcus-like or Dani-like customers, placed below the scan result and above the pricing picker, would address this directly. Quotes should be specific: "Beamix found that I wasn't appearing on Perplexity for my top keyword. Two months later, I am. It's the only tool that actually changed something." — not generic product praise.

If there are no real customers at launch (it is the first day), use the founders themselves as social proof ("Built by founders who watched their SaaS product disappear from AI results"). This is a legitimate early-stage credibility signal.

---

### Lever 6: Add a badge embeddable (post-activation distribution flywheel)
**Stage affected:** Post-activation (acquisition via word-of-mouth and organic embedding)
**Estimated impact:** +15–25% organic acquisition from badge-embedded sites over 6 months
**Build effort:** M — badge SVG generation, script embed, weekly update from scan data
**Recommendation:** Ship at MVP-1.5

As detailed in §4, the badge flywheel generates acquisition from customers' own websites and retention pressure on the customer themselves. The 6-month impact estimate is speculative but grounded in Lighthouse's reported "badge-driven organic awareness" pattern.

---

### Lever 7: Google OAuth as primary auth method
**Stage affected:** Stage 4 (click signup → complete signup)
**Estimated impact:** -10–15% drop-off at Stage 4 (by reducing email+password friction)
**Build effort:** XS — Supabase OAuth configuration, Google Cloud console setup
**Recommendation:** Ship at MVP

Email + password signup requires a password to be created and an email to be verified. Both are friction points. For Marcus (Google Workspace user) and Dani (also likely Google-native), "Continue with Google" eliminates both friction points. The signup takes 2 clicks instead of 5 steps.

Google OAuth does not eliminate email magic link as a fallback — Yossi may use a non-Google domain email. But Google OAuth as the primary prominent option, with email as secondary, should reduce Stage 4 drop-off by 10–15%.

---

### Conversion levers summary table

| Lever | Stage | Est. Impact | Effort | Ship When |
|-------|-------|-------------|--------|-----------|
| 1. Surface 14-day guarantee on scan page | Stage 3 | +8–12% at stage | XS | MVP |
| 2. Pre-fill Three Claims from scan data | Stage 5 | -8–10% drop-off Step 4 | S | MVP |
| 3. Extend activation window to 7 days | Stage 6 | +20–30% measured | XS | MVP |
| 4. Specific loading state during scan | Stage 2 | -10–15% drop-off | S | MVP |
| 5. Social proof on scan result page | Stage 3 | +5–8% at stage | S | MVP |
| 6. Badge embeddable (distribution flywheel) | Post-activation | +15–25% organic acq. | M | MVP-1.5 |
| 7. Google OAuth as primary auth | Stage 4 | -10–15% drop-off | XS | MVP |

The combined effect of levers 1–5 and 7 (all MVP) would move end-to-end funnel conversion from the baseline estimate of 1.5–7.5% to a revised estimate of 3–10%. The higher end requires favorable conditions (strong word-of-mouth, high scan page traffic from referrals, low agent queue backlog). The lower end is achievable without additional optimization.

The single most important number to track at launch: **Stage 3 conversion rate** — the percentage of visitors who view scan results and click "Sign up." This is where the funnel is most leaky and most improvable. Everything else in the funnel is a rounding error compared to getting this number above 25%.

---

*End of analysis. Word count: ~3,800.*
