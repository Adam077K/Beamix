# Beamix Design Operating System

The canonical reference for how Beamix designs product screens. Everything else in `docs/design/` and the design agents (`design-lead`, `product-designer`, `design-critic`, `design-polisher`) points here.

This is the operating system Adam approved. Read it before touching any screen.

---

## 1. The problem this fixes

The product reads "AI-generated / vibe-coded." Two gaps cause it:

1. **Richness / soul.** The UI is clean but not category-defining. It lacks the density of considered detail — depth, signature moments, motion choreography — that makes Stripe, Linear, Apple, and Anthropic surfaces feel inevitable.
2. **Execution vs vision.** Builds under-deliver the direction. What ships is a reasonable approximation of the intent, not the intent.

The old design gate validated **absence-of-bad** — a kill-list of banned fonts, harsh shadows, off-grid spacing. Passing it meant "nothing is obviously wrong." That is not the bar.

This system demands **presence-of-exceptional**, measured against real references Adam chooses. A screen is done when its craft is indistinguishable in level from those references, expressed in Beamix's own design language.

---

## 2. Core principle — references are VIBE, not blueprint

Reference images transfer the **feeling**: the level of craft, the aesthetic confidence, the density of intentional detail. They are **not** a pixel-spec to clone.

The designer **absorbs** the references, then **synthesizes** something **original** in Beamix's own language that achieves that feeling. Inspired-by, never traced.

**Grading "does it match reference X 1:1" is forbidden.** Copy-fidelity grading produces a derivative Frankenstein with no soul. The critic grades **craft-parity and feeling** — "does this hit the same richness, confidence, and polish as the references, expressed as Beamix?" — never copy-fidelity.

PASS = "indistinguishable in craft-**level** from the references, in Beamix's own language." Not pixel-match.

This principle is load-bearing. Every agent in the loop is bound by it. A critic that flags "doesn't match the reference layout" is malfunctioning.

---

## 3. The pipeline

Per screen, four stages, the last one a loop:

```
REFERENCE  ->  DIRECTION  ->  BUILD  ->  VALIDATE (loop)
```

| Stage | Owner | What happens |
|-------|-------|--------------|
| **REFERENCE** | design-lead | Assemble the reference folder: Adam's 2-3 north-stars + Refero-expanded real-pixel reference screens + a `REFERENCE.md` stating what we steal (the feeling/move, not the layout). This folder is the contract. |
| **DIRECTION** | design-lead | Set the direction for the screen in Beamix's language: the dominant tone, the one memorable element, the layout move, the motion budget. Optionally explore options via Stitch. Output a screen spec. |
| **BUILD** | product-designer | Implement the screen as shippable TSX + Tailwind in Beamix's own language. Loads BOTH `_product-feel/` and the screen's reference folder before any code. Visual shell with mock/static props. |
| **VALIDATE** | design-critic -> design-polisher -> re-critic | Grade craft-parity vs the references, close the craft gaps, re-grade. Repeat until parity or the round cap, then escalate to Adam. |

The pipeline aligns with the existing `/design` slash command (`.claude/commands/design.md`). It does not fork its conventions — it is the reference-driven, craft-graded spine that command runs on.

---

## 4. The two reference folders

References live under `docs/design/references/`, in two tiers.

### GLOBAL — `docs/design/references/_product-feel/`

A small curated set of screenshots capturing the **whole-product** soul. Loaded on **every** screen so the product feels like one coherent thing with a single point of view. Set once; changed rarely and deliberately.

Every designer and critic loads this folder first, on every screen.

### PER-SCREEN — `docs/design/references/[screen]/`

One folder per screen (e.g. `docs/design/references/dashboard/`, `docs/design/references/home/`). Contains:

- Adam's **2-3 north-star references** — the screens he points at and says "this feeling."
- **Refero-expanded** real-pixel reference screens — pulled via Refero to give the designer and critic enough real surfaces to absorb the craft level, not just three images.
- **`REFERENCE.md`** — a short note naming, for each reference, **what we steal: the feeling / the move, not the layout.** This is the contract everything is built toward and graded against — as vibe, not spec.

The per-screen folder is the **visual contract**. It is locked by Adam (checkpoint 1) before any build.

---

## 5. The agents

Four roles. Definitions live in `.claude/agents/`.

### design-lead (orchestrator — exists, extended)

