# Week 1 Task Breakdown
## Focus: Infrastructure + Core Dashboard + Ranking System

**Goal:** By end of Week 1, have a working app where users can sign up, add queries, and see initial LLM ranking data in a dashboard.

---

## Day 1: Foundation & Infrastructure Setup
**Theme:** Get all services configured and connected

### Morning: Project Initialization
**Tasks:**
1. **Initialize Next.js Project**
   - [ ] Create new Next.js 14 app with App Router
   - [ ] Install core dependencies:
     ```bash
     npm install @supabase/supabase-js @supabase/ssr
     npm install @stripe/stripe-js stripe
     npm install @tanstack/react-query zustand
     npm install tailwindcss @shadcn/ui lucide-react
     npm install date-fns recharts
     ```
   - [ ] Configure TypeScript strict mode
   - [ ] Set up ESLint and Prettier
   - [ ] Initialize git repository
   - [ ] Create folder structure as per Frontend spec

2. **Set Up Version Control**
   - [ ] Create GitHub repository
   - [ ] Add `.gitignore` (include `.env.local`)
   - [ ] Initial commit with project scaffold
   - [ ] Create branches: `main`, `develop`

### Afternoon: Supabase Setup
**Tasks:**
3. **Create Supabase Project**
   - [ ] Sign up for Supabase
   - [ ] Create new project (choose region)
   - [ ] Note project URL and keys
   - [ ] Configure Supabase CLI locally

4. **Database Schema - Part 1 (Core Tables)**
   - [ ] Create migration file: `20260214000000_initial_schema.sql`
   - [ ] Implement tables:
     - [ ] `users` (profile table)
     - [ ] `subscriptions`
     - [ ] `credits`
     - [ ] `credit_transactions`
   - [ ] Set up foreign keys and indexes
   - [ ] Apply migration: `supabase db push`

5. **Authentication Configuration**
   - [ ] Configure auth providers (Email, Google OAuth)
   - [ ] Customize email templates
   - [ ] Set JWT expiry settings
   - [ ] Configure redirect URLs

### Evening: Vercel Deployment Setup
**Tasks:**
6. **Deploy to Vercel**
   - [ ] Connect GitHub repo to Vercel
   - [ ] Configure project settings
   - [ ] Add environment variables (Supabase keys)
   - [ ] Deploy initial version
   - [ ] Verify deployment successful

7. **Configure Custom Domain** (if ready)
   - [ ] Add domain in Vercel
   - [ ] Configure DNS records
   - [ ] Wait for SSL provisioning

**Day 1 Success Criteria:** ✅ Next.js app deployed to Vercel, Supabase database created with core tables, authentication configured

---

## Day 2: Database Complete + Auth Implementation
**Theme:** Finish database schema and implement authentication flows

### Morning: Complete Database Schema
**Tasks:**
1. **Database Schema - Part 2 (Tracking Tables)**
   - [ ] Create migration: `20260214100000_tracking_tables.sql`
   - [ ] Implement tables:
     - [ ] `tracked_queries`
     - [ ] `llm_rankings`
     - [ ] `competitor_tracking`
     - [ ] `competitor_mentions`
   - [ ] Set up indexes and foreign keys
   - [ ] Apply migration

2. **Database Schema - Part 3 (Content & Agents)**
   - [ ] Create migration: `20260214120000_content_agent_tables.sql`
   - [ ] Implement tables:
     - [ ] `recommendations`
     - [ ] `content_generations`
     - [ ] `agent_executions`
     - [ ] `notification_preferences`
   - [ ] Apply migration

3. **Database Functions & Triggers**
   - [ ] Create `handle_new_user()` function and trigger
   - [ ] Create `deduct_credits()` function
   - [ ] Create `allocate_monthly_credits()` function
   - [ ] Create `update_updated_at_timestamp` trigger
   - [ ] Test all functions work correctly

