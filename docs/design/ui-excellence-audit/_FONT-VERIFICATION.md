---
title: Font Verification — does the Beamix type stack actually load?
date: 2026-06-12
author: uix-f1 (frontend-engineer, UI-excellence initiative)
scope: apps/web (Next.js product app) — webpack production build
verdict: ONE REAL FONT BUG FOUND + FIXED (Fraunces never loaded). Display register is real (Inter Tight, by design).
---

# TL;DR for downstream workers

> **The "no serif beat" finding is NOT a dev-renderer false positive. It is a real, global font-loading bug — Fraunces was never imported, so every `var(--font-serif)` beat (≈20 source files) was rendering as Georgia.** Fixed in this branch (`feat/uix-f1-tokens-shell`) by importing Fraunces in `layout.tsx`. After this lands, the serif beat renders as actual Fraunces in the webpack/prod build.
>
> The "no InterDisplay register" finding is **partly a naming/expectation mismatch**, not a fallback bug: headings DO render in a real, loaded display face — but it is **Inter Tight**, loaded deliberately as the `--font-inter-display` / `--font-display` token (see `layout.tsx` comment). It is not "InterDisplay" the typeface and it is not a Georgia/system fallback. If a heading on a captured screen looked like "default bold," that is the known **turbopack-dev** font issue (CRAFT-SYSTEM.md §Blocker) on the dev renderer, NOT the webpack/prod build — the prod build resolves Inter Tight correctly.

---

## What was verified

Inspected `apps/web/src/app/layout.tsx` (the only `next/font` setup), `apps/web/src/app/globals.css` (the `--font-*` token map), and grepped every `var(--font-serif)` / `var(--font-display)` consumer in `apps/web/src`. Then ran a clean **webpack production build** (`pnpm -F @beamix/web build`, exit 0) — production uses webpack, not turbopack, so it is the honest signal for what ships on Vercel.

## The four token tracks (before fix)

| Token (globals.css) | Mapped to | Loaded in layout.tsx? | Result before fix |
|---|---|---|---|
| `--font-sans` / `--font-inter` | `Inter` (next/font/google) | YES | ✅ Real Inter |
| `--font-display` / `--font-inter-display` | `Inter_Tight` (next/font/google) | YES | ✅ Real Inter Tight (NOT the "InterDisplay" face, by design — see layout comment) |
| `--font-mono` / `--font-geist-mono` | `Geist_Mono` (next/font/google) | YES | ✅ Real Geist Mono |
| `--font-serif` / **`--font-fraunces`** | `Fraunces` | **NO — never imported** | ❌ **Fell back to Georgia, serif** |

`globals.css` line: `--font-serif: var(--font-fraunces), 'Fraunces', Georgia, serif;`
`--font-fraunces` was **never defined** (no `Fraunces({ variable: '--font-fraunces' })` in `layout.tsx`, and `--font-fraunces` was not on the `<body>` className). So the cascade skipped the undefined CSS variable, skipped the un-installed `'Fraunces'` family name, and resolved to **Georgia**.

## Blast radius of the bug

`grep -rn "var(--font-serif)" apps/web/src --include="*.tsx"` → **20 files**, including every score-reveal verdict, market hero, ask answer card, team console, traceability, sentiment, shopping matrix, builder surface, and the agency audit report. Each `className="font-[var(--font-serif)] italic"` beat — the "warm-minimal soul" serif moment — was rendering as **Georgia italic**, which reads as a generic browser serif, not the editorial Fraunces beat the design vision requires. This is exactly why multiple per-page audits reported "no Fraunces beat / serif beat absent" (CRAFT-SYSTEM tell #6).

## The fix (this branch)

`apps/web/src/app/layout.tsx`:
- Import `Fraunces` from `next/font/google`.
- Load it with `variable: '--font-fraunces'`, `weight: ['400','500','600']`, `style: ['normal','italic']` (italic is the canonical beat).
- Add `${fraunces.variable}` to the `<body>` className so the CSS variable is defined on the document.

After the fix, `--font-fraunces` resolves to the real Fraunces face and every `var(--font-serif)` beat renders correctly in the webpack/prod build. Verified: `pnpm -F @beamix/web build` → exit 0, no font module errors.

## Guidance for downstream UI-excellence workers

1. **Stop treating "serif beat absent" as a content gap to design around.** Once this foundation branch merges, the beat renders. Add the single Fraunces italic verdict-word beat per screen (M5) as the rubric intends — it will now actually display as Fraunces.
2. **Do NOT add Fraunces to UI chrome** (nav, labels, table cells, buttons). M5 / DESIGN-VISION §4: editorial moments only (verdict word, hero display, report cover, score-reveal verdict).
3. **Heading register:** headings render in **Inter Tight** (the `--font-display` token), by design. It is a real loaded face. If a screenshot shows a heading as plain system bold, you captured the **turbopack-dev** renderer — recapture against the **webpack** dev server (`next dev` without `--turbopack`) or **prod** (app.beamixai.com, demo account) per CRAFT-SYSTEM.md §Blocker. The webpack/prod build is correct.
4. **Mono numbers** render in real Geist Mono — the `font-mono` Tailwind utility is mapped to it in `@theme`. M11 is safe to enforce.

## Open / not-in-scope here

- The `dev` script still uses `--turbopack` (`apps/web/package.json:6`). The turbopack-dev font fallback (CRAFT-SYSTEM.md §Blocker) is a **dev-renderer** issue; the prod build is unaffected and was not changed here to avoid a global dev-workflow change outside this bucket's file scope. Recommend a separate CTO ticket to either fix the turbopack font import or drop `--turbopack` from `dev` so the design-critic visual loop can run locally. This does NOT block any prod/webpack capture.
