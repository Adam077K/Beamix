> Archived from `docs/07-history/CHANGELOG.md` on 2026-03-19.
> Original marker: "Build Phase History" section starting at line 60.

## Build Phase History

> ⚠️ **ARCHIVED** — Historical reference. Current source of truth: `.planning/03-system-design/BEAMIX_SYSTEM_DESIGN.md` | Archived: 2026-03-05

# Beamix — Complete Build Plan (All Pages, All Features)
**Status:** Ready for execution
**Build mode:** Clean slate — saas-platform/ does not exist, build from scratch
**LLM keys:** Not available yet → mock scan engine (realistic, seeded per business)
**Supabase:** Project exists + MCP connection available to inspect/apply schema
**Trial duration:** 14 days (LOCKED — overrides settings-spec.md which said 7)

---

## Context

Beamix is a GEO (Generative Engine Optimization) platform that scans SMBs across AI search engines, shows visibility gaps, and uses AI agents to fix them. The saas-platform/ codebase was removed in a cleanup commit (560c622). This plan builds the ENTIRE application from scratch based on all locked specs in `.planning/`.

**The product's emotional core:** `/scan/[scan_id]` — the moment a business owner discovers their AI visibility reality.

---

## Directory Structure (Target)

```
saas-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                    ← sidebar nav
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                  ← 5-zone main dashboard
│   │   │   │   ├── rankings/page.tsx
│   │   │   │   ├── agents/page.tsx
│   │   │   │   ├── content/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── agent/[id]/page.tsx       ← agent chat UX
│   │   │   └── onboarding/page.tsx
│   │   ├── api/
│   │   │   ├── scan/
│   │   │   │   ├── start/route.ts
│   │   │   │   └── [scan_id]/
│   │   │   │       ├── status/route.ts
│   │   │   │       └── results/route.ts
│   │   │   ├── agents/
│   │   │   │   ├── content-writer/route.ts
│   │   │   │   ├── blog-writer/route.ts
│   │   │   │   ├── review-analyzer/route.ts
│   │   │   │   ├── schema-optimizer/route.ts
│   │   │   │   ├── social-strategy/route.ts
│   │   │   │   ├── competitor-research/route.ts
│   │   │   │   └── executions/[id]/route.ts  ← polling endpoint
│   │   │   ├── dashboard/overview/route.ts
│   │   │   ├── businesses/route.ts
│   │   │   ├── queries/route.ts
│   │   │   ├── content/route.ts
│   │   │   ├── content/[id]/route.ts
│   │   │   ├── recommendations/route.ts
│   │   │   ├── credits/balance/route.ts
│   │   │   ├── onboarding/complete/route.ts
│   │   │   ├── paddle/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   ├── webhooks/route.ts
│   │   │   │   └── portal/route.ts
│   │   │   └── cron/
│   │   │       ├── weekly-digest/route.ts
│   │   │       └── trial-nudges/route.ts
│   │   ├── scan/
│   │   │   ├── page.tsx                      ← scan form (public)
│   │   │   └── [scan_id]/page.tsx            ← results page (THE CORE)
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── category/[cat]/page.tsx
│   │   ├── page.tsx                          ← landing page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── landing/                          ← 9 landing sections
│   │   ├── scan/                             ← scan form + results UI
│   │   ├── dashboard/                        ← all dashboard zones
│   │   ├── email/                            ← React Email templates
│   │   └── ui/                              ← shadcn + custom
│   ├── lib/
│   │   ├── supabase/
│   │   ├── scan/                             ← mock + real engine
│   │   ├── agents/                           ← agent pipelines
│   │   ├── email/                            ← Resend wrapper
│   │   ├── paddle/                           ← Paddle helpers
│   │   └── types/
│   ├── constants/
│   │   └── industries.ts
│   └── middleware.ts
├── supabase/migrations/
│   └── 20260301000000_beamix_schema.sql
├── vercel.json                               ← cron jobs config
└── .env.local.example
```

---

## PHASE 0 — Project Bootstrap (Pre-Everything)
**Agent: Atlas**
**Prerequisite to all other phases**

### 0a. Init Next.js App
```bash
npx create-next-app@latest saas-platform \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 0b. Install All Dependencies
```bash
# Supabase
npm install @supabase/ssr @supabase/supabase-js

# UI & Styling
npx shadcn@latest init  # (select default style, zinc base)
npx shadcn@latest add button card dialog input select textarea badge skeleton dropdown-menu alert tabs separator progress

# Animation
npm install framer-motion

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Data Fetching
npm install @tanstack/react-query @tanstack/react-query-devtools

# State
npm install zustand

# Icons
npm install lucide-react

# Charts
npm install recharts

# Email
npm install resend @react-email/components @react-email/render

# Payments
npm install @paddle/paddle-node-sdk @paddle/paddle-js

# HTTP
npm install axios

# Date formatting
npm install date-fns

# i18n (for Phase 14)
npm install next-intl
```

### 0c. Configure TypeScript, Tailwind, Next.js
- `tsconfig.json` — strict mode, path aliases
- `tailwind.config.ts` — warm color palette, custom fonts
- `next.config.ts` — image domains, env vars, i18n future config

### 0d. Design Tokens (globals.css + tailwind config)
```css
/* Brand palette (warm, energetic, usebear.ai inspired) */
--color-bg: #FAFAF8;           /* off-white, warm */
--color-text: #141310;         /* near-black */
--color-accent: #06B6D4;       /* cyan-500 = beam color */
--color-accent-warm: #F97316;  /* orange-500 = energy */
--color-card: #FFFFFF;
--color-card-border: #E7E5E4;
--color-muted: #78716C;        /* stone-500 */
--card-radius: 20px;           /* rounded-[20px] */
--shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);

/* Score colors */
--score-critical: #EF4444;     /* 0-25 */
--score-fair:     #F59E0B;     /* 26-50 */
--score-good:     #10B981;     /* 51-75 */
--score-excellent: #06B6D4;    /* 76-100 */
```

### 0e. Environment Variables (.env.local.example)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM APIs (not required for mock mode)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_AI_API_KEY=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@beamix.io

# Payments
PADDLE_API_KEY=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRICE_STARTER_MONTHLY=
PADDLE_PRICE_STARTER_YEARLY=
PADDLE_PRICE_PRO_MONTHLY=
PADDLE_PRICE_PRO_YEARLY=
PADDLE_PRICE_BUSINESS_MONTHLY=
PADDLE_PRICE_BUSINESS_YEARLY=
PADDLE_PRICE_TOPUP_5=
PADDLE_PRICE_TOPUP_15=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 0f. Supabase Schema (via MCP)
Use Supabase MCP to:
1. List all existing tables
2. Run this diff against required schema
3. Apply any missing tables/functions/RLS

**Required tables (18):**
```sql
-- Check each: free_scans, businesses, users (user_profiles), subscriptions,
-- credits, credit_transactions, tracked_queries, scan_results,
-- scan_result_details, recommendations, agent_executions, content_generations,
-- plans, notification_preferences

-- Key trigger:
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.subscriptions (user_id, plan_tier, status)
  VALUES (NEW.id, 'free', 'trialing');

  INSERT INTO public.credits (user_id, total_credits, monthly_allocation)
  VALUES (NEW.id, 0, 0);

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**free_scans table (critical — may not exist):**
```sql
CREATE TABLE IF NOT EXISTS public.free_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  business_url    TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  industry        TEXT NOT NULL,
  location        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing','completed','failed')),
  results_data    JSONB,
  converted_user_id UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- RLS: public can INSERT, owner can read their own
ALTER TABLE public.free_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "free_scans: public insert" ON public.free_scans
  FOR INSERT WITH CHECK (true);
CREATE POLICY "free_scans: public read by scan_id" ON public.free_scans
  FOR SELECT USING (true);  -- public, shareable
```

---

## PHASE 1 — Core Infrastructure & Auth
**Agent: Atlas**

### 1a. Supabase Clients
**`src/lib/supabase/client.ts`** — Browser client (use createBrowserClient from @supabase/ssr)
**`src/lib/supabase/server.ts`** — Server client with cookies (createServerClient)
**`src/lib/supabase/middleware.ts`** — updateSession helper

### 1b. Middleware (auth protection)
**`src/middleware.ts`:**
- Public routes: `/`, `/scan/*`, `/pricing`, `/blog/*`, `/api/scan/*` (public)
- Protected: `/dashboard/*`, `/onboarding` → redirect to `/login` if no session
- Auth routes: `/login`, `/signup`, `/forgot-password` → redirect to `/dashboard` if already logged in
- matcher: all except `/_next/static`, `/_next/image`, `favicon.ico`, image files

### 1c. Auth Pages (Beamix-branded)
All pages: warm off-white background (`#FAFAF8`), centered card, Beamix logo at top

**`/login`:**
- Email + password fields
- Toggle show/hide password
- "Sign In" button → `supabase.auth.signInWithPassword()`
- Error handling: "Invalid credentials"
- Link: "Don't have an account? Create one →"
- Link: "Forgot password?"
- On success → redirect to `/dashboard` (or `/onboarding` if `onboarding_completed=false`)

**`/signup`:**
- Email + password + confirm password
- Checkbox: "I agree to Terms of Service and Privacy Policy"
- "Create Account" → `supabase.auth.signUp()`
- If `?scan_id=XXX` in URL → display "Your scan for [URL] is waiting" banner
- On success → redirect to `/onboarding` (with `?scan_id=XXX` if present)

**`/forgot-password`:**
- Email input → `supabase.auth.resetPasswordForEmail()`
- Success state: "Check your inbox"
- Back to login link

