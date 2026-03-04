# Testing Patterns

**Analysis Date:** 2025-02-27

## Test Framework

**Status:**
- No test framework currently configured
- No test files in `src/` directory
- Testing is Phase 2 (MVP focuses on feature completion)

**Recommended Setup (When Implementing):**
- **Runner:** Vitest or Jest with Next.js support
- **Assertion Library:** Vitest built-in or `expect()`
- **E2E Testing:** Playwright for critical user flows

## Run Commands (When Tests Exist)

```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode (to be configured)
npm run test:coverage    # Coverage report (to be configured)
```

## Test File Organization

**Planned Location:**
- Co-locate with source files using `.test.ts` or `.spec.ts` suffix
- Example structure:
  ```
  src/lib/utils/
  ├── index.ts
  ├── index.test.ts          # Co-located tests

  src/components/dashboard/
  ├── MetricsCard.tsx
  ├── MetricsCard.test.tsx    # Co-located tests

  src/app/api/queries/
  ├── route.ts
  ├── route.test.ts           # Co-located tests
  ```

**Naming:**
- Use `.test.ts` for consistent pattern across codebase
- Filename matches source: `component.test.tsx` for `component.tsx`

## Test Structure (When Implemented)

**Recommended Pattern for API Routes:**

```typescript
// src/app/api/queries/route.test.ts
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/queries', () => {
  it('should return list of queries for authenticated user', async () => {
    const request = new NextRequest(new URL('http://localhost/api/queries'))
    // Mock auth and Supabase
    const response = await GET(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.queries).toBeInstanceOf(Array)
  })

  it('should return 401 if not authenticated', async () => {
    // Omit auth mock
    const response = await GET(request)
    expect(response.status).toBe(401)
  })
})

describe('POST /api/queries', () => {
  it('should create query with valid input', async () => {
    const body = JSON.stringify({ query_text: 'valid search term here' })
    const request = new NextRequest(new URL('http://localhost/api/queries'), {
      method: 'POST',
      body
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('should validate query text length', async () => {
    // Test with text < 10 chars
    // Expect BadRequestError with status 400
  })
})
```

**Recommended Pattern for Components:**

```typescript
// src/components/dashboard/MetricsCard.test.tsx
import { render, screen } from '@testing-library/react'
import { MetricsCard } from './MetricsCard'
import { TrendingUp } from 'lucide-react'

describe('MetricsCard', () => {
  it('should render title and value', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={42}
        icon={TrendingUp}
      />
    )
    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should show loading skeleton', () => {
    render(<MetricsCard title="Test" value={null} isLoading={true} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should display trend indicator', () => {
    render(
      <MetricsCard
        title="Ranking"
        value="#5"
        trend="up"
      />
    )
    expect(screen.getByText(/Improving/)).toBeInTheDocument()
  })
})
```

**Recommended Pattern for Hooks:**

```typescript
// src/lib/hooks/useQueries.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useQueries } from './useQueries'
import * as queryClient from '@/lib/react-query/client'

describe('useQueries', () => {
  beforeEach(() => {
    // Mock React Query client
    jest.spyOn(queryClient, 'queryClient')
  })

  it('should fetch queries on mount', async () => {
    const { result } = renderHook(() => useQueries())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.queries).toBeInstanceOf(Array)
  })

  it('should handle add query mutation', async () => {
    const { result } = renderHook(() => useQueries())

    await act(async () => {
      await result.current.addQuery.mutateAsync({
        query_text: 'new query here'
      })
    })

    // Verify query was added
  })
})
```

## Mocking

**Framework:** (When configured)
- Use Jest/Vitest mocking for dependencies
- Mock Supabase client calls
- Mock Next.js request/response objects
- Mock API calls in components via React Query

**Patterns:**

**Mock Supabase Client:**
```typescript
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { ... }, error: null })
    }))
  }))
}))
```

