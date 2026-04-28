# Yossi simulator — Board Walkthrough
Date: 2026-04-27
Voice: Yossi · boutique digital agency · Tel Aviv · 12 client domains · Scale $499/mo

---

## Day 0: Adding TechCorp B2B SaaS as client #7

OK. Tuesday 10:14am. Coffee number two. I just signed TechCorp on a ₪9,000/mo retainer last week, they think I'm running a 5-person growth team — really it's me and one part-timer and Beamix. Today I onboard them.

I hit Cmd-K, type "add client", and... nothing. The switcher opens but it's a list of my existing 6 clients. There's no "+ Add client" affordance in the switcher. I have to navigate to /settings, find a "Domains" tab, and there's the button. **First friction. The switcher should be where I add. That's where my muscle memory lives.** Linear lets me create a workspace from the switcher. Why don't you?

Onboarding fires. Step 1: pre-fills `techcorp.io`. I edit nothing. 18 seconds. Fine.

Step 2: Lead Attribution. The PRD amendment says SaaS-classified customers see UTM-first — good, because TechCorp is pure B2B SaaS, no phone calls ever. The "Send setup instructions to your developer" button is exactly what I need — TechCorp's CTO is the one placing the tag, not me. I email it to him. ההפעלה הזאת חוסכת לי שיחה. Good.

Step 3: the Brief. Cream paper. Fraunces. Beamix proposes: *"focus on developer-tooling and API-discovery queries on ChatGPT and Claude, where developers ask 'what's the best library for X.'"* It's accurate. I edit two chips — TechCorp's positioning is observability-specific, not generic API. I see the "This doesn't describe my business" link at 13px ink-3. Good — I don't need it now, but I needed it for client #4 (Halevi Plumbing) when Beamix initially classified them as restaurant. Glad it's there.

I hit **Approve and start.** Seal draws. 2.5 seconds. 

But wait — the BOARD-customer-voice doc says "Brief is constitutional" and the audit flagged that subsequent clients don't get a Brief. **For me, every client MUST get a Brief.** It's not just constitutional — it's how I document what each client is paying me to do, in the system. If I have to onboard 12 clients with full Brief ceremony I will do it. **DO NOT shortcut my onboarding. Each client = full Brief, full Truth File, full Lead Attribution.** This isn't friction — it's the documentation I need to defend my agency relationship.

Step 4: Truth File. I type the 6 fields — TechCorp's hours (24/7, it's SaaS), services (5 product names from their docs), service area (global), 3 claims, voice words ("technical, not corporate"), never-say ("don't claim 'enterprise-grade'"). 90 seconds.

Total Day 0 onboarding: ~4 minutes per client. ×12 clients = 48 minutes lifetime. Acceptable. **What's NOT acceptable**: there's no batch import. If I switch from competitor X to Beamix, I'm typing 12 Truth Files from scratch. Give me a CSV import or a "clone TechCorp's Truth File and edit" button per client.

---

## Daily 9am routine across 12 clients

9:02am. Coffee. Open Beamix. Cmd-K → switcher.

**Client A (Vinotek e-comm).** /inbox: 7 pending items. I scroll. Schema Doctor wants to add Product schema to /collections/reds. Fine. Citation Fixer wants to add 3 FAQ blocks. Fine. FAQ Agent flagged "we offer free shipping" as conflicting with TF (their TF says "free shipping over ₪200") — it auto-revised to "free shipping on orders over ₪200." Approved. J/K nav works. 7 items in 2 minutes.

**Client B (TechCorp, day 7).** /inbox: 3 items. One is a Brief edit suggestion from Brand Voice Guard — "your TF says 'technical, not corporate' but Citation Fixer's last 3 outputs scored 0.71 cosine, below 0.85 threshold; recommend tightening voice fingerprint." This is good. Approved. The other 2 are schema. Quick.

