# Auth & Onboarding Feature Spec

> **Author:** Atlas (CTO)
> **Date:** March 2026
> **Status:** Launch Critical
> **Source of truth:** `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.4–2.7, `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.1, §3, `04-features/onboarding-spec.md`

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Middleware and Route Protection](#2-middleware-and-route-protection)
3. [Onboarding System](#3-onboarding-system)
4. [Free Scan Import Flow](#4-free-scan-import-flow)
5. [Onboarding Completion API](#5-onboarding-completion-api)
6. [New Business Onboarding Workflow](#6-new-business-onboarding-workflow)
7. [Data Model — Auth Tables](#7-data-model--auth-tables)
8. [Language and Locale](#8-language-and-locale)

---

## 1. Authentication System

### 1.1 Auth Architecture

Beamix uses **Supabase Auth** for all authentication. No Clerk. No custom JWT system. Supabase Auth manages the `auth.users` table and issues JWT session tokens stored in browser cookies.

**What Supabase Auth provides:**
- Email/password authentication
- Magic link (passwordless email)
- Google OAuth (social login)
- Automatic JWT refresh
- Session cookies via `@supabase/ssr`

**How sessions are managed:**

Sessions are stored as HTTP-only cookies by the Supabase SSR client. The middleware reads and refreshes the session on every request. The key invariant: **always call `supabase.auth.getUser()` (not `getSession()`) for security-sensitive code**, because `getSession()` reads from the cookie without verifying the JWT signature with the Supabase server.

**Client initialization:**
- Browser components: `createBrowserClient` from `@/lib/supabase/browser`
- Server components and API routes: `createClient` from `@/lib/supabase/server`
- Inngest functions and webhook handlers: `createServiceClient` from `@/lib/supabase/server` — this uses the service role key and bypasses RLS

---

### 1.2 Login Page (`/login`)

**URL:** `/login`
**Auth requirement:** None — public page. Redirect to `/dashboard` if already authenticated.

**What the user sees:**
- Email + password form
- "Log in" button (primary)
- "Sign in with Google" button (OAuth)
- Magic link option — "Email me a sign-in link" (secondary, collapses form and shows email-only input)
- "Forgot password?" link — navigates to `/forgot-password`
- "Don't have an account? Sign up" link — navigates to `/signup`

**Form fields:**

| Field | Type | Validation |
|-------|------|-----------|
| email | email input | Required, valid email format |
| password | password input | Required (8+ chars when signing up, any length when logging in) |

**What happens on submit:**
1. Client calls `supabase.auth.signInWithPassword({ email, password })`
2. On success: Supabase sets session cookies
3. Client reads `?redirect=` query param from the URL
4. If `redirect` param exists and points to a path under `/dashboard` or `/onboarding`: redirect to that path
5. If no redirect param: redirect to `/dashboard`
6. On error: show inline error message below the form — "Invalid email or password"

**Google OAuth flow:**
1. User clicks "Sign in with Google"
2. Client calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '[origin]/auth/callback' } })`
3. User is redirected to Google
4. Google redirects back to `/auth/callback` with auth code
5. Callback route exchanges code for session (see §1.5)
6. Callback route redirects to `/dashboard` (or `/onboarding` if new user)

**Magic link flow:**
1. User enters email and clicks "Email me a sign-in link"
2. Client calls `supabase.auth.signInWithOtp({ email })`
3. User sees confirmation: "Check your inbox — we sent a sign-in link to [email]"
4. User clicks link in email → routed to `/auth/callback`
5. Callback route establishes session and redirects to dashboard

**Post-login redirect logic (important):**
```
if (redirect_param && redirect_param.startsWith('/dashboard')):
  router.push(redirect_param)
else if (user has no onboarding_completed_at):
  router.push('/onboarding')
else:
  router.push('/dashboard')
```

The onboarding check is a client-side check after login. The middleware enforces the same logic server-side (see §2).

---

### 1.3 Signup Page (`/signup`)

**URL:** `/signup`
**Auth requirement:** None — public page. Redirect to `/dashboard` if already authenticated.

**What the user sees:**
- Email + password form
- "Create account" button (primary)
- "Sign up with Google" button (OAuth)
- Terms of service and privacy policy checkbox (required)
- If arriving from the free scan results page: a callout card — "Your scan results will be waiting in your dashboard"
- "Already have an account? Log in" link

**Form fields:**

| Field | Type | Validation |
|-------|------|-----------|
| email | email input | Required, valid email, not already registered |
| password | password input | Required, minimum 8 characters |
| terms | checkbox | Required — must be checked to submit |

**The `?scan_id=` query param:**

When a user completes a free scan and clicks "Sign up" from the results page, the scan_id is passed as a query param:

```
/signup?scan_id=abc123xyz
```

The signup page reads this param and:
1. Stores it in component state (not localStorage — it's in the URL)
2. Displays the callout: "Your scan results will be waiting in your dashboard"
3. After account creation, passes the `scan_id` to the onboarding page via the redirect URL:
   ```
   /onboarding?scan_id=abc123xyz
   ```

**What happens on account creation:**

1. Client calls `supabase.auth.signUp({ email, password })`
2. Supabase creates the `auth.users` record
3. **The `handle_new_user` database trigger fires automatically** (see §1.3.1 below)
4. Supabase sends an email confirmation (if email confirmation is enabled in project settings)
5. If email confirmation is disabled (development / immediate access): session is created immediately
6. Client redirects to `/onboarding` (with `?scan_id=` param if applicable)

#### 1.3.1 The `handle_new_user` Database Trigger (Critical)

This trigger is defined in `supabase/migrations/20260302_signup_trigger.sql`. It runs automatically on every `auth.users` INSERT and creates three rows in the public schema:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create user_profiles row
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- 2. Create subscriptions row (free tier, no plan)
  INSERT INTO public.subscriptions (user_id, status, plan_tier)
  VALUES (NEW.id, 'trialing', null);

  -- 3. Create notification_preferences row with defaults
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Why this trigger is critical — the onboarding loop bug:**

Before this trigger was implemented, the auth system had a production bug that caused an infinite redirect loop. Understanding and preserving this fix is essential.

**Root cause of the infinite onboarding loop (documented 2026-03-02):**

1. User signs up → `auth.users` row created
2. Trigger did NOT exist → `user_profiles` row was NOT created
3. Onboarding was completed → `POST /api/onboarding/complete` ran
4. The API route used `UPDATE user_profiles SET onboarding_completed_at = NOW() WHERE user_id = $user_id`
5. Because no row existed, the UPDATE matched 0 rows — **but Supabase/PostgreSQL returns no error for UPDATE with 0 rows matched**
6. API returned `{ success: true }` — silently incorrect
7. Client redirected to `/dashboard`
8. Dashboard layout server component checked `user_profiles.onboarding_completed_at`
9. No row existed → `onboarding_completed_at` was null
10. Dashboard layout redirected to `/onboarding`
11. User was stuck in an infinite loop

**Two-part fix:**
- **Fix 1:** The `handle_new_user` trigger (above) — ensures the row always exists at signup
- **Fix 2:** The `POST /api/onboarding/complete` route now uses UPSERT instead of UPDATE — see §5

**For local development:** The trigger must exist in the Supabase project. If running against a local Supabase instance that doesn't have the migration applied, the loop will reoccur. Always run migrations before testing auth flows:
```bash
supabase db push
# or apply supabase/migrations/20260302_signup_trigger.sql manually in the SQL editor
```

**Backfill for existing users:** Any user who signed up before this migration was applied will have no `user_profiles` row. The UPSERT in the onboarding complete route handles this case at the time of onboarding. For pre-existing users who already completed onboarding before the fix, a backfill query must be run:

```sql
-- Backfill user_profiles for users who completed onboarding but have no profile row
INSERT INTO public.user_profiles (user_id, onboarding_completed_at)
SELECT id, NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;
```

---

### 1.4 Forgot Password Page (`/forgot-password`)

**URL:** `/forgot-password`
**Auth requirement:** None — public page.

**What the user sees:**
- Single email input
- "Send reset link" button
- After submission: "Check your inbox — we sent a reset link to [email]" confirmation message
- "Back to log in" link

**Flow:**
1. User enters email and submits
2. Client calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '[origin]/auth/callback?type=recovery' })`
3. Supabase sends an email with a password reset link
4. User clicks the link → routed to `/auth/callback?type=recovery`
5. Callback route detects `type=recovery` and redirects to a password reset form
6. User enters new password → client calls `supabase.auth.updateUser({ password: newPassword })`

**Edge cases:**
- If email does not exist in the system: show the same success message (do not leak user enumeration)
- If user is authenticated and visits this page: still show the form (they may want to change their password)

---

### 1.5 Auth Callback Route (`/auth/callback`)

**URL:** `/auth/callback`
**File:** `src/app/auth/callback/route.ts`
**Auth requirement:** None — this is the landing point after OAuth/magic link/password reset.

This route handles three scenarios:

**Scenario A — OAuth (Google sign-in):**
1. Google redirects to `/auth/callback?code=[auth_code]`
2. Route calls `supabase.auth.exchangeCodeForSession(code)`
3. Session cookies are set
4. Route checks if user has a `user_profiles` row with `onboarding_completed_at` set
5. If new user (no onboarding): redirect to `/onboarding`
6. If returning user: redirect to `/dashboard`

**Scenario B — Magic link:**
1. Email link redirects to `/auth/callback#access_token=[token]`
2. The token is in the URL hash (client-side only)
3. Route does NOT process this server-side — the client-side `supabase.auth.onAuthStateChange` listener in the root layout picks up the token from the hash and establishes the session
4. After session is established, the same redirect logic applies

**Scenario C — Password reset:**
1. Reset email redirects to `/auth/callback?type=recovery&token_hash=[hash]`
2. Route calls `supabase.auth.verifyOtp({ token_hash, type: 'recovery' })`
3. Session is established with a special scope that allows password update only
4. Route redirects to `/forgot-password?step=reset` (or a dedicated reset page)
5. User sets new password via form

---

## 2. Middleware and Route Protection

**File:** `src/middleware.ts`
**Framework:** Next.js Edge Middleware — runs before every request on the server

### 2.1 What the Middleware Does

The middleware performs two jobs:

1. **Session refresh:** Creates a Supabase server client and calls `supabase.auth.getUser()`. This refreshes the JWT token if it is close to expiry and writes updated session cookies to the response. **This call must happen on every request** — if it is skipped, the session will expire silently and users will be logged out unexpectedly.

2. **Route protection:** For protected routes, checks if a valid user was returned by `getUser()`. If no user: redirect to `/login?redirect=[current_path]`.

### 2.2 Protected vs. Public Routes

The middleware uses a path-prefix check — any path that starts with a protected prefix is gated.

**Protected routes (require auth):**

| Prefix | Examples |
|--------|---------|
| `/dashboard` | All dashboard pages |
| `/onboarding` | Onboarding flow |

**Public routes (no auth check):**
Everything not in the protected list. This includes:

| Route | Notes |
|-------|-------|
| `/` | Landing page |
| `/scan` | Free scan form |
| `/scan/[scan_id]` | Public scan results — shareable |
| `/login` | Auth page |
| `/signup` | Auth page |
| `/forgot-password` | Auth page |
| `/auth/callback` | OAuth/magic link handler |
| `/pricing` | Pricing page |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/about` | About page |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |
| `/docs/api` | API documentation |

**API routes:** Handle their own auth internally. The middleware does not protect `/api/*` routes — each API route calls `createClient()` and checks `supabase.auth.getUser()` independently.

### 2.3 Redirect Behavior

When an unauthenticated user hits a protected route:

```typescript
const loginUrl = request.nextUrl.clone()
loginUrl.pathname = '/login'
loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
return NextResponse.redirect(loginUrl)
```

Example: visiting `/dashboard/rankings` unauthenticated → redirected to `/login?redirect=/dashboard/rankings`.

After successful login, the login page reads the `redirect` param and routes the user back to their intended destination.

### 2.4 Onboarding Completion Check

The middleware does NOT check onboarding status — that check is in the dashboard layout server component (`src/app/dashboard/layout.tsx`).

The dashboard layout:
1. Calls `createClient()` and `supabase.auth.getUser()`
2. Queries `user_profiles` for this user's `onboarding_completed_at`
3. If null: redirects to `/onboarding`
4. If set: renders the dashboard

**Why this check is in the layout and not the middleware:**
- The middleware runs at the edge and cannot make Supabase database queries without increasing latency on every request
- The dashboard layout runs once per page navigation, which is acceptable for this check
- Future optimization: cache the `onboarding_completed_at` check in a session cookie

### 2.5 Middleware Config

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
```

This matcher runs the middleware on all requests except Next.js static assets and image optimization routes. This is required so the session refresh runs on every page navigation.

**Known warning:** Next.js 16 shows a deprecation warning recommending "proxy" mode for middleware. This warning is cosmetic at present — the current middleware pattern works correctly. Do not change to proxy mode without testing auth flows end-to-end.

---

## 3. Onboarding System

### 3.1 Overview

The onboarding flow is a full-screen, animated multi-step form that runs immediately after signup for all new users. It collects the minimum data required to start a scan and set up the user's workspace.

**Key design decisions (from product spec):**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Number of steps | 4 visible (Step 0 optional) | Step 0 shown only when no URL in localStorage; dots always show 3 |
| Competitor collection | Not in onboarding | Scan finds competitors automatically; add manually later in Settings |
| Phone number, company size | Not collected | Not used in scan logic; adds friction |
| Scan trigger | Fires on onboarding complete | Not during onboarding; user finishes setup first, then scan starts |

**URL:** `/onboarding`
**Auth requirement:** Required. Middleware redirects unauthenticated users to `/login`.
**One-time only:** If user already has a business and `onboarding_completed_at` is set, the dashboard layout redirects them to `/dashboard`. They cannot re-enter onboarding.

### 3.2 Step Structure

The onboarding flow has two variants depending on whether the user arrived with a URL already in localStorage (from the landing page hero) or navigated directly to `/signup`.

**Progress indicator:** 3 dots, always. Active = filled/bright, completed = filled/muted, upcoming = outlined/dim.

| Screen | When Shown | Counted in Dots |
|--------|------------|----------------|
| Step 0 — URL Input | Only if no URL in localStorage | No — always 3 dots shown |
| Step 1 — Business Name | Always (first visible step) | Yes — dot 1 |
| Step 2 — Industry | Always | Yes — dot 2 |
| Step 3 — Location | Always | Yes — dot 3 |
| Final — Scan Launching | Always (after Step 3) | No |

**Animations:** Slide left on advance (Framer Motion `AnimatePresence`). Slide right on back. Duration 0.3s. Back button ("← Back") appears on Steps 2 and 3 only.

---

### 3.3 Step 0 — URL Input (conditional)

**When shown:** User navigated directly to `/signup` without going through the landing page hero. No URL in `localStorage.getItem('beamix_pending_url')`.

**Screen:**
```
BEAMIX // SETUP        ●○○  (3 dots — user on step 1 of 3, Step 0 is not counted)

        [Globe icon]

   What's your business website?

   We'll scan it across every major AI engine.

   ┌────────────────────────────────────┐
   │  yourwebsite.com                   │
   └────────────────────────────────────┘

        [Continue →]
```

**Field:** URL input. Auto-strips `https://` and `www.` for display. Stores full URL with scheme internally. Validates as a valid URL format (does not make a network request to verify reachability — format only).

**Error message:** `"Please enter a valid website URL"`

**On submit:** Stores URL in `localStorage.setItem('beamix_pending_url', fullUrl)` and advances to Step 1.

**Copy:**
- Title: "What's your business website?"
- Subtitle: "We'll scan it across every major AI engine."
- Button: "Continue →"

---

### 3.4 Step 1 — Business Name

**When shown:** Always (Step 0 may or may not have preceded it).

**Screen:**
```
BEAMIX // SETUP        ●○○  (user on dot 1)

  ┌───────────────────────────────┐
  │  Scanning: yoursite.com       │   ← URL confirmation pill (read-only)
  └───────────────────────────────┘

        [Building icon]

   What's the name of your business?

   Exactly as customers search for it.

   ┌────────────────────────────────────┐
   │  e.g. Yael Insurance               │
   └────────────────────────────────────┘

        [Continue →]
```

**Field:** Text input. Required. 2-100 characters.

**Smart pre-fill:** Attempt to extract business name from URL domain. `yael-insurance.co.il` → pre-fill "Yael Insurance". Logic: strip TLD, strip hyphen/underscore, title-case. Do NOT pre-fill if the domain is generic (numbers-only, single word that could be anything, common words).

**URL confirmation pill:** Shows the URL from localStorage at the top of the form. Subtle #3370FF blue border, semi-transparent background. Read-only — clicking does nothing. Gives the user confidence their URL was saved.

**Copy:**
- Title: "What's the name of your business?"
- Subtitle: "Exactly as customers search for it."
- Button: "Continue →"

---

### 3.5 Step 2 — Industry

**When shown:** Always (dot 2).

**Screen:**
```
BEAMIX // SETUP        ●●○  (user on dot 2)

        [Briefcase icon]

   What industry are you in?

   To help us find the right competitive landscape.

   ┌────────────────────────────────────┐
   │  Select your industry...        ▼  │
   └────────────────────────────────────┘

        [Continue →]
```

**Field:** Dropdown select. Required. No default — user must choose. The options come from `src/constants/industries.ts` (25+ entries). This constants file is the single source of truth for industry options — onboarding and the scan engine must use the same values.

**Industry list (from constants file):**
```
Real Estate & Property
Insurance
Legal Services (Law Firms)
Healthcare & Medical
Dental & Oral Health
Financial Services & Accounting
Home Services (Plumbing, Electric, HVAC)
Moving & Relocation
Restaurants & Food
Hotels & Hospitality
E-commerce & Retail
Marketing & Advertising Agency
Software & Technology (SaaS)
Education & Training
Beauty & Wellness (Salons, Spas)
Fitness & Personal Training
Automotive Services
Photography & Videography
Event Planning & Catering
Architecture & Interior Design
Consulting & Business Services
Cleaning Services
Pet Services
Travel & Tourism
Other
```

**Copy:**
- Title: "What industry are you in?"
- Subtitle: "To help us find the right competitive landscape."
- Button: "Continue →"

---

### 3.6 Step 3 — Location

**When shown:** Always (dot 3). This is the final step before submission.

**Screen:**
```
BEAMIX // SETUP        ●●●  (user on dot 3)

        [Map Pin icon]

   Where is your main market?

   AI searches are highly local. This shapes every result.

   ┌────────────────────────────────────┐
   │  e.g. Tel Aviv, London, New York   │
   └────────────────────────────────────┘

        [Start My Scan →]
```

**Field:** Text input with autocomplete (city/region suggestions). Free-text fallback if autocomplete fails. Required. 2-100 characters. Accepts city, city+country, or region.

**Button copy change:** "Start My Scan →" instead of "Continue →". This is intentional — the final step signals that the next click starts something meaningful.

**On submit:**
1. Button shows loading spinner, is disabled
2. Call `POST /api/onboarding/complete` (see §5 for full spec)
3. If API returns success: advance to Final screen, then redirect
4. If API fails: show error state with retry button. Do NOT lose form data.

**Copy:**
- Title: "Where is your main market?"
- Subtitle: "AI searches are highly local. This shapes every result."
- Button: "Start My Scan →"

---

### 3.7 Final Screen — Scan Launching

**Shown for 1-1.5 seconds** while the API call completes and the response is received.

```
BEAMIX

        [Animated beam/spark icon]

        Launching your scan...

   Querying ChatGPT, Gemini, Claude, Perplexity
   and more across your industry and location.

   ─────────────────────────────────────────
   [animated progress line, looping]
   ─────────────────────────────────────────

   Results usually take 60–90 seconds.
   You can watch the scan live.
```

**What happens technically during this screen:**
1. `POST /api/onboarding/complete` is already in-flight (started on Step 3 submit)
2. Screen shows for minimum 1.0 second regardless of API response time (feel intentional)
3. On API success: `router.push('/scan/[scan_id]')` or `router.push('/dashboard')` depending on path (see §4 for free scan import path)
4. On API failure: replace Final screen with error state: "Something went wrong. Please try again." with retry button

---

### 3.8 State Management and Edge Cases

**Form state:** Stored in React component state only. Not persisted to localStorage during onboarding. If the user refreshes mid-flow, they start from Step 1 again — the URL is still in localStorage, so Step 0 is not shown again.

| Situation | Behavior |
|-----------|---------|
| User refreshes on Step 2 | Returns to Step 1. URL still in localStorage. Acceptable — keep it simple. |
| User navigates back to landing | URL still in localStorage. Can re-enter onboarding. |
| Supabase session expires mid-onboarding | Redirect to `/login?redirect=/onboarding` with message "Your session expired. Log in to continue." |
| `POST /api/onboarding/complete` times out | Show retry state with the same form data. Do not create duplicate business records — the API is idempotent (checks for existing primary business first). |
| User already has a business and visits `/onboarding` | Dashboard layout detects completed onboarding and redirects to `/dashboard`. |
| Google OAuth signup | After OAuth success, check localStorage for pending URL, proceed to onboarding as normal. |
| User with `scan_id` param | Handled by the Free Scan Import flow (see §4). |

---

## 4. Free Scan Import Flow

This flow handles the case where a user completed a free scan at `/scan`, viewed results at `/scan/[scan_id]`, and then clicked "Sign up" from that page.

**Decision logged:** C3 — "Free scan IS the first dashboard scan"

The free scan is not discarded. It becomes the user's first scan in their dashboard. No second scan is triggered immediately.

### 4.1 The Full Flow

```
User on /scan/[scan_id] results page
  ↓ clicks "Sign up free"
/signup?scan_id=[scan_id]
  ↓ user creates account
  ↓ handle_new_user trigger fires (user_profiles, subscriptions, notification_preferences created)
  ↓ client reads scan_id from URL
/onboarding?scan_id=[scan_id]
  ↓ onboarding detects scan_id param
  ↓ fetches free scan data to pre-populate business fields
  ↓ user reviews and completes steps (fewer manual fields to fill)
POST /api/onboarding/complete (with scan_id in body)
  ↓ business record created from scan data
  ↓ free_scans.converted_user_id = user.id (links the scan)
  ↓ free scan results imported to scans + scan_engine_results tables
  ↓ onboarding_completed_at set
  ↓ Inngest onboarding/complete event emitted
/dashboard (results already there — no wait for new scan)
```

### 4.2 Data Pre-Population from Free Scan

When `?scan_id=` is present in the onboarding URL:

1. Onboarding page mounts and detects the `scan_id` query param
2. Page calls `GET /api/scan/[scan_id]/results` to fetch the free scan data
3. The business name, URL, and industry from the free scan pre-populate Steps 1 and 2
4. User can edit these values (the pre-fill is a suggestion, not a lock)
5. Step 0 (URL input) is always skipped — the URL comes from the scan data
6. The `scan_id` is preserved through all steps and included in the `POST /api/onboarding/complete` body

**Pre-population field mapping:**

| Free Scan Field | Pre-populates |
|-----------------|--------------|
| `website_url` | Step 0 URL (skipped) and Step 1 URL pill |
| `business_name` | Step 1 business name input |
| `industry` | Step 2 industry dropdown |
| `location` | Step 3 location input |

### 4.3 Import at Completion

When `POST /api/onboarding/complete` receives a `scan_id`:

1. Service client (bypasses RLS) updates `free_scans.converted_user_id = user.id` where `id = scan_id AND converted_user_id IS NULL`
2. The `IS NULL` guard prevents double-importing if the user clicks submit twice
3. If the free scan status is `'completed'` and `results_data` is not null: `convertFreeScanResults()` is called
4. `convertFreeScanResults()` creates:
   - A `tracked_queries` row
   - A `scans` row (type: `'import'`)
   - Multiple `scan_engine_results` rows from the free scan engine data
5. User is redirected to `/dashboard` — the imported scan data is already there

**Error handling in `convertFreeScanResults()`:**
- Non-fatal: if any step fails, the function logs the error and returns. The business was already created and onboarding was marked complete. The scan data simply won't appear in the dashboard.
- Cleanup: if `scans` row was created but `scan_engine_results` insertion failed, the function deletes the `scans` row (and `tracked_queries` row) to avoid orphaned records.

### 4.4 Trial Clock

The 7-day trial clock starts when `POST /api/onboarding/complete` runs — specifically when `subscriptions.trial_starts_at` is set. It does NOT start from the free scan timestamp, even if the scan is hours old.

This was Decision C4: trial starts on first dashboard visit (which effectively means onboarding completion, since the dashboard layout sets trial dates on first load if they are null).

---

## 5. Onboarding Completion API

**Route:** `POST /api/onboarding/complete`
**File:** `src/app/api/onboarding/complete/route.ts`
**Auth:** Required. Returns 401 if no session.

### 5.1 Request Schema (Zod)

```typescript
const onboardingSchema = z.object({
  business_name: z.string().min(2).max(100),
  industry: z.string().min(1),
  location: z.string().min(2),
  url: z.string().url(),
  scan_id: z.string().optional(),   // present only for free scan import
})
```

### 5.2 What the Route Does (in order)

**Step 1 — Create or update business record:**
```typescript
// Check for existing primary business (idempotency — handles double-submit)
const { data: existingBiz } = await supabase
  .from('businesses')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_primary', true)
  .maybeSingle()

if (!existingBiz) {
  // Insert new primary business
  INSERT INTO businesses (user_id, name, website_url, industry, location, is_primary)
  VALUES (user.id, business_name, url, industry, location, true)
} else {
  // Update existing (handles back-button retry with edited data)
  UPDATE businesses SET name, website_url, industry, location WHERE id = existingBiz.id
}
```

**Step 2 — Link free scan (if scan_id provided):**
```typescript
// Must use service client — free_scans has no RLS UPDATE policy
const { data: freeScan } = await serviceClient
  .from('free_scans')
  .update({ converted_user_id: user.id })
  .eq('id', scan_id)
  .is('converted_user_id', null)    // guard against double-import
  .select('*')
  .single()

if (freeScan?.status === 'completed' && freeScan.results_data) {
  await convertFreeScanResults(serviceClient, freeScan, user.id, business.id)
}
```

Note: errors in this step are non-fatal. Business creation and onboarding completion proceed even if scan import fails.

**Step 3 — UPSERT user_profiles (critical — not UPDATE):**

```typescript
await supabase
  .from('user_profiles')
  .upsert(
    {
      id: user.id,                              // Note: id, not user_id
      email: user.email ?? null,
      full_name: user.user_metadata?.full_name ?? null,
      onboarding_completed_at: now,
      updated_at: now,
    },
    { onConflict: 'id' }
  )
```

**Why UPSERT and not UPDATE:** If the `handle_new_user` trigger didn't run (local dev without migrations, existing users before the fix, edge cases), there may be no row to UPDATE. UPDATE on a non-existent row silently succeeds with 0 rows affected, leaving `onboarding_completed_at` null and causing the infinite onboarding loop. UPSERT creates the row if it doesn't exist, or updates it if it does. This is the primary bug fix.

**If this step fails:** Return 500 immediately. This is a fatal error — the user cannot proceed without `onboarding_completed_at` being set.

**Step 4 — UPSERT subscriptions (set trial dates):**

```typescript
const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()  // 7 days
await supabase
  .from('subscriptions')
  .upsert(
    {
      user_id: user.id,
      status: 'trialing',
      plan_tier: null,                          // null = free tier
      trial_started_at: now,
      trial_ends_at: trialEnd,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  )
```

Note: the current code in `route.ts` sets `14 * 24 * 60 * 60 * 1000` (14 days). The product spec says 7 days. **This is a bug in the existing code — the correct value is 7 days.** Log this correction: trial is 7 days per Decision C4.

If this step fails: non-fatal. Log the error. User can still reach the dashboard.

**Step 5 — Emit Inngest event:**

```typescript
await inngest.send({
  name: 'onboarding/complete',
  data: { userId: user.id, businessId: business.id }
})
```

This triggers the New Business Onboarding workflow (see §6).

**Step 6 — Return success:**

```typescript
return NextResponse.json({ success: true, business_id: business.id })
```

The client reads `business_id` for the redirect URL if needed.

### 5.3 Response

**Success:**
```json
{ "success": true, "business_id": "uuid-string" }
```

**Validation failure:**
```json
{ "error": "Validation failed", "details": "Zod error message" }
```
Status: 400

**Auth failure:**
```json
{ "error": "Unauthorized" }
```
Status: 401

**Fatal error (upsert failed):**
```json
{ "error": "Failed to complete onboarding", "details": "Supabase error message" }
```
Status: 500

---

## 6. New Business Onboarding Workflow

**Inngest event:** `onboarding/complete`
**Payload:** `{ userId: string, businessId: string }`
**Function name:** `workflow.execute` (general workflow executor)

### 6.1 Workflow Steps

The workflow runs immediately when the `onboarding/complete` event is received:

**Phase 1 — Parallel agent execution (all three start simultaneously):**
- A13: Content Voice Trainer
- A14: Content Pattern Analyzer
- A11: AI Readiness Auditor

**Phase 2 — After all three complete:**
- A4: Recommendations Agent (auto, 0 credits) — runs analysis against whatever data Phase 1 produced

**Phase 3 — Notifications:**
- Sends "Welcome to Beamix" email via Resend
- Creates in-app notification: "Your workspace is ready"

### 6.2 Credit Handling for Onboarding Agents

System-initiated onboarding agents (A11, A13, A14) are **exempt from credit deduction**. They are logged in `credit_transactions` as:

```sql
INSERT INTO credit_transactions (
  user_id, pool_id, pool_type,
  transaction_type,   -- 'system_grant'
  amount,             -- 0 (zero cost, zero deduction)
  balance_after,      -- same as before
  agent_job_id,
  description         -- 'System: onboarding agent run'
)
```

The `'system_grant'` transaction type is in the CHECK constraint for `credit_transactions.transaction_type`.

**Guard against replay:** The workflow checks `user_profiles.onboarding_completed_at` before emitting agent events. If `onboarding_completed_at IS NULL` at event time, the workflow aborts (this should not happen but guards against race conditions). Once `onboarding_completed_at` is set, duplicate `onboarding/complete` events are no-ops.

### 6.3 What Each Agent Produces at Onboarding

| Agent | Output in Content Library | Purpose |
|-------|--------------------------|---------|
| A13 (Voice Trainer) | Voice profile in `content_voice_profiles` | All future content matches business's tone |
| A14 (Pattern Analyzer) | Pattern report in `content_items` (content_type: `structured_report`) | Future content follows citation-winning patterns |
| A11 (AI Readiness Auditor) | Readiness report in `content_items` + score in `ai_readiness_history` | First readiness score and improvement roadmap |
| A4 (Recommendations) | Recommendations in `recommendations` table | First set of actionable items for new user |

---

## 7. Data Model — Auth Tables

All tables are in the `public` schema. Supabase Auth owns `auth.users`. All other tables reference it via FK.

### 7.1 `user_profiles`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE | Same as auth.users.id — not a separate key |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) | Alias for querying by user_id (some query patterns use this) |
| full_name | text | | Display name from OAuth or user input |
| avatar_url | text | | Profile picture URL (OAuth-populated) |
| locale | text | DEFAULT 'en', CHECK IN ('en', 'he') | UI language preference |
| timezone | text | DEFAULT 'UTC' | Used for cron scheduling (e.g., weekly digest delivered at 8AM user time) |
| onboarding_completed_at | timestamptz | | NULL until onboarding completes. **Presence of this value is the gate for dashboard access.** |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Auto-updated by trigger |

**RLS:**
- Users can SELECT and UPDATE their own row: `user_id = auth.uid()`
- INSERT is handled only by the `handle_new_user` trigger (service role)
- DELETE cascades from `auth.users`

**Important:** The `onboarding_completed_at` field is a one-way door. Once set, it is never cleared. The dashboard layout checks this field on every page load to determine if onboarding redirect is needed.

---

### 7.2 `subscriptions`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) ON DELETE CASCADE | One subscription per user |
| plan_id | uuid | FK → plans(id) | NULL = free tier (no active paid plan) |
| paddle_subscription_id | text | UNIQUE | Paddle's subscription reference |
| paddle_customer_id | text | | Paddle's customer reference |
| status | text | NOT NULL, DEFAULT 'trialing', CHECK IN ('trialing', 'active', 'past_due', 'cancelled', 'paused') | **NOTE: 'cancelled' uses UK spelling — matches Paddle's webhook payload** |
| plan_tier | text | CHECK IN ('starter', 'pro', 'business') | NULL = free tier. No 'free' enum value — free is represented by plan_tier IS NULL |
| trial_starts_at | timestamptz | | Set by `POST /api/onboarding/complete` |
| trial_ends_at | timestamptz | | trial_starts_at + 7 days |
| current_period_start | timestamptz | | Billing period start (from Paddle webhook) |
| current_period_end | timestamptz | | Billing period end (from Paddle webhook) |
| cancel_at | timestamptz | | Scheduled cancellation date |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

**Critical enum facts:**
- `status = 'cancelled'` — UK spelling. Do not use `'canceled'` (US spelling). This value comes directly from Paddle webhooks.
- `plan_tier` has no `'free'` value. Free users have `plan_tier IS NULL`.

**RLS:** Users can SELECT their own row. Only service role can INSERT/UPDATE (driven by Paddle webhooks and the `handle_new_user` trigger).

---

### 7.3 `notification_preferences`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | UNIQUE, NOT NULL, FK → auth.users(id) ON DELETE CASCADE | One row per user |
| email_enabled | boolean | DEFAULT true | Receive email notifications |
| email_digest | text | DEFAULT 'daily', CHECK IN ('realtime', 'daily', 'weekly', 'off') | Email frequency preference |
| inapp_enabled | boolean | DEFAULT true | In-app notifications |
| slack_webhook_url | text | | Slack incoming webhook URL |
| slack_enabled | boolean | DEFAULT false | Slack notifications |
| quiet_hours_start | time | | Do not disturb start |
| quiet_hours_end | time | | Do not disturb end |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | |

Created automatically by `handle_new_user` trigger with all defaults. User can update via Settings > Preferences tab.

**RLS:** Users can SELECT and UPDATE their own row. Created by trigger.

---

### 7.4 `businesses`

The businesses table is created during onboarding. It is not created by the `handle_new_user` trigger.

| Column | Type | Key Constraints | Purpose |
|--------|------|----------------|---------|
| id | uuid | PK | |
| user_id | uuid | NOT NULL, FK → auth.users(id) | Owner |
| name | text | NOT NULL | Business display name |
| website_url | text | NOT NULL | Primary website |
| industry | text | NOT NULL | Industry key — must match value from `constants/industries.ts` |
| location | text | | City or region |
| services | text[] | DEFAULT '{}' | Array of services — this is `text[]` not Json |
| description | text | | Business description for agent context assembly |
| language | text | DEFAULT 'en', CHECK IN ('en', 'he') | Content language preference |
| is_primary | boolean | DEFAULT false | User's primary business |
| last_scanned_at | timestamptz | | Updated after each completed scan |
| next_scan_at | timestamptz | | For scheduled scan cron lookup |

**First insert:** Created by `POST /api/onboarding/complete`. The `is_primary = true` flag is set on the first business. If the user re-runs onboarding (edge case), the existing primary business is updated, not re-inserted.

**RLS:** Full CRUD for own businesses: `user_id = auth.uid()`.

---

## 8. Language and Locale

### 8.1 Language Options

Beamix supports two languages: English (`'en'`) and Hebrew (`'he'`).

Language is stored in two places:
- `user_profiles.locale` — UI language (what language the dashboard is displayed in)
- `businesses.language` — content language (what language agents generate content in, what language scans use for prompt generation)

These can differ: a Hebrew-speaking user can run an English-language business.

### 8.2 Setting Language

**During onboarding:** Language is inferred from location. Israel → Hebrew. All other locations → English. This inference sets `businesses.language`. The user can override it in Settings > Preferences after onboarding.

The current onboarding spec (as of March 2026) does NOT show a language picker during onboarding — language is inferred automatically to reduce steps.

**In settings:** Settings > Preferences tab shows a language toggle (EN / HE). Changing it updates `user_profiles.locale` and optionally `businesses.language` if the user wants to change content language too.

### 8.3 RTL Layout for Hebrew Users

When `user_profiles.locale = 'he'`, the application renders in RTL mode:

- The root `<html>` element gets `dir="rtl"` and `lang="he"` attributes
- Tailwind CSS handles RTL layout automatically with the `rtl:` variant prefix on directional classes
- The sidebar flips to the right side
- The onboarding form is center-aligned (RTL-neutral) — no changes needed
- Agent-generated content in Hebrew is saved with `content_items.language = 'he'`

**Implementation pattern:**

```typescript
// In root layout server component
const locale = userProfile?.locale ?? 'en'
const isRTL = locale === 'he'

return (
  <html dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
    ...
  </html>
)
```

### 8.4 Scan Language

When a scan is triggered, the scan engine generates prompts in the business's configured language:
- `businesses.language = 'en'` → English prompts only
- `businesses.language = 'he'` → Hebrew prompts (colloquial Israeli phrasing, not literary Hebrew)
- Dual-language businesses: prompts in both languages, doubling coverage

Hebrew prompt templates use natural Israeli speech patterns. The English/Hebrew equivalents are both defined in `src/constants/industries.ts` alongside the industry constant.

---

## 9. Implementation Checklist

### Auth

- [ ] Supabase project configured with email auth + Google OAuth
- [ ] `handle_new_user` trigger migration applied: `supabase/migrations/20260302_signup_trigger.sql`
- [ ] Backfill query run for any existing users who predate the trigger
- [ ] `src/app/(auth)/login/page.tsx` — login form with Google OAuth, magic link, forgot password link
- [ ] `src/app/(auth)/signup/page.tsx` — signup form with `?scan_id=` handling
- [ ] `src/app/(auth)/forgot-password/page.tsx` — password reset request
- [ ] `src/app/auth/callback/route.ts` — OAuth/magic link/reset handler
- [ ] `src/middleware.ts` — session refresh + route protection for `/dashboard` and `/onboarding`

### Onboarding

- [ ] `src/app/onboarding/page.tsx` — 4-step onboarding client component with Framer Motion
- [ ] Step 0 (URL), Step 1 (Name), Step 2 (Industry), Step 3 (Location) — all steps implemented
- [ ] Progress dots (3 visible, always)
- [ ] Back button on Steps 2-3
- [ ] URL confirmation pill on Step 1
- [ ] `localStorage` read on mount, clear on completion
- [ ] Free scan data pre-population when `?scan_id=` present

### API

- [ ] `src/app/api/onboarding/complete/route.ts` — UPSERT pattern (not UPDATE), verified working
- [ ] Trial end date is 7 days (not 14 — bug in current code to fix)
- [ ] Inngest event emission for `onboarding/complete`
- [ ] Free scan import logic in `convertFreeScanResults()`

### Workflow

- [ ] Inngest function for New Business Onboarding workflow (A13 + A14 + A11 parallel → A4)
- [ ] System-grant credit transaction logging for onboarding agent runs
- [ ] Welcome email sent via Resend on onboarding complete

---

*Last updated: March 2026*
*Critical bug reference: Infinite onboarding loop — see §1.3.1 for root cause and fix. Both the trigger and the UPSERT must be present; either alone is insufficient.*
*Related specs: `onboarding-spec.md` (UI/copy detail), `_SYSTEM_DESIGN_ARCHITECTURE_LAYER.md` §2.1 (full DB schema), `_SYSTEM_DESIGN_PRODUCT_LAYER.md` §2.4-2.7 (page specs)*
