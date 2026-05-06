# Product Lead — Board Meeting 2026-04-27

**Status:** Decision document — addresses Adam's new directives (Workflow Builder to MVP, Marketplace rewards removed) and the 7 audit blockers from Customer Journey Audit 3.
**Scope:** Tier-gating matrix, Workflow Builder MVP envelope, permalink permission model, marketplace re-spec, PRD amendment list.
**Word count:** ~2,900

---

## Q1: Tier-gating decision matrix

| Capability | Discover ($79) | Build ($189) | Scale ($499) |
|---|---|---|---|
| /workspace (watch agents work) | Yes — full access | Yes — full access | Yes — full access |
| Browse marketplace | Yes — read-only catalog, no install CTA | Yes — full browse | Yes — full browse |
| Install workflow from marketplace | No — upgrade modal on click | Yes — up to 3 installed at once | Yes — unlimited |
| Build own workflows | No — "+ Workflow" button shows tier-upgrade modal | Yes — up to 3 workflows, max 8 nodes each | Yes — unlimited workflows and nodes |
| Publish workflow to marketplace | No | No — publishing is Scale-only | Yes — any Scale user with a paid subscription can publish |
| Multi-client workspace switcher | No — single domain | No — single domain | Yes — up to 20 domains |
| White-label digest | No | No | Yes — per-client logo, voice, and signature |

### Defense

**Tier-economics angle.** The matrix creates a clean value staircase. Discover at $79 gets the monitoring and repair core: 3 engines, 6 agents, /workspace visibility, /inbox consent flow, Monday Digest, and marketplace window-shopping. The upgrade trigger to Build ($189) is triggered by two visible gates that Discover users hit naturally: the marketplace install cap (they want a workflow they can see but not run) and the competitor-watch lockout. Build adds full marketplace access with a 3-workflow, 8-node cap — enough for Marcus to automate his Monday scan + Slack ping without engineering complexity. The upgrade trigger to Scale ($499) is Yossi-specific: unlimited workflows, multi-client switching, white-label. The gates are designed to be hit in order, not bypassed.

**Marcus/Dani/Yossi journey-fit angle.** Marcus converts at Build because he wants all 11 engines and Competitor Watch — the marketplace is a bonus. He may build 1-2 workflows (his "weekly scan + Slack alert" is a 3-node workflow) and the 8-node cap never binds. Dani converts at Build for the same reasons; she is unlikely to build workflows until month 3 when she's confident in the outputs. Yossi's entire value proposition depends on multi-client switching and white-label — both are Scale-only, which is correct. He needs unlimited workflows to build per-client automation packs. Giving Yossi even one meaningful workflow on Build would reduce his upgrade incentive substantially.

**Anti-cannibalization angle.** The critical risk is that Build's workflow cap (3 workflows, 8 nodes) accidentally serves Yossi well enough to prevent upgrade. The 8-node limit is the guard: Yossi's "monthly client review" template alone is a 6-node workflow per client (loop over clients → run Reporter → generate PDF → email). At 3 clients, he needs 18+ nodes per multi-client sweep — immediately above the Build cap. This isn't a punishing limit; it's a natural size gate. Similarly, workflow publishing is Scale-only because publishing is the marketplace contribution motion — it is Yossi's power-user identity, not Marcus's. Keeping it Scale-only preserves the upgrade story cleanly.

---

## Q2: Workflow Builder MVP scope envelope

### What ships day 1 (MVP)

- Visual DAG editor on React Flow — full canvas with pan, zoom, minimap
- 3 Beamix-authored workflow templates preloaded in the editor (Daily monitoring, Weekly digest with custom report, Monthly client review)
- Trigger types: Schedule (cron-like UI) and Manual only — event-triggers deferred (see below)
- Action nodes: Run agent (any of the 6 MVP agents), Notify (Email + Slack only), Conditional branch (If/Else), Wait for condition
- Per-tier limits enforced: Build = 3 workflows / 8 nodes; Scale = unlimited
- Workflow publishing to marketplace (Scale only) — the publish modal, the stripping of customer-specific config, and the submission flow — but publishing enters the existing T&S review queue rather than a separate reward pipeline
- Per-step "Test this step" button — critical for Yossi debugging; ships day 1
- Validation on every change: cycle detection, orphan node detection, cost estimate per run
- Versioning: save creates a new version; up to 20 versions retained at MVP (not 50 — lower limit reduces storage complexity at launch)
- Dry-run / sandbox preview: yes — the "Test run" button in the workflow topbar executes against mock customer data in a sandboxed context, not against live customer domains. This is a day-1 requirement because without it Yossi cannot validate a workflow before it touches a client's site.

