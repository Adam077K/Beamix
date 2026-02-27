# Frontend Build Specifications
## Next.js 14 (App Router) + Shadcn UI + Tailwind CSS

**Build Component:** Frontend Web Application
**Framework:** Next.js 14 with App Router
**UI Library:** Shadcn UI + Tailwind CSS
**State Management:** React Query (server state) + Zustand (client state) - OR Claude Code decides best approach
**Deployment:** Vercel
**Estimated Build Time:** Week 1 (Days 1-5)

---

## Architecture Overview

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── signup/
│       └── page.tsx          # Signup page + onboarding form
│
├── (dashboard)/
│   ├── layout.tsx            # Dashboard layout (sidebar, header)
│   ├── page.tsx              # Main dashboard (metrics overview)
│   ├── recommendations/
│   │   └── page.tsx          # Recommendations list
│   ├── content/
│   │   └── page.tsx          # My Generated Content (history)
│   └── settings/
│       └── page.tsx          # Account settings, subscription
│
├── api/
│   ├── agents/
│   │   ├── content-writer.ts # Trigger Content Writer Agent
│   │   ├── competitor-research.ts
│   │   └── query-researcher.ts
│   ├── credits/
│   │   ├── balance.ts        # Get credit balance
│   │   └── deduct.ts         # Deduct credits (internal use)
│   ├── dashboard/
│   │   ├── overview.ts       # Dashboard metrics
│   │   └── competitors.ts    # Competitor comparison data
│   └── subscription/
│       ├── current.ts        # Get current subscription
│       └── webhook.ts        # Stripe webhooks
│
└── components/
    ├── dashboard/
    │   ├── MetricsCard.tsx   # Reusable metric display
    │   ├── RankingChart.tsx  # Line chart for ranking trends
    │   ├── CompetitorTable.tsx
    │   └── QueryList.tsx
    ├── agents/
    │   ├── ContentWriterModal.tsx
    │   ├── CompetitorResearchModal.tsx
    │   └── QueryResearcherModal.tsx
    ├── recommendations/
    │   └── RecommendationCard.tsx
    └── ui/                   # Shadcn components
        ├── button.tsx
        ├── card.tsx
        ├── modal.tsx
        └── ...
```

---

## Page Specifications

### 1. Authentication Pages

#### 1.1 Signup Page (`/signup`)

**Purpose:** User creates account + provides business information

**Layout:**
- Left side (50%): Signup form
- Right side (50%): Marketing copy + testimonials (optional)

**Form Fields:**
1. Email (required, validated)
2. Password (required, min 8 chars, must include number + special char)
3. Business Name (required)
4. Website URL (optional, auto-prefixes `https://`)
5. Primary Location (required, typeahead search for cities)
6. Industry Vertical (optional dropdown: Relocation, Construction, Insurance, etc.)

**User Flow:**
1. User fills form → clicks "Create Account"
2. Frontend validates inputs → calls Supabase Auth signup
3. If success → email verification sent → redirect to `/dashboard` with banner: "Please verify your email"
4. If error (e.g., email already exists) → show inline error message

**Backend Trigger:**
- On successful signup → Supabase database trigger → calls `/api/onboarding/trigger-analysis` → triggers n8n Initial Analysis workflow

**Component Structure:**
```tsx
<SignupPage>
  <SignupForm>
    <Input name="email" type="email" validation={emailSchema} />
    <Input name="password" type="password" validation={passwordSchema} />
    <Input name="business_name" />
    <Input name="website" placeholder="https://example.com" />
    <Typeahead name="location" apiEndpoint="/api/locations/search" />
    <Select name="industry_vertical" options={INDUSTRY_OPTIONS} />
    <Button type="submit">Create Account</Button>
  </SignupForm>
  <MarketingContent>
    <Testimonial />
    <Features />
  </MarketingContent>
</SignupPage>
```

**Validation Rules:**
- Email: valid email format, not already registered
- Password: >=8 chars, includes 1 number, 1 special char
- Business Name: >=2 chars
- Website: valid URL format (auto-add `https://` if missing)
- Location: must select from typeahead (not freeform text)

---

#### 1.2 Login Page (`/login`)

**Purpose:** Existing users log in

**Layout:** Centered card (max-width: 400px)

**Form Fields:**
1. Email
2. Password
3. "Forgot Password?" link
4. "Remember me" checkbox

