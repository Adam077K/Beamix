# Beamix Marketplace + Agent SDK + Reward System — Spec v1

**Date:** 2026-04-27
**Author:** Marketplace PM
**Status:** v1 — implementation-ready
**Scope:** Q7 LOCKED surface — ships at MVP (constrained form), opens to third parties MVP-1.5
**Source inputs:** FRAME-5-v2-FULL-VISION, BOARD3 seat-1 (Architect L0/L8), PRD-wedge-launch-v1 Feature 17

---

## 0. Lock summary

- **At MVP (Q3 2026):** `/marketplace` page is live. Catalog populated by **Beamix-authored** workflows + the 5 first-party agents (the 7 NEW domain-expert agents minus 2 deferred). No third-party agents.
- **At MVP-1.5 (Year 1 Q3):** Agent SDK opened to 10–30 hand-picked early-access partners.
- **At Year 1 Q4:** Open marketplace, third-party agents live, reward system v1 active, first Hall of Fame.
- **At Year 2:** Workflow Template Marketplace as a separate surface from agents.
- **Rev share:** 70% developer / 30% Beamix (Shopify standard). Top 10 reward tier: 80/20 for one quarter.
- **Tier-gating:** Install gated to **Build** and **Scale**. Discover sees the catalog read-only with paywall CTA.

---

## 1. Marketplace product surface (~1,000 words)

### 1.1 The `/marketplace` page

The marketplace is a top-level navigation surface in the product app (`apps/web/app/(app)/marketplace/`), discoverable from:
- The main left nav ("Marketplace" item, between `/crew` and `/inbox`).
- A "Browse more agents" CTA at the bottom of `/crew`.
- A "More like this" tile inside any individual agent's settings page.
- A contextual "There's an agent for that" suggestion inside the Inbox when an unaddressed action class is detected (e.g., "Yelp review came in — install the Review Responder").

The page has three zones, top to bottom:

**Zone A — Spotlight strip.** A single hero card rotating between (a) the current month's "Most-Improvement Agent" winner (reward tie-in), (b) a featured Workflow Template, (c) a curated vertical pack (post-MVP). The strip uses the same horizontal hand-drawn aesthetic as the rest of the product.

**Zone B — Discovery grid.** A responsive 3-column grid of agent cards. Each card shows: agent icon (developer-supplied SVG), name, one-line value prop (max 80 chars), install count badge ("12,847 installs"), star rating (1 decimal, e.g., "4.7"), reward badges if any ("Top Rated", "New", "Most Improvement"), credit cost per run, and an Install button. Cards use a 4:3 aspect ratio. Hover surfaces a 2-line description preview.

**Zone C — Filters and search.** Persistent left rail (collapses to drawer on mobile). Filters described in §1.2. Sort options: Most installed · Most used (last 30d) · Highest rated · Most improvement · Newest · Price (low→high).

### 1.2 Categories and taxonomy

Every listing has exactly one **primary category** and unlimited **tags**. Categories are exclusive (one of) so the catalog stays navigable; tags are inclusive (many of) for flexibility.

**Primary categories** (mutually exclusive):

1. **Vertical-specific** — built for one industry. Examples: Restaurant Menu Optimizer, Plumber Emergency-Hours Agent, SaaS Pillar Content Pack, E-commerce Product Page Optimizer. Sub-tags: SaaS, E-commerce, Local Services, Healthcare, Legal, Hospitality.
2. **Engine-specific** — optimizes for one AI engine's quirks. Examples: Perplexity Citation Hardener, ChatGPT Brand Memory Agent, Gemini Schema Optimizer, Yelp Review Responder. Sub-tags: ChatGPT, Claude, Gemini, Perplexity, AI Overviews, Grok, Bing Copilot, Yelp, Google Business Profile.
3. **Action-specific** — performs one cross-cutting job. Examples: Newsletter-to-FAQ Converter, Truth-File Builder, Competitor Citation Stealer, Schema Markup Generator. Sub-tags: Content, Schema, Citations, Reviews, Outreach, Reporting.
4. **Reporting & analytics** — generates analyses, not changes. Examples: Monthly Lead Attribution Deep-Dive, Competitor Movement Tracker, Engine Drift Alerter. These produce reports into Inbox, never auto-apply.

**Tags** are free-form vocabulary curated by Beamix (we control the canonical list to prevent dilution). Examples: `auto-apply-safe`, `requires-write-scope`, `experimental`, `multilingual`, `requires-cms`.