### What is MVP-1.5

- Event triggers beyond schedule and manual: score-change event, competitor-publishes event, external webhook, Truth File / Brief change trigger, API-call trigger
- Loop node (iterate over competitors[] or clients[]) — deferred because the multi-client Yossi use case requires this but it also requires the multi-domain architecture to be stable first; ship after 6 weeks of multi-domain usage data
- Run sub-workflow (calling another workflow as a child) — requires the loop node to be stable
- Cross-agent composition at workflow level (read:agent:{name} scope in workflow context) — the agent runtime needs proven stability under multi-step composition before this is safe at workflow scale
- Workflow versioning extended to 50 versions
- Python SDK for workflow definitions (for developer-builders who want code-first workflow authoring)

### What is Year 1

- Full event-trigger library: External webhook (arbitrary), custom API-call trigger, Beamix CRM-event triggers (scan.completed, review.received)
- Workflow Template Marketplace as a separate catalog surface (distinct from agent catalog)
- Visual workflow analytics (per-node success rate, credit cost over time, step-level p99 latency) — requires 90 days of workflow run data
- Workflow collaboration (multi-user editing on Scale team accounts, if team accounts ship)
- Workflow-level reward dimension on the marketplace leaderboard (Most Composable)

### Reasoning

The scope above is achievable at billion-dollar quality because it uses React Flow as the canvas primitive — not a custom DAG renderer — and scopes the hard engineering to the runtime (trigger evaluation, node execution order, credit metering), where Beamix already has the Inngest job infrastructure. The three Beamix-authored templates mean Yossi does not stare at a blank canvas on day 1; he clones "Monthly client review," adds his client domains, and ships in 5 minutes. Event triggers are the seductive complexity — they require a reliable webhook ingestion layer and a low-latency event bus that Inngest handles well, but they add meaningful QA burden at launch. Deferring them to MVP-1.5 (6 weeks) means they ship when the base workflow infrastructure is proven, not hypothetically stable. The key asymmetry: schedule triggers are deterministic and testable; event triggers require the scan engine, competitor-watch system, and webhook infra to be production-stable simultaneously. Take schedule now, take events after launch.

---

## Q3: Permalink permission model

### Decision: default private, everywhere

Monthly Update permalinks are private by default. This is the correct call and it resolves the highest-stakes contradiction in the current specs (PRD F1 says private-by-default; EDITORIAL §3.3 drifted to public-by-default). The PRD wins. Rationale: the Monthly Update contains lead-attribution numbers, competitor movement data, and score trends — this is competitive intelligence. A B2B SaaS founder (Marcus) forwarding this to his co-founder does not want a public URL that a competitor can find via Google. Making it private-by-default removes the liability; making it easy to share removes the friction.

### Full permission model

**Default state.** Every Monthly Update permalink is private on creation. The link does not resolve without authentication unless explicitly published.

**UI affordance to flip privacy.** Inside the Monthly Update email, a single line below the PDF attachment reads: *"Share this report — generate a public link."* Clicking this opens /reports/[report-id] (the permalink management surface, which must be specced as a route — see PRD amendments). On that page: a toggle, current state ("Private — only you can view this"), and a one-click "Make public" action. Microcopy on toggle-on: *"Anyone with this link can view this report. It won't appear in search engines."* Microcopy on toggle-off: *"Link revoked. Previous visitors will see 'This report is private.'"* The toggle is reversible at any time.

**Privacy controls.** The /reports route maintains a list of all Monthly Update and scan permalinks. Each row shows: report date, current privacy state, view count (private: "—", public: "47 views"), and a Privacy toggle. This is the management surface the EDITORIAL spec referenced but never specced.

**Email PDF attachment.** The PDF attachment works regardless of permalink privacy state. The PDF is a static file attached to the email — it does not require authentication. The permalink and the PDF are separate artifacts. Forwarding via email always works; the public link is the optional upgrade.

