# Beamix — Hard Reset Execution Plan

**Date:** 2026-05-05
**Status:** CANONICAL — supersedes `2026-05-05-CODEBASE-CLEANUP-PLAN.md` in its entirety. The surgical-reset approach is retired. Hard reset is the authorised path.
**Decision source:** Adam, 2026-05-05 red-team session. See `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_red_team_decisions_2026_05_05.md` → "Hard reset codebase decision."
**Infrastructure reference:** `2026-05-05-INFRA-STATE-COMPLETE.md` — all env vars documented, all webhook URLs preserved.
**PRD reference:** PRD v5.2 amendment (`2026-05-05-PRD-AMENDMENTS-v5.2.md`) — schema targets for fresh migration.

---

## §1 — Hard Reset Scope

This is a clean-slate wipe of `apps/web/src/`. The prior codebase (32,225 lines) is a different product concept from what PRD v5.2 describes. The cost of migrating it is greater than the cost of rebuilding with agents. The tag snapshot preserves every byte of history in the git object store; nothing is truly lost.

### What is DELETED

The entire `apps/web/src/` directory, including:

- All App Router routes (pages, layouts, error boundaries, loading states)
- All components (shell, home, inbox, workspace, scans, competitors, settings, onboarding)
- All Inngest functions (`src/inngest/functions/`) and the Inngest client wrapper
- All API routes (`src/app/api/`)
- All hooks, contexts, Zustand stores, and provider wrappers
- All test files (unit, integration, E2E)
- All lib utilities, LLM runners, agent runners, credit guard files
- All email templates (Resend)
- Old database migrations in `apps/web/supabase/migrations/` — schema is wiped and recreated fresh

The `_archive/saas-platform-2026-04-legacy/` folder is **NOT touched** by this reset. It remains as-is unless Adam confirms deletion in a separate decision.

### What is PRESERVED

**Platform config (untouched):**

| Path | Why preserved |
|------|--------------|
| `apps/web/package.json` | Dependency manifest — receives a cleanup pass (remove unused packages) but is NOT deleted |
| `apps/web/next.config.js` | Next.js config — preserves image domains, headers, redirects skeleton |
| `apps/web/tailwind.config.ts` | Tailwind config — preserves content glob, font vars, custom plugins |
| `apps/web/tsconfig.json` | TypeScript config — strict mode, path aliases |
| `apps/web/.env.example` | Env var template — no secrets, just key names matching INFRA-STATE-COMPLETE.md |
| `apps/web/public/` | Static assets — logo files, favicon, OG image |
| `packages/` | Monorepo packages (currently empty; structure preserved) |
| `turbo.json` | Turborepo pipeline config |
| `pnpm-workspace.yaml` | pnpm workspace definition |
| `.gitignore` | Git ignore rules (includes `.worktrees/`) |

**Hosted infrastructure (zero changes):**

| Service | What is preserved | Why |
|---------|------------------|-----|
| Vercel project | Project name, custom domain (`app.beamixai.com`), team connection | Domain binding stays live during maintenance page phase |
| Vercel env vars | All 26 variables documented in INFRA-STATE-COMPLETE.md, Sensitive flags intact | Rotated 2026-05-05; no re-rotation needed |
| Cloudflare DNS | All A records, CNAMEs, DKIM, SPF, MX, DMARC for beamixai.com | Maintenance page routes through Cloudflare Worker; no DNS changes needed |
| Resend domain | `notify.beamixai.com` verified DKIM/SPF/DMARC | No DNS changes; verification survives |
| Inngest app | App registration + custom domain `app.beamixai.com` | Will re-register functions on next deploy; old function definitions manually cleared from Inngest dashboard |
| Paddle products | All 4 products (Discover/Build/Scale/Scale-addon) with correct prices | No changes; price IDs in Vercel env already |
| Paddle webhook | `https://app.beamixai.com/api/webhooks/paddle`, 56 events subscribed | Webhook re-activates when new route is deployed |
| Google OAuth | Client ID + Secret in Vercel env; Supabase Auth provider configured | Auth provider config survives codebase reset |
| Supabase project | Project reference, URL, keys in Vercel env | **Schema is wiped** but the project reference and auth config survive |
| GitHub repo | Full commit history; all prior PRs | Tag preserves pre-reset state permanently |

