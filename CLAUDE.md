# GEO Platform - AI Visibility Optimization SaaS

## WHAT: Project Overview

### Purpose
The GEO Platform is a SaaS application that helps businesses track and improve their visibility in AI-powered search results (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews). Users can monitor where they rank, receive AI-generated recommendations, and use AI agents to create optimized content.

### Tech Stack
```
Frontend:     Next.js 14 (App Router), React 18, TypeScript
UI:           Tailwind CSS, Shadcn UI, Lucide Icons
State:        React Query (server state), Zustand (client state)
Backend:      Next.js API Routes (serverless)
Database:     Supabase (PostgreSQL + Auth + Storage)
Workflows:    n8n Cloud (AI agent orchestration)
Payments:     Stripe (subscriptions + one-time purchases)
AI APIs:      OpenAI (GPT-4o), Anthropic (Claude Opus 4.5), Perplexity, Gemini
Deployment:   Vercel (frontend + API), Supabase Cloud, n8n Cloud
```

### Project Structure
```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (layout group)
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected dashboard (layout group)
│   │   └── dashboard/
│   │       ├── page.tsx          # Main dashboard
│   │       ├── recommendations/
│   │       ├── content/
│   │       ├── settings/
│   │       └── credits/
│   ├── (marketing)/              # Public pages
│   │   └── pricing/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── queries/
│   │   ├── credits/
│   │   ├── content/
│   │   ├── recommendations/
│   │   ├── stripe/
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   └── cron/
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── dashboard/                # Dashboard-specific
│   ├── auth/                     # Auth forms
│   └── onboarding/
├── lib/                          # Utilities & config
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   ├── stripe/
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Helper functions
│   └── constants/
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
├── PRD_Structure/                # Complete PRD documentation
│   ├── MASTER_PRD.md
│   ├── 01_Frontend_Build_Spec.md
│   ├── 02_Supabase_Build_Spec.md
│   ├── 03_n8n_Build_Spec.md
│   ├── 04_Stripe_Build_Spec.md
│   ├── 05_Deployment_Build_Spec.md
│   ├── Week1_Tasks.md
│   └── Week2_Tasks.md
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## WHY: Architecture & Design Decisions

### Core User Flow
1. **Signup & Onboarding**: User creates account → adds business info → defines tracked queries (search terms to monitor)
2. **Initial Analysis**: n8n workflow checks all 5 LLMs for each query → stores ranking data → generates recommendations
3. **Dashboard**: User sees where they rank across LLMs, mention rates, position data, trends
4. **AI Agents**: User can generate optimized content, research competitors, discover new queries (costs credits)
5. **Subscription**: Credit-based system, 3 tiers (Starter/Pro/Enterprise), 14-day trial
6. **Automation**: Daily ranking checks, weekly recommendation updates (all via n8n)

### Why This Stack?

**Next.js 14 App Router**: Modern React with server components, fast, SEO-friendly, easy Vercel deployment

**Supabase**: Postgres + built-in auth + RLS + real-time + storage in one service. No need to build separate auth system.

**n8n Cloud**: Visual workflow builder perfect for orchestrating complex AI agent pipelines. Non-developers can modify workflows. Handles retries, error handling, scheduling out of the box.

**Stripe**: Industry standard for SaaS billing. Handles trials, prorations, upgrades, downgrades, webhooks automatically.

**Serverless (Vercel)**: Auto-scaling, no server management, pay per use, global edge network.

### Key Architecture Patterns

**Separation of Concerns:**
- Frontend: Pure UI, minimal business logic
- API Routes: Validation, auth checks, database calls
- n8n Workflows: All AI orchestration, LLM calls, complex multi-step processes
- Supabase: Data persistence, auth, RLS for security

**Credit Economics:**
- Users buy credits (100 Starter, 500 Pro, 2000 Enterprise per month)
- Each AI agent action costs credits (Content Writer = 3 credits)
- 1 credit = $0.05 internal cost, covers actual LLM API costs + margin
- Credits tracked in `credits` table, transactions in `credit_transactions`

**Security Model:**
- Supabase RLS: Users can only access their own data (enforced at DB level)
- API Routes: Always verify JWT, never trust client
- n8n: Service role key for bypassing RLS (trusted server-side only)
- Stripe: Webhook signature verification prevents spoofing

**Data Flow Example (Content Generation):**
```
1. User clicks "Generate Content" in dashboard
2. Frontend opens modal, user fills form
3. Submit → POST /api/content/generate
4. API route:
   - Verifies user auth (JWT)
   - Checks credit balance in Supabase
   - If sufficient, calls n8n webhook
   - Returns 202 Accepted immediately
