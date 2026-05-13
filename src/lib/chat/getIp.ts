/**
 * Extract the visitor's IP address from request headers.
 *
 * Order of preference matches Vercel's edge headers:
 *   1. `x-forwarded-for` — comma-separated chain; first entry is the client
 *   2. `x-real-ip` — single address fallback
 *   3. `'unknown'` — last resort. On localhost this is what fires.
 *
 * Used by /api/chat for per-IP rate limiting. The Phase 2.09 rate limiter is
 * in-memory and SSO-protected; production sees real client IPs via
 * `x-forwarded-for` populated by Vercel's edge.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}