### 1.3 Per-agent listing page (`/marketplace/[agent-slug]`)

The listing page is the conversion surface and renders these sections in order:

1. **Header.** Icon, name, developer name (linked to developer profile), one-line tagline, primary category, install count, star rating (with rating distribution histogram on hover), price model summary, **Install** button (sticky on scroll). If reward badges apply, they sit beneath the title as colored chips.
2. **Reward status panel.** Shows any active reward: "Top 10 — earning 80% rev share through Q3" or "Most-Improvement winner, March 2026" or "Featured in SaaS Pack". If none, the panel is hidden, not stubbed.
3. **What it does.** Markdown body, max 1,500 words. Developer-authored. We render with our prose-mirror config (no arbitrary HTML, no inline scripts).
4. **How it integrates.** Auto-generated from the agent's manifest: which engines it touches, which scopes it requires, which other agents it can hand off to or receive from, where its outputs land (Inbox / direct-apply / report-only).
5. **Permissions.** Auto-generated from manifest scopes. Plain-English translations of each scope ("Read your Truth File: yes — required to know facts about your business" / "Write to your Google Business Profile: yes — to update hours"). Customer must approve each scope at install (§1.5).
6. **Pricing.** Per the model in §1.6.
7. **Reviews.** Last 25 customer reviews, paginated, with helpfulness votes. Verified-install only. Reviewer name optional.
8. **Changelog.** Auto-generated from the manifest version history, plus developer release notes per version.
9. **Developer info.** Bio, other agents by this developer, response-time SLA on support, security disclosures.

### 1.4 Tier-gating

| Tier | Catalog browse | Install | Why |
|------|----------------|---------|-----|
| Free / Discover | Read-only, blurred install CTA | No | Marketplace is part of "depth"; depth = paid. |
| Build | Full | Yes — up to 3 marketplace agents installed at once | Anchors Build's "more agents than Discover" promise. |
| Scale | Full | Unlimited | Power-user motion. |

The 3-cap on Build is product, not licensing — customers can uninstall to install something else. A "you've reached your Build cap, upgrade for unlimited" upsell triggers on the 4th install attempt.

### 1.5 Install flow

The install flow is a 4-step modal stack, optimized for speed (median <30s):

**Step 1 — Permissions review.** Plain-English list of scopes the agent requests. Each row: scope, what it touches, why the agent needs it, whether it's required or optional. Customer can deny optional scopes. If they deny a required scope, install aborts with the message "This agent can't run without that permission."

**Step 2 — Configuration.** Auto-generated from the agent's `inputs` schema (Zod-typed). Examples: target URL, voice setting (formal / friendly / neutral), maximum runs per week, custom prompt overrides. Sensible defaults pre-filled. Most agents need 0–2 fields; a "skip — I'll configure later" link is always present.

**Step 3 — Trigger setup.** What causes the agent to run. Options: manual only · scheduled (with cron-like UI) · event-driven (subscribe to triggers like `review.received`, `scan.completed`, `competitor.moved`). Triggers are filtered to those the agent declares in its manifest.

**Step 4 — Confirm.** Summary, total credit cost per run, "Install" button. On click: agent is provisioned into the customer's `agents` table; appears in `/crew` immediately; first run executes if a trigger fires; a confirmation toast offers "Run now" as a one-click test.

**Post-install:** the agent shows up in `/crew` with the same UI shell as first-party agents. Its provenance envelope (per Architect spec §239–240) is identical. It writes to Inbox, respects Truth File, runs through pre-publication validation.

### 1.6 Pricing models for marketplace agents

Three supported pricing models at MVP-1.5:

1. **Free.** $0/install, $0/run. Beamix recommends this model for the first version of any new developer's agent — frictionless adoption builds reviews and install count, which feeds rewards. ~30% of catalog at year 1.
2. **Per-action.** Charge per agent run. Range: $0.05–$2.00 per run. Customer is charged in Beamix credits at install-time configured rate. Most common model (~60%).
3. **Subscription.** Monthly fee per installed instance. Range: $5–$99/mo. Used for high-value vertical packs. Auto-billed through Paddle as an add-on subscription, not a separate checkout.

