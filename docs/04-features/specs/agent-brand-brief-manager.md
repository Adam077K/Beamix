---
spec: agent-brand-brief-manager
status: DRAFT
wave: 1
risk_tier: full
created: 2026-05-23
owner: cpo
authors: [cpo]
implementation_owners: [ai-engineer, backend-engineer]
related_decisions:
  - DECISIONS.md 2026-05-23 entry (decision #15)
---

# Brand-Brief Manager Agent — PRD

## Purpose

The Brand-Brief Manager is the **single source of truth** for every customer's voice, identity, ICP, service catalog, competitor set, approval style, and hard-nos. It owns the canonical Brand Brief, versions it, indexes it for downstream-agent retrieval, and **evolves it** when customers correct published content or strategy direction.

The problem it solves: a customer's voice is a moving target. Without one canonical store with version history, downstream agents drift (Content Writer uses voice A, FAQ writer uses voice B, Approval-Gate writer uses voice C), trust collapses by month 2, and refunds spike. The Brand-Brief Manager guarantees that every customer-facing artifact in any wave was generated against the same version of the brief, with a diff trail back to the cause.

It is **never customer-facing** as a name — the customer sees Beamix doing the work. But every other agent in the fleet calls into it. This is the spine.

## Tier availability

All paying tiers. The Brand-Brief Manager is a platform primitive, not a tier-gated feature. Tier differences live in *how much* of the brief is captured (Discovery agent tier-gates depth), not in who can use the manager.

## Wave

**Wave 1.** Ships with the Discovery agent. Without the manager, the brief from discovery has nowhere to live.

## Inputs

1. **Draft Brand Brief** from the Discovery Agent (initial seed)
2. **Customer confirmations or edits** to the brief (one-click confirm or field-level corrections)
3. **Customer corrections to published content** (when customer rejects an approval-gate item with "this doesn't sound like us", a structured reason capture goes here)
4. **Strategy Agent monthly review outputs** (new KPIs, refined ICPs, new geo scope)
5. **Adam's manual edits** (through customer #50, via internal `/internal/brief-review` page)
6. **External signals** the customer marks "this is now true about us" (e.g. new service launched, name change)

## Outputs

### 1. Canonical Brand Brief

`brand_briefs` table — one canonical row per customer marked `status = canonical`. Same schema as Discovery output (see `agent-discovery.md`).

### 2. Brief version history

`brand_brief_versions` table — full row per version with diff metadata (changed_fields, change_reason, change_source, changed_by_user_id_or_agent, changed_at). Customer can view "what changed" timeline in the dashboard Settings page.

### 3. Versioned retrieval API for downstream agents

Internal RPC `get_brand_brief(customer_id, version='latest_canonical')` returns the JSON brief + version_id. **Every downstream agent must pass the version_id with every generation** — recorded in the generated artifact's `generated_against_brief_version_id`. This makes correction-driven evolution traceable.

### 4. Drift alerts

When the manager receives ≥3 customer-correction signals on the same field in 30 days, it raises a `brief.drift_detected` Inngest event. The Strategy Agent picks it up at the next monthly review.

### 5. Indexed embeddings (optional, Wave 2+)

Vector-indexed voice samples + tone descriptors for fast RAG by Content/FAQ writers. pgvector in Supabase; not Pinecone until scale demands.

## Tools needed

| Tool | Purpose |
|------|---------|
| `mcp__supabase__execute_sql` | All brief CRUD |
| `mcp__supabase__apply_migration` | (one-time) `brand_briefs` + `brand_brief_versions` tables |
| Anthropic Claude 4.6 Sonnet | Diff synthesis (when customer pastes a correction, agent extracts which fields to update + why) |
| Inngest | `brief.canonical_updated`, `brief.drift_detected` events |
| pgvector (Supabase extension) | Voice-sample embeddings (Wave 2+) |

## Prompt outline

```
SYSTEM PROMPT — Brand-Brief Manager v1

You manage the canonical Brand Brief for each Beamix customer. You are NEVER
customer-facing as a named entity. You are the index. The spine.

YOUR THREE JOBS

1. SEEDING
   When the Discovery Agent emits a `discovery.completed` event, take the Draft
   Brand Brief, validate the schema, set status="canonical_v1", index voice
   samples, and emit `brief.canonical_updated`.

2. EVOLUTION
   When a customer corrects published content, edits a brief field directly,
   or provides a new voice sample, you:
   a) Identify which fields of the brief should change
   b) Generate a diff (field, old_value, new_value, reason)
   c) Create a new version row with status="canonical_vN", and increment version
   d) Emit `brief.canonical_updated` with diff payload
   e) Notify all downstream agents to use the new version_id going forward

3. DRIFT DETECTION
   Maintain a 30-day rolling counter of customer-rejection reasons per field.
   When any field crosses 3 rejections in 30 days, emit `brief.drift_detected`
   with that field and rejection-reason samples for the Strategy Agent.

RULES
- Every field change MUST have a change_source enum:
  ['discovery', 'customer_edit', 'customer_correction_signal', 'strategy_review',
   'adam_manual', 'system_inferred']
- Field changes from 'system_inferred' source require confidence_score ≥ 0.85.
  Below that, write to a `proposed_changes` table for human review.
- Never overwrite a field where the source was 'customer_edit' or
  'adam_manual' without a new 'customer_edit' or 'adam_manual' event.
  Customer/Adam intent beats system inference, always.
- YMYL fields (approval_style.ymyl_override, hard_nos.topics, hard_nos.claims)
  can ONLY be changed by source='customer_edit' or 'adam_manual'. System
  inference is BLOCKED for these fields.

OUTPUT
For each operation, return:
{
  "operation": "seed | evolve | drift_check",
  "brand_brief_id": "uuid",
  "new_version_id": "uuid",
  "diff": [...],
  "events_emitted": [...]
}
```

System-prompt total ~370 words.

## Eval criteria

Risk tier **Full**. Spine component — every downstream agent depends on it.

| Rubric | Pass threshold |
|--------|---------------|
| **Schema integrity** | 100% of canonical rows pass schema validation |
| **Version monotonicity** | Versions strictly increment; no out-of-order writes |
| **Diff accuracy** | Sample audit: 95% of generated diffs are field-precise (Adam-spot-check through #50) |
| **Source attribution** | 100% of field changes have valid change_source enum |
| **YMYL guard** | Zero system_inferred writes to YMYL fields (automatic fail if any detected) |
| **Customer-intent preservation** | Zero overwrites of customer_edit/adam_manual fields by system_inferred (automatic fail) |
| **Drift detection latency** | Drift event fires within 1h of 3rd rejection in 30d window |
| **Read latency for downstream agents** | p99 < 200ms for `get_brand_brief(customer_id)` |
| **Storage size sanity** | Brief size < 100KB per version (compression check) |

## Dependencies

- **Discovery Agent** (seeds the brief)
- **Approval-Gate Writer** (consumes brief on every draft; feeds back rejection signals)
- **Digest Writer** (consumes brief for tone of digest email)
- **Customer Success Agent** (reads brief for context in any customer chat)
- **Publisher Agent** (consumes brief for per-CMS metadata: author bio, schema author, etc)
- **Strategy Agent** (consumes brief on monthly review; can propose evolutions)
- **brand_briefs + brand_brief_versions tables**
- **Inngest events**: `discovery.completed`, `customer.correction_submitted`, `strategy.review_completed`, `customer.brief_edited`

## Failure modes & fallbacks

| Failure | Fallback |
|---------|----------|
| Diff synthesis fails (LLM error) | Fall back to "verbatim store" — write the customer's edit raw, mark new version with `diff_synthesis_failed=true`. Strategy Agent reviews at next monthly. |
| Schema validation fails on incoming write | Reject write, emit `brief.write_rejected` event, surface to Adam dashboard. Never write invalid brief to canonical. |
| Two simultaneous customer + agent writes (race) | Optimistic concurrency control via `expected_version_id` parameter. Loser re-reads + retries. |
| Customer disputes a system_inferred field they didn't actually request | One-click revert in dashboard → restores prior canonical version. |
| Drift event fires but no Strategy review for 30+ days | Auto-promote drift to "blocker" — Customer Success Agent surfaces in next customer chat. |
| pgvector embedding job fails | Embeddings are lazily computed; failure isn't blocking. Retry on next read. |

## Risk tier

**Full.** New DB tables, every downstream agent depends on it, YMYL-field guard, customer-intent preservation. Migration is **irreversible** at table-create time (per Beamix QA matrix file-path floor).

## MCPs used

- `mcp__supabase__*` (mandatory — primary store)
- pgvector via Supabase extension (Wave 2+ for embeddings)

## Open questions for CTO

1. Embedding storage: pgvector now, or defer until first customer asks "find me a voice sample like X"? Default: defer to Wave 2.
2. Versioning ceiling: cap brief_versions at 100 per customer? Soft-archive older versions to JSONB blob? Default: no cap pre-launch; revisit at customer #100.
3. Diff synthesis: Sonnet or Haiku? Default: Haiku (it's structured comparison, not creative).