### 1d. Constants
**`src/constants/industries.ts`:**
```typescript
export const INDUSTRIES = [
  { value: 'insurance', label: 'Insurance', heLabel: 'ביטוח' },
  { value: 'legal', label: 'Legal / Law Firm', heLabel: 'משרד עורכי דין' },
  { value: 'real_estate', label: 'Real Estate', heLabel: 'נדל"ן' },
  { value: 'healthcare', label: 'Healthcare / Medical', heLabel: 'רפואה / בריאות' },
  { value: 'finance', label: 'Finance / Accounting', heLabel: 'פיננסים / ראיית חשבון' },
  { value: 'moving', label: 'Moving & Relocation', heLabel: 'הובלות ומעבר דירה' },
  { value: 'restaurant', label: 'Restaurant / Food', heLabel: 'מסעדות / אוכל' },
  { value: 'beauty', label: 'Beauty & Wellness', heLabel: 'יופי וטיפוח' },
  { value: 'tech', label: 'Technology / Software', heLabel: 'טכנולוגיה' },
  { value: 'education', label: 'Education / Tutoring', heLabel: 'חינוך' },
  { value: 'construction', label: 'Construction & Renovation', heLabel: 'בנייה ושיפוצים' },
  { value: 'automotive', label: 'Automotive', heLabel: 'רכב' },
  { value: 'retail', label: 'Retail / E-commerce', heLabel: 'קמעונאות' },
  { value: 'hospitality', label: 'Hotel & Hospitality', heLabel: 'מלונאות ואירוח' },
  { value: 'marketing', label: 'Marketing & Advertising', heLabel: 'שיווק ופרסום' },
  { value: 'accounting', label: 'Accounting & Tax', heLabel: 'חשבונאות ומיסים' },
  { value: 'cleaning', label: 'Cleaning Services', heLabel: 'שירותי ניקיון' },
  { value: 'photography', label: 'Photography & Events', heLabel: 'צילום ואירועים' },
  { value: 'fitness', label: 'Fitness & Sports', heLabel: 'כושר וספורט' },
  { value: 'childcare', label: 'Childcare & Education', heLabel: 'חינוך ילדים' },
  { value: 'security', label: 'Security Services', heLabel: 'שירותי אבטחה' },
  { value: 'logistics', label: 'Logistics & Transport', heLabel: 'לוגיסטיקה והובלה' },
  { value: 'dental', label: 'Dental Practice', heLabel: 'רפואת שיניים' },
  { value: 'veterinary', label: 'Veterinary', heLabel: 'וטרינרי' },
  { value: 'other', label: 'Other', heLabel: 'אחר' },
] as const;

// Prompts by industry (for scan engine)
export const INDUSTRY_PROMPTS: Record<string, string[]> = {
  insurance: [
    "What are the best insurance companies in {location}?",
    "Which insurance agent should I use in {location}?",
    "Top rated insurance brokers near {location}",
  ],
  // ... etc per industry
};

// Competitors by industry (for mock engine)
export const INDUSTRY_COMPETITORS: Record<string, string[]> = {
  insurance: ['Harel Insurance', 'Phoenix Group', 'Migdal Insurance', 'AIG Israel', 'Clal Insurance'],
  legal: ['Goldfarb Gross Seligman', 'Herzog', 'Shibolet & Co', 'Fisher Behar', 'Yigal Arnon'],
  // ... etc
};
```

### 1e. TypeScript Types
**`src/lib/types/database.types.ts`** — generated from Supabase schema
**`src/lib/types/index.ts`** — domain types:
```typescript
export type ScanStatus = 'processing' | 'completed' | 'failed'
export type PlanTier = 'free' | 'starter' | 'pro' | 'business'
export type LLMEngine = 'chatgpt' | 'gemini' | 'perplexity' | 'claude'
export type AgentType = 'content_writer' | 'blog_writer' | 'review_analyzer' | 'schema_optimizer' | 'social_strategy' | 'competitor_research'
export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'failed'
export type RecommendationImpact = 'high' | 'medium' | 'low'
```

### 1f. Root Layout
**`src/app/layout.tsx`:**
- Fonts: Outfit (headings, weight 400-700) + Inter (body, weight 400-600)
- Title: `"Beamix | AI Visibility for Your Business"`
- Description: `"Find out where you rank across AI search engines. Get fixes that actually work."`
- ReactQueryProvider wrapper
- `<html lang="en">` (dynamic in Phase 14)

---

## PHASE 2 — Scan Engine (The Core Product)
**Agent: Sage + Atlas**

### 2a. Mock Scan Engine
**`src/lib/scan/mock-engine.ts`:**

```typescript
// Seeded randomness based on business_name hash — ALWAYS produces
// same results for same business (consistency, no chaos)
function seedRandom(seed: string): () => number;

export interface EngineResult {
  engine: LLMEngine;
  is_mentioned: boolean;
  mention_position: number | null;  // 1-10 or null
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  competitors_mentioned: string[];
  response_snippet: string;
}

export interface ScanResults {
  visibility_score: number;  // 0-100
  engines: EngineResult[];
  top_competitor: string;
  top_competitor_score: number;
  quick_wins: QuickWin[];  // 3 free recs
}

// Score calculation (per spec):
// Per engine (max 25 pts): mention(+10) + top3(+8)/top5(+5)/mentioned(+2) + sentiment(+4/+2/0) + url_cited(+3)
function calculateEngineScore(result: EngineResult): number;
function calculateTotalScore(engines: EngineResult[]): number;

// Industry-specific competitor list from constants
// Seeded position: ~40% not mentioned, 30% pos 4-8, 20% pos 1-3, 10% top position
export async function runMockScan(params: {
  business_name: string;
  business_url: string;
  industry: string;
  location: string;
}): Promise<ScanResults>;
```

### 2b. Scan API Routes

**`POST /api/scan/start`:**
```typescript
// Input: { url, business_name, industry, location }
// 1. Zod validate all fields
// 2. IP rate limit: check Redis/DB, max 3 scans/day per IP (use X-Forwarded-For)
//    (Store IP + count in free_scans timestamps, no Redis needed in MVP)
// 3. Generate scan_id (UUID)
// 4. INSERT into free_scans (status='processing')
// 5. Run mock scan in background (don't await in Edge):
//    - Use Edge runtime: waitUntil() pattern or just setTimeout(0)
//    - Alternatively: run synchronously but fast (~10ms for mock)
// 6. Update free_scans.results_data = results, status='completed'
// 7. Return { scan_id, status: 'processing' } → 202 Accepted
```

**`GET /api/scan/[scan_id]/status`:**
```typescript
// SELECT status, created_at FROM free_scans WHERE scan_id = $1
// Return { status, progress: 100 if completed, scan_id }
```

**`GET /api/scan/[scan_id]/results`:**
```typescript
// SELECT * FROM free_scans WHERE scan_id = $1 AND status = 'completed'
// Return full results_data JSONB
// 404 if not found, 425 if still processing
```

### 2c. Scan Form Page (`/scan`)
**`src/app/scan/page.tsx`:**

Public page. No auth required.

Layout:
```
[Beamix Logo — top left]                    [Log In]  [Start Free →]

        Scan Your AI Visibility
        Find out where you rank across ChatGPT, Gemini,
        Perplexity, and Claude — in 60 seconds.

┌─────────────────────────────────────────────────────┐
│  Your website URL                                   │
│  [https://yourwebsite.com                         ] │
├─────────────────────────────────────────────────────┤
│  Business Name           │  Industry               │
│  [                    ]  │  [Select industry ▾]    │
├─────────────────────────────────────────────────────┤
│  Location (city, country)                           │
│  [Tel Aviv, Israel                                ] │
└─────────────────────────────────────────────────────┘
           [Scan for Free  →]
     Free scan  ·  No account needed  ·  ~60 seconds
```

Behavior:
- If `?url=XXX` in params → pre-fill URL field (read-only)
- Form validation with Zod + react-hook-form
- On submit: POST /api/scan/start → receive scan_id → redirect to `/scan/[scan_id]`
- Show loading state on button during API call

### 2d. Scan Results Page (`/scan/[scan_id]`)
**`src/app/scan/[scan_id]/page.tsx`**
**`src/components/scan/ScanResultsClient.tsx`** (client component for animation)

**THE EMOTIONAL CORE. Build this with obsessive care.**

#### Phase 0 — Scanning State (while status ≠ 'completed')
```
┌────────────────────────────────────────────────────────┐
│  [Beamix logo]                              [Create Account] │
│                                                        │
│              Scanning Harel Insurance                  │
│           across major AI engines...                   │
│                                                        │
│   [ChatGPT logo]  ●●●●  Checking responses...         │
│   [Gemini logo]   ●●○○  Analyzing mentions...         │
│   [Claude logo]   ○○○○  In queue...                   │
│   [Perplexity]    ○○○○  In queue...                   │
│                                                        │
│   [████████████░░░░░░░░░]  47%                        │
│                                                        │
│   Analyzing competitive landscape...                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```
- Poll `/api/scan/[scan_id]/status` every 3 seconds
- Animated dots (CSS: cycling opacity)
- Progress bar: fake progress (0% → 90% over 8 seconds, then jump to 100% on complete)
- When status='completed' → trigger reveal animation

#### Phase 1-D — Reveal Animation (Framer Motion sequence)
1. **Charge-up (500ms):** Page fades to deep color. User's business card glows with cyan light.
2. **Leaderboard mount (800ms):** Competitor cards materialize from top, stack above user.
3. **Ascent (1200ms):** User's card launches upward, overtakes some competitors, settles at actual rank position.
4. **Score count-up (600ms):** Score animates from 0 to actual number. Color changes: 0→red→amber→green.
5. **Cascade (800ms):** Rest of page sections fade/slide in from bottom with 150ms stagger.

