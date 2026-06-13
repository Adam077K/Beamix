export const meta = {
  name: 'ui-excellence-recritic',
  description: 'Re-critic PASS gate: re-grade each POLISHED page (screenshots-final) against the Profound/Otterly competitor refs + the CRAFT-SYSTEM rubric. Returns PASS | NEEDS_WORK | CRITICAL per page + any REMAINING P1/P2 so the polish loop can iterate failures. Opus, batched 2-at-a-time to respect the server throttle.',
  phases: [
    { title: 'Recritic', detail: 'Opus re-grade per page -> verdict + remaining findings', model: 'opus' },
    { title: 'Synthesize', detail: 'pass-rate + iterate list', model: 'opus' },
  ],
}

let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
A = A || {}
const SLUGS = Array.isArray(A.slugs) ? A.slugs : []
if (!SLUGS.length) return { error: 'recritic requires args.slugs.' }

const BASE = '/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1781274933'
const AUDIT = BASE + '/docs/design/ui-excellence-audit'
const SHOTS = AUDIT + '/screenshots-final'
const COMPETITOR = BASE + '/docs/design/references/competitor'
const RUBRIC = BASE + '/docs/design/CRAFT-SYSTEM.md'
const OUT = AUDIT + '/recritic'

const BAR = `THE BEAMIX CRAFT BAR (binding; full rubric at ${RUBRIC}). 8 AI TELLS TO KILL: (1) uniform depth; (2) literal N-equal grid; (3) evenly-weighted type; (4) zero signature detail; (5) dead-center symmetry / centered-in-void; (6) Fraunces serif beat absent; (7) flat/absent motion; (8) blue/violet not spatial. 12 MOVES: M1 depth staging (ONE hero, .card-inset recede); M2 4-step type contract (64px mono figure / 30px display verdict / 12px eyebrow / 13-15px body); M3 intentional asymmetry; M4 signature micro-sparkline w/ baseline; M5 ONE Fraunces italic on a verdict word; M6 violet agent-zone glanceable, never on a button; M7 in-cell data shading; M8 designed empty (two-tier recovery); M9 entrance choreography; M10 progressive disclosure; M11 every number Geist Mono tabular-nums; M12 hairline editorial rhythm. The #173 dashboard is the craft exemplar. PASS = no AI tells, one TIER-1 focal, earned asymmetry, felt depth, mono numbers, one serif beat, designed states, sits beside the competitor refs as one hand.`

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'verdict', 'remaining_p1', 'remaining_p2', 'one_line', 'states_seen', 'doc_path'],
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'NEEDS_WORK', 'CRITICAL_ISSUES'] },
    remaining_p1: { type: 'array', items: { type: 'string' }, description: 'P1 issues STILL present in the polished render (empty if PASS), each with the specific fix + file if known' },
    remaining_p2: { type: 'array', items: { type: 'string' } },
    one_line: { type: 'string', description: 'honest one-line assessment of the polished page vs the competitor bar' },
    states_seen: { type: 'array', items: { type: 'string' } },
    doc_path: { type: 'string' },
  },
}

const SYNTH = {
  type: 'object', additionalProperties: false,
  required: ['pass_count', 'needs_work', 'pass_rate_note'],
  properties: {
    pass_count: { type: 'number' },
    needs_work: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['slug', 'top_remaining'], properties: { slug: { type: 'string' }, top_remaining: { type: 'string' } } }, description: 'pages NOT yet PASS + their single most important remaining fix' },
    pass_rate_note: { type: 'string' },
  },
}

function prompt(slug) {
  return `RE-CRITIC (PASS gate). This Beamix page was just POLISHED against the craft rubric (a foundation pass + a per-page polish pass landed). Grade its CURRENT polished rendered state — be fair but demanding.

PAGE: /${slug}

STEP 1 — Read the POLISHED screenshots: glob \`${SHOTS}/${slug}/\` and Read every .png (populated-desktop, populated-mobile, empty-desktop where present). If the folder is missing, return CRITICAL_ISSUES + one_line saying the capture is missing. Read 4-6 most-relevant competitor refs from \`${COMPETITOR}/\`. Read \`${RUBRIC}\`.

${BAR}

STEP 2 — Grade the polished render against the competitor bar + the 8 tells / 12 moves. Decide a verdict:
- PASS: meets the excellence bar — no AI tells, clear TIER-1 focal, earned asymmetry, felt depth, mono numbers, one Fraunces beat, designed states. Could sit beside Profound/Otterly as one hand.
- NEEDS_WORK: substantively good but with specific remaining issues.
- CRITICAL_ISSUES: a tell still dominates, a real bug, or it still reads AI-generated.
Be honest — if it's genuinely excellent now, say PASS (do not invent issues). If something is STILL wrong, list it precisely as remaining_p1/remaining_p2 with the concrete fix (the polish loop will iterate only these).

STEP 3 — Write a short verdict note to \`${OUT}/${slug}.md\` (verdict + what's strong + any remaining findings). Return the structured verdict.`
}

phase('Recritic')
const BATCH = 2
const results = []
async function run(slug) {
  const o = { label: `recritic:${slug}`, phase: 'Recritic', agentType: 'design-critic', model: 'opus', schema: SCHEMA }
  let r = await agent(prompt(slug), o).catch(() => null)
  if (!r) r = await agent(prompt(slug), { ...o, label: `recritic:${slug}:retry` }).catch(() => null)
  return r
}
for (let i = 0; i < SLUGS.length; i += BATCH) {
  const batch = SLUGS.slice(i, i + BATCH)
  const res = await parallel(batch.map(s => () => run(s)))
  results.push(...res)
  log(`Re-criticed ${Math.min(i + BATCH, SLUGS.length)}/${SLUGS.length}: ${batch.join(', ')}`)
}
const good = results.filter(Boolean)
if (!good.length) return { error: 'All re-critics failed.' }

phase('Synthesize')
const synth = await agent(
  `Summarize the re-critic PASS gate. Per-page verdicts:\n${JSON.stringify(good.map(r => ({ slug: r.slug, verdict: r.verdict, p1: r.remaining_p1?.length || 0, one_line: r.one_line })), null, 2)}\nReport pass_count (verdict==PASS), the needs_work list (each non-PASS slug + its single most important remaining fix), and a pass_rate_note. Write ${OUT}/_RECRITIC-SUMMARY.md.`,
  { label: 'recritic-synth', phase: 'Synthesize', model: 'opus', schema: SYNTH }
).catch(() => null)

return {
  graded: good.length,
  pass: good.filter(r => r.verdict === 'PASS').map(r => r.slug),
  needs_work: good.filter(r => r.verdict !== 'PASS').map(r => ({ slug: r.slug, verdict: r.verdict, p1: r.remaining_p1, one_line: r.one_line })),
  synthesis: synth || { note: 'synth dropped' },
}
