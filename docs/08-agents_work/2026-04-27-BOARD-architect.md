# Senior Backend Architect — Board Meeting 2026-04-27

**Author:** Senior Backend Architect
**Date:** 2026-04-27
**Status:** v1 — input to Build Lead Tier 0 planning
**Inputs read:** AUDIT-2-feasibility, FRAME-5-v2-BUILD-INDEX, CREW-design-v1 §4, INBOX-WORKSPACE-design-v1 Part B, MARKETPLACE-spec-v1 §§1-2+4, BOARD3-seat-1-architect (L0-L8)

---

## Q1: Real-time channel architecture

**Pick: Supabase Realtime. One channel. All "agent is acting" UI subscribes to it.**

### Reasoning

The audit correctly flags that `/home` says WebSocket and `/crew` says Supabase Realtime — these must collapse to one transport. Supabase Realtime wins because:

1. It is already in the stack. No additional service to operate.
2. Postgres row-level security extends naturally to channel authorization — a customer's client subscribes only to rows where `customer_id = auth.uid()`.
3. Broadcast mode (not DB listener) for high-frequency step events avoids write amplification to `agent_run_state` on every substep.
4. Fallback to polling is trivial (`setInterval` at 10s if the Realtime socket drops).

### Canonical channel

One channel per customer. **Not** per agent. A customer has at most 18 agents; filtering client-side from one channel is cheaper than maintaining 18 concurrent subscriptions.

```
Channel name: `agent:runs:{customer_id}`
```

### Payload schema

```typescript
// apps/web/types/agent-run-state.ts
export type AgentRunStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface AgentRunEvent {
  run_id: string;               // UUID, primary key in agent_runs table
  agent_id: string;             // enum slug: 'schema_doctor' | 'faq_agent' | ...
  customer_id: string;          // UUID, FK to customers
  status: AgentRunStatus;
  current_step: number;         // 0-indexed
  total_steps: number;
  step_label: string;           // human label: "Reading Truth File"
  started_at: string;           // ISO-8601
  updated_at: string;           // ISO-8601
  estimated_completion_ms: number | null;
}
```

All "agent is acting" UI reads this shape:
- Activity Ring pulse: `any(runs).status === 'running'`
- Topbar dot: same predicate
- `/crew` WORKING pill: `runs.find(r => r.agent_id === agentId)?.status === 'running'`
- `/scans` Acting pill: same
- `/workspace` courier position: `current_step / total_steps`

### Subscription pattern

```typescript
// One subscription per authenticated session
const channel = supabase
  .channel(`agent:runs:${customerId}`)
  .on('broadcast', { event: 'run_state' }, ({ payload }) => {
    dispatch(updateRunState(payload as AgentRunEvent));
  })
  .subscribe();

// Fallback: if channel status is CLOSED after 5s, start polling
// GET /api/agent-runs/active → AgentRunEvent[]
```

Client subscribes on app mount, unsubscribes on session end. No per-agent subscriptions. Server emits via Supabase Realtime Broadcast after every Inngest step completion (see Q2).

### Reconnection / fallback

Supabase Realtime has built-in reconnect with exponential backoff. Client additionally polls at 10s if `channel.state !== 'joined'` for more than 5s — ensures Activity Ring is never stale for more than 10s. Polling endpoint: `GET /api/agent-runs/active` returns `AgentRunEvent[]` filtered to `status IN ('queued','running')`.

### Cost model at 25,000 customers × 18 agents

Supabase Realtime pricing is per concurrent connection, not per message. At 25k customers with 10% daily active (2,500 concurrent sessions at peak), cost is well within Supabase Pro ($25/mo) to Team ($599/mo) tier. Broadcast mode does not write to the database; no additional Postgres I/O cost. **Verdict: Supabase Realtime is free at MVP scale on any paid tier.**

---

## Q2: Inngest contract + agent runtime architecture

### Inngest tier decision

**Required tier: Inngest Pro ($150/month).** Inngest's free tier has a 500-step/day limit and no function runs longer than 15s. The Pro tier allows 60s+ via step timeouts, unlimited steps, and provides function-level replay. At p99 60s agent runs with 6 agents running across 100 active daily customers, Pro is the correct tier.

For runs exceeding 60s, use `step.sleep()` or split into sub-functions chained via Inngest's `sendEvent`. An agent with a 120s LLM call is: `step.run('call_llm', ...)` with a `timeout: '120s'` on that step — supported on Inngest Pro.

### Function shape

**One shared `runAgent` Inngest function + per-agent strategy objects.**

