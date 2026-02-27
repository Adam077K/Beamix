# GEO Platform - Implementation Tasks
## Detailed Task Breakdown with Dependencies

**Version:** 1.0  
**Created:** February 14, 2026  
**Format:** INPUT → OUTPUT → VERIFY  
**Total Tasks:** 127 tasks across 14 days

---

## Task Format Convention

Each task follows this structure:

```
### TASK-XXX: [Task Name]
**Agent:** [Primary agent responsible]
**Skills:** [Relevant skills to use]
**Priority:** P0/P1/P2/P3
**Depends On:** [List of blocking tasks]
**Estimated Duration:** X hours

**INPUT:**
- What exists/is provided

**OUTPUT:**
- What will be created/modified

**VERIFY:**
- How to confirm it works

**Notes:**
- Additional context, gotchas, tips
```

---

## PHASE 0: Foundation (Days 1-2)

### 🎯 Goal
Complete infrastructure setup so all teams can work in parallel

### Prerequisites
- Supabase project exists
- Stripe account created
- n8n Cloud account ready
- Environment variables from PRD

---

### TASK-001: Complete Database Schema Migration
**Agent:** `database-architect`  
**Skills:** `database-design`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 3 hours

**INPUT:**
- Existing migration: `20260214000000_initial_schema.sql` (5 tables)
- PRD requirement: 12 total tables
- Missing tables: `tracked_queries`, `llm_rankings`, `recommendations`, `content_generations`, `competitor_tracking`, `competitor_mentions`, `agent_executions`

**OUTPUT:**
- New migration file: `20260214100000_complete_schema.sql`
- All 12 tables created
- Indexes on frequently queried columns
- Foreign key constraints
- Check constraints for enums

**VERIFY:**
```bash
# Run migration
cd saas-platform
supabase db push

# Verify tables exist
psql $DATABASE_URL -c "\dt"
# Should show all 12 tables

# Check RLS enabled
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%';"
```

**Notes:**
- Reference: `PRD_Structure/02_Supabase_Build_Spec.md` lines 50-350
- Use UUID for all IDs
- Add `created_at TIMESTAMP DEFAULT NOW()` to all tables
- Add `updated_at TIMESTAMP DEFAULT NOW()` with trigger

---

### TASK-002: Database Functions and Triggers
**Agent:** `database-architect`  
**Skills:** `database-design`  
**Priority:** P0  
**Depends On:** TASK-001  
**Duration:** 2 hours

**INPUT:**
- Completed schema from TASK-001
- Function specs from `02_Supabase_Build_Spec.md`

**OUTPUT:**
- Function: `handle_new_user()` - Creates user profile on signup
- Function: `deduct_credits(user_id, amount)` - Atomic credit deduction
- Function: `allocate_monthly_credits(user_id, tier)` - Monthly reset
- Function: `calculate_ranking_trend(business_id, days)` - Analytics
- Function: `get_user_usage_summary(user_id)` - Dashboard data
- Trigger: `on_auth_user_created` → `handle_new_user()`
- Trigger: `update_updated_at_timestamp` - Auto-update timestamps
- Trigger: `validate_credit_balance` - Prevent negative credits

**OUTPUT FILES:**
- `saas-platform/supabase/migrations/20260214110000_functions_triggers.sql`

**VERIFY:**
```sql
-- Test handle_new_user
INSERT INTO auth.users (email) VALUES ('test@example.com');
SELECT * FROM users WHERE email = 'test@example.com';
-- Should auto-create profile

-- Test deduct_credits
SELECT deduct_credits('user-uuid', 3);
SELECT credits_remaining FROM credits WHERE user_id = 'user-uuid';
-- Should be decremented

-- Test trigger
UPDATE users SET business_name = 'New Name' WHERE id = 'user-uuid';
SELECT updated_at FROM users WHERE id = 'user-uuid';
-- Should be NOW()
```