**User Flow:**
1. User enters credentials → clicks "Log In"
2. Frontend calls Supabase Auth login
3. If success → redirect to `/dashboard`
4. If error → show "Invalid email or password"

**Component:**
```tsx
<LoginPage>
  <LoginForm>
    <Input name="email" type="email" />
    <Input name="password" type="password" />
    <Checkbox name="remember_me" label="Remember me" />
    <Link href="/forgot-password">Forgot Password?</Link>
    <Button type="submit">Log In</Button>
  </LoginForm>
  <Link href="/signup">Don't have an account? Sign up</Link>
</LoginPage>
```

---

### 2. Dashboard Page (`/dashboard`)

**Purpose:** Main hub showing LLM rankings, metrics, and recommendations

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│ Header: Logo | Credits: 27 | Upgrade | Profile ▼                │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Sidebar:                                                     │ │
│ │ - Dashboard (active)                                         │ │
│ │ - Recommendations                                            │ │
│ │ - My Generated Content                                       │ │
│ │ - Settings                                                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Main Content Area:                                               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 🔄 Analysis Status: ● Complete (Last updated: 2 hours ago)   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Key Metrics (4 cards in row):                                    │
│ ┌─────────┬─────────┬─────────┬─────────────────┐               │
│ │ Avg     │ Mention │ Citation│ Competitor Gap  │               │
│ │ Ranking │ Count   │ Count   │                 │               │
│ │ 4.2 ↑   │ 87 ↑   │ 23 →    │ -2.3 positions  │               │
│ └─────────┴─────────┴─────────┴─────────────────┘               │
│                                                                  │
│ Ranking Trend (Line Chart):                                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │  Avg Ranking Position (Last 30 Days)                         │ │
│ │  10 ┌──────────────────────────────────────────────────────┐ │ │
│ │   8 │                                          ╱──╲         │ │ │
│ │   6 │                               ╱────╲   ╱    ╲        │ │ │
│ │   4 │                 ╱────╲       ╱      ╲─╱      ╲──     │ │ │
│ │   2 │  ╱────╲       ╱      ╲─────╱                        │ │ │
│ │   0 └──────────────────────────────────────────────────────┘ │ │
│ │      Jan 15    Jan 20    Jan 25    Jan 30    Feb 5          │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Competitor Comparison (Table):                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Business         │ Avg Ranking │ Mentions │ Citations       │ │
│ │ ────────────────────────────────────────────────────────────  │ │
│ │ Your Business    │ 4.2 ↑       │ 87 ↑     │ 23 →            │ │
│ │ Competitor A     │ 2.1 ↑       │ 145 ↑    │ 67 ↑            │ │
│ │ Competitor B     │ 5.8 ↓       │ 62 ↓     │ 15 →            │ │
│ │ Competitor C     │ 3.5 →       │ 98 →     │ 34 ↑            │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Top Recommendations (3 cards):                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ⚡ HIGH IMPACT                                                │ │
│ │ Write article: "Best relocation services in Tel Aviv"        │ │
│ │ Impact: HIGH | Effort: MEDIUM | Cost: 3 credits              │ │
│ │ [Generate Article]                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ [View All Recommendations →]                                     │
└──────────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- **Key Metrics:** Fetch from `/api/dashboard/overview?date_range=30d`
- **Ranking Trend:** Same API, returns time-series data
- **Competitor Comparison:** `/api/dashboard/competitors`
- **Recommendations:** `/api/dashboard/recommendations?limit=3`

**Component Structure:**
```tsx
<DashboardPage>
  <DashboardHeader>
    <CreditBalance credits={27} tierName="Pro" />
    <UpgradeButton />
    <UserMenu />
  </DashboardHeader>

  <DashboardSidebar>
    <NavLink href="/dashboard" active>Dashboard</NavLink>
    <NavLink href="/recommendations">Recommendations</NavLink>
    <NavLink href="/content">My Generated Content</NavLink>
    <NavLink href="/settings">Settings</NavLink>
  </DashboardSidebar>

  <DashboardMain>
    <AnalysisStatus status="complete" lastUpdated="2 hours ago" />

    <MetricsGrid>
      <MetricsCard title="Avg Ranking" value="4.2" trend="up" />
      <MetricsCard title="Mention Count" value="87" trend="up" />
      <MetricsCard title="Citation Count" value="23" trend="neutral" />
      <MetricsCard title="Competitor Gap" value="-2.3 positions" />
    </MetricsGrid>

    <RankingChart data={rankingTrendData} />

    <CompetitorTable competitors={competitorsData} />

    <RecommendationsPreview recommendations={topRecommendations} />
  </DashboardMain>
</DashboardPage>
```

