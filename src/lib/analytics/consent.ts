/**
 * Consent state — Phase 2.10.
 *
 * Pure module. No React imports. Safe to import from server components
 * (every function is a no-op when `typeof window === 'undefined'`).
 *
 * Storage shape: a single localStorage key (`sunset_consent_v1`) holding
 * `'accepted' | 'declined' | null`. Phase 3.04 will replace this with
 * Google Consent Mode v2 granular signals.
 */

export type ConsentState = 'unknown' | 'accepted' | 'declined';

const STORAGE_KEY = 'sunset_consent_v1';
const EVENT_NAME = 'sunset:consent-changed';

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'declined' ? v : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function setConsent(next: 'accepted' | 'declined'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {detail: {state: next}}),
    );
  } catch {
    // localStorage might be unavailable (private mode, quota); fail silent.
  }
}

export function subscribeConsent(
  handler: (state: ConsentState) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{state: ConsentState}>).detail;
    handler(detail?.state ?? 'unknown');
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