**Link expiry.** No expiry by default. Monthly Update links are evergreen (the data is historical; a 6-month-old report is still valid). Password protection on public links is a Scale-tier feature — specify in settings with a short password the customer sets. Rationale for Scale-only: password-protected links require server-side session validation and are primarily useful for Yossi sharing client reports that he doesn't want to fully publicize but does want to send to clients without requiring a Beamix login.

**Yossi's white-label interaction.** Yossi controls the privacy of client Monthly Updates, not his clients. The client receives the PDF via email (always). The white-labeled permalink (subdomain: yossi-agency.beamix.tech/reports/[id] or custom subdomain at Year 1) is set to private by default. Yossi can make it public per-report. His clients cannot directly toggle privacy — they receive the PDF and a link, and Yossi manages the link state. This is the correct model because Yossi is the subscriber; the client is the end-reader. The permission follows the subscriber.

**Scan permalinks (/scan public) — reconciliation.** The /scan public surface is default-public by design and this does not conflict. Scan permalinks are the acquisition surface — they are meant to be shared externally. They contain no competitive intelligence about the customer; they show a business's visibility score, which is the hook for word-of-mouth. Monthly Update permalinks contain operational data (attribution numbers, agent actions, competitor movements) that customers rightly treat as private. These are different artifact types with different sharing norms. The rule is: **acquisition artifacts (scan results) are public-default; operational artifacts (Monthly Updates, agent audit logs) are private-default.** Document this rule in DESIGN-SYSTEM and enforce it consistently.

---

## Q4: Marketplace-without-rewards re-spec

Adam dropped the full reward system (leaderboards, $50K grants, top-10 rev-share boost, Hall of Fame). The marketplace ships at MVP as a workflow-publishing surface. Here is the re-spec.

### What stays

- /marketplace page with discovery grid, filters, per-listing pages, install flow
- 10-12 Beamix-authored listings at launch (agents + workflow templates)
- Tier-gating: Discover read-only, Build installs up to 3, Scale unlimited
- T&S review process (4-stage pipeline) — this stays unchanged. Review is about safety and quality, not rewards. Removing rewards does not reduce the need for vetting.
- Workflow publishing by Scale users — the publish flow in the workflow editor stays
- Install count badge on cards (install count is a factual metric, not a reward)
- Star ratings on cards (customer satisfaction metric, not a reward)

### What is removed

- All reward dimensions (Most-Installed leaderboard, Most-Used, Highest-Rated carousels, Most-Improvement, New & Trending as a reward track)
- Revenue boosters (top-10 80/20 rev share), cash grants ($50K/year), Hall of Fame, co-marketing program as a reward
- The reward-status panel on per-listing pages
- "Most-Improvement" winner rotation in the Spotlight strip
- Reward badges on cards ("Top Rated," "Proven Lift," etc.)

### Ranking/sort default without leaderboards

Default sort: **Editorial curation + install count combined.** At MVP with 10-12 listings, editorial curation is appropriate — Beamix curates the order of its own first-party listings by vertical relevance to the signed-in user (a SaaS-tier customer sees SaaS-relevant listings first; e-commerce customer sees e-commerce listings first). Install count is shown as a factual number on each card but does not drive the default sort. Available sort options: Most installed (30 days) · Highest rated · Newest. No "Most Improvement" sort at MVP (the metric requires 90 days of post-install scan data anyway — the technical prerequisite remains regardless of the reward removal).

### Who can publish

Scale tier only. Any paid Scale subscriber with a Beamix account in good standing can publish a workflow. No third-party developer program at MVP — that is Year 1. At MVP, publishing means a Scale user shares a workflow they built for their own use; the T&S review process vets it before it lists publicly.

### Review process without rewards

The 4-stage T&S review (automated checks, security review, T&S review, quality review) remains intact. The removal of rewards does not change the incentive for careful review — safety is not reward-contingent. The 5-business-day SLA remains for now (with no external developers at MVP, volume is low enough to honor this). The review rationale shifts from "protecting reward integrity" to "protecting platform trust and customer safety." Same pipeline, different framing.

### Discovery without leaderboards