**Interactions:**
- **Click "Generate Article" in recommendation card** → opens `ContentWriterModal`
- **Click "View All Recommendations"** → navigates to `/recommendations`
- **Click competitor name in table** → opens `CompetitorDetailsModal` (shows detailed analysis)
- **Hover trend indicator (↑↓→)** → tooltip shows "Improved by 1.2 positions vs. last week"

---

### 3. Recommendations Page (`/recommendations`)

**Purpose:** Full list of actionable recommendations

**Layout:**
- Filter bar (top): Filter by Impact (High/Medium/Low), Status (Pending/Done/Dismissed)
- Recommendation cards (grid, 2 per row)

**Recommendation Card Format:**
```
┌────────────────────────────────────────────────────┐
│ ⚡ HIGH IMPACT                                      │
│                                                    │
│ Write an article about:                            │
│ "Best relocation services in Tel Aviv"             │
│                                                    │
│ Why: You rank #6 for this query. Competitor A     │
│      ranks #1 with detailed article.              │
│                                                    │
│ Impact: HIGH (est. 500 searches/month)             │
│ Effort: MEDIUM (3 credits)                         │
│                                                    │
│ [Generate Article] [Mark Done] [Dismiss]          │
│                                                    │
│ Status: Pending                                    │
└────────────────────────────────────────────────────┘
```

**User Flow:**
1. User clicks "Generate Article" → opens `ContentWriterModal` with topic pre-filled
2. User clicks "Mark Done" → recommendation status changes to "Done", card grays out
3. User clicks "Dismiss" → recommendation hides (moves to "Dismissed" filter)

**Component:**
```tsx
<RecommendationsPage>
  <FilterBar>
    <Select name="impact" options={['All', 'High', 'Medium', 'Low']} />
    <Select name="status" options={['Pending', 'Done', 'Dismissed']} />
  </FilterBar>

  <RecommendationsGrid>
    {recommendations.map(rec => (
      <RecommendationCard
        key={rec.id}
        recommendation={rec}
        onGenerate={() => openContentWriterModal(rec)}
        onMarkDone={() => updateRecommendationStatus(rec.id, 'done')}
        onDismiss={() => updateRecommendationStatus(rec.id, 'dismissed')}
      />
    ))}
  </RecommendationsGrid>
</RecommendationsPage>
```

---

### 4. My Generated Content Page (`/content`)

**Purpose:** History of AI-generated content (articles, reports)

**Layout:** Table view

| Date | Type | Topic | Word Count | Actions |
|------|------|-------|------------|---------|
| Feb 14 | Article | Best relocation in Tel Aviv | 1,247 | [Download] [Copy] [Delete] |
| Feb 13 | Competitor Report | Competitor A Analysis | 842 | [Download] [Delete] |

**User Flow:**
1. User clicks "Download" → downloads `.md` file
2. User clicks "Copy" → copies content to clipboard
3. User clicks "Delete" → confirmation modal → deletes record

**Component:**
```tsx
<MyContentPage>
  <ContentTable>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Topic</th>
        <th>Word Count</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {contents.map(content => (
        <ContentRow
          key={content.id}
          content={content}
          onDownload={() => downloadContent(content)}
          onCopy={() => copyToClipboard(content)}
          onDelete={() => deleteContent(content.id)}
        />
      ))}
    </tbody>
  </ContentTable>
</MyContentPage>
```

---

## Component Specifications

### Agent Modals

#### ContentWriterModal

**Trigger:** User clicks "Generate Article" from recommendation or manual trigger

**Modal Layout:**

**State 1: Input Form**
```
┌───────────────────────────────────────────────────┐
│  Generate Article with Content Writer Agent      │
│  ───────────────────────────────────────────────  │
│                                                   │
│  Topic *                                          │
│  ┌─────────────────────────────────────────────┐ │
│  │ Best relocation services in Tel Aviv        │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Target Word Count (Optional)                     │
│  ┌──────┐                                         │
│  │ 1200 │ words                                   │
│  └──────┘                                         │
│                                                   │
│  Tone (Optional)                                  │
│  ● Professional  ○ Friendly  ○ Expert            │
│                                                   │
│  ☑ Include FAQ section (5-7 questions)           │
│                                                   │
│  Credits Required: 3                              │
│  Your Balance: 27 credits                         │
│                                                   │
│  [Cancel]              [Generate Article →]       │
└───────────────────────────────────────────────────┘
```

