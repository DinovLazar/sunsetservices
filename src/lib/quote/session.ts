/**
 * Wizard session ID — Phase 2.06.
 *
 * Persistent UUID per browser stored in localStorage. Used to link partial
 * pushes (Steps 1–3 abandoner breadcrumbs) with the eventual full submit so
 * the `quoteLeadPartial` document's `converted` field can flip to `true`
 * when the matching `quoteLead` lands.
 *
 * The ID is cleared on a successful submit so the next visit starts a fresh
 * session.
 */

const KEY = 'sunset_wizard_session_id';

/** Returns the current session ID, generating + persisting a new one if missing. */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = generateUuid();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // localStorage may be blocked (private mode, etc.) — fall back to an
    // ephemeral ID. The submit still succeeds; partial-conversion linkage
    // just won't fire.
    return generateUuid();
  }
}

/** Clear the persisted session ID. Called after a successful Step-5 submit. */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

function generateUuid(): string {
  const c = typeof crypto !== 'undefined' ? crypto : null;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // RFC4122 v4 fallback (very small browser footprint).
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