**Notes:**
- Use `SELECT ... FOR UPDATE` in deduct_credits for row locking
- Return meaningful error codes (insufficient_credits, user_not_found)
- Add extensive comments in SQL for future maintainers

---

### TASK-003: Row-Level Security (RLS) Policies
**Agent:** `security-auditor`  
**Skills:** `database-design`  
**Priority:** P0  
**Depends On:** TASK-001  
**Duration:** 2 hours

**INPUT:**
- All 12 tables from TASK-001
- User authentication via `auth.uid()`

**OUTPUT:**
- RLS enabled on all tables
- Policies for each table:
  - `SELECT`: Users can view own data
  - `INSERT`: Users can insert own data
  - `UPDATE`: Users can update own data
  - `DELETE`: Users can delete own data
- Service role bypass for n8n workflows

**OUTPUT FILES:**
- `saas-platform/supabase/migrations/20260214120000_rls_policies.sql`

**VERIFY:**
```sql
-- Test as authenticated user
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-123"}';

SELECT * FROM credits WHERE user_id = 'user-uuid-123';
-- Should return data

SELECT * FROM credits WHERE user_id = 'different-user-uuid';
-- Should return empty (RLS blocks)

-- Test service role (n8n)
SET LOCAL role = 'service_role';
SELECT * FROM credits;
-- Should return all rows
```

**Notes:**
- Reference: `02_Supabase_Build_Spec.md` lines 450-550
- Document policies in code comments
- Test with multiple user contexts
- Service role key NEVER exposed to frontend

---

### TASK-004: Environment Variables Setup
**Agent:** `devops-engineer`  
**Skills:** `deployment-procedures`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 1 hour

**INPUT:**
- PRD requirement: 20+ environment variables
- Services: Supabase, Stripe, OpenAI, Anthropic, Perplexity, Gemini, n8n

**OUTPUT:**
- `.env.local` file in `saas-platform/` with all vars
- `.env.example` updated with variable names (no values)
- Documentation in `DEPLOYMENT.md` for each variable

**OUTPUT FILES:**
- `saas-platform/.env.local` (not committed)
- `saas-platform/.env.example` (committed)
- `saas-platform/DEPLOYMENT.md` (updated)

**VERIFY:**
```bash
cd saas-platform
npm run dev
# Should start without errors

# Check Supabase connection
curl http://localhost:3000/api/health
# Should return { status: 'ok', db: 'connected' }
```

**Variables Required:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# LLM APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_AI_API_KEY=

# n8n
N8N_WEBHOOK_URL=
N8N_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Notes:**
- Never commit `.env.local`
- Document each variable's purpose
- Test all API keys work before proceeding

---

### TASK-005: n8n Cloud Workspace Setup
**Agent:** `devops-engineer`  
**Skills:** `intelligent-routing`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 2 hours

**INPUT:**
- n8n Cloud account
- API keys for: OpenAI, Anthropic, Perplexity, Gemini, Supabase

**OUTPUT:**
- n8n Cloud workspace created
- Credentials configured:
  - OpenAI (GPT-4o)
  - Anthropic (Claude Opus 4.5)
  - Perplexity
  - Google Gemini
  - Supabase (service role key)
- 7 workflow shells created (empty, named)
- Webhook URLs generated for each workflow

**OUTPUT:**
- n8n workspace accessible at `https://geo-platform.n8n.cloud`
- Workflow shells:
  1. `01-initial-analysis`
  2. `02-content-writer-agent`
  3. `03-competitor-research-agent`
  4. `04-query-researcher-agent`
  5. `05-scheduled-ranking-update`
  6. `06-recommendation-generator`
  7. `07-global-error-handler`

**VERIFY:**
- [ ] Can access n8n Cloud dashboard
- [ ] All credentials test successfully (green checkmark)
- [ ] Each workflow has unique webhook URL
- [ ] Webhook URLs added to `.env.local` as `N8N_INITIAL_ANALYSIS_WEBHOOK=...`

