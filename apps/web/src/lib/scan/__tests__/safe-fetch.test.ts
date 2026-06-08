/**
 * Unit tests for safe-fetch.ts — SSRF controls.
 *
 * ALL network and DNS calls are mocked via the SafeFetchDeps injection interface.
 * No real sockets or real DNS queries are made.
 *
 * Coverage:
 *   (1)  Reject file:// scheme
 *   (2)  Reject javascript: scheme
 *   (3)  Reject DNS → 127.0.0.1 (loopback)
 *   (4)  Reject DNS → 10.0.0.5 (RFC 1918)
 *   (5)  Reject DNS → 192.168.1.1 (RFC 1918)
 *   (6)  Reject DNS → 169.254.169.254 (AWS IMDS)
 *   (7)  Reject ::ffff:127.0.0.1 (IPv4-mapped-IPv6 wrapping loopback) — CVE-2026-47684 class
 *   (8)  Reject ::1 (IPv6 loopback)
 *   (9)  Reject fe80::1 (IPv6 link-local)
 *   (10) Reject fd00::1 (IPv6 ULA)
 *   (11) Reject redirect from public IP → 127.0.0.1 (per-hop check)
 *   (12) Abort oversized body even when Content-Length lies (says 100, sends >2MB)
 *   (13) Abort on timeout
 *   (14) Strip Authorization header on cross-origin redirect
 *   (15) Allow a normal ~1MB public response
 */

import { describe, it, expect, vi } from 'vitest';
import { safeFetch } from '../safe-fetch';
import type { SafeFetchDeps } from '../safe-fetch';
import type { Response as NodeFetchResponse } from 'node-fetch';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

/** Creates a minimal mock NodeFetchResponse. */
function makeMockResponse(
  body: string,
  status = 200,
  extraHeaders?: Record<string, string>,
): NodeFetchResponse {
  const headersMap: Record<string, string> = {
    'content-type': 'text/html',
    ...extraHeaders,
  };
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => headersMap[key.toLowerCase()] ?? null,
      forEach: (cb: (value: string, key: string) => void) => {
        for (const [k, v] of Object.entries(headersMap)) cb(v, k);
      },
    },
    body: makeReadableStream(body),
  } as unknown as NodeFetchResponse;
}

/** Creates an async iterable that emits a single Buffer chunk. */
function makeReadableStream(text: string) {
  const buf = Buffer.from(text, 'utf-8');
  return {
    [Symbol.asyncIterator]: async function* () {
      yield buf;
    },
  };
}

/** Creates a stream that emits `count` bytes of 'x' in one shot. */
function makeLargeStream(count: number) {
  const buf = Buffer.alloc(count, 'x');
  return {
    [Symbol.asyncIterator]: async function* () {
      yield buf;
    },
  };
}

/**
 * Creates a fetchImpl that hangs until the AbortSignal fires, then rejects.
 * This accurately simulates a slow/stalled connection that gets cut by timeout.
 */