**Revenue share:** 70% developer / 30% Beamix on all paid models. Top-10 reward tier earns 80/20 for one quarter (§3). Beamix collects, payouts monthly via Paddle / Wise / bank transfer (developer's choice during onboarding). Below $50/mo earnings: rolls to next month. Tax: developer is responsible; we issue 1099s in the US and equivalents elsewhere.

---

## 2. Agent SDK for developers (~1,500 words)

### 2.1 Languages

**TypeScript is primary.** Published as `@beamix/sdk` on npm. The SDK is the canonical surface. All examples, docs, and templates are TypeScript-first. The internal Beamix agents (the 11 first-party) are written against the *same* SDK — no internal-only API surface — so dogfooding is total. This is the Stripe pattern.

**Python is secondary.** Published as `beamix-sdk` on PyPI. Generated from the same OpenAPI/JSON-Schema source as the TypeScript SDK to guarantee parity. Released at MVP-1.5. Recommended for data-science-heavy agents (e.g., agents that want pandas / scikit). Performance and feature parity with TS within 1 minor version.

Both SDKs target the same versioned REST/GraphQL surface (`api.beamix.tech/v1`) with the same auth model (developer API keys scoped to a developer account; the SDK injects them).

### 2.2 Agent lifecycle

An agent has 6 lifecycle phases, each with a runtime hook:

1. **Install** (`onInstall`). Called once per customer install. The agent receives the customer's profile, declared scopes, and configured inputs. Use this to do one-time setup: fetch initial data, register webhooks, seed memory. Time budget: 30s. Network calls allowed; LLM calls allowed; writes blocked until validation passes.
2. **Configure** (`onConfigure`). Called whenever the customer changes the agent's settings. Use to re-validate config and update derived state.
3. **Run** (`run`). The hot path. Triggered by schedule, event, or manual invocation. Receives `AgentContext` with `ctx.llm`, `ctx.kb` (knowledge base / Truth File), `ctx.engines` (L3 engine fabric — read AI engines), `ctx.site` (L4 site integration — propose changes), `ctx.memory` (per-customer per-agent persistent state), `ctx.validate`, `ctx.propose`. Time budget: median 8s, p99 60s (per Architect §297).
4. **Stop** (`onStop`). Called when the customer pauses the agent. Cleanup, persist state. No new actions allowed; in-flight actions complete or roll back.
5. **Uninstall** (`onUninstall`). Called when the customer removes the agent. The runtime auto-revokes all scopes, queues rollback of any TTL'd commits authored by the agent in the last 30 days (configurable), and emits an uninstall event to the developer's webhook for retention analytics.
6. **Errors** (`onError`). Called on any unhandled exception in `run`. Receives the error and a partial context. Use to log, notify, or signal recoverability. If `onError` itself throws, the runtime suspends the agent for the customer and opens an incident.

### 2.3 Permissions model

Agents declare scopes statically in their manifest. The runtime grants nothing beyond declared scopes. Scopes are organized into 5 families:

- **`read:truth-file`** — read the customer's Truth File. Required for any agent producing customer-facing content. Beamix-mandated for first-party content agents.
- **`read:scan`** — read scan results, engine outputs, ranking history.
- **`read:provenance`** — read the customer's provenance envelopes (so agents can build on prior agents' work).
- **`read:site:{cms}`** — read from a specific site CMS (`shopify`, `wordpress`, `webflow`, `framer`, `custom`).
- **`write:site:{cms}`** — write to a CMS. Always TTL'd (default 30 days, then auto-rolled-back unless customer accepts).
- **`write:gbp` / `write:yelp` / `write:reviews`** — write to external review platforms via OAuth.
- **`call:llm:{provider}`** — invoke a specific LLM provider through `ctx.llm`. Beamix proxies and rate-limits.
- **`call:engines:{engine}`** — query an AI engine through `ctx.engines`. Metered.
- **`emit:inbox`** — propose actions into the customer's Inbox.
- **`read:agent:{name}`** — read another agent's outputs (cross-agent composition). Customer must approve per-agent.

The customer sees these scopes in plain English at install. They can deny optional scopes. Required scopes that are denied abort install.

### 2.4 Sandbox and security boundaries

Every third-party agent runs inside a **per-tenant Firecracker microVM** (or equivalent — the sandbox is abstract; current impl: Cloudflare Workers + Durable Objects for cheap agents, Fly Machines for heavy). Hard isolation between tenants and between agents within a tenant. No filesystem access, no arbitrary network egress (only Beamix-mediated APIs through `ctx`), no environment variable inheritance, no parent-process secrets.

Outbound network calls go through `ctx.fetch`, which: (a) enforces an allowlist declared in the manifest; (b) attaches no Beamix or customer credentials; (c) logs the request for audit; (d) caps per-run egress at 50 MB.

