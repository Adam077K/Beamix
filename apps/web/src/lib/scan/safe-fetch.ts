/**
 * safe-fetch.ts — SSRF-safe HTTP fetcher for attacker-controllable URLs.
 *
 * Security controls:
 *   1. Scheme allowlist: http/https only.
 *   2. DNS-resolve BEFORE connect; reject any A/AAAA that falls in private ranges.
 *   3. Connect-time IP pinning via request-filtering-agent (anti-DNS-rebinding).
 *   4. Per-hop validation on every redirect (max 3 hops).
 *   5. Strip Authorization/Cookie/Proxy-Authorization on cross-origin redirects.
 *   6. Response body size cap (2 MiB) — stream-counted, never trust Content-Length.
 *   7. Total timeout 8 000 ms.
 *
 * CVE-2026-47684 class: IPv4-mapped-IPv6 addresses (::ffff:x.x.x.x) are
 * unwrapped and the embedded IPv4 is re-validated against the same blocklist.
 * We use ipaddr.js (already installed as a dep of request-filtering-agent) for
 * all IP parsing and range matching — no BigInt required (ES2017-compatible).
 */

import dns from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import nodeFetch from 'node-fetch';
import type { RequestInit as NodeFetchRequestInit, Response as NodeFetchResponse } from 'node-fetch';
import {
  RequestFilteringHttpAgent,
  RequestFilteringHttpsAgent,
} from 'request-filtering-agent';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SafeFetchOk = {
  ok: true;
  status: number;
  headers: Record<string, string>;
  body: string;
  finalUrl: string;
};

export type SafeFetchError = {
  ok: false;
  reason:
    | 'bad_scheme'
    | 'blocked_ip'
    | 'timeout'
    | 'too_large'
    | 'too_many_redirects'
    | 'network_error';
  detail: string;
};

export type SafeFetchResult = SafeFetchOk | SafeFetchError;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_BYTES = 2_097_152; // 2 MiB
const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'proxy-authorization'];

// ---------------------------------------------------------------------------
// Dependency-injection interface (for testing)
// ---------------------------------------------------------------------------

export interface SafeFetchDeps {
  dnsResolveAll: (hostname: string) => Promise<string[]>;
  fetchImpl: (url: string, init: NodeFetchRequestInit) => Promise<NodeFetchResponse>;
}

// ---------------------------------------------------------------------------
// Default production deps
// ---------------------------------------------------------------------------

const httpAgent = new RequestFilteringHttpAgent({
  allowPrivateIPAddress: false,
  allowMetaIPAddress: false,
});

const httpsAgent = new RequestFilteringHttpsAgent({
  allowPrivateIPAddress: false,
  allowMetaIPAddress: false,
});

function getAgent(url: string): RequestFilteringHttpAgent | RequestFilteringHttpsAgent {
  return url.startsWith('https://') ? httpsAgent : httpAgent;
}

