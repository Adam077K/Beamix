/**
 * rate-limit.ts — Per-user sliding-window rate limiter (Upstash Redis).
 *
 * Default: 60 requests / 60-second window per user.
 * Applied to all authenticated API routes via `applyRateLimit()`.
 *
 * Usage:
 *   const result = await applyRateLimit(userId);
 *   if (!result.allowed) return rateLimitResponse(result);
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Lazy-init so the module is importable without env vars present (e.g. in tests).
let _ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (_ratelimit) return _ratelimit;

  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

  if (!url || !token) {
    // In test / build environments, return a passthrough limiter.
    _ratelimit = null as unknown as Ratelimit;
    return _ratelimit;
  }

  const redis = new Redis({ url, token });

  _ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    prefix: 'beamix:rl',
    analytics: false,
  });

  return _ratelimit;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and consume one token for the given userId.
 * Returns allowed=true when the request may proceed.
 */
export async function applyRateLimit(userId: string): Promise<RateLimitResult> {
  const rl = getRatelimit();

  // Passthrough when Redis is not configured (local dev / CI).
  if (!rl) {
    return { allowed: true, limit: 60, remaining: 59, resetAt: new Date() };
  }

  const { success, limit, remaining, reset } = await rl.limit(`user:${userId}`);

  return {
    allowed: success,
    limit,
    remaining,
    resetAt: new Date(reset),
  };
}

/**
 * Build a 429 response with standard Retry-After headers.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterMs = Math.max(0, result.resetAt.getTime() - Date.now());
  const retryAfterSecs = Math.ceil(retryAfterMs / 1000);

  return NextResponse.json(
    {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please retry after the indicated time.',
        details: {
          limit: result.limit,
          remaining: 0,
          resetAt: result.resetAt.toISOString(),
        },
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSecs),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toISOString(),
      },
    }
  );
}
