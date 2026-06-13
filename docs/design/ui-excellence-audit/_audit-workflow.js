export const meta = {
  name: 'ui-excellence-audit',
  description: 'Deep image-grounded UI audit: each page\'s rendered screenshots vs Profound/Otterly competitor refs + the Beamix CRAFT-SYSTEM rubric (8 tells / 12 moves). Opus agents write exhaustive P1/P2/P3 findings docs, then a synthesis agent extracts systemic cross-page patterns + a disjoint polish-ownership plan. Optimizes for craft, not speed.',
  phases: [
    { title: 'Audit', detail: 'Opus deep audit per page -> findings doc', model: 'opus' },
    { title: 'Synthesize', detail: 'systemic cross-page patterns + polish plan', model: 'opus' },
  ],
}

// args: { group: string, slugs: string[] }
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
A = A || {}
const GROUP = A.group || 'WF'
const SLUGS = Array.isArray(A.slugs) ? A.slugs : []
if (!SLUGS.length) return { error: 'ui-excellence-audit requires args.slugs (non-empty array).' }

const BASE = '/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1781274933'
const AUDIT = BASE + '/docs/design/ui-excellence-audit'
const SHOTS = AUDIT + '/screenshots'
const COMPETITOR = BASE + '/docs/design/references/competitor'
const REFS = BASE + '/docs/design/references'
const RUBRIC = BASE + '/docs/design/CRAFT-SYSTEM.md'
// Page SOURCE lives on the full branch tip (b25-integrate worktree), NOT this ceo-1 worktree
// (which is on ~main and only has a subset of pages). Read source there for file:line citations.
const PROTECTED = '/Users/adamks/VibeCoding/Beamix/.worktrees/b25-integrate/apps/web/src/app/(protected)'

const BAR = `THE BEAMIX CRAFT BAR (binding — full rubric at ${RUBRIC}; also ${BASE}/docs/design/DESIGN-VISION.md + ${BASE}/docs/BRAND_GUIDELINES.md):
THE 8 AI-GENERATED TELLS TO KILL: (1) uniform depth — every surface same card, hierarchy told not felt; (2) literal N-equal grid of identical cards (the canonical AI layout); (3) evenly-weighted typography — nothing commands/recedes; (4) zero signature detail; (5) dead-center symmetry / full-width stacks / bare centered icon-in-circle empties; (6) serif beat absent (Fraunces used nowhere); (7) flat/absent motion; (8) blue/violet as a token detail not spatial (the you-vs-agents promise invisible at arm's length).
THE 12 CRAFT MOVES: M1 depth staging (3 felt tiers, ONE hero/screen, .card-inset recede); M2 four-step type contract (64px Geist Mono figure / 30px InterDisplay-Medium verdict / 12px Inter-600 uppercase eyebrow #9CA3AF / 13-15px body; exactly one STEP-1/screen, gaps obvious); M3 intentional asymmetry (dominant column + narrower rail; kill N-equal grids); M4 signature detail (engine micro-sparkline pattern); M5 ONE Fraunces italic serif beat on a verdict word only, never in chrome; M6 violet structure (agent zone reads different at arm's length via #EEEAFD ground/hairline; violet NEVER on a button); M7 in-cell data shading (big mono figure dominates; row hover ground + status hairline); M8 designed empty (titled context + specific next step + two-tier CTA + warm glyph; errors name a real recovery); M9 entrance choreography (fade-up 8px priority stagger, reduced-motion safe); M10 progressive disclosure (one focal above fold); M11 mono for truth (every real number Geist Mono tabular-nums, prose Inter); M12 hairline editorial rhythm (vary whitespace by relationship, not one global space-y-8).
BRAND LAW: accent #3370FF; blue=you / violet=agents; Inter/InterDisplay + Fraunces (serif soul) + Geist Mono; warm-minimal; restrained intentional motion. The #173 dashboard is the shipped craft EXEMPLAR — new pages must sit beside it as one hand.`

