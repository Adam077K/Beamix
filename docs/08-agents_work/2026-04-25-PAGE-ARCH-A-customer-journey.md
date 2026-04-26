# Page Architecture Audit — Customer Journey First (Agent A)
Date: 2026-04-25
Lens: Sarah (Tel Aviv dentist) + Yossi (SEO consultant managing 20 client domains) — what jobs they actually do, mapped to the 10 proposed pages, audited against real comparable products.

---

## PART 1 — SARAH'S FULL JOURNEY (Tel Aviv dentist, 52, 2-chair practice)

### 1.1 Discovery
Most likely a friend referral, an Israeli SMB Facebook group, or a Google search after she heard a podcast saying "AI is sending patients away from clinics that don't show up in ChatGPT." Less likely: SEO ad, content marketing.
Job: "Am I being mentioned by AI? If no, why? Can someone fix it for me without me having to learn what schema is?"

### 1.2 Public Scan Moment (`/scan`, pre-signup)
She lands on `/scan` with a single input. Pastes `dr-cohen-dental.co.il`. Watches the 15-17s animation.
**What MUST be on the page:**
- ONE big input — domain
- A score after 15-17s with a one-sentence diagnosis ("You're mentioned in 3 of 9 AI engines — your FAQ schema is missing")
- 1-3 specific recommendations she can read in Hebrew
- A clear CTA: "Save these results — $79/mo, money-back in 14 days"

**What she does NOT need:** Per-engine breakdown, per-query data, raw model output, recommendations beyond top 3, competitor comparison. **All Yossi territory.**

**Frequency:** Once-ever. After signup, never returns to /scan. Critical insight: this is an acquisition surface, not a product surface.

### 1.3 Signup + Onboarding (Day 0)
Pays. Confirms business name + industry (autofilled from scan). Picks Hebrew. Sees "We'll start with Content Optimizer for your homepage." Clicks "Let's go."
**Friction risks:** >4 screens = abandon. "Configure agents" = abandon. Language toggle buried in settings = alienated.
Frequency: Once.

### 1.4 Day 1 (first hour after signup)
Lands on `/home` with score already populated (carried from public scan). Sees: "Your AI Visibility Score: 42 — ↑ run top fix to improve" and a single "Run top fixes — 14 credits" button.
- Clicks. Workspace opens, agent runs ~90s while hand-drawn step animation plays.
- Toast: "Your homepage copy is ready for review." Clicks toast → Inbox → reads new copy → Approves.

**Total Day 1 time:** ~5 minutes. **Total clicks:** 4. **Pages visited:** /home, /workspace, /inbox.
**She did NOT visit:** /scans, /competitors, /automation, /archive, /settings.

### 1.5 Day 2-7 (forming the habit)
Opens Beamix once daily over coffee, ~45s/session.
- Glances at /home for the score
- If notification badge on Inbox → clicks Inbox, approves 1-2 items
- Closes the tab

**She does NOT:** open /scans, browse /competitors, configure schedules, change settings.
**Highest-frequency page for Sarah:** /home (daily). #2: /inbox (3-4×/week).

### 1.6 Week 2-4
Visits less frequently — once every 2-3 days. Trusts the product. May glance at /competitors ONCE out of curiosity ("Is Eli the orthodontist beating me?").
Has now learned: where score lives, where Inbox lives. **Has NOT learned Cmd+K, ?, doesn't know /scans exists.**

### 1.7 Month 2-3 (steady state)
~2 sessions/week, 60s each. Triggered by weekly digest email or notifications.
**Key insight:** Her relationship becomes mostly **email + Inbox**. Dashboard is confirmation, not workspace. If email digest is good, she barely opens the app.

