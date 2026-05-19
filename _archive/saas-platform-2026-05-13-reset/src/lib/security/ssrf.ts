/**
 * ssrf.ts — SSRF protection for any user-supplied URL input.
 *
 * Rejects:
 *  - Non-HTTPS URLs
 *  - Private/loopback IP ranges (RFC 1918, RFC 4193, localhost)
 *  - Cloud metadata endpoints (169.254.169.254, etc.)
 *  - Non-public address space per ipaddr.js
 *
 * Usage:
 *   const safe = assertSafeUrl(rawUrl);  // throws SsrfError on violation
 */

import ipaddr from 'ipaddr.js';

export class SsrfError extends Error {
  readonly code = 'SSRF_BLOCKED';
  constructor(reason: string) {
    super(`SSRF check failed: ${reason}`);
    this.name = 'SsrfError';
  }
}

/** Cloud metadata IPs that must always be blocked. */
const METADATA_CIDRS = [
  '169.254.169.254/32', // AWS / GCP / Azure metadata
  'fd00:ec2::254/128',  // AWS IPv6 metadata
  '100.100.100.200/32', // Alibaba Cloud metadata
  '192.0.0.192/32',     // Oracle Cloud metadata
];

function isMetadataIp(addr: ipaddr.IPv4 | ipaddr.IPv6): boolean {
  for (const cidr of METADATA_CIDRS) {
    try {
      const [network, prefixLength] = ipaddr.parseCIDR(cidr);
      if (
        addr.kind() === network.kind() &&
        addr.match(network as ipaddr.IPv4, prefixLength)
      ) {
        return true;
      }
    } catch {
      // malformed CIDR — skip
    }
  }
  return false;
}

/**
 * Validate a URL for SSRF safety.
 *
 * @throws {SsrfError} if the URL is not safe to fetch.
 * @returns The validated URL string.
 */
export function assertSafeUrl(rawUrl: string): string {
  // 1. Parse the URL
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError('invalid URL');
  }

  // 2. HTTPS only
  if (parsed.protocol !== 'https:') {
    throw new SsrfError('only HTTPS URLs are allowed');
  }

  // 3. Reject bare IPs (and resolve them)
  const hostname = parsed.hostname.toLowerCase();

  // Strip surrounding brackets from IPv6 literals
  const rawHost = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;

  // 4. Check if host looks like an IP address
  if (ipaddr.isValid(rawHost)) {
    const addr = ipaddr.parse(rawHost);

    // Deny private / special ranges
    const range = addr.range();
    const deniedRanges = [
      'private',
      'loopback',
      'linkLocal',
      'uniqueLocal',
      'unspecified',
      'reserved',
      'broadcast',
      'multicast',
      'ipv4Mapped',
      'rfc6145',
      'rfc6052',
      'teredo',
      '6to4',
      'carrierGradeNat',
    ];

    if (deniedRanges.includes(range)) {
      throw new SsrfError(`IP range "${range}" is not allowed`);
    }

    // Deny cloud metadata IPs
    if (isMetadataIp(addr)) {
      throw new SsrfError('cloud metadata IP is not allowed');
    }
  } else {
    // Hostname — block well-known internal hostnames
    const blockedHostnames = [
      'localhost',
      'metadata.google.internal',
      'metadata.internal',
    ];
    if (blockedHostnames.includes(hostname)) {
      throw new SsrfError(`hostname "${hostname}" is not allowed`);
    }

    // Block hostnames resolving to .local / .internal / .test / .corp
    const blockedSuffixes = ['.local', '.internal', '.test', '.corp', '.localhost'];
    if (blockedSuffixes.some(s => hostname.endsWith(s))) {
      throw new SsrfError(`hostname suffix is not allowed`);
    }
  }

  return rawUrl;
}

/**
 * Safe variant — returns null instead of throwing.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    assertSafeUrl(rawUrl);
    return true;
  } catch {
    return false;
  }
}