LLM calls go through `ctx.llm` only. Direct OpenAI / Anthropic / Google calls are blocked at the network layer. This guarantees: (a) Beamix metering for billing accuracy; (b) prompt-injection guards run on every call; (c) we can swap providers without breaking agents; (d) provenance is captured automatically.

Resource limits per agent run: 1 GB RAM, 2 vCPU, 60s wall clock (configurable up to 300s for "long-running" tagged agents), 500 MB write to memory store.

### 2.5 Provenance integration

Third-party agents emit the **same** provenance envelope as first-party agents (Architect §220–240 — `provenance_id`, `agent_id`, `agent_version`, `inputs[]`, `actions[]`, `validation`, `review_state`, `rollback_token`, `ttl`, `confidence`, `blast_radius`). The runtime auto-fills 80% of fields; the agent only declares `actions[]` and `confidence`. The audit log is identical across first-party and third-party — customers (and regulators) cannot tell which is which from the log alone, only from `agent_id`. This is non-negotiable: a third-party agent that bypasses provenance fails publication.

### 2.6 Trust Architecture integration (pre-publication validation)

Per Architect §277–284, the four pre-MVP safety locks are runtime primitives. For third-party agents, this means:

1. **Truth File check** is enforced. The runtime refuses to publish an agent whose manifest does not declare its Truth File scopes. At runtime, content-producing agents must call `ctx.validate(draft)` before `ctx.propose()`. Validation cross-references the draft against the Truth File and rejects unverifiable claims.
2. **Pre-publication validation** runs on every agent output. Per-agent-class validators (content, schema, review-response, citation) are owned by Beamix; agents cannot bypass them. Validators check: brand voice fingerprint, sensitive topics, claims-without-source, hallucination markers.
3. **Review-debt counter.** If a customer's review-debt is above threshold, *all* agents (first-party and third-party) for that customer are gated to "propose-only" mode. The agent doesn't have to know about review-debt; the runtime enforces it.
4. **Incident kill switch.** "Report a problem" on any agent's output triggers (a) suspension of that agent for that customer, (b) rollback of the agent's TTL'd actions, (c) incident ticket with full provenance.

The SDK refuses to publish an agent that doesn't conform. `beamix publish` runs a static analysis pass on the manifest and a smoke-test pass on the sandbox before listing.

### 2.7 Three example third-party agents

**Example 1 — Restaurant Menu Optimizer (vertical-specific).**
Manifest scopes: `read:truth-file`, `read:scan`, `read:site:webflow`, `write:site:webflow` (TTL 14d), `call:llm:claude`, `emit:inbox`. Triggers: weekly schedule + `menu.updated` webhook. Inputs: cuisine type, price tier, dietary-restrictions JSON. Behavior: scrapes the customer's menu page, identifies dishes missing structured Recipe schema or AI-friendly descriptions, drafts replacements that include allergens, prep style, and provenance to source ingredients. Proposes changes to Inbox; auto-applies trivial schema-only fixes. Pricing: $0.50/run subscription cap $19/mo.

**Example 2 — Yelp Review Responder (engine-specific).**
Manifest scopes: `read:truth-file`, `write:yelp`, `call:llm:gpt4`, `emit:inbox`. Triggers: `review.received` from Yelp webhook. Inputs: response tone, escalation rules (negative-review threshold). Behavior: drafts a response in the customer's voice, runs sentiment + sensitive-topic validation, proposes to Inbox by default, auto-publishes for 4–5 star reviews if customer opted in. Pricing: $0.10 per response.

**Example 3 — Newsletter-to-FAQ Converter (action-specific).**
Manifest scopes: `read:truth-file`, `read:agent:long-form-authority-builder`, `write:site:wordpress` (TTL 30d), `call:llm:claude`, `emit:inbox`. Triggers: manual, or `newsletter.sent` webhook (Mailchimp / ConvertKit / Klaviyo). Inputs: source newsletter URL, target FAQ page slug. Behavior: extracts Q&A patterns from a newsletter, deduplicates against existing FAQ, drafts new FAQ entries with citation back to the newsletter, validates against Truth File. Proposes; never auto-applies. Pricing: $1.00/run.

### 2.8 Beamix's review process before listing

Every submitted agent goes through a 4-stage review pipeline. SLA: **5 business days** for a first-party developer, **10 business days** for a new developer.