**Page frequency for Sarah at steady state:**
| Page | Frequency | Time |
|---|---|---|
| /home | 2-3×/week | 30s |
| /inbox | 1-2×/week | 60-90s |
| /competitors | 1×/month | 2-3 min (curiosity) |
| /scans | 1-2×/year | (only if score crashes) |
| /workspace | 1-2×/month | (only if she manually triggers) |
| /automation | NEVER (she'd be terrified) |
| /archive | NEVER (no reason) |
| /settings | 1-2×/year (billing emails, language) |

### 1.8 Month 6 — Renewal
Stays IF she's seen at least one tangible win OR score visibly trended up over 6 months.
Churns if: Inbox has been empty 4+ weeks ("what am I paying for?"), score hasn't moved, billing surprise.
**Renewal moment lives on:** /home (score trend) + email digest. Not on /settings/billing — too late by then.

---

## PART 2 — YOSSI'S FULL JOURNEY (SEO consultant, 20 client domains)

### 2.1 Discovery
SEO Twitter / X, SEO Slack community, GEO conference, Reddit thread comparing Otterly/Profound/Peec. Arrives skeptical. Already evaluated 3 competitors.
Job: "Show me everything per-engine, per-query. If I can't see raw data, I close the tab."

### 2.2 Public Scan Moment
Pastes ONE of his 20 client domains as a test. Hits skip after 4 seconds. Lands on results.
**He clicks:** "Gemini 45" immediately for per-query drilldown.
**What seals the deal:** He sees raw model output for one query in Geist Mono.
**Critical finding:** He signs up only after confirming he can manage 20 domains in one account. **The public scan must answer: "Can I add multiple domains?" — currently nowhere in the page list.**

### 2.3 Signup + Onboarding
Skips the recommended agent. Picks "Custom" or skips step 3. Wants dashboard fast.
Looking for: way to add other 19 domains. If not found in first 30s, opens support chat or leaves.

### 2.4 Day 1 (first hour)
1. Lands on /home for one client
2. Clicks score → drills 4 layers deep
3. **Hits Cmd+K to find domain switcher — make-or-break moment**
4. Bulk-selects 8 recommendations, runs with Cmd+Enter
5. Watches workspace, expands every step's chevron for raw queries
6. Goes to /inbox, reviews with diff view, types feedback into Request Changes
7. Goes to /scans, exports audit log as CSV
8. Goes to /competitors, manually adds 5 known threats
9. Goes to /automation, sets up weekly recurring scan with custom cron
10. Goes to /settings looking for API access, team seats, white-label

**Total Day 1 time:** 60-90 minutes. **Pages visited:** ALL TEN.

### 2.5 Day 2-7
Opens Beamix 2-3× per day. 5-15 min per session. Bounces between clients.
**Critical workflow:** Switch client domain → check score delta → review inbox for that client → approve/reject → next client.
**Without multi-domain switcher, he opens 20 browser tabs. This is broken.**
**Highest-frequency pages for Yossi:** /inbox (multiple daily), /scans (per-client deep dives), /competitors (per-client analysis).

### 2.6 Week 2-4
Monday morning ritual: runs scans across all 20 clients. Tuesday: batch review in Inbox. Friday: exports reports for client invoicing.

**Pages he uses heavily:**
- /inbox — daily, 10-15 min
- /scans — per-client export
- /competitors — for client narratives
- /automation — set once, monitored weekly

### 2.7 Month 2-3 (steady state)
Running ~80 agent runs/week across 20 clients.
**Critical needs:**
1. Multi-domain switcher (top-of-app dropdown, like Vercel project switcher or Stripe account switcher)
2. Client-grouped inbox — items filtered by client, with bulk-approve per-client
3. Reports/exports — weekly per-client PDF or CSV he attaches to client deliverables
4. API access — to plug Beamix into his Notion client dashboards

**The current 10-page list addresses #1 and #3 incompletely.**

### 2.8 Month 6 — Renewal
Stays if Beamix saved hours/week vs Otterly/Profound + delivered exportable client-ready reports.
Churns if: switching clients painful, can't white-label reports, billing isn't seat-aware.
**Renews on Scale tier ($499/mo) ONLY if agency-friendly features exist.**

### 2.9 Page frequency for Yossi at steady state

| Page | Frequency | Time |
|---|---|---|
| /inbox | 2-3×/day | 10-15 min |
| /scans | daily | 5 min |
| /competitors | daily | 5 min |
| /home | per-client landing, ~10×/day | 30s each |
| /workspace | several times daily | 2-5 min |
| /automation | weekly | 5 min |
| /archive | weekly (export prep) | 10 min |
| /settings | monthly | 5 min |
| /scan | NEVER post-signup |

---

## PART 3 — PAGE VALIDATION AUDIT

| Page | Sarah | Yossi | Verdict |
|---|---|---|---|
| /scan | once | once | KEEP — but recognize it's an acquisition surface, NOT in the authenticated sidebar |
| /onboarding | once | once | KEEP — recognize it's a FLOW (4 sequential routes), NOT a product page |
| /home | daily | many×/day | KEEP — Sarah's primary surface, the product's center of gravity |
| /inbox | weekly | daily | KEEP — Yossi's highest-frequency page |
| /workspace | transient | active | KEEP — needs separate page because the artifact (streaming agent output + step list) needs full screen |
| /scans | rare | daily | KEEP — primarily Yossi. For Sarah, "Last scan: Tuesday" link on /home routes here |
| /automation | NEVER | weekly | KEEP, **RENAME to /schedules** — Sarah finds "Automation" technical |
| /competitors | monthly | daily | KEEP — high value for both |
| /archive | NEVER | weekly (export prep) | **KILL — merge into /inbox as "Completed" tab** |
| /settings | 2×/year | monthly | KEEP |

**Linear precedent confirmed:** No comparable product (Linear, Notion, Stripe, Granola) has /archive as a top-level page. They use filter dropdowns or status tabs. Beamix should follow.

---

## PART 4 — MISSING PAGES

### 4.1 Multi-Domain Switcher / "Workspaces" — CRITICAL for Yossi
**Journey moment:** Yossi managing 20 clients. Currently nothing in the page list lets him scope the entire app to one client.
**What it contains:** A top-of-sidebar dropdown (Vercel project switcher / Linear workspace switcher pattern). Every page below scopes to that domain. "+ Add domain" CTA.
**Comparable products:** Vercel, Stripe Dashboard, Linear, Notion all have workspace/project switcher in sidebar header.
**Verdict:** ADD as `/domains` page (for management) + chrome dropdown (for switching). Without this, Scale tier is unsellable to consultants.

### 4.2 Reports / Exports — CRITICAL for Yossi at $499 Scale
**Journey moment:** Yossi prepares monthly client deliverables. Needs branded PDF reports per client.
**What it contains:** Report templates, schedule generation, white-label header/logo (Scale tier), download history.
**Comparable products:** Stripe Dashboard "Reports" top-level. Profound "Brand Report." Otterly "Brand Report" module.
**Verdict:** ADD as `/reports` — Scale-tier feature, gated. Sarah never sees it.

### 4.3 Help / Documentation
**Journey moment:** Sarah hits confusion ("what does FAQ schema mean?"). Yossi wants API docs.
**Comparable products:** Linear has /docs route + ? cheatsheet. Stripe separate docs site. Granola in-app help drawer.
**Verdict:** Help DRAWER triggered from ?, plus separate docs.beamix.tech for full reference. **No new sidebar page needed.**

### 4.4 Notifications inbox (separate from review /inbox)
**Critical naming clash to resolve:** Linear's "Inbox" = notifications. Beamix's "Inbox" = review queue (Linear's "Triage").
**Verdict:** ADD a notifications surface — likely as bell-icon dropdown (chrome, not sidebar page). Alternative: rename Beamix's /inbox to /review or /triage and use /inbox for notifications. Adam's call.

### 4.5 "Crew" / Agent Roster — BRAND-CRITICAL
**Journey moment:** Sarah heard there are 11 agents. Where does she go to see them? Yossi: "I need agent-specific settings (e.g., 'Content Optimizer should always sound formal' for client X)."
**Comparable products:** Profound has /agents top-level page with cards per agent. Notion AI features browsable in panel.
**Verdict:** ADD as `/crew` — 11-agent roster page. For "Beamix is your AI team" brand promise, the team needs visible roster. Sarah ~1-2×/month (curiosity), Yossi weekly (per-agent config).

---

## PART 5 — COMPANIES ALREADY DOING THIS

### Linear (linear.app/docs)
**Sidebar pages:** Inbox (notifications), My Issues, Active/Backlog/Triage, Projects, Cycles, Views (saved filters), Roadmap, Settings.
**Lessons:**
- Linear's "Inbox" is notifications; "Triage" is review queue → resolve Beamix naming clash
- "Views" (saved filters) replaces "Archive" entirely → confirms /archive should die
- 7-8 sidebar items max — Beamix should aim for similar restraint

### Notion (notion.so)
Workspace tree IS the navigation — no fixed pages. Sidebar = user-created hierarchy + system surfaces (Inbox, Settings, Templates, Trash).
**Lesson:** "Trash" is Notion's archive — accessible but not prominent. Confirms archive-as-secondary pattern.

### Granola (granola.ai)
**Pages:** Notes (list of meetings), Folders, Settings. Three top-level surfaces. Lean.
**Lesson:** Focused product needs 3-5 pages, not 10. Sarah doesn't need 10.

### Stripe Dashboard (docs.stripe.com/dashboard/basics)
**Pages:** Home, Payments, Customers, Products, Billing, Reports, Connect, More. ~7-8 visible.
**Lesson:** "Reports" is its own top-level page — confirms missing-page #4.2. Numbers clickable to drill-down — same pattern as Beamix's Score Drilldown.

### Mercury (mercury.com)
**Pages:** Home, Accounts, Send Money, Cards, Recipients, Bill Pay, Treasury, Insights, Settings. ~9 pages.
**Lesson:** "Insights" (= Beamix's competitor intelligence) is separate. Validates /competitors as standalone.

### Superhuman (superhuman.com)
Inbox is the product. Splits, snippets, search. No "pages" in dashboard sense.
**Lesson:** Keystroke-driven power product can have very few visible pages. /? cheatsheet does the work.

### PostHog (posthog.com)
**Pages:** ~11 pages (analytics product, more sprawl).
**Lesson:** Analytics products tend toward sprawl. Beamix is closer to Granola/Linear (focused workflow) than PostHog.

### Profound (tryprofound.com)
**Pages per docs:** Answer Engine Insights, Conversation Explorer, Opportunities, Agents, Brand Report, Competitive Benchmarking, Shopping. ~6-7 pages. **No public scan, no Inbox-like review queue.**
**Lesson:** Beamix's /scan and /inbox are differentiators. Profound has no review queue because they don't have "agents do work, you approve" model.

### Otterly.ai (otterly.ai/features)
**Pages:** AI Prompt Research, AI Search Analytics, Content Audit, GEO Optimization, Brand Report, Competitive Benchmarking. Heavy analytics, no agent execution.
**Lesson:** Don't copy Otterly's IA — wrong product shape (monitoring vs execution).

### Peec / AthenaHQ
Similar to Otterly + Action Center. No agent-driven workflow. No review queue.
**Lesson:** Beamix's competitive moat IS the review-and-approve loop. /inbox + /workspace are the differentiation.

---

## PART 6 — RECOMMENDED FINAL PAGE LIST

**8 sidebar pages + 2 flow surfaces + 1 Scale-tier page + chrome elements.**

### Authenticated sidebar pages (8)

| # | Page | Purpose | Sarah | Yossi |
|---|---|---|---|---|
| 1 | `/home` | Morning briefing — score + top fixes | daily | many×/day |
| 2 | `/inbox` | Review queue (tabs: Pending / **Completed** absorbs /archive) | weekly | daily |
| 3 | `/workspace` | Agent execution viewer | transient | active |
| 4 | `/scans` | Scan history + per-scan deep dive | rare | daily |
| 5 | `/competitors` | Competitor intelligence | monthly | daily |
| 6 | `/crew` (NEW) | 11-agent roster + per-agent settings | curiosity 1-2×/mo | weekly |
| 7 | `/schedules` (RENAMED from /automation) | Recurring scans + auto-fix configs | NEVER | weekly |
| 8 | `/settings` | 5 tabs: Profile / Billing / Language / **Domains** (Yossi) / Notifications | 2×/year | monthly |

### Non-sidebar surfaces (2)

| # | Surface | Type | Purpose |
|---|---|---|---|
| 9 | `/scan` | Public, no-auth | Acquisition — public scan + 15-17s reveal |
| 10 | `/onboarding/[1..4]` | Gated flow, post-Paddle | One-time setup — business profile, language, first agent, credits |

### Scale-tier additional (gated)

| # | Page | Tier | Purpose |
|---|---|---|---|
| 11 | `/reports` | Scale ($499) only | White-label PDF/CSV exports for Yossi's client deliverables |

### Chrome elements (not sidebar pages)
- Multi-domain switcher (top of sidebar) — invisible to Sarah, critical for Yossi
- Notifications bell (top-right) — passive alerts, separate from /inbox review
- Cmd+K palette
- ? cheatsheet overlay

### What changed from Adam's 10
- /scan, /onboarding → out of sidebar (acquisition + flow surfaces)
- /archive → KILLED, merged into /inbox as "Completed" tab
- /automation → RENAMED to /schedules
- NEW: /crew (11-agent roster, brand-critical)
- NEW: /reports (Scale-tier client exports)
- NEW chrome: multi-domain switcher, notifications bell

---

## PART 7 — OPEN QUESTIONS FOR ADAM

1. **/inbox naming clash:** Linear uses "Inbox" for notifications and "Triage" for review. Beamix's /inbox is review. Should Beamix rename to /review or /triage and use /inbox for notifications? Or keep /inbox for review and use a notifications bell dropdown only?

2. **Multi-domain mode:** Is Beamix sold per-domain (Yossi pays $499 × 20 = $9,980/mo, unrealistic) or is Scale tier multi-domain (Yossi pays $499 once for up to 20 domains)? **This pricing decision drives the entire Yossi journey.**

3. **/crew page:** Is the 11-agent roster a must-show page (brand promise: "your AI team has names") or a back-burner page (Sarah doesn't need it)? Recommendation is to ship it.

4. **/archive death:** Confirm comfort with killing /archive as a top-level page and absorbing it into /inbox as "Completed" tab.

5. **Public /scan in repo vs Framer:** /scan is currently in this repo. CLAUDE.md says marketing lives in Framer. Should /scan move to Framer at `beamix.tech/scan` with the product app starting at `app.beamix.tech`?

---

## SUMMARY

**3 most surprising findings:**
1. **/archive should die.** No comparable product has it as a top-level page. Filter/tab, not destination.
2. **Two pages missing for Yossi to not churn:** multi-domain switcher (chrome) and /reports page. Without these, $499 Scale tier is unsellable to consultants.
3. **/crew (agent roster) is brand-critical and missing.** If brand promise is "your AI team is real and named," there must be a page where users can see the team.

**Highest-frequency:**
- Sarah: /home (daily, 30s) — morning briefing
- Yossi: /inbox (multiple daily, 10-15 min) — primary work surface

## Sources
- linear.app/docs — Inbox (notifications) vs Triage (review)
- docs.stripe.com/dashboard/basics — Reports as top-level
- tryprofound.com/features/agents — competitor IA: Brand Report, Agents
- otterly.ai/features — competitor IA: monitoring-only product shape
- vercel.com/dashboard — multi-project switcher pattern
- mercury.com — Insights as separate page validates /competitors
