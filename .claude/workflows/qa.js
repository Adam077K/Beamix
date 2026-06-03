export const meta = {
  name: 'qa',
  description: 'Beamix T5 binding QA gate — parallel dimension reviewers over a diff, 3 adversarial verifiers per finding (majority-real survives), Opus judge emits PASS/BLOCK. A BLOCK stops the merge; no CEO/Adam override. A failed correctness/security review is an automatic coverage-gap BLOCK. Irreversible tier adds loop-until-dry finder rounds.',
  phases: [
    { title: 'Review', detail: 'parallel dimension reviewers read the diff (retry on dropout)' },
    { title: 'Verify', detail: '3 independent adversarial verifiers per finding' },
    { title: 'Sweep', detail: 'loop-until-dry fresh-eyes rounds (Irreversible only)' },
    { title: 'Judge', detail: 'Opus synthesis → binding PASS/BLOCK', model: 'opus' },
  ],
}

// args: { ref?: string (git range, default "origin/main...HEAD"),
//         tier: "full" | "irreversible",
//         context?: string }
// args may arrive as an object OR a JSON string — normalize either way.
// NOTE: this normalizer is duplicated across all .claude/workflows/*.js — keep the 4 copies in sync (the Workflow runtime has no shared-module import).
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
A = A || {}
const REF = A.ref || 'origin/main...HEAD'
const TIER = A.tier || 'full'
const CONTEXT = A.context || 'No extra context provided.'

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'severity', 'file', 'title', 'detail'],
        properties: {
          id: { type: 'string', description: 'short stable slug, e.g. sec-rls-missing' },
          severity: { type: 'string', enum: ['P1', 'P2', 'P3'] },
          file: { type: 'string' },
          line: { type: 'string', description: 'line or range, or "" if N/A' },
          title: { type: 'string' },
          detail: { type: 'string', description: 'what is wrong and why it matters' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['is_real', 'reason'],
  properties: {
    is_real: { type: 'boolean', description: 'true only if the finding is a genuine defect that should block or be fixed' },
    reason: { type: 'string' },
  },
}

const GATE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['verdict', 'summary', 'blockers'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'BLOCK'] },
    summary: { type: 'string' },
    blockers: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'file', 'title', 'fix'],
        properties: {
          id: { type: 'string' }, file: { type: 'string' }, title: { type: 'string' },
          fix: { type: 'string', description: 'concrete remediation' },
        },
      },
    },
  },
}

const DIMENSIONS = [
  { key: 'correctness', critical: true, lens: 'logic errors, edge cases, broken contracts, regressions, wrong async/await, unhandled nulls' },
  { key: 'security', critical: true, lens: 'authz/RLS gaps, injection, secret leakage, unsafe input handling, OWASP, Supabase RLS policy holes, prompt-injection in any LLM-facing strings' },
  { key: 'patterns', critical: false, lens: 'Beamix conventions (Zod on inputs, TS strict, error handling, no placeholder UI), naming, dead code, duplication' },
  { key: 'tests', critical: false, lens: 'missing/weak test coverage for the changed paths, untested error branches, flaky patterns' },
  { key: 'perf', critical: false, lens: 'N+1 queries, missing indexes implied by new queries, needless re-renders, unbounded loops, blocking I/O' },
]

function reviewPrompt(d, attempt) {
  return `You are reviewing a Beamix diff for the **${d.key}** dimension only.
Run: \`git diff ${REF}\` (and \`git diff --stat ${REF}\` for scope). Read the changed files in full where needed.
Focus lens: ${d.lens}.
Extra context from the CEO: ${CONTEXT}
Report ONLY real, actionable defects in changed lines — do not invent issues, do not nitpick style the linter already covers. If the diff is clean for your dimension, return an empty findings array. Give each finding a short stable id.
IMPORTANT: you MUST finish by calling the StructuredOutput tool with the findings array (empty array if clean). Do not end without it.${attempt ? ' (Retry — your previous attempt did not return structured output.)' : ''}`
}

function verifyPrompt(f, lensIndex) {
  const lenses = [
    'Try hard to REFUTE this finding. Default to is_real=false unless the defect is unambiguous in the actual code.',
    'Reproduce the claim against the real diff. Read the cited file/line. Is the defect actually present and reachable?',
    'Assume the finding is a false positive. Look for the guard, validation, or context that makes it a non-issue. Only is_real=true if no such mitigation exists.',
  ]
  return `Adversarially verify ONE claimed QA finding against the real Beamix diff (\`git diff ${REF}\`).
Finding [${f.id}] (${f.severity}) in ${f.file}${f.line ? ':' + f.line : ''}: ${f.title}
Detail: ${f.detail}
${lenses[lensIndex % lenses.length]}
Read the actual changed code before deciding. Return is_real + a one-line reason via StructuredOutput.`
}

function judgePrompt(confirmed, tier, totalSeen, failedDims) {
  return `You are the binding QA-Lead judge for a Beamix **${tier}** change. Diff range: ${REF}.
${totalSeen} candidate findings were raised; ${confirmed.length} survived 3-way adversarial verification (majority-real):
${JSON.stringify(confirmed.map(f => ({ id: f.id, severity: f.severity, file: f.file, title: f.title, detail: f.detail })), null, 2)}
Coverage gaps (dimensions that failed to complete a review): ${failedDims.length ? failedDims.join(', ') : 'none'}.

Rules:
- BLOCK if ANY confirmed P1 exists, OR (tier=irreversible) ANY confirmed P1/P2 exists.
- BLOCK if a critical dimension (correctness or security) is in the coverage gaps — an incomplete binding gate cannot PASS.
- Otherwise PASS, logging P2/P3 as non-blocking.
Your verdict is final — CEO and Adam cannot override a BLOCK. Emit verdict, a one-paragraph summary (mention any coverage gaps), and a blockers array (empty on PASS).`
}