1. **Automated checks** (minutes). Manifest schema valid, scopes within allowlist, sandbox boots, smoke tests pass, no vulnerable dependencies (Snyk + Socket.dev), bundle size <50 MB.
2. **Security review** (1–2 days). Beamix security engineer reviews requested scopes against agent's stated purpose. Looks for over-asks. Reviews network allowlist. Penetration-tests the sandbox boundary if the agent is privileged.
3. **Trust & Safety review** (1–2 days). T&S reviewer runs the agent on 3 reference customer profiles and inspects outputs for: brand-voice match, factual accuracy against Truth File, hallucinations, sensitive topics, jailbreak resilience.
4. **Quality review** (1 day). Listing copy is on-brand, screenshots are real, pricing is plausible, support contact is responsive.

Outcomes: **Approved** (lists immediately) · **Approved with notes** (lists after developer addresses notes) · **Rejected with reasons** (no list; developer can resubmit). Approval is per-version; minor versions get expedited review (24h) if no scope changes.

---

## 3. Reward system (~1,500 words) — Adam's Q7 requirement

### 3.1 Philosophy

The reward system pursues two independent goals that must not be conflated:
- **Customer-facing:** surface the best agents so customers find them. This is curation.
- **Developer-facing:** incentivize quality, not gaming. This is economics.

Vanity metrics (installs) reward acquisition; usage metrics (actions/month) reward retention; rating metrics reward satisfaction; improvement metrics reward outcomes. The reward system pays out across all four to prevent any single number from being game-able.

### 3.2 Reward dimensions

**Dimension 1 — Most-Installed (vanity).**
Definition: cumulative customer installs in the trailing 90 days. Weighted to recent (50% last 30d, 30% prior 30d, 20% prior 30d). Surfaced as: install-count badge on every card. Top 10 each month feature in a "Most Popular" carousel on the marketplace home.

**Dimension 2 — Most-Used (real value).**
Definition: agent runs per active install in the trailing 30 days. *Per active install* is critical — high-install agents that don't get used don't win this. Anti-gaming: a customer's runs are capped at the 95th-percentile run count (so one whale doesn't decide the winner). Surfaced as: a "Most Used" sort option, a "High Engagement" badge for the top 20.

**Dimension 3 — Highest-Rated (satisfaction).**
Definition: weighted average customer rating. Bayesian-averaged so agents with few reviews don't dominate (prior: 3.5 stars with 10 phantom reviews). Minimum 25 reviews to qualify. Surfaced as: rating shown on every card, "Top Rated" badge for ≥4.5 stars with 100+ reviews.

**Dimension 4 — Most-Improvement (Beamix proprietary).**
Definition: median per-customer AI-visibility-score lift attributable to the agent over a trailing 60-day window. We can compute this because we own the scan engine — we know each customer's score before/after install, with statistical attribution against a control of customers who didn't install. Minimum sample: 50 installs with ≥30 days post-install scan data. Surfaced as: a "Proven Lift" badge with the median %-point lift number ("+12 score points"). This is the **moat metric** — no other marketplace can compute it. It's the single most powerful rank in the catalog and we lead with it.

**Dimension 5 — New & Trending.**
Definition: agents listed in the last 60 days with install velocity >2× catalog median. Surfaced as: "New & Trending" carousel, "🔥 Trending" badge.

**Dimension 6 — Workflow Templates** (separate track, post-MVP §4).
Workflows have their own ladder running parallel to agents. Same dimensions, different leaderboards.

### 3.3 Reward types

**Type A — Top-of-marketplace placement.**
Criteria: top 10 in any dimension. Frequency: leaderboards refresh weekly; ranks displayed at month-end. Surfacing: "Most Installed" / "Most Used" / "Top Rated" / "Most Improvement" / "New & Trending" carousels on the marketplace home; corresponding badges on listing cards. Carousels are deterministically ordered by the relevant metric — no editorial override (transparency builds developer trust).

**Type B — Revenue boosters.**
Criteria: top 10 in **Most-Used** OR top 5 in **Most-Improvement** OR Hall-of-Fame inductee. Frequency: quarterly, awarded retroactively for the trailing quarter. Mechanic: rev share for the next quarter bumps from 70/30 to **80/20** (Beamix takes 20%). Communicated as: "You're in the top 10. We're paying you more next quarter." The quarter rolls forward — winners must re-earn each quarter. Total cost to Beamix: capped at ~$500K/year through year 2 (we model conservatively).

