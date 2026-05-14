import {createHmac, timingSafeEqual} from 'node:crypto';

/**
 * Verify a ServiceM8 webhook HMAC signature (Phase 2.13).
 *
 * Algorithm assumed: HMAC-SHA256 of the raw request body keyed by the
 * shared secret, hex-encoded. This matches the most common webhook-signature
 * pattern (Stripe / GitHub / Resend all use a variant). The real ServiceM8
 * header format will be confirmed at flag-on time when Erick configures the
 * webhook in ServiceM8 and ServiceM8's docs spell out the exact format. If
 * reality differs at flag-on time, the swap is a one-function change — a
 * Phase 2.17a follow-up if needed.
 *
 * `timingSafeEqual` requires equal-length buffers — length-mismatch returns
 * `false` before the comparison runs. Any throw (malformed hex, unexpected
 * encoding) also returns `false` — this function never propagates errors
 * back to the route.
 */
export function verifyServiceM8Signature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(signatureHeader, 'hex');
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}
