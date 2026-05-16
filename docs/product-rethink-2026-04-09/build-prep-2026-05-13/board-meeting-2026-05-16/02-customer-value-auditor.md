# Board Member 2 — Customer Value Auditor

**Date:** 2026-05-16
**Lens:** Does each feature serve a real SMB outcome, or is it engineering for engineering's sake? Is what customers need PRESENT, what they don't need ABSENT, and value PROMINENT (not buried)?

---

## Verdict: VALUE COMPROMISED

The plan gets the spine right (Day-1 chain, suggestions on Home, Inbox review, Performance Tracker, leading-indicator panel, citation signals, Israeli directory seeds, FAQ teaser, PDF export). The customer outcome is real and the math is honest. But three specific design choices put the customer on the wrong side of value:

1. The "we did the work" promise is **softer than the marketing positioning**. Off-site agents (which the research calls 85% of the game) produce *submission packages* the user must copy-paste themselves. Reviews are *templates*. Reddit is a *strategy doc*. The user still does a lot of work.
2. Discover ($79) gives **weekly cadence and no Authority Blog Strategist** — yet costs only 40% less than Build ($189). The increment from Discover→Build is huge (3 engines→7, weekly→daily, no blog→blog, 25 runs→90); the increment from $79→$189 is fine. But the jump from $0→$79 buys a tier that may feel thin to a buyer who saw the wound-reveal and expected fixes, not slow drip.
3. The Hebrew-market experience is real (Heebo font, RTL, IL directory seed list, Hebrew prompt variants) but **support, legal, refund, and Paddle T&Cs are English-default**. For Yael at NIS 700 ceiling, this is a trust break.

The customer is winning on transparency, weekly score signals, and refund fairness. The customer is losing on the "agency replacement" promise — they bought the AI agency but still have to be the publishing intern.

---

## Top 5 value risks (concrete)

### Risk 1 — "We did the work" is overpromised on off-site (85% of the game)

**What customers expect:** Hero copy says "Beamix does the work." Marketing says "agency replacement at $189." The wound-reveal shows competitors winning queries; the implied fix is that Beamix will close that gap.

**What plan delivers:** Off-Site Presence Builder produces a *submission package*. Review Presence Planner produces a *strategy doc + templates*. Reddit Presence Planner produces a *posting calendar + comment templates*. Entity Builder produces a *Wikidata draft* the user submits. Even Content Optimizer outputs markdown the user copies into their CMS manually ("Publish from Beamix = Archive item; user copies to website").

Research says off-site is 85% of mentions. The product delivers near-100% of off-site work as *checklists the user executes*. This is closer to "agency that writes the playbook, you run it" than "agency that does it for you."

**Fix:** Tighten copy. Replace "Beamix does the work" with "Beamix runs the playbook, you click publish." OR build at least ONE genuine off-site automation in MVP+30 — e.g., GMB API write (Google Business Profile posts), since GMB is the single highest-leverage off-site signal and has a documented API. One real execution proof point flips the perception.

---

### Risk 2 — Discover ($79) cadence is too thin for the wound-reveal hype

**What customers expect:** The free scan shows 3 visible + 8 blurred fixes, top-3 competitors winning queries, and a CTA "Fix this now." The user pays $79 expecting daily progress toward fixing those 11 specific items.

**What plan delivers:** Discover gets weekly scans, weekly cadence on all agents, 25 AI Runs/month, NO Authority Blog Strategist. The 8 blurred fixes from the wound-reveal may take 8+ weeks to address at 25 runs/month with Content Optimizer @ 2 runs each. Meanwhile competitor data refreshes weekly (not daily), so loss-aversion alerts arrive stale.

A Discover user who paid $79 to fix 11 visible gaps sees one suggestion executed in week 1, none of them is Authority Blog (paywall), and competitor movement comes through 1 week late. **They will refund inside the 14-day window before activation hits its stride.**

**Fix:** Either (a) give Discover a one-time "burst" of 3-5 extra runs in Day-1 so they see immediate sequential progress on the 11 wound-reveal fixes, OR (b) reframe Discover as "Monitor + first fix" and make Build the actual "fix it" tier (anchor explicitly). The current Discover positioning is "Fix it lite" but the runs/cadence say "Monitor mostly."

---

### Risk 3 — Hebrew-market parity is asymmetric