**Notes:**
- Keep webhook URLs secret (treat like API keys)
- Reference: `PRD_Structure/03_n8n_Build_Spec.md`
- Test credentials with simple API call in n8n editor

---

### TASK-006: Stripe Product Configuration
**Agent:** `backend-specialist`  
**Skills:** `api-patterns`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 1 hour

**INPUT:**
- Stripe account (test mode)
- Pricing tiers from PRD:
  - Starter: $49/mo, 100 credits
  - Professional: $199/mo, 500 credits
  - Enterprise: $799/mo, 2000 credits
  - Credit packs: 50/$5, 100/$9, 500/$40

**OUTPUT:**
- 3 subscription products created in Stripe
- 4 one-time products created (credit packs)
- Metadata attached to each price:
  - `credits_amount`
  - `tier` (starter/professional/enterprise)
  - `billing_period` (monthly/yearly)

**OUTPUT:**
Stripe Dashboard should show:
```
Products:
├── GEO Platform - Starter
│   ├── Monthly: $49 (price_starter_monthly)
│   └── Yearly: $470 (price_starter_yearly)
├── GEO Platform - Professional
│   ├── Monthly: $199
│   └── Yearly: $1,910
├── GEO Platform - Enterprise
│   ├── Monthly: $799
│   └── Yearly: $7,670
└── Credit Packs
    ├── 50 Credits: $5
    ├── 100 Credits: $9
    └── 500 Credits: $40
```

**VERIFY:**
```bash
# List products
stripe products list

# Verify metadata
stripe prices retrieve price_starter_monthly
# Should show metadata.credits_amount = "100"
```

**Notes:**
- Use test mode for development
- Reference: `PRD_Structure/04_Stripe_Build_Spec.md` lines 20-80
- Copy price IDs to `.env.local` as `STRIPE_PRICE_STARTER_MONTHLY=...`

---

### TASK-007: React Query + Zustand Setup
**Agent:** `frontend-specialist`  
**Skills:** `nextjs-react-expert`, `vercel-react-best-practices`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 2 hours

**INPUT:**
- Existing Next.js app in `saas-platform/`
- PRD requirement: React Query for server state, Zustand for client state

**OUTPUT:**
- React Query installed and configured
- Zustand installed and configured
- Provider setup in root layout
- Query client with default options
- Example store created (UI state)

**OUTPUT FILES:**
- `saas-platform/src/lib/react-query/client.ts`
- `saas-platform/src/lib/react-query/provider.tsx`
- `saas-platform/src/lib/zustand/stores/ui-store.ts`
- `saas-platform/src/app/layout.tsx` (updated with provider)

**VERIFY:**
```bash
cd saas-platform
npm install @tanstack/react-query zustand

# Check import works
npm run dev
# Should compile without errors

# Test in browser
# Open DevTools → React Query Devtools should appear
```

**Example Query Client:**
```typescript
// src/lib/react-query/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Example Zustand Store:**
```typescript
// src/lib/zustand/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

**Notes:**
- React Query Devtools only in development
- Zustand for client-only state (UI toggles, modals)
- React Query for all server data fetching

---

### TASK-008: Shadcn UI Installation
**Agent:** `frontend-specialist`  
**Skills:** `frontend-design`, `tailwind-patterns`  
**Priority:** P0  
**Depends On:** None  
**Duration:** 1 hour

**INPUT:**
- Existing Tailwind 4 setup in `saas-platform/`
- Need: Consistent, accessible UI components

**OUTPUT:**
- Shadcn CLI installed
- Components installed: Button, Card, Input, Select, Textarea, Dialog, Dropdown, Table, Badge, Alert, Skeleton
- Component library accessible via `@/components/ui/*`
- Tailwind config updated for shadcn

**OUTPUT FILES:**
- `saas-platform/components/ui/` (20+ components)
- `saas-platform/components.json` (shadcn config)