const defaultDeps: SafeFetchDeps = {
  async dnsResolveAll(hostname: string): Promise<string[]> {
    const results: string[] = [];
    const settle = <T>(p: Promise<T>): Promise<T | null> =>
      p.then((v) => v).catch(() => null);
    const [v4, v6] = await Promise.all([
      settle(dns.resolve4(hostname)),
      settle(dns.resolve6(hostname)),
    ]);
    if (v4) results.push(...v4);
    if (v6) results.push(...v6);
    if (results.length === 0) {
      const lu = await dns.lookup(hostname, { all: true }).catch(() => [] as LookupAddress[]);
      results.push(...lu.map((l) => l.address));
    }
    if (results.length === 0) throw new Error(`DNS resolution failed for ${hostname}`);
    return results;
  },
  fetchImpl: nodeFetch as unknown as SafeFetchDeps['fetchImpl'],
};

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function safeFetch(
  url: string,
  opts?: { maxBytes?: number; timeoutMs?: number; headers?: Record<string, string> },
  deps: SafeFetchDeps = defaultDeps,
): Promise<SafeFetchResult> {
  const maxBytes = opts?.maxBytes ?? MAX_BYTES;
  const timeoutMs = opts?.timeoutMs ?? TIMEOUT_MS;
  const initialHeaders = opts?.headers ?? {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchWithRedirects(url, maxBytes, controller, deps, 0, initialHeaders);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (controller.signal.aborted) {
      return { ok: false, reason: 'timeout', detail: `Timed out after ${timeoutMs}ms` };
    }
    return { ok: false, reason: 'network_error', detail: msg };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Internal: recursive redirect follower
// ---------------------------------------------------------------------------

async function fetchWithRedirects(
  url: string,
  maxBytes: number,
  controller: AbortController,
  deps: SafeFetchDeps,
  hopCount: number,
  requestHeaders: Record<string, string> = {},
): Promise<SafeFetchResult> {
  const parsed = parseUrl(url);
  if (!parsed) {
    return { ok: false, reason: 'bad_scheme', detail: `Non-HTTP URL rejected: ${url}` };
  }

  const dnsBlock = await checkDns(parsed.hostname, deps);
  if (dnsBlock) return dnsBlock;

  let response: NodeFetchResponse;
  try {
    response = await deps.fetchImpl(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal as never,
      headers: requestHeaders,
      // Connect-time IP pinning (anti-DNS-rebinding)
      agent: getAgent(url),
    } satisfies NodeFetchRequestInit);
  } catch (err) {
    if (controller.signal.aborted) {
      return { ok: false, reason: 'timeout', detail: 'Connection aborted by timeout' };
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (isBlockedIpError(msg)) {
      return { ok: false, reason: 'blocked_ip', detail: msg };
    }
    return { ok: false, reason: 'network_error', detail: msg };
  }

  const status = response.status;
  if (status >= 300 && status < 400) {
    if (hopCount >= MAX_REDIRECTS) {
      return { ok: false, reason: 'too_many_redirects', detail: `Exceeded ${MAX_REDIRECTS} redirect hops` };
    }
    const location = response.headers.get('location');
    if (!location) {
      return { ok: false, reason: 'network_error', detail: 'Redirect with no Location header' };
    }
    const nextUrl = resolveRedirectUrl(url, location);
    const nextHeaders = stripSensitiveOnCrossOrigin(url, nextUrl, requestHeaders);
    return fetchWithRedirects(nextUrl, maxBytes, controller, deps, hopCount + 1, nextHeaders);
  }

  const bodyResult = await readBodyCapped(response, maxBytes, controller);
  if (!bodyResult.ok) return bodyResult;

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => { headers[key] = value; });

  return { ok: true, status, headers, body: bodyResult.text, finalUrl: url };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseUrl(url: string): URL | null {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return parsed;
}

async function checkDns(hostname: string, deps: SafeFetchDeps): Promise<SafeFetchError | null> {
  let addresses: string[];
  try {
    addresses = await deps.dnsResolveAll(hostname);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: 'network_error', detail: `DNS resolution failed: ${msg}` };
  }
  for (const addr of addresses) {
    const block = isBlockedAddress(addr);
    if (block) return { ok: false, reason: 'blocked_ip', detail: `Blocked IP ${addr} resolved for ${hostname}: ${block}` };
  }
  return null;
}

/**
 * Returns a block reason string if the IP address is in a blocked range, else null.
 *
 * Pure number arithmetic — ES2017-compatible (no BigInt, no ipaddr.js import needed).
 *
 * CVE-2026-47684 class: IPv4-mapped IPv6 (::ffff:x.x.x.x) is unwrapped and the
 * embedded IPv4 is re-validated. A filter that only checks "is this IPv6?" would
 * miss that ::ffff:127.0.0.1 is really loopback.
 */
function isBlockedAddress(addrStr: string): string | null {
  const clean = addrStr.split('%')[0]!; // strip zone ID

  // Detect IPv6 by presence of ':'
  if (clean.includes(':')) {
    // Check for IPv4-mapped form: ::ffff:x.x.x.x
    const mapped = extractIPv4FromMapped(clean);
    if (mapped !== null) {
      const v4block = isBlockedIPv4(mapped);
      if (v4block) return `IPv4-mapped IPv6 wrapping blocked IPv4 ${ipv4Str(mapped)}: ${v4block}`;
    }
    return isBlockedIPv6(clean);
  }

  const v4 = parseIPv4(clean);
  if (v4 === null) return null;
  return isBlockedIPv4(v4);
}

// ---------------------------------------------------------------------------
// IPv4 helpers — represent as a single uint32
// ---------------------------------------------------------------------------

/** Parse an IPv4 dotted-decimal string to a uint32. Returns null if invalid. */
function parseIPv4(s: string): number | null {
  const parts = s.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const b = parseInt(p, 10);
    if (isNaN(b) || b < 0 || b > 255) return null;
    n = ((n << 8) | b) >>> 0;
  }
  return n;
}