4. **Row-Level Security (RLS)**
   - [ ] Enable RLS on all tables
   - [ ] Create policies for users table (read/update own)
   - [ ] Create policies for tracked_queries (full CRUD own)
   - [ ] Create policies for rankings (read own)
   - [ ] Create service role exceptions
   - [ ] Test RLS with different user contexts

### Afternoon: Authentication Implementation
**Tasks:**
5. **Supabase Auth Integration**
   - [ ] Create `/lib/supabase/client.ts` (browser client)
   - [ ] Create `/lib/supabase/server.ts` (server client)
   - [ ] Create `/lib/supabase/middleware.ts` (auth middleware)
   - [ ] Set up auth state management (Zustand store)

6. **Sign Up Page**
   - [ ] Create `/app/(auth)/signup/page.tsx`
   - [ ] Build signup form (email, password, full name, company)
   - [ ] Implement form validation (zod)
   - [ ] Connect to Supabase auth.signUp()
   - [ ] Handle email verification flow
   - [ ] Add error handling and loading states
   - [ ] Style with Tailwind + Shadcn components

7. **Login Page**
   - [ ] Create `/app/(auth)/login/page.tsx`
   - [ ] Build login form (email, password)
   - [ ] Implement "Forgot Password" link
   - [ ] Connect to Supabase auth.signInWithPassword()
   - [ ] Implement Google OAuth button (signInWithOAuth)
   - [ ] Add error handling
   - [ ] Redirect to dashboard on success

### Evening: Auth Middleware & Password Reset
**Tasks:**
8. **Protected Routes Middleware**
   - [ ] Create `middleware.ts` in root
   - [ ] Implement auth check for `/dashboard/*` routes
   - [ ] Redirect unauthenticated users to `/login`
   - [ ] Handle session refresh

9. **Password Reset Flow**
   - [ ] Create `/app/(auth)/reset-password/page.tsx`
   - [ ] Implement reset request (email input)
   - [ ] Create `/app/(auth)/update-password/page.tsx`
   - [ ] Implement password update form
   - [ ] Connect to Supabase auth methods

10. **Test Authentication**
    - [ ] Sign up new user → verify email sent
    - [ ] Login with email/password → redirects to dashboard
    - [ ] Login with Google → redirects to dashboard
    - [ ] Access dashboard without auth → redirects to login
    - [ ] Password reset → email received, update works

**Day 2 Success Criteria:** ✅ Complete database schema deployed, RLS working, authentication flows functional (signup, login, password reset)

---

## Day 3: Dashboard Foundation + Onboarding
**Theme:** Build dashboard shell and user onboarding flow

### Morning: Dashboard Layout
**Tasks:**
1. **Dashboard Shell**
   - [ ] Create `/app/(dashboard)/dashboard/layout.tsx`
   - [ ] Build sidebar navigation component
     - [ ] Logo
     - [ ] Nav links (Dashboard, Recommendations, Content, Settings)
     - [ ] User avatar/menu
     - [ ] Credits display
   - [ ] Build top navigation bar
     - [ ] Breadcrumbs
     - [ ] Search (Phase 2)
     - [ ] Notifications icon (Phase 2)
   - [ ] Implement mobile responsive menu (hamburger)

2. **Dashboard Home Page**
   - [ ] Create `/app/(dashboard)/dashboard/page.tsx`
   - [ ] Build empty state UI
   - [ ] Create "Add Your First Query" CTA
   - [ ] Style with dashboard layout

3. **State Management Setup**
   - [ ] Create Zustand store for user data
   - [ ] Create Zustand store for credits
   - [ ] Set up React Query client provider
   - [ ] Create query hooks for user profile
   - [ ] Create query hooks for credits

### Afternoon: Onboarding Flow
**Tasks:**
4. **Onboarding Modal/Wizard**
   - [ ] Create `/components/onboarding/OnboardingModal.tsx`
   - [ ] Step 1: Welcome + value proposition
   - [ ] Step 2: "Tell us about your business"
     - [ ] Business name (autofill from signup)
     - [ ] Website URL
     - [ ] Industry dropdown
   - [ ] Step 3: "Add your first tracked queries"
     - [ ] Query input (min 1, max 5)
     - [ ] Target URL for each query
     - [ ] Category/tags (optional)
   - [ ] Progress indicator (steps 1/3, 2/3, 3/3)
   - [ ] Skip option (go back later)

