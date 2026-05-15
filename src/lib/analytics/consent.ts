/**
 * Consent state — Phase B.03 (refactored from Phase 2.10 binary).
 *
 * Pure module. No React imports. Safe to import from server components
 * (every function is a no-op when `typeof window === 'undefined'`).
 *
 * Storage shape: a single localStorage key (`sunset_consent_v2`) holding
 * a JSON-serialized `ConsentState`:
 *
 *   { status: 'pending' }
 *   { status: 'decided', signals: {...}, decidedAt: '<ISO timestamp>' }
 *
 * Migration from Phase 2.10:
 *   Phase 2.10 wrote a string `'accepted' | 'declined'` to the key
 *   `sunset_consent_v1`. On first read in B.03, if v1 exists, we delete
 *   v1 and treat the state as `'pending'` so the new banner re-prompts
 *   the visitor with the granular 4-category choice (safer than mapping
 *   "accepted" → "accept all" because the v1 banner had no concept of
 *   marketing/personalization granularity).
 *
 * The `sunset:consent-changed` CustomEvent name is preserved from 2.10
 * so `useConsent` / `pushDataLayer` subscribers keep working through the
 * refactor.
 */

import type {ConsentSignals, ConsentState} from '@/types/consent';

const STORAGE_KEY = 'sunset_consent_v2';
const STORAGE_KEY_V1 = 'sunset_consent_v1';
const EVENT_NAME = 'sunset:consent-changed';

const PENDING: ConsentState = {status: 'pending'};

/**
 * One-shot v1 → v2 migration. Idempotent — once v1 is removed, this is
 * a cheap no-op on subsequent reads.
 */
function runV1Migration(): void {
  if (typeof window === 'undefined') return;
  try {
    const v1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (v1 !== null) {
      window.localStorage.removeItem(STORAGE_KEY_V1);
      // Intentionally do NOT also write v2 — leaving v2 absent makes
      // `getConsent()` return `pending`, which re-prompts the user.
    }
  } catch {
    // private mode / quota — fall through; v1 will be retried next read.
  }
}

function parseStored(raw: string | null): ConsentState | null {
  if (raw === null) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && obj.status === 'pending') return PENDING;
    if (
      obj &&
      obj.status === 'decided' &&
      obj.signals &&
      typeof obj.decidedAt === 'string' &&
      obj.signals.necessary === true &&
      typeof obj.signals.analytics === 'boolean' &&
      typeof obj.signals.marketing === 'boolean' &&
      typeof obj.signals.personalization === 'boolean'
    ) {
      return {
        status: 'decided',
        signals: obj.signals as ConsentSignals,
        decidedAt: obj.decidedAt,
      };
    }
  } catch {
    // corrupt payload — fall through to null (treated as pending).
  }
  return null;
}

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return PENDING;
  try {
    runV1Migration();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return parseStored(raw) ?? PENDING;
  } catch {
    return PENDING;
  }
}

/**
 * Persist a decided consent state. Fires the `sunset:consent-changed`
 * event synchronously so React subscribers (`useConsent`) and the
 * dataLayer gate (`pushDataLayer`) see the new state on the same tick.
 *
 * `signals.necessary` is always true regardless of input — callers
 * cannot turn off strictly necessary cookies.
 */
export function setConsent(signals: Omit<ConsentSignals, 'necessary'>): void {
  if (typeof window === 'undefined') return;
  const next: ConsentState = {
    status: 'decided',
    signals: {
      necessary: true,
      analytics: signals.analytics,
      marketing: signals.marketing,
      personalization: signals.personalization,
    },
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {detail: {state: next}}),
    );
  } catch {
    // localStorage might be unavailable (private mode, quota); fail silent.
  }
}

/**
 * Subscribe to changes. Returns an unsubscribe function. Server-safe
 * (no-op when `window` is undefined).
 */
export function subscribeConsent(
  handler: (state: ConsentState) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{state: ConsentState}>).detail;
    handler(detail?.state ?? PENDING);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

/**
 * Helper for `pushDataLayer` and tag-load gates. Returns the four
 * Consent Mode v2 signal values, where `pending` maps to all-denied
 * (the safest default while the banner is showing).
 */
export function getEffectiveSignals(state: ConsentState): ConsentSignals {
  if (state.status === 'decided') return state.signals;
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  };
}