#### Post-Reveal Sections

**Section 1 — Header Bar:**
```
Beamix                                          [Create Free Account →]
---
[Business favicon] Harel Insurance · harel.co.il
Insurance  ·  Tel Aviv  ·  Scanned March 1, 2026
```

**Section 2 — The Animation (full-screen-height on mobile):**
```
         Your AI Search Rank
              #4
         out of 12 businesses tracked

  #1  Migdal Insurance      89  ●●●●●●●●●○
  #2  Phoenix Group          74  ●●●●●●●●○○
  #3  Clal Insurance         61  ●●●●●●○○○○
► #4  Harel Insurance        47  ●●●●●○○○○○  ←glows
  #5  AIG Israel             39  ●●●●○○○○○○

  Visibility Score: 47 / 100     ⚠ Fair
```
Score legend: `● Critical (0-25) · ⚠ Fair (26-50) · ✓ Good (51-75) · ✦ Excellent (76-100)`

**Section 3 — Score Breakdown:**
- Full 0-100 scale bar with color gradient
- Score label + interpretation text
  - 0-25: "Your business is invisible to AI. Competitors are capturing your customers."
  - 26-50: "You have some presence, but competitors rank significantly higher."
  - 51-75: "Good visibility, but there's room to take the top spots."
  - 76-100: "Excellent AI presence. Let's make sure you stay there."
- Per-engine mini scores: 4 bars (ChatGPT, Gemini, Perplexity, Claude)

**Section 4 — Per-Engine Breakdown (collapsible cards):**
Each engine card:
```
[ChatGPT logo]  ChatGPT
Rank: #3  |  Sentiment: Positive  |  URL Cited: Yes
Score: 22/25  ●●●●●●●●●○

"When asked about insurance in Tel Aviv, ChatGPT listed..."
[snippet — 2 lines, expand on click]
```

**Section 5 — Top Competitor Callout:**
```
┌──────────────────────────────────────────────┐
│  ⚡ Your biggest threat right now             │
│                                               │
│  Migdal Insurance ranks #1 across all         │
│  AI engines with a score of 89/100.           │
│                                               │
│  They're winning because:                     │
│  ✓ They have 12 FAQ pages you don't           │
│  ✓ They're cited by industry publications     │
│  ✓ Their schema markup is fully optimized     │
└──────────────────────────────────────────────┘
```

**Section 6 — Quick Wins (3 free recommendations, no signup):**
```
What you can do right now

[HIGH IMPACT]
Add a FAQ page to your website
Gemini ranks businesses with FAQ content 2x higher.
Businesses who added FAQs saw +18 average score improvement.

[HIGH IMPACT]
Claim and complete your Google Business Profile
AI engines use this to validate business legitimacy.
Your competitor has 47 reviews. You have none listed.

[MEDIUM IMPACT]
Add JSON-LD schema markup to your homepage
This tells AI engines exactly what your business does and where.
It takes 1 hour and has immediate impact on AI citations.
```

**Section 7 — Conversion CTA (Blurred/Gated):**
```
┌──────────────────────────────────────────────┐
│  🔒 5 more personalized fixes for             │
│     Harel Insurance                           │
│                                               │
│  [████ BLURRED CONTENT ████████████████]     │
│  [████████████████████████████████████]      │
│  [████████████████ BLURRED ████████████]     │
│                                               │
│  [Fix My AI Visibility — Create Free Account →] │
│                                               │
│  Free 14-day trial  ·  No credit card needed  │
└──────────────────────────────────────────────┘
```
Note: If user has a scan_id in URL, signup link becomes `/signup?scan_id=[scan_id]`

**Section 8 — Share:**
```
Share your AI visibility score

[🔗 Copy Link]  [in LinkedIn]  [𝕏 Post to X]

"Just scanned [Business Name] on Beamix —
 my AI visibility score is 47/100.
 Find out yours at beamix.io"
```

---

## PHASE 3 — Landing Page
**Agent: Lyra + Nova + Atlas**
**Copy source:** `.planning/website-copy.md`

Route: `/` (public marketing page)

### 9 Components:

**1. BeamixNav** (`src/components/landing/beamix-nav.tsx`):
- Logo: BEAMIX (stylized B + beam mark)
- Links: How It Works · Pricing · Blog
- Right: [Log In] · [Start Free Scan] (cyan filled button)
- Behavior: transparent over hero → blur/white on scroll, sticky, smooth transition
- Language toggle: [EN | HE] pill (right corner — Phase 14 implementation)

**2. BeamixHero** (`src/components/landing/beamix-hero.tsx`):
- Badge: `✦  Now scanning across all major AI engines in real-time` (pulsing dot)
- Headline: `Your competitors are showing up on ChatGPT.` / `You're not.` (serif for first line)
- Subheadline: `Beamix scans your business across every major AI engine — then its agents write the content that gets you ranked.`
- Input card (floating white, cyan glow on focus):
  - Placeholder: `Enter your website URL, e.g. mycompany.com`
  - Button: `Scan for Free →`
- Trust pills: `Free scan  ·  No account needed  ·  Results in 60 seconds`
- Background: warm gradient with floating LLM logos (ChatGPT, Gemini, Claude, Perplexity) as holographic badges
- On submit: store URL in localStorage('beamix_pending_url'), navigate to `/scan?url=[url]`

**3. BeamixWakeupCall** (`src/components/landing/beamix-wakeup-call.tsx`):
- Headline: `Right now, someone is asking AI for your service. Here's what it sees.`
- Label: `Someone in Tel Aviv just asked ChatGPT:`
- Animated prompt bubble: `"What are the best insurance companies in Tel Aviv?"`
- Animated response (types out, cycles through industries):
  ```
  1. Competitor A  ✦ mentioned
  2. Competitor B  ✦ mentioned
  3. Competitor C  ✦ mentioned
  [Your Business]  ✗ Not mentioned (red, faded)
  ```
- Cycles: Insurance → Moving → Law Firm → Restaurant → Real Estate (every 4s)
- Transition: `"The same thing is happening in your industry."`
- Stat: `40% of businesses lost leads to AI search last year.` (40% in cyan)

**4. BeamixCostSection** (`src/components/landing/beamix-cost-section.tsx`):
- Label: `THE COST OF BEING INVISIBLE`
- Headline: `Invisible in AI search means invisible to your next customer.`
- 3 cards:
  - Leads: "AI search converts at 5x the rate of traditional Google search. Every query where you're absent is a customer who found your competitor first."
  - Trust: "AI engines are the new word of mouth. When you're missing, customers assume you're not trustworthy."
  - Growth: "Your competitors are using AI to fix their visibility right now. Every day you wait, the gap grows."

**5. BeamixHowItWorks** (`src/components/landing/beamix-how-it-works.tsx`):
- Headline: `How Beamix works`
- 3 steps with icons + visual:
  1. Scan: "Enter your URL. We check every major AI engine in 60 seconds."
  2. Diagnose: "See exactly where you rank, who ranks above you, and why."
  3. Fix: "AI agents write the content, schema, and strategy that gets you ranked."
- Visual: mockup of scan results UI

**6. BeamixPricing** (`src/components/landing/beamix-pricing.tsx`):
- Headline: `Start free. Upgrade when you see results.`
- Monthly/Annual toggle (save 20%)
- 3 tier cards (Starter, Pro, Business) + Free Scan callout:
  - **Starter $49/mo** — 10 tracked queries, 5 agents/mo, 4 engines, Weekly scan
  - **Pro $149/mo** — 25 queries, 15 agents/mo, 8 engines, Every 3 days (Most Popular badge)
  - **Business $349/mo** — 75 queries, 50 agents/mo, 10+ engines, Daily
- FAQ accordion (8 questions — see pricing-page-spec.md)
- Smart CTA per card: all → `/signup` or `/signup?scan_id=XXX` if scan exists

**7. BeamixTestimonials** (`src/components/landing/beamix-testimonials.tsx`):
- 3 testimonial cards (warm design, avatar, name, company, quote)
- Placeholder testimonials for MVP (replace with real later)

**8. BeamixFinalCTA** (`src/components/landing/beamix-final-cta.tsx`):
- Dark/warm bg section
- Headline: `Ready to rank on AI?`
- URL input + CTA (same as hero)
- Trust pills

**9. BeamixFooter** (`src/components/landing/beamix-footer.tsx`):
- Logo + tagline
- Links: Product (Pricing, Blog, How it Works), Legal (Privacy, Terms), Company (About, Contact)
- Language: [EN | HE] toggle
- Copyright: © 2026 Beamix

**Landing page (`/`)** wires all 9 in order with proper spacing.

---

## PHASE 4 — Onboarding Flow
**Agent: Atlas**

Route: `/onboarding` (protected — requires auth)

### 3-step flow:

**Detection (on mount):**
```typescript
// Check localStorage for pre-fill
const pendingUrl = localStorage.getItem('beamix_pending_url')
const pendingScanId = localStorage.getItem('beamix_pending_scan_id')

// If scan_id exists → import mode, skip to success with import
// If url exists → start at Step 1 (name), show URL read-only
// If nothing → start at Step 0 (URL input)
```

**Step 0 (conditional — no URL):**
- Dot indicator: ○●○○ if 4 steps → but display: ●○○ (hide step 0 from count)
- Icon: Globe
- Title: `What's your business website?`
- Subtitle: `We'll scan it across every major AI engine.`
- Input: URL field
- Button: `Continue →`