5. **Onboarding API Route**
   - [ ] Create `/app/api/onboarding/complete/route.ts`
   - [ ] Validate inputs
   - [ ] Update users.onboarding_completed = true
   - [ ] Insert tracked_queries
   - [ ] Trigger n8n Initial Analysis workflow (webhook call)
   - [ ] Return success

6. **Onboarding Trigger Logic**
   - [ ] Check if onboarding_completed on dashboard load
   - [ ] If false, show modal
   - [ ] After completion, hide modal and show dashboard

### Evening: Query Management UI
**Tasks:**
7. **Query List Component**
   - [ ] Create `/components/dashboard/QueryList.tsx`
   - [ ] Fetch tracked_queries from Supabase
   - [ ] Display as cards/table:
     - [ ] Query text
     - [ ] Target URL
     - [ ] Status (active/paused)
     - [ ] Actions (edit, pause, delete)
   - [ ] Empty state: "No queries yet"

8. **Add Query Modal**
   - [ ] Create `/components/dashboard/AddQueryModal.tsx`
   - [ ] Form: query text, target URL, category, priority
   - [ ] Validation
   - [ ] Create API route: `/api/queries/create/route.ts`
   - [ ] Insert into tracked_queries
   - [ ] Refresh query list on success

9. **Edit/Delete Queries**
   - [ ] Create `/api/queries/update/route.ts`
   - [ ] Create `/api/queries/delete/route.ts`
   - [ ] Connect to edit/delete buttons
   - [ ] Show confirmation dialog for delete

**Day 3 Success Criteria:** ✅ Dashboard layout functional, onboarding flow complete, users can add/edit/delete tracked queries

---

## Day 4: n8n Setup + Initial Analysis Workflow
**Theme:** Set up n8n Cloud and implement first AI workflow

### Morning: n8n Cloud Configuration
**Tasks:**
1. **Create n8n Cloud Account**
   - [ ] Sign up for n8n Cloud (Pro plan trial)
   - [ ] Create new workspace
   - [ ] Note instance URL

2. **Configure Credentials in n8n**
   - [ ] Add Supabase HTTP Request credential
     - [ ] URL: SUPABASE_URL
     - [ ] Authorization header with service role key
   - [ ] Add OpenAI credential (API key)
   - [ ] Add Anthropic HTTP credential (API key)
   - [ ] Add Perplexity HTTP credential (API key)
   - [ ] Add Gemini HTTP credential (API key)

3. **Test Credentials**
   - [ ] Create test workflow
   - [ ] Test each credential with simple request
   - [ ] Verify responses received

### Afternoon: Build Initial Analysis Workflow (Part 1)
**Tasks:**
4. **Workflow: Initial Analysis - Structure**
   - [ ] Create new workflow: "Initial Analysis"
   - [ ] Add Webhook trigger node
     - [ ] Path: `/webhook/initial-analysis`
     - [ ] Method: POST
     - [ ] Authentication: Header Auth (API key)
   - [ ] Add Function node: "Validate Input"
     - [ ] Check required fields present
   - [ ] Add HTTP Request node: "Create Execution Record"
     - [ ] POST to Supabase agent_executions
     - [ ] Save execution_id for later

5. **Workflow: LLM Ranking Checks**
   - [ ] Add Loop node: "For Each Query"
   - [ ] Inside loop, add 5 parallel branches (Split In Batches):

     **Branch 1: ChatGPT**
     - [ ] HTTP Request to OpenAI API
     - [ ] Model: gpt-4o
     - [ ] Prompt: As per n8n spec (query + analysis request)
     - [ ] Parse JSON response

     **Branch 2: Claude**
     - [ ] HTTP Request to Anthropic API
     - [ ] Model: claude-opus-4-5-20251101
     - [ ] Same prompt structure
     - [ ] Parse response

     **Branch 3: Perplexity**
     - [ ] HTTP Request to Perplexity API
     - [ ] Model: sonar-pro
     - [ ] Parse response with citations

     **Branch 4: Gemini**
     - [ ] HTTP Request to Gemini API
     - [ ] Model: gemini-2.0-flash-exp
     - [ ] Parse response

     **Branch 5: Google AI Overviews**
     - [ ] Placeholder node (Phase 2)
     - [ ] Return mock data for now

