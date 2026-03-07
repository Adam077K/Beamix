# Testing Patterns

> **Last synced:** March 2026 — aligned with 03-system-design/

## Test Framework

**Status:**
- No test framework currently configured
- No test files in `src/` directory
- Testing is Phase 2 (MVP focuses on feature completion)

**Recommended Setup:**
- **Runner:** Vitest (fast, ESM-native, compatible with Next.js)
- **Assertion Library:** Vitest built-in `expect()`
- **E2E Testing:** Playwright for critical user flows
- **Component Testing:** React Testing Library

## Current State

**What's Tested:**
- Manual testing via browser
- Type checking: `npm run type-check`
- Linting: `npm run lint`

**What's NOT Tested:**
- Unit tests for utilities
- Integration tests for API routes
- Component tests
- E2E tests
- Inngest function tests
- Paddle webhook handler tests

## Run Commands (When Tests Exist)

```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Test File Organization

Co-locate with source files using `.test.ts` suffix:

```
src/lib/utils/
├── index.ts
├── index.test.ts

src/inngest/
├── agent-execute.ts
├── agent-execute.test.ts

src/app/api/scan/start/
├── route.ts
├── route.test.ts
```

## Priority Test Areas (from System Design)

### P0 — Must test before launch

**Credit System (hold/confirm/release):**
- Hold credit on agent job start
- Confirm credit on success
- Release credit on failure (user never charged)
- Idempotent hold (Inngest step retry must not double-hold)
- Concurrent requests from same user

**Paddle Webhook Handler:**
- Signature verification (reject invalid signatures)
- Idempotency (duplicate webhook events handled gracefully)
- Subscription state transitions (created -> active -> cancelled)
- Transaction completed -> credit allocation

**API Authentication:**
- All protected endpoints reject unauthenticated requests (401)
- RLS prevents cross-user data access
- API key auth for `/api/v1/*` endpoints (SHA-256 hash validation, scope enforcement)

**Inngest Functions:**
- `scan.free` completes and writes results to DB
- `agent.execute` runs multi-stage pipeline and produces content
- `alert.evaluate` triggers correct alert rules
- Step retry behavior (each step retries independently)
- Concurrency limits enforced

### P1 — Test during Growth Phase

**Content Publish Flow:**
- Agent output -> content_items -> user edit -> CMS publish (WordPress REST API)
- Version history created on each edit

**Workflow Chains:**
- Event triggers correct workflow
- Agents execute in sequence
- Failure in one agent doesn't break chain

**Integration Credential Handling:**
- AES-256-GCM encryption/decryption roundtrip
- Test-connection endpoint validates credentials before saving

### P2 — Test for Moat Builders

**Public REST API:**
- API key authentication and scope enforcement
- Rate limiting per key
- All 9 endpoints return correct data

## Mocking Strategy

**What to Mock:**
- LLM API calls (OpenAI, Anthropic, Perplexity, Gemini) — return fixture responses
- Supabase client calls — mock DB operations
- Paddle SDK — mock checkout, webhook verification
- Inngest SDK — mock event emission, step execution
- Resend — mock email sending
- External APIs (WordPress, GA4, GSC) — mock HTTP responses

**What NOT to Mock:**
- Utility functions (`cn()`, `formatDate()`) — test directly
- Zod schemas — test validation rules directly
- Data transformations — test logic without mocking

**Inngest Testing:**
- Use `inngest/test` utilities for function testing
- Mock `step.run()` to control LLM responses
- Verify correct events emitted at each stage
- Test concurrency limits and retry behavior

**Supabase Testing:**
- Mock Supabase client for unit tests
- Use Supabase local dev (`supabase start`) for integration tests
- Test RLS policies with different user contexts

## Test Data

**Factory Functions:**
```
src/__tests__/factories/
├── query.ts       # createMockQuery()
├── scan.ts        # createMockScan(), createMockEngineResult()
├── agent.ts       # createMockAgentJob(), createMockContentItem()
├── user.ts        # createMockUser(), createMockBusiness()
├── credit.ts      # createMockCreditPool(), createMockTransaction()
└── responses.ts   # createMockResponse<T>()
```

## Coverage

**Targets (when configured):**
- Phase 1 MVP: Focus on API routes and credit system (target: 70% critical paths)
- Phase 2 Growth: Add component and hook tests (target: 75%)
- Phase 3 Moat: Improve to 80%+

## Next Steps

1. Set up Vitest with Next.js
2. Create mock utilities for Supabase, Inngest, Paddle, LLM APIs
3. Write credit system tests (P0)
4. Write Paddle webhook tests (P0)
5. Write API auth tests (P0)
6. Add Inngest function tests (P0)
7. Component tests for critical UI (P1)
8. E2E tests with Playwright for user flows (P1)

---

*Testing analysis: 2025-02-27 | Updated: March 2026 — synced with System Design v2.1*