const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['slug', 'verdict', 'p1', 'p2', 'p3', 'states_seen', 'needs_redesign', 'one_line', 'top_findings', 'doc_path'],
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'NEEDS_WORK', 'CRITICAL_ISSUES'] },
    p1: { type: 'number', description: 'count of P1 (must-fix, looks AI/broken) findings' },
    p2: { type: 'number' },
    p3: { type: 'number' },
    states_seen: { type: 'array', items: { type: 'string' }, description: 'which screenshot files were actually read (populated/empty/mobile)' },
    needs_redesign: { type: 'boolean', description: 'true if the page needs a real redesign, not just cosmetic polish' },
    one_line: { type: 'string', description: 'the single worst thing about this page' },
    top_findings: { type: 'array', items: { type: 'string' }, description: 'the 3-6 highest-impact P1 findings, each with file:line if known' },
    doc_path: { type: 'string', description: 'absolute path of the findings doc you wrote' },
  },
}

const SYNTH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['systemic_patterns', 'worst_pages', 'shared_component_fixes', 'polish_plan'],
  properties: {
    systemic_patterns: { type: 'array', items: { type: 'string' }, description: 'tells/bugs that repeat across pages (shared components, global tokens) — fix once, fix everywhere' },
    worst_pages: { type: 'array', items: { type: 'string' }, description: 'pages ranked worst-first by craft gap' },
    shared_component_fixes: { type: 'array', items: { type: 'string' }, description: 'specific shared files/components whose fix cascades to many pages, with path' },
    polish_plan: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['owner_slug', 'scope', 'effort'], properties: { owner_slug: { type: 'string' }, scope: { type: 'string', description: 'redesign vs polish + the specific P1s to fix' }, effort: { type: 'string', enum: ['redesign', 'heavy-polish', 'light-polish'] } } }, description: 'disjoint per-page ownership so parallel polish workers never conflict' },
  },
}

function auditPrompt(slug) {
  const route = '/' + slug.replace(/^scan-free$/, 'scan/00000000-0000-4000-8000-00000000d3a0').replace(/^onboarding-post-payment$/, 'onboarding/post-payment')
  return `You are a ruthless, pixel-level design critic auditing ONE Beamix product page for an excellence pass. The whole surface was designed on mock data and NOBODY has seen it rendered — there are visible UI/UX bugs and AI-slop tells. Your job: find EVERYTHING wrong, exhaustively.

PAGE: /${slug}  (route ${route})

STEP 1 — LOAD INPUTS (Read these files; they are images + text):
- The rendered screenshots of THIS page: glob \`${SHOTS}/${slug}/\` and Read EVERY .png there (populated-desktop, empty-desktop, populated-mobile, etc.). These are what the page actually looks like. If the folder is missing or empty, say so in one_line and return verdict CRITICAL_ISSUES with p1=0 (do not invent findings for a page you cannot see).
- The COMPETITOR north-star refs: glob \`${COMPETITOR}/\` (Profound + Otterly — Beamix's direct GEO/AI-search competitors). Read the 4-6 most RELEVANT to this page type (dashboards/analytics pages -> their dashboard/chart shots; list/table pages -> their table shots; etc.). These define the excellence + professionalism bar to match.
- If a per-page reference folder exists at \`${REFS}/${slug}/\`, Read it (that is this page's north-star).
- The rubric: Read \`${RUBRIC}\` in full.
- The page SOURCE for file:line citations: explore \`${PROTECTED}/${slug}/\` (page.tsx + _components) and the shared components it imports. Use Grep/Read to pin findings to file:line.

${BAR}

IGNORE DEV ARTIFACTS (not part of the UI, do NOT report them): the Next.js dev-mode indicator badge in the bottom-left corner (a small dark "N" pill, sometimes "1 issue"), and any missing-favicon. These are local-preview artifacts only.

STEP 2 — DEEP SIDE-BY-SIDE AUDIT. For each captured state, compare the Beamix render against the competitor refs and the rubric. Write down EVERYTHING that makes it look AI-generated, unprofessional, unfinished, or broken. Be exhaustive and opinionated — cover at minimum: weak or duplicated focal (M1/M10), flat/uniform depth (tell 1), generic equal-card grids (tell 2), evenly-weighted type / type-contract leaks (tell 3, M2), missing signature detail (tell 4, M4), dead-center symmetry / mis-weighted asymmetry (tell 5, M3), absent serif beat (tell 6, M5), absent/cheap motion (tell 7, M9), blue/violet not spatial (tell 8, M6), numbers not in mono (M11), off-grid spacing / one-global-space-y (M12), empty/loading/error states that look unfinished or bare-centered (M8), broken responsive/mobile layout, dead space, misalignment, inconsistent radii/shadows/hairlines, overflow/clipping, contrast/legibility, and anything that reads as a template. Note real UI BUGS distinctly from craft gaps.

STEP 3 — WRITE THE FINDINGS DOC to \`${AUDIT}/${slug}.md\` with this structure:
  # ${slug} — UI Excellence Audit
  - frontmatter: page route, states audited (list the screenshot files), competitor refs used, verdict
  - "## Screenshots" — relative links to the screenshot files you read
  - "## Verdict" — PASS | NEEDS_WORK | CRITICAL_ISSUES + a 2-3 sentence honest summary of how far it is from the competitor bar
  - "## P1 — must fix (looks AI / broken)" — numbered, each: the problem, why it reads AI/broken vs the ref, the specific fix (which move M#), and file:line
  - "## P2 — substantive" and "## P3 — nice-to-have" — same format
  - "## Per-state notes" — populated vs empty vs mobile specifics
Be concrete: "the 3 identical stat cards in a sm:grid-cols-3 at StatCards.tsx:24 are tell #2 — make the primary metric a TIER-1 hero (M1) + asymmetric 1fr/rail (M3)" beats "improve hierarchy".

STEP 4 — RETURN the structured summary (counts, verdict, top P1s with file:line, needs_redesign, the doc path you wrote). Do NOT claim a finding you didn't write into the doc.`
}