### Evening: Build Initial Analysis Workflow (Part 2)
**Tasks:**
6. **Workflow: Store Rankings**
   - [ ] Add Merge node: "Combine LLM Responses"
   - [ ] Add Loop node: "For Each LLM Response"
   - [ ] HTTP Request: "Insert Ranking"
     - [ ] POST to Supabase llm_rankings
     - [ ] Map all fields from LLM response

7. **Workflow: Generate Initial Recommendations**
   - [ ] HTTP Request to Claude Opus
   - [ ] Prompt: Analyze all rankings, generate recommendations
   - [ ] Parse JSON array of recommendations
   - [ ] Loop: Insert each into recommendations table

8. **Workflow: Complete Execution**
   - [ ] HTTP Request: Update agent_execution
     - [ ] PATCH to Supabase
     - [ ] Set status = "completed"
     - [ ] Add output_data summary
   - [ ] Error Handler sub-workflow
     - [ ] Catch errors
     - [ ] Log to agent_executions
     - [ ] Send alert (console log for now)

9. **Test Workflow**
   - [ ] Activate workflow
   - [ ] Get webhook URL from n8n
   - [ ] Test with Postman/curl
   - [ ] Verify:
     - [ ] Rankings inserted in database
     - [ ] Recommendations created
     - [ ] Execution logged

**Day 4 Success Criteria:** ✅ n8n Cloud configured, Initial Analysis workflow working end-to-end, can trigger via webhook and see results in Supabase

---

## Day 5: Connect Frontend to Workflow + Display Rankings
**Theme:** Trigger workflow from frontend and display results

### Morning: Trigger Initial Analysis from Onboarding
**Tasks:**
1. **Environment Variables**
   - [ ] Add to Vercel:
     - [ ] N8N_WEBHOOK_BASE_URL
     - [ ] N8N_WEBHOOK_SECRET
     - [ ] Add all LLM API keys (even though n8n calls them)

2. **Trigger Workflow from API**
   - [ ] Update `/api/onboarding/complete/route.ts`
   - [ ] After saving queries, make HTTP request to n8n webhook
   - [ ] Body: user_id, business_name, website_url, queries array
   - [ ] Headers: x-api-key for authentication
   - [ ] Handle response (202 Accepted)
   - [ ] Don't wait for completion (async)

3. **Loading State in Frontend**
   - [ ] After onboarding, show "Analyzing your queries..."
   - [ ] Poll agent_executions table for completion
   - [ ] React Query with refetchInterval: 5000
   - [ ] When status = "completed", show results

### Afternoon: Build Rankings Display
**Tasks:**
4. **Rankings Overview Component**
   - [ ] Create `/components/dashboard/RankingsOverview.tsx`
   - [ ] Fetch llm_rankings for user's queries (latest)
   - [ ] Calculate metrics:
     - [ ] Overall mention rate (% queries mentioned)
     - [ ] Mentions by LLM provider
     - [ ] Average position when mentioned
     - [ ] Sentiment distribution

5. **Rankings Chart Component**
   - [ ] Create `/components/dashboard/RankingsChart.tsx`
   - [ ] Use Recharts BarChart
   - [ ] X-axis: LLM providers
   - [ ] Y-axis: Mention rate (%)
   - [ ] Color code: Mentioned (green), Not mentioned (red)