Do NOT create one Inngest function per agent. That is 18 separately deployed functions with duplicated retry logic, no shared provenance infrastructure, and no single replay surface.

```typescript
// apps/web/inngest/functions/run-agent.ts
export const runAgent = inngest.createFunction(
  {
    id: 'run-agent',
    retries: 3,
    concurrency: { limit: 5, key: 'event.data.customer_id' }, // max 5 concurrent per customer
  },
  { event: 'agent/run.requested' },
  async ({ event, step }) => {
    const { run_id, agent_id, customer_id, trigger, inputs } = event.data;

    // Step 1: Load context (Brief + Truth File + Agent Memory)
    const context = await step.run('load-context', async () => {
      return loadAgentContext(customer_id, agent_id);
    });

    // Emit Realtime event after each step via Supabase Broadcast
    await emitRunState({ run_id, agent_id, customer_id, status: 'running',
      current_step: 0, total_steps: context.totalSteps, step_label: 'Loading context' });

    // Step 2: Run agent strategy
    const agentModule = await step.run('execute', async () => {
      const strategy = getAgentStrategy(agent_id); // per-agent logic injected here
      return strategy.run(context, inputs);
    });

    // Step 3: Validate output
    const validation = await step.run('validate', async () => {
      return prePublicationValidator.validate(agentModule.draft, context.truthFile);
    });

    // Step 4: Write provenance + propose to inbox or auto-apply
    const result = await step.run('propose', async () => {
      return proposalEngine.submit(agentModule.draft, validation, context, run_id);
    });

    await emitRunState({ run_id, agent_id, customer_id, status: 'completed',
      current_step: context.totalSteps, total_steps: context.totalSteps });

    return result;
  }
);
```

### Per-step provenance capture

Each `step.run()` block captures its own provenance slice. The provenance envelope is assembled at the end of the function from these slices. Inngest's native step-output storage gives replay capability; we additionally write a `provenance_steps` record to Postgres after each step so the audit log is available even if the Inngest dashboard is unavailable.

```typescript
// After each step.run(), call:
await writeStepProvenance(run_id, step_name, step_index, {
  inputs: step_inputs,
  outputs: step_outputs,
  duration_ms: step_duration,
  model_used: step_model,
  tokens_in: step_tokens_in,
  tokens_out: step_tokens_out,
});
```

This creates a `provenance_steps` table (separate from the final `provenance_envelope`) — the envelope is the canonical artifact, the steps table is the audit trail.

### Realtime propagation from Inngest → client

```
Inngest step completes
  → step.run() callback calls emitRunState()
  → emitRunState() calls supabase.channel().send({ type: 'broadcast', event: 'run_state', payload })
  → Supabase Realtime delivers to subscribed clients within ~100ms
```

`emitRunState` is a thin async helper, not a Supabase DB write — Broadcast mode is in-memory delivery. No DB row per event. The final `agent_run_state` is persisted once to Postgres when the run completes.

### Retry / idempotency strategy

- Inngest retries are step-level. A failed step retries, not the whole function.
- `run_id` is the idempotency key. Passed in the initial `sendEvent` call as `event.id`.
- Proposals to /inbox are idempotent: `INSERT INTO inbox_items (...) ON CONFLICT (run_id) DO NOTHING`.
- If Inngest replays an event (network failure between step 2 and step 3), step 1 and 2 are skipped (Inngest memoizes step outputs within a run).

---

## Q3: Workflow Builder MVP architecture

**Adam's directive: Workflow Builder is IN MVP. The audit called it 6-9 weeks at full scope. The path to billion-dollar quality without a 9-week slip is: ship the right MVP-1 subset on day one, not a half-built full product.**

### What ships day 1 (concrete)

- Workflow index at `/crew/workflows` — table of saved workflows (name, trigger, steps, status)
- 3 Beamix-authored workflow templates displayed as "use this template" cards
- Workflow viewer (read-only) — shows the DAG as a static React Flow canvas, non-interactive
- Manual trigger: "Run this workflow" button on each workflow card
- Run history per workflow (last 10 runs, status, timestamp)
- Workflow runs execute through the shared `runAgent` Inngest function, chained via `sendEvent`

The DAG editor (drag-and-drop, wiring nodes) is **MVP-1.5**. The JSON spec already exists; the editor is the UI onto it. Customers on Scale can see their workflows and run them; Yossi can customize them by editing the underlying JSON (developer-mode toggle). This is the Linear approach: ship the data model + functional API, defer the polished UI.

### What is MVP-1.5 + Year 1

