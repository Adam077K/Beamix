# Beamix — Onboarding Flow Spec
**Version:** 1.0
**Date:** 2026-02-28
**Status:** Draft — Ready for Dev

> The onboarding is a bridge, not a destination. Its only job is to collect the minimum data required to start a scan — and get out of the way as fast as possible. Every extra field is a conversion killer.

---

## Design Decisions & Rationale

| Decision | Choice | Why |
|---|---|---|
| URL handling | Pre-filled, not re-asked | User already typed it. Asking again = friction + distrust |
| Competitor collection | Not in onboarding | Scan finds them automatically. Add manually later via Settings. |
| Number of steps | 3 (or 4 if no URL) | Each extra step loses ~10-15% of users. 3 is the minimum viable. |
| Scan trigger timing | Fires on "Start My Scan" click | Every second saved = better conversion. User arrives to a scan already running. |
| Data persistence | Supabase only (not localStorage) | localStorage is lost on new tab. Supabase is the source of truth. localStorage used only as temporary handoff. |

---

## Complete Flow Diagram

```
LANDING PAGE
User types URL → localStorage.setItem('beamix_pending_url', url)
       │
       ▼
SIGNUP PAGE (/signup)
User registers (email+password or Google)
Supabase creates auth.users record + handle_new_user() trigger fires
       │
       ├─ URL in localStorage? ──YES──▶ /onboarding  (3 steps)
       │
       └─ No URL ──────────────────▶ /onboarding  (4 steps, Step 0 = URL)
              │
              ▼
ONBOARDING (/onboarding)
       │
       ├─ WITH scan_id (came from landing page free scan):
       │       Steps: business name + industry + location only
       │       On complete → POST /api/scan/[scan_id]/claim
       │         → links free_scan to user, imports results to scans table
       │         → trial starts retroactively from free_scan.created_at
       │         → redirect to /dashboard (results already there)
       │
       └─ WITHOUT scan_id (came directly to signup):
               Steps: URL + business name + industry + location
               On complete → POST /api/scan/start
                 → creates businesses record + new scan
                 → trial starts now
                 → redirect to /scan/[new_scan_id]
              │
              ▼
SCAN PAGE (/scan/[scan_id])
Scan already running. User watches progress.
       │
       ▼
SCAN RESULTS
Animation reveal → CTA → Dashboard
```

---

## URL Handoff — Technical Detail

**Step 1: Landing Page → localStorage**
```typescript
// On landing page: when user submits URL and clicks Scan
localStorage.setItem('beamix_pending_url', websiteUrl)
// Then redirect to /signup
router.push('/signup')
```

**Step 2: Signup → preserved through auth**
```typescript
// Signup page reads it for display only
const pendingUrl = localStorage.getItem('beamix_pending_url')
// Shown to user: "We'll scan: yoursite.com"
// NOT cleared yet — onboarding needs it
```

**Step 3: Onboarding reads it**
```typescript
// Onboarding reads on mount
const websiteUrl = localStorage.getItem('beamix_pending_url') ?? ''
const hasUrl = websiteUrl.length > 0
// If hasUrl → start at step 0 (business name), show URL card
// If !hasUrl → start at step -1 (URL input), then business name
```

**Step 4: On scan start — clear localStorage**
```typescript
// After POST /api/scan/start succeeds:
localStorage.removeItem('beamix_pending_url')
localStorage.removeItem('beamix_business_data') // legacy key, also clear
// Redirect to /scan/[scan_id]
```

---

## Step Definitions

### Step 0 — URL Input (conditional — only if no URL in localStorage)

**When shown:** User arrived at /signup directly, without going through landing page hero.

**Screen:**
```
BEAMIX // SETUP          ●○○○  (4 dots — user is on step 1 of 4)

        [Globe icon]

   What's your business website?

   We'll scan it across every major AI engine.

   ┌──────────────────────────────────────────┐
   │  yourwebsite.com                         │
   └──────────────────────────────────────────┘

        [Continue →]
```

**Field:** URL input. Placeholder: `yourwebsite.com`. Validates format (must be valid URL). Auto-strips `https://` and `www.` for display, stores full URL internally.