**What customers expect:** Israeli SMB owner (memory: Yael, Yossi personas; primary market) expects parity. Hebrew content output, Hebrew support, Hebrew T&Cs, Hebrew refund flow, Hebrew receipt. Not a translation afterthought.

**What plan delivers:**
- Content agents: Hebrew prompt variants (good)
- Directories: IL seed list — d.co.il, Easy, Rest, B144, Zap (good)
- Reviews: Wolt, Rest, Zap, Easy added (good)
- Font: Heebo paired (good)
- Legal: T&Cs in English, Termly template, jurisdiction Israel, but no Hebrew version planned
- Paddle checkout: Paddle hosted overlay — English by default
- Support email: `support@beamixai.com` — no Hebrew SLA, no Hebrew-fluent support promise
- Refund policy: English-only, 50% cap rule
- Resend templates: not specced for Hebrew variants (welcome, digest, refund-processed)

For Yael who's spending NIS 680 of company money on her own approval, English-only legal/support/refund is a trust crack. Hebrew product + English business surfaces feels like a side project.

**Fix:** Add to Wave 2: Hebrew versions of T&Cs, Privacy, Refund clause; Hebrew Resend templates for the 6 mandatory emails; Hebrew receipt line items in Paddle. If lawyer cost is a blocker, ship Hebrew machine-translated with "Authoritative English version" caveat. Better than nothing.

---

### Risk 4 — Refund cap (50% if >50% runs consumed) is fair but invisible at the moment that matters

**What customers expect:** "14-day money-back guarantee" sounds clean. The board decision was "plain refund, no credit-cap fine print." Then ADQ-5 added a 50%/50% rule.

**What plan delivers:** The 50% cap lives in T&Cs §Refunds, on Paddle checkout T&Cs link, and an email template at refund time. The user does NOT see the cap before they hit "Run all" or before they approve Day-1 auto-runs. The Day-1 chain auto-fires 2-3 agents immediately, consuming runs from the pool. A user who refunds at day 13 after exploring may have already passed 50% consumption due to **auto-triggered runs they didn't actively choose**.

This becomes a customer service flashpoint: "Beamix burned my runs automatically, then capped my refund to 50%." That is a 1-star review story.

**Fix:** Two changes — (1) Show runs-consumed bar in the Settings → Billing tab with explicit "Refund eligibility: full / 50% capped" indicator, refreshed live. (2) Day-1 auto-runs should NOT count against the 50% consumption cap for refund purposes — track "user_initiated_runs" separately from "auto_initiated_runs" and only count user-initiated ones against the refund cap. Engineering effort: trivial (1 boolean column). Customer perception: massive.

---

### Risk 5 — Activation gap: refund window is 14 days, real value signal arrives at 21-28 days

**What customers expect:** Pay $189 today, refund window closes day 14. By day 14 they need to feel "this works."

**What plan delivers:** The Expectations Timeline (UX §10) explicitly says: Week 1-2 = activity indicators only, NO score movement. Week 3-4 = first Perplexity/Gemini citations. Score-level movement = Month 3+. The plan even acknowledges this in the analytics doc (ADQ-1 "activation-vs-refund-window gap").

The Leading-Indicator Panel partially compensates ("content published this week", "actions completed", "citations detected") but those are **vanity-style activity metrics**, not value metrics. A user can refund on day 13 saying "I've approved 4 drafts and seen no rank changes."

**Fix:** This is the single most consequential value risk. Three mitigations should ship together:
1. **Honest expectation at checkout** — paywall modal shows the 4-week-to-citations timeline before payment. Filter out impulse buyers; convert realists.
2. **Day-1 includes ONE before-shot of a single high-velocity engine (Perplexity preferred — it indexes fastest)** — schedule a Day-7 mini-rescan of that one engine for the user's homepage to give a real early signal inside the refund window.
3. **Citation-watch alerts via email** — every time a citation appears in any scheduled scan, instant email "ChatGPT now cites you for [query]". One real citation hit in the refund window kills refund risk for that user.

---

## The "we did the work" promise — assessment