5. n8n workflow (async):
   - Researches topic (Perplexity)
   - Generates outline (Claude)
   - Writes full content (Claude)
   - Quality check (GPT-4o)
   - Deducts credits (Supabase RPC)
   - Stores result in content_generations table
6. Frontend polls agent_executions table every 5s
7. When status = "completed", show content to user
```

---

## HOW: Development Workflow

### Prerequisites
- **Node.js**: 20.x LTS (check: `node --version`)
- **Package Manager**: npm (comes with Node)
- **Supabase CLI**: `npm install -g supabase`
- **Git**: For version control

### First-Time Setup

```bash
# 1. Clone/navigate to project
cd /path/to/geo-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example to .env.local and fill in:
cp .env.example .env.local

# Required variables (see PRD_Structure/05_Deployment_Build_Spec.md for full list):
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# ... (and more)

# 4. Initialize Supabase locally (optional for local dev)
supabase init
supabase start

# 5. Run database migrations
supabase db push

# 6. Start development server
npm run dev
# App runs at http://localhost:3000
```

### Daily Development Workflow

```bash
# Start dev server (hot reload enabled)
npm run dev

# In separate terminal, watch TypeScript errors
npm run type-check -- --watch

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Run tests (when available)
npm test

# Build for production (test before deploying)
npm run build

# Start production build locally
npm run start
```

### Working with Different Layers

#### Frontend Changes (Components, Pages, UI)
1. Make changes in `/app` or `/components`
2. Check in browser (auto-refreshes with Fast Refresh)
3. Verify TypeScript: `npm run type-check`
4. Verify linting: `npm run lint`
5. Test responsive design (browser DevTools)

**Reference**: `PRD_Structure/01_Frontend_Build_Spec.md`

#### Database Changes (Schema, Tables, RLS)
1. Create migration: `supabase migration new <name>`
2. Edit SQL in `/supabase/migrations/`
3. Apply locally: `supabase db push`
4. Test queries in Supabase Dashboard
5. Verify RLS policies with different user contexts
6. When ready: Apply to staging/production

**Reference**: `PRD_Structure/02_Supabase_Build_Spec.md`

#### AI Workflows (n8n)
1. Log into n8n Cloud instance
2. Create/edit workflow in visual editor
3. Test with webhook trigger (use Postman/curl)
4. Check execution logs in n8n
5. Verify results in Supabase database
6. Activate workflow when working

**Reference**: `PRD_Structure/03_n8n_Build_Spec.md`

#### Payment Integration (Stripe)
1. Use Stripe test mode during development
2. Test card: `4242 4242 4242 4242`
3. Create products/prices in Stripe Dashboard
4. Test checkout flow end-to-end
5. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
6. Verify webhooks in Stripe Dashboard logs

**Reference**: `PRD_Structure/04_Stripe_Build_Spec.md`

### Verification Checklist (Before Committing)

```bash
# 1. TypeScript compiles without errors
npm run type-check

# 2. Linting passes
npm run lint

# 3. Build succeeds
npm run build

# 4. Test critical flows manually:
# - Can sign up new user?
# - Can log in?
# - Can add query?
# - Can view rankings?
# - Can generate content (if credits available)?
```

### Common Commands

```bash
# Package management
npm install <package>              # Add dependency
npm install -D <package>           # Add dev dependency
npm uninstall <package>            # Remove dependency
npm outdated                       # Check for updates

# Database (Supabase)
supabase status                    # Check local Supabase status
supabase db reset                  # Reset local database (DESTRUCTIVE)
supabase migration list            # List all migrations
supabase db push                   # Apply migrations