---

## §2 — Pre-Reset Checklist

Every item must be confirmed before executing §4. No exceptions.

**P1 — Git snapshot**
- [ ] `git tag mvp-cleanup-snapshot-2026-05-05` created on current `main` HEAD
- [ ] Tag pushed to origin: `git push origin mvp-cleanup-snapshot-2026-05-05`
- [ ] Tag is visible in GitHub Releases (confirm at github.com/Adam077K/Beamix/tags)

**P2 — Infrastructure documentation**
- [x] All Vercel env var names documented in `2026-05-05-INFRA-STATE-COMPLETE.md` ✅
- [x] All webhook URLs documented in `2026-05-05-INFRA-STATE-COMPLETE.md` ✅
- [x] All OAuth callback URLs documented in `2026-05-05-INFRA-STATE-COMPLETE.md` ✅
- [ ] Local backup of env vars downloaded from Vercel dashboard (Settings → Environment Variables → Export) and saved to a secure local file outside the repo

**P3 — Customer state confirmation**
- [ ] Adam confirms: zero live paying customers at the time of reset
- [ ] Adam confirms: zero active free-tier signups that expect continuity
- [ ] Adam confirms: database can be wiped (no production user data to preserve)
- [ ] Adam confirms: any test accounts in Supabase are acceptable to delete

**P4 — Maintenance page**
- [ ] Maintenance page copy approved by Adam (see §3 for exact copy)
- [ ] Cloudflare Worker deployed and live at `app.beamixai.com` (see §3 for implementation)
- [ ] Maintenance page renders correctly on mobile Safari + Chrome Android
- [ ] Email signup form submits successfully to Resend waitlist list

**P5 — Build readiness**
- [ ] PRD v5.2 amendments confirmed (this reset plan + `2026-05-05-PRD-AMENDMENTS-v5.2.md`)
- [ ] QA gate process confirmed (`2026-05-05-QA-GATE-PROCESS-v1.md` exists or is authored pre-dispatch)
- [ ] Adam approves starting Tier 0 build dispatch immediately after wipe

---

## §3 — Maintenance Page Strategy

### Platform choice: Cloudflare Worker

**Recommendation: Cloudflare Worker.** Not a temporary Vercel deployment.

**Rationale:**

A Cloudflare Worker intercepts requests at the edge before they reach Vercel. This means the maintenance page is live the moment the Worker is deployed — no Vercel build cycle, no cold start, no risk of the empty Next.js scaffold erroring during the wipe-and-scaffold sequence. The Worker also handles all subpath requests (`app.beamixai.com/anything`) gracefully, returning the same maintenance HTML. When the new build is ready to go live, disabling the Worker route instantly unmasks the Vercel deployment — no DNS propagation delay.

A temporary Vercel deployment would require a valid `apps/web/src/` directory during the gap between wipe and scaffold. That creates a timing risk: if the Vercel build is triggered before the scaffold is complete, Vercel deploys a broken state to the custom domain. The Cloudflare Worker eliminates this risk entirely.

**Cloudflare setup:**
1. Log into Cloudflare dashboard → Workers & Pages → Create Worker
2. Paste the HTML below as the Worker script
3. Add a route: `app.beamixai.com/*` → this Worker
4. Route priority: set above any existing Page Rules
5. Worker takes effect within 30 seconds globally

**Worker script:**

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Pass through Resend email submission
  const url = new URL(request.url)
  if (url.pathname === '/api/waitlist' && request.method === 'POST') {
    return await handleWaitlist(request)
  }

  return new Response(MAINTENANCE_HTML, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    status: 200,
  })
}

