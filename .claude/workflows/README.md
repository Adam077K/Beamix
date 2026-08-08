# Beamix T5 Workflow Library

Deterministic multi-agent workflows the **CEO** runs via the `Workflow` tool for **T5** tasks
(big / mid+ coding, design, research, QA). The script — not an agent — spawns the fleet, so the
nested-Task block does not apply and fan-out is cheap (Sonnet workers, Opus judge, Haiku trivial).

See `.claude/agents/ceo.md` → "Topology classification" and the topology memory for when T5 fires.

| Script | Invoke | Required args | Returns |
|--------|--------|---------------|---------|
| `qa.js` | `Workflow({name:"qa", args})` | `tier: "full"\|"irreversible"` (+ optional `ref`, `context`) | **binding** `verdict: PASS\|BLOCK` + blockers |
| `coding.js` | `Workflow({name:"coding", args})` | `slices: [{id, agentType, brief, files}]` (+ `tier`) | per-slice results + chained QA verdict |
| `design.js` | `Workflow({name:"design", args})` | `brief` (+ `target`, `variations`, `reference`) | winning direction + build-ready spec |
| `research.js` | `Workflow({name:"research", args})` | `question` (+ `depth: "standard"\|"deep"`) | cited, confidence-rated brief |
| `agent-audit.js` | `Workflow({name:"agent-audit", args})` | `deep: string[]` (+ `survey: string[]`, `axes?: string[]`) | 8-axis × N-project matrix + evidence-gated adoption recommendations |

## Shapes
- **qa** — 5 dimension reviewers → 3 adversarial verifiers on *block-eligible* findings only (P1 always; P2 at irreversible — P3/advisory are reported unverified, never block) → Opus judge with a deterministic P1-always-BLOCK override. Strict-majority + quorum vote. Irreversible adds loop-until-dry fresh-eyes rounds (budget-guarded, max 3). Pure vote/verdict logic is unit-tested in `lib/gate-logic.mjs` (`node --test .claude/workflows/lib/gate-logic.test.mjs`).
- **coding** — parallel build slices in isolated worktrees → always chains the combined diff into `qa.js`. Never merges (Adam-gated after PASS).
- **design** — N variations from distinct angles → parallel `design-critic` scoring → Opus synthesis grafting best runner-up ideas.
- **research** — Opus decompose → multi-modal parallel sweep → adversarial per-claim verification → Opus cited synthesis.
- **agent-audit** — Haiku resolve (gh api, treats caller list as unverified metadata) → per-repo pipeline: deep-clone + two blind axis-half extractors on disjoint 4-axis halves (retry each on dropout; API fallback with strength capped at medium if clone fails) OR single survey pass (≤6 gh api contents fetches, no retry, strength capped at medium in JS) → adversarial verify of load-bearing deep findings only against the same clone (capped at 10, budget-guarded) → Opus matrix fill on a JS-pre-built axis×project grid (JS re-stitches to guarantee no rows drop) → Opus adoption recs → **deterministic JS filter demotes any recommendation whose `evidence_ids` contain zero verified id into `open_questions`** (mirrors the P1-override in qa.js — the Opus adopter is not trusted to self-police unsourced recs). Runtime constraints (no nested Task, hook/CI-only enforcement, manifest load cost, no hard workflow budget) are stated in the P5 prompt so genuinely blocked mechanisms surface as `BLOCKED_BY_RUNTIME` rather than as ADOPT.

## Rules
- Authorization: classifying a task **T5** is the CEO's standing permission to run these. `ultracode` = Adam's manual force-everything override.
- Cost ceiling: **$15** per T5 ticket (vs $10 default). Typical ~15-20 agent run ≈ $3-6; Irreversible loop up to ≈ $15.
- `qa.js` is the sacred gate: a `BLOCK` stops the merge and the **CEO cannot override it**. Only **Adam** may override, via a logged finding-by-finding false-positive appeal (never to bypass a confirmed real defect).
- Models: workers `sonnet`, judges/synthesis `opus`, trivial `haiku`. Matches the locked model-routing rule.
