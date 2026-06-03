export const meta = {
  name: 'qa',
  description: 'Beamix T5 binding QA gate — parallel dimension reviewers over a diff, 3 adversarial verifiers per finding (majority-real survives), Opus judge emits PASS/BLOCK. A BLOCK stops the merge; no CEO/Adam override. Irreversible tier adds loop-until-dry finder rounds.',
  phases: [
    { title: 'Review', detail: 'parallel dimension reviewers read the diff' },
    { title: 'Verify', detail: '3 independent adversarial verifiers per finding' },
    { title: 'Sweep', detail: 'loop-until-dry fresh-eyes rounds (Irreversible only)' },
    { title: 'Judge', detail: 'Opus synthesis → binding PASS/BLOCK', model: 'opus' },
  ],
}

// args: { ref?: string (git range, default "origin/main...HEAD"),
//         tier: "full" | "irreversible",
//         context?: string (paths/notes the reviewers should focus on) }
const REF = (args && args.ref) || 'origin/main...HEAD'
const TIER = (args && args.tier) || 'full'
const CONTEXT = (args && args.context) || 'No extra context provided.'

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
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
  type: 'object',
  additionalProperties: false,
  required: ['is_real', 'reason'],
  properties: {
    is_real: { type: 'boolean', description: 'true only if the finding is a genuine defect that should block or be fixed' },
    reason: { type: 'string' },
  },
}

const GATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'summary', 'blockers'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'BLOCK'] },
    summary: { type: 'string' },
    blockers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'file', 'title', 'fix'],
        properties: {
          id: { type: 'string' },
          file: { type: 'string' },
          title: { type: 'string' },
          fix: { type: 'string', description: 'concrete remediation' },
        },
      },
    },
  },
}

const DIMENSIONS = [
  { key: 'correctness', agentType: 'code-reviewer', lens: 'logic errors, edge cases, broken contracts, regressions, wrong async/await, unhandled nulls' },
  { key: 'security', agentType: 'security-engineer', lens: 'authz/RLS gaps, injection, secret leakage, unsafe input handling, OWASP, Supabase RLS policy holes' },
  { key: 'patterns', agentType: 'code-reviewer', lens: 'Beamix conventions (Zod on inputs, TS strict, error handling, no placeholder UI), naming, dead code, duplication' },
  { key: 'tests', agentType: 'test-engineer', lens: 'missing/weak test coverage for the changed paths, untested error branches, flaky patterns' },
  { key: 'perf', agentType: 'code-reviewer', lens: 'N+1 queries, missing indexes implied by new queries, needless re-renders, unbounded loops, blocking I/O' },
]

function reviewPrompt(d) {
  return `You are reviewing a Beamix diff for the **${d.key}** dimension only.
Run: \`git diff ${REF}\` (and \`git diff --stat ${REF}\` for scope). Read the changed files in full where needed.
Focus lens: ${d.lens}.
Extra context from the CEO: ${CONTEXT}
Report ONLY real, actionable defects in changed lines — do not invent issues, do not nitpick style the linter already covers. If the diff is clean for your dimension, return an empty findings array. Give each finding a short stable id.`
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
Read the actual changed code before deciding. Return is_real + a one-line reason.`
}

function judgePrompt(confirmed, tier, totalSeen) {
  return `You are the binding QA-Lead judge for a Beamix **${tier}** change.
Diff range: ${REF}. ${totalSeen} candidate findings were raised; ${confirmed.length} survived 3-way adversarial verification (majority-real):
${JSON.stringify(confirmed.map(f => ({ id: f.id, severity: f.severity, file: f.file, title: f.title, detail: f.detail })), null, 2)}

Rule: BLOCK if ANY confirmed P1 exists, OR (for tier=irreversible) ANY confirmed P1/P2 exists. Otherwise PASS with P2/P3 logged as non-blocking.
Your verdict is final — CEO and Adam cannot override a BLOCK. Emit verdict, a one-paragraph summary, and a blockers array (empty on PASS or for non-blocking findings).`
}

// ── Phase 1+2: dimension review → 3-way adversarial verify (pipelined, no barrier) ──
phase('Review')
const reviewed = await pipeline(
  DIMENSIONS,
  d => agent(reviewPrompt(d), { label: `review:${d.key}`, phase: 'Review', agentType: d.agentType, model: 'sonnet', schema: FINDINGS_SCHEMA }),
  (review, d) => parallel(((review && review.findings) || []).map(f => () =>
    parallel([0, 1, 2].map(i => () =>
      agent(verifyPrompt(f, i), { label: `verify:${d.key}:${f.id}#${i}`, phase: 'Verify', model: 'sonnet', schema: VERDICT_SCHEMA })
    )).then(votes => {
      const real = votes.filter(Boolean).filter(v => v.is_real).length >= 2
      return { ...f, dimension: d.key, confirmed: real }
    })
  ))
)

let allFindings = reviewed.flat().filter(Boolean)
const seen = new Set(allFindings.map(f => f.id))

// ── Phase 3: loop-until-dry fresh-eyes rounds — Irreversible only, budget-guarded ──
if (TIER === 'irreversible') {
  phase('Sweep')
  let dry = 0
  let round = 0
  while (dry < 2 && round < 4 && (!budget.total || budget.remaining() > 60000)) {
    round++
    const fresh = await parallel(DIMENSIONS.map(d => () =>
      agent(`${reviewPrompt(d)}\nThis is fresh-eyes sweep round ${round}. These finding ids are already known — find only NEW defects not in this list: ${[...seen].join(', ') || '(none yet)'}.`,
        { label: `sweep${round}:${d.key}`, phase: 'Sweep', agentType: d.agentType, model: 'sonnet', schema: FINDINGS_SCHEMA })
    ))
    const newOnes = fresh.filter(Boolean).flatMap(r => (r.findings || [])).filter(f => !seen.has(f.id))
    if (!newOnes.length) { dry++; log(`Sweep round ${round}: dry (${dry}/2)`); continue }
    dry = 0
    newOnes.forEach(f => seen.add(f.id))
    const verified = await parallel(newOnes.map(f => () =>
      parallel([0, 1, 2].map(i => () =>
        agent(verifyPrompt(f, i), { label: `verify:sweep:${f.id}#${i}`, phase: 'Sweep', model: 'sonnet', schema: VERDICT_SCHEMA })
      )).then(votes => ({ ...f, dimension: 'sweep', confirmed: votes.filter(Boolean).filter(v => v.is_real).length >= 2 }))
    ))
    allFindings.push(...verified.filter(Boolean))
    log(`Sweep round ${round}: ${newOnes.length} new, ${verified.filter(f => f && f.confirmed).length} confirmed`)
  }
}

// ── Phase 4: binding judge ──
phase('Judge')
const confirmed = allFindings.filter(f => f.confirmed)
const verdict = await agent(judgePrompt(confirmed, TIER, allFindings.length), { label: 'judge', phase: 'Judge', model: 'opus', schema: GATE_SCHEMA })

return {
  tier: TIER,
  ref: REF,
  candidates: allFindings.length,
  confirmed: confirmed.length,
  verdict: verdict.verdict,
  summary: verdict.summary,
  blockers: verdict.blockers,
}