async function handleWaitlist(request) {
  try {
    const body = await request.json()
    const email = body.email || ''
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // POST to Resend contacts API — uses RESEND_API_KEY env var in Worker
    const res = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        audience_id: RESEND_WAITLIST_AUDIENCE_ID,
        unsubscribed: false,
      }),
    })

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify({ error: 'Submission failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beamix — We're rebuilding.</title>
  <meta name="description" content="Beamix is in active development. Back soon." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --color-paper: #F9F6F1;
      --color-ink-1: #0A0A0A;
      --color-ink-2: #3A3A3A;
      --color-ink-3: #6B7280;
      --color-brand: #3370FF;
      --color-border: #E5E7EB;
    }

    html { background: var(--color-paper); }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--color-paper);
      color: var(--color-ink-1);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }

    .container {
      max-width: 480px;
      width: 100%;
      text-align: center;
    }

    .seal {
      width: 48px;
      height: 48px;
      background: var(--color-brand);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    }

    .seal svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .wordmark {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-ink-3);
      margin-bottom: 48px;
    }

    h1 {
      font-family: 'Fraunces', serif;
      font-weight: 300;
      font-style: italic;
      font-size: clamp(32px, 6vw, 48px);
      line-height: 1.15;
      color: var(--color-ink-1);
      margin-bottom: 20px;
    }

    p {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 400;
      line-height: 1.6;
      color: var(--color-ink-2);
      margin-bottom: 40px;
    }

    .form {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    input[type="email"] {
      flex: 1 1 240px;
      padding: 12px 16px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: #fff;
      color: var(--color-ink-1);
      outline: none;
      transition: border-color 120ms ease;
    }

    input[type="email"]:focus {
      border-color: var(--color-brand);
    }

    input[type="email"]::placeholder {
      color: var(--color-ink-3);
    }

    button[type="submit"] {
      padding: 12px 24px;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 500;
      background: var(--color-ink-1);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 120ms ease;
      white-space: nowrap;
    }

    button[type="submit"]:hover { opacity: 0.85; }
    button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }

    .success {
      display: none;
      font-size: 15px;
      color: var(--color-brand);
      margin-top: 16px;
    }

    .footer {
      margin-top: 80px;
      font-size: 13px;
      color: var(--color-ink-3);
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .footer a {
      color: var(--color-ink-3);
      text-decoration: none;
    }

    .footer a:hover {
      color: var(--color-ink-2);
    }

    .binding {
      margin-top: 48px;
      font-size: 12px;
      color: var(--color-ink-3);
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="seal">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z"/>
      </svg>
    </div>

    <div class="wordmark">Beamix</div>

    <h1>We&rsquo;re rebuilding.</h1>

    <p>Beamix is in active development. Drop your email and we&rsquo;ll let you know when we&rsquo;re back.</p>

    <form class="form" id="waitlist-form">
      <input
        type="email"
        id="email-input"
        placeholder="you@company.com"
        required
        autocomplete="email"
      />
      <button type="submit" id="submit-btn">Notify me</button>
    </form>

    <div class="success" id="success-msg">
      You&rsquo;re on the list. We&rsquo;ll be in touch.
    </div>

    <p class="binding">AI visibility for businesses that mean it. &mdash; Beamix</p>

    <div class="footer">
      <a href="https://beamixai.com/security">Security</a>
      <a href="https://beamixai.com/trust">Trust</a>
      <a href="https://beamixai.com">beamixai.com</a>
    </div>
  </div>

  <script>
    const form = document.getElementById('waitlist-form')
    const btn = document.getElementById('submit-btn')
    const input = document.getElementById('email-input')
    const success = document.getElementById('success-msg')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      btn.disabled = true
      btn.textContent = 'Saving...'

      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input.value.trim() }),
        })

        if (res.ok) {
          form.style.display = 'none'
          success.style.display = 'block'
        } else {
          btn.disabled = false
          btn.textContent = 'Try again'
        }
      } catch {
        btn.disabled = false
        btn.textContent = 'Try again'
      }
    })
  </script>