- React Flow canvas editor (drag/drop/wire)
- Conditional branches in the DAG (if/else on score deltas, competitor events)
- Workflow publishing to Marketplace
- Per-node test ("run just this step with mock input")
- Visual conflict detection (red overlay on conflicting nodes)

### Data model

```sql
-- Workflows
CREATE TABLE workflows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id),
  name         TEXT NOT NULL,
  description  TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  -- For schedule: { cron: '0 9 * * 1' }
  -- For event: { event_name: 'scan.completed', filter: {...} }
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','error')),
  version      INTEGER NOT NULL DEFAULT 1,
  is_template  BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,          -- null = not published to marketplace
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow nodes (agents in the DAG)
CREATE TABLE workflow_nodes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id  UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  agent_id     TEXT NOT NULL,         -- 'schema_doctor' | 'faq_agent' | ...
  position_x   INTEGER NOT NULL,      -- canvas coordinates for React Flow
  position_y   INTEGER NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}', -- per-node agent config overrides
  node_index   INTEGER NOT NULL        -- execution order (topological sort output)
);

-- Workflow edges (execution dependencies)
CREATE TABLE workflow_edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source_node_id  UUID NOT NULL REFERENCES workflow_nodes(id),
  target_node_id  UUID NOT NULL REFERENCES workflow_nodes(id),
  condition       JSONB          -- null = unconditional; { type: 'score_delta_gt', value: 5 }
);

-- Workflow versions (immutable snapshots on publish/activate)
CREATE TABLE workflow_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id  UUID NOT NULL REFERENCES workflows(id),
  version      INTEGER NOT NULL,
  spec         JSONB NOT NULL,  -- full DAG snapshot at this version
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, version)
);
```

### DAG runtime inside Inngest

A workflow run is an Inngest function that dynamically executes the DAG spec:

```typescript
export const runWorkflow = inngest.createFunction(
  { id: 'run-workflow', retries: 2 },
  { event: 'workflow/run.requested' },
  async ({ event, step }) => {
    const { workflow_id, customer_id } = event.data;
    const spec = await step.run('load-spec', () => loadWorkflowSpec(workflow_id));

    // Topological sort of nodes (Kahn's algorithm — simpler than Tarjan for DAGs)
    const ordered = topologicalSort(spec.nodes, spec.edges); // throws on cycle

    const results: Record<string, ProvenanceEnvelope> = {};

    for (const node of ordered) {
      const upstreamEnvelopes = getUpstreamEnvelopes(node, spec.edges, results);
      results[node.id] = await step.run(`agent-${node.agent_id}`, async () => {
        // Fires the same runAgent logic, but passes upstream provenance as input
        return agentStrategy.run({
          agent_id: node.agent_id,
          customer_id,
          config: node.config,
          prior_agent_outputs: upstreamEnvelopes,
        });
      });
    }

    return results;
  }
);
```

### Cycle detection

Cycle detection runs **at save time in the API route**, not at runtime. On `PUT /api/workflows/:id`, after parsing the DAG spec, run Kahn's algorithm (topological sort). If the sort fails (remaining nodes after processing = cycle detected), return `422` with the specific cycle nodes identified. This is 20 lines of TypeScript. It is not a 30-line Tarjan's — Kahn's is simpler and correct for this case.

### Resource conflict detection

This is the harder problem. Two nodes in the same workflow that both write to the same DOM path / schema entity are a conflict. The solution: each agent declares its write targets in its manifest (`writes: ['json_ld:faqpage', 'meta:description']`). At save time, after cycle detection, scan for write-target overlaps across nodes. If Node A and Node B both write `json_ld:faqpage`, warn the customer. This requires the agent manifest schema to include `writes[]`. Build this metadata for the 6 MVP agents at Tier 0 (2 hours of work).

### Sandbox / dry-run approach

The audit was right that "run with mock data" is non-trivial. The MVP dry-run is simpler than a mock site:

- **Dry-run = execute the DAG but call `propose()` with `dry_run: true`.**
- All agent logic runs (LLM calls are real, Truth File reads are real, validations are real).
- The only difference: proposals go to a `inbox_items.status = 'dry_run'` partition, never to live site integration.
- The customer sees the dry-run output in a special `/workspace` panel labeled "Dry run results — not applied."
- Cost: 1 agent credit consumed (the agent ran real LLM calls). Clearly communicated in the confirmation modal.

No mock customer site. No snapshot. The dry-run output IS the real proposed output — just never committed.

### Bundle strategy

React Flow (~80kb gzipped) is dynamic-imported ONLY on the workflow editor route:

```typescript
// apps/web/app/(app)/crew/workflows/[id]/editor/page.tsx
const WorkflowCanvas = dynamic(
  () => import('@/components/workflow/WorkflowCanvas'),
  { ssr: false, loading: () => <WorkflowEditorSkeleton /> }
);
```

The workflow index (`/crew/workflows`) and workflow viewer use zero React Flow code. The editor is a separate entry point. Route-level code splitting in Next.js 16 App Router handles this automatically when using `dynamic()`.

### Workflow versioning

Linear integer versions. `version` increments by 1 on every activate/publish. Draft edits do not bump version. A `workflow_versions` snapshot is created on each version increment. Customers can view/restore prior versions from the workflow editor sidebar.

---

## Q4: Marketplace-without-rewards architecture

Adam dropped the reward system (§3 of the spec). The marketplace + workflow publishing stays.

### Schema (rewards removed)

```sql
-- Marketplace listings (first-party at MVP, third-party at MVP-1.5)
CREATE TABLE marketplace_listings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  type           TEXT NOT NULL CHECK (type IN ('agent', 'workflow')),
  name           TEXT NOT NULL,
  tagline        TEXT NOT NULL,                  -- max 80 chars
  description    TEXT NOT NULL,                  -- markdown, max 1500 words
  category       TEXT NOT NULL,                  -- 'vertical_specific' | 'engine_specific' | ...
  tags           TEXT[] NOT NULL DEFAULT '{}',
  publisher_id   UUID REFERENCES developers(id), -- null = first-party Beamix
  is_first_party BOOLEAN NOT NULL DEFAULT true,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  manifest       JSONB NOT NULL,                 -- scopes, triggers, inputs schema
  version        TEXT NOT NULL,                  -- semver string
  pricing_model  TEXT CHECK (pricing_model IN ('free','per_action','subscription')),
  price_amount   NUMERIC(8,2),                   -- null if free
  install_count  INTEGER NOT NULL DEFAULT 0,     -- denormalized, updated by trigger
  avg_rating     NUMERIC(3,1),                   -- null until 5+ reviews
  review_count   INTEGER NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT false, -- editorial curation
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer installs
CREATE TABLE marketplace_installs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID NOT NULL REFERENCES marketplace_listings(id),
  customer_id    UUID NOT NULL REFERENCES customers(id),
  config         JSONB NOT NULL DEFAULT '{}',
  trigger_config JSONB NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','uninstalled')),
  installed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at TIMESTAMPTZ,
  UNIQUE (listing_id, customer_id)   -- one install per listing per customer
);

-- Reviews (verified-install only)
CREATE TABLE marketplace_reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID NOT NULL REFERENCES marketplace_listings(id),
  customer_id    UUID NOT NULL REFERENCES customers(id),
  install_id     UUID NOT NULL REFERENCES marketplace_installs(id),
  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body           TEXT,                           -- optional, max 1000 chars
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, customer_id)               -- one review per install
);

-- Editorial curation (replaces leaderboards)
CREATE TABLE marketplace_editorial (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID NOT NULL REFERENCES marketplace_listings(id),
  slot           TEXT NOT NULL,                  -- 'spotlight', 'staff_pick', 'new_and_notable'
  position       SMALLINT,                       -- ordering within slot
  headline       TEXT,                           -- editorial copy
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Discovery without leaderboards

Without reward-driven leaderboards, discovery relies on:

1. **Editorial curation** (`marketplace_editorial` table) — Beamix team picks "Staff Picks", "Spotlight", "New and Notable" — manually curated weekly. This is the Stripe Marketplace model: small catalog, high trust, editorial quality over volume.
2. **Install count badge** visible on every card (`install_count` denormalized, updated by a Postgres trigger on `marketplace_installs` inserts). Transparent signal, no gaming incentive when there's no cash reward attached.
3. **Star rating** shown on cards (Bayesian average with minimum 5 reviews). No "Top Rated" badge at MVP — just the raw score. Badge tiers introduced at MVP-1.5 when sample sizes justify them.
4. **Sort options**: Most installed · Highest rated · Newest · Category filter. No "Most Improvement" sort at MVP (requires 30+ days of post-install scan data — build the metric in the background, expose it at MVP-1.5).
5. **Recency signal**: new listings get a "New" chip for 60 days after publishing.

The `/marketplace` page shape without rewards: remove Zone A spotlight (no winner to feature), replace with an editorial "Staff picks" hero strip (Beamix-curated, 3 listings). Discovery grid and filters unchanged. No leaderboard rail.

### Publish flow (Yossi publishing a workflow)

1. Yossi clicks "Publish to Marketplace" in the workflow editor.
2. A modal strips customer-specific config: any hardcoded URLs, customer-specific agent instructions, Truth File references. Remaining config becomes the template's default inputs.
3. Yossi fills: name, tagline, description (markdown editor), category, tags, pricing model.
4. A `marketplace_listings` row is created with `status = 'pending'`.
5. Beamix's 4-stage review pipeline runs (simplified at MVP — automated checks only; manual T&S review queued via internal Slack/Linear ticket).
6. On approval, `status → 'approved'`, `published_at = now()`. Listing appears in catalog.

### Install flow (Build-tier customer)

The install flow is unchanged from the spec's 4-step modal (permissions → config → trigger → confirm). The key backend contract:

- `marketplace_installs` row created.
- Agent provisioned into `customer_agents` table (the same table first-party agents occupy, with `source = 'marketplace'`).
- Agent appears in `/crew` immediately.
- `install_count` on `marketplace_listings` incremented via Postgres trigger.

### Trust & Safety (simplified without reward incentive)

With no cash rewards at MVP, the primary T&S concern is quality, not gaming. The 4-stage review pipeline simplifies:

1. **Automated checks** (run in CI on listing submission): manifest schema valid, scopes within allowlist, no known-vulnerable deps, bundle <50MB.
2. **T&S review** (Beamix internal, 5-day SLA): run agent against 2 reference profiles (not 3), inspect outputs. At MVP with first-party-only listings, this is a sanity check, not a full adversarial audit.
3. **Quality review** (1 day): copy is on-brand, pricing is plausible.

Stage 2 (security review) is deferred to MVP-1.5 when third parties join. At MVP, all agents are first-party Beamix code — no external sandbox required.

---

## Q5: L2 site integration launch mode

**My pick: Manual paste at MVP launch. WordPress plugin as MVP-1.5 (build starts on day one of MVP).**

### Defense

The audit framed this correctly: the WordPress plugin takes 1-2 weeks of build plus 3 weeks of WordPress.org review. Start building the plugin on day 1 of the MVP sprint. By the time the product is in beta, the plugin has cleared WordPress.org review and is ready for MVP-1.5. These are parallel tracks, not sequential.

For MVP launch:
- Every /inbox item shows the proposed change as a **copy-ready diff** — the exact JSON-LD block, the exact FAQ HTML, the exact meta tag — formatted for direct paste into any CMS.
- `/workspace` step 5 (the final step) renders: "Ready to apply. [Copy schema JSON] [Copy FAQ HTML] [Download as .zip]" — three CTAs, not one ambiguous "Apply" button.
- A **how-to guide** per CMS (WordPress, Shopify, Webflow, Squarespace) accessible from the copy button — a 200-word inline drawer, not a link to docs.
- For B2B SaaS customers who have a dev on staff: "Open a GitHub PR →" generates a PR against the customer's GitHub repo (Git-mode per Architect L2) — this is one Octokit API call, not a plugin.

### Marketing copy implication

The honest claim at MVP: **"Beamix writes the work. You apply it in one paste."**

Not "Beamix does the work" (implies auto-apply). Not "Beamix shows you what to do" (implies advisory). The positioning: *Beamix does the cognitive labor — research, diagnosis, drafting, validation. You do one mechanical step: paste.* The analogy is a lawyer who drafts a contract; you sign it. One signature vs. doing the legal work yourself.

For WordPress and Shopify at MVP-1.5: "Beamix applies it automatically." The upgrade from paste to auto-apply is a real upsell moment.

### Build estimate

- Manual paste flow: 1 day of backend work (copy-ready diff endpoints), 2 days of frontend work (CTA design, inline how-to).
- Git-mode (GitHub PR): 2 days of backend work (Octokit integration, PR template, auth flow). Worth shipping at MVP for the B2B SaaS archetype — no WordPress.org wait.
- WordPress plugin: 10 days build + 15 days review. Start immediately, ship at MVP-1.5.
- Shopify app: 7 days build + 5 days App Store review. Parallel with WordPress plugin.

Total MVP launch: 5 days. MVP-1.5: WordPress + Shopify auto-apply ready within 5 weeks of MVP launch.

---

## Q6: Customer knowledge layer data model

### Brief schema (TypeScript)

```typescript
// apps/web/types/brief.ts