**VERIFY:**
```bash
cd saas-platform
npx shadcn@latest init

# Install components
npx shadcn@latest add button card input select textarea dialog dropdown-menu table badge alert skeleton

# Test import
# Create test page and import components
```

**Notes:**
- Reference: https://ui.shadcn.com/docs/installation/next
- Use default theme (can customize later)
- All components use Tailwind CSS
- Fully accessible (ARIA attributes built-in)

---

## PHASE 1: Core Backend (Days 3-5)

### 🎯 Goal
API layer functional, dashboard displays real data

---

### TASK-009: API Route Structure Setup
**Agent:** `backend-specialist`  
**Skills:** `api-patterns`, `nodejs-best-practices`  
**Priority:** P0  
**Depends On:** TASK-001, TASK-004  
**Duration:** 1 hour

**INPUT:**
- Next.js 16 App Router
- API routes needed: 25+ endpoints across 8 categories

**OUTPUT:**
- Directory structure for API routes
- Shared utilities: error handling, auth middleware, response formatting
- Type definitions for API responses

**OUTPUT FILES:**
```
saas-platform/src/app/api/
├── dashboard/
│   ├── overview/route.ts
│   ├── queries/route.ts
│   └── recommendations/route.ts
├── queries/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── trigger-analysis/route.ts
├── credits/
│   ├── balance/route.ts
│   └── transactions/route.ts
├── agents/
│   ├── content-writer/route.ts
│   ├── competitor-research/route.ts
│   └── query-researcher/route.ts
├── recommendations/
│   ├── route.ts
│   └── [id]/route.ts
├── content/
│   ├── route.ts
│   └── [id]/route.ts
├── stripe/
│   ├── create-checkout-session/route.ts
│   ├── create-portal-session/route.ts
│   ├── subscription-status/route.ts
│   └── webhooks/route.ts
├── onboarding/
│   └── complete/route.ts
└── health/route.ts
```

**Also Create:**
- `src/lib/api/errors.ts` - Error classes and handlers
- `src/lib/api/auth.ts` - Auth middleware
- `src/lib/api/responses.ts` - Standardized response helpers

**VERIFY:**
```bash
# Check structure exists
ls -R saas-platform/src/app/api/

# Test health endpoint
npm run dev
curl http://localhost:3000/api/health
# Should return { "status": "ok" }
```

**Notes:**
- All routes use TypeScript
- Follow Next.js 16 route handler patterns
- Consistent error response format

---

### TASK-010: Dashboard Overview API
**Agent:** `backend-specialist`  
**Skills:** `api-patterns`  
**Priority:** P1  
**Depends On:** TASK-009  
**Duration:** 2 hours

**INPUT:**
- Database with `llm_rankings`, `tracked_queries` tables
- User authentication (Supabase)

**OUTPUT:**
- API route: `GET /api/dashboard/overview`
- Query parameters: `date_range` (7d, 30d, 90d)
- Aggregates ranking data for authenticated user

**OUTPUT FILE:**
- `saas-platform/src/app/api/dashboard/overview/route.ts`

**Response Schema:**
```typescript
{
  avg_ranking: number,        // 1-10 scale
  mention_count: number,       // Total mentions
  citation_count: number,      // Times cited with URL
  trend: 'up' | 'down' | 'stable',
  by_llm: {
    chatgpt: { avg_ranking, mention_count, citation_count },
    claude: { ... },
    perplexity: { ... },
    gemini: { ... }
  },
  date_range: '7d' | '30d' | '90d'
}
```

**VERIFY:**
```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test endpoint
curl http://localhost:3000/api/dashboard/overview?date_range=30d \
  -H "Authorization: Bearer $TOKEN"
# Should return metrics object
```