The Spotlight strip becomes an editorial strip (not a Most-Improvement winner rotation). At MVP, it rotates between: (a) a featured workflow template ("Try: Monthly client review — built by Beamix"), (b) a vertically relevant agent ("For SaaS founders: Schema Doctor preset for SaaS APIs"), (c) a new listing announcement ("New: E-commerce Product Page Optimizer"). Beamix controls the editorial calendar for the strip.

Discovery for Discover-tier users (read-only): they see the full catalog with all install buttons replaced by "Install — Build plan or higher" CTAs. The catalog is the demo of what's possible. This is the standard locked-feature pattern.

### Launch communications — what to say externally

"Beamix ships with a marketplace of AI automation workflows — all built and reviewed by Beamix, ready to install in one click." This is accurate and not overpromising. Do not use the word "ecosystem" or "platform" in launch copy — those words imply third-party scale that isn't there yet. Use "library of expert workflows" instead. When third-party SDK opens at Year 1, the messaging graduates to "marketplace" and "ecosystem."

---

## Q5: PRD amendment list

Each amendment references the PRD feature/section it modifies.

**1. PRD F5 (Workflow Builder) — promoted from Year 1 to MVP.**
What changes: Remove Workflow Builder from PRD §5 "Out of Scope." Add as Feature 19 (or absorb into Feature 11 /crew) with acceptance criteria matching Q2 day-1 scope. Ship date constraint: schedule triggers + manual triggers + dry-run + 3 templates at MVP. Event triggers at MVP-1.5.
Cascade: Build Lead needs to add React Flow as a dependency. Engineering estimate needed before PRD is handed off. QA Lead needs workflow-specific test plan (DAG validation, per-tier limits, publish flow). Design Lead needs to verify the workflow editor spec from CREW design §4 is buildable against the MVP scope envelope.

**2. PRD F17 (Marketplace + Agent SDK + Rewards) — substantially rewritten.**
What changes: Remove all reward system content (§3 of Marketplace spec is deprecated). Keep marketplace surface (§1), T&S (§5), and launch sequence amended for reward removal. Revise acceptance criteria: replace "Reward badge appears in /crew after 30 days of marketplace agent use" with "Install count badge and star rating visible on all catalog cards." Feature 17's success metric shifts from "Marketplace agent installs per customer at 90 days ≥25%" (this stays) to "Scale users who publish at least 1 workflow within 90 days of signup ≥10%" (new).
Cascade: Growth Lead's launch copy must not reference rewards, leaderboards, or grants. The "Q7 LOCKED" ship-date description in PRD remains correct (marketplace ships MVP) but the rewards content is removed.

**3. PRD §5 Out of Scope — remove Workflow Builder from this list.**
Simple deletion. The Workflow Builder paragraph in §5 currently reads "Year 1. The power user feature for Yossi ('if competitor X publishes Y, run Z') requires the DAG orchestration layer." This paragraph is deleted. The new scope boundary (event triggers to MVP-1.5) is documented in Feature 19 acceptance criteria instead.

**4. PRD Feature 7 / §3 — 6-agent canon vs. 18-agent /crew display.**
The audit BLOCKER #2 surfaces a gap: PRD F7 ships 6 agents; /crew design §2 shows "18 agents · 11 active · 4 paused · 3 locked" in the header subtitle. This creates a contradiction: what are the locked agents on day 1? Resolution: /crew at MVP shows 6 active agents (the MVP canon) and a "Locked agents" section below the active roster showing 5 additional agents as grayed/locked rows with tier-upgrade labels. The 7th-through-18th-agent monograms from the Domain Expert's full 18 roster do NOT display at MVP — showing agents that don't exist yet is dishonest and confusing. The /crew header subtitle at MVP reads "6 agents · 6 active · 0 paused · 5 locked" (5 = the next tier's agents, not the full 18-agent future). /home tier badge string must match: "6 agents working for you" not "18 agents."
Cascade: CREW design §2.2 (subtitle pattern) and §2.4 (Tier Bar copy) both reference agent counts — both must be updated. Onboarding Step 3 Brief tier mapping must reference "6 agents" not "11 agents" or "18 agents."