// Process pages in BATCHES of 2 (sequential batches). Image-heavy Opus agents loading
// multi-MB competitor PNGs trip the server-side request throttle when 5+ fire at once;
// capping peak concurrency at 2 and spacing batches over time clears it. One retry per
// page (the next batch's delay acts as backoff) before giving up.
phase('Audit')
const BATCH = 2
const audits = []
async function runAudit(slug) {
  const opts = { label: `audit:${slug}`, phase: 'Audit', agentType: 'design-critic', model: 'opus', schema: AUDIT_SCHEMA }
  let r = await agent(auditPrompt(slug), opts).catch(() => null)
  if (!r) r = await agent(auditPrompt(slug), { ...opts, label: `audit:${slug}:retry` }).catch(() => null)
  return r
}
for (let i = 0; i < SLUGS.length; i += BATCH) {
  const batch = SLUGS.slice(i, i + BATCH)
  const res = await parallel(batch.map(slug => () => runAudit(slug)))
  audits.push(...res)
  log(`Audited ${Math.min(i + BATCH, SLUGS.length)}/${SLUGS.length} (${batch.join(', ')})`)
}
const good = audits.filter(Boolean)

if (!good.length) {
  return { error: 'All page audits failed.', group: GROUP, slugs: SLUGS }
}

phase('Synthesize')
const synth = await agent(
  `Synthesize the ${GROUP} UI excellence audit into a systemic view + a disjoint polish plan.
Per-page audit results (each wrote a full findings doc; summaries below):
${JSON.stringify(good, null, 2)}

You may Read any findings doc under ${AUDIT}/ for detail. Identify:
1. SYSTEMIC patterns — tells/bugs repeating across pages because of SHARED components or global tokens (fix once -> cascades). Name the shared file/component path.
2. WORST pages ranked worst-first by craft gap vs the competitor bar.
3. SHARED-COMPONENT fixes with concrete file paths.
4. A POLISH PLAN with DISJOINT per-page ownership (so parallel polish workers in separate worktrees never touch the same file) — mark each as redesign / heavy-polish / light-polish and list the specific P1s to fix.
Write this to ${AUDIT}/_SYNTHESIS-${GROUP}.md, then return the structured plan.`,
  { label: `synthesize:${GROUP}`, phase: 'Synthesize', model: 'opus', schema: SYNTH_SCHEMA }
).catch(() => null)

return {
  group: GROUP,
  pages_audited: good.length,
  audits: good.map(a => ({ slug: a.slug, verdict: a.verdict, p1: a.p1, p2: a.p2, needs_redesign: a.needs_redesign, one_line: a.one_line })),
  synthesis: synth || { note: 'synthesis agent dropped out — per-page docs still written' },
}