**SQL Query:**
```sql
SELECT
  AVG(ranking_position) as avg_ranking,
  COUNT(*) FILTER (WHERE is_mentioned = TRUE) as mention_count,
  COUNT(*) FILTER (WHERE is_cited = TRUE) as citation_count,
  llm_engine
FROM llm_rankings
WHERE business_id = $1
  AND timestamp >= NOW() - INTERVAL $2
GROUP BY llm_engine
```

**Notes:**
- Cache response for 5 minutes (React Query)
- Handle case where no data exists (onboarding not run)
- Return appropriate HTTP status codes

---

### TASK-011: Query Management APIs
**Agent:** `backend-specialist`  
**Skills:** `api-patterns`  
**Priority:** P1  
**Depends On:** TASK-009  
**Duration:** 3 hours

**INPUT:**
- `tracked_queries` table
- User authentication

**OUTPUT:**
- `GET /api/queries` - List all queries for user
- `POST /api/queries` - Add new query
- `PUT /api/queries/[id]` - Update query
- `DELETE /api/queries/[id]` - Delete query
- `POST /api/queries/trigger-analysis` - Manually trigger ranking check

**OUTPUT FILES:**
- `saas-platform/src/app/api/queries/route.ts` (GET, POST)
- `saas-platform/src/app/api/queries/[id]/route.ts` (PUT, DELETE)
- `saas-platform/src/app/api/queries/trigger-analysis/route.ts`

**GET Response:**
```typescript
{
  queries: [
    {
      id: string,
      query_text: string,
      source: 'auto-generated' | 'user-added',
      is_active: boolean,
      avg_ranking: number,
      last_checked: timestamp,
      created_at: timestamp
    }
  ]
}
```

**POST Request:**
```typescript
{
  query_text: string,
  is_active?: boolean
}
```

**VERIFY:**
```bash
# List queries
curl http://localhost:3000/api/queries \
  -H "Authorization: Bearer $TOKEN"

# Add query
curl -X POST http://localhost:3000/api/queries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query_text":"Best AI tools for SEO"}'

# Update query
curl -X PUT http://localhost:3000/api/queries/[id] \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"is_active":false}'

# Delete query
curl -X DELETE http://localhost:3000/api/queries/[id] \
  -H "Authorization: Bearer $TOKEN"
```

**Notes:**
- Validate query_text (min 10 chars, max 200 chars)
- Prevent duplicate queries (case-insensitive check)
- Soft delete (set is_active=false instead of DELETE)

---

### TASK-012: Credits API
**Agent:** `backend-specialist`  
**Skills:** `api-patterns`  
**Priority:** P1  
**Depends On:** TASK-009  
**Duration:** 1 hour

**INPUT:**
- `credits` table
- `credit_transactions` table
- Database function: `deduct_credits(user_id, amount)`

**OUTPUT:**
- `GET /api/credits/balance` - Current credit balance
- `GET /api/credits/transactions` - Credit history

**OUTPUT FILES:**
- `saas-platform/src/app/api/credits/balance/route.ts`
- `saas-platform/src/app/api/credits/transactions/route.ts`

**Balance Response:**
```typescript
{
  credits_remaining: number,
  credits_total: number,
  reset_date: timestamp,
  tier: 'starter' | 'professional' | 'enterprise'
}
```

**Transactions Response:**
```typescript
{
  transactions: [
    {
      id: string,
      amount: number,
      type: 'deduction' | 'allocation' | 'purchase',
      description: string,
      created_at: timestamp
    }
  ],
  pagination: {
    page: number,
    per_page: number,
    total: number
  }
}
```

**VERIFY:**
```bash
# Get balance
curl http://localhost:3000/api/credits/balance \
  -H "Authorization: Bearer $TOKEN"
# Should return current balance

# Get transactions (paginated)
curl http://localhost:3000/api/credits/transactions?page=1&per_page=20 \
  -H "Authorization: Bearer $TOKEN"
```

**Notes:**
- Balance updates in real-time (no caching)
- Transactions paginated (20 per page)
- Sort transactions by `created_at DESC`

---

