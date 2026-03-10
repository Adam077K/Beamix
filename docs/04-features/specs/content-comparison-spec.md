# Beamix — Content Comparison Tool Technical Spec

> **Author:** Atlas (CTO)
> **Date:** 2026-03-08
> **Status:** Ready for implementation
> **Audience:** Engineers building the Content Comparison Tool. You should be able to implement this end-to-end without reading any other document.
> **Source docs:** `04-features/new-features-batch-1-spec.md`, `PRICING-IMPACT-ANALYSIS.md §1`, `04-features/content-system-spec.md`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Diff Algorithm](#5-diff-algorithm)
6. [Inngest Jobs](#6-inngest-jobs)
7. [API Routes](#7-api-routes)
8. [UI Components](#8-ui-components)
9. [Tier Gating](#9-tier-gating)
10. [Cost Impact](#10-cost-impact)
11. [Engineering Notes](#11-engineering-notes)

---

## 1. Feature Overview

**What it does:** When a user edits agent-generated content in the content editor, they can toggle a split-screen view showing the original agent output on the left and the current edited version on the right. Changes are highlighted with diff colors: additions in green, deletions in red with strikethrough. This gives the user a precise "before vs after" view so they know exactly what they modified and can revert individual sections if needed.

**Business value:**
- Increases user confidence in editing agent output. Users are hesitant to modify AI-generated content if they cannot clearly see what they are changing or easily compare to the original. The diff view removes this friction.
- Reduces support burden. "I changed something and now it's worse" becomes a self-service problem: the user can see what they changed and choose to revert via version history.
- Differentiates Beamix from competitors. RankScale has a "Content Comparison" feature; most GEO tools show only the current version with no history. Offering this at all paid tiers adds meaningful perceived value at zero cost.

**The core insight:** The `content_versions` table already stores every version with `version_number`, `content_body`, `edited_by`, and `change_summary`. This is a purely UI feature — no new data collection, no new background jobs, no LLM calls for the core experience.

---

## 2. Scope and Boundaries

### In Scope — Phase 1

| Capability | Notes |
|-----------|-------|
| Side-by-side split-pane diff view | Left = older version, Right = newer version |
| Word-level diff highlighting | `diffWords` from `diff` npm package |
| Version selector dropdown | Pick any two versions to compare |
| Integration into existing content editor | New "Compare" tab alongside Edit and Preview |
| Edge case: single version content | Compare tab disabled with explanation |
| Edge case: no changes between versions | Empty diff state: "No changes between these versions" |
| RTL Hebrew support | Both panes flip layout direction |

### In Scope — Phase 2

| Capability | Notes |
|-----------|-------|
| "Explain Changes" button | On-demand Haiku call explaining what changed and why |
| `POST /api/content/[id]/explain-diff` API route | Rate limited, 20 req/hr per user |
| `ExplainChangesPanel` component | Collapsible, shows Haiku explanation |
| Disclaimer: "Content sent to Anthropic API" | Below the Explain Changes panel |

### Deferred

| Capability | Reason |
|-----------|--------|
| Automatic LLM explanation on page load | Adds per-user LLM cost on every content view. On-demand only per spec decision. |
| Three-way merge view | Not needed for v1. Two-version comparison is sufficient. |
| Inline revert (click to undo a specific change) | Requires content mutation logic beyond the current editor. Future feature. |

### Out of Scope

- The diff view is read-only. Users cannot edit content from within the diff view.
- The diff view does not show image changes, only text/Markdown body changes.
- This feature does not add new version storage. Versions are created by existing agent and user edit pipelines.

---

## 3. User Flows

### 3.1 Viewing a Diff

```
1. User visits /dashboard/content/[id] (any paid tier)
2. Content editor renders three tabs: Edit | Preview | Compare
3. If content has only 1 version: Compare tab is disabled ("Need at least 2 versions to compare")
4. User clicks Compare tab
5. VersionSelector dropdowns appear: "From" (older) and "To" (newer)
6. Default selection: "From = version 1 (Agent original)", "To = latest version"
7. ContentDiffView renders in split pane:
   Left pane: "From" version rendered as Markdown with deletions highlighted
   Right pane: "To" version rendered as Markdown with additions highlighted
8. User can change either dropdown to compare any two versions
9. User clicks a different version in "From": diff recomputes client-side instantly
10. User clicks "Back to Edit": returns to Edit tab, current version unchanged
```

### 3.2 Edge Case — No Changes Between Versions

```
1. User selects two versions that have identical content_body
2. DiffHighlighter computes diff result: empty array (no changes)
3. ContentDiffView renders: "No changes between these two versions"
4. Suggestion: "Try comparing to an earlier version"
```

### 3.3 Explain Changes Flow (Phase 2)

```
1. User is viewing a diff between version A and version B
2. "Explain Changes" button appears below the diff pane (Phase 2 only)
3. User clicks "Explain Changes"
4. ExplainChangesPanel expands below the diff view, shows loading state
5. Client POSTs to /api/content/[id]/explain-diff with { versionFrom, versionTo }
6. API fetches both version bodies, calls Haiku, returns { explanation: string }
7. ExplainChangesPanel renders explanation text
8. Disclaimer text below: "Analysis powered by Claude AI — your content is sent to Anthropic's API to generate this explanation."
9. Panel remains open until user collapses it
10. If user clicks "Explain Changes" again on the same version pair: shows cached result (React Query caches by versionFrom+versionTo key)
```

---

## 4. Data Model

**No database changes required.** The existing `content_versions` table provides everything needed.

### Existing `content_versions` table (reference)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| content_item_id | uuid | FK → content_items |
| version_number | integer | Sequential. 1 = original agent output, 2+ = edits |
| content_body | text | Full Markdown content at this version point |
| edited_by | text | 'agent' or 'user' — distinguishes agent output from user edits |
| change_summary | text | Short description of what changed (LLM-generated at version creation) |
| created_at | timestamptz | When this version was created |

**The `change_summary` field** is already populated by the agent pipeline on version creation and can be surfaced in the UI alongside the diff view without any additional LLM calls. This is free value.

### New npm package

Install `diff` via npm or bun:

```bash
bun add diff
bun add -d @types/diff
```

Package details:
- Package: `diff` on npm
- License: MIT
- Size: ~5KB minified, zero transitive dependencies
- API used: `diffWords(oldStr, newStr)` — returns `Array<Change>`
- `Change`: `{ value: string, added?: boolean, removed?: boolean }`

---

## 5. Diff Algorithm

### Algorithm Choice

Use `diffWords` (Myers diff algorithm, word-granularity) as the default. `diffWords` splits text on whitespace boundaries, which handles both English and Hebrew correctly — Hebrew word boundaries are also whitespace-delimited.

Switch to `diffLines` when content is structured (e.g., schema markup, JSON-LD). The content editor can detect structured content by checking if `content_body` starts with `{` or contains `\n---\n` separators.

### Large Content Handling

If word count > 5,000 words (estimated from character count: `content_body.length > 30000`):
- Show a notice: "This is a large document — comparison may take a moment"
- Run `diffWords` in a `useEffect` with a short artificial delay to allow the loading state to render
- Do not use Web Workers in Phase 1 — not warranted at current content sizes

### DiffHighlighter Rendering Logic

```typescript
import { diffWords, type Change } from 'diff';

function computeDiff(oldText: string, newText: string): Change[] {
  return diffWords(oldText, newText);
}

// Render each change token:
// added=true   → span with class "bg-green-50 text-green-800 rounded-sm"
// removed=true → span with class "bg-red-50 text-red-600 line-through rounded-sm"
// neither      → plain text span (unchanged content)
```

Accessibility: color differences alone are not sufficient for accessibility. Added tokens also get `aria-label="added"` and removed tokens get `aria-label="removed"`. Both classes meet WCAG AA contrast requirements against the white/light-gray background.

---

## 6. Inngest Jobs

**None required.** The Content Comparison Tool is a client-side feature. No background jobs are needed for the diff view itself.

The "Explain Changes" API route (Phase 2) is a synchronous API call with a 20 req/hr rate limit enforced in the API layer — no Inngest job needed.

If rate limit enforcement is upgraded to use a distributed counter in the future, that can be handled via Upstash Redis in the API route middleware. Not required for Phase 1.

---

## 7. API Routes

### `GET /api/content/[id]/versions`

Verify this route exists. If it does not exist, it must be created as part of this feature build (the VersionSelector depends on it).

**Auth:** Required. User must own the content item.

**Path param:** `id` — `content_items.id` (uuid)

**Response shape:**

```typescript
{
  data: {
    versions: Array<{
      id: string;
      versionNumber: number;
      editedBy: 'agent' | 'user';
      changeSummary: string | null;
      createdAt: string;
      wordCount: number;        // derived: content_body.split(/\s+/).length
    }>;
    contentTitle: string;       // content_items.title
  }
}
```

**Does NOT return `content_body`** — bodies are fetched separately on demand to avoid sending large payloads in the version list.

---

### `GET /api/content/[id]/versions/[versionId]`

Fetches the full body of a single version. Called when the user selects a version in the VersionSelector dropdown.

**Auth:** Required. User must own the content item via the content_items → businesses → user_id chain.

**Response shape:**

```typescript
{
  data: {
    id: string;
    versionNumber: number;
    contentBody: string;
    editedBy: 'agent' | 'user';
    changeSummary: string | null;
    createdAt: string;
  }
}
```

---

### `POST /api/content/[id]/explain-diff` (Phase 2)

**Auth:** Required. User must own the content item.

**Request body (Zod schema):**

```typescript
const ExplainDiffSchema = z.object({
  versionFrom: z.number().int().positive(),
  versionTo:   z.number().int().positive(),
}).refine(
  (data) => data.versionFrom !== data.versionTo,
  { message: 'versionFrom and versionTo must be different' }
);
```

**Rate limit:** 20 requests per hour per user. Enforced via in-memory counter in Phase 1 (acceptable for single-instance deployment). Upgrade to Upstash Redis when horizontal scaling is needed.

**Logic:**
1. Validate auth and content ownership
2. Fetch `content_body` for `version_number = versionFrom` and `version_number = versionTo` from `content_versions`
3. If either version not found: return 404
4. Call Haiku with the prompt below
5. Return explanation string

**Haiku prompt:**

```
System: You are a GEO (Generative Engine Optimization) content analyst. You help business owners understand how edits to their content affect AI search visibility.

User: A user has edited AI-optimized content for their business. Here is the original version:

[VERSION A CONTENT]

Here is the edited version:

[VERSION B CONTENT]

In 2-3 sentences, explain:
1. What the user changed (be specific — mention exact phrases added or removed)
2. How those changes are likely to affect how AI search engines understand and cite this business

Keep the language plain and direct. Speak as if advising the business owner, not a developer.
```

**Response shape:**

```typescript
{
  data: {
    explanation: string;
    model: 'claude-haiku-4-5';  // For transparency
  }
}
```

**Error responses:**
- `400` — invalid body or versionFrom === versionTo
- `401` — not authenticated
- `403` — content not owned by user
- `404` — version number not found
- `429` — rate limit exceeded (`{ error: 'rate_limit', retryAfter: number }`)
- `500` — Haiku API error (return generic message, log full error server-side)

---

## 8. UI Components

All components live under `src/components/content/comparison/`.

### `ContentDiffView`

**Props:**
```typescript
interface ContentDiffViewProps {
  contentId: string;
  versions: ContentVersionMeta[];  // from GET /api/content/[id]/versions
}
```

**Behavior:**
- Manages state: `selectedFrom` (version number), `selectedTo` (version number)
- Default: from = version 1, to = latest
- On selection change: fetches both version bodies via `GET /api/content/[id]/versions/[versionId]`
- Passes fetched bodies to `DiffHighlighter`
- Renders the two `DiffHighlighter` panes in a `grid grid-cols-2 gap-4` layout
- In RTL mode (`dir="rtl"`): left pane becomes the "newer" version, right pane becomes "older" — because in RTL, reading direction is right-to-left, so the "before" should be on the right

### `VersionSelector`

**Props:**
```typescript
interface VersionSelectorProps {
  versions: ContentVersionMeta[];
  label: string;              // "Compare from" or "Compare to"
  value: number;              // selected version number
  onChange: (versionNumber: number) => void;
  excludeVersion?: number;    // prevent selecting the same version in both dropdowns
}
```

- Renders as a `<Select>` (Shadcn UI)
- Option label format: `"v{number} — {editedBy === 'agent' ? 'Agent output' : 'Your edit'} ({relative date})"`
- Grays out versions matching `excludeVersion`

### `DiffHighlighter`

**Props:**
```typescript
interface DiffHighlighterProps {
  oldText: string;
  newText: string;
  side: 'from' | 'to';      // which version this pane shows
  label: string;             // "Original" or "Edited" shown at pane top
}
```

**Behavior:**
- Computes `diffWords(oldText, newText)` in a `useMemo` hook
- Renders each `Change` token with appropriate class:
  - `added` and `side === 'to'`: green highlight (additions shown in the "to" pane)
  - `removed` and `side === 'from'`: red strikethrough (deletions shown in the "from" pane)
  - Neither: plain text
- Pane header shows: version label + word count + edited_by badge
- If diff produces zero changes: shows "No differences" inline text in the pane

### `ExplainChangesPanel` (Phase 2)

**Props:**
```typescript
interface ExplainChangesPanelProps {
  contentId: string;
  versionFrom: number;
  versionTo: number;
}
```

**Behavior:**
- Collapsed by default
- Button label: "Explain Changes"
- On click: calls `POST /api/content/[id]/explain-diff`
- Loading state: spinner + "Analyzing changes..."
- Success state: explanation text in a light-gray card
- Disclaimer below: "Analysis powered by Claude AI — your content is sent to Anthropic's API to generate this explanation."
- Error state: "Unable to generate explanation. Try again."
- Caches result in React Query with key `['explain-diff', contentId, versionFrom, versionTo]`

### Integration with existing `ContentEditor`

The existing content editor at `/dashboard/content/[id]` has "Edit" and "Preview" tabs. Add a "Compare" tab as the third option.

- "Compare" tab is visible when `versions.length >= 2`
- "Compare" tab is disabled (grayed out) when `versions.length < 2`, with tooltip: "Edit your content to create a second version to compare"
- Switching to Compare tab does not modify any editor state

---

## 9. Tier Gating

| Capability | Starter | Pro | Business |
|-----------|---------|-----|----------|
| Content diff view (core feature) | Yes | Yes | Yes |
| Version selector (compare any two versions) | Yes | Yes | Yes |
| Explain Changes button (Phase 2) | No | Yes | Yes |
| Number of versions stored | Unlimited | Unlimited | Unlimited |

**No tier gate on the core diff view.** Content editing is a core workflow for all paid users. Locking the diff view to Pro would be arbitrary and would reduce Starter retention for a feature that costs nothing to provide.

**Gate implementation for Explain Changes (Phase 2):**
- API route checks `plan_tier IN ('pro', 'business')`
- Returns `403 { error: 'upgrade_required', feature: 'explain_changes', tier: 'pro' }` for Starter
- `ExplainChangesPanel` checks tier from auth context; if Starter, shows upgrade prompt instead of the button

---

## 10. Cost Impact

Source: `PRICING-IMPACT-ANALYSIS.md §1`

| Metric | Value |
|--------|-------|
| Marginal cost per business per month (core feature) | ~$0 |
| Optional "Explain Changes" (Phase 2, on-demand only) | ~$0 (even at 10 clicks/month: $0.01/user) |
| Infrastructure cost | $0 — client-side computation |
| Tier gate | All paid tiers (Starter, Pro, Business) |
| Build priority | High |
| Build verdict from Axiom analysis | Build — pure UI, near-zero effort, immediate value |

**Cost narrative:** The diff computation runs entirely client-side using the `diff` npm package. There are no LLM calls, no background jobs, and no new database queries beyond fetching existing version bodies. Total marginal cost of this feature at any scale is zero dollars. The optional Phase 2 "Explain Changes" button adds cost only on explicit user action, and even at 10 uses per user per month, the total is $0.01/user/month. This is the lowest-cost feature in the Batch 1 set with the highest immediate user-facing value.

---

## 11. Engineering Notes

**Build effort:** 1 week total.

| Day | Work |
|-----|------|
| 1-2 | Install `diff` + `@types/diff`. Build `DiffHighlighter`. Build `ContentDiffView` with hardcoded mock versions to validate rendering. |
| 3 | `VersionSelector` component. Verify or create `GET /api/content/[id]/versions` route. Wire version fetching to `ContentDiffView`. |
| 4 | Integrate "Compare" tab into existing `ContentEditor` component. Test tab switching, disabled state for single-version content. |
| 5 | RTL testing. Edge cases (no changes, large content, Hebrew text). Write unit test for `computeDiff` function. |
| Phase 2, week 1 | `POST /api/content/[id]/explain-diff` route. `ExplainChangesPanel`. Rate limiting. |

**Build order:** This is the first feature to build in Batch 1 (recommended build order: F2 → F3 → F4 → F1). It is the simplest, has no dependencies on other Batch 1 features, and delivers immediate value to all paid users.

**Risks:**

| Risk | Mitigation |
|------|-----------|
| Very large content bodies (10K+ words) slow diff | Use `diffWords` not `diffChars`. Add word count check; show "large document" notice for bodies over 30K characters. |
| Hebrew text word-boundary detection | `diffWords` splits on whitespace — works correctly for Hebrew. No special handling needed. Validate with 10 Hebrew content examples. |
| Content editor state conflict (switching tabs) | Compare tab is read-only. No editor state is modified when switching to Compare. Validate with Playwright test: edit → switch to Compare → switch back to Edit → confirm no data loss. |
| `GET /api/content/[id]/versions` not yet implemented | Check on day 1 of build. If missing: implement it as the first task. Do not proceed without this route. |

**Self-check before shipping:**
- [ ] `diff` package is installed and importable
- [ ] `ContentDiffView` renders with real data from the `content_versions` table
- [ ] VersionSelector shows all versions with correct labels
- [ ] Green/red diff colors pass WCAG AA contrast check
- [ ] "Compare" tab is disabled (not hidden) when only 1 version exists
- [ ] Hebrew content renders correctly in both panes (right-to-left within each pane)
- [ ] No TypeScript errors in strict mode
- [ ] No `console.log` statements left in production code