**Type C — Beamix-funded grants.**
Criteria: top 3 in Most-Improvement, judged annually. Frequency: once a year, announced at the Hall of Fame event. Mechanic: $25K, $15K, $10K cash grant, no strings, paid via wire / Stripe Atlas equivalent. Total: $50K/year. Comms angle: "Beamix is paying developers for outcomes, not vanity."

**Type D — Co-marketing.**
Criteria: any agent that wins a monthly leaderboard plus opt-in. Frequency: ongoing. Mechanic: joint case study (Beamix produces, developer reviews), blog feature on `beamix.tech/blog`, social amplification, conference speaking slot at the annual event. Cost: marketing time, no cash.

**Type E — Free Beamix Scale subscription for active developers.**
Criteria: developer with ≥1 listed agent and ≥10 active installs. Frequency: ongoing while criteria hold. Mechanic: free Scale tier ($499/mo value) on the developer's own Beamix account so they can dogfood their own agents. Total cost: marginal (we cap at 200 active developers in year 2).

**Type F — Annual Marketplace Hall of Fame.**
Criteria: top 1 in each dimension for the calendar year, plus 3 editorial picks ("Innovation", "Vertical Excellence", "Community Choice"). Frequency: annual, announced at the Beamix Annual event (live + livestreamed). Mechanic: physical trophy, permanent badge on listing, $25K bonus to overall winner, induction into a "Hall of Fame" page on `beamix.tech/marketplace/hall-of-fame`. The event is itself a marketing surface.

### 3.4 Anti-gaming guardrails