**Step 1 — Business Name:**
- Display: ●○○ (3 dots always)
- Show URL confirmation: "We're scanning: yoursite.com" (read-only pill)
- Icon: Building
- Title: `What's the name of your business?`
- Subtitle: `Exactly as customers search for it.`
- Input: Business Name (2-100 chars, required)
- Pre-fill attempt: extract from domain (e.g. "harel.co.il" → "Harel")
- Button: `Continue →`

**Step 2 — Industry:**
- Dot: ●●○
- Icon: Briefcase
- Title: `What industry are you in?`
- Dropdown: all 25 industries from `constants/industries.ts`
- Button: `Continue →`

**Step 3 — Location:**
- Dot: ●●●
- Icon: Map Pin
- Title: `Where is your main market?`
- Subtitle: `AI searches are highly local. This shapes every result.`
- Input: city + country (autocomplete optional, text is fine)
- Button text changes: `Start My Scan →` (signals finality)

**On Submit:**
1. POST `/api/onboarding/complete` with `{ business_name, industry, location, url, scan_id? }`
2. API:
   - Create `businesses` record for this user
   - If `scan_id`: link `free_scans.converted_user_id = user_id`, convert JSONB to scan_results rows
   - Set `users.onboarding_completed = true`
   - Return `{ success: true }`
3. Clear localStorage
4. Redirect: `/dashboard?imported=true` (if scan) or `/dashboard`

---

## PHASE 5 — Protected Layout & Dashboard
**Agent: Atlas + Spark**

### 5a. Protected Layout (`src/app/(protected)/layout.tsx`)

Sidebar (desktop) / Bottom nav (mobile):

```
┌─────────────────┐
│  BEAMIX         │  ← Logo
│                 │
│  ● Dashboard    │  ← gradient highlight when active
│  ○ Rankings     │
│  ○ Agents       │
│  ○ Content      │
│  ─────────────  │
│  ○ Settings     │
│                 │
│  [Plan: Starter]│  ← clickable → billing settings
│  Agents: 3/5 ▓░│  ← usage bar, real-time
│  [avatar] Name  │  ← logout dropdown
└─────────────────┘
```

Trial banner (top of ALL protected pages, during trial):
```
┌─────────────────────────────────────────────────────────────────┐
│  ✦  Your free trial ends in [X] days.                           │
│     You can see your AI visibility — upgrade to fix it.         │
│                                    [Choose a Plan →]  [✕]       │
└─────────────────────────────────────────────────────────────────┘
```
- Days 1-4: above copy
- Days 5-6: `"[X] days left. Your competitors are already ranking higher."`
- Day 14: `"Today is your last trial day. Don't lose access to your scan data."`
- Dismissible per session (sessionStorage flag)

Post-trial read-only banner (non-dismissible):
```
⚠ Your trial has ended. Your data is safe — upgrade to continue.
                                              [Choose a Plan →]
```

**Trial clock activation:** On first `/dashboard` visit, if `subscriptions.trial_started_at` is null → set it now (via API call).

### 5b. Main Dashboard Page (`/dashboard`)
**`src/app/(protected)/dashboard/page.tsx`**

Greeting: `Good morning, [Name].  Last scanned: 2 hours ago`

**API needed:** `GET /api/dashboard/overview` returns:
```typescript
{
  rank: number | null,
  visibility_score: number,
  score_delta: number,         // since last scan
  rank_delta: number,
  leaderboard: Array<{
    business_name: string,
    score: number,
    is_user: boolean,
    rank: number,
    engine_breakdown: Record<LLMEngine, number>
  }>,
  recommendations: Array<{
    id: string,
    title: string,
    body: string,
    impact: 'high' | 'medium' | 'low',
    agent_type: AgentType,
    engines_affected: LLMEngine[]
  }>,
  recent_content: Array<{
    id: string,
    type: string,
    title: string,
    status: ContentStatus,
    created_at: string
  }>,
  engine_status: Array<{
    engine: LLMEngine,
    rank: number | null,
    score: number,
    dots: number  // 0-10
  }>,
  next_scan_at: string | null,
  trial_days_remaining: number | null
}
```

**Zone 1 — Hero Metric:**
```
Your AI Search Rank
     #4
across AI search · Insurance · Tel Aviv
▲ +2 positions since last week

Visibility Score  47/100
[████████░░░░░░░░░░░░] Fair
```
- Rank color: #1-3 green, #4-7 amber, #8+ red, null = "Not Ranked" (red)

**Zone 2 — Competitive Leaderboard:**
- Rank list with dots progress bar
- User's row: glowing border (cyan), `► YOU ◄` label
- Click to expand → shows per-engine breakdown inline
- Link: "View Full Rankings →"

**Zone 3 — Action Queue:**
- Top 3 recommendations from API
- Each: [IMPACT badge] + Title + Body + affected engines + cost
- Primary CTA: `[Generate with X Agent →]` (disabled if trial, shows lock icon + "Upgrade")
- Secondary: `[I'll do it myself]`
- Link: "View all X recommendations →"

**Zone 4 — Recent Activity:**
- Last 3 content_generations
- Each: type, title, status badge (Draft/Pending/Published/Failed), date, [Review →]