export type BriefStatus = 'draft' | 'signed' | 'archived';

export interface BriefClause {
  id: string;                    // e.g., 'clause_geographic_focus'
  template_id: string | null;    // null = free-text clause
  slot_values: Record<string, string>;   // e.g., { city: 'Tel Aviv', service: 'plumbing' }
  prose_rendered: string;        // the final sentence shown to customer
  last_edited_at: string;        // ISO-8601
}

export interface BriefSection {
  id: string;                    // e.g., 'section_search_intent'
  title: string;                 // e.g., 'What you want to show up for'
  clauses: BriefClause[];
}

export interface Brief {
  id: string;
  customer_id: string;
  version: number;               // increments on each sign/edit
  status: BriefStatus;
  sections: BriefSection[];
  created_at: string;
  signed_at: string | null;
  seal_svg: string | null;       // Rough.js seal SVG, generated once at signing
}
```

**Storage:** `briefs` table + `brief_clauses` table (normalized for clause-level queries). Agent runtime reads clauses as flat array filtered by `brief_id`. A `brief_clauses_fts` GIN index enables the `/settings/brief` search by clause text.

**Versioning rule:** editing a chip bumps the Brief to draft status. Customer must re-sign (Seal-draw ceremony) to produce a new signed version. Draft Briefs do not authorize new agent actions — agents read only signed versions.

### Truth File schema (storage mechanics)

```typescript
// apps/web/types/truth-file.ts

