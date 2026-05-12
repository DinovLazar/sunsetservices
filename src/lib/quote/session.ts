/**
 * Wizard session ID — Phase 2.06; UUID helper extracted to `src/lib/sessionId`
 * in Phase 2.08 for sharing with contact + newsletter forms.
 *
 * Persistent UUID per browser stored in localStorage. Used to link partial
 * pushes (Steps 1–3 abandoner breadcrumbs) with the eventual full submit so
 * the `quoteLeadPartial` document's `converted` field can flip to `true`
 * when the matching `quoteLead` lands.
 *
 * The ID is cleared on a successful submit so the next visit starts a fresh
 * session.
 */

import {generateUuid} from '@/lib/sessionId';

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