# Deployment
git push origin develop            # Deploy to staging (auto)
git push origin main               # Deploy to production (auto)

# Vercel CLI (optional)
vercel                             # Deploy preview
vercel --prod                      # Deploy to production
vercel logs                        # View deployment logs
```

### Debugging Tips

**Frontend Issues:**
- Check browser console for errors
- Use React DevTools to inspect component state
- Check Network tab for failed API calls
- Verify env vars: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

**API Route Issues:**
- Check Vercel Function logs (Vercel Dashboard or `vercel logs`)
- Add `console.log()` statements (appear in function logs)
- Test with Postman/curl before testing in browser
- Verify authentication: Check JWT token in request headers

**Database Issues:**
- Check Supabase Dashboard → Database → Query Editor
- Run queries manually to test
- Check RLS policies: May be blocking queries
- View Table Editor to see actual data

**n8n Workflow Issues:**
- Check n8n execution logs (detailed per node)
- Test individual nodes in isolation
- Verify credentials are configured
- Check webhook URLs are correct (must be publicly accessible)

**Stripe Issues:**
- Check Stripe Dashboard → Developers → Logs
- Verify webhook endpoint is reachable (test with Stripe CLI)
- Use test mode during development (separate from production)
- Check webhook signature verification in code

### Testing Strategy

**Manual Testing Priority (MVP):**
1. Authentication flows (signup, login, logout)
2. Onboarding flow (add queries)
3. Dashboard rendering (rankings display)
4. Content generation (AI agent)
5. Stripe checkout (test mode)
6. Webhook handling (Stripe events)

**Automated Testing (Phase 2):**
- Unit tests: Critical utility functions
- Integration tests: API routes
- E2E tests: Complete user flows (Playwright/Cypress)

---

## Project-Specific Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, no `any` types
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Functional components with hooks (no classes)
- **Async/await**: Preferred over `.then()` chains
- **Error handling**: Always try/catch in API routes

### Component Organization
```typescript
// components/dashboard/QueryList.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export function QueryList() {
  // 1. Hooks first
  const { data, isLoading } = useQuery(...);
  const [selectedQuery, setSelectedQuery] = useState(null);

  // 2. Event handlers
  const handleQueryClick = (query) => {
    setSelectedQuery(query);
  };

  // 3. Render logic
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

### API Route Pattern
```typescript
// app/api/queries/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await request.json();
    const { query_text, target_url } = body;

    if (!query_text || !target_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Perform database operation
    const { data, error } = await supabase
      .from('tracked_queries')
      .insert({
        user_id: user.id,
        query_text,
        target_url,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Return success
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('[API] [/api/queries/create]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Environment Variables
- **NEVER** commit `.env.local` (already in `.gitignore`)
- **NEVER** expose secret keys to frontend (no `NEXT_PUBLIC_` prefix)
- Use `NEXT_PUBLIC_` prefix only for truly public values (Supabase URL, Stripe publishable key)
- Document all required env vars in `.env.example`

### Git Workflow
```bash
# Feature development
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes, commit often
git add .
git commit -m "Add query list component"

# Push and create PR
git push origin feature/your-feature-name
# Create PR on GitHub: feature/* → develop

# After PR approved and merged to develop
git checkout develop
git pull origin develop

# When ready for production
# Create PR: develop → main
# After approval, merge triggers production deployment
```

---

## Implementation Timeline

This project is designed to be built in **2 weeks** following the detailed task breakdown:

- **Week 1** (Days 1-7): Foundation, auth, dashboard, rankings, basic billing
  - See: `PRD_Structure/Week1_Tasks.md`

- **Week 2** (Days 8-14): AI agents, recommendations, automation, production launch
  - See: `PRD_Structure/Week2_Tasks.md`

**Daily workflow:**
1. Check current day's tasks in Week1/Week2 markdown files
2. Complete tasks in order (dependencies matter)
3. Verify each major component before moving on
4. Update progress, note any blockers

---

## External Services Setup

### Supabase
1. Create project at supabase.com
2. Go to Project Settings → API
3. Copy URL and anon key → `.env.local`
4. Copy service role key → `.env.local` (NEVER expose to frontend)
5. Apply database migrations

### n8n Cloud
1. Sign up at n8n.io (Pro plan)
2. Create workspace
3. Add credentials for: Supabase, OpenAI, Anthropic, Perplexity, Gemini
4. Build workflows per `03_n8n_Build_Spec.md`
5. Note webhook URLs → use in API routes

### Stripe
1. Create account at stripe.com
2. Use test mode during development
3. Create products and prices (see `04_Stripe_Build_Spec.md`)
4. Get API keys: Developers → API keys
5. Set up webhook endpoint: Developers → Webhooks
6. Add webhook URL: `https://your-app.vercel.app/api/webhooks/stripe`