**Validation:** Must be a reachable domain (soft validation — don't block on timeout, just format check). Show error: `"Please enter a valid website URL"` if format is wrong.

**Copy:**
- Title: `What's your business website?`
- Subtitle: `We'll scan it across every major AI engine.`
- Button: `Continue →`

---

### Step 1 — Business Name

**When shown:** Always. First step if URL is known, second step if URL was just collected.

**Screen (with URL pre-fill):**
```
BEAMIX // SETUP          ●○○  (3 dots — user is on step 1 of 3)

  ┌─────────────────────────────────┐
  │  We're scanning: yoursite.com   │  ← URL confirmation card, small, top of form
  └─────────────────────────────────┘

        [Building icon]

   What's the name of your business?

   Exactly as customers search for it.

   ┌──────────────────────────────────────────┐
   │  e.g. Yael Insurance                     │
   └──────────────────────────────────────────┘

        [Continue →]
```

**Field:** Text input. Placeholder: `e.g. Yael Insurance`.

**Smart pre-fill:** Attempt to extract business name from URL domain. `yael-insurance.co.il` → pre-fill `Yael Insurance`. User can edit. Don't pre-fill if extraction is ambiguous (generic domains, numbers-only, etc.).

**Validation:** Required. 2–100 characters.

**Copy:**
- Title: `What's the name of your business?`
- Subtitle: `Exactly as customers search for it.`
- Button: `Continue →`

**URL confirmation card:** Small pill at top of the card area showing the URL that will be scanned. Gives the user confidence their intent was saved. Clicking it does nothing (read-only).

---

### Step 2 — Industry

**Screen:**
```
BEAMIX // SETUP          ●●○  (3 dots — user is on step 2 of 3)

        [Briefcase icon]

   What industry are you in?

   To help us find the right competitive landscape.

   ┌──────────────────────────────────────────┐
   │  Select your industry...              ▼  │
   └──────────────────────────────────────────┘

        [Continue →]
```

**Field:** Dropdown select. Required. No default — user must choose.

**Industry list (25+ options):**
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
- Title: `What industry are you in?`
- Subtitle: `To help us find the right competitive landscape.`
- Button: `Continue →`

**Dev note:** Each industry maps to a set of prompt templates used by the scan engine for LLM querying. Keep the list in a shared constants file (`src/lib/constants/industries.ts`) so onboarding and the scan service stay in sync.

---

### Step 3 — Location

**Screen:**
```
BEAMIX // SETUP          ●●●  (3 dots — user is on step 3 of 3)

        [Map Pin icon]

   Where is your main market?

   AI searches are highly local. This shapes every result.

   ┌──────────────────────────────────────────┐
   │  e.g. Tel Aviv, London, New York         │
   └──────────────────────────────────────────┘

        [Start My Scan →]
```

**Field:** Text input with autocomplete (city/region suggestions). Free text fallback if autocomplete fails. Placeholder: `e.g. Tel Aviv, London, New York`. Accept city, city+country, or region.

**Validation:** Required. 2–100 characters.

**Button text change:** Final step uses `Start My Scan →` instead of `Continue →`. This is intentional — it signals to the user that the next click is meaningful. It starts something.

**Copy:**
- Title: `Where is your main market?`
- Subtitle: `AI searches are highly local. This shapes every result.`
- Button: `Start My Scan →`

---

## Final Screen — Scan Launching

**Shown for ~1.5 seconds after "Start My Scan" is clicked, while the API call completes and returns the scan_id.**

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

**What happens here technically:**
1. User clicks "Start My Scan →"
2. Button immediately shows loading state (spinner, disabled)
3. POST `/api/scan/start` fires with: `{ website_url, business_name, industry, location, user_id }`
4. API creates record in `businesses` table + `scans` table + triggers background scan worker
5. API returns `{ scan_id }`
6. "Launching your scan..." screen shows for minimum 1.0s (feels intentional, not like an error)
7. `router.push('/scan/[scan_id]')`

**Error handling:** If POST fails → show error: `"Something went wrong starting your scan. Please try again."` with retry button. Do not redirect. Do not lose the form data.

---

## Technical Spec — API Call

**Endpoint:** `POST /api/scan/start`

**Request body:**
```typescript
{
  website_url: string,       // Full URL with https://
  business_name: string,
  industry: string,          // Must match industry constants
  location: string,
  user_id: string,           // From Supabase auth session
  scan_source: 'onboarding' // For analytics — distinguish from landing page scans
}
```

**Response:**
```typescript
{
  scan_id: string,           // UUID — used to build /scan/[scan_id] URL
  status: 'processing'
}
```

**What the API does:**
1. Validate all fields with Zod
2. Upsert into `businesses` table (create if first business, link to user_id)
3. Insert into `scans` table with status `'processing'`
4. Trigger background scan worker (async — does not block response)
5. Return `{ scan_id, status: 'processing' }`

**Scan worker handles asynchronously (server-side code):**
- Generates industry-specific prompts
- Queries all 8 AI engines in parallel
- Parses responses + extracts mentions, queries, rankings
- Writes results to `scan_engine_results`, `scan_queries`, `scan_mentions`
- Updates `scans.status` to `'completed'`

---

## Supabase Data Written

**`businesses` table:**
```sql
INSERT INTO businesses (user_id, name, website_url, industry, location, is_primary)
VALUES ($user_id, $business_name, $website_url, $industry, $location, true)
ON CONFLICT (user_id) WHERE is_primary = true
DO UPDATE SET name = $business_name, website_url = $website_url,
             industry = $industry, location = $location;
```

**`free_scans` table:**
```sql
INSERT INTO free_scans (scan_token, website_url, business_name, sector, location,
                        status, converted_user_id)
VALUES (gen_random_uuid(), $website_url, $business_name, $industry, $location,
        'processing', $user_id);
```

---

## Visual Design Spec

**Background:** Same painterly dark background as existing onboarding code (`painterly-bg` class). Keep this — it's already implemented and looks good.

**Layout:** Full screen, vertically centered. Max width 480px. Single input per screen.

**Progress indicator:** 3 dots (or 4 if Step 0 shown). Current step = filled/bright. Completed steps = filled/muted. Future steps = empty/dim. No numbers — just dots. Centered at top of content area.

**Input style:** Large, centered. Two variants:
- Text input: transparent background, bottom border only (existing style — keep it)
- Dropdown: elevated card background, full border, rounded-xl (existing style — keep it)

**Button:** White rounded pill, black text. Full width on mobile. Hover: scale 1.02. Active: scale 0.98. Disabled when field is empty — never allows skipping.

**Transitions:** Slide left on advance (existing AnimatePresence pattern — keep it). Slide right on back (if back button added). Duration: 0.3s.

**Back navigation:** Small "← Back" text link above the progress dots, visible on steps 2+. Step 1 has no back (would go to signup — not desirable).

**URL confirmation card (Step 1 only):**
```
Small pill at top of the form area:
┌──────────────────────────────────┐
│  🔍  Scanning: yoursite.com      │
└──────────────────────────────────┘
Subtle cyan border, semi-transparent background. Read-only.
```

---

## States & Edge Cases

| Situation | Behavior |
|---|---|
| User refreshes mid-onboarding | Form state is in React state — lost on refresh. User starts from Step 1 again. URL still in localStorage. Acceptable tradeoff — keep it simple. |
| User navigates back to landing | Fine — URL still in localStorage. They can re-enter the flow. |
| Supabase session expired before onboarding completes | Redirect to /login with message: "Your session expired. Log in to continue." |
| `POST /api/scan/start` times out | Show retry state. Log error. Do not create duplicate scan records (idempotency key = user_id + website_url + timestamp rounded to 5min). |
| User is already authenticated and visits /onboarding | Check if they already have a business. If yes, redirect to /dashboard. Onboarding is one-time only. |
| User completes onboarding but closes tab before scan finishes | Scan continues in background (worker). When they return to /dashboard, it shows first-time state with "scan running". |
| Google OAuth signup | Same flow — after OAuth success, check if `beamix_pending_url` exists in localStorage, proceed to onboarding. |

---

## Copy Summary

| Screen | Title | Subtitle | Button |
|---|---|---|---|
| Step 0 (URL) | What's your business website? | We'll scan it across every major AI engine. | Continue → |
| Step 1 (Name) | What's the name of your business? | Exactly as customers search for it. | Continue → |
| Step 2 (Industry) | What industry are you in? | To help us find the right competitive landscape. | Continue → |
| Step 3 (Location) | Where is your main market? | AI searches are highly local. This shapes every result. | Start My Scan → |
| Final | Launching your scan... | Querying every major AI engine across your industry and location. | (none — auto-redirects) |

---

## What NOT to Add (Deliberately Excluded)

| Field | Why excluded |
|---|---|
| Competitors | Scan finds them automatically. Add later in Settings. Adding this field increases drop-off. |
| Phone number | No use case in MVP. Adds friction. |
| Company size | Not used in scan logic. Nice-to-have for segmentation — add later via progressive profiling. |
| Number of locations | Not used in scan logic for MVP. |
| Primary language | Inferred from location (Israel → Hebrew, elsewhere → English). User can change in Settings. |
| How did you hear about us | Survey fatigue. Zero value at this conversion moment. |

---

*Document version: 1.0 | Created: 2026-02-28 | Author: Iris (CEO Agent)*
*This spec replaces the existing `/onboarding/page.tsx` logic. The visual design (animations, styling) can be largely preserved — the data flow needs to be rebuilt against Supabase.*