function makeSlowFetchImpl(_delayMs: number) {
  return vi.fn().mockImplementation(
    (_url: string, init: NodeFetchRequestInit) =>
      new Promise<NodeFetchResponse>((_resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signal = (init as any).signal as AbortSignal | undefined;
        if (!signal) return; // no signal — hang forever (test would timeout)
        if (signal.aborted) {
          reject(new Error('The operation was aborted'));
          return;
        }
        signal.addEventListener('abort', () => {
          reject(new Error('The operation was aborted'));
        });
      }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('safeFetch() — scheme allowlist', () => {
  it('(1) rejects file:// scheme', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn(),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('file:///etc/passwd', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_scheme');
    // DNS and fetch must NOT be called for scheme-blocked URLs
    expect((deps.dnsResolveAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
    expect((deps.fetchImpl as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('(2) rejects javascript: scheme', async () => {
    const deps: SafeFetchDeps = { dnsResolveAll: vi.fn(), fetchImpl: vi.fn() };
    const result = await safeFetch('javascript:alert(1)', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_scheme');
  });

  it('rejects ftp: scheme', async () => {
    const deps: SafeFetchDeps = { dnsResolveAll: vi.fn(), fetchImpl: vi.fn() };
    const result = await safeFetch('ftp://example.com/file.txt', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_scheme');
  });

  it('rejects data: URI', async () => {
    const deps: SafeFetchDeps = { dnsResolveAll: vi.fn(), fetchImpl: vi.fn() };
    const result = await safeFetch('data:text/plain,hello', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_scheme');
  });
});

describe('safeFetch() — DNS SSRF blocking (pre-connect)', () => {
  it('(3) blocks DNS → 127.0.0.1 (loopback)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['127.0.0.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://internal.example.com/secret', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('blocked_ip');
      expect(result.detail).toMatch(/127\.0\.0\.1/);
    }
    // fetchImpl must NOT be called — we block before connecting
    expect((deps.fetchImpl as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('(4) blocks DNS → 10.0.0.5 (RFC 1918)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['10.0.0.5']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://internal.example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(5) blocks DNS → 192.168.1.1 (RFC 1918)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['192.168.1.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(6) blocks DNS → 169.254.169.254 (AWS IMDS)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['169.254.169.254']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://metadata.example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('blocks DNS → 172.16.0.1 (RFC 1918 172.16/12)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['172.16.0.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('blocks DNS → 0.0.0.1 (0/8 network)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['0.0.0.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('blocks DNS → 100.100.100.200 (Alibaba Cloud metadata)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['100.100.100.200']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });
});

describe('safeFetch() — IPv6 SSRF blocking', () => {
  it('(7) blocks ::ffff:127.0.0.1 — IPv4-mapped-IPv6 loopback (CVE-2026-47684 class)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['::ffff:127.0.0.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('blocked_ip');
      expect(result.detail).toMatch(/IPv4-mapped/i);
    }
  });

  it('(7b) blocks ::ffff:10.0.0.1 — IPv4-mapped-IPv6 wrapping RFC 1918', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['::ffff:10.0.0.1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(7c) blocks ::ffff:192.168.1.100 — IPv4-mapped-IPv6 wrapping RFC 1918', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['::ffff:192.168.1.100']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(8) blocks ::1 (IPv6 loopback)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['::1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(9) blocks fe80::1 (IPv6 link-local)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['fe80::1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('(10) blocks fd00::1 (IPv6 ULA / fc00::/7)', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['fd00::1']),
      fetchImpl: vi.fn(),
    };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });
});

describe('safeFetch() — redirect per-hop IP check', () => {
  it('(11) blocks redirect: public host → Location: http://127.0.0.1/', async () => {
    const dnsResolveAll = vi
      .fn()
      // First DNS call: example.com → public IP (passes)
      .mockResolvedValueOnce(['93.184.216.34'])
      // Second DNS call: 127.0.0.1 hostname (after redirect) → loopback (blocked)
      .mockResolvedValueOnce(['127.0.0.1']);

    const fetchImpl = vi
      .fn()
      // First fetch: redirect to internal
      .mockResolvedValueOnce(
        makeMockResponse('', 301, { location: 'http://127.0.0.1/secret' }),
      );

    const deps: SafeFetchDeps = { dnsResolveAll, fetchImpl };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
    // fetchImpl only called once (before the redirect target is blocked)
    expect((fetchImpl as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('allows up to 3 redirect hops on clean public IPs', async () => {
    const dnsResolveAll = vi.fn().mockResolvedValue(['93.184.216.34']);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(makeMockResponse('', 301, { location: 'http://example.com/step2' }))
      .mockResolvedValueOnce(makeMockResponse('', 302, { location: 'http://example.com/step3' }))
      .mockResolvedValueOnce(makeMockResponse('', 302, { location: 'http://example.com/final' }))
      .mockResolvedValueOnce(makeMockResponse('Final content', 200));

    const deps: SafeFetchDeps = { dnsResolveAll, fetchImpl };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.body).toBe('Final content');
  });

  it('returns too_many_redirects after exceeding 3 hops', async () => {
    const dnsResolveAll = vi.fn().mockResolvedValue(['93.184.216.34']);
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(makeMockResponse('', 301, { location: 'http://example.com/loop' }));

    const deps: SafeFetchDeps = { dnsResolveAll, fetchImpl };
    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('too_many_redirects');
  });
});

describe('safeFetch() — body size cap', () => {
  it('(12) aborts oversized body even when Content-Length lies (says 100, sends >2MB)', async () => {
    const bigBody = 2_097_153; // 1 byte over the 2 MiB cap
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          // Content-Length lies: claims 100 bytes
          get: (k: string) => (k.toLowerCase() === 'content-length' ? '100' : null),
          forEach: () => undefined,
        },
        body: makeLargeStream(bigBody),
      } as unknown as NodeFetchResponse),
    };

    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('too_large');
  });

  it('respects a custom maxBytes option', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null, forEach: () => undefined },
        body: makeLargeStream(1001),
      } as unknown as NodeFetchResponse),
    };

    const result = await safeFetch('http://example.com/', { maxBytes: 1000 }, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('too_large');
  });

  it('allows body exactly at the cap boundary', async () => {
    const exactCap = 2_097_152;
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null, forEach: () => undefined },
        body: makeLargeStream(exactCap),
      } as unknown as NodeFetchResponse),
    };

    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(true);
  });
});

describe('safeFetch() — timeout', () => {
  it('(13) returns timeout when body read exceeds timeoutMs', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: makeSlowFetchImpl(60_000), // 60s — will be aborted by 50ms timeout
    };

    const result = await safeFetch('http://example.com/', { timeoutMs: 50 }, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('timeout');
  }, 5000);
});

describe('safeFetch() — cross-origin header stripping', () => {
  it('(14) strips Authorization header on cross-origin redirect', async () => {
    let hop2CapturedHeaders: Record<string, string> = {};

    const dnsResolveAll = vi.fn().mockResolvedValue(['93.184.216.34']);
    const fetchImpl = vi
      .fn()
      .mockImplementationOnce(async () =>
        // First request: example.com → redirect to other-domain.example.com
        makeMockResponse('', 301, { location: 'http://other-domain.example.com/page' }),
      )
      .mockImplementationOnce(
        async (_url: string, init: { headers?: Record<string, string> }) => {
          hop2CapturedHeaders = (init.headers as Record<string, string>) ?? {};
          return makeMockResponse('OK', 200);
        },
      );

    const deps: SafeFetchDeps = { dnsResolveAll, fetchImpl };

    // Pass Authorization header as initial request headers
    await safeFetch(
      'http://example.com/',
      { headers: { Authorization: 'Bearer secret-token', 'X-Custom': 'keep' } },
      deps,
    );

    const lowerKeys = Object.keys(hop2CapturedHeaders).map((k) => k.toLowerCase());
    expect(lowerKeys).not.toContain('authorization');
    // Non-sensitive header should survive
    expect(lowerKeys).toContain('x-custom');
  });

  it('preserves Authorization on same-origin redirect', async () => {
    let hop2CapturedHeaders: Record<string, string> = {};

    const dnsResolveAll = vi.fn().mockResolvedValue(['93.184.216.34']);
    const fetchImpl = vi
      .fn()
      .mockImplementationOnce(async () =>
        // Same origin redirect
        makeMockResponse('', 301, { location: 'http://example.com/page2' }),
      )
      .mockImplementationOnce(
        async (_url: string, init: { headers?: Record<string, string> }) => {
          hop2CapturedHeaders = (init.headers as Record<string, string>) ?? {};
          return makeMockResponse('OK', 200);
        },
      );

    const deps: SafeFetchDeps = { dnsResolveAll, fetchImpl };
    await safeFetch(
      'http://example.com/',
      { headers: { Authorization: 'Bearer keep-me' } },
      deps,
    );

    const lowerKeys = Object.keys(hop2CapturedHeaders).map((k) => k.toLowerCase());
    expect(lowerKeys).toContain('authorization');
  });
});

describe('safeFetch() — allow normal public response', () => {
  it('(15) allows a normal ~500KB public response and returns body', async () => {
    const bodyText = 'x'.repeat(500_000); // 500 KB — under the 2 MiB cap
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockResolvedValue(makeMockResponse(bodyText, 200)),
    };

    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe(200);
      expect(result.body.length).toBe(500_000);
    }
  });

  it('returns correct finalUrl', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockResolvedValue(makeMockResponse('hello', 200)),
    };

    const result = await safeFetch('https://example.com/page', undefined, deps);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.finalUrl).toBe('https://example.com/page');
  });

  it('returns correct headers map', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi
        .fn()
        .mockResolvedValue(makeMockResponse('body', 200, { 'x-custom-header': 'value123' })),
    };

    const result = await safeFetch('https://example.com/', undefined, deps);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.headers['x-custom-header']).toBe('value123');
  });
});

describe('safeFetch() — request-filtering-agent error passthrough', () => {
  it('returns blocked_ip when agent throws "private ip" error at connect time', async () => {
    // DNS passes (public IP), but the agent blocks at TCP connect time
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockRejectedValue(new Error('Private IP address is not allowed')),
    };

    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('blocked_ip');
  });

  it('returns network_error for generic fetch failures', async () => {
    const deps: SafeFetchDeps = {
      dnsResolveAll: vi.fn().mockResolvedValue(['93.184.216.34']),
      fetchImpl: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    };

    const result = await safeFetch('http://example.com/', undefined, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('network_error');
  });
});