6. **Query-Level Ranking Table**
   - [ ] Create `/components/dashboard/QueryRankingsTable.tsx`
   - [ ] Table columns:
     - [ ] Query text
     - [ ] ChatGPT (✓/✗ + position)
     - [ ] Claude (✓/✗ + position)
     - [ ] Perplexity (✓/✗ + position)
     - [ ] Gemini (✓/✗ + position)
     - [ ] Google AI (✓/✗ + position)
     - [ ] Overall score
   - [ ] Sortable columns
   - [ ] Click row → show detail modal

### Evening: Ranking Detail Modal
**Tasks:**
7. **Ranking Detail Modal**
   - [ ] Create `/components/dashboard/RankingDetailModal.tsx`
   - [ ] Show for selected query:
     - [ ] Full LLM responses (truncated with "Read more")
     - [ ] Mention context highlighted
     - [ ] Sentiment badge
     - [ ] Competitors mentioned
     - [ ] Timestamp of check
   - [ ] Tabs for each LLM provider

8. **Update Dashboard Home Page**
   - [ ] Add RankingsOverview at top
   - [ ] Add RankingsChart below
   - [ ] Add QueryRankingsTable below that
   - [ ] Handle loading states
   - [ ] Handle empty state (no rankings yet)

9. **Polish & Styling**
   - [ ] Ensure responsive design
   - [ ] Add tooltips explaining metrics
   - [ ] Add refresh button (manual trigger)
   - [ ] Add last updated timestamp

**Day 5 Success Criteria:** ✅ Onboarding triggers Initial Analysis, frontend displays ranking results, users can see how they rank across LLMs

---

## Day 6: Credits System + Stripe Setup (Test Mode)
**Theme:** Implement credit tracking and basic Stripe integration

### Morning: Credits Display & Tracking
**Tasks:**
1. **Credits API Routes**
   - [ ] Create `/api/credits/balance/route.ts`
     - [ ] GET: Fetch user's credit record
     - [ ] Return total_credits, monthly_allocation, rollover, bonus
   - [ ] Create `/api/credits/transactions/route.ts`
     - [ ] GET: Fetch recent credit transactions
     - [ ] Pagination support

2. **Credits Display Component**
   - [ ] Create `/components/dashboard/CreditsWidget.tsx`
   - [ ] Show in dashboard sidebar
   - [ ] Display:
     - [ ] Total credits remaining (large number)
     - [ ] Progress bar (used vs allocated)
     - [ ] "Add Credits" button
   - [ ] Fetch from API with React Query

3. **Credits History Page**
   - [ ] Create `/app/(dashboard)/dashboard/credits/page.tsx`
   - [ ] Table of credit_transactions
     - [ ] Date
     - [ ] Type (debit/credit/allocation)
     - [ ] Amount
     - [ ] Description
     - [ ] Balance after
   - [ ] Pagination
   - [ ] Filters by type

### Afternoon: Stripe Setup (Test Mode)
**Tasks:**
4. **Create Stripe Account**
   - [ ] Sign up for Stripe
   - [ ] Activate account
   - [ ] Note test API keys

5. **Create Products & Prices in Stripe**
   - [ ] Product: Starter
     - [ ] Price: $49/month (test mode)
     - [ ] Price: $470/year (test mode)
     - [ ] Add metadata: plan_tier, monthly_credits
   - [ ] Product: Professional
     - [ ] Price: $199/month
     - [ ] Price: $1910/year
     - [ ] Add metadata
   - [ ] Product: Enterprise
     - [ ] Price: $799/month
     - [ ] Price: $7670/year
     - [ ] Add metadata
   - [ ] Product: Credits 50/100/500
     - [ ] One-time prices
     - [ ] Add metadata: credit_amount

6. **Stripe Environment Variables**
   - [ ] Add to Vercel (Preview/Dev):
     - [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test)
     - [ ] STRIPE_SECRET_KEY (test)
     - [ ] PRICE_STARTER_MONTHLY (test ID)
     - [ ] ... all other price IDs

