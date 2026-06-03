export const meta = {
  name: 'coding',
  description: 'Beamix T5 complex-coding workflow — implements independent slices in parallel isolated worktrees, then chains the combined diff into the binding qa.js gate. Returns per-slice results + the QA verdict. Does NOT merge — merge is Adam-gated after a qa.js PASS.',
  phases: [
    { title: 'Build', detail: 'one engineer per slice, isolated worktrees' },
    { title: 'QA', detail: 'chain combined diff into the binding qa.js gate', model: 'opus' },
  ],
}

// args: { slices: [{ id, agentType, brief, files }], tier?: "full"|"irreversible", ref?: string }
// agentType ∈ backend-engineer | frontend-engineer | database-engineer | ai-engineer | devops-engineer
// args may arrive as an object OR a JSON string — normalize either way.
// NOTE: this normalizer is duplicated across all .claude/workflows/*.js — keep the 4 copies in sync (the Workflow runtime has no shared-module import).
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
A = A || {}
const SLICES = A.slices || []
const TIER = A.tier || 'full'
const REF = A.ref || 'origin/main...HEAD'

if (!SLICES.length) {
  return { error: 'coding.js requires args.slices = [{id, agentType, brief, files}] — nothing to build.' }
}

const SLICE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'branch', 'files_changed', 'summary'],
  properties: {
    status: { type: 'string', enum: ['COMPLETE', 'BLOCKED'] },
    branch: { type: 'string' },
    worktree: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    decisions_made: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
}

function buildPrompt(s) {
  return `You are implementing ONE focused Beamix coding slice in an isolated git worktree branched from origin/main.
Slice [${s.id}] — ${s.brief}
Files in scope: ${(s.files || []).join(', ') || '(determine from the brief — stay narrow)'}.
Rules: TypeScript strict, Zod validation on all inputs, no placeholder UI, all four UI states, atomic conventional commits, never touch files outside scope. If a real architectural ambiguity blocks you, return status:BLOCKED with the specific question rather than guessing.
Verify your work compiles in THIS worktree (SKIP_ENV_VALIDATION=1 plus dummy Inngest/approval envs as the repo requires) before returning. Return the structured fields exactly.`
}

// ── Phase 1: parallel build, each slice isolated so worktrees don't collide ──
phase('Build')
const built = await parallel(SLICES.map(s => () =>
  agent(buildPrompt(s), {
    label: `build:${s.id}`,
    phase: 'Build',
    agentType: s.agentType || 'backend-engineer',
    model: 'sonnet',
    isolation: 'worktree',
    schema: SLICE_SCHEMA,
  })
))

// Detect slice-agent dropout BEFORE filtering — `built` is positional with SLICES, so a null
// at index i means SLICES[i] never returned. Never run QA on a silently-partial diff.
const missing = SLICES.filter((s, i) => !built[i]).map(s => s.id)
if (missing.length) {
  log(`${missing.length}/${SLICES.length} slice agents dropped out (no structured return): ${missing.join(', ')}`)
  return { status: 'BLOCKED', reason: 'slice agent dropout — refusing to QA a partial diff', missing, slices: built.filter(Boolean) }
}

const slices = built.filter(Boolean)
const blocked = slices.filter(s => s.status === 'BLOCKED')
const branches = slices.filter(s => s.status === 'COMPLETE').map(s => s.branch)

if (blocked.length) {
  log(`${blocked.length}/${SLICES.length} slices BLOCKED — skipping QA gate, returning for CEO re-brief.`)
  return { status: 'BLOCKED', slices, blocked: blocked.map(b => ({ branch: b.branch, blockers: b.blockers })), branches }
}

// ── Phase 2: chain the combined work into the binding QA gate ──
phase('QA')
log(`All ${slices.length} slices COMPLETE — running binding qa.js (${TIER}) over the combined diff.`)
const qa = await workflow('qa', {
  tier: TIER,
  ref: REF,
  context: `Combined diff from ${slices.length} parallel coding slices: ${SLICES.map(s => s.id).join(', ')}. Review the integration surface between slices as well as each slice.`,
})

return {
  status: qa.verdict === 'PASS' ? 'READY_TO_MERGE' : 'BLOCKED_BY_QA',
  slices,
  branches,
  qa_verdict: qa.verdict,
  qa_blockers: qa.blockers,
  qa_summary: qa.summary,
  note: 'No merge performed — Adam confirmation required after a PASS verdict.',
}