**State 2: Loading (Simulated Progress)**
```
┌───────────────────────────────────────────────────┐
│  Generating Your Article...                      │
│  ───────────────────────────────────────────────  │
│                                                   │
│  ✓ Analyzing topic...                            │
│  ✓ Researching industry trends...                │
│  ⏳ Writing content (1,200 words)...  65%        │
│  ○ Adding FAQ section...                         │
│  ○ Optimizing for LLMs...                        │
│                                                   │
│  Estimated Time Remaining: 2 minutes              │
│                                                   │
│  [Cancel Generation]                              │
└───────────────────────────────────────────────────┘
```

**Progress Steps:**
- Step 1: "Analyzing topic..." (5s)
- Step 2: "Researching industry trends..." (10s)
- Step 3: "Writing content..." (60-90s with progress bar)
- Step 4: "Adding FAQ section..." (20s)
- Step 5: "Optimizing for LLMs..." (10s)

**Implementation Note:** These are simulated progress updates (not real-time GPT-4o feedback). Use `setTimeout` to update progress state.

**State 3: Success**
```
┌───────────────────────────────────────────────────┐
│  ✓ Article Generated Successfully!               │
│  ───────────────────────────────────────────────  │
│                                                   │
│  Title: Best Relocation Services in Tel Aviv:    │
│         A Complete Guide                          │
│                                                   │
│  Word Count: 1,247 words                          │
│  Reading Time: ~6 minutes                         │
│  LLM Optimization Score: 92/100                   │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ # Best Relocation Services in Tel Aviv      │ │
│  │                                              │ │
│  │ When searching for relocation services...   │ │
│  │ [Scrollable preview, 10 lines visible]      │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Download Markdown] [Copy] [Regenerate (3 cr)]  │
│  [Close]                                          │
└───────────────────────────────────────────────────┘
```

**Component Structure:**
```tsx
const ContentWriterModal = ({ isOpen, onClose, initialTopic }) => {
  const [step, setStep] = useState<'input' | 'loading' | 'success' | 'error'>('input');
  const [topic, setTopic] = useState(initialTopic);
  const [wordCount, setWordCount] = useState(1200);
  const [tone, setTone] = useState('professional');
  const [includeFAQ, setIncludeFAQ] = useState(true);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setStep('loading');
    simulateProgress(); // Simulated progress updates

    const result = await fetch('/api/agents/content-writer', {
      method: 'POST',
      body: JSON.stringify({ topic, wordCount, tone, includeFAQ }),
    }).then(res => res.json());

    if (result.success) {
      setGeneratedContent(result.content);
      setStep('success');
    } else {
      setStep('error');
    }
  };

  const simulateProgress = () => {
    const steps = [
      { label: 'Analyzing topic...', duration: 5000, progress: 0 },
      { label: 'Researching industry trends...', duration: 10000, progress: 20 },
      { label: 'Writing content...', duration: 60000, progress: 40 },
      { label: 'Adding FAQ section...', duration: 20000, progress: 80 },
      { label: 'Optimizing for LLMs...', duration: 10000, progress: 95 },
    ];
    // Implement step-by-step progress updates
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {step === 'input' && <InputForm ... />}
      {step === 'loading' && <LoadingState progress={progress} />}
      {step === 'success' && <SuccessState content={generatedContent} />}
      {step === 'error' && <ErrorState />}
    </Modal>
  );
};
```

---

## State Management

**Server State (React Query):**
- Dashboard metrics: `useQuery({ queryKey: ['dashboard', 'overview'], queryFn: fetchDashboardOverview })`
- Competitors: `useQuery({ queryKey: ['competitors'], queryFn: fetchCompetitors })`
- Recommendations: `useQuery({ queryKey: ['recommendations'], queryFn: fetchRecommendations })`
- Credits: `useQuery({ queryKey: ['credits'], queryFn: fetchCreditBalance })`

**Client State (Zustand OR Redux Toolkit OR Other - Claude Code decides):**
- UI state: modal open/closed, sidebar collapsed/expanded
- Form state: agent input forms
- Toast notifications: success/error messages