### Evening: Stripe Checkout Integration
**Tasks:**
7. **Stripe Checkout API Route**
   - [ ] Create `/app/api/stripe/create-checkout-session/route.ts`
   - [ ] Input: priceId, userId
   - [ ] Create Stripe Checkout Session:
     - [ ] mode: subscription
     - [ ] line_items: [priceId]
     - [ ] success_url, cancel_url
     - [ ] client_reference_id: userId
     - [ ] subscription_data.trial_period_days: 14
   - [ ] Return checkout URL

8. **Pricing Page (Basic)**
   - [ ] Create `/app/(marketing)/pricing/page.tsx`
   - [ ] Three tier cards:
     - [ ] Starter: $49/mo, features list
     - [ ] Professional: $199/mo, features list
     - [ ] Enterprise: $799/mo, features list
   - [ ] "Start Free Trial" buttons
   - [ ] Annual toggle (20% discount)

9. **Connect Pricing to Checkout**
   - [ ] Button click → call /api/stripe/create-checkout-session
   - [ ] Redirect to Stripe Checkout URL
   - [ ] After checkout, redirect to success_url (dashboard)

10. **Test Checkout Flow**
    - [ ] Click "Start Free Trial" on Starter
    - [ ] Complete Stripe checkout (test card: 4242...)
    - [ ] Redirect to dashboard
    - [ ] (Webhook handler will be done tomorrow)

**Day 6 Success Criteria:** ✅ Credits visible in dashboard, Stripe test account configured, checkout redirects to Stripe, payment flow initiated (not yet complete)

---

## Day 7: Stripe Webhooks + Polish
**Theme:** Complete payment integration and polish the MVP

### Morning: Stripe Webhook Handler
**Tasks:**
1. **Webhook Endpoint**
   - [ ] Create `/app/api/webhooks/stripe/route.ts`
   - [ ] Verify stripe-signature header
   - [ ] Parse event from raw body
   - [ ] Add STRIPE_WEBHOOK_SECRET to env vars

2. **Handle: checkout.session.completed**
   - [ ] Get session details
   - [ ] Check mode (subscription vs payment)
   - [ ] If subscription:
     - [ ] Get or create customer in Supabase
     - [ ] Insert subscription record (status: trialing)
     - [ ] Allocate trial credits (call deduct_credits RPC)
     - [ ] Send welcome email (Phase 2, log for now)
   - [ ] If payment (credit top-up):
     - [ ] Add to bonus_credits
     - [ ] Log transaction

3. **Handle: invoice.payment_succeeded**
   - [ ] Update subscription current_period
   - [ ] Allocate monthly credits
   - [ ] Log transaction

4. **Handle: customer.subscription.updated**
   - [ ] Update subscription record in Supabase
   - [ ] If plan changed, adjust credits

5. **Handle: customer.subscription.deleted**
   - [ ] Update status to canceled
   - [ ] Keep access until period end

6. **Configure Webhook in Stripe**
   - [ ] Go to Stripe Dashboard → Webhooks
   - [ ] Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - [ ] Select events: checkout.session.completed, invoice.*, customer.subscription.*
   - [ ] Get webhook secret, add to env vars

7. **Test Webhooks**
   - [ ] Use Stripe CLI to forward webhooks locally
   - [ ] Complete test checkout
   - [ ] Verify subscription created in Supabase
   - [ ] Verify credits allocated

### Afternoon: Subscription Status Display
**Tasks:**
8. **Subscription Info API**
   - [ ] Create `/api/stripe/subscription-status/route.ts`
   - [ ] Fetch from Supabase subscriptions table
   - [ ] Include credits, usage, next billing date
   - [ ] Return formatted response

9. **Settings Page - Billing Tab**
   - [ ] Create `/app/(dashboard)/dashboard/settings/page.tsx`
   - [ ] Tabs: Profile, Billing, Notifications
   - [ ] Billing tab:
     - [ ] Current plan display
     - [ ] Credits allocated/used
     - [ ] Next billing date
     - [ ] "Manage Subscription" button → Stripe portal
     - [ ] "Upgrade Plan" buttons

10. **Stripe Customer Portal**
    - [ ] Create `/api/stripe/create-portal-session/route.ts`
    - [ ] Create Stripe Billing Portal session
    - [ ] Return portal URL
    - [ ] "Manage Subscription" button opens portal in new tab

