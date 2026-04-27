# Board 3 — Seat 1: The Product Architect
**Author:** Product Architect (Stripe-platform / Linear-principal / Anthropic-API / Vercel-edge lineage)
**Date:** 2026-04-26
**Subject:** The maximum-ambition Beamix architecture. Build the product that no competitor catches.

---

## Preamble — the framing reset

Frame 5 is a conservative diagnosis. It correctly identifies the safety holes Frame 4 v2 had, correctly flips public-by-default to private-by-default, and correctly demotes the 11-agent roster to internal architecture. But Frame 5 then *over-corrects*: it cuts depth in the name of execution, when the right move is to **build deeper**, because the team is now effectively 500 engineers (AI agents do the engineering work). The constraint is no longer headcount. The constraint is **architectural clarity**: are the seams in the right places so the product can compound?

This document is the architecture at full ambition. I am not protecting scope. I am protecting *seams* — because the wrong seams at MVP cost 18 months of refactoring later, and the right seams at MVP let 11 agents become 50 in two years without a rewrite.

Beamix's architectural thesis, stated in one sentence:

> **Beamix is a vertical AI operating system for AI-search-visibility, with a private knowledge graph per customer, a public knowledge graph per vertical, an agent runtime that any third party can extend, and an integration surface that turns Beamix into the place customer marketing data lives — not just one more tab.**

If we build that, no competitor catches us. If we build less, we are a feature. The rest of this document is how.

---

## Section 1 — The Beamix architecture at 100,000-foot

### The system as a layered platform

```
┌──────────────────────────────────────────────────────────────────────┐
│  L8 — PUBLIC SURFACE                                                 │
│       /scan public · Beamix Index (opt-in directory) · Permalinks    │
│       Embed widgets · Public State-of-GEO data products              │
├──────────────────────────────────────────────────────────────────────┤
│  L7 — CUSTOMER PRODUCT (the dashboard Sarah sees)                    │
│       /home · /inbox · /scans · /competitors · /crew · /reports      │
│       /workspace · /settings · /schedules                            │
├──────────────────────────────────────────────────────────────────────┤
│  L6 — COMMUNICATION LAYER                                            │
│       Monday Digest · Monthly Update · Event briefs · Slack/Teams    │
│       SMS alerts · White-label rendering · Permalink generator       │
├──────────────────────────────────────────────────────────────────────┤
│  L5 — AGENT RUNTIME (the heart)                                      │
│       Scheduler · DAG orchestrator · Conflict resolver · Provenance  │
│       Sandbox · Pre-publication validator · Review-debt counter      │
│       Replay/rollback · Observability bus · Agent SDK                │
├──────────────────────────────────────────────────────────────────────┤
│  L4 — KNOWLEDGE LAYER                                                │
│       Customer Truth File · House Memory · Brief · Brand Voice FP    │
│       Industry Knowledge Graph · Citation Vault · Receipts ledger    │
├──────────────────────────────────────────────────────────────────────┤
│  L3 — AI ENGINE FABRIC                                               │
│       Adapter pool (11+ engines) · Query workers · Parser farm       │
│       Response corpus · Test harness · Citation deduper              │
├──────────────────────────────────────────────────────────────────────┤
│  L2 — CUSTOMER SITE INTEGRATION                                      │
│       WordPress plugin · Shopify app · Webflow integration · Generic │
│       JS snippet · Edge worker proxy · Git-mode (PR to repo)         │
│       Schema applier · FAQ injector · Rollback engine                │
├──────────────────────────────────────────────────────────────────────┤
│  L1 — ATTRIBUTION + IDENTITY                                         │
│       Tracked numbers (Twilio) · UTM/form tagging · CallRail bridge  │
│       Conversion store · Identity graph · CRM bridge                 │
├──────────────────────────────────────────────────────────────────────┤
│  L0 — PLATFORM PRIMITIVES                                            │
│       Auth · Tenancy (single + agency multi-tenant) · Billing        │
│       Audit log · Webhooks · Public API · Marketplace · Sandbox      │
└──────────────────────────────────────────────────────────────────────┘
```

The 9 layers each have a single job, a clean contract upward and downward, and a versioned schema. Every layer is independently deployable. This is the Stripe pattern: each layer is a product with its own SDK and docs, even when only Beamix's own agents call it today.

### The platform thesis

Beamix is **not a SaaS app with some agents bolted on**. It is a *platform* with three distinct surfaces:

1. **The customer surface** (Sarah, Yossi) — what Frame 5 describes
2. **The agent surface** (Beamix's own 11 agents + third-party agents in year 2) — the reason agents in year 3 are 50, not still 11
3. **The data surface** (the AI-engine response corpus, vertical knowledge graphs, the Citation Vault) — the reason competitors can't catch up

A competitor who copies the customer surface in six months (Profound will) cannot copy the agent surface or the data surface without running Beamix's volume of scans for years. **The seams between these surfaces are the moat.** Frame 5 doesn't talk about them because Frame 5 is product-led; this document is platform-led.

### Layer-by-layer detail (the seams)

**L0 — Platform Primitives.** Auth (Supabase Auth + SAML/SSO on Enterprise), tenancy (single-tenant for SMB, hierarchical multi-tenant for Agency), billing (Paddle + per-seat/per-client metering), audit log (every state change recorded with provenance — this is L0 because every layer writes to it), webhooks (any state change emits an event that any subscriber can react to), public API (versioned REST + GraphQL + an SDK), marketplace (third-party agents and integrations), sandbox (a fake-customer environment for agent testing). The unsexy infrastructure — but every one of them is the difference between Beamix and a CRUD app.

**L1 — Attribution + Identity.** This is the renewal mechanism Frame 5 correctly identifies. But Frame 5 treats it as a feature; I treat it as a layer because it has its own data model (calls, forms, sessions, conversions), its own integrations (Twilio, Telnyx, CallRail, Google Forms, Typeform, HubSpot, Salesforce, Pipedrive), and its own UI surface (call recordings playable in /reports, conversion attribution timeline). At full ambition: Beamix is the *only* GEO tool that can answer "did the AI engines actually drive revenue?" Profound, Otterly, Athena cannot, because they don't ship phone numbers. This layer is the renewal lock.

**L2 — Customer Site Integration.** This is the layer Frame 5 hand-waves. The hard truth: how does Beamix actually push schema, FAQs, and content tweaks onto the customer's site? Four delivery modes:

- **WordPress** (40%+ of SMB sites): a Beamix plugin. One-click install. Schema injection via `wp_head`, FAQs as a custom post type, content edits as PRs that the customer's editor reviews. The plugin enables auto-rollback (every change is a revision).
- **Shopify**: a Beamix app in the App Store. Theme injection via Shopify Functions and metafields. Product schema, FAQ blocks, blog post drafts.
- **Webflow / Squarespace / Wix**: API-driven where possible; otherwise a JS snippet that injects via DOM mutation at runtime (acceptable for FAQ/schema, not for content).
- **Generic / custom-CMS**: Beamix Edge Worker — a Cloudflare Worker that proxies the customer's site and rewrites HTML at the edge. Customer points DNS to Beamix's edge worker, which forwards to origin and rewrites response. This is the most powerful and most operationally sensitive mode; it requires SOC 2 and 99.99% uptime guarantees because Beamix is now in the request path.
- **Git-mode (developer-friendly customers)**: Beamix opens a PR against the customer's GitHub/GitLab repo. Customer reviews and merges. No live writes. This is the safest mode and the right default for B2B SaaS customers.

**Every change is a Git-style commit** with a 30-day TTL (T&S Mechanism #5: reversal-by-default). The integration layer maintains a versioned, replayable history of every byte Beamix has ever written to a customer's site. Rollback is a single API call.

**L3 — AI Engine Fabric.** Detailed in §3 below. The point: this is its own layer because the engines are heterogeneous (different APIs, rate limits, response formats, paywalls) and the fabric must abstract them so adding the 12th engine is a config change, not a refactor.

**L4 — Knowledge Layer.** Detailed in §4 below.

**L5 — Agent Runtime.** Detailed in §2 below — the most important section.

**L6 — Communication Layer.** Email is a primary channel, not a fallback. This layer owns: Monday Digest renderer, Monthly Update renderer, event-trigger evaluator, Slack/Teams/Discord webhooks, SMS alerts (Build+ tier), white-label renderer (Agency tier), permalink generator, public/private switching, deliverability infrastructure (DKIM, SPF, DMARC, warmup pools per agency subdomain). The right way to think about this: every artifact in Beamix can be rendered as (a) an in-app view, (b) an email, (c) a public permalink, (d) a PDF export, (e) a Slack card, (f) a webhook payload. One renderer pipeline, six output formats.

**L7 — Customer Product.** The Frame 5 pages. Built on top of every layer below it. Critically: the dashboard is *thin*. Most logic lives below.

**L8 — Public Surface.** /scan public (the viral acquisition surface), Beamix Index (opt-in directory), embed widgets ("Show your AI Visibility Score on your homepage" — viral), public State-of-GEO data products (annual report, vertical reports — *the most underrated marketing asset Beamix has, because nobody else has the data*).

### Major data flows

**Flow A — The scan-to-action pipeline (the core loop):**

```
Scheduler ── triggers ──> Engine Fabric (L3)
                              │
                              v
                    Response Corpus (L4)
                              │
                              v
                Diagnostic Agents (read-only; L5)
                              │
                              v
                Brief + Truth File check (L4)
                              │
                              v
            Action Agents (propose changes; L5)
                              │
                              v
            Pre-publication Validator (L5)
                              │
                              v
            Review-debt counter check (L5)
                              │
                              v
                    Inbox / auto-apply (L7)
                              │
                              v
                Site Integration (L2)
                              │
                              v
                Attribution layer (L1) — does the action drive calls?
                              │
                              v
                    Receipts ledger (L4) — closed loop
```

**Flow B — The agent-to-agent message bus.** Every agent emits typed events to a Kafka-style event bus. Other agents subscribe. Schema Doctor emits `schema.applied` → Citation Predictor consumes to predict citation lift → Reporter consumes to populate next digest. This is the seam that lets agent count grow from 11 to 50 without refactoring. Frame 5 doesn't talk about it.

**Flow C — The data flywheel.** Every scan response is structured-stored at the platform corpus level (anonymized + per-customer). Aggregations feed Industry Knowledge Graphs. IKGs feed *future* agents that read them as input. The product gets smarter the more customers it has — and a competitor at month 6 has zero data flywheel.

---

## Section 2 — The Agent Runtime in detail

This is the most consequential architectural decision in Beamix. Get this wrong, and adding agent #12 in six months is a 4-week project. Get it right, and a third party builds a custom agent in an afternoon.

### Execution model: async, durable, replayable

Agents are **not** stateless functions. They are **durable workflows** with checkpointed state. The right primitive is Inngest / Temporal / Trigger.dev — every agent execution is a function with named steps, and every step is durably checkpointed. If a step fails or is preempted, replay resumes at the last checkpoint with the same inputs. This is non-negotiable for a system that runs LLM calls (slow, expensive, occasionally non-deterministic).

A typical agent run looks like:

```ts
inngest.createFunction(
  { id: "schema-doctor.scan-and-fix", retries: 3 },
  { event: "scan.completed" },
  async ({ event, step, ctx }) => {
    const truthFile = await step.run("load-truth-file", () => 
      knowledge.getTruthFile(ctx.customerId));
    const existingSchema = await step.run("scrape-existing-schema", () =>
      siteIntegration.getSchema(ctx.customerId, event.data.urls));
    const proposed = await step.run("draft-schema", () =>
      llm.draft({ prompt: SCHEMA_DOCTOR_SYSTEM, inputs: { truthFile, existingSchema } }));
    const validation = await step.run("pre-publication-validate", () =>
      validator.validate("schema-doctor", proposed));
    if (validation.failed) {
      await step.run("escalate", () => inbox.escalate(...));
      return { status: "escalated" };
    }
    await step.run("propose-or-apply", () =>
      reviewDebtCounter.gateOrApply(ctx.customerId, proposed));
    await step.run("emit-event", () =>
      bus.emit("schema.applied", { ... }));
    return { status: "applied" };
  }
);
```

Every named step is checkpointed. Every step's input and output is logged for replay. Every step's duration is metered. This is the substrate.

### Orchestration: agents as a DAG, not a chain

A scan triggers ~7 agents. They have dependencies:

- Schema Doctor depends on a fresh page scrape (provided by Engine Coverage Scout)
- Citation Fixer depends on Mentions Tracker's recent citation list
- FAQ Agent depends on Query Researcher's "what are people asking" output
- Brand Voice Guard runs on EVERY agent's output as a final gate

The runtime models this as a DAG (directed acyclic graph) per scan. The DAG is **declarative** — agents describe their inputs (other agents' outputs) and the runtime computes execution order, parallelization, and retry policies. New agents added to the DAG describe their dependencies in their manifest; the orchestrator picks them up automatically. This is how Airflow / Dagster / Prefect do data pipelines, applied to agent workflows.

### Conflict resolution

Two agents can propose conflicting actions on the same artifact. Citation Fixer wants to add a paragraph to /pricing; Content Refresher wants to delete the same paragraph. The runtime detects this at proposal time (both target the same DOM path / file path / schema entity) and routes the conflict to a **disagreement resolver**:

1. **Auto-resolution rule:** the agent whose Standing Order clause is most directly invoked wins; the loser's proposal is suppressed and noted in receipts.
2. **Confidence-weighted resolution:** if both invoke the same clause, the agent with higher confidence wins.
3. **Manual escalation:** if confidence is close, escalate to the user as a single Inbox item — *"Two agents disagreed on /pricing. Citation Fixer wants to add X; Content Refresher wants to remove Y. Pick one."*

Frame 5 has none of this. Without it, contradictory changes ship and the customer wonders why their site keeps flapping.

### Observability — every action provenance-tagged

Every agent output carries a **provenance envelope**:

```json
{
  "action_id": "act_01HZ...",
  "agent": "faq-agent",
  "agent_version": "2.3.1",
  "model": "claude-3.7-sonnet",
  "model_seed": 12345,
  "inputs": {
    "truth_file_version": "tf_v17",
    "scan_id": "scan_01HZ...",
    "queries_observed": [...],
    "prior_agent_outputs": [],   // critical: empty if leaf, or list of upstream actions
    "standing_order_clauses": ["clause_geographic_focus", "clause_brand_voice_neutral"]
  },
  "output": { "kind": "faq", "diff": {...} },
  "validation": { "passed": ["truth-file-check", "voice-fingerprint", "sensitive-topic"], "warnings": [] },
  "review_state": "auto-applied",
  "rollback_token": "rb_01HZ...",
  "ttl": "2026-05-26T00:00:00Z",
  "confidence": 0.87,
  "blast_radius": ["/faq#hours", "/contact"]
}
```

This envelope is the audit log. It is the rollback token. It is the input for the next agent (so contamination is traceable). It is the data the customer sees if they click "why did the agent do this?". It is what regulators see in a discovery request. It is what an underwriter examines for E&O coverage.

Frame 5 mentions provenance once. It is the spine of the architecture.

### Extensibility — third-party agents in year 2

The Agent SDK is published. Anyone can write a Beamix agent in TypeScript or Python:

```ts
import { defineAgent, AgentContext } from "@beamix/sdk";

export const reviewResponderAgent = defineAgent({
  name: "review-responder",
  version: "1.0.0",
  triggers: ["review.received"],
  scopes: ["read:google-business-profile", "write:review-responses"],
  inputs: { reviewText: "string", customerTruthFile: "TruthFile" },
  pricing: { model: "per-action", rate: 0.05 },
  async run(ctx: AgentContext) {
    const draft = await ctx.llm.draft(...);
    const validated = await ctx.validate(draft);
    return ctx.propose(validated);
  }
});
```

The agent runs in a **Beamix-managed sandbox** with declared scopes. The customer installs it from a Marketplace ("ReviewResponder by Acme — $9/mo per customer location"). Beamix takes 30% (the Stripe of GEO agents). This is the iPhone-of-GEO play: **Beamix isn't 11 agents; it's the platform on which the 50 agents of 2028 are written, by us and by others.**

By year 3, third parties build:
- Vertical-specific agents (Plumber FAQ Agent, Lawyer Compliance Agent, Restaurant Menu Agent)
- Geo-specific agents (German Localization Agent, Japan AI Engine Specialist)
- Channel-specific agents (Reddit Mentions Agent, Quora Authority Agent)
- Industry-data agents (Crunchbase enrichment, Glassdoor reputation)

Beamix's 11 agents become Beamix's 11 *first-party* agents on a platform of 200.

### Safety integration — the four T&S mechanisms are runtime primitives, not features

The four pre-MVP safety locks are not bolted on. They live inside the runtime:

1. **Truth File check** is a *required step* in every agent's pre-publication phase. The runtime refuses to run any agent that doesn't declare its truth-file dependencies in its manifest.
2. **Pre-publication validation** is a *runtime stage*. After agent output, before propose/apply, validation runs. Per-agent-class validators are pluggable. The validator is owned by Beamix; the agent cannot bypass it.
3. **Review-debt counter** is a *runtime gate*. Before any auto-apply, the runtime checks the customer's review-debt counter. Above threshold, auto-apply is suspended for the customer (signed status sentence: *"Beamix paused new auto-changes — you have 12 items un-reviewed."*).
4. **Incident response** is a *runtime kill switch*. A "report a problem" button triggers a runtime command that: (a) suspends the offending agent for the customer, (b) initiates rollback of the agent's actions in the last N days via TTL'd commits, (c) opens an incident ticket with full provenance attached, (d) emails the customer the rollback receipt.

These are **not** product features the customer sees mainly. They are runtime guarantees the runtime enforces on every agent — including third-party ones in year 2. The Agent SDK refuses to publish an agent that doesn't conform.

### State management — long-running per-customer per-agent context

Each agent maintains a per-customer, per-agent **context object** that persists across runs: prior decisions, learned constraints (from House Memory), local feature flags, calibrated confidence thresholds. This is the analog of "session memory" in Claude/ChatGPT but at agent granularity. Stored in Postgres with vector indexes for similarity recall (pgvector at MVP, dedicated vector DB at scale).

When FAQ Agent runs for Mike's Plumbing for the 47th time, it has the full prior-rejection list as context, the brand-voice fingerprint, the Truth File, the last 5 scan responses, and the calls-attributed-to-prior-FAQs from L1. This is what Frame 5 calls House Memory but I treat as a runtime primitive: every agent has memory; the runtime guarantees it.

### Performance budgets

- Scan → first-action-in-Inbox: **< 90 seconds** for the magic-moment
- Agent run (median): **< 8 seconds** end-to-end including validation
- Agent run (p99): **< 60 seconds**
- Site-integration write (apply or rollback): **< 2 seconds**
- Pre-publication validator: **< 500ms** (cached per validation kind)
- Real-time observability dashboard latency: **< 1 second** for state-change visibility

These budgets force the architecture: validators are cached, agent runs are streamed, the bus is real-time, the dashboard is reactive (Convex / Liveblocks / Supabase realtime).

---

## Section 3 — Modules I'd add that Frame 5 doesn't have

Frame 5 cuts. I'd build. Here are 7 modules at full ambition, ranked by moat-impact:

### Module 1 — The AI Engine Test Harness (the secret weapon)

**What it is:** a separate product surface where a customer pastes any URL or any draft content, and Beamix runs it against all 11 AI engines in real-time, showing exactly how each engine would interpret, summarize, cite, and rank it. Like Google Rich Results Test but for AI engines, all of them.

**Why it's a moat:** every SMB content tool needs to answer "if I publish this, will AI engines pick it up?" Today the answer is "deploy and hope." Beamix's harness becomes the de facto pre-publication checker for the entire GEO industry. Even free-tier users use it. It's the entry point to the Beamix ecosystem.

**Implementation seam:** the L3 Engine Fabric is reusable as-a-service. The harness is a thin UI on top of L3. Marginal cost: <$0.20 per check.

**Strategic role:** this is the "free tool that drives sign-ups" play that Frame 5 doesn't have. /scan public is the customer-side version; the test harness is the *content-side* version. Massive top-of-funnel.

### Module 2 — Industry Knowledge Graphs (the cross-customer flywheel)

**What it is:** vertical-specific knowledge graphs auto-built from aggregated, anonymized scan data. For each vertical Beamix serves (plumbers, dentists, lawyers, e-comm, B2B SaaS):
- The 500 most-asked queries on each AI engine
- The most-cited domains in that vertical
- The "winning content patterns" (what FAQ structures get cited; what schema types perform)
- The competitor moves (who gained citations, who lost)
- Seasonal patterns (citations move in predictable ways through the year)

**Why it's a moat:** a brand-new customer in vertical X gets *immediate intelligence* on day 1 that a competitor product can't replicate without millions of scans of their own. Beamix's per-vertical knowledge graphs compound month-over-month.

**Implementation seam:** L4 Knowledge Layer. The data already exists in the corpus from Module 1 (and from every customer scan). The IKG is a periodic aggregation job + a query API.

**Strategic role:** the answer to "why not just use Profound?" is "because Profound doesn't know your vertical the way Beamix does." Vertical wedges become defensible over time.

### Module 3 — The Citation Vault (per-customer, searchable, forever)

**What it is:** every citation Beamix has ever observed for a customer, indexed and searchable. Filterable by engine, query, sentiment, position, date, competitor co-citation. Exportable. Embeddable on the customer's site.

**Why it's a moat:** customers leaving Beamix lose their entire historical record of how AI engines have seen them. That's a switching cost. Combined with the embeddable widget ("Beamix Citation Score" badge), it's also a public-relations asset.

**Implementation seam:** L4 Knowledge Layer; rendered in /citations (new page) or as a tab on /scans.

**Strategic role:** this is the data-locking moat. Three years of citation history is impossible to migrate.

### Module 4 — The Predictive Layer (Citation Predictor as a runtime, not a feature)

**What it is:** a learned model (trained on Beamix's response corpus) that predicts: (a) the citation probability of any draft content on each engine, (b) the score trajectory of the customer over the next 30 days, (c) the next likely competitor move. Not bolted on to Citation Fixer — a *layer* that all agents query.

**Why it's a moat:** prediction quality compounds with data volume. By year 3, Beamix's predictor is structurally better than any new entrant's.

**Implementation seam:** new module within L4 + L5. Built as an internal API (`/predict/citation-probability`, `/predict/score-trajectory`, `/predict/competitor-move`). Agents call it. Customers see results in the UI as confidence scores and "what-if" sliders.

**Strategic role:** when customers ask "should I publish this?" Beamix says "78% citation probability on ChatGPT, 23% on Perplexity, here's how to lift Perplexity to 60%." That's a category-defining capability.

### Module 5 — The Workflow Builder (power-user surface, third-party-developer surface)

**What it is:** a visual node-based workflow editor (n8n / Zapier-like) where Yossi and developers compose custom agent chains. Trigger: weekly scan. Step 1: call Schema Doctor with these constraints. Step 2: if score drops > 5%, run Competitor Watch. Step 3: if competitor X gained citations, draft response with Citation Fixer constrained to brand voice neutral. Step 4: post draft to Slack for approval.

**Why it's a moat:** the agency operator (Yossi) can run his proprietary workflow on Beamix's runtime. The product becomes infinitely more flexible without bloating the dashboard. By year 2, agencies build branded workflow packs they sell to their clients — Beamix becomes Zapier-for-GEO.

**Implementation seam:** UI on top of L5 Agent Runtime. The DAG primitive is already there; the builder just exposes it visually.

**Strategic role:** Yossi-tier (Agency $1,499) is the upmarket revenue. Workflow Builder is what justifies $1,499.

### Module 6 — The Reputation Layer (extending beyond AI engines)

**What it is:** Beamix monitors not just AI engine citations but also: Google Reviews, Yelp, Trustpilot, Reddit mentions, Quora answers, Twitter/X mentions, news coverage, podcast mentions (via transcript scraping), YouTube video mentions, LinkedIn posts. Same agent runtime, different engines. The "brand visibility" picture, not just "AI visibility."

**Why it's a moat:** customers don't think "AI visibility" — they think "do people see my brand." Beamix expands the scope without breaking the architecture (agents that read reviews are just engines in L3).

**Implementation seam:** new adapters in L3 Engine Fabric. New agents in L5. Same dashboard.

**Strategic role:** TAM expansion without product complexity. By year 2, Beamix is "AI visibility + reputation" — a wider category, no new app needed.

### Module 7 — Content Studio (hybrid AI-human creation)

**What it is:** a Notion-like editor in `/studio` where the customer drafts content WITH Beamix. As they type, sidebars show: predicted citation probability, brand-voice drift score, schema suggestions, FAQ extractions, query-research integration. The agents are co-authors, not replacements.

**Why it's a moat:** customers who don't trust full autonomy still want help. The Studio is where Discover-tier customers graduate before they hand over control to autonomous agents. It's the on-ramp.

**Implementation seam:** new L7 surface, calling L5 agents in *advisory* mode (propose, don't apply).

**Strategic role:** addresses the trust-deficit Sarah persona at scale. Every customer journey starts in /studio (low-trust) and graduates to /inbox (high-trust). The architecture supports both, gracefully.

### Bonus modules (year 2-3)

- **Beamix Index** — opt-in public directory of customer scores per vertical. Sarah's plumbing business listed alongside competitors with a public AI Visibility Score. Customers opt in for SEO benefit (backlink to their site, ranking in "best plumbers Tel Aviv" via the Index page).
- **Marketplace** — third-party agents, integrations, vertical templates.
- **Public State-of-GEO** — annual report + quarterly vertical reports + monthly newsletter, drawn from the response corpus. Distribution moat.
- **Multi-language output capability** — Hebrew, Spanish, German, French, Japanese. With back-translation review for the English-primary user (T&S Mechanism #8).
- **Mobile app** — not a viewer; an *approval-first* mobile app. Sarah approves Inbox items in 30 seconds while in line at a coffee shop. Notification → tap → diff → approve. Lowers review-debt counter.

Pick the 7 above. They're the ones with the highest moat-per-eng-cost ratio, and the architecture supports all of them with the seams I've described.

---

## Section 4 — The data moat

Beamix's data flywheel is the single most underrated asset in Frame 5. Let me make it concrete.

### What Beamix collects (every scan adds to the corpus)

**Per scan, per engine, per query:**
- Full response text
- Citation list (which domains were cited)
- Citation positions and prominence
- Sentiment of mentions
- Co-citation graph (who else was cited alongside)
- Response timestamp + engine version
- Latency, token count

**Per customer, ongoing:**
- Truth File and its evolution (versioned)
- House Memory (every approval, rejection, edit, margin note)
- Brand-voice fingerprint and drift over time
- Brief evolution
- Site changes Beamix made (every commit, every diff)
- Lead-attribution data (calls, forms, conversions)
- Customer's own corrections to agent outputs (negative training signal)

**Per vertical, aggregated:**
- The 500 most-asked queries per engine per vertical
- Win/loss patterns (which domains gain/lose citations)
- Seasonal patterns
- Engine-specific quirks (ChatGPT vs Perplexity vs Gemini cite differently)
- Schema patterns that work
- Content patterns that work
- Competitor move detection patterns

### How it compounds

**Year 1:** Beamix has scan data on 1,000 customers across maybe 10 verticals. Aggregations are coarse. Predictor accuracy is ~65%.

**Year 3:** Beamix has scan data on 25,000 customers across 50 verticals + 4 years of historical engine response evolution. Aggregations are razor-sharp. Predictor accuracy is >85%. Industry Knowledge Graphs are the most authoritative source for "what gets cited" in 50 verticals.

**Year 5:** Beamix's response corpus is *the* dataset for AI-search behavior. Academic researchers cite it. Anthropic / OpenAI / Google reach out for licensing. Beamix publishes the State-of-GEO annual report (the Mary Meeker / Stripe Annual Letter of GEO).

### The five products this data enables

1. **Citation Predictor** (Module 4) — internal moat, customer-facing feature
2. **Industry Knowledge Graphs** (Module 2) — internal moat, enables vertical sales
3. **State-of-GEO Reports** — distribution / brand moat
4. **Anonymized Benchmarking** ("plumbers in your size range have an average score of 67 — you're at 78") — feature
5. **Engine API Licensing** — late-stage revenue line; sell anonymized response data to academics, model trainers, agencies (with strict opt-in / privacy controls)

### Privacy and ethics architecture

The data flywheel only works if customers trust it. Architecture:

- **Default opt-in for cross-customer aggregation, opt-out anytime, no PII shared.** Every customer's individual data is private to them.
- **Anonymized aggregates** are computed via differential privacy techniques: any IKG metric that could uniquely identify a single customer is suppressed or noised.
- **Opt-out customers still get full product value** — their data just doesn't flow into IKGs. Charge a small premium ($+$10/mo) for the opt-out tier as a market mechanism.
- **Public Beamix Index** is opt-in only. Customers control whether their scores are listed.
- **TOS clarity** in plain English: "We use your scan data to build industry-level intelligence that benefits all customers. We do not share your individual data with anyone."

This is the Stripe approach to data: the platform learns from the network; individual customer data stays private.

### The training-signal flywheel for Beamix's own optimization

Every customer correction is a training signal:
- Sarah rejects an FAQ → agent's per-customer constraint
- Sarah rejects 100 FAQs across 100 customers in the dental vertical → vertical-level constraint
- Sarah rejects a *type* of FAQ that hallucinates pricing → platform-level constraint that all agents inherit

This is RLHF (reinforcement learning from human feedback) but for the Beamix platform itself. The agents get better as the product is used. Competitors with no users have no training signal.

---

## Section 5 — The integrations I'd build

Beamix as an island in Frame 5 is a strategic mistake. Beamix as a hub is irreplaceable. The integration roadmap:

### Tier 1 (MVP-required)

- **Twilio / Telnyx** — tracked phone numbers for L1 attribution
- **CallRail / WhatConverts** — bridge for customers who already use a call-tracking tool
- **Google Search Console** — pull historic CTR data; correlate with AI-engine citations to detect Schema Doctor regressions early (T&S Risk #2)
- **Google Analytics 4** — conversion data; close the attribution loop
- **Google Business Profile** — read reviews, hours, services; write responses; this is the single most important integration for local SMB customers

### Tier 2 (MVP-1.5)

- **WordPress plugin** — site integration mode (L2)
- **Shopify app** — site integration mode
- **Webflow integration** — site integration mode
- **Stripe / Paddle** (the customer's, not Beamix's) — read MRR data; correlate AI visibility with revenue; the "Beamix drove $X in MRR this month" claim
- **Zapier** — make Beamix actions available in any workflow
- **Slack / Teams / Discord** — webhook deliverability for digests and event briefs
- **HubSpot / Salesforce / Pipedrive** — sync attributed conversions into CRM; "Beamix-driven leads" become a reportable lifecycle stage

### Tier 3 (Year 2)

- **Yelp / Trustpilot / G2 / Capterra** — reputation layer (Module 6)
- **Reddit / Quora / X / LinkedIn** — reputation layer
- **Notion / Airtable** — content collaboration with Beamix as co-author
- **Google Ads / Meta Ads** — bid suppression on queries you already rank for in AI engines (a real cost-saving feature)
- **Make / n8n** — open workflow integration
- **GitHub / GitLab** — Git-mode site integration for developer-friendly customers

### Tier 4 (Year 3+)

- **Figma plugin** — show AI-citation predictions on landing-page mockups
- **Webflow CMS / Sanity / Contentful** — direct headless-CMS integration
- **GA4 BigQuery export** — for enterprise customers, push Beamix data into their data warehouse
- **Snowflake / Databricks** — same, enterprise tier

The integration layer turns Beamix from "a dashboard you check" into "the system of record for AI-search performance." That's the difference between a feature and a category.

---

## Section 6 — Three questions for the other 3 board seats

### To the Designer seat

The architecture I've described demands a **dashboard with depth that doesn't feel heavy**. Linear-grade information density on /home, plus per-agent profile pages, plus /studio (Content Studio), plus the Workflow Builder, plus the Citation Vault, plus the Test Harness, plus the Inbox with provenance envelopes visible. That's a lot of surface. Frame 5 wants to cut to a few clean pages; my architecture wants to enable many. **What's the design pattern that lets Beamix be Linear-dense without being Linear-developer-only?** Specifically: I'm thinking the Frame 5 dashboard is the Sarah surface, /crew + /studio + /workflows + /vault is the Yossi surface, and the Test Harness is the public surface — three IA shells, one product. Does that hold up to your design taste, or is there a better way to present the depth without overwhelming Sarah?

### To the Domain Expert seat

I've described a Customer Truth File as a runtime primitive every agent must check. But the *content* of a useful Truth File for a plumber is very different from a Truth File for a B2B SaaS company. **What is the canonical Truth File schema across the verticals Beamix should serve at full ambition?** Specifically: hours, services, prices, locations are obvious. But for medical clinics, "regulatory disclosures" is critical. For B2B SaaS, "what we explicitly don't do" is critical. For e-commerce, "shipping/return policies" is critical. Is there one universal schema with vertical extensions, or does each vertical need its own template? This shapes the onboarding flow and the per-vertical wedge strategy.

### To the Worldbuilder seat

The architecture I've laid out is a *platform*, not a product. That has narrative implications. Frame 5's narrative is "Beamix does the work for SMBs" — clean and small. My architecture suggests Beamix is "the infrastructure layer for AI-search across the SMB economy" — ambitious and large. **What's the founding story / origin myth / public narrative that lets Beamix sell BOTH?** Specifically: SMB customers want to hear "we do the work, simply." VCs and partners want to hear "we're building the operating system for a $20B category." Stripe pulled this off — "payments infrastructure for the internet" as the platform pitch, "easy payments for your store" as the SMB pitch. What's Beamix's version? The marketing site (Framer, separate) needs the SMB narrative; the data room and partner conversations need the platform narrative. **One company, two narratives that don't contradict — what's the shape?**

---

## Closing — what this means for the build path

If Adam locks this architecture:

**Pre-MVP (the foundational seams):**
1. The Agent Runtime (L5) with provenance, validation, review-debt, rollback as runtime primitives — not features
2. The Engine Fabric (L3) as a separate service with adapters, not embedded in the app
3. The Knowledge Layer (L4) data model — Truth File schema, House Memory schema, response corpus, IKG aggregation
4. The Site Integration layer (L2) with at minimum Git-mode, WordPress plugin, and Edge Worker proxy
5. The Attribution layer (L1) live from day 1 — phone numbers issued at signup
6. The platform primitives — audit log, webhooks, public API design (publish v0 even if only Beamix calls it)
7. The four T&S mechanisms locked into the runtime, not bolted on

**MVP-1:**
- The Frame 5 customer surface (Sarah's pages)
- /scan public, Brief flow, Inbox, Monday Digest, Monthly Update
- WordPress plugin live, Shopify plugin live, Edge Worker live for generic
- Twilio / GSC / GA4 / GBP integrations live

**MVP-1.5:**
- AI Engine Test Harness (Module 1) — the viral acquisition surface
- Industry Knowledge Graph v1 (Module 2) — for the chosen wedge vertical
- Citation Vault (Module 3)
- The 3 deferred T&S mechanisms (drift detection, reversal sunset, provenance protocol)
- Slack/Teams/Zapier integrations

**MVP-2 (Year 1.5):**
- Citation Predictor as a runtime layer (Module 4)
- Workflow Builder (Module 5) — Agency tier killer feature
- Public Agent SDK + sandbox + Marketplace v0
- Reputation Layer (Module 6) — reviews, social, news
- Content Studio (Module 7)

**Year 2:**
- Marketplace open to third-party developers
- Beamix Index live for opted-in customers
- Public State-of-GEO annual report
- Mobile app (approval-first)
- Multi-language with back-translation review

**Year 3:**
- Engine API licensing as a revenue line
- Enterprise tier with SSO, audit, compliance addons, BigQuery export
- Vertical-specific Marketplace packs (Plumbing Pack, Dental Pack, Lawyer Pack — each a curated set of agents + integrations + vertical IKG)

This is the maximum-ambition build. It assumes 500 effective engineers (AI agents do the engineering). It assumes the team commits to platform-thinking, not just product-thinking. It assumes Adam picks the long game — the iPhone of GEO, not the calculator.

The seams are clear. The moat sources are clear. The integration surface is clear. The data flywheel is clear. **If Beamix builds this architecture, no Profound, no Otterly, no Athena catches up — because catching up requires not just feature parity but four years of scan data and an open agent ecosystem.**

Adam picks. I'm here for whatever cut he prefers — but I want the record to show: at full ambition, the architecture is a *platform*, not a *product*. The platform's seams are what determine whether Beamix becomes the iPhone of GEO or the BlackBerry of GEO.

---

*Saved to `/tmp/board3-seat-1-architect.md`. ~5,800 words. — Product Architect, Board 3.*