**Client C (Halevi Plumbing).** /inbox: 14 items. Why 14? Because Citation Fixer ran a batch and proposed FAQ entries for 14 service pages. 14 items × 30 seconds each = 7 minutes just for one client. **I want bulk-approve.** "Approve all 14 if all pass validator and confidence > 0.9" — ONE click. The /inbox spec has 3-pane Linear pattern but no bulk-approve. THIS IS A BLOCKER FOR ME at 12 clients. I do not have time to J/K through 14 items per client × 12 clients = 168 items some mornings. **Add bulk-approve filtered by validator-pass + confidence threshold.**

**Client D-L:** 9 more clients. Average 4 inbox items each. ~20 minutes.

Total /inbox sweep: ~35 minutes if no blockers. **35 minutes is too long.** Marcus checks his /home in 5 seconds. I check 12 /inbox queues sequentially. The friction multiplies linearly with my client count, and that's the whole product moat for me — I'm supposed to scale with Beamix, not bottleneck on it.

**/crew check.** Cmd-K → "All clients" view? Doesn't exist. I have to click into each client's /crew separately to see if any agent is in ERROR state. **GIVE ME A MULTI-CLIENT CREW DASHBOARD.** One row per client × 18 columns of agent state. Color-coded. I scan it in 10 seconds. Right now I'm clicking 12 times to do that work. The /crew spec §7.1 specs the multi-client switcher. It does NOT spec the multi-client overview. That's the gap.

**/scans verification before client meeting.** TechCorp's CTO is calling at 11. I open /scans for TechCorp, look at the 4 lenses (Done / Found / Researched / Changed), screenshot the "Done this month" lens, paste into my client deck. Stripe-table grammar works for me here — fast scan, sortable columns, exportable. Good surface.

The /crew table grammar (BOARD converged) is RIGHT for me. Yearbook would have been a disaster at my volume.

---

## Month-end: 12 white-label Monthly Updates

End of month. 1st-of-month at 8:00 AM customer-local, 12 Monthly Update PDFs auto-generate per the EDITORIAL spec §3.

**Where do I review them?** EDITORIAL §3.2 mentions `app.beamix.tech/reports/[report_id]` but the audit caught — `/reports` route is mentioned twice and never specced. Per CREW §7.2, I go to the Reporter agent profile → "Compose for a client" dropdown → select TechCorp → preview. **One client at a time.** Twelve clients = 12 separate page loads.

**This doesn't scale.** Give me a `/reports` index: 12 rows, one per client, columns = [Client · Last generated · Status: Draft/Sent · Action: Review/Send/Edit]. I bulk-trigger "Generate for all" Sunday night, Monday morning I review each draft in a 3-pane Linear-style flow with J/K nav between client drafts. Same pattern as /inbox.

**The white-label per-client config (BOARD converged on per-client, not per-account).** This is the most important Scale-tier decision. For TechCorp I want my agency wordmark + their brand color (#1A4DBE blue). For Halevi Plumbing I want my agency wordmark + their orange. For Vinotek I want THEIR wordmark (they want it to look like in-house) + a tiny "Powered by Beamix" footer turned OFF entirely. Three different white-label configurations from one Scale account.

**Do I bulk-trigger? Edit each? Approve each?** For TechCorp's CTO who's a friend, I edit the cover letter inline (Fraunces signature, I sign it as Yossi). For Halevi Plumbing I trust the auto-output and just click Send. For Vinotek the wife of the owner reads every word so I edit the narrative paragraph for tone. I want a per-client setting: `Auto-send / Review-then-send / Always-edit` so the workflow per client is different and I don't have to think about it month-to-month.

**The Beamix voice vs my agency signature.** The Voice Canon Model B says "Beamix" externally. But I'm white-labeled. EDITORIAL §3.4 says signature changes to `— [Yossi's agency name]`. Good. **This MUST be unambiguous in the spec — white-label OVERRIDES Beamix voice canon, period.** Otherwise a Vinotek client sees "Beamix" in their Monthly Update footer and asks me what Beamix is and I die.

The cream paper survives — yes, keep it. It's part of why my agency artifacts look ₪15K/mo serious. The "Powered by Beamix" footer in Geist Mono ink-3 — keep, default ON, toggle per-client.

Total month-end review time at 12 clients: maybe 2 hours if the /reports index ships. 6+ hours without it.

---

## Building my "competitor → fixer → my Slack → push" workflow

Use case: Acme observability launches a new "API Latency Monitoring" comparison page. I want Citation Fixer to run on TechCorp's matching `/compare/api-monitoring` page within 24h. The diff routes to ME on Slack (`#yossi-techcorp-alerts`), NOT to TechCorp's CTO. If I approve the diff, it pushes to TechCorp's site via Git PR (their dev reviews the PR and merges).