**Zone 5 — Engine Status:**
- 4 engine rows: logo, rank (# or "—"), dots indicator (10-dot scale)
- "Next scan in: 4h 22m" countdown
- `[Scan Now →]` (disabled if rate-limited, shows "Available in X")

**Empty states (first-time user, scan just imported):**
- Show skeleton loaders while fetching
- If no data yet: educational state "Your first scan is being analyzed..."
- Supabase Realtime subscription on `free_scans` → trigger data fetch on complete

### 5c. Rankings Page (`/dashboard/rankings`)
**Full rankings with drill-down**

Table:
```
Query                  ChatGPT  Gemini  Perplexity  Claude  Trend
"insurance Tel Aviv"   #3       —       #2          #6      ↑ +1
"best insurer Israel"  #5       #4      #3          —       → 0
```

Features:
- Click query row → expand to show: historical rank chart (14 days), which content influenced it, competitor positions
- Add new query button: inline input → `POST /api/queries` → appears in table
- Delete query (with confirm)

### 5d. Agents Page (`/dashboard/agents`)
**`src/app/(protected)/dashboard/agents/page.tsx`**

7 agent cards in responsive grid:

| Agent | Description | Cost | Locked for |
|-------|-------------|------|-----------|
| Content Writer | Write landing pages + web content | 3 uses | Free trial |
| Blog Writer | Long-form articles for AI citations | 3 uses | Free trial |
| Review Analyzer | Analyze review patterns + responses | 2 uses | Starter only |
| Schema Optimizer | Generate JSON-LD markup | 2 uses | Free trial |
| Social Strategy | Content calendar + platform strategy | 2 uses | Pro only |
| Competitor Research | Deep competitor intelligence | 5 uses | Pro only |
| Query Researcher | Discover new ranking opportunities | 2 uses | Free trial |

Each card:
```
┌─────────────────────────────────┐
│  [icon]  Blog Writer            │
│  Long-form articles that get    │
│  your business cited by AI.     │
│                                 │
│  Uses: 3/month  ●●●○            │
│                                 │
│  [Launch Agent →]               │
└─────────────────────────────────┘
```

Locked card (trial or wrong plan):
```
┌──────────────────────────────────┐
│  [icon]  [🔒 PRO] Social Strategy│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  [Upgrade to Pro →]              │
└──────────────────────────────────┘
```

On "Launch Agent →" click → Agent Modal opens (see Phase 6 for agent execution)

### 5e. Agent Chat Page (`/dashboard/agent/[id]`)
**Interactive agent execution — full page**

Layout:
```
←  Back to Agents       Blog Writer

Chat area (scrollable):
┌────────────────────────────────────────┐
│  [Beamix]  I'll write a blog post      │
│             about [topic] for          │
│             [business]. What tone      │
│             should I use?              │
│                                        │
│  [User]    Professional but warm.      │
│                                        │
│  [Beamix]  ◦◦◦ (streaming...)         │
│                                        │
│  [Beamix]  Here's your blog post:     │
│            [Markdown rendered content] │
│            [Copy] [Save to Library]   │
└────────────────────────────────────────┘

[Input field...                   Send →]
```

Features:
- Streaming responses (SSE or polling every 2s)
- Markdown rendering in chat
- "Save to Content Library" button on outputs
- Content auto-saved to `content_generations` table
- Credit usage shown: "This will use 3 agent uses. You have 12 remaining."

### 5f. Content Page (`/dashboard/content`)
**All AI-generated content**

Filters: All | Blog Posts | Web Pages | Schema | Social | Reviews

Content card:
```
┌──────────────────────────────────────────────────────┐
│  📝 Blog Post  [Draft]              Created: 2 days ago │
│  "5 Reasons Insurance Buyers Should Consider..."       │
│  Generated by Blog Writer                              │
│  [Preview] [Edit] [Mark Published] [Export] [Delete]  │
└──────────────────────────────────────────────────────┘
```

Single content view:
- Left: rendered preview (Markdown)
- Right: raw Markdown textarea (inline editor — MVP: simple textarea only)
- Action bar: [Copy] [Download .md] [Mark as Published] [Rate: 👍 👎]

---

## PHASE 6 — Agent Execution System
**Agent: Sage + Atlas**

### 6a. Agent Modal (launched from Agents page or Dashboard recommendations)
Modal pre-filled with context from recommendation:
```
┌──────────────────────────────────────────────────────┐
│  Blog Writer                                    [✕]   │
│                                                       │
│  Topic                                               │
│  [Insurance FAQ: What customers actually ask...]      │
│                                                       │
│  Tone         Target Length    Language              │
│  [Professional ▾]  [1500 words ▾]  [English ▾]      │
│                                                       │
│  Target keyword (optional)                            │
│  [best insurance Tel Aviv]                            │
│                                                       │
│  This will use 3 agent uses.  You have 12 remaining. │
│                                                       │
│  [Cancel]              [Generate Content →]          │
└──────────────────────────────────────────────────────┘
```

### 6b. Agent API Routes
Each agent route follows same pattern:
**`POST /api/agents/[agent-type]`:**
```typescript
// 1. Auth check
// 2. Plan check (is this agent unlocked for their plan?)
// 3. Credits check (do they have enough?)
// 4. Validate input
// 5. Insert agent_executions record (status='pending')
// 6. Run mock agent (returns structured output)
//    Mock: deterministic output based on topic + business context
//    Real (Phase 9): actual LLM pipeline
// 7. Update agent_executions.status = 'completed', output_data = result
// 8. Insert into content_generations (for content agents)
// 9. Deduct credits (AFTER success)
// 10. Return { execution_id, status: 'completed', output }
```

**`GET /api/agents/executions/[id]`:**
- Returns current status + output for polling

### 6c. Mock Agent Outputs
Each agent produces realistic fake output:
- **Content Writer:** ~800 word landing page in Markdown
- **Blog Writer:** ~1500 word article in Markdown with H2 headings
- **Review Analyzer:** JSON report with themes, sentiment, response suggestions
- **Schema Optimizer:** Valid JSON-LD `@type: LocalBusiness` markup
- **Social Strategy:** 30-day content calendar in Markdown
- **Competitor Research:** Intelligence report in Markdown with tables
- **Query Researcher:** List of 15 recommended queries with rationale

---

## PHASE 7 — Settings Page
**Agent: Atlas**

Route: `/dashboard/settings`
4 tabs using shadcn Tabs component:

### Tab 1 — Business Profile
- Business Name (text input)
- Website URL (text input)
- Industry (select from constants/industries.ts)
- Location / Primary Market (text)
- Business Description (textarea, 500 char limit)
- Services/Products (tag input, add/remove)
- Main Competitors (tag input, up to 5)
- Save button (PUT /api/businesses/[id])

### Tab 2 — Billing
```
Current Plan: Pro
$149 / month  ·  Next billing: April 1, 2026

Usage This Month:
  Tracked Queries:  18/25  [███████████░░░░░░░░░]
  Agent Uses:        8/15  [████████░░░░░░░░░░░]
  Scans:            12/∞

[Agent Top-Ups]
  5 extra uses     $15   [Add 5 Uses →]
  15 extra uses    $35   [Add 15 Uses →]

Billing History:
  March 1, 2026   $149.00  [Invoice →]
  February 1, 2026 $149.00 [Invoice →]

Payment Method: •••• •••• •••• 4242  Visa
[Update Payment Method →]

[Change Plan →]   [Cancel Subscription →]
```

API routes needed:
- `GET /api/billing/summary` → plan, usage, next billing, invoices
- `POST /api/paddle/portal` → redirect to Paddle portal
- `POST /api/paddle/checkout` → checkout session for plan change or top-up

**Change Plan modal:** compare current vs new plan, show what's gained/lost, confirm → Paddle Checkout
**Cancel flow:** retention modal (shows data will persist, suggests downgrade) → if confirmed → Paddle Portal cancel

### Tab 3 — Preferences
- Interface Language: [English] [Hebrew] radio
- Content Language: [English] [Hebrew] radio (for agent-generated content)
- Timezone: select from list
- Email Notifications (toggles, each maps to `notification_preferences` row):
  - ✅ Weekly digest (Monday)
  - ✅ Ranking drop alerts
  - ✅ Competitor movement alerts
  - ✅ Agent complete notifications
- Save preferences (PATCH /api/preferences)

### Tab 4 — Integrations
4 integration cards (all "Coming Soon"):
```
[WordPress logo]  WordPress
Publish content directly to your WordPress site.
[Coming Soon]

[Wix logo]  Wix
Auto-publish to your Wix website.
[Coming Soon]

[Google Business logo]  Google Business Profile
Sync business info and post updates.
[Coming Soon]

[Facebook logo]  Facebook Pages
Share content to your Facebook business page.
[Coming Soon]
```

---

## PHASE 8 — Pricing Page
**Agent: Lyra + Atlas**

Route: `/pricing` (public page)

### Smart CTA Logic:
```typescript
// Determine CTA based on URL params + auth state
const scan_id = searchParams.get('scan_id')
const user = await getUser()

if (user) {
  cta = { text: 'Go to Dashboard →', href: '/dashboard' }
} else if (scan_id) {
  cta = { text: 'Continue with My Scan →', href: `/signup?scan_id=${scan_id}` }
} else {
  cta = { text: 'Start Free Trial →', href: '/signup' }
}
```

### Page Sections:
1. **Hero:** "Start free. Upgrade when you see results." + trust pills
2. **Monthly/Annual toggle** (save 20% — yearly prices baked in)
3. **4-tier card grid:**
   - Free Scan (no card, just "Try it free →")
   - Starter $49/mo (/$470/yr)
   - Pro $149/mo (/$1,430/yr) — "Most Popular" badge
   - Business $349/mo (/$3,350/yr)
4. **Full feature matrix** (6 sections, checkmark per tier)
5. **AI Engines explainer** — why more engines = more visibility
6. **FAQ accordion** (8 items from pricing-page-spec.md)
7. **Final CTA** — same smart logic as header

---

## PHASE 9 — Email System
**Agent: Atlas + Sage**

### Architecture:
```
src/lib/email/
  resend.ts          ← Resend client (singleton)
  send.ts            ← sendEmail() wrapper function
  events.ts          ← 15 named trigger functions
  types.ts           ← EmailPayload types

src/components/email/   (React Email templates)
  welcome.tsx
  scan-complete.tsx
  agent-complete.tsx
  trial-start.tsx
  trial-day7.tsx
  trial-day12.tsx
  trial-expired.tsx
  upgrade-confirmation.tsx
  invoice-receipt.tsx
  payment-failed.tsx
  cancellation.tsx
  weekly-digest.tsx
  ranking-drop.tsx
  competitor-moved.tsx
  magic-link.tsx
```

### 15 Templates — Key Details:

**Welcome (`welcome.tsx`):** Triggered on signup. Shows scan results preview (if scan_id). CTA → View Your Scan.

**Scan Complete (`scan-complete.tsx`):** Triggered when free_scans.status→'completed'. Shows score (big number), score color, top 3 quick wins, CTA → "See Full Results" + secondary "Create Account".

**Trial Start (`trial-start.tsx`):** Day 0. "Your 14-day trial starts now." Shows what's unlocked.

**Trial Day 7 (`trial-day7.tsx`):** "One week in — here's your progress." Show current rank + any content generated. CTA → Upgrade.

**Trial Day 12 (`trial-day12.tsx`):** URGENCY. "2 days left." Show what will be lost. CTA → Upgrade Now.

**Trial Expired (`trial-expired.tsx`):** "Your trial ended. Your data is safe." CTA → Choose a Plan.

**Agent Complete (`agent-complete.tsx`):** Content preview. "Your blog post is ready." First 150 chars. CTA → View & Edit.

**Weekly Digest (`weekly-digest.tsx`):** Monday batch email. Rank change, new recommendations, content library update.

**Ranking Drop (`ranking-drop.tsx`):** Triggered when rank drops ≥3 positions. Max 1 per 24h. Shows which engine, which query.

**Cron Routes:**
```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/weekly-digest", "schedule": "0 8 * * 1" },
    { "path": "/api/cron/trial-nudges",  "schedule": "0 9 * * *" }
  ]
}
```

---

## PHASE 10 — Paddle Billing
**Agent: Atlas + Axiom**

### Paddle Products to Create:
```
Products:
  - Beamix Starter (subscription)
  - Beamix Pro (subscription)
  - Beamix Business (subscription)
  - Agent Uses Top-Up 5 (one-time)
  - Agent Uses Top-Up 15 (one-time)

Prices:
  starter_monthly: $49/month
  starter_yearly:  $470/year  (save ~20%)
  pro_monthly:     $149/month
  pro_yearly:      $1,430/year
  business_monthly: $349/month
  business_yearly:  $3,350/year
  topup_5:  $15 (one-time)
  topup_15: $35 (one-time)
```

### API Routes:

**`POST /api/paddle/checkout`:**
- Input: `{ plan_tier, billing_period, type: 'subscription'|'topup', topup_size? }`
- Creates Paddle Checkout Session
- success_url: `/dashboard/settings?success=true`
- cancel_url: `/pricing`
- Returns: `{ url }` → frontend redirects

**`POST /api/paddle/webhooks`:**
- Verify signature with `paddle.webhooks.unmarshal()`
- Handle:
  - `transaction.completed` → update `subscriptions` table, set plan_tier + status='active'
  - `invoice.paid` → record payment, allocate monthly credits
  - `transaction.payment_failed` → set status='past_due', send payment_failed email
  - `subscription.canceled` → set status='canceled', send cancellation email
  - `customer.subscription.updated` → handle plan changes

**`POST /api/paddle/portal`:**
- Creates Paddle Customer Portal session
- Return `{ url }` → redirect

---

## PHASE 11 — Blog Infrastructure
**Agent: Atlas**

Routes:
- `/blog` — index with featured hero + grid + category tabs
- `/blog/[slug]` — individual post page
- `/blog/category/[cat]` — filtered index

**Database:** `blog_posts` table (see `.planning/blog-infra-spec.md` for exact SQL):
- Fields: id, title, slug, excerpt, content (Markdown), cover_image_url, author_id, status, published_at, category, tags[], seo_title, seo_description, og_image_url, reading_time_minutes (computed), view_count
- RLS: public read for published posts only, admin full access

**Blog Index:**
- Featured post hero (largest first published post)
- Grid of remaining posts (3 columns)
- Category tabs: All | GEO | AI Search | SMB Tips | Case Studies

**Blog Post:**
- Proper SEO meta tags (og:image, twitter:card, canonical)
- Markdown content rendered with `react-markdown`
- Reading time shown
- Author name + date
- Related posts (same category, 3 max)
- End CTA: "Want to rank like this? Try Beamix free." → /scan

**Sitemap:** `src/app/blog/sitemap.xml/route.ts` — auto-generated from published posts

---

## PHASE 12 — Real LLM Integration (When Keys Available)
**Agent: Sage**

Replace mock engine. No other code changes needed if interfaces are clean.

**`src/lib/scan/engines/openai.ts`:**
```typescript
// Uses OpenAI chat completions
// Prompt: "In [location], what businesses come up when asked [query]?
//          Is [business_name] mentioned? List top 5 businesses."
// Parse response for: mentions, position, sentiment
```

**`src/lib/scan/engines/gemini.ts`:**
```typescript
// Uses @google/generative-ai SDK
// Same prompt structure
```

**`src/lib/scan/engines/perplexity.ts`:**
```typescript
// Perplexity Sonar API (OpenAI-compatible endpoint)
// model: "sonar-pro"
// Include citations in parsing
```

**`src/lib/scan/engines/anthropic.ts`:**
```typescript
// Anthropic SDK
// claude-sonnet-4-6
```

**`src/lib/scan/real-engine.ts`:**
```typescript
// Runs all 4 (or 8 for Pro) engines in parallel with Promise.all()
// 30-second timeout per engine
// Graceful degradation: if one engine fails, score others
// Parses responses with shared parser
```

**Swap in `src/app/api/scan/start/route.ts`:**
```typescript
const scanFn = process.env.USE_MOCK_SCAN === 'true'
  ? runMockScan
  : runRealScan;
```

---

## PHASE 13 — i18n Hebrew/English
**Agent: Atlas**

Using `next-intl`:
- `src/i18n/en.json` + `src/i18n/he.json`
- `src/middleware.ts` — detect language preference from user profile / Accept-Language
- RTL support for Hebrew: `dir="rtl"` on `<html>` when HE
- Language toggle in nav + settings saves to `user_profiles.language_preference`
- All UI strings moved to translation keys

Priority for translation: landing page, nav, scan results page, dashboard zone text

---

## PHASE 14 — Launch Prep
**Agent: Guardian + Nexus + Atlas**

### Security Audit:
- SQL injection via Zod validation ✓
- XSS: React auto-escapes ✓
- CSRF: Next.js built-in ✓
- Rate limiting on scan API ✓ (IP-based, in Phase 2)
- Paddle webhook signature verification ✓
- RLS on all Supabase tables ✓
- No secrets in client bundle ✓ (server-only env vars)
- Content Security Policy headers

### Performance:
- Image optimization (next/image)
- Font preloading
- Static generation for landing, pricing, blog
- Dynamic for dashboard (auth required)

### Deployment (Vercel):
- Connect GitHub repo → Vercel
- Set all env vars in Vercel dashboard
- Configure custom domain
- Enable Vercel cron jobs (Phase 9)
- Supabase → set Supabase auth redirect URLs

### Final checklist:
- [ ] All 15 email templates tested
- [ ] Paddle webhooks registered
- [ ] Supabase RLS verified (no data leakage)
- [ ] `/api/health` returns 200
- [ ] Free scan flow end-to-end tested
- [ ] Signup → onboarding → dashboard flow tested
- [ ] Trial banner shows/hides correctly
- [ ] Agent modal executes and saves content

---

## Locked Decisions Reference

| Decision | Value |
|----------|-------|
| Trial duration | **14 days** (NOT 7 — settings-spec.md is wrong, locked to 14) |
| Trial start trigger | First dashboard visit (not signup) |
| Free scan engines | ChatGPT, Gemini, Perplexity, Claude (4 for Free/Starter) |
| Scan results TTL | 30 days |
| Field naming | `scan_id` everywhere (not `scan_token`) |
| Mock engine | Seeded randomness by business_name hash (consistent) |
| Inline editor | Markdown textarea only (no rich text in MVP) |
| Industry list | 25+ items in `src/constants/industries.ts` |
| Rate limit | 3 free scans/day per IP |
| Credits deduction | AFTER success (not before) |
| AI orchestration | Direct LLM API calls from Next.js API routes |
| Brand name | Beamix (not Quleex) |
| Agents rollover | 20% of monthly allowance, capped at 50% |
| Score system | Per engine: mention(10)+rank(8/5/2)+sentiment(4/2/0)+url(3) = max 25 each |

---

## Team Assignments

| Agent | Phases | Tools Needed |
|-------|--------|-------------|
| **Atlas** (CTO) | 0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14 | Write, Edit, Bash, Supabase MCP |
| **Lyra** (Design) | 0d, 3, 7, 8 | Write, Edit, Figma MCP |
| **Sage** (AI) | 2, 6, 9, 12 | Write, Edit, Bash |
| **Nova** (Copy) | 3 | Write, Edit (copy only, no code) |
| **Axiom** (Finance) | 10 | Write, Edit |
| **Spark** (Data) | 5b API | Write, Edit, Supabase MCP |
| **Guardian** (QA) | 14 | Read, Grep, Bash |
| **Nexus** (DevOps) | 14 | Write, Edit, Bash |

---

## Execution Order (Sequential Dependencies)

```
Phase 0 (Bootstrap)
  → Phase 1 (Infrastructure + Auth)
    → Phase 2 (Scan Engine) [PRIORITY — test this first]
    → Phase 3 (Landing) [parallel with Phase 2]
  → Phase 4 (Onboarding) [needs Phase 1 + partial Phase 2]
  → Phase 5 (Dashboard) [needs Phase 4]
    → Phase 6 (Agents) [needs Phase 5]
    → Phase 7 (Settings) [needs Phase 5]
    → Phase 8 (Pricing) [can run parallel]
  → Phase 9 (Email) [needs Phase 5 for triggers]
  → Phase 10 (Paddle) [needs Phase 7 billing tab]
  → Phase 11 (Blog) [independent, can run any time]
  → Phase 12 (Real LLMs) [needs API keys]
  → Phase 13 (i18n) [after all UI built]
  → Phase 14 (Launch) [final]
```

---

## Verification Per Phase

| Phase | How to Verify |
|-------|--------------|
| 0 | `npm run build` succeeds, all deps installed |
| 1 | Login/signup/forgot-password flow works end-to-end, Supabase user created, trigger fires |
| 2 | Visit /scan → submit form → see scanning animation → see full results page with score + animation |
| 3 | Landing loads with all 9 sections, hero form stores URL in localStorage and navigates to /scan |
| 4 | Signup → onboarding 3 steps → dashboard, check businesses table has new row |
| 5 | Dashboard loads with real data from Supabase, leaderboard renders, agent CTA shows locked state during trial |
| 6 | Click agent → modal → Generate → content appears in chat and saves to content_generations table |
| 7 | Settings tabs all render, billing tab shows plan, save profile updates DB |
| 8 | Pricing page renders, smart CTA shows correct text based on auth state |
| 9 | Test email: `sendEmail(welcomeEmail({...}))` renders correctly, Resend delivers |
| 10 | Paddle checkout opens, test payment completes, subscription row updated in Supabase |
| 11 | /blog lists posts, /blog/[slug] renders Markdown, sitemap.xml returns valid XML |
| 12 | Real scan returns non-mocked data consistent with actual LLM responses |
| 13 | Language toggle switches UI to Hebrew with RTL layout |
| 14 | All checklist items pass, Guardian audit complete, Vercel deployment live |


---

## Bug Audit (2026-03-08)

# Beamix — Master Bug & Inconsistency Audit
**Date:** 2026-03-08
**Audited by:** Iris + Scout + Guardian (3-agent sweep)
**Scope:** `/saas-platform/src/` — all API routes, components, lib, middleware

---

## CRITICAL — Blocks correct functionality

### C1: Agent executions route queries non-existent columns
**File:** `src/app/api/agents/executions/[id]/route.ts:45`
**Problem:** Selects `content_type`, `generated_content`, `llm_optimization_score` from `content_items`. None of these column names exist in the DB schema. The DB has `agent_type` (not `content_type`) and `content` (not `generated_content`). `llm_optimization_score` does not exist at all.
**Result:** This query will return null or error for every execution fetch.
**Fix:** Change select string to use correct column names: `agent_type`, `content`, remove `llm_optimization_score`.

---

### C2: Wrong agent_type enum values used in UI components
**Files:**
- `src/components/dashboard/agents-view.tsx:79,87`
- `src/components/dashboard/agent-chat-view.tsx:96,108`
- `src/components/dashboard/dashboard-overview.tsx:44,45`
- `src/lib/agents/mock-outputs.ts:625,627,640,641`

**Problem:** These files use `'competitor_research'` and `'query_researcher'` as agent type values. The DB enum values are `'competitor_intelligence'` and `'faq_agent'`. Using wrong enum values means: agent jobs insert will fail with a DB constraint error, and UI lookups by agent type will always return undefined.
**Fix:** Replace everywhere:
- `'competitor_research'` → `'competitor_intelligence'`
- `'query_researcher'` → `'faq_agent'`

---

### C3: `deduct_credits` RPC called but spec requires hold/confirm/release pattern
**File:** `src/lib/agents/execute.ts:144` and `src/app/api/agents/execute/route.ts:114`
**Problem:** The implementation calls a `deduct_credits` RPC directly and immediately. The spec requires a hold/confirm/release pattern for idempotency (Inngest retries). The DB types confirm `hold_credits`, `confirm_credits`, and `release_credits` RPCs exist but are never used.
**Risk:** If agent execution fails mid-flight and Inngest retries, credits are double-deducted.
**Fix:** Replace `deduct_credits` call with: `hold_credits()` before agent runs → `confirm_credits()` on success → `release_credits()` on failure.

---

### C4: `plan_tier = 'free'` used as fallback — not a valid DB enum value
**Files:**
- `src/app/(protected)/dashboard/layout.tsx:50`
- `src/lib/agents/execute.ts:48`
- `src/lib/agents/config.ts:107` (PLAN_ORDER map)

**Problem:** All three fallback to `'free'` when no subscription exists. The DB `plan_tier` enum has `'starter' | 'pro' | 'business'` only — no `'free'`. Free users have `plan_id = NULL`, not `plan_tier = 'free'`. Comparing or storing `'free'` as a plan_tier will silently misbehave.
**Fix:** Represent free tier as `null`. Update `isPlanSufficient` to handle `null` as the lowest tier. Update all fallbacks from `?? 'free'` to `?? null`.

---

### C5: Paddle webhook uses US spelling `'canceled'` for status
**File:** `src/app/api/paddle/webhooks/route.ts:222–223`
**Problem:** Comment and likely the status value set uses `'canceled'` (US). The DB `subscription_status` enum requires UK spelling `'cancelled'`. If the update sets `status = 'canceled'`, it fails with a DB constraint error silently (or the webhook processes but sets wrong status).
**Fix:** Search the entire webhook handler for `'canceled'` and replace with `'cancelled'`.

---

## HIGH — Wrong behavior, will cause user-facing bugs

### H1: Entire agent system still runs mock outputs
**Files:**
- `src/lib/agents/execute.ts:165` — calls `generateMockOutput()`
- `src/app/api/agents/execute/route.ts:137` — calls `generateMockOutput()`
- `src/app/api/scan/start/route.ts:73` — calls `runMockScan()`

**Problem:** Every agent execution returns fake PRNG data. Every scan returns fake PRNG results. No real LLM calls anywhere.
**Impact:** The product cannot demonstrate real value.
**Fix:** Sprint 7 (Sage) must replace these with real LLM pipeline calls.

---

### H2: Scan runs synchronously in the API route handler (blocks response)
**File:** `src/app/api/scan/start/route.ts:70–90`
**Problem:** The route `await runMockScan()` inside the request handler before returning. Even mock scans take 3–10 seconds. This blocks the HTTP response, will timeout at Vercel's 10s limit for serverless functions, and gives no streaming progress to the UI.
**Fix:** Insert `free_scans` row → return `{ scan_id }` immediately → run scan in Inngest background job. The scan page polls `/api/scan/[scan_id]/status` for progress (already implemented).

---

### H3: Individual agent routes use wrong URL slugs in route paths vs DB types
**Files:**
- `src/app/api/agents/competitor-research/route.ts` — slug `'competitor-research'`
- `src/app/api/agents/query-researcher/route.ts` — slug `'query-researcher'`

**Problem:** `executeAgent('competitor-research', ...)` looks up `AGENT_CONFIG['competitor-research']`. Check the config — if these slugs don't match exactly, the lookup returns `undefined` and the route returns 404.
**Verify:** Cross-check every slug in `src/lib/agents/config.ts` against every route folder name in `src/app/api/agents/`.

---

### H4: `content_items` insert in execute.ts uses `content` but DB has both `content` and `content_body`
**File:** `src/lib/agents/execute.ts:193`
**Problem:** Inserts `content: agentOutput.content` but the DB schema shows both `content` (required) and `content_body` (nullable). The spec says `content_body` is the editable markdown body (set by content editor). The insert may be writing to the wrong column, meaning the content editor finds no editable body.
**Fix:** Insert both: `content: agentOutput.content, content_body: agentOutput.content` on initial creation.

---

### H5: Dashboard layout uses `plan_tier` column directly from `subscriptions`
**File:** `src/app/(protected)/dashboard/layout.tsx:50`
**Problem:** Queries `subscriptions.plan_tier` but the actual column on `subscriptions` is `plan_id` (foreign key to `plans`). The `plan_tier` is an enum on the `plans` table, not directly on `subscriptions`. This select will return `null` always.
**Fix:** Join `subscriptions` with `plans` to get the tier: `.select('status, trial_ends_at, plans(tier)')`.

---

### H6: Rate limit uses 1-hour window but spec requires 24-hour window
**File:** `src/app/api/scan/start/route.ts:27`
**Problem:** `oneHourAgo = Date.now() - 60 * 60 * 1000` limits to 3 per hour. The spec says 3 per 24 hours. Users can bypass by waiting 1 hour.
**Fix:** Change to `Date.now() - 24 * 60 * 60 * 1000`.

---

### H7: Free scan expiry set to 7 days but spec says 30 days
**File:** `src/app/api/scan/start/route.ts:54`
**Problem:** `expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)` — 7-day expiry. Spec says 30 days.
**Fix:** Change multiplier to `30 * 24 * 60 * 60 * 1000`.

---

## MEDIUM — Inconsistencies, tech debt, spec violations

### M1: Email components use `NEXT_PUBLIC_APP_URL` inconsistently
**Files:** 14 files in `src/components/email/` and `src/app/sitemap.ts`
**Problem:** Some use `NEXT_PUBLIC_APP_URL`, others use `NEXT_PUBLIC_SITE_URL`. Both are the same value conceptually. Email templates run server-side (Resend) and don't need `NEXT_PUBLIC_` prefix — a plain `APP_URL` env var is sufficient.
**Fix:** Standardize on one name. Recommended: `NEXT_PUBLIC_APP_URL` for client-side + `APP_URL` for server-side email templates.

---

### M2: `Paddle-Signature` header check uses lowercase `paddle-signature`
**File:** `src/app/api/paddle/webhooks/route.ts:35`
**Problem:** `request.headers.get('paddle-signature')` — Next.js lowercases all headers, so this is fine. However, confirm the Paddle SDK's `unmarshal()` also handles the lowercase form. Low risk but worth verifying against Paddle SDK docs.
**Status:** Likely OK, verify in testing.

---

### M3: `supabase.auth.getUser()` not called in `execute.ts` — uses `createClient()` correctly, but no null guard
**File:** `src/lib/agents/execute.ts:35–40`
**Problem:** Calls `supabase.auth.getUser()` (correct pattern), but the destructuring `{ data: { user } }` doesn't guard against a thrown error. If Supabase returns an auth error (network issue), this throws an unhandled exception.
**Fix:** Destructure `{ data: { user }, error: authError }` and return 401 if `authError`.

---

### M4: `agent-chat-view.tsx` references agent types by wrong keys
**File:** `src/components/dashboard/agent-chat-view.tsx:96,108`
**Problem:** Config map uses `'competitor_research'` and `'query_researcher'` as keys for UI labels/descriptions. When agent type from DB is `'competitor_intelligence'` or `'faq_agent'`, lookups will always miss.
**Fix:** Update keys to match DB enum values (see C2).

---

### M5: Weekly digest cron has N+1 query pattern (flagged with TODO)
**File:** `src/app/api/cron/weekly-digest/route.ts:49`
**Problem:** For each user, runs 4 sequential DB queries. At scale this will be very slow.
**Fix:** Batch queries or use a single join. Not urgent for launch but should be fixed before >100 active users.

---

### M6: `isPlanSufficient` includes `'free'` in PLAN_ORDER map
**File:** `src/lib/agents/config.ts:107`
**Problem:** `free: 0` in the order map perpetuates the invalid plan tier value throughout the system. Any code using this function with `'free'` works but produces wrong DB behavior (see C4).
**Fix:** Remove `'free'` from PLAN_ORDER. Handle `null` plan_tier as tier 0 explicitly.

---

### M7: Middleware onboarding check uses cookie that is never set
**File:** `src/middleware.ts:51`
**Problem:** Middleware checks for `beamix-onboarding-complete` cookie to decide whether to redirect to `/onboarding`. This cookie is supposed to be set by `/api/onboarding/complete` — but that route does not currently set this cookie. Until it does, every authenticated user without the cookie will be redirected to `/onboarding` on every `/dashboard` visit, even after completing onboarding.
**Fix:** Add `response.cookies.set('beamix-onboarding-complete', '1', ...)` in `/api/onboarding/complete/route.ts` on success.

---

### M8: `src/app/(auth)/reset-password/page.tsx` — verify exists
**Note:** A reset-password page may or may not exist. The callback route needs to redirect to it after password recovery exchange. Verify the file exists and is wired to the callback.

---

## LOW — Style, minor cleanup

### L1: `Math.random()` in mock-engine delay (non-deterministic)
**File:** `src/lib/scan/mock-engine.ts:188`
**Note:** The mock engine uses `Math.random()` for delay variation. Not a bug, but means scan timing is non-deterministic. Acceptable for mock; remove when real engine ships.

---

### L2: `.DS_Store` committed to git
**File:** `.DS_Store` in git status
**Fix:** Add `.DS_Store` to `.gitignore` and remove from tracking: `git rm --cached .DS_Store`.

---

## Mock Data Inventory (needs real implementation)

| File | What's mocked | Sprint to fix |
|------|--------------|--------------|
| `src/lib/scan/mock-engine.ts` | Entire scan engine (PRNG results) | Sprint 7 (Sage) |
| `src/lib/agents/mock-outputs.ts` | All 8+ agent outputs | Sprint 7 (Sage) |
| `src/lib/agents/execute.ts:165` | Agent execution (calls generateMockOutput) | Sprint 7 |
| `src/app/api/agents/execute/route.ts:137` | Same mock call in execute route | Sprint 7 |
| `src/app/api/scan/start/route.ts:73` | Scan start runs mock | Sprint 7 |

---

## Security Summary

| Check | Status |
|-------|--------|
| `getUser()` used (not `getSession()`) | ✅ Correct in all routes checked |
| Paddle webhook signature verified | ✅ Present |
| Zod validation on all POST routes | ✅ Present on checked routes |
| No secrets in `NEXT_PUBLIC_` vars | ✅ Only `APP_URL`, `PADDLE_ENVIRONMENT`, `PADDLE_CLIENT_TOKEN` exposed (all safe) |
| Rate limiting on free scan | ⚠️ Present but wrong window (1h not 24h) — see H6 |
| SQL injection via concatenation | ✅ None found — all queries use parameterized Supabase calls |
| `dangerouslySetInnerHTML` | Not found in non-landing components |

---

---

## Functional Flows Audit (Agent 3 — Flow Tracer)

### Flow A — Free Scan: PARTIALLY WORKING
- ✅ Happy path works end-to-end
- ⚠️ `expires_at` set to 7 days — spec says 30 days (see H7 above)
- ⚠️ Mock scan runs synchronously in route handler — will timeout when real LLM calls added (see H2 above)

---

### Flow B — Signup with scan_id Import: PARTIALLY WORKING

**B1: Trial duration is 14 days in code, spec says 7 days**
**File:** `src/app/api/onboarding/complete/route.ts`
**Problem:** `Date.now() + 14 * 24 * 60 * 60 * 1000` — sets 14-day trial. Spec is 7 days.
**Fix:** Change to `7 * 24 * 60 * 60 * 1000`.

**B2: `convertFreeScanResults` inserts `avg_position` column that doesn't exist**
**File:** `src/app/api/onboarding/complete/route.ts` — `convertFreeScanResults` function
**Problem:** Insert into `scans` includes `avg_position` column. Per MEMORY.md: `scans` has NO `avg_position` column. Insert silently fails → no scan history created after free scan import. User sees empty dashboard despite completing onboarding with scan data.
**Fix:** Remove `avg_position` from the insert. If an average is needed, compute it client-side from `scan_engine_results`.

---

### Flow C — Dashboard Overview: PARTIALLY WORKING

**C-F1: New users have no `credit_pools` row — dashboard shows "0 / 0"**
**File:** `src/app/(protected)/dashboard/page.tsx` and dashboard overview component
**Problem:** `credit_pools` row is created on trial start (`/api/dashboard/trial-start`), but if the API is never called or fails silently, new users see "0 / 0 credits" with no context. The trial-start API is called client-side on first dashboard visit — if this fails, credits are never initialized.
**Fix:** Create `credit_pools` row in the `handle_new_user` trigger (or in `/api/onboarding/complete`) so credits exist before the first dashboard visit.

**C-F2: Engine Status card shows all 4 engines as "Active" — hardcoded**
**File:** Dashboard overview component
**Problem:** Engine status cards are hardcoded as "Active" regardless of real scan data. Users on Starter (3 engines) will see all 4 engines shown as active.
**Fix:** Drive engine status from actual `scan_engine_results` data.

---

### Flow D — Agent Execution: BROKEN (4 bugs)

**D1: `competitor-research` and `query-researcher` routes always 404**
**Files:**
- `src/app/api/agents/competitor-research/route.ts` — calls `executeAgent('competitor-research', ...)`
- `src/app/api/agents/query-researcher/route.ts` — calls `executeAgent('query-researcher', ...)`
- `src/lib/agents/config.ts` — `AGENT_CONFIG` has no keys `'competitor-research'` or `'query-researcher'`
**Problem:** `executeAgent()` looks up the slug in `AGENT_CONFIG`. These slugs don't exist → returns 404. UI silently does nothing when user runs these agents.
**Fix:** Either add correct slugs to `AGENT_CONFIG`, or rename route folders to match existing config keys.

**D2: `faq-agent` route file is missing**
**Problem:** `AGENT_CONFIG` has a `'faq-agent'` entry. No corresponding route file at `src/app/api/agents/faq-agent/route.ts`.
**Fix:** Create `src/app/api/agents/faq-agent/route.ts` with the same pattern as other agent routes.

**D3: Agent chat page shows blank for `competitor_intelligence` type**
**File:** `src/components/dashboard/agent-chat-view.tsx`
**Problem:** `AGENT_META` map has no entry for `'competitor_intelligence'`. Navigating to `/dashboard/agents/competitor_intelligence` renders a blank/broken page.
**Fix:** Add `'competitor_intelligence'` (and all DB enum values) to `AGENT_META`.

**D4: Executions route selects non-existent columns on `agent_jobs`**
**File:** `src/app/api/agents/executions/[id]/route.ts`
**Problem:** Selects `output_type`, `title`, `structured_data` from `agent_jobs`. These columns don't exist. `structuredOutput` is always null. Combined with C1 above, the execution detail view always returns empty data.
**Fix:** Use correct column names from DB types: `output_data`, `agent_type`. Remove non-existent columns.

---

### Flow E — Settings Billing Tab: BROKEN (fully hardcoded)

**E1: Entire billing tab is static mock data**
**File:** `src/app/(protected)/dashboard/settings/page.tsx` — Billing tab
**Problem:**
- Plan name, price, usage percentages, billing history, and payment method are all hardcoded strings
- "Update Payment Method", "Change Plan", and "Cancel Subscription" buttons have no `onClick` handlers — they do nothing
- No calls to `/api/billing/status` or Paddle portal
**Fix:** Wire billing tab to `GET /api/billing/status` for real subscription data. Connect "Manage Billing" to `GET /api/billing/portal` for Paddle customer portal redirect.

---

### Missing API Routes

| UI calls | Route file exists? | Result |
|----------|-------------------|--------|
| `/api/agents/faq-agent` | ❌ Missing | 404 |
| `/api/agents/competitor-research` | ✅ Exists but slug not in AGENT_CONFIG | 404 |
| `/api/agents/query-researcher` | ✅ Exists but slug not in AGENT_CONFIG | 404 |
| `/api/billing/status` | ❓ Verify | Unknown |
| `/api/billing/portal` | ✅ Exists (`src/app/api/paddle/portal/route.ts`) | OK |
| `/api/dashboard/trial-start` | ❓ Verify | Unknown |

---

### Inngest Status: NOT WIRED
**Problem:** Inngest is installed as a dependency but not used anywhere in the codebase. No `src/inngest/` directory exists. No `src/app/api/inngest/route.ts` exists. All background jobs (scan engine, agent execution, cron jobs) run synchronously in API route handlers. This is the root cause of H2.

---

### Missing Environment Variables

| Env var | Used in | Declared? |
|---------|---------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `src/app/sitemap.ts` | ❓ Check .env.example |
| `EMAIL_FROM_ADDRESS` | `src/lib/email/send.ts` | ❓ Check .env.example |
| `NEXT_PUBLIC_APP_URL` | 14 email components | ❓ Check .env.example |

---

## Fix Priority Order for Dev Team

**Batch 1 — Fix immediately (data corruption / 404s that block testing):**
1. C2 + D1 + D3 — Wrong agent_type enum values everywhere → rename to `competitor_intelligence`, `faq_agent`
2. D2 — Create missing `/api/agents/faq-agent/route.ts`
3. C1 + D4 — Fix executions route: remove non-existent columns (`generated_content`, `llm_optimization_score`, `output_type`, `title`, `structured_data`)
4. B2 — Remove `avg_position` from `scans` insert in `convertFreeScanResults`
5. C5 — Paddle webhook `'canceled'` → `'cancelled'`
6. M7 — Set `beamix-onboarding-complete` cookie in `/api/onboarding/complete` on success

**Batch 2 — Fix before any user testing:**
7. B1 — Trial duration 14 days → 7 days in `onboarding/complete`
8. H6 — Rate limit window 1h → 24h
9. H7 — Free scan expiry 7d → 30d
10. H5 — Dashboard layout: join `plans` table to get `plan_tier`
11. C4 + M6 — Remove `'free'` as plan_tier fallback; handle `null` as free tier
12. C-F1 — Create `credit_pools` row earlier (in trigger or onboarding complete)
13. E1 — Wire billing tab to real Paddle API (at minimum, remove fake onClick-less buttons)

**Batch 3 — Fix before launch (architecture):**
14. H2 + Inngest — Move scan and agent execution out of route handlers into Inngest background jobs
15. C3 — Switch from `deduct_credits` to hold/confirm/release pattern
16. H4 — `content_items` insert: set both `content` and `content_body`

**With Sprint 7 (Sage — real LLM integration):**
17. H1 — Replace all mock outputs with real LLM calls (scan engine + all 8 agent pipelines)

**Cleanup (any time):**
18. M1 — Standardize `APP_URL` / `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL`
19. M5 — Fix N+1 query in weekly digest cron
20. L2 — Remove `.DS_Store` from git tracking
