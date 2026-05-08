---
critique_id: WS4-war-room
date: 2026-05-08
scope: war-room page + qa-lead-pass workflow + CONNECTIONS.md compliance
verdict: NEEDS_FIXES
finding_count: 13
---

# Adversarial Critique — WS4 War Room

## Scope

Files reviewed:
- `apps/web/src/app/(internal)/war-room/page.tsx`
- `apps/web/src/app/(internal)/war-room/layout.tsx`
- `apps/web/src/app/(internal)/war-room/components/LiveSection.tsx`
- `apps/web/src/app/(internal)/war-room/components/TodaySection.tsx`
- `apps/web/src/app/(internal)/war-room/components/TraceTree.tsx`
- `apps/web/src/app/(internal)/war-room/lib/queries.ts`
- `.github/workflows/qa-lead-pass.yml`
- `.github/pull_request_template.md`
- `docs/08-agents_work/CONNECTIONS.md`
- `docs/08-agents_work/ORCHESTRATION.md` §2G + §2A

---

## Findings

### F1 — Auth gate: `as any` cast silences Supabase type safety (HIGH)

**File:** `layout.tsx` line 12

```ts
const supabase = (await createClient()) as any
```

The `createClient()` call is cast to `any`, which silences TypeScript for the entire Supabase client on the auth boundary. If the `createClient` function signature changes (e.g. returns a different type post-upgrade), the `auth.getUser()` call will not produce a compile-time error. The email check on line 24 operates on `user.email as string | undefined` — this is a second manual cast that could silently accept `null` email if Supabase returns it. The actual server-side check is correct (RSC, not client-side), but the `as any` cast means the type system is not guarding it.

**Attack surface:** If a future Supabase version changes the `getUser()` return shape (e.g., returns `email` inside a different key), the check passes silently and returns the children. No compile error. No test catches it.

---

### F2 — Auth gate: empty `ADAM_EMAIL` env var results in universal access denial, not access grant (MEDIUM)

**File:** `layout.tsx` line 4 + line 24

```ts
const ADAM_EMAIL = process.env['ADAM_EMAIL'] ?? ''
// ...
if (!ADAM_EMAIL || !email || email.toLowerCase() !== ADAM_EMAIL.toLowerCase()) {
  redirect('/')
}
```

If `ADAM_EMAIL` is not set at deploy time, `ADAM_EMAIL` is `''`. The `!ADAM_EMAIL` branch triggers, and ALL authenticated users (including Adam) are redirected to `/`. This is a "fail closed" behavior — not a security hole — but it is a silent operational failure. There is no error log, no warning, and the redirect to `/` gives Adam no diagnostic signal that the env var is missing. The war room silently becomes inaccessible to its only intended user.

---

### F3 — TraceTree: no depth limit on recursive `buildTraceNode` (HIGH)

**File:** `queries.ts` lines 125-143

`buildTraceNode` is recursive with no depth ceiling. If `audit_log` contains a cycle (`parent_audit_log_id` pointing back to an ancestor — possible if a bug in the bridge or a compromised agent writes a row with a self-referencing or circular parent), this function recurses until the call stack overflows. A cycle is not hypothetically remote: any INSERT with a manually-set `parent_audit_log_id` pointing to itself passes the DB constraint (the FK references the same table and does not prevent cycles, only prevents dangling references). There is no `visited` set, no depth counter, and no `limit` clause on the children query.

The client-side `TreeNode` in `TraceTree.tsx` has a soft visual default (`expanded` at `depth < 2`) but applies no hard stop — it will render however many levels the server returns.

---

### F4 — TraceTree: `useState` misused as an effect for initial trace load (HIGH)

**File:** `TraceTree.tsx` lines 210-214

```ts
useState(() => {
  if (roots.length > 0) {
    loadTrace(roots[0].id)
  }
})
```

