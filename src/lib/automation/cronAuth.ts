import {timingSafeEqual} from 'node:crypto';

/**
 * Vercel Cron auth helper (Phase 2.16).
 *
 * Verifies the `Authorization: Bearer <secret>` header against the expected
 * secret using crypto.timingSafeEqual with a length-mismatch guard. Mirrors
 * the Phase 2.15 Telegram webhook secret-verify pattern.
 *
 * Returns true only on exact match. Missing header, missing expected value,
 * and length mismatch all return false WITHOUT calling timingSafeEqual (which
 * throws when buffers differ in length). False is the safe default; route
 * handlers respond 401 when this returns false.
 */
export function verifyCronAuth(authHeader: string | null, expectedSecret: string): boolean {
  if (!authHeader || !expectedSecret) return false;
  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) return false;
  const provided = authHeader.slice(prefix.length);

  const providedBuf = Buffer.from(provided, 'utf8');
  const expectedBuf = Buffer.from(expectedSecret, 'utf8');
  if (providedBuf.length !== expectedBuf.length) return false;
  try {
    return timingSafeEqual(providedBuf, expectedBuf);
  } catch {
    return false;
  }
}