### Vercel
1. Connect GitHub repo at vercel.com
2. Import project (auto-detects Next.js)
3. Add environment variables in project settings
4. Configure custom domain (optional)
5. Every push to `main` auto-deploys to production
6. Every push to `develop` auto-deploys to preview

### LLM API Keys
- **OpenAI**: platform.openai.com → API keys
- **Anthropic**: console.anthropic.com → API keys
- **Perplexity**: perplexity.ai → Settings → API
- **Gemini**: aistudio.google.com → Get API key

---

## Key Resources

### Documentation (In This Repo)
- **MASTER_PRD.md**: High-level vision and goals
- **Frontend Spec**: Complete UI/UX requirements
- **Supabase Spec**: Database schema and auth
- **n8n Spec**: All AI workflow logic
- **Stripe Spec**: Payment and subscription details
- **Deployment Spec**: Production setup and monitoring
- **Week 1 Tasks**: Day-by-day implementation guide
- **Week 2 Tasks**: Advanced features and launch

### External Docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- n8n: https://docs.n8n.io
- Stripe: https://stripe.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Shadcn UI: https://ui.shadcn.com

### Key Concepts to Understand
- **Row-Level Security (RLS)**: Postgres security at database level
- **Server Components vs Client Components**: Next.js 14 paradigm
- **Webhook Verification**: Stripe signature verification is critical
- **Credit System**: Users pay with credits, we track API costs
- **n8n Workflows**: Visual automation for AI agents

---

## Troubleshooting

### "Cannot find module '@/...'"
- Check `tsconfig.json` has `"@/*": ["./\*"]` in paths
- Restart TypeScript server in VS Code

### "Supabase client not initialized"
- Verify env vars are set correctly
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Restart dev server after changing env vars

### "Webhook signature verification failed"
- Get fresh webhook secret from Stripe Dashboard
- Ensure using raw body (not parsed JSON) for verification
- Check STRIPE_WEBHOOK_SECRET env var is set

### "RLS policy violation"
- User may not have permission to access data
- Check RLS policies in Supabase Dashboard
- Verify user_id matches authenticated user
- Use service role key for admin operations (server-side only)

### "n8n workflow not triggering"
- Verify webhook URL is publicly accessible
- Check n8n credentials are configured
- Look at n8n execution logs for errors
- Test webhook with Postman/curl first

---

## Success Criteria

**You're on track if:**
- ✅ `npm run build` completes without errors
- ✅ TypeScript compiles (`npm run type-check`)
- ✅ Can sign up and log in
- ✅ Dashboard shows ranking data
- ✅ AI agents generate content
- ✅ Stripe checkout completes successfully
- ✅ Webhooks are received and processed
- ✅ Credits are deducted correctly

**MVP is complete when:**
- ✅ All Week 1 & Week 2 tasks completed
- ✅ Production deployment successful
- ✅ First paying customer can use all features
- ✅ No critical bugs in core flows
- ✅ Monitoring and alerts active

---

## Need Help?

1. **Check PRD documentation** in `PRD_Structure/` folder
2. **Review task breakdown** for current day
3. **Check external docs** linked above
4. **Debug systematically**: Frontend → API → Database → External Service
5. **Use console.log** liberally during development
6. **Test in isolation**: Test each component independently before integration

---

**Remember**: This is an MVP. Focus on getting the core flow working end-to-end before optimizing or adding nice-to-haves. Ship a working product in 2 weeks, then iterate based on real user feedback.

Good luck! 🚀
