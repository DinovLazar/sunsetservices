/**
 * Safe `window.dataLayer.push` helper — Phase 2.10.
 *
 * Three guard rails before pushing:
 *   1. SSR guard (`typeof window`).
 *   2. Master kill switch (`NEXT_PUBLIC_ANALYTICS_ENABLED`).
 *   3. Consent gate (`getConsent() === 'accepted'`).
 *
 * Plus a defensive PII filter: any payload key matching `PII_KEYS` is stripped
 * before the push. The dispatchers already only carry event metadata, but the
 * filter is the guard. Verified by Phase 2.10 smoke test 10.
 */

import {getConsent} from './consent';
import {PII_KEYS, type AnalyticsEventName} from './events';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushDataLayer(
  event: AnalyticsEventName | string,
  payload?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return;
  if (getConsent() !== 'accepted') return;

  const safePayload: Record<string, unknown> = {};
  if (payload) {
    for (const [k, v] of Object.entries(payload)) {
      if (!PII_KEYS.has(k)) safePayload[k] = v;
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event, ...safePayload});
}
