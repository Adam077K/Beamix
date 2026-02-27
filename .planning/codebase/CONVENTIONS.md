# Coding Conventions

**Analysis Date:** 2025-02-27

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension
  - Example: `MetricsCard.tsx`, `QueryTable.tsx`, `RankingChart.tsx`
- API routes: kebab-case directories with `route.ts` files
  - Example: `/api/queries/route.ts`, `/api/credits/balance/route.ts`
- Utilities and hooks: camelCase with `.ts` or `.tsx` extension
  - Example: `useQueries.ts`, `useDashboardData.ts`, `index.ts`
- Configuration files: camelCase or lowercase with specific extensions
  - Example: `tsconfig.json`, `eslint.config.mjs`, `tailwind.config.ts`

**Functions:**
- camelCase for all functions
  - Regular functions: `formatDate()`, `getRankingChange()`, `truncate()`
  - Handlers: `handleGet()`, `handlePost()`, `handleDelete()`
  - Hooks: `useQueries()`, `useCreditsBalance()`, `useDashboardData()`
  - Utilities: `cn()`, `formatCurrency()`, `getInitials()`

**Variables:**
- camelCase for local variables and constants
  - Example: `dateRange`, `dashboardData`, `isLoading`, `creditsRemaining`
- UPPER_SNAKE_CASE for true constants (rarely used)
- snake_case only for database column names and object keys matching database schema

**Types:**
- PascalCase for all TypeScript types and interfaces
  - Example: `MetricsCardProps`, `TrackedQuery`, `AuthenticatedUser`, `SuccessResponse<T>`
- Union types use string literals: `'high' | 'medium' | 'low'`
- Database table types match schema: `Customer`, `ProspectLead`, `RankingHistory`

## Code Style

**Formatting:**
- ESLint enforces code style using `eslint-config-next` and `eslint-config-next/typescript`
- No Prettier config found; ESLint rules are primary style guide
- Indentation: 2 spaces (implicit from codebase)
- Line length: No strict limit enforced, but generally keep reasonable

**Linting:**
- ESLint version 9 with Next.js and TypeScript configs
- Config file: `eslint.config.mjs` (uses new ESLint flat config format)
- Rules include Next.js core web vitals and TypeScript best practices
- Run linting: `npm run lint`

**TypeScript:**
- Strict mode enabled: `"strict": true` in `tsconfig.json`
- No `any` types allowed without justification
- `noEmit: true` - TypeScript used for type checking only, compilation via Next.js
- Target: ES2017, module: esnext
- Path aliases configured: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React and Next.js imports
   - `import { useState } from 'react'`
   - `import type { NextRequest } from 'next/server'`
   - `import Link from 'next/link'`
2. Third-party library imports
   - `import { useQuery, useMutation } from '@tanstack/react-query'`
   - `import { create } from 'zustand'`
   - `import { clsx } from 'clsx'`
3. Local absolute imports (using `@/` alias)
   - `import { MetricsCard } from '@/components/dashboard/MetricsCard'`
   - `import { useQueries } from '@/lib/hooks/useQueries'`
   - `import { createClient } from '@/lib/supabase/server'`
4. Type imports (use `import type` for types only)
   - `import type { Metadata } from "next"`
   - `import { NextResponse } from 'next/server'`

**Path Aliases:**
- `@/*` = `./src/*` - Used exclusively for all local imports
- Example: `@/lib/utils`, `@/components/ui`, `@/app/api`

## Error Handling

**Patterns:**
- Custom error classes in `lib/api/errors.ts` for API-specific errors
- All error classes extend `APIError` with status code and optional code
- Common errors:
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `BadRequestError` (400)
  - `InsufficientCreditsError` (402)
  - `InternalServerError` (500)

**API Routes:**
- Use `withErrorHandler()` wrapper for consistent error handling
- Pattern: `export const GET = withErrorHandler(handleGet)`
- Try/catch blocks in handlers, errors thrown as custom exceptions
- `errorResponse()` function converts exceptions to JSON responses with status codes
- Development mode includes error stack traces; production hides them

**Frontend:**
- React Query handles async errors with `error` state in hooks
- Components check `isLoading` and `error` states
- Errors displayed via UI or toast notifications (not implemented yet)

**Logging:**
- `console.error()` with context prefix in API routes
  - Example: `console.error('[API Error]', error)`
  - Example: `console.error('[API] [/api/queries/create]', error)`
- Client-side: `console.warn()` for warnings (example in type utils)

## Comments