### Evening: Polish & Testing
**Tasks:**
11. **Error Handling Improvements**
    - [ ] Add global error boundary
    - [ ] Add toast notifications (sonner or react-hot-toast)
    - [ ] Show user-friendly error messages
    - [ ] Log errors to console (Phase 2: Sentry)

12. **Loading States**
    - [ ] Add skeleton loaders to dashboard
    - [ ] Add loading spinners to modals
    - [ ] Disable buttons during API calls

13. **Mobile Responsiveness**
    - [ ] Test dashboard on mobile viewports
    - [ ] Fix sidebar (collapse to hamburger menu)
    - [ ] Ensure tables are scrollable
    - [ ] Test all modals on mobile

14. **End-to-End Testing**
    - [ ] Complete user journey:
      1. Sign up
      2. Complete onboarding
      3. Wait for Initial Analysis
      4. View rankings
      5. Start trial (checkout)
      6. Verify subscription active
      7. View credits allocated
    - [ ] Test error scenarios:
      - [ ] Invalid login
      - [ ] Network failures
      - [ ] Checkout cancellation

15. **Documentation**
    - [ ] Update README with setup instructions
    - [ ] Document environment variables
    - [ ] Add comments to complex code sections

**Day 7 Success Criteria:** ✅ Complete payment flow working (signup → trial → subscription), credits allocated automatically, dashboard polished and mobile-ready

---

## Week 1 Deliverables Checklist

### Infrastructure
- [ ] Next.js 14 app deployed to Vercel
- [ ] Supabase database with complete schema
- [ ] n8n Cloud configured with credentials
- [ ] GitHub repository with CI/CD

### Authentication
- [ ] Signup with email verification
- [ ] Login (email/password + Google OAuth)
- [ ] Password reset flow
- [ ] Protected routes middleware

### Dashboard
- [ ] Responsive dashboard layout
- [ ] Sidebar navigation
- [ ] User profile display
- [ ] Credits widget

### Query Management
- [ ] Onboarding flow to add queries
- [ ] Add/edit/delete queries
- [ ] Query list/table display

### Ranking System
- [ ] Initial Analysis n8n workflow
- [ ] Webhook trigger from frontend
- [ ] Rankings stored in database
- [ ] Rankings displayed in dashboard (tables + charts)
- [ ] Detail view for individual rankings

### Billing
- [ ] Stripe test account configured
- [ ] Products and prices created
- [ ] Checkout flow functional
- [ ] Webhooks handling subscription events
- [ ] Credits automatically allocated
- [ ] Subscription status display
- [ ] Stripe Customer Portal integration

### Quality
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error handling
- [ ] Basic documentation

---

## Week 1 Success Metrics
- [ ] New user can sign up and see rankings within 5 minutes
- [ ] Dashboard loads in < 2 seconds
- [ ] All API routes respond in < 500ms
- [ ] Zero TypeScript errors
- [ ] Zero console errors in browser
- [ ] Can complete full user journey without bugs

---

## Notes for Claude Code

**Week 1 Priority:**
Focus on getting the core user flow working end-to-end. Don't worry about:
- Advanced features (content generation, recommendations viewing)
- Production deployment (use preview/test mode)
- Perfect styling (functional > beautiful for Week 1)
- Edge cases (handle happy path first)

**Testing Approach:**
- Test after each major component
- Use Supabase Dashboard to verify database changes
- Use n8n execution logs to debug workflows
- Use Stripe Dashboard to verify payments

**If Behind Schedule:**
- Days 1-3 are critical (foundation)
- Day 4 n8n can be simplified (fewer LLM checks)
- Day 6 Stripe can be minimal (checkout only, polish later)
- Day 7 is buffer for polish and catching up

**Daily Standup Questions:**
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?
4. Are we on track for Week 1 goals?

**End of Week 1:** You should have a demoable product showing the core value proposition: "Track where you appear in LLM search results."
