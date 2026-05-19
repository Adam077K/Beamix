/**
 * Validates an external URL is safe to fetch server-side (SSRF guard).
 *
 * Spec (Wave 1 BE implements body per this):
 * - Protocol allowlist: http:, https: only.
 * - Deny IPv4 private/loopback/link-local/zero: 10.0.0.0/8, 172.16.0.0/12,
 *   192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16 (incl. AWS metadata
 *   169.254.169.254), 0.0.0.0/8.
 * - Deny IPv6: ::1, fc00::/7, fe80::/10, ::ffff:0:0/96 (IPv4-mapped private).
 * - Deny GCP metadata host: metadata.google.internal.
 * - DNS-resolve hostname server-side BEFORE fetch; reject if any resolved IP
 *   falls in deny ranges. Re-resolve after each redirect to defeat DNS
 *   rebinding.
 * - Redirect cap = 2; re-run validateExternalUrl on each Location header.
 * - Timeout 5 seconds; response body cap 1 MB.
 */
export async function validateExternalUrl(
  input: string
): Promise<{ ok: true; url: URL } | { ok: false; reason: string }> {
  throw new Error('not yet implemented — Wave 1 backend workers')
}
