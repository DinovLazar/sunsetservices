/**
 * Shared session-ID primitives (Phase 2.08).
 *
 * Wizard, contact, and newsletter all need RFC 4122 v4 UUIDs to tag form
 * submissions. The wizard wraps `generateUuid()` in a localStorage-backed
 * helper at `src/lib/quote/session.ts` to persist across Steps 1–4. Contact
 * and newsletter signups are single-step and generate a fresh UUID per
 * submit (no cross-step persistence needed).
 */

export function generateUuid(): string {
  const c = typeof crypto !== 'undefined' ? crypto : null;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // RFC4122 v4 fallback (small browser footprint).
  const rnd = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(rnd);
  } else {
    for (let i = 0; i < 16; i++) rnd[i] = Math.floor(Math.random() * 256);
  }
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  const hex = Array.from(rnd, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}