**Mock API Responses:**
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      data: { queries: [...] }
    })
  })
)
```

**Mock React Query:**
```typescript
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: mockData,
    isLoading: false,
    error: null
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false
  }))
}))
```

**What to Mock:**
- External API calls (Supabase, OpenAI, Paddle)
- Next.js server utilities (createClient, middleware)
- Browser APIs (fetch, localStorage, window)
- Third-party libraries with side effects

**What NOT to Mock:**
- Utility functions (`formatDate`, `cn`, etc.) - test them directly
- Simple data transformations - test logic is intact
- Component structure (use React Testing Library instead)
- Small, well-tested libraries (zod validation, clsx)

## Fixtures and Factories

**Test Data:**
- Create factory functions for test data generation
- Location: `src/__tests__/factories/` (when created)

```typescript
// src/__tests__/factories/query.ts
export function createMockQuery(overrides = {}) {
  return {
    id: 'test-query-id',
    query_text: 'test search term',
    source: 'user-added' as const,
    category: null,
    priority: 'medium' as const,
    is_active: true,
    avg_ranking: 5.5,
    last_checked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createMockResponse<T>(data: T) {
  return {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() }
  }
}
```

**Location:**
- `src/__tests__/factories/` for factory functions
- `src/__tests__/fixtures/` for static test data
- `src/__tests__/mocks/` for mock handlers

## Coverage

**Requirements:** (When configured)
- Recommended minimum: 70% for critical paths
- Phase 1 MVP: Focus on API routes and utility functions
- Phase 2: Add component and hook tests
- Phase 3: Improve coverage to 80%+

**View Coverage:**
```bash
npm run test:coverage
# Generates coverage report in coverage/ directory
```

## Test Types

**Unit Tests:**
- **Scope:** Individual functions and utilities
- **Examples:** `formatDate()`, `getRankingChange()`, `cn()`
- **Approach:** Test pure functions with various inputs
- **Location:** Co-located with source

**Integration Tests:**
- **Scope:** API routes with mocked Supabase
- **Examples:** POST /api/queries with validation and DB insert
- **Approach:** Mock external dependencies, test business logic end-to-end
- **Location:** Co-located with route handlers

**E2E Tests:**
- **Framework:** Playwright (when configured)
- **Scope:** Complete user flows
- **Examples:**
  - Sign up → Verify email → Log in → Add query
  - Add query → View rankings → Generate content
  - Checkout flow → Verify subscription
- **Approach:** Full browser automation, real database (test DB)
- **Location:** `e2e/` directory

## Common Patterns (When Tests Exist)

**Async Testing:**
```typescript
// Using async/await in test
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toEqual(expected)
})

// Using React Testing Library with waitFor
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

**Error Testing:**
```typescript
// Test for thrown errors
it('should throw validation error', () => {
  expect(() => {
    validateQueryText('short')
  }).toThrow(BadRequestError)
})

// Test for API error responses
it('should return 400 for invalid input', async () => {
  const response = await POST(invalidRequest)
  expect(response.status).toBe(400)
  const json = await response.json()
  expect(json.success).toBe(false)
  expect(json.error.code).toBe('BAD_REQUEST')
})

// Test error states in components
it('should display error message', async () => {
  const { result } = renderHook(() => useQueries())
  // Simulate error
  expect(result.current.error).toBeDefined()
  render(<Component error={result.current.error} />)
  expect(screen.getByText(/Error occurred/)).toBeInTheDocument()
})
```

**Before/After Hooks:**
```typescript
describe('API Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Setup fresh test DB state
  })

  afterEach(() => {
    // Cleanup after test
    jest.restoreAllMocks()
  })

  afterAll(() => {
    // Teardown test environment
  })
})
```

## Current State

**What's Tested:**
- Manual testing via browser (feature checklist in VERIFICATION_CHECKLIST.md)
- Type checking: `npm run type-check`
- Linting: `npm run lint`

**What's NOT Tested:**
- Unit tests for utilities
- Integration tests for API routes
- Component tests
- E2E tests

**Next Steps for Testing:**
1. Set up test framework (Vitest for speed, Jest for ecosystem)
2. Add mocking utilities for Supabase and API
3. Create factory functions for test data
4. Write tests for API routes (highest impact)
5. Add component tests for critical UI pieces
6. Implement E2E tests for user flows

---

*Testing analysis: 2025-02-27*
