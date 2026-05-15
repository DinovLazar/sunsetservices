'use client';

import {useEffect} from 'react';
import Script from 'next/script';
import {useConsent} from '@/hooks/useConsent';
import {getEffectiveSignals} from '@/lib/analytics/consent';

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & {q?: unknown[]};
  }
}

/**
 * ClarityScript — Phase B.03 (refactored from Phase 2.10's binary gate
 * to a signals.analytics-aware load + per-decision consent flag).
 *
 * Behavior:
 *   - Loads the Clarity bootstrap snippet once when the analytics signal
 *     is granted. Loads stay loaded for the session (Clarity has no
 *     unload API). On Reject after Accept, we flip `clarity('consent', false)`
 *     so Clarity stops recording — the script stays on the page.
 *   - Mirrors GTMScript's pattern: consent decision changes fire
 *     `clarity('consent', signals.analytics)` whenever the value flips.
 *
 * Gates that remain:
 *   - `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'` (master kill switch).
 *   - `NEXT_PUBLIC_CLARITY_PROJECT_ID` non-empty.
 *
 * Cowork Part B can swap to a GTM-hosted Clarity tag later by deleting
 * this component's mount in the layout and adding the Clarity tag template
 * inside GTM — nothing else changes.
 */
export default function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  const {state} = useConsent();
  const signals = getEffectiveSignals(state);

  useEffect(() => {
    if (!enabled || !projectId) return;
    if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;
    window.clarity('consent', signals.analytics);
  }, [enabled, projectId, signals.analytics]);

  // Only mount the script tag once analytics has been granted, so Clarity
  // doesn't fingerprint visitors who never opt in. Once mounted it stays —
  // toggling consent later flips clarity('consent', value) via the effect.
  if (!enabled || !projectId || !signals.analytics) return null;

  return (
    <Script
      id="clarity-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${projectId}");
        `,
      }}
    />
  );
}
