'use client';

import {useEffect} from 'react';
import {pushDataLayer} from '@/lib/analytics/dataLayer';

/**
 * AnalyticsBridge — Phase 2.10.
 *
 * Mounts once at layout level. Subscribes to every `sunset:*-event`
 * CustomEvent (wizard / contact / newsletter / chat / Calendly) and
 * forwards them to `window.dataLayer.push({event: name, ...payload})`.
 *
 * The dispatcher convention (established Phase 2.06 / 2.08 / 2.09) is to
 * call `document.dispatchEvent(new CustomEvent('sunset:<scope>-event', {
 *   detail: { name, ...payload }
 * }))`. The CustomEvents are NOT marked `bubbles: true`, so we listen on
 * `document`, not `window` — this is the off-spec correction from the
 * Phase 2.10 plan's snippet (logged in Surprises). Phase 2.06 / 2.08 /
 * 2.09 / 1.20 all dispatch on `document`; refactoring those to bubble
 * up to `window` was out of scope here.
 *
 * `pushDataLayer` itself applies the master kill-switch gate, the consent
 * gate, and the PII filter, so the bridge stays a pure relay.
 */
const EVENT_SCOPES = [
  'sunset:wizard-event',
  'sunset:contact-event',
  'sunset:newsletter-event',
  'sunset:chat-event',
  'sunset:calendly-event',
] as const;

export default function AnalyticsBridge() {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{name?: string; [k: string]: unknown}>
      ).detail;
      if (!detail || typeof detail.name !== 'string') return;
      const {name, ...rest} = detail;
      pushDataLayer(name, rest);
    };

    EVENT_SCOPES.forEach((scope) => {
      document.addEventListener(scope, handler);
    });

    return () => {
      EVENT_SCOPES.forEach((scope) => {
        document.removeEventListener(scope, handler);
      });
    };
  }, []);

  return null;
}