export interface TruthFileField {
  field_id: string;              // 'hours_monday', 'service_area', etc.
  label: string;
  value: string | string[];
  is_verified: boolean;          // customer-confirmed vs. auto-extracted
  source: 'customer_input' | 'scan_extracted' | 'gbp_sync';
  last_verified_at: string;
}

export interface TruthFile {
  id: string;
  customer_id: string;
  vertical: 'saas' | 'ecommerce' | 'local_services' | 'generic';
  base_fields: TruthFileField[];         // universal fields (hours, name, contact)
  vertical_extensions: Record<string, unknown>;  // vertical-specific JSONB blob
  version: number;
  created_at: string;
  updated_at: string;
}
```

**Storage:** `truth_files` table with `vertical_extensions: jsonb`. Base fields are normalized columns (queryable without JSON operators). Vertical extensions live in JSONB (flexible schema per vertical). A `truth_file_versions` table stores diffs on each update (so agents can reference `truth_file_version` in provenance envelopes).

**Access pattern:** agents call `ctx.kb.getTruthFile(customer_id)` — returns the current signed `TruthFile`. The validator cross-references agent output against `truth_files.base_fields` in O(n) time. No vector search for Truth File — it's a small structured object, direct comparison is correct.

### Three House Memory schemas (separately)

**1. Artifact Ledger (the /home Receipts list)**

```sql
CREATE TABLE artifacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id),
  type         TEXT NOT NULL,  -- 'scan' | 'digest' | 'monthly_update' | 'agent_action' | 'workflow_run'
  title        TEXT NOT NULL,
  agent_id     TEXT,           -- null for scans/digests
  run_id       UUID,           -- FK to agent_runs if type = 'agent_action'
  permalink    TEXT,           -- /artifacts/:id (default-private)
  is_public    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON artifacts (customer_id, created_at DESC);
```

Query pattern: `SELECT * FROM artifacts WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50`. Simple, fast, no vectors.

**2. Margin Notes (customer annotations on Inbox items)**

```sql
CREATE TABLE margin_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id),
  target_type  TEXT NOT NULL,  -- 'inbox_item' | 'artifact' | 'agent_action'
  target_id    UUID NOT NULL,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON margin_notes (customer_id, target_id);
```

These are not searchable by vector at MVP. Full-text search via `tsvector` on `body` is sufficient for the `/inbox` filter. Vector search over margin notes is Year 1.5 ("House Memory as queryable archive").

**3. Agent Memory (per-agent vector store for runtime context)**

```sql
-- Requires pgvector extension (already in Supabase)
CREATE TABLE agent_memory (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id),
  agent_id       TEXT NOT NULL,
  memory_type    TEXT NOT NULL,  -- 'prior_rejection' | 'learned_constraint' | 'calibration'
  content        TEXT NOT NULL,
  embedding      vector(1536),   -- text-embedding-3-small output
  metadata       JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON agent_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON agent_memory (customer_id, agent_id);
```

Access pattern: on each agent run, retrieve top-K memories by cosine similarity:

```sql
SELECT content, metadata FROM agent_memory
WHERE customer_id = $1 AND agent_id = $2
ORDER BY embedding <=> $3   -- $3 = embedding of current task context
LIMIT 10;
```

Embeddings computed via `text-embedding-3-small` (OpenAI, $0.02/1M tokens — negligible cost). Each margin note a customer adds on an agent's action is also embedded and written to `agent_memory` with `memory_type = 'learned_constraint'`, so the agent learns from customer feedback automatically.

### Provenance envelope (canonical TypeScript)

```typescript
// apps/web/types/provenance-envelope.ts

