'use client';

import Script from 'next/script';
import {useConsent} from '@/hooks/useConsent';

/**
 * GTMScript — Phase 2.10.
 *
 * Loads the Google Tag Manager bootstrap snippet client-side, gated on:
 *   1. `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'`
 *   2. `NEXT_PUBLIC_GTM_ID` is present
 *   3. consent state === 'accepted'
 *
 * The snippet is Google's canonical install — initializes `window.dataLayer`
 * with the `gtm.start` event and async-loads the GTM library from
 * `googletagmanager.com`. After it's loaded, GTM fires whatever tags Cowork
 * configures inside the GTM web UI in Phase 2.10 Part B.
 *
 * Renders nothing when the gates aren't all green. The `<GTMNoScript>`
 * companion (server component, in the same layout) emits the `<noscript>`
 * iframe Google requires for JS-disabled visitors.
 */
export default function GTMScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  const {state} = useConsent();

  if (!enabled || !gtmId || state !== 'accepted') return null;

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