`useState` accepts an initializer function, but that function must be synchronous and must return the initial state value. Calling `loadTrace` (an async function with side effects) inside a `useState` initializer is incorrect React. The initializer runs once, returns `undefined` (which is the state value), and the async `loadTrace` fires as a side effect that React does not track. This will cause:
1. The state update from `loadTrace` fires after React's initial render, potentially before hydration is complete.
2. In React Strict Mode (development), the initializer runs twice — `loadTrace` fires twice, making two API calls and causing a race on `setTraceNode`.
3. ESLint and the React compiler will flag this as a hook misuse.

The correct pattern is `useEffect(() => { loadTrace(roots[0].id) }, [])` or an initial state derived from props. This is a functional correctness bug, not just a style issue.

---

### F5 — `buildTraceNode`: no LIMIT on children query (HIGH)

**File:** `queries.ts` lines 126-133

```ts
const { data: childrenData, error } = await supabase
  .from('audit_log')
  .select(...)
  .eq('parent_audit_log_id', row.id)
  .order('ts', { ascending: true })
  // NO .limit()
```

Every recursive call fetches ALL children of a node with no limit. On a busy day (the wireframe shows 100+ rows), a root with many sub-tickets each with many workers could return hundreds of rows per level, multiplied by recursion depth. This is a potential full-table-scan pattern for deep or wide traces. Combined with F3 (no depth ceiling), a pathological trace could saturate the Supabase connection pool during a server-side render at page load.

---

### F6 — Realtime channel filter does not prevent all-time subscription (MEDIUM)

**File:** `LiveSection.tsx` lines 128-139

```ts
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'claude_progress',
  filter: 'status=eq.running',
})
```