</body>
</html>`
```

**Worker environment variables (set in Cloudflare dashboard → Worker → Settings → Variables):**
- `RESEND_API_KEY` — same value as Vercel env var (copy from Vercel dashboard)
- `RESEND_WAITLIST_AUDIENCE_ID` — create a new Resend Audience called "Beamix Relaunch Waitlist" and paste its ID here

---

## §4 — Hard Reset Execution Sequence

Each step includes a rollback path. Do not proceed to the next step until the current step is confirmed complete.

---

### Step 1 — Confirm main is clean

```bash
git checkout main
git pull origin main
git status  # must show: nothing to commit, working tree clean
```

**Rollback:** N/A (read-only verification).

---

### Step 2 — Create and push snapshot tag

```bash
git tag mvp-cleanup-snapshot-2026-05-05
git push origin mvp-cleanup-snapshot-2026-05-05
```

**Verify:** Visit `https://github.com/Adam077K/Beamix/tags` and confirm the tag is listed.

**Rollback:** If the tag push fails, investigate remote connectivity. Do NOT proceed without a confirmed remote tag.

---

### Step 3 — Deploy Cloudflare maintenance Worker

1. Log into Cloudflare dashboard
2. Navigate: Workers & Pages → Create Worker
3. Paste the Worker script from §3
4. Set environment variables: `RESEND_API_KEY` + `RESEND_WAITLIST_AUDIENCE_ID`
5. Deploy Worker
6. Navigate: Websites → beamixai.com → Workers Routes
7. Add route: `app.beamixai.com/*` → select the deployed Worker
8. Save route

**Verify:** Open `https://app.beamixai.com` in an incognito tab. Maintenance page must render with Fraunces headline and email form. Test email submission with a real email; confirm the contact appears in the Resend Audience.

**Rollback:** Delete the Worker route from Cloudflare. Vercel deployment resumes serving within 30 seconds.

---

### Step 4 — Verify maintenance page is globally live

Wait 60 seconds after Step 3. Open `app.beamixai.com` on:
- Desktop Chrome
- Mobile Safari (iOS) — check Fraunces italic renders correctly
- Chrome Android

All three must render the maintenance page. If any shows the old Vercel deployment, the Worker route did not take effect — revisit Step 3.

**Rollback:** Same as Step 3.

---

### Step 5 — Create feature branch for clean slate

```bash
git checkout -b feat/mvp-clean-slate-2026-05-05
```

**Rollback:** `git checkout main && git branch -D feat/mvp-clean-slate-2026-05-05`

---

### Step 6 — Delete apps/web/src/

```bash
rm -rf apps/web/src/
```