**5. PRD Feature 14 / EDITORIAL §2 — voice canon resolution.**
Current state: agent-named on /home Evidence Strip, Beamix-named in Monday Digest, "your crew" in onboarding signature, "Beamix" on Monthly Update. The audit correctly flags this as dissonance.
Resolution: adopt the two-register model. Inside the product (surfaces the customer navigates directly — /home, /inbox, /crew, /workspace): agent names are used. *"Schema Doctor added 3 FAQ entries."* Outside the product (emails, PDF artifacts, shared permalinks): unified "Beamix" voice. *"Beamix added 3 FAQ entries to your services page."* Exception: onboarding Seal ceremony uses "your crew" because it is a product surface that is meant to be personal and constitutional. This exception is documented and limited to the Seal ceremony only.
The PRD F14 acceptance criteria "All emails signed 'Beamix' — no agent names" is correct and stays. The white-label exception for Yossi (agency name replaces "Beamix" in external emails) supersedes — that rule is: white-label overrides the "Beamix" signature; nothing else overrides it. Document the precedence in DESIGN-SYSTEM.
Cascade: EDITORIAL spec §2 must be updated to show the two-register model explicitly. CREW design §1 "outside /crew the product speaks single-character" is correct and confirmed. /home spec §2 must document that Evidence Strip uses agent names (not "Beamix") because it is an inside-product surface.

**6. PRD Feature 14 — Day 1–6 silence (Audit Blocker 4).**
Current state: customer signs up Tuesday; first Monday Digest arrives 6 days later; product is silent.
Resolution: add two event-triggered emails to the MVP email cadence (Feature 14 acceptance criteria): (a) "Day 2 or 3: first finding ready" — fires when the first /inbox item is created (typically 48-72h after onboarding). Subject: *"Beamix found something — your first review is ready."* Body: plain-text, 4 lines, links to /inbox. Signed "Beamix." (b) "Day 5: pre-Monday teaser" — fires Friday morning if Monday is more than 1 day away and the customer has not visited /home this week. Subject: *"Your week so far — quick update from Beamix."* Body: plain-text, 3 bullets (scan status, top finding, credit balance). This is not a Monday Digest replacement; it's a check-in for customers who signed up mid-week. Both emails are off by default in /settings → Notifications with opt-in copy "Get early updates between Monday Digests." Actually: default-on for weeks 1-4 of a new account, then opt-in after week 4. The first month is the highest-churn window; interrupt-driven cadence is correct during it.
Cascade: Email infrastructure build adds 2 Inngest functions. QA Lead must test both trigger conditions.

**7. PRD Feature 2 / Onboarding — Brief escape hatch for vertical misclassification (Audit Blocker 3).**
Current state: onboarding §5.6 says there is no Reject button; the chip dropdowns are populated from the detected vertical KG; a misclassified customer is trapped inside the wrong vertical's chip universe.
Resolution: add a "This doesn't describe my business" link on Step 3 (small, not prominent — 13px, ink-3, below the chip editors). Clicking this navigates back to Step 1 with the industry combobox pre-focused and an inline note: *"We may have misclassified your business. Pick the right category below."* The Brief re-generates from the new vertical selection. This is a recovery path, not a rejection button — the Brief is still written by Beamix; the customer is correcting the input. The escape hatch solves the 20% misclassification risk (PRD Risk 3) without undermining the "constitutional act" framing.
Cascade: Onboarding spec §5.6 must be amended. The Step 1 → Step 3 back-navigation must be added to the onboarding state machine. Design Lead must confirm the "This doesn't describe my business" affordance does not undermine the ceremony visually.

**8. PRD F1 / EDITORIAL §3.3 — Monthly Update default privacy contradiction.**
Resolution is documented in Q3 above. PRD wins: private by default. EDITORIAL §3.3 must be amended to remove the public-default specification. The /reports route (mentioned twice in specs, never specced) must be added to the page list and specced as a first-class route.
Cascade: Growth Lead's "forward this" CTA in Monthly Update emails must change from "share the public link" to "make public and share." This is a one-word UX change that changes the customer's privacy model. Engineering must add the /reports route to the Next.js app router.

