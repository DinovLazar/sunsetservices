'use client';

import {useEffect, useRef} from 'react';
import Script from 'next/script';
import {useConsent} from '@/hooks/useConsent';
import {pushConsentUpdate} from '@/lib/analytics/dataLayer';

/**
 * GTMScript — Phase B.03 (refactored from Phase 2.10's consent-gated load
 * to a Consent Mode v2 always-load + signal-gated tag firing).
 *
 * Behavior change vs Phase 2.10:
 *   - GTM loads regardless of consent state. Consent Mode v2 is the gate;
 *     individual tags inside GTM check `analytics_storage`/`ad_storage`
 *     before firing. The default-denied state is set in <head> by
 *     <ConsentModeDefault>, which runs before this script.
 *   - On every consent decision change (Accept all / Reject all / Save
 *     preferences) we fire `gtag('consent','update',{...})` mapped from
 *     the four signals (DM-1: `personalization` controls BOTH
 *     `ad_user_data` AND `ad_personalization`).
 *
 * Gates that remain:
 *   - `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'` (master kill switch).
 *   - `NEXT_PUBLIC_GTM_ID` non-empty.
 *
 * The companion <GTMNoScript> server component (same layout) emits the
 * `<noscript>` iframe Google requires for JS-disabled visitors.
 */
export default function GTMScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  const {state} = useConsent();

  // Track the last-decided signals so we only fire `consent_update` when
  // the visitor actually changes their choice (not on hydration when
  // useConsent re-emits its previously-decided state).
  const lastSignalsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || state.status !== 'decided') return;
    const key = JSON.stringify(state.signals);
    if (lastSignalsRef.current === key) return;
    lastSignalsRef.current = key;
    pushConsentUpdate({
      analytics: state.signals.analytics,
      marketing: state.signals.marketing,
      personalization: state.signals.personalization,
    });
  }, [enabled, state]);

  if (!enabled || !gtmId) return null;

  return (
    <Script
      id="gtm-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `,
      }}
    />
  );
}