**Verify:** `ls apps/web/` should show `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `public/` — and `src/` should be absent.

**Rollback:** `git checkout mvp-cleanup-snapshot-2026-05-05 -- apps/web/src/` (restores the full src/ tree from the snapshot tag).

---

### Step 7 — Scaffold clean Next.js 16 App Router src/

The build team scaffolds a minimal `apps/web/src/` with:
- `src/app/layout.tsx` — root layout with metadata, font vars (Inter + Fraunces + Geist Mono declared but no Heebo yet — T93 adds that)
- `src/app/page.tsx` — redirects to `/start` (placeholder; real /start built in T100)
- `src/app/not-found.tsx` — 404 stub
- `src/app/error.tsx` — error boundary stub
- `src/app/global-error.tsx` — global error boundary stub
- `src/app/api/health/route.ts` — health check returning `{ status: "ok", version: "5.2" }`
- `src/app/api/inngest/route.ts` — Inngest serve endpoint (registers zero functions initially)
- `src/styles/` — directory created, empty files for `motion.css`, `tokens.css`, `typography.css` (populated by T58–T65, T93–T99)
- `src/types/` — empty directory (canonical type files created by Tier 0 tickets)

**Verify:** `ls apps/web/src/` shows the scaffolded structure.

**Rollback:** `git checkout mvp-cleanup-snapshot-2026-05-05 -- apps/web/src/` and restart.

---

### Step 8 — Dependency cleanup pass

Run a dependency audit on `apps/web/package.json`. Remove packages that no longer apply (e.g., any Clerk-related packages from the old codebase, any `saas-platform` era dependencies that aren't in PRD v5.2 stack). Do not remove packages that will be used — check against PRD v5.2 stack before removing.

```bash
pnpm install
pnpm typecheck   # must pass with zero errors on empty scaffold
pnpm lint        # must pass with zero lint errors on empty scaffold
```

**Verify:** Both commands exit with code 0. Baseline confirmed.

**Rollback:** Restore `package.json` from snapshot: `git checkout mvp-cleanup-snapshot-2026-05-05 -- apps/web/package.json`

---

### Step 9 — Reset Supabase schema

**Pre-wipe backup:**
```bash
# From Supabase CLI (run from apps/web/)
supabase db dump --data-only -f supabase_data_backup_2026_05_05.sql
# Store this file outside the repo (local disk only — contains any test user data)
```

**Wipe all tables in public schema:**
```sql
-- Run in Supabase SQL Editor
-- WARNING: This drops all tables. Run ONLY after backup is confirmed.
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

**Apply fresh migrations:**
- Tier 0 migration ticket (from Build Plan v3.2 / PRD v5.2 schema) creates all tables fresh
- Run migrations via `supabase db push` after Tier 0 database tickets complete

**Verify:** Supabase Table Editor shows zero tables in `public` schema after wipe. (Migrations will repopulate after Tier 0 build.)

**Rollback:** If wipe runs but migration fails, restore from `supabase_data_backup_2026_05_05.sql` via `supabase db restore`.

---

### Step 10 — Clear stale Inngest function registrations

Log into `app.inngest.com` → Functions → identify any functions from the old codebase that are now stale (scan-free, scan-manual, agent-execute, etc. from the old `src/inngest/functions/`). Mark them as archived or delete them from the Inngest dashboard.

The new Inngest endpoint (`/api/inngest`) will re-register functions as they are built in Tier 1+. Until then, the endpoint returns an empty function list.

**Verify:** After deploying the scaffolded build to Vercel, ping the Inngest endpoint: `curl https://app.beamixai.com/api/inngest`. Should return a valid Inngest response with zero registered functions.

**Rollback:** N/A (Inngest function deletion is non-destructive to the codebase; old functions are already dead since `src/` was wiped).

---

### Step 11 — Push branch and verify Vercel preview build

```bash
git add apps/web/src/ apps/web/package.json apps/web/next.config.js
git commit -m "feat(web): hard reset — clean slate scaffold for PRD v5.2 rebuild"
git push origin feat/mvp-clean-slate-2026-05-05
```

**Verify:** Vercel preview deployment builds successfully (green in Vercel dashboard). Preview URL renders the placeholder redirect. Note: the Cloudflare Worker is still intercepting `app.beamixai.com`; the preview URL (e.g., `beamix-git-feat-mvp-clean-slate.vercel.app`) is what you test here.

**Rollback:** Revert commit, restore from tag.

---

### Step 12 — Begin Tier 0 build dispatch

With clean scaffold confirmed, dispatch Tier 0 tickets:

**Independent (no inter-dependencies — can run in parallel):**
- T58 — 10 named easing curves in `motion.css`
- T59 — 3 ESLint custom rules
- T60 — Variable Inter + subset Fraunces font loading
- T61 — Status vocabulary lock
- T62 — Block primitive TypeScript interfaces
- T63 — Speed CI gate
- T64 — security.txt at `/.well-known/`
- T65 — Dark mode tokens