**When to Comment:**
- JSDoc comments on exported functions and types
- Explain "why" not "what" (code shows what, comments explain intent)
- Section headers with horizontal line separators at top of files
  - Example: `// ================================================`

**JSDoc/TSDoc:**
- Used on utility functions and type exports
  - Example: `/** Utility function to merge Tailwind CSS classes */`
  - Example: `/** Format a number as currency */`
- Parameters and return types documented in JSDoc
- Not required for obvious component props (TypeScript handles that)

**File Section Headers:**
- All API routes and major modules include header comments
  - Format: `// ================================================` then purpose
  - Example: `// Queries API Routes` with HTTP method descriptions

## Function Design

**Size:**
- Generally keep functions under 50 lines
- Complex logic broken into smaller helpers
- API route handlers typically 20-40 lines after wrapping with `withErrorHandler`

**Parameters:**
- Use object destructuring for multiple parameters
  - Example: `function MetricsCard({ title, value, subtitle, icon, trend }: MetricsCardProps)`
  - Better readability than positional args
- Optional parameters marked with `?` in TypeScript
- Provide sensible defaults where appropriate

**Return Values:**
- Always specify return type in TypeScript
  - Example: `function formatDate(...): string`
  - Example: `async function handler(...): Promise<NextResponse>`
- Return custom response objects from API routes via `successResponse<T>()` or `errorResponse()`
- Use early returns to reduce nesting

## Module Design

**Exports:**
- Use named exports for most modules
  - Example: `export function useQueries() { ... }`
  - Example: `export class APIError extends Error { ... }`
- Default exports only for page components and main entry points
  - Example: `export default function DashboardPage() { ... }`

**Barrel Files:**
- Index files aggregate exports from directory
  - Example: `src/lib/hooks/index.ts` (if created)
  - Example: `src/components/landing/shared/index.ts` exists
- Used to simplify imports: `import { Button } from '@/components/landing/shared'`

**Organization:**
- Group related code: utils, hooks, components, API routes each have own directory
- Shared UI components in `src/components/ui/` (Shadcn components)
- Page-specific components in `src/components/{section}/`
- API routes mirror feature structure: `/api/queries/`, `/api/content/`, etc.

## API Response Format

**Success Responses:**
```typescript
{
  success: true,
  data: T,
  meta: {
    timestamp: "2025-02-27T...",
    // additional metadata
  }
}
```

**Error Responses:**
```typescript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE_STRING",
    details: undefined // only in development
  },
  meta: {
    timestamp: "2025-02-27T..."
  }
}
```

## React Component Patterns

**Functional Components:**
- Always functional components with hooks, no class components
- Use `'use client'` directive for client-side components
- Use Server Components (no directive) when possible for performance

**Component Structure:**
```typescript
// 1. Imports (organized as above)
import { useState } from 'react'
import { Card } from '@/components/ui/card'

// 2. Interface definitions
interface ComponentProps {
  title: string
  value: number
}

// 3. Component function
export function Component({ title, value }: ComponentProps) {
  // 4. Hooks at top
  const [state, setState] = useState(null)

  // 5. Event handlers
  const handleClick = () => { ... }

  // 6. Render logic
  return <div>...</div>
}
```

**Props:**
- Define interface/type for all component props
- Name interfaces as `{ComponentName}Props`
- Use destructuring in function signature

**Hooks:**
- React hooks from `react`
- React Query hooks for server state: `useQuery`, `useMutation`, `useQueryClient`
- Custom hooks in `lib/hooks/` directory
- Zustand store hooks for client state

## Database Patterns

**Column Naming:**
- snake_case for all database columns
- Examples: `user_id`, `created_at`, `is_active`, `avg_ranking`
- Matches PostgreSQL conventions

**Type Matching:**
- TypeScript interfaces match database tables
- Optional fields use `| null` not `?` for database nullability
- Example: `avg_ranking: number | null` means column is nullable

## State Management

**React Query (Server State):**
- Primary tool for API data fetching and caching
- Configured in `lib/react-query/client.ts`
- Default: 5-minute staleTime, 10-minute gcTime
- Queries: `refetchOnWindowFocus: false`, `refetchOnReconnect: true`
- Mutations: 1 retry default

**Zustand (Client State):**
- Used for UI-only state (modals, sidebar, loading messages)
- Store in `lib/zustand/stores/`
- Example: `useUIStore` for sidebar, modal, loading states
- Simple create/set pattern, no complex middleware

**Props:**
- Avoid prop drilling; use context or state management for deeply nested data

---

*Convention analysis: 2025-02-27*