// Review one dimension with one retry; never throw — a persistent failure becomes a tracked coverage gap.
async function reviewDim(d) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await agent(reviewPrompt(d, attempt), { label: `review:${d.key}${attempt ? ':retry' : ''}`, phase: 'Review', model: 'sonnet', schema: FINDINGS_SCHEMA }).catch(() => null)
    if (r && Array.isArray(r.findings)) return { dimension: d.key, critical: d.critical, ok: true, findings: r.findings }
  }
  log(`Dimension ${d.key} returned no structured findings after 2 attempts — flagged as a coverage gap.`)
  return { dimension: d.key, critical: d.critical, ok: false, findings: [] }
}

// 3-way adversarial verification of one finding; tolerant of individual verifier dropout.
function verifyFinding(f, phaseName) {
  return parallel([0, 1, 2].map(i => () =>
    agent(verifyPrompt(f, i), { label: `verify:${f.dimension}:${f.id}#${i}`, phase: phaseName, model: 'sonnet', schema: VERDICT_SCHEMA }).catch(() => null)
  )).then(votes => {
    const valid = votes.filter(Boolean)
    // strict majority + quorum: need >=2 votes cast AND a strict majority real.
    // (a 1-of-1 lone vote or a 1-of-2 tie must NOT confirm — honors the majority-real contract)
    const real = valid.length >= 2 && valid.filter(v => v.is_real).length * 2 > valid.length
    return { ...f, confirmed: real, votes_cast: valid.length }
  })
}

// ── Phase 1: dimension review (retry-hardened) ──
phase('Review')
const dimResults = await parallel(DIMENSIONS.map(d => () => reviewDim(d)))
const failedDims = dimResults.filter(r => !r.ok).map(r => r.dimension)
const rawFindings = dimResults.flatMap(r => r.findings.map(f => ({ ...f, dimension: r.dimension })))

// ── Phase 2: adversarial verify ──
phase('Verify')
const verified = await parallel(rawFindings.map(f => () => verifyFinding(f, 'Verify')))
let allFindings = verified.filter(Boolean)
const seen = new Set(allFindings.map(f => f.id))

// ── Phase 3: loop-until-dry fresh-eyes rounds — Irreversible only, budget-guarded ──
if (TIER === 'irreversible') {
  phase('Sweep')
  let dry = 0, round = 0
  // `budget` is an injected Workflow-runtime global ({total, spent(), remaining()}); guard
  // defensively so a missing global can never throw — the round<3 cap bounds the loop regardless.
  while (dry < 2 && round < 3 && (typeof budget === 'undefined' || !budget.total || budget.remaining() > 60000)) {
    round++
    const fresh = await parallel(DIMENSIONS.map(d => () =>
      agent(`${reviewPrompt(d, 0)}\nThis is fresh-eyes sweep round ${round}. These finding ids are already known — find only NEW defects not in this list: ${[...seen].join(', ') || '(none yet)'}.`,
        { label: `sweep${round}:${d.key}`, phase: 'Sweep', model: 'sonnet', schema: FINDINGS_SCHEMA }).catch(() => null)
    ))
    const newOnes = fresh.filter(Boolean).flatMap(r => (r.findings || [])).filter(f => !seen.has(f.id)).map(f => ({ ...f, dimension: 'sweep' }))
    if (!newOnes.length) { dry++; log(`Sweep round ${round}: dry (${dry}/2)`); continue }
    dry = 0
    newOnes.forEach(f => seen.add(f.id))
    const sv = await parallel(newOnes.map(f => () => verifyFinding(f, 'Sweep')))
    allFindings.push(...sv.filter(Boolean))
    log(`Sweep round ${round}: ${newOnes.length} new, ${sv.filter(f => f && f.confirmed).length} confirmed`)
  }
}

// ── Phase 4: binding judge + deterministic coverage-gap safety override ──
phase('Judge')
const confirmed = allFindings.filter(f => f.confirmed)
const verdict = await agent(judgePrompt(confirmed, TIER, allFindings.length, failedDims), { label: 'judge', phase: 'Judge', model: 'opus', schema: GATE_SCHEMA })

const criticalGap = failedDims.filter(d => DIMENSIONS.find(x => x.key === d && x.critical))
let finalVerdict = verdict.verdict
let blockers = verdict.blockers || []
if (criticalGap.length) {
  finalVerdict = 'BLOCK'
  blockers = [...blockers, { id: 'coverage-gap', file: '(gate)', title: `Critical dimension(s) did not complete review: ${criticalGap.join(', ')}`, fix: 'Re-run qa.js so correctness + security reviews complete; a binding gate cannot PASS with a critical coverage gap.' }]
}

return {
  tier: TIER,
  ref: REF,
  candidates: allFindings.length,
  confirmed: confirmed.length,
  dimensions_failed: failedDims,
  critical_gap: criticalGap,
  verdict: finalVerdict,
  judge_verdict: verdict.verdict,
  summary: verdict.summary,
  blockers,
}