**After T58 + T60 complete:**
- T93 — Heebo 300 italic conditional load
- T94 — Phase-transition motion canon

**After T0.1 schema ticket (first Tier 0 DB migration):**
- T95 — Google OAuth primary signup
- T96 — Two-tier UI state tokens
- T97 — handle_new_user smoke test

See Build Plan v3.2 for full Tier 0 dispatch order.

---

### Step 13 — Deploy Tier 0 build to production, remove maintenance Worker

Once all Tier 0 tickets are merged and the production build passes:

1. Merge `feat/mvp-clean-slate-2026-05-05` to `main` via PR (requires QA gate PASS per Build Plan v3.2 R4 requirement)
2. Vercel auto-deploys to `app.beamixai.com`
3. Log into Cloudflare → Workers Routes → Delete the `app.beamixai.com/*` Worker route
4. Within 30 seconds, `app.beamixai.com` resolves to the new Vercel deployment

**Verify production smoke tests:**
- `https://app.beamixai.com` renders (even if just a redirect placeholder)
- `https://app.beamixai.com/api/health` returns `{ "status": "ok", "version": "5.2" }`
- `https://app.beamixai.com/api/inngest` returns valid Inngest JSON (functions list, even if empty)
- No JavaScript console errors on initial page load

**Rollback:** Re-enable the Cloudflare Worker route. Investigate Vercel build logs.

---

### Step 14 — Tier 1 build dispatch begins

After production smoke tests pass, the maintenance page period ends. Tier 1 dispatch begins per Build Plan v3.2 (T100 `/start` state machine as first Tier 1 ticket).

---

## §5 — Risk Register

---

### R1 — Maintenance page Cloudflare/Vercel timing conflict

**Risk:** Cloudflare Worker and Vercel edge caching conflict during the transition window (Step 3–4), causing some users to see a broken state instead of the maintenance page.

**Severity:** Medium

**Mitigation:** The Worker returns `Cache-Control: no-cache, no-store, must-revalidate` on all responses. Cloudflare's edge cache is bypassed for Worker responses by default. Vercel deployments during the Worker-active period go to preview URLs only — production domain is intercepted by the Worker.

**Rollback path:** Delete the Worker route from Cloudflare (30 seconds to propagate). Vercel production deployment resumes immediately.

---

### R2 — Supabase Auth state corrupts (test users wiped)

**Risk:** Any test user accounts in Supabase Auth lose their `user_profiles`, `subscriptions`, and `notification_preferences` rows when the schema is wiped in Step 9. The Auth table itself (in the `auth` schema) is NOT wiped — but references from `public` tables to `auth.users` are removed.

**Severity:** Low (Adam confirmed 0-customer state — no real users to break)

**Mitigation:** Adam confirms zero live customers before executing Step 9. The schema wipe targets the `public` schema only — `auth.*` tables survive. Fresh migrations re-create all public tables with correct FK references to `auth.users`. Test accounts can be recreated trivially.

**Rollback path:** Restore from `supabase_data_backup_2026_05_05.sql`. Re-run handle_new_user trigger for any test users that need `user_profiles` rows.

---

### R3 — Stale Inngest functions fire on old queued events

**Risk:** Any queued Inngest events from the old codebase (e.g., `scan/start.requested`, `agent/execute.requested`) attempt to invoke functions that no longer exist at the registered endpoint. Inngest will retry these and generate noise.

**Severity:** Low

**Mitigation:** Step 10 (clear stale Inngest registrations) handles this before Tier 0 build begins. Additionally, since Adam confirmed 0 live customers, there should be no queued production events. Archive/delete old function registrations in Inngest dashboard immediately after Step 10.

**Rollback path:** N/A (stale event failures are logged in Inngest dashboard, not customer-visible). If needed, cancel all pending runs from the Inngest dashboard for the old function IDs.

