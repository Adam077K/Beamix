/**
 * POST /api/internal/revalidate
 *
 * Internal-only endpoint for Inngest functions (and other server-side callers)
 * to invalidate Next.js cache tags and paths after background mutations.
 *
 * Security: caller must provide the correct x-internal-secret header matching
 * INTERNAL_REVALIDATE_SECRET env var. Requests without the header or with the
 * wrong value are rejected with 401.
 *
 * Body: { tags?: string[], paths?: string[] }
 * Response: 204 No Content on success.
 */

import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { z } from 'zod';

const RevalidateRequestSchema = z.object({
  tags: z.array(z.string().min(1).max(200)).max(20).optional().default([]),
  paths: z.array(z.string().min(1).max(500)).max(20).optional().default([]),
});

export async function POST(request: Request) {
  try {
    // 1. Secret validation
    const secret = process.env.INTERNAL_REVALIDATE_SECRET;
    if (!secret) {
      console.error('[internal/revalidate] INTERNAL_REVALIDATE_SECRET not configured');
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Server configuration error.' } },
        { status: 500 },
      );
    }

    const providedSecret = request.headers.get('x-internal-secret');
    if (!providedSecret || providedSecret !== secret) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid or missing x-internal-secret header.' } },
        { status: 401 },
      );
    }

    // 2. Parse + validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      );
    }

    const parsed = RevalidateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid request body.',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { tags, paths } = parsed.data;

    if (tags.length === 0 && paths.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'At least one tag or path is required.' } },
        { status: 400 },
      );
    }

    // 3. Revalidate all provided tags and paths
    // Next.js 16 requires an explicit type argument for revalidateTag — use 'page'
    // since tags are emitted from server components via fetch(..., { next: { tags: [...] }}).
    for (const tag of tags) {
      revalidateTag(tag, 'page');
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    console.log('[internal/revalidate] revalidated', { tags, paths });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[internal/revalidate] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}