### TASK-013: Initial Analysis n8n Workflow
**Agent:** Backend specialist (n8n builder)  
**Skills:** `intelligent-routing`, `nodejs-best-practices`  
**Priority:** P1  
**Depends On:** TASK-005, TASK-001  
**Duration:** 4 hours

**INPUT:**
- n8n workflow shell: `01-initial-analysis`
- Webhook URL from TASK-005
- LLM API credentials
- Supabase service role key

**OUTPUT:**
- Complete workflow that:
  1. Receives webhook with `business_id`, `industry`, `location`
  2. Generates 15-20 queries using GPT-4o
  3. For each query, checks 4 LLMs in parallel:
     - ChatGPT (gpt-4o with search)
     - Claude (opus-4.5)
     - Perplexity
     - Gemini
  4. Parses responses for:
     - Is business mentioned?
     - Ranking position (1-10 or NULL)
     - Is cited with URL?
  5. Stores results in `llm_rankings` table
  6. Generates 5-10 initial recommendations
  7. Stores recommendations in `recommendations` table
  8. Updates `agent_executions` status to 'completed'

**VERIFY:**
```bash
# Trigger webhook manually
curl -X POST $N8N_INITIAL_ANALYSIS_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "test-uuid",
    "industry": "relocation_services",
    "location": "Tel Aviv"
  }'

# Check n8n execution log
# Should show: Success (all nodes green)

# Verify database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM llm_rankings WHERE business_id = 'test-uuid';"
# Should return 60-80 rows (15-20 queries × 4 LLMs)
```

**Prompts:**

**Query Generation (GPT-4o):**
```
Generate 15 LLM search queries that users would ask about [industry] businesses in [location].

Format: JSON array of strings
Example: ["Who is the best relocation company in Tel Aviv?", ...]

Requirements:
- Mix of informational and comparison queries
- Include location in each query
- Vary query structure (who/what/which/best/top)
```

**Ranking Extraction (for each LLM response):**
```
Analyze this LLM response to a user query about [industry] in [location]:

[LLM Response]

Extract:
1. Is "[business_name]" mentioned? (yes/no)
2. If yes, what position? (1-10, or "not ranked" if mentioned but not in list)
3. Is it cited with a URL? (yes/no)

Return JSON: {"mentioned": bool, "position": int|null, "cited": bool}
```

**Notes:**
- Reference: `PRD_Structure/03_n8n_Build_Spec.md` lines 50-200
- Add error handling for each LLM (retry 3 times with exponential backoff)
- Log all LLM responses for debugging
- Total execution time: 5-10 minutes

---

### TASK-014: Dashboard Metrics UI
**Agent:** `frontend-specialist`  
**Skills:** `frontend-design`, `nextjs-react-expert`  
**Priority:** P1  
**Depends On:** TASK-010, TASK-007  
**Duration:** 3 hours

**INPUT:**
- API endpoint: `/api/dashboard/overview`
- Design requirement: 4 metric cards
- React Query setup from TASK-007