---

### R4 — Vercel env vars get cleared during reset

**Risk:** If someone manually touches the Vercel project settings during the reset (e.g., clicking "Reset environment variables" by mistake), the 26 env vars documented in INFRA-STATE-COMPLETE.md would need to be re-entered manually.

**Severity:** High (would break all integrations — Paddle, Supabase, Resend, Inngest, LLM APIs)

**Mitigation:**
1. Pre-reset backup: download all env vars from Vercel dashboard (Settings → Environment Variables → Export JSON) before any deletion begins (P2 checklist item)
2. Do NOT grant any agent or automated process Vercel project write access during the reset
3. The codebase reset (deleting `apps/web/src/`) does not touch Vercel project settings — env vars survive as long as nobody touches them

**Rollback path:** Re-enter all env vars from the local backup file. Takes approximately 20 minutes. All secrets are in INFRA-STATE-COMPLETE.md by reference (not values — values are in Adam's secure local backup).

---

### R5 — DNS propagation issues during maintenance page deploy

**Risk:** Cloudflare Worker route takes longer than expected to propagate, leaving `app.beamixai.com` serving the old Vercel deployment during the gap between Worker deploy and propagation.

**Severity:** Low (during 0-customer state, no users are actively harmed)

**Mitigation:** Cloudflare Workers propagate globally within 30 seconds in practice (no DNS TTL involved — it's an edge compute layer on top of existing DNS). The 60-second verification wait in Step 4 accounts for this. Test on multiple devices and networks before declaring the maintenance page live.

**Rollback path:** Delete the Worker route. Old Vercel deployment resumes within 30 seconds.

---

### R6 — git tag not pushed before deletion (snapshot lost at remote)

**Risk:** The snapshot tag is created locally but not pushed to origin before `rm -rf apps/web/src/` runs. If the local machine has issues, the snapshot exists only locally.

**Severity:** Medium (git history is never lost as long as commits exist, but the named tag makes recovery trivial vs. hunting commit hashes)

**Mitigation:** Step 2 explicitly pushes the tag to origin AND verifies it is visible in GitHub. Do not proceed to Step 6 without this confirmation.

**Rollback path:** If Step 6 runs without a confirmed remote tag, the local git object store still contains all objects. Run `git fsck --full` to confirm object integrity, then push the tag: `git push origin mvp-cleanup-snapshot-2026-05-05`.

---

## §6 — Adam's Confirmation Checklist

Before dispatching any agent to execute §4, Adam confirms each item:

- [ ] **0-customer state confirmed** — no live paying customers, no active free signups expecting continuity
- [ ] **Maintenance page copy approved** — the headline "We're rebuilding." and the sub-line "Beamix is in active development. Drop your email and we'll let you know when we're back." are final
- [ ] **Snapshot tag agreed** — `mvp-cleanup-snapshot-2026-05-05` is the correct tag name
- [ ] **Database schema can be wiped** — no production user data to preserve; all test accounts are disposable
- [ ] **Supabase backup acceptable** — the `pg_dump` file will be saved locally (outside repo); Adam is responsible for keeping this file secure
- [ ] **Tier 0 build dispatch approved immediately after wipe** — build team can start T58–T65 + T93–T99 the same day as the reset
- [ ] **Cloudflare Worker approach approved** — over temporary Vercel deployment
- [ ] **Resend Audience created** — "Beamix Relaunch Waitlist" audience exists in Resend with its Audience ID ready for the Worker env var

---

*Cross-references:*
- `2026-05-05-PRD-AMENDMENTS-v5.2.md` — PRD v5.2 + Build Plan v3.2 amendments (R1, R3, new tickets T148–T151)
- `2026-05-05-INFRA-STATE-COMPLETE.md` — all env vars, webhook URLs, OAuth callback URLs
- `2026-05-05-CODEBASE-CLEANUP-PLAN.md` — RETIRED; superseded by this document