**Open /crew/workflows. Hit `+ New workflow`.** I drag:
1. Trigger: `Event: competitor publishes` → config Acme + page-type "comparison/landing" + recency 24h. ✅ The CREW spec §4.4.1 has this trigger.
2. Action: `Run agent → Citation Fixer` with input filter "URL contains /compare/api". ✅
3. Action: `Notify` channel=Slack, recipient=`#yossi-techcorp-alerts`, severity=high. ✅
4. Wait-for-condition: `previous_step.approved == true` (this is me clicking approve in the Slack message). 
5. Action: `Custom HTTP call` → POST to GitHub PR API on TechCorp's repo.
6. Action: `Notify` channel=Email, recipient=`cto@techcorp.io`, message="A new optimization is ready for review on PR #N."

That's 6 nodes. **Build cap is 8 nodes — I'm fine. But I'm on Scale, unlimited, so it doesn't matter for me. Important: Build users hitting the 8-node cap will rage. Marcus might hit it on a 10-node weekly digest workflow.**

**What's wrong with the spec for my workflow:**

1. **Architect's MVP scope (viewer + template-runner only) KILLS this workflow.** I cannot author "competitor publishes" event triggers in MVP-1 if the editor is read-only. I'm forced to wait for MVP-1.5 (Architect's recommendation: 6 weeks post-launch). **The Product Lead spec wins for me — full DAG editor on Day 1, schedule + manual triggers, event triggers MVP-1.5.** I can live without the `competitor publishes` event trigger at MVP launch — I'll use a daily schedule instead — but I cannot live without the visual editor. Editing JSON in a "developer mode" textbox per Architect's L0/L1 fallback is a NO from me. I'm technical, but I'm not editing JSON DAGs at 9pm before a client meeting.

2. **No "route diff to me, NOT the client" affordance natively.** I built it via Notify-to-Slack + Wait-for-condition + HTTP, but this is the most common Yossi workflow. **Promote it to a first-class node type: `Agency review gate` — node that pauses execution until the Scale account owner approves in Slack/Inbox/email.** Show this template under "Agency operator templates" in the workflow library.

3. **Per-step "Test this step" button (CREW §4.6) is critical and the Architect's MVP scope removes it.** Without it, debugging a 6-node workflow on a live client is malpractice. I will break TechCorp's site once and lose the retainer. **Day 1 dry-run is non-negotiable.** Product Lead got this right. Architect's "ship JSON-mode, defer visual editor" is wrong for the Yossi use case.

4. **Resource conflict detection** (CREW §4.7 rule 2). My workflow has Citation Fixer + a future agent both writing FAQ blocks on the same page. I want this caught at save time, not at 3am when the cron fires.

---

## Publishing the workflow to Marketplace (no rewards)

Adam dropped the rewards ladder ($50K grants, leaderboards, top-10 rev share). Fine. **Why would I still publish?**

Three reasons:
1. **Distribution = positioning.** If `@yossi-agency/competitor-watch-fixer-pr` is in the Beamix marketplace and 47 Build customers install it, that's 47 SMB founders who saw my name. Three of them will email me when their needs outgrow Build. I get one $9K/mo retainer from this marketplace presence per quarter, easy. No leaderboard needed — install count visible on the card is enough.
2. **Forcing function for quality.** My workflows that I publish go through T&S review. That review catches bugs in workflows I'm running on my own clients. Free QA.
3. **Brand of my agency.** "Yossi Agency · 8 published workflows · 312 installs" on my Beamix Marketplace profile is a recruiting and credibility play. I link to it from my agency website. It's worth real money even without a single dollar in rev-share.

**T&S says workflow PUBLISHING defers to MVP-1.5. How do I feel?**

Honestly? I'm OK with it. **For 6 weeks I cannot publish.** I can build private workflows for my 12 clients and run them on Scale. The marketplace publish flow lights up MVP-1.5. As long as the private Workflow Builder ships at MVP Day 1, I'm a $499/mo customer who's already paying back ROI from week 1.

**T&S's reasoning is correct:** cross-tenant TF binding is the load-bearing safety primitive, and publishing exposes it to 12+ unknown installer Truth Files. Better to test this in production with first-party Beamix templates for 6 weeks before opening it up.

But: **don't slip MVP-1.5 to Year 1.** If publishing slips beyond 8 weeks post-launch, I'm losing meaningful upside. Set the date in writing, hold it.

---

## My verdicts on every board decision

**1. Permalink default = private.** ✅ AGREE. If TechCorp's lead-attribution numbers were on a public URL by default and Acme's growth team Googled `site:reports.beamix.tech techcorp` and found it, I'm fired. Period.

**2. /crew = table grammar.** ✅ AGREE. 18 agents × 12 clients = 216 cards. Yearbook is dead at my volume. Table with sticky header, sortable columns, bulk-select checkbox. As specified.

**3. White-label sig = both, tier-gated, cream survives, "Powered by Beamix" footer.** ✅ AGREE — but **per-client config, NOT per-account**. The board converged on this. Make sure engineering doesn't drift back to a single `/settings/whitelabel` config — that breaks me at client #2.

**4. Voice canon = Model B.** ✅ AGREE. Agents named on /home + /crew (where I'm inside the product). "Beamix" on emails/PDFs/permalinks. **Exception: white-label overrides "Beamix" with my agency name.** This precedence MUST be documented in DESIGN-SYSTEM.

**5. Workspace on all tiers.** ✅ AGREE. Watching agents work is the trust-building moment. Even on Discover, gating it kills retention. Dani's right.

**6. Marketplace install gated to Build+ tier.** ✅ AGREE. Discover users browse but don't install. Build is where install economics work — install up to 3 per Product Lead's matrix. Fine.

**7. Workflow Builder gated to Scale-only.** ✅ AGREE — strongly. This is what I pay 2.6× Build for. If Build customers got even 1 working workflow, my upgrade incentive collapses. Build cap of 3 workflows × 8 nodes is also fine — it's the natural size gate per Product Lead. Marcus's 10-node weekly digest will hit the cap and trigger upgrade.

**8. T&S: Workflow Builder ships at MVP for private use; PUBLISHING defers to MVP-1.5.** ✅ AGREE. Cross-tenant TF binding is real risk. Defer publishing 6 weeks. **Hold the date.**

**9. Workflow Builder MVP scope: Architect's "viewer + template-runner only" vs Product Lead's "full DAG + dry-run sandbox at MVP day 1."** ❌ DISAGREE WITH ARCHITECT. **Product Lead wins.** Viewer-only at MVP is a stub. Yossi's workflows are bespoke per client — I cannot run 12 instances of a Beamix-authored template, I need to compose. Drag-drop visual editor + dry-run + 3 templates on Day 1 is what makes Scale worth $499/mo. Architect's 6-week deferral kills the Yossi value proposition. Use React Flow, ship it Day 1. Defer event triggers (just `competitor publishes`) to MVP-1.5; schedule + manual triggers + dry-run is enough at launch.

**10. L2 site integration: manual paste + Git-mode at MVP launch; WordPress plugin MVP-1.5.** ✅ AGREE. **Git-mode is critical for my B2B SaaS clients (TechCorp etc.)** — their devs review PRs, that's the workflow. WordPress plugin for my e-comm clients (Vinotek) — they're on Shopify actually, not WordPress, so I need Shopify app at MVP-1.5 too. Ship parallel tracks per Architect estimate.

**11. Per-client white-label config (NOT per-account).** ✅ AGREE — this is my load-bearing requirement. Each of my 12 clients has different brand colors, logos, voice. Per-account = useless. Per-client = product. Don't drift.

**12. Day 1-6 silence cadence: 4 emails (Day 0 + Day 2 + Day 4 + Day 5 conditional).** ⚠️ NEED MORE INFO. For my own Scale account I don't care — I'm logged in 5×/day. **For my CLIENTS who Beamix doesn't email directly, this is irrelevant.** But for ME during MY first onboarding week, the Day 2 "first finding ready" email would have been useful when I evaluated Beamix. Default-on for weeks 1-4, opt-in after — fine.

**13. AI Engineer's "Full-auto" question: uncertain → always /inbox even on Full-auto mode.** ✅ AGREE. **Confidence threshold 0.9 = auto-apply, below 0.9 = /inbox.** I run Full-auto on Halevi Plumbing (low-stakes plumber FAQs). I run Review-mode on TechCorp (high-stakes B2B SaaS). Per-client autonomy preset (CREW §7.4) is the right primitive. But even Full-auto MUST escalate uncertain calls — if a Brand Voice Guard flag fires on Halevi's content, I want to see it before it goes live, regardless of mode. Trust ratchet only goes up after proven success.

---

## Three things the board missed about my reality

**1. Bulk-approve and multi-client cross-cutting views.** My /inbox volume scales linearly with clients. The 3-pane Linear pattern is for ONE inbox. I have 12. Either I get a "bulk-approve with confidence threshold" filter, OR a "All clients · all inboxes · grouped" view, OR my morning routine is 35 minutes and I churn at month 4. **The product was designed for Marcus (1 inbox, scan in 5 seconds). I am the Scale-tier customer and I'm not designed for.**

**2. Liability and "Powered by Beamix" footer per-client.** If Beamix publishes wrong info under TechCorp's name (white-labeled as my agency), TechCorp fires ME, not Beamix. The audit log is good — but where's the **agency liability E&O posture in my customer-facing TOS?** Trust & Safety covered $1M/$1M for Beamix, but my agency is the proximate party my client sues. I need a contractual indemnification carve-out from Beamix when their agent publishes incorrect content that I, the white-label reseller, cannot pre-validate at scale. **Without that contractual layer, my $499/mo is uncapped legal risk.** Address in DPA before MVP ship.

**3. The marketplace economics for me without rewards.** Publishing without rewards is fine for distribution + positioning + QA. But the LOOP I need is: my published workflow gets installed by Build customers → those installs use Beamix agent credits → some of those installs trigger upgrades to Scale → **at some point Beamix should rev-share with me on Scale upgrades attributed to my published workflows.** Year 1, fine. But put it on the roadmap. Otherwise I'm doing free distribution work for Beamix in perpetuity. The rewards system was the wrong frame ($50K grants, leaderboard theater) — but a quiet "agencies who publish workflows that drive upgrades get a rev-share" mechanic is the right frame for retaining Scale-tier agency operators.

---

## Single thing that would make me a Beamix evangelist

A **multi-client cockpit view** at `/dashboard` (or `/cockpit`) that shows all 12 clients in one Stripe-grade table — columns: client name, score delta this week, /inbox pending count, agents in error, monthly update status, attribution headline. One scan of one page and I know what needs me, across all 12 clients, in 10 seconds. That single surface, plus the Workflow Builder full DAG editor at MVP Day 1, plus per-client white-label configs — and I am a $499/mo Beamix customer for life, plus three referrals a quarter to other Tel Aviv agencies. תכל'ס.

— Yossi