function ipv4Str(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function maskFromPrefix4(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

/** IPv4 CIDR blocked ranges: [network_uint32, prefix] */
const BLOCKED_V4_RANGES: Array<[number, number]> = [
  [0x7f000000, 8],   // 127.0.0.0/8   loopback
  [0x0a000000, 8],   // 10.0.0.0/8    RFC 1918
  [0xac100000, 12],  // 172.16.0.0/12 RFC 1918
  [0xc0a80000, 16],  // 192.168.0.0/16 RFC 1918
  [0xa9fe0000, 16],  // 169.254.0.0/16 link-local / AWS IMDS subnet
  [0x00000000, 8],   // 0.0.0.0/8     "this" network
  [0xa9fea9fe, 32],  // 169.254.169.254/32 AWS/Azure/GCP IMDS
  [0x646464c8, 32],  // 100.100.100.200/32 Alibaba Cloud metadata
];

function isBlockedIPv4(addr: number): string | null {
  for (const [network, prefix] of BLOCKED_V4_RANGES) {
    const mask = maskFromPrefix4(prefix);
    if ((addr & mask) === (network & mask)) {
      return `falls in blocked range ${ipv4Str(network)}/${prefix}`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// IPv6 helpers — represent as [hi64_hi32, hi64_lo32, lo64_hi32, lo64_lo32]
// This avoids BigInt while handling the full 128-bit space.
// ---------------------------------------------------------------------------

/** Parse an IPv6 string to four uint32s [w0,w1,w2,w3] (big-endian). Returns null on failure. */
function parseIPv6(s: string): [number, number, number, number] | null {
  try {
    const clean = s.toLowerCase();
    // Expand ::
    let expanded: string;
    if (clean.includes('::')) {
      const [left, right] = clean.split('::') as [string, string];
      const leftGroups = left ? left.split(':') : [];
      const rightGroups = right ? right.split(':') : [];
      const missing = 8 - leftGroups.length - rightGroups.length;
      const middle = Array(missing).fill('0') as string[];
      expanded = [...leftGroups, ...middle, ...rightGroups].join(':');
    } else {
      expanded = clean;
    }
    const groups = expanded.split(':');
    if (groups.length !== 8) return null;
    const words = groups.map((g) => parseInt(g, 16));
    if (words.some((w) => isNaN(w) || w < 0 || w > 0xffff)) return null;
    // Pack pairs of uint16 into uint32s
    return [
      (((words[0]! << 16) | words[1]!) >>> 0),
      (((words[2]! << 16) | words[3]!) >>> 0),
      (((words[4]! << 16) | words[5]!) >>> 0),
      (((words[6]! << 16) | words[7]!) >>> 0),
    ];
  } catch {
    return null;
  }
}

/**
 * Detects IPv4-mapped IPv6 and returns the embedded IPv4 as uint32, or null.
 *
 * Handles two forms:
 *   - Mixed notation:  ::ffff:127.0.0.1
 *   - Pure hex:        ::ffff:7f00:0001  (words[2]=0x0000ffff)
 */
function extractIPv4FromMapped(addrStr: string): number | null {
  const lower = addrStr.toLowerCase();

  // Fast path: mixed notation "::ffff:x.x.x.x"
  const mixedMatch = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(lower);
  if (mixedMatch) {
    return parseIPv4(mixedMatch[1]!);
  }

  // Pure-hex path: parse normally and check words[2] == 0x0000ffff
  const words = parseIPv6(lower);
  if (!words) return null;
  // IPv4-mapped form in pure hex: 0000:0000:0000:0000:0000:ffff:xx:xx
  // words = [hi0, hi1, lo0, lo1] where w0=0, w1=0, w2=0x0000ffff, w3=IPv4
  if (words[0] === 0 && words[1] === 0 && words[2] === 0x0000ffff) {
    return words[3]!;
  }
  return null;
}

/** IPv6 CIDR blocked ranges: [parsed_prefix, prefix_length_bits] */
const BLOCKED_V6_RANGES: Array<{ prefix: [number, number, number, number]; bits: number; label: string }> = [
  { prefix: [0xfc000000, 0, 0, 0], bits: 7,  label: 'fc00::/7 (Unique Local)' },   // fc00:: and fd00::
  { prefix: [0xfe800000, 0, 0, 0], bits: 10, label: 'fe80::/10 (link-local)' },
  { prefix: [0x00000000, 0x0000ffff, 0, 0], bits: 96, label: '::ffff:0:0/96 (IPv4-mapped)' },
];

const BLOCKED_V6_EXACT: Array<{ words: [number, number, number, number]; label: string }> = [
  { words: [0, 0, 0, 1], label: '::1 (loopback)' },  // ::1
  // fd00:ec2::254 = fd00:0ec2:0000:0000:0000:0000:0000:0254
  { words: [0xfd000ec2, 0x00000000, 0x00000000, 0x00000254], label: 'fd00:ec2::254 (AWS metadata)' },
];

function ipv6MatchPrefix(
  addr: [number, number, number, number],
  prefix: [number, number, number, number],
  bits: number,
): boolean {
  let remaining = bits;
  for (let i = 0; i < 4; i++) {
    if (remaining <= 0) break;
    const bitsThisWord = Math.min(remaining, 32);
    const mask = bitsThisWord === 32 ? 0xffffffff : ((0xffffffff << (32 - bitsThisWord)) >>> 0);
    if ((addr[i]! & mask) !== (prefix[i]! & mask)) return false;
    remaining -= bitsThisWord;
  }
  return true;
}

function isBlockedIPv6(addrStr: string): string | null {
  const words = parseIPv6(addrStr);
  if (!words) return null;

  for (const { words: exact, label } of BLOCKED_V6_EXACT) {
    if (words[0] === exact[0] && words[1] === exact[1] &&
        words[2] === exact[2] && words[3] === exact[3]) {
      return `matches blocked IPv6 address ${label}`;
    }
  }
  for (const { prefix, bits, label } of BLOCKED_V6_RANGES) {
    if (ipv6MatchPrefix(words, prefix, bits)) {
      return `falls in blocked IPv6 range ${label}`;
    }
  }
  return null;
}

function isBlockedIpError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('private ip') ||
    lower.includes('blocked ip') ||
    lower.includes('ip is not allowed') ||
    lower.includes('meta ip')
  );
}

function resolveRedirectUrl(currentUrl: string, location: string): string {
  try { return new URL(location, currentUrl).toString(); } catch { return location; }
}

function stripSensitiveOnCrossOrigin(
  fromUrl: string,
  toUrl: string,
  headers: Record<string, string>,
): Record<string, string> {
  let fromOrigin: string, toOrigin: string;
  try {
    fromOrigin = new URL(fromUrl).origin;
    toOrigin = new URL(toUrl).origin;
  } catch {
    return stripKeys(headers, SENSITIVE_HEADERS);
  }
  if (fromOrigin !== toOrigin) return stripKeys(headers, SENSITIVE_HEADERS);
  return headers;
}

function stripKeys(headers: Record<string, string>, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!keys.includes(k.toLowerCase())) result[k] = v;
  }
  return result;
}

async function readBodyCapped(
  response: NodeFetchResponse,
  maxBytes: number,
  controller: AbortController,
): Promise<{ ok: true; text: string } | SafeFetchError> {
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    const body = response.body;
    if (!body) return { ok: true, text: '' };
    for await (const chunk of body) {
      // chunk is Buffer | string from node-fetch body; Buffer.from handles both
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any);
      total += buf.byteLength;
      if (total > maxBytes) {
        controller.abort();
        return { ok: false, reason: 'too_large', detail: `Response body exceeded ${maxBytes} bytes cap` };
      }
      chunks.push(buf);
    }
  } catch (err) {
    if (controller.signal.aborted) {
      return { ok: false, reason: 'timeout', detail: 'Body read aborted by timeout' };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: 'network_error', detail: `Body read error: ${msg}` };
  }
  return { ok: true, text: Buffer.concat(chunks).toString('utf-8') };
}