The Supabase Realtime postgres_changes subscription filters by `status=eq.running`, which limits which DB rows trigger a notification. However, it does NOT scope by timestamp. Every row ever inserted with `status=running` (including historical ones that haven't been cleaned up, or rows where status is set to running and never changed) will emit a notification. For a 90-day hot table (`claude_progress` per ORCHESTRATION.md §2E), this is a subscription to the entire table's running rows, not just today's. As row count grows, Supabase Realtime must evaluate each INSERT/UPDATE against this filter for the full table.

More critically: when the filter matches, `fetchRunning()` is triggered. `fetchRunning` calls `/api/war-room/running` which calls `getRunningProgress()` — which itself has a `.limit(50)` and `.eq('status', 'running')` filter. So the fetch is scoped correctly, but the Realtime channel fires on every status-running change across all time. On a high-throughput day this is fine; across 90 days of accumulated rows it becomes a noise source. The channel should include a `ts=gte.<today-start>` filter but Supabase Realtime postgres_changes does not support range filters — the correct mitigation is a separate `claude_progress_live` table (rolling window) or accepting this limitation with a note.

---

### F7 — TodaySection: no Realtime subscription, 30s polling only (LOW-MEDIUM)

**File:** `TodaySection.tsx` lines 136-139

```ts
useEffect(() => {
  const id = setInterval(fetchToday, 30_000)
  return () => clearInterval(id)
}, [fetchToday])
```

The TODAY section polls every 30 seconds. Per ORCHESTRATION.md §2G, the page should use "Realtime subscription for live updates" for `audit_log`. The TODAY section does not subscribe to `audit_log` Realtime at all — it polls. This means new `audit_log` rows appear with up to 30-second latency in the TODAY view. For a page described as "NOW RUNNING / TODAY / TRACE VIEW" observability, this is a spec gap: the spec says Realtime, the code says polling. The footer says "refreshes every 30s" which is accurate but not what the spec calls for.

Additionally, the `loading` state variable is declared at line 119 (`const [loading, setLoading] = useState(false)`) but `setLoading(true)` is never called before `fetchToday` runs — the LoadingSkeleton in the body is therefore never shown. Dead UI state.

---

### F8 — Inline `style` prop for grid layout (brand drift) (LOW)

**File:** `LiveSection.tsx` line 32, `TodaySection.tsx` line 52

```ts
style={{ gridTemplateColumns: '14px 1fr 1fr auto auto' }}
```

Both `RunningRow` (LiveSection) and `AuditRow` (TodaySection) use inline `style` props for `gridTemplateColumns`. The project uses Tailwind CSS exclusively per `CLAUDE.md` conventions and `ENGINEERING_PRINCIPLES.md`. Inline styles bypass Tailwind's purge/JIT, cannot be overridden by responsive or dark-mode Tailwind classes, and diverge from the project convention. These should be Tailwind arbitrary values: `className="grid [grid-template-columns:14px_1fr_1fr_auto_auto]"`.

The `maxHeight: '380px'` inline style in `TraceTree.tsx` line 239 has the same issue.

---

### F9 — No dark mode classes on hardcoded hex colors (MEDIUM)

**File:** `LiveSection.tsx`, `TodaySection.tsx`, `TraceTree.tsx`

All three components use hardcoded hex values for status colors: `bg-[#3370FF]`, `text-[#EF4444]`, `bg-[#10B981]`, `text-[#F59E0B]`. None of these have `dark:` variants. The `layout.tsx` uses `bg-background` and `text-foreground` (CSS variable-based, dark-mode aware), but the status glyphs and dots use raw hex. If the app ships dark mode (the Tailwind config almost certainly includes it given `dark:` is in `CLAUDE.md`'s convention reference), all status indicators will be identically bright in both modes. The brand palette in memory specifies `Dark mode primary: #5A8FFF` for the blue accent — the hardcoded `#3370FF` is not adjusted for dark mode anywhere in these components.

---

### F10 — `qa-lead-pass.yml`: branch slug extraction fails on multi-segment branches (HIGH)

**File:** `.github/workflows/qa-lead-pass.yml` line 39

```bash
TASK_SLUG=$(echo "$HEAD_BRANCH" | sed -E 's|^(feat|fix|chore)/||')
```

The `sed` pattern strips exactly one prefix segment. For a branch named `feat/foo-bar/baz`, the result is `foo-bar/baz` — including the remaining slash. The session file lookup at line 48 then searches for `*-foo-bar/baz.md`, which `find -name` will never match because `/` is a path separator in glob patterns, not a literal character. The check silently finds no session file and fails with "No session file found."

The CONNECTIONS.md §B documents branch patterns as `feat/<task-slug>` — implying single-segment slugs — but does not prohibit nested paths. Agents creating worktrees with multi-segment names (e.g., `feat/ws4-war-room-build`) will produce a double-slash result only if there are exactly two `/`. This is fine for `feat/ws4-war-room-build`, but any branch created by the worktree protocol as `feat/scope/slug` will break silently.

---

### F11 — `qa-lead-pass.yml`: `grep -q "qa_verdict: PASS"` is case-sensitive and whitespace-sensitive (MEDIUM)

**File:** `.github/workflows/qa-lead-pass.yml` line 56

```bash
if grep -q "qa_verdict: PASS" "$SESSION_FILE"; then
```

This is a literal string match. It will fail if:
- The session file uses `qa_verdict: pass` (lowercase) — no normalization
- There is a tab character instead of a space between `:` and `PASS` (YAML allows `key:\tvalue`)
- There is trailing whitespace after `PASS` (e.g., `qa_verdict: PASS `)
- The frontmatter uses a different quoting convention: `qa_verdict: "PASS"`

The session file YAML schema is never formally specified anywhere in the codebase (no schema file found in `docs/08-agents_work/`). The PR template references the frontmatter field but does not mandate the exact string. A QA Lead writing `qa_verdict: "PASS"` or `qa_verdict: pass` will cause a false-negative gate failure. The workflow should use `grep -qiE 'qa_verdict:\s+"?PASS"?\s*$'` at minimum.

---

### F12 — `qa-lead-pass.yml`: `pull-requests: read` permission does not cover `gh api` for issue comments (MEDIUM)

**File:** `.github/workflows/qa-lead-pass.yml` lines 9-11

```yaml
permissions:
  contents: read
  pull-requests: read
```

The bypass check at line 85 calls:
```bash
gh api "repos/$REPO/issues/$PR_NUMBER/comments" --jq "..."
```

GitHub issue comments (the `/issues/{number}/comments` endpoint) require the `issues: read` permission, not `pull-requests: read`. Pull request comments (timeline comments on the PR diff, at `/pulls/{number}/comments`) are different from issue comments (general PR conversation thread, at `/issues/{number}/comments`). The workflow uses the issues endpoint for the bypass comment check. Without `issues: read` in the permissions block, this `gh api` call will return a 403 in a GitHub Actions context with the default `GITHUB_TOKEN`. The bypass path will always fail to find Adam's comment even when it exists, making the bypass mechanism non-functional.

---

### F13 — CONNECTIONS.md §B lists `risk:irreversible` label as routing to `full` tier, but `qa-lead-pass.yml` does not check for it (MEDIUM)

**File:** `CONNECTIONS.md` line 58, `.github/workflows/qa-lead-pass.yml`

CONNECTIONS.md §B states:
> `risk:irreversible` — Forces tier to `full`; QA Lead Full-tier review required

And the auto-merge rules state:
> Auto-merge eligible only after: No `risk:irreversible` label

The `qa-lead-pass.yml` workflow has no check for the `risk:irreversible` label. It only checks for `qa_verdict: PASS` in the session file or the bypass path. A PR labeled `risk:irreversible` with a session file containing `qa_verdict: PASS` at Trivial/Lite tier review would pass the workflow check. The "Full-tier review required" enforcement is purely ceremonial at the workflow level — it relies entirely on the QA Lead agent writing the correct review depth and `qa_verdict: PASS` only after a Full-tier review. There is no structural enforcement of the tier-review level from the workflow. The spec says "structural enforcement" (ORCHESTRATION.md §2A) but the workflow only enforces presence of PASS, not review depth.

---

## Summary Table

| # | Severity | Area | One-line description |
|---|----------|------|----------------------|
| F1 | HIGH | Auth | `as any` cast on Supabase client removes type safety on auth boundary |
| F2 | MEDIUM | Auth | Missing `ADAM_EMAIL` env silently locks Adam out with no diagnostic |
| F3 | HIGH | TraceTree | `buildTraceNode` has no depth limit or cycle detection — stack overflow on cyclic `parent_audit_log_id` |
| F4 | HIGH | TraceTree | `useState` misused as effect initializer for async `loadTrace` — React bug, double-fires in Strict Mode |
| F5 | HIGH | Queries | Children query in `buildTraceNode` has no `.limit()` — full-table scan risk on wide/deep traces |
| F6 | MEDIUM | Realtime | Realtime channel not scoped to today — subscribes to full `claude_progress` table history |
| F7 | LOW-MEDIUM | TodaySection | `audit_log` uses 30s polling, not Realtime subscription (spec gap); `loading` state is dead code |
| F8 | LOW | Brand | Inline `style` props for grid layout — bypasses Tailwind, no responsive/dark override possible |
| F9 | MEDIUM | Brand | Hardcoded hex status colors have no `dark:` variants — dark mode breaks status indicators |
| F10 | HIGH | Workflow | Branch slug extraction breaks on multi-segment branches (`feat/a/b` → slug contains `/`) |
| F11 | MEDIUM | Workflow | `grep -q "qa_verdict: PASS"` fails on quoted values, lowercase, tab-separated frontmatter |
| F12 | MEDIUM | Workflow | Missing `issues: read` permission — bypass comment lookup returns 403, bypass always fails |
| F13 | MEDIUM | CONNECTIONS drift | `risk:irreversible` Full-tier enforcement is spec-only; workflow does not check label or tier |

## Q7 Cost-alert compliance

The page is COMPLIANT with Adam Q7 (ORCHESTRATION.md Errata 4). There are no threshold-config UI elements, "alert me at $X" toggles, or push-notification subscribe buttons anywhere in the war-room components. The footer note explicitly states passive-only observation. The `TodaySection` header shows `total_cost` as a read-only display. No finding raised here.

## Wireframe match (ORCHESTRATION.md §2G)

Overall: PASSES intent. All three sections (NOW RUNNING, TODAY, TRACE VIEW) are present and match the wireframe structure. The `fan_in_key` and `nonce` fields from the schema are fetched in queries but not displayed — this is a reasonable omission for the MVP view. The recursive tree with `├──` / `└──` connectors matches the spec exactly.