**9. PRD F12 (Lead Attribution) — vertical-aware onboarding, SaaS-first UTM framing (Audit Blocker 2).**
Current state: onboarding Step 2 leads with Twilio phone number provisioning. Marcus (B2B SaaS) does not use phone-based attribution; his renewal anchor is UTM-based.
Resolution: Step 2 content is vertical-aware. SaaS-classified customers see UTM-first framing: *"Track which AI engines are sending you signups — we'll generate a tagged link your dev can add to your site."* The phone number option is present but secondary (collapsed under "Also: track phone calls"). E-commerce and local-services customers see the existing Twilio-first framing. Add a "Send setup instructions to your developer" button in Step 2 that emails the customer's developer (email field, pre-filled from the billing email with an edit option) a plaintext setup snippet: UTM tag pasted on main CTA, Twilio number pasted for local contact pages. Add a verification check in Step 2 completion state: if 72h post-setup the Twilio number or UTM tag has not been detected on the customer's domain, trigger a reminder email. These are high-impact adoption fixes; without them the Lead Attribution loop never closes for the SaaS cohort.
Cascade: Onboarding spec §2.2 must be rewritten as vertical-aware. PRD F12 acceptance criteria must add "SaaS customers see UTM-first Step 2" and "Send to developer email button present in Step 2."

**10. PRD §1 / Growth Lead — free-scan → tier-pick handoff (Audit Blocker 1).**
Current state: PRD §1 says "single '$79 or $189 choice' at end of free scan" but no UI spec exists for this micro-moment.
Resolution: the scan result page (/scan) shows a two-column tier picker below the results: Discover ($79/mo) vs Build ($189/mo), with a one-line differentiator for each ("3 engines, 5 agents" vs "All 11 engines, 6 agents, Competitor Watch"). Clicking either opens Paddle checkout pre-configured for that tier. Scale is not shown on /scan — Scale is for agency operators, not the cold-traffic conversion moment. This decision must be confirmed with Growth Lead before /scan design is finalized.
Cascade: Growth Lead must write the tier-picker microcopy. Design Lead must spec the tier-picker component on /scan result. The current /scan storyboard (EDITORIAL §1) ends at Frame 10 with a CTA; a Frame 11 must be added showing the tier-picker.

---

## Open questions for Adam (max 3)

**Q-1: Scale multi-domain: how many domains, and is it flat-rate or per-domain above a threshold?**
The PRD open question Q1 (§6) assumed "Scale includes up to 20 domains" as a flat-rate. This decision must be confirmed before Scale landing page copy and Paddle billing configuration are set. The agency operator (Yossi with 12 clients) needs certainty on whether his client count can grow past 20 without a pricing conversation. My recommendation: Scale includes 5 domains, then $49/domain/month for domains 6-20, then a custom "Agency" conversation above 20. This surfaces the agency value early without giving it away free. But this is a pricing and business model call, not a PM call — Adam must confirm.

**Q-2: Workflow publishing — does T&S review block the MVP ship date, or does day-1 publishing go live unreviewed (Beamix-internal trust)?**
At MVP, publishing is Scale-only. Scale users are paying $499/month — they are not anonymous bad actors. The full 4-stage T&S review (security + T&S + quality stages = 5-10 business days) may be disproportionate for the MVP period when publishing volume is near-zero and all publishers are known paid customers. The simpler model: at MVP, Beamix manually reviews every workflow submission (because there will be fewer than 10 in the first 30 days) without a formal pipeline, and the formal review pipeline ships at MVP-1.5 when third-party developers start publishing. This is the right tradeoff if Adam is comfortable with Beamix editorial control over the initial marketplace. If not, the full review pipeline must be built before MVP ships.

**Q-3: What is the voice model for /crew when it says "18 agents" but MVP only has 6?**
The /crew design spec was written against the full 18-agent vision. The Tier Bar copy, the subtitle, and several acceptance criteria reference counts that don't match the 6-MVP-agent canon. My Q5 amendment #4 above resolves the visible contradiction (show 6 active + 5 locked, not 18 total) — but this changes a significant visual design assumption. The /crew yearbook aesthetic ("18 monogram circles reading like a yearbook") loses its visual weight at 6 agents. Adam should confirm: does /crew at MVP show only the 6 MVP agents, or does it show grayed previews of the full 11-agent eventual roster to create the "crew is growing" narrative? My recommendation is 6 active + 5 next-tier-locked (matching the agent roadmap, not the full 18), but the visual impact on /crew's design ambition is real. Adam should look at the wireframe implications before locking.