| Surface | Marketing claims | Product reality |
|---------|------------------|-----------------|
| Hero line | "Beamix does the work — you stay in control." | True for content drafts. False for off-site, reviews, Reddit, Wikidata, GMB. |
| Pricing positioning | "Agency does same work for $189 instead of $3,000" | An agency at $3,000/mo would also publish to your CMS, submit to GMB on your behalf, file the Wikidata draft, and post on Reddit. Beamix does none of these. |
| Inbox approval | "Like an agency: they draft, you approve, you publish" | Agency analogy holds for content. Off-site is "they map, you go submit, you log back in and mark done." Different workflow entirely. |
| Archive verification loop | URL probe at +48h, next scan confirms | This is solid — closes the loop on whether the user actually published. |

**Verdict on the promise:** 60% delivered. The 40% gap (off-site execution) is the most important 40% per the research. This is the gap a competitor like Frase or a real agency will exploit. The product needs at least one "we actually did this for you" off-site automation in MVP+30 to defend the positioning.

---

## Visible value moments (where the customer sees what they got)

Strong:
- **Home score hero with 8-week sparkline** — immediate visible delta on every login
- **Leading-Indicator Panel** (added in Wave 1 Worker 1 brief) — 4 stats: content published, actions completed, citations detected, next scheduled run. Bridges the 0-3 week dead zone where score doesn't move.
- **Inbox 3-pane with Evidence panel** — every approved item shows trigger source, target queries, citations, impact. Transparency-grade.
- **Day-1 auto-run drafts surface live** — by minute 5 post-payment the user has 2-3 drafts waiting. Real first-impression value.
- **Performance Tracker delta dashboard** — before/after per action. The retention spine.
- **"Run all" pill on Home** — explicit "AI Runs" cost shown. No surprise charges.
- **PDF export** — emailable to boss. The Yael use case (showing her partner she's earning ROI) is real.
- **One free FAQ Builder run in preview** — produces copy-pasteable FAQ + JSON-LD before paywall. Genuine taste of value.
- **Content Optimizer teaser** on free scan result — 3-sentence rewrite preview. Visible product proof at $0 cost.

---

## Invisible value risks (where the customer might think they got nothing)

- **Off-site work** the user does manually — they may not credit Beamix for the citation appearing on a directory they personally submitted to. The Archive verification loop only confirms the publish; it doesn't tell the user "Beamix's strategy moved you on this query." Needs an attribution panel: "this citation appeared on Yelp 5 days after you submitted via Beamix's Off-Site Builder package."
- **Free agents (Schema, FAQ, Off-Site, Perf Tracker)** don't deduct AI Runs — great for the user but invisible in cost-of-effort. Consider showing "effort delivered" as a separate stat ("4 free actions completed worth $50 of agency time at $150/hr").
- **Background scheduled runs** — the Inbox surfaces drafts but the user may not realize how many tasks ran for them while they were away. A "This week, Beamix ran 12 background tasks for you" weekly email line item would crystallize this.
- **Discover tier sees only 1 suggestion fully** — the 4 blurred placeholder cards are an upgrade signal but read as "this tier is restricted" rather than "look what you'd unlock." Replace blurred placeholders with concrete teaser titles + impact numbers ("Authority Blog Strategist would target 14 high-intent queries — Build, $189").

---

## Hebrew-market value parity assessment

| Surface | Parity status |
|---------|---------------|
| Agent content (HE prompt variants) | Strong |
| RTL layout (Tailwind logical properties) | Strong |
| Heebo font | Strong |
| Israeli directory seeds | Strong (d.co.il, B144, Zap, etc.) |
| Israeli review platforms | Strong (Wolt, Rest, Zap, Easy) |
| Hebrew benchmark research (50 queries × 4 engines) | Scheduled in parallel with build sprint — gating Hebrew-first marketing decisions |
| Hebrew Resend transactional emails | **Missing** — 6 templates specced English-only |
| Hebrew T&Cs / Privacy / Refund clause | **Missing** — Termly templates English-only |
| Paddle checkout in Hebrew | **Missing** — relies on Paddle hosted overlay defaults |
| Hebrew-fluent support | **Missing** — `support@beamixai.com` only |
| Hebrew receipt / invoice | **Missing** — Paddle defaults |
| Hebrew onboarding flow copy | **Unclear** — depends on language preference in Settings → Profile (set after Day-1) |

**Verdict:** The product surface (content output + dashboard chrome) gets equal love. The business surface (legal, billing, support, transactional email) does not. For a Hebrew-primary market positioning this gap is the difference between "Israeli SaaS" and "SaaS that happens to translate UI to Hebrew."

---

## Strong points (what holds up)

1. **The spine** — Query Mapper → scan → rules engine → suggestions → Inbox review → Performance Tracker is coherent and customer-aligned. Each piece has a clear value role.
2. **Day-1 dead-dashboard cure** — auto-firing Query Mapper + scan + top suggestions + 2-3 auto-drafts is best-in-class first-impression engineering. Most SaaS gets this wrong; Beamix's design is right.
3. **Free preview FAQ + Optimizer teaser** — provides real value pre-paywall, builds trust before payment ask.
4. **Industry funnel gate** — YMYL (legal/medical/financial) blocked at form level, no LLM cost, no refund event. Closes the leak board flagged.
5. **Leading-Indicator Panel** — explicitly designed to bridge the 14-day refund window vs 21-28-day citation signal gap.
6. **Directional language only on score attribution** — honesty over hype. Reduces churn from "you said my score would go up and it didn't."
7. **Kill switch sacred, double-checked at PLAN and DO** — user trust feature.
8. **Refund process has audit trail and consumed-percent tracking** — when a refund happens, the system has the data to be fair. Good plumbing.
9. **Top-up pack $19/10 runs** — prevents mid-month churn at value cliff. Smart retention.
10. **Cost circuit breaker** — protects both Beamix and the user from runaway spend. Trust feature.

---

## One feature to add / one to cut

### ADD: Day-7 micro-rescan + citation-watch alerts

A single-engine (Perplexity preferred, fastest indexer) mini-rescan auto-fires on Day 7. If any new citation appears since Day 1, fire instant email and in-app notification: "ChatGPT now cites [yourbusiness] for '[query]'." Adds one mini-rescan to the Day-1 chain calendar; total LLM cost <$0.03/user; bridges activation gap inside refund window. This is the single highest-leverage addition for refund-rate reduction.

### CUT: Reddit Presence Planner from MVP-1

The Reddit Presence Planner produces a *strategy doc + comment templates*. Even on Build/Scale, the user must manually create Reddit accounts, build karma, navigate community rules, and post — a multi-week social effort that most SMBs will not execute. It's research-backed (46.7% of Perplexity citations) but workflow-impractical for the target buyer (Yael, Yossi: time-poor service business owners).

Cutting it saves: 1 agent slot in the roster, 5 golden eval cases, 1 set of Hebrew prompt variants, and the cognitive load of presenting "Reddit strategy" to a Tel Aviv mover or a Jerusalem dentist who has never used Reddit. Re-introduce in MVP-2 as a Scale-tier feature with real Reddit API integration, after we have data showing high-Reddit-leverage customers actually want it.

Keep the underlying *signal* (Perplexity is citing Reddit for your queries) as a Performance Tracker insight, not as a dedicated agent.

---

## ≤250-word summary

**Verdict: VALUE COMPROMISED.**

The product spine is sound — Day-1 chain, Home suggestions, Inbox review, Performance Tracker with directional honesty, Leading-Indicator Panel, IL directory seeds, refund audit trail. The customer can see what they got every login, and the engineering bridges the 14-day refund window vs 21-28-day citation gap with leading indicators.

**Top 3 value risks:**

1. **"We did the work" is over-promised on off-site (85% of the game).** Off-site, reviews, Reddit, Wikidata all ship as user-executed checklists. The agency-replacement positioning needs at least one genuine off-site automation (GMB API write is the obvious candidate) by MVP+30 or the marketing line breaks.

2. **Refund-cap timing is unfair to users at the moment that matters.** Day-1 auto-runs consume from the pool the user is later judged against for refund eligibility. One boolean column (user_initiated vs auto_initiated) fixes this. Without it, expect 1-star reviews citing "Beamix burned my runs then capped my refund."

3. **Hebrew-market parity is asymmetric.** Product surface gets full Hebrew love (RTL, Heebo, IL directories, HE content). Business surface (T&Cs, refund clause, Resend templates, Paddle checkout, support SLA) is English-only. For a Hebrew-primary GTM this is a trust crack at exactly the conversion + refund moments.

**Is the customer winning here?** Mostly yes — but the customer who refunds at day 13 because activation hadn't kicked in yet, or who feels they did more work than promised, will tell three other SMB owners. That's the refund-rate and word-of-mouth tax we're booking unless risks 1, 2, 3 are mitigated before invoicing customer #1.