export type ReviewState = 'auto_applied' | 'pending_review' | 'approved' | 'rejected' | 'rolled_back';

export interface ProvenanceInput {
  truth_file_id: string;
  truth_file_version: number;
  brief_id: string;
  brief_version: number;
  brief_clause_ids: string[];           // which clauses authorized this action
  scan_id: string | null;
  prior_agent_outputs: string[];        // action_ids of upstream agents (for DAG runs)
  agent_memory_ids: string[];           // which agent_memory rows were used
}

export interface ValidationResult {
  passed: string[];
  warnings: string[];
  failed: string[];
  brand_voice_match: number | null;     // null at MVP if Brand Voice Guard not run yet
  truth_file_consistency: boolean;
  sensitive_topic_flags: string[];
}

export interface ProvenanceEnvelope {
  action_id: string;                    // 'act_01HZ...'
  run_id: string;                       // FK to agent_runs
  agent_id: string;
  agent_version: string;                // semver
  model: string;                        // 'claude-sonnet-4-6'
  model_seed: number;
  customer_id: string;
  inputs: ProvenanceInput;
  output: {
    kind: 'faq' | 'schema' | 'content_rewrite' | 'meta' | 'report';
    diff: unknown;                      // typed per kind
    lenses: Array<'done' | 'found' | 'researched' | 'changed'>;
  };
  validation: ValidationResult;
  review_state: ReviewState;
  rollback_token: string;               // 'rb_01HZ...'
  ttl: string;                          // ISO-8601, 30 days from creation
  confidence: number;                   // 0-1
  blast_radius: string[];               // URLs/paths this action touches
  created_at: string;
}
```

**MVP-required fields:** all except `validation.brand_voice_match` (null until Brand Voice Guard ships). Every field marked `| null` is MVP-optional; all others are required before proposal submission.

### Agent run lifecycle (pseudocode)

```typescript
async function runAgentForCustomer(
  agentId: string,
  customerId: string,
  runId: string,
  inputs: AgentInputs
): Promise<ProvenanceEnvelope> {

  // 1. Load context (parallel reads)
  const [brief, truthFile, agentMemory, scanResults] = await Promise.all([
    db.briefs.getSignedBrief(customerId),
    db.truthFiles.getCurrent(customerId),
    vectorStore.getRelevantMemory(customerId, agentId, inputs.taskContext, { topK: 10 }),
    db.scans.getLatest(customerId),
  ]);

  // Emit: status = 'running', step = 'Loading context'
  await emitRunState({ runId, agentId, customerId, status: 'running', currentStep: 0, totalSteps: 4 });

  // 2. Execute agent logic (LLM calls happen here)
  const draft = await agentStrategy[agentId].run({
    brief,
    truthFile,
    agentMemory,
    scanResults,
    priorOutputs: inputs.priorAgentOutputs ?? [],
    customInstructions: await db.customerAgents.getInstructions(customerId, agentId),
  });

  // Emit: step = 'Validating'
  await emitRunState({ runId, agentId, customerId, status: 'running', currentStep: 2, totalSteps: 4 });

  // 3. Pre-publication validation (synchronous, <500ms)
  const validation = await validator.validate(draft, { truthFile, brief });

  if (validation.failed.length > 0) {
    // Failed validation: do NOT propose; write incident to audit log
    await writeProvenanceEnvelope({ ...envelope, review_state: 'failed_validation' });
    throw new AgentValidationError(validation.failed);
  }

  // 4. Write provenance envelope
  const envelope: ProvenanceEnvelope = buildEnvelope({
    agentId, runId, customerId, draft, validation, brief, truthFile, agentMemory,
  });

  // Emit: step = 'Proposing'
  await emitRunState({ runId, agentId, customerId, status: 'running', currentStep: 3, totalSteps: 4 });

  // 5. Check review-debt counter — gate auto-apply if above threshold
  const trustTier = await getTrustTier(customerId, agentId);
  const reviewDebt = await db.inboxItems.getReviewDebtScore(customerId);

  if (trustTier === 'auto_apply' && reviewDebt < REVIEW_DEBT_THRESHOLD) {
    // Auto-apply: write to inbox as 'auto_applied', trigger L2 site integration
    await db.inboxItems.insert({ ...item, status: 'auto_applied', provenance_id: envelope.action_id });
    await siteIntegration.apply(draft, customerId); // L2 layer
  } else {
    // Pre-approve: write to inbox as 'pending'
    await db.inboxItems.insert({ ...item, status: 'pending', provenance_id: envelope.action_id });
  }

  // 6. Write agent memory (learn from this run)
  await vectorStore.writeMemory(customerId, agentId, {
    content: `Action: ${draft.summary}. Confidence: ${envelope.confidence}. Outcome: pending.`,
    metadata: { action_id: envelope.action_id, run_id: runId },
  });

  // 7. Write artifact ledger entry
  await db.artifacts.insert({ customerId, type: 'agent_action', agentId, runId });

  // 8. Emit run complete
  await emitRunState({ runId, agentId, customerId, status: 'completed', currentStep: 4, totalSteps: 4 });

  return envelope;
}
```

---

## Tier 0 task list — what Build Lead must lock before any worker writes a component

These are execution-order-dependent. Each unblocks the next.

**1. Canonical type files (1 person-day)**
Create `apps/web/types/` with `brief.ts`, `truth-file.ts`, `provenance-envelope.ts`, `agent-run-state.ts`, `evidence-card.ts`. No worker writes a route or component until these exist. They are the shared contract.

**2. Supabase schema migration — Tier 0 tables (3 person-days)**
Migrations for: `briefs`, `brief_clauses`, `truth_files`, `agent_runs`, `agent_memory` (with pgvector), `artifacts`, `margin_notes`, `provenance_envelopes`, `provenance_steps`, `workflows`, `workflow_nodes`, `workflow_edges`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `marketplace_editorial`. Plus RLS policies for all customer-scoped tables. This is a single migration file, applied to Supabase before any backend route is written.

**3. Inngest Pro contract + `run-agent` function skeleton (1 person-day)**
Confirm Inngest Pro tier ($150/mo). Deploy the `runAgent` Inngest function skeleton (no per-agent logic yet — just the step structure, `emitRunState` helper, and provenance-write stubs). Validate 60s step timeout on Pro tier with a smoke test.

**4. Supabase Realtime channel integration (1 person-day)**
Write the `emitRunState` helper (Supabase Broadcast send). Write the client-side `useAgentRunState` hook (channel subscribe + 10s polling fallback). Write `GET /api/agent-runs/active` endpoint. Test end-to-end: trigger a fake agent run → observe Realtime event in browser DevTools.

**5. L2 integration mode decision + Git-mode build (2 person-days)**
Confirm manual-paste as MVP launch mode (document in DECISIONS.md). Build copy-ready diff endpoint (`GET /api/inbox-items/:id/copy-diff` → returns JSON-LD, FAQ HTML, meta tag formatted for paste). Simultaneously begin WordPress plugin (separate track, 10-day build). Git-mode (GitHub PR via Octokit) also ships at MVP — 2 days of build.

Total Tier 0: ~8 person-days. This is the 3-week Tier 0 the audit identified, compressed because the type definitions and schema design are done here in this document.

---

## Open questions only Adam can lock

**1. Truth File: universal schema with vertical extensions OR per-vertical schemas?**
Engineering implication: the `vertical_extensions: jsonb` approach I've specced is flexible but means no type safety for vertical-specific fields. Per-vertical Zod schemas (one per vertical) give type safety and better validation, but require a new schema file per vertical expansion. My recommendation: per-vertical Zod schemas. Adam must confirm the 2 MVP verticals (SaaS + e-commerce) are locked before Tier 0 schema work begins.

**2. Brief signing: is the Seal-draw ceremony mandatory on every edit, or only on first signing?**
This is a Trust Architecture question. If every chip-edit requires a re-sign ceremony (800ms Seal-draw), the Brief becomes high-friction for returning customers. If only first-signing requires the ceremony, returning edits are instant but the constitutional metaphor loses force. Engineering is straightforward either way — but the product decision affects the `/settings/brief` UX and the agent runtime's Brief-version check logic.

**3. Workflow Builder phasing: does Adam accept MVP-1 as viewer-only + template runner, or must the DAG editor be interactive on day one?**
This is the single question that determines whether Workflow Builder is a 2-week MVP task or a 6-week MVP task. Viewer-only + run workflows from templates = 2 weeks. Drag-and-drop DAG editor on day one = 6 weeks. My recommendation is viewer-only, with the DAG editor shipped 6 weeks post-launch when the agent runtime is stable enough for arbitrary compositions.

---

*End of Senior Backend Architect report. ~3,700 words.*

*— the senior backend architect*