- **Self-installs don't count.** A developer's own customer accounts are flagged; their installs and runs are excluded from leaderboards.
- **Sock-puppet detection.** Reviews cluster-analyzed for IP, account age, install pattern. Suspicious clusters get reviews un-weighted (not removed — so we don't tip off bad actors).
- **Run inflation detection.** "Run" counts only when the agent emits an action with `confidence > 0.5` and at least one validated output. Idle runs (no work done) don't count.
- **Improvement attribution is statistical.** The lift metric uses a propensity-score-matched control group; agents that "win" by being installed only on already-improving customers get filtered out.
- **Manual review of top winners.** Before any cash payout, a Beamix human reviews the agent and the customer base. Cash-flowing rewards are not fully automated, by design.

### 3.5 Surfacing rewards in product

Reward state is visible to three audiences:

- **Customers** see badges on cards (Top Rated, Most Improvement, etc.) and reward carousels on `/marketplace`. They don't see economic rewards.
- **Developers** see their reward state in the developer dashboard (`developers.beamix.tech`): current rank in each dimension, distance to next tier, projected payout, historical rewards. This is the engagement loop for developers.
- **Public** sees the Hall of Fame page and the annual report (we publish marketplace stats yearly — total payouts, top developers, growth — to build the platform's reputation).

---

## 4. Workflow templates (~500 words)

A **workflow** is a chain of multiple agents, with conditional branches, that collectively produce an outcome. Examples:

- "New customer onboarding": Truth File Builder → FAQ Agent → Schema Markup Generator → Lead Attribution setup. One install, four agents configured in sequence.
- "Monthly content cadence": Long-form Authority Builder → Citation Fixer → Newsletter Drafter → Newsletter-to-FAQ Converter, on a 30-day cycle.
- "Competitor response": Competitor Movement Tracker → Citation Stealer → Pillar Content Update.

### 4.1 Workflow Builder (power-user feature, ships at MVP-1.5)

A visual graph editor where the customer (or a developer) drags agents onto a canvas, wires their outputs to inputs, and adds conditionals (`if competitor.score_drop > 5%, run X`). Built on React Flow. Each node is an agent (first-party or marketplace); each edge passes the upstream agent's provenance envelope as input to the downstream. Saved as a JSON spec; runs through the same orchestrator as individual agents.

### 4.2 Publishing a workflow

A power user (or developer) clicks **"Publish to Marketplace"** on a workflow they've built. The publish flow:
1. Strip customer-specific config (URLs, secrets, Truth File deltas).
2. Annotate each node with required scopes and minimum tier.
3. Add a workflow-level description, screenshots (auto-generated from the canvas), pricing model.
4. Submit for review (same pipeline as agents — security, T&S, quality).

A published workflow lists in `/marketplace` under a separate **"Workflows"** tab. The catalog UI is shared with agents; only the install flow differs (workflow install also installs each constituent agent if missing, asking the customer for combined permissions in one summary).

### 4.3 Workflow rewards (parallel ladder)

Workflows have the same six reward dimensions as agents (most-installed, most-used, highest-rated, most-improvement, new & trending, plus a workflow-specific "Most Composable" — used as a sub-step in other workflows). Rewards are economically separate (a developer can win in agents AND workflows). The annual Hall of Fame has dedicated workflow categories.

### 4.4 Why this is a separate Year 2 product

Workflow Builder is a 6–9 month engineering investment (graph editor, conditional engine, runtime orchestrator extensions, multi-agent provenance threading). Shipping it post-MVP-1.5 means: (a) the agent SDK has shaken out, (b) we have real telemetry on which agent compositions customers want, (c) the feature lands on a mature platform.

---

## 5. Trust & Safety for marketplace agents (~700 words)

### 5.1 Pre-listing review process

Per §2.8 — automated, security, T&S, and quality stages. The T&S stage in particular runs the candidate agent on **3 reference customer profiles**: a SaaS profile (B2B, technical), an e-commerce profile (DTC, brand-voice-heavy), and a local-services profile (hyper-local, vertical jargon). T&S inspects outputs for: brand voice match, factual accuracy against Truth File, hallucination markers, sensitive-topic handling, prompt-injection resilience (we feed adversarial Truth File entries and check the agent doesn't break), output safety (no PII leakage, no encouragement to violate engine ToS like Yelp's response policies).

A candidate agent that fails T&S gets a **structured rejection** with: which test failed, the offending output, suggested fix. Resubmission is unlimited; we don't penalize learning.

### 5.2 Permissions transparency at install

Pre-install, the customer sees:
- Every scope, plain-English (e.g., "This agent will read your Truth File: required so it knows facts about your business").
- For each write scope: TTL, rollback policy, auto-apply vs propose-only.
- A "permissions diff" if the agent is being upgraded to a new version that requires new scopes — the customer must re-approve.
- Any cross-agent reads (`read:agent:{name}`) are listed individually and require per-agent approval.

This is rendered from the manifest, not free-text from the developer. The developer cannot misrepresent scopes.

### 5.3 Customer-revocable permissions and one-click uninstall

Every installed agent has, in its `/crew` settings panel:
- A scope-by-scope toggle list. The customer can revoke any optional scope at any time. Revoking a required scope pauses the agent.
- A **"Pause"** button (soft stop — no new actions, in-flight finish).
- A **"Uninstall and rollback"** button (hard stop — uninstalls and triggers rollback of the agent's TTL'd actions in the last 30 days). Rollback runs through L4 site integration, with a receipt emailed to the customer summarizing what was reverted.
- A **"Report a problem"** button — kicks off the incident response (Architect §282): suspend, rollback, ticket, customer email.

### 5.4 Agent versioning

Every agent declares a version (semver). The runtime distinguishes:
- **Patch** (`1.0.0` → `1.0.1`). Bug fixes, no scope or behavior changes. Auto-rollout to all customers within 7 days. Customer notified on next interaction.
- **Minor** (`1.0.0` → `1.1.0`). Behavior changes, no scope changes. Auto-rollout with **24-hour customer-notification window**. Customer can pin to old version for 30 days.
- **Major** (`1.0.0` → `2.0.0`). Scope changes or breaking behavior. **Customer must explicitly approve.** Old version continues running until approval or 90-day deprecation deadline.

Pinning is supported for 90 days; after that, the customer must move to a supported version or the agent is auto-paused.

### 5.5 Bad-actor handling, takedowns, refunds

When an agent is reported, abuses scopes, or violates T&S, Beamix can act at three levels:

- **Soft suspension.** Listing hidden from search; existing installs continue. Used while investigating.
- **Customer-side suspension.** All existing installs paused; customer notified with reason. The developer has 30 days to remediate before takedown.
- **Takedown.** Listing removed; existing installs auto-uninstalled with rollback; customer refunded 100% of subscription / per-action fees for the trailing 30 days, paid out of the developer's pending earnings (and Beamix's share if those don't cover it). A public takedown notice goes on the Marketplace transparency page.

Repeat offenders are banned. Banned developers are flagged across all their Beamix accounts (we cross-check tax IDs, payment instruments, IPs) to prevent re-listing under shell accounts.

### 5.6 Truth File compliance for third-party agents

Any agent producing customer-facing content (categorized as "content", "schema", "review-response") must declare `read:truth-file` and route every output through `ctx.validate(draft)`. The validator cross-references the draft against the Truth File and rejects unverifiable claims. Developers cannot disable this. If an agent's category is content-producing and the manifest lacks `read:truth-file`, publish fails. This is non-negotiable: Truth File compliance is the single biggest reason third-party agents are safe to install.

---

## 6. Launch sequence (~300 words)

**MVP (Q3 2026 — at product launch).**
- `/marketplace` page is live with discovery grid, filters, listing pages, install flow.
- Catalog populated by **Beamix-authored**: 5 first-party agents (the 7 NEW domain-expert agents minus 2 deferred — final list set by Domain Expert seat-3) + 4–6 Beamix-authored "preset" workflows (e.g., SaaS Pillar Content Pack, E-commerce Product Page Optimizer). 10–12 listings total at launch.
- SDK exists internally. First-party agents are written against it.
- Reward system v0: **install count and star rating only**. Reward badges shown. No economic rewards yet. Most-Improvement metric is being computed in the background but not displayed (we're collecting baseline data for 90 days).
- Tier-gating active: Build (cap 3 installs), Scale (unlimited), Discover read-only.

**MVP-1.5 (Year 1 Q3).**
- SDK opens to **10–30 hand-picked early-access partners** — selected from existing Beamix customers and partner agencies. Partners get white-glove onboarding (1:1 with a Beamix engineer), free Scale tier, and direct access to the Marketplace PM for feedback.
- Workflow Builder ships internally; partners can build and submit workflows.
- Most-Improvement metric goes live (badges + sort).
- Python SDK ships.

**Year 1 Q4 — Open marketplace.**
- Public SDK open to any developer who passes onboarding (verification, tax forms, sandbox kit).
- Reward system v1 fully active: revenue boosters, grants, co-marketing, free Scale for active devs.
- First annual Hall of Fame event.

**Year 2.**
- Workflow Template Marketplace becomes a separate top-level surface.
- Vertical packs (Plumbing Pack, SaaS Pack, etc. — Architect §569).
- International developer expansion (EU/UK/IL tax & payouts).

---

## 7. Risks + 3 open questions for Adam (~300 words)

### 7.1 Risks

**R1 — Cold-start: marketplace looks empty at MVP.** With ~10 listings, the catalog feels thin. **Mitigation:** the spotlight/featured strip + clear "More agents shipping monthly — built by Beamix" framing. Position constraint as quality ("every agent reviewed by Beamix") not absence. Add 2 listings/month from internal team for the first 6 months.

**R2 — Third-party quality dilutes the brand.** A bad agent that sneaks past T&S poisons trust in the whole platform. **Mitigation:** the 4-stage review pipeline; the Truth File runtime enforcement; the kill switch. Worst-case takedown receipt is public — turns a failure into a credibility signal.

**R3 — Reward gaming.** Developers run sock-puppets to win rewards. **Mitigation:** §3.4 anti-gaming guardrails plus manual review before any cash payout. We accept that gaming the leaderboards is fine; gaming the *cash* requires a human reviewer.

**R4 — Most-Improvement metric becomes hostile data politics.** Developers complain when their agent's lift score is low. **Mitigation:** publish methodology in full; let developers see their attribution model; publish per-agent lift confidence intervals so weak-evidence verdicts can't be weaponized.

**R5 — SDK opening too early.** If we open the SDK before our internal agents are stable, third parties build against a moving target. **Mitigation:** SDK is internally-stable for 6 months before MVP-1.5 opens it. Versioned, deprecation-policied.

### 7.2 Three open questions for Adam

1. **Top-10 rev share boost: 80/20 or higher?** I've specced 80/20 for top-10 quarterly winners. Shopify standard is 80/20 above $1M lifetime revenue; ours kicks in at top-10 ranking, which is more aggressive on cost but a stronger marketing signal. Comfortable with $500K/year max payout exposure, or want to cap tighter?

2. **Beamix-funded grants: $50K/year in year 1 — too aggressive, too conservative, or right?** This is the most "purely promotional" line item. PR upside is significant ("Beamix pays developers for *outcomes*"), but the cash is real. I'd advocate $50K (3 grants of $25K/$15K/$10K). Confirm or adjust.

3. **Discover tier: catalog read-only or fully hidden?** I've specced read-only with paywall CTA on install (so Discover users can window-shop). Alternative is hide entirely (less upsell signal but cleaner Discover experience). Read-only is standard B2B SaaS pattern; recommend it but flagging because it's a UX-philosophy call.

---

*End of Marketplace + Agent SDK + Rewards spec v1. ~5,000 words. Ready for Build Lead and Architect to translate to engineering tickets.*