**Example Zustand Store:**
```ts
import create from 'zustand';

interface AppState {
  isContentWriterModalOpen: boolean;
  openContentWriterModal: (initialTopic?: string) => void;
  closeContentWriterModal: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isContentWriterModalOpen: false,
  openContentWriterModal: (initialTopic) => set({ isContentWriterModalOpen: true }),
  closeContentWriterModal: () => set({ isContentWriterModalOpen: false }),
  showToast: (message, type) => { /* toast logic */ },
}));
```

---

## Design System (Medium Detail)

**Colors:**
- Primary: Blue (#3B82F6 or similar - Claude Code decides exact hex)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale (#F9FAFB, #E5E7EB, #6B7280, #111827)

**Typography:**
- Font Family: Inter or Geist Sans (Claude Code decides)
- Heading sizes: text-3xl, text-2xl, text-xl, text-lg
- Body: text-base
- Small: text-sm
- Code: font-mono

**Spacing:**
- Use Tailwind spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 (px)
- Consistent padding: p-4, p-6, p-8
- Consistent margin: mb-4, mt-6, etc.

**Components (Shadcn UI):**
- Button: Primary (solid), Secondary (outline), Tertiary (ghost)
- Card: White bg, shadow-sm, rounded-lg
- Input: Border, focus:ring-2, error state (border-red-500)
- Modal: Centered, backdrop blur, max-w-2xl
- Table: Hover states, alternating row colors (optional)

**Responsive:**
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Dashboard layout: Sidebar collapses on mobile (hamburger menu)

---

## API Integration (Frontend → Backend)

**Authentication:**
- All API calls include JWT token in Authorization header
- Token managed by Supabase Auth client-side
- Middleware validates token on backend

**API Call Pattern:**
```ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Example: Fetch dashboard overview
export const useDashboardOverview = (dateRange: string) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', dateRange],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/dashboard/overview?date_range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
};

// Example: Execute Content Writer Agent
export const useContentWriterAgent = () => {
  return useMutation({
    mutationFn: async (params: { topic: string; wordCount: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/agents/content-writer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
      return res.json();
    },
  });
};
```

---

## Testing Requirements

**Unit Tests:**
- Component rendering (Jest + React Testing Library)
- Form validation logic
- Utility functions (date formatting, word count calculation)

**Integration Tests:**
- User flows: Signup → Dashboard → Generate Article → Download
- API integration: Mock API responses, test data fetching

**E2E Tests (Optional for MVP):**
- Playwright tests for critical paths (signup, login, agent execution)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| **First Contentful Paint (FCP)** | <1.5s |
| **Largest Contentful Paint (LCP)** | <2.5s |
| **Time to Interactive (TTI)** | <3.5s |
| **Dashboard Load Time** | <2s (p95) |
| **Agent Execution (perceived)** | <5 min (with progress indicators) |

**Optimization Techniques:**
- Next.js Image Optimization (use `<Image>` component for all images)
- Code splitting (dynamic imports for modals, charts)
- React Query caching (staleTime: 5 minutes for dashboard metrics)
- Prefetch critical data on page load

---

## Deployment (Vercel)

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
N8N_WEBHOOK_URL=https://xxx.n8n.cloud/webhook/...
```

**Build Command:** `next build`
**Output Directory:** `.next`
**Framework Preset:** Next.js

**Auto-deploy:** Every git push to `main` branch → Vercel auto-deploys

---

## Developer Notes for Claude Code

**Decision Points:**
1. **State Management:** Choose between React Query + Zustand (recommended), Redux Toolkit, or Jotai based on complexity
2. **Form Handling:** Use React Hook Form + Zod for validation (recommended) OR Formik
3. **Charts:** Use Recharts (simple, lightweight) OR Chart.js (more features)
4. **Modal Library:** Headless UI (recommended for Shadcn compatibility) OR Radix UI

**Code Quality:**
- Use TypeScript strict mode
- ESLint + Prettier for code formatting
- Component naming: PascalCase
- File naming: kebab-case for files, PascalCase for components

**Folder Structure:**
- Components grouped by feature (`components/dashboard/`, `components/agents/`)
- Shared UI components in `components/ui/`
- Utility functions in `lib/utils.ts`
- API route handlers in `app/api/`

---

**END OF FRONTEND BUILD SPEC**

**Next Document:** `02_Supabase_Build_Spec.md`