Sets direction. **Assembles the reference folder** (Adam's north-stars + Refero expansion + `REFERENCE.md`). Runs the BUILD -> critic -> polish loop. Manages the three Adam checkpoints. Returns a dispatch packet when it cannot spawn (see §8). Escalates to the CEO.

### product-designer (the dedicated front-end designer — upgraded)

Builds the screen in **Beamix's own language**. Craft-mastery skills are **hard-wired always-on** in its system prompt: `design-taste-frontend`, `high-end-visual-design`, `emilkowal-animations`, `beamix-brand-quality-bar`, `frontend-design`, `humanizer`, `full-output-enforcement`. Loads **both** `_product-feel/` and the screen's reference folder before any code. Bound by the vibe-absorb-not-clone rule. Writes shippable TSX + Tailwind, never wireframes. Returns `screenshots` in its JSON — the critic depends on them.

### design-critic (rewritten)

Grades **craft-parity and feeling** vs the reference folder — **not 1:1**. Loads `ui-visual-validator` + `beamix-brand-quality-bar`. Takes Playwright screenshots of the **build** and compares them **side-by-side** against the reference images. Scores the **richness gap** and returns a specific "here is what's missing to reach the references' craft bar, expressed as Beamix" list, plus PASS / NEEDS_WORK / CRITICAL_ISSUES. Never implements (no Edit tool). PASS means craft-level parity, not pixel-match.

### design-polisher (new)

Polish specialist. Sole job: add **craft density** — depth, micro-interactions, signature details, motion choreography per `emilkowal-animations` — against the references, **after** the functional build. Sits in the loop between critic and re-critic.

---

## 6. The iterate + polish loop

VALIDATE is not a single pass. It is a loop:

```
BUILD (product-designer)
   -> CRITIC (craft-parity vs refs)
      -> POLISH (design-polisher closes the craft gaps)
         -> RE-CRITIC
            -> repeat until craft-parity (in Beamix's language)
               or max round cap -> escalate to Adam
```

The split is deliberate. The **build** gets the screen functionally right and on-brand. The **polish** adds the density that closes the richness gap. The **critic** holds the bar and names exactly what is missing. No single agent is asked to both build correctly and achieve category-defining polish in one shot — that is how the execution-vs-vision gap opens.

Round cap exists so the loop cannot spin forever. On cap, design-lead escalates to Adam with the current build, the critic's outstanding gaps, and a recommendation.

---

## 7. The three founder checkpoints

Adam is in the loop at exactly three points. Not more (it stalls), not fewer (the taste drifts).

1. **LOCK the reference folder** — before any build. Adam approves the per-screen `docs/design/references/[screen]/` folder + `REFERENCE.md`. This is the visual contract that captures his taste. Nothing is built until it is locked.
2. **See the ~50% first-paint build** — Adam sees the first real paint of the screen. Course-correct early, before polish effort is sunk.
3. **JUDGE the final** — Adam judges the finished, polished screen. PASS here is the real ship gate.

Between checkpoints, the loop runs autonomously.

---

## 8. The two run-modes

Subagents cannot spawn subagents — nested `Task` is blocked at runtime. So the pipeline runs one of two ways. Both are supported; both are documented.

### Mode A — CEO-Task dispatch (default)

design-lead does the thinking and returns a **dispatch packet** (the T2 default in the locked orchestration topology). The **CEO** spawns `product-designer`, `design-critic`, and `design-polisher` via `Task`, feeding each the screen spec, the reference folder paths, and the previous step's output. The CEO drives the loop turn by turn, routing the critic's findings to the polisher and back. design-lead never spawns the workers itself — nested `Task` is blocked, so it plans and packets only.

Use this when the work is exploratory, when Adam is actively steering, or when a single screen is in flight.

### Mode B — ultracode Workflow script

The whole pipeline runs as a deterministic `.claude/workflows` script that orchestrates the stages without a human-in-the-loop dispatcher between steps. The script sequences REFERENCE -> DIRECTION -> BUILD -> VALIDATE(loop), enforces the round cap, and surfaces the three Adam checkpoints as explicit gates.

Use this when the screen and its references are settled and the loop should run hands-off to a craft bar.

Both modes produce the same artifacts and obey the same checkpoints. Mode A is the default; Mode B is the scale path.

---

## 9. MCP tools

| MCP | Prefix | Role |
|-----|--------|------|
| **Refero** | `mcp__refero__*` | Reference pull — expand Adam's north-stars into a real-pixel reference set. Mandatory before designing. |
| **Stitch** | `mcp__stitch__*` | AI screen-gen for direction options + variant exploration. |
| **Playwright** | `mcp__playwright__*` | Visual validation — screenshot the build at 375 / 768 / 1024 / 1440px; capture references when an MCP is down. |
| **Pencil** | `mcp__pencil__*` | `.pen` design files when present (never Read/Grep a `.pen`). |

**On MCP unavailable:** log "MCP unavailable, falling back to [alt]" and continue. The standard fallback for references is Playwright-screenshotting the real product or reference URLs. Supabase is the only hard-block exception, and it is not part of this pipeline.

---

## 10. First application — dashboard + home

This system ships first on the **dashboard** and **home** screens.

Concretely:

- `docs/design/references/_product-feel/` is set once with the whole-product soul.
- `docs/design/references/dashboard/` and `docs/design/references/home/` each get Adam's north-stars, Refero expansion, and a `REFERENCE.md`.
- Each screen runs the full pipeline: REFERENCE -> DIRECTION -> BUILD -> VALIDATE(loop), with the three Adam checkpoints.
- Brand tokens are non-negotiable throughout: accent `#3370FF`, Inter / InterDisplay / Fraunces / Geist Mono, 8px grid, `rounded-lg` product utility, Lucide icons, score colors for data-viz only (Excellent `#06B6D4` / Good `#10B981` / Fair `#F59E0B` / Critical `#EF4444`). `beamix-brand-quality-bar` is authoritative and overrides the generic skills' font/color defaults — apply their **techniques** (asymmetry, macro-whitespace, custom easing, depth, full interaction states, no-stub), never their fonts or colors.

Once dashboard + home prove the loop, the same folders-and-pipeline pattern extends to every remaining screen.

---

## 11. Done means

A screen is done when:

1. Its per-screen reference folder was locked by Adam before the build.
2. The build is in Beamix's own design language — not a trace of any reference.
3. design-critic returns **PASS**: craft-parity with the references, all four states designed (loading, empty, error, success), brand tokens clean, no placeholder data.
4. Adam judged the final (checkpoint 3) and approved.
5. A session file exists at `docs/08-agents_work/sessions/YYYY-MM-DD-[role]-[slug].md` with `qa_verdict: PASS` in frontmatter (required by the QA gate to merge).

Anything short of all five is not done.