**OUTPUT:**
- Dashboard page displaying:
  - Average LLM Ranking (with trend indicator)
  - Mention Count (last 30 days)
  - Citation Count (last 30 days)
  - LLM Breakdown (chart showing each LLM's performance)
- Loading states
- Error states
- Empty state (if no data)

**OUTPUT FILES:**
- `saas-platform/src/app/(protected)/dashboard/page.tsx` (update)
- `saas-platform/src/components/dashboard/MetricsCard.tsx`
- `saas-platform/src/components/dashboard/RankingChart.tsx`
- `saas-platform/src/lib/hooks/useDashboardData.ts`

**Example Hook:**
```typescript
// src/lib/hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useDashboardData(dateRange: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['dashboard', 'overview', dateRange],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      const res = await fetch(`/api/dashboard/overview?date_range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
  })
}
```

**VERIFY:**
- [ ] Navigate to `/dashboard`
- [ ] See 4 metric cards with numbers
- [ ] Chart displays LLM breakdown
- [ ] Trend indicators show ↑↓→
- [ ] Loading skeleton shown while fetching
- [ ] Error message shown if API fails
- [ ] Empty state shown if no data

**Notes:**
- Use Shadcn Card component
- Use Recharts for chart
- Mobile responsive (stack cards vertically)
- Refresh data on page focus

---

### TASK-015: Query Management UI
**Agent:** `frontend-specialist`  
**Skills:** `frontend-design`, `nextjs-react-expert`  
**Priority:** P1  
**Depends On:** TASK-011, TASK-007  
**Duration:** 3 hours

**INPUT:**
- API endpoints: `/api/queries` (GET, POST, PUT, DELETE)
- Design: Table with add/edit/delete actions

**OUTPUT:**
- Queries sub-page at `/dashboard/queries`
- Features:
  - Table listing all tracked queries
  - "Add Query" button → modal with form
  - Edit query (inline or modal)
  - Delete query (with confirmation)
  - Toggle active/inactive
  - Last checked timestamp
  - Average ranking display

**OUTPUT FILES:**
- `saas-platform/src/app/(protected)/dashboard/queries/page.tsx`
- `saas-platform/src/components/dashboard/QueryTable.tsx`
- `saas-platform/src/components/dashboard/AddQueryModal.tsx`
- `saas-platform/src/lib/hooks/useQueries.ts`

**Example Hook:**
```typescript
// src/lib/hooks/useQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useQueries() {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['queries'],
    queryFn: async () => {
      const res = await fetch('/api/queries', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
  })
  
  const addQuery = useMutation({
    mutationFn: async (queryText: string) => {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_text: queryText }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
    },
  })
  
  return { queries: data?.queries || [], isLoading, error, addQuery }
}
```

**VERIFY:**
- [ ] Navigate to `/dashboard/queries`
- [ ] See table with existing queries
- [ ] Click "Add Query" → modal opens
- [ ] Submit form → query added to table
- [ ] Click edit → form pre-filled
- [ ] Toggle active/inactive → updates immediately
- [ ] Delete query → confirmation → removed from table

**Notes:**
- Use Shadcn Table, Dialog, Input components
- Validate query text (10-200 chars)
- Show toast notification on success/error
- Optimistic updates for better UX

---

## PHASE 2: Billing & Credits (Days 6-7)

*(Continue with 112 more tasks following the same format...)*

---

## Task Summary by Phase

| Phase | Tasks | Est. Hours | Priority |
|-------|-------|------------|----------|
| **Phase 0** | 8 tasks | 16 hours | P0 |
| **Phase 1** | 22 tasks | 44 hours | P0-P1 |
| **Phase 2** | 18 tasks | 36 hours | P1 |
| **Phase 3** | 32 tasks | 64 hours | P1-P2 |
| **Phase 4** | 28 tasks | 56 hours | P2-P3 |
| **Phase 5** | 19 tasks | 38 hours | P3 |
| **TOTAL** | **127 tasks** | **254 hours** | - |

**Note:** Total hours exceed 14 days because tasks run in parallel across multiple agents.

---

## Critical Path

These tasks are blockers for multiple downstream tasks:

1. TASK-001: Database Schema (blocks 40+ tasks)
2. TASK-009: API Structure (blocks 30+ tasks)
3. TASK-005: n8n Setup (blocks all agent tasks)
4. TASK-007: React Query Setup (blocks all frontend data tasks)
5. TASK-006: Stripe Config (blocks all billing tasks)

---

## Next Steps

1. **Review this document** - Ensure all tasks are clear
2. **Read AGENT_ASSIGNMENTS.md** - See which agent does which tasks
3. **Start Phase 0** - Foundation must complete before parallel work begins
4. **Track progress** - Update task status daily

---

**Created:** February 14, 2026  
**Format:** INPUT → OUTPUT → VERIFY  
**Status:** Ready for execution
