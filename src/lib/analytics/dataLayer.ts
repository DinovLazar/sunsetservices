/**
 * Safe `window.dataLayer.push` helper — Phase B.03 (refactored from
 * Phase 2.10's binary consent gate to a per-category signal-aware gate).
 *
 * Three guard rails before pushing:
 *   1. SSR guard (`typeof window`).
 *   2. Master kill switch (`NEXT_PUBLIC_ANALYTICS_ENABLED`).
 *   3. Per-event-category Consent Mode v2 signal gate.
 *
 * Plus a defensive PII filter: any payload key matching `PII_KEYS` is stripped
 * before the push. The dispatchers already only carry event metadata, but the
 * filter is the guard.
 *
 * Event → signal mapping:
 *   - Analytics events (every existing dispatch as of B.03 — wizard,
 *     contact, newsletter, chat, calendly funnel, consent_*) gate on
 *     `signals.analytics`.
 *   - Marketing events (none today — placeholder for Google Ads
 *     conversion pixels) gate on `signals.marketing`.
 *   - Personalization events (none today — placeholder for personalized
 *     retargeting) gate on `signals.personalization`.
 *
 * The category is selected by `getEventCategory(eventName)` below.
 * Future phases just add the event name to the right set.
 */

import {getConsent, getEffectiveSignals} from './consent';
import {ANALYTICS_EVENTS, PII_KEYS, type AnalyticsEventName} from './events';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EventCategory = 'analytics' | 'marketing' | 'personalization';

// As of Phase B.03 every existing dispatcher is an analytics event. The
// remaining two sets exist as scaffolding for future phases (Google Ads
// conversion pixels → MARKETING_EVENTS; personalized retargeting →
// PERSONALIZATION_EVENTS). When future events land, add the name to the
// correct set — no other change needed.
const MARKETING_EVENTS = new Set<string>([]);
const PERSONALIZATION_EVENTS = new Set<string>([]);

function getEventCategory(eventName: string): EventCategory {
  if (MARKETING_EVENTS.has(eventName)) return 'marketing';
  if (PERSONALIZATION_EVENTS.has(eventName)) return 'personalization';
  return 'analytics';
}

export function pushDataLayer(
  event: AnalyticsEventName | string,
  payload?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return;

  const signals = getEffectiveSignals(getConsent());
  const category = getEventCategory(event);
  if (!signals[category]) return;

  const safePayload: Record<string, unknown> = {};
  if (payload) {
    for (const [k, v] of Object.entries(payload)) {
      if (!PII_KEYS.has(k)) safePayload[k] = v;
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event, ...safePayload});
}

/**
 * Fire a Google Consent Mode v2 `consent` update on the dataLayer.
 *
 * The page-level `gtag()` wrapper (set in the root layout) handles the
 * standard `gtag('consent','update',{...})` form via `dataLayer.push(arguments)`.
 * Here we additionally push a named `consent_update` event so custom GTM
 * triggers (not just the built-in Consent Mode v2 tag template) can fire
 * off it. The B.03 smoke tests assert on this payload shape.
 *
 * Unlike `pushDataLayer`, this BYPASSES the consent gate (updating consent
 * cannot itself require consent to be granted). The kill switch still
 * applies.
 */
export function pushConsentUpdate(signals: {
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}): void {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return;

  const consentPayload = {
    analytics_storage: signals.analytics ? 'granted' : 'denied',
    ad_storage: signals.marketing ? 'granted' : 'denied',
    ad_user_data: signals.personalization ? 'granted' : 'denied',
    ad_personalization: signals.personalization ? 'granted' : 'denied',
  } as const;

  window.dataLayer = window.dataLayer || [];

  // Standard Consent Mode v2 update: emit the gtag-shape arguments row
  // so GTM's built-in Consent Mode v2 tag template (which reads the
  // arguments-style dataLayer rows) picks it up.
  window.dataLayer.push(gtagArgs('consent', 'update', consentPayload));

  // Named event row — for custom GTM triggers + the B.03 smoke tests.
  window.dataLayer.push({
    event: ANALYTICS_EVENTS.CONSENT_UPDATE,
    ...consentPayload,
  });
}

/**
 * Build the index-keyed `arguments`-shape row gtag.js bridges into
 * `dataLayer.push`. Equivalent to `function gtag(){ dataLayer.push(arguments); }`
 * without needing a runtime `gtag` global. GTM's Consent Mode v2 tag
 * template reads `{0, 1, 2, length}` from these rows.
 *
 * In JavaScript, numeric object keys are stringified, so the returned
 * object satisfies the `Record<string, unknown>` shape `window.dataLayer`
 * is declared with.
 */
function gtagArgs(...args: unknown[]): Record<string, unknown> {
  const out: Record<string, unknown> = {length: args.length};
  args.forEach((v, i) => {
    out[String(i)] = v;
  });
  return out;
}
